import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Inject,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { KeyWord } from './schemas/keyword.schema';
import { CreateKeyWordDto } from './dto/create-keyword.dto';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './schemas/article.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { Tip } from './schemas/tip.schema';

@ApiTags('challenge')
@ApiBearerAuth('accessToken')
@Controller('challenge')
@UseGuards(AuthGuard())
export class ChallengeController {
  constructor(
    private challengeService: ChallengeService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: '글감 랜덤 제공, 챌린지 여부 확인 API',
    description:
      '매일 다른 글감을 랜덤으로 제공(조회)하고, 챌린지 여부를 확인한다.',
  })
  @ApiResponse({
    status: 200,
    description: '글감 조회 성공, 해당 글감에 해당하는 챌린지 여부 확인',
  })
  async getChallenge(@GetUser() user: User): Promise<any[]> {
    return await this.challengeService.getRandom(user);
  }

  @Get('article')
  @ApiOperation({
    summary: '챌린지 글 작성 페이지',
    description: '챌린지 글 작성페이지에서 글쓰기 팁을 조회하고 글을 작성한다.',
  })
  @ApiResponse({
    status:200,
    type:Tip
  })
  async getTip(@GetUser() user: User): Promise<any> {
    //@GetUser안 붙여주면 실행 안 됨
    return await this.challengeService.findTip();
  }

  @Post('/article')
  @ApiOperation({
    summary: '챌린지 글 저장 API',
    description: '오늘의 키워드를 보고 챌린지 글을 저장한다.',
  })
  @ApiResponse({
    status: 201,
    description: 'state=true, 챌린지 성공',
    type: Article,
  })
  @ApiBody({ type: CreateArticleDto })
  @UsePipes(ValidationPipe)
  async addArticle(
    @GetUser() user: User,
    @Body() createArticleDto: CreateArticleDto,
    @Res() res,
  ): Promise<Article> {
    try {
      const article = await this.challengeService.addArticle(
        user,
        createArticleDto,
      );
      return res.status(HttpStatus.OK).json(article);
    } catch (e) {
      this.logger.error('챌린지 글 등록 ERR ' + e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Post('/article/temp')
  @ApiOperation({
    summary: '챌린지 글 임시저장 API',
    description: '챌린지 글을 임시저장한다.',
  })
  @ApiResponse({
    status: 201,
    description: 'state=false, 임시저장 (챌린지 성공X)',
  })
  @ApiBody({ type: CreateArticleDto })
  tempArticle(
    @GetUser() user: User,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return this.challengeService.tempArticle(user, createArticleDto);
  }

  @Get('/keyword')
  @ApiOperation({
    summary: '글감 조회 (개발용)',
    description: '현재 DB에 입력된 모든 글감을 조회한다.',
  })
  @ApiResponse({
    status: 200,
    type:KeyWord 
  })
  getKeyWord(): Promise<KeyWord[]> {
    return this.challengeService.getKeyWord();
  }

  @Post('/keyword')
  @ApiOperation({
    summary: '글감 등록 (개발용)',
    description: 'DB에 글감을 등록한다.',
  })
  @ApiBody({ type: CreateKeyWordDto })
  addKeyWord(@Body() createKeyWordDto: CreateKeyWordDto): Promise<KeyWord> {
    return this.challengeService.addKeyWord(createKeyWordDto);
  }

  // @Get('/article')
  // @ApiOperation({
  //   summary: '챌린지 글 조회(개발 중)',
  //   description: '쓰여진 모든 챌린지 글 조회',
  // })
  // getArticle(): Promise<Article[]> {
  //   return this.challengeService.getAllArticle();
  // }

  // @Get('/article/:id')
  // @ApiOperation({
  //   summary: '특정 챌린지 글 조회 API',
  //   description: '특정 글 하나의 상세페이지를 조회한다.',
  // })
  // getOneArticle(@Param('id') id: string): Promise<Article> {
  //   return this.challengeService.getOneArticle(id);
  // }

  // @Delete('/article/:id')
  // @ApiOperation({
  //   summary: '특정 챌린지 글 삭제 API',
  //   description: '특정 글을 삭제한다.',
  // })
  // deleteArticle(@Param('id') id: string): Promise<any> {
  //   return this.challengeService.deleteArticle(id);
  // }
}
