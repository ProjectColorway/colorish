import Modal from "./Modal";

export default function AuthenticationRequiredModal({ modalProps }: { modalProps: { onClose(): void; }; }) {
    return <Modal modalProps={modalProps} title="Sign in required" onFinish={() => {
        modalProps.onClose();
        authorizeApp();
    }} confirmMsg="Sign In">
        To create colorways, you need to sign in to Colorish through Project Hub, using your Discord account
    </Modal>;
}
