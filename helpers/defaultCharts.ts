import { ChartLoaderProps } from "../components/charts/ChartConfig";

export const getSalesByNewWalletsPerCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Sales by new wallets per collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "date", yAxis: "new_user_volume", segmentAxis: "collection_name"},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: false,
        spectrum: "blues",
        sql: `SELECT cohort_date as date, collection_name, sum(new_wallet_volume) as new_user_volume
    FROM (
          SELECT wallet,
                 collection_name,
                 MIN(DATE_TRUNC('${timeScale}', signed_at)) as cohort_date,
                 SUM(nft_token_price_usd) as new_wallet_volume
          FROM (
                   SELECT date_trunc('${timeScale}', e.signed_at) as signed_at, e.collection_name, e.taker as wallet, nft_token_price_usd
                   FROM labels.nft_sales_demo e
                   WHERE e.collection_address = 'f70576a5255fccfe6551f3ec8de74c9e002e1a82'
                   UNION ALL
                   SELECT date_trunc('${timeScale}', e.signed_at) as signed_at, e.collection_name, e.maker as wallet, nft_token_price_usd
                   FROM labels.nft_sales_demo e
                   WHERE e.collection_address = 'f70576a5255fccfe6551f3ec8de74c9e002e1a82'
                   ) a
          GROUP BY wallet, collection_name
             )
    GROUP BY date, collection_name
    ORDER BY date DESC;`};
    return a;
};

export const getCountSalesPerCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Total Daily Count of Sales for a Given Collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "tx_count", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT toDate(date_trunc('day',e.signed_at)) as signed_at, 
        count(*) as tx_count
        FROM labels.nft_sales_demo e
        where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
        and e.chain_id=43114
         group by signed_at
        ORDER BY tx_count DESC`};
    return a;
};

export const getWalletCountPerCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily count of unique wallets transacting for a given collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "unique_wallets", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT a.signed_at as signed_at,count(DISTINCT a.wallets) as unique_wallets FROM(
            SELECT date_trunc('day',e.signed_at) as signed_at, e.taker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
            and e.chain_id=43114
            UNION ALL
            SELECT date_trunc('day',e.signed_at) as signed_at, e.maker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
            and e.chain_id=43114)a
            
            GROUP BY signed_at;`};
    return a;
};

export const getWalletTransactingCountPerCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily count of unique wallets transacting for a given collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "date", yAxis: "new_wallets", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT cohort_date as date, count(wallet) as new_wallets
        FROM (
              SELECT wallet,
                     MIN(DATE_TRUNC('day', signed_at)) as cohort_date
              FROM (
                       SELECT date_trunc('day', e.signed_at) as signed_at, e.taker as wallet
                       FROM labels.nft_sales_demo e
                                     where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
                                     and e.chain_id=43114
                       UNION ALL
                       SELECT date_trunc('day', e.signed_at) as signed_at, e.maker as wallet
                       FROM labels.nft_sales_demo e
                                    where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
                                    and e.chain_id=43114
                       ) a
              GROUP BY wallet
                 )
        GROUP BY date
        ORDER BY date DESC;`};
    return a;
};
export const getDailyTotalVolume = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily total volume",
        subtitle: "Per " + timeScale,
        board: "Revenue",
        chartType: "table",
        // axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT date_trunc('day',e.signed_at) as signed_at,
        sum(nft_token_price_usd) as volume_usd, sum(nft_token_price) as volume_avax 
        FROM labels.nft_sales_demo e 
        where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
        and e.chain_id=43114
        group by signed_at`};
    return a;
};

export const getCollectionDailyTradesPerWallet = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily collection trades",
        subtitle: "Per " + timeScale,
        board: "Revenue",
        chartType: "table",
        // axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT a.signed_at as signed_at,'0x'||extract_address(a.wallets) as wallets,count(a.tx_hash) as tx_count FROM(
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market,e.tx_hash, e.taker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
            and e.chain_id=43114
            UNION ALL
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market, e.tx_hash,e.maker as wallets FROM labels.nft_sales_demo e 
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482') 
            and e.chain_id=43114)a
            where notEmpty(a.wallets)
            GROUP BY signed_at,wallets LIMIT 20;`};
    return a;
};

export const example = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Count of unique wallets transacting for a given collection",
        subtitle: "Per " + timeScale,
        board: "Retention",
        chartType: "table",
        // axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT a.signed_at as signed_at,'0x'||extract_address(a.wallets) as wallets,count(a.tx_hash) as tx_count FROM(
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market,e.tx_hash, e.taker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482')
            and e.chain_id=43114
            UNION ALL
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market, e.tx_hash,e.maker as wallets FROM labels.nft_sales_demo e 
            where e.collection_address=lower('a69fee085a4c38656ce9c37a064a330725307482') 
            and e.chain_id=43114)a
            where notEmpty(a.wallets)
            GROUP BY signed_at,wallets LIMIT 20;`};
    return a;
};

/// notion graphs

