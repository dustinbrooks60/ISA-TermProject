'use strict';

const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT || 8000;


const accessTokenSecret = 'ejcx8e67djg8347dh3';



app.all('*', (req, res, next) => {

    res.set('Access-Control-Allow-Origin', 'https://dustin-brooks-60.netlify.app/comp4537/assignments/1/index.html');
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
  KEY question_FK (quizId))`;

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
  KEY choice_FK (questionId))`;

db.query(createChoiceTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});




let createAdminTable = `CREATE TABLE if not exists admin (
  adminId INTEGER(10) NOT NULL AUTO_INCREMENT,
  adminUsername VARCHAR(100) NOT NULL,
  adminPassword VARCHAR(100) NOT NULL,
  PRIMARY KEY (adminId)
)`;

db.query(createAdminTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});






let createStudentTable = `CREATE TABLE if not exists student (
  studentId INTEGER(10) NOT NULL AUTO_INCREMENT,
  studentUsername VARCHAR(100) NOT NULL,
  studentPassword VARCHAR(100) NOT NULL,
  PRIMARY KEY (studentId)
)`;

db.query(createStudentTable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});





let createAPITable = `CREATE TABLE if not exists api (
  getRequests INTEGER(10) NOT NULL,
  postRequests INTEGER(10) NOT NULL,
  putRequests INTEGER(10) NOT NULL,
  deleteRequests INTEGER(10) NOT NULL
)`;

db.query(createAPITable, function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});





db.query('INSERT into api (getRequests, postRequests, putRequests, deleteRequests) VALUES (0, 0, 0, 0)', function(err, results, fields) {
    if (err) {
        console.log(err.message);
        throw err;
    }
});








/* Returns all the API counts in the DB */
app.get('/apiCount', (req, res) => {
    db.query('SELECT * FROM api', (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }


        res.set('Content-Type', 'text/plain');
        res.send(JSON.stringify(results));
    });
});




/* Updates the get API counts in the DB */
app.put('/apiCount/get', (req, res) => {
    db.query(`UPDATE api SET getRequests = getRequests + 1`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.end();
    });
});


/* Updates the post API counts in the DB */
app.put('/apiCount/post', (req, res) => {
    db.query(`UPDATE api SET postRequests = postRequests + 1`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.end();
    });
});


/* Updates the put API counts in the DB */
app.put('/apiCount/put', (req, res) => {
    db.query(`UPDATE api SET putRequests = putRequests + 1`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.end();
    });
});


/* Updates the delete API counts in the DB */
app.put('/apiCount/delete', (req, res) => {
    db.query(`UPDATE api SET deleteRequests = deleteRequests + 1`, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.end();
    });
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




/* Creates a new student in the DB with a specific username and password */
app.post('/students', (req, res) => {

    let studentObject = '';

    req.on('data', data => {
        studentObject += data;
    });

    req.on('end', () => {
        const student = JSON.parse(studentObject);
        db.query('INSERT INTO student (studentUsername, studentPassword) VALUES (?, ?)', [student.studentUsername, student.studentPassword], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }

            res.send("Student was added!");
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




/* Retrieves all the admins from the server */
app.get('/admins', (req, res) => {
    db.query('SELECT * FROM admin', (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }

        const admins = [];
        results.forEach(admin => {
            admins.push({
                adminId: admin.adminId,
                adminUsername: admin.adminUsername,
                adminPassword: admin.adminPassword
            });
        });

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(admins));
    });
});



/* Retrieves all the students from the server */
app.get('/students', (req, res) => {
    db.query('SELECT * FROM student', (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }

        const students = [];
        results.forEach(student => {
            students.push({
                studentId: student.studentId,
                studentUsername: student.studentUsername,
                studentPassword: student.studentPassword
            });
        });

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(students));
    });
});





/* Updating a student */
app.put('/students', (req, res) => {

    let body = '';
    req.on('data', data => {
        body += data;
    });

    req.on('end', () => {
        const student = JSON.parse(body);

        // Updates the question body in the question table
        db.query(`UPDATE student SET studentUsername = ?, studentPassword = ? WHERE studentId = ?`, [student.studentUsername, student.studentPassword, student.studentId], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }

        });

        res.send("Student was updated!");
    });
});



/* Deleting a student */
app.delete('/students/:studentId', (req, res) => {
    // Updates the question body in the question table
    db.query(`DELETE from student WHERE studentId = ?`, [req.params.studentId], (err, results) => {
        if (err) {
            console.log(err);
            throw err;
            }

        res.send("Student was deleted!");
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
                throw err;
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
app.delete('/admin/question/:questionId', (req, res) => {

    let body = '';
    req.on('data', data => {
        body += data;
    });

    req.on('end', () => {
        const question = JSON.parse(body);
        console.log(question);


        db.query(`SET FOREIGN_KEY_CHECKS=0;`, (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });



        for (let i = 0; i < question.choices.length; ++i) {
            const choice = question.choices[i];
            db.query(`DELETE FROM choice WHERE choiceId = ?`, [question.questionId], (err, results) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        }

        db.query(`DELETE FROM question WHERE questionID = ?`, [question.questionId], (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }
            else {
                res.send("Question was deleted!");
            }

        });


        db.query(`SET FOREIGN_KEY_CHECKS=1;`, (err, results) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });


    });
});







app.listen(PORT, () => {
    console.log("Server is listening on " + PORT);
});