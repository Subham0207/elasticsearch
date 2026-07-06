import { Client } from "@elastic/elasticsearch";
import { createElasticClient } from "../elasticsearch/Client.js";
import type { GetJobsResponse, Job } from "../Models/Job.js";

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

    public async getJobs(fromPage: number = 0): Promise<GetJobsResponse>
    {
        const response = await this.es.search({
            index: this.jobsIndex,
            size: 10,
            from: fromPage * 10,
        });
        const jobs = response.hits.hits.map((hit: any) => hit._source as Job);
        return {
            jobs,
            from: fromPage,
            size: 10,
        };
    }

    public async getJobsByCursor()
    {

    }
}
