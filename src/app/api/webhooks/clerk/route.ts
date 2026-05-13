import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { syncDbUserFromIdentity } from "@/lib/user-sync";

export const runtime = "nodejs";

function resolvePrimaryEmail(
  emailAddresses: Array<{ id: string; email_address: string }>,
  primaryEmailAddressId: string | null,
) {
  if (!primaryEmailAddressId) {
    return null;
  }

  return (
    emailAddresses.find((email) => email.id === primaryEmailAddressId)
      ?.email_address ?? null
  );
}

function resolveFullName(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || username || null;
}

export async function POST(request: NextRequest) {
  if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SIGNING_SECRET is not configured." },
      { status: 500 },
    );
  }

  let event;
  try {
    event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  switch (event.type) {
    case "user.deleted": {
      if (!event.data.id) {
        return NextResponse.json(
          { error: "Missing user id in user.deleted payload." },
          { status: 400 },
        );
      }

      await prisma.user.deleteMany({
        where: { clerkId: event.data.id },
      });

      return NextResponse.json({ received: true, event: event.type }, { status: 200 });
    }

    case "user.created":
    case "user.updated": {
      const clerkUser = event.data;
      if (!clerkUser.id) {
        return NextResponse.json(
          { error: "Missing user id in Clerk webhook payload." },
          { status: 400 },
        );
      }

      const primaryEmail = resolvePrimaryEmail(
        clerkUser.email_addresses,
        clerkUser.primary_email_address_id,
      );
      if (!primaryEmail) {
        return NextResponse.json(
          { error: "Missing primary email in Clerk webhook payload." },
          { status: 400 },
        );
      }

      const fullName = resolveFullName(
        clerkUser.first_name,
        clerkUser.last_name,
        clerkUser.username,
      );

      await syncDbUserFromIdentity({
        clerkId: clerkUser.id,
        email: primaryEmail,
        fullName,
        avatarUrl: clerkUser.image_url ?? null,
        source: "webhook",
      });

      return NextResponse.json({ received: true, event: event.type }, { status: 200 });
    }

    default:
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
  }
}
