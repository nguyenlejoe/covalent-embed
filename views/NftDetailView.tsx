import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { None, Some, Option } from "../helpers/option";

import * as C from "../helpers/colors";

import { FILLER } from "../helpers/filler";
import { api, CovalentListResponse, Response } from "../helpers/api";
import { F, FORMAT } from "../helpers/formats";
import TokenImage from "../components/TokenImage";

interface Item {
    chain_id: string;
    collection_name: string;
    collection_address: string;

    opening_date: string;
    average_volume_quote_day: number;
    floor_price_quote_7d: number;
    unique_token_ids_sold_count_day: number;
    volume_quote_day: number;
}

interface NftDetailViewArgs {
    chain_id: string;
    contract_address: string;
}

export default function NftDetailView({ darkMode, currentDateRange }) {

    const s = darkMode ? C.DARK : C.LIGHT;
    const [maybeResponse, setResponse] = useState<Option<Item[]>>(None);
    const [maybeTokens, setTokens] = useState<Option<number[]>>(None);

    const { chain_id, contract_address } = useParams<NftDetailViewArgs>();

    useEffect(() => {
        api.fetch(`https://api.covalenthq.com/v1/${chain_id}/tokens/${contract_address}/nft_token_ids/?key=ckey_63e6008b68504c15b88b088fd82`, {})
            .then((r: any) => {
                const tokens = r.data.items.map((x) => x.token_id);
                setTokens(new Some(tokens.slice(0, 30)));
            });

        // api.fetch<Response<CovalentListResponse<Item>>>(`https://api.covalenthq.com/v1/${chain_id}/nft_market/collection/${contract_address}/?key=ckey_63e6008b68504c15b88b088fd82`, {})
        //     .then((r: Response<CovalentListResponse<Item>>) => {
        //         setResponse(new Some(r.data.items));
        //     });
    }, [chain_id, contract_address]);

    const rows = maybeTokens.match({
        None: () => [<tr>
            <td>{FILLER}</td>
        </tr>],
        Some: (response) => {
            return response.map((r, i) => {
                return <tr key={i}>
                    <td>{i}</td>
                    <td>{(chain_id && contract_address) ?
                        <div className="h-8 w-8">
                            <TokenImage chain_id={chain_id} contract_address={contract_address} token_id={r.toString()} />
                        </div>
                        : null}
                    </td>
                    <td />
                    <td />
                </tr>;
            });
        }
    });


    const body = [...Array(50).keys()].map((x, i) => {
        if (chain_id && contract_address) {
            return <div key={i}>
                <TokenImage
                    chain_id={chain_id}
                    contract_address={contract_address}
                    token_id={x.toString()}
                />
            </div>;
        }
        return <div key={i} />;
    });


    return <div className="p-2.5">

        <div className={`h-52 overflow-hidden  ${s.BG_COLOR} border   ${s.BORDER_SECONDARY} `}>
            <div className="grid grid-cols-1">
                <div className="grid gap-0 grid-cols-[repeat(24,_minmax(0,_1fr))]">{body}</div>
            </div>
        </div>

        <div className="grid grid-cols-3 mt-8 mb-8 gap-x-8  ">
            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Collection name</div>
                <div className="text-lg">Meebits</div>
            </div>
            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Deployed</div>
                <div className="text-lg">25 days ago</div>
            </div>
            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Tokens in collection</div>
                <div className="text-lg">10,000</div>
            </div>
        </div>


        <div className="grid grid-cols-3 mt-8 mb-8 gap-x-8  ">
            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Reach</div>
                <div className="text-lg">Token owners over time</div>
                <div className="text-lg">Quartile of Owners concentration by token id</div>
            </div>

            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Retention</div>
                <div className="text-lg">Quartile of holding periods</div>
            </div>

            <div className={"border p-2 " + s.BORDER_SECONDARY + " " + s.BG_COLOR_SECONDARY}>
                <div className="text-2xl">Revenue</div>
                <div className="text-lg">PnL</div>
            </div>

        </div>

        <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border " + s.BORDER}>
            <thead>
                <tr>
                    <th />
                    <th />
                    <th>Sales</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </div>;

}
