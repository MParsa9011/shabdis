"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[
            "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors resize-none",
            "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
            error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
