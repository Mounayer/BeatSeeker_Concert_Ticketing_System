$(document).ready(async function () {
    const dictionary = {
        en: {
            orders: "Orders",
            purchase_button: "Purchase tickets",
            stage: "Stage",
            date: "Date",
            location: "Location",
            doors_open: "Doors open",
            price: 'price',
            vacant: 'Vacant',
            taken: 'Taken',
            chosen: 'Chosen',
            available: 'Not available'
        },
        fr: {
            orders: "Commandes",
            purchase_button: "Acheter des billets",
            stage: "Scène",
            date: "Date",
            location: "Lieu",
            doors_open: "Ouverture des portes",
            price: 'prix',
            vacant: 'Vacant',
            taken: 'Occupée',
            chosen: 'Choisi',
            available: 'Non disponible'
        }
    };

    const lang = translation(dictionary);

    const title = document.querySelector('.concert_preview_title');
    const address = document.querySelector('.concert_preview_address');
    const date = document.querySelector('.concert_preview_date');
    const poster = document.querySelector('.concert_small_poster');
    const ticketsContainer = document.querySelector('.tickets_container');
    const purchaseButton = document.querySelector('.purchase_button');
    const entireModalContainer = document.querySelector('.modal-body .layout_modal_container');
    const increase = document.querySelector('.increase');
    const decrease = document.querySelector('.decrease');
    let modalChairs = null;
    let minModalChairWidth = null;
    const layoutContainer = document.querySelector('.layout');
    const modalLayoutContainer = document.querySelector('.modal-body .layout');

    translateStaticHTML();

    function translateStaticHTML() {
        const lang = translation(dictionary);

        const orders_header = document.querySelector('.orders');
        orders_header.innerHTML = lang.orders;

        const stage = document.querySelector('.scene_title');
        stage.innerHTML = lang.stage;

        purchaseButton.innerHTML = lang.purchase_button;
    }

    decrease.addEventListener('click', () => {
        const modalChair = modalChairs[0];
        const modalChairWidth = parseFloat(getComputedStyle(modalChair).getPropertyValue('width'));
        const previousWidth = parseFloat(getComputedStyle(entireModalContainer).getPropertyValue('width'));
        entireModalContainer.style.width = previousWidth - 280 + 'px';
        modalChairs.forEach(c => c.style.width = modalChairWidth - 5 + 'px');
    });

    increase.addEventListener('click', () => {
        const previousWidth = parseFloat(getComputedStyle(entireModalContainer).getPropertyValue('width'));
        entireModalContainer.style.width = previousWidth + 280 + 'px';
        const modalChair = modalChairs[0];
        const previousChairWidth = parseFloat(getComputedStyle(modalChair).getPropertyValue('width'));
        modalChairs.forEach(c => c.style.width = previousChairWidth + 5 + 'px');
    });

    addLoadingCoverEntireContent();

    const concert = await getConcertByID();
    fillPageWithData(concert);
    allowSelectingSeats();
    disableLoadingCoverEntireContent();

    purchaseButton.addEventListener('click', async (e) => {
        if (await doesNotHaveCreditCard()) {
            redirect(`/payment/${getQueryID()}?${getTicketsQueryParam()}`);
        } else {
            redirect(`/payment/details/${getQueryID()}?${getTicketsQueryParam()}`);
        }
    });

    async function doesNotHaveCreditCard() {
        const loggedRes = await sendGET('/user/api/logged');
        const loggedJSON = await loggedRes.json();
        if (loggedJSON.status == 'Logged out')
            return true;

        const userRes = await sendGET('/user/api/userinfo');
        const userJSON = await userRes.json();
        return userJSON.credit != "True";
    }

    function getSelectedTicketNames() {
        const names = [];
        Array.from(document.querySelectorAll('.ticket')).forEach((ticketElem) => {
            names.push(ticketElem.dataset.name);
        });
        return names;
    }

    function getTicketsQueryParam() {
        return `tickets=[${getSelectedTicketNames().join(',')}]`;
    }

    /**
     * Includes selecting the seats functionality into the program.
     */
    function allowSelectingSeats() {
        const vacantSeats = document.querySelectorAll('.vacant_container');

        $('[data-toggle="tooltip"]').tooltip();
        vacantSeats.forEach(elem => {
            elem.addEventListener('click', makeChosen);
        });

        function getSameNameSeats(parent) {
            const name = parent.children[0].children[0].dataset.name;
            const selectedSeats = Array.from(document.querySelectorAll(`.seat[data-name="${name}"]`));
            return selectedSeats;
        }

        function makeChosen(e) {
            const selectedSeats = getSameNameSeats(e.currentTarget);
            selectedSeats.forEach(seat => {
                const parent = seat.parentElement.parentElement;
                createChosenSeatFor(parent);
                parent.removeEventListener('click', makeChosen);
                parent.addEventListener('click', makeVacant);
            });
            displayNewTicketFor(selectedSeats[0]);
        }

        function makeVacant(e) {
            const selectedSeats = getSameNameSeats(e.currentTarget);
            selectedSeats.forEach(seat => {
                const parent = seat.parentElement.parentElement;
                createVacantSeatFor(parent);
                parent.removeEventListener('click', makeVacant);
                parent.addEventListener('click', makeChosen);
            });
            removeTicketFor(selectedSeats[0]);
        }

        function removeTicketFor(seat) {
            const order = Array.from(ticketsContainer.children).find(ticket => {
                return ticket.dataset.name == seat.dataset.name;
            });
            const underline_divider = order.nextElementSibling;
            underline_divider.parentElement.removeChild(underline_divider);
            order.parentElement.removeChild(order);
            if (ticketsContainer.children.length == 0) {
                purchaseButton.disabled = true;
            }

        }

        function removeTicket(e) {
            const chosenSeatParents = Array.from(document.querySelectorAll('.chosen_container'));
            const seat = chosenSeatParents.find(parent => parent.children[0].children[0].dataset.name == e.currentTarget.parentElement.dataset.name);
            seat.click();
        }

        function displayNewTicketFor(seat) {
            const lang = translation(dictionary);

            purchaseButton.disabled = false;
            const html = `<div class="ticket mb-2 divider_bottom py-1" data-name="${seat.dataset.name}">
                <div class="cross_container">
                    <span class="cross">X</span>
                </div>
                <div class="icon">
                    <i class="fa-solid exported_icon fa-music"></i>
                </div>
                <h2>${concert.name}</h2>
                <h3>${seat.dataset.name}</h3>
                <p>${lang.date}: ${getDescriptionDate(concert.date)}</p>
                <p>${lang.location}: ${concert.venue.name}</p>
                <p>${lang.doors_open}: ${concert.time.start}</p>
                <p>${lang.price}: ${convertFromCAD(seat.dataset.price)}</p>
                <img src="${barcode_url}" class="mx-auto barcode" alt="">
            </div>
            <hr class="divider_line tickets_line attention_bg_color">`;
            ticketsContainer.innerHTML += html;
            const allCrosses = ticketsContainer.querySelectorAll('.cross_container');
            allCrosses.forEach(cross => cross.addEventListener('click', removeTicket));
        }

        /**
         * Replaces yellow seat with green seat and returns a link to it.
         * @param {HTMLElement} parent Parent of the seat element
         * @returns {HTMLElement} Newly created seat
         */
        function createVacantSeatFor(parent) {
            parent.classList.remove('chosen_container');
            parent.classList.add('vacant_container');
            const clue = parent.children[0].dataset.priceinfo;
            const newSeat = createSeatFor(parent, 'vacant', clue, vacant_url);
            return newSeat;
        }

        /**
         * Replaces green seat with yellow seat and returns a link to it.
         * @param {HTMLElement} parent Parent of the seat element
         * @returns {HTMLElement} Newly created seat
         */
        function createChosenSeatFor(parent) {
            parent.classList.remove('vacant_container');
            parent.classList.add('chosen_container');
            const tempInfo = parent.children[0].dataset.priceinfo;
            const newSeat = createSeatFor(parent, 'chosen', lang.chosen, chosen_url);
            parent.children[0].setAttribute('data-priceInfo', tempInfo);
            return newSeat;
        }

        function createSeatFor(parent, className, clue, src) {
            const seat = parent.children[0].children[0];
            const classesToRemove = Array.from(seat.classList).filter(c => c !== 'seat');
            classesToRemove.forEach(c => seat.classList.remove(c));
            seat.classList.add(className);
            parent.children[0].setAttribute('data-original-title', clue);
            const newSeat = seat;
            return newSeat;
        }
    }

    async function getConcertByID() {
        const id = getQueryID();
        const res = await fetch(`/concert/api/concertbyid/?id=${id}`);
        const json = await res.json();
        return json;
    }

    function fillPageWithData(concert) {
        fillPreview(concert);
        fillSeats(concert);
        disableLoadingCoverEntireContent();
    }

    function fillSeats(concert) {
        const orderedLayouts = getOrderedLayouts(concert);
        placeOrderedLayouts(layoutContainer, orderedLayouts);
        placeOrderedLayouts(modalLayoutContainer, orderedLayouts);
        makeModalLayoutContainerResizable();
        seatsResize();
    }

    function makeModalLayoutContainerResizable() {
        modalChairs = document.querySelectorAll('.modal-body .chair-container');
        minModalChairWidth = parseFloat(getComputedStyle(modalChairs[0]).minWidth);
    }

    function placeOrderedLayouts(container, orderedLayouts) {
        let rowNum_ = 1;
        let chairIndex = 0;
        container.innerHTML = orderedLayouts.map(seatScheme => {
            chairIndex = 0;
            return seatScheme.layout.map(l => {
                return `
                            <div class="seats_row_container w-100">
                                <div class="row seats_row mt-3">
                                <div class="seats_row_number regular_color">${rowNum_++}</div>
                                <div class="col-12 justify-content-center d-flex">
                                    ${[...Array(l.seats_per_row).keys()].map(chair => {
                    if (chairIndex < seatScheme.total) {
                        if (chairIndex < seatScheme.seats.length) {
                            return `
                                <div class="chair-container ${seatScheme.seats[chairIndex].vacant ? "vacant_container" : "taken_container"} m-2">
                                    <div data-toggle="tooltip" data-priceInfo="${seatScheme.seats[chairIndex].vacant ? `${lang.vacant} (${seatScheme.type}-${chairIndex + 1}, ${convertFromCAD(seatScheme.price)}` : ''})" title="${seatScheme.seats[chairIndex].vacant ? `${lang.vacant} (${seatScheme.type}-${chairIndex + 1}, ${convertFromCAD(seatScheme.price)})` : `${lang.taken}`}">
                                        <svg data-name="${seatScheme.type}-${seatScheme.seats[chairIndex].id}" data-price="${seatScheme.price}" class="seat ${seatScheme.seats[chairIndex++].vacant ? "vacant" : "taken"}" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                            \t viewBox="0 0 512 512"  xml:space="preserve">
                                            <g>
                                            \t<rect x="146.966" class="st0" width="218.067" height="189.867"/>
                                            \t<polygon class="st0" points="365.033,209.049 146.966,209.049 98.998,280.883 413.002,280.883 \t"/>
                                            \t<polygon class="st0" points="98.998,340.692 98.998,512 145.995,512 145.995,340.692 366.005,340.692 366.005,512 413.002,512 
                                            \t\t413.002,340.692 413.002,299.67 98.998,299.67 \t"/>
                                            </g>
                                            </svg>
                                    </div>
                                </div>
                            `
                        } else {
                            return `
                                <div class="chair-container not_available_container" m-2">
                                    <div data-toggle="tooltip" title="${lang.available}">
                                        <svg class="seat not_available" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                            \t viewBox="0 0 512 512"  xml:space="preserve">
                                            <g>
                                            \t<rect x="146.966" class="st0" width="218.067" height="189.867"/>
                                            \t<polygon class="st0" points="365.033,209.049 146.966,209.049 98.998,280.883 413.002,280.883 \t"/>
                                            \t<polygon class="st0" points="98.998,340.692 98.998,512 145.995,512 145.995,340.692 366.005,340.692 366.005,512 413.002,512 
                                            \t\t413.002,340.692 413.002,299.67 98.998,299.67 \t"/>
                                            </g>
                                            </svg>
                                    </div>
                                </div>
                            `
                        }
                    } else return '';
                }).join('')}
                                </div>
                            </div>
                            </div>
`
            }).join('');
        }).join('');
    }

    function findLayoutWithRowNumber(seating, rowNum) {
        const found = seating.find(seatSubset => {
            return seatSubset.layout.find(row => row.row_num == rowNum) != undefined;
        });
        let res = undefined;
        if (found !== undefined) {
            res = {};
            res.seats = found.seats;
            res.layout = found.layout;
            res.type = found.type;
            res.price = found.price;
            res.total = found.total;
        }
        return res;
    }

    function getOrderedLayouts(concert) {
        const seating = concert.venue.seating;
        let rowsEnded = false;
        let rowNum = 1;
        const orderedLayouts = [];

        while (!rowsEnded) {
            const lowestLayout = findLayoutWithRowNumber(seating, rowNum);
            if (lowestLayout != undefined) {
                orderedLayouts.push(lowestLayout);
                rowNum += lowestLayout.layout.length;

            } else
                rowsEnded = true;
        }
        return orderedLayouts;
    }

    function seatsResize() {
        let minChairWidth = 1000000;
        Array.from(layoutContainer.children).forEach(row => {
            const chairWidth = parseFloat(getComputedStyle(row.querySelector('.chair-container')).width);
            if (minChairWidth > chairWidth)
                minChairWidth = chairWidth;
        });

        Array.from(document.querySelectorAll('.chair-container')).forEach(chair => {
            chair.style.width = minChairWidth + 'px';
            chair.style.minWidth = 27 + 'px';
        })
    }

    function fillPreview(concert) {
        title.innerHTML = concert.name;
        date.innerHTML = getDescriptionDate(concert.date, concert.time);
        address.innerHTML = concert.venue.address;
        poster.src = concert.poster;
    }

    function getQueryID() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        return params.id;
    }

    function getDescriptionDate(d, t) {
        const date_desc = getDescriptionDate(d);

        const string = `${date_desc} (${t.start} - ${t.end})`;

        return string;
    }

    function getDescriptionDate(d) {
        const monthNames = {
            '{"name":"English"}': ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            '{"name":"French"}': ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        };

        const selected_language = localStorage.getItem('lan');

        prefix = '';
        if (d == 1)
            prefix = 'st';
        else if (d == 2)
            prefix = 'nd';
        else if (d == 2)
            prefix = 'rd';

        const string = `${monthNames[selected_language][d.month]} ${d.day}${prefix}, ${d.year}`;
        return string;
    }
});