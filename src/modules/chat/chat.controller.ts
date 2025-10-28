import { Body, Controller, Get, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { map, Observable } from 'rxjs';
import { ChatRequestDto } from './dto/chatRequest.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get()
  getChat(): string {
    return 'This is a chat endpoint';
  }

  @Sse('stream')
  async chat(
    @Query() query: ChatRequestDto,
  ): Promise<Observable<{ data: string }>> {
    const response = await this.chatService.chatMessage(query.message);
    return response.pipe(map((data: string) => ({ data })));
  }
}
