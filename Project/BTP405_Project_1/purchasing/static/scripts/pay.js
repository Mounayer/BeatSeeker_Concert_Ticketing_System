const dictionary = {
    en: {
        timer: {
            first_part: 'You have',
            second_part: 'for payment',
            minutes: 'minutes',
            seconds: 'seconds'
        },
        table_headers: {
            seatName: 'Seat Name',
            price: 'Price'
        },
        total: 'Total',
        submitButton: 'Pay now'
    },
    fr: {
        timer: {
            first_part: 'Vous avez',
            second_part: 'pour le paiement',
            minutes: 'minutes',
            seconds: 'secondes'
        },
        table_headers: {
            seatName: 'Nom du siège',
            price: 'Prix'
        },
        total: 'Total',
        submitButton: 'Payer maintenant'
    },
};
const form = document.querySelector('#payment-form');
const submitButton = document.querySelector('.submit_button');
const timeout = document.querySelector('.timeout');
const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const ticketsTable = document.querySelector('.tickets_table tbody');
const ticketsTotalElem = document.querySelector('.tickets_total');
let elements;
let totalPrice = 0;
let timeleft;
let rowCounter = 1;
let seatNames;
let firstTime = true;
let intervalID;
let emailAddress = '';
const json_tickets = [];
let json_concert;

async function activateTimer() {
    intervalID = setInterval(() => {
        if (timeleft == 0) {
            clearInterval(intervalID);
            redirect('/');
        } else {
            updateTimeout();
            timeleft -= 1;
        }

    }, 1000);

    function updateTimeout() {
        const lang = translation(dictionary);
        const minutes = Math.trunc(timeleft / 60);
        const seconds = timeleft - minutes * 60;
        timeout.innerHTML = `${minutes} ${lang.timer.minutes} ${seconds} ${lang.timer.seconds}`;
    }
}

function getParamID() {
    const foundStr = window.location.href.match(/\/\d+\?/)[0];
    const id = foundStr.match(/\d+/)[0];
    return id;
}

async function getConcertByID() {
    const res = await fetch(`/concert/api/concertbyid/?id=${getParamID()}`);
    const json = await res.json();
    if (json.messsage && json.message == 'Not Found') {
        redirect('/concert/all');
    } else {
        return json;
    }
}

function getSeatNames() {
    const ticketsQuery = getQueryParameter('tickets');
    const tickets = ticketsQuery.substring(1).substring(0, ticketsQuery.length - 2);
    return tickets.split(',');
}

async function verifyConcert() {
    const concert = await getConcertByID();
    if (concert.message && concert.message == 'Not Found')
        redirect('/concert/all');
    return concert;
}

async function verifyPaymentAbility() {
    console.log(json_tickets);
    console.log(json_concert);
    const res = await sendJSON('/payment/api/get-counter/', {
        seats: json_tickets,
        concert: json_concert
    }, csrftoken);
    const json = await res.json();
    timeleft = json.counter;
    if (timeleft < 0)
        timeleft = 0;
}

function verifySeatNames(concert) {
    seatNames = getSeatNames();
    for (const seatName of seatNames) {
        if (!seatIsAvailable(concert.venue, seatName)) {
            redirect('/concert/all');
        }
    }
}

function storeJSONConcert(concert) {
    json_concert = {
        id: concert._id,
        name: concert.name,
        date: concert.date,
        time: concert.time,
        performer: concert.performer,
        address: concert.venue.address,
        venueName: concert.venue.name
    };
}

async function verifyURL() {
    const concert = await verifyConcert();
    storeJSONConcert(concert);
    verifySeatNames(concert);
}

function storeJSONSeat(seating, seatName) {
    json_tickets.push({
        seatName,
        price: seating.price,
    });
}

function seatIsAvailable(venue, seatName) {
    try {
        const seatType = getSeatType(seatName);
        const seatNumber = +getSeatNumber(seatName) - 1;
        const seating = getSeatingOfType(venue, seatType);
        if (seating != null) {
            storeJSONSeat(seating, seatName);
        }
        return seating == null ? false : seating.seats[seatNumber].vacant;
    } catch (e) {
        return false;
    }
}

