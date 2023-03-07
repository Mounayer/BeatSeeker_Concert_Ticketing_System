const queryObj = getQueryAsObj();
let query = '?';
for(let key in queryObj) {
    query += `${key}=${queryObj}&`;
}
console.log(localStorage.getItem('lan'))
const lang_name = JSON.parse(localStorage.getItem('lan')).name;

query += `lang=${lang_name}`
window.location.replace(`/payment/submitted/${query}`);