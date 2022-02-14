import { InjectModel } from "@nestjs/mongoose";
import { Article, ArticleDocument } from "src/challenge/schemas/article.schema";
import { Model } from "mongoose";
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';

export class MyArticleRepository{
    constructor(
        @InjectModel(Article.name)
        private ArticleModel: Model<ArticleDocument>
    ){}

    async findMyArticle(user): Promise<Article[]>{
        return await this.ArticleModel.find({user:user._id, state:true}).sort({_id:-1})
    }

    async findMyArticleOne(articleId): Promise<Article> {
        return await this.ArticleModel.findById(articleId);
    }

    async updateMyArticle(articleId, updateArticleDto: UpdateArticleDto,): Promise<Article> {
        return await this.ArticleModel.findByIdAndUpdate(articleId, updateArticleDto, {new: true});
    }

    async findMyArticleTemp(user): Promise<Article[]>{
        return await this.ArticleModel.find({user:user._id, state:false}).sort({_id:-1})
    }
}