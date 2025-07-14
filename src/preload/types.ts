export interface Colorway {
    [key: string]: any,
    name: string,
    "dc-import"?: string,
    accent: string,
    primary: string,
    secondary: string,
    tertiary: string,
    original?: boolean,
    author: string,
    colors?: string[],
    isGradient?: boolean,
    sourceType?: "online" | "offline" | "temporary" | null,
    source?: string,
    linearGradient?: string;
}

export interface WsClient extends WebSocket {
    dispatch: (event: string, data?: { [key: string]: any; }) => void;
    boundKey: string,
    isManager: boolean,
    complications: string[],
    online: { name: string, url: string; }[],
    offline: { name: string, colorways: Colorway[]; }[],
    changeColorway: (activeColorwayObject: ColorwayObject) => void;
    removeColorway: () => void;
}
export interface BoundClient {
    boundKey: { [key: string]: string; };
    isManager: boolean;
    complications: string[];
    online: { name: string, url: string; }[];
    offline: { name: string, colorways: Colorway[]; }[];
}

export interface ColorPickerProps {
    color: number;
    showEyeDropper: boolean;
    suggestedColors: string[];
    label: any;
    onChange(color: number): void;
}

export interface ColorwayObject {
    id: string | null,
    css?: string | null,
    sourceType: "online" | "offline" | "temporary" | "auto" | null | undefined,
    source: string | null | undefined,
    colors: {
        accent: string,
        primary: string,
        secondary: string,
        tertiary: string;
    },
    linearGradient?: string;
}

type PresetSourceType = "online" | "offline" | "theme" | "builtin";

export interface Preset {
    name: string;
    css: string;
    sourceType: PresetSourceType,
    source: string,
    author: string,
    conditions?: PresetCondition[];
}

export interface PresetCondition {
    if: string;
    is: PresetConditionFunction;
    than: string;
    onCondition: string;
    onConditionElse?: string;
}

export type PresetConditionFunction = "greaterThan" | "lowerThan" | "equal";

export interface PresetObject {
    id: string;
    css: string;
    sourceType: PresetSourceType,
    source: string,
    conditions?: PresetCondition[];
}

export const enum Tabs {
    Selector,
    Settings,
    Sources,
    WsConnection,
    ExpandSidebar
}

export interface SourceObject {
    type: "online" | "offline",
    source: string,
    colorways?: Colorway[],
    presets?: Preset[];
}

export enum SortOptions {
    NAME_AZ = 1,
    NAME_ZA = 2,
    SOURCE_AZ = 3,
    SOURCE_ZA = 4,
    SOURCETYPE_ONLINE = 5,
    SOURCETYPE_OFFLINE = 6,
    COLORCOUNT_ASCENDING = 7,
    COLORCOUNT_DESCENDING = 8,
    MOST_USED = 9,
    LEAST_USED = 10
}

export interface StoreObject {
    sources: StoreItem[];
}

export interface StoreItem {
    name: string,
    id: string,
    description: string,
    url: string,
    authorGh: string;
}

export const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN,
}

export interface ModalProps {
    transitionState: ModalTransitionState;
    onClose(): void;
}

export interface ModalOptions {
    modalKey?: string;
    onCloseRequest?: (() => void);
    onCloseCallback?: (() => void);
}

export const enum SourceActions {
    AddColorway,
    RemoveColorway,
    AddPreset,
    RemovePreset
}

export const enum ButtonColors {
    BRAND = "brand",
    PRIMARY = "primary",
    SECONDARY = "secondary",
    DANGER = "danger"
}

export const enum ButtonSizes {
    TINY = "tn",
    MEDIUM = "md",
    LARGE = "lg",
    EXTRALARGE = "xl"
}
