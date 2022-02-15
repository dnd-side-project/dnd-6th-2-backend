import { PartialType } from '@nestjs/swagger';
import { CreateRelayDto } from './create-relay.dto';

export class UpdateRelayDto extends PartialType(CreateRelayDto) {}
