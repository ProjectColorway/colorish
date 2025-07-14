import * as $ExpressionParser from "@api/Parsers/ExpressionsParser";

export const ExpressionParser = $ExpressionParser;

export const stringToHex = (str: string) => {
    let hex = "";
    for (
        let i = 0;
        i < str.length;
        i++
    ) {
        const charCode = str.charCodeAt(i);
        const hexValue = charCode.toString(16);
        hex += hexValue.padStart(2, "0");
    }
    return hex;
};

export function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export function classes(...classes: Array<string | null | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}
