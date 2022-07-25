import React, { useState, useEffect, FC, useMemo, useRef } from "react";

import { Option } from "../helpers/option";

import numeral from "numeraljs";
import { AVAILABLE_CHARTS, CHAIN_ID_MAP_r, CHResponse, EditorState } from "./common";
import * as C from "./colors";
import { defaultChartConfig, ChartConfig } from "../components/charts/ChartConfig";
import { ChartData, ChartDataSets, FormatTableDataItems } from "../components/node-comps/EditorSeries";
import { Chain, ChartInDB, Group, User } from "./api";
import { Icon } from "@blueprintjs/core";
import moment from "moment";

import { EmptyState } from "../components/charts/CanvasChart";
import { FILLER } from "./filler";
import strings from "./strings";

export const COUNT_FORMAT = "0,0a";
export const NUMBER_FORMAT = "0,0.00";
export const CURRENCY_FORMAT = "0,0.00a";
export const PERCENTAGE_FORMAT = "0.00%";
export const DATETIME_FORMAT = "yyyy-MM-dd hh:mm:ss";
export const ETH_FORMAT = "0.00a";
export const ETH_4_FORMAT = "0.0000a";
export const SYMBOL_ETH = "Ξ";
export const GB_FORMAT = "0.00b";

import SSF = require("ssf");
import { TimeseriesPipeline } from "./TimeseriesPipeline";
import { Avatar } from "../components/lipstick";

export enum FORMAT {
    PERC, CURR_ETH, CURR_USD, TEXT, DATETIME, CHAIN, LINK, COUNT
}

const F_D = (x: any) => {
    return numeral(x).format(CURRENCY_FORMAT);
};
const F_E = (x: any) => {
    return numeral(x).format(ETH_4_FORMAT);
};

export const F_G = (x: any) => {
    return numeral(x).format(GB_FORMAT);
};

export const F = (x: any, format: FORMAT) => {
    switch (format) {
        case FORMAT.CURR_USD:
            return F_D(x);
        case FORMAT.COUNT:
            return numeral(x).format(COUNT_FORMAT);
        case FORMAT.CURR_ETH:
            return numeral(x).format(ETH_FORMAT);
        default:
            return x;
    }
};
export const value_format = (x: any, format: string, decimals: number, currencyType: string | undefined, display?: string | number | undefined) => {

    if (x === undefined) {
        return;
    }

    if (isNaN(x)) {
        return x.toString();
    }

    switch (format) {
        case "number":
            try {

                if (display !== undefined) {
                    return isNaN(decimals) ? SSF.format(display || "#,##0", Number(x)) : decimals === 0 ? SSF.format(display || "#,##0", Number(x)) : SSF.format(display || "#,##0." + "0".repeat(decimals), Number(x));
                } else {
                    return isNaN(decimals) ? SSF.format("#,##0", Number(x)) : decimals === 0 ? SSF.format("#,##0", Number(x)) : SSF.format("#,##0." + "0".repeat(decimals), Number(x));
                }
            } catch (err) {
                if (display !== undefined) {
                    return isNaN(decimals) ? SSF.format(display || "#,##0", Number(x)) : decimals === 0 ? SSF.format(display || "#,##0", Number(x)) : SSF.format(display || "#,##0." + "0".repeat(decimals), Number(x));
                } else {
                    return isNaN(decimals) ? SSF.format("#,##0", Number(x)) : decimals === 0 ? SSF.format("#,##0", Number(x)) : SSF.format("#,##0." + "0".repeat(decimals), Number(x));
                }
            }
        case "percentage":
            try {
                if (display !== undefined) {
                    return isNaN(decimals) ? SSF.format(display || "#,##0%", Number(x)) : decimals === 0 ? SSF.format(display || "#,##0%", Number(x)) : SSF.format(display || "#,##0." + "0".repeat(decimals) + "%", Number(x));
                } else {
                    return isNaN(decimals) ? SSF.format("#,##0%", Number(x)) : decimals === 0 ? SSF.format("#,##0%", Number(x)) : SSF.format("#,##0." + "0".repeat(decimals) + "%", Number(x));
                }
            } catch (err) {
                if (display !== undefined) {
                    return isNaN(decimals) ? SSF.format(display || "#,##0%", Number(x)) : decimals === 0 ? SSF.format(display || "#,##0%", Number(x)) : SSF.format(display || "#,##0." + "0".repeat(decimals) + "%", Number(x));
                } else {
                    return isNaN(decimals) ? SSF.format("#,##0%", Number(x)) : decimals === 0 ? SSF.format("#,##0%", Number(x)) : SSF.format("#,##0." + "0".repeat(decimals) + "%", Number(x));
                }
            }
        case "currency":
            try {
                const setFormat = isNaN(decimals) ? "#,##0.00" : decimals === 0 ? "#,##0" : "#,##0." + "0".repeat(decimals);
                if (display !== undefined) {
                    return currencyType !== undefined ? currencyType + SSF.format(display || setFormat, Number(x)) : SSF.format(display || "$#.##0.00", Number(x));
                } else {
                    return currencyType !== undefined ? currencyType + SSF.format(setFormat, Number(x)) : SSF.format("$" + setFormat, Number(x));
                }
            } catch (err) {
                const setFormat = isNaN(decimals) ? "#,##0.00" : decimals === 0 ? "#,##0" : "#,##0." + "0".repeat(decimals);
                return currencyType + SSF.format(display || setFormat, Number(x));
            }
        case "scientific":
            if (display !== undefined) {
                const setFormat: string = isNaN(decimals) ? "#.##E+0" : decimals === 0 ? "0.E+0" : "#." + "0".repeat(decimals) + "E+0";
                return SSF.format(display || setFormat, Number(x));
            } else {
                const setFormat: string = isNaN(decimals) ? "#.##E+0" : decimals === 0 ? "0.E+0" : "#." + "0".repeat(decimals) + "E+0";
                return SSF.format(setFormat, Number(x));
            }
        default:
            return x.toString();
    }
};

