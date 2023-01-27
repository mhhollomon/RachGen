

export interface MidiConfig {
  includeScale: boolean;
  separateBass: boolean;
  includeMarkers: boolean;
  fileName: string;
}

export function defaultMidiConfig(): MidiConfig {
  return {
    separateBass: false,
    includeScale: true,
    includeMarkers: false,
    fileName: "RachGen_${scale}_${date}_${time}",
  };
}
