import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/schemas/user.schema';
import { CreateRelayDto } from './dto/create-relay.dto';
import { UpdateRelayDto } from './dto/update-relay.dto';
import { RelayArticleRepository } from './repository/relay-article.repository';
import { RelayRepository } from './repository/relay.repository';
import { Relay } from './schemas/relay.schema';

export enum OrderBy {
  LATEST = '최신순',
  POPULAR = '인기순',
}

@Injectable()
export class RelayService {
  constructor(
    private readonly relayRepository: RelayRepository,
    private readonly relayArticleRepository: RelayArticleRepository,
  ) {}

  async getAllRelay(query, user: User) {
    return await this.relayRepository.getAllRelay(query, user);
  }

  async getJoinedRelay(cursor, user: User) {
    return await this.relayRepository.getJoinedRelay(cursor, user);
  }

  async getMyRelay(cursor, user: User) {
    return await this.relayRepository.getMyRelay(cursor, user);
  }

  async findRelayById(relayId: string) {
    return await this.relayRepository.findRelayById(relayId);
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

  async getRelayArticle(relayId: string, cursor: string) {
    return await this.relayArticleRepository.getRelayArticle(relayId, cursor);
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

  async createRelayLike(param, user: User) {
    return await this.relayArticleRepository.createRelayLike(param, user);
  }

  async deleteRelayLike(param, user: User) {
    return await this.relayArticleRepository.deleteRelayLike(param, user);
  }
}
