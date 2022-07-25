export const isProduction = process.env.NODE_ENV === "production";

export const API_BASE_URL = isProduction ? "https://api.covalenthq.com" : "http://127.0.0.1:8000";

export const timestampDisplayFormats: any = {
    millisecond: "h:mm:ss.SSS a", // 11:20:01.123 AM,
    second: "h:mm:ss a", // 11:20:01 AM
    minute: "h:mm a", // 11:20 AM
    hour: "hA MMM D, YYYY", // 5PM
    day: "MMM D, YYYY", // Sep 4, 2017
    week: "ll", // Week 46, or maybe "[W]WW - YYYY" ?
    month: "MMM YYYY", // Sept 2015
    quarter: "[Q]Q - YYYY", // Q3
    year: "YYYY" // 2015
};

export const FLAGS: any = {
    USD: "🇺🇸",
    CAD: "🇨🇦",
    JPY: "🇯🇵",
    SGD: "🇸🇬",
    EUR: "🇪🇺",
    INR: "🇮🇳",
    VND: "🇻🇳",
    CNY: "🇨🇳",
    RUB: "🇷🇺",
    KRW: "🇰🇷",
    TRY: "🇹🇷"
};

export interface IResponse<T> {
    data: T;
    error: boolean;
    error_code: number;
    error_message: string;
}

export interface IGroup {
    id: string;
    name: string;
}

export interface IAuthUser {
    id: string;
    full_name: string;
    display_name: string;
    email: string;
    verified: boolean;
    invited: boolean;
    active: boolean;
    has_usable_password: boolean;
    group?: IGroup;
    group_admin: boolean;

    joined_at: string;
    last_login: string;
}

export interface IAuthLoginResponse {
    user: IAuthUser;
    token: string;
    api_key: string;
}

export interface IList<T> {
    items: T[];
}
export interface ICovalentListResponse<T> {
    items: T[];
    updated_at: string;
}

export interface ICovalentItemResponse<T> {
    item: T;
    updated_at: string;
}
export interface IWallet {
    id: string;
    address: string;
    label: string;
}

export interface IApiKey {
    id?: string;
    display_name: string;
    created_by?: IAuthUser;
    created_at?: string;
}

export declare type IAPiKeyList = IList<IApiKey>;