export const TotalDayCountOfSalesCollection = (address: string, chain_id: number, timeScale = "day") => {

    const a: ChartLoaderProps =  {
        title: "Total Daily Count of Sales for a Given Collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "tx_count", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT toDate(date_trunc('day',e.signed_at)) as signed_at, 
        count(*) as tx_count
        FROM labels.nft_sales_demo e
        where e.collection_address=lower('${address}')
        and e.chain_id=${chain_id}
         group by signed_at
        ORDER BY tx_count DESC`};
    return a;
};

export const DailyCountUniqueWalletsCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily count of unique wallets transacting for a given collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "unique_wallets", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT a.signed_at as signed_at,count(DISTINCT a.wallets) as unique_wallets FROM(
            SELECT date_trunc('day',e.signed_at) as signed_at, e.taker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('${address}')
            and e.chain_id=${chain_id}
            UNION ALL
            SELECT date_trunc('day',e.signed_at) as signed_at, e.maker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('${address}')
            and e.chain_id=${chain_id})a
            
            GROUP BY signed_at`};
    return a;
};

export const DailyCountNewWalletsCollection = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily count of new wallets transacting for a given collection",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "new_wallets", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT cohort_date as date, count(wallet) as new_wallets
        FROM (
              SELECT wallet,
                     MIN(DATE_TRUNC('day', signed_at)) as cohort_date
              FROM (
                       SELECT date_trunc('day', e.signed_at) as signed_at, e.taker as wallet
                       FROM labels.nft_sales_demo e
                                     where e.collection_address=lower('${address}')
                                     and e.chain_id=${chain_id}
                       UNION ALL
                       SELECT date_trunc('day', e.signed_at) as signed_at, e.maker as wallet
                       FROM labels.nft_sales_demo e
                                    where e.collection_address=lower('${address}')
                                    and e.chain_id=${chain_id}
                       ) a
              GROUP BY wallet
                 )
        GROUP BY date
        ORDER BY date DESC;`};
    return a;
};

export const DailyMarketShareCollectionbyTransaction = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Daily market share for a given collection by transaction count",
        subtitle: "Per " + timeScale,
        board: "Reach",
        chartType: "bar",
        // axises: {xAxis: "signed_at", yAxis: "pct_txs", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: true,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT date_trunc('day',e.signed_at) as signed_at, count(*) / (SELECT  count(*) FROM labels.nft_sales_demo e)  as pct_txs
        FROM labels.nft_sales_demo e
        where e.collection_address=lower('${address}')
        and e.chain_id=${chain_id}
        group by signed_at
        ORDER BY pct_txs DESC`};
    return a;
};

// RETENTION - NEEDS CONFIGS ON NOTION

// export const HoldingPerieQuartilesCollection = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Holding Period Quartiles for a given collection",
//         subtitle: "Per " + timeScale,
//         board: "Retention",
//         chartType: "bar",
//         axises: {xAxis: "signed_at", yAxis: "pct_txs", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: true,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `WITH holding as (
//             SELECT
//                           m.token_id,
//                          AVG(CASE
//                                   WHEN t.signed_at = '1970-01-01' THEN dateDiff('day', m.signed_at, now())
//                                   ELSE dateDiff('day', m.signed_at, t.signed_at)
//                               END as sell_signed_at) as hd
//                    FROM (
//                             SELECT tx_hash, signed_at, maker, taker, token_id, collection_address
//                             FROM labels.nft_sales_demo
//                             WHERE collection_address = '${address}'
//                             ORDER BY signed_at DESC
//                             ) as m
//                             LEFT JOIN (
//                        SELECT tx_hash, signed_at, maker, taker, token_id, collection_address
//                        FROM labels.nft_sales_demo
//                        WHERE collection_address = '${address}'
//                        ORDER BY signed_at DESC
//                        ) as t
//                                       ON m.maker = t.taker AND m.token_id = t.token_id AND
//                                          m.collection_address = t.collection_address
//                     WHERE (m.signed_at <= t.signed_at OR t.signed_at = '1970-01-01')
//             GROUP BY token_id)
//             select  min(hd) as min,
//                     quantileExactInclusive(0.25) (hd) as q75,
//                     quantileExactInclusive(0.5) (hd) as q50,
//                     quantileExactInclusive(0.75) (hd) as q25,
//                     max(hd) as max
//             from holding;`};
//     return a;
// };

// export const RepeatPurchaseCountQuartiles = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Repeat Purchase Count Quartiles",
//         subtitle: "Per " + timeScale,
//         board: "Retention",
//         chartType: "bar",
//         axises: {xAxis: "signed_at", yAxis: "pct_txs", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: true,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `WITH repeat_purchase as (
//             SELECT maker, count(*) as hd
//             from labels.nft_sales_demo
//             WHERE collection_address = '${address}'
//             GROUP BY maker )
//             select min(hd)                          as min,
//                    quantileExactInclusive(0.25)(hd) as q75,
//                    quantileExactInclusive(0.5)(hd)  as q50,
//                    quantileExactInclusive(0.75)(hd) as q25,
//                    max(hd)                          as max
//             from repeat_purchase;`};
//     return a;
// };

