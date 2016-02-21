(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars.runtime.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _import = require('./handlebars/base');

var base = _interopRequireWildcard(_import);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _SafeString = require('./handlebars/safe-string');

var _SafeString2 = _interopRequireWildcard(_SafeString);

var _Exception = require('./handlebars/exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _import2 = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_import2);

var _import3 = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_import3);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _SafeString2['default'];
  hb.Exception = _Exception2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_noConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars/base":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/base.js","./handlebars/exception":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/exception.js","./handlebars/no-conflict":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js","./handlebars/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/runtime.js","./handlebars/safe-string":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/safe-string.js","./handlebars/utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/base.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
exports.createFrame = createFrame;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var VERSION = '3.0.1';
exports.VERSION = VERSION;
var COMPILER_REVISION = 6;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function registerHelper(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) {
        throw new _Exception2['default']('Arg not supported with multiple helpers');
      }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _Exception2['default']('Attempting to register a partial as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function () {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });

  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _Exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function (conditional, options) {
    if (isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });

  instance.registerHelper('with', function (context, options) {
    if (isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = { data: data };
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function (message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 1,

  // Can be overridden in the host environment
  log: function log(level, message) {
    if (typeof console !== 'undefined' && logger.level <= level) {
      var method = logger.methodMap[level];
      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
    }
  }
};

exports.logger = logger;
var log = logger.log;

exports.log = log;

function createFrame(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
}

/* [args, ]options */
},{"./exception":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/exception.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js":[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;
/*global window */

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };
};

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/runtime.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.checkRevision = checkRevision;

// TODO: Remove this line and break up compilePartial

exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _Exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _Exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _Exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
  }
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    partial = options.partials[options.name];
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;

  if (partial === undefined) {
    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/base.js","./exception":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/safe-string.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars/utils.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;

// Older IE versions do not directly support indexOf so we must implement our own, sadly.
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;'
};

var badChars = /[&<>"'`]/g,
    possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/*eslint-disable func-style, no-var */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
/*eslint-enable func-style, no-var */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};exports.isArray = isArray;

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/dist/cjs/handlebars.runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js":[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/handlebars/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js":[function(require,module,exports){
// Avoid console errors for the IE crappy browsers
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./app/stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _Utils = require('./app/utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _App = require('./app/App');

var _App2 = _interopRequireDefault(_App);

var _AppMobile = require('./app/AppMobile');

var _AppMobile2 = _interopRequireDefault(_AppMobile);

var _gsap = require('gsap');

var _gsap2 = _interopRequireDefault(_gsap);

var _raf = require('./app/utils/raf');

var _raf2 = _interopRequireDefault(_raf);

var _mobileDetect = require('mobile-detect');

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

if (!window.console) console = { log: function log() {} };

var md = new _mobileDetect2['default'](window.navigator.userAgent);

_AppStore2['default'].Detector.isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
_AppStore2['default'].Detector.isMobile = md.mobile() || md.tablet() ? true : false;
_AppStore2['default'].Parent = _domHand2['default'].select('#app-container');
_AppStore2['default'].Detector.oldIE = _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie6') || _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie7') || _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie8');
_AppStore2['default'].Detector.isSupportWebGL = _Utils2['default'].SupportWebGL();
if (_AppStore2['default'].Detector.oldIE) _AppStore2['default'].Detector.isMobile = true;

// Debug
_AppStore2['default'].Detector.isMobile = true;

var app;
if (_AppStore2['default'].Detector.isMobile) {
	_domHand2['default'].classes.add(_domHand2['default'].select('html'), 'mobile');
	app = new _AppMobile2['default']();
} else {
	app = new _App2['default']();
}

app.init();

},{"./app/App":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/App.js","./app/AppMobile":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppMobile.js","./app/stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./app/utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./app/utils/raf":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/raf.js","dom-hand":"dom-hand","gsap":"gsap","mobile-detect":"mobile-detect"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/App.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AppStore = require('./stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppActions = require('./actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _AppTemplate = require('./AppTemplate');

var _AppTemplate2 = _interopRequireDefault(_AppTemplate);

var _Router = require('./services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _GlobalEvents = require('./services/GlobalEvents');

var _GlobalEvents2 = _interopRequireDefault(_GlobalEvents);

var _Preloader = require('./services/Preloader');

var _Preloader2 = _interopRequireDefault(_Preloader);

var _AppConstants = require('./constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var App = (function () {
	function App() {
		_classCallCheck(this, App);

		this.onAppReady = this.onAppReady.bind(this);
		this.loadMainAssets = this.loadMainAssets.bind(this);
		this.resize = this.resize.bind(this);
	}

	_createClass(App, [{
		key: 'init',
		value: function init() {
			// Init router
			this.router = new _Router2['default']();
			this.router.init();

			// Init Preloader
			_AppStore2['default'].Preloader = new _Preloader2['default']();

			var p = document.getElementById('preloader');

			var plane = _domHand2['default'].select('#plane', p);
			var path = MorphSVGPlugin.pathDataToBezier("#motionPath");
			var tl = new TimelineMax();
			tl.to(plane, 5, { bezier: { values: path, type: "cubic", autoRotate: true }, ease: Linear.easeOut }, 0);
			tl.pause();
			this.loaderAnim = {
				path: path,
				el: p,
				plane: plane,
				tl: tl
			};
			tl.tweenTo(3.5);

			// Init global events
			window.GlobalEvents = new _GlobalEvents2['default']();
			GlobalEvents.init();

			_AppStore2['default'].on(_AppConstants2['default'].WINDOW_RESIZE, this.resize);

			var appTemplate = new _AppTemplate2['default']();
			appTemplate.isReady = this.loadMainAssets;
			appTemplate.render('#app-container');

			// Start routing
			this.router.beginRouting();
		}
	}, {
		key: 'resize',
		value: function resize() {
			var _this = this;

			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			setTimeout(function () {
				var size = _domHand2['default'].size(_this.loaderAnim.el);
				var el = _this.loaderAnim.el;
				el.style.left = (windowW >> 1) - size[0] + 'px';
				el.style.top = (windowH >> 1) + size[1] * 0 + 'px';
				_this.loaderAnim.el.style.opacity = 1;
			}, 0);
		}
	}, {
		key: 'loadMainAssets',
		value: function loadMainAssets() {
			var hashUrl = location.hash.substring(2);
			var parts = hashUrl.substr(1).split('/');
			var manifest = _AppStore2['default'].pageAssetsToLoad();
			if (manifest.length < 1) this.onAppReady();else _AppStore2['default'].Preloader.load(manifest, this.onAppReady);
		}
	}, {
		key: 'onAppReady',
		value: function onAppReady() {
			var _this2 = this;

			this.loaderAnim.tl.timeScale(2.4).tweenTo(this.loaderAnim.tl.totalDuration() - 0.1);
			setTimeout(function () {
				TweenMax.to(_this2.loaderAnim.el, 0.5, { opacity: 0, force3D: true, ease: Expo.easeOut });
				setTimeout(function () {
					_AppStore2['default'].off(_AppConstants2['default'].WINDOW_RESIZE, _this2.resize);
					_domHand2['default'].tree.remove(_this2.loaderAnim.el);
					_this2.loaderAnim.tl.clear();
					_this2.loaderAnim = null;
					_AppActions2['default'].pageHasherChanged();
				}, 200);
			}, 1500);
		}
	}]);

	return App;
})();

exports['default'] = App;
module.exports = exports['default'];

},{"./AppTemplate":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplate.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./services/GlobalEvents":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/GlobalEvents.js","./services/Preloader":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Preloader.js","./services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppMobile.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AppStore = require('./stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppActions = require('./actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _AppTemplateMobile = require('./AppTemplateMobile');

var _AppTemplateMobile2 = _interopRequireDefault(_AppTemplateMobile);

var _Router = require('./services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _GlobalEvents = require('./services/GlobalEvents');

var _GlobalEvents2 = _interopRequireDefault(_GlobalEvents);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var AppMobile = (function () {
	function AppMobile() {
		_classCallCheck(this, AppMobile);
	}

	_createClass(AppMobile, [{
		key: 'init',
		value: function init() {
			// Init router
			var router = new _Router2['default']();
			router.init();

			// Init global events
			window.GlobalEvents = new _GlobalEvents2['default']();
			GlobalEvents.init();

			var appTemplateMobile = new _AppTemplateMobile2['default']();
			appTemplateMobile.render('#app-container');

			var el = document.getElementById('preloader');
			_domHand2['default'].tree.remove(el);

			// Start routing
			router.beginRouting();
		}
	}]);

	return AppMobile;
})();

exports['default'] = AppMobile;
module.exports = exports['default'];

},{"./AppTemplateMobile":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplateMobile.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./services/GlobalEvents":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/GlobalEvents.js","./services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplate.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./../pager/components/BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _FrontContainer = require('./components/FrontContainer');

var _FrontContainer2 = _interopRequireDefault(_FrontContainer);

var _PagesContainer = require('./components/PagesContainer');

var _PagesContainer2 = _interopRequireDefault(_PagesContainer);

var _AppStore = require('./stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _PXContainer = require('./components/PXContainer');

var _PXContainer2 = _interopRequireDefault(_PXContainer);

var _TransitionMap = require('./components/TransitionMap');

var _TransitionMap2 = _interopRequireDefault(_TransitionMap);

var AppTemplate = (function (_BaseComponent) {
	_inherits(AppTemplate, _BaseComponent);

	function AppTemplate() {
		_classCallCheck(this, AppTemplate);

		_get(Object.getPrototypeOf(AppTemplate.prototype), 'constructor', this).call(this);
		this.resize = this.resize.bind(this);
		this.animate = this.animate.bind(this);
	}

	_createClass(AppTemplate, [{
		key: 'render',
		value: function render(parent) {
			_get(Object.getPrototypeOf(AppTemplate.prototype), 'render', this).call(this, 'AppTemplate', parent, undefined);
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			_get(Object.getPrototypeOf(AppTemplate.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			this.frontContainer = new _FrontContainer2['default']();
			this.frontContainer.render('#app-template');

			this.pagesContainer = new _PagesContainer2['default']();
			this.pagesContainer.render('#app-template');

			this.pxContainer = new _PXContainer2['default']();
			this.pxContainer.init('#pages-container');
			_AppActions2['default'].pxContainerIsReady(this.pxContainer);

			this.transitionMap = new _TransitionMap2['default']();
			this.transitionMap.render('#app-template');

			setTimeout(function () {
				_this.isReady();
				_this.onReady();
			}, 0);

			GlobalEvents.resize();

			_get(Object.getPrototypeOf(AppTemplate.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onReady',
		value: function onReady() {
			_AppStore2['default'].FrontBlock = document.getElementById('front-block');

			_AppStore2['default'].on(_AppConstants2['default'].WINDOW_RESIZE, this.resize);
			this.animate();
		}
	}, {
		key: 'animate',
		value: function animate() {
			requestAnimationFrame(this.animate);
			this.pxContainer.update();
			this.pagesContainer.update();
		}
	}, {
		key: 'resize',
		value: function resize() {
			this.frontContainer.resize();
			this.pxContainer.resize();
			this.pagesContainer.resize();
			this.transitionMap.resize();
			_get(Object.getPrototypeOf(AppTemplate.prototype), 'resize', this).call(this);
		}
	}]);

	return AppTemplate;
})(_BaseComponent3['default']);

exports['default'] = AppTemplate;
module.exports = exports['default'];

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/FrontContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/FrontContainer.js","./components/PXContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PXContainer.js","./components/PagesContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PagesContainer.js","./components/TransitionMap":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/TransitionMap.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplateMobile.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./../pager/components/BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _AppStore = require('./stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _Mobile_hbs = require('./partials/Mobile.hbs');

var _Mobile_hbs2 = _interopRequireDefault(_Mobile_hbs);

var _Feed_hbs = require('./partials/Feed.hbs');

var _Feed_hbs2 = _interopRequireDefault(_Feed_hbs);

var _mobileFooter = require('./components/mobile-footer');

var _mobileFooter2 = _interopRequireDefault(_mobileFooter);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _simpleScrolltop = require('simple-scrolltop');

var _simpleScrolltop2 = _interopRequireDefault(_simpleScrolltop);

var AppTemplateMobile = (function (_BaseComponent) {
	_inherits(AppTemplateMobile, _BaseComponent);

	function AppTemplateMobile() {
		_classCallCheck(this, AppTemplateMobile);

		_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'constructor', this).call(this);

		this.scope = {};
		var generaInfos = _AppStore2['default'].generalInfos();
		this.scope.infos = _AppStore2['default'].globalContent();
		this.scope.labUrl = generaInfos['lab_url'];

		this.resize = this.resize.bind(this);
		this.onOpenFeed = this.onOpenFeed.bind(this);
		this.onOpenGrid = this.onOpenGrid.bind(this);
		this.onScroll = this.onScroll.bind(this);

		// find urls for each feed
		this.feed = _AppStore2['default'].getFeed();
		var baseUrl = _AppStore2['default'].baseMediaPath();
		var i, feed, folder, icon, pageId, scope;
		for (i = 0; i < this.feed.length; i++) {
			feed = this.feed[i];
			folder = baseUrl + 'image/diptyque/' + feed.id + '/' + feed.person + '/';
			icon = folder + 'icon.jpg';
			pageId = feed.id + '/' + feed.person;
			scope = _AppStore2['default'].getRoutePathScopeById(pageId);
			feed.icon = icon;
			if (feed.media.type == 'image' && feed.media.id == 'shoe') {
				feed.media.url = folder + 'mobile/' + 'shoe.jpg';
			}
			if (feed.media.type == 'image' && feed.media.id == 'character') {
				feed.media.url = folder + 'mobile/' + 'character.jpg';
			}
			if (feed.media.type == 'video' && feed.media.id == 'fun-fact') {
				feed.media['is-video'] = true;
				feed.media.url = scope['wistia-fun-id'];
			}
			if (feed.media.type == 'video' && feed.media.id == 'character') {
				feed.media['is-video'] = true;
				feed.media.url = scope['wistia-character-id'];
			}
		}

		_AppStore2['default'].on(_AppConstants2['default'].OPEN_FEED, this.onOpenFeed);
		_AppStore2['default'].on(_AppConstants2['default'].OPEN_GRID, this.onOpenGrid);
	}

	_createClass(AppTemplateMobile, [{
		key: 'render',
		value: function render(parent) {
			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'render', this).call(this, 'AppTemplateMobile', parent, _Mobile_hbs2['default'], this.scope);
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			this.posts = [];
			this.totalPageHeight = 0;
			this.pageEnded = false;
			this.currentFeedIndex = 0;
			this.allFeeds = [];

			this.footer = (0, _mobileFooter2['default'])(this.element, this.scope);
			this.mainContainer = _domHand2['default'].select('.main-container', this.element);
			this.feedEl = _domHand2['default'].select('.feed', this.mainContainer);

			_AppActions2['default'].openFeed();

			setTimeout(function () {
				_this.onReady();
			}, 0);
			GlobalEvents.resize();
			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onReady',
		value: function onReady() {
			_AppStore2['default'].on(_AppConstants2['default'].WINDOW_RESIZE, this.resize);
			_domHand2['default'].event.on(window, 'scroll', this.onScroll);
		}
	}, {
		key: 'onScroll',
		value: function onScroll(e) {
			var _this2 = this;

			e.preventDefault();

			requestAnimationFrame(function () {
				var windowH = _AppStore2['default'].Window.h;
				var currentScroll = (0, _simpleScrolltop2['default'])() + windowH;
				if (currentScroll > _this2.totalPageHeight) {
					_this2.onPageEnd();
				}
			});
		}
	}, {
		key: 'onOpenFeed',
		value: function onOpenFeed() {
			var currentFeed = this.getLastFeeds();
			this.updateFeedToDom(currentFeed);
			this.preparePosts();
		}
	}, {
		key: 'updateFeedToDom',
		value: function updateFeedToDom(feed) {
			var scope = {
				feed: feed
			};
			var h = document.createElement('div');
			var t = (0, _Feed_hbs2['default'])(scope);
			h.innerHTML = t;
			_domHand2['default'].tree.add(this.feedEl, h);
		}
	}, {
		key: 'getLastFeeds',
		value: function getLastFeeds() {
			var counter = 0;
			var feed = [];
			for (var i = this.currentFeedIndex; i < this.currentFeedIndex + 4; i++) {
				var f = this.feed[i];
				counter++;
				feed.push(f);
			}
			this.currentFeedIndex += counter;
			return feed;
		}
	}, {
		key: 'preparePosts',
		value: function preparePosts() {
			this.posts = [];
			var posts = _domHand2['default'].select.all('.post', this.feedEl);
			for (var i = 0; i < posts.length; i++) {
				var el = posts[i];
				this.posts[i] = {
					el: el,
					mediaWrapper: _domHand2['default'].select('.media-wrapper', el),
					iconsWrapper: _domHand2['default'].select('.icons-wrapper', el),
					commentsWrapper: _domHand2['default'].select('.comments-wrapper', el),
					topWrapper: _domHand2['default'].select('.top-wrapper', el)
				};
			}
			this.resize();
		}
	}, {
		key: 'onOpenGrid',
		value: function onOpenGrid() {
			console.log('grid');
		}
	}, {
		key: 'onPageEnd',
		value: function onPageEnd() {
			var _this3 = this;

			if (this.pageEnded) return;
			if (this.currentFeedIndex >= this.feed.length) return;
			var currentFeed = this.getLastFeeds();
			this.updateFeedToDom(currentFeed);
			this.preparePosts();
			setTimeout(function () {
				_this3.pageEnded = false;
			}, 50);
			this.pageEnded = true;
		}
	}, {
		key: 'resize',
		value: function resize() {

			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			this.totalPageHeight = 0;
			for (var i = 0; i < this.posts.length; i++) {
				var post = this.posts[i];
				var topSize = _domHand2['default'].size(post.topWrapper);
				var iconsSize = _domHand2['default'].size(post.iconsWrapper);
				var commentsSize = _domHand2['default'].size(post.commentsWrapper);
				post.mediaWrapper.style.width = windowW + 'px';
				post.mediaWrapper.style.height = windowW + 'px';
				this.totalPageHeight += windowW;
				this.totalPageHeight += iconsSize[1];
				this.totalPageHeight += commentsSize[1];
				this.totalPageHeight += topSize[1];
			}

			this.footer.resize();

			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'resize', this).call(this);
		}
	}]);

	return AppTemplateMobile;
})(_BaseComponent3['default']);

exports['default'] = AppTemplateMobile;
module.exports = exports['default'];

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/mobile-footer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mobile-footer.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./partials/Feed.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Feed.hbs","./partials/Mobile.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand","simple-scrolltop":"simple-scrolltop"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppDispatcher = require('./../dispatchers/AppDispatcher');

var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

function _proceedTransitionInAction(pageId) {
    _AppDispatcher2['default'].handleViewAction({
        actionType: _AppConstants2['default'].PAGE_ASSETS_LOADED,
        item: pageId
    });
}

var AppActions = {
    pageHasherChanged: function pageHasherChanged(pageId) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].PAGE_HASHER_CHANGED,
            item: pageId
        });
    },
    loadPageAssets: function loadPageAssets(pageId) {
        var manifest = _AppStore2['default'].pageAssetsToLoad();
        if (manifest.length < 1) {
            _proceedTransitionInAction(pageId);
        } else {
            _AppStore2['default'].Preloader.load(manifest, function () {
                _proceedTransitionInAction(pageId);
            });
        }
    },
    windowResize: function windowResize(windowW, windowH) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].WINDOW_RESIZE,
            item: { windowW: windowW, windowH: windowH }
        });
    },
    pxContainerIsReady: function pxContainerIsReady(component) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].PX_CONTAINER_IS_READY,
            item: component
        });
    },
    pxAddChild: function pxAddChild(child) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].PX_CONTAINER_ADD_CHILD,
            item: child
        });
    },
    pxRemoveChild: function pxRemoveChild(child) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].PX_CONTAINER_REMOVE_CHILD,
            item: child
        });
    },
    openFunFact: function openFunFact() {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].OPEN_FUN_FACT,
            item: undefined
        });
    },
    closeFunFact: function closeFunFact() {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].CLOSE_FUN_FACT,
            item: undefined
        });
    },
    cellMouseEnter: function cellMouseEnter(id) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].CELL_MOUSE_ENTER,
            item: id
        });
    },
    cellMouseLeave: function cellMouseLeave(id) {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].CELL_MOUSE_LEAVE,
            item: id
        });
    },
    openFeed: function openFeed() {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].OPEN_FEED,
            item: undefined
        });
    },
    openGrid: function openGrid() {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].OPEN_GRID,
            item: undefined
        });
    }
};

exports['default'] = AppActions;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../dispatchers/AppDispatcher":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/dispatchers/AppDispatcher.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/FrontContainer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./../../pager/components/BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _FrontContainer_hbs = require('./../partials/FrontContainer.hbs');

var _FrontContainer_hbs2 = _interopRequireDefault(_FrontContainer_hbs);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _headerLinks = require('./header-links');

var _headerLinks2 = _interopRequireDefault(_headerLinks);

var _socialLinks = require('./social-links');

var _socialLinks2 = _interopRequireDefault(_socialLinks);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var FrontContainer = (function (_BaseComponent) {
	_inherits(FrontContainer, _BaseComponent);

	function FrontContainer() {
		_classCallCheck(this, FrontContainer);

		_get(Object.getPrototypeOf(FrontContainer.prototype), 'constructor', this).call(this);

		// this.onPageChange = this.onPageChange.bind(this)
	}

	_createClass(FrontContainer, [{
		key: 'render',
		value: function render(parent) {
			var scope = {};
			var generaInfos = _AppStore2['default'].generalInfos();
			scope.infos = _AppStore2['default'].globalContent();
			scope.labUrl = generaInfos['lab_url'];
			scope.menShopUrl = 'http://www.camper.com/' + JS_lang + '_' + JS_country + '/men/shoes/new-collection';
			scope.womenShopUrl = 'http://www.camper.com/' + JS_lang + '_' + JS_country + '/women/shoes/new-collection';

			_get(Object.getPrototypeOf(FrontContainer.prototype), 'render', this).call(this, 'FrontContainer', parent, _FrontContainer_hbs2['default'], scope);
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			_get(Object.getPrototypeOf(FrontContainer.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {

			// AppStore.on(AppConstants.PAGE_HASHER_CHANGED, this.onPageChange)

			this.headerLinks = (0, _headerLinks2['default'])(this.element);

			_get(Object.getPrototypeOf(FrontContainer.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onPageChange',
		value: function onPageChange() {}
	}, {
		key: 'resize',
		value: function resize() {

			if (!this.domIsReady) return;
			this.headerLinks.resize();
		}
	}]);

	return FrontContainer;
})(_BaseComponent3['default']);

exports['default'] = FrontContainer;
module.exports = exports['default'];

},{"./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/FrontContainer.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/FrontContainer.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./header-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js","./social-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PXContainer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var PXContainer = (function () {
	function PXContainer() {
		_classCallCheck(this, PXContainer);
	}

	_createClass(PXContainer, [{
		key: 'init',
		value: function init(elementId) {
			this.clearBack = false;

			this.add = this.add.bind(this);
			this.remove = this.remove.bind(this);

			_AppStore2['default'].on(_AppConstants2['default'].PX_CONTAINER_ADD_CHILD, this.add);
			_AppStore2['default'].on(_AppConstants2['default'].PX_CONTAINER_REMOVE_CHILD, this.remove);

			var renderOptions = {
				resolution: 1,
				transparent: true,
				antialias: true
			};
			this.renderer = new PIXI.autoDetectRenderer(1, 1, renderOptions);
			// this.renderer = new PIXI.CanvasRenderer(1, 1, renderOptions)
			this.currentColor = 0xffffff;
			var el = _domHand2['default'].select(elementId);
			this.renderer.view.setAttribute('id', 'px-container');
			_AppStore2['default'].Canvas = this.renderer.view;
			_domHand2['default'].tree.add(el, this.renderer.view);
			this.stage = new PIXI.Container();
			// this.background = new PIXI.Graphics()
			// this.drawBackground(this.currentColor)
			// this.stage.addChild(this.background)

			// this.stats = new Stats();
			// // this.stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

			// // align top-left
			// this.stats.domElement.style.position = 'absolute';
			// this.stats.domElement.style.left = '0px';
			// this.stats.domElement.style.top = '0px';
			// this.stats.domElement.style['z-index'] = 999999

			// document.body.appendChild( this.stats.domElement );
		}
	}, {
		key: 'drawBackground',
		value: function drawBackground(color) {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			this.background.clear();
			this.background.lineStyle(0);
			this.background.beginFill(color, 1);
			this.background.drawRect(0, 0, windowW, windowH);
			this.background.endFill();
		}
	}, {
		key: 'add',
		value: function add(child) {
			this.stage.addChild(child);
		}
	}, {
		key: 'remove',
		value: function remove(child) {
			this.stage.removeChild(child);
		}
	}, {
		key: 'update',
		value: function update() {
			// this.stats.update()
			this.renderer.render(this.stage);
		}
	}, {
		key: 'resize',
		value: function resize() {
			var scale = 1;
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			this.renderer.resize(windowW * scale, windowH * scale);
			// this.drawBackground(this.currentColor)
		}
	}]);

	return PXContainer;
})();

exports['default'] = PXContainer;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BasePage2 = require('./../../pager/components/BasePage');

var _BasePage3 = _interopRequireDefault(_BasePage2);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _PxHelper = require('./../utils/PxHelper');

var _PxHelper2 = _interopRequireDefault(_PxHelper);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var Page = (function (_BasePage) {
	_inherits(Page, _BasePage);

	function Page(props) {
		_classCallCheck(this, Page);

		_get(Object.getPrototypeOf(Page.prototype), 'constructor', this).call(this, props);
		this.transitionInCompleted = false;
	}

	_createClass(Page, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.pxContainer = new PIXI.Container();
			_get(Object.getPrototypeOf(Page.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			setTimeout(function () {
				_AppActions2['default'].pxAddChild(_this.pxContainer);
			}, 0);
			_get(Object.getPrototypeOf(Page.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'willTransitionIn',
		value: function willTransitionIn() {
			_AppStore2['default'].Canvas.style['z-index'] = 4;
			_get(Object.getPrototypeOf(Page.prototype), 'willTransitionIn', this).call(this);
		}
	}, {
		key: 'willTransitionOut',
		value: function willTransitionOut() {
			setTimeout(function () {
				_AppStore2['default'].Canvas.style['z-index'] = 4;
			}, 500);
			_get(Object.getPrototypeOf(Page.prototype), 'willTransitionOut', this).call(this);
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			if (this.props.hash.type == _AppConstants2['default'].HOME) {
				this.transitionInCompleted = true;
				_AppStore2['default'].Canvas.style['z-index'] = 0;
			} else {
				_AppStore2['default'].Canvas.style['z-index'] = 1;
			}
			_get(Object.getPrototypeOf(Page.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'setupAnimations',
		value: function setupAnimations() {
			_get(Object.getPrototypeOf(Page.prototype), 'setupAnimations', this).call(this);
		}
	}, {
		key: 'getImageUrlById',
		value: function getImageUrlById(id) {
			var url = this.props.hash.type == _AppConstants2['default'].HOME ? 'home-' + id : this.props.hash.parent + '-' + this.props.hash.target + '-' + id;
			return _AppStore2['default'].Preloader.getImageURL(url);
		}
	}, {
		key: 'getImageSizeById',
		value: function getImageSizeById(id) {
			var url = this.props.hash.type == _AppConstants2['default'].HOME ? 'home-' + id : this.props.hash.parent + '-' + this.props.hash.target + '-' + id;
			return _AppStore2['default'].Preloader.getImageSize(url);
		}
	}, {
		key: 'resize',
		value: function resize() {
			_get(Object.getPrototypeOf(Page.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'update',
		value: function update() {}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			var _this2 = this;

			_PxHelper2['default'].removeChildrenFromContainer(this.pxContainer);
			setTimeout(function () {
				_AppActions2['default'].pxRemoveChild(_this2.pxContainer);
			}, 0);
			_get(Object.getPrototypeOf(Page.prototype), 'componentWillUnmount', this).call(this);
		}
	}]);

	return Page;
})(_BasePage3['default']);

exports['default'] = Page;
module.exports = exports['default'];

},{"./../../pager/components/BasePage":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePage.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/PxHelper":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/PxHelper.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PagesContainer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent = require('./../../pager/components/BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _Pager = require('./../../pager/Pager');

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _BasePager2 = require('./../../pager/components/BasePager');

var _BasePager3 = _interopRequireDefault(_BasePager2);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _Home = require('./pages/Home');

var _Home2 = _interopRequireDefault(_Home);

var _Home_hbs = require('./../partials/Home.hbs');

var _Home_hbs2 = _interopRequireDefault(_Home_hbs);

var _Diptyque = require('./pages/Diptyque');

var _Diptyque2 = _interopRequireDefault(_Diptyque);

var _Diptyque_hbs = require('./../partials/Diptyque.hbs');

var _Diptyque_hbs2 = _interopRequireDefault(_Diptyque_hbs);

var PagesContainer = (function (_BasePager) {
	_inherits(PagesContainer, _BasePager);

	function PagesContainer() {
		_classCallCheck(this, PagesContainer);

		_get(Object.getPrototypeOf(PagesContainer.prototype), 'constructor', this).call(this);
		this.didHasherChange = this.didHasherChange.bind(this);
		this.pageAssetsLoaded = this.pageAssetsLoaded.bind(this);
		_AppStore2['default'].on(_AppConstants2['default'].PAGE_HASHER_CHANGED, this.didHasherChange);
		_AppStore2['default'].on(_AppConstants2['default'].PAGE_ASSETS_LOADED, this.pageAssetsLoaded);
	}

	_createClass(PagesContainer, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			_get(Object.getPrototypeOf(PagesContainer.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(PagesContainer.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'didHasherChange',
		value: function didHasherChange() {

			_AppStore2['default'].Parent.style.cursor = 'wait';
			_AppStore2['default'].FrontBlock.style.visibility = 'visible';

			var newHash = _Router2['default'].getNewHash();
			var oldHash = _Router2['default'].getOldHash();
			if (oldHash == undefined) {
				this.templateSelection(newHash);
			} else {
				_Pager.PagerActions.onTransitionOut();
				// this.willPageTransitionOut()
			}
		}
	}, {
		key: 'templateSelection',
		value: function templateSelection(newHash) {
			var type = undefined;
			var template = undefined;
			switch (newHash.type) {
				case _AppConstants2['default'].DIPTYQUE:
					type = _Diptyque2['default'];
					template = _Diptyque_hbs2['default'];
					break;
				case _AppConstants2['default'].HOME:
					type = _Home2['default'];
					template = _Home_hbs2['default'];
					break;
				default:
					type = _Home2['default'];
					template = _Home_hbs2['default'];
			}
			this.setupNewComponent(newHash, type, template);
			this.currentComponent = this.components['new-component'];
		}
	}, {
		key: 'pageAssetsLoaded',
		value: function pageAssetsLoaded() {
			var newHash = _Router2['default'].getNewHash();
			this.templateSelection(newHash);
			_get(Object.getPrototypeOf(PagesContainer.prototype), 'pageAssetsLoaded', this).call(this);
		}
	}, {
		key: 'update',
		value: function update() {
			if (this.currentComponent != undefined) this.currentComponent.update();
		}
	}, {
		key: 'resize',
		value: function resize() {
			if (this.currentComponent != undefined) this.currentComponent.resize();
		}
	}]);

	return PagesContainer;
})(_BasePager3['default']);

exports['default'] = PagesContainer;
module.exports = exports['default'];

},{"./../../pager/Pager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/Pager.js","./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../../pager/components/BasePager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePager.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/Diptyque.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Diptyque.hbs","./../partials/Home.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Home.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./pages/Diptyque":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js","./pages/Home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/TransitionMap.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./../../pager/components/BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _TransitionMap_hbs = require('./../partials/TransitionMap.hbs');

var _TransitionMap_hbs2 = _interopRequireDefault(_TransitionMap_hbs);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _mainMap = require('./main-map');

var _mainMap2 = _interopRequireDefault(_mainMap);

var _Pager = require('./../../pager/Pager');

var TransitionMap = (function (_BaseComponent) {
	_inherits(TransitionMap, _BaseComponent);

	function TransitionMap() {
		_classCallCheck(this, TransitionMap);

		_get(Object.getPrototypeOf(TransitionMap.prototype), 'constructor', this).call(this);
		this.onPageTransitionOut = this.onPageTransitionOut.bind(this);
		this.onPageTransitionInComplete = this.onPageTransitionInComplete.bind(this);
		this.preloaderProgress = this.preloaderProgress.bind(this);
	}

	_createClass(TransitionMap, [{
		key: 'render',
		value: function render(parent) {
			var scope = {};
			var generaInfos = _AppStore2['default'].generalInfos();

			_get(Object.getPrototypeOf(TransitionMap.prototype), 'render', this).call(this, 'TransitionMap', parent, _TransitionMap_hbs2['default'], scope);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.currentProgress = 0;

			_Pager.PagerStore.on(_Pager.PagerConstants.PAGE_TRANSITION_OUT, this.onPageTransitionOut);
			_Pager.PagerStore.on(_Pager.PagerConstants.PAGE_TRANSITION_IN_COMPLETE, this.onPageTransitionInComplete);
			_AppStore2['default'].Preloader.queue.on("progress", this.preloaderProgress, this);

			this.map = (0, _mainMap2['default'])(this.element, _AppConstants2['default'].TRANSITION);

			_get(Object.getPrototypeOf(TransitionMap.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onPageTransitionOut',
		value: function onPageTransitionOut() {
			this.currentProgress = 0;
			this.map.highlight(_Router2['default'].getOldHash(), _Router2['default'].getNewHash());
		}
	}, {
		key: 'onPageTransitionInComplete',
		value: function onPageTransitionInComplete() {
			var oldHash = _Router2['default'].getOldHash();
			if (oldHash == undefined) return;
			this.currentProgress = 0;
			this.map.resetHighlight();
		}
	}, {
		key: 'preloaderProgress',
		value: function preloaderProgress(e) {
			this.currentProgress += 0.2;
			if (e.progress > 0.99) this.currentProgress = 1;
			this.currentProgress = this.currentProgress > 1 ? 1 : this.currentProgress;
			this.map.updateProgress(e.progress);
		}
	}, {
		key: 'resize',
		value: function resize() {
			if (!this.domIsReady) return;
			this.map.resize();
		}
	}]);

	return TransitionMap;
})(_BaseComponent3['default']);

exports['default'] = TransitionMap;
module.exports = exports['default'];

},{"./../../pager/Pager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/Pager.js","./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/TransitionMap.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/TransitionMap.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./main-map":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var aroundBorder = function aroundBorder(parent) {

	var scope;

	var $container = _domHand2['default'].select('.around-border-container', parent);
	var top = _domHand2['default'].select('.top', $container);
	var bottom = _domHand2['default'].select('.bottom', $container);
	var left = _domHand2['default'].select('.left', $container);
	var right = _domHand2['default'].select('.right', $container);

	var $lettersContainer = _domHand2['default'].select('.around-border-letters-container', parent);
	var topLetters = _domHand2['default'].select('.top', $lettersContainer).children;
	var bottomLetters = _domHand2['default'].select('.bottom', $lettersContainer).children;
	var leftLetters = _domHand2['default'].select('.left', $lettersContainer).children;
	var rightLetters = _domHand2['default'].select('.right', $lettersContainer).children;

	scope = {
		el: $container,
		letters: $lettersContainer,
		resize: function resize() {
			var borderSize = 10;
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var blockSize = [windowW / _AppConstants2['default'].GRID_COLUMNS, windowH / _AppConstants2['default'].GRID_ROWS];

			top.style.width = windowW + 'px';
			bottom.style.width = windowW + 'px';
			bottom.style.top = windowH - borderSize + 'px';
			left.style.height = right.style.height = windowH + 'px';
			right.style.left = windowW - borderSize + 'px';

			for (var i = 0; i < topLetters.length; i++) {
				var tl = topLetters[i];
				tl.style.left = (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				tl.style.top = -2 + 'px';
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i];
				bl.style.left = (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				bl.style.top = windowH - 12 + 'px';
			};
			for (var i = 0; i < leftLetters.length; i++) {
				var ll = leftLetters[i];
				ll.style.top = (blockSize[1] >> 1) + blockSize[1] * i - 2 + 'px';
				ll.style.left = 2 + 'px';
			};
			for (var i = 0; i < rightLetters.length; i++) {
				var rl = rightLetters[i];
				rl.style.top = (blockSize[1] >> 1) + blockSize[1] * i - 2 + 'px';
				rl.style.left = windowW - 8 + 'px';
			};
		},
		clear: function clear() {
			topLetters = null;
			bottomLetters = null;
			leftLetters = null;
			rightLetters = null;
		}
	};

	return scope;
};

exports['default'] = aroundBorder;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/arrows-wrapper.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

exports['default'] = function (parent, onMouseEnter, onMouseLeave) {
	var scope;
	var arrowsWrapper = _domHand2['default'].select('.arrows-wrapper', parent);
	var leftArrow = _domHand2['default'].select('.arrow.left', arrowsWrapper);
	var rightArrow = _domHand2['default'].select('.arrow.right', arrowsWrapper);
	var arrows = {
		left: {
			el: leftArrow,
			icons: _domHand2['default'].select.all('svg', leftArrow),
			iconsWrapper: _domHand2['default'].select('.icons-wrapper', leftArrow),
			background: _domHand2['default'].select('.background', leftArrow)
		},
		right: {
			el: rightArrow,
			icons: _domHand2['default'].select.all('svg', rightArrow),
			iconsWrapper: _domHand2['default'].select('.icons-wrapper', rightArrow),
			background: _domHand2['default'].select('.background', rightArrow)
		}
	};

	_domHand2['default'].event.on(arrows.left.el, 'mouseenter', onMouseEnter);
	_domHand2['default'].event.on(arrows.left.el, 'mouseleave', onMouseLeave);
	_domHand2['default'].event.on(arrows.right.el, 'mouseenter', onMouseEnter);
	_domHand2['default'].event.on(arrows.right.el, 'mouseleave', onMouseLeave);

	scope = {
		left: arrows.left.el,
		right: arrows.right.el,
		background: function background(dir) {
			return arrows[dir].background;
		},
		resize: function resize() {

			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var arrowSize = _domHand2['default'].size(arrows.left.icons[1]);
			var offsetY = 20;
			var bgWidth = _AppConstants2['default'].SIDE_EVENT_PADDING;

			arrows.right.el.style.left = windowW - bgWidth + 'px';

			arrows.left.background.style.width = bgWidth + 'px';
			arrows.left.background.style.height = windowH + 'px';
			arrows.left.iconsWrapper.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px';
			arrows.left.iconsWrapper.style.left = _AppConstants2['default'].PADDING_AROUND + 'px';

			arrows.right.background.style.width = bgWidth + 'px';
			arrows.right.background.style.height = windowH + 'px';
			arrows.right.iconsWrapper.style.top = (windowH >> 1) - (arrowSize[0] >> 1) - offsetY + 'px';
			arrows.right.iconsWrapper.style.left = bgWidth - arrowSize[0] - _AppConstants2['default'].PADDING_AROUND + 'px';
		},
		over: function over(dir) {
			var arrow = arrows[dir];
			_domHand2['default'].classes.add(arrow.el, 'hovered');
		},
		out: function out(dir) {
			var arrow = arrows[dir];
			_domHand2['default'].classes.remove(arrow.el, 'hovered');
		},
		clear: function clear() {
			_domHand2['default'].event.off(arrows.left.el, 'mouseenter', onMouseEnter);
			_domHand2['default'].event.off(arrows.left.el, 'mouseleave', onMouseLeave);
			_domHand2['default'].event.off(arrows.right.el, 'mouseenter', onMouseEnter);
			_domHand2['default'].event.off(arrows.right.el, 'mouseleave', onMouseLeave);
			arrows = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var bottomTexts = function bottomTexts(parent) {

	var scope;
	var el = _domHand2['default'].select('.bottom-texts-container', parent);
	var socialWrapper = _domHand2['default'].select('#social-wrapper', el);
	var titlesWrapper = _domHand2['default'].select('.titles-wrapper', el);
	var allTitles = _domHand2['default'].select.all('li', titlesWrapper);
	var textsEls = _domHand2['default'].select.all('.texts-wrapper .txt', el);
	var texts = [];
	var ids = ['generic', 'deia', 'arelluf', 'es-trenc'];
	var oldTl;
	var firstTime = true;

	var onTitleClicked = function onTitleClicked(e) {
		e.preventDefault();
		var id = e.currentTarget.id;
		scope.openTxtById(id);
	};

	var i, t;
	for (var i = 0; i < allTitles.length; i++) {
		t = allTitles[i];
		_domHand2['default'].event.on(t, 'click', onTitleClicked);
	}

	var id, e, i, split;
	for (i = 0; i < ids.length; i++) {
		id = ids[i];
		e = textsEls[i];

		texts[i] = {
			id: id,
			el: e
		};
	}

	var resize = function resize() {
		var windowW = _AppStore2['default'].Window.w;
		var windowH = _AppStore2['default'].Window.h;

		var blockSize = [windowW / _AppConstants2['default'].GRID_COLUMNS, windowH / _AppConstants2['default'].GRID_ROWS];

		var padding = 40;
		var borderAround;
		blockSize[0] *= 2;
		blockSize[1] *= 2;
		blockSize[0] -= padding;
		blockSize[1] -= padding;
		var innerBlockSize = [blockSize[0] - 10, blockSize[1] - 10];
		var textW = innerBlockSize[0] * 0.8;

		el.style.width = innerBlockSize[0] + 'px';
		el.style.height = innerBlockSize[1] + 'px';
		el.style.left = windowW - blockSize[0] - (padding >> 1) + 'px';
		el.style.top = windowH - blockSize[1] - (padding >> 1) + 'px';

		setTimeout(function () {
			var socialSize = _domHand2['default'].size(socialWrapper);
			var titlesSize = _domHand2['default'].size(titlesWrapper);

			var i, text, s, split, tl;
			for (i = 0; i < texts.length; i++) {
				text = texts[i];
				s = _domHand2['default'].size(text.el);
				text.el.style.top = (innerBlockSize[1] >> 1) - (s[1] >> 1) + 'px';
				split = new SplitText(text.el, { type: "lines" }).lines;
				if (text.tl != undefined) text.tl.clear();
				tl = new TimelineMax();
				tl.staggerFrom(split, 1, { y: 5, scaleY: 2, opacity: 0, force3D: true, transformOrigin: '50% 0%', ease: Expo.easeOut }, 0.05, 0);
				tl.pause(0);
				text.tl = tl;
			}

			socialWrapper.style.left = (innerBlockSize[0] >> 1) - (socialSize[0] >> 1) + 'px';
			socialWrapper.style.top = innerBlockSize[1] - socialSize[1] - (padding >> 1) + 'px';
		}, 0);
	};

	scope = {
		el: el,
		resize: resize,
		openTxtById: function openTxtById(id) {
			var i, text;
			for (i = 0; i < texts.length; i++) {
				text = texts[i];
				if (id == text.id) {
					if (oldTl != undefined) oldTl.timeScale(2.6).reverse();
					setTimeout(function () {
						return text.tl.timeScale(1.2).play();
					}, 600);
					oldTl = text.tl;
					return;
				}
			}
		},
		clear: function clear() {
			var i, t;
			for (i = 0; i < allTitles.length; i++) {
				t = allTitles[i];
				_domHand2['default'].event.off(t, 'click', onTitleClicked);
			}
			for (i = 0; i < texts.length; i++) {
				t = texts[i];
				t.tl.clear();
			}
			ids = null;
			texts = null;
			allTitles = null;
			textsEls = null;
		}
	};

	return scope;
};

exports['default'] = bottomTexts;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

exports['default'] = function (holder, characterUrl, textureSize) {

	var scope;

	var tex = PIXI.Texture.fromImage(characterUrl);
	var sprite = new PIXI.Sprite(tex);
	sprite.anchor.x = sprite.anchor.y = 0.5;
	holder.addChild(sprite);

	var mask = new PIXI.Graphics();
	holder.addChild(mask);

	sprite.mask = mask;

	scope = {
		update: function update(mouse) {
			var windowW = _AppStore2['default'].Window.w;
			var nX = (mouse.x - (windowW >> 1)) / (windowW >> 1) * 1 - 0.5;
			var nY = mouse.nY - 0.5;
			var newx = sprite.ix + 10 * nX;
			var newy = sprite.iy + 10 * nY;
			sprite.x += (newx - sprite.x) * 0.03;
			sprite.y += (newy - sprite.y) * 0.03;
		},
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var size = [(windowW >> 1) + 1, windowH];

			mask.clear();
			mask.beginFill(0xff0000, 1);
			mask.drawRect(0, 0, size[0], size[1]);
			mask.endFill();

			setTimeout(function () {
				var scale = (windowH - 100) / textureSize.height * 1;
				sprite.scale.x = sprite.scale.y = scale;
				sprite.x = size[0] >> 1;
				sprite.y = size[1] - (textureSize.height * scale >> 1) + 10;
				sprite.ix = sprite.x;
				sprite.iy = sprite.y;
			});
		},
		clear: function clear() {
			holder.removeChild(sprite);
			holder.removeChild(mask);
			mask.clear();
			sprite.destroy();
			sprite = null;
			tex = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/colory-rects.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _colorUtils = require('color-utils');

var _colorUtils2 = _interopRequireDefault(_colorUtils);

exports['default'] = function (pxContainer, colors) {

	var scope;

	var holder = new PIXI.Container();
	pxContainer.addChild(holder);

	var bgColors = [];
	bgColors.length = 5;

	var tl = new TimelineLite();

	for (var i = 0; i < bgColors.length; i++) {
		var bgColor = new PIXI.Graphics();
		bgColors[i] = bgColor;
		holder.addChild(bgColor);
	};

	var open = function open() {
		tl.timeScale(1.5);
		tl.play(0);
		scope.isOpen = true;
	};
	var close = function close() {
		tl.timeScale(2);
		tl.reverse();
		scope.isOpen = false;
	};

	scope = {
		tl: tl,
		isOpen: false,
		holder: holder,
		open: open,
		close: close,
		resize: function resize(width, height, direction) {

			tl.clear();

			var hs = colors.from.h - colors.to.h;
			var ss = colors.from.s - colors.to.s;
			var vs = colors.from.v - colors.to.v;
			var len = bgColors.length;
			var stepH = hs / bgColors.length;
			var stepS = ss / bgColors.length;
			var stepV = vs / bgColors.length;
			var hd = hs < 0 ? -1 : 1;
			var sd = ss < 0 ? -1 : 1;
			var vd = vs < 0 ? -1 : 1;

			var delay = 0.12;
			for (var i = 0; i < len; i++) {
				var bgColor = bgColors[i];
				var h = Math.round(colors.from.h + stepH * i * hd);
				var s = Math.round(colors.from.s + stepS * i * sd);
				var v = Math.round(colors.from.v + stepV * i * vd);
				var c = '0x' + _colorUtils2['default'].hsvToHex(h, s, v);
				bgColor.clear();
				bgColor.beginFill(c, 1);
				bgColor.drawRect(0, 0, width, height);
				bgColor.endFill();

				switch (direction) {
					case _AppConstants2['default'].TOP:
						tl.fromTo(bgColor, 1.4, { y: height }, { y: -height, ease: Expo.easeInOut }, delay * i);
						break;
					case _AppConstants2['default'].BOTTOM:
						tl.fromTo(bgColor, 1.4, { y: -height }, { y: height, ease: Expo.easeInOut }, delay * i);
						break;
					case _AppConstants2['default'].LEFT:
						tl.fromTo(bgColor, 1.4, { x: width }, { x: -width, ease: Expo.easeInOut }, delay * i);
						break;
					case _AppConstants2['default'].RIGHT:
						tl.fromTo(bgColor, 1.4, { x: -width }, { x: width, ease: Expo.easeInOut }, delay * i);
						break;
				}
			};

			tl.pause(0);
		},
		clear: function clear() {
			tl.clear();
			pxContainer.removeChild(holder);
			for (var i = 0; i < bgColors.length; i++) {
				var bgColor = bgColors[i];
				bgColor.clear();
				holder.removeChild(bgColor);
				bgColor = null;
			};
			bgColors = null;
			tl = null;
			holder = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","color-utils":"color-utils"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

exports['default'] = function (pxContainer, bgUrl) {

	var scope;

	var holder = new PIXI.Container();
	pxContainer.addChild(holder);

	var mask = new PIXI.Graphics();
	holder.addChild(mask);

	var bgTexture = PIXI.Texture.fromImage(bgUrl);
	var sprite = new PIXI.Sprite(bgTexture);
	sprite.anchor.x = sprite.anchor.y = 0.5;
	holder.addChild(sprite);

	sprite.mask = mask;

	scope = {
		holder: holder,
		bgSprite: sprite,
		update: function update(mouse) {
			var windowW = _AppStore2['default'].Window.w;
			var nX = (mouse.x - (windowW >> 1)) / (windowW >> 1) * 1 - 0.5;
			var nY = mouse.nY - 0.5;
			var newx = sprite.ix - 30 * nX;
			var newy = sprite.iy - 20 * nY;
			sprite.x += (newx - sprite.x) * 0.008;
			sprite.y += (newy - sprite.y) * 0.008;
		},
		resize: function resize() {

			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var size = [(windowW >> 1) + 1, windowH];

			mask.clear();
			mask.beginFill(0xff0000, 1);
			mask.drawRect(0, 0, size[0], size[1]);
			mask.endFill();

			var resizeVars = _Utils2['default'].ResizePositionProportionally(size[0], size[1], 960, 1024);

			sprite.x = size[0] >> 1;
			sprite.y = size[1] >> 1;
			sprite.scale.x = sprite.scale.y = resizeVars.scale + 0.1;
			sprite.ix = sprite.x;
			sprite.iy = sprite.y;
		},
		clear: function clear() {
			pxContainer.removeChild(holder);
			holder.removeChild(mask);
			holder.addChild(sprite);
			mask.clear();
			sprite.destroy();
			holder = null;
			mask = null;
			sprite = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/fun-fact-holder.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _coloryRects = require('./colory-rects');

var _coloryRects2 = _interopRequireDefault(_coloryRects);

var _miniVideo = require('./mini-video');

var _miniVideo2 = _interopRequireDefault(_miniVideo);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _colorUtils = require('color-utils');

var _colorUtils2 = _interopRequireDefault(_colorUtils);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

exports['default'] = function (pxContainer, parent, mouse, data, props) {
	var scope;
	var isReady = false;
	var onCloseTimeout;
	var el = _domHand2['default'].select('.fun-fact-wrapper', parent);
	var videoWrapper = _domHand2['default'].select('.video-wrapper', el);
	var messageWrapper = _domHand2['default'].select('.message-wrapper', el);
	var messageInner = _domHand2['default'].select('.message-inner', messageWrapper);
	var pr = props;

	var splitter = new SplitText(messageInner, { type: "words" });

	var c = _domHand2['default'].select('.cursor-cross', el);
	var cross = {
		x: 0,
		y: 0,
		el: c,
		size: _domHand2['default'].size(c)
	};

	var holder = new PIXI.Container();
	pxContainer.addChild(holder);

	var leftRects = (0, _coloryRects2['default'])(holder, data['ambient-color']);
	var rightRects = (0, _coloryRects2['default'])(holder, data['ambient-color']);

	var mBgColor = data['ambient-color'].to;
	messageWrapper.style.backgroundColor = '#' + _colorUtils2['default'].hsvToHex(mBgColor.h, mBgColor.s, mBgColor.v);

	var leftTl = new TimelineMax();
	var rightTl = new TimelineMax();

	var mVideo = (0, _miniVideo2['default'])({
		autoplay: false,
		loop: true
	});
	var videoSrc = data['fun-fact-video-url'];
	mVideo.addTo(videoWrapper);
	mVideo.load(videoSrc, function () {
		isReady = true;
		scope.resize();
	});

	var onCloseFunFact = function onCloseFunFact() {
		if (!scope.isOpen) return;
		_AppActions2['default'].closeFunFact();
	};

	var open = function open() {
		el.style['z-index'] = 29;
		scope.isOpen = true;
		scope.leftRects.open();
		scope.rightRects.open();
		var delay = 350;
		setTimeout(function () {
			return leftTl.timeScale(1.5).play(0);
		}, delay);
		setTimeout(function () {
			return rightTl.timeScale(1.5).play(0);
		}, delay);
		setTimeout(function () {
			return mVideo.play();
		}, delay + 200);
		clearTimeout(onCloseTimeout);
		onCloseTimeout = setTimeout(function () {
			return _domHand2['default'].event.on(parent, 'click', onCloseFunFact);
		}, delay + 200);
		parent.style.cursor = 'none';
		_domHand2['default'].classes.add(cross.el, 'active');
	};
	var close = function close() {
		el.style['z-index'] = 27;
		scope.isOpen = false;
		scope.leftRects.close();
		scope.rightRects.close();
		var delay = 50;
		setTimeout(function () {
			return leftTl.timeScale(2).reverse();
		}, delay);
		setTimeout(function () {
			return rightTl.timeScale(2).reverse();
		}, delay);
		parent.style.cursor = 'auto';
		_domHand2['default'].event.off(parent, 'click', onCloseFunFact);
		_domHand2['default'].classes.remove(cross.el, 'active');
	};

	scope = {
		isOpen: false,
		open: open,
		close: close,
		leftRects: leftRects,
		rightRects: rightRects,
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var midWindowW = windowW >> 1;

			var size = [midWindowW + 1, windowH];

			scope.leftRects.resize(size[0], size[1], _AppConstants2['default'].TOP);
			scope.rightRects.resize(size[0], size[1], _AppConstants2['default'].BOTTOM);
			scope.rightRects.holder.x = windowW / 2;

			// if video isn't ready return
			if (!isReady) return;

			var videoWrapperResizeVars = _Utils2['default'].ResizePositionProportionally(midWindowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W >> 1, _AppConstants2['default'].MEDIA_GLOBAL_H);

			videoWrapper.style.width = messageWrapper.style.width = midWindowW + 'px';
			videoWrapper.style.height = messageWrapper.style.height = windowH + 'px';
			videoWrapper.style.left = midWindowW + 'px';
			mVideo.el.style.width = videoWrapperResizeVars.width + 'px';
			mVideo.el.style.height = videoWrapperResizeVars.height + 'px';
			mVideo.el.style.top = videoWrapperResizeVars.top + 'px';
			mVideo.el.style.left = videoWrapperResizeVars.left + 'px';

			setTimeout(function () {
				var messageInnerSize = _domHand2['default'].size(messageInner);
				messageInner.style.left = (midWindowW >> 1) - (messageInnerSize[0] >> 1) + 'px';
				messageInner.style.top = (windowH >> 1) - (messageInnerSize[1] >> 1) + 'px';
			}, 0);

			setTimeout(function () {
				leftTl.clear();
				rightTl.clear();

				leftTl.fromTo(messageWrapper, 1.4, { y: windowH, scaleY: 3, transformOrigin: '50% 0%' }, { y: 0, scaleY: 1, transformOrigin: '50% 0%', force3D: true, ease: Expo.easeInOut }, 0);
				leftTl.staggerFrom(splitter.words, 1, { y: 1400, scaleY: 6, force3D: true, ease: Expo.easeOut }, 0.06, 0.2);
				rightTl.fromTo(videoWrapper, 1.4, { y: -windowH * 2, scaleY: 3, transformOrigin: '50% 100%' }, { y: 0, scaleY: 1, transformOrigin: '50% 100%', force3D: true, ease: Expo.easeInOut }, 0);

				leftTl.pause(0);
				rightTl.pause(0);
				messageWrapper.style.opacity = 1;
				videoWrapper.style.opacity = 1;
			}, 5);
		},
		update: function update() {
			if (!scope.isOpen) return;
			var newx = mouse.x - (cross.size[0] >> 1);
			var newy = mouse.y - (cross.size[1] >> 1);
			cross.x += (newx - cross.x) * 0.5;
			cross.y += (newy - cross.y) * 0.5;
			_Utils2['default'].Translate(cross.el, cross.x, cross.y, 1);
		},
		clear: function clear() {
			_domHand2['default'].event.off(parent, 'click', onCloseFunFact);
			_domHand2['default'].classes.remove(cross.el, 'active');
			pxContainer.removeChild(holder);
			leftTl.clear();
			rightTl.clear();
			scope.leftRects.clear();
			scope.rightRects.clear();
			scope.leftRects = null;
			scope.rightRects = null;
			leftTl = null;
			rightTl = null;
			holder = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./colory-rects":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/colory-rects.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","color-utils":"color-utils","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _videoCanvas = require('./video-canvas');

var _videoCanvas2 = _interopRequireDefault(_videoCanvas);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _gridPositions = require('./grid-positions');

var _gridPositions2 = _interopRequireDefault(_gridPositions);

var _mediaCell = require('./media-cell');

var _mediaCell2 = _interopRequireDefault(_mediaCell);

var grid = function grid(props, parent, onItemEnded) {

	var videoEnded = function videoEnded(item) {
		onItemEnded(item);
		scope.transitionOutItem(item);
	};

	var imageEnded = function imageEnded(item) {
		onItemEnded(item);
		scope.transitionOutItem(item);
	};

	var gridContainer = _domHand2['default'].select(".grid-container", parent);
	var gridFrontContainer = _domHand2['default'].select(".grid-front-container", parent);
	var linesGridContainer = _domHand2['default'].select('.lines-grid-container', parent);
	var gridChildren = gridContainer.children;
	var gridFrontChildren = gridFrontContainer.children;
	var linesHorizontal = _domHand2['default'].select(".lines-grid-container .horizontal-lines", parent).children;
	var linesVertical = _domHand2['default'].select(".lines-grid-container .vertical-lines", parent).children;
	var scope;
	var currentSeat;
	var cells = [];
	var totalNum = props.data.grid.length;
	var videos = _AppStore2['default'].getHomeVideos();

	var seats = [1, 3, 5, 7, 9, 11, 13, 15, 21, 23, 25];

	var vCanvasProps = {
		autoplay: false,
		volume: 0,
		loop: false,
		onEnded: videoEnded
	};

	var mCell;
	var counter = 0;
	for (var i = 0; i < totalNum; i++) {
		var vParent = gridChildren[i];
		var fParent = gridFrontChildren[i];
		cells[i] = undefined;
		for (var j = 0; j < seats.length; j++) {
			if (i == seats[j]) {
				mCell = (0, _mediaCell2['default'])(vParent, fParent, videos[counter]);
				cells[i] = mCell;
				counter++;
			}
		}
	}

	var resize = function resize(gGrid) {
		var windowW = _AppStore2['default'].Window.w;
		var windowH = _AppStore2['default'].Window.h;

		var originalVideoSize = _AppConstants2['default'].HOME_VIDEO_SIZE;
		var blockSize = gGrid.blockSize;

		linesGridContainer.style.position = 'absolute';

		var resizeVars = _Utils2['default'].ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1]);

		var gPos = gGrid.positions;
		var parent, cell;
		var count = 0;
		var hl, vl;
		for (var i = 0; i < gPos.length; i++) {
			var row = gPos[i];

			// horizontal lines
			if (i > 0) {
				hl = scope.lines.horizontal[i - 1];
				hl.style.top = blockSize[1] * i + 'px';
				hl.style.width = windowW + 'px';
			}

			for (var j = 0; j < row.length; j++) {

				// vertical lines
				if (i == 0 && j > 0) {
					vl = scope.lines.vertical[j - 1];
					vl.style.left = blockSize[0] * j + 'px';
					vl.style.height = windowH + 'px';
				}

				cell = scope.cells[count];
				if (cell != undefined) {
					cell.resize(blockSize, row[j], resizeVars);
				}

				count++;
			}
		}
	};

	scope = {
		el: gridContainer,
		children: gridChildren,
		cells: cells,
		num: totalNum,
		positions: [],
		lines: {
			horizontal: linesHorizontal,
			vertical: linesVertical
		},
		resize: resize,
		init: function init() {
			for (var i = 0; i < cells.length; i++) {
				if (cells[i] != undefined) {
					cells[i].init();
				}
			};
		},
		transitionInItem: function transitionInItem(index, type) {
			// var item = scope.cells[index]
			// item.seat = index

			// item.canvas.classList.add('enable')

			// if(type == AppConstants.ITEM_VIDEO) {
			// 	item.play()
			// }else{
			// 	item.timeout(imageEnded, 2000)
			// 	item.seek(Utils.Rand(2, 10, 0))
			// }
		},
		transitionOutItem: function transitionOutItem(item) {
			// item.canvas.classList.remove('enable')

			// item.video.currentTime(0)
			// item.pause()
			// setTimeout(()=>{
			// 	item.drawOnce()
			// }, 500)
		},
		clear: function clear() {
			for (var i = 0; i < cells.length; i++) {
				if (cells[i] != undefined) {
					cells[i].clear();
				}
			};
		}
	};

	return scope;
};

exports['default'] = grid;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./grid-positions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-positions.js","./media-cell":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/media-cell.js","./video-canvas":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-positions.js":[function(require,module,exports){
/*
	width: 		width of grid
	height: 	height of grid
	columns: 	number of columns
	rows: 		number of rows
	type: 		type of the array
				linear - will give all the cols and rows position together one after the other
				cols_rows - will give separate rows arrays with the cols inside 	row[ [col], [col], [col], [col] ]
																					row[ [col], [col], [col], [col] ]
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

exports['default'] = function (width, height, columns, rows, type) {

	var t = type || 'linear';
	var blockSize = [width / columns, height / rows];
	var blocksLen = rows * columns;
	var positions = [];

	var posX = 0;
	var posY = 0;
	var columnCounter = 0;
	var rowsCounter = 0;
	var rr = [];

	switch (t) {
		case 'linear':
			for (var i = 0; i < blocksLen; i++) {
				if (columnCounter >= columns) {
					posX = 0;
					posY += blockSize[1];
					columnCounter = 0;
				}
				var b = [posX, posY];
				posX += blockSize[0];
				columnCounter += 1;
				positions[i] = b;
			};
			break;
		case 'cols_rows':
			for (var i = 0; i < blocksLen; i++) {
				var b = [posX, posY];
				rr.push(b);
				posX += blockSize[0];
				columnCounter += 1;
				if (columnCounter >= columns) {
					posX = 0;
					posY += blockSize[1];
					columnCounter = 0;
					positions[rowsCounter] = rr;
					rr = [];
					rowsCounter++;
				}
			};
			break;
	}

	return {
		rows: rows,
		columns: columns,
		blockSize: blockSize,
		positions: positions
	};
};

module.exports = exports['default'];

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var headerLinks = function headerLinks(parent) {
	var scope;

	var onSubMenuMouseEnter = function onSubMenuMouseEnter(e) {
		e.preventDefault();
		_domHand2['default'].classes.add(e.currentTarget, 'hovered');
	};
	var onSubMenuMouseLeave = function onSubMenuMouseLeave(e) {
		e.preventDefault();
		_domHand2['default'].classes.remove(e.currentTarget, 'hovered');
	};

	var camperLabEl = _domHand2['default'].select('.camper-lab', parent);
	var shopEl = _domHand2['default'].select('.shop-wrapper', parent);
	var mapEl = _domHand2['default'].select('.map-btn', parent);

	shopEl.addEventListener('mouseenter', onSubMenuMouseEnter);
	shopEl.addEventListener('mouseleave', onSubMenuMouseLeave);

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var padding = _AppConstants2['default'].PADDING_AROUND / 3;

			var camperLabCss = {
				left: windowW - _AppConstants2['default'].PADDING_AROUND * 0.6 - padding - _domHand2['default'].size(camperLabEl)[0],
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var shopCss = {
				left: camperLabCss.left - _domHand2['default'].size(shopEl)[0] - padding,
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var mapCss = {
				left: shopCss.left - _domHand2['default'].size(mapEl)[0] - padding,
				top: _AppConstants2['default'].PADDING_AROUND
			};

			camperLabEl.style.left = camperLabCss.left + 'px';
			camperLabEl.style.top = camperLabCss.top + 'px';
			shopEl.style.left = shopCss.left + 'px';
			shopEl.style.top = shopCss.top + 'px';
			mapEl.style.left = mapCss.left + 'px';
			mapEl.style.top = mapCss.top + 'px';
		}
	};

	return scope;
};

exports['default'] = headerLinks;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/image-to-canvases-grid.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _img = require('img');

var _img2 = _interopRequireDefault(_img);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

exports['default'] = function (container) {

	var scope;
	var el = _domHand2['default'].select('.grid-background-container', container);
	// var canvases = el.children
	// var canvas = document.createElement('canvas');
	// var ctx = canvas.getContext('2d');
	var onImgLoadedCallback;
	var grid;
	var image;
	var isReady = false;
	var anim = {
		x: 0,
		y: 0
	};

	// var items = []
	// for (var i = 0; i < canvases.length; i++) {
	// 	var tmpCanvas = document.createElement('canvas')
	// 	items[i] = {
	// 		canvas: canvases[i],
	// 		ctx: canvases[i].getContext('2d'),
	// 		tmpCanvas: tmpCanvas,
	// 		tmpContext: tmpCanvas.getContext('2d')
	// 	}
	// }

	var onImgReady = function onImgReady(error, i) {
		image = i;
		_domHand2['default'].tree.add(el, image);
		isReady = true;
		scope.resize(grid);
		if (onImgLoadedCallback) onImgLoadedCallback();
	};

	scope = {
		el: el,
		resize: function resize(gGrid) {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			grid = gGrid;

			if (!isReady) return;

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);
			image.style.position = 'absolute';
			image.style.width = resizeVarsBg.width + 'px';
			image.style.height = resizeVarsBg.height + 'px';
			image.style.top = resizeVarsBg.top + 'px';
			image.style.left = resizeVarsBg.left + 'px';

			// var blockSize = gGrid.blockSize
			// var imageBlockSize = [ resizeVarsBg.width / gGrid.columns, resizeVarsBg.height / gGrid.rows ]
			// var gPos = gGrid.positions
			// var count = 0
			// var canvas, ctx, tmpContext, tmpCanvas;

			// for (var i = 0; i < gPos.length; i++) {
			// 	var row = gPos[i]

			// 	for (var j = 0; j < row.length; j++) {

			// 		canvas = items[count].canvas
			// 		ctx = items[count].ctx
			// 		tmpContext = items[count].tmpContext
			// 		tmpCanvas = items[count].tmpCanvas

			// 		// block divs
			// 		canvas.style.width = blockSize[0] + 'px'
			// 		canvas.style.height = blockSize[1] + 'px'
			// 		canvas.style.left = row[j][0] + 'px'
			// 		canvas.style.top = row[j][1] + 'px'

			// 		ctx.clearRect(0, 0, blockSize[0], blockSize[1])
			// 		tmpContext.save()
			// 		tmpContext.clearRect(0, 0, blockSize[0], blockSize[1])
			// 		tmpContext.drawImage(image, imageBlockSize[0]*j, imageBlockSize[1]*i, imageBlockSize[0], imageBlockSize[1], 0, 0, blockSize[0], blockSize[1])

			// 		tmpContext.restore()
			// 		ctx.drawImage(tmpCanvas, 0, 0)

			// 		count++
			// 	}
			// }
		},
		update: function update(mouse) {

			anim.x += ((mouse.nX - 0.5) * 40 - anim.x) * 0.05;
			anim.y += ((mouse.nY - 0.5) * 20 - anim.y) * 0.05;
			_Utils2['default'].Translate(image, anim.x, anim.y, 1);
		},
		load: function load(url, cb) {
			onImgLoadedCallback = cb;
			(0, _img2['default'])(url, onImgReady);
		},
		clear: function clear() {
			el = null;
			image = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-diptyque-btns.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _img = require('img');

var _img2 = _interopRequireDefault(_img);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

exports['default'] = function (container, data, mouse, onMouseEventsHandler) {

	var animParams = function animParams(parent, el, imgWrapper) {
		var tl = new TimelineMax();
		tl.fromTo(imgWrapper, 1, { scaleX: 1.7, scaleY: 1.3, rotation: '2deg', y: -20, opacity: 0, transformOrigin: '50% 50%', force3D: true }, { scaleX: 1, scaleY: 1, rotation: '0deg', y: 0, opacity: 1, transformOrigin: '50% 50%', force3D: true, ease: Back.easeInOut }, 0);
		tl.pause(0);
		return {
			parent: parent,
			imgWrapper: imgWrapper,
			tl: tl,
			el: el,
			time: 0,
			position: { x: 0, y: 0 },
			fposition: { x: 0, y: 0 },
			iposition: { x: 0, y: 0 },
			// scale: {x: 0, y: 0},
			// fscale: {x: 0, y: 0},
			// iscale: {x: 0, y: 0},
			velocity: { x: 0, y: 0 },
			// velocityScale: {x: 0, y: 0},
			rotation: 0,
			config: {
				length: 0,
				spring: 0.8,
				friction: 0.4
			}
		};
	};

	var scope;
	var el = _domHand2['default'].select('.main-btns-wrapper', container);
	var shopBtn = _domHand2['default'].select('#shop-btn', el);
	var funBtn = _domHand2['default'].select('#fun-fact-btn', el);
	var shopImgWrapper = _domHand2['default'].select('.img-wrapper', shopBtn);
	var funImgWrapper = _domHand2['default'].select('.img-wrapper', funBtn);
	var shopSize, funSize;
	var loadCounter = 0;
	var buttonSize = [0, 0];
	var springTo = _Utils2['default'].SpringTo;
	var translate = _Utils2['default'].Translate;
	var shopAnim, funAnim, currentAnim;
	var buttons = {
		'shop-btn': {
			anim: undefined
		},
		'fun-fact-btn': {
			anim: undefined
		}
	};

	var shopImg = (0, _img2['default'])('image/shop/' + _AppStore2['default'].lang() + '.png', function () {
		shopAnim = animParams(shopBtn, shopImg, shopImgWrapper);
		buttons['shop-btn'].anim = shopAnim;
		shopSize = [shopImg.width, shopImg.height];
		_domHand2['default'].tree.add(shopImgWrapper, shopImg);
		scope.resize();
	});
	var funImg = (0, _img2['default'])('image/fun-facts.png', function () {
		funAnim = animParams(funBtn, funImg, funImgWrapper);
		buttons['fun-fact-btn'].anim = funAnim;
		funSize = [funImg.width, funImg.height];
		_domHand2['default'].tree.add(funImgWrapper, funImg);
		scope.resize();
	});

	_domHand2['default'].event.on(shopBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'click', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'click', onMouseEventsHandler);

	var updateAnim = function updateAnim(anim) {
		if (anim == undefined) return;
		anim.time += 0.1;
		anim.fposition.x = anim.iposition.x;
		anim.fposition.y = anim.iposition.y;
		anim.fposition.x += (mouse.nX - 0.5) * 80;
		anim.fposition.y += (mouse.nY - 0.5) * 200;

		springTo(anim, anim.fposition, 1);
		anim.config.length += (0.01 - anim.config.length) * 0.1;

		translate(anim.el, anim.position.x + anim.velocity.x, anim.position.y + anim.velocity.y, 1);
	};

	scope = {
		isActive: true,
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var midW = windowW >> 1;
			var scale = 0.8;

			buttonSize[0] = midW * 0.9;
			buttonSize[1] = windowH;

			if (shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px';
				shopBtn.style.height = buttonSize[1] + 'px';
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				shopImgWrapper.style.width = shopSize[0] * scale + 'px';
				shopImgWrapper.style.height = shopSize[1] * scale + 'px';
				shopImgWrapper.style.left = (buttonSize[0] >> 1) - (shopSize[0] * scale >> 1) + 'px';
				shopImgWrapper.style.top = (buttonSize[1] >> 1) - (shopSize[1] * scale >> 1) + 'px';
			}
			if (funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px';
				funBtn.style.height = buttonSize[1] + 'px';
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				funImgWrapper.style.width = funSize[0] * scale + 'px';
				funImgWrapper.style.height = funSize[1] * scale + 'px';
				funImgWrapper.style.left = (buttonSize[0] >> 1) - (funSize[0] * scale >> 1) + 'px';
				funImgWrapper.style.top = (buttonSize[1] >> 1) - (funSize[1] * scale >> 1) + 'px';
			}
		},
		over: function over(id) {
			if (!scope.isActive) return;
			currentAnim = buttons[id].anim;
			currentAnim.tl.timeScale(2.6).play(0);
			currentAnim.config.length = 400;
		},
		out: function out(id) {
			if (!scope.isActive) return;
			currentAnim = buttons[id].anim;
			currentAnim.tl.timeScale(3).reverse();
		},
		update: function update() {
			if (!scope.isActive) return;
			if (shopAnim == undefined) return;
			updateAnim(shopAnim);
			updateAnim(funAnim);
		},
		activate: function activate() {
			scope.isActive = true;
		},
		disactivate: function disactivate() {
			scope.isActive = false;
			shopAnim.tl.timeScale(3).reverse();
			funAnim.tl.timeScale(3).reverse();
		},
		clear: function clear() {
			shopAnim.tl.clear();
			funAnim.tl.clear();
			_domHand2['default'].event.off(shopBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'click', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'click', onMouseEventsHandler);
			shopAnim = null;
			funAnim = null;
			buttons = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _Map_hbs = require('./../partials/Map.hbs');

var _Map_hbs2 = _interopRequireDefault(_Map_hbs);

exports['default'] = function (parent, type) {

	// render map
	var mapWrapper = _domHand2['default'].select('.map-wrapper', parent);
	var el = document.createElement('div');
	var t = (0, _Map_hbs2['default'])();
	el.innerHTML = t;
	_domHand2['default'].tree.add(mapWrapper, el);

	var scope;
	var dir, stepEl;
	var selectedDots = [];
	var currentPaths,
	    fillLine,
	    dashedLine,
	    stepTotalLen = 0;
	var previousHighlightIndex = undefined;
	var el = _domHand2['default'].select('.map-wrapper', parent);
	var titlesWrapper = _domHand2['default'].select('.titles-wrapper', el);
	var mapdots = _domHand2['default'].select.all('#map-dots .dot-path', el);
	var footsteps = _domHand2['default'].select.all('#footsteps g', el);
	var currentDot;

	var findDotById = function findDotById(parent, child) {
		for (var i = 0; i < mapdots.length; i++) {
			var dot = mapdots[i];
			if (parent == dot.id) {
				if (child == dot.getAttribute('data-parent-id')) {
					return dot;
				}
			}
		}
	};

	var onCellMouseEnter = function onCellMouseEnter(item) {
		currentDot = findDotById(item[1], item[0]);
		_domHand2['default'].classes.add(currentDot, 'animate');
	};
	var onCellMouseLeave = function onCellMouseLeave(item) {
		_domHand2['default'].classes.remove(currentDot, 'animate');
	};

	if (type == _AppConstants2['default'].INTERACTIVE) {

		_AppStore2['default'].on(_AppConstants2['default'].CELL_MOUSE_ENTER, onCellMouseEnter);
		_AppStore2['default'].on(_AppConstants2['default'].CELL_MOUSE_LEAVE, onCellMouseLeave);
	}

	var titles = {
		'deia': {
			el: _domHand2['default'].select('.deia', titlesWrapper)
		},
		'es-trenc': {
			el: _domHand2['default'].select('.es-trenc', titlesWrapper)
		},
		'arelluf': {
			el: _domHand2['default'].select('.arelluf', titlesWrapper)
		}
	};

	function titlePosX(parentW, val) {
		return parentW / _AppConstants2['default'].MEDIA_GLOBAL_W * val;
	}
	function titlePosY(parentH, val) {
		return parentH / _AppConstants2['default'].MEDIA_GLOBAL_H * val;
	}

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var mapW = 693,
			    mapH = 500;
			var mapSize = [];
			var resizeVars = _Utils2['default'].ResizePositionProportionally(windowW * 0.35, windowH * 0.35, mapW, mapH);
			mapSize[0] = mapW * resizeVars.scale;
			mapSize[1] = mapH * resizeVars.scale;

			el.style.width = mapSize[0] + 'px';
			el.style.height = mapSize[1] + 'px';
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) - 40 + 'px';
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + 'px';

			titles['deia'].el.style.left = titlePosX(mapSize[0], 800) + 'px';
			titles['deia'].el.style.top = titlePosY(mapSize[1], 330) + 'px';
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1250) + 'px';
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 850) + 'px';
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 426) + 'px';
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 500) + 'px';
		},
		highlightDots: function highlightDots(oldHash, newHash) {
			selectedDots = [];
			for (var i = 0; i < mapdots.length; i++) {
				var dot = mapdots[i];
				var id = dot.id;
				var parentId = dot.getAttribute('data-parent-id');
				if (id == oldHash.target && parentId == oldHash.parent) selectedDots.push(dot);
				if (id == newHash.target && parentId == newHash.parent) selectedDots.push(dot);
			}
			for (var i = 0; i < selectedDots.length; i++) {
				var dot = selectedDots[i];
				_domHand2['default'].classes.add(dot, 'animate');
			};
		},
		highlight: function highlight(oldHash, newHash) {
			var oldId = oldHash.target;
			var newId = newHash.target;
			var current = oldId + '-' + newId;
			for (var i = 0; i < footsteps.length; i++) {
				var step = footsteps[i];
				var id = step.id;
				if (id.indexOf(oldId) > -1 && id.indexOf(newId) > -1) {
					// check if the last one
					if (i == previousHighlightIndex) stepEl = footsteps[footsteps.length - 1];else stepEl = step;

					dir = id.indexOf(current) > -1 ? _AppConstants2['default'].FORWARD : _AppConstants2['default'].BACKWARD;
					previousHighlightIndex = i;
				}
			};

			scope.highlightDots(oldHash, newHash);

			currentPaths = _domHand2['default'].select.all('path', stepEl);
			dashedLine = currentPaths[0];

			// choose path depends of footstep direction
			if (dir == _AppConstants2['default'].FORWARD) {
				fillLine = currentPaths[1];
				currentPaths[2].style.opacity = 0;
			} else {
				fillLine = currentPaths[2];
				currentPaths[1].style.opacity = 0;
			}

			// stepEl.style.opacity = 1

			// // find total length of shape
			// stepTotalLen = fillLine.getTotalLength()
			// fillLine.style['stroke-dashoffset'] = 0
			// fillLine.style['stroke-dasharray'] = stepTotalLen

			// // start animation of dashed line
			// dom.classes.add(dashedLine, 'animate')

			// // start animation
			// dom.classes.add(fillLine, 'animate')
		},
		resetHighlight: function resetHighlight() {
			setTimeout(function () {
				// stepEl.style.opacity = 0
				currentPaths[1].style.opacity = 1;
				currentPaths[2].style.opacity = 1;
				_domHand2['default'].classes.remove(fillLine, 'animate');
				_domHand2['default'].classes.remove(dashedLine, 'animate');
				for (var i = 0; i < selectedDots.length; i++) {
					var dot = selectedDots[i];
					_domHand2['default'].classes.remove(dot, 'animate');
				};
			}, 0);
		},
		updateProgress: function updateProgress(progress) {
			// if(fillLine == undefined) return
			// var dashOffset = (progress / 1) * stepTotalLen
			// fillLine.style['stroke-dashoffset'] = dashOffset
		},
		clear: function clear() {
			if (type == _AppConstants2['default'].INTERACTIVE) {
				_AppStore2['default'].off(_AppConstants2['default'].CELL_MOUSE_ENTER, onCellMouseEnter);
				_AppStore2['default'].off(_AppConstants2['default'].CELL_MOUSE_LEAVE, onCellMouseLeave);
			}
			titles = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/Map.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/media-cell.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _miniVideo = require('./mini-video');

var _miniVideo2 = _interopRequireDefault(_miniVideo);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

exports['default'] = function (container, front, videoUrl) {

	var scope;
	var splitter = videoUrl.split('/');
	var name = splitter[splitter.length - 1].split('.')[0];
	var nameSplit = name.split('-');
	var nameParts = nameSplit.length == 3 ? [nameSplit[0] + '-' + nameSplit[1], nameSplit[2]] : nameSplit;
	var imgId = 'home-video-shots/' + name;
	var mVideo = (0, _miniVideo2['default'])({
		loop: true,
		autoplay: false
	});
	var size, position, resizeVars;
	var img;

	var onMouseEnter = function onMouseEnter(e) {
		e.preventDefault();
		_AppActions2['default'].cellMouseEnter(nameParts);
		if (mVideo.isLoaded) {
			mVideo.play(0);
		} else {
			mVideo.load(videoUrl, function () {
				mVideo.play();
			});
		}
	};

	var onMouseLeave = function onMouseLeave(e) {
		e.preventDefault();
		_AppActions2['default'].cellMouseLeave(nameParts);
		mVideo.pause(0);
	};

	var onClick = function onClick(e) {
		e.preventDefault();
		_Router2['default'].setHash(nameParts[0] + '/' + nameParts[1]);
	};

	var init = function init() {
		var imgUrl = _AppStore2['default'].Preloader.getImageURL(imgId);
		img = document.createElement('img');
		img.src = imgUrl;
		_domHand2['default'].tree.add(container, img);
		_domHand2['default'].tree.add(container, mVideo.el);

		_domHand2['default'].event.on(front, 'mouseenter', onMouseEnter);
		_domHand2['default'].event.on(front, 'mouseleave', onMouseLeave);
		_domHand2['default'].event.on(front, 'click', onClick);

		scope.isReady = true;
	};

	scope = {
		isReady: false,
		init: init,
		resize: function resize(s, p, rv) {

			size = s == undefined ? size : s;
			position = p == undefined ? position : p;
			resizeVars = rv == undefined ? resizeVars : rv;

			if (!scope.isReady) return;

			container.style.width = front.style.width = size[0] + 'px';
			container.style.height = front.style.height = size[1] + 'px';
			container.style.left = front.style.left = position[0] + 'px';
			container.style.top = front.style.top = position[1] + 'px';

			img.style.width = resizeVars.width + 'px';
			img.style.height = resizeVars.height + 'px';
			img.style.left = resizeVars.left + 'px';
			img.style.top = resizeVars.top + 'px';

			mVideo.el.style.width = resizeVars.width + 'px';
			mVideo.el.style.height = resizeVars.height + 'px';
			mVideo.el.style.left = resizeVars.left + 'px';
			mVideo.el.style.top = resizeVars.top + 'px';
		},
		clear: function clear() {
			mVideo.clear();
			_domHand2['default'].event.off(front, 'mouseenter', onMouseEnter);
			_domHand2['default'].event.off(front, 'mouseleave', onMouseLeave);
			_domHand2['default'].event.off(front, 'click', onClick);
			mVideo = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

exports['default'] = function (props) {

	var scope;
	var video = document.createElement('video');
	video.preload = "";
	var onReadyCallback;
	var size = { width: 0, height: 0 };
	var eListeners = [];

	var onCanPlay = function onCanPlay() {
		scope.isLoaded = true;
		if (props.autoplay) video.play();
		if (props.volume != undefined) video.volume = props.volume;
		size.width = video.videoWidth;
		size.height = video.videoHeight;
		video.removeEventListener('canplay', onCanPlay);
		video.removeEventListener('canplaythrough', onCanPlay);
		onReadyCallback(scope);
	};

	var play = function play(time) {
		if (time != undefined) {
			scope.seek(time);
		}
		scope.isPlaying = true;
		video.play();
	};

	var seek = function seek(time) {
		try {
			video.currentTime = time;
		} catch (err) {}
	};

	var pause = function pause(time) {
		video.pause();
		if (time != undefined) {
			scope.seek(time);
		}
		scope.isPlaying = false;
	};

	var volume = function volume(val) {
		if (val) {
			scope.el.volume = val;
		} else {
			return scope.el.volume;
		}
	};

	var currentTime = function currentTime(val) {
		if (val) {
			scope.el.currentTime = val;
		} else {
			return scope.el.currentTime;
		}
	};

	var width = function width() {
		return scope.el.videoWidth;
	};

	var height = function height() {
		return scope.el.videoHeight;
	};

	var ended = function ended() {
		if (props.loop) play();
	};

	var addTo = function addTo(p) {
		scope.parent = p;
		_domHand2['default'].tree.add(scope.parent, video);
	};

	var on = function on(event, cb) {
		eListeners.push({ event: event, cb: cb });
		video.addEventListener(event, cb);
	};

	var off = function off(event, cb) {
		for (var i in eListeners) {
			var e = eListeners[i];
			if (e.event == event && e.cb == cb) {
				eListeners.splice(i, 1);
			}
		}
		video.removeEventListener(event, cb);
	};

	var clearAllEvents = function clearAllEvents() {
		for (var i in eListeners) {
			var e = eListeners[i];
			video.removeEventListener(e.event, e.cb);
		}
		eListeners.length = 0;
		eListeners = null;
	};

	var clear = function clear() {
		video.removeEventListener('canplay', onCanPlay);
		video.removeEventListener('canplaythrough', onCanPlay);
		video.removeEventListener('ended', ended);
		scope.clearAllEvents();
		size = null;
		video = null;
	};

	var addSourceToVideo = function addSourceToVideo(element, src, type) {
		var source = document.createElement('source');
		source.src = src;
		source.type = type;
		_domHand2['default'].tree.add(element, source);
	};

	video.addEventListener('canplay', onCanPlay);
	video.addEventListener('canplaythrough', onCanPlay);
	video.addEventListener('ended', ended);

	scope = {
		parent: undefined,
		el: video,
		size: size,
		play: play,
		seek: seek,
		pause: pause,
		volume: volume,
		currentTime: currentTime,
		width: width,
		height: height,
		addTo: addTo,
		on: on,
		off: off,
		clear: clear,
		clearAllEvents: clearAllEvents,
		isPlaying: props.autoplay || false,
		isLoaded: false,
		load: function load(src, callback) {
			onReadyCallback = callback;
			addSourceToVideo(video, src, 'video/mp4');
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mobile-footer.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

exports['default'] = function (container, data) {

	var scope;
	var el = _domHand2['default'].select('footer', container);
	var buttons = _domHand2['default'].select.all('li', el);

	var onBtnClick = function onBtnClick(e) {
		e.preventDefault();
		var target = e.currentTarget;
		var id = target.id;
		var url = undefined;
		switch (id) {
			case 'home':
				_AppActions2['default'].openFeed();
				break;
			case 'grid':
				_AppActions2['default'].openGrid();
				break;
			case 'com':
				url = 'http://www.camper.com/';
				break;
			case 'lab':
				url = data.labUrl;
				break;
			case 'shop':
				url = 'http://www.camper.com/';
				break;
		}
		if (url != undefined) window.open(url, '_blank');
	};

	var btn, i;
	for (i = 0; i < buttons.length; i++) {
		btn = buttons[i];
		_domHand2['default'].event.on(btn, 'click', onBtnClick);
	}

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var btnW = windowW / buttons.length;

			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				btn.style.width = btnW + 'px';
				btn.style.left = btnW * i + "px";
			}
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Page2 = require('./../Page');

var _Page3 = _interopRequireDefault(_Page2);

var _AppStore = require('./../../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _diptyquePart = require('./../diptyque-part');

var _diptyquePart2 = _interopRequireDefault(_diptyquePart);

var _character = require('./../character');

var _character2 = _interopRequireDefault(_character);

var _funFactHolder = require('./../fun-fact-holder');

var _funFactHolder2 = _interopRequireDefault(_funFactHolder);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _arrowsWrapper = require('./../arrows-wrapper');

var _arrowsWrapper2 = _interopRequireDefault(_arrowsWrapper);

var _AppConstants = require('./../../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./../../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _selfieStick = require('./../selfie-stick');

var _selfieStick2 = _interopRequireDefault(_selfieStick);

var _mainDiptyqueBtns = require('./../main-diptyque-btns');

var _mainDiptyqueBtns2 = _interopRequireDefault(_mainDiptyqueBtns);

var Diptyque = (function (_Page) {
	_inherits(Diptyque, _Page);

	function Diptyque(props) {
		_classCallCheck(this, Diptyque);

		var nextDiptyque = _AppStore2['default'].getNextDiptyque();
		var previousDiptyque = _AppStore2['default'].getPreviousDiptyque();
		props.data['next-page'] = nextDiptyque;
		props.data['previous-page'] = previousDiptyque;
		props.data['next-preview-url'] = _AppStore2['default'].getPreviewUrlByHash(nextDiptyque);
		props.data['previous-preview-url'] = _AppStore2['default'].getPreviewUrlByHash(previousDiptyque);
		props.data['fact-txt'] = props.data.fact[_AppStore2['default'].lang()];

		_get(Object.getPrototypeOf(Diptyque.prototype), 'constructor', this).call(this, props);

		this.onMouseMove = this.onMouseMove.bind(this);
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this);
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this);
		this.onSelfieStickClicked = this.onSelfieStickClicked.bind(this);
		this.onMainBtnsEventHandler = this.onMainBtnsEventHandler.bind(this);
		this.onOpenFact = this.onOpenFact.bind(this);
		this.onCloseFact = this.onCloseFact.bind(this);
		this.uiTransitionInCompleted = this.uiTransitionInCompleted.bind(this);
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {

			_AppStore2['default'].on(_AppConstants2['default'].OPEN_FUN_FACT, this.onOpenFact);
			_AppStore2['default'].on(_AppConstants2['default'].CLOSE_FUN_FACT, this.onCloseFact);

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.leftPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('shoe-bg'));
			this.rightPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('character-bg'));

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'));
			this.funFact = (0, _funFactHolder2['default'])(this.pxContainer, this.element, this.mouse, this.props.data, this.props);
			this.arrowsWrapper = (0, _arrowsWrapper2['default'])(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave);
			this.selfieStick = (0, _selfieStick2['default'])(this.element, this.mouse, this.props.data);
			this.mainBtns = (0, _mainDiptyqueBtns2['default'])(this.element, this.props.data, this.mouse, this.onMainBtnsEventHandler);

			_domHand2['default'].event.on(this.selfieStick.el, 'click', this.onSelfieStickClicked);
			_domHand2['default'].event.on(window, 'mousemove', this.onMouseMove);

			TweenMax.set(this.arrowsWrapper.background('left'), { x: -_AppConstants2['default'].SIDE_EVENT_PADDING });
			TweenMax.set(this.arrowsWrapper.background('right'), { x: _AppConstants2['default'].SIDE_EVENT_PADDING });

			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentDidMount', this).call(this);
			this.domIsReady = true;
		}
	}, {
		key: 'setupAnimations',
		value: function setupAnimations() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			this.tlIn.from(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut, force3D: true }, 0);
			this.tlIn.from(this.leftPart.bgSprite, 1, { x: this.leftPart.bgSprite.x - 200, ease: Expo.easeOut, force3D: true }, 0.5);
			this.tlIn.from(this.leftPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut, force3D: true }, 0.4);
			this.tlIn.from(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut, force3D: true }, 0);
			this.tlIn.from(this.rightPart.bgSprite, 1, { x: this.rightPart.bgSprite.x + 200, ease: Expo.easeOut, force3D: true }, 0.5);
			this.tlIn.from(this.rightPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut, force3D: true }, 0.4);

			this.tlOut.to(this.arrowsWrapper.left, 0.5, { x: -100, ease: Back.easeOut, force3D: true }, 0);
			this.tlOut.to(this.arrowsWrapper.right, 0.5, { x: 100, ease: Back.easeOut, force3D: true }, 0);
			this.tlOut.to(this.selfieStick.el, 0.5, { y: 500, ease: Back.easeOut, force3D: true }, 0);
			this.tlOut.to(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut, force3D: true }, 0.1);
			this.tlOut.to(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut, force3D: true }, 0.1);

			this.uiInTl = new TimelineMax();
			this.uiInTl.from(this.arrowsWrapper.left, 1, { x: -100, ease: Expo.easeOut, force3D: true }, 0.1);
			this.uiInTl.from(this.arrowsWrapper.right, 1, { x: 100, ease: Expo.easeOut, force3D: true }, 0.1);
			this.uiInTl.from(this.selfieStick.el, 1, { y: 500, ease: Back.easeOut, force3D: true }, 0.5);
			this.uiInTl.pause(0);
			this.uiInTl.eventCallback("onComplete", this.uiTransitionInCompleted);

			_get(Object.getPrototypeOf(Diptyque.prototype), 'setupAnimations', this).call(this);
		}
	}, {
		key: 'uiTransitionInCompleted',
		value: function uiTransitionInCompleted() {
			this.uiInTl.eventCallback("onComplete", null);
			this.selfieStick.transitionInCompleted();
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			this.uiInTl.timeScale(1.6).play();
			_get(Object.getPrototypeOf(Diptyque.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'onMouseMove',
		value: function onMouseMove(e) {
			e.preventDefault();
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
			this.mouse.nX = e.clientX / windowW * 1;
			this.mouse.nY = e.clientY / windowH * 1;
		}
	}, {
		key: 'onSelfieStickClicked',
		value: function onSelfieStickClicked(e) {
			e.preventDefault();
			if (this.selfieStick.isOpened) {
				this.selfieStick.close();
			} else {
				this.selfieStick.open();
				this.mainBtns.activate();
			}
		}
	}, {
		key: 'onArrowMouseEnter',
		value: function onArrowMouseEnter(e) {
			e.preventDefault();
			var id = e.currentTarget.id;

			var posX;
			var offsetX = _AppConstants2['default'].SIDE_EVENT_PADDING;
			if (id == 'left') posX = offsetX;else posX = -offsetX;

			TweenMax.to(this.pxContainer, 0.4, { x: posX, ease: Back.easeOut, force3D: true });
			TweenMax.to(this.arrowsWrapper.background(id), 0.4, { x: 0, ease: Back.easeOut, force3D: true });

			this.arrowsWrapper.over(id);
		}
	}, {
		key: 'onArrowMouseLeave',
		value: function onArrowMouseLeave(e) {
			e.preventDefault();
			var id = e.currentTarget.id;

			var posX;
			var offsetX = _AppConstants2['default'].SIDE_EVENT_PADDING;
			if (id == 'left') posX = -offsetX;else posX = offsetX;

			TweenMax.to(this.pxContainer, 0.6, { x: 0, ease: Expo.easeOut });
			TweenMax.to(this.arrowsWrapper.background(id), 0.6, { x: posX, ease: Expo.easeOut });

			this.arrowsWrapper.out(id);
		}
	}, {
		key: 'onMainBtnsEventHandler',
		value: function onMainBtnsEventHandler(e) {
			e.preventDefault();
			var type = e.type;
			var target = e.currentTarget;
			var id = target.id;
			if (type == 'click' && id == 'fun-fact-btn') {
				if (this.funFact.isOpen) {
					_AppActions2['default'].closeFunFact();
				} else {
					_AppActions2['default'].openFunFact();
				}
				return;
			}
			if (type == 'mouseenter') {
				this.mainBtns.over(id);
				return;
			}
			if (type == 'mouseleave') {
				this.mainBtns.out(id);
				return;
			}
			if (type == 'click' && id == 'shop-btn') {
				window.open(this.props.data['shop-url'], '_blank');
				return;
			}
		}
	}, {
		key: 'onOpenFact',
		value: function onOpenFact() {
			this.funFact.open();
			this.mainBtns.disactivate();
		}
	}, {
		key: 'onCloseFact',
		value: function onCloseFact() {
			this.funFact.close();
			this.mainBtns.activate();
		}
	}, {
		key: 'update',
		value: function update() {
			if (!this.domIsReady) return;
			this.character.update(this.mouse);
			this.leftPart.update(this.mouse);
			this.rightPart.update(this.mouse);
			this.selfieStick.update();
			this.funFact.update();
			this.mainBtns.update();

			_get(Object.getPrototypeOf(Diptyque.prototype), 'update', this).call(this);
		}
	}, {
		key: 'resize',
		value: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			this.leftPart.resize();
			this.rightPart.resize();
			this.character.resize();
			this.funFact.resize();
			this.arrowsWrapper.resize();
			this.selfieStick.resize();
			this.mainBtns.resize();

			this.rightPart.holder.x = windowW >> 1;

			_get(Object.getPrototypeOf(Diptyque.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_AppStore2['default'].off(_AppConstants2['default'].OPEN_FUN_FACT, this.onOpenFact);
			_AppStore2['default'].off(_AppConstants2['default'].CLOSE_FUN_FACT, this.onCloseFact);
			_domHand2['default'].event.off(window, 'mousemove', this.onMouseMove);
			_domHand2['default'].event.off(this.selfieStick.el, 'click', this.onSelfieStickClicked);
			this.uiInTl.eventCallback("onComplete", null);
			this.uiInTl.clear();
			this.leftPart.clear();
			this.rightPart.clear();
			this.character.clear();
			this.funFact.clear();
			this.selfieStick.clear();
			this.arrowsWrapper.clear();
			this.mainBtns.clear();
			this.uiInTl = null;
			this.mouse = null;
			this.leftPart = null;
			this.rightPart = null;
			this.character = null;
			this.arrowsWrapper = null;
			this.mainBtns = null;
			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentWillUnmount', this).call(this);
		}
	}]);

	return Diptyque;
})(_Page3['default']);

exports['default'] = Diptyque;
module.exports = exports['default'];

},{"./../../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../arrows-wrapper":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/arrows-wrapper.js","./../character":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js","./../diptyque-part":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js","./../fun-fact-holder":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/fun-fact-holder.js","./../main-diptyque-btns":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-diptyque-btns.js","./../selfie-stick":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/selfie-stick.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Page2 = require('./../Page');

var _Page3 = _interopRequireDefault(_Page2);

var _AppStore = require('./../../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _Utils = require('./../../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _bottomTextsHome = require('./../bottom-texts-home');

var _bottomTextsHome2 = _interopRequireDefault(_bottomTextsHome);

var _AppConstants = require('./../../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _gridHome = require('./../grid-home');

var _gridHome2 = _interopRequireDefault(_gridHome);

var _imageToCanvasesGrid = require('./../image-to-canvases-grid');

var _imageToCanvasesGrid2 = _interopRequireDefault(_imageToCanvasesGrid);

var _aroundBorderHome = require('./../around-border-home');

var _aroundBorderHome2 = _interopRequireDefault(_aroundBorderHome);

var _mainMap = require('./../main-map');

var _mainMap2 = _interopRequireDefault(_mainMap);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _gridPositions = require('./../grid-positions');

var _gridPositions2 = _interopRequireDefault(_gridPositions);

var Home = (function (_Page) {
	_inherits(Home, _Page);

	function Home(props) {
		_classCallCheck(this, Home);

		var content = _AppStore2['default'].pageContent();
		var generaInfos = _AppStore2['default'].generalInfos();
		var texts = content.texts[_AppStore2['default'].lang()];
		props.data.facebookUrl = generaInfos['facebook_url'];
		props.data.twitterUrl = generaInfos['twitter_url'];
		props.data.instagramUrl = generaInfos['instagram_url'];
		props.data.grid = [];
		props.data.grid.length = 28;
		props.data['lines-grid'] = { horizontal: [], vertical: [] };
		props.data['lines-grid'].horizontal.length = 3;
		props.data['lines-grid'].vertical.length = 6;
		props.data['generic'] = texts.generic;
		props.data['deia-txt'] = texts['deia'];
		props.data['arelluf-txt'] = texts['arelluf'];
		props.data['es-trenc-txt'] = texts['es-trenc'];

		_get(Object.getPrototypeOf(Home.prototype), 'constructor', this).call(this, props);
		var bgUrl = this.getImageUrlById('background');
		this.props.data.bgurl = bgUrl;

		this.triggerNewItem = this.triggerNewItem.bind(this);
		this.onItemEnded = this.onItemEnded.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
	}

	_createClass(Home, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.lastGridItemIndex;
			this.videoTriggerCounter = 200;
			this.imageTriggerCounter = 0;

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.seats = [1, 3, 5, 7, 9, 11, 15, 17, 21, 23, 25];

			this.usedSeats = [];

			this.imgCGrid = (0, _imageToCanvasesGrid2['default'])(this.element);
			this.imgCGrid.load(this.props.data.bgurl);
			this.grid = (0, _gridHome2['default'])(this.props, this.element, this.onItemEnded);
			this.grid.init();
			this.bottomTexts = (0, _bottomTextsHome2['default'])(this.element);
			this.aroundBorder = (0, _aroundBorderHome2['default'])(this.element);
			this.map = (0, _mainMap2['default'])(this.element, _AppConstants2['default'].INTERACTIVE);

			_domHand2['default'].event.on(window, 'mousemove', this.onMouseMove);

			_get(Object.getPrototypeOf(Home.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'setupAnimations',
		value: function setupAnimations() {
			var windowW = _AppStore2['default'].Window.w;

			this.tlIn.from(this.aroundBorder.el, 1, { opacity: 0, ease: Expo.easeInOut }, 0);
			this.tlIn.from(this.aroundBorder.letters, 1, { opacity: 0, ease: Expo.easeInOut }, 0);
			this.tlIn.from(this.imgCGrid.el, 1, { opacity: 0, ease: Expo.easeInOut }, 0);
			this.tlIn.staggerFrom(this.grid.children, 1, { opacity: 0, ease: Expo.easeInOut }, 0.01, 0.1);
			this.tlIn.staggerFrom(this.grid.lines.horizontal, 1, { opacity: 0, ease: Expo.easeInOut }, 0.01, 0.2);
			this.tlIn.staggerFrom(this.grid.lines.vertical, 1, { opacity: 0, ease: Expo.easeInOut }, 0.01, 0.2);
			this.tlIn.from(this.bottomTexts.el, 1, { x: windowW * 0.4, ease: Expo.easeInOut }, 0.5);

			_get(Object.getPrototypeOf(Home.prototype), 'setupAnimations', this).call(this);
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			this.bottomTexts.openTxtById('generic');
			_get(Object.getPrototypeOf(Home.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'triggerNewItem',
		value: function triggerNewItem(type) {
			var index = this.seats[_Utils2['default'].Rand(0, this.seats.length - 1, 0)];
			for (var i = 0; i < this.usedSeats.length; i++) {
				var seat = this.usedSeats[i];
				if (seat == index) {
					if (this.usedSeats.length < this.seats.length - 2) this.triggerNewItem(type);
					return;
				}
			};
			this.usedSeats.push(index);
			this.grid.transitionInItem(index, type);
		}
	}, {
		key: 'onItemEnded',
		value: function onItemEnded(item) {
			for (var i = 0; i < this.usedSeats.length; i++) {
				var usedSeat = this.usedSeats[i];
				if (usedSeat == item.seat) {
					this.usedSeats.splice(i, 1);
				}
			};
		}
	}, {
		key: 'onMouseMove',
		value: function onMouseMove(e) {
			e.preventDefault();
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
			this.mouse.nX = e.clientX / windowW * 1;
			this.mouse.nY = e.clientY / windowH * 1;
		}
	}, {
		key: 'update',
		value: function update() {
			if (!this.transitionInCompleted) return;
			// this.videoTriggerCounter += 1
			// if(this.videoTriggerCounter > 800) {
			// 	this.videoTriggerCounter = 0
			// 	this.triggerNewItem(AppConstants.ITEM_VIDEO)
			// }
			// this.imageTriggerCounter += 1
			// if(this.imageTriggerCounter > 30) {
			// 	this.imageTriggerCounter = 0
			// 	this.triggerNewItem(AppConstants.ITEM_IMAGE)
			// }
			this.imgCGrid.update(this.mouse);
			_get(Object.getPrototypeOf(Home.prototype), 'update', this).call(this);
		}
	}, {
		key: 'resize',
		value: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			var gGrid = (0, _gridPositions2['default'])(windowW, windowH, _AppConstants2['default'].GRID_COLUMNS, _AppConstants2['default'].GRID_ROWS, 'cols_rows');

			this.grid.resize(gGrid);
			this.imgCGrid.resize(gGrid);
			this.bottomTexts.resize();
			this.aroundBorder.resize();
			this.map.resize();

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);

			_get(Object.getPrototypeOf(Home.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_domHand2['default'].event.off(window, 'mousemove', this.onMouseMove);

			this.aroundBorder.clear();
			this.grid.clear();
			this.map.clear();
			this.bottomTexts.clear();

			this.grid = null;
			this.bottomTexts = null;
			this.aroundBorder = null;
			this.map = null;

			_get(Object.getPrototypeOf(Home.prototype), 'componentWillUnmount', this).call(this);
		}
	}]);

	return Home;
})(_Page3['default']);

exports['default'] = Home;
module.exports = exports['default'];

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../around-border-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js","./../bottom-texts-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js","./../grid-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js","./../grid-positions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-positions.js","./../image-to-canvases-grid":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/image-to-canvases-grid.js","./../main-map":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/selfie-stick.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _img = require('img');

var _img2 = _interopRequireDefault(_img);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _Utils = require('./../utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _miniVideo = require('./mini-video');

var _miniVideo2 = _interopRequireDefault(_miniVideo);

var _colorUtils = require('color-utils');

var _colorUtils2 = _interopRequireDefault(_colorUtils);

exports['default'] = function (holder, mouse, data) {

	var scope;
	var isReady = false;
	var screenHolderSize = [0, 0],
	    videoHolderSize = [0, 0],
	    colorifierSize = [0, 0],
	    topOffset = 0;
	var el = _domHand2['default'].select('.selfie-stick-wrapper', holder);
	var background = _domHand2['default'].select('.background', el);
	var screenWrapper = _domHand2['default'].select('.screen-wrapper', el);
	var screenHolder = _domHand2['default'].select('.screen-holder', screenWrapper);
	var videoHolder = _domHand2['default'].select('.video-holder', screenWrapper);
	var colorifier = _domHand2['default'].select('.colorifier', screenWrapper);
	var colorifierSvgPath = _domHand2['default'].select('svg path', colorifier);
	var selfieStickWrapper = _domHand2['default'].select('.selfie-stick-wrapper', el);
	var springTo = _Utils2['default'].SpringTo;
	var translate = _Utils2['default'].Translate;
	var tweenIn;
	var animation = {
		position: { x: 0, y: 0 },
		fposition: { x: 0, y: 0 },
		iposition: { x: 0, y: 0 },
		velocity: { x: 0, y: 0 },
		rotation: 0,
		config: {
			length: 400,
			spring: 0.4,
			friction: 0.7
		}
	};

	TweenMax.set(el, { rotation: '-1deg', transformOrigin: '50% 100%' });

	// check if mix-blend-mode is available
	if ('mix-blend-mode' in colorifier.style) {
		// check if safari because color filter isn't working on it
		if (_AppStore2['default'].Detector.isSafari) {
			colorifier.style['mix-blend-mode'] = 'multiply';
		} else {
			colorifier.style['mix-blend-mode'] = 'color';
		}
	} else {
		colorifierSvgPath.style['opacity'] = 0.8;
	}

	var c = data['ambient-color']['selfie-stick'];
	colorifierSvgPath.style['fill'] = '#' + _colorUtils2['default'].hsvToHex(c.h, c.s, c.v);

	var onVideoEnded = function onVideoEnded() {
		scope.close();
	};
	var mVideo = (0, _miniVideo2['default'])({
		autoplay: false
	});
	mVideo.addTo(videoHolder);
	mVideo.on('ended', onVideoEnded);
	var videoSrc = data['selfie-stick-video-url'];

	var stickImg = (0, _img2['default'])(_AppStore2['default'].baseMediaPath() + 'image/selfiestick.png', function () {
		_domHand2['default'].tree.add(screenHolder, stickImg);
		mVideo.load(videoSrc, function () {
			if (tweenIn != undefined) {
				tweenIn.play();
			}
			isReady = true;
			scope.resize();
		});
	});

	scope = {
		el: el,
		isOpened: false,
		open: function open() {
			animation.config.length = 100, animation.config.spring = 0.9, animation.config.friction = 0.5;
			mVideo.play(0);
			background.style.visibility = 'visible';
			scope.isOpened = true;
		},
		close: function close() {
			animation.config.length = 0, animation.config.spring = 0.6, animation.config.friction = 0.7;
			mVideo.pause(0);
			background.style.visibility = 'hidden';
			scope.isOpened = false;
		},
		update: function update() {

			if (scope.isOpened) {
				animation.fposition.x = animation.iposition.x;
				animation.fposition.y = animation.iposition.y - screenHolderSize[1] * 0.8;
				animation.fposition.x += (mouse.nX - 0.5) * 80;
				animation.fposition.y += (mouse.nY - 0.5) * 30;
			} else {
				animation.fposition.x = animation.iposition.x;
				animation.fposition.y = animation.iposition.y;
				animation.fposition.x += (mouse.nX - 0.5) * 20;
				animation.fposition.y -= (mouse.nY - 0.5) * 20;
			}

			springTo(animation, animation.fposition, 1);

			animation.position.x += (animation.fposition.x - animation.position.x) * 0.1;

			animation.config.length += (0.01 - animation.config.length) * 0.05;

			translate(screenWrapper, animation.position.x, animation.position.y + animation.velocity.y, 1);
		},
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			// if images not ready return
			if (!isReady) return;

			screenWrapper.style.width = windowW * 0.3 + 'px';

			background.style.width = windowW + 'px';
			background.style.height = windowH + 'px';

			screenHolderSize = _domHand2['default'].size(screenHolder);
			videoHolderSize = _domHand2['default'].size(videoHolder);
			colorifierSize = _domHand2['default'].size(colorifier);
			topOffset = windowW / _AppConstants2['default'].MEDIA_GLOBAL_W * 26;
			videoHolder.style.left = (screenHolderSize[0] >> 1) - (videoHolderSize[0] >> 1) + 'px';
			videoHolder.style.top = topOffset + 'px';
			colorifier.style.left = (screenHolderSize[0] >> 1) - colorifierSize[0] * 0.58 + 'px';
			colorifier.style.top = -0.7 + 'px';

			animation.iposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1);
			animation.iposition.y = windowH - videoHolderSize[1] * 0.35;
			animation.position.x = animation.iposition.x;
			animation.position.y = animation.iposition.y;
		},
		transitionInCompleted: function transitionInCompleted() {
			if (!isReady) {
				tweenIn = TweenMax.from(el, 0.6, { y: 500, paused: true, ease: Back.easeOut, force3D: true });
			}
		},
		clear: function clear() {
			mVideo.clear();
			mVideo = null;
			animation = null;
			tweenIn = null;
		}
	};

	scope.close();

	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","color-utils":"color-utils","dom-hand":"dom-hand","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var socialLinks = function socialLinks(parent) {

	var scope;
	var wrapper = _domHand2['default'].select("#footer #social-wrapper", parent);

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var padding = _AppConstants2['default'].PADDING_AROUND * 0.4;

			var wrapperSize = _domHand2['default'].size(wrapper);

			var socialCss = {
				left: windowW - padding - wrapperSize[0],
				top: windowH - padding - wrapperSize[1]
			};

			wrapper.style.left = socialCss.left + 'px';
			wrapper.style.top = socialCss.top + 'px';
		},
		show: function show() {
			setTimeout(function () {
				return _domHand2['default'].classes.remove(wrapper, 'hide');
			}, 1000);
		},
		hide: function hide() {
			setTimeout(function () {
				return _domHand2['default'].classes.add(wrapper, 'hide');
			}, 500);
		}
	};

	return scope;
};

exports['default'] = socialLinks;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _miniVideo = require('./mini-video');

var _miniVideo2 = _interopRequireDefault(_miniVideo);

var videoCanvas = function videoCanvas(props) {

    var scope;
    var intervalId;
    var dx = 0,
        dy = 0,
        dWidth = 0,
        dHeight = 0;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var mVideo = (0, _miniVideo2['default'])({
        autoplay: props.autoplay || false,
        volume: props.volume,
        loop: props.loop
    });

    var onCanPlay = function onCanPlay() {
        scope.isLoaded = true;
        if (props.autoplay) mVideo.play();
        if (dWidth == 0) dWidth = mVideo.width();
        if (dHeight == 0) dHeight = mVideo.height();
        if (mVideo.isPlaying != true) drawOnce();
    };

    var drawOnce = function drawOnce() {
        ctx.drawImage(mVideo.el, dx, dy, dWidth, dHeight);
    };

    var draw = function draw() {
        ctx.drawImage(mVideo.el, dx, dy, dWidth, dHeight);
    };

    var play = function play() {
        mVideo.play();
        clearInterval(intervalId);
        intervalId = setInterval(draw, 1000 / 30);
    };

    var seek = function seek(time) {
        mVideo.currentTime(time);
        drawOnce();
    };

    var timeout = function timeout(cb, ms) {
        setTimeout(function () {
            cb(scope);
        }, ms);
    };

    var pause = function pause() {
        mVideo.pause();
        clearInterval(intervalId);
    };

    var ended = function ended() {
        if (props.loop) play();
        if (props.onEnded != undefined) props.onEnded(scope);
        clearInterval(intervalId);
    };

    var resize = function resize(x, y, w, h) {
        dx = x;
        dy = y;
        dWidth = w;
        dHeight = h;
    };

    var clear = function clear() {
        clearInterval(intervalId);
        mVideo.clearAllEvents();
        ctx.clearRect(0, 0, 0, 0);
    };

    if (props.onEnded != undefined) {
        mVideo.on('ended', ended);
    }

    scope = {
        isLoaded: false,
        canvas: canvas,
        video: mVideo,
        ctx: ctx,
        drawOnce: drawOnce,
        play: play,
        pause: pause,
        seek: seek,
        timeout: timeout,
        resize: resize,
        clear: clear,
        load: function load(src, cb) {
            mVideo.load(src, function () {
                onCanPlay();
                cb();
            });
        }
    };

    return scope;
};

exports['default'] = videoCanvas;
module.exports = exports['default'];

},{"./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = {
	WINDOW_RESIZE: 'WINDOW_RESIZE',
	PAGE_HASHER_CHANGED: 'PAGE_HASHER_CHANGED',
	PAGE_ASSETS_LOADED: 'PAGE_ASSETS_LOADED',

	LANDSCAPE: 'LANDSCAPE',
	PORTRAIT: 'PORTRAIT',

	FORWARD: 'FORWARD',
	BACKWARD: 'BACKWARD',

	HOME: 'HOME',
	DIPTYQUE: 'DIPTYQUE',

	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
	TOP: 'TOP',
	BOTTOM: 'BOTTOM',

	INTERACTIVE: 'INTERACTIVE',
	TRANSITION: 'TRANSITION',

	OPEN_FEED: 'OPEN_FEED',
	OPEN_GRID: 'OPEN_GRID',

	PX_CONTAINER_IS_READY: 'PX_CONTAINER_IS_READY',
	PX_CONTAINER_ADD_CHILD: 'PX_CONTAINER_ADD_CHILD',
	PX_CONTAINER_REMOVE_CHILD: 'PX_CONTAINER_REMOVE_CHILD',

	OPEN_FUN_FACT: 'OPEN_FUN_FACT',
	CLOSE_FUN_FACT: 'CLOSE_FUN_FACT',

	CELL_MOUSE_ENTER: 'CELL_MOUSE_ENTER',
	CELL_MOUSE_LEAVE: 'CELL_MOUSE_LEAVE',

	HOME_VIDEO_SIZE: [640, 360],
	HOME_IMAGE_SIZE: [480, 270],

	ITEM_IMAGE: 'ITEM_IMAGE',
	ITEM_VIDEO: 'ITEM_VIDEO',

	GRID_ROWS: 4,
	GRID_COLUMNS: 7,

	PADDING_AROUND: 40,
	SIDE_EVENT_PADDING: 120,

	ENVIRONMENTS: {
		PREPROD: {
			'static': ''
		},
		PROD: {
			"static": JS_url_static + '/'
		}
	},

	MEDIA_GLOBAL_W: 1920,
	MEDIA_GLOBAL_H: 1080,

	MIN_MIDDLE_W: 960,
	MQ_XSMALL: 320,
	MQ_SMALL: 480,
	MQ_MEDIUM: 768,
	MQ_LARGE: 1024,
	MQ_XLARGE: 1280,
	MQ_XXLARGE: 1680
};
module.exports = exports['default'];

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/dispatchers/AppDispatcher.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var AppDispatcher = (0, _objectAssign2['default'])(new _flux2['default'].Dispatcher(), {
	handleViewAction: function handleViewAction(action) {
		this.dispatch({
			source: 'VIEW_ACTION',
			action: action
		});
	}
});

exports['default'] = AppDispatcher;
module.exports = exports['default'];

},{"flux":"flux","object-assign":"object-assign"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Diptyque.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class='page-wrapper diptyque-page'>\n\n	<div class=\"fun-fact-wrapper\">\n		<div class=\"video-wrapper\"></div>\n		<div class=\"message-wrapper\">\n			<div class=\"message-inner\">\n				"
    + ((stack1 = ((helper = (helper = helpers['fact-txt'] || (depth0 != null ? depth0['fact-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fact-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n			</div>\n		</div>\n		<div class=\"cursor-cross\">\n			<svg width=\"100%\" viewBox=\"0 0 14.105 13.828\">\n				<polygon fill=\"#ffffff\" points=\"13.946,0.838 13.283,0.156 7.035,6.25 0.839,0.156 0.173,0.834 6.37,6.931 0.159,12.99 0.823,13.671 7.07,7.578 13.266,13.671 13.932,12.994 7.736,6.896 \"/>\n			</svg>\n		</div>\n	</div>\n\n	<div class=\"main-btns-wrapper\">\n		<div id='shop-btn' class='main-btn'>\n			<div class=\"img-wrapper\"></div>\n		</div>\n		<div id='fun-fact-btn' class='main-btn'>\n			<div class=\"img-wrapper\"></div>\n		</div>\n	</div>\n\n	<div class=\"selfie-stick-wrapper\">\n		<div class=\"screen-wrapper\">\n			<div class=\"colorifier\">\n				<svg width=\"100%\" viewBox=\"0 0 100 22\">\n					<path d=\"M4.6,1.25c0.001,0,0.045-0.006,0.08,0h0.032c1.212,0.003,36.706-1,36.706-1l25.471,0.549c0.086,0.002,0.172,0.007,0.258,0.017l1.486,0.166C68.711,0.989,68.773,1,68.836,1.036l0.324,0.199c0.052,0.032,0.11,0.049,0.171,0.05l27.043,0.469c0,0,2.624-0.077,2.624,2.933l-0.692,7.96c-0.045,0.518-0.479,0.916-0.999,0.916h-6.203c-0.328,0-0.653,0.034-0.975,0.1c-0.853,0.175-2.83,0.528-5.263,0.618c-0.342,0.014-0.661,0.181-0.872,0.451l-0.5,0.645l-0.28,0.358c-0.374,0.482-0.647,1.034-0.789,1.628c-0.32,1.345-1.398,3.952-4.924,3.958c-3.974,0.005-7.685-0.113-10.612-0.225c-1.189-0.044-2.96,0.229-2.855-1.629l0.36-5.94c0.014-0.219-0.157-0.404-0.376-0.409L29.62,12.488c-0.214-0.004-0.428,0.001-0.641,0.015l-1.753,0.113c-0.208,0.013-0.407,0.085-0.574,0.21c-0.557,0.411-1.897,1.392-2.667,1.859c-0.701,0.426-1.539,1.042-1.968,1.364c-0.183,0.137-0.309,0.335-0.358,0.558l-0.317,1.425c-0.044,0.202-0.004,0.413,0.113,0.583l0.613,0.896c0.212,0.311,0.297,0.699,0.188,1.059c-0.115,0.378-0.444,0.755-1.292,0.755h-7.957c-0.425,0-0.848-0.04-1.266-0.12c-2.543-0.486-10.846-2.661-10.846-10.36C0.896,3.375,4.459,1.25,4.6,1.25\"/>\n				</svg>\n			</div>\n			<div class=\"screen-holder\"></div>\n			<div class=\"video-holder\"></div>\n		</div>\n		<div class=\"background\"></div>\n	</div>\n\n	<div class=\"arrows-wrapper\">\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['previous-page'] || (depth0 != null ? depth0['previous-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-page","hash":{},"data":data}) : helper)))
    + "\" id='left' class=\"arrow left\">\n			\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0 0 32 26\">\n					<polygon fill=\"#FFFFFF\" points=\"21.84,25.184 13.59,25.184 1.048,12.934 13.798,0.768 22.006,0.726 12.507,10.143 31.423,10.06 31.548,15.851 11.882,15.851 \"/>\n					<path fill=\"#010101\" d=\"M13.34,0.265h9.794l-9.648,9.305h18.236v6.91H13.553l9.601,9.259l-9.813-0.02L0.159,12.991L13.34,0.265zM20.707,1.245h-6.971L1.569,12.991L13.736,24.74l6.984,0.014L11.125,15.5h19.617v-4.95H11.058L20.707,1.245z\"/>\n				</svg>\n\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"7.627,0.831 8.307,1.529 1.952,7.727 8.293,13.965 7.61,14.658 0.561,7.724 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
    + alias3(((helper = (helper = helpers['previous-preview-url'] || (depth0 != null ? depth0['previous-preview-url'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-preview-url","hash":{},"data":data}) : helper)))
    + ")\"></div>\n\n		</a>\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['next-page'] || (depth0 != null ? depth0['next-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"next-page","hash":{},"data":data}) : helper)))
    + "\" id='right' class=\"arrow right\">\n\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0 0 32 26\">\n					<polygon fill=\"#FFFFFF\" points=\"10.375,0.818 18.625,0.818 31.167,13.068 18.417,25.235 10.208,25.277 19.708,15.86 0.792,15.943 0.667,10.151 20.333,10.151 \"/>\n					<path fill=\"#010101\" d=\"M18.708,25.738H8.914l9.648-9.305H0.326v-6.91h18.169L8.894,0.265l9.814,0.02l13.181,12.727L18.708,25.738zM11.341,24.757h6.971l12.167-11.746L18.312,1.263l-6.985-0.014l9.596,9.254H1.306v4.95H20.99L11.341,24.757z\"/>\n				</svg>\n\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"1.24,14.658 0.561,13.96 6.915,7.762 0.575,1.525 1.257,0.831 8.307,7.765 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
    + alias3(((helper = (helper = helpers['next-preview-url'] || (depth0 != null ? depth0['next-preview-url'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"next-preview-url","hash":{},"data":data}) : helper)))
    + ")\"></div>\n		</a>\n	</div>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Feed.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, buffer = 
  "	<div data-id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-person=\""
    + alias3(((helper = (helper = helpers.person || (depth0 != null ? depth0.person : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"person","hash":{},"data":data}) : helper)))
    + "\" class=\"post\">\n		<div class=\"top-wrapper\">\n			<div class=\"left\">\n				<img src=\""
    + alias3(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\">\n				<div class=\"title\">"
    + alias3(((helper = (helper = helpers.person || (depth0 != null ? depth0.person : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"person","hash":{},"data":data}) : helper)))
    + "</div>\n			</div>\n			<div class=\"clear-float\"></div>\n			<div class=\"right\">\n				<div class=\"time\">"
    + alias3(((helper = (helper = helpers.time || (depth0 != null ? depth0.time : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"time","hash":{},"data":data}) : helper)))
    + "</div>\n			</div>\n		</div>\n		<div class=\"media-wrapper\">\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1['is-video'] : stack1),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1['is-video'] : stack1),{"name":"if","hash":{},"fn":this.noop,"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "		</div>\n		<div class=\"icons-wrapper\">\n			\n		</div>\n		<div class=\"comments-wrapper\">\n";
  stack1 = ((helper = (helper = helpers.comments || (depth0 != null ? depth0.comments : depth0)) != null ? helper : alias1),(options={"name":"comments","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.comments) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n	</div>\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1;

  return "				<div class='video-wrapper'>\n					<div class=\"wistia_embed wistia_async_"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1.url : stack1), depth0))
    + " playerColor=1eea79 playbar=false smallPlayButton=false volumeControl=false fullscreenButton=false\" style=\"width:100%; height:100%;\">&nbsp;</div>\n				</div>\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "				<div class='image-wrapper'>\n					<img src=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1.url : stack1), depth0))
    + "\">\n				</div>\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function";

  return "				<div class=\"comment\">\n    				<div class=\"name\">"
    + this.escapeExpression(((helper = (helper = helpers['person-name'] || (depth0 != null ? depth0['person-name'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"person-name","hash":{},"data":data}) : helper)))
    + "</div>\n    				<div class=\"text\">"
    + ((stack1 = ((helper = (helper = helpers['person-text'] || (depth0 != null ? depth0['person-text'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"person-text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n				</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.feed : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/FrontContainer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing, alias4="function";

  return "<div>\n	\n	<header id=\"header\">\n			<a href=\"http://www.camper.com/\" target=\"_blank\" class=\"logo\">\n				<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n			</a>\n			<div class=\"map-btn\"><a href=\"#!/landing\" class=\"simple-text-btn\"><div class=\"text-wrap\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.map_txt : stack1), depth0))
    + "</div></a></div>\n			<div class=\"camper-lab\"><a target=\"_blank\" href=\""
    + alias2(((helper = (helper = helpers.labUrl || (depth0 != null ? depth0.labUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"labUrl","hash":{},"data":data}) : helper)))
    + "\" class=\"simple-text-btn\"><div class=\"text-wrap\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.camper_lab : stack1), depth0))
    + "</div></a></div>\n			<div class=\"shop-wrapper btn\">\n				<div class=\"shop-title simple-text-btn\"><div class=\"text-wrap\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
    + "</div></div>\n				<ul class=\"submenu-wrapper\">\n					<li class=\"sub-0\"><a target=\"_blank\" href='"
    + alias2(((helper = (helper = helpers.menShopUrl || (depth0 != null ? depth0.menShopUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"menShopUrl","hash":{},"data":data}) : helper)))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_men : stack1), depth0))
    + "</a></li>\n					<li class=\"sub-1\"><a target=\"_blank\" href='"
    + alias2(((helper = (helper = helpers.womenShopUrl || (depth0 != null ? depth0.womenShopUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"womenShopUrl","hash":{},"data":data}) : helper)))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_women : stack1), depth0))
    + "</a></li>\n				</ul>\n			</div>\n		</header>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Home.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    return "			<div></div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.horizontal || (depth0 != null ? depth0.horizontal : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"horizontal","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.horizontal) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"4":function(depth0,helpers,partials,data) {
    return "					<div></div>\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.vertical || (depth0 != null ? depth0.vertical : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"vertical","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.vertical) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, alias4=this.escapeExpression, buffer = 
  "<div class='page-wrapper home-page'>\n	<div class=\"grid-background-container\"></div>\n	<div class=\"grid-front-container\">\n";
  stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(options={"name":"grid","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.grid) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "	</div>\n	<div class=\"grid-container\">\n";
  stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(options={"name":"grid","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.grid) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "	</div>\n	<div class=\"lines-grid-container\">\n		<div class=\"horizontal-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "		</div>\n		<div class=\"vertical-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias3.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n	</div>\n	<div class=\"bottom-texts-container\">\n\n		<div class=\"titles-wrapper\">\n			<ul>\n				<li id='deia'>DEIA</li>\n				<li id='arelluf'>ARELLUF</li>\n				<li id='es-trenc'>ES TRENC</li>\n			</ul>\n		</div>\n\n		<div class=\"texts-wrapper\">\n			<div class='txt' id=\"generic\">"
    + ((stack1 = ((helper = (helper = helpers.generic || (depth0 != null ? depth0.generic : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"generic","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"deia\">"
    + ((stack1 = ((helper = (helper = helpers['deia-txt'] || (depth0 != null ? depth0['deia-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"deia-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"arelluf\">"
    + ((stack1 = ((helper = (helper = helpers['arelluf-txt'] || (depth0 != null ? depth0['arelluf-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"arelluf-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"es-trenc\">"
    + ((stack1 = ((helper = (helper = helpers['es-trenc-txt'] || (depth0 != null ? depth0['es-trenc-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"es-trenc-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n		</div>\n\n		<div id=\"social-wrapper\">\n			<ul>\n				<li class='instagram'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.instagramUrl || (depth0 != null ? depth0.instagramUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"instagramUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M16.107,15.562c0,0.302-0.243,0.547-0.543,0.547H2.438c-0.302,0-0.547-0.245-0.547-0.547V7.359h2.188c-0.285,0.41-0.381,1.175-0.381,1.661c0,2.929,2.388,5.312,5.323,5.312c2.935,0,5.322-2.383,5.322-5.312c0-0.486-0.066-1.24-0.42-1.661h2.186V15.562L16.107,15.562z M9.02,5.663c1.856,0,3.365,1.504,3.365,3.358c0,1.854-1.509,3.357-3.365,3.357c-1.857,0-3.365-1.504-3.365-3.357C5.655,7.167,7.163,5.663,9.02,5.663L9.02,5.663z M12.828,2.984c0-0.301,0.244-0.546,0.545-0.546h1.643c0.3,0,0.549,0.245,0.549,0.546v1.641c0,0.302-0.249,0.547-0.549,0.547h-1.643c-0.301,0-0.545-0.245-0.545-0.547V2.984L12.828,2.984z M15.669,0.25H2.33c-1.148,0-2.08,0.929-2.08,2.076v13.349c0,1.146,0.932,2.075,2.08,2.075h13.339c1.15,0,2.081-0.93,2.081-2.075V2.326C17.75,1.179,16.819,0.25,15.669,0.25L15.669,0.25z\"/>\n					</a>\n				</li>\n				<li class='twitter'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.twitterUrl || (depth0 != null ? depth0.twitterUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"twitterUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 22 18\" enable-background=\"new 0 0 22 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M21.176,0.514c-0.854,0.509-1.799,0.879-2.808,1.079c-0.805-0.865-1.953-1.405-3.226-1.405c-2.438,0-4.417,1.992-4.417,4.449c0,0.349,0.038,0.688,0.114,1.013C7.166,5.464,3.91,3.695,1.729,1c-0.38,0.66-0.598,1.425-0.598,2.24c0,1.543,0.78,2.904,1.966,3.704C2.374,6.92,1.691,6.718,1.094,6.388v0.054c0,2.157,1.523,3.957,3.547,4.363c-0.371,0.104-0.762,0.157-1.165,0.157c-0.285,0-0.563-0.027-0.833-0.08c0.563,1.767,2.194,3.054,4.128,3.089c-1.512,1.194-3.418,1.906-5.489,1.906c-0.356,0-0.709-0.021-1.055-0.062c1.956,1.261,4.28,1.997,6.775,1.997c8.131,0,12.574-6.778,12.574-12.659c0-0.193-0.004-0.387-0.012-0.577c0.864-0.627,1.613-1.411,2.204-2.303c-0.791,0.354-1.644,0.593-2.537,0.701C20.146,2.424,20.847,1.553,21.176,0.514\"/>\n					</a>\n				</li>\n				<li class='facebook'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.facebookUrl || (depth0 != null ? depth0.facebookUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"facebookUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M17.719,16.756c0,0.531-0.431,0.963-0.962,0.963h-4.443v-6.753h2.267l0.338-2.631h-2.604V6.654c0-0.762,0.211-1.281,1.304-1.281l1.394,0V3.019c-0.241-0.032-1.068-0.104-2.031-0.104c-2.009,0-3.385,1.227-3.385,3.479v1.941H7.322v2.631h2.272v6.753H1.243c-0.531,0-0.962-0.432-0.962-0.963V1.243c0-0.531,0.431-0.962,0.962-0.962h15.514c0.531,0,0.962,0.431,0.962,0.962V16.756\"/>\n					</a>\n				</li>\n			</ul>\n		</div>\n\n		<div class=\"background\"></div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n	</div>\n\n	<div class=\"map-wrapper\"></div>	\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"titles-wrapper\">\n	<div class=\"deia\">DEIA</div>\n	<div class=\"es-trenc\">ES TRENC</div>\n	<div class=\"arelluf\">ARELLUF</div>\n</div>\n\n<svg width=\"100%\" viewBox=\"-67 0 760 645\">\n	\n	\n	<path id=\"map-bg\" stroke=\"#FFFFFF\" stroke-width=\"2\" fill=\"#ffffff\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n	\n	<text x=\"364\" y=\"242\">A VISION OF</text>\n	<g transform=\"translate(300, 258)\"><path fill=\"#1eea79\" d=\"M87.884,1.001c-0.798,0.294-17.53,13.617-37.763,40.758c-5.892,8.472-9.319,14.607-6.895,15.53c2.239,0.838,4.49,1.636,6.75,2.396c0.617,0.207,0.942,0.231,1.182-0.186c0.557-1.071,1.02-7.933,4.357-13.306c4.809-7.73,11.214-7.384,14.873-6.612c1.808,0.397,2.969,2.006,1.463,5.342c-3.764,8.489-10.8,14.884-11.856,16.875c-0.537,1.09,0.965,1.269,1.397,1.386c1.794,0.498,3.595,0.973,5.398,1.425c1.439,0.361,2.761,2.927,10.788-17.359C90.83,11.637,88.539,0.857,87.884,1.001z M75.532,29.835c-3.243-0.57-7.874,0.491-8.566,0.324c-0.451-0.1-0.426-0.641,0.066-1.467c3.137-4.913,13.042-15.486,14.604-15.42c1.115,0.073-1.018,9.869-3.069,14.477C77.604,29.807,76.834,30.073,75.532,29.835z M98.739,68.951c-0.312,1.622-1.769,1.056-2.36,0.988c-6.699-0.752-13.365-1.799-19.979-3.149c-2.642-0.382-0.879-2.917,4.602-18.571c3.99-10.203,18.572-45.671,19.141-45.754c1.483,0.044,2.968,0.088,4.451,0.132c0.196,0.005,0.487,0.175,0.101,1.605c-0.287,1.813-8.796,18.592-15.883,40.115c-3.437,10.804-1.474,13.858,1.073,14.221c4.291,0.616,8.361-5.968,9.416-5.864C100.06,52.746,98.76,68.537,98.739,68.951z M125.874,70.104c-0.026,1.637-1.564,1.252-2.161,1.254c-6.75,0.049-13.496-0.194-20.215-0.735c-2.656-0.055-1.371-2.84,1.266-19.352c2.124-10.848,10.242-48.339,10.802-48.355c1.483,0.043,2.967,0.083,4.451,0.125c0.196,0.006,0.517,0.179,0.385,1.653c0.031,1.817-5.439,19.313-8.64,41.844c-1.489,11.277,0.977,14.13,3.55,14.212c4.335,0.133,7.208-6.848,8.27-6.842C124.346,53.915,125.823,69.701,125.874,70.104z M137.079,2.277c-4.592-0.223-8.78,23.183-9.392,44.239c-0.239,14.117,3.586,26.076,13.939,25.24c1.67-0.142,3.339-0.302,5.008-0.479c10.334-1.208,11.75-13.268,8.699-26.573C150.542,24.978,141.677,2.614,137.079,2.277z M142.675,57.229c-4.864,0.391-7.912-3.161-8.294-12.669c-0.618-17.988,2.042-29.276,4.024-29.269c1.981,0.029,6.912,10.986,9.903,28.391C149.837,52.908,147.537,56.824,142.675,57.229z M172.615,33.994c-0.75-2.012,3.379-6.399-2.047-17.234c-2.852-5.767-7.591-12.702-12.671-12.868c-2.469-0.039-4.939-0.082-7.409-0.128c-0.488-0.005-2.159-1.466,6.968,36.481c6.962,28.793,8.14,27.042,9.366,26.806c1.904-0.369,3.806-0.76,5.703-1.174c0.488-0.106,1.836-0.011,1.428-1.271c-0.205-0.496-5.167-10.32-6.865-16.02c-1.248-4.196,0.768-7.719,1.958-7.919c2.188-0.287,11.339,13.509,14.779,21.428c0.463,1.138,1.886,0.513,2.759,0.264c1.828-0.515,3.652-1.054,5.471-1.615c1.014-0.311,1.14-0.511,0.769-1.253C184.54,43.788,173.257,36.133,172.615,33.994z M163.047,32.429c-1.137,0.146-2.083-2.842-2.562-4.411c-3.939-12.948-3.467-15.445-0.68-15.546c1.653-0.06,4.131,1.495,5.981,5.957C168.639,24.872,164.461,32.217,163.047,32.429z M212.462,37.072c7.293,7.791,6.122,14.986-0.657,17.809c-11.172,4.633-23.415-7.799-30.156-21.471c-7.205-14.782-11.936-30.709-5.689-30.193c2.352,0.097,7.79,2.205,13.103,7.905c2.824,3.096,3.107,5.102,1.016,5.459c-1.327,0.189-3.905-5.323-7.809-4.971c-4.348,0.26-0.58,9.946,4.146,18c7.198,12.336,15.941,15.36,19.8,13.89c7.153-2.697,0.669-10.89,1.022-10.97C207.784,32.355,211.974,36.541,212.462,37.072z M239.422,23.489C209.694,9.329,193.988,3.845,193.291,3.493c-0.836-0.53,1.381,9.166,21.855,32.466c6.462,6.777,11.587,11.17,13.958,9.976c2.19-1.09,4.366-2.215,6.528-3.372c0.591-0.317,0.807-0.509,0.479-0.782c-0.855-0.629-8.328-3.118-12.492-6.948c-6-5.509-1.29-8.367,2.162-9.847c1.713-0.721,4.361-0.8,7.072,0.875c6.914,4.179,9.533,9.94,11.117,11.135c0.875,0.604,1.992-0.285,2.39-0.526c1.656-0.997,3.304-2.014,4.942-3.052C252.611,32.604,256.22,32.191,239.422,23.489z M218.204,19.43c-3.098,1.038-5.165,3.33-5.839,3.564c-0.437,0.144-1.069-0.103-1.715-0.666c-3.793-3.602-9.015-11.559-7.475-11.638c1.106-0.069,11.122,4.567,14.875,6.842C219.716,18.608,219.447,19.002,218.204,19.43z M53.062,31.961C35.458,55.825,34.91,53.996,33.756,53.504c-1.975-0.843-3.942-1.719-5.897-2.623c-0.551-0.252-1.807-0.598-0.872-1.647c0.789-0.739,12.531-10.264,25.624-26.005c1.065-1.252,7.374-8.602,6.308-8.791c-0.914-0.141-7.368,5.298-9.016,6.54c-13.956,10.691-17.966,16.11-20.648,14.998c-3.374-1.449,2.999-6.173,11.668-17.603c0.91-1.242,5.738-6.506,4.77-6.691c-1.048-0.222-8.439,5.527-9.704,6.515C20.147,30.25,12.102,40.352,11.343,41.127c-1.062,0.881-1.949,0.118-2.477-0.193c-1.573-0.926-3.137-1.873-4.692-2.84c-1.087-0.67-3.621-0.762,19.961-16.68C55.233,0.499,55.469,1.151,55.952,1.179c0.857,0.021,1.713,0.044,2.57,0.067c1.104,0.05,1.438-0.022-1.017,3.473c-4.623,6.894-8.271,11.144-7.653,11.237C50.293,16,54.759,12.398,64.75,5.362c5.195-3.799,5.493-3.812,6.603-3.758c0.728,0.021,1.454,0.042,2.182,0.062C74.02,1.69,76.217,0.487,53.062,31.961z\"/></g>\n\n	<g id=\"footsteps\">\n		<g id=\"dub-mateo\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n		</g>\n		<g id=\"mateo-beluga\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n		</g>\n		<g id=\"beluga-isamu\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n		</g>\n		<g id=\"isamu-capas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n		</g>\n		<g id=\"capas-pelotas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n		</g>\n		<g id=\"pelotas-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n		</g>\n		<g id=\"marta-kobarah\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n		</g>\n		<g id=\"kobarah-dub\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n		</g>\n		<g id=\"dub-paradise\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n		</g>\n		<g id=\"return-to-begin\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n		</g>\n	</g>\n\n	<g id=\"map-dots\">\n		<g id=\"deia\">\n			<g transform=\"translate(210, 170)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(240, 146)\"><circle id=\"mateo\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(260, 214)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"es-trenc\">\n			<g transform=\"translate(426, 478)\"><circle id=\"isamu\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(400, 446)\"><circle id=\"beluga\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"arelluf\">\n			<g transform=\"translate(121, 364)\"><circle id=\"capas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(126, 340)\"><circle id=\"pelotas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(137, 318)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 326)\"><circle id=\"kobarah\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 300)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(80, 315)\"><circle id=\"paradise\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n	</g>\n\n</svg>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div>\n	<header>\n		<a href=\"http://www.camper.com/\" target=\"_blank\" class=\"logo\">\n			<svg width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n		</a>\n	</header>\n	\n	<div class=\"main-container\">\n		<div class=\"feed\">\n		</div>\n		<div class=\"bottom-part\"></div>\n	</div>\n\n	<footer>\n		\n		<ul>\n			<li id='home'>\n				<div class=\"wrapper\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.home : stack1), depth0))
    + "</div>\n			</li>\n			<li id='grid'>\n				<div class=\"wrapper\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.grid : stack1), depth0))
    + "</div>\n			</li>\n			<li id='com' class='com'>\n				<div class=\"wrapper\">\n					<svg width=\"100%\" viewBox=\"0 0 35 17\">\n						<path fill=\"#FFFFFF\" d=\"M17.415,11.203c6.275,0,12.009,2.093,16.394,5.547V0.232H1v16.535C5.387,13.303,11.129,11.203,17.415,11.203\"/>\n					</svg>\n				</div>\n			</li>\n			<li id='lab'>\n				<div class=\"wrapper\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.lab : stack1), depth0))
    + "</div>\n			</li>\n			<li id='shop'>\n				<div class=\"wrapper\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
    + "</div>\n			</li>\n		</ul>\n\n	</footer>\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"front-block\"></div>\n<div id='pages-container'>\n	<div id='page-a'></div>\n	<div id='page-b'></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/TransitionMap.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"map-wrapper\">\n	\n</div>	";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/GlobalEvents.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var GlobalEvents = (function () {
	function GlobalEvents() {
		_classCallCheck(this, GlobalEvents);
	}

	_createClass(GlobalEvents, [{
		key: 'init',
		value: function init() {
			_domHand2['default'].event.on(window, 'resize', this.resize);
		}
	}, {
		key: 'resize',
		value: function resize() {
			_AppActions2['default'].windowResize(window.innerWidth, window.innerHeight);
		}
	}]);

	return GlobalEvents;
})();

exports['default'] = GlobalEvents;
module.exports = exports['default'];

},{"./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Preloader.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var Preloader = (function () {
	function Preloader() {
		_classCallCheck(this, Preloader);

		this.queue = new createjs.LoadQueue(false);
		this.queue.on("complete", this.onManifestLoadCompleted, this);
		this.currentLoadedCallback = undefined;
		this.allManifests = [];
	}

	_createClass(Preloader, [{
		key: "load",
		value: function load(manifest, onLoaded) {

			if (this.allManifests.length > 0) {
				for (var i = 0; i < this.allManifests.length; i++) {
					var m = this.allManifests[i];
					if (m.length == manifest.length && m[0].id == manifest[0].id && m[m.length - 1].id == manifest[manifest.length - 1].id) {
						onLoaded();
						return;
					}
				};
			}

			this.allManifests.push(manifest);
			this.currentLoadedCallback = onLoaded;
			this.queue.loadManifest(manifest);
		}
	}, {
		key: "onManifestLoadCompleted",
		value: function onManifestLoadCompleted() {
			this.currentLoadedCallback();
		}
	}, {
		key: "getContentById",
		value: function getContentById(id) {
			return this.queue.getResult(id);
		}
	}, {
		key: "getImageURL",
		value: function getImageURL(id) {
			return this.getContentById(id).getAttribute("src");
		}
	}, {
		key: "getImageSize",
		value: function getImageSize(id) {
			var content = this.getContentById(id);
			return { width: content.width, height: content.height };
		}
	}]);

	return Preloader;
})();

exports["default"] = Preloader;
module.exports = exports["default"];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _hasher = require('hasher');

var _hasher2 = _interopRequireDefault(_hasher);

var _AppActions = require('./../actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var _crossroads = require('crossroads');

var _crossroads2 = _interopRequireDefault(_crossroads);

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _GlobalData = require('./../../../../www/data/data.json');

var _GlobalData2 = _interopRequireDefault(_GlobalData);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var Router = (function () {
	function Router() {
		_classCallCheck(this, Router);
	}

	_createClass(Router, [{
		key: 'init',
		value: function init() {
			this.routing = _GlobalData2['default'].routing;
			this.setupRoutes();
			this.firstPass = true;
			this.newHashFounded = false;
			_hasher2['default'].newHash = undefined;
			_hasher2['default'].oldHash = undefined;
			_hasher2['default'].initialized.add(this.didHasherChange.bind(this));
			_hasher2['default'].changed.add(this.didHasherChange.bind(this));
			this.setupCrossroads();
		}
	}, {
		key: 'beginRouting',
		value: function beginRouting() {
			_hasher2['default'].init();
		}
	}, {
		key: 'setupCrossroads',
		value: function setupCrossroads() {
			var routes = _hasher2['default'].routes;
			for (var i = 0; i < routes.length; i++) {
				var route = routes[i];
				_crossroads2['default'].addRoute(route, this.onParseUrl.bind(this));
			};
			_crossroads2['default'].addRoute('', this.onParseUrl.bind(this));
		}
	}, {
		key: 'onParseUrl',
		value: function onParseUrl() {
			this.assignRoute();
		}
	}, {
		key: 'onDefaultURLHandler',
		value: function onDefaultURLHandler() {
			this.sendToDefault();
		}
	}, {
		key: 'assignRoute',
		value: function assignRoute(id) {
			var hash = _hasher2['default'].getHash();
			var parts = this.getURLParts(hash);
			this.updatePageRoute(hash, parts, parts[0], parts[1] == undefined ? '' : parts[1]);
			this.newHashFounded = true;
		}
	}, {
		key: 'getURLParts',
		value: function getURLParts(url) {
			var hash = url;
			return hash.split('/');
		}
	}, {
		key: 'updatePageRoute',
		value: function updatePageRoute(hash, parts, parent, target) {
			_hasher2['default'].oldHash = _hasher2['default'].newHash;
			_hasher2['default'].newHash = {
				hash: hash,
				parts: parts,
				parent: parent,
				target: target
			};
			_hasher2['default'].newHash.type = _hasher2['default'].newHash.hash == '' ? _AppConstants2['default'].HOME : _AppConstants2['default'].DIPTYQUE;
			// If first pass send the action from App.js when all assets are ready
			if (this.firstPass) {
				this.firstPass = false;
			} else {
				_AppActions2['default'].pageHasherChanged();
			}
		}
	}, {
		key: 'didHasherChange',
		value: function didHasherChange(newHash, oldHash) {
			this.newHashFounded = false;
			_crossroads2['default'].parse(newHash);
			if (this.newHashFounded) return;
			// If URL don't match a pattern, send to default
			this.onDefaultURLHandler();
		}
	}, {
		key: 'sendToDefault',
		value: function sendToDefault() {
			_hasher2['default'].setHash(_AppStore2['default'].defaultRoute());
		}
	}, {
		key: 'setupRoutes',
		value: function setupRoutes() {
			_hasher2['default'].routes = [];
			_hasher2['default'].diptyqueRoutes = [];
			var i = 0,
			    k;
			for (k in this.routing) {
				_hasher2['default'].routes[i] = k;
				if (k.length > 2) _hasher2['default'].diptyqueRoutes.push(k);
				i++;
			}
		}
	}], [{
		key: 'getBaseURL',
		value: function getBaseURL() {
			return document.URL.split("#")[0];
		}
	}, {
		key: 'getHash',
		value: function getHash() {
			return _hasher2['default'].getHash();
		}
	}, {
		key: 'getRoutes',
		value: function getRoutes() {
			return _hasher2['default'].routes;
		}
	}, {
		key: 'getDiptyqueRoutes',
		value: function getDiptyqueRoutes() {
			return _hasher2['default'].diptyqueRoutes;
		}
	}, {
		key: 'getNewHash',
		value: function getNewHash() {
			return _hasher2['default'].newHash;
		}
	}, {
		key: 'getOldHash',
		value: function getOldHash() {
			return _hasher2['default'].oldHash;
		}
	}, {
		key: 'setHash',
		value: function setHash(hash) {
			_hasher2['default'].setHash(hash);
		}
	}]);

	return Router;
})();

exports['default'] = Router;
module.exports = exports['default'];

},{"./../../../../www/data/data.json":"/Users/panagiotisthomoglou/Projects/camper-ss16/www/data/data.json","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","crossroads":"crossroads","hasher":"hasher"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppDispatcher = require('./../dispatchers/AppDispatcher');

var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _eventemitter2 = require('eventemitter2');

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _GlobalData = require('./../../../../www/data/data.json');

var _GlobalData2 = _interopRequireDefault(_GlobalData);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

function _getContentScope() {
    var hashObj = _Router2['default'].getNewHash();
    return AppStore.getRoutePathScopeById(hashObj.hash);
}
function _getPageAssetsToLoad() {
    var scope = _getContentScope();
    var hashObj = _Router2['default'].getNewHash();
    var type = _getTypeOfPage();
    var manifest;

    if (type != _AppConstants2['default'].HOME) {
        var filenames = ['character.png', 'character-bg.jpg', 'shoe-bg.jpg'];
        manifest = _addBasePathsToUrls(filenames, hashObj.parent, hashObj.target, type);
    }

    // In case of extra assets
    if (scope.assets != undefined) {
        var assets = scope.assets;
        var assetsManifest;
        if (type == _AppConstants2['default'].HOME) {
            assetsManifest = _addBasePathsToUrls(assets, 'home', hashObj.target, type);
        } else {
            assetsManifest = _addBasePathsToUrls(assets, hashObj.parent, hashObj.target, type);
        }
        manifest = manifest == undefined ? assetsManifest : manifest.concat(assetsManifest);
    }

    return manifest;
}
function _addBasePathsToUrls(urls, pageId, targetId, type) {
    var basePath = type == _AppConstants2['default'].HOME ? _getHomePageAssetsBasePath() : _getPageAssetsBasePathById(pageId, targetId);
    var manifest = [];
    for (var i = 0; i < urls.length; i++) {
        var splitter = urls[i].split('.');
        var fileName = splitter[0];
        var extension = splitter[1];
        var id = pageId + '-';
        if (targetId) id += targetId + '-';
        id += fileName;
        manifest[i] = {
            id: id,
            src: basePath + fileName + _getImageExtensionByDeviceRatio() + '.' + extension
        };
    }
    return manifest;
}
function _getPageAssetsBasePathById(id, assetGroupId) {
    return AppStore.baseMediaPath() + 'image/diptyque/' + id + '/' + assetGroupId + '/';
}
function _getHomePageAssetsBasePath() {
    return AppStore.baseMediaPath() + 'image/home/';
}
function _getImageExtensionByDeviceRatio() {
    // return '@' + _getDeviceRatio() + 'x'
    return '';
}
function _getDeviceRatio() {
    var scale = window.devicePixelRatio == undefined ? 1 : window.devicePixelRatio;
    return scale > 1 ? 2 : 1;
}
function _getTypeOfPage(hash) {
    var h = hash || _Router2['default'].getNewHash();
    if (h.parts.length == 2) return _AppConstants2['default'].DIPTYQUE;else return _AppConstants2['default'].HOME;
}
function _getPageContent() {
    var hashObj = _Router2['default'].getNewHash();
    var hash = hashObj.hash.length < 1 ? '/' : hashObj.hash;
    var content = _GlobalData2['default'].routing[hash];
    return content;
}
function _getContentByLang(lang) {
    return _GlobalData2['default'].content.lang[lang];
}
function _getGlobalContent() {
    return _getContentByLang(AppStore.lang());
}
function _getAppData() {
    return _GlobalData2['default'];
}
function _getDefaultRoute() {
    return _GlobalData2['default']['default-route'];
}
function _windowWidthHeight() {
    return {
        w: window.innerWidth,
        h: window.innerHeight
    };
}
function _getDiptyqueShoes() {
    var hashObj = _Router2['default'].getNewHash();
    var baseurl = _getPageAssetsBasePathById(hashObj.parent, hashObj.target);
    return _getContentScope().shoes;
}

var AppStore = (0, _objectAssign2['default'])({}, _eventemitter2.EventEmitter2.prototype, {
    emitChange: function emitChange(type, item) {
        this.emit(type, item);
    },
    pageContent: function pageContent() {
        return _getPageContent();
    },
    appData: function appData() {
        return _getAppData();
    },
    defaultRoute: function defaultRoute() {
        return _getDefaultRoute();
    },
    globalContent: function globalContent() {
        return _getGlobalContent();
    },
    pageAssetsToLoad: function pageAssetsToLoad() {
        return _getPageAssetsToLoad();
    },
    getRoutePathScopeById: function getRoutePathScopeById(id) {
        id = id.length < 1 ? '/' : id;
        return _GlobalData2['default'].routing[id];
    },
    baseMediaPath: function baseMediaPath() {
        return AppStore.getEnvironment()['static'];
    },
    getPageAssetsBasePathById: function getPageAssetsBasePathById(parent, target) {
        return _getPageAssetsBasePathById(parent, target);
    },
    getEnvironment: function getEnvironment() {
        return _AppConstants2['default'].ENVIRONMENTS[ENV];
    },
    getTypeOfPage: function getTypeOfPage(hash) {
        return _getTypeOfPage(hash);
    },
    getHomeVideos: function getHomeVideos() {
        return _GlobalData2['default']['home-videos'];
    },
    generalInfos: function generalInfos() {
        return _GlobalData2['default'].content;
    },
    diptyqueShoes: function diptyqueShoes() {
        return _getDiptyqueShoes();
    },
    getNextDiptyque: function getNextDiptyque() {
        var hashObj = _Router2['default'].getNewHash();
        var routes = _Router2['default'].getDiptyqueRoutes();
        var current = hashObj.hash;
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (route == current) {
                var index = i + 1 > routes.length - 1 ? 0 : i + 1;
                return routes[index];
            }
        };
    },
    getPreviousDiptyque: function getPreviousDiptyque() {
        var hashObj = _Router2['default'].getNewHash();
        var routes = _Router2['default'].getDiptyqueRoutes();
        var current = hashObj.hash;
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (route == current) {
                var index = i - 1 < 0 ? routes.length - 1 : i - 1;
                return routes[index];
            }
        };
    },
    getDiptyquePageIndex: function getDiptyquePageIndex() {
        var hashObj = _Router2['default'].getNewHash();
        var routes = _Router2['default'].getDiptyqueRoutes();
        var current = hashObj.hash;
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            if (route == current) {
                return i;
            }
        };
    },
    getPreviewUrlByHash: function getPreviewUrlByHash(hash) {
        return AppStore.baseMediaPath() + 'image/diptyque/' + hash + '/preview.gif';
    },
    getFeed: function getFeed() {
        return _GlobalData2['default'].feed;
    },
    lang: function lang() {
        var defaultLang = true;
        for (var i = 0; i < _GlobalData2['default'].langs.length; i++) {
            var lang = _GlobalData2['default'].langs[i];
            if (lang == JS_lang) {
                defaultLang = false;
            }
        };
        return defaultLang == true ? 'en' : JS_lang;
    },
    Window: function Window() {
        return _windowWidthHeight();
    },
    addPXChild: function addPXChild(item) {
        AppStore.PXContainer.add(item.child);
    },
    removePXChild: function removePXChild(item) {
        AppStore.PXContainer.remove(item.child);
    },
    Parent: undefined,
    Canvas: undefined,
    FrontBlock: undefined,
    Orientation: _AppConstants2['default'].LANDSCAPE,
    Detector: {
        isMobile: undefined
    },
    dispatcherIndex: _AppDispatcher2['default'].register(function (payload) {
        var action = payload.action;
        switch (action.actionType) {
            case _AppConstants2['default'].WINDOW_RESIZE:
                AppStore.Window.w = action.item.windowW;
                AppStore.Window.h = action.item.windowH;
                AppStore.Orientation = AppStore.Window.w > AppStore.Window.h ? _AppConstants2['default'].LANDSCAPE : _AppConstants2['default'].PORTRAIT;
                AppStore.emitChange(action.actionType);
                break;
            default:
                AppStore.emitChange(action.actionType, action.item);
                break;
        }
        return true;
    })
});

exports['default'] = AppStore;
module.exports = exports['default'];

},{"./../../../../www/data/data.json":"/Users/panagiotisthomoglou/Projects/camper-ss16/www/data/data.json","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../dispatchers/AppDispatcher":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/dispatchers/AppDispatcher.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","eventemitter2":"eventemitter2","object-assign":"object-assign"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/PxHelper.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var PxHelper = {

    getPXVideo: function getPXVideo(url, width, height, vars) {
        var texture = PIXI.Texture.fromVideo(url);
        texture.baseTexture.source.setAttribute("loop", true);
        var videoSprite = new PIXI.Sprite(texture);
        videoSprite.width = width;
        videoSprite.height = height;
        return videoSprite;
    },

    removeChildrenFromContainer: function removeChildrenFromContainer(container) {
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            container.removeChild(child);
        };
    },

    getFrameImagesArray: function getFrameImagesArray(frames, baseurl, ext) {
        var array = [];
        for (var i = 0; i <= frames; i++) {
            var url = baseurl + i + '.' + ext;
            array[i] = url;
        };
        return array;
    }

};

exports['default'] = PxHelper;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var Utils = (function () {
	function Utils() {
		_classCallCheck(this, Utils);
	}

	_createClass(Utils, null, [{
		key: 'NormalizeMouseCoords',
		value: function NormalizeMouseCoords(e, objWrapper) {
			var posx = 0;
			var posy = 0;
			if (!e) var e = window.event;
			if (e.pageX || e.pageY) {
				posx = e.pageX;
				posy = e.pageY;
			} else if (e.clientX || e.clientY) {
				posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			objWrapper.x = posx;
			objWrapper.y = posy;
			return objWrapper;
		}
	}, {
		key: 'ResizePositionProportionally',
		value: function ResizePositionProportionally(windowW, windowH, contentW, contentH, orientation) {
			var aspectRatio = contentW / contentH;
			if (orientation !== undefined) {
				if (orientation == _AppConstants2['default'].LANDSCAPE) {
					var scale = windowW / contentW * 1;
				} else {
					var scale = windowH / contentH * 1;
				}
			} else {
				var scale = windowW / windowH < aspectRatio ? windowH / contentH * 1 : windowW / contentW * 1;
			}
			var newW = contentW * scale;
			var newH = contentH * scale;
			var css = {
				width: newW,
				height: newH,
				left: (windowW >> 1) - (newW >> 1),
				top: (windowH >> 1) - (newH >> 1),
				scale: scale
			};

			return css;
		}
	}, {
		key: 'CapitalizeFirstLetter',
		value: function CapitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	}, {
		key: 'SupportWebGL',
		value: function SupportWebGL() {
			try {
				var canvas = document.createElement('canvas');
				return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
			} catch (e) {
				return false;
			}
		}
	}, {
		key: 'DestroyVideo',
		value: function DestroyVideo(video) {
			video.pause();
			video.src = '';
			var children = video.childNodes;
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				child.setAttribute('src', '');
				// Working with a polyfill or use jquery
				_domHand2['default'].tree.remove(child);
			}
		}
	}, {
		key: 'DestroyVideoTexture',
		value: function DestroyVideoTexture(texture) {
			var video = texture.baseTexture.source;
			Utils.DestroyVideo(video);
		}
	}, {
		key: 'Rand',
		value: function Rand(min, max, decimals) {
			var randomNum = Math.random() * (max - min) + min;
			if (decimals == undefined) {
				return randomNum;
			} else {
				var d = Math.pow(10, decimals);
				return ~ ~(d * randomNum + 0.5) / d;
			}
		}
	}, {
		key: 'GetImgUrlId',
		value: function GetImgUrlId(url) {
			var split = url.split('/');
			return split[split.length - 1].split('.')[0];
		}
	}, {
		key: 'Style',
		value: function Style(div, style) {
			div.style.webkitTransform = style;
			div.style.mozTransform = style;
			div.style.msTransform = style;
			div.style.oTransform = style;
			div.style.transform = style;
		}
	}, {
		key: 'Translate',
		value: function Translate(div, x, y, z) {
			if ('webkitTransform' in document.body.style || 'mozTransform' in document.body.style || 'oTransform' in document.body.style || 'transform' in document.body.style) {
				Utils.Style(div, 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)');
			} else {
				div.style.top = y + 'px';
				div.style.left = x + 'px';
			}
		}
	}, {
		key: 'SpringTo',
		value: function SpringTo(item, toPosition, index) {
			var dx = toPosition.x - item.position.x;
			var dy = toPosition.y - item.position.y;
			var angle = Math.atan2(dy, dx);
			var targetX = toPosition.x - Math.cos(angle) * (item.config.length * index);
			var targetY = toPosition.y - Math.sin(angle) * (item.config.length * index);
			item.velocity.x += (targetX - item.position.x) * item.config.spring;
			item.velocity.y += (targetY - item.position.y) * item.config.spring;
			item.velocity.x *= item.config.friction;
			item.velocity.y *= item.config.friction;
		}
	}, {
		key: 'SpringToScale',
		value: function SpringToScale(item, toScale, index) {
			var dx = toScale.x - item.scale.x;
			var dy = toScale.y - item.scale.y;
			var angle = Math.atan2(dy, dx);
			var targetX = toScale.x - Math.cos(angle) * (item.config.length * index);
			var targetY = toScale.y - Math.sin(angle) * (item.config.length * index);
			item.velocityScale.x += (targetX - item.scale.x) * item.config.spring;
			item.velocityScale.y += (targetY - item.scale.y) * item.config.spring;
			item.velocityScale.x *= item.config.friction;
			item.velocityScale.y *= item.config.friction;
		}
	}]);

	return Utils;
})();

exports['default'] = Utils;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/raf.js":[function(require,module,exports){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

'use strict';

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
})();

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/Pager.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flux = require('flux');

var _flux2 = _interopRequireDefault(_flux);

var _eventemitter2 = require('eventemitter2');

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

// Actions
var PagerActions = {
    onPageReady: function onPageReady(hash) {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_IS_READY,
            item: hash
        });
    },
    onTransitionOut: function onTransitionOut() {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_TRANSITION_OUT,
            item: undefined
        });
    },
    onTransitionOutComplete: function onTransitionOutComplete() {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_TRANSITION_OUT_COMPLETE,
            item: undefined
        });
    },
    onTransitionInComplete: function onTransitionInComplete() {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_TRANSITION_IN_COMPLETE,
            item: undefined
        });
    },
    pageTransitionDidFinish: function pageTransitionDidFinish() {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_TRANSITION_DID_FINISH,
            item: undefined
        });
    }
};

// Constants
var PagerConstants = {
    PAGE_IS_READY: 'PAGE_IS_READY',
    PAGE_TRANSITION_IN: 'PAGE_TRANSITION_IN',
    PAGE_TRANSITION_OUT: 'PAGE_TRANSITION_OUT',
    PAGE_TRANSITION_OUT_COMPLETE: 'PAGE_TRANSITION_OUT_COMPLETE',
    PAGE_TRANSITION_IN_COMPLETE: 'PAGE_TRANSITION_IN_COMPLETE',
    PAGE_TRANSITION_IN_PROGRESS: 'PAGE_TRANSITION_IN_PROGRESS',
    PAGE_TRANSITION_DID_FINISH: 'PAGE_TRANSITION_DID_FINISH'
};

// Dispatcher
var PagerDispatcher = (0, _objectAssign2['default'])(new _flux2['default'].Dispatcher(), {
    handlePagerAction: function handlePagerAction(action) {
        this.dispatch(action);
    }
});

// Store
var PagerStore = (0, _objectAssign2['default'])({}, _eventemitter2.EventEmitter2.prototype, {
    firstPageTransition: true,
    pageTransitionState: undefined,
    dispatcherIndex: PagerDispatcher.register(function (payload) {
        var actionType = payload.type;
        var item = payload.item;
        switch (actionType) {
            case PagerConstants.PAGE_IS_READY:
                PagerStore.pageTransitionState = PagerConstants.PAGE_TRANSITION_IN_PROGRESS;
                var type = PagerConstants.PAGE_TRANSITION_IN;
                PagerStore.emit(type);
                break;
            case PagerConstants.PAGE_TRANSITION_OUT_COMPLETE:
                PagerStore.emit(type);
                break;
            case PagerConstants.PAGE_TRANSITION_DID_FINISH:
                if (PagerStore.firstPageTransition) PagerStore.firstPageTransition = false;
                PagerStore.pageTransitionState = PagerConstants.PAGE_TRANSITION_DID_FINISH;
                PagerStore.emit(actionType);
                break;
            default:
                PagerStore.emit(actionType, item);
                break;
        }
        return true;
    })
});

exports['default'] = {
    PagerStore: PagerStore,
    PagerActions: PagerActions,
    PagerConstants: PagerConstants,
    PagerDispatcher: PagerDispatcher
};
module.exports = exports['default'];

},{"eventemitter2":"eventemitter2","flux":"flux","object-assign":"object-assign"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _toSlugCase = require('to-slug-case');

var _toSlugCase2 = _interopRequireDefault(_toSlugCase);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var BaseComponent = (function () {
	function BaseComponent() {
		_classCallCheck(this, BaseComponent);

		this.domIsReady = false;
		this.componentDidMount = this.componentDidMount.bind(this);
	}

	_createClass(BaseComponent, [{
		key: 'componentWillMount',
		value: function componentWillMount() {}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.domIsReady = true;
			this.resize();
		}
	}, {
		key: 'render',
		value: function render(childId, parentId, template, object) {
			this.componentWillMount();
			this.childId = childId;
			this.parentId = parentId;

			if (_domHand2['default'].isDom(parentId)) {
				this.parent = parentId;
			} else {
				var id = this.parentId.indexOf('#') > -1 ? this.parentId.split('#')[1] : this.parentId;
				this.parent = document.getElementById(id);
			}

			if (template == undefined) {
				this.element = document.createElement('div');
			} else {
				this.element = document.createElement('div');
				var t = template(object);
				this.element.innerHTML = t;
			}
			if (this.element.getAttribute('id') == undefined) this.element.setAttribute('id', (0, _toSlugCase2['default'])(childId));
			_domHand2['default'].tree.add(this.parent, this.element);

			setTimeout(this.componentDidMount, 0);
		}
	}, {
		key: 'remove',
		value: function remove() {
			this.componentWillUnmount();
			this.element.remove();
		}
	}, {
		key: 'resize',
		value: function resize() {}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {}
	}]);

	return BaseComponent;
})();

exports['default'] = BaseComponent;
module.exports = exports['default'];

},{"dom-hand":"dom-hand","to-slug-case":"to-slug-case"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePage.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var BasePage = (function (_BaseComponent) {
	_inherits(BasePage, _BaseComponent);

	function BasePage(props) {
		_classCallCheck(this, BasePage);

		_get(Object.getPrototypeOf(BasePage.prototype), "constructor", this).call(this);
		this.props = props;
		this.didTransitionInComplete = this.didTransitionInComplete.bind(this);
		this.didTransitionOutComplete = this.didTransitionOutComplete.bind(this);
		this.tlIn = new TimelineMax();
		this.tlOut = new TimelineMax();
	}

	_createClass(BasePage, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			var _this = this;

			this.resize();
			this.setupAnimations();
			setTimeout(function () {
				return _this.props.isReady(_this.props.hash);
			}, 0);
		}
	}, {
		key: "setupAnimations",
		value: function setupAnimations() {

			// reset
			this.tlIn.pause(0);
			this.tlOut.pause(0);
		}
	}, {
		key: "willTransitionIn",
		value: function willTransitionIn() {
			var _this2 = this;

			this.tlIn.eventCallback("onComplete", this.didTransitionInComplete);
			this.tlIn.timeScale(1.4);
			setTimeout(function () {
				return _this2.tlIn.play(0);
			}, 800);
		}
	}, {
		key: "willTransitionOut",
		value: function willTransitionOut() {
			var _this3 = this;

			if (this.tlOut.getChildren().length < 1) {
				this.didTransitionOutComplete();
			} else {
				this.tlOut.eventCallback("onComplete", this.didTransitionOutComplete);
				this.tlOut.timeScale(1.2);
				setTimeout(function () {
					return _this3.tlOut.play(0);
				}, 500);
			}
		}
	}, {
		key: "didTransitionInComplete",
		value: function didTransitionInComplete() {
			var _this4 = this;

			this.tlIn.eventCallback("onComplete", null);
			setTimeout(function () {
				return _this4.props.didTransitionInComplete();
			}, 0);
		}
	}, {
		key: "didTransitionOutComplete",
		value: function didTransitionOutComplete() {
			var _this5 = this;

			this.tlOut.eventCallback("onComplete", null);
			setTimeout(function () {
				return _this5.props.didTransitionOutComplete();
			}, 0);
		}
	}, {
		key: "resize",
		value: function resize() {}
	}, {
		key: "forceUnmount",
		value: function forceUnmount() {
			this.tlIn.pause(0);
			this.tlOut.pause(0);
			this.didTransitionOutComplete();
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			this.tlIn.clear();
			this.tlOut.clear();
		}
	}]);

	return BasePage;
})(_BaseComponent3["default"]);

exports["default"] = BasePage;
module.exports = exports["default"];

},{"./BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePager.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _Pager = require('./../Pager');

var _Utils = require('./../../app/utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _PagesContainer_hbs = require('./../../app/partials/PagesContainer.hbs');

var _PagesContainer_hbs2 = _interopRequireDefault(_PagesContainer_hbs);

var _AppStore = require('./../../app/stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../../app/constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var _AppActions = require('./../../app/actions/AppActions');

var _AppActions2 = _interopRequireDefault(_AppActions);

var BasePager = (function (_BaseComponent) {
	_inherits(BasePager, _BaseComponent);

	function BasePager() {
		_classCallCheck(this, BasePager);

		_get(Object.getPrototypeOf(BasePager.prototype), 'constructor', this).call(this);
		this.currentPageDivRef = 'page-b';
		this.willPageTransitionIn = this.willPageTransitionIn.bind(this);
		this.willPageTransitionOut = this.willPageTransitionOut.bind(this);
		this.didPageTransitionInComplete = this.didPageTransitionInComplete.bind(this);
		this.didPageTransitionOutComplete = this.didPageTransitionOutComplete.bind(this);
		this.pageTransitionDidFinish = this.pageTransitionDidFinish.bind(this);
		this.components = {
			'new-component': undefined,
			'old-component': undefined
		};
	}

	_createClass(BasePager, [{
		key: 'render',
		value: function render(parent) {
			_get(Object.getPrototypeOf(BasePager.prototype), 'render', this).call(this, 'BasePager', parent, _PagesContainer_hbs2['default'], undefined);
		}
	}, {
		key: 'componentWillMount',
		value: function componentWillMount() {
			_Pager.PagerStore.on(_Pager.PagerConstants.PAGE_TRANSITION_IN, this.willPageTransitionIn);
			_Pager.PagerStore.on(_Pager.PagerConstants.PAGE_TRANSITION_OUT, this.willPageTransitionOut);
			_Pager.PagerStore.on(_Pager.PagerConstants.PAGE_TRANSITION_DID_FINISH, this.pageTransitionDidFinish);
			_get(Object.getPrototypeOf(BasePager.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'willPageTransitionIn',
		value: function willPageTransitionIn() {
			this.switchPagesDivIndex();
			if (this.components['new-component'] != undefined) this.components['new-component'].willTransitionIn();
		}
	}, {
		key: 'willPageTransitionOut',
		value: function willPageTransitionOut() {
			if (this.components['new-component'] != undefined) this.components['new-component'].willTransitionOut();
		}
	}, {
		key: 'pageAssetsLoaded',
		value: function pageAssetsLoaded() {
			_Pager.PagerActions.onTransitionOutComplete();
		}
	}, {
		key: 'didPageTransitionInComplete',
		value: function didPageTransitionInComplete() {
			_AppStore2['default'].Parent.style.cursor = 'auto';
			_AppStore2['default'].FrontBlock.style.visibility = 'hidden';
			_Pager.PagerActions.onTransitionInComplete();
			_Pager.PagerActions.pageTransitionDidFinish();
		}
	}, {
		key: 'didPageTransitionOutComplete',
		value: function didPageTransitionOutComplete() {
			_AppActions2['default'].loadPageAssets();
		}
	}, {
		key: 'pageTransitionDidFinish',
		value: function pageTransitionDidFinish() {
			this.unmountComponent('old-component');
		}
	}, {
		key: 'switchPagesDivIndex',
		value: function switchPagesDivIndex() {
			var newComponent = this.components['new-component'];
			var oldComponent = this.components['old-component'];
			if (newComponent != undefined) newComponent.parent.style['z-index'] = 2;
			if (oldComponent != undefined) oldComponent.parent.style['z-index'] = 1;
		}
	}, {
		key: 'setupNewComponent',
		value: function setupNewComponent(hash, Type, template) {
			var id = _Utils2['default'].CapitalizeFirstLetter(hash.parent.replace("/", ""));
			this.oldPageDivRef = this.currentPageDivRef;
			this.currentPageDivRef = this.currentPageDivRef === 'page-a' ? 'page-b' : 'page-a';
			var el = document.getElementById(this.currentPageDivRef);

			var props = {
				id: this.currentPageDivRef,
				isReady: this.onPageReady,
				hash: hash,
				didTransitionInComplete: this.didPageTransitionInComplete,
				didTransitionOutComplete: this.didPageTransitionOutComplete,
				data: _AppStore2['default'].pageContent()
			};
			var page = new Type(props);
			page.render(id, el, template, props.data);
			this.components['old-component'] = this.components['new-component'];
			this.components['new-component'] = page;

			if (_Pager.PagerStore.pageTransitionState === _Pager.PagerConstants.PAGE_TRANSITION_IN_PROGRESS) {
				this.components['old-component'].forceUnmount();
			}
		}
	}, {
		key: 'onPageReady',
		value: function onPageReady(hash) {
			_Pager.PagerActions.onPageReady(hash);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			_get(Object.getPrototypeOf(BasePager.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'unmountComponent',
		value: function unmountComponent(ref) {
			if (this.components[ref] !== undefined) {
				this.components[ref].remove();
			}
		}
	}]);

	return BasePager;
})(_BaseComponent3['default']);

exports['default'] = BasePager;
module.exports = exports['default'];

},{"./../../app/actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../../app/constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../app/partials/PagesContainer.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs","./../../app/stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../app/utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Pager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/Pager.js","./BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/www/data/data.json":[function(require,module,exports){
module.exports={
	"content": {
		"twitter_url": "https://twitter.com/camper",
		"facebook_url": "https://www.facebook.com/Camper",
		"instagram_url": "https://instagram.com/camper/",
		"lab_url": "http://www.camper.com/lab",
		"lang": {
			"en": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Shop",
				"shop_men": "Men",
				"shop_women": "Women",
				"map_txt": "MAP"
			},
			"fr": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Acheter",
				"shop_men": "homme",
				"shop_women": "femme",
				"map_txt": "MAP"
			},
			"es": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Comprar",
				"shop_men": "hombre",
				"shop_women": "mujer",
				"map_txt": "MAP"
			},
			"it": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Acquisiti",
				"shop_men": "uomo",
				"shop_women": "donna",
				"map_txt": "MAP"
			},
			"de": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Shop",
				"shop_men": "Herren",
				"shop_women": "Damen",
				"map_txt": "MAP"
			},
			"pt": {
				"home": "HOME",
				"grid": "GRID",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Compre",
				"shop_men": "Homen",
				"shop_women": "Mulher",
				"map_txt": "MAP"
			}
		}
	},

	"langs": ["en", "fr", "es", "it", "de", "pt"],

	"home-videos": [
		"http://embed.wistia.com/deliveries/80cdc4c5036495e42803b0ffab300434315ee383/deia-dub.mp4",
		"http://embed.wistia.com/deliveries/7a15f7c04eb54dabb8513860ce2d1b346d587910/deia-mateo.mp4",
		"http://embed.wistia.com/deliveries/83503af5f017dc36601ab142777fde41c2fd99a2/deia-marta.mp4",
		"http://embed.wistia.com/deliveries/a41a59d0aa3139703047fd1d73e7105fb4776443/es-trenc-isamu.mp4",
		"http://embed.wistia.com/deliveries/d316a13a783dfd99eaef9fee121f5a579fc62ab4/es-trenc-beluga.mp4",
		"http://embed.wistia.com/deliveries/51fd9fd20ce7bce0336045ed3f79d68cc458d555/arelluf-capas.mp4",
		"http://embed.wistia.com/deliveries/c6be69c646c131f0be67062cd600cb19aa5d2ab1/arelluf-pelotas.mp4",
		"http://embed.wistia.com/deliveries/386f5b10992e7805e1bcf7bd389a7ef55eadb904/arelluf-marta.mp4",
		"http://embed.wistia.com/deliveries/38e326610895c511363011058dc3080594a8143b/arelluf-kobarah.mp4",
		"http://embed.wistia.com/deliveries/009caf693ce8d02f6b67b7e03b8fa7a5327f6f34/arelluf-dub.mp4",
		"http://embed.wistia.com/deliveries/a5b374fa27644d9c1cdc0aed245d4ac9e0480d80/arelluf-paradise.mp4"
	],

	"feed": [
		{
			"id": "deia",
			"person": "mateo",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "mateo",
					"person-text": "Estreno Campers para nuestro weekend en Deia @Marta"
				}
			]
		},{
			"id": "deia",
			"person": "mateo",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "mateo",
					"person-text": "Profile pic? maybe? maybe baby?"
				}
			]
		},{
			"id": "deia",
			"person": "mateo",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "mateo",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "deia",
			"person": "mateo",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Porque esa cara de emo?? @Mateo lolll"
				}
			]
		},{
			"id": "deia",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "This shoes are the shoes Miro would wear if he was still alive and kickin´"
				}
			]
		},{
			"id": "deia",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "mateo",
					"person-text": "Porque no vienes a Deia con @Marta y conmigo el proximo weekend??"
				},{
					"person-name": "dub",
					"person-text": "No puedooooo… tengo clases de pintura y mi madre viene a visitar #heavymetal"
				}
			]
		},{
			"id": "deia",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "mateo",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "deia",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "#artselfie"
				}
			]
		},{
			"id": "deia",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Deep blue #camper"
				}
			]
		},{
			"id": "deia",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Thanks for the flowers @Mateo sooo cuuute."
				}
			]
		},{
			"id": "deia",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "deia",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Las flores que @mateo me regalo."
				}
			]
		},{
			"id": "es-trenc",
			"person": "beluga",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "beluga",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "es-trenc",
			"person": "beluga",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "beluga",
					"person-text": "Es Trenc is the place to be. "
				}
			]
		},{
			"id": "es-trenc",
			"person": "beluga",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "beluga",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "es-trenc",
			"person": "beluga",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "beluga",
					"person-text": "All this smoke is not what you think it is. "
				}
			]
		},{
			"id": "es-trenc",
			"person": "isamu",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "isamu",
					"person-text": "Extraordinary beauty. I love the new #camper "
				}
			]
		},{
			"id": "es-trenc",
			"person": "isamu",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "isamu",
					"person-text": "So calm at Es Trenc."
				}
			]
		},{
			"id": "es-trenc",
			"person": "isamu",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "isamu",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "es-trenc",
			"person": "isamu",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "isamu",
					"person-text": "Hiiiii!!! :)"
				}
			]
		},

		{
			"id": "arelluf",
			"person": "capas",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "capas",
					"person-text": "New camper. New colors. Same energy."
				}
			]
		},{
			"id": "arelluf",
			"person": "capas",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "capas",
					"person-text": "Last night was in-sane."
				}
			]
		},{
			"id": "arelluf",
			"person": "capas",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "capas",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "capas",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "capas",
					"person-text": "So much fun."
				}
			]
		},

		{
			"id": "arelluf",
			"person": "pelotas",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "pelotas",
					"person-text": "Once you go black..."
				}
			]
		},{
			"id": "arelluf",
			"person": "pelotas",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "pelotas",
					"person-text": "Riders of Mallorca #camper."
				}
			]
		},{
			"id": "arelluf",
			"person": "pelotas",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "pelotas",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "pelotas",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "pelotas",
					"person-text": "No selfie no nothing."
				}
			]
		},

		{
			"id": "arelluf",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "These new Camper's are the bomb. "
				}
			]
		},{
			"id": "arelluf",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "I'm not going in the pool like this."
				}
			]
		},{
			"id": "arelluf",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "marta",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "marta",
					"person-text": "After party. After life."
				}
			]
		},

		{
			"id": "arelluf",
			"person": "kobarah",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "kobarah",
					"person-text": "I dare you."
				}
			]
		},{
			"id": "arelluf",
			"person": "kobarah",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "kobarah",
					"person-text": "Wish you where here #arelluf."
				}
			]
		},{
			"id": "arelluf",
			"person": "kobarah",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "kobarah",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "kobarah",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "kobarah",
					"person-text": "Call me Pandemonia."
				}
			]
		},

		{
			"id": "arelluf",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "My new Camper's are the SUV of shoes."
				}
			]
		},{
			"id": "arelluf",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "Free diving excurtions this afternoon at #arelluf. PM me if interested."
				}
			]
		},{
			"id": "arelluf",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "dub",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "dub",
					"person-text": "Peace y'all."
				}
			]
		},

		{
			"id": "arelluf",
			"person": "paradise",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "shoe"
			},
			"comments": [
				{
					"person-name": "paradise",
					"person-text": "Bold and beautiful."
				}
			]
		},{
			"id": "arelluf",
			"person": "paradise",
			"time": "2 min ago",
			"media": {
				"type": "image",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "paradise",
					"person-text": "Detox by the pool. Much needed."
				}
			]
		},{
			"id": "arelluf",
			"person": "paradise",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "fun-fact"
			},
			"comments": [
				{
					"person-name": "paradise",
					"person-text": "Me being me… Hehe :) <span>#camper</span>"
				}
			]
		},{
			"id": "arelluf",
			"person": "paradise",
			"time": "2 min ago",
			"media": {
				"type": "video",
				"id": "character"
			},
			"comments": [
				{
					"person-name": "paradise",
					"person-text": "I am not a bimbo."
				}
			]
		}
	],

	"default-route": "",

	"routing": {
		"/": {
			"texts": {
				"en": {
					"generic": "The Spring/Summer 2016 collection is inspired by Mallorca, the Mediterranean island that Camper calls home. Our vision of this sunny paradise highlights three hot spots: Deia, Es Trenc, and Arelluf. For us, Mallorca isn’t just a destination, it’s a state of mind. #MallorcaByCamper",
					"deia": "The village of Deia has long attracted both retirees and rock stars with its picturesque scenery and chill vibe. The seemingly sleepy countryside has a bohemian spirit unique to this mountain enclave. #DeiaByCamper",
					"arelluf": "The fist-pumping ragers of Arenal and unbridled debauchery of Magaluf meet in Arelluf, an imagined but epic part of our vision of this beloved island. It’s all neon and non-stop partying in the summer sun – quite literally a hot mess. #ArellufByCamper",
					"es-trenc": "This coastal wilderness boasts breathtaking beaches and a serene atmosphere. The seaside has an untamed yet peaceful feeling that is both inspiring and soothing. #EsTrencByCamper"
				},
				"fr": {
					"generic": "La collection Printemps/Été 2016 s’inspire de Majorque, l’île méditerranéenne d'où Camper est originaire. Notre vision de ce paradis ensoleillé se reflète dans trois lieux incontournables : Deia, Es Trenc et Arelluf. Pour nous, Majorque est plus qu’une simple destination : c’est un état d’esprit. #MallorcaByCamper",
					"deia": "Le village de Deia attire depuis longtemps les retraités comme les rock stars grâce à ses paysages pittoresques et son ambiance décontractée. Sa campagne d’apparence tranquille affiche un esprit bohème caractéristique de cette enclave montagneuse. #DeiaByCamper",
					"arelluf": "L’exaltation d’Arenal et les soirées débridées de Magaluf se rejoignent à Arelluf, un lieu imaginaire mais central dans notre vision de cette île adorée. Tout y est question de fluo et de fêtes sans fin au soleil de l’été : un joyeux bazar, en somme. #ArellufByCamper",
					"es-trenc": "Cette nature sauvage côtière jouit d’une superbe plage et d’une atmosphère calme. Le bord de mer a un côté à la fois tranquille et indompté qui inspire autant qu’il apaise. #EsTrencByCamper"
				},
				"es": {
					"generic": "La colección primavera/verano 2016 está inspirada en Mallorca, la isla mediterránea que Camper considera su hogar. Nuestra visión de este paraíso soleado destaca tres lugares importantes: Deia, Es Trenc y Arelluf. Para nosotros, Mallorca no es tan solo un destino, es un estado de ánimo. #MallorcaByCamper",
					"deia": "Los horizontes pintorescos y la tranquilidad del pueblo de Deia llevan mucho tiempo cautivando tanto a artistas retirados como a estrellas del rock. El paisaje rural de aparente calma posee un espíritu bohemio propio de este enclave montañoso. #DeiaByCamper",
					"arelluf": "La locura fiestera de S’Arenal y el desenfreno de Magaluf se reúnen en Arelluf, una creación dentro de nuestra visión de esta querida isla. Todo gira en torno al neón y la fiesta sin fin bajo el sol. En definitiva, una combinación explosiva. #ArellufByCamper",
					"es-trenc": "Este espacio natural virgen cuenta con una playa impresionante y un ambiente sereno. La costa, salvaje y pacífica al mismo tiempo, transmite una sensación evocadora y relajante. #EsTrencByCamper"
				},
				"it": {
					"generic": "La collezione Primavera/Estate 2016 è ispirata a Maiorca, l’isola del Mediterraneo che ha dato i natali a Camper. La nostra visione di questo paradiso assolato si sofferma su tre luoghi simbolo: Deia, Es Trenc e Arelluf. Per noi, Maiorca non è una semplice meta, è uno stato d'animo. #MallorcaByCamper",
					"deia": "Da tempo, il villaggio di Deia attira pensionati e rock star con il suo paesaggio pittoresco e l'atmosfera rilassata. La campagna apparentemente sonnolenta ha uno spirito bohémien tipico di questo paesino di montagna. #DeiaByCamper",
					"arelluf": "Gli scatenati festaioli di Arenal e la sfrenata dissolutezza di Magaluf si fondono in Arelluf, una parte immaginaria ma epica della nostra visione di questa adorata isola. È un turbinio di luci al neon e feste ininterrotte sotto il sole estivo, un caos pazzesco. #ArellufByCamper",
					"es-trenc": "Quest'area protetta vanta una spiaggia mozzafiato e un'atmosfera serena. Il litorale ha un che di selvaggio, ma pacifico, che è suggestivo e rilassante al tempo stesso. #EsTrencByCamper"
				},
				"de": {
					"generic": "Die Kollektion Frühjahr/Sommer 2016 hat sich von Mallorca inspirieren lassen, der Mittelmeerinsel, auf der Camper zu Hause ist. Unsere Vision des Sonnenparadieses befasst sich mit drei Hotspots: Deia, Es Trenc und Arelluf. Für uns ist Mallorca mehr als nur ein Reiseziel, es ist eine Lebenseinstellung. #MallorcaByCamper",
					"deia": "Der Ort Deia mit seiner malerischen Landschaft und Lässigkeit zieht seit vielen Jahren nicht nur Pensionäre, sondern auch Rockstars an. Die verschlafen anmutende Gegend versprüht einen ganz besonderen Bohemian-Charme, der einzigartig ist für diese Gebirgsenklave. #DeiaByCamper",
					"arelluf": "Die gestählten Körper von Arenal und die ungezügelte Offenheit von Magaluf treffen in Arelluf aufeinander – ein fantasievolles und doch umfassendes Element unserer Vision der beliebten Insel. Ein Sommer aus endlosen Partys in Neonfarben – ein echt heißer Ort. #ArellufByCamper",
					"es-trenc": "Dieser unberührte Küstenstreifen verfügt über einen atemberaubenden Strand und eine beruhigende Atmosphäre. Das Meer ist ungezähmt und friedvoll zugleich und dient als Quelle der Inspiration ebenso wie als Ruhepol. #EsTrencByCamper"
				},
				"pt": {
					"generic": "A coleção primavera/verão 2016 tem Maiorca como inspiração, a ilha mediterrânea que a Camper chama de casa. A nossa visão deste paraíso solarengo realça três locais importantes: Deia, Es Trenc e Arelluf. Para nós, Maiorca não é só um destino de férias, mas também um estado de espírito. #MallorcaByCamper",
					"deia": "A aldeia de Deia sempre atraiu reformados e estrelas de rock devido à sua paisagem pitoresca e ambiente descontraído. Esta aldeia campestre aparentemente pacata tem um espírito boémio, exclusivo deste enclave montanhoso. #DeiaByCamper",
					"arelluf": "As grandes festas de Arenal e a diversão sem limites de Magaluf reúnem-se em Arelluf, uma parte imaginada mas épica da nossa visão desta ilha tão amada por nós. A combinação perfeita entre tons néon e festas imparáveis sob o sol de verão (uma mistura bem quente, na realidade). #ArellufByCamper",
					"es-trenc": "Esta vasta região costeira possui praias impressionantes e um ambiente sereno. O litoral tem uma atmosfera selvagem e tranquila ao mesmo tempo, que é tanto inspiradora como relaxante. #EsTrencByCamper"
				}
			},
			"assets": [
				"background.jpg",
				"video-shots/arelluf-capas.jpg",
				"video-shots/arelluf-dub.jpg",
				"video-shots/arelluf-kobarah.jpg",
				"video-shots/arelluf-paradise.jpg",
				"video-shots/arelluf-pelotas.jpg",
				"video-shots/arelluf-marta.jpg",
				"video-shots/deia-dub.jpg",
				"video-shots/deia-marta.jpg",
				"video-shots/deia-mateo.jpg",
				"video-shots/es-trenc-beluga.jpg",
				"video-shots/es-trenc-isamu.jpg"
			]
		},

        "deia/dub": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/13bbb61195164873d823a3b91a2c82accefb3edd/deia-dub.mp4",
        	"ambient-color": {
        		"from": { "h": 188, "s": 85, "v": 61 },
        		"to": { "h": 357, "s": 97, "v": 26 },
        		"selfie-stick": { "h": 359, "s": 93, "v": 51 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/62e54eac1d8989ab9de238fa3f7c6d8db4d9de8d/deia-dub.mp4",
        	"fact": {
        		"en": "Breaking up on a text message is not very deia"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/dub_deia_ss2016",
        	"wistia-character-id": "azjc2jh62j",
        	"wistia-fun-id": "6p32lyvdqo"
        },
        "deia/mateo": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/e424889ac026f70e544af03035e7187f34941705/deia-mateo.mp4",
        	"ambient-color": {
        		"from": { "h": 37, "s": 89, "v": 83 },
        		"to": { "h": 8, "s": 86, "v": 57 },
        		"selfie-stick": { "h": 8, "s": 86, "v": 57 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/950b6925fa4f85cfa8d466d84361671797c20c1a/deia-mateo.mp4",
        	"fact": {
        		"en": "buys an atelier at deia.<br>starts career as an artist"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/mateo_deia_ss2016",
        	"wistia-character-id": "6het1knik3",
        	"wistia-fun-id": "6p32lyvdqo"
        },

        "deia/marta": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/4bb6e485b717bf7dbdd5c941fafa2b1884e90838/deia-marta.mp4",
        	"ambient-color": {
        		"from": { "h": 346, "s": 70, "v": 55 },
        		"to": { "h": 244, "s": 29, "v": 73 },
        		"selfie-stick": { "h": 244, "s": 29, "v": 73 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/d159b55ff8cecc9cbd8c0c12ee2781e2eda23e93/deia-marta.mp4",
        	"fact": {
        		"en": "buys an atelier at deia.<br>starts career as an artist"
        	},
        	"shop-url": "http://www.camper.com/int/women/shoes/marta_deia_ss2016",
        	"wistia-character-id": "toro2pe469",
        	"wistia-fun-id": "bgkx7gmk13"
        },

        "es-trenc/beluga": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/23444d3c8693e59f8079f827dd182c5e33413877/es-trenc-beluga.mp4",
        	"ambient-color": {
        		"from": { "h": 212, "s": 10, "v": 69 },
        		"to": { "h": 193, "s": 12, "v": 45 },
        		"selfie-stick": { "h": 193, "s": 0, "v": 45 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/70455ad73af7b7e35e9e674109929c3b70294064/es-trenc-beluga.mp4",
        	"fact": {
        		"en": "ES TRENC PARTY BOY"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/beluga_es_trenc_ss2016",
        	"wistia-character-id": "fo112zh7pv",
        	"wistia-fun-id": "97bvpzhtnb"
        },
        "es-trenc/isamu": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/6eafae7f1b3bc41d856973557a2f51598c8241a6/es-trenc-isamu.mp4",
        	"ambient-color": {
        		"from": { "h": 210, "s": 1, "v": 74 },
        		"to": { "h": 21, "s": 35, "v": 72 },
        		"selfie-stick": { "h": 20, "s": 45, "v": 30 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/06679f3ebd696e9c42fd13cf9dbdaeffe9b1f873/es-trenc-isamu.mp4",
        	"fact": {
        		"en": "UFO sighting at es trenc"
        	},
        	"shop-url": "http://www.camper.com/int/women/shoes/isamu_es_trenc_ss2016",
        	"wistia-character-id": "1xsabq7yey",
        	"wistia-fun-id": "xnlnyee83o"
        },

		"arelluf/capas": {
			"selfie-stick-video-url": "http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4",
        	"ambient-color": {
        		"from": { "h": 0, "s": 0, "v": 0 },
        		"to": { "h": 8, "s": 76, "v": 91 },
        		"selfie-stick": { "h": 8, "s": 76, "v": 91 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/48ff1c58b86b08912681b4fdf3b7547c757766d7/arelluf-capas.mp4",
        	"fact": {
        		"en": "MEANWHILE IN ARELLUF"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/capas_arelluf_ss2016",
        	"wistia-character-id": "z7or68da1v",
        	"wistia-fun-id": "kfc0u1vvhp"
		},
        "arelluf/pelotas": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/3dcfd70c7072692ea3a739aef5376b026b04b675/arelluf-pelotas.mp4",
        	"ambient-color": {
        		"from": { "h": 211, "s": 95, "v": 29 },
        		"to": { "h": 22, "s": 35, "v": 79 },
        		"selfie-stick": { "h": 233, "s": 35, "v": 10 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/ac16d53c4f9e8fd6930779e237854687dcf241e8/arelluf-pelotas.mp4",
        	"fact": {
        		"en": "WHAT HAPPENS IN ARELLUF STAYS IN ARELLUF"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/pelotas_arelluf_ss2016",
        	"wistia-character-id": "f9do2qlwnj",
        	"wistia-fun-id": "kyjkbwcn6v"
        },
        "arelluf/marta": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/9b9471dcbe1f94ff7b3508841f68ff15be192ee4/arelluf-marta.mp4",
        	"ambient-color": {
        		"from": { "h": 200, "s": 57, "v": 81 },
        		"to": { "h": 201, "s": 100, "v": 69 },
        		"selfie-stick": { "h": 201, "s": 100, "v": 69 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/5b9d2706100e5ea0d317143e2374d6bd6c9607b1/arelluf-marta.mp4",
        	"fact": {
        		"en": "BAD TRIP AT THE HOTEL POOL"
        	},
        	"shop-url": "http://www.camper.com/int/women/shoes/marta_arelluf_ss2016",
        	"wistia-character-id": "ppkmfdl5jq",
        	"wistia-fun-id": "r64ij2ojh3"
        },
        "arelluf/kobarah": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/2980f14cc8bd9912b14dca46a4cd4a85fa04774c/arelluf-kobarah.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 },
        		"selfie-stick": { "h": 344, "s": 41, "v": 100 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/62e54eac1d8989ab9de238fa3f7c6d8db4d9de8d/arelluf-kobarah.mp4",
        	"fact": {
        		"en": "Haters will say its photoshop"
        	},
        	"shop-url": "http://www.camper.com/int/women/shoes/kobarah_arelluf_ss2016",
        	"wistia-character-id": "9xe5vjzybo",
        	"wistia-fun-id": "o79dqphpsl"
        },
		"arelluf/dub": {
			"selfie-stick-video-url": "http://embed.wistia.com/deliveries/22b360c8ca399696985313dde99ba83d4ec972b7/arelluf-dub.mp4",
        	"ambient-color": {
        		"from": { "h": 196, "s": 52, "v": 33 },
        		"to": { "h": 15, "s": 84, "v": 100 },
        		"selfie-stick": { "h": 15, "s": 84, "v": 100 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/987bdab012979822b818637837cc288414cef8f3/arelluf-dub.mp4",
        	"fact": {
        		"en": "WHEN YOU CAN'T KEEP THE ARROW ON THE CENTER LINE"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/dub_arelluf_ss2016",
        	"wistia-character-id": "dlg5azy5ar",
        	"wistia-fun-id": "qphj9p3t5h"
        },
        "arelluf/paradise": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/a819c373f9777852f3967ce023bcfb0d9115386f/arelluf-paradise.mp4",
        	"ambient-color": {
        		"from": { "h": 59, "s": 19, "v": 99 },
        		"to": { "h": 207, "s": 31, "v": 100 },
        		"selfie-stick": { "h": 183, "s": 71, "v": 64 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/5dc19726efa7b2e756c80534d43fa600cc61f178/arelluf-paradise.mp4",
        	"fact": {
        		"en": "SELFIE ON WATERSLIDE LIKE A BOSS"
        	},
        	"shop-url": "http://www.camper.com/int/women/shoes/paradise_arelluf_ss2016",
        	"wistia-character-id": "h89y0kuwy2",
        	"wistia-fun-id": "343t1sn2np"
        }

	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL21vYmlsZS1mb290ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvRGlwdHlxdWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvSG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zZWxmaWUtc3RpY2suanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc29jaWFsLWxpbmtzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3ZpZGVvLWNhbnZhcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29uc3RhbnRzL0FwcENvbnN0YW50cy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvZGlzcGF0Y2hlcnMvQXBwRGlzcGF0Y2hlci5qcyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRGlwdHlxdWUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9GZWVkLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvTWFwLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvTW9iaWxlLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvUGFnZXNDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LEVBQUUsQ0FBQTs7QUFFVixPQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNwQyxPQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNwQyxPQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNwQyxPQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFBO0FBQ3pCLE9BQUksS0FBSyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFBO0FBQ2hDLE9BQUksS0FBSyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFBO0FBQ2hDLE9BQUksS0FBSyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFBO0FBQ2hDLE9BQUksRUFBRSxHQUFHLEFBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUIsT0FBSSxFQUFFLEdBQUcsQUFBQyxFQUFFLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMxQixPQUFJLEVBQUUsR0FBRyxBQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUUxQixPQUFJLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDaEIsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3QixRQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsUUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxLQUFLLEdBQUMsQ0FBQyxHQUFD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QU07O0FBRXpCLFlBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDMUQsWUFBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUM1RCxZQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQzVELFlBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRTFELE1BQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ3pDLE1BQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQzNDLE1BQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ3ZDLE1BQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFBOztBQUVyQyxTQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDL0MsU0FBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2pELFNBQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FB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UyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE9BQUksT0FBTyxHQUFHLHNCQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRS9CLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ25HLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUN0SCxPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDL0YsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hILE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFaEcsT0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN2RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNwRyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFL0YsT0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFBO0FBQy9CLE9BQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDL0YsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDL0YsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDMUYsT0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENB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QUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7QUFDMUMsT0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDOUIsT0FBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQSxBQUFDLENBQUE7QUFDM0UsT0FBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQSxBQUFDLENBQUE7QUFDM0UsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtBQUNuRSxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFBO0FBQ25FLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO0FBQ3ZDLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO0dBQ3BDOzs7U0FDbUIsdUJBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDMUMsT0FBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUNqQyxPQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9iYXNlJyk7XG5cbnZhciBiYXNlID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbi8vIEVhY2ggb2YgdGhlc2UgYXVnbWVudCB0aGUgSGFuZGxlYmFycyBvYmplY3QuIE5vIG5lZWQgdG8gc2V0dXAgaGVyZS5cbi8vIChUaGlzIGlzIGRvbmUgdG8gZWFzaWx5IHNoYXJlIGNvZGUgYmV0d2VlbiBjb21tb25qcyBhbmQgYnJvd3NlIGVudnMpXG5cbnZhciBfU2FmZVN0cmluZyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZycpO1xuXG52YXIgX1NhZmVTdHJpbmcyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX1NhZmVTdHJpbmcpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfaW1wb3J0MiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Mik7XG5cbnZhciBfaW1wb3J0MyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9ydW50aW1lJyk7XG5cbnZhciBydW50aW1lID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDMpO1xuXG52YXIgX25vQ29uZmxpY3QgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnKTtcblxudmFyIF9ub0NvbmZsaWN0MiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9ub0NvbmZsaWN0KTtcblxuLy8gRm9yIGNvbXBhdGliaWxpdHkgYW5kIHVzYWdlIG91dHNpZGUgb2YgbW9kdWxlIHN5c3RlbXMsIG1ha2UgdGhlIEhhbmRsZWJhcnMgb2JqZWN0IGEgbmFtZXNwYWNlXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBoYiA9IG5ldyBiYXNlLkhhbmRsZWJhcnNFbnZpcm9ubWVudCgpO1xuXG4gIFV0aWxzLmV4dGVuZChoYiwgYmFzZSk7XG4gIGhiLlNhZmVTdHJpbmcgPSBfU2FmZVN0cmluZzJbJ2RlZmF1bHQnXTtcbiAgaGIuRXhjZXB0aW9uID0gX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXTtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn1cblxudmFyIGluc3QgPSBjcmVhdGUoKTtcbmluc3QuY3JlYXRlID0gY3JlYXRlO1xuXG5fbm9Db25mbGljdDJbJ2RlZmF1bHQnXShpbnN0KTtcblxuaW5zdFsnZGVmYXVsdCddID0gaW5zdDtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gaW5zdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5IYW5kbGViYXJzRW52aXJvbm1lbnQgPSBIYW5kbGViYXJzRW52aXJvbm1lbnQ7XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIFZFUlNJT04gPSAnMy4wLjEnO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjtcbnZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDY7XG5cbmV4cG9ydHMuQ09NUElMRVJfUkVWSVNJT04gPSBDT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJ1xufTtcblxuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTtcbiAgICAgIH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHVucmVnaXN0ZXJIZWxwZXIobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiByZWdpc3RlclBhcnRpYWwobmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0F0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGFzIHVuZGVmaW5lZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHBhcnRpYWw7XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gdW5yZWdpc3RlclBhcnRpYWwobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLnBhcnRpYWxzW25hbWVdO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBBIG1pc3NpbmcgZmllbGQgaW4gYSB7e2Zvb319IGNvbnN0dWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTWlzc2luZyBoZWxwZXI6IFwiJyArIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0ubmFtZSArICdcIicpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTXVzdCBwYXNzIGl0ZXJhdG9yIHRvICNlYWNoJyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbixcbiAgICAgICAgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIHJldCA9ICcnLFxuICAgICAgICBkYXRhID0gdW5kZWZpbmVkLFxuICAgICAgICBjb250ZXh0UGF0aCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IFV0aWxzLmJsb2NrUGFyYW1zKFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLCBbY29udGV4dFBhdGggKyBmaWVsZCwgbnVsbF0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByaW9yS2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb25hbCkpIHtcbiAgICAgIGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJlbmRlciB0aGUgcG9zaXRpdmUgcGF0aCBpZiB0aGUgdmFsdWUgaXMgdHJ1dGh5IGFuZCBub3QgZW1wdHkuXG4gICAgLy8gVGhlIGBpbmNsdWRlWmVyb2Agb3B0aW9uIG1heSBiZSBzZXQgdG8gdHJlYXQgdGhlIGNvbmR0aW9uYWwgYXMgcHVyZWx5IG5vdCBlbXB0eSBiYXNlZCBvbiB0aGVcbiAgICAvLyBiZWhhdmlvciBvZiBpc0VtcHR5LiBFZmZlY3RpdmVseSB0aGlzIGRldGVybWluZXMgaWYgMCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3NpdGl2ZSBwYXRoIG9yIG5lZ2F0aXZlLlxuICAgIGlmICghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwgeyBmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZuLCBoYXNoOiBvcHRpb25zLmhhc2ggfSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFVdGlscy5pc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIG1lc3NhZ2UpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24gKG9iaiwgZmllbGQpIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialtmaWVsZF07XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDEsXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbiBsb2cobGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgKGNvbnNvbGVbbWV0aG9kXSB8fCBjb25zb2xlLmxvZykuY2FsbChjb25zb2xlLCBtZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbnZhciBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnRzLmxvZyA9IGxvZztcblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIHZhciBmcmFtZSA9IFV0aWxzLmV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKiBbYXJncywgXW9wdGlvbnMgKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lID0gdW5kZWZpbmVkLFxuICAgICAgY29sdW1uID0gdW5kZWZpbmVkO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgaWYgKGxvYykge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFeGNlcHRpb247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vKmdsb2JhbCB3aW5kb3cgKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdmFyIHJvb3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyxcbiAgICAgICRIYW5kbGViYXJzID0gcm9vdC5IYW5kbGViYXJzO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBIYW5kbGViYXJzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJvb3QuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgcm9vdC5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uO1xuXG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5leHBvcnRzLndyYXBQcm9ncmFtID0gd3JhcFByb2dyYW07XG5leHBvcnRzLnJlc29sdmVQYXJ0aWFsID0gcmVzb2x2ZVBhcnRpYWw7XG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO1xuZXhwb3J0cy5ub29wID0gbm9vcDtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxuZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgdmFyIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICBjdXJyZW50UmV2aXNpb24gPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5DT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIHZhciBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICB2YXIgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24gc3RyaWN0KG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24gbG9va3VwKGRlcHRocywgbmFtZSkge1xuICAgICAgdmFyIGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uIGxhbWJkYShjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uIGZuKGkpIHtcbiAgICAgIHJldHVybiB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbiBwcm9ncmFtKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uIGRhdGEodmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24gbWVyZ2UocGFyYW0sIGNvbW1vbikge1xuICAgICAgdmFyIG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiBwYXJhbSAhPT0gY29tbW9uKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgdmFyIGRlcHRocyA9IHVuZGVmaW5lZCxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgZGVwdGhzID0gb3B0aW9ucy5kZXB0aHMgPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IFtjb250ZXh0XTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcGxhdGVTcGVjLm1haW4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuaGVscGVycywgZW52LmhlbHBlcnMpO1xuXG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwpIHtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMucGFydGlhbHMsIGVudi5wYXJ0aWFscyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gb3B0aW9ucy5oZWxwZXJzO1xuICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uIChpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgYmxvY2sgcGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzICYmICFkZXB0aHMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgZnVuY3Rpb24gcHJvZyhjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgcmV0dXJuIGZuLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEgfHwgZGF0YSwgYmxvY2tQYXJhbXMgJiYgW29wdGlvbnMuYmxvY2tQYXJhbXNdLmNvbmNhdChibG9ja1BhcmFtcyksIGRlcHRocyAmJiBbY29udGV4dF0uY29uY2F0KGRlcHRocykpO1xuICB9XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBkZXB0aHMgPyBkZXB0aHMubGVuZ3RoIDogMDtcbiAgcHJvZy5ibG9ja1BhcmFtcyA9IGRlY2xhcmVkQmxvY2tQYXJhbXMgfHwgMDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXTtcbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5mdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLmNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJycgKyB0aGlzLnN0cmluZztcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNhZmVTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydHMuaW5kZXhPZiA9IGluZGV4T2Y7XG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO1xuZXhwb3J0cy5pc0VtcHR5ID0gaXNFbXB0eTtcbmV4cG9ydHMuYmxvY2tQYXJhbXMgPSBibG9ja1BhcmFtcztcbmV4cG9ydHMuYXBwZW5kQ29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aDtcbnZhciBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgJ1xcJyc6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2csXG4gICAgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqIC8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5leHBvcnRzLnRvU3RyaW5nID0gdG9TdHJpbmc7XG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKmVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBleHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbi8qZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtleHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENvbnRleHRQYXRoKGNvbnRleHRQYXRoLCBpZCkge1xuICByZXR1cm4gKGNvbnRleHRQYXRoID8gY29udGV4dFBhdGggKyAnLicgOiAnJykgKyBpZDtcbn0iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCIvLyBBdm9pZCBjb25zb2xlIGVycm9ycyBmb3IgdGhlIElFIGNyYXBweSBicm93c2Vyc1xuaWYgKCAhIHdpbmRvdy5jb25zb2xlICkgY29uc29sZSA9IHsgbG9nOiBmdW5jdGlvbigpe30gfTtcblxuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcCBmcm9tICdBcHAnXG5pbXBvcnQgQXBwTW9iaWxlIGZyb20gJ0FwcE1vYmlsZSdcbmltcG9ydCBUd2Vlbk1heCBmcm9tICdnc2FwJ1xuaW1wb3J0IHJhZiBmcm9tICdyYWYnXG5pbXBvcnQgTW9iaWxlRGV0ZWN0IGZyb20gJ21vYmlsZS1kZXRlY3QnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgbWQgPSBuZXcgTW9iaWxlRGV0ZWN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuXG5BcHBTdG9yZS5EZXRlY3Rvci5pc1NhZmFyaSA9IChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1NhZmFyaScpICE9IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPT0gLTEpXG5BcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IChtZC5tb2JpbGUoKSB8fCBtZC50YWJsZXQoKSkgPyB0cnVlIDogZmFsc2VcbkFwcFN0b3JlLlBhcmVudCA9IGRvbS5zZWxlY3QoJyNhcHAtY29udGFpbmVyJylcbkFwcFN0b3JlLkRldGVjdG9yLm9sZElFID0gZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU2JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU3JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU4JylcbkFwcFN0b3JlLkRldGVjdG9yLmlzU3VwcG9ydFdlYkdMID0gVXRpbHMuU3VwcG9ydFdlYkdMKClcbmlmKEFwcFN0b3JlLkRldGVjdG9yLm9sZElFKSBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxuLy8gRGVidWdcbkFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG52YXIgYXBwO1xuaWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUpIHtcblx0ZG9tLmNsYXNzZXMuYWRkKGRvbS5zZWxlY3QoJ2h0bWwnKSwgJ21vYmlsZScpXG5cdGFwcCA9IG5ldyBBcHBNb2JpbGUoKVxufWVsc2V7XG5cdGFwcCA9IG5ldyBBcHAoKVx0XG59IFxuXG5hcHAuaW5pdCgpXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGUgZnJvbSAnQXBwVGVtcGxhdGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcbmltcG9ydCBQcmVsb2FkZXIgZnJvbSAnUHJlbG9hZGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBBcHAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm9uQXBwUmVhZHkgPSB0aGlzLm9uQXBwUmVhZHkuYmluZCh0aGlzKVxuXHRcdHRoaXMubG9hZE1haW5Bc3NldHMgPSB0aGlzLmxvYWRNYWluQXNzZXRzLmJpbmQodGhpcylcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHR0aGlzLnJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgUHJlbG9hZGVyXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpXG5cblx0XHR2YXIgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVsb2FkZXInKVxuXHRcdFxuXHRcdHZhciBwbGFuZSA9IGRvbS5zZWxlY3QoJyNwbGFuZScsIHApXG5cdFx0dmFyIHBhdGggPSBNb3JwaFNWR1BsdWdpbi5wYXRoRGF0YVRvQmV6aWVyKFwiI21vdGlvblBhdGhcIilcblx0XHR2YXIgdGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRsLnRvKHBsYW5lLCA1LCB7YmV6aWVyOnt2YWx1ZXM6cGF0aCwgdHlwZTpcImN1YmljXCIsIGF1dG9Sb3RhdGU6dHJ1ZX0sIGVhc2U6TGluZWFyLmVhc2VPdXR9LCAwKVxuXHRcdHRsLnBhdXNlKClcblx0XHR0aGlzLmxvYWRlckFuaW0gPSB7XG5cdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0ZWw6IHAsXG5cdFx0XHRwbGFuZTogcGxhbmUsXG5cdFx0XHR0bDogdGxcblx0XHR9XG5cdFx0dGwudHdlZW5UbygzLjUpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblxuXHRcdHZhciBhcHBUZW1wbGF0ZSA9IG5ldyBBcHBUZW1wbGF0ZSgpXG5cdFx0YXBwVGVtcGxhdGUuaXNSZWFkeSA9IHRoaXMubG9hZE1haW5Bc3NldHNcblx0XHRhcHBUZW1wbGF0ZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHR0aGlzLnJvdXRlci5iZWdpblJvdXRpbmcoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdHZhciBzaXplID0gZG9tLnNpemUodGhpcy5sb2FkZXJBbmltLmVsKVxuXHRcdFx0dmFyIGVsID0gdGhpcy5sb2FkZXJBbmltLmVsXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2l6ZVswXSkgKyAncHgnXG5cdFx0XHRlbC5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSArIChzaXplWzFdICogMCkgKyAncHgnXG5cdFx0XHR0aGlzLmxvYWRlckFuaW0uZWwuc3R5bGUub3BhY2l0eSA9IDFcblx0XHR9LCAwKVxuXHR9XG5cdGxvYWRNYWluQXNzZXRzKCkge1xuXHRcdHZhciBoYXNoVXJsID0gbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMilcblx0XHR2YXIgcGFydHMgPSBoYXNoVXJsLnN1YnN0cigxKS5zcGxpdCgnLycpXG5cdFx0dmFyIG1hbmlmZXN0ID0gQXBwU3RvcmUucGFnZUFzc2V0c1RvTG9hZCgpXG5cdFx0aWYobWFuaWZlc3QubGVuZ3RoIDwgMSkgdGhpcy5vbkFwcFJlYWR5KClcblx0XHRlbHNlIEFwcFN0b3JlLlByZWxvYWRlci5sb2FkKG1hbmlmZXN0LCB0aGlzLm9uQXBwUmVhZHkpXG5cdH1cblx0b25BcHBSZWFkeSgpIHtcblx0XHR0aGlzLmxvYWRlckFuaW0udGwudGltZVNjYWxlKDIuNCkudHdlZW5Ubyh0aGlzLmxvYWRlckFuaW0udGwudG90YWxEdXJhdGlvbigpIC0gMC4xKVxuXHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRUd2Vlbk1heC50byh0aGlzLmxvYWRlckFuaW0uZWwsIDAuNSwgeyBvcGFjaXR5OjAsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdFx0XHRcdGRvbS50cmVlLnJlbW92ZSh0aGlzLmxvYWRlckFuaW0uZWwpXG5cdFx0XHRcdHRoaXMubG9hZGVyQW5pbS50bC5jbGVhcigpXG5cdFx0XHRcdHRoaXMubG9hZGVyQW5pbSA9IG51bGxcblx0XHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXHRcblx0XHRcdH0sIDIwMClcblx0XHR9LCAxNTAwKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFxuICAgIFx0XG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlTW9iaWxlIGZyb20gJ0FwcFRlbXBsYXRlTW9iaWxlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBBcHBNb2JpbGUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dmFyIHJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuXHRcdHJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgZ2xvYmFsIGV2ZW50c1xuXHRcdHdpbmRvdy5HbG9iYWxFdmVudHMgPSBuZXcgR0V2ZW50cygpXG5cdFx0R2xvYmFsRXZlbnRzLmluaXQoKVxuXG5cdFx0dmFyIGFwcFRlbXBsYXRlTW9iaWxlID0gbmV3IEFwcFRlbXBsYXRlTW9iaWxlKClcblx0XHRhcHBUZW1wbGF0ZU1vYmlsZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVsb2FkZXInKVxuXHRcdGRvbS50cmVlLnJlbW92ZShlbClcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHRyb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBNb2JpbGVcbiAgICBcdFxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBGcm9udENvbnRhaW5lciBmcm9tICdGcm9udENvbnRhaW5lcidcbmltcG9ydCBQYWdlc0NvbnRhaW5lciBmcm9tICdQYWdlc0NvbnRhaW5lcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQWENvbnRhaW5lciBmcm9tICdQWENvbnRhaW5lcidcbmltcG9ydCBUcmFuc2l0aW9uTWFwIGZyb20gJ1RyYW5zaXRpb25NYXAnXG5cbmNsYXNzIEFwcFRlbXBsYXRlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLmFuaW1hdGUgPSB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHR0aGlzLmZyb250Q29udGFpbmVyID0gbmV3IEZyb250Q29udGFpbmVyKClcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyID0gbmV3IFBhZ2VzQ29udGFpbmVyKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBYQ29udGFpbmVyKClcblx0XHR0aGlzLnB4Q29udGFpbmVyLmluaXQoJyNwYWdlcy1jb250YWluZXInKVxuXHRcdEFwcEFjdGlvbnMucHhDb250YWluZXJJc1JlYWR5KHRoaXMucHhDb250YWluZXIpXG5cblx0XHR0aGlzLnRyYW5zaXRpb25NYXAgPSBuZXcgVHJhbnNpdGlvbk1hcCgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLmlzUmVhZHkoKVxuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5Gcm9udEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zyb250LWJsb2NrJylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHR0aGlzLmFuaW1hdGUoKVxuXHR9XG5cdGFuaW1hdGUoKSB7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZSlcblx0ICAgIHRoaXMucHhDb250YWluZXIudXBkYXRlKClcblx0ICAgIHRoaXMucGFnZXNDb250YWluZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucHhDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZVxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IE1vYmlsZVRlbXBsYXRlIGZyb20gJ01vYmlsZV9oYnMnXG5pbXBvcnQgRmVlZFRlbXBsYXRlIGZyb20gJ0ZlZWRfaGJzJ1xuaW1wb3J0IGZvb3RlciBmcm9tICdtb2JpbGUtZm9vdGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBzY3JvbGx0b3AgZnJvbSAnc2ltcGxlLXNjcm9sbHRvcCdcblxuY2xhc3MgQXBwVGVtcGxhdGVNb2JpbGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy5zY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblx0XHR0aGlzLnNjb3BlLmluZm9zID0gQXBwU3RvcmUuZ2xvYmFsQ29udGVudCgpXG5cdFx0dGhpcy5zY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLm9uT3BlbkZlZWQgPSB0aGlzLm9uT3BlbkZlZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25PcGVuR3JpZCA9IHRoaXMub25PcGVuR3JpZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblNjcm9sbCA9IHRoaXMub25TY3JvbGwuYmluZCh0aGlzKVxuXG5cdFx0Ly8gZmluZCB1cmxzIGZvciBlYWNoIGZlZWRcblx0XHR0aGlzLmZlZWQgPSBBcHBTdG9yZS5nZXRGZWVkKClcblx0XHR2YXIgYmFzZVVybCA9IEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKVxuXHRcdHZhciBpLCBmZWVkLCBmb2xkZXIsIGljb24sIHBhZ2VJZCwgc2NvcGU7XG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuZmVlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZmVlZCA9IHRoaXMuZmVlZFtpXVxuXHRcdFx0Zm9sZGVyID0gYmFzZVVybCArICdpbWFnZS9kaXB0eXF1ZS8nICsgZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uICsgJy8nXG5cdFx0XHRpY29uID0gZm9sZGVyICsgJ2ljb24uanBnJ1xuXHRcdFx0cGFnZUlkID0gZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uIFxuXHRcdFx0c2NvcGUgPSBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQocGFnZUlkKVxuXHRcdFx0ZmVlZC5pY29uID0gaWNvblxuXHRcdFx0aWYoZmVlZC5tZWRpYS50eXBlID09ICdpbWFnZScgJiYgZmVlZC5tZWRpYS5pZCA9PSAnc2hvZScpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBmb2xkZXIgKyAnbW9iaWxlLycgKyAnc2hvZS5qcGcnXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ2ltYWdlJyAmJiBmZWVkLm1lZGlhLmlkID09ICdjaGFyYWN0ZXInKSB7XG5cdFx0XHRcdGZlZWQubWVkaWEudXJsID0gZm9sZGVyICsgJ21vYmlsZS8nICsgJ2NoYXJhY3Rlci5qcGcnXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ3ZpZGVvJyAmJiBmZWVkLm1lZGlhLmlkID09ICdmdW4tZmFjdCcpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYVsnaXMtdmlkZW8nXSA9IHRydWVcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBzY29wZVsnd2lzdGlhLWZ1bi1pZCddXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ3ZpZGVvJyAmJiBmZWVkLm1lZGlhLmlkID09ICdjaGFyYWN0ZXInKSB7XG5cdFx0XHRcdGZlZWQubWVkaWFbJ2lzLXZpZGVvJ10gPSB0cnVlXG5cdFx0XHRcdGZlZWQubWVkaWEudXJsID0gc2NvcGVbJ3dpc3RpYS1jaGFyYWN0ZXItaWQnXVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5PUEVOX0ZFRUQsIHRoaXMub25PcGVuRmVlZCkgXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLk9QRU5fR1JJRCwgdGhpcy5vbk9wZW5HcmlkKSBcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZU1vYmlsZScsIHBhcmVudCwgTW9iaWxlVGVtcGxhdGUsIHRoaXMuc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5wb3N0cyA9IFtdXG5cdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgPSAwXG5cdFx0dGhpcy5wYWdlRW5kZWQgPSBmYWxzZVxuXHRcdHRoaXMuY3VycmVudEZlZWRJbmRleCA9IDBcblx0XHR0aGlzLmFsbEZlZWRzID0gW11cblxuXHRcdHRoaXMuZm9vdGVyID0gZm9vdGVyKHRoaXMuZWxlbWVudCwgdGhpcy5zY29wZSlcblx0XHR0aGlzLm1haW5Db250YWluZXIgPSBkb20uc2VsZWN0KCcubWFpbi1jb250YWluZXInLCB0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5mZWVkRWwgPSBkb20uc2VsZWN0KCcuZmVlZCcsIHRoaXMubWFpbkNvbnRhaW5lcilcblxuXHRcdEFwcEFjdGlvbnMub3BlbkZlZWQoKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnc2Nyb2xsJywgdGhpcy5vblNjcm9sbClcblx0fVxuXHRvblNjcm9sbChlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgY3VycmVudFNjcm9sbCA9IHNjcm9sbHRvcCgpICsgd2luZG93SFxuXHRcdFx0aWYoY3VycmVudFNjcm9sbCA+IHRoaXMudG90YWxQYWdlSGVpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub25QYWdlRW5kKClcblx0XHRcdH1cblx0XHR9KVxuXG5cdH1cblx0b25PcGVuRmVlZCgpIHtcblx0XHR2YXIgY3VycmVudEZlZWQgPSB0aGlzLmdldExhc3RGZWVkcygpXG5cdFx0dGhpcy51cGRhdGVGZWVkVG9Eb20oY3VycmVudEZlZWQpXG5cdFx0dGhpcy5wcmVwYXJlUG9zdHMoKVxuXHR9XG5cdHVwZGF0ZUZlZWRUb0RvbShmZWVkKSB7XG5cdFx0dmFyIHNjb3BlID0ge1xuXHRcdFx0ZmVlZDogZmVlZFxuXHRcdH1cblx0XHR2YXIgaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0dmFyIHQgPSBGZWVkVGVtcGxhdGUoc2NvcGUpXG5cdFx0aC5pbm5lckhUTUwgPSB0XG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMuZmVlZEVsLCBoKVxuXHR9XG5cdGdldExhc3RGZWVkcygpIHtcblx0XHR2YXIgY291bnRlciA9IDBcblx0XHR2YXIgZmVlZCA9IFtdXG5cdFx0Zm9yICh2YXIgaSA9IHRoaXMuY3VycmVudEZlZWRJbmRleDsgaSA8IHRoaXMuY3VycmVudEZlZWRJbmRleCs0OyBpKyspIHtcblx0XHRcdHZhciBmID0gdGhpcy5mZWVkW2ldXG5cdFx0XHRjb3VudGVyKytcblx0XHRcdGZlZWQucHVzaChmKVxuXHRcdH1cblx0XHR0aGlzLmN1cnJlbnRGZWVkSW5kZXggKz0gY291bnRlclxuXHRcdHJldHVybiBmZWVkXG5cdH1cblx0cHJlcGFyZVBvc3RzKCkge1xuXHRcdHRoaXMucG9zdHMgPSBbXVxuXHRcdHZhciBwb3N0cyA9IGRvbS5zZWxlY3QuYWxsKCcucG9zdCcsIHRoaXMuZmVlZEVsKVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcG9zdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBlbCA9IHBvc3RzW2ldXG5cdFx0XHR0aGlzLnBvc3RzW2ldID0ge1xuXHRcdFx0XHRlbDogZWwsXG5cdFx0XHRcdG1lZGlhV3JhcHBlcjogZG9tLnNlbGVjdCgnLm1lZGlhLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdGNvbW1lbnRzV3JhcHBlcjogZG9tLnNlbGVjdCgnLmNvbW1lbnRzLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdHRvcFdyYXBwZXI6IGRvbS5zZWxlY3QoJy50b3Atd3JhcHBlcicsIGVsKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0b25PcGVuR3JpZCgpIHtcblx0XHRjb25zb2xlLmxvZygnZ3JpZCcpXG5cdH1cblx0b25QYWdlRW5kKCkge1xuXHRcdGlmKHRoaXMucGFnZUVuZGVkKSByZXR1cm5cblx0XHRpZih0aGlzLmN1cnJlbnRGZWVkSW5kZXggPj0gdGhpcy5mZWVkLmxlbmd0aCkgcmV0dXJuXG5cdFx0dmFyIGN1cnJlbnRGZWVkID0gdGhpcy5nZXRMYXN0RmVlZHMoKVxuXHRcdHRoaXMudXBkYXRlRmVlZFRvRG9tKGN1cnJlbnRGZWVkKVxuXHRcdHRoaXMucHJlcGFyZVBvc3RzKClcblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLnBhZ2VFbmRlZCA9IGZhbHNlXG5cdFx0fSwgNTApXG5cdFx0dGhpcy5wYWdlRW5kZWQgPSB0cnVlXG5cdH1cblx0cmVzaXplKCkge1xuXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ID0gMFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHBvc3QgPSB0aGlzLnBvc3RzW2ldXG5cdFx0XHR2YXIgdG9wU2l6ZSA9IGRvbS5zaXplKHBvc3QudG9wV3JhcHBlcilcblx0XHRcdHZhciBpY29uc1NpemUgPSBkb20uc2l6ZShwb3N0Lmljb25zV3JhcHBlcilcblx0XHRcdHZhciBjb21tZW50c1NpemUgPSBkb20uc2l6ZShwb3N0LmNvbW1lbnRzV3JhcHBlcilcblx0XHRcdHBvc3QubWVkaWFXcmFwcGVyLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdHBvc3QubWVkaWFXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSB3aW5kb3dXXG5cdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSBpY29uc1NpemVbMV1cblx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ICs9IGNvbW1lbnRzU2l6ZVsxXVxuXHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gdG9wU2l6ZVsxXVxuXHRcdH1cblxuXHRcdHRoaXMuZm9vdGVyLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlTW9iaWxlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuZnVuY3Rpb24gX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKSB7XG4gICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBBR0VfQVNTRVRTX0xPQURFRCxcbiAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgfSkgIFxufVxuXG52YXIgQXBwQWN0aW9ucyA9IHtcbiAgICBwYWdlSGFzaGVyQ2hhbmdlZDogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCxcbiAgICAgICAgICAgIGl0ZW06IHBhZ2VJZFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgbG9hZFBhZ2VBc3NldHM6IGZ1bmN0aW9uKHBhZ2VJZCkge1xuICAgICAgICB2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcbiAgICAgICAgaWYobWFuaWZlc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIEFwcFN0b3JlLlByZWxvYWRlci5sb2FkKG1hbmlmZXN0LCAoKT0+e1xuICAgICAgICAgICAgICAgIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd1Jlc2l6ZTogZnVuY3Rpb24od2luZG93Vywgd2luZG93SCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsXG4gICAgICAgICAgICBpdGVtOiB7IHdpbmRvd1c6d2luZG93Vywgd2luZG93SDp3aW5kb3dIIH1cbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHB4Q29udGFpbmVySXNSZWFkeTogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0lTX1JFQURZLFxuICAgICAgICAgICAgaXRlbTogY29tcG9uZW50XG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweEFkZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhSZW1vdmVDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIG9wZW5GdW5GYWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5PUEVOX0ZVTl9GQUNULFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBjbG9zZUZ1bkZhY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLkNMT1NFX0ZVTl9GQUNULFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIGNlbGxNb3VzZUVudGVyOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfRU5URVIsXG4gICAgICAgICAgICBpdGVtOiBpZFxuICAgICAgICB9KSBcbiAgICB9LFxuICAgIGNlbGxNb3VzZUxlYXZlOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfTEVBVkUsXG4gICAgICAgICAgICBpdGVtOiBpZFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgb3BlbkZlZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLk9QRU5fRkVFRCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvcGVuR3JpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuT1BFTl9HUklELFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcEFjdGlvbnNcblxuXG4gICAgICBcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnRnJvbnRDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGhlYWRlckxpbmtzIGZyb20gJ2hlYWRlci1saW5rcydcbmltcG9ydCBzb2NpYWxMaW5rcyBmcm9tICdzb2NpYWwtbGlua3MnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcblxuY2xhc3MgRnJvbnRDb250YWluZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0Ly8gdGhpcy5vblBhZ2VDaGFuZ2UgPSB0aGlzLm9uUGFnZUNoYW5nZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHZhciBzY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblx0XHRzY29wZS5pbmZvcyA9IEFwcFN0b3JlLmdsb2JhbENvbnRlbnQoKVxuXHRcdHNjb3BlLmxhYlVybCA9IGdlbmVyYUluZm9zWydsYWJfdXJsJ11cblx0XHRzY29wZS5tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy9tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cdFx0c2NvcGUud29tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy93b21lbi9zaG9lcy9uZXctY29sbGVjdGlvbidcblxuXHRcdHN1cGVyLnJlbmRlcignRnJvbnRDb250YWluZXInLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdC8vIEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLm9uUGFnZUNoYW5nZSlcblxuXHRcdHRoaXMuaGVhZGVyTGlua3MgPSBoZWFkZXJMaW5rcyh0aGlzLmVsZW1lbnQpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cblx0fVxuXHRvblBhZ2VDaGFuZ2UoKSB7XG5cdH1cblx0cmVzaXplKCkge1xuXG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5oZWFkZXJMaW5rcy5yZXNpemUoKVxuXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRnJvbnRDb250YWluZXJcblxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUFhDb250YWluZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRpbml0KGVsZW1lbnRJZCkge1xuXHRcdHRoaXMuY2xlYXJCYWNrID0gZmFsc2VcblxuXHRcdHRoaXMuYWRkID0gdGhpcy5hZGQuYmluZCh0aGlzKVxuXHRcdHRoaXMucmVtb3ZlID0gdGhpcy5yZW1vdmUuYmluZCh0aGlzKVxuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsIHRoaXMuYWRkKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELCB0aGlzLnJlbW92ZSlcblxuXHRcdHZhciByZW5kZXJPcHRpb25zID0ge1xuXHRcdCAgICByZXNvbHV0aW9uOiAxLFxuXHRcdCAgICB0cmFuc3BhcmVudDogdHJ1ZSxcblx0XHQgICAgYW50aWFsaWFzOiB0cnVlXG5cdFx0fTtcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKDEsIDEsIHJlbmRlck9wdGlvbnMpXG5cdFx0Ly8gdGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLkNhbnZhc1JlbmRlcmVyKDEsIDEsIHJlbmRlck9wdGlvbnMpXG5cdFx0dGhpcy5jdXJyZW50Q29sb3IgPSAweGZmZmZmZlxuXHRcdHZhciBlbCA9IGRvbS5zZWxlY3QoZWxlbWVudElkKVxuXHRcdHRoaXMucmVuZGVyZXIudmlldy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3B4LWNvbnRhaW5lcicpXG5cdFx0QXBwU3RvcmUuQ2FudmFzID0gdGhpcy5yZW5kZXJlci52aWV3XG5cdFx0ZG9tLnRyZWUuYWRkKGVsLCB0aGlzLnJlbmRlcmVyLnZpZXcpXG5cdFx0dGhpcy5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdFx0Ly8gdGhpcy5iYWNrZ3JvdW5kID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdFx0Ly8gdGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmJhY2tncm91bmQpXG5cblx0XHQvLyB0aGlzLnN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0Ly8gLy8gdGhpcy5zdGF0cy5zZXRNb2RlKCAxICk7IC8vIDA6IGZwcywgMTogbXMsIDI6IG1iXG5cblx0XHQvLyAvLyBhbGlnbiB0b3AtbGVmdFxuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdFx0Ly8gdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHQvLyB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0Ly8gdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlWyd6LWluZGV4J10gPSA5OTk5OTlcblxuXHRcdC8vIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuc3RhdHMuZG9tRWxlbWVudCApO1xuXG5cdH1cblx0ZHJhd0JhY2tncm91bmQoY29sb3IpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmNsZWFyKClcblx0XHR0aGlzLmJhY2tncm91bmQubGluZVN0eWxlKDApO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5iZWdpbkZpbGwoY29sb3IsIDEpO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5kcmF3UmVjdCgwLCAwLCB3aW5kb3dXLCB3aW5kb3dIKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZW5kRmlsbCgpO1xuXHR9XG5cdGFkZChjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2hpbGQpXG5cdH1cblx0cmVtb3ZlKGNoaWxkKSB7XG5cdFx0dGhpcy5zdGFnZS5yZW1vdmVDaGlsZChjaGlsZClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0Ly8gdGhpcy5zdGF0cy51cGRhdGUoKVxuXHQgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHNjYWxlID0gMVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5yZW5kZXJlci5yZXNpemUod2luZG93VyAqIHNjYWxlLCB3aW5kb3dIICogc2NhbGUpXG5cdFx0Ly8gdGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VQYWdlIGZyb20gJ0Jhc2VQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFB4SGVscGVyIGZyb20gJ1B4SGVscGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnZSBleHRlbmRzIEJhc2VQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcylcblx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IGZhbHNlXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHRoaXMucHhDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4QWRkQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25JbigpIHtcblx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDRcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbkluKClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0fSwgNTAwKVxuXHRcdHN1cGVyLndpbGxUcmFuc2l0aW9uT3V0KClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRpZih0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkge1xuXHRcdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSB0cnVlXG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDBcblx0XHR9ZWxzZXtcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gMVxuXHRcdH1cblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0Z2V0SW1hZ2VVcmxCeUlkKGlkKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FID8gJ2hvbWUtJyArIGlkIDogdGhpcy5wcm9wcy5oYXNoLnBhcmVudCArICctJyArIHRoaXMucHJvcHMuaGFzaC50YXJnZXQgKyAnLScgKyBpZFxuXHRcdHJldHVybiBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VVUkwodXJsKVxuXHR9XG5cdGdldEltYWdlU2l6ZUJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVNpemUodXJsKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRQeEhlbHBlci5yZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXIodGhpcy5weENvbnRhaW5lcilcblx0XHRzZXRUaW1lb3V0KCgpPT57IEFwcEFjdGlvbnMucHhSZW1vdmVDaGlsZCh0aGlzLnB4Q29udGFpbmVyKSB9LCAwKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtQYWdlckFjdGlvbnMsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBCYXNlUGFnZXIgZnJvbSAnQmFzZVBhZ2VyJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgSG9tZSBmcm9tICdIb21lJ1xuaW1wb3J0IEhvbWVUZW1wbGF0ZSBmcm9tICdIb21lX2hicydcbmltcG9ydCBEaXB0eXF1ZSBmcm9tICdEaXB0eXF1ZSdcbmltcG9ydCBEaXB0eXF1ZVRlbXBsYXRlIGZyb20gJ0RpcHR5cXVlX2hicydcblxuY2xhc3MgUGFnZXNDb250YWluZXIgZXh0ZW5kcyBCYXNlUGFnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5kaWRIYXNoZXJDaGFuZ2UgPSB0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlQXNzZXRzTG9hZGVkID0gdGhpcy5wYWdlQXNzZXRzTG9hZGVkLmJpbmQodGhpcylcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5kaWRIYXNoZXJDaGFuZ2UpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfQVNTRVRTX0xPQURFRCwgdGhpcy5wYWdlQXNzZXRzTG9hZGVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRkaWRIYXNoZXJDaGFuZ2UoKSB7XG5cblx0XHRBcHBTdG9yZS5QYXJlbnQuc3R5bGUuY3Vyc29yID0gJ3dhaXQnXG5cdFx0QXBwU3RvcmUuRnJvbnRCbG9jay5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuXHRcdFxuXHRcdHZhciBuZXdIYXNoID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdHZhciBvbGRIYXNoID0gUm91dGVyLmdldE9sZEhhc2goKVxuXHRcdGlmKG9sZEhhc2ggPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpXG5cdFx0fWVsc2V7XG5cdFx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uT3V0KClcblx0XHRcdC8vIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KClcblx0XHR9XG5cdH1cblx0dGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaCkge1xuXHRcdHZhciB0eXBlID0gdW5kZWZpbmVkXG5cdFx0dmFyIHRlbXBsYXRlID0gdW5kZWZpbmVkXG5cdFx0c3dpdGNoKG5ld0hhc2gudHlwZSkge1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuRElQVFlRVUU6XG5cdFx0XHRcdHR5cGUgPSBEaXB0eXF1ZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IERpcHR5cXVlVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkhPTUU6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdH1cblx0XHR0aGlzLnNldHVwTmV3Q29tcG9uZW50KG5ld0hhc2gsIHR5cGUsIHRlbXBsYXRlKVxuXHRcdHRoaXMuY3VycmVudENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdH1cblx0cGFnZUFzc2V0c0xvYWRlZCgpIHtcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR0aGlzLnRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpXG5cdFx0c3VwZXIucGFnZUFzc2V0c0xvYWRlZCgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlc0NvbnRhaW5lclxuXG5cblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdUcmFuc2l0aW9uTWFwX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IG1hcCBmcm9tICdtYWluLW1hcCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJDb25zdGFudHN9IGZyb20gJ1BhZ2VyJ1xuXG5jbGFzcyBUcmFuc2l0aW9uTWFwIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQgPSB0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnByZWxvYWRlclByb2dyZXNzID0gdGhpcy5wcmVsb2FkZXJQcm9ncmVzcy5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHZhciBzY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblxuXHRcdHN1cGVyLnJlbmRlcignVHJhbnNpdGlvbk1hcCcsIHBhcmVudCwgdGVtcGxhdGUsIHNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQpXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fQ09NUExFVEUsIHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyLnF1ZXVlLm9uKFwicHJvZ3Jlc3NcIiwgdGhpcy5wcmVsb2FkZXJQcm9ncmVzcywgdGhpcylcblxuXHRcdHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLlRSQU5TSVRJT04pXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbk91dCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblx0XHR0aGlzLm1hcC5oaWdobGlnaHQoUm91dGVyLmdldE9sZEhhc2goKSwgUm91dGVyLmdldE5ld0hhc2goKSlcblx0fVxuXHRvblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAucmVzZXRIaWdobGlnaHQoKVxuXHR9XG5cdHByZWxvYWRlclByb2dyZXNzKGUpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyArPSAwLjJcblx0XHRpZihlLnByb2dyZXNzID4gMC45OSkgdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAxXG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSB0aGlzLmN1cnJlbnRQcm9ncmVzcyA+IDEgPyAxIDogdGhpcy5jdXJyZW50UHJvZ3Jlc3MgXG5cdFx0dGhpcy5tYXAudXBkYXRlUHJvZ3Jlc3MoZS5wcm9ncmVzcylcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5tYXAucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2l0aW9uTWFwXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgYXJvdW5kQm9yZGVyID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciAkY29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmFyb3VuZC1ib3JkZXItY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wID0gZG9tLnNlbGVjdCgnLnRvcCcsICRjb250YWluZXIpXG5cdHZhciBib3R0b20gPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGNvbnRhaW5lcilcblx0dmFyIGxlZnQgPSBkb20uc2VsZWN0KCcubGVmdCcsICRjb250YWluZXIpXG5cdHZhciByaWdodCA9IGRvbS5zZWxlY3QoJy5yaWdodCcsICRjb250YWluZXIpXG5cblx0dmFyICRsZXR0ZXJzQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciB0b3BMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLnRvcCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgYm90dG9tTGV0dGVycyA9IGRvbS5zZWxlY3QoJy5ib3R0b20nLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGxlZnRMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIHJpZ2h0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5yaWdodCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiAkY29udGFpbmVyLFxuXHRcdGxldHRlcnM6ICRsZXR0ZXJzQ29udGFpbmVyLFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgYm9yZGVyU2l6ZSA9IDEwXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MgXVxuXG5cdFx0XHR0b3Auc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYm9yZGVyU2l6ZSArICdweCdcblx0XHRcdGxlZnQuc3R5bGUuaGVpZ2h0ID0gcmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdHJpZ2h0LnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYm9yZGVyU2l6ZSArICdweCdcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3BMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciB0bCA9IHRvcExldHRlcnNbaV1cblx0XHRcdFx0dGwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHR0bC5zdHlsZS50b3AgPSAtMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJvdHRvbUxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJsID0gYm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRibC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGJsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSAxMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlZnRMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsbCA9IGxlZnRMZXR0ZXJzW2ldXG5cdFx0XHRcdGxsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRsbC5zdHlsZS5sZWZ0ID0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpZ2h0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcmwgPSByaWdodExldHRlcnNbaV1cblx0XHRcdFx0cmwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSArIChibG9ja1NpemVbMV0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHJsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gOCArICdweCdcblx0XHRcdH07XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHR0b3BMZXR0ZXJzID0gbnVsbFxuXHRcdFx0Ym90dG9tTGV0dGVycyA9IG51bGxcblx0XHRcdGxlZnRMZXR0ZXJzID0gbnVsbFxuXHRcdFx0cmlnaHRMZXR0ZXJzID0gbnVsbFxuXHRcdH1cblx0fSBcblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJvdW5kQm9yZGVyIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCBvbk1vdXNlRW50ZXIsIG9uTW91c2VMZWF2ZSk9PiB7XG5cdHZhciBzY29wZTtcblx0dmFyIGFycm93c1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuYXJyb3dzLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBsZWZ0QXJyb3cgPSBkb20uc2VsZWN0KCcuYXJyb3cubGVmdCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciByaWdodEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LnJpZ2h0JywgYXJyb3dzV3JhcHBlcilcblx0dmFyIGFycm93cyA9IHtcblx0XHRsZWZ0OiB7XG5cdFx0XHRlbDogbGVmdEFycm93LFxuXHRcdFx0aWNvbnM6IGRvbS5zZWxlY3QuYWxsKCdzdmcnLCBsZWZ0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIGxlZnRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGxlZnRBcnJvdylcblx0XHR9LFxuXHRcdHJpZ2h0OiB7XG5cdFx0XHRlbDogcmlnaHRBcnJvdyxcblx0XHRcdGljb25zOiBkb20uc2VsZWN0LmFsbCgnc3ZnJywgcmlnaHRBcnJvdyksXG5cdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgcmlnaHRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIHJpZ2h0QXJyb3cpXG5cdFx0fVxuXHR9XG5cblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdGxlZnQ6IGFycm93cy5sZWZ0LmVsLFxuXHRcdHJpZ2h0OiBhcnJvd3MucmlnaHQuZWwsXG5cdFx0YmFja2dyb3VuZDogKGRpcik9PiB7XG5cdFx0XHRyZXR1cm4gYXJyb3dzW2Rpcl0uYmFja2dyb3VuZFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgYXJyb3dTaXplID0gZG9tLnNpemUoYXJyb3dzLmxlZnQuaWNvbnNbMV0pXG5cdFx0XHR2YXIgb2Zmc2V0WSA9IDIwXG5cdFx0XHR2YXIgYmdXaWR0aCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblxuXHRcdFx0YXJyb3dzLnJpZ2h0LmVsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYmdXaWR0aCArICdweCdcblxuXHRcdFx0YXJyb3dzLmxlZnQuYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9IGJnV2lkdGggKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5pY29uc1dyYXBwZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYXJyb3dTaXplWzBdID4+IDEpIC0gb2Zmc2V0WSArICdweCdcblx0XHRcdGFycm93cy5sZWZ0Lmljb25zV3JhcHBlci5zdHlsZS5sZWZ0ID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICsgJ3B4J1xuXG5cdFx0XHRhcnJvd3MucmlnaHQuYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9IGJnV2lkdGggKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0Lmljb25zV3JhcHBlci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChhcnJvd1NpemVbMF0gPj4gMSkgLSBvZmZzZXRZICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0Lmljb25zV3JhcHBlci5zdHlsZS5sZWZ0ID0gYmdXaWR0aCAtIGFycm93U2l6ZVswXSAtIEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCArICdweCdcblx0XHRcdFx0XG5cdFx0fSxcblx0XHRvdmVyOiAoZGlyKT0+IHtcblx0XHRcdHZhciBhcnJvdyA9IGFycm93c1tkaXJdXG5cdFx0XHRkb20uY2xhc3Nlcy5hZGQoYXJyb3cuZWwsICdob3ZlcmVkJylcblx0XHR9LFxuXHRcdG91dDogKGRpcik9PiB7XG5cdFx0XHR2YXIgYXJyb3cgPSBhcnJvd3NbZGlyXVxuXHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGFycm93LmVsLCAnaG92ZXJlZCcpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5sZWZ0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLmxlZnQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0YXJyb3dzID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBib3R0b21UZXh0cyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmJvdHRvbS10ZXh0cy1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciBzb2NpYWxXcmFwcGVyID0gZG9tLnNlbGVjdCgnI3NvY2lhbC13cmFwcGVyJywgZWwpXG5cdHZhciB0aXRsZXNXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnRpdGxlcy13cmFwcGVyJywgZWwpXG5cdHZhciBhbGxUaXRsZXMgPSBkb20uc2VsZWN0LmFsbCgnbGknLCB0aXRsZXNXcmFwcGVyKVxuXHR2YXIgdGV4dHNFbHMgPSBkb20uc2VsZWN0LmFsbCgnLnRleHRzLXdyYXBwZXIgLnR4dCcsIGVsKVxuXHR2YXIgdGV4dHMgPSBbXVxuXHR2YXIgaWRzID0gWydnZW5lcmljJywgJ2RlaWEnLCAnYXJlbGx1ZicsICdlcy10cmVuYyddXG5cdHZhciBvbGRUbDtcblx0dmFyIGZpcnN0VGltZSA9IHRydWVcblxuXHR2YXIgb25UaXRsZUNsaWNrZWQgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cdFx0c2NvcGUub3BlblR4dEJ5SWQoaWQpXG5cdH1cblxuXHR2YXIgaSwgdDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxUaXRsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR0ID0gYWxsVGl0bGVzW2ldXG5cdFx0ZG9tLmV2ZW50Lm9uKHQsICdjbGljaycsIG9uVGl0bGVDbGlja2VkKVxuXHR9XG5cblx0dmFyIGlkLCBlLCBpLCBzcGxpdDtcblx0Zm9yIChpID0gMDsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuXHRcdGlkID0gaWRzW2ldXG5cdFx0ZSA9IHRleHRzRWxzW2ldXG5cdFx0XG5cdFx0dGV4dHNbaV0gPSB7XG5cdFx0XHRpZDogaWQsXG5cdFx0XHRlbDogZVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTIF1cblxuXHRcdHZhciBwYWRkaW5nID0gNDBcblx0XHR2YXIgYm9yZGVyQXJvdW5kXG5cdFx0YmxvY2tTaXplWzBdICo9IDIgXG5cdFx0YmxvY2tTaXplWzFdICo9IDIgXG5cdFx0YmxvY2tTaXplWzBdIC09IHBhZGRpbmdcblx0XHRibG9ja1NpemVbMV0gLT0gcGFkZGluZ1xuXHRcdHZhciBpbm5lckJsb2NrU2l6ZSA9IFtibG9ja1NpemVbMF0gLSAxMCwgYmxvY2tTaXplWzFdIC0gMTBdXG5cdFx0dmFyIHRleHRXID0gaW5uZXJCbG9ja1NpemVbMF0gKiAwLjhcblxuXHRcdGVsLnN0eWxlLndpZHRoID0gaW5uZXJCbG9ja1NpemVbMF0gKyAncHgnXG5cdFx0ZWwuc3R5bGUuaGVpZ2h0ID0gaW5uZXJCbG9ja1NpemVbMV0gKyAncHgnXG5cdFx0ZWwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBibG9ja1NpemVbMF0gLSAocGFkZGluZyA+PiAxKSArICdweCdcblx0XHRlbC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdIC0gKHBhZGRpbmcgPj4gMSkgKyAncHgnXG5cblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0dmFyIHNvY2lhbFNpemUgPSBkb20uc2l6ZShzb2NpYWxXcmFwcGVyKVxuXHRcdFx0dmFyIHRpdGxlc1NpemUgPSBkb20uc2l6ZSh0aXRsZXNXcmFwcGVyKVxuXG5cdFx0XHR2YXIgaSwgdGV4dCwgcywgc3BsaXQsIHRsO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0c1tpXVxuXHRcdFx0XHRzID0gZG9tLnNpemUodGV4dC5lbClcblx0XHRcdFx0dGV4dC5lbC5zdHlsZS50b3AgPSAoaW5uZXJCbG9ja1NpemVbMV0gPj4gMSkgLSAoc1sxXSA+PiAxKSArICdweCdcblx0XHRcdFx0c3BsaXQgPSBuZXcgU3BsaXRUZXh0KHRleHQuZWwsIHt0eXBlOlwibGluZXNcIn0pLmxpbmVzXG5cdFx0XHRcdGlmKHRleHQudGwgIT0gdW5kZWZpbmVkKSB0ZXh0LnRsLmNsZWFyKClcblx0XHRcdFx0dGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdFx0XHR0bC5zdGFnZ2VyRnJvbShzcGxpdCwgMSwgeyB5OjUsIHNjYWxlWToyLCBvcGFjaXR5OjAsIGZvcmNlM0Q6dHJ1ZSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnLCBlYXNlOkV4cG8uZWFzZU91dCB9LCAwLjA1LCAwKVxuXHRcdFx0XHR0bC5wYXVzZSgwKVxuXHRcdFx0XHR0ZXh0LnRsID0gdGxcblx0XHRcdH1cblxuXHRcdFx0c29jaWFsV3JhcHBlci5zdHlsZS5sZWZ0ID0gKGlubmVyQmxvY2tTaXplWzBdID4+IDEpIC0gKHNvY2lhbFNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRzb2NpYWxXcmFwcGVyLnN0eWxlLnRvcCA9IGlubmVyQmxvY2tTaXplWzFdIC0gc29jaWFsU2l6ZVsxXSAtIChwYWRkaW5nID4+IDEpICsgJ3B4J1xuXG5cdFx0fSwgMClcblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdG9wZW5UeHRCeUlkOiAoaWQpPT4ge1xuXHRcdFx0dmFyIGksIHRleHQ7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGV4dCA9IHRleHRzW2ldXG5cdFx0XHRcdGlmKGlkID09IHRleHQuaWQpIHtcblx0XHRcdFx0XHRpZihvbGRUbCAhPSB1bmRlZmluZWQpIG9sZFRsLnRpbWVTY2FsZSgyLjYpLnJldmVyc2UoKVxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9PnRleHQudGwudGltZVNjYWxlKDEuMikucGxheSgpLCA2MDApXG5cdFx0XHRcdFx0b2xkVGwgPSB0ZXh0LnRsXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHZhciBpLCB0O1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFRpdGxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0ID0gYWxsVGl0bGVzW2ldXG5cdFx0XHRcdGRvbS5ldmVudC5vZmYodCwgJ2NsaWNrJywgb25UaXRsZUNsaWNrZWQpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dCA9IHRleHRzW2ldXG5cdFx0XHRcdHQudGwuY2xlYXIoKVxuXHRcdFx0fVxuXHRcdFx0aWRzID0gbnVsbFxuXHRcdFx0dGV4dHMgPSBudWxsXG5cdFx0XHRhbGxUaXRsZXMgPSBudWxsXG5cdFx0XHR0ZXh0c0VscyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm90dG9tVGV4dHMiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmV4cG9ydCBkZWZhdWx0IChob2xkZXIsIGNoYXJhY3RlclVybCwgdGV4dHVyZVNpemUpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgdGV4ID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShjaGFyYWN0ZXJVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4KVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHR2YXIgbWFzayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cdGhvbGRlci5hZGRDaGlsZChtYXNrKVxuXG5cdHNwcml0ZS5tYXNrID0gbWFza1xuXG5cdHNjb3BlID0ge1xuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCArICgxMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgKyAoMTAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wM1xuXHRcdFx0c3ByaXRlLnkgKz0gKG5ld3kgLSBzcHJpdGUueSkgKiAwLjAzXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0bWFzay5iZWdpbkZpbGwoMHhmZjAwMDAsIDEpO1xuXHRcdFx0bWFzay5kcmF3UmVjdCgwLCAwLCBzaXplWzBdLCBzaXplWzFdKTtcblx0XHRcdG1hc2suZW5kRmlsbCgpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHR2YXIgc2NhbGUgPSAoKHdpbmRvd0ggLSAxMDApIC8gdGV4dHVyZVNpemUuaGVpZ2h0KSAqIDFcblx0XHRcdFx0c3ByaXRlLnNjYWxlLnggPSBzcHJpdGUuc2NhbGUueSA9IHNjYWxlXG5cdFx0XHRcdHNwcml0ZS54ID0gc2l6ZVswXSA+PiAxXG5cdFx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSAtICgodGV4dHVyZVNpemUuaGVpZ2h0ICogc2NhbGUpID4+IDEpICsgMTBcblx0XHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdFx0c3ByaXRlLml5ID0gc3ByaXRlLnlcblx0XHRcdH0pXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoc3ByaXRlKVxuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKG1hc2spXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdHNwcml0ZS5kZXN0cm95KClcblx0XHRcdHNwcml0ZSA9IG51bGxcblx0XHRcdHRleCA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBjb2xvcnMpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBiZ0NvbG9ycyA9IFtdXG5cdGJnQ29sb3JzLmxlbmd0aCA9IDVcblxuXHR2YXIgdGwgPSBuZXcgVGltZWxpbmVMaXRlKClcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGJnQ29sb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGJnQ29sb3IgPSBuZXcgUElYSS5HcmFwaGljcygpXG5cdFx0YmdDb2xvcnNbaV0gPSBiZ0NvbG9yXG5cdFx0aG9sZGVyLmFkZENoaWxkKGJnQ29sb3IpXG5cdH07XG5cblx0dmFyIG9wZW4gPSAoKT0+IHtcblx0XHR0bC50aW1lU2NhbGUoMS41KVxuXHRcdHRsLnBsYXkoMClcblx0XHRzY29wZS5pc09wZW4gPSB0cnVlXG5cdH1cblx0dmFyIGNsb3NlID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDIpXG5cdFx0dGwucmV2ZXJzZSgpXG5cdFx0c2NvcGUuaXNPcGVuID0gZmFsc2Vcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHRsOiB0bCxcblx0XHRpc09wZW46IGZhbHNlLFxuXHRcdGhvbGRlcjogaG9sZGVyLFxuXHRcdG9wZW46IG9wZW4sXG5cdFx0Y2xvc2U6IGNsb3NlLFxuXHRcdHJlc2l6ZTogKHdpZHRoLCBoZWlnaHQsIGRpcmVjdGlvbik9PntcblxuXHRcdFx0dGwuY2xlYXIoKVxuXG5cdFx0XHR2YXIgaHMgPSBjb2xvcnMuZnJvbS5oIC0gY29sb3JzLnRvLmhcblx0XHRcdHZhciBzcyA9IGNvbG9ycy5mcm9tLnMgLSBjb2xvcnMudG8uc1xuXHRcdFx0dmFyIHZzID0gY29sb3JzLmZyb20udiAtIGNvbG9ycy50by52XG5cdFx0XHR2YXIgbGVuID0gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcEggPSBocyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBTID0gc3MgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwViA9IHZzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgaGQgPSAoaHMgPCAwKSA/IC0xIDogMVxuXHRcdFx0dmFyIHNkID0gKHNzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciB2ZCA9ICh2cyA8IDApID8gLTEgOiAxXG5cblx0XHRcdHZhciBkZWxheSA9IDAuMTJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0dmFyIGJnQ29sb3IgPSBiZ0NvbG9yc1tpXVxuXHRcdFx0XHR2YXIgaCA9IE1hdGgucm91bmQoY29sb3JzLmZyb20uaCArIChzdGVwSCppKmhkKSlcblx0XHRcdFx0dmFyIHMgPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLnMgKyAoc3RlcFMqaSpzZCkpXG5cdFx0XHRcdHZhciB2ID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS52ICsgKHN0ZXBWKmkqdmQpKVxuXHRcdFx0XHR2YXIgYyA9ICcweCcgKyBjb2xvclV0aWxzLmhzdlRvSGV4KGgsIHMsIHYpXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRiZ0NvbG9yLmJlZ2luRmlsbChjLCAxKTtcblx0XHRcdFx0YmdDb2xvci5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblx0XHRcdFx0YmdDb2xvci5lbmRGaWxsKCk7XG5cblx0XHRcdFx0c3dpdGNoKGRpcmVjdGlvbikge1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlRPUDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTpoZWlnaHQgfSwgeyB5Oi1oZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuQk9UVE9NOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB5Oi1oZWlnaHQgfSwgeyB5OmhlaWdodCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5MRUZUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4OndpZHRoIH0sIHsgeDotd2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuUklHSFQ6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHg6LXdpZHRoIH0sIHsgeDp3aWR0aCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH07XG5cblx0XHRcdHRsLnBhdXNlKDApXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHR0bC5jbGVhcigpXG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChob2xkZXIpXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJnQ29sb3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0YmdDb2xvci5jbGVhcigpXG5cdFx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChiZ0NvbG9yKVxuXHRcdFx0XHRiZ0NvbG9yID0gbnVsbFxuXHRcdFx0fTtcblx0XHRcdGJnQ29sb3JzID0gbnVsbFxuXHRcdFx0dGwgPSBudWxsXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBiZ1VybCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHR2YXIgYmdUZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShiZ1VybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZShiZ1RleHR1cmUpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHNwcml0ZS5tYXNrID0gbWFza1xuXG5cdHNjb3BlID0ge1xuXHRcdGhvbGRlcjogaG9sZGVyLFxuXHRcdGJnU3ByaXRlOiBzcHJpdGUsXG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4IC0gKDMwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSAtICgyMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAwOFxuXHRcdFx0c3ByaXRlLnkgKz0gKG5ld3kgLSBzcHJpdGUueSkgKiAwLjAwOFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0bWFzay5iZWdpbkZpbGwoMHhmZjAwMDAsIDEpO1xuXHRcdFx0bWFzay5kcmF3UmVjdCgwLCAwLCBzaXplWzBdLCBzaXplWzFdKTtcblx0XHRcdG1hc2suZW5kRmlsbCgpO1xuXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoc2l6ZVswXSwgc2l6ZVsxXSwgOTYwLCAxMDI0KVxuXG5cdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdID4+IDFcblx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSByZXNpemVWYXJzLnNjYWxlICsgMC4xXG5cdFx0XHRzcHJpdGUuaXggPSBzcHJpdGUueFxuXHRcdFx0c3ByaXRlLml5ID0gc3ByaXRlLnlcblxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKG1hc2spXG5cdFx0XHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0XHRtYXNrID0gbnVsbFxuXHRcdFx0c3ByaXRlID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBjb2xvcnlSZWN0cyBmcm9tICdjb2xvcnktcmVjdHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAocHhDb250YWluZXIsIHBhcmVudCwgbW91c2UsIGRhdGEsIHByb3BzKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBvbkNsb3NlVGltZW91dDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmZ1bi1mYWN0LXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciB2aWRlb1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudmlkZW8td3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZVdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS13cmFwcGVyJywgZWwpXG5cdHZhciBtZXNzYWdlSW5uZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS1pbm5lcicsIG1lc3NhZ2VXcmFwcGVyKVxuXHR2YXIgcHIgPSBwcm9wcztcblxuXHR2YXIgc3BsaXR0ZXIgPSBuZXcgU3BsaXRUZXh0KG1lc3NhZ2VJbm5lciwge3R5cGU6XCJ3b3Jkc1wifSlcblxuXHR2YXIgYyA9IGRvbS5zZWxlY3QoJy5jdXJzb3ItY3Jvc3MnLCBlbClcblx0dmFyIGNyb3NzID0ge1xuXHRcdHg6IDAsXG5cdFx0eTogMCxcblx0XHRlbDogYyxcblx0XHRzaXplOiBkb20uc2l6ZShjKVxuXHR9XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgbGVmdFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cdHZhciByaWdodFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cblx0dmFyIG1CZ0NvbG9yID0gZGF0YVsnYW1iaWVudC1jb2xvciddLnRvXG5cdG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgobUJnQ29sb3IuaCwgbUJnQ29sb3IucywgbUJnQ29sb3IudilcblxuXHR2YXIgbGVmdFRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0dmFyIHJpZ2h0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZSxcblx0XHRsb29wOiB0cnVlXG5cdH0pXG5cdHZhciB2aWRlb1NyYyA9IGRhdGFbJ2Z1bi1mYWN0LXZpZGVvLXVybCddXG5cdG1WaWRlby5hZGRUbyh2aWRlb1dyYXBwZXIpXG5cdG1WaWRlby5sb2FkKHZpZGVvU3JjLCAoKT0+IHtcblx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0dmFyIG9uQ2xvc2VGdW5GYWN0ID0gKCk9PiB7XG5cdFx0aWYoIXNjb3BlLmlzT3BlbikgcmV0dXJuXG5cdFx0QXBwQWN0aW9ucy5jbG9zZUZ1bkZhY3QoKVxuXHR9XG5cblx0dmFyIG9wZW4gPSAoKT0+IHtcblx0XHRlbC5zdHlsZVsnei1pbmRleCddID0gMjlcblx0XHRzY29wZS5pc09wZW4gPSB0cnVlXG5cdFx0c2NvcGUubGVmdFJlY3RzLm9wZW4oKVxuXHRcdHNjb3BlLnJpZ2h0UmVjdHMub3BlbigpXG5cdFx0dmFyIGRlbGF5ID0gMzUwXG5cdFx0c2V0VGltZW91dCgoKT0+bGVmdFRsLnRpbWVTY2FsZSgxLjUpLnBsYXkoMCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9PnJpZ2h0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+bVZpZGVvLnBsYXkoKSwgZGVsYXkrMjAwKVxuXHRcdGNsZWFyVGltZW91dChvbkNsb3NlVGltZW91dClcblx0XHRvbkNsb3NlVGltZW91dCA9IHNldFRpbWVvdXQoKCk9PmRvbS5ldmVudC5vbihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KSwgZGVsYXkrMjAwKVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnbm9uZSdcblx0XHRkb20uY2xhc3Nlcy5hZGQoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdGVsLnN0eWxlWyd6LWluZGV4J10gPSAyN1xuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdFx0c2NvcGUubGVmdFJlY3RzLmNsb3NlKClcblx0XHRzY29wZS5yaWdodFJlY3RzLmNsb3NlKClcblx0XHR2YXIgZGVsYXkgPSA1MFxuXHRcdHNldFRpbWVvdXQoKCk9PmxlZnRUbC50aW1lU2NhbGUoMikucmV2ZXJzZSgpLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5yaWdodFRsLnRpbWVTY2FsZSgyKS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnYXV0bydcblx0XHRkb20uZXZlbnQub2ZmKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpXG5cdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0b3Blbjogb3Blbixcblx0XHRjbG9zZTogY2xvc2UsXG5cdFx0bGVmdFJlY3RzOiBsZWZ0UmVjdHMsXG5cdFx0cmlnaHRSZWN0czogcmlnaHRSZWN0cyxcblx0XHRyZXNpemU6ICgpPT57XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgbWlkV2luZG93VyA9ICh3aW5kb3dXID4+IDEpXG5cblx0XHRcdHZhciBzaXplID0gW21pZFdpbmRvd1cgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5UT1ApXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzLnJlc2l6ZShzaXplWzBdLCBzaXplWzFdLCBBcHBDb25zdGFudHMuQk9UVE9NKVxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cy5ob2xkZXIueCA9IHdpbmRvd1cgLyAyXG5cdFx0XHRcdFxuXHRcdFx0Ly8gaWYgdmlkZW8gaXNuJ3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHZhciB2aWRlb1dyYXBwZXJSZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShtaWRXaW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cgPj4gMSwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUud2lkdGggPSBtZXNzYWdlV3JhcHBlci5zdHlsZS53aWR0aCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5sZWZ0ID0gbWlkV2luZG93VyArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS53aWR0aCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUuaGVpZ2h0ID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUudG9wID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy50b3AgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUubGVmdCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMubGVmdCArICdweCdcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIG1lc3NhZ2VJbm5lclNpemUgPSBkb20uc2l6ZShtZXNzYWdlSW5uZXIpXG5cdFx0XHRcdG1lc3NhZ2VJbm5lci5zdHlsZS5sZWZ0ID0gKG1pZFdpbmRvd1cgPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0bWVzc2FnZUlubmVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHR9LCAwKVxuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0XHRyaWdodFRsLmNsZWFyKClcblxuXHRcdFx0XHRsZWZ0VGwuZnJvbVRvKG1lc3NhZ2VXcmFwcGVyLCAxLjQsIHsgeTp3aW5kb3dILCBzY2FsZVk6MywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnIH0sIHsgeTowLCBzY2FsZVk6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHRcdFx0bGVmdFRsLnN0YWdnZXJGcm9tKHNwbGl0dGVyLndvcmRzLCAxLCB7IHk6MTQwMCwgc2NhbGVZOjYsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC4wNiwgMC4yKVxuXHRcdFx0XHRyaWdodFRsLmZyb21Ubyh2aWRlb1dyYXBwZXIsIDEuNCwgeyB5Oi13aW5kb3dIKjIsIHNjYWxlWTozLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblxuXHRcdFx0XHRsZWZ0VGwucGF1c2UoMClcblx0XHRcdFx0cmlnaHRUbC5wYXVzZSgwKVxuXHRcdFx0XHRtZXNzYWdlV3JhcHBlci5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdH0sIDUpXG5cblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRcdHZhciBuZXd4ID0gbW91c2UueCAtIChjcm9zcy5zaXplWzBdID4+IDEpXG5cdFx0XHR2YXIgbmV3eSA9IG1vdXNlLnkgLSAoY3Jvc3Muc2l6ZVsxXSA+PiAxKVxuXHRcdFx0Y3Jvc3MueCArPSAobmV3eCAtIGNyb3NzLngpICogMC41XG5cdFx0XHRjcm9zcy55ICs9IChuZXd5IC0gY3Jvc3MueSkgKiAwLjVcblx0XHRcdFV0aWxzLlRyYW5zbGF0ZShjcm9zcy5lbCwgY3Jvc3MueCwgY3Jvc3MueSwgMSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGRvbS5ldmVudC5vZmYocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdClcblx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChob2xkZXIpXG5cdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0cmlnaHRUbC5jbGVhcigpXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMuY2xlYXIoKVxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cy5jbGVhcigpXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMgPSBudWxsXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzID0gbnVsbFxuXHRcdFx0bGVmdFRsID0gbnVsbFxuXHRcdFx0cmlnaHRUbCA9IG51bGxcblx0XHRcdGhvbGRlciA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IHZpZGVvQ2FudmFzIGZyb20gJ3ZpZGVvLWNhbnZhcydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBncmlkUG9zaXRpb25zIGZyb20gJ2dyaWQtcG9zaXRpb25zJ1xuaW1wb3J0IG1lZGlhQ2VsbCBmcm9tICdtZWRpYS1jZWxsJ1xuXG52YXIgZ3JpZCA9IChwcm9wcywgcGFyZW50LCBvbkl0ZW1FbmRlZCk9PiB7XG5cblx0dmFyIHZpZGVvRW5kZWQgPSAoaXRlbSk9PiB7XG5cdFx0b25JdGVtRW5kZWQoaXRlbSlcblx0XHRzY29wZS50cmFuc2l0aW9uT3V0SXRlbShpdGVtKVxuXHR9XG5cblx0dmFyIGltYWdlRW5kZWQgPSAoaXRlbSk9PiB7XG5cdFx0b25JdGVtRW5kZWQoaXRlbSlcblx0XHRzY29wZS50cmFuc2l0aW9uT3V0SXRlbShpdGVtKVxuXHR9XG5cblx0dmFyIGdyaWRDb250YWluZXIgPSBkb20uc2VsZWN0KFwiLmdyaWQtY29udGFpbmVyXCIsIHBhcmVudClcblx0dmFyIGdyaWRGcm9udENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1mcm9udC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgbGluZXNHcmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmxpbmVzLWdyaWQtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgZ3JpZENoaWxkcmVuID0gZ3JpZENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgZ3JpZEZyb250Q2hpbGRyZW4gPSBncmlkRnJvbnRDb250YWluZXIuY2hpbGRyZW5cblx0dmFyIGxpbmVzSG9yaXpvbnRhbCA9IGRvbS5zZWxlY3QoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLmhvcml6b250YWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgbGluZXNWZXJ0aWNhbCA9IGRvbS5zZWxlY3QoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLnZlcnRpY2FsLWxpbmVzXCIsIHBhcmVudCkuY2hpbGRyZW5cblx0dmFyIHNjb3BlO1xuXHR2YXIgY3VycmVudFNlYXQ7XG5cdHZhciBjZWxscyA9IFtdXG5cdHZhciB0b3RhbE51bSA9IHByb3BzLmRhdGEuZ3JpZC5sZW5ndGhcblx0dmFyIHZpZGVvcyA9IEFwcFN0b3JlLmdldEhvbWVWaWRlb3MoKVxuXG5cdHZhciBzZWF0cyA9IFtcblx0XHQxLCAzLCA1LFxuXHRcdDcsIDksIDExLCAxMyxcblx0XHQxNSwgXG5cdFx0MjEsIDIzLCAyNVxuXHRdXG5cblx0dmFyIHZDYW52YXNQcm9wcyA9IHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0dm9sdW1lOiAwLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdG9uRW5kZWQ6IHZpZGVvRW5kZWRcblx0fVxuXG5cdHZhciBtQ2VsbDtcblx0dmFyIGNvdW50ZXIgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTnVtOyBpKyspIHtcblx0XHR2YXIgdlBhcmVudCA9IGdyaWRDaGlsZHJlbltpXVxuXHRcdHZhciBmUGFyZW50ID0gZ3JpZEZyb250Q2hpbGRyZW5baV1cblx0XHRjZWxsc1tpXSA9IHVuZGVmaW5lZFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2VhdHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmKGkgPT0gc2VhdHNbal0pIHtcblx0XHRcdFx0bUNlbGwgPSBtZWRpYUNlbGwodlBhcmVudCwgZlBhcmVudCwgdmlkZW9zW2NvdW50ZXJdKVxuXHRcdFx0XHRjZWxsc1tpXSA9IG1DZWxsXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoZ0dyaWQpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgb3JpZ2luYWxWaWRlb1NpemUgPSBBcHBDb25zdGFudHMuSE9NRV9WSURFT19TSVpFXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IGdHcmlkLmJsb2NrU2l6ZVxuXG5cdFx0bGluZXNHcmlkQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG5cdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdLCBvcmlnaW5hbFZpZGVvU2l6ZVswXSwgb3JpZ2luYWxWaWRlb1NpemVbMV0pXG5cdFx0XG5cdFx0dmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHR2YXIgcGFyZW50LCBjZWxsO1xuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgaGwsIHZsO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZ1Bvcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gaG9yaXpvbnRhbCBsaW5lc1xuXHRcdFx0aWYoaSA+IDApIHtcblx0XHRcdFx0aGwgPSBzY29wZS5saW5lcy5ob3Jpem9udGFsW2ktMV1cblx0XHRcdFx0aGwuc3R5bGUudG9wID0gYmxvY2tTaXplWzFdICogaSArICdweCdcblx0XHRcdFx0aGwuc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdmVydGljYWwgbGluZXNcblx0XHRcdFx0aWYoaSA9PSAwICYmIGogPiAwKSB7XG5cdFx0XHRcdFx0dmwgPSBzY29wZS5saW5lcy52ZXJ0aWNhbFtqLTFdXG5cdFx0XHRcdFx0dmwuc3R5bGUubGVmdCA9IGJsb2NrU2l6ZVswXSAqIGogKyAncHgnXG5cdFx0XHRcdFx0dmwuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNlbGwgPSBzY29wZS5jZWxsc1tjb3VudF1cblx0XHRcdFx0aWYoY2VsbCAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsLnJlc2l6ZShibG9ja1NpemUsIHJvd1tqXSwgcmVzaXplVmFycylcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBncmlkQ29udGFpbmVyLFxuXHRcdGNoaWxkcmVuOiBncmlkQ2hpbGRyZW4sXG5cdFx0Y2VsbHM6IGNlbGxzLFxuXHRcdG51bTogdG90YWxOdW0sXG5cdFx0cG9zaXRpb25zOiBbXSxcblx0XHRsaW5lczoge1xuXHRcdFx0aG9yaXpvbnRhbDogbGluZXNIb3Jpem9udGFsLFxuXHRcdFx0dmVydGljYWw6IGxpbmVzVmVydGljYWxcblx0XHR9LFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdGluaXQ6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5pbml0KClcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRyYW5zaXRpb25Jbkl0ZW06IChpbmRleCwgdHlwZSk9PiB7XG5cdFx0XHQvLyB2YXIgaXRlbSA9IHNjb3BlLmNlbGxzW2luZGV4XVxuXHRcdFx0Ly8gaXRlbS5zZWF0ID0gaW5kZXhcblxuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LmFkZCgnZW5hYmxlJylcblx0XHRcdFxuXHRcdFx0Ly8gaWYodHlwZSA9PSBBcHBDb25zdGFudHMuSVRFTV9WSURFTykge1xuXHRcdFx0Ly8gXHRpdGVtLnBsYXkoKVxuXHRcdFx0Ly8gfWVsc2V7XG5cdFx0XHQvLyBcdGl0ZW0udGltZW91dChpbWFnZUVuZGVkLCAyMDAwKVxuXHRcdFx0Ly8gXHRpdGVtLnNlZWsoVXRpbHMuUmFuZCgyLCAxMCwgMCkpXG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uT3V0SXRlbTogKGl0ZW0pPT4ge1xuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZW5hYmxlJylcblxuXHRcdFx0Ly8gaXRlbS52aWRlby5jdXJyZW50VGltZSgwKVxuXHRcdFx0Ly8gaXRlbS5wYXVzZSgpXG5cdFx0XHQvLyBzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHQvLyBcdGl0ZW0uZHJhd09uY2UoKVxuXHRcdFx0Ly8gfSwgNTAwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5jbGVhcigpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiLypcblx0d2lkdGg6IFx0XHR3aWR0aCBvZiBncmlkXG5cdGhlaWdodDogXHRoZWlnaHQgb2YgZ3JpZFxuXHRjb2x1bW5zOiBcdG51bWJlciBvZiBjb2x1bW5zXG5cdHJvd3M6IFx0XHRudW1iZXIgb2Ygcm93c1xuXHR0eXBlOiBcdFx0dHlwZSBvZiB0aGUgYXJyYXlcblx0XHRcdFx0bGluZWFyIC0gd2lsbCBnaXZlIGFsbCB0aGUgY29scyBhbmQgcm93cyBwb3NpdGlvbiB0b2dldGhlciBvbmUgYWZ0ZXIgdGhlIG90aGVyXG5cdFx0XHRcdGNvbHNfcm93cyAtIHdpbGwgZ2l2ZSBzZXBhcmF0ZSByb3dzIGFycmF5cyB3aXRoIHRoZSBjb2xzIGluc2lkZSBcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm93WyBbY29sXSwgW2NvbF0sIFtjb2xdLCBbY29sXSBdXG4qL1xuXG5leHBvcnQgZGVmYXVsdCAod2lkdGgsIGhlaWdodCwgY29sdW1ucywgcm93cywgdHlwZSk9PiB7XG5cblx0dmFyIHQgPSB0eXBlIHx8ICdsaW5lYXInXG5cdHZhciBibG9ja1NpemUgPSBbIHdpZHRoIC8gY29sdW1ucywgaGVpZ2h0IC8gcm93cyBdXG5cdHZhciBibG9ja3NMZW4gPSByb3dzICogY29sdW1uc1xuXHR2YXIgcG9zaXRpb25zID0gW11cblx0XG5cdHZhciBwb3NYID0gMFxuXHR2YXIgcG9zWSA9IDBcblx0dmFyIGNvbHVtbkNvdW50ZXIgPSAwXG5cdHZhciByb3dzQ291bnRlciA9IDBcblx0dmFyIHJyID0gW11cblxuXHRzd2l0Y2godCkge1xuXHRcdGNhc2UgJ2xpbmVhcic6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdFx0XHRjb2x1bW5Db3VudGVyICs9IDFcblx0XHRcdFx0cG9zaXRpb25zW2ldID0gYlxuXHRcdFx0fTtcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnY29sc19yb3dzJzogXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrc0xlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cdFx0XHRcdHJyLnB1c2goYilcblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdGlmKGNvbHVtbkNvdW50ZXIgPj0gY29sdW1ucykge1xuXHRcdFx0XHRcdHBvc1ggPSAwXG5cdFx0XHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdFx0XHRjb2x1bW5Db3VudGVyID0gMFxuXHRcdFx0XHRcdHBvc2l0aW9uc1tyb3dzQ291bnRlcl0gPSByclxuXHRcdFx0XHRcdHJyID0gW11cblx0XHRcdFx0XHRyb3dzQ291bnRlcisrXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHR9XG5cblxuXHRyZXR1cm4ge1xuXHRcdHJvd3M6IHJvd3MsXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRibG9ja1NpemU6IGJsb2NrU2l6ZSxcblx0XHRwb3NpdGlvbnM6IHBvc2l0aW9uc1xuXHR9XG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgaGVhZGVyTGlua3MgPSAocGFyZW50KT0+IHtcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvblN1Yk1lbnVNb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLmFkZChlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgY2FtcGVyTGFiRWwgPSBkb20uc2VsZWN0KCcuY2FtcGVyLWxhYicsIHBhcmVudClcblx0dmFyIHNob3BFbCA9IGRvbS5zZWxlY3QoJy5zaG9wLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBtYXBFbCA9IGRvbS5zZWxlY3QoJy5tYXAtYnRuJywgcGFyZW50KVxuXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblN1Yk1lbnVNb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAvIDNcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtIGRvbS5zaXplKGNhbXBlckxhYkVsKVswXSxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgc2hvcENzcyA9IHtcblx0XHRcdFx0bGVmdDogY2FtcGVyTGFiQ3NzLmxlZnQgLSBkb20uc2l6ZShzaG9wRWwpWzBdIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSBkb20uc2l6ZShtYXBFbClbMF0gLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUubGVmdCA9IGNhbXBlckxhYkNzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS5sZWZ0ID0gc2hvcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUubGVmdCA9IG1hcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lcik9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0Ly8gdmFyIGNhbnZhc2VzID0gZWwuY2hpbGRyZW5cblx0Ly8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHQvLyB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdHZhciBvbkltZ0xvYWRlZENhbGxiYWNrO1xuXHR2YXIgZ3JpZDtcblx0dmFyIGltYWdlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBhbmltID0ge1xuXHRcdHg6MCxcblx0XHR5OjBcblx0fVxuXG5cblx0Ly8gdmFyIGl0ZW1zID0gW11cblx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuXHQvLyBcdHZhciB0bXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBcblx0Ly8gXHRpdGVtc1tpXSA9IHtcblx0Ly8gXHRcdGNhbnZhczogY2FudmFzZXNbaV0sXG5cdC8vIFx0XHRjdHg6IGNhbnZhc2VzW2ldLmdldENvbnRleHQoJzJkJyksXG5cdC8vIFx0XHR0bXBDYW52YXM6IHRtcENhbnZhcyxcblx0Ly8gXHRcdHRtcENvbnRleHQ6IHRtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cdC8vIFx0fVxuXHQvLyB9XG5cblx0dmFyIG9uSW1nUmVhZHkgPSAoZXJyb3IsIGkpPT4ge1xuXHRcdGltYWdlID0gaVxuXHRcdGRvbS50cmVlLmFkZChlbCwgaW1hZ2UpXG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoZ3JpZClcblx0XHRpZihvbkltZ0xvYWRlZENhbGxiYWNrKSBvbkltZ0xvYWRlZENhbGxiYWNrKClcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRyZXNpemU6IChnR3JpZCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdGdyaWQgPSBnR3JpZFxuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHZhciByZXNpemVWYXJzQmcgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVywgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXHRcdFx0aW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0XHRpbWFnZS5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnNCZy53aWR0aCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnNCZy5oZWlnaHQgKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS50b3AgPSByZXNpemVWYXJzQmcudG9wICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnNCZy5sZWZ0ICsgJ3B4J1xuXG5cdFx0XHQvLyB2YXIgYmxvY2tTaXplID0gZ0dyaWQuYmxvY2tTaXplXG5cdFx0XHQvLyB2YXIgaW1hZ2VCbG9ja1NpemUgPSBbIHJlc2l6ZVZhcnNCZy53aWR0aCAvIGdHcmlkLmNvbHVtbnMsIHJlc2l6ZVZhcnNCZy5oZWlnaHQgLyBnR3JpZC5yb3dzIF1cblx0XHRcdC8vIHZhciBnUG9zID0gZ0dyaWQucG9zaXRpb25zXG5cdFx0XHQvLyB2YXIgY291bnQgPSAwXG5cdFx0XHQvLyB2YXIgY2FudmFzLCBjdHgsIHRtcENvbnRleHQsIHRtcENhbnZhcztcblxuXHRcdFx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBnUG9zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQvLyBcdHZhciByb3cgPSBnUG9zW2ldXG5cblx0XHRcdC8vIFx0Zm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcblx0XHRcdC8vIFx0XHRjYW52YXMgPSBpdGVtc1tjb3VudF0uY2FudmFzXG5cdFx0XHQvLyBcdFx0Y3R4ID0gaXRlbXNbY291bnRdLmN0eFxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQgPSBpdGVtc1tjb3VudF0udG1wQ29udGV4dFxuXHRcdFx0Ly8gXHRcdHRtcENhbnZhcyA9IGl0ZW1zW2NvdW50XS50bXBDYW52YXNcblxuXHRcdFx0Ly8gXHRcdC8vIGJsb2NrIGRpdnNcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUubGVmdCA9IHJvd1tqXVswXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUudG9wID0gcm93W2pdWzFdICsgJ3B4J1xuXG5cdFx0XHQvLyBcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LnNhdmUoKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuZHJhd0ltYWdlKGltYWdlLCBpbWFnZUJsb2NrU2l6ZVswXSpqLCBpbWFnZUJsb2NrU2l6ZVsxXSppLCBpbWFnZUJsb2NrU2l6ZVswXSwgaW1hZ2VCbG9ja1NpemVbMV0sIDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5yZXN0b3JlKClcblx0XHRcdC8vIFx0XHRjdHguZHJhd0ltYWdlKHRtcENhbnZhcywgMCwgMClcblxuXHRcdFx0Ly8gXHRcdGNvdW50Kytcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gfVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXG5cdFx0XHRhbmltLnggKz0gKCgobW91c2UublgtMC41KSo0MCkgLSBhbmltLngpICogMC4wNVxuXHRcdFx0YW5pbS55ICs9ICgoKG1vdXNlLm5ZLTAuNSkqMjApIC0gYW5pbS55KSAqIDAuMDVcblx0XHRcdFV0aWxzLlRyYW5zbGF0ZShpbWFnZSwgYW5pbS54LCBhbmltLnksIDEpXG5cblx0XHR9LFxuXHRcdGxvYWQ6ICh1cmwsIGNiKT0+IHtcblx0XHRcdG9uSW1nTG9hZGVkQ2FsbGJhY2sgPSBjYlxuXHRcdFx0aW1nKHVybCwgb25JbWdSZWFkeSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGVsID0gbnVsbFxuXHRcdFx0aW1hZ2UgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGltZyBmcm9tICdpbWcnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGRhdGEsIG1vdXNlLCBvbk1vdXNlRXZlbnRzSGFuZGxlcik9PiB7XG5cblx0dmFyIGFuaW1QYXJhbXMgPSAocGFyZW50LCBlbCwgaW1nV3JhcHBlcik9PiB7XG5cdFx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0bC5mcm9tVG8oaW1nV3JhcHBlciwgMSwge3NjYWxlWDoxLjcsIHNjYWxlWToxLjMsIHJvdGF0aW9uOicyZGVnJywgeTotMjAsIG9wYWNpdHk6MCwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSB9LCB7IHNjYWxlWDoxLCBzY2FsZVk6MSwgcm90YXRpb246JzBkZWcnLCB5OjAsIG9wYWNpdHk6MSwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpCYWNrLmVhc2VJbk91dH0sIDApXG5cdFx0dGwucGF1c2UoMClcblx0XHRyZXR1cm4ge1xuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHRpbWdXcmFwcGVyOiBpbWdXcmFwcGVyLFxuXHRcdFx0dGw6IHRsLFxuXHRcdFx0ZWw6IGVsLFxuXHRcdFx0dGltZTogMCxcblx0XHRcdHBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdGlwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIGZzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gaXNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gdmVsb2NpdHlTY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0cm90YXRpb246IDAsXG5cdFx0XHRjb25maWc6IHtcblx0XHRcdFx0bGVuZ3RoOiAwLFxuXHRcdFx0XHRzcHJpbmc6IDAuOCxcblx0XHRcdFx0ZnJpY3Rpb246IDAuNFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1haW4tYnRucy13cmFwcGVyJywgY29udGFpbmVyKVxuXHR2YXIgc2hvcEJ0biA9IGRvbS5zZWxlY3QoJyNzaG9wLWJ0bicsIGVsKVxuXHR2YXIgZnVuQnRuID0gZG9tLnNlbGVjdCgnI2Z1bi1mYWN0LWJ0bicsIGVsKVxuXHR2YXIgc2hvcEltZ1dyYXBwZXIgID0gZG9tLnNlbGVjdCgnLmltZy13cmFwcGVyJywgc2hvcEJ0bilcblx0dmFyIGZ1bkltZ1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuaW1nLXdyYXBwZXInLCBmdW5CdG4pXG5cdHZhciBzaG9wU2l6ZSwgZnVuU2l6ZTtcblx0dmFyIGxvYWRDb3VudGVyID0gMFxuXHR2YXIgYnV0dG9uU2l6ZSA9IFswLCAwXVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgdHJhbnNsYXRlID0gVXRpbHMuVHJhbnNsYXRlXG5cdHZhciBzaG9wQW5pbSwgZnVuQW5pbSwgY3VycmVudEFuaW07XG5cdHZhciBidXR0b25zID0ge1xuXHRcdCdzaG9wLWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH0sXG5cdFx0J2Z1bi1mYWN0LWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXG5cdHZhciBzaG9wSW1nID0gaW1nKCdpbWFnZS9zaG9wLycrQXBwU3RvcmUubGFuZygpKycucG5nJywgKCk9PiB7XG5cdFx0c2hvcEFuaW0gPSBhbmltUGFyYW1zKHNob3BCdG4sIHNob3BJbWcsIHNob3BJbWdXcmFwcGVyKVxuXHRcdGJ1dHRvbnNbJ3Nob3AtYnRuJ10uYW5pbSA9IHNob3BBbmltXG5cdFx0c2hvcFNpemUgPSBbc2hvcEltZy53aWR0aCwgc2hvcEltZy5oZWlnaHRdXG5cdFx0ZG9tLnRyZWUuYWRkKHNob3BJbWdXcmFwcGVyLCBzaG9wSW1nKVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cdHZhciBmdW5JbWcgPSBpbWcoJ2ltYWdlL2Z1bi1mYWN0cy5wbmcnLCAoKT0+IHtcblx0XHRmdW5BbmltID0gYW5pbVBhcmFtcyhmdW5CdG4sIGZ1bkltZywgZnVuSW1nV3JhcHBlcilcblx0XHRidXR0b25zWydmdW4tZmFjdC1idG4nXS5hbmltID0gZnVuQW5pbVxuXHRcdGZ1blNpemUgPSBbZnVuSW1nLndpZHRoLCBmdW5JbWcuaGVpZ2h0XVxuXHRcdGRvbS50cmVlLmFkZChmdW5JbWdXcmFwcGVyLCBmdW5JbWcpXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cblx0dmFyIHVwZGF0ZUFuaW0gPSAoYW5pbSk9PiB7XG5cdFx0aWYoYW5pbSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdGFuaW0udGltZSArPSAwLjFcblx0XHRhbmltLmZwb3NpdGlvbi54ID0gYW5pbS5pcG9zaXRpb24ueFxuXHRcdGFuaW0uZnBvc2l0aW9uLnkgPSBhbmltLmlwb3NpdGlvbi55XG5cdFx0YW5pbS5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogODBcblx0XHRhbmltLmZwb3NpdGlvbi55ICs9IChtb3VzZS5uWSAtIDAuNSkgKiAyMDBcblxuXHRcdHNwcmluZ1RvKGFuaW0sIGFuaW0uZnBvc2l0aW9uLCAxKVxuXHRcdGFuaW0uY29uZmlnLmxlbmd0aCArPSAoMC4wMSAtIGFuaW0uY29uZmlnLmxlbmd0aCkgKiAwLjFcblx0XHRcblx0XHR0cmFuc2xhdGUoYW5pbS5lbCwgYW5pbS5wb3NpdGlvbi54ICsgYW5pbS52ZWxvY2l0eS54LCBhbmltLnBvc2l0aW9uLnkgKyBhbmltLnZlbG9jaXR5LnksIDEpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFcgPSB3aW5kb3dXID4+IDFcblx0XHRcdHZhciBzY2FsZSA9IDAuOFxuXHRcdFx0XG5cdFx0XHRidXR0b25TaXplWzBdID0gbWlkVyAqIDAuOVxuXHRcdFx0YnV0dG9uU2l6ZVsxXSA9IHdpbmRvd0hcblxuXHRcdFx0aWYoc2hvcFNpemUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHNob3BCdG4uc3R5bGUud2lkdGggPSBidXR0b25TaXplWzBdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUubGVmdCA9IChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSArICdweCdcblx0XHRcdFx0XG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLndpZHRoID0gc2hvcFNpemVbMF0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHNob3BTaXplWzFdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS5sZWZ0ID0gKGJ1dHRvblNpemVbMF0gPj4gMSkgLSAoc2hvcFNpemVbMF0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLnRvcCA9IChidXR0b25TaXplWzFdID4+IDEpIC0gKHNob3BTaXplWzFdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0fVxuXHRcdFx0aWYoZnVuU2l6ZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS5sZWZ0ID0gbWlkVyArIChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChidXR0b25TaXplWzFdID4+IDEpICsgJ3B4J1xuXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUud2lkdGggPSBmdW5TaXplWzBdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLmhlaWdodCA9IGZ1blNpemVbMV0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUubGVmdCA9IChidXR0b25TaXplWzBdID4+IDEpIC0gKGZ1blNpemVbMF0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUudG9wID0gKGJ1dHRvblNpemVbMV0gPj4gMSkgLSAoZnVuU2l6ZVsxXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdH1cblx0XHR9LFxuXHRcdG92ZXI6IChpZCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNBY3RpdmUpIHJldHVyblxuXHRcdFx0Y3VycmVudEFuaW0gPSBidXR0b25zW2lkXS5hbmltXG5cdFx0XHRjdXJyZW50QW5pbS50bC50aW1lU2NhbGUoMi42KS5wbGF5KDApXG5cdFx0XHRjdXJyZW50QW5pbS5jb25maWcubGVuZ3RoID0gNDAwXG5cdFx0fSxcblx0XHRvdXQ6IChpZCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNBY3RpdmUpIHJldHVyblxuXHRcdFx0Y3VycmVudEFuaW0gPSBidXR0b25zW2lkXS5hbmltXG5cdFx0XHRjdXJyZW50QW5pbS50bC50aW1lU2NhbGUoMykucmV2ZXJzZSgpXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGlmKHNob3BBbmltID09IHVuZGVmaW5lZCkgcmV0dXJuIFxuXHRcdFx0dXBkYXRlQW5pbShzaG9wQW5pbSlcblx0XHRcdHVwZGF0ZUFuaW0oZnVuQW5pbSlcblx0XHR9LFxuXHRcdGFjdGl2YXRlOiAoKT0+IHtcblx0XHRcdHNjb3BlLmlzQWN0aXZlID0gdHJ1ZVxuXHRcdH0sXG5cdFx0ZGlzYWN0aXZhdGU6ICgpPT4ge1xuXHRcdFx0c2NvcGUuaXNBY3RpdmUgPSBmYWxzZVxuXHRcdFx0c2hvcEFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdFx0ZnVuQW5pbS50bC50aW1lU2NhbGUoMykucmV2ZXJzZSgpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRzaG9wQW5pbS50bC5jbGVhcigpXG5cdFx0XHRmdW5BbmltLnRsLmNsZWFyKClcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0c2hvcEFuaW0gPSBudWxsXG5cdFx0XHRmdW5BbmltID0gbnVsbFxuXHRcdFx0YnV0dG9ucyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdNYXBfaGJzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCB0eXBlKSA9PiB7XG5cblx0Ly8gcmVuZGVyIG1hcFxuXHR2YXIgbWFwV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0dmFyIHQgPSB0ZW1wbGF0ZSgpXG5cdGVsLmlubmVySFRNTCA9IHRcblx0ZG9tLnRyZWUuYWRkKG1hcFdyYXBwZXIsIGVsKVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGRpciwgc3RlcEVsO1xuXHR2YXIgc2VsZWN0ZWREb3RzID0gW107XG5cdHZhciBjdXJyZW50UGF0aHMsIGZpbGxMaW5lLCBkYXNoZWRMaW5lLCBzdGVwVG90YWxMZW4gPSAwO1xuXHR2YXIgcHJldmlvdXNIaWdobGlnaHRJbmRleCA9IHVuZGVmaW5lZDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1hcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgbWFwZG90cyA9IGRvbS5zZWxlY3QuYWxsKCcjbWFwLWRvdHMgLmRvdC1wYXRoJywgZWwpXG5cdHZhciBmb290c3RlcHMgPSBkb20uc2VsZWN0LmFsbCgnI2Zvb3RzdGVwcyBnJywgZWwpXG5cdHZhciBjdXJyZW50RG90O1xuXG5cdHZhciBmaW5kRG90QnlJZCA9IChwYXJlbnQsIGNoaWxkKT0+IHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRpZihwYXJlbnQgPT0gZG90LmlkKSB7XG5cdFx0XHRcdGlmKGNoaWxkID09IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJykpIHtcblx0XHRcdFx0XHRyZXR1cm4gZG90XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgb25DZWxsTW91c2VFbnRlciA9IChpdGVtKT0+IHtcblx0XHRjdXJyZW50RG90ID0gZmluZERvdEJ5SWQoaXRlbVsxXSwgaXRlbVswXSlcblx0XHRkb20uY2xhc3Nlcy5hZGQoY3VycmVudERvdCwgJ2FuaW1hdGUnKVxuXHR9XG5cdHZhciBvbkNlbGxNb3VzZUxlYXZlID0gKGl0ZW0pPT4ge1xuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjdXJyZW50RG90LCAnYW5pbWF0ZScpXG5cdH1cblxuXHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfRU5URVIsIG9uQ2VsbE1vdXNlRW50ZXIpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfTEVBVkUsIG9uQ2VsbE1vdXNlTGVhdmUpXG5cblx0fVxuXG5cdHZhciB0aXRsZXMgPSB7XG5cdFx0J2RlaWEnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmRlaWEnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2VzLXRyZW5jJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5lcy10cmVuYycsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fSxcblx0XHQnYXJlbGx1Zic6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuYXJlbGx1ZicsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdGl0bGVQb3NYKHBhcmVudFcsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50VyAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVykgKiB2YWxcblx0fVxuXHRmdW5jdGlvbiB0aXRsZVBvc1kocGFyZW50SCwgdmFsKSB7XG5cdFx0cmV0dXJuIChwYXJlbnRIIC8gQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKSAqIHZhbFxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIG1hcFcgPSA2OTMsIG1hcEggPSA1MDBcblx0XHRcdHZhciBtYXBTaXplID0gW11cblx0XHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXKjAuMzUsIHdpbmRvd0gqMC4zNSwgbWFwVywgbWFwSClcblx0XHRcdG1hcFNpemVbMF0gPSBtYXBXICogcmVzaXplVmFycy5zY2FsZVxuXHRcdFx0bWFwU2l6ZVsxXSA9IG1hcEggKiByZXNpemVWYXJzLnNjYWxlXG5cblx0XHRcdGVsLnN0eWxlLndpZHRoID0gbWFwU2l6ZVswXSArICdweCdcblx0XHRcdGVsLnN0eWxlLmhlaWdodCA9IG1hcFNpemVbMV0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1cgPj4gMSkgLSAobWFwU2l6ZVswXSA+PiAxKSAtIDQwICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAobWFwU2l6ZVsxXSA+PiAxKSArICdweCdcblxuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCA4MDApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDMzMCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCAxMjUwKSArICdweCdcblx0XHRcdHRpdGxlc1snZXMtdHJlbmMnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgODUwKSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgNDI2KSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCA1MDApICsgJ3B4J1xuXHRcdH0sXG5cdFx0aGlnaGxpZ2h0RG90czogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0c2VsZWN0ZWREb3RzID0gW11cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBkb3QuaWRcblx0XHRcdFx0dmFyIHBhcmVudElkID0gZG90LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQtaWQnKVxuXHRcdFx0XHRpZihpZCA9PSBvbGRIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBvbGRIYXNoLnBhcmVudCkgc2VsZWN0ZWREb3RzLnB1c2goZG90KVxuXHRcdFx0XHRpZihpZCA9PSBuZXdIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBuZXdIYXNoLnBhcmVudCkgIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGRvdCwgJ2FuaW1hdGUnKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGhpZ2hsaWdodDogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0dmFyIG9sZElkID0gb2xkSGFzaC50YXJnZXRcblx0XHRcdHZhciBuZXdJZCA9IG5ld0hhc2gudGFyZ2V0XG5cdFx0XHR2YXIgY3VycmVudCA9IG9sZElkICsgJy0nICsgbmV3SWRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9vdHN0ZXBzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBzdGVwID0gZm9vdHN0ZXBzW2ldXG5cdFx0XHRcdHZhciBpZCA9IHN0ZXAuaWRcblx0XHRcdFx0aWYoaWQuaW5kZXhPZihvbGRJZCkgPiAtMSAmJiBpZC5pbmRleE9mKG5ld0lkKSA+IC0xKSB7XG5cdFx0XHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGxhc3Qgb25lXG5cdFx0XHRcdFx0aWYoaSA9PSBwcmV2aW91c0hpZ2hsaWdodEluZGV4KSBzdGVwRWwgPSBmb290c3RlcHNbZm9vdHN0ZXBzLmxlbmd0aC0xXVxuXHRcdFx0XHRcdGVsc2Ugc3RlcEVsID0gc3RlcFxuXG5cdFx0XHRcdFx0ZGlyID0gaWQuaW5kZXhPZihjdXJyZW50KSA+IC0xID8gQXBwQ29uc3RhbnRzLkZPUldBUkQgOiBBcHBDb25zdGFudHMuQkFDS1dBUkRcblx0XHRcdFx0XHRwcmV2aW91c0hpZ2hsaWdodEluZGV4ID0gaVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRzY29wZS5oaWdobGlnaHREb3RzKG9sZEhhc2gsIG5ld0hhc2gpXG5cblx0XHRcdGN1cnJlbnRQYXRocyA9IGRvbS5zZWxlY3QuYWxsKCdwYXRoJywgc3RlcEVsKVxuXHRcdFx0ZGFzaGVkTGluZSA9IGN1cnJlbnRQYXRoc1swXVxuXG5cdFx0XHQvLyBjaG9vc2UgcGF0aCBkZXBlbmRzIG9mIGZvb3RzdGVwIGRpcmVjdGlvblxuXHRcdFx0aWYoZGlyID09IEFwcENvbnN0YW50cy5GT1JXQVJEKSB7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzFdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1syXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzJdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzdGVwRWwuc3R5bGUub3BhY2l0eSA9IDFcblxuXHRcdFx0Ly8gLy8gZmluZCB0b3RhbCBsZW5ndGggb2Ygc2hhcGVcblx0XHRcdC8vIHN0ZXBUb3RhbExlbiA9IGZpbGxMaW5lLmdldFRvdGFsTGVuZ3RoKClcblx0XHRcdC8vIGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaG9mZnNldCddID0gMFxuXHRcdFx0Ly8gZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNoYXJyYXknXSA9IHN0ZXBUb3RhbExlblxuXHRcdFx0XG5cdFx0XHQvLyAvLyBzdGFydCBhbmltYXRpb24gb2YgZGFzaGVkIGxpbmVcblx0XHRcdC8vIGRvbS5jbGFzc2VzLmFkZChkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHRcdC8vIC8vIHN0YXJ0IGFuaW1hdGlvblxuXHRcdFx0Ly8gZG9tLmNsYXNzZXMuYWRkKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHR9LFxuXHRcdHJlc2V0SGlnaGxpZ2h0OiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0Ly8gc3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIGRvdCA9IHNlbGVjdGVkRG90c1tpXVxuXHRcdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkb3QsICdhbmltYXRlJylcblx0XHRcdFx0fTtcblx0XHRcdH0sIDApXG5cdFx0fSxcblx0XHR1cGRhdGVQcm9ncmVzczogKHByb2dyZXNzKT0+IHtcblx0XHRcdC8vIGlmKGZpbGxMaW5lID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0XHQvLyB2YXIgZGFzaE9mZnNldCA9IChwcm9ncmVzcyAvIDEpICogc3RlcFRvdGFsTGVuXG5cdFx0XHQvLyBmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IGRhc2hPZmZzZXRcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKSB7XG5cdFx0XHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9FTlRFUiwgb25DZWxsTW91c2VFbnRlcilcblx0XHRcdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0xFQVZFLCBvbkNlbGxNb3VzZUxlYXZlKVxuXHRcdFx0fVxuXHRcdFx0dGl0bGVzID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBmcm9udCwgdmlkZW9VcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHNwbGl0dGVyID0gdmlkZW9Vcmwuc3BsaXQoJy8nKVxuXHR2YXIgbmFtZSA9IHNwbGl0dGVyW3NwbGl0dGVyLmxlbmd0aC0xXS5zcGxpdCgnLicpWzBdXG5cdHZhciBuYW1lU3BsaXQgPSBuYW1lLnNwbGl0KCctJylcblx0dmFyIG5hbWVQYXJ0cyA9IG5hbWVTcGxpdC5sZW5ndGggPT0gMyA/IFtuYW1lU3BsaXRbMF0rJy0nK25hbWVTcGxpdFsxXSwgbmFtZVNwbGl0WzJdXSA6IG5hbWVTcGxpdFxuXHR2YXIgaW1nSWQgPSAnaG9tZS12aWRlby1zaG90cy8nICsgbmFtZVxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRsb29wOiB0cnVlLFxuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHR2YXIgc2l6ZSwgcG9zaXRpb24sIHJlc2l6ZVZhcnM7XG5cdHZhciBpbWc7XG5cblx0dmFyIG9uTW91c2VFbnRlciA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUVudGVyKG5hbWVQYXJ0cylcblx0XHRpZihtVmlkZW8uaXNMb2FkZWQpIHtcblx0XHRcdG1WaWRlby5wbGF5KDApXG5cdFx0fWVsc2V7XG5cdFx0XHRtVmlkZW8ubG9hZCh2aWRlb1VybCwgKCk9PiB7XG5cdFx0XHRcdG1WaWRlby5wbGF5KClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uTW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUxlYXZlKG5hbWVQYXJ0cylcblx0XHRtVmlkZW8ucGF1c2UoMClcblx0fVxuXG5cdHZhciBvbkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFJvdXRlci5zZXRIYXNoKG5hbWVQYXJ0c1swXSArICcvJyArIG5hbWVQYXJ0c1sxXSlcblx0fVxuXG5cdHZhciBpbml0ID0gKCk9PiB7XG5cdFx0dmFyIGltZ1VybCA9IEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTChpbWdJZCkgXG5cdFx0aW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcblx0XHRpbWcuc3JjID0gaW1nVXJsXG5cdFx0ZG9tLnRyZWUuYWRkKGNvbnRhaW5lciwgaW1nKVxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIG1WaWRlby5lbClcblxuXHRcdGRvbS5ldmVudC5vbihmcm9udCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0ZG9tLmV2ZW50Lm9uKGZyb250LCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRkb20uZXZlbnQub24oZnJvbnQsICdjbGljaycsIG9uQ2xpY2spXG5cblx0XHRzY29wZS5pc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNSZWFkeTogZmFsc2UsXG5cdFx0aW5pdDogaW5pdCxcblx0XHRyZXNpemU6IChzLCBwLCBydik9PiB7XG5cblx0XHRcdHNpemUgPSBzID09IHVuZGVmaW5lZCA/IHNpemUgOiBzXG5cdFx0XHRwb3NpdGlvbiA9IHAgPT0gdW5kZWZpbmVkID8gcG9zaXRpb24gOiBwXG5cdFx0XHRyZXNpemVWYXJzID0gcnYgPT0gdW5kZWZpbmVkID8gcmVzaXplVmFycyA6IHJ2XG5cblx0XHRcdGlmKCFzY29wZS5pc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLndpZHRoID0gZnJvbnQuc3R5bGUud2lkdGggPSBzaXplWzBdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGZyb250LnN0eWxlLmhlaWdodCA9IHNpemVbMV0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUubGVmdCA9IGZyb250LnN0eWxlLmxlZnQgPSBwb3NpdGlvblswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS50b3AgPSBmcm9udC5zdHlsZS50b3AgPSBwb3NpdGlvblsxXSArICdweCdcblxuXHRcdFx0aW1nLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdGltZy5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdGltZy5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUud2lkdGggPSByZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUudG9wID0gcmVzaXplVmFycy50b3AgKyAncHgnXG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdG1WaWRlby5jbGVhcigpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZyb250LCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnJvbnQsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmcm9udCwgJ2NsaWNrJywgb25DbGljaylcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IChwcm9wcyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuXHR2aWRlby5wcmVsb2FkID0gXCJcIlxuXHR2YXIgb25SZWFkeUNhbGxiYWNrO1xuXHR2YXIgc2l6ZSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9XG5cdHZhciBlTGlzdGVuZXJzID0gW11cblxuXHR2YXIgb25DYW5QbGF5ID0gKCk9Pntcblx0XHRzY29wZS5pc0xvYWRlZCA9IHRydWVcblx0XHRpZihwcm9wcy5hdXRvcGxheSkgdmlkZW8ucGxheSgpXG5cdFx0aWYocHJvcHMudm9sdW1lICE9IHVuZGVmaW5lZCkgdmlkZW8udm9sdW1lID0gcHJvcHMudm9sdW1lXG5cdFx0c2l6ZS53aWR0aCA9IHZpZGVvLnZpZGVvV2lkdGhcblx0XHRzaXplLmhlaWdodCA9IHZpZGVvLnZpZGVvSGVpZ2h0XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICAgICAgb25SZWFkeUNhbGxiYWNrKHNjb3BlKVxuXHR9XG5cblx0dmFyIHBsYXkgPSAodGltZSk9Pntcblx0XHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IHRydWVcbiAgICBcdHZpZGVvLnBsYXkoKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dHJ5IHtcbiAgICBcdFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG5cdFx0fVxuXHRcdGNhdGNoKGVycikge1xuXHRcdH1cbiAgICB9XG5cbiAgICB2YXIgcGF1c2UgPSAodGltZSk9PntcbiAgICBcdHZpZGVvLnBhdXNlKClcbiAgICBcdGlmKHRpbWUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzY29wZS5zZWVrKHRpbWUpXG5cdFx0fVxuICAgIFx0c2NvcGUuaXNQbGF5aW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgdm9sdW1lID0gKHZhbCk9PiB7XG4gICAgXHRpZih2YWwpIHtcbiAgICBcdFx0c2NvcGUuZWwudm9sdW1lID0gdmFsXG4gICAgXHR9ZWxzZXtcbiAgICBcdFx0cmV0dXJuIHNjb3BlLmVsLnZvbHVtZVxuICAgIFx0fVxuICAgIH1cblxuICAgIHZhciBjdXJyZW50VGltZSA9ICh2YWwpPT4ge1xuICAgIFx0aWYodmFsKSB7XG4gICAgXHRcdHNjb3BlLmVsLmN1cnJlbnRUaW1lID0gdmFsXG4gICAgXHR9ZWxzZXtcbiAgICBcdFx0cmV0dXJuIHNjb3BlLmVsLmN1cnJlbnRUaW1lXG4gICAgXHR9XG4gICAgfVxuXG4gICAgdmFyIHdpZHRoID0gKCk9PiB7XG4gICAgXHRyZXR1cm4gc2NvcGUuZWwudmlkZW9XaWR0aFxuICAgIH1cblxuICAgIHZhciBoZWlnaHQgPSAoKT0+IHtcbiAgICBcdHJldHVybiBzY29wZS5lbC52aWRlb0hlaWdodFx0XG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICBcdGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgIH1cblxuXHR2YXIgYWRkVG8gPSAocCk9PiB7XG5cdFx0c2NvcGUucGFyZW50ID0gcFxuXHRcdGRvbS50cmVlLmFkZChzY29wZS5wYXJlbnQsIHZpZGVvKVxuXHR9XG5cblx0dmFyIG9uID0gKGV2ZW50LCBjYik9PiB7XG5cdFx0ZUxpc3RlbmVycy5wdXNoKHtldmVudDpldmVudCwgY2I6Y2J9KVxuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIG9mZiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHRcdFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdFx0XHRpZihlLmV2ZW50ID09IGV2ZW50ICYmIGUuY2IgPT0gY2IpIHtcblx0XHRcdFx0ZUxpc3RlbmVycy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG5cdH1cblxuXHR2YXIgY2xlYXJBbGxFdmVudHMgPSAoKT0+IHtcblx0ICAgIGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHQgICAgXHR2YXIgZSA9IGVMaXN0ZW5lcnNbaV1cblx0ICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLmV2ZW50LCBlLmNiKTtcblx0ICAgIH1cblx0ICAgIGVMaXN0ZW5lcnMubGVuZ3RoID0gMFxuXHQgICAgZUxpc3RlbmVycyA9IG51bGxcblx0fVxuXG5cdHZhciBjbGVhciA9ICgpPT4ge1xuICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblx0ICAgIHNjb3BlLmNsZWFyQWxsRXZlbnRzKClcblx0ICAgIHNpemUgPSBudWxsXG5cdCAgICB2aWRlbyA9IG51bGxcbiAgICB9XG5cbiAgICB2YXIgYWRkU291cmNlVG9WaWRlbyA9IChlbGVtZW50LCBzcmMsIHR5cGUpPT4ge1xuXHQgICAgdmFyIHNvdXJjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuXHQgICAgc291cmNlLnNyYyA9IHNyYztcblx0ICAgIHNvdXJjZS50eXBlID0gdHlwZTtcblx0ICAgIGRvbS50cmVlLmFkZChlbGVtZW50LCBzb3VyY2UpXG5cdH1cblx0XG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblxuXHRzY29wZSA9IHtcblx0XHRwYXJlbnQ6IHVuZGVmaW5lZCxcblx0XHRlbDogdmlkZW8sXG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHNlZWs6IHNlZWssXG5cdFx0cGF1c2U6IHBhdXNlLFxuXHRcdHZvbHVtZTogdm9sdW1lLFxuXHRcdGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZSxcblx0XHR3aWR0aDogd2lkdGgsXG5cdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0YWRkVG86IGFkZFRvLFxuXHRcdG9uOiBvbixcblx0XHRvZmY6IG9mZixcblx0XHRjbGVhcjogY2xlYXIsXG5cdFx0Y2xlYXJBbGxFdmVudHM6IGNsZWFyQWxsRXZlbnRzLFxuXHRcdGlzUGxheWluZzogcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2UsXG5cdFx0aXNMb2FkZWQ6IGZhbHNlLFxuXHRcdGxvYWQ6IChzcmMsIGNhbGxiYWNrKT0+IHtcblx0XHRcdG9uUmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrXG5cdFx0XHRhZGRTb3VyY2VUb1ZpZGVvKHZpZGVvLCBzcmMsICd2aWRlby9tcDQnKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGRhdGEpPT4ge1xuXHRcblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCdmb290ZXInLCBjb250YWluZXIpXG5cdHZhciBidXR0b25zID0gZG9tLnNlbGVjdC5hbGwoJ2xpJywgZWwpXG5cblx0dmFyIG9uQnRuQ2xpY2sgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxuXHRcdHZhciBpZCA9IHRhcmdldC5pZFxuXHRcdHZhciB1cmwgPSB1bmRlZmluZWQ7XG5cdFx0c3dpdGNoKGlkKSB7XG5cdFx0XHRjYXNlICdob21lJzpcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuRmVlZCgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdncmlkJzpcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuR3JpZCgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdjb20nOlxuXHRcdFx0XHR1cmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLydcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ2xhYic6XG5cdFx0XHRcdHVybCA9IGRhdGEubGFiVXJsXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdzaG9wJzpcblx0XHRcdFx0dXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGlmKHVybCAhPSB1bmRlZmluZWQpIHdpbmRvdy5vcGVuKHVybCwnX2JsYW5rJylcblx0fVxuXG5cdHZhciBidG4sIGlcblx0Zm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRidG4gPSBidXR0b25zW2ldXG5cdFx0ZG9tLmV2ZW50Lm9uKGJ0biwgJ2NsaWNrJywgb25CdG5DbGljaylcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBidG5XID0gd2luZG93VyAvIGJ1dHRvbnMubGVuZ3RoXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYnRuID0gYnV0dG9uc1tpXVxuXHRcdFx0XHRidG4uc3R5bGUud2lkdGggPSBidG5XICsgJ3B4J1xuXHRcdFx0XHRidG4uc3R5bGUubGVmdCA9IGJ0blcgKiBpICsgXCJweFwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkaXB0eXF1ZVBhcnQgZnJvbSAnZGlwdHlxdWUtcGFydCdcbmltcG9ydCBjaGFyYWN0ZXIgZnJvbSAnY2hhcmFjdGVyJ1xuaW1wb3J0IGZ1bkZhY3QgZnJvbSAnZnVuLWZhY3QtaG9sZGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBhcnJvd3NXcmFwcGVyIGZyb20gJ2Fycm93cy13cmFwcGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IHNlbGZpZVN0aWNrIGZyb20gJ3NlbGZpZS1zdGljaydcbmltcG9ydCBtYWluQnRucyBmcm9tICdtYWluLWRpcHR5cXVlLWJ0bnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcHR5cXVlIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cblx0XHR2YXIgbmV4dERpcHR5cXVlID0gQXBwU3RvcmUuZ2V0TmV4dERpcHR5cXVlKClcblx0XHR2YXIgcHJldmlvdXNEaXB0eXF1ZSA9IEFwcFN0b3JlLmdldFByZXZpb3VzRGlwdHlxdWUoKVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcGFnZSddID0gbmV4dERpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcGFnZSddID0gcHJldmlvdXNEaXB0eXF1ZVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gobmV4dERpcHR5cXVlKVxuXHRcdHByb3BzLmRhdGFbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gPSBBcHBTdG9yZS5nZXRQcmV2aWV3VXJsQnlIYXNoKHByZXZpb3VzRGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsnZmFjdC10eHQnXSA9IHByb3BzLmRhdGEuZmFjdFtBcHBTdG9yZS5sYW5nKCldXG5cblx0XHRzdXBlcihwcm9wcylcblxuXHRcdHRoaXMub25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQXJyb3dNb3VzZUVudGVyID0gdGhpcy5vbkFycm93TW91c2VFbnRlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkFycm93TW91c2VMZWF2ZSA9IHRoaXMub25BcnJvd01vdXNlTGVhdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQgPSB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIgPSB0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIuYmluZCh0aGlzKVxuXHRcdHRoaXMub25PcGVuRmFjdCA9IHRoaXMub25PcGVuRmFjdC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkNsb3NlRmFjdCA9IHRoaXMub25DbG9zZUZhY3QuYmluZCh0aGlzKVxuXHRcdHRoaXMudWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQgPSB0aGlzLnVpVHJhbnNpdGlvbkluQ29tcGxldGVkLmJpbmQodGhpcylcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5PUEVOX0ZVTl9GQUNULCB0aGlzLm9uT3BlbkZhY3QpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLkNMT1NFX0ZVTl9GQUNULCB0aGlzLm9uQ2xvc2VGYWN0KVxuXG5cdFx0dGhpcy5tb3VzZSA9IG5ldyBQSVhJLlBvaW50KClcblx0XHR0aGlzLm1vdXNlLm5YID0gdGhpcy5tb3VzZS5uWSA9IDBcblxuXHRcdHRoaXMubGVmdFBhcnQgPSBkaXB0eXF1ZVBhcnQoXG5cdFx0XHR0aGlzLnB4Q29udGFpbmVyLFxuXHRcdFx0dGhpcy5nZXRJbWFnZVVybEJ5SWQoJ3Nob2UtYmcnKSxcblx0XHRcdFxuXHRcdClcblx0XHR0aGlzLnJpZ2h0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnY2hhcmFjdGVyLWJnJylcblx0XHQpXG5cblx0XHR0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3Rlcih0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXInKSwgdGhpcy5nZXRJbWFnZVNpemVCeUlkKCdjaGFyYWN0ZXInKSlcblx0XHR0aGlzLmZ1bkZhY3QgPSBmdW5GYWN0KHRoaXMucHhDb250YWluZXIsIHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhLCB0aGlzLnByb3BzKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IGFycm93c1dyYXBwZXIodGhpcy5lbGVtZW50LCB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLCB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sgPSBzZWxmaWVTdGljayh0aGlzLmVsZW1lbnQsIHRoaXMubW91c2UsIHRoaXMucHJvcHMuZGF0YSlcblx0XHR0aGlzLm1haW5CdG5zID0gbWFpbkJ0bnModGhpcy5lbGVtZW50LCB0aGlzLnByb3BzLmRhdGEsIHRoaXMubW91c2UsIHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlcilcblxuXHRcdGRvbS5ldmVudC5vbih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdsZWZ0JyksIHsgeDotQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXHRcdFR3ZWVuTWF4LnNldCh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZCgncmlnaHQnKSwgeyB4OkFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkcgfSlcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmhvbGRlciwgMSwgeyB4OiAtd2luZG93VyA+PiAxLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMubGVmdFBhcnQuYmdTcHJpdGUueCAtIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5yaWdodFBhcnQuYmdTcHJpdGUueCArIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUuc2NhbGUsIDEsIHsgeDogMywgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjQpXG5cblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5sZWZ0LCAwLjUsIHsgeDogLTEwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5hcnJvd3NXcmFwcGVyLnJpZ2h0LCAwLjUsIHsgeDogMTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLnNlbGZpZVN0aWNrLmVsLCAwLjUsIHsgeTogNTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLmxlZnRQYXJ0LmhvbGRlciwgMSwgeyB4OiAtd2luZG93VyA+PiAxLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5yaWdodFBhcnQuaG9sZGVyLCAxLCB7IHg6IHdpbmRvd1csIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cblx0XHR0aGlzLnVpSW5UbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLmFycm93c1dyYXBwZXIubGVmdCwgMSwgeyB4OiAtMTAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuYXJyb3dzV3JhcHBlci5yaWdodCwgMSwgeyB4OiAxMDAsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5zZWxmaWVTdGljay5lbCwgMSwgeyB5OiA1MDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC41KVxuXHRcdHRoaXMudWlJblRsLnBhdXNlKDApXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCk7XG5cblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdHVpVHJhbnNpdGlvbkluQ29tcGxldGVkKCkge1xuXHRcdHRoaXMudWlJblRsLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0dGhpcy5zZWxmaWVTdGljay50cmFuc2l0aW9uSW5Db21wbGV0ZWQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHRoaXMudWlJblRsLnRpbWVTY2FsZSgxLjYpLnBsYXkoKVx0XHRcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0b25Nb3VzZU1vdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5tb3VzZS54ID0gZS5jbGllbnRYXG5cdFx0dGhpcy5tb3VzZS55ID0gZS5jbGllbnRZXG5cdFx0dGhpcy5tb3VzZS5uWCA9IChlLmNsaWVudFggLyB3aW5kb3dXKSAqIDFcblx0XHR0aGlzLm1vdXNlLm5ZID0gKGUuY2xpZW50WSAvIHdpbmRvd0gpICogMVxuXHR9XG5cdG9uU2VsZmllU3RpY2tDbGlja2VkKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZih0aGlzLnNlbGZpZVN0aWNrLmlzT3BlbmVkKSB7XG5cdFx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsb3NlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2sub3BlbigpXG5cdFx0XHR0aGlzLm1haW5CdG5zLmFjdGl2YXRlKClcblx0XHR9XG5cdH1cblx0b25BcnJvd01vdXNlRW50ZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IC1vZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjQsIHsgeDpwb3NYLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjQsIHsgeDowLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cblx0XHR0aGlzLmFycm93c1dyYXBwZXIub3ZlcihpZClcblx0fVxuXHRvbkFycm93TW91c2VMZWF2ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cblx0XHR2YXIgcG9zWDtcblx0XHR2YXIgb2Zmc2V0WCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblx0XHRpZihpZCA9PSAnbGVmdCcpIHBvc1ggPSAtb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IG9mZnNldFhcblxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMucHhDb250YWluZXIsIDAuNiwgeyB4OjAsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjYsIHsgeDpwb3NYLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm91dChpZClcblx0fVxuXHRvbk1haW5CdG5zRXZlbnRIYW5kbGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgdHlwZSA9IGUudHlwZVxuXHRcdHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcblx0XHR2YXIgaWQgPSB0YXJnZXQuaWRcblx0XHRpZih0eXBlID09ICdjbGljaycgJiYgaWQgPT0gJ2Z1bi1mYWN0LWJ0bicpIHtcblx0XHRcdGlmKHRoaXMuZnVuRmFjdC5pc09wZW4pIHtcblx0XHRcdFx0QXBwQWN0aW9ucy5jbG9zZUZ1bkZhY3QoKVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkZ1bkZhY3QoKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ21vdXNlZW50ZXInKSB7XG5cdFx0XHR0aGlzLm1haW5CdG5zLm92ZXIoaWQpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnbW91c2VsZWF2ZScpIHtcblx0XHRcdHRoaXMubWFpbkJ0bnMub3V0KGlkKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ2NsaWNrJyAmJiBpZCA9PSAnc2hvcC1idG4nKSB7XG5cdFx0XHR3aW5kb3cub3Blbih0aGlzLnByb3BzLmRhdGFbJ3Nob3AtdXJsJ10sICdfYmxhbmsnKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG5cdG9uT3BlbkZhY3QoKXtcblx0XHR0aGlzLmZ1bkZhY3Qub3BlbigpXG5cdFx0dGhpcy5tYWluQnRucy5kaXNhY3RpdmF0ZSgpXG5cdH1cblx0b25DbG9zZUZhY3QoKXtcblx0XHR0aGlzLmZ1bkZhY3QuY2xvc2UoKVxuXHRcdHRoaXMubWFpbkJ0bnMuYWN0aXZhdGUoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLmNoYXJhY3Rlci51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLmxlZnRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sudXBkYXRlKClcblx0XHR0aGlzLmZ1bkZhY3QudXBkYXRlKClcblx0XHR0aGlzLm1haW5CdG5zLnVwZGF0ZSgpXG5cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5sZWZ0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5jaGFyYWN0ZXIucmVzaXplKClcblx0XHR0aGlzLmZ1bkZhY3QucmVzaXplKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIucmVzaXplKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYWluQnRucy5yZXNpemUoKVxuXG5cdFx0dGhpcy5yaWdodFBhcnQuaG9sZGVyLnggPSAod2luZG93VyA+PiAxKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLkNMT1NFX0ZVTl9GQUNULCB0aGlzLm9uQ2xvc2VGYWN0KVxuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblx0XHRkb20uZXZlbnQub2ZmKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHR0aGlzLnVpSW5UbC5jbGVhcigpXG5cdFx0dGhpcy5sZWZ0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5yaWdodFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMuY2hhcmFjdGVyLmNsZWFyKClcblx0XHR0aGlzLmZ1bkZhY3QuY2xlYXIoKVxuXHRcdHRoaXMuc2VsZmllU3RpY2suY2xlYXIoKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5jbGVhcigpXG5cdFx0dGhpcy5tYWluQnRucy5jbGVhcigpXG5cdFx0dGhpcy51aUluVGwgPSBudWxsXG5cdFx0dGhpcy5tb3VzZSA9IG51bGxcblx0XHR0aGlzLmxlZnRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMuY2hhcmFjdGVyID0gbnVsbFxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IG51bGxcblx0XHR0aGlzLm1haW5CdG5zID0gbnVsbFxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGJvdHRvbVRleHRzIGZyb20gJ2JvdHRvbS10ZXh0cy1ob21lJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZ3JpZCBmcm9tICdncmlkLWhvbWUnXG5pbXBvcnQgaW1hZ2VDYW52YXNlc0dyaWQgZnJvbSAnaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZCdcbmltcG9ydCBhcm91bmRCb3JkZXIgZnJvbSAnYXJvdW5kLWJvcmRlci1ob21lJ1xuaW1wb3J0IG1hcCBmcm9tICdtYWluLW1hcCdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgZ3JpZFBvc2l0aW9ucyBmcm9tICdncmlkLXBvc2l0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9tZSBleHRlbmRzIFBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHZhciBjb250ZW50ID0gQXBwU3RvcmUucGFnZUNvbnRlbnQoKVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0dmFyIHRleHRzID0gY29udGVudC50ZXh0c1tBcHBTdG9yZS5sYW5nKCldXG5cdFx0cHJvcHMuZGF0YS5mYWNlYm9va1VybCA9IGdlbmVyYUluZm9zWydmYWNlYm9va191cmwnXVxuXHRcdHByb3BzLmRhdGEudHdpdHRlclVybCA9IGdlbmVyYUluZm9zWyd0d2l0dGVyX3VybCddXG5cdFx0cHJvcHMuZGF0YS5pbnN0YWdyYW1VcmwgPSBnZW5lcmFJbmZvc1snaW5zdGFncmFtX3VybCddXG5cdFx0cHJvcHMuZGF0YS5ncmlkID0gW11cblx0XHRwcm9wcy5kYXRhLmdyaWQubGVuZ3RoID0gMjhcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10gPSB7IGhvcml6b250YWw6IFtdLCB2ZXJ0aWNhbDogW10gfVxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS5ob3Jpem9udGFsLmxlbmd0aCA9IDNcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10udmVydGljYWwubGVuZ3RoID0gNlxuXHRcdHByb3BzLmRhdGFbJ2dlbmVyaWMnXSA9IHRleHRzLmdlbmVyaWNcblx0XHRwcm9wcy5kYXRhWydkZWlhLXR4dCddID0gdGV4dHNbJ2RlaWEnXVxuXHRcdHByb3BzLmRhdGFbJ2FyZWxsdWYtdHh0J10gPSB0ZXh0c1snYXJlbGx1ZiddXG5cdFx0cHJvcHMuZGF0YVsnZXMtdHJlbmMtdHh0J10gPSB0ZXh0c1snZXMtdHJlbmMnXVxuXG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dmFyIGJnVXJsID0gdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2JhY2tncm91bmQnKVxuXHRcdHRoaXMucHJvcHMuZGF0YS5iZ3VybCA9IGJnVXJsXG5cblx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtID0gdGhpcy50cmlnZ2VyTmV3SXRlbS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkl0ZW1FbmRlZCA9IHRoaXMub25JdGVtRW5kZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcylcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxhc3RHcmlkSXRlbUluZGV4O1xuXHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA9IDIwMFxuXHRcdHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA9IDBcblxuXHRcdHRoaXMubW91c2UgPSBuZXcgUElYSS5Qb2ludCgpXG5cdFx0dGhpcy5tb3VzZS5uWCA9IHRoaXMubW91c2UublkgPSAwXG5cblx0XHR0aGlzLnNlYXRzID0gW1xuXHRcdFx0MSwgMywgNSxcblx0XHRcdDcsIDksIDExLFxuXHRcdFx0MTUsIDE3LFxuXHRcdFx0MjEsIDIzLCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdHRoaXMuaW1nQ0dyaWQgPSBpbWFnZUNhbnZhc2VzR3JpZCh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5pbWdDR3JpZC5sb2FkKHRoaXMucHJvcHMuZGF0YS5iZ3VybClcblx0XHR0aGlzLmdyaWQgPSBncmlkKHRoaXMucHJvcHMsIHRoaXMuZWxlbWVudCwgdGhpcy5vbkl0ZW1FbmRlZClcblx0XHR0aGlzLmdyaWQuaW5pdCgpXG5cdFx0dGhpcy5ib3R0b21UZXh0cyA9IGJvdHRvbVRleHRzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IGFyb3VuZEJvcmRlcih0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpXG5cblx0XHRkb20uZXZlbnQub24od2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5hcm91bmRCb3JkZXIuZWwsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5hcm91bmRCb3JkZXIubGV0dGVycywgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmltZ0NHcmlkLmVsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxJbi5zdGFnZ2VyRnJvbSh0aGlzLmdyaWQuY2hpbGRyZW4sIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMDEsIDAuMSlcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmxpbmVzLmhvcml6b250YWwsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMDEsIDAuMilcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmxpbmVzLnZlcnRpY2FsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjIpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5ib3R0b21UZXh0cy5lbCwgMSwgeyB4OndpbmRvd1cgKiAwLjQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC41KVxuXG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLmJvdHRvbVRleHRzLm9wZW5UeHRCeUlkKCdnZW5lcmljJylcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0dHJpZ2dlck5ld0l0ZW0odHlwZSkge1xuXHRcdHZhciBpbmRleCA9IHRoaXMuc2VhdHNbVXRpbHMuUmFuZCgwLCB0aGlzLnNlYXRzLmxlbmd0aCAtIDEsIDApXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHNlYXQgPT0gaW5kZXgpIHtcblx0XHRcdFx0aWYodGhpcy51c2VkU2VhdHMubGVuZ3RoIDwgdGhpcy5zZWF0cy5sZW5ndGggLSAyKSB0aGlzLnRyaWdnZXJOZXdJdGVtKHR5cGUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy51c2VkU2VhdHMucHVzaChpbmRleClcblx0XHR0aGlzLmdyaWQudHJhbnNpdGlvbkluSXRlbShpbmRleCwgdHlwZSlcblx0fVxuXHRvbkl0ZW1FbmRlZChpdGVtKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVzZWRTZWF0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHVzZWRTZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHVzZWRTZWF0ID09IGl0ZW0uc2VhdCkge1xuXHRcdFx0XHR0aGlzLnVzZWRTZWF0cy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdG9uTW91c2VNb3ZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMubW91c2UueCA9IGUuY2xpZW50WFxuXHRcdHRoaXMubW91c2UueSA9IGUuY2xpZW50WVxuXHRcdHRoaXMubW91c2UublggPSAoZS5jbGllbnRYIC8gd2luZG93VykgKiAxXG5cdFx0dGhpcy5tb3VzZS5uWSA9IChlLmNsaWVudFkgLyB3aW5kb3dIKSAqIDFcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkKSByZXR1cm5cblx0XHQvLyB0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdC8vIGlmKHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA+IDgwMCkge1xuXHRcdC8vIFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMFxuXHRcdC8vIFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9WSURFTylcblx0XHQvLyB9XG5cdFx0Ly8gdGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyICs9IDFcblx0XHQvLyBpZih0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPiAzMCkge1xuXHRcdC8vIFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXHRcdC8vIFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9JTUFHRSlcblx0XHQvLyB9XG5cdFx0dGhpcy5pbWdDR3JpZC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFxuXHRcdHZhciBnR3JpZCA9IGdyaWRQb3NpdGlvbnMod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgJ2NvbHNfcm93cycpXG5cblx0XHR0aGlzLmdyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuaW1nQ0dyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMucmVzaXplKClcblx0XHR0aGlzLmFyb3VuZEJvcmRlci5yZXNpemUoKVxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cblx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0ZG9tLmV2ZW50Lm9mZih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIuY2xlYXIoKVxuXHRcdHRoaXMuZ3JpZC5jbGVhcigpXG5cdFx0dGhpcy5tYXAuY2xlYXIoKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMuY2xlYXIoKVxuXG5cdFx0dGhpcy5ncmlkID0gbnVsbFxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBudWxsXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBudWxsXG5cdFx0dGhpcy5tYXAgPSBudWxsXG5cblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgbW91c2UsIGRhdGEpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgc2NyZWVuSG9sZGVyU2l6ZSA9IFswLCAwXSwgdmlkZW9Ib2xkZXJTaXplID0gWzAsIDBdLCBjb2xvcmlmaWVyU2l6ZSA9IFswLCAwXSwgdG9wT2Zmc2V0ID0gMDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgaG9sZGVyKVxuXHR2YXIgYmFja2dyb3VuZCA9IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgZWwpXG5cdHZhciBzY3JlZW5XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi13cmFwcGVyJywgZWwpXG5cdHZhciBzY3JlZW5Ib2xkZXIgPSBkb20uc2VsZWN0KCcuc2NyZWVuLWhvbGRlcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciB2aWRlb0hvbGRlciA9IGRvbS5zZWxlY3QoJy52aWRlby1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgY29sb3JpZmllciA9IGRvbS5zZWxlY3QoJy5jb2xvcmlmaWVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXJTdmdQYXRoID0gZG9tLnNlbGVjdCgnc3ZnIHBhdGgnLCBjb2xvcmlmaWVyKVxuXHR2YXIgc2VsZmllU3RpY2tXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgZWwpXG5cdHZhciBzcHJpbmdUbyA9IFV0aWxzLlNwcmluZ1RvXG5cdHZhciB0cmFuc2xhdGUgPSBVdGlscy5UcmFuc2xhdGVcblx0dmFyIHR3ZWVuSW47XG5cdHZhciBhbmltYXRpb24gPSB7XG5cdFx0cG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdHJvdGF0aW9uOiAwLFxuXHRcdGNvbmZpZzoge1xuXHRcdFx0bGVuZ3RoOiA0MDAsXG5cdFx0XHRzcHJpbmc6IDAuNCxcblx0XHRcdGZyaWN0aW9uOiAwLjdcblx0XHR9XG5cdH1cblxuXHRUd2Vlbk1heC5zZXQoZWwsIHsgcm90YXRpb246ICctMWRlZycsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnIH0pXG5cblx0Ly8gY2hlY2sgaWYgbWl4LWJsZW5kLW1vZGUgaXMgYXZhaWxhYmxlXG5cdGlmICgnbWl4LWJsZW5kLW1vZGUnIGluIGNvbG9yaWZpZXIuc3R5bGUpIHtcblx0XHQvLyBjaGVjayBpZiBzYWZhcmkgYmVjYXVzZSBjb2xvciBmaWx0ZXIgaXNuJ3Qgd29ya2luZyBvbiBpdFxuXHRcdGlmKEFwcFN0b3JlLkRldGVjdG9yLmlzU2FmYXJpKSB7XG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlWydtaXgtYmxlbmQtbW9kZSddID0gJ211bHRpcGx5J1xuXHRcdH1lbHNle1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZVsnbWl4LWJsZW5kLW1vZGUnXSA9ICdjb2xvcidcblx0XHR9XG5cdH1lbHNle1xuXHRcdGNvbG9yaWZpZXJTdmdQYXRoLnN0eWxlWydvcGFjaXR5J10gPSAwLjhcblx0fVxuXHRcblx0dmFyIGMgPSBkYXRhWydhbWJpZW50LWNvbG9yJ11bJ3NlbGZpZS1zdGljayddXG5cdGNvbG9yaWZpZXJTdmdQYXRoLnN0eWxlWydmaWxsJ10gPSAnIycgKyBjb2xvclV0aWxzLmhzdlRvSGV4KGMuaCwgYy5zLCBjLnYpXG5cblx0dmFyIG9uVmlkZW9FbmRlZCA9ICgpPT4ge1xuXHRcdHNjb3BlLmNsb3NlKClcblx0fVxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRhdXRvcGxheTogZmFsc2Vcblx0fSlcblx0bVZpZGVvLmFkZFRvKHZpZGVvSG9sZGVyKVxuXHRtVmlkZW8ub24oJ2VuZGVkJywgb25WaWRlb0VuZGVkKVxuXHR2YXIgdmlkZW9TcmMgPSBkYXRhWydzZWxmaWUtc3RpY2stdmlkZW8tdXJsJ11cblxuXHR2YXIgc3RpY2tJbWcgPSBpbWcoQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL3NlbGZpZXN0aWNrLnBuZycsICgpPT4ge1xuXHRcdGRvbS50cmVlLmFkZChzY3JlZW5Ib2xkZXIsIHN0aWNrSW1nKVxuXHRcdG1WaWRlby5sb2FkKHZpZGVvU3JjLCAoKT0+IHtcblx0XHRcdGlmKHR3ZWVuSW4gIT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0dHdlZW5Jbi5wbGF5KClcblx0XHRcdH1cblx0XHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0XHRzY29wZS5yZXNpemUoKVxuXHRcdH0pXG5cdH0pXG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdGlzT3BlbmVkOiBmYWxzZSxcblx0XHRvcGVuOiAoKT0+IHtcblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoID0gMTAwLFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5zcHJpbmcgPSAwLjksXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmZyaWN0aW9uID0gMC41XG5cdFx0XHRtVmlkZW8ucGxheSgwKVxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnXG5cdFx0XHRzY29wZS5pc09wZW5lZCA9IHRydWVcblx0XHR9LFxuXHRcdGNsb3NlOiAoKT0+IHtcblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoID0gMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC42LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuN1xuXHRcdFx0bVZpZGVvLnBhdXNlKDApXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSBmYWxzZVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblxuXHRcdFx0aWYoc2NvcGUuaXNPcGVuZWQpIHtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueSAtIChzY3JlZW5Ib2xkZXJTaXplWzFdICogMC44KVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDgwXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSArPSAobW91c2UublkgLSAwLjUpICogMzBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogMjBcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55IC09IChtb3VzZS5uWSAtIDAuNSkgKiAyMFxuXHRcdFx0fVxuXG5cdFx0XHRzcHJpbmdUbyhhbmltYXRpb24sIGFuaW1hdGlvbi5mcG9zaXRpb24sIDEpXG5cblx0XHRcdGFuaW1hdGlvbi5wb3NpdGlvbi54ICs9IChhbmltYXRpb24uZnBvc2l0aW9uLnggLSBhbmltYXRpb24ucG9zaXRpb24ueCkgKiAwLjFcblxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggKz0gKDAuMDEgLSBhbmltYXRpb24uY29uZmlnLmxlbmd0aCkgKiAwLjA1XG5cblx0XHRcdHRyYW5zbGF0ZShzY3JlZW5XcmFwcGVyLCBhbmltYXRpb24ucG9zaXRpb24ueCwgYW5pbWF0aW9uLnBvc2l0aW9uLnkgKyBhbmltYXRpb24udmVsb2NpdHkueSwgMSlcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHRcdFxuXHRcdFx0Ly8gaWYgaW1hZ2VzIG5vdCByZWFkeSByZXR1cm5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0c2NyZWVuV3JhcHBlci5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKiAwLjMgKyAncHgnXG5cblx0XHRcdGJhY2tncm91bmQuc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXG5cdFx0XHRzY3JlZW5Ib2xkZXJTaXplID0gZG9tLnNpemUoc2NyZWVuSG9sZGVyKVxuXHRcdFx0dmlkZW9Ib2xkZXJTaXplID0gZG9tLnNpemUodmlkZW9Ib2xkZXIpXG5cdFx0XHRjb2xvcmlmaWVyU2l6ZSA9IGRvbS5zaXplKGNvbG9yaWZpZXIpXG5cdFx0XHR0b3BPZmZzZXQgPSAod2luZG93VyAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVykgKiAyNlxuXHRcdFx0dmlkZW9Ib2xkZXIuc3R5bGUubGVmdCA9IChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpIC0gKHZpZGVvSG9sZGVyU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLnRvcCA9IHRvcE9mZnNldCArICdweCdcblx0XHRcdGNvbG9yaWZpZXIuc3R5bGUubGVmdCA9IChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpIC0gKGNvbG9yaWZpZXJTaXplWzBdICogMC41OCkgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLnRvcCA9IC0wLjcgKyAncHgnXG5cblx0XHRcdGFuaW1hdGlvbi5pcG9zaXRpb24ueCA9ICh3aW5kb3dXID4+IDEpIC0gKHNjcmVlbkhvbGRlclNpemVbMF0gPj4gMSlcblx0XHRcdGFuaW1hdGlvbi5pcG9zaXRpb24ueSA9IHdpbmRvd0ggLSAodmlkZW9Ib2xkZXJTaXplWzFdICogMC4zNSlcblx0XHRcdGFuaW1hdGlvbi5wb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueVxuXG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uSW5Db21wbGV0ZWQ6ICgpPT4ge1xuXHRcdFx0aWYoIWlzUmVhZHkpIHtcblx0XHRcdFx0dHdlZW5JbiA9IFR3ZWVuTWF4LmZyb20oZWwsIDAuNiwgeyB5OiA1MDAsIHBhdXNlZDp0cnVlLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRtVmlkZW8uY2xlYXIoKVxuXHRcdFx0bVZpZGVvID0gbnVsbFxuXHRcdFx0YW5pbWF0aW9uID0gbnVsbFxuXHRcdFx0dHdlZW5JbiA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRzY29wZS5jbG9zZSgpXG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBzb2NpYWxMaW5rcyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHdyYXBwZXIgPSBkb20uc2VsZWN0KFwiI2Zvb3RlciAjc29jaWFsLXdyYXBwZXJcIiwgcGFyZW50KVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAqIDAuNFxuXG5cdFx0XHR2YXIgd3JhcHBlclNpemUgPSBkb20uc2l6ZSh3cmFwcGVyKVxuXG5cdFx0XHR2YXIgc29jaWFsQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiB3aW5kb3dXIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzBdLFxuXHRcdFx0XHR0b3A6IHdpbmRvd0ggLSBwYWRkaW5nIC0gd3JhcHBlclNpemVbMV0sXG5cdFx0XHR9XG5cblx0XHRcdHdyYXBwZXIuc3R5bGUubGVmdCA9IHNvY2lhbENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0d3JhcHBlci5zdHlsZS50b3AgPSBzb2NpYWxDc3MudG9wICsgJ3B4J1xuXHRcdH0sXG5cdFx0c2hvdzogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5yZW1vdmUod3JhcHBlciwgJ2hpZGUnKSwgMTAwMClcblx0XHR9LFxuXHRcdGhpZGU6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMuYWRkKHdyYXBwZXIsICdoaWRlJyksIDUwMClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgc29jaWFsTGlua3MiLCJpbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5cbnZhciB2aWRlb0NhbnZhcyA9ICggcHJvcHMgKT0+IHtcblxuICAgIHZhciBzY29wZTtcbiAgICB2YXIgaW50ZXJ2YWxJZDtcbiAgICB2YXIgZHggPSAwLCBkeSA9IDAsIGRXaWR0aCA9IDAsIGRIZWlnaHQgPSAwO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG4gICAgICAgIGF1dG9wbGF5OiBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZSxcbiAgICAgICAgdm9sdW1lOiBwcm9wcy52b2x1bWUsXG4gICAgICAgIGxvb3A6IHByb3BzLmxvb3BcbiAgICB9KVxuXG4gICAgdmFyIG9uQ2FuUGxheSA9ICgpPT57XG4gICAgICAgIHNjb3BlLmlzTG9hZGVkID0gdHJ1ZVxuICAgICAgICBpZihwcm9wcy5hdXRvcGxheSkgbVZpZGVvLnBsYXkoKVxuICAgICAgICBpZihkV2lkdGggPT0gMCkgZFdpZHRoID0gbVZpZGVvLndpZHRoKClcbiAgICAgICAgaWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gbVZpZGVvLmhlaWdodCgpXG4gICAgICAgIGlmKG1WaWRlby5pc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciBkcmF3T25jZSA9ICgpPT4ge1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGxheSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGRyYXcsIDEwMDAgLyAzMClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICAgICAgbVZpZGVvLmN1cnJlbnRUaW1lKHRpbWUpXG4gICAgICAgIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgdGltZW91dCA9IChjYiwgbXMpPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgY2Ioc2NvcGUpXG4gICAgICAgIH0sIG1zKVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICgpPT57XG4gICAgICAgIG1WaWRlby5wYXVzZSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgICAgICBpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICAgICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgcmVzaXplID0gKHgsIHksIHcsIGgpPT57XG4gICAgICAgIGR4ID0geFxuICAgICAgICBkeSA9IHlcbiAgICAgICAgZFdpZHRoID0gd1xuICAgICAgICBkSGVpZ2h0ID0gaFxuICAgIH1cblxuICAgIHZhciBjbGVhciA9ICgpPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIG1WaWRlby5jbGVhckFsbEV2ZW50cygpXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwwLDAsMClcbiAgICB9XG5cbiAgICBpZihwcm9wcy5vbkVuZGVkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtVmlkZW8ub24oJ2VuZGVkJywgZW5kZWQpXG4gICAgfVxuXG4gICAgc2NvcGUgPSB7XG4gICAgICAgIGlzTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICAgIHZpZGVvOiBtVmlkZW8sXG4gICAgICAgIGN0eDogY3R4LFxuICAgICAgICBkcmF3T25jZTogZHJhd09uY2UsXG4gICAgICAgIHBsYXk6IHBsYXksXG4gICAgICAgIHBhdXNlOiBwYXVzZSxcbiAgICAgICAgc2Vlazogc2VlayxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgcmVzaXplOiByZXNpemUsXG4gICAgICAgIGNsZWFyOiBjbGVhcixcbiAgICAgICAgbG9hZDogKHNyYywgY2IpPT4ge1xuICAgICAgICAgICAgbVZpZGVvLmxvYWQoc3JjLCAoKT0+e1xuICAgICAgICAgICAgICAgIG9uQ2FuUGxheSgpXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzY29wZVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHZpZGVvQ2FudmFzIiwiZXhwb3J0IGRlZmF1bHQge1xuXHRXSU5ET1dfUkVTSVpFOiAnV0lORE9XX1JFU0laRScsXG5cdFBBR0VfSEFTSEVSX0NIQU5HRUQ6ICdQQUdFX0hBU0hFUl9DSEFOR0VEJyxcblx0UEFHRV9BU1NFVFNfTE9BREVEOiAnUEFHRV9BU1NFVFNfTE9BREVEJyxcblxuXHRMQU5EU0NBUEU6ICdMQU5EU0NBUEUnLFxuXHRQT1JUUkFJVDogJ1BPUlRSQUlUJyxcblxuXHRGT1JXQVJEOiAnRk9SV0FSRCcsXG5cdEJBQ0tXQVJEOiAnQkFDS1dBUkQnLFxuXG5cdEhPTUU6ICdIT01FJyxcblx0RElQVFlRVUU6ICdESVBUWVFVRScsXG5cblx0TEVGVDogJ0xFRlQnLFxuXHRSSUdIVDogJ1JJR0hUJyxcblx0VE9QOiAnVE9QJyxcblx0Qk9UVE9NOiAnQk9UVE9NJyxcblxuXHRJTlRFUkFDVElWRTogJ0lOVEVSQUNUSVZFJyxcblx0VFJBTlNJVElPTjogJ1RSQU5TSVRJT04nLFxuXG5cdE9QRU5fRkVFRDogJ09QRU5fRkVFRCcsXG5cdE9QRU5fR1JJRDogJ09QRU5fR1JJRCcsXG5cblx0UFhfQ09OVEFJTkVSX0lTX1JFQURZOiAnUFhfQ09OVEFJTkVSX0lTX1JFQURZJyxcblx0UFhfQ09OVEFJTkVSX0FERF9DSElMRDogJ1BYX0NPTlRBSU5FUl9BRERfQ0hJTEQnLFxuXHRQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEOiAnUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCcsXG5cblx0T1BFTl9GVU5fRkFDVDogJ09QRU5fRlVOX0ZBQ1QnLFxuXHRDTE9TRV9GVU5fRkFDVDogJ0NMT1NFX0ZVTl9GQUNUJyxcblxuXHRDRUxMX01PVVNFX0VOVEVSOiAnQ0VMTF9NT1VTRV9FTlRFUicsXG5cdENFTExfTU9VU0VfTEVBVkU6ICdDRUxMX01PVVNFX0xFQVZFJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblx0SE9NRV9JTUFHRV9TSVpFOiBbIDQ4MCwgMjcwIF0sXG5cblx0SVRFTV9JTUFHRTogJ0lURU1fSU1BR0UnLFxuXHRJVEVNX1ZJREVPOiAnSVRFTV9WSURFTycsXG5cblx0R1JJRF9ST1dTOiA0LCBcblx0R1JJRF9DT0xVTU5TOiA3LFxuXG5cdFBBRERJTkdfQVJPVU5EOiA0MCxcblx0U0lERV9FVkVOVF9QQURESU5HOiAxMjAsXG5cblx0RU5WSVJPTk1FTlRTOiB7XG5cdFx0UFJFUFJPRDoge1xuXHRcdFx0c3RhdGljOiAnJ1xuXHRcdH0sXG5cdFx0UFJPRDoge1xuXHRcdFx0XCJzdGF0aWNcIjogSlNfdXJsX3N0YXRpYyArICcvJ1xuXHRcdH1cblx0fSxcblxuXHRNRURJQV9HTE9CQUxfVzogMTkyMCxcblx0TUVESUFfR0xPQkFMX0g6IDEwODAsXG5cblx0TUlOX01JRERMRV9XOiA5NjAsXG5cdE1RX1hTTUFMTDogMzIwLFxuXHRNUV9TTUFMTDogNDgwLFxuXHRNUV9NRURJVU06IDc2OCxcblx0TVFfTEFSR0U6IDEwMjQsXG5cdE1RX1hMQVJHRTogMTI4MCxcblx0TVFfWFhMQVJHRTogMTY4MCxcbn0iLCJpbXBvcnQgRmx1eCBmcm9tICdmbHV4J1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG52YXIgQXBwRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlVmlld0FjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHRzb3VyY2U6ICdWSUVXX0FDVElPTicsXG5cdFx0XHRhY3Rpb246IGFjdGlvblxuXHRcdH0pO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwRGlzcGF0Y2hlciIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGRpcHR5cXVlLXBhZ2UnPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiZnVuLWZhY3Qtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2UtaW5uZXJcXFwiPlxcblx0XHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snZmFjdC10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2ZhY3QtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZhY3QtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImN1cnNvci1jcm9zc1xcXCI+XFxuXHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE0LjEwNSAxMy44MjhcXFwiPlxcblx0XHRcdFx0PHBvbHlnb24gZmlsbD1cXFwiI2ZmZmZmZlxcXCIgcG9pbnRzPVxcXCIxMy45NDYsMC44MzggMTMuMjgzLDAuMTU2IDcuMDM1LDYuMjUgMC44MzksMC4xNTYgMC4xNzMsMC44MzQgNi4zNyw2LjkzMSAwLjE1OSwxMi45OSAwLjgyMywxMy42NzEgNy4wNyw3LjU3OCAxMy4yNjYsMTMuNjcxIDEzLjkzMiwxMi45OTQgNy43MzYsNi44OTYgXFxcIi8+XFxuXHRcdFx0PC9zdmc+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYWluLWJ0bnMtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgaWQ9J3Nob3AtYnRuJyBjbGFzcz0nbWFpbi1idG4nPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImltZy13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgaWQ9J2Z1bi1mYWN0LWJ0bicgY2xhc3M9J21haW4tYnRuJz5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpbWctd3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJzZWxmaWUtc3RpY2std3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2xvcmlmaWVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMDAgMjJcXFwiPlxcblx0XHRcdFx0XHQ8cGF0aCBkPVxcXCJNNC42LDEuMjVjMC4wMDEsMCwwLjA0NS0wLjAwNiwwLjA4LDBoMC4wMzJjMS4yMTIsMC4wMDMsMzYuNzA2LTEsMzYuNzA2LTFsMjUuNDcxLDAuNTQ5YzAuMDg2LDAuMDAyLDAuMTcyLDAuMDA3LDAuMjU4LDAuMDE3bDEuNDg2LDAuMTY2QzY4LjcxMSwwLjk4OSw2OC43NzMsMSw2OC44MzYsMS4wMzZsMC4zMjQsMC4xOTljMC4wNTIsMC4wMzIsMC4xMSwwLjA0OSwwLjE3MSwwLjA1bDI3LjA0MywwLjQ2OWMwLDAsMi42MjQtMC4wNzcsMi42MjQsMi45MzNsLTAuNjkyLDcuOTZjLTAuMDQ1LDAuNTE4LTAuNDc5LDAuOTE2LTAuOTk5LDAuOTE2aC02LjIwM2MtMC4zMjgsMC0wLjY1MywwLjAzNC0wLjk3NSwwLjFjLTAuODUzLDAuMTc1LTIuODMsMC41MjgtNS4yNjMsMC42MThjLTAuMzQyLDAuMDE0LTAuNjYxLDAuMTgxLTAuODcyLDAuNDUxbC0wLjUsMC42NDVsLTAuMjgsMC4zNThjLTAuMzc0LDAuNDgyLTAuNjQ3LDEuMDM0LTAuNzg5LDEuNjI4Yy0wLjMyLDEuMzQ1LTEuMzk4LDMuOTUyLTQuOTI0LDMuOTU4Yy0zLjk3NCwwLjAwNS03LjY4NS0wLjExMy0xMC42MTItMC4yMjVjLTEuMTg5LTAuMDQ0LTIuOTYsMC4yMjktMi44NTUtMS42MjlsMC4zNi01Ljk0YzAuMDE0LTAuMjE5LTAuMTU3LTAuNDA0LTAuMzc2LTAuNDA5TDI5LjYyLDEyLjQ4OGMtMC4yMTQtMC4wMDQtMC40MjgsMC4wMDEtMC42NDEsMC4wMTVsLTEuNzUzLDAuMTEzYy0wLjIwOCwwLjAxMy0wLjQwNywwLjA4NS0wLjU3NCwwLjIxYy0wLjU1NywwLjQxMS0xLjg5NywxLjM5Mi0yLjY2NywxLjg1OWMtMC43MDEsMC40MjYtMS41MzksMS4wNDItMS45NjgsMS4zNjRjLTAuMTgzLDAuMTM3LTAuMzA5LDAuMzM1LTAuMzU4LDAuNTU4bC0wLjMxNywxLjQyNWMtMC4wNDQsMC4yMDItMC4wMDQsMC40MTMsMC4xMTMsMC41ODNsMC42MTMsMC44OTZjMC4yMTIsMC4zMTEsMC4yOTcsMC42OTksMC4xODgsMS4wNTljLTAuMTE1LDAuMzc4LTAuNDQ0LDAuNzU1LTEuMjkyLDAuNzU1aC03Ljk1N2MtMC40MjUsMC0wLjg0OC0wLjA0LTEuMjY2LTAuMTJjLTIuNTQzLTAuNDg2LTEwLjg0Ni0yLjY2MS0xMC44NDYtMTAuMzZDMC44OTYsMy4zNzUsNC40NTksMS4yNSw0LjYsMS4yNVxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwic2NyZWVuLWhvbGRlclxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwidmlkZW8taG9sZGVyXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcnJvd3Mtd3JhcHBlclxcXCI+XFxuXHRcdDxhIGhyZWY9XFxcIiMvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wYWdlJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwcmV2aW91cy1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInByZXZpb3VzLXBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD0nbGVmdCcgY2xhc3M9XFxcImFycm93IGxlZnRcXFwiPlxcblx0XHRcdFxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImljb25zLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDMyIDI2XFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gZmlsbD1cXFwiI0ZGRkZGRlxcXCIgcG9pbnRzPVxcXCIyMS44NCwyNS4xODQgMTMuNTksMjUuMTg0IDEuMDQ4LDEyLjkzNCAxMy43OTgsMC43NjggMjIuMDA2LDAuNzI2IDEyLjUwNywxMC4xNDMgMzEuNDIzLDEwLjA2IDMxLjU0OCwxNS44NTEgMTEuODgyLDE1Ljg1MSBcXFwiLz5cXG5cdFx0XHRcdFx0PHBhdGggZmlsbD1cXFwiIzAxMDEwMVxcXCIgZD1cXFwiTTEzLjM0LDAuMjY1aDkuNzk0bC05LjY0OCw5LjMwNWgxOC4yMzZ2Ni45MUgxMy41NTNsOS42MDEsOS4yNTlsLTkuODEzLTAuMDJMMC4xNTksMTIuOTkxTDEzLjM0LDAuMjY1ek0yMC43MDcsMS4yNDVoLTYuOTcxTDEuNTY5LDEyLjk5MUwxMy43MzYsMjQuNzRsNi45ODQsMC4wMTRMMTEuMTI1LDE1LjVoMTkuNjE3di00Ljk1SDExLjA1OEwyMC43MDcsMS4yNDV6XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAuNDU2IDAuNjQ0IDcuOTU3IDE0LjIwMlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIHBvaW50cz1cXFwiNy42MjcsMC44MzEgOC4zMDcsMS41MjkgMS45NTIsNy43MjcgOC4yOTMsMTMuOTY1IDcuNjEsMTQuNjU4IDAuNTYxLDcuNzI0IFxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCIgc3R5bGU9XFxcImJhY2tncm91bmQtaW1hZ2U6IHVybChcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwcmV2aW91cy1wcmV2aWV3LXVybCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwcmV2aW91cy1wcmV2aWV3LXVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIpXFxcIj48L2Rpdj5cXG5cXG5cdFx0PC9hPlxcblx0XHQ8YSBocmVmPVxcXCIjL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbmV4dC1wYWdlJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWyduZXh0LXBhZ2UnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibmV4dC1wYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9J3JpZ2h0JyBjbGFzcz1cXFwiYXJyb3cgcmlnaHRcXFwiPlxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImljb25zLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDMyIDI2XFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gZmlsbD1cXFwiI0ZGRkZGRlxcXCIgcG9pbnRzPVxcXCIxMC4zNzUsMC44MTggMTguNjI1LDAuODE4IDMxLjE2NywxMy4wNjggMTguNDE3LDI1LjIzNSAxMC4yMDgsMjUuMjc3IDE5LjcwOCwxNS44NiAwLjc5MiwxNS45NDMgMC42NjcsMTAuMTUxIDIwLjMzMywxMC4xNTEgXFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiMwMTAxMDFcXFwiIGQ9XFxcIk0xOC43MDgsMjUuNzM4SDguOTE0bDkuNjQ4LTkuMzA1SDAuMzI2di02LjkxaDE4LjE2OUw4Ljg5NCwwLjI2NWw5LjgxNCwwLjAybDEzLjE4MSwxMi43MjdMMTguNzA4LDI1LjczOHpNMTEuMzQxLDI0Ljc1N2g2Ljk3MWwxMi4xNjctMTEuNzQ2TDE4LjMxMiwxLjI2M2wtNi45ODUtMC4wMTRsOS41OTYsOS4yNTRIMS4zMDZ2NC45NUgyMC45OUwxMS4zNDEsMjQuNzU3elxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjEuMjQsMTQuNjU4IDAuNTYxLDEzLjk2IDYuOTE1LDcuNzYyIDAuNTc1LDEuNTI1IDEuMjU3LDAuODMxIDguMzA3LDcuNzY1IFxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCIgc3R5bGU9XFxcImJhY2tncm91bmQtaW1hZ2U6IHVybChcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcHJldmlldy11cmwnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ25leHQtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibmV4dC1wcmV2aWV3LXVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIpXFxcIj48L2Rpdj5cXG5cdFx0PC9hPlxcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYnVmZmVyID0gXG4gIFwiXHQ8ZGl2IGRhdGEtaWQ9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgZGF0YS1wZXJzb249XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wZXJzb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBlcnNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicGVyc29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInBvc3RcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3Atd3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0XHQ8aW1nIHNyYz1cXFwiXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGVyc29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wZXJzb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjbGVhci1mbG9hdFxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidGltZVxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRpbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtZWRpYS13cmFwcGVyXFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMVsnaXMtdmlkZW8nXSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMVsnaXMtdmlkZW8nXSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5ub29wLFwiaW52ZXJzZVwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImljb25zLXdyYXBwZXJcXFwiPlxcblx0XHRcdFxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiY29tbWVudHMtd3JhcHBlclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29tbWVudHMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbW1lbnRzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiY29tbWVudHNcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29tbWVudHMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHQ8ZGl2IGNsYXNzPSd2aWRlby13cmFwcGVyJz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid2lzdGlhX2VtYmVkIHdpc3RpYV9hc3luY19cIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS51cmwgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIgcGxheWVyQ29sb3I9MWVlYTc5IHBsYXliYXI9ZmFsc2Ugc21hbGxQbGF5QnV0dG9uPWZhbHNlIHZvbHVtZUNvbnRyb2w9ZmFsc2UgZnVsbHNjcmVlbkJ1dHRvbj1mYWxzZVxcXCIgc3R5bGU9XFxcIndpZHRoOjEwMCU7IGhlaWdodDoxMDAlO1xcXCI+Jm5ic3A7PC9kaXY+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHQ8ZGl2IGNsYXNzPSdpbWFnZS13cmFwcGVyJz5cXG5cdFx0XHRcdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnVybCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIjtcblxuICByZXR1cm4gXCJcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbW1lbnRcXFwiPlxcbiAgICBcdFx0XHRcdDxkaXYgY2xhc3M9XFxcIm5hbWVcXFwiPlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncGVyc29uLW5hbWUnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3BlcnNvbi1uYW1lJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvbi1uYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2PlxcbiAgICBcdFx0XHRcdDxkaXYgY2xhc3M9XFxcInRleHRcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3BlcnNvbi10ZXh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwZXJzb24tdGV4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwZXJzb24tdGV4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZmVlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIGlkPVxcXCJMYXllcl8xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHQ8L2E+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWFwLWJ0blxcXCI+PGEgaHJlZj1cXFwiIyEvbGFuZGluZ1xcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubWFwX3R4dCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjYW1wZXItbGFiXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYlVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsYWJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwic2hvcC10aXRsZSBzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2Rpdj5cXG5cdFx0XHRcdDx1bCBjbGFzcz1cXFwic3VibWVudS13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJtZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTFcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMud29tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53b21lblNob3BVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIndvbWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3dvbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHQ8L3VsPlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2hlYWRlcj5cXG5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0PGRpdj48L2Rpdj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhvcml6b250YWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhvcml6b250YWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJob3Jpem9udGFsXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmhvcml6b250YWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcIjRcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52ZXJ0aWNhbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmVydGljYWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJ2ZXJ0aWNhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy52ZXJ0aWNhbCkgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9aGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcsIGFsaWFzND10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGJ1ZmZlciA9IFxuICBcIjxkaXYgY2xhc3M9J3BhZ2Utd3JhcHBlciBob21lLXBhZ2UnPlxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lclxcXCI+PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWZyb250LWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYm90dG9tLXRleHRzLWNvbnRhaW5lclxcXCI+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8dWw+XFxuXHRcdFx0XHQ8bGkgaWQ9J2RlaWEnPkRFSUE8L2xpPlxcblx0XHRcdFx0PGxpIGlkPSdhcmVsbHVmJz5BUkVMTFVGPC9saT5cXG5cdFx0XHRcdDxsaSBpZD0nZXMtdHJlbmMnPkVTIFRSRU5DPC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidGV4dHMtd3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZ2VuZXJpY1xcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5nZW5lcmljIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5nZW5lcmljIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJnZW5lcmljXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSd0eHQnIGlkPVxcXCJkZWlhXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydkZWlhLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZGVpYS10eHQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZGVpYS10eHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9J3R4dCcgaWQ9XFxcImFyZWxsdWZcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2FyZWxsdWYtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydhcmVsbHVmLXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJhcmVsbHVmLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZXMtdHJlbmNcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2VzLXRyZW5jLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZXMtdHJlbmMtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImVzLXRyZW5jLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGlkPVxcXCJzb2NpYWwtd3JhcHBlclxcXCI+XFxuXHRcdFx0PHVsPlxcblx0XHRcdFx0PGxpIGNsYXNzPSdpbnN0YWdyYW0nPlxcblx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmluc3RhZ3JhbVVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5zdGFncmFtVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpbnN0YWdyYW1VcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTYuMTA3LDE1LjU2MmMwLDAuMzAyLTAuMjQzLDAuNTQ3LTAuNTQzLDAuNTQ3SDIuNDM4Yy0wLjMwMiwwLTAuNTQ3LTAuMjQ1LTAuNTQ3LTAuNTQ3VjcuMzU5aDIuMTg4Yy0wLjI4NSwwLjQxLTAuMzgxLDEuMTc1LTAuMzgxLDEuNjYxYzAsMi45MjksMi4zODgsNS4zMTIsNS4zMjMsNS4zMTJjMi45MzUsMCw1LjMyMi0yLjM4Myw1LjMyMi01LjMxMmMwLTAuNDg2LTAuMDY2LTEuMjQtMC40Mi0xLjY2MWgyLjE4NlYxNS41NjJMMTYuMTA3LDE1LjU2MnogTTkuMDIsNS42NjNjMS44NTYsMCwzLjM2NSwxLjUwNCwzLjM2NSwzLjM1OGMwLDEuODU0LTEuNTA5LDMuMzU3LTMuMzY1LDMuMzU3Yy0xLjg1NywwLTMuMzY1LTEuNTA0LTMuMzY1LTMuMzU3QzUuNjU1LDcuMTY3LDcuMTYzLDUuNjYzLDkuMDIsNS42NjNMOS4wMiw1LjY2M3ogTTEyLjgyOCwyLjk4NGMwLTAuMzAxLDAuMjQ0LTAuNTQ2LDAuNTQ1LTAuNTQ2aDEuNjQzYzAuMywwLDAuNTQ5LDAuMjQ1LDAuNTQ5LDAuNTQ2djEuNjQxYzAsMC4zMDItMC4yNDksMC41NDctMC41NDksMC41NDdoLTEuNjQzYy0wLjMwMSwwLTAuNTQ1LTAuMjQ1LTAuNTQ1LTAuNTQ3VjIuOTg0TDEyLjgyOCwyLjk4NHogTTE1LjY2OSwwLjI1SDIuMzNjLTEuMTQ4LDAtMi4wOCwwLjkyOS0yLjA4LDIuMDc2djEzLjM0OWMwLDEuMTQ2LDAuOTMyLDIuMDc1LDIuMDgsMi4wNzVoMTMuMzM5YzEuMTUsMCwyLjA4MS0wLjkzLDIuMDgxLTIuMDc1VjIuMzI2QzE3Ljc1LDEuMTc5LDE2LjgxOSwwLjI1LDE1LjY2OSwwLjI1TDE1LjY2OSwwLjI1elxcXCIvPlxcblx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PGxpIGNsYXNzPSd0d2l0dGVyJz5cXG5cdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50d2l0dGVyVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50d2l0dGVyVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ0d2l0dGVyVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAyMiAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIxLjE3NiwwLjUxNGMtMC44NTQsMC41MDktMS43OTksMC44NzktMi44MDgsMS4wNzljLTAuODA1LTAuODY1LTEuOTUzLTEuNDA1LTMuMjI2LTEuNDA1Yy0yLjQzOCwwLTQuNDE3LDEuOTkyLTQuNDE3LDQuNDQ5YzAsMC4zNDksMC4wMzgsMC42ODgsMC4xMTQsMS4wMTNDNy4xNjYsNS40NjQsMy45MSwzLjY5NSwxLjcyOSwxYy0wLjM4LDAuNjYtMC41OTgsMS40MjUtMC41OTgsMi4yNGMwLDEuNTQzLDAuNzgsMi45MDQsMS45NjYsMy43MDRDMi4zNzQsNi45MiwxLjY5MSw2LjcxOCwxLjA5NCw2LjM4OHYwLjA1NGMwLDIuMTU3LDEuNTIzLDMuOTU3LDMuNTQ3LDQuMzYzYy0wLjM3MSwwLjEwNC0wLjc2MiwwLjE1Ny0xLjE2NSwwLjE1N2MtMC4yODUsMC0wLjU2My0wLjAyNy0wLjgzMy0wLjA4YzAuNTYzLDEuNzY3LDIuMTk0LDMuMDU0LDQuMTI4LDMuMDg5Yy0xLjUxMiwxLjE5NC0zLjQxOCwxLjkwNi01LjQ4OSwxLjkwNmMtMC4zNTYsMC0wLjcwOS0wLjAyMS0xLjA1NS0wLjA2MmMxLjk1NiwxLjI2MSw0LjI4LDEuOTk3LDYuNzc1LDEuOTk3YzguMTMxLDAsMTIuNTc0LTYuNzc4LDEyLjU3NC0xMi42NTljMC0wLjE5My0wLjAwNC0wLjM4Ny0wLjAxMi0wLjU3N2MwLjg2NC0wLjYyNywxLjYxMy0xLjQxMSwyLjIwNC0yLjMwM2MtMC43OTEsMC4zNTQtMS42NDQsMC41OTMtMi41MzcsMC43MDFDMjAuMTQ2LDIuNDI0LDIwLjg0NywxLjU1MywyMS4xNzYsMC41MTRcXFwiLz5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaSBjbGFzcz0nZmFjZWJvb2snPlxcblx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZhY2Vib29rVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mYWNlYm9va1VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjZWJvb2tVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTcuNzE5LDE2Ljc1NmMwLDAuNTMxLTAuNDMxLDAuOTYzLTAuOTYyLDAuOTYzaC00LjQ0M3YtNi43NTNoMi4yNjdsMC4zMzgtMi42MzFoLTIuNjA0VjYuNjU0YzAtMC43NjIsMC4yMTEtMS4yODEsMS4zMDQtMS4yODFsMS4zOTQsMFYzLjAxOWMtMC4yNDEtMC4wMzItMS4wNjgtMC4xMDQtMi4wMzEtMC4xMDRjLTIuMDA5LDAtMy4zODUsMS4yMjctMy4zODUsMy40Nzl2MS45NDFINy4zMjJ2Mi42MzFoMi4yNzJ2Ni43NTNIMS4yNDNjLTAuNTMxLDAtMC45NjItMC40MzItMC45NjItMC45NjNWMS4yNDNjMC0wLjUzMSwwLjQzMS0wLjk2MiwwLjk2Mi0wLjk2MmgxNS41MTRjMC41MzEsMCwwLjk2MiwwLjQzMSwwLjk2MiwwLjk2MlYxNi43NTZcXFwiLz5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdFx0PGRpdj5jPC9kaXY+XFxuXHRcdFx0PGRpdj5kPC9kaXY+XFxuXHRcdFx0PGRpdj5lPC9kaXY+XFxuXHRcdFx0PGRpdj5mPC9kaXY+XFxuXHRcdFx0PGRpdj5nPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b21cXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+PC9kaXY+XHRcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImRlaWFcXFwiPkRFSUE8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImVzLXRyZW5jXFxcIj5FUyBUUkVOQzwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJlbGx1ZlxcXCI+QVJFTExVRjwvZGl2PlxcbjwvZGl2Plxcblxcbjxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIi02NyAwIDc2MCA2NDVcXFwiPlxcblx0XFxuXHRcXG5cdDxwYXRoIGlkPVxcXCJtYXAtYmdcXFwiIHN0cm9rZT1cXFwiI0ZGRkZGRlxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIyXFxcIiBmaWxsPVxcXCIjZmZmZmZmXFxcIiBkPVxcXCJNOS4yNjgsMjg5LjM5NGw5Ljc5LTcuNzk4bDEuODkxLDAuNzkzbC0xLjYyOSw1LjAyMWwtNS4yODYsNC41MDRsLTQuMzU0LDcuMDEybC0zLjA4OC0xLjE5OGwtMi4yMzQsMi44ODVsMCwwbC0yLjM4Mi0xLjE3N0w5LjI2OCwyODkuMzk0eiBNNTczLjU4LDE3NC4yMTFsMTkuODktMTMuODJsOC45MDEtMi40NzlsNS4zNTQtNC44MDlsMS41Ni01LjU1NWwtMS02LjkyMmwxLjQ0NS0zLjk3M2w1LjA1Ny0yLjUyM2w0LjI3MSwyLjAxbDExLjkwNiw5LjE2NWwyLjY5Myw0LjkxN2wyLjg5MiwxLjU3NWwxMS40ODIsMS4zNjdsMy4wNTcsMS45NDlsNC40MTgsNS4yMTFsNy43NjgsMi4yMjFsNS44MzIsNC45MTZsNi4zMDUsMC4yMTVsNi4zNzMtMS4yMmwxLjk4OSwxLjg4bDAuNDA5LDEuOTYzbC01LjMzNiwxMC40MjhsLTAuMjI5LDMuODY5bDEuNDQxLDEuNjQ3bDAuODU0LDAuOTU4bDcuMzk1LTAuNDI3bDIuMzQ3LDEuNTRsMC45MDMsMi41MTlsLTIuMTAyLDMuMDU0bC04LjQyNSwzLjE4M2wtMi4xNjksNy4xMTZsMC4zNDQsMy4xODNsMy4wNzMsNC4yMzFsMC4wMTUsMi44NDZsLTIuMDE5LDEuNDVsLTAuNzM5LDMuODQzbDIuMTY2LDE2LjY4N2wtMC45ODIsMS44OGwtNi43ODUtMy43NTdsLTEuNzU4LDAuMjU0bC0yLjAxOSw0LjQ2OGwxLjAzMiw2LjIzN2wtMC42MDUsNC44MjdsLTAuMzYzLDIuODY4bC0xLjQ5NSwxLjY2NWwtMi4xMDItMC4xMjlsLTguMzQxLTMuODQ3bC00LjAxMS0wLjQwNWwtMi43MTEsMS42MDRsLTcuNDM4LDE2LjQ5N2wtMy4yODQsMTEuNTk5bDMuMjIsMTAuNTk3bDEuNjQsMS44NTlsNC4zODYtMC4yOGwxLjQ3OCwxLjY5bC0xLjkzNywzLjM5NWwtMi42OTMsMS4wOTVsLTcuODUxLTAuMTI5bC0yLjU0NiwxLjYyMmwtMi42NjEsMy43MThsMC4xMjksMC44OTdsMC42MDksNC40NDZsLTEuNDc4LDQuMzEzbC0zLjY4LDMuMzEybC0zLjkwOSwxLjE3M2wtMTEuOTg5LDcuNzU4bC01LjM1NCw3Ljk2N2wtOC45MzgsNi41MzlsLTMuMzUxLDYuNjYzbC01Ljc4LDYuNTQybC00LjgyNyw4LjE4MmwwLjI5NCwzLjkwOGwtNC44OTYsMTIuMjg3bC0yLjAyLDUuMTA3bC0zLjIwMiwyMi4zOTNsMC43MjEsOC44NDJsLTEuMDMzLDIuOTVsLTEuNzI1LTAuMjc2bC00LjEyNS00LjQ2OGwtMS42MjQsMC45NjJsLTEuMzk2LDMuMjcybDEuODIyLDQuODQ4bC0xLjY5Miw1LjAyMWwtNC43MzEsNi42MDRsLTguMDYyLDE5LjI5MmwtMi45NzcsMC4zNDFsLTAuNTQxLDAuNDQ4bC0xLjQ3OSwxLjE5NWwxLjMxNiw0LjQ4OWwtMi4yODQsMy4zOTVsLTIuNTE0LDEuMjY0bC01LjQ4NC00LjUzMmwtMy4wODgtMC44OTRsLTAuODA3LDEuOTAxbDIuMjIxLDcuMTc4bC0zLjQsMS4zODlsLTguMzYzLTAuMTNsLTEuNTExLDIuMmwxLjEwMiw1LjM2NWwtMC42ODgsMi43NzNsLTMuMTM4LDMuMTY1bC02LjYwMywyLjhsLTMuODk2LDQuMTg4bC00LjYyOS0xLjMyNGwtNC43MzEsMC42MTdsLTUuMDkyLTIuNTg0bC0yLjYyNSwzLjU2N2wwLjQ3MywyLjcxM2wwLjE4LDEuMDI2bC0xLjMxMiwxLjY4N2wtMTIuNDUyLDQuNzY2bC00LjU5OCw0LjQ4NWwtNy4wNjIsMTEuMDY3bC0xNy42MjMsMTkuODA5bC00LjA5MiwxLjcyN2wtNC40OTgtMC42MTdsLTMuNjQ2LTMuMTg0bC0yLjc5NS02LjUxN2wtNy4xNzYtOC44NjdsLTEuMjMzLTAuNTU2bC0zLjUxNS0xLjY0NGwtMS45MDQtMy42MzJsMS4zNDktNS4zODdsLTMuMjcxLTQuMDU5bC03LjAxNS01LjUxMmwtMi44OTEsMS43OTRsLTQuMDIzLDAuNDdsLTIuODczLTEuNzI5bC0xLjI2Ny01LjU1NWw0Ljc5OS04LjM1NGwtMC4wODItMS42MDFsLTIuNTI4LTQuODk1bC04LjAyLTkuNjE0bC01LjM1Mi00LjE2NmwtNC42MTUtMS44MzdsLTQuMjIxLDAuNjQybC02Ljc4NS0wLjc3MWwtNC44MTMtMC41NzRsLTYuOTQ2LDIuNjI3bC0zLjAwNiw0LjA1OWwtMS45MjIsMC4yNTVsLTE0LjU2OC03LjgzN2wtNC44NjItMC42MjFsLTguNDYsMS44MzdsLTguNDg5LTAuOTgzbC00LjIwNywwLjY2NGwtNy43MTgsNC4xNjdsLTMuNTE1LDAuNjgybC0yLjkwOC0xLjE5NWwtNC44MTItNC42ODNsLTQuMTU3LTAuNTUzbC03LjI3MywxLjQzMmwtMS42NDItMC42ODJsLTEuMzYzLTQuMTI3bC00Ljg5OC0zLjA3NWwtMy4xOTktNS4yNzlsLTExLjQwMS04Ljg4NWwtNS4yMjItNy4xNTlsLTMuMDg4LTcuNTY1bC0wLjQwOS01LjgzMWwzLjYxMS0xMi42NzFsMC4xMzMtNS44MTFsLTEuMTY5LTQuNDY4bC01Ljg0Ni04LjQxOGwtMy4wMzctNi40NDlsLTIuMzE3LTQuOTM4bDEuMzYzLTIuNzUzbDMuNzc1LTIuMDk2bDIuOTkyLTcuNDE0bDQuNC0zLjk5NGwyLjEwNC0zLjc2MWwtNC4wMjQtOS45MTVsLTMuODQ0LTYuNzI5bC04LjM0Ni03LjY0N2wtOC43NjktMi41ODhsLTkuNDI5LTEwLjM0MmwtNC4yNTctMi4zMjVsLTUuMzE4LTUuMzg2bC03LjI2Mi0xLjk0NWwtMC42NzEtMC4xNjhsLTUuMTc1LTEuMzkzbC0yLjk1NiwwLjU2bC0yLjg1NywwLjU1M2wtMi45MjQtMS4wNDhsLTMuOTQ0LDIuMDk2bC0yLjMsNC4xMjNsMC4xNDcsMS40MzJsMC4wODcsMC42ODJsMy45MzgsNS4xNDlsLTIuMzk2LDIuNTIzbC0xMC44ODgtNS42ODVsLTQuMjA3LDAuMTUxbC01Ljk5MywxMS42NjNsLTQuMDkyLDMuODI5bC02LjcxNy0wLjgzM2wtOS45MjEsMy4yNjZsLTcuNjUyLDIuNTIybC0yLjc3NiwzLjAzM2wtMC4yOTcsMi40NTRsMy4zMDMsNC4wNDFsLTMuMDIzLDEuMDkxbC0wLjU5MiwxLjM2N3Y3LjA0OGwtNi44ODIsMTUuNzA0bC0yLjc3NiwxMC4yNTZsMS4yMDIsNC4xMDJsLTAuODI1LDIuNjA5bC0xMi4zMTUtNS4xOTNsLTguNzU4LTYuNDMxbC01LjA0MywyLjkwN2wtMC44ODYsMC40ODhsMS40ODEtNS4yMTFsLTEuNjEtNi40MDlsMi4wMi01LjU1NmwtMC45MTktMi42N2wtNC40MzYsMS4zNjdsLTQuNjgxLTAuNmwtMy4wNzMtNC45MTJsLTEuMzQ1LTQuNjM3bDEuMTgtMi45NDlsMi44OTUtMS45NjdsNy4wMTEtMC43MDNsMS42NDMtMS4zMjhsLTAuMjYyLTEuNzdsLTcuMzQ1LTMuNTQ5bC02LjQ3LTEwLjM2M2wtNi4xMjYsMC4wNDNsLTQuNTk4LDUuMDY2bC0zLjU2NCwwLjg3M2wtNC43NDgsMS4xNzZsLTAuNTkyLTIuMTM1bDEuMDUxLTMuODI1bC0xLjA4My0yLjg2NGwtMy4yODUtMC43MDZMNjQuMzc1LDMyOGwtMi41OTcsNi43NTNsLTQuNjk4LDMuMjkxbC00Ljg1OS0wLjU3N2wwLjcwNy0zLjg0OGwtMS4xMDItMi4zNTFsLTMuMTcsMC4zODRsLTMuMTcxLTMuMTU4bC00LjA0MSw0LjM3OWwtMy4xNTIsMC4yMTFsLTEuNjQ0LTIuMzY4bDIuNjExLTMuMjI5bDguNTQzLTMuNDU5bDMuNDQ2LTIuODE3bC0wLjExNS0xLjI0MmwtMS0wLjc1bC0yLjY5MywxLjI2M2wtNS4zODctMC40MzFsLTIuMTg1LTIuMjM5bC0xMC42NDQtMTAuODk4bC0wLjU5Mi0yLjEzNWwxLjcwNy02LjYwM2wtMC41NzQtMi40OThsLTMuNTI5LTIuOTkzbC0wLjYwOS0yLjE1N2wzLjY5NC03LjczN2wyLjMwMi0wLjU5NmwyLjcxMi01LjUxNmw5LjE4MS05LjQybDguNTcxLDAuMDY1bDExLjYyNy01LjU5OWw1LjgzNS00Ljk5OWwxLjg1NC0yLjc3OGwzLjIzNS00Ljg5NWw1LjgzMS00LjY1NGwxMi44OTMtNi40MTNsNy4xMy02LjM0NWw1LjA4OS03LjMwNmw1LjcxNy0yLjM3Mmw1LjgzMS04LjMzM2wzLjI4NS0yLjg0Mmw3LjQ4OC0yLjk3MWw0Ljg2My02LjA4NmwzLjIwMy0xLjI2M2wxMC4xNjcsMS4zNjdsNi42NzEtMS43NTFsNS4wNTctMy40MzhsMTQuOTgtMTIuMjg3bDQuMDg4LTguMjQ3bDE0LjA0NC0xNC42MTZsNi42NjctMTAuNzQ0bDQuMDEsMy45MTJsNC40ODMtMS45MDJsNS4zMDgtNC40ODZsMS43OS00LjIxM2w2LjE1Ny0xNC40MDFsNC44MjctMS44NTVsNi40MDgsNC45MTNsMi41OTQtMi44NjRsLTAuNzM4LTUuODUzbDAuNjc0LTIuOTY4bDIxLjk2My0xNy44ODVsNS4wMzktMi43MzRsNS43OTksMy4zMTJsMy4zNjctMC44NzVsMy41MzMtMy42OTZsMS44MDgtNS4yNTdsMC40NTktMS4zMjRsMy4yOTksMC43MDdsMS40MTQtMTAuNDkzbDEuODIxLTEuMzI0bDQuNjY2LDEuMzAzbDQuNDY1LTEuMzQ2bDYuNTU2LDIuMTEzbC0wLjE5Ny0yLjA0OWwtMC4xMTQtMS4yMzhsLTAuMDMyLTAuMjU4bDEuNzA3LTIuNTQxbDAuNDQ0LDAuMDY0bDkuODE5LDEuNTE4aDAuMDE4bDYuODE3LTIuMjlsNS44Ni0xLjk2M2w3LjA5OC04LjI1bDguMzYtMi4ybDQuNTMyLTIuNzU5bDQuNTAxLTUuNzY3bDIuNDgxLTMuMTgzbDguMTYzLTUuMjFsNC45OTIsMi4wMjdsNC40MTgtMy45NzJsNC4wNTctMC40OTZsNC45MTMtMi45MDNsOC40NzUtMTAuODA5bDIuNzc1LDAuNjgybDMuMzgzLDMuNjFsMS44OSwyLjAzMWwyLjM2MywyLjUxOWw4LjY0My0wLjc2OGwxNS42MDItMTIuMzQ4bDQuODEyLTIuNDU4bDExLjA3MS01LjY2M2wzLjcxMi0wLjE0N2wtMC40NzgsNS40NDdsMS44OTEsMC43OWw1Ljc2Ny0yLjY2OWwzLjYxMSwxLjI1OWwtMi43MjYsNC45NTZsMC4xNDcsMy41MjdsMy43MTItMC4zMjNsMTcuNjczLTExLjUxMmwyLjMxNy0wLjU3OGwyLjAwNSwxLjY4N2wtMC45ODYsMi4wNzRsMC40MDgsMS45NjZsMTEuMzUyLTEuODQxbDQuMzU0LTIuNTg0bDEuNzA3LTIuMzcybDQuMzgzLTYuMDg2bDcuMTQ3LTUuMjM2bDEyLjQzNC01LjQ3M2w0LjU2NS0wLjA4NmwwLjk2OSwxLjQ1M2wtMS43MDcsMi4zNzZsMC43NzEsMS45ODRsNC4wNTYtMC4yOThsMTMuODQ3LTUuNzI4bDIuMjM0LDEuMDA1bC00LjA4OSwzLjk5NGwtMi4zMzQsNi45MDFsLTIuMTg1LDEuNDc1bC0zLjQ4Mi0wLjU1NmwtMy4yMjEsMS4wNDRsLTguOTE2LDYuODYxbC02LjY4NCw1LjEyOGwtMy43ODEsMS43M2wtMTEuMzk2LTAuMjk4bC01Ljk0Niw1LjY2M2wtMy4yNTMsNC43NDRsLTQuMjU0LDEuMDA1bC0wLjE3OSw5LjMxMmwtNy42MjEtOC4xODJsLTQuNzQ5LDAuMjc2bC0zLjc0Myw0LjE5MWwtMS4yMzQsNi40NDlsMS43NDMsOS42MTdsMi44MDgsNi40OTJsMS44NzIsNC4zMzlsNy4wNDgsNS42ODFsOS4zNzgtMS4yMzhsNy4xMTItNS4wNjNsMi4yOTktMC4yMzNsMi44NzYsMS45MmwyLjk4Ny0wLjE2OGwzLjg3Ny0zLjMwOWw5LjI5Ni0yLjk5M2w0LjkwOS0zLjI0OGw1Ljg1LTcuMjQybDMuMTAzLTIuMTE3bDQuMDYtMC4xMjlsMy4zOTksMS45NjdsLTkuNjI1LDguNzgxbC0wLjMxMiwwLjk4M2wtMS44MjUsNS43NjdsMC44ODksMy4wNThsMi4zMTcsMi40MTFsMy4wMDYtMC4zNjJsMC4zNDQsMy4yMDhsLTQuMDU2LDMuNDU5bC02LjUwNiw5LjUxbC00LjAwNywyLjc1MmwtNy43MDMtMC4yNTVsLTYuNjg1LDMuNTA2bC0zLjMwNC0wLjU2bC0yLjQ2My0zLjExOGwtMy4zODMtMi4xMzVsLTEuOTM5LDAuMjU0bC0yLjk1NiwyLjY0OGwtMi4yMzMsNS4zNDRsLTEuOTU1LDYuOTIybDAuNTQ1LDIuNjkxbDAsMGwzLjg0MiwxMy4wNzdsOC4wNDgsMTUuOTYybDYuNDM4LDcuMjJsMTMuMzIzLDkuNDAybDIyLjU0OCwxMC4yNTNsMC42MjcsMS4yNjNsMTEuNTQ1LDUuNjJsNS4zNCwyLjU4M2w1LjE3NSwxLjUzNmwzLjg3NC0wLjQ4OGw1LjQ1NC0zLjM3Nkw1NzMuNTgsMTc0LjIxMXogTTM4Ny41MTcsNjAxLjk3M2wtMi43NTktMy42OTZsMC40NTktMS45MDJsMi4xMzgtMS4xM2wwLjMyNy0yLjk3NWwyLjUxNC0xLjQ1bDMuODA5LDAuNTU2bDAuNDI3LDEuNjIybC0yLjI4LDcuMDk1bC0yLjA1NiwyLjU0MWwwLDBMMzg3LjUxNyw2MDEuOTczeiBNMzY1LjY1Nyw2MTQuMzQ2bDMuOTA5LDExLjQ5MWwyLjIxNywwLjY2M2wwLjk4Mi0yLjA3bC0wLjI0NC0wLjc3MWwtMS4wODMtMy41MjNsMC42MzgtMi40MzhsMi41OTgsMC4zMDJsMi43ODksMy4xNThsMy4wOTMsMC43MDdsMi4yNDgtMy4wNThsLTEuOTktNS4yMTFsMC42Ni0yLjQzN2wyLjYyNS0wLjM4NGw0LjcxNiwyLjg4NWw2LjAxMSwxLjIxN2wyLjMzNSwxLjkwMmwtNC42MzQsNS41NTVsLTQuMTcxLTAuMjM2bC0xLjQ3OCwxLjg1OGwtMC44NCwyLjYwOGwyLjQ2NSwyLjYwNWwtMy4yMDMsNC43NjZsMC4wODMsMS43NzNsMy41MjgsNS40NjlsLTAuNTg4LDEuMjJsLTIuNDQ5LDAuMzg0bC01Ljk5My0xLjc1MWwtNi4xOTMsMS45NjNsMCwwbC0wLjI4LTQuNDI1bC04LjUzOSwwLjQwOWwtMC40NDQtMS40MzJsMy4zODYtNC43NDRsLTAuNzg5LTEuNjIybC02Ljg1LTEuNzk0bC0wLjYyNS00LjYxNWw0Ljk2LTUuMDIxbC0yLjUxNC0xLjkwMWwtMC40MDktMi4xMzZsMS40OTItMi4wMzFMMzY1LjY1Nyw2MTQuMzQ2elxcXCIvPlxcblx0XFxuXHQ8dGV4dCB4PVxcXCIzNjRcXFwiIHk9XFxcIjI0MlxcXCI+QSBWSVNJT04gT0Y8L3RleHQ+XFxuXHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgzMDAsIDI1OClcXFwiPjxwYXRoIGZpbGw9XFxcIiMxZWVhNzlcXFwiIGQ9XFxcIk04Ny44ODQsMS4wMDFjLTAuNzk4LDAuMjk0LTE3LjUzLDEzLjYxNy0zNy43NjMsNDAuNzU4Yy01Ljg5Miw4LjQ3Mi05LjMxOSwxNC42MDctNi44OTUsMTUuNTNjMi4yMzksMC44MzgsNC40OSwxLjYzNiw2Ljc1LDIuMzk2YzAuNjE3LDAuMjA3LDAuOTQyLDAuMjMxLDEuMTgyLTAuMTg2YzAuNTU3LTEuMDcxLDEuMDItNy45MzMsNC4zNTctMTMuMzA2YzQuODA5LTcuNzMsMTEuMjE0LTcuMzg0LDE0Ljg3My02LjYxMmMxLjgwOCwwLjM5NywyLjk2OSwyLjAwNiwxLjQ2Myw1LjM0MmMtMy43NjQsOC40ODktMTAuOCwxNC44ODQtMTEuODU2LDE2Ljg3NWMtMC41MzcsMS4wOSwwLjk2NSwxLjI2OSwxLjM5NywxLjM4NmMxLjc5NCwwLjQ5OCwzLjU5NSwwLjk3Myw1LjM5OCwxLjQyNWMxLjQzOSwwLjM2MSwyLjc2MSwyLjkyNywxMC43ODgtMTcuMzU5QzkwLjgzLDExLjYzNyw4OC41MzksMC44NTcsODcuODg0LDEuMDAxeiBNNzUuNTMyLDI5LjgzNWMtMy4yNDMtMC41Ny03Ljg3NCwwLjQ5MS04LjU2NiwwLjMyNGMtMC40NTEtMC4xLTAuNDI2LTAuNjQxLDAuMDY2LTEuNDY3YzMuMTM3LTQuOTEzLDEzLjA0Mi0xNS40ODYsMTQuNjA0LTE1LjQyYzEuMTE1LDAuMDczLTEuMDE4LDkuODY5LTMuMDY5LDE0LjQ3N0M3Ny42MDQsMjkuODA3LDc2LjgzNCwzMC4wNzMsNzUuNTMyLDI5LjgzNXogTTk4LjczOSw2OC45NTFjLTAuMzEyLDEuNjIyLTEuNzY5LDEuMDU2LTIuMzYsMC45ODhjLTYuNjk5LTAuNzUyLTEzLjM2NS0xLjc5OS0xOS45NzktMy4xNDljLTIuNjQyLTAuMzgyLTAuODc5LTIuOTE3LDQuNjAyLTE4LjU3MWMzLjk5LTEwLjIwMywxOC41NzItNDUuNjcxLDE5LjE0MS00NS43NTRjMS40ODMsMC4wNDQsMi45NjgsMC4wODgsNC40NTEsMC4xMzJjMC4xOTYsMC4wMDUsMC40ODcsMC4xNzUsMC4xMDEsMS42MDVjLTAuMjg3LDEuODEzLTguNzk2LDE4LjU5Mi0xNS44ODMsNDAuMTE1Yy0zLjQzNywxMC44MDQtMS40NzQsMTMuODU4LDEuMDczLDE0LjIyMWM0LjI5MSwwLjYxNiw4LjM2MS01Ljk2OCw5LjQxNi01Ljg2NEMxMDAuMDYsNTIuNzQ2LDk4Ljc2LDY4LjUzNyw5OC43MzksNjguOTUxeiBNMTI1Ljg3NCw3MC4xMDRjLTAuMDI2LDEuNjM3LTEuNTY0LDEuMjUyLTIuMTYxLDEuMjU0Yy02Ljc1LDAuMDQ5LTEzLjQ5Ni0wLjE5NC0yMC4yMTUtMC43MzVjLTIuNjU2LTAuMDU1LTEuMzcxLTIuODQsMS4yNjYtMTkuMzUyYzIuMTI0LTEwLjg0OCwxMC4yNDItNDguMzM5LDEwLjgwMi00OC4zNTVjMS40ODMsMC4wNDMsMi45NjcsMC4wODMsNC40NTEsMC4xMjVjMC4xOTYsMC4wMDYsMC41MTcsMC4xNzksMC4zODUsMS42NTNjMC4wMzEsMS44MTctNS40MzksMTkuMzEzLTguNjQsNDEuODQ0Yy0xLjQ4OSwxMS4yNzcsMC45NzcsMTQuMTMsMy41NSwxNC4yMTJjNC4zMzUsMC4xMzMsNy4yMDgtNi44NDgsOC4yNy02Ljg0MkMxMjQuMzQ2LDUzLjkxNSwxMjUuODIzLDY5LjcwMSwxMjUuODc0LDcwLjEwNHogTTEzNy4wNzksMi4yNzdjLTQuNTkyLTAuMjIzLTguNzgsMjMuMTgzLTkuMzkyLDQ0LjIzOWMtMC4yMzksMTQuMTE3LDMuNTg2LDI2LjA3NiwxMy45MzksMjUuMjRjMS42Ny0wLjE0MiwzLjMzOS0wLjMwMiw1LjAwOC0wLjQ3OWMxMC4zMzQtMS4yMDgsMTEuNzUtMTMuMjY4LDguNjk5LTI2LjU3M0MxNTAuNTQyLDI0Ljk3OCwxNDEuNjc3LDIuNjE0LDEzNy4wNzksMi4yNzd6IE0xNDIuNjc1LDU3LjIyOWMtNC44NjQsMC4zOTEtNy45MTItMy4xNjEtOC4yOTQtMTIuNjY5Yy0wLjYxOC0xNy45ODgsMi4wNDItMjkuMjc2LDQuMDI0LTI5LjI2OWMxLjk4MSwwLjAyOSw2LjkxMiwxMC45ODYsOS45MDMsMjguMzkxQzE0OS44MzcsNTIuOTA4LDE0Ny41MzcsNTYuODI0LDE0Mi42NzUsNTcuMjI5eiBNMTcyLjYxNSwzMy45OTRjLTAuNzUtMi4wMTIsMy4zNzktNi4zOTktMi4wNDctMTcuMjM0Yy0yLjg1Mi01Ljc2Ny03LjU5MS0xMi43MDItMTIuNjcxLTEyLjg2OGMtMi40NjktMC4wMzktNC45MzktMC4wODItNy40MDktMC4xMjhjLTAuNDg4LTAuMDA1LTIuMTU5LTEuNDY2LDYuOTY4LDM2LjQ4MWM2Ljk2MiwyOC43OTMsOC4xNCwyNy4wNDIsOS4zNjYsMjYuODA2YzEuOTA0LTAuMzY5LDMuODA2LTAuNzYsNS43MDMtMS4xNzRjMC40ODgtMC4xMDYsMS44MzYtMC4wMTEsMS40MjgtMS4yNzFjLTAuMjA1LTAuNDk2LTUuMTY3LTEwLjMyLTYuODY1LTE2LjAyYy0xLjI0OC00LjE5NiwwLjc2OC03LjcxOSwxLjk1OC03LjkxOWMyLjE4OC0wLjI4NywxMS4zMzksMTMuNTA5LDE0Ljc3OSwyMS40MjhjMC40NjMsMS4xMzgsMS44ODYsMC41MTMsMi43NTksMC4yNjRjMS44MjgtMC41MTUsMy42NTItMS4wNTQsNS40NzEtMS42MTVjMS4wMTQtMC4zMTEsMS4xNC0wLjUxMSwwLjc2OS0xLjI1M0MxODQuNTQsNDMuNzg4LDE3My4yNTcsMzYuMTMzLDE3Mi42MTUsMzMuOTk0eiBNMTYzLjA0NywzMi40MjljLTEuMTM3LDAuMTQ2LTIuMDgzLTIuODQyLTIuNTYyLTQuNDExYy0zLjkzOS0xMi45NDgtMy40NjctMTUuNDQ1LTAuNjgtMTUuNTQ2YzEuNjUzLTAuMDYsNC4xMzEsMS40OTUsNS45ODEsNS45NTdDMTY4LjYzOSwyNC44NzIsMTY0LjQ2MSwzMi4yMTcsMTYzLjA0NywzMi40Mjl6IE0yMTIuNDYyLDM3LjA3MmM3LjI5Myw3Ljc5MSw2LjEyMiwxNC45ODYtMC42NTcsMTcuODA5Yy0xMS4xNzIsNC42MzMtMjMuNDE1LTcuNzk5LTMwLjE1Ni0yMS40NzFjLTcuMjA1LTE0Ljc4Mi0xMS45MzYtMzAuNzA5LTUuNjg5LTMwLjE5M2MyLjM1MiwwLjA5Nyw3Ljc5LDIuMjA1LDEzLjEwMyw3LjkwNWMyLjgyNCwzLjA5NiwzLjEwNyw1LjEwMiwxLjAxNiw1LjQ1OWMtMS4zMjcsMC4xODktMy45MDUtNS4zMjMtNy44MDktNC45NzFjLTQuMzQ4LDAuMjYtMC41OCw5Ljk0Niw0LjE0NiwxOGM3LjE5OCwxMi4zMzYsMTUuOTQxLDE1LjM2LDE5LjgsMTMuODljNy4xNTMtMi42OTcsMC42NjktMTAuODksMS4wMjItMTAuOTdDMjA3Ljc4NCwzMi4zNTUsMjExLjk3NCwzNi41NDEsMjEyLjQ2MiwzNy4wNzJ6IE0yMzkuNDIyLDIzLjQ4OUMyMDkuNjk0LDkuMzI5LDE5My45ODgsMy44NDUsMTkzLjI5MSwzLjQ5M2MtMC44MzYtMC41MywxLjM4MSw5LjE2NiwyMS44NTUsMzIuNDY2YzYuNDYyLDYuNzc3LDExLjU4NywxMS4xNywxMy45NTgsOS45NzZjMi4xOS0xLjA5LDQuMzY2LTIuMjE1LDYuNTI4LTMuMzcyYzAuNTkxLTAuMzE3LDAuODA3LTAuNTA5LDAuNDc5LTAuNzgyYy0wLjg1NS0wLjYyOS04LjMyOC0zLjExOC0xMi40OTItNi45NDhjLTYtNS41MDktMS4yOS04LjM2NywyLjE2Mi05Ljg0N2MxLjcxMy0wLjcyMSw0LjM2MS0wLjgsNy4wNzIsMC44NzVjNi45MTQsNC4xNzksOS41MzMsOS45NCwxMS4xMTcsMTEuMTM1YzAuODc1LDAuNjA0LDEuOTkyLTAuMjg1LDIuMzktMC41MjZjMS42NTYtMC45OTcsMy4zMDQtMi4wMTQsNC45NDItMy4wNTJDMjUyLjYxMSwzMi42MDQsMjU2LjIyLDMyLjE5MSwyMzkuNDIyLDIzLjQ4OXogTTIxOC4yMDQsMTkuNDNjLTMuMDk4LDEuMDM4LTUuMTY1LDMuMzMtNS44MzksMy41NjRjLTAuNDM3LDAuMTQ0LTEuMDY5LTAuMTAzLTEuNzE1LTAuNjY2Yy0zLjc5My0zLjYwMi05LjAxNS0xMS41NTktNy40NzUtMTEuNjM4YzEuMTA2LTAuMDY5LDExLjEyMiw0LjU2NywxNC44NzUsNi44NDJDMjE5LjcxNiwxOC42MDgsMjE5LjQ0NywxOS4wMDIsMjE4LjIwNCwxOS40M3ogTTUzLjA2MiwzMS45NjFDMzUuNDU4LDU1LjgyNSwzNC45MSw1My45OTYsMzMuNzU2LDUzLjUwNGMtMS45NzUtMC44NDMtMy45NDItMS43MTktNS44OTctMi42MjNjLTAuNTUxLTAuMjUyLTEuODA3LTAuNTk4LTAuODcyLTEuNjQ3YzAuNzg5LTAuNzM5LDEyLjUzMS0xMC4yNjQsMjUuNjI0LTI2LjAwNWMxLjA2NS0xLjI1Miw3LjM3NC04LjYwMiw2LjMwOC04Ljc5MWMtMC45MTQtMC4xNDEtNy4zNjgsNS4yOTgtOS4wMTYsNi41NGMtMTMuOTU2LDEwLjY5MS0xNy45NjYsMTYuMTEtMjAuNjQ4LDE0Ljk5OGMtMy4zNzQtMS40NDksMi45OTktNi4xNzMsMTEuNjY4LTE3LjYwM2MwLjkxLTEuMjQyLDUuNzM4LTYuNTA2LDQuNzctNi42OTFjLTEuMDQ4LTAuMjIyLTguNDM5LDUuNTI3LTkuNzA0LDYuNTE1QzIwLjE0NywzMC4yNSwxMi4xMDIsNDAuMzUyLDExLjM0Myw0MS4xMjdjLTEuMDYyLDAuODgxLTEuOTQ5LDAuMTE4LTIuNDc3LTAuMTkzYy0xLjU3My0wLjkyNi0zLjEzNy0xLjg3My00LjY5Mi0yLjg0Yy0xLjA4Ny0wLjY3LTMuNjIxLTAuNzYyLDE5Ljk2MS0xNi42OEM1NS4yMzMsMC40OTksNTUuNDY5LDEuMTUxLDU1Ljk1MiwxLjE3OWMwLjg1NywwLjAyMSwxLjcxMywwLjA0NCwyLjU3LDAuMDY3YzEuMTA0LDAuMDUsMS40MzgtMC4wMjItMS4wMTcsMy40NzNjLTQuNjIzLDYuODk0LTguMjcxLDExLjE0NC03LjY1MywxMS4yMzdDNTAuMjkzLDE2LDU0Ljc1OSwxMi4zOTgsNjQuNzUsNS4zNjJjNS4xOTUtMy43OTksNS40OTMtMy44MTIsNi42MDMtMy43NThjMC43MjgsMC4wMjEsMS40NTQsMC4wNDIsMi4xODIsMC4wNjJDNzQuMDIsMS42OSw3Ni4yMTcsMC40ODcsNTMuMDYyLDMxLjk2MXpcXFwiLz48L2c+XFxuXFxuXHQ8ZyBpZD1cXFwiZm9vdHN0ZXBzXFxcIj5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1tYXRlb1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hdGVvLWJlbHVnYVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImJlbHVnYS1pc2FtdVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImlzYW11LWNhcGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiY2FwYXMtcGVsb3Rhc1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInBlbG90YXMtbWFydGFcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXJ0YS1rb2JhcmFoXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwia29iYXJhaC1kdWJcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJkdWItcGFyYWRpc2VcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJyZXR1cm4tdG8tYmVnaW5cXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuXHQ8ZyBpZD1cXFwibWFwLWRvdHNcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZGVpYVxcXCI+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMjEwLCAxNzApXFxcIj48Y2lyY2xlIGlkPVxcXCJkdWJcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgyNDAsIDE0NilcXFwiPjxjaXJjbGUgaWQ9XFxcIm1hdGVvXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMjYwLCAyMTQpXFxcIj48Y2lyY2xlIGlkPVxcXCJtYXJ0YVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJlcy10cmVuY1xcXCI+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoNDI2LCA0NzgpXFxcIj48Y2lyY2xlIGlkPVxcXCJpc2FtdVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSg0MDAsIDQ0NilcXFwiPjxjaXJjbGUgaWQ9XFxcImJlbHVnYVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYXJlbGx1ZlxcXCI+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTIxLCAzNjQpXFxcIj48Y2lyY2xlIGlkPVxcXCJjYXBhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEyNiwgMzQwKVxcXCI+PGNpcmNsZSBpZD1cXFwicGVsb3Rhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEzNywgMzE4KVxcXCI+PGNpcmNsZSBpZD1cXFwibWFydGFcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMDYsIDMyNilcXFwiPjxjaXJjbGUgaWQ9XFxcImtvYmFyYWhcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMDYsIDMwMClcXFwiPjxjaXJjbGUgaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDgwLCAzMTUpXFxcIj48Y2lyY2xlIGlkPVxcXCJwYXJhZGlzZVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuPC9zdmc+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdDxoZWFkZXI+XFxuXHRcdDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0PC9hPlxcblx0PC9oZWFkZXI+XFxuXHRcXG5cdDxkaXYgY2xhc3M9XFxcIm1haW4tY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiZmVlZFxcXCI+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b20tcGFydFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxmb290ZXI+XFxuXHRcdFxcblx0XHQ8dWw+XFxuXHRcdFx0PGxpIGlkPSdob21lJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5ob21lIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J2dyaWQnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmdyaWQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHRcdDxsaSBpZD0nY29tJyBjbGFzcz0nY29tJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzUgMTdcXFwiPlxcblx0XHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiNGRkZGRkZcXFwiIGQ9XFxcIk0xNy40MTUsMTEuMjAzYzYuMjc1LDAsMTIuMDA5LDIuMDkzLDE2LjM5NCw1LjU0N1YwLjIzMkgxdjE2LjUzNUM1LjM4NywxMy4zMDMsMTEuMTI5LDExLjIwMywxNy40MTUsMTEuMjAzXFxcIi8+XFxuXHRcdFx0XHRcdDwvc3ZnPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J2xhYic+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J3Nob3AnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHQ8L3VsPlxcblxcblx0PC9mb290ZXI+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGlkPVxcXCJmcm9udC1ibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBpZD0ncGFnZXMtY29udGFpbmVyJz5cXG5cdDxkaXYgaWQ9J3BhZ2UtYSc+PC9kaXY+XFxuXHQ8ZGl2IGlkPSdwYWdlLWInPjwvZGl2PlxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwibWFwLXdyYXBwZXJcXFwiPlxcblx0XFxuPC9kaXY+XHRcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG4gICAgXHRcbmNsYXNzIEdsb2JhbEV2ZW50cyB7XG5cdGluaXQoKSB7XG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRBcHBBY3Rpb25zLndpbmRvd1Jlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdsb2JhbEV2ZW50c1xuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5jbGFzcyBQcmVsb2FkZXIgIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpXG5cdFx0dGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIHRoaXMub25NYW5pZmVzdExvYWRDb21wbGV0ZWQsIHRoaXMpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSB1bmRlZmluZWRcblx0XHR0aGlzLmFsbE1hbmlmZXN0cyA9IFtdXG5cdH1cblx0bG9hZChtYW5pZmVzdCwgb25Mb2FkZWQpIHtcblxuXHRcdGlmKHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG0gPSB0aGlzLmFsbE1hbmlmZXN0c1tpXVxuXHRcdFx0XHRpZihtLmxlbmd0aCA9PSBtYW5pZmVzdC5sZW5ndGggJiYgbVswXS5pZCA9PSBtYW5pZmVzdFswXS5pZCAmJiBtW20ubGVuZ3RoLTFdLmlkID09IG1hbmlmZXN0W21hbmlmZXN0Lmxlbmd0aC0xXS5pZCkge1xuXHRcdFx0XHRcdG9uTG9hZGVkKClcdFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzLnB1c2gobWFuaWZlc3QpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSBvbkxvYWRlZFxuICAgICAgICB0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChtYW5pZmVzdClcblx0fVxuXHRvbk1hbmlmZXN0TG9hZENvbXBsZXRlZCgpIHtcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjaygpXG5cdH1cblx0Z2V0Q29udGVudEJ5SWQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZS5nZXRSZXN1bHQoaWQpXG5cdH1cblx0Z2V0SW1hZ2VVUkwoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDb250ZW50QnlJZChpZCkuZ2V0QXR0cmlidXRlKFwic3JjXCIpXG5cdH1cblx0Z2V0SW1hZ2VTaXplKGlkKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnRCeUlkKGlkKVxuXHRcdHJldHVybiB7IHdpZHRoOiBjb250ZW50LndpZHRoLCBoZWlnaHQ6IGNvbnRlbnQuaGVpZ2h0IH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkZXJcbiIsImltcG9ydCBoYXNoZXIgZnJvbSAnaGFzaGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBjcm9zc3JvYWRzIGZyb20gJ2Nyb3Nzcm9hZHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmNsYXNzIFJvdXRlciB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5yb3V0aW5nID0gZGF0YS5yb3V0aW5nXG5cdFx0dGhpcy5zZXR1cFJvdXRlcygpXG5cdFx0dGhpcy5maXJzdFBhc3MgPSB0cnVlXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIub2xkSGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5pbml0aWFsaXplZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHRoYXNoZXIuY2hhbmdlZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLnNldHVwQ3Jvc3Nyb2FkcygpXG5cdH1cblx0YmVnaW5Sb3V0aW5nKCkge1xuXHRcdGhhc2hlci5pbml0KClcblx0fVxuXHRzZXR1cENyb3Nzcm9hZHMoKSB7XG5cdCBcdHZhciByb3V0ZXMgPSBoYXNoZXIucm91dGVzXG5cdCBcdGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdCBcdFx0dmFyIHJvdXRlID0gcm91dGVzW2ldXG5cdCBcdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZShyb3V0ZSwgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdCBcdH07XG5cdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZSgnJywgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0b25QYXJzZVVybCgpIHtcblx0XHR0aGlzLmFzc2lnblJvdXRlKClcblx0fVxuXHRvbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuc2VuZFRvRGVmYXVsdCgpXG5cdH1cblx0YXNzaWduUm91dGUoaWQpIHtcblx0XHR2YXIgaGFzaCA9IGhhc2hlci5nZXRIYXNoKClcblx0XHR2YXIgcGFydHMgPSB0aGlzLmdldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy51cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcnRzWzBdLCAocGFydHNbMV0gPT0gdW5kZWZpbmVkKSA/ICcnIDogcGFydHNbMV0pXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IHRydWVcblx0fVxuXHRnZXRVUkxQYXJ0cyh1cmwpIHtcblx0XHR2YXIgaGFzaCA9IHVybFxuXHRcdHJldHVybiBoYXNoLnNwbGl0KCcvJylcblx0fVxuXHR1cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdC8vIElmIGZpcnN0IHBhc3Mgc2VuZCB0aGUgYWN0aW9uIGZyb20gQXBwLmpzIHdoZW4gYWxsIGFzc2V0cyBhcmUgcmVhZHlcblx0XHRpZih0aGlzLmZpcnN0UGFzcykge1xuXHRcdFx0dGhpcy5maXJzdFBhc3MgPSBmYWxzZVxuXHRcdH1lbHNle1xuXHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdFx0fVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZShuZXdIYXNoLCBvbGRIYXNoKSB7XG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0Y3Jvc3Nyb2Fkcy5wYXJzZShuZXdIYXNoKVxuXHRcdGlmKHRoaXMubmV3SGFzaEZvdW5kZWQpIHJldHVyblxuXHRcdC8vIElmIFVSTCBkb24ndCBtYXRjaCBhIHBhdHRlcm4sIHNlbmQgdG8gZGVmYXVsdFxuXHRcdHRoaXMub25EZWZhdWx0VVJMSGFuZGxlcigpXG5cdH1cblx0c2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzZXR1cFJvdXRlcygpIHtcblx0XHRoYXNoZXIucm91dGVzID0gW11cblx0XHRoYXNoZXIuZGlwdHlxdWVSb3V0ZXMgPSBbXVxuXHRcdHZhciBpID0gMCwgaztcblx0XHRmb3IoayBpbiB0aGlzLnJvdXRpbmcpIHtcblx0XHRcdGhhc2hlci5yb3V0ZXNbaV0gPSBrXG5cdFx0XHRpZihrLmxlbmd0aCA+IDIpIGhhc2hlci5kaXB0eXF1ZVJvdXRlcy5wdXNoKGspXG5cdFx0XHRpKytcblx0XHR9XG5cdH1cblx0c3RhdGljIGdldEJhc2VVUkwoKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LlVSTC5zcGxpdChcIiNcIilbMF1cblx0fVxuXHRzdGF0aWMgZ2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmdldEhhc2goKVxuXHR9XG5cdHN0YXRpYyBnZXRSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5yb3V0ZXNcblx0fVxuXHRzdGF0aWMgZ2V0RGlwdHlxdWVSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5kaXB0eXF1ZVJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXROZXdIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIubmV3SGFzaFxuXHR9XG5cdHN0YXRpYyBnZXRPbGRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIub2xkSGFzaFxuXHR9XG5cdHN0YXRpYyBzZXRIYXNoKGhhc2gpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChoYXNoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlclxuIiwiaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIyfSBmcm9tICdldmVudGVtaXR0ZXIyJ1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuXG5mdW5jdGlvbiBfZ2V0Q29udGVudFNjb3BlKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHJldHVybiBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQoaGFzaE9iai5oYXNoKVxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNUb0xvYWQoKSB7XG4gICAgdmFyIHNjb3BlID0gX2dldENvbnRlbnRTY29wZSgpXG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIHR5cGUgPSBfZ2V0VHlwZU9mUGFnZSgpXG4gICAgdmFyIG1hbmlmZXN0O1xuXG4gICAgaWYodHlwZSAhPSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICB2YXIgZmlsZW5hbWVzID0gW1xuICAgICAgICAgICAgJ2NoYXJhY3Rlci5wbmcnLFxuICAgICAgICAgICAgJ2NoYXJhY3Rlci1iZy5qcGcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSB7XG4gICAgLy8gcmV0dXJuICdAJyArIF9nZXREZXZpY2VSYXRpbygpICsgJ3gnXG4gICAgcmV0dXJuICcnXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXREaXB0eXF1ZVNob2VzKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBiYXNldXJsID0gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0KVxuICAgIHJldHVybiBfZ2V0Q29udGVudFNjb3BlKCkuc2hvZXNcbn1cblxudmFyIEFwcFN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIGl0ZW0pIHtcbiAgICAgICAgdGhpcy5lbWl0KHR5cGUsIGl0ZW0pXG4gICAgfSxcbiAgICBwYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUNvbnRlbnQoKVxuICAgIH0sXG4gICAgYXBwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0QXBwRGF0YSgpXG4gICAgfSxcbiAgICBkZWZhdWx0Um91dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERlZmF1bHRSb3V0ZSgpXG4gICAgfSxcbiAgICBnbG9iYWxDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRHbG9iYWxDb250ZW50KClcbiAgICB9LFxuICAgIHBhZ2VBc3NldHNUb0xvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNUb0xvYWQoKVxuICAgIH0sXG4gICAgZ2V0Um91dGVQYXRoU2NvcGVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZCA9IGlkLmxlbmd0aCA8IDEgPyAnLycgOiBpZFxuICAgICAgICByZXR1cm4gZGF0YS5yb3V0aW5nW2lkXVxuICAgIH0sXG4gICAgYmFzZU1lZGlhUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5nZXRFbnZpcm9ubWVudCgpLnN0YXRpY1xuICAgIH0sXG4gICAgZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZDogZnVuY3Rpb24ocGFyZW50LCB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhcmVudCwgdGFyZ2V0KVxuICAgIH0sXG4gICAgZ2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwQ29uc3RhbnRzLkVOVklST05NRU5UU1tFTlZdXG4gICAgfSxcbiAgICBnZXRUeXBlT2ZQYWdlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0VHlwZU9mUGFnZShoYXNoKVxuICAgIH0sXG4gICAgZ2V0SG9tZVZpZGVvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydob21lLXZpZGVvcyddXG4gICAgfSxcbiAgICBnZW5lcmFsSW5mb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5jb250ZW50XG4gICAgfSxcbiAgICBkaXB0eXF1ZVNob2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREaXB0eXF1ZVNob2VzKClcbiAgICB9LFxuICAgIGdldE5leHREaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpKzEpID4gcm91dGVzLmxlbmd0aC0xID8gMCA6IChpKzEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpb3VzRGlwdHlxdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAoaS0xKSA8IDAgPyByb3V0ZXMubGVuZ3RoLTEgOiAoaS0xKVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaW5kZXhdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXREaXB0eXF1ZVBhZ2VJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQcmV2aWV3VXJsQnlIYXNoOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZGlwdHlxdWUvJyArIGhhc2ggKyAnL3ByZXZpZXcuZ2lmJ1xuICAgIH0sXG4gICAgZ2V0RmVlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmZlZWRcbiAgICB9LFxuICAgIGxhbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGVmYXVsdExhbmcgPSB0cnVlXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sYW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGxhbmcgPSBkYXRhLmxhbmdzW2ldXG4gICAgICAgICAgICBpZihsYW5nID09IEpTX2xhbmcpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0TGFuZyA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiAoZGVmYXVsdExhbmcgPT0gdHJ1ZSkgPyAnZW4nIDogSlNfbGFuZ1xuICAgIH0sXG4gICAgV2luZG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF93aW5kb3dXaWR0aEhlaWdodCgpXG4gICAgfSxcbiAgICBhZGRQWENoaWxkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIEFwcFN0b3JlLlBYQ29udGFpbmVyLmFkZChpdGVtLmNoaWxkKVxuICAgIH0sXG4gICAgcmVtb3ZlUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5yZW1vdmUoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIFBhcmVudDogdW5kZWZpbmVkLFxuICAgIENhbnZhczogdW5kZWZpbmVkLFxuICAgIEZyb250QmxvY2s6IHVuZGVmaW5lZCxcbiAgICBPcmllbnRhdGlvbjogQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSxcbiAgICBEZXRlY3Rvcjoge1xuICAgICAgICBpc01vYmlsZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvblxuICAgICAgICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkU6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LncgPSBhY3Rpb24uaXRlbS53aW5kb3dXXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LmggPSBhY3Rpb24uaXRlbS53aW5kb3dIXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuT3JpZW50YXRpb24gPSAoQXBwU3RvcmUuV2luZG93LncgPiBBcHBTdG9yZS5XaW5kb3cuaCkgPyBBcHBDb25zdGFudHMuTEFORFNDQVBFIDogQXBwQ29uc3RhbnRzLlBPUlRSQUlUXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlLCBhY3Rpb24uaXRlbSkgXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5cbmV4cG9ydCBkZWZhdWx0IEFwcFN0b3JlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG52YXIgUHhIZWxwZXIgPSB7XG5cbiAgICBnZXRQWFZpZGVvOiBmdW5jdGlvbih1cmwsIHdpZHRoLCBoZWlnaHQsIHZhcnMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbVZpZGVvKHVybClcbiAgICAgICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2Uuc2V0QXR0cmlidXRlKFwibG9vcFwiLCB0cnVlKVxuICAgICAgICB2YXIgdmlkZW9TcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSlcbiAgICAgICAgdmlkZW9TcHJpdGUud2lkdGggPSB3aWR0aFxuICAgICAgICB2aWRlb1Nwcml0ZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgcmV0dXJuIHZpZGVvU3ByaXRlXG4gICAgfSxcblxuICAgIHJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRGcmFtZUltYWdlc0FycmF5OiBmdW5jdGlvbihmcmFtZXMsIGJhc2V1cmwsIGV4dCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVybCA9IGJhc2V1cmwgKyBpICsgJy4nICsgZXh0XG4gICAgICAgICAgICBhcnJheVtpXSA9IHVybFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHhIZWxwZXIiLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIFV0aWxzIHtcblx0c3RhdGljIE5vcm1hbGl6ZU1vdXNlQ29vcmRzKGUsIG9ialdyYXBwZXIpIHtcblx0XHR2YXIgcG9zeCA9IDA7XG5cdFx0dmFyIHBvc3kgPSAwO1xuXHRcdGlmICghZSkgdmFyIGUgPSB3aW5kb3cuZXZlbnQ7XG5cdFx0aWYgKGUucGFnZVggfHwgZS5wYWdlWSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5wYWdlWDtcblx0XHRcdHBvc3kgPSBlLnBhZ2VZO1xuXHRcdH1cblx0XHRlbHNlIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRZKSBcdHtcblx0XHRcdHBvc3ggPSBlLmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcblx0XHRcdHBvc3kgPSBlLmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuXHRcdFx0XHQrIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cdFx0fVxuXHRcdG9ialdyYXBwZXIueCA9IHBvc3hcblx0XHRvYmpXcmFwcGVyLnkgPSBwb3N5XG5cdFx0cmV0dXJuIG9ialdyYXBwZXJcblx0fVxuXHRzdGF0aWMgUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBjb250ZW50VywgY29udGVudEgsIG9yaWVudGF0aW9uKSB7XG5cdFx0dmFyIGFzcGVjdFJhdGlvID0gY29udGVudFcgLyBjb250ZW50SFxuXHRcdGlmKG9yaWVudGF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmKG9yaWVudGF0aW9uID09IEFwcENvbnN0YW50cy5MQU5EU0NBUEUpIHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxXG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgc2NhbGUgPSAoKHdpbmRvd1cgLyB3aW5kb3dIKSA8IGFzcGVjdFJhdGlvKSA/ICh3aW5kb3dIIC8gY29udGVudEgpICogMSA6ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdH1cblx0XHR2YXIgbmV3VyA9IGNvbnRlbnRXICogc2NhbGVcblx0XHR2YXIgbmV3SCA9IGNvbnRlbnRIICogc2NhbGVcblx0XHR2YXIgY3NzID0ge1xuXHRcdFx0d2lkdGg6IG5ld1csXG5cdFx0XHRoZWlnaHQ6IG5ld0gsXG5cdFx0XHRsZWZ0OiAod2luZG93VyA+PiAxKSAtIChuZXdXID4+IDEpLFxuXHRcdFx0dG9wOiAod2luZG93SCA+PiAxKSAtIChuZXdIID4+IDEpLFxuXHRcdFx0c2NhbGU6IHNjYWxlXG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBjc3Ncblx0fVxuXHRzdGF0aWMgQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cmluZykge1xuXHQgICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcblx0fVxuXHRzdGF0aWMgU3VwcG9ydFdlYkdMKCkge1xuXHRcdHRyeSB7XG5cdFx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0XHRcdHJldHVybiAhISAoIHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKCBjYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJyApICkgKTtcblx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0c3RhdGljIERlc3Ryb3lWaWRlbyh2aWRlbykge1xuICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICB2aWRlby5zcmMgPSAnJztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdmlkZW8uY2hpbGROb2Rlc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIFx0dmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgXHRjaGlsZC5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICAgICAgXHQvLyBXb3JraW5nIHdpdGggYSBwb2x5ZmlsbCBvciB1c2UganF1ZXJ5XG4gICAgICAgIFx0ZG9tLnRyZWUucmVtb3ZlKGNoaWxkKVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBEZXN0cm95VmlkZW9UZXh0dXJlKHRleHR1cmUpIHtcbiAgICBcdHZhciB2aWRlbyA9IHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlXG4gICAgICAgIFV0aWxzLkRlc3Ryb3lWaWRlbyh2aWRlbylcbiAgICB9XG4gICAgc3RhdGljIFJhbmQobWluLCBtYXgsIGRlY2ltYWxzKSB7XG4gICAgICAgIHZhciByYW5kb21OdW0gPSBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW5cbiAgICAgICAgaWYoZGVjaW1hbHMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFx0cmV0dXJuIHJhbmRvbU51bVxuICAgICAgICB9ZWxzZXtcblx0ICAgICAgICB2YXIgZCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcblx0ICAgICAgICByZXR1cm4gfn4oKGQgKiByYW5kb21OdW0pICsgMC41KSAvIGRcbiAgICAgICAgfVxuXHR9XG5cdHN0YXRpYyBHZXRJbWdVcmxJZCh1cmwpIHtcblx0XHR2YXIgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKVxuXHRcdHJldHVybiBzcGxpdFtzcGxpdC5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR9XG5cdHN0YXRpYyBTdHlsZShkaXYsIHN0eWxlKSB7XG4gICAgXHRkaXYuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubW96VHJhbnNmb3JtICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubXNUcmFuc2Zvcm0gICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUub1RyYW5zZm9ybSAgICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUudHJhbnNmb3JtICAgICAgID0gc3R5bGVcbiAgICB9XG4gICAgc3RhdGljIFRyYW5zbGF0ZShkaXYsIHgsIHksIHopIHtcbiAgICBcdGlmICgnd2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdtb3pUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ29UcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSkge1xuICAgIFx0XHRVdGlscy5TdHlsZShkaXYsICd0cmFuc2xhdGUzZCgnK3grJ3B4LCcreSsncHgsJyt6KydweCknKVxuXHRcdH1lbHNle1xuXHRcdFx0ZGl2LnN0eWxlLnRvcCA9IHkgKyAncHgnXG5cdFx0XHRkaXYuc3R5bGUubGVmdCA9IHggKyAncHgnXG5cdFx0fVxuICAgIH1cbiAgICBzdGF0aWMgU3ByaW5nVG8oaXRlbSwgdG9Qb3NpdGlvbiwgaW5kZXgpIHtcbiAgICBcdHZhciBkeCA9IHRvUG9zaXRpb24ueCAtIGl0ZW0ucG9zaXRpb24ueFxuICAgIFx0dmFyIGR5ID0gdG9Qb3NpdGlvbi55IC0gaXRlbS5wb3NpdGlvbi55XG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXG5cdFx0dmFyIHRhcmdldFggPSB0b1Bvc2l0aW9uLnggLSBNYXRoLmNvcyhhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0dmFyIHRhcmdldFkgPSB0b1Bvc2l0aW9uLnkgLSBNYXRoLnNpbihhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0aXRlbS52ZWxvY2l0eS54ICs9ICh0YXJnZXRYIC0gaXRlbS5wb3NpdGlvbi54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHkueSArPSAodGFyZ2V0WSAtIGl0ZW0ucG9zaXRpb24ueSkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnggKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cblx0XHRpdGVtLnZlbG9jaXR5LnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvU2NhbGUoaXRlbSwgdG9TY2FsZSwgaW5kZXgpIHtcbiAgICBcdHZhciBkeCA9IHRvU2NhbGUueCAtIGl0ZW0uc2NhbGUueFxuICAgIFx0dmFyIGR5ID0gdG9TY2FsZS55IC0gaXRlbS5zY2FsZS55XG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXG5cdFx0dmFyIHRhcmdldFggPSB0b1NjYWxlLnggLSBNYXRoLmNvcyhhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0dmFyIHRhcmdldFkgPSB0b1NjYWxlLnkgLSBNYXRoLnNpbihhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnggKz0gKHRhcmdldFggLSBpdGVtLnNjYWxlLngpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKz0gKHRhcmdldFkgLSBpdGVtLnNjYWxlLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnggKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cblx0XHRpdGVtLnZlbG9jaXR5U2NhbGUueSAqPSBpdGVtLmNvbmZpZy5mcmljdGlvblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbHNcbiIsIi8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG4gXG4vLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYnkgRXJpayBNw7ZsbGVyLiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG4gXG4vLyBNSVQgbGljZW5zZVxuIFxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgdmFyIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddO1xuICAgIGZvcih2YXIgeCA9IDA7IHggPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuIFxuICAgIGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgICAgICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIFxuICAgICAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuIFxuICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfTtcbn0oKSk7IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCB7RXZlbnRFbWl0dGVyMn0gZnJvbSAnZXZlbnRlbWl0dGVyMidcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxuLy8gQWN0aW9uc1xudmFyIFBhZ2VyQWN0aW9ucyA9IHtcbiAgICBvblBhZ2VSZWFkeTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFksXG4gICAgICAgIFx0aXRlbTogaGFzaFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25PdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICAgICAgdHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25PdXRDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgXHRQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEUsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9uVHJhbnNpdGlvbkluQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICAgICAgdHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCxcbiAgICAgICAgXHRpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH1cbn1cblxuLy8gQ29uc3RhbnRzXG52YXIgUGFnZXJDb25zdGFudHMgPSB7XG5cdFBBR0VfSVNfUkVBRFk6ICdQQUdFX0lTX1JFQURZJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOOiAnUEFHRV9UUkFOU0lUSU9OX0lOJyxcblx0UEFHRV9UUkFOU0lUSU9OX09VVDogJ1BBR0VfVFJBTlNJVElPTl9PVVQnLFxuICAgIFBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6ICdQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTOiAnUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTJyxcblx0UEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0g6ICdQQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCdcbn1cblxuLy8gRGlzcGF0Y2hlclxudmFyIFBhZ2VyRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlUGFnZXJBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goYWN0aW9uKVxuXHR9XG59KVxuXG4vLyBTdG9yZVxudmFyIFBhZ2VyU3RvcmUgPSBhc3NpZ24oe30sIEV2ZW50RW1pdHRlcjIucHJvdG90eXBlLCB7XG4gICAgZmlyc3RQYWdlVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBwYWdlVHJhbnNpdGlvblN0YXRlOiB1bmRlZmluZWQsIFxuICAgIGRpc3BhdGNoZXJJbmRleDogUGFnZXJEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uVHlwZSA9IHBheWxvYWQudHlwZVxuICAgICAgICB2YXIgaXRlbSA9IHBheWxvYWQuaXRlbVxuICAgICAgICBzd2l0Y2goYWN0aW9uVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZOlxuICAgICAgICAgICAgXHRQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1NcbiAgICAgICAgICAgIFx0dmFyIHR5cGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5cbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6XG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOlxuICAgICAgICAgICAgXHRpZiAoUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uKSBQYWdlclN0b3JlLmZpcnN0UGFnZVRyYW5zaXRpb24gPSBmYWxzZVxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIXG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KGFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KGFjdGlvblR5cGUsIGl0ZW0pXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5leHBvcnQgZGVmYXVsdCB7XG5cdFBhZ2VyU3RvcmU6IFBhZ2VyU3RvcmUsXG5cdFBhZ2VyQWN0aW9uczogUGFnZXJBY3Rpb25zLFxuXHRQYWdlckNvbnN0YW50czogUGFnZXJDb25zdGFudHMsXG5cdFBhZ2VyRGlzcGF0Y2hlcjogUGFnZXJEaXNwYXRjaGVyXG59XG4iLCJpbXBvcnQgc2x1ZyBmcm9tICd0by1zbHVnLWNhc2UnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gZmFsc2Vcblx0XHR0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gdGhpcy5jb21wb25lbnREaWRNb3VudC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVuZGVyKGNoaWxkSWQsIHBhcmVudElkLCB0ZW1wbGF0ZSwgb2JqZWN0KSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsTW91bnQoKVxuXHRcdHRoaXMuY2hpbGRJZCA9IGNoaWxkSWRcblx0XHR0aGlzLnBhcmVudElkID0gcGFyZW50SWRcblx0XHRcblx0XHRpZihkb20uaXNEb20ocGFyZW50SWQpKSB7XG5cdFx0XHR0aGlzLnBhcmVudCA9IHBhcmVudElkXG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgaWQgPSB0aGlzLnBhcmVudElkLmluZGV4T2YoJyMnKSA+IC0xID8gdGhpcy5wYXJlbnRJZC5zcGxpdCgnIycpWzFdIDogdGhpcy5wYXJlbnRJZFxuXHRcdFx0dGhpcy5wYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHR9XG5cblx0XHRpZih0ZW1wbGF0ZSA9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0fWVsc2Uge1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHRcdHZhciB0ID0gdGVtcGxhdGUob2JqZWN0KVxuXHRcdFx0dGhpcy5lbGVtZW50LmlubmVySFRNTCA9IHRcblx0XHR9XG5cdFx0aWYodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKSA9PSB1bmRlZmluZWQpIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgc2x1ZyhjaGlsZElkKSlcblx0XHRkb20udHJlZS5hZGQodGhpcy5wYXJlbnQsIHRoaXMuZWxlbWVudClcblxuXHRcdHNldFRpbWVvdXQodGhpcy5jb21wb25lbnREaWRNb3VudCwgMClcblx0fVxuXHRyZW1vdmUoKSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdFx0dGhpcy5lbGVtZW50LnJlbW92ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDb21wb25lbnRcblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZVBhZ2UgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5wcm9wcyA9IHByb3BzXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlID0gdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMudGxJbiA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGhpcy50bE91dCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5yZXNpemUoKVxuXHRcdHRoaXMuc2V0dXBBbmltYXRpb25zKClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuaXNSZWFkeSh0aGlzLnByb3BzLmhhc2gpLCAwKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblxuXHRcdC8vIHJlc2V0XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0dGhpcy50bEluLnRpbWVTY2FsZSgxLjQpXG5cdFx0c2V0VGltZW91dCgoKT0+dGhpcy50bEluLnBsYXkoMCksIDgwMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLnRsT3V0LmdldENoaWxkcmVuKCkubGVuZ3RoIDwgMSkge1xuXHRcdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSlcblx0XHRcdHRoaXMudGxPdXQudGltZVNjYWxlKDEuMilcblx0XHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxPdXQucGxheSgwKSwgNTAwKVxuXHRcdH1cblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRsSW4uZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSwgMClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSwgMClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Zm9yY2VVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHR0aGlzLnRsT3V0LmNsZWFyKClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50cywgUGFnZXJEaXNwYXRjaGVyfSBmcm9tICdQYWdlcidcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdQYWdlc0NvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEJhc2VQYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICdwYWdlLWInXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25JbiA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4uYmluZCh0aGlzKVxuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCA9IHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2guYmluZCh0aGlzKVxuXHRcdHRoaXMuY29tcG9uZW50cyA9IHtcblx0XHRcdCduZXctY29tcG9uZW50JzogdW5kZWZpbmVkLFxuXHRcdFx0J29sZC1jb21wb25lbnQnOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQmFzZVBhZ2VyJywgcGFyZW50LCB0ZW1wbGF0ZSwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsIHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2gpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnN3aXRjaFBhZ2VzRGl2SW5kZXgoKVxuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0QXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdEFwcFN0b3JlLkZyb250QmxvY2suc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0XHRQYWdlckFjdGlvbnMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0QXBwQWN0aW9ucy5sb2FkUGFnZUFzc2V0cygpXG5cdH1cblx0cGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKSB7XG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCdvbGQtY29tcG9uZW50Jylcblx0fVxuXHRzd2l0Y2hQYWdlc0RpdkluZGV4KCkge1xuXHRcdHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHZhciBvbGRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXVxuXHRcdGlmKG5ld0NvbXBvbmVudCAhPSB1bmRlZmluZWQpIG5ld0NvbXBvbmVudC5wYXJlbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDJcblx0XHRpZihvbGRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBvbGRDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdH1cblx0c2V0dXBOZXdDb21wb25lbnQoaGFzaCwgVHlwZSwgdGVtcGxhdGUpIHtcblx0XHR2YXIgaWQgPSBVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoaGFzaC5wYXJlbnQucmVwbGFjZShcIi9cIiwgXCJcIikpXG5cdFx0dGhpcy5vbGRQYWdlRGl2UmVmID0gdGhpcy5jdXJyZW50UGFnZURpdlJlZlxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAodGhpcy5jdXJyZW50UGFnZURpdlJlZiA9PT0gJ3BhZ2UtYScpID8gJ3BhZ2UtYicgOiAncGFnZS1hJ1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYpXG5cblx0XHR2YXIgcHJvcHMgPSB7XG5cdFx0XHRpZDogdGhpcy5jdXJyZW50UGFnZURpdlJlZixcblx0XHRcdGlzUmVhZHk6IHRoaXMub25QYWdlUmVhZHksXG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUsXG5cdFx0XHRkYXRhOiBBcHBTdG9yZS5wYWdlQ29udGVudCgpXG5cdFx0fVxuXHRcdHZhciBwYWdlID0gbmV3IFR5cGUocHJvcHMpXG5cdFx0cGFnZS5yZW5kZXIoaWQsIGVsLCB0ZW1wbGF0ZSwgcHJvcHMuZGF0YSlcblx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXSA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdFx0dGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gPSBwYWdlXG5cblx0XHRpZihQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPT09IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUykge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10uZm9yY2VVbm1vdW50KClcblx0XHR9XG5cdH1cblx0b25QYWdlUmVhZHkoaGFzaCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblBhZ2VSZWFkeShoYXNoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR1bm1vdW50Q29tcG9uZW50KHJlZikge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1tyZWZdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1tyZWZdLnJlbW92ZSgpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQYWdlclxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiY29udGVudFwiOiB7XG5cdFx0XCJ0d2l0dGVyX3VybFwiOiBcImh0dHBzOi8vdHdpdHRlci5jb20vY2FtcGVyXCIsXG5cdFx0XCJmYWNlYm9va191cmxcIjogXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vQ2FtcGVyXCIsXG5cdFx0XCJpbnN0YWdyYW1fdXJsXCI6IFwiaHR0cHM6Ly9pbnN0YWdyYW0uY29tL2NhbXBlci9cIixcblx0XHRcImxhYl91cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vbGFiXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJIT01FXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIkdSSURcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJNZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiV29tZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImZyXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiSE9NRVwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJHUklEXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQWNoZXRlclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tbWVcIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiZmVtbWVcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImVzXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiSE9NRVwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJHUklEXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJhclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tYnJlXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIm11amVyXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIkhPTUVcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiR1JJRFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkFjcXVpc2l0aVwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwidW9tb1wiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJkb25uYVwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIlxuXHRcdFx0fSxcblx0XHRcdFwiZGVcIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJIT01FXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIkdSSURcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIZXJyZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiRGFtZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcInB0XCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiSE9NRVwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJHUklEXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJlXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIb21lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJNdWxoZXJcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0XCJsYW5nc1wiOiBbXCJlblwiLCBcImZyXCIsIFwiZXNcIiwgXCJpdFwiLCBcImRlXCIsIFwicHRcIl0sXG5cblx0XCJob21lLXZpZGVvc1wiOiBbXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzgwY2RjNGM1MDM2NDk1ZTQyODAzYjBmZmFiMzAwNDM0MzE1ZWUzODMvZGVpYS1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzdhMTVmN2MwNGViNTRkYWJiODUxMzg2MGNlMmQxYjM0NmQ1ODc5MTAvZGVpYS1tYXRlby5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODM1MDNhZjVmMDE3ZGMzNjYwMWFiMTQyNzc3ZmRlNDFjMmZkOTlhMi9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hNDFhNTlkMGFhMzEzOTcwMzA0N2ZkMWQ3M2U3MTA1ZmI0Nzc2NDQzL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9kMzE2YTEzYTc4M2RmZDk5ZWFlZjlmZWUxMjFmNWE1NzlmYzYyYWI0L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNTFmZDlmZDIwY2U3YmNlMDMzNjA0NWVkM2Y3OWQ2OGNjNDU4ZDU1NS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9jNmJlNjljNjQ2YzEzMWYwYmU2NzA2MmNkNjAwY2IxOWFhNWQyYWIxL2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMzg2ZjViMTA5OTJlNzgwNWUxYmNmN2JkMzg5YTdlZjU1ZWFkYjkwNC9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zOGUzMjY2MTA4OTVjNTExMzYzMDExMDU4ZGMzMDgwNTk0YTgxNDNiL2FyZWxsdWYta29iYXJhaC5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDA5Y2FmNjkzY2U4ZDAyZjZiNjdiN2UwM2I4ZmE3YTUzMjdmNmYzNC9hcmVsbHVmLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTViMzc0ZmEyNzY0NGQ5YzFjZGMwYWVkMjQ1ZDRhYzllMDQ4MGQ4MC9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiXG5cdF0sXG5cblx0XCJmZWVkXCI6IFtcblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXRlb1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkVzdHJlbm8gQ2FtcGVycyBwYXJhIG51ZXN0cm8gd2Vla2VuZCBlbiBEZWlhIEBNYXJ0YVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQcm9maWxlIHBpYz8gbWF5YmU/IG1heWJlIGJhYnk/XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWF0ZW9cIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQb3JxdWUgZXNhIGNhcmEgZGUgZW1vPz8gQE1hdGVvIGxvbGxsXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlRoaXMgc2hvZXMgYXJlIHRoZSBzaG9lcyBNaXJvIHdvdWxkIHdlYXIgaWYgaGUgd2FzIHN0aWxsIGFsaXZlIGFuZCBraWNraW7CtFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiUG9ycXVlIG5vIHZpZW5lcyBhIERlaWEgY29uIEBNYXJ0YSB5IGNvbm1pZ28gZWwgcHJveGltbyB3ZWVrZW5kPz9cIlxuXHRcdFx0XHR9LHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk5vIHB1ZWRvb29vb+KApiB0ZW5nbyBjbGFzZXMgZGUgcGludHVyYSB5IG1pIG1hZHJlIHZpZW5lIGEgdmlzaXRhciAjaGVhdnltZXRhbFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiI2FydHNlbGZpZVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRGVlcCBibHVlICNjYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiVGhhbmtzIGZvciB0aGUgZmxvd2VycyBATWF0ZW8gc29vbyBjdXV1dGUuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJMYXMgZmxvcmVzIHF1ZSBAbWF0ZW8gbWUgcmVnYWxvLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJFcyBUcmVuYyBpcyB0aGUgcGxhY2UgdG8gYmUuIFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQWxsIHRoaXMgc21va2UgaXMgbm90IHdoYXQgeW91IHRoaW5rIGl0IGlzLiBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJpc2FtdVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJFeHRyYW9yZGluYXJ5IGJlYXV0eS4gSSBsb3ZlIHRoZSBuZXcgI2NhbXBlciBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNvIGNhbG0gYXQgRXMgVHJlbmMuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImlzYW11XCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkhpaWlpaSEhISA6KVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJOZXcgY2FtcGVyLiBOZXcgY29sb3JzLiBTYW1lIGVuZXJneS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTGFzdCBuaWdodCB3YXMgaW4tc2FuZS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImNhcGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNvIG11Y2ggZnVuLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBlbG90YXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiT25jZSB5b3UgZ28gYmxhY2suLi5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlJpZGVycyBvZiBNYWxsb3JjYSAjY2FtcGVyLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBlbG90YXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJObyBzZWxmaWUgbm8gbm90aGluZy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiVGhlc2UgbmV3IENhbXBlcidzIGFyZSB0aGUgYm9tYi4gXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkknbSBub3QgZ29pbmcgaW4gdGhlIHBvb2wgbGlrZSB0aGlzLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQWZ0ZXIgcGFydHkuIEFmdGVyIGxpZmUuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJJIGRhcmUgeW91LlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiV2lzaCB5b3Ugd2hlcmUgaGVyZSAjYXJlbGx1Zi5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQ2FsbCBtZSBQYW5kZW1vbmlhLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk15IG5ldyBDYW1wZXIncyBhcmUgdGhlIFNVViBvZiBzaG9lcy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJGcmVlIGRpdmluZyBleGN1cnRpb25zIHRoaXMgYWZ0ZXJub29uIGF0ICNhcmVsbHVmLiBQTSBtZSBpZiBpbnRlcmVzdGVkLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlBlYWNlIHknYWxsLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJCb2xkIGFuZCBiZWF1dGlmdWwuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkRldG94IGJ5IHRoZSBwb29sLiBNdWNoIG5lZWRlZC5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkkgYW0gbm90IGEgYmltYm8uXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH1cblx0XSxcblxuXHRcImRlZmF1bHQtcm91dGVcIjogXCJcIixcblxuXHRcInJvdXRpbmdcIjoge1xuXHRcdFwiL1wiOiB7XG5cdFx0XHRcInRleHRzXCI6IHtcblx0XHRcdFx0XCJlblwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiVGhlIFNwcmluZy9TdW1tZXIgMjAxNiBjb2xsZWN0aW9uIGlzIGluc3BpcmVkIGJ5IE1hbGxvcmNhLCB0aGUgTWVkaXRlcnJhbmVhbiBpc2xhbmQgdGhhdCBDYW1wZXIgY2FsbHMgaG9tZS4gT3VyIHZpc2lvbiBvZiB0aGlzIHN1bm55IHBhcmFkaXNlIGhpZ2hsaWdodHMgdGhyZWUgaG90IHNwb3RzOiBEZWlhLCBFcyBUcmVuYywgYW5kIEFyZWxsdWYuIEZvciB1cywgTWFsbG9yY2EgaXNu4oCZdCBqdXN0IGEgZGVzdGluYXRpb24sIGl04oCZcyBhIHN0YXRlIG9mIG1pbmQuICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiVGhlIHZpbGxhZ2Ugb2YgRGVpYSBoYXMgbG9uZyBhdHRyYWN0ZWQgYm90aCByZXRpcmVlcyBhbmQgcm9jayBzdGFycyB3aXRoIGl0cyBwaWN0dXJlc3F1ZSBzY2VuZXJ5IGFuZCBjaGlsbCB2aWJlLiBUaGUgc2VlbWluZ2x5IHNsZWVweSBjb3VudHJ5c2lkZSBoYXMgYSBib2hlbWlhbiBzcGlyaXQgdW5pcXVlIHRvIHRoaXMgbW91bnRhaW4gZW5jbGF2ZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIlRoZSBmaXN0LXB1bXBpbmcgcmFnZXJzIG9mIEFyZW5hbCBhbmQgdW5icmlkbGVkIGRlYmF1Y2hlcnkgb2YgTWFnYWx1ZiBtZWV0IGluIEFyZWxsdWYsIGFuIGltYWdpbmVkIGJ1dCBlcGljIHBhcnQgb2Ygb3VyIHZpc2lvbiBvZiB0aGlzIGJlbG92ZWQgaXNsYW5kLiBJdOKAmXMgYWxsIG5lb24gYW5kIG5vbi1zdG9wIHBhcnR5aW5nIGluIHRoZSBzdW1tZXIgc3VuIOKAkyBxdWl0ZSBsaXRlcmFsbHkgYSBob3QgbWVzcy4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJUaGlzIGNvYXN0YWwgd2lsZGVybmVzcyBib2FzdHMgYnJlYXRodGFraW5nIGJlYWNoZXMgYW5kIGEgc2VyZW5lIGF0bW9zcGhlcmUuIFRoZSBzZWFzaWRlIGhhcyBhbiB1bnRhbWVkIHlldCBwZWFjZWZ1bCBmZWVsaW5nIHRoYXQgaXMgYm90aCBpbnNwaXJpbmcgYW5kIHNvb3RoaW5nLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJmclwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGVjdGlvbiBQcmludGVtcHMvw4l0w6kgMjAxNiBz4oCZaW5zcGlyZSBkZSBNYWpvcnF1ZSwgbOKAmcOubGUgbcOpZGl0ZXJyYW7DqWVubmUgZCdvw7kgQ2FtcGVyIGVzdCBvcmlnaW5haXJlLiBOb3RyZSB2aXNpb24gZGUgY2UgcGFyYWRpcyBlbnNvbGVpbGzDqSBzZSByZWZsw6h0ZSBkYW5zIHRyb2lzIGxpZXV4IGluY29udG91cm5hYmxlcyA6IERlaWEsIEVzIFRyZW5jIGV0IEFyZWxsdWYuIFBvdXIgbm91cywgTWFqb3JxdWUgZXN0IHBsdXMgcXXigJl1bmUgc2ltcGxlIGRlc3RpbmF0aW9uIDogY+KAmWVzdCB1biDDqXRhdCBk4oCZZXNwcml0LiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkxlIHZpbGxhZ2UgZGUgRGVpYSBhdHRpcmUgZGVwdWlzIGxvbmd0ZW1wcyBsZXMgcmV0cmFpdMOpcyBjb21tZSBsZXMgcm9jayBzdGFycyBncsOiY2Ugw6Agc2VzIHBheXNhZ2VzIHBpdHRvcmVzcXVlcyBldCBzb24gYW1iaWFuY2UgZMOpY29udHJhY3TDqWUuIFNhIGNhbXBhZ25lIGTigJlhcHBhcmVuY2UgdHJhbnF1aWxsZSBhZmZpY2hlIHVuIGVzcHJpdCBib2jDqG1lIGNhcmFjdMOpcmlzdGlxdWUgZGUgY2V0dGUgZW5jbGF2ZSBtb250YWduZXVzZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkzigJlleGFsdGF0aW9uIGTigJlBcmVuYWwgZXQgbGVzIHNvaXLDqWVzIGTDqWJyaWTDqWVzIGRlIE1hZ2FsdWYgc2UgcmVqb2lnbmVudCDDoCBBcmVsbHVmLCB1biBsaWV1IGltYWdpbmFpcmUgbWFpcyBjZW50cmFsIGRhbnMgbm90cmUgdmlzaW9uIGRlIGNldHRlIMOubGUgYWRvcsOpZS4gVG91dCB5IGVzdCBxdWVzdGlvbiBkZSBmbHVvIGV0IGRlIGbDqnRlcyBzYW5zIGZpbiBhdSBzb2xlaWwgZGUgbOKAmcOpdMOpIDogdW4gam95ZXV4IGJhemFyLCBlbiBzb21tZS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJDZXR0ZSBuYXR1cmUgc2F1dmFnZSBjw7R0acOocmUgam91aXQgZOKAmXVuZSBzdXBlcmJlIHBsYWdlIGV0IGTigJl1bmUgYXRtb3NwaMOocmUgY2FsbWUuIExlIGJvcmQgZGUgbWVyIGEgdW4gY8O0dMOpIMOgIGxhIGZvaXMgdHJhbnF1aWxsZSBldCBpbmRvbXB0w6kgcXVpIGluc3BpcmUgYXV0YW50IHF14oCZaWwgYXBhaXNlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJlc1wiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sZWNjacOzbiBwcmltYXZlcmEvdmVyYW5vIDIwMTYgZXN0w6EgaW5zcGlyYWRhIGVuIE1hbGxvcmNhLCBsYSBpc2xhIG1lZGl0ZXJyw6FuZWEgcXVlIENhbXBlciBjb25zaWRlcmEgc3UgaG9nYXIuIE51ZXN0cmEgdmlzacOzbiBkZSBlc3RlIHBhcmHDrXNvIHNvbGVhZG8gZGVzdGFjYSB0cmVzIGx1Z2FyZXMgaW1wb3J0YW50ZXM6IERlaWEsIEVzIFRyZW5jIHkgQXJlbGx1Zi4gUGFyYSBub3NvdHJvcywgTWFsbG9yY2Egbm8gZXMgdGFuIHNvbG8gdW4gZGVzdGlubywgZXMgdW4gZXN0YWRvIGRlIMOhbmltby4gI01hbGxvcmNhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImRlaWFcIjogXCJMb3MgaG9yaXpvbnRlcyBwaW50b3Jlc2NvcyB5IGxhIHRyYW5xdWlsaWRhZCBkZWwgcHVlYmxvIGRlIERlaWEgbGxldmFuIG11Y2hvIHRpZW1wbyBjYXV0aXZhbmRvIHRhbnRvIGEgYXJ0aXN0YXMgcmV0aXJhZG9zIGNvbW8gYSBlc3RyZWxsYXMgZGVsIHJvY2suIEVsIHBhaXNhamUgcnVyYWwgZGUgYXBhcmVudGUgY2FsbWEgcG9zZWUgdW4gZXNww61yaXR1IGJvaGVtaW8gcHJvcGlvIGRlIGVzdGUgZW5jbGF2ZSBtb250YcOxb3NvLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiTGEgbG9jdXJhIGZpZXN0ZXJhIGRlIFPigJlBcmVuYWwgeSBlbCBkZXNlbmZyZW5vIGRlIE1hZ2FsdWYgc2UgcmXDum5lbiBlbiBBcmVsbHVmLCB1bmEgY3JlYWNpw7NuIGRlbnRybyBkZSBudWVzdHJhIHZpc2nDs24gZGUgZXN0YSBxdWVyaWRhIGlzbGEuIFRvZG8gZ2lyYSBlbiB0b3JubyBhbCBuZcOzbiB5IGxhIGZpZXN0YSBzaW4gZmluIGJham8gZWwgc29sLiBFbiBkZWZpbml0aXZhLCB1bmEgY29tYmluYWNpw7NuIGV4cGxvc2l2YS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJFc3RlIGVzcGFjaW8gbmF0dXJhbCB2aXJnZW4gY3VlbnRhIGNvbiB1bmEgcGxheWEgaW1wcmVzaW9uYW50ZSB5IHVuIGFtYmllbnRlIHNlcmVuby4gTGEgY29zdGEsIHNhbHZhamUgeSBwYWPDrWZpY2EgYWwgbWlzbW8gdGllbXBvLCB0cmFuc21pdGUgdW5hIHNlbnNhY2nDs24gZXZvY2Fkb3JhIHkgcmVsYWphbnRlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGV6aW9uZSBQcmltYXZlcmEvRXN0YXRlIDIwMTYgw6ggaXNwaXJhdGEgYSBNYWlvcmNhLCBs4oCZaXNvbGEgZGVsIE1lZGl0ZXJyYW5lbyBjaGUgaGEgZGF0byBpIG5hdGFsaSBhIENhbXBlci4gTGEgbm9zdHJhIHZpc2lvbmUgZGkgcXVlc3RvIHBhcmFkaXNvIGFzc29sYXRvIHNpIHNvZmZlcm1hIHN1IHRyZSBsdW9naGkgc2ltYm9sbzogRGVpYSwgRXMgVHJlbmMgZSBBcmVsbHVmLiBQZXIgbm9pLCBNYWlvcmNhIG5vbiDDqCB1bmEgc2VtcGxpY2UgbWV0YSwgw6ggdW5vIHN0YXRvIGQnYW5pbW8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiRGEgdGVtcG8sIGlsIHZpbGxhZ2dpbyBkaSBEZWlhIGF0dGlyYSBwZW5zaW9uYXRpIGUgcm9jayBzdGFyIGNvbiBpbCBzdW8gcGFlc2FnZ2lvIHBpdHRvcmVzY28gZSBsJ2F0bW9zZmVyYSByaWxhc3NhdGEuIExhIGNhbXBhZ25hIGFwcGFyZW50ZW1lbnRlIHNvbm5vbGVudGEgaGEgdW5vIHNwaXJpdG8gYm9ow6ltaWVuIHRpcGljbyBkaSBxdWVzdG8gcGFlc2lubyBkaSBtb250YWduYS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkdsaSBzY2F0ZW5hdGkgZmVzdGFpb2xpIGRpIEFyZW5hbCBlIGxhIHNmcmVuYXRhIGRpc3NvbHV0ZXp6YSBkaSBNYWdhbHVmIHNpIGZvbmRvbm8gaW4gQXJlbGx1ZiwgdW5hIHBhcnRlIGltbWFnaW5hcmlhIG1hIGVwaWNhIGRlbGxhIG5vc3RyYSB2aXNpb25lIGRpIHF1ZXN0YSBhZG9yYXRhIGlzb2xhLiDDiCB1biB0dXJiaW5pbyBkaSBsdWNpIGFsIG5lb24gZSBmZXN0ZSBpbmludGVycm90dGUgc290dG8gaWwgc29sZSBlc3Rpdm8sIHVuIGNhb3MgcGF6emVzY28uICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiUXVlc3QnYXJlYSBwcm90ZXR0YSB2YW50YSB1bmEgc3BpYWdnaWEgbW96emFmaWF0byBlIHVuJ2F0bW9zZmVyYSBzZXJlbmEuIElsIGxpdG9yYWxlIGhhIHVuIGNoZSBkaSBzZWx2YWdnaW8sIG1hIHBhY2lmaWNvLCBjaGUgw6ggc3VnZ2VzdGl2byBlIHJpbGFzc2FudGUgYWwgdGVtcG8gc3Rlc3NvLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJkZVwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiRGllIEtvbGxla3Rpb24gRnLDvGhqYWhyL1NvbW1lciAyMDE2IGhhdCBzaWNoIHZvbiBNYWxsb3JjYSBpbnNwaXJpZXJlbiBsYXNzZW4sIGRlciBNaXR0ZWxtZWVyaW5zZWwsIGF1ZiBkZXIgQ2FtcGVyIHp1IEhhdXNlIGlzdC4gVW5zZXJlIFZpc2lvbiBkZXMgU29ubmVucGFyYWRpZXNlcyBiZWZhc3N0IHNpY2ggbWl0IGRyZWkgSG90c3BvdHM6IERlaWEsIEVzIFRyZW5jIHVuZCBBcmVsbHVmLiBGw7xyIHVucyBpc3QgTWFsbG9yY2EgbWVociBhbHMgbnVyIGVpbiBSZWlzZXppZWwsIGVzIGlzdCBlaW5lIExlYmVuc2VpbnN0ZWxsdW5nLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkRlciBPcnQgRGVpYSBtaXQgc2VpbmVyIG1hbGVyaXNjaGVuIExhbmRzY2hhZnQgdW5kIEzDpHNzaWdrZWl0IHppZWh0IHNlaXQgdmllbGVuIEphaHJlbiBuaWNodCBudXIgUGVuc2lvbsOkcmUsIHNvbmRlcm4gYXVjaCBSb2Nrc3RhcnMgYW4uIERpZSB2ZXJzY2hsYWZlbiBhbm11dGVuZGUgR2VnZW5kIHZlcnNwcsO8aHQgZWluZW4gZ2FueiBiZXNvbmRlcmVuIEJvaGVtaWFuLUNoYXJtZSwgZGVyIGVpbnppZ2FydGlnIGlzdCBmw7xyIGRpZXNlIEdlYmlyZ3NlbmtsYXZlLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiRGllIGdlc3TDpGhsdGVuIEvDtnJwZXIgdm9uIEFyZW5hbCB1bmQgZGllIHVuZ2V6w7xnZWx0ZSBPZmZlbmhlaXQgdm9uIE1hZ2FsdWYgdHJlZmZlbiBpbiBBcmVsbHVmIGF1ZmVpbmFuZGVyIOKAkyBlaW4gZmFudGFzaWV2b2xsZXMgdW5kIGRvY2ggdW1mYXNzZW5kZXMgRWxlbWVudCB1bnNlcmVyIFZpc2lvbiBkZXIgYmVsaWVidGVuIEluc2VsLiBFaW4gU29tbWVyIGF1cyBlbmRsb3NlbiBQYXJ0eXMgaW4gTmVvbmZhcmJlbiDigJMgZWluIGVjaHQgaGVpw59lciBPcnQuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiRGllc2VyIHVuYmVyw7xocnRlIEvDvHN0ZW5zdHJlaWZlbiB2ZXJmw7xndCDDvGJlciBlaW5lbiBhdGVtYmVyYXViZW5kZW4gU3RyYW5kIHVuZCBlaW5lIGJlcnVoaWdlbmRlIEF0bW9zcGjDpHJlLiBEYXMgTWVlciBpc3QgdW5nZXrDpGhtdCB1bmQgZnJpZWR2b2xsIHp1Z2xlaWNoIHVuZCBkaWVudCBhbHMgUXVlbGxlIGRlciBJbnNwaXJhdGlvbiBlYmVuc28gd2llIGFscyBSdWhlcG9sLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJwdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiQSBjb2xlw6fDo28gcHJpbWF2ZXJhL3ZlcsOjbyAyMDE2IHRlbSBNYWlvcmNhIGNvbW8gaW5zcGlyYcOnw6NvLCBhIGlsaGEgbWVkaXRlcnLDom5lYSBxdWUgYSBDYW1wZXIgY2hhbWEgZGUgY2FzYS4gQSBub3NzYSB2aXPDo28gZGVzdGUgcGFyYcOtc28gc29sYXJlbmdvIHJlYWzDp2EgdHLDqnMgbG9jYWlzIGltcG9ydGFudGVzOiBEZWlhLCBFcyBUcmVuYyBlIEFyZWxsdWYuIFBhcmEgbsOzcywgTWFpb3JjYSBuw6NvIMOpIHPDsyB1bSBkZXN0aW5vIGRlIGbDqXJpYXMsIG1hcyB0YW1iw6ltIHVtIGVzdGFkbyBkZSBlc3DDrXJpdG8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiQSBhbGRlaWEgZGUgRGVpYSBzZW1wcmUgYXRyYWl1IHJlZm9ybWFkb3MgZSBlc3RyZWxhcyBkZSByb2NrIGRldmlkbyDDoCBzdWEgcGFpc2FnZW0gcGl0b3Jlc2NhIGUgYW1iaWVudGUgZGVzY29udHJhw61kby4gRXN0YSBhbGRlaWEgY2FtcGVzdHJlIGFwYXJlbnRlbWVudGUgcGFjYXRhIHRlbSB1bSBlc3DDrXJpdG8gYm/DqW1pbywgZXhjbHVzaXZvIGRlc3RlIGVuY2xhdmUgbW9udGFuaG9zby4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkFzIGdyYW5kZXMgZmVzdGFzIGRlIEFyZW5hbCBlIGEgZGl2ZXJzw6NvIHNlbSBsaW1pdGVzIGRlIE1hZ2FsdWYgcmXDum5lbS1zZSBlbSBBcmVsbHVmLCB1bWEgcGFydGUgaW1hZ2luYWRhIG1hcyDDqXBpY2EgZGEgbm9zc2Egdmlzw6NvIGRlc3RhIGlsaGEgdMOjbyBhbWFkYSBwb3IgbsOzcy4gQSBjb21iaW5hw6fDo28gcGVyZmVpdGEgZW50cmUgdG9ucyBuw6lvbiBlIGZlc3RhcyBpbXBhcsOhdmVpcyBzb2IgbyBzb2wgZGUgdmVyw6NvICh1bWEgbWlzdHVyYSBiZW0gcXVlbnRlLCBuYSByZWFsaWRhZGUpLiAjQXJlbGx1ZkJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJlcy10cmVuY1wiOiBcIkVzdGEgdmFzdGEgcmVnacOjbyBjb3N0ZWlyYSBwb3NzdWkgcHJhaWFzIGltcHJlc3Npb25hbnRlcyBlIHVtIGFtYmllbnRlIHNlcmVuby4gTyBsaXRvcmFsIHRlbSB1bWEgYXRtb3NmZXJhIHNlbHZhZ2VtIGUgdHJhbnF1aWxhIGFvIG1lc21vIHRlbXBvLCBxdWUgw6kgdGFudG8gaW5zcGlyYWRvcmEgY29tbyByZWxheGFudGUuICNFc1RyZW5jQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0XCJhc3NldHNcIjogW1xuXHRcdFx0XHRcImJhY2tncm91bmQuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1jYXBhcy5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWtvYmFyYWguanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wYXJhZGlzZS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLXBlbG90YXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1tYXJ0YS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hcnRhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtbWF0ZW8uanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtYmVsdWdhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWlzYW11LmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxODgsIFwic1wiOiA4NSwgXCJ2XCI6IDYxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM1NywgXCJzXCI6IDk3LCBcInZcIjogMjYgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM1OSwgXCJzXCI6IDkzLCBcInZcIjogNTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJCcmVha2luZyB1cCBvbiBhIHRleHQgbWVzc2FnZSBpcyBub3QgdmVyeSBkZWlhXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9kdWJfZGVpYV9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJhempjMmpoNjJqXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiNnAzMmx5dmRxb1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVpYS9tYXRlb1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAzNywgXCJzXCI6IDg5LCBcInZcIjogODMgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogOCwgXCJzXCI6IDg2LCBcInZcIjogNTcgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA4NiwgXCJ2XCI6IDU3IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85NTBiNjkyNWZhNGY4NWNmYThkNDY2ZDg0MzYxNjcxNzk3YzIwYzFhL2RlaWEtbWF0ZW8ubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJidXlzIGFuIGF0ZWxpZXIgYXQgZGVpYS48YnI+c3RhcnRzIGNhcmVlciBhcyBhbiBhcnRpc3RcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL21hdGVvX2RlaWFfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiNmhldDFrbmlrM1wiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcIjZwMzJseXZkcW9cIlxuICAgICAgICB9LFxuXG4gICAgICAgIFwiZGVpYS9tYXJ0YVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80YmI2ZTQ4NWI3MTdiZjdkYmRkNWM5NDFmYWZhMmIxODg0ZTkwODM4L2RlaWEtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAzNDYsIFwic1wiOiA3MCwgXCJ2XCI6IDU1IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDI0NCwgXCJzXCI6IDI5LCBcInZcIjogNzMgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDI0NCwgXCJzXCI6IDI5LCBcInZcIjogNzMgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2QxNTliNTVmZjhjZWNjOWNiZDhjMGMxMmVlMjc4MWUyZWRhMjNlOTMvZGVpYS1tYXJ0YS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcImJ1eXMgYW4gYXRlbGllciBhdCBkZWlhLjxicj5zdGFydHMgY2FyZWVyIGFzIGFuIGFydGlzdFwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9tYXJ0YV9kZWlhX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcInRvcm8ycGU0NjlcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJiZ2t4N2dtazEzXCJcbiAgICAgICAgfSxcblxuICAgICAgICBcImVzLXRyZW5jL2JlbHVnYVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMzQ0NGQzYzg2OTNlNTlmODA3OWY4MjdkZDE4MmM1ZTMzNDEzODc3L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMiwgXCJzXCI6IDEwLCBcInZcIjogNjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMTkzLCBcInNcIjogMTIsIFwidlwiOiA0NSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTkzLCBcInNcIjogMCwgXCJ2XCI6IDQ1IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy83MDQ1NWFkNzNhZjdiN2UzNWU5ZTY3NDEwOTkyOWMzYjcwMjk0MDY0L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkVTIFRSRU5DIFBBUlRZIEJPWVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvYmVsdWdhX2VzX3RyZW5jX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImZvMTEyemg3cHZcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCI5N2J2cHpodG5iXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJlcy10cmVuYy9pc2FtdVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEwLCBcInNcIjogMSwgXCJ2XCI6IDc0IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIxLCBcInNcIjogMzUsIFwidlwiOiA3MiB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAsIFwic1wiOiA0NSwgXCJ2XCI6IDMwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8wNjY3OWYzZWJkNjk2ZTljNDJmZDEzY2Y5ZGJkYWVmZmU5YjFmODczL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiVUZPIHNpZ2h0aW5nIGF0IGVzIHRyZW5jXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL2lzYW11X2VzX3RyZW5jX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjF4c2FicTd5ZXlcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJ4bmxueWVlODNvXCJcbiAgICAgICAgfSxcblxuXHRcdFwiYXJlbGx1Zi9jYXBhc1wiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDAsIFwic1wiOiAwLCBcInZcIjogMCB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiA4LCBcInNcIjogNzYsIFwidlwiOiA5MSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzQ4ZmYxYzU4Yjg2YjA4OTEyNjgxYjRmZGYzYjc1NDdjNzU3NzY2ZDcvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIk1FQU5XSElMRSBJTiBBUkVMTFVGXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9jYXBhc19hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIno3b3I2OGRhMXZcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJrZmMwdTF2dmhwXCJcblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMSwgXCJzXCI6IDk1LCBcInZcIjogMjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjIsIFwic1wiOiAzNSwgXCJ2XCI6IDc5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMzMsIFwic1wiOiAzNSwgXCJ2XCI6IDEwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hYzE2ZDUzYzRmOWU4ZmQ2OTMwNzc5ZTIzNzg1NDY4N2RjZjI0MWU4L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIQVQgSEFQUEVOUyBJTiBBUkVMTFVGIFNUQVlTIElOIEFSRUxMVUZcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL3BlbG90YXNfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJmOWRvMnFsd25qXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwia3lqa2J3Y242dlwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9tYXJ0YVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2FyZWxsdWYtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMDAsIFwic1wiOiA1NywgXCJ2XCI6IDgxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwMSwgXCJzXCI6IDEwMCwgXCJ2XCI6IDY5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNWI5ZDI3MDYxMDBlNWVhMGQzMTcxNDNlMjM3NGQ2YmQ2Yzk2MDdiMS9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiQkFEIFRSSVAgQVQgVEhFIEhPVEVMIFBPT0xcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMvbWFydGFfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJwcGttZmRsNWpxXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwicjY0aWoyb2poM1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9rb2JhcmFoXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzI5ODBmMTRjYzhiZDk5MTJiMTRkY2E0NmE0Y2Q0YTg1ZmEwNDc3NGMvYXJlbGx1Zi1rb2JhcmFoLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjY0LCBcInNcIjogNjksIFwidlwiOiA0MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNDQsIFwic1wiOiA1NiwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMzQ0LCBcInNcIjogNDEsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvYXJlbGx1Zi1rb2JhcmFoLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiSGF0ZXJzIHdpbGwgc2F5IGl0cyBwaG90b3Nob3BcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMva29iYXJhaF9hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjl4ZTV2anp5Ym9cIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJvNzlkcXBocHNsXCJcbiAgICAgICAgfSxcblx0XHRcImFyZWxsdWYvZHViXCI6IHtcblx0XHRcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjJiMzYwYzhjYTM5OTY5Njk4NTMxM2RkZTk5YmE4M2Q0ZWM5NzJiNy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDE5NiwgXCJzXCI6IDUyLCBcInZcIjogMzMgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTg3YmRhYjAxMjk3OTgyMmI4MTg2Mzc4MzdjYzI4ODQxNGNlZjhmMy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIRU4gWU9VIENBTidUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvZHViX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiZGxnNWF6eTVhclwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcInFwaGo5cDN0NWhcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvcGFyYWRpc2VcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogNTksIFwic1wiOiAxOSwgXCJ2XCI6IDk5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwNywgXCJzXCI6IDMxLCBcInZcIjogMTAwIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxODMsIFwic1wiOiA3MSwgXCJ2XCI6IDY0IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy81ZGMxOTcyNmVmYTdiMmU3NTZjODA1MzRkNDNmYTYwMGNjNjFmMTc4L2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJTRUxGSUUgT04gV0FURVJTTElERSBMSUtFIEEgQk9TU1wiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9wYXJhZGlzZV9hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImg4OXkwa3V3eTJcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCIzNDN0MXNuMm5wXCJcbiAgICAgICAgfVxuXG5cdH1cbn0iXX0=
