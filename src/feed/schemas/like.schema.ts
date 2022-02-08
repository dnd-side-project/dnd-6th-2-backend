import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';

export type LikeDocument = Like & Document;

@Schema()
export class Like {
  //   @Prop({
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: 'User'
  //   })
  //   user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
