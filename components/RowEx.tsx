import React, { useState, useEffect } from "react";

import { Option, Some, None } from "../helpers/option";
import { Tag, Intent } from "@blueprintjs/core";
import * as C from "../helpers/colors";
import * as F from "../helpers/formats";
import pLimit from "p-limit";
import { renderChainId } from "../helpers/common";

interface RowProps {
    chain_id: number;
    contract_address: string;
    p: any;
    field: string;
    format: F.FORMAT;
    darkMode: boolean;
    key: number;
    handleNftMeta: Function;
}

const RowEx = (props: RowProps) => {
    const [response, setResponse] = useState(None);
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const limit = pLimit(3);
    const [imageExists, setImageExists] = useState(false);

    useEffect(() => {
        props.handleNftMeta(props.chain_id, props.contract_address, setResponse);
    }, [props.chain_id, props.contract_address]);

    const checkImage = (imageSrc, good, bad) => {
        const img = new Image();
        img.onload = good;
        img.onerror = bad;
        img.src = imageSrc;
    };

    return response.match({
        None: () => <tr>
            <td className="px-6 py-3 max-w-0 w-full whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex space-x-3">
                    <div className={"h-14 w-14 rounded-md border border-solid border-1 " + s.BORDER} />
                </div>
            </td>
        </tr>,
        Some: (resp) => <tr >
            <td className="px-6 py-3 max-w-0 w-full whitespace-nowrap text-sm font-medium text-gray-900">
                <a href={`/platform/#/increment/nft/${props.chain_id}/${props.contract_address}/`}>
                    <div className="flex space-x-3">
                        {
                            (() => {
                                if (resp.error === true) {
                                    return <span>ERROR</span>;
                                }
                                if (resp.data.items[0] &&
                                    resp.data.items[0].nft_data &&
                                    resp.data.items[0].nft_data[0].external_data &&
                                    resp.data.items[0].nft_data[0].external_data.image) {
                                    const url = resp.data.items[0].nft_data[0].external_data.image;
                                    checkImage(url, () => setImageExists(true), () => setImageExists(false));
                                    return imageExists ? <img className="h-14 w-14 rounded-md" src={url} /> : <div className="h-14 w-14 rounded-md bg-gray-500" />;
                                } else {
                                    return <div className="h-14 w-14 rounded-md bg-gray-500 animate-pulse bg-gradient" />;
                                }
                            })()
                        }

                        <div className="grow" >
                            <div>
                                {
                                    (() => {
                                        if (resp.error === true) {
                                            return <span>ERROR</span>;
                                        }
                                        if (resp.data.items[0] && resp.data.items[0].contract_name) {
                                            const n = resp.data.items[0].contract_name;
                                            return <span>{n}</span>;
                                        } else {
                                            return <span>{F.renderTruncAddress(resp.data.items[0].contract_address)}</span>;
                                        }
                                    })()
                                }
                            </div>
                            <div> {renderChainId(props.chain_id)}</div>
                        </div>

                        <div className="">

                            <div>{F.F(props.p[props.field], props.format)}</div>
                            {/* <div className="text-right">$799.00</div> */}
                        </div>
                    </div>
                </a>

            </td>
        </tr>
    });
};

export default RowEx;
