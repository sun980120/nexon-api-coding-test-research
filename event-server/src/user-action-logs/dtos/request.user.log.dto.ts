import { ActionType } from "../enums/action.type";

export class RequestUserLogDto {
    userId: string; // 유저 ID
    actionType: ActionType; // 액션 종류
    metadata?: any; // 추가 정보 (예: { invitedUserId: 'user2' })
}