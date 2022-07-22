import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../models/user.entity';
import { Relation_Status } from './relations.interface';

@Entity('request')
export class RelationEntity {
	@PrimaryGeneratedColumn('uuid')
	requestId: string;

	@ManyToOne(() => UserEntity, (user) => user.sentRelations)
	creator: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.receivedRelations)
	receiver: UserEntity;

	@Column()
	status: Relation_Status;
}

export default RelationEntity;
