import { ChartConfig } from "../components/charts/ChartConfig";
import C from "../helpers/cookie";

import { API_BASE_URL } from "../models";

// const USERNAME = process.env.CLICKHOUSE_USERNAME;
// const PASSWORD = process.env.CLICKHOUSE_PASSWORD;
// const BASE_URL = process.env.CLICKHOUSE_URL;
// const FORMAT = " FORMAT JSON;";

// Use devtoken when running locally

// Ganesh's token
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl9iNDBjMjQ3NjY4YWQ0N2Y2OTY0Y2VmNzNkNDcifQ.Wzy5UWoknpu9V81qA-A_anWwJEyxoHKBC6wJcESx7njQluKcGRcudDqhE7qPBEqL-X8Nc_w2nIkjWKv20EupjqQD3e3jwejp024TlpCgI7NFGrCsipZKWRSBcF1JWXq6B5Hj0K1N0dsF3lnZSfRglxuqU-VD8azNM52hRdAG4GU";
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl9jMWE3MGMzODRjOTQ0ZTc5OWYwMWY1YjllYjcifQ.t10NU4-CtinUlVt5trXqqUEgTo9v6EzpSOkYh-_OUFixENuwM6XdZjY6jXiunP3Us35zYlv-8H-t0PgmWLhG2F9P14vGGpbWlIDvf2hP2e5JeuAepA0VKeFnQGL969JA2jkx0hMrvYZsZrtBZG9JJ_NtFKadLCMdsNel5hb7xA4";

// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl82NTA5MGM0MDg4ZmE0ZTAxOWYxYWI1YzIxNzIifQ.HgZKmAnUaF9ytj-cDhmINfn3Pegxr1HtaEbGlb0ModoUbt-GFQ1nK3i87ZvklAi19jqpMR-vjfFeznbvqpDKv7hsBxPOyXL8tykQl2IXFFA8pcIsbhKCEvV_H-fQgTAeOry-t4N2U8S8DkG829xKbxeoy5Bq1SBC2LdiHEwtrKw";
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl9iNDBjMjQ3NjY4YWQ0N2Y2OTY0Y2VmNzNkNDcifQ.Wzy5UWoknpu9V81qA-A_anWwJEyxoHKBC6wJcESx7njQluKcGRcudDqhE7qPBEqL-X8Nc_w2nIkjWKv20EupjqQD3e3jwejp024TlpCgI7NFGrCsipZKWRSBcF1JWXq6B5Hj0K1N0dsF3lnZSfRglxuqU-VD8azNM52hRdAG4GU";

// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl82NTA5MGM0MDg4ZmE0ZTAxOWYxYWI1YzIxNzIifQ.HgZKmAnUaF9ytj-cDhmINfn3Pegxr1HtaEbGlb0ModoUbt-GFQ1nK3i87ZvklAi19jqpMR-vjfFeznbvqpDKv7hsBxPOyXL8tykQl2IXFFA8pcIsbhKCEvV_H-fQgTAeOry-t4N2U8S8DkG829xKbxeoy5Bq1SBC2LdiHEwtrKw";
// Joe's token
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl9kNDI2ZGEyMjhjZjg0ZjUwYThkNTk1NTgyNDgifQ.dc-tZiu2K9EOu_dTSMg3j9nmi2RGT74Q8rn2p58kz9JffHmNpXdNt8Rn1jjMykq1rxn_KOww3uHK8B5y2b7S0TyxLTqSwAZ3NYN6pChcMWEreWLLn3gx3rxQijeqTNO2qNwWqQAz5i1LOH0FMINoxHsy_KbgZOinkSGaHBYE3hc";
// David's token
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl80MDNmZGE5YjFjMTY0OTFlYTllNmIwNjAwMWEifQ.M2QSyNyvou_pz9n7JyesNW02uHBGXUNdWcL0V3hi6u4zmdATJw54obVT0B1e12aFHdEnK_LOkfhK_2DcPotMeKa2G-psOzpm5-9sywCPiIFmhnTsO9QTUhiucF3-uo9hEPQMQdtBxFCkzPylRxr6ILwsbNkWveG79P0jluKc43c";
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl82NTA5MGM0MDg4ZmE0ZTAxOWYxYWI1YzIxNzIifQ.HgZKmAnUaF9ytj-cDhmINfn3Pegxr1HtaEbGlb0ModoUbt-GFQ1nK3i87ZvklAi19jqpMR-vjfFeznbvqpDKv7hsBxPOyXL8tykQl2IXFFA8pcIsbhKCEvV_H-fQgTAeOry-t4N2U8S8DkG829xKbxeoy5Bq1SBC2LdiHEwtrKw";
// const devtoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl80ODZiYjU1NmUyOTA0ZWExYTg3Y2UwYTg5NTEifQ.SiSlLWnxlsN6HS9KiDxMjROm3h71SgH1IqDv4E-g-d7JKgleLJuEzcc6qfhMny3cj7EiR7hd6pNwcmB00S4slqNojHLhyeZdBgKa6S0Yh6Q9e8xXwr3mm_hoEFjiBxeyDXdGEcIfCzCZooGjTzthyGwV_lGoRJ-KXdVXNI0MyJg";
// const token = !isProduction ? devtoken : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlcl85NzRlMTEyNjM2MTE0YTA1ODRhZjk0OWQ5MmIifQ.k9ZEv12RZ9hd_f2zZmIe0EsKjle2vDqjnyAZwGYuYCxGrkwwFCP5ERVJyqVC5bK9PetUsH-KnmA-6gC9dvtgmEC-NI-xlqLtGvkTJPV5vLrDnDTiG8QIULkToID57ULr84QKilEtuLbM3lu80s3DUC8OMh8Sl63IqtA0Ms2wBHwO9FnqbJF96FoIqdc4iBqlxPeSxicA2dbL2r_ejG9Z9fpT8WRra9oKlHC1h5-Gk0_c2WbcEv521KvdI-KYAsPsPKmrljW6ZGY-5rxP0AZXeVgb1yOHnXTXM5RvLDM0IWK-0bi2-9fQi7fjgl64J735MFGuANSfF0Bfg6c0tMDJ0Pa1XsWxHRiMeB_t3jSXVZxUmX8rS-xpRcXsTCqpaYh_TC1emYsqlrU2PbQldxZ_OJCacLURkWM9umZcPJxOLoicc9YCx1eHPJn2a5TK3MXws7pnAfIAJBpupbxtKqSXQPnYWVjHE_E1TFXrxaYit2d7sjT9C9h5k1f7EHytxWNX5dFF4sZfdBQpcNsqntI2nbiB-89qbDa-wPFFE0YSOW6p6OonSskdvi-_NsIOfjuI7_8N6QGMvhlGTgO3q_FwA_uKMy6kB_P8ohoSLGW-qFyLZV031Qk5A8uFUQJTOVDhsoHeZchuDvoFIxGLptFE3TmWkGmVKy1eVZun-UgV5zo";

export interface CovalentItemResponse<T> {
    item: T;
    updated_at: string;
}

export interface CovalentListResponse<T> {
    items: T[];
    updated_at: string;
}

export interface Response<T> {
    data: T;
    error: boolean;
    error_code: number;
    error_message: string;
}

export interface App {
    created_at: string;
    created_by: User;
    description: string;
    id: string;
    display_name: string;
    group: Group;
    slug: string;
    updated_at: string;
}

export interface Endpoint {
    app: App;
    created_at: string;
    created_by: string;
    description: string;
    id: string;
    name: string;
    node_id: string;
    slug: string;
    updated_at: string;
    version_name: string;
}


export interface Chain {
    chain_name_formatted: string;
    chain_name: string;
}

export interface User {
    id: string;
    email: string;
    display_name: string;
    full_name: string;
    group: Group;
}

interface UserWrapper {
    user: User;
}

interface UsersWrapper {
    users: User[];
}

export interface Group {
    slug: string;
    id: string;
    name: string;
}

export interface Page {
    id: string;
    slug: string;

    display_name: string;
    boards: Board[];

    description: string;

