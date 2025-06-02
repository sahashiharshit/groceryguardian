

import {handleRouting} from './router.js';

console.log('Dashboard app loaded');
const token =localStorage.getItem('token');

if(!token) window.location.href = '/auth.html';

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);

document.getElementById("logoutBtn").addEventListener("click",()=>{

localStorage.removeItem('token');
window.location.replace("../auth.html");

});