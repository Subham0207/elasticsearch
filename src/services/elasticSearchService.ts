import { Client, estypes } from "@elastic/elasticsearch";
import { createElasticClient } from "../elasticsearch/Client.js";
import type { CursorPageResponse, GetJobsResponse, Job } from "../Models/Job.js";

export class ElasticSearchService
{
    private es: Client;
    private jobsIndex: string = "jobs";

    constructor()
    {
        this.es = createElasticClient();
    }

    public async createJob(job: Partial<Job>): Promise<void>
    {
        const jobId = crypto.randomUUID();
        await this.es.index({
            index: this.jobsIndex,
            id: jobId,
            document: {
            id: jobId,
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
            createdAt: job.createdAt,
            },
        });
    }

    public async getJobs(fromPage: number = 0, size = 10): Promise<GetJobsResponse>
    {
        const response = await this.es.search<Job>({
            index: this.jobsIndex,
            size,
            from: fromPage * size,
        });
        const jobs = response.hits.hits
            .map((hit) => hit._source)
            .filter((job): job is Job => Boolean(job));

        return {
            jobs,
            from: fromPage,
            size,
        };
    }

    public async searchJobs(searchString: string| null = null, lastHitSortValue: Array<string | number> | null = null, size: number = 10): Promise<CursorPageResponse>
    {
        const searchParams: estypes.SearchRequest = {
            index: this.jobsIndex,
            sort: [
                { _score: { order: "desc" } }, // sort first by relevance
                { createdAt: { order: "desc" } },
                { id: { order: "asc" } },
            ],
            size,
            ...(searchString ? {query: {
                multi_match: {
                    query: searchString,
                    fields: ["title^3", "description", "skills"], // titile^3 means title match is more important
                },
            }}: {}),
            ...(lastHitSortValue ? { search_after: lastHitSortValue } : {}),
        };

        const nextResult = await this.es.search<Job>(searchParams);

        const hits = nextResult.hits.hits;
        console.log(hits); // Hit has other properties like
        // - score, sort, _source is our actual object.
        const jobs = hits
            .map((hit) => hit._source)
            .filter((job): job is Job => Boolean(job));

        const lastHit = hits[hits.length - 1];
        const nextCursor = lastHit?.sort
            ? Buffer.from(JSON.stringify(lastHit.sort), "utf8").toString("base64")
            : null;

        return {
            jobs,
            size,
            nextCursor,
        };
    }
}
