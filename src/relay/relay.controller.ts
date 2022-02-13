import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { CreateRelayDto } from './dto/create-relay.dto';
import { RelayService } from './relay.service';
import { Relay } from './schemas/relay.schema';

@ApiTags('relay')
@ApiBearerAuth('accessToken')
@Controller('relay')
@UseGuards(AuthGuard())
export class RelayController {
  constructor(private relayService: RelayService) {}

  @ApiOperation({
    summary: '릴레이 방을 생성하기 위한 엔드포인트입니다',
    description: '릴레이 방을 생성합니다',
  })
  @ApiBody({ type: CreateRelayDto })
  @ApiResponse({
    status: 201,
    description: '릴레이 방 생성 성공',
  })
  @Post('/')
  createRelay(
    @Body() createRelayDto: CreateRelayDto,
    @GetUser() user: User,
  ): Promise<Relay> {
    return this.relayService.createRelay(createRelayDto, user);
  }
}
