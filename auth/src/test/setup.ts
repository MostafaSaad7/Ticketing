import mongoose, { Collection, mongo } from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server"
import { app } from "../app";
let mongo:any;
beforeAll(async ()=>{
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    console.log(mongoUri);
    await mongoose.connect(mongoUri, {});

});


beforeEach(async ()=>{


    const collections = await mongoose.connection.db.collections();

    for(let collection of collections)
    {
        await collection.deleteMany({});
    }



});
afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});