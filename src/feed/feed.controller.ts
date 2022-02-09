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
  Inject
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('feed')
@ApiBearerAuth('accessToken')
@Controller('feed')
@UseGuards(AuthGuard())
export class FeedController {
  constructor(private feedService: FeedService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  @Get()
  @ApiOperation({
    summary: '피드 조회 API',
    description: '공개 설정된 모든 글들을 조회한다.',
  })
  @ApiQuery({ name: 'page', description: '페이지 넘버(한 페이지 당 글 10개)', example:1 })
  async getAllArticle(@Query() query, @Res() res): Promise<Article[]> {
    try{
      if(query.page < 1){
        return res.status(HttpStatus.BAD_REQUEST).json({message:'없는 페이지 입니다.'})
      }
      else{
        const article:Article[] = await this.feedService.getAllArticle(query.page);
        return res.status(HttpStatus.OK).json(article)
      }
    }catch(e){
      this.logger.error("피드 전체 조회 ERR " + e)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e)
    }
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
  async deleteArticle(@GetUser() user: User, @Param('articleId') articleId: string, @Res() res,): Promise<any[]> {
    try{
      const article = await this.feedService.getOneArticle(articleId)
      if(JSON.stringify(article[0].user) == JSON.stringify(user._id)){
        await this.feedService.deleteArticle(articleId);
        return res.status(HttpStatus.OK).json({message:"삭제 완료"})
      }
      else{
        return res.status(HttpStatus.BAD_REQUEST).json({message:"삭제 권한이 없습니다."})
      }
    }catch(e){
      this.logger.error("피드 글 삭제 ERR " + e)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    }
  }

  @Patch('/:articleId')
  @ApiOperation({
    summary: '피드 글 수정 API',
    description: '(자신의 글일 경우) 글을 수정한다.',
  })
  @ApiBody({ type: CreateArticleDto })
  async updateArticle(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Res() res
  ): Promise<Article> {
    try{
      const article = await this.feedService.getOneArticle(articleId)
      if(JSON.stringify(article[0].user) == JSON.stringify(user._id)){
        const updateArticle = await this.feedService.updateArticle(articleId, updateArticleDto);
        return res.status(HttpStatus.OK).json(updateArticle)
      }
      else{
        return res.status(HttpStatus.BAD_REQUEST).json({message:"수정 권한이 없습니다."})
      }
    }catch(e){
      this.logger.error("피드 글 수정 ERR " + e)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e })
    }
  }

  @Post('/comment/:articleId')
  @ApiOperation({
    summary: '댓글 작성 API',
    description: '글 상세페이지에서 댓글을 작성한다.',
  })
  addComment(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.feedService.addComment(user, articleId, createCommentDto);
  }

  @Patch('/comment/:commentId')
  @ApiOperation({
    summary: '댓글 수정 API',
    description: '글 상세페이지에서 댓글을 수정한다.',
  })
  @ApiBody({ type: CreateCommentDto })
  async updateComment(
    @GetUser() user: User,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Res() res
  ): Promise<Comment> {
    try{
      const comment = await this.feedService.findComment(commentId);
      if(JSON.stringify(comment.user) == JSON.stringify(user._id)){
        const updateComment = await this.feedService.updateComment(commentId, updateCommentDto);
        return res.status(HttpStatus.OK).json(updateComment)
      }
      else{
        return res.status(HttpStatus.BAD_REQUEST).json({message:"수정 권한이 없습니다."})
      }
    }catch(e){
      this.logger.error("댓글 수정 ERR " + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e)
    }
  }

  @Delete('/comment/:commentId')
  @ApiOperation({
    summary: '댓글 삭제 API',
    description: '댓글을 삭제한다.',
  })
  async deleteComment(@GetUser()user:User, @Param('commentId') commentId: string, @Res() res): Promise<any> {
    try{
      const comment = await this.feedService.findComment(commentId);
      if(JSON.stringify(comment.user) == JSON.stringify(user._id)){
        await this.feedService.deleteComment(commentId);
        return res.status(HttpStatus.OK).json({message: "삭제 완료"});
      }
      else{
        return res.status(HttpStatus.BAD_REQUEST).json({message:"삭제 권한이 없습니다."})
      }
    }catch(e){
      this.logger.error("댓글 삭제 ERR " + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e)
    }
  }

  @Post('/scrap/:articleId')
  @ApiOperation({
    summary: '스크랩 API',
    description: '특정 글을 스크랩한다',
  })
  async addScrap(
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() scrapDto: ScrapDto,
    @Res() res
  ): Promise<Scrap> {
    try{
      const check = await this.feedService.findScrap(user, articleId);
      if(check.length != 0){
        return res.status(HttpStatus.BAD_REQUEST).json({message: "이미 스크랩한 글입니다."})
      }
      else{
        const scrap = await this.feedService.saveScrap(user, articleId, scrapDto);
        return res.status(HttpStatus.OK).json(scrap)
      }
    }catch(e){
      this.logger.error("스크랩 ERR " + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e)

    }
  }

  @Delete('/scrap/:articleId')
  @ApiOperation({
    summary: '스크랩 취소 API',
    description: '스크랩을 취소한다.',
  })
  async deleteScrap(@GetUser() user: User, @Param('articleId') articleId: string, @Res() res): Promise<any> {
    try{
      const check = await this.feedService.findScrap(user, articleId);
      if(check.length != 0){
        await this.feedService.deleteScrap(user,articleId)
        return res.status(HttpStatus.OK).json({message: "스크랩 취소 성공!"})
      }
      else{
        return res.status(HttpStatus.NOT_FOUND).json({message: "스크랩한 글이 아닙니다."})
      }
    }catch(e){
      this.logger.error("스크랩 취소 ERR " + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
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
