import { Injectable, MessageEvent } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import OpenAI from 'openai';

import { Observable, Subject } from 'rxjs';
import { Stream } from 'openai/streaming';

@Injectable()
export class ChatService {
  private messageStream = new Subject<string>(); // holds new messages
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

  async chatMessage(message: string): Promise<Observable<string>> {
    this.messages.push({
      role: 'user',
      content: message,
    });

    const stream = await this.openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: this.messages,
      stream: true,
    });
    void this.startChatStream(stream);
    return this.messageStream.asObservable();
  }

  async startChatStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ) {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      console.log('Received chunk content:', content);
      if (content) {
        this.messageStream.next(content.trim());
      }
      if (chunk.choices[0]?.finish_reason) {
        break;
      }
    }
    this.messageStream.complete();
  }
}
