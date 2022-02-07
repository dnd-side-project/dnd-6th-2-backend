import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialDto } from '../dto/auth.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { InternalServerErrorException } from '@nestjs/common';

export class AuthRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<User> {
    const { email, password } = authCredentialDto;

    try {
      const salt = await bcrypt.genSalt();
      const hashedPW = await bcrypt.hash(password, salt);

      const user = new this.userModel({
        email,
        password: hashedPW,
      });
      return user.save();
    } catch (e) {
      // FIX: 에러 케이스 추가
      throw new InternalServerErrorException();
    }
  }
}
