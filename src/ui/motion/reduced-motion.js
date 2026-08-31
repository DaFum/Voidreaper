/**
 * Helper to determine if reduced motion is preferred either by system setting
 * or application dataset setting.
 *
 * @returns {boolean}
 */
export function isReducedMotion() {
  if (typeof document !== "undefined" && document.documentElement) {
    if (document.documentElement.dataset.reducedMotion === "true") {
      return true;
    }
    if (document.documentElement.dataset.reducedMotion === "false") {
      return false;
    }
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return false;
}

/**
 * Creates a function resolver for reduced motion.
 *
 * @returns {() => boolean}
 */
export function getReducedMotionResolver() {
  return isReducedMotion;
}
