import { type contexts } from "./api/Contexts";
import { type colorVals } from "./constants";

declare global {
    interface Colorway {
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

    interface WsClient extends WebSocket {
        dispatch: (event: string, data?: { [key: string]: any; }) => void;
        boundKey: string,
        isManager: boolean,
        complications: string[],
        online: { name: string, url: string; }[],
        offline: { name: string, colorways: Colorway[]; }[],
        changeColorway: (activeColorwayObject: ColorwayObject) => void;
        removeColorway: () => void;
    }
    interface BoundClient {
        boundKey: { [key: string]: string; };
        isManager: boolean;
        complications: string[];
        online: { name: string, url: string; }[];
        offline: { name: string, colorways: Colorway[]; }[];
    }

    type FormTextTypes = Record<"DEFAULT" | "INPUT_PLACEHOLDER" | "DESCRIPTION" | "LABEL_BOLD" | "LABEL_SELECTED" | "LABEL_DESCRIPTOR" | "ERROR" | "SUCCESS", string>;
    type Heading = `h${1 | 2 | 3 | 4 | 5 | 6}`;

    type FormTitle = React.ComponentType<React.HTMLProps<HTMLTitleElement> & React.PropsWithChildren<{
        /** is h5 */
        tag?: Heading;
        faded?: boolean;
        disabled?: boolean;
        required?: boolean;
        error?: React.ReactNode;
    }>>;

    type FormSection = React.ComponentType<React.PropsWithChildren<{
        /** is h5 */
        tag?: Heading;
        className?: string;
        titleClassName?: string;
        titleId?: string;
        title?: React.ReactNode;
        disabled?: boolean;
        htmlFor?: unknown;
    }>>;

    type FormDivider = React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
    }>;


    type FormText = React.ComponentType<React.PropsWithChildren<{
        disabled?: boolean;
        selectable?: boolean;
        /** defaults to FormText.Types.DEFAULT */
        type?: string;
    }> & TextProps> & { Types: FormTextTypes; };

    type TextVariant = "heading-sm/normal" | "heading-sm/medium" | "heading-sm/semibold" | "heading-sm/bold" | "heading-md/normal" | "heading-md/medium" | "heading-md/semibold" | "heading-md/bold" | "heading-lg/normal" | "heading-lg/medium" | "heading-lg/semibold" | "heading-lg/bold" | "heading-xl/normal" | "heading-xl/medium" | "heading-xl/bold" | "heading-xxl/normal" | "heading-xxl/medium" | "heading-xxl/bold" | "eyebrow" | "heading-deprecated-14/normal" | "heading-deprecated-14/medium" | "heading-deprecated-14/bold" | "text-xxs/normal" | "text-xxs/medium" | "text-xxs/semibold" | "text-xxs/bold" | "text-xs/normal" | "text-xs/medium" | "text-xs/semibold" | "text-xs/bold" | "text-sm/normal" | "text-sm/medium" | "text-sm/semibold" | "text-sm/bold" | "text-md/normal" | "text-md/medium" | "text-md/semibold" | "text-md/bold" | "text-lg/normal" | "text-lg/medium" | "text-lg/semibold" | "text-lg/bold" | "display-sm" | "display-md" | "display-lg" | "code";

    type TextProps = React.PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement> & {
        variant?: TextVariant;
        tag?: "div" | "span" | "p" | "strong" | Heading;
        selectable?: boolean;
        lineClamp?: number;
    }>;

    type FormsType = {
        FormTitle: FormTitle,
        FormSection: FormSection,
        FormDivider: FormDivider,
        FormText: FormText,
        CustomColorPicker;
    };

    interface ColorPickerProps {
        color: number;
        showEyeDropper: boolean;
        suggestedColors: string[];
        label: any;
        onChange(color: number): void;
    }

    interface ColorwayObject {
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

    interface Preset {
        name: string;
        css: string;
        sourceType: PresetSourceType,
        source: string,
        author: string,
        conditions?: PresetCondition[];
    }

    interface PresetCondition {
        if: string;
        is: PresetConditionFunction;
        than: string;
        onCondition: string;
        onConditionElse?: string;
    }

    type PresetConditionFunction = "greaterThan" | "lowerThan" | "equal";

    interface PresetObject {
        id: string;
        css: string;
        sourceType: PresetSourceType,
        source: string,
        conditions?: PresetCondition[];
    }

    const enum Tabs {
        Selector,
        Settings,
        Sources,
        WsConnection,
        ExpandSidebar
    }

    type ColorValue = typeof colorVals[number]["value"];

    interface SourceObject {
        type: "online" | "offline",
        source: string,
        colorways?: Colorway[],
        appName: string,
        appId: string;
    }

    enum SortOptions {
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

    interface StoreObject {
        sources: StoreItem[];
    }

    interface StoreItem {
        name: string,
        id: string,
        description: string,
        url: string,
        authorGh: string;
    }

    const enum ModalTransitionState {
        ENTERING,
        ENTERED,
        EXITING,
        EXITED,
        HIDDEN,
    }

    interface ModalProps {
        transitionState: ModalTransitionState;
        onClose(): void;
    }

    interface ModalOptions {
        modalKey?: string;
        onCloseRequest?: (() => void);
        onCloseCallback?: (() => void);
    }

    const enum SourceActions {
        AddColorway,
        RemoveColorway,
        AddPreset,
        RemovePreset
    }

    interface ButtonProps {
        color?: ButtonColors;
        size?: ButtonSizes;
        props?: ("outlined" | "icon")[];
        onClick: React.MouseEventHandler<HTMLButtonElement>;
        children: React.ReactNode;
    }

    const enum ButtonColors {
        BRAND = "brand",
        PRIMARY = "primary",
        SECONDARY = "secondary",
        DANGER = "danger"
    }

    const enum ButtonSizes {
        TINY = "tn",
        MEDIUM = "md",
        LARGE = "lg",
        EXTRALARGE = "xl"
    }

    type RenderFunction = (props: ModalProps) => React.ReactNode;

    type ContextKey = keyof typeof contexts;
    type Contexts = typeof contexts;
    type Context<Key extends ContextKey> = typeof contexts[Key];
    function onOsColorChanged(callback: () => void): void;
    function getSystemColor(): Promise<{ "os-accent-color": string; }>;
    const dc_win: {
        minimize(): void;
        focus(): void;
        toggleMaximize(): void;
        close(): void;
        getWsClients(): WsClient[];
        openWindow(HTML: string): void;
        changeManagerRoleState(boundKey: { [x: number]: string; }, enabled: boolean): void;
    };
}
