const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require("axios")
const config = require("../config.json")


const app = express();
app.mongo = new MongoClient(config.mongoUri, { useNewUrlParser: true });
app.webhooks = app.mongo.db("DiscordTerminal").collection("webhooks");
await app.mongo.connect()