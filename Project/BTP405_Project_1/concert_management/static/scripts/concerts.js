const dictionary = {
  en: {
    search_by: {
      genre: "Genre",
      country: "Country",
      city: "City",
      age_to_attend: "Age To Attend",
      performer: "Performer",
      price: "Price",
      venue: "Venue",
    },
    concert_id: "Concert ID",
    genres: {
      blues: "Blues",
      classical: "Classical",
      country: "Country",
      dance: "Dance",
      electronic: "EDM",
      folk: "Folk",
      hiphop: "Hip-Hop",
      jazz: "Jazz",
      metal: "Metal",
      pop: "Pop",
      reggae: "Reggae",
      rock: "Rock",
      soul: "Soul",
      world: "World",
    },
    view_concert: "View Concert",
    date: "Date",
    location: "Location",
    cheapest_is: "Cheapest is",
    per_person: "per person",
    views: "views",
    deals: "Deals",
    top_sellers: "Top Sellers",
    disability_accessible: "Disability Accessible",
    search: "Search",
    tickets_sold: "tickets sold"
  },
  fr: {
    search_by: {
      genre: "Genre",
      country: "Pays",
      city: "Ville",
      age_to_attend: "Âge Pour Participer",
      performer: "Interprète",
      price: "Prix",
      venue: "Lieu",
    },
    concert_id: "ID Du Concert",
    genres: {
      blues: "Blues",
      classical: "Classique",
      country: "Country",
      dance: "Danse",
      electronic: "EDM",
      folk: "Folk",
      hiphop: "Hip-Hop",
      jazz: "Jazz",
      metal: "Metal",
      pop: "Pop",
      reggae: "Reggae",
      rock: "Rock",
      soul: "Soul",
      world: "Du Monde",
    },
    view_concert: "Voir Le Concert",
    date: "Date",
    location: "Localisation",
    cheapest_is: "Le moins cher",
    per_person: "par personne",
    views: "vues",
    deals: "Affaires",
    top_sellers: "Meilleures Ventes",
    disability_accessible: "Accessible Aux Handicapés",
    search: "Recherche",
    tickets_sold: "billets vendus"
  },
};

concertsToggler.addEventListener("click", () => {
  const query = getQueryAsObj();
  closeSidenavButton.click();
  const apiURL = create_api_url(query);
  getDataAndCreateConcertCards(apiURL);
});

