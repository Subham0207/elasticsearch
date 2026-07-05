import { Client } from "@elastic/elasticsearch";
import { createElasticClient } from "../elasticsearch/Client.js";
import type { Job } from "../Models/Job.js";

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
            skills: job.skills,
            location: job.location,
            createdAt: job.createdAt,
            },
        });
    }
}
