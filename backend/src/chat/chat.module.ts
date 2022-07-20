import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ChannelController } from './channel/channel.controller';
import { Channel } from './channel/channel.entity';
import { ChannelService } from './channel/channel.service';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Channel, User])],
	providers: [ChatGateway, JwtService, UserService, ChannelService],
	controllers: [ChannelController],
})
export class ChatModule {}
