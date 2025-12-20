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

const lgRemoteCodes = {
  "37": "left",
  "38": "up",
  "39": "right",
  "40": "down",
  "13": "enter",
  "461": "back",

  // colored buttons
  "403": "red",
  "404": "green",
  "405": "yellow",
  "406": "blue",

  // media buttons
  "415": "play",
  "19": "pause",
  "413": "stop",
  "417": "fast-forward",
  "412": "rewind",
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

    const whoIsIt = currentFocusedElement.value ? whoAmI(currentFocusedElement.value) : null;
    const restrictToMainContent = whoIsIt === "nav-drawer" && direction === "right";
    const currentRect = getRect(currentFocusedElement.value);
    let bestElement: HTMLElement | null = null;
    let bestDistance = Infinity;

    navigableElements.value.forEach((elem) => {
      if (elem === currentFocusedElement.value) return;
      if (!elem.offsetParent) return;
      // console.log(`Evaluating element:`, elem);
      const elemWhoIsIt = whoAmI(elem);
      // console.log(`Comparing to element whoAmI: ${elemWhoIsIt} source: ${whoIsIt}`);
      if (restrictToMainContent && elemWhoIsIt !== "main-content") return;
      //if (restrictToMainContent && whoAmI(elem) !== "main-content") return;
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

  // figure out who the element is (nav drawer vs main content)
  const whoAmI = (elem: HTMLElement): string | null => {
    if (elem.closest(".v-navigation-drawer__content")) return "nav-drawer";
    if (elem.closest(".v-container")) return "main-content";
    return null;
  };

  const handleBackAction = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (config.onBack) config.onBack();
    else window.history?.back?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key;
    let code = event.code;
    if (key === "Unidentified" && (!event.code || event.code === "")) {
      // LG webos doesn't supply code or key, but supplies which and keyCode
      if (event.which) {
        code = event.which.toString();
      }
    }
    const isLgKey = code in lgRemoteCodes;
    console.log("EVENT: ", event);
    console.log("KEYCODE: ", code);
    console.log(`isLgKey: ${isLgKey}`);
    if (isLgKey) {
      console.log(`LG Remote Key Detected: ${lgRemoteCodes[code as keyof typeof lgRemoteCodes]}`);
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (
      ["Back", "BrowserBack", "MediaBack", "Escape"].includes(key) ||
      (isLgKey && lgRemoteCodes[code as keyof typeof lgRemoteCodes] === "back")
    ) {
      handleBackAction(event);
      return;
    }

    const direction = isLgKey
      ? KEYMAPPING[lgRemoteCodes[code as keyof typeof lgRemoteCodes]]
      : KEYMAPPING[key];
    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      navigate(direction);
      return;
    }

    if (
      ((key === "Enter" || key === "OK" || key === "Select") && currentFocusedElement.value) ||
      (isLgKey &&
        lgRemoteCodes[code as keyof typeof lgRemoteCodes] === "enter" &&
        currentFocusedElement.value)
    ) {
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
    isInitialized.value = true;

    if (navigableElements.value.length > 0 && !currentFocusedElement.value) {
      focusElement(navigableElements.value[0]!);
    }
    console.log("spatial navigation loaded");
    window.addEventListener("popstate", function () {
      // received back, check inEvent.state if you want the data from the history push
      handleBackAction(new KeyboardEvent("keydown", { key: "Back" }));
    });
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
    whoAmI,
    focusElement,
  };
};
