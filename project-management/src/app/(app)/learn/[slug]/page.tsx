"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LessonView } from "@/components/learn/lesson-view";
import { lessonBySlug } from "@/lib/learn/course";

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = lessonBySlug(slug);
  if (!lesson)
    return (
      <div className="py-20 text-center">
        <p className="text-ink-3">That lesson doesn&apos;t exist.</p>
        <Link href="/learn" className="mt-2 inline-block text-[13px] underline">
          Back to all lessons
        </Link>
      </div>
    );
  return <LessonView lesson={lesson} />;
}
