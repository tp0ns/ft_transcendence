import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
	constructor (private ChannelService: ChannelService) {}


	// @Post('/create')
	// @HttpCode(200)
	// @UsePipes(ValidationPipe)
	// async createChan(@Body() ChanData : CreateChanDto) {
	// 	return await this.ChannelService.createNewChan(ChanData)
	// }

	/**
	 * Get all channels.
	 */

	// @Get('/')
	// async getAllChans(): Promise<channel> {
	//   return await this.ChannelService.getAllChannels();
	// }
 
}
