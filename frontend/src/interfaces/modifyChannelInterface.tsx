import UserProp from "./User.interface";

interface ModifiedChannelInfoProp {
  title: string;

  newMember?: string;

  newPassword?: string;

  newAdmin?: string;

  newBan?: string;

  newMute?: string;

  deleteBan?: string;

  deleteMute?: string;
}

export default ModifiedChannelInfoProp;
