import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class createBlogDto {

    blogId: Number;

    @IsString()
    @ApiProperty({type: String, default:'제목',description: '글 제목'})
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, default:'본문', description: '글 본문'})
    readonly body: string;
  }