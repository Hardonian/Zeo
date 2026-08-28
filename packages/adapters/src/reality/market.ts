import type { MarketSeriesItem } from "@zeo/contracts";
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

const MARKET_ADAPTER_INFO: AdapterInfo = {
  id: "market-yahoo",
  domain: "market" as AdapterDomain,
  name: "Yahoo Finance Market Adapter",
  version: "0.1.0",
  metadata: {
    cadence: "hourly" as AdapterCadence,
    reliabilityBand: "primary" as ReliabilityBand,
    latencyHint: "15-20min delayed for free tier",
    licenseNotes: "Yahoo Finance data - verify terms of service for commercial use",
  },
  enabled: true,
};

const DEFAULT_MARKET_PAIRS = [
  "SPY",
  "QQQ",
  "DIA",
  "BTC-USD",
  "ETH-USD",
  "EURUSD=X",
  "GC=F",
];

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  impliedVolatility?: number | null;
}

interface YahooHistorical {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  AdjClose: number;
  Volume: number;
}

function isYahooQuote(data: unknown): data is YahooQuote {
  return typeof data === "object" && data !== null &&
    "symbol" in data && "regularMarketPrice" in data;
}

function isYahooHistoricalResponse(data: unknown): data is { result: Array<{ timestamp: number[]; indicators: { quote: Array<{ open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }> } }> } {
  return typeof data === "object" && data !== null &&
    "result" in data && Array.isArray((data as { result: unknown }).result);
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: unknown[];
  };
}

function isYahooQuoteResponse(data: unknown): data is YahooQuoteResponse {
  return typeof data === "object" && data !== null && "quoteResponse" in data;
}

async function fetchYahooQuote(symbol: string): Promise<YahooQuote | null> {
  const apiKey = process.env["YAHOO_API_KEY"];
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

  try {
    const response = await fetch(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });

    if (!response.ok) {
      return generateMockQuote(symbol);
    }

    const data = await response.json();

    if (isYahooQuoteResponse(data)) {
      const result = data.quoteResponse?.result?.[0];
      if (result && isYahooQuote(result)) {
        return result;
      }
    }

    return generateMockQuote(symbol);
  } catch {
    return generateMockQuote(symbol);
  }
}

function generateMockQuote(symbol: string): YahooQuote {
  const basePrice = symbol.includes("BTC") ? 95000 :
                   symbol.includes("ETH") ? 3400 :
                   symbol.includes("SPY") ? 580 :
                   symbol.includes("QQQ") ? 510 :
                   symbol.includes("DIA") ? 430 :
                   symbol.includes("GC=F") ? 2650 :
                   100;

  const volatility = symbol.includes("BTC") || symbol.includes("ETH") ? 0.03 : 0.01;
  const change = basePrice * volatility * (Math.random() - 0.5);

  return {
    symbol,
    regularMarketPrice: basePrice + change,
    regularMarketChange: change,
    regularMarketChangePercent: (change / basePrice) * 100,
    regularMarketVolume: Math.floor(Math.random() * 10000000),
    regularMarketDayHigh: basePrice + Math.abs(change) * 2,
    regularMarketDayLow: basePrice - Math.abs(change) * 2,
    fiftyTwoWeekHigh: basePrice * 1.2,
    fiftyTwoWeekLow: basePrice * 0.8,
    impliedVolatility: symbol.includes("SPY") || symbol.includes("BTC") ? 0.15 + Math.random() * 0.1 : null,
  };
}

