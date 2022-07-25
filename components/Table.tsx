import React, { useState, useEffect, FC, useMemo } from "react";
import { Table2, Column, Cell, TableLoadingOption } from "@blueprintjs/table";
import { CHResponse, CHResponseWrapper, EditorState } from "../helpers/common";
import S from "../helpers/strings";
import { Intent } from "@blueprintjs/core";

interface TableProps {
    data: CHResponseWrapper;
    editorState: EditorState;
}

const Table: FC<TableProps> = ({
    data,
    editorState,
    showMessage
}) => {

    const onCopy = (success) => {
        showMessage({
            message: S.CLIPBOARD_COPY_SUCCESS,
            intent: Intent.SUCCESS,
            icon: "tick-circle"
        });
    };

    const getCellClipboardData = (rowIndex: number, colIndex: number) => {
        const cell = data.data.data[rowIndex] ? Object.values(data.data.data[rowIndex])[colIndex] : null;
        return cell;
    };

    const cellRenderer = (rowIndex: number, colIndex: number) => {

        const cell = data.data.data[rowIndex] ? Object.values(data.data.data[rowIndex])[colIndex] : null;

        if (cell === null || cell === undefined) {
            return <Cell>∅</Cell>;
        }

        return <Cell loadingOptions={editorState === EditorState.RUNNING ? [TableLoadingOption.CELLS] : []}>{cell}</Cell>;
    };

    switch (editorState) {
        case EditorState.FAILURE:
            return <div className="break-words font-thin">Failed: {JSON.stringify(data)}</div>;
        case EditorState.NO_DATA:
            return <div className="break-words font-thin">No data returned.</div>;
        case EditorState.RUNNING:
            return <Table2
                numRows={5}
                loadingOptions={[TableLoadingOption.COLUMN_HEADERS, TableLoadingOption.CELLS, TableLoadingOption.ROW_HEADERS]}
            />;
        default:
            return <Table2
                getCellClipboardData={getCellClipboardData}
                onCopy={onCopy}
                className={"min-h-auto h-80  "}
                numRows={data && data.data && data.data.rows ? data.data.rows : 5}
            >
                {data && data.data && data.data.meta ?
                    data.data.meta.map((o, i) => {
                        return (
                            <Column key={i} name={`${o.name} (${o.type})`} cellRenderer={cellRenderer} />
                        );
                    }) :
                    <Column name="" />
                }
            </Table2>;
    }
};

export default Table;
