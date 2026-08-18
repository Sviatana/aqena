"use client";

import { useEffect } from "react";

export function SectionReveal() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section, main > footer"),
    );

    if (!sections.length) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      sections.forEach((section) => {
        section.classList.add("scroll-reveal", "is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      section.classList.add("scroll-reveal");

      if (rect.top < window.innerHeight * 0.92) {
        section.classList.add("is-visible");
      } else {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
