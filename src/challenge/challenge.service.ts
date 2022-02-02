import { Injectable } from '@nestjs/common';
import { KeyWordRepository } from './repository/keyword.repository';
import { KeyWord } from './schemas/keyword.schema';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly keyWordRepository: KeyWordRepository,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async addKeyWord(createKeyWordDto): Promise<KeyWord> {
    return this.keyWordRepository.saveKeyWord(createKeyWordDto);
  }

  async getKeyWord(): Promise<KeyWord[]> {
    return this.keyWordRepository.findKeyWord();
  }

  //cron으로 매일 자정에 DB 업데이트 해서 오늘의 키워드 뽑고 findRandomKeyWord에서는 키워드 리턴만
  // @Cron('0 0 0 * * *', { name: 'updatekeyword' })
  @Cron('30 * * * * *', { name: 'updatekeyword' })
  async updateKeyWord(): Promise<KeyWord[]> {
    const job = this.schedulerRegistry.getCronJob('updatekeyword');
    job.stop();
    return this.keyWordRepository.updateKeyWord();
  }

  async getRandom() {
    return await this.keyWordRepository.findRandomKeyWord();
  }
}
