var zoomflag = 0; // Added by Peter Petrov
// Custom reveal.js integration
(function(){
	var isEnabled = true;

	function css_browser_selector(u){var ua=u.toLowerCase(),is=function(t){return ua.indexOf(t)>-1},g='gecko',w='webkit',s='safari',o='opera',m='mobile',h=document.documentElement,b=[(!(/opera|webtv/i.test(ua))&&/msie\s(\d)/.test(ua))?('ie ie'+RegExp.$1):is('firefox/2')?g+' ff2':is('firefox/3.5')?g+' ff3 ff3_5':is('firefox/3.6')?g+' ff3 ff3_6':is('firefox/3')?g+' ff3':is('gecko/')?g:is('opera')?o+(/version\/(\d+)/.test(ua)?' '+o+RegExp.$1:(/opera(\s|\/)(\d+)/.test(ua)?' '+o+RegExp.$2:'')):is('konqueror')?'konqueror':is('blackberry')?m+' blackberry':is('android')?m+' android':is('chrome')?w+' chrome':is('iron')?w+' iron':is('applewebkit/')?w+' '+s+(/version\/(\d+)/.test(ua)?' '+s+RegExp.$1:''):is('mozilla/')?g:'',is('j2me')?m+' j2me':is('iphone')?m+' iphone':is('ipod')?m+' ipod':is('ipad')?m+' ipad':is('mac')?'mac':is('darwin')?'mac':is('webtv')?'webtv':is('win')?'win'+(is('windows nt 6.0')?' vista':''):is('freebsd')?'freebsd':(is('x11')||is('linux'))?'linux':'','js']; c = b.join(' '); h.className += ' '+c; return c;}; // Added by Peter Petrov
	css_browser_selector(navigator.userAgent); 													//

	var timeout;																				//
	var lastTap = 0;																			//
	document.querySelector( '.reveal .slides' ).addEventListener('touchend', function(event) {	//
	    var currentTime = new Date().getTime();													//
	    var tapLength = currentTime - lastTap;													//
	    clearTimeout(timeout);																	//
	    if (tapLength < 500 && tapLength > 0) {													//
			var modifier = event.target.className; 												// Changed by Peter Petrov
			var zoomPadding = 25; 																// Changed from 20 to 25 by Peter Petrov
			var revealScale = Reveal.getScale();												//
			if( modifier == "mozoom" ) { 														//
			event.preventDefault();																//	
				if(c.search('chrome')==-1){	zoom.to({element: event.target, pan: false});} 		// Added by Peter Petrov
				else{ 																			//
					var bounds = event.target.getBoundingClientRect();							//
					var u = navigator.userAgent, ua = u.toLowerCase();							//
					zoom.to({																	//
						x: ( bounds.left * revealScale ) - zoomPadding,							//
						y: ( bounds.top * revealScale ) - zoomPadding,							//
						width: ( bounds.width * revealScale ) + ( zoomPadding * 2 ),			//
						height: ( bounds.height * revealScale ) + ( zoomPadding * 2 ),			//
						pan: false																//
						});																		//
					}																			//	Added by Peter Petrov
				} 																				//
	    } else {																				//
	        timeout = setTimeout(function() {													//
	            clearTimeout(timeout);															//
	        }, 500);																			//
	    }																						//
	    lastTap = currentTime;																	//
	});																							//

	document.querySelector( '.reveal .slides' ).addEventListener( 'click', function( event ) { 
		var modifier = event.target.className; 													// Changed by Peter Petrov
		var zoomPadding = 25;																	// Changed from 20 to 25 by Peter Petrov
		var revealScale = Reveal.getScale();													//
		if( modifier == "zoomel mozoom" ) { 															//
			event.preventDefault(); 															// 
			if(c.search('chrome')==-1){zoom.to({element: event.target, pan: false});} 			// Added by Peter Petrov
			else{ 																				//
				var bounds = event.target.getBoundingClientRect();
				var u = navigator.userAgent, ua = u.toLowerCase();
				zoom.to({
					x: ( bounds.left * revealScale ) - zoomPadding,
					y: ( bounds.top * revealScale ) - zoomPadding,
					width: ( bounds.width * revealScale ) + ( zoomPadding * 2 ),
					height: ( bounds.height * revealScale ) + ( zoomPadding * 2 ),
					pan: false
					});	
				}																				//	Added by Peter Petrov
			} 
	} );

	Reveal.addEventListener( 'overviewshown', function() { isEnabled = false; } );
	Reveal.addEventListener( 'overviewhidden', function() { isEnabled = true; } );
})();

/*!
 * zoom.js 0.3 (modified for use with reveal.js)
 * http://lab.hakim.se/zoom-js
 * MIT licensed
 *
 * Copyright (C) 2011-2014 Hakim El Hattab, http://hakim.se
 */
