import ChannelInterface from "../interfaces/Channel.interface";

export type ChatContextType = {
	channels: ChannelInterface[];
	activeChan: ChannelInterface | null;
	isAdmin: boolean;
	changeActiveChan: (chan: ChannelInterface | null) => void;
};
