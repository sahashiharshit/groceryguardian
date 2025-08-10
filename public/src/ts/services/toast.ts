export function showToast(message:string,type:'error'|'success'| 'info'='info',duration=3000){

 // Create toast container if not already present
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Append and trigger animation
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);

}