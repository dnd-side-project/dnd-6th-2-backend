import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Category } from 'src/auth/schemas/category.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Article } from 'src/challenge/schemas/article.schema';
import { Scrap } from 'src/feed/schemas/scrap.schema';
import { MessageResDto } from 'src/relay/dto/response.dto';
import { CategoryDto } from './dto/category.dto';
import {
  GetMyPageArticleResDto,
  GetMyPageScrapResDto,
} from './dto/response.dto';
import { MyPageService } from './my-page.service';

@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard())
@Controller('my-page')
export class MyPageController {
  constructor(private readonly myPageService: MyPageService) {}

  @ApiTags('my-page')
  @ApiOperation({
    summary: '마이 페이지(메인)를 조회하기 위한 엔드포인트입니다',
    description:
      '닉네임, 자기소개, 글 개수, 팔로워 수, 팔로잉 수 그리고 각 카테고리별 글/스크랩의 수 등을 반환합니다',
  })
  @ApiResponse({
    status: 200,
    type: User,
    description: '마이 페이지 조회 성공',
  })
  @Get()
  async getProfileWithArticle(@GetUser() user: User, @Res() res: Response) {
    const profile = await this.myPageService.findUserById(user._id);
    return res.status(HttpStatus.OK).json(profile);
  }

  @ApiTags('my-page')
  @ApiOperation({
    summary: '글 전체를 조회하기 위한 엔드포인트입니다',
    description:
      '공개된 글 전체의 리스트(공개된 자유글, 공개된 챌린지글, 공개된 릴레이글)를 반환합니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    type: GetMyPageArticleResDto,
    description: '마이 페이지 글 조회 성공',
  })
  @Get('/article')
  async getAllArticles(
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const articles = await this.myPageService.getAllArticles(cursor, user);
    if (articles.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = articles[articles.length - 1];
      const next_cursor = last._id;
      return res.status(HttpStatus.OK).json({ articles, next_cursor });
    }
  }

  @ApiTags('my-page')
  @ApiOperation({
    summary: '유저의 팔로워 전체를 조회하기 위한 엔드포인트입니다',
    description: '해당 유저를 구독하는 팔로워 전체를 반환합니다',
  })
  @ApiResponse({
    status: 200,
    type: [User],
    description: '마이 페이지 팔로워 조회 성공',
  })
  @Get('/follower')
  async getFollowers(@GetUser() user: User, @Res() res: Response) {
    const followers = await this.myPageService.getFollowers(user);
    return res.status(HttpStatus.OK).json(followers);
  }

  @ApiTags('my-page')
  @ApiOperation({
    summary: '유저의 팔로잉 전체를 조회하기 위한 엔드포인트입니다',
    description: '해당 유저가 구독하는 팔로잉 전체를 반환합니다',
  })
  @ApiResponse({
    status: 200,
    type: [User],
    description: '마이 페이지 팔로잉 조회 성공',
  })
  @Get('/following')
  async getFollowings(@GetUser() user: User, @Res() res: Response) {
    const profile = await this.myPageService.findUserById(user._id);
    return res.status(HttpStatus.OK).json(profile.subscribeUser);
  }

  @ApiTags('my-page/category')
  @ApiOperation({
    summary: '사용자의 모든 카테고리를 조회하기 위한 엔드포인트입니다',
    description: '해당 유저의 모든 카테고리 목록을 반환합니다',
  })
  @ApiResponse({
    status: 200,
    type: [Category],
    description: '카테고리 목록 조회 성공',
  })
  @Get('/category')
  async getAllCategory(@GetUser() user: User, @Res() res: Response) {
    const categories = await this.myPageService.getAllCategory(user);
    return res.status(HttpStatus.OK).json(categories);
  }

  @ApiTags('my-page/category')
  @ApiOperation({
    summary: '카테고리를 생성하기 위한 엔드포인트입니다',
    description: '해당 유저의 마이페이지에 카테고리를 생성합니다',
  })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({
    status: 201,
    type: Category,
    description: '카테고리 생성 성공',
  })
  @Post('/category')
  async createCategory(
    @Body() categoryDto: CategoryDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { title } = categoryDto;
    const category = await this.myPageService.createCategory(title, user);
    return res.status(HttpStatus.CREATED).json(category);
  }

  @ApiTags('my-page/category')
  @ApiOperation({
    summary: '카테고리를 수정하기 위한 엔드포인트입니다',
    description:
      '해당 카테고리의 이름을 수정합니다. 만약 기존에 존재하고 있던 카테고리의 이름과 일치하면, 400 에러를 반환합니다.',
  })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({
    status: 200,
    type: Category,
    description: '카테고리 수정 성공',
  })
  @Patch('/category/:categoryId')
  async updateCategory(
    @Body() categoryDto: CategoryDto,
    @Param('categoryId') categoryId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { title } = categoryDto;
    const category = await this.myPageService.updateCategory(
      title,
      categoryId,
      user,
    );
    return res.status(HttpStatus.OK).json(category);
  }

