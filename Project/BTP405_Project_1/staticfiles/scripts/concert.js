const dictionary = {
  en: {
    details: "Details",
    performer_name: "Performer Name",
    tickets_available: "Tickets Available",
    cheapest_ticket: "Cheapest Ticket",
    age_to_attend: "Age To Attend",
    date: "Date",
    doors_open: "Doors Open",
    doors_close: "Doors Close",
    venue_name: "Venue Name",
    venue_address: "Venue Address",
    city: "City",
    country: "Country",
    buy_tickets: "BUY TICKETS",
    tickets_sold: "Tickets Sold",
    concert_id: "Concert ID",
    genre: "Genre"
  },
  fr: {
    details: "Détails",
    performer_name: "Nom De L'interprète",
    tickets_available: "Billets Disponibles",
    cheapest_ticket: "Le Billet Le Moins Cher",
    age_to_attend: "Âge Pour Participer",
    date: "Date",
    doors_open: "Portes Ouvertes",
    doors_close: "Fermeture Des Portes",
    venue_name: "Nom Du Lieu",
    venue_address: "Adresse Du Lieu",
    city: "Ville",
    country: "Pays",
    buy_tickets: "ACHETER DES BILLETS",
    tickets_sold: "Billets Vendus",
    concert_id: "Identité Du Concert",
    genre: "Genre"
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // createLoadingCoverForElement(document.getElementById("concert_container"));
  // activateLoadingCoverForElement(document.getElementById("concert_container"));
  addLoadingCoverEntireContent();

  let lang = translation(dictionary);

  let the_url = document.URL;
  the_url = the_url.substring(the_url.lastIndexOf("/") + 1);
  const the_id = parseInt(the_url);

  fetch(`api/concertbyid/?id=${the_id}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      document.getElementById("concertname").innerText = data["name"];
      document.getElementById("performername").innerText =
        `${lang.performer_name}: ` + data["performer"];

      let tickets_available = 0;

      for (let i = 0; i < data["venue"]["seating"].length; ++i) {
        tickets_available += data["venue"]["seating"][i]["available"];
      }

      document.getElementById("ticketsavailable").innerText =
        `${lang.tickets_available}: ` + tickets_available;

      document.getElementById("ticketssold").innerText =
        `${lang.tickets_sold}: ` + data["sold_tickets"];

      document.getElementById("concertid").innerText =
        `${lang.concert_id}: ` + data["_id"];

      document.getElementById("genrename").innerText =
        `${lang.genre}: ` + data["genre"];

      document.getElementById("cheapestticket").innerText =
        `${lang.cheapest_ticket}: ` +
        `${convertFromCAD(data["venue"]["cheapest_seat"])}`;
      document.getElementById("agetoattend").innerText =
        `${lang.age_to_attend}: ` + data["age_to_attend"] + "+";
      document.getElementById(
        "dateofconcert"
      ).innerText = `${lang.date}: ${data["date"]["year"]}/${data["date"]["month"]}/${data["date"]["day"]}`;

      document.getElementById("concertstarttime").innerText =
        `${lang.doors_open}: ` + data["time"]["start"];
      document.getElementById("concertendtime").innerText =
        `${lang.doors_close}: ` + data["time"]["end"];

      document.getElementById("venuename").innerText =
        `${lang.venue_name}: ` + data["venue"]["name"];
      document.getElementById("venueaddress").innerText =
        `${lang.venue_address}: ` + data["venue"]["address"];

      document.getElementById("concertcity").innerText =
        `${lang.city}: ` + data["venue"]["city"];
      document.getElementById("concertcountry").innerText =
        `${lang.country}: ` + data["venue"]["country"];

      document.getElementById("concertimage").src = data["poster"];

      document.getElementById("concert_details").innerText = lang.details;

      const buy_tickets_button = document.getElementById("buytickets_button");

      buy_tickets_button.innerText = lang.buy_tickets;

      buy_tickets_button.addEventListener("click", () => {
        window.location.href = `/concert/seats/?id=${the_id}`;
      });

      // disableLoadingCoverForElement(
      //   document.getElementById("concert_container")
      // );
      disableLoadingCoverEntireContent();
    })
    .catch((err) => {
      console.log(err);
    });
});
