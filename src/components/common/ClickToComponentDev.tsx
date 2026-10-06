"use client";

import { useEffect } from "react";
import { SourceMapConsumer } from "source-map-js";

type DebugFiber = {
  _debugOwner?: DebugFiber | null;
  _debugStack?: Error | null;
};

type StackFrame = {
  file: string;
  methodName: string;
  line1: number;
  column1: number;
  arguments: [];
};

type OriginalStackFrameResponse = Array<{
  status: "fulfilled" | "rejected";
  value?: {
    originalStackFrame?: StackFrame;
  };
}>;

function getFiber(element: HTMLElement) {
  const fiberKey = Object.getOwnPropertyNames(element).find((key) =>
    key.startsWith("__reactFiber"),
  );

  return fiberKey
    ? (element as unknown as Record<string, DebugFiber>)[fiberKey]
    : undefined;
}

function parseStack(stack: string): StackFrame[] {
  return stack
    .split("\n")
    .map((line) => {
      const namedFrame = line.match(/^\s*at (.*?) \((.+):(\d+):(\d+)\)$/);
      const anonymousFrame = line.match(/^\s*at (.+):(\d+):(\d+)$/);
      const match = namedFrame ?? anonymousFrame;

      if (!match) return null;

      const hasMethodName = match.length === 5;

      return {
        methodName: hasMethodName ? match[1] : "<anonymous>",
        file: hasMethodName ? match[2] : match[1],
        line1: Number(hasMethodName ? match[3] : match[2]),
        column1: Number(hasMethodName ? match[4] : match[3]),
        arguments: [],
      } satisfies StackFrame;
    })
    .filter((frame): frame is StackFrame => frame !== null);
}

function findSourceFrame(element: HTMLElement) {
  let fiber = getFiber(element);
  const frames: StackFrame[] = [];

  while (fiber) {
    if (fiber._debugStack?.stack) {
      frames.push(...parseStack(fiber._debugStack.stack));
    }
    fiber = fiber._debugOwner ?? undefined;
  }

  return (
    frames.find(
      ({ file }) =>
        file.includes("/_next/static/chunks/src_") &&
        !file.includes("node_modules"),
    ) ?? frames.find(({ file }) => file.startsWith("about://React/Server/"))
  );
}

async function resolveClientFrame(frame: StackFrame): Promise<StackFrame> {
  const generatedUrl = new URL(frame.file);
  const sourceMapResponse = await fetch(`${generatedUrl.pathname}.map`);

  if (!sourceMapResponse.ok) return frame;

  const sourceMap = await sourceMapResponse.json();
  const consumer = new SourceMapConsumer(sourceMap);
  const original = consumer.originalPositionFor({
    line: frame.line1,
    column: Math.max(0, frame.column1 - 1),
  });

  if (!original.source || !original.line) return frame;

  return {
    ...frame,
    file: original.source,
    line1: original.line,
    column1: (original.column ?? 0) + 1,
  };
}

async function resolveServerFrame(frame: StackFrame): Promise<StackFrame> {
  const response = await fetch("/__nextjs_original-stack-frames", {
    method: "POST",
    body: JSON.stringify({
      frames: [frame],
      isServer: true,
      isEdgeServer: false,
      isAppDirectory: true,
    }),
  });

  if (!response.ok) return frame;

  const [result] = (await response.json()) as OriginalStackFrameResponse;
  return result?.value?.originalStackFrame ?? frame;
}

async function openFrameInEditor(frame: StackFrame) {
  const originalFrame = frame.file.startsWith("about://React/Server/")
    ? await resolveServerFrame(frame)
    : await resolveClientFrame(frame);
  const editorPath = originalFrame.file.startsWith("file:")
    ? decodeURIComponent(new URL(originalFrame.file).pathname)
        .replace(/^\/([A-Za-z]:\/)/, "$1")
        .replaceAll("\\", "/")
    : decodeURIComponent(originalFrame.file)
        .replace(/^\/([A-Za-z]:\/)/, "$1")
        .replaceAll("\\", "/");
  const sourceLocation = `${editorPath}:${originalFrame.line1}:${originalFrame.column1}`;
  const response = await fetch("/api/dev/open-in-editor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      file: editorPath,
      line: originalFrame.line1,
      column: originalFrame.column1,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `편집기를 열지 못했습니다: ${sourceLocation}`);
  }
}

export function ClickToComponentDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const indicator = document.createElement("div");
    Object.assign(indicator.style, {
      position: "fixed",
      zIndex: "2147483647",
      display: "none",
      border: "2px solid #00d4ff",
      background: "rgb(0 212 255 / 10%)",
      pointerEvents: "none",
    });
    document.body.append(indicator);

    const hideIndicator = () => {
      indicator.style.display = "none";
    };

    const showIndicator = (event: MouseEvent) => {
      if (!event.altKey || !(event.target instanceof HTMLElement)) {
        hideIndicator();
        return;
      }

      const bounds = event.target.getBoundingClientRect();
      Object.assign(indicator.style, {
        display: "block",
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
      });
    };

    const handleClick = async (event: MouseEvent) => {
      if (!event.altKey || !(event.target instanceof HTMLElement)) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const frame = findSourceFrame(event.target);

      if (!frame) {
        console.warn("이 요소의 React 소스 위치를 찾지 못했습니다.");
        return;
      }

      try {
        await openFrameInEditor(frame);
      } catch (error) {
        console.error(error);
      }
    };

    window.addEventListener("mousemove", showIndicator, { capture: true });
    window.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("keyup", hideIndicator);
    window.addEventListener("blur", hideIndicator);

    return () => {
      window.removeEventListener("mousemove", showIndicator, { capture: true });
      window.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("keyup", hideIndicator);
      window.removeEventListener("blur", hideIndicator);
      indicator.remove();
    };
  }, []);

  return null;
}
