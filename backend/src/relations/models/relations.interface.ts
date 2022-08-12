import { UserEntity } from '../../user/models/user.entity';

export type Relation_Status = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface RelationStatus {
	status?: Relation_Status;
}

export interface Relation {
	id?: number;
	creator?: UserEntity;
	receiver?: UserEntity;
	status?: Relation_Status;
}
