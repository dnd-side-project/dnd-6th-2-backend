import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';
import { Like } from './schemas/like.schema';
import { User } from 'src/auth/schemas/user.schema';

export enum OrderBy {
  LATEST = '최신순',
  POPULAR = '인기순',
}

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async mainFeed(query): Promise<Article[]> {
    return this.feedRepository.mainFeed(query);
  }

  async getSubFeedAll(user, cursor): Promise<any[]> {
    return this.feedRepository.getSubFeedAll(user, cursor);
  }

  async getSubFeedOne(authorId, cursor): Promise<any[]> {
    return this.feedRepository.getSubFeedOne(authorId, cursor);
  }

  async findSubUser(user, authorId): Promise<any[]> {
    return this.feedRepository.findSubUser(user, authorId);
  }

  async findAllSubUser(user): Promise<User[]> {
    return this.feedRepository.findAllSubUser(user);
  }

  async subUser(user, authorId): Promise<any> {
    return this.feedRepository.subUser(user, authorId);
  }

  async updateSubUser(user, authorId): Promise<any> {
    return this.feedRepository.updateSubUser(user, authorId);
  }

  async searchArticle(
    query
  ): Promise<any> {
    return this.feedRepository.searchArticle(query);
  }

  async findHistory(user): Promise<any[]> {
    return this.feedRepository.findHistory(user);
  }

  async findOneHistory(user, historyId): Promise<any> {
    return this.feedRepository.findOneHistory(user, historyId);
  }

  async saveHistory(user, content): Promise<any> {
    return this.feedRepository.saveHistory(user, content);
  }

  async getOneArticle(articleId): Promise<Article> {
    return this.feedRepository.findOneArticle(articleId);
  }

  async deleteArticle(user, articleId): Promise<any> {
    return this.feedRepository.deleteArticle(user, articleId);
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

  async updateComment(
    articleId: string,
    commentId: string,
    updateCommentDto,
  ): Promise<Comment> {
    return this.feedRepository.updateComment(
      articleId,
      commentId,
      updateCommentDto,
    );
  }

  async deleteComment(articleId, commentId): Promise<any> {
    return this.feedRepository.deleteComment(articleId, commentId);
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
