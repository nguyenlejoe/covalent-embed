import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";
import { ChartContainerProps, ChartConfig } from "./ChartConfig";
import { Watermark } from "./Watermark";

import { HTMLSelect, H4, Checkbox, Classes, FormGroup, InputGroup, NumericInput } from "@blueprintjs/core";
import { value_format } from "../../helpers/formats";
import * as F from "../../helpers/formats";


export function MetricSettings({ setConfig, ...props }) {

    const options: any[] = [];

    Object.keys(F.CURRENCY).forEach((c, i) => {
        options.push(<option key={i} value={F.CURRENCY[c]}>{F.CURRENCY[c]}</option>);
    });

    return <div>
        <p className="bp4-text-muted pb-1.5">Metric chart options</p>

        <div className="mb-4">

            <label className={Classes.LABEL}>
                Value format
                <HTMLSelect value={props.metric_value_format} onChange={setConfig.bind(this, "metric_value_format")}>
                    <option value="auto">Auto (default) </option>
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="scientific">Scientific</option>
                </HTMLSelect>
            </label>
        </div>
        <p className="w-full flex -py-2 mb-2 bp4-text-muted">Format Settings</p>
        <div>
            <FormGroup
                label="Decimals"
                inline={true}
            >
                <NumericInput disabled={props.metric_value_format === "auto" ? true : false} placeholder="" max={100} min={0} value={props.metric_value_decimals} onValueChange={setConfig.bind(this, "metric_value_decimals")}/>
            </FormGroup>
        </div>
        <div className={props.metric_value_format !== "currency" ? "text-white font-bold rounded opacity-50 cursor-not-allowed" : ""}>
            <FormGroup
                label="Currency"
                inline={true}
            >
                <HTMLSelect fill={true} value={props.metric_value_currency} onChange={setConfig.bind(this, "metric_value_currency")} disabled={props.metric_value_format === "currency" ? false : true}>
                    {options}
                </HTMLSelect>
            </FormGroup>
        </div>
    </div>;
}

export function MetricChart(props: ChartContainerProps) {

    const latest_value = (() => {
        if (props.tableData) {
            if (props.tableData.datasets.length === 0) {
                return { y: "-" };
            }

            const firstSeries = props.tableData.datasets[0];
            if (firstSeries) {
                const dataPoints = typeof firstSeries.data[0] !== "object" ? firstSeries.data : firstSeries.data.map((e) => {
                    if (e !== null && e !== undefined && typeof e !== "object") {
                        return e;
                    } else if (e !== null && e !== undefined && typeof e === "object") {
                        return e.y;
                    }
                });
                for (let i = dataPoints.length - 1; i >= 0; i += -1) {
                    if (dataPoints[i] != null) {
                        return {
                            y: value_format(dataPoints[i], props.config.metric_value_format, props.config.metric_value_decimals, props.config.metric_value_currency)
                            // y: props.config.metric_value_format === "percentage" ? dataPoints[i] + "%" : props.config.metric_value_format === "currency" ? "$" + dataPoints[i] : dataPoints[i]
                        };
                    }
                }
            }
        }

        return { y: "-" };
    })();

    const s = props.darkMode ? C.DARK : C.LIGHT;

    return <div className={`relative overflow-auto ${props.height}`}>
        <div className="h-full w-full flex flex-col justify-center ">
            <div className="">
                <Watermark darkMode={props.darkMode} />
                <div className="pb-10 text-center text-5xl">{latest_value.y}</div>
            </div>
        </div>
    </div>;

    // return <div className={" h-80  p-2 border " + s.BORDER_SECONDARY + (" " + s.BG_COLOR_SECONDARY)}>
    //     <div className="relative h-full">
    //         <Watermark darkMode={props.darkMode} />
    //     </div>
    //     <div className="flex  flex-col justify-center  relative h-full " >
    //         <div className="text-sm">{props.title.length > 0 ? props.title : "Unamed metric chart"}</div>
    //         <div className="p-10 m-auto">
    //             <div className=" text-center text-5xl">{latest_value.y}</div>
    //         </div>
    //     </div>
    // </div >;
}
