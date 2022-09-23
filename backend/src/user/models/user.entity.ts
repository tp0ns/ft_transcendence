import { MaxLength } from 'class-validator';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { Match } from 'src/game/interfaces/match.interface';
import InvitationEntity from 'src/game/invitations/invitations.entity';
import { MatchHistoryEntity } from 'src/game/matchHistory/matchHistory.entity';
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
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

	@MaxLength(10)
	@Column({
		type: 'varchar',
		nullable: false,
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

	@Column({
		nullable: true,
	})
	currentMatch: string;

	@OneToMany(
		() => InvitationEntity,
		(InvitationEntity) => InvitationEntity.creator,
	)
	sentInvitations: InvitationEntity[];

	@OneToMany(
		() => InvitationEntity,
		(InvitationEntity) => InvitationEntity.receiver,
	)
	receivedInvitations: InvitationEntity[];

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.creator)
	sentRelations: RelationEntity[];

	@OneToMany(() => RelationEntity, (RelationEntity) => RelationEntity.receiver)
	receivedRelations: RelationEntity[];

	@OneToMany(() => MessagesEntity, (message) => message.user)
	messages: MessagesEntity[];

	@Column({ default: "disconnected" })
	status: User_Status;

	@Column({
		nullable: true,
	})
	victories: number;

	@Column({
		nullable: true,
	})
	defeats: number;

	@ManyToMany(() => MatchHistoryEntity, {
		cascade: true,
	})
	@JoinTable()
	MatchHistory: MatchHistoryEntity[];

}

export default UserEntity;
