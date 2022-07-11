import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Chat])],
	providers: [ChatGateway, ChatService],
	exports: [ChatGateway],
	controllers: [ChatController],
})
export class ChatModule {}
