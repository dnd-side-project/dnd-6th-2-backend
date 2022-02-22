import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';
import { Comment } from 'src/feed/schemas/comment.schema';
import { Category } from './category.schema';

const options: SchemaOptions = {
  versionKey: false,
};

export type UserDocument = User & Document;

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
  @Prop({ required: true })
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
  @Prop()
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

  // ADD: validate return 값에 추가
  // @Prop()
  // profileImage: string;

  @ApiProperty({
    type: [Comment],
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  })
  comments: Comment[];

  @ApiProperty({
    type: [User],
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
  stampCount: number; //도장 개수

  @ApiProperty({
    type: Boolean,
    description: '오늘 챌린지 했는지 여부(false=안 함, true=완료상태)',
  })
  @Prop({ default: false })
  state: boolean; //오늘 챌린지 했는지 여부

  @ApiProperty({
    type: [Category],
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
    type: Number,
    description: '유저의 팔로워 숫자',
  })
  @Prop({ default: 0 })
  followers: number;

  // FIX
  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  hashedToken: string; // 원래는 refresh token 저장, 현재는 access token 저장

  @ApiProperty({
    type: Number,
  })
  @Prop()
  mailAuthCode: number; // 메일 인증 코드
}

export const UserSchema = SchemaFactory.createForClass(User);
