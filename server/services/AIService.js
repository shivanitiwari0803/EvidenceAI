import { GeminiService } from './GeminiService.js';
import { logInfo, logWarn } from '../middleware/logger.js';

export class AIService {
  /**
   * Generates a structured research plan via Gemini 2.5 Flash.
   */
  static async generatePlan(researchQuestion, context = '') {
    logInfo('AI_SERVICE', `Generating AI research plan for: "${researchQuestion.slice(0, 40)}..."`);

    if (process.env.GEMINI_API_KEY) {
      try {
        const steps = await GeminiService.generatePlan({ researchQuestion, context });
        return steps;
      } catch (err) {
        logWarn('AI_SERVICE', `Gemini API call failed: ${err.message}. Falling back to structured generator.`);
      }
    } else {
      logInfo('AI_SERVICE', 'GEMINI_API_KEY not configured. Utilizing fallback structured plan generator.');
    }

    return this.fallbackPlanGenerator(researchQuestion, context);
  }

  /**
   * Structured Fallback Plan Generator ensuring zero hanging states.
   */
  static fallbackPlanGenerator(researchQuestion, context) {
    console.log('[DEBUG Backend] Utilizing fallback plan generator for question:', researchQuestion);
    const steps = [
      {
        id: 'step-1',
        title: 'Problem Framing & Boundary Definition',
        description: `Analyze core research question boundaries and constraints regarding: "${researchQuestion.slice(0, 60)}...".`,
        objective: 'Define empirical evaluation criteria and system operational limits.',
        order: 1
      },
      {
        id: 'step-2',
        title: 'Literature Review & Technical Audit',
        description: 'Extract empirical data, benchmarks, and vulnerability disclosures from uploaded technical documentation.',
        objective: 'Corroborate claims with extracted source document text chunks.',
        order: 2
      },
      {
        id: 'step-3',
        title: 'Comparative Vulnerability & Bottleneck Analysis',
        description: 'Evaluate system trade-offs, security injection paths, and latency bottlenecks against baseline benchmarks.',
        objective: 'Classify evidence into Supporting, Conflicting, and Insufficient categories.',
        order: 3
      },
      {
        id: 'step-4',
        title: 'Synthesis & Evidence-Backed Brief Formulation',
        description: 'Synthesize findings into an evidence-backed research brief with explicit citation references.',
        objective: 'Produce verified technical brief with complete citation tracing.',
        order: 4
      },
      {
        id: 'step-5',
        title: 'Empirical Verification & Stakeholder Governance Review',
        description: 'Conduct final audit of evidence quality metrics, unanswered questions, and strategic recommendations.',
        objective: 'Validate complete audit trail prior to enterprise stakeholder sign-off.',
        order: 5
      }
    ];

    console.log('[DEBUG Backend] Fallback Plan Steps Generated:', steps);
    return steps;
  }
}

export default AIService;
