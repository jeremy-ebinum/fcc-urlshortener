require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const btoa = require("btoa");
const atob = require("atob");

// db model
const URL = require("./models/URL");

// Basic Configuration
const { PORT, DB_URI } = process.env;

const app = express();

/** this project needs a db !! * */
// mongoose.connect(process.env.DB_URI);
console.log("connecting to", DB_URI);
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to MongoDB");
    URL.deleteMany({}, () => console.log("URL collection removed"));
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

app.use(cors());

/** this project needs to parse POST bodies * */
// you should mount the body-parser here

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// your first API endpoint...
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", (req, res) => {
  const { url: reqUrl } = req.body;

  if (!validUrl.isUri(reqUrl)) {
    res.json({ error: "invalid URL" });
  } else {
    URL.findOne({ original_url: reqUrl }, (err, doc) => {
      if (doc) {
        console.log("url found in db");

        res.send({
          original_url: reqUrl,
          short_url: btoa(doc._id),
          created_at: doc.created_at,
        });
      } else {
        console.log("url NOT found in db, saving new");

        const url = new URL({
          original_url: reqUrl,
        });

        url.save().then((savedUrl) => {
          res.send({
            original_url: reqUrl,
            short_url: btoa(savedUrl._id),
            created_at: savedUrl.created_at,
          });
        });
      }
    });
  }
});

app.get("/api/shorturl/:hash", (req, res) => {
  const { hash: baseid } = req.params;
  const id = atob(baseid);

  URL.findOne({ _id: id }, (err, doc) => {
    if (doc) {
      res.redirect(doc.original_url);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(PORT || 3000, () => {
  console.log(`Server is running on port ${PORT}`);
});
