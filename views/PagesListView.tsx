import { Button, Checkbox, Classes, H2, H3, Icon, InputGroup, Intent, Menu, MenuItem, NonIdealState, Tag } from "@blueprintjs/core";
import React, { useState, useEffect, useMemo } from "react";
import { api, Page, Response, User } from "../helpers/api";

import * as C from "../helpers/colors";
import S from "../helpers/strings";

import { None, Some, Option } from "../helpers/option";

import { format, formatDistance, parseISO, formatRelative, subDays } from "date-fns";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { FILLER, TABLE_FILLER } from "../helpers/filler";
import { renderUser } from "../helpers/formats";
import { smartSearch } from "../helpers/smartSearch";
import { rbac } from "../helpers/rbac";

import { TimestampView } from "../../components/TimestampView";

interface PagesListViewProps {
    darkMode: boolean;
    showMessage: Function;
    setNavBarDropDown: Function;
    maybeTeamList: Option<User[]>;
    groupId: Option<string>;
    token: string;
}

export default function PagesListView(props: PagesListViewProps) {

    const { darkMode, showMessage, setNavBarDropDown, maybeTeamList, groupId } = props;

    const s = darkMode ? C.DARK : C.LIGHT;

    const [maybePages, setPages] = useState(None);
    const [busy, setBusy] = useState(false);
    const [deleteState, setDeleteState] = useState({});
    const [searchText, setSearchText] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
    const [sortedData, setSorted] = useState<void>();
    const [selectedTagFilterList, setSelectedTagFilterList] = useState<string[]>([]);
    const [tagFrequencyCount, setTagFrequencyCount] = useState({});

    useEffect(() => setSorted(sortData()), [sortConfig]);

    const tagFilterSearch = (selectedTags: string[], content: string[]) => {
        return selectedTagFilterList.every((term) => content.some((d) => d.indexOf(term) >= 0));
    };

    const sortData = () => {
        maybePages.match({
            None: () => null,
            Some: (pages) => {
                pages.sort((a: any, b: any) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    }
                    return 0;
                });
                setPages(new Some(pages));
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

    const createPage = <Button
        onClick={() => {
            setBusy(true);

            api.createPageForUser(props.token, "Untitled Page")
                .then((ev) => {
                    showMessage({
                        message: S.PAGE_CREATE_SUCCESS,
                        intent: Intent.SUCCESS,
                        icon: "tick-circle"
                    });

                    window.location.hash = `/increment/pages/${ev.data.item.group.slug}/${ev.data.item.slug}/`;
                });
        }}
        icon="document"
        disabled={busy} >New page</Button>;


    const listPages = () => {
        setBusy(true);
        setPages(None);

        api.allPages(props.token).then((resp) => {
            setPages(new Some(resp.data.items));
            setBusy(false);
        });

    };

    useEffect(() => {
        maybePages.match({
            None: () => {
                return TABLE_FILLER;
            },
            Some: (rpages: Page[]) => {
                setTagFrequencyCount((prevState) => {
                    prevState = {};
                    rpages.forEach((x) => {
                        x.tags.forEach((el) => {
                            prevState[el] = el in prevState ? prevState[el] = prevState[el] + 1 : 1;
                        });
                    });
                    return prevState;
                });
            }
        });
    }, [maybePages]);

    useEffect(() => {
        setNavBarDropDown(None);
        listPages();

    }, [groupId]);

    const renderTable = (pages: Page[]) => {
        if (pages.length === 0) {
            return [<tr><td colSpan={5}><NonIdealState
                icon={"document"}
                title="No pages"
                description={S.PAGE_DESCRIPTION}
                action={createPage}
            /></td></tr>];
        }
        const r = pages.filter((x) => {
            if (searchText.length === 0 && selectedTagFilterList.length === 0) {
                return true;
            }

            return smartSearch(searchText, x.display_name, x.description) && tagFilterSearch(selectedTagFilterList, x.tags);
        }).map((p, i) => {

            const menu = <Menu>
                {/* <MenuItem icon="duplicate" text="Duplicate" />
                <MenuItem icon="download" text="Download" /> */}
                <MenuItem icon="trash" text="Delete" disabled={rbac.can("editor", "delete:page", () => {
                    return p.group.id !== groupId.get();
                })} intent={Intent.DANGER} onClick={() => {
                    const copy = { ...deleteState };
                    copy[p.id] = true;
                    setDeleteState(copy);
                }} />
                <MenuItem icon="tag" text="Tags" disabled={rbac.can("editor", "tags:page", () => {
                    return p.group.id !== groupId.get();
                })} intent={Intent.PRIMARY}>
                    <MenuItem icon={p.tags.includes("defi") ? "tick" : "blank"} text="defi" onClick={() => {
                        p.tags = p.tags.includes("defi") ? p.tags.filter((value) => {
                            return value !== "defi";
                        }) : [...p.tags, "defi"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }} />
                    <MenuItem icon={p.tags.includes("nft") ? "tick" : "blank"} text="nft" onClick={() => {
                        p.tags = p.tags.includes("nft") ? p.tags.filter((value) => {
                            return value !== "nft";
                        }) : [...p.tags, "nft"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }}/>
                    <MenuItem icon={p.tags.includes("gdp") ? "tick" : "blank"} text="gdp" onClick={() => {
                        p.tags = p.tags.includes("gdp") ? p.tags.filter((value) => {
                            return value !== "gdp";
                        }) : [...p.tags, "gdp"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }}/>
                    <MenuItem icon={p.tags.includes("bridge") ? "tick" : "blank"} text="bridge" onClick={() => {
                        p.tags = p.tags.includes("bridge") ? p.tags.filter((value) => {
                            return value !== "bridge";
                        }) : [...p.tags, "bridge"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }}/>
                    <MenuItem icon={p.tags.includes("gamefi") ? "tick" : "blank"} text="gamefi" onClick={() => {
                        p.tags = p.tags.includes("gamefi") ? p.tags.filter((value) => {
                            return value !== "gamefi";
                        }) : [...p.tags, "gamefi"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }}/>
                    <MenuItem icon={p.tags.includes("dex") ? "tick" : "blank"} text="dex" onClick={() => {
                        p.tags = p.tags.includes("dex") ? p.tags.filter((value) => {
                            return value !== "dex";
                        }) : [...p.tags, "dex"];
                        api.savePageTags(props.token, p.display_name, p.id, p.tags)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_TAGS_UPDATED,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });
                    }}/>
                </MenuItem>
            </Menu>;

            const href = (p.slug && p.group && p.group.slug) ? `/platform/#/increment/pages/${p.group.slug}/${p.slug}/` : `/platform/#/increment/pages/${p.id}/`;

            return <tr key={i}>
                <td className="w-96"> { }  <Icon icon="book" />  <a href={href}>{p.display_name}</a>
                    {p.tags.map((tag, index) => {
                        return <Tag className="mx-0.5 round-md" key={index} minimal={true} >{"#"+tag}</Tag>;
                    })}
                    <br />
                    <span className="bp4-text-muted text-xs">{p.description}</span>
                </td>
                <td className="w-30"><span className="bp4-text-muted"><TimestampView date={p.created_at} /> </span></td>
                <td className="w-24"><span className="bp4-text-muted">{renderUser(p.created_by)}</span></td>
                <td className="w-30"><span className="bp4-text-muted"> <TimestampView date={p.updated_at} /> </span></td>
                <td className="w-16"> <div className="flex justify-between">
                    <Popover2
                        content={menu}
                        interactionKind={Popover2InteractionKind.CLICK}
                        placement="bottom-end">
                        <Button minimal={true} icon="more" disabled={busy} />
                    </Popover2>
                    {deleteState[p.id] ? <span><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                        setBusy(true);
                        api.deletePageForUser(props.token, p.id)
                            .then((ev) => {
                                showMessage({
                                    message: S.PAGE_DELETE_SUCCESS,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listPages();
                            });

                    }} />   <Button text="CANCEL" onClick={() => {
                        const copy = { ...deleteState };
                        copy[p.id] = false;
                        setDeleteState(copy);
                    }} /> </span> : null}
                </div>
                </td>
            </tr>;
        });

        if (r.length === 0) {
            return [<tr key="no-row"><td colSpan={5}>No data.</td></tr>];
        }

        return r;
    };


    const all_rows = maybePages.match({
        None: () => {
            return TABLE_FILLER;
        },
        Some: (rpages: Page[]) => {
            if (!groupId.isDefined) {
                return TABLE_FILLER;
            }

            const pages = rpages.filter((x) => x.group.id !== groupId.get());

            return renderTable(pages);
        }
    });

    const my_rows = maybePages.match({
        None: () => {
            return TABLE_FILLER;
        },
        Some: (rpages: Page[]) => {

            if (!groupId.isDefined) {
                return TABLE_FILLER;
            }

            const pages = rpages.filter((x) => x.group.id === groupId.get());

            return renderTable(pages);
        }
    });


    return <div className="">
        {/* <div className="mb-2 flex justify-between  my-4">
            <H2>Your pages  <span className="text-sm"> {searchText.length > 0 ? "" : `(${rows.length} found)`}  </span></H2>
        </div> */}

        <div className="grid grid-cols-4 gap-16">
            <div className="col-span-3">

                <div className="mb-4 my-4">
                    <H2>Your pages  </H2>

                    <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border  " + s.BORDER_SECONDARY}>
                        <thead>
                            <tr>
                                <th>Name
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "display_name" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "display_name" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("display_name");
                                        }} />
                                    </div>
                                </th>
                                <th>Created
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "created_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "created_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("created_at");
                                        }} />
                                    </div>
                                </th>
                                <th>By</th>
                                <th>Updated
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


                <div className="mb-2 my-4">
                    <H2>All pages   </H2>

                    <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border " + s.BORDER_SECONDARY}>
                        <thead>
                            <tr>
                                <th>Name
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "display_name" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "display_name" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("display_name");
                                        }} />
                                    </div>
                                </th>
                                <th>Created
                                    <div style={{ float: "right" }} >
                                        <Icon icon={sortConfig.key === "created_at" && sortConfig.direction === "descending" ? "chevron-down" : sortConfig.key === "created_at" && sortConfig.direction === "ascending" ? "chevron-up" : "expand-all"} size={16} style={{ color: s.TEXT_COLOR }} className='icon' onClick={() => {
                                            requestedSort("created_at");
                                        }} />
                                    </div>
                                </th>
                                <th>By</th>
                                <th>Updated
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
                <div className={" border px-4  h-96 " + s.BORDER_SECONDARY}>
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
                        <div className="mt-4" >
                            {createPage}
                        </div>
                    </div>

                    <hr className={"border my-4 " + s.BORDER_SECONDARY} />

                    <div className={s.TEXT_COLOR}>
                        <div className="ml-2" >
                            <div className="grid grid-cols-2">
                                <Checkbox label="defi" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("defi") ? prevState.filter((value) => {
                                            return value !== "defi";
                                        }) : [...prevState, "defi"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["defi"] !== undefined ? tagFrequencyCount["defi"] : 0}</Tag>
                                </div>
                                <Checkbox label="nft" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("nft") ? prevState.filter((value) => {
                                            return value !== "nft";
                                        }) : [...prevState, "nft"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["nft"] !== undefined ? tagFrequencyCount["nft"] : 0}</Tag>
                                </div>
                                <Checkbox label="gdp" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("gdp") ? prevState.filter((value) => {
                                            return value !== "gdp";
                                        }) : [...prevState, "gdp"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["gdp"] !== undefined ? tagFrequencyCount["gdp"] : 0}</Tag>
                                </div>
                                <Checkbox label="bridge" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("bridge") ? prevState.filter((value) => {
                                            return value !== "bridge";
                                        }) : [...prevState, "bridge"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["bridge"] !== undefined ? tagFrequencyCount["bridge"] : 0}</Tag>
                                </div>
                                <Checkbox label="gamefi" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("gamefi") ? prevState.filter((value) => {
                                            return value !== "gamefi";
                                        }) : [...prevState, "gamefi"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["gamefi"] !== undefined ? tagFrequencyCount["gamefi"] : 0}</Tag>
                                </div>
                                <Checkbox label="dex" onClick={() => {
                                    setSelectedTagFilterList((prevState) => {
                                        prevState = prevState.includes("dex") ? prevState.filter((value) => {
                                            return value !== "dex";
                                        }) : [...prevState, "dex"];
                                        return prevState;
                                    });
                                }}/>
                                <div className="col-end-4 text-right">
                                    <Tag className="round-md" minimal={true} >{tagFrequencyCount["dex"] !== undefined ? tagFrequencyCount["dex"] : 0}</Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>;
}
