import { Prop, Schema, SchemaFactory, SchemaOptions } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Article } from "src/challenge/schemas/article.schema";

export type ScrapDocument = Scrap & Document

const options: SchemaOptions = {
    timestamps: true,
  };
  
@Schema()
export class Scrap{
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

/* timestamps */
  createAt: Date;
  updateAt: Date;
}

export const ScrapSchema = SchemaFactory.createForClass(Scrap);