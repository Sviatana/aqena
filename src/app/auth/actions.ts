"use server";

import { redirect } from "next/navigation";

import {
  getServerDictionary,
} from "@/i18n/server";
import {
  canonicalSiteUrl,
} from "@/lib/site-url";
import {
  PLATFORM_OWNER_EMAIL,
} from "@/lib/platform-owner";

import { createClient } from "@/lib/supabase/server";

function formText(
  formData: FormData,
  name: string,
) {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function withError(
  path: string,
  message: string,
) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

export async function signUp(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).auth.errors;

  const displayName = formText(
    formData,
    "displayName",
  );

  const email = formText(
    formData,
    "email",
  ).toLowerCase();

  const password = formText(
    formData,
    "password",
  );

  if (!email) {
    redirect(
      withError(
        "/auth/sign-up",
        copy.enterEmail,
      ),
    );
  }

  if (password.length < 8) {
    redirect(
      withError(
        "/auth/sign-up",
        copy.passwordMin8,
      ),
    );
  }

  const supabase = await createClient();
  const siteUrl =
    canonicalSiteUrl();

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name:
          displayName || email.split("@")[0],
      },

      /*
       * The confirmation email uses Supabase ConfirmationURL.
       * After verification, Supabase redirects here so the
       * server can exchange the authorization code for a session.
       */
      emailRedirectTo:
        `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(
      withError(
        "/auth/sign-up",
        copy.signUpFailed,
      ),
    );
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    `/auth/check-email?email=${encodeURIComponent(email)}`,
  );
}

export async function signIn(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).auth.errors;

  const email = formText(
    formData,
    "email",
  ).toLowerCase();

  const password = formText(
    formData,
    "password",
  );

  if (!email || !password) {
    redirect(
      withError(
        "/auth/login",
        copy.enterEmailAndPassword,
      ),
    );
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      withError(
        "/auth/login",
        copy.signInFailed,
      ),
    );
  }

  if (
    data.user?.email
      ?.trim()
      .toLowerCase()
      === PLATFORM_OWNER_EMAIL
  ) {
    redirect("/platform-admin");
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).auth.errors;

  const email = formText(
    formData,
    "email",
  ).toLowerCase();

  if (!email) {
    redirect(
      withError(
        "/auth/forgot-password",
        copy.enterEmail,
      ),
    );
  }

  const supabase = await createClient();
  const siteUrl =
    canonicalSiteUrl();

  const {
    error,
  } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo:
        `${siteUrl}/auth/callback?next=/auth/update-password`,
    },
  );

  if (error) {
    redirect(
      withError(
        "/auth/forgot-password",
        copy.resetEmailFailed,
      ),
    );
  }

  redirect(
    `/auth/reset-sent?email=${encodeURIComponent(email)}`,
  );
}

export async function updatePassword(
  formData: FormData,
) {
  const copy =
    (
      await getServerDictionary()
    ).auth.errors;

  const password = formText(
    formData,
    "password",
  );

  const confirmPassword = formText(
    formData,
    "confirmPassword",
  );

  if (password.length < 8) {
    redirect(
      withError(
        "/auth/update-password",
        copy.newPasswordMin8,
      ),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      withError(
        "/auth/update-password",
        copy.passwordsDoNotMatch,
      ),
    );
  }

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (
    claimsError
    || !claimsData?.claims?.sub
  ) {
    redirect(
      withError(
        "/auth/login",
        copy.resetLinkExpired,
      ),
    );
  }

  const {
    error,
  } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      withError(
        "/auth/update-password",
        copy.updatePasswordFailed,
      ),
    );
  }

  await supabase.auth.signOut();

  redirect(
    "/auth/login?message="
      + encodeURIComponent(
        copy.passwordUpdated,
      ),
  );
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}
