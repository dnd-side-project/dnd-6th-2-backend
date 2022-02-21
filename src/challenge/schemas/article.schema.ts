import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Category } from 'src/auth/schemas/category.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Comment } from 'src/feed/schemas/comment.schema';
import { Relay } from 'src/relay/schemas/relay.schema';

export type ArticleDocument = Article & Document;

const options: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

@Schema(options)
export class Article {
  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: 'Aritlce의 ObjectId',
  })
  _id: string;

  @ApiProperty({
    type: [User],
    description: '글쓴이 객체',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '글쓴이',
    ref: 'User',
  })
  user: User;

  @ApiProperty({
    type: String,
    description: '글 제목',
  })
  @Prop()
  title: string;

  @ApiProperty({
    type: String,
    description: '글 본문',
  })
  @Prop()
  content: string;

  @ApiProperty({
    type: Array,
    description: '글 분류를 위한 태그(챌린지 글 쓸 때 선택하는 태그)',
  })
  @Prop()
  tags: string[];

  @ApiProperty({
    type: Category,
    description: '글의 카테고리(유저가 직접 생성)',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  category: Category;

  @ApiProperty({
    type: String,
    description: '글에 해당하는 글감',
  })
  @Prop()
  keyWord: string;

  @ApiProperty({
    type: Boolean,
    description: '챌린지 완료 여부(글 저장까지 하면 챌린지 완료(임시저장은 X))',
    example: 'false = 비완료(임시저장), true = 저장완료',
    default: false,
  })
  @Prop({ default: false })
  state: boolean;

  @ApiProperty({
    type: Boolean,
    description: '글 공개 여부',
    example: 'false = 비공개, true = 공개',
    default: false,
  })
  @Prop({ default: false })
  public: boolean;

  @ApiProperty({
    type: Number,
    description: '좋아요 개수',
    default: 0,
  })
  @Prop({ default: 0 })
  likeNum: number;

  @ApiProperty({
    type: Number,
    description: '댓글 개수',
    default: 0,
  })
  @Prop({ default: 0 })
  commentNum: number;

  @ApiProperty({
    type: Number,
    description: '스크랩 개수',
    default: 0,
  })
  @Prop({ default: 0 })
  scrapNum: number;

  @ApiProperty({
    type: [Comment],
    description: '댓글 객체 배열',
  })
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    description: '댓글 목록',
    ref: 'Comment',
    default: null,
  })
  comments: Comment[];

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방의 ObjectId',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    description: '릴레이 방에서 쓰인 글이면 해당 릴레이 방의 id 저장',
    ref: 'Relay',
    default: null,
  })
  relay: Relay;

  @ApiProperty({
    type: Boolean,
    description: '자유 글쓰기 구분 boolean, false=챌린지글, true=자유글쓰기 글',
  })
  @Prop({
    type: Boolean,
    description: '자유 글쓰기 구분용',
    default: false,
  })
  free: boolean;

  /* timestamps */
  @ApiProperty({
    type: Date,
    description: '작성 날짜',
  })
  createdAt: Date;
  @ApiProperty({
    type: Date,
    description: '수정 날짜',
  })
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
