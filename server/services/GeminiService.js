import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logError, logWarn } from '../middleware/logger.js';

export class GeminiService {
  /**
   * Helper to execute a Gemini 2.5 Flash request with a 60-second timeout and logging.
   */
  static async callGemini({ endpoint, prompt, temperature = 0.2 }) {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logError('GEMINI_SERVICE', `[${endpoint}] GEMINI_API_KEY is missing in environment variables.`);
      throw new ApiError(500, 'GEMINI_API_KEY environment variable is missing or not configured.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-2.5-flash';

      // 60-second request timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out after 60 seconds.')), 60000)
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;

      const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        logError('GEMINI_SERVICE', `[${endpoint}] Model=gemini-2.5-flash, Latency=${latencyMs}ms, Status=FAILED, Error="Empty response received from Gemini API."`);
        throw new ApiError(502, 'Received empty response from Gemini 2.5 Flash model.');
      }

      logInfo('GEMINI_SERVICE', `[${endpoint}] Model=gemini-2.5-flash, Latency=${latencyMs}ms, Status=SUCCESS`);
      return text;
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      logError('GEMINI_SERVICE', `[${endpoint}] Model=gemini-2.5-flash, Latency=${latencyMs}ms, Status=FAILED, Error="${err.message}"`);

      if (err.status === 401 || err.message?.includes('API key')) {
        throw new ApiError(401, 'Invalid Gemini API key provided. Please check GEMINI_API_KEY in .env');
      } else if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new ApiError(429, 'Gemini 2.5 Flash rate limit exceeded. Please try again shortly.');
      } else if (err.message?.includes('timed out')) {
        throw new ApiError(504, 'Gemini API request timed out after 60 seconds.');
      }

