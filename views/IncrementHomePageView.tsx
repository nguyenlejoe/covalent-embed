import React, { Suspense, useState, useEffect } from "react";
import { HTMLSelect, HotkeysTarget2, Toaster, Position, IToastProps, Button, Menu, MenuItem, MenuDivider, Intent, PopoverPosition, H2, HotkeysProvider, Tabs, Tab, H1, Spinner, Icon } from "@blueprintjs/core";
import { FILLER } from "../helpers/filler";
import PagesListView from "./PagesListView";
import { None, Some } from "../../option";
import QueryListView from "./QueryListView";
import AppsListView from "./AppsListView";

import { isProduction } from "../../models";

const COVALENT_GROUP_ID = "group_d632592ddbde4a499452d25b";

export default function IncrementHomePageView({ initState, darkMode, showMessage, setNavBarDropDown, maybeTeamList, token }) {

    const name = initState.match({
        None: () => <span>{FILLER}</span>,
        Some: (s) => <span>{s.display_name.charAt(0).toUpperCase() + s.display_name.slice(1)}</span>
    });

    return <div className="p-8 ">
        <div className="">
            <H1 className="my-4 ">Welcome, {name}</H1>

            <Tabs>
                <Tab id="pages" title={<span> <Icon icon="book" />  Pages </span>}  panel={
                    <PagesListView
                        token={token}
                        maybeTeamList={maybeTeamList}
                        groupId={initState.match({
                            None: () => None,
                            Some: (s) => {
                                if (s.group?.id) {
                                    return new Some(s.group.id);

                                } else {
                                    return None;
                                }
                            }
                        })}
                        darkMode={darkMode}
                        showMessage={showMessage}
                        setNavBarDropDown={setNavBarDropDown}
                    />
                } />
                {isProduction ? initState.match({
                    None: () => null,
                    Some: (s) => {
                        if (s.group?.id === COVALENT_GROUP_ID) {
                            return <Tab id="query" title={<span> <Icon icon="code-block" />  Queries </span>}  panel={
                                <QueryListView
                                    token={token}
                                    maybeTeamList={maybeTeamList}
                                    darkMode={darkMode}
                                    showMessage={showMessage}
                                    setNavBarDropDown={setNavBarDropDown}
                                    groupId={initState.match({
                                        None: () => None,
                                        Some: (s) => {
                                            if (s.group?.id) {
                                                return new Some(s.group.id);
                                            } else {
                                                return None;
                                            }
                                        }
                                    })}
                                />
                            } />;
                        }
                    }
                }) :
                    <Tab id="query" title={<span> <Icon icon="code-block" />  Queries </span>} panel={
                        <QueryListView
                            token={token}
                            maybeTeamList={maybeTeamList}
                            darkMode={darkMode}
                            showMessage={showMessage}
                            setNavBarDropDown={setNavBarDropDown}
                            groupId={initState.match({
                                None: () => None,
                                Some: (s) => {
                                    if (s.group?.id) {
                                        return new Some(s.group.id);
                                    } else {
                                        return None;
                                    }
                                }
                            })}
                        />}
                    />
                }
                <Tab id="apps" title={<span> <Icon icon="application" /> Apps </span>} panel={
                    <AppsListView
                        token={token}
                        maybeTeamList={maybeTeamList}
                        groupId={initState.match({
                            None: () => None,
                            Some: (s) => {
                                if (s.group?.id) {
                                    return new Some(s.group.id);

                                } else {
                                    return None;
                                }
                            }
                        })}
                        darkMode={darkMode}
                        showMessage={showMessage}
                        setNavBarDropDown={setNavBarDropDown}
                    />
                } />
            </Tabs>

        </div>

    </div>;
}
