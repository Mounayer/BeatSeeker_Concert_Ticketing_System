const dictionary = {
    en:{
        change_password: "Change Password",
        password: "Password",
        repeat_password: "Repeat Password",
        change: "Change",
        clear: "Clear",
        check_input: "Please Check Your Input",
        unable_to_find_account: "Unable to find account. Please contact Customer support",
        close: "Close",
        passerror: "Password must have at least one digit, uppercase letter and be atleast 6 characters",
        passnotmatch: "Passwords do not match"
    },
    fr:{
        change_password: "Changer le mot de passe",
        password: "Mot de passe",
        repeat_password: "Répéter le mot de passe",
        change: "Changer",
        clear: "Effacer",
        check_input: "Veuillez vérifier vos informations",
        unable_to_find_account: "Impossible de trouver le compte. Veuillez contacter le support client",
        close: "Fermer",
        passerror: "Le mot de passe doit comporter au moins un chiffre, une lettre majuscule et au moins 6 caractères",
        passnotmatch: "Les mots de passe ne correspondent pas",
    }

}

window.addEventListener("load", () => {
  let lang = translation(dictionary);
  document.querySelector("h3").textContent = lang.change_password;


  document.querySelector('label[for="password"]').textContent = lang.password;
  document.getElementById('password').placeholder = lang.password;

  document.querySelector('label[for="repeatPassword"]').textContent = lang.repeat_password;
  document.getElementById('repeatPassword').placeholder = lang.repeat_password;


  document.getElementById('submit').textContent = lang.change;
  document.getElementById('clear').textContent = lang.clear;
  document.getElementById('mod').textContent = lang.close;


});
document.addEventListener("DOMContentLoaded", () => {
    let lang = translation(dictionary);
    document.getElementById("password").addEventListener("change", () => {
        Check_Password();
    });
    document.getElementById("repeatPassword").addEventListener("change", () => {
        Check_repeatPassword();
    });
    document.getElementById("error").addEventListener("click", () => {
        loadModal(lang.check_input);
    });
    document.getElementById("submit").addEventListener("click", checkSubmission);
})


function Check_Password() {
    let lang = translation(dictionary);
    let value = false;

    let correctPassword = /^(?=.*\d)(?=.*[A-Z]).{6,}$/;
    let userInput = document.getElementById("password").value;
    let error = document.getElementById("passworderror");

    if (userInput.length !== 0) {
        if (correctPassword.test(userInput) === false) {
            error.textContent = lang.passerror;
            value = false;
        } else {
            error.textContent = "";
            value = true;
        }
    } else {
        error.textContent = "";
    }

    return value;
}

function Check_repeatPassword() {
    let lang = translation(dictionary);
    let value = false;
    let password = document.getElementById("password").value;
    let repeatpassword = document.getElementById("repeatPassword").value;
    let error = document.getElementById("repeatPassworderror");

    if (repeatpassword.length !== 0) {
        if (password !== repeatpassword) {
            error.textContent = lang.passnotmatch;
            value = false;
        } else {
            error.textContent = "";
            value = true;
        }
    } else {
        error.textContent = "";
    }

    return value;
}


function reset(){
    return new Promise((resolve, reject) => {
        let password = document.getElementById("password").value;
        fetch(`/account/api/resetpassword/?password=${password}`)
            .then((reply) => reply.json())
            .then((jsonobj) => {
                resolve(jsonobj);
            }).catch((error) => {
            reject(error);
        });
    });
}


function checkSubmission(event) {
    event.preventDefault();
    addLoadingCoverEntireContent();

    let formGood = Check_Password() && Check_repeatPassword();
    if (!formGood){
        disableLoadingCoverEntireContent();
        document.getElementById("error").click();
    }else{
        reset()
        .then((response) => {
            if (response.message === "False") {
                disableLoadingCoverEntireContent();
                loadModal(lang.unable_to_find_account);
            } else {
                document.getElementById("form").requestSubmit();
            }
        })
        .catch((error) => {
            console.log(error)
        });
    }


}

function loadModal(message){
    var modalBody = document.getElementById("message");
    modalBody.innerHTML = message;

    let myModal = new bootstrap.Modal(document.getElementById("messageModal"), {
        backdrop: "static",
        keyboard: true,
        focus: true,
    });

    myModal.show();
}