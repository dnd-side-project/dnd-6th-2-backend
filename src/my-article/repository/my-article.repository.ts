import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from 'src/challenge/schemas/article.schema';
import { Comment, CommentDocument } from 'src/feed/schemas/comment.schema';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { KeyWord, KeyWordDocument } from 'src/challenge/schemas/keyword.schema';
import { Model } from 'mongoose';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { CreateArticleDto } from 'src/challenge/dto/create-article.dto';

export class MyArticleRepository {
  constructor(
    @InjectModel(Article.name)
    private ArticleModel: Model<ArticleDocument>,
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentDocument>,
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
    @InjectModel(KeyWord.name)
    private KeyWordModel: Model<KeyWordDocument>,
  ) {}

  async findMyArticle(user, cursor): Promise<Article[]> {
    if (!cursor) {
      let filter = {user: user._id, $or: [{ state: true }, { free: true }, {relay:{$ne:null}}]}
      return await this.ArticleModel.find(filter)
      .sort({ _id: -1 })
      .limit(15);
    } else {
      let filter = {user: user._id, $or: [{ state: true }, { free: true },{relay:{$ne:null}}], _id: { $lt: cursor }}
      return await this.ArticleModel.find(filter)
      .sort({ _id: -1 })
      .limit(15);
    }
  }

  async saveMyArticle(
    user,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    createArticleDto.user = user._id;
    createArticleDto.keyWord = null;
    createArticleDto.state = false;
    createArticleDto.free = true;
    const article = await new this.ArticleModel(createArticleDto);
    if(createArticleDto.public == true){
      await this.UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          articleCount: 1,
        },
        $push: {
          articles: article,
        },
      });
    }else{
      await this.UserModel.findByIdAndUpdate(user._id, {
        $push: {
          articles: article,
        },
      });
    }
    return article.save();
  }

  async saveMyArticleTemp(
    user,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    createArticleDto.user = user._id;
    createArticleDto.keyWord = null;
    createArticleDto.state = false;
    const article = await new this.ArticleModel(createArticleDto);
    await this.UserModel.findByIdAndUpdate(user._id, {
      $push: {
        temporary: article,
      },
    });
    return article.save();
  }

  async findMyArticleTemp(user, cursor): Promise<Article[]> {
    let filter = {user: user._id, state: false, public: false}
    if (!cursor) {
      return await this.ArticleModel.find(filter)
        .sort({ _id: -1 })
        .limit(15);
    } else {
      let filter = {user: user._id, state: false, public: false, _id: { $lt: cursor }}
      return  await this.ArticleModel.find(filter)
      .sort({ _id: -1 })
      .limit(15);
    }
  }

  async findMyArticleOne(articleId): Promise<Article> {
    const article = await this.ArticleModel.findOne({ _id: articleId })
      .populate('user')
      .populate('comments')
      .exec();
    return article;
  }

  async updateMyArticle(
    user,
    articleId,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.ArticleModel.findById(articleId)
    if(article.public == true){
      if(updateArticleDto.public == false){
        await this.UserModel.findByIdAndUpdate(user._id,{
          $inc:{
            articleCount: -1
          }
        })
      }
    }
    else{
      if(updateArticleDto.public == true){
        await this.UserModel.findByIdAndUpdate(user._id,{
          $inc:{
            articleCount: 1
          }
        })
      }
    }
    return await this.ArticleModel.findByIdAndUpdate(
      articleId,
      updateArticleDto,
      { new: true },
    );
  }

  async deleteMyArticle(user, articleId): Promise<any> {
    await this.CommentModel.deleteMany({ article: articleId });
    for (let i = 0; i < articleId.length; i++) {
      await this.UserModel.findByIdAndUpdate(user._id, {
        $pull: {
          articles: articleId[i],
        },
      });
    }

    //삭제하려는 모든 글들 찾기
    const articles = await this.ArticleModel.find({_id:articleId});

    //삭제하는 글들에 해당하는 글감 찾아줌
    for (let i = 0; i < articles.length; i++){
      var keyWord = await this.KeyWordModel.find({
        updateDay: articles[i].createdAt.toDateString(),
      });
    }

    //오늘의 글감 찾아줌
    const today = new Date().toDateString();
    const todayKeyWord = await this.KeyWordModel.findOne({ updateDay: today });

    //삭제하려는 글 중 공개글의 수 
    const publicArticle:Number = await this.ArticleModel.find({_id:articleId, public:true}).count()
    await this.UserModel.findByIdAndUpdate(user._id, {
      $inc: {
          articleCount: -publicArticle
        },
      });

    //삭제 
    const deleteCount = await this.ArticleModel.deleteMany({ _id: articleId });

    /* 삭제한 글이 챌린지 글일때, 
    stampCount와 user의 state(챌린지 여부)속성을 변경해주기 위해서 삭제하는 글들에 해당한 글감에 쓴 챌린지들을 찾아줌 */
    for(let i=0; i<keyWord.length; i++){
      var challenge = await this.ArticleModel.find({
        user: user._id,
        keyWord: keyWord[i].content,
      });
    }

    const todayChallenge = await this.ArticleModel.find({user:user._id, keyWord:todayKeyWord.content})

    /*stampCount가 존재하는 경우, 삭제 후에 해당 글감의 챌린지 글이 안 남아있으면 그 수만큼 stamp 차감, 
    유저 state가 true인데 오늘자 챌린지 글이 없는 경우는 오늘자 챌린지글을 모두 삭제한 거니까 state도 변경 */
    const loginUser = await this.UserModel.findById(user._id);
    if(challenge.length == 0 && loginUser.stampCount!=0 ){
      await this.UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          stampCount: -keyWord.length,
        },
      });
      if(loginUser.state == true && todayChallenge.length == 0){
        await this.UserModel.findByIdAndUpdate(user._id, {
          $set: {
            state: false,
          },
        });
      }
    }
    return deleteCount;
  }
}