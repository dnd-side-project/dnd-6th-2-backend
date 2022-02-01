import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import * as mongoose from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  // @Prop({
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User'
  // })
  // user: mongoose.Types.ObjectId;

  @Prop()
  ArticleId: number;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  tag: string[];

  @Prop()
  category: string[];

  @Prop({ default: false })
  state: boolean;

  @Prop({ default: false })
  public: boolean;

  @Prop()
  likeNum: number;

  @Prop()
  commentNum: number;

  @Prop()
  createAt: Date;

  @Prop()
  updateAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
