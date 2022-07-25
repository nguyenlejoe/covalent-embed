import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";

import { HTMLSelect, H4, Checkbox, Classes } from "@blueprintjs/core";

export function TableSettings({ setConfig, ...props }) {
    return <div>
        <p className="bp4-text-muted pb-1.5">Table options</p>
        <div className="mb-4">

            <Checkbox checked={props.table_hide_row_numbers} label="Hide row numbers" onChange={setConfig.bind(this, "table_hide_row_numbers")} />
            <Checkbox checked={props.table_color_zebra_striping} label="Zebra striping" onChange={setConfig.bind(this, "table_color_zebra_striping")} />
        </div>
    </div>;
}
