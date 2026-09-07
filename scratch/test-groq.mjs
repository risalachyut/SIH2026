import { generateRAGResponse } from './src/lib/rag/groqClient.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGroq() {
  try {
    console.log("API KEY IS:", process.env.GROQ_API_KEY ? "Set" : "Not Set");
    const res = await generateRAGResponse("help me with employment guidance", []);
    console.log("Success:", res);
  } catch (err) {
    console.error("Groq Error:", err);
  }
}
testGroq();
