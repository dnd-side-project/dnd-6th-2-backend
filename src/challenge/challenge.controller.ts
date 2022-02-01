import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { KeyWord } from './schemas/keyword.schema';
import { CreateKeyWordDto } from './dto/create-keyword.dto';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(private challengeService: ChallengeService) {}

  @Get('/keyword')
  @ApiResponse({ description: '키워드 조회 API (개발용)' })
  getFirstmailForms(): Promise<KeyWord[]> {
    return this.challengeService.getKeyWord();
  }

  @Post('/keyword')
  @ApiResponse({ description: '키워드 등록 API (개발용)' })
  @ApiBody({ type: CreateKeyWordDto })
  addFirstGreeting(
    @Body() createKeyWordDto: CreateKeyWordDto,
  ): Promise<KeyWord> {
    return this.challengeService.addKeyWord(createKeyWordDto);
  }

  @Get('/random')
  @ApiResponse({ description: '글감 랜덤 제공 API' })
  getRandom() {
    return this.challengeService.getRandom();
  }
}
