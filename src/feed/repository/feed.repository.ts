import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment, CommentDocument } from '../schemas/comment.schema';

export class FeedRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentDocument>,
  ) {}

  async findAllFeed(): Promise<Article[]> {
    return await this.ArticleModel.find({ public: true });
  }

  async findOneFeed(id): Promise<any[]> {
    const result:any[] = [];
    const article = await this.ArticleModel.findOne({ _id: id, public: true });
    const comment = await this.CommentModel.find({article:id})
    result.push(article,comment)
    return result;
  }


  async deleteArticle(id): Promise<any> {
    return await this.ArticleModel.findByIdAndRemove(id);
  }

  async saveComment(articleId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    createCommentDto.article = articleId;
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        commentNum : 1
      }
    });
    const Comment = new this.CommentModel(createCommentDto);
    return Comment.save();
  }
}
