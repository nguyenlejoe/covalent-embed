import React from "react";
import { HTMLSelect, Button, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { CHAIN_ID_MAP, CHAIN_ID_MAP_r } from "../helpers/common";
import _includes = require("lodash/includes");

enum SubNavState {
    HIDE, VISIBLE_CHAIN_SELECTED, VISIBLE_DATE_SELECTOR, VISIBLE_DISABLED
}
export const renderChainSelect = (currentChainNames: string[], setCurrentChainNames: Function) => {
    const chainMenu = <Menu>
        {
            Array.from(CHAIN_ID_MAP.keys()).map((k, i) => {
                return <MenuItem
                    key={i}
                    text={k}
                    icon={_includes(currentChainNames, CHAIN_ID_MAP.get(k)) ? "tick-circle" : null}
                    onClick={() => {

                        if (_includes(currentChainNames, CHAIN_ID_MAP.get(k))) {
                            setCurrentChainNames(currentChainNames.filter((x) => x !== CHAIN_ID_MAP.get(k)));
                        } else {
                            setCurrentChainNames([...currentChainNames, CHAIN_ID_MAP.get(k)]);
                        }
                    }}
                />;
            })
        }
    </Menu>;

    const label = currentChainNames.length === 0
        ? "Chains"
        : currentChainNames.map((v) => {
            return CHAIN_ID_MAP_r.get(v);
        }).join(", ");

    return <Popover2 content={chainMenu} placement="bottom-start">
        <Button>{label}</Button>
    </Popover2>;
};

export const renderDataAggSelect = (currentDateAgg: string, selectorNav: SubNavState, setCurrentDateAgg: Function) => {
    return <HTMLSelect value={currentDateAgg} disabled={selectorNav === SubNavState.VISIBLE_DISABLED} onChange={(e) => {
        setCurrentDateAgg(e.currentTarget.value);
    }}>
        <option value="hourly">by hour</option>
        <option value="daily">by day</option>
        <option value="weekly">by week</option>
        <option value="monthly">by month</option>
        <option value="quarterly">by quarter</option>
        <option value="yearly">by year</option>
    </HTMLSelect>;
};

export const renderChronoSelect = (currentDateRange: string, selectorNav: SubNavState, setCurrentDateRange: Function ) => {
    return <HTMLSelect value={currentDateRange} disabled={selectorNav === SubNavState.VISIBLE_DISABLED} onChange={(e) => {
        setCurrentDateRange(e.currentTarget.value);
    }}>
        <option value="last_1h">Last 1 hr</option>
        <option value="last_24h">Last 24 hrs</option>
        <option value="last_7d">Last 7 days</option>
        <option value="this_month">This month</option>
        <option value="last_30days">Last 30 days</option>
        <option value="last_quarter">Last quarter</option>
        <option value="this_quarter">This quarter</option>
        <option value="last_year">Last year</option>
        <option value="this_year">This year</option>
    </HTMLSelect>;
};
