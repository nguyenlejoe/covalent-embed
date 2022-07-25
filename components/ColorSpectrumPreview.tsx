import React, { useState, useEffect, FC, useMemo } from "react";

import * as C from "../helpers/colors";

interface ColorSpectrumPreviewProps {
    spectrum: string;
    palette: Object;
}

export function ColorSpectrumPreview(props: ColorSpectrumPreviewProps) {
    const content = props.palette[props.spectrum].map((c, i) => {
        return <div
            key={c}
            className="w-5 h-5 inline-block  "
            style={{ backgroundColor: c }}
        />;
    });

    return <div className="inline-block align-middle ">
        {content}
    </div>;
}
