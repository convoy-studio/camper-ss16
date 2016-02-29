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
_AppStore2['default'].Detector.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
_AppStore2['default'].Detector.isMobile = md.mobile() || md.tablet() ? true : false;
_AppStore2['default'].Parent = _domHand2['default'].select('#app-container');
_AppStore2['default'].Detector.oldIE = _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie6') || _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie7') || _domHand2['default'].classes.contains(_AppStore2['default'].Parent, 'ie8');
_AppStore2['default'].Detector.isSupportWebGL = _Utils2['default'].SupportWebGL();
if (_AppStore2['default'].Detector.oldIE) _AppStore2['default'].Detector.isMobile = true;

// Debug
// AppStore.Detector.isMobile = true

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
		this.onPlaneUpdate = this.onPlaneUpdate.bind(this);
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
			tl.eventCallback('onUpdate', this.onPlaneUpdate);
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
		key: 'onPlaneUpdate',
		value: function onPlaneUpdate() {
			var scale = 2.2 - this.loaderAnim.tl.progress() * 1.5;
			TweenMax.set(this.loaderAnim.plane, { scale: scale, force3D: true, transformOrigin: '50% 50%' });
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

			// return
			this.loaderAnim.tl.timeScale(2.4).tweenTo(this.loaderAnim.tl.totalDuration() - 0.1);
			setTimeout(function () {
				TweenMax.to(_this2.loaderAnim.el, 0.5, { opacity: 0, force3D: true, ease: Expo.easeOut });
				setTimeout(function () {
					_AppStore2['default'].off(_AppConstants2['default'].WINDOW_RESIZE, _this2.resize);
					_domHand2['default'].tree.remove(_this2.loaderAnim.el);
					_this2.loaderAnim.tl.eventCallback('onUpdate', null);
					_this2.loaderAnim.tl.clear();
					_this2.loaderAnim.tl = null;
					_this2.loaderAnim = null;
					setTimeout(function () {
						return _AppActions2['default'].appStart();
					});
					setTimeout(function () {
						return _AppActions2['default'].pageHasherChanged();
					});
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

var _Index_hbs = require('./partials/Index.hbs');

var _Index_hbs2 = _interopRequireDefault(_Index_hbs);

var _mobileFooter = require('./components/mobile-footer');

var _mobileFooter2 = _interopRequireDefault(_mobileFooter);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _simpleScrolltop = require('simple-scrolltop');

var _simpleScrolltop2 = _interopRequireDefault(_simpleScrolltop);

var _Utils = require('./utils/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _colorUtils = require('color-utils');

var _colorUtils2 = _interopRequireDefault(_colorUtils);

var AppTemplateMobile = (function (_BaseComponent) {
	_inherits(AppTemplateMobile, _BaseComponent);

	function AppTemplateMobile() {
		_classCallCheck(this, AppTemplateMobile);

		_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'constructor', this).call(this);

		this.scope = {};
		var generaInfos = _AppStore2['default'].generalInfos();
		this.scope.infos = _AppStore2['default'].globalContent();
		this.scope.labUrl = generaInfos['lab_url'];
		this.scope.generic = _AppStore2['default'].getRoutePathScopeById('/').texts[_AppStore2['default'].lang()].generic;
		this.scope.mobilemap = _AppStore2['default'].baseMediaPath() + 'image/mobile_map.jpg';

		this.resize = this.resize.bind(this);
		this.onOpenFeed = this.onOpenFeed.bind(this);
		this.onOpenGrid = this.onOpenGrid.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.onIconClicked = this.onIconClicked.bind(this);

		// find urls for each feed
		this.index = [];
		this.feed = _AppStore2['default'].getFeed();
		var baseUrl = _AppStore2['default'].baseMediaPath();
		var i, feed, folder, icon, pageId, scope;
		for (i = 0; i < this.feed.length; i++) {
			feed = this.feed[i];
			folder = baseUrl + 'image/diptyque/' + feed.id + '/' + feed.person + '/';
			icon = folder + 'icon.jpg';
			pageId = feed.id + '/' + feed.person;
			scope = _AppStore2['default'].getRoutePathScopeById(pageId);
			// console.log(scope)
			feed.icon = icon;
			feed.shopUrl = scope['shop-url'];
			if (feed.media.type == 'image' && feed.media.id == 'shoe') {
				feed.media.url = folder + 'mobile/' + 'shoe.jpg';
				feed.comments[0]['person-text'] += ' <a target="_blank" href="' + feed.shopUrl + '">#Shop' + _Utils2['default'].CapitalizeFirstLetter(feed.comments[0]['person-name']) + '</a>';
				feed.media['is-shop'] = true;
			}
			if (feed.media.type == 'image' && feed.media.id == 'character') {
				feed.media.url = folder + 'mobile/' + 'character.jpg';
			}
			if (feed.media.type == 'video' && feed.media.id == 'fun-fact') {
				feed.media['is-video'] = true;
				feed.media.url = scope['wistia-fun-id'];
				feed.comments[0]['person-text'] = scope.fact.en;
			}
			if (feed.media.type == 'video' && feed.media.id == 'character') {
				feed.media['is-video'] = true;
				feed.media.url = scope['wistia-character-id'];
			}
			if (feed.media.type == 'image') {
				this.index.push(feed);
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
			this.indexEl = _domHand2['default'].select('.index', this.mainContainer);

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
		key: 'onIconClicked',
		value: function onIconClicked(e) {
			e.preventDefault();
			var target = e.currentTarget;
			var randomColor = _colorUtils2['default'].randomColor();
			var path = _domHand2['default'].select('path', target);
			path.style.fill = randomColor;
			_domHand2['default'].classes.add(target, 'highlight');
			setTimeout(function () {
				_domHand2['default'].classes.remove(target, 'highlight');
			}, 300);
		}
	}, {
		key: 'preparePosts',
		value: function preparePosts() {
			this.posts = [];
			var posts = _domHand2['default'].select.all('.post', this.feedEl);
			var i, el, icons, icon;
			for (i = 0; i < posts.length; i++) {
				el = posts[i];
				icons = _domHand2['default'].select.all('#icon', el);
				for (var j = 0; j < icons.length; j++) {
					icon = icons[j];
					_domHand2['default'].event.on(icon, 'click', this.onIconClicked);
				}
				this.posts[i] = {
					el: el,
					mediaWrapper: _domHand2['default'].select('.media-wrapper', el),
					iconsWrapper: _domHand2['default'].select('.icons-wrapper', el),
					commentsWrapper: _domHand2['default'].select('.comments-wrapper', el),
					topWrapper: _domHand2['default'].select('.top-wrapper', el),
					icons: icons
				};
			}
			this.resize();
		}
	}, {
		key: 'onOpenFeed',
		value: function onOpenFeed() {
			this.removeGrid();
			this.isFeed = true;
			var currentFeed = this.getLastFeeds();
			this.updateFeedToDom(currentFeed);
			this.preparePosts();
			_domHand2['default'].event.on(window, 'scroll', this.onScroll);
			this.resize();
		}
	}, {
		key: 'onOpenGrid',
		value: function onOpenGrid() {
			this.removeFeed();
			this.isFeed = false;
			_domHand2['default'].event.off(window, 'scroll', this.onScroll);
			var scope = {
				index: this.index
			};
			var t = (0, _Index_hbs2['default'])(scope);
			this.indexEl.innerHTML = t;
			this.indexes = _domHand2['default'].select.all('.block', this.indexEl);
			this.resize();
		}
	}, {
		key: 'removeFeed',
		value: function removeFeed() {
			if (this.posts == undefined) return;
			this.currentFeedIndex = 0;
			for (var i = 0; i < this.posts.length; i++) {
				var post = this.posts[i];
				_domHand2['default'].tree.remove(post.el);
			}
		}
	}, {
		key: 'removeGrid',
		value: function removeGrid() {
			if (this.indexes == undefined) return;
			for (var i = 0; i < this.indexes.length; i++) {
				var post = this.indexes[i];
				_domHand2['default'].tree.remove(post);
			}
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

			if (this.isFeed) {
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
			} else {
				var w = windowW / 3;
				var counter = 0;
				var h = 0;
				for (var i = 0; i < this.indexes.length; i++) {
					var index = this.indexes[i];
					index.style.width = w + 'px';
					index.style.height = w + 'px';
					index.style.left = w * counter + 'px';
					index.style.top = h + 'px';
					counter++;
					if (counter >= 3) {
						h += w;
						counter = 0;
					}
				}
			}

			this.footer.resize();

			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'resize', this).call(this);
		}
	}]);

	return AppTemplateMobile;
})(_BaseComponent3['default']);

exports['default'] = AppTemplateMobile;
module.exports = exports['default'];

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/mobile-footer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mobile-footer.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./partials/Feed.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Feed.hbs","./partials/Index.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Index.hbs","./partials/Mobile.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","color-utils":"color-utils","dom-hand":"dom-hand","simple-scrolltop":"simple-scrolltop"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js":[function(require,module,exports){
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
    },
    appStart: function appStart() {
        _AppDispatcher2['default'].handleViewAction({
            actionType: _AppConstants2['default'].APP_START,
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

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var FrontContainer = (function (_BaseComponent) {
	_inherits(FrontContainer, _BaseComponent);

	function FrontContainer() {
		_classCallCheck(this, FrontContainer);

		_get(Object.getPrototypeOf(FrontContainer.prototype), 'constructor', this).call(this);
		this.onAppStarted = this.onAppStarted.bind(this);
	}

	_createClass(FrontContainer, [{
		key: 'render',
		value: function render(parent) {
			var scope = {};
			var generaInfos = _AppStore2['default'].generalInfos();
			scope.infos = _AppStore2['default'].globalContent();
			scope.general = generaInfos;

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
			this.headerEl = _domHand2['default'].select('header', this.element);
			_AppStore2['default'].on(_AppConstants2['default'].APP_START, this.onAppStarted);
			this.headerLinks = (0, _headerLinks2['default'])(this.element);
			_get(Object.getPrototypeOf(FrontContainer.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onAppStarted',
		value: function onAppStarted() {
			_AppStore2['default'].off(_AppConstants2['default'].APP_START, this.onAppStarted);
			_domHand2['default'].classes.add(this.headerEl, 'show');
		}
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

},{"./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/FrontContainer.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/FrontContainer.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./header-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js","./social-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PXContainer.js":[function(require,module,exports){
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
			icon: _domHand2['default'].select('svg', leftArrow),
			iconsWrapper: _domHand2['default'].select('.icons-wrapper', leftArrow),
			background: _domHand2['default'].select('.background', leftArrow)
		},
		right: {
			el: rightArrow,
			icon: _domHand2['default'].select('svg', rightArrow),
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

			var arrowSize = _domHand2['default'].size(arrows.left.icon);
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

var _textBtn = require('./text-btn');

var _textBtn2 = _interopRequireDefault(_textBtn);

var bottomTexts = function bottomTexts(parent) {

	var scope;
	var el = _domHand2['default'].select('.bottom-texts-container', parent);
	var socialWrapper = _domHand2['default'].select('#social-wrapper', el);
	var titlesWrapper = _domHand2['default'].select('.titles-wrapper', el);
	var allTitles = _domHand2['default'].select.all('li', titlesWrapper);
	var textsEls = _domHand2['default'].select.all('.texts-wrapper .txt', el);
	var texts = [];
	var ids = ['generic', 'deia', 'es-trenc', 'arelluf'];
	var oldText, currentOpenId;
	var masksParent = _domHand2['default'].select('.inner-mask-background', el);
	var background = _domHand2['default'].select('.inner-background', el);
	var masksChildren = _domHand2['default'].select.all('.inner-mask-background div', masksParent).reverse();
	var masksTween = undefined;
	var firstTime = true;
	var changeTextAnimTimeout;
	var isAnimate = false;

	var simpleTextBtnsEl = _domHand2['default'].select.all('.text-btn', titlesWrapper);
	var simpleBtns = [];
	var i, s, e, id;
	for (i = 0; i < simpleTextBtnsEl.length; i++) {
		e = simpleTextBtnsEl[i];
		id = e.id;
		s = (0, _textBtn2['default'])(e);
		s.id = id;
		simpleBtns[i] = s;
	}

	var setupMaskTween = function setupMaskTween(blockSize) {
		if (masksTween != undefined) {
			masksTween.clear();
			masksTween = null;
		}
		masksTween = new TimelineMax();
		masksTween.staggerFromTo(masksChildren, 1, { x: blockSize[0] + 2, scaleY: 4, transformOrigin: '0% 0%' }, { x: -blockSize[0] - 2, scaleY: 1, transformOrigin: '0% 0%', ease: Expo.easeInOut }, 0.08, 0.1);
		masksTween.to(background, 0.4, { scale: 1.2, transformOrigin: '50% 50%', ease: Elastic.easeOut }, 0);
		masksTween.to(background, 0.5, { scale: 1, transformOrigin: '50% 50%', ease: Elastic.easeOut }, 0.1);
		masksTween.pause(0);
	};

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
		var txtBtn = undefined;
		for (var j = 0; j < simpleBtns.length; j++) {
			if (simpleBtns[j].id == id) {
				txtBtn = simpleBtns[j];
			}
		}
		texts[i] = {
			id: id,
			el: e,
			btn: txtBtn
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

			setupMaskTween(innerBlockSize);

			if (currentOpenId != undefined) {
				scope.openTxtById(currentOpenId, true);
			}
		}, 0);
	};

	scope = {
		el: el,
		resize: resize,
		openTxtById: function openTxtById(id, force) {
			currentOpenId = id;
			var f = force || false;
			if (!f) {
				if (isAnimate) return;
				isAnimate = true;
				changeTextAnimTimeout = setTimeout(function () {
					isAnimate = false;
				}, 1100);
			}
			var i, text;
			for (i = 0; i < texts.length; i++) {
				text = texts[i];
				if (id == text.id) {
					if (oldText != undefined) {
						// if(id == oldText.id) return
						oldText.tl.timeScale(2.6).reverse();
						if (oldText.btn != undefined) oldText.btn.disactivate();
					}

					if (f) {
						text.tl.pause(text.tl.totalDuration());
					} else {
						setTimeout(function () {
							return text.tl.timeScale(1.2).play();
						}, 900);
						setTimeout(function () {
							return masksTween.play(0);
						}, 200);
						if (text.btn != undefined) text.btn.activate();
					}

					oldText = text;
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
			masksTween.clear();
			ids = null;
			texts = null;
			allTitles = null;
			textsEls = null;
			masksTween = null;
		}
	};

	return scope;
};

exports['default'] = bottomTexts;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./text-btn":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/text-btn.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _isRetina = require('is-retina');

var _isRetina2 = _interopRequireDefault(_isRetina);

exports['default'] = function (holder, characterUrl, textureSize) {

	var scope;

	var imgScale = (0, _isRetina2['default'])() ? 0.5 : 1;
	var tsize = {
		width: textureSize.width * imgScale,
		height: textureSize.height * imgScale
	};

	var tex = PIXI.Texture.fromImage(characterUrl);
	var sprite = new PIXI.Sprite(tex);
	sprite.anchor.x = sprite.anchor.y = 0.5;
	holder.addChild(sprite);

	var mask = new PIXI.Graphics();
	holder.addChild(mask);

	var targetId = _Router2['default'].getNewHash().target;

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
				var scale;

				if (targetId == 'paradise') scale = ((windowW >> 1) + 100) / tsize.width * 1;else scale = (windowH - 100) / tsize.height * 1;

				sprite.scale.x = sprite.scale.y = scale;
				sprite.x = size[0] >> 1;
				sprite.y = size[1] - (tsize.height * scale >> 1) + 10;
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

},{"./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","is-retina":"is-retina"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/colory-rects.js":[function(require,module,exports){
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

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/fun-fact-holder.js":[function(require,module,exports){
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
	var tlTimeout;
	var firstResize = true;
	var containerScale = 3;

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
		mVideo.on('ended', onCloseFunFact);
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
			return mVideo.play(0);
		}, delay + 200);
		clearTimeout(onCloseTimeout);
		onCloseTimeout = setTimeout(function () {
			return _domHand2['default'].event.on(parent, 'click', onCloseFunFact);
		}, delay + 200);
		parent.style.cursor = 'none';
		_domHand2['default'].classes.add(cross.el, 'active');
	};
	var close = function close(force) {
		mVideo.off('ended', onCloseFunFact);
		mVideo.pause();
		el.style['z-index'] = 27;
		scope.isOpen = false;
		scope.leftRects.close();
		scope.rightRects.close();
		var delay = 50;
		var t = 2;
		if (force) t = 4;
		setTimeout(function () {
			return leftTl.timeScale(t).reverse();
		}, delay);
		setTimeout(function () {
			return rightTl.timeScale(t).reverse();
		}, delay);
		parent.style.cursor = 'auto';
		_domHand2['default'].event.off(parent, 'click', onCloseFunFact);
		_domHand2['default'].classes.remove(cross.el, 'active');
	};

	var resizeInnerSize = function resizeInnerSize(wW, wH) {
		var messageInnerSize = _domHand2['default'].size(messageInner);
		if (!scope.isOpen) messageInnerSize[1] = messageInnerSize[1] / containerScale;
		messageInner.style.left = (wW >> 1 >> 1) - (messageInnerSize[0] >> 1) + 'px';
		messageInner.style.top = (wH >> 1) - (messageInnerSize[1] >> 1) + 'px';
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

			if (scope.leftRects != undefined || scope.rightRects != undefined) {
				scope.leftRects.resize(size[0], size[1], _AppConstants2['default'].TOP);
				scope.rightRects.resize(size[0], size[1], _AppConstants2['default'].BOTTOM);
				scope.rightRects.holder.x = windowW / 2;
			}

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
				resizeInnerSize(windowW, windowH);
			}, 3);

			clearTimeout(tlTimeout);
			tlTimeout = setTimeout(function () {

				if (leftTl == undefined || rightTl == undefined) return;

				leftTl.clear();
				rightTl.clear();

				leftTl.fromTo(messageWrapper, 1.4, { y: windowH, scaleY: containerScale, transformOrigin: '50% 0%' }, { y: 0, scaleY: 1, transformOrigin: '50% 0%', force3D: true, ease: Expo.easeInOut }, 0);
				leftTl.staggerFromTo(splitter.words, 1, { y: 1600, scaleY: 6, force3D: true }, { y: 0, scaleY: 1, force3D: true, ease: Expo.easeOut }, 0.06, 0.2);
				rightTl.fromTo(videoWrapper, 1.4, { y: -windowH * 2, scaleY: containerScale, transformOrigin: '50% 100%' }, { y: 0, scaleY: 1, transformOrigin: '50% 100%', force3D: true, ease: Expo.easeInOut }, 0);

				leftTl.pause(0);
				rightTl.pause(0);
				messageWrapper.style.opacity = 1;
				videoWrapper.style.opacity = 1;

				if (scope.isOpen) {
					leftTl.pause(leftTl.totalDuration());
					rightTl.pause(rightTl.totalDuration());
				} else {
					leftTl.pause(0);
					rightTl.pause(0);
				}
				firstResize = false;
			}, 1);
		},
		update: function update() {
			if (!scope.isOpen) return;
			var newx = mouse.x - (cross.size[0] >> 1);
			var newy = mouse.y - (cross.size[1] >> 1);
			cross.x += (newx - cross.x) * 0.5;
			cross.y += (newy - cross.y) * 0.5;

			if (mouse.y > 70) {
				parent.style.cursor = 'none';
				cross.el.style.opacity = 1;
			} else {
				parent.style.cursor = 'auto';
				cross.el.style.opacity = 0;
			}
			_Utils2['default'].Translate(cross.el, cross.x, cross.y, 1);
		},
		clear: function clear() {
			mVideo.off('ended', onCloseFunFact);
			mVideo.clear();
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
			mVideo = null;
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
		var originalImageSize = _AppConstants2['default'].HOME_IMAGE_SIZE;
		var blockSize = gGrid.blockSize;

		linesGridContainer.style.position = 'absolute';

		var resizeVideoVars = _Utils2['default'].ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1]);
		var resizeImageVars = _Utils2['default'].ResizePositionProportionally(blockSize[0], blockSize[1], originalImageSize[0], originalImageSize[1]);

		var gPos = gGrid.positions;
		var parent, cell;
		var count = 0;
		var hl, vl;
		for (var i = 0; i < gPos.length; i++) {
			var row = gPos[i];

			// horizontal lines
			if (i > 0) {
				hl = scope.lines.horizontal[i - 1];
				hl.style.top = Math.floor(blockSize[1] * i) + 'px';
				hl.style.width = windowW + 'px';
			}

			for (var j = 0; j < row.length; j++) {

				// vertical lines
				if (i == 0 && j > 0) {
					vl = scope.lines.vertical[j - 1];
					vl.style.left = Math.floor(blockSize[0] * j) + 'px';
					vl.style.height = windowH + 'px';
				}

				cell = scope.cells[count];
				if (cell != undefined) {
					cell.resize(blockSize, row[j], resizeVideoVars, resizeImageVars);
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

var _textBtn = require('./text-btn');

var _textBtn2 = _interopRequireDefault(_textBtn);

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

	var simpleTextBtnsEl = _domHand2['default'].select.all('.text-btn', parent);
	var simpleBtns = [];
	var i, s, el;
	for (i = 0; i < simpleTextBtnsEl.length; i++) {
		el = simpleTextBtnsEl[i];
		s = (0, _textBtn2['default'])(el);
		simpleBtns[i] = s;
	}

	var shopWrapper = _domHand2['default'].select('.shop-wrapper', parent);
	shopWrapper.addEventListener('mouseenter', onSubMenuMouseEnter);
	shopWrapper.addEventListener('mouseleave', onSubMenuMouseLeave);

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var padding = _AppConstants2['default'].PADDING_AROUND / 3;

			var camperLab = simpleBtns[1];
			var shop = simpleBtns[2];
			var map = simpleBtns[0];
			var shopSize = _domHand2['default'].size(shopWrapper);

			var camperLabCss = {
				left: windowW - _AppConstants2['default'].PADDING_AROUND * 0.6 - padding - camperLab.size[0],
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var shopCss = {
				left: camperLabCss.left - shopSize[0] - padding - 20,
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var mapCss = {
				left: shopCss.left - map.size[0] - padding - 30,
				top: _AppConstants2['default'].PADDING_AROUND
			};

			shop.el.style.left = (shopSize[0] >> 1) - (shop.size[0] >> 1) + 'px';

			camperLab.el.style.left = camperLabCss.left + 'px';
			camperLab.el.style.top = camperLabCss.top + 'px';
			shopWrapper.style.left = shopCss.left + 'px';
			shopWrapper.style.top = shopCss.top + 'px';
			map.el.style.left = mapCss.left + 'px';
			map.el.style.top = mapCss.top + 'px';
		}
	};

	return scope;
};

exports['default'] = headerLinks;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./text-btn":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/text-btn.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/image-to-canvases-grid.js":[function(require,module,exports){
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

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW * 1.1, windowH * 1.1, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);
			image.style.position = 'absolute';
			image.style.width = resizeVarsBg.width + 'px';
			image.style.height = resizeVarsBg.height + 'px';
			image.style.top = resizeVarsBg.top - 10 + 'px';
			image.style.left = resizeVarsBg.left - 20 + 'px';

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

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

exports['default'] = function (container, data, mouse, onMouseEventsHandler, pxContainer) {

	var animParams = function animParams(s, dir) {
		var tl = new TimelineMax();
		tl.fromTo(s.scale, 1, { x: 1.7, y: 1.3 }, { x: globalScale, y: globalScale, ease: Back.easeInOut }, 0);
		tl.fromTo(s, 1, { alpha: 0, rotation: Math.PI * 0.08 * dir }, { alpha: 1, rotation: 0, ease: Expo.easeInOut }, 0);
		tl.pause(0);
		s.fposition = { x: 0, y: 0 };
		s.iposition = { x: 0, y: 0 };
		s.velocity = { x: 0, y: 0 };
		s.time = 0;
		s.tl = tl;
		s.config = {
			length: 0,
			spring: 1.1,
			friction: 0.4
		};
	};

	var scope;
	var globalScale = 0.6;
	var el = _domHand2['default'].select('.main-btns-wrapper', container);
	var shopBtn = _domHand2['default'].select('#shop-btn', el);
	var funBtn = _domHand2['default'].select('#fun-fact-btn', el);
	var shopSize, funSize;
	var loadCounter = 0;
	var buttonSize = [0, 0];
	var springTo = _Utils2['default'].SpringTo;
	var shopSprite, funSprite, currentAnim;

	var shopImg = (0, _img2['default'])(_AppStore2['default'].baseMediaPath() + 'image/shop/' + _AppStore2['default'].lang() + '.png', function () {
		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(shopImg.src));
		sprite.anchor.x = sprite.anchor.y = 0.5;
		pxContainer.addChild(sprite);
		animParams(sprite, -1);
		shopSprite = sprite;
		shopSize = [shopImg.width, shopImg.height];
		scope.resize();
	});
	var funImg = (0, _img2['default'])(_AppStore2['default'].baseMediaPath() + 'image/fun-facts.png', function () {
		var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(funImg.src));
		sprite.anchor.x = sprite.anchor.y = 0.5;
		pxContainer.addChild(sprite);
		animParams(sprite, 1);

		funSprite = sprite;
		funSize = [funImg.width, funImg.height];

		scope.resize();
	});

	_domHand2['default'].event.on(shopBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'click', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'click', onMouseEventsHandler);

	var updateAnim = function updateAnim(s) {
		if (s == undefined) return;
		s.time += 0.1;
		s.fposition.x = s.iposition.x;
		s.fposition.y = s.iposition.y;
		s.fposition.x += (mouse.nX - 0.5) * 140;
		s.fposition.y += (mouse.nY - 0.5) * 200;

		springTo(s, s.fposition, 1);
		s.config.length += (0.01 - s.config.length) * 0.1;

		s.x += s.velocity.x;
		s.y += s.velocity.y;
	};

	scope = {
		isActive: true,
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var midW = windowW >> 1;

			buttonSize[0] = midW * 0.9;
			buttonSize[1] = windowH;

			if (shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px';
				shopBtn.style.height = buttonSize[1] + 'px';
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				shopSprite.x = shopSprite.iposition.x = midW >> 1;
				shopSprite.y = shopSprite.iposition.y = windowH >> 1;

				shopSprite.scale.x = shopSprite.scale.x = globalScale;
			}
			if (funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px';
				funBtn.style.height = buttonSize[1] + 'px';
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				funSprite.x = funSprite.iposition.x = midW + (midW >> 1);
				funSprite.y = funSprite.iposition.y = windowH >> 1;
				funSprite.scale.x = funSprite.scale.x = globalScale;
			}
		},
		over: function over(id) {
			if (!scope.isActive) return;
			currentAnim = id == 'shop-btn' ? shopSprite : funSprite;
			currentAnim.tl.timeScale(2.8).play(0);
			currentAnim.config.length = 400;
		},
		out: function out(id) {
			if (!scope.isActive) return;
			currentAnim = id == 'shop-btn' ? shopSprite : funSprite;
			currentAnim.tl.timeScale(3.2).reverse();
		},
		update: function update() {
			if (!scope.isActive) return;
			if (shopSprite == undefined) return;
			updateAnim(shopSprite);
			updateAnim(funSprite);
		},
		activate: function activate() {
			scope.isActive = true;
		},
		disactivate: function disactivate() {
			scope.isActive = false;
			shopSprite.tl.timeScale(3).reverse();
			funSprite.tl.timeScale(3).reverse();
		},
		clear: function clear() {
			pxContainer.removeChild(shopSprite);
			pxContainer.removeChild(funSprite);
			shopSprite.tl.clear();
			funSprite.tl.clear();
			shopSprite.destroy();
			funSprite.destroy();
			_domHand2['default'].event.off(shopBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'click', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'click', onMouseEventsHandler);
			shopSprite = null;
			funSprite = null;
			currentAnim = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js":[function(require,module,exports){
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
	var mallorcaLogo = _domHand2['default'].select('#mallorca-logo path', el);
	var currentDot;

	// fix buggy origin position
	if (_AppStore2['default'].Detector.isFirefox) {
		var i, dot;
		for (i = 0; i < mapdots.length; i++) {
			dot = mapdots[i];
			_domHand2['default'].classes.add(dot, 'fix-buggy-origin-position');
		}
	}

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
		el: mapWrapper,
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
				// if(id == oldHash.target && parentId == oldHash.parent) selectedDots.push(dot)
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
				// console.log(id, oldId, newId)
				if (id.indexOf(oldId) > -1 && id.indexOf(newId) > -1) {

					// console.log(oldId, newId)
					// check if the last one
					// if(i == previousHighlightIndex) stepEl = footsteps[footsteps.length-1]
					// else stepEl = step

					stepEl = step;
					// console.log(stepEl)

					dir = id.indexOf(current) > -1 ? _AppConstants2['default'].FORWARD : _AppConstants2['default'].BACKWARD;
					previousHighlightIndex = i;
				}
			};

			scope.highlightDots(oldHash, newHash);

			// currentPaths = dom.select.all('path', stepEl)
			// fillLine = currentPaths[0]
			// // dashedLine = currentPaths[0]

			// // choose path depends of footstep direction
			// // if(dir == AppConstants.FORWARD) {
			// // 	fillLine = currentPaths[0]
			// // 	currentPaths[1].style.opacity = 0
			// // }else{
			// // 	fillLine = currentPaths[1]
			// // 	currentPaths[0].style.opacity = 0
			// // }

			// stepEl.style.opacity = 1

			// // find total length of shape
			// stepTotalLen = fillLine.getTotalLength()
			// fillLine.style['stroke-dashoffset'] = stepTotalLen
			// fillLine.style['stroke-dasharray'] = 0

			// // start animation of dashed line
			// // dom.classes.add(dashedLine, 'animate')

			// // start animation
			// dom.classes.add(fillLine, 'animate')
		},
		resetHighlight: function resetHighlight() {
			setTimeout(function () {
				// stepEl.style.opacity = 0
				// currentPaths[0].style.opacity = 1
				// currentPaths[1].style.opacity = 1
				// dom.classes.remove(fillLine, 'animate')
				// dom.classes.remove(dashedLine, 'animate')
				for (var i = 0; i < selectedDots.length; i++) {
					var dot = selectedDots[i];
					_domHand2['default'].classes.remove(dot, 'animate');
				};
			}, 0);
		},
		updateProgress: function updateProgress(progress) {
			// if(fillLine == undefined) return
			var dashOffset = progress / 1 * stepTotalLen;
			// fillLine.style['stroke-dashoffset'] = stepTotalLen - dashOffset
			// fillLine.style['stroke-dasharray'] = dashOffset
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
	var size, position, resizeVideoVars, resizeImageVars;
	var img;
	var isMouseEnter = false;

	var onMouseEnter = function onMouseEnter(e) {
		e.preventDefault();
		isMouseEnter = true;
		_AppActions2['default'].cellMouseEnter(nameParts);
		if (mVideo.isLoaded) {
			_domHand2['default'].classes.add(container, 'over');
			mVideo.play(0);
		} else {
			mVideo.load(videoUrl, function () {
				if (!isMouseEnter) return;
				_domHand2['default'].classes.add(container, 'over');
				mVideo.play();
			});
		}
	};

	var onMouseLeave = function onMouseLeave(e) {
		e.preventDefault();
		isMouseEnter = false;
		_domHand2['default'].classes.remove(container, 'over');
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
		resize: function resize(s, p, rvv, riv) {

			size = s == undefined ? size : s;
			position = p == undefined ? position : p;
			resizeVideoVars = rvv == undefined ? resizeVideoVars : rvv;
			resizeImageVars = riv == undefined ? resizeImageVars : riv;

			if (!scope.isReady) return;

			container.style.width = front.style.width = size[0] + 'px';
			container.style.height = front.style.height = size[1] + 'px';
			container.style.left = front.style.left = position[0] + 'px';
			container.style.top = front.style.top = position[1] + 'px';

			img.style.width = resizeImageVars.width + 'px';
			img.style.height = resizeImageVars.height + 'px';
			img.style.left = resizeImageVars.left + 'px';
			img.style.top = resizeImageVars.top + 'px';

			mVideo.el.style.width = resizeVideoVars.width + 'px';
			mVideo.el.style.height = resizeVideoVars.height + 'px';
			mVideo.el.style.left = resizeVideoVars.left + 'px';
			mVideo.el.style.top = resizeVideoVars.top + 'px';
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
		props.data['fact-txt'] = props.data.fact['en'];

		_get(Object.getPrototypeOf(Diptyque.prototype), 'constructor', this).call(this, props);

		this.onMouseMove = this.onMouseMove.bind(this);
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this);
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this);
		this.onSelfieStickClicked = this.onSelfieStickClicked.bind(this);
		this.onMainBtnsEventHandler = this.onMainBtnsEventHandler.bind(this);
		this.onOpenFact = this.onOpenFact.bind(this);
		this.onCloseFact = this.onCloseFact.bind(this);
		this.uiTransitionInCompleted = this.uiTransitionInCompleted.bind(this);

		this.transitionInCompleted = false;
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {

			_AppStore2['default'].on(_AppConstants2['default'].OPEN_FUN_FACT, this.onOpenFact);
			_AppStore2['default'].on(_AppConstants2['default'].CLOSE_FUN_FACT, this.onCloseFact);

			this.uiInTl = new TimelineMax();

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.leftPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('shoe-bg'));
			this.rightPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('character-bg'));

			this.blurFilter = new PIXI.filters.BlurFilter();
			this.blurFilter.blurX = 0;
			this.blurFilter.blurY = 0;
			this.pxContainer.filters = [this.blurFilter];

			var imgExt = _AppStore2['default'].getImageDeviceExtension();

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character' + imgExt), this.getImageSizeById('character' + imgExt));
			this.funFact = (0, _funFactHolder2['default'])(this.pxContainer, this.element, this.mouse, this.props.data, this.props);
			this.arrowsWrapper = (0, _arrowsWrapper2['default'])(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave);
			this.selfieStick = (0, _selfieStick2['default'])(this.element, this.mouse, this.props.data);
			this.mainBtns = (0, _mainDiptyqueBtns2['default'])(this.element, this.props.data, this.mouse, this.onMainBtnsEventHandler, this.pxContainer);

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
			this.updateTimelines();
			_get(Object.getPrototypeOf(Diptyque.prototype), 'setupAnimations', this).call(this);
		}
	}, {
		key: 'willTransitionOut',
		value: function willTransitionOut() {
			var _this = this;

			this.selfieStick.ignoreOpen = true;
			if (this.funFact.isOpen) {
				this.funFact.close(true);
				setTimeout(function () {
					return _get(Object.getPrototypeOf(Diptyque.prototype), 'willTransitionOut', _this).call(_this);
				}, 100);
			} else {
				_get(Object.getPrototypeOf(Diptyque.prototype), 'willTransitionOut', this).call(this);
			}
		}
	}, {
		key: 'updateTimelines',
		value: function updateTimelines() {
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

			this.uiInTl.from(this.arrowsWrapper.left, 1, { x: -100, ease: Expo.easeOut, force3D: true }, 0.1);
			this.uiInTl.from(this.arrowsWrapper.right, 1, { x: 100, ease: Expo.easeOut, force3D: true }, 0.1);
			this.uiInTl.from(this.selfieStick.el, 1, { y: 500, ease: Back.easeOut, force3D: true }, 0.5);
			this.uiInTl.pause(0);
			this.uiInTl.eventCallback("onComplete", this.uiTransitionInCompleted);
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
			this.transitionInCompleted = true;
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

			var newBlur;
			if (this.selfieStick.isOpened) {
				newBlur = 4 + 0.5 * this.mouse.nY;
			} else {
				newBlur = 6 * Math.max(this.mouse.nY - 0.5, 0);
			}
			this.blurFilter.blurY += (newBlur - this.blurFilter.blurY) * 0.1;
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

			if (this.transitionInCompleted) {
				this.tlIn.clear();
				this.tlOut.clear();
				this.uiInTl.clear();
				this.uiInTl.eventCallback("onComplete", null);
				this.updateTimelines();
				this.tlOut.pause(0);
				this.tlIn.pause(this.tlIn.totalDuration());
				this.uiInTl.pause(this.uiInTl.totalDuration());
			}

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
			this.pxContainer.filters = [];
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
			this.blurFilter = null;
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
			this.tlIn.from(this.bottomTexts.el, 1, { x: windowW * 0.4, ease: Expo.easeInOut, force3D: true }, 0.4);

			_get(Object.getPrototypeOf(Home.prototype), 'setupAnimations', this).call(this);
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			this.bottomTexts.openTxtById('generic');
			_get(Object.getPrototypeOf(Home.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'willTransitionIn',
		value: function willTransitionIn() {
			var _this = this;

			setTimeout(function () {
				return _domHand2['default'].classes.add(_this.map.el, 'green-mode');
			}, 1000);
			_get(Object.getPrototypeOf(Home.prototype), 'willTransitionIn', this).call(this);
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
			_domHand2['default'].classes.remove(this.map.el, 'green-mode');
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

		if (scope.ignoreOpen) return;

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
		ignoreOpen: false,
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
				animation.fposition.y -= (mouse.nY - 0.5) * (mouse.nY * 60);
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
			colorifier.style.left = (screenHolderSize[0] >> 1) - colorifierSize[0] * 0.575 + 'px';
			colorifier.style.top = -0.7 + 'px';

			animation.iposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1);
			animation.iposition.y = windowH - videoHolderSize[1] * 0.35;
			animation.position.x = animation.iposition.x;
			animation.position.y = animation.iposition.y;

			if (el.style.opacity != 1) {
				setTimeout(function () {
					el.style.opacity = 1;
				}, 500);
			}
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/text-btn.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _TextBtn_hbs = require('./../partials/TextBtn.hbs');

var _TextBtn_hbs2 = _interopRequireDefault(_TextBtn_hbs);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

exports['default'] = function (container) {

	var scope;

	var title = container.innerHTML.toUpperCase();
	var btnScope = { title: title };
	var template = (0, _TextBtn_hbs2['default'])(btnScope);
	container.innerHTML = template;
	var textTitle = _domHand2['default'].select('.text-title', container);
	var size = _domHand2['default'].size(textTitle);
	var currentTl, tlLeft, tlRight;
	var rectContainers = _domHand2['default'].select.all('.rects-container', container);
	var bgLinesLeft = _domHand2['default'].select.all('.bg-line', rectContainers[0]);
	var bgBoxLeft = _domHand2['default'].select('.bg-box', rectContainers[0]);
	var bgLinesRight = _domHand2['default'].select.all('.bg-line', rectContainers[1]);
	var bgBoxRight = _domHand2['default'].select('.bg-box', rectContainers[1]);
	var isActivated = false;

	var tweenIn = function tweenIn(direction) {
		if (direction == _AppConstants2['default'].LEFT) {
			currentTl = tlLeft;
			tlLeft.timeScale(2).tweenFromTo(0, 'in');
		} else {
			currentTl = tlRight;
			tlRight.timeScale(2).tweenFromTo(0, 'in');
		}
	};
	var tweenOut = function tweenOut() {
		currentTl.timeScale(2.6).tweenTo('out');
	};

	var mouseEnter = function mouseEnter(e) {
		e.preventDefault();
		if (isActivated) return;
		var rect = e.currentTarget.getBoundingClientRect();
		var xMousePos = e.clientX;
		var xPos = xMousePos - rect.left;
		var w = rect.right - rect.left;
		if (xPos > w / 2) {
			tweenIn(_AppConstants2['default'].RIGHT);
		} else {
			tweenIn(_AppConstants2['default'].LEFT);
		}
	};
	var mouseLeave = function mouseLeave(e) {
		e.preventDefault();
		if (isActivated) return;
		tweenOut();
	};
	var activate = function activate() {
		isActivated = true;
		currentTl.timeScale(3).tweenTo('in');
	};
	var disactivate = function disactivate() {
		isActivated = false;
		tlLeft.timeScale(3).tweenTo('out');
		tlRight.timeScale(3).tweenTo('out');
	};

	_domHand2['default'].event.on(container, 'mouseenter', mouseEnter);
	_domHand2['default'].event.on(container, 'mouseleave', mouseLeave);

	var offsetX = 26;
	tlLeft = new TimelineMax();
	tlLeft.fromTo(bgLinesLeft[0], 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0);
	tlLeft.fromTo(bgBoxLeft, 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.2);
	tlLeft.fromTo(bgLinesLeft[1], 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.4);
	tlLeft.to(bgLinesLeft[0], 1, { x: '105%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.5);
	tlLeft.to(bgBoxLeft, 1, { x: '105%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.6);
	tlLeft.addLabel('in');
	tlLeft.to(bgLinesLeft[1], 1, { x: '105%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 'in');
	tlLeft.addLabel('out');
	tlLeft.pause(0);

	tlRight = new TimelineMax();
	tlRight.fromTo(bgLinesRight[0], 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0);
	tlRight.fromTo(bgBoxRight, 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.2);
	tlRight.fromTo(bgLinesRight[1], 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.4);
	tlRight.to(bgLinesRight[0], 1, { x: '-105%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.5);
	tlRight.to(bgBoxRight, 1, { x: '-105%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.6);
	tlRight.addLabel('in');
	tlRight.to(bgLinesRight[1], 1, { x: '-105%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 'in');
	tlRight.addLabel('out');
	tlRight.pause(0);

	scope = {
		size: size,
		el: container,
		activate: activate,
		disactivate: disactivate,
		clear: function clear() {
			tlLeft.clear();
			tlRight.clear();
			_domHand2['default'].event.off(container, 'mouseenter', mouseEnter);
			_domHand2['default'].event.off(container, 'mouseleave', mouseLeave);
			tlLeft = null;
			tlRight = null;
			currentTl = null;
			rectContainers = null;
			bgLinesLeft = null;
			bgLinesRight = null;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/TextBtn.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/TextBtn.hbs","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js":[function(require,module,exports){
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
	APP_START: 'APP_START',

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
	HOME_IMAGE_SIZE: [360, 360],

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
    + "\n			</div>\n		</div>\n		<div class=\"cursor-cross\">\n			<svg width=\"100%\" viewBox=\"0 0 14.105 13.828\">\n				<polygon fill=\"#ffffff\" points=\"13.946,0.838 13.283,0.156 7.035,6.25 0.839,0.156 0.173,0.834 6.37,6.931 0.159,12.99 0.823,13.671 7.07,7.578 13.266,13.671 13.932,12.994 7.736,6.896 \"/>\n			</svg>\n		</div>\n	</div>\n\n	<div class=\"main-btns-wrapper\">\n		<div id='shop-btn' class='main-btn'></div>\n		<div id='fun-fact-btn' class='main-btn'></div>\n	</div>\n\n	<div class=\"selfie-stick-wrapper\">\n		<div class=\"screen-wrapper\">\n			<div class=\"colorifier\">\n				<svg width=\"100%\" viewBox=\"0 0 100 22\">\n					<path d=\"M4.6,1.25c0.001,0,0.045-0.006,0.08,0h0.032c1.212,0.003,36.706-1,36.706-1l25.471,0.549c0.086,0.002,0.172,0.007,0.258,0.017l1.486,0.166C68.711,0.989,68.773,1,68.836,1.036l0.324,0.199c0.052,0.032,0.11,0.049,0.171,0.05l27.043,0.469c0,0,2.624-0.077,2.624,2.933l-0.692,7.96c-0.045,0.518-0.479,0.916-0.999,0.916h-6.203c-0.328,0-0.653,0.034-0.975,0.1c-0.853,0.175-2.83,0.528-5.263,0.618c-0.342,0.014-0.661,0.181-0.872,0.451l-0.5,0.645l-0.28,0.358c-0.374,0.482-0.647,1.034-0.789,1.628c-0.32,1.345-1.398,3.952-4.924,3.958c-3.974,0.005-7.685-0.113-10.612-0.225c-1.189-0.044-2.96,0.229-2.855-1.629l0.36-5.94c0.014-0.219-0.157-0.404-0.376-0.409L29.62,12.488c-0.214-0.004-0.428,0.001-0.641,0.015l-1.753,0.113c-0.208,0.013-0.407,0.085-0.574,0.21c-0.557,0.411-1.897,1.392-2.667,1.859c-0.701,0.426-1.539,1.042-1.968,1.364c-0.183,0.137-0.309,0.335-0.358,0.558l-0.317,1.425c-0.044,0.202-0.004,0.413,0.113,0.583l0.613,0.896c0.212,0.311,0.297,0.699,0.188,1.059c-0.115,0.378-0.444,0.755-1.292,0.755h-7.957c-0.425,0-0.848-0.04-1.266-0.12c-2.543-0.486-10.846-2.661-10.846-10.36C0.896,3.375,4.459,1.25,4.6,1.25\"/>\n				</svg>\n			</div>\n			<div class=\"screen-holder\"></div>\n			<div class=\"video-holder\"></div>\n		</div>\n		<div class=\"background\"></div>\n	</div>\n\n	<div class=\"arrows-wrapper\">\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['previous-page'] || (depth0 != null ? depth0['previous-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-page","hash":{},"data":data}) : helper)))
    + "\" id='left' class=\"arrow left\">\n			\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"7.627,0.831 8.307,1.529 1.952,7.727 8.293,13.965 7.61,14.658 0.561,7.724 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
    + alias3(((helper = (helper = helpers['previous-preview-url'] || (depth0 != null ? depth0['previous-preview-url'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-preview-url","hash":{},"data":data}) : helper)))
    + ")\"></div>\n\n		</a>\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['next-page'] || (depth0 != null ? depth0['next-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"next-page","hash":{},"data":data}) : helper)))
    + "\" id='right' class=\"arrow right\">\n\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"1.24,14.658 0.561,13.96 6.915,7.762 0.575,1.525 1.257,0.831 8.307,7.765 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
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
    + "		</div>\n		<div class=\"icons-wrapper\">\n			<ul class='left'>\n				<li>\n					<svg width=\"100%\" id='icon' viewBox=\"0.083 -0.016 22.953 23.783\"><path fill=\"#00EB76\" d=\"M11.56,23.509c-6.19,0-11.227-5.219-11.227-11.633S5.37,0.243,11.56,0.243c6.19,0,11.226,5.219,11.226,11.633S17.75,23.509,11.56,23.509z M11.56,1.613c-5.436,0-9.857,4.604-9.857,10.263s4.421,10.263,9.857,10.263c5.435,0,9.856-4.604,9.856-10.263S16.995,1.613,11.56,1.613z M9.074,11.687c-0.99,0-1.441-1.704-1.441-3.287c0-1.583,0.452-3.288,1.441-3.288c0.991,0,1.442,1.705,1.442,3.288C10.516,9.983,10.064,11.687,9.074,11.687z M14.097,11.687c-0.99,0-1.441-1.704-1.441-3.287c0-1.583,0.451-3.288,1.441-3.288c0.991,0,1.441,1.705,1.441,3.288C15.538,9.983,15.088,11.687,14.097,11.687z M17.629,12.746c-0.006,0.187-0.503,5.763-6.22,5.763c-5.716,0-6.07-5.619-6.073-5.69c0.085,0.008,0.17,0.022,0.254,0.043c0.133,0.032,0.271-0.042,0.308-0.182c0.035-0.133-0.042-0.288-0.175-0.32c-0.505-0.121-1.107-0.089-1.526,0.265C4.091,12.713,4.11,12.9,4.199,12.991c0.105,0.107,0.248,0.088,0.354-0.002c-0.101,0.085,0.198-0.098,0.222-0.105c0.001-0.001,0.002-0.002,0.004-0.002c0.083,1.782,0.933,3.448,2.266,4.576c1.48,1.252,3.439,1.804,5.329,1.555c1.858-0.243,3.572-1.233,4.684-2.809c0.69-0.978,1.085-2.167,1.129-3.378c0.012,0.005,0.439,0.202,0.543,0.094c0.089-0.094,0.104-0.277-0.002-0.367c-0.417-0.353-1.021-0.383-1.523-0.263c-0.315,0.076-0.184,0.577,0.13,0.502C17.436,12.768,17.533,12.752,17.629,12.746z\"/></svg>\n				</li>\n				<li>\n					<svg width=\"100%\" id='icon' viewBox=\"0 0.309 23 23.857\"><path id=\"Shape\" fill=\"#00EB76\" d=\"M11.5,0.568c-6.213,0-11.25,5.225-11.25,11.669c0,6.444,5.037,11.669,11.25,11.669c6.214,0,11.25-5.225,11.25-11.669C22.75,5.792,17.714,0.568,11.5,0.568L11.5,0.568z M11.5,19.622c-0.973,0-1.758-0.816-1.758-1.824c0-1.007,0.785-1.822,1.758-1.822c0.97,0,1.758,0.815,1.758,1.822C13.258,18.806,12.47,19.622,11.5,19.622L11.5,19.622z M11.852,12.237c-2.719,0-4.922,2.286-4.922,5.105c0,2.778,2.143,5.026,4.804,5.093c-0.08,0.002-0.154,0.013-0.233,0.013c-5.43,0-9.844-4.581-9.844-10.211S6.07,2.026,11.5,2.026c0.236,0,1.338,0.106,1.36,0.109c2.231,0.484,3.913,2.537,3.913,4.997C16.773,9.951,14.567,12.237,11.852,12.237L11.852,12.237z M9.742,6.676c0,1.007,0.785,1.824,1.758,1.824c0.97,0,1.758-0.816,1.758-1.824c0-1.007-0.788-1.823-1.758-1.823C10.527,4.853,9.742,5.669,9.742,6.676z\"/></svg>\n				</li>\n				<li>\n					<svg width=\"100%\" id='icon' viewBox=\"1.25 -0.741 22.5 23.338\"><path fill=\"#00EB76\" d=\"M14.651,22.147L14.651,22.147c-4.635-0.001-8.782-3.037-10.32-7.555c-2-5.875,0.989-12.344,6.663-14.422c1.13-0.414,2.305-0.632,3.494-0.648c0.378,0,0.716,0.215,0.873,0.549c0.155,0.337,0.111,0.723-0.115,1.01c-0.196,0.252-0.383,0.517-0.557,0.788c-1.798,2.796-2.211,6.215-1.135,9.379c1.075,3.156,3.458,5.542,6.538,6.544c0.298,0.098,0.604,0.182,0.91,0.25c0.356,0.078,0.642,0.363,0.723,0.728c0.082,0.355-0.044,0.725-0.328,0.958c-0.934,0.761-1.979,1.356-3.109,1.771C17.112,21.929,15.888,22.147,14.651,22.147z M13.649,0.949c-0.739,0.081-1.472,0.252-2.183,0.512C6.489,3.284,3.872,8.976,5.633,14.149c1.348,3.961,4.973,6.623,9.018,6.623h0.001c1.075,0,2.14-0.19,3.164-0.565c0.725-0.266,1.41-0.616,2.045-1.047c-0.065-0.02-0.13-0.04-0.193-0.062c-3.495-1.137-6.197-3.837-7.413-7.407c-1.213-3.563-0.746-7.415,1.279-10.566C13.571,1.066,13.609,1.008,13.649,0.949z\"/></svg>\n				</li>\n			</ul>\n			<ul class='right'>\n				<li>\n					<a target=\"_blank\" href=\""
    + alias3(((helper = (helper = helpers.shopUrl || (depth0 != null ? depth0.shopUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"shopUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg width=\"100%\" viewBox=\"1.25 -0.741 22.5 23.338\"><path fill=\"#00EB76\" d=\"M23.242,10.438L13.01-0.176c-0.26-0.269-0.68-0.269-0.939,0L1.839,10.438c-0.259,0.269-0.259,0.705,0,0.974L12.07,22.025c0.26,0.27,0.68,0.27,0.939,0l10.232-10.614C23.502,11.143,23.502,10.707,23.242,10.438L23.242,10.438z M14.299,10.306c-0.061,0.134-0.182,0.214-0.324,0.211c-0.143-0.003-0.26-0.088-0.314-0.224l-0.514-1.292c0,0-0.461,0.227-0.922,0.534c-1.512,0.909-1.42,2.335-1.42,2.335v4.17H8.728V11.75c0,0,0.119-2.458,2.075-3.674c0.572-0.363,0.801-0.521,1.229-0.777l-0.873-1.058c-0.096-0.108-0.119-0.255-0.062-0.391c0.055-0.135,0.176-0.216,0.32-0.216l4.938,0.014L14.299,10.306L14.299,10.306z\"/></svg>\n					</a>\n				</li>\n			</ul>\n		</div>\n		<div class=\"comments-wrapper\">\n";
  stack1 = ((helper = (helper = helpers.comments || (depth0 != null ? depth0.comments : depth0)) != null ? helper : alias1),(options={"name":"comments","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
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

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1['is-shop'] : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1['is-shop'] : stack1),{"name":"if","hash":{},"fn":this.noop,"inverse":this.program(7, data, 0),"data":data})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression;

  return "					<a target=\"_blank\" href=\""
    + alias1(((helper = (helper = helpers.shopUrl || (depth0 != null ? depth0.shopUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"shopUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<div class='image-wrapper'>\n							<img src=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1.url : stack1), depth0))
    + "\">\n						</div>\n					</a>\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "					<div class='image-wrapper'>\n						<img src=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1.url : stack1), depth0))
    + "\">\n					</div>\n";
},"9":function(depth0,helpers,partials,data) {
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
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div>\n	\n	<header id=\"header\">\n			<a href=\"#\" class=\"logo\">\n				<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n			</a>\n			<div class=\"map-btn\"><a href=\"#\" class=\"text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.map_txt : stack1), depth0))
    + "</a></div>\n			<div class=\"camper-lab\"><a target=\"_blank\" href=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.general : depth0)) != null ? stack1.lab_url : stack1), depth0))
    + "\" class=\"text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.camper_lab : stack1), depth0))
    + "</a></div>\n			<div class=\"shop-wrapper btn\">\n				<div class=\"relative\">\n					<div class=\"shop-title text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
    + "</div>\n					<ul class=\"submenu-wrapper\">\n						<li class=\"sub-0\"><a target=\"_blank\" href='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.general : depth0)) != null ? stack1.men_shop_url : stack1), depth0))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_men : stack1), depth0))
    + "</a></li>\n						<li class=\"sub-1\"><a target=\"_blank\" href='"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.general : depth0)) != null ? stack1.women_shop_url : stack1), depth0))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_women : stack1), depth0))
    + "</a></li>\n					</ul>\n				</div>\n			</div>\n		</header>\n\n</div>";
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
  return buffer + "		</div>\n	</div>\n	<div class=\"bottom-texts-container\">\n\n		<div class=\"titles-wrapper\">\n			<ul>\n				<li id='deia' class=\"text-btn\">DEIA</li>\n				<li id='es-trenc' class=\"text-btn\">ES TRENC</li>\n				<li id='arelluf' class=\"text-btn\">ARELLUF</li>\n			</ul>\n		</div>\n\n		<div class=\"texts-wrapper\">\n			<div class='txt' id=\"generic\">"
    + ((stack1 = ((helper = (helper = helpers.generic || (depth0 != null ? depth0.generic : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"generic","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"deia\">"
    + ((stack1 = ((helper = (helper = helpers['deia-txt'] || (depth0 != null ? depth0['deia-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"deia-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"es-trenc\">"
    + ((stack1 = ((helper = (helper = helpers['es-trenc-txt'] || (depth0 != null ? depth0['es-trenc-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"es-trenc-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class='txt' id=\"arelluf\">"
    + ((stack1 = ((helper = (helper = helpers['arelluf-txt'] || (depth0 != null ? depth0['arelluf-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"arelluf-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n		</div>\n\n		<div id=\"social-wrapper\">\n			<ul>\n				<li class='instagram'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.instagramUrl || (depth0 != null ? depth0.instagramUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"instagramUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M16.107,15.562c0,0.302-0.243,0.547-0.543,0.547H2.438c-0.302,0-0.547-0.245-0.547-0.547V7.359h2.188c-0.285,0.41-0.381,1.175-0.381,1.661c0,2.929,2.388,5.312,5.323,5.312c2.935,0,5.322-2.383,5.322-5.312c0-0.486-0.066-1.24-0.42-1.661h2.186V15.562L16.107,15.562z M9.02,5.663c1.856,0,3.365,1.504,3.365,3.358c0,1.854-1.509,3.357-3.365,3.357c-1.857,0-3.365-1.504-3.365-3.357C5.655,7.167,7.163,5.663,9.02,5.663L9.02,5.663z M12.828,2.984c0-0.301,0.244-0.546,0.545-0.546h1.643c0.3,0,0.549,0.245,0.549,0.546v1.641c0,0.302-0.249,0.547-0.549,0.547h-1.643c-0.301,0-0.545-0.245-0.545-0.547V2.984L12.828,2.984z M15.669,0.25H2.33c-1.148,0-2.08,0.929-2.08,2.076v13.349c0,1.146,0.932,2.075,2.08,2.075h13.339c1.15,0,2.081-0.93,2.081-2.075V2.326C17.75,1.179,16.819,0.25,15.669,0.25L15.669,0.25z\"/>\n					</a>\n				</li>\n				<li class='twitter'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.twitterUrl || (depth0 != null ? depth0.twitterUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"twitterUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 22 18\" enable-background=\"new 0 0 22 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M21.176,0.514c-0.854,0.509-1.799,0.879-2.808,1.079c-0.805-0.865-1.953-1.405-3.226-1.405c-2.438,0-4.417,1.992-4.417,4.449c0,0.349,0.038,0.688,0.114,1.013C7.166,5.464,3.91,3.695,1.729,1c-0.38,0.66-0.598,1.425-0.598,2.24c0,1.543,0.78,2.904,1.966,3.704C2.374,6.92,1.691,6.718,1.094,6.388v0.054c0,2.157,1.523,3.957,3.547,4.363c-0.371,0.104-0.762,0.157-1.165,0.157c-0.285,0-0.563-0.027-0.833-0.08c0.563,1.767,2.194,3.054,4.128,3.089c-1.512,1.194-3.418,1.906-5.489,1.906c-0.356,0-0.709-0.021-1.055-0.062c1.956,1.261,4.28,1.997,6.775,1.997c8.131,0,12.574-6.778,12.574-12.659c0-0.193-0.004-0.387-0.012-0.577c0.864-0.627,1.613-1.411,2.204-2.303c-0.791,0.354-1.644,0.593-2.537,0.701C20.146,2.424,20.847,1.553,21.176,0.514\"/>\n					</a>\n				</li>\n				<li class='facebook'>\n					<a target=\"_blank\" href=\""
    + alias4(((helper = (helper = helpers.facebookUrl || (depth0 != null ? depth0.facebookUrl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"facebookUrl","hash":{},"data":data}) : helper)))
    + "\">\n						<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M17.719,16.756c0,0.531-0.431,0.963-0.962,0.963h-4.443v-6.753h2.267l0.338-2.631h-2.604V6.654c0-0.762,0.211-1.281,1.304-1.281l1.394,0V3.019c-0.241-0.032-1.068-0.104-2.031-0.104c-2.009,0-3.385,1.227-3.385,3.479v1.941H7.322v2.631h2.272v6.753H1.243c-0.531,0-0.962-0.432-0.962-0.963V1.243c0-0.531,0.431-0.962,0.962-0.962h15.514c0.531,0,0.962,0.431,0.962,0.962V16.756\"/>\n					</a>\n				</li>\n			</ul>\n		</div>\n\n		<div class=\"inner-mask-background\">\n			<div></div>\n			<div></div>\n		</div>\n		<div class=\"inner-background\"></div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n	</div>\n\n	<div class=\"map-wrapper\"></div>	\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Index.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "	<div class=\"block\">\n		<img src=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.media : depth0)) != null ? stack1.url : stack1), depth0))
    + "\">\n	</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.index : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"titles-wrapper\">\n	<div class=\"deia\">DEIA</div>\n	<div class=\"es-trenc\">ES TRENC</div>\n	<div class=\"arelluf\">ARELLUF</div>\n</div>\n\n<svg width=\"100%\" viewBox=\"-67 0 760 645\">\n	\n	<path id=\"map-bg\" stroke=\"#FFFFFF\" stroke-width=\"2\" fill=\"#ffffff\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n	\n	<text x=\"364\" y=\"242\">A VISION OF</text>\n	<g id='mallorca-logo' transform=\"translate(300, 258)\"><path fill=\"#1eea79\" d=\"M87.884,1.001c-0.798,0.294-17.53,13.617-37.763,40.758c-5.892,8.472-9.319,14.607-6.895,15.53c2.239,0.838,4.49,1.636,6.75,2.396c0.617,0.207,0.942,0.231,1.182-0.186c0.557-1.071,1.02-7.933,4.357-13.306c4.809-7.73,11.214-7.384,14.873-6.612c1.808,0.397,2.969,2.006,1.463,5.342c-3.764,8.489-10.8,14.884-11.856,16.875c-0.537,1.09,0.965,1.269,1.397,1.386c1.794,0.498,3.595,0.973,5.398,1.425c1.439,0.361,2.761,2.927,10.788-17.359C90.83,11.637,88.539,0.857,87.884,1.001z M75.532,29.835c-3.243-0.57-7.874,0.491-8.566,0.324c-0.451-0.1-0.426-0.641,0.066-1.467c3.137-4.913,13.042-15.486,14.604-15.42c1.115,0.073-1.018,9.869-3.069,14.477C77.604,29.807,76.834,30.073,75.532,29.835z M98.739,68.951c-0.312,1.622-1.769,1.056-2.36,0.988c-6.699-0.752-13.365-1.799-19.979-3.149c-2.642-0.382-0.879-2.917,4.602-18.571c3.99-10.203,18.572-45.671,19.141-45.754c1.483,0.044,2.968,0.088,4.451,0.132c0.196,0.005,0.487,0.175,0.101,1.605c-0.287,1.813-8.796,18.592-15.883,40.115c-3.437,10.804-1.474,13.858,1.073,14.221c4.291,0.616,8.361-5.968,9.416-5.864C100.06,52.746,98.76,68.537,98.739,68.951z M125.874,70.104c-0.026,1.637-1.564,1.252-2.161,1.254c-6.75,0.049-13.496-0.194-20.215-0.735c-2.656-0.055-1.371-2.84,1.266-19.352c2.124-10.848,10.242-48.339,10.802-48.355c1.483,0.043,2.967,0.083,4.451,0.125c0.196,0.006,0.517,0.179,0.385,1.653c0.031,1.817-5.439,19.313-8.64,41.844c-1.489,11.277,0.977,14.13,3.55,14.212c4.335,0.133,7.208-6.848,8.27-6.842C124.346,53.915,125.823,69.701,125.874,70.104z M137.079,2.277c-4.592-0.223-8.78,23.183-9.392,44.239c-0.239,14.117,3.586,26.076,13.939,25.24c1.67-0.142,3.339-0.302,5.008-0.479c10.334-1.208,11.75-13.268,8.699-26.573C150.542,24.978,141.677,2.614,137.079,2.277z M142.675,57.229c-4.864,0.391-7.912-3.161-8.294-12.669c-0.618-17.988,2.042-29.276,4.024-29.269c1.981,0.029,6.912,10.986,9.903,28.391C149.837,52.908,147.537,56.824,142.675,57.229z M172.615,33.994c-0.75-2.012,3.379-6.399-2.047-17.234c-2.852-5.767-7.591-12.702-12.671-12.868c-2.469-0.039-4.939-0.082-7.409-0.128c-0.488-0.005-2.159-1.466,6.968,36.481c6.962,28.793,8.14,27.042,9.366,26.806c1.904-0.369,3.806-0.76,5.703-1.174c0.488-0.106,1.836-0.011,1.428-1.271c-0.205-0.496-5.167-10.32-6.865-16.02c-1.248-4.196,0.768-7.719,1.958-7.919c2.188-0.287,11.339,13.509,14.779,21.428c0.463,1.138,1.886,0.513,2.759,0.264c1.828-0.515,3.652-1.054,5.471-1.615c1.014-0.311,1.14-0.511,0.769-1.253C184.54,43.788,173.257,36.133,172.615,33.994z M163.047,32.429c-1.137,0.146-2.083-2.842-2.562-4.411c-3.939-12.948-3.467-15.445-0.68-15.546c1.653-0.06,4.131,1.495,5.981,5.957C168.639,24.872,164.461,32.217,163.047,32.429z M212.462,37.072c7.293,7.791,6.122,14.986-0.657,17.809c-11.172,4.633-23.415-7.799-30.156-21.471c-7.205-14.782-11.936-30.709-5.689-30.193c2.352,0.097,7.79,2.205,13.103,7.905c2.824,3.096,3.107,5.102,1.016,5.459c-1.327,0.189-3.905-5.323-7.809-4.971c-4.348,0.26-0.58,9.946,4.146,18c7.198,12.336,15.941,15.36,19.8,13.89c7.153-2.697,0.669-10.89,1.022-10.97C207.784,32.355,211.974,36.541,212.462,37.072z M239.422,23.489C209.694,9.329,193.988,3.845,193.291,3.493c-0.836-0.53,1.381,9.166,21.855,32.466c6.462,6.777,11.587,11.17,13.958,9.976c2.19-1.09,4.366-2.215,6.528-3.372c0.591-0.317,0.807-0.509,0.479-0.782c-0.855-0.629-8.328-3.118-12.492-6.948c-6-5.509-1.29-8.367,2.162-9.847c1.713-0.721,4.361-0.8,7.072,0.875c6.914,4.179,9.533,9.94,11.117,11.135c0.875,0.604,1.992-0.285,2.39-0.526c1.656-0.997,3.304-2.014,4.942-3.052C252.611,32.604,256.22,32.191,239.422,23.489z M218.204,19.43c-3.098,1.038-5.165,3.33-5.839,3.564c-0.437,0.144-1.069-0.103-1.715-0.666c-3.793-3.602-9.015-11.559-7.475-11.638c1.106-0.069,11.122,4.567,14.875,6.842C219.716,18.608,219.447,19.002,218.204,19.43z M53.062,31.961C35.458,55.825,34.91,53.996,33.756,53.504c-1.975-0.843-3.942-1.719-5.897-2.623c-0.551-0.252-1.807-0.598-0.872-1.647c0.789-0.739,12.531-10.264,25.624-26.005c1.065-1.252,7.374-8.602,6.308-8.791c-0.914-0.141-7.368,5.298-9.016,6.54c-13.956,10.691-17.966,16.11-20.648,14.998c-3.374-1.449,2.999-6.173,11.668-17.603c0.91-1.242,5.738-6.506,4.77-6.691c-1.048-0.222-8.439,5.527-9.704,6.515C20.147,30.25,12.102,40.352,11.343,41.127c-1.062,0.881-1.949,0.118-2.477-0.193c-1.573-0.926-3.137-1.873-4.692-2.84c-1.087-0.67-3.621-0.762,19.961-16.68C55.233,0.499,55.469,1.151,55.952,1.179c0.857,0.021,1.713,0.044,2.57,0.067c1.104,0.05,1.438-0.022-1.017,3.473c-4.623,6.894-8.271,11.144-7.653,11.237C50.293,16,54.759,12.398,64.75,5.362c5.195-3.799,5.493-3.812,6.603-3.758c0.728,0.021,1.454,0.042,2.182,0.062C74.02,1.69,76.217,0.487,53.062,31.961z\"/></g>\n\n	<g id=\"footsteps\">\n		<g id=\"dub-mateo\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n		</g>\n		<g id=\"mateo-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M231.75,144.5c6.688-0.854,51.5,0.75,57.569,30.704c5.181,20.296,17.899,26.807,20.313,27.723c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.757,3.419-13.769,9.224-20.515,10.134c-6.744,0.908-17.723-5.029-24.945-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647C361,225.75,343.75,271,331.75,277.5c-26,17-52,13.75-82.215-6.224c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.516-8.09-1.992-15.766,4.008-17.766\"/>	\n		</g>\n		<g id=\"marta-beluga\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n		</g>\n		<g id=\"beluga-isamu\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n		</g>\n		<g id=\"isamu-capas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n		</g>\n		<g id=\"capas-pelotas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n		</g>\n		<g id=\"pelotas-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n		</g>\n		<g id=\"marta-kobarah\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n		</g>\n		<g id=\"kobarah-dub\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n		</g>\n		<g id=\"dub-paradise\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n		</g>\n		<g id=\"return-to-begin\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" stroke-dasharray=\"7.0195,7.0195\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n		</g>\n	</g>\n\n	<g id=\"map-dots\">\n		<g id=\"deia\">\n			<g transform=\"translate(210, 170)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(240, 146)\"><circle id=\"mateo\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(260, 214)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"es-trenc\">\n			<g transform=\"translate(426, 478)\"><circle id=\"isamu\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(400, 446)\"><circle id=\"beluga\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"arelluf\">\n			<g transform=\"translate(121, 364)\"><circle id=\"capas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(126, 340)\"><circle id=\"pelotas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(137, 318)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 326)\"><circle id=\"kobarah\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 300)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(80, 315)\"><circle id=\"paradise\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n	</g>\n\n</svg>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=this.lambda;

  return "<div>\n	<header>\n		<a href=\"http://www.camper.com/\" target=\"_blank\" class=\"logo\">\n			<svg width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n		</a>\n	</header>\n	\n	<div class=\"main-container\">\n		<div class=\"feed\">\n			<div class=\"logo\">\n				<svg width=\"100%\" viewBox=\"0 0 162 47\"> \n					<text x=\"42\" y=\"-4\">A VISION OF</text>\n					<path fill=\"#000000\" d=\"M42.582,18.239c-0.31,0.52-0.325,0.859-0.042,0.922c0.435,0.105,3.346-0.562,5.384-0.204c0.818,0.149,1.302-0.018,1.907-1.311c1.29-2.894,2.63-9.045,1.929-9.091C50.779,8.514,44.554,15.154,42.582,18.239 M39.036,39.9c-0.271-0.075-1.215-0.187-0.878-0.872c0.665-1.249,5.086-5.266,7.452-10.598c0.947-2.094,0.217-3.104-0.919-3.354c-2.299-0.485-6.324-0.702-9.348,4.153c-2.097,3.374-2.388,7.682-2.738,8.354c-0.15,0.264-0.354,0.247-0.742,0.117c-1.421-0.478-2.836-0.979-4.244-1.504c-1.523-0.58,0.631-4.433,4.334-9.753C44.669,9.401,55.185,1.034,55.687,0.85c0.412-0.091,1.853,6.679-6.478,29.044c-5.044,12.738-5.876,11.127-6.78,10.901C41.295,40.511,40.164,40.213,39.036,39.9 M48.469,42.165c-1.66-0.24-0.552-1.833,2.892-11.664c2.508-6.407,11.673-28.681,12.03-28.733c0.933,0.028,1.865,0.056,2.797,0.083c0.123,0.003,0.307,0.109,0.063,1.008c-0.181,1.139-5.528,11.675-9.983,25.192c-2.16,6.785-0.926,8.703,0.675,8.932c2.696,0.386,5.255-3.748,5.917-3.683c0.478,0.045-0.339,9.961-0.353,10.222c-0.196,1.019-1.112,0.663-1.483,0.619C56.816,43.67,52.625,43.011,48.469,42.165 M65.5,44.571c-1.669-0.035-0.862-1.783,0.796-12.153c1.334-6.812,6.437-30.357,6.789-30.367c0.933,0.027,1.865,0.053,2.798,0.079c0.123,0.003,0.324,0.112,0.241,1.038c0.02,1.141-3.418,12.128-5.43,26.277c-0.936,7.081,0.613,8.874,2.231,8.925c2.725,0.084,4.531-4.301,5.197-4.296c0.481,0.004,1.409,9.918,1.441,10.171c-0.017,1.029-0.983,0.786-1.358,0.788C73.963,45.063,69.724,44.91,65.5,44.571 M93.663,27.652c-1.879-10.93-4.979-17.811-6.225-17.829c-1.245-0.005-2.917,7.083-2.528,18.38c0.24,5.972,2.156,8.202,5.213,7.956C93.179,35.906,94.624,33.446,93.663,27.652 M89.464,45.283c-6.507,0.524-8.912-6.985-8.761-15.852C81.087,16.21,83.72,1.51,86.605,1.65c2.891,0.212,8.462,14.256,11.473,26.645c1.918,8.355,1.028,15.929-5.467,16.688C91.562,45.093,90.514,45.193,89.464,45.283 M104.647,11.794c-1.163-2.803-2.72-3.778-3.759-3.741c-1.75,0.064-2.048,1.631,0.428,9.763c0.302,0.985,0.896,2.861,1.611,2.77C103.815,20.453,106.44,15.84,104.647,11.794 M99.69,2.665c3.191,0.104,6.17,4.459,7.963,8.081c3.41,6.804,0.814,9.56,1.286,10.823c0.404,1.343,7.495,6.15,12.702,16.011c0.233,0.468,0.155,0.593-0.483,0.789c-1.144,0.352-2.289,0.689-3.438,1.013c-0.548,0.155-1.442,0.55-1.733-0.165c-2.163-4.975-7.914-13.638-9.289-13.457c-0.748,0.126-2.015,2.339-1.23,4.973c1.067,3.58,4.185,9.749,4.314,10.061c0.256,0.792-0.591,0.731-0.898,0.797c-1.192,0.261-2.387,0.507-3.583,0.738c-0.771,0.148-1.511,1.248-5.887-16.833c-5.736-23.831-4.686-22.914-4.38-22.911C96.586,2.614,98.138,2.641,99.69,2.665 M114.617,21.202c-4.528-9.283-7.501-19.286-3.575-18.961c1.478,0.061,4.896,1.384,8.235,4.965c1.775,1.944,1.952,3.203,0.64,3.428c-0.835,0.12-2.455-3.343-4.909-3.121c-2.732,0.163-0.364,6.246,2.605,11.304c4.525,7.748,10.02,9.646,12.445,8.723c4.495-1.694,0.421-6.839,0.642-6.889c0.343-0.111,2.977,2.517,3.284,2.852c4.582,4.893,3.848,9.41-0.413,11.184C126.549,37.596,118.854,29.788,114.617,21.202 M132.845,14.243c0.405,0.354,0.803,0.507,1.078,0.418c0.424-0.147,1.722-1.586,3.669-2.238c0.782-0.269,0.95-0.516-0.097-1.192c-2.357-1.429-8.653-4.34-9.349-4.296C127.179,6.984,130.461,11.981,132.845,14.243 M155.288,23.124c-0.25,0.151-0.952,0.71-1.502,0.33c-0.995-0.75-2.642-4.368-6.987-6.993c-1.703-1.052-3.368-1.002-4.444-0.549c-2.169,0.929-5.129,2.725-1.358,6.184c2.616,2.406,7.313,3.969,7.851,4.363c0.206,0.172,0.07,0.293-0.3,0.491c-1.36,0.728-2.729,1.434-4.104,2.118c-1.49,0.75-4.711-2.009-8.771-6.264C122.802,8.17,121.409,2.081,121.935,2.414c0.438,0.221,10.309,3.665,28.992,12.558c10.559,5.465,8.29,5.724,7.467,6.236C157.364,21.859,156.329,22.498,155.288,23.124 M3.076,24.143c-0.683-0.42-2.275-0.478,12.546-10.475C35.166,0.534,35.314,0.943,35.618,0.961c0.538,0.014,1.077,0.028,1.615,0.042c0.694,0.032,0.904-0.014-0.64,2.181c-2.905,4.33-5.198,6.999-4.81,7.057c0.277,0.027,3.084-2.235,9.363-6.654c3.266-2.385,3.454-2.394,4.15-2.36c0.458,0.013,0.914,0.026,1.372,0.04c0.305,0.015,1.686-0.741-12.866,19.025C22.737,35.278,22.393,34.129,21.668,33.821c-1.242-0.531-2.478-1.08-3.708-1.647c-0.345-0.159-1.134-0.376-0.547-1.034c0.496-0.464,7.875-6.446,16.104-16.332c0.67-0.786,4.634-5.402,3.965-5.521c-0.574-0.088-4.63,3.328-5.667,4.107c-8.771,6.714-11.291,10.117-12.977,9.418c-2.121-0.91,1.884-3.877,7.333-11.054c0.571-0.78,3.606-4.086,2.998-4.201c-0.66-0.14-5.305,3.471-6.099,4.091c-9.957,7.569-15.013,13.912-15.49,14.399c-0.667,0.554-1.224,0.074-1.556-0.121C5.036,25.346,4.053,24.751,3.076,24.143\"/>\n				</svg>\n			</div>\n			<div class=\"map\">\n				<img src=\""
    + alias3(((helper = (helper = helpers.mobilemap || (depth0 != null ? depth0.mobilemap : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"mobilemap","hash":{},"data":data}) : helper)))
    + "\">\n				<p>"
    + alias3(((helper = (helper = helpers.generic || (depth0 != null ? depth0.generic : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"generic","hash":{},"data":data}) : helper)))
    + "</p>\n			</div>\n		</div>\n		<div class=\"index\">\n		</div>\n		<div class=\"bottom-part\"></div>\n	</div>\n\n	<footer>\n		\n		<ul>\n			<li id='home'>\n				<div class=\"wrapper\">"
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.home : stack1), depth0))
    + "</div>\n			</li>\n			<li id='grid'>\n				<div class=\"wrapper\">"
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.grid : stack1), depth0))
    + "</div>\n			</li>\n			<li id='com' class='com'>\n				<div class=\"wrapper\">\n					<svg width=\"100%\" viewBox=\"0 0 35 17\">\n						<path fill=\"#FFFFFF\" d=\"M17.415,11.203c6.275,0,12.009,2.093,16.394,5.547V0.232H1v16.535C5.387,13.303,11.129,11.203,17.415,11.203\"/>\n					</svg>\n				</div>\n			</li>\n			<li id='lab'>\n				<div class=\"wrapper\">"
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.lab : stack1), depth0))
    + "</div>\n			</li>\n			<li id='shop'>\n				<div class=\"wrapper\">"
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
    + "</div>\n			</li>\n		</ul>\n\n	</footer>\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"front-block\"></div>\n<div id='pages-container'>\n	<div id='page-a'></div>\n	<div id='page-b'></div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/TextBtn.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"relative\">\n	<div class=\"inside-wrapper\">\n		<div class=\"text-title\">"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</div>\n		<div class=\"rects-container\">\n			<div class=\"bg-line\"></div>\n			<div class=\"bg-box\"></div>\n			<div class=\"bg-line\"></div>\n		</div>\n		<div class=\"rects-container\">\n			<div class=\"bg-line\"></div>\n			<div class=\"bg-box\"></div>\n			<div class=\"bg-line\"></div>\n		</div>\n	</div>\n	<div class=\"background\"></div>\n</div>";
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
			return { width: content.naturalWidth, height: content.naturalHeight };
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

			// remove the analytics parameters
			var hash = window.location.hash.split('?');
			window.location.hash = hash[0];

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

var _isRetina2 = require('is-retina');

var _isRetina3 = _interopRequireDefault(_isRetina2);

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
        var filenames = ['character' + _getImageDeviceExtension() + '.png', 'character-bg.jpg', 'shoe-bg.jpg'];
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
            src: basePath + fileName + '.' + extension
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
function _getImageDeviceExtension() {
    var retina = _isRetina();
    var str = '@1x';
    if (retina == true) str = '@2x';
    return str;
}
function _isRetina() {
    return (0, _isRetina3['default'])();
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
    getImageDeviceExtension: _getImageDeviceExtension,
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

},{"./../../../../www/data/data.json":"/Users/panagiotisthomoglou/Projects/camper-ss16/www/data/data.json","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../dispatchers/AppDispatcher":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/dispatchers/AppDispatcher.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","eventemitter2":"eventemitter2","is-retina":"is-retina","object-assign":"object-assign"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/PxHelper.js":[function(require,module,exports){
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
			this.tlIn.timeScale(1.6);
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
				this.tlOut.timeScale(1.8);
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
		"men_shop_url": "http://www.camper.com/int/men/shoes/ss16_inspiration",
		"women_shop_url": "http://www.camper.com/int/women/shoes/ss16_inspiration",
		"lang": {
			"en": {
				"home": "MAP",
				"grid": "INDEX",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Shop",
				"shop_men": "Men",
				"shop_women": "Women",
				"map_txt": "MAP"
			},
			"fr": {
				"home": "MAP",
				"grid": "INDEX",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Acheter",
				"shop_men": "homme",
				"shop_women": "femme",
				"map_txt": "MAP"
			},
			"es": {
				"home": "MAP",
				"grid": "INDEX",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Comprar",
				"shop_men": "hombre",
				"shop_women": "mujer",
				"map_txt": "MAP"
			},
			"it": {
				"home": "MAP",
				"grid": "INDEX",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Acquisiti",
				"shop_men": "uomo",
				"shop_women": "donna",
				"map_txt": "MAP"
			},
			"de": {
				"home": "MAP",
				"grid": "INDEX",
				"lab": "LAB",
				"camper_lab": "Camper Lab",
				"shop_title": "Shop",
				"shop_men": "Herren",
				"shop_women": "Damen",
				"map_txt": "MAP"
			},
			"pt": {
				"home": "MAP",
				"grid": "INDEX",
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
					"person-text": "Porque esa cara de emo?? @Mateo lol!! #SelfieVideo #MallorcaByCamper"
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
					"person-text": "These shoes are the shoes Mirko would wear if he was still alive and kickin'"
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
					"person-text": "Deep blue #campershoes"
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
					"person-text": "Las flores que @mateo me regalo. #MallorcaByCamper"
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
					"person-text": "Me being me... Hehe :) #campershoes #Beluga"
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
					"person-text": "All this smoke is not what you think it is #HighonLife"
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
					"person-text": "Supernatural beauty. I love the new #me"
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
					"person-text": "Hiiii!!! :) #MallorcaByCamper"
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
					"person-text": "New colors. Same energy"
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
					"person-text": "So much fun Mallorca #MallorcaByCamper"
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
					"person-text": "Check out my molded Pelotas"
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
					"person-text": "Riders of Mallorda #campershoes"
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
					"person-text": "What happens in Arelluf stays in #Arelluf"
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
					"person-text": "No nonsense #selfie #MallorcaByCamper"
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
					"person-text": "These new Campers are Da bomb"
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
					"person-text": "After party. After life #SelfieLife #MallorcaByCamper"
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
					"person-text": "I dare you"
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
					"person-text": "Wish you were here #arelluf"
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
					"person-text": "Haters will say it's Photoshop"
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
					"person-text": "Call me Pandemonia #MallorcaByCamper"
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
					"person-text": "My new Campers are the SUV of shoes"
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
					"person-text": "Free diving excursions this afternoon at #arelluf. PM me if interested"
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
					"person-text": "Peace Y’all #MallorcaByCamper"
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
					"person-text": "Bold and Beautiful"
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
					"person-text": "Selfie on waterslide like a boss #SelfieRide"
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
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/b741eeb1737a682f5646cba17e040630a1dd018a/deia-dub.mp4",
        	"fact": {
        		"en": "Breaking up via text message. not a very deia thing to do"
        	},
        	"shop-url": "http://www.camper.com/int/men/shoes/dub_deia_ss2016",
        	"wistia-character-id": "azjc2jh62j",
        	"wistia-fun-id": "lnfvc3ag50"
        },
        "deia/mateo": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/e424889ac026f70e544af03035e7187f34941705/deia-mateo.mp4",
        	"ambient-color": {
        		"from": { "h": 37, "s": 89, "v": 83 },
        		"to": { "h": 8, "s": 86, "v": 57 },
        		"selfie-stick": { "h": 8, "s": 86, "v": 57 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/344c711238977490c0730509e73ba117f9464338/deia-mateo.mp4",
        	"fact": {
        		"en": "buys an atelier at deia. starts career as an artist"
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
        		"en": "FOMO of not being at deia"
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
        		"en": "Es Trenc nudist PARTY BOY"
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
        		"en": "Haters will say it's Photoshop"
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL21vYmlsZS1mb290ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvRGlwdHlxdWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvSG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zZWxmaWUtc3RpY2suanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc29jaWFsLWxpbmtzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3RleHQtYnRuLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3ZpZGVvLWNhbnZhcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29uc3RhbnRzL0FwcENvbnN0YW50cy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvZGlzcGF0Y2hlcnMvQXBwRGlzcGF0Y2hlci5qcyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRGlwdHlxdWUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9GZWVkLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvSW5kZXguaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9NYXAuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Nb2JpbGUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9QYWdlc0NvbnRhaW5lci5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL1RleHRCdG4uaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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TSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDbkMsS0FBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFBLElBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQTtBQUM5RCxLQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUEsSUFBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUE7O0FBRXhELFNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNoRSxTQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDL0QsU0FBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ3JFLFNBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNuRSxTQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7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LE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRS9CLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ25HLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUN0SCxPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDL0YsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hILE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFaEcsT0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN2RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNwRyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFL0YsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMxRixPQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwQixPQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7R0FDdEU7OztTQUNzQixtQ0FB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QyxDQUFDLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDM0ksUUFBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNoSixRQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNuRyxRQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUM5RixRQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RCLFFBQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3BHLFFBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdkIsUUFBTyxDQUFDLEtBQUssQ0FBQyxD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U0FBTSxFQUFFLE1BQU07R0FDZCxDQUFDLENBQUM7RUFDSDtDQUNELENBQUMsQ0FBQzs7cUJBRVksYUFBYTs7OztBQ1o1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM5QixPQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQTtBQUMzRSxPQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQTtBQUMzRSxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFBO0FBQ25FLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7QUFDbkUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUE7QUFDdkMsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUE7R0FDcEM7OztTQUNtQix1QkFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMxQyxPQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ2pDLE9BQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDcEMsT0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFF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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL2Jhc2UnKTtcblxudmFyIGJhc2UgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcblxudmFyIF9TYWZlU3RyaW5nID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nJyk7XG5cbnZhciBfU2FmZVN0cmluZzIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfU2FmZVN0cmluZyk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9pbXBvcnQyID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQyKTtcblxudmFyIF9pbXBvcnQzID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3J1bnRpbWUnKTtcblxudmFyIHJ1bnRpbWUgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Myk7XG5cbnZhciBfbm9Db25mbGljdCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9uby1jb25mbGljdCcpO1xuXG52YXIgX25vQ29uZmxpY3QyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX25vQ29uZmxpY3QpO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgdmFyIGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IF9TYWZlU3RyaW5nMlsnZGVmYXVsdCddO1xuICBoYi5FeGNlcHRpb24gPSBfRXhjZXB0aW9uMlsnZGVmYXVsdCddO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuICBoYi5lc2NhcGVFeHByZXNzaW9uID0gVXRpbHMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG52YXIgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbl9ub0NvbmZsaWN0MlsnZGVmYXVsdCddKGluc3QpO1xuXG5pbnN0WydkZWZhdWx0J10gPSBpbnN0O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBpbnN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkhhbmRsZWJhcnNFbnZpcm9ubWVudCA9IEhhbmRsZWJhcnNFbnZpcm9ubWVudDtcbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBjcmVhdGVGcmFtZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgVkVSU0lPTiA9ICczLjAuMSc7XG5leHBvcnRzLlZFUlNJT04gPSBWRVJTSU9OO1xudmFyIENPTVBJTEVSX1JFVklTSU9OID0gNjtcblxuZXhwb3J0cy5DT01QSUxFUl9SRVZJU0lPTiA9IENPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPT0gMS54LngnLFxuICA1OiAnPT0gMi4wLjAtYWxwaGEueCcsXG4gIDY6ICc+PSAyLjAuMC1iZXRhLjEnXG59O1xuXG5leHBvcnRzLlJFVklTSU9OX0NIQU5HRVMgPSBSRVZJU0lPTl9DSEFOR0VTO1xudmFyIGlzQXJyYXkgPSBVdGlscy5pc0FycmF5LFxuICAgIGlzRnVuY3Rpb24gPSBVdGlscy5pc0Z1bmN0aW9uLFxuICAgIHRvU3RyaW5nID0gVXRpbHMudG9TdHJpbmcsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG59XG5cbkhhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiByZWdpc3RlckhlbHBlcihuYW1lLCBmbikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpO1xuICAgICAgfVxuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gdW5yZWdpc3RlckhlbHBlcihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuaGVscGVyc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHJlZ2lzdGVyUGFydGlhbChuYW1lLCBwYXJ0aWFsKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXR0ZW1wdGluZyB0byByZWdpc3RlciBhIHBhcnRpYWwgYXMgdW5kZWZpbmVkJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gcGFydGlhbDtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiB1bnJlZ2lzdGVyUGFydGlhbChuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFydGlhbHNbbmFtZV07XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIEEgbWlzc2luZyBmaWVsZCBpbiBhIHt7Zm9vfX0gY29uc3R1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdNaXNzaW5nIGhlbHBlcjogXCInICsgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXS5uYW1lICsgJ1wiJyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmbih0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZiAoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmlkcykge1xuICAgICAgICAgIG9wdGlvbnMuaWRzID0gW29wdGlvbnMubmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLm5hbWUpO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdNdXN0IHBhc3MgaXRlcmF0b3IgdG8gI2VhY2gnKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuLFxuICAgICAgICBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgcmV0ID0gJycsXG4gICAgICAgIGRhdGEgPSB1bmRlZmluZWQsXG4gICAgICAgIGNvbnRleHRQYXRoID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKSArICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjSXRlcmF0aW9uKGZpZWxkLCBpbmRleCwgbGFzdCkge1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5rZXkgPSBmaWVsZDtcbiAgICAgICAgZGF0YS5pbmRleCA9IGluZGV4O1xuICAgICAgICBkYXRhLmZpcnN0ID0gaW5kZXggPT09IDA7XG4gICAgICAgIGRhdGEubGFzdCA9ICEhbGFzdDtcblxuICAgICAgICBpZiAoY29udGV4dFBhdGgpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gY29udGV4dFBhdGggKyBmaWVsZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ZpZWxkXSwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogVXRpbHMuYmxvY2tQYXJhbXMoW2NvbnRleHRbZmllbGRdLCBmaWVsZF0sIFtjb250ZXh0UGF0aCArIGZpZWxkLCBudWxsXSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihpLCBpLCBpID09PSBjb250ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJpb3JLZXkgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBydW5uaW5nIHRoZSBpdGVyYXRpb25zIG9uZSBzdGVwIG91dCBvZiBzeW5jIHNvIHdlIGNhbiBkZXRlY3RcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAgIC8vIGFuIGl0ZXJtZWRpYXRlIGtleXMgYXJyYXkuXG4gICAgICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJpb3JLZXkgPSBrZXk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkge1xuICAgICAgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsIHx8IFV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7IGZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaCB9KTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoIVV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uIChtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICAgIGluc3RhbmNlLmxvZyhsZXZlbCwgbWVzc2FnZSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb29rdXAnLCBmdW5jdGlvbiAob2JqLCBmaWVsZCkge1xuICAgIHJldHVybiBvYmogJiYgb2JqW2ZpZWxkXTtcbiAgfSk7XG59XG5cbnZhciBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogeyAwOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJyB9LFxuXG4gIC8vIFN0YXRlIGVudW1cbiAgREVCVUc6IDAsXG4gIElORk86IDEsXG4gIFdBUk46IDIsXG4gIEVSUk9SOiAzLFxuICBsZXZlbDogMSxcblxuICAvLyBDYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uIGxvZyhsZXZlbCwgbWVzc2FnZSkge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gbG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICAoY29uc29sZVttZXRob2RdIHx8IGNvbnNvbGUubG9nKS5jYWxsKGNvbnNvbGUsIG1lc3NhZ2UpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHMubG9nZ2VyID0gbG9nZ2VyO1xudmFyIGxvZyA9IGxvZ2dlci5sb2c7XG5cbmV4cG9ydHMubG9nID0gbG9nO1xuXG5mdW5jdGlvbiBjcmVhdGVGcmFtZShvYmplY3QpIHtcbiAgdmFyIGZyYW1lID0gVXRpbHMuZXh0ZW5kKHt9LCBvYmplY3QpO1xuICBmcmFtZS5fcGFyZW50ID0gb2JqZWN0O1xuICByZXR1cm4gZnJhbWU7XG59XG5cbi8qIFthcmdzLCBdb3B0aW9ucyAqLyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5mdW5jdGlvbiBFeGNlcHRpb24obWVzc2FnZSwgbm9kZSkge1xuICB2YXIgbG9jID0gbm9kZSAmJiBub2RlLmxvYyxcbiAgICAgIGxpbmUgPSB1bmRlZmluZWQsXG4gICAgICBjb2x1bW4gPSB1bmRlZmluZWQ7XG4gIGlmIChsb2MpIHtcbiAgICBsaW5lID0gbG9jLnN0YXJ0LmxpbmU7XG4gICAgY29sdW1uID0gbG9jLnN0YXJ0LmNvbHVtbjtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgY29sdW1uO1xuICB9XG5cbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEV4Y2VwdGlvbik7XG4gIH1cblxuICBpZiAobG9jKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgfVxufVxuXG5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEV4Y2VwdGlvbjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbi8qZ2xvYmFsIHdpbmRvdyAqL1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB2YXIgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocm9vdC5IYW5kbGViYXJzID09PSBIYW5kbGViYXJzKSB7XG4gICAgICByb290LkhhbmRsZWJhcnMgPSAkSGFuZGxlYmFycztcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY2hlY2tSZXZpc2lvbiA9IGNoZWNrUmV2aXNpb247XG5cbi8vIFRPRE86IFJlbW92ZSB0aGlzIGxpbmUgYW5kIGJyZWFrIHVwIGNvbXBpbGVQYXJ0aWFsXG5cbmV4cG9ydHMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbmV4cG9ydHMud3JhcFByb2dyYW0gPSB3cmFwUHJvZ3JhbTtcbmV4cG9ydHMucmVzb2x2ZVBhcnRpYWwgPSByZXNvbHZlUGFydGlhbDtcbmV4cG9ydHMuaW52b2tlUGFydGlhbCA9IGludm9rZVBhcnRpYWw7XG5leHBvcnRzLm5vb3AgPSBub29wO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG5mdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICB2YXIgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLkNPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBydW50aW1lVmVyc2lvbnMgKyAnKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKCcgKyBjb21waWxlclZlcnNpb25zICsgJykuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBjb21waWxlckluZm9bMV0gKyAnKS4nKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGVtcGxhdGUodGVtcGxhdGVTcGVjLCBlbnYpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKCFlbnYpIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTm8gZW52aXJvbm1lbnQgcGFzc2VkIHRvIHRlbXBsYXRlJyk7XG4gIH1cbiAgaWYgKCF0ZW1wbGF0ZVNwZWMgfHwgIXRlbXBsYXRlU3BlYy5tYWluKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1Vua25vd24gdGVtcGxhdGUgb2JqZWN0OiAnICsgdHlwZW9mIHRlbXBsYXRlU3BlYyk7XG4gIH1cblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICBlbnYuVk0uY2hlY2tSZXZpc2lvbih0ZW1wbGF0ZVNwZWMuY29tcGlsZXIpO1xuXG4gIGZ1bmN0aW9uIGludm9rZVBhcnRpYWxXcmFwcGVyKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgICBjb250ZXh0ID0gVXRpbHMuZXh0ZW5kKHt9LCBjb250ZXh0LCBvcHRpb25zLmhhc2gpO1xuICAgIH1cblxuICAgIHBhcnRpYWwgPSBlbnYuVk0ucmVzb2x2ZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcbiAgICB2YXIgcmVzdWx0ID0gZW52LlZNLmludm9rZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcblxuICAgIGlmIChyZXN1bHQgPT0gbnVsbCAmJiBlbnYuY29tcGlsZSkge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgdGVtcGxhdGVTcGVjLmNvbXBpbGVyT3B0aW9ucywgZW52KTtcbiAgICAgIHJlc3VsdCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRlbnQpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gcmVzdWx0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpbmVzW2ldICYmIGkgKyAxID09PSBsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lc1tpXSA9IG9wdGlvbnMuaW5kZW50ICsgbGluZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbGluZXMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIHZhciBjb250YWluZXIgPSB7XG4gICAgc3RyaWN0OiBmdW5jdGlvbiBzdHJpY3Qob2JqLCBuYW1lKSB7XG4gICAgICBpZiAoIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1wiJyArIG5hbWUgKyAnXCIgbm90IGRlZmluZWQgaW4gJyArIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW25hbWVdO1xuICAgIH0sXG4gICAgbG9va3VwOiBmdW5jdGlvbiBsb29rdXAoZGVwdGhzLCBuYW1lKSB7XG4gICAgICB2YXIgbGVuID0gZGVwdGhzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGRlcHRoc1tpXSAmJiBkZXB0aHNbaV1bbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBkZXB0aHNbaV1bbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGxhbWJkYTogZnVuY3Rpb24gbGFtYmRhKGN1cnJlbnQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgY3VycmVudCA9PT0gJ2Z1bmN0aW9uJyA/IGN1cnJlbnQuY2FsbChjb250ZXh0KSA6IGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIGVzY2FwZUV4cHJlc3Npb246IFV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgaW52b2tlUGFydGlhbDogaW52b2tlUGFydGlhbFdyYXBwZXIsXG5cbiAgICBmbjogZnVuY3Rpb24gZm4oaSkge1xuICAgICAgcmV0dXJuIHRlbXBsYXRlU3BlY1tpXTtcbiAgICB9LFxuXG4gICAgcHJvZ3JhbXM6IFtdLFxuICAgIHByb2dyYW06IGZ1bmN0aW9uIHByb2dyYW0oaSwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSxcbiAgICAgICAgICBmbiA9IHRoaXMuZm4oaSk7XG4gICAgICBpZiAoZGF0YSB8fCBkZXB0aHMgfHwgYmxvY2tQYXJhbXMgfHwgZGVjbGFyZWRCbG9ja1BhcmFtcykge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuXG4gICAgZGF0YTogZnVuY3Rpb24gZGF0YSh2YWx1ZSwgZGVwdGgpIHtcbiAgICAgIHdoaWxlICh2YWx1ZSAmJiBkZXB0aC0tKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbiBtZXJnZShwYXJhbSwgY29tbW9uKSB7XG4gICAgICB2YXIgb2JqID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIHBhcmFtICE9PSBjb21tb24pIHtcbiAgICAgICAgb2JqID0gVXRpbHMuZXh0ZW5kKHt9LCBjb21tb24sIHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJcbiAgfTtcblxuICBmdW5jdGlvbiByZXQoY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciBkYXRhID0gb3B0aW9ucy5kYXRhO1xuXG4gICAgcmV0Ll9zZXR1cChvcHRpb25zKTtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCAmJiB0ZW1wbGF0ZVNwZWMudXNlRGF0YSkge1xuICAgICAgZGF0YSA9IGluaXREYXRhKGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICB2YXIgZGVwdGhzID0gdW5kZWZpbmVkLFxuICAgICAgICBibG9ja1BhcmFtcyA9IHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyA/IFtdIDogdW5kZWZpbmVkO1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzKSB7XG4gICAgICBkZXB0aHMgPSBvcHRpb25zLmRlcHRocyA/IFtjb250ZXh0XS5jb25jYXQob3B0aW9ucy5kZXB0aHMpIDogW2NvbnRleHRdO1xuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZVNwZWMubWFpbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH1cbiAgcmV0LmlzVG9wID0gdHJ1ZTtcblxuICByZXQuX3NldHVwID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5oZWxwZXJzLCBlbnYuaGVscGVycyk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCkge1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5wYXJ0aWFscywgZW52LnBhcnRpYWxzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcHRpb25zLnBhcnRpYWxzO1xuICAgIH1cbiAgfTtcblxuICByZXQuX2NoaWxkID0gZnVuY3Rpb24gKGksIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zICYmICFibG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ211c3QgcGFzcyBibG9jayBwYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMgJiYgIWRlcHRocykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ211c3QgcGFzcyBwYXJlbnQgZGVwdGhzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgdGVtcGxhdGVTcGVjW2ldLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICBmdW5jdGlvbiBwcm9nKGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICByZXR1cm4gZm4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIG9wdGlvbnMuZGF0YSB8fCBkYXRhLCBibG9ja1BhcmFtcyAmJiBbb3B0aW9ucy5ibG9ja1BhcmFtc10uY29uY2F0KGJsb2NrUGFyYW1zKSwgZGVwdGhzICYmIFtjb250ZXh0XS5jb25jYXQoZGVwdGhzKSk7XG4gIH1cbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGRlcHRocyA/IGRlcHRocy5sZW5ndGggOiAwO1xuICBwcm9nLmJsb2NrUGFyYW1zID0gZGVjbGFyZWRCbG9ja1BhcmFtcyB8fCAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBpZiAoIXBhcnRpYWwpIHtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICB9IGVsc2UgaWYgKCFwYXJ0aWFsLmNhbGwgJiYgIW9wdGlvbnMubmFtZSkge1xuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljIHBhcnRpYWwgdGhhdCByZXR1cm5lZCBhIHN0cmluZ1xuICAgIG9wdGlvbnMubmFtZSA9IHBhcnRpYWw7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbcGFydGlhbF07XG4gIH1cbiAgcmV0dXJuIHBhcnRpYWw7XG59XG5cbmZ1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBvcHRpb25zLnBhcnRpYWwgPSB0cnVlO1xuXG4gIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH0gZWxzZSBpZiAocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCgpIHtcbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiBpbml0RGF0YShjb250ZXh0LCBkYXRhKSB7XG4gIGlmICghZGF0YSB8fCAhKCdyb290JyBpbiBkYXRhKSkge1xuICAgIGRhdGEgPSBkYXRhID8gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuY3JlYXRlRnJhbWUoZGF0YSkgOiB7fTtcbiAgICBkYXRhLnJvb3QgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiBkYXRhO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5mdW5jdGlvbiBTYWZlU3RyaW5nKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn1cblxuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBTYWZlU3RyaW5nLnByb3RvdHlwZS50b0hUTUwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU2FmZVN0cmluZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kO1xuXG4vLyBPbGRlciBJRSB2ZXJzaW9ucyBkbyBub3QgZGlyZWN0bHkgc3VwcG9ydCBpbmRleE9mIHNvIHdlIG11c3QgaW1wbGVtZW50IG91ciBvd24sIHNhZGx5LlxuZXhwb3J0cy5pbmRleE9mID0gaW5kZXhPZjtcbmV4cG9ydHMuZXNjYXBlRXhwcmVzc2lvbiA9IGVzY2FwZUV4cHJlc3Npb247XG5leHBvcnRzLmlzRW1wdHkgPSBpc0VtcHR5O1xuZXhwb3J0cy5ibG9ja1BhcmFtcyA9IGJsb2NrUGFyYW1zO1xuZXhwb3J0cy5hcHBlbmRDb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoO1xudmFyIGVzY2FwZSA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICAnXFwnJzogJyYjeDI3OycsXG4gICdgJzogJyYjeDYwOydcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZyxcbiAgICBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl07XG59XG5cbmZ1bmN0aW9uIGV4dGVuZChvYmogLyogLCAuLi5zb3VyY2UgKi8pIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3VtZW50c1tpXSwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbi8qZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG52YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoaXNGdW5jdGlvbigveC8pKSB7XG4gIGV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxudmFyIGlzRnVuY3Rpb247XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuLyplc2xpbnQtZW5hYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/IHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nIDogZmFsc2U7XG59O2V4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHZhbHVlKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhcnJheVtpXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nICYmIHN0cmluZy50b0hUTUwpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9IVE1MKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZyArICcnO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nO1xuICB9XG5cbiAgaWYgKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBibG9ja1BhcmFtcyhwYXJhbXMsIGlkcykge1xuICBwYXJhbXMucGF0aCA9IGlkcztcbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufSIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKVsnZGVmYXVsdCddO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGFuZGxlYmFycy9ydW50aW1lXCIpW1wiZGVmYXVsdFwiXTtcbiIsIi8vIEF2b2lkIGNvbnNvbGUgZXJyb3JzIGZvciB0aGUgSUUgY3JhcHB5IGJyb3dzZXJzXG5pZiAoICEgd2luZG93LmNvbnNvbGUgKSBjb25zb2xlID0geyBsb2c6IGZ1bmN0aW9uKCl7fSB9O1xuXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwIGZyb20gJ0FwcCdcbmltcG9ydCBBcHBNb2JpbGUgZnJvbSAnQXBwTW9iaWxlJ1xuaW1wb3J0IFR3ZWVuTWF4IGZyb20gJ2dzYXAnXG5pbXBvcnQgcmFmIGZyb20gJ3JhZidcbmltcG9ydCBNb2JpbGVEZXRlY3QgZnJvbSAnbW9iaWxlLWRldGVjdCdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBtZCA9IG5ldyBNb2JpbGVEZXRlY3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG5cbkFwcFN0b3JlLkRldGVjdG9yLmlzU2FmYXJpID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignU2FmYXJpJykgIT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUnKSA9PSAtMSlcbkFwcFN0b3JlLkRldGVjdG9yLmlzRmlyZWZveCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgIT0gLTFcbkFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gKG1kLm1vYmlsZSgpIHx8IG1kLnRhYmxldCgpKSA/IHRydWUgOiBmYWxzZVxuQXBwU3RvcmUuUGFyZW50ID0gZG9tLnNlbGVjdCgnI2FwcC1jb250YWluZXInKVxuQXBwU3RvcmUuRGV0ZWN0b3Iub2xkSUUgPSBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTYnKSB8fCBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTcnKSB8fCBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTgnKVxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNTdXBwb3J0V2ViR0wgPSBVdGlscy5TdXBwb3J0V2ViR0woKVxuaWYoQXBwU3RvcmUuRGV0ZWN0b3Iub2xkSUUpIEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG4vLyBEZWJ1Z1xuLy8gQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSB0cnVlXG5cbnZhciBhcHA7XG5pZihBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSkge1xuXHRkb20uY2xhc3Nlcy5hZGQoZG9tLnNlbGVjdCgnaHRtbCcpLCAnbW9iaWxlJylcblx0YXBwID0gbmV3IEFwcE1vYmlsZSgpXG59ZWxzZXtcblx0YXBwID0gbmV3IEFwcCgpXHRcbn0gXG5cbmFwcC5pbml0KClcblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBBcHBUZW1wbGF0ZSBmcm9tICdBcHBUZW1wbGF0ZSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEdFdmVudHMgZnJvbSAnR2xvYmFsRXZlbnRzJ1xuaW1wb3J0IFByZWxvYWRlciBmcm9tICdQcmVsb2FkZXInXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIEFwcCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMub25BcHBSZWFkeSA9IHRoaXMub25BcHBSZWFkeS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5sb2FkTWFpbkFzc2V0cyA9IHRoaXMubG9hZE1haW5Bc3NldHMuYmluZCh0aGlzKVxuXHRcdHRoaXMub25QbGFuZVVwZGF0ZSA9IHRoaXMub25QbGFuZVVwZGF0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHRoaXMucm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0dGhpcy5yb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IFByZWxvYWRlclxuXHRcdEFwcFN0b3JlLlByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKVxuXG5cdFx0dmFyIHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlbG9hZGVyJylcblx0XHRcblx0XHR2YXIgcGxhbmUgPSBkb20uc2VsZWN0KCcjcGxhbmUnLCBwKVxuXHRcdHZhciBwYXRoID0gTW9ycGhTVkdQbHVnaW4ucGF0aERhdGFUb0JlemllcihcIiNtb3Rpb25QYXRoXCIpXG5cdFx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0bC5ldmVudENhbGxiYWNrKCdvblVwZGF0ZScsIHRoaXMub25QbGFuZVVwZGF0ZSlcblx0XHR0bC50byhwbGFuZSwgNSwge2Jlemllcjp7dmFsdWVzOnBhdGgsIHR5cGU6XCJjdWJpY1wiLCBhdXRvUm90YXRlOnRydWV9LCBlYXNlOkxpbmVhci5lYXNlT3V0fSwgMClcblx0XHR0bC5wYXVzZSgpXG5cdFx0dGhpcy5sb2FkZXJBbmltID0ge1xuXHRcdFx0cGF0aDogcGF0aCxcblx0XHRcdGVsOiBwLFxuXHRcdFx0cGxhbmU6IHBsYW5lLFxuXHRcdFx0dGw6IHRsXG5cdFx0fVxuXHRcdHRsLnR3ZWVuVG8oMy41KVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGUgPSBuZXcgQXBwVGVtcGxhdGUoKVxuXHRcdGFwcFRlbXBsYXRlLmlzUmVhZHkgPSB0aGlzLmxvYWRNYWluQXNzZXRzXG5cdFx0YXBwVGVtcGxhdGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0dGhpcy5yb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxuXHRvblBsYW5lVXBkYXRlKCkge1xuXHRcdHZhciBzY2FsZSA9IDIuMiAtICh0aGlzLmxvYWRlckFuaW0udGwucHJvZ3Jlc3MoKSAqIDEuNSlcblx0XHRUd2Vlbk1heC5zZXQodGhpcy5sb2FkZXJBbmltLnBsYW5lLCB7IHNjYWxlOnNjYWxlLCBmb3JjZTNEOnRydWUsIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnIH0pXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0dmFyIHNpemUgPSBkb20uc2l6ZSh0aGlzLmxvYWRlckFuaW0uZWwpXG5cdFx0XHR2YXIgZWwgPSB0aGlzLmxvYWRlckFuaW0uZWxcblx0XHRcdGVsLnN0eWxlLmxlZnQgPSAod2luZG93VyA+PiAxKSAtIChzaXplWzBdKSArICdweCdcblx0XHRcdGVsLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpICsgKHNpemVbMV0gKiAwKSArICdweCdcblx0XHRcdHRoaXMubG9hZGVyQW5pbS5lbC5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdH0sIDApXG5cdH1cblx0bG9hZE1haW5Bc3NldHMoKSB7XG5cdFx0dmFyIGhhc2hVcmwgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cmluZygyKVxuXHRcdHZhciBwYXJ0cyA9IGhhc2hVcmwuc3Vic3RyKDEpLnNwbGl0KCcvJylcblx0XHR2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcblx0XHRpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB0aGlzLm9uQXBwUmVhZHkoKVxuXHRcdGVsc2UgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsIHRoaXMub25BcHBSZWFkeSlcblx0fVxuXHRvbkFwcFJlYWR5KCkge1xuXHRcdC8vIHJldHVyblxuXHRcdHRoaXMubG9hZGVyQW5pbS50bC50aW1lU2NhbGUoMi40KS50d2VlblRvKHRoaXMubG9hZGVyQW5pbS50bC50b3RhbER1cmF0aW9uKCkgLSAwLjEpXG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFR3ZWVuTWF4LnRvKHRoaXMubG9hZGVyQW5pbS5lbCwgMC41LCB7IG9wYWNpdHk6MCwgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHRcdFx0ZG9tLnRyZWUucmVtb3ZlKHRoaXMubG9hZGVyQW5pbS5lbClcblx0XHRcdFx0dGhpcy5sb2FkZXJBbmltLnRsLmV2ZW50Q2FsbGJhY2soJ29uVXBkYXRlJywgbnVsbClcblx0XHRcdFx0dGhpcy5sb2FkZXJBbmltLnRsLmNsZWFyKClcblx0XHRcdFx0dGhpcy5sb2FkZXJBbmltLnRsID0gbnVsbFxuXHRcdFx0XHR0aGlzLmxvYWRlckFuaW0gPSBudWxsXG5cdFx0XHRcdHNldFRpbWVvdXQoKCk9PkFwcEFjdGlvbnMuYXBwU3RhcnQoKSlcblx0XHRcdFx0c2V0VGltZW91dCgoKT0+QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpKVxuXHRcdFx0fSwgMjAwKVxuXHRcdH0sIDE1MDApXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4gICAgXHRcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGVNb2JpbGUgZnJvbSAnQXBwVGVtcGxhdGVNb2JpbGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIEFwcE1vYmlsZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdGluaXQoKSB7XG5cdFx0Ly8gSW5pdCByb3V0ZXJcblx0XHR2YXIgcm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0cm91dGVyLmluaXQoKVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGVNb2JpbGUgPSBuZXcgQXBwVGVtcGxhdGVNb2JpbGUoKVxuXHRcdGFwcFRlbXBsYXRlTW9iaWxlLnJlbmRlcignI2FwcC1jb250YWluZXInKVxuXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZWxvYWRlcicpXG5cdFx0ZG9tLnRyZWUucmVtb3ZlKGVsKVxuXG5cdFx0Ly8gU3RhcnQgcm91dGluZ1xuXHRcdHJvdXRlci5iZWdpblJvdXRpbmcoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcE1vYmlsZVxuICAgIFx0XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEZyb250Q29udGFpbmVyIGZyb20gJ0Zyb250Q29udGFpbmVyJ1xuaW1wb3J0IFBhZ2VzQ29udGFpbmVyIGZyb20gJ1BhZ2VzQ29udGFpbmVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFBYQ29udGFpbmVyIGZyb20gJ1BYQ29udGFpbmVyJ1xuaW1wb3J0IFRyYW5zaXRpb25NYXAgZnJvbSAnVHJhbnNpdGlvbk1hcCdcblxuY2xhc3MgQXBwVGVtcGxhdGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucmVzaXplID0gdGhpcy5yZXNpemUuYmluZCh0aGlzKVxuXHRcdHRoaXMuYW5pbWF0ZSA9IHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGUnLCBwYXJlbnQsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucHhDb250YWluZXIgPSBuZXcgUFhDb250YWluZXIoKVxuXHRcdHRoaXMucHhDb250YWluZXIuaW5pdCgnI3BhZ2VzLWNvbnRhaW5lcicpXG5cdFx0QXBwQWN0aW9ucy5weENvbnRhaW5lcklzUmVhZHkodGhpcy5weENvbnRhaW5lcilcblxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcCA9IG5ldyBUcmFuc2l0aW9uTWFwKClcblx0XHR0aGlzLnRyYW5zaXRpb25NYXAucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMuaXNSZWFkeSgpXG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cblx0XHRHbG9iYWxFdmVudHMucmVzaXplKClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLkZyb250QmxvY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJvbnQtYmxvY2snKVxuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHRcdHRoaXMuYW5pbWF0ZSgpXG5cdH1cblx0YW5pbWF0ZSgpIHtcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlKVxuXHQgICAgdGhpcy5weENvbnRhaW5lci51cGRhdGUoKVxuXHQgICAgdGhpcy5wYWdlc0NvbnRhaW5lci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5weENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnRyYW5zaXRpb25NYXAucmVzaXplKClcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgTW9iaWxlVGVtcGxhdGUgZnJvbSAnTW9iaWxlX2hicydcbmltcG9ydCBGZWVkVGVtcGxhdGUgZnJvbSAnRmVlZF9oYnMnXG5pbXBvcnQgSW5kZXhUZW1wbGF0ZSBmcm9tICdJbmRleF9oYnMnXG5pbXBvcnQgZm9vdGVyIGZyb20gJ21vYmlsZS1mb290ZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IHNjcm9sbHRvcCBmcm9tICdzaW1wbGUtc2Nyb2xsdG9wJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmNsYXNzIEFwcFRlbXBsYXRlTW9iaWxlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMuc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0dGhpcy5zY29wZS5pbmZvcyA9IEFwcFN0b3JlLmdsb2JhbENvbnRlbnQoKVxuXHRcdHRoaXMuc2NvcGUubGFiVXJsID0gZ2VuZXJhSW5mb3NbJ2xhYl91cmwnXVxuXHRcdHRoaXMuc2NvcGUuZ2VuZXJpYyA9IEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZCgnLycpLnRleHRzW0FwcFN0b3JlLmxhbmcoKV0uZ2VuZXJpY1xuXHRcdHRoaXMuc2NvcGUubW9iaWxlbWFwID0gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL21vYmlsZV9tYXAuanBnJ1xuXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk9wZW5GZWVkID0gdGhpcy5vbk9wZW5GZWVkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uT3BlbkdyaWQgPSB0aGlzLm9uT3BlbkdyaWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25TY3JvbGwgPSB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcylcblx0XHR0aGlzLm9uSWNvbkNsaWNrZWQgPSB0aGlzLm9uSWNvbkNsaWNrZWQuYmluZCh0aGlzKVxuXG5cdFx0Ly8gZmluZCB1cmxzIGZvciBlYWNoIGZlZWRcblx0XHR0aGlzLmluZGV4ID0gW11cblx0XHR0aGlzLmZlZWQgPSBBcHBTdG9yZS5nZXRGZWVkKClcblx0XHR2YXIgYmFzZVVybCA9IEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKVxuXHRcdHZhciBpLCBmZWVkLCBmb2xkZXIsIGljb24sIHBhZ2VJZCwgc2NvcGU7XG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuZmVlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZmVlZCA9IHRoaXMuZmVlZFtpXVxuXHRcdFx0Zm9sZGVyID0gYmFzZVVybCArICdpbWFnZS9kaXB0eXF1ZS8nICsgZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uICsgJy8nXG5cdFx0XHRpY29uID0gZm9sZGVyICsgJ2ljb24uanBnJ1xuXHRcdFx0cGFnZUlkID0gZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uIFxuXHRcdFx0c2NvcGUgPSBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQocGFnZUlkKVxuXHRcdFx0Ly8gY29uc29sZS5sb2coc2NvcGUpXG5cdFx0XHRmZWVkLmljb24gPSBpY29uXG5cdFx0XHRmZWVkLnNob3BVcmwgPSBzY29wZVsnc2hvcC11cmwnXVxuXHRcdFx0aWYoZmVlZC5tZWRpYS50eXBlID09ICdpbWFnZScgJiYgZmVlZC5tZWRpYS5pZCA9PSAnc2hvZScpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBmb2xkZXIgKyAnbW9iaWxlLycgKyAnc2hvZS5qcGcnXG5cdFx0XHRcdGZlZWQuY29tbWVudHNbMF1bJ3BlcnNvbi10ZXh0J10gKz0gJyA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJytmZWVkLnNob3BVcmwrJ1wiPiNTaG9wJytVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoZmVlZC5jb21tZW50c1swXVsncGVyc29uLW5hbWUnXSkrJzwvYT4nXG5cdFx0XHRcdGZlZWQubWVkaWFbJ2lzLXNob3AnXSA9IHRydWVcblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAnaW1hZ2UnICYmIGZlZWQubWVkaWEuaWQgPT0gJ2NoYXJhY3RlcicpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBmb2xkZXIgKyAnbW9iaWxlLycgKyAnY2hhcmFjdGVyLmpwZydcblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAndmlkZW8nICYmIGZlZWQubWVkaWEuaWQgPT0gJ2Z1bi1mYWN0Jykge1xuXHRcdFx0XHRmZWVkLm1lZGlhWydpcy12aWRlbyddID0gdHJ1ZVxuXHRcdFx0XHRmZWVkLm1lZGlhLnVybCA9IHNjb3BlWyd3aXN0aWEtZnVuLWlkJ11cblx0XHRcdFx0ZmVlZC5jb21tZW50c1swXVsncGVyc29uLXRleHQnXSA9IHNjb3BlLmZhY3QuZW5cblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAndmlkZW8nICYmIGZlZWQubWVkaWEuaWQgPT0gJ2NoYXJhY3RlcicpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYVsnaXMtdmlkZW8nXSA9IHRydWVcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBzY29wZVsnd2lzdGlhLWNoYXJhY3Rlci1pZCddXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ2ltYWdlJykge1xuXHRcdFx0XHR0aGlzLmluZGV4LnB1c2goZmVlZClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuT1BFTl9GRUVELCB0aGlzLm9uT3BlbkZlZWQpIFxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5PUEVOX0dSSUQsIHRoaXMub25PcGVuR3JpZCkgXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGVNb2JpbGUnLCBwYXJlbnQsIE1vYmlsZVRlbXBsYXRlLCB0aGlzLnNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucG9zdHMgPSBbXVxuXHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ID0gMFxuXHRcdHRoaXMucGFnZUVuZGVkID0gZmFsc2Vcblx0XHR0aGlzLmN1cnJlbnRGZWVkSW5kZXggPSAwXG5cdFx0dGhpcy5hbGxGZWVkcyA9IFtdXG5cblx0XHR0aGlzLmZvb3RlciA9IGZvb3Rlcih0aGlzLmVsZW1lbnQsIHRoaXMuc2NvcGUpXG5cdFx0dGhpcy5tYWluQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLm1haW4tY29udGFpbmVyJywgdGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuZmVlZEVsID0gZG9tLnNlbGVjdCgnLmZlZWQnLCB0aGlzLm1haW5Db250YWluZXIpXG5cdFx0dGhpcy5pbmRleEVsID0gZG9tLnNlbGVjdCgnLmluZGV4JywgdGhpcy5tYWluQ29udGFpbmVyKVxuXG5cdFx0QXBwQWN0aW9ucy5vcGVuRmVlZCgpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHR9XG5cdG9uU2Nyb2xsKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBjdXJyZW50U2Nyb2xsID0gc2Nyb2xsdG9wKCkgKyB3aW5kb3dIXG5cdFx0XHRpZihjdXJyZW50U2Nyb2xsID4gdGhpcy50b3RhbFBhZ2VIZWlnaHQpIHtcblx0XHRcdFx0dGhpcy5vblBhZ2VFbmQoKVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0fVxuXHR1cGRhdGVGZWVkVG9Eb20oZmVlZCkge1xuXHRcdHZhciBzY29wZSA9IHtcblx0XHRcdGZlZWQ6IGZlZWRcblx0XHR9XG5cdFx0dmFyIGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdHZhciB0ID0gRmVlZFRlbXBsYXRlKHNjb3BlKVxuXHRcdGguaW5uZXJIVE1MID0gdFxuXHRcdGRvbS50cmVlLmFkZCh0aGlzLmZlZWRFbCwgaClcblx0fVxuXHRnZXRMYXN0RmVlZHMoKSB7XG5cdFx0dmFyIGNvdW50ZXIgPSAwXG5cdFx0dmFyIGZlZWQgPSBbXVxuXHRcdGZvciAodmFyIGkgPSB0aGlzLmN1cnJlbnRGZWVkSW5kZXg7IGkgPCB0aGlzLmN1cnJlbnRGZWVkSW5kZXgrNDsgaSsrKSB7XG5cdFx0XHR2YXIgZiA9IHRoaXMuZmVlZFtpXVxuXHRcdFx0Y291bnRlcisrXG5cdFx0XHRmZWVkLnB1c2goZilcblx0XHR9XG5cdFx0dGhpcy5jdXJyZW50RmVlZEluZGV4ICs9IGNvdW50ZXJcblx0XHRyZXR1cm4gZmVlZFxuXHR9XG5cdG9uSWNvbkNsaWNrZWQoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcblx0XHR2YXIgcmFuZG9tQ29sb3IgPSBjb2xvclV0aWxzLnJhbmRvbUNvbG9yKClcblx0XHR2YXIgcGF0aCA9IGRvbS5zZWxlY3QoJ3BhdGgnLCB0YXJnZXQpXG5cdFx0cGF0aC5zdHlsZS5maWxsID0gcmFuZG9tQ29sb3Jcblx0XHRkb20uY2xhc3Nlcy5hZGQodGFyZ2V0LCAnaGlnaGxpZ2h0Jylcblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKHRhcmdldCwgJ2hpZ2hsaWdodCcpXG5cdFx0fSwgMzAwKVxuXHR9XG5cdHByZXBhcmVQb3N0cygpIHtcblx0XHR0aGlzLnBvc3RzID0gW11cblx0XHR2YXIgcG9zdHMgPSBkb20uc2VsZWN0LmFsbCgnLnBvc3QnLCB0aGlzLmZlZWRFbClcblx0XHR2YXIgaSwgZWwsIGljb25zLCBpY29uO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBwb3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZWwgPSBwb3N0c1tpXVxuXHRcdFx0aWNvbnMgPSBkb20uc2VsZWN0LmFsbCgnI2ljb24nLCBlbClcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgaWNvbnMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWNvbiA9IGljb25zW2pdXG5cdFx0XHRcdGRvbS5ldmVudC5vbihpY29uLCAnY2xpY2snLCB0aGlzLm9uSWNvbkNsaWNrZWQpXG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBvc3RzW2ldID0ge1xuXHRcdFx0XHRlbDogZWwsXG5cdFx0XHRcdG1lZGlhV3JhcHBlcjogZG9tLnNlbGVjdCgnLm1lZGlhLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdGNvbW1lbnRzV3JhcHBlcjogZG9tLnNlbGVjdCgnLmNvbW1lbnRzLXdyYXBwZXInLCBlbCksXG5cdFx0XHRcdHRvcFdyYXBwZXI6IGRvbS5zZWxlY3QoJy50b3Atd3JhcHBlcicsIGVsKSxcblx0XHRcdFx0aWNvbnM6IGljb25zXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMucmVzaXplKClcblx0fVxuXHRvbk9wZW5GZWVkKCkge1xuXHRcdHRoaXMucmVtb3ZlR3JpZCgpXG5cdFx0dGhpcy5pc0ZlZWQgPSB0cnVlXG5cdFx0dmFyIGN1cnJlbnRGZWVkID0gdGhpcy5nZXRMYXN0RmVlZHMoKVxuXHRcdHRoaXMudXBkYXRlRmVlZFRvRG9tKGN1cnJlbnRGZWVkKVxuXHRcdHRoaXMucHJlcGFyZVBvc3RzKClcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnc2Nyb2xsJywgdGhpcy5vblNjcm9sbClcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0b25PcGVuR3JpZCgpIHtcblx0XHR0aGlzLnJlbW92ZUZlZWQoKVxuXHRcdHRoaXMuaXNGZWVkID0gZmFsc2Vcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ3Njcm9sbCcsIHRoaXMub25TY3JvbGwpXG5cdFx0dmFyIHNjb3BlID0ge1xuXHRcdFx0aW5kZXg6IHRoaXMuaW5kZXhcblx0XHR9XG5cdFx0dmFyIHQgPSBJbmRleFRlbXBsYXRlKHNjb3BlKVxuXHRcdHRoaXMuaW5kZXhFbC5pbm5lckhUTUwgPSB0XG5cdFx0dGhpcy5pbmRleGVzID0gZG9tLnNlbGVjdC5hbGwoJy5ibG9jaycsIHRoaXMuaW5kZXhFbClcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVtb3ZlRmVlZCgpe1xuXHRcdGlmKHRoaXMucG9zdHMgPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHR0aGlzLmN1cnJlbnRGZWVkSW5kZXggPSAwXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcG9zdCA9IHRoaXMucG9zdHNbaV1cblx0XHRcdGRvbS50cmVlLnJlbW92ZShwb3N0LmVsKVxuXHRcdH1cblx0fVxuXHRyZW1vdmVHcmlkKCl7XG5cdFx0aWYodGhpcy5pbmRleGVzID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluZGV4ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwb3N0ID0gdGhpcy5pbmRleGVzW2ldXG5cdFx0XHRkb20udHJlZS5yZW1vdmUocG9zdClcblx0XHR9XHRcblx0fVxuXHRvblBhZ2VFbmQoKSB7XG5cdFx0aWYodGhpcy5wYWdlRW5kZWQpIHJldHVyblxuXHRcdGlmKHRoaXMuY3VycmVudEZlZWRJbmRleCA+PSB0aGlzLmZlZWQubGVuZ3RoKSByZXR1cm5cblx0XHR2YXIgY3VycmVudEZlZWQgPSB0aGlzLmdldExhc3RGZWVkcygpXG5cdFx0dGhpcy51cGRhdGVGZWVkVG9Eb20oY3VycmVudEZlZWQpXG5cdFx0dGhpcy5wcmVwYXJlUG9zdHMoKVxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMucGFnZUVuZGVkID0gZmFsc2Vcblx0XHR9LCA1MClcblx0XHR0aGlzLnBhZ2VFbmRlZCA9IHRydWVcblx0fVxuXHRyZXNpemUoKSB7XG5cblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0aWYodGhpcy5pc0ZlZWQpIHtcblx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ID0gMFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwb3N0ID0gdGhpcy5wb3N0c1tpXVxuXHRcdFx0XHR2YXIgdG9wU2l6ZSA9IGRvbS5zaXplKHBvc3QudG9wV3JhcHBlcilcblx0XHRcdFx0dmFyIGljb25zU2l6ZSA9IGRvbS5zaXplKHBvc3QuaWNvbnNXcmFwcGVyKVxuXHRcdFx0XHR2YXIgY29tbWVudHNTaXplID0gZG9tLnNpemUocG9zdC5jb21tZW50c1dyYXBwZXIpXG5cdFx0XHRcdHBvc3QubWVkaWFXcmFwcGVyLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdFx0cG9zdC5tZWRpYVdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gd2luZG93VyArICdweCdcblx0XHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gd2luZG93V1xuXHRcdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSBpY29uc1NpemVbMV1cblx0XHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gY29tbWVudHNTaXplWzFdXG5cdFx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ICs9IHRvcFNpemVbMV1cblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHZhciB3ID0gd2luZG93VyAvIDNcblx0XHRcdHZhciBjb3VudGVyID0gMFxuXHRcdFx0dmFyIGggPSAwXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5kZXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgaW5kZXggPSB0aGlzLmluZGV4ZXNbaV1cblx0XHRcdFx0aW5kZXguc3R5bGUud2lkdGggPSB3ICsgJ3B4J1xuXHRcdFx0XHRpbmRleC5zdHlsZS5oZWlnaHQgPSB3ICsgJ3B4J1xuXHRcdFx0XHRpbmRleC5zdHlsZS5sZWZ0ID0gdyAqIGNvdW50ZXIgKyAncHgnXG5cdFx0XHRcdGluZGV4LnN0eWxlLnRvcCA9IGggKyAncHgnXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0XHRpZihjb3VudGVyID49IDMpIHtcblx0XHRcdFx0XHRoICs9IHdcblx0XHRcdFx0XHRjb3VudGVyID0gMFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5mb290ZXIucmVzaXplKClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVNb2JpbGVcblxuIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5mdW5jdGlvbiBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpIHtcbiAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBsb2FkUGFnZUFzc2V0czogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuICAgICAgICBpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93UmVzaXplOiBmdW5jdGlvbih3aW5kb3dXLCB3aW5kb3dIKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSxcbiAgICAgICAgICAgIGl0ZW06IHsgd2luZG93Vzp3aW5kb3dXLCB3aW5kb3dIOndpbmRvd0ggfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcHhDb250YWluZXJJc1JlYWR5OiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfSVNfUkVBRFksXG4gICAgICAgICAgICBpdGVtOiBjb21wb25lbnRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4QWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweFJlbW92ZUNoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgb3BlbkZ1bkZhY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNsb3NlRnVuRmFjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgY2VsbE1vdXNlRW50ZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9FTlRFUixcbiAgICAgICAgICAgIGl0ZW06IGlkXG4gICAgICAgIH0pIFxuICAgIH0sXG4gICAgY2VsbE1vdXNlTGVhdmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9MRUFWRSxcbiAgICAgICAgICAgIGl0ZW06IGlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBvcGVuRmVlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuT1BFTl9GRUVELFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9wZW5HcmlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5PUEVOX0dSSUQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgYXBwU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLkFQUF9TVEFSVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgICBcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcEFjdGlvbnNcblxuXG4gICAgICBcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnRnJvbnRDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGhlYWRlckxpbmtzIGZyb20gJ2hlYWRlci1saW5rcydcbmltcG9ydCBzb2NpYWxMaW5rcyBmcm9tICdzb2NpYWwtbGlua3MnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIEZyb250Q29udGFpbmVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm9uQXBwU3RhcnRlZCA9IHRoaXMub25BcHBTdGFydGVkLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0dmFyIHNjb3BlID0ge31cblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXHRcdHNjb3BlLmluZm9zID0gQXBwU3RvcmUuZ2xvYmFsQ29udGVudCgpXG5cdFx0c2NvcGUuZ2VuZXJhbCA9IGdlbmVyYUluZm9zXG5cblx0XHRzdXBlci5yZW5kZXIoJ0Zyb250Q29udGFpbmVyJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5oZWFkZXJFbCA9IGRvbS5zZWxlY3QoJ2hlYWRlcicsIHRoaXMuZWxlbWVudClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuQVBQX1NUQVJULCB0aGlzLm9uQXBwU3RhcnRlZClcblx0XHR0aGlzLmhlYWRlckxpbmtzID0gaGVhZGVyTGlua3ModGhpcy5lbGVtZW50KVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvbkFwcFN0YXJ0ZWQoKSB7XG5cdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5BUFBfU1RBUlQsIHRoaXMub25BcHBTdGFydGVkKVxuXHRcdGRvbS5jbGFzc2VzLmFkZCh0aGlzLmhlYWRlckVsLCAnc2hvdycpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZyb250Q29udGFpbmVyXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBYQ29udGFpbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdChlbGVtZW50SWQpIHtcblx0XHR0aGlzLmNsZWFyQmFjayA9IGZhbHNlXG5cblx0XHR0aGlzLmFkZCA9IHRoaXMuYWRkLmJpbmQodGhpcylcblx0XHR0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQodGhpcylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELCB0aGlzLmFkZClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCwgdGhpcy5yZW1vdmUpXG5cblx0XHR2YXIgcmVuZGVyT3B0aW9ucyA9IHtcblx0XHQgICAgcmVzb2x1dGlvbjogMSxcblx0XHQgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG5cdFx0ICAgIGFudGlhbGlhczogdHJ1ZVxuXHRcdH07XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdC8vIHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMuY3VycmVudENvbG9yID0gMHhmZmZmZmZcblx0XHR2YXIgZWwgPSBkb20uc2VsZWN0KGVsZW1lbnRJZClcblx0XHR0aGlzLnJlbmRlcmVyLnZpZXcuc2V0QXR0cmlidXRlKCdpZCcsICdweC1jb250YWluZXInKVxuXHRcdEFwcFN0b3JlLkNhbnZhcyA9IHRoaXMucmVuZGVyZXIudmlld1xuXHRcdGRvbS50cmVlLmFkZChlbCwgdGhpcy5yZW5kZXJlci52aWV3KVxuXHRcdHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdC8vIHRoaXMuYmFja2dyb3VuZCA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHRcdC8vIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5iYWNrZ3JvdW5kKVxuXG5cdFx0Ly8gdGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdC8vIC8vIHRoaXMuc3RhdHMuc2V0TW9kZSggMSApOyAvLyAwOiBmcHMsIDE6IG1zLCAyOiBtYlxuXG5cdFx0Ly8gLy8gYWxpZ24gdG9wLWxlZnRcblx0XHQvLyB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0Ly8gdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZVsnei1pbmRleCddID0gOTk5OTk5XG5cblx0XHQvLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLnN0YXRzLmRvbUVsZW1lbnQgKTtcblxuXHR9XG5cdGRyYXdCYWNrZ3JvdW5kKGNvbG9yKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMuYmFja2dyb3VuZC5jbGVhcigpXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmxpbmVTdHlsZSgwKTtcblx0XHR0aGlzLmJhY2tncm91bmQuYmVnaW5GaWxsKGNvbG9yLCAxKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgd2luZG93Vywgd2luZG93SCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmVuZEZpbGwoKTtcblx0fVxuXHRhZGQoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGNoaWxkKVxuXHR9XG5cdHJlbW92ZShjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQoY2hpbGQpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdC8vIHRoaXMuc3RhdHMudXBkYXRlKClcblx0ICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciBzY2FsZSA9IDFcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMucmVuZGVyZXIucmVzaXplKHdpbmRvd1cgKiBzY2FsZSwgd2luZG93SCAqIHNjYWxlKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlUGFnZSBmcm9tICdCYXNlUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQeEhlbHBlciBmcm9tICdQeEhlbHBlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2UgZXh0ZW5kcyBCYXNlUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weEFkZENoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gNFxuXHRcdH0sIDUwMClcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0aWYodGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcblx0XHRcdHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkID0gdHJ1ZVxuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAwXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDFcblx0XHR9XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdGdldEltYWdlVXJsQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlVVJMKHVybClcblx0fVxuXHRnZXRJbWFnZVNpemVCeUlkKGlkKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FID8gJ2hvbWUtJyArIGlkIDogdGhpcy5wcm9wcy5oYXNoLnBhcmVudCArICctJyArIHRoaXMucHJvcHMuaGFzaC50YXJnZXQgKyAnLScgKyBpZFxuXHRcdHJldHVybiBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VTaXplKHVybClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UHhIZWxwZXIucmVtb3ZlQ2hpbGRyZW5Gcm9tQ29udGFpbmVyKHRoaXMucHhDb250YWluZXIpXG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4UmVtb3ZlQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCB7UGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50c30gZnJvbSAnUGFnZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQmFzZVBhZ2VyIGZyb20gJ0Jhc2VQYWdlcidcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEhvbWUgZnJvbSAnSG9tZSdcbmltcG9ydCBIb21lVGVtcGxhdGUgZnJvbSAnSG9tZV9oYnMnXG5pbXBvcnQgRGlwdHlxdWUgZnJvbSAnRGlwdHlxdWUnXG5pbXBvcnQgRGlwdHlxdWVUZW1wbGF0ZSBmcm9tICdEaXB0eXF1ZV9oYnMnXG5cbmNsYXNzIFBhZ2VzQ29udGFpbmVyIGV4dGVuZHMgQmFzZVBhZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuZGlkSGFzaGVyQ2hhbmdlID0gdGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZUFzc2V0c0xvYWRlZCA9IHRoaXMucGFnZUFzc2V0c0xvYWRlZC5iaW5kKHRoaXMpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMuZGlkSGFzaGVyQ2hhbmdlKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0FTU0VUU19MT0FERUQsIHRoaXMucGFnZUFzc2V0c0xvYWRlZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKCkge1xuXG5cdFx0QXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICd3YWl0J1xuXHRcdEFwcFN0b3JlLkZyb250QmxvY2suc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblx0XHRcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdH1lbHNle1xuXHRcdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dCgpXG5cdFx0XHQvLyB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCgpXG5cdFx0fVxuXHR9XG5cdHRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpIHtcblx0XHR2YXIgdHlwZSA9IHVuZGVmaW5lZFxuXHRcdHZhciB0ZW1wbGF0ZSA9IHVuZGVmaW5lZFxuXHRcdHN3aXRjaChuZXdIYXNoLnR5cGUpIHtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkRJUFRZUVVFOlxuXHRcdFx0XHR0eXBlID0gRGlwdHlxdWVcblx0XHRcdFx0dGVtcGxhdGUgPSBEaXB0eXF1ZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5IT01FOlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHR9XG5cdFx0dGhpcy5zZXR1cE5ld0NvbXBvbmVudChuZXdIYXNoLCB0eXBlLCB0ZW1wbGF0ZSlcblx0XHR0aGlzLmN1cnJlbnRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdHN1cGVyLnBhZ2VBc3NldHNMb2FkZWQoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFnZXNDb250YWluZXJcblxuXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnVHJhbnNpdGlvbk1hcF9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcblxuY2xhc3MgVHJhbnNpdGlvbk1hcCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wcmVsb2FkZXJQcm9ncmVzcyA9IHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cblx0XHRzdXBlci5yZW5kZXIoJ1RyYW5zaXRpb25NYXAnLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLCB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdEFwcFN0b3JlLlByZWxvYWRlci5xdWV1ZS5vbihcInByb2dyZXNzXCIsIHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MsIHRoaXMpXG5cblx0XHR0aGlzLm1hcCA9IG1hcCh0aGlzLmVsZW1lbnQsIEFwcENvbnN0YW50cy5UUkFOU0lUSU9OKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAuaGlnaGxpZ2h0KFJvdXRlci5nZXRPbGRIYXNoKCksIFJvdXRlci5nZXROZXdIYXNoKCkpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLnJlc2V0SGlnaGxpZ2h0KClcblx0fVxuXHRwcmVsb2FkZXJQcm9ncmVzcyhlKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgKz0gMC4yXG5cdFx0aWYoZS5wcm9ncmVzcyA+IDAuOTkpIHRoaXMuY3VycmVudFByb2dyZXNzID0gMVxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPiAxID8gMSA6IHRoaXMuY3VycmVudFByb2dyZXNzIFxuXHRcdHRoaXMubWFwLnVwZGF0ZVByb2dyZXNzKGUucHJvZ3Jlc3MpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNpdGlvbk1hcFxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGFyb3VuZEJvcmRlciA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgJGNvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcCA9IGRvbS5zZWxlY3QoJy50b3AnLCAkY29udGFpbmVyKVxuXHR2YXIgYm90dG9tID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRjb250YWluZXIpXG5cdHZhciBsZWZ0ID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkY29udGFpbmVyKVxuXHR2YXIgcmlnaHQgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkY29udGFpbmVyKVxuXG5cdHZhciAkbGV0dGVyc0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWxldHRlcnMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy50b3AnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGJvdHRvbUxldHRlcnMgPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBsZWZ0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciByaWdodExldHRlcnMgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblxuXHRzY29wZSA9IHtcblx0XHRlbDogJGNvbnRhaW5lcixcblx0XHRsZXR0ZXJzOiAkbGV0dGVyc0NvbnRhaW5lcixcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIGJvcmRlclNpemUgPSAxMFxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTIF1cblxuXHRcdFx0dG9wLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJvcmRlclNpemUgKyAncHgnXG5cdFx0XHRsZWZ0LnN0eWxlLmhlaWdodCA9IHJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRyaWdodC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJvcmRlclNpemUgKyAncHgnXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgdGwgPSB0b3BMZXR0ZXJzW2ldXG5cdFx0XHRcdHRsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0dGwuc3R5bGUudG9wID0gLTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBib3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBibCA9IGJvdHRvbUxldHRlcnNbaV1cblx0XHRcdFx0Ymwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gMTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGwgPSBsZWZ0TGV0dGVyc1tpXVxuXHRcdFx0XHRsbC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bGwuc3R5bGUubGVmdCA9IDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJsID0gcmlnaHRMZXR0ZXJzW2ldXG5cdFx0XHRcdHJsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRybC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIDggKyAncHgnXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dG9wTGV0dGVycyA9IG51bGxcblx0XHRcdGJvdHRvbUxldHRlcnMgPSBudWxsXG5cdFx0XHRsZWZ0TGV0dGVycyA9IG51bGxcblx0XHRcdHJpZ2h0TGV0dGVycyA9IG51bGxcblx0XHR9XG5cdH0gXG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyb3VuZEJvcmRlciIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgb25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmUpPT4ge1xuXHR2YXIgc2NvcGU7XG5cdHZhciBhcnJvd3NXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmFycm93cy13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LmxlZnQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgcmlnaHRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5yaWdodCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciBhcnJvd3MgPSB7XG5cdFx0bGVmdDoge1xuXHRcdFx0ZWw6IGxlZnRBcnJvdyxcblx0XHRcdGljb246IGRvbS5zZWxlY3QoJ3N2ZycsIGxlZnRBcnJvdyksXG5cdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgbGVmdEFycm93KSxcblx0XHRcdGJhY2tncm91bmQ6IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgbGVmdEFycm93KVxuXHRcdH0sXG5cdFx0cmlnaHQ6IHtcblx0XHRcdGVsOiByaWdodEFycm93LFxuXHRcdFx0aWNvbjogZG9tLnNlbGVjdCgnc3ZnJywgcmlnaHRBcnJvdyksXG5cdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgcmlnaHRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIHJpZ2h0QXJyb3cpXG5cdFx0fVxuXHR9XG5cblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdGxlZnQ6IGFycm93cy5sZWZ0LmVsLFxuXHRcdHJpZ2h0OiBhcnJvd3MucmlnaHQuZWwsXG5cdFx0YmFja2dyb3VuZDogKGRpcik9PiB7XG5cdFx0XHRyZXR1cm4gYXJyb3dzW2Rpcl0uYmFja2dyb3VuZFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgYXJyb3dTaXplID0gZG9tLnNpemUoYXJyb3dzLmxlZnQuaWNvbilcblx0XHRcdHZhciBvZmZzZXRZID0gMjBcblx0XHRcdHZhciBiZ1dpZHRoID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXG5cdFx0XHRhcnJvd3MucmlnaHQuZWwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBiZ1dpZHRoICsgJ3B4J1xuXG5cdFx0XHRhcnJvd3MubGVmdC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0Lmljb25zV3JhcHBlci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChhcnJvd1NpemVbMF0gPj4gMSkgLSBvZmZzZXRZICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBiZ1dpZHRoIC0gYXJyb3dTaXplWzBdIC0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICsgJ3B4J1xuXHRcdFx0XHRcblx0XHR9LFxuXHRcdG92ZXI6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0b3V0OiAoZGlyKT0+IHtcblx0XHRcdHZhciBhcnJvdyA9IGFycm93c1tkaXJdXG5cdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoYXJyb3cuZWwsICdob3ZlcmVkJylcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLmxlZnQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRhcnJvd3MgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZXh0QnRuIGZyb20gJ3RleHQtYnRuJ1xuXG52YXIgYm90dG9tVGV4dHMgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5ib3R0b20tdGV4dHMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgc29jaWFsV3JhcHBlciA9IGRvbS5zZWxlY3QoJyNzb2NpYWwtd3JhcHBlcicsIGVsKVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgYWxsVGl0bGVzID0gZG9tLnNlbGVjdC5hbGwoJ2xpJywgdGl0bGVzV3JhcHBlcilcblx0dmFyIHRleHRzRWxzID0gZG9tLnNlbGVjdC5hbGwoJy50ZXh0cy13cmFwcGVyIC50eHQnLCBlbClcblx0dmFyIHRleHRzID0gW11cblx0dmFyIGlkcyA9IFsnZ2VuZXJpYycsICdkZWlhJywgJ2VzLXRyZW5jJywgJ2FyZWxsdWYnXVxuXHR2YXIgb2xkVGV4dCwgY3VycmVudE9wZW5JZDtcblx0dmFyIG1hc2tzUGFyZW50ID0gZG9tLnNlbGVjdCgnLmlubmVyLW1hc2stYmFja2dyb3VuZCcsIGVsKVxuXHR2YXIgYmFja2dyb3VuZCA9IGRvbS5zZWxlY3QoJy5pbm5lci1iYWNrZ3JvdW5kJywgZWwpXG5cdHZhciBtYXNrc0NoaWxkcmVuID0gZG9tLnNlbGVjdC5hbGwoJy5pbm5lci1tYXNrLWJhY2tncm91bmQgZGl2JywgbWFza3NQYXJlbnQpLnJldmVyc2UoKVxuXHR2YXIgbWFza3NUd2VlbiA9IHVuZGVmaW5lZFxuXHR2YXIgZmlyc3RUaW1lID0gdHJ1ZVxuXHR2YXIgY2hhbmdlVGV4dEFuaW1UaW1lb3V0O1xuXHR2YXIgaXNBbmltYXRlID0gZmFsc2VcblxuXHR2YXIgc2ltcGxlVGV4dEJ0bnNFbCA9IGRvbS5zZWxlY3QuYWxsKCcudGV4dC1idG4nLCB0aXRsZXNXcmFwcGVyKVxuXHR2YXIgc2ltcGxlQnRucyA9IFtdXG5cdHZhciBpLCBzLCBlLCBpZDtcblx0Zm9yIChpID0gMDsgaSA8IHNpbXBsZVRleHRCdG5zRWwubGVuZ3RoOyBpKyspIHtcblx0XHRlID0gc2ltcGxlVGV4dEJ0bnNFbFtpXVxuXHRcdGlkID0gZS5pZFxuXHRcdHMgPSB0ZXh0QnRuKGUpXG5cdFx0cy5pZCA9IGlkXG5cdFx0c2ltcGxlQnRuc1tpXSA9IHNcblx0fVxuXG5cdHZhciBzZXR1cE1hc2tUd2VlbiA9IChibG9ja1NpemUpPT4ge1xuXHRcdGlmKG1hc2tzVHdlZW4gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtYXNrc1R3ZWVuLmNsZWFyKClcblx0XHRcdG1hc2tzVHdlZW4gPSBudWxsXG5cdFx0fVxuIFx0XHRtYXNrc1R3ZWVuID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHRtYXNrc1R3ZWVuLnN0YWdnZXJGcm9tVG8obWFza3NDaGlsZHJlbiwgMSwgeyB4OmJsb2NrU2l6ZVswXSsyLCBzY2FsZVk6NCwgdHJhbnNmb3JtT3JpZ2luOicwJSAwJScgfSwgeyB4Oi1ibG9ja1NpemVbMF0tMiwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonMCUgMCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMDgsIDAuMSlcblx0XHRtYXNrc1R3ZWVuLnRvKGJhY2tncm91bmQsIDAuNCwgeyBzY2FsZToxLjIsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDUwJScsIGVhc2U6RWxhc3RpYy5lYXNlT3V0IH0sIDApXG5cdFx0bWFza3NUd2Vlbi50byhiYWNrZ3JvdW5kLCAwLjUsIHsgc2NhbGU6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgNTAlJywgZWFzZTpFbGFzdGljLmVhc2VPdXQgfSwgMC4xKVxuXHRcdG1hc2tzVHdlZW4ucGF1c2UoMClcblx0fVxuXG5cdHZhciBvblRpdGxlQ2xpY2tlZCA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblx0XHRzY29wZS5vcGVuVHh0QnlJZChpZClcblx0fVxuXG5cdHZhciBpLCB0O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFsbFRpdGxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHQgPSBhbGxUaXRsZXNbaV1cblx0XHRkb20uZXZlbnQub24odCwgJ2NsaWNrJywgb25UaXRsZUNsaWNrZWQpXG5cdH1cblxuXHR2YXIgaWQsIGUsIGksIHNwbGl0O1xuXHRmb3IgKGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWQgPSBpZHNbaV1cblx0XHRlID0gdGV4dHNFbHNbaV1cblx0XHR2YXIgdHh0QnRuID0gdW5kZWZpbmVkXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzaW1wbGVCdG5zLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZihzaW1wbGVCdG5zW2pdLmlkID09IGlkKSB7XG5cdFx0XHRcdHR4dEJ0biA9IHNpbXBsZUJ0bnNbal1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGV4dHNbaV0gPSB7XG5cdFx0XHRpZDogaWQsXG5cdFx0XHRlbDogZSxcblx0XHRcdGJ0bjogdHh0QnRuXG5cdFx0fVxuXHR9XG5cblx0dmFyIHJlc2l6ZSA9ICgpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MgXVxuXG5cdFx0dmFyIHBhZGRpbmcgPSA0MFxuXHRcdHZhciBib3JkZXJBcm91bmRcblx0XHRibG9ja1NpemVbMF0gKj0gMiBcblx0XHRibG9ja1NpemVbMV0gKj0gMiBcblx0XHRibG9ja1NpemVbMF0gLT0gcGFkZGluZ1xuXHRcdGJsb2NrU2l6ZVsxXSAtPSBwYWRkaW5nXG5cdFx0dmFyIGlubmVyQmxvY2tTaXplID0gW2Jsb2NrU2l6ZVswXSAtIDEwLCBibG9ja1NpemVbMV0gLSAxMF1cblx0XHR2YXIgdGV4dFcgPSBpbm5lckJsb2NrU2l6ZVswXSAqIDAuOFxuXG5cdFx0ZWwuc3R5bGUud2lkdGggPSBpbm5lckJsb2NrU2l6ZVswXSArICdweCdcblx0XHRlbC5zdHlsZS5oZWlnaHQgPSBpbm5lckJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRlbC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJsb2NrU2l6ZVswXSAtIChwYWRkaW5nID4+IDEpICsgJ3B4J1xuXHRcdGVsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gLSAocGFkZGluZyA+PiAxKSArICdweCdcblxuXHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHR2YXIgc29jaWFsU2l6ZSA9IGRvbS5zaXplKHNvY2lhbFdyYXBwZXIpXG5cdFx0XHR2YXIgdGl0bGVzU2l6ZSA9IGRvbS5zaXplKHRpdGxlc1dyYXBwZXIpXG5cblx0XHRcdHZhciBpLCB0ZXh0LCBzLCBzcGxpdCwgdGw7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGV4dCA9IHRleHRzW2ldXG5cdFx0XHRcdHMgPSBkb20uc2l6ZSh0ZXh0LmVsKVxuXHRcdFx0XHR0ZXh0LmVsLnN0eWxlLnRvcCA9IChpbm5lckJsb2NrU2l6ZVsxXSA+PiAxKSAtIChzWzFdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzcGxpdCA9IG5ldyBTcGxpdFRleHQodGV4dC5lbCwge3R5cGU6XCJsaW5lc1wifSkubGluZXNcblx0XHRcdFx0aWYodGV4dC50bCAhPSB1bmRlZmluZWQpIHRleHQudGwuY2xlYXIoKVxuXHRcdFx0XHR0bCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0XHRcdHRsLnN0YWdnZXJGcm9tKHNwbGl0LCAxLCB7IHk6NSwgc2NhbGVZOjIsIG9wYWNpdHk6MCwgZm9yY2UzRDp0cnVlLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAwJScsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuMDUsIDApXG5cdFx0XHRcdHRsLnBhdXNlKDApXG5cdFx0XHRcdHRleHQudGwgPSB0bFxuXHRcdFx0fVxuXG5cdFx0XHRzb2NpYWxXcmFwcGVyLnN0eWxlLmxlZnQgPSAoaW5uZXJCbG9ja1NpemVbMF0gPj4gMSkgLSAoc29jaWFsU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdHNvY2lhbFdyYXBwZXIuc3R5bGUudG9wID0gaW5uZXJCbG9ja1NpemVbMV0gLSBzb2NpYWxTaXplWzFdIC0gKHBhZGRpbmcgPj4gMSkgKyAncHgnXG5cblx0XHRcdHNldHVwTWFza1R3ZWVuKGlubmVyQmxvY2tTaXplKVxuXG5cdFx0XHRpZihjdXJyZW50T3BlbklkICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY29wZS5vcGVuVHh0QnlJZChjdXJyZW50T3BlbklkLCB0cnVlKVxuXHRcdFx0fVxuXG5cdFx0fSwgMClcblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdG9wZW5UeHRCeUlkOiAoaWQsIGZvcmNlKT0+IHtcblx0XHRcdGN1cnJlbnRPcGVuSWQgPSBpZFxuXHRcdFx0dmFyIGYgPSBmb3JjZSB8fCBmYWxzZVxuXHRcdFx0aWYoIWYpIHtcblx0XHRcdFx0aWYoaXNBbmltYXRlKSByZXR1cm5cblx0XHRcdFx0aXNBbmltYXRlID0gdHJ1ZVxuXHRcdFx0XHRjaGFuZ2VUZXh0QW5pbVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdFx0aXNBbmltYXRlID0gZmFsc2Vcblx0XHRcdFx0fSwgMTEwMClcblx0XHRcdH1cblx0XHRcdHZhciBpLCB0ZXh0O1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0c1tpXVxuXHRcdFx0XHRpZihpZCA9PSB0ZXh0LmlkKSB7XG5cdFx0XHRcdFx0aWYob2xkVGV4dCAhPSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0Ly8gaWYoaWQgPT0gb2xkVGV4dC5pZCkgcmV0dXJuXG5cdFx0XHRcdFx0XHRvbGRUZXh0LnRsLnRpbWVTY2FsZSgyLjYpLnJldmVyc2UoKVxuXHRcdFx0XHRcdFx0aWYob2xkVGV4dC5idG4gIT0gdW5kZWZpbmVkKSBvbGRUZXh0LmJ0bi5kaXNhY3RpdmF0ZSgpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoZikge1xuXHRcdFx0XHRcdFx0dGV4dC50bC5wYXVzZSh0ZXh0LnRsLnRvdGFsRHVyYXRpb24oKSlcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9PnRleHQudGwudGltZVNjYWxlKDEuMikucGxheSgpLCA5MDApXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpPT5tYXNrc1R3ZWVuLnBsYXkoMCksIDIwMClcblx0XHRcdFx0XHRcdGlmKHRleHQuYnRuICE9IHVuZGVmaW5lZCkgdGV4dC5idG4uYWN0aXZhdGUoKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG9sZFRleHQgPSB0ZXh0XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHZhciBpLCB0O1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFRpdGxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0ID0gYWxsVGl0bGVzW2ldXG5cdFx0XHRcdGRvbS5ldmVudC5vZmYodCwgJ2NsaWNrJywgb25UaXRsZUNsaWNrZWQpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dCA9IHRleHRzW2ldXG5cdFx0XHRcdHQudGwuY2xlYXIoKVxuXHRcdFx0fVxuXHRcdFx0bWFza3NUd2Vlbi5jbGVhcigpXG5cdFx0XHRpZHMgPSBudWxsXG5cdFx0XHR0ZXh0cyA9IG51bGxcblx0XHRcdGFsbFRpdGxlcyA9IG51bGxcblx0XHRcdHRleHRzRWxzID0gbnVsbFxuXHRcdFx0bWFza3NUd2VlbiA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm90dG9tVGV4dHMiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBpc1JldGluYSBmcm9tICdpcy1yZXRpbmEnXG5cbmV4cG9ydCBkZWZhdWx0IChob2xkZXIsIGNoYXJhY3RlclVybCwgdGV4dHVyZVNpemUpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaW1nU2NhbGUgPSBpc1JldGluYSgpID8gMC41IDogMVxuXHR2YXIgdHNpemUgPSB7XG5cdFx0d2lkdGg6IHRleHR1cmVTaXplLndpZHRoKmltZ1NjYWxlLFxuXHRcdGhlaWdodDogdGV4dHVyZVNpemUuaGVpZ2h0KmltZ1NjYWxlXG5cdH1cblxuXHR2YXIgdGV4ID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShjaGFyYWN0ZXJVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4KVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHR2YXIgbWFzayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cdGhvbGRlci5hZGRDaGlsZChtYXNrKVxuXG5cdHZhciB0YXJnZXRJZCA9IFJvdXRlci5nZXROZXdIYXNoKCkudGFyZ2V0XG5cblx0c3ByaXRlLm1hc2sgPSBtYXNrXG5cblx0c2NvcGUgPSB7XG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4ICsgKDEwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSArICgxMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAzXG5cdFx0XHRzcHJpdGUueSArPSAobmV3eSAtIHNwcml0ZS55KSAqIDAuMDNcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBzaXplID0gWyh3aW5kb3dXID4+IDEpICsgMSwgd2luZG93SF1cblxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRtYXNrLmJlZ2luRmlsbCgweGZmMDAwMCwgMSk7XG5cdFx0XHRtYXNrLmRyYXdSZWN0KDAsIDAsIHNpemVbMF0sIHNpemVbMV0pO1xuXHRcdFx0bWFzay5lbmRGaWxsKCk7XG5cblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYodGFyZ2V0SWQgPT0gJ3BhcmFkaXNlJykgc2NhbGUgPSAoKCh3aW5kb3dXID4+IDEpKzEwMCkgLyB0c2l6ZS53aWR0aCkgKiAxXG5cdFx0XHRcdGVsc2Ugc2NhbGUgPSAoKHdpbmRvd0ggLSAxMDApIC8gdHNpemUuaGVpZ2h0KSAqIDFcblxuXHRcdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gc2NhbGVcblx0XHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdIC0gKCh0c2l6ZS5oZWlnaHQgKiBzY2FsZSkgPj4gMSkgKyAxMFxuXHRcdFx0XHRzcHJpdGUuaXggPSBzcHJpdGUueFxuXHRcdFx0XHRzcHJpdGUuaXkgPSBzcHJpdGUueVxuXHRcdFx0fSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChzcHJpdGUpXG5cdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQobWFzaylcblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0c3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0c3ByaXRlID0gbnVsbFxuXHRcdFx0dGV4ID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBjb2xvclV0aWxzIGZyb20gJ2NvbG9yLXV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAocHhDb250YWluZXIsIGNvbG9ycyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIGJnQ29sb3JzID0gW11cblx0YmdDb2xvcnMubGVuZ3RoID0gNVxuXG5cdHZhciB0bCA9IG5ldyBUaW1lbGluZUxpdGUoKVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYmdDb2xvcnMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgYmdDb2xvciA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHRiZ0NvbG9yc1tpXSA9IGJnQ29sb3Jcblx0XHRob2xkZXIuYWRkQ2hpbGQoYmdDb2xvcilcblx0fTtcblxuXHR2YXIgb3BlbiA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgxLjUpXG5cdFx0dGwucGxheSgwKVxuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0fVxuXHR2YXIgY2xvc2UgPSAoKT0+IHtcblx0XHR0bC50aW1lU2NhbGUoMilcblx0XHR0bC5yZXZlcnNlKClcblx0XHRzY29wZS5pc09wZW4gPSBmYWxzZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0dGw6IHRsLFxuXHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0aG9sZGVyOiBob2xkZXIsXG5cdFx0b3Blbjogb3Blbixcblx0XHRjbG9zZTogY2xvc2UsXG5cdFx0cmVzaXplOiAod2lkdGgsIGhlaWdodCwgZGlyZWN0aW9uKT0+e1xuXG5cdFx0XHR0bC5jbGVhcigpXG5cblx0XHRcdHZhciBocyA9IGNvbG9ycy5mcm9tLmggLSBjb2xvcnMudG8uaFxuXHRcdFx0dmFyIHNzID0gY29sb3JzLmZyb20ucyAtIGNvbG9ycy50by5zXG5cdFx0XHR2YXIgdnMgPSBjb2xvcnMuZnJvbS52IC0gY29sb3JzLnRvLnZcblx0XHRcdHZhciBsZW4gPSBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwSCA9IGhzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFMgPSBzcyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBWID0gdnMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBoZCA9IChocyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgc2QgPSAoc3MgPCAwKSA/IC0xIDogMVxuXHRcdFx0dmFyIHZkID0gKHZzIDwgMCkgPyAtMSA6IDFcblxuXHRcdFx0dmFyIGRlbGF5ID0gMC4xMlxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdHZhciBoID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5oICsgKHN0ZXBIKmkqaGQpKVxuXHRcdFx0XHR2YXIgcyA9IE1hdGgucm91bmQoY29sb3JzLmZyb20ucyArIChzdGVwUyppKnNkKSlcblx0XHRcdFx0dmFyIHYgPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLnYgKyAoc3RlcFYqaSp2ZCkpXG5cdFx0XHRcdHZhciBjID0gJzB4JyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoaCwgcywgdilcblx0XHRcdFx0YmdDb2xvci5jbGVhcigpXG5cdFx0XHRcdGJnQ29sb3IuYmVnaW5GaWxsKGMsIDEpO1xuXHRcdFx0XHRiZ0NvbG9yLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0XHRiZ0NvbG9yLmVuZEZpbGwoKTtcblxuXHRcdFx0XHRzd2l0Y2goZGlyZWN0aW9uKSB7XG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuVE9QOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB5OmhlaWdodCB9LCB7IHk6LWhlaWdodCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5CT1RUT006XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6LWhlaWdodCB9LCB7IHk6aGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkxFRlQ6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHg6d2lkdGggfSwgeyB4Oi13aWR0aCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5SSUdIVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDotd2lkdGggfSwgeyB4OndpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fTtcblxuXHRcdFx0dGwucGF1c2UoMClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHRsLmNsZWFyKClcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmdDb2xvcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJnQ29sb3IgPSBiZ0NvbG9yc1tpXVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKGJnQ29sb3IpXG5cdFx0XHRcdGJnQ29sb3IgPSBudWxsXG5cdFx0XHR9O1xuXHRcdFx0YmdDb2xvcnMgPSBudWxsXG5cdFx0XHR0bCA9IG51bGxcblx0XHRcdGhvbGRlciA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgYmdVcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIGJnVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoYmdVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoYmdUZXh0dXJlKVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRiZ1Nwcml0ZTogc3ByaXRlLFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCAtICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wMDhcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wMDhcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHNpemVbMF0sIHNpemVbMV0sIDk2MCwgMTAyNClcblxuXHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSA+PiAxXG5cdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gcmVzaXplVmFycy5zY2FsZSArIDAuMVxuXHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0c3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdFx0bWFzayA9IG51bGxcblx0XHRcdHNwcml0ZSA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgY29sb3J5UmVjdHMgZnJvbSAnY29sb3J5LXJlY3RzJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBjb2xvclV0aWxzIGZyb20gJ2NvbG9yLXV0aWxzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBwYXJlbnQsIG1vdXNlLCBkYXRhLCBwcm9wcyk9PiB7XG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgb25DbG9zZVRpbWVvdXQ7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5mdW4tZmFjdC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdmlkZW9XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnZpZGVvLXdyYXBwZXInLCBlbClcblx0dmFyIG1lc3NhZ2VXcmFwcGVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2Utd3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZUlubmVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2UtaW5uZXInLCBtZXNzYWdlV3JhcHBlcilcblx0dmFyIHByID0gcHJvcHM7XG5cdHZhciB0bFRpbWVvdXQ7XG5cdHZhciBmaXJzdFJlc2l6ZSA9IHRydWU7XG5cdHZhciBjb250YWluZXJTY2FsZSA9IDM7XG5cblx0dmFyIHNwbGl0dGVyID0gbmV3IFNwbGl0VGV4dChtZXNzYWdlSW5uZXIsIHt0eXBlOlwid29yZHNcIn0pXG5cblx0dmFyIGMgPSBkb20uc2VsZWN0KCcuY3Vyc29yLWNyb3NzJywgZWwpXG5cdHZhciBjcm9zcyA9IHtcblx0XHR4OiAwLFxuXHRcdHk6IDAsXG5cdFx0ZWw6IGMsXG5cdFx0c2l6ZTogZG9tLnNpemUoYylcblx0fVxuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIGxlZnRSZWN0cyA9IGNvbG9yeVJlY3RzKGhvbGRlciwgZGF0YVsnYW1iaWVudC1jb2xvciddKVxuXHR2YXIgcmlnaHRSZWN0cyA9IGNvbG9yeVJlY3RzKGhvbGRlciwgZGF0YVsnYW1iaWVudC1jb2xvciddKVxuXG5cdHZhciBtQmdDb2xvciA9IGRhdGFbJ2FtYmllbnQtY29sb3InXS50b1xuXHRtZXNzYWdlV3JhcHBlci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIycgKyBjb2xvclV0aWxzLmhzdlRvSGV4KG1CZ0NvbG9yLmgsIG1CZ0NvbG9yLnMsIG1CZ0NvbG9yLnYpXG5cblx0dmFyIGxlZnRUbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdHZhciByaWdodFRsID0gbmV3IFRpbWVsaW5lTWF4KClcblxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0bG9vcDogdHJ1ZVxuXHR9KVxuXHR2YXIgdmlkZW9TcmMgPSBkYXRhWydmdW4tZmFjdC12aWRlby11cmwnXVxuXHRtVmlkZW8uYWRkVG8odmlkZW9XcmFwcGVyKVxuXHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXG5cdHZhciBvbkNsb3NlRnVuRmFjdCA9ICgpPT4ge1xuXHRcdGlmKCFzY29wZS5pc09wZW4pIHJldHVyblxuXHRcdEFwcEFjdGlvbnMuY2xvc2VGdW5GYWN0KClcblx0fVxuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0bVZpZGVvLm9uKCdlbmRlZCcsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdGVsLnN0eWxlWyd6LWluZGV4J10gPSAyOVxuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0XHRzY29wZS5sZWZ0UmVjdHMub3BlbigpXG5cdFx0c2NvcGUucmlnaHRSZWN0cy5vcGVuKClcblx0XHR2YXIgZGVsYXkgPSAzNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5tVmlkZW8ucGxheSgwKSwgZGVsYXkrMjAwKVxuXHRcdGNsZWFyVGltZW91dChvbkNsb3NlVGltZW91dClcblx0XHRvbkNsb3NlVGltZW91dCA9IHNldFRpbWVvdXQoKCk9PmRvbS5ldmVudC5vbihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KSwgZGVsYXkrMjAwKVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnbm9uZSdcblx0XHRkb20uY2xhc3Nlcy5hZGQoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cdHZhciBjbG9zZSA9IChmb3JjZSk9PiB7XG5cdFx0bVZpZGVvLm9mZignZW5kZWQnLCBvbkNsb3NlRnVuRmFjdClcblx0XHRtVmlkZW8ucGF1c2UoKVxuXHRcdGVsLnN0eWxlWyd6LWluZGV4J10gPSAyN1xuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdFx0c2NvcGUubGVmdFJlY3RzLmNsb3NlKClcblx0XHRzY29wZS5yaWdodFJlY3RzLmNsb3NlKClcblx0XHR2YXIgZGVsYXkgPSA1MFxuXHRcdHZhciB0ID0gMlxuXHRcdGlmKGZvcmNlKSB0ID0gNFxuXHRcdHNldFRpbWVvdXQoKCk9PmxlZnRUbC50aW1lU2NhbGUodCkucmV2ZXJzZSgpLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5yaWdodFRsLnRpbWVTY2FsZSh0KS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnYXV0bydcblx0XHRkb20uZXZlbnQub2ZmKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpXG5cdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0fVxuXG5cdHZhciByZXNpemVJbm5lclNpemUgPSAod1csIHdIKT0+IHtcblx0XHR2YXIgbWVzc2FnZUlubmVyU2l6ZSA9IGRvbS5zaXplKG1lc3NhZ2VJbm5lcilcblx0XHRpZighc2NvcGUuaXNPcGVuKSBtZXNzYWdlSW5uZXJTaXplWzFdID0gbWVzc2FnZUlubmVyU2l6ZVsxXS9jb250YWluZXJTY2FsZVxuXHRcdG1lc3NhZ2VJbm5lci5zdHlsZS5sZWZ0ID0gKCh3Vz4+MSkgPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRtZXNzYWdlSW5uZXIuc3R5bGUudG9wID0gKHdIID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMV0gPj4gMSkgKyAncHgnXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc09wZW46IGZhbHNlLFxuXHRcdG9wZW46IG9wZW4sXG5cdFx0Y2xvc2U6IGNsb3NlLFxuXHRcdGxlZnRSZWN0czogbGVmdFJlY3RzLFxuXHRcdHJpZ2h0UmVjdHM6IHJpZ2h0UmVjdHMsXG5cdFx0cmVzaXplOiAoKT0+e1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFdpbmRvd1cgPSAod2luZG93VyA+PiAxKVxuXG5cdFx0XHR2YXIgc2l6ZSA9IFttaWRXaW5kb3dXICsgMSwgd2luZG93SF1cblxuXHRcdFx0aWYoc2NvcGUubGVmdFJlY3RzICE9IHVuZGVmaW5lZCB8fCBzY29wZS5yaWdodFJlY3RzICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY29wZS5sZWZ0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5UT1ApXG5cdFx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5CT1RUT00pXG5cdFx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMuaG9sZGVyLnggPSB3aW5kb3dXIC8gMlxuXHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIHZpZGVvIGlzbid0IHJlYWR5IHJldHVyblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHR2YXIgdmlkZW9XcmFwcGVyUmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkobWlkV2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XID4+IDEsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLndpZHRoID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUud2lkdGggPSBtaWRXaW5kb3dXICsgJ3B4J1xuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLmhlaWdodCA9IG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUubGVmdCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUud2lkdGggPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmhlaWdodCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLnRvcCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0cmVzaXplSW5uZXJTaXplKHdpbmRvd1csIHdpbmRvd0gpXG5cdFx0XHR9LCAzKVxuXG5cdFx0XHRjbGVhclRpbWVvdXQodGxUaW1lb3V0KVxuXHRcdFx0dGxUaW1lb3V0ID0gc2V0VGltZW91dCgoKT0+IHtcblxuXHRcdFx0XHRpZihsZWZ0VGwgPT0gdW5kZWZpbmVkIHx8IHJpZ2h0VGwgPT0gdW5kZWZpbmVkKSByZXR1cm5cblxuXHRcdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0XHRyaWdodFRsLmNsZWFyKClcblxuXHRcdFx0XHRsZWZ0VGwuZnJvbVRvKG1lc3NhZ2VXcmFwcGVyLCAxLjQsIHsgeTp3aW5kb3dILCBzY2FsZVk6Y29udGFpbmVyU2NhbGUsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0XHRcdGxlZnRUbC5zdGFnZ2VyRnJvbVRvKHNwbGl0dGVyLndvcmRzLCAxLCB7IHk6MTYwMCwgc2NhbGVZOjYsIGZvcmNlM0Q6dHJ1ZSB9LCB7IHk6MCwgc2NhbGVZOjEsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC4wNiwgMC4yKVxuXHRcdFx0XHRyaWdodFRsLmZyb21Ubyh2aWRlb1dyYXBwZXIsIDEuNCwgeyB5Oi13aW5kb3dIKjIsIHNjYWxlWTpjb250YWluZXJTY2FsZSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScgfSwgeyB5OjAsIHNjYWxlWToxLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cblx0XHRcdFx0bGVmdFRsLnBhdXNlKDApXG5cdFx0XHRcdHJpZ2h0VGwucGF1c2UoMClcblx0XHRcdFx0bWVzc2FnZVdyYXBwZXIuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLm9wYWNpdHkgPSAxXG5cblx0XHRcdFx0aWYoc2NvcGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0bGVmdFRsLnBhdXNlKGxlZnRUbC50b3RhbER1cmF0aW9uKCkpXG5cdFx0XHRcdFx0cmlnaHRUbC5wYXVzZShyaWdodFRsLnRvdGFsRHVyYXRpb24oKSlcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0bGVmdFRsLnBhdXNlKDApXG5cdFx0XHRcdFx0cmlnaHRUbC5wYXVzZSgwKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGZpcnN0UmVzaXplID0gZmFsc2Vcblx0XHRcdH0sIDEpXG5cblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRcdHZhciBuZXd4ID0gbW91c2UueCAtIChjcm9zcy5zaXplWzBdID4+IDEpXG5cdFx0XHR2YXIgbmV3eSA9IG1vdXNlLnkgLSAoY3Jvc3Muc2l6ZVsxXSA+PiAxKVxuXHRcdFx0Y3Jvc3MueCArPSAobmV3eCAtIGNyb3NzLngpICogMC41XG5cdFx0XHRjcm9zcy55ICs9IChuZXd5IC0gY3Jvc3MueSkgKiAwLjVcblxuXHRcdFx0aWYobW91c2UueSA+IDcwKSB7XG5cdFx0XHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnbm9uZSdcblx0XHRcdFx0Y3Jvc3MuZWwuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nXG5cdFx0XHRcdGNyb3NzLmVsLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHR9XG5cdFx0XHRVdGlscy5UcmFuc2xhdGUoY3Jvc3MuZWwsIGNyb3NzLngsIGNyb3NzLnksIDEpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRtVmlkZW8ub2ZmKCdlbmRlZCcsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdFx0bVZpZGVvLmNsZWFyKClcblx0XHRcdGRvbS5ldmVudC5vZmYocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdClcblx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChob2xkZXIpXG5cdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0cmlnaHRUbC5jbGVhcigpXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMuY2xlYXIoKVxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cy5jbGVhcigpXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMgPSBudWxsXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzID0gbnVsbFxuXHRcdFx0bGVmdFRsID0gbnVsbFxuXHRcdFx0cmlnaHRUbCA9IG51bGxcblx0XHRcdGhvbGRlciA9IG51bGxcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IHZpZGVvQ2FudmFzIGZyb20gJ3ZpZGVvLWNhbnZhcydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBncmlkUG9zaXRpb25zIGZyb20gJ2dyaWQtcG9zaXRpb25zJ1xuaW1wb3J0IG1lZGlhQ2VsbCBmcm9tICdtZWRpYS1jZWxsJ1xuXG52YXIgZ3JpZCA9IChwcm9wcywgcGFyZW50LCBvbkl0ZW1FbmRlZCk9PiB7XG5cblx0dmFyIHZpZGVvRW5kZWQgPSAoaXRlbSk9PiB7XG5cdFx0b25JdGVtRW5kZWQoaXRlbSlcblx0XHRzY29wZS50cmFuc2l0aW9uT3V0SXRlbShpdGVtKVxuXHR9XG5cblx0dmFyIGltYWdlRW5kZWQgPSAoaXRlbSk9PiB7XG5cdFx0b25JdGVtRW5kZWQoaXRlbSlcblx0XHRzY29wZS50cmFuc2l0aW9uT3V0SXRlbShpdGVtKVxuXHR9XG5cblx0dmFyIGdyaWRDb250YWluZXIgPSBkb20uc2VsZWN0KFwiLmdyaWQtY29udGFpbmVyXCIsIHBhcmVudClcblx0dmFyIGdyaWRGcm9udENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1mcm9udC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgbGluZXNHcmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmxpbmVzLWdyaWQtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgZ3JpZENoaWxkcmVuID0gZ3JpZENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgZ3JpZEZyb250Q2hpbGRyZW4gPSBncmlkRnJvbnRDb250YWluZXIuY2hpbGRyZW5cblx0dmFyIGxpbmVzSG9yaXpvbnRhbCA9IGRvbS5zZWxlY3QoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLmhvcml6b250YWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgbGluZXNWZXJ0aWNhbCA9IGRvbS5zZWxlY3QoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLnZlcnRpY2FsLWxpbmVzXCIsIHBhcmVudCkuY2hpbGRyZW5cblx0dmFyIHNjb3BlO1xuXHR2YXIgY3VycmVudFNlYXQ7XG5cdHZhciBjZWxscyA9IFtdXG5cdHZhciB0b3RhbE51bSA9IHByb3BzLmRhdGEuZ3JpZC5sZW5ndGhcblx0dmFyIHZpZGVvcyA9IEFwcFN0b3JlLmdldEhvbWVWaWRlb3MoKVxuXG5cdHZhciBzZWF0cyA9IFtcblx0XHQxLCAzLCA1LFxuXHRcdDcsIDksIDExLCAxMyxcblx0XHQxNSwgXG5cdFx0MjEsIDIzLCAyNVxuXHRdXG5cblx0dmFyIHZDYW52YXNQcm9wcyA9IHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0dm9sdW1lOiAwLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdG9uRW5kZWQ6IHZpZGVvRW5kZWRcblx0fVxuXG5cdHZhciBtQ2VsbDtcblx0dmFyIGNvdW50ZXIgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTnVtOyBpKyspIHtcblx0XHR2YXIgdlBhcmVudCA9IGdyaWRDaGlsZHJlbltpXVxuXHRcdHZhciBmUGFyZW50ID0gZ3JpZEZyb250Q2hpbGRyZW5baV1cblx0XHRjZWxsc1tpXSA9IHVuZGVmaW5lZFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2VhdHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmKGkgPT0gc2VhdHNbal0pIHtcblx0XHRcdFx0bUNlbGwgPSBtZWRpYUNlbGwodlBhcmVudCwgZlBhcmVudCwgdmlkZW9zW2NvdW50ZXJdKVxuXHRcdFx0XHRjZWxsc1tpXSA9IG1DZWxsXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoZ0dyaWQpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgb3JpZ2luYWxWaWRlb1NpemUgPSBBcHBDb25zdGFudHMuSE9NRV9WSURFT19TSVpFXG5cdFx0dmFyIG9yaWdpbmFsSW1hZ2VTaXplID0gQXBwQ29uc3RhbnRzLkhPTUVfSU1BR0VfU0laRVxuXHRcdHZhciBibG9ja1NpemUgPSBnR3JpZC5ibG9ja1NpemVcblxuXHRcdGxpbmVzR3JpZENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuXHRcdHZhciByZXNpemVWaWRlb1ZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdLCBvcmlnaW5hbFZpZGVvU2l6ZVswXSwgb3JpZ2luYWxWaWRlb1NpemVbMV0pXG5cdFx0dmFyIHJlc2l6ZUltYWdlVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0sIG9yaWdpbmFsSW1hZ2VTaXplWzBdLCBvcmlnaW5hbEltYWdlU2l6ZVsxXSlcblxuXHRcdHZhciBnUG9zID0gZ0dyaWQucG9zaXRpb25zXG5cdFx0dmFyIHBhcmVudCwgY2VsbDtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIGhsLCB2bDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciByb3cgPSBnUG9zW2ldXG5cblx0XHRcdC8vIGhvcml6b250YWwgbGluZXNcblx0XHRcdGlmKGkgPiAwKSB7XG5cdFx0XHRcdGhsID0gc2NvcGUubGluZXMuaG9yaXpvbnRhbFtpLTFdXG5cdFx0XHRcdGhsLnN0eWxlLnRvcCA9IE1hdGguZmxvb3IoYmxvY2tTaXplWzFdICogaSkgKyAncHgnXG5cdFx0XHRcdGhsLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIHZlcnRpY2FsIGxpbmVzXG5cdFx0XHRcdGlmKGkgPT0gMCAmJiBqID4gMCkge1xuXHRcdFx0XHRcdHZsID0gc2NvcGUubGluZXMudmVydGljYWxbai0xXVxuXHRcdFx0XHRcdHZsLnN0eWxlLmxlZnQgPSBNYXRoLmZsb29yKGJsb2NrU2l6ZVswXSAqIGopICsgJ3B4J1xuXHRcdFx0XHRcdHZsLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjZWxsID0gc2NvcGUuY2VsbHNbY291bnRdXG5cdFx0XHRcdGlmKGNlbGwgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbC5yZXNpemUoYmxvY2tTaXplLCByb3dbal0sIHJlc2l6ZVZpZGVvVmFycywgcmVzaXplSW1hZ2VWYXJzKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y291bnQrK1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGdyaWRDb250YWluZXIsXG5cdFx0Y2hpbGRyZW46IGdyaWRDaGlsZHJlbixcblx0XHRjZWxsczogY2VsbHMsXG5cdFx0bnVtOiB0b3RhbE51bSxcblx0XHRwb3NpdGlvbnM6IFtdLFxuXHRcdGxpbmVzOiB7XG5cdFx0XHRob3Jpem9udGFsOiBsaW5lc0hvcml6b250YWwsXG5cdFx0XHR2ZXJ0aWNhbDogbGluZXNWZXJ0aWNhbFxuXHRcdH0sXG5cdFx0cmVzaXplOiByZXNpemUsXG5cdFx0aW5pdDogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGNlbGxzW2ldICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNlbGxzW2ldLmluaXQoKVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5jbGVhcigpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiLypcblx0d2lkdGg6IFx0XHR3aWR0aCBvZiBncmlkXG5cdGhlaWdodDogXHRoZWlnaHQgb2YgZ3JpZFxuXHRjb2x1bW5zOiBcdG51bWJlciBvZiBjb2x1bW5zXG5cdHJvd3M6IFx0XHRudW1iZXIgb2Ygcm93c1xuXHR0eXBlOiBcdFx0dHlwZSBvZiB0aGUgYXJyYXlcblx0XHRcdFx0bGluZWFyIC0gd2lsbCBnaXZlIGFsbCB0aGUgY29scyBhbmQgcm93cyBwb3NpdGlvbiB0b2dldGhlciBvbmUgYWZ0ZXIgdGhlIG90aGVyXG5cdFx0XHRcdGNvbHNfcm93cyAtIHdpbGwgZ2l2ZSBzZXBhcmF0ZSByb3dzIGFycmF5cyB3aXRoIHRoZSBjb2xzIGluc2lkZSBcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm93WyBbY29sXSwgW2NvbF0sIFtjb2xdLCBbY29sXSBdXG4qL1xuXG5leHBvcnQgZGVmYXVsdCAod2lkdGgsIGhlaWdodCwgY29sdW1ucywgcm93cywgdHlwZSk9PiB7XG5cblx0dmFyIHQgPSB0eXBlIHx8ICdsaW5lYXInXG5cdHZhciBibG9ja1NpemUgPSBbIHdpZHRoIC8gY29sdW1ucywgaGVpZ2h0IC8gcm93cyBdXG5cdHZhciBibG9ja3NMZW4gPSByb3dzICogY29sdW1uc1xuXHR2YXIgcG9zaXRpb25zID0gW11cblx0XG5cdHZhciBwb3NYID0gMFxuXHR2YXIgcG9zWSA9IDBcblx0dmFyIGNvbHVtbkNvdW50ZXIgPSAwXG5cdHZhciByb3dzQ291bnRlciA9IDBcblx0dmFyIHJyID0gW11cblxuXHRzd2l0Y2godCkge1xuXHRcdGNhc2UgJ2xpbmVhcic6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdFx0XHRjb2x1bW5Db3VudGVyICs9IDFcblx0XHRcdFx0cG9zaXRpb25zW2ldID0gYlxuXHRcdFx0fTtcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnY29sc19yb3dzJzogXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrc0xlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cdFx0XHRcdHJyLnB1c2goYilcblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdGlmKGNvbHVtbkNvdW50ZXIgPj0gY29sdW1ucykge1xuXHRcdFx0XHRcdHBvc1ggPSAwXG5cdFx0XHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdFx0XHRjb2x1bW5Db3VudGVyID0gMFxuXHRcdFx0XHRcdHBvc2l0aW9uc1tyb3dzQ291bnRlcl0gPSByclxuXHRcdFx0XHRcdHJyID0gW11cblx0XHRcdFx0XHRyb3dzQ291bnRlcisrXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHR9XG5cblxuXHRyZXR1cm4ge1xuXHRcdHJvd3M6IHJvd3MsXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRibG9ja1NpemU6IGJsb2NrU2l6ZSxcblx0XHRwb3NpdGlvbnM6IHBvc2l0aW9uc1xuXHR9XG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IHRleHRCdG4gZnJvbSAndGV4dC1idG4nXG5cbnZhciBoZWFkZXJMaW5rcyA9IChwYXJlbnQpPT4ge1xuXHR2YXIgc2NvcGU7XG5cblx0dmFyIG9uU3ViTWVudU1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGUuY3VycmVudFRhcmdldCwgJ2hvdmVyZWQnKVxuXHR9XG5cdHZhciBvblN1Yk1lbnVNb3VzZUxlYXZlID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXG5cdHZhciBzaW1wbGVUZXh0QnRuc0VsID0gZG9tLnNlbGVjdC5hbGwoJy50ZXh0LWJ0bicsIHBhcmVudClcblx0dmFyIHNpbXBsZUJ0bnMgPSBbXVxuXHR2YXIgaSwgcywgZWw7XG5cdGZvciAoaSA9IDA7IGkgPCBzaW1wbGVUZXh0QnRuc0VsLmxlbmd0aDsgaSsrKSB7XG5cdFx0ZWwgPSBzaW1wbGVUZXh0QnRuc0VsW2ldXG5cdFx0cyA9IHRleHRCdG4oZWwpXG5cdFx0c2ltcGxlQnRuc1tpXSA9IHNcblx0fVxuXG5cdHZhciBzaG9wV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zaG9wLXdyYXBwZXInLCBwYXJlbnQpXG5cdHNob3BXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvblN1Yk1lbnVNb3VzZUVudGVyKVxuXHRzaG9wV3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25TdWJNZW51TW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgLyAzXG5cblx0XHRcdHZhciBjYW1wZXJMYWIgPSBzaW1wbGVCdG5zWzFdXG5cdFx0XHR2YXIgc2hvcCA9IHNpbXBsZUJ0bnNbMl1cblx0XHRcdHZhciBtYXAgPSBzaW1wbGVCdG5zWzBdXG5cdFx0XHR2YXIgc2hvcFNpemUgPSBkb20uc2l6ZShzaG9wV3JhcHBlcilcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtIGNhbXBlckxhYi5zaXplWzBdLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBzaG9wQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBjYW1wZXJMYWJDc3MubGVmdCAtIHNob3BTaXplWzBdIC0gcGFkZGluZyAtIDIwLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBtYXBDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHNob3BDc3MubGVmdCAtIG1hcC5zaXplWzBdIC0gcGFkZGluZyAtIDMwLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0c2hvcC5lbC5zdHlsZS5sZWZ0ID0gKHNob3BTaXplWzBdID4+IDEpIC0gKHNob3Auc2l6ZVswXSA+PiAxKSArICdweCdcblxuXHRcdFx0Y2FtcGVyTGFiLmVsLnN0eWxlLmxlZnQgPSBjYW1wZXJMYWJDc3MubGVmdCArICdweCdcblx0XHRcdGNhbXBlckxhYi5lbC5zdHlsZS50b3AgPSBjYW1wZXJMYWJDc3MudG9wICsgJ3B4J1xuXHRcdFx0c2hvcFdyYXBwZXIuc3R5bGUubGVmdCA9IHNob3BDc3MubGVmdCArICdweCdcblx0XHRcdHNob3BXcmFwcGVyLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwLmVsLnN0eWxlLmxlZnQgPSBtYXBDc3MubGVmdCArICdweCdcblx0XHRcdG1hcC5lbC5zdHlsZS50b3AgPSBtYXBDc3MudG9wICsgJ3B4J1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBoZWFkZXJMaW5rcyIsImltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5ncmlkLWJhY2tncm91bmQtY29udGFpbmVyJywgY29udGFpbmVyKVxuXHQvLyB2YXIgY2FudmFzZXMgPSBlbC5jaGlsZHJlblxuXHQvLyB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdC8vIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0dmFyIG9uSW1nTG9hZGVkQ2FsbGJhY2s7XG5cdHZhciBncmlkO1xuXHR2YXIgaW1hZ2U7XG5cdHZhciBpc1JlYWR5ID0gZmFsc2Vcblx0dmFyIGFuaW0gPSB7XG5cdFx0eDowLFxuXHRcdHk6MFxuXHR9XG5cblxuXHQvLyB2YXIgaXRlbXMgPSBbXVxuXHQvLyBmb3IgKHZhciBpID0gMDsgaSA8IGNhbnZhc2VzLmxlbmd0aDsgaSsrKSB7XG5cdC8vIFx0dmFyIHRtcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIFxuXHQvLyBcdGl0ZW1zW2ldID0ge1xuXHQvLyBcdFx0Y2FudmFzOiBjYW52YXNlc1tpXSxcblx0Ly8gXHRcdGN0eDogY2FudmFzZXNbaV0uZ2V0Q29udGV4dCgnMmQnKSxcblx0Ly8gXHRcdHRtcENhbnZhczogdG1wQ2FudmFzLFxuXHQvLyBcdFx0dG1wQ29udGV4dDogdG1wQ2FudmFzLmdldENvbnRleHQoJzJkJylcblx0Ly8gXHR9XG5cdC8vIH1cblxuXHR2YXIgb25JbWdSZWFkeSA9IChlcnJvciwgaSk9PiB7XG5cdFx0aW1hZ2UgPSBpXG5cdFx0ZG9tLnRyZWUuYWRkKGVsLCBpbWFnZSlcblx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdHNjb3BlLnJlc2l6ZShncmlkKVxuXHRcdGlmKG9uSW1nTG9hZGVkQ2FsbGJhY2spIG9uSW1nTG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdHJlc2l6ZTogKGdHcmlkKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0Z3JpZCA9IGdHcmlkXG5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyoxLjEsIHdpbmRvd0gqMS4xLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblx0XHRcdGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdFx0aW1hZ2Uuc3R5bGUud2lkdGggPSByZXNpemVWYXJzQmcud2lkdGggKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzQmcuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUudG9wID0gcmVzaXplVmFyc0JnLnRvcCAtIDEwICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnNCZy5sZWZ0IC0gMjAgKyAncHgnXG5cblx0XHRcdC8vIHZhciBibG9ja1NpemUgPSBnR3JpZC5ibG9ja1NpemVcblx0XHRcdC8vIHZhciBpbWFnZUJsb2NrU2l6ZSA9IFsgcmVzaXplVmFyc0JnLndpZHRoIC8gZ0dyaWQuY29sdW1ucywgcmVzaXplVmFyc0JnLmhlaWdodCAvIGdHcmlkLnJvd3MgXVxuXHRcdFx0Ly8gdmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHRcdC8vIHZhciBjb3VudCA9IDBcblx0XHRcdC8vIHZhciBjYW52YXMsIGN0eCwgdG1wQ29udGV4dCwgdG1wQ2FudmFzO1xuXG5cdFx0XHQvLyBmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdC8vIFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gXHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0Ly8gXHRcdGNhbnZhcyA9IGl0ZW1zW2NvdW50XS5jYW52YXNcblx0XHRcdC8vIFx0XHRjdHggPSBpdGVtc1tjb3VudF0uY3R4XG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dCA9IGl0ZW1zW2NvdW50XS50bXBDb250ZXh0XG5cdFx0XHQvLyBcdFx0dG1wQ2FudmFzID0gaXRlbXNbY291bnRdLnRtcENhbnZhc1xuXG5cdFx0XHQvLyBcdFx0Ly8gYmxvY2sgZGl2c1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS5sZWZ0ID0gcm93W2pdWzBdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS50b3AgPSByb3dbal1bMV0gKyAncHgnXG5cblx0XHRcdC8vIFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuc2F2ZSgpXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIGltYWdlQmxvY2tTaXplWzBdKmosIGltYWdlQmxvY2tTaXplWzFdKmksIGltYWdlQmxvY2tTaXplWzBdLCBpbWFnZUJsb2NrU2l6ZVsxXSwgMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LnJlc3RvcmUoKVxuXHRcdFx0Ly8gXHRcdGN0eC5kcmF3SW1hZ2UodG1wQ2FudmFzLCAwLCAwKVxuXG5cdFx0XHQvLyBcdFx0Y291bnQrK1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cblx0XHRcdGFuaW0ueCArPSAoKChtb3VzZS5uWC0wLjUpKjQwKSAtIGFuaW0ueCkgKiAwLjA1XG5cdFx0XHRhbmltLnkgKz0gKCgobW91c2UublktMC41KSoyMCkgLSBhbmltLnkpICogMC4wNVxuXHRcdFx0VXRpbHMuVHJhbnNsYXRlKGltYWdlLCBhbmltLngsIGFuaW0ueSwgMSlcblxuXHRcdH0sXG5cdFx0bG9hZDogKHVybCwgY2IpPT4ge1xuXHRcdFx0b25JbWdMb2FkZWRDYWxsYmFjayA9IGNiXG5cdFx0XHRpbWcodXJsLCBvbkltZ1JlYWR5KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZWwgPSBudWxsXG5cdFx0XHRpbWFnZSA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhLCBtb3VzZSwgb25Nb3VzZUV2ZW50c0hhbmRsZXIsIHB4Q29udGFpbmVyKT0+IHtcblxuXHR2YXIgYW5pbVBhcmFtcyA9IChzLCBkaXIpPT4ge1xuXHRcdHZhciB0bCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGwuZnJvbVRvKHMuc2NhbGUsIDEsIHsgeDoxLjcsIHk6MS4zIH0sIHsgeDpnbG9iYWxTY2FsZSwgeTpnbG9iYWxTY2FsZSwgZWFzZTpCYWNrLmVhc2VJbk91dH0sIDApXG5cdFx0dGwuZnJvbVRvKHMsIDEsIHsgYWxwaGE6MCwgcm90YXRpb246TWF0aC5QSSowLjA4KmRpciB9LCB7IGFscGhhOjEsIHJvdGF0aW9uOjAsIGVhc2U6RXhwby5lYXNlSW5PdXR9LCAwKVxuXHRcdHRsLnBhdXNlKDApXG5cdFx0cy5mcG9zaXRpb24gPSB7eDogMCwgeTogMH1cblx0XHRzLmlwb3NpdGlvbiA9IHt4OiAwLCB5OiAwfVxuXHRcdHMudmVsb2NpdHkgPSB7eDogMCwgeTogMH1cblx0XHRzLnRpbWUgPSAwXG5cdFx0cy50bCA9IHRsXG5cdFx0cy5jb25maWcgPSB7XG5cdFx0XHRsZW5ndGg6IDAsXG5cdFx0XHRzcHJpbmc6IDEuMSxcblx0XHRcdGZyaWN0aW9uOiAwLjRcblx0XHR9XG5cdH1cblxuXHR2YXIgc2NvcGU7XG5cdHZhciBnbG9iYWxTY2FsZSA9IDAuNlxuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcubWFpbi1idG5zLXdyYXBwZXInLCBjb250YWluZXIpXG5cdHZhciBzaG9wQnRuID0gZG9tLnNlbGVjdCgnI3Nob3AtYnRuJywgZWwpXG5cdHZhciBmdW5CdG4gPSBkb20uc2VsZWN0KCcjZnVuLWZhY3QtYnRuJywgZWwpXG5cdHZhciBzaG9wU2l6ZSwgZnVuU2l6ZTtcblx0dmFyIGxvYWRDb3VudGVyID0gMFxuXHR2YXIgYnV0dG9uU2l6ZSA9IFswLCAwXVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgc2hvcFNwcml0ZSwgZnVuU3ByaXRlLCBjdXJyZW50QW5pbTtcblxuXHR2YXIgc2hvcEltZyA9IGltZyhBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2Uvc2hvcC8nK0FwcFN0b3JlLmxhbmcoKSsnLnBuZycsICgpPT4ge1xuXHRcdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShzaG9wSW1nLnNyYykpXG5cdFx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdFx0cHhDb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXHRcdGFuaW1QYXJhbXMoc3ByaXRlLCAtMSlcblx0XHRzaG9wU3ByaXRlID0gc3ByaXRlXG5cdFx0c2hvcFNpemUgPSBbc2hvcEltZy53aWR0aCwgc2hvcEltZy5oZWlnaHRdXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblx0dmFyIGZ1bkltZyA9IGltZyhBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZnVuLWZhY3RzLnBuZycsICgpPT4ge1xuXHRcdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoUElYSS5UZXh0dXJlLmZyb21JbWFnZShmdW5JbWcuc3JjKSlcblx0XHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0XHRweENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG5cdFx0YW5pbVBhcmFtcyhzcHJpdGUsIDEpXG5cblx0XHRmdW5TcHJpdGUgPSBzcHJpdGVcblx0XHRmdW5TaXplID0gW2Z1bkltZy53aWR0aCwgZnVuSW1nLmhlaWdodF1cblxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXG5cdHZhciB1cGRhdGVBbmltID0gKHMpPT4ge1xuXHRcdGlmKHMgPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHRzLnRpbWUgKz0gMC4xXG5cdFx0cy5mcG9zaXRpb24ueCA9IHMuaXBvc2l0aW9uLnhcblx0XHRzLmZwb3NpdGlvbi55ID0gcy5pcG9zaXRpb24ueVxuXHRcdHMuZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDE0MFxuXHRcdHMuZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDIwMFxuXG5cdFx0c3ByaW5nVG8ocywgcy5mcG9zaXRpb24sIDEpXG5cdFx0cy5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gcy5jb25maWcubGVuZ3RoKSAqIDAuMVxuXHRcdFxuXHRcdHMueCArPSBzLnZlbG9jaXR5Lnhcblx0XHRzLnkgKz0gcy52ZWxvY2l0eS55XG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFcgPSB3aW5kb3dXID4+IDFcblx0XHRcdFxuXHRcdFx0YnV0dG9uU2l6ZVswXSA9IG1pZFcgKiAwLjlcblx0XHRcdGJ1dHRvblNpemVbMV0gPSB3aW5kb3dIXG5cblx0XHRcdGlmKHNob3BTaXplICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS5oZWlnaHQgPSBidXR0b25TaXplWzFdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmxlZnQgPSAobWlkVyA+PiAxKSAtIChidXR0b25TaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGJ1dHRvblNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdFxuXHRcdFx0XHRzaG9wU3ByaXRlLnggPSBzaG9wU3ByaXRlLmlwb3NpdGlvbi54ID0gbWlkVyA+PiAxXG5cdFx0XHRcdHNob3BTcHJpdGUueSA9IHNob3BTcHJpdGUuaXBvc2l0aW9uLnkgPSB3aW5kb3dIID4+IDFcblxuXHRcdFx0XHRzaG9wU3ByaXRlLnNjYWxlLnggPSBzaG9wU3ByaXRlLnNjYWxlLnggPSBnbG9iYWxTY2FsZVxuXHRcdFx0fVxuXHRcdFx0aWYoZnVuU2l6ZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS5sZWZ0ID0gbWlkVyArIChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChidXR0b25TaXplWzFdID4+IDEpICsgJ3B4J1xuXG5cdFx0XHRcdGZ1blNwcml0ZS54ID0gZnVuU3ByaXRlLmlwb3NpdGlvbi54ID0gbWlkVyArIChtaWRXID4+IDEpXG5cdFx0XHRcdGZ1blNwcml0ZS55ID0gZnVuU3ByaXRlLmlwb3NpdGlvbi55ID0gd2luZG93SCA+PiAxXG5cdFx0XHRcdGZ1blNwcml0ZS5zY2FsZS54ID0gZnVuU3ByaXRlLnNjYWxlLnggPSBnbG9iYWxTY2FsZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b3ZlcjogKGlkKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRjdXJyZW50QW5pbSA9IChpZCA9PSAnc2hvcC1idG4nKSA/IHNob3BTcHJpdGUgOiBmdW5TcHJpdGVcblx0XHRcdGN1cnJlbnRBbmltLnRsLnRpbWVTY2FsZSgyLjgpLnBsYXkoMClcblx0XHRcdGN1cnJlbnRBbmltLmNvbmZpZy5sZW5ndGggPSA0MDBcblx0XHR9LFxuXHRcdG91dDogKGlkKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRjdXJyZW50QW5pbSA9IChpZCA9PSAnc2hvcC1idG4nKSA/IHNob3BTcHJpdGUgOiBmdW5TcHJpdGVcblx0XHRcdGN1cnJlbnRBbmltLnRsLnRpbWVTY2FsZSgzLjIpLnJldmVyc2UoKVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRpZihzaG9wU3ByaXRlID09IHVuZGVmaW5lZCkgcmV0dXJuIFxuXHRcdFx0dXBkYXRlQW5pbShzaG9wU3ByaXRlKVxuXHRcdFx0dXBkYXRlQW5pbShmdW5TcHJpdGUpXG5cdFx0fSxcblx0XHRhY3RpdmF0ZTogKCk9PiB7XG5cdFx0XHRzY29wZS5pc0FjdGl2ZSA9IHRydWVcblx0XHR9LFxuXHRcdGRpc2FjdGl2YXRlOiAoKT0+IHtcblx0XHRcdHNjb3BlLmlzQWN0aXZlID0gZmFsc2Vcblx0XHRcdHNob3BTcHJpdGUudGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdFx0ZnVuU3ByaXRlLnRsLnRpbWVTY2FsZSgzKS5yZXZlcnNlKClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKHNob3BTcHJpdGUpXG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChmdW5TcHJpdGUpXG5cdFx0XHRzaG9wU3ByaXRlLnRsLmNsZWFyKClcblx0XHRcdGZ1blNwcml0ZS50bC5jbGVhcigpXG5cdFx0XHRzaG9wU3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0ZnVuU3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRzaG9wU3ByaXRlID0gbnVsbFxuXHRcdFx0ZnVuU3ByaXRlID0gbnVsbFxuXHRcdFx0Y3VycmVudEFuaW0gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnTWFwX2hicydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgdHlwZSkgPT4ge1xuXG5cdC8vIHJlbmRlciBtYXBcblx0dmFyIG1hcFdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWFwLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdHZhciB0ID0gdGVtcGxhdGUoKVxuXHRlbC5pbm5lckhUTUwgPSB0XG5cdGRvbS50cmVlLmFkZChtYXBXcmFwcGVyLCBlbClcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBkaXIsIHN0ZXBFbDtcblx0dmFyIHNlbGVjdGVkRG90cyA9IFtdO1xuXHR2YXIgY3VycmVudFBhdGhzLCBmaWxsTGluZSwgZGFzaGVkTGluZSwgc3RlcFRvdGFsTGVuID0gMDtcblx0dmFyIHByZXZpb3VzSGlnaGxpZ2h0SW5kZXggPSB1bmRlZmluZWQ7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIHRpdGxlc1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudGl0bGVzLXdyYXBwZXInLCBlbClcblx0dmFyIG1hcGRvdHMgPSBkb20uc2VsZWN0LmFsbCgnI21hcC1kb3RzIC5kb3QtcGF0aCcsIGVsKVxuXHR2YXIgZm9vdHN0ZXBzID0gZG9tLnNlbGVjdC5hbGwoJyNmb290c3RlcHMgZycsIGVsKVxuXHR2YXIgbWFsbG9yY2FMb2dvID0gZG9tLnNlbGVjdCgnI21hbGxvcmNhLWxvZ28gcGF0aCcsIGVsKVxuXHR2YXIgY3VycmVudERvdDtcblxuXHQvLyBmaXggYnVnZ3kgb3JpZ2luIHBvc2l0aW9uXG5cdGlmKEFwcFN0b3JlLkRldGVjdG9yLmlzRmlyZWZveCkge1xuXHRcdHZhciBpLCBkb3Q7XG5cdFx0Zm9yIChpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChkb3QsICdmaXgtYnVnZ3ktb3JpZ2luLXBvc2l0aW9uJylcblx0XHR9XG5cdH1cblxuXHR2YXIgZmluZERvdEJ5SWQgPSAocGFyZW50LCBjaGlsZCk9PiB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXBkb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0aWYocGFyZW50ID09IGRvdC5pZCkge1xuXHRcdFx0XHRpZihjaGlsZCA9PSBkb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudC1pZCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRvdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uQ2VsbE1vdXNlRW50ZXIgPSAoaXRlbSk9PiB7XG5cdFx0Y3VycmVudERvdCA9IGZpbmREb3RCeUlkKGl0ZW1bMV0sIGl0ZW1bMF0pXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGN1cnJlbnREb3QsICdhbmltYXRlJylcblx0fVxuXHR2YXIgb25DZWxsTW91c2VMZWF2ZSA9IChpdGVtKT0+IHtcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3VycmVudERvdCwgJ2FuaW1hdGUnKVxuXHR9XG5cblx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0VOVEVSLCBvbkNlbGxNb3VzZUVudGVyKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0xFQVZFLCBvbkNlbGxNb3VzZUxlYXZlKVxuXG5cdH1cblxuXHR2YXIgdGl0bGVzID0ge1xuXHRcdCdkZWlhJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5kZWlhJywgdGl0bGVzV3JhcHBlcilcblx0XHR9LFxuXHRcdCdlcy10cmVuYyc6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuZXMtdHJlbmMnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2FyZWxsdWYnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmFyZWxsdWYnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRpdGxlUG9zWChwYXJlbnRXLCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudFcgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogdmFsXG5cdH1cblx0ZnVuY3Rpb24gdGl0bGVQb3NZKHBhcmVudEgsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50SCAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSCkgKiB2YWxcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBtYXBXcmFwcGVyLFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBtYXBXID0gNjkzLCBtYXBIID0gNTAwXG5cdFx0XHR2YXIgbWFwU2l6ZSA9IFtdXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyowLjM1LCB3aW5kb3dIKjAuMzUsIG1hcFcsIG1hcEgpXG5cdFx0XHRtYXBTaXplWzBdID0gbWFwVyAqIHJlc2l6ZVZhcnMuc2NhbGVcblx0XHRcdG1hcFNpemVbMV0gPSBtYXBIICogcmVzaXplVmFycy5zY2FsZVxuXG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IG1hcFNpemVbMF0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPSBtYXBTaXplWzFdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKG1hcFNpemVbMF0gPj4gMSkgLSA0MCArICdweCdcblx0XHRcdGVsLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1hcFNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgODAwKSArICdweCdcblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCAzMzApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgMTI1MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDg1MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDQyNikgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgNTAwKSArICdweCdcblx0XHR9LFxuXHRcdGhpZ2hsaWdodERvdHM6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHNlbGVjdGVkRG90cyA9IFtdXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0dmFyIGlkID0gZG90LmlkXG5cdFx0XHRcdHZhciBwYXJlbnRJZCA9IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRcdFx0Ly8gaWYoaWQgPT0gb2xkSGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gb2xkSGFzaC5wYXJlbnQpIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdFx0aWYoaWQgPT0gbmV3SGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gbmV3SGFzaC5wYXJlbnQpICBzZWxlY3RlZERvdHMucHVzaChkb3QpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gc2VsZWN0ZWREb3RzW2ldXG5cdFx0XHRcdGRvbS5jbGFzc2VzLmFkZChkb3QsICdhbmltYXRlJylcblx0XHRcdH07XG5cdFx0fSxcblx0XHRoaWdobGlnaHQ6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHZhciBvbGRJZCA9IG9sZEhhc2gudGFyZ2V0XG5cdFx0XHR2YXIgbmV3SWQgPSBuZXdIYXNoLnRhcmdldFxuXHRcdFx0dmFyIGN1cnJlbnQgPSBvbGRJZCArICctJyArIG5ld0lkXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvb3RzdGVwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgc3RlcCA9IGZvb3RzdGVwc1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBzdGVwLmlkXG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKGlkLCBvbGRJZCwgbmV3SWQpXG5cdFx0XHRcdGlmKGlkLmluZGV4T2Yob2xkSWQpID4gLTEgJiYgaWQuaW5kZXhPZihuZXdJZCkgPiAtMSkge1xuXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2cob2xkSWQsIG5ld0lkKVxuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBsYXN0IG9uZVxuXHRcdFx0XHRcdC8vIGlmKGkgPT0gcHJldmlvdXNIaWdobGlnaHRJbmRleCkgc3RlcEVsID0gZm9vdHN0ZXBzW2Zvb3RzdGVwcy5sZW5ndGgtMV1cblx0XHRcdFx0XHQvLyBlbHNlIHN0ZXBFbCA9IHN0ZXBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRzdGVwRWwgPSBzdGVwXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coc3RlcEVsKVxuXG5cdFx0XHRcdFx0ZGlyID0gaWQuaW5kZXhPZihjdXJyZW50KSA+IC0xID8gQXBwQ29uc3RhbnRzLkZPUldBUkQgOiBBcHBDb25zdGFudHMuQkFDS1dBUkRcblx0XHRcdFx0XHRwcmV2aW91c0hpZ2hsaWdodEluZGV4ID0gaVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRzY29wZS5oaWdobGlnaHREb3RzKG9sZEhhc2gsIG5ld0hhc2gpXG5cblx0XHRcdC8vIGN1cnJlbnRQYXRocyA9IGRvbS5zZWxlY3QuYWxsKCdwYXRoJywgc3RlcEVsKVxuXHRcdFx0Ly8gZmlsbExpbmUgPSBjdXJyZW50UGF0aHNbMF1cblx0XHRcdC8vIC8vIGRhc2hlZExpbmUgPSBjdXJyZW50UGF0aHNbMF1cblxuXHRcdFx0Ly8gLy8gY2hvb3NlIHBhdGggZGVwZW5kcyBvZiBmb290c3RlcCBkaXJlY3Rpb25cblx0XHRcdC8vIC8vIGlmKGRpciA9PSBBcHBDb25zdGFudHMuRk9SV0FSRCkge1xuXHRcdFx0Ly8gLy8gXHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1swXVxuXHRcdFx0Ly8gLy8gXHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdC8vIC8vIH1lbHNle1xuXHRcdFx0Ly8gLy8gXHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1sxXVxuXHRcdFx0Ly8gLy8gXHRjdXJyZW50UGF0aHNbMF0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdC8vIC8vIH1cblxuXHRcdFx0Ly8gc3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cblx0XHRcdC8vIC8vIGZpbmQgdG90YWwgbGVuZ3RoIG9mIHNoYXBlXG5cdFx0XHQvLyBzdGVwVG90YWxMZW4gPSBmaWxsTGluZS5nZXRUb3RhbExlbmd0aCgpXG5cdFx0XHQvLyBmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IHN0ZXBUb3RhbExlblxuXHRcdFx0Ly8gZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNoYXJyYXknXSA9IDBcblx0XHRcdFxuXHRcdFx0Ly8gLy8gc3RhcnQgYW5pbWF0aW9uIG9mIGRhc2hlZCBsaW5lXG5cdFx0XHQvLyAvLyBkb20uY2xhc3Nlcy5hZGQoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0XHQvLyAvLyBzdGFydCBhbmltYXRpb25cblx0XHRcdC8vIGRvbS5jbGFzc2VzLmFkZChmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0fSxcblx0XHRyZXNldEhpZ2hsaWdodDogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdC8vIHN0ZXBFbC5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0XHQvLyBjdXJyZW50UGF0aHNbMF0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0Ly8gY3VycmVudFBhdGhzWzFdLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdC8vIGRvbS5jbGFzc2VzLnJlbW92ZShmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHQvLyBkb20uY2xhc3Nlcy5yZW1vdmUoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZG90LCAnYW5pbWF0ZScpXG5cdFx0XHRcdH07XG5cdFx0XHR9LCAwKVxuXHRcdH0sXG5cdFx0dXBkYXRlUHJvZ3Jlc3M6IChwcm9ncmVzcyk9PiB7XG5cdFx0XHQvLyBpZihmaWxsTGluZSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdFx0dmFyIGRhc2hPZmZzZXQgPSAocHJvZ3Jlc3MgLyAxKSAqIHN0ZXBUb3RhbExlblxuXHRcdFx0Ly8gZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNob2Zmc2V0J10gPSBzdGVwVG90YWxMZW4gLSBkYXNoT2Zmc2V0XG5cdFx0XHQvLyBmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hhcnJheSddID0gZGFzaE9mZnNldFxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblx0XHRcdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0VOVEVSLCBvbkNlbGxNb3VzZUVudGVyKVxuXHRcdFx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfTEVBVkUsIG9uQ2VsbE1vdXNlTGVhdmUpXG5cdFx0XHR9XG5cdFx0XHR0aXRsZXMgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGZyb250LCB2aWRlb1VybCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgc3BsaXR0ZXIgPSB2aWRlb1VybC5zcGxpdCgnLycpXG5cdHZhciBuYW1lID0gc3BsaXR0ZXJbc3BsaXR0ZXIubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0dmFyIG5hbWVTcGxpdCA9IG5hbWUuc3BsaXQoJy0nKVxuXHR2YXIgbmFtZVBhcnRzID0gbmFtZVNwbGl0Lmxlbmd0aCA9PSAzID8gW25hbWVTcGxpdFswXSsnLScrbmFtZVNwbGl0WzFdLCBuYW1lU3BsaXRbMl1dIDogbmFtZVNwbGl0XG5cdHZhciBpbWdJZCA9ICdob21lLXZpZGVvLXNob3RzLycgKyBuYW1lXG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGxvb3A6IHRydWUsXG5cdFx0YXV0b3BsYXk6IGZhbHNlXG5cdH0pXG5cdHZhciBzaXplLCBwb3NpdGlvbiwgcmVzaXplVmlkZW9WYXJzLCByZXNpemVJbWFnZVZhcnM7XG5cdHZhciBpbWc7XG5cdHZhciBpc01vdXNlRW50ZXIgPSBmYWxzZTtcblxuXHR2YXIgb25Nb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlzTW91c2VFbnRlciA9IHRydWVcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUVudGVyKG5hbWVQYXJ0cylcblx0XHRpZihtVmlkZW8uaXNMb2FkZWQpIHtcblx0XHRcdGRvbS5jbGFzc2VzLmFkZChjb250YWluZXIsICdvdmVyJylcblx0XHRcdG1WaWRlby5wbGF5KDApXG5cdFx0fWVsc2V7XG5cdFx0XHRtVmlkZW8ubG9hZCh2aWRlb1VybCwgKCk9PiB7XG5cdFx0XHRcdGlmKCFpc01vdXNlRW50ZXIpIHJldHVyblxuXHRcdFx0XHRkb20uY2xhc3Nlcy5hZGQoY29udGFpbmVyLCAnb3ZlcicpXG5cdFx0XHRcdG1WaWRlby5wbGF5KClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uTW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpc01vdXNlRW50ZXIgPSBmYWxzZVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjb250YWluZXIsICdvdmVyJylcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUxlYXZlKG5hbWVQYXJ0cylcblx0XHRtVmlkZW8ucGF1c2UoMClcblx0fVxuXG5cdHZhciBvbkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFJvdXRlci5zZXRIYXNoKG5hbWVQYXJ0c1swXSArICcvJyArIG5hbWVQYXJ0c1sxXSlcblx0fVxuXG5cdHZhciBpbml0ID0gKCk9PiB7XG5cdFx0dmFyIGltZ1VybCA9IEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTChpbWdJZCkgXG5cdFx0aW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcblx0XHRpbWcuc3JjID0gaW1nVXJsXG5cdFx0ZG9tLnRyZWUuYWRkKGNvbnRhaW5lciwgaW1nKVxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIG1WaWRlby5lbClcblxuXHRcdGRvbS5ldmVudC5vbihmcm9udCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0ZG9tLmV2ZW50Lm9uKGZyb250LCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRkb20uZXZlbnQub24oZnJvbnQsICdjbGljaycsIG9uQ2xpY2spXG5cblx0XHRzY29wZS5pc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNSZWFkeTogZmFsc2UsXG5cdFx0aW5pdDogaW5pdCxcblx0XHRyZXNpemU6IChzLCBwLCBydnYsIHJpdik9PiB7XG5cblx0XHRcdHNpemUgPSBzID09IHVuZGVmaW5lZCA/IHNpemUgOiBzXG5cdFx0XHRwb3NpdGlvbiA9IHAgPT0gdW5kZWZpbmVkID8gcG9zaXRpb24gOiBwXG5cdFx0XHRyZXNpemVWaWRlb1ZhcnMgPSBydnYgPT0gdW5kZWZpbmVkID8gcmVzaXplVmlkZW9WYXJzIDogcnZ2XG5cdFx0XHRyZXNpemVJbWFnZVZhcnMgPSByaXYgPT0gdW5kZWZpbmVkID8gcmVzaXplSW1hZ2VWYXJzIDogcml2XG5cblx0XHRcdGlmKCFzY29wZS5pc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLndpZHRoID0gZnJvbnQuc3R5bGUud2lkdGggPSBzaXplWzBdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGZyb250LnN0eWxlLmhlaWdodCA9IHNpemVbMV0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUubGVmdCA9IGZyb250LnN0eWxlLmxlZnQgPSBwb3NpdGlvblswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS50b3AgPSBmcm9udC5zdHlsZS50b3AgPSBwb3NpdGlvblsxXSArICdweCdcblxuXHRcdFx0aW1nLnN0eWxlLndpZHRoID0gcmVzaXplSW1hZ2VWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLmhlaWdodCA9IHJlc2l6ZUltYWdlVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUubGVmdCA9IHJlc2l6ZUltYWdlVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLnRvcCA9IHJlc2l6ZUltYWdlVmFycy50b3AgKyAncHgnXG5cblx0XHRcdG1WaWRlby5lbC5zdHlsZS53aWR0aCA9IHJlc2l6ZVZpZGVvVmFycy53aWR0aCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5oZWlnaHQgPSByZXNpemVWaWRlb1ZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSByZXNpemVWaWRlb1ZhcnMubGVmdCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS50b3AgPSByZXNpemVWaWRlb1ZhcnMudG9wICsgJ3B4J1xuXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRtVmlkZW8uY2xlYXIoKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmcm9udCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZyb250LCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoZnJvbnQsICdjbGljaycsIG9uQ2xpY2spXG5cdFx0XHRtVmlkZW8gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCAocHJvcHMpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0dmlkZW8ucHJlbG9hZCA9IFwiXCJcblx0dmFyIG9uUmVhZHlDYWxsYmFjaztcblx0dmFyIHNpemUgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfVxuXHR2YXIgZUxpc3RlbmVycyA9IFtdXG5cblx0dmFyIG9uQ2FuUGxheSA9ICgpPT57XG5cdFx0c2NvcGUuaXNMb2FkZWQgPSB0cnVlXG5cdFx0aWYocHJvcHMuYXV0b3BsYXkpIHZpZGVvLnBsYXkoKVxuXHRcdGlmKHByb3BzLnZvbHVtZSAhPSB1bmRlZmluZWQpIHZpZGVvLnZvbHVtZSA9IHByb3BzLnZvbHVtZVxuXHRcdHNpemUud2lkdGggPSB2aWRlby52aWRlb1dpZHRoXG5cdFx0c2l6ZS5oZWlnaHQgPSB2aWRlby52aWRlb0hlaWdodFxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgICAgIG9uUmVhZHlDYWxsYmFjayhzY29wZSlcblx0fVxuXG5cdHZhciBwbGF5ID0gKHRpbWUpPT57XG5cdFx0aWYodGltZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHNjb3BlLnNlZWsodGltZSlcblx0XHR9XG4gICAgXHRzY29wZS5pc1BsYXlpbmcgPSB0cnVlXG4gICAgXHR2aWRlby5wbGF5KClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICBcdHRyeSB7XG4gICAgXHRcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZVxuXHRcdH1cblx0XHRjYXRjaChlcnIpIHtcblx0XHR9XG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKHRpbWUpPT57XG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHZvbHVtZSA9ICh2YWwpPT4ge1xuICAgIFx0aWYodmFsKSB7XG4gICAgXHRcdHNjb3BlLmVsLnZvbHVtZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC52b2x1bWVcbiAgICBcdH1cbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFRpbWUgPSAodmFsKT0+IHtcbiAgICBcdGlmKHZhbCkge1xuICAgIFx0XHRzY29wZS5lbC5jdXJyZW50VGltZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC5jdXJyZW50VGltZVxuICAgIFx0fVxuICAgIH1cblxuICAgIHZhciB3aWR0aCA9ICgpPT4ge1xuICAgIFx0cmV0dXJuIHNjb3BlLmVsLnZpZGVvV2lkdGhcbiAgICB9XG5cbiAgICB2YXIgaGVpZ2h0ID0gKCk9PiB7XG4gICAgXHRyZXR1cm4gc2NvcGUuZWwudmlkZW9IZWlnaHRcdFxuICAgIH1cblxuICAgIHZhciBlbmRlZCA9ICgpPT57XG4gICAgXHRpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICB9XG5cblx0dmFyIGFkZFRvID0gKHApPT4ge1xuXHRcdHNjb3BlLnBhcmVudCA9IHBcblx0XHRkb20udHJlZS5hZGQoc2NvcGUucGFyZW50LCB2aWRlbylcblx0fVxuXG5cdHZhciBvbiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGVMaXN0ZW5lcnMucHVzaCh7ZXZlbnQ6ZXZlbnQsIGNiOmNifSlcblx0XHR2aWRlby5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdHZhciBvZmYgPSAoZXZlbnQsIGNiKT0+IHtcblx0XHRmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0XHRcdHZhciBlID0gZUxpc3RlbmVyc1tpXVxuXHRcdFx0aWYoZS5ldmVudCA9PSBldmVudCAmJiBlLmNiID09IGNiKSB7XG5cdFx0XHRcdGVMaXN0ZW5lcnMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIGNsZWFyQWxsRXZlbnRzID0gKCk9PiB7XG5cdCAgICBmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0ICAgIFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdCAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZS5ldmVudCwgZS5jYik7XG5cdCAgICB9XG5cdCAgICBlTGlzdGVuZXJzLmxlbmd0aCA9IDBcblx0ICAgIGVMaXN0ZW5lcnMgPSBudWxsXG5cdH1cblxuXHR2YXIgY2xlYXIgPSAoKT0+IHtcbiAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cdCAgICBzY29wZS5jbGVhckFsbEV2ZW50cygpXG5cdCAgICBzaXplID0gbnVsbFxuXHQgICAgdmlkZW8gPSBudWxsXG4gICAgfVxuXG4gICAgdmFyIGFkZFNvdXJjZVRvVmlkZW8gPSAoZWxlbWVudCwgc3JjLCB0eXBlKT0+IHtcblx0ICAgIHZhciBzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcblx0ICAgIHNvdXJjZS5zcmMgPSBzcmM7XG5cdCAgICBzb3VyY2UudHlwZSA9IHR5cGU7XG5cdCAgICBkb20udHJlZS5hZGQoZWxlbWVudCwgc291cmNlKVxuXHR9XG5cdFxuXHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cblx0c2NvcGUgPSB7XG5cdFx0cGFyZW50OiB1bmRlZmluZWQsXG5cdFx0ZWw6IHZpZGVvLFxuXHRcdHNpemU6IHNpemUsXG5cdFx0cGxheTogcGxheSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHR2b2x1bWU6IHZvbHVtZSxcblx0XHRjdXJyZW50VGltZTogY3VycmVudFRpbWUsXG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdGFkZFRvOiBhZGRUbyxcblx0XHRvbjogb24sXG5cdFx0b2ZmOiBvZmYsXG5cdFx0Y2xlYXI6IGNsZWFyLFxuXHRcdGNsZWFyQWxsRXZlbnRzOiBjbGVhckFsbEV2ZW50cyxcblx0XHRpc1BsYXlpbmc6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuXHRcdGlzTG9hZGVkOiBmYWxzZSxcblx0XHRsb2FkOiAoc3JjLCBjYWxsYmFjayk9PiB7XG5cdFx0XHRvblJlYWR5Q2FsbGJhY2sgPSBjYWxsYmFja1xuXHRcdFx0YWRkU291cmNlVG9WaWRlbyh2aWRlbywgc3JjLCAndmlkZW8vbXA0Jylcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhKT0+IHtcblx0XG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnZm9vdGVyJywgY29udGFpbmVyKVxuXHR2YXIgYnV0dG9ucyA9IGRvbS5zZWxlY3QuYWxsKCdsaScsIGVsKVxuXG5cdHZhciBvbkJ0bkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcblx0XHR2YXIgaWQgPSB0YXJnZXQuaWRcblx0XHR2YXIgdXJsID0gdW5kZWZpbmVkO1xuXHRcdHN3aXRjaChpZCkge1xuXHRcdFx0Y2FzZSAnaG9tZSc6XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkZlZWQoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnZ3JpZCc6XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkdyaWQoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnY29tJzpcblx0XHRcdFx0dXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdsYWInOlxuXHRcdFx0XHR1cmwgPSBkYXRhLmxhYlVybFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnc2hvcCc6XG5cdFx0XHRcdHVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJ1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0XHRpZih1cmwgIT0gdW5kZWZpbmVkKSB3aW5kb3cub3Blbih1cmwsJ19ibGFuaycpXG5cdH1cblxuXHR2YXIgYnRuLCBpXG5cdGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0YnRuID0gYnV0dG9uc1tpXVxuXHRcdGRvbS5ldmVudC5vbihidG4sICdjbGljaycsIG9uQnRuQ2xpY2spXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgYnRuVyA9IHdpbmRvd1cgLyBidXR0b25zLmxlbmd0aFxuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJ0biA9IGJ1dHRvbnNbaV1cblx0XHRcdFx0YnRuLnN0eWxlLndpZHRoID0gYnRuVyArICdweCdcblx0XHRcdFx0YnRuLnN0eWxlLmxlZnQgPSBidG5XICogaSArIFwicHhcIlxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGlwdHlxdWVQYXJ0IGZyb20gJ2RpcHR5cXVlLXBhcnQnXG5pbXBvcnQgY2hhcmFjdGVyIGZyb20gJ2NoYXJhY3RlcidcbmltcG9ydCBmdW5GYWN0IGZyb20gJ2Z1bi1mYWN0LWhvbGRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgYXJyb3dzV3JhcHBlciBmcm9tICdhcnJvd3Mtd3JhcHBlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBzZWxmaWVTdGljayBmcm9tICdzZWxmaWUtc3RpY2snXG5pbXBvcnQgbWFpbkJ0bnMgZnJvbSAnbWFpbi1kaXB0eXF1ZS1idG5zJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXB0eXF1ZSBleHRlbmRzIFBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG5cdFx0dmFyIG5leHREaXB0eXF1ZSA9IEFwcFN0b3JlLmdldE5leHREaXB0eXF1ZSgpXG5cdFx0dmFyIHByZXZpb3VzRGlwdHlxdWUgPSBBcHBTdG9yZS5nZXRQcmV2aW91c0RpcHR5cXVlKClcblx0XHRwcm9wcy5kYXRhWyduZXh0LXBhZ2UnXSA9IG5leHREaXB0eXF1ZVxuXHRcdHByb3BzLmRhdGFbJ3ByZXZpb3VzLXBhZ2UnXSA9IHByZXZpb3VzRGlwdHlxdWVcblx0XHRwcm9wcy5kYXRhWyduZXh0LXByZXZpZXctdXJsJ10gPSBBcHBTdG9yZS5nZXRQcmV2aWV3VXJsQnlIYXNoKG5leHREaXB0eXF1ZSlcblx0XHRwcm9wcy5kYXRhWydwcmV2aW91cy1wcmV2aWV3LXVybCddID0gQXBwU3RvcmUuZ2V0UHJldmlld1VybEJ5SGFzaChwcmV2aW91c0RpcHR5cXVlKVxuXHRcdHByb3BzLmRhdGFbJ2ZhY3QtdHh0J10gPSBwcm9wcy5kYXRhLmZhY3RbJ2VuJ11cblxuXHRcdHN1cGVyKHByb3BzKVxuXG5cdFx0dGhpcy5vbk1vdXNlTW92ZSA9IHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlRW50ZXIgPSB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQXJyb3dNb3VzZUxlYXZlID0gdGhpcy5vbkFycm93TW91c2VMZWF2ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZCA9IHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlciA9IHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk9wZW5GYWN0ID0gdGhpcy5vbk9wZW5GYWN0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uQ2xvc2VGYWN0ID0gdGhpcy5vbkNsb3NlRmFjdC5iaW5kKHRoaXMpXG5cdFx0dGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRoaXMudWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQuYmluZCh0aGlzKVxuXG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsIHRoaXMub25DbG9zZUZhY3QpXG5cblx0XHR0aGlzLnVpSW5UbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5sZWZ0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnc2hvZS1iZycpXG5cdFx0KVxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXItYmcnKVxuXHRcdClcblxuXHRcdHRoaXMuYmx1ckZpbHRlciA9IG5ldyBQSVhJLmZpbHRlcnMuQmx1ckZpbHRlcigpXG5cdFx0dGhpcy5ibHVyRmlsdGVyLmJsdXJYID0gMFxuXHRcdHRoaXMuYmx1ckZpbHRlci5ibHVyWSA9IDBcblx0XHR0aGlzLnB4Q29udGFpbmVyLmZpbHRlcnMgPSBbIHRoaXMuYmx1ckZpbHRlciBdXG5cblx0XHR2YXIgaW1nRXh0ID0gQXBwU3RvcmUuZ2V0SW1hZ2VEZXZpY2VFeHRlbnNpb24oKVxuXG5cdFx0dGhpcy5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXIodGhpcy5yaWdodFBhcnQuaG9sZGVyLCB0aGlzLmdldEltYWdlVXJsQnlJZCgnY2hhcmFjdGVyJytpbWdFeHQpLCB0aGlzLmdldEltYWdlU2l6ZUJ5SWQoJ2NoYXJhY3RlcicraW1nRXh0KSlcblx0XHR0aGlzLmZ1bkZhY3QgPSBmdW5GYWN0KHRoaXMucHhDb250YWluZXIsIHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhLCB0aGlzLnByb3BzKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IGFycm93c1dyYXBwZXIodGhpcy5lbGVtZW50LCB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLCB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sgPSBzZWxmaWVTdGljayh0aGlzLmVsZW1lbnQsIHRoaXMubW91c2UsIHRoaXMucHJvcHMuZGF0YSlcblx0XHR0aGlzLm1haW5CdG5zID0gbWFpbkJ0bnModGhpcy5lbGVtZW50LCB0aGlzLnByb3BzLmRhdGEsIHRoaXMubW91c2UsIHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlciwgdGhpcy5weENvbnRhaW5lcilcblxuXHRcdGRvbS5ldmVudC5vbih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdsZWZ0JyksIHsgeDotQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXHRcdFR3ZWVuTWF4LnNldCh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZCgncmlnaHQnKSwgeyB4OkFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkcgfSlcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHRoaXMudXBkYXRlVGltZWxpbmVzKClcblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uT3V0KCkge1xuXHRcdHRoaXMuc2VsZmllU3RpY2suaWdub3JlT3BlbiA9IHRydWVcblx0XHRpZih0aGlzLmZ1bkZhY3QuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLmZ1bkZhY3QuY2xvc2UodHJ1ZSlcblx0XHRcdHNldFRpbWVvdXQoKCk9PnN1cGVyLndpbGxUcmFuc2l0aW9uT3V0KCksIDEwMClcblx0XHR9ZWxzZXtcblx0XHRcdHN1cGVyLndpbGxUcmFuc2l0aW9uT3V0KClcblx0XHR9XG5cdH1cblx0dXBkYXRlVGltZWxpbmVzKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmhvbGRlciwgMSwgeyB4OiAtd2luZG93VyA+PiAxLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMubGVmdFBhcnQuYmdTcHJpdGUueCAtIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5yaWdodFBhcnQuYmdTcHJpdGUueCArIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUuc2NhbGUsIDEsIHsgeDogMywgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjQpXG5cblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5sZWZ0LCAwLjUsIHsgeDogLTEwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5hcnJvd3NXcmFwcGVyLnJpZ2h0LCAwLjUsIHsgeDogMTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLnNlbGZpZVN0aWNrLmVsLCAwLjUsIHsgeTogNTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLmxlZnRQYXJ0LmhvbGRlciwgMSwgeyB4OiAtd2luZG93VyA+PiAxLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5yaWdodFBhcnQuaG9sZGVyLCAxLCB7IHg6IHdpbmRvd1csIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0XG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLmFycm93c1dyYXBwZXIubGVmdCwgMSwgeyB4OiAtMTAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuYXJyb3dzV3JhcHBlci5yaWdodCwgMSwgeyB4OiAxMDAsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5zZWxmaWVTdGljay5lbCwgMSwgeyB5OiA1MDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC41KVxuXHRcdHRoaXMudWlJblRsLnBhdXNlKDApXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCk7XG5cdH1cblx0dWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQoKSB7XG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnRyYW5zaXRpb25JbkNvbXBsZXRlZCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSB0cnVlXG5cdFx0dGhpcy51aUluVGwudGltZVNjYWxlKDEuNikucGxheSgpXHRcdFxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHRvbk1vdXNlTW92ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLm1vdXNlLnggPSBlLmNsaWVudFhcblx0XHR0aGlzLm1vdXNlLnkgPSBlLmNsaWVudFlcblx0XHR0aGlzLm1vdXNlLm5YID0gKGUuY2xpZW50WCAvIHdpbmRvd1cpICogMVxuXHRcdHRoaXMubW91c2UublkgPSAoZS5jbGllbnRZIC8gd2luZG93SCkgKiAxXG5cblx0XHR2YXIgbmV3Qmx1cjtcblx0XHRpZih0aGlzLnNlbGZpZVN0aWNrLmlzT3BlbmVkKSB7XG5cdFx0XHRuZXdCbHVyID0gNCArICgwLjUgKiB0aGlzLm1vdXNlLm5ZKVxuXHRcdH1lbHNle1xuXHRcdFx0bmV3Qmx1ciA9IDYgKiBNYXRoLm1heCh0aGlzLm1vdXNlLm5ZIC0gMC41LCAwKVxuXHRcdH1cblx0XHR0aGlzLmJsdXJGaWx0ZXIuYmx1clkgKz0gKG5ld0JsdXIgLSB0aGlzLmJsdXJGaWx0ZXIuYmx1clkpICogMC4xXG5cdH1cblx0b25TZWxmaWVTdGlja0NsaWNrZWQoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlmKHRoaXMuc2VsZmllU3RpY2suaXNPcGVuZWQpIHtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2suY2xvc2UoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5zZWxmaWVTdGljay5vcGVuKClcblx0XHRcdHRoaXMubWFpbkJ0bnMuYWN0aXZhdGUoKVxuXHRcdH1cblx0fVxuXHRvbkFycm93TW91c2VFbnRlcihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cblx0XHR2YXIgcG9zWDtcblx0XHR2YXIgb2Zmc2V0WCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblx0XHRpZihpZCA9PSAnbGVmdCcpIHBvc1ggPSBvZmZzZXRYXG5cdFx0ZWxzZSBwb3NYID0gLW9mZnNldFhcblxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMucHhDb250YWluZXIsIDAuNCwgeyB4OnBvc1gsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblx0XHRUd2Vlbk1heC50byh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZChpZCksIDAuNCwgeyB4OjAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5vdmVyKGlkKVxuXHR9XG5cdG9uQXJyb3dNb3VzZUxlYXZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblxuXHRcdHZhciBwb3NYO1xuXHRcdHZhciBvZmZzZXRYID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXHRcdGlmKGlkID09ICdsZWZ0JykgcG9zWCA9IC1vZmZzZXRYXG5cdFx0ZWxzZSBwb3NYID0gb2Zmc2V0WFxuXG5cdFx0VHdlZW5NYXgudG8odGhpcy5weENvbnRhaW5lciwgMC42LCB7IHg6MCwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblx0XHRUd2Vlbk1heC50byh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZChpZCksIDAuNiwgeyB4OnBvc1gsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cblx0XHR0aGlzLmFycm93c1dyYXBwZXIub3V0KGlkKVxuXHR9XG5cdG9uTWFpbkJ0bnNFdmVudEhhbmRsZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB0eXBlID0gZS50eXBlXG5cdFx0dmFyIHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxuXHRcdHZhciBpZCA9IHRhcmdldC5pZFxuXHRcdGlmKHR5cGUgPT0gJ2NsaWNrJyAmJiBpZCA9PSAnZnVuLWZhY3QtYnRuJykge1xuXHRcdFx0aWYodGhpcy5mdW5GYWN0LmlzT3Blbikge1xuXHRcdFx0XHRBcHBBY3Rpb25zLmNsb3NlRnVuRmFjdCgpXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuRnVuRmFjdCgpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnbW91c2VlbnRlcicpIHtcblx0XHRcdHRoaXMubWFpbkJ0bnMub3ZlcihpZClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdtb3VzZWxlYXZlJykge1xuXHRcdFx0dGhpcy5tYWluQnRucy5vdXQoaWQpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnY2xpY2snICYmIGlkID09ICdzaG9wLWJ0bicpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHRoaXMucHJvcHMuZGF0YVsnc2hvcC11cmwnXSwgJ19ibGFuaycpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdH1cblx0b25PcGVuRmFjdCgpe1xuXHRcdHRoaXMuZnVuRmFjdC5vcGVuKClcblx0XHR0aGlzLm1haW5CdG5zLmRpc2FjdGl2YXRlKClcblx0fVxuXHRvbkNsb3NlRmFjdCgpe1xuXHRcdHRoaXMuZnVuRmFjdC5jbG9zZSgpXG5cdFx0dGhpcy5tYWluQnRucy5hY3RpdmF0ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuY2hhcmFjdGVyLnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMubGVmdFBhcnQudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5yaWdodFBhcnQudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5zZWxmaWVTdGljay51cGRhdGUoKVxuXHRcdHRoaXMuZnVuRmFjdC51cGRhdGUoKVxuXHRcdHRoaXMubWFpbkJ0bnMudXBkYXRlKClcblxuXHRcdHN1cGVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRpZih0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCkge1xuXHRcdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHRcdHRoaXMudGxPdXQuY2xlYXIoKVxuXHRcdFx0dGhpcy51aUluVGwuY2xlYXIoKVxuXHRcdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRcdHRoaXMudXBkYXRlVGltZWxpbmVzKClcblx0XHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHRcdHRoaXMudGxJbi5wYXVzZSh0aGlzLnRsSW4udG90YWxEdXJhdGlvbigpKVxuXHRcdFx0dGhpcy51aUluVGwucGF1c2UodGhpcy51aUluVGwudG90YWxEdXJhdGlvbigpKVxuXHRcdH1cblxuXHRcdHRoaXMubGVmdFBhcnQucmVzaXplKClcblx0XHR0aGlzLnJpZ2h0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMuY2hhcmFjdGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5mdW5GYWN0LnJlc2l6ZSgpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5zZWxmaWVTdGljay5yZXNpemUoKVxuXHRcdHRoaXMubWFpbkJ0bnMucmVzaXplKClcblxuXHRcdHRoaXMucmlnaHRQYXJ0LmhvbGRlci54ID0gKHdpbmRvd1cgPj4gMSlcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5weENvbnRhaW5lci5maWx0ZXJzID0gW11cblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLkNMT1NFX0ZVTl9GQUNULCB0aGlzLm9uQ2xvc2VGYWN0KVxuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblx0XHRkb20uZXZlbnQub2ZmKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHR0aGlzLnVpSW5UbC5jbGVhcigpXG5cdFx0dGhpcy5sZWZ0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5yaWdodFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMuY2hhcmFjdGVyLmNsZWFyKClcblx0XHR0aGlzLmZ1bkZhY3QuY2xlYXIoKVxuXHRcdHRoaXMuc2VsZmllU3RpY2suY2xlYXIoKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5jbGVhcigpXG5cdFx0dGhpcy5tYWluQnRucy5jbGVhcigpXG5cdFx0dGhpcy51aUluVGwgPSBudWxsXG5cdFx0dGhpcy5tb3VzZSA9IG51bGxcblx0XHR0aGlzLmxlZnRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMuY2hhcmFjdGVyID0gbnVsbFxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IG51bGxcblx0XHR0aGlzLm1haW5CdG5zID0gbnVsbFxuXHRcdHRoaXMuYmx1ckZpbHRlciA9IG51bGxcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBib3R0b21UZXh0cyBmcm9tICdib3R0b20tdGV4dHMtaG9tZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGdyaWQgZnJvbSAnZ3JpZC1ob21lJ1xuaW1wb3J0IGltYWdlQ2FudmFzZXNHcmlkIGZyb20gJ2ltYWdlLXRvLWNhbnZhc2VzLWdyaWQnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHR2YXIgY29udGVudCA9IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXHRcdHZhciB0ZXh0cyA9IGNvbnRlbnQudGV4dHNbQXBwU3RvcmUubGFuZygpXVxuXHRcdHByb3BzLmRhdGEuZmFjZWJvb2tVcmwgPSBnZW5lcmFJbmZvc1snZmFjZWJvb2tfdXJsJ11cblx0XHRwcm9wcy5kYXRhLnR3aXR0ZXJVcmwgPSBnZW5lcmFJbmZvc1sndHdpdHRlcl91cmwnXVxuXHRcdHByb3BzLmRhdGEuaW5zdGFncmFtVXJsID0gZ2VuZXJhSW5mb3NbJ2luc3RhZ3JhbV91cmwnXVxuXHRcdHByb3BzLmRhdGEuZ3JpZCA9IFtdXG5cdFx0cHJvcHMuZGF0YS5ncmlkLmxlbmd0aCA9IDI4XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddID0geyBob3Jpem9udGFsOiBbXSwgdmVydGljYWw6IFtdIH1cblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10uaG9yaXpvbnRhbC5sZW5ndGggPSAzXG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLnZlcnRpY2FsLmxlbmd0aCA9IDZcblx0XHRwcm9wcy5kYXRhWydnZW5lcmljJ10gPSB0ZXh0cy5nZW5lcmljXG5cdFx0cHJvcHMuZGF0YVsnZGVpYS10eHQnXSA9IHRleHRzWydkZWlhJ11cblx0XHRwcm9wcy5kYXRhWydhcmVsbHVmLXR4dCddID0gdGV4dHNbJ2FyZWxsdWYnXVxuXHRcdHByb3BzLmRhdGFbJ2VzLXRyZW5jLXR4dCddID0gdGV4dHNbJ2VzLXRyZW5jJ11cblxuXHRcdHN1cGVyKHByb3BzKVxuXHRcdHZhciBiZ1VybCA9IHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdiYWNrZ3JvdW5kJylcblx0XHR0aGlzLnByb3BzLmRhdGEuYmd1cmwgPSBiZ1VybFxuXG5cdFx0dGhpcy50cmlnZ2VyTmV3SXRlbSA9IHRoaXMudHJpZ2dlck5ld0l0ZW0uYmluZCh0aGlzKVxuXHRcdHRoaXMub25JdGVtRW5kZWQgPSB0aGlzLm9uSXRlbUVuZGVkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sYXN0R3JpZEl0ZW1JbmRleDtcblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAyMDBcblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDEsIDMsIDUsXG5cdFx0XHQ3LCA5LCAxMSxcblx0XHRcdDE1LCAxNyxcblx0XHRcdDIxLCAyMywgMjVcblx0XHRdXG5cblx0XHR0aGlzLnVzZWRTZWF0cyA9IFtdXG5cblx0XHR0aGlzLmltZ0NHcmlkID0gaW1hZ2VDYW52YXNlc0dyaWQodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuaW1nQ0dyaWQubG9hZCh0aGlzLnByb3BzLmRhdGEuYmd1cmwpXG5cdFx0dGhpcy5ncmlkID0gZ3JpZCh0aGlzLnByb3BzLCB0aGlzLmVsZW1lbnQsIHRoaXMub25JdGVtRW5kZWQpXG5cdFx0dGhpcy5ncmlkLmluaXQoKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBib3R0b21UZXh0cyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBhcm91bmRCb3JkZXIodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93LndcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYXJvdW5kQm9yZGVyLmVsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYXJvdW5kQm9yZGVyLmxldHRlcnMsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5pbWdDR3JpZC5lbCwgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmNoaWxkcmVuLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjEpXG5cdFx0dGhpcy50bEluLnN0YWdnZXJGcm9tKHRoaXMuZ3JpZC5saW5lcy5ob3Jpem9udGFsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjIpXG5cdFx0dGhpcy50bEluLnN0YWdnZXJGcm9tKHRoaXMuZ3JpZC5saW5lcy52ZXJ0aWNhbCwgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC4wMSwgMC4yKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYm90dG9tVGV4dHMuZWwsIDEsIHsgeDp3aW5kb3dXICogMC40LCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMC40KVxuXG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLmJvdHRvbVRleHRzLm9wZW5UeHRCeUlkKCdnZW5lcmljJylcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25JbigpIHtcblx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5hZGQodGhpcy5tYXAuZWwsICdncmVlbi1tb2RlJyksIDEwMDApXG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0dHJpZ2dlck5ld0l0ZW0odHlwZSkge1xuXHRcdHZhciBpbmRleCA9IHRoaXMuc2VhdHNbVXRpbHMuUmFuZCgwLCB0aGlzLnNlYXRzLmxlbmd0aCAtIDEsIDApXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHNlYXQgPT0gaW5kZXgpIHtcblx0XHRcdFx0aWYodGhpcy51c2VkU2VhdHMubGVuZ3RoIDwgdGhpcy5zZWF0cy5sZW5ndGggLSAyKSB0aGlzLnRyaWdnZXJOZXdJdGVtKHR5cGUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy51c2VkU2VhdHMucHVzaChpbmRleClcblx0fVxuXHRvbkl0ZW1FbmRlZChpdGVtKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVzZWRTZWF0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHVzZWRTZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHVzZWRTZWF0ID09IGl0ZW0uc2VhdCkge1xuXHRcdFx0XHR0aGlzLnVzZWRTZWF0cy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdG9uTW91c2VNb3ZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMubW91c2UueCA9IGUuY2xpZW50WFxuXHRcdHRoaXMubW91c2UueSA9IGUuY2xpZW50WVxuXHRcdHRoaXMubW91c2UublggPSAoZS5jbGllbnRYIC8gd2luZG93VykgKiAxXG5cdFx0dGhpcy5tb3VzZS5uWSA9IChlLmNsaWVudFkgLyB3aW5kb3dIKSAqIDFcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkKSByZXR1cm5cblx0XHQvLyB0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdC8vIGlmKHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA+IDgwMCkge1xuXHRcdC8vIFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMFxuXHRcdC8vIFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9WSURFTylcblx0XHQvLyB9XG5cdFx0Ly8gdGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyICs9IDFcblx0XHQvLyBpZih0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPiAzMCkge1xuXHRcdC8vIFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXHRcdC8vIFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9JTUFHRSlcblx0XHQvLyB9XG5cdFx0dGhpcy5pbWdDR3JpZC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFxuXHRcdHZhciBnR3JpZCA9IGdyaWRQb3NpdGlvbnMod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgJ2NvbHNfcm93cycpXG5cblx0XHR0aGlzLmdyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuaW1nQ0dyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMucmVzaXplKClcblx0XHR0aGlzLmFyb3VuZEJvcmRlci5yZXNpemUoKVxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cblx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKHRoaXMubWFwLmVsLCAnZ3JlZW4tbW9kZScpXG5cdFx0ZG9tLmV2ZW50Lm9mZih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIuY2xlYXIoKVxuXHRcdHRoaXMuZ3JpZC5jbGVhcigpXG5cdFx0dGhpcy5tYXAuY2xlYXIoKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMuY2xlYXIoKVxuXG5cdFx0dGhpcy5ncmlkID0gbnVsbFxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBudWxsXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBudWxsXG5cdFx0dGhpcy5tYXAgPSBudWxsXG5cblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgbW91c2UsIGRhdGEpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgc2NyZWVuSG9sZGVyU2l6ZSA9IFswLCAwXSwgdmlkZW9Ib2xkZXJTaXplID0gWzAsIDBdLCBjb2xvcmlmaWVyU2l6ZSA9IFswLCAwXSwgdG9wT2Zmc2V0ID0gMDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgaG9sZGVyKVxuXHR2YXIgYmFja2dyb3VuZCA9IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgZWwpXG5cdHZhciBzY3JlZW5XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi13cmFwcGVyJywgZWwpXG5cdHZhciBzY3JlZW5Ib2xkZXIgPSBkb20uc2VsZWN0KCcuc2NyZWVuLWhvbGRlcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciB2aWRlb0hvbGRlciA9IGRvbS5zZWxlY3QoJy52aWRlby1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgY29sb3JpZmllciA9IGRvbS5zZWxlY3QoJy5jb2xvcmlmaWVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXJTdmdQYXRoID0gZG9tLnNlbGVjdCgnc3ZnIHBhdGgnLCBjb2xvcmlmaWVyKVxuXHR2YXIgc2VsZmllU3RpY2tXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgZWwpXG5cdHZhciBzcHJpbmdUbyA9IFV0aWxzLlNwcmluZ1RvXG5cdHZhciB0cmFuc2xhdGUgPSBVdGlscy5UcmFuc2xhdGVcblx0dmFyIHR3ZWVuSW47XG5cdHZhciBhbmltYXRpb24gPSB7XG5cdFx0cG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdHJvdGF0aW9uOiAwLFxuXHRcdGNvbmZpZzoge1xuXHRcdFx0bGVuZ3RoOiA0MDAsXG5cdFx0XHRzcHJpbmc6IDAuNCxcblx0XHRcdGZyaWN0aW9uOiAwLjdcblx0XHR9XG5cdH1cblxuXHRUd2Vlbk1heC5zZXQoZWwsIHsgcm90YXRpb246ICctMWRlZycsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnIH0pXG5cblx0Ly8gY2hlY2sgaWYgbWl4LWJsZW5kLW1vZGUgaXMgYXZhaWxhYmxlXG5cdGlmICgnbWl4LWJsZW5kLW1vZGUnIGluIGNvbG9yaWZpZXIuc3R5bGUpIHtcblx0XHQvLyBjaGVjayBpZiBzYWZhcmkgYmVjYXVzZSBjb2xvciBmaWx0ZXIgaXNuJ3Qgd29ya2luZyBvbiBpdFxuXHRcdGlmKEFwcFN0b3JlLkRldGVjdG9yLmlzU2FmYXJpKSB7XG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlWydtaXgtYmxlbmQtbW9kZSddID0gJ211bHRpcGx5J1xuXHRcdH1lbHNle1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZVsnbWl4LWJsZW5kLW1vZGUnXSA9ICdjb2xvcidcblx0XHR9XG5cdH1lbHNle1xuXHRcdGNvbG9yaWZpZXJTdmdQYXRoLnN0eWxlWydvcGFjaXR5J10gPSAwLjhcblx0fVxuXHRcblx0dmFyIGMgPSBkYXRhWydhbWJpZW50LWNvbG9yJ11bJ3NlbGZpZS1zdGljayddXG5cdGNvbG9yaWZpZXJTdmdQYXRoLnN0eWxlWydmaWxsJ10gPSAnIycgKyBjb2xvclV0aWxzLmhzdlRvSGV4KGMuaCwgYy5zLCBjLnYpXG5cblx0dmFyIG9uVmlkZW9FbmRlZCA9ICgpPT4ge1xuXHRcdHNjb3BlLmNsb3NlKClcblx0fVxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRhdXRvcGxheTogZmFsc2Vcblx0fSlcblx0bVZpZGVvLmFkZFRvKHZpZGVvSG9sZGVyKVxuXHRtVmlkZW8ub24oJ2VuZGVkJywgb25WaWRlb0VuZGVkKVxuXHR2YXIgdmlkZW9TcmMgPSBkYXRhWydzZWxmaWUtc3RpY2stdmlkZW8tdXJsJ11cblxuXHR2YXIgc3RpY2tJbWcgPSBpbWcoQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL3NlbGZpZXN0aWNrLnBuZycsICgpPT4ge1xuXG5cdFx0aWYoc2NvcGUuaWdub3JlT3BlbikgcmV0dXJuXG5cblx0XHRkb20udHJlZS5hZGQoc2NyZWVuSG9sZGVyLCBzdGlja0ltZylcblxuXHRcdG1WaWRlby5sb2FkKHZpZGVvU3JjLCAoKT0+IHtcblx0XHRcdGlmKHR3ZWVuSW4gIT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0dHdlZW5Jbi5wbGF5KClcblx0XHRcdH1cblx0XHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0XHRzY29wZS5yZXNpemUoKVxuXHRcdH0pXG5cdH0pXG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdGlzT3BlbmVkOiBmYWxzZSxcblx0XHRpZ25vcmVPcGVuOiBmYWxzZSxcblx0XHRvcGVuOiAoKT0+IHtcblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoID0gMTAwLFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5zcHJpbmcgPSAwLjksXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmZyaWN0aW9uID0gMC41XG5cdFx0XHRtVmlkZW8ucGxheSgwKVxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnXG5cdFx0XHRzY29wZS5pc09wZW5lZCA9IHRydWVcblx0XHR9LFxuXHRcdGNsb3NlOiAoKT0+IHtcblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoID0gMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC42LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuN1xuXHRcdFx0bVZpZGVvLnBhdXNlKDApXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSBmYWxzZVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblxuXHRcdFx0aWYoc2NvcGUuaXNPcGVuZWQpIHtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueSAtIChzY3JlZW5Ib2xkZXJTaXplWzFdICogMC44KVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDgwXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSArPSAobW91c2UublkgLSAwLjUpICogMzBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogMjBcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55IC09IChtb3VzZS5uWSAtIDAuNSkgKiAobW91c2UublkgKiA2MClcblx0XHRcdH1cblxuXHRcdFx0c3ByaW5nVG8oYW5pbWF0aW9uLCBhbmltYXRpb24uZnBvc2l0aW9uLCAxKVxuXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCArPSAoYW5pbWF0aW9uLmZwb3NpdGlvbi54IC0gYW5pbWF0aW9uLnBvc2l0aW9uLngpICogMC4xXG5cblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbWF0aW9uLmNvbmZpZy5sZW5ndGgpICogMC4wNVxuXG5cdFx0XHR0cmFuc2xhdGUoc2NyZWVuV3JhcHBlciwgYW5pbWF0aW9uLnBvc2l0aW9uLngsIGFuaW1hdGlvbi5wb3NpdGlvbi55ICsgYW5pbWF0aW9uLnZlbG9jaXR5LnksIDEpXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0Y29sb3JpZmllclNpemUgPSBkb20uc2l6ZShjb2xvcmlmaWVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtIChjb2xvcmlmaWVyU2l6ZVswXSAqIDAuNTc1KSArICdweCdcblx0XHRcdGNvbG9yaWZpZXIuc3R5bGUudG9wID0gLTAuNyArICdweCdcblxuXHRcdFx0YW5pbWF0aW9uLmlwb3NpdGlvbi54ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKVxuXHRcdFx0YW5pbWF0aW9uLmlwb3NpdGlvbi55ID0gd2luZG93SCAtICh2aWRlb0hvbGRlclNpemVbMV0gKiAwLjM1KVxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdGFuaW1hdGlvbi5wb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55XG5cblx0XHRcdGlmKGVsLnN0eWxlLm9wYWNpdHkgIT0gMSkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpPT4geyBlbC5zdHlsZS5vcGFjaXR5ID0gMSB9LCA1MDApXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uSW5Db21wbGV0ZWQ6ICgpPT4ge1xuXHRcdFx0aWYoIWlzUmVhZHkpIHtcblx0XHRcdFx0dHdlZW5JbiA9IFR3ZWVuTWF4LmZyb20oZWwsIDAuNiwgeyB5OiA1MDAsIHBhdXNlZDp0cnVlLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRtVmlkZW8uY2xlYXIoKVxuXHRcdFx0bVZpZGVvID0gbnVsbFxuXHRcdFx0YW5pbWF0aW9uID0gbnVsbFxuXHRcdFx0dHdlZW5JbiA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRzY29wZS5jbG9zZSgpXG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBzb2NpYWxMaW5rcyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHdyYXBwZXIgPSBkb20uc2VsZWN0KFwiI2Zvb3RlciAjc29jaWFsLXdyYXBwZXJcIiwgcGFyZW50KVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAqIDAuNFxuXG5cdFx0XHR2YXIgd3JhcHBlclNpemUgPSBkb20uc2l6ZSh3cmFwcGVyKVxuXG5cdFx0XHR2YXIgc29jaWFsQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiB3aW5kb3dXIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzBdLFxuXHRcdFx0XHR0b3A6IHdpbmRvd0ggLSBwYWRkaW5nIC0gd3JhcHBlclNpemVbMV0sXG5cdFx0XHR9XG5cblx0XHRcdHdyYXBwZXIuc3R5bGUubGVmdCA9IHNvY2lhbENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0d3JhcHBlci5zdHlsZS50b3AgPSBzb2NpYWxDc3MudG9wICsgJ3B4J1xuXHRcdH0sXG5cdFx0c2hvdzogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5yZW1vdmUod3JhcHBlciwgJ2hpZGUnKSwgMTAwMClcblx0XHR9LFxuXHRcdGhpZGU6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMuYWRkKHdyYXBwZXIsICdoaWRlJyksIDUwMClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgc29jaWFsTGlua3MiLCJpbXBvcnQgVGV4dEJ0blRlbXBsYXRlIGZyb20gJ1RleHRCdG5faGJzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRpdGxlID0gY29udGFpbmVyLmlubmVySFRNTC50b1VwcGVyQ2FzZSgpXG5cdHZhciBidG5TY29wZSA9IHsgdGl0bGU6IHRpdGxlIH1cblx0dmFyIHRlbXBsYXRlID0gVGV4dEJ0blRlbXBsYXRlKGJ0blNjb3BlKVxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gdGVtcGxhdGVcblx0dmFyIHRleHRUaXRsZSA9IGRvbS5zZWxlY3QoJy50ZXh0LXRpdGxlJywgY29udGFpbmVyKVxuXHR2YXIgc2l6ZSA9IGRvbS5zaXplKHRleHRUaXRsZSlcblx0dmFyIGN1cnJlbnRUbCwgdGxMZWZ0LCB0bFJpZ2h0O1xuXHR2YXIgcmVjdENvbnRhaW5lcnMgPSBkb20uc2VsZWN0LmFsbCgnLnJlY3RzLWNvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0dmFyIGJnTGluZXNMZWZ0ID0gZG9tLnNlbGVjdC5hbGwoJy5iZy1saW5lJywgcmVjdENvbnRhaW5lcnNbMF0pXG5cdHZhciBiZ0JveExlZnQgPSBkb20uc2VsZWN0KCcuYmctYm94JywgcmVjdENvbnRhaW5lcnNbMF0pXG5cdHZhciBiZ0xpbmVzUmlnaHQgPSBkb20uc2VsZWN0LmFsbCgnLmJnLWxpbmUnLCByZWN0Q29udGFpbmVyc1sxXSlcblx0dmFyIGJnQm94UmlnaHQgPSBkb20uc2VsZWN0KCcuYmctYm94JywgcmVjdENvbnRhaW5lcnNbMV0pXG5cdHZhciBpc0FjdGl2YXRlZCA9IGZhbHNlXG5cdFxuXHR2YXIgdHdlZW5JbiA9IChkaXJlY3Rpb24pPT4ge1xuXHRcdGlmKGRpcmVjdGlvbiA9PSBBcHBDb25zdGFudHMuTEVGVCkge1xuXHRcdFx0Y3VycmVudFRsID0gdGxMZWZ0XG5cdFx0XHR0bExlZnQudGltZVNjYWxlKDIpLnR3ZWVuRnJvbVRvKDAsICdpbicpXG5cdFx0fWVsc2V7XHRcblx0XHRcdGN1cnJlbnRUbCA9IHRsUmlnaHRcblx0XHRcdHRsUmlnaHQudGltZVNjYWxlKDIpLnR3ZWVuRnJvbVRvKDAsICdpbicpXG5cdFx0fVxuXHR9XG5cdHZhciB0d2Vlbk91dCA9ICgpPT4ge1xuXHRcdGN1cnJlbnRUbC50aW1lU2NhbGUoMi42KS50d2VlblRvKCdvdXQnKVxuXHR9XG5cblx0dmFyIG1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0aWYoaXNBY3RpdmF0ZWQpIHJldHVyblxuXHRcdHZhciByZWN0ID0gZS5jdXJyZW50VGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHZhciB4TW91c2VQb3MgPSBlLmNsaWVudFhcblx0XHR2YXIgeFBvcyA9IHhNb3VzZVBvcyAtIHJlY3QubGVmdFxuXHRcdHZhciB3ID0gcmVjdC5yaWdodCAtIHJlY3QubGVmdFxuXHRcdGlmKHhQb3MgPiB3IC8gMikge1xuXHRcdFx0dHdlZW5JbihBcHBDb25zdGFudHMuUklHSFQpXG5cdFx0fWVsc2V7XG5cdFx0XHR0d2VlbkluKEFwcENvbnN0YW50cy5MRUZUKVxuXHRcdH1cblx0fVxuXHR2YXIgbW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZihpc0FjdGl2YXRlZCkgcmV0dXJuXG5cdFx0dHdlZW5PdXQoKVxuXHR9XG5cdHZhciBhY3RpdmF0ZSA9ICgpPT4ge1xuXHRcdGlzQWN0aXZhdGVkID0gdHJ1ZVxuXHRcdGN1cnJlbnRUbC50aW1lU2NhbGUoMykudHdlZW5UbygnaW4nKVxuXHR9XG5cdHZhciBkaXNhY3RpdmF0ZSA9ICgpPT4ge1xuXHRcdGlzQWN0aXZhdGVkID0gZmFsc2Vcblx0XHR0bExlZnQudGltZVNjYWxlKDMpLnR3ZWVuVG8oJ291dCcpXG5cdFx0dGxSaWdodC50aW1lU2NhbGUoMykudHdlZW5Ubygnb3V0Jylcblx0fVxuXG5cdGRvbS5ldmVudC5vbihjb250YWluZXIsICdtb3VzZWVudGVyJywgbW91c2VFbnRlcilcblx0ZG9tLmV2ZW50Lm9uKGNvbnRhaW5lciwgJ21vdXNlbGVhdmUnLCBtb3VzZUxlYXZlKVxuXG5cdHZhciBvZmZzZXRYID0gMjZcblx0dGxMZWZ0ID0gbmV3IFRpbWVsaW5lTWF4KClcblx0dGxMZWZ0LmZyb21UbyhiZ0xpbmVzTGVmdFswXSwgMSwgeyBzY2FsZVg6MCwgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHR0bExlZnQuZnJvbVRvKGJnQm94TGVmdCwgMSwgeyBzY2FsZVg6MCwgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjIpXG5cdHRsTGVmdC5mcm9tVG8oYmdMaW5lc0xlZnRbMV0sIDEsIHsgc2NhbGVYOjAsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJyB9LCB7IHNjYWxlWDoxLCB0cmFuc2Zvcm1PcmlnaW46JzAlIDUwJScsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC40KVxuXHR0bExlZnQudG8oYmdMaW5lc0xlZnRbMF0sIDEsIHsgeDonMTA1JScsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjUpXG5cdHRsTGVmdC50byhiZ0JveExlZnQsIDEsIHsgeDonMTA1JScsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjYpXG5cdHRsTGVmdC5hZGRMYWJlbCgnaW4nKVxuXHR0bExlZnQudG8oYmdMaW5lc0xlZnRbMV0sIDEsIHsgeDonMTA1JScsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAnaW4nKVxuXHR0bExlZnQuYWRkTGFiZWwoJ291dCcpXG5cdHRsTGVmdC5wYXVzZSgwKVxuXG5cdHRsUmlnaHQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR0bFJpZ2h0LmZyb21UbyhiZ0xpbmVzUmlnaHRbMF0sIDEsIHsgc2NhbGVYOjAsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdHRsUmlnaHQuZnJvbVRvKGJnQm94UmlnaHQsIDEsIHsgc2NhbGVYOjAsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMilcblx0dGxSaWdodC5mcm9tVG8oYmdMaW5lc1JpZ2h0WzFdLCAxLCB7IHNjYWxlWDowLCB0cmFuc2Zvcm1PcmlnaW46JzEwMCUgNTAlJyB9LCB7IHNjYWxlWDoxLCB0cmFuc2Zvcm1PcmlnaW46JzEwMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjQpXG5cdHRsUmlnaHQudG8oYmdMaW5lc1JpZ2h0WzBdLCAxLCB7IHg6Jy0xMDUlJywgdHJhbnNmb3JtT3JpZ2luOicxMDAlIDUwJScsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC41KVxuXHR0bFJpZ2h0LnRvKGJnQm94UmlnaHQsIDEsIHsgeDonLTEwNSUnLCB0cmFuc2Zvcm1PcmlnaW46JzEwMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjYpXG5cdHRsUmlnaHQuYWRkTGFiZWwoJ2luJylcblx0dGxSaWdodC50byhiZ0xpbmVzUmlnaHRbMV0sIDEsIHsgeDonLTEwNSUnLCB0cmFuc2Zvcm1PcmlnaW46JzEwMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAnaW4nKVxuXHR0bFJpZ2h0LmFkZExhYmVsKCdvdXQnKVxuXHR0bFJpZ2h0LnBhdXNlKDApXG5cblx0c2NvcGUgPSB7XG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRlbDogY29udGFpbmVyLFxuXHRcdGFjdGl2YXRlOiBhY3RpdmF0ZSxcblx0XHRkaXNhY3RpdmF0ZTogZGlzYWN0aXZhdGUsXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGxMZWZ0LmNsZWFyKClcblx0XHRcdHRsUmlnaHQuY2xlYXIoKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihjb250YWluZXIsICdtb3VzZWVudGVyJywgbW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoY29udGFpbmVyLCAnbW91c2VsZWF2ZScsIG1vdXNlTGVhdmUpXG5cdFx0XHR0bExlZnQgPSBudWxsXG5cdFx0XHR0bFJpZ2h0ID0gbnVsbFxuXHRcdFx0Y3VycmVudFRsID0gbnVsbFxuXHRcdFx0cmVjdENvbnRhaW5lcnMgPSBudWxsXG5cdFx0XHRiZ0xpbmVzTGVmdCA9IG51bGxcblx0XHRcdGJnTGluZXNSaWdodCA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGU7XG5cbn0iLCJpbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5cbnZhciB2aWRlb0NhbnZhcyA9ICggcHJvcHMgKT0+IHtcblxuICAgIHZhciBzY29wZTtcbiAgICB2YXIgaW50ZXJ2YWxJZDtcbiAgICB2YXIgZHggPSAwLCBkeSA9IDAsIGRXaWR0aCA9IDAsIGRIZWlnaHQgPSAwO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG4gICAgICAgIGF1dG9wbGF5OiBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZSxcbiAgICAgICAgdm9sdW1lOiBwcm9wcy52b2x1bWUsXG4gICAgICAgIGxvb3A6IHByb3BzLmxvb3BcbiAgICB9KVxuXG4gICAgdmFyIG9uQ2FuUGxheSA9ICgpPT57XG4gICAgICAgIHNjb3BlLmlzTG9hZGVkID0gdHJ1ZVxuICAgICAgICBpZihwcm9wcy5hdXRvcGxheSkgbVZpZGVvLnBsYXkoKVxuICAgICAgICBpZihkV2lkdGggPT0gMCkgZFdpZHRoID0gbVZpZGVvLndpZHRoKClcbiAgICAgICAgaWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gbVZpZGVvLmhlaWdodCgpXG4gICAgICAgIGlmKG1WaWRlby5pc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciBkcmF3T25jZSA9ICgpPT4ge1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGxheSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGRyYXcsIDEwMDAgLyAzMClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICAgICAgbVZpZGVvLmN1cnJlbnRUaW1lKHRpbWUpXG4gICAgICAgIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgdGltZW91dCA9IChjYiwgbXMpPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgY2Ioc2NvcGUpXG4gICAgICAgIH0sIG1zKVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICgpPT57XG4gICAgICAgIG1WaWRlby5wYXVzZSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgICAgICBpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICAgICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgcmVzaXplID0gKHgsIHksIHcsIGgpPT57XG4gICAgICAgIGR4ID0geFxuICAgICAgICBkeSA9IHlcbiAgICAgICAgZFdpZHRoID0gd1xuICAgICAgICBkSGVpZ2h0ID0gaFxuICAgIH1cblxuICAgIHZhciBjbGVhciA9ICgpPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIG1WaWRlby5jbGVhckFsbEV2ZW50cygpXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwwLDAsMClcbiAgICB9XG5cbiAgICBpZihwcm9wcy5vbkVuZGVkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtVmlkZW8ub24oJ2VuZGVkJywgZW5kZWQpXG4gICAgfVxuXG4gICAgc2NvcGUgPSB7XG4gICAgICAgIGlzTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICAgIHZpZGVvOiBtVmlkZW8sXG4gICAgICAgIGN0eDogY3R4LFxuICAgICAgICBkcmF3T25jZTogZHJhd09uY2UsXG4gICAgICAgIHBsYXk6IHBsYXksXG4gICAgICAgIHBhdXNlOiBwYXVzZSxcbiAgICAgICAgc2Vlazogc2VlayxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgcmVzaXplOiByZXNpemUsXG4gICAgICAgIGNsZWFyOiBjbGVhcixcbiAgICAgICAgbG9hZDogKHNyYywgY2IpPT4ge1xuICAgICAgICAgICAgbVZpZGVvLmxvYWQoc3JjLCAoKT0+e1xuICAgICAgICAgICAgICAgIG9uQ2FuUGxheSgpXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzY29wZVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHZpZGVvQ2FudmFzIiwiZXhwb3J0IGRlZmF1bHQge1xuXHRXSU5ET1dfUkVTSVpFOiAnV0lORE9XX1JFU0laRScsXG5cdFBBR0VfSEFTSEVSX0NIQU5HRUQ6ICdQQUdFX0hBU0hFUl9DSEFOR0VEJyxcblx0UEFHRV9BU1NFVFNfTE9BREVEOiAnUEFHRV9BU1NFVFNfTE9BREVEJyxcblx0QVBQX1NUQVJUOiAnQVBQX1NUQVJUJyxcblxuXHRMQU5EU0NBUEU6ICdMQU5EU0NBUEUnLFxuXHRQT1JUUkFJVDogJ1BPUlRSQUlUJyxcblxuXHRGT1JXQVJEOiAnRk9SV0FSRCcsXG5cdEJBQ0tXQVJEOiAnQkFDS1dBUkQnLFxuXG5cdEhPTUU6ICdIT01FJyxcblx0RElQVFlRVUU6ICdESVBUWVFVRScsXG5cblx0TEVGVDogJ0xFRlQnLFxuXHRSSUdIVDogJ1JJR0hUJyxcblx0VE9QOiAnVE9QJyxcblx0Qk9UVE9NOiAnQk9UVE9NJyxcblxuXHRJTlRFUkFDVElWRTogJ0lOVEVSQUNUSVZFJyxcblx0VFJBTlNJVElPTjogJ1RSQU5TSVRJT04nLFxuXG5cdE9QRU5fRkVFRDogJ09QRU5fRkVFRCcsXG5cdE9QRU5fR1JJRDogJ09QRU5fR1JJRCcsXG5cblx0UFhfQ09OVEFJTkVSX0lTX1JFQURZOiAnUFhfQ09OVEFJTkVSX0lTX1JFQURZJyxcblx0UFhfQ09OVEFJTkVSX0FERF9DSElMRDogJ1BYX0NPTlRBSU5FUl9BRERfQ0hJTEQnLFxuXHRQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEOiAnUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCcsXG5cblx0T1BFTl9GVU5fRkFDVDogJ09QRU5fRlVOX0ZBQ1QnLFxuXHRDTE9TRV9GVU5fRkFDVDogJ0NMT1NFX0ZVTl9GQUNUJyxcblxuXHRDRUxMX01PVVNFX0VOVEVSOiAnQ0VMTF9NT1VTRV9FTlRFUicsXG5cdENFTExfTU9VU0VfTEVBVkU6ICdDRUxMX01PVVNFX0xFQVZFJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblx0SE9NRV9JTUFHRV9TSVpFOiBbIDM2MCwgMzYwIF0sXG5cblx0SVRFTV9JTUFHRTogJ0lURU1fSU1BR0UnLFxuXHRJVEVNX1ZJREVPOiAnSVRFTV9WSURFTycsXG5cblx0R1JJRF9ST1dTOiA0LCBcblx0R1JJRF9DT0xVTU5TOiA3LFxuXG5cdFBBRERJTkdfQVJPVU5EOiA0MCxcblx0U0lERV9FVkVOVF9QQURESU5HOiAxMjAsXG5cblx0RU5WSVJPTk1FTlRTOiB7XG5cdFx0UFJFUFJPRDoge1xuXHRcdFx0c3RhdGljOiAnJ1xuXHRcdH0sXG5cdFx0UFJPRDoge1xuXHRcdFx0XCJzdGF0aWNcIjogSlNfdXJsX3N0YXRpYyArICcvJ1xuXHRcdH1cblx0fSxcblxuXHRNRURJQV9HTE9CQUxfVzogMTkyMCxcblx0TUVESUFfR0xPQkFMX0g6IDEwODAsXG5cblx0TUlOX01JRERMRV9XOiA5NjAsXG5cdE1RX1hTTUFMTDogMzIwLFxuXHRNUV9TTUFMTDogNDgwLFxuXHRNUV9NRURJVU06IDc2OCxcblx0TVFfTEFSR0U6IDEwMjQsXG5cdE1RX1hMQVJHRTogMTI4MCxcblx0TVFfWFhMQVJHRTogMTY4MCxcbn0iLCJpbXBvcnQgRmx1eCBmcm9tICdmbHV4J1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG52YXIgQXBwRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlVmlld0FjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHRzb3VyY2U6ICdWSUVXX0FDVElPTicsXG5cdFx0XHRhY3Rpb246IGFjdGlvblxuXHRcdH0pO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwRGlzcGF0Y2hlciIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGRpcHR5cXVlLXBhZ2UnPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiZnVuLWZhY3Qtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2UtaW5uZXJcXFwiPlxcblx0XHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snZmFjdC10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2ZhY3QtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZhY3QtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImN1cnNvci1jcm9zc1xcXCI+XFxuXHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE0LjEwNSAxMy44MjhcXFwiPlxcblx0XHRcdFx0PHBvbHlnb24gZmlsbD1cXFwiI2ZmZmZmZlxcXCIgcG9pbnRzPVxcXCIxMy45NDYsMC44MzggMTMuMjgzLDAuMTU2IDcuMDM1LDYuMjUgMC44MzksMC4xNTYgMC4xNzMsMC44MzQgNi4zNyw2LjkzMSAwLjE1OSwxMi45OSAwLjgyMywxMy42NzEgNy4wNyw3LjU3OCAxMy4yNjYsMTMuNjcxIDEzLjkzMiwxMi45OTQgNy43MzYsNi44OTYgXFxcIi8+XFxuXHRcdFx0PC9zdmc+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYWluLWJ0bnMtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgaWQ9J3Nob3AtYnRuJyBjbGFzcz0nbWFpbi1idG4nPjwvZGl2Plxcblx0XHQ8ZGl2IGlkPSdmdW4tZmFjdC1idG4nIGNsYXNzPSdtYWluLWJ0bic+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcInNlbGZpZS1zdGljay13cmFwcGVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwic2NyZWVuLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbG9yaWZpZXJcXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAyMlxcXCI+XFxuXHRcdFx0XHRcdDxwYXRoIGQ9XFxcIk00LjYsMS4yNWMwLjAwMSwwLDAuMDQ1LTAuMDA2LDAuMDgsMGgwLjAzMmMxLjIxMiwwLjAwMywzNi43MDYtMSwzNi43MDYtMWwyNS40NzEsMC41NDljMC4wODYsMC4wMDIsMC4xNzIsMC4wMDcsMC4yNTgsMC4wMTdsMS40ODYsMC4xNjZDNjguNzExLDAuOTg5LDY4Ljc3MywxLDY4LjgzNiwxLjAzNmwwLjMyNCwwLjE5OWMwLjA1MiwwLjAzMiwwLjExLDAuMDQ5LDAuMTcxLDAuMDVsMjcuMDQzLDAuNDY5YzAsMCwyLjYyNC0wLjA3NywyLjYyNCwyLjkzM2wtMC42OTIsNy45NmMtMC4wNDUsMC41MTgtMC40NzksMC45MTYtMC45OTksMC45MTZoLTYuMjAzYy0wLjMyOCwwLTAuNjUzLDAuMDM0LTAuOTc1LDAuMWMtMC44NTMsMC4xNzUtMi44MywwLjUyOC01LjI2MywwLjYxOGMtMC4zNDIsMC4wMTQtMC42NjEsMC4xODEtMC44NzIsMC40NTFsLTAuNSwwLjY0NWwtMC4yOCwwLjM1OGMtMC4zNzQsMC40ODItMC42NDcsMS4wMzQtMC43ODksMS42MjhjLTAuMzIsMS4zNDUtMS4zOTgsMy45NTItNC45MjQsMy45NThjLTMuOTc0LDAuMDA1LTcuNjg1LTAuMTEzLTEwLjYxMi0wLjIyNWMtMS4xODktMC4wNDQtMi45NiwwLjIyOS0yLjg1NS0xLjYyOWwwLjM2LTUuOTRjMC4wMTQtMC4yMTktMC4xNTctMC40MDQtMC4zNzYtMC40MDlMMjkuNjIsMTIuNDg4Yy0wLjIxNC0wLjAwNC0wLjQyOCwwLjAwMS0wLjY0MSwwLjAxNWwtMS43NTMsMC4xMTNjLTAuMjA4LDAuMDEzLTAuNDA3LDAuMDg1LTAuNTc0LDAuMjFjLTAuNTU3LDAuNDExLTEuODk3LDEuMzkyLTIuNjY3LDEuODU5Yy0wLjcwMSwwLjQyNi0xLjUzOSwxLjA0Mi0xLjk2OCwxLjM2NGMtMC4xODMsMC4xMzctMC4zMDksMC4zMzUtMC4zNTgsMC41NThsLTAuMzE3LDEuNDI1Yy0wLjA0NCwwLjIwMi0wLjAwNCwwLjQxMywwLjExMywwLjU4M2wwLjYxMywwLjg5NmMwLjIxMiwwLjMxMSwwLjI5NywwLjY5OSwwLjE4OCwxLjA1OWMtMC4xMTUsMC4zNzgtMC40NDQsMC43NTUtMS4yOTIsMC43NTVoLTcuOTU3Yy0wLjQyNSwwLTAuODQ4LTAuMDQtMS4yNjYtMC4xMmMtMi41NDMtMC40ODYtMTAuODQ2LTIuNjYxLTEwLjg0Ni0xMC4zNkMwLjg5NiwzLjM3NSw0LjQ1OSwxLjI1LDQuNiwxLjI1XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzY3JlZW4taG9sZGVyXFxcIj48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImFycm93cy13cmFwcGVyXFxcIj5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3ByZXZpb3VzLXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXBhZ2UnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdsZWZ0JyBjbGFzcz1cXFwiYXJyb3cgbGVmdFxcXCI+XFxuXHRcdFx0XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjcuNjI3LDAuODMxIDguMzA3LDEuNTI5IDEuOTUyLDcuNzI3IDguMjkzLDEzLjk2NSA3LjYxLDE0LjY1OCAwLjU2MSw3LjcyNCBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXFxuXHRcdDwvYT5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdyaWdodCcgY2xhc3M9XFxcImFycm93IHJpZ2h0XFxcIj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAuNDU2IDAuNjQ0IDcuOTU3IDE0LjIwMlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIHBvaW50cz1cXFwiMS4yNCwxNC42NTggMC41NjEsMTMuOTYgNi45MTUsNy43NjIgMC41NzUsMS41MjUgMS4yNTcsMC44MzEgOC4zMDcsNy43NjUgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbmV4dC1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wcmV2aWV3LXVybCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblx0XHQ8L2E+XFxuXHQ8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBidWZmZXIgPSBcbiAgXCJcdDxkaXYgZGF0YS1pZD1cXFwiXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaWRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBkYXRhLXBlcnNvbj1cXFwiXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBlcnNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGVyc29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwZXJzb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwicG9zdFxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcC13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0XFxcIj5cXG5cdFx0XHRcdDxpbWcgc3JjPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaWNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidGl0bGVcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wZXJzb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBlcnNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicGVyc29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImNsZWFyLWZsb2F0XFxcIj48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ0aW1lXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGltZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGltZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGltZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcIm1lZGlhLXdyYXBwZXJcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxWydpcy12aWRlbyddIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxWydpcy12aWRlbyddIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLm5vb3AsXCJpbnZlcnNlXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0PHVsIGNsYXNzPSdsZWZ0Jz5cXG5cdFx0XHRcdDxsaT5cXG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgaWQ9J2ljb24nIHZpZXdCb3g9XFxcIjAuMDgzIC0wLjAxNiAyMi45NTMgMjMuNzgzXFxcIj48cGF0aCBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTEuNTYsMjMuNTA5Yy02LjE5LDAtMTEuMjI3LTUuMjE5LTExLjIyNy0xMS42MzNTNS4zNywwLjI0MywxMS41NiwwLjI0M2M2LjE5LDAsMTEuMjI2LDUuMjE5LDExLjIyNiwxMS42MzNTMTcuNzUsMjMuNTA5LDExLjU2LDIzLjUwOXogTTExLjU2LDEuNjEzYy01LjQzNiwwLTkuODU3LDQuNjA0LTkuODU3LDEwLjI2M3M0LjQyMSwxMC4yNjMsOS44NTcsMTAuMjYzYzUuNDM1LDAsOS44NTYtNC42MDQsOS44NTYtMTAuMjYzUzE2Ljk5NSwxLjYxMywxMS41NiwxLjYxM3ogTTkuMDc0LDExLjY4N2MtMC45OSwwLTEuNDQxLTEuNzA0LTEuNDQxLTMuMjg3YzAtMS41ODMsMC40NTItMy4yODgsMS40NDEtMy4yODhjMC45OTEsMCwxLjQ0MiwxLjcwNSwxLjQ0MiwzLjI4OEMxMC41MTYsOS45ODMsMTAuMDY0LDExLjY4Nyw5LjA3NCwxMS42ODd6IE0xNC4wOTcsMTEuNjg3Yy0wLjk5LDAtMS40NDEtMS43MDQtMS40NDEtMy4yODdjMC0xLjU4MywwLjQ1MS0zLjI4OCwxLjQ0MS0zLjI4OGMwLjk5MSwwLDEuNDQxLDEuNzA1LDEuNDQxLDMuMjg4QzE1LjUzOCw5Ljk4MywxNS4wODgsMTEuNjg3LDE0LjA5NywxMS42ODd6IE0xNy42MjksMTIuNzQ2Yy0wLjAwNiwwLjE4Ny0wLjUwMyw1Ljc2My02LjIyLDUuNzYzYy01LjcxNiwwLTYuMDctNS42MTktNi4wNzMtNS42OWMwLjA4NSwwLjAwOCwwLjE3LDAuMDIyLDAuMjU0LDAuMDQzYzAuMTMzLDAuMDMyLDAuMjcxLTAuMDQyLDAuMzA4LTAuMTgyYzAuMDM1LTAuMTMzLTAuMDQyLTAuMjg4LTAuMTc1LTAuMzJjLTAuNTA1LTAuMTIxLTEuMTA3LTAuMDg5LTEuNTI2LDAuMjY1QzQuMDkxLDEyLjcxMyw0LjExLDEyLjksNC4xOTksMTIuOTkxYzAuMTA1LDAuMTA3LDAuMjQ4LDAuMDg4LDAuMzU0LTAuMDAyYy0wLjEwMSwwLjA4NSwwLjE5OC0wLjA5OCwwLjIyMi0wLjEwNWMwLjAwMS0wLjAwMSwwLjAwMi0wLjAwMiwwLjAwNC0wLjAwMmMwLjA4MywxLjc4MiwwLjkzMywzLjQ0OCwyLjI2Niw0LjU3NmMxLjQ4LDEuMjUyLDMuNDM5LDEuODA0LDUuMzI5LDEuNTU1YzEuODU4LTAuMjQzLDMuNTcyLTEuMjMzLDQuNjg0LTIuODA5YzAuNjktMC45NzgsMS4wODUtMi4xNjcsMS4xMjktMy4zNzhjMC4wMTIsMC4wMDUsMC40MzksMC4yMDIsMC41NDMsMC4wOTRjMC4wODktMC4wOTQsMC4xMDQtMC4yNzctMC4wMDItMC4zNjdjLTAuNDE3LTAuMzUzLTEuMDIxLTAuMzgzLTEuNTIzLTAuMjYzYy0wLjMxNSwwLjA3Ni0wLjE4NCwwLjU3NywwLjEzLDAuNTAyQzE3LjQzNiwxMi43NjgsMTcuNTMzLDEyLjc1MiwxNy42MjksMTIuNzQ2elxcXCIvPjwvc3ZnPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaT5cXG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgaWQ9J2ljb24nIHZpZXdCb3g9XFxcIjAgMC4zMDkgMjMgMjMuODU3XFxcIj48cGF0aCBpZD1cXFwiU2hhcGVcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xMS41LDAuNTY4Yy02LjIxMywwLTExLjI1LDUuMjI1LTExLjI1LDExLjY2OWMwLDYuNDQ0LDUuMDM3LDExLjY2OSwxMS4yNSwxMS42NjljNi4yMTQsMCwxMS4yNS01LjIyNSwxMS4yNS0xMS42NjlDMjIuNzUsNS43OTIsMTcuNzE0LDAuNTY4LDExLjUsMC41NjhMMTEuNSwwLjU2OHogTTExLjUsMTkuNjIyYy0wLjk3MywwLTEuNzU4LTAuODE2LTEuNzU4LTEuODI0YzAtMS4wMDcsMC43ODUtMS44MjIsMS43NTgtMS44MjJjMC45NywwLDEuNzU4LDAuODE1LDEuNzU4LDEuODIyQzEzLjI1OCwxOC44MDYsMTIuNDcsMTkuNjIyLDExLjUsMTkuNjIyTDExLjUsMTkuNjIyeiBNMTEuODUyLDEyLjIzN2MtMi43MTksMC00LjkyMiwyLjI4Ni00LjkyMiw1LjEwNWMwLDIuNzc4LDIuMTQzLDUuMDI2LDQuODA0LDUuMDkzYy0wLjA4LDAuMDAyLTAuMTU0LDAuMDEzLTAuMjMzLDAuMDEzYy01LjQzLDAtOS44NDQtNC41ODEtOS44NDQtMTAuMjExUzYuMDcsMi4wMjYsMTEuNSwyLjAyNmMwLjIzNiwwLDEuMzM4LDAuMTA2LDEuMzYsMC4xMDljMi4yMzEsMC40ODQsMy45MTMsMi41MzcsMy45MTMsNC45OTdDMTYuNzczLDkuOTUxLDE0LjU2NywxMi4yMzcsMTEuODUyLDEyLjIzN0wxMS44NTIsMTIuMjM3eiBNOS43NDIsNi42NzZjMCwxLjAwNywwLjc4NSwxLjgyNCwxLjc1OCwxLjgyNGMwLjk3LDAsMS43NTgtMC44MTYsMS43NTgtMS44MjRjMC0xLjAwNy0wLjc4OC0xLjgyMy0xLjc1OC0xLjgyM0MxMC41MjcsNC44NTMsOS43NDIsNS42NjksOS43NDIsNi42NzZ6XFxcIi8+PC9zdmc+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PGxpPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiBpZD0naWNvbicgdmlld0JveD1cXFwiMS4yNSAtMC43NDEgMjIuNSAyMy4zMzhcXFwiPjxwYXRoIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNC42NTEsMjIuMTQ3TDE0LjY1MSwyMi4xNDdjLTQuNjM1LTAuMDAxLTguNzgyLTMuMDM3LTEwLjMyLTcuNTU1Yy0yLTUuODc1LDAuOTg5LTEyLjM0NCw2LjY2My0xNC40MjJjMS4xMy0wLjQxNCwyLjMwNS0wLjYzMiwzLjQ5NC0wLjY0OGMwLjM3OCwwLDAuNzE2LDAuMjE1LDAuODczLDAuNTQ5YzAuMTU1LDAuMzM3LDAuMTExLDAuNzIzLTAuMTE1LDEuMDFjLTAuMTk2LDAuMjUyLTAuMzgzLDAuNTE3LTAuNTU3LDAuNzg4Yy0xLjc5OCwyLjc5Ni0yLjIxMSw2LjIxNS0xLjEzNSw5LjM3OWMxLjA3NSwzLjE1NiwzLjQ1OCw1LjU0Miw2LjUzOCw2LjU0NGMwLjI5OCwwLjA5OCwwLjYwNCwwLjE4MiwwLjkxLDAuMjVjMC4zNTYsMC4wNzgsMC42NDIsMC4zNjMsMC43MjMsMC43MjhjMC4wODIsMC4zNTUtMC4wNDQsMC43MjUtMC4zMjgsMC45NThjLTAuOTM0LDAuNzYxLTEuOTc5LDEuMzU2LTMuMTA5LDEuNzcxQzE3LjExMiwyMS45MjksMTUuODg4LDIyLjE0NywxNC42NTEsMjIuMTQ3eiBNMTMuNjQ5LDAuOTQ5Yy0wLjczOSwwLjA4MS0xLjQ3MiwwLjI1Mi0yLjE4MywwLjUxMkM2LjQ4OSwzLjI4NCwzLjg3Miw4Ljk3Niw1LjYzMywxNC4xNDljMS4zNDgsMy45NjEsNC45NzMsNi42MjMsOS4wMTgsNi42MjNoMC4wMDFjMS4wNzUsMCwyLjE0LTAuMTksMy4xNjQtMC41NjVjMC43MjUtMC4yNjYsMS40MS0wLjYxNiwyLjA0NS0xLjA0N2MtMC4wNjUtMC4wMi0wLjEzLTAuMDQtMC4xOTMtMC4wNjJjLTMuNDk1LTEuMTM3LTYuMTk3LTMuODM3LTcuNDEzLTcuNDA3Yy0xLjIxMy0zLjU2My0wLjc0Ni03LjQxNSwxLjI3OS0xMC41NjZDMTMuNTcxLDEuMDY2LDEzLjYwOSwxLjAwOCwxMy42NDksMC45NDl6XFxcIi8+PC9zdmc+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdDwvdWw+XFxuXHRcdFx0PHVsIGNsYXNzPSdyaWdodCc+XFxuXHRcdFx0XHQ8bGk+XFxuXHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuc2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuc2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwic2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjEuMjUgLTAuNzQxIDIyLjUgMjMuMzM4XFxcIj48cGF0aCBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMjMuMjQyLDEwLjQzOEwxMy4wMS0wLjE3NmMtMC4yNi0wLjI2OS0wLjY4LTAuMjY5LTAuOTM5LDBMMS44MzksMTAuNDM4Yy0wLjI1OSwwLjI2OS0wLjI1OSwwLjcwNSwwLDAuOTc0TDEyLjA3LDIyLjAyNWMwLjI2LDAuMjcsMC42OCwwLjI3LDAuOTM5LDBsMTAuMjMyLTEwLjYxNEMyMy41MDIsMTEuMTQzLDIzLjUwMiwxMC43MDcsMjMuMjQyLDEwLjQzOEwyMy4yNDIsMTAuNDM4eiBNMTQuMjk5LDEwLjMwNmMtMC4wNjEsMC4xMzQtMC4xODIsMC4yMTQtMC4zMjQsMC4yMTFjLTAuMTQzLTAuMDAzLTAuMjYtMC4wODgtMC4zMTQtMC4yMjRsLTAuNTE0LTEuMjkyYzAsMC0wLjQ2MSwwLjIyNy0wLjkyMiwwLjUzNGMtMS41MTIsMC45MDktMS40MiwyLjMzNS0xLjQyLDIuMzM1djQuMTdIOC43MjhWMTEuNzVjMCwwLDAuMTE5LTIuNDU4LDIuMDc1LTMuNjc0YzAuNTcyLTAuMzYzLDAuODAxLTAuNTIxLDEuMjI5LTAuNzc3bC0wLjg3My0xLjA1OGMtMC4wOTYtMC4xMDgtMC4xMTktMC4yNTUtMC4wNjItMC4zOTFjMC4wNTUtMC4xMzUsMC4xNzYtMC4yMTYsMC4zMi0wLjIxNmw0LjkzOCwwLjAxNEwxNC4yOTksMTAuMzA2TDE0LjI5OSwxMC4zMDZ6XFxcIi8+PC9zdmc+XFxuXHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImNvbW1lbnRzLXdyYXBwZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbW1lbnRzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb21tZW50cyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImNvbW1lbnRzXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg5LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmNvbW1lbnRzKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0PGRpdiBjbGFzcz0ndmlkZW8td3JhcHBlcic+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndpc3RpYV9lbWJlZCB3aXN0aWFfYXN5bmNfXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudXJsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiIHBsYXllckNvbG9yPTFlZWE3OSBwbGF5YmFyPWZhbHNlIHNtYWxsUGxheUJ1dHRvbj1mYWxzZSB2b2x1bWVDb250cm9sPWZhbHNlIGZ1bGxzY3JlZW5CdXR0b249ZmFsc2VcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxMDAlOyBoZWlnaHQ6MTAwJTtcXFwiPiZuYnNwOzwvZGl2Plxcblx0XHRcdFx0PC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxWydpcy1zaG9wJ10gOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg1LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazFbJ2lzLXNob3AnXSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5ub29wLFwiaW52ZXJzZVwiOnRoaXMucHJvZ3JhbSg3LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCI1XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczEoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5zaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5zaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJzaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0naW1hZ2Utd3JhcHBlcic+XFxuXHRcdFx0XHRcdFx0XHQ8aW1nIHNyYz1cXFwiXCJcbiAgICArIGFsaWFzMSh0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudXJsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0PC9hPlxcblwiO1xufSxcIjdcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0PGRpdiBjbGFzcz0naW1hZ2Utd3JhcHBlcic+XFxuXHRcdFx0XHRcdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnVybCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdDwvZGl2PlxcblwiO1xufSxcIjlcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0PGRpdiBjbGFzcz1cXFwiY29tbWVudFxcXCI+XFxuICAgIFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwibmFtZVxcXCI+XCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwZXJzb24tbmFtZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncGVyc29uLW5hbWUnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicGVyc29uLW5hbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9kaXY+XFxuICAgIFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidGV4dFxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncGVyc29uLXRleHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3BlcnNvbi10ZXh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvbi10ZXh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHRcdDwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mZWVkIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgaWQ9XFxcIkxheWVyXzFcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBmaWxsLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGNsaXAtcnVsZT1cXFwiZXZlbm9kZFxcXCIgZD1cXFwiTTgyLjE0MSw4LjAwMmgzLjM1NGMxLjIxMywwLDEuNzE3LDAuNDk5LDEuNzE3LDEuNzI1djcuMTM3YzAsMS4yMzEtMC41MDEsMS43MzYtMS43MDUsMS43MzZoLTMuMzY1VjguMDAyeiBNODIuNTIzLDI0LjYxN3Y4LjQyNmwtNy4wODctMC4zODRWMS45MjVIODcuMzljMy4yOTIsMCw1Ljk2LDIuNzA1LDUuOTYsNi4wNDR2MTAuNjA0YzAsMy4zMzgtMi42NjgsNi4wNDQtNS45Niw2LjA0NEg4Mi41MjN6IE0zMy40OTEsNy45MTNjLTEuMTMyLDAtMi4wNDgsMS4wNjUtMi4wNDgsMi4zNzl2MTEuMjU2aDQuNDA5VjEwLjI5MmMwLTEuMzE0LTAuOTE3LTIuMzc5LTIuMDQ3LTIuMzc5SDMzLjQ5MXogTTMyLjk5NCwwLjk3NGgxLjMwOGM0LjcwMiwwLDguNTE0LDMuODY2LDguNTE0LDguNjM0djI1LjIyNGwtNi45NjMsMS4yNzN2LTcuODQ4aC00LjQwOWwwLjAxMiw4Ljc4N2wtNi45NzQsMi4wMThWOS42MDhDMjQuNDgxLDQuODM5LDI4LjI5MiwwLjk3NCwzMi45OTQsMC45NzQgTTEyMS45MzMsNy45MjFoMy40MjNjMS4yMTUsMCwxLjcxOCwwLjQ5NywxLjcxOCwxLjcyNHY4LjE5NGMwLDEuMjMyLTAuNTAyLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjQzNlY3LjkyMXogTTEzMy43MTgsMzEuMDU1djE3LjQ4N2wtNi45MDYtMy4zNjhWMzEuNTkxYzAtNC45Mi00LjU4OC01LjA4LTQuNTg4LTUuMDh2MTYuNzc0bC02Ljk4My0yLjkxNFYxLjkyNWgxMi4yMzFjMy4yOTEsMCw1Ljk1OSwyLjcwNSw1Ljk1OSw2LjA0NHYxMS4wNzdjMCwyLjIwNy0xLjIxNyw0LjE1My0yLjk5MSw1LjExNUMxMzEuNzYxLDI0Ljg5NCwxMzMuNzE4LDI3LjA3NywxMzMuNzE4LDMxLjA1NSBNMTAuODA5LDAuODMzYy00LjcwMywwLTguNTE0LDMuODY2LTguNTE0LDguNjM0djI3LjkzNmMwLDQuNzY5LDQuMDE5LDguNjM0LDguNzIyLDguNjM0bDEuMzA2LTAuMDg1YzUuNjU1LTEuMDYzLDguMzA2LTQuNjM5LDguMzA2LTkuNDA3di04Ljk0aC02Ljk5NnY4LjczNmMwLDEuNDA5LTAuMDY0LDIuNjUtMS45OTQsMi45OTJjLTEuMjMxLDAuMjE5LTIuNDE3LTAuODE2LTIuNDE3LTIuMTMyVjEwLjE1MWMwLTEuMzE0LDAuOTE3LTIuMzgxLDIuMDQ3LTIuMzgxaDAuMzE1YzEuMTMsMCwyLjA0OCwxLjA2NywyLjA0OCwyLjM4MXY4LjQ2NGg2Ljk5NlY5LjQ2N2MwLTQuNzY4LTMuODEyLTguNjM0LTguNTE0LTguNjM0SDEwLjgwOSBNMTAzLjk1MywyMy4xNjJoNi45Nzd2LTYuNzQ0aC02Ljk3N1Y4LjQyM2w3LjY3Ni0wLjAwMlYxLjkyNEg5Ni43MnYzMy4yNzhjMCwwLDUuMjI1LDEuMTQxLDcuNTMyLDEuNjY2YzEuNTE3LDAuMzQ2LDcuNzUyLDIuMjUzLDcuNzUyLDIuMjUzdi03LjAxNWwtOC4wNTEtMS41MDhWMjMuMTYyeiBNNDYuODc5LDEuOTI3bDAuMDAzLDMyLjM1bDcuMTIzLTAuODk1VjE4Ljk4NWw1LjEyNiwxMC40MjZsNS4xMjYtMTAuNDg0bDAuMDAyLDEzLjY2NGw3LjAyMi0wLjA1NFYxLjg5NWgtNy41NDVMNTkuMTMsMTQuNkw1NC42NjEsMS45MjdINDYuODc5elxcXCIvPjwvc3ZnPlxcblx0XHRcdDwvYT5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtYXAtYnRuXFxcIj48YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwidGV4dC1idG5cXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5tYXBfdHh0IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImNhbXBlci1sYWJcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5nZW5lcmFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sYWJfdXJsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwidGV4dC1idG5cXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwicmVsYXRpdmVcXFwiPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXRpdGxlIHRleHQtYnRuXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF90aXRsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdlbmVyYWwgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm1lbl9zaG9wX3VybCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMVxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdlbmVyYWwgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLndvbWVuX3Nob3BfdXJsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJz5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF93b21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0XHQ8L3VsPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvaGVhZGVyPlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaG9yaXpvbnRhbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaG9yaXpvbnRhbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcImhvcml6b250YWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuaG9yaXpvbnRhbCkgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiNFwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcdFx0XHRcdFx0PGRpdj48L2Rpdj5cXG5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZlcnRpY2FsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52ZXJ0aWNhbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcInZlcnRpY2FsXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLnZlcnRpY2FsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZywgYWxpYXM0PXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGhvbWUtcGFnZSc+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWJhY2tncm91bmQtY29udGFpbmVyXFxcIj48L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImdyaWQtZnJvbnQtY29udGFpbmVyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ncmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ncmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ncmlkKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwibGluZXMtZ3JpZC1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJob3Jpem9udGFsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidmVydGljYWwtbGluZXNcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydsaW5lcy1ncmlkJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydsaW5lcy1ncmlkJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJsaW5lcy1ncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzWydsaW5lcy1ncmlkJ10pIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJib3R0b20tdGV4dHMtY29udGFpbmVyXFxcIj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidGl0bGVzLXdyYXBwZXJcXFwiPlxcblx0XHRcdDx1bD5cXG5cdFx0XHRcdDxsaSBpZD0nZGVpYScgY2xhc3M9XFxcInRleHQtYnRuXFxcIj5ERUlBPC9saT5cXG5cdFx0XHRcdDxsaSBpZD0nZXMtdHJlbmMnIGNsYXNzPVxcXCJ0ZXh0LWJ0blxcXCI+RVMgVFJFTkM8L2xpPlxcblx0XHRcdFx0PGxpIGlkPSdhcmVsbHVmJyBjbGFzcz1cXFwidGV4dC1idG5cXFwiPkFSRUxMVUY8L2xpPlxcblx0XHRcdDwvdWw+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0ZXh0cy13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSd0eHQnIGlkPVxcXCJnZW5lcmljXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdlbmVyaWMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdlbmVyaWMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImdlbmVyaWNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9J3R4dCcgaWQ9XFxcImRlaWFcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2RlaWEtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydkZWlhLXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJkZWlhLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZXMtdHJlbmNcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2VzLXRyZW5jLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZXMtdHJlbmMtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImVzLXRyZW5jLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiYXJlbGx1ZlxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snYXJlbGx1Zi10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2FyZWxsdWYtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImFyZWxsdWYtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgaWQ9XFxcInNvY2lhbC13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8dWw+XFxuXHRcdFx0XHQ8bGkgY2xhc3M9J2luc3RhZ3JhbSc+XFxuXHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaW5zdGFncmFtVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbnN0YWdyYW1VcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImluc3RhZ3JhbVVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNi4xMDcsMTUuNTYyYzAsMC4zMDItMC4yNDMsMC41NDctMC41NDMsMC41NDdIMi40MzhjLTAuMzAyLDAtMC41NDctMC4yNDUtMC41NDctMC41NDdWNy4zNTloMi4xODhjLTAuMjg1LDAuNDEtMC4zODEsMS4xNzUtMC4zODEsMS42NjFjMCwyLjkyOSwyLjM4OCw1LjMxMiw1LjMyMyw1LjMxMmMyLjkzNSwwLDUuMzIyLTIuMzgzLDUuMzIyLTUuMzEyYzAtMC40ODYtMC4wNjYtMS4yNC0wLjQyLTEuNjYxaDIuMTg2VjE1LjU2MkwxNi4xMDcsMTUuNTYyeiBNOS4wMiw1LjY2M2MxLjg1NiwwLDMuMzY1LDEuNTA0LDMuMzY1LDMuMzU4YzAsMS44NTQtMS41MDksMy4zNTctMy4zNjUsMy4zNTdjLTEuODU3LDAtMy4zNjUtMS41MDQtMy4zNjUtMy4zNTdDNS42NTUsNy4xNjcsNy4xNjMsNS42NjMsOS4wMiw1LjY2M0w5LjAyLDUuNjYzeiBNMTIuODI4LDIuOTg0YzAtMC4zMDEsMC4yNDQtMC41NDYsMC41NDUtMC41NDZoMS42NDNjMC4zLDAsMC41NDksMC4yNDUsMC41NDksMC41NDZ2MS42NDFjMCwwLjMwMi0wLjI0OSwwLjU0Ny0wLjU0OSwwLjU0N2gtMS42NDNjLTAuMzAxLDAtMC41NDUtMC4yNDUtMC41NDUtMC41NDdWMi45ODRMMTIuODI4LDIuOTg0eiBNMTUuNjY5LDAuMjVIMi4zM2MtMS4xNDgsMC0yLjA4LDAuOTI5LTIuMDgsMi4wNzZ2MTMuMzQ5YzAsMS4xNDYsMC45MzIsMi4wNzUsMi4wOCwyLjA3NWgxMy4zMzljMS4xNSwwLDIuMDgxLTAuOTMsMi4wODEtMi4wNzVWMi4zMjZDMTcuNzUsMS4xNzksMTYuODE5LDAuMjUsMTUuNjY5LDAuMjVMMTUuNjY5LDAuMjV6XFxcIi8+XFxuXHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHQ8bGkgY2xhc3M9J3R3aXR0ZXInPlxcblx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnR3aXR0ZXJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnR3aXR0ZXJVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInR3aXR0ZXJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMjIgMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDIyIDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMjEuMTc2LDAuNTE0Yy0wLjg1NCwwLjUwOS0xLjc5OSwwLjg3OS0yLjgwOCwxLjA3OWMtMC44MDUtMC44NjUtMS45NTMtMS40MDUtMy4yMjYtMS40MDVjLTIuNDM4LDAtNC40MTcsMS45OTItNC40MTcsNC40NDljMCwwLjM0OSwwLjAzOCwwLjY4OCwwLjExNCwxLjAxM0M3LjE2Niw1LjQ2NCwzLjkxLDMuNjk1LDEuNzI5LDFjLTAuMzgsMC42Ni0wLjU5OCwxLjQyNS0wLjU5OCwyLjI0YzAsMS41NDMsMC43OCwyLjkwNCwxLjk2NiwzLjcwNEMyLjM3NCw2LjkyLDEuNjkxLDYuNzE4LDEuMDk0LDYuMzg4djAuMDU0YzAsMi4xNTcsMS41MjMsMy45NTcsMy41NDcsNC4zNjNjLTAuMzcxLDAuMTA0LTAuNzYyLDAuMTU3LTEuMTY1LDAuMTU3Yy0wLjI4NSwwLTAuNTYzLTAuMDI3LTAuODMzLTAuMDhjMC41NjMsMS43NjcsMi4xOTQsMy4wNTQsNC4xMjgsMy4wODljLTEuNTEyLDEuMTk0LTMuNDE4LDEuOTA2LTUuNDg5LDEuOTA2Yy0wLjM1NiwwLTAuNzA5LTAuMDIxLTEuMDU1LTAuMDYyYzEuOTU2LDEuMjYxLDQuMjgsMS45OTcsNi43NzUsMS45OTdjOC4xMzEsMCwxMi41NzQtNi43NzgsMTIuNTc0LTEyLjY1OWMwLTAuMTkzLTAuMDA0LTAuMzg3LTAuMDEyLTAuNTc3YzAuODY0LTAuNjI3LDEuNjEzLTEuNDExLDIuMjA0LTIuMzAzYy0wLjc5MSwwLjM1NC0xLjY0NCwwLjU5My0yLjUzNywwLjcwMUMyMC4xNDYsMi40MjQsMjAuODQ3LDEuNTUzLDIxLjE3NiwwLjUxNFxcXCIvPlxcblx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PGxpIGNsYXNzPSdmYWNlYm9vayc+XFxuXHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZmFjZWJvb2tVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmZhY2Vib29rVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWNlYm9va1VybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNy43MTksMTYuNzU2YzAsMC41MzEtMC40MzEsMC45NjMtMC45NjIsMC45NjNoLTQuNDQzdi02Ljc1M2gyLjI2N2wwLjMzOC0yLjYzMWgtMi42MDRWNi42NTRjMC0wLjc2MiwwLjIxMS0xLjI4MSwxLjMwNC0xLjI4MWwxLjM5NCwwVjMuMDE5Yy0wLjI0MS0wLjAzMi0xLjA2OC0wLjEwNC0yLjAzMS0wLjEwNGMtMi4wMDksMC0zLjM4NSwxLjIyNy0zLjM4NSwzLjQ3OXYxLjk0MUg3LjMyMnYyLjYzMWgyLjI3MnY2Ljc1M0gxLjI0M2MtMC41MzEsMC0wLjk2Mi0wLjQzMi0wLjk2Mi0wLjk2M1YxLjI0M2MwLTAuNTMxLDAuNDMxLTAuOTYyLDAuOTYyLTAuOTYyaDE1LjUxNGMwLjUzMSwwLDAuOTYyLDAuNDMxLDAuOTYyLDAuOTYyVjE2Ljc1NlxcXCIvPlxcblx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdDwvdWw+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJpbm5lci1tYXNrLWJhY2tncm91bmRcXFwiPlxcblx0XHRcdDxkaXY+PC9kaXY+XFxuXHRcdFx0PGRpdj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImlubmVyLWJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PmE8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmI8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHRcdDxkaXY+NDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHRcdDxkaXY+NDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwibWFwLXdyYXBwZXJcXFwiPjwvZGl2Plx0XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJibG9ja1xcXCI+XFxuXHRcdDxpbWcgc3JjPVxcXCJcIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS51cmwgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGV4IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ0aXRsZXMtd3JhcHBlclxcXCI+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJkZWlhXFxcIj5ERUlBPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJlcy10cmVuY1xcXCI+RVMgVFJFTkM8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyZWxsdWZcXFwiPkFSRUxMVUY8L2Rpdj5cXG48L2Rpdj5cXG5cXG48c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCItNjcgMCA3NjAgNjQ1XFxcIj5cXG5cdFxcblx0PHBhdGggaWQ9XFxcIm1hcC1iZ1xcXCIgc3Ryb2tlPVxcXCIjRkZGRkZGXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIGZpbGw9XFxcIiNmZmZmZmZcXFwiIGQ9XFxcIk05LjI2OCwyODkuMzk0bDkuNzktNy43OThsMS44OTEsMC43OTNsLTEuNjI5LDUuMDIxbC01LjI4Niw0LjUwNGwtNC4zNTQsNy4wMTJsLTMuMDg4LTEuMTk4bC0yLjIzNCwyLjg4NWwwLDBsLTIuMzgyLTEuMTc3TDkuMjY4LDI4OS4zOTR6IE01NzMuNTgsMTc0LjIxMWwxOS44OS0xMy44Mmw4LjkwMS0yLjQ3OWw1LjM1NC00LjgwOWwxLjU2LTUuNTU1bC0xLTYuOTIybDEuNDQ1LTMuOTczbDUuMDU3LTIuNTIzbDQuMjcxLDIuMDFsMTEuOTA2LDkuMTY1bDIuNjkzLDQuOTE3bDIuODkyLDEuNTc1bDExLjQ4MiwxLjM2N2wzLjA1NywxLjk0OWw0LjQxOCw1LjIxMWw3Ljc2OCwyLjIyMWw1LjgzMiw0LjkxNmw2LjMwNSwwLjIxNWw2LjM3My0xLjIybDEuOTg5LDEuODhsMC40MDksMS45NjNsLTUuMzM2LDEwLjQyOGwtMC4yMjksMy44NjlsMS40NDEsMS42NDdsMC44NTQsMC45NThsNy4zOTUtMC40MjdsMi4zNDcsMS41NGwwLjkwMywyLjUxOWwtMi4xMDIsMy4wNTRsLTguNDI1LDMuMTgzbC0yLjE2OSw3LjExNmwwLjM0NCwzLjE4M2wzLjA3Myw0LjIzMWwwLjAxNSwyLjg0NmwtMi4wMTksMS40NWwtMC43MzksMy44NDNsMi4xNjYsMTYuNjg3bC0wLjk4MiwxLjg4bC02Ljc4NS0zLjc1N2wtMS43NTgsMC4yNTRsLTIuMDE5LDQuNDY4bDEuMDMyLDYuMjM3bC0wLjYwNSw0LjgyN2wtMC4zNjMsMi44NjhsLTEuNDk1LDEuNjY1bC0yLjEwMi0wLjEyOWwtOC4zNDEtMy44NDdsLTQuMDExLTAuNDA1bC0yLjcxMSwxLjYwNGwtNy40MzgsMTYuNDk3bC0zLjI4NCwxMS41OTlsMy4yMiwxMC41OTdsMS42NCwxLjg1OWw0LjM4Ni0wLjI4bDEuNDc4LDEuNjlsLTEuOTM3LDMuMzk1bC0yLjY5MywxLjA5NWwtNy44NTEtMC4xMjlsLTIuNTQ2LDEuNjIybC0yLjY2MSwzLjcxOGwwLjEyOSwwLjg5N2wwLjYwOSw0LjQ0NmwtMS40NzgsNC4zMTNsLTMuNjgsMy4zMTJsLTMuOTA5LDEuMTczbC0xMS45ODksNy43NThsLTUuMzU0LDcuOTY3bC04LjkzOCw2LjUzOWwtMy4zNTEsNi42NjNsLTUuNzgsNi41NDJsLTQuODI3LDguMTgybDAuMjk0LDMuOTA4bC00Ljg5NiwxMi4yODdsLTIuMDIsNS4xMDdsLTMuMjAyLDIyLjM5M2wwLjcyMSw4Ljg0MmwtMS4wMzMsMi45NWwtMS43MjUtMC4yNzZsLTQuMTI1LTQuNDY4bC0xLjYyNCwwLjk2MmwtMS4zOTYsMy4yNzJsMS44MjIsNC44NDhsLTEuNjkyLDUuMDIxbC00LjczMSw2LjYwNGwtOC4wNjIsMTkuMjkybC0yLjk3NywwLjM0MWwtMC41NDEsMC40NDhsLTEuNDc5LDEuMTk1bDEuMzE2LDQuNDg5bC0yLjI4NCwzLjM5NWwtMi41MTQsMS4yNjRsLTUuNDg0LTQuNTMybC0zLjA4OC0wLjg5NGwtMC44MDcsMS45MDFsMi4yMjEsNy4xNzhsLTMuNCwxLjM4OWwtOC4zNjMtMC4xM2wtMS41MTEsMi4ybDEuMTAyLDUuMzY1bC0wLjY4OCwyLjc3M2wtMy4xMzgsMy4xNjVsLTYuNjAzLDIuOGwtMy44OTYsNC4xODhsLTQuNjI5LTEuMzI0bC00LjczMSwwLjYxN2wtNS4wOTItMi41ODRsLTIuNjI1LDMuNTY3bDAuNDczLDIuNzEzbDAuMTgsMS4wMjZsLTEuMzEyLDEuNjg3bC0xMi40NTIsNC43NjZsLTQuNTk4LDQuNDg1bC03LjA2MiwxMS4wNjdsLTE3LjYyMywxOS44MDlsLTQuMDkyLDEuNzI3bC00LjQ5OC0wLjYxN2wtMy42NDYtMy4xODRsLTIuNzk1LTYuNTE3bC03LjE3Ni04Ljg2N2wtMS4yMzMtMC41NTZsLTMuNTE1LTEuNjQ0bC0xLjkwNC0zLjYzMmwxLjM0OS01LjM4N2wtMy4yNzEtNC4wNTlsLTcuMDE1LTUuNTEybC0yLjg5MSwxLjc5NGwtNC4wMjMsMC40N2wtMi44NzMtMS43MjlsLTEuMjY3LTUuNTU1bDQuNzk5LTguMzU0bC0wLjA4Mi0xLjYwMWwtMi41MjgtNC44OTVsLTguMDItOS42MTRsLTUuMzUyLTQuMTY2bC00LjYxNS0xLjgzN2wtNC4yMjEsMC42NDJsLTYuNzg1LTAuNzcxbC00LjgxMy0wLjU3NGwtNi45NDYsMi42MjdsLTMuMDA2LDQuMDU5bC0xLjkyMiwwLjI1NWwtMTQuNTY4LTcuODM3bC00Ljg2Mi0wLjYyMWwtOC40NiwxLjgzN2wtOC40ODktMC45ODNsLTQuMjA3LDAuNjY0bC03LjcxOCw0LjE2N2wtMy41MTUsMC42ODJsLTIuOTA4LTEuMTk1bC00LjgxMi00LjY4M2wtNC4xNTctMC41NTNsLTcuMjczLDEuNDMybC0xLjY0Mi0wLjY4MmwtMS4zNjMtNC4xMjdsLTQuODk4LTMuMDc1bC0zLjE5OS01LjI3OWwtMTEuNDAxLTguODg1bC01LjIyMi03LjE1OWwtMy4wODgtNy41NjVsLTAuNDA5LTUuODMxbDMuNjExLTEyLjY3MWwwLjEzMy01LjgxMWwtMS4xNjktNC40NjhsLTUuODQ2LTguNDE4bC0zLjAzNy02LjQ0OWwtMi4zMTctNC45MzhsMS4zNjMtMi43NTNsMy43NzUtMi4wOTZsMi45OTItNy40MTRsNC40LTMuOTk0bDIuMTA0LTMuNzYxbC00LjAyNC05LjkxNWwtMy44NDQtNi43MjlsLTguMzQ2LTcuNjQ3bC04Ljc2OS0yLjU4OGwtOS40MjktMTAuMzQybC00LjI1Ny0yLjMyNWwtNS4zMTgtNS4zODZsLTcuMjYyLTEuOTQ1bC0wLjY3MS0wLjE2OGwtNS4xNzUtMS4zOTNsLTIuOTU2LDAuNTZsLTIuODU3LDAuNTUzbC0yLjkyNC0xLjA0OGwtMy45NDQsMi4wOTZsLTIuMyw0LjEyM2wwLjE0NywxLjQzMmwwLjA4NywwLjY4MmwzLjkzOCw1LjE0OWwtMi4zOTYsMi41MjNsLTEwLjg4OC01LjY4NWwtNC4yMDcsMC4xNTFsLTUuOTkzLDExLjY2M2wtNC4wOTIsMy44MjlsLTYuNzE3LTAuODMzbC05LjkyMSwzLjI2NmwtNy42NTIsMi41MjJsLTIuNzc2LDMuMDMzbC0wLjI5NywyLjQ1NGwzLjMwMyw0LjA0MWwtMy4wMjMsMS4wOTFsLTAuNTkyLDEuMzY3djcuMDQ4bC02Ljg4MiwxNS43MDRsLTIuNzc2LDEwLjI1NmwxLjIwMiw0LjEwMmwtMC44MjUsMi42MDlsLTEyLjMxNS01LjE5M2wtOC43NTgtNi40MzFsLTUuMDQzLDIuOTA3bC0wLjg4NiwwLjQ4OGwxLjQ4MS01LjIxMWwtMS42MS02LjQwOWwyLjAyLTUuNTU2bC0wLjkxOS0yLjY3bC00LjQzNiwxLjM2N2wtNC42ODEtMC42bC0zLjA3My00LjkxMmwtMS4zNDUtNC42MzdsMS4xOC0yLjk0OWwyLjg5NS0xLjk2N2w3LjAxMS0wLjcwM2wxLjY0My0xLjMyOGwtMC4yNjItMS43N2wtNy4zNDUtMy41NDlsLTYuNDctMTAuMzYzbC02LjEyNiwwLjA0M2wtNC41OTgsNS4wNjZsLTMuNTY0LDAuODczbC00Ljc0OCwxLjE3NmwtMC41OTItMi4xMzVsMS4wNTEtMy44MjVsLTEuMDgzLTIuODY0bC0zLjI4NS0wLjcwNkw2NC4zNzUsMzI4bC0yLjU5Nyw2Ljc1M2wtNC42OTgsMy4yOTFsLTQuODU5LTAuNTc3bDAuNzA3LTMuODQ4bC0xLjEwMi0yLjM1MWwtMy4xNywwLjM4NGwtMy4xNzEtMy4xNThsLTQuMDQxLDQuMzc5bC0zLjE1MiwwLjIxMWwtMS42NDQtMi4zNjhsMi42MTEtMy4yMjlsOC41NDMtMy40NTlsMy40NDYtMi44MTdsLTAuMTE1LTEuMjQybC0xLTAuNzVsLTIuNjkzLDEuMjYzbC01LjM4Ny0wLjQzMWwtMi4xODUtMi4yMzlsLTEwLjY0NC0xMC44OThsLTAuNTkyLTIuMTM1bDEuNzA3LTYuNjAzbC0wLjU3NC0yLjQ5OGwtMy41MjktMi45OTNsLTAuNjA5LTIuMTU3bDMuNjk0LTcuNzM3bDIuMzAyLTAuNTk2bDIuNzEyLTUuNTE2bDkuMTgxLTkuNDJsOC41NzEsMC4wNjVsMTEuNjI3LTUuNTk5bDUuODM1LTQuOTk5bDEuODU0LTIuNzc4bDMuMjM1LTQuODk1bDUuODMxLTQuNjU0bDEyLjg5My02LjQxM2w3LjEzLTYuMzQ1bDUuMDg5LTcuMzA2bDUuNzE3LTIuMzcybDUuODMxLTguMzMzbDMuMjg1LTIuODQybDcuNDg4LTIuOTcxbDQuODYzLTYuMDg2bDMuMjAzLTEuMjYzbDEwLjE2NywxLjM2N2w2LjY3MS0xLjc1MWw1LjA1Ny0zLjQzOGwxNC45OC0xMi4yODdsNC4wODgtOC4yNDdsMTQuMDQ0LTE0LjYxNmw2LjY2Ny0xMC43NDRsNC4wMSwzLjkxMmw0LjQ4My0xLjkwMmw1LjMwOC00LjQ4NmwxLjc5LTQuMjEzbDYuMTU3LTE0LjQwMWw0LjgyNy0xLjg1NWw2LjQwOCw0LjkxM2wyLjU5NC0yLjg2NGwtMC43MzgtNS44NTNsMC42NzQtMi45NjhsMjEuOTYzLTE3Ljg4NWw1LjAzOS0yLjczNGw1Ljc5OSwzLjMxMmwzLjM2Ny0wLjg3NWwzLjUzMy0zLjY5NmwxLjgwOC01LjI1N2wwLjQ1OS0xLjMyNGwzLjI5OSwwLjcwN2wxLjQxNC0xMC40OTNsMS44MjEtMS4zMjRsNC42NjYsMS4zMDNsNC40NjUtMS4zNDZsNi41NTYsMi4xMTNsLTAuMTk3LTIuMDQ5bC0wLjExNC0xLjIzOGwtMC4wMzItMC4yNThsMS43MDctMi41NDFsMC40NDQsMC4wNjRsOS44MTksMS41MThoMC4wMThsNi44MTctMi4yOWw1Ljg2LTEuOTYzbDcuMDk4LTguMjVsOC4zNi0yLjJsNC41MzItMi43NTlsNC41MDEtNS43NjdsMi40ODEtMy4xODNsOC4xNjMtNS4yMWw0Ljk5MiwyLjAyN2w0LjQxOC0zLjk3Mmw0LjA1Ny0wLjQ5Nmw0LjkxMy0yLjkwM2w4LjQ3NS0xMC44MDlsMi43NzUsMC42ODJsMy4zODMsMy42MWwxLjg5LDIuMDMxbDIuMzYzLDIuNTE5bDguNjQzLTAuNzY4bDE1LjYwMi0xMi4zNDhsNC44MTItMi40NThsMTEuMDcxLTUuNjYzbDMuNzEyLTAuMTQ3bC0wLjQ3OCw1LjQ0N2wxLjg5MSwwLjc5bDUuNzY3LTIuNjY5bDMuNjExLDEuMjU5bC0yLjcyNiw0Ljk1NmwwLjE0NywzLjUyN2wzLjcxMi0wLjMyM2wxNy42NzMtMTEuNTEybDIuMzE3LTAuNTc4bDIuMDA1LDEuNjg3bC0wLjk4NiwyLjA3NGwwLjQwOCwxLjk2NmwxMS4zNTItMS44NDFsNC4zNTQtMi41ODRsMS43MDctMi4zNzJsNC4zODMtNi4wODZsNy4xNDctNS4yMzZsMTIuNDM0LTUuNDczbDQuNTY1LTAuMDg2bDAuOTY5LDEuNDUzbC0xLjcwNywyLjM3NmwwLjc3MSwxLjk4NGw0LjA1Ni0wLjI5OGwxMy44NDctNS43MjhsMi4yMzQsMS4wMDVsLTQuMDg5LDMuOTk0bC0yLjMzNCw2LjkwMWwtMi4xODUsMS40NzVsLTMuNDgyLTAuNTU2bC0zLjIyMSwxLjA0NGwtOC45MTYsNi44NjFsLTYuNjg0LDUuMTI4bC0zLjc4MSwxLjczbC0xMS4zOTYtMC4yOThsLTUuOTQ2LDUuNjYzbC0zLjI1Myw0Ljc0NGwtNC4yNTQsMS4wMDVsLTAuMTc5LDkuMzEybC03LjYyMS04LjE4MmwtNC43NDksMC4yNzZsLTMuNzQzLDQuMTkxbC0xLjIzNCw2LjQ0OWwxLjc0Myw5LjYxN2wyLjgwOCw2LjQ5MmwxLjg3Miw0LjMzOWw3LjA0OCw1LjY4MWw5LjM3OC0xLjIzOGw3LjExMi01LjA2M2wyLjI5OS0wLjIzM2wyLjg3NiwxLjkybDIuOTg3LTAuMTY4bDMuODc3LTMuMzA5bDkuMjk2LTIuOTkzbDQuOTA5LTMuMjQ4bDUuODUtNy4yNDJsMy4xMDMtMi4xMTdsNC4wNi0wLjEyOWwzLjM5OSwxLjk2N2wtOS42MjUsOC43ODFsLTAuMzEyLDAuOTgzbC0xLjgyNSw1Ljc2N2wwLjg4OSwzLjA1OGwyLjMxNywyLjQxMWwzLjAwNi0wLjM2MmwwLjM0NCwzLjIwOGwtNC4wNTYsMy40NTlsLTYuNTA2LDkuNTFsLTQuMDA3LDIuNzUybC03LjcwMy0wLjI1NWwtNi42ODUsMy41MDZsLTMuMzA0LTAuNTZsLTIuNDYzLTMuMTE4bC0zLjM4My0yLjEzNWwtMS45MzksMC4yNTRsLTIuOTU2LDIuNjQ4bC0yLjIzMyw1LjM0NGwtMS45NTUsNi45MjJsMC41NDUsMi42OTFsMCwwbDMuODQyLDEzLjA3N2w4LjA0OCwxNS45NjJsNi40MzgsNy4yMmwxMy4zMjMsOS40MDJsMjIuNTQ4LDEwLjI1M2wwLjYyNywxLjI2M2wxMS41NDUsNS42Mmw1LjM0LDIuNTgzbDUuMTc1LDEuNTM2bDMuODc0LTAuNDg4bDUuNDU0LTMuMzc2TDU3My41OCwxNzQuMjExeiBNMzg3LjUxNyw2MDEuOTczbC0yLjc1OS0zLjY5NmwwLjQ1OS0xLjkwMmwyLjEzOC0xLjEzbDAuMzI3LTIuOTc1bDIuNTE0LTEuNDVsMy44MDksMC41NTZsMC40MjcsMS42MjJsLTIuMjgsNy4wOTVsLTIuMDU2LDIuNTQxbDAsMEwzODcuNTE3LDYwMS45NzN6IE0zNjUuNjU3LDYxNC4zNDZsMy45MDksMTEuNDkxbDIuMjE3LDAuNjYzbDAuOTgyLTIuMDdsLTAuMjQ0LTAuNzcxbC0xLjA4My0zLjUyM2wwLjYzOC0yLjQzOGwyLjU5OCwwLjMwMmwyLjc4OSwzLjE1OGwzLjA5MywwLjcwN2wyLjI0OC0zLjA1OGwtMS45OS01LjIxMWwwLjY2LTIuNDM3bDIuNjI1LTAuMzg0bDQuNzE2LDIuODg1bDYuMDExLDEuMjE3bDIuMzM1LDEuOTAybC00LjYzNCw1LjU1NWwtNC4xNzEtMC4yMzZsLTEuNDc4LDEuODU4bC0wLjg0LDIuNjA4bDIuNDY1LDIuNjA1bC0zLjIwMyw0Ljc2NmwwLjA4MywxLjc3M2wzLjUyOCw1LjQ2OWwtMC41ODgsMS4yMmwtMi40NDksMC4zODRsLTUuOTkzLTEuNzUxbC02LjE5MywxLjk2M2wwLDBsLTAuMjgtNC40MjVsLTguNTM5LDAuNDA5bC0wLjQ0NC0xLjQzMmwzLjM4Ni00Ljc0NGwtMC43ODktMS42MjJsLTYuODUtMS43OTRsLTAuNjI1LTQuNjE1bDQuOTYtNS4wMjFsLTIuNTE0LTEuOTAxbC0wLjQwOS0yLjEzNmwxLjQ5Mi0yLjAzMUwzNjUuNjU3LDYxNC4zNDZ6XFxcIi8+XFxuXHRcXG5cdDx0ZXh0IHg9XFxcIjM2NFxcXCIgeT1cXFwiMjQyXFxcIj5BIFZJU0lPTiBPRjwvdGV4dD5cXG5cdDxnIGlkPSdtYWxsb3JjYS1sb2dvJyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgzMDAsIDI1OClcXFwiPjxwYXRoIGZpbGw9XFxcIiMxZWVhNzlcXFwiIGQ9XFxcIk04Ny44ODQsMS4wMDFjLTAuNzk4LDAuMjk0LTE3LjUzLDEzLjYxNy0zNy43NjMsNDAuNzU4Yy01Ljg5Miw4LjQ3Mi05LjMxOSwxNC42MDctNi44OTUsMTUuNTNjMi4yMzksMC44MzgsNC40OSwxLjYzNiw2Ljc1LDIuMzk2YzAuNjE3LDAuMjA3LDAuOTQyLDAuMjMxLDEuMTgyLTAuMTg2YzAuNTU3LTEuMDcxLDEuMDItNy45MzMsNC4zNTctMTMuMzA2YzQuODA5LTcuNzMsMTEuMjE0LTcuMzg0LDE0Ljg3My02LjYxMmMxLjgwOCwwLjM5NywyLjk2OSwyLjAwNiwxLjQ2Myw1LjM0MmMtMy43NjQsOC40ODktMTAuOCwxNC44ODQtMTEuODU2LDE2Ljg3NWMtMC41MzcsMS4wOSwwLjk2NSwxLjI2OSwxLjM5NywxLjM4NmMxLjc5NCwwLjQ5OCwzLjU5NSwwLjk3Myw1LjM5OCwxLjQyNWMxLjQzOSwwLjM2MSwyLjc2MSwyLjkyNywxMC43ODgtMTcuMzU5QzkwLjgzLDExLjYzNyw4OC41MzksMC44NTcsODcuODg0LDEuMDAxeiBNNzUuNTMyLDI5LjgzNWMtMy4yNDMtMC41Ny03Ljg3NCwwLjQ5MS04LjU2NiwwLjMyNGMtMC40NTEtMC4xLTAuNDI2LTAuNjQxLDAuMDY2LTEuNDY3YzMuMTM3LTQuOTEzLDEzLjA0Mi0xNS40ODYsMTQuNjA0LTE1LjQyYzEuMTE1LDAuMDczLTEuMDE4LDkuODY5LTMuMDY5LDE0LjQ3N0M3Ny42MDQsMjkuODA3LDc2LjgzNCwzMC4wNzMsNzUuNTMyLDI5LjgzNXogTTk4LjczOSw2OC45NTFjLTAuMzEyLDEuNjIyLTEuNzY5LDEuMDU2LTIuMzYsMC45ODhjLTYuNjk5LTAuNzUyLTEzLjM2NS0xLjc5OS0xOS45NzktMy4xNDljLTIuNjQyLTAuMzgyLTAuODc5LTIuOTE3LDQuNjAyLTE4LjU3MWMzLjk5LTEwLjIwMywxOC41NzItNDUuNjcxLDE5LjE0MS00NS43NTRjMS40ODMsMC4wNDQsMi45NjgsMC4wODgsNC40NTEsMC4xMzJjMC4xOTYsMC4wMDUsMC40ODcsMC4xNzUsMC4xMDEsMS42MDVjLTAuMjg3LDEuODEzLTguNzk2LDE4LjU5Mi0xNS44ODMsNDAuMTE1Yy0zLjQzNywxMC44MDQtMS40NzQsMTMuODU4LDEuMDczLDE0LjIyMWM0LjI5MSwwLjYxNiw4LjM2MS01Ljk2OCw5LjQxNi01Ljg2NEMxMDAuMDYsNTIuNzQ2LDk4Ljc2LDY4LjUzNyw5OC43MzksNjguOTUxeiBNMTI1Ljg3NCw3MC4xMDRjLTAuMDI2LDEuNjM3LTEuNTY0LDEuMjUyLTIuMTYxLDEuMjU0Yy02Ljc1LDAuMDQ5LTEzLjQ5Ni0wLjE5NC0yMC4yMTUtMC43MzVjLTIuNjU2LTAuMDU1LTEuMzcxLTIuODQsMS4yNjYtMTkuMzUyYzIuMTI0LTEwLjg0OCwxMC4yNDItNDguMzM5LDEwLjgwMi00OC4zNTVjMS40ODMsMC4wNDMsMi45NjcsMC4wODMsNC40NTEsMC4xMjVjMC4xOTYsMC4wMDYsMC41MTcsMC4xNzksMC4zODUsMS42NTNjMC4wMzEsMS44MTctNS40MzksMTkuMzEzLTguNjQsNDEuODQ0Yy0xLjQ4OSwxMS4yNzcsMC45NzcsMTQuMTMsMy41NSwxNC4yMTJjNC4zMzUsMC4xMzMsNy4yMDgtNi44NDgsOC4yNy02Ljg0MkMxMjQuMzQ2LDUzLjkxNSwxMjUuODIzLDY5LjcwMSwxMjUuODc0LDcwLjEwNHogTTEzNy4wNzksMi4yNzdjLTQuNTkyLTAuMjIzLTguNzgsMjMuMTgzLTkuMzkyLDQ0LjIzOWMtMC4yMzksMTQuMTE3LDMuNTg2LDI2LjA3NiwxMy45MzksMjUuMjRjMS42Ny0wLjE0MiwzLjMzOS0wLjMwMiw1LjAwOC0wLjQ3OWMxMC4zMzQtMS4yMDgsMTEuNzUtMTMuMjY4LDguNjk5LTI2LjU3M0MxNTAuNTQyLDI0Ljk3OCwxNDEuNjc3LDIuNjE0LDEzNy4wNzksMi4yNzd6IE0xNDIuNjc1LDU3LjIyOWMtNC44NjQsMC4zOTEtNy45MTItMy4xNjEtOC4yOTQtMTIuNjY5Yy0wLjYxOC0xNy45ODgsMi4wNDItMjkuMjc2LDQuMDI0LTI5LjI2OWMxLjk4MSwwLjAyOSw2LjkxMiwxMC45ODYsOS45MDMsMjguMzkxQzE0OS44MzcsNTIuOTA4LDE0Ny41MzcsNTYuODI0LDE0Mi42NzUsNTcuMjI5eiBNMTcyLjYxNSwzMy45OTRjLTAuNzUtMi4wMTIsMy4zNzktNi4zOTktMi4wNDctMTcuMjM0Yy0yLjg1Mi01Ljc2Ny03LjU5MS0xMi43MDItMTIuNjcxLTEyLjg2OGMtMi40NjktMC4wMzktNC45MzktMC4wODItNy40MDktMC4xMjhjLTAuNDg4LTAuMDA1LTIuMTU5LTEuNDY2LDYuOTY4LDM2LjQ4MWM2Ljk2MiwyOC43OTMsOC4xNCwyNy4wNDIsOS4zNjYsMjYuODA2YzEuOTA0LTAuMzY5LDMuODA2LTAuNzYsNS43MDMtMS4xNzRjMC40ODgtMC4xMDYsMS44MzYtMC4wMTEsMS40MjgtMS4yNzFjLTAuMjA1LTAuNDk2LTUuMTY3LTEwLjMyLTYuODY1LTE2LjAyYy0xLjI0OC00LjE5NiwwLjc2OC03LjcxOSwxLjk1OC03LjkxOWMyLjE4OC0wLjI4NywxMS4zMzksMTMuNTA5LDE0Ljc3OSwyMS40MjhjMC40NjMsMS4xMzgsMS44ODYsMC41MTMsMi43NTksMC4yNjRjMS44MjgtMC41MTUsMy42NTItMS4wNTQsNS40NzEtMS42MTVjMS4wMTQtMC4zMTEsMS4xNC0wLjUxMSwwLjc2OS0xLjI1M0MxODQuNTQsNDMuNzg4LDE3My4yNTcsMzYuMTMzLDE3Mi42MTUsMzMuOTk0eiBNMTYzLjA0NywzMi40MjljLTEuMTM3LDAuMTQ2LTIuMDgzLTIuODQyLTIuNTYyLTQuNDExYy0zLjkzOS0xMi45NDgtMy40NjctMTUuNDQ1LTAuNjgtMTUuNTQ2YzEuNjUzLTAuMDYsNC4xMzEsMS40OTUsNS45ODEsNS45NTdDMTY4LjYzOSwyNC44NzIsMTY0LjQ2MSwzMi4yMTcsMTYzLjA0NywzMi40Mjl6IE0yMTIuNDYyLDM3LjA3MmM3LjI5Myw3Ljc5MSw2LjEyMiwxNC45ODYtMC42NTcsMTcuODA5Yy0xMS4xNzIsNC42MzMtMjMuNDE1LTcuNzk5LTMwLjE1Ni0yMS40NzFjLTcuMjA1LTE0Ljc4Mi0xMS45MzYtMzAuNzA5LTUuNjg5LTMwLjE5M2MyLjM1MiwwLjA5Nyw3Ljc5LDIuMjA1LDEzLjEwMyw3LjkwNWMyLjgyNCwzLjA5NiwzLjEwNyw1LjEwMiwxLjAxNiw1LjQ1OWMtMS4zMjcsMC4xODktMy45MDUtNS4zMjMtNy44MDktNC45NzFjLTQuMzQ4LDAuMjYtMC41OCw5Ljk0Niw0LjE0NiwxOGM3LjE5OCwxMi4zMzYsMTUuOTQxLDE1LjM2LDE5LjgsMTMuODljNy4xNTMtMi42OTcsMC42NjktMTAuODksMS4wMjItMTAuOTdDMjA3Ljc4NCwzMi4zNTUsMjExLjk3NCwzNi41NDEsMjEyLjQ2MiwzNy4wNzJ6IE0yMzkuNDIyLDIzLjQ4OUMyMDkuNjk0LDkuMzI5LDE5My45ODgsMy44NDUsMTkzLjI5MSwzLjQ5M2MtMC44MzYtMC41MywxLjM4MSw5LjE2NiwyMS44NTUsMzIuNDY2YzYuNDYyLDYuNzc3LDExLjU4NywxMS4xNywxMy45NTgsOS45NzZjMi4xOS0xLjA5LDQuMzY2LTIuMjE1LDYuNTI4LTMuMzcyYzAuNTkxLTAuMzE3LDAuODA3LTAuNTA5LDAuNDc5LTAuNzgyYy0wLjg1NS0wLjYyOS04LjMyOC0zLjExOC0xMi40OTItNi45NDhjLTYtNS41MDktMS4yOS04LjM2NywyLjE2Mi05Ljg0N2MxLjcxMy0wLjcyMSw0LjM2MS0wLjgsNy4wNzIsMC44NzVjNi45MTQsNC4xNzksOS41MzMsOS45NCwxMS4xMTcsMTEuMTM1YzAuODc1LDAuNjA0LDEuOTkyLTAuMjg1LDIuMzktMC41MjZjMS42NTYtMC45OTcsMy4zMDQtMi4wMTQsNC45NDItMy4wNTJDMjUyLjYxMSwzMi42MDQsMjU2LjIyLDMyLjE5MSwyMzkuNDIyLDIzLjQ4OXogTTIxOC4yMDQsMTkuNDNjLTMuMDk4LDEuMDM4LTUuMTY1LDMuMzMtNS44MzksMy41NjRjLTAuNDM3LDAuMTQ0LTEuMDY5LTAuMTAzLTEuNzE1LTAuNjY2Yy0zLjc5My0zLjYwMi05LjAxNS0xMS41NTktNy40NzUtMTEuNjM4YzEuMTA2LTAuMDY5LDExLjEyMiw0LjU2NywxNC44NzUsNi44NDJDMjE5LjcxNiwxOC42MDgsMjE5LjQ0NywxOS4wMDIsMjE4LjIwNCwxOS40M3ogTTUzLjA2MiwzMS45NjFDMzUuNDU4LDU1LjgyNSwzNC45MSw1My45OTYsMzMuNzU2LDUzLjUwNGMtMS45NzUtMC44NDMtMy45NDItMS43MTktNS44OTctMi42MjNjLTAuNTUxLTAuMjUyLTEuODA3LTAuNTk4LTAuODcyLTEuNjQ3YzAuNzg5LTAuNzM5LDEyLjUzMS0xMC4yNjQsMjUuNjI0LTI2LjAwNWMxLjA2NS0xLjI1Miw3LjM3NC04LjYwMiw2LjMwOC04Ljc5MWMtMC45MTQtMC4xNDEtNy4zNjgsNS4yOTgtOS4wMTYsNi41NGMtMTMuOTU2LDEwLjY5MS0xNy45NjYsMTYuMTEtMjAuNjQ4LDE0Ljk5OGMtMy4zNzQtMS40NDksMi45OTktNi4xNzMsMTEuNjY4LTE3LjYwM2MwLjkxLTEuMjQyLDUuNzM4LTYuNTA2LDQuNzctNi42OTFjLTEuMDQ4LTAuMjIyLTguNDM5LDUuNTI3LTkuNzA0LDYuNTE1QzIwLjE0NywzMC4yNSwxMi4xMDIsNDAuMzUyLDExLjM0Myw0MS4xMjdjLTEuMDYyLDAuODgxLTEuOTQ5LDAuMTE4LTIuNDc3LTAuMTkzYy0xLjU3My0wLjkyNi0zLjEzNy0xLjg3My00LjY5Mi0yLjg0Yy0xLjA4Ny0wLjY3LTMuNjIxLTAuNzYyLDE5Ljk2MS0xNi42OEM1NS4yMzMsMC40OTksNTUuNDY5LDEuMTUxLDU1Ljk1MiwxLjE3OWMwLjg1NywwLjAyMSwxLjcxMywwLjA0NCwyLjU3LDAuMDY3YzEuMTA0LDAuMDUsMS40MzgtMC4wMjItMS4wMTcsMy40NzNjLTQuNjIzLDYuODk0LTguMjcxLDExLjE0NC03LjY1MywxMS4yMzdDNTAuMjkzLDE2LDU0Ljc1OSwxMi4zOTgsNjQuNzUsNS4zNjJjNS4xOTUtMy43OTksNS40OTMtMy44MTIsNi42MDMtMy43NThjMC43MjgsMC4wMjEsMS40NTQsMC4wNDIsMi4xODIsMC4wNjJDNzQuMDIsMS42OSw3Ni4yMTcsMC40ODcsNTMuMDYyLDMxLjk2MXpcXFwiLz48L2c+XFxuXFxuXHQ8ZyBpZD1cXFwiZm9vdHN0ZXBzXFxcIj5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1tYXRlb1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNy4wMTk1LDcuMDE5NVxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXRlby1tYXJ0YVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNy4wMTk1LDcuMDE5NVxcXCIgZD1cXFwiTTIzMS43NSwxNDQuNWM2LjY4OC0wLjg1NCw1MS41LDAuNzUsNTcuNTY5LDMwLjcwNGM1LjE4MSwyMC4yOTYsMTcuODk5LDI2LjgwNywyMC4zMTMsMjcuNzIzYzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NywzLjQxOS0xMy43NjksOS4yMjQtMjAuNTE1LDEwLjEzNGMtNi43NDQsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0NS0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdDMzYxLDIyNS43NSwzNDMuNzUsMjcxLDMzMS43NSwyNzcuNWMtMjYsMTctNTIsMTMuNzUtODIuMjE1LTYuMjI0Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNi04LjA5LTEuOTkyLTE1Ljc2Niw0LjAwOC0xNy43NjZcXFwiLz5cdFxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXJ0YS1iZWx1Z2FcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjcuMDE5NSw3LjAxOTVcXFwiIGQ9XFxcIk0yMjkuNSwxNDEuOTQxYzI0LjE5NS00OC4zMzYsNDEuMjg2LTIyLjIxMiw0NC4yMjQtMjIuMjEyYzguMTU1LDAsMTQuNTY1LTEwLjI3MywzNC45NC05LjI2NGMyMC44NDYsMS4wMzQsNDUuNDc3LDUuNSw1MS44NTEsMjguODY5YzcuMjA2LDI2LjQyMi0zMi40NjgsMzguMDEyLTM3LjcxMSwyMC4wMzdjLTIuMzQxLTguMDI1LDguMjAzLTEzLjcyOSwxNC43MzMtMTQuMTQzYzI5Ljc4OC0xLjg4Nyw1My41ODEtMy40NTgsNzguMzY1LDEzLjU1MmM0MS4zMDQsMjguMzQ4LDM0LjIwOCw3OS4yMDQsNDcuNzI4LDEyMi41NTljMS43NjgsNS42NjgsNS43MSwxMC42NDMsMTAuMDE4LDE0LjcyOWMyMC4zNjEsMTkuMzE4LDkxLjI2MiwxNS42ODIsMTAyLjUyNC0xNi40OThjMTIuNzItMzYuMzQzLTUxLjQyOC01MC4wOTctNzAuNzA3LTIyLjM4OGMtMS4zMTMsMS44ODctMi4wMzQsNC4yMDUtMi4zNTgsNi40OGMtMi4wNDEsMTQuMzQ4LTQuMTMsMjguNzQtNC43MTMsNDMuMjIxYy0xLjM4MywzNC4zNDQsMC4xMDIsNjguNzYyLTEuMTc4LDEwMy4xMTJjLTAuNDU3LDEyLjI3OS0yMC4yMTUsMTcuOTMyLTI4Ljg3MiwxMS4xOTdjLTcuNjM4LTUuOTQzLDEuNjE1LTEzLjkwNCw2LjQ4MS0xNi4xMTVjMTAuOTc2LTQuOTkyLDI2LjAzNS0wLjkwNiwzMi45OTgsOC44MzhjNy44NjEsMTEuMDA0LTAuODcxLDIyLjM0Mi01Ljg5NSwzMS4yMjljLTE5LjIxLDMzLjk4LTM1LjcwNSwzOC44ODktNzQuMDY0LDM4Ljg4OVxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJiZWx1Z2EtaXNhbXVcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjcuMDE5NSw3LjAxOTVcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImlzYW11LWNhcGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIyXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI3LjAxOTUsNy4wMTk1XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiY2FwYXMtcGVsb3Rhc1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNy4wMTk1LDcuMDE5NVxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInBlbG90YXMtbWFydGFcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjcuMDE5NSw3LjAxOTVcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXJ0YS1rb2JhcmFoXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIyXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI3LjAxOTUsNy4wMTk1XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJrb2JhcmFoLWR1YlxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNy4wMTk1LDcuMDE5NVxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1wYXJhZGlzZVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNy4wMTk1LDcuMDE5NVxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwicmV0dXJuLXRvLWJlZ2luXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLXdpZHRoPVxcXCIyXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI3LjAxOTUsNy4wMTk1XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG5cdDxnIGlkPVxcXCJtYXAtZG90c1xcXCI+XFxuXHRcdDxnIGlkPVxcXCJkZWlhXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgyMTAsIDE3MClcXFwiPjxjaXJjbGUgaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDI0MCwgMTQ2KVxcXCI+PGNpcmNsZSBpZD1cXFwibWF0ZW9cXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgyNjAsIDIxNClcXFwiPjxjaXJjbGUgaWQ9XFxcIm1hcnRhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImVzLXRyZW5jXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSg0MjYsIDQ3OClcXFwiPjxjaXJjbGUgaWQ9XFxcImlzYW11XFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDQwMCwgNDQ2KVxcXCI+PGNpcmNsZSBpZD1cXFwiYmVsdWdhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJhcmVsbHVmXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMjEsIDM2NClcXFwiPjxjaXJjbGUgaWQ9XFxcImNhcGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTI2LCAzNDApXFxcIj48Y2lyY2xlIGlkPVxcXCJwZWxvdGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTM3LCAzMTgpXFxcIj48Y2lyY2xlIGlkPVxcXCJtYXJ0YVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEwNiwgMzI2KVxcXCI+PGNpcmNsZSBpZD1cXFwia29iYXJhaFxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEwNiwgMzAwKVxcXCI+PGNpcmNsZSBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoODAsIDMxNSlcXFwiPjxjaXJjbGUgaWQ9XFxcInBhcmFkaXNlXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG48L3N2Zz5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXM0PXRoaXMubGFtYmRhO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHQ8aGVhZGVyPlxcblx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdDwvYT5cXG5cdDwvaGVhZGVyPlxcblx0XFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYWluLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImZlZWRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE2MiA0N1xcXCI+IFxcblx0XHRcdFx0XHQ8dGV4dCB4PVxcXCI0MlxcXCIgeT1cXFwiLTRcXFwiPkEgVklTSU9OIE9GPC90ZXh0Plxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNDIuNTgyLDE4LjIzOWMtMC4zMSwwLjUyLTAuMzI1LDAuODU5LTAuMDQyLDAuOTIyYzAuNDM1LDAuMTA1LDMuMzQ2LTAuNTYyLDUuMzg0LTAuMjA0YzAuODE4LDAuMTQ5LDEuMzAyLTAuMDE4LDEuOTA3LTEuMzExYzEuMjktMi44OTQsMi42My05LjA0NSwxLjkyOS05LjA5MUM1MC43NzksOC41MTQsNDQuNTU0LDE1LjE1NCw0Mi41ODIsMTguMjM5IE0zOS4wMzYsMzkuOWMtMC4yNzEtMC4wNzUtMS4yMTUtMC4xODctMC44NzgtMC44NzJjMC42NjUtMS4yNDksNS4wODYtNS4yNjYsNy40NTItMTAuNTk4YzAuOTQ3LTIuMDk0LDAuMjE3LTMuMTA0LTAuOTE5LTMuMzU0Yy0yLjI5OS0wLjQ4NS02LjMyNC0wLjcwMi05LjM0OCw0LjE1M2MtMi4wOTcsMy4zNzQtMi4zODgsNy42ODItMi43MzgsOC4zNTRjLTAuMTUsMC4yNjQtMC4zNTQsMC4yNDctMC43NDIsMC4xMTdjLTEuNDIxLTAuNDc4LTIuODM2LTAuOTc5LTQuMjQ0LTEuNTA0Yy0xLjUyMy0wLjU4LDAuNjMxLTQuNDMzLDQuMzM0LTkuNzUzQzQ0LjY2OSw5LjQwMSw1NS4xODUsMS4wMzQsNTUuNjg3LDAuODVjMC40MTItMC4wOTEsMS44NTMsNi42NzktNi40NzgsMjkuMDQ0Yy01LjA0NCwxMi43MzgtNS44NzYsMTEuMTI3LTYuNzgsMTAuOTAxQzQxLjI5NSw0MC41MTEsNDAuMTY0LDQwLjIxMywzOS4wMzYsMzkuOSBNNDguNDY5LDQyLjE2NWMtMS42Ni0wLjI0LTAuNTUyLTEuODMzLDIuODkyLTExLjY2NGMyLjUwOC02LjQwNywxMS42NzMtMjguNjgxLDEyLjAzLTI4LjczM2MwLjkzMywwLjAyOCwxLjg2NSwwLjA1NiwyLjc5NywwLjA4M2MwLjEyMywwLjAwMywwLjMwNywwLjEwOSwwLjA2MywxLjAwOGMtMC4xODEsMS4xMzktNS41MjgsMTEuNjc1LTkuOTgzLDI1LjE5MmMtMi4xNiw2Ljc4NS0wLjkyNiw4LjcwMywwLjY3NSw4LjkzMmMyLjY5NiwwLjM4Niw1LjI1NS0zLjc0OCw1LjkxNy0zLjY4M2MwLjQ3OCwwLjA0NS0wLjMzOSw5Ljk2MS0wLjM1MywxMC4yMjJjLTAuMTk2LDEuMDE5LTEuMTEyLDAuNjYzLTEuNDgzLDAuNjE5QzU2LjgxNiw0My42Nyw1Mi42MjUsNDMuMDExLDQ4LjQ2OSw0Mi4xNjUgTTY1LjUsNDQuNTcxYy0xLjY2OS0wLjAzNS0wLjg2Mi0xLjc4MywwLjc5Ni0xMi4xNTNjMS4zMzQtNi44MTIsNi40MzctMzAuMzU3LDYuNzg5LTMwLjM2N2MwLjkzMywwLjAyNywxLjg2NSwwLjA1MywyLjc5OCwwLjA3OWMwLjEyMywwLjAwMywwLjMyNCwwLjExMiwwLjI0MSwxLjAzOGMwLjAyLDEuMTQxLTMuNDE4LDEyLjEyOC01LjQzLDI2LjI3N2MtMC45MzYsNy4wODEsMC42MTMsOC44NzQsMi4yMzEsOC45MjVjMi43MjUsMC4wODQsNC41MzEtNC4zMDEsNS4xOTctNC4yOTZjMC40ODEsMC4wMDQsMS40MDksOS45MTgsMS40NDEsMTAuMTcxYy0wLjAxNywxLjAyOS0wLjk4MywwLjc4Ni0xLjM1OCwwLjc4OEM3My45NjMsNDUuMDYzLDY5LjcyNCw0NC45MSw2NS41LDQ0LjU3MSBNOTMuNjYzLDI3LjY1MmMtMS44NzktMTAuOTMtNC45NzktMTcuODExLTYuMjI1LTE3LjgyOWMtMS4yNDUtMC4wMDUtMi45MTcsNy4wODMtMi41MjgsMTguMzhjMC4yNCw1Ljk3MiwyLjE1Niw4LjIwMiw1LjIxMyw3Ljk1NkM5My4xNzksMzUuOTA2LDk0LjYyNCwzMy40NDYsOTMuNjYzLDI3LjY1MiBNODkuNDY0LDQ1LjI4M2MtNi41MDcsMC41MjQtOC45MTItNi45ODUtOC43NjEtMTUuODUyQzgxLjA4NywxNi4yMSw4My43MiwxLjUxLDg2LjYwNSwxLjY1YzIuODkxLDAuMjEyLDguNDYyLDE0LjI1NiwxMS40NzMsMjYuNjQ1YzEuOTE4LDguMzU1LDEuMDI4LDE1LjkyOS01LjQ2NywxNi42ODhDOTEuNTYyLDQ1LjA5Myw5MC41MTQsNDUuMTkzLDg5LjQ2NCw0NS4yODMgTTEwNC42NDcsMTEuNzk0Yy0xLjE2My0yLjgwMy0yLjcyLTMuNzc4LTMuNzU5LTMuNzQxYy0xLjc1LDAuMDY0LTIuMDQ4LDEuNjMxLDAuNDI4LDkuNzYzYzAuMzAyLDAuOTg1LDAuODk2LDIuODYxLDEuNjExLDIuNzdDMTAzLjgxNSwyMC40NTMsMTA2LjQ0LDE1Ljg0LDEwNC42NDcsMTEuNzk0IE05OS42OSwyLjY2NWMzLjE5MSwwLjEwNCw2LjE3LDQuNDU5LDcuOTYzLDguMDgxYzMuNDEsNi44MDQsMC44MTQsOS41NiwxLjI4NiwxMC44MjNjMC40MDQsMS4zNDMsNy40OTUsNi4xNSwxMi43MDIsMTYuMDExYzAuMjMzLDAuNDY4LDAuMTU1LDAuNTkzLTAuNDgzLDAuNzg5Yy0xLjE0NCwwLjM1Mi0yLjI4OSwwLjY4OS0zLjQzOCwxLjAxM2MtMC41NDgsMC4xNTUtMS40NDIsMC41NS0xLjczMy0wLjE2NWMtMi4xNjMtNC45NzUtNy45MTQtMTMuNjM4LTkuMjg5LTEzLjQ1N2MtMC43NDgsMC4xMjYtMi4wMTUsMi4zMzktMS4yMyw0Ljk3M2MxLjA2NywzLjU4LDQuMTg1LDkuNzQ5LDQuMzE0LDEwLjA2MWMwLjI1NiwwLjc5Mi0wLjU5MSwwLjczMS0wLjg5OCwwLjc5N2MtMS4xOTIsMC4yNjEtMi4zODcsMC41MDctMy41ODMsMC43MzhjLTAuNzcxLDAuMTQ4LTEuNTExLDEuMjQ4LTUuODg3LTE2LjgzM2MtNS43MzYtMjMuODMxLTQuNjg2LTIyLjkxNC00LjM4LTIyLjkxMUM5Ni41ODYsMi42MTQsOTguMTM4LDIuNjQxLDk5LjY5LDIuNjY1IE0xMTQuNjE3LDIxLjIwMmMtNC41MjgtOS4yODMtNy41MDEtMTkuMjg2LTMuNTc1LTE4Ljk2MWMxLjQ3OCwwLjA2MSw0Ljg5NiwxLjM4NCw4LjIzNSw0Ljk2NWMxLjc3NSwxLjk0NCwxLjk1MiwzLjIwMywwLjY0LDMuNDI4Yy0wLjgzNSwwLjEyLTIuNDU1LTMuMzQzLTQuOTA5LTMuMTIxYy0yLjczMiwwLjE2My0wLjM2NCw2LjI0NiwyLjYwNSwxMS4zMDRjNC41MjUsNy43NDgsMTAuMDIsOS42NDYsMTIuNDQ1LDguNzIzYzQuNDk1LTEuNjk0LDAuNDIxLTYuODM5LDAuNjQyLTYuODg5YzAuMzQzLTAuMTExLDIuOTc3LDIuNTE3LDMuMjg0LDIuODUyYzQuNTgyLDQuODkzLDMuODQ4LDkuNDEtMC40MTMsMTEuMTg0QzEyNi41NDksMzcuNTk2LDExOC44NTQsMjkuNzg4LDExNC42MTcsMjEuMjAyIE0xMzIuODQ1LDE0LjI0M2MwLjQwNSwwLjM1NCwwLjgwMywwLjUwNywxLjA3OCwwLjQxOGMwLjQyNC0wLjE0NywxLjcyMi0xLjU4NiwzLjY2OS0yLjIzOGMwLjc4Mi0wLjI2OSwwLjk1LTAuNTE2LTAuMDk3LTEuMTkyYy0yLjM1Ny0xLjQyOS04LjY1My00LjM0LTkuMzQ5LTQuMjk2QzEyNy4xNzksNi45ODQsMTMwLjQ2MSwxMS45ODEsMTMyLjg0NSwxNC4yNDMgTTE1NS4yODgsMjMuMTI0Yy0wLjI1LDAuMTUxLTAuOTUyLDAuNzEtMS41MDIsMC4zM2MtMC45OTUtMC43NS0yLjY0Mi00LjM2OC02Ljk4Ny02Ljk5M2MtMS43MDMtMS4wNTItMy4zNjgtMS4wMDItNC40NDQtMC41NDljLTIuMTY5LDAuOTI5LTUuMTI5LDIuNzI1LTEuMzU4LDYuMTg0YzIuNjE2LDIuNDA2LDcuMzEzLDMuOTY5LDcuODUxLDQuMzYzYzAuMjA2LDAuMTcyLDAuMDcsMC4yOTMtMC4zLDAuNDkxYy0xLjM2LDAuNzI4LTIuNzI5LDEuNDM0LTQuMTA0LDIuMTE4Yy0xLjQ5LDAuNzUtNC43MTEtMi4wMDktOC43NzEtNi4yNjRDMTIyLjgwMiw4LjE3LDEyMS40MDksMi4wODEsMTIxLjkzNSwyLjQxNGMwLjQzOCwwLjIyMSwxMC4zMDksMy42NjUsMjguOTkyLDEyLjU1OGMxMC41NTksNS40NjUsOC4yOSw1LjcyNCw3LjQ2Nyw2LjIzNkMxNTcuMzY0LDIxLjg1OSwxNTYuMzI5LDIyLjQ5OCwxNTUuMjg4LDIzLjEyNCBNMy4wNzYsMjQuMTQzYy0wLjY4My0wLjQyLTIuMjc1LTAuNDc4LDEyLjU0Ni0xMC40NzVDMzUuMTY2LDAuNTM0LDM1LjMxNCwwLjk0MywzNS42MTgsMC45NjFjMC41MzgsMC4wMTQsMS4wNzcsMC4wMjgsMS42MTUsMC4wNDJjMC42OTQsMC4wMzIsMC45MDQtMC4wMTQtMC42NCwyLjE4MWMtMi45MDUsNC4zMy01LjE5OCw2Ljk5OS00LjgxLDcuMDU3YzAuMjc3LDAuMDI3LDMuMDg0LTIuMjM1LDkuMzYzLTYuNjU0YzMuMjY2LTIuMzg1LDMuNDU0LTIuMzk0LDQuMTUtMi4zNmMwLjQ1OCwwLjAxMywwLjkxNCwwLjAyNiwxLjM3MiwwLjA0YzAuMzA1LDAuMDE1LDEuNjg2LTAuNzQxLTEyLjg2NiwxOS4wMjVDMjIuNzM3LDM1LjI3OCwyMi4zOTMsMzQuMTI5LDIxLjY2OCwzMy44MjFjLTEuMjQyLTAuNTMxLTIuNDc4LTEuMDgtMy43MDgtMS42NDdjLTAuMzQ1LTAuMTU5LTEuMTM0LTAuMzc2LTAuNTQ3LTEuMDM0YzAuNDk2LTAuNDY0LDcuODc1LTYuNDQ2LDE2LjEwNC0xNi4zMzJjMC42Ny0wLjc4Niw0LjYzNC01LjQwMiwzLjk2NS01LjUyMWMtMC41NzQtMC4wODgtNC42MywzLjMyOC01LjY2Nyw0LjEwN2MtOC43NzEsNi43MTQtMTEuMjkxLDEwLjExNy0xMi45NzcsOS40MThjLTIuMTIxLTAuOTEsMS44ODQtMy44NzcsNy4zMzMtMTEuMDU0YzAuNTcxLTAuNzgsMy42MDYtNC4wODYsMi45OTgtNC4yMDFjLTAuNjYtMC4xNC01LjMwNSwzLjQ3MS02LjA5OSw0LjA5MWMtOS45NTcsNy41NjktMTUuMDEzLDEzLjkxMi0xNS40OSwxNC4zOTljLTAuNjY3LDAuNTU0LTEuMjI0LDAuMDc0LTEuNTU2LTAuMTIxQzUuMDM2LDI1LjM0Niw0LjA1MywyNC43NTEsMy4wNzYsMjQuMTQzXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtYXBcXFwiPlxcblx0XHRcdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tb2JpbGVtYXAgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1vYmlsZW1hcCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibW9iaWxlbWFwXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHQ8cD5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ2VuZXJpYyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ2VuZXJpYyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZ2VuZXJpY1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3A+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJpbmRleFxcXCI+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b20tcGFydFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxmb290ZXI+XFxuXHRcdFxcblx0XHQ8dWw+XFxuXHRcdFx0PGxpIGlkPSdob21lJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlwiXG4gICAgKyBhbGlhczMoYWxpYXM0KCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5ob21lIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J2dyaWQnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMyhhbGlhczQoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmdyaWQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHRcdDxsaSBpZD0nY29tJyBjbGFzcz0nY29tJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzUgMTdcXFwiPlxcblx0XHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiNGRkZGRkZcXFwiIGQ9XFxcIk0xNy40MTUsMTEuMjAzYzYuMjc1LDAsMTIuMDA5LDIuMDkzLDE2LjM5NCw1LjU0N1YwLjIzMkgxdjE2LjUzNUM1LjM4NywxMy4zMDMsMTEuMTI5LDExLjIwMywxNy40MTUsMTEuMjAzXFxcIi8+XFxuXHRcdFx0XHRcdDwvc3ZnPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J2xhYic+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cIlxuICAgICsgYWxpYXMzKGFsaWFzNCgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J3Nob3AnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMyhhbGlhczQoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHQ8L3VsPlxcblxcblx0PC9mb290ZXI+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGlkPVxcXCJmcm9udC1ibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBpZD0ncGFnZXMtY29udGFpbmVyJz5cXG5cdDxkaXYgaWQ9J3BhZ2UtYSc+PC9kaXY+XFxuXHQ8ZGl2IGlkPSdwYWdlLWInPjwvZGl2PlxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJyZWxhdGl2ZVxcXCI+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJpbnNpZGUtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRleHQtdGl0bGVcXFwiPlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50aXRsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGl0bGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRpdGxlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyZWN0cy1jb250YWluZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJnLWxpbmVcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJnLWJveFxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmctbGluZVxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyZWN0cy1jb250YWluZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJnLWxpbmVcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJnLWJveFxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmctbGluZVxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj5cXG5cdFxcbjwvZGl2Plx0XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsImltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuICAgIFx0XG5jbGFzcyBHbG9iYWxFdmVudHMge1xuXHRpbml0KCkge1xuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdyZXNpemUnLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0QXBwQWN0aW9ucy53aW5kb3dSZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHbG9iYWxFdmVudHNcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuY2xhc3MgUHJlbG9hZGVyICB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKVxuXHRcdHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCB0aGlzLm9uTWFuaWZlc3RMb2FkQ29tcGxldGVkLCB0aGlzKVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gdW5kZWZpbmVkXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMgPSBbXVxuXHR9XG5cdGxvYWQobWFuaWZlc3QsIG9uTG9hZGVkKSB7XG5cblx0XHRpZih0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBtID0gdGhpcy5hbGxNYW5pZmVzdHNbaV1cblx0XHRcdFx0aWYobS5sZW5ndGggPT0gbWFuaWZlc3QubGVuZ3RoICYmIG1bMF0uaWQgPT0gbWFuaWZlc3RbMF0uaWQgJiYgbVttLmxlbmd0aC0xXS5pZCA9PSBtYW5pZmVzdFttYW5pZmVzdC5sZW5ndGgtMV0uaWQpIHtcblx0XHRcdFx0XHRvbkxvYWRlZCgpXHRcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzLmFsbE1hbmlmZXN0cy5wdXNoKG1hbmlmZXN0KVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gb25Mb2FkZWRcbiAgICAgICAgdGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobWFuaWZlc3QpXG5cdH1cblx0b25NYW5pZmVzdExvYWRDb21wbGV0ZWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cdGdldENvbnRlbnRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMucXVldWUuZ2V0UmVzdWx0KGlkKVxuXHR9XG5cdGdldEltYWdlVVJMKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpLmdldEF0dHJpYnV0ZShcInNyY1wiKVxuXHR9XG5cdGdldEltYWdlU2l6ZShpZCkge1xuXHRcdHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50QnlJZChpZClcblx0XHRyZXR1cm4geyB3aWR0aDogY29udGVudC5uYXR1cmFsV2lkdGgsIGhlaWdodDogY29udGVudC5uYXR1cmFsSGVpZ2h0IH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkZXJcbiIsImltcG9ydCBoYXNoZXIgZnJvbSAnaGFzaGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBjcm9zc3JvYWRzIGZyb20gJ2Nyb3Nzcm9hZHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmNsYXNzIFJvdXRlciB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5yb3V0aW5nID0gZGF0YS5yb3V0aW5nXG5cdFx0dGhpcy5zZXR1cFJvdXRlcygpXG5cdFx0dGhpcy5maXJzdFBhc3MgPSB0cnVlXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIub2xkSGFzaCA9IHVuZGVmaW5lZFxuXG5cdFx0Ly8gcmVtb3ZlIHRoZSBhbmFseXRpY3MgcGFyYW1ldGVyc1xuXHRcdHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3BsaXQoJz8nKVxuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaFswXVxuXG5cdFx0aGFzaGVyLmluaXRpYWxpemVkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdGhhc2hlci5jaGFuZ2VkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdHRoaXMuc2V0dXBDcm9zc3JvYWRzKClcblx0fVxuXHRiZWdpblJvdXRpbmcoKSB7XG5cdFx0aGFzaGVyLmluaXQoKVxuXHR9XG5cdHNldHVwQ3Jvc3Nyb2FkcygpIHtcblx0IFx0dmFyIHJvdXRlcyA9IGhhc2hlci5yb3V0ZXNcblx0IFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0IFx0XHR2YXIgcm91dGUgPSByb3V0ZXNbaV1cblx0IFx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKHJvdXRlLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0IFx0fTtcblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCcnLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0fVxuXHRvblBhcnNlVXJsKCkge1xuXHRcdHRoaXMuYXNzaWduUm91dGUoKVxuXHR9XG5cdG9uRGVmYXVsdFVSTEhhbmRsZXIoKSB7XG5cdFx0dGhpcy5zZW5kVG9EZWZhdWx0KClcblx0fVxuXHRhc3NpZ25Sb3V0ZShpZCkge1xuXHRcdHZhciBoYXNoID0gaGFzaGVyLmdldEhhc2goKVxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuZ2V0VVJMUGFydHMoaGFzaClcblx0XHR0aGlzLnVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFydHNbMF0sIChwYXJ0c1sxXSA9PSB1bmRlZmluZWQpID8gJycgOiBwYXJ0c1sxXSlcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gdHJ1ZVxuXHR9XG5cdGdldFVSTFBhcnRzKHVybCkge1xuXHRcdHZhciBoYXNoID0gdXJsXG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJy8nKVxuXHR9XG5cdHVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFyZW50LCB0YXJnZXQpIHtcblx0XHRoYXNoZXIub2xkSGFzaCA9IGhhc2hlci5uZXdIYXNoXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB7XG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0cGFydHM6IHBhcnRzLFxuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHR0YXJnZXQ6IHRhcmdldFxuXHRcdH1cblx0XHRoYXNoZXIubmV3SGFzaC50eXBlID0gaGFzaGVyLm5ld0hhc2guaGFzaCA9PSAnJyA/IEFwcENvbnN0YW50cy5IT01FIDogQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG5cdFx0Ly8gSWYgZmlyc3QgcGFzcyBzZW5kIHRoZSBhY3Rpb24gZnJvbSBBcHAuanMgd2hlbiBhbGwgYXNzZXRzIGFyZSByZWFkeVxuXHRcdGlmKHRoaXMuZmlyc3RQYXNzKSB7XG5cdFx0XHR0aGlzLmZpcnN0UGFzcyA9IGZhbHNlXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBBY3Rpb25zLnBhZ2VIYXNoZXJDaGFuZ2VkKClcblx0XHR9XG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKG5ld0hhc2gsIG9sZEhhc2gpIHtcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gZmFsc2Vcblx0XHRjcm9zc3JvYWRzLnBhcnNlKG5ld0hhc2gpXG5cdFx0aWYodGhpcy5uZXdIYXNoRm91bmRlZCkgcmV0dXJuXG5cdFx0Ly8gSWYgVVJMIGRvbid0IG1hdGNoIGEgcGF0dGVybiwgc2VuZCB0byBkZWZhdWx0XG5cdFx0dGhpcy5vbkRlZmF1bHRVUkxIYW5kbGVyKClcblx0fVxuXHRzZW5kVG9EZWZhdWx0KCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKEFwcFN0b3JlLmRlZmF1bHRSb3V0ZSgpKVxuXHR9XG5cdHNldHVwUm91dGVzKCkge1xuXHRcdGhhc2hlci5yb3V0ZXMgPSBbXVxuXHRcdGhhc2hlci5kaXB0eXF1ZVJvdXRlcyA9IFtdXG5cdFx0dmFyIGkgPSAwLCBrO1xuXHRcdGZvcihrIGluIHRoaXMucm91dGluZykge1xuXHRcdFx0aGFzaGVyLnJvdXRlc1tpXSA9IGtcblx0XHRcdGlmKGsubGVuZ3RoID4gMikgaGFzaGVyLmRpcHR5cXVlUm91dGVzLnB1c2goaylcblx0XHRcdGkrK1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgZ2V0QmFzZVVSTCgpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuVVJMLnNwbGl0KFwiI1wiKVswXVxuXHR9XG5cdHN0YXRpYyBnZXRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpXG5cdH1cblx0c3RhdGljIGdldFJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLnJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXREaXB0eXF1ZVJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmRpcHR5cXVlUm91dGVzXG5cdH1cblx0c3RhdGljIGdldE5ld0hhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5uZXdIYXNoXG5cdH1cblx0c3RhdGljIGdldE9sZEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5vbGRIYXNoXG5cdH1cblx0c3RhdGljIHNldEhhc2goaGFzaCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKGhhc2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyXG4iLCJpbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgaXNSZXRpbmEgZnJvbSAnaXMtcmV0aW5hJ1xuXG5mdW5jdGlvbiBfZ2V0Q29udGVudFNjb3BlKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHJldHVybiBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQoaGFzaE9iai5oYXNoKVxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNUb0xvYWQoKSB7XG4gICAgdmFyIHNjb3BlID0gX2dldENvbnRlbnRTY29wZSgpXG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIHR5cGUgPSBfZ2V0VHlwZU9mUGFnZSgpXG4gICAgdmFyIG1hbmlmZXN0O1xuXG4gICAgaWYodHlwZSAhPSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICB2YXIgZmlsZW5hbWVzID0gW1xuICAgICAgICAgICAgJ2NoYXJhY3RlcicgKyBfZ2V0SW1hZ2VEZXZpY2VFeHRlbnNpb24oKSArJy5wbmcnLFxuICAgICAgICAgICAgJ2NoYXJhY3Rlci1iZy5qcGcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZURldmljZUV4dGVuc2lvbigpIHtcbiAgICB2YXIgcmV0aW5hID0gX2lzUmV0aW5hKClcbiAgICB2YXIgc3RyID0gJ0AxeCdcbiAgICBpZihyZXRpbmEgPT0gdHJ1ZSkgc3RyID0gJ0AyeCdcbiAgICByZXR1cm4gc3RyXG59XG5mdW5jdGlvbiBfaXNSZXRpbmEoKSB7XG4gICAgcmV0dXJuIGlzUmV0aW5hKClcbn1cbmZ1bmN0aW9uIF9nZXREZXZpY2VSYXRpbygpIHtcbiAgICB2YXIgc2NhbGUgPSAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPT0gdW5kZWZpbmVkKSA/IDEgOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgIHJldHVybiAoc2NhbGUgPiAxKSA/IDIgOiAxXG59XG5mdW5jdGlvbiBfZ2V0VHlwZU9mUGFnZShoYXNoKSB7XG4gICAgdmFyIGggPSBoYXNoIHx8IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICBpZihoLnBhcnRzLmxlbmd0aCA9PSAyKSByZXR1cm4gQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG4gICAgZWxzZSByZXR1cm4gQXBwQ29uc3RhbnRzLkhPTUVcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQ29udGVudCgpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgaGFzaCA9IGhhc2hPYmouaGFzaC5sZW5ndGggPCAxID8gJy8nIDogaGFzaE9iai5oYXNoXG4gICAgdmFyIGNvbnRlbnQgPSBkYXRhLnJvdXRpbmdbaGFzaF1cbiAgICByZXR1cm4gY29udGVudFxufVxuZnVuY3Rpb24gX2dldENvbnRlbnRCeUxhbmcobGFuZykge1xuICAgIHJldHVybiBkYXRhLmNvbnRlbnQubGFuZ1tsYW5nXVxufVxuZnVuY3Rpb24gX2dldEdsb2JhbENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIF9nZXRDb250ZW50QnlMYW5nKEFwcFN0b3JlLmxhbmcoKSlcbn1cbmZ1bmN0aW9uIF9nZXRBcHBEYXRhKCkge1xuICAgIHJldHVybiBkYXRhXG59XG5mdW5jdGlvbiBfZ2V0RGVmYXVsdFJvdXRlKCkge1xuICAgIHJldHVybiBkYXRhWydkZWZhdWx0LXJvdXRlJ11cbn1cbmZ1bmN0aW9uIF93aW5kb3dXaWR0aEhlaWdodCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB3OiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgaDogd2luZG93LmlubmVySGVpZ2h0XG4gICAgfVxufVxuZnVuY3Rpb24gX2dldERpcHR5cXVlU2hvZXMoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGJhc2V1cmwgPSBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQpXG4gICAgcmV0dXJuIF9nZXRDb250ZW50U2NvcGUoKS5zaG9lc1xufVxuXG52YXIgQXBwU3RvcmUgPSBhc3NpZ24oe30sIEV2ZW50RW1pdHRlcjIucHJvdG90eXBlLCB7XG4gICAgZW1pdENoYW5nZTogZnVuY3Rpb24odHlwZSwgaXRlbSkge1xuICAgICAgICB0aGlzLmVtaXQodHlwZSwgaXRlbSlcbiAgICB9LFxuICAgIHBhZ2VDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQ29udGVudCgpXG4gICAgfSxcbiAgICBhcHBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRBcHBEYXRhKClcbiAgICB9LFxuICAgIGRlZmF1bHRSb3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0RGVmYXVsdFJvdXRlKClcbiAgICB9LFxuICAgIGdsb2JhbENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldEdsb2JhbENvbnRlbnQoKVxuICAgIH0sXG4gICAgcGFnZUFzc2V0c1RvTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpXG4gICAgfSxcbiAgICBnZXRSb3V0ZVBhdGhTY29wZUJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGlkID0gaWQubGVuZ3RoIDwgMSA/ICcvJyA6IGlkXG4gICAgICAgIHJldHVybiBkYXRhLnJvdXRpbmdbaWRdXG4gICAgfSxcbiAgICBiYXNlTWVkaWFQYXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmdldEVudmlyb25tZW50KCkuc3RhdGljXG4gICAgfSxcbiAgICBnZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkOiBmdW5jdGlvbihwYXJlbnQsIHRhcmdldCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFyZW50LCB0YXJnZXQpXG4gICAgfSxcbiAgICBnZXRFbnZpcm9ubWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBDb25zdGFudHMuRU5WSVJPTk1FTlRTW0VOVl1cbiAgICB9LFxuICAgIGdldFR5cGVPZlBhZ2U6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRUeXBlT2ZQYWdlKGhhc2gpXG4gICAgfSxcbiAgICBnZXRIb21lVmlkZW9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbJ2hvbWUtdmlkZW9zJ11cbiAgICB9LFxuICAgIGdlbmVyYWxJbmZvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmNvbnRlbnRcbiAgICB9LFxuICAgIGRpcHR5cXVlU2hvZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERpcHR5cXVlU2hvZXMoKVxuICAgIH0sXG4gICAgZ2V0TmV4dERpcHR5cXVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKGkrMSkgPiByb3V0ZXMubGVuZ3RoLTEgPyAwIDogKGkrMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGVzW2luZGV4XVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UHJldmlvdXNEaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpLTEpIDwgMCA/IHJvdXRlcy5sZW5ndGgtMSA6IChpLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldERpcHR5cXVlUGFnZUluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldEltYWdlRGV2aWNlRXh0ZW5zaW9uOiBfZ2V0SW1hZ2VEZXZpY2VFeHRlbnNpb24sXG4gICAgZ2V0UHJldmlld1VybEJ5SGFzaDogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBoYXNoICsgJy9wcmV2aWV3LmdpZidcbiAgICB9LFxuICAgIGdldEZlZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5mZWVkXG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBDYW52YXM6IHVuZGVmaW5lZCxcbiAgICBGcm9udEJsb2NrOiB1bmRlZmluZWQsXG4gICAgT3JpZW50YXRpb246IEFwcENvbnN0YW50cy5MQU5EU0NBUEUsXG4gICAgRGV0ZWN0b3I6IHtcbiAgICAgICAgaXNNb2JpbGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb25cbiAgICAgICAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFOlxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy53ID0gYWN0aW9uLml0ZW0ud2luZG93V1xuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy5oID0gYWN0aW9uLml0ZW0ud2luZG93SFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLk9yaWVudGF0aW9uID0gKEFwcFN0b3JlLldpbmRvdy53ID4gQXBwU3RvcmUuV2luZG93LmgpID8gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSA6IEFwcENvbnN0YW50cy5QT1JUUkFJVFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoYWN0aW9uLmFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSwgYWN0aW9uLml0ZW0pIFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBBcHBTdG9yZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIFB4SGVscGVyID0ge1xuXG4gICAgZ2V0UFhWaWRlbzogZnVuY3Rpb24odXJsLCB3aWR0aCwgaGVpZ2h0LCB2YXJzKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21WaWRlbyh1cmwpXG4gICAgICAgIHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlLnNldEF0dHJpYnV0ZShcImxvb3BcIiwgdHJ1ZSlcbiAgICAgICAgdmFyIHZpZGVvU3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpXG4gICAgICAgIHZpZGVvU3ByaXRlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdmlkZW9TcHJpdGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHJldHVybiB2aWRlb1Nwcml0ZVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXI6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjaGlsZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0RnJhbWVJbWFnZXNBcnJheTogZnVuY3Rpb24oZnJhbWVzLCBiYXNldXJsLCBleHQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBiYXNldXJsICsgaSArICcuJyArIGV4dFxuICAgICAgICAgICAgYXJyYXlbaV0gPSB1cmxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFB4SGVscGVyIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBVdGlscyB7XG5cdHN0YXRpYyBOb3JtYWxpemVNb3VzZUNvb3JkcyhlLCBvYmpXcmFwcGVyKSB7XG5cdFx0dmFyIHBvc3ggPSAwO1xuXHRcdHZhciBwb3N5ID0gMDtcblx0XHRpZiAoIWUpIHZhciBlID0gd2luZG93LmV2ZW50O1xuXHRcdGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIFx0e1xuXHRcdFx0cG9zeCA9IGUucGFnZVg7XG5cdFx0XHRwb3N5ID0gZS5wYWdlWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG5cdFx0XHRwb3N5ID0gZS5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0XHRvYmpXcmFwcGVyLnggPSBwb3N4XG5cdFx0b2JqV3JhcHBlci55ID0gcG9zeVxuXHRcdHJldHVybiBvYmpXcmFwcGVyXG5cdH1cblx0c3RhdGljIFJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgY29udGVudFcsIGNvbnRlbnRILCBvcmllbnRhdGlvbikge1xuXHRcdHZhciBhc3BlY3RSYXRpbyA9IGNvbnRlbnRXIC8gY29udGVudEhcblx0XHRpZihvcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZihvcmllbnRhdGlvbiA9PSBBcHBDb25zdGFudHMuTEFORFNDQVBFKSB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dIIC8gY29udGVudEgpICogMVxuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dXIC8gd2luZG93SCkgPCBhc3BlY3RSYXRpbykgPyAod2luZG93SCAvIGNvbnRlbnRIKSAqIDEgOiAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHR9XG5cdFx0dmFyIG5ld1cgPSBjb250ZW50VyAqIHNjYWxlXG5cdFx0dmFyIG5ld0ggPSBjb250ZW50SCAqIHNjYWxlXG5cdFx0dmFyIGNzcyA9IHtcblx0XHRcdHdpZHRoOiBuZXdXLFxuXHRcdFx0aGVpZ2h0OiBuZXdILFxuXHRcdFx0bGVmdDogKHdpbmRvd1cgPj4gMSkgLSAobmV3VyA+PiAxKSxcblx0XHRcdHRvcDogKHdpbmRvd0ggPj4gMSkgLSAobmV3SCA+PiAxKSxcblx0XHRcdHNjYWxlOiBzY2FsZVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gY3NzXG5cdH1cblx0c3RhdGljIENhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcblx0ICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG5cdH1cblx0c3RhdGljIFN1cHBvcnRXZWJHTCgpIHtcblx0XHR0cnkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0XHRyZXR1cm4gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApICk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBEZXN0cm95VmlkZW8odmlkZW8pIHtcbiAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgdmlkZW8uc3JjID0gJyc7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZpZGVvLmNoaWxkTm9kZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIFx0Y2hpbGQuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIFx0Ly8gV29ya2luZyB3aXRoIGEgcG9seWZpbGwgb3IgdXNlIGpxdWVyeVxuICAgICAgICBcdGRvbS50cmVlLnJlbW92ZShjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgRGVzdHJveVZpZGVvVGV4dHVyZSh0ZXh0dXJlKSB7XG4gICAgXHR2YXIgdmlkZW8gPSB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZVxuICAgICAgICBVdGlscy5EZXN0cm95VmlkZW8odmlkZW8pXG4gICAgfVxuICAgIHN0YXRpYyBSYW5kKG1pbiwgbWF4LCBkZWNpbWFscykge1xuICAgICAgICB2YXIgcmFuZG9tTnVtID0gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluXG4gICAgICAgIGlmKGRlY2ltYWxzID09IHVuZGVmaW5lZCkge1xuICAgICAgICBcdHJldHVybiByYW5kb21OdW1cbiAgICAgICAgfWVsc2V7XG5cdCAgICAgICAgdmFyIGQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbHMpXG5cdCAgICAgICAgcmV0dXJuIH5+KChkICogcmFuZG9tTnVtKSArIDAuNSkgLyBkXG4gICAgICAgIH1cblx0fVxuXHRzdGF0aWMgR2V0SW1nVXJsSWQodXJsKSB7XG5cdFx0dmFyIHNwbGl0ID0gdXJsLnNwbGl0KCcvJylcblx0XHRyZXR1cm4gc3BsaXRbc3BsaXQubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0fVxuXHRzdGF0aWMgU3R5bGUoZGl2LCBzdHlsZSkge1xuICAgIFx0ZGl2LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1velRyYW5zZm9ybSAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1zVHJhbnNmb3JtICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm9UcmFuc2Zvcm0gICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLnRyYW5zZm9ybSAgICAgICA9IHN0eWxlXG4gICAgfVxuICAgIHN0YXRpYyBUcmFuc2xhdGUoZGl2LCB4LCB5LCB6KSB7XG4gICAgXHRpZiAoJ3dlYmtpdFRyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAnbW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdvVHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICd0cmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUpIHtcbiAgICBcdFx0VXRpbHMuU3R5bGUoZGl2LCAndHJhbnNsYXRlM2QoJyt4KydweCwnK3krJ3B4LCcreisncHgpJylcblx0XHR9ZWxzZXtcblx0XHRcdGRpdi5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuXHRcdFx0ZGl2LnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuXHRcdH1cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvKGl0ZW0sIHRvUG9zaXRpb24sIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1Bvc2l0aW9uLnggLSBpdGVtLnBvc2l0aW9uLnhcbiAgICBcdHZhciBkeSA9IHRvUG9zaXRpb24ueSAtIGl0ZW0ucG9zaXRpb24ueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9Qb3NpdGlvbi54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9Qb3NpdGlvbi55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHkueCArPSAodGFyZ2V0WCAtIGl0ZW0ucG9zaXRpb24ueCkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnkgKz0gKHRhcmdldFkgLSBpdGVtLnBvc2l0aW9uLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eS55ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG4gICAgfVxuICAgIHN0YXRpYyBTcHJpbmdUb1NjYWxlKGl0ZW0sIHRvU2NhbGUsIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1NjYWxlLnggLSBpdGVtLnNjYWxlLnhcbiAgICBcdHZhciBkeSA9IHRvU2NhbGUueSAtIGl0ZW0uc2NhbGUueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9TY2FsZS54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9TY2FsZS55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICs9ICh0YXJnZXRYIC0gaXRlbS5zY2FsZS54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS55ICs9ICh0YXJnZXRZIC0gaXRlbS5zY2FsZS55KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25JbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnXG59XG5cbi8vIERpc3BhdGNoZXJcbnZhciBQYWdlckRpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVBhZ2VyQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKGFjdGlvbilcblx0fVxufSlcblxuLy8gU3RvcmVcbnZhciBQYWdlclN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGZpcnN0UGFnZVRyYW5zaXRpb246IHRydWUsXG4gICAgcGFnZVRyYW5zaXRpb25TdGF0ZTogdW5kZWZpbmVkLCBcbiAgICBkaXNwYXRjaGVySW5kZXg6IFBhZ2VyRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBwYXlsb2FkLnR5cGVcbiAgICAgICAgdmFyIGl0ZW0gPSBwYXlsb2FkLml0ZW1cbiAgICAgICAgc3dpdGNoKGFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWTpcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTXG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlLCBpdGVtKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IGZhbHNlXG5cdFx0dGhpcy5jb21wb25lbnREaWRNb3VudCA9IHRoaXMuY29tcG9uZW50RGlkTW91bnQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdHJlbmRlcihjaGlsZElkLCBwYXJlbnRJZCwgdGVtcGxhdGUsIG9iamVjdCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbE1vdW50KClcblx0XHR0aGlzLmNoaWxkSWQgPSBjaGlsZElkXG5cdFx0dGhpcy5wYXJlbnRJZCA9IHBhcmVudElkXG5cdFx0XG5cdFx0aWYoZG9tLmlzRG9tKHBhcmVudElkKSkge1xuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnRJZFxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGlkID0gdGhpcy5wYXJlbnRJZC5pbmRleE9mKCcjJykgPiAtMSA/IHRoaXMucGFyZW50SWQuc3BsaXQoJyMnKVsxXSA6IHRoaXMucGFyZW50SWRcblx0XHRcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0fVxuXG5cdFx0aWYodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH1lbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHR2YXIgdCA9IHRlbXBsYXRlKG9iamVjdClcblx0XHRcdHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0XG5cdFx0fVxuXHRcdGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHNsdWcoY2hpbGRJZCkpXG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMucGFyZW50LCB0aGlzLmVsZW1lbnQpXG5cblx0XHRzZXRUaW1lb3V0KHRoaXMuY29tcG9uZW50RGlkTW91bnQsIDApXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRoaXMudGxPdXQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0Ly8gcmVzZXRcblx0XHR0aGlzLnRsSW4ucGF1c2UoMClcblx0XHR0aGlzLnRsT3V0LnBhdXNlKDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnRsSW4uZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSlcblx0XHR0aGlzLnRsSW4udGltZVNjYWxlKDEuNilcblx0XHRzZXRUaW1lb3V0KCgpPT50aGlzLnRsSW4ucGxheSgwKSwgODAwKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uT3V0KCkge1xuXHRcdGlmKHRoaXMudGxPdXQuZ2V0Q2hpbGRyZW4oKS5sZW5ndGggPCAxKSB7XG5cdFx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLnRsT3V0LmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKVxuXHRcdFx0dGhpcy50bE91dC50aW1lU2NhbGUoMS44KVxuXHRcdFx0c2V0VGltZW91dCgoKT0+dGhpcy50bE91dC5wbGF5KDApLCA1MDApXG5cdFx0fVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHRoaXMudGxJbi5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpLCAwKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpIHtcblx0XHR0aGlzLnRsT3V0LmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpLCAwKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRmb3JjZVVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR0aGlzLnRsSW4uY2xlYXIoKVxuXHRcdHRoaXMudGxPdXQuY2xlYXIoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHtQYWdlclN0b3JlLCBQYWdlckFjdGlvbnMsIFBhZ2VyQ29uc3RhbnRzLCBQYWdlckRpc3BhdGNoZXJ9IGZyb20gJ1BhZ2VyJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ1BhZ2VzQ29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcblxuY2xhc3MgQmFzZVBhZ2VyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID0gJ3BhZ2UtYidcblx0XHR0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbi5iaW5kKHRoaXMpXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQgPSB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoID0gdGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5jb21wb25lbnRzID0ge1xuXHRcdFx0J25ldy1jb21wb25lbnQnOiB1bmRlZmluZWQsXG5cdFx0XHQnb2xkLWNvbXBvbmVudCc6IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdCYXNlUGFnZXInLCBwYXJlbnQsIHRlbXBsYXRlLCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOLCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluKVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQpXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCwgdGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdHdpbGxQYWdlVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMuc3dpdGNoUGFnZXNEaXZJbmRleCgpXG5cdFx0aWYodGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gIT0gdW5kZWZpbmVkKSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXS53aWxsVHJhbnNpdGlvbkluKClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gIT0gdW5kZWZpbmVkKSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXS53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0cGFnZUFzc2V0c0xvYWRlZCgpIHtcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRBcHBTdG9yZS5QYXJlbnQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nXG5cdFx0QXBwU3RvcmUuRnJvbnRCbG9jay5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHRcdFBhZ2VyQWN0aW9ucy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCgpXG5cdH1cblx0ZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSgpIHtcblx0XHRBcHBBY3Rpb25zLmxvYWRQYWdlQXNzZXRzKClcblx0fVxuXHRwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCgpIHtcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ29sZC1jb21wb25lbnQnKVxuXHR9XG5cdHN3aXRjaFBhZ2VzRGl2SW5kZXgoKSB7XG5cdFx0dmFyIG5ld0NvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdFx0dmFyIG9sZENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddXG5cdFx0aWYobmV3Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgbmV3Q29tcG9uZW50LnBhcmVudC5zdHlsZVsnei1pbmRleCddID0gMlxuXHRcdGlmKG9sZENvbXBvbmVudCAhPSB1bmRlZmluZWQpIG9sZENvbXBvbmVudC5wYXJlbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDFcblx0fVxuXHRzZXR1cE5ld0NvbXBvbmVudChoYXNoLCBUeXBlLCB0ZW1wbGF0ZSkge1xuXHRcdHZhciBpZCA9IFV0aWxzLkNhcGl0YWxpemVGaXJzdExldHRlcihoYXNoLnBhcmVudC5yZXBsYWNlKFwiL1wiLCBcIlwiKSlcblx0XHR0aGlzLm9sZFBhZ2VEaXZSZWYgPSB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICh0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID09PSAncGFnZS1hJykgPyAncGFnZS1iJyA6ICdwYWdlLWEnXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jdXJyZW50UGFnZURpdlJlZilcblxuXHRcdHZhciBwcm9wcyA9IHtcblx0XHRcdGlkOiB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmLFxuXHRcdFx0aXNSZWFkeTogdGhpcy5vblBhZ2VSZWFkeSxcblx0XHRcdGhhc2g6IGhhc2gsXG5cdFx0XHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUsXG5cdFx0XHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSxcblx0XHRcdGRhdGE6IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR9XG5cdFx0dmFyIHBhZ2UgPSBuZXcgVHlwZShwcm9wcylcblx0XHRwYWdlLnJlbmRlcihpZCwgZWwsIHRlbXBsYXRlLCBwcm9wcy5kYXRhKVxuXHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSA9IHBhZ2VcblxuXHRcdGlmKFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9PT0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTKSB7XG5cdFx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXS5mb3JjZVVubW91bnQoKVxuXHRcdH1cblx0fVxuXHRvblBhZ2VSZWFkeShoYXNoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uUGFnZVJlYWR5KGhhc2gpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHVubW91bnRDb21wb25lbnQocmVmKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzW3JlZl0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzW3JlZl0ucmVtb3ZlKClcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBhZ2VyXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJjb250ZW50XCI6IHtcblx0XHRcInR3aXR0ZXJfdXJsXCI6IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9jYW1wZXJcIixcblx0XHRcImZhY2Vib29rX3VybFwiOiBcImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9DYW1wZXJcIixcblx0XHRcImluc3RhZ3JhbV91cmxcIjogXCJodHRwczovL2luc3RhZ3JhbS5jb20vY2FtcGVyL1wiLFxuXHRcdFwibGFiX3VybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9sYWJcIixcblx0XHRcIm1lbl9zaG9wX3VybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL3NzMTZfaW5zcGlyYXRpb25cIixcblx0XHRcIndvbWVuX3Nob3BfdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9zczE2X2luc3BpcmF0aW9uXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJNQVBcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiSU5ERVhcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJNZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiV29tZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImZyXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQWNoZXRlclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tbWVcIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiZmVtbWVcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImVzXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJhclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tYnJlXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIm11amVyXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJJTkRFWFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkFjcXVpc2l0aVwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwidW9tb1wiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJkb25uYVwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIlxuXHRcdFx0fSxcblx0XHRcdFwiZGVcIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJNQVBcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiSU5ERVhcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIZXJyZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiRGFtZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcInB0XCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJlXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIb21lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJNdWxoZXJcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0XCJsYW5nc1wiOiBbXCJlblwiLCBcImZyXCIsIFwiZXNcIiwgXCJpdFwiLCBcImRlXCIsIFwicHRcIl0sXG5cblx0XCJob21lLXZpZGVvc1wiOiBbXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzgwY2RjNGM1MDM2NDk1ZTQyODAzYjBmZmFiMzAwNDM0MzE1ZWUzODMvZGVpYS1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzdhMTVmN2MwNGViNTRkYWJiODUxMzg2MGNlMmQxYjM0NmQ1ODc5MTAvZGVpYS1tYXRlby5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODM1MDNhZjVmMDE3ZGMzNjYwMWFiMTQyNzc3ZmRlNDFjMmZkOTlhMi9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hNDFhNTlkMGFhMzEzOTcwMzA0N2ZkMWQ3M2U3MTA1ZmI0Nzc2NDQzL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9kMzE2YTEzYTc4M2RmZDk5ZWFlZjlmZWUxMjFmNWE1NzlmYzYyYWI0L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNTFmZDlmZDIwY2U3YmNlMDMzNjA0NWVkM2Y3OWQ2OGNjNDU4ZDU1NS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9jNmJlNjljNjQ2YzEzMWYwYmU2NzA2MmNkNjAwY2IxOWFhNWQyYWIxL2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMzg2ZjViMTA5OTJlNzgwNWUxYmNmN2JkMzg5YTdlZjU1ZWFkYjkwNC9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zOGUzMjY2MTA4OTVjNTExMzYzMDExMDU4ZGMzMDgwNTk0YTgxNDNiL2FyZWxsdWYta29iYXJhaC5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDA5Y2FmNjkzY2U4ZDAyZjZiNjdiN2UwM2I4ZmE3YTUzMjdmNmYzNC9hcmVsbHVmLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTViMzc0ZmEyNzY0NGQ5YzFjZGMwYWVkMjQ1ZDRhYzllMDQ4MGQ4MC9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiXG5cdF0sXG5cblx0XCJmZWVkXCI6IFtcblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXRlb1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkVzdHJlbm8gQ2FtcGVycyBwYXJhIG51ZXN0cm8gd2Vla2VuZCBlbiBEZWlhIEBNYXJ0YVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQcm9maWxlIHBpYz8gbWF5YmU/IG1heWJlIGJhYnk/XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWF0ZW9cIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQb3JxdWUgZXNhIGNhcmEgZGUgZW1vPz8gQE1hdGVvIGxvbCEhICNTZWxmaWVWaWRlbyAjTWFsbG9yY2FCeUNhbXBlclwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJUaGVzZSBzaG9lcyBhcmUgdGhlIHNob2VzIE1pcmtvIHdvdWxkIHdlYXIgaWYgaGUgd2FzIHN0aWxsIGFsaXZlIGFuZCBraWNraW4nXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQb3JxdWUgbm8gdmllbmVzIGEgRGVpYSBjb24gQE1hcnRhIHkgY29ubWlnbyBlbCBwcm94aW1vIHdlZWtlbmQ/P1wiXG5cdFx0XHRcdH0se1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTm8gcHVlZG9vb29v4oCmIHRlbmdvIGNsYXNlcyBkZSBwaW50dXJhIHkgbWkgbWFkcmUgdmllbmUgYSB2aXNpdGFyICNoZWF2eW1ldGFsXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCIjYXJ0c2VsZmllXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJEZWVwIGJsdWUgI2NhbXBlcnNob2VzXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlRoYW5rcyBmb3IgdGhlIGZsb3dlcnMgQE1hdGVvIHNvb28gY3V1dXRlLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTGFzIGZsb3JlcyBxdWUgQG1hdGVvIG1lIHJlZ2Fsby4gI01hbGxvcmNhQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1lLi4uIEhlaGUgOikgI2NhbXBlcnNob2VzICNCZWx1Z2FcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRXMgVHJlbmMgaXMgdGhlIHBsYWNlIHRvIGJlLiBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkFsbCB0aGlzIHNtb2tlIGlzIG5vdCB3aGF0IHlvdSB0aGluayBpdCBpcyAjSGlnaG9uTGlmZVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJpc2FtdVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlN1cGVybmF0dXJhbCBiZWF1dHkuIEkgbG92ZSB0aGUgbmV3ICNtZVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJpc2FtdVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiaXNhbXVcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiU28gY2FsbSBhdCBFcyBUcmVuYy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiaXNhbXVcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJpc2FtdVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiaXNhbXVcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiSGlpaWkhISEgOikgI01hbGxvcmNhQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImNhcGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTmV3IGNvbG9ycy4gU2FtZSBlbmVyZ3lcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTGFzdCBuaWdodCB3YXMgaW4tc2FuZS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImNhcGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNvIG11Y2ggZnVuIE1hbGxvcmNhICNNYWxsb3JjYUJ5Q2FtcGVyXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJDaGVjayBvdXQgbXkgbW9sZGVkIFBlbG90YXNcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlJpZGVycyBvZiBNYWxsb3JkYSAjY2FtcGVyc2hvZXNcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBlbG90YXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiV2hhdCBoYXBwZW5zIGluIEFyZWxsdWYgc3RheXMgaW4gI0FyZWxsdWZcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk5vIG5vbnNlbnNlICNzZWxmaWUgI01hbGxvcmNhQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiVGhlc2UgbmV3IENhbXBlcnMgYXJlIERhIGJvbWJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiSSdtIG5vdCBnb2luZyBpbiB0aGUgcG9vbCBsaWtlIHRoaXMuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJBZnRlciBwYXJ0eS4gQWZ0ZXIgbGlmZSAjU2VsZmllTGlmZSAjTWFsbG9yY2FCeUNhbXBlclwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiSSBkYXJlIHlvdVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiV2lzaCB5b3Ugd2VyZSBoZXJlICNhcmVsbHVmXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkhhdGVycyB3aWxsIHNheSBpdCdzIFBob3Rvc2hvcFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQ2FsbCBtZSBQYW5kZW1vbmlhICNNYWxsb3JjYUJ5Q2FtcGVyXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTXkgbmV3IENhbXBlcnMgYXJlIHRoZSBTVVYgb2Ygc2hvZXNcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJGcmVlIGRpdmluZyBleGN1cnNpb25zIHRoaXMgYWZ0ZXJub29uIGF0ICNhcmVsbHVmLiBQTSBtZSBpZiBpbnRlcmVzdGVkXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiUGVhY2UgWeKAmWFsbCAjTWFsbG9yY2FCeUNhbXBlclwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJCb2xkIGFuZCBCZWF1dGlmdWxcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRGV0b3ggYnkgdGhlIHBvb2wuIE11Y2ggbmVlZGVkLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNlbGZpZSBvbiB3YXRlcnNsaWRlIGxpa2UgYSBib3NzICNTZWxmaWVSaWRlXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkkgYW0gbm90IGEgYmltYm8uXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH1cblx0XSxcblxuXHRcImRlZmF1bHQtcm91dGVcIjogXCJcIixcblxuXHRcInJvdXRpbmdcIjoge1xuXHRcdFwiL1wiOiB7XG5cdFx0XHRcInRleHRzXCI6IHtcblx0XHRcdFx0XCJlblwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiVGhlIFNwcmluZy9TdW1tZXIgMjAxNiBjb2xsZWN0aW9uIGlzIGluc3BpcmVkIGJ5IE1hbGxvcmNhLCB0aGUgTWVkaXRlcnJhbmVhbiBpc2xhbmQgdGhhdCBDYW1wZXIgY2FsbHMgaG9tZS4gT3VyIHZpc2lvbiBvZiB0aGlzIHN1bm55IHBhcmFkaXNlIGhpZ2hsaWdodHMgdGhyZWUgaG90IHNwb3RzOiBEZWlhLCBFcyBUcmVuYywgYW5kIEFyZWxsdWYuIEZvciB1cywgTWFsbG9yY2EgaXNu4oCZdCBqdXN0IGEgZGVzdGluYXRpb24sIGl04oCZcyBhIHN0YXRlIG9mIG1pbmQuICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiVGhlIHZpbGxhZ2Ugb2YgRGVpYSBoYXMgbG9uZyBhdHRyYWN0ZWQgYm90aCByZXRpcmVlcyBhbmQgcm9jayBzdGFycyB3aXRoIGl0cyBwaWN0dXJlc3F1ZSBzY2VuZXJ5IGFuZCBjaGlsbCB2aWJlLiBUaGUgc2VlbWluZ2x5IHNsZWVweSBjb3VudHJ5c2lkZSBoYXMgYSBib2hlbWlhbiBzcGlyaXQgdW5pcXVlIHRvIHRoaXMgbW91bnRhaW4gZW5jbGF2ZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIlRoZSBmaXN0LXB1bXBpbmcgcmFnZXJzIG9mIEFyZW5hbCBhbmQgdW5icmlkbGVkIGRlYmF1Y2hlcnkgb2YgTWFnYWx1ZiBtZWV0IGluIEFyZWxsdWYsIGFuIGltYWdpbmVkIGJ1dCBlcGljIHBhcnQgb2Ygb3VyIHZpc2lvbiBvZiB0aGlzIGJlbG92ZWQgaXNsYW5kLiBJdOKAmXMgYWxsIG5lb24gYW5kIG5vbi1zdG9wIHBhcnR5aW5nIGluIHRoZSBzdW1tZXIgc3VuIOKAkyBxdWl0ZSBsaXRlcmFsbHkgYSBob3QgbWVzcy4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJUaGlzIGNvYXN0YWwgd2lsZGVybmVzcyBib2FzdHMgYnJlYXRodGFraW5nIGJlYWNoZXMgYW5kIGEgc2VyZW5lIGF0bW9zcGhlcmUuIFRoZSBzZWFzaWRlIGhhcyBhbiB1bnRhbWVkIHlldCBwZWFjZWZ1bCBmZWVsaW5nIHRoYXQgaXMgYm90aCBpbnNwaXJpbmcgYW5kIHNvb3RoaW5nLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJmclwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGVjdGlvbiBQcmludGVtcHMvw4l0w6kgMjAxNiBz4oCZaW5zcGlyZSBkZSBNYWpvcnF1ZSwgbOKAmcOubGUgbcOpZGl0ZXJyYW7DqWVubmUgZCdvw7kgQ2FtcGVyIGVzdCBvcmlnaW5haXJlLiBOb3RyZSB2aXNpb24gZGUgY2UgcGFyYWRpcyBlbnNvbGVpbGzDqSBzZSByZWZsw6h0ZSBkYW5zIHRyb2lzIGxpZXV4IGluY29udG91cm5hYmxlcyA6IERlaWEsIEVzIFRyZW5jIGV0IEFyZWxsdWYuIFBvdXIgbm91cywgTWFqb3JxdWUgZXN0IHBsdXMgcXXigJl1bmUgc2ltcGxlIGRlc3RpbmF0aW9uIDogY+KAmWVzdCB1biDDqXRhdCBk4oCZZXNwcml0LiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkxlIHZpbGxhZ2UgZGUgRGVpYSBhdHRpcmUgZGVwdWlzIGxvbmd0ZW1wcyBsZXMgcmV0cmFpdMOpcyBjb21tZSBsZXMgcm9jayBzdGFycyBncsOiY2Ugw6Agc2VzIHBheXNhZ2VzIHBpdHRvcmVzcXVlcyBldCBzb24gYW1iaWFuY2UgZMOpY29udHJhY3TDqWUuIFNhIGNhbXBhZ25lIGTigJlhcHBhcmVuY2UgdHJhbnF1aWxsZSBhZmZpY2hlIHVuIGVzcHJpdCBib2jDqG1lIGNhcmFjdMOpcmlzdGlxdWUgZGUgY2V0dGUgZW5jbGF2ZSBtb250YWduZXVzZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkzigJlleGFsdGF0aW9uIGTigJlBcmVuYWwgZXQgbGVzIHNvaXLDqWVzIGTDqWJyaWTDqWVzIGRlIE1hZ2FsdWYgc2UgcmVqb2lnbmVudCDDoCBBcmVsbHVmLCB1biBsaWV1IGltYWdpbmFpcmUgbWFpcyBjZW50cmFsIGRhbnMgbm90cmUgdmlzaW9uIGRlIGNldHRlIMOubGUgYWRvcsOpZS4gVG91dCB5IGVzdCBxdWVzdGlvbiBkZSBmbHVvIGV0IGRlIGbDqnRlcyBzYW5zIGZpbiBhdSBzb2xlaWwgZGUgbOKAmcOpdMOpIDogdW4gam95ZXV4IGJhemFyLCBlbiBzb21tZS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJDZXR0ZSBuYXR1cmUgc2F1dmFnZSBjw7R0acOocmUgam91aXQgZOKAmXVuZSBzdXBlcmJlIHBsYWdlIGV0IGTigJl1bmUgYXRtb3NwaMOocmUgY2FsbWUuIExlIGJvcmQgZGUgbWVyIGEgdW4gY8O0dMOpIMOgIGxhIGZvaXMgdHJhbnF1aWxsZSBldCBpbmRvbXB0w6kgcXVpIGluc3BpcmUgYXV0YW50IHF14oCZaWwgYXBhaXNlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJlc1wiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sZWNjacOzbiBwcmltYXZlcmEvdmVyYW5vIDIwMTYgZXN0w6EgaW5zcGlyYWRhIGVuIE1hbGxvcmNhLCBsYSBpc2xhIG1lZGl0ZXJyw6FuZWEgcXVlIENhbXBlciBjb25zaWRlcmEgc3UgaG9nYXIuIE51ZXN0cmEgdmlzacOzbiBkZSBlc3RlIHBhcmHDrXNvIHNvbGVhZG8gZGVzdGFjYSB0cmVzIGx1Z2FyZXMgaW1wb3J0YW50ZXM6IERlaWEsIEVzIFRyZW5jIHkgQXJlbGx1Zi4gUGFyYSBub3NvdHJvcywgTWFsbG9yY2Egbm8gZXMgdGFuIHNvbG8gdW4gZGVzdGlubywgZXMgdW4gZXN0YWRvIGRlIMOhbmltby4gI01hbGxvcmNhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImRlaWFcIjogXCJMb3MgaG9yaXpvbnRlcyBwaW50b3Jlc2NvcyB5IGxhIHRyYW5xdWlsaWRhZCBkZWwgcHVlYmxvIGRlIERlaWEgbGxldmFuIG11Y2hvIHRpZW1wbyBjYXV0aXZhbmRvIHRhbnRvIGEgYXJ0aXN0YXMgcmV0aXJhZG9zIGNvbW8gYSBlc3RyZWxsYXMgZGVsIHJvY2suIEVsIHBhaXNhamUgcnVyYWwgZGUgYXBhcmVudGUgY2FsbWEgcG9zZWUgdW4gZXNww61yaXR1IGJvaGVtaW8gcHJvcGlvIGRlIGVzdGUgZW5jbGF2ZSBtb250YcOxb3NvLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiTGEgbG9jdXJhIGZpZXN0ZXJhIGRlIFPigJlBcmVuYWwgeSBlbCBkZXNlbmZyZW5vIGRlIE1hZ2FsdWYgc2UgcmXDum5lbiBlbiBBcmVsbHVmLCB1bmEgY3JlYWNpw7NuIGRlbnRybyBkZSBudWVzdHJhIHZpc2nDs24gZGUgZXN0YSBxdWVyaWRhIGlzbGEuIFRvZG8gZ2lyYSBlbiB0b3JubyBhbCBuZcOzbiB5IGxhIGZpZXN0YSBzaW4gZmluIGJham8gZWwgc29sLiBFbiBkZWZpbml0aXZhLCB1bmEgY29tYmluYWNpw7NuIGV4cGxvc2l2YS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJFc3RlIGVzcGFjaW8gbmF0dXJhbCB2aXJnZW4gY3VlbnRhIGNvbiB1bmEgcGxheWEgaW1wcmVzaW9uYW50ZSB5IHVuIGFtYmllbnRlIHNlcmVuby4gTGEgY29zdGEsIHNhbHZhamUgeSBwYWPDrWZpY2EgYWwgbWlzbW8gdGllbXBvLCB0cmFuc21pdGUgdW5hIHNlbnNhY2nDs24gZXZvY2Fkb3JhIHkgcmVsYWphbnRlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGV6aW9uZSBQcmltYXZlcmEvRXN0YXRlIDIwMTYgw6ggaXNwaXJhdGEgYSBNYWlvcmNhLCBs4oCZaXNvbGEgZGVsIE1lZGl0ZXJyYW5lbyBjaGUgaGEgZGF0byBpIG5hdGFsaSBhIENhbXBlci4gTGEgbm9zdHJhIHZpc2lvbmUgZGkgcXVlc3RvIHBhcmFkaXNvIGFzc29sYXRvIHNpIHNvZmZlcm1hIHN1IHRyZSBsdW9naGkgc2ltYm9sbzogRGVpYSwgRXMgVHJlbmMgZSBBcmVsbHVmLiBQZXIgbm9pLCBNYWlvcmNhIG5vbiDDqCB1bmEgc2VtcGxpY2UgbWV0YSwgw6ggdW5vIHN0YXRvIGQnYW5pbW8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiRGEgdGVtcG8sIGlsIHZpbGxhZ2dpbyBkaSBEZWlhIGF0dGlyYSBwZW5zaW9uYXRpIGUgcm9jayBzdGFyIGNvbiBpbCBzdW8gcGFlc2FnZ2lvIHBpdHRvcmVzY28gZSBsJ2F0bW9zZmVyYSByaWxhc3NhdGEuIExhIGNhbXBhZ25hIGFwcGFyZW50ZW1lbnRlIHNvbm5vbGVudGEgaGEgdW5vIHNwaXJpdG8gYm9ow6ltaWVuIHRpcGljbyBkaSBxdWVzdG8gcGFlc2lubyBkaSBtb250YWduYS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkdsaSBzY2F0ZW5hdGkgZmVzdGFpb2xpIGRpIEFyZW5hbCBlIGxhIHNmcmVuYXRhIGRpc3NvbHV0ZXp6YSBkaSBNYWdhbHVmIHNpIGZvbmRvbm8gaW4gQXJlbGx1ZiwgdW5hIHBhcnRlIGltbWFnaW5hcmlhIG1hIGVwaWNhIGRlbGxhIG5vc3RyYSB2aXNpb25lIGRpIHF1ZXN0YSBhZG9yYXRhIGlzb2xhLiDDiCB1biB0dXJiaW5pbyBkaSBsdWNpIGFsIG5lb24gZSBmZXN0ZSBpbmludGVycm90dGUgc290dG8gaWwgc29sZSBlc3Rpdm8sIHVuIGNhb3MgcGF6emVzY28uICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiUXVlc3QnYXJlYSBwcm90ZXR0YSB2YW50YSB1bmEgc3BpYWdnaWEgbW96emFmaWF0byBlIHVuJ2F0bW9zZmVyYSBzZXJlbmEuIElsIGxpdG9yYWxlIGhhIHVuIGNoZSBkaSBzZWx2YWdnaW8sIG1hIHBhY2lmaWNvLCBjaGUgw6ggc3VnZ2VzdGl2byBlIHJpbGFzc2FudGUgYWwgdGVtcG8gc3Rlc3NvLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJkZVwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiRGllIEtvbGxla3Rpb24gRnLDvGhqYWhyL1NvbW1lciAyMDE2IGhhdCBzaWNoIHZvbiBNYWxsb3JjYSBpbnNwaXJpZXJlbiBsYXNzZW4sIGRlciBNaXR0ZWxtZWVyaW5zZWwsIGF1ZiBkZXIgQ2FtcGVyIHp1IEhhdXNlIGlzdC4gVW5zZXJlIFZpc2lvbiBkZXMgU29ubmVucGFyYWRpZXNlcyBiZWZhc3N0IHNpY2ggbWl0IGRyZWkgSG90c3BvdHM6IERlaWEsIEVzIFRyZW5jIHVuZCBBcmVsbHVmLiBGw7xyIHVucyBpc3QgTWFsbG9yY2EgbWVociBhbHMgbnVyIGVpbiBSZWlzZXppZWwsIGVzIGlzdCBlaW5lIExlYmVuc2VpbnN0ZWxsdW5nLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkRlciBPcnQgRGVpYSBtaXQgc2VpbmVyIG1hbGVyaXNjaGVuIExhbmRzY2hhZnQgdW5kIEzDpHNzaWdrZWl0IHppZWh0IHNlaXQgdmllbGVuIEphaHJlbiBuaWNodCBudXIgUGVuc2lvbsOkcmUsIHNvbmRlcm4gYXVjaCBSb2Nrc3RhcnMgYW4uIERpZSB2ZXJzY2hsYWZlbiBhbm11dGVuZGUgR2VnZW5kIHZlcnNwcsO8aHQgZWluZW4gZ2FueiBiZXNvbmRlcmVuIEJvaGVtaWFuLUNoYXJtZSwgZGVyIGVpbnppZ2FydGlnIGlzdCBmw7xyIGRpZXNlIEdlYmlyZ3NlbmtsYXZlLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiRGllIGdlc3TDpGhsdGVuIEvDtnJwZXIgdm9uIEFyZW5hbCB1bmQgZGllIHVuZ2V6w7xnZWx0ZSBPZmZlbmhlaXQgdm9uIE1hZ2FsdWYgdHJlZmZlbiBpbiBBcmVsbHVmIGF1ZmVpbmFuZGVyIOKAkyBlaW4gZmFudGFzaWV2b2xsZXMgdW5kIGRvY2ggdW1mYXNzZW5kZXMgRWxlbWVudCB1bnNlcmVyIFZpc2lvbiBkZXIgYmVsaWVidGVuIEluc2VsLiBFaW4gU29tbWVyIGF1cyBlbmRsb3NlbiBQYXJ0eXMgaW4gTmVvbmZhcmJlbiDigJMgZWluIGVjaHQgaGVpw59lciBPcnQuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiRGllc2VyIHVuYmVyw7xocnRlIEvDvHN0ZW5zdHJlaWZlbiB2ZXJmw7xndCDDvGJlciBlaW5lbiBhdGVtYmVyYXViZW5kZW4gU3RyYW5kIHVuZCBlaW5lIGJlcnVoaWdlbmRlIEF0bW9zcGjDpHJlLiBEYXMgTWVlciBpc3QgdW5nZXrDpGhtdCB1bmQgZnJpZWR2b2xsIHp1Z2xlaWNoIHVuZCBkaWVudCBhbHMgUXVlbGxlIGRlciBJbnNwaXJhdGlvbiBlYmVuc28gd2llIGFscyBSdWhlcG9sLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJwdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiQSBjb2xlw6fDo28gcHJpbWF2ZXJhL3ZlcsOjbyAyMDE2IHRlbSBNYWlvcmNhIGNvbW8gaW5zcGlyYcOnw6NvLCBhIGlsaGEgbWVkaXRlcnLDom5lYSBxdWUgYSBDYW1wZXIgY2hhbWEgZGUgY2FzYS4gQSBub3NzYSB2aXPDo28gZGVzdGUgcGFyYcOtc28gc29sYXJlbmdvIHJlYWzDp2EgdHLDqnMgbG9jYWlzIGltcG9ydGFudGVzOiBEZWlhLCBFcyBUcmVuYyBlIEFyZWxsdWYuIFBhcmEgbsOzcywgTWFpb3JjYSBuw6NvIMOpIHPDsyB1bSBkZXN0aW5vIGRlIGbDqXJpYXMsIG1hcyB0YW1iw6ltIHVtIGVzdGFkbyBkZSBlc3DDrXJpdG8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiQSBhbGRlaWEgZGUgRGVpYSBzZW1wcmUgYXRyYWl1IHJlZm9ybWFkb3MgZSBlc3RyZWxhcyBkZSByb2NrIGRldmlkbyDDoCBzdWEgcGFpc2FnZW0gcGl0b3Jlc2NhIGUgYW1iaWVudGUgZGVzY29udHJhw61kby4gRXN0YSBhbGRlaWEgY2FtcGVzdHJlIGFwYXJlbnRlbWVudGUgcGFjYXRhIHRlbSB1bSBlc3DDrXJpdG8gYm/DqW1pbywgZXhjbHVzaXZvIGRlc3RlIGVuY2xhdmUgbW9udGFuaG9zby4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkFzIGdyYW5kZXMgZmVzdGFzIGRlIEFyZW5hbCBlIGEgZGl2ZXJzw6NvIHNlbSBsaW1pdGVzIGRlIE1hZ2FsdWYgcmXDum5lbS1zZSBlbSBBcmVsbHVmLCB1bWEgcGFydGUgaW1hZ2luYWRhIG1hcyDDqXBpY2EgZGEgbm9zc2Egdmlzw6NvIGRlc3RhIGlsaGEgdMOjbyBhbWFkYSBwb3IgbsOzcy4gQSBjb21iaW5hw6fDo28gcGVyZmVpdGEgZW50cmUgdG9ucyBuw6lvbiBlIGZlc3RhcyBpbXBhcsOhdmVpcyBzb2IgbyBzb2wgZGUgdmVyw6NvICh1bWEgbWlzdHVyYSBiZW0gcXVlbnRlLCBuYSByZWFsaWRhZGUpLiAjQXJlbGx1ZkJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJlcy10cmVuY1wiOiBcIkVzdGEgdmFzdGEgcmVnacOjbyBjb3N0ZWlyYSBwb3NzdWkgcHJhaWFzIGltcHJlc3Npb25hbnRlcyBlIHVtIGFtYmllbnRlIHNlcmVuby4gTyBsaXRvcmFsIHRlbSB1bWEgYXRtb3NmZXJhIHNlbHZhZ2VtIGUgdHJhbnF1aWxhIGFvIG1lc21vIHRlbXBvLCBxdWUgw6kgdGFudG8gaW5zcGlyYWRvcmEgY29tbyByZWxheGFudGUuICNFc1RyZW5jQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0XCJhc3NldHNcIjogW1xuXHRcdFx0XHRcImJhY2tncm91bmQuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1jYXBhcy5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWtvYmFyYWguanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wYXJhZGlzZS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLXBlbG90YXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1tYXJ0YS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hcnRhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtbWF0ZW8uanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtYmVsdWdhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWlzYW11LmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxODgsIFwic1wiOiA4NSwgXCJ2XCI6IDYxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM1NywgXCJzXCI6IDk3LCBcInZcIjogMjYgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM1OSwgXCJzXCI6IDkzLCBcInZcIjogNTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2I3NDFlZWIxNzM3YTY4MmY1NjQ2Y2JhMTdlMDQwNjMwYTFkZDAxOGEvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJCcmVha2luZyB1cCB2aWEgdGV4dCBtZXNzYWdlLiBub3QgYSB2ZXJ5IGRlaWEgdGhpbmcgdG8gZG9cIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL2R1Yl9kZWlhX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImF6amMyamg2MmpcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJsbmZ2YzNhZzUwXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWlhL21hdGVvXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2U0MjQ4ODlhYzAyNmY3MGU1NDRhZjAzMDM1ZTcxODdmMzQ5NDE3MDUvZGVpYS1tYXRlby5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDM3LCBcInNcIjogODksIFwidlwiOiA4MyB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogOCwgXCJzXCI6IDg2LCBcInZcIjogNTcgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzM0NGM3MTEyMzg5Nzc0OTBjMDczMDUwOWU3M2JhMTE3Zjk0NjQzMzgvZGVpYS1tYXRlby5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcImJ1eXMgYW4gYXRlbGllciBhdCBkZWlhLiBzdGFydHMgY2FyZWVyIGFzIGFuIGFydGlzdFwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvbWF0ZW9fZGVpYV9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCI2aGV0MWtuaWszXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiNnAzMmx5dmRxb1wiXG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJkZWlhL21hcnRhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzRiYjZlNDg1YjcxN2JmN2RiZGQ1Yzk0MWZhZmEyYjE4ODRlOTA4MzgvZGVpYS1tYXJ0YS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDM0NiwgXCJzXCI6IDcwLCBcInZcIjogNTUgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjQ0LCBcInNcIjogMjksIFwidlwiOiA3MyB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjQ0LCBcInNcIjogMjksIFwidlwiOiA3MyB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZDE1OWI1NWZmOGNlY2M5Y2JkOGMwYzEyZWUyNzgxZTJlZGEyM2U5My9kZWlhLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiRk9NTyBvZiBub3QgYmVpbmcgYXQgZGVpYVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9tYXJ0YV9kZWlhX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcInRvcm8ycGU0NjlcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJiZ2t4N2dtazEzXCJcbiAgICAgICAgfSxcblxuICAgICAgICBcImVzLXRyZW5jL2JlbHVnYVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMzQ0NGQzYzg2OTNlNTlmODA3OWY4MjdkZDE4MmM1ZTMzNDEzODc3L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMiwgXCJzXCI6IDEwLCBcInZcIjogNjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMTkzLCBcInNcIjogMTIsIFwidlwiOiA0NSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTkzLCBcInNcIjogMCwgXCJ2XCI6IDQ1IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy83MDQ1NWFkNzNhZjdiN2UzNWU5ZTY3NDEwOTkyOWMzYjcwMjk0MDY0L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkVzIFRyZW5jIG51ZGlzdCBQQVJUWSBCT1lcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL2JlbHVnYV9lc190cmVuY19zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJmbzExMnpoN3B2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiOTdidnB6aHRuYlwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNmVhZmFlN2YxYjNiYzQxZDg1Njk3MzU1N2EyZjUxNTk4YzgyNDFhNi9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMCwgXCJzXCI6IDEsIFwidlwiOiA3NCB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMSwgXCJzXCI6IDM1LCBcInZcIjogNzIgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDIwLCBcInNcIjogNDUsIFwidlwiOiAzMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDY2NzlmM2ViZDY5NmU5YzQyZmQxM2NmOWRiZGFlZmZlOWIxZjg3My9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIlVGTyBzaWdodGluZyBhdCBlcyB0cmVuY1wiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9pc2FtdV9lc190cmVuY19zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCIxeHNhYnE3eWV5XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwieG5sbnllZTgzb1wiXG4gICAgICAgIH0sXG5cblx0XHRcImFyZWxsdWYvY2FwYXNcIjoge1xuXHRcdFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAwLCBcInNcIjogMCwgXCJ2XCI6IDAgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA3NiwgXCJ2XCI6IDkxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80OGZmMWM1OGI4NmIwODkxMjY4MWI0ZmRmM2I3NTQ3Yzc1Nzc2NmQ3L2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJNRUFOV0hJTEUgSU4gQVJFTExVRlwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvY2FwYXNfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJ6N29yNjhkYTF2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwia2ZjMHUxdnZocFwiXG5cdFx0fSxcbiAgICAgICAgXCJhcmVsbHVmL3BlbG90YXNcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvM2RjZmQ3MGM3MDcyNjkyZWEzYTczOWFlZjUzNzZiMDI2YjA0YjY3NS9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMTEsIFwic1wiOiA5NSwgXCJ2XCI6IDI5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIyLCBcInNcIjogMzUsIFwidlwiOiA3OSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjMzLCBcInNcIjogMzUsIFwidlwiOiAxMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYWMxNmQ1M2M0ZjllOGZkNjkzMDc3OWUyMzc4NTQ2ODdkY2YyNDFlOC9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEFUIEhBUFBFTlMgSU4gQVJFTExVRiBTVEFZUyBJTiBBUkVMTFVGXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9wZWxvdGFzX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiZjlkbzJxbHdualwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcImt5amtid2NuNnZcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvbWFydGFcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOWI5NDcxZGNiZTFmOTRmZjdiMzUwODg0MWY2OGZmMTViZTE5MmVlNC9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjAwLCBcInNcIjogNTcsIFwidlwiOiA4MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAxLCBcInNcIjogMTAwLCBcInZcIjogNjkgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzViOWQyNzA2MTAwZTVlYTBkMzE3MTQzZTIzNzRkNmJkNmM5NjA3YjEvYXJlbGx1Zi1tYXJ0YS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkJBRCBUUklQIEFUIFRIRSBIT1RFTCBQT09MXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL21hcnRhX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwicHBrbWZkbDVqcVwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcInI2NGlqMm9qaDNcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYva29iYXJhaFwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhaC5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDQxLCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82MmU1NGVhYzFkODk4OWFiOWRlMjM4ZmEzZjdjNmQ4ZGI0ZDlkZThkL2FyZWxsdWYta29iYXJhaC5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkhhdGVycyB3aWxsIHNheSBpdCdzIFBob3Rvc2hvcFwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9rb2JhcmFoX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiOXhlNXZqenlib1wiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcIm83OWRxcGhwc2xcIlxuICAgICAgICB9LFxuXHRcdFwiYXJlbGx1Zi9kdWJcIjoge1xuXHRcdFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMTk2LCBcInNcIjogNTIsIFwidlwiOiAzMyB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAxNSwgXCJzXCI6IDg0LCBcInZcIjogMTAwIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxNSwgXCJzXCI6IDg0LCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85ODdiZGFiMDEyOTc5ODIyYjgxODYzNzgzN2NjMjg4NDE0Y2VmOGYzL2FyZWxsdWYtZHViLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hFTiBZT1UgQ0FOJ1QgS0VFUCBUSEUgQVJST1cgT04gVEhFIENFTlRFUiBMSU5FXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9kdWJfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJkbGc1YXp5NWFyXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwicXBoajlwM3Q1aFwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9wYXJhZGlzZVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hODE5YzM3M2Y5Nzc3ODUyZjM5NjdjZTAyM2JjZmIwZDkxMTUzODZmL2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiA1OSwgXCJzXCI6IDE5LCBcInZcIjogOTkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjA3LCBcInNcIjogMzEsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE4MywgXCJzXCI6IDcxLCBcInZcIjogNjQgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzVkYzE5NzI2ZWZhN2IyZTc1NmM4MDUzNGQ0M2ZhNjAwY2M2MWYxNzgvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIlNFTEZJRSBPTiBXQVRFUlNMSURFIExJS0UgQSBCT1NTXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL3BhcmFkaXNlX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiaDg5eTBrdXd5MlwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcIjM0M3Qxc24ybnBcIlxuICAgICAgICB9XG5cblx0fVxufSJdfQ==
