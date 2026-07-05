import express from "express";
import type { Job } from "./src/Models/Job.js";
import { ElasticSearchService } from "./src/services/elasticSearchService.js";

const app = express();
const elasticSearch = new ElasticSearchService();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
});

app.post("/jobs", async (request, response) => {
    const job = request.body as Partial<Job>;

    try {
        await elasticSearch.createJob({
            ...job,
            createdAt: job.createdAt ?? new Date().toISOString(),
        });

        response.status(201).json({ message: "Job created successfully" });
    } catch (error) {
        console.error("Error creating job:", error);
        response.status(500).json({ message: "Failed to create job" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});