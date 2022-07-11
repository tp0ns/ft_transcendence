import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './CreateChat.dto';

@Controller('chat')
export class ChatController {
	constructor (private ChatService: ChatService) {}


	@Post('/create')
	// @HttpCode(200)
	@UsePipes(ValidationPipe)
	async createChat(@Body() ChatData : CreateChatDto) {
		return await this.ChatService.createNewChat(ChatData)
	}
}
