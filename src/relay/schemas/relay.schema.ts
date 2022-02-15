import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type RelayDocument = Relay & Document;

@Schema()
export class Relay {
  _id: string;

  @ApiProperty({
    type: String,
    description: '릴레이 방의 제목(이름)',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    type: Array,
    description: '릴레이 방을 생성할 때 추가하는 태그(필터링)',
  })
  @Prop()
  tags: string[];

  @ApiProperty({
    type: String,
    description: '릴레이 방의 공지사항',
  })
  @Prop()
  notice: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방을 만든 사용자',
    ref: 'User',
  })
  host: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방에 참여하는 사용자들',
    ref: 'User',
  })
  members: User[];

  @ApiProperty({
    type: Number,
    description: '릴레이 방에 참여할 수 있는 총 인원수(방을 생성할 때 지정)',
    default: 1,
  })
  @Prop({ default: 1 })
  headCount: number;

  @ApiProperty({
    type: Number,
    description: '현재 참여 인원수',
    default: 1,
  })
  @Prop({ default: 1 })
  membersCount: number;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const RelaySchema = SchemaFactory.createForClass(Relay);