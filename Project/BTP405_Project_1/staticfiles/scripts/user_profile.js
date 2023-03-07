const dictionary = {
    en: {
        headers: {
            personalinfo: "Personal Information",
            card: "Card Details",
            history: "Purchase History",
        },
        labels: {
            username: "Username",
            email: "Email",
            memberdate: "Member since",
            card: "Card",
            expirydate: "Expiry Date",
            mmyy: "MMYY"
        },
        table_label: {
            purchase_date: "Purchase Date",
            concert_name: "Concert Name",
            artist: "Artist",
            concert_date: "Concert Date",
            venue: "Venue",
            ticket: "Ticket",
            seat: "Seat",
            price: "Price"
        },
        buttons: {
            logout: "Logout",
            accept: "Accept",
            clear: "Clear",
            edit: "Edit",
            details: "Details",
            add: "Add"
        }
    },
    fr: {
        headers: {
            personalinfo: "Informations personnelles",
            card: "Détails de la carte",
            history: "Historique d'achat",
        },
        labels: {
            username: "Nom d'utilisateur",
            email: "E-mail",
            memberdate: "Membre depuis",
            card: "Carte",
            expirydate: "Date d'expiration",
            mmyy: "MMAA"
        },
        table_label: {
            purchase_date: "Date d'achat",
            concert_name: "Nom du concert",
            artist: "Artiste",
            concert_date: "Date du concert",
            venue: "Lieu",
            ticket: "Billet",
            seat: "Siège",
            price: "Prix"
        },
        buttons: {
            logout: "Déconnexion",
            accept: "Accepter",
            clear: "Effacer",
            edit: "Modifier",
            details: "Détails",
            add: "Ajouter"
        }
    }
};


