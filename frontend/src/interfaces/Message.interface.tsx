import ChannelInterface from "./Channel.interface";
import UserProp from "./User.interface";

interface MessageInterface {
	id: string;
	message: string;
	channel: ChannelInterface;
	user: UserProp;
}

export default MessageInterface;
