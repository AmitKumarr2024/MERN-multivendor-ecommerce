import {
    forwardRef,
    InputHTMLAttributes,
} from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<
    HTMLInputElement,
    InputProps
>(
    (
        {
            label,
            error,
            helperText,
            className = "",
            id,
            ...props
        },
        ref,
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                        {label}
                    </label>
                )}

                <input
                    ref={ref}
                    id={id}
                    className={`
                        w-full rounded-xl border bg-white px-4 py-3
                        text-sm text-zinc-950 outline-none transition
                        placeholder:text-zinc-400
                        disabled:cursor-not-allowed disabled:opacity-60
                        dark:bg-zinc-900 dark:text-white
                        ${error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-zinc-300 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:focus:border-white"
                        }
                        ${className}
                    `}
                    {...props}
                />

                {error && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";

export default Input;