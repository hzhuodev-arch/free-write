import "@testing-library/jest-dom/vitest";

// CodeMirror uses ResizeObserver internally; jsdom doesn't provide it
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;
