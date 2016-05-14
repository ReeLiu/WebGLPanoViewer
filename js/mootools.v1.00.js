//MooTools, My Object Oriented Javascript Tools. Copyright (c) 2006 Valerio Proietti, <http://mad4milk.net>, MIT Style License.
var Class = function(properties){
	var klass = function(){
		if (this.initialize && arguments[0] != 'noinit') return this.initialize.apply(this, arguments);
		else return this;
	};
	for (var property in this) klass[property] = this[property];
	klass.prototype = properties;
	return klass;
};

Class.empty = function(){};

Class.prototype = {

	extend: function(properties){
		var pr0t0typ3 = new this('noinit');

		var parentize = function(previous, current){
			if (!previous.apply || !current.apply) return false;
			return function(){
				this.parent = previous;
				return current.apply(this, arguments);
			};
		};

		for (var property in properties){
			var previous = pr0t0typ3[property];
			var current = properties[property];
			if (previous && previous != current) current = parentize(previous, current) || current;
			pr0t0typ3[property] = current;
		}
		return new Class(pr0t0typ3);
	},

	implement: function(properties){
		for (var property in properties) this.prototype[property] = properties[property];
	}

};

Object.extend = function(){
	var args = arguments;
	args = (args[1]) ? [args[0], args[1]] : [this, args[0]];
	for (var property in args[1]) args[0][property] = args[1][property];
	return args[0];
};

Object.Native = function(){
	for (var i = 0; i < arguments.length; i++) arguments[i].extend = Class.prototype.implement;
};

new Object.Native(Function, Array, String, Number, Class);

if (typeof HTMLElement == 'undefined'){
	var HTMLElement = Class.empty;
	HTMLElement.prototype = {};
} else {
	HTMLElement.prototype.htmlElement = true;
}

window.extend = document.extend = Object.extend;
var Window = window;

function $type(obj){
	if (obj === null || obj === undefined) return false;
	var type = typeof obj;
	if (type == 'object'){
		if (obj.htmlElement) return 'element';
		if (obj.push) return 'array';
		if (obj.nodeName){
			switch (obj.nodeType){
				case 1: return 'element';
				case 3: return obj.nodeValue.test(/\S/) ? 'textnode' : 'whitespace';
			}
		}
	}
	return type;
};

function $chk(obj){
	return !!(obj || obj === 0);
};

function $pick(obj, picked){
	return ($type(obj)) ? obj : picked;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

if (window.ActiveXObject) window.ie = window[window.XMLHttpRequest ? 'ie7' : 'ie6'] = true;
else if (document.childNodes && !document.all && !navigator.taintEnabled) window.khtml = true;
else if (document.getBoxObjectFor != null) window.gecko = true;

if (window.ie6) try {document.execCommand("BackgroundImageCache", false, true);} catch (e){};

Array.prototype.forEach = Array.prototype.forEach || function(fn, bind){
	for (var i = 0; i < this.length; i++) fn.call(bind, this[i], i, this);
};

Array.prototype.filter = Array.prototype.filter || function(fn, bind){
	var results = [];
	for (var i = 0; i < this.length; i++){
		if (fn.call(bind, this[i], i, this)) results.push(this[i]);
	}
	return results;
};

Array.prototype.map = Array.prototype.map || function(fn, bind){
	var results = [];
	for (var i = 0; i < this.length; i++) results[i] = fn.call(bind, this[i], i, this);
	return results;
};

Array.prototype.every = Array.prototype.every || function(fn, bind){
	for (var i = 0; i < this.length; i++){
		if (!fn.call(bind, this[i], i, this)) return false;
	}
	return true;
};

Array.prototype.some = Array.prototype.some || function(fn, bind){
	for (var i = 0; i < this.length; i++){
		if (fn.call(bind, this[i], i, this)) return true;
	}
	return false;
};

Array.prototype.indexOf = Array.prototype.indexOf || function(item, from){
	from = from || 0;
	if (from < 0) from = Math.max(0, this.length + from);
	while (from < this.length){
		if(this[from] === item) return from;
		from++;
	}
	return -1;
};

Array.extend({

	each: Array.prototype.forEach,

	copy: function(start, length){
		start = start || 0;
		if (start < 0) start = this.length + start;
		length = length || (this.length - start);
		var newArray = [];
		for (var i = 0; i < length; i++) newArray[i] = this[start++];
		return newArray;
	},

	remove: function(item){
		var i = 0;
		while (i < this.length){
			if (this[i] === item) this.splice(i, 1);
			else i++;
		}
		return this;
	},

	test: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(newArray){
		for (var i = 0; i < newArray.length; i++) this.push(newArray[i]);
		return this;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	}

});

function $A(array, start, length){
	return Array.prototype.copy.call(array, start, length);
};

function $each(iterable, fn, bind){
	return Array.prototype.forEach.call(iterable, fn, bind);
};

String.extend({

	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	toInt: function(){
		return parseInt(this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/\w[A-Z]/g, function(match){
			return (match.charAt(0)+'-'+match.charAt(1).toLowerCase());
		});
	},

	capitalize: function(){
		return this.toLowerCase().replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s{2,}/g, ' ').trim();
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : false;
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : false;
	}

});