export const api = {
    fetch<T>(url: string, args: any): Promise<T> {
        return fetch(url, args)
            .then((response) =>
                // if (!response.ok) {
                // }
                response.json()
            )
            .then((data) =>  /* <-- data inferred as { data: T }*/
                data as T
            );
    },
    auth: {
        register: (full_name: string, email: string, password: string, app_id: number, visitor_id: string): Promise<IResponse<IAuthUser>> => {
            const params = {
                full_name: full_name,
                email: email,
                password: password,
                app_id: app_id,
                visitor_id: visitor_id
            };
            const url = `${API_BASE_URL}/_/auth/register/`;

            return api.fetch(url, {
                method: "POST",
                headers: new Headers({ "content-type": "application/json" }),
                body: JSON.stringify(params)
            });
        },
        invite: (token: string, email: string): Promise<IResponse<any>> => {
            const params = {
                email: email
            };
            const url = `${API_BASE_URL}/_/auth/invite_team/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        login: (email: string, password: string, visitor_id: string): Promise<IResponse<IAuthLoginResponse>> => {
            const params = {
                email: email,
                password: password,
                visitor_id: visitor_id
            };

            const url = `${API_BASE_URL}/_/auth/login/`;
            return api.fetch(url, {
                method: "POST",
                headers: new Headers({ "content-type": "application/json" }),
                body: JSON.stringify(params)
            });
        },
        login_alchemist: (email: string, password: string) => {
            const params = {
                email: email.toLowerCase(), password: password
            };

            const url = `${API_BASE_URL}/_/auth/login_alchemist/`;
            return api.fetch(url, {
                method: "POST",
                headers: new Headers({ "content-type": "application/json" }),
                body: JSON.stringify(params)
            });
        },
        logout: (token: string) => {
            const params = {
            };

            const url = `${API_BASE_URL}/_/auth/logout/`;
            return api.fetch(url, {
                method: "POST",
                body: JSON.stringify(params),
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        },
        restore_state: (token: string) => {
            const url = `${API_BASE_URL}/_/auth/`;

            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        set_password_anon: (userId: string, token: string, password: string): Promise<IResponse<IAuthLoginResponse>> => {
            const params = {
                password: password,
                user_id: userId,
                token: token
            };

            const url = `${API_BASE_URL}/_/auth/set_password_anon/`;
            return api.fetch(url, {
                method: "POST",
                headers: new Headers({ "content-type": "application/json" }),
                body: JSON.stringify(params)
            });
        },
        set_password: (token: string, password: string) => {
            const params = {
                password: password
            };

            const url = `${API_BASE_URL}/_/auth/set_password/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        team_list: (token: string) => {
            const url = `${API_BASE_URL}/_/auth/list_team/`;
            return api.fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        toggle_active: (token: string, user_id: string) => {
            const params = {
                user_id: user_id
            };
            const url = `${API_BASE_URL}/_/auth/toggle_active/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        activate: (activation_code: string): Promise<IResponse<IAuthLoginResponse>> => {
            const url = `${API_BASE_URL}/_/auth/activate/${activation_code}/`;
            return api.fetch(url, {});
        },
        group_create: (token: string, group_name: string, phone_number: string): Promise<IResponse<IAuthLoginResponse>> => {
            const params = {
                token: token, group_name: group_name, phone_number: phone_number
            };

            const url = `${API_BASE_URL}/_/auth/create_group/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        resend_email: (email: string) => {
            const url = `${API_BASE_URL}/_/auth/resend_activation/${email}/`;
            return api.fetch(url, {});
        },
        reset_password: (email: string, app_id: number): Promise<IResponse<any>> => {
            const params = {
                email: email,
                app_id: app_id
            };

            const url = `${API_BASE_URL}/_/auth/reset_password/`;
            return api.fetch(url, {
                method: "POST",
                body: JSON.stringify(params)
            });
        },
        reset_password_confirm: (userId: string, token: string): Promise<IResponse<IAuthLoginResponse>> => {
            const url = `${API_BASE_URL}/_/auth/reset_password_confirm/${userId}/${token}/`;
            return api.fetch(url, {
                method: "POST"
            });
        },
        save_settings: (token: string, full_name: string): Promise<IResponse<IAuthLoginResponse>> => {
            const params = {
                full_name: full_name
            };

            const url = `${API_BASE_URL}/_/auth/save_settings/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify(params)
            });
        }
    },
    alchemist: {
        add_approved_task_assignment: (token: string, email: string, title: string, description: string, cqt_amount: number, category: string, theme: string, difficulty: string, season: number, rank: string, is_bonus: boolean) => {
            const params = {
                email: email,
                title: title,
                description: description,
                cqt_amount: cqt_amount,
                category: category,
                theme: theme,
                difficulty: difficulty,
                season: season,
                rank: rank,
                is_bonus: is_bonus
            };
            const url = `${API_BASE_URL}/_/alchemist/add_approved_task_assignment/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        admin_task_assignment: (token: string, task_id: string) => {
            const url = `${API_BASE_URL}/_/alchemist/admin_task_assignment/${encodeURIComponent(task_id)}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        change_cohort: (token: string, email: string, new_season: string, start_in: number) => {
            const params = {
                email: email,
                new_season: new_season,
                start_in: start_in
            };
            const url = `${API_BASE_URL}/_/alchemist/change_cohort/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        change_rank: (token: string, email: string, rank: string, start_in: number) => {
            const params = {
                email: email,
                rank: rank,
                start_in: start_in
            };
            const url = `${API_BASE_URL}/_/alchemist/change_rank/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        change_review_right: (token: string, email: string, can_review: boolean) => {
            const params = {
                email: email,
                can_review: can_review
            };
            const url = `${API_BASE_URL}/_/alchemist/change_review_right/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        details: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        all_alchemists: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/all_alchemists/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        tasks_to_review: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/tasks_to_review/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        reviewed_tasks: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/reviewed_tasks/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        delete_review: (token: string, assignment_id: string) => {
            const params = {
                id: assignment_id
            };
            const url = `${API_BASE_URL}/_/alchemist/delete_review/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        rewards: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/rewards/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        set_name: (token: string, display_name: string, full_name: string) => {
            const params = {
                display_name: display_name,
                full_name: full_name
            };
            const url = `${API_BASE_URL}/_/alchemist/set_name/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        set_region: (token: string, region: string) => {
            const params = {
                region: region
            };
            const url = `${API_BASE_URL}/_/alchemist/set_region/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        set_twitter: (token: string, twitter: string) => {
            const params = {
                twitter: twitter
            };
            const url = `${API_BASE_URL}/_/alchemist/set_twitter/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        set_discord: (token: string, discord: string) => {
            const params = {
                discord: discord
            };
            const url = `${API_BASE_URL}/_/alchemist/set_discord/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        set_telegram: (token: string, telegram: string) => {
            const params = {
                telegram: telegram
            };
            const url = `${API_BASE_URL}/_/alchemist/set_telegram/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        argee_to_policy: (token: string) => {
            const params = {};
            const url = `${API_BASE_URL}/_/alchemist/agree_to_policy/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)

            });
        },
        available_tasks: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/available_tasks/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        assigned_tasks: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/assigned_tasks/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        assign_task: (token: string, task_id: string, selected: Set<string>, language: string) => {
            const params = {
                id: task_id,
                cooperators: Array.from(selected),
                language: language
            };
            const url = `${API_BASE_URL}/_/alchemist/assign_task/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify(params)
            });
        },

        unassign_task: (token: string, task_assignment_id: string) => {
            const params = {
                id: task_assignment_id
            };
            const url = `${API_BASE_URL}/_/alchemist/unassign_task/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify(params)
            });
        },
        submit_task: (token: string, assignment_id: string, link: string, comment: string) => {
            const params = {
                link: link,
                comment: comment,
                assignment_id: assignment_id
            };
            const url = `${API_BASE_URL}/_/alchemist/submit_task/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify(params)
            });
        },
        submit_task_review: (token: string, assignment_id: string, action: string, comment: string) => {
            const params = {
                comment: comment,
                decision: action,
                id: assignment_id
            };
            const url = `${API_BASE_URL}/_/alchemist/submit_task_review/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify(params)
            });
        },
        submission_history: (token: string, assignment_id: string) => {
            const url = `${API_BASE_URL}/_/alchemist/task_submission_history/${assignment_id}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        all_task_submissions: (token: string, season: number, status: string) => {
            const url = `${API_BASE_URL}/_/alchemist/all_task_submissions/${season}/${status}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        tasks_by_alchemist: (token: string, discord: string) => {
            const url = `${API_BASE_URL}/_/alchemist/tasks_by_alchemist/${encodeURIComponent(discord)}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        alchemists: (token: string, assignment_id: string) => {
            const url = `${API_BASE_URL}/_/alchemist/alchemists/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        current_season: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/current_season/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        languages: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/languages/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        get_wallet: (token: string) => {
            const url = `${API_BASE_URL}/_/alchemist/wallet_address/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });

        },
        set_wallet: (token: string, address: string) => {
            const url = `${API_BASE_URL}/_/alchemist/wallet_address/`;
            const params = { wallet_address: address };
            return api.fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });

        },
        add_wallet: (token: string, wallet_address: string) => {
            const url = `${API_BASE_URL}/_/alchemist/wallet_address/`;
            const params = {
                wallet_address: wallet_address
            };
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        admin_rewards: (token: string, email: string) => {
            const url = `${API_BASE_URL}/_/alchemist/admin_rewards/${email}/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        admin_task_assignments: (token: string, task_id: string, status: string) => {
            const url = `${API_BASE_URL}/_/alchemist/admin_task_assignment/${task_id}/${status}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        add_new_current_season_task: (token: string, title: string, description: string, cqt_amount: number, category: string, theme: string, difficulty: string, rank: string, is_bonus: boolean) => {
            const url = `${API_BASE_URL}/_/alchemist/add_new_current_season_task/`;
            const params = {
                title: title,
                description: description,
                cqt_amount: cqt_amount,
                category: category,
                theme: theme,
                difficulty: difficulty,
                rank: rank,
                is_bonus: is_bonus
            };
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        },
        task_reviewers_by_task: (token: string, task_id: string) => {
            const url = `${API_BASE_URL}/_/alchemist/task_reviewers_by_task/${task_id}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        task_reviewers_by_season: (token: string, season: string) => {
            const url = `${API_BASE_URL}/_/alchemist/task_reviewers_by_season/${season}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        },
        task_reviews_by_user: (token: string, email: any) => {
            const url = `${API_BASE_URL}/_/alchemist/task_reviews_by_user/${email}`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                method: "GET"
            });
        }
    },
    apikey: {
        list: (token: string): Promise<IResponse<IAPiKeyList>> => {
            const url = `${API_BASE_URL}/_/apikey/`;
            return api.fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        delete: (token: string, apikeyId: string) => {
            const url = `${API_BASE_URL}/_/apikey/${apikeyId}/`;
            return api.fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        },
        create: (token: string, display_name: string): Promise<IResponse<IApiKey>> => {
            const params = {
                display_name: display_name
            };
            const url = `${API_BASE_URL}/_/apikey/`;
            return api.fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(params)
            });
        }
    }
};

export class CookieUtils {
    static read(name: string) {
        const result = new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)").exec(document.cookie);
        return result ? result[1] : null;
    }
    static remove(name: string) {
        CookieUtils.write(name, "", -1);
    }
    static write(name: string, value: string, days?: number) {
        if (!days) {
            days = 365 * 20;
        }

        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        const expires = "; expires=" + date.toUTCString();

        document.cookie = name + "=" + value + expires + "; path=/";
    }
}

export const urls = {
    warehouse: {
        add: "/destination_add/"
    },
    source: {
        add: "/source_add/"
    },
    apikey: {
        add: "/apikey_add/"
    },
    function: {
        query: (slug: string) => `https://api.covalenthq.com/v1/function/${slug}/`
    },
    analytics: {
        cube: (project_key: string) => `${API_BASE_URL}/v1/cube/${project_key}`
    },
    fiddle: "/fiddle/"
};

export const strings = {
    PROJECTS_ADD: "There are no projects. You can add one now.",
    APIKEY_ADD: "You'll need to add an API key before you can start using the Covalent API.",
    FUNCTION_ADD: "You'll need to add a Function to store the results of a smart contract function call every block and expose the results through a REST API.",
    SUBSCRIBTION_ADD: "You'll need to add an event subscription to listen to log events on smart contracts and respond to them via webhooks.",
    WAREHOUSE_ADD: "You'll need to add a destination to replicate your data. A destination can be either a database (PostgreSQL, Redshift or BigQuery) or a blob store like S3.",
    SOURCE_ADD: "You'll need to add a source to replicate your data. A source can either be on-chain data from one of the supported blockchains, or an off-chain source like an API.",
    START_QUERY: "You are now ready to start answering your questions.",
    PRO: "💪",
    ALERT_ADD: "SQL Alerts notify the user whenever the result of a query is higher, lower, or equal to a predefined value. They're especially good for making sure nothing catastrophic has happened to the data pipeline.",
    WALLET_ADD: "You'll need to create a Saved Wallet in order to trigger notifications and export transactions."
};

export const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export enum Network {
    ETHEREUM = 1,
    COSMOS_HUB = "cosmoshub",
    UNSUPPORTED = "unsupported"
}
export const getNetworkForAddress = (address: string) => {
    const network_str = isSupportAddressFormatForNetwork(address),
        network = network_str === "ethereum" ? Network.ETHEREUM
            : network_str === "cosmos" ? Network.COSMOS_HUB
                : Network.UNSUPPORTED;
    return network;
};

export const isSupportAddressFormat = (text: string) => isSupportAddressFormatForNetwork(text) === null ? false : true;

export const isSupportAddressFormatForNetwork = (text: string) => {

    if (text.startsWith("0x")) {
        if (text.length === 42) {
            return "ethereum";
        }
    }
    if (text.endsWith("eth")) {
        return "ethereum";
    }
    if (text.endsWith("argent.xyz")) {
        return "ethereum";
    }

    if (text.startsWith("cosmosvaloper1") ||
        text.startsWith("cosmos1")) {
        return "cosmos";
    }

    return null;
};

// const REFLECT_SCHEME = ["#269cff", "#265bff",
//     "#3226ff",
//     "#7326ff",
//     "#b426ff",
//     "#f626ff",
//     "#ff26c7",
//     "#ff2686",
//     "#ff2645",
//     "#ff4826",
//     "#ff8926",
//     "#ffca26"
// ];

export const COVALENT_CHART_COLORS = [
    "rgb(255, 99, 132)", // red
    "rgb(255, 205, 86)", // yellow
    "rgb(54, 162, 235)", // darkBlue
    "rgb(153, 102, 255)", // purple
    "rgb(75, 192, 192)", // green
    "rgb(255, 159, 64)", // orange
    "rgb(201, 203, 207)", // grey

    "#3226ff",
    "#7326ff",
    "#b426ff",
    "#f626ff",
    "#ff26c7",
    "#ff2686",
    "#ff2645",
    "#ff4826"
];
