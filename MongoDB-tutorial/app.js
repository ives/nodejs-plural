// same as:  const MongoClient = require("mongodb").MongoClient;
const { MongoClient } = require("mongodb");

// Docs:
// http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html
// https://docs.mongodb.com/manual/tutorial/query-documents/

// https://nodejs.org/api/assert.html
const assert = require("assert");

const circulationRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");

// admin / inspect

const url = "mongodb://localhost:27017";
const dbName = "circulation";

const main = async () => {
  const client = new MongoClient(url);
  await client.connect();

  try {
    const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    console.log(results.insertedCount);
    // console.log(results.ops); // actual JSON data from exec - newly added _id

    // Simple GET
    const getData = await circulationRepo.get();
    assert.equal(data.length, getData.length);

    // Filter data - pluck entry #4
    const filterData = await circulationRepo.get({Newspaper: getData[4].Newspaper});
    // deepEqual to compare objects contents, else see as different obj
    assert.deepEqual(filterData[0], getData[4]);

    // Limit - return all but LIMIT by 3
    const limitData = await circulationRepo.get({}, 3);
    assert.deepEqual(limitData.length, 3);

    // Get by ID - returns item / obj - single item
    const id = getData[4]._id.toString(); // else of OBJ type
    const byId = await circulationRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    // Add item
    const newItem = {
      Newspaper: "Ives journal",
      "Daily Circulation, 2004": 234,
      "Daily Circulation, 2013": 234543,
      "Change in Daily Circulation, 2004-2013": 433,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 3,
    };
    const addedItem = await circulationRepo.add(newItem);
    assert(addedItem._id); // see if exists
    // check: 
    const addedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.deepEqual(addedItemQuery, newItem);


    // UPDATE
    const newItemForUpdate = {
      Newspaper: "Ives NEW journal #2",
      "Daily Circulation, 2004": 234,
      "Daily Circulation, 2013": 234543,
      "Change in Daily Circulation, 2004-2013": 433,
      "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
      "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
      "Pulitzer Prize Winners and Finalists, 1990-2014": 3,
    };
    const updatedItem = await circulationRepo.update(addedItem._id, newItemForUpdate);
    // updatedItem will return the OLD item from findOne!  unless set extra params returnOriginal: false
    assert.equal(updatedItem.Newspaper, "Ives NEW journal #2"); 
    // check: 
    const newAddedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.equal(newAddedItemQuery.Newspaper, "Ives NEW journal #2"); 

    // REMOVE
    const removed = await circulationRepo.remove(addedItem._id);
    assert(removed); // true
    // check: 
    const deletedItem = await circulationRepo.getById(addedItem._id);
    assert.equal(deletedItem, null);

    // Aggregation pipeline
    const avgFinalists = await circulationRepo.averageFinalists();
    console.log('Ave finalists:', avgFinalists);

    const avgByChange = await circulationRepo.averageFinalistsByChange();
    console.log('Ave finalists:', avgByChange);

  } catch (error) {
    console.log(error);
  } finally {
    // we are able to connect to a db even if doesn't exist yet
    // DBs are created on the fly
    const admin = client.db(dbName).admin();
    // console.log(await admin.serverStatus());

    // clean: DROP db - pristine every time for this proj

    await client.db(dbName).dropDatabase();

    console.log(await admin.listDatabases());

    client.close();
  }
};

main();
