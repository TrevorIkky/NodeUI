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



function showPopupNodes() {
  const popup = document.getElementById('myPopup');
  popup.classList.toggle('show');
  setTimeout(()=>{
    popup.classList.toggle('show');
  }, 3000);
}

function showPopupBuild() {
  const popup = document.getElementById('buildSolution');
  popup.classList.toggle('show');
  setTimeout(()=>{
    popup.classList.toggle('show');
  }, 3000);
}
openNodeMenu.addEventListener('click', function() {
  nodeList.style.width = '400px';
  nodeList.style.border = 'gray solid';
  nodeList.style.borderWidth = '1px';
  nodeList.style.opacity = '1';
  nodeList.style.marginTop = '5px';
  nodeList.style.marginLeft = '5px';
  surroundContainer.style.marginRight = '400px';

});

closeNodeList.addEventListener('click', function() {
  nodeList.style.width = '0';
  nodeList.style.border = 'transparent';
  nodeList.style.borderWidth = '0';
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
  // modal.style.display = 'block';
  var instance = M.Modal.getInstance(modal);
  console.log(instance);
  // map.invalidateSize();
  instance.open();
  map.resize();
  appendToNode.setAttribute('data-node-key', key);
  appendToNode.setAttribute('data-node-id', nodeid);
}


// cancel.onclick = function() {
  // modal.style.display = 'none';
// };

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

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};
