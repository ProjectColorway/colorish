import { colorToHex } from "./api/Colors";

function HexToHSL(H: string) {
    // Convert hex to RGB first
    let r: number = 0, g: number = 0, b: number = 0;
    if (H.length === 4) {
        r = Number("0x" + H[1] + H[1]);
        g = Number("0x" + H[2] + H[2]);
        b = Number("0x" + H[3] + H[3]);
    } else if (H.length === 7) {
        r = Number("0x" + H[1] + H[2]);
        g = Number("0x" + H[3] + H[4]);
        b = Number("0x" + H[5] + H[6]);
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0,
        s = 0,
        l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [Math.round(h), Math.round(s), Math.round(l)];
}

export function getAutoPresets(accentColor?: string) {
    return {
        hueRotation: {
            name: "Hue Rotation",
            id: "hueRotation",
            colors: {
                accent: "#" + accentColor,
                primary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 21%)`),
                secondary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 11% 18%)`),
                tertiary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 10% 13%)`)
            }
        },
        accentSwap: {
            name: "Accent Swap",
            id: "accentSwap",
            colors: {
                accent: "#" + accentColor,
                primary: "#313338",
                secondary: "#2b2d31",
                tertiary: "#1e1f22"
            }
        },
        AMOLED: {
            name: "AMOLED",
            id: "AMOLED",
            colors: {
                accent: "#" + accentColor,
                primary: "#000000",
                secondary: "#000000",
                tertiary: "#000000"
            }
        },
        materialYou: {
            name: "Material You",
            id: "materialYou",
            colors: {
                accent: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 100% 23%)`),
                primary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 12% 12%)`),
                secondary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 12% 16%)`),
                tertiary: "#" + colorToHex(`hsl(${HexToHSL("#" + accentColor)[0]} 16% 18%)`)
            }
        }
    } as { [key: string]: { name: string, id: string, colors: { accent: string, primary: string, secondary: string, tertiary: string; }; }; };
}
