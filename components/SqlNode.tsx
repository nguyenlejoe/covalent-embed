import React, { useState, useEffect, FC, useMemo, useRef, useReducer } from "react";
import { useHash } from "../hooks/useHash";
import * as C from "../helpers/colors";
import S from "../helpers/strings";

import { CHResponse, CHResponseWrapper, EditorState } from "../helpers/common";

import { Option, Some, None } from "../helpers/option";

import { Button, ButtonGroup, H1, H2, H3, EditableText, PopoverPosition, Intent, H4, H6, H5, Menu, MenuItem } from "@blueprintjs/core";
import { Tab, Tabs } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
import StatusBar from "./node-comps/StatusBar";
import EditorSeries from "./node-comps/EditorSeries";
import { EditorSettings } from "./node-comps/EditorSettings";
import ResultContainer from "./node-comps/ResultContainer";
import { ChartContainer } from "./node-comps/ChartContainer";
import { defaultChartConfig } from "./charts/ChartConfig";
import { FormatTableData, renderChartTitle } from "../helpers/formats";
import FullSQL from "./node-comps/full-sql";
import Editor from "./Editor";
import { api, ChartInDB, Node } from "../helpers/api";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import AddChart from "./node-comps/AddChart";
import AddToBoard from "./node-comps/AddToBoard";
import { TimeseriesPipeline } from "../helpers/TimeseriesPipeline";
import SplitPane from "react-split-pane";
import { InstancesBrowser } from "./InstanceBrowser";

interface NodeProps {
    busy: boolean;
    node: Node;
    query_groupId: string;
    setNode: Function;
    nodes: any;
    index: number;
    createMenu: Function;
    handleFullSql: Function;
    onRunTrigger: Function;
    handleSaveNode: Function;
    setRightPane: Function;
    showMessage: Function;
    setSelectedNode: Function;
    getReferences: Function;

    handleRemoveNode: Function;

    setDeleteState: Function;

    darkMode: boolean;

    deleteState: any;

    groupId: Option<string>;

    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    token: string;
    onSaveClick: Function;

    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
}

enum TABS {
    RESULTS, CHART, SQL
}

