import React, { useState, useEffect, FC, useMemo } from "react";
import { Option, Some, None } from "../../helpers/option";
import { CHResponse, EditorState } from "../../helpers/common";

import Table from "../Table";

interface ResultContainerProps {
    editorState: EditorState;
    maybeData: Option<CHResponse>;

    showMessage: Function;
}

function ResultContainer(props: ResultContainerProps) {
    return props.maybeData.match({
        None: () => <div className="font-thin">Hit "Run" to see results.</div>,
        Some: (data) => {
            return <div className="h-80">
                <Table
                    editorState={props.editorState}
                    data={data}
                    showMessage={props.showMessage}
                />
            </div>;
        }
    });
}

export default ResultContainer;
