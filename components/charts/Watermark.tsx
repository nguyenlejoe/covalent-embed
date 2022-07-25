import React from "react";

export function Watermark({darkMode}) {
    const imgUrl = darkMode
        ? "https://www.covalenthq.com/static/images/covalent-logo-white.png"
        : "https://www.covalenthq.com/static/images/covalent-logo-black1.png";

    return <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-1/4 pointer-events-none"><img className="opacity-30 " src={imgUrl} /></div>;
}
