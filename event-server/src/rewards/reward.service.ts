import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { RequestCreateRewardDto } from './dtos/request.create-reward.dto';
import { RpcException } from "@nestjs/microservices";
import { EventService } from 'src/events/event.service';

@Injectable()
export class RewardService {
    constructor(
        @InjectModel(Reward.name) private readonly rewardModel: Model<RewardDocument>,
        private readonly eventService: EventService
    ) {}

    async create(createRewardDto: RequestCreateRewardDto): Promise<string> {
        // 1. 이벤트 존재 여부 확인
        const eventExists = await this.eventService.exists(createRewardDto.eventId);
        if (!eventExists) {
            throw new RpcException({
                statusCode: 404,
                message: '존재하지 않는 이벤트입니다.'
            });
        }
        try {
            await this.rewardModel.create(createRewardDto);
        } catch (error) {
            throw new RpcException({
                statusCode: 400,
                message: '보상 생성 실패: ' + error.message
            });
        }
        return "success";
    }

    async findAll(): Promise<Reward[]> {
        const rewards = await this.rewardModel.find().exec();
        if (rewards.length === 0) {
            throw new RpcException({
                statusCode: 404,
                message: '보상 데이터가 없습니다.'
            });
        }
        return rewards;
    }

    async findByEvent(eventId: string): Promise<RewardDocument[]> {
        const rewards = await this.rewardModel.find({ eventId }).exec();
        if (rewards.length === 0) {
            throw new RpcException({
                statusCode: 404,
                message: '해당 이벤트의 보상을 찾을 수 없습니다.'
            });
        }
        return rewards;
    }
}
