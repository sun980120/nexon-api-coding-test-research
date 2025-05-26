import { Body, Controller, Post } from "@nestjs/common";
import { RequestUserLogDto } from "./dtos/request.user.log.dto";
import { UserActionLogsService } from "./user-action-logs.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class UserActionLogsController {
    constructor(private readonly userActionLogsService: UserActionLogsService) {}

    // 출석, 초대, 퀘스트 등 모든 행동 로그 기록
    @MessagePattern({ cmd: 'create-user-action-log' })
    async createLog(dto: RequestUserLogDto) {
        return await this.userActionLogsService.create(dto);
    }
}
