import { ratingFields } from "./rating-config";


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


export function getRatingLabel(key: string): string {
    return (
        ratingFields.find((field) => field.key === key)?.label ??
        formatFieldName(key)
    );
}

export function getRatingDescription(key: string): string {
    return (
        ratingFields.find((field) => field.key === key)?.description ??
        ""
    );
}

export function getRating(key: string) {
    return ratingFields.find((field) => field.key === key);
}