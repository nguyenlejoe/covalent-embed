import React from "react";

import { Option, Some, None } from "../../helpers/option";

import * as C from "../../helpers/colors";
import * as F from "../../helpers/formats";
import { value_format } from "../../helpers/formats";

import { parseISO, format } from "date-fns";

import _isNumber = require("lodash/isNumber");

import numeral from "numeraljs";

import { ChartContainerProps } from "../charts/ChartConfig";

export function TableChart(props: ChartContainerProps) {
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const getCols = () => {
        return props.maybeData.match({
            None: () => [<span>-</span>],
            Some: (data) => {
                if (data.data === undefined) {
                    return;
                }
                const cc = props.config.table_hide_row_numbers
                    ? []
                    : [<th key="rowid" />];

                const col_names = data.data.meta.filter((x) => (props.config.table_column_hide[x.name] || false) === false)
                    .map((c) => c.name);

                col_names.forEach((c, i) => {
                    const style = { textAlign: "center" };
                    const width: string = props.config.table_column_width[c] || "";

                    const align = props.config.table_column_alignment[c] || "left",
                        align_class = (align === "" || align === "left") ? { textAlign: "left" }
                            : align === "right" ? { textAlign: "right" }
                                : { textAlign: "center" };

                    style["textAlign"] = align_class["textAlign"];

                    if (width && width.trim().length > 0) {
                        style["width"] = +(width.trim()) + "px";
                    }

                    cc.push(<th style={style} key={i}>{c}</th>);
                });

                return cc;
            }
        });
    };

    const cols = getCols();

    const getRows = () => {

        return props.maybeData.match({
            None: () => [<span>-</span>],
            Some: (data) => {
                if (data.data === undefined) {
                    return;
                }
                const col_names = data.data.meta.filter((x) => (props.config.table_column_hide[x.name] || false) === false)
                    .map((c) => c.name);

                const formatters = {},
                    csum = {};
                col_names.map((c, i) => {
                    csum[c] = 0.0;
                    switch (props.config.table_column_format[c] || "auto") {
                        case "auto":
                            formatters[c] = (e) => e;
                            break;
                        case "percentage":
                            formatters[c] = (e) => {
                                const display = props.config.table_column_display[c];
                                // return numeral(e).format(display);
                                if (typeof display !== "boolean") {
                                    return value_format(e, "percentage", Number(props.config.table_column_decimals[c]), props.config.table_column_currency[c]?.toString(), display);
                                } else {
                                    return e;
                                }
                            };
                            break;
                        case "number":
                            formatters[c] = (e) => {
                                const display = props.config.table_column_display[c];
                                // return numeral(e).format(display);
                                if (typeof display !== "boolean") {
                                    return value_format(e, "number", Number(props.config.table_column_decimals[c]), props.config.table_column_currency[c]?.toString(), display);
                                } else {
                                    return e;
                                }
                            };
                            break;
                        case "datetime":
                            formatters[c] = (e) => {
                                const display = props.config.table_column_display[c] || F.DATETIME_FORMAT;
                                try {
                                    return format(parseISO(e), display);
                                } catch (err) {
                                    return e;
                                }
                            };
                            break;
                        case "currency":
                            formatters[c] = (e) => {
                                const display = props.config.table_column_display[c],
                                    currency = props.config.table_column_currency[c] || "usd",
                                    symbol = F.CURRENCY[currency];
                                // return `${symbol}${numeral(e).format(display)}`;
                                if (typeof display !== "boolean") {
                                    return value_format(e, "currency", Number(props.config.table_column_decimals[c]), symbol, display);
                                } else {
                                    return e;
                                }
                            };
                            break;
                        case "scientific":
                            formatters[c] = (e) => {
                                const display = props.config.table_column_display[c];
                                if (typeof display !== "boolean") {
                                    return value_format(e, "scientific", Number(props.config.table_column_decimals[c]), props.config.table_column_currency[c]?.toString(), display);
                                } else {
                                    return e;
                                }
                            };
                            break;
                        default:
                            formatters[c] = (e) => e;
                        //                        throw new Error("handle me");
                    }
                });

                const tr_rows = data.data.data.map((r, i) => {
                    return <tr key={i}>
                        {props.config.table_hide_row_numbers ? null : <td>{i}</td>}
                        {
                            col_names.map((c, j) => {
                                const align = props.config.table_column_alignment[c] || "left",
                                    align_class = (align === "" || align === "left") ? {}
                                        : align === "right" ? { textAlign: "right" }
                                            : { textAlign: "center" };
                                const hide = props.config.table_column_hide[c] || false;

                                if (_isNumber(r[c])) {
                                    csum[c] += r[c];
                                }

                                return <td key={j} style={align_class}>
                                    {formatters[c](r[c])}
                                </td>;
                            })
                        }
                    </tr>;
                });

                const totals_row = props.config.table_hide_row_numbers ? [] : [<td className={`${s.SUCCESS}`}>TOTALS</td>];
                let has_total = false;
                col_names.map((c, j) => {
                    if (props.config.table_column_total && props.config.table_column_total[c]) {
                        const align = props.config.table_column_alignment[c] || "left",
                            align_class = (align === "" || align === "left") ? {}
                                : align === "right" ? { textAlign: "right" }
                                    : { textAlign: "center" };
                        has_total = true;
                        totals_row.push(<td  className={`${s.SUCCESS}`}  style={align_class}>{formatters[c](csum[c])}</td>);
                    } else {
                        totals_row.push(<td />);
                    }
                });

                if (has_total) {
                    tr_rows.push(<tr key="totals" className={`border border-2  ${s.BORDER}  `}>
                        {totals_row}
                    </tr>);
                }

                return tr_rows;
            }
        });
    };

    const rows = getRows();

    return <div className={`relative overflow-auto ${props.height}`}>
        <table className={"w-full   border table-auto bp4-html-table  bp4-html-table-bordered "
            + s.BORDER
            + (props.config.table_color_zebra_striping ? " bp4-html-table-striped " : " ")} >
            <thead>
                <tr>
                    {cols}
                </tr>
            </thead>

            <tbody>
                {rows}
            </tbody>
        </table >
    </div>;
}

