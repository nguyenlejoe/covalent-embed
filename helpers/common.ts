import { sub } from "date-fns";

export enum EditorState {
    READY, RUNNING, SUCCESS, FAILURE, NO_DATA
}

export interface CHStats {
    bytes_read: number;
    elapsed: number;
    rows_read: number;
}

export interface CHMeta {
    name: string;
    type: "Int64" | "String" | "UInt256" | "DateTime" | "Int8";
}

export interface CHResponse {
    data: any[];
    meta: CHMeta[];
    rows: number;
    rows_before_limit_at_least: number;
    statistics: CHStats | undefined;
}

export interface CHResponseWrapper {
    data: CHResponse;
    final_sql: string;
}

export function subDate(currentTimePeriod: string) {
    switch (currentTimePeriod) {
        case "1h":
            return sub(new Date(), { hours: 1 }).toISOString();
        case "24h":
            return sub(new Date(), { hours: 24 }).toISOString();
        case "7d":
            return sub(new Date(), { days: 7 }).toISOString();
        case "30d":
            return sub(new Date(), { days: 30 }).toISOString();

        default:
            throw new Error("handle me");
    }
}

export const re_aggregation = /\[\s*([\@]*\w+[.\w+]+)\s*:\s*aggregation\s*\]/;
export const re_date_range = /\[\s*([\@]*\w+[.\w+]+)\s*:\s*daterange\s*\]/;
export const re_chain_names = /\[\s*([\@]*\w+[.\w+]+)\s*:\s*chainname\s*\]/;

export const CHAIN_ID: string[][] = [
    ["Ethereum", "eth_mainnet"],
    ["BSC", "bsc_mainnet"],
    ["Polygon", "matic_mainnet"],
    ["Fantom", "fantom_mainnet"],
    ["Avalanche", "avalanche_mainnet"],
    ["Arbitrum", "arbitrum_mainnet"],
    ["Moonbeam", "moonbeam_mainnet"],
    ["Ronin", "axie_mainnet"],
    ["Klaytn", "klaytn_mainnet"],
    ["Harmony", "harmony_mainnet"],
    ["Palm", "palm_mainnet"],
    ["RSK", "rsk_mainnet"],
    ["Heco", "heco_mainnet"],
    ["Aurora", "aurora_mainnet"],
    ["Astar Shiden", "astar_mainnet"],
    ["Palm", "palm_mainnet"],
    ["RSK", "rsk_mainnet"],
    ["Heco", "heco_mainnet"],
    ["Aurora", "aurora_mainnet"],
    ["Iotex", "iotex_mainnet"],
    ["Moonbeam Moonriver", "moonbeam_moonriver"],
    ["Moonbeam Moonbase Alpha", "moonbeam_moonbase_alpha"],
    ["Evmos", "evmos_mainnet"],
    ["Covalent Interval V1", "covint1"],
];

const DATE_RANGE: string[][] = [
    ["last 1 hr", "last_1h"],
    ["last 24 hrs", "last_24h"],
    ["last 7 days", "last_7d"],
    ["this month", "this_month"],
    ["last 30 days", "last_30days"],
    ["last quarter", "last_quarter"],
    ["this quarter", "this_quarter"],
    ["last year", "last_year"],
    ["this year", "this_year"],
];

export const DATE_RANGE_MAP = new Map(DATE_RANGE.map((k): [string, string] => {
    return [k[0], k[1]];
}));


export const CHAIN_ID_MAP = new Map(CHAIN_ID.map((k): [string, string] => {
    return [k[0], k[1]];
}));

export const CHAIN_ID_MAP_r = new Map(CHAIN_ID.map((k): [string, string] => {
    return [k[1], k[0]];
}));

export const renderChainId = (chainId: number) => {
    switch (chainId) {
        case 1:
            return "Ethereum";
        case 56:
            return "BSC";
        case 137:
            return "Polygon";
        case 250:
            return "Fantom";
        case 1284:
            return "Moonbeam";
        case 2020:
            return "Ronin";
        case 43114:
            return "Avalanche";
        case 42161:
            return "Arbitrum";
        case 11297108109:
            return "Palm";

        default:
            return "Unknown";
    }
};

export const AVAILABLE_CHARTS = {
    "metric": "numerical",
    "bar": "timeline-bar-chart",
    "line": "timeline-line-chart",
    "area": "timeline-area-chart",
    "scatter": "scatter-plot",
    "table": "th",
    "pie": "pie-chart",
    "image": "media",
    "cohort": "heat-grid"
};


export const CHART_TYPES = [
    { name: "Metric", icon: "numerical", type: "metric" },
    { name: "Bar", icon: "timeline-bar-chart", type: "bar" },
    { name: "Line", icon: "timeline-line-chart", type: "line" },
    { name: "Area", icon: "timeline-area-chart", type: "area" },
    { name: "Scatter", icon: "scatter-plot", type: "scatter" },
    { name: "Table", icon: "th", type: "table" },
    { name: "Pie", icon: "pie-chart", type: "pie" },
    { name: "Image", icon: "media", type: "image" },
    { name: "Cohort", icon: "heat-grid", type: "cohort" },
];
