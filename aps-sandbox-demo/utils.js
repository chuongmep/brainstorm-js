export const APP_URL = 'https://aps-codepen.autodesk.io';

/**
 * Generates access token for viewing models in the Model Derivative service.
 * @param {(string, number) => void} callback Function that will be called with generated access token and number of seconds before it expires.
 */
export function getAccessToken(callback) {
    fetch(APP_URL + '/api/token')
        .then(resp => resp.ok ? resp.json() : Promise.reject(resp))
        .then(credentials => callback(credentials.access_token, credentials.expires_in))
        .catch(err => {
            console.error(err);
            alert('Could not get access token. See console for more details.');
        });
}

/**
 * Initializes the runtime for communicating with the Model Derivative service, and creates a new instance of viewer.
 * @async
 * @param {HTMLElement} container Container that will host the viewer.
 * @param {object} config Additional configuration options for the new viewer instance.
 * @returns {Promise<Autodesk.Viewing.GuiViewer3D>} New viewer instance.
 */
export function initViewer(container, config) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, function () {
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            resolve(viewer);
        })
    });
}

/**
 * Lists all models available for viewing.
 * @async
 * @returns {Promise<{ name: string, urn: string }>} List of models.
 */
export function listModels() {
    return fetch(APP_URL + '/api/models')
        .then(resp => resp.ok ? resp.json() : Promise.reject(resp));
}

/**
 * Loads specific model into the viewer.
 * @param {Autodesk.Viewing.GuiViewer3D} viewer Target viewer.
 * @param {string} urn URN of the model in the Model Derivative service.
 */
export function loadModel(viewer, urn) {
    // viewer.loadExtension('ToolbarExtension').then(function () {
    //     console.log('ToolbarExtension loaded');
    // });
    // viewer.loadExtension('Autodesk.Measure').then(function () {
    //     console.log('Autodesk.Measure loaded');
    // });
    // viewer.loadExtension('Autodesk.VisualClusters', { attribName: '_RFN',  searchAncestors: true } )
    //https://aps.autodesk.com/en/docs/viewer/v7/reference/Extensions/PropertiesManagerExtension/
    // viewer.loadExtension('Autodesk.NPR');
    // viewer.loadExtension('Autodesk.Viewing.Popout');
    // viewer.loadExtension('Autodesk.BIM360.Minimap')
    // viewer.loadExtension('Autodesk.DefaultTools.NavTools')
    // var ex = viewer.loadExtension('Autodesk.PropertiesManager');
    // viewer.loadExtension('Autodesk.ViewerSettings')
    // viewer.loadExtension('Autodesk.Viewing.ZoomWindow').then(function () {
    //     console.log('Autodesk.Viewing.ZoomWindow loaded');
    // });

    // console.log('Initialization complete, loading a model next...');
    // Autodesk.Viewing.Document.load(urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    Autodesk.Viewing.Document.load(
        'urn:' + urn,
        doc => viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()),
        (code, message, errors) => {
            console.error(code, message, errors);
            alert('Could not load model. See console for more details.');
        }
    );
}
function onDocumentLoadSuccess(viewerDocument) {
    const viewerApp = viewerDocument.getRoot();
    // What you want to load
}
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    alert('Could not load model. See console for more details.');
}