const dictionary = {
    en: {
        headers: {
            concertinfo: "Concert Information",
            tickets: "Tickets"
        },
        labels: {
            username: "Username",
            email: "Email",
            memberdate: "Member since",
            card: "Card"
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
        }
    },
    fr: {
        headers: {
            concertinfo: "Information sur le concert",
            tickets: "Billets"
        },
        labels: {
            username: "Nom d'utilisateur",
            email: "E-mail",
            memberdate: "Membre depuis",
            card: "Carte"
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
        }
    }
};
document.addEventListener("DOMContentLoaded", () => {
    addLoadingCoverEntireContent();
    let url = document.URL;
    url = url.substring(url.lastIndexOf("/") + 1);
    const p_id = parseInt(url);
    let lang = translation(dictionary);

    fetch(`/user/api/tickets/?id=${p_id}`)
    .then(res => res.json())
    .then(data => {
        let htmlContent = `
            <div class="row">
                <div class="left_spacer"></div>
                <div class="tickets_resize">
                    <div class="text-left">
                        <button class="button_color btn back_button">Back to Profile</button>
                    </div>
                    <fieldset class="border_color">
                        <legend class="w-auto p-2 attention_color">${lang.headers.concertinfo}</legend>
                        <table class="table concert-table">
                            <tbody>
                                <tr>
                                    <th class="regular_color left text-left">${lang.table_label.purchase_date}:</th>
                                    <td class="regular_color">${data["purchaseDate"]}</td>
                                </tr>
                                <tr>
                                    <th class="regular_color left text-left">${lang.table_label.concert_name}:</th>
                                    <td class="regular_color">${data["concert"]}</td>
                                </tr>
                                <tr>
                                    <th class="regular_color left text-left">${lang.table_label.artist}:</th>
                                    <td class="regular_color">${data["artist"]}</td>
                                </tr>
                                <tr>
                                    <th class="regular_color left text-left">${lang.table_label.concert_date}:</th>
                                    <td class="regular_color">${data["concertDate"]}</td>
                                </tr>
                                <tr>
                                    <th class="regular_color left text-left">${lang.table_label.venue}:</th>
                                    <td class="regular_color">${data["venue"]}</td>
                                </tr>
        `;

        htmlContent += `
                        </tbody>
                    </table>
                </fieldset>
                <br><br>
                <fieldset class="border_color">
                    <legend class="w-auto p-2 attention_color">${lang.headers.tickets}</legend>
                    <table class="table ticket-table">
                        <thead>
                            <tr class="header">
                                <th class="regular_color">${lang.table_label.ticket} #</th>
                                <th class="regular_color">${lang.table_label.seat}</th>
                                <th class="regular_color">${lang.table_label.price}</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        for (let ticket of data["tickets"])
        htmlContent += `
            <tr>
                <td class="regular_color">${ticket.ticketId}</td>
                <td class="regular_color">${ticket.seat}</td>
                <td class="regular_color">${convertFromCAD(ticket.price)}</td>
            </tr>
        `;

        htmlContent +=`                          
                                </tbody>
                            </table>
                        </fieldset>
                    </div>
                <div class="right_spacer"></div>
            </div>
        `;

        document.getElementById("purchase_content").innerHTML = htmlContent;
    })
    .then(() => {
        document.querySelector(".back_button").addEventListener('click', () => {
            window.location.href = '/user';
        });
        disableLoadingCoverEntireContent();
    });
})
