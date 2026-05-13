import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function resolvePrimaryEmail(
  emailAddresses: Array<{ id: string; email_address: string }>,
  primaryEmailAddressId: string | null,
  fallbackUserId: string,
) {
  return (
    emailAddresses.find((email) => email.id === primaryEmailAddressId)
      ?.email_address ??
    emailAddresses[0]?.email_address ??
    `${fallbackUserId}@clerk.local`
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
      const primaryEmail = resolvePrimaryEmail(
        clerkUser.email_addresses,
        clerkUser.primary_email_address_id,
        clerkUser.id,
      );
      const fullName = resolveFullName(
        clerkUser.first_name,
        clerkUser.last_name,
        clerkUser.username,
      );

      await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
          email: primaryEmail,
          fullName,
          avatarUrl: clerkUser.image_url ?? null,
        },
        create: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          fullName,
          avatarUrl: clerkUser.image_url ?? null,
        },
      });

      return NextResponse.json({ received: true, event: event.type }, { status: 200 });
    }

    default:
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
  }
}
