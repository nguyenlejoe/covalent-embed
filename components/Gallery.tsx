import React, { useState, useEffect } from "react";
import TokenImage from "./TokenImage";

interface GalleryProps {
    maybeResponse: any;
    chain_id: string;
    contract_address: string;
    handleTokenImage: Function;
}


const Gallery = (props: GalleryProps) => {

    return props.maybeResponse.match({
        None: () => <div>Loading...</div>,
        Some: (response) => {

            const body = [], body2 = [];
            response.forEach((x, i) => {
                if (i > 1) {
                    body.push(<TokenImage handleTokenImage={props.handleTokenImage} key={i} chain_id={props.chain_id} contract_address={props.contract_address} token_id={x} />);
                }
            });

            return <div className="grid grid-cols-1">
                <div  className="grid gap-0 grid-cols-[repeat(24,_minmax(0,_1fr))]">{body}</div>
            </div>;
        }
    });

};

export default Gallery;

