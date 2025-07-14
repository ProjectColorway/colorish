import { saveFile } from "@renderer/api/Fs";
import { useContextualState } from "@renderer/api/Hooks";
import { DownloadIcon } from "@renderer/components/Icons";

export default function History() {
    const [colorwayUsageMetrics] = useContextualState("colorwayUsageMetrics");
    return <>
        <div className="flex items-center gap-1">
            <button
                className="dc-button dc-button-primary"
                style={{ flexShrink: "0", width: "fit-content" }}
                onClick={async () => {
                    saveFile(new File([JSON.stringify(colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
                }}
            >
                <DownloadIcon width={14} height={14} />
                Download Usage History
            </button>
        </div>
        <div className="dc-selector use-scrollbar" style={{ flexGrow: "1" }}>
            {colorwayUsageMetrics.map((color, i: number) => <div key={i} className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl">
                <div className="dc-label-wrapper">
                    <span className="dc-label">{color.id}</span>
                    <span className="dc-label dc-subnote dc-note">in {color.source} • {color.uses} uses</span>
                </div>
            </div>)}
        </div>
    </>;
}
