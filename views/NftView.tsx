import React, { useState, useEffect } from "react";

import { None, Some, Option } from "../helpers/option";

import * as C from "../helpers/colors";
import S from "../helpers/strings";
import { FILLER } from "../helpers/filler";
import { api, CovalentListResponse, Response } from "../helpers/api";
import { F, FORMAT } from "../helpers/formats";
import { H2 } from "@blueprintjs/core";


interface Item {
    chain_id: string;
    collection_name: string;
    collection_address: string;
    contract_deployment_at: string;
    first_nft_image: string;

    floor_price_quote_7d: number;
    floor_price_wei_7d: string;
    volume_quote_24h: number;
    volume_wei_24h: string;

    market_cap_quote: number;
    market_cap_wei: string;

    transaction_count_alltime: number;
    unique_token_ids_sold_count_alltime: number;
    unique_wallet_purchase_count_alltime: number;

}

export default function NftView({ darkMode, currentChainNames, currentDateRange }) {

    const s = darkMode ? C.DARK : C.LIGHT;
    const [maybeResponse, setResponse] = useState<Option<Item[]>>(None);

    const tempChainName = "1";

    useEffect(() => {
        api.fetch<Response<CovalentListResponse<Item>>>(`https://api.covalenthq.com/v1/${tempChainName}/nft_market/?key=ckey_63e6008b68504c15b88b088fd82`, {})
            .then((r: Response<CovalentListResponse<Item>>) => {
                setResponse(new Some(r.data.items));
            });
    }, [currentChainNames]);

    const rows = maybeResponse.match({
        None: () => [<tr>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
            <td>{FILLER}</td>
        </tr>],
        Some: (response) => {
            return response.map((r, i) => {
                return <tr key={i}>
                    <td><img className="h-6" src={r.first_nft_image} /></td>
                    <td><a href={`#/increment/nft/${tempChainName}/${r.collection_address}/`}>{r.collection_name}</a></td>
                    <td />
                    <td>{r.contract_deployment_at}</td>
                    <td><div className="text-right">{F(Number(r.floor_price_wei_7d) / Math.pow(10, 18), FORMAT.CURR_ETH)}</div></td>
                    <td><div className="text-right">{F(r.floor_price_quote_7d, FORMAT.CURR_USD)}</div></td>
                    <td><div className="text-right">{F(Number(r.volume_wei_24h) / Math.pow(10, 18), FORMAT.CURR_ETH)}</div></td>
                    <td><div className="text-right">{F(r.volume_quote_24h, FORMAT.CURR_USD)}</div></td>
                    <td><div className="text-right">{F(Number(r.market_cap_wei) / Math.pow(10, 18), FORMAT.CURR_ETH)}</div></td>
                    <td><div className="text-right">{F(r.market_cap_quote, FORMAT.CURR_USD)}</div></td>
                    <td><div className="text-right">{F(r.transaction_count_alltime, FORMAT.COUNT)}</div></td>
                    <td><div className="text-right">{F(r.unique_token_ids_sold_count_alltime, FORMAT.COUNT)}</div></td>
                    <td><div className="text-right">{F(r.unique_wallet_purchase_count_alltime, FORMAT.COUNT)}</div></td>
                </tr>;
            });
        }
    });

    return <div className="p-2.5">
        <div className="pt-4 pb-4">
            <H2>24H Market Overview</H2>
        </div>
        <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border " + s.BORDER}>
            <thead>
                <tr>
                    <th />
                    <th>Collection name</th>
                    <th># Tokens</th>
                    <th>Deployed at</th>
                    <th>Floor price (7d) ETH</th>
                    <th>Floor price (7d) USD</th>
                    <th>Volume (24h) ETH</th>
                    <th>Volume (24h) USD</th>
                    <th>Marketcap ETH</th>
                    <th>Marketcap USD</th>
                    <th># Transactions</th>
                    <th>Unique token IDs</th>
                    <th>Unique wallets</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </div>;


}
