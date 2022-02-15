import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateRelayDto } from '../dto/create-relay.dto';
import { Notice } from '../schemas/notice.schema';
import { Relay, RelayDocument } from '../schemas/relay.schema';

export class RelayRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Notice.name) private noticeModel: Model<RelayDocument>,
  ) {}

  async findRelayById(id: string): Promise<Relay> {
    const relay = await this.relayModel.findById(id);

    if (!relay) {
      throw new NotFoundException('요청하신 릴레이 방이 존재하지 않습니다.');
    }
    return relay;
  }

  async checkUser(relayId: string, userId: string) {
    const relay = await this.findRelayById(relayId);

    if (relay.host._id.toString() !== userId.toString()) {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  async joinRelay(id: string, user: User) {
    // user를 id에 해당하는 relay의 members 객체에 추가
    return await this.relayModel.findByIdAndUpdate(id, {
      $push: {
        members: user,
      },
    });
  }

  async getAllRelay(tags: string[] | null, user: User) {
    // TODO: 정렬 기준 추가 + 페이지네이션 추가
    if (tags) {
      return await this.relayModel
        .find({ members: { $ne: user._id }, tags: { $in: tags } })
        .sort({ createdAt: -1 })
        .exec();
    } else {
      return await this.relayModel
        .find({ members: { $ne: user._id } })
        .sort({ createdAt: -1 })
        .exec();
    }
  }

  async getJoinedRelay(user: User) {
    // TODO: 페이지네이션 추가
    return await this.relayModel
      .find({ members: user._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async createRelay(
    createRelayDto: CreateRelayDto,
    user: User,
  ): Promise<Relay> {
    const { title, tags, notice, headCount } = createRelayDto;
    const Notice = new this.noticeModel({ notice });
    await Notice.save();
    const relay = new this.relayModel({
      title,
      tags,
      headCount,
      host: user,
    });
    await relay.save();
    await this.relayModel.findByIdAndUpdate(relay._id, {
      $push: { notice: Notice },
    });
    await this.joinRelay(relay._id, user);

    return relay;
  }

  async deleteRelay(relayId: string, user: User) {
    await this.checkUser(relayId, user._id);
    // TODO: deleteLike
    await this.articleModel.deleteMany({ relay: relayId });
    return await this.relayModel.findByIdAndDelete(relayId);
  }

  async AddNoticeToRelay(id: string, notice: string, user: User) {
    await this.checkUser(id, user._id);

    const Notice = new this.noticeModel({ notice });
    await Notice.save();
    return await this.relayModel.findByIdAndUpdate(id, {
      $push: { notice: Notice },
    });
  }

  async updateNoticeToRelay(
    relayId: string,
    noticeId: string,
    notice: string,
    user: User,
  ) {
    await this.checkUser(relayId, user._id);

    return await this.noticeModel.findByIdAndUpdate(noticeId, { notice });
  }

  async deleteNoticeToRelay(relayId: string, noticeId: string, user: User) {
    await this.checkUser(relayId, user._id);

    await this.noticeModel.findByIdAndDelete(noticeId);
    return await this.relayModel.findByIdAndUpdate(relayId, {
      $pull: { notice: noticeId },
    });
  }
}
