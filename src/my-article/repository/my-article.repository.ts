import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Comment, CommentDocument } from 'src/feed/schemas/comment.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
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
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
  ) {}

  async findMyArticle(user, last): Promise<Article[]> {
    if (last == null) {
      const lastArticle = await this.ArticleModel.find({
        user: user._id,
        $or: [{ state: true }, { free: true }],
      })
        .sort({ _id: -1 })
        .limit(1);
      last = lastArticle[0]._id;
      const articles = await this.ArticleModel.find({
        user: user._id,
        $or: [{ state: true }, { free: true }],
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(15);
      return articles;
    } else {
      const articles = await this.ArticleModel.find({
        user: user._id,
        $or: [{ state: true }, { free: true }],
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(15);
      return articles;
    }
  }

  async findMyArticleNext(user, last): Promise<any> {
    const next = await this.ArticleModel.find({
      $or: [{ state: true }, { free: true }],
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
    createArticleDto.free = true;
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
        .limit(15);
      return articles;
    } else {
      const articles = await this.ArticleModel.find({
        user: user._id,
        state: false,
        public: false,
        _id: { $lte: last },
      })
        .sort({ _id: -1 })
        .limit(15);
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
    for (let i = 0; i < articleId.length; i++) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $pull: {
          articles: articleId[i],
        },
      });
    }

    //챌린지 글은 챌린지 카운트 차감해줘야되니까 따로 찾아줌
    const challengeArticle = await this.ArticleModel.find({
      _id: articleId,
      keyWord: { $ne: null },
    });
    const articleCount: number = challengeArticle.length;
    //삭제하는 글 중에 챌린지 글이 있으면 삭제하는 챌린지 글 수만큼 챌린지 카운트 차감
    if (challengeArticle) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          challenge: -articleCount,
        },
      });
    }
    const articles = await this.ArticleModel.find({ _id: articleId });

    //삭제하는 글들에 해당하는 글감 찾아줌
    const keyWord = await this.KeyWordModel.find({
      updateDay: articles[0].createdAt.toDateString(),
    });

    const today = new Date().toDateString();
    const todayKeyWord = await this.KeyWordModel.findOne({ updateDay: today });

    //유저가 해당 글감에 쓴 글들을 찾아줌
    const challenge = await this.ArticleModel.find({
      user: user._id,
      keyWord: keyWord[0].content,
    });

    //삭제하는 글이 해당 글감의 마지막 챌린지 글이면 stamp 차감함
    if (challenge.length == 1 && challenge[0].keyWord != todayKeyWord.content) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          stampCount: -1,
        },
      });
    }
    //글감이 오늘자 글감이면 state까지 바꿔줌
    else if (
      challenge.length == 1 &&
      challenge[0].keyWord == todayKeyWord.content
    ) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $set: {
          state: false,
        },
        $inc: {
          stampCount: -1,
        },
      });
    }
    return await this.ArticleModel.deleteMany({ _id: articleId });
  }
}
