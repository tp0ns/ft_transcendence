import UserProp from "./User.interface";

interface ChannelInterface {
	admins: UserProp[];
	bannedMembers: UserProp[];
	channelId: string;
	creation: string;
	DM: boolean;
	members: UserProp[];
	mutedMembers: UserProp[];
	owner: UserProp;
	password: null;
	private: false;
	protected: false;
	title: string;
	update: string;
}

export default ChannelInterface;
