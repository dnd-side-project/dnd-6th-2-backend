import { Injectable } from '@nestjs/common';
import { FeedRepository } from './repository/feed.repository';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class FeedService {
  constructor(private readonly feedRepository: FeedRepository) {}

  async getAllFeed(): Promise<Article[]> {
    return this.feedRepository.findAllFeed();
  }

  async getOneFeed(id): Promise<any[]> {
    return this.feedRepository.findOneFeed(id);
  }

  async deleteArticle(id): Promise<any> {
    return this.feedRepository.deleteArticle(id);
  }

  async addComment(articleId: string, createCommentDto): Promise<Comment> {
    return this.feedRepository.saveComment(articleId, createCommentDto);
  }
}
