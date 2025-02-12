import type React from "react";

// Define valid types for child elements
type Child = React.ReactNode | HTMLElement;
type Children = Child | Children[];

// Define valid types for element props
type ElementProps<T extends keyof HTMLElementTagNameMap> = React.DOMAttributes<
  HTMLElementTagNameMap[T]
> & {
  className?: string;
  style?: React.CSSProperties | string;
} & Record<string, any>;

/**
 * createElement is a lightweight utility similar to React.createElement but using vanilla JS.
 *
 * @param tagName - The HTML tag name (e.g., "div", "span").
 * @param props - Attributes and event listeners for the element.
 * @param children - Child elements (strings, numbers, nodes, or nested arrays of these).
 * @returns The constructed HTML element.
 */
export function createElement<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  props?: ElementProps<T>,
  ...children: Children[]
): HTMLElementTagNameMap[T] {
  // Create the element
  const element = document.createElement(tagName);

  // Process props if any
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null) continue; // Ignore null/undefined values

      if (key === "className") {
        element.className = String(value);
      } else if (key === "style") {
        if (typeof value === "string") {
          element.style.cssText = value;
        } else if (typeof value === "object") {
          Object.assign(element.style, value);
        }
      } else if (key.startsWith("on") && typeof value === "function") {
        // Convert "onClick" -> "click"
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
      } else if (key === "htmlFor") {
        element.setAttribute("for", value as string);
      } else {
        try {
          if (key in element) {
            (element as any)[key] = value;
          } else {
            element.setAttribute(key, String(value));
          }
        } catch {
          element.setAttribute(key, String(value));
        }
      }
    }
  }

  // Append children (handle arrays recursively)
  const appendChild = (child: Children): void => {
    if (child == null || typeof child === "boolean") return;

    if (Array.isArray(child)) {
      child.forEach(appendChild);
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else {
      element.appendChild(document.createTextNode(String(child)));
    }
  };

  children.forEach(appendChild);

  return element;
}

// Testing the function
const button = createElement(
  "a",
  {
    className: "btn-primary",
    style: { backgroundColor: "blue", color: "white", padding: "10px" },
    onClick: () => alert("Button Clicked!"),
    onMouseEnter: () => console.log("Mouse Entered!"),
  },
  "Click Me!",
  createElement("div", {}, createElement("span", {}, "name"))
);

document.body.appendChild(button);
