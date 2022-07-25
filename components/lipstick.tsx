import * as B from "@blueprintjs/core";
import React = require("react");

import classNames from "classnames";
import Copy from "./Copy";

export const Header = {
    Header: (p) => <div className="">{p.children}</div>,
    CTASection: (p) => <div className="mt-8">{p.children}</div>,
    Subtitle: (p) => <span className="text-2xl mt-3 tracking-tight text-slate-400 ">{p.children}</span>
};

export const Body = {
    Body: (p) => <div className="prose">{p.children}</div>,
    H2: (p) => <h2 className="">{p.children}</h2>
};

export function H1(p) {
    return <h1 className="text-5xl text-covalent-pink font-display tracking-tight">{p.children}</h1>;
}

export function H2(p) {
    return <h2 className={classNames("text-3xl", p.inverse ? " text-white " : " ")}>{p.children}</h2>;
}

export function H3(p) {
    return <h3 className="-text-xl">{p.children}</h3>;
}

export function HR() {
    return <hr className="mt-8 pb-8" />;
}

export function P(p) {
    return <p className={classNames(p.invert ? "prose-invert text-slate-400" : "prose")}>{p.children}</p>;
}

export function Code(p) {
    return <B.Code>{p.children}</B.Code>;
}

export function CodeBlock(p) {
    return <div className="prose"><pre className="bp4-code-block"><B.Code>{p.children} </B.Code> <Copy copyText={p.children} /> </pre> </div>;
}

export function Button(p: B.ButtonProps) {
    return <B.Button {...p} />;
}

export function Table(p) {
    return <table className="bp4-table bp4-html-table bp4-html-table-bordered border">{p.children}</table>;
}

export function Avatar({ display_name }) {

    const D = display_name.trim(),
        D_1 = D.length > 0 ? D.substring(0, 1).toUpperCase() : "?";

    return <div className="inline-flex">

        <span className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500">
            <span className="text-xs font-medium leading-none text-white">{D_1}</span>

            {/* <span className="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full ring-2 ring-white bg-green-400" /> */}

        </span>

        <span className="ml-2">
            {display_name}
        </span>

    </div>;
}
