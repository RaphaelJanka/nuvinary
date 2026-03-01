declare module 'vanta/dist/vanta.clouds.min.js' {
  export interface VantaConfig {
    el: HTMLElement;
    THREE: unknown; // Wir nutzen unknown statt any
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    speed?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunColor?: number;
    sunGlareColor?: number;
    sunLightColor?: number;
  }

  export interface VantaEffect {
    destroy: () => void;
    resize: () => void;
  }

  const CLOUDS: (config: VantaConfig) => VantaEffect;
  export default CLOUDS;
}
