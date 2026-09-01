import { animate, stagger } from "motion";
import { isReducedMotion } from "./reduced-motion.js";

/**
 * Standard motion transition definitions aligned with CSS design tokens.
 */
export const MOTION_TIMINGS = {
  instant: 0,
  feedback: 0.12,
  fast: 0.18,
  ui: 0.22,
  normal: 0.28,
  emphasis: 0.35,
  enter: 0.25,
  exit: 0.15,
};

export const MOTION_EASINGS = {
  standard: [0.2, 0, 0, 1],
  ui: [0.16, 1, 0.3, 1],
  enter: [0.0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
  impact: [0.175, 0.885, 0.32, 1.275],
};

/**
 * Animates a DOM element entering as a panel or container.
 */
export function animatePanelEnter(element, options = {}) {
  if (!element || typeof element.animate !== "function") return null;
  if (isReducedMotion()) {
    return animate(element, { opacity: [0, 1] }, { duration: MOTION_TIMINGS.fast });
  }

  const { delay = 0, yOffset = 8 } = options;
  return animate(
    element,
    {
      opacity: [0, 1],
      transform: [`translateY(${yOffset}px)`, "translateY(0px)"],
    },
    {
      duration: MOTION_TIMINGS.enter,
      ease: MOTION_EASINGS.ui,
      delay,
    }
  );
}

/**
 * Animates a DOM element exiting.
 */
export function animatePanelExit(element, options = {}) {
  if (!element || typeof element.animate !== "function") return Promise.resolve();
  if (isReducedMotion()) {
    return animate(element, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.fast }).finished.catch(() => {});
  }

  const { yOffset = -6 } = options;
  const animation = animate(
    element,
    {
      opacity: [1, 0],
      transform: ["translateY(0px)", `translateY(${yOffset}px)`],
    },
    {
      duration: MOTION_TIMINGS.exit,
      ease: MOTION_EASINGS.exit,
    }
  );
  return animation.finished.catch(() => {});
}

/**
 * Animates a dialog / modal window opening.
 */
export function animateDialogEnter(dialogElement, backdropElement = null) {
  if (!dialogElement) return null;
  if (isReducedMotion()) {
    if (backdropElement) animate(backdropElement, { opacity: [0, 1] }, { duration: MOTION_TIMINGS.fast });
    return animate(dialogElement, { opacity: [0, 1] }, { duration: MOTION_TIMINGS.fast });
  }

  if (backdropElement) {
    animate(backdropElement, { opacity: [0, 1] }, { duration: MOTION_TIMINGS.ui, ease: "easeOut" });
  }

  return animate(
    dialogElement,
    {
      opacity: [0, 1],
      transform: ["scale(0.95) translateY(8px)", "scale(1) translateY(0px)"],
    },
    {
      duration: MOTION_TIMINGS.ui,
      ease: MOTION_EASINGS.ui,
    }
  );
}

/**
 * Animates a dialog / modal window closing before DOM removal / close.
 */
export function animateDialogExit(dialogElement, backdropElement = null) {
  if (!dialogElement) return Promise.resolve();
  if (isReducedMotion()) {
    if (backdropElement) animate(backdropElement, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.fast });
    return animate(dialogElement, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.fast }).finished.catch(() => {});
  }

  if (backdropElement) {
    animate(backdropElement, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.exit, ease: "easeIn" });
  }

  const animation = animate(
    dialogElement,
    {
      opacity: [1, 0],
      transform: ["scale(1) translateY(0px)", "scale(0.96) translateY(6px)"],
    },
    {
      duration: MOTION_TIMINGS.exit,
      ease: MOTION_EASINGS.exit,
    }
  );
  return animation.finished.catch(() => {});
}

/**
 * Staggers entrance for a collection of elements (e.g. catalog cards, stat deltas).
 */