export const timestampDisplayFormats: any = {
    millisecond: "h:mm:ss.SSS a", // 11:20:01.123 AM,
    second: "h:mm:ss a", // 11:20:01 AM
    minute: "h:mm a", // 11:20 AM
    hour: "ha", // ha MMM d, yyyy // 5PM
    day: "MMM d, yyyy", // Sep 4, 2017
    week: "'week' ww - yyyy", // week 46 - 2022, Week 46, or maybe "[W]WW - YYYY" ?
    month: "MMM yyyy", // Sept 2015
    quarter: "QQQ - yyyy", // Q3
    year: "yyyy" // 2015
};


export const renderTruncAddress = (addr: string) => {
    if (addr && addr) {
        const a = addr.slice(0, 6),
            b = addr.slice(38, 42);

        return `${a}..${b}`;
    } else {
        return addr;
    }
};

export const CURRENCY = {
    usd: "$",
    eur: "€",
    inr: "₹",
    pound: "£"
};


const NormalizePercentage = (res: any, axises): Array<{ x: any; y: string; innerkey: any }> => {
    const axies: Array<{ x: any; y: string; innerkey: any }> = [];
    Object.keys(res).map((e: string) => {
        // eslint-disable-next-line radix
        const sumall = res[e].map((item) => item[axises.yAxis]).reduce((prev: string, curr: string) => parseInt(prev) + parseInt(curr));
        res[e].forEach((item: any) => {
            axies.push({
                "x": item[axises.xAxis],
                "y": ((item[axises.yAxis] / sumall) * 100).toFixed(2),
                "innerkey": item[axises.segmentAxis]
            });
        });
    });
    return axies;
};

const GroupBy = (xs: any, f: any) => {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
};

export const getRGB = (rgbValue: string) => {

    if (rgbValue === undefined) {
        return rgbValue;
    }

    const match = rgbValue.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? "rgb(" + match[1] + ", " + match[2] + ", " + match[3] + ")" : rgbValue;
};

export const RGBAToHexA = (rbga: string) => {

    let r: string, g: string, b: string;
    const match = rbga.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    if (match) {
        r = parseInt(match[1], 10).toString(16);
        g = parseInt(match[2], 10).toString(16);
        b = parseInt(match[3], 10).toString(16);

        if (r.length == 1) {
            r = "0" + r;
        }
        if (g.length == 1) {
            g = "0" + g;
        }
        if (b.length == 1) {
            b = "0" + b;
        }
        return "#" + r + g + b;
    }
};

export const hexToRGBA = (hex: string, alpha = 1) => {
    if (alpha == null) {
        alpha = 1;
    }

    const chars = hex.slice(1).split("");

    if (chars.length === 3) {
        const triple = chars.map((el: string) => parseInt(`${el}${el}`, 16));
        return `rgba(${triple.join(",")},${alpha})`;
    } else if (chars.length === 6) {
        const triple: number[] = [];
        for (let i = 0; i < chars.length; i += 2) {
            triple.push(parseInt(`${chars[i]}${chars[i + 1]}`, 16));
        }
        return `rgba(${triple.join(",")},${alpha})`;
    }

    return hex;
};

export const hexToRGB = (h: any, needAlpha = false) => {
    let r: any = 0, g: any = 0, b: any = 0;

    if (!h) {
        return "rgb(75, 192, 192, 0.5)";
    }

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    if (needAlpha) {
        return "rgb(" + +r + "," + +g + "," + +b + ", 0.3" + ")";
    }
    return "rgb(" + +r + "," + +g + "," + +b + ")";
};

