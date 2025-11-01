import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);
  constructor(private ragService: RagService) {}

  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file'))
  async handleFileUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }
    const buffer = Buffer.from(file.buffer);
    const blob = new Blob([buffer], {
      type: 'text/pdf',
    });
    return await this.ragService.handleFileUpload(file.originalname, blob);
  }

  @Get('/chat')
  async handleQuery(@Query('query') question: string) {
    if (!question || !question.trim()) {
      throw new BadRequestException('Query parameter "query" is required');
    }
    return await this.ragService.handleQuery(question);
  }
}
