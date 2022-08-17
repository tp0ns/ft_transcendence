import ChannelInterface from "./Channel.interface";
import UserProp from "./User.interface";

interface MessageInterface {
	channelId: string;
	message: string;
	channel: ChannelInterface;
	user: UserProp;
}

export default MessageInterface;
