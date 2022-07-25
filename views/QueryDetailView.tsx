import React, { useState, useEffect, useReducer, useRef, useCallback } from "react";

import * as C from "../helpers/colors";
import S from "../helpers/strings";

import { Helmet } from "react-helmet";

import { parseISO, format } from "date-fns";

import SplitPane from "react-split-pane";
import {
    Button,
    H2,
    H3,
    H5,
    Intent,
    Menu,
    MenuItem,
    Dialog,
    DialogProps,
    NonIdealState,
    Icon,
    Tab,
    Tabs,
    Tree,
    Spinner,
    SpinnerSize,
    EditableText,
    H4,
    MenuDivider,
    PopoverPosition,
    Classes, AnchorButton, HTMLSelect, InputGroup, Drawer, Callout, Label
} from "@blueprintjs/core";
import { None, Some, Option } from "../helpers/option";
import { api, App, ChartInDB, Endpoint, Node, Query, Group } from "../helpers/api";
import { useParams } from "react-router-dom";
import SqlNode from "../components/SqlNode";
import NodeBrowser from "../components/node-comps/NodeBrowser";

import { Popover2, Popover2InteractionKind, Tooltip2 } from "@blueprintjs/popover2";

import { EditorState } from "../helpers/common";
import { csvDownload } from "../helpers/csvHandler";
import { SchemaBrowser } from "../components/SchemaBrowser";
import { generateAdjective } from "../helpers/formats";
import { AddNode } from "../components/node-comps/AddNode";
import { rbac } from "../helpers/rbac";

enum LeftTabs {
    OUTLINE, SCHEMA
}

interface QueryDetailViewProps {
    darkMode: boolean;
    showMessage: Function;
    setNavBarDropDown: Function;
    currentDateAgg: string;
    currentDateRange: string;
    groupId: Option<string>;
    showSidebar: boolean;
    onToggleSidebar: Function;
    currentChainNames: string[];
    token: string;
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
}

interface QueryDetailViewParams {
    pipeId: string;
}

const initialGroup: Group = {
    slug: "",
    id: "",
    name: "",
};

const initialApp: App = {
    created_at: "",
    description: "",
    id: "",
    display_name: "",
    group: initialGroup,
    slug: "",
    updated_at: "",
    created_by: {
        display_name: "",
        email: "",
        full_name: "",
        id: "",
        group: initialGroup
    }
};

const initialEndpoint: Endpoint = {
    app: initialApp,
    created_at: "",
    created_by: "",
    description: "",
    id: "",
    name: "",
    node_id: "",
    slug: "",
    updated_at: "",
    version_name: "",
};

