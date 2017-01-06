//global map variable
var locations = [
  //initial location names and coordinates
  {
    title: 'Turvinos',
    location: {
      lat: 40.951103,
      lng: -74.107734
    },
  },
  {
    title: 'Dunkin Donuts',
    location: {
      lat: 40.952343,
      lng: -74.108249
    },
  },
  {
    title: 'Tani Sushi',
    location: {
      lat: 40.962428,
      lng: -74.132178
    },
  },
  {
    title: 'GR Boro Hall',
    location: {
      lat: 40.961433,
      lng: -74.129359
    },
  },
  {
    title: 'Habit Burger',
    location: {
      lat: 40.943329,
      lng: -74.128754
    },
  },
];

var map;
var largeInfowindow;
//initializing the initmap function that is called in the google api callback
//the following is from udacity's google maps course with slight adjustments
function initMap() {
  //empty array of markers
    markers = [];
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.96, lng: -74.13},
      zoom: 13
    });

    //initializing the info window and the bounds
    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });
      //makes marker property of locations
      locations[i].marker = marker;
      // Push the marker to our array of markers.
      markers.push(marker);
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      bounds.extend(markers[i].position);
    }

    var input = document.getElementById('search-box');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo(bounds, map);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        console.log(place);
        newplace = {};
        newplace.location = {lat: 0, lng: 0};
        newplace.location.lat = place.geometry.location.lat();
        newplace.location.lng = place.geometry.location.lng();
        newplace.title = place.name
        newplace.marker = marker = new google.maps.Marker({
          map: map,
          position: newplace.location,
          title: newplace.name,
          animation: google.maps.Animation.DROP,
        });
        markers.push(newplace.marker);
        locations.push(newplace);
        populateInfoWindow(newplace.marker, largeInfowindow);
        // Create a marker per location, and put into markers array.
      });
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
    ko.applyBindings(new ViewModel()); // This makes Knockout get to work
  };

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      infowindow.getMap();
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.close();
        marker.setAnimation(null);
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div id="infowindowinfo">' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 15
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
        }
  }
  var komarkerinfo = function(data) {
    var self = this;
    this.title = data.title;
    this.lat = data.location.lat;
    this.lng = data.location.lng;
    this.marker = data.marker;

    this.location = this.title + " - " + this.lat + "," + this.lng;
  }

  var ViewModel = function() {
    var self = this;

    this.placelist = ko.observableArray([]);

    locations.forEach(function(locationitem){
      self.placelist.push( new komarkerinfo(locationitem) );
    });

    this.animatemarker = function(e) {
      e.marker.setAnimation(google.maps.Animation.BOUNCE);
      populateInfoWindow(e.marker, largeInfowindow);
    };

    this.placesearch = ko.observable('');

    this.filteredlist= function() {
      //blah
    };
  };
