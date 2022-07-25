import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";
import * as F from "../../helpers/formats";
import S from "../../helpers/strings";

import { ChartContainerProps } from "../charts/ChartConfig";

import { IDimensionAttributes, IMeasureAttributes, Pivot } from "../../helpers/pivot";

import _flatten = require("lodash/flatten");
import _concat = require("lodash/concat");
import _cloneDeep = require("lodash/cloneDeep");
import _reverse = require("lodash/reverse");
import _each = require("lodash/each");

import { Cell, Column, Table2 } from "@blueprintjs/table";
import { Intent, Props, FormGroup, InputGroup, HTMLSelect, Classes, NumericInput, Checkbox, H5} from "@blueprintjs/core";

import { generateTitlePrefix, getRGB, renderChartTitle, timestampDisplayFormats, value_format } from "../../helpers/formats";

export function CohortSettings({ setConfig, data, ...props}) {

    const options: any[] = [];
    const divider = <hr className={"border-[#7f0dff]/30 p-1.5"} />;

    Object.keys(F.CURRENCY).forEach((c, i) => {
        options.push(<option key={i} value={F.CURRENCY[c]}>{F.CURRENCY[c]}</option>);
    });

    const sizeOptions = [<option key="empty" value="" />];

    if (typeof data.value === "object" ) {
        data.value.data.meta.forEach((c, i) => {
            sizeOptions.push(<option key={i} value={c.name}>{c.name}</option>);
        });
    }

    return <div>
        <p className="bp4-text-muted pb-1.5">Cohort chart data options</p>

        <div className="mb-4">

            <label className={Classes.LABEL}>
                Data value format
                <HTMLSelect value={props.cohort_data_column_format} onChange={setConfig.bind(this, "cohort_data_column_format")}>
                    <option value="auto">Auto (default) </option>
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="scientific">Scientific</option>
                </HTMLSelect>
            </label>
        </div>
        <p className="w-full flex -py-2 mb-2 bp4-text-muted">Data format settings</p>
        <div>
            <FormGroup
                label="Decimals"
                inline={true}
            >
                <NumericInput disabled={props.cohort_data_column_format === "auto" ? true : false} max={100} min={0} placeholder="" value={props.cohort_data_column_decimals} onValueChange={setConfig.bind(this, "cohort_data_column_decimals")}/>
            </FormGroup>
        </div>
        <div className={props.cohort_data_column_format !== "currency" ? "text-white font-bold rounded opacity-50 cursor-not-allowed" : ""}>
            <FormGroup
                label="Currency"
                inline={true}
            >
                <HTMLSelect fill={true} value={props.cohort_data_column_currency} onChange={setConfig.bind(this, "cohort_data_column_currency")} disabled={props.cohort_data_column_format === "currency" ? false : true}>
                    {options}
                </HTMLSelect>
            </FormGroup>
        </div>

        {divider}

        <p className="bp4-text-muted pb-1.5">Cohort chart size options</p>

        <div className="mb-4">

            <label className={Classes.LABEL}>
                Size value format
                <HTMLSelect disabled={!props.cohort_size_format_toggle} value={props.cohort_data_column_size_format} onChange={setConfig.bind(this, "cohort_data_column_size_format")}>
                    <option value="auto">Auto (default) </option>
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                    <option value="scientific">Scientific</option>
                </HTMLSelect>
            </label>
        </div>
        <p className="w-full flex -py-2 mb-2 bp4-text-muted">Size format settings</p>
        <div>
            <FormGroup
                label="Decimals"
                inline={true}
            >
                <NumericInput disabled={!props.cohort_size_format_toggle || (props.cohort_data_column_size_format === "auto" ? true : false)} max={100} min={0} placeholder="" value={props.cohort_data_column_size_decimals} onValueChange={setConfig.bind(this, "cohort_data_column_size_decimals")}/>
            </FormGroup>
        </div>
        <div className={props.cohort_data_column_size_format !== "currency" ? "text-white font-bold rounded opacity-50 cursor-not-allowed" : ""}>
            <FormGroup
                label="Currency"
                inline={true}
            >
                <HTMLSelect fill={true} value={props.cohort_data_column_size_currency} onChange={setConfig.bind(this, "cohort_data_column_size_currency")} disabled={!props.cohort_size_format_toggle || (props.cohort_data_column_size_format === "currency" ? false : true)}>
                    {options}
                </HTMLSelect>
            </FormGroup>
        </div>
        <div>
            <H5>Size column</H5>
            <div>
                <HTMLSelect disabled={!props.cohort_size_format_toggle} fill={true} value={props.cohort_size_column} onChange={setConfig.bind(this, "cohort_size_column")}>
                    {sizeOptions}
                </HTMLSelect>
            </div>
        </div>
        <br />
        <div>
            <div className="mb-4">
                <Checkbox checked={props.cohort_size_format_toggle} label="Enable size column options" onChange={setConfig.bind(this, "cohort_size_format_toggle")} />
            </div>
        </div>
    </div>;
}

