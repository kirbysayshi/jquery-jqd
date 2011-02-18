var jQuery = function(){
        return new jQuery.fn.init();
    },
    
    // Promise methods (with equivalent for invert)
    promiseMethods = {
        then: 0, // will be overwritten for invert
        done: "fail",
    	fail: "done",
    	isResolved: "isRejected",
    	isRejected: "isResolved",
    	promise: "invert",
    	invert: "promise"
    },

    class2type = {};

jQuery.fn = jQuery.prototype = {
    init: function(){
        return this;
    }
};

jQuery.extend = jQuery.fn.extend = function() {
    var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({

    
    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function( obj ) {
    	return jQuery.type(obj) === "function";
    },
    
    isArray: Array.isArray || function( obj ) {
    	return jQuery.type(obj) === "array";
    },
    
    // A crude way of determining if an object is a window
    isWindow: function( obj ) {
    	return obj && typeof obj === "object" && "setInterval" in obj;
    },
    
    isNaN: function( obj ) {
    	return obj == null || !rdigit.test( obj ) || isNaN( obj );
    },
    
    type: function( obj ) {
    	return obj == null ?
    		String( obj ) :
    		class2type[ toString.call(obj) ] || "object";
    },
    
    isPlainObject: function( obj ) {
    	// Must be an Object.
    	// Because of IE, we also have to check the presence of the constructor property.
    	// Make sure that DOM nodes and window objects don't pass through, as well
    	if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
    		return false;
    	}
    
    	// Not own constructor property must be Object
    	if ( obj.constructor &&
    		!hasOwn.call(obj, "constructor") &&
    		!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
    		return false;
    	}
    
    	// Own properties are enumerated firstly, so to speed up,
    	// if last one is own, then all properties are own.
    
    	var key;
    	for ( key in obj ) {}
    
    	return key === undefined || hasOwn.call( obj, key );
    },
    
    isEmptyObject: function( obj ) {
    	for ( var name in obj ) {
    		return false;
    	}
    	return true;
    },

    // args is for internal usage only
    each: function( object, callback, args ) {
    	var name, i = 0,
    		length = object.length,
    		isObj = length === undefined || jQuery.isFunction(object);
    
    	if ( args ) {
    		if ( isObj ) {
    			for ( name in object ) {
    				if ( callback.apply( object[ name ], args ) === false ) {
    					break;
    				}
    			}
    		} else {
    			for ( ; i < length; ) {
    				if ( callback.apply( object[ i++ ], args ) === false ) {
    					break;
    				}
    			}
    		}
    
    	// A special, fast, case for the most common use of each
    	} else {
    		if ( isObj ) {
    			for ( name in object ) {
    				if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
    					break;
    				}
    			}
    		} else {
    			for ( var value = object[0];
    				i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
    		}
    	}
    
    	return object;
    },

        // Create a simple deferred (one callbacks list)
    _Deferred: function() {
        var // callbacks list
    		callbacks = [],
    		// stored [ context , args ]
    		fired,
    		// to avoid firing when already doing so
    		firing,
    		// flag to know if the deferred has been cancelled
    		cancelled,
    		// the deferred itself
    		deferred  = {
    
    			// done( f1, f2, ...)
    			done: function() {
    				if ( !cancelled ) {
    					var args = arguments,
    						i,
    						length,
    						elem,
    						type,
    						_fired;
    					if ( fired ) {
    						_fired = fired;
    						fired = 0;
    					}
    					for ( i = 0, length = args.length; i < length; i++ ) {
    						elem = args[ i ];
    						type = jQuery.type( elem );
    						if ( type === "array" ) {
    							deferred.done.apply( deferred, elem );
    						} else if ( type === "function" ) {
    							callbacks.push( elem );
    						}
    					}
    					if ( _fired ) {
    						deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
    					}
    				}
    				return this;
    			},
    
    			// resolve with given context and args
    			resolveWith: function( context, args ) {
    				if ( !cancelled && !fired && !firing ) {
    					firing = 1;
    					try {
    						while( callbacks[ 0 ] ) {
    							callbacks.shift().apply( context, args );
    						}
    					}
    					finally {
    						fired = [ context, args ];
    						firing = 0;
    					}
    				}
    				return this;
    			},
    
    			// resolve with this as context and given arguments
    			resolve: function() {
    				deferred.resolveWith( jQuery.isFunction( this.promise ) ? this.promise() : this, arguments );
    				return this;
    			},
    
    			// Has this deferred been resolved?
    			isResolved: function() {
    				return !!( firing || fired );
    			},
    
    			// Cancel
    			cancel: function() {
    				cancelled = 1;
    				callbacks = [];
    				return this;
    			}
    		};
    
    	return deferred;
    },
    
    // Full fledged deferred (two callbacks list)
    Deferred: function( func ) {
    	var deferred = jQuery._Deferred(),
    		failDeferred = jQuery._Deferred(),
    		promise,
    		invert;
    	// Add errorDeferred methods, then, promise and invert
    	jQuery.extend( deferred, {
    		then: function( doneCallbacks, failCallbacks ) {
    			deferred.done( doneCallbacks ).fail( failCallbacks );
    			return this;
    		},
    		fail: failDeferred.done,
    		rejectWith: failDeferred.resolveWith,
    		reject: failDeferred.resolve,
    		isRejected: failDeferred.isResolved,
    		// Get a promise for this deferred
    		// If obj is provided, the promise aspect is added to the object
    		promise: function( obj ) {
    			if ( obj == null ) {
    				if ( promise ) {
    					return promise;
    				}
    				promise = obj = {};
    			}
    			for( var methodName in promiseMethods ) {
    				obj[ methodName ] = deferred[ methodName ];
    			}
    			return obj;
    		},
    		// Get the invert promise for this deferred
    		// If obj is provided, the invert promise aspect is added to the object
    		invert: function( obj ) {
    			if ( obj == null ) {
    				if ( invert ) {
    					return invert;
    				}
    				invert = obj = {};
    			}
    			for( var methodName in promiseMethods ) {
    				obj[ methodName ] = promiseMethods[ methodName ] && deferred[ promiseMethods[methodName] ];
    			}
    			obj.then = invert.then || function( doneCallbacks, failCallbacks ) {
    				deferred.done( failCallbacks ).fail( doneCallbacks );
    				return this;
    			};
    			return obj;
    		}
    	} );
    	// Make sure only one callback list will be used
    	deferred.then( failDeferred.cancel, deferred.cancel );
    	// Unexpose cancel
    	delete deferred.cancel;
    	// Call given func if any
    	if ( func ) {
    		func.call( deferred, deferred );
    	}
    	return deferred;
    },
    
    // Deferred helper
    when: function( object ) {
    	var args = arguments,
    		length = args.length,
    		deferred = length <= 1 && object && jQuery.isFunction( object.promise ) ?
    			object :
    			jQuery.Deferred(),
    		promise = deferred.promise(),
    		resolveArray;
    
    	if ( length > 1 ) {
    		resolveArray = new Array( length );
    		jQuery.each( args, function( index, element ) {
    			jQuery.when( element ).then( function( value ) {
    				resolveArray[ index ] = arguments.length > 1 ? slice.call( arguments, 0 ) : value;
    				if( ! --length ) {
    					deferred.resolveWith( promise, resolveArray );
    				}
    			}, deferred.reject );
    		} );
    	} else if ( deferred !== object ) {
    		deferred.resolve( object );
    	}
    	return promise;
    }

});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

exports.jqd = {
     deferred: jQuery.Deferred
    ,when: jQuery.when
    ,jqCore: jQuery
};