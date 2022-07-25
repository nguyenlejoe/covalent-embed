import React, { useState, useEffect } from "react";

import { Option, Some, None } from "../helpers/option";

import * as C from "../helpers/colors";
import { api } from "../helpers/api";

import pLimit from "p-limit";

interface TokenImageProps {
    chain_id: string;
    contract_address: string;
    token_id: string;
}

const limit = pLimit(3);

const TokenImage = (props: TokenImageProps) => {
    const [response, setResponse] = useState(None);

    useEffect(() => {

        limit(() => api.fetch(`https://api.covalenthq.com/v1/${props.chain_id}/tokens/${props.contract_address}/nft_metadata/${props.token_id}/`, {
            headers: {
                "Authorization": "Bearer ckey_63e6008b68504c15b88b088fd82"
            }
        }).then((v) => {

            setResponse(new Some(v));
        }));

    }, [props.chain_id, props.contract_address, props.token_id]);

    const bgColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return "#" + randomColor;
    };

    const el = response.match({
        None: () => <div style={{ background: bgColor() }} />,
        Some: (resp) => {
            if (resp.error === true) {
                return <span>ERROR</span>;
            }
            if (resp.data.items[0] &&
                resp.data.items[0].nft_data &&
                resp.data.items[0].nft_data[0].external_data &&
                resp.data.items[0].nft_data[0].external_data.image) {
                const url = resp.data.items[0].nft_data[0].external_data.image_256;
                return <img className="  m-auto " src={url} alt="" />;
            } else {
                return <div style={{ background: bgColor() }} />;
            }
        }
    });

    return (
        <div style={{ background: bgColor() }}>
            {el}
        </div>
    );
};

export default TokenImage;