// export const HandleCubeFormat = (data) => {
//     const axises = { xAxis: data.xAxis, yAxis: data.yAxis, segmentAxis: data.segment };

//     return {
//         type: "SQL-GRAPH",
//         title: data.title,
//         subtitle: data.subtitle,
//         chartType: data.chartType,
//         tableData: FormatTableData({
//             data: [...data.items],
//             meta: [],
//             rows: 0,
//             rows_before_limit_at_least: 0,
//             statistics: undefined
//         }, axises, false, false, true, true, "blues", defaultChartConfig().chart_horizontal),
//         config: defaultChartConfig(),
//         axises: axises,
//     };
// };

export const FormatTableData = (maybeData: CHResponse, axises, chart: ChartConfig, tableData: any, firstPass: boolean, firstPassSingle: boolean, spectrum: string, chartType?: string, switchedChartType?: boolean) => {
    let data: ChartData = {
        labels: [],
        datasets: [],
    };

    maybeData.data.sort(function(a, b) {
        return Date.parse(a[axises.xAxis]) - Date.parse(b[axises.xAxis]);
    });

    let filterDatesData: any = [];
    if (chart.x_axis_fill_empty_dates && chartType !== "pie") {
        const copy = maybeData.data;
        const timeseriesPipeline = new TimeseriesPipeline(copy.slice(), axises.xAxis, true);
        filterDatesData = timeseriesPipeline.filledDates;
    }

    const xLabels: any[] = [];
    const yLabels: any[] = [];
    const y2Labels: any[] = [];
    const secondYAxis: Boolean = axises.y2Axis !== "" ? true : false;
    let outOfBounds: Boolean = false;
    let notEqualToPrevTableData: Boolean = false;

    if (chartType === "pie" && axises.yAxis !== "") {
        chart.y2_axis = "";
        chart.x_axis = "";
        chart.chart_proportional = false;
        chart.chart_horizontal = false;
        let total = 0;
        const yAxis = axises.yAxis;

        if (axises.segmentAxis !== "") {
            const axies: Array<{ segment: any; segmentTotal: any }> = [];
            const result = GroupBy(maybeData.data, (c: { [x: string]: any }) => c[axises.segmentAxis]);
            const uniqueKeys = Object.keys(result);
            // eslint-disable-next-line guard-for-in
            for (const key in uniqueKeys) {
                let segmentTotal = 0;
                if (key !== "undefined" && key !== undefined) {
                    result[uniqueKeys[key]].forEach((e) => {
                        segmentTotal += Number(e[yAxis]);
                    });
                    axies.push({ "segment": uniqueKeys[key], "segmentTotal": segmentTotal });
                }
            }

            axies.sort(function(a, b) {
                return b["segmentTotal"] - a["segmentTotal"];
            });

            axies.forEach((e) => {
                total += Number(e["segmentTotal"]);
            });

            // eslint-disable-next-line guard-for-in
            for (const obj in axies) {
                xLabels.push(axies[obj].segment);
                yLabels.push(axies[obj].segmentTotal);
            }

            let topXLabels: Array<String> = [];
            let topYLabels: Array<number> = [];
            let othersYLabels: number;
            if (chart.pie_top_x_legends) {
                if (xLabels.length > chart.pie_top_x_value) {
                    const sortedXLabels = xLabels.sort((a, b) => yLabels[xLabels.indexOf(b)] - yLabels[xLabels.indexOf(a)]);
                    const sortedYLabels = yLabels.sort((a, b) => b - a);
                    topXLabels = sortedXLabels.filter((el, index) => index < chart.pie_top_x_value);
                    topYLabels = sortedYLabels.filter((el, index) => index < chart.pie_top_x_value);
                    if (chart.pie_top_x_value < sortedYLabels.length) {
                        othersYLabels = sortedYLabels.slice(chart.pie_top_x_value, sortedYLabels.length).reduce((a, b) => a += b, 0);
                        topXLabels.push("Others");
                        topYLabels.push(othersYLabels);
                    }
                }
            }

            data = {
                labels: topXLabels.length !== 0 ? topXLabels : xLabels,
                datasets: [{
                    type: "pie",
                    label: axises.segmentAxis,
                    data: topYLabels.length !== 0 ? topYLabels : yLabels,
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined ? C.PIE_CHART_COLORS[chart.pie_color_scheme] : C.PIE_CHART_COLORS[spectrum],
                    // : C.PRESET_COLOR_MAP["light-blue"],
                    hoverOffset: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0 && tableData.datasets[0].type === "pie"
                        ? 10 : 0,
                    borderColor: "#fff",
                }]
            };

            data.datasets.filter((e) => {
                if (chartType === "pie") {
                    e.type = "pie";
                    e.hoverOffset = 10;
                    e.borderColor = "#fff";
                }
            });

            return data;

        }

        // eslint-disable-next-line guard-for-in
        for (const obj in maybeData.data) {
            total += Number(maybeData.data[obj][axises.yAxis]);
        }
        xLabels.push(axises.yAxis);
        yLabels.push(total);

        data = {
            labels: xLabels,
            datasets: [{
                type: "pie",
                label: axises.yAxis,
                data: yLabels,
                // backgroundColor: firstPassSingle && tableData.datasets === undefined
                //     ? tableData.datasets[0].backgroundColor
                //     : C.QUANT_COLOR_PALETTES[spectrum][0],
                backgroundColor: !firstPassSingle && tableData.datasets !== undefined ? C.PIE_CHART_COLORS[chart.pie_color_scheme][0] : C.PIE_CHART_COLORS[spectrum][0],
                // : C.PRESET_COLOR_MAP["light-blue"],
                hoverOffset: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0 && tableData.datasets[0].type === "pie"
                    ? 10 : 0,
                borderColor: "#fff",
            }]
        };

        if (chartType === "pie") {
            data.datasets[0].type = "pie";
            data.datasets[0].fill = false;
            data.datasets[0].hoverOffset = 10;
            data.datasets[0].borderColor = "#fff";
        }

        return data;

    } else if (axises.xAxis !== "" && axises.yAxis !== "" && axises.segmentAxis === "") {

        // if (chartType === "pie") {
        //     secondYAxis = false;
        //     chart.y2_axis = "";
        //     chart.x_axis = "";
        // }
        const flatResults = filterDatesData.length !== 0 ? filterDatesData : maybeData.data;
        // eslint-disable-next-line guard-for-in
        for (const obj in flatResults) {
            xLabels.push(flatResults[obj][axises.xAxis]);
            if (chart.chart_proportional && !secondYAxis) {

                yLabels.push((flatResults[obj][axises.yAxis] / flatResults[obj][axises.yAxis]) * 100);
            } else if (secondYAxis && chart.y2_axis_percent) {
                yLabels.push(flatResults[obj][axises.yAxis]);
                y2Labels.push(flatResults[obj][axises.y2Axis] * 100);
            } else if (secondYAxis) {
                y2Labels.push(flatResults[obj][axises.y2Axis]);
                yLabels.push(flatResults[obj][axises.yAxis]);
            } else {
                yLabels.push(flatResults[obj][axises.yAxis]);
            }
        }

        if (secondYAxis && chart.chart_horizontal) {
            const isRGBColor = !firstPassSingle && tableData && tableData.datasets.length !== 0 ? !tableData.datasets[0].backgroundColor.startsWith("#") : false;
            data = {
                labels: xLabels,
                datasets: [{
                    type: !firstPassSingle && tableData && tableData.datasets.length !== 0 ? tableData.datasets[0].type : (chartType === "area" || chartType === "line" ? "line" : chartType === "scatter" ? "scatter" : chartType === "pie" ? "pie" : "bar"),
                    axis: chart.chart_horizontal ? "y" : "x",
                    label: axises.yAxis,
                    data: yLabels,
                    yAxisID: "A",
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0
                        ? ((switchedChartType && chartType === "area") || tableData.datasets[0].isAreaChart) ? (isRGBColor ? hexToRGB(RGBAToHexA(tableData.datasets[0].backgroundColor), true) : hexToRGB(tableData.datasets[0].backgroundColor, true)) : (isRGBColor ? getRGB(tableData.datasets[0].backgroundColor) : tableData.datasets[0].backgroundColor)
                        : (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][0], true) : C.QUANT_COLOR_PALETTES[spectrum][0]),
                    fill: (switchedChartType && chartType === "area") || (tableData.datasets === undefined || (tableData.datasets !== undefined && tableData.datasets.length === 0) ? false : (tableData.datasets !== undefined && tableData.datasets.length !== 0 ? tableData.datasets[0].isAreaChart : false)) ? true : false,
                    isAreaChart: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[0].isAreaChart ? true : false) ? true : false,
                    hoverOffset: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0 && tableData.datasets[0].type === "pie"
                        ? 5 : 0,
                    // : C.PRESET_COLOR_MAP["light-blue"],
                }, {
                    type: !firstPassSingle && tableData && tableData.datasets.length > 1 ? tableData.datasets[1].type : "line",
                    axis: chart.chart_horizontal ? "y" : "x",
                    label: axises.y2Axis,
                    data: y2Labels,
                    xAxisID: "B",
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined
                        ? (tableData.datasets[1] === undefined ? (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][1], true) : C.QUANT_COLOR_PALETTES[spectrum][1]) : tableData.datasets[1].backgroundColor)
                        : (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][1], true) : C.QUANT_COLOR_PALETTES[spectrum][1]),
                    fill: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[1] !== undefined && tableData.datasets[1].isAreaChart) ? true : false,
                    isAreaChart: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[1] !== undefined && tableData.datasets[1].isAreaChart ? true : false) ? true : false,
                }]
            };
        } else if (secondYAxis) {
            const isRGBColor = !firstPassSingle && tableData && tableData.datasets.length !== 0 ? !tableData.datasets[0].backgroundColor.startsWith("#") : false;
            data = {
                labels: xLabels,
                datasets: [{
                    type: !firstPassSingle && tableData && tableData.datasets.length !== 0 ? tableData.datasets[0].type : (chartType === "area" || chartType === "line" ? "line" : chartType === "scatter" ? "scatter" : chartType === "pie" ? "pie" : "bar"),
                    axis: chart.chart_horizontal ? "y" : "x",
                    label: axises.yAxis,
                    data: yLabels,
                    yAxisID: "A",
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0
                        ? ((switchedChartType && chartType === "area") || tableData.datasets[0].isAreaChart) ? (isRGBColor ? hexToRGB(RGBAToHexA(tableData.datasets[0].backgroundColor), true) : hexToRGB(tableData.datasets[0].backgroundColor, true)) : (isRGBColor ? getRGB(tableData.datasets[0].backgroundColor) : tableData.datasets[0].backgroundColor)
                        : (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][0], true) : C.QUANT_COLOR_PALETTES[spectrum][0]),
                    fill: (switchedChartType && chartType === "area") || (tableData.datasets === undefined || (tableData.datasets !== undefined && tableData.datasets.length === 0) ? false : (tableData.datasets !== undefined && tableData.datasets.length !== 0 ? tableData.datasets[0].isAreaChart : false)) ? true : false,
                    isAreaChart: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets.length !== 0 && tableData.datasets[0].isAreaChart ? true : false) ? true : false,
                    hoverOffset: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0 && tableData.datasets[0].type === "pie"
                        ? 5 : 0,
                    // : C.PRESET_COLOR_MAP["light-blue"],
                }, {
                    type: !firstPassSingle && tableData && tableData.datasets.length > 1 ? tableData.datasets[1].type : "line",
                    axis: chart.chart_horizontal ? "y" : "x",
                    label: axises.y2Axis,
                    data: y2Labels,
                    yAxisID: "B",
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined
                        ? (tableData.datasets[1] === undefined ? (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][1], true) : C.QUANT_COLOR_PALETTES[spectrum][1]) : tableData.datasets[1].backgroundColor)
                        : (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][1], true) : C.QUANT_COLOR_PALETTES[spectrum][1]),
                    fill: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[1] !== undefined && tableData.datasets[1].isAreaChart) ? true : false,
                    isAreaChart: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[1] !== undefined && tableData.datasets[1].isAreaChart ? true : false) ? true : false,
                }]
            };
        } else {
            data = {
                labels: xLabels,
                datasets: [{
                    type: !firstPassSingle && tableData ? tableData.datasets[0].type : (chartType === "area" || chartType === "line" ? "line" : chartType === "scatter" ? "scatter" : chartType === "pie" ? "pie" : "bar"),
                    axis: chart.chart_horizontal ? "y" : "x",
                    label: axises.yAxis,
                    data: yLabels,
                    backgroundColor: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets.length !== 0
                        ? tableData.datasets[0].backgroundColor
                        : C.QUANT_COLOR_PALETTES[spectrum][0],
                    // : C.PRESET_COLOR_MAP["light-blue"],
                    fill: (switchedChartType && chartType === "area") || (tableData && tableData.datasets !== undefined && tableData.datasets.length !== 0 ? tableData.datasets[0].isAreaChart : false) ? true : false,
                    isAreaChart: (switchedChartType && chartType === "area") || (tableData.datasets !== undefined && tableData.datasets[0].isAreaChart ? true : false) ? true : false,
                    hoverOffset: !firstPassSingle && tableData.datasets !== undefined && tableData.datasets[0].type === "pie"
                        ? 5 : 0,
                }]
            };
        }

        if (!switchedChartType && !firstPassSingle) {
            return data;
        }


        if (secondYAxis) {
            if (chartType === "pie") {
                data.datasets[1].type = "pie";
                data.datasets[1].hoverOffset = 5;
                data.datasets[1].borderColor = "#fff";
            }
        }

        // force line when area chart type is selected
        if (chartType === "area" || chartType === "line") {
            if (chartType === "area") {
                data.datasets[0].isAreaChart = true;
                data.datasets[0].type = "line";
                if (data.datasets[0].type === "line" && data.datasets[0].isAreaChart) {
                    if (!Array.isArray(data.datasets[0].backgroundColor)) {
                        const isRGBColor = !Array.isArray(data.datasets[0].backgroundColor) ? !data.datasets[0].backgroundColor.startsWith("#") : null;
                        data.datasets[0].backgroundColor = isRGBColor ? hexToRGB(RGBAToHexA(data.datasets[0].backgroundColor), true) : hexToRGB(data.datasets[0].backgroundColor, true);
                    }
                    data.datasets[0].fill = true;
                }
                if (secondYAxis) {
                    data.datasets[1].isAreaChart = true;
                    data.datasets[1].type = "line";
                    if (data.datasets[1].type === "line" && data.datasets[1].isAreaChart) {
                        if (!Array.isArray(data.datasets[1].backgroundColor)) {
                            const isRGBColor = !data.datasets[1].backgroundColor.startsWith("#");
                            data.datasets[1].backgroundColor = isRGBColor ? hexToRGB(RGBAToHexA(data.datasets[1].backgroundColor), true) : hexToRGB(data.datasets[1].backgroundColor, true);
                        }
                        data.datasets[1].fill = true;
                    }
                }
            } else {
                data.datasets[0].type = "line";
                data.datasets[0].fill = false;
                data.datasets[0].isAreaChart = false;
                if (secondYAxis) {
                    data.datasets[1].type = "line";
                    data.datasets[1].fill = false;
                    data.datasets[1].isAreaChart = false;
                }
            }
        }

        if (chartType === "bar") {
            if (!Array.isArray(data.datasets[0].backgroundColor)) {
                const isRGBColor = !data.datasets[0].backgroundColor.startsWith("#");
                data.datasets[0].backgroundColor = isRGBColor ? getRGB(data.datasets[0].backgroundColor) : data.datasets[0].backgroundColor;
            }
            data.datasets[0].type = "bar";
            data.datasets[0].fill = false;
            data.datasets[0].isAreaChart = false;
            if (secondYAxis) {
                if (!Array.isArray(data.datasets[1].backgroundColor)) {
                    const isRGBColor = !data.datasets[1].backgroundColor.startsWith("#");
                    data.datasets[1].backgroundColor = isRGBColor ? getRGB(data.datasets[1].backgroundColor) : data.datasets[1].backgroundColor;
                }
                data.datasets[1].type = "bar";
                data.datasets[1].fill = false;
                data.datasets[1].isAreaChart = false;
            }
        }

        if (chartType === "scatter") {
            data.datasets[0].type = "scatter";
            data.datasets[0].fill = false;
            data.datasets[0].isAreaChart = false;
            if (secondYAxis) {
                data.datasets[1].type = "scatter";
                data.datasets[1].fill = false;
                data.datasets[1].isAreaChart = false;
            }
        }

        if (chartType === "pie") {
            data.datasets[0].type = "pie";
            data.datasets[0].fill = false;
            data.datasets[0].hoverOffset = 5;
            data.datasets[0].borderColor = "#fff";
            data.datasets[0].isAreaChart = false;
            if (secondYAxis) {
                data.datasets[1].type = "pie";
                data.datasets[1].fill = false;
                data.datasets[1].hoverOffset = 5;
                data.datasets[1].borderColor = "#fff";
                data.datasets[1].isAreaChart = false;

            }
        }

        return data;

    } else if (axises.xAxis !== "" && axises.yAxis !== "" && axises.segmentAxis !== "") {
        // segment is selected

        const flatResults = filterDatesData.length !== 0 ? filterDatesData : maybeData.data;

        const axies: Array<{ x: any; y: string; innerkey: any }> = [];
        if (axises.segmentAxis !== "") {
            const result = GroupBy(flatResults, (c: { [x: string]: any }) => c[axises.xAxis]);
            const uniqueKeys = Object.keys(result);
            for (const key in uniqueKeys) {
                if (key !== "undefined" && key !== undefined) {
                    const currentKeyValues = GroupBy(result[uniqueKeys[key]], (c: { [x: string]: any }) => c[axises.segmentAxis]);
                    const innerUniqueKeys = Object.keys(currentKeyValues);
                    for (const innerKey in currentKeyValues) {
                        if (innerKey !== "undefined" && innerKey !== undefined) {
                            // access each inner key value pair
                            // eslint-disable-next-line radix
                            let sumall = currentKeyValues[innerKey].map((item: any) => item[axises.yAxis]).reduce((prev: string, curr: string) => parseInt(prev) + parseInt(curr));
                            if (sumall === null) {
                                sumall = "0";
                            }
                            axies.push({ "x": uniqueKeys[key], "y": sumall, "innerkey": innerKey });
                        }
                    }
                }
            }

            let axiesPercentage: Array<{ x: any; y: string; innerkey: any }> = [];
            if (chart.chart_proportional) {
                axiesPercentage = NormalizePercentage(result, axises);
            }

            const finalResult = GroupBy(chart.chart_proportional ? axiesPercentage : axies, (c: { innerkey: any }) => c.innerkey);
            for (const key in finalResult) {
                if (key !== "undefined" && key !== undefined) {
                    const removedInnerKey = finalResult[key].map(({ innerkey, ...rest }) => {
                        return rest;
                    });
                    finalResult[key] = removedInnerKey;
                }
            }

            if (!firstPass) {
                const myKeys = Object.keys(finalResult);
                for (const key in myKeys) {
                    if (key !== "undefined" && key !== undefined) {
                        const holdPrevLabelKeys = tableData && tableData.datasets.length !== 0 ? tableData.datasets.map((e) => {
                            return e.label;
                        }) : [];
                        try {
                            if (myKeys.length < tableData.datasets.length || !myKeys.every((val, index) => val === holdPrevLabelKeys[index])) {
                                notEqualToPrevTableData = true;
                                break;
                            }
                        } catch (notFound) {
                            notEqualToPrevTableData = true;
                            break;
                        }
                        try {
                            if (tableData.datasets) {
                                // force line when area chart type is selected
                                if (chartType === "line" && switchedChartType) {
                                    tableData.datasets[key].type = "line";
                                    tableData.datasets[key].isAreaChart = false;
                                }
                                if (chartType === "area" && switchedChartType) {
                                    tableData.datasets[key].type = "line";
                                    tableData.datasets[key].isAreaChart = true;
                                }
                                if (chartType === "scatter" && switchedChartType) {
                                    tableData.datasets[key].type = "scatter";
                                    tableData.datasets[key].isAreaChart = false;
                                }
                                if (chartType === "bar" && switchedChartType) {
                                    tableData.datasets[key].type = "bar";
                                    tableData.datasets[key].isAreaChart = false;
                                }
                                if (chartType === "pie" && switchedChartType) {
                                    tableData.datasets[key].type = "pie";
                                    tableData.datasets[key].borderColor = "#fff";
                                    tableData.datasets[key].hoverOffset = 5;
                                    tableData.datasets[key].isAreaChart = false;
                                }
                                tableData.datasets[key].data = finalResult[myKeys[key]];
                                const isRGBColor = !tableData.datasets[key].backgroundColor.startsWith("#");
                                tableData.datasets[key].backgroundColor = ((switchedChartType && chartType === "area") || tableData.datasets[key].isAreaChart) ? (isRGBColor ? hexToRGB(RGBAToHexA(tableData.datasets[key].backgroundColor), true) : hexToRGB(tableData.datasets[key].backgroundColor, true)) : (isRGBColor ? getRGB(tableData.datasets[key].backgroundColor) : tableData.datasets[key].backgroundColor);
                                // tableData.datasets[key].backgroundColor = (chartType === "area" || tableData.datasets[key].isAreaChart) ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][key], true) : C.QUANT_COLOR_PALETTES[spectrum][key];
                                tableData.datasets[key].fill = (switchedChartType && chartType === "area") || tableData.datasets[key].isAreaChart ? true : false;
                                // tableData.datasets[key].backgroundColor = (chartType === "area" || tableData.datasets[key].isAreaChart) ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][key], true) : C.QUANT_COLOR_PALETTES[spectrum][key];
                                // tableData.datasets[key].fill = chartType === "area" || tableData.datasets[key].isAreaChart ? true : false;
                            }
                        } catch (notFound) {
                            outOfBounds = true;
                        }
                    }
                }
            }

            if (chart.chart_horizontal || chartType === "pie") {
                if (!firstPass && !outOfBounds && !notEqualToPrevTableData) {
                    tableData.datasets.map((e: any, idx: any) => {
                        const data = new Array(Object.keys(result).length).fill(0);
                        e.data.map((el: any, i: any) => {
                            if (Object.keys(result).indexOf(el.x) !== -1) {
                                data[Object.keys(result).indexOf(el.x)] = el.y;
                            }
                        });
                        tableData.datasets[idx].data = data;
                    });
                } else {
                    Object.entries(finalResult).map((e: any, i) => {
                        const data = new Array(Object.keys(result).length).fill(0);
                        e[1].map((el: any) => {
                            if (Object.keys(result).indexOf(el.x) !== -1) {
                                data[Object.keys(result).indexOf(el.x)] = el.y;
                            }
                        });
                        finalResult[e[0]] = data;
                    });
                }
            }

            data = {
                labels: Object.keys(result),
                datasets: !firstPass && !outOfBounds && !notEqualToPrevTableData ? tableData.datasets : Object.entries(finalResult).map((e: any, i) => ({
                    axis: chart.chart_horizontal ? "y" : "x",
                    type: tableData.datasets !== undefined && tableData.datasets[i] !== undefined ? tableData.datasets[i].type : (chartType === "area" || chartType === "line" ? "line" : chartType === "scatter" ? "scatter" : chartType === "pie" ? "pie" : "bar"),
                    label: e[0],
                    data: [...e[1].map((e: any) => {
                        return e;
                    })],
                    backgroundColor: tableData.datasets !== undefined && tableData.datasets[i] !== undefined ? tableData.datasets[i].backgroundColor : (chartType === "area" ? hexToRGB(C.QUANT_COLOR_PALETTES[spectrum][i], true) : C.QUANT_COLOR_PALETTES[spectrum][i]),
                    fill: tableData.datasets !== undefined && tableData.datasets[i] !== undefined ? tableData.datasets[i].fill : (chartType === "area" ? true : false),
                    isAreaChart: tableData.datasets !== undefined && tableData.datasets[i] !== undefined ? tableData.datasets[i].isAreaChart : (chartType === "area" ? true : false),
                }))
            };

            data.datasets.filter((e) => {
                if (chartType === "area" && switchedChartType) {
                    e.isAreaChart = true;
                    e.fill = true;
                }
                if (e.isAreaChart) {
                    e.fill = true;
                } else {
                    e.fill = false;
                }
                if (chartType === "pie") {
                    e.type = "pie";
                    e.hoverOffset = 5;
                    e.borderColor = "#fff";
                }

            });

            return data;

        }
    }

};

