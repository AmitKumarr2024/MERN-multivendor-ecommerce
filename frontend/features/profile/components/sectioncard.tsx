interface SectionCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export default function SectionCard({
    title,
    description,
    icon,
    action,
    children,
}: SectionCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    {icon ? (
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                            {icon}
                        </div>
                    ) : null}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {action ? <div className="shrink-0">{action}</div> : null}
            </div>

            {children}
        </div>
    );
}