    created_at: string;
    updated_at: string;
    created_by: User;
    group: Group;

    tags: string[];
}

export interface Board {
    id: string;
    display_name: string;
    cards: Card[];

    description: string;

    created_at: string;
    updated_at: string;
}

export interface Card {
    chart: ChartInDB;
    created_at: string;
    created_by: string;
    description: string;
    id: string;
    sort_order: number;
}

export interface ChartInDBWithTableData extends ChartInDB {
    chart_data: any;
}
export interface CardWithTableData {
    chart: ChartInDBWithTableData;
}

export interface Query {
    id: string;
    display_name: string;
    description: string;

    updated_at: string;
    created_at: string;
    created_by: User;

    is_folder: boolean;
    parent_id: string;

    group: Group;
}

export interface Node {
    id: string;
    display_name: string;
    description: string;

    sort_order: number;

    sql_text: string;

    updated_at: string;
    created_at: string;
}

export interface ChartInDB {
    pipeline_id: any;
    id: string;
    display_name: string;
    properties: ChartConfig;
    chart_type: string;
    created_at: string;
    updated_at: string;
    in_boards: string[];
    in_pages: string[];
}

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

    loginForUser(email, password): Promise<Response<CovalentListResponse<Page[]>>> {
        const params = {
            email: email, password: password
        };

        const url = `${API_BASE_URL}/_/auth/login/`;

        return api.fetch(url, {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(params)
        });
    },

    initState(token: string): Promise<Response<UserWrapper>> {
        const url = `${API_BASE_URL}/_/auth/`;

        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    listTeam(token: string): Promise<Response<UsersWrapper>> {
        const url = `${API_BASE_URL}/_/auth/list_team/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    },

    pagesForUser(token: string): Promise<Response<CovalentListResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },


    allPages(token: string): Promise<Response<CovalentListResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    pageDetailForUserBySlug(token: string, groupSlug, pageSlug): Promise<Response<CovalentItemResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/${groupSlug}/${pageSlug}/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    pageDetailForUserById(page_id): Promise<Response<CovalentItemResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/${page_id}/`;

        return api.fetch(url, {
            method: "GET",
        });

    },

    savePageById(token: string, page_id, display_name: string, description: string, page_tags: string[]): Promise<Response<CovalentItemResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/${page_id}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                description: description,
                tags: page_tags,
            })
        });

    },

    savePageTags(token: string, display_name: string, page_id, page_tags: string[]): Promise<Response<CovalentItemResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/${page_id}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                tags: page_tags,
            })
        });
    },

    deletePageForUser(token: string, page_id: string | undefined) {
        const url = `${API_BASE_URL}/_/page/${page_id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    deleteAppForUser(token: string, app_id: string | undefined) {
        const url = `${API_BASE_URL}/_/app/${app_id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    createPageForUser(token: string, display_name: string): Promise<Response<CovalentItemResponse<Page>>> {
        const url = `${API_BASE_URL}/_/page/`;
        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name
            })
        });
    },

    boardsForUserBySlug(token: string, groupSlug: string, pageSlug): Promise<Response<CovalentListResponse<Board>>> {
        const url = `${API_BASE_URL}/_/page/${groupSlug}/${pageSlug}/board/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    boardsForUserById(token: string, page_id: string): Promise<Response<CovalentListResponse<Board>>> {
        const url = `${API_BASE_URL}/_/page/${page_id}/board/`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    singleBoardForUser(board_id: string | undefined): Promise<Response<Board>> {
        const url = `${API_BASE_URL}/_/board/${board_id}/`;

        return api.fetch(url, {
            method: "GET",
        });
    },

    saveBoard(token: string, id: string, display_name: string, description: string): Promise<Response<CovalentItemResponse<Board>>> {
        const url = `${API_BASE_URL}/_/board/${id}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name,
                description
            })
        });
    },

    createBoardForUser(token: string, page_id: string | undefined, display_name: string, cards: any): Promise<Response<CovalentItemResponse<Query>>> {
        const url = `${API_BASE_URL}/_/page/${page_id}/board/`;

        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                cards: cards
            })
        });
    },

    deleteBoardForUser(token: string, board_id: string) {
        const url = `${API_BASE_URL}/_/board/${board_id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },


    cardsForUser(token: string, board_id: string | undefined): Promise<Response<CovalentListResponse<Board>>> {
        const url = `${API_BASE_URL}/_/board/${board_id}/card`;

        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    },


    singleCardForUser(card_id: string | undefined): Promise<Response<CovalentItemResponse<Card>>> {
        const url = `${API_BASE_URL}/_/card/${card_id}/`;

        return api.fetch(url, {
            method: "GET",
        });

    },

    createCardForUser(token: string, board_id: string | undefined, display_name: string, chart_id: string): Promise<Response<CovalentItemResponse<Query>>> {
        const url = `${API_BASE_URL}/_/board/${board_id}/card/`;

        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                chart: chart_id
            })
        });

    },

    deleteCardForUser(token: string, id: string) {
        const url = `${API_BASE_URL}/_/card/${id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getCardData(card_id: string | undefined, currentDateAgg: string, currentDateRange: string, currentChainNames: string[]): Promise<Response<CovalentItemResponse<CardWithTableData>>> {
        const url = `${API_BASE_URL}/_/card/${card_id}/data/?`;
        const params = new URLSearchParams();
        params.append("date_aggregation", currentDateAgg);
        params.append("date_range", currentDateRange);
        currentChainNames.forEach((name) => {
            params.append("chain_filter", name);
        });

        return api.fetch(url + params, {
            method: "GET",
        });

    },

    createQueryForUser(token: string, display_name: string, description: string, parentId: string | null): Promise<Response<CovalentItemResponse<Query>>> {
        const url = `${API_BASE_URL}/_/pipeline/`;
        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                description: description,
                is_folder: false,
                parent_id: parentId,
            })
        });
    },

    createQueryFolderForUser(token: string, display_name: string) {
        const url = `${API_BASE_URL}/_/pipeline/`;
        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                description: "",
                is_folder: true
            })
        });
    },

    moveQueryToFolder(token: string, queryId: string, parentId: string, display_name: string, description: string) {
        const url = `${API_BASE_URL}/_/pipeline/${queryId}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                parent_id: parentId,
                display_name: display_name,
                description
            })
        });
    },

    deleteQueryForUser(token: string, id: string) {
        const url = `${API_BASE_URL}/_/pipeline/${id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    queriesForUser(token: string): Promise<Response<CovalentListResponse<Query>>> {

        const url = `${API_BASE_URL}/_/pipeline/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getQuery(token: string, pipelineId): Promise<Response<CovalentItemResponse<Query>>> {

        const url = `${API_BASE_URL}/_/pipeline/${pipelineId}/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    saveQuery(token: string, pipelineId, display_name: string, description: string, parent_id: any): Promise<Response<CovalentItemResponse<Query>>> {
        const url = `${API_BASE_URL}/_/pipeline/${pipelineId}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name,
                description,
                parent_id
            })
        });
    },

    nodesForQuery(token: string, pipelineId): Promise<Response<CovalentListResponse<Node>>> {
        const url = `${API_BASE_URL}/_/pipeline/${pipelineId}/node/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    createNodeForQuery(token: string, pipeId: string, display_name: string, description: string, sql_text: string, sort_order: number): Promise<Response<Node>> {
        const url = `${API_BASE_URL}/_/pipeline/${pipeId}/node/`;
        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                description: description,
                sql_text: sql_text,
                sort_order: sort_order

            })
        });
    },

    deleteNodeForUser(token: string, id: string) {
        const url = `${API_BASE_URL}/_/node/${id}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    createChartForNode(token: string, nodeId: string, chart_type: string): Promise<Response<CovalentItemResponse<ChartInDB>>> {
        const url = `${API_BASE_URL}/_/node/${nodeId}/chart/`;
        return api.fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                chart_type: chart_type
            })
        });
    },

    deleteChart(token: string, chartId: string) {
        const url = `${API_BASE_URL}/_/chart/${chartId}/`;
        return api.fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    chartsForNode(token: string, nodeId): Promise<Response<CovalentListResponse<ChartInDB>>> {
        const url = `${API_BASE_URL}/_/node/${nodeId}/chart/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },


    saveNode(token: string, id: string, display_name: string, description: string, sql_text: string, sort_order: number) {
        const url = `${API_BASE_URL}/_/node/${id}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                display_name: display_name,
                description: description,
                sql_text: sql_text,
                sort_order: sort_order
            })
        });

    },

    saveChart(token: string, id: string, chart_type: string, properties: object, display_name: string) {
        const url = `${API_BASE_URL}/_/chart/${id}/`;
        return api.fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                id,
                chart_type,
                properties,
                display_name
            })
        });

    },

    getChart(token: string, id: string): Promise<Response<ChartInDB>> {
        const url = `${API_BASE_URL}/_/chart/${id}/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    },

    chRequest(token: string, sql, dateAgg, dateRange, currentChain): Promise<Response<string>> {
        const url = `${API_BASE_URL}/_/clickhouse/`;
        return api.fetch(url, {
            method: "POST",
            body: JSON.stringify({
                query: sql,
                date_aggregation: dateAgg,
                date_range: dateRange,
                chain_filter: currentChain,
            }),
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getAppsForGroup(token): Promise<Response<CovalentListResponse<App>>> {
        const url = `${API_BASE_URL}/_/app/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getApp(token, app_id): Promise<Response<CovalentItemResponse<App>>> {
        const url = `${API_BASE_URL}/_/app/${app_id}/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getEndpointsForApps(token, app_id): Promise<Response<CovalentListResponse<Endpoint>>> {
        const url = `${API_BASE_URL}/_/app/${app_id}/endpoint/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    },

    createApps(token, displayName, description): Promise<Response<App>> {
        const url = `${API_BASE_URL}/_/app/`;
        return api.fetch(url, {
            method: "POST",
            body: JSON.stringify({
                display_name: displayName,
                description: description,
            }),
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    createApiEndpoint(token, endpointName, description, versionName, nodeID, appID): Promise<Response<Endpoint>> {
        const url = `${API_BASE_URL}/_/endpoint/`;
        return api.fetch(url, {
            method: "POST",
            body: JSON.stringify({
                name: endpointName,
                description: description,
                version_name: versionName,
                node_id: nodeID,
                app_id: appID,
            }),
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    getEndpointForNode(token, nodeId): Promise<Response<CovalentListResponse<Endpoint>>> {
        const url = `${API_BASE_URL}/_/node/${nodeId}/endpoint/`;
        return api.fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
    ogImage: async (id:string) => {

        const resp = await fetch(`https://covalent-og-image.vercel.app/api?id=${id}`, {
            method: "GET",
        });

        console.log(resp.body)

        let stream;

        // if (resp.body) {
        //     const reader = resp.body.getReader();
        //     stream = new ReadableStream({
        //         start(controller) {
        //             return pump();
        //             function pump() {
        //                 return reader.read().then(({ done, value }) => {
        //                     if (done) {
        //                         controller.close();
        //                         return;
        //                     }
        //                     controller.enqueue(value);
        //                     return pump();
        //                 });
        //             }
        //         }
        //     });
        // }

        // const blob = new Response(stream).blob();

        // const reader = new FileReader();

        // reader.readAsDataURL(await blob);

        // function blobToBase64(blob) {
        //     return new Promise((resolve, _) => {
        //         const reader = new FileReader();
        //         reader.onloadend = () => resolve(reader.result);
        //         reader.readAsDataURL(blob);
        //     });
        // }

        // const blob64: any = await blobToBase64(await blob);

        // const result = blob64.toString().replace("application/octet-stream", "image/png");

        // return result;


        // ((stream) => new Response(stream))
        //     .then((response) => response.blob())
        //     .then((blob) => {
        //         const reader = new FileReader();
        //         reader.readAsDataURL(blob);
        //         reader.onloadend = function() {
        //             const base64data = reader.result;
        //             return base64data?.toString().replace("application/octet-stream", "image/png");
        //         };

        //     });
    }

};
