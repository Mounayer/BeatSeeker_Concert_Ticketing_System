function redirect(href) {
    window.location.replace(href);
}

function getQueryParameter(paramName) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
    let value = params[paramName];
    return value;
}

function getQueryAsObj() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    return params;
}

function addQueryToURL(query) {
    let queryString = '?';
    let firstTime = true;
    for (const key in query) {
        if (!firstTime)
            queryString += '&';
        else
            firstTime = false;
        queryString += `${key}=${query[key]}`;
    }
    if (history.pushState) {
        const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
        window.history.pushState({path: newurl}, '', newurl);
    }
}

async function sendJSON(url, data, csrfToken) {
    const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json", 'X-CSRFToken': csrfToken, 'SameSite': 'None'},
        body: JSON.stringify(data),
    });
    return res;
}

async function sendGET(url) {
    const res = await fetch(url);
    return res;
}

function getURLPath() {
    return window.location.pathname;
}

const contentContainer = document.querySelector('.content_container');
const sideNavToggler = document.querySelector('.navbar-toggler');
const sideNav = document.querySelector('.sidenav');
const pageRest = document.querySelector('.page_rest');
const closeSidenavButton = document.querySelector('.close_sidenav');
const sideLinks = document.querySelectorAll('.sidenav_link');
const concertsToggler = document.querySelector('input#concert_communication');
const themeTogglers = Array.from(document.querySelectorAll('.theme_toggler'));
const urlPath = getURLPath();

const header_dictionary = {
    en: {
        all_concerts: 'All concerts',
        buttons: [
            {
                name: 'Genre',
                values: [
                    'Blues',
                    'Classical',
                    'Country',
                    'Dance',
                    'Electronic',
                    'Folk',
                    'Hip-Hop',
                    'Jazz',
                    'Metal',
                    'Pop',
                    'Reggae',
                    'Rock',
                    'Soul',
                    'World'
                ]
            },
            {
                name: 'Cheapest tickets',
                values: [
                    'Less than 100$',
                    'Less than 250$',
                    'Less than 500$',
                    'Less than 1000$',
                ]
            },
            {
                name: 'Age to attend',
                values: [
                    'Concerts for kids',
                ]
            }
        ],
        footer_headers: [
            'Contact us',
            'About us',
            'Terms and agreement'
        ],
        footer_links: [
            'Sell tickets to your concert',
            'View PDF'
        ],
        admin_panel: 'Admin Panel',
        profile_links: ['View profile', 'Logout'],
        login_link: 'Login'
    },
    fr: {
        all_concerts: 'Tous les concerts',
        buttons: [
            {
                name: 'Genre',
                values: [
                    'Blues',
                    'Classique',
                    'Country',
                    'Dance',
                    'Électronique',
                    'Folk',
                    'Hip-Hop',
                    'Jazz',
                    'Métal',
                    'Pop',
                    'Reggae',
                    'Rock',
                    'Soul',
                    'World'
                ]
            },
            {
                name: 'Billets les moins chers',
                values: [
                    'Moins de 100$',
                    'Moins de 250$',
                    'Moins de 500$',
                    'Moins de 1000$',
                ]
            },
            {
                name: 'Âge pour assister',
                values: [
                    'Concerts pour enfants',
                ]
            }
        ],
        footer_headers: [
            'Contactez-nous',
            'À propos de nous',
            'Conditions et accords'
        ],
        footer_links: [
            'Vendre des billets pour votre concert',
            'Afficher le PDF'
        ],
        admin_panel: 'Panneau d\'administration',
        profile_links: ['Voir le profil', 'Déconnexion'],
        login_link: 'Connexion'
    }
};
const lang = translation(header_dictionary);

function setProfileLinks() {
    fetch('/user/api/logged')
        .then(res => res.json())
        .then(response => {
            let icon = document.querySelectorAll(".profile_menu");
            if (response.status === "Logged in") {
                if (response.isAdmin) {
                    for (let i = 0; i < icon.length; ++i) {
                        icon[i].innerHTML += `
                            <a class="dropdown-item profile_dropdown_item attention_color background_color admin_panel" href="/account/admin">${lang.admin_panel}</a>
                        `;
                    }
                }

                for (let i = 0; i < icon.length; ++i) {
                    icon[i].innerHTML += `
                        <a class="dropdown-item profile_dropdown_item attention_color profile_link background_color" href="/user">${lang.profile_links[0]}</a>
                        <button class="dropdown-item profile_dropdown_item attention_color profile_link background_color logout">${lang.profile_links[1]}</button>
                    `;
                }

                let logoutbuttons = document.querySelectorAll(".logout");
                logoutbuttons.forEach(button => {
                    button.addEventListener("click", () => {
                        fetch('/user/logout/')
                            .then(response => response.json())
                            .then(() => {
                                window.location.href = '/account/login';
                            })
                            .catch(() => {
                                console.log("Error logging out.");
                            });
                    });
                })
            } else {
                for (let i = 0; i < icon.length; ++i) {
                    icon[i].innerHTML += `
                        <a class="dropdown-item login_link profile_dropdown_item attention_color background_color" id="view_profile" href="/account/login">${lang.login_link}</a>
                    `;
                }
            }
        })
}

