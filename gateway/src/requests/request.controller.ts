// gateway/src/requests/request.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RolesGuard } from '../conf/roles.guard';
import { Roles } from '../conf/roles.decorator';
import { AuthGuard } from '../conf/auth.guard';
import { ResponseTokenDto } from '../auth/dtos/response.token.dto';
import { RewardRequestDto } from "./dtos/rewarod.request.dto";

@Controller('requests')
@UseGuards(AuthGuard, RolesGuard)
export class RequestController {
  constructor(@Inject('EVENT_SERVER') private readonly eventServiceClient: ClientProxy) {}

  @Post()
  @Roles('USER')
  createRequest(
    @Request() req: Request & { user: ResponseTokenDto },
    @Body() dto: RewardRequestDto,
  ) {
    dto.userId = req.user.sub;  // JWT에서 추출된 사용자 ID
    return this.eventServiceClient.send(
      { cmd: 'create-request' },
      dto,
    );
  }

  @Get()
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  getRequests(@Query('userId') userId?: string) {
    return this.eventServiceClient.send({ cmd: 'get-request' }, { userId });
  }
}
