// Use our local proxy server instead of the direct Autodesk API
var tokenUrl = "/api/autodesk/proxy-token";
        
async function getAccessToken() {
    try {
        const response = await fetch(tokenUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        console.log('Token received successfully');
        return data.access_token;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}

export async function initializeViewer() {
    const accesstoken = await getAccessToken();
    if (!accesstoken) {
        console.error("Failed to get access token. Viewer will not be initialized.");
        return;
    }

    var options = {
        env: 'AutodeskProduction',
        accessToken: accesstoken,
        api: 'derivativeV2'
    };

    var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXBzLWNvZGVwZW4tYmFja2VuZC8wMV9yYWNfYmFzaWNfc2FtcGxlX3Byb2plY3QucnZ0';

    Autodesk.Viewing.Initializer(options, function onInitialized() {
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}

function onDocumentLoadSuccess(doc) {
    var geometries = doc.getRoot().search({ 'type': 'geometry' });
    if (geometries.length === 0) {
        console.error('Document contains no geometries.');
        return;
    }

    var initGeom = geometries[0];
    var viewerDiv = document.getElementById('viewer');
    var config = {
        extensions: initGeom.extensions() || []
    };
    var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);

    var svfUrl = doc.getViewablePath(initGeom);
    var modelOptions = {
        sharedPropertyDbPath: doc.getPropertyDbPath()
    };
    viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onLoadModelSuccess(model) {
    // Model loaded successfully
}

function onLoadModelError(viewerErrorCode) {
    console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
}

