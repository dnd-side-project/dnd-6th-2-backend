import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
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
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { AddNoticeDto } from './dto/add-notice.dto';
import { RelayArticleDto } from './dto/relay-article.dto';
import { CreateRelayDto } from './dto/create-relay.dto';
import { UpdateRelayDto } from './dto/update-relay.dto';
import { OrderBy, RelayService } from './relay.service';

@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard())
@Controller('relay')
export class RelayController {
  constructor(private relayService: RelayService) {}

  @ApiTags('relay')
  @ApiOperation({
    summary: '릴레이 방 전체를 조회하기 위한 엔드포인트입니다',
    description:
      '릴레이 메인페이지에서 릴레이 방 전체를 조회하는 엔드포인트입니다',
  })
  @ApiQuery({
    name: 'tags',
    type: Array,
    required: false,
    description: '필터링을 하기 위한 태그 목록',
  })
  @ApiQuery({
    name: 'orderBy',
    enum: OrderBy,
    description: '정렬 기준 (default: 최신순)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '릴레이 객체 배열과 함께 다음 페이지 요청을 위한 next_cursor 를 반환합니다. next_cursor 가 null 이면, 더 이상의 페이지는 없습니다.',
  })
  @Get('/')
  async getAllRelay(
    @Query() query,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const relays = await this.relayService.getAllRelay(query, user);
    if (relays.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = relays[relays.length - 1];
      const next_cursor = `${last._id}_${last.likeCount}`;
      return res.status(HttpStatus.OK).json({ relays, next_cursor });
    }
  }

  @ApiTags('relay')
  @ApiOperation({
    summary: '자신이 참여한 릴레이 방을 조회하기 위한 엔드포인트입니다',
    description: '릴레이 메인페이지에서 참여한 방을 조회하는 엔드포인트입니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '참여한 릴레이 객체 배열과 함께 다음 페이지 요청을 위한 next_cursor 를 반환합니다. next_cursor 가 null 이면, 더 이상의 페이지는 없습니다.',
  })
  @Get('/members')
  async getJoinedRelay(
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const relays = await this.relayService.getJoinedRelay(cursor, user);
    if (relays.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = relays[relays.length - 1];
      const next_cursor = `${last._id}_${last.likeCount}`;
      return res.status(HttpStatus.OK).json({ relays, next_cursor });
    }
  }

  @ApiTags('relay')
  @ApiOperation({
    summary: '자신이 만든 릴레이 방을 조회하기 위한 엔드포인트입니다',
    description:
      '릴레이 메인페이지에서 자신이 만든 방을 조회하는 엔드포인트입니다',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '참여한 릴레이 객체 배열과 함께 다음 페이지 요청을 위한 next_cursor 를 반환합니다. next_cursor 가 null 이면, 더 이상의 페이지는 없습니다.',
  })
  @Get('/user')
  async getMyRelay(
    @Query('cursor') cursor,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const relays = await this.relayService.getMyRelay(cursor, user);
    if (relays.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const last = relays[relays.length - 1];
      const next_cursor = `${last._id}_${last.likeCount}`;
      return res.status(HttpStatus.OK).json({ relays, next_cursor });
    }
  }

  @ApiTags('relay')
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
  async createRelay(
    @Body() createRelayDto: CreateRelayDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const relay = await this.relayService.createRelay(createRelayDto, user);
    return res.status(HttpStatus.CREATED).json(relay);
  }

  @ApiTags('relay')
  @ApiOperation({
    summary: '릴레이 방의 정보를 수정하기 위한 엔드포인트입니다',
    description:
      '제목, 태그, 인원수를 수정할 수 있습니다. 인원수는 현재 참여한 정원보다 적게 수정할 수 없습니다.',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '수정할 릴레이 방의 id',
  })
  @ApiBody({ type: UpdateRelayDto })
  @ApiResponse({
    status: 200,
    description: '릴레이 방 수정 성공',
  })
  @Patch('/:relayId')
  async updateRelay(
    @Param('relayId') relayId: string,
    @Body() updateRelayDto: UpdateRelayDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const relay = await this.relayService.updateRelay(
      relayId,
      updateRelayDto,
      user,
    );
    return res.status(HttpStatus.OK).json(relay);
  }

