// composables/useSpatialNavigation.ts
import { ref, type Ref } from "vue";

interface Position {
  x: number;
  y: number;
}

interface ElementRect {
  element: HTMLElement;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  center: Position;
}

type Direction = "left" | "right" | "up" | "down";

interface NavigationConfig {
  selectors: string[];

  straightOnly?: boolean;
  straightOverlapThreshold?: number;
  onNavigate?: (element: HTMLElement, direction: Direction) => void;
  onBack?: () => void;
  onSelect?: (element: HTMLElement) => void;
}

const KEYMAPPING: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  Left: "left",
  Right: "right",
  Up: "up",
  Down: "down",
};

export const useSpatialNavigation = (config: NavigationConfig) => {
  const currentFocusedElement = ref<HTMLElement | null>(null);
  const navigableElements = ref<HTMLElement[]>([]);
  const isInitialized = ref(false);

  /** Get combined selector string (default + user-defined) */
  const getSelectorString = (): string => {
    const selectors = config.selectors || [];
    return selectors.join(", ");
  };

  const getRect = (elem: HTMLElement): ElementRect => {
    const cr = elem.getBoundingClientRect();
    return {
      element: elem,
      left: cr.left,
      top: cr.top,
      right: cr.right,
      bottom: cr.bottom,
      width: cr.width,
      height: cr.height,
      center: {
        x: cr.left + Math.floor(cr.width / 2),
        y: cr.top + Math.floor(cr.height / 2),
      },
    };
  };

  const calculateDistance = (from: ElementRect, to: ElementRect, direction: Direction): number => {
    const threshold = config.straightOverlapThreshold || 0.5;

    const isAligned = (dir: Direction): boolean => {
      if (dir === "left" || dir === "right") {
        return (
          to.top <= from.bottom - from.height * threshold &&
          to.bottom >= from.top + from.height * threshold
        );
      } else {
        return (
          to.left <= from.right - from.width * threshold &&
          to.right >= from.left + from.width * threshold
        );
      }
    };

    let primaryDistance: number;
    let secondaryDistance: number;

    switch (direction) {
      case "left":
        if (to.center.x >= from.center.x) return Infinity;
        primaryDistance = from.left - to.right;
        secondaryDistance = Math.abs(to.center.y - from.center.y);
        break;
      case "right":
        if (to.center.x <= from.center.x) return Infinity;
        primaryDistance = to.left - from.right;
        secondaryDistance = Math.abs(to.center.y - from.center.y);
        break;
      case "up":
        if (to.center.y >= from.center.y) return Infinity;
        primaryDistance = from.top - to.bottom;
        secondaryDistance = Math.abs(to.center.x - from.center.x);
        break;
      case "down":
        if (to.center.y <= from.center.y) return Infinity;
        primaryDistance = to.top - from.bottom;
        secondaryDistance = Math.abs(to.center.x - from.center.x);
        break;
      default:
        return Infinity;
    }

    if (config.straightOnly && !isAligned(direction)) {
      return Infinity;
    }

    return Math.sqrt(
      Math.pow(Math.max(0, primaryDistance) * 2, 2) + Math.pow(secondaryDistance, 2),
    );
  };

  const findNextElement = (direction: Direction): HTMLElement | null => {
    if (!currentFocusedElement.value) return null;

    const currentRect = getRect(currentFocusedElement.value);
    let bestElement: HTMLElement | null = null;
    let bestDistance = Infinity;

    navigableElements.value.forEach((elem) => {
      if (elem === currentFocusedElement.value) return;
      if (!elem.offsetParent) return;

      const targetRect = getRect(elem);
      const distance = calculateDistance(currentRect, targetRect, direction);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestElement = elem;
      }
    });

    return bestElement;
  };

  const focusElement = (element: HTMLElement | null) => {
    if (!element) return;

    if (currentFocusedElement.value) {
      currentFocusedElement.value.classList.remove("spatial-focus");
      currentFocusedElement.value.blur();
    }

    currentFocusedElement.value = element;
    element.classList.add("spatial-focus");
    element.focus();
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const navigate = (direction: Direction) => {
    const nextElement = findNextElement(direction);
    if (nextElement) {
      focusElement(nextElement);
      config.onNavigate?.(nextElement, direction);
      return true;
    }
    return false;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key;
    console.log(`KEY: ${key} is pressed`);

    if (["Back", "BrowserBack", "MediaBack", "Escape"].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      if (config.onBack) config.onBack();
      else window.history?.back?.();
      return;
    }

    const direction = KEYMAPPING[key];
    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      navigate(direction);
      return;
    }

    if ((key === "Enter" || key === "OK" || key === "Select") && currentFocusedElement.value) {
      event.preventDefault();
      currentFocusedElement.value.classList.add("spatial-active");

      // Dispatch a proper mouse event that Vue will recognize
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      currentFocusedElement.value.dispatchEvent(clickEvent);

      config.onSelect?.(currentFocusedElement.value);
      refresh();
    }
  };

  // const handleKeyUp = (event: KeyboardEvent) => {
  //   if (event.key === "Enter" && currentFocusedElement.value) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     currentFocusedElement.value.classList.remove("spatial-active");
  //     currentFocusedElement.value.click();
  //     config.onSelect?.(currentFocusedElement.value);
  //   }
  // };

  const updateNavigableElements = () => {
    const selectorString = getSelectorString();
    const elements = document.querySelectorAll(selectorString);
    navigableElements.value = Array.from(elements).filter(
      (el) => el instanceof HTMLElement && !el.hasAttribute("disabled"),
    ) as HTMLElement[];

    navigableElements.value.forEach((elem) => {
      if (!elem.hasAttribute("tabindex")) elem.setAttribute("tabindex", "-1");
    });
  };

  const init = () => {
    if (isInitialized.value) return;

    updateNavigableElements();
    window.addEventListener("keydown", handleKeyDown);
    // window.addEventListener("keyup", handleKeyUp);

    isInitialized.value = true;

    if (navigableElements.value.length > 0 && !currentFocusedElement.value) {
      focusElement(navigableElements.value[0]!);
    }
    console.log("spatial navigation loaded");
  };

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    // window.removeEventListener("keyup", handleKeyUp);
    currentFocusedElement.value?.classList.remove("spatial-focus");
    isInitialized.value = false;
  };

  const focusFirst = () => {
    if (navigableElements.value.length > 0) focusElement(navigableElements.value[0]!);
  };

  const refresh = () => updateNavigableElements();

  return {
    init,
    cleanup,
    navigate,
    focusFirst,
    refresh,
    currentFocusedElement: currentFocusedElement as Ref<HTMLElement | null>,
    navigableElements: navigableElements as Ref<HTMLElement[]>,
  };
};
