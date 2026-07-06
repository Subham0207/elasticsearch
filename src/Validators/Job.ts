import type { Job } from "../Models/Job.js";

export function validateCreateJobRequest(body: Partial<Job>): string[] {
    const errors: string[] = [];

    if (typeof body.title !== "string" || body.title.trim().length === 0) {
        errors.push("title is required and must be a non-empty string");
    }

    if (typeof body.company !== "string" || body.company.trim().length === 0) {
        errors.push("company is required and must be a non-empty string");
    }

    if (typeof body.description !== "string" || body.description.trim().length === 0) {
        errors.push("description is required and must be a non-empty string");
    }

    if (!body.location || typeof body.location.lat !== "number" || typeof body.location.lon !== "number") {
        errors.push("location is required and must include numeric lat and lon");
        return errors;
    }

    if (body.location.lat < -90 || body.location.lat > 90) {
        errors.push("location.lat must be between -90 and 90");
    }

    if (body.location.lon < -180 || body.location.lon > 180) {
        errors.push("location.lon must be between -180 and 180");
    }

    return errors;
}
