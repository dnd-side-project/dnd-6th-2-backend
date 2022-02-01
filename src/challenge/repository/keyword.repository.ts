import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KeyWord, KeyWordDocument } from '../schemas/keyword.schema';
import { CreateKeyWordDto } from '../dto/create-keyword.dto';

export class KeyWordRepository {
  constructor(
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
  ) {}

  async saveKeyWord(createKeyWordDto: CreateKeyWordDto): Promise<KeyWord> {
    const KeyWord = new this.KeyWordModel(createKeyWordDto);
    return KeyWord.save();
  }

  async findKeyWord(): Promise<KeyWord[]> {
    return this.KeyWordModel.find();
  }

  async findRandomKeyWord() {
    //오늘 날짜
    const today = new Date().toDateString();
    //전체 키워드 중에서 updateDay가 오늘인거
    const todayKeyWord = await this.KeyWordModel.findOne({ updateDay: today });
    //안 쓴 키워드들 리스트
    const keyWordList = await this.KeyWordModel.find({ state: false });

    //updateDay가 오늘인게 있으면 그 키워드 리턴
    if (todayKeyWord) {
      return todayKeyWord;
    } else {
      //안 쓴 키워드가 있으면
      if (keyWordList.length != 0) {
        //오늘의 키워드 랜덤 추출
        const todayKeyWord =
          keyWordList[Math.floor(Math.random() * keyWordList.length)];
        //오늘의 키워드 state true로 업데이트, update 날짜 오늘로 업데이트
        await this.KeyWordModel.findOneAndUpdate(
          { content: todayKeyWord.content },
          {
            $set: {
              state: true,
              updateDay: today,
            },
          },
          { new: true },
        );
        return todayKeyWord;
      } else {
        return '키워드 다 씀';
      }
    }
  }
}
