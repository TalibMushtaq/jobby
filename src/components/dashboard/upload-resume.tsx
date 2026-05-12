"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UploadButton } from "@/lib/uploadthing";

export function UploadResume() {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="resumeUploader"
      className="ut-button:bg-sky-600 ut-button:ut-readying:bg-sky-500 ut-button:ut-uploading:bg-sky-700 ut-button:ut-uploading:after:bg-sky-800 ut-label:text-zinc-600 dark:ut-label:text-zinc-300 ut-allowed-content:text-zinc-500"
      onClientUploadComplete={async (result) => {
        try {
          const uploaded = result[0]?.serverData as
            | {
                fileUrl: string;
                fileKey: string;
                fileName: string;
                fileType: string;
                fileSize: number;
              }
            | undefined;

          if (!uploaded) {
            toast.error("Upload completed, but server metadata was missing.");
            return;
          }

          const response = await fetch("/api/resumes/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(uploaded),
          });

          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            toast.error(payload.error ?? "Failed to register uploaded resume.");
            return;
          }

          toast.success("Resume saved successfully.");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unexpected upload handling error.",
          );
        }
      }}
      onUploadError={(error: Error) => {
        toast.error(error.message);
      }}
    />
  );
}
