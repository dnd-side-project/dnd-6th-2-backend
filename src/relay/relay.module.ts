import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Like, LikeSchema } from 'src/feed/schemas/like.schema';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';
import { RelayArticleRepository } from './repository/relay-article.repository';
import { RelayRepository } from './repository/relay.repository';
import { Notice, NoticeSchema } from './schemas/notice.schema';
import { Relay, RelaySchema } from './schemas/relay.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Relay.name, schema: RelaySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }]),
    AuthModule,
  ],
  controllers: [RelayController],
  providers: [RelayService, RelayRepository, RelayArticleRepository],
})
export class RelayModule {}
