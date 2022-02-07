import { Injectable } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth.dto';
import { AuthRepository } from './repository/auth.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<User> {
    return this.authRepository.signUp(authCredentialDto);
  }
}
