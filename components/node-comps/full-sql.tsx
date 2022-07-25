import React, { useState, useEffect, FC, useMemo } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { Icon } from "@blueprintjs/core";
import "codemirror/mode/sql/sql";
import "codemirror/lib/codemirror.css";
// import "codemirror/theme/dracula.css";
import * as C from "../../helpers/colors";

interface EditorProps {
    sql: string;
    darkMode: boolean;
}

const FullSQL = (props: EditorProps) => {
    const [copied, setCopied] = useState("opacity-0");
    const s = props.darkMode ? C.DARK : C.LIGHT;

    useEffect(() => {
        const timer = setTimeout(() => {
            setCopied("opacity-0");
        }, 1000);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <div className={"h-auto relative border border-gray-600"}>
            <Icon icon="duplicate" className={`absolute right-2 z-50 top-2 cursor-pointer transition-all ${props.darkMode ? "text-white" : "text-black"}`} onClick={() => {
                setCopied("opacity-100");
                navigator.clipboard.writeText(props.sql);
            }} />
            <CodeMirror
                className={"transition-all h-auto rounded-xl"}
                value={props.sql}
                focus={false}
                options={{
                    mode: "text/x-pgsql",
                    theme: props.darkMode ? "dracula" : "default",
                    readOnly: "nocursor",
                    lineNumbers: true,
                    spellcheck: true,
                    autocorrect: true,
                }}
                autoFocus={true}
            />
            <div className={`${props.darkMode ? "text-white" : "text-black"} transition-all absolute right-2 z-50 bottom-2 ${copied}`}>Copied</div>
        </div>
    );
};

export default FullSQL;
