import express from "express";
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
app.get("/jobs", async (request, response) => jobsController.getJobs(request, response));
app.get("/jobs/search", async (request, response) => jobsController.searchJobs(request, response));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});