  @ApiTags('relay')
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
  async deleteRelay(
    @Param('relayId') relayId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.deleteRelay(relayId, user);
    return res.status(HttpStatus.OK).json({ message: '릴레이 방 삭제 성공' });
  }

  @ApiTags('relay/notice')
  @ApiOperation({
    summary: '릴레이 방에 공지사항을 추가하기 위한 엔드포인트입니다',
    description:
      '해당 릴레이 방에 공지사항을 추가할 수 있습니다. 공지사항 관리는 호스트에게만 권한이 있습니다.',
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
  async AddNoticeToRelay(
    @Body() addNoticeDto: AddNoticeDto,
    @Param('relayId') relayId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { notice } = addNoticeDto;
    const Notice = await this.relayService.AddNoticeToRelay(
      relayId,
      notice,
      user,
    );
    return res.status(HttpStatus.CREATED).json(Notice);
  }

  @ApiTags('relay/notice')
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
  async UpdateNoticeToRelay(
    @Body() addNoticeDto: AddNoticeDto,
    @Param() param,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { notice } = addNoticeDto;
    const Notice = await this.relayService.updateNoticeToRelay(
      param,
      notice,
      user,
    );
    return res.status(HttpStatus.OK).json(Notice);
  }

  @ApiTags('relay/notice')
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
  async deleteNoticeToRelay(
    @Param() param,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.deleteNoticeToRelay(param, user);
    return res.status(HttpStatus.OK).json({ message: '공지사항 삭제 성공' });
  }

  @ApiTags('relay')
  @ApiOperation({
    summary: '릴레이 방에 참여하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방에 입장할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '참여할 릴레이 방의 id',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 방 입장 성공',
  })
  @Post('/:relayId/join')
  async joinRelay(
    @Param('relayId') relayId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.joinRelay(relayId, user);
    return res.status(HttpStatus.OK).json({ message: '릴레이 방 입장 성공' });
  }

  @ApiTags('relay')
  @ApiOperation({
    summary: '릴레이 방에서 퇴장하기 위한 엔드포인트입니다',
    description:
      '해당 릴레이 방에서 퇴장할 수 있습니다. 호스트는 퇴장할 수 없습니다. (삭제만 가능)',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '퇴장할 릴레이 방의 id',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 방 퇴장 성공',
  })
  @Delete('/:relayId/join')
  async exitRelay(
    @Param('relayId') relayId: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.exitRelay(relayId, user);
    return res.status(HttpStatus.OK).json({ message: '릴레이 방 퇴장 성공' });
  }

  @ApiTags('relay')
  @ApiOperation({
    summary:
      '각 릴레이 방의 상세 정보를 조회하기 위한 엔드포인트(릴레이 방을 입장하면 해당 릴레이 방의 상세 정보 표시)',
    description:
      '해당 릴레이 방의 제목, 글 개수, 멤버, 태그 등의 상세 정보를 조회할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '상세정보를 조회할 릴레이 방 id',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 상세 정보 조회 성공',
  })
  @Get('/:relayId')
  async findRelayById(@Param('relayId') relayId: string, @Res() res: Response) {
    const relay = await this.relayService.findRelayById(relayId);
    return res.status(HttpStatus.OK).json(relay);
  }

  @ApiTags('relay/article')
  @ApiOperation({
    summary: '릴레이 글을 조회하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방의 모든 릴레이 글을 조회할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '글을 조회할 릴레이 방 id',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      '이전 페이지에서 반환된 next_cursor의 값을 받아 요청합니다(페이지네이션). 첫번째 페이지인 경우는 null 값을 보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description:
      '릴레이 글 객체 배열과 함께 다음 페이지 요청을 위한 next_cursor 를 반환합니다. next_cursor 가 null 이면, 더 이상의 페이지는 없습니다.',
  })
  @Get('/:relayId/article')
  async getRelayArticle(
    @Param('relayId') relayId: string,
    @Query('cursor') cursor,
    @Res() res: Response,
  ) {
    const relayArticles = await this.relayService.getRelayArticle(
      relayId,
      cursor,
    );
    if (relayArticles.length === 0) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '더 이상의 페이지는 존재하지 않습니다.' });
    } else {
      const next_cursor = relayArticles[relayArticles.length - 1]._id;
      return res.status(HttpStatus.OK).json({ relayArticles, next_cursor });
    }
  }

  @ApiTags('relay/article')
  @ApiOperation({
    summary: '릴레이 글을 작성하기 위한 엔드포인트입니다',
    description: '해당 릴레이 방에 참여한 유저들이 글을 추가할 수 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '글을 작성할 릴레이 방 id',
  })
  @ApiBody({ type: RelayArticleDto })
  @ApiResponse({
    status: 201,
    description: '릴레이 글 생성 성공',
  })
  @Post('/:relayId/article')
  async createRelayArticle(
    @Param('relayId') relayId: string,
    @Body() relayArticleDto: RelayArticleDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const article = await this.relayService.createRelayArticle(
      relayId,
      relayArticleDto,
      user,
    );
    return res.status(HttpStatus.CREATED).json(article);
  }

  @ApiTags('relay/article')
  @ApiOperation({
    summary: '릴레이 글을 수정하기 위한 엔드포인트입니다',
    description:
      '호스트를 포함하여 오직 해당 글의 작성자만 자신의 글을 수정할 수 있는 권한이 있습니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '글을 수정할 릴레이 방 id',
  })
  @ApiParam({
    name: 'articleId',
    required: true,
    description: '수정할 릴레이 글의 id',
  })
  @ApiBody({ type: RelayArticleDto })
  @ApiResponse({
    status: 200,
    description: '릴레이 글 수정 성공',
  })
  @Patch('/:relayId/article/:articleId')
  async updateRelayArticle(
    @Param() param,
    @Body() relayArticleDto: RelayArticleDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const article = await this.relayService.updateRelayArticle(
      param,
      relayArticleDto,
      user,
    );
    return res.status(HttpStatus.OK).json(article);
  }

  @ApiTags('relay/article')
  @ApiOperation({
    summary: '릴레이 글을 삭제하기 위한 엔드포인트입니다',
    description:
      '오직 해당 글의 작성자만 삭제가 가능합니다. 단, 호스트는 예외적으로 모든 글을 삭제할 수 있습니다.',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '글을 삭제할 릴레이 방 id',
  })
  @ApiParam({
    name: 'articleId',
    required: true,
    description: '삭제할 릴레이 글의 id',
  })
  @ApiResponse({
    status: 200,
    description: '릴레이 글 삭제 성공',
  })
  @Delete('/:relayId/article/:articleId')
  async deleteRelayArticle(
    @Param() param,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.deleteRelayArticle(param, user);
    return res.status(HttpStatus.OK).json({ message: '릴레이 글 삭제 성공' });
  }

  @ApiTags('relay/like')
  @ApiOperation({
    summary: '릴레이 글에 좋아요를 생성하기 위한 엔드포인트',
    description:
      '해당 릴레이 글에 좋아요를 생성할 수 있습니다. 모든 유저가 가능합니다.',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '릴레이 방 id',
  })
  @ApiParam({
    name: 'articleId',
    required: true,
    description: '좋아요를 생성할 글의 id',
  })
  @ApiResponse({
    status: 201,
    description: '좋아요 생성 성공',
  })
  @Post('/:relayId/article/:articleId/like')
  async createRelayLike(
    @Param() param,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const like = await this.relayService.createRelayLike(param, user);
    return res.status(HttpStatus.CREATED).json(like);
  }

  @ApiTags('relay/like')
  @ApiOperation({
    summary: '좋아요를 삭제하기 위한 엔드포인트입니다',
    description: '오직 해당 글에 좋아요를 누른 사용자만 삭제가 가능합니다',
  })
  @ApiParam({
    name: 'relayId',
    required: true,
    description: '좋아요를 삭제할 릴레이 방 id',
  })
  @ApiParam({
    name: 'articleId',
    required: true,
    description: '좋아요를 삭제할 릴레이 글의 id',
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 삭제 성공',
  })
  @Delete('/:relayId/article/:articleId/like')
  async deleteRelayLike(
    @Param() param,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    await this.relayService.deleteRelayLike(param, user);
    return res.status(HttpStatus.OK).json({ message: '좋아요 삭제 성공' });
  }
}
