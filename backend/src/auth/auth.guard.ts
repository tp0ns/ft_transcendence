import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class schoolAuthGuard extends AuthGuard('42') {}

