var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");


// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://cinemassacre.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("li.blogentry").each(function (i, element) {
            // Save an empty result object
            var results = {};

            results.title = $(this).find("h2").find("a").text();
            results.link = $(this).find("h2").find("a").attr("href");
            results.excerpt = $(this).find("p.excerpt").text();

            // Create a new Article using the `result` object built from scraping
            db.Article.create(results)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
    })

});

app.get("/", function (req, res) {
    db.Article.find({ saved: false })
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.render("index",
                {
                    datos: dbArticle
                });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/article/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.update({ _id: req.params.id }, {saved: true}, function (err, dbArticle) {
        res.json(dbArticle);
    });
});


app.get("/savedArticles", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.render("savedArticles",
                {
                    datos: dbArticle
                });
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});







var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
