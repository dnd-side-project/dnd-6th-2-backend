import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { User } from 'src/auth/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type ScrapDocument = Scrap & Document;

const options: SchemaOptions = {
  timestamps: true,
};

@Schema(options)
export class Scrap {

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '스크랩을 한 유저'
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '스크랩을 한 게시글'
  })
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
