var firebaseConfig = {
    apiKey: "AIzaSyBW6jj8k99TmMGewBEMPsW2WOCtEa3KtHw",
    authDomain: "ai-investment-assistant.firebaseapp.com",
    projectId: "ai-investment-assistant",
    storageBucket: "ai-investment-assistant.appspot.com",
    messagingSenderId: "441103235888",
    appId: "1:441103235888:web:231b0e6b8a67047ca4e6f5",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("loginForm")) {
      document.getElementById("loginForm").addEventListener("submit", login);
    }
    if (document.getElementById("registerForm")) {
      document
        .getElementById("registerForm")
        .addEventListener("submit", submitForm);
    }
    if (document.getElementById("resetForm")) {
      document
        .getElementById("resetForm")
        .addEventListener("submit", resetPassword);
    }
  });
  
  async function login(event) {
    event.preventDefault(); // Prevent the default form submission
  
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
  
    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      var user = userCredential.user;
      alert("Giriş başarılı");
      window.location.href = "/chatbot.html"; // Redirect to index page
    } catch (error) {
      var errorMessage = error.message;
      alert("Hata: " + errorMessage);
      console.log("Error: " + errorMessage);
    }
  }
  
  async function register(event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
  
    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      var user = userCredential.user;
      alert("Kayıt başarılı");
      window.location.href = "/login.html"; // Redirect to index page
    } catch (error) {
      var errorMessage = error.message;
      alert("Hata: " + errorMessage);
      console.log("Error: " + errorMessage);
    }
  }
  
  async function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("resetEmail").value;
  
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      alert("Şifre sıfırlama e-postası gönderildi!");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        alert("Öyle bir mail yok.");
      } else {
        alert(error.message);
      }
    }
  }
  
  function googleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        var user = result.user;
        console.log("Google sign-in successful");
      })
      .catch((error) => {
        var errorMessage = error.message;
        console.log("Error: " + errorMessage);
      });
  }
  
  // Function to handle Facebook sign-in
  function facebookSignIn() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        var user = result.user;
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  function forgotpassword() {
    var auth = firebase.auth();
    var emailAddress = document.getElementById("email").value;
  
    auth
      .sendPasswordResetEmail(emailAddress)
      .then(() => {
        alert("Password reset email sent");
        console.log("Password reset email sent");
      })
      .catch((error) => {
        var errorMessage = error.message;
        alert(errorMessage);
        console.error(errorMessage);
      });
  }
  
  function checkPasswordMatch() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var passwordMatchInfo = document.getElementById("password-match-info");
    if (password != confirmPassword) {
      passwordMatchInfo.style.display = "block";
    } else {
      passwordMatchInfo.style.display = "none";
    }
  }
  
  async function submitForm(event) {
    event.preventDefault();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    if (password != confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return false;
    }
    await register(event);
    return false;
  }