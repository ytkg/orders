import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const ALLOWED_CONSOLE_PATTERNS: RegExp[] = [];

function formatConsoleArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

function isAllowedConsoleMessage(message: string) {
  return ALLOWED_CONSOLE_PATTERNS.some((pattern) => pattern.test(message));
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const message = formatConsoleArgs(args);
    if (isAllowedConsoleMessage(message)) {
      return;
    }
    throw new Error(`Unexpected console.error: ${message}`);
  });

  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    const message = formatConsoleArgs(args);
    if (isAllowedConsoleMessage(message)) {
      return;
    }
    throw new Error(`Unexpected console.warn: ${message}`);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
