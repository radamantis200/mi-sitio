import { useState, useEffect, useRef } from "react";
import { MIN_SWIPE_DISTANCE } from "./config";

export function useSwipeViews(calendarMonths, isLoaded) {
    const [activeView, setActiveView] = useState(0);
    const [containerHeight, setContainerHeight] = useState('auto');

    const containerRef = useRef(null);

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const view1Ref = useRef(null);
    const view2Ref = useRef(null);
    const view3Ref = useRef(null);

    useEffect(() => {
        const updateHeight = () => {
            if (activeView === 0 && view1Ref.current) setContainerHeight(view1Ref.current.offsetHeight);
            else if (activeView === 1 && view2Ref.current) setContainerHeight(view2Ref.current.offsetHeight);
            else if (activeView === 2 && view3Ref.current) setContainerHeight(view3Ref.current.offsetHeight);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        const timeout = setTimeout(updateHeight, 100);
        return () => { window.removeEventListener('resize', updateHeight); clearTimeout(timeout); };
    }, [activeView, calendarMonths, isLoaded]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            touchStartX.current = e.targetTouches[0].clientX;
            touchStartY.current = e.targetTouches[0].clientY;
        };

        const handleTouchMove = (e) => {
            if (touchStartX.current === null || touchStartY.current === null) return;

            const currentX = e.targetTouches[0].clientX;
            const currentY = e.targetTouches[0].clientY;

            const diffX = touchStartX.current - currentX;
            const diffY = touchStartY.current - currentY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = (e) => {
            if (touchStartX.current === null) return;

            const currentX = e.changedTouches[0].clientX;
            const distance = touchStartX.current - currentX;

            if (distance > MIN_SWIPE_DISTANCE && activeView < 2) {
                setActiveView((prev) => prev + 1);
            } else if (distance < -MIN_SWIPE_DISTANCE && activeView > 0) {
                setActiveView((prev) => prev - 1);
            }

            touchStartX.current = null;
            touchStartY.current = null;
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: false });
        container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('touchcancel', handleTouchEnd);
        };

    }, [activeView, isLoaded]);

    return {
        activeView,
        setActiveView,
        containerHeight,
        view1Ref,
        view2Ref,
        view3Ref,
        containerRef
    };
}