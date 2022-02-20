import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';

export class SubFeedRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
  ) {}

  async getSubFeedAll(user: User, cursor): Promise<any[]> {
    if (!cursor) {
      const filter = { user: user.subscribeUser, public: true };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else {
      const filter = {
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
      const filter = { user: authorId, public: true };
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate('user')
        .exec();
    } else {
      const filter = { user: authorId, public: true, _id: { $lt: cursor } };
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

  //구독하기
  async saveSubUser(user, authorId): Promise<any> {
    await this.UserModel.findByIdAndUpdate(authorId, {
      $inc: {
        followers: 1,
      },
    });
    return await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        subscribeUser: authorId,
      },
    });
  }

  //구독취소
  async updateSubUser(user, authorId): Promise<any> {
    await this.UserModel.findByIdAndUpdate(authorId, {
      $inc: {
        followers: -1,
      },
    });
    return await this.UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        subscribeUser: authorId,
      },
    });
  }
}
