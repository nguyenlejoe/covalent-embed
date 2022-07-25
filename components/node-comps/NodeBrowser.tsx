import React, { useState, useEffect, FC, useMemo } from "react";
import { Button, H2, H3, H5, Intent, Menu, MenuItem, NonIdealState, Icon, Tab, Tabs, H6, H4 } from "@blueprintjs/core";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { format, formatDistance, parseISO, formatRelative, subDays } from "date-fns";

import * as C from "../../helpers/colors";
import S from "../../helpers/strings";

import { api, ChartInDB, Node } from "../../helpers/api";
import { Option, None } from "../../helpers/option";
import { renderChartTitle } from "../../helpers/formats";
import { FILLER } from "../../helpers/filler";

interface NodeBrowserProps {
    maybeNodes: any;
    darkMode: boolean;
    createNodeButton: JSX.Element;
    createMenu: Function;
    setBusy: Function;
    deleteState: any;
    setDeleteState: Function;
    removeNode: Function;
    busy: any;
    selectedNode: Option<string>;
    setSelectedNode: Function;
    chartChange: boolean;
}

const NodeBrowser = (props: NodeBrowserProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const [charts, setCharts] = useState({});

    useEffect(() => {
        props.maybeNodes.match({
            None: () => null,
            Some: (nodes) => {

                nodes.forEach((n) => {
                    api.chartsForNode(n.id)
                        .then((ev) => {
                            charts[n.id] = ev.data.items;
                            setCharts({...charts});
                        });
                });
            }
        });

    }, [props.chartChange]);

    const rows = props.maybeNodes.match({
        None: () => {
            return [1, 2, 3, 4].map((e, i) => <tr key={i}>
                <td>{FILLER}</td>
            </tr>);
        },
        Some: (nodes) => {
            return nodes.length === 0 ?
                <tr><td colSpan={2}><NonIdealState
                    icon={"git-branch"}
                    title="No nodes"
                    description={S.NODE_DESCRIPTION}
                    action={props.createNodeButton}
                /></td></tr>
                : nodes.map((n: Node, i) => {

                    const menu = props.createMenu(n.id);
                    const rows = [<tr key={i}>
                        <td colSpan={2}>
                            <div id={n.id} className={" rounded-md mb-2 p-1 bg-opacity-60 hover:border-gradient " + s.BG_COLOR} key={i}>
                                <div className="flex">
                                    <div>
                                        <H4>{n.display_name}</H4>
                                        <div>{n.description ? n.description : "No description"}</div>
                                        <div>{formatRelative(parseISO(n.updated_at), new Date())}</div>
                                    </div>
                                    <div className="ml-auto z-10">
                                        <Popover2
                                            content={menu}
                                            interactionKind={Popover2InteractionKind.CLICK}
                                            placement="bottom-end">
                                            <Icon className={"cursor-pointer rotate-90"} icon="more" />
                                        </Popover2>
                                        {props.deleteState[n.id] ? <span><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                                            props.setBusy(true);
                                            props.removeNode(i);

                                        }} />   <Button text="CANCEL" onClick={() => {
                                            const copy = { ...props.deleteState };
                                            copy[n.id] = false;
                                            props.setDeleteState(copy);
                                        }} /> </span> : null}
                                    </div>
                                </div>

                            </div>
                        </td>
                    </tr>];

                    (charts[n.id] || []).forEach((ch, i) => {
                        rows.push(<tr key={100 + i}>
                            <td>&nbsp;</td>
                            <td>{renderChartTitle(ch)}
                            </td>
                        </tr>
                        );
                    });

                    return rows;
                });
        }
    });

    return <div className="h-[calc(100vh-11rem)] overflow-auto overflow-x-hidden">
        <div className="">
            <table className="w-full">
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>

    </div>;
};
export default NodeBrowser;
