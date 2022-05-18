import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Notice } from './notice.schema';

export type RelayDocument = Relay & Document;

const options: SchemaOptions = {
  versionKey: false,
  timestamps: true,
};

@Schema(options)
export class Relay {
  @ApiProperty({
    type: String,
    description: '릴레이 방의 고유 id',
  })
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
    type: [mongoose.Schema.Types.ObjectId],
    description: '릴레이 방의 공지사항',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방의 공지사항 목록',
    ref: 'Notice',
  })
  notice: Notice[];

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방을 만든 호스트',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방을 만든 사용자',
    ref: 'User',
  })
  host: User;

  @ApiProperty({
    type: [mongoose.Schema.Types.ObjectId],
    description: '릴레이 방에 참여하는 사용자들',
  })
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
  @Prop({ default: 0 })
  membersCount: number;

  @ApiProperty({
    type: Number,
    description: '해당 릴레이 방의 좋아요 합산 수',
    default: 0,
  })
  @Prop({ default: 0 })
  likeCount: number;

  @ApiProperty({
    type: Number,
    description: '해당 릴레이 방의 총 글 개수',
    default: 0,
  })
  @Prop({ default: 0 })
  articleCount: number;

  @ApiProperty({
    type: Date,
    description: '생성 날짜',
  })
  /* timestamps */
  createdAt: Date;
}

export const RelaySchema = SchemaFactory.createForClass(Relay);
