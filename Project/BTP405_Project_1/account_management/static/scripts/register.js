const dictionary = {
  en: {
    register: "Register",
    username: "User Name",
    email: "Email",
    password: "Password",
    repeat_password: "Repeat Password",
    country: "Country",
    select_country: "Select Country",
    save_payment_method: "Save payment method (optional)",
    credit_number: "Credit Number",
    month_year: "Month & Year",
    mmyy: "MMYY",
    CVC: "CVC",
    submit: "Submit",
    clear: "Clear",
    login: "Login",
    instead: "instead",
    check_input: "Please Check Your Input",
    created: "Account Created",
    close: "Close",
    user_error:
      "*User name must be between 4 to 12 characters and must not have any digits or special characters.",
    pass_check:
      "*Password must have at least one digit, uppercase letter and be atleast 6 characters",
    pass_mismatch: "*Passwords do not match",
    credit_error: "*Please enter valid credit card information",
    country_error: "You must choose a country",
    username_error: "User name taken",
    account_error: "Account already exists with this email",
  },
  fr: {
    register: "S'inscrire",
    username: "Nom d'utilisateur",
    email: "Email",
    password: "Mot de passe",
    repeat_password: "Répéter le mot de passe",
    country: "Pays",
    select_country: "Sélectionnez un pays",
    save_payment_method: "Enregistrer le mode de paiement (facultatif)",
    credit_number: "Numéro de crédit",
    month_year: "Mois et année",
    mmyy: "MMAA",
    CVC: "CVC",
    submit: "Soumettre",
    clear: "Effacer",
    login: "Se connecter",
    instead: "à la place",
    check_input: "Veuillez vérifier vos informations",
    created: "Compte créé",
    close: "Fermer",
    user_error:
      "*Le nom d'utilisateur doit comporter entre 4 et 12 caractères et ne doit pas comporter de chiffres ou de caractères spéciaux.",
    pass_check:
      "*Le mot de passe doit comporter au moins un chiffre, une lettre majuscule et être composé d'au moins 6 caractères.",
    pass_mismatch: "*Les mots de passe ne correspondent pas",
    credit_error:
      "*Veuillez saisir les informations d'une carte de crédit valide",
    country_error: "Vous devez choisir un pays",
    username_error: "Nom d'utilisateur pris",
    account_error: "Le compte existe déjà avec cette adresse e-mail",
  },
};

window.addEventListener("load", () => {
  let lang = translation(dictionary);
  document.querySelector("h3").textContent = lang.register;

  document.querySelector('label[for="username"]').textContent = lang.username;
  document.getElementById("username").placeholder = lang.username;

  document.querySelector('label[for="email"]').textContent = lang.email;
  document.getElementById("email").placeholder = lang.email;

  document.querySelector('label[for="password"]').textContent = lang.password;
  document.getElementById("password").placeholder = lang.password;

  document.querySelector('label[for="repeatPassword"]').textContent =
    lang.repeat_password;
  document.getElementById("repeatPassword").placeholder = lang.repeat_password;

  document.querySelector('label[for="country"]').textContent = lang.country;
  document.getElementById("country").placeholder = lang.country;
  document.querySelector('#country option[value="#"]').textContent =
    lang.select_country;

  document.querySelector('label[for="CreditInfo"]').textContent =
    lang.save_payment_method;

  document.querySelector('label[for="credit-number"]').textContent =
    lang.credit_number;

  document.querySelector('label[for="monthYear"]').textContent =
    lang.month_year;

  document.querySelector('label[for="cvc"]').textContent = lang.CVC;

  document.getElementById("submit").textContent = lang.submit;
  document.getElementById("clear").textContent = lang.clear;

  const smallElem = document.getElementById("re");
  const childNodes = smallElem.childNodes;
  childNodes[0].textContent = lang.login;
  childNodes[1].textContent = ` ${lang.instead}`;
  document.getElementById("mod").textContent = lang.close;
});

document.addEventListener("DOMContentLoaded", () => {
  let lang = translation(dictionary);

  document.getElementById("CreditInfo").addEventListener("click", () => {
    creditfieldmodifier();
  });

  document.getElementById("username").addEventListener("change", () => {
    Check_Username();
  });
  document.getElementById("password").addEventListener("change", () => {
    Check_Password();
  });
  document.getElementById("repeatPassword").addEventListener("change", () => {
    Check_repeatPassword();
  });
  document.getElementById("country").addEventListener("change", () => {
    CheckCountry();
  });
  document.getElementById("credit-number").addEventListener("change", () => {
    CheckCreditCardInfo();
    document.getElementById("credit-number").value = formatCreditNumber(
      document.getElementById("credit-number").value
    );
  });
  document.getElementById("monthYear").addEventListener("change", () => {
    CheckCreditCardInfo();
  });
  document.getElementById("cvc").addEventListener("change", () => {
    CheckCreditCardInfo();
  });
  document.getElementById("error").addEventListener("click", () => {
    loadModal(lang.check_input);
  });
  document.getElementById("submit").addEventListener("click", checkSubmission);

  document.getElementById("credit-number").addEventListener("keyup", () => {
    let field = document.getElementById("credit-number");
    field.value = formatCreditNumber(field.value);
  });
});

