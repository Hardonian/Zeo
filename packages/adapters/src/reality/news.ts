import type { NewsItem } from "@zeo/contracts";
import {
  Adapter,
  type AdapterInfo,
  type AdapterDomain,
  type AdapterCadence,
  type ReliabilityBand,
  type RawAdapterOutput,
  generateObservationId,
  computeQualityScore,
  createProvenancePointer,
  checksum,
} from "./framework";

const NEWS_ADAPTER_INFO: AdapterInfo = {
  id: "news-gnews",
  domain: "news" as AdapterDomain,
  name: "GNews Adapter",
  version: "0.1.0",
  metadata: {
    cadence: "hourly" as AdapterCadence,
    reliabilityBand: "secondary" as ReliabilityBand,
    latencyHint: "Near real-time with some delay",
    licenseNotes: "GNews API - verify commercial usage terms",
  },
  enabled: true,
};

const TOPIC_TAGS: Record<string, string[]> = {
  "interest-rates": ["federal reserve", "interest rates", "fed funds", "monetary policy"],
  "inflation": ["inflation", "cpi", "prices", "cost of living"],
  "employment": ["jobs", "unemployment", "labor market", "payrolls"],
  "gdp": ["gdp", "economic growth", "recession"],
  "markets": ["stock market", "wall street", "nasdaq", "sp 500", "markets"],
  "crypto": ["bitcoin", "cryptocurrency", "crypto", "ethereum"],
};

interface GNewsResponse {
  articles: Array<{
    title: string;
    description?: string;
    content?: string;
    url: string;
    image?: string;
    publishedAt: string;
    source?: { name?: string; url?: string };
  }>;
  totalArticles?: number;
}

function isGNewsResponse(data: unknown): data is GNewsResponse {
  return typeof data === "object" && data !== null && "articles" in data;
}

async function fetchGNews(
  query: string,
  from?: string,
  to?: string,
  limit: number = 20
): Promise<GNewsResponse> {
  const apiKey = process.env["GNEWS_API_KEY"] || "";
  const encodedQuery = encodeURIComponent(query);
  let url = `https://gnews.io/api/v4/search?q=${encodedQuery}&lang=en&max=${limit}&apikey=${apiKey}`;

  if (from) url += `&from=${from}`;
  if (to) url += `&to=${to}`;

  if (!apiKey) {
    return generateMockNews(query, limit);
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return generateMockNews(query, limit);
    }

    const data = await response.json();

    if (isGNewsResponse(data)) {
      return data;
    }

    return generateMockNews(query, limit);
  } catch {
    return generateMockNews(query, limit);
  }
}

function generateMockNews(query: string, limit: number): GNewsResponse {
  const topics = Object.keys(TOPIC_TAGS);
  const articles: GNewsResponse["articles"] = [];

  for (let i = 0; i < limit; i++) {
    const topicRaw = topics[Math.floor(Math.random() * topics.length)];
    const topic = topicRaw ?? "general";
    const sourceNames = ["Reuters", "Bloomberg", "CNBC", "WSJ", "Financial Times", "MarketWatch"];
    const sourceNameRaw = sourceNames[Math.floor(Math.random() * sourceNames.length)];
    const sourceName = sourceNameRaw ?? "Unknown";
    const baseTime = Date.now() - Math.random() * 48 * 60 * 60 * 1000;

    articles.push({
      title: `${topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ")}: Latest developments and market impact`,
      description: `This article covers the latest ${topic} news and its potential implications for markets and the economy.`,
      content: `Full article content about ${topic}...`,
      url: `https://example.com/news/${topic}/${Date.now()}`,
      image: `https://example.com/images/${topic}.jpg`,
      publishedAt: new Date(baseTime).toISOString(),
      source: { name: sourceName, url: `https://${sourceName.toLowerCase().replace(/\s+/g, "")}.com` },
    });
  }

  return { articles, totalArticles: articles.length };
}

function computeSurpriseProxy(article: { publishedAt: string }): number {
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  return Math.max(0, 1 - ageHours / 48);
}

function extractTopicTags(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const tags: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_TAGS)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        if (!tags.includes(topic)) {
          tags.push(topic);
        }
        break;
      }
    }
  }

  if (tags.length === 0) {
    tags.push("general");
  }

  return tags;
}

export function createNewsAdapter(): Adapter {
  return {
    info: { ...NEWS_ADAPTER_INFO },

    async fetch(params: Record<string, unknown>): Promise<RawAdapterOutput> {
      const query = (params["query"] as string) || "economy finance markets";
      const from = params["from"] as string | undefined;
      const to = params["to"] as string | undefined;
      const limit = (params["limit"] as number) || 20;

      const response = await fetchGNews(query, from, to, limit);

      const rawOutput: RawAdapterOutput = {
        items: response.articles,
        fetchedAt: new Date().toISOString(),
        checksum: checksum(response.articles),
        sourceInfo: {
          adapterId: this.info.id,
          adapterVersion: this.info.version,
          fetchParams: { query, from, to, limit },
        },
      };

      return rawOutput;
    },

    normalize(rawItems: unknown[]) {
      const articles = rawItems as GNewsResponse["articles"];

      return articles.map((article, index) => {
        const provenance = createProvenancePointer(
          article.url,
          "text",
          article.publishedAt,
          checksum(article),
          { selector: `article:${index}`, page: undefined }
        );

        const qualityScore = computeQualityScore(
          this.info.metadata.reliabilityBand,
          true,
          computeSurpriseProxy(article) > 0.5 ? "fresh" : "stale"
        );

        const topicTags = extractTopicTags(article.title);
        const surpriseProxy = computeSurpriseProxy(article);

        return {
          observationId: generateObservationId(`news:${topicTags[0] || "general"}`, article.publishedAt, article.url),
          signalId: `news:${topicTags[0] || "general"}`,
          t: article.publishedAt,
          valueBand: { low: surpriseProxy, high: surpriseProxy },
          weightApplied: 0.3,
          qualityScore,
          biasAdjustmentsApplied: [] as string[],
          provenance: [provenance],
          sourceId: article.source?.name || "unknown",
          rawRef: { kind: "news", id: article.url },
        };
      });
    },

    getProvenance(rawItem: unknown) {
      const article = rawItem as GNewsResponse["articles"][0];
      return [createProvenancePointer(
        article.url,
        "text",
        article.publishedAt,
        checksum(article),
        { selector: "article" }
      )];
    },

    computeChecksum(data: unknown) {
      return checksum(data);
    },
  };
}

export { NEWS_ADAPTER_INFO, TOPIC_TAGS };

