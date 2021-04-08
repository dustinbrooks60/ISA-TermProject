const checkAdmin = () => {


  let username = prompt("Please enter your username");
  let password = prompt("Please enter your password");

  if (username != null && password != null) {
    const req = new XMLHttpRequest();

    req.open('GET', 'https://comp4537-assignment-server.herokuapp.com/quizzes', true);
    req.send();
    req.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        createListOfQuizzes(JSON.parse(this.response));
      }
    }
  }


};
