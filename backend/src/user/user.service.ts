import {
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'passport-42';
import { from, map, Observable, of, switchMap } from 'rxjs';
import {
	FriendRequest,
	FriendRequestStatus,
	FriendRequest_Status,
} from './models/friend-request.interface';
import { FriendRequestEntity } from './models/friend-request.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		@InjectRepository(FriendRequestEntity)
		private friendRequestRepo: Repository<FriendRequestEntity>,
	) {}

	/**
	 * Return un profile dont le schoolId correspond au profile.id passé en param, si il
	 * n'existe pas le crée et le renvoie.
	 * @param profile ce que le premier call à l'API 42 a return, voir @param profileFields
	 * @returns un User
	 */
	async findOrCreate(profile: Profile): Promise<User> {
		const user: User = await this.userRepo.findOne({
			where: { schoolId: profile.id },
		});
		if (!user) {
			return await this.userRepo.save({
				schoolId: profile.id,
				username: profile.username,
				image_url: profile.image_url,
			});
		}
		return await user;
	}

	async getUserById(id: string) {
		const user = await this.userRepo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('user not found');
		}
		return user;
	}

	async hasRequestBeenSentOrReceived(
		creator: User,
		receiver: User,
	): Promise<boolean> {
		const friendRequest: FriendRequest = await this.findRequestByUserId(
			creator,
			receiver,
		);

		if (!friendRequest) return false;
		return true;
	}

	async findRequestByUserId(user1: User, user2: User): Promise<FriendRequest> {
		const friendRequest: FriendRequest = await this.friendRequestRepo.findOne({
			where: [
				{ creator: user1, receiver: user2 },
				{ creator: user2, receiver: user1 },
			],
		});
		return friendRequest;
	}

	async sendFriendRequest(receiverId: string, creatorReq: Partial<User>) {
		const creator: User = creatorReq as User;

		if (receiverId === creator.userId)
			throw new ForbiddenException('It is not possible to add yourself!');

		const receiver: User = await this.getUserById(receiverId);
		if (await this.hasRequestBeenSentOrReceived(creator, receiver))
			throw new ForbiddenException(
				'A friend request has already been sent or received!',
			);
		let friendRequest: FriendRequest = {
			creator,
			receiver,
			status: 'pending',
		};
		return await this.friendRequestRepo.save(friendRequest);
	}

	async blockUser(
		blockedId: string,
		blockerReq: Partial<User>,
	): Promise<FriendRequest> {
		const blocker: User = blockerReq as User;
		const blocked: User = await this.getUserById(blockedId);
		if (blocker.userId === blockedId)
			throw new ForbiddenException('It is not possible to add yourself!');

		const request: FriendRequest = await this.findRequestByUserId(
			blocker,
			blocked,
		);
		if (request) {
			if (request.status === 'blocked')
				throw new ForbiddenException('Users already blocked!');
			Object.assign(request, {
				creator: blocker,
				receiver: blocked,
				status: 'blocked',
			});
			this.friendRequestRepo.save(request);
			return request;
		}
		let blockedRequest: FriendRequest = {
			creator: blocker,
			receiver: blocked,
			status: 'blocked',
		};
		return await this.friendRequestRepo.save(blockedRequest);
	}

	async unblockUser(
		friendRequestId: string,
		userReq: Partial<User>,
	): Promise<boolean> {
		const user: User = userReq as User;
		const friendRequest: FriendRequest = await this.getFriendRequestById(
			friendRequestId,
		);
		if (friendRequest.status === 'blocked') {
			if (user === friendRequest.creator) {
				await this.friendRequestRepo.delete(friendRequest);
				return true;
			} else
				throw new ForbiddenException(
					"Blocked user can't unblock relationship!",
				);
		} else
			throw new ForbiddenException("Can't unblock not blocked relationship");
	}

	async getFriendRequestById(friendRequestid: string): Promise<FriendRequest> {
		return await this.friendRequestRepo.findOne({
			where: [{ requestId: friendRequestid }],
		});
	}

	async respondToFriendRequest(
		friendRequestId: string,
		statusResponse: FriendRequest_Status,
	): Promise<FriendRequest> {
		const friendRequest: FriendRequest = await this.getFriendRequestById(
			friendRequestId,
		);
		if (!friendRequest)
			throw new NotFoundException('Friend request entity not found!');
		if (friendRequest.status === 'blocked')
			throw new ForbiddenException('Status already blocked!');
		Object.assign(friendRequest, { status: statusResponse });
		this.friendRequestRepo.save(friendRequest);
		return friendRequest;
	}

	/* This functions takes a user_id and updates it with the attributes of its entity to be updated. 
	These are represented by the Partial<User> parameter (Partial<> permits to give as arguments parts of an entity)*/
	async update(id: string, attrs: Partial<User>) {
		const user = await this.userRepo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('user not found');
		}
		while (attrs.username === user.username) {
			attrs.username += Math.floor(Math.random() * (999 - 100 + 1) + 100);
		}
		Object.assign(user, attrs);
		console.log(user);
		return this.userRepo.save(user);
	}
	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.userRepo.save(newUser);
	// }
}
