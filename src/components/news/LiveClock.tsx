import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  const isMobile = useIsMobile();

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const getIndianTimeString = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex items-center justify-center text-sm font-medium tracking-wide text-white opacity-90 select-none">
      <span>{getIndianTimeString(time)}{!isMobile && ' (IST)'}</span>
    </div>
  );
}; 