import { ExperienceLevel } from "@prisma/client";

import { updateProfileAction } from "@/actions/profile";
import { SubmitButton } from "@/components/form/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await requireDbUser();
  const defaultResume = await prisma.resume.findFirst({
    where: { userId: user.id, isDefault: true },
    select: {
      id: true,
      title: true,
      parsedSkills: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Reusable profile data auto-fills skill context and accelerates one-click analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={user.fullName ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  defaultValue={user.experienceLevel ?? ExperienceLevel.MID}
                  className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {Object.values(ExperienceLevel).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                defaultValue={user.education ?? ""}
                placeholder="B.Tech in Computer Science, XYZ University"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Textarea
                id="skills"
                name="skills"
                defaultValue={user.skills.join(", ")}
                placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredJobRoles">Preferred Job Roles (comma separated)</Label>
              <Textarea
                id="preferredJobRoles"
                name="preferredJobRoles"
                defaultValue={user.preferredJobRoles.join(", ")}
                placeholder="Frontend Engineer, Full Stack Developer, ML Engineer"
              />
            </div>
            <SubmitButton pendingText="Saving profile...">Save Profile</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Resume Context</CardTitle>
          <CardDescription>
            Used automatically for quick analysis and profile skill prefill.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {defaultResume ? (
            <div className="space-y-2">
              <p className="font-medium">{defaultResume.title}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Parsed skills:{" "}
                {defaultResume.parsedSkills.length > 0
                  ? defaultResume.parsedSkills.slice(0, 12).join(", ")
                  : "None detected"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No default resume selected yet. Upload one in Resume Library.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
