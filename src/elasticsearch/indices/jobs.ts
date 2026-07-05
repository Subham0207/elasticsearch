import { Client, estypes } from "@elastic/elasticsearch";

const jobsMapping: estypes.MappingTypeMapping = {
  properties: {
    id: { type: "keyword" },
    title: { type: "text" },
    description: { type: "text" },
    company: { type: "keyword" },
    location: { type: "geo_point" },
    createdAt: { type: "date" },
  },
};

export async function createJobsIndex(es: Client) {
  const exists = await es.indices.exists({
    index: "jobs",
  });

  if (exists) return;

  await es.indices.create({
    index: "jobs",
    mappings: jobsMapping,
  });
}