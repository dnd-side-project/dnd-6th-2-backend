import { Injectable, Inject, Logger } from '@nestjs/common';
import { KeyWord } from './schemas/keyword.schema';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { ChallengeRepository } from './repository/challenge.repository';
import { Article } from './schemas/article.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly challengeRepository: ChallengeRepository,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async addKeyWord(createKeyWordDto): Promise<KeyWord> {
    return this.challengeRepository.saveKeyWord(createKeyWordDto);
  }

  async getKeyWord(): Promise<any[]> {
    return this.challengeRepository.findKeyWord();
  }

  async findTip(): Promise<any> {
    return this.challengeRepository.findTip();
  }

  async addArticle(user, createArticleDto): Promise<Article> {
    return this.challengeRepository.saveArticle(user, createArticleDto);
  }

  async tempArticle(user, createArticleDto): Promise<Article> {
    return this.challengeRepository.temporarySaveArticle(
      user,
      createArticleDto,
    );
  }

  // async getAllArticle(): Promise<Article[]> {
  //   return this.challengeRepository.findAllArticle();
  // }

  // async getOneArticle(id): Promise<Article> {
  //   return this.challengeRepository.findOneArticle(id);
  // }

  // async deleteArticle(id): Promise<any> {
  //   return this.challengeRepository.deleteArticle(id);
  // }

  //cron으로 매일 자정에 DB 업데이트 해서 오늘의 키워드 뽑고 findRandomKeyWord에서는 키워드 리턴만
  // @Cron('30 * * * * *', { name: 'updatekeyword' })
  @Cron('0 0 0 * * *', { name: 'updatekeyword', timeZone: 'Asia/Seoul' })
  async updateKeyWord(): Promise<KeyWord[]> {
    this.schedulerRegistry.getCronJob('updatekeyword');
    // job.stop();
    this.logger.log('키워드 뽑기 실행');
    return this.challengeRepository.updateKeyWord();
  }

  @Cron('0 0 0 * * *', { name: 'resetChallenge', timeZone: 'Asia/Seoul' })
  async resetChallenge(): Promise<any> {
    this.schedulerRegistry.getCronJob('resetChallenge');
    this.logger.log('챌린지 리셋');
    return this.challengeRepository.resetChallenge();
  }

  async getRandom(user) {
    return await this.challengeRepository.findRandomKeyWord(user);
  }
}