      throw err instanceof ApiError ? err : new ApiError(500, `Gemini Service Error: ${err.message}`);
    }
  }

  /**
   * Generates a structured research plan (3-7 steps) using Gemini 2.5 Flash.
   */
  static async generatePlan({ researchQuestion, context }) {
    const prompt = `You are a Senior Technical Research Architect.
Research Question: "${researchQuestion}"
${context ? `Research Context: "${context}"` : ''}

Task:
Generate a structured, logical research execution plan containing between 3 and 7 steps.
Each step must be actionable, clear, and focused on empirical evaluation.

Respond STRICTLY in VALID JSON ONLY matching this format:
{
  "steps": [
    {
      "id": "step-1",
      "title": "Clear concise title",
      "description": "Detailed technical strategy for this step",
      "objective": "Target empirical metric or outcome to verify",
      "order": 1
    }
  ]
}`;

    const rawText = await this.callGemini({ endpoint: 'RESEARCH_PLAN_GENERATION', prompt, temperature: 0.2 });
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.steps) && parsed.steps.length >= 3) {
        return parsed.steps.map((s, idx) => ({
          id: s.id || `step-${idx + 1}`,
          title: s.title || `Step ${idx + 1}: Execution Phase`,
          description: s.description || 'Perform empirical audit and evidence collection.',
          objective: s.objective || 'Verify system boundaries.',
          order: idx + 1
        }));
      }
    } catch (parseErr) {
      logWarn('GEMINI_SERVICE', `JSON parse retry for Research Plan: ${parseErr.message}`);
    }

    throw new ApiError(502, 'Gemini 2.5 Flash returned invalid JSON structure for research plan.');
  }

  /**
   * Classifies a document chunk as Supporting, Conflicting, or Insufficient using Gemini 2.5 Flash.
   */
  static async classifyEvidence({ step, chunkText, docName }) {
    const prompt = `You are a Research Evidence Classifier.
Step Objective: "${step.title}" - ${step.objective}
Document Chunk (${docName}): "${chunkText.slice(0, 1500)}"

Task:
Determine if this document chunk contains evidence for the step objective.
If relevant:
1. Extract the exact relevant excerpt string (max 250 chars).
2. Classify as "Supporting", "Conflicting", or "Insufficient".
3. Provide confidence score (0 to 100).
4. Provide a brief reason for this classification.

Respond STRICTLY in VALID JSON ONLY:
{
  "isRelevant": true,
  "excerpt": "Extracted sentence...",
  "classification": "Supporting",
  "confidence": 92,
  "reason": "Directly provides benchmark metrics matching the objective."
}`;

    try {
      const rawText = await this.callGemini({ endpoint: 'EVIDENCE_CLASSIFICATION', prompt, temperature: 0.1 });
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && parsed.isRelevant && ['Supporting', 'Conflicting', 'Insufficient'].includes(parsed.classification)) {
        return {
          isRelevant: true,
          excerpt: parsed.excerpt || chunkText.slice(0, 200) + '...',
          classification: parsed.classification,
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 85)),
          reason: parsed.reason || 'Semantic relevance matching step objective.'
        };
      }
    } catch (err) {
      logWarn('GEMINI_SERVICE', `Evidence classification warning: ${err.message}`);
    }
    return null;
  }

  /**
   * Synthesizes an 11-section Research Brief using Gemini 2.5 Flash.
   */
  static async generateBriefSections({ researchQuestion, context, evidences, documents, plan }) {
    const evidenceSummary = evidences.map((ev, i) =>
      `[Evidence ${i + 1} - ${documents.find(d => String(d._id) === String(ev.documentId))?.filename || 'Document'}]: "${ev.excerpt}" (Classification: ${ev.classification}, Confidence: ${ev.confidence}%, Reason: ${ev.reason})`
    ).join('\n');

    const prompt = `You are a Senior Evidence Synthesizer.
Research Question: "${researchQuestion}"
${context ? `Context: "${context}"` : ''}

Retrieved Empirical Evidence:
${evidenceSummary}

Task:
Synthesize an 11-section Evidence-Based Research Brief.
You MUST write 11 distinct section objects matching these exact headings:
1. Executive Summary
2. Research Question
3. Research Context
4. Methodology
5. Key Findings
6. Supporting Evidence
7. Conflicting Evidence
8. Areas with Insufficient Evidence
9. Unanswered Questions
10. Limitations
11. Overall Conclusion

Respond STRICTLY in VALID JSON ONLY:
{
  "summary": "Executive summary paragraph...",
  "sections": [
    { "heading": "1. Executive Summary", "content": "..." },
    { "heading": "2. Research Question", "content": "..." },
    { "heading": "3. Research Context", "content": "..." },
    { "heading": "4. Methodology", "content": "..." },
    { "heading": "5. Key Findings", "content": "..." },
    { "heading": "6. Supporting Evidence", "content": "..." },
    { "heading": "7. Conflicting Evidence", "content": "..." },
    { "heading": "8. Areas with Insufficient Evidence", "content": "..." },
    { "heading": "9. Unanswered Questions", "content": "..." },
    { "heading": "10. Limitations", "content": "..." },
    { "heading": "11. Overall Conclusion", "content": "..." }
  ],
  "followUpQuestions": [
    "Suggested question 1...",
    "Suggested question 2...",
    "Suggested question 3...",
    "Suggested question 4...",
    "Suggested question 5..."
  ]
}`;

    const rawText = await this.callGemini({ endpoint: 'RESEARCH_BRIEF_GENERATION', prompt, temperature: 0.2 });
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        return parsed;
      }
    } catch (err) {
      logWarn('GEMINI_SERVICE', `Research brief parse error: ${err.message}`);
    }

    throw new ApiError(502, 'Gemini 2.5 Flash returned invalid JSON structure for research brief.');
  }

  /**
   * Answers a user RAG chat prompt using Gemini 2.5 Flash.
   */
  static async generateRAGChatResponse({ userPrompt, evidences, documents, researchQuestion }) {
    const getDocName = (docId) => {
      const doc = documents.find(d => String(d._id) === String(docId));
      return doc ? doc.filename : 'Document Source';
    };

    const evidenceContext = evidences.map((ev, i) =>
      `[Source ${i + 1} - ${getDocName(ev.documentId)}]: "${ev.excerpt}" (Classification: ${ev.classification}, Confidence: ${ev.confidence}%)`
    ).join('\n\n');

    const prompt = `You are EvidenceAI, an Evidence-Based Research Assistant.
Research Question: "${researchQuestion}"
User Query: "${userPrompt}"

Retrieved Empirical Evidence:
${evidenceContext}

RULES:
1. Answer the question ONLY using the retrieved evidence above.
2. NEVER use external model knowledge or invent unverified facts.
3. If the evidence is insufficient to answer completely, state clearly that evidence is insufficient.
4. Mention source document names in your answer.`;

    const answer = await this.callGemini({ endpoint: 'RAG_CHAT_RESPONSE', prompt, temperature: 0.1 });
    return answer;
  }
}

export default GeminiService;
