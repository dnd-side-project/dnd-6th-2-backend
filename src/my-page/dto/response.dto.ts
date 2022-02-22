import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'src/challenge/schemas/article.schema';
import { Scrap } from 'src/feed/schemas/scrap.schema';

export class GetMyPageArticleResDto {
  @ApiProperty({
    type: [Article],
    description: '반환될 글 객체의 배열',
  })
  articles: Article[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}

export class GetMyPageScrapResDto {
  @ApiProperty({
    type: [Scrap],
    description: '반환될 글 객체의 배열',
  })
  scraps: Scrap[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}
