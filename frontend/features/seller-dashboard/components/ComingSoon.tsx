interface ComingSoonProps {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-gray-400">
                    <path
                        fillRule="evenodd"
                        d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4a.75.75 0 0 0-1.5 0v4c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L10.75 9.69V6Z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
            <h1 className="mt-4 text-lg font-semibold text-gray-900">{title}</h1>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
        </div>
    );
}