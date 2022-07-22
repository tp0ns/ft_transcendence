import { Request } from 'express';
import User from 'src/user/models/user.entity';

interface RequestWithUser extends Request {
	user: User;
}

export default RequestWithUser;
