import {
  BadRequestException,
  Body,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import type { UserModel } from 'src/schemas/user.schema';

import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  generateRefreshTokenAccessToken = async (userId: string) => {
    try {
      const user = await this.userModel.findById(userId);

      const accessToken = user?.generateAccessToken();
      const refreshToken = user?.generateRefreshToken();

      console.log(accessToken, refreshToken);
      user!.refreshToken = refreshToken!;
      await user?.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch {
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  };

  async registerUser(userDetails: UserDto) {
    const { email, password } = userDetails;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.userModel.create({
      email,
      password,
    });
    const { hashedToken, tokenExpiry } = newUser.generateTempToken();

    newUser.emailVerificationToken = hashedToken;
    newUser.emailVerificationTokenExpiry = tokenExpiry;
    await newUser.save({ validateBeforeSave: false });

    const createdUser = await this.userModel
      .findById(newUser._id)
      .select(
        '-password -__v -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgortPasswordTokenExpiry -refreshToken',
      );

    if (!createdUser) {
      throw new InternalServerErrorException('Failed to create user');
    }
    return createdUser;
  }

  async loginUser(userDetails: UserDto) {
    const { email, password } = userDetails;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new BadRequestException({
        errorCode: 400,
        message: 'Invalid credentials',
      });
    }

    const { accessToken, refreshToken } =
      await this.generateRefreshTokenAccessToken(user._id as string);

    return { accessToken, refreshToken };
  }
}
