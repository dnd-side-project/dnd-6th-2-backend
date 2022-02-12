import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Article } from 'src/challenge/schemas/article.schema';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  nickname: string;

  @Prop()
  genre: string[];

  @Prop()
  bio: string;

  // ADD: validate return 값에 추가
  // @Prop()
  // profileImage: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  })
  comments: Comment[];

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Article',
  })
  temporary: Article[];

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Article',
  })
  articles: Article[];

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  })
  subscribeUser: User[];

  @Prop({ default: 0 })
  challenge: number;

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

  @Prop()
  hashedRefreshToken: string; // refresh token 저장

  @Prop()
  mailAuthCode: number; // 메일 인증 코드
}

export const UserSchema = SchemaFactory.createForClass(User);
