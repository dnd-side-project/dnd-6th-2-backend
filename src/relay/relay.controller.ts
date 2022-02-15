import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { AddNoticeDto } from './dto/add-notice.dto';
import { CreateRelayDto } from './dto/create-relay.dto';
import { RelayService } from './relay.service';
import { Relay } from './schemas/relay.schema';

@ApiTags('relay')
@ApiBearerAuth('accessToken')
@Controller('relay')
@UseGuards(AuthGuard())
@UsePipes(ValidationPipe)
export class RelayController {
  constructor(private relayService: RelayService) {}

  @ApiOperation({
    summary: '릴레이 방 전체를 조회하기 위한 엔드포인트입니다',
    description:
      '릴레이 메인페이지에서 릴레이 방 전체를 조회하는 엔드포인트입니다. (현재 정렬 기준도 확실하지 않고 페이지네이션 되어 있지 않은 상태라서 추후에 수정할 예정)',
  })
  @ApiQuery({
    name: 'tags',
    type: Array,
    required: false,
    description: '필터링을 하기 위한 태그 목록',
  })
  @ApiQuery({
    name: 'sort',
    required: true,
    example: '최신순',
    description:
      '정렬 기준 (아직 어떤 정렬 기준이 있는지 확실하지 않아 해당 부분은 추가하지 않았으니 참고해서 테스트해주세요!)',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 방 전체 조회 성공',
  })
  @Get('/')
  getAllRelay(@Query() query, @GetUser() user: User) {
    if (query.tags) {
      return this.relayService.getAllRelay(query.tags, user);
    } else {
      return this.relayService.getAllRelay(null, user);
    }
  }

  @ApiOperation({
    summary: '자신이 참여한 릴레이 방을 조회하기 위한 엔드포인트입니다',
    description:
      '릴레이 메인페이지에서 참여한 방을 조회하는 엔드포인트입니다. (페이지네이션은 추후 추가할 예정)',
  })
  @ApiResponse({
    status: 200,
    description: '참여한 릴레이 방 조회 성공',
  })
  @Get('/user')
  getJoinedRelay(@GetUser() user: User) {
    return this.relayService.getJoinedRelay(user);
  }

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

  @ApiOperation({
    summary: '릴레이 방에 공지사항을 추가하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방에 공지사항을 추가할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '공지사항을 추가할 릴레이 방 id',
  })
  @ApiBody({ type: AddNoticeDto })
  @ApiResponse({
    status: 201,
    description: '공지사항 추가 성공',
  })
  @Post('/:relayId/notice')
  AddNoticeToRelay(
    @Body() addNoticeDto: AddNoticeDto,
    @Param('relayId') relayId: string,
    @GetUser() user: User,
  ) {
    const { notice } = addNoticeDto;
    return this.relayService.AddNoticeToRelay(relayId, notice, user);
  }

  @ApiOperation({
    summary: '공지사항을 수정하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방의 해당 공지사항을 수정할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '공지사항을 수정할 릴레이 방 id',
  })
  @ApiParam({
    name: 'noticeId',
    required: true,
    description: '공지사항의 id',
  })
  @ApiBody({ type: AddNoticeDto })
  @ApiResponse({
    status: 200,
    description: '공지사항 수정 성공',
  })
  @Patch('/:relayId/notice/:noticeId')
  UpdateNoticeToRelay(
    @Body() addNoticeDto: AddNoticeDto,
    @Param() param,
    @GetUser() user: User,
  ) {
    const { relayId, noticeId } = param;
    const { notice } = addNoticeDto;
    return this.relayService.updateNoticeToRelay(
      relayId,
      noticeId,
      notice,
      user,
    );
  }

  @ApiOperation({
    summary: '공지사항을 삭제하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방의 해당 공지사항을 삭제할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '공지사항을 삭제할 릴레이 방 id',
  })
  @ApiParam({
    name: 'noticeId',
    required: true,
    description: '공지사항의 id',
  })
  @ApiResponse({
    status: 200,
    description: '공지사항 삭제 성공',
  })
  @Delete('/:relayId/notice/:noticeId')
  deleteNoticeToRelay(@Param() param, @GetUser() user: User) {
    const { relayId, noticeId } = param;
    return this.relayService.deleteNoticeToRelay(relayId, noticeId, user);
  }
}
