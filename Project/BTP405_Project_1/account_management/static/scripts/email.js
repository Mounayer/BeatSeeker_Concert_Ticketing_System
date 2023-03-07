const dictionary = {
    en:{
        reset_password: "Reset Password",
        username: "User Name",
        email: "Email",
        code: "Code",
        enter_code: "Enter code",
        next: "Next",
        clear: "Clear",
        submit: "Submit",
        check_email: "Check your email for the verification code",
        create_account: "Please create an account",
        incorrect_code: "Incorrect code",
        close: "Close",
    },
    fr:{
        reset_password: "Réinitialiser le mot de passe",
        username: "Nom d'utilisateur",
        email: "Email",
        code: "Code",
        enter_code: "Entrez le code",
        next: "Suivant",
        clear: "Effacer",
        submit: "Soumettre",
        check_email: "vérifiez votre e-mail pour le code de vérification",
        create_account: "Veuillez créer un compte",
        incorrect_code: "Code incorrect",
        close: "Fermer",
    }

}

window.addEventListener("load", () => {
  let lang = translation(dictionary);

  document.querySelector("h3").textContent = lang.reset_password;

  document.querySelector('label[for="email"]').textContent = lang.email;
  document.getElementById('email').placeholder = lang.email;

  document.querySelector('label[for="code"]').textContent = lang.code;
  document.getElementById('code').placeholder = lang.enter_code;

  document.getElementById('Next').textContent = lang.next;
  document.getElementById('clear').textContent = lang.clear;

  document.getElementById('mod').textContent = lang.close;

});


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("Next").addEventListener("click", sendVerifcode);
})


function emailCode(){
    return new Promise((resolve,reject)=>{
        let email = document.getElementById("email").value;
        let url= `/account/api/sendcode/?email=${email}`;


        fetch(url)
        .then((reply)=>reply.json())
        .then((jsonobj)=>{resolve(jsonobj)})
        .catch((error)=>{reject(error)})
    });
}


function matchcode(){
    return new Promise((resolve,reject)=>{
        let code = document.getElementById("code").value;
        let url = `/account/api/matchcode/?code=${code}`;

        fetch(url)
        .then((reply)=>reply.json())
        .then((jsonobj)=>{resolve(jsonobj)})
        .catch((error)=>{reject(error)})
    });
}

function verifycode(event){
    let lang = translation(dictionary);
    event.preventDefault();
    matchcode()
    .then((response)=>{
        if(response.message === "True"){
            document.getElementById("form").requestSubmit();
        }else{
            loadModal(lang.incorrect_code);
        }
    })
    .catch((error)=>{
        console.log(error)})
}

function sendVerifcode() {
    let lang = translation(dictionary);
    addLoadingCoverEntireContent();

    emailCode()
    .then((response) => {
        disableLoadingCoverEntireContent();
        if (response.message === "True") {
            let old = document.getElementById("Next");
            let parent = document.getElementById("buttons");


            let submit = document.createElement("button");
            submit.setAttribute("type", "submit");
            submit.setAttribute("class", "btn btn-lg button_color font_family d-flex justify-content-center");
            submit.setAttribute("id", "submit");
            submit.setAttribute("style", "width: 100px;");
            submit.innerHTML = lang.submit;

            parent.replaceChild(submit, old);

            let list = document.getElementsByClassName("password_item");
            list[0].classList.remove("d-none");
            list[1].classList.remove("d-none");
            loadModal(lang.check_email);
            document.getElementById("submit").addEventListener("click", verifycode);

        } else {
            loadModal(lang.create_account);
        }
    })
    .catch((error) => {
        console.log(error)
    });
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