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