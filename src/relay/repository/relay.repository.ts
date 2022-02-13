import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { CreateRelayDto } from '../dto/create-relay.dto';
import { Relay, RelayDocument } from '../schemas/relay.schema';

export class RelayRepository {
  constructor(
    @InjectModel(Relay.name) private relayModel: Model<RelayDocument>,
  ) {}

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
}
