import React, { useState, useEffect, FC, useMemo, useRef } from "react";

import {
    Classes,
    Popover2SharedProps,
    Placement,
    PlacementOptions,
    Popover2,
    Popover2InteractionKind,
    StrictModifierNames,
} from "@blueprintjs/popover2";


import * as C from "../helpers/colors";

interface ColorPickerProps {
    color: string | undefined;
    onPick: (color: string | undefined) => void;

    darkMode: boolean;
}


export function ColorPicker(props: ColorPickerProps) {

    const s = props.darkMode ? C.DARK : C.LIGHT;
    const bubble = "ring-1 inline-block rounded h-4 w-4 cursor-pointer m-1 " + (s.RING);

    const content = <div>
        {
            (() => {
                const colors = C.COLOR_SCHEME.map((c) => {
                    return <div
                        key={c}
                        className={bubble}
                        style={{
                            backgroundColor: c
                        }}
                        onClick={() => {
                            props.onPick(c);
                        }}
                    />;
                });

                colors.push(<div key="empty" />);
                return <div className="grid grid-cols-5 p-2"> {colors} </div>;
            })()
        }
    </div>;


    return <Popover2
        content={content}
        interactionKind={Popover2InteractionKind.CLICK}
        // position={Position.BOTTOM}
        // useSmartArrowPositioning={true}
        canEscapeKeyClose={true}
    >
        <div
            className={bubble}
            style={{
                backgroundColor: props.color
            }} />
    </Popover2>;

}
