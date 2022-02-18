import {
  HttpStatus,
  Controller,
  Get,
  Param,
  Body,
  Post,
  Delete,
  Patch,
  Query,
  UseGuards,
  Res,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateArticleDto } from 'src/challenge/dto/create-article.dto';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { Article } from 'src/challenge/schemas/article.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ScrapDto } from './dto/scrap.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FeedService } from './feed.service';
import { Comment } from './schemas/comment.schema';
import { Scrap } from './schemas/scrap.schema';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Like } from './schemas/like.schema';
import { OrderBy } from './feed.service';
import { History } from './schemas/history.schema';

@ApiBearerAuth('accessToken')
@Controller('feed')
@UseGuards(AuthGuard())
export class FeedController {
  constructor(
    private feedService: FeedService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiTags('feed')
  @Get()
  @ApiOperation({
    summary: '전체 피드 조회 API',
    description: '공개 설정된 모든 글들을 조회한다.',
  })
  @ApiQuery({
    name: 'tags',
    type: Array,
    description: '필터링을 하기 위한 태그 목록',
    required: false,
  })
  @ApiQuery({
    name: 'orderBy',
    enum: OrderBy,
    description: '정렬 기준 (default: 최신순)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '피드의 Article 객체 배열과 함께 다음 페이지 요청을 위한 next_cursor 를 반환합니다. next_cursor 가 null 이면, 더 이상의 페이지는 없습니다.',
  })
  async getMainFeed(@Query() query, @Res() res): Promise<Article[]> {
    try {
      const articles = await this.feedService.mainFeed(query);
      if(articles.length === 0){
        return res.status(HttpStatus.OK).json({message:'더 이상의 페이지는 존재하지 않습니다.'}
        )
      }
      else{
        const last = articles[articles.length -1];
        const next_cursor = `${last._id}_${last.likeNum}`;
        return res.status(HttpStatus.OK).json({ articles, next_cursor });
      }
    } catch (e) {
      this.logger.error('피드 전체 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/subscribe')
  @Get('/subscribe')
  @ApiOperation({
    summary: '구독 피드 조회 API',
    description: '구독한 작가들의 글과 구독목록을 조회한다.(업데이트순)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '구독한 작가들의 Article 객체 배열과 구독한 작가들의 user 객체 배열(subscribeUserList)을 반환합니다.',
  })
  async getSubFeedAll(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<any[]> {
      try {
        const subscribeUserList: any[] = await this.feedService.findAllSubUser(
          user,
        );
        const articles = await this.feedService.getSubFeedAll(user, query.cursor);
        if(articles.length === 0){
          return res.status(HttpStatus.OK).json({subscribeUserList, message:'더 이상의 페이지는 존재하지 않습니다.'}
          )
        }
        else{
          const last = articles[articles.length -1];
          const next_cursor = `${last._id}`;
          return res.status(HttpStatus.OK).json({ articles, subscribeUserList, next_cursor });
        }
      } catch (e) {
        this.logger.error('피드 전체 조회 ERR ' + e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
      }
    }

  @ApiTags('feed/subscribe')
  @Get('/subscribe/authorlist')
  @ApiOperation({
    summary: '구독한 작가들 전체목록 조회 API',
    description: '구독한 작가들 목록 전체를 조회한다.',
  })
  async getAllSubUser(@GetUser() user: User, @Res() res): Promise<User[]> {
    try {
      const authors = await this.feedService.findAllSubUser(user);
      return res.status(HttpStatus.OK).json(authors);
    } catch (e) {
      this.logger.error('구독한 작가 전체 목록 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/subscribe')
  @Get('/subscribe/:authorId')
  @ApiOperation({
    summary: '특정 구독작가의 글만 조회 API',
    description: '특정 구독 작가의 글과 나의 구독목록을 조회한다.(업데이트순)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiParam({
    name: 'authorId',
    description: '구독작가의 id',
  })
  @ApiResponse({
    status: 200,
    description:
      '특정 구독 작가의 Article 객체 배열과 구독한 작가들의 user 객체 배열(subscribeUserList)을 반환합니다.',
  })
  async getSubFeedOne(
    @GetUser() user: User,
    @Query() query,
    @Param('authorId') authorId: string,
    @Res() res,
  ): Promise<any[]> {
    try {
      const check = await this.feedService.findSubUser(user, authorId);
      const subscribeUserList: any[] = await this.feedService.findAllSubUser(
        user,
      );
      if (check.length == 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '구독한 작가가 아닙니다.' });
      }
      else{
        const articles = await this.feedService.getSubFeedOne(authorId, query.cursor);
        if(articles.length === 0){
          return res.status(HttpStatus.OK).json({message:'더 이상의 페이지는 존재하지 않습니다.'}
          )
        }
        else{
          const last = articles[articles.length -1];
          const next_cursor = `${last._id}`;
          return res.status(HttpStatus.OK).json({ articles, subscribeUserList, next_cursor });
        }
      }
    } catch (e) {
      this.logger.error('특정 구독 작가 글만 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/subscribe')
  @Patch('subscribe/:authorId')
  @ApiOperation({
    summary: '구독하기 API',
    description: '작가를 구독한다.',
  })
  @ApiParam({
    name: 'authorId',
    description: '구독할 작가(글쓴이)의 id',
  })
  async subUser(
    @GetUser() user: User,
    @Param('authorId') authorId: string,
    @Res() res,
  ): Promise<any> {
    try {
      const check = await this.feedService.findSubUser(user, authorId);
      if (check.length != 0) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '이미 구독한 작가입니다.' });
      } else {
        const subscribe = await this.feedService.subUser(user, authorId);
        res.status(HttpStatus.OK).json(subscribe);
      }
    } catch (e) {
      this.logger.error('구독 ERR ' + e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/subscribe')
  @Patch('subscribe/:authorId/cancel')
  @ApiOperation({
    summary: '구독 취소 API',
    description: '구독을 취소한다.',
  })
  @ApiParam({
    name: 'authorId',
    description: '구독을 취소할 작가(글쓴이)의 id',
  })
  async updateSubUser(
    @GetUser() user: User,
    @Param('authorId') authorId: string,
    @Res() res,
  ): Promise<any> {
    try {
      const check = await this.feedService.findSubUser(user, authorId);
      if (check.length == 0) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '구독한 작가가 아닙니다.' });
      } else {
        await this.feedService.updateSubUser(user, authorId);
        res.status(HttpStatus.OK).json({ message: '구독 취소 성공' });
      }
    } catch (e) {
      this.logger.error('구독 취소 ERR ' + e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/search')
  @Get('/search')
  @ApiOperation({
    summary: '피드에서 검색하기',
    description: '제목, 내용, 제목+내용으로 검색한다.',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiQuery({
    name: 'option',
    description:
      '제목(title),내용(content),제목+내용(title+content) 조건을 주는 쿼리',
  })
  @ApiQuery({
    name: 'orderBy',
    enum: OrderBy,
    description: '정렬 기준 (default: 최신순)',
  })
  @ApiResponse({
    status: 200,
    description:
      '검색 결과의 Article 객체 배열과 next_cursor 반환',
  })
  @ApiQuery({ name: 'content', description: '검색할 내용' })
  async searchArticle(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<any[]> {
    try {
      await this.feedService.saveHistory(user, query.content);
      const articles = await this.feedService.searchArticle(
        query
      );
      if(articles.length === 0){
        return res.status(HttpStatus.OK).json({message: '검색 결과가 없습니다.'})
      }
      else{
        const last = articles[articles.length-1];
        const next_cursor =`${last._id}_${last.likeNum}`;
        return res.status(HttpStatus.OK).json({ articles, next_cursor });
      }
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/search')
  @Get('/search/history')
  @ApiOperation({
    summary: '검색창에서 최근 검색어 보기',
    description: '최근 검색어를 10개까지 조회한다.',
  })
  @ApiResponse({
    status:200,
    type:History
  })
  async findHistory(@GetUser() user: User, @Res() res): Promise<any[]> {
    try {
      const histories = await this.feedService.findHistory(user);
      return res.status(HttpStatus.OK).json(histories);
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  //최근 검색어 삭제
  @ApiTags('feed/search')
  @Delete('/search/history/:historyId')
  @ApiOperation({
    summary: '검색창에서 최근 검색어 삭제하기',
    description: '최근 검색어를 삭제한다.',
  })
  @ApiParam({
    name: 'historyId',
    description: '삭제할 검색어의 ID',
  })
  async deleteHistory(
    @GetUser() user: User,
    @Param('historyId') historyId: string,
    @Res() res,
  ): Promise<any> {
    try {
      await this.feedService.findOneHistory(user, historyId);
      return res
        .status(HttpStatus.OK)
        .json({ message: '검색어가 삭제되었습니다.' });
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed')
  @Get('/:articleId')
  @ApiOperation({
    summary: '피드 글 상세페이지 조회 API',
    description: '피드의 특정 글 1개의 상세페이지를 조회한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '상세 페이지를 조회할 글의 id',
  })
  getOneArticle(@Param('articleId') articleId: string): Promise<Article> {
    return this.feedService.getOneArticle(articleId);
  }

  @ApiTags('feed')
  @Delete('/:articleId')
  @ApiOperation({
    summary: '피드 글 삭제 API',
    description: '(자신의 글일 경우) 글을 삭제한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '삭제할 글의 id',
  })
  async deleteArticle(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Res() res,
  ): Promise<any[]> {
    try {
      const article = await this.feedService.getOneArticle(articleId);
      if (JSON.stringify(article.user._id) == JSON.stringify(user._id)) {
        await this.feedService.deleteArticle(user, articleId);
        return res.status(HttpStatus.OK).json({ message: '삭제 완료' });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '삭제 권한이 없습니다.' });
      }
    } catch (e) {
      this.logger.error('피드 글 삭제 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e });
    }
  }

  @ApiTags('feed')
  @Patch('/:articleId')
  @ApiOperation({
    summary: '피드 글 수정 API',
    description: '(자신의 글일 경우) 글을 수정한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '수정할 글의 id',
  })
  @ApiBody({ type: CreateArticleDto })
  async updateArticle(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Res() res,
  ): Promise<Article> {
    try {
      const article = await this.feedService.getOneArticle(articleId);
      if (JSON.stringify(article.user._id) == JSON.stringify(user._id)) {
        const updateArticle = await this.feedService.updateArticle(
          articleId,
          updateArticleDto,
        );
        return res.status(HttpStatus.OK).json(updateArticle);
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '수정 권한이 없습니다.' });
      }
    } catch (e) {
      this.logger.error('피드 글 수정 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e });
    }
  }

  @ApiTags('feed/{articleId}/comment')
  @Post('/:articleId/comment')
  @ApiOperation({
    summary: '댓글 작성 API',
    description: '글 상세페이지에서 댓글을 작성한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '댓글을 작성하는 글의 아이디',
  })
  @ApiResponse({
    status: 201,
    type: Comment,
  })
  addComment(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.feedService.addComment(user, articleId, createCommentDto);
  }

  @ApiTags('feed/{articleId}/comment')
  @Patch('/:articleId/comment/:commentId')
  @ApiOperation({
    summary: '댓글 수정 API',
    description: '글 상세페이지에서 댓글을 수정한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '수정할 댓글이 작성된 글의 아이디',
  })
  @ApiParam({
    name: 'commentId',
    description: '수정하려는 댓글의 아이디',
  })
  @ApiBody({ type: CreateCommentDto })
  async updateComment(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Res() res,
  ): Promise<Comment> {
    try {
      const comment = await this.feedService.findComment(commentId);
      if (JSON.stringify(comment.user) == JSON.stringify(user._id)) {
        const updateComment = await this.feedService.updateComment(
          articleId,
          commentId,
          updateCommentDto,
        );
        return res.status(HttpStatus.OK).json(updateComment);
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '수정 권한이 없습니다.' });
      }
    } catch (e) {
      this.logger.error('댓글 수정 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed/{articleId}/comment')
  @Delete('/:articleId/comment/:commentId')
  @ApiOperation({
    summary: '댓글 삭제 API',
    description: '댓글을 삭제한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '삭제할 댓글이 작성된 글의 아이디',
  })
  @ApiParam({
    name: 'commentId',
    description: '삭제하려는 댓글의 아이디',
  })
  async deleteComment(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Param('commentId') commentId: string,
    @Res() res,
  ): Promise<any> {
    try {
      const comment = await this.feedService.findComment(commentId);
      if (JSON.stringify(comment.user) == JSON.stringify(user._id)) {
        await this.feedService.deleteComment(articleId, commentId);
        return res.status(HttpStatus.OK).json({ message: '삭제 완료' });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '삭제 권한이 없습니다.' });
      }
    } catch (e) {
      this.logger.error('댓글 삭제 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed')
  @Post('/:articleId/scrap')
  @ApiOperation({
    summary: '스크랩 API',
    description: '특정 글을 스크랩한다',
  })
  @ApiParam({
    name: 'articleId',
    description: '스크랩할 글의 id',
  })
  @ApiResponse({
    status: 201,
    type: Scrap,
  })
  async addScrap(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() scrapDto: ScrapDto,
    @Res() res,
  ): Promise<Scrap> {
    try {
      const check = await this.feedService.findScrap(user, articleId);
      if (check.length != 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '이미 스크랩한 글입니다.' });
      } else {
        const scrap = await this.feedService.saveScrap(
          user,
          articleId,
          scrapDto,
        );
        return res.status(HttpStatus.OK).json(scrap);
      }
    } catch (e) {
      this.logger.error('스크랩 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed')
  @Delete('/:articleId/scrap')
  @ApiOperation({
    summary: '스크랩 취소 API',
    description: '스크랩을 취소한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '스크랩을 취소할 글의 id',
  })
  async deleteScrap(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Res() res,
  ): Promise<any> {
    try {
      const check = await this.feedService.findScrap(user, articleId);
      if (check.length != 0) {
        await this.feedService.deleteScrap(user, articleId);
        return res.status(HttpStatus.OK).json({ message: '스크랩 취소 성공!' });
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '스크랩한 글이 아닙니다.' });
      }
    } catch (e) {
      this.logger.error('스크랩 취소 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed')
  @Post('/:articleId/like')
  @ApiOperation({
    summary: '좋아요 API',
    description: '특정 글에 좋아요를 한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '좋아요 할 글의 id',
  })
  @ApiResponse({
    status: 201,
    type: Like,
  })
  async addLike(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() scrapDto: ScrapDto,
    @Res() res,
  ): Promise<Like> {
    try {
      const check = await this.feedService.findLike(user, articleId);
      if (check.length != 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '이미 좋아요한 글입니다.' });
      } else {
        const like = await this.feedService.saveLike(user, articleId, scrapDto);
        return res.status(HttpStatus.OK).json(like);
      }
    } catch (e) {
      this.logger.error('좋아요 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @ApiTags('feed')
  @Delete('/:articleId/like')
  @ApiOperation({
    summary: '좋아요 취소 API',
    description: '좋아요를 취소한다.',
  })
  @ApiParam({
    name: 'articleId',
    description: '좋아요를 취소할 글의 id',
  })
  async deleteLike(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Res() res,
  ): Promise<any> {
    try {
      const check = await this.feedService.findLike(user, articleId);
      if (check.length != 0) {
        await this.feedService.deleteLike(user, articleId);
        return res.status(HttpStatus.OK).json({ message: '좋아요 취소 성공!' });
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '좋아요한 글이 아닙니다.' });
      }
    } catch (e) {
      this.logger.error('좋아요취소 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }
}
