import { NewsSignal, CURATED_NEWS_SIGNALS, SimulationResult } from "@/lib/forecasting";
import { DataPoint } from "@/lib/sampleData";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const NEWS_URL = "https://newsapi.org/v2/everything";

const buildGeminiPayload = (data: DataPoint[], result: SimulationResult) => ({
  contents: [
    {
      parts: [
        {
          text: `You are a finance dashboard assistant. Return ONLY valid JSON with keys: headline, takeaway, natwest_action.
headline must be 8 words or fewer.
takeaway must be 18 words or fewer.
natwest_action must be 12 words or fewer.
Use a numeric, KPI-focused tone.

Historical data: ${JSON.stringify(data.slice(-12))}
Simulation result: ${JSON.stringify(result)}`,
        },
      ],
    },
  ],
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "application/json",
  },
});

export interface GeminiInsight {
  headline: string;
  takeaway: string;
  natwestAction: string;
}

export async function enhanceSummaryWithGemini(
  data: DataPoint[],
  result: SimulationResult,
): Promise<GeminiInsight | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.info("[Gemini] API key missing, using local fallback summary.");
    return null;
  }

  try {
    const requestBody = buildGeminiPayload(data, result);
    console.groupCollapsed("[Gemini] Request");
    console.log("Historical data", data);
    console.log("Simulation result", result);
    console.log("Request body", requestBody);
    console.groupEnd();

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed with ${response.status}`);
    }

    const payload = await response.json();
    console.groupCollapsed("[Gemini] Response");
    console.log("Raw response payload", payload);
    console.groupEnd();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      console.warn("[Gemini] No text content found in response payload.");
      return null;
    }

    const parsed = JSON.parse(text);
    console.groupCollapsed("[Gemini] Parsed insight");
    console.log(parsed);
    console.groupEnd();

    return {
      headline: String(parsed.headline || "").trim(),
      takeaway: String(parsed.takeaway || "").trim(),
      natwestAction: String(parsed.natwest_action || parsed.natwestAction || "").trim(),
    };
  } catch (error) {
    console.warn("Gemini summary fallback triggered", error);
    return null;
  }
}

const classifyHeadline = (title: string): NewsSignal["category"] => {
  if (/fx|currency|sterling|dollar|euro/i.test(title)) return "fx";
  if (/supply|shipping|freight|port|inventory/i.test(title)) return "supply";
  if (/inflation|cost|wages|energy/i.test(title)) return "cost";
  if (/consumer|retail|demand|spending/i.test(title)) return "demand";
  return "confidence";
};

const scoreHeadline = (title: string, category: NewsSignal["category"]) => {
  if (/surge|improve|grow|boost|strong/i.test(title)) return category === "demand" ? 7 : 4;
  if (/risk|fall|drop|weak|delay|disrupt/i.test(title)) return -8;
  return category === "demand" ? 3 : -3;
};

export async function fetchNewsSignals(): Promise<NewsSignal[]> {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    console.info("[NewsAPI] API key missing, using curated demo signals.", CURATED_NEWS_SIGNALS);
    return CURATED_NEWS_SIGNALS;
  }

  try {
    const url = new URL(NEWS_URL);
    url.searchParams.set("q", "small business OR UK business OR supply chain OR sterling");
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "6");
    url.searchParams.set("sortBy", "publishedAt");
    console.groupCollapsed("[NewsAPI] Request");
    console.log("Request URL", url.toString());
    console.groupEnd();

    const response = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`NewsAPI failed with ${response.status}`);
    }

    const payload = await response.json();
    console.groupCollapsed("[NewsAPI] Response");
    console.log("Raw response payload", payload);
    console.groupEnd();
    const articles = Array.isArray(payload?.articles) ? payload.articles : [];

    if (articles.length === 0) {
      console.warn("[NewsAPI] No articles returned, falling back to curated signals.");
      return CURATED_NEWS_SIGNALS;
    }

    const mappedSignals = articles.slice(0, 6).map((article: { title?: string; source?: { name?: string } }, index: number) => {
      const title = article.title || `Business signal ${index + 1}`;
      const category = classifyHeadline(title);

      return {
        id: `live-${index}`,
        title,
        source: article.source?.name || "NewsAPI",
        category,
        impact: scoreHeadline(title, category),
        summary: "Live headline added to the forecasting context.",
        selected: index < 3,
      };
    });

    console.groupCollapsed("[NewsAPI] Parsed signals");
    console.log(mappedSignals);
    console.groupEnd();

    return mappedSignals;
  } catch (error) {
    console.warn("News fetch fallback triggered", error);
    return CURATED_NEWS_SIGNALS;
  }
}
