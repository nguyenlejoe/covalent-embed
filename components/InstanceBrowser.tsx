import React, { useState, useEffect, useReducer } from "react";

import { None, Some, Option } from "../helpers/option";

import { api, ChartInDB, Node } from "../helpers/api";
import { Icon, NonIdealState, Tree, TreeNodeInfo } from "@blueprintjs/core";
import S from "../helpers/strings";

export function InstancesBrowser({addFlag, token, chart}) {

    const [maybeNodes, setNodes] = useState<Option<TreeNodeInfo[]>>(new Some([]));
    const [refresh, setRefresh] = useState(0);


    const handleSchema = () => {

        const nodeTree: TreeNodeInfo[] = [];
        if (chart.in_pages.length === 0) {
            return setNodes(None);
        }

        for (let i = 0; i < chart.in_pages.length; i++) {
            api.pageDetailForUserById(chart.in_pages[i]).then((resp) => {
                const boardTree: TreeNodeInfo[] = [];
                for (const i of chart.in_boards) {
                    api.boardsForUserById(token, resp.data.item.id).then((respBoard) => {
                        for (const k of respBoard.data.items) {
                            if (k.id === i) {
                                boardTree.push({
                                    id: k.id ,
                                    icon: "grid-view",
                                    label: <span className="font-thin cursor-pointer" onClick={() => {
                                        window.open(`https://www.covalenthq.com/platform/#/increment/pages/${resp.data.item.group.slug}/${resp.data.item.slug}/`, "_blank");
                                    }}>{k.display_name}</span>,
                                });
                            }
                        }
                    });
                }
                nodeTree.push({
                    id: resp.data.item.id ,
                    hasCaret: true,
                    icon: "document",
                    label: <span className="font-thin">{resp.data.item.display_name}</span>,
                    childNodes: boardTree
                });
                setNodes(new Some(nodeTree));

            });
        }

    };

    useEffect(() => {
        handleSchema();
    },[chart, addFlag]);

    const handleNodeCollapse = (_node, nodePath) => {
        maybeNodes.match({
            None: () => null,
            Some: (nodes: TreeNodeInfo[]) => {
                Tree.nodeFromPath(nodePath, nodes).isExpanded = false;
                setRefresh(refresh + 1);
            }
        });

    };

    const handleNodeExpand = (_node, nodePath) => {
        maybeNodes.match({
            None: () => null,
            Some: (nodes: TreeNodeInfo[]) => {
                Tree.nodeFromPath(nodePath, nodes).isExpanded = true;
                setRefresh(refresh + 1);
            }
        });
    };


    return (
        <div>
            {maybeNodes.match({
                None: () => {
                    return <div className="flex items-center justify-center h-[calc(100vh-250px)]">
                        <NonIdealState
                            icon={"document"}
                            title="No instances found"
                            description={S.INSTANCES_DESCRIPTION}/>
                    </div>;
                },
                Some: (node: TreeNodeInfo[]) => {
                    return <Tree
                        contents={node}
                        onNodeCollapse={handleNodeCollapse}
                        onNodeExpand={handleNodeExpand}
                    />;
                }
            })
            }

        </div>
    );

}
