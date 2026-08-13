import dotenv from 'dotenv';
import EmbeddingService from './services/EmbeddingService.js';

dotenv.config({
  path: '../.env'
});

console.log(
  'GEMINI_API_KEY loaded:',
  process.env.GEMINI_API_KEY ? 'YES' : 'NO'
);

const text = `
Generative AI can help software developers write code,
debug applications, and automate repetitive programming tasks.
`;

try {
  const embedding =
    await EmbeddingService.generateDocumentEmbedding(text);

  console.log('Embedding generated successfully!');
  console.log('Embedding length:', embedding.length);
  console.log('First 10 values:', embedding.slice(0, 10));
} catch (error) {
  console.error('Embedding test failed:');
  console.error(error);
}