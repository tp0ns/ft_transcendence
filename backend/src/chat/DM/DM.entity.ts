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

@Entity('DM')
export class DMEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	DMId: string;

	@Column('text', {
		default: '',
	})
	title: string;

	@ManyToOne(() => UserEntity, { 
		eager: true,
		cascade: true, 
	})
	@JoinColumn()
	user1: UserEntity;

	@ManyToOne(() => UserEntity, { 
		eager: true,
		cascade: true, 
	})
	@JoinColumn()
	user2: UserEntity;

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
