
import _each = require("lodash/each");
import _extend = require("lodash/extend");
import _find = require("lodash/find");
import _has = require("lodash/has");
import _contains = require("lodash/includes");
import _indexOf = require("lodash/indexOf");
import _map = require("lodash/map");
import _reduce = require("lodash/reduce");
import _values = require("lodash/values");

export interface IDimensionAttributes {
    id: string;
}

export interface IMeasureAttributes {
    key: string;
    name: string;
    format: string;
    aggregation: string;
}

export interface IPivotResult {
    getRowKeys: () => string[];
    getColKeys: () => string[];
    getRowAttrs: () => IDimensionAttributes[];
    getColAttrs: () => IDimensionAttributes[];
    getMeasureAttrs: () => IMeasureAttributes[];
    getNestedRowKeys: Function;
    getNestedColKeys: Function;
    getSortedColKeys: Function;
    getSortedRowKeys: Function;
    values: Function;
}

const AGGREGATION_FUNCTIONS: any = {
    sum: (measureKey: string, aggregator: Aggregator) => {
        return _reduce(aggregator.records, function(summed: any, record: any) {
            return summed + (parseFloat(record[measureKey]) || 0);
        }, 0);
    },
    concat: (measureKey: string, aggregator: Aggregator) => {
        let ret = "";
        _each(aggregator.records, (r: any) => {
            const measureKeyValue = r[measureKey];
            try {
                ret = ret.concat(ret, measureKeyValue);
            } catch (e) {
                // FIXME: Do something here!
            }
        });
        return ret;
    }
    // count: count,
    // counta: counta,
    // unique: unique,
    // average: average,
    // median: median,
    // mode: mode,
    // max: max,
    // min: min
};

class Aggregator {
    hasCache: boolean;
    records: any[];
    val: any;

    private measure: IMeasureAttributes;
    private composer: Composer;

    constructor(composer: Composer, measure: IMeasureAttributes) {
        this.val = null;
        this.measure = measure;
        this.composer = composer;
        this.records = [];
        this.hasCache = false;
    }

    // clearCache() {
    //   this.hasCache = false;
    //   return this.val = null;
    // }

    push(record: any) {
        this.hasCache = false;
        return this.records.push(record);
    }
    formattedValue() {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    value() {
        if (this.hasCache) {
            return this.val;
        }

        this.hasCache = true;
        if (this.measure.aggregation) {
            const aggregatorFunction = AGGREGATION_FUNCTIONS[this.measure.aggregation];
            return this.val = aggregatorFunction(this.measure.key, this);
            /* else if (this.measure.expression) {
                        try {
                            return this.val = this.composer.pivot.aggregatorEvaluateFunction.apply(this, [this.measure.expression]);
                        } catch (error) {
                            e = error;
                            return this.val = null;
                        }
                    } */

        } else {
            return this.val = null;
        }
    }
}

interface IAggregatorMeasure {
    measure: string;
    aggregator: Aggregator;
}

class Composer {
    pivot: Pivot;
    rowKey: string;
    colKey: string;
    measureKeys: string[];
    aggregators: IAggregatorMeasure[];
    __source_row: any;

    constructor(pivot: any, rowKey: any, colKey: any, record: any) {
        this.pivot = pivot;
        this.rowKey = rowKey;
        this.colKey = colKey;
        this.measureKeys = [];
        this.aggregators = [];
        this.__source_row = record;
    }

