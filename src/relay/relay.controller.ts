import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
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

  @ApiOperation({
    summary: '릴레이 방을 삭제하기 위한 엔드포입트입니다',
    description:
      '해당 릴레이 방에서 쓰였던 글, 좋아요 기록과 함께 릴레이 방이 삭제됩니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '삭제할 릴레이 방의 id',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 방 삭제 성공',
  })
  @Delete('/:relayId')
  deleteRelay(@Param('relayId') relayId: string, @GetUser() user: User) {
    return this.relayService.deleteRelay(relayId, user);
  }
}
