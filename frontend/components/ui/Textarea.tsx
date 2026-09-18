import {
    TextareaHTMLAttributes,
    forwardRef,
} from "react";

export interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>(
    (
        {
            className = "",
            ...props
        },
        ref,
    ) => {
        return (
            <textarea
                ref={ref}
                className={`
                    w-full rounded-xl border border-zinc-300
                    bg-white px-4 py-2.5 text-sm text-zinc-900
                    outline-none transition
                    placeholder:text-zinc-400
                    focus:border-zinc-500
                    focus:ring-2 focus:ring-zinc-200
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    dark:border-zinc-700
                    dark:bg-zinc-900
                    dark:text-zinc-100
                    dark:placeholder:text-zinc-500
                    dark:focus:border-zinc-500
                    dark:focus:ring-zinc-800
                    ${className}
                `}
                {...props}
            />
        );
    },
);

Textarea.displayName = "Textarea";

export default Textarea;