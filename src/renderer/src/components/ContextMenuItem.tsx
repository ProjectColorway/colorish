/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({ onClick, children }: { onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode; }) {
    return <button
        className="cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-600 transition rounded-sm w-full h-11 min-w-11"
        onClick={onClick}
    >
        {children}
    </button>;
}
