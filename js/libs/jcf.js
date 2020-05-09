/*!
 * JavaScript Custom Forms
 *
 * Copyright 2014-2016 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.2.3
 */
;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jcf = factory(jQuery);
  }
}(this, function($) {
  'use strict';

  // define version
  var version = '1.2.3';

  // private variables
  var customInstances = [];

  // default global options
  var commonOptions = {
    optionsKey: 'jcf',
    dataKey: 'jcf-instance',
    rtlClass: 'jcf-rtl',
    focusClass: 'jcf-focus',
    pressedClass: 'jcf-pressed',
    disabledClass: 'jcf-disabled',
    hiddenClass: 'jcf-hidden',
    resetAppearanceClass: 'jcf-reset-appearance',
    unselectableClass: 'jcf-unselectable'
  };

  // detect device type
  var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
    isWinPhoneDevice = /Windows Phone/.test(navigator.userAgent);
  commonOptions.isMobileDevice = !!(isTouchDevice || isWinPhoneDevice);

  // create global stylesheet if custom forms are used
  var createStyleSheet = function() {
    var styleTag = $('<style>').appendTo('head'),
      styleSheet = styleTag.prop('sheet') || styleTag.prop('styleSheet');

    // crossbrowser style handling
    var addCSSRule = function(selector, rules, index) {
      index = index || 0;
      if (styleSheet.insertRule) {
        styleSheet.insertRule(selector + '{' + rules + '}', index);
      } else {
        styleSheet.addRule(selector, rules, index);
      }
    };

    // add special rules
    addCSSRule('.' + commonOptions.hiddenClass, 'position:absolute !important;left:-9999px !important;height:1px !important;width:1px !important;margin:0 !important;border-width:0 !important;-webkit-appearance:none;-moz-appearance:none;appearance:none');
    addCSSRule('.' + commonOptions.rtlClass + ' .' + commonOptions.hiddenClass, 'right:-9999px !important; left: auto !important');
    addCSSRule('.' + commonOptions.unselectableClass, '-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0);');
    addCSSRule('.' + commonOptions.resetAppearanceClass, 'background: none; border: none; -webkit-appearance: none; appearance: none; opacity: 0; filter: alpha(opacity=0);');

    // detect rtl pages
    var html = $('html'), body = $('body');
    if (html.css('direction') === 'rtl' || body.css('direction') === 'rtl') {
      html.addClass(commonOptions.rtlClass);
    }

    // handle form reset event
    html.on('reset', function() {
      setTimeout(function() {
        api.refreshAll();
      }, 0);
    });

    // mark stylesheet as created
    commonOptions.styleSheetCreated = true;
  };

  // simplified pointer events handler
  (function() {
    var pointerEventsSupported = navigator.pointerEnabled || navigator.msPointerEnabled,
      touchEventsSupported = ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
      eventList, eventMap = {}, eventPrefix = 'jcf-';

    // detect events to attach
    if (pointerEventsSupported) {
      eventList = {
        pointerover: navigator.pointerEnabled ? 'pointerover' : 'MSPointerOver',
        pointerdown: navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown',
        pointermove: navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove',
        pointerup: navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp'
      };
    } else {
      eventList = {
        pointerover: 'mouseover',
        pointerdown: 'mousedown' + (touchEventsSupported ? ' touchstart' : ''),
        pointermove: 'mousemove' + (touchEventsSupported ? ' touchmove' : ''),
        pointerup: 'mouseup' + (touchEventsSupported ? ' touchend' : '')
      };
    }

    // create event map
    $.each(eventList, function(targetEventName, fakeEventList) {
      $.each(fakeEventList.split(' '), function(index, fakeEventName) {
        eventMap[fakeEventName] = targetEventName;
      });
    });

    // jQuery event hooks
    $.each(eventList, function(eventName, eventHandlers) {
      eventHandlers = eventHandlers.split(' ');
      $.event.special[eventPrefix + eventName] = {
        setup: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
            else self['on' + fallbackEvent] = fixEvent;
          });
        },
        teardown: function() {
          var self = this;
          $.each(eventHandlers, function(index, fallbackEvent) {
            if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
            else self['on' + fallbackEvent] = null;
          });
        }
      };
    });

    // check that mouse event are not simulated by mobile browsers
    var lastTouch = null;
    var mouseEventSimulated = function(e) {
      var dx = Math.abs(e.pageX - lastTouch.x),
        dy = Math.abs(e.pageY - lastTouch.y),
        rangeDistance = 25;

      if (dx <= rangeDistance && dy <= rangeDistance) {
        return true;
      }
    };

    // normalize event
    var fixEvent = function(e) {
      var origEvent = e || window.event,
        touchEventData = null,
        targetEventName = eventMap[origEvent.type];

      e = $.event.fix(origEvent);
      e.type = eventPrefix + targetEventName;

      if (origEvent.pointerType) {
        switch (origEvent.pointerType) {
          case 2: e.pointerType = 'touch'; break;
          case 3: e.pointerType = 'pen'; break;
          case 4: e.pointerType = 'mouse'; break;
          default: e.pointerType = origEvent.pointerType;
        }
      } else {
        e.pointerType = origEvent.type.substr(0, 5); // "mouse" or "touch" word length
      }

      if (!e.pageX && !e.pageY) {
        touchEventData = origEvent.changedTouches ? origEvent.changedTouches[0] : origEvent;
        e.pageX = touchEventData.pageX;
        e.pageY = touchEventData.pageY;
      }

      if (origEvent.type === 'touchend') {
        lastTouch = { x: e.pageX, y: e.pageY };
      }
      if (e.pointerType === 'mouse' && lastTouch && mouseEventSimulated(e)) {
        return;
      } else {
        return ($.event.dispatch || $.event.handle).call(this, e);
      }
    };
  }());

  // custom mousewheel/trackpad handler
  (function() {
    var wheelEvents = ('onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel DOMMouseScroll').split(' '),
      shimEventName = 'jcf-mousewheel';

    $.event.special[shimEventName] = {
      setup: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.addEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = fixEvent;
        });
      },
      teardown: function() {
        var self = this;
        $.each(wheelEvents, function(index, fallbackEvent) {
          if (self.addEventListener) self.removeEventListener(fallbackEvent, fixEvent, false);
          else self['on' + fallbackEvent] = null;
        });
      }
    };

    var fixEvent = function(e) {
      var origEvent = e || window.event;
      e = $.event.fix(origEvent);
      e.type = shimEventName;

      // old wheel events handler
      if ('detail'      in origEvent) { e.deltaY = -origEvent.detail;      }
      if ('wheelDelta'  in origEvent) { e.deltaY = -origEvent.wheelDelta;  }
      if ('wheelDeltaY' in origEvent) { e.deltaY = -origEvent.wheelDeltaY; }
      if ('wheelDeltaX' in origEvent) { e.deltaX = -origEvent.wheelDeltaX; }

      // modern wheel event handler
      if ('deltaY' in origEvent) {
        e.deltaY = origEvent.deltaY;
      }
      if ('deltaX' in origEvent) {
        e.deltaX = origEvent.deltaX;
      }

      // handle deltaMode for mouse wheel
      e.delta = e.deltaY || e.deltaX;
      if (origEvent.deltaMode === 1) {
        var lineHeight = 16;
        e.delta *= lineHeight;
        e.deltaY *= lineHeight;
        e.deltaX *= lineHeight;
      }

      return ($.event.dispatch || $.event.handle).call(this, e);
    };
  }());

  // extra module methods
  var moduleMixin = {
    // provide function for firing native events
    fireNativeEvent: function(elements, eventName) {
      $(elements).each(function() {
        var element = this, eventObject;
        if (element.dispatchEvent) {
          eventObject = document.createEvent('HTMLEvents');
          eventObject.initEvent(eventName, true, true);
          element.dispatchEvent(eventObject);
        } else if (document.createEventObject) {
          eventObject = document.createEventObject();
          eventObject.target = element;
          element.fireEvent('on' + eventName, eventObject);
        }
      });
    },
    // bind event handlers for module instance (functions beggining with "on")
    bindHandlers: function() {
      var self = this;
      $.each(self, function(propName, propValue) {
        if (propName.indexOf('on') === 0 && $.isFunction(propValue)) {
          // dont use $.proxy here because it doesn't create unique handler
          self[propName] = function() {
            return propValue.apply(self, arguments);
          };
        }
      });
    }
  };

  // public API
  var api = {
    version: version,
    modules: {},
    getOptions: function() {
      return $.extend({}, commonOptions);
    },
    setOptions: function(moduleName, moduleOptions) {
      if (arguments.length > 1) {
        // set module options
        if (this.modules[moduleName]) {
          $.extend(this.modules[moduleName].prototype.options, moduleOptions);
        }
      } else {
        // set common options
        $.extend(commonOptions, moduleName);
      }
    },
    addModule: function(proto) {
      // proto is factory function
      if ($.isFunction(proto)) {
        proto = proto($, window);
      }

      // add module to list
      var Module = function(options) {
        // save instance to collection
        if (!options.element.data(commonOptions.dataKey)) {
          options.element.data(commonOptions.dataKey, this);
        }
        customInstances.push(this);

        // save options
        this.options = $.extend({}, commonOptions, this.options, getInlineOptions(options.element), options);

        // bind event handlers to instance
        this.bindHandlers();

        // call constructor
        this.init.apply(this, arguments);
      };

      // parse options from HTML attribute
      var getInlineOptions = function(element) {
        var dataOptions = element.data(commonOptions.optionsKey),
          attrOptions = element.attr(commonOptions.optionsKey);

        if (dataOptions) {
          return dataOptions;
        } else if (attrOptions) {
          try {
            return $.parseJSON(attrOptions);
          } catch (e) {
            // ignore invalid attributes
          }
        }
      };

      // set proto as prototype for new module
      Module.prototype = proto;

      // add mixin methods to module proto
      $.extend(proto, moduleMixin);
      if (proto.plugins) {
        $.each(proto.plugins, function(pluginName, plugin) {
          $.extend(plugin.prototype, moduleMixin);
        });
      }

      // override destroy method
      var originalDestroy = Module.prototype.destroy;
      Module.prototype.destroy = function() {
        this.options.element.removeData(this.options.dataKey);

        for (var i = customInstances.length - 1; i >= 0; i--) {
          if (customInstances[i] === this) {
            customInstances.splice(i, 1);
            break;
          }
        }

        if (originalDestroy) {
          originalDestroy.apply(this, arguments);
        }
      };

      // save module to list
      this.modules[proto.name] = Module;
    },
    getInstance: function(element) {
      return $(element).data(commonOptions.dataKey);
    },
    replace: function(elements, moduleName, customOptions) {
      var self = this,
        instance;

      if (!commonOptions.styleSheetCreated) {
        createStyleSheet();
      }

      $(elements).each(function() {
        var moduleOptions,
          element = $(this);

        instance = element.data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        } else {
          if (!moduleName) {
            $.each(self.modules, function(currentModuleName, module) {
              if (module.prototype.matchElement.call(module.prototype, element)) {
                moduleName = currentModuleName;
                return false;
              }
            });
          }
          if (moduleName) {
            moduleOptions = $.extend({ element: element }, customOptions);
            instance = new self.modules[moduleName](moduleOptions);
          }
        }
      });
      return instance;
    },
    refresh: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.refresh();
        }
      });
    },
    destroy: function(elements) {
      $(elements).each(function() {
        var instance = $(this).data(commonOptions.dataKey);
        if (instance) {
          instance.destroy();
        }
      });
    },
    replaceAll: function(context) {
      var self = this;
      $.each(this.modules, function(moduleName, module) {
        $(module.prototype.selector, context).each(function() {
          if (this.className.indexOf('jcf-ignore') < 0) {
            self.replace(this, moduleName);
          }
        });
      });
    },
    refreshAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function() {
            var instance = $(this).data(commonOptions.dataKey);
            if (instance) {
              instance.refresh();
            }
          });
        });
      } else {
        for (var i = customInstances.length - 1; i >= 0; i--) {
          customInstances[i].refresh();
        }
      }
    },
    destroyAll: function(context) {
      if (context) {
        $.each(this.modules, function(moduleName, module) {
          $(module.prototype.selector, context).each(function(index, element) {
            var instance = $(element).data(commonOptions.dataKey);
            if (instance) {
              instance.destroy();
            }
          });
        });
      } else {
        while (customInstances.length) {
          customInstances[0].destroy();
        }
      }
    }
  };

  // we need to make JCF available globally if we're in AMD environment
  if (typeof define === 'function' && define.amd) {
    window.jcf = api;
  }

  return api;
}));


