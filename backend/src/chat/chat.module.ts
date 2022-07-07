import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
	imports: [],
	providers: [ChatGateway],
	exports: [ChatGateway]
})
export class ChatModule {}
