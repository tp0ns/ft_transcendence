import { Body, Controller, Get, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import UserEntity from 'src/user/models/user.entity';
import { ChannelEntity } from './channel.entity';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
	constructor (private ChannelService: ChannelService) {}


	// @Post('/create')
	// @HttpCode(200)
	// @UsePipes(ValidationPipe)
	// async createChan(@Body() user: UserEntity, channel: ChannelEntity) {
	// 	return await this.ChannelService.createNewChan(user, channel)
	// }

	/**
	 * Get all channels.
	 */

	// @Get('/')
	// async getAllChans(): Promise<channel> {
	//   return await this.ChannelService.getAllChannels();
	// }

 
}
