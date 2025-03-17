export default function ({
    modalProps,
    onFinish,
    title,
    children,
    type = "normal",
    confirmMsg = "Finish",
    additionalButtons = [],
    cancelMsg = "Cancel",
    style = {},
    divider = true,
    footer
}: {
    modalProps: { onClose(): void; },
    onFinish?: (props: { closeModal(): void; }) => void,
    title: React.ReactNode,
    children: React.ReactNode,
    style?: React.CSSProperties,
    confirmMsg?: string,
    type?: "normal" | "danger",
    divider?: boolean,
    additionalButtons?: {
        text: string,
        action: ((props: { closeModal(): void; }) => any),
        type: "primary" | "brand" | "danger";
    }[],
    cancelMsg?: string,
    footer?: React.ReactNode;
}) {
    return <div style={style} className="dc-modal">
        <h2 className="dc-modal-header" style={!divider ? { boxShadow: "none" } : {}}>
            {title}
        </h2>
        <div className="dc-modal-content" style={{ minWidth: "500px" }}>
            {children}
        </div>
        <div className="dc-modal-footer">
            {footer || <>
                {onFinish ? <button
                    className={"dc-button dc-button-md" + (type === "danger" ? " dc-button-danger" : " dc-button-brand")}
                    onClick={() => onFinish({ closeModal: modalProps.onClose })}
                >
                    {confirmMsg}
                </button> : null}
                {additionalButtons.map(({ type, action, text }) => <button
                    className={`dc-button dc-button-md dc-button-${type}`}
                    onClick={() => action({ closeModal: modalProps.onClose })}
                >
                    {text}
                </button>)}
                <button
                    className={"dc-button dc-button-md dc-button-primary"}
                    onClick={() => modalProps.onClose()}
                >
                    {cancelMsg}
                </button>
            </>}
        </div>
    </div>;
}
