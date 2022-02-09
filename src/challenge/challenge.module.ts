import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyWord, KeyWordSchema } from './schemas/keyword.schema';
import { Article, ArticleSchema } from './schemas/article.schema';
import { ChallengeRepository } from './repository/challenge.repository';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: KeyWord.name, schema: KeyWordSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  providers: [ChallengeService, ChallengeRepository],
  controllers: [ChallengeController],
})
export class ChallengeModule {}
