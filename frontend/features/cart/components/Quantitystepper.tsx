interface QuantityStepperProps {
    quantity: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export default function QuantityStepper({
    quantity,
    onChange,
    min = 1,
    max = 99,
    disabled = false,
}: QuantityStepperProps) {
    return (
        <div className="inline-flex items-center rounded-lg border border-default">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, quantity - 1))}
                disabled={disabled || quantity <= min}
                className="flex h-8 w-8 items-center justify-center text-secondary transition-colors hover:bg-surface-hover disabled:opacity-30"
                aria-label="Decrease quantity"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M4 10a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
                </svg>
            </button>

            <span className="w-8 text-center text-sm font-medium text-primary">{quantity}</span>

            <button
                type="button"
                onClick={() => onChange(Math.min(max, quantity + 1))}
                disabled={disabled || quantity >= max}
                className="flex h-8 w-8 items-center justify-center text-secondary transition-colors hover:bg-surface-hover disabled:opacity-30"
                aria-label="Increase quantity"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
                </svg>
            </button>
        </div>
    );
}