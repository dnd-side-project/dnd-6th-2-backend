import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Like, LikeSchema } from 'src/feed/schemas/like.schema';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';
import { RelayRepository } from './repository/relay.repository';
import { Relay, RelaySchema } from './schemas/relay.schema';
import {
  RelayedArticle,
  RelayedArticleSchema,
} from './schemas/relayed-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Relay.name, schema: RelaySchema }]),
    MongooseModule.forFeature([
      { name: RelayedArticle.name, schema: RelayedArticleSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    AuthModule,
  ],
  controllers: [RelayController],
  providers: [RelayService, RelayRepository],
})
export class RelayModule {}
