
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

var map = new mapnik.Map(600, 400);
map.srs= "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";

// 
// Create background layer
//
var bg_layer = new mapnik.Layer("bg_lyr");

// 337466.24015247775, 362106.6933502753, 337730.24015247775, 362370.6933502753)
bg_layer.datasource = new mapnik.Datasource({ 'type': 'raster', 'file': 'bg_map.png', 
  'lox': 337500.24015247775, 'loy': 362206.6933502753, 'hix': 337700.24015247775, 'hiy': 362300.6933502753 });
bg_layer.srs= "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";
bg_layer.styles=["background_map"];

//
// Create site outline layer
//

var site = "Polygon((337581 362223, 337581 362223, 337581 362223, 337583 362238, 337584 362240, 337584 362245, 337585 362250, 337586 362260, 337588 362260, 337593 362260, 337597 362260, 337598 362260, 337602 362260, 337605 362261, 337608 362261, 337609 362261, 337611 362241, 337616 362242, 337617 362226, 337595 362217, 337590 362219, 337585 362221, 337581 362223))";

var site_outline = new mapnik.Layer("site_outline");
site_outline.datasource = new mapnik.Datasource({
  'type': 'csv',
  'inline': 'id,wkt\n1,"' + site + '"\n'
});
site_outline.srs= "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";
site_outline.styles=["site_outline", "defra_noise_rail_lden"];


// 
// Add layers to map
//

map.add_layer(bg_layer);
map.add_layer(site_outline);

//
// Generate map
//

map.loadSync(stylesheet);
map.zoomAll();
map.renderFileSync(image);

console.log('rendered map to ' + image);

if (process.argv.indexOf('--no-open') == -1) {
    child_process.exec('open ' + image);
}
