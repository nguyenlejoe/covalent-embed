import React, { useState, useRef, useEffect } from "react";
import * as C from "../helpers/colors";
import { Icon, Spinner } from "@blueprintjs/core";
import { buildUserCard } from "../hooks/buildUserCard";

interface CarouselProps {
    darkMode: boolean;
    cardCollection: any;
    handleFocusGraph: Function;
    thumbnailScale: any;
    focusGraph: any;
}

const Carousel = (props: CarouselProps) => {
    const maxScrollWidth = useRef(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const carousel = useRef(null);
    const selectedGraph = useRef(null);
    const s = props.darkMode ? C.DARK : C.LIGHT;

    const movePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevState) => prevState - 1);
        }
    };

    const moveNext = () => {
        if (carousel.current !== null && carousel.current.offsetWidth * currentIndex <= maxScrollWidth.current) {
            setCurrentIndex((prevState) => prevState + 1);
        }
    };

    const checkDisabled = () => {
        if (currentIndex <= 0) {
            setDisabled(false);
        }
        if (carousel.current.offsetWidth * currentIndex >= maxScrollWidth.current) {
            setDisabled(true);
        }
    };

    useEffect(() => {
        if (carousel !== null && carousel.current !== null) {
            carousel.current.scrollLeft = carousel.current.offsetWidth * currentIndex;
        }
        checkDisabled();
    }, [currentIndex]);

    useEffect(() => {
        maxScrollWidth.current = carousel.current
            ? carousel.current.scrollWidth - carousel.current.offsetWidth
            : 0;
        checkDisabled();
    }, [props.thumbnailScale]);


    return (
        <div className={"carousel my-2 mx-auto flex "}>
            <div className={"mx-4 disabled:opacity-25 w-10 text-center opacity-75 hover:opacity-100 transition-all ease-in-out duration-300 flex items-center " + `${props.thumbnailScale} ${s.TEXT_COLOR} ${!disabled && "text-black"}`} onClick={movePrev} >
                <Icon size={50} className={"mb-6 cursor-pointer "} icon="chevron-left" />
            </div>
            <div className="relative z-50 overflow-hidden">
                <div ref={carousel} className="carousel-container relative flex gap-4 overflow-hidden scroll-smooth snap-x snap-mandatory touch-pan-x z-0">
                    {props.cardCollection && props.cardCollection.map((o, i) => {
                        let icon;
                        switch (o && o.chartType) {
                            case "bar":
                                icon = "grouped-bar-chart";
                                break;
                            case "table":
                                icon = "th";
                                break;
                            case "line":
                                icon = "timeline-line-chart";
                                break;
                            case "metric":
                                icon = "numerical";
                                break;
                            case "area":
                                icon = "timeline-area-chart";
                                break;
                            case "scatter":
                                icon = "scatter-plot";
                                break;
                            case "pie":
                                icon = "pie-chart";
                                break;
                            case "cohort":
                                icon = "heat-grid";
                                break;
                            default:
                                icon = null;
                                break;
                        }
                        const selected = props.focusGraph.id === o.id ? "border-[#7f0dff]" : "hover:border-[#7f0dff]";
                        return (
                            <div key={i} className={`${props.thumbnailScale} ${selected} h-40 w-40  p-2 cursor-pointer ${s.TEXT_COLOR} ${props.darkMode ? "bg-black border border-gray-800" : "bg-white shadow-sm border border-gray-200 bg-opacity-100"} bg-opacity-80 rounded-md transition-all ease-in-out duration-500`} onClick={async () => {
                                props.handleFocusGraph(o);
                            }}>
                                <div className="text-md mb-2 truncate">{o.display_name ? o.display_name : "Unnamed card"}</div>
                                <div className="text-xs">{o.subtitle}</div>
                                <div className="flex items-center justify-center">
                                    <Icon size={50} className={"mt-5"} icon={icon ? icon : "cross"} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className={"mx-4 disabled:opacity-25 w-10 text-center opacity-75 hover:opacity-100 transition-all ease-in-out duration-300 flex items-center " + `${props.thumbnailScale} ${s.TEXT_COLOR}  ${disabled && "text-black"}`} onClick={moveNext} >
                <Icon size={50} className={"mb-6 cursor-pointer "} icon="chevron-right" />
            </div>
        </div>
    );
};

export default Carousel;


