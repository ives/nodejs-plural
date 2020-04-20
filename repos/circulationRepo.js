const { MongoClient, ObjectID } = require("mongodb");

// Docs:
// http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html
// https://docs.mongodb.com/manual/tutorial/query-documents/

function circulationRepo() {
  // JS revealing funciton pattern = closure | not to pollute global scope | todo move to env variable
  const url = "mongodb://localhost:27017";
  const dbName = "circulation";

  function get(query, limit) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        // will return a cursor only - nothing happens until call toArray()
        let items = db.collection("newspapers").find(query);

        if (limit > 0) {
          // Optional LIMIT
          items = items.limit(limit);
        }
        // Other FILTER modifications:
        // We are working with CURSOR which is NOT yet an array of DATA
        // skip is used to implement paging
        // project adds another item to your query

        // collection.find({}).project({ a: 1 })                          // Create a projection of field a: adds an item to query
        // collection.find({}).skip(1).limit(10)                          // Skip 1 and limit 10: pagination
        // collection.find({}).batchSize(5)                               // Set batchSize on cursor to 5
        // collection.find({}).filter({ a: 1 })                           // Set query on the cursor
        // collection.find({}).comment('add a comment')                   // Add a comment to the query, allowing to correlate queries
        // collection.find({}).addCursorFlag('tailable', true)            // Set cursor as tailable
        // collection.find({}).addCursorFlag('oplogReplay', true)         // Set cursor as oplogReplay
        // collection.find({}).addCursorFlag('noCursorTimeout', true)     // Set cursor as noCursorTimeout
        // collection.find({}).addCursorFlag('awaitData', true)           // Set cursor as awaitData
        // collection.find({}).addCursorFlag('exhaust', true)             // Set cursor as exhaust
        // collection.find({}).addCursorFlag('partial', true)             // Set cursor as partial
        // collection.find({}).addQueryModifier('$orderby', { a: 1 })        // Set $orderby {a:1}
        // collection.find({}).max(10)                                    // Set the cursor max
        // collection.find({}).maxTimeMS(1000)                            // Set the cursor maxTimeMS
        // collection.find({}).min(100)                                   // Set the cursor min
        // collection.find({}).returnKey(10)                              // Set the cursor returnKey
        // collection.find({}).setReadPreference(ReadPreference.PRIMARY)  // Set the cursor readPreference
        // collection.find({}).showRecordId(true)                         // Set the cursor showRecordId
        // collection.find({}).sort([['a', 1]])                           // Sets the sort order of the cursor query
        // collection.find({}).hint('a_1')                                // Set the cursor hint

        resolve(await items.toArray());
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function getById(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        // findOne executes IMMEDIATELY - don't need toArray()
        // we imported ObjectID from driver to convert string into OBJ ID
        const item = await db
          .collection("newspapers")
          .findOne({ _id: ObjectID(id) });

        resolve(item);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function add(item) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        const addedItem = await db.collection("newspapers").insertOne(item);
        // returning specifically first item: ops[0] - otherwise lots of data
        resolve(addedItem.ops[0]);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function update(id, newItem) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        const updatedItem = await db
          .collection("newspapers")
          .findOneAndReplace({ _id: ObjectID(id) }, newItem, {
            returnOriginal: false,
          });
        // will return the OLD item from findOne! unless set extra params returnOriginal: false
        resolve(updatedItem.value);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  function remove(id) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);
        // can delete ONE or MANY via query
        const removed = await db
          .collection("newspapers")
          .deleteOne({ _id: ObjectID(id) });
        resolve(removed.deletedCount === 1); // count of the deleted >> BOOL for Assert
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

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
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  // aggregation pipeline
  function averageFinalists() {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        // aggregate takes an array of steps
        // returns a cursor
        // _id: null means group by everything - put it all together
        // avgFinalists is the new key
        // $avg is an operator
        // - use $ before COLUMN name we are averaging
        const average = await db
          .collection("newspapers")
          .aggregate([
            {
              $group: {
                _id: null,
                avgFinalists: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();
        // - toArray is async so added there

        resolve(await average[0].avgFinalists); // rets an array - get 1st one and only ave
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Cals correlation with another field
  function averageFinalistsByChange() {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        // 2 steps
        // $project - allows to modify contents - { what will hold onto }
        //    :1 means keep where it is
        // $cond allows an IF statement
        const average = await db
          .collection("newspapers")
          .aggregate([
            {
              $project: {
                Newspaper: 1, // no need
                "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                "Change in Daily Circulation, 2004-2013": 1, // no need
                overallChange: {
                  $cond: {
                    if: {
                      $gte: ["$Change in Daily Circulation, 2004-2013", 0],
                    },
                    then: "positive",
                    else: "negative"
                  },
                },
              },
            },

            // Second phase:
            // I want to group it by overallChange
            // _id is not ID - it's an accumulator object
            // Results: Ave finalists: [
            //    { _id: 'negative', avgFinalists: 12.818181818181818 },
            //    { _id: 'positive', avgFinalists: 31.5 } ]
            {
              $group: {
                _id: "$overallChange",
                avgFinalists: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();

        resolve(await average); // rets an array - get 1st one and only ave
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  }

  return {
    loadData,
    get,
    getById,
    add,
    update,
    remove,
    averageFinalists,
    averageFinalistsByChange,
  };
}
// will auto execute / return obj
module.exports = circulationRepo();
