import { createJobsIndex } from "./indices/jobs.js";
import { createElasticClient } from "./Client.js";

const es = createElasticClient();
await createJobsIndex(es);