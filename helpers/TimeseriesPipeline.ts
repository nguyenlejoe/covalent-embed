import { ChartData, ChartDataSets } from "../components/node-comps/EditorSeries";

enum IAggregationInterval {
    HOURLY = "hour",
    DAILY = "day",
    WEEKLY = "week",
    MONTHLY = "month",
    QUARTERLY = "quarter",
    YEARLY = "year",
    UNDEFINED = ""
}

export class TimeseriesPipeline {
    private _x_column = "";
    private _y_column = "";
    private _detectedXIntervalAggregation = "";
    private rows: any[];
    private _filledDates: any[] = [];

    constructor(rows: any[], x_column?: string, fillEmpty?: boolean) {
        this.rows = rows;
        this._x_column = x_column !== undefined ? x_column : "";

        if (this._x_column !== "") {
            const isDateTimeValue: boolean = this.isDateTime(rows, this._x_column);
            this._detectedXIntervalAggregation = isDateTimeValue ? this.detectAggregationIntervalOnX(rows, this._x_column) : "";
            if (fillEmpty) {
                this._filledDates = this.FillEmptyDates(this.rows, this._x_column, this._detectedXIntervalAggregation);
            }
        } else {
            let keyDateObject: object = {};
            let keyNumericObject: object = {};
            const keyWithDateTime: object = {};
            const keyWithNumericValues: object = {};
            const metadataKeys = Object.keys(rows[0]);
            // eslint-disable-next-line guard-for-in
            for (const key in metadataKeys) {
                const currentKey = metadataKeys[key];
                Object.assign(keyWithDateTime, {[currentKey]: this.isDateTime(rows, currentKey)});
                Object.assign(keyWithNumericValues, {[currentKey]: this.isNumeric(rows, currentKey)});
            }
            keyDateObject = Object.entries(keyWithDateTime).filter((key, index) => key.includes(true)).reduce((cur, key) => {
                return Object.assign(cur, { [key[0]]: key[1] });
            }, {});
            keyNumericObject = Object.entries(keyWithNumericValues).filter((key, index) => key.includes(true)).reduce((cur, key) => {
                return Object.assign(cur, { [key[0]]: key[1] });
            }, {});

            this._x_column = Object.keys(keyDateObject)[0];
            this._y_column = Object.keys(keyNumericObject)[0];
        }

    }

    public get x_column() {
        return this._x_column;
    }

    public get y_column() {
        return this._y_column;
    }

    public get detectedXIntervalAggregation() {
        return this._detectedXIntervalAggregation;
    }

    public get filledDates() {
        return this._filledDates;
    }

    private getDifferenceInDays(date1: any, date2: any, aggregatedXInterval: string) {
        switch (aggregatedXInterval) {
            case "day":
                // eslint-disable-next-line no-case-declarations
                const diffInMs = Math.abs(date2 - date1);
                return diffInMs / (1000 * 60 * 60 * 24);
            case "month":
                return (
                    date2.getMonth() -
                    date1.getMonth() +
                    12 * (date2.getFullYear() - date1.getFullYear())
                );
            case "quarter":
                return Math.abs((date2.getFullYear()*12 + date2.getMonth()) - (date1.getFullYear()*12 + date1.getMonth())) === 3 ? 1 : Math.abs((date2.getFullYear()*12 + date2.getMonth()) - (date1.getFullYear()*12 + date1.getMonth()))
            case "week":
                // eslint-disable-next-line no-case-declarations
                return Math.abs(date2 - date1) / (1000 * 60 * 60 * 24) === 7 ? 1 : Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
            case "year":
                // eslint-disable-next-line no-case-declarations
                let diff = (date2.getTime() - date1.getTime()) / 1000;
                diff /= (60 * 60 * 24);
                return Math.abs(Math.round(diff/365.25));
            default:
                return;
        }
    }

