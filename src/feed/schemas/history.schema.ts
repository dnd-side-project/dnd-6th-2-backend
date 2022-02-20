import { Prop, Schema, SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export type HistoryDocument = History & Document;

const options: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

@Schema(options)
export class History {
  @ApiProperty({
    description: 'History의 ObjectId',
  })
  _id;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '검색을 한 유저의 user 객체',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: String,
    description: '검색 내용',
  })
  @Prop()
  content: string;

  @ApiProperty({
    type: Date,
    description: 'History 생성날짜',
  })
  /* timestamps */
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'History 업데이트 날짜',
  })
  updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
