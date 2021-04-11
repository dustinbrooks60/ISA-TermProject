'use strict';

const POSSIBLE_OPTIONS = ['A', 'B', 'C', 'D'];

/* Create the page from the questions, quiz name, and choices */
const createPage = (questionsArray, quizName, choicesArray) => {

  const quizNameText = document.getElementById('quiz-name');
  const questionList = document.getElementById('list-of-questions');

  quizNameText.innerText = quizName;
  const groupedChoiceArr = groupBy(choicesArray, 'questionId');
  console.log(groupedChoiceArr);

  questionsArray.forEach(question => {
    const questionsGrouped = groupedChoiceArr[question.questionId];

    const questionBody = document.createElement('H3');

    console.log(question.questionBody);
    questionBody.innerHTML = question.questionBody;

    const questionHolder = document.createElement('div');
    questionHolder.classList.add('question-holder');
    questionHolder.appendChild(questionBody);

    questionsGrouped.forEach(choice => {
      const new_radio = document.createElement('input');
      new_radio.type = 'radio';
      new_radio.name = question.questionId;

      const new_label = document.createElement('label');
      new_label.innerText = choice.choiceBody;

      const choices_container = document.createElement('div');
      choices_container.append(new_radio, new_label);

      questionHolder.appendChild(choices_container);
    });

    questionList.appendChild(questionHolder);
  });
};



/* Retrieves the answers from the given questions array */
const retrieveAnswers = (questionsArray) => {

  const answers = [];

  questionsArray.forEach(q => {
    answers.push({
      questionId: q.questionId,
      answer: q.answer
    });
  });

  return answers;
};



/* Retrieves the score from the correct answers and displays it to the user */
const retrieveScore = (answersArray) => {

  let correct = 0;

  answersArray.forEach(answer => {
    const radio_buttons = document.getElementsByName(answer.questionId);

    for (let i = 0; i < radio_buttons.length; ++i) {
      if (radio_buttons[i].checked && POSSIBLE_OPTIONS[i] === answer.answer) {
        correct++;
        break;
      }
    }
  });

  let calculatedScore = (correct / answersArray.length * 100);
  alert('Your score for the quiz was: ' + calculatedScore + '%');
};



/* Allows the data to be grouped by a specific key */
/* Example from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce */
const groupBy = (data, key) => {
  return data.reduce((acc, obj) => {
    let group = obj[key];
    delete obj[key];
    acc[group] = acc[group] || [];
    acc[group].push(obj);

    return acc;
  }, {});
};


/* Gets all the quizzes and their respective choices from the DB */
const getQuizzes = () => {
  const clientUrl = new URL(window.location);


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/get`);
  req2.send();



  const req = new XMLHttpRequest();

  req.open('GET',  `https://comp4537-assignment-server.herokuapp.com/admin/quizzes/${clientUrl.searchParams.get('quizId')}/questions`, true);
  req.send();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const questions = JSON.parse(this.responseText);
      req.open('GET', `https://comp4537-assignment-server.herokuapp.com/admin/quizzes/${clientUrl.searchParams.get('quizId')}/choices`, true);
      req.send();
      req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          createPage(questions.questionArr, questions.quizName, JSON.parse(this.responseText));
          const answers = retrieveAnswers(questions.questionArr);
          document.getElementById('submit-button').addEventListener('click', () => retrieveScore(answers));
        }
      }
    }
  }
};


/* Initialize the page */
const initializePage = () => {
  getQuizzes();
};

initializePage();
