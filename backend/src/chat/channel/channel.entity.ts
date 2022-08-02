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
} from 'typeorm';
import { MembersEntity } from '../members/members.entity';
import { MessagesEntity } from '../messages/messages.entity';

@Entity('channel')
export class ChannelEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	channelId: string;

	@Column({
		default: false,
	})
	isPrivate: boolean;

	@Column('text', {
		default: '',
	})
	title: string;

	/**
	 * Un Channel ne peut avoir qu'un seul owner mais un user
	 * peut etre owner de plusieurs channels
	 */
	@ManyToOne(() => UserEntity)
	@JoinColumn()
	owner: UserEntity;

	@Column('text', {
		default: null,
		nullable: true,
	})
	password: string;

	@OneToMany(() => MembersEntity, (members) => members.channel)
	channels: ChannelEntity[];

	@OneToMany(() => MessagesEntity, (message) => message.channel)
	messages: MessagesEntity[];

	@Column({
		default: false,
	})
	isProtected: boolean;

	@Column({
		nullable: false,
	})
	creation: Date;

	@Column({
		nullable: false,
	})
	update: Date;
}
