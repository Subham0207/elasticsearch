import express from "express";
import type { Job } from "./src/Models/Job.js";
import { ElasticSearchService } from "./src/services/elasticSearchService.js";
import { JobsController } from "./src/controllers/jobsController.js";

const app = express();
const elasticSearch = new ElasticSearchService();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

const elasticSearchService = new ElasticSearchService();
const jobsController = new JobsController(elasticSearchService);

app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
});

app.post("/jobs", (request, response) => jobsController.createJobs(request, response));
app.get("/jobs", async (_request, response) => jobsController.getJobs(_request, response));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});