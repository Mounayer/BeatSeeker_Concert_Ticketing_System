const languageTogglers = Array.from(document.querySelectorAll('.language-select'));

languageTogglers.forEach(select => {
    select.addEventListener("change", languageChange);
});

function languageChange(event) {
    const language = {name: event.target.value};
    localStorage.setItem("lan", JSON.stringify(language));
    location.reload();
}

window.addEventListener("load", () => {
    const storageData = localStorage.getItem("lan");

    if (storageData) {
        languageTogglers.forEach(select => {
            select.value = JSON.parse(storageData)["name"];
        });
    } else {
        languageTogglers.forEach(select => {
            select.value = "English";
            const language = {name: "English"};
            localStorage.setItem("lan", JSON.stringify(language));
        });
    }
});

/**Accepts object with {en, fr] attributes, proper language attribute will be returned*/
function translation(data) {
    const storageData = localStorage.getItem("lan");

    if (storageData) {
        let lang = JSON.parse(storageData)["name"];

        if (lang === "English") {
            // for (const selector in data.en) {
            //   document.querySelectorAll(selector).innerHtml = data.en[selector];
            //
            //   if (selector === "__select") {
            //      data.en[selector]()
            //
            // }

            return data.en;
        } else if (lang === "French") {
            // for (const selector in data.en) {
            //   document.querySelectorAll(selector).innerHtml = data.en[selector];
            // }

            return data.fr;
        }
    }
}