function getSeatNumber(seatName) {
    return seatName.substring(seatName.lastIndexOf('-') + 1, seatName.length);
}

function getSeatingOfType(venue, ticketType) {
    let matchedSeating = null;
    for (const seating of venue.seating) {
        if (seating.type == ticketType) {
            matchedSeating = seating;
            break;
        }
    }
    return matchedSeating;
}

function getSeatType(seatName) {
    return seatName.substring(0, seatName.lastIndexOf('-'));
}

createStripeForm();

removePageRefreshLangCurrency();

async function initializePaymentPage() {
    await verifyURL();
    await verifyPaymentAbility();
    await activateTimer();

}

function removePageRefreshLangCurrency() {
    languageTogglers.forEach(select => {
        select.removeEventListener('change', languageChange);

        select.addEventListener("change", (event) => {
            const language = {name: event.target.value};
            localStorage.setItem("lan", JSON.stringify(language));
            createStripeForm();
            translateStaticHTML();
        });
    });

    currencyTogglers.forEach(toggler => {
        toggler.removeEventListener('change', changeLanguage);

        toggler.addEventListener('change', (event) => {
            const currency = {name: event.target.value};
            localStorage.setItem("currency", JSON.stringify(currency));
            convertStaticPrices();
        })
    });
}

function convertStaticPrices() {
    ticketsTotalElem.innerHTML = convertFromCAD(totalPrice);
    const prices = document.querySelectorAll('.price');
    prices.forEach(price => {
        price.innerHTML = convertFromCAD(price.dataset.price);
    })
}

function translateStaticHTML() {
    const lang = translation(dictionary);
    submitButton.innerHTML = lang.submitButton;

    const seatNameHeader = document.querySelector('.seatName');
    seatNameHeader.innerHTML = lang.table_headers.seatName;

    const seatPriceHeader = document.querySelector('.seatPrice');
    seatPriceHeader.innerHTML = lang.table_headers.price;

    const totalSpan = document.querySelector('.total');
    totalSpan.innerHTML = lang.total;

    const timer_first_part = document.querySelector('.timer_1');
    timer_first_part.innerHTML = lang.timer.first_part;

    const timer_second_part = document.querySelector('.timer_2');
    timer_second_part.innerHTML = lang.timer.second_part;
}

