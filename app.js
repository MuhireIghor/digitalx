
var elasticsearch = require('elasticsearch');
var express = require('express');
var fs = require("fs");


var app = express();
var bodyParser = require('body-parser');

var indexname = "world";
const port = process.env.PORT || 8080;
const data = require('./article.json')

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
  auth: {
    username: 'IGHOR',
    password: 'IGHOR123'
  },
  tls: {
    ca: fs.readFileSync('./http_ca.crt'),
    rejectUnauthorized: false
  }
});
var payload = {
  "index": indexname,
  "body": {
    "settings": {
      "analysis": {
        "analyzer": {
          "indexing_analyzer": {
            "tokenizer": "my_tokenizer",
            "filter": ["lowercase", "ngram_filter"]
          }
        },
        "search_analyzer": {
          "tokenizer": "whitespace",
          "filter": "lowercase"
        }
        ,
        "filter": {
          "ngram_filter": {
            "type": "ngram",
            "min_gram": 1,
            "max_gram": 20
          }
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "whitespace"
        }

      },
    },
    "mappings": {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyzer"
        },
        "tags": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"
        },
        "published": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"
        },
        "slug_de": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"
        },
        "slug_en": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"
        },
        "introtext": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"
        },
        "meta_description": {
          "type": "text",
          "analyzer": "indexing_analyzer",
          "search_analyzer": "search_analyze"

        },
        "suggest": {
          "type": "completion",
          "analyzer": "simple",
          "search_analyzer": "simple",
          "payloads": false
        }
      }
    }
  },
}






app.post("/create", function (request, reponse) {
  client.indices.create(payload, function (error, response) {
    getData();
  });
});



app.get("/search", function (req, resp) {
  client.search({
    index: indexname,
    body: {
      query: {
  
            
              multi_match: {
                query: req.query.search,
                type:"phrase_prefix",
                fields: ["title", "tags", "published", "slug_de", "slug_en", "introtext", "meta_description"]
            }}
            

        
      
    }}, function(error, response) {
      resp.json({ result: response });
    });
});


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});




//functions

function getData() {

  var data_array = [];

  for (var i = 0; i < data.length; i++) {
    data_array.push(
      { index: { _index: indexname, _id: data[i].id } },
      { title: data[i].title, tags: data[i].tags, published: data[i].published, slug_en: data[i].slug_en, slug_de: data[i].slug_de, introtext: data[i].introtext, meta_description: data[i].meta_description }
    )
  }
  client.bulk({
    body: data_array
  }, function (error, response) {
    console.log("this is the response", response);
  });
};
