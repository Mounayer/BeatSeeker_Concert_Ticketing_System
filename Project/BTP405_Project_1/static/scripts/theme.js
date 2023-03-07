const htmlElem = document.querySelector('html');

if (localStorage.getItem('theme') != 'light') {
    localStorage.setItem('theme', 'dark');
}

if (localStorage.getItem('theme') == 'dark') {
    htmlElem.id = '';
} else {
    htmlElem.id = 'light-theme';
}