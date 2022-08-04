import UserProp from "./User.interface";

interface ModifiedChannelInfoProp {
  title: string;

  newMember?: string;

  newPassword?: string;

  removePassword?: boolean;

  newAdmin?: string;

  newBan?: string;

  newMute?: string;

  deleteBan?: string;

  deleteMute?: string;

  protected?: boolean;
}

export default ModifiedChannelInfoProp;
