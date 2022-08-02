import ChannelProp from "../interfaces/Channel.interface";

class Channel {
	id: string;
	title: string;
	password: string;
	private: boolean;

	constructor(channelInput: ChannelProp) {
		this.id = channelInput.id;
		this.title = channelInput.title;
		this.password = channelInput.password;
		this.private = channelInput.private;
	}
}

export default Channel;
