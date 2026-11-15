import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function fetchWebpageSnapshot(rawUrl: string): Promise<string> {
  try {
    const urlMatch = rawUrl.match(/https?:\/\/[^\s]+/i);
    const targetUrl = urlMatch
      ? urlMatch[0]
      : rawUrl.startsWith('www.')
        ? `https://${rawUrl}`
        : null;
    if (!targetUrl) return '';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) return '';
    const html = await response.text();

    // Extract JSON-LD structured product blocks if present
    const jsonLdMatches = Array.from(
      html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    ).map((m) => m[1].trim());

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    );

    // Strip script/style tags and condense visible text
    const visibleText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);

    return [
      titleMatch ? `Page Title: ${titleMatch[1].trim()}` : '',
      metaDescMatch ? `Meta Description: ${metaDescMatch[1].trim()}` : '',
      jsonLdMatches.length > 0
        ? `JSON-LD Product Data:\n${jsonLdMatches.join('\n').slice(0, 6000)}`
        : '',
      visibleText ? `Page Content Excerpt:\n${visibleText}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return '';
  }
}

function parseJsonFromModelText(rawText: string): Record<string, unknown> {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse structured JSON from model output.');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Endpoint 1: Multimodal Label OCR + Live Weblink / Barcode Extraction
  app.post('/api/extract-label', async (req, res) => {
    try {
      const {
        frontPhotoBase64,
        backPhotoBase64,
        weblinkOrBarcode,
        categoryHint
      } = req.body as {
        frontPhotoBase64?: string;
        backPhotoBase64?: string;
        weblinkOrBarcode?: string;
        categoryHint?: string;
      };

      const ai = getGenAIClient();
      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      const addImagePart = (dataUrl: string, labelDesc: string) => {
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (match) {
          parts.push({ text: `Attached ${labelDesc}:` });
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      };

      if (frontPhotoBase64) {
        addImagePart(frontPhotoBase64, 'Front Packaging Photo (Brand & Marketing Claims)');
      }
      if (backPhotoBase64) {
        addImagePart(
          backPhotoBase64,
          'Back Packaging Photo (INCI Ingredient List & Supplement Facts)'
        );
      }

      const trimmedLink = (weblinkOrBarcode || '').trim();
      let webpageSnapshot = '';
      if (trimmedLink) {
        webpageSnapshot = await fetchWebpageSnapshot(trimmedLink);
      }

      const hasWeblinkOrQuery = trimmedLink.length > 0;

      const promptText = `You are a regulatory label & product specification specialist for a household & couples product analyzer focused on Personal Care (Soaps, Shampoos, Oils) and Dietary Supplements.
Extract the complete product details from the provided packaging photo(s) and/or product weblink, barcode, or product query.

${
  hasWeblinkOrQuery
    ? `USER WEBLINK / BARCODE / PRODUCT QUERY: "${trimmedLink}"
Use URL Context and Google Search grounding to look up this exact product URL, barcode, or product listing. Retrieve its real brand, product name, category ('personal_care' or 'supplement'), subCategory ('soap', 'shampoo', 'oil', 'multivitamin', 'single_nutrient', 'botanical_herbal', or 'omega_specialty'), retail price (in USD if available), package quantity and unit ('fl oz', 'oz', 'ml', 'g', 'lb', 'servings', or 'count'), marketing/packaging claims, full ordered ingredient list (INCI or supplement excipients), and for supplements: servingSize, activeIngredients (with dosages), thirdPartyTesting ('usp', 'nsf', 'consumerlab', 'cgmp_only', or 'none'), and exceedsUpperLimit (boolean).`
    : ''
}
${
  webpageSnapshot
    ? `\nDIRECT WEBPAGE SNAPSHOT FROM URL:\n${webpageSnapshot}\n`
    : ''
}
Category hint: ${categoryHint || 'auto-detect'}

TRANSPARENCY RULES:
- Extract the real declared ingredient list in label order, packaging claims, price, quantity, and supplement facts when found on the label photo or product webpage/search results.
- If a label photo is blurry or if a webpage does not disclose the full ingredient list, record a clear note inside "unreadableFlags" explaining what was missing or partially unreadable.

Return ONLY a valid JSON object matching this exact structure:
{
  "brand": "string",
  "productName": "string",
  "detectedCategory": "personal_care" | "supplement",
  "detectedSubCategory": "soap" | "shampoo" | "oil" | "multivitamin" | "single_nutrient" | "botanical_herbal" | "omega_specialty",
  "price": number (0 if not found),
  "quantity": number (0 if not found),
  "quantityUnit": "fl oz" | "oz" | "ml" | "g" | "lb" | "servings" | "count",
  "claims": ["string"],
  "ingredients": ["string"],
  "servingSize": "string",
  "activeIngredients": ["string"],
  "thirdPartyTesting": "none" | "usp" | "nsf" | "consumerlab" | "cgmp_only",
  "exceedsUpperLimit": boolean,
  "unreadableFlags": ["string"]
}`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: hasWeblinkOrQuery
          ? {
              systemInstruction:
                'You extract accurate Personal Care (Soap, Shampoo, Oil) and Supplement specifications, full ingredient lists, packaging claims, price, and net weight/quantity from product URLs, barcodes, and label photos. Always output strictly valid JSON.',
              tools: [{ urlContext: {} }, { googleSearch: {} }]
            }
          : {
              systemInstruction:
                'You transcribe product packaging labels accurately without guessing illegible text. Always populate unreadableFlags if any section cannot be read with certainty.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  brand: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  detectedCategory: { type: Type.STRING },
                  detectedSubCategory: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  quantity: { type: Type.NUMBER },
                  quantityUnit: { type: Type.STRING },
                  claims: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  servingSize: { type: Type.STRING },
                  activeIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  thirdPartyTesting: { type: Type.STRING },
                  exceedsUpperLimit: { type: Type.BOOLEAN },
                  unreadableFlags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: [
                  'brand',
                  'productName',
                  'detectedCategory',
                  'claims',
                  'ingredients',
                  'unreadableFlags'
                ]
              }
            }
      });

      const parsed = parseJsonFromModelText(response.text ?? '{}');

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourceUrls = groundingChunks
        .map((c: { web?: { uri?: string; title?: string } }) => c.web?.uri)
        .filter(Boolean);

      res.json({
        ...parsed,
        sourceUrls
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to extract product label or weblink via Gemini API.';
      res.status(500).json({ error: message });
    }
  });

  // Endpoint 2: Regulatory Authority Check for Unmapped Ingredients
  app.post('/api/evaluate-ingredients', async (req, res) => {
    try {
      const { ingredients, category } = req.body as {
        ingredients: string[];
        category: string;
      };

      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        res.json({ evaluations: [] });
        return;
      }

      const ai = getGenAIClient();

      const prompt = `Evaluate the following ${category} product ingredients strictly using ONLY the 9 allowed regulatory bodies:
Allowed Bodies: FDA, USDA, EPA, CDC, NIH, EFSA, WHO/IARC, Codex Alimentarius, FSSAI.

STRICT RULES:
1. NEVER cite journalism (such as NYT), blogs, or third-party apps for a risk rating.
2. When two allowed bodies disagree (e.g., EFSA vs FDA), assign the stricter precautionary Risk Tier ('Low', 'Moderate', or 'High') and document both positions inside "conflictResolutionNote".
3. Flag any plastic-related or endocrine-disrupting chemical (phthalates, BPA/BPS, synthetic polymer microplastics, parabens, BHA/BHT, triclosan) with "isPlasticOrEndocrineConcern": true.
4. Provide a concise "coupleHealthImpact" explaining how this ingredient affects married couples/households (e.g., male/female reproductive health, hormone balance, pregnancy safety, skin/scalp barrier, or daily supplement purity).
5. If none of the 9 allowed bodies have published toxicological or regulatory guidance on an ingredient, you MUST set "riskTier": "No authoritative data found" and "primaryAuthority": "None".

Ingredients to evaluate:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a regulatory toxicology auditor restricted exclusively to FDA, USDA, EPA, CDC, NIH, EFSA, WHO/IARC, Codex Alimentarius, and FSSAI.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ingredientName: { type: Type.STRING },
                    riskTier: {
                      type: Type.STRING,
                      description:
                        'Must be one of: Low, Moderate, High, No authoritative data found'
                    },
                    primaryAuthority: {
                      type: Type.STRING,
                      description:
                        'Must be one of: FDA, USDA, EPA, CDC, NIH, EFSA, WHO/IARC, Codex Alimentarius, FSSAI, None'
                    },
                    registryChecked: { type: Type.STRING },
                    regulatoryStatusAndLimit: { type: Type.STRING },
                    isPlasticOrEndocrineConcern: { type: Type.BOOLEAN },
                    sideEffectsSummary: { type: Type.STRING },
                    coupleHealthImpact: { type: Type.STRING },
                    citationUrl: { type: Type.STRING },
                    conflictResolutionNote: { type: Type.STRING },
                    vulnerableFlags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Subset of: children, pregnancy, allergies, fertility'
                    }
                  },
                  required: [
                    'ingredientName',
                    'riskTier',
                    'primaryAuthority',
                    'registryChecked',
                    'regulatoryStatusAndLimit',
                    'isPlasticOrEndocrineConcern',
                    'sideEffectsSummary',
                    'coupleHealthImpact',
                    'citationUrl',
                    'vulnerableFlags'
                  ]
                }
              }
            },
            required: ['evaluations']
          }
        }
      });

      const parsed = JSON.parse((response.text ?? '{"evaluations":[]}').trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to evaluate ingredients with Gemini API.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Know Your Product server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
