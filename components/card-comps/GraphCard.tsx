import { data } from "autoprefixer";
import React, { useState, useEffect } from "react";
import * as C from "../../helpers/colors";
import Chart from "../chart";

interface CardProps {
    data: any;
    darkMode: boolean;
    focusMode: boolean;
}

const GraphCard = (props: CardProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;
    return (
        <div>
            <div>{props.data.title}</div>
            <div className="mb-3">{props.data.subtitle} - 125 rows</div>
            <Chart
                focusMode={props.focusMode}
                loading={props.data.loading}
                series={props.data.series}
                data={props.data.data}
                labels={props.data.labels}
                darkMode={props.darkMode}
                colors={C.QUANT_COLOR_PALETTES["blues"]}
            />
        </div>
    );
};

export default GraphCard;
