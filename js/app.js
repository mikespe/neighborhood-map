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
//initializing global variables
var map;
var largeInfowindow;
var foursquaredata = {};

//init error handler
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
        //populate infowindow on click
        populateInfoWindow(this, largeInfowindow);
        var self = this;
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.setAnimation(null);
        }, 2800);

      });
      //exten bounds of map to new marker positions
      bounds.extend(markers[i].position);
    }
    //select input box to apply autocomplete to
    var input = document.getElementById('search-box');
    //initialize autocomplete on input box
    var autocomplete = new google.maps.places.Autocomplete(input);
    //bind autocomplete to the bounds of the map, and the map itself
    autocomplete.bindTo(bounds, map);
    //add eventlistener to event change in search box
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        //get place info on autocompleted place
        var place = autocomplete.getPlace();
        //intialize empty object, set location and title
        newplace = {};
        newplace.location = {lat: 0, lng: 0};
        newplace.location.lat = place.geometry.location.lat();
        newplace.location.lng = place.geometry.location.lng();
        newplace.title = place.name
        //create marker associated with the new object with new info
        newplace.marker = new google.maps.Marker({
          map: map,
          position: newplace.location,
          title: newplace.title,
          animation: google.maps.Animation.DROP,
        });
        //push new object marker onto the markers variable
        markers.push(newplace.marker);
        //add new place to model
        locations.push(newplace);
        //populate infowindow
        populateInfoWindow(newplace.marker, largeInfowindow);
        //console.log(locations);
        // Create a marker per location, and put into markers array.
      });

    // Extend the boundaries of the map for each marker
    google.maps.event.addDomListener(window, 'resize', function() {
      map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    });

    ko.applyBindings(new ViewModel()); // This makes Knockout get to work
  };

  function googleapierror() {
    //what gets executed when there is an error loading googlee maps api
     alert('google maps api isnt loading properly');
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
        //close infowinow
        infowindow.close();
        //on close, stop animation
        marker.setAnimation(null);
      });
      //init stretview service
      var streetViewService = new google.maps.StreetViewService();
      //set radius for streetview
      var radius = 50;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        //if status is ok
        if (status == google.maps.StreetViewStatus.OK) {
          //set info
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            //populate infowindow with good info
            infowindow.setContent('<div id="infowindowinfo">' + marker.title + ' ' + '<div>URL & Phonenumber:' + ' ' + marker.url + ' ' + marker.phonenumber +'</div></div><div id="pano"></div>');
            //set options on the panorama
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 15
              }
            };
            //init panorama of location under pano id in infowindow
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          //if status isn't ok. change info window to tell user
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position using radius
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
      marker.addListener('click', function() {
        map.panTo(marker.getPosition());
      });

        }
  };

  //init view of marker and 4square ajax requests
  var komarkerinfo = function(data) {
    var self = this;
    this.title = data.title;
    this.lat = data.location.lat;
    this.lng = data.location.lng;
    //allows us to 'tell' the marker and list items to be visible or not
    this.visible = ko.observable(true);
    this.marker = data.marker;
    this.url = '';
    this.phonenumber = '';
    //initially store 4square results
    this.formattedresults = [];

    //controling the view of the markers
    this.markervisible = ko.computed(function() {
      //if the observable visible is true
      if(this.visible() === true) {
        //set this marker to be visible by passing in map to setMap
        this.marker.setMap(map);
        //if visible is false
      } else {
        //tell markers to hide by passing in null to the markers
        this.marker.setMap(null);
      }
      return true;
    }, this);

    //store keys for 4square
    this.consumerkey = 'YLXHOWLP04E14Y1ZU4OFO1DRY1WN1QAKD4JGZ02IZGVDX2YX';
    this.consumersecret = 'IMVUAISVUNFZFN1T0P3LTHI5UV0EJUEFLD5XJURPD44RDGNE';

    //store query before ajax request
    this.foursquarequery = 'https://api.foursquare.com/v2/venues/search?ll='+ self.lat + ',' + self.lng + '&client_id=' + this.consumerkey + '&client_secret=' + this.consumersecret + '&v=20170108' + '&query=' + self.title;

    //shorthand ajax request
    $.getJSON(this.foursquarequery).done(function(data) {
      //if successful, perform below operations
      //set url, phone and formattedresults
      console.log(data);
      self.marker.url = data.response.venues[0].url;
      if(typeof self.marker.url === 'undefined') {
        self.marker.url = 'URL not found,';
      }
      self.marker.phonenumber = data.response.venues[0].contact.phone;
      if(typeof self.marker.phonenumber === 'undefined') {
        self.marker.phonenumber = 'Phonenumber not found';
      }
    }).fail(function() {
      alert('fail to load yelp info');
    });

  };

  //init viewmodel
  var ViewModel = function() {
    //scope trick to always have a this referring to viemodel
    var self = this;

    //init observable array
    this.placelist = ko.observableArray([]);

    //for the locations, place them in observableArray
    locations.forEach(function(locationitem){
      self.placelist.push( new komarkerinfo(locationitem) );
    });

    //when list is clicked, perform this function
    this.animatemarker = function(e) {
      //this list clicked, animate that specific marker
      e.marker.setAnimation(google.maps.Animation.BOUNCE);
      //populate specific infowindow
      populateInfoWindow(e.marker, largeInfowindow);
      setTimeout(function() {
          e.marker.setAnimation(null);
      }, 2800);
    };

    //init observable that changes based on user input
    this.placesearch = ko.observable('');

    //list filtered based on search input
    this.filteredplacelist = ko.computed( function() {
      //set input to lowercase
  		var searchbox = self.placesearch().toLowerCase();
      //if theres nothing in the input box
  		if (!searchbox) {
        //each placelist and marker will be visible
  			self.placelist().forEach(function(markerlist){
  				markerlist.visible(true);
  			});
        //return the placelist
  			return self.placelist();
        //if input has input in it
  		} else {
        //return sorted list accoring to the executed function, help from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  			return ko.utils.arrayFilter(self.placelist(), function(markerlist) {
          //set string to the lowercase title of the list
  				var string = markerlist.title.toLowerCase();
          //set result to the result of a search of the markerlist titles and the searchbox input.
  				var result = (string.search(searchbox) >= 0);
          //make certain markers on the list depending on match of search.
  				markerlist.visible(result);
  				return result;
  			});
  		}
  	}, self);

  };
