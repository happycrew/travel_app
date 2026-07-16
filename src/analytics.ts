type AnalyticsValue = string | number | boolean | undefined;
type AnalyticsPayload = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, payload?: AnalyticsPayload) => void;
    ym?: (counterId: number, method: "reachGoal", eventName: string, payload?: AnalyticsPayload) => void;
    __AIFORY_YM_ID__?: number;
  }
}

export function track(eventName: string, payload: AnalyticsPayload = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...payload });
  window.gtag?.("event", eventName, payload);

  if (window.__AIFORY_YM_ID__) {
    window.ym?.(window.__AIFORY_YM_ID__, "reachGoal", eventName, payload);
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${eventName}`, payload);
  }
}
