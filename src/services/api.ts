import { NewsSignal, CURATED_NEWS_SIGNALS, SimulationResult } from "@/lib/forecasting";
import { DataPoint } from "@/lib/sampleData";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const NEWS_URL = "https://api.thenewsapi.com/v1/news/all";

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

export interface GeminiInsightResult {
  insight: GeminiInsight | null;
  error: string | null;
}

export interface NewsSignalResult {
  signals: NewsSignal[];
  source: "live" | "empty";
  error: string | null;
}

const cleanJsonFence = (text: string) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const parseGeminiInsight = (payload: unknown): GeminiInsight | null => {
  const textParts = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts;
  const text = textParts?.map((part) => part.text).find((value): value is string => typeof value === "string" && value.trim().length > 0);

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleanJsonFence(text));
    const headline = String(parsed.headline || "").trim();
    const takeaway = String(parsed.takeaway || "").trim();
    const natwestAction = String(parsed.natwest_action || parsed.natwestAction || "").trim();

    if (!headline || !takeaway || !natwestAction) {
      return null;
    }

    return {
      headline,
      takeaway,
      natwestAction,
    };
  } catch {
    return null;
  }
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export async function enhanceSummaryWithGemini(
  data: DataPoint[],
  result: SimulationResult,
): Promise<GeminiInsightResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.info("[Gemini] API key missing, using local fallback summary.");
    return { insight: null, error: null };
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
    const insight = parseGeminiInsight(payload);

    if (!insight) {
      console.warn("[Gemini] Response could not be parsed into a valid insight object.");
      return {
        insight: null,
        error: null,
      };
    }

    console.groupCollapsed("[Gemini] Parsed insight");
    console.log(insight);
    console.groupEnd();

    return {
      insight,
      error: null,
    };
  } catch (error) {
    console.warn("Gemini summary fallback triggered", error);
    const message =
      error instanceof Error && error.message.includes("429")
        ? "Gemini rate limit reached (429). Using the local summary for now."
        : error instanceof Error
          ? error.message
          : "Gemini request failed. Local fallback is shown instead.";
    return {
      insight: null,
      error: message,
    };
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

export async function fetchNewsSignals(): Promise<NewsSignalResult> {
  const apiKey = import.meta.env.VITE_THENEWSAPI_TOKEN || import.meta.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    console.info("[NewsAPI] API key missing.");
    return {
      signals: [],
      source: "empty",
      error: "Live news is unavailable because no The News API token is configured.",
    };
  }

  try {
    const url = new URL(NEWS_URL);
    url.searchParams.set("api_token", apiKey);
    url.searchParams.set("search", '("small business" | "UK business" | "supply chain" | sterling)');
    url.searchParams.set("categories", "business");
    url.searchParams.set("language", "en");
    url.searchParams.set("limit", "6");
    url.searchParams.set("sort", "published_at");
    url.searchParams.set("published_after", `${toIsoDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))}T00:00:00`);
    url.searchParams.set("page", String(Math.floor(Math.random() * 3) + 1));
    url.searchParams.set("_ts", String(Date.now()));
    console.groupCollapsed("[NewsAPI] Request");
    console.log("Request URL", url.toString());
    console.groupEnd();

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`The News API failed with ${response.status}`);
    }

    const payload = await response.json();
    console.groupCollapsed("[NewsAPI] Response");
    console.log("Raw response payload", payload);
    console.groupEnd();
    const articles = Array.isArray(payload?.data) ? payload.data : [];

    if (articles.length === 0) {
      console.warn("[NewsAPI] No articles returned.");
      return {
        signals: [],
        source: "empty",
        error: "No live articles were returned for this query.",
      };
    }

    const mappedSignals = articles
      .filter((article: { title?: string }) => Boolean(article.title))
      .slice(0, 6)
      .map(
        (
          article: {
            title?: string;
            source?: string;
            description?: string;
            snippet?: string;
            published_at?: string;
          },
          index: number,
        ) => {
          const title = article.title || `Business signal ${index + 1}`;
          const category = classifyHeadline(title);

          return {
            id: `live-${index}-${article.published_at || Date.now()}`,
            title,
            source: article.source || "The News API",
            category,
            impact: scoreHeadline(title, category),
            summary: article.description?.trim() || article.snippet?.trim() || "Live headline added to the forecasting context.",
            selected: index < 3,
          };
        },
      );

    console.groupCollapsed("[NewsAPI] Parsed signals");
    console.log(mappedSignals);
    console.groupEnd();

    return {
      signals: mappedSignals,
      source: mappedSignals.length > 0 ? "live" : "empty",
      error: mappedSignals.length > 0 ? null : "Live articles could not be mapped cleanly.",
    };
  } catch (error) {
    console.warn("News fetch fallback triggered", error);
    const message =
      error instanceof Error && error.message.includes("429")
        ? "NewsAPI rate limit reached (429). Try again later."
        : error instanceof Error
          ? error.message
          : "Live news request failed.";
    return {
      signals: [],
      source: "empty",
      error: message,
    };
  }
}
