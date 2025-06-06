import { useRef, useEffect } from 'react'

export interface EventMap {
  [eventKey: symbol]: any
}

/**
 * emit: Emits an event.
 *
 * @template M Event map type for the module
 * @template K Event key type (key of M)
 * @param eventKey Key to identify the event
 * @param payload Data to send with the event
 * @returns void
 */
export function emit<M extends EventMap, K extends keyof M>(eventKey: K, payload: M[K]): void {
  // 브라우저 커스텀 이벤트 리스너 활용하지만, 다른 라이브러리 등으로 새롭게 구현하는 것을 추천천
  const event = new CustomEvent<M[K]>(String(eventKey), {
    detail: payload,
  })

  window.dispatchEvent(event)
  console.log(`Typed event emitted: ${String(eventKey)}`, payload)
}

/**
 * useListener: React hook for event listener.
 *
 * @param eventKey Key to identify the event
 * @param handler Function to handle the event payload
 * @param options Event listener options
 */
export function useEventListener<M extends EventMap, K extends keyof M>(
  eventKey: K,
  handler: (payload: M[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  // 내부 구현은 다른 라이브러리 등으로 새롭게 구현하는 것 추천
  const handlerRef = useRef<(payload: M[K]) => void>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event: Event) => {
      const customEvent = event as CustomEvent<M[K]>
      handlerRef.current(customEvent.detail)
    }

    window.addEventListener(String(eventKey), eventListener, options)

    return () => {
      window.removeEventListener(String(eventKey), eventListener, options)
    }
  }, [eventKey, options])
}

/**
 * createEventModule: Creates an event system for a module.
 *
 * @template M Event map type for the module
 * @returns Object containing emit and useListener functions
 */
export function createEventModule<M extends EventMap>() {
  /**
   * emit: Emits an event.
   *
   * @param eventKey Key to identify the event
   * @param payload Data to send with the event
   */
  const emitEvent = <K extends keyof M>(eventKey: K, payload: M[K]): void => {
    return emit<M, K>(eventKey, payload)
  }

  /**
   * useListener: React hook for event listener.
   *
   * @param eventKey Key to identify the event
   * @param handler Function to handle the event payload
   * @param options Event listener options
   */
  const useListener = <K extends keyof M>(
    eventKey: K,
    handler: (payload: M[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void => {
    return useEventListener<M, K>(eventKey, handler, options)
  }

  return {
    emit: emitEvent,
    useListener,
  }
}

/**
 * createSimpleEventModule: Creates an event module for a single event key.
 *
 * @template P Event payload type
 * @param eventKey Symbol key to identify the event
 * @returns Object containing emit and useListener for the event
 */
function createSimpleEventModule<P>(eventKey: symbol) {
  const { emit, useListener } = createEventModule<{ [K in typeof eventKey]: P }>()
  return {
    emit: (payload: P) => emit(eventKey, payload),
    useListener: (handler: (payload: P) => void) => useListener(eventKey, handler),
  }
}
