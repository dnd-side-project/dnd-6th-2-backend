import { Controller, UseGuards, Logger, Inject, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MyArticleService } from './my-article.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { Article } from 'src/challenge/schemas/article.schema';
import { UpdateArticleDto } from 'src/challenge/dto/update-article.dto';

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
  async getMyArticle(@GetUser()user : User): Promise<Article[]>{
      return await this.myArticleService.findMyArticle(user);
  }

  @Get('/articleId')
  async getMyArticleOne(@Param('articleId') articleId: String): Promise<Article>{
      return await this.myArticleService.findMyArticleOne(articleId);
  }

  @Patch('/articleId')
  async updateMyArticle(@Param('articleId') articleId: String, @Body() updateArticleDto: UpdateArticleDto,): Promise<Article>{
      return await this.myArticleService.updateMyArticle(articleId, updateArticleDto);
  }

//   @Patch('/articleId/public')
//   async publicMyArticle(@Param('articleId') articleId: String, updateArticleDto: UpdateArticleDto): Promise<Article> {
//     return await this.myArticleService.updateMyArticle(articleId, updateArticleDto);
//   }

  @Get('/temp')
  async getMyArticleTemp(@GetUser()user : User): Promise<Article[]> {
      return await this.myArticleService.findMyArticleTemp(user);
  }
}
