export function showProgress(current: number, total: number, width = 30): string {
    const percentage = (current / total) * 100
    const filled = Math.round((width * current) / total)
    const empty = width - filled

    const bar = "█".repeat(filled) + "░".repeat(empty)
    return `[${bar}] ${percentage.toFixed(1)}% (${formatSize(current)}/${formatSize(total)})`
}

export function formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unit = 0

    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024
        unit++
    }

    return `${size.toFixed(1)}${units[unit]}`
}
