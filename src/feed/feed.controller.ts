import { Controller, Get, Param, Body, Post, Delete, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateArticleDto } from 'src/challenge/dto/create-article.dto';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { Article } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ScrapDto } from './dto/scrap.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FeedService } from './feed.service';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  @ApiOperation({
    summary: '피드 조회 API',
    description: '공개 설정된 모든 글들을 조회한다.',
  })
  getAllArticle(): Promise<Article[]> {
    return this.feedService.getAllArticle();
  }

  @Get('/:articleId')
  @ApiOperation({
    summary: '피드 글 상세페이지 조회 API',
    description: '피드의 특정 글 1개의 상세페이지를 조회한다.',
  })
  getOneArticle(@Param('articleId') articleId: string): Promise<any[]> {
    return this.feedService.getOneArticle(articleId);
  }

  @Delete('/:articleId')
  @ApiOperation({
    summary: '피드 글 삭제 API',
    description: '(자신의 글일 경우) 글을 삭제한다.',
  })
  deleteArticle(@Param('articleId') articleId: string): Promise<any> {
    return this.feedService.deleteArticle(articleId);
  }

  @Patch('/:articleId')
  @ApiOperation({
    summary: '피드 글 수정 API',
    description:'(자신의 글일 경우) 글을 수정한다.'
  })
  @ApiBody({ type: CreateArticleDto })
  updateArticle(@Param('articleId') articleId: string, @Body() updateArticleDto:UpdateArticleDto): Promise<Article> {
    return this.feedService.updateArticle(articleId, updateArticleDto);
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

  @Patch('/comment/:commentId')
  @ApiOperation({
    summary: '댓글 수정 API',
    description: '글 상세페이지에서 댓글을 수정한다.',
  })
  @ApiBody({ type: CreateCommentDto })
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.feedService.updateComment(commentId, updateCommentDto);
  }

  @Delete('/comment/:commentId')
  @ApiOperation({
    summary: '댓글 삭제 API',
    description: '댓글을 삭제한다.',
  })
  deleteComment(@Param('commentId') commentId: string): Promise<any> {
    return this.feedService.deleteComment(commentId);
  }

  @Post('/scrap/:articleId')
  @ApiOperation({
    summary: '스크랩 API',
    description: '특정 글을 스크랩한다',
  })
  addScrap(
    @Param('articleId') articleId: string,
    @Body() scrapDto: ScrapDto
  ): Promise<Scrap> {
    return this.feedService.saveScrap(articleId, scrapDto);
  }

  @Delete('/scrap/:articleId')
  @ApiOperation({
    summary: '스크랩 취소 API',
    description: '스크랩을 취소한다.',
  })
  deleteScrap(@Param('articleId') articleId: string): Promise<any> {
    return this.feedService.deleteScrap(articleId);
  }
}
