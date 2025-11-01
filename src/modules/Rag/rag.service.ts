import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';
import { ApiResponse } from 'src/core/dto/api-response.dto';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private embeddings: OpenAIEmbeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });
  private openai = new OpenAI();

  async handleFileUpload(fileName: string, fileBlob: Blob) {
    try {
      const loader = new PDFLoader(fileBlob);
      const docs = await loader.load();

      await QdrantVectorStore.fromDocuments(docs, this.embeddings, {
        url: 'http://localhost:6333',
        collectionName: 'langchainjs-testing',
      });
      return new ApiResponse({
        data: null,
        message: 'File processed and stored successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      this.logger.error('Error in handleFileUpload:', error);
      throw new InternalServerErrorException('Failed to process file upload');
    }
  }

  async handleQuery(question: string) {
    try {
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        this.embeddings,
        {
          url: 'http://localhost:6333',
          collectionName: 'langchainjs-testing',
        },
      );

      const vectorSearcher = vectorStore.asRetriever();

      const relevantChunks = await vectorSearcher.invoke(question);
      const SYSTEM_PROMPT = `
    You are an AI assistant who helps resolving user query based on the
    context available to you from a PDF file with the content and page number.

    Only ans based on the available context from file only.

    Context:
    ${JSON.stringify(relevantChunks)}
  `;

      const message = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }],
      });

      return new ApiResponse({
        data: message.choices[0]?.message?.content || '',
        message: 'Query processed successfully',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      this.logger.error('Error in handleQuery:', error);
      return new InternalServerErrorException('Failed to process query');
    }
  }
}
