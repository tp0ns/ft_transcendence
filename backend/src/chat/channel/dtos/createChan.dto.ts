import { IsEmpty, IsNotEmpty, Length } from "class-validator";

export class CreateUserDto {
	@IsEmpty()
	id: string;

	@IsNotEmpty({ message: 'User should have an username'})
	@Length(2, 255, { message: 'The Username must be between 2 and 255 characters long'})
	username: string;

}
