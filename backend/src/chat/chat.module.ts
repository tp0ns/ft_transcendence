import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [ChatGateway, JwtService, UserService],
})
export class ChatModule {}
