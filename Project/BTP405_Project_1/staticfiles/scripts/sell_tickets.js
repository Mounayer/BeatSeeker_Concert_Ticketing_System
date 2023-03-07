document.addEventListener("DOMContentLoaded", () => {
    addLoadingCoverEntireContent();
});

let sellTicketForm = document.getElementById('sellrequest');

function isMilitaryTime(time) {
    let parts = time.split(":");
    if (parts.length !== 2) {
        return false;
    } else if (parts[0].length > 2 || parts[1].length > 2) {
        return false;
    }

    let hours = parseInt(parts[0]);
    let minutes = parseInt(parts[1]);

    if (isNaN(hours) || isNaN(minutes)) {
        return false;
    }

    if (hours < 0 || hours > 23) {
        return false;
    }

    if (minutes < 0 || minutes > 59) {
        return false;
    }

    let date = new Date();
    date.setHours(hours, minutes);

    return date.getHours() === hours && date.getMinutes() === minutes;
}

function displayRequestForm() {
    fetch("/concert/api/venues/")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            sellTicketForm.innerHTML = `<br>
        <div class="container">
            <div class="ticket-container">
            <div class="ticket-info-box">
                <h2 class="text-center concert_title attention_color font_family" style="margin-top: 0;">*Concert Name</h2>
            <div class="form-group mb-3">
                <input type="text" name="concertname" id="concertname" placeholder="Concert Name" class="form-control" required>
                <div><small id="usernameerror" class="font_family" style="color: red;"></small></div>
            </div>
                <div class="divider dividor_color"></div>
                <p  class="detail_list_item regular_color">*Poster URL:</p>
                <div class="form-group mb-3">
                    <input type="text" name="concertimageurl" id="concertimageurl" placeholder="https://i.imgur.com/y8wLfxd.jpeg" class="form-control" required>
                </div>   
            <div class="ticket-img-box">         
                <img id="concertimage" src="https://via.placeholder.com/450x300" alt="Concert Poster" class="ticket-img img-fluid"/>
            </div>
            <button class="btn button_color font_family" id="submit_request_button">Submit Request</button>
            <p style="color: red;" id="global_error_message"></p>
        </div>
        <div class="ticket-info-box">
          <h2 class="text-center concert_title attention_color font_family" style="margin-top: 0;">Details</h2>
          <div class="divider dividor_color"></div>
            <br>
            <p id="performer_name" class="detail_list_item regular_color">*Performer Name:</p>
            <div class="form-group mb-3">
                <input type="text" name="performername" id="performername" placeholder="Performer Name" class="form-control" required>
            </div>
            
            <p class="detail_list_item regular_color">*Genre:</p>
            <div class="form-group mb-3">
                <select id="genrename" name="genrename" class="form-control" required>
                <option selected disabled value="#">Select Genre</option>
                <option value="Blues">Blues</option>
                <option value="Classical">Classical</option>
                <option value="Country">Country</option>
                <option value="Dance">Dance</option>
                <option value="EDM">Electronic</option>
                <option value="Folk">Folk</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Jazz">Jazz</option>
                <option value="Metal">Metal</option>
                <option value="Pop">Pop</option>
                <option value="Reggae">Reggae</option>
                <option value="Rock">Rock</option>
                <option value="Soul">Soul</option>
                <option value="World">World</option>          
            </select>  </div>
                                               
            <p id="age_toattend" class="detail_list_item regular_color">*Age to Attend:</p>
            <div class="form-group mb-3">
                <input type="number" name="agetoattend" id="agetoattend" placeholder="25" class="form-control" required>
                <div><small id="age_to_attend_error" class="font_family" style="color: red;"></small></div>
            </div>               
            
            
            <p id="dateofconcert" class="detail_list_item regular_color">*Date:</p>
            <div class="form-group mb-3">
                <input type="date" class="form-control mr-3" id="concertdate">
            </div>  
            
            
            <p id="concertstarttime" class="detail_list_item regular_color">*Doors Open:</p>
            <div class="form-group mb-3">
                <input type="text" name="concertdoorsopen" id="concertdoorsopen" placeholder="18:30" class="form-control" required>
                <div><small id="doors_open_error" class="font_family" style="color: red;"></small></div>
            </div>
            
            
            <p id="concertendtime" class="detail_list_item regular_color">*Doors Close:</p>
            <div class="form-group mb-3">
                <input type="text" name="concertdoorsclose" id="concertdoorsclose" placeholder="20:30" class="form-control" required>
                <div><small id="doors_close_error" class="font_family" style="color: red;"></small></div>
            </div>    
                     
            <div class="form-group form-check d-flex align-items-center regular_color">
                <label class="mb-0">
                    <input id="disability_access" type="checkbox" class="form-check-input mr-2">Disability Access
                </label>
            </div>

            <div class="form-group form-check d-flex align-items-center regular_color">
                <label class="mb-0">
                    <input id="deal" type="checkbox" class="form-check-input mr-2">Deal
                </label>
            </div>
            
            
            
            
        
            <p id="venue_name" class="detail_list_item regular_color">*Venue Name:</p>
            <div class="form-group mb-3">
                <select id="venuename" name="venuename" class="form-control" required>
                <option selected disabled value="#">Select Venue</option>
            </select>        
            `;

            for (let i = 0; i < data.length; ++i) {
                document.getElementById(
                    "venuename"
                ).innerHTML += `<option id="${i}option" value="${data[i].name}">${data[i].name}</option>`;
                if (i === data.length) {
                    sellTicketForm += `</div>`;
                }
            }

            sellTicketForm.innerHTML += `
                      <p id="venue_address" class="detail_list_item regular_color">Venue Address:</p>
                      <div class="form-group mb-3">
                          <input type="text" name="venueaddress" value="" id="venueaddress" class="form-control" required readonly>
                          <div><small id="usernameerror" class="font_family" style="color: red;"></small></div>
                      </div>
          
          
          
                      <p id="concertcity" class="detail_list_item regular_color">City:</p>
                      <div class="form-group mb-3">
                          <input type="text" name="venuecity" readonly id="venuecity" value="" class="form-control" required>
                          <div><small id="usernameerror" class="font_family" style="color: red;"></small></div>
                      </div>
          
                      <p id="concertcountry" class="detail_list_item regular_color">Country:</p>
                      <div class="form-group mb-3">
                          <input type="text" name="venuecountry" id="venuecountry" value="" class="form-control" required>
                          <div><small id="usernameerror" class="font_family" style="color: red;"></small></div>
                      </div>
                                             
                              <div class="form-group mb-3"> 
                              <p id="seatingarrangement" class="detail_list_item regular_color">Seats:</p>  
                       <table class="table">
                          <thead class="thead-dark">
                              <tr>
                                  <th scope="col" class="regular_color">Seat Type</th>
                                  <th scope="col" class="regular_color">Total Amount</th>
                                  <th scope="col" class="regular_color">*Amount To Reserve</th>
                                  <th scope="col" class="regular_color">*Price Per Seat</th>
                              </tr>
                          </thead>
                          <tbody id="seattable">
                          </tbody>
                       </table>          
                      </div>
                        <p id="tickets_available" class="detail_list_item regular_color">Tickets Available:</p>
                            <div class="form-group mb-3">
                            <input type="number" name="ticketsavailable" id="ticketsavailable" placeholder="0" class="form-control" required>
                            <div><small id="usernameerror" class="font_family" style="color: red;"></small></div>
                            </div>                         
                      <br>`;
            return data;
        })
        .then((data) => {
            document
                .getElementById("concertdoorsopen")
                .addEventListener("change", () => {
                    if (
                        !isMilitaryTime(document.getElementById("concertdoorsopen").value)
                    ) {
                        document.getElementById("doors_open_error").innerText =
                            "*Time format should be in HH:MM";
                    } else {
                        document.getElementById("doors_open_error").innerText = "";
                    }
                });

            document
                .getElementById("concertdoorsclose")
                .addEventListener("change", () => {
                    if (
                        !isMilitaryTime(document.getElementById("concertdoorsclose").value)
                    ) {
                        document.getElementById("doors_close_error").innerText =
                            "*Time format should be in HH:MM";
                    } else {
                        document.getElementById("doors_close_error").innerText = "";
                    }
                });

            document.getElementById("agetoattend").addEventListener("change", () => {
                if (+document.getElementById("agetoattend").value < 0) {
                    document.getElementById("age_to_attend_error").innerText =
                        "*Age To Attend cannot be less than 0";
                } else {
                    document.getElementById("age_to_attend_error").innerText = "";
                }
            });

            document.getElementById(`venuename`).addEventListener("change", () => {
                for (let i = 0; i < data.length; ++i) {
                    if (
                        data[i]["name"] ===
                        document.getElementById("venuename").selectedOptions[0].innerText
                    ) {
                        document.getElementById("venueaddress").value = data[i]["address"];
                        document.getElementById("venuecity").value = data[i]["city"];
                        document.getElementById("venuecountry").value = data[i]["country"];
                        document.getElementById("seattable").innerHTML = "";
                        for (let j = 0; j < data[i]["seating"].length; ++j) {
                            document.getElementById("seattable").innerHTML += `
                               <tr class="regular_color">
                                  <th scope="row">${data[i]["seating"][j]["type"]}</th>
                                  <td>${data[i]["seating"][j]["total"]}</td>
                                  <td><input type="number" min="0" name="${data[i]["seating"][j]["type"]}number" id="${data[i]["seating"][j]["type"]}number"  class="form-control" required placeholder="0"></td>
                                  <td><input type="number" min="0" name="${data[i]["seating"][j]["type"]}price" id="${data[i]["seating"][j]["type"]}price" class="form-control" required placeholder="0.0"></td>
                              </tr>                  
                  `;
                        }

                        for (let j = 0; j < data[i]["seating"].length; ++j) {
                            let tickets_available =
                                document.getElementById("ticketsavailable");
                            let seat_number = document.getElementById(
                                `${data[i]["seating"][j]["type"]}number`
                            );

                            seat_number.addEventListener("change", () => {
                                let total = 0;

                                for (let k = 0; k < data[i]["seating"].length; ++k) {
                                    let number_of_seats = document.getElementById(
                                        `${data[i]["seating"][k]["type"]}number`
                                    );

                                    if (number_of_seats.value < 0) {
                                        number_of_seats.value = 0;
                                    }

                                    if (number_of_seats.value > data[i]["seating"][k]["total"]) {
                                        number_of_seats.value = data[i]["seating"][k]["total"];
                                    }
                                    total += +number_of_seats.value;
                                }

                                if (total > data[i]["seat_count_total"]) {
                                    tickets_available.value = data[i]["seat_count_total"];
                                } else {
                                    tickets_available.value = total;
                                }
                            });
                        }
                    }
                }
            });

            document
                .getElementById("concertimageurl")
                .addEventListener("change", () => {
                    let the_url = document.getElementById("concertimageurl").value;
                    let concert_poster = document.getElementById("concertimage");

                    if (
                        the_url !== "" &&
                        (the_url.endsWith(".jpeg") ||
                            the_url.endsWith(".gif") ||
                            the_url.endsWith(".png") ||
                            the_url.endsWith(".apng") ||
                            the_url.endsWith(".svg") ||
                            the_url.endsWith(".bmp") ||
                            the_url.endsWith(".jpg"))
                    ) {
                        concert_poster.src = the_url;
                    } else {
                        concert_poster.src = "https://via.placeholder.com/450x300";
                    }
                });

            // Create button event listener
            document
                .getElementById("submit_request_button")
                .addEventListener("click", () => {
                    let concertname = document.getElementById("concertname").value;
                    let posterurl = document.getElementById("concertimageurl").value;
                    let performer_name = document.getElementById("performername").value;
                    let age_to_attend = document.getElementById("agetoattend").value;
                    // do date here

                    const date = new Date(document.getElementById("concertdate").value);

                    let year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    let day = date.getDate() + 1;

                    let concert_start_time =
                        document.getElementById("concertdoorsopen").value;
                    let concert_end_time =
                        document.getElementById("concertdoorsclose").value;
                    let venue_name =
                        document.getElementById("venuename").selectedOptions[0].value;
                    let tickets_available =
                        document.getElementById("ticketsavailable").value;

                    let genre =
                        document.getElementById("genrename").selectedOptions[0].value;

                    // returns bool
                    let disability_access =
                        document.getElementById("disability_access").checked;

                    let deal = document.getElementById("deal").checked;

                    let sold_tickets = 0;

                    let times_viewed = 0;
                    let venue = {};

                    if (
                        concertname !== "" &&
                        posterurl !== "" &&
                        performer_name !== "" &&
                        age_to_attend &&
                        age_to_attend > 0 &&
                        year &&
                        month &&
                        day &&
                        concert_start_time &&
                        concert_end_time &&
                        venue_name !== "#" &&
                        tickets_available &&
                        genre !== "#"
                    ) {
                        for (let i = 0; i < data.length; ++i) {
                            if (data[i]["name"] === venue_name) {
                                venue = data[i];
                                break;
                            }
                        }

                        let price_list = [];

                        for (let i = 0; i < venue["seating"].length; ++i) {
                            venue["seating"][i]["price"] = +document.getElementById(
                                `${venue["seating"][i]["type"]}price`
                            ).value;
                            price_list.push(venue["seating"][i]["price"]);

                            venue["seating"][i]["available"] = +document.getElementById(
                                `${venue["seating"][i]["type"]}number`
                            ).value;
                            venue["seating"][i]["available_for_booking"] =
                                +document.getElementById(`${venue["seating"][i]["type"]}number`)
                                    .value; ////////

                            venue["seating"][i]["sold"] = 0;
                            venue["seating"][i]["seats"] = [];

                            for (
                                let j = 0;
                                j < venue["seating"][i]["available_for_booking"];
                                ++j
                            ) {
                                venue["seating"][i]["seats"].push({
                                    id: j + 1,
                                    vacant: true,
                                });
                            }
                        }

                        let cheapest_seat = Math.min(...price_list);

                        venue["cheapest_seat"] = cheapest_seat;

                        if (cheapest_seat !== 0) {
                            addLoadingCoverEntireContent();
                            fetch("/selltickets/api/nextrequestid/")
                                .then((response) => {
                                    return response.json();
                                })
                                .then((data) => {
                                    let concert = {
                                        _id: data["_id"],
                                        name: concertname,
                                        poster: posterurl,
                                        performer: performer_name,
                                        sold_tickets: sold_tickets,
                                        times_viewed: times_viewed,
                                        genre: genre,
                                        tickets_available: +tickets_available,
                                        age_to_attend: +age_to_attend,
                                        disability_accessible: disability_access,
                                        deal: deal,
                                        date: {
                                            year: year,
                                            month: month,
                                            day: day,
                                        },
                                        time: {
                                            start: concert_start_time,
                                            end: concert_end_time,
                                        },
                                        venue: venue,
                                    };

                                    fetch("/selltickets/api/sellrequest/", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(concert),
                                    })
                                        .then((response) => {
                                            return response.json();
                                        })
                                        .then((data) => {
                                            sellTicketForm.innerHTML = `<div class="ticket-info-box">
                                            <h2 class="text-center attention_color" style="margin-top: 0;" id="concertname">Request Submitted</h2>
                                                </div>
                                            `;
                                            disableLoadingCoverEntireContent();
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        } else {
                            document.getElementById("global_error_message").innerText =
                                "A ticket price cannot be 0";
                        }
                    } else {
                        document.getElementById("global_error_message").innerText =
                            "Please fill out all the required fields that begin with *";
                    }
                });
                disableLoadingCoverEntireContent();
        })
        .catch((err) => {
            console.log(err);
        });
}

displayRequestForm();