import { data } from "autoprefixer";
import React, { useState, useEffect, useRef } from "react";
import * as C from "../../helpers/colors";
import { Icon, Intent, Button, Spinner } from "@blueprintjs/core";
import CardWrapper from "./CardWrapper";
import Carousel from "../Carousel";
import S from "../../helpers/strings";
import { ChartContainer } from "../node-comps/ChartContainer";
import { Board } from "../../helpers/api";
import { Option, Some, None } from "../../helpers/option";
import { csvDownload } from "../../helpers/csvHandler";


interface FocusCardProps {
    data: any;
    active: boolean;
    darkMode: boolean;
    handleFocusActive: Function;
    cardCollection: any;
    handleFocusGraph: Function;
    handleDeleteCard: Function;
    editMode: boolean;
    showMessage?: Function;
    currentDateAgg: string;
    currentDateRange: string;
    pageName: string;
    boards: Option<Board[]>;
    currentChainNames: string[];
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    setRefreshPageCharts: Function;
    refreshPageCharts: boolean;
}

const FocusCard = (props: FocusCardProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [scale, setScale] = useState("scale-0");
    const [thumbnailScale, setThumbnailScale] = useState("scale-0");
    const [enlarge, setEnlarge] = useState(false);
    const collectionRef = useRef(null);
    const graphRef = useRef(null);
    const [deleteState, setDeleteState] = useState({});
    const [embedState, setEmbed] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (collectionRef.current && graphRef.current && !collectionRef.current.contains(event.target) && !graphRef.current.contains(event.target)) {
                handleClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [collectionRef, graphRef]);

    if (props.data) {
        props.data.height = false;
    }

    useEffect(() => {
        if (props.active) {
            const timer = setTimeout(() => {
                setScale("w-6/12 2xl:w-[60rem]");
                setThumbnailScale("aspect-square");
            }, 100);
            return () => clearTimeout(timer);
        }

    }, [props.active]);

    const handleClose = async () => {
        setScale("scale-0");
        setThumbnailScale("scale-0");
        setEnlarge(false);
        setEmbed(false);
        const timer = setTimeout(() => {
            props.handleFocusActive();
        }, 400);
        return () => clearTimeout(timer);
    };

    const handleEmbed = () => {
        setEmbed((active) => !active);
    };

    const handleExpand = () => {
        if (!enlarge) {
            setThumbnailScale("scale-0");
            setScale("w-10/12 xl:w-[90rem] 2xl:w-[100rem] mt-48");
            setEnlarge(true);
        } else {
            setThumbnailScale("aspect-square");
            setScale("w-6/12 2xl:w-[60rem]");
            setEnlarge(false);
        }

    };

    return (
        <div className={s.TEXT_COLOR}>
            {props.active &&
                <div className={"z-100 fixed top-0 left-0 h-screen w-screen flex flex-col items-center justify-center transition-all ease-in-out bg-black bg-opacity-20 " + `${props.active && "backdrop-blur-sm opacity-100"}`}>
                    {/* <div ref={graphRef} className={`${scale} relative mb-2 mt-12 w-3/5 p-8 pr-20 ${s.TEXT_COLOR} ${props.darkMode ? "bg-black border border-gray-800" : "bg-white shadow-sm border border-gray-200 bg-opacity-100"} bg-opacity-80 my-4 rounded-md transition-all ease-in-out duration-500`}>
                        <CardWrapper
                            id={"focus"}
                            data={props.data.data}
                            darkMode={props.data.darkMode}
                            focusMode={true}
                        />
                        <div className="absolute top-5 right-5 flex flex-col">
                            <Icon className={"mb-6 cursor-pointer"} icon="cross" onClick={handleClose}/>
                            <Icon className={"mb-6 cursor-pointer"} icon={!enlarge ? "zoom-to-fit" : "minimize"} onClick={handleExpand}/>
                        </div>
                    </div> */}
                    <div ref={graphRef} className={`${s.TEXT_COLOR} p-6 pr-12 relative ${scale} ${props.darkMode ? "bg-black border border-gray-800" : "bg-white shadow-sm border border-gray-200 bg-opacity-100"} bg-opacity-80 my-4 rounded-md transition-all ease-in-out duration-500`}>
                        {props.data.tableData || props.data.chartType ?
                            <ChartContainer
                                {...props.data} />    :
                            <div className="h-[25rem] flex items-center justify-center bg-white">
                                <CardWrapper
                                    id={"focus"}
                                    setRefreshPageCharts={props.setRefreshPageCharts}
                                    refreshPageCharts={props.refreshPageCharts}
                                    data={props.data}
                                    darkMode={false}
                                    focusMode={true}
                                    currentDateAgg={props.currentDateAgg}
                                    currentDateRange={props.currentDateRange}
                                    currentChainNames={props.currentChainNames}
                                    setUseChainFilter={props.setUseChainFilter}
                                    setUseDateRangeFilter={props.setUseDateRangeFilter}
                                    setUseDateAggFilter={props.setUseDateAggFilter}
                                    useChainFilter={props.useChainFilter}
                                    useDateRangeFilter={props.useDateRangeFilter}
                                    useDateAggFilter={props.useDateAggFilter}
                                />
                            </div>
                        }
                        {deleteState[props.data.id] ? <span className="flex absolute top-3 right-5"><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                            props.handleDeleteCard(props.data);
                            handleClose();
                        }}/>   <Button text="CANCEL" onClick={() => {
                            const copy = { ...deleteState };
                            copy[props.data.id] = false;
                            setDeleteState(copy);
                        }} /> </span> :
                            <div className="absolute top-5 right-5 flex flex-col">
                                <Icon className={"mb-6 cursor-pointer " + s.TEXT_COLOR} icon="cross" onClick={handleClose}/>
                                <Icon className={"mb-6 cursor-pointer text-black " + s.TEXT_COLOR} icon={!enlarge ? "maximize" : "minimize"} onClick={handleExpand}/>
                                {/* <Icon className={"mb-6 cursor-pointer"} icon={"share"} onClick={() => {
                                    handleEmbed();
                                }}/> */}
                                <Icon className={"mb-6 cursor-pointer text-black " + s.TEXT_COLOR} icon="send-to" onClick={() => {
                                    window.location.hash = `increment/sql/${props.data.chart ? props.data.chart.pipeline_id : props.data.query_id}`;
                                }}/>
                                <Icon className={"mb-6 cursor-pointer text-black " + s.TEXT_COLOR} icon="download" onClick={() => {
                                    let boardDisplayName;
                                    props.boards.match({
                                        None: () => null,
                                        Some: (data: any) => {
                                            data.forEach((board: any) => {
                                                board.cards.forEach((card: any) => {
                                                    if (card.id === props.data.id) {
                                                        boardDisplayName = board.display_name;
                                                    }
                                                });
                                            });
                                        }
                                    });
                                    const displayName = props.pageName + "-" + boardDisplayName + "-" + (props.data.display_name !== "" ? props.data.display_name : "Unnamed " + props.data.chartType + " chart");
                                    csvDownload(props.data.maybeData, None, displayName);
                                }}/>
                                {props.editMode &&
                                    <Icon className={"mb-6 cursor-pointer"} icon="trash" onClick={() => {
                                        const copy = { ...deleteState };
                                        copy[props.data.id] = true;
                                        setDeleteState(copy);
                                    }} />
                                }
                            </div>}
                    </div>
                    <div>
                        <div ref={collectionRef} className="w-[40rem]">
                            <Carousel
                                cardCollection={props.cardCollection}
                                darkMode={props.darkMode}
                                handleFocusGraph={props.handleFocusGraph}
                                thumbnailScale={thumbnailScale}
                                focusGraph={props.data}
                            />
                        </div>
                    </div>

                </div>
            }
        </div>
    );
};


export default FocusCard;
