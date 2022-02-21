import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialDto } from '../dto/auth.dto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCodeDto } from '../dto/change-password.dto';
import { SignUpDto } from '../dto/signup.dto';

export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('가입되어 있지 않은 메일입니다.');
    }

    return user;
  }

  async getAccessToken(email: string) {
    const accessToken = this.jwtService.sign({ email }, { expiresIn: '3h' });

    return accessToken;
  }

  async getRefreshToken(email: string) {
    const refreshToken = this.jwtService.sign({ email }, { expiresIn: '14d' });

    return refreshToken;
  }

  async updateRefreshToken(email: string, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { hashedRefreshToken },
      );
    } catch (e) {
      throw new NotFoundException('가입되어 있지 않은 메일입니다.');
    }
  }

  async removeRefreshToken(email: string) {
    // for logout
    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { $unset: { hashedRefreshToken: 1 } },
      );
    } catch (e) {
      throw new NotFoundException('가입되어 있지 않은 메일입니다.');
    }
  }

  // async validateUser(email: string) {
  //   const user = await this.userModel.findOne(
  //     { email },
  //     { _id: 1, email: 1, nickname: 1, genre: 1, bio: 1 },
  //   );

  //   if (!user) {
  //     throw new NotFoundException();
  //   }
  //   return user;
  // }

  async validateRefresh(email: string, refreshToken: string) {
    const user = await this.findUserByEmail(email);

    if (await bcrypt.compare(refreshToken, user.hashedRefreshToken)) {
      return user;
    } else {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
  }

  async checkEmail(email: string) {
    const check = await this.userModel.exists({ email });
    if (check) {
      throw new BadRequestException('이미 가입되어 있는 메일입니다.');
    }
  }

  async checkNickname(nickname: string) {
    const check = await this.userModel.exists({ nickname });
    if (check) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
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
    user.password = undefined;

    return user;
  }

  async logIn(authCredentialDto: AuthCredentialDto) {
    const { email, password } = authCredentialDto;
    const user = await this.findUserByEmail(email);

    if (await bcrypt.compare(password, user.password)) {
      const accessToken = await this.getAccessToken(email);
      const refreshToken = await this.getRefreshToken(email);

      await this.updateRefreshToken(email, refreshToken);

      return { accessToken, refreshToken };
    } else {
      throw new UnauthorizedException('로그인에 실패했습니다.');
    }
  }

  async storeAuthCode(email: string, authCode: number) {
    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { mailAuthCode: authCode },
      );
    } catch (e) {
      throw new NotFoundException('가입되어 있지 않은 메일입니다.');
    }
  }

  async removeAuthCode(email: string) {
    return await this.userModel.updateOne(
      { email },
      { $unset: { mailAuthCode: 1 } },
    );
  }

  async verifyAuthCode(authCodeDto: AuthCodeDto) {
    const { email, authCode } = authCodeDto;
    const user = await this.findUserByEmail(email);

    if (user.mailAuthCode === authCode) {
      await this.removeAuthCode(email);
      return true;
    } else {
      throw new UnauthorizedException(
        '인증에 실패했습니다. 다시 시도해주세요.',
      );
    }
  }

  async changePassword(authCredentialDto: AuthCredentialDto): Promise<User> {
    const { email, password } = authCredentialDto;
    const found = await this.findUserByEmail(email);

    await this.checkEmail(email);
    if (await bcrypt.compare(password, found.password)) {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      const user = await this.userModel.findOneAndUpdate(
        { email },
        { password: hashedPW },
      );
      user.password = undefined;

      return user; // test
    } else {
      throw new BadRequestException('기존 비밀번호와 동일한 비밀번호입니다.');
    }
  }
}
