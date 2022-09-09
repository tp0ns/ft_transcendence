import { MessagesEntity } from 'src/chat/messages/messages.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { RelationEntity } from '../../relations/models/relations.entity';

type User_Status = 'connected' | 'disconnected' | 'playing';

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn('uuid')
	userId: string;

	@Column({
		type: 'int',
		unique: true,
	})
	schoolId: number;

	@Column({
		type: 'varchar',
	})
	username: string;

	@Column({ nullable: true })
	public twoFASecret?: string;

	@Column({ default: false })
	public isTwoFAEnabled: boolean;

	@Column({
		type: 'varchar',
	})
	image_url: string;

	@Column({
		nullable: true,
		type: 'varchar',
	})
	profileImage: string;

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.creator)
	sentRelations: RelationEntity[];

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.receiver)
	receivedRelations: RelationEntity[];

	@OneToMany(() => MessagesEntity, (message) => message.user)
	messages: MessagesEntity[];

	@Column({default: "disconnected"})
	status: User_Status;

}

export default UserEntity;
