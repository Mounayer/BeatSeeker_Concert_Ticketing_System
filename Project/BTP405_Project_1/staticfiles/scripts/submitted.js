function translateStaticHTML() {
    const lang = JSON.parse(localStorage.getItem('lan')).name;
    const message_container = document.querySelector('p');

    if(lang == 'French') {
        if (message_container.innerHTML == 'Payment received. Confirmation sent to your email.')
            message_container.innerHTML = 'Pago recibido. Confirmación enviada a su correo electrónico.';
        else if(message_container.innerHTML = 'Payment received. Email already sent.')
            message_container.innerHTML = 'Pago recibido. Correo electrónico ya enviado.';
        else if(message_container.innerHTML == 'Either confirmation message was already sent to your email, or you did not pay.')
            message_container.innerHTML = 'O el mensaje de confirmación ya fue enviado a su correo electrónico, o no se realizó el pago.';
    }
}

translateStaticHTML();