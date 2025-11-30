import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WritingPreset = 'academic' | 'creative' | 'business' | 'journalism' | 'technical' | 'casual' | 'custom';

export interface ModelInfo {
  name: string;
  size: number; // in bytes
  parameterSize: string; // e.g., "7B", "13B"
  quantization: string; // e.g., "Q4_0", "Q8_0", "F16"
  contextLength: number;
  family: string;
}

export interface WritingPresetConfig {
  name: string;
  description: string;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
}

export const WRITING_PRESETS: Record<WritingPreset, WritingPresetConfig> = {
  academic: {
    name: 'Academic',
    description: 'Formal, precise writing for research and scholarly work',
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
  },
  creative: {
    name: 'Creative',
    description: 'Expressive, varied writing for fiction and poetry',
    temperature: 0.85,
    topP: 0.95,
    topK: 80,
    repeatPenalty: 1.05,
  },
  business: {
    name: 'Business',
    description: 'Professional, clear writing for reports and proposals',
    temperature: 0.4,
    topP: 0.9,
    topK: 50,
    repeatPenalty: 1.1,
  },
  journalism: {
    name: 'Journalism',
    description: 'Factual, engaging writing for articles and news',
    temperature: 0.5,
    topP: 0.9,
    topK: 60,
    repeatPenalty: 1.1,
  },
  technical: {
    name: 'Technical',
    description: 'Precise, structured writing for documentation',
    temperature: 0.2,
    topP: 0.85,
    topK: 30,
    repeatPenalty: 1.15,
  },
  casual: {
    name: 'Casual',
    description: 'Conversational writing for blogs and personal content',
    temperature: 0.7,
    topP: 0.95,
    topK: 70,
    repeatPenalty: 1.0,
  },
  custom: {
    name: 'Custom',
    description: 'Your own settings',
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
  },
};

interface HardwareInfo {
  vram: number | null; // in MB, null if unknown
  vramTier: 'low' | 'medium' | 'high' | 'unknown';
  renderer: string;
  vendor: string;
}

interface SettingsState {
  // Writing settings
  writingPreset: WritingPreset;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  contextLength: number;
  maxContextLength: number;
  
  // Model info
  currentModelInfo: ModelInfo | null;
  
  // Hardware info
  hardwareInfo: HardwareInfo;
  
  // Context tracking
  contextUsed: number; // tokens used
  
  // Settings modal
  showSettings: boolean;
  
  // Actions
  setWritingPreset: (preset: WritingPreset) => void;
  setTemperature: (temp: number) => void;
  setTopP: (topP: number) => void;
  setTopK: (topK: number) => void;
  setRepeatPenalty: (penalty: number) => void;
  setContextLength: (length: number) => void;
  setMaxContextLength: (length: number) => void;
  setCurrentModelInfo: (info: ModelInfo | null) => void;
  setHardwareInfo: (info: HardwareInfo) => void;
  setContextUsed: (used: number) => void;
  toggleSettings: () => void;
  setShowSettings: (show: boolean) => void;
  
  // Auto-configuration
  autoConfigureForModel: (modelInfo: ModelInfo) => void;
  autoConfigureForHardware: (hardwareInfo: HardwareInfo) => void;
}

function getVRAMTier(vramMB: number | null): 'low' | 'medium' | 'high' | 'unknown' {
  if (vramMB === null) return 'unknown';
  if (vramMB < 4000) return 'low';     // < 4GB
  if (vramMB < 12000) return 'medium'; // 4-12GB
  return 'high';                        // 12GB+
}

function suggestContextLength(vramMB: number | null, modelSize: number, maxContext: number): number {
  if (vramMB === null) return Math.min(4096, maxContext);
  
  // Rough estimation: larger context needs more VRAM
  // Model memory + context memory should fit in VRAM
  const modelMemoryMB = modelSize / (1024 * 1024);
  const availableForContext = vramMB - modelMemoryMB - 500; // 500MB buffer
  
  if (availableForContext < 500) {
    return Math.min(2048, maxContext);
  } else if (availableForContext < 2000) {
    return Math.min(4096, maxContext);
  } else if (availableForContext < 4000) {
    return Math.min(8192, maxContext);
  } else {
    return Math.min(16384, maxContext);
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      writingPreset: 'casual',
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      repeatPenalty: 1.1,
      contextLength: 4096,
      maxContextLength: 128000,
      
      currentModelInfo: null,
      
      hardwareInfo: {
        vram: null,
        vramTier: 'unknown',
        renderer: '',
        vendor: '',
      },
      
      contextUsed: 0,
      showSettings: false,
      
      // Actions
      setWritingPreset: (preset) => {
        const config = WRITING_PRESETS[preset];
        set({
          writingPreset: preset,
          temperature: config.temperature,
          topP: config.topP,
          topK: config.topK,
          repeatPenalty: config.repeatPenalty,
        });
      },
      
      setTemperature: (temperature) => set({ temperature, writingPreset: 'custom' }),
      setTopP: (topP) => set({ topP, writingPreset: 'custom' }),
      setTopK: (topK) => set({ topK, writingPreset: 'custom' }),
      setRepeatPenalty: (repeatPenalty) => set({ repeatPenalty, writingPreset: 'custom' }),
      setContextLength: (contextLength) => set({ contextLength }),
      setMaxContextLength: (maxContextLength) => set({ maxContextLength }),
      setCurrentModelInfo: (currentModelInfo) => set({ currentModelInfo }),
      setHardwareInfo: (hardwareInfo) => set({ hardwareInfo }),
      setContextUsed: (contextUsed) => set({ contextUsed }),
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      setShowSettings: (showSettings) => set({ showSettings }),
      
      autoConfigureForModel: (modelInfo) => {
        const { hardwareInfo } = get();
        const suggestedContext = suggestContextLength(
          hardwareInfo.vram,
          modelInfo.size,
          modelInfo.contextLength
        );
        
        set({
          currentModelInfo: modelInfo,
          maxContextLength: modelInfo.contextLength,
          contextLength: suggestedContext,
        });
      },
      
      autoConfigureForHardware: (hardwareInfo) => {
        const vramTier = getVRAMTier(hardwareInfo.vram);
        set({
          hardwareInfo: { ...hardwareInfo, vramTier },
        });
        
        // Adjust context based on VRAM tier if we have model info
        const { currentModelInfo } = get();
        if (currentModelInfo) {
          const suggestedContext = suggestContextLength(
            hardwareInfo.vram,
            currentModelInfo.size,
            currentModelInfo.contextLength
          );
          set({ contextLength: suggestedContext });
        }
      },
    }),
    {
      name: 'sanctum-writer-settings',
      partialize: (state) => ({
        writingPreset: state.writingPreset,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        repeatPenalty: state.repeatPenalty,
        contextLength: state.contextLength,
      }),
    }
  )
);

