(() => {
  "use strict";

  const script =
    document.currentScript;

  if (!script) {
    return;
  }

  const assistantId =
    (
      script.dataset
        .assistantId
      || ""
    ).trim();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !uuidPattern.test(
      assistantId,
    )
  ) {
    console.error(
      "Anvera widget: invalid data-assistant-id",
    );

    return;
  }

  const scriptUrl =
    new URL(
      script.src,
      window.location.href,
    );

  const anveraOrigin =
    scriptUrl.origin;

  const existing =
    document.querySelector(
      `[data-anvera-widget="${assistantId}"]`,
    );

  if (existing) {
    return;
  }

  const host =
    document.createElement(
      "div",
    );

  host.setAttribute(
    "data-anvera-widget",
    assistantId,
  );

  document.body.appendChild(
    host,
  );

  const shadow =
    host.attachShadow({
      mode:
        "closed",
    });

  const style =
    document.createElement(
      "style",
    );

  style.textContent = `
    :host {
      all: initial;
    }

    .anvera-root {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483000;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    .anvera-launcher {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 52px;
      padding: 0 17px;
      border: 0;
      border-radius: 999px;
      background: #1d1e1a;
      color: #ffffff;
      font: inherit;
      font-size: 13px;
      font-weight: 650;
      line-height: 1;
      box-shadow:
        0 12px 32px
        rgba(28, 29, 25, 0.18);
      cursor: pointer;
    }

    .anvera-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #b9cbb3;
    }

    .anvera-panel {
      position: absolute;
      right: 0;
      bottom: 64px;
      width: 380px;
      height: min(620px, calc(100vh - 110px));
      min-height: 440px;
      overflow: hidden;
      border: 1px solid
        rgba(32, 33, 29, 0.12);
      border-radius: 18px;
      background: #fbfaf7;
      box-shadow:
        0 22px 60px
        rgba(28, 29, 25, 0.18);
      opacity: 0;
      visibility: hidden;
      transform:
        translateY(10px)
        scale(0.985);
      transform-origin:
        right bottom;
      transition:
        opacity 160ms ease,
        transform 160ms ease,
        visibility 160ms ease;
    }

    .anvera-panel[data-open="true"] {
      opacity: 1;
      visibility: visible;
      transform:
        translateY(0)
        scale(1);
    }

    .anvera-frame {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: #fbfaf7;
    }

    @media (max-width: 520px) {
      .anvera-root {
        right: 14px;
        bottom: 14px;
        left: 14px;
      }

      .anvera-launcher {
        margin-left: auto;
      }

      .anvera-panel {
        position: fixed;
        inset: 10px;
        width: auto;
        height: auto;
        min-height: 0;
        border-radius: 16px;
      }
    }
  `;

  const root =
    document.createElement(
      "div",
    );

  root.className =
    "anvera-root";

  const panel =
    document.createElement(
      "div",
    );

  panel.className =
    "anvera-panel";

  panel.dataset.open =
    "false";

  const frame =
    document.createElement(
      "iframe",
    );

  frame.className =
    "anvera-frame";

  frame.src =
    `${anveraOrigin}/embed/${encodeURIComponent(
      assistantId,
    )}`;

  frame.title =
    "Customer support chat";

  frame.loading =
    "lazy";

  frame.setAttribute(
    "allow",
    "clipboard-write",
  );

  const launcher =
    document.createElement(
      "button",
    );

  launcher.className =
    "anvera-launcher";

  launcher.type =
    "button";

  launcher.setAttribute(
    "aria-expanded",
    "false",
  );

  launcher.setAttribute(
    "aria-label",
    "Open customer support chat",
  );

  const dot =
    document.createElement(
      "span",
    );

  dot.className =
    "anvera-dot";

  dot.setAttribute(
    "aria-hidden",
    "true",
  );

  const label =
    document.createElement(
      "span",
    );

  label.textContent =
    "Ask us";

  launcher.append(
    dot,
    label,
  );

  panel.appendChild(
    frame,
  );

  root.append(
    panel,
    launcher,
  );

  shadow.append(
    style,
    root,
  );

  let isOpen =
    false;

  function setOpen(
    nextOpen,
  ) {
    isOpen =
      nextOpen;

    panel.dataset.open =
      String(
        isOpen,
      );

    launcher.setAttribute(
      "aria-expanded",
      String(
        isOpen,
      ),
    );

    label.textContent =
      isOpen
        ? "Close"
        : "Ask us";
  }

  launcher.addEventListener(
    "click",
    () => {
      setOpen(
        !isOpen,
      );
    },
  );

  window.addEventListener(
    "message",
    (event) => {
      if (
        event.origin
        !== anveraOrigin
        || event.source
          !== frame.contentWindow
      ) {
        return;
      }

      if (
        event.data
        ?.type
        === "anvera:close"
      ) {
        setOpen(
          false,
        );
      }
    },
  );
})();
