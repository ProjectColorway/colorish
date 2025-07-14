import { JSX } from "react";
import { ButtonProps } from "../../types";

export default function (props: ButtonProps): JSX.Element {
    return <button
        className={`dc-button ${props.color ? "dc-button-" + props.color : ""} ${props.size ? "dc-button-" + props.size : ""} ${(props.props || []).map(prop => ("dc-button-" + prop)).join(" ")}`}
        onClick={props.onClick}
    >
        {props.children}
    </button>;
}
