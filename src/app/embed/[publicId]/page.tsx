import {
  notFound,
} from "next/navigation";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import WidgetChat from "./widget-chat";
import styles from "./widget.module.css";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function EmbedPage({
  params,
}: PageProps) {
  const {
    publicId,
  } = await params;

  if (
    !UUID_PATTERN.test(
      publicId,
    )
  ) {
    notFound();
  }

  const admin =
    createAdminClient();

  const {
    data: assistant,
    error: assistantError,
  } = await admin
    .from("assistants")
    .select(
      "name,welcome_message,status,is_published,owner_id",
    )
    .eq(
      "public_id",
      publicId,
    )
    .maybeSingle();

  if (
    assistantError
    || !assistant
    || !assistant.is_published
    || assistant.status
      !== "ready"
  ) {
    notFound();
  }

  const {
    data: subscription,
    error: subscriptionError,
  } = await admin
    .from("subscriptions")
    .select(
      "plan,status",
    )
    .eq(
      "user_id",
      assistant.owner_id,
    )
    .maybeSingle();

  if (
    subscriptionError
    || subscription?.plan
      !== "pro"
    || subscription.status
      !== "active"
  ) {
    notFound();
  }

  return (
    <main
      className={
        styles.embedShell
      }
    >
      <WidgetChat
        assistantName={
          assistant.name
        }
        publicId={
          publicId
        }
        welcomeMessage={
          assistant.welcome_message
        }
      />
    </main>
  );
}
