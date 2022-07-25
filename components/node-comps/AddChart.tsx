import React, { useState, useEffect, FC, useMemo } from "react";
import { Icon } from "@blueprintjs/core";
import { Button, ButtonGroup, H1, H2, H3, EditableText, PopoverPosition, Intent, H4, H6 } from "@blueprintjs/core";
import * as C from "../../helpers/colors";
import { CHART_TYPES } from "../../helpers/common";

interface AddChartProps {
    node: any;
    listCharts: Function;
    showMessage: Function;
    darkMode: boolean;
    handleCreateChart: Function;
}

const AddChart = (props: AddChartProps) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;
    const [chartType, setChartType] = useState("metric");

    return <div>
        <div>
            <ButtonGroup className="flex flex-wrap">
                {CHART_TYPES.map((c, i) => {
                    return <Button key={i} active={c.type === chartType} onClick={() => setChartType(c.type)} icon={c.icon} >{c.name}</Button>;
                })}
            </ButtonGroup>
        </div>
        <div className="pt-4">
            <Button onClick={() => props.handleCreateChart(chartType)}>New {chartType} chart &rarr;</Button>
        </div>
    </div>;

};

export default AddChart;
