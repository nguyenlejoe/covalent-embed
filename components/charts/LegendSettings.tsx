import React from "react";

import { HTMLSelect, H5, Checkbox, Classes, FormGroup, NumericInput } from "@blueprintjs/core";

export function LegendSettings({ setConfig, ...props }) {
    return <div>
        <p className="bp4-text-muted pb-1.5">Legend options</p>
        <div className="mb-2 ">
            <Checkbox checked={props.legend_hide} label="Hide legend" onChange={setConfig.bind(this, "legend_hide")} />
        </div>
        {props.chart_series_config["myseries"] && props.chart_series_config["myseries"].datasets[0].type === "pie" && props.segment_axis !== "" ?
            <div className="mb-2 ">
                <Checkbox checked={props.pie_top_x_legends} label="Limit top N slices" onChange={setConfig.bind(this, "pie_top_x_legends")} />
            </div>
            : null}
        {props.pie_top_x_legends && props.chart_series_config["myseries"] && props.chart_series_config["myseries"].datasets[0].type === "pie" && props.segment_axis !== ""?
            <div>
                <FormGroup
                    label="Top N: "
                    inline={true}
                >
                    <NumericInput max={100} min={0} placeholder="5" value={props.pie_top_x_value} onValueChange={setConfig.bind(this, "pie_top_x_value")}/>
                </FormGroup>
            </div> : null}
    </div>;
}
