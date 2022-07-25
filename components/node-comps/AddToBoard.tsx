import React, { useState, useEffect } from "react";
import * as C from "../../helpers/colors";
import { Select, ItemListRenderer, ItemRenderer, ItemPredicate } from "@blueprintjs/select";
import { api, Board, ChartInDB, Page } from "../../helpers/api";
import { Button, Icon, Intent, Menu, MenuItem } from "@blueprintjs/core";
import S from "../../helpers/strings";
import { Option, Some, None } from "../../helpers/option";

interface SaveModalProps {
    darkMode: boolean;
    active: boolean;
    handleClose: any;
    chart: any;
    showMessage: Function;
    handleSave: Function;
    groupId: Option<string>;
    token: string;
    setCharts: Function;
    maybeCharts: any;
}

// export interface IPages {
//     created_at: any;
//     created_by: string;
//     description: string;
//     id: string;
//     sort_order: number;
//     subtitle: string;
//     display_name: string;
//     updated_at: any;
// }

export interface IBoards {
    created_at: any;
    created_by: string;
    description: string;
    id: string;
    sort_order: number;
    subtitle: string;
    display_name: string;
    updated_at: any;
}

const SaveModal = (props: SaveModalProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [pages, setPages] = useState<Page[]>([]);
    const [boards, setBoards] = useState<Board[]>([]);
    const [pageSelect, setPageSelect] = useState<Page>();
    const [boardSelect, setBoardSelect] = useState<IBoards>();

    useEffect(() => {
        api.pagesForUser(props.token).then(async (resp) => {
            const pages = props.groupId.match({
                Some: (group_id) => {
                    return resp.data.items.filter((x) => x.group.id === group_id);
                },
                None: () => []
            });
            setPages(pages);
        });
    }, [props.groupId]);

    useEffect(() => {
        if (pageSelect) {
            if (pageSelect.slug) {
                api.boardsForUserBySlug(props.token, pageSelect.group.slug, pageSelect.slug).then(async (resp) => {
                    props.maybeCharts.match({
                        None: () => null,
                        Some: (charts: ChartInDB[]) => {
                            for (const i of charts) {
                                if (i.id === props.chart.id) {
                                    resp.data.items = resp.data.items.filter((val) => !i.in_boards.includes(val.id));
                                }
                            }

                        }
                    });
                    setBoards([...resp.data.items.sort((a, b) => a.created_at - b.created_at).reverse()]);

                });
            } else {
                api.boardsForUserById(props.token, pageSelect.id).then(async (resp) => {
                    props.maybeCharts.match({
                        None: () => null,
                        Some: (charts: ChartInDB[]) => {
                            for (const i of charts) {
                                if (i.id === props.chart.id) {
                                    resp.data.items = resp.data.items.filter((val) => !i.in_boards.includes(val.id));
                                }
                            }

                        }
                    });
                    setBoards([...resp.data.items.sort((a, b) => a.created_at - b.created_at).reverse()]);
                });
            }

        }
    }, [pageSelect]);


    const handleConfirm = async () => {
        await props.handleSave();
        api.createCardForUser(props.token, boardSelect?.id, props.chart.display_name, props.chart.id).then(() => {
            props.showMessage({
                message: S.CARD_CREATE_SUCCESS,
                intent: Intent.SUCCESS,
                icon: "tick-circle"
            });
        });
        props.maybeCharts.match({
            None: () => null,
            Some: (charts: ChartInDB[]) => {
                for (const i of charts) {
                    if (i.id === props.chart.id) {
                        i.in_pages = [...new Set([...i.in_pages, pageSelect.id])];
                        i.in_boards = [...i.in_boards, boardSelect.id];
                    }
                }
                props.setCharts(new Some(charts));
            }
        });
        props.handleClose();
        setBoardSelect(undefined);
        setPageSelect(undefined);
    };

    const renderItem: ItemRenderer<Page> = (item, { handleClick, modifiers, query }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                label={item.display_name}
                key={item.id}
                onClick={handleClick}
                text={item.display_name && item.display_name}
            />
        );
    };

    const filterItem: ItemPredicate<Page> = (query, item) => {

        return (
            `${item.display_name.toLowerCase()}}`.indexOf(
                query.toLowerCase()
            ) >= 0
        );

    };


    function renderCreateItem(query: string, active: boolean, handleClick: React.MouseEventHandler<HTMLElement>,) {
        return (
            <MenuItem
                icon="add"
                text={`Create "${query}"`}
                selected={active}
                onClick={handleClick}
                shouldDismissPopover={false}
            />
        );
    }

    // function createNewPage(title: string): IPages {
    //     api.createPageForUser(title, []).then((resp)=>{
    //         return resp.data.item;
    //     });
    // }

    // function createNewBoard(title: string): IBoards {
    //     api.createBoardForUser(pageSelect?.id, title, []).then((resp)=>{
    //         return resp.data.item;
    //     });
    // }

    return (
        <div className="flex flex-wrap items-center">
            <div className="flex items-center">
                <Icon icon={"chevron-right"} className="mx-2 items-center" />
                <Select
                    items={pages}
                    itemRenderer={renderItem}
                    itemPredicate={filterItem}
                    createNewItemRenderer={renderCreateItem}
                    // createNewItemFromQuery={(title)=> {return {title}}}
                    noResults={<>No results</>}
                    onItemSelect={(val) => {
                        setPageSelect(val);
                    }}
                >
                    <Button>{pageSelect ? pageSelect.display_name : "Select a page"}</Button>
                </Select>
            </div>

            <div className={"flex items-center"}>
                <Icon icon={"chevron-right"} className="mx-2 items-center" />
                <Select
                    items={boards}
                    disabled={!pageSelect}
                    itemRenderer={renderItem}
                    itemPredicate={filterItem}
                    createNewItemRenderer={renderCreateItem}
                    noResults={<>No results</>}
                    onItemSelect={(val) => {
                        setBoardSelect(val);
                    }}>
                    <Button disabled={!pageSelect}>{boardSelect ? boardSelect.display_name : "Select a board"}</Button>
                </Select>
            </div>
            <div className={"flex items-center"}>
                <Icon icon={"chevron-right"} className="mx-2 items-center" />
                <Button disabled={!boardSelect} onClick={handleConfirm}>Add chart</Button>
            </div>
        </div>

    );
};

export default SaveModal;
