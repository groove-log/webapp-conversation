/**
 * Zendesk State Manager
 * Emits events to open/close the sandboxed Zendesk iframe modal.
 */

const ZENDESK_KEYS = {
  contact: 'bb83ebd5-2184-449e-9cf5-7970cca8b163', // 상담문의 하기
  chat: '65194955-c882-48c4-9ddf-4ee46c95a55a',    // 1:1 문의 연결
} as const

export type ZendeskType = keyof typeof ZENDESK_KEYS

type Listener = (type: ZendeskType | null, key: string | null) => void
const listeners = new Set<Listener>()

export function subscribeZendesk(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function openZendeskWidget(type: ZendeskType) {
  const key = ZENDESK_KEYS[type]
  listeners.forEach(l => l(type, key))
}

export function closeZendeskWidget() {
  listeners.forEach(l => l(null, null))
}
