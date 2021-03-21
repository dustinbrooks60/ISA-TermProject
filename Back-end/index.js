'use strict';

const express = require('express');
const mysql = require('mysql');

const app = express();

const PORT = process.env.PORT || 8000;


app.all('*', (req, res, next) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if ('OPTIONS' == req.method) {
        return res.sendStatus(200);
    }

    next(); // pass control to the next handler
});


/* createPool needs to be used here instead of createConnection */
const db = mysql.createPool({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'be776713a84c7d',
    password: '8842366d',
    database: 'heroku_f0fa7c6a57f4378',
    multipleStatements: true
});



/* Dropping Tables */
// let dropTables = `SET FOREIGN_KEY_CHECKS = 0;
// drop table if exists quiz;
// drop table if exists question;
// drop table if exists choice;
// SET FOREIGN_KEY_CHECKS = 1;`;
//
// db.query(dropTables, function(err, results, fields) {
//     if (err) {
//         console.log(err.message);
//     }
// });






/* Creating appropriate tables */
let createQuizTable = `CREATE TABLE if not exists quiz (
  quizId INTEGER(10) NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (quizId))`;

db.query(createQuizTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});



let createQuestionTable = `CREATE TABLE if not exists question (
  questionId INTEGER(10) NOT NULL AUTO_INCREMENT,
  quizId INTEGER(10) NOT NULL,
  answer VARCHAR(1) NOT NULL,
  questionBody VARCHAR(300) NOT NULL,
  PRIMARY KEY (questionId),
  KEY question_FK (quizId),
  CONSTRAINT question_FK FOREIGN KEY (quizId) REFERENCES quiz (quizId))`;

db.query(createQuestionTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});




let createChoiceTable = `CREATE TABLE if not exists choice (
  choiceId INTEGER(10) NOT NULL AUTO_INCREMENT,
  questionId INTEGER(10) NOT NULL,
  choice VARCHAR(1) NOT NULL,
  choiceBody VARCHAR(300) NOT NULL,
  PRIMARY KEY (choiceId),
  KEY choice_FK (questionId),
  CONSTRAINT choice_FK FOREIGN KEY (questionId) REFERENCES question (questionId))`;

db.query(createChoiceTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});





/* Creates a new quiz in the DB with a specific quiz name */
app.post('/admin/quizzes', (req, res) => {

    let quizName = '';

    req.on('data', data => {
        quizName += data;
    });

    req.on('end', () => {

        db.query('INSERT INTO quiz (name) VALUES (?)', [quizName], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }

            res.end();
        });
    });

});




/* Returns all the quizzes stored in the DB */
app.get('/quizzes', (req, res) => {
    db.query('SELECT * FROM quiz', (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }

        const quizzes = [];
        results.forEach(quiz => {
            quizzes.push({
                quizId: quiz.quizId,
                name: quiz.name
            });
        });

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(quizzes));
    });
});




/* Gets the choices for a quiz based on the quizId */
app.get('/admin/quizzes/:quizId/choices', (req, res) => {

    db.query(`SELECT q.questionId, c.choiceId, c.choiceBody, c.choice FROM quiz fullQuestion JOIN question q ON fullQuestion.quizId = q.quizId JOIN choice c ON q.questionId = c.questionId ` +
        `WHERE fullQuestion.quizId = ${req.params.quizId} ORDER BY q.questionId`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }

        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(results));
    });
});




/* Gets the questions for a quiz based on the ID given */
app.get('/admin/quizzes/:quizId/questions', (req, res) => {

    db.query( `SELECT name FROM quiz WHERE quizId = ${req.params.quizId}` + ';' +
        `SELECT questionId, questionBody, answer FROM question WHERE quizId = ${req.params.quizId}`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }



        const questions = [];

        results[1].forEach(question => {
            questions.push({
                questionId: question.questionId,
                questionBody: question.questionBody,
                answer: question.answer
            });
        });

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify({quizName: results[0][0].name, questionArr: questions}));
    });
});







/* Puts a new question into the DB */
app.post('/admin/quizzes/:quizId', (req, res) => {

    let body = '';

    req.on('data', data => {
        body += data;
    });


    req.on('end', () => {
        const question = JSON.parse(body);

        db.query(`INSERT INTO question (quizId, answer, questionBody) VALUES (?, ?, ?)`, [req.params.quizId, question.answer, question.questionBody], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }

            let choice_query = 'INSERT INTO choice (questionId, choice, choiceBody) VALUES ';

            for (let i = 0; i < question.choices.length; i++) {
                choice_query += `(${results.insertId}, '${question.choices[i].choice}', '${question.choices[i].choiceBody}')`;

                if (i !== question.choices.length - 1) {
                    choice_query += ',';
                }
            }

            db.query(choice_query, (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log(results);
                res.set('Content-Type', 'text/text');
                res.send('Question added successfully.');
            });
        });
    });
});



/* Updating a question */
app.put('/admin/question/:questionId', (req, res) => {

    let body = '';
    req.on('data', data => {
        body += data;
    });

    req.on('end', () => {
        const question = JSON.parse(body);

        // Updates the question body in the question table
        db.query(`UPDATE question SET questionBody = ?, answer = ? WHERE questionId = ?`, [question.questionBody, question.answer, question.questionId], (err, results) => {
            if (err) {
                console.log(err);
                throw er;
            }

            for (let i = 0; i < question.choices.length; ++i) {
                const choice = question.choices[i];
                db.query(`UPDATE choice SET choiceBody=?, choice = ? WHERE choiceId = ?`, [choice.choiceBody, choice.choice, choice.choiceId], (err, results) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    if (i === question.choices.length - 1) {
                        res.send("Question was updated!");
                    }
                });
            }
        });
    });
});






/* Deleting a question */
// app.delete('/admin/question/:questionId', (req, res) => {
//
//     let body = '';
//     req.on('data', data => {
//         body += data;
//     });
//
//     req.on('end', () => {
//         const question = JSON.parse(body);
//
//         db.query(`DELETE FROM question WHERE questionId = ?`, [question.questionId], (err, results) => {
//             if (err) {
//                 console.log(err);
//                 throw err;
//             }
//
//             res.send("Question was deleted!");
//
//
//         });
//     });
// });







app.listen(PORT, () => {
    console.log("Server is listening on " + PORT);
});