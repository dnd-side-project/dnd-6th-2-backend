import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/auth/schemas/category.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Like, LikeDocument } from 'src/feed/schemas/like.schema';
import { RelayArticleDto } from '../dto/relay-article.dto';
import { Relay, RelayDocument } from '../schemas/relay.schema';
import { RelayRepository } from './relay.repository';

export class RelayArticleRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
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

  async checkCategory(categoryId: string, user: User) {
    const check = await this.categoryModel.exists({ _id: categoryId, user });
    if (!check) {
      throw new NotFoundException('요청하신 카테고리는 존재하지 않습니다.');
    }
  }

  async createRelayArticle(
    relayId: string,
    relayArticleDto: RelayArticleDto,
    user: User,
  ) {
    await this.checkMember(relayId, user._id);

    const { content, categoryId } = relayArticleDto;
    await this.checkCategory(categoryId, user);
    const article = new this.articleModel({
      user,
      content,
      category: categoryId,
      relay: relayId,
    });
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

  async updateRelayArticle(
    param,
    relayArticleDto: RelayArticleDto,
    user: User,
  ) {
    const { relayId, articleId } = param;
    const { content, categoryId } = relayArticleDto;
    await this.checkMember(relayId, user._id);
    await this.checkAuthor(articleId, user._id);
    await this.checkCategory(categoryId, user);

    if (content && categoryId) {
      return await this.articleModel.findByIdAndUpdate(
        articleId,
        { content, category: categoryId },
        { new: true },
      );
    } else {
      if (content) {
        return await this.articleModel.findByIdAndUpdate(
          articleId,
          { content },
          { new: true },
        );
      } else if (categoryId) {
        return await this.articleModel.findByIdAndUpdate(
          articleId,
          { category: categoryId },
          { new: true },
        );
      }
    }
  }

  async deleteRelayArticle(param, user: User) {
    const { relayId, articleId } = param;
    await this.checkMember(relayId, user._id);
    const relay = await this.relayRepository.findRelayById(relayId);
    await this.relayModel.findByIdAndUpdate(relayId, {
      $inc: { articleCount: -1 },
    });

    if (relay.host._id.toString() === user._id.toString()) {
      const article = await this.articleModel.findByIdAndDelete(articleId);
      await this.categoryModel.findByIdAndUpdate(article.category._id, {
        $inc: { articleCount: -1 },
      });
      return article;
    } else {
      await this.checkAuthor(articleId, user._id);

      const article = await this.articleModel.findByIdAndDelete(articleId);
      await this.categoryModel.findByIdAndUpdate(article.category._id, {
        $inc: { articleCount: -1 },
      });
      return article;
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
