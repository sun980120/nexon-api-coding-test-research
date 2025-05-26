import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { UsersService } from "../user/users.service";
import { RequestAuthDto } from "./dtos/request.auth.dto";
import { UserDocument } from "../user/schemas/user.schema";
import { JwtService } from '@nestjs/jwt';
import { ResponseTokenDto } from "./dtos/response.token.dto";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}
    async register(dto: RequestAuthDto): Promise<string> {
        await this.usersService.exists(dto.username);
        const hashed: string = await bcrypt.hash(dto.password, 10);
        await this.usersService.create(dto.username, hashed, dto.roles);
        return "success";
    }
    async login(dto: RequestAuthDto): Promise<string> {
        const user: UserDocument = await this.validateUser(dto.username, dto.password);
        const payload = {
            sub: user._id,
            username: user.username,
            roles: user.roles,
        };
        return await this.jwtService.signAsync(payload);
    }
    async validateUser(username: string, password: string): Promise<any> {
        const user: UserDocument | null = await this.usersService.findByUsername(
            username,
        );
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new RpcException({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        }
        return user;
    }
    async validateToken(token: string): Promise<ResponseTokenDto | null> {
        try {
            return await this.jwtService.verifyAsync<ResponseTokenDto>(token);
        } catch {
            throw new RpcException({ statusCode: 401, message: 'Invalid token' });
        }
    }
}
