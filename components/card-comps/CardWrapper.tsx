import React, { useState, useEffect, useRef } from "react";
import * as C from "../../helpers/colors";
import GraphCard from "./GraphCard";
import NftCard from "./NftCard";
import { ChartContainer } from "../node-comps/ChartContainer";
import { DetailsCard } from "./DetailsCard";
import { CardProps } from "../charts/ChartConfig";
import pLimit from "p-limit";
import { Option, Some, None } from "../../helpers/option";
import { csvDownload } from "../../helpers/csvHandler";
import { buildUserCard } from "../../hooks/buildUserCard";
import { generateSubtitle, generateTitlePrefix } from "../../helpers/formats";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { Button, Icon, Intent, Menu, MenuItem, Spinner } from "@blueprintjs/core";
import { isProduction } from "../../models";

const CardWrapper = (props: CardProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const refContainer = useRef(null);
    const [dragging, setDragging] = useState(false);
    const limit = pLimit(3);
    const [maybeResponse, setResponse] = useState(None);
    const [deleteState, setDeleteState] = useState({});
    const [displayChainFilterSubtitle, setDisplayChainFilterSubtitle] = useState(false);
    const [displayDateAggSubtitle, setDisplayDateAggSubtitle] = useState(false);
    const [displayDateRangeSubtitle, setDisplayDateRangeSubtitle] = useState(false);
    const [doneLoading, setDoneLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const COVALENT_GROUP_ID = "group_d632592ddbde4a499452d25b";

    const dragStartHandler = (ev) => {
        ev.dataTransfer.setData("text/plain", ev.target.id);
        setDragging(true);
    };

    const dragStopHandler = (ev) => {
        setDragging(false);
    };

    // useEffect(() => {
    //     refContainer.current.addEventListener("dragstart", dragStartHandler);
    //     refContainer.current.addEventListener("dragend", dragStopHandler);
    //     return () => {
    //         document.removeEventListener("dragstart", dragStartHandler);
    //         document.removeEventListener("dragend", dragStopHandler);
    //     };
    // }, []);

    const handleCardData = () => {
        setDoneLoading(false);
        try {
            const card = limit(() => buildUserCard({
                cardsData: props.data, currentDateAgg: props.currentDateAgg, currentDateRange: props.currentDateRange, currentChainNames: props.currentChainNames,
                setUseChainFilter: props.setUseChainFilter,
                setUseDateRangeFilter: props.setUseDateRangeFilter,
                setUseDateAggFilter: props.setUseDateAggFilter,
                useChainFilter: props.useChainFilter,
                useDateRangeFilter: props.useDateRangeFilter,
                useDateAggFilter: props.useDateAggFilter,
                setDisplayChainFilterSubtitle: setDisplayChainFilterSubtitle,
                setDisplayDateAggSubtitle: setDisplayDateAggSubtitle,
                setDisplayDateRangeSubtitle: setDisplayDateRangeSubtitle,
                expanded: props.expanded
            }));
    
    
    
            card.then((result) => {
                setDoneLoading(true);
                if (result) {
                    const collection = props.collection;
                    if (collection) {
                        for (let i = 0; i < collection.length; i++) {
                            if (collection[i].id === result.id) {
                                collection[i] = result;
                                props.setCardCollection?.(collection);
                            }
                        }
                    }
                    setResponse(new Some(result));
                } else {
                    setResponse(new Some(false));
                }
    
            });
        }catch{
            setResponse(new Some(false));
        }

    };

    useEffect(() => {
        // props?.setUseChainFilter(false);
        // props?.setUseDateAggFilter(false);
        // props?.setUseDateRangeFilter(false);
        // if (specialSyntaxIncluded) {
        //     // setResponse(None);
        //     handleCardData();
        // }
        if (props.refreshPageCharts) {
            props.setRefreshPageCharts(false);
            setResponse(None);
        }
        // handleCardData();
        setResponse(new Some(false));
        setFirstLoad(false);

    }, [props.data]);

    useEffect(() => {
        if (firstLoad && !props.refreshPageCharts) {
            return;
        }
        if (displayDateAggSubtitle && !props.refreshPageCharts) {
            handleCardData();
        }

    }, [props.currentDateAgg]);

    useEffect(() => {
        if (firstLoad && !props.refreshPageCharts) {
            return;
        }
        if (displayDateRangeSubtitle && !props.refreshPageCharts) {
            handleCardData();
        }

    }, [props.currentDateRange]);

    useEffect(() => {
        if (firstLoad && !props.refreshPageCharts) {
            return;
        }
        if (displayChainFilterSubtitle && !props.refreshPageCharts) {
            handleCardData();
        }

    }, [props.currentChainNames]);


    const cardWrapperStyle = `${dragging ? "border-gradient" : ""} cursor-pointer ${s.TEXT_COLOR} 
    ${props.darkMode ? `bg-black border ${s.BORDER_SECONDARY} ` : ` border ${s.BORDER_SECONDARY}`} 
    bg-opacity-25    cursor-grab hover:${s.BORDER}  `;

    const subtitle = generateSubtitle(props.currentDateRange, props.currentChainNames, props.currentDateAgg, displayChainFilterSubtitle, displayDateAggSubtitle, displayDateRangeSubtitle, props.chains),
        titlePrefix = generateTitlePrefix(props.pageDisplayName, props.boardDisplayName, props.currentDateAgg);

    const menu = <Menu>
        {isProduction ? props.groupId.match({
            None: () => null,
            Some: (s) => {
                if (s === COVALENT_GROUP_ID) {
                    return <MenuItem  icon="send-to" text="Go to SQL" onClick={() => {
                        window.location.hash = `/increment/sql/${props.data.chart.pipeline_id}`;
                    }}/>;
                }
            }
        }) :
            <MenuItem  icon="send-to" text="Go to SQL" onClick={() => {
                window.location.hash = `/increment/sql/${props.data.chart.pipeline_id}`;
            }}/>
        }
        <MenuItem  icon="download" text="Download CSV" onClick={() => {
            maybeResponse.match({
                None: () => null,
                Some: (data: any) => {
                    const displayName = props.pageDisplayName + "-" + props.boardDisplayName + "-" + (props.data.chart.display_name !== "" ? props.data.chart.display_name : "Unnamed " + props.data.chart.chart_type + " chart");
                    csvDownload(data.maybeData, None, displayName);
                }
            });
        }}/>
        {props.editMode &&
            <MenuItem  icon="trash" text="Delete" intent={Intent.DANGER} onClick={() => {
                const copy = { ...deleteState };
                copy[props.data.id] = true;
                setDeleteState(copy);
            }} />
        }
    </Menu>;

    return <div className={`relative ${s.TEXT_COLOR} cursor-pointer w-full`}>
        {!props.shareId && props.id !== "focus" &&
        <>
            {deleteState[props.data.id] ?
                <span className="flex absolute top-4 right-2 z-20"><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                    props.handleDeleteCard?.(props.data);
                }}/>   <Button text="CANCEL" onClick={() => {
                    const copy = { ...deleteState };
                    copy[props.data.id] = false;
                    setDeleteState(copy);
                }} /> </span> :
                <div className={"absolute top-4 right-1 z-20"}>
                    <Popover2 content={menu} interactionKind={Popover2InteractionKind.CLICK}
                        placement="bottom-end"><Icon size={20} className={"rotate-90 cursor-pointer bp4-text-muted"} icon="more"/>
                    </Popover2>
                </div>
            }
        </>
        }
        {
            maybeResponse.match({
                None: () =>
                    <div id={props.id} draggable="true" ref={refContainer} onClick={() => {
                        props.handleFocus(props.data);
                    }}>
                        <div className={"p-2  "}>
                            <div className={"pb-4"}>
                                <div> {titlePrefix} {props.data.chart.display_name ? props.data.chart.display_name : "Unnamed card"}</div>
                                <div className="my-1 bp4-text-muted text-xs">{subtitle}</div>
                            </div>

                            <div className={`relative animate-pulse flex flex-col items-center justify-center ${props.height && props.id !== "focus" ? props.height : "h-80"}`}>
                                <Spinner/>
                                <div className="mt-4">Loading...</div>
                            </div>
                        </div>
                    </div>
                ,
                Some: (card) => {
                    if (card) {
                        card.darkMode = props.darkMode;
                        card.height = props.height;
                        card.display_name = props.data.chart.display_name;
                    }
                    return (
                        <div id={props.id} draggable="true" ref={refContainer} onClick={() => {
                            props.handleFocus?.(card ? card : props.data);
                        }}>
                            {card ?
                                <div className={doneLoading ? "" : "blur-md"} >
                                    <ChartContainer
                                        {...card}
                                        subtitle={subtitle}
                                        boardDisplayName={props.boardDisplayName}
                                        pageDisplayName={props.pageDisplayName}
                                        currentDateAgg={props.currentDateAgg}
                                    />
                                </div>
                                :
                                <div className={"p-2"}>
                                    <div className={"pb-4"}>
                                        <div className="pr-4">{props.data.chart.display_name ? props.data.chart.display_name : "Unnamed card"}</div>
                                        <div className="my-1 bp4-text-muted text-xs">{subtitle}</div>
                                    </div>
                                    <div className={`relative animate-pulse flex items-center justify-center ${props.height && props.id !== "focus" ? props.height : "h-80"}`}>
                                        Failed to load SQL
                                    </div>
                                </div>
                            }

                        </div>
                    );
                }

            })
        }

    </div>;
};

export default CardWrapper;