    add(measure: IMeasureAttributes, record: any) {
        const measureKey = this.pivot.serializeKey(measure);
        if ((_indexOf(this.measureKeys, measureKey)) < 0) {
            this.measureKeys.push(measureKey);
            this.aggregators.push({
                measure: measureKey,
                aggregator: new Aggregator(this, measure)
            });
        }
        const agg = _find(this.aggregators, (a) => {
            return a.measure === measureKey;
        });
        if (agg) {
            return agg.aggregator.push(record);
        } else {
            throw new Error("should never reach here");
        }
    }
    values() {
        return _map(this.aggregators, (aggregator) => {
            const measure = this.pivot.deserializeKey(aggregator.measure);
            return {
                measure: measure.key != null ? measure.key : "–",
                aggregation: measure.aggregation,
                expression: measure.expression,
                format: measure.format,
                formatExpression: measure.formatExpression,
                value: aggregator.aggregator != null ? aggregator.aggregator.value() : null,
                __source_row: this.__source_row
            };
        });
    }
    value() {
        // eslint-disable-next-line no-debugger
        debugger;
    }
}


export class Pivot {
    private rowsAttrs!: IDimensionAttributes[];
    private colsAttrs!: IDimensionAttributes[];
    private measuresAttrs!: IMeasureAttributes[];
    private rowKeys: any[];
    private colKeys: any[];
    private measureKeys: string[];
    private serializedRowKeys: string[];
    private serializedColKeys: string[];
    private sortedRowKeys!: string[];
    private sortedColKeys!: string[];

    private map: any;

    private grandTotal: Composer;
    private rowTotals: any;
    private colTotals: any;

    constructor() {
        this.rowKeys = [];
        this.colKeys = [];

        this.measureKeys = [];
        this.serializedRowKeys = [];
        this.serializedColKeys = [];
        // this.sortedRowKeys = null;
        // this.sortedColKeys = null;

        this.map = {};

        this.grandTotal = new Composer(this, [], [], null);
        this.rowTotals = {};
        this.colTotals = {};

        this.processRecord = this.processRecord.bind(this);
    }

    serializeKey(keys: string[] | any): string {
        return JSON.stringify(keys);
    }

    deserializeKey(key: string) {
        return JSON.parse(key);
    }

    getComposer(rowKey: string[], colKey: string[]) {
        const serializedRowKey = this.serializeKey(rowKey),
            serializedColKey = this.serializeKey(colKey);

        if (_has(this.map, serializedRowKey)) {
            if (_has(this.map[serializedRowKey], serializedColKey)) {
                return this.map[serializedRowKey][serializedColKey];
            }
        }
        return null;

    }

    getSortedRowKeys() {
        return this.sortedRowKeys || (this.sortedRowKeys = this.getSortedKeys(this.rowKeys, this.rowsAttrs, "row"));
    }
    getSortedColKeys() {
        return this.sortedColKeys || (this.sortedColKeys = this.getSortedKeys(this.colKeys, this.colsAttrs, "col"));
    }

    getNestedKeys(dataset: any[]): any {
        if (!dataset || dataset.length === 0) {
            return {
                children: []
            };
        }

        let root: any = {},
            node: any = null,
            next: any = null;

        const _dataset = _map(dataset, (x) => {
            const a = JSON.parse(JSON.stringify(x));
            a.unshift("root");
            return a;
        });

        _each(_dataset, (d) => {
            const path = d;
            node = root;

            _each(path, (p) => {
                const _path: any = p;
                if (!node.children) {
                    node.children = {};
                }

                next = node.children[_path];
                if (!next) {
                    next = node.children[_path] = {
                        key: _path
                    };
                }
                node = next;
            });
        });


        root = _values(root.children)[0];

        const childrenToArray = function(n: any, depth: number): any {
            if (depth == null) {
                depth = 0;
            }
            _extend(n, {
                depth
            });
            if (n.children) {
                _extend(n, {
                    children: _values(n.children)
                });
                return _each(n.children, function(child) {
                    return childrenToArray(child, n.depth + 1);
                });
            }
        };

        childrenToArray(root, 0);

        return root;
    }