    private FillEmptyDates(rows: any, xColumn: string, aggregatedXInterval: string) {
        const d1 = new Date(rows[0][xColumn].replace(/-/g, "\/"));
        const length = rows.length - 1;
        const d2 = new Date(rows[length][xColumn].replace(/-/g, "\/"));
        const dates = this.getDatesInRange(d1, d2, aggregatedXInterval, rows, xColumn);

        const emptyDateMap = new Map();
        const missingDates: Set<string> = new Set();
        const simpleDateFormat = new Set();

        if (dates.length === 0) {
            return rows;
        }
        const result = rows.sort(function(a,b) {
            return Date.parse(a[xColumn]) - Date.parse(b[xColumn]);
        });

        if (aggregatedXInterval === "hour") {
            result.forEach((e: any, i: any) => {
                simpleDateFormat.add(this.formatDate(new Date(e[xColumn])));
            });

            for (let i = 0; i < dates.length; i++) {
                if (!simpleDateFormat.has(dates[i])) {
                    missingDates.add(dates[i]);
                }
            }

            for (let i = 0; i < rows.length; i++) {
                for (const element of missingDates) {
                    if (new Date(rows[i][xColumn].replace(/\s.+/g, "")).toDateString() === new Date(element.replace(/\s.+/g, "")).toDateString()) {
                        if ((Math.abs(new Date(rows[i][xColumn]).getHours() - new Date(element).getHours()) === 1) && (new Date(rows[i][xColumn]) < new Date(element))) {
                            if (emptyDateMap.get(element)) {
                                const replica: any = Object.assign({}, rows[i]);
                                replica[xColumn] = element;
                                emptyDateMap.get(element).push(replica);
                            } else {
                                const replica: any = Object.assign({}, rows[i]);
                                replica[xColumn] = element;
                                emptyDateMap.set(element, [replica]);
                            }
                        }
                    } else if (this.getDifferenceInDays(new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(element.replace(/-/g, "\/").replace(/\s.+/g, "")), "day") === 1) {
                        if ((Math.abs(new Date(rows[i][xColumn]).getHours() - new Date(element).getHours()) === 23) && (new Date(rows[i][xColumn]) < new Date(element))) {
                            if (emptyDateMap.get(element)) {
                                const replica: any = Object.assign({}, rows[i]);
                                replica[xColumn] = element;
                                emptyDateMap.get(element).push(replica);
                            } else {
                                const replica: any = Object.assign({}, rows[i]);
                                replica[xColumn] = element;
                                emptyDateMap.set(element, [replica]);
                            }
                        }
                    }
                }
            }

            if (missingDates.size > emptyDateMap.size) {
                for (const element of missingDates) {
                    if (!emptyDateMap.get(element)) {
                        emptyDateMap.forEach((value, key) => {
                            if (new Date(element.replace(/\s.+/g, "")).toDateString() === new Date(key.replace(/\s.+/g, "")).toDateString()) {
                                if ((Math.abs(new Date(element).getHours() - new Date(key).getHours()) === 1) && (new Date(element) > new Date(key))) {
                                    const prevValues: any = [];
                                    for (let i = 0; i < emptyDateMap.get(key).length; i++) {
                                        const replica: any = Object.assign({}, emptyDateMap.get(key)[i]);
                                        replica[xColumn] = element;
                                        prevValues.push(replica);
                                    }
                                    emptyDateMap.set(element, prevValues);
                                }
                            } else if (this.getDifferenceInDays(new Date(element.replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")), "day") === 1) {
                                if ((Math.abs(new Date(element).getHours() - new Date(key).getHours()) === 23) && (new Date(element) > new Date(key))) {
                                    const prevValues: any = [];
                                    for (let i = 0; i < emptyDateMap.get(key).length; i++) {
                                        const replica: any = Object.assign({}, emptyDateMap.get(key)[i]);
                                        replica[xColumn] = element;
                                        prevValues.push(replica);
                                    }
                                    emptyDateMap.set(element, prevValues);
                                }
                            }
                        });
                    }
                }
            }

            const sortedAsc = new Map([...emptyDateMap].sort());

            sortedAsc.forEach((value, key) => {
                for (let i = 0; i < rows.length; i++) {
                    if (new Date(rows[i][xColumn].replace(/\s.+/g, "")).toDateString() === new Date(key.replace(/\s.+/g, "")).toDateString()) {
                        if ((Math.abs(new Date(rows[i][xColumn]).getHours() - new Date(key).getHours()) === 1) && (new Date(key) > new Date(rows[i][xColumn]))) {
                            rows.splice(i+1, 0, ...value);
                            break;
                        }
                    } else if (this.getDifferenceInDays(new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")), "day") === 1) {
                        if ((Math.abs(new Date(rows[i][xColumn]).getHours() - new Date(key).getHours()) === 23) && (new Date(key) > new Date(rows[i][xColumn]))) {
                            rows.splice(i+1, 0, ...value);
                            break;
                        }
                    }
                }
            });

            const sorted = rows.sort(function(a,b) {
                return Date.parse(a[xColumn]) - Date.parse(b[xColumn]);
            });

            return sorted;


        } else {

            result.forEach((e: any, i: any) => {
                simpleDateFormat.add(new Date(e[xColumn]).toISOString().split("T")[0]);
            });

            for (let i = 0; i < dates.length; i++) {
                if (!simpleDateFormat.has(dates[i].replace(/\s.+/g, ""))) {
                    missingDates.add(dates[i]);
                }
            }

            for (let i = 0; i < rows.length; i++) {
                for (const element of missingDates) {
                    if ((this.getDifferenceInDays(new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(element.replace(/-/g, "\/").replace(/\s.+/g, "")), aggregatedXInterval) === 1)
                        && new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, "")) < new Date(element.replace(/-/g, "\/").replace(/\s.+/g, ""))) {
                        if (emptyDateMap.get(element)) {
                            const replica: any = Object.assign({}, rows[i]);
                            replica[xColumn] = element;
                            emptyDateMap.get(element).push(replica);
                        } else {
                            const replica: any = Object.assign({}, rows[i]);
                            replica[xColumn] = element;
                            emptyDateMap.set(element, [replica]);
                        }
                    }
                }
            }

            if (missingDates.size > emptyDateMap.size) {
                for (const element of missingDates) {
                    if (!emptyDateMap.get(element)) {
                        emptyDateMap.forEach((value, key) => {
                            if ((this.getDifferenceInDays(new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(element.replace(/-/g, "\/").replace(/\s.+/g, "")), aggregatedXInterval) === 1)
                                && new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")) < new Date(element.replace(/-/g, "\/").replace(/\s.+/g, ""))) {
                                const prevValues: any = [];
                                for (let i = 0; i < emptyDateMap.get(key).length; i++) {
                                    const replica: any = Object.assign({}, emptyDateMap.get(key)[i]);
                                    replica[xColumn] = element;
                                    prevValues.push(replica);
                                }
                                emptyDateMap.set(element, prevValues);
                            }
                        });
                    }
                }
            }

            const sortedAsc = new Map([...emptyDateMap].sort());

            sortedAsc.forEach((value, key) => {
                for (let i = 0; i < rows.length; i++) {
                    if ((this.getDifferenceInDays(new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, "")), new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")), aggregatedXInterval) === 1)
                    && new Date(key.replace(/-/g, "\/").replace(/\s.+/g, "")) > new Date(rows[i][xColumn].replace(/-/g, "\/").replace(/\s.+/g, ""))) {
                        rows.splice(i+1, 0, ...value);
                        break;
                    }
                }
            });

            const sorted = rows.sort(function(a,b) {
                return Date.parse(a[xColumn]) - Date.parse(b[xColumn]);
            });

            return sorted;

        }

    }

    private padTo2Digits = (num) => {
        return num.toString().padStart(2, "0");
    };

    private formatDate = (date) => {
        return (
            [
                date.getFullYear(),
                this.padTo2Digits(date.getMonth() + 1),
                this.padTo2Digits(date.getDate()),
            ].join("-") +
            " "  +
            [
                this.padTo2Digits(date.getHours()),
                "00",
                "00",
            ].join(":")
        );
    };

    private getDatesInRange = (startDate: Date, endDate: Date, aggregatedXInterval: string, rows: any, xColumn: string) => {
        const date = new Date(startDate.getTime());
        date.setDate(date.getDate());

        const dateTemp = new Date(this.formatDate(startDate));
        const endDateTemp = new Date(this.formatDate(endDate));
        const date2 = new Date(dateTemp.getTime());

        const dates: any[] = [];
        switch (aggregatedXInterval) {
            case "day":
                while (date <= endDate) {
                    // dates.push(new Date(date).toISOString().split("T")[0]);
                    dates.push(new Date(date).toISOString().split("T")[0] + " 00:00:00");
                    date.setDate(date.getDate() + 1);
                }
                break;
            case "month":
                while (startDate <= endDate) {
                    dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().split("T")[0]);
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
                }
                break;
            case "quarter":
                while (startDate <= endDate) {
                    dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().split("T")[0]);
                    startDate.setMonth(startDate.getMonth() + 3);
                }
                break;
            case "week":
                while (date <= endDate) {
                    dates.push(new Date(date).toISOString().split("T")[0]);
                    date.setDate(date.getDate() + 7);
                }
                break;
            case "year":
                while (startDate <= endDate) {
                    dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), 1).toISOString().split("T")[0]);
                    startDate.setFullYear(startDate.getFullYear() + 1);
                }
                break;
            case "hour":
                while (date2 <= endDateTemp) {
                    dates.push(this.formatDate(new Date(date2)));
                    date2.setHours(date2.getHours() + 1);
                }
                break;
            default:
                return [];
        }

        const checker = dates.every((element, index) => {
            if (element === rows[index][xColumn]) {
                return true;
            }
            return false;
        });

        if (checker) {
            return [];
        }

        return dates;
    };


    private isDateTime = (rows: any[], column: string): boolean => {
        const DATETIME_REGEX = /^\d{4}\-\d{2}(\-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?([-+][0-2]\d(:\d{2})?)?)?)?$/,
            YEAR_WEEK_REGEX = /^(19|20)\d\d[0-5]\d$/;

        let foundCount = 0;

        for (let i = 0; i < rows.length && foundCount < 10; i++) {
            if (rows[i][column] == null) {
                continue;
            }
            if (!(DATETIME_REGEX.test(rows[i][column]) || YEAR_WEEK_REGEX.test(rows[i][column]))) {
                return false;
            }
            foundCount++;
        }

        return foundCount > 0 ? true : false;
    };


    private detectAggregationIntervalOnX = (rows: any[], timeAxisIndex: string) => {

        const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

        const timeAxis = rows.map((c) => c[timeAxisIndex]);

        const timeAxisRange = timeAxis.slice(0, timeAxis.length - 1);

        let minInterval = 3000;

        for (let interval_start = 0;
            interval_start < timeAxisRange.length;
            interval_start++) {

            const val_start = new Date(timeAxisRange[interval_start]),
                val_end = new Date(timeAxis[interval_start + 1]),
                interval = Math.abs(Math.round((val_end.getTime() - val_start.getTime()) / MILLISECONDS_IN_HOUR));

            if (interval < minInterval) {
                minInterval = interval !== 0 ? interval : minInterval;
            }
        }

        // ok, so now we have an estimate of the number of hours, time to
        // detect rollups

        const days = Math.abs(minInterval) / 24;

        if (minInterval > 0.9 && minInterval < 22) {
            return IAggregationInterval.HOURLY;
        } else if (days > 0.9 && days < 6.9) {
            return IAggregationInterval.DAILY;
        } else if (days >= 6.9 && days < 26.9) {
            return IAggregationInterval.WEEKLY;
        } else if (days >= 26.9 && days < 75) {
            return IAggregationInterval.MONTHLY;
        } else if (days >= 75 && days < 95) {
            return IAggregationInterval.QUARTERLY;
        } else if (days >= 95) {
            return IAggregationInterval.YEARLY;
        } else {
            return IAggregationInterval.UNDEFINED;
        }
    };

    private isNumeric = (rows: any[], column: string): boolean => {
        const numericRegExp = new RegExp("^" + "-?\\d+(\\.\\d+)?(e-\\d+)?" + "$");
        let foundCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const value: any = rows[i][column],
                str: string = ((value + "").replace(/,/g, "")).trim();

            if (!numericRegExp.test(str)) {
                return false;
            }
            foundCount++;
        }

        return foundCount > 0 ? true : false;
    };

}
