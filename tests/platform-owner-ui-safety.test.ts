import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const buttonSource =
  readFileSync(
    "src/app/platform-admin/owner-action-button.tsx",
    "utf8",
  );

const pageSource =
  readFileSync(
    "src/app/platform-admin/page.tsx",
    "utf8",
  );

const actionsSource =
  readFileSync(
    "src/app/platform-admin/actions.ts",
    "utf8",
  );

describe(
  "platform owner billing UI safety",
  () => {
    it(
      "requires confirmation before dangerous submit actions",
      () => {
        expect(
          buttonSource,
        ).toContain(
          '"use client"',
        );

        expect(
          buttonSource,
        ).toContain(
          "window.confirm",
        );

        expect(
          buttonSource,
        ).toContain(
          "event.preventDefault()",
        );

        expect(
          buttonSource,
        ).toContain(
          "useFormStatus",
        );

        expect(
          buttonSource,
        ).toContain(
          "disabled={",
        );
      },
    );

    it(
      "uses separate activation and cancellation warnings",
      () => {
        expect(
          pageSource,
        ).toContain(
          "Оплата действительно получена?",
        );

        expect(
          pageSource,
        ).toContain(
          "пользователю будет активирован тариф Pro",
        );

        expect(
          pageSource,
        ).toContain(
          "Отменить эту заявку?",
        );

        expect(
          pageSource,
        ).toContain(
          "Тариф пользователя изменён не будет.",
        );
      },
    );

    it(
      "renders technical owner values in Russian",
      () => {
        expect(
          pageSource,
        ).toContain(
          '"Ожидает оплаты"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Активен"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Ручная оплата"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Тестовый / старый режим"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Беларусь"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Россия"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Другая страна"',
        );

        expect(
          pageSource,
        ).toContain(
          '"Телефон"',
        );

        expect(
          pageSource,
        ).toContain(
          "billingRequestStatusLabel(",
        );

        expect(
          pageSource,
        ).toContain(
          "billingModeLabel(",
        );
      },
    );

    it(
      "keeps actual writes behind existing owner-only server actions",
      () => {
        expect(
          actionsSource,
        ).toContain(
          "requirePlatformOwner",
        );

        expect(
          actionsSource,
        ).toContain(
          "activate_manual_pro_request",
        );

        expect(
          actionsSource,
        ).toContain(
          "cancel_manual_pro_request",
        );
      },
    );
  },
);
