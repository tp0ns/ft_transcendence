import UserEntity from 'src/user/models/user.entity';

export class invitationInterface {
	id: string = '';
	roomId: string;
	player1: UserEntity;
	player2?: UserEntity;
}
