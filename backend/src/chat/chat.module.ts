import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestEntity } from 'src/user/models/friend-request.entity';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([User, FriendRequestEntity])],
	providers: [ChatGateway, JwtService, UserService],
})
export class ChatModule {}