function createStripeForm() {
    totalPrice = 0;
    emailAddress = '';
    rowCounter = 1;
    translateStaticHTML();

    window.onbeforeunload = async (e) => {
        const counterValue = timeleft > 0 ? -1 : 0;
        await sendJSON('/payment/api/set-counter/', {
            counter: counterValue,
            seats: json_tickets,
            concert: json_concert
        }, csrftoken);
    }

    const lang = JSON.parse(localStorage.getItem('lan')).name;
    let stripe;

    if (lang == 'French') {
        stripe = Stripe("pk_test_51MWiMkBuAZbM1te6zbpaMIBq0bVdxmuy8HllH30F4UQN5PJWdJgBTVKp37BJ3dojcLh81ZiL2jGbz4PujaH33scC00XCQHroSn", {
            locale: 'fr'
        });
    } else {
        stripe = Stripe("pk_test_51MWiMkBuAZbM1te6zbpaMIBq0bVdxmuy8HllH30F4UQN5PJWdJgBTVKp37BJ3dojcLh81ZiL2jGbz4PujaH33scC00XCQHroSn");
    }

    (async () => {
        addLoadingCoverEntireContent();
        if (firstTime) {
            await initializePaymentPage();
            firstTime = false;
        }
        specifyTicketDetails();
        await initialize();
        await checkStatus();
    })();


    function specifyTicketDetails() {
        ticketsTable.innerHTML = `${json_tickets.map(ticket => getTicketRow(ticket)).join('')}`;
        ticketsTotalElem.innerHTML = convertFromCAD(totalPrice);
    }

    function getTicketRow(ticket) {
        totalPrice += ticket.price;
        return `
    <tr>
         <th scope="row">${rowCounter++}</th>
         <td>${ticket.seatName}</td>
         <td class="price" data-price="${ticket.price}">${convertFromCAD(ticket.price)}</td>
    </tr>
    `
    }


    form.addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
    async function initialize() {
        const data = {
            price: totalPrice,
            email: emailAddress,
            concert: json_concert,
            tickets: json_tickets
        };
        console.log(data);

        const res = await sendJSON("/payment/api/create-payment-intent/", data, csrftoken);
        const {clientSecret} = await res.json();

        const appearance = {
            theme: 'night',
            variables: {
                colorPrimary: '#e1c107',
                colorBackground: '#0b0b0b',
                colorText: '#bbc2cc',
            },
        };

        elements = stripe.elements({appearance, clientSecret});
        setStripeStyle(localStorage.getItem('theme'));

        const linkAuthenticationElement = elements.create("linkAuthentication");
        linkAuthenticationElement.mount("#link-authentication-element");

        linkAuthenticationElement.on('change', (event) => {
            emailAddress = event.value.email;
        });

        const paymentElementOptions = {
            layout: "tabs",
            style: {
                base: {
                    'input[type="email"]': {
                        display: 'none'
                    }
                }
            }
        };
        console.log('I AM CREATING THE FORM');

        const paymentElement = elements.create("payment", paymentElementOptions);

        paymentElement.mount("#payment-element");
        paymentElement.on('ready', function (event) {
            submitButton.classList.remove('d-none');
            submitButton.classList.add('d-block');
            themeTogglers.forEach(t => {
                t.addEventListener('click', () => {
                    setStripeStyle(localStorage.getItem('theme'));
                });
            });
            console.log(document.querySelector('#root'));
            disableLoadingCoverEntireContent();
            document.getElementById("hidepls").style.display = "block";
        });
    }

    function setStripeStyle(theme) {
        let style;
        if (theme == 'dark') {
            style = {
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#FFC107',
                        colorBackground: '#0b0b0b',
                        colorText: '#BBC2CC',
                    }
                }
            }
        } else {
            style = {
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#0B2E6F',
                        colorBackground: '#F8F9FA',
                        colorText: '#000000',
                    }
                }
            }
        }
        elements.update(style);
    }

    async function handleSubmit(e) {
        setCounter = false;
        e.preventDefault();
        setLoading(true);
        await checkStatus();
        await setEmailInSession(emailAddress);
        submitButton.disabled = true;

        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `http://127.0.0.1:8000/payment/lang/`
            },
        });


        if (error.type === "card_error" || error.type === "validation_error") {
            showMessage(error.message);
        } else {
            showMessage("An unexpected error occurred.");
        }

        if(!error)
        {
            clearInterval(intervalID);
        }


        setLoading(false);
    }

    async function setEmailInSession(email) {
        await sendJSON('/payment/api/set-email/', {
            email: email
        }, csrftoken);
    }

// Fetches the payment intent status after payment submission
    async function checkStatus() {
        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );
        if (!clientSecret) {
            return;
        }

        const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);

        switch (paymentIntent.status) {
            case "succeeded":
                console.log('succeeded');
                showMessage("Payment succeeded!");
                break;
            case "processing":
                console.log('processing');
                showMessage("Your payment is processing.");
                break;
            case "requires_payment_method":
                console.log('requires_payment_method');
                showMessage("Your payment was not successful, please try again.");
                break;
            default:
                console.log('Something went wrong.');
                showMessage("Something went wrong.");
                break;
        }
    }

// ------- UI helpers -------

    function showMessage(messageText) {
        const messageContainer = document.querySelector("#payment_message");

        messageContainer.style.visibility = 'visible';
        messageContainer.textContent = messageText;

        setTimeout(function () {
            messageContainer.style.visibility = 'hidden';
            messageText.textContent = "";
        }, 4000);
    }

// Show a spinner on payment submission
    function setLoading(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
        } else {
            submitButton.disabled = false;
        }
    }
}
