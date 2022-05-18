import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Comment } from 'src/feed/schemas/comment.schema';
import { Category } from './category.schema';

const options: SchemaOptions = {
  versionKey: false,
};

export type UserDocument = User & mongoose.Document;

@Schema(options)
export class User {
  @ApiProperty({
    type: String,
    description: '사용자의 고유 id',
  })
  _id: string;

  @ApiProperty({
    type: String,
    description: '사용자의 이메일',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    type: String,
    description: '사용자의 비밀번호',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    type: String,
    description: '사용자의 닉네임',
  })
  @Prop({ unique: true })
  nickname: string;

  @ApiProperty({
    type: [String],
    description: '관심 장르',
  })
  @Prop()
  genre: string[];

  @ApiProperty({
    type: String,
    description: '자기소개 한 줄',
  })
  @Prop()
  bio: string;

  @ApiProperty({
    type: [mongoose.Schema.Types.ObjectId],
    description: '유저가 작성한 댓글',
  })
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Comment',
  })
  comments: Comment[];

  @ApiProperty({
    type: [mongoose.Schema.Types.ObjectId],
    description: '유저가 구독한 구독자 목록',
  })
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  subscribeUser: User[];

  @ApiProperty({
    type: Number,
    description: '도장 개수',
  })
  @Prop({ default: 0 })
  stampCount: number;

  @ApiProperty({
    type: Boolean,
    description: '오늘 챌린지 했는지 여부(false=안 함, true=완료상태)',
  })
  @Prop({ default: false })
  state: boolean;

  @ApiProperty({
    type: [mongoose.Schema.Types.ObjectId],
    description: '유저가 만든 카테고리 리스트',
  })
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
  })
  categories: Category[];

  @ApiProperty({
    type: Number,
    description: '유저가 작성한 공개 글 개수',
  })
  @Prop({ default: 0 })
  articleCount: number;

  @ApiProperty({
    type: [String],
    description: '챌린지 수행 날짜 배열',
  })
  @Prop({ default: null })
  challengeHistory: [string];

  @ApiProperty({
    type: Number,
    description: '유저의 팔로워 숫자',
  })
  @Prop({ default: 0 })
  followers: number;

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  refreshToken: string;

  @ApiProperty({
    type: Number,
    description: '메일 인증 코드',
  })
  @Prop({ default: null })
  mailAuthCode: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
