import { Card, Chain } from "../../helpers/api";
import { CHResponse, CHResponseWrapper, EditorState } from "../../helpers/common";
import { Option, Some, None } from "../../helpers/option";
import * as F from "../../helpers/formats";

interface SeriesProperty {
    [series: string]: string | boolean | undefined | number;
}

export interface ChartConfig {
    chart_data_labels: boolean;
    chart_stacked: boolean;
    chart_proportional: boolean;
    chart_horizontal: boolean;

    legend_hide: boolean;

    x_axis: string;
    y_axis: string;
    y2_axis: string;
    segment_axis: string;

    x_axis_title: string;
    y_axis_title: string;
    y2_axis_title: string;

    y_axis_format: "number" | "percentage" | "currency" | "scientific";
    y_axis_currency: string;
    y_axis_decimals: number;

    x_axis_min: string;
    x_axis_max: string;
    x_axis_show_values: boolean;
    x_axis_fill_empty_dates: boolean;
    y_axis_min: string;
    y_axis_max: string;
    y2_axis_min: string;
    y2_axis_max: string;

    y2_axis_percent: boolean;

    pie_color_scheme: string;
    pie_top_x_legends: boolean;
    pie_top_x_value: number;

    table_hide_row_numbers: boolean;
    table_color_zebra_striping: boolean;
    table_column_format: SeriesProperty;
    table_column_currency: SeriesProperty;
    table_column_width: SeriesProperty;
    table_column_display: SeriesProperty;
    table_column_alignment: SeriesProperty;
    table_column_hide: SeriesProperty;
    table_column_total: SeriesProperty;
    table_column_decimals: SeriesProperty;

    cohort_cohort_column: string;
    cohort_pivot_column: string;
    cohort_data_column: string;
    cohort_size_column: string;
    cohort_color_scheme: string;
    cohort_color_scheme_reversed: boolean;
    cohort_data_column_format: "auto" | "number" | "percentage" | "currency" | "scientific";
    cohort_data_column_decimals: number;
    cohort_data_column_currency: string;

    cohort_data_column_size_format: "auto" | "number" | "percentage" | "currency" | "scientific";
    cohort_data_column_size_decimals: number;
    cohort_data_column_size_currency: string;
    cohort_size_format_toggle: boolean;

    chart_series_config: any;

    metric_value_format: "auto" | "number" | "percentage" | "currency" | "scientific";
    metric_value_decimals: number;
    metric_value_currency: string;
}

export function defaultChartConfig(): ChartConfig {
    const config: ChartConfig = {
        chart_data_labels: false,
        chart_stacked: false,
        chart_proportional: false,
        chart_horizontal: false,

        legend_hide: false,

        x_axis: "",
        y_axis: "",
        y2_axis: "",
        segment_axis: "",
        x_axis_title: "",
        y_axis_title: "",
        y2_axis_title: "",

        y_axis_format: "number",
        y_axis_currency: "$",

        x_axis_min: "",
        x_axis_max: "",
        x_axis_show_values: false,
        x_axis_fill_empty_dates: false,
        y_axis_min: "",
        y_axis_max: "",
        y2_axis_min: "",
        y2_axis_max: "",

        y2_axis_percent: false,

        pie_color_scheme: "blues",
        pie_top_x_legends: false,
        pie_top_x_value: 5,

        table_hide_row_numbers: false,
        table_color_zebra_striping: true,
        table_column_format: {},
        table_column_currency: {},
        table_column_width: {},
        table_column_display: {},
        table_column_alignment: {},
        table_column_hide: {},
        table_column_total: {},
        table_column_decimals: {},

        cohort_cohort_column: "",
        cohort_pivot_column: "",
        cohort_data_column: "",
        cohort_size_column: "",
        cohort_color_scheme: "greens",
        cohort_color_scheme_reversed: true,

        cohort_size_format_toggle: false,

        metric_value_format: "auto",
        metric_value_currency: "$",
        chart_series_config: {}
    };

    return JSON.parse(JSON.stringify(config));
}

export interface ChartContainerProps {
    chartType: string;
    display_name: string;
    subtitle: string;
    config: ChartConfig;
    type: string;
    maybeData: Option<CHResponseWrapper>;
    tableData: any;
    refresh: boolean;
    setRefresh: Function | undefined;
    darkMode: boolean;
    focusMode?: undefined | boolean;
    id: string;
    setTableData: Function | undefined;
    query_id: string;
    height?: string;
    editorState?: EditorState;

    // for rendering the title
    currentDateAgg: string;
    boardDisplayName: string;
    pageDisplayName: string;
}

export interface CardProps {
    darkMode: boolean;
    data: Card;
    id: string;
    focusMode: boolean;
    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    boardDisplayName: string;
    pageDisplayName: string;
    handleFocus: Function;
    setCardCollection?: Function;
    collection?: Array<any>;
    height?: string;
    handleDeleteCard?: Function;
    editMode?: boolean;
    shareId?: string;
    chains: Chain[];
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    expanded: boolean;
    setRefreshPageCharts: Function;
    refreshPageCharts: boolean;
    groupId: Option<string>;

}

export interface ChartLoaderProps {
    title: string;
    subtitle: string;
    board: string;
    chartType: string;
    chartHorizontal: boolean;
    chartProportional: boolean;
    tableData: boolean;
    firstPass: boolean;
    firstPassSingle: boolean;
    spectrum: string;
    sql: string;
}
