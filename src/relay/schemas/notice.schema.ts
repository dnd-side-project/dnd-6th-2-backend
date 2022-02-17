import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NoticeDocument = Notice & Document;

@Schema()
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
