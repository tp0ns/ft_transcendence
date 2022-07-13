import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel/channel.entity';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Channel])],
	providers: [ChatGateway],
	exports: [ChatGateway],
	controllers: [],
})
export class ChatModule {}
