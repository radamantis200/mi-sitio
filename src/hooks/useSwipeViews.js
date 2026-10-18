import { useState, useEffect, useRef } from "react";
import { MIN_SWIPE_DISTANCE } from "./config";

export function useSwipeViews(calendarMonths, isLoaded) {
    const [activeView, setActiveView] = useState(0);
    const [containerHeight, setContainerHeight] = useState('auto');
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

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

    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > MIN_SWIPE_DISTANCE && activeView < 2) setActiveView((prev) => prev + 1);
        if (distance < -MIN_SWIPE_DISTANCE && activeView > 0) setActiveView((prev) => prev - 1);
    };

    return { activeView, setActiveView, containerHeight, view1Ref, view2Ref, view3Ref, onTouchStart, onTouchMove, onTouchEnd };
}