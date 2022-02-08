import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ScrapDto } from '../dto/scrap.dto';
// import { LikeDto } from '../dto/like.dto';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Scrap, ScrapDocument } from '../schemas/scrap.schema';
// import { Like, LikeDocument } from '../schemas/like.schema';

export class FeedRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentDocument>,
    @InjectModel(Scrap.name)
    private ScrapModel: Model<ScrapDocument>, // @InjectModel(Like.name) // private LikeModel: Model<LikeDocument>
  ) {}

  async findAllArticle(): Promise<Article[]> {
    return await this.ArticleModel.find({ public: true });
  }

  async searchArticle(option: string, content: string): Promise<Article[]> {
    let options = [];
    if (option == 'title') {
      options = [{ title: new RegExp(content) }];
    } else if (option == 'content') {
      options = [{ content: new RegExp(content) }];
    } else if (option == 'title+content') {
      options = [
        { title: new RegExp(content) },
        { content: new RegExp(content) },
      ];
    }
    return this.ArticleModel.find({ $or: options });
  }

  async findOneArticle(id): Promise<any[]> {
    const result: any[] = [];
    const article = await this.ArticleModel.findOne({ _id: id, public: true });
    const comment = await this.CommentModel.find({ article: id });
    result.push(article, comment);
    return result;
  }

  async deleteArticle(id): Promise<any> {
    await this.CommentModel.deleteMany({ article: id });
    return await this.ArticleModel.findByIdAndDelete(id);
  }

  async updateArticle(
    articleId: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return await this.ArticleModel.findByIdAndUpdate(
      articleId,
      updateArticleDto,
      { new: true },
    );
  }

  async saveComment(
    articleId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    createCommentDto.article = articleId;
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        commentNum: 1,
      },
    });
    const Comment = new this.CommentModel(createCommentDto);
    return Comment.save();
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.CommentModel.findByIdAndUpdate(
      commentId,
      updateCommentDto,
      { new: true },
    );
  }

  async deleteComment(commentId: string): Promise<any> {
    const comment = await this.CommentModel.findById(commentId);
    await this.ArticleModel.findByIdAndUpdate(comment.article, {
      $inc: {
        commentNum: -1,
      },
    });
    return await this.CommentModel.findByIdAndDelete(commentId);
  }

  async saveScrap(articleId: string, scrapDto: ScrapDto): Promise<Scrap> {
    scrapDto.article = articleId;
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: 1,
      },
    });
    const scrap = new this.ScrapModel(scrapDto);
    return scrap.save();
  }

  async deleteScrap(articleId): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: -1,
      },
    });
    return await this.ScrapModel.findOneAndDelete({ article: articleId });
  }

  async saveLike(articleId: string): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        likeNum: 1,
      },
    });
  }

  async deleteLike(articleId): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        likeNum: -1,
      },
    });
  }
}
