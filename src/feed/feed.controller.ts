import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
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

  @Get('/search')
  @ApiOperation({
    summary: '피드에서 검색하기',
    description: '제목, 내용, 제목+내용으로 검색한다.',
  })
  @ApiQuery({
    name: 'option',
    description:
      '제목(title),내용(content),제목+내용(title+content) 조건을 주는 쿼리',
  })
  @ApiQuery({ name: 'content', description: '검색할 내용' })
  searchArticle(@Query() query): Promise<Article[]> {
    return this.feedService.searchArticle(query.option, query.content);
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
    description: '(자신의 글일 경우) 글을 수정한다.',
  })
  @ApiBody({ type: CreateArticleDto })
  updateArticle(
    @Param('articleId') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
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
    @Body() scrapDto: ScrapDto,
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

  @Post('/like/:articleId')
  @ApiOperation({
    summary: '좋아요 API',
    description: '특정 글에 좋아요를 한다.',
  })
  addLike(@Param('articleId') articleId: string): Promise<Scrap> {
    return this.feedService.saveLike(articleId);
  }

  @Delete('/like/:articleId')
  @ApiOperation({
    summary: '좋아요 취소 API',
    description: '좋아요를 취소한다.',
  })
  deleteLike(@Param('articleId') articleId: string): Promise<any> {
    return this.feedService.deleteLike(articleId);
  }
}