export const renderChartTitle = (chart: ChartInDB) => {
    const title = chart.display_name.length === 0
        ? (`Unnamed ${chart.chart_type} chart`)
        : chart.display_name;

    return <span><Icon icon={AVAILABLE_CHARTS[chart.chart_type]} /> {title} </span >;
};

export const renderUser = (user: User) => {
    return <span ><Avatar display_name={user.display_name} /> </span>;
};

export const renderUserForApps = (group: Group) => {
    return <span>{group.name}</span>;
};

export const ADJECTIVES = [
    "adorable",
    "beautiful",
    "bright",
    "calm",
    "delightful",
    "enchanting",
    "friendly",
    "gorgeous",
    "glorious",
    "lovely",
    "perfect",
    "precious",
    "shiny",
    "sparkling",
    "super",
    "wicked"
];

export const generateAdjective = () => {
    const n = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    return n[0].toUpperCase() + n.slice(1);
};

export const generateSubtitle = (currentDateRange: string, currentChainNames: string[], currentDateAgg: string, displayChainFilterSubtitle: boolean, displayDateAggSubtitle: boolean, displayDateRangeSubtitle: boolean, chains: Chain[]) => {
    let currentDateRangeSubtitle = "";

    switch (currentDateRange) {
        case "last_1h":
            currentDateRangeSubtitle = "Last 1 hour";
            break;
        case "last_24h":
            currentDateRangeSubtitle = "Last 24 hours";
            break;
        case "last_7d":
            currentDateRangeSubtitle = "Last 7 days";
            break;
        case "this_month":
            currentDateRangeSubtitle = "This month";
            break;
        case "last_30days":
            currentDateRangeSubtitle = "Last 30 days";
            break;
        case "last_quarter":
            currentDateRangeSubtitle = "Last quarter";
            break;
        case "this_quarter":
            currentDateRangeSubtitle = "This quarter";
            break;
        case "last_year":
            currentDateRangeSubtitle = "Last year";
            break;
        case "this_year":
            currentDateRangeSubtitle = "This year";
            break;
        default:
            throw new Error("handle me :" + currentDateRange);
    }

    let buildSubtitle = "";
    let label;

    if (chains.length > 0) {
        label = currentChainNames.length === 0
            ? "Chains" :
            currentChainNames.map((v) => {
                for (const i of chains) {
                    if (v === i.chain_name) {
                        return i.chain_name_formatted;
                    }
                }
            }).join(", ");
    } else {
        label = currentChainNames.length === 0
            ? "Chains"
            : currentChainNames.map((v) => {
                return CHAIN_ID_MAP_r.get(v);
            }).join(", ");
    }
    if (displayDateRangeSubtitle) {
        buildSubtitle += currentDateRangeSubtitle + " · ";
    }

    if (displayDateAggSubtitle) {
        buildSubtitle += ("Aggregated " + currentDateAgg) + " · ";
    }

    if (displayChainFilterSubtitle) {
        if (label !== "") {
            buildSubtitle += label + " · ";
        } else {
            buildSubtitle += "Chains · ";
        }
    }

    buildSubtitle = buildSubtitle.trim();
    buildSubtitle = buildSubtitle.slice(0, -1);
    buildSubtitle = buildSubtitle.trim();

    return buildSubtitle;

};

export const generateTitlePrefix = (pageDisplayName: string, boardDisplayName: string, currentDateAgg: string | undefined) => {
    const agg = currentDateAgg === undefined ? "" :
        currentDateAgg.charAt(0).toUpperCase() + currentDateAgg.slice(1);

    if (boardDisplayName) {
        return `${pageDisplayName} - ${boardDisplayName} - `;
    }
    return agg;
};
