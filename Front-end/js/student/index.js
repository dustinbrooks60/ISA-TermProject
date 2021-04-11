'use strict';


/* Retrieves all the quizzes */
const getQuizzes = () => {
  const req = new XMLHttpRequest();



  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/get`);
  req2.send();


  req.open('GET', 'https://comp4537-assignment-server.herokuapp.com/quizzes', true);
  req.send();
  req.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      buildQuizList(JSON.parse(this.response));
    }
  }
};



/* Renders the quizzes as buttons that lead to their specific edit page. */
const buildQuizList = (quizArray) => {
  const quizList = document.getElementById('listOfQuizzes');

  while (quizList.hasChildNodes()) {
    quizList.removeChild(quizList.lastChild);
  }

  quizArray.forEach(quiz => {

    const button = document.createElement('button');
    button.id = quiz.quizId;
    button.textContent = quiz.name;
    button.classList.add('btn', 'btn-primary', 'btn-quiz');
    button.addEventListener('click', () => {
      const current_url = new URL(window.location);
      current_url.pathname = '/COMP4537/assignments/1/quiz/html/student/quiz.html';
      current_url.search = `quizId=${quiz.quizId}`;
      window.location.href = current_url;

    });

    quizList.appendChild(button);
  });
};


/* Initialize the page */
const initializePage = () => {
  getQuizzes();
};

initializePage();
