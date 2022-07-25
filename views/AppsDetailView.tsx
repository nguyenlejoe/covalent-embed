import { Button, Checkbox, H2, H3, Icon, InputGroup, Intent, Menu, MenuItem, NonIdealState, Tag } from "@blueprintjs/core";

import { useParams } from "react-router-dom";

import * as C from "../helpers/colors";

import React, { useEffect, useState } from "react";
import { Option, None, Some } from "../../option";
import { api, App, Endpoint } from "../helpers/api";
import { FILLER } from "../helpers/filler";
import { Avatar } from "../../components/lipstick";
import { TimestampView } from "../../components/TimestampView";

interface AppsDetailViewParams {
    appId: string;
    // groupSlug: string;
    // pageSlug: string;
}

interface AppsDetailViewProps {
    token: string;
    darkMode: boolean;
}

export default function AppsDetailView(props: AppsDetailViewProps) {

    const { appId } = useParams<AppsDetailViewParams>();

    const { darkMode } = props;

    const [maybeApp, setApp] = useState<Option<App>>(None);
    const [maybeEndpoints, setEndpoints] = useState<Option<Endpoint[]>>(None);

    useEffect(() => {
        api.getApp(props.token, appId)
            .then((ev) => {
                setApp(new Some(ev.data.item));

                api.getEndpointsForApps(props.token, appId)
                    .then((ev2) => {
                        setEndpoints(new Some(ev2.data.items));
                    });
            });
    }, [appId]);

    const name = maybeApp.match({
        Some: (app) => {
            return <span>{app.display_name}</span>;
        },
        None: () => <span>{FILLER}</span>
    });

    const s = darkMode ? C.DARK : C.LIGHT;

    const rows = maybeApp.match({
        None: () => [<tr>
            <td>{FILLER}</td>
        </tr>],
        Some: (app) => {
            return [<tr>
                <th>Name</th>
                <td>{app.display_name}</td>
            </tr>,
            <tr>
                <th>Description</th>
                <td>{app.description}</td>
            </tr>,
            <tr>
                <th>Created by </th>
                <td><Avatar display_name={app.created_by.display_name} /></td>
            </tr>,
            <tr>
                <th>Created on </th>
                <td><TimestampView date={app.created_at} /></td>
            </tr>,

            <tr>
                <th>Endpoints </th>
                <td> {maybeEndpoints.match({
                    None: () => <span>{FILLER}</span>,
                    Some: (endpoints) => <span>Found {endpoints.length} endpoints.</span>
                })}
                </td>
            </tr>,

            ];
        }
    });

    return <div className="p-8">
        <div className="grid grid-cols-4 gap-16">
            <div className="col-span-3">
                <div className="mb-4 my-4">
                    <H2>App: {name}</H2>

                    <table className={"table w-full bp4-html-table bp4-html-table-bordered  bp4-html-table-striped border  " + s.BORDER_SECONDARY}>

                        <tbody>
                            {rows}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    </div>;

}


