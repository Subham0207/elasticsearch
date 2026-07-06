import type { Job } from "../Models/Job.js";
import type { ElasticSearchService } from "../services/elasticSearchService.js";
import { validateCreateJobRequest } from "../Validators/Job.js";

function decodeCursor(cursor: unknown): Array<string | number> {
    const cursorRaw = Buffer.from(String(cursor), "base64").toString("utf8");
    const parsedCursor = JSON.parse(cursorRaw);

    if (!Array.isArray(parsedCursor)) {
        throw new Error("Cursor must decode to an array");
    }

    return parsedCursor as Array<string | number>;
}

export class JobsController{
    private elasticSearch: ElasticSearchService;

    constructor(elasticSearch: ElasticSearchService){
        this.elasticSearch = elasticSearch;
    }


    async createJobs(request: any, response: any){
        const job = request.body as Partial<Job>;
        const validationErrors = validateCreateJobRequest(job);

        if (validationErrors.length > 0) {
        response.status(400).json({
            message: "Invalid request body",
            errors: validationErrors,
        });
        return;
        }

        try {
        await this.elasticSearch.createJob({
            ...job,
            createdAt: job.createdAt ?? new Date().toISOString(),
        });

        response.status(201).json({ message: "Job created successfully" });
        } catch (error) {
        console.error("Error creating job:", error);

        const statusCode = typeof error === "object" && error !== null && "meta" in error
            ? Number((error as { meta?: { statusCode?: number } }).meta?.statusCode ?? 500)
            : 500;

        response.status(Number.isFinite(statusCode) ? statusCode : 500).json({
            message: "Failed to create job",
            details: statusCode === 400
                ? "Elasticsearch rejected the document. Check field formats and mapping constraints."
                : "Unexpected server error while indexing job",
        });
        }
    }

    async getJobs(request: any, response: any){
        const size = Number(request.query.size) || 10;

        const fromPage = Number(request.query.fromPage) || 0;
        const jobs = await this.elasticSearch.getJobs(fromPage, size);

        return response.status(200).json(jobs);
    }

    async searchJobs(request: any, response: any){
        const size = Number(request.query.size) || 10;
        const nextCursor = request.query.nextCursor || null;
        const searchString = request.query.search || null;

        if (!nextCursor) {
            const jobs = await this.elasticSearch.searchJobs(searchString, null, size);
            return response.status(200).json(jobs);
        }

        try {
            const decodedCursor = decodeCursor(nextCursor);
            const jobs = await this.elasticSearch.searchJobs(searchString, decodedCursor, size);
            return response.status(200).json(jobs);
        } catch {
            return response.status(400).json({
                message: "Invalid nextCursor",
                details: "nextCursor must be a valid base64-encoded JSON array",
            });
        }
    }
}