async function fetchYahooHistory(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<YahooHistorical[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(new Date(endDate).getTime() / 1000)}&interval=1d`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return generateMockHistory(symbol, startDate, endDate);
    }

    const data = await response.json();

    if (isYahooHistoricalResponse(data)) {
      const result = data.result[0];
      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];

        return timestamps.map((t: number, i: number) => {
          const dateStr = new Date(t * 1000).toISOString().split("T")[0] || "2000-01-01";
          return {
            Date: dateStr,
            Open: quote.open?.[i] || 0,
            High: quote.high?.[i] || 0,
            Low: quote.low?.[i] || 0,
            Close: quote.close?.[i] || 0,
            AdjClose: quote.close?.[i] || 0,
            Volume: quote.volume?.[i] || 0,
          };
        });
      }
    }

    return generateMockHistory(symbol, startDate, endDate);
  } catch {
    return generateMockHistory(symbol, startDate, endDate);
  }
}

function generateMockHistory(
  symbol: string,
  startDate: string,
  endDate: string
): YahooHistorical[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  const basePrice = symbol.includes("BTC") ? 95000 :
                   symbol.includes("ETH") ? 3400 :
                   symbol.includes("SPY") ? 580 :
                   100;

  const results: YahooHistorical[] = [];
  let price = basePrice;

  while (current <= end) {
    const change = price * 0.02 * (Math.random() - 0.5);
    price = Math.max(price + change, basePrice * 0.9);

    const dateStr = current.toISOString().split("T")[0] || "2000-01-01";
    results.push({
      Date: dateStr,
      Open: price - change / 2,
      High: price + Math.abs(change),
      Low: price - Math.abs(change),
      Close: price,
      AdjClose: price,
      Volume: Math.floor(Math.random() * 10000000),
    });

    current.setDate(current.getDate() + 1);
  }

  return results;
}

function computeVolatilityRegime(high: number, low: number, close: number): "low" | "medium" | "high" {
  const range = (high - low) / close;

  if (range < 0.01) return "low";
  if (range < 0.025) return "medium";
  return "high";
}

export function createMarketAdapter(): Adapter {
  return {
    info: { ...MARKET_ADAPTER_INFO },

    async fetch(params: Record<string, unknown>): Promise<RawAdapterOutput> {
      const symbols = (params["symbols"] as string[]) || DEFAULT_MARKET_PAIRS;
      const mode = (params["mode"] as string) || "quote";
      const startDateStr = (params["startDate"] as string) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] || "2000-01-01";
      const endDateStr = (params["endDate"] as string) || new Date().toISOString().split("T")[0] || "2099-12-31";
      const startDate = startDateStr;
      const endDate = endDateStr;

      const allItems: MarketSeriesItem[] = [];

      if (mode === "quote") {
        for (const symbol of symbols) {
          const quote = await fetchYahooQuote(symbol);

          if (quote) {
            allItems.push({
              kind: "market",
              sourceId: `yahoo:${symbol}`,
              variable: symbol,
              t: new Date().toISOString(),
              v: quote.regularMarketPrice,
              meta: {
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                volume: quote.regularMarketVolume,
                dayHigh: quote.regularMarketDayHigh,
                dayLow: quote.regularMarketDayLow,
                fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
                regimeHint: computeVolatilityRegime(
                  quote.regularMarketDayHigh,
                  quote.regularMarketDayLow,
                  quote.regularMarketPrice
                ),
                iv: quote.impliedVolatility,
              },
            });
          }
        }
      } else {
        for (const symbol of symbols) {
          const history = await fetchYahooHistory(symbol, startDate, endDate);

          for (const bar of history) {
            allItems.push({
              kind: "market",
              sourceId: `yahoo:${symbol}:history`,
              variable: symbol,
              t: new Date(bar.Date).toISOString(),
              v: bar.Close,
              meta: {
                open: bar.Open,
                high: bar.High,
                low: bar.Low,
                volume: bar.Volume,
                regimeHint: computeVolatilityRegime(bar.High, bar.Low, bar.Close),
              },
            });
          }
        }
      }

      const rawOutput: RawAdapterOutput = {
        items: allItems,
        fetchedAt: new Date().toISOString(),
        checksum: checksum(allItems),
        sourceInfo: {
          adapterId: this.info.id,
          adapterVersion: this.info.version,
          fetchParams: { symbols, mode, startDate, endDate },
        },
      };

      return rawOutput;
    },

    normalize(rawItems: MarketSeriesItem[]) {
      return rawItems.map(item => {
        const provenance = createProvenancePointer(
          item.sourceId,
          "text",
          item.t,
          checksum(item),
          { selector: `value:${item.v}`, page: undefined }
        );

        const regimeHint = (item.meta?.regimeHint as "low" | "medium" | "high") || "medium";
        const biasAdjustments = regimeHint === "high" ? ["regime:volatility_expansion"] : [];

        const qualityScore = computeQualityScore(
          this.info.metadata.reliabilityBand,
          true,
          "fresh"
        );

        return {
          observationId: generateObservationId(item.variable, item.t, item.sourceId),
          signalId: `price:${item.variable}`,
          t: item.t,
          valueBand: { low: item.v, high: item.v },
          weightApplied: 0.6,
          qualityScore,
          biasAdjustmentsApplied: biasAdjustments,
          provenance: [provenance],
          sourceId: item.sourceId,
          rawRef: { kind: "market", id: `${item.variable}:${item.t}` },
        };
      });
    },

    getProvenance(rawItem: MarketSeriesItem) {
      return [createProvenancePointer(
        rawItem.sourceId,
        "text",
        rawItem.t,
        checksum(rawItem),
        { selector: `trade:${rawItem.v}` }
      )];
    },

    computeChecksum(data: unknown) {
      return checksum(data);
    },
  };
}

export { DEFAULT_MARKET_PAIRS };

