"use client";

import { useEffect, useState } from "react";

export function useScrollPosition() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const update = () => setPosition(window.scrollY);

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  return position;
}
