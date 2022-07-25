import React, { useState, useEffect, FC, useMemo } from "react";


import { Option, Some, None } from "../../helpers/option";
import * as F from "../../helpers/formats";

import * as C from "../../helpers/colors";
import { ChartContainerProps, ChartConfig } from "./ChartConfig";

import { HTMLSelect, H4, H5, H6, Checkbox, FormGroup, InputGroup, Classes, Icon, NumericInput } from "@blueprintjs/core";

export function AxisSettings({ setConfig, divider, ...props }) {

    const options: any[] = [];

    Object.keys(F.CURRENCY).forEach((c, i) => {
        options.push(<option key={i} value={F.CURRENCY[c]}>{F.CURRENCY[c]}</option>);
    });

    const [expanded, setExpanded] = useState([]);
    const hcX = () => {
        if (expanded.includes("x")) {
            const expandedArray = [...expanded];
            const a = expandedArray.filter((e) => e !== "x");
            setExpanded([...a]);
        } else {
            setExpanded([...expanded, "x"]);
        }
    };
    const hcY = () => {
        if (expanded.includes("y")) {
            const expandedArray = [...expanded];
            const a = expandedArray.filter((e) => e !== "y");
            setExpanded([...a]);
        } else {
            setExpanded([...expanded, "y"]);
        }
    };
    const hcS = () => {
        if (expanded.includes("s")) {
            const expandedArray = [...expanded];
            const a = expandedArray.filter((e) => e !== "s");
            setExpanded([...a]);
        } else {
            setExpanded([...expanded, "s"]);
        }
    };

    return <>
        {divider}
        <div className="mt-4- ">
            <div>
                <p onClick={hcX} className="w-full flex cursor-pointer -py-2 mb-2 bp4-text-muted "><Icon className={"mr-2  "} icon={expanded.includes("x") ? "chevron-down" : "chevron-up"} /> X Axis options </p>
                <div className={expanded.includes("x") ? " ml-6 " : "hidden"}>
                    <div>
                        <FormGroup
                            label="Axis title"
                        >
                            <InputGroup placeholder="Enter axis label..." value={props.x_axis_title} type="string" onChange={setConfig.bind(this, "x_axis_title")} />
                        </FormGroup>
                    </div>
                    <div>
                        <FormGroup
                            label="Axis minimum"
                        >
                            <InputGroup placeholder="Enter axis minimum..." value={props.x_axis_min} type="number" onChange={setConfig.bind(this, "x_axis_min")} />
                        </FormGroup>
                    </div>
                    <div>
                        <FormGroup
                            label="Axis maximum"
                        >
                            <InputGroup placeholder="Enter axis maximm..." value={props.x_axis_max} type="number" onChange={setConfig.bind(this, "x_axis_max")} />
                        </FormGroup>
                    </div>
                    <div>
                        <div className="mb-2 ">
                            <Checkbox checked={props.x_axis_show_values} label="Show axis values" onChange={setConfig.bind(this, "x_axis_show_values")} />
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 ">
                            <Checkbox checked={props.x_axis_fill_empty_dates} label="Fill empty dates" onChange={setConfig.bind(this, "x_axis_fill_empty_dates")} />
                        </div>
                    </div>
                </div>
            </div>
            {divider}
            <div>
                <p onClick={hcY} className="w-full flex cursor-pointer -py-2 mb-2  bp4-text-muted "> <Icon className="mr-2" icon={expanded.includes("y") ? "chevron-down" : "chevron-up"} /> Y Axis options</p>
                <div className={expanded.includes("y") ? " ml-6  " : "hidden"}>
                    <div>
                        <FormGroup
                            label="Axis title"
                        >
                            <InputGroup placeholder="Enter axis label..." value={props.y_axis_title} type="string" onChange={setConfig.bind(this, "y_axis_title")} />
                        </FormGroup>
                    </div>
                    <div>
                        <FormGroup
                            label="Axis minimum"
                        >
                            <InputGroup placeholder="Enter axis minimum..." value={props.y_axis_min} type="number" onChange={setConfig.bind(this, "y_axis_min")} />
                        </FormGroup>
                    </div>
                    <div>
                        <FormGroup
                            label="Axis maximum"
                        >
                            <InputGroup placeholder="Enter axis maximm..." value={props.y_axis_max} type="number" onChange={setConfig.bind(this, "y_axis_max")} />
                        </FormGroup>
                    </div>
                    <div>
                        <label className={Classes.LABEL}>
                            Value format
                            <HTMLSelect value={props.y_axis_format} onChange={setConfig.bind(this, "y_axis_format")}>
                                <option value="number">Number (auto)</option>
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
                            <NumericInput max={100} min={0} placeholder="" value={props.y_axis_decimals} onValueChange={setConfig.bind(this, "y_axis_decimals")}/>
                        </FormGroup>
                    </div>
                    <div className={props.y_axis_format !== "currency" ? "text-white font-bold rounded opacity-50 cursor-not-allowed" : ""}>
                        <FormGroup
                            label="Currency"
                            inline={true}
                        >
                            <HTMLSelect fill={true} value={props.y_axis_currency} onChange={setConfig.bind(this, "y_axis_currency")} disabled={props.y_axis_format === "currency" ? false : true}>
                                {options}
                            </HTMLSelect>
                        </FormGroup>
                    </div>
                </div>
            </div>
            {divider}
            <div>
                <p onClick={hcS} className="w-full flex cursor-pointer -py-2 mb-2 bp4-text-muted"> <Icon className="mr-2" icon={expanded.includes("s") ? "chevron-down" : "chevron-up"} /> Second Y Axis options</p>
                <div className={expanded.includes("s") ? " ml-6 " : "hidden"}>
                    <div>
                        <FormGroup
                            label="Axis title"
                        >
                            <InputGroup placeholder="Enter axis label..." value={props.y2_axis_title} onChange={setConfig.bind(this, "y2_axis_title")} />
                        </FormGroup>
                    </div>
                    <FormGroup
                        label="Axis minimum"
                    >
                        <InputGroup placeholder="Enter axis minimum..." value={props.y2_axis_min} onChange={setConfig.bind(this, "y2_axis_min")} />
                    </FormGroup>
                    <FormGroup
                        label="Axis maximum"
                    >
                        <InputGroup placeholder="Enter axis maximm..." value={props.y2_axis_max} onChange={setConfig.bind(this, "y2_axis_max")} />
                    </FormGroup>
                    <Checkbox checked={props.y2_axis_percent} label="Format as percentages" onChange={setConfig.bind(this, "y2_axis_percent")} disabled={props.y2_axis === "" ? true : false} />
                </div>
            </div>
            {divider}
        </div>
    </>;
}
