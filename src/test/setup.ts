import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { server } from "./mocks/server";

// Mirrors the library.add(fas) call in App.tsx, which components rely on to
// resolve icon names (e.g. ["fas", "caret-left"]) to renderable SVGs.
library.add(fas);

// jsdom has no ResizeObserver implementation; echarts (via ReactEChartsWrapper)
// requires one to exist on the container element.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(() => {
  // Mirrors index.html's portal mount point, used by react-tooltip/Portal.
  const portalRoot = document.createElement("div");
  portalRoot.id = "portal-root";
  document.body.appendChild(portalRoot);
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  document.getElementById("portal-root")?.remove();
});

afterAll(() => server.close());
