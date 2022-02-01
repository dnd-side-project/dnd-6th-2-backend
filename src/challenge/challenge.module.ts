import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyWord, KeyWordSchema } from './schemas/keyword.schema';
import { Article, ArticleSchema } from './schemas/Article.schema';
import { KeyWordRepository } from './repository/keyword.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: KeyWord.name, schema: KeyWordSchema }]),
  ],
  providers: [ChallengeService, KeyWordRepository],
  controllers: [ChallengeController],
})
export class ChallengeModule {}
