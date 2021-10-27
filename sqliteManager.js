const sqlite3 = require("sqlite3").verbose();

function prepare() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(":memory:",(err)=>{
        prepareUser(db)
        .then( ()=> {
            prepareBoard(db)
            .then(()=>{
                resolve(db)
            })
            .catch(err => {
                reject(err)
            })
        })
        .catch(err => {
            reject(err)
        })
    })

    
  });
}

function prepareUser(db) {
  return new Promise((resolve, reject) => {
    db.get(
      `CREATE TABLE user
                  (
                      id VARCHAR(64) NOT NULL,
                      pw VARCHAR(64) NOT NULL,                    
                      PRIMARY KEY (id)
                  )`,
      (err, rows) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(rows);
          resolve(db);
        }
      }
    );
  });
}

function prepareBoard(db, callback) {
  return new Promise((resolve, reject) => {
    db.get(
      `CREATE TABLE board 
              (
                  title VARCHAR(256) NOT NULL, 
                  head VARCHAR(64), 
                  main TEXT NOT NULL, 
                  num INTEGER PRIMARY KEY AUTOINCREMENT, 
                  time DATE NOT NULL, 
                  author VARCHAR(64) NOT NULL
                  
              )`,
      (err, rows) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(rows);
          resolve();
        }
      }
    );
  });
}

module.exports.prepare = prepare;
