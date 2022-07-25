import React, { useState, useEffect } from "react";
import { HTMLSelect, H4, H5, H6, Checkbox, FormGroup, InputGroup, Classes, Icon, Button, } from "@blueprintjs/core";
import { api } from "../helpers/api";

export default function SignUp({ darkMode }) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [success, SetSuccess] = useState(false);

    const handleSignup = () => {
        // api.loginForUser(email, pass).then((resp) => {
        //     document.cookie = `_cov_token2=${resp.data.token}; SameSite=None; Secure`;
        //     SetSuccess(true);
        // });
    };

    return <div className="flex items-center justify-center flex-col mt-20">
        <FormGroup
            label="Email"
        >
            <InputGroup placeholder="Enter email..." value={email} onChange={(e) => {
                setEmail(e.target.value);
            }} />
        </FormGroup>
        <FormGroup
            label="Password"
        >
            <InputGroup placeholder="Enter password..." value={pass} type="password" onChange={(e) => {
                setPass(e.target.value);
            }} />
        </FormGroup>
        <Button onClick={handleSignup}>Confirm</Button>
        {success &&
            <>
                Signed In!
            </>
        }
    </div>;
}
