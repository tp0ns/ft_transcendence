import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import UserEntity from 'src/user/models/user.entity';
import { membersService } from '../members/members.service';
import { ChannelEntity } from './channel.entity';
import { ChannelService } from './channel.service';
import { CreateChanDto } from './dtos/createChan.dto';

@Controller('channel')
export class ChannelController {
	constructor (private ChannelService: ChannelService, private MembersService: membersService) {}


	@Post('/create')
	@HttpCode(200)
	@UsePipes(ValidationPipe)
	@UseGuards(WsGuard)
	async createChan(user: UserEntity, @Body() channel: ChannelEntity) {
		return await this.ChannelService.createNewChan(user, channel)
	}

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
