import {
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

	findUserById(id: string): Observable<User> {
		return from(this.userRepo.findOne({ where: { userId: id } })).pipe(
			map((user: User) => {
				if (!user) {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}
				return user;
			}),
		);
	}

	hasRequestBeenSentOrReceived(
		creator: User,
		receiver: User,
	): Observable<boolean> {
		return from(
			this.friendRequestRepo.findOne({
				where: [
					{ creator, receiver },
					{ creator: receiver, receiver: creator },
				],
			}),
		).pipe(
			switchMap((friendRequest: FriendRequest) => {
				if (!friendRequest) return of(false);
				return of(true);
			}),
		);
	}

	sendFriendRequest(
		receiverId: string,
		creatorReq: Partial<User>,
	): Observable<FriendRequest | { error: string }> {
		const creator: User = creatorReq as User;

		if (receiverId === creator.userId)
			return of({ error: 'It is not possible to add yourself!' });

		return this.findUserById(receiverId).pipe(
			switchMap((receiver: User) => {
				return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
					switchMap((hasRequestBeenSentOrReceived: boolean) => {
						if (hasRequestBeenSentOrReceived)
							return of({
								error:
									'A friend request has already been sent of received to your account!',
							});
						let friendRequest: FriendRequest = {
							creator,
							receiver,
							status: 'pending',
						};
						return from(this.friendRequestRepo.save(friendRequest));
					}),
				);
			}),
		);
	}

	getFriendRequestStatus(
		receiverId: string,
		currentUserReq: Partial<User>,
	): Observable<FriendRequestStatus> {
		const currentUser: User = currentUserReq as User;
		return this.findUserById(receiverId).pipe(
			switchMap((receiver: User) => {
				return from(
					this.friendRequestRepo.findOne({
						where: {
							creator: currentUser,
							receiver,
						},
					}),
				);
			}),
			switchMap((friendRequest: FriendRequest) => {
				return of({ status: friendRequest.status });
			}),
		);
	}

	getFriendRequestUserById(friendRequestid: string): Observable<FriendRequest> {
		return from(
			this.friendRequestRepo.findOne({
				where: [{ requestId: friendRequestid }],
			}),
		);
	}

	respondToFriendRequest(
		friendRequestId: string,
		statusResponse: FriendRequest_Status,
	): Observable<FriendRequestStatus> {
		return this.getFriendRequestUserById(friendRequestId).pipe(
			switchMap((friendRequest: FriendRequest) => {
				return from(
					this.friendRequestRepo.save({
						...friendRequest,
						status: statusResponse,
					}),
				);
			}),
		);
	}

	getFriendRequestsFromRecipients(
		currentUserReq: Partial<User>,
	): Observable<FriendRequest[]> {
		const currentUser = currentUserReq as User;
		return from(
			this.friendRequestRepo.find({
				where: [{ receiver: currentUser }],
			}),
		);
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
