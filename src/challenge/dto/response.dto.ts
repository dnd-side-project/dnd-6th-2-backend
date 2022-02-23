import { ApiProperty } from '@nestjs/swagger';
import { KeyWord } from '../schemas/keyword.schema';
import { Article } from '../schemas/article.schema';

export class GetChallengeMain {
  @ApiProperty({
    type: Array,
    description:
      '반환될 KeyWord 객체와 해당 글감에 해당 하는Article 객체의 배열',
  })
  randomarticles: [];

  @ApiProperty({
    type: Number,
    description: '챌린지 글 개수',
  })
  challengeCount: number;

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
}
