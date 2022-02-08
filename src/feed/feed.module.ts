import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { KeyWord, KeyWordSchema } from 'src/challenge/schemas/keyword.schema';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Scrap, ScrapSchema } from './schemas/scrap.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedRepository } from './repository/feed.repository';
// import { Like, LikeSchema } from './schemas/like.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: KeyWord.name, schema: KeyWordSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Scrap.name, schema: ScrapSchema }]),
    // MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  providers: [FeedService, FeedRepository],
  controllers: [FeedController],
})
export class FeedModule {}
