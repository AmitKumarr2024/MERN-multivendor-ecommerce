interface AvatarProps {
    name?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function Avatar({
    name,
    size = "md",
    className = "",
}: AvatarProps) {

    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-20 w-20 text-2xl",
    };

    /*
     * Generate initials from the user's name.
     *
     * Examples:
     *
     * Amit Kumar  -> AK
     * Amit        -> A
     * No name     -> U
     */

    const getInitials = (
        value?: string | null,
    ) => {

        if (!value?.trim()) {
            return "U";
        }

        const parts = value
            .trim()
            .split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    const initials = getInitials(name);

    return (
        <div
            role="img"
            aria-label={
                name
                    ? `${name} avatar`
                    : "User avatar"
            }
            className={`
                flex shrink-0 items-center justify-center
                rounded-full
                bg-zinc-950
                font-black uppercase
                text-white
                dark:bg-white
                dark:text-zinc-950
                ${sizes[size]}
                ${className}
            `}
        >
            {initials}
        </div>
    );
}