document.addEventListener("DOMContentLoaded", () => {
    loadPage();
    const user_info = {
        username: '',
        email: '',
        card: {
            cardnum: '',
            fourdigit: '',
            expiryDate: '',
            cvv: ''
        }
    };

    document.addEventListener("load", () => {
        const rows = document.querySelectorAll('tbody tr[data-toggle="collapse"]');

        rows.forEach(row => {
            row.addEventListener('click', () => {
                const target = document.querySelector(row.dataset.target);
                target.classList.toggle('show');
            });
        });
    })

    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            // Page is loaded from the browser's cache, so refresh it
            location.reload();
        }
    });

    function loadPage() {
        addLoadingCoverEntireContent();
        let lang = translation(dictionary);
        fetch('/user/api/userinfo')
            .then(res => res.json())
            .then(data => {
                user_info.username = data['name'];
                user_info.email = data['user']['email'];
                let htmlContent = `
            <div class="row">
                <div class="spacer-change"></div>
                <div class="content-change">
                    <div class="fieldset_align">
                        <fieldset class="border_color fieldset_width">
                            <legend class="w-auto p-2 attention_color" id="personalInfo">${lang.headers.personalinfo}</legend>
                            <div id="personalInfo_load">
                                <div class="accinfo regular_color d-flex justify-content-center" id="username">&nbsp;&nbsp; 
                                    <div class="info_container">
                                        <span class="userinfo_key">${lang.labels.username}</span>: 
                                        <span class="userinfo_data">${data["name"]}</span>
                                    </div>
                                </div>
                                <div class="accinfo regular_color d-flex justify-content-center" id="email">&nbsp;&nbsp; 
                                    <div class="info_container d-flex" id="userinfo_email">
                                        <span class="userinfo_key">${lang.labels.email}</span>: 
                                        <span class="userinfo_data">${data["user"]["email"]}</span>
                                    </div>
                                    <div class="edit_email_button">
                                        <button class="button_color btn margin-button edit_button_btn mr-2">${lang.buttons.edit}</button>
                                    </div>
                                </div>
                                <div><small id="emailerror" class="font_family" style="color: red;"></small></div>
                                <div class="accinfo regular_color d-flex justify-content-center" id="memdate">&nbsp;&nbsp; 
                                    <div class="info_container">
                                        <span class="userinfo_key">${lang.labels.memberdate}</span>: 
                                        <span class="userinfo_data">${data["user"]["Created"]}</span>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        <div class="accept-email-changes"></div>
                        <br><br>
            `;


                htmlContent += `
                        <fieldset class="border_color fieldset_width">
                            <legend class="w-auto p-2 attention_color" id="card_details_header">${lang.headers.card}</legend>
                            <div id="cardDetails_load">
                                <div class="accinfo regular_color d-flex justify-content-center" id="credit">&nbsp;&nbsp; 
                                    <div class="info_container" id="card_details">
                                        <span class="userinfo_key">${lang.labels.card} #</span>:
            `;

                if (data["user"]["CreditInfo"] === "True") {
                    htmlContent += `
                                        <span class="userinfo_data">**** **** **** ${data["cardno"]["fourdigit"]}</span>
                                    </div>
                                    <div class="edit_card_button">
                                        <button class="button_color btn card_details_btn mr-2">${lang.buttons.edit}</button>
                                    </div>
                `;
                } else {
                    htmlContent += `
                                        <span class="userinfo_data">N/A</span>
                                    </div>
                                    <div class="edit_card_button">
                                        <button class="button_color btn card_details_btn mr-2">${lang.buttons.add}</button>
                                    </div>
                `;
                }


                htmlContent += `
                                </div>
                            </div>
                        </fieldset>
                        <div class="accept-card-changes"></div>
                        <br><br><br>
                    </div>
                        <fieldset class="border_color">
                            <legend class="w-auto p-2 attention_color" id="history">${lang.headers.history}</legend>
                            <div class="main_display">
                                <table class="table" id="historytable">
                                    <thead class="table_header">
                                        <tr>
                                            <th class="regular_color" scope="col">${lang.table_label.purchase_date}</th>
                                            <th class="regular_color" scope="col">${lang.table_label.concert_name}</th>
                                            <th class="regular_color" scope="col">${lang.table_label.artist}</th>
                                            <th class="regular_color" scope="col">${lang.table_label.concert_date}</th>
                                            <th class="regular_color" scope="col">${lang.table_label.venue}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;

                for (let i = data["history"].length - 1; i >= 0; i--) {
                    const order = data["history"][i];
                    htmlContent += `
                    <tr class="hoverable" data-toggle="collapse" data-target="#header-${order.purchaseId}, #details-${order.purchaseId}">
                        <td class="regular_color">${order.purchaseDate}</td>
                        <td class="regular_color">${order.concert}</td>
                        <td class="regular_color">${order.artist}</td>
                        <td class="regular_color">${order.concertDate}</td>
                        <td class="regular_color">${order.venue}</td>
                    </tr>
                    <tr id="header-${order.purchaseId}" class="collapse header">
                        <th class="regular_color" colspan="1">${lang.table_label.ticket} #</th>
                        <th class="regular_color" colspan="2">${lang.table_label.seat}</th>
                        <th class="regular_color" colspan="2">${lang.table_label.price}</th>
                    </tr>
            `;

                    for (let ticket of order["tickets"]) {
                        htmlContent += `
                        <tr class="collapse details" id="details-${order.purchaseId}">
                            <td class="regular_color" colspan="1">${ticket.ticketId}</td>
                            <td class="regular_color" colspan="2">${ticket.seat}</td>
                            <td class="regular_color" colspan="2">${convertFromCAD(ticket.price)}</td>
                        </tr>
                `;
                    }
                }

                htmlContent += `
                                    </tbody>
                                </table>
                            </div>
                            <div class="secondary_display">
                                <table class="table">
                                    <thead class="table_header">
                                        <tr>
                                            <th class="regular_color" scope="col">${lang.table_label.purchase_date}</th>
                                            <th class="regular_color" scope="col">${lang.table_label.concert_name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;

                for (let i = data["history"].length - 1; i >= 0; i--) {
                    const order = data["history"][i];
                    htmlContent += `
                <tr>
                    <td class="regular_color">${order.purchaseDate}</td>
                    <td class="regular_color">${order.concert}</td>
                    <td><button class="button_color" id="ticket_details_button${i}">${lang.buttons.details}</button></td>
                </tr>
            `;
                }

                htmlContent += `
                                        </tbody>
                                    </table>
                                </div>
                            </fieldset>
                        </div>
                    <div class="spacer-change"></div>
                </div>
            `;

                document.getElementById("profile_container").innerHTML = htmlContent;
                disableLoadingCoverEntireContent();
                return data['history'];
            })
            .then(order => {
                for (let i = order.length - 1; i >= 0; i--) {
                    document.getElementById(`ticket_details_button${i}`).addEventListener("click", () => {
                        addLoadingCoverEntireContent();
                        // if (i === 0) {
                        //     i += 1;
                        // }
                        window.location.href = `tickets/${i+1}`;
                    });
                }
                makeAccountInfoEditable();
            });

        function makeAccountInfoEditable() {
            let editEmailButton = document.querySelector('.edit_email_button');
            let editCardButton = document.querySelector('.edit_card_button');

            editEmailButton.addEventListener('click', createEditEmailInput);
            editCardButton.addEventListener('click', createEditCardInput);

            const fields = document.querySelectorAll('.user_info_input');
            fields.forEach(input => {
                input.addEventListener('keyup', (e) => {
                    if (e.key == 'Escape') {
                        document.querySelector('.clear_btn').click();
                    }
                    if (e.key == 'Enter') {
                        document.querySelector('.accept_btn').click();
                    }
                });
            });

            function createEditEmailInput() {
                let userinfoelement = document.getElementById('userinfo_email');
                let emaileditbutton = document.getElementById('email')
                let decide_buttons = document.querySelector('.accept-email-changes')
                editEmailButton.innerHTML = ''
                let initialValue = ''

                if (emaileditbutton.querySelector('.userinfo_data')) {
                    initialValue = emaileditbutton.querySelector('.userinfo_data').innerHTML;

                    userinfoelement.innerHTML = `
                        <span class="userinfo_key">${lang.labels.email}</span>: 
                        <div class="input-group userinfo_input mx-1 d-flex">     
                            <input type="email" value="${initialValue}" class="form-control user_info_input user_input_border" aria-label="Recipient's username" aria-describedby="basic-addon2">
                        </div>
                        
                    `;

                    document.querySelector('.accept-email-changes').innerHTML += `
                        <button class="button_color btn btn-outline-secondary accept_email_btn" type="button">${lang.buttons.accept}</button>
                        <button class="button_color btn btn-outline-secondary clear_email_btn" type="button">${lang.buttons.clear}</button>
                    `;

                    const input = userinfoelement.querySelector('.user_info_input');
                    const clearButton = document.querySelector('.clear_email_btn');
                    const acceptButton = document.querySelector('.accept_email_btn');

                    makeClearButtonClickable();
                    makeAcceptButtonClickable();
                    addInputEnterAndEscapeHandlers();

                    function addInputEnterAndEscapeHandlers() {

                        input.addEventListener('keyup', (e) => {
                            if (e.key === 'Escape') {
                                clearButton.click();
                            }
                            if (e.key === 'Enter') {
                                const user_info_key = input.parentElement.parentElement.parentElement.id;
                                const value = user_info[user_info_key];

                                if (value !== input.value) {
                                    acceptButton.click();
                                } else {
                                    clearButton.click();
                                }
                            }
                        });
                    }

                    function makeClearButtonClickable() {
                        clearButton.addEventListener('click', () => displayUserDataBack(initialValue));
                    }

                    let element = document.getElementById("personalInfo_load")

                    function makeAcceptButtonClickable() {
                        acceptButton.addEventListener('click', async () => {
                            if (checkEmail()) {
                                createLoadingCoverForElement(element)
                                activateLoadingCoverForElement(element)
                                getUserProfileInfo();
                                await tryAcceptingInput();
                            } else {
                                document.getElementById('emailerror').textContent = `
                                    *Please enter a valid email address.
                                `;
                            }

                        });
                    }

                    function tryAcceptingInput() {
                        fetch('/user/api/update', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(user_info),
                        })
                            .then(res => res.json())
                            .then(data => {
                                displayUserDataBack(data['email'])
                                disableLoadingCoverForElement(element)
                            })
                    }

                    function displayUserDataBack(value) {
                        userinfoelement.innerHTML = '';

                        userinfoelement.innerHTML = `
                            <div class="info_container d-flex" id="userinfo_email">
                                <span class="userinfo_key">${lang.labels.email}</span>: 
                                <span class="userinfo_data">${value}</span>
                            </div>
                        `;

                        editEmailButton.innerHTML = `
                            <button class="button_color btn email_details_btn mr-2">${lang.buttons.edit}</button>
                        `;

                        decide_buttons.innerHTML = '';
                        document.getElementById("emailerror").textContent = '';
                    }

                    function checkEmail() {
                        const email = input.value;
                        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return pattern.test(email);
                    }
                }
            }

            function createEditCardInput() {
                let cardinfo = document.getElementById("card_details")
                let cardedit = document.getElementById("credit")
                let decide_buttons = document.querySelector('.accept-card-changes')
                if (cardedit.querySelector(".userinfo_data")) {
                    let initialValue = cardedit.querySelector(".userinfo_data").innerHTML;
                    console.log(initialValue)
                    let fourDigitValue = initialValue.slice(-4);
                    console.log(fourDigitValue);
                    ;
                    editCardButton.innerHTML = ''
                    cardinfo.innerHTML = ''

                    cardinfo.innerHTML = `
                        <span class="userinfo_key">${lang.labels.card} #</span>:
                        <div class="input-group userinfo_input d-flex">
                            <input type="text" value="${initialValue}" class="form-control user_info_input user_input_border" id="card_number" aria-label="Card number" aria-describedby="basic-addon2">
                        </div>
                        <br>
                        <span class="userinfo_key">${lang.labels.expirydate}</span>:
                        <div class="input-group userinfo_input d-flex">
                            <input type="text" value="" class="form-control user_info_input user_input_border" id="expiry_date" aria-label="Expiry date" aria-describedby="basic-addon2" maxlength="4" placeholder="${lang.labels.mmyy}">
                        </div>
                        <br>
                        <span class="userinfo_key">CVV</span>:
                        <div class="input-group userinfo_input d-flex">
                            <input type="text" value="" class="form-control user_info_input user_input_border" id="cvv" aria-label="cvv" aria-describedby="basic-addon2" placeholder="CVV">
                        </div>
                        <div class="text-center"><small id="creditcarderror" class="font_family" style="color: red;"></small></div>   
                    `;

                    document.querySelector('.accept-card-changes').innerHTML += `
                        <button class="button_color btn btn-outline-secondary accept_card_btn" type="button">${lang.buttons.accept}</button>
                        <button class="button_color btn btn-outline-secondary clear_card_btn" type="button">${lang.buttons.clear}</button>
                    `;
                    let input = cardinfo.querySelector('.user_info_input')
                    const clearButton = document.querySelector('.clear_card_btn');
                    const acceptButton = document.querySelector('.accept_card_btn');

                    addInputEnterAndEscapeHandlers()
                    makeAcceptButtonClickable();
                    makeClearButtonClickable();

                    function addInputEnterAndEscapeHandlers() {

                        input.addEventListener('keyup', (e) => {
                            if (e.key === 'Escape') {
                                clearButton.click();
                            }
                            if (e.key === 'Enter') {
                                const user_info_key = input.parentElement.parentElement.parentElement.id;
                                const value = user_info[user_info_key];

                                if (value !== input.value) {
                                    acceptButton.click();
                                } else {
                                    clearButton.click();
                                }
                            }
                        });
                    }

                    function makeClearButtonClickable() {
                        clearButton.addEventListener('click', () => displayCardDataBack(fourDigitValue));
                    }

                    let element = document.getElementById("cardDetails_load")

                    function makeAcceptButtonClickable() {
                        acceptButton.addEventListener('click', async () => {
                            getUserProfileInfo();

                            if (CheckCreditCardInfo()) {
                                createLoadingCoverForElement(element)
                                activateLoadingCoverForElement(element)
                                await tryAcceptingInput();
                            }
                        });
                    }

                    function tryAcceptingInput() {
                        fetch('/user/api/update', {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(user_info),
                        })
                            .then(res => res.json())
                            .then(data => {
                                console.log(data)
                                displayCardDataBack(data['fourdigit']);
                                disableLoadingCoverForElement(element)
                            })
                    }

                    function displayCardDataBack(value) {
                        cardinfo.innerHTML = '';

                        if (value !== "N/A") {
                            cardinfo.innerHTML += `
                                <div class="info_container d-flex" id="card_details">
                                    <span class="userinfo_key">${lang.labels.card} #</span>:
                                    <span class="userinfo_data">**** **** **** ${value}</span>
                                </div>     
                            `;

                            editCardButton.innerHTML = `
                                <button class="button_color btn card_details_btn mr-2">${lang.buttons.edit}</button>
                            `;
                        } else {
                            cardinfo.innerHTML += `
                                <div class="info_container d-flex" id="card_details">
                                    <span class="userinfo_key">${lang.labels.card} #</span>:
                                    <span class="userinfo_data">${value}</span>
                                </div>     
                            `;

                            editCardButton.innerHTML = `
                                <button class="button_color btn card_details_btn mr-2">${lang.buttons.add}</button>
                            `;
                        }
                        decide_buttons.innerHTML = '';
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
                        ccNum = ccNum.replace(/\s/g, '').replace(/-/g, '');
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
                        let value = false;
                        let creditcard = document.getElementById("card_number").value;
                        let monthyear = document.getElementById("expiry_date").value;
                        let cvc = document.getElementById("cvv").value;
                        let error = document.getElementById("creditcarderror");

                        if (creditcard.length !== 0 && monthyear.length !== 0 && cvc.length !== 0) {
                            if (!(isValidCreditCardNumber(creditcard) && isMMYYValid(monthyear) && (/^[1-9]\d{2,3}$/.test(cvc)))) {
                                error.textContent = "*Please enter valid credit card information";
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

                    document.getElementById("card_number").addEventListener("keyup", () => {
                        let field = document.getElementById("card_number");
                        field.value = formatCreditNumber(field.value);
                    });

                }
            }
        }

        function getUserProfileInfo() {
            const usernameData = document.querySelector('#username .userinfo_data');

            if (usernameData == null) {
                const usernameInputValue = document.querySelector('#username .user_info_input').value;
                user_info.username = usernameInputValue;
            } else {
                user_info.username = usernameData.innerHTML;
            }

            const emailData = document.querySelector('#email .userinfo_data');

            if (emailData == null) {
                const emailInputValue = document.querySelector('#email .user_info_input').value;
                user_info.email = emailInputValue;
            } else {
                user_info.email = emailData.innerHTML;
            }

            const cardInput = document.querySelector('#credit .user_info_input');
            if (cardInput != null) {
                const cardNumValue = document.getElementById("card_number").value;
                const cardExpiryDate = document.getElementById("expiry_date").value;
                const cardCvv = document.getElementById("cvv").value;

                user_info.card.cardnum = cardNumValue;
                user_info.card.fourdigit = cardNumValue.slice(-4);
                user_info.card.expiryDate = cardExpiryDate;
                user_info.card.cvv = cardCvv;
            } else {
                user_info.card = '';
            }
        }


    }
});