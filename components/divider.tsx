import React from "react";

import * as C from "../helpers/colors";

export default function Divider({ darkMode }) {
    return (
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={"w-full border-t " + (darkMode ? C.DARK.BORDER : C.LIGHT.BORDER)} />
            </div>
        </div>
    );
}
