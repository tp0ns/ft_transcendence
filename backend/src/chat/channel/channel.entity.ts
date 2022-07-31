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
// import { MembersEntity } from '../channelMembers/members.entity';

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

	@Column("text", {
		default: "",
	})
	password: string;

	@ManyToMany(() => UserEntity, (user) => user.channels, {
	})
	@JoinTable()
	members: UserEntity[]

	@Column({
		default: false,
	})
	isProtected: boolean;

	//faire la date de crea
	//faire le time de la derniere activite sur le chan
}
