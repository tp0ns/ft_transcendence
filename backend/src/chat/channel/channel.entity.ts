import UserEntity from 'src/user/models/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('channel')
export class ChannelEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	channelId: string;

	// @Column({
	// 	type: 'boolean',
	// 	default: false,
	// })
	// isPrivate: boolean;

	@Column('text', {
		default: '',
	})
	title: string;

	@ManyToOne(() => UserEntity)
	@JoinColumn()
	owner: UserEntity;

	@Column("text", {
		default: "",
	})
	password: string;

	@ManyToMany(() => UserEntity, (user) => user.channels, {
		eager: true,
	})
	@JoinTable()
	members: UserEntity[]

	@Column({
		default: false,
	})
	isProtected: boolean;

	//faire la date de crea
	//faire le time de la derniere activite sur le chan
	//faire bannedUsers
	//faire MuttedUsers
	//faire AdminUsers
	//faire UsersIn
}
