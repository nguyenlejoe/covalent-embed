import React, { useCallback, useEffect, useState } from "react";
import { Button, ButtonGroup, EditableText, Menu, MenuItem, Intent, Icon, MenuDivider, NonIdealState, H3, H2 } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import * as C from "../helpers/colors";
import CardDropZone from "./card-comps/CardDropZone";
import CardWrapper from "./card-comps/CardWrapper";
import pLimit from "p-limit";
import { None, Some, Option } from "../helpers/option";
import { api, Board, Card, Chain } from "../helpers/api";
import { EightA, EightB, FiveA, FiveB, FourA, FourB, FourC, FourD, FourE, OneA, SixA, SixB, ThreeA, ThreeB, ThreeC, ThreeD, ThreeE, ThreeF, TwoA, TwoB } from "../helpers/gridIcons";
import S from "../helpers/strings";
import { useRouter } from 'next/router'


interface BoardDetailViewProps {
    board: Board;
    handleDeleteBoard?: () => void;
    handleSaveBoard?: () => void;
    setBoardTitle?: Function;
    setBoardDescription?: Function;
    reorderCard?: Function;
    handleFocus: Function;
    editMode: boolean;
    darkMode: boolean;
    showMessage?: Function;
    setCardCollection?: Function;
    collection?: Array<any>;
    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    pageDisplayName: string;
    handleDeleteCard?: Function;
    shareId?: string;
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    expanded: boolean;
    setRefreshPageCharts: Function;
    refreshPageCharts: boolean;
    chains: Chain[];
    groupId: Option<string>;
}


let showedMessageOnce = false;

