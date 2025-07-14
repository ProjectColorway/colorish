import { initContexts, setContext } from "@api/Contexts";
import { setSearchOpen } from "@api/GlobalSearch";
import * as Manager from "@api/Manager";
import { openModal } from "@api/Modals";
import { ContextMenuLayer } from "@components/ContextMenu";
import GlobalSearch from "@components/Modals/GlobalSearch";
import Modal from "@components/Modals/Modal";
import ModalLayer from "@components/Modals/ModalLayer";
import Notifications from "@components/Notifications";
import { Discover, Selector } from "@components/Pages";
import Spinner from "@components/Spinner";
import { JSX, lazy, Suspense, useEffect, useState } from "react";

import { useContexts } from "./api/Hooks";
import LayerContainer from "./components/Layers/LayerContainer";
import SettingsHome from "./components/Pages/Settings/Home";
import { Tabs } from "./types";

const SuspensefulMainUI = lazy(() => new Promise<{
    default: React.ComponentType<any>;
}>(resolve => {
    initContexts().then(() => resolve({
        default: ({ activeTab }: { activeTab: Tabs; }) => <div className="overflow-auto max-h-full gap-1 flex flex-col max-w-300 mx-auto use-scrollbar" style={{ width: "100%" }}>
            {activeTab === Tabs.Colorways && <Selector />}
            {activeTab === Tabs.Discover && <Discover />}
            {activeTab === Tabs.SettingsHome && <SettingsHome />}
        </div>
    }));
}));

function App(): JSX.Element {
    const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Colorways);
    const contexts = useContexts();

    useEffect(() => {
        function preloadMessageHandlers(e: any) {
            if (e.source === null && e.data.type === "complication:manager-role:request") {
                openModal(props => <Modal modalProps={props} title="Manager Role Request" confirmMsg="Approve" onFinish={({ closeModal }) => {
                    dc_win.changeManagerRoleState(e.data.boundKey, true);
                    closeModal();
                }}
                    cancelMsg="Reject"
                >
                    {Manager.getClientDisplayName(Object.values(e.data.boundKey)[0] as string)} has requested manager
                    access. This will allow this app to change colorways to all connected clients.
                </Modal>);
            }
            if (e.data.type === "authed-user") {
                setContext("authedUser", e.data.user);
            }
        }

        window.addEventListener("message", preloadMessageHandlers);

        return () => {
            window.removeEventListener("message", preloadMessageHandlers);
        };
    }, []);
    return (
        <>
            <div className="flex h-[100vh] pb-1 pt-10 px-4 gap-4" >
                <Suspense fallback={<div className="flex justify-center items-center w-full h-full">
                    <Spinner className="text-black dark:text-white size-24" />
                </div>}>
                    <SuspensefulMainUI activeTab={activeTab} />
                </Suspense>
            </div>
            <div className="flex p-2 gap-2 fixed items-center justify-stretch bottom-2 mx-2 h-16 w-[calc(100%-16px)] bg-primary-100 dark:bg-primary-600 backdrop-blur-xl shadow-xl shadow-primary-500 dark:shadow-black rounded-full backdrop-brightness-50 border border-primary-400/20">
                <div className={"flex cursor-pointer items-center justify-center w-full h-full rounded-full transition duration-150 ease-in-out hover:bg-primary-200 active:bg-primary-300 dark:hover:bg-primary-700 dark:active:bg-primary-800 text-black dark:text-white" + (activeTab === Tabs.Colorways ? " !bg-primary-300 dark:!bg-primary-800" : "")} onClick={() => setActiveTab(Tabs.Colorways)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 1 1-9 0V4.125Zm4.5 14.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
                        <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257ZM12.738 17.625l6.474-6.474a1.875 1.875 0 0 0 0-2.651L15.5 4.787a1.875 1.875 0 0 0-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375Z" />
                    </svg>
                </div>
                <div className="flex cursor-pointer items-center justify-center w-1/2 h-full min-w-20 rounded-full transition duration-150 ease-in-out bg-white dark:bg-primary-400 hover:bg-primary-200 active:bg-primary-300 dark:hover:bg-primary-700 dark:active:bg-primary-800 text-black dark:text-white" onClick={e => {
                    e.stopPropagation();
                    setSearchOpen(true);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className={"flex cursor-pointer items-center justify-center w-full h-full rounded-full transition duration-150 ease-in-out hover:bg-primary-200 active:bg-primary-300 dark:hover:bg-primary-700 dark:active:bg-primary-800 text-black dark:text-white" + (activeTab === Tabs.SettingsHome ? " !bg-primary-300 dark:!bg-primary-800" : "")} onClick={() => setActiveTab(Tabs.SettingsHome)}>
                    {!contexts.authedUser || !contexts.authedUser.username ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg> : <img className="size-6 rounded-full" src={contexts.authedUser.image as string} alt="authorized user image" />}
                </div>
            </div>
            <GlobalSearch />
            <LayerContainer />
            <ModalLayer />
            <Notifications />
            <ContextMenuLayer />
            {((window as any).dc_win) ? <div className="z-1001 fixed top-0 right-0 w-full flex justify-start items-stretch flex-row-reverse region-drag">
                <div onClick={() => dc_win.close()} className="dc-win-button-close dc-win-button region-no-drag" aria-label="Close" tabIndex={-1} role="button">
                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12"><polygon fill="currentColor" fillRule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
                    </svg>
                </div>
                <div onClick={() => dc_win.minimize()} className="dc-win-button-minmax dc-win-button region-no-drag" aria-label="Minimize" tabIndex={-1} role="button">
                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6" />
                    </svg>
                </div>
                <span className="my-1 ml-4 rounded-full text-black dark:text-white mr-auto h-fit flex font-logo">Colorish</span>
            </div> : null}
        </>
    );
}

export default App;
