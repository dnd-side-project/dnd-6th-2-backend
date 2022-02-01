import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KeyWordDocument = KeyWord & Document;

@Schema()
export class KeyWord {
  @Prop()
  content: string;

  @Prop({
    default: false,
  })
  state: boolean;

  @Prop({
    default: null,
  })
  updateDay: string;
}

export const KeyWordSchema = SchemaFactory.createForClass(KeyWord);
