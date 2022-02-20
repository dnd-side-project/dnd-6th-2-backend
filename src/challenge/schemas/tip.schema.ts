import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TipDocument = Tip & Document;

const options: SchemaOptions = {
  versionKey: false,
};

@Schema(options)
export class Tip {
  @ApiProperty({
    description: 'keyword의 objectId',
  })
  _id;

  @ApiProperty({
    description: '글쓰기 Tip의 내용',
  })
  @Prop()
  content: string;
}

export const TipSchema = SchemaFactory.createForClass(Tip);