// export const RepearPurcahseUsdQuartiles = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Repeat Purchase USD Quartiles",
//         subtitle: "Per " + timeScale,
//         board: "Retention",
//         chartType: "bar",
//         axises: {xAxis: "signed_at", yAxis: "pct_txs", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: true,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `WITH repeat_purchase as (
//             SELECT maker, sum(nft_token_price_usd)::Float64 as hd
//             from labels.nft_sales_demo
//             WHERE collection_address = '${address}'
//             GROUP BY maker )
//             select min(hd)                          as min,
//                    quantileExactInclusive(0.25)(hd) as q75,
//                    quantileExactInclusive(0.5)(hd)  as q50,
//                    quantileExactInclusive(0.75)(hd) as q25,
//                    max(hd)                          as max
//             from repeat_purchase;`};
//     return a;
// };

// REVENUE


export const CollectionDailyTotalVolume = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Collection Daily Total Volume",
        subtitle: "Per " + timeScale,
        board: "Revenue",
        chartType: "table",
        // axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT date_trunc('day',e.signed_at) as signed_at,
        sum(nft_token_price_usd) as volume_usd, sum(nft_token_price) as volume_avax 
        FROM labels.nft_sales_demo e 
        where e.collection_address=lower('${address}')
        and e.chain_id=${chain_id}
        group by signed_at`};
    return a;
};

// NEEDS CHART CONFIGS ON NOTION

// export const TotalDailySalesVolumeNewWallets = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Total Daily Sales Volume from NEW wallets",
//         subtitle: "Per " + timeScale,
//         board: "Revenue",
//         chartType: "table",
//         axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: false,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `SELECT date_trunc('day',e.signed_at) as signed_at,
//         sum(nft_token_price_usd) as volume_usd, sum(nft_token_price) as volume_avax
//         FROM labels.nft_sales_demo e
//         where e.collection_address=lower('${address}')
//         and e.chain_id=${chain_id}
//         group by signed_at`};
//     return a;
// };

export const CollectioDailyTradesPerWallet = (address: string, chain_id: number, timeScale = "day") => {
    const a: ChartLoaderProps =  {
        title: "Collection Daily Trades per Wallet",
        subtitle: "Per " + timeScale,
        board: "Revenue",
        chartType: "table",
        // axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
        chartHorizontal: false,
        chartProportional: false,
        tableData: false,
        firstPass: true,
        firstPassSingle: true,
        spectrum: "blues",
        sql: `SELECT a.signed_at as signed_at,'0x'||extract_address(a.wallets) as wallets,count(a.tx_hash) as tx_count FROM(
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market,e.tx_hash, e.taker as wallets FROM labels.nft_sales_demo e
            where e.collection_address=lower('${address}')
            and e.chain_id=${chain_id}
            UNION ALL
            SELECT date_trunc('day',e.signed_at) as signed_at,e.market, e.tx_hash,e.maker as wallets FROM labels.nft_sales_demo e 
            where e.collection_address=lower('${address}') 
            and e.chain_id=${chain_id})a
            where notEmpty(a.wallets)
            GROUP BY signed_at,wallets;`};
    return a;
};

// NEEDS CHART CONFIGS ON NOTION

// export const CollectionWeeklyAvgSalePrice = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Collection Weekly AVG Sale Price",
//         subtitle: "Per " + timeScale,
//         board: "Revenue",
//         chartType: "table",
//         axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: false,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `SELECT e.signed_at as signed_at, avg(nft_token_price_usd)  as avg_usd,avg(nft_token_price)  as avg_avax
//         FROM labels.nft_sales_demo e
//         where e.signed_at>= now()-interval 7 day
//         and e.collection_address=lower('${address}')
//         and e.chain_id=${chain_id}
//         group by  signed_at`};
//     return a;
// };

// NEEDS CHART CONFIGS ON NOTION

// export const DailyMarketShareVolumeCollection = (address: string, chain_id: number, timeScale = "day") => {
//     const a: ChartLoaderProps =  {
//         title: "Daily % Market share by Volume for a collection",
//         subtitle: "Per " + timeScale,
//         board: "Revenue",
//         chartType: "table",
//         axises: {xAxis: "", yAxis: "", segmentAxis: "" , y2Axis: ""},
//         chartHorizontal: false,
//         chartProportional: false,
//         tableData: false,
//         firstPass: true,
//         firstPassSingle: true,
//         spectrum: "blues",
//         sql: `SELECT date_trunc('day', e.signed_at) as date,
//         e.market as market,
//        SUM(toFloat64(e.nft_token_price_usd)/toFloat64(p.daily_sum)) as market_share
//  from labels.nft_sales_demo e
//  LEFT JOIN (
//      SELECT date_trunc('day', signed_at) as date, SUM(nft_token_price_usd) as daily_sum
//      FROM labels.nft_sales_demo e
//          where	e.collection_address=lower('${address}')
//          and e.chain_id=${chain_id}
//      GROUP BY date
//      ) p ON date_trunc('day', e.signed_at) = p.date

//  group by date,market
//  ORDER BY date ASC;`};
//     return a;
// };