function creditfieldmodifier() {
  let lang = translation(dictionary);
  let tickbox = document.getElementById("CreditInfo");
  let creditcard = document.getElementById("credit-number");
  let monthYear = document.getElementById("monthYear");
  let cvc = document.getElementById("cvc");
  let error = document.getElementById("creditcarderror");

  if (tickbox.checked) {
    creditcard.readOnly = false;
    monthYear.readOnly = false;
    cvc.readOnly = false;

    creditcard.required = true;
    monthYear.required = true;
    cvc.required = true;
    creditcard.setAttribute("placeholder", lang.credit_number);
    monthYear.setAttribute("placeholder", lang.mmyy);
    cvc.setAttribute("placeholder", lang.CVC);
  } else {
    error.textContent = "";

    creditcard.value = "";
    monthYear.value = "";
    cvc.value = "";

    creditcard.required = false;
    monthYear.required = false;
    cvc.required = false;

    creditcard.readOnly = true;
    monthYear.readOnly = true;
    cvc.readOnly = true;
    creditcard.removeAttribute("placeholder");
    monthYear.removeAttribute("placeholder");
    cvc.removeAttribute("placeholder");
  }
}

function Check_UserNameUnique() {
  return new Promise((resolve, reject) => {
    let username = document.getElementById("username").value;
    fetch(`/account/api/username/?username=${username}`)
      .then((reply) => reply.json())
      .then((jsonobj) => {
        resolve(jsonobj);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function Check_EmailUnique() {
  return new Promise((resolve, reject) => {
    let email = document.getElementById("email").value;
    fetch(`/account/api/email/?email=${email}`)
      .then((reply) => reply.json())
      .then((jsonobj) => {
        resolve(jsonobj);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function Check_Username() {
  let lang = translation(dictionary);
  let value = false;
  let userInput = document.getElementById("username").value;
  let error = document.getElementById("usernameerror");
  let usernameRegex = /^[a-zA-Z]+$/;

  if (userInput.length !== 0) {
    if (
      (userInput.length >= 4 &&
        userInput.length <= 12 &&
        usernameRegex.test(userInput)) === false
    ) {
      error.textContent = lang.user_error;
      value = false;
    } else {
      error.textContent = "";
      value = true;
    }
  }

  return value;
}

function Check_Password() {
  let lang = translation(dictionary);
  let value = false;

  let correctPassword = /^(?=.*\d)(?=.*[A-Z]).{6,}$/;
  let userInput = document.getElementById("password").value;
  let error = document.getElementById("passworderror");

  if (userInput.length !== 0) {
    if (correctPassword.test(userInput) === false) {
      error.textContent = lang.pass_check;
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
      error.textContent = lang.pass_mismatch;
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

function isMMYYValid(mmyy) {
  if (/^\d{4}$/.test(mmyy)) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() returns zero-indexed month
    const currentYear = today.getFullYear() % 100; // only last two digits of the year
    const month = parseInt(mmyy.slice(0, 2));
    const year = parseInt(mmyy.slice(2));

    if (year < currentYear) {
      return false;
    } else if (year === currentYear && month < currentMonth) {
      return false;
    } else if (month > 12 || month === 0) {
      return false;
    }

    return true;
  } else {
    return false;
  }
}

function isValidCreditCardNumber(ccNum) {
  // remove spaces
  ccNum = ccNum.replace(/\s/g, "").replace(/-/g, "");
  // Check if the input is a number and has between 13-19 digits
  if (/^\d{13,19}$/.test(ccNum)) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = ccNum.length - 1; i >= 0; i--) {
      let digit = parseInt(ccNum.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  } else {
    return false;
  }
}

function CheckCreditCardInfo() {
  let lang = translation(dictionary);
  let value = false;
  let creditcard = document.getElementById("credit-number").value;
  let monthyear = document.getElementById("monthYear").value;
  let cvc = document.getElementById("cvc").value;
  let error = document.getElementById("creditcarderror");
  console.log(isMMYYValid(monthyear));

  if (creditcard.length !== 0 && monthyear.length !== 0 && cvc.length !== 0) {
    if (
      !(
        isValidCreditCardNumber(creditcard) &&
        isMMYYValid(monthyear) &&
        /^\d{3,4}$/.test(cvc)
      )
    ) {
      error.textContent = lang.credit_error;
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

function CheckCountry() {
  let lang = translation(dictionary);
  let value = false;
  let userProvince = document.getElementById("country").value;
  let error = document.getElementById("countryerror");

  if (userProvince === "#") {
    error.textContent = lang.country_error;
    value = false;
  } else {
    error.textContent = "";
    value = true;
  }
  return value;
}

function checkSubmission(event) {
  let lang = translation(dictionary);
  event.preventDefault();

  let formGood =
    Check_UserNameUnique() &&
    Check_EmailUnique() &&
    Check_Username() &&
    Check_Password() &&
    Check_repeatPassword() &&
    CheckCountry();
  let tickbox = document.getElementById("CreditInfo");

  if (tickbox.checked) {
    formGood = CheckCreditCardInfo();
  }
  if (!formGood) {
    document.getElementById("error").click();
    event.preventDefault();
  } else {
    addLoadingCoverEntireContent();
    Check_UserNameUnique()
      .then((namefound) => {
        if (namefound.message === "True") {
          disableLoadingCoverEntireContent();
          document.getElementById("usernameerror").innerText =
            lang.username_error;
          document.getElementById("error").click();
        } else {
          Check_EmailUnique()
            .then((emailfound) => {
              if (emailfound.message === "True") {
                disableLoadingCoverEntireContent();
                document.getElementById("emailerror").innerText =
                  lang.account_error;
                document.getElementById("error").click();
              } else {
                document.getElementById("form").requestSubmit();
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
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

function formatCreditNumber(input) {
  // remove all non-digit characters from the input
  input = input.replace(/\D/g, "");

  // check if the input consists only of digits
  if (!/^\d+$/.test(input)) {
    // if the input contains non-digit characters, return the original input
    return input;
  }

  // format the input into groups of 4 digits
  var formatted = "";
  for (var i = 0; i < input.length; i++) {
    if (i > 0 && i % 4 == 0) {
      formatted += " ";
    }
    formatted += input.charAt(i);
  }
  return formatted;
}