export function CohortChart(props: ChartContainerProps) {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    return props.maybeData.match({
        None: () => null,
        Some: (data) => {
            if (data.data === undefined) {
                return (
                    <div className={`${props.height}`}>
                        <span>-</span>
                    </div>
                );
            }
            if (props.maybeData.isEmpty) {
                return <div className="p-2">
                    Hit "Run".
                </div>;
            }

            if (props.config.cohort_cohort_column === "") {
                return <div className="p-2">
                    {S.COHORT_NEED_COHORT_COLUMN}
                </div>;
            }

            if (props.config.cohort_pivot_column === "") {
                return <div className="p-2">
                    {S.COHORT_NEED_PIVOT_COLUMN}
                </div>;
            }

            if (props.config.cohort_data_column === "") {
                return <div className="p-2">
                    {S.COHORT_NEED_DATA_COLUMN}
                </div>;
            }

            // const data = props.maybeData.get().data.data;

            const rows: IDimensionAttributes[] = props.config.cohort_cohort_column ? [{
                    id: props.config.cohort_cohort_column
                }]
                    : [],
                cols: IDimensionAttributes[] = props.config.cohort_pivot_column ? [{
                    id: props.config.cohort_pivot_column
                }] : [],
                dataColumn = props.config.cohort_data_column,
                measures: IMeasureAttributes[] = [{
                    key: dataColumn,
                    name: dataColumn,
                    format: "int",
                    aggregation: "sum"
                }];

            const pivotResult = new Pivot().pivot(data.data.data, rows, cols, measures),
                rowKeys = pivotResult.getRowKeys(),
                colKeys = pivotResult.getColKeys(),
                numRows = _flatten(rowKeys).length;

            const sizeDict = {};
            if (props.config.cohort_cohort_column && props.config.cohort_size_column) {
                data.data.data.forEach((x) => {
                    if (!sizeDict[x[props.config.cohort_cohort_column]]) {
                        if (props.config.cohort_size_format_toggle) {
                            sizeDict[x[props.config.cohort_cohort_column]] = parseFloat(x[props.config.cohort_size_column]);
                        }
                    }
                });
            }

            const cohort_color_schema = props.config.cohort_color_scheme,
                reversed = props.config.cohort_color_scheme_reversed,
                spectrum = reversed ? (() => {
                    const clone = _cloneDeep(C.QUANT_COLOR_PALETTES[cohort_color_schema]);
                    _reverse(clone);
                    return clone;
                })() : C.QUANT_COLOR_PALETTES[cohort_color_schema];

            let ranges = [Infinity, -Infinity];

            _each(_flatten(rowKeys), (rowIndex) => {
                _each(_flatten(colKeys), (colIndex) => {
                    const val = pivotResult.values([rowIndex], [colIndex]);
                    if (val && val[0]) {
                        ranges = [
                            Math.min(ranges[0], val[0].value),
                            Math.max(ranges[1], val[0].value)
                        ];
                    }
                });
            });

            const gradient = C.gradient(spectrum, ranges[0], ranges[1]),
                colorFn = (dataPoint: number): any => {
                    const backgroundColor = gradient.colorAtFloor(dataPoint),
                        colorWithAlpha = F.hexToRGBA(backgroundColor, 0.6);
                    return {
                        backgroundColor: colorWithAlpha
                    };
                };

            const _renderCell = (rowIndex: number, colIndex: number) => {

                const cell = (() => {
                    const x = rowKeys[rowIndex][0];
                    const y = Object.keys(sizeDict).length !== 0 ? sizeDict[Object.keys(sizeDict)[rowIndex]] : null;
                    if (props.config.cohort_size_format_toggle && props.config.cohort_size_column && colIndex === 1) {
                        return y;
                    }
                    if (colIndex === 0) {
                        return x;
                    }
                    const _colKeys = props.config.cohort_size_format_toggle && props.config.cohort_size_column ? _concat(props.config.cohort_size_column, colKeys) : colKeys;
                    const newColIndex = colIndex - 1,
                        row2 = pivotResult.values([x], _colKeys[newColIndex]);
                    return row2 ? row2[0].value : null;
                })();

                if (cell === null) {
                    return <Cell intent={Intent.DANGER}>Ø</Cell>;
                }

                // const formatted = cell;

                const style = (colIndex === 0 || (colIndex === 1 && Object.keys(sizeDict).length !== 0)) ? {} : colorFn(cell);
                const formatted = (cell !== rowKeys[rowIndex][0] && (colIndex !== 1 || Object.keys(sizeDict).length === 0)) ? value_format(cell, props.config.cohort_data_column_format, props.config.cohort_data_column_decimals, props.config.cohort_data_column_currency) : cell;
                const formattedSize = (colIndex === 1 && Object.keys(sizeDict).length !== 0) ? value_format(formatted, props.config.cohort_data_column_size_format, props.config.cohort_data_column_size_decimals, props.config.cohort_data_column_size_currency) : formatted;

                return <Cell style={style}>{formattedSize}</Cell>;
            };

            const sizeKeys = props.config.cohort_size_format_toggle && props.config.cohort_size_column ? _concat(props.config.cohort_size_column, colKeys) : colKeys;
            const finalColKeys = props.config.cohort_cohort_column ? _concat(props.config.cohort_cohort_column, sizeKeys) : sizeKeys;

            const renderedColumns = finalColKeys.map((c, i) => {
                return <Column
                    key={i}
                    name={c}
                    cellRenderer={_renderCell}
                />;
            });

            return <div className={`${props.height}`}>
                <Table2 numRows={numRows} numFrozenColumns={1} cellRendererDependencies={colKeys} >
                    {renderedColumns}
                </Table2>
            </div>;
        }
    });


}
