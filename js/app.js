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
//initializing the map once the page loads
function initMap() {
  //empty array of markers
  var markers = [];
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.96, lng: -74.13},
      zoom: 13
    });

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.

    var largeInfowindow = new google.maps.InfoWindow();
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
      // Push the marker to our array of markers.
      markers.push(marker);
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
      });
      bounds.extend(markers[i].position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
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
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.close();
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
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
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

  var komarker = function(data) {
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);
    this.location = ko.computed(function() {
      return this.title() + " - " + this.lat() + this.lng();
    }, this);
  }

  var ViewModel = function() {
    var self = this

    this.placelist = ko.observableArray([]);

    locations.forEach(function(locationitem){
      self.placelist.push( new komarker(locationitem) );
    });
  };

ko.applyBindings(new ViewModel()); // This makes Knockout get to work
