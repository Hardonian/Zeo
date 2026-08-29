import {
  createAdapterRegistry,
  type Adapter,
  type AdapterInfo,
} from "./framework";
import { createMacroAdapter, MACRO_SIGNAL_MAP } from "./macro";
import { createMarketAdapter, DEFAULT_MARKET_PAIRS } from "./market";
import { createNewsAdapter, TOPIC_TAGS } from "./news";

export function createRealityAdapterRegistry() {
  const registry = createAdapterRegistry();

  const macroAdapter = createMacroAdapter();
  const marketAdapter = createMarketAdapter();
  const newsAdapter = createNewsAdapter();

  registry.register(macroAdapter);
  registry.register(marketAdapter);
  registry.register(newsAdapter);

  return registry;
}

export function getDefaultCatalogEntries(): Array<{
  signalId: string;
  displayName: string;
  domain: string;
  units: string;
  directionality: string;
  sourceIds: string[];
}> {
  const entries: Array<{
    signalId: string;
    displayName: string;
    domain: string;
    units: string;
    directionality: string;
    sourceIds: string[];
  }> = [];

  for (const [indicator, info] of Object.entries(MACRO_SIGNAL_MAP)) {
    entries.push({
      signalId: info.signalId,
      displayName: indicator,
      domain: "macro",
      units: info.units,
      directionality: info.directionality,
      sourceIds: [`fred:${indicator}`],
    });
  }

  for (const symbol of DEFAULT_MARKET_PAIRS) {
    entries.push({
      signalId: `price:${symbol}`,
      displayName: symbol,
      domain: "market",
      units: "price",
      directionality: "neutral",
      sourceIds: [`yahoo:${symbol}`],
    });
  }

  for (const topic of Object.keys(TOPIC_TAGS)) {
    entries.push({
      signalId: `news:${topic}`,
      displayName: topic,
      domain: "news",
      units: "score",
      directionality: "neutral",
      sourceIds: ["news-gnews"],
    });
  }

  return entries;
}

export function getDefaultSourceDescriptors(): Array<{
  sourceId: string;
  kind: string;
  trustTier: string;
  recencyHalfLifeHours: number;
  sensationalPenalty: number;
  singleSourcePenalty: number;
}> {
  return [
    {
      sourceId: "fred:FEDFUNDS",
      kind: "macro",
      trustTier: "primary",
      recencyHalfLifeHours: 168,
      sensationalPenalty: 0,
      singleSourcePenalty: 0,
    },
    {
      sourceId: "fred:CPIAUCSL",
      kind: "macro",
      trustTier: "primary",
      recencyHalfLifeHours: 168,
      sensationalPenalty: 0,
      singleSourcePenalty: 0,
    },
    {
      sourceId: "fred:UNRATE",
      kind: "macro",
      trustTier: "primary",
      recencyHalfLifeHours: 168,
      sensationalPenalty: 0,
      singleSourcePenalty: 0,
    },
    {
      sourceId: "yahoo:SPY",
      kind: "market",
      trustTier: "primary",
      recencyHalfLifeHours: 24,
      sensationalPenalty: 0.1,
      singleSourcePenalty: 0.2,
    },
    {
      sourceId: "yahoo:QQQ",
      kind: "market",
      trustTier: "primary",
      recencyHalfLifeHours: 24,
      sensationalPenalty: 0.1,
      singleSourcePenalty: 0.2,
    },
    {
      sourceId: "news-gnews",
      kind: "news",
      trustTier: "secondary",
      recencyHalfLifeHours: 48,
      sensationalPenalty: 0.3,
      singleSourcePenalty: 0.4,
    },
  ];
}

