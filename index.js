const express = require("express");
const app = express();
const randstring = require("crypto-random-string");

const sqliteManager = require("./sqliteManager");
const { Router } = require("express");

app.use(express.json());
app.use(require("cookie-parser")());

var session = {};

sqliteManager
  .prepare()
  .then((db) => {
    app.get("/", (req, res) => {
      res.status(200).send();
    });

    app.post("/signup", (req, res) => {
      var id = req.body.id;
      var pw = req.body.pw;

      if (id == undefined || pw == undefined) {
        res.status(400).send();
      } else {
        db.get(
          `
                INSERT INTO user(id,pw) VALUES ("${id}","${pw}")
            `,
          (err, rows) => {
            if (err) {
              console.log(err);
              res.status(404).send();
            } else {
              console.log(rows);
              res.status(201).send();
            }
          }
        );
      }
    });

    app.post("/signin", (req, res) => {
      var id = req.body.id;
      var pw = req.body.pw;

      if (id == undefined || pw == undefined) {
        res.status(400).send(rows);
      } else {
        db.get(
          `
                    SELECT * FROM (SELECT * FROM user WHERE id = "${id}") u WHERE u.pw = "${pw}"
                `,
          (err, rows) => {
            
            if (err || rows == undefined) {
              console.log(err);
              res.status(404).send();
            } else {
              
              var cookie = randstring({
                length: 24,
                type: "url-safe",
              });
              var anHourLater = new Date(Date.now() + 60 * 60 * 1000);

              session[id] = {
                cookie: cookie,
                expires: anHourLater,
              };

              res
                .cookie("session", cookie, {
                  domain: "localhost",
                  expires: anHourLater,
                })
                .status(201)
                .send();
            }
          }
        );
      }
    });

    var boardArea = new Router();

    app.use(boardArea);
    boardArea.use(sessionMiddle);
    boardArea.post("/board", (req, res) => {
      var id = req.body.id;
      var title = req.body.title;
      var head = req.body.head;
      var main = req.body.main;
      console.log(id, title, main);
      if ([id, title, main].includes(undefined)) {
        res.status(400).send();
      } else {
        db.get(
          `
                INSERT INTO board(title,head,main,time,author) VALUES ("${title}","${head}","${main}",datetime('now','localtime'),"${id}")
            `,
          (err, rows) => {
            if (err) {
              console.log(err);
              res.status(404).send();
            } else {
              console.log(rows);
              res.status(201).send(rows);
            }
          }
        );
      }
    });

    boardArea.get("/board", (req, res) => {
      var id = req.query.id;
      var page = req.query.page ?? 1;
      var size = req.query.size ?? 10;

      
      db.all(
        `
                SELECT * FROM board WHERE num <= (SELECT num FROM board ORDER BY num DESC LIMIT 1) - ${
                  (page - 1) * size
                } ORDER BY num DESC limit ${size}  
            `,
        (err, rows) => {
          if (err) {
            console.log(err);
            res.status(404).send();
          } else {
            console.log(rows);
            res.status(200).send(rows);
          }
        }
      );
    });

    boardArea.delete("/board", (req, res) => {
      var id = req.query.id;
      var num = req.query.num;

      if (num == undefined) {
        res.status(400).send();
      } else {
        db.get(
          `
                SELECT author FROM board WHERE num = ${num}
            `,
          (err, rows) => {
            if (err) {
              console.log(err);
              res.status(404).send();
            } else {
              console.log(rows);

              if (rows == undefined) {
                res.status(404).send();
              } else {
                db.run(`DELETE FROM board WHERE num = ${num}`);
                res.status(202).send();
              }
            }
          }
        );
      }
    });

    boardArea.put("/board", (req, res) => {
      var id = req.body.id;
      var num = req.body.num;
      var change = req.body.change;

      if ([num, change].includes(undefined)) {
        res.status(400).send();
      } else {
        db.get(
          `
            SELECT author FROM board WHERE num = ${num}
        `,
          (err, rows) => {
            if (err) {
              console.log(err);
              res.status(404).send();
            } else {
              console.log(rows);

              if (rows == undefined) {
                res.status(404).send();
              } else {
                var update = ``;

                if(change.title != undefined){
                    update = update.concat(`,title = "${change.title}"`)
                }
                
                if(change.head != undefined){
                    update = update.concat(`,head = "${change.head}"`)
                }

                if(change.main != undefined){
                    update = update.concat(`,main = "${change.main}"`)
                }
                update = update.replace(",","")



                var query = `UPDATE board SET ${update} WHERE num = ${num}`;

                db.get(query, (err, rows) => {
                  if (err) {
                    console.log(err);
                    res.status(404).send();
                  } else {
                    console.log(rows);
                    res.status(202).send(rows);
                  }
                });
                
              }
            }
          }
        );
      }
    });

    app.listen(8000, () => {
      console.log("server on");
    });
  })
  .catch((err) => {
    console.log(err);
  });

function sessionMiddle(req, res, next) {
    var id;
    if (req.method == "GET" || req.method == "DELETE"){
        id = req.query.id
    } else {
        id = req.body.id
    }
  
  if (id == undefined) {
    res.status(401).send();
  } else {
    var clientCookie = undefined;
    if (req.cookies != undefined) clientCookie = req.cookies.session;

    var serverCookie = session[id];

    if (
      serverCookie != undefined &&
      clientCookie == serverCookie.cookie &&
      serverCookie.expires >= new Date()
    ) {
      next();
    } else {
      res.status(401).send();
    }
  }
}
