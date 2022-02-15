import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateRelayDto } from '../dto/create-relay.dto';
import { UpdateRelayDto } from '../dto/update-relay.dto';
import { Notice, NoticeDocument } from '../schemas/notice.schema';
import { Relay, RelayDocument } from '../schemas/relay.schema';

export class RelayRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
  ) {}

  async findRelayById(id: string): Promise<Relay> {
    const relay = await this.relayModel.findById(id);

    if (!relay) {
      throw new NotFoundException('요청하신 릴레이 방이 존재하지 않습니다.');
    }
    return relay;
  }

  async checkUser(relayId: string, userId: string) {
    // 호스트인지 판별
    const relay = await this.findRelayById(relayId);

    if (relay.host._id.toString() !== userId.toString()) {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  async joinRelay(relayId: string, user: User) {
    // user를 id에 해당하는 relay의 members 객체에 추가
    const relay = await this.findRelayById(relayId);

    if (relay.membersCount < relay.headCount) {
      return await this.relayModel.findByIdAndUpdate(relayId, {
        $push: { members: user },
        $inc: { membersCount: 1 },
      });
    } else {
      throw new ForbiddenException('정원 제한으로 인해 입장할 수 없습니다.');
    }
  }

  async exitRelay(relayId: string, user: User) {
    const relay = await this.findRelayById(relayId);

    if (relay.host._id.toString() === user._id.toString()) {
      throw new ForbiddenException('호스트는 퇴장할 수 없습니다.');
    }
    try {
      return await this.relayModel.findByIdAndUpdate(relayId, {
        $pull: { members: user._id },
        $inc: { membersCount: -1 },
      });
    } catch (e) {
      throw new NotFoundException(
        '해당 릴레이 방의 참여자만 퇴장 기능을 이용할 수 있습니다.',
      );
    }
  }

  async getAllRelay(query, user: User) {
    // TODO: 정렬 기준 추가 + 페이지네이션 추가
    const { tags, orderBy } = query;
    if (tags) {
      return await this.relayModel
        .find({ members: { $ne: user._id }, tags: { $in: tags } })
        .sort({ createdAt: -1 })
        .populate(['notice', 'host'])
        .exec();
    } else {
      return await this.relayModel
        .find({ members: { $ne: user._id } })
        .sort({ createdAt: -1 })
        .populate(['notice', 'host'])
        .exec();
    }
  }

  async getJoinedRelay(user: User) {
    // TODO: 페이지네이션 추가
    return await this.relayModel
      .find({ members: user._id })
      .sort({ createdAt: -1 })
      .populate(['notice', 'host'])
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

  async updateRelay(
    relayId: string,
    updateRelayDto: UpdateRelayDto,
    user: User,
  ) {
    const relay = await this.findRelayById(relayId);
    if (relay.host._id.toString() !== user._id.toString()) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    if (
      updateRelayDto.headCount &&
      updateRelayDto.headCount < relay.membersCount
    ) {
      throw new BadRequestException(
        '현재 정원보다 적은 인원수로 수정할 수 없습니다.',
      );
    }
    return await this.relayModel.findByIdAndUpdate(relayId, updateRelayDto, {
      new: true,
    });
  }

  async deleteRelay(relayId: string, user: User) {
    await this.checkUser(relayId, user._id);
    // TODO: deleteLike
    await this.articleModel.deleteMany({ relay: relayId });
    return await this.relayModel.findByIdAndDelete(relayId);
  }

  async AddNoticeToRelay(relayId: string, notice: string, user: User) {
    await this.checkUser(relayId, user._id);

    const Notice = new this.noticeModel({ notice });
    await Notice.save();
    await this.relayModel.findByIdAndUpdate(relayId, {
      $push: { notice: Notice },
    });
    return Notice;
  }

  async updateNoticeToRelay(param, notice: string, user: User) {
    const { relayId, noticeId } = param;
    await this.checkUser(relayId, user._id);

    return await this.noticeModel.findByIdAndUpdate(noticeId, { notice });
  }

  async deleteNoticeToRelay(param, user: User) {
    const { relayId, noticeId } = param;
    await this.checkUser(relayId, user._id);

    await this.noticeModel.findByIdAndDelete(noticeId);
    return await this.relayModel.findByIdAndUpdate(relayId, {
      $pull: { notice: noticeId },
    });
  }
}
