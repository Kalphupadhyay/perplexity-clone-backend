import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

import { ChatRequestDto } from './dto/chatRequest.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get()
  getChat(): string {
    return 'This is a chat endpoint';
  }

  @Post('message')
  async chat(@Body() body: ChatRequestDto) {
    const response = await this.chatService.chatMessage(body);
    return response;
  }
}
