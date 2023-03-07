const dictionary = {
    en: {
        header: "Popular Concerts"
    },
    fr: {
        header: "Concerts Populaires"
    }
}
let slide = document.getElementById("slide");
document.addEventListener("DOMContentLoaded", () => {
    slideshow();
    let lang = translation(dictionary);
    document.getElementById("slide_header").innerHTML += `
        <div class="flex-container" style="cursor: default;">
            <div style="cursor: default;"></div>
            <div style="cursor: default;"><br><h1 class="attention_color">${lang.header}</h1><hr></div>
            <div style="cursor: default;"></div>
        </div>
    `;
})

function slideshow() {
    createLoadingCoverForElement(slide);
    activateLoadingCoverForElement(slide);

    fetch(`/concert/api/mostpopular`)
    .then(res => res.json())
    .then(data => {
        disableLoadingCoverForElement(slide);
        generateIndicators(data);
        generateSlides(data);
    }).catch(err => console.log(err));
}

function generateIndicators(list) {
    let slideIndicators = document.getElementById("carouselIndicators");
    slideIndicators.innerHTML += `
        <ol class="carousel-indicators" id="slide_num"></ol>
        <a class="carousel-control-prev">
            <span class="carousel-control-prev-icon" href="#carouselIndicators" role="button" data-slide="prev" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next attention_color">
            <span class="carousel-control-next-icon" href="#carouselIndicators" role="button" data-slide="next" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    `;

    for(let i = 0; i < 5; ++i) {
        let active_indicator;
        if(i === 0) {
            active_indicator = 'active';
        }
        else {
            active_indicator = '';
        }
        document.getElementById("slide_num").innerHTML += `
        <li id="indicator${i+1}" style='height:8px' data-target="#carouselIndicators" data-slide-to="${i}" class="${active_indicator}"></li>`;
    }
}

function generateSlides(list) {
    for (let i = 0; i < list.length && i < 5; ++i) {
        let active_carousel;
        if (i === 0) {
            active_carousel = "carousel-item active";
        } else {
            active_carousel = "carousel-item";
        }
        document.getElementsByClassName("carousel-inner")[0].innerHTML += `
        <div class="${active_carousel}">
          <div class="d-flex justify-content-center img-resize">
            <img src="${list[i].poster}" id="img${list[i]['_id']}" alt='slide ${i + 1}' title="${list[i].name}" width="70%">
            <div class="carousel-caption d-none d-md-block">
              <h2 class="caption_color carousel-light-color">${list[i]['performer']}</h2>
              <h4 class="caption_color carousel-light-color"> ${list[i]['venue']['city']}, ${list[i]['venue']['country']}</h4>
            </div>
          </div>
        </div>`
    }

    for (let i = 0; i < list.length && i < 5; ++i) {
        document.getElementById(`img${list[i]["_id"]}`).addEventListener('click', () => {
            window.location.href = `/concert/${list[i]["_id"]}`;
        });
    }
}