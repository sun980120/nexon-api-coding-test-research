import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";
import { ActionType } from "../enums/action.type";

@Schema()
export class UserActionLog {
    @Prop({ required: true })
    userId: string;
    @Prop({ required: false }) eventId: string; // 이벤트별 구분!
    @Prop({ required: true, enum: ActionType })
    actionType: string;

    @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
    metadata: any;

    @Prop({ type: Date, default: Date.now, index: true })
    timestamp: Date;
}

export type UserActionLogDocument = UserActionLog & Document;
export const UserActionLogSchema = SchemaFactory.createForClass(UserActionLog);