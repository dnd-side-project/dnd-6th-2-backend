import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { User } from 'src/auth/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/auth/schemas/category.schema';

export type ScrapDocument = Scrap & Document;

const options: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

@Schema(options)
export class Scrap {
  @ApiProperty({
    description: 'Scrap의 ObjectId',
  })
  _id;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '스크랩을 한 유저',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '스크랩을 한 게시글',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;

  @ApiProperty({
    type: Category,
    description: '카테고리',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  category: Category;

  /* timestamps */
  @ApiProperty({
    type: Date,
    description: '생성날짜',
  })
  createAt: Date;
  @ApiProperty({
    type: Date,
    description: '업데이트 날짜',
  })
  updateAt: Date;
}

export const ScrapSchema = SchemaFactory.createForClass(Scrap);
