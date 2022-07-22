import {
	isAlphanumeric,
	IsAlphanumeric,
	isEmpty,
	IsEmpty,
	IsNotEmpty,
	isNumber,
	Length,
} from 'class-validator';
import { User } from '../user.entity';

export class UserDto {
	@IsAlphanumeric()
	userId: string;

	schoolId: number;

	username: string;

	image_url: string;

	profileImage: string;

	friends: User[];
}
