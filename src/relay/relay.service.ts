import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/schemas/user.schema';
import { CreateRelayDto } from './dto/create-relay.dto';
import { UpdateRelayDto } from './dto/update-relay.dto';
import { RelayArticleRepository } from './repository/relay-article.repository';
import { RelayRepository } from './repository/relay.repository';
import { Relay } from './schemas/relay.schema';

@Injectable()
export class RelayService {
  constructor(
    private readonly relayRepository: RelayRepository,
    private readonly relayArticleRepository: RelayArticleRepository,
  ) {}

  async getAllRelay(tags: string[] | null, user: User) {
    return await this.relayRepository.getAllRelay(tags, user);
  }

  async getJoinedRelay(user: User) {
    return await this.relayRepository.getJoinedRelay(user);
  }

  async createRelay(
    createRelayDto: CreateRelayDto,
    user: User,
  ): Promise<Relay> {
    return await this.relayRepository.createRelay(createRelayDto, user);
  }

  async updateRelay(
    relayId: string,
    updateRelayDto: UpdateRelayDto,
    user: User,
  ) {
    return await this.relayRepository.updateRelay(
      relayId,
      updateRelayDto,
      user,
    );
  }

  async deleteRelay(relayId: string, user: User) {
    return await this.relayRepository.deleteRelay(relayId, user);
  }

  async AddNoticeToRelay(relayId: string, notice: string, user: User) {
    return await this.relayRepository.AddNoticeToRelay(relayId, notice, user);
  }

  async updateNoticeToRelay(param, notice: string, user: User) {
    return await this.relayRepository.updateNoticeToRelay(param, notice, user);
  }

  async deleteNoticeToRelay(param, user: User) {
    return await this.relayRepository.deleteNoticeToRelay(param, user);
  }

  async joinRelay(relayId: string, user: User) {
    return await this.relayRepository.joinRelay(relayId, user);
  }

  async exitRelay(relayId: string, user: User) {
    return await this.relayRepository.exitRelay(relayId, user);
  }

  async createRelayArticle(relayId: string, content: string, user: User) {
    return await this.relayArticleRepository.createRelayArticle(
      relayId,
      content,
      user,
    );
  }

  async updateRelayArticle(param, content: string, user: User) {
    return await this.relayArticleRepository.updateRelayArticle(
      param,
      content,
      user,
    );
  }

  async deleteRelayArticle(param, user: User) {
    return await this.relayArticleRepository.deleteRelayArticle(param, user);
  }
}
