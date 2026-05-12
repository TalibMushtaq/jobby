import { Download, FileText, Star, Trash2 } from "lucide-react";

import { deleteResumeAction, setDefaultResumeAction } from "@/actions/resume";
import { UploadResume } from "@/components/dashboard/upload-resume";
import { SubmitButton } from "@/components/form/submit-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ResumeLibraryPage() {
  const user = await requireDbUser();
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      analyses: {
        select: { id: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Library</CardTitle>
          <CardDescription>
            Upload once, keep versions permanently, and set a default resume for quick analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <UploadResume />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Supported files: PDF, DOCX (up to 8MB). Text is extracted and persisted for analysis reuse.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          {resumes.length > 0 ? (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-medium">{resume.title}</p>
                      {resume.isDefault ? <Badge variant="success">Default</Badge> : null}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {resume.fileType} • {resume.analyses.length} analysis runs
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resume.parsedSkills.slice(0, 6).map((skill) => (
                        <Badge key={`${resume.id}-${skill}`} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <FileText className="h-4 w-4" />
                      Open
                    </a>
                    <a
                      href={resume.fileUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                    {!resume.isDefault ? (
                      <form action={setDefaultResumeAction}>
                        <input type="hidden" name="resumeId" value={resume.id} />
                        <SubmitButton
                          variant="secondary"
                          size="sm"
                          pendingText="Setting..."
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Set default
                        </SubmitButton>
                      </form>
                    ) : null}
                    <form action={deleteResumeAction}>
                      <input type="hidden" name="resumeId" value={resume.id} />
                      <SubmitButton variant="destructive" size="sm" pendingText="Deleting...">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No resumes uploaded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
