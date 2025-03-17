import { useEffect } from "react";
import MainUI from './components/MainUI';
import ModalLayer from "./components/Modals/ModalLayer";
import Modal from "./components/Modal";
import { Manager } from "./api";
import Notifications from "./components/Notifications";
import GlobalSearch from "./components/Modals/GlobalSearch";
import { GlobalSearchProvider } from "./contexts";

export let openModal: (callback: (props: { onClose(): void; }) => React.ReactNode) => void, showNotification: (msg: string, actions?: React.ReactNode) => void, toggleSearch: (page?: { placeholder: string, index: number; }) => void, setSearchOpen: (isOpen: boolean, page?: { placeholder: string, index: number; }) => void;

function App(): JSX.Element {
    useEffect(() => {
        function managerPermissionRequest(e: any) {
            if (e.source === window && e.data.type === "complication:manager-role:request") {
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
        }

        window.addEventListener("message", managerPermissionRequest);

        window.document.addEventListener("click", () => setSearchOpen(false));

        return () => {
            window.document.removeEventListener("click", () => setSearchOpen(false));
            window.removeEventListener("message", managerPermissionRequest);
        };
    }, []);
    return (
        <GlobalSearchProvider>
            {({ toggleSearch: ts, setSearchOpen: sso }) => <Notifications>
                {({ showNotification: sn }) => <ModalLayer>
                    {({ openModal: op }) => {
                        showNotification = sn;
                        openModal = op;
                        toggleSearch = ts;
                        setSearchOpen = sso;
                        return <>
                            <MainUI />
                            <GlobalSearch />
                            {((window as any).dc_win) ? <div className="z-1001 fixed top-0 right-0 w-fit flex justify-start items-stretch flex-row-reverse region-no-drag">
                                <div onClick={() => dc_win.close()} className="dc-win-button-close dc-win-button region-no-drag" aria-label="Close" tabIndex={-1} role="button">
                                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12"><polygon fill="currentColor" fillRule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
                                    </svg>
                                </div>
                                <div onClick={() => dc_win.toggleMaximize()} className="dc-win-button-minmax dc-win-button region-no-drag" aria-label="Maximize" tabIndex={-1} role="button">
                                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12">
                                        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
                                    </svg>
                                </div>
                                <div onClick={() => dc_win.minimize()} className="dc-win-button-minmax dc-win-button region-no-drag" aria-label="Minimize" tabIndex={-1} role="button">
                                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6" />
                                    </svg>
                                </div>
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchOpen(true);
                                }} className="dc-win-button-minmax dc-win-button region-no-drag" aria-label="Minimize" tabIndex={-1} role="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3">
                                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div> : null}
                        </>;
                    }}
                </ModalLayer>}
            </Notifications>}
        </GlobalSearchProvider>
    );
}

export default App;
