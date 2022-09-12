import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import UserEntity from 'src/user/models/user.entity';
import { ChannelEntity } from './channel.entity';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
	constructor (private ChannelService: ChannelService) {}

	/**
	 * Create a new channel
	 * The requesting user will own the channel.
	 *
	 * @param req containing id user that will be
	 * @returns
	 */

	//  @Post('new')
	//  @UseGuards(JwtAuthGuard)
	//  public async newChannel(@Req() req : Request, @Body() channel : CreateChanDto)
	//  {
	// 	 const user: UserEntity = await this.UserService.getUserByRequest(req);
	// 	 return await this.ChannelService.createNewChan(user, channel);
	//  }
	/**
	 * Get all channels.
	 */

	// @Get('/')
	// async getAllChans(): Promise<channel> {
	//   return await this.ChannelService.getAllChannels();
	// }

 
}
