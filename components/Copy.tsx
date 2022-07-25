import * as React from "react";
import { useState, useEffect, FC } from "react";
import { copySVG, completeSVG } from "../svgs";

interface CopyProps {
    copyText: any;
}

const Copy: FC<CopyProps> = ({ copyText }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const copyAPIKeyToClipboard = () => {
        if (copyText) {
            const permissionName = "clipboard-write" as PermissionName;
            navigator.permissions.query({ name: permissionName }).then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    navigator.clipboard.writeText(copyText).then(() => setIsCopied(true)).catch(() => {
                        setIsCopied(false);
                    });
                }
            });
        }
    };

    useEffect(() => {
        return;
    }, [isCopied]);

    return (
        <>
            <button onClick={copyAPIKeyToClipboard} className="cursor-pointer">{isCopied ? completeSVG : copySVG}</button>
        </>
    );
};

export default Copy;