    pivot(records: any[],
          rows: IDimensionAttributes[],
          cols: IDimensionAttributes[],
          measures: IMeasureAttributes[]): IPivotResult {

        this.rowsAttrs = rows;
        this.colsAttrs = cols;
        this.measuresAttrs = measures;

        _each(records, this.processRecord);

        return {
            getRowKeys: () => {
                return this.rowKeys;
            },
            getColKeys: () => {
                return this.colKeys;
            },
            getColAttrs: () => {
                return this.colsAttrs;
            },
            getRowAttrs: () => {
                return this.rowsAttrs;
            },
            getMeasureAttrs: () => {
                return this.measuresAttrs;
            },
            getNestedColKeys: () => {
                return this.getNestedKeys(this.getSortedColKeys());
            },
            getNestedRowKeys: () => {
                return this.getNestedKeys(this.getSortedRowKeys());
            },
            getSortedColKeys: () => {
                return this.sortedColKeys || (this.sortedColKeys = this.getSortedKeys(this.colKeys, this.colsAttrs, "col"));
            },
            getSortedRowKeys: () => {
                return this.sortedRowKeys || (this.sortedRowKeys = this.getSortedKeys(this.rowKeys, this.rowsAttrs, "row"));
            },
            values: (rowKey: string[], colKey: string[]) => {
                if (rowKey.length > 0 && colKey.length > 0) {
                    const composer = this.getComposer(rowKey, colKey);
                    if (composer) {
                        return composer.values();
                    }
                    return null;
                } else if (rowKey.length === 0 && colKey.length === 0) {
                    if (this.grandTotal) {
                        return this.grandTotal.values();
                    }
                    return null;
                } else if (colKey.length === 0) {
                    const sKey = this.serializeKey(rowKey);
                    if (_has(this.rowTotals, sKey)) {
                        return this.rowTotals[sKey].values();
                    }
                    return null;
                } else if (rowKey.length === 0) {
                    const sKey = this.serializeKey(colKey);
                    if (_has(this.colTotals, sKey)) {
                        return this.colTotals[sKey].values();
                    }
                    return null;
                }
            }
        };
    }

    private processRecord(typedRecord: any) {

        const rowKeys = _map(this.rowsAttrs, (x) => {
                return typedRecord[x.id];
            }),
            colKeys = _map(this.colsAttrs, (x) => {
                return typedRecord[x.id];
            }),

            serializedRowKey = this.serializeKey(rowKeys),
            serializedColKey = this.serializeKey(colKeys);

        const serializedColKeysList: string[] = [];
        _each(colKeys, (key: string, index: number) => {
            const slicedColKeys = colKeys.slice(0, index + 1),
                serializedSlicedColKeys = this.serializeKey(slicedColKeys);

            serializedColKeysList.push(serializedSlicedColKeys);

            if (!_contains(this.serializedColKeys, serializedColKey)) {
                this.colKeys.push(colKeys);
                this.serializedColKeys.push(serializedColKey);
            }

            if (!this.colTotals[serializedSlicedColKeys]) {
                this.colTotals[serializedSlicedColKeys] = new Composer(this, [], slicedColKeys, null);
            }

        });

        const serializedRowKeyList: string[] = [];
        _each(rowKeys, (key, index) => {
            const slicedRowKeys = rowKeys.slice(0, index + 1),
                serializedSlicedRowKeys = this.serializeKey(slicedRowKeys);
            serializedRowKeyList.push(serializedSlicedRowKeys);

            if (!_contains(this.serializedRowKeys, serializedRowKey)) {
                this.rowKeys.push(rowKeys);
                this.serializedRowKeys.push(serializedRowKey);
            }

            if (!this.rowTotals[serializedSlicedRowKeys]) {
                this.rowTotals[serializedSlicedRowKeys] = new Composer(this, slicedRowKeys, [], null);
            }

            if (colKeys.length > 0) {
                if (!_has(this.map, serializedSlicedRowKeys)) {
                    this.map[serializedSlicedRowKeys] = {};
                }

                _each(serializedColKeysList, (cKey) => {
                    if (!_has(this.map[serializedSlicedRowKeys], cKey)) {
                        const cKeys = this.deserializeKey(cKey);
                        this.map[serializedSlicedRowKeys][cKey] = new Composer(this, slicedRowKeys, cKeys, typedRecord);
                    }
                });
            }
        });

        _each(this.measuresAttrs, (measure) => {
            this.grandTotal.add(measure, typedRecord);

            const colKeyList = serializedColKeysList.length > 0 ? serializedColKeysList : [serializedColKey];

            _each(colKeyList, (cKey) => {
                const ref = this.colTotals[cKey];
                if (ref != null) {
                    ref.add(measure, typedRecord);
                }

                _each(serializedRowKeyList, (rKey) => {
                    const ref2 = this.rowTotals[rKey];
                    if (ref2 != null) {
                        ref2.add(measure, typedRecord);
                    }

                    const ref3 = this.map[rKey];
                    if (ref3 != null) {
                        const ref4 = ref3[cKey];
                        if (ref4 != null) {
                            ref4.add(measure, typedRecord);
                        }
                    }
                });
            });
        });
    }


