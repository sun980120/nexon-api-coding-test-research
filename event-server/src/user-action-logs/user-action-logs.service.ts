// user-action-logs.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserActionLog, UserActionLogDocument } from "./schemas/user.action.log.schema";
import { Model } from "mongoose";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from 'bull';
import { RequestUserLogDto } from "./dtos/request.user.log.dto";

@Injectable()
export class UserActionLogsService {
    constructor(
        @InjectModel(UserActionLog.name) private readonly actionLogModel: Model<UserActionLogDocument>
    ) {}

    async create(dto: RequestUserLogDto): Promise<string> {
        await this.actionLogModel.create(dto);
        return "success";
    }

    async findActionsByUser(userId: string, options: {
        startDate?: Date;
        endDate?: Date;
        actionType?: string;
    }): Promise<UserActionLogDocument[]> {
        const filter: any = { userId };
        if (options.actionType) filter.actionType = options.actionType;
        if (options.startDate || options.endDate) {
            filter.timestamp = {};
            if (options.startDate) filter.timestamp.$gte = options.startDate;
            if (options.endDate) filter.timestamp.$lte = options.endDate;
        }
        return this.actionLogModel.find(filter).exec();
    }
    // 초대 성공 로그 카운트 메서드 추가
    async countSuccessfulInvitations(
        userId: string,
        startDate: Date,
        endDate: Date,
        eventId?: string
    ): Promise<number> {
        const filter: any = {
            userId,
            actionType: 'INVITE',
            'metadata.status': 'SUCCESS',
            timestamp: { $gte: startDate, $lte: endDate }
        };
        if (eventId) filter.eventId = eventId;

        return this.actionLogModel.countDocuments(filter).exec();
    }
    // 특정 이벤트 보상 수령 여부 확인
    async hasReceivedReward(userId: string, eventId: string): Promise<boolean> {
        return !!(await this.actionLogModel.exists({
            userId,
            eventId,
            actionType: 'REWARD'
        }))
    }

    // 보상 수령 로그 기록
    async logReward(userId: string, eventId: string, metadata?: any): Promise<void> {
        await this.actionLogModel.create({
            userId,
            eventId,
            actionType: 'REWARD',
            metadata
        })
    }
    async logUserAction(dto: RequestUserLogDto): Promise<void> {
        await this.actionLogModel.create(dto);
    }
}
