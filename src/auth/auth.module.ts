import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repository/auth.repository';
import { User, UserSchema } from './schemas/user.schema';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { Article, ArticleSchema } from 'src/challenge/schemas/article.schema';
import { Comment, CommentSchema } from 'src/feed/schemas/comment.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { LocalStrategy } from './strategy/local.strategy';
import { BlackList, BlackListSchema } from './schemas/blacklist.schema';
import { Notice, NoticeSchema } from 'src/relay/schemas/notice.schema';
import { Relay, RelaySchema } from 'src/relay/schemas/relay.schema';
import { Scrap, ScrapSchema } from 'src/feed/schemas/scrap.schema';
import { Like, LikeSchema } from 'src/feed/schemas/like.schema';
import { History, HistorySchema } from 'src/feed/schemas/history.schema';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: BlackList.name, schema: BlackListSchema },
    ]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }]),
    MongooseModule.forFeature([{ name: Relay.name, schema: RelaySchema }]),
    MongooseModule.forFeature([{ name: Scrap.name, schema: ScrapSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: History.name, schema: HistorySchema }]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      // FIX: 메일 template 추가
      // template: {
      //   dir: process.cwd() + '/template/',
      //   adapter: new HandlebarsAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.SECRET_KEY as string,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    LocalStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
  ],
  exports: [PassportModule, JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
