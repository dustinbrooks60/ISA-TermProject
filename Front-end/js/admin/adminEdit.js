'use strict';

const POSSIBLE_OPTIONS = ['A', 'B', 'C', 'D'];


/* Creates a question and sends it to the server */
const submitQuestion = () => {

  const questionBody = document.getElementById('question-body').value.trim();
  if (!questionBody) {
    alert('Please enter a question before submitting!');
    return;
  }

  const choices = document.querySelectorAll(`.creator.option`);

  const choicesArray = [];

  for (let i = 0; i < choices.length; ++i) {
    const choiceBody = choices[i].value.trim();
    if (!choiceBody) {
      break;
    }
    else {
      choicesArray.push({
        choice: POSSIBLE_OPTIONS[i],
        choiceBody: choiceBody
      });
    }
  }


  if (choicesArray.length !== choices.length) {
    alert('Make sure that all the choices are filled in before submitting!');
    return;
  }

  // Search for the correct radio button
  const radios = document.getElementsByName('radio-answer');

  let answer;

  for (let i = 0; i < radios.length; ++i) {
    if (radios[i].checked) {
      answer = POSSIBLE_OPTIONS[i];
      break;
    }
  }

  if (!answer) {
    alert('Make sure that there is an answer selected!');
    return;
  }

  const question = {questionBody: questionBody, choices: choicesArray, answer: answer};

  const clientURL = new URL(window.location);
  const req = new XMLHttpRequest();

  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/post`);
  req2.send();


  req.open('POST', `https://comp4537-assignment-server.herokuapp.com/admin/quizzes/${clientURL.searchParams.get('quizId')}`);
  req.setRequestHeader('Content-Type', 'application/json');


  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      clearQuestions();
      alert(this.responseText);
      getAllQuizzes();
    }
  };

  req.send(JSON.stringify(question));




};




/* Sets the name of the quiz */
const setQuizName = (quizName) => {
  const quizNameText = document.getElementById('quiz-name').innerText;
  if (!quizNameText)
    document.getElementById('quiz-name').innerText = quizName;
};

const createOptionsButtons = () => {
  document.getElementById('add-button').disabled = document.getElementById('quiz-choices-container').children.length >= 4;
  document.getElementById('remove-button').disabled = document.getElementById('quiz-choices-container').children.length <= 2;
};



/* Adds a choice option and checks if another option can be added */
const addOption = () => {
  let choicesContainer = document.getElementById('quiz-choices-container');
  let numberOfChoices = choicesContainer.children.length;

  if (numberOfChoices < 4) {


    let text = document.createElement('input');
    text.type = 'text';
    text.classList.add('creator', 'option', 'form-control');

    let radio = document.createElement('input');
    radio.id = POSSIBLE_OPTIONS[numberOfChoices];
    radio.type = 'radio';
    radio.name = 'radio-answer';

    let choiceContainer = document.createElement('div');
    choiceContainer.append(radio, text);

    choicesContainer.appendChild(choiceContainer);

    createOptionsButtons()
  }
};




/* Removes a choice option and checks if another option can be removed */
const removeOption = () => {
  let choicesContainer = document.getElementById('quiz-choices-container');
  choicesContainer.children[choicesContainer.children.length - 1].remove();

  createOptionsButtons()
};






/* Clears the question creator box and all radio buttons */
const clearQuestions = () => {
  document.getElementById('question-body').value = '';
  const allChoices = document.querySelectorAll(`.creator.option`);
  for (const choice of allChoices) {
    choice.value = '';
  }

  const allRadios = document.getElementsByName('radio-answer');
  for (const radio of allRadios) {
    if (radio.checked) {
      radio.checked = false;
      break;
    }
  }
};





/* Creates the questions page with the appropriate quiz name and questions */
const createQuestionsPage = (quizName, questionList, choiceList) => {
  setQuizName(quizName);
  const questionArea = document.getElementById('question-area');
  const groupedChoiceList = groupBy(choiceList, 'questionId');

  /* Clear question area children */
  while(questionArea.hasChildNodes()) {
    questionArea.removeChild(questionArea.lastChild);
  }

  questionList.forEach(question => {
    questionArea.append(createQuestion(question, groupedChoiceList[question.questionId]));
  });
};







/* Get all of the quizzes and choices from the server and create the questions page from the responses */
const getAllQuizzes = () => {
  const clientURL = new URL(window.location);

  const req = new XMLHttpRequest();


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/get`);
  req2.send();



  req.open('GET', `https://comp4537-assignment-server.herokuapp.com/admin/quizzes/${clientURL.searchParams.get('quizId')}/questions`, true);
  req.send();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const questions = JSON.parse(this.responseText);


      req.open('GET', `https://comp4537-assignment-server.herokuapp.com/admin/quizzes/${clientURL.searchParams.get('quizId')}/choices`, true);
      req.send();
      req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          const choices = JSON.parse(this.responseText);
          createQuestionsPage(questions.quizName, questions.questionArr, choices);
        }
      }
    }
  }
};








