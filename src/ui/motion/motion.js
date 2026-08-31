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
    return animate(element, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.fast }).finished;
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
  return animation.finished;
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
    return animate(dialogElement, { opacity: [1, 0] }, { duration: MOTION_TIMINGS.fast }).finished;
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
  return animation.finished;
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
 * Smooth transition for a active selection indicator (e.g. active tab line).
 */
export function animateSelectionIndicator(indicator, targetBounds, containerBounds) {
  if (!indicator || !targetBounds || !containerBounds) return null;

  const left = targetBounds.left - containerBounds.left;
  const width = targetBounds.width;

  if (isReducedMotion()) {
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
    return null;
  }

  return animate(
    indicator,
    {
      left: [`${indicator.offsetLeft}px`, `${left}px`],
      width: [`${indicator.offsetWidth}px`, `${width}px`],
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
 * Smooth spotlight / tutorial focus rectangle interpolation.
 */
export function animateFocusSpotlight(spotlightElement, targetRect) {
  if (!spotlightElement || !targetRect) return null;

  if (isReducedMotion()) {
    spotlightElement.style.left = `${targetRect.left}px`;
    spotlightElement.style.top = `${targetRect.top}px`;
    spotlightElement.style.width = `${targetRect.width}px`;
    spotlightElement.style.height = `${targetRect.height}px`;
    return null;
  }

  return animate(
    spotlightElement,
    {
      left: [`${spotlightElement.offsetLeft}px`, `${targetRect.left}px`],
      top: [`${spotlightElement.offsetTop}px`, `${targetRect.top}px`],
      width: [`${spotlightElement.offsetWidth}px`, `${targetRect.width}px`],
      height: [`${spotlightElement.offsetHeight}px`, `${targetRect.height}px`],
    },
    {
      duration: MOTION_TIMINGS.normal,
      ease: MOTION_EASINGS.ui,
    }
  );
}

export { animate, stagger };
