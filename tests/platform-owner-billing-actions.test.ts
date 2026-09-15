import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const actionsSource =
  readFileSync(
    "src/app/platform-admin/actions.ts",
    "utf8",
  );

const pageSource =
  readFileSync(
    "src/app/platform-admin/page.tsx",
    "utf8",
  );

const migrationSource =
  readFileSync(
    "supabase/migrations/20260915000000_platform_owner_manual_pro_actions.sql",
    "utf8",
  );

describe(
  "platform owner manual Pro actions",
  () => {
    it(
      "keeps subscription writes behind the platform-owner server gate",
      () => {
        expect(
          actionsSource,
        ).toContain(
          '"use server"',
        );

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

        expect(
          actionsSource,
        ).not.toContain(
          "NEXT_PUBLIC_SUPABASE_URL",
        );

        expect(
          actionsSource,
        ).not.toContain(
          "SUPABASE_SECRET_KEY",
        );
      },
    );

    it(
      "activates Pro and closes the request atomically in PostgreSQL",
      () => {
        expect(
          migrationSource,
        ).toContain(
          "security definer",
        );

        expect(
          migrationSource,
        ).toContain(
          "for update",
        );

        expect(
          migrationSource,
        ).toContain(
          "update public.subscriptions",
        );

        expect(
          migrationSource,
        ).toContain(
          "plan = 'pro'",
        );

        expect(
          migrationSource,
        ).toContain(
          "status = 'active'",
        );

        expect(
          migrationSource,
        ).toContain(
          "billing_mode = 'manual'",
        );

        expect(
          migrationSource,
        ).toContain(
          "status = 'activated'",
        );

        expect(
          migrationSource,
        ).toContain(
          "to service_role",
        );
      },
    );

    it(
      "cancels a request without changing the subscription",
      () => {
        const cancelSection =
          migrationSource.split(
            "create or replace function public.cancel_manual_pro_request",
          )[1];

        expect(
          cancelSection,
        ).toBeTruthy();

        expect(
          cancelSection,
        ).toContain(
          "status = 'cancelled'",
        );

        expect(
          cancelSection,
        ).not.toContain(
          "update public.subscriptions",
        );
      },
    );

    it(
      "shows explicit owner controls only for open requests",
      () => {
        expect(
          pageSource,
        ).toContain(
          "Оплата получена — активировать Pro",
        );

        expect(
          pageSource,
        ).toContain(
          "Отменить заявку",
        );

        expect(
          pageSource,
        ).toContain(
          "activateManualProRequest.bind",
        );

        expect(
          pageSource,
        ).toContain(
          "cancelManualProRequest.bind",
        );

        expect(
          pageSource,
        ).toContain(
          '"pending"',
        );

        expect(
          pageSource,
        ).toContain(
          '"activated"',
        );
      },
    );
  },
);
