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
  selector: string;
  straightOnly?: boolean;
  straightOverlapThreshold?: number;
  onNavigate?: (element: HTMLElement, direction: Direction) => void;
  // Called when the remote 'Back' button is pressed. If not provided, defaults to window.history.back().
  onBack?: () => void;
  onSelect?: (element: HTMLElement) => void;
}

// Map keyboard event.key values (including common TV remote key names) to navigation directions
const KEYMAPPING: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  // Some TV remotes (including LG/webOS) emit these values
  Left: "left",
  Right: "right",
  Up: "up",
  Down: "down",
};

export const useSpatialNavigation = (config: NavigationConfig) => {
  const currentFocusedElement = ref<HTMLElement | null>(null);
  const navigableElements = ref<HTMLElement[]>([]);
  const isInitialized = ref(false);

  const getRect = (elem: HTMLElement): ElementRect => {
    const cr = elem.getBoundingClientRect();
    const rect: ElementRect = {
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
    return rect;
  };

  const calculateDistance = (from: ElementRect, to: ElementRect, direction: Direction): number => {
    const threshold = config.straightOverlapThreshold || 0.5;

    // Check if elements are aligned based on direction
    const isAligned = (dir: Direction): boolean => {
      if (dir === "left" || dir === "right") {
        // Check vertical alignment
        return (
          to.top <= from.bottom - from.height * threshold &&
          to.bottom >= from.top + from.height * threshold
        );
      } else {
        // Check horizontal alignment
        return (
          to.left <= from.right - from.width * threshold &&
          to.right >= from.left + from.width * threshold
        );
      }
    };

    // Calculate distances based on direction
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

    // Penalize non-aligned elements in straightOnly mode
    if (config.straightOnly && !isAligned(direction)) {
      return Infinity;
    }

    // Use Euclidean distance with weighted primary direction
    const weightedDistance = Math.sqrt(
      Math.pow(Math.max(0, primaryDistance) * 2, 2) + Math.pow(secondaryDistance, 2),
    );

    return weightedDistance;
  };

  const findNextElement = (direction: Direction): HTMLElement | null => {
    if (!currentFocusedElement.value) return null;

    const currentRect = getRect(currentFocusedElement.value);
    let bestElement: HTMLElement | null = null;
    let bestDistance = Infinity;

    navigableElements.value.forEach((elem) => {
      if (elem === currentFocusedElement.value) return;
      if (!elem.offsetParent) return; // Skip hidden elements

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

    // Remove focus from current element
    if (currentFocusedElement.value) {
      currentFocusedElement.value.classList.remove("spatial-focus");
      currentFocusedElement.value.blur();
    }

    // Set new focus
    currentFocusedElement.value = element;
    element.classList.add("spatial-focus");
    console.log("Focusing element:", element);
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

    console.log("KeyDown:", key);

    // Handle Back key for TV remotes (common values: Back, BrowserBack, MediaBack, Escape)
    if (key === "Back" || key === "BrowserBack" || key === "MediaBack" || key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (config.onBack) {
        config.onBack();
      } else if (window && typeof window.history?.back === "function") {
        window.history.back();
      }
      return;
    }

    const direction = KEYMAPPING[key];

    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      navigate(direction);
      return;
    }

    // Treat OK from remotes as Enter. Many remotes emit "Enter" or "OK".
    if ((key === "Enter" || key === "OK" || key === "Select") && currentFocusedElement.value) {
      event.preventDefault();
      currentFocusedElement.value.classList.add("spatial-active");
      console.log("KeyDown: Activate element");
      // console.log(currentFocusedElement.value);
      // find first href or onclick in the element or its children and trigger it
      let clickableElement: HTMLElement | null = null;

      if (
        currentFocusedElement.value.tagName === "A" ||
        currentFocusedElement.value.tagName === "BUTTON"
      ) {
        clickableElement = currentFocusedElement.value;
      } else {
        clickableElement = currentFocusedElement.value.querySelector("a, button, [onclick]");
      }

      if (clickableElement) {
        clickableElement.click();
      }
      config.onSelect?.(currentFocusedElement.value);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Enter" && currentFocusedElement.value) {
      event.preventDefault();
      event.stopPropagation();
      currentFocusedElement.value.classList.remove("spatial-active");

      // Trigger click
      currentFocusedElement.value.click();
      config.onSelect?.(currentFocusedElement.value);
    }
  };

  const updateNavigableElements = () => {
    const elements = document.querySelectorAll(config.selector);
    navigableElements.value = Array.from(elements) as HTMLElement[];

    // Ensure all elements are focusable
    navigableElements.value.forEach((elem) => {
      if (!elem.hasAttribute("tabindex")) {
        elem.setAttribute("tabindex", "-1");
      }
    });
  };

  const init = () => {
    console.log("Initializing spatial navigation");
    if (isInitialized.value) return;

    updateNavigableElements();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    isInitialized.value = true;

    // Focus first element if none focused
    if (navigableElements.value.length > 0 && !currentFocusedElement.value) {
      console.log("Focusing first navigable element");
      if (navigableElements.value[0]) focusElement(navigableElements.value[0]);
    }
  };

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);

    if (currentFocusedElement.value) {
      currentFocusedElement.value.classList.remove("spatial-focus");
    }

    isInitialized.value = false;
  };

  const focusFirst = () => {
    if (navigableElements.value.length > 0) {
      if (navigableElements.value[0]) focusElement(navigableElements.value[0]);
    }
  };

  const refresh = () => {
    updateNavigableElements();
  };

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
