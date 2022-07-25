import React, { useState, useEffect, FC, useMemo } from "react";

import * as C from "../../helpers/colors";
import * as F from "../../helpers/formats";

import { CHResponse, CHResponseWrapper, EditorState } from "../../helpers/common";

import { Option, Some, None } from "../../helpers/option";

import { HTMLSelect, Checkbox, H3, H5, InputGroup, H4 } from "@blueprintjs/core";
import { Tooltip2, Classes } from "@blueprintjs/popover2";

import { ChartConfig } from "../charts/ChartConfig";
import { ColorPicker } from "../ColorPicker";
import { getRGB, hexToRGB, RGBAToHexA } from "../../helpers/formats";
import { ColorSpectrumPreview } from "../ColorSpectrumPreview";

export type ChartData = {
    labels: string[];
    datasets: Array<ChartDataSets>;
};

export type ChartDataSets = {
    axis?: string;
    type: string;
    label: string;
    data: any;
    backgroundColor: string | Array<String>;
    yAxisID?: string;
    xAxisID?: string;
    fill?: boolean | string | object;
    isAreaChart?: boolean;
    hoverOffset?: number;
    borderColor?: string;

};

export type FormatTableDataItems = {
    label: string;
    data: Array<any>;
    porportional_y2?: boolean;
};

interface EditorSeriesProps {
    editorState: EditorState;
    maybeData: Option<CHResponseWrapper>;
    // axises: Axises;
    // setAxises: Function;
    setTableData: any;
    tableData: any;
    setRefresh: Function;
    refresh: any;
    spectrum: string;
    config: ChartConfig;
    darkMode: boolean;
    chartType: string;
    setConfig: Function;
}

