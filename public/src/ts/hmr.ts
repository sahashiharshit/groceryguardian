// let currentModule:any;
// let currentPath = "./app.js";

// async function load(modulePath:string) {
//     if(currentModule?.dispose) currentModule.dispose();
    
//     const mod = await import(modulePath + `?hot=${Date.now()}`);
//     currentModule = mod;
//     currentPath=modulePath;
//     mod.init();
//     }

// load(currentPath);

// const socket = new WebSocket("ws://localhost:35729");

// socket.onmessage=(e)=>{

//     if(e.data==="reload"){
//         console.log("HMR: Reload signal received",currentPath);
//         load(currentPath);
//     }
// };
// (window as any).hmrLoad = load;