import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiResponse {
  summary: string;
  risk_score: number;
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generatePrSummary(prDiff: string): Promise<GeminiResponse> {
    try {
      // Truncate the diff if it's too long (Gemini has token limits)
      const truncatedDiff = prDiff.length > 30000 ? prDiff.substring(0, 30000) + '\n[Diff was truncated due to length]' : prDiff;
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Analyze the following GitHub PR diff and provide:
1. A 100-word summary of the changes
2. A risk score from 1 (low risk) to 5 (high risk)

Format your response as a JSON object with 'summary' and 'risk_score' fields.

Diff:
${truncatedDiff}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const text = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```/g, '') : text;
      
      let responseData: Partial<GeminiResponse>;
      try {
        responseData = JSON.parse(jsonString);
      } catch (e) {
        throw new Error('Failed to parse Gemini response as JSON');
      }

      if (!responseData.summary || responseData.risk_score === undefined) {
        throw new Error('Invalid response format from Gemini');
      }

      // Ensure risk score is between 1 and 5
      const riskScore = Math.min(Math.max(Number(responseData.risk_score) || 3, 1), 5);

      return {
        summary: responseData.summary,
        risk_score: riskScore,
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new HttpException(
        `Failed to generate PR summary: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
