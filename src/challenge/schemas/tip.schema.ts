import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TipDocument = Tip & Document;

@Schema()
export class Tip {
  @Prop()
  content: string;
}

export const TipSchema = SchemaFactory.createForClass(Tip);
