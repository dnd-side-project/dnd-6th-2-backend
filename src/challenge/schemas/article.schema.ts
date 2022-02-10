import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type ArticleDocument = Article & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Article {
  _id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @Prop()
  userNickname: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  tags: string[];

  @Prop()
  category: string[];

  @Prop()
  keyWord: string;

  @Prop({ default: false })
  state: boolean;

  @Prop({ default: false })
  public: boolean;

  @Prop({ default: 0 })
  likeNum: number;

  @Prop({ default: 0 })
  commentNum: number;

  @Prop({ default: 0 })
  scrapNum: number;

  /* timestamps */
  createAt: Date;
  updateAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
