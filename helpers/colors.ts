export const DARK = {
        BG_COLOR: "bg-[rgb(24,24,24)]",
        BG_COLOR_SECONDARY: "bg-[#1f122f]",
        TEXT_COLOR: "text-white",
        TEXT_COLOR_RGB: "rgb(255,255,255)",
        BORDER: "border-[#7f0dff]",
        BORDER_SECONDARY: "border-[#7f0dff]/30",
        BORDER_TERTIARY: "border-gray-600",
        ACTIVE: "[#7f0dff]",
        RING: "ring-gray-500",
        ERROR: "text-red-500",
        SUCCESS: "text-emerald-500",
        EDITOR: "bg-gray-800",
        COVALENT_PINK: "pink-400",
        resizerStyle: {
            border: "2px solid #7f0dff",
            // borderTop: 0,
            // borderBottom: 0
        },
        resizerHorizontalStyle: {
            borderTop: "2px solid #7f0dff",
            borderBottom: "2px solid #7f0dff",
        }
    },
    LIGHT = {
        BG_COLOR: "bg-gray-100",
        BG_COLOR_SECONDARY: "bg-white",
        TEXT_COLOR: "text-gray-900",
        TEXT_COLOR_RGB: "rgb(17, 24, 39)",
        BORDER: "border-gray-400",
        BORDER_SECONDARY: "border-gray-300",
        BORDER_TERTIARY: "border-gray-600",
        ACTIVE: "[#7f0dff]",
        RING: "ring-gray-400",
        ERROR: "text-red-500",
        SUCCESS: "text-emerald-600",
        EDITOR: "bg-gray-800",
        COVALENT_PINK: "pink-400",
        resizerStyle: {
            border: "2px solid #fff",
            // borderTop: 0,
            // borderBottom: 0
        },
        resizerHorizontalStyle: {
            border: "#fff",
        }
    };

// https://docs.bokeh.org/en/latest/docs/reference/palettes.html

export const PRESET_COLOR_MAP = {
    "light-blue": "#7cd6fd",
    "blue": "#5e64ff",
    "violet": "#743ee2",
    "red": "#ff5858",
    "orange": "#ffa00a",
    "yellow": "#feef72",
    "green": "#28a745",
    "light-green": "#98d85b",
    "purple": "#b554ff",
    "magenta": "#ffa3ef",
    "black": "#36114C",
    "grey": "#bdd3e6",
    "light-grey": "#f0f4f7",
    "dark-grey": "#b8c2cc",
    "covalent-pink": "#FF4C8B"
};


export const QUALITATIVE_COLOR_SCHEME = ["#2965CC",
    "#29A634",
    "#D99E0B",
    "#D13913",
    "#8F398F",
    "#00B3A4",
    "#DB2C6F",
    "#9BBF30",
    "#96622D",
    "#7157D9"
];

const RAINBOW_COLOR_SCHEME = ["#0482C1", "#F08E00", "#19B02B", "#E3352C", "#B86EC6",
    "#B06353", "#00C3D2", "#D4C500", "#E67FC8", "#A18D8D", "#BCD6DF",
    "#EEC37D", "#B7DB92", "#F0A5A1", "#D8B8D5", "#D8A89F", "#D8C9C9",
    "#E0D893", "#CAC9E0", "#FFFFFF", "#000000"];

// const RAINBOW_NEON_SCHEME = ["#4D4DFF", "#E0E722", "#3939BF", "#FFAD00", "#D22730",
//     "#DB3EB1", "#44D62C", "#05C3DD", "#F4364C","#2AF5C9", "#8FF542", "#F000FF"];

