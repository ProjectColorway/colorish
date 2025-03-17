import { createContext, useState } from "react";

export const GlobalSearchContext = createContext(false);

export function GlobalSearchProvider({ children }: { children({ toggleSearch, setSearchOpen }: { toggleSearch(page?: { placeholder: string, index: number; }): void, setSearchOpen(isOpen: boolean, page?: { placeholder: string, index: number; }): void; }): React.ReactNode; }) {
    const [active, setActive] = useState(false);
    return <GlobalSearchContext.Provider value={active}>{children({
        toggleSearch() {
            setActive(!active);
        },
        setSearchOpen(isOpen) {
            setActive(isOpen);
        },
    })}</GlobalSearchContext.Provider>;
}

export function useSearch() {
    const [active, setActive] = useState(false);
    <GlobalSearchContext.Provider value={active} />;
    return [active, setActive];
}
