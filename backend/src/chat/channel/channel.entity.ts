import UserEntity from 'src/user/models/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('channel')
export class Channel extends BaseEntity {
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
	owner: UserEntity;

	// @ManyToMany((type) => UserEntity, {
	// 	cascade: true,
	// })
	// @JoinTable()
	// public members: UserEntity[]

	// @Column("text", {
	// 	default: ""
	// })
	// password: string;

	//faire la date de crea
	//faire le time de la derniere activite sur le chan
	//faire bannedUsers
	//faire MuttedUsers
	//faire AdminUsers
	//faire UsersIn
}
