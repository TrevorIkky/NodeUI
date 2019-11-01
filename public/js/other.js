/* eslint-disable require-jsdoc */
M.AutoInit();
const nodeList = document.getElementById('node-list');
const modal = document.getElementById('mapModal');
// const cancel = document.getElementById('cancel');
const appendToNode = document.getElementById('append-val');
const openNodeMenu = document.getElementById('openNodeMenu');
const surroundContainer = document.getElementById('surround-container');
const closeNodeList = document.getElementById('close-node-list');

const acc = document.getElementsByClassName('accordion');
let i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener('click', function() {
    this.classList.toggle('active');
    const panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
}

openNodeMenu.addEventListener('click', function() {
  nodeList.style.width = '300px';
  nodeList.style.opacity = '1';
  surroundContainer.style.marginLeft = '300px';
});

closeNodeList.addEventListener('click', function() {
  nodeList.style.width = '0';
  nodeList.style.opacity = '0';
  surroundContainer.style.marginLeft = '0';

});

let resultLatLng;
mapboxgl.accessToken = 'pk.eyJ1IjoiaWtreTExMSIsImEiOiJjazE3aGV1dDgwNTl4M2lyMmFzZ3lmMmdyIn0.ri7326moGLA5Bri_hYzSCQ';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v10',
  zoom: 15,
  center: [36.8098883, -1.308869],
});

document.getElementById('account').addEventListener('click', ()=>{
  window.location = '/login';
})

const currentLocationMarker = new mapboxgl.Marker();
currentLocationMarker.setLngLat([36.8098883, -1.308869]);
currentLocationMarker.addTo(map);

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeHolder: 'Search for a place...',
  marker: false,
  country: 'ke',
  mapboxgl: mapboxgl,

});

map.on('load', (event) => {
  map.addSource('single-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  });

  map.addLayer({
    id: 'pnt',
    type: 'circle',
    source: 'single-point',
    paint: {
      'circle-radius': 15,
      'circle-color': '#448ee4',
    },
  });
});

geocoder.on('result', (event) => {
  map.getSource('single-point').setData(event.result.geometry);
  resultLatLng = event.result.geometry.coordinates.toString();
});

map.addControl(geocoder);

function openModal(key, nodeid) {
  var instance = M.Modal.getInstance(modal);
  console.log(instance);
  instance.open();
  map.resize();
  appendToNode.setAttribute('data-node-key', key);
  appendToNode.setAttribute('data-node-id', nodeid);
}

// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function saveEditor() {
  M.toast({html: 'Saving Editor State',
    classes:"rounded status"}, 10000);
  const data = editor.toJSON();
  var file = new Blob([data], {type: 'aplication/json'});
  var filename = `${Date.now()}.json`
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

appendToNode.onclick = function() {
  const nodeId = appendToNode.getAttribute('data-node-id');
  if (resultLatLng) {
    const searchedNode = editor.nodes.find((x) => x.id == nodeId);

    searchedNode.controls.get('latlngNode').setValue(resultLatLng);
    searchedNode.data.latlngNode = resultLatLng;
    console.log(searchedNode);
    editor.trigger('process');
    modal.style.display = 'none';
    var instance = M.Modal.getInstance(modal);
    instance.close();
  } else {
    console.log('coordinates are null')
  };
};

// https://stackoverflow.com/questions/16215771/how-open-select-file-dialog-via-js
const fileInput = document.getElementById('file-input');
fileInput.onchange = e => {
  // getting a hold of the file reference
  var file = e.target.files[0];

  // setting up the reader
  var reader = new FileReader();
  reader.readAsText(file,'UTF-8');

  // here we tell the reader what to do when it's done reading...
  reader.onload = readerEvent => {
    M.toast({html: `Restoring restore from ${file.name}`,
      classes:"rounded status"}, 4000);
    var content = readerEvent.target.result; // this is the content!
    if (content !== undefined) {
      editor.fromJSON(JSON.parse(content));
    }
  }

}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.tooltipped');
  var instances = M.Tooltip.init(elems);
});
