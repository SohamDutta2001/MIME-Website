// A horizontal photo strip that glides on its own — a slow, seamless marquee
// built on the same embla-carousel-auto-scroll engine as EventsCarousel. It
// pauses when hovered, focused, or touched, and resumes shortly after. Manual
// drag/swipe still works (dragFree). Honors prefers-reduced-motion by staying
// still. Slides are passed as children; `trackClassName` styles the flex track
// (gaps etc.), matching whatever the host strip used before.

import { useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

// How long to wait after the pointer/focus leaves before gliding resumes.
const RESUME_DELAY_MS = 1000;

// embla-carousel-auto-scroll's loop math throws when the slides don't fill more
// than one viewport width. Below this count we skip the plugin and fall back to
// a plain, manually-scrollable strip — a still gallery reads fine with a couple
// of photos anyway.
const MIN_SLIDES_FOR_AUTOSCROLL = 4;

export default function AutoScrollStrip({
  children,
  slideCount,
  trackClassName = 'flex',
  speed = 0.9,
  className = '',
  ...rest
}) {
  const canAutoScroll = slideCount >= MIN_SLIDES_FOR_AUTOSCROLL;

  const autoScroll = useRef(
    AutoScroll({
      playOnInit: false,
      speed,
      startDelay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canAutoScroll, align: 'start', dragFree: true },
    canAutoScroll ? [autoScroll.current] : [],
  );

  const getAutoScroll = useCallback(() => emblaApi?.plugins()?.autoScroll, [emblaApi]);
  const resumeTimerRef = useRef(null);
  const hoveringRef = useRef(false);

  const pause = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    getAutoScroll()?.stop();
  }, [getAutoScroll]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      if (!hoveringRef.current) getAutoScroll()?.play();
    }, RESUME_DELAY_MS);
  }, [getAutoScroll]);

  // Start the glide once mounted — unless the visitor prefers reduced motion.
  useEffect(() => {
    if (!emblaApi) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) getAutoScroll()?.play();
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [emblaApi, getAutoScroll]);

  const onMouseEnter = useCallback(() => {
    hoveringRef.current = true;
    pause();
  }, [pause]);
  const onMouseLeave = useCallback(() => {
    hoveringRef.current = false;
    scheduleResume();
  }, [scheduleResume]);
  const onBlurCapture = useCallback(
    (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) scheduleResume();
    },
    [scheduleResume],
  );

  return (
    <div
      ref={emblaRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={pause}
      onBlurCapture={onBlurCapture}
      {...rest}
    >
      <div className={trackClassName}>{children}</div>
    </div>
  );
}
