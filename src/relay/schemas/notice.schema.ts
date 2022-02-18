import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NoticeDocument = Notice & Document;

const options: SchemaOptions = {
  versionKey: false,
};

@Schema(options)
export class Notice {
  @ApiProperty({
    type: String,
    description: '릴레이 방 공지사항의 고유 id',
  })
  _id: string;

  @ApiProperty({
    type: String,
    description: '공지사항 내용',
  })
  @Prop()
  notice: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
