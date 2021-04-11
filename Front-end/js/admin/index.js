'use strict';








/* Creates the list of quizzes and their respective update buttons */
const createListOfQuizzes = (quizArr) => {
  const quizList = document.getElementById('list-of-quizzes');

  /* Clear all children in the quizList */
  while(quizList.hasChildNodes()) {
    quizList.removeChild(quizList.lastChild);
  }

  quizArr.forEach(quiz => {

    const button = document.createElement('button');
    button.id = quiz.quizId;
    button.textContent = quiz.name;
    button.classList.add('btn', 'btn-primary', 'btn-quiz');

    button.addEventListener('click', () => {
      const current_url = new URL(window.location);
      current_url.pathname = '/comp4537/assignments/1/quiz/html/admin/adminEdit.html';
      current_url.search = `quizId=${quiz.quizId}`;
      window.location.href = current_url;
    });

    quizList.appendChild(button);
  });
};


/* Retrieves all the quizzes from the DB */
const retrieveAllQuizzes = () => {


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/get`);
  req2.send();



  const req = new XMLHttpRequest();

  req.open('GET', 'https://comp4537-assignment-server.herokuapp.com/quizzes', true);
  req.send();
  req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      createListOfQuizzes(JSON.parse(this.response));
    }
  }
};




/* Check if a quiz name already exists in the list of quizzes */
const uniqueQuizName = (quizName) => {
  const listOfQuizzes = document.getElementById('list-of-quizzes').children;

  for (const quiz of listOfQuizzes) {
    if (quiz.innerText.trim() === quizName) return true;
  }
  return false;
};



/* Creates a new quiz based on the given name. Name cannot be blank and must be unique */
const createQuiz = () => {

  const quizName = document.getElementById("quiz-name").value.trim();

  if (!quizName) {
    alert("Please enter a name for your quiz!");

  }
  else if (uniqueQuizName(quizName)) {
    alert("Please enter a unique quiz name!");

  }
  else {


    const req2 = new XMLHttpRequest();
    req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/post`);
    req2.send();



    const request = new XMLHttpRequest();

    request.open('POST', 'https://comp4537-assignment-server.herokuapp.com/admin/quizzes', true);
    request.setRequestHeader('Content-Type', 'text/text');
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        retrieveAllQuizzes();
        document.getElementById('quiz-name').value = '';
      }
    };

    request.send(quizName);
  }
};














/* Creates the list of students and their respective update buttons */
const createListOfStudents = (studentArr) => {
  const studentList = document.getElementById('list-of-students');

  /* Clear all children in the quizList */
  while(studentList.hasChildNodes()) {
    studentList.removeChild(studentList.lastChild);
  }

  studentArr.forEach(student => {

    const button = document.createElement('button');
    button.id = student.studentId;
    button.textContent = student.studentUsername;
    button.classList.add('btn', 'btn-primary', 'btn-quiz');

    button.addEventListener('click', () => {
      const current_url = new URL(window.location);
      current_url.pathname = '/comp4537/assignments/1/quiz/html/admin/studentEdit.html';
      current_url.search = `studentId=${student.studentId}`;
      window.location.href = current_url;
    });

    studentList.appendChild(button);
  });
};





/* Check if a quiz name already exists in the list of quizzes */
const uniqueStudentName = (studentName) => {
  const listOfStudents = document.getElementById('list-of-students').children;

  for (const student of listOfStudents) {
    if (student.innerText.trim() === studentName) return true;
  }
  return false;
};




/* Retrieves all the students from the DB */
const retrieveAllStudents = () => {


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/get`);
  req2.send();



  const req = new XMLHttpRequest();

  req.open('GET', 'https://comp4537-assignment-server.herokuapp.com/students', true);
  req.send();
  req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      createListOfStudents(JSON.parse(this.response));
    }
  }
};





/* Creates a new student based on the given name. Name cannot be blank and must be unique */
const createStudent = () => {

  const studentUsername = document.getElementById("student-username").value.trim();
  const studentPassword = document.getElementById("student-password").value.trim();

  if (!studentUsername || !studentPassword) {
    alert("Please enter a student name and password");
  }


  else if (uniqueStudentName(studentUsername)) {
    alert("Please enter a unique student name!");

  }
  else {


    const req2 = new XMLHttpRequest();
    req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/post`);
    req2.send();



    const request = new XMLHttpRequest();

    request.open('POST', 'https://comp4537-assignment-server.herokuapp.com/students', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        retrieveAllStudents();
        document.getElementById('student-username').value = '';
        document.getElementById('student-password').value = '';
      }
    };

    const new_student = {studentUsername: studentUsername, studentPassword: studentPassword};
    request.send(JSON.stringify(new_student));
  }
};





/* Initialize the page */
const initializePage = () => {
  document.getElementById("create-quiz-button").addEventListener('click', () => createQuiz());
  document.getElementById("create-student-button").addEventListener('click', () => createStudent());
  retrieveAllQuizzes();
  retrieveAllStudents()
};

initializePage();
