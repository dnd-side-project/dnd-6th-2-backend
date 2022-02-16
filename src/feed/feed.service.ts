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

  async findLast(): Promise<any> {
    return this.feedRepository.findLast();
  }

  async findNext(tag, lastArticleId): Promise<any> {
    return this.feedRepository.findNext(tag, lastArticleId);
  }

  async mainFeed(lastArticleId, tag: [string]): Promise<Article[]> {
    return this.feedRepository.mainFeed(lastArticleId, tag);
  }

  async findLastSub(user, authorId): Promise<any> {
    return this.feedRepository.findLastSub(user, authorId);
  }

  async findNextSub(user, lastArticleId, authorId): Promise<any> {
    return this.feedRepository.findNextSub(user, lastArticleId, authorId);
  }

  async subFeed(user, lastArticleId): Promise<any[]> {
    return this.feedRepository.subFeed(user, lastArticleId);
  }

  async subFeedOne(user, authorId, lastArticleId): Promise<any[]> {
    return this.feedRepository.subFeedOne(user, authorId, lastArticleId);
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
    lastArticleId,
    option: string,
    content: string,
  ): Promise<any> {
    return this.feedRepository.searchArticle(lastArticleId, option, content);
  }

  async nextSearch(option: string, content: string, last) {
    return this.feedRepository.nextSearch(option, content, last);
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
