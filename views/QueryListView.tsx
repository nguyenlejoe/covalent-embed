import { Button, ButtonGroup, Checkbox, Classes, EditableText, H2, H3, Icon, InputGroup, Intent, Menu, MenuItem, NonIdealState, Text } from "@blueprintjs/core";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { api, Query, Response, User } from "../helpers/api";

import * as C from "../helpers/colors";
import S from "../helpers/strings";

import { None, Some, Option } from "../helpers/option";

import { format, formatDistance, parseISO, formatRelative, subDays } from "date-fns";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { FILLER, TABLE_FILLER } from "../helpers/filler";
import { generateAdjective, renderUser } from "../helpers/formats";
import { smartSearch } from "../helpers/smartSearch";

import { arrayToTree, TreeItem } from "performant-array-to-tree";
import { rbac } from "../helpers/rbac";
import { TimestampView } from "../../components/TimestampView";


interface QueryListViewProps {
    darkMode: boolean;
    showMessage: Function;
    setNavBarDropDown: Function;
    maybeTeamList: Option<User[]>;
    groupId: Option<string>;
    token: string;
}

export default function QueryListView(props: QueryListViewProps) {

    const { darkMode, showMessage, setNavBarDropDown, maybeTeamList, groupId } = props;

    const s = darkMode ? C.DARK : C.LIGHT;

    const [maybeQueries, setQueries] = useState<Option<Query[]>>(None);
    const [busy, setBusy] = useState(false);
    const [deleteState, setDeleteState] = useState({});
    const [searchText, setSearchText] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
    const [sortedData, setSorted] = useState<void>();
    const [folderRename, setFolderRename] = useState(None);
    const [queryRename, setQueryRename] = useState(None);
    const folderRef = useRef(null);
    const queryRef = useRef(null);

    useEffect(() => setSorted(sortData()), [sortConfig]);

    const sortData = () => {
        maybeQueries.match({
            None: () => null,
            Some: (queries) => {
                queries.sort((a: any, b: any) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    }
                    return 0;
                });
                setQueries(new Some(queries));
            }
        });
    };

    const requestedSort = (key: string) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const globalMenu = <Menu>
        <MenuItem text="New folder" icon="folder-new" onClick={() => {
            setBusy(true);
            const name = generateAdjective();
            api.createQueryFolderForUser(props.token, `${name} Folder`)
                .then((ev) => {
                    listQueries();
                });
        }} />
    </Menu>;

    const createQueryButton = <ButtonGroup>
        <Button
            onClick={() => {
                setBusy(true);

                const cnt = maybeQueries.match({
                    None: () => 0,
                    Some: (queries: Query[]) => queries.filter((x) => !x.is_folder).length
                });
                const display_name = `${generateAdjective()} Query #${cnt + 1}`;

                api.createQueryForUser(props.token, display_name, "", null)
                    .then((ev) => {
                        showMessage({
                            message: S.QUERY_CREATE_SUCCESS,
                            intent: Intent.SUCCESS,
                            icon: "tick-circle"
                        });

                        const id = ev.data.item.id;
                        window.location.hash = `/increment/sql/${id}/`;
                    });
            }}
            icon="code-block"
            disabled={busy} >New query</Button>
        <Popover2 content={globalMenu} placement="bottom-start">
            <Button icon="caret-down" disabled={busy} />
        </Popover2>
    </ButtonGroup>;


    const listQueries = () => {
        setBusy(true);
        setQueries(None);

        api.queriesForUser(props.token).then((resp) => {
            setQueries(new Some(resp.data.items));
            setBusy(false);
        });
    };


    useEffect(() => {
        setNavBarDropDown(None);
        listQueries();
    }, []);

    const handleFocus = (ref) => {
        ref.current.inputElement.focus();
    };

    useEffect(() => {
        if (folderRef.current) {
            handleFocus(folderRef);
        }
    }, [folderRename]);

    useEffect(() => {
        if (queryRef.current) {
            handleFocus(queryRef);
        }
    }, [queryRename]);


    const renderRow = (p: TreeItem, menu, indent) => {
        return <tr key={p.data.id}>
            <td className="w-96"> {
                p.data.is_folder ? <span className="cursor-pointer select-none" onClick={() => {
                    const queries = maybeQueries.get();
                    for (const i of queries) {
                        if (i.id === p.data.id) {
                            if (i["isOpen"] === false || i["isOpen"] === undefined) {
                                i["isOpen"] = true;
                                setQueries(new Some(queries));
                            } else {
                                i["isOpen"] = false;
                                setQueries(new Some(queries));
                            }
                        }
                    }
                }}>
                    {/* <Icon icon={`${p.data.isOpen ? "folder-open" : "folder-close"}`} /> &nbsp; {p.data.display_name} */}
                    <Icon icon={`${p.data.isOpen ? "folder-open" : "folder-close"}`} /> &nbsp;
                    {folderRename.match({
                        None: () => p.data.display_name,
                        Some: (id: string) => {
                            if (id === p.data.id) {
                                return <EditableText
                                    ref={folderRef}
                                    disabled={busy}
                                    isEditing={true}
                                    alwaysRenderInput={true}
                                    placeholder="Edit Name..."
                                    value={p.data.display_name}
                                    maxLength={45}
                                    onChange={(value) => {
                                        const pipeline = maybeQueries.get();
                                        pipeline.forEach((row: any, i: any) => {
                                            if (row.id === p.data.id) {
                                                pipeline[i].display_name = value;
                                            }
                                        });
                                        setQueries(new Some(pipeline));
                                    }}
                                    onConfirm={() => {
                                        setBusy(true);
                                        api.saveQuery(props.token, p.data.id, p.data.display_name, p.data.description, p.data.parent_id)
                                            .then((resp) => {
                                                setBusy(false);
                                                // setQuery(new Some(resp.data.item));
                                                showMessage({
                                                    message: S.FOLDER_TITLE_RENAMED_SUCCESS,
                                                    intent: Intent.SUCCESS,
                                                    icon: "tick-circle"
                                                });
                                            });
                                        setFolderRename(None);
                                    }}
                                />;
                            } else {
                                return p.data.display_name;
                            }
                        }
                    })}
                </span> :
                    <span>
                        <Icon className={indent === 1 ? "ml-8" : ""} icon="code-block" /> &nbsp;
                        {queryRename.match({
                            None: () => <a href={`/platform/#/increment/sql/${p.data.id}/`}>{p.data.display_name}</a>,
                            Some: (id: string) => {
                                if (id === p.data.id) {
                                    return <EditableText
                                        ref={queryRef}
                                        disabled={busy}
                                        isEditing={true}
                                        alwaysRenderInput={true}
                                        placeholder="Edit Name..."
                                        value={p.data.display_name}
                                        maxLength={45}
                                        onChange={(value) => {
                                            const pipeline = maybeQueries.get();
                                            pipeline.forEach((row: any, i: any) => {
                                                if (row.id === p.data.id) {
                                                    pipeline[i].display_name = value;
                                                }
                                            });
                                            setQueries(new Some(pipeline));
                                        }}
                                        onConfirm={() => {
                                            setBusy(true);
                                            api.saveQuery(props.token, p.data.id, p.data.display_name, p.data.description, p.data.parent_id)
                                                .then((resp) => {
                                                    setBusy(false);
                                                    // setQuery(new Some(resp.data.item));
                                                    showMessage({
                                                        message: S.FOLDER_TITLE_RENAMED_SUCCESS,
                                                        intent: Intent.SUCCESS,
                                                        icon: "tick-circle"
                                                    });
                                                });
                                            setQueryRename(None);
                                        }}
                                    />;
                                } else {
                                    return <a href={`/platform/#/increment/sql/${p.data.id}/`}>{p.data.display_name}</a>;
                                }
                            }
                        })}
                        <br />
                        <span className={"bp4-text-muted " + (indent === 1 ? "ml-8" : "")} > <div className="w-96"> <Text ellipsize={true}>{p.data.description}</Text></div> </span>
                    </span>
            }
            </td>
            <td className="w-30"><span className="bp4-text-muted">  <TimestampView date={p.data.created_at} /> </span> </td>
            <td className="w-24"><span className="bp4-text-muted">{renderUser(p.data.created_by)}</span></td>
            <td className="w-30"><span className="bp4-text-muted"><TimestampView date={p.data.updated_at} /></span> </td>
            <td className="w-16">
                <div className="flex justify-between">

                    {deleteState[p.data.id] ? <span><ButtonGroup> <Button small={true} intent={Intent.DANGER} icon="trash" onClick={() => {

                        setBusy(true);

                        api.deleteQueryForUser(props.token, p.data.id)
                            .then((ev) => {
                                showMessage({
                                    message: S.QUERY_DELETE_SUCCESS,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });

                                listQueries();
                            });

                    }} />   <Button small={true} icon="cross" onClick={() => {
                        const copy = { ...deleteState };
                        copy[p.data.id] = false;
                        setDeleteState(copy);
                    }} /> </ButtonGroup> </span> : <Popover2
                        content={menu}
                        interactionKind={Popover2InteractionKind.CLICK}
                        placement="bottom-end">
                        <Button small={true} minimal={true} icon="more" disabled={busy} />
                    </Popover2>}
                </div>
            </td>
        </tr>;
    };

    const renderMenu = (p: TreeItem) => {
        const subMenu = p.data.is_folder ? null
            : <MenuItem icon="exchange" text="Move to" disabled={rbac.can("editor", "update:query", () => {
                return p.data.group.id !== groupId.get();
            })}>
                {
                    maybeQueries.match({
                        None: () => null,
                        Some: (queries: Query[]) => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    const folders = queries.filter((x) => x.group.id === group_id).filter((x) => x.is_folder);
                                    if (folders.length > 0) {
                                        return queries.filter((x) => x.group.id === group_id).filter((x) => x.is_folder).map((q, i) => {
                                            return <MenuItem icon="folder-close" key={i} text={q.display_name} onClick={() => {
                                                setBusy(true);
                                                api.moveQueryToFolder(props.token, p.data.id, q.id, p.data.display_name, p.data.description)
                                                    .then((ev) => {
                                                        listQueries();
                                                    });
                                            }} />;
                                        });
                                    } else {
                                        return <MenuItem text="No folders found" disabled={true} />;
                                    }
                                },
                                None: () => []
                            });
                        }
                    })
                }
            </MenuItem>;

        const menu = <Menu>
            {/* <MenuItem icon="duplicate" text="Duplicate" />
        <MenuItem icon="download" text="Download" /> */}
            {subMenu}
            <MenuItem icon="trash" text="Delete" intent={Intent.DANGER} disabled={rbac.can("editor", "delete:query", () => {
                return p.data.group.id !== groupId.get();
            })} onClick={() => {
                const copy = { ...deleteState };
                copy[p.data.id] = true;
                setDeleteState(copy);
            }} />
            <MenuItem text="Rename" icon="edit" onClick={() => {
                if (p.data.is_folder) {
                    setFolderRename(new Some(p.data.id));
                } else {
                    setQueryRename(new Some(p.data.id));
                }
            }} />
        </Menu>;

        return menu;
    };


    useEffect(() => {
        if (searchText === "") {
            maybeQueries.match({
                None: () => null,
                Some: (queries) => {
                    for (const i of queries) {
                        i["isOpen"] = false;
                    }
                    setQueries(new Some(queries));
                }
            });
        }

    }, [searchText]);

    useEffect(() => {
        setNavBarDropDown(None);
        listQueries();
    }, []);

    const my_rows = maybeQueries.match({
        None: () => TABLE_FILLER,
        Some: (queries) => {
            if (queries.length === 0) {
                return [<tr key="empty"><td colSpan={5}><NonIdealState
                    icon={"code-block"}
                    title="You do not have any queries."
                    description={S.QUERY_DESCRIPTION}
                    action={createQueryButton}
                /></td></tr>];
            }

            if (groupId.isEmpty) {
                return TABLE_FILLER;
            }

            const r = queries.filter((x) => x.group.id === groupId.get())
                .filter((x) => {
                    if (searchText.length === 0) {
                        return true;
                    }

                    if (x.is_folder === true) {
                        x["isOpen"] = true;
                        return true;
                    }

                    return smartSearch(searchText, x.display_name, x.description);
                });

            if (r.length === 0) {
                return [<tr key="empty"><td colSpan={5}><NonIdealState
                    icon={"code-block"}
                    title="You do not have any queries."
                    description={S.QUERY_DESCRIPTION}
                    action={createQueryButton}
                /></td></tr>];
            }

            const tree = arrayToTree(r, {
                id: "id",
                parentId: "parent_id"
            });

            const treef = tree.filter((t) => t.data.is_folder);
            tree.map((t) => {
                if (!t.data.is_folder) {
                    treef.push(t);
                }
            });

            return treef.map((p, i) => {
                const rows = [renderRow(p, renderMenu(p), 0)];
                if (p.children.length > 0 && p.data["isOpen"] === true) {

                    p.children.forEach((c, ci) => {
                        rows.push(renderRow(c, renderMenu(c), 1));
                    });
                }
                return rows.flatMap((x) => x);
            });
        }
    });

    const all_rows = maybeQueries.match({
        None: () => TABLE_FILLER,
        Some: (pipelines: Query[]) => {

            if (pipelines.length === 0) {
                return [<tr key="empty"><td colSpan={5}><NonIdealState
                    icon={"code-block"}
                    title="You do not have any queries."
                    description={S.QUERY_DESCRIPTION}
                    action={createQueryButton}
                /></td></tr>];
            }

            if (groupId.isEmpty) {
                return TABLE_FILLER;
            }

            const r = pipelines.filter((x) => x.group.id !== groupId.get()).filter((x) => {
                if (searchText.length === 0) {
                    return true;
                }

                if (x.is_folder === true) {
                    x["isOpen"] = true;
                    return true;
                }

                return smartSearch(searchText, x.display_name, x.description);
            });

            if (r.length === 0) {
                return [<tr key="empty"><td colSpan={5}><NonIdealState
                    icon={"code-block"}
                    title="You do not have any queries."
                    description={S.QUERY_DESCRIPTION}
                    action={createQueryButton}
                /></td></tr>];
            }

            const tree = arrayToTree(r, {
                id: "id",
                parentId: "parent_id"
            });

            const treef = tree.filter((t) => t.data.is_folder);
            tree.map((t) => {
                if (!t.data.is_folder) {
                    treef.push(t);
                }
            });

            return treef.map((p, i) => {
                const rows = [renderRow(p, renderMenu(p), 0)];
                if (p.children.length > 0 && p.data["isOpen"] === true) {

                    p.children.forEach((c, ci) => {
                        rows.push(renderRow(c, renderMenu(c), 1));
                    });
                }
                return rows.flatMap((x) => x);
            });
        }
    });

    return <div className="">

        <div className="grid grid-cols-4 gap-16">

            <div className="col-span-3">

                <div className="mb-4 my-4">
                    <H2>Your queries</H2>

                    <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border " + s.BORDER_SECONDARY}>
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("display_name");
                                }} >Name
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "display_name" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "display_name" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon  ' onClick={() => {
                                            requestedSort("display_name");
                                        }} />
                                    </div>
                                </th>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("created_at");
                                }}  >Created
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "created_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "created_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("created_at");
                                        }} />
                                    </div>
                                </th>
                                <th>By</th>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("updated_at");
                                }} >Updated
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "updated_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "updated_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("updated_at");
                                        }} />
                                    </div>
                                </th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {my_rows}
                        </tbody>
                    </table>
                </div>

                <div className="mb-4 my-4">
                    <H2>All queries</H2>

                    <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border " + s.BORDER_SECONDARY}>
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("display_name");
                                }} >Name
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "display_name" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "display_name" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon  ' onClick={() => {
                                            requestedSort("display_name");
                                        }} />
                                    </div>
                                </th>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("created_at");
                                }}  >Created
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "created_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "created_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("created_at");
                                        }} />
                                    </div>
                                </th>
                                <th>By</th>
                                <th className="cursor-pointer" onClick={() => {
                                    requestedSort("updated_at");
                                }} >Updated
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "updated_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "updated_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("updated_at");
                                        }} />
                                    </div>
                                </th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {all_rows}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-6">
                <H3>Filter</H3>

                <div className={" border px-4 h-96  " + s.BORDER_SECONDARY}>
                    <div className="flex flex-wrap">
                        <div className="mr-2 mt-4">
                            <InputGroup
                                className="align-middle"
                                leftIcon="search"
                                type="search"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) => {
                                    const t = (e.target as HTMLInputElement).value;
                                    setSearchText(t);
                                }}
                            />
                        </div>
                        <div className="mt-4">
                            {createQueryButton}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
