import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

const options: SchemaOptions = {
  versionKey: false,
};

export type CategoryDocument = Category & Document;

@Schema(options)
export class Category {
  @ApiProperty({
    type: String,
    description: '카테고리의 고유 id',
  })
  _id: string;

  @ApiProperty({
    type: User,
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: String,
    description: '카테고리의 이름',
  })
  @Prop()
  title: string;

  @ApiProperty({
    type: Number,
    description: '해당 카테고리의 글 개수',
  })
  @Prop({ default: 0 })
  articleCount: number;

  @ApiProperty({
    type: Number,
    description: '해당 카테고리의 스크랩 개수',
  })
  @Prop({ default: 0 })
  scrapCount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
