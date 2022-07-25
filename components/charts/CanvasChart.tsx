import React, { useState, useEffect, FC, useMemo, useRef } from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";
import { ChartContainerProps } from "./ChartConfig";
import { Watermark } from "./Watermark";
import ChartDataLabels from "chartjs-plugin-datalabels";
// import "chartjs-adapter-moment";
import "chartjs-adapter-date-fns";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    BarController,
    DoughnutController,
    LineController,
    PieController
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    BarController,
    DoughnutController,
    LineController,
    PieController,
    ChartDataLabels,
);

import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { generateTitlePrefix, getRGB, renderChartTitle, timestampDisplayFormats, value_format } from "../../helpers/formats";
import { TimeseriesPipeline } from "../../helpers/TimeseriesPipeline";

Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.point.borderWidth = 1;
Chart.defaults.elements.point.radius = 2;
Chart.defaults.elements.arc.borderWidth = 1;
Chart.defaults.elements.arc.hoverOffset = 1;
Chart.defaults.elements.arc.borderWidth = 0;

const CHART_HEIGHT = " h-80 ";

export const EmptyState = ({ message, darkMode }) => {
    const s = darkMode ? C.DARK : C.LIGHT;

    return <div className="grid place-items-center h-full">
        {message}
    </div>;
};

const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector("#tooltip-el");

    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.setAttribute("id", "tooltip-el");
        tooltipEl.style.background = "rgba(0, 0, 0, 0.7)";
        tooltipEl.style.borderRadius = "3px";
        tooltipEl.style.color = "white";
        tooltipEl.style.opacity = 1;
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.position = "absolute";
        tooltipEl.style.transform = "translate(-50%, 0)";
        tooltipEl.style.transition = "all .1s ease";

        const table = document.createElement("table");
        table.style.margin = "0px";

        tooltipEl.appendChild(table);
        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
};

