import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type KeyWordDocument = KeyWord & Document;

const options: SchemaOptions = {
  versionKey : false
};

@Schema(options)
export class KeyWord {

  @ApiProperty({
    description: 'keyword의 objectId',
  })
  _id;

  @ApiProperty({
    type: String,
    description: '글감 내용',
  })
  @Prop()
  content: string;

  @ApiProperty({
    type: Boolean,
    description: '글감의 사용여부를 판별, false=아직 안 나온 글감/ true=사용된 글감',
  })
  @Prop({
    default: false,
  })
  state: boolean;

  @ApiProperty({
    type: String,
    description: '글감이 사용된 날짜',
  })
  @Prop({
    default: null,
  })
  updateDay: string;
}

export const KeyWordSchema = SchemaFactory.createForClass(KeyWord);
