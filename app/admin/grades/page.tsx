"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface Course { id: string; name: string; code: string; }
interface Grade {
  id: string; courseId: string; studentName: string;
  assessment: string; score: number; maxScore: number; notes?: string | null;
}

export default function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [form, setForm] = useState({ courseId: "", studentName: "", assessment: "", score: 0, maxScore: 100, notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/teaching").then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fetchGrades = useCallback(async () => {
    const url = selectedCourse ? `/api/admin/grades?courseId=${selectedCourse}` : "/api/admin/grades";
    const res = await fetch(url);
    if (res.ok) setGrades(await res.json());
  }, [selectedCourse]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    await fetch("/api/admin/grades", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setModalOpen(false);
    fetchGrades();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this grade record?")) return;
    await fetch(`/api/admin/grades?id=${id}`, { method: "DELETE" });
    fetchGrades();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ courseId: selectedCourse, studentName: "", assessment: "", score: 0, maxScore: 100, notes: "" });
    setModalOpen(true);
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  // Group by student
  const byStudent = grades.reduce<Record<string, Grade[]>>((acc, g) => {
    if (!acc[g.studentName]) acc[g.studentName] = [];
    acc[g.studentName].push(g);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Grades & Assessment</h1>
        <Button variant="primary" onClick={openCreate}>+ Add Grade</Button>
      </div>

      {/* Course filter */}
      <div className="mb-6">
        <label htmlFor="course-filter" className="block text-sm font-medium text-navy-800 mb-1">Filter by Course</label>
        <select id="course-filter" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
        </select>
      </div>

      {/* Grades by student */}
      {Object.keys(byStudent).length === 0 ? (
        <p className="text-center text-navy-500 py-12">No grades recorded yet.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(byStudent).map(([student, studentGrades]) => {
            const avg = studentGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / studentGrades.length;
            return (
              <div key={student} className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-navy-50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{student.charAt(0)}</span>
                    </div>
                    <span className="font-semibold text-navy-900">{student}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${avg >= 70 ? "bg-green-100 text-green-700" : avg >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    Avg: {avg.toFixed(1)}%
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-navy-600">Assessment</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-navy-600">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-navy-600">%</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-navy-600">Notes</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-navy-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {studentGrades.map(g => (
                      <tr key={g.id}>
                        <td className="px-4 py-2 text-navy-800">{g.assessment}</td>
                        <td className="px-4 py-2 text-navy-700">{g.score}/{g.maxScore}</td>
                        <td className="px-4 py-2">
                          <span className={`font-semibold ${(g.score/g.maxScore)*100 >= 70 ? "text-green-600" : (g.score/g.maxScore)*100 >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {((g.score / g.maxScore) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-2 text-navy-500 text-xs">{g.notes ?? "—"}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditing(g); setForm({ courseId: g.courseId, studentName: g.studentName, assessment: g.assessment, score: g.score, maxScore: g.maxScore, notes: g.notes ?? "" }); setModalOpen(true); }}
                              className="text-xs text-primary hover:underline">Edit</button>
                            <button onClick={() => handleDelete(g.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Grade" : "Add Grade"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course *
            <select required value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} className={inputClass}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
            </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name *
              <input required value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assessment *
              <input required value={form.assessment} onChange={e => setForm(p => ({ ...p, assessment: e.target.value }))} placeholder="Midterm, Final, Assignment 1..." className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Score *
              <input required type="number" min={0} value={form.score} onChange={e => setForm(p => ({ ...p, score: parseFloat(e.target.value) }))} className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Score
              <input type="number" min={1} value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: parseFloat(e.target.value) }))} className={inputClass} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