export function CanvasChart(props: ChartContainerProps) {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    let aggregatedXInterval = "";
    props.maybeData.match({
        None: () => null,
        Some: (data) => {
            if (data.data !== undefined && data.data.data.length !== 0) {
                if (props.config.x_axis !== undefined && props.config.x_axis !== "") {
                    const timeseriesPipeline = new TimeseriesPipeline(data.data.data, props.config.x_axis);
                    aggregatedXInterval = timeseriesPipeline.detectedXIntervalAggregation;
                }
            }
        }
    });

    const toolTipFormatString = ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "hour")
        ? timestampDisplayFormats.hour : ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "day")
            ? timestampDisplayFormats.day : ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "week")
                ? timestampDisplayFormats.week : ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "month")
                    ? timestampDisplayFormats.month : ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "quarter")
                        ? timestampDisplayFormats.quarter : ((aggregatedXInterval !== "" && !props.config.x_axis_show_values) && aggregatedXInterval === "year")
                            ? timestampDisplayFormats.year : "";

    aggregatedXInterval = props.tableData && props.tableData.datasets !== undefined && props.tableData.datasets.length > 0 && props.tableData.datasets[0].type === "pie" ? "" : aggregatedXInterval;

    const options = {
        responsive: true,
        maintainAspectRatio: props.height ? false : true,
        aspectRatio: props.chartType === "pie" ? 2 : null,
        indexAxis: props.config.chart_horizontal ? "y" : "x",
        animation: {
            duration: props.focusMode ? 0 : 600
        },
        plugins: {
            legend: {
                position: "right" as const,
                display: !props.config.legend_hide,
                labels: {
                    color: s.TEXT_COLOR_RGB,
                    usePointStyle: true,
                    pointStyle: "rectRounded",
                }
            },
            filler: {
                propagate: false
            },
            title: {
                display: false,
                text: "Chart.js Bar Chart",
            },
            interaction: {
                mode: "index",
                intersect: false
                // intersect: false,
                // axis: "x",
                // mode: "nearest"
            },
            tooltip: {
                enabled: false,
                position: "nearest",

                external: (context) => {
                    const { chart, tooltip } = context;
                    const tooltipEl = getOrCreateTooltip(chart);

                    // Hide if no tooltip
                    if (tooltip.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    if (tooltip.body) {
                        const titleLines = tooltip.title || [];
                        const bodyLines = tooltip.body.map((b) => b.lines);

                        const tableHead = document.createElement("thead");

                        titleLines.forEach((title) => {
                            const tr = document.createElement("tr");
                            tr.style.borderWidth = "0";

                            const th = document.createElement("th");
                            th.style.borderWidth = "0";
                            const text = document.createTextNode(title);

                            th.appendChild(text);
                            tr.appendChild(th);
                            tableHead.appendChild(tr);
                        });
                        const tableBody = document.createElement("tbody");
                        bodyLines.forEach((body, i) => {
                            const colors = tooltip.labelColors[i];
                            const span = document.createElement("span");
                            span.style.background = colors.backgroundColor;
                            span.style.borderColor = colors.borderColor;
                            span.style.borderWidth = "2px";
                            span.style.marginRight = "10px";
                            span.style.height = "10px";
                            span.style.width = "10px";
                            span.style.display = "inline-block";

                            const tr = document.createElement("tr");
                            tr.style.backgroundColor = "inherit";
                            tr.style.borderWidth = "0";

                            const td = document.createElement("td");
                            td.style.borderWidth = "0";
                            // const split = body[0].split(":");
                            const index = body[0].lastIndexOf(":");
                            const first = body[0].slice(0, index);
                            let split = body[0].slice(index + 1);
                            const savedOriginalSplit = split.replace(/\s/g, "");
                            let total = 0;
                            if (props.chartType === "pie") {
                                // eslint-disable-next-line guard-for-in
                                for (const val in context.tooltip.dataPoints[0].dataset.data) {
                                    total += Number(context.tooltip.dataPoints[0].dataset.data[val]);
                                }
                            }

                            if (props.config.y2_axis === "" || (props.config.y2_axis !== "" && tooltip.dataPoints[0].dataset.yAxisID === "A")) {
                                let num = split.replace(/,/g, "");
                                num = props.config.chart_proportional ? num + "%" : props.chartType === "pie" ? (Math.round((Number(split.replaceAll(",", "")) / total) * 100 * 100) / 100) + "%" : value_format(num, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                                if (props.chartType === "pie") {
                                    num = num + " (" + savedOriginalSplit + ")";
                                }
                                split = num;
                            } else {
                                split = props.config.y2_axis_percent ? split + "%" : split;
                            }
                            const final = first + " : " + split;
                            body[0] = final;
                            const text = document.createTextNode(body);

                            td.className = "whitespace-nowrap";
                            td.appendChild(span);
                            td.appendChild(text);
                            tr.appendChild(td);
                            tableBody.appendChild(tr);
                        });

                        const tableRoot = tooltipEl.querySelector("table");

                        // Remove old children
                        if (tableRoot) {
                            while (tableRoot.firstChild) {
                                tableRoot.firstChild.remove();
                            }
                        }

                        // Add new children
                        tableRoot.appendChild(tableHead);
                        tableRoot.appendChild(tableBody);
                    }

                    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.left = positionX + tooltip.caretX + "px";
                    tooltipEl.style.top = positionY + tooltip.caretY + "px";
                    tooltipEl.style.font = tooltip.options.bodyFont.string;
                    tooltipEl.style.padding = tooltip.options.padding + "px " + tooltip.options.padding + "px";
                }
            },
            datalabels: props.config.chart_data_labels ? {
                display: "auto",
                formatter: (value: any, context: any) => {
                    let total = 0;
                    if (value === undefined) {
                        return;
                    }
                    const savedOriginalValue = value;
                    if (props.chartType === "pie") {
                        // eslint-disable-next-line guard-for-in
                        for (const val in context.dataset.data) {
                            total += Number(context.dataset.data[val]);
                        }
                    }
                    // return value.y;
                    if (props.config.y2_axis === "" || (props.config.y2_axis !== "" && context.dataset.yAxisID === "A")) {
                        if (isNaN(value)) {
                            return props.config.chart_proportional ? value.y + "%" : value_format(value.y, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                        }
                        value = props.config.chart_proportional ? value + "%" : props.chartType === "pie" ? (Math.round((value / total) * 100 * 100) / 100) + "%" : value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                        if (props.chartType === "pie") {
                            value = value + " (" + savedOriginalValue + ")";
                        }
                        return value;
                    } else {
                        return props.config.y2_axis_percent ? value + "%" : value;
                    }
                },
                clamp: true,
                clip: true,
                anchor: "center",
                color: s.TEXT_COLOR_RGB,
                align: "start",
                font: {
                    size: 15,
                    weight: "bold"
                }
            } : {
                display: false
            }
        },
        scales: props.config.chart_stacked && props.config.y2_axis === "" ? {
            x: props.config.chart_horizontal ? {
                stacked: true,
                suggestedMin: props.config.chart_proportional ? 0 : "",
                suggestedMax: props.config.chart_proportional ? 100 : "",
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.chart_proportional ? {
                    callback: (value) => {
                        return value + "%";
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                stacked: true,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                stacked: true,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            y: !props.config.chart_horizontal ? {
                stacked: true,
                suggestedMin: props.config.chart_proportional ? 0 : "",
                suggestedMax: props.config.chart_proportional ? 100 : "",
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.chart_proportional ? {
                    callback: (value) => {
                        return value + "%";
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                stacked: true,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                stacked: true,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            A: {
                display: false,
            },
            B: {
                display: false,
            }
        } : props.config.y2_axis !== "" ? {
            x: props.config.chart_horizontal ? {
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB,
                },
                position: "bottom",
            } : aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            A: props.config.chart_horizontal && aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                position: "left",
                // labels: props.tableData.labels ,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : !props.config.chart_horizontal ? {
                position: "left",
                // labels: props.tableData.labels ,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                position: "left",
                // labels: props.tableData.labels ,
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            B: {
                position: props.config.chart_horizontal ? "top" : "right",
                offset: false,
                suggestedMin: props.config.y2_axis_percent ? 0 : "",
                suggestedMax: props.config.y2_axis_percent ? 100 : "",
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.y2_axis_percent ? {
                    callback: (value) => {
                        return value + "%";
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            }
        } : {
            x: props.config.chart_horizontal && props.config.y2_axis === "" ? {
                suggestedMin: props.config.chart_proportional ? 0 : "",
                suggestedMax: props.config.chart_proportional ? 100 : "",
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.chart_proportional ? {
                    callback: (value) => {
                        return value + "%";
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            y: !props.config.chart_horizontal ? {
                suggestedMin: props.config.chart_proportional ? 0 : "",
                suggestedMax: props.config.chart_proportional ? 100 : "",
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : props.config.chart_proportional ? {
                    callback: (value) => {
                        return value + "%";
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "percentage" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "currency" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "scientific" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : props.config.y_axis_format === "number" ? {
                    callback: (value) => {
                        return value_format(value, props.config.y_axis_format, props.config.y_axis_decimals, props.config.y_axis_currency);
                    },
                    color: s.TEXT_COLOR_RGB
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : aggregatedXInterval !== "" && !props.config.x_axis_show_values ? {
                type: "time",
                time: {
                    unit: aggregatedXInterval !== "" && !props.config.x_axis_show_values ? aggregatedXInterval : "",
                    displayFormats: timestampDisplayFormats,
                    tooltipFormat: toolTipFormatString,
                },
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            } : {
                ticks: props.tableData && props.tableData.datasets.length !== 0 && props.tableData.datasets[0].type === "pie" ? {
                    display: false,
                } : {
                    color: s.TEXT_COLOR_RGB
                }
            },
            A: {
                display: false,
            },
            B: {
                display: false,
            }
        },
    };

    if (props.config.x_axis_title && props.config.x_axis_title.trim().length > 0) {
        options["scales"]["x"]["title"] = {
            text: props.config.x_axis_title.trim(),
            display: true,
            color: s.TEXT_COLOR_RGB
        };
    }

    if (props.config.x_axis_min && props.config.x_axis_min.trim().length > 0) {
        options["scales"]["x"]["min"] = parseFloat(props.config.x_axis_min.trim());
    }
    if (props.config.x_axis_max && props.config.x_axis_max.trim().length > 0) {
        options["scales"]["x"]["max"] = parseFloat(props.config.x_axis_max.trim());
    }

    if (props.config.y_axis_min && props.config.y_axis_min.trim().length > 0) {
        if (props.config.y2_axis !== "" && options["scales"]["A"] !== undefined) {
            options["scales"]["A"]["min"] = parseFloat(props.config.y_axis_min.trim());
        } else if (options["scales"]["y"] !== undefined) {
            options["scales"]["y"]["min"] = parseFloat(props.config.y_axis_min.trim());
        }
    }
    if (props.config.y_axis_max && props.config.y_axis_max.trim().length > 0) {
        if (props.config.y2_axis !== "" && options["scales"]["A"] !== undefined) {
            options["scales"]["A"]["max"] = parseFloat(props.config.y_axis_max.trim());
        } else if (options["scales"]["y"] !== undefined) {
            options["scales"]["y"]["max"] = parseFloat(props.config.y_axis_max.trim());
        }
    }

    if (props.config.y2_axis !== "") {
        if (props.config.y2_axis_max && props.config.y2_axis_max.trim().length > 0) {
            if (options["scales"]["B"] !== undefined) {
                options["scales"]["B"]["max"] = parseFloat(props.config.y2_axis_max.trim());
            }
        }
        if (props.config.y2_axis_min && props.config.y2_axis_min.trim().length > 0) {
            if (options["scales"]["B"] !== undefined) {
                options["scales"]["B"]["min"] = parseFloat(props.config.y2_axis_min.trim());
            }
        }
    }


    if (props.config.y_axis_title && props.config.y_axis_title.trim().length > 0) {
        if (props.config.y2_axis !== "" && options["scales"]["A"] !== undefined) {
            options["scales"]["A"]["title"] = {
                text: props.config.y_axis_title.trim(),
                display: true,
                color: s.TEXT_COLOR_RGB
            };
        } else if (options["scales"]["y"] !== undefined) {
            options["scales"]["y"]["title"] = {
                text: props.config.y_axis_title.trim(),
                display: true,
                color: s.TEXT_COLOR_RGB
            };
        }
    }

    if (props.config.y2_axis_title && props.config.y2_axis_title.trim().length > 0) {
        if (options["scales"]["B"] !== undefined) {
            options["scales"]["B"]["title"] = {
                text: props.config.y2_axis_title.trim(),
                display: true,
                color: s.TEXT_COLOR_RGB
            };
        }
    }

    if (props.config.x_axis === "" && props.chartType !== "pie") {
        return (
            <div className="h-80">
                <EmptyState message={"X axis not defined."} darkMode={props.darkMode} />
            </div>
        );
    }

    if (props.config.y_axis === "") {
        return (
            <div className="h-80">
                <EmptyState message={"Y axis not defined."} darkMode={props.darkMode} />
            </div>
        );
    }

    const chartRef = useRef<HTMLCanvasElement | null>(null);

    let myChart: any;
    const [chart, setChart] = useState();
    if (props.tableData && props.tableData.datasets) {
        props.tableData.datasets.forEach((d) => {
            if (d.type === "line" && !d.isAreaChart) {
                if (d.backgroundColor !== undefined) {
                    const isRGBColor = !d.backgroundColor.startsWith("#");
                    d.borderColor = isRGBColor ? getRGB(d.backgroundColor) : d.backgroundColor;
                }
            } else if (d.type === "line" && d.isAreaChart) {
                if (d.backgroundColor !== undefined) {
                    d.borderColor = getRGB(d.backgroundColor);
                }
                // } else if (props.chartType === "pie" && d.type === "pie") {
                //     if (d.backgroundColor !== undefined) {
                //         const isRGBColor = !d.backgroundColor.startsWith("#");
                //         d.backgroundColor = isRGBColor ? getRGB(d.backgroundColor) : d.backgroundColor;
                //     }
            } else {
                if (d.backgroundColor !== undefined && d.type !== "pie") {
                    d.borderColor = getRGB(d.backgroundColor);
                }
            }
        });
    }


    useEffect(() => {
        if (props.config.chart_series_config["myseries"]) {
            if (props.setTableData !== undefined) {
                props.setTableData(props.config.chart_series_config["myseries"]);
            }
        }

        if (props.tableData) {
            myChart = new Chart(chartRef.current, {
                type: props.chartType === "pie" ? "pie" : "line",
                data: props.tableData,
                options: (options) as any
            });
            setChart(myChart);
        }

        return () => {
            myChart.destroy()
          }
    }, [props.refresh]);

    useEffect(() => {
        if (props.chartType === "pie" && typeof chart !== "undefined") {
            props.config.chart_series_config["myseries"] = props.tableData;
            chart.destroy();
            myChart = new Chart(chartRef.current, {
                type: "pie",
                data: props.tableData,
                options: (options) as any
            });
            setChart(myChart);
        } else if (typeof chart !== "undefined" && props.tableData) {
            props.config.chart_series_config["myseries"] = props.tableData;
            // if (props.config.x_axis_fill_empty_dates) {
            //     const timeseriesPipeline = new TimeseriesPipeline(props.tableData, props.config.x_axis, true, aggregatedXInterval);
            //     props.tableData = timeseriesPipeline.filledDates;
            // }
            chart.data = props.tableData;
            chart.options = options;
            chart.update();
        } else if (typeof chart !== "undefined") {
            chart.options = options;
            chart.update();
        } else if (props.tableData && typeof chart === "undefined" && typeof myChart === "undefined") {
            if (props.chartType === "pie") {
                props.config.chart_series_config["myseries"] = props.tableData;
                myChart = new Chart(chartRef.current, {
                    type: "pie",
                    data: props.tableData,
                    options: (options) as any
                });
                setChart(myChart);
            } else {
                props.config.chart_series_config["myseries"] = props.tableData;
                myChart = new Chart(chartRef.current, {
                    type: "bar",
                    data: props.tableData,
                    options: (options) as any
                });
                setChart(myChart);
            }
        }
    }, [props.tableData, s]);

    return (
        <div className={`relative ${props.height}`}>
            <Watermark darkMode={props.darkMode} />
            <canvas ref={chartRef} id="myChart" />
        </div>
    );

}
