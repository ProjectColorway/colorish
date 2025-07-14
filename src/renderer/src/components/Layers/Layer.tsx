import { ReactNode } from "react";

export default function Layer({
    children
}: {
    children: ReactNode;
}) {
    return <div className="animate-modal bg-white dark:bg-primary-500 black:bg-black w-screen h-screen fixed top-0 left-0 flex gap-4 pb-1 pt-10 px-4">{children}</div>;
}
