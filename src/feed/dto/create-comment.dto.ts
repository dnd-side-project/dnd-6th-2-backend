import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  // article: mongoose.Schema.Types.ObjectId;
  article: string;

  user: string;

  @ApiProperty({
    type: String,
    description: '댓글 내용',
    default: '좋은 글이네요.',
  })
  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
