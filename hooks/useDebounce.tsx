import { useEffect, useRef, useState } from "react";

export function useDebounce<T>(value: T, callback: (value: T) => void, delay?: number): T {
    const firstRenderRef = useRef(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (firstRenderRef.current) {
                callback(value);
            }
        }, delay || 500);
        firstRenderRef.current = false;

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return value;
}
