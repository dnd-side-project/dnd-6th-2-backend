import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getAllArticle(): Promise<Article[]> {
    return this.feedRepository.findAllArticle();
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

  async addComment(articleId: string, createCommentDto): Promise<Comment> {
    return this.feedRepository.saveComment(articleId, createCommentDto);
  }

  async updateComment(commentId: string, updateCommentDto): Promise<Comment> {
    return this.feedRepository.updateComment(commentId, updateCommentDto);
  }

  async deleteComment(commentId): Promise<any> {
    return this.feedRepository.deleteComment(commentId);
  }

  async saveScrap(articleId: string, scrapDto): Promise<Scrap> {
    return this.feedRepository.saveScrap(articleId, scrapDto);
  }

  async deleteScrap(articleId: string): Promise<any> {
    return this.feedRepository.deleteScrap(articleId);
  }
}
