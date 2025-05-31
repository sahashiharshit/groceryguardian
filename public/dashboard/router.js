

const routes ={

groceries:()=>importView('groceries'),
inventory:()=>importView('inventory'),
settings:()=>importView('settings'),
group:()=>importView('group'),
invite:()=> importView('invite'),
addGrocery:()=>importView('addGrocery'),
};

export function importView(viewName) {

document.getElementById("app").innerHTML =`<h2>Loading ${viewName}...</h2>`;
import(`./views/${viewName}.js`).then(module => {
    if(typeof module.render === 'function') {
    module.render();
    
    }else{
        document.getElementById("app").innerHTML = `<h2>Error loading view ${viewName}</h2>`;
    }
    }).catch(error => {
    console.error(`Error loading view ${viewName}:`, error);
        document.getElementById("app").innerHTML = `<h2>Error loading view ${viewName}</h2>`;
    })

}

export function handleRouting(){

const hash = window.location.hash.replace('#', '') || 'groceries';
const route = routes[hash];
if(route) {
    route();
}else{
    document.getElementById("app").innerHTML = `<h2>Page not found</h2>`;
}
}
