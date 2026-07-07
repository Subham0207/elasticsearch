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
        const pitId = request.query.pitId;
        const keepAlive = request.query.keepAlive;
        const filters = request.query.filters || null;
        console.log("Filters received:", filters);
        
        try {

            if (!nextCursor) {
                const jobs = await this.elasticSearch.searchJobs(searchString, null, size, pitId, keepAlive, filters);
                return response.status(200).json(jobs);
            }

            const decodedCursor = decodeCursor(nextCursor);
            const jobs = await this.elasticSearch.searchJobs(searchString, decodedCursor, size, pitId, keepAlive, filters);
            return response.status(200).json(jobs);
        } catch (err: any) {
            if(err?.message.includes("search_phase_execution_exception"))
                return response.status(400).json({
                    message: "pitId or nextCursor invalid or expired",
                });
            
            return response.status(500).json({
                message: err?.message,
            });
        }
    }

    async createPIT(request: any, response: any){
        const ttl = request.query.ttl || "1m";
        const pitId = await this.elasticSearch.createPIT(ttl);
        return response.status(200).json({ pitId });
    }

    async removePIT(request: any, response: any){
        const pitId = request.query.pitId;
        if (!pitId) {
            return response.status(400).json({
                message: "Missing pitId",
                details: "pitId query parameter is required to remove a PIT",
            });
        }

        await this.elasticSearch.removePIT(pitId);
        return response.status(200).json({ message: "PIT removed successfully" });
    }
}