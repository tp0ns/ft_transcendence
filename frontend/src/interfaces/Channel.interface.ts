import UserProp from "./User.interface";

interface ChannelProp {
	id: string;
	title: string;
	password: string;
	private: boolean;
	protected: boolean;
	owner: UserProp;
	admins: UserProp[];
	members: UserProp[];
	bannedMembers: UserProp[];
	mutedMembers: UserProp[];
}

export default ChannelProp;
