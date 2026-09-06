import {
  expect,
  test,
} from "@playwright/test";


const NORTHSTAR_PUBLIC_ID =
  "8a0f0c12-9b73-4554-94f1-4d83d8d731a4";


test.beforeEach(
  async ({
    context,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error(
        "Playwright baseURL is required for locale setup",
      );
    }

    await context.addCookies([
      {
        name:
          "aqena_locale",

        value:
          "en",

        url:
          baseURL,
      },
    ]);
  },
);


test.describe(
  "AQENA public browser smoke",
  () => {
    test(
      "guest landing routes to sign in and sign up",
      async ({
        page,
      }) => {
        await page.goto(
          "/",
        );

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                "Turn company knowledge into reliable customer answers",
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByRole(
            "link",
            {
              name:
                "Sign in",
              exact:
                true,
            },
          ),
        ).toHaveAttribute(
          "href",
          "/auth/login",
        );

        await page
          .getByRole(
            "link",
            {
              name:
                "Sign in",
              exact:
                true,
            },
          )
          .click();

        await expect(
          page,
        ).toHaveURL(
          /\/auth\/login$/,
        );

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                "Welcome back",
            },
          ),
        ).toBeVisible();

        await page.goto(
          "/",
        );

        const buildLinks =
          page.getByRole(
            "link",
            {
              name:
                "Build your assistant",
              exact:
                true,
            },
          );

        await expect(
          buildLinks.first(),
        ).toHaveAttribute(
          "href",
          "/auth/sign-up",
        );

        await buildLinks
          .first()
          .click();

        await expect(
          page,
        ).toHaveURL(
          /\/auth\/sign-up$/,
        );

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                "Create your account",
            },
          ),
        ).toBeVisible();
      },
    );


    test(
      "auth forms expose the expected user controls without submitting them",
      async ({
        page,
      }) => {
        await page.goto(
          "/auth/login",
        );

        await expect(
          page.getByLabel(
            "Email",
          ),
        ).toBeVisible();

        await expect(
          page.getByLabel(
            "Password",
            {
              exact:
                true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByRole(
            "button",
            {
              name:
                "Sign in",
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByRole(
            "link",
            {
              name:
                "Forgot password?",
            },
          ),
        ).toHaveAttribute(
          "href",
          "/auth/forgot-password",
        );

        await page.goto(
          "/auth/sign-up",
        );

        await expect(
          page.getByLabel(
            "Name",
          ),
        ).toBeVisible();

        await expect(
          page.getByLabel(
            "Email",
          ),
        ).toBeVisible();

        await expect(
          page.getByLabel(
            "Password",
            {
              exact:
                true,
            },
          ),
        ).toBeVisible();

        await expect(
          page.getByRole(
            "button",
            {
              name:
                "Create account",
            },
          ),
        ).toBeVisible();
      },
    );


    test(
      "Northstar demo loads the real widget launcher and opens its iframe",
      async ({
        page,
      }) => {
        /*
         * Production intentionally uses a closed Shadow DOM.
         *
         * Playwright cannot inspect a closed shadow root, so this
         * test changes only the browser test environment to open it.
         * widget.js itself is not modified.
         */
        await page.addInitScript(
          () => {
            const original =
              Element.prototype
                .attachShadow;

            Element.prototype
              .attachShadow =
              function attachShadow(
                init,
              ) {
                return original.call(
                  this,
                  {
                    ...init,
                    mode:
                      "open",
                  },
                );
              };
          },
        );

        /*
         * The real widget loader creates this iframe immediately.
         * Intercept it so the browser never needs Supabase or RAG.
         */
        await page.route(
          "**/embed/**",
          async (
            route,
          ) => {
            await route.fulfill({
              status:
                200,

              contentType:
                "text/html",

              body:
                `<!doctype html>
                <html>
                  <body>
                    <main>
                      Embedded assistant test frame
                    </main>
                  </body>
                </html>`,
            });
          },
        );

        await page.goto(
          "/demo/northstar-coffee",
        );

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                "Good coffee for everyday rituals",
            },
          ),
        ).toBeVisible();

        const widgetHost =
          page.locator(
            `[data-aqena-widget="${NORTHSTAR_PUBLIC_ID}"]`,
          );

        await expect(
          widgetHost,
        ).toHaveCount(
          1,
        );

        const launcher =
          page.getByRole(
            "button",
            {
              name:
                "Open customer support chat",
            },
          );

        await expect(
          launcher,
        ).toBeVisible();

        await expect(
          launcher,
        ).toHaveAttribute(
          "aria-expanded",
          "false",
        );

        await expect(
          launcher,
        ).toContainText(
          "Ask us",
        );

        await launcher.click();

        await expect(
          launcher,
        ).toHaveAttribute(
          "aria-expanded",
          "true",
        );

        await expect(
          launcher,
        ).toContainText(
          "Close",
        );

        const frame =
          page.frameLocator(
            'iframe[title="Customer support chat"]',
          );

        await expect(
          frame.getByText(
            "Embedded assistant test frame",
          ),
        ).toBeVisible();

        await launcher.click();

        await expect(
          launcher,
        ).toHaveAttribute(
          "aria-expanded",
          "false",
        );

        await expect(
          launcher,
        ).toContainText(
          "Ask us",
        );
      },
    );
  },
);
