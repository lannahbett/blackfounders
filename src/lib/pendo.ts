declare global {
  interface Window {
    pendo?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function pendoTrack(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.pendo) {
    window.pendo.track(eventName, properties);
  }
}
