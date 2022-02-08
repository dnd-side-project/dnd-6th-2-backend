import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../schemas/article.schema';
import { KeyWord, KeyWordDocument } from '../schemas/keyword.schema';
import { CreateArticleDto } from '../dto/create-article.dto';
import { CreateKeyWordDto } from '../dto/create-keyword.dto';

export class ChallengeRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
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

  //개발용 함수 (서버 계속 껐다 키니까 presenetKeyWord 변수 만들어서 임시적으로 오늘의 키워드 저장해주고 보여줌)
  async findRandomKeyWord(): Promise<any[]> {
    const result: any[] = [];
    const today = new Date().toDateString();
    const presentKeyWord: KeyWord[] = [];
    presentKeyWord.push(await this.KeyWordModel.findOne({ updateDay: today }));
    this.todayKeyWord = presentKeyWord;
    result.push(presentKeyWord[0]);
    const challenge = await this.ArticleModel.findOne({
      state: true,
      keyWord: presentKeyWord[0].content,
    });
    result.push(challenge);
    return result;
    // } else {
    //   const todayKeyWord = await this.KeyWordModel.findOne({
    //     content: this.todayKeyWord[0].content,
    //   });
    //   result.push(todayKeyWord);
    //   const challenge = await this.ArticleModel.findOne({
    //     state: true,
    //     keyWord: todayKeyWord[0].content,
    //   });
    //   result.push(challenge);
    //   return result;
    // }
  }

  //배포용 ( 키워드, 챌린지 여부 리턴)
  // async findRandomKeyWord(): Promise<any[]> {
  //     let result:any[] = [];
  // // 나중에 유저 정보 추가
  //     const challenge = await this.ArticleModel.findOne({state: true, keyWord:this.todayKeyWord[0].content})
  //     result.push(challenge)
  //     const todayKeyWord = await this.KeyWordModel.findOne({
  //       content: this.todayKeyWord[0].content,
  //     });
  //     result.push(todayKeyWord)
  //     return result;
  //   }

  async saveArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    createArticleDto.keyWord = this.todayKeyWord[0].content;
    createArticleDto.state = true;
    const article = new this.ArticleModel(createArticleDto);
    return article.save();
  }

  //임시저장
  async temporarySaveArticle(
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    createArticleDto.keyWord = this.todayKeyWord[0].content;
    createArticleDto.state = false;
    const article = new this.ArticleModel(createArticleDto);
    return article.save();
  }

  // async findAllArticle(): Promise<Article[]> {
  //   return this.ArticleModel.find().exec();
  // }

  // async findOneArticle(id): Promise<Article> {
  //   return await this.ArticleModel.findById(id);
  // }

  // async deleteArticle(id): Promise<any> {
  //   return await this.ArticleModel.findByIdAndRemove(id);
  // }
}
