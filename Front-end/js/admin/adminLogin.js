function checkCredentials() {
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  if (user === "admin" && pass === "root") {
    window.open("html/admin/COMP4537-API-Documentation.html");
    alert('Correct username/password');
  } else {
    alert('Incorrect username or password')
  }
}