/**Generates buttons based on genres available */
function generateGenreList() {
  let ul = document.getElementById("genre_navbar_items");
  let ul_2 = document.getElementById("genre_navbar_items_2");

  let lang = translation(dictionary);

  ul.innerHTML = "";
  ul_2.innerHTML = "";

  let genres_lang = [
    lang.genres.blues,
    lang.genres.classical,
    lang.genres.country,
    lang.genres.dance,
    lang.genres.electronic,
    lang.genres.folk,
    lang.genres.hiphop,
    lang.genres.jazz,
    lang.genres.metal,
    lang.genres.pop,
    lang.genres.reggae,
    lang.genres.rock,
    lang.genres.soul,
    lang.genres.world,
  ];

  let genres = [
    "Blues",
    "Classical",
    "Country",
    "Dance",
    "EDM",
    "Folk",
    "Hip-Hop",
    "Jazz",
    "Metal",
    "Pop",
    "Reggae",
    "Rock",
    "Soul",
    "World",
  ];

  ul.innerHTML = "";

  for (let i = 0; i < genres.length / 2; ++i) {
    ul.innerHTML += `
                    <button id="genre${genres[i]}" style="width: 150px;" class="btn button_color concert-navbar-element navbar-brand fixed-size-btn">${genres_lang[i]}</button>               
                `;
  }

  for (let i = genres.length / 2; i < genres.length; ++i) {
    ul_2.innerHTML += `
                    <button id="genre${genres[i]}" style="width: 150px;" class="btn button_color concert-navbar-element navbar-brand fixed-size-btn" >${genres_lang[i]}</button>               
                `;
  }

  for (let i = 0; i < genres.length; ++i) {
    document
      .getElementById(`genre${genres[i]}`)
      .addEventListener("click", () => {
        addQueryToURL({ genre: genres[i] });
        getDataAndCreateConcertCards(
          `/concert/api/bygenre/?genre=${genres[i]}`
        );
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  generateGenreList();
});

/**Displays an array of concert objects as cards */
function generateConcertCards(data) {
  let format = "";

  let lang = translation(dictionary);

  for (let i = 0; i < data.length; ++i) {
    format += `
            <div class="row">
                <div class="card max-w-md shadow-lg mx-auto mb-3 background_color attention_color">
                    <div class="row no-gutters border_color">
                        <div class="col-md-4 image_resizing">
                            <img src="${data[i]["poster"]}" id="${
      data[i]["poster"]
    }${data[i]["_id"]}"class="card-img concert_image">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title font-weight-bold">${
                                  data[i]["name"]
                                }</h5>
                                
                                
                                
                                <p class="card-text regular_color">${
                                  lang.concert_id
                                }: ${data[i]["_id"]}</p>
                                <p class="card-text regular_color">${
                                  lang.search_by.performer
                                }: ${data[i]["performer"]}</p>
                                
                                <p class="card-text regular_color">${
                                  lang.date
                                }: ${data[i]["date"]["year"]}/${
      data[i]["date"]["month"]
    }/${data[i]["date"]["day"]}</p>
                                
                                
                                
                                <p class="card-text regular_color">${
                                  lang.search_by.venue
                                }: ${data[i]["venue"]["name"]}</p>
                                
                                
                                
                                <p class="card-text regular_color">${
                                  lang.location
                                }: ${data[i]["venue"]["city"]}, ${
      data[i]["venue"]["country"]
    }</p>
                                <p class="card-text regular_color">${
                                  lang.search_by.age_to_attend
                                }: ${data[i]["age_to_attend"]}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="card-text regular_color">
                                        ${lang.cheapest_is} ${convertFromCAD(
      data[i]["venue"]["cheapest_seat"]
    )} ${lang.per_person}<br>
                                        <small class="text-muted">${
                                          data[i]["times_viewed"]
                                        } ${lang.views}</small>
                                        <br>
                                        <small class="text-muted">${
                                          data[i]["sold_tickets"]
                                        } ${lang.tickets_sold}</small>
                                    </div>
                                    <button class="btn button_color button_resize" id="concert_button_${
                                      data[i]["_id"]
                                    }">${lang.view_concert}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
  }

  document.getElementById("cards_container").innerHTML = format;

  for (let i = 0; i < data.length; ++i) {
    document
      .getElementById(`concert_button_${data[i]["_id"]}`)
      .addEventListener("click", () => {
        addLoadingCoverEntireContent();
        data[i]["times_viewed"] = data[i]["times_viewed"] + 1;

        fetch("/concert/api/updateconcert/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data[i]),
        })
          .then((response) => response.json())
          .then((answer) => {
            console.log("Success:", answer);

            window.location.href = `/concert/${data[i]["_id"]}`;
          })
          .catch((err) => {
            console.log(err);
          });
      });

    document
      .getElementById(`${data[i]["poster"]}${data[i]["_id"]}`)
      .addEventListener("click", () => {
        addLoadingCoverEntireContent();
        data[i]["times_viewed"] = data[i]["times_viewed"] + 1;

        fetch("/concert/api/updateconcert/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data[i]),
        })
          .then((response) => response.json())
          .then((answer) => {
            console.log("Success:", answer);

            window.location.href = `/concert/${data[i]["_id"]}`;
          })
          .catch((err) => {
            console.log(err);
          });
      });

    document.getElementById(
      `${data[i]["poster"]}${data[i]["_id"]}`
    ).style.cursor = "pointer";
  }
}

function getDataAndCreateConcertCards(api_url) {
  let cards_container = document.getElementById("cards_container");
  createLoadingCoverForElement(cards_container);
  activateLoadingCoverForElement(cards_container);
  //addLoadingCoverEntireContent();
  fetch(api_url)
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      generateConcertCards(data);
      disableLoadingCoverEntireContent();
    })
    .catch((err) => {
      console.log(err);
    });
}

document.getElementById("dealslink").addEventListener("click", () => {
  getDataAndCreateConcertCards(`/concert/api/deals/?deal=true`);
});

document.getElementById("topsellerslink").addEventListener("click", () => {
  getDataAndCreateConcertCards(`/concert/api/topsellers/`);
});

document.getElementById("disabilitylink").addEventListener("click", () => {
  getDataAndCreateConcertCards(`/concert/api/disability/?accessible=True`);
});

document.getElementById("dateinput").addEventListener("change", () => {
  const date = new Date(document.getElementById("dateinput").value);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate() + 1;

  getDataAndCreateConcertCards(
    `/concert/api/bydateandtime/?year=${year}&month=${month}&day=${day}`
  );
});

/**Loads top sellers on DOMContentLoaded as modals*/
window.addEventListener("DOMContentLoaded", () => {
  document.body.style.cursor = "wait";
  const query = getQueryAsObj();
  if (Object.keys(query).length === 0) {
    getDataAndCreateConcertCards("/concert/api/topsellers/");
  } else {
    const apiURL = create_api_url(query);
    getDataAndCreateConcertCards(apiURL);
  }
});

window.addEventListener("load", () => {
  let lang = translation(dictionary);

  document.getElementById("disabilitylink").innerText =
    lang.disability_accessible;
  document.getElementById("topsellerslink").innerText = lang.top_sellers;
  document.getElementById("dealslink").innerText = lang.deals;
  document.getElementById("concert_search_button").innerText = lang.search;
  document.getElementById("concerts_search_box").placeholder = lang.search;

  document.getElementById("concerts_selection_box").innerHTML = `
            <option value="Genre">${lang.search_by.genre}</option>
            <option value="Country" selected>${lang.search_by.country}</option>
            <option value="City">${lang.search_by.city}</option>
            <option value="Age To Attend">${lang.search_by.age_to_attend}</option>
            <option value="Performer">${lang.search_by.performer}</option>
            <option value="Price">${lang.search_by.price}</option>
            <option value="Venue">${lang.search_by.venue}</option>
      `;
});

function create_api_url(query) {
  let apiURL = "/concert/api/";
  for (const key in query) {
    console.log(key);
    console.log(query[key]);
    apiURL += `by${key}/?${key}=${query[key]}`;
  }
  console.log(apiURL);
  return apiURL;
}

/**Fetches the proper data based on the selection box and passes data to modal creator*/
document
  .getElementById("concert_search_button")
  .addEventListener("click", (event) => {
    document.body.style.cursor = "wait";
    let search_by = document.getElementById("concerts_selection_box")
      .selectedOptions[0].value;
    let search_query = document.getElementById("concerts_search_box").value;
    if (search_by === "Genre") {
      getDataAndCreateConcertCards(
        `/concert/api/bygenre/?genre=${search_query}`
      );
    } else if (search_by === "Country") {
      getDataAndCreateConcertCards(
        `/concert/api/bycountry/?country=${search_query}`
      );
    } else if (search_by === "City") {
      getDataAndCreateConcertCards(`/concert/api/bycity/?city=${search_query}`);
    } else if (search_by === "Age To Attend") {
      if(parseInt(search_by) == search_by)
      {
        getDataAndCreateConcertCards(`/concert/api/byage/?age=${search_query}`);
      }
      else
      {
        getDataAndCreateConcertCards(`/concert/api/byage/?age=0`);
      }

    } else if (search_by === "Performer") {
      getDataAndCreateConcertCards(
        `/concert/api/performername/?performername=${search_query}`
      );
    } else if (search_by === "Price") {

      if(parseFloat(search_by) == search_by)
      {
              getDataAndCreateConcertCards(
        `/concert/api/byprice/?price=${search_query}`
      );
      }
      else
      {
        getDataAndCreateConcertCards(
        `/concert/api/byprice/?price=0`
      );
      }

    } else if (search_by === "Venue") {
      getDataAndCreateConcertCards(`/concert/api/venue/?name=${search_query}`);
    }
  });

document
  .getElementById("concerts_search_box")
  .addEventListener("keyup", function (event) {
    if (event.keyCode === 13 || event.key === "Enter") {
      document.getElementById("concert_search_button").click();
    }
  });
