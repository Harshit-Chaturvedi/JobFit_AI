"use client";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Job Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the full job description here..."
        rows={8}
        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-y"
      />
      {value.length > 0 && (
        <p className="mt-1 text-xs text-slate-500 text-right">
          {value.length.toLocaleString()} characters
        </p>
      )}
    </div>
  );
}
