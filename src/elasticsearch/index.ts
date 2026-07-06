import { createJobsIndex } from "./indices/jobs.js";
import { createElasticClient } from "./Client.js";

try
{
    const es = createElasticClient();
    await createJobsIndex(es);

    console.log("ElasticSearch indices created successfully.");
}catch (error)
{
    console.error("Error creating ElasticSearch indices:", error);
}