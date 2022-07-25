import React, { useState, useEffect, FC, useMemo } from "react";
import * as C from "../../helpers/colors";
import { CHResponse, CHResponseWrapper, EditorState } from "../../helpers/common";
import { Option, Some, None } from "../../helpers/option";
import { Spinner, SpinnerSize, Icon } from "@blueprintjs/core";
import { F_G } from "../../helpers/formats";

interface StatusBarProps {
    status: EditorState;
    maybeResponse: Option<CHResponseWrapper>;

    darkMode: boolean;
}

const StatusBar = (props: StatusBarProps) => {
    const s = props.darkMode ? C.DARK : C.LIGHT;


    const message = (() => {
        switch (props.status) {
            case EditorState.RUNNING:
                return <div className="flex space-x-2">
                    <Spinner size={SpinnerSize.SMALL} /> <span>Running...</span>
                </div>;

            case EditorState.SUCCESS:
                return <div className="flex  justify-between ">
                    <div className={s.SUCCESS}>
                        <Icon icon="tick" /> <span>&nbsp;Run succeeded with results.</span>
                    </div>
                    <div>
                        {props.maybeResponse.match({
                            None: () => <span />,
                            Some: (resp) => {
                                return <div className="flex">
                                    {/* <div className="mr-1">{resp.data.statistics && resp.data.statistics.elapsed
                                        ? (" Took " + (resp.data.statistics.elapsed > 0
                                            ? resp.data.statistics.elapsed.toFixed(2) + "s"
                                            : resp.data.statistics.elapsed.toFixed(4) + "ms"
                                        ))
                                        : ""}</div> */}
                                    <div className="mr-1">Took <span>{resp.data.statistics && resp.data.statistics.elapsed ?
                                        resp.data.statistics.elapsed > 0
                                            ? resp.data.statistics.elapsed.toFixed(2) + "s"
                                            : resp.data.statistics.elapsed.toFixed(4) + "ms" : ""
                                    }</span></div>
                                    <div className="mr-1"> | <span> Read {resp.data.rows} rows ({F_G(resp.data.statistics?.bytes_read)}) </span></div>
                                </div>;
                            }

                        })}
                    </div>
                </div>;

            case EditorState.FAILURE:
                return <div className={s.ERROR}>
                    <Icon icon="cross" /> <span>Run failed with error.</span>
                </div>;

            default:
                return <div>Ready.</div>;
        }
    })();

    return <div>
        {message}
    </div>;
};

export default StatusBar;