// const RAINBOW_NEON_COLOR_SCHEME = ["#dfff11", "#66ff00", "#ff08e8", "#fe01b1", "#be03fd", "#ff000d", "#ffcf09",
//     "#fc0e34", "#01f9c6", "#ff003f", "#0ff0fc", "#fc74fd", "#21fc0d", "#6600ff", "#ccff00", "#ff3503", "#ff0490", "#bf00ff",
//     "#e60000", "#55ffff", "#8f00f1", "#fffc00", "#08ff08", "#ffcf00", "#fe1493", "#ff5555", "#fc8427", "#00fdff", "#ccff02",
//     "#ff11ff", "#04d9ff", "#ff9933", "#fe4164", "#39ff14", "#fe019a", "#bc13fe", "#ff073a", "#cfff04", "#ff0055", "#39FF14"];

// const RAINBOW_COLOR_NEONS_SCHEME = [...new Set([...RAINBOW_COLOR_SCHEME,...RAINBOW_NEON_SCHEME, ...RAINBOW_NEON_COLOR_SCHEME])];

const REFLECT_SCHEME = ["#269cff",
    "#265bff",
    "#3226ff",
    "#7326ff",
    "#b426ff",
    "#f626ff",
    "#ff26c7",
    "#ff2686",
    "#ff2645",
    "#ff4826",
    "#ff8926",
    "#ffca26"
];

const CONTRAST_SCHEME = ["#377eb8",
    "#e41a1c",
    "#49B044",
    "#984ea3",
    "#ff7f00",
    "#EAEA00",
    "#a65628",
    "#f781bf"];


