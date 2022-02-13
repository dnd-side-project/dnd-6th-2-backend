import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { CreateRelayDto } from '../dto/create-relay.dto';
import { Relay, RelayDocument } from '../schemas/relay.schema';

export class RelayRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findRelayById(id: string): Promise<Relay> {
    const relay = await this.relayModel.findById(id);

    if (!relay) {
      throw new NotFoundException();
    }
    return relay;
  }

  async checkUser(relayId: string, userId: string) {
    const relay = await this.findRelayById(relayId);
    if (relay.host._id !== userId) {
      throw new ForbiddenException();
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

  async createRelay(
    createRelayDto: CreateRelayDto,
    user: User,
  ): Promise<Relay> {
    const { title, tags, notice, headCount } = createRelayDto;
    const relay = new this.relayModel({
      title,
      tags,
      notice,
      headCount,
      host: user,
    });
    await this.joinRelay(relay._id, user);

    return relay.save();
  }

  async deleteRelay(relayId: string, user: User) {
    await this.checkUser(relayId, user._id);
    // TODO: deleteLike
    await this.articleModel.deleteMany({ relay: relayId });
    return await this.relayModel.findByIdAndDelete(relayId);
  }
}
