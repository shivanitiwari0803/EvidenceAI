import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini Models with API Key:', apiKey ? keySummary(apiKey) : 'MISSING');

  const modelsToTest = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
  const ai = new GoogleGenAI({ apiKey });

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: 'Say "Gemini Test OK" in 3 words.'
      });
      console.log(`✅ SUCCESS [${model}]:`, response.text?.trim());
    } catch (err) {
      console.log(`❌ FAILED [${model}]:`, err.message);
    }
  }
}

function keySummary(key) {
  return key.slice(0, 6) + '...' + key.slice(-4);
}

testGeminiModels();
