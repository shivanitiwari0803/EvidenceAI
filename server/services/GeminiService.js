import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../utils/apiResponse.js';
import { logInfo, logError, logWarn } from '../middleware/logger.js';

export class GeminiService {
  /**
   * Helper to execute a Gemini request with model fallback, 60-second timeout, and logging.
   */
  static async callGemini({ endpoint, prompt, temperature = 0.2 }) {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logError('GEMINI_SERVICE', `[${endpoint}] GEMINI_API_KEY is missing in environment variables.`);
      throw new ApiError(500, 'GEMINI_API_KEY environment variable is missing or not configured.');
    }

    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey });

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
          logError('GEMINI_SERVICE', `[${endpoint}] Model=${model}, Latency=${latencyMs}ms, Status=FAILED, Error="Empty response received from Gemini API."`);
          throw new ApiError(502, 'Received empty response from Gemini Flash model.');
        }

        logInfo('GEMINI_SERVICE', `[${endpoint}] Model=${model}, Latency=${latencyMs}ms, Status=SUCCESS`);
        return text;
      } catch (err) {
        lastError = err;
        const latencyMs = Date.now() - startTime;

        if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota')) {
          logWarn('GEMINI_SERVICE', `[${endpoint}] Model=${model}, Latency=${latencyMs}ms, Status=QUOTA_EXCEEDED, Error="${err.message}"`);
          throw new ApiError(429, 'Gemini API quota exceeded or rate limited. Utilizing fallback engine.');
        }

        logWarn('GEMINI_SERVICE', `[${endpoint}] Model=${model} failed: ${err.message}. Trying next candidate if available...`);
      }
    }

    const latencyMs = Date.now() - startTime;
    logError('GEMINI_SERVICE', `[${endpoint}] All model candidates failed. Latency=${latencyMs}ms, Error="${lastError?.message}"`);

    if (lastError?.status === 401 || lastError?.message?.includes('API key')) {
      throw new ApiError(401, 'Invalid Gemini API key provided. Please check GEMINI_API_KEY in .env');
    } else if (lastError?.message?.includes('timed out')) {
      throw new ApiError(504, 'Gemini API request timed out after 60 seconds.');
    }

    throw lastError instanceof ApiError ? lastError : new ApiError(500, `Gemini Service Error: ${lastError?.message}`);
  }

  /**
   * Generates a structured research plan (3-7 steps) using Gemini Flash.
   */
  static async generatePlan({ researchQuestion, context }) {
    const prompt = `You are a Senior Technical Research Architect.
Research Question: "${researchQuestion}"
${context ? `Research Context: "${context}"` : ''}

Task:
Generate a structured, logical research execution plan containing between 5 and 7 steps.
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

    console.log('[DEBUG Backend] Request Payload for Plan:', { researchQuestion, context });
    console.log('[DEBUG Backend] AI Prompt:', prompt);

    const rawText = await this.callGemini({ endpoint: 'RESEARCH_PLAN_GENERATION', prompt, temperature: 0.2 });
    console.log('[DEBUG Backend] Raw AI Response before parsing:\n', rawText);

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.steps) && parsed.steps.length >= 1) {
        const formattedSteps = parsed.steps.map((s, idx) => ({
          id: s.id || `step-${idx + 1}`,
          title: s.title || `Step ${idx + 1}: Execution Phase`,
          description: s.description || 'Perform empirical audit and evidence collection.',
          objective: s.objective || 'Verify system boundaries.',
          order: idx + 1
        }));
        console.log('[DEBUG Backend] Parsed Research Plan Steps:', formattedSteps);
        return formattedSteps;
      }
    } catch (parseErr) {
      logWarn('GEMINI_SERVICE', `JSON parse retry for Research Plan: ${parseErr.message}`);
    }

    throw new ApiError(502, 'Gemini Flash returned invalid JSON structure for research plan.');
  }

  /**
   * Classifies a document chunk as Supporting, Conflicting, Mixed / Neutral, or Insufficient using Gemini Flash.
   */
  static async classifyEvidence({ step, chunkText, docName }) {
    const prompt = `You are a Research Evidence Classifier.
Step Objective: "${step.title}" - ${step.objective}
Document Chunk (${docName}): "${chunkText.slice(0, 1500)}"

Task:
Determine if this document chunk contains evidence for the step objective.
If relevant:
1. Extract the exact relevant excerpt string (max 250 chars).
2. Classify as "Supporting", "Conflicting", "Mixed / Neutral", or "Insufficient".
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

      if (parsed && parsed.isRelevant && ['Supporting', 'Conflicting', 'Mixed / Neutral', 'Insufficient'].includes(parsed.classification)) {
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
   * Synthesizes a 12-section Research Brief using Gemini Flash.
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
Synthesize a 12-section Evidence-Based Research Brief.
You MUST write 12 distinct section objects matching these exact headings:
1. Executive Summary
2. Research Question
3. Research Objective
4. Methodology
5. Key Findings
6. Supporting Evidence
7. Conflicting Evidence
8. Mixed Evidence
9. Limitations
10. Recommendations
11. Conclusion
12. References / Citations

Respond STRICTLY in VALID JSON ONLY:
{
  "summary": "Executive summary paragraph...",
  "sections": [
    { "heading": "1. Executive Summary", "content": "..." },
    { "heading": "2. Research Question", "content": "..." },
    { "heading": "3. Research Objective", "content": "..." },
    { "heading": "4. Methodology", "content": "..." },
    { "heading": "5. Key Findings", "content": "..." },
    { "heading": "6. Supporting Evidence", "content": "..." },
    { "heading": "7. Conflicting Evidence", "content": "..." },
    { "heading": "8. Mixed Evidence", "content": "..." },
    { "heading": "9. Limitations", "content": "..." },
    { "heading": "10. Recommendations", "content": "..." },
    { "heading": "11. Conclusion", "content": "..." },
    { "heading": "12. References / Citations", "content": "..." }
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

    throw new ApiError(502, 'Gemini Flash returned invalid JSON structure for research brief.');
  }

  /**
   * Answers a user RAG chat prompt using Gemini Flash with multi-turn conversation memory & intent awareness.
   */
  static async generateRAGChatResponse({
    userPrompt,
    intent = 'GENERAL_EVIDENCE_RETRIEVAL',
    evidences = [],
    documents = [],
    researchQuestion = '',
    conversationHistory = [],
    previousAssistantMessage = null,
    plan = null,
    brief = null
  }) {
    const getDocName = (docId) => {
      const doc = documents.find(d => String(d._id) === String(docId));
      return doc ? doc.filename : 'Document Source';
    };

    const evidenceContext = evidences.map((ev, i) =>
      `[Source ${i + 1} - ${getDocName(ev.documentId)}]: "${ev.excerpt}" (Classification: ${ev.classification || 'Supporting'}, Confidence: ${ev.confidence || 85}%, Reason: ${ev.reason || 'N/A'})`
    ).join('\n\n');

    const historyContext = conversationHistory.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: "${m.content.slice(0, 300)}"`
    ).join('\n');

    const prompt = `You are EvidenceAI, an Enterprise Evidence-Based Research Assistant.
Primary Research Question: "${researchQuestion}"
Detected Query Intent: "${intent}"

Recent Multi-Turn Conversation History:
${historyContext || 'No previous conversation turns.'}

${previousAssistantMessage ? `Previous Assistant Response: "${previousAssistantMessage.content.slice(0, 500)}"` : ''}

Retrieved Empirical Evidence:
${evidenceContext || 'No relevant document evidence retrieved.'}

TASK & CONVERSATIONAL INSTRUCTIONS:
1. Multi-Turn Context: Interpret the User Query ("${userPrompt}") in full context of recent conversation turns and previous assistant responses.
2. If Intent is "CITATION_REQUEST": Do NOT re-answer from scratch. Return the exact source documents, chunk IDs, evidence classifications, and confidence scores used in the previous answer.
3. If Intent is "SUMMARY_REQUEST": Summarize the previous answer & retrieved evidence clearly and concisely.
4. If Intent is "REASONING_REQUEST": Explain the underlying technical reasoning behind the previous answer using empirical evidence.
5. If Intent is "CONFLICT_ANALYSIS": Highlight only conflicting empirical claims, trade-offs, or contradictions.
6. If Intent is "SUPPORTING_ANALYSIS": Focus on supporting evidence and strongest metrics.
7. Strict Grounding: Use ONLY retrieved evidence or provided conversation history. NEVER invent facts or use external knowledge.
8. If Query is Out-of-Scope: Respond EXACTLY: "This question cannot be answered using the uploaded research documents."

FORMAT YOUR RESPONSE IN HIGH-END ENTERPRISE MARKDOWN:
### Answer
[Detailed evidence-grounded answer]

### Evidence Breakdown
- **Supporting**: [Count] claims
- **Conflicting**: [Count] claims
- **Insufficient**: [Count] claims

### Sources & Citations
- 📄 **[Document Name]** — *[Classification]* ([Confidence]% Confidence)
  > "[Excerpt text]"

### Confidence Score
**[Calculated Overall Confidence %]%** — Grounded strictly in uploaded research documents.`;

    const answer = await this.callGemini({ endpoint: 'RAG_CHAT_RESPONSE', prompt, temperature: 0.1 });
    return answer;
  }
}

export default GeminiService;
