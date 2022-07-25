import React, { useState, useEffect, FC, useMemo, useRef, useCallback } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { chFunctionsMap, chKeywordsMap } from "../helpers/clickhouseSyntax";
import "codemirror/mode/sql/sql";
import "codemirror/lib/codemirror.css";
import "../styles/dracula.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/hint/show-hint.css";

import * as C from "../helpers/colors";

import { Option, Some, None } from "../helpers/option";

import { EditorState, re_aggregation, re_chain_names, re_date_range } from "../helpers/common";
import { rbac } from "../helpers/rbac";

interface EditorProps {
    busy: boolean;
    setSQL: Function;
    editorState: EditorState;
    onRunTrigger: Function;
    index: number;
    sql: string;
    darkMode: boolean;
    setNode: Function;
    full_sql: string;
    setSelectedSQL: Function;

    query_groupId: string;
    groupId: Option<string>;

    currentDateAgg: string;
    currentDateRange: string;
    currentChainNames: string[];

    setUseChainFilter: Function;
    setUseDateRangeFilter: Function;
    setUseDateAggFilter: Function;
    useChainFilter: boolean;
    useDateRangeFilter: boolean;
    useDateAggFilter: boolean;
}

const Editor = (props: EditorProps) => {

    const s = props.darkMode ? C.DARK : C.LIGHT;
    const editorRef = useRef<any>();

    const f = useCallback((e) => {
        if (e.which === 13 && (e.ctrlKey || e.metaKey)) {
            props.onRunTrigger(editorRef.current.editor.getSelection());
            e.preventDefault();
        }
    }, [props.currentChainNames, props.currentDateAgg, props.currentDateRange]);

    useEffect(() => {
        document.addEventListener("keydown", f);
        return () => {
            document.removeEventListener("keydown", f);
        };
    }, [f]);

    useEffect(() => {
        editorRef.current.editor.focus();
        editorRef.current.editor.setCursor({ line: 0, ch: 0 });
    }, [props.busy]);

    useEffect(() => {
        if (props.editorState === 2 || props.editorState === 3) {
            editorRef.current.editor.focus();
        }
    }, [props.editorState]);

    useEffect(() => {
        const matchAggregation = props.full_sql.match(re_aggregation);
        const matchDateRange = props.full_sql.match(re_date_range);
        const matchChainNames = props.full_sql.match(re_chain_names);
        props.setUseChainFilter(matchChainNames !== null ? true : false);
        props.setUseDateAggFilter(matchAggregation !== null ? true : false);
        props.setUseDateRangeFilter(matchDateRange !== null ? true : false);

    }, [props.full_sql]);

    const autoComplete = (codemirror) => {
        const hintOptions = {
            tables: {
                blockchains: ["blocks", "transactions", "log_events"],
                metadata: ["tokens_usd_prices"],
                ...chKeywordsMap,
                ...chFunctionsMap,
            },
            disableKeywords: false,
            completeSingle: false,
            completeOnSingleClick: false
        };
        codemirror.showHint(hintOptions);
    };

    return (
        <div className="absolute h-full w-full">

            <div className={" mr-1  h-full  border-t border-r " + s.BORDER_SECONDARY}>
                <CodeMirror
                    ref={editorRef}
                    className={`${(props.editorState === EditorState.RUNNING) ? "-opacity-40" : ""}  -transition-all h-full`}
                    value={props.full_sql}
                    // focus={false}
                    options={{
                        mode: "text/x-pgsql",
                        theme: props.darkMode ? "dracula" : "default",
                        readOnly: (props.busy || rbac.can("editor", "update:query", () => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    return props.query_groupId !== group_id;
                                },
                                None: () => false
                            });

                        }) || props.editorState === EditorState.RUNNING) ? true : false,
                        cursorBlinkRate: (props.busy || rbac.can("editor", "update:query", () => {
                            return props.groupId.match({
                                Some: (group_id) => {
                                    return props.query_groupId !== group_id;
                                },
                                None: () => false
                            });

                        }) || props.editorState === EditorState.RUNNING) ? -1 : 530,
                        lineNumbers: true,
                        spellcheck: true,
                        smartIndent: true,
                        autocorrect: true,
                        autoFocus: true,
                        extraKeys: {
                            // "Ctrl-Space": "autocomplete",
                            "Cmd-/": () => {
                                // this._cmToggleComment();
                            },
                            "Ctrl-/": () => {
                                // this._cmToggleComment();
                            },
                            "Cmd-S": () => {
                                // this.props.onSaveTrigger();
                            }
                        }
                    }}
                    onBeforeChange={(editor, data, value) => {
                        // autoComplete(editor);
                        // const sql = props.full_sql.replace(`${props.sql}`, `${value}`);
                        props.setNode("sql_text", value, props.index);
                        // props.setSQL(value);
                    }}
                    onCursor={(editor, data) => {
                        props.setSelectedSQL(editor.getSelection());
                    }}
                    onKeyDown={f}
                />
            </div>
        </div>

    );
};

export default Editor;
