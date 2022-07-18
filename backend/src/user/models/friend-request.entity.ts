import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';
import { FriendRequest_Status } from './friend-request.interface';

@Entity('request')
export class FriendRequestEntity {
	@PrimaryGeneratedColumn('uuid')
	userId: string;

	// @ManyToOne(() => User, (user) => user.sentFriendRequests)
	// creator: User;

	// @ManyToOne(() => User, (user) => user.receivedFriendRequests)
	// receiver: User;

	@Column()
	status: FriendRequest_Status;
}
