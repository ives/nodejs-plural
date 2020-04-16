const { MongoClient } = require("mongodb");
// same as:
// const MongoClient = require("mongodb").MongoClient;

const circulationRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");

// admin / inspect

const url = "mongodb://localhost:27017";
const dbName = "circulation";

const main = async () => {
  const client = new MongoClient(url);
  await client.connect();

  const results = await circulationRepo.loadData(data);
  console.log(results.insertedCount);
  console.log(results.ops); // actual JSON data from exec - newly added _id

  // we are able to connect to a db even if doesn't exist yet
  // DBs are created on the fly
  const admin = client.db(dbName).admin();
  // console.log(await admin.serverStatus());
  console.log(await admin.listDatabases());
};

main();
