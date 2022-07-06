import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// @Injectable()
// export class UsersService {
//   constructor(@InjectRepository(User) private repo: Repository<User>) {}
//   findOne(id: number) {
//     if (!id) {
//       return null;
//     }
//     return this.repo.findOne(id);
//   }
// }
