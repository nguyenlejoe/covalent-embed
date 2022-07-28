import React, { useState, useEffect, BlockquoteHTMLAttributes } from "react";
import { Option, Some, None } from "../helpers/option";
import { useRouter } from 'next/router'
import { Helmet } from "react-helmet";

import * as C from "../helpers/colors";
import * as F from "../helpers/formats";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { api, Board, Card, Page, Chain } from "../helpers/api";
import { buildUserCard } from "../hooks/buildUserCard";
import { parseISO, format } from "date-fns";
import S from "../helpers/strings";
import { Button, ButtonGroup, H1, H2, H3, EditableText, PopoverPosition, Intent, H4, H6, Switch, Icon, Spinner, SpinnerSize, MenuDivider, MenuItem, Menu, Tag } from "@blueprintjs/core";
import { FILLER } from "../helpers/filler";
import { Popover2 } from "@blueprintjs/popover2";
import ShareModal from "../components/ShareModal";
import { rbac } from "../helpers/rbac";

interface UserPageViewProps {
    darkMode: boolean;
    currentChainNames: string[];
    showMessage: Function;
    editMode: boolean;
    deleteConfirm?: boolean;
    setDeleteConfirm?: Function;
    setEditMode?: Function;
    setNavBarDropDown?: Function;
    currentDateAgg: string;
    currentDateRange: string;
    groupId: Option<string>;
    shareId?: string;
    token: string;
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    chains: Chain[];

}

interface UserPageViewParams {
    pageId: string;
    groupSlug: string;
    pageSlug: string;
}

