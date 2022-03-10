import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';
import { Like } from './schemas/like.schema';
import { User } from 'src/auth/schemas/user.schema';
import { SubFeedRepository } from './repository/sub-feed.repository';
import { HistoryRepository } from './repository/history.repository';

export enum OrderBy {
  LATEST = '최신순',
  POPULAR = '인기순',
}

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly subFeedRepository: SubFeedRepository,
    private readonly historyRepository: HistoryRepository,
  ) {}

  async articleCheck(): Promise<Article[]> {
    return this.feedRepository.articleCheck();
  }

  async getMainFeed(query): Promise<Article[]> {
    return this.feedRepository.getMainFeed(query);
  }

  async getSubFeedAll(user, cursor): Promise<any[]> {
    return this.subFeedRepository.getSubFeedAll(user, cursor);
  }

  async getSubFeedOne(authorId, cursor): Promise<any[]> {
    return this.subFeedRepository.getSubFeedOne(authorId, cursor);
  }

  async findSubUser(user, authorId): Promise<any[]> {
    return this.subFeedRepository.findSubUser(user, authorId);
  }

  async findAllSubUser(user): Promise<User[]> {
    return this.subFeedRepository.findAllSubUser(user);
  }

  async subUser(user, authorId): Promise<any> {
    return this.subFeedRepository.saveSubUser(user, authorId);
  }

  async updateSubUser(user, authorId): Promise<any> {
    return this.subFeedRepository.updateSubUser(user, authorId);
  }

  async searchArticle(query): Promise<any> {
    return this.feedRepository.searchArticle(query);
  }

  async findHistory(user): Promise<any[]> {
    return this.historyRepository.findHistory(user);
  }

  async findOneHistory(user, historyId): Promise<any> {
    return this.historyRepository.findOneHistory(user, historyId);
  }

  async saveHistory(user, content): Promise<any> {
    return this.historyRepository.saveHistory(user, content);
  }

  async getOneArticle(articleId): Promise<Article> {
    return this.feedRepository.findOneArticle(articleId);
  }

  async deleteArticle(user, articleId): Promise<any> {
    return this.feedRepository.deleteArticle(user, articleId);
  }

  async updateArticle(
    user,
    articleId: string,
    updateArticleDto,
  ): Promise<Article> {
    return this.feedRepository.updateArticle(user, articleId, updateArticleDto);
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
