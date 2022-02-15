import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Comment, CommentDocument } from 'src/feed/schemas/comment.schema';
import { Scrap, ScrapDocument } from 'src/feed/schemas/scrap.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { Like, LikeDocument } from 'src/feed/schemas/like.schema';
import { KeyWord, KeyWordDocument } from 'src/challenge/schemas/keyword.schema';
import { Model } from 'mongoose';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { CreateArticleDto } from 'src/challenge/dto/create-article.dto';

export class MyArticleRepository {
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
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
  ) {}

  async findMyArticle(user, last): Promise<Article[]> {
    if (last == null) {
      const lastArticle = await this.ArticleModel.find({
        user: user._id,
        state: true,
      })
        .sort({ _id: -1 })
        .limit(1);
      last = lastArticle[0]._id;
      const articles = await this.ArticleModel.find({
        user: user._id,
        state: true,
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(3);
      return articles;
    } else {
      const articles = await this.ArticleModel.find({
        user: user._id,
        state: true,
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(3);
      return articles;
    }
  }

  async findMyArticleNext(user, last): Promise<any> {
    const next = await this.ArticleModel.find({
      state: true,
      user: user._id,
      _id: { $lt: last },
    })
      .sort({ _id: -1 })
      .limit(1);
    if (next.length == 0) {
      return null;
    } else {
      return next[0]._id;
    }
  }

  async saveMyArticle(
    user,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    createArticleDto.user = user._id;
    createArticleDto.keyWord = null;
    createArticleDto.state = false;
    const article = await new this.ArticleModel(createArticleDto);
    await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        articles: article,
      },
    });
    return article.save();
  }

  async saveMyArticleTemp(
    user,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    createArticleDto.user = user._id;
    createArticleDto.keyWord = null;
    createArticleDto.state = false;
    const article = await new this.ArticleModel(createArticleDto);
    await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        temporary: article,
      },
    });
    return article.save();
  }

  async findMyArticleTemp(user, last): Promise<Article[]> {
    if (last == null) {
      const lastArticle = await this.ArticleModel.find({
        user: user._id,
        state: false,
        public: false,
      })
        .sort({ _id: -1 })
        .limit(1);
      last = lastArticle[0]._id;
      const articles = await this.ArticleModel.find({
        user: user._id,
        state: false,
        public: false,
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(3);
      return articles;
    } else {
      const articles = await this.ArticleModel.find({
        user: user._id,
        state: false,
        public: false,
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(3);
      return articles;
    }
  }

  async findTempArticleNext(user, last): Promise<any> {
    const next = await this.ArticleModel.find({
      state: false,
      public: false,
      user: user._id,
      _id: { $lt: last },
    })
      .sort({ _id: -1 })
      .limit(1);
    if (next.length == 0) {
      return null;
    } else {
      return next[0]._id;
    }
  }

  async findMyArticleOne(articleId): Promise<Article> {
    const article = await this.ArticleModel.findOne({ _id: articleId })
      .populate('user')
      .populate('comments')
      .exec();
    return article;
  }

  async updateMyArticle(
    articleId,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return await this.ArticleModel.findByIdAndUpdate(
      articleId,
      updateArticleDto,
      { new: true },
    );
  }

  async deleteMyArticle(user, articleId): Promise<any> {
    await this.CommentModel.deleteMany({ article: articleId });
    await this.UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        articles: articleId,
      },
      $inc: {
        challenge: -1,
      },
    });
    const article = await this.ArticleModel.findById(articleId);
    const keyWord = await this.KeyWordModel.findOne({
      updateDay: article.createdAt.toDateString(),
    });
    const challenge = await this.ArticleModel.find({
      user: user._id,
      keyWord: keyWord.content,
    });
    //마지막 챌린지 글을 삭제할 때
    if (challenge.length == 1) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $set: {
          state: false,
        },
        $inc: {
          stampCount: -1,
        },
      });
    }
    return await this.ArticleModel.findByIdAndDelete(articleId);
  }
}
