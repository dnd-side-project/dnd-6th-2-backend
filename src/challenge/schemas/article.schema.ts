import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Article {
  // @Prop({
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User'
  // })
  // user: mongoose.Types.ObjectId;

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

  /* timestamps */
  createAt: Date;
  updateAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
// ArticleSchema.index({ keyWord: 'text' });

// export {ArticleSchema};
