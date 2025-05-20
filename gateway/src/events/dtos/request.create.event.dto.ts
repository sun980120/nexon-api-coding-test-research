import { ConditionType } from "../enums/condition-type.enum";

export class RequestCreateEventDto {
    name: string;
    conditionType: ConditionType;
    conditionValue: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    autoApprove?: boolean;
}