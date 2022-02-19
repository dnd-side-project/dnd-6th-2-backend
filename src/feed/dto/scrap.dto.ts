import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ScrapDto {
  user: string;
  article: string;

  @ApiProperty({description: '카테고리'})
  @IsNotEmpty()
  @IsString()
  readonly category: string;
}
