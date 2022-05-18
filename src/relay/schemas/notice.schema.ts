import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Relay } from './relay.schema';

export type NoticeDocument = Notice & Document;

const options: SchemaOptions = {
  versionKey: false,
};

@Schema(options)
export class Notice {
  @ApiProperty({
    type: String,
    description: '공지사항의 고유 id',
  })
  _id: string;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '공지사항이 작성된 릴레이 방',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relay',
  })
  relay: Relay;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '공지사항을 작성한 릴레이 방의 호스트 유저',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: String,
    description: '공지사항 내용',
  })
  @Prop()
  notice: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
