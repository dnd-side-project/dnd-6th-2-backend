import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialDto } from '../dto/auth.dto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordDto } from '../dto/change-password.dto';
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

    return await this.userModel.findOneAndUpdate(
      { email },
      { hashedRefreshToken },
    );
  }

  async removeRefreshToken(email: string) {
    // for logout
    return await this.userModel.findOneAndUpdate(
      { email },
      { hashedRefreshToken: null },
    );
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
      throw new ForbiddenException('로그인 실패');
    }
  }

  // 비밀번호 재설정
  async changePassword(email: string, passwordDto: PasswordDto): Promise<User> {
    const { password } = passwordDto;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      const user = await this.userModel.findOneAndUpdate(
        { email },
        { password: hashedPW },
      );
      user.password = undefined;

      return user;
    } catch (e) {
      // FIX: 에러 케이스 추가
      throw new InternalServerErrorException('비밀번호 재설정 실패');
    }
  }
}
