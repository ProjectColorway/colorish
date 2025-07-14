import { setContext } from "@renderer/api/Contexts";
import { useContexts } from "@renderer/api/Hooks";
import { openModal } from "@renderer/api/Modals";
import Modal from "@renderer/components/Modals/Modal";
import { useState } from "react";

import Discover from "../Sources/Discover";
import History from "./History";
import Settings from "./Settings";
import Sources from "./Sources";

const enum Tabs {
    Home,
    Settings,
    History,
    Sources,
    Store
}

export default function Home() {
    const contexts = useContexts();
    const [tab, setTab] = useState<Tabs>(Tabs.Home);
    return <>
        {<div className="flex flex-col gap-3">
            {(tab !== Tabs.Home) && <div className="dc-button dc-button-primary dc-button-icon !rounded-full dc-button-lg !w-fit" onClick={() => setTab(Tabs.Home)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
            </div>}
            {tab === Tabs.Home && <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {contexts.authedUser && contexts.authedUser.username ? <>
                            <img src={contexts.authedUser.image as string} className="size-16 rounded-full" />
                            <span className="text-black dark:text-white text-xl font-semibold">{contexts.authedUser.username as string}</span>
                        </> : <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 text-black dark:text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span className="text-black dark:text-white text-xl font-semibold">Sign In</span>
                        </>}
                    </div>
                    <div className="flex items-center gap-2">
                        {contexts.authedUser && contexts.authedUser.username ? <div className="dc-button dc-button-danger dc-button-icon dc-button-lg !rounded-full" onClick={() => openModal(props => <Modal modalProps={props} title="Log Out?" onFinish={({ closeModal }) => {
                            setContext("authedUser", { username: null, image: null });
                            closeModal();
                        }} confirmMsg="Log Out" type="danger">
                            Are you sure you want to log out? You will lose access to the colorway creator.
                        </Modal>)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </div> : <div className="dc-button dc-button-secondary dc-button-icon dc-button-lg !rounded-full" onClick={() => authorizeApp()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </div>}
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl" onClick={() => setTab(Tabs.Sources)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">Soures</span>
                            <span className="dc-label dc-subnote dc-note">Your installed Colorways sources</span>
                        </div>
                    </div>
                    <div className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl" onClick={() => setTab(Tabs.Store)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">Colorway Store</span>
                            <span className="dc-label dc-subnote dc-note">Get new Colorways</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl" onClick={() => setTab(Tabs.History)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5" />
                        </svg>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">Usage History</span>
                        </div>
                    </div>
                    <div className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl" onClick={() => setTab(Tabs.Settings)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                        </svg>
                        <div className="dc-label-wrapper">
                            <span className="dc-label">Settings</span>
                        </div>
                    </div>
                </div>
            </div>}
            {tab === Tabs.Settings && <Settings />}
            {tab === Tabs.Sources && <Sources />}
            {tab === Tabs.History && <History />}
            {tab === Tabs.Store && <Discover />}
            <div className="h-16"></div>
        </div>}
    </>;
}
