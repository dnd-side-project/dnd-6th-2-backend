import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/login.dto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCodeDto } from '../dto/change-password.dto';
import { SignUpDto } from '../dto/signup.dto';
import { BlackList, BlackListDocument } from '../schemas/blacklist.schema';

export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BlackList.name)
    private blackListModel: Model<BlackListDocument>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('가입되어 있지 않은 메일입니다.');
    }
    return user;
  }

  async findUserObjectByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new UnauthorizedException('가입되어 있지 않은 메일입니다.');
    }
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserObjectByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, refreshToken, mailAuthCode, ...result } = user;
      return result;
    }
    return null;
  }

  async validateAccess(email: string) {
    const user = await this.findUserObjectByEmail(email);
    if (user) {
      const { password, refreshToken, mailAuthCode, ...result } = user;
      return result;
    }
    return null;
  }

  async validateRefresh(email: string) {
    const { refreshToken } = await this.userModel
      .findOne({ email })
      .select('refreshToken');

    if (await this.blackListModel.exists({ refreshToken })) {
      await this.userModel.findOneAndUpdate(
        { email },
        { $set: { refreshToken: null } },
      );
      return null;
    } else {
      const user = await this.findUserObjectByEmail(email);
      if (
        user &&
        user.refreshToken &&
        (await bcrypt.compare(refreshToken, user.refreshToken))
      ) {
        const { password, refreshToken, mailAuthCode, ...result } = user;
        return result;
      } else {
        const blacklist = new this.blackListModel({
          refreshToken,
          user: user._id,
        });
        await blacklist.save();
        await this.userModel.findOneAndUpdate(
          { email },
          { $set: { refreshToken: null } },
        );
        return null;
      }
    }
  }

  async checkEmail(email: string) {
    if (await this.userModel.exists({ email })) {
      throw new BadRequestException('이미 가입되어 있는 메일입니다.');
    }
  }

  async checkNickname(nickname: string) {
    if (await this.userModel.exists({ nickname })) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, nickname, genre, bio } = signUpDto;

    await this.checkEmail(email);
    await this.checkNickname(nickname);
    const salt = await bcrypt.genSalt();
    const hashedPW = await bcrypt.hash(password, salt);

    const user = new this.userModel({
      email,
      password: hashedPW,
      nickname,
      genre,
      bio,
    });
    await user.save();
    return user.email;
  }

  async getAccessToken(email: string) {
    const accessToken = this.jwtService.sign({ email }, { expiresIn: '3h' });

    return accessToken;
  }

  async getRefreshToken(email: string) {
    const refreshToken = this.jwtService.sign({ email }, { expiresIn: '30d' });

    return refreshToken;
  }

  async storeRefreshToken(email: string, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { $set: { refreshToken: hashedRefreshToken } },
      );
    } catch (e) {
      throw new NotFoundException('가입되어 있지 않은 메일입니다.');
    }
  }

  async logIn(user: User) {
    const accessToken = await this.getAccessToken(user.email);
    const refreshToken = await this.getRefreshToken(user.email);
    await this.storeRefreshToken(user.email, refreshToken);

    return { accessToken, refreshToken };
  }

  async storeAuthCode(email: string, authCode: number) {
    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { $set: { mailAuthCode: authCode } },
      );
    } catch (e) {
      throw new NotFoundException('가입되어 있지 않은 메일입니다.');
    }
  }

  async removeAuthCode(email: string) {
    return await this.userModel.findOneAndUpdate(
      { email },
      { $set: { mailAuthCode: null } },
    );
  }

  async verifyAuthCode(authCodeDto: AuthCodeDto) {
    const { email, authCode } = authCodeDto;
    const user = await this.findUserByEmail(email);

    await this.removeAuthCode(email);
    if (user.mailAuthCode === authCode) {
      return { verifyCode: true };
    } else {
      return { verifyCode: false };
    }
  }

  async changePassword(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const found = await this.findUserByEmail(email);

    await this.checkEmail(email);
    if (await bcrypt.compare(password, found.password)) {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      return await this.userModel.findOneAndUpdate(
        { email },
        { $set: { password: hashedPW } },
      );
    } else {
      throw new BadRequestException('기존 비밀번호와 동일한 비밀번호입니다.');
    }
  }

  async logOut(email: string) {
    // get refresh token
    const { _id, refreshToken } = await this.userModel
      .findOne({ email })
      .select('_id refreshToken');

    if (!(await this.blackListModel.exists({ refreshToken }))) {
      const blacklist = new this.blackListModel({
        refreshToken,
        user: _id,
      });
      await blacklist.save();
    }
    return await this.userModel.findByIdAndUpdate(_id, {
      $set: { refreshToken: null },
    });
  }
}
