"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

async function requestOrigin() {
  const requestHeaders = await headers();

  const origin =
    requestHeaders.get("origin")
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? "http://localhost:3000";

  return origin.replace(/\/$/, "");
}

export async function signUp(
  formData: FormData,
) {
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
        "Enter your email address.",
      ),
    );
  }

  if (password.length < 8) {
    redirect(
      withError(
        "/auth/sign-up",
        "Use at least 8 characters for your password.",
      ),
    );
  }

  const supabase = await createClient();
  const origin = await requestOrigin();

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
        `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(
      withError(
        "/auth/sign-up",
        error.message,
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
        "Enter your email and password.",
      ),
    );
  }

  const supabase = await createClient();

  const {
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      withError(
        "/auth/login",
        "We could not sign you in. Check your email and password.",
      ),
    );
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  formData: FormData,
) {
  const email = formText(
    formData,
    "email",
  ).toLowerCase();

  if (!email) {
    redirect(
      withError(
        "/auth/forgot-password",
        "Enter your email address.",
      ),
    );
  }

  const supabase = await createClient();
  const origin = await requestOrigin();

  const {
    error,
  } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: origin,
    },
  );

  if (error) {
    redirect(
      withError(
        "/auth/forgot-password",
        "We could not send the reset email. Please try again.",
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
        "Use at least 8 characters for your new password.",
      ),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      withError(
        "/auth/update-password",
        "The passwords do not match.",
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
        "Your password reset link has expired. Request a new one.",
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
        "We could not update your password. Please try again.",
      ),
    );
  }

  await supabase.auth.signOut();

  redirect(
    "/auth/login?message="
      + encodeURIComponent(
        "Password updated. Sign in with your new password.",
      ),
  );
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}
