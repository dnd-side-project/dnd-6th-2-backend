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
import { ChallengeService } from 'src/challenge/challenge.service';

@ApiTags('my-article')
@ApiBearerAuth('accessToken')
@Controller('my-article')
@UseGuards(AuthGuard())
export class MyArticleController {
  constructor(
    private myArticleService: MyArticleService,
    private challengeService: ChallengeService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: '나의 글 조회 API',
    description: '저장 완료된 나의 글들을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 Article 객체 배열을 반환합니다.',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  async getMyArticle(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<Article[]> {
    try {
      const articles: Article[] = await this.myArticleService.findMyArticle(
        user,
        query.cursor,
      );
      if (articles.length === 0) {
        return res
          .status(HttpStatus.OK)
          .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
      } else {
        const last = articles[articles.length - 1];
        const next_cursor = `${last._id}`;
        return res.status(HttpStatus.OK).json({ articles, next_cursor });
      }
    } catch (e) {
      this.logger.error('나의 글 전체 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Post('/free')
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

  @Get('free')
  @ApiOperation({
    summary: '글쓰기 팁 및 유저의 카테고리 조회',
    description: '글쓰기 팁과 유저가 만든 카테고리들을 조회한다.',
  })
  async getTipAndCategory(@GetUser() user: User, @Res() res): Promise<any> {
    const tip = await this.challengeService.getTip();
    const category = await this.challengeService.getCategory(user);
    res.status(HttpStatus.OK).json({ tip, category });
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
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  async getMyArticleTemp(
    @GetUser() user: User,
    @Query() query,
    @Res() res,
  ): Promise<Article[]> {
    try {
      const articles: Article[] = await this.myArticleService.findMyArticleTemp(
        user,
        query.cursor,
      );
      if (articles.length === 0) {
        return res
          .status(HttpStatus.OK)
          .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
      } else {
        const last = articles[articles.length - 1];
        const next_cursor = `${last._id}`;
        return res.status(HttpStatus.OK).json({ articles, next_cursor });
      }
    } catch (e) {
      this.logger.error('임시보관함 조회 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
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
    @GetUser() user: User,
    @Param('articleId') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return await this.myArticleService.updateMyArticle(
      user,
      articleId,
      updateArticleDto,
    );
  }

  @Delete('/:articleId')
  @ApiOperation({
    summary: '나의 글 삭제 API',
    description: '나의 글들을 삭제하고 삭제 개수를 반환합니다.',
  })
  async deleteArticle(
    @GetUser() user: User,
    @Param('articleId') articleId: [string],
  ): Promise<any> {
    return await this.myArticleService.deleteMyArticle(user, articleId);
  }
}
