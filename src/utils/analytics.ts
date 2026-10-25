// Checklist #15: Pluggable client-side analytics event bus
type EventType = 'page_view' | 'try_on_launched' | 'add_to_cart' | 'order_completed';

export function trackEvent(eventType: EventType, details?: Record<string, any>) {
  try {
    // 1. Log to console for audit & monitoring
    console.info(`[Analytics] Event: ${eventType}`, details || {});

    // 2. Transmit to backend event tracker
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType, details })
    }).catch(() => {
      // Graceful silence on offline
    });
  } catch (e) {
    console.warn("Analytics tracking bypassed:", e);
  }
}
