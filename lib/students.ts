import type { Student } from "@prisma/client";

interface SeparatedStudents {
  current: Student[];
  alumni: Student[];
}

/**
 * Separate students into current and alumni partitions.
 * Returns an object with `current` and `alumni` arrays.
 * Each student appears in exactly one partition based on their `status` field.
 */
export function separateStudents(students: Student[]): SeparatedStudents {
  const current: Student[] = [];
  const alumni: Student[] = [];

  for (const student of students) {
    if (student.status === "current") {
      current.push(student);
    } else {
      alumni.push(student);
    }
  }

  return { current, alumni };
}