const renderCanvasChartOptions = (props: EditorSeriesProps, data: CHResponse) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const options = [<option key="empty" value="" />];

    data.meta.forEach((c, i) => {
        options.push(<option key={i} value={c.name}>{c.name}</option>);
    });

    const colourOptions = [<option key="empty" value="" />];

    C.COLOR_SCHEME.map((el, idx) => {
        colourOptions.push(<option key={idx} value={el}>{el}</option>);
    });

    return <div>
        <table className={"mb-4 w-full"}>
            <tbody>
                <tr>
                    <td>

                        <div className="space-y-2">
                            {props.chartType !== "pie" ? <div>
                                <H5>X axis</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.x_axis} onChange={props.setConfig.bind(this, "x_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div> : null}
                            <div>
                                <H5>Y axis</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.y_axis} onChange={props.setConfig.bind(this, "y_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>
                            {props.chartType !== "metric" && props.chartType !== "pie" ? <div>
                                <H5>Y2 axis</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.y2_axis} onChange={props.setConfig.bind(this, "y2_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div> : null}
                            <div>
                                <H5>Segment</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.segment_axis} onChange={props.setConfig.bind(this, "segment_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border-t border-b " + s.BORDER}>
            {props.chartType !== "metric" && props.chartType !== "pie" ? <thead className=" text-center  ">
                <tr>
                    <td>Series</td>
                    <td>Chart Type</td>
                    <td>Color</td>
                </tr>
            </thead> : null}
            <tbody>
                {props.chartType !== "metric" && props.chartType !== "pie" && props.tableData ? props.tableData.datasets.map((o, i) => {
                    const seriesSelectValue: string = props.tableData.datasets[i].isAreaChart ? "area" : props.tableData.datasets[i].type;
                    return (
                        <tr className="" key={i}>
                            <td className="text-center">{o.label}</td>
                            <td className="text-center">
                                <HTMLSelect fill={true} value={seriesSelectValue} onChange={((e: any) => {
                                    props.tableData.datasets[i].type = e.target.value;
                                    if (props.tableData.datasets[i].type === "area") {
                                        props.tableData.datasets[i].isAreaChart = true;
                                        props.tableData.datasets[i].type = "line";
                                    } else {
                                        props.tableData.datasets[i].isAreaChart = false;
                                    }
                                    let undefinedColor: string;
                                    if (props.tableData.datasets[i].backgroundColor === undefined) {
                                        undefinedColor = "#528CD7";
                                        const isRGBColor = undefinedColor.startsWith("#");
                                        props.tableData.datasets[i].fill = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || props.tableData.datasets[i].isAreaChart) ? true : false;
                                        props.tableData.datasets[i].backgroundColor = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || (props.tableData.datasets[i].isAreaChart && props.tableData.datasets[i].fill === true)) ? (!isRGBColor ? hexToRGB(RGBAToHexA(undefinedColor), true) : hexToRGB(undefinedColor, true)) : undefinedColor.startsWith("#") ? hexToRGB(undefinedColor) : getRGB(undefinedColor);
                                    } else {
                                        const isRGBColor = props.tableData.datasets[i].backgroundColor.startsWith("#");
                                        props.tableData.datasets[i].fill = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || props.tableData.datasets[i].isAreaChart) ? true : false;
                                        props.tableData.datasets[i].backgroundColor = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || (props.tableData.datasets[i].isAreaChart && props.tableData.datasets[i].fill === true)) ? (!isRGBColor ? hexToRGB(RGBAToHexA(props.tableData.datasets[i].backgroundColor), true) : hexToRGB(props.tableData.datasets[i].backgroundColor, true)) : props.tableData.datasets[i].backgroundColor.startsWith("#") ? hexToRGB(props.tableData.datasets[i].backgroundColor) : getRGB(props.tableData.datasets[i].backgroundColor);
                                    }
                                    props.setTableData({ ...props.tableData });
                                    props.setConfig("chart_series_config", "myseries", { ...props.tableData });
                                })}>
                                    <option key="bar" value="bar">bar</option>
                                    <option key="line" value="line">line</option>
                                    <option key="area" value="area">area</option>
                                    <option key="scatter" value="scatter">scatter</option>
                                    {/* <option key="pie" value="pie">pie</option> */}
                                </HTMLSelect>
                            </td>
                            <td className="text-center">
                                <ColorPicker darkMode={props.darkMode} color={props.tableData.datasets[i].backgroundColor} onPick={((c: any) => {
                                    let undefinedColor: string;
                                    if (props.tableData.datasets[i].backgroundColor === undefined) {
                                        // have a default blue color if no color exists
                                        undefinedColor = "#528CD7";
                                        props.tableData.datasets[i].backgroundColor = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || props.tableData.datasets[i].isAreaChart) ? hexToRGB(c, true) : undefinedColor.startsWith("#") ? hexToRGB(c) : getRGB(c);
                                    } else {
                                        props.tableData.datasets[i].backgroundColor = ((props.chartType === "area" && props.tableData.datasets[i].isAreaChart) || props.tableData.datasets[i].isAreaChart) ? hexToRGB(c, true) : props.tableData.datasets[i].backgroundColor.startsWith("#") ? hexToRGB(c) : getRGB(c);
                                    }
                                    props.setTableData({ ...props.tableData });
                                    props.setConfig("chart_series_config", "myseries", { ...props.tableData });
                                })} />
                            </td>
                        </tr>
                    );
                }) : null}
            </tbody>
        </table>
    </div>;
};

