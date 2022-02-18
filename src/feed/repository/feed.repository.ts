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
import { KeyWord, KeyWordDocument } from 'src/challenge/schemas/keyword.schema';
import { History, HistoryDocument } from '../schemas/history.schema';
import { OrderBy } from '../feed.service';

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
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
    @InjectModel(History.name)
    private HistoryModel: Model<HistoryDocument>,
  ) {}

  async findAllLastArticle(orderBy: OrderBy, filter) {
    const { tags } = filter;
    if (tags) {
      if (orderBy === OrderBy.LATEST) {
        return await this.ArticleModel.find({ tags: { $in: tags } })
          .sort({ _id: -1 })
          .limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.ArticleModel.find({ tags: { $in: tags } })
          .sort({ likeNum: -1, _id: -1 })
          .limit(1);
      }
    } else {
      if (orderBy === OrderBy.LATEST) {
        return await this.ArticleModel.find().sort({ _id: -1 }).limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.ArticleModel.find()
          .sort({ likeNum: -1, _id: -1 })
          .limit(1);
      }
    }
  }

  async getPagedArticle(filter, orderBy: OrderBy) {
    if (orderBy === OrderBy.LATEST) {
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else if (orderBy === OrderBy.POPULAR) {
      return await this.ArticleModel.find(filter)
        .sort({ likeNum: -1, _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    }
  }

  async mainFeed(query): Promise<Article[]> {
    const { tags, orderBy, cursor } = query;

    if (!cursor) {
      const last = await this.findAllLastArticle(orderBy, { tags });
      const lastId = last[0]._id;
      const lastCount = last[0].likeNum;
      if (orderBy === OrderBy.LATEST) {
        let filter;
        if (tags) {
          filter = {
            tags: { $in: tags },
            _id: { $lte: lastId },
          };
        } else {
          filter = {
            _id: { $lte: lastId },
          };
        }
        return await this.getPagedArticle(filter, OrderBy.LATEST);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            tags: { $in: tags },
            $or: [{ likeNum: { $lte: lastCount } }, { _id: { $lte: lastId } }],
          };
        } else {
          filter = {
            $or: [{ likeNum: { $lte: lastCount } }, { _id: { $lte: lastId } }],
          };
        }
        return await this.getPagedArticle(filter, OrderBy.POPULAR);
      }
    } else {
      const cursorArr = cursor.split('_');
      const nextId = cursorArr[0];
      const nextCount = cursorArr[1];
      if (orderBy === OrderBy.LATEST) {
        let filter;
        if (tags) {
          filter = {
            tags: { $in: tags },
            _id: { $lt: nextId },
          };
        } else {
          filter = {
            _id: { $lt: nextId },
          };
        }
        return await this.getPagedArticle(filter, OrderBy.LATEST);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            tags: { $in: tags },
            $or: [
              { likeNum: { $lt: nextCount } },
              { likeNum: nextCount, _id: { $lt: nextId } },
            ],
          };
        } else {
          filter = {
            $or: [
              { likeNum: { $lt: nextCount } },
              { likeNum: nextCount, _id: { $lt: nextId } },
            ],
          };
        }
        return await this.getPagedArticle(filter, OrderBy.POPULAR);
      }
    }
  }

  async getSubFeedAll(user: User, cursor): Promise<any[]> {
    if (!cursor) {
      let filter = { user: user.subscribeUser, public: true };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else {
      let filter = {
        user: user.subscribeUser,
        public: true,
        _id: { $lt: cursor },
      };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    }
  }

  //특정 구독작가의 글만 보기
  async getSubFeedOne(authorId, cursor): Promise<any[]> {
    if (!cursor) {
      let filter = { user: authorId, public: true };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else {
      let filter = { user: authorId, public: true, _id: { $lt: cursor } };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    }
  }

  //구독한 유저인지 체크
  async findSubUser(user, authorId): Promise<any[]> {
    const check = await this.UserModel.find({
      _id: user._id,
      subscribeUser: authorId,
    });
    return check;
  }

  async findAllSubUser(user): Promise<User[]> {
    return await this.UserModel.find({ _id: user.subscribeUser });
  }

  async subUser(user, authorId): Promise<any> {
    return await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        subscribeUser: authorId,
      },
    });
  }

  async updateSubUser(user, authorId): Promise<any> {
    return await this.UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        subscribeUser: authorId,
      },
    });
  }

  async searchArticle(query): Promise<any[]> {
    const { cursor, option, content, orderBy } = query;

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
    if (!cursor) {
      const last = await this.ArticleModel.find({ $or: options, public: true })
        .sort({ _id: -1 })
        .limit(1);
      if (last.length === 0) {
        return last;
      } else {
        const lastId = last[0]._id;
        const lastCount = last[0].likeNum;
        if (orderBy === OrderBy.LATEST) {
          return await this.ArticleModel.find({
            $or: options,
            public: true,
            _id: { $lte: lastId },
          })
            .sort({ _id: -1 })
            .limit(15)
            .populate('user')
            .exec();
        } else if (orderBy === OrderBy.POPULAR) {
          let filter = [
            { $or: options },
            {$or: [
                { likeNum: { $lte: lastCount } },
                { _id: { $lte: lastId } }
              ]}
          ]
          return await this.ArticleModel.find({ public: true })
            .and(filter)
            .sort({ likeNum: -1 })
            .limit(15)
            .populate('user')
            .exec();
        }
      }
    } else {
      const cursorArr = cursor.split('_');
      const nextId = cursorArr[0];
      const nextCount = cursorArr[1];
      if (orderBy === OrderBy.LATEST) {
        return await this.ArticleModel.find({
          $or: options,
          public: true,
          _id: { $lt: nextId },
        })
          .sort({ _id: -1 })
          .limit(15)
          .populate('user')
          .exec();
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.ArticleModel.find({
          $or: options,
          public: true,
          likeNum: { $lt: nextCount },
        })
          .sort({ likeNum: -1 })
          .limit(15)
          .populate('user')
          .exec();
      }
    }
  }

  async findHistory(user): Promise<any[]> {
    const histories = await this.HistoryModel.find({ user: user._id })
      .sort({ _id: -1 })
      .limit(10);
    return histories;
  }

  async findOneHistory(user, historyId): Promise<any> {
    return await this.HistoryModel.findOneAndDelete({
      _id: historyId,
      user: user._id,
    });
  }

  async saveHistory(user, content: string): Promise<any> {
    const history = await this.HistoryModel.findOne({
      user: user._id,
      content: content,
    });
    //유저의 검색어가 몇 개 저장됐는지 알기 위함
    const length = await this.HistoryModel.find({
      user: user._id,
    }).countDocuments();
    if (history) {
      return history;
    } else if (!history && length < 10) {
      const newHistory = await new this.HistoryModel({
        user: user,
        content: content,
      });
      return newHistory.save();
    }
    //검색어가 10개 이상이면 제일 오래된 걸 삭제해주고 최근 검색어 저장
    else if (!history && length >= 10) {
      await this.HistoryModel.findOneAndDelete().sort({ _id: 1 });
      const newHistory = await new this.HistoryModel({
        user: user,
        content: content,
      });
      return newHistory.save();
    }
  }

  async findOneArticle(id): Promise<Article> {
    // const test = await this.ArticleModel.findOne({_id:id, public:true})
    // console.log(test)
    // console.log(test.createdAt.toDateString())
    return await this.ArticleModel.findOne({ _id: id, public: true })
      .populate('user')
      .populate('comments')
      .exec();
  }

  async deleteArticle(user, id): Promise<any> {
    console.log(user);
    await this.CommentModel.deleteMany({ article: id });
    await this.UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        articles: id,
      },
      $inc: {
        challenge: -1,
      },
    });
    const article = await this.ArticleModel.findById(id);
    const keyWord = await this.KeyWordModel.findOne({
      updateDay: article.createdAt.toDateString(),
    });
    const challenge = await this.ArticleModel.find({
      user: user._id,
      keyWord: keyWord.content,
    });
    const today = new Date().toDateString();
    const todayKeyWord = await this.KeyWordModel.findOne({ updateDay: today });
    //마지막 챌린지 글을 삭제할 때
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
        comments: comment,
      },
    });
    return comment.save();
  }

  async updateComment(
    articleId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.CommentModel.findOneAndUpdate(
      { article: articleId, _id: commentId },
      updateCommentDto,
      { new: true },
    );
  }

  async deleteComment(articleId, commentId): Promise<any> {
    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        commentNum: -1,
      },
      $pull: {
        comments: commentId,
      },
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
