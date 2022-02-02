import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KeyWord, KeyWordDocument } from '../schemas/keyword.schema';
import { CreateKeyWordDto } from '../dto/create-keyword.dto';

export class KeyWordRepository {
  constructor(
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
  ) {}
  private todayKeyWord: KeyWord[] = [];

  async saveKeyWord(createKeyWordDto: CreateKeyWordDto): Promise<KeyWord> {
    const KeyWord = new this.KeyWordModel(createKeyWordDto);
    return KeyWord.save();
  }

  async findKeyWord(): Promise<KeyWord[]> {
    return this.KeyWordModel.find();
  }

  async updateKeyWord(): Promise<KeyWord[]> {
    const today = new Date().toDateString();

    //안 쓴 키워드 중에서 매일 키워드 하나를 랜덤 추출해주고 추출한 키워드 정보를 업데이트 해줌
    const keyWord = await this.KeyWordModel.aggregate([
      { $match: { state: false } },
      { $sample: { size: 1 } },
    ]);
    this.todayKeyWord[0] = await this.KeyWordModel.findOneAndUpdate(
      { content: keyWord[0].content },
      {
        $set: {
          state: true,
          updateDay: today,
        },
      },
    );
    return this.todayKeyWord;
  }

  async findRandomKeyWord(): Promise<KeyWord> {
    const todayKeyWord = await this.KeyWordModel.findOne({
      content: this.todayKeyWord[0].content,
    });
    return todayKeyWord;
  }
}
