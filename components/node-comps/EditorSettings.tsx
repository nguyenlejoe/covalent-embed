import React, { useState, useEffect, FC, useMemo } from "react";

import * as C from "../../helpers/colors";

import { CHART_TYPES, CHResponse, EditorState } from "../../helpers/common";

import { Option, Some, None } from "../../helpers/option";

import { H2, H3, H5, HTMLSelect, Checkbox, InputGroup } from "@blueprintjs/core";

import { ColorPicker } from "../ColorPicker";

import { ChartConfig, ChartContainerProps } from "../charts/ChartConfig";

import { MetricSettings } from "../charts/MetricChart";

import { MiscSettings } from "../charts/MiscSettings";
import { LegendSettings } from "../charts/LegendSettings";
import { BarSettings } from "../charts/BarSettings";
import { TableSettings } from "../charts/TableSettings";
import { AxisSettings } from "../charts/AxisSettings";
import { CohortSettings } from "../charts/CohortChart";


export interface EditorSettingsProps {
    editorState: EditorState;
    maybeData: Option<CHResponse>;
    darkMode: boolean;
    chartType: string;
    title: string;
    setChartType: Function;
    config: ChartConfig;
    setConfig: Function;
    setSwitchedChartType: Function;
}

export const EditorSettings = (props: EditorSettingsProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const divider = <hr className={s.BORDER_SECONDARY + " p-1.5"} />;

    return <div>

        <div className="mb-4">
            <p className="bp4-text-muted pb-1.5">Chart type</p>
            <HTMLSelect fill={true} value={props.chartType} onChange={(e) => {
                if (props.chartType === "pie") {
                    props.config.segment_axis = "";
                }
                props.setChartType(e.currentTarget.value);
                props.setSwitchedChartType(true);
            }} >

                {
                    CHART_TYPES.map((c, i) => {
                        return <option key={i} value={c.type} >{c.name}</option>;
                    })
                }

            </HTMLSelect>
        </div>
        <div className="mb-4">
            <p className="bp4-text-muted pb-1.5">Chart title</p>
            <InputGroup value={props.title} placeholder="Enter the chart title" onChange={props.setConfig.bind(this, "chart_title")} />
        </div>

        {divider}

        <div className="">
            <div className="">
                {(() => {
                    switch (props.chartType) {
                        case "metric":
                            return <>
                                <MetricSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                            </>;
                        case "cohort":
                            return <>
                                <CohortSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                    data={props.maybeData}
                                />
                            </>;
                        case "table":
                            return <>
                                <TableSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />

                            </>;
                        case "area":
                            return <>
                                <BarSettings
                                    title="Area"
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                {divider}
                                <MiscSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                {divider}
                                <LegendSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                <div className="col-span-3 mt-6-">
                                    <AxisSettings
                                        setConfig={props.setConfig}
                                        divider={divider}
                                        {...props.config}
                                    />
                                </div>
                            </>;
                        case "pie":
                            return <>
                                <MiscSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                {divider}
                                <LegendSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                            </>;
                        case "line":
                        case "scatter":
                            return <>
                                <MiscSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />

                                {divider}

                                <LegendSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                <div className="col-span-3 mt-6-">
                                    <AxisSettings
                                        setConfig={props.setConfig}
                                        divider={divider}
                                        {...props.config}
                                    />
                                </div>
                            </>;
                        case "bar":
                            return <>
                                <BarSettings
                                    title="Bar"
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />
                                {divider}

                                <MiscSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />

                                {divider}
                                <LegendSettings
                                    setConfig={props.setConfig}
                                    {...props.config}
                                />

                                <div className="col-span-3 ">
                                    <AxisSettings
                                        setConfig={props.setConfig}
                                        divider={divider}
                                        {...props.config}
                                    />
                                </div>
                            </>;
                        default:
                            return <div />;
                    }
                })()}

            </div>
        </div>

        {/* <div>
            <H5>Color theme</H5>

            <div>
                <ColorSpectrumPreview spectrum={props.spectrum} />
                <HTMLSelect value={props.spectrum} onChange={(e) => {
                    props.setSpectrum(e.currentTarget.value);
                }} >
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
        </div> */}

    </div >;
};