  @ApiTags('my-page/category')
  @ApiOperation({
    summary: '카테고리를 삭제하기 위한 엔드포인트입니다',
    description:
      '해당 카테고리를 삭제합니다. 카테고리를 삭제하면 해당 카테고리에 등록되어 있던 글과 스크랩의 category 프로퍼티는 null 로 변경됩니다.',
  })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '카테고리 삭제 성공',
  })
  @Delete('/category/:categoryId')
  async deleteCategory(
    @Param('categoryId') categoryId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.myPageService.deleteCategory(categoryId, user);
    return res.status(HttpStatus.OK).json({ message: '카테고리 삭제 성공' });
  }

  @ApiTags('my-page/article')
  @ApiOperation({
    summary: '카테고리별 글을 조회하기 위한 엔드포인트입니다',
    description: '해당 카테고리에 있는 글을 반환합니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    type: GetMyPageArticleResDto,
    description: '카테고리별 글 조회 성공',
  })
  @Get('/category/:categoryId/article')
  async getCategoryArticle(
    @Param('categoryId') categoryId: string,
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const articles = await this.myPageService.getCategoryArticle(
      categoryId,
      cursor,
      user,
    );
    if (articles.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = articles[articles.length - 1];
      const next_cursor = last._id;
      return res.status(HttpStatus.OK).json({ articles, next_cursor });
    }
  }

  @ApiTags('my-page/article')
  @ApiOperation({
    summary: '해당 글의 카테고리를 이동(수정)하기 위한 엔드포인트입니다',
    description: '해당 글의 카테고리를 수정(이동)합니다',
  })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({
    status: 200,
    type: Article,
    description: '해당 글의 카테고리 이동 성공',
  })
  @Patch('/category/:categoryId/article/:articleId')
  async updateCategoryArticle(
    @Param('articleId') articleId: string,
    @Body() categoryDto: CategoryDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { title } = categoryDto;
    const article = await this.myPageService.updateCategoryArticle(
      articleId,
      title,
      user,
    );
    return res.status(HttpStatus.OK).json(article);
  }

  @ApiTags('my-page/article')
  @ApiOperation({
    summary: '해당 글을 카테고리에서 삭제하기 위한 엔드포인트입니다',
    description: '해당 글을 카테고리에서 삭제합니다',
  })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '해당 글의 카테고리 삭제 성공',
  })
  @Delete('/category/:categoryId/article/:articleId')
  async deleteCategoryArticle(
    @Param('articleId') articleId: string,
    @Res() res: Response,
  ) {
    await this.myPageService.deleteCategoryArticle(articleId);
    return res
      .status(HttpStatus.OK)
      .json({ message: '해당 글의 카테고리 삭제 성공' });
  }

  @ApiTags('my-page/article')
  @ApiOperation({
    summary: '카테고리에 속해있지 않은 글을 조회하기 위한 엔드포인트입니다',
    description: 'category 프로퍼티의 값이 null 인 글을 반환합니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    type: GetMyPageArticleResDto,
    description: '카테고리 없는 글 조회 성공',
  })
  @Get('/category/article')
  async getNoCategoryArticle(
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const articles = await this.myPageService.getNoCategoryArticle(
      cursor,
      user,
    );
    if (articles.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = articles[articles.length - 1];
      const next_cursor = last._id;
      return res.status(HttpStatus.OK).json({ articles, next_cursor });
    }
  }

  @ApiTags('my-page/scrap')
  @ApiOperation({
    summary: '카테고리별 스크랩을 조회하기 위한 엔드포인트입니다',
    description: '해당 카테고리에 있는 스크랩을 반환합니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    type: GetMyPageArticleResDto,
    description: '카테고리별 스크랩 조회 성공',
  })
  @Get('/category/:categoryId/scrap')
  async getCategoryScrap(
    @Param('categoryId') categoryId: string,
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const articles = await this.myPageService.getCategoryScrap(
      categoryId,
      cursor,
      user,
    );
    if (articles.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = articles[articles.length - 1];
      const next_cursor = last._id;
      return res.status(HttpStatus.OK).json({ articles, next_cursor });
    }
  }

  @ApiTags('my-page/scrap')
  @ApiOperation({
    summary: '해당 스크랩의 카테고리를 이동(수정)하기 위한 엔드포인트입니다',
    description: '해당 스크랩의 카테고리를 수정(이동)합니다',
  })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({
    status: 200,
    type: Scrap,
    description: '해당 스크랩의 카테고리 이동 성공',
  })
  @Patch('/category/:categoryId/scrap/:scrapId')
  async updateCategoryScrap(
    @Param('scrapId') scrapId: string,
    @Body() categoryDto: CategoryDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { title } = categoryDto;
    const scrap = await this.myPageService.updateCategoryScrap(
      scrapId,
      title,
      user,
    );
    return res.status(HttpStatus.OK).json(scrap);
  }

  @ApiTags('my-page/scrap')
  @ApiOperation({
    summary: '해당 스크랩을 카테고리에서 삭제하기 위한 엔드포인트입니다',
    description: '해당 스크랩을 카테고리에서 삭제합니다',
  })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '해당 스크랩의 카테고리 삭제 성공',
  })
  @Delete('/category/:categoryId/scrap/:scrapId')
  async deleteCategoryScrap(
    @Param('scrapId') scrapId: string,
    @Res() res: Response,
  ) {
    await this.myPageService.deleteCategoryScrap(scrapId);
    return res
      .status(HttpStatus.OK)
      .json({ message: '해당 스크랩의 카테고리 삭제 성공' });
  }

  @ApiTags('my-page/scrap')
  @ApiOperation({
    summary: '카테고리에 속해있지 않은 스크랩을 조회하기 위한 엔드포인트입니다',
    description: 'category 프로퍼티의 값이 null 인 스크랩을 반환합니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    type: GetMyPageScrapResDto,
    description: '카테고리 없는 스크랩 조회 성공',
  })
  @Get('/category/scrap')
  async getNoCategoryScrap(
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const scraps = await this.myPageService.getNoCategoryScrap(cursor, user);
    if (scraps.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = scraps[scraps.length - 1];
      const next_cursor = last._id;
      return res.status(HttpStatus.OK).json({ scraps, next_cursor });
    }
  }
}
