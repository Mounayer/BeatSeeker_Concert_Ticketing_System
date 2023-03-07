const dictionary = {
  en: {
    timer: {
      first_part: "You have",
      second_part: "for payment",
      minutes: "minutes",
      seconds: "seconds",
      timer_info: "You are paying with your linked credit card",
    },
    table_headers: {
      seatName: "Seat Name",
      price: "Price",
    },
    total: "Total",
    submitButton: "Pay now",
  },
  fr: {
    timer: {
      first_part: "Vous avez",
      second_part: "pour le paiement",
      minutes: "minutes",
      seconds: "secondes",
      timer_info: "Vous payez avec votre carte de crédit liée",
    },
    table_headers: {
      seatName: "Nom du siège",
      price: "Prix",
    },
    total: "Total",
    submitButton: "Payer maintenant",
  },
};

const form = document.querySelector("#payment-form");
const timeout = document.querySelector(".timeout");
const paymentButton = document.querySelector(".pay_button");
const userInfoElem = document.querySelector(".user_info");
const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const ticketsTable = document.querySelector(".tickets_table tbody");
const ticketsTotalElem = document.querySelector(".tickets_total");
const submitButton = document.querySelector(".pay_button");

let timeleft;
let seatNames;
let intervalID;

const json_tickets = [];
let json_concert;

removePageRefreshLangCurrency();
translateStaticHTML();

function removePageRefreshLangCurrency() {
  languageTogglers.forEach((select) => {
    select.removeEventListener("change", languageChange);

    select.addEventListener("change", (event) => {
      const language = { name: event.target.value };
      localStorage.setItem("lan", JSON.stringify(language));
      translateStaticHTML();
    });
  });

  currencyTogglers.forEach((toggler) => {
    toggler.removeEventListener("change", changeLanguage);

    toggler.addEventListener("change", (event) => {
      const currency = { name: event.target.value };
      localStorage.setItem("currency", JSON.stringify(currency));
      convertStaticPrices();
    });
  });
}

function convertStaticPrices() {
  ticketsTotalElem.innerText = convertFromCAD(parseFloat(totalPrice));
  const prices = document.querySelectorAll(".price");
  prices.forEach((price) => {
    price.innerHTML = convertFromCAD(price.dataset.price);
  });
}

function translateStaticHTML() {
  const lang = translation(dictionary);
  submitButton.innerHTML = lang.submitButton;

  const seatNameHeader = document.querySelector(".seatName");
  seatNameHeader.innerHTML = lang.table_headers.seatName;

  const seatPriceHeader = document.querySelector(".seatPrice");
  seatPriceHeader.innerHTML = lang.table_headers.price;

  const totalSpan = document.querySelector(".total");
  totalSpan.innerHTML = lang.total;

  const timer_first_part = document.querySelector(".timer_1");
  timer_first_part.innerHTML = lang.timer.first_part;

  const timer_second_part = document.querySelector(".timer_2");
  timer_second_part.innerHTML = lang.timer.second_part;

  const timer_info = document.querySelector(".timer_info");
  timer_info.innerHTML = lang.timer.timer_info;
}

window.onbeforeunload = async (e) => {
  const counterValue = timeleft > 0 ? -1 : 0;
  await sendJSON(
    "/payment/api/set-counter/",
    {
      counter: counterValue,
      seats: json_tickets,
      concert: json_concert,
    },
    csrftoken
  );
};

async function activateTimer() {
  intervalID = setInterval(() => {
    if (timeleft == 0) {
      clearInterval(intervalID);
      redirect("/");
    } else {
      updateTimeout();
      timeleft -= 1;
    }
  }, 1000);

  function updateTimeout() {
    const minutes = Math.trunc(timeleft / 60);
    const seconds = timeleft - minutes * 60;
    timeout.innerHTML = `${minutes} minutes ${seconds} seconds`;
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
  if (json.messsage && json.message == "Not Found") {
    redirect("/concert/all");
  } else {
    return json;
  }
}

function getSeatNames() {
  const ticketsQuery = getQueryParameter("tickets");
  const tickets = ticketsQuery
    .substring(1)
    .substring(0, ticketsQuery.length - 2);
  return tickets.split(",");
}

async function verifyConcert() {
  const concert = await getConcertByID();
  if (concert.message && concert.message == "Not Found")
    redirect("/concert/all");
  return concert;
}

function verifySeatNames(concert) {
  seatNames = getSeatNames();
  for (const seatName of seatNames) {
    if (!seatIsAvailable(concert.venue, seatName)) {
      redirect("/concert/all");
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
    venueName: concert.venue.name,
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
  const seatType = getSeatType(seatName);
  const seatNumber = +getSeatNumber(seatName) - 1;
  const seating = getSeatingOfType(venue, seatType);
  if (seating != null) {
    storeJSONSeat(seating, seatName);
  }
  return seating == null ? false : seating.seats[seatNumber].vacant;
}

function getSeatNumber(seatName) {
  return seatName.substring(seatName.lastIndexOf("-") + 1, seatName.length);
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
  return seatName.substring(0, seatName.lastIndexOf("-"));
}

(async () => {
  addLoadingCoverEntireContent();
  await verifyURL();
  await verifyPaymentAbility();
  await specifyUserDetails();
  await activateTimer();
  disableLoadingCoverEntireContent();
  document.getElementById("hideplsmore").style.display = "block";
})();
let totalPrice = 0;

async function specifyUserDetails() {
  const userDetails = await getUserDetails();
  userInfoElem.innerHTML = userDetails.fourDigits;
  ticketsTable.innerHTML = `${json_tickets
    .map((ticket) => getTicketRow(ticket))
    .join("")}`;
  ticketsTotalElem.innerHTML = convertFromCAD(totalPrice);
}

let rowCounter = 1;

function getTicketRow(ticket) {
  totalPrice += ticket.price;
  return `
    <tr>
         <th scope="row">${rowCounter++}</th>
         <td>${ticket.seatName}</td>
         <td class="price" data-price="${ticket.price}">${convertFromCAD(
    ticket.price
  )}</td>
    </tr>
    `;
}

async function getUserDetails() {
  const res = await sendGET("/user/api/user_card");
  const json = await res.json();
  console.log(json);
  return json;
}

async function verifyPaymentAbility() {
  const res = await sendJSON(
    "/payment/api/get-counter/",
    { seats: json_tickets, concert: json_concert },
    csrftoken
  );
  const json = await res.json();
  timeleft = json.counter;
  if (timeleft < 0) timeleft = 0;
}

paymentButton.addEventListener("click", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  paymentButton.disabled = true;

  const res = await sendJSON(
    "/payment/api/pay",
    {
      tickets: json_tickets,
      concert: json_concert,
    },
    csrftoken
  );
  const json = await res.json();

  if (json.status) {
    clearInterval(intervalID);
    redirect(`/payment/lang/`);
  } else {
    showMessage("Something went wrong. Please try again.");
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment_message");

  messageContainer.style.visibility = "visible";
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.style.visibility = "hidden";
    messageText.textContent = "";
  }, 4000);
}
