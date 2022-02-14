import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/schemas/user.schema';
import { CreateRelayDto } from './dto/create-relay.dto';
import { RelayRepository } from './repository/relay.repository';
import { Relay } from './schemas/relay.schema';

@Injectable()
export class RelayService {
  constructor(private readonly relayRepository: RelayRepository) {}

  async createRelay(
    createRelayDto: CreateRelayDto,
    user: User,
  ): Promise<Relay> {
    return await this.relayRepository.createRelay(createRelayDto, user);
  }

  async deleteRelay(relayId: string, user: User) {
    return await this.relayRepository.deleteRelay(relayId, user);
  }
}
