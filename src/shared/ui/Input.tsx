import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-alfa-graphite">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-11 rounded-xl bg-surface border border-line px-3.5 text-[15px] text-alfa-ink',
            'placeholder:text-muted transition-shadow',
            'focus:outline-none focus:border-alfa-red/50 focus:shadow-focus',
            leftIcon && 'pl-10',
            error && 'border-alfa-red focus:border-alfa-red',
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-alfa-red">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
});
