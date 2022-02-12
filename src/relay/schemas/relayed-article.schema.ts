import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { Relay } from './relay.schema';

export type RelayedArticleDocument = RelayedArticle & Document;

@Schema()
export class RelayedArticle {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relay',
  })
  relay: Relay;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  })
  article: Article;
}

export const RelayedArticleSchema =
  SchemaFactory.createForClass(RelayedArticle);
