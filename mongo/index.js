const express = require("express");
const { connectionDB } = require("./mongo");

const url = "mongodb+srv://raihanregitappqita:R4ihanregita@ppqitadb.ebdkl0n.mongodb.net/";

let myCollection, myClient;

const initDB = async () => {
    try {
        const { collection, client } = await connectionDB(
            url,
            "portal-siswa",
            "users"
        );
        myCollection = collection;
        myClient = client;
        console.log("server db berjalan");
    } catch (error) {
        console.log(error);
    }
};
initDB();

const app = express();

app.listen(3000, () => {
    console.log("Halo cuyy, Server sudah jalan di http://localhost:3000");
});
