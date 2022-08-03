import ChannelProp from "../interfaces/Channel.interface";

class Channel {
	title: string;
	password?: string;
	private: boolean;

	constructor(channelInput: ChannelProp) {
		this.title = channelInput.title;
		this.password = channelInput.password;
		this.private = channelInput.private;
	}
}

export default Channel;
