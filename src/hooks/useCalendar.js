import { useState, useEffect } from "react";
import { TARGET_DATE, START_DATE, MONTH_NAMES } from "./config";

export function useCalendar(daysLeft, isFinished) {
    const [calendarMonths, setCalendarMonths] = useState([]);

    useEffect(() => {
        const start = new Date(START_DATE);
        const targetDateObj = new Date(TARGET_DATE);
        targetDateObj.setHours(0, 0, 0, 0);

        const realToday = new Date(targetDateObj);
        if (!isFinished) {
            realToday.setDate(targetDateObj.getDate() - daysLeft - 1);
        }
        const realTodayTime = realToday.getTime();
        const end = targetDateObj;

        const monthsMap = {};
        let current = new Date(start);

        while (current <= end) {
            const monthIdx = current.getMonth();
            const year = current.getFullYear();
            const key = `${year}-${monthIdx}`;
            const currentTime = current.getTime();

            const isPast = isFinished ? true : currentTime < realTodayTime;
            const isToday = !isFinished && currentTime === realTodayTime;
            const isTarget = currentTime === end.getTime();

            if (!monthsMap[key]) monthsMap[key] = { monthName: MONTH_NAMES[monthIdx], year: year, days: [] };

            monthsMap[key].days.push({
                date: new Date(current),
                isPast,
                isToday,
                isStart: currentTime === start.getTime(),
                isTarget
            });

            current.setDate(current.getDate() + 1);
        }

        const activeMonths = Object.values(monthsMap).filter(month =>
            isFinished ? month.year === end.getFullYear() && month.monthName === MONTH_NAMES[end.getMonth()] : month.days.some(day => !day.isPast || day.isToday)
        );

        setCalendarMonths(activeMonths);
    }, [daysLeft, isFinished]);

    return { calendarMonths };
}