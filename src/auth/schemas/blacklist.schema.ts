import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

const options: SchemaOptions = {
  versionKey: false,
  id: false,
  timestamps: true,
};

export type BlackListDocument = BlackList & mongoose.Document;

@Schema(options)
export class BlackList {
  @ApiProperty({
    description: '이미 만료된 리프레시 토큰',
  })
  @Prop({ required: true, unique: true })
  refreshToken: string;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '해당 토큰을 발급받은 유저',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: Date,
    description: 'blacklist에 토큰이 등록된 날짜',
  })
  /* timestamps */
  createdAt: Date;
}

export const BlackListSchema = SchemaFactory.createForClass(BlackList);
