var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        target: "map"
    },

    mounted: function(){
        //this.initMap();
    },

    methods: {
        
    }
})

let basemap_array = [
    new ol.source.OSM(),
    new ol.source.XYZ({
        attributions:
            'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
            'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
    new ol.source.Stamen({
        layer: 'terrain',
    })
];
let basemap_layer = new ol.layer.Tile({
    source: basemap_array[0]
});

function changeBasemap(index){
    basemap_layer.setSource(basemap_array[index]);
}

//let changeLayerControl = ol.Control()
let controls = ol.control.defaults({
    zoom: true,
    attribution: true,
    rotate: true     
});

let map = new ol.Map({
    target: "map",
    controls: controls,
    layers: [
        basemap_layer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});