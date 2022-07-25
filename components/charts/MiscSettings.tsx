import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";

import { HTMLSelect, H5, Checkbox, Classes } from "@blueprintjs/core";

export function MiscSettings({ setConfig, ...props }) {
    return <div className="">
        <p className="bp4-text-muted pb-1.5">Misc options</p>
        <div className="mb-2">

            <Checkbox  className="bp4-text-muted"  checked={props.chart_data_labels} label="Show data labels" onChange={setConfig.bind(this, "chart_data_labels")} />
        </div>

    </div>;
}
