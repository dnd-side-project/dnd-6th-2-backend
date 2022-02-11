import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ScrapDto } from '../dto/scrap.dto';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Scrap, ScrapDocument } from '../schemas/scrap.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { Like, LikeDocument } from '../schemas/like.schema';

export class FeedRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentDocument>,
    @InjectModel(Scrap.name)
    private ScrapModel: Model<ScrapDocument>,
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
    @InjectModel(Like.name)
    private LikeModel: Model<LikeDocument>,
  ) {}

  async mainFeed(page: number): Promise<Article[]> {
    //공개 설정된 모든글
    //업데이트순 정렬
    return await this.ArticleModel.find({ public: true })
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      // .populate('user','nickname')
      .populate('user')
      .exec();
  }

  async subFeed(user, page: number): Promise<any[]> {
    const loginUser: User = await this.UserModel.findById(user._id)
    const result: any[] = [];
    //구독한 유저들의 공개된 글들
    //업데이트순 정렬
    const articles: Article[] = await this.ArticleModel.find({
      user: loginUser.subscribeUser,
      public: true,
    })
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate('user')
      // .populate('user','nickname')
      .exec();
    //내가 구독한 유저들
    const subUserList: User[] = await this.UserModel.find({
      _id: loginUser.subscribeUser,
    });
    result.push(articles, subUserList);
    return result;
  }

  async findSubUser(user, subUserId): Promise<any[]> {
    // const article = await this.ArticleModel.findById(articleId);
    // const author = await this.UserModel.findById(article.user);
    const check = await this.UserModel.find({
      _id: user._id,
      // subscribeUser: author._id,
      subscribeUser: subUserId
    });
    return check;
  }

  async findAllSubUser(user): Promise<User[]> {
    const loginUser = await this.UserModel.findById(user._id);
    return await this.UserModel.find({ _id: loginUser.subscribeUser });
  }

  async subUser(user, subUserId): Promise<any> {
    return await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        subscribeUser: subUserId
      },
    });
  }

  async updateSubUser(user, subUserId): Promise<any>{
    return await this.UserModel.findByIdAndUpdate(user._id,{
      $pull: {
        subscribeUser: subUserId
      }
    })
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
    return this.ArticleModel.find({ $or: options, public: true })
    .sort({_id: -1,})
    .populate('user')
    .exec();
  }

  async findOneArticle(id): Promise<Article> {
    return await this.ArticleModel.findOne({ _id: id, public: true })
      .populate('user')
      .populate('comments')
      .exec();
  }

  async deleteArticle(user, id): Promise<any> {
    await this.CommentModel.deleteMany({ article: id });
    await this.UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        articles: id,
      },
      $inc: {
        challenge: -1
      }
    });
    const article = await this.UserModel.findById(user._id)
    if(article.articles.length == 0){
      await this.UserModel.findByIdAndUpdate(user._id, {
        $set:{
          state: false
        },
        $inc:{
          stampCount: -1
        }
      })
    }
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

  async findComment(commentId): Promise<Comment> {
    return await this.CommentModel.findById(commentId);
  }

  async saveComment(
    user,
    articleId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    createCommentDto.user = user._id;
    createCommentDto.article = articleId;
    const comment = new this.CommentModel(createCommentDto);
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        commentNum: 1,
      },
      $push: {
        comments: comment
      }
    });
    return comment.save();
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

  async deleteComment(commentId): Promise<any> {
    const comment = await this.CommentModel.findById(commentId);
    await this.ArticleModel.findByIdAndUpdate(comment.article, {
      $inc: {
        commentNum: -1,
      },
      $pull: {
        comments: commentId
      }
    });
    return await this.CommentModel.findByIdAndDelete(commentId);
  }

  async findScrap(user, articleId: string): Promise<Scrap[]> {
    return await this.ScrapModel.find({ user: user._id, article: articleId });
  }

  async saveScrap(user, articleId: string, scrapDto: ScrapDto): Promise<Scrap> {
    scrapDto.user = user._id;
    scrapDto.article = articleId;
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: 1,
      },
    });
    const scrap = new this.ScrapModel(scrapDto);
    return scrap.save();
  }

  async deleteScrap(user, articleId): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: -1,
      },
    });
    return await this.ScrapModel.findOneAndDelete({
      article: articleId,
      user: user._id,
    });
  }

  async findLike(user, articleId: string): Promise<Like[]> {
    return await this.LikeModel.find({ user: user._id, article: articleId });
  }

  async saveLike(user, articleId: string, scrapDto: ScrapDto): Promise<any> {
    scrapDto.user = user._id;
    scrapDto.article = articleId;
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        likeNum: 1,
      },
    });
    const like = new this.LikeModel(scrapDto);
    return like.save();
  }

  async deleteLike(user, articleId): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        likeNum: -1,
      },
    });
    return await this.LikeModel.findOneAndDelete({
      article: articleId,
      user: user._id,
    });
  }
}
