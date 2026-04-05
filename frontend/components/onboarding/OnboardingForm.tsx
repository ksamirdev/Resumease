"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingForm() {
  const router = useRouter();
  const { user, completeOnboarding, getPostLoginRoute } = useAuth();

  const initialRole = useMemo(() => {
    if (user?.role === "recruiter") return "recruiter";
    if (user?.role === "business") return "business";
    return "student";
  }, [user?.role]);

  const [role, setRole] = useState<"student" | "recruiter" | "business">(initialRole);
  const [loading, setLoading] = useState(false);

  const [student, setStudent] = useState({
    college: "",
    degree: "",
    graduation_year: new Date().getFullYear(),
    target_roles: "",
    skills_self_reported: "",
  });

  const [recruiter, setRecruiter] = useState({
    company: "",
    designation: "",
    hiring_for: "",
    company_size: "",
  });

  const [business, setBusiness] = useState({
    company_name: "",
    industry: "",
    company_size: "",
    website: "",
    description: "",
  });

  const toArray = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const inputClass = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-violet-500 dark:focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      let payload: { role: "student" | "recruiter" | "business"; data: Record<string, unknown> };
      if (role === "student") {
        payload = {
          role,
          data: {
            college: student.college,
            degree: student.degree,
            graduation_year: Number(student.graduation_year),
            target_roles: toArray(student.target_roles),
            skills_self_reported: toArray(student.skills_self_reported),
          },
        };
      } else if (role === "recruiter") {
        payload = {
          role,
          data: {
            company: recruiter.company,
            designation: recruiter.designation,
            hiring_for: toArray(recruiter.hiring_for),
            company_size: recruiter.company_size,
          },
        };
      } else {
        payload = {
          role,
          data: {
            company_name: business.company_name,
            industry: business.industry,
            company_size: business.company_size,
            ...(business.website ? { website: business.website } : {}),
            ...(business.description ? { description: business.description } : {}),
          },
        };
      }

      const nextUser = await completeOnboarding(payload);
      toast.success("Onboarding completed");
      router.push(getPostLoginRoute(nextUser));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Unable to complete onboarding";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
      <div>
        <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">I am joining as</p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { value: "student", label: "👨‍🎓 Student" },
              { value: "recruiter", label: "💼 Recruiter" },
              { value: "business", label: "🏢 Business" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                role === value
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {role === "student" ? (
        <div className="space-y-5 pt-4">
          <div>
            <label className={labelClass}>College/University</label>
            <input
              required
              value={student.college}
              onChange={(e) => setStudent((prev) => ({ ...prev, college: e.target.value }))}
              className={inputClass}
              placeholder="e.g., MIT, Stanford, Delhi University"
            />
          </div>
          <div>
            <label className={labelClass}>Degree</label>
            <input
              required
              value={student.degree}
              onChange={(e) => setStudent((prev) => ({ ...prev, degree: e.target.value }))}
              className={inputClass}
              placeholder="e.g., B.Tech Computer Science, B.Sc Physics"
            />
          </div>
          <div>
            <label className={labelClass}>Graduation Year</label>
            <input
              required
              type="number"
              min={2000}
              max={2100}
              value={student.graduation_year}
              onChange={(e) => setStudent((prev) => ({ ...prev, graduation_year: Number(e.target.value) }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Target Roles</label>
            <input
              value={student.target_roles}
              onChange={(e) => setStudent((prev) => ({ ...prev, target_roles: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Frontend Engineer, Data Scientist, Product Manager"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Separate multiple roles with commas</p>
          </div>
          <div>
            <label className={labelClass}>Skills</label>
            <input
              value={student.skills_self_reported}
              onChange={(e) => setStudent((prev) => ({ ...prev, skills_self_reported: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Python, React, Machine Learning, SQL"
            />
            <p className="mt-1 text-xs text-zinc-500">Separate multiple skills with commas</p>
          </div>
        </div>
      ) : role === "recruiter" ? (
        <div className="space-y-5 pt-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              required
              value={recruiter.company}
              onChange={(e) => setRecruiter((prev) => ({ ...prev, company: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Google, Microsoft, Accenture"
            />
          </div>
          <div>
            <label className={labelClass}>Your Designation</label>
            <input
              required
              value={recruiter.designation}
              onChange={(e) => setRecruiter((prev) => ({ ...prev, designation: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Hiring Manager, Tech Lead, HR Manager"
            />
          </div>
          <div>
            <label className={labelClass}>Currently Hiring For</label>
            <input
              value={recruiter.hiring_for}
              onChange={(e) => setRecruiter((prev) => ({ ...prev, hiring_for: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
            />
            <p className="mt-1 text-xs text-zinc-500">Separate multiple positions with commas</p>
          </div>
          <div>
            <label className={labelClass}>Company Size</label>
            <input
              required
              value={recruiter.company_size}
              onChange={(e) => setRecruiter((prev) => ({ ...prev, company_size: e.target.value }))}
              className={inputClass}
              placeholder="e.g., 50-200, 1000+, Early-stage startup"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 pt-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              required
              value={business.company_name}
              onChange={(e) => setBusiness((prev) => ({ ...prev, company_name: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Acme Corp, TechStartup Inc"
            />
          </div>
          <div>
            <label className={labelClass}>Industry</label>
            <input
              required
              value={business.industry}
              onChange={(e) => setBusiness((prev) => ({ ...prev, industry: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Software, Finance, Healthcare, E-commerce"
            />
          </div>
          <div>
            <label className={labelClass}>Company Size</label>
            <input
              required
              value={business.company_size}
              onChange={(e) => setBusiness((prev) => ({ ...prev, company_size: e.target.value }))}
              className={inputClass}
              placeholder="e.g., 1-10, 50-200, 1000+"
            />
          </div>
          <div>
            <label className={labelClass}>Website <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <input
              value={business.website}
              onChange={(e) => setBusiness((prev) => ({ ...prev, website: e.target.value }))}
              className={inputClass}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div>
            <label className={labelClass}>About your company <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <textarea
              value={business.description}
              onChange={(e) => setBusiness((prev) => ({ ...prev, description: e.target.value }))}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Brief description of what your company does"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {loading ? "Saving your onboarding..." : "✓ Complete onboarding"}
      </button>
    </form>
  );
}
