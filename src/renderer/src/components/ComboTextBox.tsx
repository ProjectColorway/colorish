import { setSearchOpen } from "@renderer/App";

export default function ({ placeholder = "", children = <></>, style = {}, page }: { value?: string, onInput?: (value: string) => void, placeholder?: string, children?: React.ReactNode, disabled?: boolean, readOnly?: boolean, style?: React.CSSProperties, page?: { placeholder: string, index: number; }; }) {
    return <div className="flex gap-1 w-full justify-center items-center" style={style}>
        <button
            className="w-60 cursor-pointer px-4 outline-hidden rounded-lg bg-primary-100 hover:bg-primary-200 dark:bg-primary-600 black:bg-primary-800 hover:dark:bg-primary-700 flex py-1.25 text-black dark:text-primary-100 gap-1 justify-center transition-all duration-300"
            style={{ paddingRight: "6px" }}
            onClick={(e) => {
                e.stopPropagation();
                setSearchOpen(true, page);
            }}
        >{placeholder}</button>
        <div className="dc-textbox-trail">{children}</div>
    </div>;
}
