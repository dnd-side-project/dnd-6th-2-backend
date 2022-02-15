import { Injectable } from '@nestjs/common';
import { Article } from 'src/challenge/schemas/article.schema';
import { MyArticleRepository } from './repository/my-article.repository';

@Injectable()
export class MyArticleService {
  constructor(private readonly myArticleRepository: MyArticleRepository) {}

  async findMyArticle(user, last): Promise<Article[]> {
    return this.myArticleRepository.findMyArticle(user, last);
  }

  async findMyArticleNext(user, last): Promise<any> {
    return this.myArticleRepository.findMyArticleNext(user, last);
  }

  async saveMyArticle(user, createArticleDto): Promise<Article> {
    return this.myArticleRepository.saveMyArticle(user, createArticleDto);
  }

  async saveMyArticleTemp(user, createArticleDto): Promise<Article> {
    return this.myArticleRepository.saveMyArticleTemp(user, createArticleDto);
  }

  async findMyArticleTemp(user, last): Promise<Article[]> {
    return this.myArticleRepository.findMyArticleTemp(user, last);
  }

  async findTempArticleNext(user, last): Promise<any> {
    return this.myArticleRepository.findTempArticleNext(user, last);
  }

  async findMyArticleOne(articleId: string): Promise<Article> {
    return this.myArticleRepository.findMyArticleOne(articleId);
  }

  async updateMyArticle(articleId, updateArticleDto): Promise<Article> {
    return this.myArticleRepository.updateMyArticle(
      articleId,
      updateArticleDto,
    );
  }

  async deleteMyArticle(user, articleId): Promise<any> {
    return this.myArticleRepository.deleteMyArticle(user, articleId);
  }
}