const renderPieChartOptions = (props: EditorSeriesProps, data: CHResponse) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;

    const options = [<option key="empty" value="" />];

    data.meta.forEach((c, i) => {
        options.push(<option key={i} value={c.name}>{c.name}</option>);
    });

    return <div>
        <table className={"mb-4 w-full"}>
            <tbody>
                <tr>
                    <td>
                        <div className="space-y-2">
                            <div>
                                <H5>Y axis</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.y_axis} onChange={props.setConfig.bind(this, "y_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>
                            <div>
                                <H5>Segment</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.segment_axis} onChange={props.setConfig.bind(this, "segment_axis")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>
                            <div>
                                <H5>Color scheme</H5>
                                <div>
                                    <ColorSpectrumPreview spectrum={props.config.pie_color_scheme === "" ? "blues" : props.config.pie_color_scheme} palette={C.PIE_CHART_COLORS} />
                                </div>
                                <HTMLSelect fill={true} value={props.config.pie_color_scheme} onChange={((e: any) => {
                                    props.setConfig("pie_color_scheme", e.target.value);
                                    props.tableData.datasets[0].backgroundColor = C.PIE_CHART_COLORS[e.target.value];
                                    props.setTableData({ ...props.tableData });
                                    props.setConfig("chart_series_config", "myseries", { ...props.tableData });
                                })}>
                                    <option value="blues">Blues</option>
                                    <option value="greens">Greens</option>
                                    <option value="oranges">Oranges</option>
                                    <option value="purples">Purples</option>
                                    <option value="reds">Reds</option>
                                    <option value="rdylbu">Red-Yellow-Blue</option>
                                    <option value="spectral">Spectral</option>
                                    <option value="cividis">Cividis</option>
                                    <option value="turbo">Turbo</option>
                                    <option value="rdylgn">Red-Yellow-Green</option>
                                    <option value="plasma">Plasma</option>
                                    <option value="puor">Purple-Orange</option>
                                    <option value="rdbu">Red-Blue</option>
                                    <option value="viridis">Viridis</option>
                                </HTMLSelect>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border-t border-b " + s.BORDER}>
            <thead className=" text-center  ">
                <tr>
                    <td>Label</td>
                    <td>Color</td>
                </tr>
            </thead>
            <tbody>
                {props.tableData ? props.tableData.labels.map((o, i) => {
                    return (
                        <tr className="" key={i}>
                            <td className="text-center">{o}</td>
                            <td className="text-center">
                                <ColorPicker darkMode={props.darkMode} color={!Array.isArray(props.tableData.datasets[0].backgroundColor) ? props.tableData.datasets[0].backgroundColor : props.tableData.datasets[0].backgroundColor[i]} onPick={((c: any) => {
                                    if (!Array.isArray(props.tableData.datasets[0].backgroundColor)) {
                                        props.tableData.datasets[0].backgroundColor = c;
                                        if (props.chartType === "pie") {
                                            C.PIE_CHART_COLORS[props.config.pie_color_scheme][i] = c;
                                        }
                                    } else {
                                        props.tableData.datasets[0].backgroundColor[i] = c;
                                        C.PIE_CHART_COLORS[props.config.pie_color_scheme][i] = c;
                                    }
                                    props.setTableData({ ...props.tableData });
                                    props.setConfig("chart_series_config", "myseries", { ...props.tableData });
                                })} />
                            </td>
                        </tr>
                    );
                }) : null}
            </tbody>
        </table>
    </div>;
};

const renderCohortChartOptions = (props: EditorSeriesProps, data: CHResponse) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    // const rows = data.meta.map((c, i) => {
    //     return <tr key={i}>
    //         <td style={{ verticalAlign: "middle", textAlign: "center" }}>{c.name}</td>
    //     </tr>;
    // });

    const options = [<option key="empty" value="" />];

    data.meta.forEach((c, i) => {
        options.push(<option key={i} value={c.name}>{c.name}</option>);
    });


    return <div>
        <H4>Cohort Column Options</H4>

        <table className="mb-4 w-full">
            <tbody>
                <tr>

                    <td>

                        <div className="space-y-2">
                            <div>
                                <H5>Cohort</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.cohort_cohort_column} onChange={props.setConfig.bind(this, "cohort_cohort_column")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>

                            <div>
                                <H5>Pivot</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.cohort_pivot_column} onChange={props.setConfig.bind(this, "cohort_pivot_column")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>


                            <div>
                                <H5>Data</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.cohort_data_column} onChange={props.setConfig.bind(this, "cohort_data_column")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div>

                            {/* <div>
                                <H5>Size</H5>
                                <div>
                                    <HTMLSelect fill={true} value={props.config.cohort_size_column} onChange={props.setConfig.bind(this, "cohort_size_column")}>
                                        {options}
                                    </HTMLSelect>
                                </div>
                            </div> */}

                            <div>
                                <H5>Color scheme</H5>
                                <div>
                                    <ColorSpectrumPreview spectrum={props.config.cohort_color_scheme === "" ? "greens" : props.config.cohort_color_scheme} palette={C.QUANT_COLOR_PALETTES} />
                                </div>
                                <HTMLSelect value={props.config.cohort_color_scheme} onChange={props.setConfig.bind(this, "cohort_color_scheme")} >
                                    <option value="blues">Blues</option>
                                    <option value="greens">Greens</option>
                                    <option value="oranges">Oranges</option>
                                    <option value="purples">Purples</option>
                                    <option value="reds">Reds</option>
                                    <option value="viridis">Viridis</option>
                                    <option value="ylgn">Yellow-Green</option>
                                    <option value="ylgnbu">Yellow-Green-Blue</option>

                                    <option value="blorbr">Yellow-Orange-Brown</option>
                                    <option value="ylorrd">Yellow-Orange-Red</option>
                                    <option value="rdylbu">Red-Yellow-Blue Diverging</option>
                                    <option value="rdylgn">Red-Yellow Green Diverging</option>
                                </HTMLSelect>
                            </div>

                            <div>
                                <Checkbox label="Color scheme reversed" checked={props.config.cohort_color_scheme_reversed} onChange={props.setConfig.bind(this, "cohort_color_scheme_reversed")} style={{ marginBottom: "0" }} />
                            </div>

                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        {/* <table className={"w-full table bp4-html-table bp4-html-table-bordered bp4-html-table-striped border " + s.BORDER}>
            <thead>
                <tr>
                    <th>Column</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table> */}
    </div >;
};

