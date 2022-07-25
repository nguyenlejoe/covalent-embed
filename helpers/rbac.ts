import _each = require("lodash/each");
import _head = require("lodash/head");
import _includes = require("lodash/includes");
import _union = require("lodash/union");

interface IOptionMatcher<T> {
    Yes: () => T;
    No: () => T;
}

export declare type ConditionFnType = () => boolean;
export declare type RoleType = "admin" | "editor" | "viewer" | "inactive";

export declare type CapabilityType = "create:page" | "read:page" | "update:page" | "delete:page" | "create:query" | "read:query" | "update:query" | "delete:query" | "invite:team" | "tags:page";

interface RoleData {
    name: RoleType;
    capabilities: CapabilityType[];
    inherits: RoleType[];
}

const rolesData: RoleData[] = [
    {
        name: "inactive",
        capabilities: [],
        inherits: []
    },
    {
        name: "viewer",
        capabilities: ["read:page"],
        inherits: []
    },
    {
        name: "editor",
        capabilities: ["create:page", "read:page", "update:page", "delete:page",
            "create:query", "read:query", "update:query", "delete:query", "tags:page"
        ],
        inherits: ["viewer"]
    },
    {
        name: "admin",
        capabilities: ["invite:team"],
        inherits: ["editor"]
    }
];

class Rbac {
    private _rolesToCapabilitiesMap: Map<RoleType, CapabilityType[]>;

    constructor() {
        const map = new Map<RoleType, CapabilityType[]>();

        _each(rolesData, (role) => {
            const allCapabilities = role.inherits.reduce((accumulator, childName) => {
                const childRoles = rolesData.filter((r) => r.name === childName);

                if (childRoles.length > 1) {
                    throw new Error(`${childName} role is defined more than once`);
                }

                const childRole = _head(childRoles);

                return accumulator = _union(accumulator, (childRole && childRole.capabilities));
            }, [...role.capabilities]);

            map.set(role.name, allCapabilities);
        });

        this._rolesToCapabilitiesMap = map;
    }

    can(role: RoleType, capability: CapabilityType, resourceCond: ConditionFnType) {
        const allCapabilities = this._rolesToCapabilitiesMap.get(role);
        return _includes(allCapabilities, capability) && resourceCond();
    }

    canMatch<T>(role: RoleType, capability: CapabilityType, resourceCond: ConditionFnType, matcher: IOptionMatcher<T>) {
        if (this.can(role, capability, resourceCond)) {
            return matcher.Yes();
        } else {
            return matcher.No();
        }
    }
}

export const rbac = new Rbac();
