const { MongoClient } = require("mongodb");

function circulationRepo() {
  // JS revealing funciton pattern = closure | not to pollute global scope | todo move to env variable
  const url = "mongodb://localhost:27017";
  const dbName = "circulation";

  function loadData(data) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        // db is circulation
        // collection is newspapers

        // insertMany takes a JSON onj
        results = await db.collection("newspapers").insertMany(data);
        // return insert stats
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }

  return { loadData };
}
// will auto execute / return obj
module.exports = circulationRepo();