Array.extend({

	rgbToHex: function(array){
		if (this.length < 3) return false;
		if (this[3] && (this[3] == 0) && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i]-0).toString(16);
			hex.push((bit.length == 1) ? '0'+bit : bit);
		}
		return array ? hex : '#'+hex.join('');
	},

	hexToRgb: function(array){
		if (this.length != 3) return false;
		var rgb = [];
		for (var i = 0; i < 3; i++){
			rgb.push(parseInt((this[i].length == 1) ? this[i]+this[i] : this[i], 16));
		}
		return array ? rgb : 'rgb('+rgb.join(',')+')';
	}

});

Number.extend({

	toInt: function(){
		return parseInt(this);
	},

	toFloat: function(){
		return parseFloat(this);
	}

});

Function.extend({

	create: function(options){
		var fn = this;
		options = Object.extend({
			'bind': fn, 
			'event': false, 
			'arguments': null, 
			'delay': false, 
			'periodical': false, 
			'attempt': false
		}, options || {});
		if ($chk(options.arguments) && $type(options.arguments) != 'array') options.arguments = [options.arguments];
		return function(event){
			var args;
			if (options.event){
				event = event || window.event;
				args = [(options.event === true) ? event : new options.event(event)];
				if (options.arguments) args = args.concat(options.arguments);
			}
			else args = options.arguments || arguments;
			var returns = function(){
				return fn.apply(options.bind, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt){
				try {
					return returns();
				} catch(err){
					return err;
				}
			}
			return returns();
		};
	},

	pass: function(args, bind){
		return this.create({'arguments': args, 'bind': bind});
	},

	attempt: function(args, bind){
		return this.create({'arguments': args, 'bind': bind, 'attempt': true})();
	},

	bind: function(bind, args){
		return this.create({'bind': bind, 'arguments': args});
	},

	bindAsEventListener: function(bind, args){
		return this.create({'bind': bind, 'event': true, 'arguments': args});
	},

	delay: function(ms, bind, args){
		return this.create({'delay': ms, 'bind': bind, 'arguments': args})();
	},

	periodical: function(ms, bind, args){
		return this.create({'periodical': ms, 'bind': bind, 'arguments': args})();
	}

});

var Element = new Class({

	initialize: function(el){
		if ($type(el) == 'string') el = document.createElement(el);
		return $(el);
	}

});

function $(el){
	if (!el) return false;
	if (el._element_extended_ || [window, document].test(el)) return el;
	if ($type(el) == 'string') el = document.getElementById(el);
	if ($type(el) != 'element') return false;
	if (['object', 'embed'].test(el.tagName.toLowerCase()) || el.extend) return el;
	el._element_extended_ = true;
	Garbage.collect(el);
	el.extend = Object.extend;
	if (!(el.htmlElement)) el.extend(Element.prototype);
	return el;
};

var Elements = new Class({});

new Object.Native(Elements);

document.getElementsBySelector = document.getElementsByTagName;

function $$(){
	if (!arguments) return false;
	if (arguments.length == 1){
		if (!arguments[0]) return false;
		if (arguments[0]._elements_extended_) return arguments[0];
	}
	var elements = [];
	$each(arguments, function(selector){
		switch ($type(selector)){
			case 'element': elements.push($(selector)); break;
			case 'string': selector = document.getElementsBySelector(selector);
			default:
			if (selector.length){
				$each(selector, function(el){
					if ($(el)) elements.push(el);
				});
			}
		}
	});
	elements._elements_extended_ = true;
	return Object.extend(elements, new Elements);
};

Elements.Multi = function(property){
	return function(){
		var args = arguments;
		var items = [];
		var elements = true;
		$each(this, function(el){
			var returns = el[property].apply(el, args);
			if ($type(returns) != 'element') elements = false;
			items.push(returns);
		});
		if (elements) items = $$(items);
		return items;
	};
};

Element.extend = function(properties){
	for (var property in properties){
		HTMLElement.prototype[property] = properties[property];
		Element.prototype[property] = properties[property];
		Elements.prototype[property] = Elements.Multi(property);
	}
};

Element.extend({

	inject: function(el, where){
		el = $(el) || new Element(el);
		switch (where){
			case "before": $(el.parentNode).insertBefore(this, el); break;
			case "after":
				if (!el.getNext()) $(el.parentNode).appendChild(this);
				else $(el.parentNode).insertBefore(this, el.getNext());
				break;
			case "inside": el.appendChild(this);
		}
		return this;
	},

	injectBefore: function(el){
		return this.inject(el, 'before');
	},

	injectAfter: function(el){
		return this.inject(el, 'after');
	},

	injectInside: function(el){
		return this.inject(el, 'inside');
	},

	adopt: function(el){
		this.appendChild($(el) || new Element(el));
		return this;
	},

	remove: function(){
		this.parentNode.removeChild(this);
		return this;
	},

	clone: function(contents){
		var el = this.cloneNode(contents !== false);
		return $(el);
	},

	replaceWith: function(el){
		el = $(el) || new Element(el);
		this.parentNode.replaceChild(el, this);
		return el;
	},

	appendText: function(text){
		if (window.ie){
			switch(this.getTag()){
				case 'style': this.styleSheet.cssText = text; return this;
				case 'script': this.setProperty('text', text); return this;
			}
		}
		this.appendChild(document.createTextNode(text));
		return this;
	},

	hasClass: function(className){
		return this.className.test('(?:^|\\s)'+className+'(?:\\s|$)');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className+' '+className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)'+className+'(?:\\s|$)'), '$1').clean();
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	setStyle: function(property, value){
		if (property == 'opacity') this.setOpacity(parseFloat(value));
		else this.style[property.camelCase()] = (value.push) ? 'rgb('+value.join(',')+')' : value;
		return this;
	},

	setStyles: function(source){
		switch ($type(source)){
			case 'object':
				for (var property in source) this.setStyle(property, source[property]);
				break;
			case 'string':
				this.style.cssText = source;
		}
		return this;
	},

	setOpacity: function(opacity){
		if (opacity == 0){
			if(this.style.visibility != "hidden") this.style.visibility = "hidden";
		} else {
			if(this.style.visibility != "visible") this.style.visibility = "visible";
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (window.ie) this.style.filter = "alpha(opacity=" + opacity*100 + ")";
		this.style.opacity = this.opacity = opacity;
		return this;
	},

	getStyle: function(property){
		property = property.camelCase();
		var style = this.style[property] || false;
		if (!$chk(style)){
			if (property == 'opacity') return $chk(this.opacity) ? this.opacity : 1;
			if (['margin', 'padding'].test(property)){
				return [this.getStyle(property+'-top') || 0, this.getStyle(property+'-right') || 0,
						this.getStyle(property+'-bottom') || 0, this.getStyle(property+'-left') || 0].join(' ');
			}
			if (document.defaultView) style = document.defaultView.getComputedStyle(this, null).getPropertyValue(property.hyphenate());
			else if (this.currentStyle) style = this.currentStyle[property];
		}
		if (style == 'auto' && ['height', 'width'].test(property)) return this['offset'+property.capitalize()]+'px';
		return (style && property.test(/color/i) && style.test(/rgb/)) ? style.rgbToHex() : style;
	},

	addEvent: function(type, fn){
		this.events = this.events || {};
		this.events[type] = this.events[type] || {'keys': [], 'values': []};
		if (!this.events[type].keys.test(fn)){
			this.events[type].keys.push(fn);
			if (this.addEventListener){
				this.addEventListener((type == 'mousewheel' && window.gecko) ? 'DOMMouseScroll' : type, fn, false);
			} else {
				fn = fn.bind(this);
				this.attachEvent('on'+type, fn);
				this.events[type].values.push(fn);
			}
		}
		return this;
	},

	addEvents: function(source){
		if (source){
			for (var type in source) this.addEvent(type, source[type]);
		}
		return this;
	},

	removeEvent: function(type, fn){
		if (this.events && this.events[type]){
			var pos = this.events[type].keys.indexOf(fn);
			if (pos == -1) return this;
			var key = this.events[type].keys.splice(pos,1)[0];
			if (this.removeEventListener){
				this.removeEventListener((type == 'mousewheel' && window.gecko) ? 'DOMMouseScroll' : type, key, false);
			} else {
				this.detachEvent('on'+type, this.events[type].values.splice(pos,1)[0]);
			}
		}
		return this;
	},

	removeEvents: function(type){
		if (this.events){
			if (type){
				if (this.events[type]){
					this.events[type].keys.each(function(fn){
						this.removeEvent(type, fn);
					}, this);
					this.events[type] = null;
				}
			} else {
				for (var evType in this.events) this.removeEvents(evType);
				this.events = null;
			}
		}
		return this;
	},

	fireEvent: function(type, args){
		if (this.events && this.events[type]){
			this.events[type].keys.each(function(fn){
				fn.bind(this, args)();
			}, this);
		}
	},

	getBrother: function(what){
		var el = this[what+'Sibling'];
		while ($type(el) == 'whitespace') el = el[what+'Sibling'];
		return $(el);
	},

	getPrevious: function(){
		return this.getBrother('previous');
	},

	getNext: function(){
		return this.getBrother('next');
	},

	getFirst: function(){
		var el = this.firstChild;
		while ($type(el) == 'whitespace') el = el.nextSibling;
		return $(el);
	},

	getLast: function(){
		var el = this.lastChild;
		while ($type(el) == 'whitespace') el = el.previousSibling;
		return $(el);
	},

	getParent: function(){
		return $(this.parentNode);
	},

	getChildren: function(){
		return $$(this.childNodes);
	},

	setProperty: function(property, value){
		switch (property){
			case 'class': this.className = value; break;
			case 'style': this.setStyles(value); break;
			case 'name': if (window.ie6){
				var el = $(document.createElement('<'+this.getTag()+' name="'+value+'" />'));
				$each(this.attributes, function(attribute){
					if (attribute.name != 'name') el.setProperty(attribute.name, attribute.value);
				});
				if (this.parentNode) this.replaceWith(el);
				return el;
			}
			default: this.setAttribute(property, value);
		}
		return this;
	},

	setProperties: function(source){
		for (var property in source) this.setProperty(property, source[property]);
		return this;
	},

	setHTML: function(){
		this.innerHTML = $A(arguments).join('');
		return this;
	},

	getProperty: function(property){
		return (property == 'class') ? this.className : this.getAttribute(property);
	},

	getTag: function(){
		return this.tagName.toLowerCase();
	},

	scrollTo: function(x, y){
		this.scrollLeft = x;
		this.scrollTop = y;
	},

	getValue: function(){
		switch (this.getTag()){
			case 'select':
				if (this.selectedIndex != -1){
					var opt = this.options[this.selectedIndex];
					return opt.value || opt.text;
				}
				break;
			case 'input': if (!(this.checked && ['checkbox', 'radio'].test(this.type)) && !['hidden', 'text', 'password'].test(this.type)) break;
			case 'textarea': return this.value;
		}
		return false;
	},

	getSize: function(){
		return {
			'scroll': {'x': this.scrollLeft, 'y': this.scrollTop},
			'size': {'x': this.offsetWidth, 'y': this.offsetHeight},
			'scrollSize': {'x': this.scrollWidth, 'y': this.scrollHeight}
		};
	},

	getPosition: function(overflown){
		overflown = overflown || [];
		var el = this, left = 0, top = 0;
		do {
			left += el.offsetLeft || 0;
			top += el.offsetTop || 0;
			el = el.offsetParent;
		} while (el);
		overflown.each(function(element){
			left -= element.scrollLeft || 0;
			top -= element.scrollTop || 0;
		});
		return {'x': left, 'y': top};
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	},

	getCoordinates: function(overflown){
		var position = this.getPosition(overflown);
		var obj = {
			'width': this.offsetWidth,
			'height': this.offsetHeight,
			'left': position.x,
			'top': position.y
		};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	}

});

window.addEvent = document.addEvent = Element.prototype.addEvent;
window.removeEvent = document.removeEvent = Element.prototype.removeEvent;
window.removeEvents = document.removeEvents = Element.prototype.removeEvents;

var Garbage = {

	elements: [],

	collect: function(element){
		Garbage.elements.push(element);
	},

	trash: function(){
		Garbage.collect(window);
		Garbage.collect(document);
		Garbage.elements.each(function(el){
			el.removeEvents();
			for (var p in Element.prototype) el[p] = null;
			el.extend = null;
		});
	}

};

window.addEvent('unload', Garbage.trash);

var Event = new Class({

	initialize: function(event){
		this.event = event || window.event;
		this.type = this.event.type;
		this.target = this.event.target || this.event.srcElement;
		if (this.target.nodeType == 3) this.target = this.target.parentNode;
		this.shift = this.event.shiftKey;
		this.control = this.event.ctrlKey;
		this.alt = this.event.altKey;
		this.meta = this.event.metaKey;
		if (['DOMMouseScroll', 'mousewheel'].test(this.type)){
			this.wheel = this.event.wheelDelta ? (this.event.wheelDelta / (window.opera ? -120 : 120)) : -(this.event.detail || 0) / 3;
		} else if (this.type.test(/key/)){
			this.code = this.event.which || this.event.keyCode;
			for (var name in Event.keys){
				if (Event.keys[name] == this.code){
					this.key = name;
					break;
				}
			}
			this.key = this.key || String.fromCharCode(this.code).toLowerCase();

		} else if (this.type.test(/mouse/) || (this.type == 'click')){
			this.page = {
				'x': this.event.pageX || this.event.clientX + document.documentElement.scrollLeft,
				'y': this.event.pageY || this.event.clientY + document.documentElement.scrollTop
			};
			this.client = {
				'x': this.event.pageX ? this.event.pageX - window.pageXOffset : this.event.clientX,
				'y': this.event.pageY ? this.event.pageY - window.pageYOffset : this.event.clientY
			};
			this.rightClick = (this.event.which == 3) || (this.event.button == 2);
			switch (this.type){
				case 'mouseover': this.relatedTarget = this.event.relatedTarget || this.event.fromElement; break;
				case 'mouseout': this.relatedTarget = this.event.relatedTarget || this.event.toElement;
			}
		}
	},

	stop: function() {
		this.stopPropagation();
		this.preventDefault();
		return this;
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
    },

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});

Event.keys = {
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'delete': 46
};

Function.extend({

	bindWithEvent: function(bind, args){
		return this.create({'bind': bind, 'arguments': args, 'event': Event});
	}

});

var Chain = new Class({

	chain: function(fn){
		this.chains = this.chains || [];
		this.chains.push(fn);
		return this;
	},

	callChain: function(){
		if (this.chains && this.chains.length) this.chains.shift().delay(10, this);
	},

	clearChain: function(){
		this.chains = [];
	}

});

var Events = new Class({

	addEvent: function(type, fn){
		if (fn != Class.empty){
			this.events = this.events || {};
			this.events[type] = this.events[type] || [];
			if (!this.events[type].test(fn)) this.events[type].push(fn);
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		if (this.events && this.events[type]){
			this.events[type].each(function(fn){
				fn.create({'bind': this, 'delay': delay, 'arguments': args})();
			}, this);
		}
		return this;
	},

	removeEvent: function(type, fn){
		if (this.events && this.events[type]) this.events[type].remove(fn);
		return this;
	}

});

var Options = new Class({

	setOptions: function(defaults, options){
		this.options = Object.extend(defaults, options);
		if (this.addEvent){
			for (var option in this.options){
				if (($type(this.options[option]) == 'function') && option.test(/^on[A-Z]/)) this.addEvent(option, this.options[option]);
			}
		}
		return this;
	}

});

var Group = new Class({

	initialize: function(){
		this.instances = $A(arguments);
		this.events = {};
		this.checker = {};
	},

	addEvent: function(type, fn){
		this.checker[type] = this.checker[type] || {};
		this.events[type] = this.events[type] || [];
		if (this.events[type].test(fn)) return false;
		else this.events[type].push(fn);
		this.instances.each(function(instance, i){
			instance.addEvent(type, this.check.bind(this, [type, instance, i]));
		}, this);
		return this;
	},

	check: function(type, instance, i){
		this.checker[type][i] = true;
		var every = this.instances.every(function(current, j){
			return this.checker[type][j] || false;
		}, this);
		if (!every) return;
		this.instances.each(function(current, j){
			this.checker[type][j] = false;
		}, this);
		this.events[type].each(function(event){
			event.call(this, this.instances, instance);
		}, this);
	}

});

var Fx = {};

Fx.Base = new Class({

	getOptions: function(){
		return {
			onStart: Class.empty,
			onComplete: Class.empty,
			onCancel: Class.empty,
			transition: Fx.Transitions.sineInOut,
			duration: 500,
			unit: 'px',
			wait: true,
			fps: 50
		};
	},

	initialize: function(options){
		this.element = this.element || null;
		this.setOptions(this.getOptions(), options);
		if (this.options.initialize) this.options.initialize.call(this);
	},

	step: function(){
		var time = new Date().getTime();
		if (time < this.time + this.options.duration){
			this.cTime = time - this.time;
			this.setNow();
			this.increase();
		} else {
			this.stop(true);
			this.now = this.to;
			this.increase();
			this.fireEvent('onComplete', this.element, 10);
			this.callChain();
		}
	},

	set: function(to){
		this.now = to;
		this.increase();
		return this;
	},

	setNow: function(){
		this.now = this.compute(this.from, this.to);
	},

	compute: function(from, to){
		return this.options.transition(this.cTime, from, (to - from), this.options.duration);
	},

	start: function(from, to){
		if (!this.options.wait) this.stop();
		else if (this.timer) return this;
		this.from = from;
		this.to = to;
		this.time = new Date().getTime();
		this.timer = this.step.periodical(Math.round(1000/this.options.fps), this);
		this.fireEvent('onStart', this.element);
		return this;
	},

	stop: function(end){
		if (!this.timer) return this;
		this.timer = $clear(this.timer);
		if (!end) this.fireEvent('onCancel', this.element);
		return this;
	},
	custom: function(from, to){return this.start(from, to)},
	clearTimer: function(end){return this.stop(end)}

});

Fx.Base.implement(new Chain);
Fx.Base.implement(new Events);
Fx.Base.implement(new Options);

Fx.Transitions = {
	linear: function(t, b, c, d){
		return c*t/d + b;
	},
	sineInOut: function(t, b, c, d){
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}

};

Fx.CSS = {

	select: function(property, to){
		if (property.test(/color/i)) return this.Color;
		if (to.test && to.test(' ')) return this.Multi;
		return this.Single;
	},

	parse: function(el, property, fromTo){
		if (!fromTo.push) fromTo = [fromTo];
		var from = fromTo[0], to = fromTo[1];
		if (!to && to != 0){
			to = from;
			from = el.getStyle(property);
		}
		var css = this.select(property, to);
		return {from: css.parse(from), to: css.parse(to), css: css};
	}

};

Fx.CSS.Single = {

	parse: function(value){
		return parseFloat(value);
	},

	getNow: function(from, to, fx){
		return fx.compute(from, to);
	},

	getValue: function(value, unit){
		return value+unit;
	}

};

Fx.CSS.Multi = {

	parse: function(value){
		return value.push ? value : value.split(' ').map(function(v){
			return parseFloat(v);
		});
	},

	getNow: function(from, to, fx){
		var now = [];
		for (var i = 0; i < from.length; i++) now[i] = fx.compute(from[i], to[i]);
		return now;
	},

	getValue: function(value, unit){
		return value.join(unit+' ')+unit;
	}

};

Fx.CSS.Color = {

	parse: function(value){
		return value.push ? value : value.hexToRgb(true);
	},

	getNow: function(from, to, fx){
		var now = [];
		for (var i = 0; i < from.length; i++) now[i] = Math.round(fx.compute(from[i], to[i]));
		return now;
	},

	getValue: function(value){
		return 'rgb('+value.join(',')+')';
	}

};

Fx.Style = Fx.Base.extend({

	initialize: function(el, property, options){
		this.element = $(el);
		this.property = property;
		this.parent(options);
	},

	hide: function(){
		return this.set(0);
	},

	setNow: function(){
		this.now = this.css.getNow(this.from, this.to, this);
	},

	set: function(to){
		this.css = Fx.CSS.select(this.property, to);
		return this.parent(this.css.parse(to));
	},

	start: function(from, to){
		if (this.timer && this.options.wait) return this;
		var parsed = Fx.CSS.parse(this.element, this.property, [from, to]);
		this.css = parsed.css;
		return this.parent(parsed.from, parsed.to);
	},

	increase: function(){
		this.element.setStyle(this.property, this.css.getValue(this.now, this.options.unit));
	}

});

Element.extend({

	effect: function(property, options){
		return new Fx.Style(this, property, options);
	}

});

Fx.Styles = Fx.Base.extend({

	initialize: function(el, options){
		this.element = $(el);
		this.parent(options);
	},

	setNow: function(){
		for (var p in this.from) this.now[p] = this.css[p].getNow(this.from[p], this.to[p], this);
	},

	set: function(to){
		var parsed = {};
		this.css = {};
		for (var p in to){
			this.css[p] = Fx.CSS.select(p, to[p]);
			parsed[p] = this.css[p].parse(to[p]);
		}
		return this.parent(parsed);
	},

	start: function(obj){
		if (this.timer && this.options.wait) return this;
		this.now = {};
		this.css = {};
		var from = {}, to = {};
		for (var p in obj){
			var parsed = Fx.CSS.parse(this.element, p, obj[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
			this.css[p] = parsed.css;
		}
		return this.parent(from, to);
	},

	increase: function(){
		for (var p in this.now) this.element.setStyle(p, this.css[p].getValue(this.now[p], this.options.unit));
	}

});

Element.extend({

	effects: function(options){
		return new Fx.Styles(this, options);
	}

});

Fx.Slide = Fx.Base.extend({

	initialize: function(el, options){
		this.element = $(el).setStyle('margin', 0);
		this.wrapper = new Element('div').injectAfter(this.element).setStyle('overflow', 'hidden').adopt(this.element);
		this.setOptions({'mode': 'vertical'}, options);
		this.now = [];
		this.parent(this.options);
	},

	setNow: function(){
		for (var i = 0; i < 2; i++) this.now[i] = this.compute(this.from[i], this.to[i]);
	},

	vertical: function(){
		this.margin = 'top';
		this.layout = 'height';
		this.offset = this.element.offsetHeight;
		return [this.element.getStyle('margin-top').toInt(), this.wrapper.getStyle('height').toInt()];
	},

	horizontal: function(){
		this.margin = 'left';
		this.layout = 'width';
		this.offset = this.element.offsetWidth;
		return [this.element.getStyle('margin-left').toInt(), this.wrapper.getStyle('width').toInt()];
	},

	slideIn: function(mode){
		return this.start(this[mode || this.options.mode](), [0, this.offset]);
	},

	slideOut: function(mode){
		return this.start(this[mode || this.options.mode](), [-this.offset, 0]);
	},

	hide: function(mode){
		this[mode || this.options.mode]();
		return this.set([-this.offset, 0]);
	},

	show: function(mode){
		this[mode || this.options.mode]();
		return this.set([0, this.offset]);
	},

	toggle: function(mode){
		if (this.wrapper.offsetHeight == 0 || this.wrapper.offsetWidth == 0) return this.slideIn(mode);
		else return this.slideOut(mode);
	},

	increase: function(){
		this.element.setStyle('margin-'+this.margin, this.now[0]+this.options.unit);
		this.wrapper.setStyle(this.layout, this.now[1]+this.options.unit);
	}

});

var Drag = {};

Drag.Base = new Class({

	getOptions: function(){
		return {
			handle: false,
			unit: 'px',
			onStart: Class.empty,
			onBeforeStart: Class.empty,
			onComplete: Class.empty,
			onSnap: Class.empty,
			onDrag: Class.empty,
			limit: false,
			modifiers: {x: 'left', y: 'top'},
			snap: 6
		};
	},

	initialize: function(el, options){
		this.setOptions(this.getOptions(), options);
		this.element = $(el);
		this.handle = $(this.options.handle) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};
		this.bound = {'start': this.start.bindWithEvent(this)};
		this.attach();
		if (this.options.initialize) this.options.initialize.call(this);
	},

	attach: function(){
		this.handle.addEvent('mousedown', this.bound.start);
	},

	start: function(event){
		this.fireEvent('onBeforeStart', this.element);
		this.mouse.start = event.page;
		var limit = this.options.limit;
		this.limit = {'x': [], 'y': []};
		for (var z in this.options.modifiers){
			this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
			this.mouse.pos[z] = event.page[z] - this.value.now[z];
			if (limit && limit[z]){
				for (var i = 0; i < 2; i++){
					if ($chk(limit[z][i])) this.limit[z][i] = limit[z][i].apply ? limit[z][i].call(this) : limit[z][i];
				}
			}
		}
		this.bound.drag = this.drag.bindWithEvent(this);
		this.bound.stop = this.stop.bind(this);
		this.bound.move = this.options.snap ? this.checkAndDrag.bindWithEvent(this) : this.bound.drag;
		document.addEvent('mousemove', this.bound.move);
		document.addEvent('mouseup', this.bound.stop);
		this.fireEvent('onStart', this.element);
		event.stop();
	},

	checkAndDrag: function(event){
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			document.removeEvent('mousemove', this.bound.move);
			this.bound.move = this.bound.drag;
			document.addEvent('mousemove', this.bound.move);
			this.drag(event);
			this.fireEvent('onSnap', this.element);
		}
		event.stop();
	},

	drag: function(event){
		this.out = false;
		this.mouse.now = event.page;
		for (var z in this.options.modifiers){
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
			if (this.limit[z]){
				if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
					this.out = true;
				} else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
					this.out = true;
				}
			}
			this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
		}
		this.fireEvent('onDrag', this.element);
		event.stop();
	},

	detach: function(){
		this.handle.removeEvent('mousedown', this.bound.start);
	},

	stop: function(){
		document.removeEvent('mousemove', this.bound.move);
		document.removeEvent('mouseup', this.bound.stop);
		this.fireEvent('onComplete', this.element);
	}

});

Drag.Base.implement(new Events);
Drag.Base.implement(new Options);

Element.extend({

	makeResizable: function(options){
		return new Drag.Base(this, Object.extend(options || {}, {modifiers: {x: 'width', y: 'height'}}));
	}

});

Drag.Move = Drag.Base.extend({

	getExtended: function(){
		return {
			droppables: [],
			container: false,
			overflown: []
		}
	},

	initialize: function(el, options){
		this.setOptions(this.getExtended(), options);
		this.element = $(el);
		this.position = this.element.getStyle('position');
		this.droppables = $$(this.options.droppables);
		if (!['absolute', 'relative'].test(this.position)) this.position = 'absolute';
		var top = this.element.getStyle('top').toInt();
		var left = this.element.getStyle('left').toInt();
		if (this.position == 'absolute'){
			top = $chk(top) ? top : this.element.getTop();
			left = $chk(left) ? left : this.element.getLeft();
		} else {
			top = $chk(top) ? top : 0;
			left = $chk(left) ? left : 0;
		}
		this.element.setStyles({
			'top': top+'px',
			'left': left+'px',
			'position': this.position
		});
		this.parent(this.element, this.options);
	},

	start: function(event){
		this.container = $(this.options.container);
		if (this.container){
			var cont = this.container.getCoordinates();
			var el = this.element.getCoordinates();
			if (this.position == 'absolute'){
				this.options.limit = {
					'x': [cont.left, cont.right - el.width],
					'y': [cont.top, cont.bottom - el.height]
				};
			} else {
				var diffx = el.left - this.element.getStyle('left').toInt();
				var diffy = el.top - this.element.getStyle('top').toInt();
				this.options.limit = {
					'y': [-(diffy) + cont.top, cont.bottom - diffy - el.height],
					'x': [-(diffx) + cont.left, cont.right - diffx - el.width]
				};
			}
		}
		this.parent(event);
	},

	drag: function(event){
		this.parent(event);
		if (this.out) return this;
		this.droppables.each(function(drop){
			if (this.checkAgainst($(drop))){
				if (!drop.overing) drop.fireEvent('over', [this.element, this]);
				drop.overing = true;
			} else {
				if (drop.overing) drop.fireEvent('leave', [this.element, this]);
				drop.overing = false;
			}
		}, this);
		return this;
	},

	checkAgainst: function(el){
		el = el.getCoordinates(this.options.overflown);
		return (this.mouse.now.x > el.left && this.mouse.now.x < el.right && this.mouse.now.y < el.bottom && this.mouse.now.y > el.top);
	},

	stop: function(){
		this.parent();
		this.timer = $clear(this.timer);
		if (this.out) return this;
		var dropped = false;
		this.droppables.each(function(drop){
			if (this.checkAgainst(drop)){
				drop.fireEvent('drop', [this.element, this]);
				dropped = true;
			}
		}, this);
		if (!dropped) this.element.fireEvent('drop', this);
		return this;
	}

});

Element.extend({

	makeDraggable: function(options){
		return new Drag.Move(this, options);
	}

});

var XHR = new Class({

	getOptions: function(){
		return {
			method: 'post',
			async: true,
			onRequest: Class.empty,
			onStateChange: Class.empty,
			onSuccess: Class.empty,
			onFailure: Class.empty,
			headers: {},
			isSuccess: this.isSuccess
		}
	},

	initialize: function(options){
		this.transport = window.XMLHttpRequest ? new XMLHttpRequest() : (window.ie ? new ActiveXObject('Microsoft.XMLHTTP') : false);
		this.setOptions(this.getOptions(), options);
		if (!this.transport) return;
		this.headers = {};
		if (this.options.initialize) this.options.initialize.call(this);
	},

	onStateChange: function(){
		this.fireEvent('onStateChange', this.transport);
		if (this.transport.readyState != 4) return;
		var status = 0;
		try {status = this.transport.status} catch (e){}
		if (this.options.isSuccess(status)) this.onSuccess();
		else this.onFailure();
		this.transport.onreadystatechange = Class.empty;
	},

	isSuccess: function(status){
		return ((status >= 200) && (status < 300));
	},

	onSuccess: function(){
		this.response = {
			'text': this.transport.responseText,
			'xml': this.transport.responseXML
		};
		this.fireEvent('onSuccess', [this.response.text, this.response.xml]);
		this.callChain();
	},

	onFailure: function(){
		this.fireEvent('onFailure', this.transport);
	},

	setHeader: function(name, value){
		this.headers[name] = value;
		return this;
	},

	send: function(url, data){
		this.fireEvent('onRequest');
		this.transport.open(this.options.method, url, this.options.async);
		this.transport.onreadystatechange = this.onStateChange.bind(this);
		if ((this.options.method == 'post') && this.transport.overrideMimeType) this.setHeader('Connection', 'close');
		Object.extend(this.headers, this.options.headers);
		for (var type in this.headers) this.transport.setRequestHeader(type, this.headers[type]);
		this.transport.send(data);
		return this;
	}

});

XHR.implement(new Chain);
XHR.implement(new Events);
XHR.implement(new Options);

var Ajax = XHR.extend({

	moreOptions: function(){
		return {
			postBody: null,
			update: null,
			onComplete: Class.empty,
			evalScripts: false,
			evalResponse: false,
			encoding: 'utf-8'
		};
	},

	initialize: function(url, options){
		this.addEvent('onSuccess', this.onComplete);
		this.setOptions(this.moreOptions(), options);
		this.parent(this.options);
		if (!['post', 'get'].test(this.options.method)){
			this._method = '_method='+this.options.method;
			this.options.method = 'post';
		}
		if (this.options.method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.setHeader('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}
		this.setHeader('X-Requested-With', 'XMLHttpRequest');
		this.setHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
		this.url = url;
	},

	onComplete: function(){
		if (this.options.update) $(this.options.update).setHTML(this.response.text);
		if (this.options.evalResponse) eval(this.response.text);
		if (this.options.evalScripts) this.evalScripts.delay(30, this);
		this.fireEvent('onComplete', [this.response.text, this.response.xml], 20);
	},

	request: function(){
		var data = null;
		switch ($type(this.options.postBody)){
			case 'element': data = $(this.options.postBody).toQueryString(); break;
			case 'object': data = Object.toQueryString(this.options.postBody); break;
			case 'string': data = this.options.postBody;
		}
		if (this._method) data = (data) ? [this._method, data].join('&') : this._method;
		return this.send(this.url, data);
	},

	evalScripts: function(){
		var script, regexp = /<script[^>]*>([\s\S]*?)<\/script>/gi;
		while ((script = regexp.exec(this.response.text))) eval(script[1]);
	}

});

Object.toQueryString = function(source){
	var queryString = [];
	for (var property in source) queryString.push(encodeURIComponent(property)+'='+encodeURIComponent(source[property]));
	return queryString.join('&');
};

Element.extend({

	send: function(options){
		options = Object.extend(options || {}, {postBody: this.toQueryString(), method: 'post'});
		return new Ajax(this.getProperty('action'), options).request();
	},

	toObject: function(){
		var obj = {};
		$$(this.getElementsByTagName('input'), this.getElementsByTagName('select'), this.getElementsByTagName('textarea')).each(function(el){
			var name = $(el).name;
			var value = el.getValue();
			if ((value !== false) && name) obj[name] = value;
		});
		return obj;
	},

	toQueryString: function(){
		return Object.toQueryString(this.toObject());
	}

});