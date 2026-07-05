import { Client } from "@elastic/elasticsearch";

export function createElasticClient() {
    return new Client({
        node: "https://localhost:9200",
        auth: {
            username: "elastic",
            password: "elastic",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}
