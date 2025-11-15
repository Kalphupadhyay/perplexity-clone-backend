import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

export type UserDocument = User & Document & UserMethods;

export interface UserMethods {
  isPasswordCorrect(password: string): boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateTempToken(): {
    unHashedToken: string;
    hashedToken: string;
    tokenExpiry: Date;
  };
}

export type UserModel = Model<UserDocument>;

@Schema({ _id: false })
class Avatar {
  @Prop({ default: 'https://placehold.co/200x200' })
  url: string;

  @Prop({ default: '' })
  localPath: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Avatar, default: () => ({}) })
  avatar: Avatar;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  fullName: string;

  @Prop({ required: [true, 'Password is required'] })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  refreshToken: string;

  @Prop()
  forgotPasswordToken: string;

  @Prop()
  forgotPasswordTokenExpiry: Date;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationTokenExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  this.password = createHash('sha256').update(this.password).digest('hex');

  next();
});

UserSchema.methods.isPasswordCorrect = function (password: string) {
  const hashedPassword = createHash('sha256').update(password).digest('hex');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return hashedPassword === this.password;
};

UserSchema.methods.generateAccessToken = function (this: UserDocument) {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: '1d' },
  );
};

UserSchema.methods.generateRefreshToken = function (this: UserDocument) {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' },
  );
};

UserSchema.methods.generateTempToken = function () {
  const unHashedToken = randomBytes(20).toString('hex');
  const hashedToken = createHash('sha256').update(unHashedToken).digest('hex');
  const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  };
};
