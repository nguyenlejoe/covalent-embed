import React, { useState, useRef } from "react";

interface CardDropZoneProps {
    id: string;
    reorderCard: Function;
    key: undefined | number | string;
}

export default function CardDropZone(props: CardDropZoneProps) {
    const refContainer = useRef(null);
    const [overtop, setOvertop] = useState(false);
    const dragoverHandler = (ev: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
        if (!overtop) {
            setOvertop(true);
        }
    };
    const dragLeaveHandler = (ev: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => {
        ev.preventDefault();
        if (overtop) {
            setOvertop(false);
        }
    };

    const dropHandler = (ev) => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text/plain");
        props.reorderCard(data, ev.target.id);
        if (overtop) {
            setOvertop(false);
        }
    };

    return <div key={props.key} id={props.id} onDrop={dropHandler} onDragOver={dragoverHandler} onDragLeave={dragLeaveHandler} ref={refContainer} className={overtop ? "-mt-4 -mb-4 h-24 rounded-md transform-all duration-200" : "bg-transparent -mt-8 -mb-8 h-10 transform-all duration-200"} />;
}
