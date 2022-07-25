import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";
import * as F from "../../helpers/formats";

import { ChartContainerProps } from "../charts/ChartConfig";
import { Watermark } from "./Watermark";

export function ImageChart(props: ChartContainerProps) {

    const s = props.darkMode ? C.DARK : C.LIGHT;


    const imageUrl = props.maybeData.match({
        None: () => [<span>-</span>],
        Some: (data) => {
            if (data.data === undefined) {
                return [<span>-</span>];
            }


            if (data.data.data.length > 0) {
                const l = data.data.data.length - 1;
                if (data.data.data[l]) {

                    const k = Object.keys(data.data.data[l]),
                        k_l = k[k.length - 1],
                        v = data.data.data[l][k_l];

                    if (v) {
                        return <div className={"h-full w-full bg-cover bg-center bg-no-repeat "} style={{ backgroundImage: `url(${v})` }} />;
                    }
                }
            }

            return [<span>-</span>];

        }
    });


    return <div className={`relative ${props.height ? props.height : " h-80 "}`}>
        {imageUrl}
    </div>;
}
