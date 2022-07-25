import React, { useState, useEffect, FC, useMemo } from "react";
import { useRouter } from 'next/router'
import * as C from "../helpers/colors";
import CardWrapper from "../components/card-comps/CardWrapper";
import { BoardDetailView } from "../components/BoardDetailView";
import { api, Board, Card } from "../helpers/api";
import { None, Some, Option } from "../helpers/option";
import UserPageView from "../views/UserPageView";
import { Alignment, Navbar, NavbarDivider, Spinner } from "@blueprintjs/core";
import {renderChainSelect, renderDataAggSelect, renderChronoSelect} from "../components/filters";
import { incrementWide, incrementWideBlack } from "../svgs";
import { Helmet } from "react-helmet";
import {decipher} from "../helpers/crypt";
import Head from 'next/head'

interface ShareViewProps {
    darkMode: boolean;
    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    groupId: Option<string>;
    showMessage: Function;
    token: Option<string>;
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
}

interface ShareParamsProps {
    id: string;
    filterBar: string;
}

enum SubNavState {
    HIDE, VISIBLE_CHAIN_SELECTED, VISIBLE_DATE_SELECTOR, VISIBLE_DISABLED
}

const ShareView = ({data, displayName}, props:ShareViewProps) => {


    const router = useRouter()
    const { id, embed } = router.query
    const myDecipher = decipher("covalent-embed");
    // const decrypt = myDecipher(embed);
    const embedSettings = {
      filter: false,
      chains: [],
      agg: props.currentDateAgg,
      range: props.currentDateRange
  };

    // let embedSettings;

    // try {
    //     embedSettings = JSON.parse(decrypt);
    // } catch (error) {
    //     embedSettings = {
    //         filter: true,
    //         chains: props.currentChainNames,
    //         agg: props.currentDateAgg,
    //         range: props.currentDateRange
    //     };
    // }
    const s = C.LIGHT;
    const [maybeData, setData] = useState(data ? new Some(data) : None);
    const [currentChainNames, setCurrentChainNames] = useState<string[]>(embedSettings.chains.length > 0 && !embedSettings.filter ? embedSettings.chains : []);
    const [currentDateRange, setCurrentDateRange] = useState(embedSettings.range && !embedSettings.filter ? embedSettings.range : "this_month");
    const [currentDateAgg, setCurrentDateAgg] = useState(embedSettings.agg && !embedSettings.filter ? embedSettings.agg : "daily");

    const selectorNav = SubNavState.VISIBLE_DATE_SELECTOR;

    const RenderFrame = (() => {
        switch (id?.split("_")[0]) {
            case "card":
                return maybeData.match({
                    None: () => <div className="h-screen w-screen flex items-center justify-center">
                        <Spinner/>
                    </div>,
                    Some: (card) => {
                        return (
                            <div className={" relative " + s.BORDER}>
                                <CardWrapper
                                    chains={[]}
                                    shareId={card.id}
                                    height={"h-[calc(100vh-107px)]"}
                                    darkMode={false}
                                    data={card}
                                    id={card.id}
                                    focusMode={true}
                                    currentDateAgg={currentDateAgg}
                                    currentDateRange={currentDateRange}
                                    currentChainNames={currentChainNames}
                                    boardDisplayName=""
                                    pageDisplayName=""
                                    setUseChainFilter={props.setUseChainFilter}
                                    setUseDateRangeFilter={props.setUseDateRangeFilter}
                                    setUseDateAggFilter={props.setUseDateAggFilter}
                                    useChainFilter={props.useChainFilter}
                                    useDateRangeFilter={props.useDateRangeFilter}
                                    useDateAggFilter={props.useDateAggFilter} expanded={false}
                                    setRefreshPageCharts={() => {
                                        return;
                                    }}
                                    handleFocus={() => {
                                        return;
                                    }}
                                    refreshPageCharts={false}
                                    groupId={None}
                                />
                            </div>
                        );
                    }
                });
            case "board":
                return maybeData.match({
                    None: () => <div className="h-screen w-screen flex items-center justify-center">
                        <Spinner/>
                    </div>,
                    Some: (board) => {
                        console.log(board)
                        return (
                            <div className={" pr-2 pl-3 relative "}>
                                <BoardDetailView
                                    groupId={None}
                                    chains={[]}
                                    expanded={false}
                                    setRefreshPageCharts={() => {
                                        return;
                                    }}
                                    refreshPageCharts={false}
                                    shareId={board.id}
                                    board={board}
                                    editMode={false}
                                    darkMode={false}
                                    currentDateAgg={currentDateAgg}
                                    currentDateRange={currentDateRange}
                                    currentChainNames={currentChainNames}
                                    setUseChainFilter={props.setUseChainFilter}
                                    setUseDateRangeFilter={props.setUseDateRangeFilter}
                                    setUseDateAggFilter={props.setUseDateAggFilter}
                                    useChainFilter={props.useChainFilter}
                                    useDateRangeFilter={props.useDateRangeFilter}
                                    useDateAggFilter={props.useDateAggFilter}
                                    handleFocus={() => {
                                        return;
                                    }}
                                    pageDisplayName=""
                                />
                            </div>
                        );

                    }
                });
            case "page":
                return maybeData.match({
                    None: () => <div className=" w-screen h-screen flex items-center justify-center">
                        <Spinner/>
                    </div>,
                    Some: (page) => {

                        return (
                            <div className={"h-[calc(100vh-50px)]"}>
                                <UserPageView
                                    chains={[]}
                                    token={props.token.match({
                                        None: () => "",
                                        Some: (token) => token
                                    })}
                                    darkMode={false}
                                    currentChainNames={currentChainNames}
                                    editMode={false}
                                    deleteConfirm={false}
                                    currentDateAgg={currentDateAgg}
                                    currentDateRange={currentDateRange}
                                    groupId={None}
                                    showMessage={props.showMessage}
                                    shareId={page.id}
                                    setUseChainFilter={props.setUseChainFilter}
                                    setUseDateRangeFilter={props.setUseDateRangeFilter}
                                    setUseDateAggFilter={props.setUseDateAggFilter}
                                    useChainFilter={props.useChainFilter}
                                    useDateRangeFilter={props.useDateRangeFilter}
                                    useDateAggFilter={props.useDateAggFilter}
                                />
                            </div>
                        );

                    }
                });
            default:
                return <div className="text-black">Nothing to embed.</div>;
        }
    })();

    const subNav = <div>{renderChainSelect(currentChainNames, setCurrentChainNames)}    {renderDataAggSelect(currentDateAgg, selectorNav, setCurrentDateAgg)} {renderChronoSelect(currentDateRange,selectorNav, setCurrentDateRange)}</div>;

    return (
        <div className={s.BG_COLOR_SECONDARY}>
            <Head>
                <meta property="og:title" content="Embed Covalent"/>
                {displayName &&
                    <meta property="og:image" content={`https://covalent-og-image.vercel.app/${displayName}.png?md=1&subtitle=embed`} key={displayName}/>
                }
            </Head>

            <Navbar className="border-none">
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>
                        {incrementWideBlack}
                    </Navbar.Heading>
                </Navbar.Group>
                {embedSettings.filter &&
                    <Navbar.Group align={Alignment.RIGHT}>
                        {subNav} &nbsp;
                    </Navbar.Group>
                }

            </Navbar>

            {RenderFrame}
        </div>
    );
};

export default ShareView;

export async function getServerSideProps({query}) {
    let data
    let displayName

    const handleCardData = async () => {
        await api.singleCardForUser(query.id).then((resp) => {
            data = resp.data.item
            displayName = resp.data.item.chart.display_name;
        });
    };

    const handleBoardData = async() => {
        await api.singleBoardForUser(query.id).then((resp) => {
            data = resp.data
            displayName = resp.data.display_name
        });
    };

    const handlePageData = async () => {
        await api.pageDetailForUserById(query.id).then((resp) => {
            data = resp.data.item
            displayName = resp.data.item.display_name
        });
    };

        switch (query.id?.split("_")[0]) {
            case "card":
                await handleCardData();
                break;
            case "board":
                await handleBoardData();
                break;
            case "page":
                await handlePageData();
                break;
            default:
                break;
        }


  return {
    props: {
        data,
        displayName
    },
  }
}