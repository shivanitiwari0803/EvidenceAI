import dotenv from 'dotenv';

dotenv.config({
  path: '../.env'
});

import mongoose from 'mongoose';
import RetrievalService from './services/RetrievalService.js';

const MONGODB_URI = process.env.MONGODB_URI;

const researchId = '6a6c588f68ea9652be3c3a66';

const question =
  'What statistical tests and analysis techniques are used in this Excel document?';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME || 'EvidenceAI'
    });

    console.log('MongoDB connected');
    console.log('Database:', mongoose.connection.name);

    console.log('\nQuestion:');
    console.log(question);

    const results =
      await RetrievalService.retrieveRelevantChunks(
        researchId,
        question,
        5
      );

    console.log('\n===== QUERY VECTOR SEARCH RESULTS =====\n');

    results.forEach((result, index) => {
      console.log(`Result ${index + 1}`);
      console.log(`Chunk: ${result.chunkNumber}`);
      console.log(`Score: ${result.score}`);
      console.log(`Document: ${result.documentId}`);
      console.log(`Text: ${result.text.slice(0, 500)}`);
      console.log('-----------------------------------');
    });

    console.log(`\nTotal results: ${results.length}`);

  } catch (error) {
    console.error('\n❌ Retrieval test failed:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

test();