import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserEntity from '../models/user.entity';
import { UserService } from '../user.service';
import { RelationEntity } from './models/relations.entity';
import { Relation, Relation_Status } from './models/relations.interface';

@Injectable()
export class RelationsService {
	constructor(
		@InjectRepository(RelationEntity)
		private RelationRepo: Repository<RelationEntity>,
		private userService: UserService,
	) {}

	async hasRequestBeenSentOrReceived(
		creator: UserEntity,
		receiver: UserEntity,
	): Promise<boolean> {
		const Relation: Relation = await this.findRelationByUserId(
			creator,
			receiver,
		);

		if (!Relation) return false;
		return true;
	}

	async findRelationByUserId(
		user1: UserEntity,
		user2: UserEntity,
	): Promise<Relation> {
		const Relation: Relation = await this.RelationRepo.findOne({
			where: [
				{ creator: user1, receiver: user2 },
				{ creator: user2, receiver: user1 },
			],
		});
		return Relation;
	}

	async sendFriendRequest(
		receiverUsername: string,
		creatorReq: Partial<UserEntity>,
	) {
		const creator: UserEntity = creatorReq as UserEntity;

		if (receiverUsername === creator.username)
			throw new ForbiddenException('It is not possible to add yourself!');

		const receiver: UserEntity = await this.userService.getUserByUsername(
			receiverUsername,
		);
		if (await this.hasRequestBeenSentOrReceived(creator, receiver))
			throw new ForbiddenException(
				'A friend request has already been sent or received!',
			);
		let Relation: Relation = {
			creator,
			receiver,
			status: 'pending',
		};
		return await this.RelationRepo.save(Relation);
	}

	async respondToFriendRequest(
		RelationId: string,
		statusResponse: Relation_Status,
	): Promise<Relation> {
		const Relation: Relation = await this.getRelationById(RelationId);
		if (!Relation)
			throw new NotFoundException('Friend request entity not found!');
		if (Relation.status === 'blocked')
			throw new ForbiddenException('Status already blocked!');
		Object.assign(Relation, { status: statusResponse });
		this.RelationRepo.save(Relation);
		return Relation;
	}

	async blockUser(
		blockedUsername: string,
		blockerReq: Partial<UserEntity>,
	): Promise<Relation> {
		const blocker: UserEntity = blockerReq as UserEntity;
		const blocked: UserEntity = await this.userService.getUserByUsername(
			blockedUsername,
		);
		if (blocker.username === blockedUsername)
			throw new ForbiddenException('It is not possible to add yourself!');

		const relation: Relation = await this.findRelationByUserId(
			blocker,
			blocked,
		);
		if (relation) {
			if (relation.status === 'blocked')
				throw new ForbiddenException('Users already blocked!');
			Object.assign(relation, {
				creator: blocker,
				receiver: blocked,
				status: 'blocked',
			});
			this.RelationRepo.save(relation);
			return relation;
		}
		let blockedRequest: Relation = {
			creator: blocker,
			receiver: blocked,
			status: 'blocked',
		};
		return await this.RelationRepo.save(blockedRequest);
	}

	async unblockUser(
		RelationId: string,
		userReq: Partial<UserEntity>,
	): Promise<boolean> {
		const user: UserEntity = userReq as UserEntity;
		console.log(user);
		const relation: RelationEntity = await this.getRelationById(RelationId);
		console.log('relation creator: ', relation.creator);
		if (relation.status === 'blocked') {
			if (user.userId === relation.creator.userId) {
				await this.RelationRepo.remove(relation);
				return true;
			} else
				throw new ForbiddenException(
					"Blocked user can't unblock relationship!",
				);
		} else
			throw new ForbiddenException("Can't unblock not blocked relationship");
	}

	async getRelationById(Relationid: string): Promise<RelationEntity> {
		return await this.RelationRepo.findOne({
			where: { requestId: Relationid },
		});
	}
}