export default function UserPageView(props: UserPageViewProps) {
    const router = useRouter()
    const { pageId, groupSlug, pageSlug } = router.query
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [maybePage, setPage] = useState<Option<Page>>(None);
    const [maybeBoards, setBoards] = useState(None);
    const [fallBackName, setFallBackName] = useState("");
    const [embedState, setEmbed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [modalState, setModal] = useState(false);
    const [refreshPageCharts, setRefreshPageCharts] = useState(false);
    const [expandedBoard, setExpandedBoard] = useState(0);

    const renderNavbarDropDown = (display_name: string) => {
        const pageMenu = <Menu  >
            <MenuItem icon="plus" text="Add new board" onClick={handleAddBoard} disabled={rbac.can("editor", "update:page", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybePage.match({
                            Some: (page) => page.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} />
            <MenuDivider />
            <MenuItem icon="edit" text="Edit page" onClick={() => {
                props.setEditMode?.(true);
            }} disabled={rbac.can("editor", "update:page", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybePage.match({
                            Some: (page) => page.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} />
            <MenuItem icon="changes" text="Arrange cards" disabled={true} />
            <MenuItem icon="duplicate" text="Duplicate" disabled={true} />
            <MenuItem icon="trash" text="Delete" intent={Intent.DANGER} onClick={() => {
                props.setDeleteConfirm?.(true);
            }} disabled={rbac.can("editor", "delete:page", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybePage.match({
                            Some: (page) => page.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} />
            <MenuDivider />
            <MenuItem icon="refresh" text="Refresh cards" onClick={() => {
                listBoards();
            }} />
            <MenuDivider />
            <MenuItem icon="code" text="Embed"  disabled={false} onClick={() => {
                setModal(true);
            }} />

        </Menu>;

        const renderMainDropDown = (
            !props.deleteConfirm ?
                <Popover2 content={pageMenu} placement="bottom-start">
                    <Button className="py-0" disabled={busy} rightIcon="caret-down" text={display_name} />
                </Popover2>
                : <>
                    <Button className="mr-1" intent="danger" onClick={() => {
                        handleDeletePage();
                    }}>DELETE</Button>
                    <Button className="mr-4" onClick={() => {
                        props.setDeleteConfirm?.(false);
                    }}>CANCEL</Button></>);

        return renderMainDropDown;
    };

    useEffect(() => {
        maybePage.match({
            None: () => null,
            Some: (page) => {
                props.setNavBarDropDown?.(new Some(renderNavbarDropDown("Configure Page")));
            }
        });

    }, [maybePage, props.deleteConfirm]);

    const listBoards = () => {
        setBusy(true);
        setRefreshPageCharts(true);

        if (groupSlug && pageSlug) {
            api.boardsForUserBySlug(props.token , groupSlug, pageSlug).then((resp) => {
                setBoards(new Some(resp.data.items.sort((a, b) => parseISO(a.created_at).valueOf() - parseISO(b.created_at).valueOf())));
                setBusy(false);
            });

        } else {
            const id = pageId ? pageId : props.shareId;
            if (id) {
                api.boardsForUserById(props.token, id).then((resp) => {
                    setBoards(new Some(resp.data.items.sort((a, b) => parseISO(a.created_at).valueOf() - parseISO(b.created_at).valueOf())));
                    setBusy(false);
                });
            }
        }
        setBusy(false);

    };

    const handleSaveBoard = (board: Board) => {
        api.saveBoard(props.token, board.id, board.display_name, board.description).then((ev) => {
            props.showMessage?.({
                message: S.BOARD_SAVE_SUCCESS,
                intent: Intent.SUCCESS,
                icon: "tick-circle"
            });
            // listBoards();
        });
    };

    const handleAddBoard = async () => {
        if (maybePage.isDefined) {

            const pageId = maybePage.get().id;

            api.createBoardForUser(props.token, pageId, "Untitled Board", None).then((resp) => {
                props.showMessage?.({
                    message: S.BOARD_CREATE_SUCCESS,
                    intent: Intent.SUCCESS,
                    icon: "tick-circle"
                });

                listBoards();
            });
        }
    };

    const handleDeleteBoard = (board: Board) => {
        api.deleteBoardForUser(props.token, board.id).then((resp) => {
            setExpandedBoard(0);
            listBoards();
        });
    };

    const handleDeleteCard = (card: Card) => {
        api.deleteCardForUser(props.token , card.id).then((resp) => {
            listBoards();
        });
    };

    const handleDeletePage = () => {
        if (maybePage.isDefined) {

            const pageId = maybePage.get().id;


            api.deletePageForUser(props.token, pageId).then(() => {
                props.showMessage?.({
                    message: S.PAGE_DELETE_SUCCESS,
                    intent: Intent.SUCCESS,
                    icon: "tick-circle"
                });

                props.setDeleteConfirm?.(false);
                window.location.hash = "/increment";
            });
        }
    };


    useEffect(() => {
        if (groupSlug && pageSlug) {
            api.pageDetailForUserBySlug(props.token, groupSlug, pageSlug).then((resp) => {
                props.setNavBarDropDown?.(new Some(renderNavbarDropDown(resp.data.item.display_name)));
                setPage(new Some(resp.data.item));
                listBoards();
            });

        } else {
            const id = pageId ? pageId : props.shareId;
            if (id) {
                api.pageDetailForUserById(id).then((resp) => {
                    props.setNavBarDropDown?.(new Some(renderNavbarDropDown(resp.data.item.display_name)));
                    setPage(new Some(resp.data.item));
                    listBoards();
                });
            }
        }

    }, [pageId, groupSlug, pageSlug]);

    useEffect(() => {
        props.setEditMode?.(false);
    },[]);

    const handleEmbed = () => {
        setEmbed((active) => !active);
    };

    const page_title = `${maybePage.match({
        None: () => "Page",
        Some: (page) => page.display_name + " | Page"
    })} | Increment`;


    return (
        <div className="relative">
            <Helmet>
                <title>{page_title}</title>
            </Helmet>
            <ShareModal
                isOpen={modalState}
                setOpen={setModal}
                maybeBoards={maybeBoards}
                maybePage={maybePage}
                darkMode={props.darkMode}
                showMessage={props.showMessage}
                useChainFilter={props.useChainFilter}
                useDateRangeFilter={props.useDateRangeFilter}
                useDateAggFilter={props.useDateAggFilter}
                currentChainNames={props.currentChainNames}
                currentDateRange={props.currentDateRange}
                currentDateAgg={props.currentDateAgg}
            />
            <div className={"h-40 flex place-items-center justify-center " + s.BG_COLOR}>
                {
                    maybePage.match({
                        None: () => <div className="mx-auto text-6xl font-extralight select-none">{FILLER}</div>,
                        Some: (page: Page) => {

                            return <div className="flex flex-col items-center">
                                <div className="">
                                    {props.shareId ?
                                        <div className="text-5xl font-extralight mb-2">{page.display_name}</div>
                                        :
                                        <EditableText
                                            placeholder="Edit title..."
                                            value={page.display_name}
                                            disabled={!props.editMode}
                                            className={"text-5xl font-extralight " + s.TEXT_COLOR}
                                            onEdit={(value) => {
                                                if (value) {
                                                    setFallBackName(value);
                                                }
                                            }}
                                            onChange={(value) => {
                                                const page: Page = maybePage.get();
                                                page.display_name = value;
                                                setFallBackName(value);
                                            }}
                                            onConfirm={() => {
                                                const page: Page = maybePage.get();

                                                api.savePageById(props.token, page.id, page.display_name, page.description, page.tags).then((ev) => {
                                                    props.showMessage?.({
                                                        message: S.PAGE_TITLE_RENAMED_SUCCESS,
                                                        intent: Intent.SUCCESS,
                                                        icon: "tick-circle"
                                                    });
                                                    const p = ev.data.item;
                                                    setPage(new Some(p));
                                                    window.location.hash = `/increment/pages/${p.group.slug}/${p.slug}/`;
                                                });
                                            }}
                                        />
                                    }
                                    {/* {pageId &&
                                        <Icon className={"ml-2 cursor-pointer absolute -right-12"} color={s.TEXT_COLOR_RGB} icon={"share"} onClick={() => {
                                            handleEmbed();
                                        }} />
                                    } */}
                                    <div>
                                        {page.tags.map((tag, index) => {
                                            return <Tag className="mx-0.5 round-md" key={index} minimal={true} >{"#"+tag}</Tag>;
                                        })}
                                    </div>
                                </div>
                                <div className="mt-1">
                                    {(props.editMode || page.description.trim().length > 0)
                                        ? <EditableText
                                            placeholder="Edit description..."
                                            value={page.description}
                                            disabled={!props.editMode}
                                            className={"text-xl font-extralight " + s.TEXT_COLOR}
                                            onEdit={(value) => {
                                                if (value) {
                                                    setFallBackName(value);
                                                }
                                            }}
                                            onChange={(value) => {
                                                const page: Page = maybePage.get();
                                                page.description = value;
                                                setFallBackName(value);
                                                setPage(new Some(page));
                                            }}
                                            onConfirm={() => {
                                                const page: Page = maybePage.get();

                                                api.savePageById(props.token, page.id, page.display_name, page.description, page.tags).then((ev) => {
                                                    props.showMessage?.({
                                                        message: S.PAGE_DESC_RENAMED_SUCCESS,
                                                        intent: Intent.SUCCESS,
                                                        icon: "tick-circle"
                                                    });
                                                    const p = ev.data.item;
                                                    setPage(new Some(p));
                                                    window.location.hash = `/increment/pages/${p.group.slug}/${p.slug}/`;
                                                });
                                            }}
                                        />
                                        : null}
                                </div>
                                {/* {embedState &&
                                <div className={`flex justify-between mt-2 p-3 border relative ${s.BORDER_SECONDARY}  ${s.BG_COLOR_SECONDARY} break-all`}>
                                    <div className={"flex items-center justify-center select-all " + s.TEXT_COLOR_RGB}>
                                        {`<iframe height="1130" width="1000" src="${window.location.origin}/#/share/${pageId}/${props.darkMode ? 1 : 2}"/>`}
                                    </div>
                                    <div className={"flex items-center justify-center pl-6 "} >
                                        <Icon className={"cursor-pointer"} color={s.TEXT_COLOR_RGB} icon="duplicate" onClick={() => {
                                            navigator.clipboard.writeText(`<iframe height="1130" width="1000" src="${window.location.origin}/#/share/${pageId}/${props.darkMode ? 1 : 2}"/>`);
                                            props.showMessage?.({
                                                message: S.CLIPBOARD_COPY_SUCCESS,
                                                intent: Intent.SUCCESS,
                                                icon: "tick-circle"
                                            });
                                        }}/>
                                    </div>
                                </div>
                                } */}
                            </div>;
                        }
                    })
                }
            </div>
            <Layout
                expandedBoard={expandedBoard}
                setExpandedBoard={setExpandedBoard}
                groupId={props.groupId}
                chains={props.chains}
                maybeBoards={maybeBoards}
                setRefreshPageCharts={setRefreshPageCharts}
                refreshPageCharts={refreshPageCharts}
                showMessage={props.showMessage}
                setBoards={setBoards}
                darkMode={props.darkMode}
                handleSaveBoard={handleSaveBoard}
                handleAddBoard={handleAddBoard}
                handleDeleteBoard={handleDeleteBoard}
                editMode={props.editMode}
                handleDeleteCard={handleDeleteCard}
                pageId={pageId}
                currentDateAgg={props.currentDateAgg}
                currentDateRange={props.currentDateRange}
                currentChainNames={props.currentChainNames}
                setUseChainFilter={props.setUseChainFilter}
                setUseDateRangeFilter={props.setUseDateRangeFilter}
                setUseDateAggFilter={props.setUseDateAggFilter}
                useChainFilter={props.useChainFilter}
                useDateRangeFilter={props.useDateRangeFilter}
                useDateAggFilter={props.useDateAggFilter}
                pageDisplayName={maybePage.match({
                    None: () => "",
                    Some: (page) => page.display_name
                })}
            />
        </div >
    );
}
