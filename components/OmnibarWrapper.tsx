
import React, { Suspense, useState, useEffect } from "react";

import { ItemRenderer, Omnibar } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";
import { None, Some } from "../helpers/option";
import { api, Query } from "../helpers/api";
import { smartSearch } from "../helpers/smartSearch";

interface Item extends Query {

    type: string;
}

const ItemOmnibar = Omnibar.ofType<Item>();

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function highlightText(text: string, query: string) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join("|"), "gi");
    const tokens: React.ReactNode[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const match = regexp.exec(text);
        if (!match) {
            break;
        }
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong className={"bg-[#7f0dff]/30 font-extrabold"} key={lastIndex}>{match[0]}</strong>);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}


export const OmnibarWrapper = ({ isOpen, onClose }) => {

    const [maybeQueries, setQueries] = useState(None);
    const [maybePages, setPages] = useState(None);
    const [folders, setFolders] = useState({});

    useEffect(() => {
        api.queriesForUser().then((resp) => {
            setQueries(new Some(resp.data.items));

            const folders = {};
            resp.data.items.forEach((q) => {
                folders[q.id] = q.display_name;
            });

            setFolders(folders);
        });

        api.pagesForUser().then((resp) => {
            setPages(new Some(resp.data.items));
        });

    }, [isOpen]);

    const itemRenderer: ItemRenderer<Item> = (item, { handleClick, query }) => {
        return <MenuItem
            key={item.id}
            icon={item.type === "q" ? "code-block" : "document"}
            text={highlightText(item.display_name, query)}
            label={folders[item.parent_id]}
            onClick={handleClick}
        />;
    };

    const itemPredicate = (query: string, item: Item, index?: number, exactMatch?: boolean) => {
        return smartSearch(query, item.display_name, item.description);
    };

    const onItemSelect = (item: Item) => {
        onClose();
        switch (item.type) {
            case "p":
                window.location.href = `/platform/#/increment/pages/${item.id}/`;
                return;
            case "q":
                window.location.href = `/platform/#/increment/sql/${item.id}/`;
                return;
            default:
                throw new Error("handle me");
        }
    };

    const items = (maybePages.isDefined && maybeQueries.isDefined) ?
        (() => {
            const p = maybePages.get().map((x) => {
                x["type"] = "p";
                return x;
            });

            maybeQueries.get().forEach((x) => {
                if (!x.is_folder) {
                    x["type"] = "q";
                    p.push(x);
                }
            });

            return p;
        })()
        : [];

    return <div>

        <ItemOmnibar
            isOpen={isOpen}
            items={items}
            noResults={<MenuItem disabled={true} text="No results." />}
            onClose={onClose}
            itemRenderer={itemRenderer}
            itemPredicate={itemPredicate}
            onItemSelect={onItemSelect}
        />
    </div>;

};
