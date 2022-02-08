import { Prop, Schema, SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';

export type CommentDocument = Comment & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Comment {
  //   @Prop({
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: 'User'
  //   })
  //   user: User

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;

  @Prop()
  content: string;

  /* timestamps */
  createAt: Date;
  updateAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
