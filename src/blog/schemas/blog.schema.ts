import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

const options: SchemaOptions = {
  timestamps: true,
  id: true,
};

@Schema(options)
export class Blog extends mongoose.Document {
  @Prop()
  blogId: number;

  @Prop()
  title: string;

  @Prop()
  body: string;

  /* timestamps */
  createAt: Date;
  updateAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
