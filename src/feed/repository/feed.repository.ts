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

  async mainFeed(page: number, tag:[String]): Promise<Article[]> {
    //공개 설정된 모든글
    //업데이트순 정렬
    if (tag != null){
      return await this.ArticleModel.find({ public: true, tags:tag })
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate('user')
      .exec();
    }
    else {
      return await this.ArticleModel.find({ public: true })
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate('user')
      .exec();
    }
  }

  async subFeed(user, page: number, tag:[string]): Promise<any[]> {
    const result: any[] = [];
    //내가 구독한 유저들
    const subUserList: User[] = await this.UserModel.find({
      _id: user.subscribeUser,
    });
    //구독한 유저들의 공개된 글들
    //업데이트순 정렬
    if(tag != null){
      const articles: Article[] = await this.ArticleModel.find({
        user: user.subscribeUser,
        public: true,
        tags: tag
      })
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10)
        .populate('user')
        .exec();
        result.push(articles, subUserList);
        return result;
    }
    else{
      const articles: Article[] = await this.ArticleModel.find({
        user: user.subscribeUser,
        public: true,
      })
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10)
        .populate('user')
        .exec();
        result.push(articles, subUserList);
        return result;
    }
  }

  //특정 구독작가의 글만 보기
  async subFeedOne(user, authorId, page: number): Promise<any[]> {
    const loginUser: User = await this.UserModel.findById(user._id);
    const result: any[] = [];
    const articles = await this.ArticleModel.find({
      user: authorId,
      public: true,
    })
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate('user')
      .exec();
    //내가 구독한 유저들
    const subUserList: User[] = await this.UserModel.find({
      _id: loginUser.subscribeUser,
    });
    result.push(articles, subUserList);
    return result;
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

  async searchArticle(page:number, option: string, content: string): Promise<Article[]> {
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
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate('user')
      .exec();
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
