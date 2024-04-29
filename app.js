require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();

app.use(express.json());
app.use(express.static(__dirname + "/public"));

const {
    MONGO_DB_HOSTNAME = 'localhost',
    MONGO_DB_PORT = '27017',
    MONGO_DB = 'yourDatabaseName'
} = process.env;

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};

const url = `mongodb://${MONGO_DB_HOSTNAME}:${MONGO_DB_PORT}/${MONGO_DB}`;

const userSchema = new Schema({ name: String, surname: String, age: Number }, { versionKey: false });
const User = mongoose.model("User", userSchema);

mongoose.connect(url, options)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
        app.listen(3000, () => {
            console.log("Server is listening on port 3000...");
        });
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });

// API endpoints
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving users from the database.");
    }
});

app.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found.");
        }
        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving user.");
    }
});

app.post("/api/users", async (req, res) => {
    if (!req.body.name || !req.body.surname || req.body.age === undefined) {
        return res.sendStatus(400);
    }

    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        age: req.body.age
    });

    try {
        const newUser = await user.save();
        res.status(201).send(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding new user.");
    }
});

app.delete("/api/users/:id", async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send("User not found.");
        }
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user.");
    }
});

app.put("/api/users/:id", async (req, res) => {
    if (!req.body.name && !req.body.surname && req.body.age === undefined) {
        return res.sendStatus(400);
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                surname: req.body.surname,
                age: req.body.age
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("User not found.");
        }
        res.send(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user.");
    }
});