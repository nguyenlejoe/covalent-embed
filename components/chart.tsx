
import React, { useState, useEffect } from "react";

import * as C from "../helpers/colors";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import { Bar } from "react-chartjs-2";

interface ChartData {

}

interface ChartProps {
    loading: boolean;
    series: string[];
    data: ChartData[];
    labels: string[];
    colors: string[];
    darkMode: boolean;
    focusMode: boolean;
}

const Chart = (props: ChartProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const options = {
        responsive: true,
        animation: {
            duration: props.focusMode ? 0 : 600
        },
        scales: {
            x: {
                ticks: {
                    color: s.TEXT_COLOR_RGB
                }
            },
            y: {
                ticks: {
                    color: s.TEXT_COLOR_RGB
                }
            }
        },
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    color: s.TEXT_COLOR_RGB
                }
            },
            datalabels: {
                display:false
            },
            title: {
                display: false,
                // text: "Chart.js Bar Chart",
            },
        },
    };

    const data = {
        labels: props.labels,
        datasets: [
            {
                label: "Dataset 1",
                data: props.labels.map(() => Math.random() * 10),
                // backgroundColor: C.PRESET_COLOR_MAP["light-blue"]
                backgroundColor: props.colors[0]
            },
            {
                label: "Dataset 2",
                data: props.labels.map(() => Math.random() * 10),
                // backgroundColor: C.PRESET_COLOR_MAP["green"]
                backgroundColor: props.colors[1]
            },
            {
                label: "Dataset 3",
                data: props.labels.map(() => Math.random() * 10),
                // backgroundColor: C.PRESET_COLOR_MAP["magenta"]
                backgroundColor: props.colors[2]
            },
            {
                label: "Dataset 4",
                data: props.labels.map(() => Math.random() * 10),
                // backgroundColor: C.PRESET_COLOR_MAP["magenta"]
                backgroundColor: props.colors[3]
            },
            {
                label: "Dataset 5",
                data: props.labels.map(() => Math.random() * 10),
                // backgroundColor: C.PRESET_COLOR_MAP["magenta"]
                backgroundColor: props.colors[4]
            }
        ],
    };

    return <div className="mb-4">
        <Bar options={options} data={data} />
    </div>;
};

export default Chart;


