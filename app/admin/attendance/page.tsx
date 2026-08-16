"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";

interface Course { id: string; name: string; code: string; }
interface AttendanceRecord {
  id: string; courseId: string; studentName: string;
  date: string; present: boolean; notes?: string | null;
}

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [form, setForm] = useState({ courseId: "", studentName: "", date: new Date().toISOString().split("T")[0], present: true, notes: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/teaching").then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    const url = selectedCourse ? `/api/admin/attendance?courseId=${selectedCourse}` : "/api/admin/attendance";
    const res = await fetch(url);
    if (res.ok) setRecords(await res.json());
  }, [selectedCourse]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("✅ Attendance recorded");
      setForm(p => ({ ...p, studentName: "", notes: "" }));
      fetchRecords();
    } else {
      setMessage("❌ Failed to record attendance");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this attendance record? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/attendance?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
    else setMessage("❌ Failed to delete record");
  };

  // Stats
  const presentCount = records.filter(r => r.present).length;
  const absentCount = records.filter(r => !r.present).length;
  const rate = records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0";

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Attendance Tracking</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Records", value: records.length, color: "bg-navy-50" },
          { label: "Present", value: presentCount, color: "bg-green-50" },
          { label: "Absent", value: absentCount, color: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.color} border border-border rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-navy-500">{s.label}</p>
          </div>
        ))}
      </div>
      {records.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-navy-800">Attendance Rate</span>
            <span className="text-sm font-semibold text-navy-900">{rate}%</span>
          </div>
          <div className="w-full bg-navy-100 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${parseFloat(rate) >= 75 ? "bg-green-500" : parseFloat(rate) >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${rate}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record form */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-semibold text-navy-900 mb-4">Record Attendance</h2>
          {message && <p className="mb-3 text-sm">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Course *
              <select required value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} className={inputClass}>
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
              </select>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student Name *
              <input required value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *
              <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="present" checked={form.present} onChange={e => setForm(p => ({ ...p, present: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="present" className="text-sm font-medium text-navy-800">Present</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Late, excused, etc." className={inputClass} />
              </label>
            </div>
            <Button type="submit" variant="primary" isLoading={saving} className="w-full">Record</Button>
          </form>
        </div>

        {/* Filter + records */}
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Filter by Course
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={inputClass}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)}
            </select>
            </label>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.length === 0 ? (
              <p className="text-center text-navy-500 py-8">No records yet.</p>
            ) : records.map(r => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${r.present ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div>
                  <p className="font-medium text-navy-900 text-sm">{r.studentName}</p>
                  <p className="text-xs text-navy-500">{new Date(r.date).toLocaleDateString()} · {r.present ? "✅ Present" : "❌ Absent"}</p>
                  {r.notes && <p className="text-xs text-navy-400">{r.notes}</p>}
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
