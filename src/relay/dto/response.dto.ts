import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'src/challenge/schemas/article.schema';
import { Relay } from '../schemas/relay.schema';

export class GetRelayDto {
  @ApiProperty({
    type: [Relay],
    description: '반환될 릴레이 객체의 배열',
  })
  relays: Relay[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}

export class GetRelayArticleDto {
  @ApiProperty({
    type: [Article],
    description: '반환될 Article(릴레이 글) 객체의 배열',
  })
  relayArticles: Article[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}

export class MessageDto {
  @ApiProperty({
    type: String,
    description: '해당 엔드포인트 관련 메세지',
  })
  message: string;
}
