//global map variable
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
    var locations = [
      //initial location names and coordinates
      {
        title: 'Turvinos',
        location: {
          lat: 40.951,
          lng: -74.107
        },
      },
      {
        title: 'Dunkin Donuts',
        location: {
          lat: 40.9523,
          lng: -74.108
        },
      },
      {
        title: 'Tani Sushi',
        location: {
          lat: 40.9622,
          lng: -74.13234
        },
      },
      {
        title: 'GRHS',
        location: {
          lat: 40.95592,
          lng: -74.121
        },
      },
      {
        title: 'Coleman Elementary',
        location: {
          lat: 40.955660,
          lng: -74.115395
        },
      },
    ];

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
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.close();
      });
    }
  };

  var ViewModel = function() {
    var self = this
    this.placelist = ko.observablearray([]);

    locations.forEach(function(locationitem){
      self.placelist.push(locationitem);
    });
  };

  ko.applyBindings(new ViewModel()); // This makes Knockout get to work
