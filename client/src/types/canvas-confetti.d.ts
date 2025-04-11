declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  type ConfettiFunction = (options?: ConfettiOptions) => Promise<null>;
  
  interface ConfettiCannon {
    reset: () => void;
    fire: () => void;
  }
  
  interface ConfettiInstance {
    (options?: ConfettiOptions): Promise<null>;
    reset: () => void;
    create: (
      canvas: HTMLCanvasElement,
      options?: { resize?: boolean; useWorker?: boolean }
    ) => ConfettiFunction & { reset: () => void };
    createCanvas: (
      options?: { disableForReducedMotion?: boolean }
    ) => HTMLCanvasElement;
    getCanvas: (
      options?: { disableForReducedMotion?: boolean }
    ) => HTMLCanvasElement | null;
  }

  const confetti: ConfettiFunction & ConfettiInstance;
  export default confetti;
}