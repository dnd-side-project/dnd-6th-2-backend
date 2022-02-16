import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NoticeDocument = Notice & Document;

@Schema()
export class Notice {
  _id: string;

  @Prop()
  notice: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