setProfileLinks();

themeTogglers.forEach(t => {
    t.addEventListener('click', (e) => {
        if (localStorage.getItem('theme') == 'light') {
            themeTogglers.checked = true;
            htmlElem.id = '';
            localStorage.setItem('theme', 'dark');
        } else {
            themeTogglers.checked = false;
            htmlElem.id = 'light-theme';
            localStorage.setItem('theme', 'light');
        }
    });
});

if (localStorage.getItem('theme') == 'dark') {
    themeTogglers.forEach(t => {
        t.checked = true;
    })
} else {
    themeTogglers.forEach(t => {
        t.checked = false;
    })
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.all-concerts').innerHTML = lang.all_concerts;
    const filters = document.querySelectorAll('.accordion-title');
    for (let i = 0; i < lang.buttons.length; ++i) {
        filters[i].querySelector('button').innerHTML = lang.buttons[i].name;
        const filter_value = filters[i].parentElement;
        const buttons = filter_value.querySelectorAll('.card-body button');
        for (let j = 0; j < lang.buttons[i].values.length; j++) {
            buttons[j].innerHTML = lang.buttons[i].values[j];
        }
    }
    const footer_links = document.querySelectorAll('.footer_link');
    for (let i = 0; i < lang.footer_links.length; ++i) {
        footer_links[i].innerHTML = lang.footer_links[i];
    }
    const footer_headers = document.querySelectorAll('.footer-header');
    for (let i = 0; i < lang.footer_links.length; ++i) {
        footer_headers[i].innerHTML = lang.footer_headers[i];
    }
    if(JSON.parse(localStorage.getItem('lan')).name == 'French') {
        const dropdown = document.querySelector('.header_dropdown_profile');
        console.log(dropdown)
        dropdown.style.left = '0px';
        dropdown.style.marginLeft = '-200px';
    }
});

const accordionTitles = document.querySelectorAll(".accordion-title");

// Get all the dropdowns on the page
const dropdowns = document.querySelectorAll('.profile-dropdown');

// Function to hide all dropdown menus
function hideDropdownMenus() {
    const menus = document.querySelectorAll('.profile-dropdown-menu-center');
    menus.forEach((menu) => {
        menu.classList.remove('show');
    });
}

// Add event listener for each dropdown to toggle the dropdown menu
dropdowns.forEach((dropdown) => {
    const dropdownToggle = dropdown.querySelector('[data-toggle="dropdown"]');
    const dropdownMenu = dropdown.querySelector('.profile-dropdown-menu-center');

    // Show or hide dropdown menu when icon is clicked
    dropdownToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isMenuOpen = dropdownMenu.classList.contains('show');
        hideDropdownMenus();
        if (!isMenuOpen) {
            dropdownMenu.classList.add('show');
        }
    });

    // Hide dropdown menu when user clicks anywhere outside the dropdown
    document.addEventListener('click', (event) => {
        const isClickInsideDropdown = dropdown.contains(event.target);
        if (!isClickInsideDropdown) {
            hideDropdownMenus();
        }
    });
});


for (let i = 0; i < accordionTitles.length; i++) {
    const button = accordionTitles[i].querySelector('.sidenav_expand_button.sidenav_btn');
    const accordionBody = accordionTitles[i].nextElementSibling;
    accordionTitles[i].addEventListener("click", function () {
        this.classList.toggle("active");
        button.classList.toggle('inactive');
        accordionBody.classList.toggle('d-block');
    });
}
Array.from(sideLinks).forEach(link => {
    link.addEventListener('click', (e) => {
        const filter = link.parentElement.dataset.filter;
        const value = link.dataset.value;
        if (!/^\/concert\/all\/?$/.test(urlPath)) {
            redirect(`/concert/all?${filter}=${value}`);
        } else {
            addQueryToURL({[filter]: value});
            concertsToggler.click();
        }
    });
});

closeSidenavButton.addEventListener('click', () => {
    placeSideNav();
    pageRest.classList.remove('page_rest_seen');
});
sideNavToggler.addEventListener('click', () => {
    sideNav.style.left = `0px`;
    pageRest.classList.add('page_rest_seen');
    pageRest.addEventListener('click', function handler() {
        pageRest.removeEventListener('click', handler);
        closeSidenavButton.click();
    });
});

window.addEventListener('resize', (e) => {
    placeSideNav();
    pageRest.classList.remove('page_rest_seen');
});

placeBody();
placeSideNav();

function placeBody() {
    contentContainer.style.top = getComputedStyle(document.querySelector('.headernavbar')).getPropertyValue('height');
}

function placeSideNav() {
    const currentWidth = getComputedStyle(sideNav).getPropertyValue('width');
    sideNav.style.left = `-${currentWidth}`;
}

document.querySelector("sidenav")
