function convertFromCAD(data) {
  const storageData = localStorage.getItem("currency");
  const name = JSON.parse(storageData)["name"];

  const USD_EXCHANGE_RATE = 0.73;
  const EUR_EXCHANGE_RATE = 0.7;
  switch (name) {
    case "USD":
      return "$" + (parseFloat(data) * USD_EXCHANGE_RATE).toFixed(2) + " USD";
    case "EUR":
      return "€" + (parseFloat(data) * EUR_EXCHANGE_RATE).toFixed(2) + " EUR";
    default:
      return "$" + parseFloat(data).toFixed(2) + " CAD";
  }
}

const currencyTogglers = document.querySelectorAll(".currency-select");

function changeLanguage() {
  const currency = { name: event.target.value };
  localStorage.setItem("currency", JSON.stringify(currency));
  location.reload();
}

currencyTogglers.forEach((toggler) => {
  toggler.addEventListener("change", changeLanguage);
});

window.addEventListener("load", () => {
  const storageData = localStorage.getItem("currency");

  if (storageData) {
    currencyTogglers.forEach((toggler) => {
      toggler.value = JSON.parse(storageData)["name"];
    });
  } else {
    currencyTogglers.forEach((toggler) => {
      toggler.value = "CAD";
      ``;
    });
    const currency = { name: "CAD" };
    localStorage.setItem("currency", JSON.stringify(currency));
  }
});
