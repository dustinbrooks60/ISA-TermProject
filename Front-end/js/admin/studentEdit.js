'use strict';






/* Updates the student in the DB */
const updateStudent = () => {

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    alert('Username and password cannot be empty');
    return;
  }


  const clientURL = new URL(window.location);
  const studentId = clientURL.searchParams.get('studentId');

  const student = {studentId: studentId, studentUsername: username, studentPassword: password};


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/put`);
  req2.send();



  const req = new XMLHttpRequest();
  req.open('PUT', `https://comp4537-assignment-server.herokuapp.com/students`);
  req.setRequestHeader('Content-Type', 'application/json');

  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert('Student successfully updated!');
      window.location.replace("https://dustin-brooks-60.netlify.app/comp4537/assignments/1/quiz/html/admin/index.html");
    }
  };

  req.send(JSON.stringify(student));
};






const deleteStudent = () => {



  const clientURL = new URL(window.location);
  const studentId = clientURL.searchParams.get('studentId');


  const req2 = new XMLHttpRequest();
  req2.open('PUT', `https://comp4537-assignment-server.herokuapp.com/apiCount/delete`);
  req2.send();



  const req = new XMLHttpRequest();
  req.open('DELETE', `https://comp4537-assignment-server.herokuapp.com/students/` + studentId);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert(this.responseText);
      window.location.replace("https://dustin-brooks-60.netlify.app/comp4537/assignments/1/quiz/html/admin/index.html");


    }
  };

};




/* Initialize the page */
const initializePage = () => {
  document.getElementById('update-button').addEventListener('click', () => updateStudent());
  document.getElementById('delete-button').addEventListener('click', () => deleteStudent());

};

initializePage();
