import { CHResponseWrapper } from "../helpers/common";

export const csvDownload = (maybeData: any, maybeQuery?: any, displayName?: string) => {

    maybeData.match({
        None: () => null,
        Some: (data: CHResponseWrapper) => {

            const csvFileData: Array<any> = [];
            if (data.data === undefined) {
                return;
            }

            if (data.data.data.length === 0) {
                return;
            }

            data.data.data.forEach((e: any) => {
                csvFileData.push(Object.values(e));
            });

            let csv = Object.keys(data.data.data[0]).join() + "\n";

            csvFileData.forEach(function(row) {
                csv += row.join(",");
                csv += "\n";
            });

            const hiddenElement = document.createElement("a");
            hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
            hiddenElement.target = "_blank";

            if (displayName === undefined) {
                maybeQuery.match({
                    None: () => hiddenElement.download = "Untitled File.csv",
                    Some: (query) => hiddenElement.download = query.display_name + ".csv"
                });
            } else {
                hiddenElement.download = displayName + ".csv";
            }

            hiddenElement.click();

        }
    });
};
