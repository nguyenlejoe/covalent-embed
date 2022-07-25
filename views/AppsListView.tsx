import { Button, Checkbox, H2, H3, Icon, InputGroup, Intent, Menu, MenuItem, NonIdealState, Tag } from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import { api, Page, Response, User, App } from "../helpers/api";
import { TABLE_FILLER } from "../helpers/filler";
import { None, Some, Option } from "../helpers/option";
import { rbac } from "../helpers/rbac";
import { smartSearch } from "../helpers/smartSearch";
import S from "../helpers/strings";
import { format, formatDistance, parseISO, formatRelative, subDays } from "date-fns";
import { renderUser, renderUserForApps } from "../helpers/formats";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import * as C from "../helpers/colors";
import { TimestampView } from "../../components/TimestampView";

interface AppsListViewProps {
    darkMode: boolean;
    showMessage: Function;
    setNavBarDropDown: Function;
    maybeTeamList: Option<User[]>;
    groupId: Option<string>;
    token: string;
}

export default function AppsListView(props: AppsListViewProps) {

    const { darkMode, showMessage, setNavBarDropDown, maybeTeamList, groupId } = props;

    const s = darkMode ? C.DARK : C.LIGHT;

    const [maybeApps, setApps] = useState<Option<App[]>>(None);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
    const [searchText, setSearchText] = useState("");
    const [deleteState, setDeleteState] = useState({});
    const [busy, setBusy] = useState(false);
    const [sortedData, setSorted] = useState<void>();

    useEffect(() => setSorted(sortData()), [sortConfig]);

    const sortData = () => {
        maybeApps.match({
            None: () => null,
            Some: (apps) => {
                apps.sort((a: any, b: any) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    }
                    return 0;
                });
                setApps(new Some(apps));
            }
        });
    };


    const listApps = () => {
        setBusy(true);
        setApps(None);

        api.getAppsForGroup(props.token).then((resp) => {
            setApps(new Some(resp.data.items));
            setBusy(false);
        });

    };

    const requestedSort = (key: string) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };


    const renderTable = (apps: App[]) => {
        if (apps.length === 0) {
            return [<tr><td colSpan={5}><NonIdealState
                icon={"application"}
                title="No Apps"
                description={S.APP_DESCRIPTION}
            /></td></tr>];
        }

        const r = apps.filter((x) => {
            if (searchText.length === 0) {
                return true;
            }

            return smartSearch(searchText, x.display_name, x.description);
        }).map((p, i) => {

            const menu = <Menu>
                {/* <MenuItem icon="duplicate" text="Duplicate" />
                <MenuItem icon="download" text="Download" /> */}
                <MenuItem icon="trash" text="Delete" disabled={rbac.can("editor", "delete:page", () => {
                    return p.group.id !== props.groupId.get();
                })} intent={Intent.DANGER} onClick={() => {
                    const copy = { ...deleteState };
                    copy[p.id] = true;
                    setDeleteState(copy);
                }} />
            </Menu>;

            const href = (p.slug && p.group && p.group.slug) ? `/platform/#/increment/apps/${p.id}/` : `/platform/#/increment/apps/${p.id}/`;

            return <tr key={i}>
                <td className="w-96"> { }  <Icon icon="application" />  <a href={href}>{p.display_name}</a> <Tag minimal={true} >defi</Tag><Tag minimal={true} >nft</Tag>
                    <br />
                    <span className="bp4-text-muted text-xs">{p.description}</span>
                </td>
                <td className="w-30"><span className="bp4-text-muted"><TimestampView date={p.created_at} /> </span></td>
                <td className="w-24"><span className="bp4-text-muted">{renderUser(p.created_by)}</span></td>
                <td className="w-30"><span className="bp4-text-muted"><TimestampView date={p.updated_at} /> </span></td>
                <td className="w-16"> <div className="flex justify-between">
                    <Popover2
                        content={menu}
                        interactionKind={Popover2InteractionKind.CLICK}
                        placement="bottom-end">
                        <Button minimal={true} icon="more" disabled={busy} />
                    </Popover2>
                    {deleteState[p.id] ? <span><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                        setBusy(true);
                        api.deleteAppForUser(props.token, p.id)
                            .then((ev) => {
                                showMessage({
                                    message: S.APP_DELETE_SUCCESS,
                                    intent: Intent.SUCCESS,
                                    icon: "tick-circle"
                                });
                                listApps();
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

    const my_rows = maybeApps.match({
        None: () => {
            return TABLE_FILLER;
        },
        Some: (rapps: App[]) => {

            if (!props.groupId.isDefined) {
                return TABLE_FILLER;
            }
            const apps = rapps.filter((x) => x.group.id === props.groupId.get());

            return renderTable(apps);
        }
    });


    useEffect(() => {
        api.getAppsForGroup(props.token).then((arg) => {
            setApps(new Some(arg.data.items));
        });
    }, []);


    return (
        <div className="">
            <div className="grid grid-cols-4 gap-16">
                <div className="col-span-3">
                    <div className="mb-4 my-4">
                        <H2>Your apps  </H2>

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
                            {/* <div className="mt-4" >
                                    {createPage}
                                </div> */}
                        </div>

                        <hr className={"border my-4 " + s.BORDER_SECONDARY} />

                        <div className={s.TEXT_COLOR}>
                            <div className="ml-2" >
                                <Checkbox label="defi" />
                                <Checkbox label="nft" />
                                <Checkbox label="gdp" />
                                <Checkbox label="bridge" />
                                <Checkbox label="gamefi" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
