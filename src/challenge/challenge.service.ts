import { Injectable } from '@nestjs/common';
import { KeyWordRepository } from './repository/keyword.repository';
import { KeyWord } from './schemas/keyword.schema';

@Injectable()
export class ChallengeService {
  constructor(private readonly keyWordRepository: KeyWordRepository) {}

  async addKeyWord(createKeyWordDto): Promise<KeyWord> {
    return this.keyWordRepository.saveKeyWord(createKeyWordDto);
  }

  async getKeyWord(): Promise<KeyWord[]> {
    return this.keyWordRepository.findKeyWord();
  }

  async getRandom() {
    return await this.keyWordRepository.findRandomKeyWord();
  }
}
