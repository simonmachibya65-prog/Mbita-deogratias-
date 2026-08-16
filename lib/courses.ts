import type { Course } from "@prisma/client";

interface SeparatedCourses {
  active: Course[];
  archived: Course[];
}

/**
 * Separate courses into active and archived partitions.
 * Returns an object with `active` and `archived` arrays.
 * Each course appears in exactly one partition based on its `status` field.
 */
export function separateCourses(courses: Course[]): SeparatedCourses {
  const active: Course[] = [];
  const archived: Course[] = [];

  for (const course of courses) {
    if (course.status === "active") {
      active.push(course);
    } else {
      archived.push(course);
    }
  }

  return { active, archived };
}
