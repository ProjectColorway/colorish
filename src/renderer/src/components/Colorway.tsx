/* eslint-disable react-compiler/react-compiler */
import * as Dispatcher from "@api/Dispatcher";
import { Button } from "@components/Input";
import { JSX, KeyboardEventHandler, useLayoutEffect, useRef, useState } from "react";

import { colorToHex } from "../api/Colors";
import { ButtonColors } from "../types";
import { IconProps } from "./Icons";

export default function ColorwayItem(props: {
    prefix?(): JSX.Element,
    suffix?(): JSX.Element,
    menu?: React.ReactNode,
    id: string,
    "aria-invalid"?: boolean,
    "aria-checked"?: boolean,
    colors?: string[],
    text: string,
    descriptions?: string[],
    actions?: {
        Icon(props: IconProps): JSX.Element,
        onClick: React.MouseEventHandler<HTMLButtonElement>,
        type: ButtonColors;
    }[];
    onContextMenu?(event: React.MouseEvent<HTMLDivElement>): any;
    onClick?(event: React.MouseEvent<HTMLDivElement>): any;
    onMouseEnter?(event: React.MouseEvent<HTMLDivElement>): any;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}) {
    return <div
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        data-focus={props["data-focus"]}
        className="colorway-pure rounded-sm first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl [[data-focus='true']]:!border-black [[data-focus='true']]:dark:!border-primary-300"
        aria-invalid={props["aria-invalid"]}
        aria-checked={props["aria-checked"]}
        onMouseEnter={props.onMouseEnter}
        role="button"
        onContextMenu={e => {
            if (props.menu) Dispatcher.emit("OPEN_CONTEXT_MENU", {
                render() {
                    function Menu() {
                        const targetRef = useRef(null);
                        const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

                        useLayoutEffect(() => {
                            if (targetRef.current) {
                                setDimensions({
                                    width: (targetRef.current as any).offsetWidth,
                                    height: (targetRef.current as any).offsetHeight
                                });
                            }
                        }, []);
                        return <div ref={targetRef} className={"dc-contextmenu overflow-auto no-scrollbar !fixed"} onClick={e => e.stopPropagation()} style={{
                            top: `${Math.min(e.pageY, window.innerHeight - dimensions.height - 8)}px`,
                            left: `${Math.min(e.pageX, window.innerWidth - dimensions.width - 8)}px`
                        }}>
                            {props.menu}
                        </div>;
                    }
                    return <Menu />;
                }
            });
            props.onContextMenu && props.onContextMenu(e);
        }}
    >
        {props.prefix ? <props.prefix /> : (props.colors ? <div className="dc-color-swatch">
            {props.colors.map((colorStr: string, i: number) => <div
                key={i}
                className="dc-color-swatch-part"
                style={{
                    backgroundColor: `#${colorToHex(colorStr)}`,
                }}
            />)}
        </div> : null)}
        <div className="dc-label-wrapper">
            <span className="dc-label">{props.text}</span>
            {props.descriptions ? <span className="dc-label dc-subnote dc-note">{props.descriptions.join(" • ")}</span> : null}
        </div>
        {props.suffix ? <props.suffix /> : (props.actions || []).map((action, i: number) => <Button key={i} color={action.type} onClick={action.onClick}><action.Icon width={20} height={20} /></Button>)}
    </div>;
}
