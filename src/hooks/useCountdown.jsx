import { useState, useEffect, useRef } from "react";

const TARGET_DATE = "2026-12-04T00:00:00";
const START_DATE = "2026-09-04T00:00:00";
const TEST_DATE = null;
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MIN_SWIPE_DISTANCE = 50;

export function useCountdown() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const wakeLockRef = useRef(null);

    const [activeView, setActiveView] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: false });
    const [percentage, setPercentage] = useState(0);
    const [calendarMonths, setCalendarMonths] = useState([]);
    const [stats, setStats] = useState({ weekendsLeft: 0, mondaysLeft: 0, daysElapsed: 0 });

    const view1Ref = useRef(null);
    const view2Ref = useRef(null);
    const view3Ref = useRef(null);
    const [containerHeight, setContainerHeight] = useState('auto');

    // 1. Manejo de altura dinámica
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

    // 2. Generación de datos del calendario
    useEffect(() => {
        const start = new Date(START_DATE);
        const end = new Date(TARGET_DATE);
        const today = TEST_DATE ? new Date(TEST_DATE) : new Date();
        today.setHours(0, 0, 0, 0);

        const monthsMap = {};
        let current = new Date(start);
        let weekends = 0;
        let mondays = 0;
        let elapsedCount = 0;

        while (current <= end) {
            const monthIdx = current.getMonth();
            const year = current.getFullYear();
            const key = `${year}-${monthIdx}`;
            const isPast = current < today;
            const isFuture = current >= today;

            if (!monthsMap[key]) monthsMap[key] = { monthName: MONTH_NAMES[monthIdx], year: year, days: [] };

            monthsMap[key].days.push({
                date: new Date(current), isPast, isToday: current.getTime() === today.getTime(),
                isStart: current.getTime() === start.getTime(), isTarget: current.getTime() === end.getTime()
            });

            if (isPast) elapsedCount++;
            if (isFuture) {
                if (current.getDay() === 6) weekends++;
                if (current.getDay() === 1) mondays++;
            }
            current.setDate(current.getDate() + 1);
        }

        setCalendarMonths(Object.values(monthsMap));
        setStats({ weekendsLeft: weekends, mondaysLeft: mondays, daysElapsed: elapsedCount });
    }, []);

    // 3. Cálculo de tiempo en tiempo real
    useEffect(() => {
        const target = new Date(TARGET_DATE).getTime();
        const start = new Date(START_DATE).getTime();
        const timeOffset = TEST_DATE ? new Date(TEST_DATE).getTime() - new Date().getTime() : 0;

        const calculateTime = () => {
            const now = new Date().getTime() + timeOffset;
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isFinished: true });
                setPercentage(100);
                setIsLoaded(true);
                if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) navigator.clearAppBadge().catch(console.error);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            const totalHours = Math.floor(difference / (1000 * 60 * 60));

            const totalDuration = target - start;
            const elapsed = now - start;
            let currentPercentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

            if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                navigator.setAppBadge(days).catch(console.error);
            }

            setTimeLeft({ days, hours, minutes, seconds, totalHours, isFinished: false });
            setPercentage(currentPercentage);
            setIsLoaded(true);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // 4. Limpieza de WakeLock
    useEffect(() => {
        return () => { if (wakeLockRef.current) wakeLockRef.current.release().catch(console.error); };
    }, []);

    // 5. Handlers de Gestos (Swipe)
    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > MIN_SWIPE_DISTANCE && activeView < 2) setActiveView((prev) => prev + 1);
        if (distance < -MIN_SWIPE_DISTANCE && activeView > 0) setActiveView((prev) => prev - 1);
    };

    // 6. Utilidades
    const triggerHaptic = () => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([50]); };
    const format = (num) => num.toString().padStart(2, "0");

    const toggleWakeLock = async () => {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
            try {
                if (isWakeLockActive && wakeLockRef.current) {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                    setIsWakeLockActive(false);
                } else {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    setIsWakeLockActive(true);
                }
            } catch (err) { console.error("Error con Wake Lock:", err); }
        }
    };

    const enableAppBadge = async () => {
        if (typeof window !== 'undefined' && !('Notification' in window)) return alert("Navegador no soportado.");
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
            navigator.setAppBadge(timeLeft.days).catch(console.error);
            alert("¡Listo! Ve a la pantalla de inicio y mira el ícono de la app.");
        }
    };

    // 7. Generación de Tema Dinámico
    const getTheme = () => {
        const { days, isFinished } = timeLeft;
        let theme = {
            titleText: (<>Faltan 3 meses para<br className="block lg:hidden" /> el 4 de Diciembre</>),
            titleClasses: "from-indigo-400 to-cyan-400",
            barClasses: "from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
            secondsBox: "bg-indigo-900/20 border-indigo-500/30 shadow-indigo-500/10",
            secondsNum: "text-indigo-300",
            secondsLabel: "text-indigo-400",
            progressText: "text-slate-400",
        };

        if (isFinished) {
            theme.titleText = (<>¡El gran día ha llegado! <br className="block lg:hidden" /> Ya puedes manejar.</>);
        } else if (days <= 7) {
            theme = { ...theme, titleText: (<>¡Falta menos de <br className="block lg:hidden" /> una semana!</>), titleClasses: "from-red-500 to-rose-400 animate-pulse", barClasses: "from-red-600 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]", secondsBox: "bg-red-900/30 border-red-500/60 shadow-red-500/30 animate-pulse", secondsNum: "text-red-300", secondsLabel: "text-red-400", progressText: "text-red-400" };
        } else if (days <= 31) {
            theme = { ...theme, titleText: (<>Falta 1 mes para <br className="block lg:hidden" /> el 4 de Diciembre</>), titleClasses: "from-orange-400 to-amber-300", barClasses: "from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]", secondsBox: "bg-orange-900/20 border-orange-500/40 shadow-orange-500/20", secondsNum: "text-orange-300", secondsLabel: "text-orange-400", progressText: "text-orange-400" };
        } else if (days <= 61) {
            theme = { ...theme, titleText: (<>Faltan 2 meses para <br className="block md:hidden" /> el 4 de Diciembre</>), titleClasses: "from-purple-400 to-pink-400", barClasses: "from-purple-500 to-pink-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]", secondsBox: "bg-purple-900/20 border-purple-500/40 shadow-purple-500/20", secondsNum: "text-purple-300", secondsLabel: "text-purple-400", progressText: "text-purple-400" };
        }
        return theme;
    };

    return {
        // Estado
        isLoaded, isWakeLockActive, activeView, timeLeft, percentage, calendarMonths, stats, containerHeight,
        // Refs
        view1Ref, view2Ref, view3Ref,
        // Acciones
        setActiveView, onTouchStart, onTouchMove, onTouchEnd, triggerHaptic, toggleWakeLock, enableAppBadge, format,
        // Derivados
        theme: getTheme()
    };
}