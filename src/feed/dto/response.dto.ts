import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'src/challenge/schemas/article.schema';
import { User } from 'src/auth/schemas/user.schema';

export class GetMainFeedResDto {
  @ApiProperty({
    type: [Article],
    description: '반환될 Article 객체의 배열',
  })
  articles: Article[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}

export class GetSubFeedResDto {
  @ApiProperty({
    type: [Article],
    description: '구독한 작가들의 Article 객체 배열',
  })
  articles: Article[];

  @ApiProperty({
    type: [User],
    description: '구독한 작가들의 User 객체 배열',
  })
  subscribeUserList: User[];

  @ApiProperty({
    type: String,
    description:
      '다음 페이지 조회 요청을 보낼 때, 쿼리스트링으로 보내줄 페이지네이션 커서',
  })
  next_cursor: string;
}

export class NotFoundSubFeedResDto {
  @ApiProperty({
    type: [User],
    description: '구독한 작가들의 User 객체 배열',
  })
  subscribeUserList: User[];

  @ApiProperty({
    type: String,
    description: '페이지 없음 안내 메시지',
  })
  message: string;
}