/*!
 * JavaScript Custom Forms : Scrollbar Module
 *
 * Copyright 2014-2015 PSD2HTML - http://psd2html.com/jcf
 * Released under the MIT license (LICENSE.txt)
 *
 * Version: 1.2.3
 */
!function(t){t.addModule(function(t,e){"use strict";function i(e){this.options=t.extend({holder:null,vertical:!0,inactiveClass:"jcf-inactive",verticalClass:"jcf-scrollbar-vertical",horizontalClass:"jcf-scrollbar-horizontal",scrollbarStructure:'<div class="jcf-scrollbar"><div class="jcf-scrollbar-dec"></div><div class="jcf-scrollbar-slider"><div class="jcf-scrollbar-handle"></div></div><div class="jcf-scrollbar-inc"></div></div>',btnDecSelector:".jcf-scrollbar-dec",btnIncSelector:".jcf-scrollbar-inc",sliderSelector:".jcf-scrollbar-slider",handleSelector:".jcf-scrollbar-handle",scrollInterval:300,scrollStep:400},e),this.init()}var s={name:"Scrollable",selector:".jcf-scrollable",plugins:{ScrollBar:i},options:{mouseWheelStep:150,handleResize:!0,alwaysShowScrollbars:!1,alwaysPreventMouseWheel:!1,scrollAreaStructure:'<div class="jcf-scrollable-wrapper"></div>'},matchElement:function(t){return t.is(".jcf-scrollable")},init:function(){this.initStructure(),this.attachEvents(),this.rebuildScrollbars()},initStructure:function(){this.doc=t(document),this.win=t(e),this.realElement=t(this.options.element),this.scrollWrapper=t(this.options.scrollAreaStructure).insertAfter(this.realElement),this.scrollWrapper.css("position","relative"),this.realElement.css("overflow","hidden"),this.vBarEdge=0},attachEvents:function(){var t=this;this.vBar=new i({holder:this.scrollWrapper,vertical:!0,onScroll:function(e){t.realElement.scrollTop(e)}}),this.hBar=new i({holder:this.scrollWrapper,vertical:!1,onScroll:function(e){t.realElement.scrollLeft(e)}}),this.realElement.on("scroll",this.onScroll),this.options.handleResize&&this.win.on("resize orientationchange load",this.onResize),this.realElement.on("jcf-mousewheel",this.onMouseWheel),this.realElement.on("jcf-pointerdown",this.onTouchBody)},onScroll:function(){this.redrawScrollbars()},onResize:function(){t(document.activeElement).is(":input")||this.rebuildScrollbars()},onTouchBody:function(t){"touch"===t.pointerType&&(this.touchData={scrollTop:this.realElement.scrollTop(),scrollLeft:this.realElement.scrollLeft(),left:t.pageX,top:t.pageY},this.doc.on({"jcf-pointermove":this.onMoveBody,"jcf-pointerup":this.onReleaseBody}))},onMoveBody:function(t){var e,i,s=this.verticalScrollActive,o=this.horizontalScrollActive;"touch"===t.pointerType&&(e=this.touchData.scrollTop-t.pageY+this.touchData.top,i=this.touchData.scrollLeft-t.pageX+this.touchData.left,this.verticalScrollActive&&(0>e||e>this.vBar.maxValue)&&(s=!1),this.horizontalScrollActive&&(0>i||i>this.hBar.maxValue)&&(o=!1),this.realElement.scrollTop(e),this.realElement.scrollLeft(i),s||o?t.preventDefault():this.onReleaseBody(t))},onReleaseBody:function(t){"touch"===t.pointerType&&(delete this.touchData,this.doc.off({"jcf-pointermove":this.onMoveBody,"jcf-pointerup":this.onReleaseBody}))},onMouseWheel:function(t){var e,i,s,o=this.realElement.scrollTop(),l=this.realElement.scrollLeft(),r=this.realElement.prop("scrollHeight")-this.embeddedDimensions.innerHeight,n=this.realElement.prop("scrollWidth")-this.embeddedDimensions.innerWidth;(this.options.alwaysPreventMouseWheel||(this.verticalScrollActive&&t.deltaY&&(0>=o&&t.deltaY<0||o>=r&&t.deltaY>0||(s=!0)),this.horizontalScrollActive&&t.deltaX&&(0>=l&&t.deltaX<0||l>=n&&t.deltaX>0||(s=!0)),this.verticalScrollActive||this.horizontalScrollActive))&&(s||this.options.alwaysPreventMouseWheel)&&(t.preventDefault(),e=t.deltaX/100*this.options.mouseWheelStep,i=t.deltaY/100*this.options.mouseWheelStep,this.realElement.scrollTop(o+i),this.realElement.scrollLeft(l+e))},setScrollBarEdge:function(t){this.vBarEdge=t||0,this.redrawScrollbars()},saveElementDimensions:function(){return this.savedDimensions={top:this.realElement.width(),left:this.realElement.height()},this},restoreElementDimensions:function(){return this.savedDimensions&&this.realElement.css({width:this.savedDimensions.width,height:this.savedDimensions.height}),this},saveScrollOffsets:function(){return this.savedOffsets={top:this.realElement.scrollTop(),left:this.realElement.scrollLeft()},this},restoreScrollOffsets:function(){return this.savedOffsets&&(this.realElement.scrollTop(this.savedOffsets.top),this.realElement.scrollLeft(this.savedOffsets.left)),this},getContainerDimensions:function(){var t,e,i,s;return this.isModifiedStyles?t={width:this.realElement.innerWidth()+this.vBar.getThickness(),height:this.realElement.innerHeight()+this.hBar.getThickness()}:(this.saveElementDimensions().saveScrollOffsets(),this.realElement.insertAfter(this.scrollWrapper),this.scrollWrapper.detach(),e=this.realElement.prop("style"),s=parseFloat(e.width),i=parseFloat(e.height),this.embeddedDimensions&&s&&i&&(this.isModifiedStyles|=s!==this.embeddedDimensions.width||i!==this.embeddedDimensions.height,this.realElement.css({overflow:"",width:"",height:""})),t={width:this.realElement.outerWidth(),height:this.realElement.outerHeight()},this.scrollWrapper.insertAfter(this.realElement),this.realElement.css("overflow","hidden").prependTo(this.scrollWrapper),this.restoreElementDimensions().restoreScrollOffsets()),t},getEmbeddedDimensions:function(e){var i,s=this.vBar.getThickness(),o=this.hBar.getThickness(),l=this.realElement.outerWidth()-this.realElement.width(),r=this.realElement.outerHeight()-this.realElement.height();return this.options.alwaysShowScrollbars?(this.verticalScrollActive=!0,this.horizontalScrollActive=!0,i={innerWidth:e.width-s,innerHeight:e.height-o}):(this.saveElementDimensions(),this.verticalScrollActive=!1,this.horizontalScrollActive=!1,this.realElement.css({width:e.width-l,height:e.height-r}),this.horizontalScrollActive=this.realElement.prop("scrollWidth")>this.containerDimensions.width,this.verticalScrollActive=this.realElement.prop("scrollHeight")>this.containerDimensions.height,this.restoreElementDimensions(),i={innerWidth:e.width-(this.verticalScrollActive?s:0),innerHeight:e.height-(this.horizontalScrollActive?o:0)}),t.extend(i,{width:i.innerWidth-l,height:i.innerHeight-r}),i},rebuildScrollbars:function(){this.containerDimensions=this.getContainerDimensions(),this.embeddedDimensions=this.getEmbeddedDimensions(this.containerDimensions),this.scrollWrapper.css({width:this.containerDimensions.width,height:this.containerDimensions.height}),this.realElement.css({overflow:"hidden",width:this.embeddedDimensions.width,height:this.embeddedDimensions.height}),this.redrawScrollbars()},redrawScrollbars:function(){var t,e;this.verticalScrollActive?(t=this.vBarEdge?this.containerDimensions.height-this.vBarEdge:this.embeddedDimensions.innerHeight,e=Math.max(this.realElement.prop("offsetHeight"),this.realElement.prop("scrollHeight"))-this.vBarEdge,this.vBar.show().setMaxValue(e-t).setRatio(t/e).setSize(t),this.vBar.setValue(this.realElement.scrollTop())):this.vBar.hide(),this.horizontalScrollActive?(t=this.embeddedDimensions.innerWidth,e=this.realElement.prop("scrollWidth"),e===t&&(this.horizontalScrollActive=!1),this.hBar.show().setMaxValue(e-t).setRatio(t/e).setSize(t),this.hBar.setValue(this.realElement.scrollLeft())):this.hBar.hide();var i="";this.verticalScrollActive&&this.horizontalScrollActive?i="none":this.verticalScrollActive?i="pan-x":this.horizontalScrollActive&&(i="pan-y"),this.realElement.css("touchAction",i)},refresh:function(){this.rebuildScrollbars()},destroy:function(){this.win.off("resize orientationchange load",this.onResize),this.realElement.off({"jcf-mousewheel":this.onMouseWheel,"jcf-pointerdown":this.onTouchBody}),this.doc.off({"jcf-pointermove":this.onMoveBody,"jcf-pointerup":this.onReleaseBody}),this.saveScrollOffsets(),this.vBar.destroy(),this.hBar.destroy(),this.realElement.insertAfter(this.scrollWrapper).css({touchAction:"",overflow:"",width:"",height:""}),this.scrollWrapper.remove(),this.restoreScrollOffsets()}};return t.extend(i.prototype,{init:function(){this.initStructure(),this.attachEvents()},initStructure:function(){this.doc=t(document),this.isVertical=!!this.options.vertical,this.sizeProperty=this.isVertical?"height":"width",this.fullSizeProperty=this.isVertical?"outerHeight":"outerWidth",this.invertedSizeProperty=this.isVertical?"width":"height",this.thicknessMeasureMethod="outer"+this.invertedSizeProperty.charAt(0).toUpperCase()+this.invertedSizeProperty.substr(1),this.offsetProperty=this.isVertical?"top":"left",this.offsetEventProperty=this.isVertical?"pageY":"pageX",this.value=this.options.value||0,this.maxValue=this.options.maxValue||0,this.currentSliderSize=0,this.handleSize=0,this.holder=t(this.options.holder),this.scrollbar=t(this.options.scrollbarStructure).appendTo(this.holder),this.btnDec=this.scrollbar.find(this.options.btnDecSelector),this.btnInc=this.scrollbar.find(this.options.btnIncSelector),this.slider=this.scrollbar.find(this.options.sliderSelector),this.handle=this.slider.find(this.options.handleSelector),this.scrollbar.addClass(this.isVertical?this.options.verticalClass:this.options.horizontalClass).css({touchAction:this.isVertical?"pan-x":"pan-y",position:"absolute"}),this.slider.css({position:"relative"}),this.handle.css({touchAction:"none",position:"absolute"})},attachEvents:function(){this.bindHandlers(),this.handle.on("jcf-pointerdown",this.onHandlePress),this.slider.add(this.btnDec).add(this.btnInc).on("jcf-pointerdown",this.onButtonPress)},onHandlePress:function(t){"mouse"===t.pointerType&&t.button>1||(t.preventDefault(),this.handleDragActive=!0,this.sliderOffset=this.slider.offset()[this.offsetProperty],this.innerHandleOffset=t[this.offsetEventProperty]-this.handle.offset()[this.offsetProperty],this.doc.on("jcf-pointermove",this.onHandleDrag),this.doc.on("jcf-pointerup",this.onHandleRelease))},onHandleDrag:function(t){t.preventDefault(),this.calcOffset=t[this.offsetEventProperty]-this.sliderOffset-this.innerHandleOffset,this.setValue(this.calcOffset/(this.currentSliderSize-this.handleSize)*this.maxValue),this.triggerScrollEvent(this.value)},onHandleRelease:function(){this.handleDragActive=!1,this.doc.off("jcf-pointermove",this.onHandleDrag),this.doc.off("jcf-pointerup",this.onHandleRelease)},onButtonPress:function(t){var e,i;"mouse"===t.pointerType&&t.button>1||(t.preventDefault(),this.handleDragActive||(this.slider.is(t.currentTarget)?(e=this.handle.offset()[this.offsetProperty]>t[this.offsetEventProperty]?-1:1,i=t[this.offsetEventProperty]-this.slider.offset()[this.offsetProperty],this.startPageScrolling(e,i)):(e=this.btnDec.is(t.currentTarget)?-1:1,this.startSmoothScrolling(e)),this.doc.on("jcf-pointerup",this.onButtonRelease)))},onButtonRelease:function(){this.stopPageScrolling(),this.stopSmoothScrolling(),this.doc.off("jcf-pointerup",this.onButtonRelease)},startPageScrolling:function(t,e){var i=this,s=t*i.currentSize,o=function(){var s=i.value/i.maxValue*(i.currentSliderSize-i.handleSize);return t>0?s+i.handleSize>=e:e>=s},l=function(){i.value+=s,i.setValue(i.value),i.triggerScrollEvent(i.value),o()&&clearInterval(i.pageScrollTimer)};this.pageScrollTimer=setInterval(l,this.options.scrollInterval),l()},stopPageScrolling:function(){clearInterval(this.pageScrollTimer)},startSmoothScrolling:function(t){var i,s=this;this.stopSmoothScrolling();var o=e.requestAnimationFrame||function(t){setTimeout(t,16)},l=function(){return Date.now?Date.now():(new Date).getTime()},r=function(){return t>0?s.value>=s.maxValue:s.value<=0},n=function(){var e=(l()-i)/1e3*s.options.scrollStep;s.smoothScrollActive&&(s.value+=e*t,s.setValue(s.value),s.triggerScrollEvent(s.value),r()||(i=l(),o(n)))};s.smoothScrollActive=!0,i=l(),o(n)},stopSmoothScrolling:function(){this.smoothScrollActive=!1},triggerScrollEvent:function(t){this.options.onScroll&&this.options.onScroll(t)},getThickness:function(){return this.scrollbar[this.thicknessMeasureMethod]()},setSize:function(t){var e=this.btnDec[this.fullSizeProperty](),i=this.btnInc[this.fullSizeProperty]();return this.currentSize=t,this.currentSliderSize=t-e-i,this.scrollbar.css(this.sizeProperty,t),this.slider.css(this.sizeProperty,this.currentSliderSize),this.currentSliderSize=this.slider[this.sizeProperty](),this.handleSize=Math.round(this.currentSliderSize*this.ratio),this.handle.css(this.sizeProperty,this.handleSize),this.handleSize=this.handle[this.fullSizeProperty](),this},setRatio:function(t){return this.ratio=t,this},setMaxValue:function(t){return this.maxValue=t,this.setValue(Math.min(this.value,this.maxValue)),this},setValue:function(t){this.value=t,this.value<0?this.value=0:this.value>this.maxValue&&(this.value=this.maxValue),this.refresh()},setPosition:function(t){return this.scrollbar.css(t),this},hide:function(){return this.scrollbar.detach(),this},show:function(){return this.scrollbar.appendTo(this.holder),this},refresh:function(){0===this.value||0===this.maxValue?this.calcOffset=0:this.calcOffset=this.value/this.maxValue*(this.currentSliderSize-this.handleSize),this.handle.css(this.offsetProperty,this.calcOffset),this.btnDec.toggleClass(this.options.inactiveClass,0===this.value),this.btnInc.toggleClass(this.options.inactiveClass,this.value===this.maxValue),this.scrollbar.toggleClass(this.options.inactiveClass,0===this.maxValue)},destroy:function(){this.btnDec.add(this.btnInc).off("jcf-pointerdown",this.onButtonPress),this.handle.off("jcf-pointerdown",this.onHandlePress),this.doc.off("jcf-pointermove",this.onHandleDrag),this.doc.off("jcf-pointerup",this.onHandleRelease),this.doc.off("jcf-pointerup",this.onButtonRelease),this.stopSmoothScrolling(),this.stopPageScrolling(),this.scrollbar.remove()}}),s})}(jcf);
