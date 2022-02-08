import { Controller, Get, Param, Body, Post, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Article } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedService } from './feed.service';
import { Comment } from './schemas/comment.schema';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  @ApiOperation({
    summary: '피드 조회 API',
    description: '공개 설정된 모든 글들을 조회한다.',
  })
  getAllFeed(): Promise<Article[]> {
    return this.feedService.getAllFeed();
  }

  @Get('/:articleId')
  @ApiOperation({
    summary: '피드 글 상세페이지 조회 API',
    description: '피드의 특정 글 1개의 상세페이지를 조회한다.',
  })
  getOneFeed(@Param('articleId') articleId: string): Promise<any[]> {
    return this.feedService.getOneFeed(articleId);
  }

  @Delete('/:articleId')
  @ApiOperation({
    summary: '피드 글 삭제 API',
    description: '(자신의 글일 경우) 글을 삭제한다.',
  })
  deleteArticle(@Param('articleId') articleId: string): Promise<any> {
    return this.feedService.deleteArticle(articleId);
  }

  @Post('/comment/:articleId')
  @ApiOperation({
    summary: '댓글 작성 API',
    description: '글 상세페이지에서 댓글을 작성한다.',
  })
  addComment(
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.feedService.addComment(articleId, createCommentDto);
  }
}
