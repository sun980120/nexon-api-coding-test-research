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

    async findById(id: string): Promise<EventDocument | null> {
        const event = await this.eventModel.findById(id).lean();
        return event;
    }

    async exists(eventId: string): Promise<boolean> {
        return !!(await this.eventModel.exists({ _id: eventId }));
    }
}
