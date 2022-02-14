import { Injectable } from '@nestjs/common';
import { Article } from 'src/challenge/schemas/article.schema';
import { MyArticleRepository } from './repository/my-article.repository';

@Injectable()
export class MyArticleService {
  constructor(private readonly myArticleRepository: MyArticleRepository) {}

  async findMyArticle(user): Promise<Article[]> {
      return this.myArticleRepository.findMyArticle(user);
  }

  async findMyArticleOne(articleId): Promise<Article>{
      return this.myArticleRepository.findMyArticleOne(articleId);
  }

  async updateMyArticle(articleId, updateArticleDto): Promise<Article> {
      return this.myArticleRepository.updateMyArticle(articleId, updateArticleDto);
  }

  async findMyArticleTemp(user): Promise<Article[]> {
    return this.myArticleRepository.findMyArticleTemp(user);
}
}
