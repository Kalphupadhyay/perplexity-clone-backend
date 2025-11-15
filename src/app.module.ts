import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { RagModule } from './modules/Rag/rag.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModule,
    ChatModule,
    RagModule,
    ConfigModule.forRoot(),

    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/project-manager',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
