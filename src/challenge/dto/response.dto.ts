import { ApiProperty } from '@nestjs/swagger';
import { KeyWord } from '../schemas/keyword.schema';
import { Article } from '../schemas/article.schema';

export class GetChallengeMain {
  @ApiProperty({
    type: KeyWord,
    description: 'radomarticles에 들어가는 KeyWord 객체',
  })
  KeyWord: KeyWord;

  @ApiProperty({
    type: [Article],
    description: 'radomarticles에 들어가는 Article 객체 배열',
  })
  Article: Article[];

  @ApiProperty({
    type: Number,
    description: '챌린지 글 개수',
  })
  challengeCount: number;

  @ApiProperty({
    type: [String],
    description: '챌린지 수행 날짜의 배열',
  })
  challengeHistory: [string];
}

export class GetMonthlyDto {

  @ApiProperty({
    type: [String],
    description: '챌린지 수행 날짜의 배열',
  })
  monthlyChallengeHistory: [string];

  @ApiProperty({
    type: Number,
    description: '각 월 별 도장 개수',
  })
  monthlyStamp: Number;
}


