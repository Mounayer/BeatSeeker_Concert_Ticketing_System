const dictionary = {
    en:{
        login: "Login",
        username_or_email: "User Name or Email",
        password: "Password",
        clear: "Clear",
        instead: "instead",
        register: "Register",
        forgot_password: "Forgot Password",
        incorrect_email_password: "Incorrect email or password",
        close: "Close",
    },
    fr:{
        login: "Se connecter",
        username_or_email: "Nom d'utilisateur ou e-mail",
        password: "Mot de passe",
        clear: "Effacer",
        instead: "à la place",
        register: "S'inscrire",
        forgot_password: "Mot de passe oublié",
        incorrect_email_password: "Email ou mot de passe incorrect",
        close: "Fermer",
    },

}


window.addEventListener("load", () => {
  let lang = translation(dictionary);
  document.querySelector("h3").textContent = lang.login;

  document.querySelector('label[for="name"]').textContent = lang.username_or_email;
  document.getElementById('name').placeholder = lang.username_or_email;


  document.querySelector('label[for="password"]').textContent = lang.password;
  document.getElementById('password').placeholder = lang.password;


  document.getElementById('submit').textContent = lang.login;
  document.getElementById('clear').textContent = lang.clear;

  const smallElem = document.getElementById('re');
  const childNodes = smallElem.childNodes;
  childNodes[0].textContent = lang.register;
  childNodes[1].textContent = ` ${lang.instead} | `;
  childNodes[2].textContent = lang.forgot_password;

  document.getElementById('mod').textContent = lang.close;

});


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submit").addEventListener("click", checkSubmission);
});

function authenticate() {
    return new Promise((resolve, reject) => {
        let input = document.getElementById("name").value;
        let password = document.getElementById("password").value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,3}$/;
        let url = ``;

        if (emailRegex.test(input) === true) {
            url = `/account/api/loginE/?email=${input}&password=${password}`;
        } else {
            url = `/account/api/loginU/?username=${input}&password=${password}`;
        }

        fetch(url)
            .then((reply) => reply.json())
            .then((jsonobj) => {
                resolve(jsonobj);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function checkSubmission(event) {
    let lang = translation(dictionary);
    event.preventDefault();
    addLoadingCoverEntireContent();

    authenticate()
        .then((authenticatedUser) => {
            //disableLoadingCoverEntireContent();
            if (authenticatedUser.message === "False") {
                disableLoadingCoverEntireContent();
                loadModal(lang.incorrect_email_password);
            } else {
                document.getElementById("form").requestSubmit();
                // disableLoadingCoverEntireContent();
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

function loadModal(message) {
    var modalBody = document.getElementById("message");
    modalBody.innerHTML = message;

    let myModal = new bootstrap.Modal(document.getElementById("messageModal"), {
        backdrop: "static",
        keyboard: true,
        focus: true,
    });

    myModal.show();
}

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        // Page is loaded from the browser's cache, so refresh it
        location.reload();
    }
});


