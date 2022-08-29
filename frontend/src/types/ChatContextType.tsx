import ChannelInterface from "../interfaces/Channel.interface";

export type ChatContextType = {
	channels: ChannelInterface[];
	activeChan: ChannelInterface | null;
	isAdmin: boolean;
	clientId: string;
	changeActiveChan: (chan: ChannelInterface | null) => void;
};
