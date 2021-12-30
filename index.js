const express = require("express");
const ip = require("ip");
const app = express();
//Database connection
const connection = require("./infra/db/database");
//models
const Question = require("./infra/db/models/Question");
const Answers = require("./infra/db/models/Answers");

connection
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database connection error");
  });

require("dotenv").config();

//parser for requests
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

//use the ejs engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//use express router
app.get("/", (req, res) => {
  Question.findAll({
    raw: true,
    order: [["id", "DESC"]],
  })
    .then((questions) => {
      res.render("home/index", {
        questions: questions,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/question", (req, res) => {
  res.render("question/index");
});

app.get("/question/:id", (req, res) => {
  const id = req.params.id;
  Question.findByPk(id)
    .then((question) => {
      if (question != undefined) {
        Answers.findAll({
          where: {
            questionId: id,
          },
          raw: true,
          order: [["id", "DESC"]],
        })
          .then((answers) => {
            res.render("question/question", {
              question: question,
              answers: answers,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/savequestion", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  Question.create({
    title: title,
    description: description,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/saveanswer", (req, res) => {
  const body = req.body.body;
  const questionId = req.body.questionId;
  console.log(questionId);
  Answers.create({
    body: body,
    questionId: questionId,
  })
    .then(() => {
      res.redirect(`/question/${questionId}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(8080, () => {
  console.log(`server running in
          http://${ip.address()}:8080`);
});
