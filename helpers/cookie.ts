
export const read = (name: string) => {
    const result = new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)").exec(document.cookie);
    return result ? result[1] : null;
};

export const write = (name: string, value: string, days?: number) => {
    if (!days) {
        days = 365 * 20;
    }

    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    const expires = "; expires=" + date.toUTCString();

    document.cookie = name + "=" + value + expires + "; path=/";
};

export const remove = (name: string) => {
    write(name, "", -1);
};

export default {read, write, remove};
