import {
    forwardRef,
    SelectHTMLAttributes,
} from "react";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = forwardRef<
    HTMLSelectElement,
    SelectProps
>(
    (
        {
            label,
            error,
            options,
            placeholder,
            className = "",
            id,
            ...props
        },
        ref,
    ) => (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                    {label}
                </label>
            )}

            <select
                ref={ref}
                id={id}
                className={`
                    w-full rounded-xl border border-zinc-300
                    bg-white px-4 py-3 text-sm text-zinc-950
                    outline-none transition
                    focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10
                    dark:border-zinc-700 dark:bg-zinc-900 dark:text-white
                    ${className}
                `}
                {...props}
            >
                {placeholder && (
                    <option value="">
                        {placeholder}
                    </option>
                )}

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    ),
);

Select.displayName = "Select";

export default Select;