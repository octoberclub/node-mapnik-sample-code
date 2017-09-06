
// This example shows how to use node-mapnik to render
// a map to a image on disk
//
// run command: node ./render/app.js ./stylesheet.xml map.png
//
// expected output: https://github.com/mapnik/node-mapnik-sample-code/blob/master/outputs/map.png

var mapnik = require('mapnik');
var sys = require('fs');
var child_process = require('child_process');
var usage = 'usage: render.js <stylesheet> <image>';

var stylesheet = process.argv[2];
if (!stylesheet) {
   console.log(usage);
   process.exit(1);
}

var image = process.argv[3];
if (!image) {
   console.log(usage);
   process.exit(1);
}

// register shapefile plugin
if (mapnik.register_default_input_plugins) mapnik.register_default_input_plugins();
mapnik.register_default_fonts();

var map = new mapnik.Map(1024, 800);

var srs = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"

map.srs= srs;

//
// read in input
//
noise = require("../noisedata.json");
// console.log(noise['datasets'][0]['geojson']);

//
// calc extents
//
// TODO: calculate extents (lax, lay etc. below) - use GDAL?

//
// Create background layer
//
var bg_layer = new mapnik.Layer("bg_lyr");

bg_layer.datasource = new mapnik.Datasource({ 'type': 'raster', 'file': 'noise_bg.png',
//'lox': 337500.24015247775, 'loy': 362206.6933502753, 'hix': 337700.24015247775, 'hiy': 362300.6933502753 });
'lox': 511351.7435144611, 'loy': 220977.96466369674, 'hix': 511688.0605144609, 'hiy': 221314.28166369654});
bg_layer.srs=srs;
bg_layer.styles=["background_map"];

map.add_layer(bg_layer);

///
// Create noise layer
//

var dataset = noise['datasets'][0]
var geojson = dataset['geojson'];

var noise_layer = new mapnik.Layer("noise");
console.log(JSON.stringify(geojson));
noise_layer.datasource = new mapnik.Datasource({
  'type': 'ogr',
  'layer': 'OGRGeoJSON',
  'string': JSON.stringify(geojson)
});
noise_layer.srs = srs;
noise_layer.styles=[dataset['dataset']]

map.add_layer(noise_layer);

//
// Create site outline layer
//


var site = noise['site']

var site_outline = new mapnik.Layer("site_outline");
site_outline.datasource = new mapnik.Datasource({
  'type': 'csv',
  'inline': 'id,wkt\n1,"' + site + '"\n'
});
site_outline.srs=srs;
site_outline.styles=["site_outline"];

map.add_layer(site_outline);

//
// Generate map
//

map.loadSync(stylesheet);



//  TODO: zoom to extents only
//map.zoomAll();
map.zoomToBox([511351.7435144611, 220977.96466369674, 511688.0605144609, 221314.28166369654]);
map.renderFileSync(image);

console.log('rendered map to ' + image);

if (process.argv.indexOf('--no-open') == -1) {
    child_process.exec('open ' + image);
}
