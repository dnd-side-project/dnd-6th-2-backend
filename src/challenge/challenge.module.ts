import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyWord, KeyWordSchema } from './schemas/keyword.schema';
import { Article, ArticleSchema } from './schemas/article.schema';
import { ChallengeRepository } from './repository/challenge.repository';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Tip, TipSchema } from './schemas/tip.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Relay, RelaySchema } from 'src/relay/schemas/relay.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: KeyWord.name, schema: KeyWordSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Tip.name, schema: TipSchema }]),
    AuthModule,
    MongooseModule.forFeature([{ name: Relay.name, schema: RelaySchema }]),
  ],
  providers: [ChallengeService, ChallengeRepository],
  controllers: [ChallengeController],
  exports: [ChallengeService],
})
export class ChallengeModule {}
