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
import { OrderBy } from '../feed.service';
import { Category, CategoryDocument } from 'src/auth/schemas/category.schema';

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
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async articleCheck(): Promise<Article[]> {
    return await this.ArticleModel.find();
  }

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

  async getMainFeed(query): Promise<Article[]> {
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
            public: true,
            _id: { $lte: lastId },
          };
        } else {
          filter = {
            public: true,
            _id: { $lte: lastId },
          };
        }
        return await this.getPagedArticle(filter, OrderBy.LATEST);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            tags: { $in: tags },
            public: true,
            $or: [{ likeNum: { $lte: lastCount } }, { _id: { $lte: lastId } }],
          };
        } else {
          filter = {
            public: true,
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
            public: true,
            tags: { $in: tags },
            _id: { $lt: nextId },
          };
        } else {
          filter = {
            public: true,
            _id: { $lt: nextId },
          };
        }
        return await this.getPagedArticle(filter, OrderBy.LATEST);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            public: true,
            tags: { $in: tags },
            $or: [
              { likeNum: { $lt: nextCount } },
              { likeNum: nextCount, _id: { $lt: nextId } },
            ],
          };
        } else {
          filter = {
            public: true,
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

  async getSerachArticle(options, filter, orderBy: OrderBy) {
    if (orderBy === OrderBy.LATEST) {
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else if (orderBy === OrderBy.POPULAR) {
      return await this.ArticleModel.find(filter)
        .and([{ $or: options }])
        .sort({ likeNum: -1, _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    }
  }

  async findAllLastSearchArticle(orderBy: OrderBy, type, options) {
    if (type) {
      if (orderBy === OrderBy.LATEST) {
        return await this.ArticleModel.find({ $or: options, type: type })
          .sort({ _id: -1 })
          .limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.ArticleModel.find({ $or: options, type: type })
          .sort({ likeNum: -1, _id: -1 })
          .limit(1);
      }
    } else {
      if (orderBy === OrderBy.LATEST) {
        return await this.ArticleModel.find({ $or: options })
          .sort({ _id: -1 })
          .limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.ArticleModel.find({ $or: options })
          .sort({ likeNum: -1, _id: -1 })
          .limit(1);
      }
    }
  }

  async searchArticle(query): Promise<any[]> {
    const { cursor, content, orderBy, type } = query;

    let options = [];
    options = [
      { title: new RegExp(content) },
      { content: new RegExp(content) },
    ];
    if (!cursor) {
      const last = await this.findAllLastSearchArticle(orderBy, type, options);
      if (last.length === 0) {
        return last;
      } else {
        const lastId = last[0]._id;
        const lastCount = last[0].likeNum;
        if (orderBy === OrderBy.LATEST) {
          let filter;
          if (!type) {
            filter = {
              $or: options,
              public: true,
              _id: { $lte: lastId },
            };
          } else {
            filter = {
              type: type,
              $or: options,
              public: true,
              _id: { $lte: lastId },
            };
          }
          return await this.getSerachArticle(options, filter, OrderBy.LATEST);
        } else if (orderBy === OrderBy.POPULAR) {
          let filter;
          if (type) {
            filter = {
              type: type,
              public: true,
              $or: [
                { likeNum: { $lte: lastCount } },
                { _id: { $lte: lastId } },
              ],
            };
          } else {
            filter = {
              public: true,
              $or: [
                { likeNum: { $lte: lastCount } },
                { _id: { $lte: lastId } },
              ],
            };
          }
          return await this.getSerachArticle(options, filter, OrderBy.POPULAR);
        }
      }
    } else {
      const cursorArr = cursor.split('_');
      const nextId = cursorArr[0];
      const nextCount = cursorArr[1];
      if (orderBy === OrderBy.LATEST) {
        let filter;
        if (!type) {
          filter = {
            $or: options,
            public: true,
            _id: { $lt: nextId },
          };
        } else {
          filter = {
            type: type,
            $or: options,
            public: true,
            _id: { $lt: nextId },
          };
        }
        return await this.getSerachArticle(options, filter, OrderBy.LATEST);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (type) {
          filter = {
            type: type,
            public: true,
            likeNum: { $lt: nextCount },
          };
        } else {
          filter = {
            public: true,
            likeNum: { $lt: nextCount },
          };
        }
        return await this.getSerachArticle(options, filter, OrderBy.POPULAR);
      }
    }
  }

  async findOneArticle(id): Promise<Article> {
    return await this.ArticleModel.findOne({ _id: id, public: true })
      .populate('user')
      .exec();
  }

  async deleteArticle(user, id): Promise<any> {
    await this.CommentModel.deleteMany({ article: id });

    const article = await this.ArticleModel.findById(id);

    await this.categoryModel.findByIdAndUpdate(article.category, {
      $inc: { articleCount: -1 },
    });

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
        $pull: {
          challengeHistory: article.createdAt.toDateString(),
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
        $pull: {
          challengeHistory: article.createdAt.toDateString(),
        },
      });
    }
    return await this.ArticleModel.findByIdAndDelete(id);
  }

  async updateArticle(
    user,
    articleId: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.ArticleModel.findById(articleId);
    const category = await this.categoryModel.findById(
      updateArticleDto.category,
    );

    if (updateArticleDto.public == false) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          articleCount: -1,
        },
      });
      await this.categoryModel.findByIdAndUpdate(article.category, {
        $inc: { articleCount: -1 },
      });
    } else if (
      updateArticleDto.public == true &&
      category != article.category
    ) {
      await this.categoryModel.findByIdAndUpdate(article.category, {
        $inc: { articleCount: -1 },
      });
      await this.categoryModel.findByIdAndUpdate(category, {
        $inc: { articleCount: 1 },
      });
    }
    return await this.ArticleModel.findByIdAndUpdate(
      articleId,
      updateArticleDto,
      { new: true },
    );
  }

  async findArticleComment(articleId): Promise<Comment[]>{
    return await this.CommentModel.find({article: articleId})
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

    await this.categoryModel.findByIdAndUpdate(scrapDto.category, {
      $inc: { scrapCount: 1 },
    });

    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: 1,
      },
    });
    const scrap = new this.ScrapModel(scrapDto);
    return scrap.save();
  }

  async deleteScrap(user, articleId): Promise<any> {
    const scrap = await this.ScrapModel.findOne({
      article: articleId,
      user: user._id,
    });
    const categoryId = scrap.category;

    await this.categoryModel.findByIdAndUpdate(categoryId, {
      $inc: { scrapCount: -1 },
    });

    await this.ArticleModel.findByIdAndUpdate(articleId, {
      $inc: {
        scrapNum: -1,
      },
    });
    return scrap.delete();
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
