import React, { useState, useEffect, FC, useMemo } from "react";
import { Option } from "../helpers/option";
import {  } from "../helpers/common";
import { Dialog, H1, H3, Divider, MenuItem, Button, Icon, Intent, Checkbox, H5, FormGroup, Tag } from "@blueprintjs/core";
import { ItemRenderer,  Select2 } from "@blueprintjs/select";
import S from "../helpers/strings";
import { CHAIN_ID_MAP, DATE_RANGE_MAP } from "../helpers/common";
import * as C from "../helpers/colors";
import { Board, Card, Page } from "../helpers/api";
import _includes = require("lodash/includes");
import {cipher} from "../helpers/crypt";


interface ShareModalProps {
    isOpen: boolean;
    setOpen: Function;
    darkMode: boolean;
    maybeBoards: Option<Board[]>;
    maybePage: Option<Page>;
    showMessage?: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    currentChainNames: string[];
    currentDateAgg: string;
    currentDateRange: string;
}

interface filterType {
    value: string;
    type: string;
}

function ShareModal(props: ShareModalProps) {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [shareOption, setShareOption] = useState<string>();
    const [secondOption, setSecondOption] = useState<Array<any>>([]);
    const [selectedSecond, setSelectedSecond] = useState<any>();
    const [toggleFilters, setFilters] = useState<boolean>(false);
    const [currentFilters, setCurrentFilter] = useState<filterType[]>([]);
    const myCipher = cipher("covalent-embed");

    const embedParams = {
        filter: toggleFilters,
        chains: props.currentChainNames,
        agg: props.currentDateAgg,
        range: props.currentDateRange
    };

    useEffect(() => {
        let filters: filterType[] = [];

        if (props.useChainFilter) {
            for (const i of props.currentChainNames) {
                for (const k of CHAIN_ID_MAP) {
                    if (k[1] === i) {
                        filters = [...filters, {
                            value: k[0],
                            type: "chain"
                        }];
                    }
                }
            }
        }
        if (props.useDateAggFilter) {
            filters.push({
                value: `aggregated ${props.currentDateAgg}`,
                type: "dateAgg"
            });
        }
        if (props.useDateRangeFilter) {
            for (const k of DATE_RANGE_MAP) {
                if (k[1] === props.currentDateRange) {
                    filters = [...filters, {
                        value: k[0],
                        type: "dateRange"
                    }];
                }
            }
        }


        setCurrentFilter([...filters]);
    },[props.useChainFilter, props.useDateAggFilter, props.useDateRangeFilter, props.currentChainNames, props.currentDateAgg, props.currentDateRange]);

    let allCardsOnPage: Array<Card> = [];

    const iframeSize = shareOption === "Page" ? "height=\"1130\" width=\"1000\"" : shareOption === "Board" ? "height=\"1000\" width=\"680\"" : "height=\"420\" width=\"680\"";

    const handleToggleFilter = () => {
        setFilters(((active) => !active));
    };

    const renderShareOption: ItemRenderer<string> = (item, { handleClick, modifiers, query }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={item}
                key={item}
                onClick={handleClick}
                text={item}
            />
        );
    };

    const renderSecondOptionItem: ItemRenderer<any> = (item, { handleClick, modifiers, query }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={item.display_name ? item.display_name : item.chart.display_name ? item.chart.display_name : "Untitled"}
                key={item.id}
                onClick={handleClick}
                text={item.display_name ? item.display_name : item.chart.display_name ? item.chart.display_name : "Untitled"}
            />
        );
    };


    const renderSecondOption = (shareOption) => {

        setShareOption(shareOption);

        switch (shareOption) {
            case "Page":
                return props.maybePage.match({
                    None: () => null,
                    Some: (page) => {
                        setSecondOption([page]);
                        setSelectedSecond(page);
                    }
                });
            case "Board":
                return props.maybeBoards.match({
                    None: () => null,
                    Some: (boards) => {
                        setSecondOption(boards);
                    }
                });
            case "Card":
                return props.maybeBoards.match({
                    None: () => null,
                    Some: (boards) => {
                        for (const i of boards) {
                            allCardsOnPage = [...allCardsOnPage, ...i.cards];
                        }
                        setSecondOption(allCardsOnPage);
                    }
                });
            default:
                break;
        }
    };

    useEffect(() => {
        setSelectedSecond("");
        renderSecondOption(shareOption);
    },[shareOption]);

    // w-[calc(100vw-200px)]

    return (
        <Dialog
            canEscapeKeyClose={true}
            isCloseButtonShown={true}
            title="Choose what to embed"
            className={`  ${props.darkMode ? "bp4-dark" : ""}`}
            isOpen={props.isOpen}
            icon={"code"}
            onClose={() => {
                props.setOpen(false);
            }}
        >
            <div className="pt-2 px-4">
                <div className="flex p-1 my-3 w-full justify-between">
                    <Select2
                        className="w-5/12"
                        items={["Page", "Board", "Card"]}
                        itemRenderer={renderShareOption}
                        onItemSelect={(val) => {
                            renderSecondOption(val);
                        }}
                    >
                        <Button fill={true} >{shareOption ? shareOption : "Select an option"}</Button>
                    </Select2>
                    <Select2
                        className="w-5/12"
                        items={secondOption}
                        itemRenderer={renderSecondOptionItem}
                        onItemSelect={(val) => {
                            setSelectedSecond(val);
                        }}
                    >
                        <Button fill={true} disabled={!shareOption ? true : false} >{selectedSecond && selectedSecond.display_name ? selectedSecond.display_name : selectedSecond && shareOption === "Card" && selectedSecond.chart.display_name === "" ? "Untitled Card" : shareOption === "Card" && selectedSecond ? selectedSecond.chart.display_name  : shareOption === "Page" ? secondOption[0].display_name : shareOption === "Board" ? "Please select a board" : shareOption === "Card" ? "Please select a card" : "Please select first option"}</Button>
                    </Select2>
                </div>
                <div className="px-1 mb-4">
                    <H5 className="">Current filters</H5>
                    <div className={`flex flex-wrap mt-2 border relative px-1 py-1 rounded-sm ${s.BORDER_SECONDARY}  ${s.BG_COLOR_SECONDARY}`}>
                        {currentFilters.map((o,i) => {
                            return <Tag key={i} intent={o.type === "chain" ? Intent.PRIMARY : o.type === "dateAgg" ? Intent.SUCCESS : Intent.WARNING} className="mx-1 my-0.5">{o.value}</Tag>;
                        })}
                    </div>
                </div>

                <div className="px-1 mb-4">
                    <H5 className="">Embed settings</H5>
                    <div className={"flex"}>
                        <FormGroup
                            helperText={"Visibility for filters"}
                        >
                            <Checkbox checked={toggleFilters} onClick={() => {
                                handleToggleFilter();
                            }}> Enable filter bar </Checkbox>
                        </FormGroup>
                        <FormGroup
                            className="ml-8"
                            helperText={"Lock current filters for widget"}
                        >
                            <Checkbox  checked={!toggleFilters} onClick={() => {
                                handleToggleFilter();
                            }}> Pre-select filters </Checkbox>
                        </FormGroup>
                    </div>
                </div>

                <div className="px-1">
                    <H5 className="">Embed URL</H5>
                    <div className={`flex justify-between mt-2 border relative p-4 rounded-sm ${s.BORDER_SECONDARY}  ${s.BG_COLOR_SECONDARY} break-all`}>
                        {selectedSecond ?
                            <div className="flex">
                                <div>
                                    {`<iframe height="100%" width="100%" src="https://embed.covalenthq.com/${selectedSecond.id}/${myCipher(JSON.stringify(embedParams))}"/>`}
                                </div>
                                <div className="flex items-center justify-center h-full pl-6 ">
                                    <Icon className={"mb-6 cursor-pointer"} icon="duplicate" onClick={() => {
                                        navigator.clipboard.writeText(`<iframe ${iframeSize} src="https://embed.covalenthq.com/${selectedSecond.id}/${myCipher(JSON.stringify(embedParams))}"/>`);
                                        props.showMessage?.({
                                            message: S.CLIPBOARD_COPY_SUCCESS,
                                            intent: Intent.SUCCESS,
                                            icon: "tick-circle"
                                        });
                                    }}/>
                                </div>
                            </div>
                            :
                            <div className="bp4-text-muted">Please select the options above for an embed link</div>
                        }
                    </div>
                </div>


                {/* {selectedSecond &&
                    <div className="flex">
                        <div className="flex-col w-5/6">
                            <H4 className="">Embed preview</H4>
                            <div className={`flex overflow-hidden  border ${s.BORDER_SECONDARY}  rounded-sm ${shareOption !== "Card" && ""} h-[calc(100vh-550px)] min-h-[30rem]`}>
                                {shareOption === "Card" ?
                                    <iframe height="100%" width="100%" key={selectedSecond.id} src={`https://embed.covalenthq.com/${selectedSecond.id}/${filters ? "1" : "2"}`} />
                                    :
                                    <iframe height="100%" width="100%" key={selectedSecond.id} src={`https://embed.covalenthq.com/${selectedSecond.id}/${filters ? "1" : "2"}`} />}
                            </div>
                        </div>
                        <div className="flex-col w-[20rem] ml-6">
                            <H4 className="">Embed options</H4>
                            <div className={`${s.BG_COLOR_SECONDARY} border ${s.BORDER_SECONDARY} rounded-sm flex-col py-6 pl-6`}>
                                <Checkbox checked={filters} onClick={() => {
                                    handleToggleFilter();
                                }}> Toggle filter bar </Checkbox>
                                <Checkbox checked={true}> Pre-select filters </Checkbox>
                            </div>
                            <div className={`flex justify-between mt-2 border relative p-4 rounded-sm ${s.BORDER_SECONDARY}  ${s.BG_COLOR_SECONDARY} break-all`}>
                                <div className="flex items-center justify-center  select-all">
                                    {`<iframe height="100%" width="100%" src="https://embed.covalenthq.com/${selectedSecond.id}/${props.darkMode ? 1 : 2}"/>`}
                                </div>
                                <div className="flex items-center justify-center h-full pl-6 ">
                                    <Icon className={"mb-6 cursor-pointer"} icon="duplicate" onClick={() => {
                                        navigator.clipboard.writeText(`<iframe ${iframeSize} src="https://embed.covalenthq.com/${selectedSecond.id}/${filters ? "1" : "2"}"/>`);
                                        props.showMessage?.({
                                            message: S.CLIPBOARD_COPY_SUCCESS,
                                            intent: Intent.SUCCESS,
                                            icon: "tick-circle"
                                        });
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                } */}

            </div>
        </Dialog>
    );
}

export default ShareModal;
