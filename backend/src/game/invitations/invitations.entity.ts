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

	@ManyToOne(() => UserEntity, (user) => user.sentInvitations, {
		eager: true,
	})
	@JoinColumn()
	creator: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.receivedInvitations, {
		eager: true,
	})
	@JoinColumn()
	receiver: UserEntity;

	@Column()
	status: Relation_Status;

	@Column({
		nullable: false,
		default: 0,
		type: 'float',
	})
	creationDate: number;
}

export default InvitationEntity;