const COVALENT_CHART_COLORS = [
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

export const PIE_CHART_COLORS = {
    "blues": ["#08306b", "#08519c", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"],
    "oranges": ["#7f2704", "#a63603", "#d94801", "#f16913", "#fd8d3c", "#fdae6b", "#fdd0a2", "#fee6ce", "#fff5eb"],
    "greens": ["#00441b", "#006d2c", "#238b45", "#41ab5d", "#74c476", "#a1d99b", "#c7e9c0", "#e5f5e0", "#f7fcf5"],
    "reds": ["#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"],
    "purples": ["#3f007d", "#54278f", "#6a51a3", "#807dba", "#9e9ac8", "#bcbddc", "#dadaeb", "#efedf5", "#fcfbfd"],
    "rdylbu": ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
    "spectral": ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"],
    "cividis": ["#00204C", "#00316F", "#31446B", "#4D556B", "#666870", "#7B7B78", "#958F78", "#AEA373", "#CAB969", "#E6D059", "#FFE945"],
    "turbo": ["#30123b", "#4458cb", "#3e9bfe", "#18d5cc", "#46f783", "#a1fc3d", "#e1dc37", "#fda631", "#ef5a11", "#c52602", "#7a0402"],
    "rdylgn": ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027", "#a50026"],
    "plasma": ["#0C0786", "#40039C", "#6A00A7", "#8F0DA3", "#B02A8F", "#CA4678", "#E06461", "#F1824C", "#FCA635", "#FCCC25", "#EFF821"],
    "viridis": ["#440154", "#482374", "#404387", "#345E8D", "#29788E", "#208F8C", "#22A784", "#42BE71", "#79D151", "#BADE27", "#FDE724"],
    "puor": ["#2d004b", "#542788", "#8073ac", "#b2abd2", "#d8daeb", "#f7f7f7", "#fee0b6", "#fdb863", "#e08214", "#b35806", "#7f3b08"],
    "rdbu": ["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"],
};

export const QUANT_COLOR_PALETTES = {
    "blues": ["#08519c", "#3182bd", "#6baed6", "#bdd7e7", "#eff3ff"],
    "greens": ["#006d2c", "#31a354", "#74c476", "#bae4b3", "#edf8e9"],
    "oranges": ["#a63603", "#e6550d", "#fd8d3c", "#fdbe85", "#feedde"],
    "purples": ["#54278f", "#756bb1", "#9e9ac8", "#cbc9e2", "#f2f0f7"],
    "reds": ["#a50f15", "#de2d26", "#fb6a4a", "#fcae91", "#fee5d9"],
    "viridis": ["#440154", "#3B518B", "#21908D", "#5CC863", "#FDE725"],
    "ylgn": ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"],
    "ylgnbu": ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
    "blorbr": ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"],
    "ylorrd": ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
    "rdylbu": ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    "rdylgn": ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"]
};

export const COLOR_SCHEME = RAINBOW_COLOR_SCHEME;
// export const COLOR_SCHEME = RAINBOW_COLOR_NEONS_SCHEME;

export const gradient = (spectrum: string[], minNum: number, maxNum: number) => {

    class G {
        private startColor: string;
        private endColor: string;
        private minNum: number;
        private maxNum: number;

        setGradient(colorStart: string, colorEnd: string) {
            this.startColor = colorStart.substring(1, 7);
            this.endColor = colorEnd.substring(1, 7);
        }

        setNumberRange(minNumber: number, maxNumber: number) {
            this.minNum = minNumber;
            this.maxNum = maxNumber;
        }

        colorAt(value: number) {
            const startColor = this.startColor;
            const endColor = this.endColor;
            const calcHex = this.calcHex.bind(this);

            return "#" + calcHex(value, startColor.substring(0, 2), endColor.substring(0, 2))
                + calcHex(value, startColor.substring(2, 4), endColor.substring(2, 4))
                + calcHex(value, startColor.substring(4, 6), endColor.substring(4, 6));
        }

        private calcHex(value: number, channelStart_Base16: string, channelEnd_Base16: string) {
            const formatHex = (hex: string) => {
                if (hex.length === 1) {
                    return "0" + hex;
                }
                return hex;
            };

            let num = value;
            if (num < this.minNum) {
                num = this.minNum;
            }
            if (num > this.maxNum) {
                num = this.maxNum;
            }
            const numRange = this.maxNum - this.minNum;
            const cStart_Base10 = parseInt(channelStart_Base16, 16);
            const cEnd_Base10 = parseInt(channelEnd_Base16, 16);
            const cPerUnit = (cEnd_Base10 - cStart_Base10) / numRange;
            const c_Base10 = Math.round(cPerUnit * (num - this.minNum) + cStart_Base10);
            return formatHex(c_Base10.toString(16));
        }
    }

    if (spectrum.length < 2) {
        throw new Error("Two or more colors expected.");
    }

    // const minNum = 0, maxNum = 100;

    const increment = (maxNum - minNum) / (spectrum.length - 1);
    const firstGradient = new G();
    firstGradient.setGradient(spectrum[0], spectrum[1]);
    firstGradient.setNumberRange(minNum, minNum + increment);
    const gradients = [firstGradient];

    for (let i = 1; i < spectrum.length - 1; i++) {
        const colorGradient = new G();
        colorGradient.setGradient(spectrum[i], spectrum[i + 1]);
        colorGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1));
        gradients[i] = colorGradient;
    }

    return {
        colorAt: (val: number) => {
            if (isNaN(val)) {
                throw new TypeError(val + " is not a number");
            } else if (gradients.length === 1) {
                return gradients[0].colorAt(val);
            } else {
                const segment = (maxNum - minNum) / (gradients.length),
                    index = Math.min(Math.floor((Math.max(val, minNum) - minNum) / segment), gradients.length - 1);
                return gradients[index].colorAt(val);
            }
        },
        colorAtFloor: (val: number) => {
            const segment = (maxNum - minNum) / (spectrum.length),
                index = Math.min(Math.floor((Math.max(val, minNum) - minNum) / segment), spectrum.length - 1);

            return segment === 0 ? spectrum[0] : spectrum[index];
        },
        indexAt: (val: number) => {
            if (isNaN(val)) {
                throw new TypeError(val + " is not a number");
            } else if (gradients.length === 1) {
                return 0;
            } else {
                const segment = (maxNum - minNum) / (gradients.length),
                    index = Math.min(Math.floor((Math.max(val, minNum) - minNum) / segment), gradients.length - 1);
                return index;
            }
        }
    };

};
