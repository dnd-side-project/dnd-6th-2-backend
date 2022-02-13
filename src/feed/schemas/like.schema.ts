import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { User } from 'src/auth/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type LikeDocument = Like & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Like {

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '좋아요를 누른 유저 객체'
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '좋아요를 누른 게시글'
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
