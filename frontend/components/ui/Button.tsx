import {
    ButtonHTMLAttributes,
    forwardRef,
} from "react";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "danger"
    | "ghost";

type ButtonSize =
    | "sm"
    | "md"
    | "lg";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const Button = forwardRef<
    HTMLButtonElement,
    ButtonProps
>(
    (
        {
            children,
            className = "",
            variant = "primary",
            size = "md",
            loading = false,
            disabled,
            ...props
        },
        ref,
    ) => {
        const variants: Record<ButtonVariant, string> = {
            primary:
                "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",

            secondary:
                "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",

            danger:
                "bg-red-600 text-white hover:bg-red-700",

            ghost:
                "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
        };

        const sizes: Record<ButtonSize, string> = {
            sm: "px-3 py-2 text-xs",
            md: "px-4 py-2.5 text-sm",
            lg: "px-5 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center gap-2
                    rounded-xl font-bold transition
                    disabled:cursor-not-allowed disabled:opacity-60
                    ${variants[variant]}
                    ${sizes[size]}
                    ${className}
                `}
                {...props}
            >
                {loading ? "Please wait..." : children}
            </button>
        );
    },
);

Button.displayName = "Button";

export default Button;