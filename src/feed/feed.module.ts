import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepository } from './repository/feed.repository';
import { KeyWord, KeyWordSchema } from 'src/challenge/schemas/keyword.schema';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Scrap, ScrapSchema } from './schemas/scrap.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Like, LikeSchema } from './schemas/like.schema';
import { History, HistorySchema } from './schemas/history.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ChallengeModule } from 'src/challenge/challenge.module';
import { Category, CategorySchema } from 'src/auth/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: KeyWord.name, schema: KeyWordSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Scrap.name, schema: ScrapSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
    ChallengeModule,
  ],
  providers: [FeedService, FeedRepository],
  controllers: [FeedController],
})
export class FeedModule {}
