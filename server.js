const express = require("express");

const { connectionDB } = require("./mongodbGateway");

const uri =
    "mongodb+srv://raihanregitappqita:R4ihanregita@ppqitadb.ebdkl0n.mongodb.net/";

let myCollection, myClient;

const initDB = async () => {
    try {
        const { collection, client } = await connectionDB(
            uri,
            "portal_siswa",
            "log"
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

app.use(express.json());

app.get("/komentar", async (req, res) => {
    try {
        const comments = await myCollection
            .find({})
            .sort({ _id: -1 })
            .toArray();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/komentar", async (req, res) => {
    try {
        const { nama, komentar } = req.body;

        if (nama.length > 20 || komentar.length > 160) {
            return res.status(400).json({
                message:
                    "Nama maksimal 20 karakter dan komentar maksimal 160 karakter",
            });
        }

        const newComment = { nama, komentar };
        const result = await myCollection.insertOne(newComment);

        res.json(result.ops[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(3000, () => {
    console.log("server jalan di http://localhost:3000");
});
