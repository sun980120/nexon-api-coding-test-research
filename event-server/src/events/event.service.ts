import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Event, EventDocument } from "./schemas/event.schema";
import { RequestCreateEventDto } from "./dtos/request.create.event.dto";

@Injectable()
export class EventService {
    constructor(@InjectModel(Event.name) private readonly eventModel: Model<EventDocument>) {}

    async create(dto: RequestCreateEventDto): Promise<string> {
        const event = new this.eventModel(dto);
        await event.save();
        return "success";
    }

    async findAll(): Promise<EventDocument[]> {
        return await this.eventModel.find().exec();
    }

// event.service.ts
    async findById(id: string): Promise<EventDocument | null> {
        console.log('[EventService] 조회 시도 ID:', id);
        const event = await this.eventModel.findById(id).lean();
        console.log('[EventService] 조회 결과:', event ? event._id : '없음');
        return event;
    }
}
