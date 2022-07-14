import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel/channel.entity';
import { ChatGateway } from './chat.gateway';
import { ChannelService } from './channel/channel.service';
import { ChannelController } from './channel/channel.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Channel])],
	providers: [ChatGateway, ChannelService],
	exports: [ChatGateway],
	controllers: [ChannelController],
})
export class ChatModule {}
