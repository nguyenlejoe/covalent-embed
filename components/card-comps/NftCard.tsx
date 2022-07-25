import React, { useState, useEffect } from "react";
import { Option, Some, None } from "../../helpers/option";
import { Tag, Intent } from "@blueprintjs/core";
import * as C from "../../helpers/colors";
import * as F from "../../helpers/formats";
import pLimit from "p-limit";
import { renderChainId } from "../../helpers/common";
import { useParams } from "react-router-dom";
import { api } from "../../helpers/api";

interface NftCardProps {
    chain_id: number;
    contract_address: string;
    p: any;
    field: string;
    format: F.FORMAT;
    darkMode: boolean;
    key: number;
}

const NftCard = (props: NftCardProps) => {
    const [response, setResponse] = useState(None);
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const limit = pLimit(3);
    const [imageExists, setImageExists] = useState(false);
    const [page_id, setId] = useState();

    const checkImage = (imageSrc, good, bad) => {
        const img = new Image();
        img.onload = good;
        img.onerror = bad;
        img.src = imageSrc;
    };

    const handlePageId = () => {
        api.pagesForUser().then((resp) => {
            const pages = resp.data.items.sort((a, b) => a.created_at - b.created_at).reverse();
            setId(pages[2].id);
        });
    };

    useEffect(() => {
        handlePageId();
    }, []);


    useEffect(() => {
        setResponse(None);
        limit(() => fetch(`https://api.covalenthq.com/v1/${props.chain_id}/tokens/${props.contract_address}/nft_metadata/1/`, {
            headers: {
                "Authorization": "Bearer ckey_docs"
            }
        })
            .then((v) => v.json())
            .then((v) => setResponse(new Some(v)))
        );
    }, [props.chain_id, props.contract_address]);

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
                <a href={`#/nft/${page_id}/${props.chain_id}/${props.contract_address}/`}>
                    <div className="flex space-x-3">
                        {
                            (() => {
                                if (resp.error === true) {
                                    return <span>ERROR</span>;
                                }

                                if (resp.data.items[0] &&
                                    resp.data.items[0].nft_data &&
                                    resp.data.items[0].nft_data[0].external_data) {
                                    // console.log(resp.data.items[0].nft_data[0].external_data);
                                    if (resp.data.items[0].nft_data[0].external_data.image) {
                                        const url = resp.data.items[0].nft_data[0].external_data.image;
                                        checkImage(url, () => setImageExists(true), () => setImageExists(false));
                                        return imageExists ? <img className="h-14 w-14 rounded-md" src={url} /> : <div className="h-14 w-14 rounded-md bg-gradient-to-b from-[#7f0dff] to-[#235aff] animate-pulse" />;
                                    } else if (resp.data.items[0].nft_data[0].external_data.external_url && resp.data.items[0].nft_data[0].external_data.external_url.startsWith("data:application/json;base64,")) {

                                        const url = resp.data.items[0].nft_data[0].external_data.external_url.replace("data:application/json;base64,", ""),
                                            url_2 = JSON.parse(atob(url));

                                        if (url_2.image) {
                                            return <img className="h-14 w-14 rounded-md" src={url_2.image} />;
                                        }
                                    } else {
                                        // debugger;
                                    }
                                } else {
                                    return <div className="h-14 w-14 rounded-md bg-gradient-to-b from-[#7f0dff] to-[#235aff] animate-pulse" />;
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
                                            return <span className="truncate">{n}</span>;
                                        } else {
                                            return <span>{F.renderTruncAddress(resp.data.items[0].contract_address)}</span>;
                                        }
                                    })()
                                }
                            </div>
                            <div> {renderChainId(parseInt(props.chain_id, 10))}</div>
                        </div>

                        <div className="truncate">
                            <div className="truncate">{F.F(props.p[props.field], props.format)}</div>
                            {/* <div className="text-right">$799.00</div> */}
                        </div>
                    </div>
                </a>

            </td>
        </tr>
    });
};

export default NftCard;