export function animateListStagger(elements, options = {}) {
  if (!elements || elements.length === 0) return null;
  const validElements = Array.from(elements).filter((el) => el && typeof el.animate === "function");
  if (validElements.length === 0) return null;

  if (isReducedMotion()) {
    return animate(validElements, { opacity: [0, 1] }, { duration: MOTION_TIMINGS.fast });
  }

  const { staggerDelay = 0.03, yOffset = 10, maxItems = 12 } = options;
  const targetElements = validElements.slice(0, maxItems);

  return animate(
    targetElements,
    {
      opacity: [0, 1],
      transform: [`translateY(${yOffset}px)`, "translateY(0px)"],
    },
    {
      duration: MOTION_TIMINGS.enter,
      delay: stagger(staggerDelay),
      ease: MOTION_EASINGS.ui,
    }
  );
}

/**
 * Smooth transition for an active selection indicator using CSS transform (translateX, scaleX).
 * Eliminates layout and repaint passes each frame caused by left/width animations.
 */
export function animateSelectionIndicator(indicator, targetBounds, containerBounds, scrollLeft = 0) {
  if (!indicator || !targetBounds || !containerBounds) return null;

  const targetLeft = targetBounds.left - containerBounds.left + scrollLeft;
  const targetWidth = targetBounds.width;

  const isInitial = indicator._indicatorLeft === undefined;
  const prevLeft = isInitial ? targetLeft : indicator._indicatorLeft;
  const prevWidth = isInitial ? targetWidth : (indicator._indicatorWidth ?? targetWidth);

  indicator.style.left = "0px";
  indicator.style.width = "1px";
  indicator.style.transformOrigin = "top left";

  indicator._indicatorLeft = targetLeft;
  indicator._indicatorWidth = targetWidth;

  const toTransform = `translateX(${targetLeft}px) scaleX(${targetWidth})`;

  if (isReducedMotion() || isInitial) {
    indicator.style.transform = toTransform;
    return null;
  }

  const fromTransform = `translateX(${prevLeft}px) scaleX(${prevWidth})`;

  return animate(
    indicator,
    {
      transform: [fromTransform, toTransform],
    },
    {
      duration: MOTION_TIMINGS.normal,
      ease: MOTION_EASINGS.ui,
    }
  );
}

/**
 * Reusable press/click feedback impulse for action controls.
 */
export function animatePressFeedback(element) {
  if (!element || typeof element.animate !== "function" || isReducedMotion()) return null;

  return animate(
    element,
    {
      transform: ["scale(1)", "scale(0.95)", "scale(1)"],
    },
    {
      duration: MOTION_TIMINGS.feedback,
      ease: MOTION_EASINGS.impact,
    }
  );
}

/**
 * Smooth spotlight / tutorial focus rectangle interpolation using CSS transforms (translate, scale).
 * Eliminates layout and repaint passes each frame caused by top/left/width/height animations.
 */
export function animateFocusSpotlight(spotlightElement, targetRect) {
  if (!spotlightElement || !targetRect) return null;

  const isInitial = spotlightElement._spotlightLeft === undefined;
  const prevLeft = isInitial ? targetRect.left : spotlightElement._spotlightLeft;
  const prevTop = isInitial ? targetRect.top : spotlightElement._spotlightTop;
  const prevWidth = isInitial ? targetRect.width : (spotlightElement._spotlightWidth ?? targetRect.width);
  const prevHeight = isInitial ? targetRect.height : (spotlightElement._spotlightHeight ?? targetRect.height);

  spotlightElement.style.left = "0px";
  spotlightElement.style.top = "0px";
  spotlightElement.style.width = "1px";
  spotlightElement.style.height = "1px";
  spotlightElement.style.transformOrigin = "top left";

  spotlightElement._spotlightLeft = targetRect.left;
  spotlightElement._spotlightTop = targetRect.top;
  spotlightElement._spotlightWidth = targetRect.width;
  spotlightElement._spotlightHeight = targetRect.height;

  const toTransform = `translate(${targetRect.left}px, ${targetRect.top}px) scale(${targetRect.width}, ${targetRect.height})`;

  if (isReducedMotion() || isInitial) {
    spotlightElement.style.transform = toTransform;
    return null;
  }

  const fromTransform = `translate(${prevLeft}px, ${prevTop}px) scale(${prevWidth}, ${prevHeight})`;

  return animate(
    spotlightElement,
    {
      transform: [fromTransform, toTransform],
    },
    {
      duration: MOTION_TIMINGS.normal,
      ease: MOTION_EASINGS.ui,
    }
  );
}

export { animate, stagger };
