import React from 'react';
import NavIndicators from './NavIndicators';

const MONTH_THEMES = {
    "Septiembre": "text-amber-400 border-amber-500/30 bg-amber-500/10",
    "Octubre": "text-orange-400 border-orange-500/30 bg-orange-500/10",
    "Noviembre": "text-rose-400 border-rose-500/30 bg-rose-500/10",
    "Diciembre": "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
};

export default function CalendarView({ viewRef, calendarMonths, activeView, setActiveView, triggerHaptic }) {
    return (
        <div ref={viewRef} className="w-full min-w-full flex-shrink-0 flex flex-col items-center animate-fade-in px-4 pt-6 pb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 text-center drop-shadow-sm leading-tight">
                Lo que Queda por Delante
            </h2>

            <p className="text-slate-400 text-sm md:text-base text-center leading-relaxed mb-8">
                <span className="text-red-400 font-medium">Rojo</span> son días pasados. <span className="text-emerald-400 font-medium">Verde</span> los que faltan. <br className="hidden sm:block" /> El 4 de Septiembre 🚩 marca el inicio.
            </p>

            <div className="w-full max-w-3xl">
                {calendarMonths.map((monthData, mIndex) => {
                    const monthTheme = MONTH_THEMES[monthData.monthName] || "text-slate-400 border-slate-500/30 bg-slate-800/50";
                    const isLastMonth = mIndex === calendarMonths.length - 1;

                    return (
                        <div key={mIndex} className={`${isLastMonth ? 'mb-2' : 'mb-8'} bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-700/50 shadow-xl`}>
                            <div className={`px-4 py-2 rounded-xl mb-4 border text-center font-bold tracking-wider uppercase text-sm sm:text-base ${monthTheme}`}>
                                {monthData.monthName} {monthData.year}
                            </div>

                            <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                    <div key={`head-${i}`} className="text-xs text-slate-500 font-semibold mb-2">{d}</div>
                                ))}

                                {monthData.days.map((dayObj, index) => {
                                    const isFirstDay = index === 0;
                                    const startDayOfWeek = dayObj.date.getDay();
                                    const emptySpacesCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                                    const emptySpaces = isFirstDay ? Array.from({ length: emptySpacesCount }).map((_, i) => <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>) : null;

                                    return (
                                        <React.Fragment key={index}>
                                            {emptySpaces}
                                            <div
                                                onClick={triggerHaptic}
                                                className={`relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer select-none
                                                    ${dayObj.isStart ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10' : ''}
                                                    ${dayObj.isTarget ? 'ring-2 ring-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)] z-10' : ''}
                                                    ${dayObj.isToday && !dayObj.isPast ? 'bg-indigo-500/30 text-indigo-200 border-2 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse' : ''}
                                                    ${dayObj.isPast && !dayObj.isToday ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' : ''}
                                                    ${!dayObj.isPast && !dayObj.isToday ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : ''}
                                                `}
                                            >
                                                {dayObj.date.getDate()}
                                                {dayObj.isStart && <span className="absolute -top-2 -right-2 text-[10px]">🚩</span>}
                                                {dayObj.isTarget && <span className="absolute -top-2 -right-2 text-[10px]">🏁</span>}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <NavIndicators activeView={activeView} setActiveView={setActiveView} triggerHaptic={triggerHaptic} className="mt-2 mb-1" />
        </div>
    );
}