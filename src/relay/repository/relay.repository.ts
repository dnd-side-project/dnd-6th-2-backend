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
import { OrderBy } from '../relay.service';
import { Notice, NoticeDocument } from '../schemas/notice.schema';
import { Relay, RelayDocument } from '../schemas/relay.schema';

export class RelayRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
  ) {}

  async findRelayById(relayId: string): Promise<Relay> {
    const relay = await this.relayModel.findById(relayId);

    if (!relay) {
      throw new NotFoundException('요청하신 릴레이 방이 존재하지 않습니다.');
    }
    return relay;
  }

  async checkUser(relayId: string, userId: string) {
    // 호스트인지 판별
    const check = await this.relayModel.exists({ _id: relayId, host: userId });

    if (!check) {
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

  async getPagedRelay(filter, orderBy: OrderBy, populate_list) {
    if (orderBy === OrderBy.LATEST) {
      return await this.relayModel
        .find(filter)
        .sort({ _id: -1 })
        .limit(15)
        .populate(populate_list)
        .exec();
    } else if (orderBy === OrderBy.POPULAR) {
      return await this.relayModel
        .find(filter)
        .sort({ likeCount: -1, _id: -1 })
        .limit(15)
        .populate(populate_list)
        .exec();
    }
  }

  async findAllLastRelay(orderBy: OrderBy, filter) {
    const { user, tags } = filter;
    if (tags) {
      if (orderBy === OrderBy.LATEST) {
        return await this.relayModel
          .find({ members: { $ne: user._id }, tags: { $in: tags } })
          .sort({ _id: -1 })
          .limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.relayModel
          .find({ members: { $ne: user._id }, tags: { $in: tags } })
          .sort({ likeCount: -1, _id: -1 })
          .limit(1);
      }
    } else {
      if (orderBy === OrderBy.LATEST) {
        return await this.relayModel
          .find({ members: { $ne: user._id } })
          .sort({ _id: -1 })
          .limit(1);
      } else if (orderBy === OrderBy.POPULAR) {
        return await this.relayModel
          .find({ members: { $ne: user._id } })
          .sort({ likeCount: -1, _id: -1 })
          .limit(1);
      }
    }
  }

  async getAllRelay(query, user: User) {
    const { tags, orderBy, cursor } = query;
    const populate_list = ['notice', 'host', 'members'];

    if (!cursor) {
      const last = await this.findAllLastRelay(orderBy, { user, tags });
      const lastId = last[0]._id;
      const lastCount = last[0].likeCount;
      if (orderBy === OrderBy.LATEST) {
        let filter;
        if (tags) {
          filter = {
            members: { $ne: user._id },
            tags: { $in: tags },
            _id: { $lte: lastId },
          };
        } else {
          filter = {
            members: { $ne: user._id },
            _id: { $lte: lastId },
          };
        }
        return await this.getPagedRelay(filter, OrderBy.LATEST, populate_list);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            members: { $ne: user._id },
            tags: { $in: tags },
            $or: [
              { likeCount: { $lt: lastCount } },
              { likeCount: lastCount, _id: { $lte: lastId } },
            ],
          };
        } else {
          filter = {
            members: { $ne: user._id },
            $or: [
              { likeCount: { $lt: lastCount } },
              { likeCount: lastCount, _id: { $lte: lastId } },
            ],
          };
        }
        return await this.getPagedRelay(filter, OrderBy.POPULAR, populate_list);
      }
    } else {
      const { nextId, nextCount } = cursor.split('_');
      if (orderBy === OrderBy.LATEST) {
        let filter;
        if (tags) {
          filter = {
            members: { $ne: user._id },
            tags: { $in: tags },
            _id: { $lt: nextId },
          };
        } else {
          filter = {
            members: { $ne: user._id },
            _id: { $lt: nextId },
          };
        }
        return await this.getPagedRelay(filter, OrderBy.LATEST, populate_list);
      } else if (orderBy === OrderBy.POPULAR) {
        let filter;
        if (tags) {
          filter = {
            members: { $ne: user._id },
            tags: { $in: tags },
            $or: [
              { likeCount: { $lt: nextCount } },
              { likeCount: nextCount, _id: { $lt: nextId } },
            ],
          };
        } else {
          filter = {
            members: { $ne: user._id },
            $or: [
              { likeCount: { $lt: nextCount } },
              { likeCount: nextCount, _id: { $lt: nextId } },
            ],
          };
        }
        return await this.getPagedRelay(filter, OrderBy.POPULAR, populate_list);
      }
    }
  }

  async findJoinedLastRelay(user: User) {
    return await this.relayModel
      .find({ host: { $ne: user._id }, members: user._id })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getJoinedRelay(cursor, user: User) {
    let filter;
    const populate_list = ['notice', 'host', 'members'];
    if (!cursor) {
      const last = await this.findJoinedLastRelay(user);
      const lastId = last[0]._id;
      filter = { members: user._id, _id: { $lte: lastId } };
    } else {
      const { nextId, nextCount } = cursor.split('_');
      filter = {
        host: { $ne: user._id },
        members: user._id,
        _id: { $lt: nextId },
      };
    }
    return await this.getPagedRelay(filter, OrderBy.LATEST, populate_list);
  }

  async findMyLastRelay(user: User) {
    return await this.relayModel
      .find({ host: user._id })
      .sort({ _id: -1 })
      .limit(1);
  }

  async getMyRelay(cursor, user: User) {
    let filter;
    const populate_list = ['notice', 'host', 'members'];
    if (!cursor) {
      const last = await this.findMyLastRelay(user);
      const lastId = last[0]._id;
      filter = { host: user._id, _id: { $lte: lastId } };
    } else {
      const { nextId, nextCount } = cursor.split('_');
      filter = { host: user._id, _id: { $lt: nextId } };
    }
    return await this.getPagedRelay(filter, OrderBy.LATEST, populate_list);
  }

  async createRelay(
    createRelayDto: CreateRelayDto,
    user: User,
  ): Promise<Relay> {
    const { title, tags, notice, headCount } = createRelayDto;
    const relay = new this.relayModel({
      title,
      tags,
      headCount,
      host: user,
    });
    await relay.save();
    const Notice = new this.noticeModel({ relay: relay._id, notice });
    await Notice.save();
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
    if (updateRelayDto.title) {
      await this.articleModel.updateMany(
        { _id: relayId },
        { $set: { title: updateRelayDto.title } },
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

    const Notice = new this.noticeModel({ relay: relayId, notice });
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
