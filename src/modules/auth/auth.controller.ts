import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './auth.service';
import { ApiResponse } from 'src/core/dto/api-response.dto';
import { CookieOptions } from 'express';
import type { Response } from 'express';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getUser(): string {
    return 'This is a user endpoint';
  }

  @Post('register')
  async registerUser(@Body() body: UserDto) {
    const user = await this.userService.registerUser(body);

    return new ApiResponse({
      data: user,
      message: 'User created successfully',
      statusCode: 200,
      success: true,
    });
  }

  @Post('login')
  async loginUser(
    @Body() body: UserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.userService.loginUser(body);

    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res
      .cookie('accessToken', accessToken, {
        ...options,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie('isLoggedIn', true, {
        ...options,
        httpOnly: false,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

    return new ApiResponse({
      data: null,
      message: 'User logged in successfully',
      statusCode: 200,
      success: true,
    });
  }
}
