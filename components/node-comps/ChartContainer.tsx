import React, { useState, useEffect, FC, useMemo, useRef } from "react";
import * as C from "../../helpers/colors";
import { CHResponse, EditorState } from "../../helpers/common";
import { Option, Some, None } from "../../helpers/option";


import { generateTitlePrefix, getRGB, renderChartTitle, timestampDisplayFormats, value_format } from "../../helpers/formats";
import { ChartContainerProps } from "../charts/ChartConfig";
import { TableChart } from "../charts/TableChart";
import { MetricChart } from "../charts/MetricChart";
import { CanvasChart } from "../charts/CanvasChart";
import { ImageChart } from "../charts/ImageChart";
import { CohortChart } from "../charts/CohortChart";

export const ChartContainer = (props: ChartContainerProps) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;

    if (props.editorState === EditorState.FAILURE || props.editorState === EditorState.NO_DATA) {
        return;
    }

    const el = (() => {

        switch (props.chartType) {
            case "metric":
                return <MetricChart {...props} />;

            case "bar":
            case "line":
            case "area":
            case "scatter":
            case "pie":
                return <CanvasChart {...props} />;

            case "table":
                return <TableChart {...props} />;

            case "image":
                return <ImageChart {...props} />;

            case "cohort":
                return <CohortChart {...props} />;

            default:
                throw new Error("handle me");
        }

    })();

    return <div className={`${!props.height && "border"} relative ${s.BORDER_SECONDARY}  ${s.BG_COLOR_SECONDARY} `}>
        <div className={"p-2 "}>
            <div className={"pb-4 "}>
                <div className="pr-4"> {props.pageDisplayName && generateTitlePrefix(props.pageDisplayName, props.boardDisplayName, props.currentDateAgg)} {props.display_name ? props.display_name : `Unnamed ${props.chartType} chart`}</div>
                <div className="my-1 bp4-text-muted text-xs">{props.subtitle}</div>
            </div>
            {el}
        </div>
    </div>;

};