    private getSortedKeys(keys: any[], attrs: IDimensionAttributes[], sortKind: string) {
        if (keys == null) {
            keys = [];
        }
        if (attrs == null) {
            attrs = [];
        }
        // if (sortKind == null) {
        //     sortKind = null;
        // }
        const sort = (as: any, bs: any) => {
            let a: any, a1: any, b: any, b1: any;
            const rx = /(\d+)|(\D+)/g;
            const rd = /\d/;
            const rz = /^0/;
            if (typeof as === "number" || typeof bs === "number") {
                if (isNaN(as)) {
                    return 1;
                }
                if (isNaN(bs)) {
                    return -1;
                }
                return as - bs;
            }
            a = String(as).toLowerCase();
            b = String(bs).toLowerCase();
            if (a === b) {
                return 0;
            }
            if (!(rd.test(a) && rd.test(b))) {
                return (a > b ? 1 : -1);
            }
            a = a.match(rx);
            b = b.match(rx);
            while (a.length && b.length) {
                a1 = a.shift();
                b1 = b.shift();
                if (a1 !== b1) {
                    if (rd.test(a1) && rd.test(b1)) {
                        return a1.replace(rz, ".0") - b1.replace(rz, ".0");
                    } else {
                        return (a1 > b1 ? 1 : -1);
                    }
                }
            }
            return a.length - b.length;
        };

        return _map(keys, (key) => {
            return _extend([], key);
        }).sort((a: any, b: any) => {
            let _key: any, _value_a: any, _value_b: any, args_a: any, args_b: any,
                ascending: any, b_value: any, diff: any, i: any, index_a: any, key_a: any, key_b: any,
                len: any, pos: any, ref: any, sortObject: any, type: any, value_a: any;
            diff = 0;
            if (a.length !== b.length) {
                return diff;
            }
            for (index_a = i = 0, len = a.length; i < len; index_a = ++i) {
                value_a = a[index_a];
                sortObject = (ref = attrs[index_a]) != null ? ref.sort : void 0;
                type = (sortObject != null ? sortObject.type : void 0) || null;
                ascending = sortObject != null && sortObject.ascending === true ? 1 : -1;
                diff = (function() {
                    let ref1: any, ref2: any, ref3: any, ref4: any, ref5: any;
                    switch (type) {
                        case "self":
                            b_value = b[index_a];
                            return sort(value_a, b_value) * ascending;
                        case "measure":
                            // key_a = _slice(a, 0, index_a + 1);
                            // key_b = _slice(b, 0, index_a + 1);
                            key_a = a.slice(0, index_a + 1);
                            key_b = b.slice(0, index_a + 1);
                            _key = sortObject.key;
                            pos = sortObject.measureIndex || 0;
                            ref1 = sortKind === "row"
                                ? [[key_a, _key], [key_b, _key]]
                                : [[_key, key_a], [_key, key_b]];
                            args_a = ref1[0];
                            args_b = ref1[1];
                            _value_a = ((ref2 = this.values.apply(this, args_a)) != null ? (ref3 = ref2[pos]) != null ? ref3.value : void 0 : void 0) || null;
                            _value_b = ((ref4 = this.values.apply(this, args_b)) != null ? (ref5 = ref4[pos]) != null ? ref5.value : void 0 : void 0) || null;
                            return sort(_value_a, _value_b) * ascending;
                        default:
                            return 0;
                    }
                }).call(this);
                if (diff !== 0) {
                    break;
                }
            }
            return diff;
        });
    }

}
