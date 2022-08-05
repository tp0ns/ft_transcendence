import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ChannelService } from "src/chat/channel/channel.service";
import { MessageService } from "src/chat/messages/messages.service";
import { UserService } from "src/user/user.service";
import { GeneralGateway } from "./general.gateway";

@Injectable()
export class GenreralService {
	constructor(

		protected readonly userService: UserService,
		protected readonly channelService: ChannelService,
		protected readonly messageService: MessageService,
		@Inject(forwardRef(() => GeneralGateway)) protected gateway: GeneralGateway
	) {}

}