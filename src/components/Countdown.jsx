import { useCountdown } from "@/hooks/useCountdown.jsx";
import TimerView from "@/components/Countdown/TimerView";
import SummaryView from "@/components/Countdown/SummaryView";
import CalendarView from "@/components/Countdown/CalendarView";

export default function Countdown() {
    const {
        isLoaded, isWakeLockActive, activeView, timeLeft, percentage, calendarMonths, stats, containerHeight, theme,
        view1Ref, view2Ref, view3Ref,
        setActiveView, triggerHaptic, toggleWakeLock, enableAppBadge, format, summaryData,
        swipeHandlers
    } = useCountdown();

    if (!isLoaded) return <div className="min-h-screen w-full flex items-center justify-center text-white">Cargando...</div>;

    const { days, hours, minutes, seconds, isFinished } = timeLeft;

    return (
        <div
            className="w-full max-w-5xl overflow-hidden relative touch-pan-y transition-[height] duration-500 ease-in-out"
            style={{ height: containerHeight !== 'auto' ? `${containerHeight}px` : 'auto' }}
            {...swipeHandlers}
        >
            <div
                className="w-full flex flex-nowrap transition-transform duration-500 ease-in-out items-start"
                style={{ transform: `translateX(-${activeView * 100}%)` }}
            >

                <div className="w-full shrink-0">
                    <TimerView
                        viewRef={view1Ref} theme={theme} format={format}
                        days={days} hours={hours} minutes={minutes} seconds={seconds}
                        triggerHaptic={triggerHaptic} activeView={activeView} setActiveView={setActiveView}
                        summaryData={summaryData}
                    />
                </div>

                <div className="w-full shrink-0">
                    <SummaryView
                        viewRef={view2Ref} theme={theme} percentage={percentage}
                        isFinished={isFinished} days={days} stats={stats}
                        isWakeLockActive={isWakeLockActive} toggleWakeLock={toggleWakeLock}
                        enableAppBadge={enableAppBadge} activeView={activeView}
                        setActiveView={setActiveView} triggerHaptic={triggerHaptic}
                        summaryData={summaryData}
                    />
                </div>

                <div className="w-full shrink-0">
                    <CalendarView
                        viewRef={view3Ref} calendarMonths={calendarMonths}
                        activeView={activeView} setActiveView={setActiveView}
                        triggerHaptic={triggerHaptic} isFinished={isFinished} summaryData={summaryData}
                    />
                </div>

            </div>
        </div>
    );
}