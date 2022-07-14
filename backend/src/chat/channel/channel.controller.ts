import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChanDto } from './dtos/createChan.dto';

@Controller('channel')
export class ChannelController {
	constructor (private ChannelService: ChannelService) {}


	@Post('/create')
	// @HttpCode(200)
	@UsePipes(ValidationPipe)
	async createChan(@Body() ChanData : CreateChanDto) {
		return await this.ChannelService.createNewChan(ChanData)
	}
}
