
import {
    getTelemetryStore,
    createDecisionRenderedEvent,
    createVoiChurnEvent,
    createUserOverrideEvent,
    TelemetryStore
} from '@zeo/telemetry';
import { useCallback, useEffect, useState } from 'react';

export function useTelemetry(sessionId?: string) {
    const [store, setStore] = useState<TelemetryStore | null>(null);

    useEffect(() => {
        // Only initialize on client side
        const s = getTelemetryStore(sessionId);
        setStore(s);
    }, [sessionId]);

    const recordDecisionRendered = useCallback((decisionId: string, topActionId: string, score: number) => {
        if (!store) return;
        store.record(createDecisionRenderedEvent(decisionId, topActionId, score, 0, 0));
    }, [store]);

    const recordVoiChurn = useCallback((prevTop: string, newTop: string, delta: number, decisionId?: string) => {
        if (!store) return;
        store.record(createVoiChurnEvent(prevTop, newTop, delta, decisionId));
    }, [store]);

    const recordOverride = useCallback((original: string, override: string, reason?: string, decisionId?: string) => {
        if (!store) return;
        store.record(createUserOverrideEvent(original, override, decisionId, reason));
    }, [store]);

    return {
        store,
        recordDecisionRendered,
        recordVoiChurn,
        recordOverride
    };
}
