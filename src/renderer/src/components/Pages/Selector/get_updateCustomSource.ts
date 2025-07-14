import { SourceActions } from "@renderer/types";

export default function get_updateCustomSource(customColorwayData: {
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[], setCustomColorwayData: (list: {
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[]) => void) {
    return function updateCustomSource(props: { source: string; } & ({ type: SourceActions.AddColorway | SourceActions.RemoveColorway, colorway: Colorway; } | { type: SourceActions.AddPreset | SourceActions.RemovePreset, preset: Preset; })) {
        if (props.type === SourceActions.AddColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: [...(s.colorways || []), props.colorway], presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemoveColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: (s.colorways || []).filter(c => c.name !== props.colorway.name), presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.AddPreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: [...(s.presets || []), props.preset] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemovePreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: (s.presets || []).filter(p => p.name !== props.preset.name) };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
    };
}