export default function QueryDetailView(props: QueryDetailViewProps) {
    const { darkMode, showMessage, setNavBarDropDown, currentDateAgg, currentDateRange, showSidebar, onToggleSidebar, currentChainNames, token, setUseChainFilter, setUseDateRangeFilter, setUseDateAggFilter, useChainFilter, useDateRangeFilter, useDateAggFilter } = props;
    const s = darkMode ? C.DARK : C.LIGHT;
    const [renderApps, setRenderApps] = useState(false);
    const [busy, setBusy] = useState(false);
    const [activeTab, setActiveTab] = useState(LeftTabs.SCHEMA);
    const [maybeNodes, setNodes] = useState<Option<Node[]>>(None);
    const [maybeQuery, setQuery] = useState<Option<Query>>(None);
    const [maybeApps, setApps] = useState<Option<App[]>>(None);
    const [endpoint, setEndpoint] = useState<Endpoint>(initialEndpoint);
    const [maybeCharts, setCharts] = useState(new Some([]));
    const [maybeSiblingQueries, setSiblingQueries] = useState<Option<Query[]>>(None);
    const [fallBackName, setFallBackName] = useState("");
    const [selectedNode, setSelectedNode] = useState(None);
    const [deleteState, setDeleteState] = useState({});
    const [pageDeleteState, setPageDeleteState] = useState(false);
    const [rightPane, setRightPane] = useState(None);
    const [maybeData, setMaybeData] = useState(None);


    // const [leftPaneCollapse, setLeftPaneCollapse] = useState(false);
    const [references, setReferences] = useReducer((references, newReference) => {
        return [...references, newReference];
    }, []);
    const titleRef = useRef(null);


    const [ignored, forceUpdate] = useReducer((x: number) => x + 1, 0);

    const { pipeId } = useParams<QueryDetailViewParams>();

    const setRightPaneWrapper = (pane, charts) => {
        setRightPane(pane);
        if (maybeCharts.isDefined) {
            const ch = maybeCharts.get();
            setCharts(new Some(charts));
        }
    };

    const listNodes = () => {
        setBusy(true);
        api.nodesForQuery(token, pipeId)
            .then((resp) => {
                const nodes = new Some(resp.data.items.sort((a, b) => parseISO(a.created_at).valueOf() - parseISO(b.created_at).valueOf()));
                setNodes(nodes);
                if (resp.data.items.length > 0) {
                    endpoint.node_id = resp.data.items[0].id;
                }
                setBusy(false);
            });
    };

    const listSiblingQueries = () => {

        setBusy(true);
        api.queriesForUser(token)
            .then((resp) => {
                setSiblingQueries(new Some(resp.data.items));
            });

    };

    const renderNavbarDropDown = (display_name: string) => {
        const siblingQueries = props.groupId.match({
            Some: (group_id) => {
                return maybeQuery.match({
                    Some: (query) => {
                        if (query.group.id === group_id) {
                            return (maybeSiblingQueries.isDefined && maybeQuery.isDefined) ? maybeSiblingQueries.get().filter((x) => x.group.id === group_id)
                                .filter((x) => (x.is_folder === false
                                    && x.parent_id === maybeQuery.get().parent_id
                                    && x.id !== maybeQuery.get().id))
                                .map((x, i) => {
                                    return <MenuItem onClick={() => {
                                        window.location.hash = `/increment/sql/${x.id}/`;
                                    }} key={`sq-${i}`} icon="code-block" text={x.display_name} />;
                                })
                                : null;
                        } else {
                            return (maybeSiblingQueries.isDefined && maybeQuery.isDefined) ? maybeSiblingQueries.get()
                                .filter((x) => (x.is_folder === false
                                    && x.parent_id === maybeQuery.get().parent_id
                                    && x.id !== maybeQuery.get().id))
                                .map((x, i) => {
                                    return <MenuItem onClick={() => {
                                        window.location.hash = `/increment/sql/${x.id}/`;
                                    }} key={`sq-${i}`} icon="code-block" text={x.display_name} />;
                                })
                                : null;
                        }

                    },
                    None: () => null
                });
            },
            None: () => []
        });

        const siblingQueriesFolder = (() => {
            if (maybeSiblingQueries.isDefined && maybeQuery.isDefined) {
                const sb: Query[] = maybeSiblingQueries.get(),
                    q: Query = maybeQuery.get();

                if (q.parent_id) {

                    for (let i = 0; i < sb.length; i++) {
                        if (sb[i].id === q.parent_id) {
                            return <span>{sb[i].display_name}</span>;
                        }
                    }
                }
            }
            return null;
        })();

        const pageMenu = <Menu >
            <MenuItem icon="edit" text="Rename" disabled={rbac.can("editor", "update:query", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybeQuery.match({
                            Some: (query) => query.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} onClick={() => {
                handleFocus(titleRef);
            }} />
            <MenuItem icon="duplicate" text="Duplicate" disabled={true} />
            <MenuItem icon="trash" text="Delete" intent={Intent.DANGER} disabled={rbac.can("editor", "update:query", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybeQuery.match({
                            Some: (query) => query.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} onClick={() => {
                setPageDeleteState(true);
            }} />
            <MenuDivider />
            <MenuItem icon="plus" text="New Query" onClick={handleCreateQuery} />
            <MenuDivider />
            <MenuItem icon="exchange" text="Move to" disabled={rbac.can("editor", "update:query", () => {
                return props.groupId.match({
                    Some: (group_id) => {
                        return maybeQuery.match({
                            Some: (query) => query.group.id !== group_id,
                            None: () => true
                        });
                    },
                    None: () => true
                });
            })} popoverProps={{
                popoverClassName: "folder-menu"
            }} >
                {maybeSiblingQueries && maybeSiblingQueries.isDefined ?
                    maybeSiblingQueries.match({
                        None: () => null,
                        Some: (queries: Query[]) => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    const folders = queries.filter((x) => x.group.id === group_id).filter((x) => x.is_folder);
                                    if (folders.length > 0) {
                                        return queries.filter((x) => x.group.id === group_id).filter((x) => x.is_folder).map((q, i) => {
                                            return <MenuItem icon="folder-close" key={i} text={q.display_name} onClick={() => {
                                                setBusy(true);
                                                api.moveQueryToFolder(token, maybeQuery.get().id, q.id, maybeQuery.get().display_name, maybeQuery.get().description)
                                                    .then((ev) => {
                                                        listSiblingQueries();
                                                        setQuery(new Some(((ev) as any).data.item));
                                                        setBusy(false);
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
                    }) : <MenuItem text="No folders found" disabled={true} />}
            </MenuItem>
            <MenuDivider title={siblingQueriesFolder} />
            <MenuItem icon="code-block" text="Sibling Queries"
                popoverProps={{
                    popoverClassName: "sibling-menu"
                }} >
                {siblingQueries && siblingQueries.length > 0 ? siblingQueries : <MenuItem text="No sibling queries" disabled={true} />}
            </MenuItem>
            <MenuDivider />
            <CreateApiEndpointButton
                buttonText="Create New Api Endpoint"
            />
        </Menu>;

        const renderMainDropDown = (
            !pageDeleteState ?
                <Popover2 content={pageMenu} placement="bottom-start">
                    <Button disabled={busy} rightIcon="caret-down" text={display_name} />
                </Popover2>
                : <>
                    <Button className="mr-1" intent="danger" onClick={() => {
                        handleDeleteQuery();
                    }}>DELETE</Button>
                    <Button className="mr-4" onClick={() => {
                        setPageDeleteState(false);
                    }}>CANCEL</Button></>);

        return renderMainDropDown;
    };

    const handleDeleteQuery = () => {
        if (pipeId) {
            api.deleteQueryForUser(token, pipeId).then(() => {
                window.location.hash = "/increment/";
            });
        }
    };

    const handleCreateQuery = () => {

        const cnt = maybeSiblingQueries.match({
            None: () => 0,
            Some: (queries: Query[]) => queries.filter((x) => !x.is_folder).length
        });
        const display_name = `${generateAdjective()} Query #${cnt + 1}`;

        const parentId = maybeQuery.match({
            None: () => null,
            Some: (query: Query) => query.parent_id
        });

        api.createQueryForUser(token, display_name, "", parentId)
            .then((ev) => {
                showMessage({
                    message: S.QUERY_CREATE_SUCCESS,
                    intent: Intent.SUCCESS,
                    icon: "tick-circle"
                });

                const id = ev.data.item.id;
                window.location.hash = `/increment/sql/${id}/`;
            });
    };

    useEffect(() => {
        maybeQuery.match({
            None: () => null,
            Some: (query) => {
                setNavBarDropDown(new Some(renderNavbarDropDown(query.display_name)));
            }
        });
    }, [pageDeleteState, maybeQuery, maybeSiblingQueries]);

    const getQueryDetails = () => {
        setBusy(true);

        api.getQuery(token, pipeId)
            .then((resp) => {
                setQuery(new Some(resp.data.item));
                setNavBarDropDown(new Some(renderNavbarDropDown(resp.data.item.display_name)));
                setBusy(false);
            });
    };

    useEffect(() => {
        listNodes();
        listSiblingQueries();
        getQueryDetails();
    }, [pipeId]);

    const handleSaveNode = (id, name, description, sql, order, message) => {
        api.saveNode(token, id, name, description, sql, order)
            .then((ev) => {
                if (message) {
                    showMessage({
                        message: message,
                        intent: Intent.SUCCESS,
                        icon: "tick-circle"
                    });
                }
            });
    };

    const handleFocus = (ref) => {
        ref.current.inputElement.focus();
    };

    const createMenu = (id: string, titleRef: any, descRef: any, codeVisible: boolean, resultVisible: boolean, setCode: Function, setResult: Function) => {
        return <Menu >
            {/* <MenuItem icon="floppy-disk" disabled={busy} text="Save Node" onClick={() => {
                handleSaveNode(id, displayName, description, sqlText, index, "Node saved");
            }} /> */}
            <MenuItem icon="floppy-disk" disabled={busy} text="Save Node" onClick={onSaveClick} />

            <MenuItem disabled={busy} text="Rename node" onClick={() => {
                handleFocus(titleRef);
            }} />
            <MenuItem disabled={busy} text="Add description" onClick={() => {
                handleFocus(descRef);
            }} />
            <MenuItem disabled={busy} text={codeVisible ? "Hide code" : "Show code"} onClick={() => {
                setCode((active) => !active);
            }} />
            <MenuItem disabled={busy} text={resultVisible ? "Hide results" : "Show results"} onClick={() => {
                setResult((active) => !active);
            }} />
            <MenuItem disabled={true} text="Create API Endpoint from this node" />
            <MenuItem disabled={busy} icon="trash" text="Delete" intent={Intent.DANGER} onClick={() => {
                const copy = { ...deleteState };
                copy[id] = true;
                setDeleteState(copy);
            }} />
        </Menu>;
    };


    const handleRemoveNode = (index) => {
        maybeNodes.match({
            None: () => {
                throw new Error("handle me");
            },
            Some: (nodes) => {
                const nextNode = nodes[index + 1];
                if (index > 0 && nextNode) {
                    const sqlText = nextNode.sql_text.replace(`${nodes[index].display_name}`, `${nodes[index - 1].display_name}`);
                    api.saveNode(token, nextNode.id, nextNode.display_name, nextNode.description, sqlText, index);
                    setNode("sql_text", sqlText, index + 1);
                } else if (index === 0 && nextNode) {
                    const sqlText = nextNode.sql_text.replace(`SELECT * FROM ${nodes[0].display_name}`, "");
                    api.saveNode(token, nextNode.id, nextNode.display_name, nextNode.description, sqlText, 0);
                    setNode("sql_text", sqlText, index + 1);
                }
                api.deleteNodeForUser(token, nodes[index].id)
                    .then((ev) => {
                        showMessage({
                            message: "Deleted Node",
                            intent: Intent.SUCCESS,
                            icon: "tick-circle"
                        });
                        nodes.splice(index, 1);
                        setNodes(new Some(nodes));
                    });
            }
        });

    };

    const handleCreateNode = () => {
        setBusy(true);

        const display_name = "node_" + Math.floor(Math.random() * 16777215).toString(16);

        maybeNodes.match({
            None: () => {
                throw new Error("handle me");
            },
            Some: (nodes) => {
                let sql = nodes.length > 0 ? nodes[0].sql_text : display_name;

                if (nodes.length > 0) {
                    for (let i = 1; i <= nodes.length; i++) {
                        sql = ` WITH ${nodes[i - 1].display_name} AS  \n  (\n    ${sql}  \n  ) \n    SELECT * FROM ${nodes[i - 1].display_name}`;
                    }
                }
                if (pipeId) {
                    api.createNodeForQuery(token, pipeId, display_name, "", `${nodes.length > 0 ? `${sql}` : "SELECT 1"}`, nodes.length)
                        .then((ev) => {
                            // showMessage({
                            //     message: S.NODE_CREATE_SUCCESS,
                            //     intent: Intent.SUCCESS,
                            //     icon: "tick-circle"
                            // });
                            setNodes(new Some([...nodes, ev.data]));
                            setBusy(false);
                        })
                        .then(() => {
                            listNodes();
                        });
                }
            }
        });
    };


    const createNodeButton = <Button
        icon="plus"
        onClick={handleCreateNode}
        disabled={busy}
    >Create node</Button>;

    const setNode = (key: string, value: any, index: number) => {
        maybeNodes.match({
            None: () => {
                throw new Error("handle me");
            },
            Some: (nodes) => {
                nodes[index][key] = value;
                setNodes(new Some(nodes));
            }
        });

    };

    const handleFullSql = (index, sqlText) => {
        return maybeNodes.match({
            None: () => {
                throw new Error("handle me");
            },
            Some: (nodes) => {
                let sql = index > 0 ? nodes[0].sql_text : sqlText;

                if (index > 0) {
                    for (let i = 1; i <= index; i++) {
                        if (i < index) {
                            const tmp = nodes[i].sql_text.split(")").pop()?.trim();
                            sql = ` WITH ${nodes[i - 1].display_name} AS  \n  (\n    ${sql}  \n  ) \n    ${tmp}`;
                        } else {
                            sql = ` WITH ${nodes[i - 1].display_name} AS  \n  (\n    ${sql}  \n  ) \n    ${sqlText}`;
                        }

                    }
                }
                return sql;
            }
        });
    };

    const onRunTrigger = async (sqlText, setEditorState, setResponse, index) => {
        const sql = handleFullSql(index, sqlText);
        setEditorState(EditorState.RUNNING);

        const resp = api.chRequest(token, sql.replace(";", ""), currentDateAgg, currentDateRange, currentChainNames);
        resp.then((text) => {
            if (text.error) {
                setResponse(new Some(text.error_message));
                setEditorState(EditorState.FAILURE);
            } else {
                setResponse(new Some(text.data));
                setMaybeData(new Some(text.data));
                setEditorState(EditorState.SUCCESS);
            }

        }).catch((ev) => {
            setResponse(new Some("Internal Server Error"));
            setEditorState(EditorState.FAILURE);
        });
    };

    const handleSetSelectedNode = (id: string) => {
        if (id) {
            setSelectedNode(new Some(id));
        }
    };

    const handleSetSelectedNodeScroll = (id: string) => {
        if (id) {
            setSelectedNode(new Some(id));
            const el = references.filter((r) => r.id === id)[0];
            el.scrollIntoView({ block: "center" });
        }
    };

    const getReferences = (reference: any) => {
        setReferences(reference);
    };

    const handleChangeDeleteState = (update) => {
        setDeleteState(update);
        forceUpdate();
    };

    const handleKeyPress = useCallback((e) => {
        // cmd + s
        if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
            onSaveClick();
            e.preventDefault();
        }
    }, [maybeCharts, maybeNodes]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        listNodes();
        listApps();
        listSiblingQueries();
    }, []);

    const listApps = () => {
        api.getAppsForGroup(token)
            .then((resp) => {
                setApps(new Some(resp.data.items));
            });
    };

    const CreateApiEndpointButton = ({
        buttonText,
    }: Omit<DialogProps, "isOpen"> & { buttonText: string }) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const handleButtonClick = React.useCallback(() => setIsOpen(true), []);
        const handleClose = React.useCallback(() => setIsOpen(false), []);
        const [createAppBusy, setCreateAppBusy] = useState(true);
        const [validatingBusy, setValidatingBusy] = useState(false);
        const [createReady, setCreateReady] = useState(true);

        const newAppSelected = (event: React.ChangeEvent<HTMLSelectElement>) => {
            endpoint.app.id = event.target.value;
            if (endpoint.app.id == "1") {
                endpoint.app.id = "";
                setCreateAppBusy(false);
                validateReady();
            } else {
                endpoint.app.display_name = "";
                setCreateAppBusy(true);
                validateReady();
            }
        };

        const createApiEndpointValidation = () => {
            if (validatingBusy) {
                return;
            } else {
                api.getEndpointForNode(endpoint.node_id, token)
                    .then((resp) => {
                        if (resp.data.items.length > 0) {
                            setValidatingBusy(true);
                            endpoint.app.id = resp.data.items[0].app.id;
                            endpoint.app.display_name = "";
                            endpoint.app.slug = resp.data.items[0].app.display_name;
                            endpoint.name = resp.data.items[0].name;
                        } else {
                            setValidatingBusy(false);
                        }
                    });
            }
        };

        const validateReady = () => {
            if ((endpoint.name !== "" && endpoint.version_name !== "")
                && (endpoint.app.display_name !== "" || endpoint.app.id !== "")) {
                setCreateReady(true);
            } else {
                setCreateReady(false);
            }
        };

        const onButtonClick = () => {
            endpoint.name = "";
            endpoint.version_name = "";
            // endpoint.app_name = "";
            handleButtonClick();
            validateReady();
            createApiEndpointValidation();
        };

        return (
            <>
                <Button minimal={true} onClick={onButtonClick}
                    text={"Create new api endpoint"} icon="new-object" />
                <Drawer
                    className={`w-[50rem]  ${props.darkMode ? "bp4-dark" : ""}`}
                    {...props}
                    title={validatingBusy ? "Create new api version" : "Create new api endpoint"}
                    icon="new-object"
                    isOpen={isOpen}
                    onClose={handleClose}
                    canOutsideClickClose={false}
                    size={"400px"}
                >
                    <div className={Classes.DRAWER_BODY}>
                        <Callout intent={Intent.WARNING}>
                            {validatingBusy ? S.ENDPOINT_CREATE_VERSION_HELP : S.ENDPOINT_CREATE_NEW_HELP}
                        </Callout>
                        <div className="p-4 pb-0">
                            <H5>
                                <Label>
                                    Endpoint Name
                                    <InputGroup
                                        asyncControl={true}
                                        disabled={validatingBusy}
                                        onChange={(value) => {
                                            endpoint.name = value.target.value;
                                            validateReady();
                                        }}
                                        placeholder={validatingBusy ? endpoint.name : ""}
                                    />
                                </Label>
                            </H5>
                            <H5>
                                <Label>
                                    Endpoint description (optional)
                                    <InputGroup
                                        asyncControl={true}
                                        disabled={false}
                                        onChange={(value) => {
                                            endpoint.description = value.target.value;
                                        }}
                                    />
                                </Label>
                            </H5>
                            <H5>
                                <Label>
                                    Version name
                                    <InputGroup
                                        asyncControl={true}
                                        disabled={false}
                                        onChange={(value) => {
                                            endpoint.version_name = value.target.value;
                                            validateReady();
                                        }}
                                    />
                                </Label>
                            </H5>
                            <H5>
                                <Label>
                                    Select app for endpoint
                                    {validatingBusy ?
                                        <select className="bg-[#1114184d] float-right appearance-none" disabled={true}
                                            id="selectBox" onChange={newAppSelected} defaultValue={"DEFAULT"}>
                                            <option value="DEFAULT">{endpoint.app.slug}</option>
                                        </select> :
                                        <select className="bg-[#1114184d] float-right w-40" disabled={false}
                                            id="selectBox" onChange={newAppSelected} defaultValue={"DEFAULT"}>
                                            <option value="DEFAULT" disabled>Choose app</option>
                                            <option value="1"> Or create new app</option>
                                            {maybeApps.match({
                                                None: () => [<option key={0} value={0}> loading... </option>],
                                                Some: (apps) => {
                                                    return apps.map((a) => <option key={a.id}
                                                        value={a.id}> {a.display_name} </option>);
                                                }
                                            })}
                                        </select>
                                    }
                                </Label>
                            </H5>
                            <H5>
                                <Label>
                                    App name
                                    <InputGroup
                                        asyncControl={true}
                                        disabled={createAppBusy}
                                        onChange={(value) => {
                                            endpoint.app.display_name = value.target.value;
                                            validateReady();
                                        }}
                                    />
                                </Label>
                            </H5>
                            <H5>
                                <Label>
                                    App description (optional)
                                    <InputGroup
                                        asyncControl={true}
                                        disabled={createAppBusy}
                                        onChange={(value) => {
                                            endpoint.app.description = value.target.value;
                                        }}
                                    />
                                </Label>
                            </H5>
                        </div>
                    </div>
                    <div className={Classes.DRAWER_FOOTER}>
                        <Button
                            large
                            disabled={!createReady}
                            onClick={() => {
                                onConfirmClick(endpoint.app.display_name, endpoint.app.description,
                                    endpoint.app.id, endpoint.node_id, handleClose, validatingBusy);
                            }}
                        >
                            {validatingBusy ? "Create new api version" : "Create new api endpoint"}
                        </Button>
                    </div>
                </Drawer>
            </>
        );
    };

    const onConfirmClick = (appName, appDescription, appID, nodeID, handleClose: () => void, isNewVersion) => {
        if (appName !== "") {
            api.createApps(appName, appDescription, token)
                .then((resp) => {
                    if (resp.error) {
                        showMessage({
                            message: S.APP_CREATE_FAILURE + resp.error_message,
                            intent: Intent.WARNING,
                            icon: "issue"
                        });
                    } else {
                        appID = resp.data.id;
                        showMessage({
                            message: S.APP_CREATE_SUCCESS,
                            intent: Intent.SUCCESS,
                            icon: "tick-circle"
                        });
                    }
                })
                .then(() => {
                    postApiEndpoint(nodeID, appID, isNewVersion);
                    handleClose();
                });
        } else {
            postApiEndpoint(nodeID, appID, isNewVersion);
            handleClose();
        }
    };

    function postApiEndpoint(nodeID, appID, isNewVersion) {
        if (endpoint.name == "" || endpoint.version_name == "") {
            showMessage({
                message: S.ENDPOINT_CREATE_FAILURE,
                intent: Intent.WARNING,
                icon: "issue"
            });
        } else {
            api.createApiEndpoint(endpoint.name, endpoint.description, endpoint.version_name,
                nodeID, appID, token)
                .then((resp) => {
                    if (resp.error) {
                        showMessage({
                            message: S.ENDPOINT_CREATE_FAILURE + resp.error_message,
                            intent: Intent.WARNING,
                            icon: "issue"
                        });
                    } else {
                        if (isNewVersion) {
                            showMessage({
                                message: S.ENDPOINT_VERSION_CREATE_SUCCESS,
                                intent: Intent.SUCCESS,
                                icon: "tick-circle"
                            });
                        } else {
                            showMessage({
                                message: S.ENDPOINT_CREATE_SUCCESS,
                                intent: Intent.SUCCESS,
                                icon: "tick-circle"
                            });
                        }
                    }
                });
        }
    }

    const onSaveClick = () => {

        maybeNodes.match({
            None: () => null,
            Some: (nodes: Node[]) => {
                setBusy(true);
                const node_promises = nodes.map((node: Node, i) => {
                    if (i > 0) {
                        const tmp = node.sql_text;
                        return api.saveNode(token, node.id, node.display_name, node.description, handleFullSql(i, tmp).replace(";", ""), i);
                    } else {
                        return api.saveNode(token, node.id, node.display_name, node.description, node.sql_text.replace(";", ""), i);
                    }
                });

                maybeCharts.match({
                    None: () => [],
                    Some: (charts: ChartInDB[]) => {
                        charts.forEach((c) => {
                            node_promises.push(api.saveChart(token, c.id, c.chart_type, c.properties, c.display_name));

                        });
                    }
                });

                Promise.all(node_promises)
                    .then((resp) => {
                        listNodes();
                        setBusy(false);

                        showMessage({
                            message: S.QUERY_SAVE_SUCCESS,
                            intent: Intent.SUCCESS,
                            icon: "tick-circle"
                        });
                    })
                    .catch(() => {
                        setBusy(false);
                        showMessage({
                            message: S.QUERY_SAVE_FAIL,
                            intent: Intent.DANGER,
                            icon: "tick-circle"
                        });
                    });
            }
        });
    };

    const renderedNodes = maybeNodes.match({
        None: () => <Spinner size={SpinnerSize.SMALL} />,
        Some: (nodes) => {

            if (nodes.length === 0) {
                return <AddNode
                    onClickNewQuery={handleCreateNode}
                    darkMode={darkMode}
                />;
            }

            return nodes.map((n, i) => {
                return <div key={i}  >
                    <SqlNode
                        onSaveClick={onSaveClick}
                        token={props.token}
                        currentDateAgg={currentDateAgg}
                        currentDateRange={currentDateRange}
                        currentChainNames={currentChainNames}
                        setUseChainFilter={setUseChainFilter}
                        setUseDateRangeFilter={setUseDateRangeFilter}
                        setUseDateAggFilter={setUseDateAggFilter}
                        useChainFilter={useChainFilter}
                        useDateRangeFilter={useDateRangeFilter}
                        useDateAggFilter={useDateAggFilter}
                        deleteState={deleteState}
                        setDeleteState={handleChangeDeleteState}
                        handleRemoveNode={handleRemoveNode}
                        getReferences={getReferences}
                        setSelectedNode={handleSetSelectedNode}
                        createMenu={createMenu}
                        onRunTrigger={onRunTrigger}
                        darkMode={darkMode}
                        node={n}
                        index={i}
                        setNode={setNode}
                        showMessage={showMessage}
                        setRightPane={setRightPaneWrapper}
                        nodes={nodes}
                        handleFullSql={handleFullSql}
                        handleSaveNode={handleSaveNode}
                        busy={busy}
                        groupId={props.groupId}
                        query_groupId={maybeQuery.match({
                            None: () => "",
                            Some: (query) => query.group.id
                        })}
                    />
                </div>;
            });
        }
    });

    const addNewNodeMin = <div />;

    const metadata = maybeQuery.match({
        None: () => <div />,
        Some: (pipeline) => {
            return <div className="">
                <H2>
                    <EditableText
                        className="-truncate w-3/4"
                        ref={titleRef}
                        multiline={pipeline.display_name.length > 50 && true}
                        disabled={busy || rbac.can("editor", "update:query", () => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    return maybeQuery.match({
                                        Some: (query) => query.group.id !== group_id,
                                        None: () => true
                                    });
                                },
                                None: () => true
                            });
                        })}
                        placeholder="Edit title..."
                        value={pipeline.display_name}
                        maxLength={45}
                        onEdit={(value) => {
                            if (value) {
                                setFallBackName(value);
                            }
                        }}
                        onChange={(value) => {
                            const pipeline = maybeQuery.get();
                            pipeline.display_name = value;
                            setFallBackName(value);
                            setQuery(new Some(pipeline));
                        }}
                        onConfirm={() => {
                            const query = maybeQuery.get();
                            if (fallBackName === "") {
                                return;
                            }
                            setBusy(true);
                            api.saveQuery(token, pipeId, fallBackName, query.description, query.parent_id)
                                .then((resp) => {
                                    setBusy(false);
                                    setQuery(new Some(resp.data.item));
                                    setNavBarDropDown(new Some(renderNavbarDropDown(resp.data.item.display_name)));

                                    showMessage({
                                        message: S.QUERY_TITLE_RENAMED_SUCCESS,
                                        intent: Intent.SUCCESS,
                                        icon: "tick-circle"
                                    });
                                });
                        }}
                    />
                </H2>

                <H5>
                    <EditableText
                        multiline={false}
                        className="w-3/4"
                        disabled={busy || rbac.can("editor", "update:query", () => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    return maybeQuery.match({
                                        Some: (query) => query.group.id !== group_id,
                                        None: () => true
                                    });
                                },
                                None: () => true
                            });
                        })}
                        alwaysRenderInput={true}
                        placeholder="Edit description..."
                        value={pipeline.description}
                        onChange={(value) => {
                            const pipeline = maybeQuery.get();
                            pipeline.description = value;
                            setQuery(new Some(pipeline));

                        }}
                        onConfirm={() => {
                            const query = maybeQuery.get();
                            setBusy(true);
                            api.saveQuery(token, pipeId, query.display_name, query.description, query.parent_id)
                                .then((resp) => {
                                    setBusy(false);
                                    setQuery(new Some(resp.data.item));

                                    showMessage({
                                        message: S.QUERY_DESC_RENAMED_SUCCESS,
                                        intent: Intent.SUCCESS,
                                        icon: "tick-circle"
                                    });
                                });
                        }} />
                </H5>
            </div>;
        }
    });

    const renderRightPane = (expand: any | boolean, nodes) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return <SplitPane resizerStyle={s.resizerStyle} split="vertical" allowResize={true} primary="second" minSize={"10%"} maxSize={"30%"} defaultSize={expand ? "30%" : "0"} >
            <div className="p-0 h-screen overflow-auto pb-32">
                <div className="p-2.5 pb-0">
                    {/* Toolbar */}
                    <div className="flex justify-between">
                        <div>
                            {maybeNodes.match({
                                None: () => null,
                                Some: (nodes: Node[]) => {
                                    return nodes.length === 0
                                        ? null
                                        : <div className="pb-4 flex justify-between gap-4">
                                            <Button onClick={onSaveClick} disabled={busy || rbac.can("editor", "update:query", () => {
                                                return props.groupId.match({
                                                    Some: (group_id) => {
                                                        return maybeQuery.match({
                                                            Some: (query) => query.group.id !== group_id,
                                                            None: () => true
                                                        });
                                                    },
                                                    None: () => true
                                                });
                                            })} icon="floppy-disk">Save</Button>
                                            <div><Button icon={"download"} onClick={() => {
                                                csvDownload(maybeData, maybeQuery);
                                            }} disabled={maybeData.isEmpty ? true : false}>Download CSV</Button></div>
                                        </div>;
                                }
                            })}
                            {/* <Button disabled={busy} onClick={() => {
                                setRunTrigger((active) => !active);
                            }} icon="play">Run Query</Button> */}
                        </div>
                        {/* <div>
                            {createNodeButton}
                        </div> */}
                    </div>

                    {/* Pipeline Metadata  */}
                    {metadata}
                </div>

                {nodes}

                {addNewNodeMin}
                {/* <div className={"w-full border p-20 cursor-pointer hover:border-gradient text-3xl font-thin flex place-items-center bg-opacity-60 " + s.BG_COLOR} onClick={handleCreateNode}>
                    <Icon className="mr-2" size={30} icon="plus" />
                    Add a new SQL node
                </div> */}
            </div>
            <div className="h-screen overflow-auto pb-32 ">
                <div className="">
                    {
                        rightPane.match({
                            None: () => null,
                            Some: (rp) => {
                                return <div>{rp}</div>;
                            }
                        })
                    }
                </div>
            </div>
        </SplitPane>;
    };


    const page_title = `${maybeQuery.match({
        None: () => "SQL",
        Some: (query) => query.display_name + " | SQL"
    })} | Increment`;

    return <div className="h-[calc(100vh-51px)] relative">
        <Helmet>
            <title>{page_title}</title>
        </Helmet>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <SplitPane
            resizerStyle={s.resizerStyle}
            split="vertical"
            allowResize={showSidebar ? true : false}
            primary="first"
            minSize={"20%"}
            maxSize={"30%"}
            defaultSize={showSidebar ? "18%" : "1.6%"}
        >
            {!showSidebar ?
                <div className="flex ">
                    <div className={"h-[calc(100vh-50px)] flex-none w-6 pt-2.5 border border-r-2 border-l-0 border-t-0  border-b-0  text-center " + s.BORDER_SECONDARY} >
                        <Icon className="cursor-pointer" icon="double-chevron-right" onClick={() => onToggleSidebar(!showSidebar)} />
                        <div className="pl-2.5 rotate-90 whitespace-nowrap font-thin "> SCHEMA BROWSER</div>
                    </div>
                </div>
                :
                <div className="pl-1.5 pr-1.5">
                    <Tabs id="leftNavBar" onChange={(newTab: LeftTabs) => setActiveTab(newTab)} selectedTabId={activeTab}>
                        <Tab title={<span className="text-xs uppercase">Schema</span>} id={LeftTabs.SCHEMA} panel={<SchemaBrowser token={props.token} darkMode={darkMode} currentChain={currentChainNames} currentDateAgg={currentDateAgg} currentDateRange={currentDateRange} />} />
                        <Tabs.Expander />
                        <Button icon="double-chevron-left" onClick={() => onToggleSidebar(!showSidebar)} minimal={true} />
                    </Tabs>
                </div>
            }
            {rightPane.match({
                None: () => renderRightPane(false, renderedNodes),
                Some: (rp) => renderRightPane(rp, renderedNodes)
            })}
        </SplitPane>
    </div>;

}
