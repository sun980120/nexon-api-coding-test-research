import { Model } from "mongoose";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {User, UserDocument } from "./schemas/user.schema";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async exists(username: string): Promise<void> {
        if (await this.userModel.exists({ username })) {
            throw new RpcException({
                statusCode: 409,
                message: 'Username already exists'
            });
        }
    }

    async create(
        username: string,
        password: string,
        roles: string[] = ['USER'],
    ): Promise<void> {
        const user = new this.userModel({ username, password, roles });
        await user.save();
    }

    async findByUsername(username: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new RpcException({
                statusCode: 404,
                message: 'User not found'
            });
        }
        return user;
    }
}