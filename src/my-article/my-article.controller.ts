import {
  Controller,
  UseGuards,
  Logger,
  Inject,
  Get,
  Param,
  Patch,
  Body,
  Query,
  Res,
  HttpStatus,
  Delete,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MyArticleService } from './my-article.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { Article } from 'src/challenge/schemas/article.schema';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';
import { CreateArticleDto } from 'src/challenge/dto/create-article.dto';

@ApiTags('my-article')
@ApiBearerAuth('accessToken')
@Controller('my-article')
@UseGuards(AuthGuard())
export class MyArticleController {
  constructor(
    private myArticleService: MyArticleService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: '나의 글 조회 API',
    description: '저장 완료된 나의 글들을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiQuery({
    name: 'lastArticleId',
    type: String,
    description: '마지막 글 아이디(처음에는 null값 보냄)',
    required: false,
  })
  async getMyArticle(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<Article[]> {
    try {
      const articles: Article[] = await this.myArticleService.findMyArticle(
        user,
        query.lastArticleId,
      );
      const last = articles[articles.length - 1]._id;
      const nextArticle = await this.myArticleService.findMyArticleNext(
        user,
        last,
      );
      return res.status(HttpStatus.OK).json({ articles, nextArticle });
    } catch (e) {
      this.logger.error('나의 글 전체 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Post()
  @ApiOperation({
    summary: '자유 글쓰기 API',
    description: '자유 글쓰기를 작성하고 공개글로 게시합니다.',
  })
  @ApiBody({ type: CreateArticleDto })
  async saveMyArticle(
    @GetUser() user: User,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return await this.myArticleService.saveMyArticle(user, createArticleDto);
  }

  @Post('/temp')
  @ApiOperation({
    summary: '자유 글쓰기 임시저장 API',
    description: '자유 글쓰기를 작성하고 임시 저장합니다.',
  })
  @ApiBody({ type: CreateArticleDto })
  async saveMyArticleTemp(
    @GetUser() user: User,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return await this.myArticleService.saveMyArticleTemp(
      user,
      createArticleDto,
    );
  }

  @Get('/temp')
  @ApiOperation({
    summary: '임시보관함 조회 API',
    description: '임시저장된 글들을 조회합니다.',
  })
  @ApiQuery({
    name: 'lastArticleId',
    type: String,
    description: '마지막 글 아이디(처음에는 null값 보냄)',
    required: false,
  })
  async getMyArticleTemp(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<Article[]> {
    try {
      const articles: Article[] = await this.myArticleService.findMyArticleTemp(
        user,
        query.lastArticleId,
      );
      const last = articles[articles.length - 1]._id;
      const nextArticle = await this.myArticleService.findTempArticleNext(
        user,
        last,
      );
      return res.status(HttpStatus.OK).json({ articles, nextArticle });
    } catch (e) {
      this.logger.error('임시보관함 조회 ERR ' + e);
      if (e instanceof TypeError) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: '임시저장된 게시글이 없습니다.' });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
      }
    }
  }

  @Get('/:articleId')
  @ApiOperation({
    summary: '나의 글 상세 조회 API',
    description: '저장 완료된 나의 글의 상세페이지를 조회합니다.',
  })
  async getMyArticleOne(
    @Param('articleId') articleId: string,
    @Res() res,
  ): Promise<Article> {
    try {
      const article = await this.myArticleService.findMyArticleOne(articleId);
      return res.status(HttpStatus.OK).json({ article });
    } catch (e) {
      this.logger.error('나의 글 상세 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Patch('/:articleId')
  @ApiOperation({
    summary: '나의 글 수정 API',
    description: '나의 글을 수정합니다.',
  })
  @ApiBody({ type: CreateArticleDto })
  async updateMyArticle(
    @Param('articleId') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    console.log(articleId.length)
    return await this.myArticleService.updateMyArticle(
      articleId,
      updateArticleDto,
    );
  }

  @Delete('/:articleId')
  @ApiOperation({
    summary: '나의 글 삭제 API',
    description: '나의 글을 삭제합니다.',
  })
  async deleteArticle(
    @GetUser() user: User,
    @Param('articleId') articleId: [String]
  ): Promise<any> {
    return await this.myArticleService.deleteMyArticle(user, articleId);
  }
}
