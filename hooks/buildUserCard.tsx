import React, { useState, useEffect, FC } from "react";
import { FormatTableData } from "../helpers/formats";
import { defaultChartConfig } from "../components/charts/ChartConfig";
import { Some } from "../helpers/option";
import { CardProps, ChartContainerProps, ChartConfig } from "../components/charts/ChartConfig";
import { CHResponse, CHResponseWrapper, re_aggregation, re_chain_names, re_date_range } from "../helpers/common";
import { Option } from "../helpers/option";
import { api, Card, ChartInDB, Node } from "../helpers/api";

interface BuildCardProps {
    cardsData: any;
    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];
    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
    setDisplayChainFilterSubtitle: Function;
    setDisplayDateAggSubtitle: Function;
    setDisplayDateRangeSubtitle: Function;
    expanded: boolean;
}

export const buildUserCard = async (props: BuildCardProps) => {

    if (!props.cardsData) {
        // props.setUseChainFilter(true);
        // props.setUseDateAggFilter(true);
        // props.setUseDateRangeFilter(true);
        return false;
    }

    const getCardData = async (card_id) => {
        let resp;
        try {
            resp = await api.getCardData(card_id, props.currentDateAgg, props.currentDateRange, props.currentChainNames);
            const matchAggregation = resp.data.item.node.sql_text.match(re_aggregation);
            const matchDateRange = resp.data.item.node.sql_text.match(re_date_range);
            const matchChainNames = resp.data.item.node.sql_text.match(re_chain_names);
            props.setDisplayDateAggSubtitle(matchAggregation !== null ? true : false);
            props.setDisplayChainFilterSubtitle(matchChainNames !== null ? true : false);
            props.setDisplayDateRangeSubtitle(matchDateRange !== null ? true : false);

            // props.setUseDateAggFilter((prevState) => {
            //     if (prevState === true) {
            //         return true;
            //     }
            //     return matchAggregation !== null ? true : false;
            // });
            // props.setUseChainFilter((prevState) => {
            //     if (prevState === true) {
            //         return true;
            //     }
            //     return matchChainNames !== null ? true : false;
            // });
            // props.setUseDateRangeFilter((prevState) => {
            //     if (prevState === true) {
            //         return true;
            //     }
            //     return matchDateRange !== null ? true : false;
            // });

        } catch (err) {
            // props.setUseChainFilter(true);
            // props.setUseDateAggFilter(true);
            // props.setUseDateRangeFilter(true);
            resp = false;
        }
        return resp.data;
    };

    const chart = props.cardsData.chart;
    const chartType = chart.chart_type;
    const data = await getCardData(props.cardsData.id);


    if (!data) {
        // props.setUseChainFilter(true);
        // props.setUseDateAggFilter(true);
        // props.setUseDateRangeFilter(true);
        return false;
    }

    const axises = { xAxis: chart.properties.x_axis, yAxis: chart.properties.y_axis, y2Axis: chart.properties.y2_axis, segmentAxis: chart.properties.segment_axis };
    const tableData = false;
    const firstPass = true;
    const firstPassSingle = true;
    const spectrum = "blues";
    let calculatedTableData; // = tableData;
    const currentTableData = chart.properties.chart_series_config?.["myseries"] || tableData;
    let refresh = false;

    const maybeDataWrapper: CHResponseWrapper = { data: data.item.chart.chart_data, final_sql: "" };

    if (chart.chart_type === "pie" && chart.properties.y_axis) {
        calculatedTableData = FormatTableData(maybeDataWrapper.data, axises, chart.properties, currentTableData, !firstPass, !firstPassSingle, spectrum, chart.chart_type, false);
        refresh = true;
    } else if (chart.properties.x_axis && chart.properties.y_axis && chart.chart_type !== "table" && chart.chart_type !== "cohort") {
        calculatedTableData = FormatTableData(maybeDataWrapper.data, axises, chart.properties, currentTableData, !firstPass, !firstPassSingle, spectrum, chart.chart_type, false);
        refresh = true;
    } else if (chart.chart_type === "table") {
        calculatedTableData = true;
        refresh = true;
    } else if (chart.chart_type === "cohort") {
        calculatedTableData = true;
        refresh = true;
    } else if (chart.chart_type === "image") {
        calculatedTableData = true;
        refresh = true;
    }


    if (!calculatedTableData) {
        // props.setUseChainFilter(true);
        // props.setUseDateAggFilter(true);
        // props.setUseDateRangeFilter(true);
        return false;
    }


    const chartContainer: ChartContainerProps = {
        darkMode: true,
        refresh: refresh,
        maybeData: new Some(maybeDataWrapper),
        display_name: props.cardsData.display_name,
        type: "SQL-GRAPH",
        subtitle: props.cardsData.subtitle,
        chartType: chartType,
        tableData: calculatedTableData,
        config: chart.properties,
        id: props.cardsData.id,
        setTableData: undefined,
        setRefresh: undefined,
        query_id: chart.pipeline_id,
        currentDateAgg: "last_7d",
        boardDisplayName: "",
        pageDisplayName: ""
    };

    return chartContainer;

};
