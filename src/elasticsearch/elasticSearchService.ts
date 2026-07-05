import { Client } from "@elastic/elasticsearch";

class ElasticSearchService
{
    private es: Client;

    constructor()
    {
        this.es = new Client({
        node: "http://localhost:9200",
        });
    }
}
