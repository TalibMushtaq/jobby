import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { isDevAuthBypass } from "@/lib/auth-mode";
import { isAllowedResumeType } from "@/lib/resume-parser";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f(
    {
      blob: {
        maxFileCount: 1,
        maxFileSize: "8MB",
      },
    },
    { awaitServerData: true },
  )
    .middleware(async ({ files }) => {
      const { userId } = isDevAuthBypass
        ? { userId: "dev-local-user" }
        : await auth();
      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      const file = files[0];
      if (!file || !isAllowedResumeType(file.type)) {
        throw new UploadThingError("Only PDF and DOCX files are supported.");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        fileKey: file.key,
        fileUrl: file.ufsUrl ?? file.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