var zoom = (function(){

	// The current zoom level (scale)
	var level = 1;

	// The current mouse position, used for panning
	var mouseX = 0,
		mouseY = 0;

	// Timeout before pan is activated
	var panEngageTimeout = -1,
		panUpdateInterval = -1;

	// Check for transform support so that we can fallback otherwise
	var supportsTransforms = 	'WebkitTransform' in document.body.style ||
								'MozTransform' in document.body.style ||
								'msTransform' in document.body.style ||
								'OTransform' in document.body.style ||
								'transform' in document.body.style;

	if( supportsTransforms ) {
		// The easing that will be applied when we zoom in/out
		document.body.style.transition = 'transform 0.6s ease';					//
		document.body.style.OTransition = '-o-transform 0.6s ease';				//
		document.body.style.msTransition = '-ms-transform 0.6s ease';			// Changed by Peter Petrov from 0.8s to 0.6s
		document.body.style.MozTransition = '-moz-transform 0.6s ease';			//
		document.body.style.WebkitTransition = '-webkit-transform 0.6s ease';	//
	}

	// Zoom out if the user hits escape
	document.addEventListener( 'keyup', function( event ) {
		if( level !== 1 && event.keyCode === 27 ) {
			zoom.out();
		}
	} );

	// Monitor mouse movement for panning
	document.addEventListener( 'mousemove', function( event ) {
		if( level !== 1 ) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		}
	} );

	/**
	 * Applies the CSS required to zoom in, prefers the use of CSS3
	 * transforms but falls back on zoom for IE.
	 *
	 * @param {Object} rect
	 * @param {Number} scale
	 */
	function magnify( rect, scale ) {
	
		var setsections = document.querySelectorAll("section.stack.present section:not(.present)"); 
		var presentsec = document.querySelector("section.stack.present section.present");										//
		var futuresec = document.querySelector("section.stack.present section.future");											//
		var pastsec = document.querySelector("section.stack.present section.past");												//
		if(presentsec){																											//
			if(scale!=1){																										//
				for(i=0; i<setsections.length; i++){																			//
					setsections[i].style.display = "none"; 																		//
				}																												//
				presentsec.style.display = "block";																				// Added by Peter Petrov
			}																													//
			else{																												//
				if(futuresec){																									//
					futuresec.style.display = "block"																			//
				}; 																												//
				var lastpastsection = document.querySelectorAll("section.stack.present section.past").length;					//
				if(document.querySelectorAll("section.stack.present section.past")[lastpastsection-1]){							//
					document.querySelectorAll("section.stack.present section.past")[lastpastsection-1].style.display = "block";	//
				}																												//
			}																													//
		}
		var scrollOffset = getScrollOffset();

		// Ensure a width/height is set
		rect.width = rect.width || 1;
		rect.height = rect.height || 1;

		// Center the rect within the zoomed viewport
		rect.x -= ( window.innerWidth - ( rect.width * scale ) ) / 2;
		rect.y -= ( window.innerHeight - ( rect.height * scale ) ) / 2;

		if( supportsTransforms ) {
			// Reset
			if( scale === 1 ) {
				document.body.style.transform = '';
				document.body.style.OTransform = '';
				document.body.style.msTransform = '';
				document.body.style.MozTransform = '';
				document.body.style.WebkitTransform = '';
			}
			// Scale
			else {
				var origin = scrollOffset.x +'px '+ scrollOffset.y +'px',
					transform = 'translate('+ -rect.x +'px,'+ -rect.y +'px) scale('+ scale +')';

				document.body.style.transformOrigin = origin;
				document.body.style.OTransformOrigin = origin;
				document.body.style.msTransformOrigin = origin;
				document.body.style.MozTransformOrigin = origin;
				document.body.style.WebkitTransformOrigin = origin;

				document.body.style.transform = transform;
				document.body.style.OTransform = transform;
				document.body.style.msTransform = transform;
				document.body.style.MozTransform = transform;
				document.body.style.WebkitTransform = transform;
			}
		}
		else {
			// Reset
			if( scale === 1 ) {
				document.body.style.position = '';
				document.body.style.left = '';
				document.body.style.top = '';
				document.body.style.width = '';
				document.body.style.height = '';
				document.body.style.zoom = '';
			}
			// Scale
			else {
				document.body.style.position = 'relative';
				document.body.style.left = ( - ( scrollOffset.x + rect.x ) / scale ) + 'px';
				document.body.style.top = ( - ( scrollOffset.y + rect.y ) / scale ) + 'px';
				document.body.style.width = ( scale * 100 ) + '%';
				document.body.style.height = ( scale * 100 ) + '%';
				document.body.style.zoom = scale;
			}
		}

		level = scale;

		if( document.documentElement.classList ) {															// Added by Peter Petrov
			if( level !== 1 ) {																				//
				document.documentElement.classList.add( 'zoomed' );											//
				zoomflag = 1;																				//
				if(c.search('chrome')!=-1){																	//		
					if(document.body.clientWidth<screen.width){												//
						var titletext = 'Ако увеличеното изображение е неясно,\rмаксимизирайте прозреца и увеличете пак.';//
						if(document.getElementsByClassName('bg-lang')[0].style.display=='none'){			//
						titletext='If zoomed image is blur, maximize\rthe window and zoom in again.';		//
						}																					//
						event.target.title=titletext;														//
					}																						//
				    var text = document.getElementById('autosel');    										//
					if (window.getSelection) { 																//
				        var selection = window.getSelection();            									//
				        var range = document.createRange();													//
				        range.selectNodeContents(text);														//
				        selection.removeAllRanges();														//
				        selection.addRange(range);															//
				    }																						//
				}																							//
			}																								//
			else {																							//
				document.documentElement.classList.remove( 'zoomed' );										//
				zoomflag = 0;																				//
				if(c.search('chrome')!=-1){event.target.title="";}											//
			}																								//
		}																									//
	}

	/**
	 * Pan the document when the mosue cursor approaches the edges
	 * of the window.
	 */
	function pan() {
		var range = 0.12,
			rangeX = window.innerWidth * range,
			rangeY = window.innerHeight * range,
			scrollOffset = getScrollOffset();
			
		// Up
		if( mouseY < rangeY ) {
			window.scroll( scrollOffset.x, scrollOffset.y - ( 1 - ( mouseY / rangeY ) ) * ( 14 / level ) );
		}
		// Down
		else if( mouseY > window.innerHeight - rangeY ) {
			window.scroll( scrollOffset.x, scrollOffset.y + ( 1 - ( window.innerHeight - mouseY ) / rangeY ) * ( 14 / level ) );
		}

		// Left
		if( mouseX < rangeX ) {
			window.scroll( scrollOffset.x - ( 1 - ( mouseX / rangeX ) ) * ( 14 / level ), scrollOffset.y );
		}
		// Right
		else if( mouseX > window.innerWidth - rangeX ) {
			window.scroll( scrollOffset.x + ( 1 - ( window.innerWidth - mouseX ) / rangeX ) * ( 14 / level ), scrollOffset.y );
		}
	}

	function getScrollOffset() {
		return {
			x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
			y: window.scrollY !== undefined ? window.scrollY : window.pageYOffset
		}
	}

	return {
		/**
		 * Zooms in on either a rectangle or HTML element.
		 *
		 * @param {Object} options
		 *   - element: HTML element to zoom in on
		 *   OR
		 *   - x/y: coordinates in non-transformed space to zoom in on
		 *   - width/height: the portion of the screen to zoom in on
		 *   - scale: can be used instead of width/height to explicitly set scale
		 */
		to: function( options ) {

			// Due to an implementation limitation we can't zoom in
			// to another element without zooming out first
			if( level !== 1 ) {
				zoom.out();
			}
			else {
				options.x = options.x || 0;
				options.y = options.y || 0;

				// If an element is set, that takes precedence
				if( !!options.element ) {
					// Space around the zoomed in element to leave on screen
					var padding = 20;
					var bounds = options.element.getBoundingClientRect();

					options.x = bounds.left - padding;
					options.y = bounds.top - padding;
					options.width = bounds.width + ( padding * 2 );
					options.height = bounds.height + ( padding * 2 );
				}

				// If width/height values are set, calculate scale from those values
				if( options.width !== undefined && options.height !== undefined ) {
					options.scale = Math.max( Math.min( window.innerWidth / options.width, window.innerHeight / options.height ), 1 );
				}

				if( options.scale > 1 ) {
					options.x *= options.scale;
					options.y *= options.scale;

					magnify( options, options.scale );
					
					if( options.pan !== false ) {

						// Wait with engaging panning as it may conflict with the
						// zoom transition
						panEngageTimeout = setTimeout( function() {
							panUpdateInterval = setInterval( pan, 1000 / 60 );
						}, 800 );

					}
				}
			}
		},

		/**
		 * Resets the document zoom state to its default.
		 */
		out: function() {
			clearTimeout( panEngageTimeout );
			clearInterval( panUpdateInterval );

			magnify( { x: 0, y: 0 }, 1 );

			level = 1;
		},

		// Alias
		magnify: function( options ) { this.to( options ) },
		reset: function() { this.out() },

		zoomLevel: function() {
			return level;
		}
	}

})();