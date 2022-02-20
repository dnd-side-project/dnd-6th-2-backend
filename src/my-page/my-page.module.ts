import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Category, CategorySchema } from 'src/auth/schemas/category.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Scrap, ScrapSchema } from 'src/feed/schemas/scrap.schema';
import { Relay, RelaySchema } from 'src/relay/schemas/relay.schema';
import { MyPageController } from './my-page.controller';
import { MyPageService } from './my-page.service';
import { MyPageRepository } from './repository/my-page.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Scrap.name, schema: ScrapSchema }]),
    MongooseModule.forFeature([{ name: Relay.name, schema: RelaySchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
  ],
  controllers: [MyPageController],
  providers: [MyPageService, MyPageRepository],
})
export class MyPageModule {}
