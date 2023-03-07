const dictionary =
    {
        en: {
            error: "Error 404, Resource Not Found"
        },
        fr:{
            error: "Erreur 404, Ressource Non Trouvée"
        }
    }

window.addEventListener("load", ()=>
{
    let lang = translation(dictionary);
    document.getElementById("error_header").innerText = lang.error;
})