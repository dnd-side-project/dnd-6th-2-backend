import { Injectable } from '@nestjs/common';
import { Article } from 'src/challenge/schemas/article.schema';
import { MyArticleRepository } from './repository/my-article.repository';

@Injectable()
export class MyArticleService {
  constructor(private readonly myArticleRepository: MyArticleRepository) {}

  async findMyArticle(user, cursor): Promise<Article[]> {
    return this.myArticleRepository.findMyArticle(user, cursor);
  }

  async saveMyArticle(user, createArticleDto): Promise<Article> {
    return this.myArticleRepository.saveMyArticle(user, createArticleDto);
  }

  async saveMyArticleTemp(user, createArticleDto): Promise<Article> {
    return this.myArticleRepository.saveMyArticleTemp(user, createArticleDto);
  }

  async findMyArticleTemp(user, cursor): Promise<Article[]> {
    return this.myArticleRepository.findMyArticleTemp(user, cursor);
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
    const articleIds: [string] = articleId.split(',');
    return this.myArticleRepository.deleteMyArticle(user, articleIds);
  }
}
