import { createRouteHandler } from "uploadthing/next";

import { env } from "@/lib/env";
import { ourFileRouter } from "./core";

if (!env.UPLOADTHING_TOKEN) {
  throw new Error("UPLOADTHING_TOKEN is not configured.");
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});