function SqlNode(props: NodeProps) {
    const reference = useRef(null);
    const [editorState, setEditorState] = useState(EditorState.READY);
    const [activeEditorTab, setActiveEditorTab] = useState("series");
    const [activeResultsTab, setActiveResultsTab] = useState(TABS.RESULTS);
    const [maybeResponse, setResponse] = useState(None);
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const [tableData, setTableData] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [firstPass, setFirstPass] = useState(true);
    const [firstPassSingle, setFirstPassSingle] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [spectrum, setSpectrum] = useState("blues");
    const [deleteChart, setDeleteChartState] = useState({});
    const [codeVisible, setCodeVisible] = useState(true);
    const [resultVisible, setResultVisible] = useState(true);
    const [_config, setConfigBase_] = useState(defaultChartConfig());
    const [hash, setHash] = useHash();
    const [fallBackName, setFallBackName] = useState("");
    const [maybeCharts, setCharts] = useState(None);
    const [display_sql, setSQL] = useState("");
    const [prevSql, setPrevSql] = useState("");
    const [maybeSelectedChart, setSelectedChart] = useState(None);
    const [maybeChartsCopy, setChartsCopy] = useState(None);
    const [switchedChartType, setSwitchedChartType] = useState(false);
    const [selectedSQL, setSelectedSQL] = useState("");
    const [callDatabaseOnce, setCallDatabaseOnce] = useState(false);
    const [AddToBoardFlag, setAddFlag] = useState(false);

    const s = props.darkMode ? C.DARK : C.LIGHT;
    let horizontalSplit;
    if (localStorage.getItem("horizontalSplit") === null) {
        horizontalSplit = 450;
    } else {
        horizontalSplit = localStorage.getItem("horizontalSplit");
    }

    const handleCreateChart = (chartType) => {
        api.createChartForNode(props.token, props.node.id, chartType)
            .then((ev) => {
                props.showMessage({
                    message: S.CHART_CREATE_SUCCESS,
                    intent: Intent.SUCCESS,
                    icon: "tick-circle"
                });
                // listCharts((items) => {
                //     const latest = items.length - 1;
                //     setActiveResultsTab(items[latest].id);
                // });
                maybeCharts.match({
                    None: () => null,
                    Some: (charts) => {
                        charts = [...charts, ev.data.item];
                        charts.map((c) => {
                            const oldConfig = JSON.parse(JSON.stringify(c.properties));
                            Object.assign(c.properties, defaultChartConfig());
                            // eslint-disable-next-line guard-for-in
                            for (const k in oldConfig) {
                                c.properties[k] = oldConfig[k];
                            }
                        });
                        setChartsCopy(new Some(charts));
                        setCharts(new Some(charts));
                        const latest = charts.length - 1;
                        // setTableData(false);
                        setFirstPassSingle(true);
                        setFirstPass(true);
                        setTableData(false);
                        setSwitchedChartType(true);
                        setActiveResultsTab(charts[latest].id);

                    }
                });
                if (!callDatabaseOnce) {
                    listCharts((items) => {
                        const latest = items.length - 1;
                        // setTableData(false);
                        // setFirstPassSingle(true);
                        // setFirstPass(true);
                        setActiveResultsTab(items[latest].id);
                    });
                }
                setCallDatabaseOnce(true);
            });
    };

    const setChartType = (chart_id: string, chart_type: string) => {
        maybeCharts.match({
            None: () => null,
            Some: (charts: ChartInDB[]) => {
                const c = charts.find((x) => x.id === chart_id);
                if (c) {
                    c.chart_type = chart_type;
                    setCharts(new Some([...charts]));
                }
                props.setRightPane(new Some(renderRightPane(chart_id)),
                    [...charts]
                );
            }
        });
    };

    const listCharts = (fn?: Function) => {
        api.chartsForNode(props.token, props.node.id)
            .then((ev) => {
                const charts = ev.data.items.map((c) => {
                    const oldConfig = JSON.parse(JSON.stringify(c.properties));
                    Object.assign(c.properties, defaultChartConfig());

                    // eslint-disable-next-line guard-for-in
                    for (const k in oldConfig) {
                        c.properties[k] = oldConfig[k];
                    }
                });
                setCharts(new Some(ev.data.items));
                setChartsCopy(new Some(ev.data.items));
                if (fn) {
                    fn(ev.data.items);
                }
            });
    };

    useEffect(() => {
        listCharts();
        setCallDatabaseOnce(false);
    }, [props.node.id]);

    // useEffect(() => {
    //     setSQL(props.node.sql_text);
    // }, []);


    const setConfigBase = (chart_id: string, charts: ChartInDB[], newConfig) => {
        charts.forEach((x) => {
            if (x.id === chart_id) {
                x.properties = newConfig;
            }
        });

        setCharts(new Some([...charts]));
        props.setRightPane(new Some(renderRightPane(chart_id)), [...charts]
        );
    };

    const setConfigBaseSeries = (chart_id: string, charts: ChartInDB[], newConfig) => {

        charts.forEach((x) => {
            if (x.id === chart_id) {
                x.properties = newConfig;
            }
        });

        setChartsCopy(new Some([...charts]));
        props.setRightPane(new Some(renderRightPane(chart_id)), [...charts]);

    };

    const setConfig = (chart_id: string, field: string, value: any, value2: any) => {

        maybeCharts.match({
            None: () => null,
            Some: (charts: ChartInDB[]) => {
                const c = charts.find((x) => x.id === chart_id);
                if (!c) {
                    throw new Error("handle me");
                }
                const config = c.properties;
                const cc = JSON.parse(JSON.stringify(config));

                switch (field) {
                    case "metric_value_format":
                        cc.metric_value_format = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "metric_value_decimals":
                        cc.metric_value_decimals = isNaN(value) ? 0 : value > 100 ? 100 : value;
                        return setConfigBase(chart_id, charts, cc);
                    case "metric_value_currency":
                        cc.metric_value_currency = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);

                    case "chart_title":
                        c.display_name = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);

                    case "chart_data_labels":
                        cc.chart_data_labels = !config.chart_data_labels;
                        return setConfigBase(chart_id, charts, cc);
                    case "chart_proportional":
                        cc.chart_proportional = !config.chart_proportional;
                        return setConfigBase(chart_id, charts, cc);
                    case "chart_stacked":
                        cc.chart_stacked = !config.chart_stacked;
                        return setConfigBase(chart_id, charts, cc);
                    case "chart_horizontal":
                        cc.chart_horizontal = !config.chart_horizontal;
                        return setConfigBase(chart_id, charts, cc);

                    case "legend_hide":
                        cc.legend_hide = !config.legend_hide;
                        return setConfigBase(chart_id, charts, cc);

                    case "x_axis":
                        cc.x_axis = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis":
                        cc.y_axis = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y2_axis":
                        cc.y2_axis = value.currentTarget.value;
                        cc.segment_axis = "";
                        cc.y2_axis_percent = cc.y2_axis === "" ? false : cc.y2_axis_percent;
                        cc.chart_proportional = cc.y2_axis === "" ? cc.chart_proportional : false;
                        return setConfigBase(chart_id, charts, cc);
                    case "segment_axis":
                        cc.segment_axis = value.currentTarget.value;
                        cc.y2_axis = "";
                        cc.y2_axis_percent = cc.y2_axis === "" ? false : cc.y2_axis_percent;
                        return setConfigBase(chart_id, charts, cc);

                    case "x_axis_title":
                        cc.x_axis_title = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "x_axis_min":
                        cc.x_axis_min = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "x_axis_max":
                        cc.x_axis_max = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "x_axis_show_values":
                        cc.x_axis_show_values = !config.x_axis_show_values;
                        return setConfigBase(chart_id, charts, cc);
                    case "x_axis_fill_empty_dates":
                        cc.x_axis_fill_empty_dates = !config.x_axis_fill_empty_dates;
                        return setConfigBase(chart_id, charts, cc);

                    case "y_axis_title":
                        cc.y_axis_title = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis_min":
                        cc.y_axis_min = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis_max":
                        cc.y_axis_max = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis_format":
                        cc.y_axis_format = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis_decimals":
                        cc.y_axis_decimals = isNaN(value) ? 0 : value > 100 ? 100 : value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y_axis_currency":
                        cc.y_axis_currency = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);

                    case "y2_axis_title":
                        cc.y2_axis_title = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y2_axis_min":
                        cc.y2_axis_min = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y2_axis_max":
                        cc.y2_axis_max = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "y2_axis_percent":
                        cc.y2_axis_percent = !config.y2_axis_percent;
                        return setConfigBase(chart_id, charts, cc);

                    case "pie_color_scheme":
                        cc.pie_color_scheme = value;
                        return setConfigBase(chart_id, charts, cc);
                    case "pie_top_x_legends":
                        cc.pie_top_x_legends = !config.pie_top_x_legends;
                        return setConfigBase(chart_id, charts, cc);
                    case "pie_top_x_value":
                        cc.pie_top_x_value = isNaN(value) ? 0 : value > 100 ? 100 : value;
                        return setConfigBase(chart_id, charts, cc);

                    case "table_color_zebra_striping":
                        cc.table_color_zebra_striping = !config.table_color_zebra_striping;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_hide_row_numbers":
                        cc.table_hide_row_numbers = !config.table_hide_row_numbers;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_column_currency":
                    case "table_column_format":
                    case "table_column_alignment":
                        cc[field][value] = value2.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_column_display":
                    case "table_column_width":
                        cc[field][value] = value2.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_column_hide":
                        cc[field][value] = value2.currentTarget.checked;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_column_total":
                        cc[field][value] = value2.currentTarget.checked;
                        return setConfigBase(chart_id, charts, cc);
                    case "table_column_decimals":
                        cc[field][value] = isNaN(value2.currentTarget.value) ? 0 : Number(value2.currentTarget.value) > 100 ? 100 : Number(value2.currentTarget.value) < 0 ? 0 : value2.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "chart_series_config":
                        cc[field][value] = value2;
                        return setConfigBaseSeries(chart_id, charts, cc);

                    case "cohort_cohort_column":
                        cc.cohort_cohort_column = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_pivot_column":
                        cc.cohort_pivot_column = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column":
                        cc.cohort_data_column = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_size_column":
                        cc.cohort_size_column = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_color_scheme":
                        cc.cohort_color_scheme = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_format":
                        cc.cohort_data_column_format = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_decimals":
                        cc.cohort_data_column_decimals = isNaN(value) ? 0 : value > 100 ? 100 : value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_currency":
                        cc.cohort_data_column_currency = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_size_format":
                        cc.cohort_data_column_size_format = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_size_decimals":
                        cc.cohort_data_column_size_decimals = isNaN(value) ? 0 : value > 100 ? 100 : value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_data_column_size_currency":
                        cc.cohort_data_column_size_currency = value.currentTarget.value;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_size_format_toggle":
                        cc.cohort_size_format_toggle = !config.cohort_size_format_toggle;
                        return setConfigBase(chart_id, charts, cc);
                    case "cohort_color_scheme_reversed":
                        cc.cohort_color_scheme_reversed = !config.cohort_color_scheme_reversed;
                        return setConfigBase(chart_id, charts, cc);

                    default:
                        throw new Error("handle me");
                }
            }
        });
    };

    const handleModal = () => {
        setAddModal((active) => !active);
    };

    const handleAddToBoardFlag = () => {
        setAddFlag((active) => !active);
    };

    const handleNameCheck = (value) => {
        for (let i = 0; i < props.nodes.length; i++) {
            if (value === props.nodes[i].title || value.indexOf(" ") >= 0 || value === "" || !value.match(/^[a-zA-Z0-9_]+$/)) {
                setTitleError(true);
                return false;
            }
        }
        setTitleError(false);
    };

    const onRunTrigger = (selectedSQL?: string) => {
        if (display_sql.length > 0) {
            props.onRunTrigger(display_sql, setEditorState, setResponse, props.index);
        } else {
            const sql = props.node.sql_text;
            if (selectedSQL && selectedSQL !== "") {
                props.onRunTrigger(selectedSQL, setEditorState, setResponse, props.index);
            } else {
                props.onRunTrigger(sql + "\n", setEditorState, setResponse, props.index);
            }
        }

        setTableData((prevState) => {
            if (prevSql !== props.node.sql_text) {
                return false;
            }
            if (prevState === false) {
                return false;
            } else {
                return prevState;
            }
        });

        setRefresh((prevState) => {
            if (prevState === false) {
                return false;
            } else {
                return true;
            }
        });
        setPrevSql(props.node.sql_text);
    };

    useEffect(() => {
        setEditorState(EditorState.READY);
        setResponse(None);
    }, [hash]);


    let finalResult;

    useEffect(() => {
        maybeResponse.match({
            None: () => <div className={s.TEXT_COLOR}>Hit "Run" to see results.</div>,
            Some: (data: CHResponseWrapper) => {
                if (data.data === undefined) {
                    setEditorState(EditorState.FAILURE);
                    return;
                }
                if (data.data.data.length === 0) {
                    setEditorState(EditorState.NO_DATA);
                    return;
                }
                const f = activeResultsTab.toString();
                if (f.startsWith("chart_")) {
                    const charts = maybeCharts.get();
                    const chart: ChartInDB = charts.find((x) => x.id === f);

                    if (chart === undefined || chart.properties === undefined || chart.properties === {}) {
                        return;
                    }

                    if (chart) {
                        const timeseriesPipeline = new TimeseriesPipeline(data.data.data);

                        if (chart.properties.x_axis === "" && chart.properties.y_axis === "") {
                            chart.properties.x_axis = timeseriesPipeline.x_column;
                            chart.properties.y_axis = timeseriesPipeline.y_column;
                        }

                        // remove sql columns that don't exist with current sql
                        const axises = { x_axis: chart.properties.x_axis, y_axis: chart.properties.y_axis, y2_axis: chart.properties.y2_axis, segment_axis: chart.properties.segment_axis };
                        const columnNames = Object.keys(axises);
                        for (let i = 0; i < columnNames.length; i++) {
                            if (data.data.meta.filter((e: any) => e.name === axises[columnNames[i]]).length <= 0) {
                                switch (columnNames[i]) {
                                    case "x_axis":
                                        chart.properties.x_axis = "";
                                        break;
                                    case "y_axis":
                                        chart.properties.y_axis = "";
                                        break;
                                    case "y2_axis":
                                        chart.properties.y2_axis = "";
                                        break;
                                    case "segment_axis":
                                        chart.properties.segment_axis = "";
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }

                        if (chart.chart_type === "pie" && chart.properties.y_axis) {
                            if (chart.properties.chart_series_config["myseries"] === undefined) {
                                finalResult = FormatTableData(data.data,
                                    { xAxis: chart.properties.x_axis, yAxis: chart.properties.y_axis, y2Axis: chart.properties.y2_axis, segmentAxis: chart.properties.segment_axis },
                                    chart.properties,
                                    false,
                                    firstPass,
                                    firstPassSingle,
                                    spectrum,
                                    chart.chart_type,
                                    switchedChartType
                                );
                            } else if (chart.properties.chart_series_config["myseries"] !== undefined) {
                                finalResult = FormatTableData(data.data,
                                    { xAxis: chart.properties.x_axis, yAxis: chart.properties.y_axis, y2Axis: chart.properties.y2_axis, segmentAxis: chart.properties.segment_axis },
                                    chart.properties,
                                    chart.properties.chart_series_config["myseries"],
                                    firstPass,
                                    firstPassSingle,
                                    spectrum,
                                    chart.chart_type,
                                    switchedChartType
                                );
                            }
                            setConfig(chart.id, "chart_series_config", "myseries", { ...finalResult });
                            setTableData(finalResult);
                            setRefresh(true);
                            setFirstPassSingle(false);
                            setSwitchedChartType(false);
                        } else if (chart.properties.x_axis && chart.properties.y_axis) {
                            if (chart.properties.chart_series_config["myseries"] === undefined) {
                                finalResult = FormatTableData(data.data,
                                    { xAxis: chart.properties.x_axis, yAxis: chart.properties.y_axis, y2Axis: chart.properties.y2_axis, segmentAxis: chart.properties.segment_axis },
                                    chart.properties,
                                    chart.chart_type === "area" ? tableData : false,
                                    firstPass,
                                    firstPassSingle,
                                    spectrum,
                                    chart.chart_type,
                                    chart.chart_type === "area" ? true : switchedChartType,
                                );
                            } else if (chart.properties.chart_series_config["myseries"] !== undefined) {
                                finalResult = FormatTableData(data.data,
                                    { xAxis: chart.properties.x_axis, yAxis: chart.properties.y_axis, y2Axis: chart.properties.y2_axis, segmentAxis: chart.properties.segment_axis },
                                    chart.properties,
                                    chart.properties.chart_series_config["myseries"],
                                    firstPass,
                                    firstPassSingle,
                                    spectrum,
                                    chart.chart_type,
                                    switchedChartType,
                                );
                            }
                            // debugger;
                            setConfig(chart.id, "chart_series_config", "myseries", { ...finalResult });
                            setTableData(finalResult);
                            setRefresh(true);
                            setFirstPassSingle(false);
                            setSwitchedChartType(false);
                        } else if (!chart.properties.x_axis || !chart.properties.y_axis) {
                            setTableData(false);
                            setRefresh(false);
                            setFirstPassSingle(true);
                            setFirstPass(true);
                            setSwitchedChartType(false);
                        }
                        if (chart.properties.x_axis && chart.properties.y_axis && chart.properties.segment_axis) {
                            setFirstPass(false);
                            setSwitchedChartType(false);
                        }
                    }

                }
            }
        });
    }, [activeResultsTab, maybeCharts, maybeResponse]);

    useEffect(() => {
        const selectedChartId = activeResultsTab.toString();
        if (selectedChartId.startsWith("chart_")) {
            const value = renderRightPane(selectedChartId);
            props.setRightPane(new Some(value), [...maybeCharts.get()]);
        }

        maybeCharts.match({
            None: () => null,
            Some: (charts) => {
                if (charts.length === 0) {
                    const value = renderRightPane(selectedChartId);
                    props.setRightPane(new Some(value), [...maybeCharts.get()]);
                }
            }
        });

    }, [activeEditorTab, activeResultsTab, tableData, maybeResponse, deleteChart, maybeCharts]);

    useEffect(() => {
        if (editorState === EditorState.FAILURE || editorState === EditorState.NO_DATA) {
            setActiveResultsTab(TABS.RESULTS);
        }
    }, [editorState]);

    const handleSaveConfig = () => {
        return maybeSelectedChart.match({
            None: () => null,
            Some: (chart) => {
                setConfig(chart.id, "chart_series_config", "myseries", tableData);
                maybeChartsCopy.match({
                    None: () => null,
                    Some: (charts) => {
                        const chartCopy = charts.find((x) => x.id === chart.id);
                        chart.properties.chart_series_config = chartCopy !== undefined ? chartCopy.properties.chart_series_config : chart.properties.chart_series_config;
                    }
                });
                api.saveChart(props.token, chart.id, chart.chart_type, chart.properties, chart.display_name)
                    .then((ev) => {
                        props.showMessage({
                            message: "Saved Chart",
                            intent: Intent.SUCCESS,
                            icon: "tick-circle"
                        });
                        setActiveEditorTab("instances");
                    });
            }
        });
    };

    const renderRightPane = (selectedChartId: string) => {

        if (selectedChartId.startsWith("chart_")) {

            return maybeCharts.match({
                None: () => null,
                Some: (charts) => {
                    const chart = charts.find((x) => x.id === selectedChartId);
                    if (chart) {
                        setSelectedChart(new Some(chart));

                        const menu = <Menu>
                            {/* <MenuItem icon="floppy-disk" text="Save" onClick={() => {
                                handleSaveConfig();
                            }} /> */}
                            <MenuItem disabled={props.busy} icon="trash" text="Delete" intent={Intent.DANGER} onClick={() => {
                                const copy = { ...deleteChart };
                                copy[chart.id] = true;
                                setDeleteChartState(copy);
                            }} />
                        </Menu>;
                        const renderDelete = () => {
                            let r: any;

                            if (Object.keys(deleteChart).length > 0 && deleteChart[chart.id]) {
                                r = <><Button className="" onClick={() => {
                                    api.deleteChart(props.token, chart.id)
                                        .then((ev) => {
                                            const copy = { ...deleteChart };
                                            delete copy[chart.id];
                                            setDeleteChartState(copy);

                                            setSelectedChart(None);

                                            maybeCharts.match({
                                                None: () => null,
                                                Some: (charts) => {
                                                    const updatedCharts = charts.filter((c) => c.id !== chart.id);
                                                    updatedCharts.map((c) => {
                                                        const oldConfig = JSON.parse(JSON.stringify(c.properties));
                                                        Object.assign(c.properties, defaultChartConfig());
                                                        // eslint-disable-next-line guard-for-in
                                                        for (const k in oldConfig) {
                                                            c.properties[k] = oldConfig[k];
                                                        }
                                                    });
                                                    setChartsCopy(new Some(updatedCharts));
                                                    setCharts(new Some(updatedCharts));
                                                    if (updatedCharts.length > 0) {
                                                        const latest = updatedCharts.length - 1;
                                                        setActiveResultsTab(updatedCharts[latest].id);
                                                    } else {
                                                        setActiveResultsTab("new-chart");
                                                        setActiveEditorTab("series");
                                                    }
                                                }
                                            });
                                        });
                                }} intent="danger">DELETE</Button><Button className="mr-4" onClick={() => {
                                    const copy = { ...props.deleteState };
                                    copy[chart.id] = false;
                                    setDeleteChartState(copy);
                                }}>CANCEL</Button></>;
                            }
                            return r;
                        };

                        const deleteButton = renderDelete();

                        return <div className={`pl-1 ${s.TEXT_COLOR}`}>
                            {/* <H6 className={"py-4 px-4 mb-4 border rounded-md border-opacity-40 " + s.BORDER}> {props.node.display_name} </H6> */}
                            <div className={"p-1.5 flex justify-between font-light  border-b " + s.BORDER_SECONDARY}  > {renderChartTitle(chart)}
                                <Popover2 content={menu} interactionKind={Popover2InteractionKind.CLICK}
                                    placement="bottom-end"><Icon className={"rotate-90 cursor-pointer"} icon="more" />
                                </Popover2>
                            </div>
                            <div> {deleteButton} </div>
                            <div className="pl-1.5 pr-1.5">
                                <Tabs className="relative" selectedTabId={activeEditorTab} onChange={(e) => {
                                    setActiveEditorTab(e);
                                    // props.setRightPane(new Some(renderRightPane(selectedChartId)))

                                }} renderActiveTabPanelOnly={true} >
                                    <Tab id="settings" title={<span className="text-xs uppercase font-light">  Settings</span>} panel={<EditorSettings
                                        editorState={editorState}
                                        maybeData={maybeResponse}
                                        // spectrum={spectrum}
                                        // setSpectrum={setSpectrum}
                                        title={chart.display_name}
                                        chartType={chart.chart_type}
                                        setChartType={(chart_type) => {
                                            setChartType(chart.id, chart_type);
                                        }}

                                        darkMode={props.darkMode}
                                        config={chart.properties}
                                        setConfig={(field: string, value: any, value2: any) => {
                                            setConfig(chart.id, field, value, value2);

                                            return;
                                        }}
                                        setSwitchedChartType={setSwitchedChartType}
                                    />
                                    } />
                                    <Tab id="series" disabled={chart.chart_type === "image"} title={<span className="text-xs uppercase font-light ">Series</span>} panel={<EditorSeries
                                        refresh={refresh}
                                        setRefresh={setRefresh}
                                        tableData={tableData}
                                        setTableData={setTableData}
                                        editorState={editorState}
                                        maybeData={maybeResponse}
                                        spectrum={spectrum}
                                        config={chart.properties}
                                        chartType={chart.chart_type}
                                        darkMode={props.darkMode}
                                        setConfig={(field: string, value: any, value2: any) => {
                                            setConfig(chart.id, field, value, value2);
                                            return;
                                        }}
                                    />
                                    } />
                                    <Tab id="instances" title={<span className="text-xs uppercase font-light ">Instances</span>} panel={<InstancesBrowser addFlag={AddToBoardFlag} token={props.token} chart={chart}/>} />
                                </Tabs>
                            </div>

                            {/* <Button className="" onClick={() => {
                                handleSaveConfig();
                            }}>Save Configurations</Button> */}
                        </div>;
                    }
                }
            });

        } else {
            return false;
        }
    };

    // const selected = props.selectedNode ? " -shadow-[0_0px_15px_0px_rgb(0_0_0_/_0.1),_0_0px_4px_4px_rgb(0_0_0_/_0.1)] -shadow-[#7f0eff99] " : " shadow-none ";

    const hc = () => {
        props.setSelectedNode(props.node.id);
    };


    const handleDelete = () => {
        props.handleRemoveNode(props.index);
    };

    const handleCancel = () => {
        const ds: Object = props.deleteState;
        delete ds[props.node.id];
        props.setDeleteState({});
    };

    const renderDelete = () => {
        let r: any;
        if (props.deleteState[props.node.id]) {
            r = <><Button className="mr-2" onClick={handleDelete} intent="danger">DELETE</Button><Button className="mr-4" onClick={handleCancel}>CANCEL</Button></>;
        }
        return r;
    };

    const deleteButton = renderDelete();
    const nextNode = props.nodes[props.index + 1];
    let sqlReplace;

    useEffect(() => {
        props.getReferences(reference.current);
    }, [reference]);

    return (
        <div className={`grid grid-cols-12 ${s.TEXT_COLOR}`}>
            <div ref={reference} onClick={hc} id={props.node.id} className={"col-span-12 mb-4 "}>
                <SplitPane resizerStyle={s.resizerHorizontalStyle} split="horizontal" primary="first" allowResize={true} minSize={200} maxSize={1000} defaultSize={parseInt(horizontalSplit, 10)} onDragFinished={(size) => localStorage.setItem("horizontalSplit", size.toString())} style={{position: "static"}} >
                    <div className={"mb-2 relative ml-1 w-full"} >
                        {/* <Tabs className="relative font-extralight" id={`editor-${props.node.id}`} large={true} onChange={(newTab) => setActiveEditorTab(newTab)} selectedTabId={activeEditorTab} renderActiveTabPanelOnly={true} >
                            <Tab className="border-black ring-black outline-black" id="editor" title="Editor" panel={<div className={props.darkMode ? "border border-gray-600" : "border"}> */}
                        <div className="absolute right-2 bottom-2">
                            <ButtonGroup>
                                <Button icon="play" disabled={props.busy} loading={editorState === EditorState.RUNNING} onClick={() => onRunTrigger(selectedSQL)}>{(selectedSQL !== undefined && selectedSQL !== "") ? "Run Selection" : "Run Query"}</Button>
                                {/* <Button active={false} disabled={true} >Limit 20 rows</Button> */}
                            </ButtonGroup>
                        </div>
                        {codeVisible &&
                            <Editor
                                setUseChainFilter={props.setUseChainFilter}
                                setUseDateRangeFilter={props.setUseDateRangeFilter}
                                setUseDateAggFilter={props.setUseDateAggFilter}
                                useChainFilter={props.useChainFilter}
                                useDateRangeFilter={props.useDateRangeFilter}
                                useDateAggFilter={props.useDateAggFilter}
                                setNode={props.setNode}
                                full_sql={props.node.sql_text}
                                onRunTrigger={onRunTrigger}
                                setSQL={setSQL}
                                editorState={editorState}
                                busy={props.busy}
                                index={props.index}
                                sql={display_sql}
                                darkMode={props.darkMode}
                                setSelectedSQL={setSelectedSQL}
                                groupId={props.groupId}
                                query_groupId={props.query_groupId}
                                currentDateAgg={props.currentDateAgg}
                                currentDateRange={props.currentDateRange}
                                currentChainNames={props.currentChainNames}
                            />
                        }
                    </div>
                    <div>
                        <div className={"ml-1 pl-1.5 mr-1 pb-2 border-b " + s.BORDER_SECONDARY}>
                            <StatusBar darkMode={props.darkMode} status={editorState} maybeResponse={maybeResponse} />
                        </div>

                        {maybeSelectedChart.match({
                            None: () => null,
                            Some: (selectedChart) => {
                                return (
                                    <div className={"select-none relative flex flex-wrap my-4 mx-3 items-center w-full"} >
                                        <div className="flex flex-wrap items-center">
                                            <Icon icon={"insert"} className="mr-2" />
                                            <div className="">Add chart to board</div>
                                        </div>
                                        <AddToBoard maybeCharts={maybeCharts} setCharts={setCharts} token={props.token} showMessage={props.showMessage} groupId={props.groupId} chart={selectedChart} darkMode={props.darkMode} active={addModal} handleClose={handleModal} handleSave={() => {
                                            props.handleSaveNode(props.node.id, props.node.display_name, props.node.description, props.node.sql_text.replace(";", ""), props.index);
                                            handleSaveConfig();
                                            handleAddToBoardFlag();
                                        }} />
                                    </div>
                                );
                            }
                        })}
                        {resultVisible &&
                        <div className={"  pl-2.5 pr-2.5"}>
                            <Tabs id={`viewer-${props.node.id}`} className={"   "} onChange={(newTab) => {
                                props.setRightPane(new Some(renderRightPane(newTab.toString())));
                                setActiveResultsTab(newTab);
                                if (newTab === 0 || newTab === 2) {
                                    setSelectedChart(None);
                                }
                            }} selectedTabId={activeResultsTab} renderActiveTabPanelOnly={true} >
                                <Tab id={TABS.RESULTS} title={<span className="text-xs uppercase   ">Results</span>} panel={<ResultContainer
                                    showMessage={props.showMessage}
                                    editorState={editorState}
                                    maybeData={maybeResponse}
                                />} />
                                {/* <Tab className="snap-start" id={TABS.SQL} title={<span className="text-xs uppercase font-thin" >Generated SQL</span>} panel={<FullSQL sql={props.node.sql_text} darkMode={props.darkMode} />} /> */}
                                {
                                    maybeCharts.match({
                                        None: () => null,
                                        Some: (charts) => {
                                            return charts.map((chart: ChartInDB, i) => {
                                                return <Tab
                                                    key={i}
                                                    id={chart.id}
                                                    title={<span className="text-xs uppercase text-ellipsis w-40 overflow-hidden">{renderChartTitle(chart)}</span>}
                                                    panel={
                                                        maybeResponse.match({
                                                            None: () => <div className={`font-thin ${s.TEXT_COLOR}`}>Hit "Run" to see results.</div>,
                                                            Some: () => {
                                                                return (
                                                                    <div style={{ maxWidth: "768px" }}>
                                                                        <ChartContainer
                                                                            display_name={chart.display_name}
                                                                            subtitle={""}
                                                                            chartType={chart.chart_type}
                                                                            refresh={refresh}
                                                                            tableData={tableData}
                                                                            config={chart.properties}
                                                                            maybeData={maybeResponse}
                                                                            darkMode={props.darkMode}
                                                                            type={chart.chart_type}
                                                                            id={chart.id}
                                                                            setTableData={setTableData}
                                                                            editorState={editorState}
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                        })
                                                    }
                                                />;
                                            });
                                        }
                                    })
                                }

                                {
                                    props.groupId.match({
                                        None: () => null,
                                        Some: (group_id) => {
                                            return (
                                                props.query_groupId === group_id &&
                                                <Tab disabled={props.busy} id={"new-chart"} title={<span className="text-xs uppercase"><Icon icon="add" /> New Chart</span>} panel={
                                                    <AddChart
                                                        node={props.node}
                                                        darkMode={props.darkMode}
                                                        listCharts={listCharts}
                                                        showMessage={props.showMessage}
                                                        handleCreateChart={handleCreateChart}
                                                    />
                                                } />
                                            );
                                        }
                                    })
                                }
                            </Tabs>
                        </div>
                        }
                    </div>
                </SplitPane>
            </div >
        </div >
    );
}

export default SqlNode;
