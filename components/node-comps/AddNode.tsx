import { Button, H2, H3, H4, Icon, IconSize } from "@blueprintjs/core";
import React, { useState, useEffect, FC, useMemo } from "react";

import * as C from "../../helpers/colors";

const items = [
    {
        title: "Reach: NFT token holders",
        icon: "code-block",
        background: "bg-pink-500",
        description: "Calculate the number of token holders of a NFT collection."
    },
    {
        title: "Create a retention query (DEX)",
        background: "bg-yellow-500",
    },
    {
        title: "Create a revenue query (Bridge)",
        description: "",
        icon: "code-block",
        background: "bg-green-500",
    },
    {
        title: "Create a reach query (NFT)",
        background: "bg-blue-500",
    },
    {
        title: "Create a reach query (NFT)",
        background: "bg-indigo-500",
    },
    {
        title: "Create a reach query (NFT)",
        background: "bg-purple-500",
    },
];

interface AddNodeProps {
    onClickNewQuery: Function;

    darkMode: boolean;
}

export const AddNode = (props: AddNodeProps) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;

    return <div className="p-2.5">
        <div className="w-2/3 m-auto">
            <h2 className="text-lg font-medium">New query</h2>
            <div className="mt-1 ">
                Get started by selecting a template or start from an empty query.
            </div>

            <ul role="list" className={`mt-6 border-t border-b  py-6 grid grid-cols-2 gap-6 sm:grid-cols-2  ${s.BORDER_SECONDARY}`}>
                {items.map((item, i) => {
                    return <li key={i} className="flow-root">
                        <div className="relative -m-2 p-2 flex items-center space-x-4 rounded-xl ">
                            <div className={item.background + " flex items-center justify-center h-16 w-16 rounded-lg"}>
                                <Icon icon={"code-block"} size={IconSize.LARGE} />
                            </div>
                            <div>
                                <Button minimal={true} onClick={() => props.onClickNewQuery()}
                                >{item.title} &rarr;</Button>
                                <p className="mt-1 text-xs pl-3">{item.description}</p>
                            </div>
                        </div>
                    </li>;
                })
                }
            </ul>


            <div className="mt-4 flex">
                <Button minimal={true} onClick={() => props.onClickNewQuery()} >
                    Or start with an empty query &rarr;</Button>
            </div>
        </div>
    </div>;
};
