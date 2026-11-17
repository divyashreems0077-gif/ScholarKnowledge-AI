import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

interface KnowledgeContextItem {
  id: string;
  name: string;
  provider: string;
  providerType: string;
  description: string;
  educationLevel: string;
  eligibleCourses: string[];
  minMarksPercent: number;
  maxFamilyIncome: number | null;
  eligibleCategories: string[];
  eligibleStates: string[];
  genderRequirement: string;
  benefits: string;
  requiredDocuments: string[];
  openingDate: string;
  deadline: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: string;
  specialConditions: string;
  studentEvaluation?: {
    overallStatus: string;
    summary: string;
    failedConditions: string[];
    missingConditions: string[];
  };
}

app.post('/api/ask', async (req, res) => {
  try {
    const { question, scholarships, studentProfile } = req.body as {
      question?: string;
      scholarships?: KnowledgeContextItem[];
      studentProfile?: Record<string, unknown>;
    };

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'A scholarship question is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in the server environment. Please configure it in Settings > Secrets to enable natural-language queries.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const kbPayload = Array.isArray(scholarships) ? scholarships : [];

    const systemInstruction = `You are ScholarKnowledge AI, a strict knowledge-base retrieval and explanation assistant for undergraduate scholarships in India.

STRICT GROUNDING RULES:
1. Answer ONLY using the provided JSON scholarship knowledge base and the pre-computed rule-engine evaluations.
2. NEVER invent scholarship names, benefit amounts, deadlines, income limits, or eligibility rules that are not explicitly present in the provided knowledge base.
3. Eligibility is ALWAYS determined by the rule-based reasoning engine provided in "studentEvaluation". Do NOT guess or override "studentEvaluation.overallStatus".
4. If the user asks about a scholarship, country, postgraduate scheme, or detail NOT present in the provided knowledge base, clearly state in "unverifiedNotice" and "directAnswer" that it could not be verified from the current knowledge base.
5. Note clearly when referencing illustrative prototype sample records.
6. Return concise, accurate, student-friendly prose.`;

    const prompt = `Student Question: "${question.trim()}"

Student Profile Summary:
${JSON.stringify(studentProfile ?? {}, null, 2)}

Structured Scholarship Knowledge Base & Rule-Engine Evaluations:
${JSON.stringify(kbPayload, null, 2)}

Provide a grounded response referencing exact scholarship IDs from the knowledge base.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directAnswer: {
              type: Type.STRING,
              description: 'Clear, direct answer grounded strictly in the scholarship knowledge base.',
            },
            unverifiedNotice: {
              type: Type.STRING,
              description:
                'Optional warning if any part of the user question could not be verified from the knowledge base.',
            },
            keyConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Up to 5 concrete eligibility conditions, document items, or comparison points from the KB.',
            },
            referencedScholarshipIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exact IDs of scholarships from the provided knowledge base that support this answer.',
            },
          },
          required: ['directAnswer', 'keyConditions', 'referencedScholarshipIds'],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText) as {
      directAnswer?: string;
      unverifiedNotice?: string;
      keyConditions?: string[];
      referencedScholarshipIds?: string[];
    };

    const refIds = new Set(parsed.referencedScholarshipIds ?? []);
    const matchedSources = kbPayload
      .filter((s) => refIds.has(s.id))
      .map((s) => ({
        scholarshipId: s.id,
        name: s.name,
        provider: s.provider,
        deadline: s.deadline,
        incomeLimit: s.maxFamilyIncome ? `₹${s.maxFamilyIncome.toLocaleString('en-IN')}` : 'No Income Limit',
        minMarks: `${s.minMarksPercent}%`,
        officialSourceUrl: s.officialSourceUrl,
        lastVerifiedDate: s.lastVerifiedDate,
        eligibilityStatus: s.studentEvaluation?.overallStatus,
      }));

    return res.json({
      directAnswer: parsed.directAnswer || 'Unable to verify details from the current knowledge base.',
      unverifiedNotice: parsed.unverifiedNotice || undefined,
      keyConditions: Array.isArray(parsed.keyConditions) ? parsed.keyConditions : [],
      sources: matchedSources,
    });
  } catch (err: unknown) {
    console.error('Error in /api/ask:', err);
    const message = err instanceof Error ? err.message : 'Unexpected server error while querying ScholarKnowledge.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarKnowledge AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
