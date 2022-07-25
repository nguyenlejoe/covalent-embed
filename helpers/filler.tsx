import { Classes } from "@blueprintjs/core";
import React from "react";

export const FILLER = <span className={Classes.SKELETON}>123456789</span>;

export const TABLE_FILLER = [1, 2, 3, 4].map((e, i) => <tr key={i}>
    <td>{FILLER}</td>
    <td>{FILLER}</td>
    <td>{FILLER}</td>
    <td>{FILLER}</td>
    <td>{FILLER}</td>
</tr>);
