import React, { useState, useEffect, FC, useMemo } from "react";
import { HTMLSelect, Navbar, Alignment, ButtonGroup, Button, Switch, Icon, NavbarDivider, Menu, MenuItem, Intent, MenuDivider, PopoverPosition } from "@blueprintjs/core";
import { Page } from "../helpers/api";
import * as C from "../helpers/colors";
import { useParams } from "react-router-dom";
import { incrementWide, incrementWideBlack } from "../../platform/svgs";

export const NavBar = ({ pageType, darkMode, onToggleDarkMode, setEditMode, editMode, renderNavDropDown, subNav, onDeletePage,}) => {
    const s = darkMode ? C.DARK : C.LIGHT;
    const [deleteState, setDeleteState] = useState(false);


    return (
        <div className={`${s.BG_COLOR_SECONDARY} ${s.BORDER_SECONDARY} border-b`}   >
            <Navbar className="border-none">
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>
                        <a href="/platform/#/increment/">
                            {darkMode ? incrementWide : incrementWideBlack}
                        </a>
                    </Navbar.Heading>
                    <NavbarDivider className="h-8" />
                    {renderNavDropDown?.match({
                        None: () => <div />,
                        Some: (el) => el
                    })}
                </Navbar.Group>

                <Navbar.Group align={Alignment.RIGHT}>

                    {subNav} &nbsp;
                    {/* {deleteState ? <span className="flex ml-1"><Button intent={Intent.DANGER} text="DELETE" onClick={() => {
                        onDeletePage(true);
                        setDeleteState(false);
                    }} />   <Button className="ml-1" text="CANCEL" onClick={() => {
                        setDeleteState(false);
                    }} /> </span> :
                        <Button
                            className={`${editMode ? " " : "hidden"} ml-1`}
                            onClick={() => {
                                setDeleteState(true);
                            }}
                            icon={"trash"}
                        />
                    } */}
                    <Button
                        className={`${pageType === "pages" && editMode ? " " : "hidden"} ml-1`}
                        onClick={setEditMode}
                        icon={"tick"}
                    />
                </Navbar.Group>
            </Navbar>
        </div >
    );

};
