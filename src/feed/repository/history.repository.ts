import { InjectModel } from '@nestjs/mongoose';
import { History, HistoryDocument } from '../schemas/history.schema';
import { Model } from 'mongoose';

export class HistoryRepository {
  constructor(
    @InjectModel(History.name)
    private HistoryModel: Model<HistoryDocument>,
  ) {}
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
}
