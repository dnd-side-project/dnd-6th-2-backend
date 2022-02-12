import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialDto } from '../dto/auth.dto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCodeDto, PasswordDto } from '../dto/change-password.dto';
import { SignUpDto } from '../dto/signup.dto';

export class AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException();
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
      throw new NotFoundException();
    }
  }

  async removeRefreshToken(email: string) {
    // for logout
    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { hashedRefreshToken: null },
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async validateRefresh(email: string, refreshToken: string): Promise<User> {
    const user = await this.findUserByEmail(email);

    if (await bcrypt.compare(refreshToken, user.hashedRefreshToken)) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { email, password, nickname, genre, bio } = signUpDto;

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
      throw new UnauthorizedException('로그인 실패');
    }
  }

  async storeAuthCode(email: string, authCode: number) {
    try {
      return await this.userModel.findOneAndUpdate(
        { email },
        { mailAuthCode: authCode },
      );
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async removeAuthCode(email: string) {
    return await this.userModel.updateOne({ email }, { mailAuthCode: null });
  }

  async verifyAuthCode(authCodeDto: AuthCodeDto) {
    const { email, authCode } = authCodeDto;
    const user = await this.findUserByEmail(email);

    if (user.mailAuthCode === authCode) {
      await this.removeAuthCode(email);
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }

  async changePassword(passwordDto: PasswordDto): Promise<User> {
    const { email, password } = passwordDto;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      const user = await this.userModel.findOneAndUpdate(
        { email },
        { password: hashedPW },
      );
      user.password = undefined;

      return user; // test
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
