import UserProp from "./User.interface";

export type Relation_Status = "pending" | "accepted" | "declined" | "blocked";

export interface RelationStatus {
  status?: Relation_Status;
}

interface RelationsProp {
  requestId?: string;
  creator?: UserProp;
  receiver?: UserProp;
  status?: Relation_Status;
}

export default RelationsProp;
