import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/models/user.entity';
import { Relation_Status } from 'src/relations/models/relations.interface';

@Entity('invitation')
export class InvitationEntity {
	@PrimaryGeneratedColumn('uuid')
	requestId: string;

	@ManyToOne(() => UserEntity, (user) => user.sentRelations, {
		eager: true,
	})
	@JoinColumn()
	creator: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.receivedRelations, {
		eager: true,
	})
	@JoinColumn()
	receiver: UserEntity;

	@Column()
	status: Relation_Status;
}

export default InvitationEntity;
