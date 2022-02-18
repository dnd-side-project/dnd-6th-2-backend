import { Prop, Schema, SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { User } from 'src/auth/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type CommentDocument = Comment & Document;

const options: SchemaOptions = {
  timestamps: true,
  versionKey: false
};

@Schema(options)
export class Comment {

  @ApiProperty({
    description: 'comment의 objectId',
  })
  _id;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '댓글 작성자 객체',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '댓글을 단 게시글 객체',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;

  @ApiProperty({
    type: String,
    description: '댓글 내용',
  })
  @Prop()
  content: string;

  /* timestamps */
  @ApiProperty({
    type: Date,
    description: '댓글 작성 날짜',
  })
  createAt: Date;
  @ApiProperty({
    type: Date,
    description: '댓글 수정 날짜',
  })
  updateAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
