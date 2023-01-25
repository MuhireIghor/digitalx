
var elasticsearch = require('@elastic/elasticsearch');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var indexname = "world";
import data from './article.json';

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
var payload ={
  "index": indexname,
  "body": {  "settings": {
      "analysis": {
        "analyzer": {
           "indexing_analyzer": {
             "tokenizer": "whitespace",
             "filter":  ["lowercase", "edge_ngram_filter"]
           },
           "search_analyze": {
             "tokenizer": "whitespace",
             "filter":  "lowercase"
           }
        },
        "filter": {
          "edge_ngram_filter": {
            "type": "edge_ngram",
            "min_gram": 1,
            "max_gram": 20
          }
        }
      }
    },
    "mappings":{
      "world":{
        "properties":{
          "title": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "tags": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "published": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "slug_de": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "slug_en": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "slug_de": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
          "introtext": {
            "type": "string",
            "analyzer":"indexing_analyzer",
            "search_analyzer": "search_analyze"
          },
        }
      }
    }}



}



app.get("/create",function(request, reponse){
  client.indices.create(payload, function(error, response){
    getData();
  });
});



app.get("/search", function(req, resp){
  console.log(req.query.search);
  client.search({
    index: indexname,
    body: {
      query: {
        multi_match: {
          query: req.query.search,
          fields: ["title", "tags", "published","slug_de","slug_en","introtext"]
        }
      }
    }
  }, function (error, response) {
    resp.json({result: response});
  });
});

app.listen("8080");




//functions

function getData() {

  var data_array =[];
  
  for(var i = 0; i < data.length; i++){
    data_array.push(
      { index:  { _index: indexname, _type: 'world', _id: data[i].id } },
      { title: data[i].title, tags: data[i].tags,published:data[i].published, slug_en: data[i].slug_en,slug_de:data[i].slug_de,introtext:data[i].introtext }
    )
  }
  client.bulk({
    body: data_array
  },function(error, response){
    console.log(error);
    console.log(response);
  });
  };
