## Setting up typscript project
`
nvm use 24.14.0
npm init -y && npm i -D typescript ts-node eslint prettier @types/node && npx tsc --init
`

## Running elasticsearch as docker container
`
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -m 1GB \
  -e "discovery.type=single-node" \
  -e "ELASTIC_PASSWORD=elastic" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    docker.elastic.co/elasticsearch/elasticsearch:9.4.3
`

# Goals
- create documents in elastic indexes
- search them in UI for various usecases
    - full text search
      - normal - done
      - filter + full text search
        - must - effects score - done
        - filter - does not effect score. Used for exact contraints - done
    - geo search - done
    - see how pit works - done
      - when underlying index may change b/w requests causing missing/duplicate docs.
        - duplicate - due to new product added, products on page 1 shifted to page 2. Example: google search.
    - pagination types
      - from,size - done
      - search_after - done

- Scaling policies ( not coded but part of infrastructure )
  - shards ( data divided among multiple database instance ), replicas ( replicating shards ), partitions ( data divided in the same database instance )

# Nodes
  - Coordintator node
  - 

# Shards
  - scatter-gather pattern - coorinator node -> shards search independently and merge result.
  - No. of shards cannot be updated. Instead you need to create a new index.
# Replicas
  - Primary shard instance and its replica is never put under same node.
    - Helps with availability, when primary is down replica is promoted to primary.

# Versioned index and alias:
  - elasitcsearch mappings are immutable. since it uses inverted index.
  - if an index mapping ( type ) changes. We need to create a new version of that index.
  - reindex the new index. ( populate the new index)
  - Then point the alias to the new version