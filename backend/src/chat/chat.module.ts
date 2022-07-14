import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { Channel } from './channel/channel.entity';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Channel, User])],
	providers: [ChatGateway, JwtService, UserService],
})
export class ChatModule {}
