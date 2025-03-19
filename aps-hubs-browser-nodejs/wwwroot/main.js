import { initViewer, loadModel } from './viewer.js';
import { initTree } from './sidebar.js';
import { initSplitView } from './split-view.js';

const login = document.getElementById('login');
try {
    const resp = await fetch('/api/auth/profile');
    console.log(resp);
    if (resp.ok) {
        const user = await resp.json();
        login.innerText = `Logout (${user.name})`;
        login.onclick = () => {
            const iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            iframe.src = 'https://accounts.autodesk.com/Authentication/LogOut';
            document.body.appendChild(iframe);
            iframe.onload = () => {
                window.location.replace('/api/auth/logout');
                document.body.removeChild(iframe);
            };
        }
        const viewer = await initViewer(document.getElementById('preview'));
        initTree('#tree', (id) => loadModel(viewer, window.btoa(id).replace(/=/g, '')));
        
        // Initialize the split view with default options
        const splitView = initSplitView({
            initialSplitPercentage: 25,
            minSidebarWidth: 15,
            maxSidebarWidth: 50
        });
        
        // Ensure viewer resizes when split changes
        const resizeViewer = _.debounce(() => {
            if (viewer) {
                viewer.resize();
            }
        }, 250);
        
        // Create a mutation observer to watch for style changes on the sidebar
        const observer = new MutationObserver(resizeViewer);
        observer.observe(document.getElementById('sidebar'), { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
        
        // Also resize on window resize
        window.addEventListener('resize', resizeViewer);
    } else {
        login.innerText = 'Login';
        login.onclick = () => window.location.replace('/api/auth/login');
    }
    login.style.visibility = 'visible';
} catch (err) {
    alert('Could not initialize the application. See console for more details.');
    console.error(err);
}