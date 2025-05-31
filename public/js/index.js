window.onload = function () {
console.log("Welcome to the application!");

const token = localStorage.getItem("token");
if(token) {
    window.location.replace("/dashboard/index.html");
    
}

}