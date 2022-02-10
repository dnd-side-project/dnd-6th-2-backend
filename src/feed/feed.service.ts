import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';
import { Like } from './schemas/like.schema';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async mainFeed(page: number): Promise<Article[]> {
    return this.feedRepository.mainFeed(page);
  }

  async subFeed(user, page: number): Promise<any[]> {
    return this.feedRepository.subFeed(user, page);
  }

  async findSubUser(user, articleId): Promise<any[]> {
    return this.feedRepository.findSubUser(user, articleId);
  }

  async findAllSubUser(user): Promise<User[]> {
    return this.feedRepository.findAllSubUser(user);
  }

  async subUser(user, articleId): Promise<any> {
    return this.feedRepository.subUser(user, articleId);
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

  async addComment(
    user,
    articleId: string,
    createCommentDto,
  ): Promise<Comment> {
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

  async findLike(user, articleId: string): Promise<Like[]> {
    return this.feedRepository.findLike(user, articleId);
  }

  async saveLike(user, articleId: string, scrapDto): Promise<any> {
    return this.feedRepository.saveLike(user, articleId, scrapDto);
  }

  async deleteLike(user, articleId: string): Promise<any> {
    return this.feedRepository.deleteLike(user, articleId);
  }
}
