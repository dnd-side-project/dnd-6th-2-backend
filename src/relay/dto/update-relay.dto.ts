import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRelayDto } from './create-relay.dto';

export class UpdateRelayDto extends PartialType(
  OmitType(CreateRelayDto, ['notice'] as const),
) {}
// notice를 제외한 CreteRelayDto 의 partial
