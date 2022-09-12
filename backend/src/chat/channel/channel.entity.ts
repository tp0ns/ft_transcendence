import { isNotEmpty } from 'class-validator';
import UserEntity from 'src/user/models/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { MessagesEntity } from '../messages/messages.entity';

@Entity('channel')
export class ChannelEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	channelId: string;

	@Column({
		default: false,
	})
	private: boolean;

	@Column({
		default: false,
	})
	DM: boolean;

	// @ManyToOne(() => UserEntity, {
	// 	eager: true,
	// 	cascade: true,
	// })
	// @JoinColumn()
	// user2: UserEntity;

	@Column('text', {
		default: '',
		unique: true,
	})
	title: string;

	@ManyToOne(() => UserEntity, {
		eager: true,
		cascade: true,
	})
	@JoinColumn()
	owner: UserEntity;

	@Column('text', {
		default: null,
		nullable: true,
	})
	password: string;

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	admins: UserEntity[];

	@RelationId((channel: ChannelEntity) => channel.admins)
	adminsId: string[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	members: UserEntity[];

	@RelationId((channel: ChannelEntity) => channel.members)
	membersId: string[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	userInProtectedChan: UserEntity[];

	@RelationId((channel: ChannelEntity) => channel.userInProtectedChan)
	usersInId: string[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	bannedMembers: UserEntity[];

	@RelationId((channel: ChannelEntity) => channel.bannedMembers)
	bannedId: string[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	mutedMembers: UserEntity[];

	@RelationId((channel: ChannelEntity) => channel.mutedMembers)
	mutedId: string[];

	@Column({
		default: false,
	})
	protected: boolean;

	@OneToMany(() => MessagesEntity, (MessagesEntity) => MessagesEntity.channel)
	messages: MessagesEntity[];
}