export const BoardDetailView = (props: BoardDetailViewProps) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [maybeCards, setCards] = useState(None);
    const [deleteState, setDeleteState] = useState({});
    const limit = pLimit(3);
    const [embedState, setEmbed] = useState(false);
    const [boardLayout, setBoardLayout] = useState("1A");
    const [prevBoardLayout, setPrevBoardLayout] = useState("1A");
    const router = useRouter()
    const { pageId } = router.query

    useEffect(() => {
        const key = pageId ? pageId : "";
        const layout = localStorage.getItem(key);
        if (layout) {
            setBoardLayout(layout);
        } else {
            localStorage.setItem(key, boardLayout);
        }

    },[]);

    useEffect(() => {
        localStorage.setItem(pageId ? pageId : "", boardLayout);
    }, [boardLayout]);

    const handleBoardLayoutByKeyPress = useCallback((e) => {

        if (e.which === 48 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
        }
        if (e.which === 49 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout("1A");
            e.preventDefault();
        }
        if (e.which === 50 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "2A" ? prevState = "2B" : prevState = "2A";
            });
            e.preventDefault();
        }
        if (e.which === 51 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "3A" ? prevState = "3B" : prevState === "3B" ? prevState = "3C" : prevState === "3C" ?
                    prevState = "3D" : prevState === "3D" ? prevState = "3E" : prevState === "3E" ? prevState = "3F" : prevState === "3F" ? prevState = "3A" : prevState = "3A";
            });
            e.preventDefault();
        }
        if (e.which === 52 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "4A" ? prevState = "4B" : prevState === "4B" ? prevState = "4C" : prevState === "4C" ?
                    prevState = "4D" : prevState === "4D" ? prevState = "4E" : prevState === "4E" ? prevState = "4A" : prevState = "4A";
            });
            e.preventDefault();
        }
        if (e.which === 53 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "5A" ? prevState = "5B" : prevState = "5A";
            });
            e.preventDefault();
        }
        if (e.which === 54 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "6A" ? prevState = "6B" : prevState = "6A";
            });
            e.preventDefault();
        }
        if (e.which === 55 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
        }
        if (e.which === 56 && (e.ctrlKey || e.metaKey)) {
            setBoardLayout((prevState) => {
                return prevState === "8A" ? prevState = "8B" : prevState = "8A";
            });
            e.preventDefault();
        }
        if (e.which === 57 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        if (!showedMessageOnce) {
            props.showMessage?.({
                message: S.KEYBOARD_SHORTCUT_CYCLES_BOARD_LAYOUT,
                intent: Intent.PRIMARY,
                icon: "tick-circle"
            });
        }

        showedMessageOnce = true;

        document.addEventListener("keydown", handleBoardLayoutByKeyPress);

        return () => {
            document.removeEventListener("keydown", handleBoardLayoutByKeyPress);
        };
    }, [handleBoardLayoutByKeyPress]);

    useEffect(() => {
        setCards(new Some(props.board.cards));
    }, [props.board.cards]);

    useEffect(() => {
        // props.showMessage?.({
        //     message: "Changed board layout " + boardLayout.charAt(0) + ".",
        //     intent: Intent.SUCCESS,
        //     icon: "tick-circle"
        // });
    }, [prevBoardLayout]);

    const handleEmbed = () => {
        setEmbed((active) => !active);
    };

    const el = maybeCards.match({
        None: () => {
            return <div key="0"/>;
        },
        Some: (cards: Card[]) => {
            let col;
            let row;
            let interval;
            let start;
            let height;
            let spanHeight;
            let second;

            switch (boardLayout) {
                case "1A":
                    col = "grid-cols-1";
                    height = "h-[calc(100vh-431px)]";
                    break;
                case "2A":
                    col = "grid-cols-2";
                    height = "h-[calc(100vh-431px)]";
                    break;
                case "2B":
                    col = "grid-cols-1";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    break;
                case "3A":
                    col = "grid-cols-1";
                    height = "h-[calc(calc(100vh-587px)/3)]";
                    break;
                case "3B":
                    col = "grid-cols-3";
                    height = "h-[calc(100vh-431px)]";
                    break;
                case "3C":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(100vh-431px)]";
                    row = "row-span-2";
                    start = 0;
                    interval = 2;
                    break;
                case "3D":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(calc(100vh-509px)/2)]";
                    row = "col-span-2";
                    start = 2;
                    interval = 2;
                    break;
                case "3E":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(calc(100vh-509px)/2)]";
                    row = "col-span-2";
                    start = 0;
                    interval = 2;
                    break;
                case "3F":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(100vh-431px)]";
                    row = "row-span-2";
                    start = 1;
                    interval = 2;
                    break;
                case "4A":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(calc(100vh-509px)/2)]";
                    break;
                case "4B":
                    col = "grid-cols-4";
                    height = "h-[calc(100vh-431px)]";
                    break;
                case "4C":
                    col = "grid-cols-1";
                    height = "h-[calc(calc(100vh-665px)/4)]";
                    break;
                case "4D":
                    col = "grid-cols-2 grid-rows-3";
                    height = "h-[calc(calc(100vh-587px)/3)]";
                    spanHeight = "h-[calc(100vh-431px)]";
                    row = "row-span-3";
                    start = 0;
                    interval = 3;
                    break;
                case "4E":
                    col = "grid-cols-3";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(calc(100vh-509px)/2)]";
                    row = "col-span-3";
                    start = 0;
                    interval = 3;
                    break;
                // case "4F":
                //     col = "grid-cols-2";
                //     height = "h-[calc(calc(100vh-509px)/2)]";
                //     spanHeight = "h-[calc(25vh-9rem)]";
                //     row = "col-span-2";
                //     start = 2;
                //     interval = 0;
                //     break;
                case "5A":
                    col = "grid-cols-4";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    spanHeight = "h-[calc(calc(100vh-509px)/2)]";
                    row = "col-span-4";
                    start = 0;
                    interval = 4;
                    break;
                case "5B":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-665px)/4)]";
                    spanHeight = "h-[calc(100vh-431px)]";
                    row = "row-span-4";
                    start = 0;
                    interval = 4;
                    break;
                case "6A":
                    col = "grid-cols-3";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    break;
                case "6B":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-587px)/3)]";
                    break;
                case "8A":
                    col = "grid-cols-4";
                    height = "h-[calc(calc(100vh-509px)/2)]";
                    break;
                case "8B":
                    col = "grid-cols-2";
                    height = "h-[calc(calc(100vh-665px)/4)]";
                    break;
                default:
                    break;
            }
            if (prevBoardLayout !== boardLayout) {
                setPrevBoardLayout(boardLayout);
            }

            if (cards.length > 0 ) {
                return (
                    <div className={`grid ${col} border-l border-t ${s.BORDER_SECONDARY}`}>
                        {
                            cards.map((c, i) => {
                                if (i - 1 === start) {
                                    start = start + interval + 1;
                                }

                                return <div key={i} className={`${start === i && row} border-b border-r ${s.BORDER_SECONDARY}  ${s.BORDER_SECONDARY} `}>
                                    {/* <CardDropZone reorderCard={props.reorderCard} id={props.board.title + "-" + i + "-prepend"} key={props.board.title + "-" + i + "-prepend"} /> */}
                                    {/* <CardWrapper
                                        groupId={props.groupId}
                                        chains={props.chains}
                                        expanded={props.expanded}
                                        setRefreshPageCharts={props.setRefreshPageCharts}
                                        refreshPageCharts={props.refreshPageCharts}
                                        id={props.board.display_name + "-" + i}
                                        data={c}
                                        darkMode={props.darkMode}
                                        focusMode={false}
                                        handleFocus={props.handleFocus}
                                        setCardCollection={props.setCardCollection}
                                        collection={props.collection}
                                        height={start === i ? spanHeight : height}
                                        currentDateAgg={props.currentDateAgg}
                                        currentDateRange={props.currentDateRange}
                                        currentChainNames={props.currentChainNames}
                                        boardDisplayName={props.board.display_name}
                                        pageDisplayName={props.pageDisplayName}
                                        handleDeleteCard={props.handleDeleteCard}
                                        editMode={props.editMode}
                                        shareId={props.shareId}
                                        setUseChainFilter={props.setUseChainFilter}
                                        setUseDateRangeFilter={props.setUseDateRangeFilter}
                                        setUseDateAggFilter={props.setUseDateAggFilter}
                                        useChainFilter={props.useChainFilter}
                                        useDateRangeFilter={props.useDateRangeFilter}
                                        useDateAggFilter={props.useDateAggFilter}
                                    /> */}
                                    {/* <CardDropZone reorderCard={props.reorderCard} id={props.board.title + "-" + i + "-append"} key={props.board.title + "-" + i + "-append"} /> */}
                                </div>;
                            })
                        }

                    </div>
                );
            } else {
                return <div className="flex items-center justify-center h-full">
                    <NonIdealState
                        className="mb-8"
                        icon={"grid-view"}
                        title="No cards"
                        description={S.CARD_DESCRIPTION}
                    />
                </div>;
            }

        }
    });

    const boardTypeMenu = <Menu>
        <MenuItem icon="follower" text="Reach" />
        <MenuItem icon="heart" text="Retention" />
        <MenuItem icon="dollar" text="Revenue" />
    </Menu>;

    const layoutButtonClass = "ml-1 p-1.5 flex items-center cursor-pointer rounded-md hover:bg-[#7f0dff]/30";
    const layoutNumClass = "ml-2 mr-1 flex items-center justify-center";
    const layoutShortcutKeys = "ml-1 p-1.5 flex items-end text-gray-500 rounded-md";
    const layoutFlexDiv = "flex justify-between w-full";

    const boardLayoutMenu = <Menu>
        {/* <MenuItem icon="page-layout" text="1A" onClick={() => {
            setBoardLayout("1A");
        }} /> */}
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={"ml-2.5 mr-1 flex items-center justify-center "}>1</div>
                <div className={`${layoutButtonClass} ${boardLayout === "1A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("1A")}> {OneA} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘1 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>2</div>
                <div className={`${layoutButtonClass} ${boardLayout === "2A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("2A")}> {TwoA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "2B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("2B")}> {TwoB} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘2 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>3</div>
                <div className={`${layoutButtonClass} ${boardLayout === "3A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3A")}> {ThreeA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "3B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3B")}> {ThreeB} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "3C" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3C")}> {ThreeC} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "3D" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3D")}> {ThreeD} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "3E" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3E")}> {ThreeE} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "3F" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("3F")}> {ThreeF} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘3 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>4</div>
                <div className={`${layoutButtonClass} ${boardLayout === "4A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("4A")}> {FourA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "4B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("4B")}> {FourB} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "4C" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("4C")}> {FourC} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "4D" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("4D")}> {FourD} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "4E" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("4E")}> {FourE} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘4 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>5</div>
                <div className={`${layoutButtonClass} ${boardLayout === "5A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("5A")}> {FiveA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "5B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("5B")}> {FiveB} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘5 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>6</div>
                <div className={`${layoutButtonClass} ${boardLayout === "6A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("6A")}> {SixA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "6B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("6B")}> {SixB} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘6 </div>
        </ButtonGroup>
        <MenuDivider />
        <ButtonGroup className={`${layoutFlexDiv}`}>
            <div className={"flex"}>
                <div className={`${layoutNumClass}`}>8</div>
                <div className={`${layoutButtonClass} ${boardLayout === "8A" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("8A")}> {EightA} </div>
                <div className={`${layoutButtonClass} ${boardLayout === "8B" && "bg-[#7f0dff]/30"}`}onClick={() => setBoardLayout("8B")}> {EightB} </div>
            </div>
            <div className={`${layoutShortcutKeys}`}> ⌘8 </div>
        </ButtonGroup>
        <MenuDivider />

    </Menu>;

    const descTooltip = props.board.description.trim().length > 0
        ?
        <div className="inline-block">
            <Tooltip2
                content={<span className="text-xl  ">{props.board.description}</span>}
                openOnTargetFocus={false}
                placement="right"
                usePortal={false}
            >
                <Button icon="info-sign" minimal={true} />
            </Tooltip2>
        </div>
        : null;
    const layoutTooltip = <Popover2 className="mr-2" content={boardLayoutMenu} placement="bottom-start">
        <Button icon="page-layout" minimal={true} />
    </Popover2>;

    return <div>
        <div className={"border-b mb-6 mx-2 " + s.BORDER_SECONDARY}>
            <div className="flex justify-between mt-4 ">
                <div className={`flex flex-col ${props.editMode && "w-full"}`}>
                    {props.shareId ?
                        <div className="text-3xl font-extralight mb-2">{props.board.display_name}</div>
                        :
                        <EditableText
                            placeholder="Edit title..."
                            value={props.board.display_name}
                            disabled={!props.editMode}
                            className={`text-3xl font-extralight mb-2 leading-none ${s.TEXT_COLOR} ${props.editMode && " truncate w-64"}`}
                            onChange={(e) => {
                                props.setBoardTitle?.(e);
                            }}
                            onConfirm={props.handleSaveBoard}
                        />
                    }

                    {props.editMode &&
                        <EditableText
                            multiline={true}
                            placeholder="Edit description..."
                            value={props.board.description}
                            disabled={!props.editMode}
                            className={`text-2xl font-extralight mb-4 ${s.TEXT_COLOR} ${props.editMode && " truncate"}`}
                            onChange={(e) => {
                                props.setBoardDescription?.(e);
                            }}
                            onConfirm={props.handleSaveBoard}
                        />
                    }
                </div>
                {props.editMode &&
                    <div className="mt-2">
                        {deleteState[props.board.id] ? <span className="flex"><Button intent={Intent.DANGER} text="DELETE" onClick={props.handleDeleteBoard} />   <Button text="CANCEL" onClick={() => {
                            const copy = { ...deleteState };
                            copy[props.board.id] = false;
                            setDeleteState(copy);
                        }} /> </span> :
                            <ButtonGroup>
                                {/* <Button minimal={true} icon="edit" />
                                <Button minimal={true} icon="plus" /> */}
                                <Button minimal={true} icon="trash" onClick={() => {
                                    const copy = { ...deleteState };
                                    copy[props.board.id] = true;
                                    setDeleteState(copy);
                                }} />
                                {/* <Popover2 content={boardTypeMenu} placement="bottom-start">
                                    <Button minimal={true} rightIcon="caret-down" icon="emoji" />
                                </Popover2> */}
                            </ButtonGroup>
                        }
                    </div>
                }
                {props.editMode ? null : <div className="mt-2">{descTooltip}{layoutTooltip}
                </div>}
            </div>
        </div>
        {}
        <div className={`overflow-y-auto overflow-x-hidden min-w-[27rem]  pr-2 ${!props.shareId ? "h-[calc(100vh-22rem)]" : "h-[calc(100vh-139px)] "}`}>
            {el}
        </div>
    </div>;

};


