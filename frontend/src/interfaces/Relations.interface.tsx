import UserProp from "./User.interface";

export type Relation_Status = "pending" | "accepted" | "declined" | "blocked";

export interface RelationStatus {
  status?: Relation_Status;
}

interface RelationsProp {
  requestId?: string;
  creator?: UserProp;
  receiver?: UserProp;
  status?: string;
}

export default RelationsProp;
