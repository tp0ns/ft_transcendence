import UserProp from "./User.interface";

export type Relation_Status = "pending" | "accepted" | "declined" | "blocked";

interface MatchInviteInterface {
	id: string;
	player1: UserProp;
	player2: UserProp;
	status: Relation_Status;
}

export default MatchInviteInterface;
