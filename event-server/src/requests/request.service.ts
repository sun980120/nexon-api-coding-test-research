// events-service/src/requests/request.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestStatus, RewardRequest, RewardRequestDocument } from './schemas/request.schema';
import { EventService } from '../events/event.service';
import { UserActionLogsService } from '../user-action-logs/user-action-logs.service';
import { EventDocument } from "../events/schemas/event.schema";
import { RewardRequestDto } from "./dtos/rewarod.request.dto";
import { ActionType } from "../user-action-logs/enums/action.type";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class RequestService {
    constructor(
        @InjectModel(RewardRequest.name)
        private readonly requestModel: Model<RewardRequestDocument>,
        private readonly eventService: EventService,
        private readonly actionLogsService: UserActionLogsService
    ) {}

    async createRequest(dto: RewardRequestDto) {
        const { userId, eventId } = dto;
        // 1. 중복 요청 체크
        const exists = await this.requestModel.exists({ userId, eventId, status: { $ne: RequestStatus.REJECTED} });
        if (exists) throw new RpcException({
            statusCode: 409,
            message: '이미 요청된 이벤트입니다.'
        });

        // 2. 이벤트 조회
        const event = await this.eventService.findById(eventId);
        if (!event) throw new RpcException({
            statusCode: 404,
            message: '존재하지 않는 이벤트입니다.'
        });
        // 3. 조건 검증 (예: 7일 연속 출석)
        let isValid = false;
        switch (event.conditionType) {
            case 'ATTENDANCE':
                isValid = await this.validateAttendance(userId, event);
                break;
            case 'INVITE':
                isValid = await this.validateInvitations(userId, event);
                break;
        }

        // 4. 상태 결정
        const status = event.autoApprove ?
            (isValid ? RequestStatus.APPROVED : RequestStatus.REJECTED)
            : RequestStatus.PENDING;
        // 5. 요청 생성
        const request = await this.requestModel.create({ userId, eventId, status });

        // 6. 자동 승인 시 보상 지급
        if (status === RequestStatus.APPROVED) await this.actionLogsService.logReward(userId, eventId);
        return request;
    }

    private async validateAttendance(userId: string, event: EventDocument) {
        const logs = await this.actionLogsService.findActionsByUser(userId, {
            startDate: event.startDate, // ✅ timestamp 필드의 $gte로 매핑
            endDate: event.endDate,     // ✅ timestamp 필드의 $lte로 매핑
            actionType: ActionType.ATTENDANCE
        });
        return logs.length >= event.conditionValue;
    }
    private async validateInvitations(userId: string, event: EventDocument): Promise<boolean> {
        // 이벤트 기간 내에 성공한 초대 로그 개수 집계
        const requiredCount = event.conditionValue// 예: 3명 초대 필요
        const start = event.startDate;
        const end = event.endDate;

        // 초대 성공 로그 카운트
        const count = await this.actionLogsService.countSuccessfulInvitations(
            userId,
            start,
            end,
            event._id ? event._id.toString() : undefined
        );

        return count >= requiredCount;
    }
    async findByUser(userId: string) {
        return this.requestModel.find({ userId }).exec();
    }

    async findAll() {
        return this.requestModel.find().exec();
    }
}
