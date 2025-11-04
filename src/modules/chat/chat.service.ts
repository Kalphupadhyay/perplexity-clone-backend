import { Injectable, MessageEvent } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import OpenAI from 'openai';
import { ChatRequestDto } from './dto/chatRequest.dto';
import { ApiResponse } from 'src/core/dto/api-response.dto';

@Injectable()
export class ChatService {
  private openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
  ];

  async chatMessage(responseBody: ChatRequestDto) {
    this.messages.push({
      role: 'user',
      content: responseBody.message,
    });

    const response = await this.openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: this.messages,
    });

    this.messages.push({
      role: 'assistant',
      content: response.choices[0].message.content,
    });

    return new ApiResponse({
      data: response.choices[0].message.content,
      message: 'response from AI',
      statusCode: 200,
      success: true,
    });
  }

  // async startChatStream(
  //   stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  // ) {
  //   for await (const chunk of stream) {
  //     const content = chunk.choices[0]?.delta?.content || '';

  //     if (content) {
  //       this.messageStream.next(content.trim());
  //     }
  //     if (chunk.choices[0]?.finish_reason) {
  //       this.messageStream.next('Done');
  //       break;
  //     }
  //   }
  //   this.messageStream.complete();
  // }
}
