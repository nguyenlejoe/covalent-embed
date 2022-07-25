import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";

import { HTMLSelect, H5, Checkbox, Classes } from "@blueprintjs/core";

export function BarSettings({ setConfig, title, ...props }) {
    return <div>
        <p className="bp4-text-muted pb-1.5">{title} chart options</p>

        <div className="mb-4 ">
            <Checkbox checked={props.chart_stacked} label={"Stacked " + (title.toLowerCase()) + "s"} onChange={setConfig.bind(this, "chart_stacked")} />
            <Checkbox checked={props.chart_proportional} label={"Proportional " + (title.toLowerCase()) + "s"} onChange={setConfig.bind(this, "chart_proportional")} disabled={props.y2_axis !== "" ? true : false} />
            <Checkbox checked={props.chart_horizontal} label={"Horizontal " + (title.toLowerCase()) + "s"} onChange={setConfig.bind(this, "chart_horizontal")} />
        </div>

    </div>;
}
