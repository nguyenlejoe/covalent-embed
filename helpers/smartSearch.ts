
export function smartSearch(query: string, ...content: string[]) {
    const terms = query.toLowerCase().split(" ");
    const dataToSearch = content.map((s) => s.toLowerCase());
    return terms.every((term) => dataToSearch.some((d) => d.indexOf(term) >= 0));
}
