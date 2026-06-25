export function formatValue(value: any): string {
    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "number" && value > 1000) {
        return `₹${value.toLocaleString("en-IN")}`;
    }

    return String(value);
}

export function formatFieldName(field: string): string {
    return field
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}