import { Button, Card, H1, H3 } from "@blueprintjs/core";
import React, { useState, useEffect } from "react";
import * as C from "../helpers/colors";
// import Board from "./Board";
import FocusCard from "./card-comps/FocusCard";
import { Icon } from "@blueprintjs/core";
import { Option, Some, None } from "../helpers/option";
import { Board, Chain } from "../helpers/api";
import { FILLER } from "../helpers/filler";
import { BoardDetailView } from "./BoardDetailView";

interface LayoutProps {
    darkMode: boolean;
    maybeBoards: Option<Board[]>;
    setBoards: Function;
    handleSaveBoard: Function;
    handleAddBoard: Function;
    handleDeleteBoard: Function;
    editMode: boolean;
    handleDeleteCard: Function;
    showMessage?: Function;
    pageId?: string;
    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    pageDisplayName: string;
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    setRefreshPageCharts: Function;
    refreshPageCharts: boolean;
    chains: Chain[];
    groupId: Option<string>;
    expandedBoard: number;
    setExpandedBoard: Function;
}

export function Layout(props: LayoutProps) {
    const reorderCard = (card: string, newLocation: string) => {
        return;
    };

    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [focusGraph, setFocusGraph] = useState();
    const [focusActive, setFocusActive] = useState(false);
    const [cardCollection, setCardCollection] = useState<any>([]);

    const handleFocusActive = () => {
        setFocusActive((e) => !e);
    };

    const handleFocus = (graph) => {
        setFocusGraph(graph);
        if (!focusActive) {
            handleFocusActive();
        }
    };

    useEffect(() => {
        const collection = props.maybeBoards && props.maybeBoards.match({
            None: () => null,
            Some: (v) => {
                let cardCollection: any = [];
                for (const i of v) {
                    cardCollection = [...cardCollection, ...i.cards];
                }
                return cardCollection;
            }
        });
        if (collection) {
            setCardCollection([...collection]);
        }

    }, [props.maybeBoards]);
    const bg = `${props.darkMode ? "-bg-black" : "-bg-white"} -bg-opacity-25 mr-1 border-b-0 ` + s.BORDER;


    return (
        <div className={"--overflow-y-auto " + "  h-[calc(100vh-51px-208px)]"}>
            <FocusCard
                setRefreshPageCharts={props.setRefreshPageCharts}
                refreshPageCharts={props.refreshPageCharts}
                active={focusActive}
                darkMode={props.darkMode}
                data={focusGraph}
                handleFocusActive={handleFocusActive}
                cardCollection={cardCollection}
                handleFocusGraph={handleFocus}
                handleDeleteCard={props.handleDeleteCard}
                editMode={props.editMode}
                showMessage={props.showMessage}
                currentDateAgg={props.currentDateAgg}
                currentDateRange={props.currentDateRange}
                pageName={props.pageDisplayName}
                boards={props.maybeBoards}
                currentChainNames={props.currentChainNames}
                setUseChainFilter={props.setUseChainFilter}
                setUseDateRangeFilter={props.setUseDateRangeFilter}
                setUseDateAggFilter={props.setUseDateAggFilter}
                useChainFilter={props.useChainFilter}
                useDateRangeFilter={props.useDateRangeFilter}
                useDateAggFilter={props.useDateAggFilter}
            />


                <div className={"flex  min-h-full"}>

                {
                    props.maybeBoards.match({
                        None: () => {
                            return [1, 2, 3, 4, 5].map((b, i) => {
                                const bg = `${props.darkMode ? "-bg-black" : "-bg-white"} bg-opacity-25  border-b-0 ` + s.BORDER;

                                return <div className={`${bg} px-6 border w-[4rem] relative mr-1 `} key={i} >
                                    <div className="rotate-90 text-3xl">
                                        {FILLER}
                                    </div>
                                </div>;
                            });
                        },
                        Some: (boards) => {
                            return boards.map((board, i) => {
                                const bg = `${props.darkMode ? "-bg-black" : "-bg-white"} -bg-opacity-25 mr-1 border-b-0 ` + s.BORDER;

                                return <div className={`${bg} ${i === props.expandedBoard ? "border-b" : "border-b "} border border-1 relative mb-1 ${i === props.expandedBoard ? "  pr-2 pl-3 w-[calc(100vw)]" : "border-b cursor-pointer "} ${s.BG_COLOR_SECONDARY} ` + s.BORDER} key={i} onClick={() => {
                                    props.setExpandedBoard(i);
                                }}>

                                    <div className={`${bg} px-6 w-[4rem] relative mr-1 pt-2 bp4-text-muted cursor-pointer hover:${s.TEXT_COLOR} ${i === props.expandedBoard && " hidden " }`}  >
                                        <Icon className="rotate-90 cursor-pointer " icon="expand-all" />
                                        <div className="rotate-90 text-3xl font-thin whitespace-nowrap">
                                            {board.display_name}
                                        </div>
                                    </div>

                                    <div className={` ${i !== props.expandedBoard && " hidden "} `}>
                                        <BoardDetailView
                                            groupId={props.groupId}
                                            chains={props.chains}
                                            expanded={i === props.expandedBoard}
                                            showMessage={props.showMessage}
                                            setRefreshPageCharts={props.setRefreshPageCharts}
                                            refreshPageCharts={props.refreshPageCharts}
                                            board={board}
                                            handleSaveBoard={() => {
                                                props.handleSaveBoard(board);
                                            }}
                                            setBoardTitle={(display_name) => {
                                                board.display_name = display_name;
                                                props.setBoards(new Some(boards));
                                            }}
                                            setBoardDescription={(desc) => {
                                                board.description = desc;
                                                props.setBoards(new Some(boards));
                                            }}
                                            handleDeleteCard={props.handleDeleteCard}
                                            setCardCollection={setCardCollection}
                                            collection={cardCollection}
                                            reorderCard={reorderCard}
                                            editMode={props.editMode}
                                            darkMode={props.darkMode}
                                            handleFocus={handleFocus}
                                            handleDeleteBoard={() => {
                                                props.handleDeleteBoard(board);
                                            }}
                                            currentDateAgg={props.currentDateAgg}
                                            currentDateRange={props.currentDateRange}
                                            currentChainNames={props.currentChainNames}
                                            pageDisplayName={props.pageDisplayName}
                                            setUseChainFilter={props.setUseChainFilter}
                                            setUseDateRangeFilter={props.setUseDateRangeFilter}
                                            setUseDateAggFilter={props.setUseDateAggFilter}
                                            useChainFilter={props.useChainFilter}
                                            useDateRangeFilter={props.useDateRangeFilter}
                                            useDateAggFilter={props.useDateAggFilter}
                                        />
                                    </div>
                                </div>;


                            });
                        }
                    })
                }

                {props.editMode
                    ? <div className={`${bg} px-6 border w-[4rem] relative mr-1 pt-2 bp4-text-muted cursor-pointer hover:${s.TEXT_COLOR} transition-all ease-in-out`} onClick={() => {
                        props.handleAddBoard();
                    }} >
                        <Icon className="rotate-90 cursor-pointer " icon="plus" />
                        <div className="rotate-90 text-3xl font-thin whitespace-nowrap">
                            Add board
                        </div>
                    </div>
                    : null}

                {/* {props.editMode
                    ? <div className={`${s.BG_COLOR_SECONDARY} flex items-center justify-center px-6 w-[20rem]  border-2 border-gray-600 rounded-md m-4 hover:border-gray-300 transition-all cursor-pointer`} onClick={() => {
                        props.handleAddBoard();
                    }}>
                        <H3 className="truncate">Add Board +</H3>
                    </div>
                    : null} */}
            </div>
        </div>
    );
}


