import { Modals } from "@renderer/api";
import { useContextualState } from "../../api/Hooks";
import changelog from "../../changelog";
import { DiscordIcon } from "../Icons";
import Modal from "../Modal";


function YoutubeEmbed({ src }) {
    return <iframe
        src={src}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
    />;
}

function Video({ src, poster }) {
    if (src.toLowerCase().includes("youtube.com")) return <YoutubeEmbed src={src} />;
    return <video src={src} poster={poster} controls={true} className="bd-changelog-poster" />;
}

function ChangelogModal({
    modalProps,
    title,
    video,
    poster,
    image,
    description,
    changes
}: {
    modalProps: { onClose(): void; },
    title: string,
    video?: string,
    poster?: string,
    image: string,
    description: string,
    changes: {
        title: string,
        type: "fixed" | "progress" | "added" | "improved",
        items: string[];
    }[];
}) {
    const [discordColorwaysData] = useContextualState("discordColorwaysData");
    const Footer = () => <div style={{ display: "flex", marginRight: "auto" }}>
        <a aria-label="Discord" className="dc-footer-social-link" href="https://discord.gg/67VRpSjzxU" rel="noreferrer noopener" target="_blank">
            <DiscordIcon width={16} height={16} />
        </a>
        <div className="dc-footer-note">Join our Discord Server for more updates!</div>
    </div>;

    return <Modal divider={false} title={<div style={{ display: "flex", flexDirection: "column" }}>{title}<span className="dc-modal-header-subtitle">Version {discordColorwaysData.version}</span></div>} type="normal" modalProps={modalProps} onFinish={({ closeModal }) => closeModal()} footer={<Footer />}>
        {video ? <Video src={video} poster={poster} /> : <img src={image} width={500} className="bd-changelog-poster" />}
        {description.split("\n").map(d => <p className="dc-changelog-desc">{d}</p>)}
        {changes.map(change => <>
            <h2 className={`dc-changelog-title dc-changelog-title-${change.type}`}><span>{change.title} </span></h2>
            <ul className="dc-changes-list">
                {change.items.map(item => <li className="dc-change">{item}</li>)}
            </ul>
        </>)}
    </Modal>;
}

export default () => Modals.openModal(props => <ChangelogModal modalProps={props} title="What's new" image="https://github.com/DaBluLite/DiscordColorways/blob/master/banner.png?raw=true" {...changelog} />);
