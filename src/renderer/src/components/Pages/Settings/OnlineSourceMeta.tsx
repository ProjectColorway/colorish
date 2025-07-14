import { useState, useEffect } from "react";

export default function OnlineSourceMeta({ source, onComplete, fallback = "loading" }: {
    source: string, onComplete(props: {
        colorways?: Colorway[],
        presets?: Preset[];
    }): string, fallback?: string;
}): React.ReactNode {
    const [data, setData] = useState<{
        colorways?: Colorway[],
        presets?: Preset[];
    }>({ colorways: [], presets: [] });
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        (async () => {
            const res: Response = await fetch(source);
            try {
                setData(await res.json());
                setLoaded(true);
            } catch (e) {
                setData({ colorways: [], presets: [] });
                setLoaded(true);
            }
        })();
    }, []);

    return <>{loaded ? onComplete(data) : fallback}</>;
}
