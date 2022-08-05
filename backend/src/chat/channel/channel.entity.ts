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
import { MessagesEntity } from '../messages/messages.entity';

@Entity('channel')
export class ChannelEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	channelId: string;

	@Column({
		default: false,
	})
	private: boolean;

	@Column('text', {
		default: '',
	})
	title: string;

	/**
	 * Un Channel ne peut avoir qu'un seul owner mais un user
	 * peut etre owner de plusieurs channels
	 */
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

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	members: UserEntity[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	bannedMembers: UserEntity[];

	@ManyToMany(() => UserEntity, {
		cascade: true,
	})
	@JoinTable()
	mutedMembers: UserEntity[];

	@Column({
		default: false,
	})
	protected: boolean;

	@Column({
		nullable: false,
	})
	creation: Date;

	@Column({
		nullable: false,
	})
	update: Date;

	@OneToMany(() => MessagesEntity, (MessagesEntity) => MessagesEntity.channel)
	messages: MessagesEntity[];
}
