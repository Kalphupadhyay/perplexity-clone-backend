import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
