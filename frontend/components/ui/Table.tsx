import type {
    HTMLAttributes,
    TableHTMLAttributes,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from "react";

export function Table({
    children,
    className = "",
    ...props
}: TableHTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-x-auto">
            <table
                className={`w-full text-left text-sm ${className}`}
                {...props}
            >
                {children}
            </table>
        </div>
    );
}

export function TableHeader({
    children,
    className = "",
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead
            className={`border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
            {...props}
        >
            {children}
        </thead>
    );
}

export function TableBody({
    children,
    className = "",
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody
            className={`divide-y divide-zinc-200 dark:divide-zinc-800 ${className}`}
            {...props}
        >
            {children}
        </tbody>
    );
}

export function TableRow({
    children,
    className = "",
    ...props
}: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={`transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${className}`}
            {...props}
        >
            {children}
        </tr>
    );
}

export function TableHead({
    children,
    className = "",
    ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${className}`}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({
    children,
    className = "",
    ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={`px-4 py-4 text-zinc-700 dark:text-zinc-300 ${className}`}
            {...props}
        >
            {children}
        </td>
    );
}