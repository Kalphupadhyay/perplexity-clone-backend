import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class UserController {
  @Get()
  getUser(): string {
    return 'This is a user endpoint';
  }

  @Post()
  registerUser() {}
}
