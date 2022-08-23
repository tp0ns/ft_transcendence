import ChannelInterface from "../interfaces/Channel.interface";

export type ChatContextType = {
	channels: ChannelInterface[];
	activeChan: ChannelInterface | null;
	changeActiveChan: (chan: ChannelInterface | null) => void;
};
