import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getAllArticle(page:number): Promise<Article[]> {
    return this.feedRepository.findAllArticle(page);
  }

  async searchArticle(option: string, content: string): Promise<Article[]> {
    return this.feedRepository.searchArticle(option, content);
  }

  async getOneArticle(articleId): Promise<any[]> {
    return this.feedRepository.findOneArticle(articleId);
  }

  async deleteArticle(articleId): Promise<any> {
    return this.feedRepository.deleteArticle(articleId);
  }

  async updateArticle(articleId: string, updateArticleDto): Promise<Article> {
    return this.feedRepository.updateArticle(articleId, updateArticleDto);
  }

  async findComment(commentId): Promise<Comment> {
    return this.feedRepository.findComment(commentId);
  }

  async addComment(user, articleId: string, createCommentDto): Promise<Comment> {
    return this.feedRepository.saveComment(user, articleId, createCommentDto);
  }

  async updateComment(commentId: string, updateCommentDto): Promise<Comment> {
    return this.feedRepository.updateComment(commentId, updateCommentDto);
  }

  async deleteComment(commentId): Promise<any> {
    return this.feedRepository.deleteComment(commentId);
  }

  async findScrap(user, articleId: string): Promise<Scrap[]> {
    return this.feedRepository.findScrap(user, articleId);
  }

  async saveScrap(user, articleId: string, scrapDto): Promise<Scrap> {
    return this.feedRepository.saveScrap(user, articleId, scrapDto);
  }

  async deleteScrap(user, articleId: string): Promise<any> {
    return this.feedRepository.deleteScrap(user, articleId);
  }

  async saveLike(articleId: string): Promise<any> {
    return this.feedRepository.saveLike(articleId);
  }

  async deleteLike(articleId: string): Promise<any> {
    return this.feedRepository.deleteLike(articleId);
  }
}
