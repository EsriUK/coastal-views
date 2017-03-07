      var map;
      var mouseOver; //used for feature hover
      var mouseOut; //used for feature hover
	  
	  
	  
	  /*Replace with your own view lines!*/
	  var viewLines = "https://services.arcgis.com/WQ9KVmV6xGGMnCiQ/ArcGIS/rest/services/UKCoastalViews_Lines/FeatureServer/0"


      require([
          "esri/map",
          "esri/layers/FeatureLayer",
          "dojo/dom-class",
          "dojo/dom-construct",
          "dojo/on",
          "esri/layers/ArcGISTiledMapServiceLayer",
          "esri/dijit/HomeButton",
          "dojo/domReady!"

      ], function(
          Map,
          FeatureLayer,
          domClass,
          domConstruct,
          on,
          ArcGISTiledMapServiceLayer,
          HomeButton
      ) {



          // ---------- CREATE MAP AND LOAD LAYERS ------------

          //create map
          map = new Map("map", {
              center: [-4.2, 53.9],
              zoom: 3,
              minZoom: 2
          });
          //add home button
          var home = new HomeButton({
              map: map
          }, "HomeButton");
          home.startup();
          home.hide();


          //load custom tiled basemap
		  var tiled = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/CoastalViewsBasemap/MapServer");
          map.addLayer(tiled);

          //load feature layer
          var featureLayer = new FeatureLayer(viewLines, {
              mode: FeatureLayer.MODE_ONDEMAND,
              outFields: ["*"]
          });
          map.addLayer(featureLayer);

          // ---------- EVENT LISTENER ------------	

          //Only enable play button when feature service loaded
          featureLayer.on("update-end", function loaded(event) {
              $("#loader").hide();
              $("#play").addClass("show");
          });

          // ---------- DISABLE USER INTERACTION ON LOAD ------------
          map.on("load", function() {
              map.hideZoomSlider();
              map.disablePan();
              map.disableScrollWheelZoom();
              map.disableRubberBandZoom();
              map.disableDoubleClickZoom();
          });

          // ---------- MOUSE EVENTS ------------	
          function enableMouseOver() {

              //on mouse over
              mouseOver = featureLayer.on("mouse-over", function mouseOver(event) {
                  var svgNode = event.graphic.getNode();
                  svgNode.setAttribute("stroke", "#FFFF00");
                  svgNode.setAttribute("stroke-width", 2.5);
                  svgNode.setAttribute("stroke-opacity", 1);
                  var attributes = event.graphic.attributes;
                  $("#destination").html(attributes.Country)
                  $("#distance > em").html(attributes.distance_miles)
              });
              //on mouse out
              mouseOut = featureLayer.on("mouse-out", function mouseOut(event) {
                  var svgNode = event.graphic.getNode();
                  svgNode.setAttribute("stroke", "rgb(0, 255, 197)");
                  svgNode.setAttribute("stroke-width", "1.2");
                  svgNode.setAttribute("stroke-opacity", 0.27451);
                  var attributes = event.graphic.attributes;
              });

          }


          // ---------- INFO PANEL TOGGLE ------------
          $("#panel-toggle").on('click', function() {
              $("#panel").toggleClass("show");
              $("#panel-toggle").toggleClass("slide");
          });

          // ---------- MAP INTERACTION ------------
          // Prevents user interaction with the map
          function lockMap() {
              map.hideZoomSlider();
              map.disablePan();
              map.disableScrollWheelZoom();
              map.disableRubberBandZoom();
              map.infoWindow.hide();
              map.centerAndZoom([-4.2, 53.9], 3);
              home.hide();
          }

          // Allows users to interact with the map
          function unlockMap() {
              map.showZoomSlider();
              map.enablePan();
              map.enableScrollWheelZoom();
              map.disableRubberBandZoom();
              map.graphics.clear();
              home.show();
          }


          // ---------- BROWSER DETECTION------------		

          //detect IE
          //returns version of IE or false, if browser is not Internet Explorer

          function detectIE() {
              var ua = window.navigator.userAgent;

              var trident = ua.indexOf('Trident/');
              if (trident > 0) {
                  // IE 11 => return version number
                  var rv = ua.indexOf('rv:');
                  return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
              }

              var edge = ua.indexOf('Edge/');
              if (edge > 0) {
                  // Edge (IE 12+) => return version number
                  return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
              }

              // other browser
              return false;
          }

          // ---------- ANNIMATION------------		




          $(function() {
              //on load hide replay, pop-up(return) and info panel
              $("#replay, #return, #panel-toggle").hide();
              // detect browser
              var version = detectIE();

              //if not IE or Edge play svg annimation and display replay button at end
              if (version === false) {
                  $("#play").on('click', function() {
                      //when click reveal, remove play button, remove splash and annimate
                      $("body").addClass("animate").removeClass('infoshown');
                      $("#play, #splash").fadeOut('fast');
                      setTimeout(function() {
                          //add replay button, pop-up (return), remove annimation, display svg, enable mouse over and unlock map
                          $("#replay, #panel-toggle, #return").fadeIn("slow");
                          $("body").removeClass("animate").addClass('infoshown');
                          $("body").addClass("end");
                          enableMouseOver();
                          unlockMap();
                      }, 7000);
                  });
                  //replay function
                  $("#replay").on('click', function() {
                      //when click replay, remove ui, lock map and annimate
                      lockMap();
                      $('#replay, #return, #panel, #panel-toggle').fadeOut('fast');
                      mouseOver.remove();
                      mouseOut.remove();
                      setTimeout(function() {
                          $("body").addClass("animate").removeClass('infoshown');
                      }, 7);
                      setTimeout(function() {
                          //add replay button, pop-up (return), remove annimation, display svg, enable mouse over and unlock map
                          unlockMap();
                          $('#replay, #return').fadeIn("slow");
                          $("body").removeClass("animate").addClass('infoshown');
                          $("body").addClass("end");
                          $("#panel, #panel-toggle").fadeIn('fast');
                          enableMouseOver();
                      }, 7000);
                  });
                  //if IE or Edge  DO NOT play svg annimation. Instead just show the lines and don't present a replay button
              } else if (version >= 12) {
                  $("#play").on('click', function() {
                      $("#play, #splash").fadeOut('fast');
                      $("#panel-toggle, #return").fadeIn("slow");
                      $("body").addClass("end");
                      enableMouseOver();
                      unlockMap();
                  });
                  //if IE or Edge  DO NOT play svg annimation. Instead just show the lines and don't present a replay button
              } else {
                  $("#play").on('click', function() {
                      $("#play, #splash").fadeOut('fast');
                      $("#panel-toggle, #return").fadeIn("slow");
                      $("body").addClass("end");
                      enableMouseOver();
                      unlockMap();
                  });
              }
          });
      });

      // ---------- PREVENT SCROLLING ON MOBILE DEVICES ------------
      document.ontouchmove = function(event) {
          event.preventDefault();
      }