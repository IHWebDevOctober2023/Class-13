const express = require("express");

const server = express();

// 1. require the body-parser
const bodyParser = require('body-parser');
// 2. let know your app you will be using it
server.use(bodyParser.urlencoded({ extended: true }));


const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const Recipe = require("./models/Recipe.model");

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to mongo"))

const hbs = require("hbs");
const path = require("path")

server.set("views", path.join(__dirname, "/views"));
server.set("view engine", "hbs");

// QUERY IN THE URL
// Something placed in the URL after a question mark "?"
server.get("/", (req, res) => {
    const age = req.query.age; // we get the query from the URL /?username=maria&age=25
    const username = req.query.username;
    res.send(`This user ${username} is ${age} years old`).status(200);
})

server.get("/form", (req, res) => {
    res.render("form")
})

server.get("/search", (req, res) => {
    // in this route we are going to search for a recipe by title
    const recipeTitle = req.query.searchTitle;
    // The regex is a regular expression that allows us to search for a string in a text
    Recipe.find({ title: { $regex: new RegExp(recipeTitle, "i") } })
        .then((recipe) => {
            console.log(recipe);
            const recipeResult = recipe[0];
            res.render("results", recipeResult);
        })
        .catch((error) => console.log(error))

})

// We render the form to create a new recipe here:
server.get("/post-form", (req, res) => {
    res.render("post-form");
})


// CREATING A MIDDLEWARE
// use the middleware everywhere:
// server.use(myFirstMiddleWare)

const myFirstMiddleWare = (req, res, next) => {
    if (req.body.ingredients.includes("nata")) {
        res.render("errorPage")
    }
    next();
}

// if we want to use the middleware only in some routes we add it as a second argument:
server.post("/recipe", myFirstMiddleWare, (req, res) => {

    const newRecipe = req.body;

    // split the ingredients string into an array
    newRecipe.ingredients = newRecipe.ingredients.split(", ")

    Recipe.create(newRecipe)
        .then((recipeResult) => {
            console.log(recipeResult);
            res.render("results", recipeResult);
        })
        .catch((error) => console.log(error))
})

server.listen(3000, () => console.log("Listening to port 3000..."));