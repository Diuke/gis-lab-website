//GLOBALS
let geoserverBaseUrl = "http://ec2-54-80-227-106.compute-1.amazonaws.com/geoserver/";

let rasterDiffLayer = new ol.layer.Image({
    visible: true,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:diff_complete'
        }
    })
});

let rasterGHSLayer = new ol.layer.Image({
    visible: false,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:ghs_complete'
        }
    })
});

let rasterWorldpopLayer = new ol.layer.Image({
    visible: false,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:worldpop_complete'
        }
    })
});

let rasterDiffLayerClassified = new ol.layer.Image({
    visible: false,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:ghs_worldpop_difference_plus1'
        }
    })
});

let rasterGHSLayerClassified = new ol.layer.Image({
    visible: false,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:ghs_validation_classified'
        }
    })
});

let rasterWorldpopLayerClassified = new ol.layer.Image({
    visible: false,
    source: new ol.source.ImageWMS({
        url: geoserverBaseUrl + "/wms",
        params: {
            'LAYERS': 'gis_lab:worldpop_validation_classified'
        }
    })
});

//STYLES
let stroke = new ol.style.Stroke({
    color: 'black',
    width: 1
});
let styleParams = {
    points: 4,
    radius: 4
}
let greenSquare = new ol.style.Style({
    image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
            color: '#319c19'
        }),
        stroke: stroke,
        points: styleParams.points,
        radius: styleParams.radius,
        angle: Math.PI / 4,
    }),
});
let redSquare = new ol.style.Style({
    image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
            color: '#de3b35'
        }),
        stroke: stroke,
        points: styleParams.points,
        radius: styleParams.radius,
        angle: Math.PI / 4,
    }),
});

var highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#f00',
        width: 1,
    }),
    fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0.1)',
    }),
});

//SELECTS - click event
var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click,
});

let all_samples = new ol.layer.Vector({
    visible: false,
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "http://ec2-54-80-227-106.compute-1.amazonaws.com/geoserver/gis_lab/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=gis_lab:all_samples&outputFormat=application/json"
    }),
    style: (feature, resolution) => {
        if (feature.get('Match') == "Yes") {
            return greenSquare;
        } else {
            return redSquare;
        }
    }


});

let group5Tiles = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: "http://ec2-54-80-227-106.compute-1.amazonaws.com/geoserver/gis_lab/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=gis_lab:tiles_5&outputFormat=application/json"
    })
});

// Controls of the maps - So far only the defaults
let controls = ol.control.defaults({
    zoom: true,
    attribution: true,
    rotate: true
});


//MAIN APP
var app = new Vue({
    el: '#app',
    data: {
        message: 'GISLAB',
        target: "map",
        map: {},
        basemap_layer: {},
        init_position: {
            lat: -50.815607,
            lng: -18.701298
        },

        //Array of raster layers
        layer_array: [{
                "layer": rasterDiffLayer,
                "displayName": " GHS-Worldpop Differences",
                "name": "layer0",
                "index": 0,
                "visible": true
            },
            {
                "layer": rasterGHSLayer,
                "displayName": "GHS",
                "name": "layer1",
                "index": 1,
                "visible": false
            },
            {
                "layer": rasterWorldpopLayer,
                "displayName": " Worldpop",
                "name": "layer2",
                "index": 2,
                "visible": false
            },
            {
                "layer": all_samples,
                "displayName": " Classified samples",
                "name": "layer3",
                "index": 3,
                "visible": false
            },
            {
                "layer": group5Tiles,
                "displayName": " Tiles",
                "name": "layer4",
                "index": 4,
                "visible": true
            },
            {
                "layer": rasterDiffLayerClassified,
                "displayName": " GHS-Worldpop +1",
                "name": "layer5",
                "index": 5,
                "visible": false
            },
            {
                "layer": rasterGHSLayerClassified,
                "displayName": "GHS classified",
                "name": "layer6",
                "index": 6,
                "visible": false
            },
            {
                "layer": rasterWorldpopLayerClassified,
                "displayName": " Worldpop classified",
                "name": "layer7",
                "index": 7,
                "visible": false
            },
        ],

        intercomparison_layers: [
            0, 1, 2
        ],
        validation_layers: [
            5,6,7,3
        ],

        // Array of basemap sources
        basemap_array: [
            new ol.source.OSM(),
            new ol.source.XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                    'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            }),
            new ol.source.Stamen({
                layer: 'terrain',
            })
        ],

        leyend: [

        ],

        featureSelected: {}
    },

    mounted: function () {
        //Main basemap layer
        this.featureSelected = {
            visible: true,
            feature: "TILE NOT SELECTED",
            attribute: "",
            value: "Click a tile to see correlation value"
        }
        this.basemap_layer = new ol.layer.Tile({
            source: this.basemap_array[0]
        });
        this.initMap();
        //this.loadFeatures();
        this.initClickListener();
    },

    methods: {
        initMap() {
            this.map = new ol.Map({
                target: "map",
                controls: controls,
                layers: [
                    this.basemap_layer,
                    this.layer_array[0].layer,
                    this.layer_array[1].layer,
                    this.layer_array[2].layer,
                    this.layer_array[3].layer,
                    this.layer_array[5].layer,
                    this.layer_array[6].layer,
                    this.layer_array[7].layer,
                    this.layer_array[4].layer,
                ],
                view: new ol.View({

                    center: ol.proj.fromLonLat([this.init_position.lat, this.init_position.lng]),
                    zoom: 4
                })
            });
        },

        /**
         * Changes the basemap source by setting the source as one of the basemap_array available sources
         * @param {Index of source in basemap_array} index 
         */
        changeBasemap(index) {
            this.basemap_layer.setSource(this.basemap_array[index]);
        },

        toggleLayer(index) {
            let layer = this.layer_array[index].layer;
            this.layer_array[index].visible = !this.layer_array[index].visible;
            layer.setVisible(!layer.getVisible());
        },

        toggleTiles(){
            index = 4;
            let layer = this.layer_array[index].layer;
            this.layer_array[index].visible = !this.layer_array[index].visible;
            this.featureSelected.visible = !this.featureSelected.visible;
            layer.setVisible(!layer.getVisible());
        },

        changeSelection(feature) {
            if (feature == undefined) {
                this.featureSelected.feature = "Tile not selected";
                this.featureSelected.attribute = "";
                this.featureSelected.value = "Click a tile to see correlation value"; //There is a typo in the layer field name...
            } else {
                this.featureSelected.feature = "Tile " + feature.get('tileID');;
                this.featureSelected.attribute = "Correlation";
                this.featureSelected.value = feature.get('correlatio'); //There is a typo in the layer field name...
            }

        },

        initClickListener() {
            this.map.addInteraction(selectClick);
        }
    }
});

selectClick.on('select', function (e) {
    let feature = e.selected[0];
    app.changeSelection(feature);
});