/* Creates a question and adds it to the DOM */
const createQuestion = (questionObj, choicesList) => {

  const choices_container = document.createElement('div');
  choices_container.id = 'choices_' + questionObj.questionId;
  choices_container.classList.add('choices');
  choicesList.forEach(choice => {


    const radio_button = document.createElement('input');
    radio_button.type = 'radio';
    radio_button.name = questionObj.questionId;

    if (questionObj.answer === choice.choice)
      radio_button.checked = true;


    const text_box = document.createElement('input');
    text_box.classList.add('choice', 'form-control', choice.choiceId);
    text_box.type = 'text';
    text_box.value = choice.choiceBody;

    const div_container = document.createElement('div');
    div_container.append(radio_button, text_box);


    choices_container.appendChild(div_container);
  });


  const questionBody = document.createElement('textarea');
  questionBody.classList.add('form-control');
  questionBody.id = 'question_' + questionObj.questionId;
  questionBody.value = questionObj.questionBody;


  const updateButton = document.createElement('button');
  updateButton.classList.add(questionObj.questionId);
  updateButton.innerText = 'Update Question';
  updateButton.addEventListener('click', () => updateQuestion(questionObj, choicesList));

  const deleteButton = document.createElement('button');
  deleteButton.classList.add(questionObj.questionId);
  deleteButton.innerText = 'Delete Question';
  deleteButton.addEventListener('click', () => deleteQuestion(questionObj, choicesList));


  const individualQuestionContainer = document.createElement('div');
  individualQuestionContainer.classList.add('question-container');

  individualQuestionContainer.append(questionBody, choices_container, updateButton, deleteButton);

  return individualQuestionContainer;
};




/* Updates the question in the DB */
const updateQuestion = (questionObject, choicesArr) => {

  const questionBody = document.getElementById('question_' + questionObject.questionId).value.trim();
  if (!questionBody) {
    alert('Question body cannot be empty');
    return;
  }


  const radios = document.getElementsByName(questionObject.questionId);

  let answer;

  for (let i = 0; i < radios.length; ++i) {
    if (radios[i].checked) {
      answer = POSSIBLE_OPTIONS[i];
      break;
    }
  }

  if (!answer) {
    alert('Make sure an answer is selected!');
    return;
  }

  const choices = [];
  choicesArr.forEach((choice, i) => {
    const textNode = document.getElementById('choices_' + questionObject.questionId).getElementsByClassName(choice.choiceId);
    if (!textNode[0].value.trim()) {
      alert("Choice cannot be empty, try again!");
      return;
    }
    choices.push({
      choiceId: choice.choiceId,
      choice: POSSIBLE_OPTIONS[i],
      choiceBody: textNode[0].value});
  });

  const question = {questionId: questionObject.questionId, questionBody: questionBody, choices: choices, answer: answer};


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/put`);
  req2.send();



  const req = new XMLHttpRequest();
  req.open('PUT', `https://comp4537-assignment-server.herokuapp.com/admin/question/${questionObject.questionId}`);
  req.setRequestHeader('Content-Type', 'application/json');

  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert('Question successfully updated!');
    }
  };

  req.send(JSON.stringify(question));
};






const deleteQuestion = (questionObject, choicesArr) => {

  const questionBody = document.getElementById('question_' + questionObject.questionId).value.trim();

  const radios = document.getElementsByName(questionObject.questionId);

  let answer;

  for (let i = 0; i < radios.length; ++i) {
    if (radios[i].checked) {
      answer = POSSIBLE_OPTIONS[i];
      break;
    }
  }



  const choices = [];
  choicesArr.forEach((choice, i) => {
    const textNode = document.getElementById('choices_' + questionObject.questionId).getElementsByClassName(choice.choiceId);
    if (!textNode[0].value.trim()) {
      alert("Choice cannot be empty, try again!");
      return;
    }
    choices.push({
      choiceId: choice.choiceId,
      choice: POSSIBLE_OPTIONS[i],
      choiceBody: textNode[0].value});
  });

  console.log(choices);
  const question = {questionId: questionObject.questionId, questionBody: questionBody, choices: choices, answer: answer};

  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/delete`);
  req2.send();


  const req = new XMLHttpRequest();
  req.open('DELETE', `https://comp4537-assignment-server.herokuapp.com/admin/question/${questionObject.questionId}`);
  req.setRequestHeader('Content-Type', 'application/json');

  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert(this.responseText);
      getAllQuizzes();
    }
  };

  req.send(JSON.stringify(question));
};




/* Allows the data to be grouped by a specific key */
/* Example from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce */
const groupBy = (data, key) => {
  return data.reduce((acc, obj) => {

    const group = obj[key];
    delete obj[key];
    acc[group] = acc[group] || [];
    acc[group].push(obj);

    return acc;
  }, {});
};



/* Initialize the page */
const initializePage = () => {
  document.getElementById('add-button').addEventListener('click', () => addOption());
  document.getElementById('remove-button').addEventListener('click', () => removeOption());
  document.getElementById('submit-button').addEventListener('click', () => submitQuestion());
  document.getElementById('clear-button').addEventListener('click', () => clearQuestions());

  getAllQuizzes();
  createOptionsButtons()
};

initializePage();
