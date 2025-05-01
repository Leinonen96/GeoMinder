export function makeIdentifier(eventId, index) {
    return `${eventId}-${index}`
  }
  
  export function parseIdentifier(identifier) {
    const [eventId, idx] = identifier.split('-')
    return { eventId, triggerIndex: Number(idx) }
  }
  