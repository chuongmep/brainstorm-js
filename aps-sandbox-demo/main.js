import {
  initViewer,
  listModels,
  loadModel,
} from "./utils.js";

const models = await listModels();
const viewer = await initViewer(document.getElementById("viewer"));
const dropdown = document.getElementById("models");
dropdown.innerHTML = models
  .map((m) => `<option value="${m.urn}">${m.name}</option>`)
  .join("");
console.log(models);
dropdown.onchange = async function () {
    // const selectedModel = dropdown.options[dropdown.selectedIndex].value;
    var urn ="dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YXBzLWNvZGVwZW4tYmFja2VuZC8wMV9yYWNfYmFzaWNfc2FtcGxlX3Byb2plY3QucnZ0"
    loadModel(viewer, urn);
}
dropdown.onchange();

viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function () {
  const myDbids = viewer.getSelection();
  alert("The user has selected objects with IDs " + myDbids);
});
