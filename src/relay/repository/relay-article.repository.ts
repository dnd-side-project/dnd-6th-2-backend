import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Like, LikeDocument } from 'src/feed/schemas/like.schema';
import { Relay, RelayDocument } from '../schemas/relay.schema';
import { RelayRepository } from './relay.repository';

export class RelayArticleRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private readonly relayRepository: RelayRepository,
  ) {}

  async checkMember(relayId: string, userId: string) {
    const check = await this.relayModel.exists({
      _id: relayId,
      members: userId,
    });
    if (!check) {
      throw new ForbiddenException(
        '릴레이 방에 참여하지 않아 권한이 없습니다.',
      );
    }
  }

  async checkAuthor(articleId: string, userId: string) {
    const check = await this.articleModel.exists({
      _id: articleId,
      user: userId,
    });
    if (!check) {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  async getRelayArticle(relayId: string, cursor: string) {
    if (!cursor) {
      return await this.articleModel
        .find({ relay: relayId })
        .sort({ _id: 1 })
        .limit(15);
    } else {
      return await this.articleModel
        .find({ relay: relayId, _id: { $gt: cursor } })
        .sort({ _id: 1 })
        .limit(15)
        .populate('user')
        .exec();
    }
  }

  async createRelayArticle(relayId: string, content: string, user: User) {
    await this.checkMember(relayId, user._id);

    const article = new this.articleModel({ user, content, relay: relayId });
    await article.save();
    await this.relayModel.findByIdAndUpdate(relayId, {
      $inc: { articleCount: 1 },
    });
    return await this.articleModel.findByIdAndUpdate(
      article._id,
      { $set: { public: true } },
      { new: true },
    );
  }

  async updateRelayArticle(param, content: string, user: User) {
    const { relayId, articleId } = param;
    await this.checkMember(relayId, user._id);
    await this.checkAuthor(articleId, user._id);

    return await this.articleModel.findByIdAndUpdate(
      articleId,
      { content },
      { new: true },
    );
  }

  async deleteRelayArticle(param, user: User) {
    const { relayId, articleId } = param;
    await this.checkMember(relayId, user._id);
    const relay = await this.relayRepository.findRelayById(relayId);
    await this.relayModel.findByIdAndUpdate(relayId, {
      $inc: { articleCount: -1 },
    });

    if (relay.host._id.toString() === user._id.toString()) {
      return await this.articleModel.findByIdAndDelete(articleId);
    } else {
      await this.checkAuthor(articleId, user._id);

      return await this.articleModel.findByIdAndDelete(articleId);
    }
  }

  async findRelayLike(articleId: string, user: User) {
    const check = await this.likeModel.exists({
      user: user._id,
      article: articleId,
    });

    if (!check) {
      throw new NotFoundException('요청하신 좋아요가 존재하지 않습니다.');
    }
  }

  async createRelayLike(param, user: User) {
    const { relayId, articleId } = param;
    const like = new this.likeModel({ user: user._id, article: articleId });
    await this.articleModel.findByIdAndUpdate(articleId, {
      $inc: { likeNum: 1 },
    });
    await this.relayModel.findByIdAndUpdate(relayId, {
      $inc: { likeCount: 1 },
    });
    return await like.save();
  }

  async deleteRelayLike(param, user: User) {
    const { relayId, articleId } = param;
    await this.findRelayLike(articleId, user);

    await this.articleModel.findByIdAndUpdate(articleId, {
      $inc: { likeNum: -1 },
    });
    await this.relayModel.findByIdAndUpdate(relayId, {
      $inc: { likeCount: -1 },
    });
    return await this.likeModel.findOneAndDelete({
      article: articleId,
      user: user._id,
    });
  }
}