const renderTableChartOptions = (props: EditorSeriesProps, data: CHResponse) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    const rows = data.meta.map((c, i) => {
        const format_value = props.config.table_column_format[c.name] || "auto",
            alignment = props.config.table_column_alignment[c.name] || "left",
            hide = props.config.table_column_hide[c.name] || false,
            width = props.config.table_column_width[c.name] || "",
            display = props.config.table_column_display[c.name] || "",
            currency_prefix = props.config.table_column_currency[c.name] || "usd",
            decimals = props.config.table_column_decimals[c.name] || false,
            csum = props.config.table_column_total[c.name] || false;

        return <tr key={i}>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>{c.name}</td>

            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <HTMLSelect value={format_value} onChange={props.setConfig.bind(this, "table_column_format", c.name)} >
                    <option value="auto">Auto (default) </option>
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="datetime">Date / Time</option>
                    <option value="scientific">Scientific</option>
                </HTMLSelect>
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <InputGroup disabled={format_value === "auto" ? true : false} value={decimals} placeholder="" type="number" onChange={props.setConfig.bind(this, "table_column_decimals", c.name)} />
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                {
                    (() => {
                        if (format_value === "currency") {
                            return <HTMLSelect value={currency_prefix} onChange={props.setConfig.bind(this, "table_column_currency", c.name)} >
                                {
                                    Object.keys(F.CURRENCY).map((e, i) => {
                                        return <option key={i} value={e}>{F.CURRENCY[e]}</option>;
                                    })
                                }
                            </HTMLSelect>;
                        } else {
                            return <span />;
                        }
                    })()
                }

            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <InputGroup value={display} onChange={props.setConfig.bind(this, "table_column_display", c.name)} />
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <InputGroup value={width} onChange={props.setConfig.bind(this, "table_column_width", c.name)} />
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <HTMLSelect value={alignment} onChange={props.setConfig.bind(this, "table_column_alignment", c.name)}   >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </HTMLSelect>
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <Checkbox value={hide} onChange={props.setConfig.bind(this, "table_column_hide", c.name)} style={{ marginBottom: "0" }} />
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                <Checkbox value={csum} onChange={props.setConfig.bind(this, "table_column_total", c.name)} style={{ marginBottom: "0" }} />
            </td>
        </tr>;
    });

    return <div>
        <H4>Table Column Options</H4>
        <table className={"w-full table bp4-html-table bp4-html-table-bordered bp4-html-table-striped border " + s.BORDER}>
            <thead>
                <tr>
                    <th>Column</th>
                    <th>Format</th>
                    <th>Decimals</th>
                    <th>Currency</th>
                    <th>Format string <Tooltip2 className={Classes.TOOLTIP2_INDICATOR} content={<span>Formatting help</span>} >💡</Tooltip2></th>
                    <th>Width</th>
                    <th>Alignment</th>
                    <th>Hide</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </div>;
};

const EditorSeries = (props: EditorSeriesProps) => {

    return props.maybeData.match({
        None: () => <div className="font-light">Hit "Run" to see results.</div>,
        Some: (data) => {
            if (data.data === undefined) {
                return (
                    <>Results failed. Please try another query</>
                );
            }
            if (props.editorState !== EditorState.FAILURE && props.editorState !== EditorState.NO_DATA) {
                switch (props.chartType) {
                    case "table":
                        return renderTableChartOptions(props, data.data);
                    case "cohort":
                        return renderCohortChartOptions(props, data.data);
                    case "metric":
                    case "bar":
                    case "line":
                    case "area":
                    case "scatter":
                        return renderCanvasChartOptions(props, data.data);
                    case "pie":
                        return renderPieChartOptions(props, data.data);
                    case "image":
                        return;
                    default:
                        throw new Error("handle me");
                }
            } else {
                if (props.editorState === EditorState.NO_DATA) {
                    return (
                        <>No results to be found</>
                    );
                } else {
                    return (
                        <>Results failed. Please try another query</>
                    );
                }
            }
        }
    });
};

export default EditorSeries;
