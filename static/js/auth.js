// static/js/auth.js
var firebaseConfig = {
    apiKey: "AIzaSyBW6jj8k99TmMGewBEMPsW2WOCtEa3KtHw",
    authDomain: "ai-investment-assistant.firebaseapp.com",
    projectId: "ai-investment-assistant",
    storageBucket: "ai-investment-assistant.appspot.com",
    messagingSenderId: "441103235888",
    appId: "1:441103235888:web:231b0e6b8a67047ca4e6f5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

async function login(event) {
    event.preventDefault(); // Prevent the default form submission

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            alert("Giriş başarılı");
            window.location.href = "/"; // Redirect to index page
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert("Hata: " + errorMessage);
            console.log("Error: " + errorMessage);
        });
}

async function register(event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            alert("Registration successful");
            window.location.href = "/"; // Redirect to index page
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert("Error: " + errorMessage);
            console.log("Error: " + errorMessage);
        });
}

function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("resetEmail").value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            // Password reset email sent successfully
            alert("Şifre sıfırlama e-postası gönderildi!");
        })
        .catch((error) => {
            // Error during password reset
            if (error.code === 'auth/user-not-found') {
                alert("Öyle bir mail yok.");
            } else {
                alert(error.message);
            }
        });
}

function googleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            var user = result.user;
            console.log("Google sign-in successful");
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Error: " + errorMessage);
        });
}

// Function to handle Facebook sign-in
function facebookSignIn() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            var user = result.user;
            console.log(user);
            // User is signed in.
        }).catch((error) => {
            console.log(error);
            // Handle Errors here.
        });
}

function forgotpassword() {
    var auth = firebase.auth();
    var emailAddress = document.getElementById("email").value;

    auth.sendPasswordResetEmail(emailAddress)
        .then(() => {
            alert("Password reset email sent");
            console.log("Password reset email sent");
        })
        .catch((error) => {
            var errorCode = error.code;
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

function submitForm(event) {
    event.preventDefault();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    if (password != confirmPassword) {
        alert("Şifreler eşleşmiyor!");
        return false;
    }
    register();
    return false;
}
