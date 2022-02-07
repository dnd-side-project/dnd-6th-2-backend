import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialDto } from '../dto/auth.dto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

  async signUp(authCredentialDto: AuthCredentialDto): Promise<User> {
    const { email, password } = authCredentialDto;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      const user = new this.userModel({
        email,
        password: hashedPW,
      });
      await user.save();
      user.password = undefined;

      // FIX: 특정 정보만 리턴
      return user;
    } catch (e) {
      // FIX: 에러 케이스 추가
      throw new InternalServerErrorException();
    }
  }

  async validate(payload): Promise<User> {
    // FIX: 닉네임 등 유저 정보 추가
    const { email } = payload;
    const user = await this.findUserByEmail(email);

    // FIX: 특정 정보만 return
    return user;
  }

  async logIn(
    authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialDto;
    const user = await this.findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);
      // FIX: refreshToken 추가

      // FIX: user return & token cookie에 저장
      return { accessToken };
    } else {
      throw new UnauthorizedException('로그인 실패');
    }
  }
}
