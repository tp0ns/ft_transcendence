import UserProp from "./User.interface";

export type Relation_Status = "pending" | "accepted" | "declined" | "blocked";

interface MatchInviteInterface {
	requestId: string;
	creator: UserProp;
	receiver: UserProp;
	status: Relation_Status;
	creationDate: number;
}

export default MatchInviteInterface;
