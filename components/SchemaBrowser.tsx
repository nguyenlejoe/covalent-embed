import React, { useState, useEffect, useReducer } from "react";
import * as C from "../helpers/colors";
import { None, Some, Option } from "../helpers/option";

import { api, ChartInDB, Node } from "../helpers/api";
import { Icon, Tree, TreeNodeInfo } from "@blueprintjs/core";

const blockchainNodes: TreeNodeInfo[] = [
    {
        id: "0", label: "..."
    },
    {
        id: "1", label: "..."
    },
    {
        id: "2", label: "..."
    }
];

const labelNodes: TreeNodeInfo[] = [
    {
        id: "0", label: "..."
    }
];

const metadataNodes: TreeNodeInfo[] = [
    {
        id: "0", label: "..."
    }
];

const tableNodes: TreeNodeInfo[] = [
    {
        id: 0,
        hasCaret: true,
        icon: "folder-close",
        label: <span className="font-thin">blockchains</span>,
        childNodes: blockchainNodes
    },
    {
        id: 1,
        hasCaret: true,
        icon: "folder-close",
        label: <span className="font-thin">reports</span>,
        childNodes: labelNodes
    },
    {
        id: 2,
        hasCaret: true,
        icon: "folder-close",
        label: <span className="font-thin">metadata</span>,
        childNodes: metadataNodes
    }
];

const genIcon = (colType: string) => {

    switch (colType) {
        case "String":
            return <span className="font-thin">ABC</span>;
        case "DateTime":
            return <Icon icon="time" />;
        case "Int8":
        case "Int64":
        case "Int256":
        case "Float64":
        default:
            return <span className="font-thin">{colType}</span>;
    }
};

export function SchemaBrowser({ currentDateRange, currentDateAgg, currentChain, darkMode, token }) {
    const s = darkMode ? C.DARK : C.LIGHT;
    const [maybeNodes, setNodes] = useState(None);
    const [refresh, setRefresh] = useState(0);

    const handleNodeCollapse = (_node, nodePath) => {
        Tree.nodeFromPath(nodePath, tableNodes).isExpanded = false;
        setRefresh(refresh + 1);
    };

    const handleNodeExpand = (_node, nodePath) => {
        Tree.nodeFromPath(nodePath, tableNodes).isExpanded = true;
        setRefresh(refresh + 1);
    };

    const getSchema = () => {
        const resp = Promise.all(
            [
                api.chRequest(token, "show create table blockchains.blocks", currentDateAgg, currentDateRange, currentChain),
                api.chRequest(token, "show create table blockchains.transactions", currentDateAgg, currentDateRange, currentChain),
                api.chRequest(token, "show create table blockchains.log_events", currentDateAgg, currentDateRange, currentChain),
                api.chRequest(token, "show create table reports.nft_sales_all_chains", currentDateAgg, currentDateRange, currentChain),
                api.chRequest(token, "show create table metadata.tokens_usd_prices", currentDateAgg, currentDateRange, currentChain)
            ]);

        resp.then((_ev) => {
            _ev.forEach((ev: any, i) => {
                const cols = ev.data.data.data[0].statement.split("\n"),
                    tblName = cols[0].split(".")[1],
                    childNodes: TreeNodeInfo[] = [];

                cols.forEach((col, j) => {

                    if (col.startsWith("    ")) {
                        const col_attrs = col.trim().replace(",", "").replace("`", "").replace("`", "").split(" ");

                        childNodes.push({
                            label: <span className="font-thin">{col_attrs[0]}</span>,
                            id: j,
                            secondaryLabel: genIcon(col_attrs[1])
                        });
                    }
                });

                if (tblName === "blocks") {
                    blockchainNodes[0] = {
                        id: i,
                        hasCaret: true,
                        icon: "folder-close",
                        label: <span className="font-thin">{tblName}</span>,
                        childNodes: childNodes
                    };
                } else if (tblName === "transactions") {
                    blockchainNodes[1] = {
                        id: i,
                        hasCaret: true,
                        icon: "folder-close",
                        label: <span className="font-thin">{tblName}</span>,
                        childNodes: childNodes
                    };
                } else if (tblName === "log_events") {
                    blockchainNodes[2] = {
                        id: i,
                        hasCaret: true,
                        icon: "folder-close",
                        label: <span className="font-thin">{tblName}</span>,
                        childNodes: childNodes
                    };
                } else if (tblName === "nft_sales_all_chains") {
                    labelNodes[0] = {
                        id: i,
                        hasCaret: true,
                        icon: "folder-close",
                        label: <span className="font-thin">{tblName}</span>,
                        childNodes: childNodes
                    };
                } else if (tblName === "tokens_usd_prices") {
                    metadataNodes[0] = {
                        id: i,
                        hasCaret: true,
                        icon: "folder-close",
                        label: <span className="font-thin">{tblName}</span>,
                        childNodes: childNodes
                    };
                }


                setNodes(new Some(<Tree
                    contents={blockchainNodes}
                    onNodeCollapse={handleNodeCollapse}
                    onNodeExpand={handleNodeExpand}
                />));
            });
        });
    };

    useEffect(() => {
        getSchema();
    }, []);

    useEffect(() => {
        // nodes.sort((x, y) => x.label.localeCompare(y));

        setNodes(new Some(<Tree
            contents={blockchainNodes}
            onNodeCollapse={handleNodeCollapse}
            onNodeExpand={handleNodeExpand}

        />));

    }, [refresh]);


    return (
        <div className={s.TEXT_COLOR + " pb-32 h-screen overflow-y-scroll"}>
            <Tree
                contents={tableNodes}
                onNodeCollapse={handleNodeCollapse}
                onNodeExpand={handleNodeExpand}

            />
        </div>
    );

}

