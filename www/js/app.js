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

var _Index_hbs = require('./partials/Index.hbs');

var _Index_hbs2 = _interopRequireDefault(_Index_hbs);

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

		this.scope.generic = _AppStore2['default'].getRoutePathScopeById('/').texts[_AppStore2['default'].lang()].generic;

		this.resize = this.resize.bind(this);
		this.onOpenFeed = this.onOpenFeed.bind(this);
		this.onOpenGrid = this.onOpenGrid.bind(this);
		this.onScroll = this.onScroll.bind(this);

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
			// AppActions.openGrid()

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

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/mobile-footer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mobile-footer.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./partials/Feed.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Feed.hbs","./partials/Index.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Index.hbs","./partials/Mobile.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand","simple-scrolltop":"simple-scrolltop"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js":[function(require,module,exports){
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

var bottomTexts = function bottomTexts(parent) {

	var scope;
	var el = _domHand2['default'].select('.bottom-texts-container', parent);
	var socialWrapper = _domHand2['default'].select('#social-wrapper', el);
	var titlesWrapper = _domHand2['default'].select('.titles-wrapper', el);
	var allTitles = _domHand2['default'].select.all('li', titlesWrapper);
	var textsEls = _domHand2['default'].select.all('.texts-wrapper .txt', el);
	var texts = [];
	var ids = ['generic', 'deia', 'arelluf', 'es-trenc'];
	var oldTl, currentOpenId;
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
			var i, text;
			for (i = 0; i < texts.length; i++) {
				text = texts[i];
				if (id == text.id) {
					if (oldTl != undefined) oldTl.timeScale(2.6).reverse();

					if (f) {
						text.tl.pause(text.tl.totalDuration());
					} else {
						setTimeout(function () {
							return text.tl.timeScale(1.2).play();
						}, 600);
					}

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

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

exports['default'] = function (holder, characterUrl, textureSize) {

	var scope;

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

				if (targetId == 'paradise') scale = ((windowW >> 1) + 100) / textureSize.width * 1;else scale = (windowH - 100) / textureSize.height * 1;

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

},{"./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/colory-rects.js":[function(require,module,exports){
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

				if (scope.isOpen) {
					leftTl.pause(leftTl.totalDuration());
					rightTl.pause(rightTl.totalDuration());
				}
			}, 5);
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

			var imgExt = _AppStore2['default'].getImageDeviceExtension();

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character' + imgExt), this.getImageSizeById('character' + imgExt));
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
			this.updateTimelines();
			_get(Object.getPrototypeOf(Diptyque.prototype), 'setupAnimations', this).call(this);
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
		tweenOut();
	};

	_domHand2['default'].event.on(container, 'mouseenter', mouseEnter);
	_domHand2['default'].event.on(container, 'mouseleave', mouseLeave);

	var offsetX = 26;
	tlLeft = new TimelineMax();
	tlLeft.fromTo(bgLinesLeft[0], 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0);
	tlLeft.fromTo(bgBoxLeft, 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.2);
	tlLeft.fromTo(bgLinesLeft[1], 1, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.4);
	tlLeft.to(bgLinesLeft[0], 1, { x: '100%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.5);
	tlLeft.to(bgBoxLeft, 1, { x: '100%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 0.6);
	tlLeft.addLabel('in');
	tlLeft.to(bgLinesLeft[1], 1, { x: '100%', transformOrigin: '0% 50%', ease: Expo.easeInOut }, 'in');
	tlLeft.addLabel('out');
	tlLeft.pause(0);

	tlRight = new TimelineMax();
	tlRight.fromTo(bgLinesRight[0], 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0);
	tlRight.fromTo(bgBoxRight, 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.2);
	tlRight.fromTo(bgLinesRight[1], 1, { scaleX: 0, transformOrigin: '100% 50%' }, { scaleX: 1, transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.4);
	tlRight.to(bgLinesRight[0], 1, { x: '-100%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.5);
	tlRight.to(bgBoxRight, 1, { x: '-100%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 0.6);
	tlRight.addLabel('in');
	tlRight.to(bgLinesRight[1], 1, { x: '-100%', transformOrigin: '100% 50%', ease: Expo.easeInOut }, 'in');
	tlRight.addLabel('out');
	tlRight.pause(0);

	scope = {
		size: size,
		el: container,
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
    + "		</div>\n		<div class=\"icons-wrapper\">\n			<ul class='left'>\n				<li>\n					<svg width=\"100%\" viewBox=\"0.083 -0.016 22.953 23.783\"><path fill=\"#00EB76\" d=\"M11.56,23.509c-6.19,0-11.227-5.219-11.227-11.633S5.37,0.243,11.56,0.243c6.19,0,11.226,5.219,11.226,11.633S17.75,23.509,11.56,23.509z M11.56,1.613c-5.436,0-9.857,4.604-9.857,10.263s4.421,10.263,9.857,10.263c5.435,0,9.856-4.604,9.856-10.263S16.995,1.613,11.56,1.613z M9.074,11.687c-0.99,0-1.441-1.704-1.441-3.287c0-1.583,0.452-3.288,1.441-3.288c0.991,0,1.442,1.705,1.442,3.288C10.516,9.983,10.064,11.687,9.074,11.687z M14.097,11.687c-0.99,0-1.441-1.704-1.441-3.287c0-1.583,0.451-3.288,1.441-3.288c0.991,0,1.441,1.705,1.441,3.288C15.538,9.983,15.088,11.687,14.097,11.687z M17.629,12.746c-0.006,0.187-0.503,5.763-6.22,5.763c-5.716,0-6.07-5.619-6.073-5.69c0.085,0.008,0.17,0.022,0.254,0.043c0.133,0.032,0.271-0.042,0.308-0.182c0.035-0.133-0.042-0.288-0.175-0.32c-0.505-0.121-1.107-0.089-1.526,0.265C4.091,12.713,4.11,12.9,4.199,12.991c0.105,0.107,0.248,0.088,0.354-0.002c-0.101,0.085,0.198-0.098,0.222-0.105c0.001-0.001,0.002-0.002,0.004-0.002c0.083,1.782,0.933,3.448,2.266,4.576c1.48,1.252,3.439,1.804,5.329,1.555c1.858-0.243,3.572-1.233,4.684-2.809c0.69-0.978,1.085-2.167,1.129-3.378c0.012,0.005,0.439,0.202,0.543,0.094c0.089-0.094,0.104-0.277-0.002-0.367c-0.417-0.353-1.021-0.383-1.523-0.263c-0.315,0.076-0.184,0.577,0.13,0.502C17.436,12.768,17.533,12.752,17.629,12.746z\"/></svg>\n				</li>\n				<li>\n					<svg width=\"100%\" viewBox=\"0 0.309 23 23.857\"><path id=\"Shape\" fill=\"#00EB76\" d=\"M11.5,0.568c-6.213,0-11.25,5.225-11.25,11.669c0,6.444,5.037,11.669,11.25,11.669c6.214,0,11.25-5.225,11.25-11.669C22.75,5.792,17.714,0.568,11.5,0.568L11.5,0.568z M11.5,19.622c-0.973,0-1.758-0.816-1.758-1.824c0-1.007,0.785-1.822,1.758-1.822c0.97,0,1.758,0.815,1.758,1.822C13.258,18.806,12.47,19.622,11.5,19.622L11.5,19.622z M11.852,12.237c-2.719,0-4.922,2.286-4.922,5.105c0,2.778,2.143,5.026,4.804,5.093c-0.08,0.002-0.154,0.013-0.233,0.013c-5.43,0-9.844-4.581-9.844-10.211S6.07,2.026,11.5,2.026c0.236,0,1.338,0.106,1.36,0.109c2.231,0.484,3.913,2.537,3.913,4.997C16.773,9.951,14.567,12.237,11.852,12.237L11.852,12.237z M9.742,6.676c0,1.007,0.785,1.824,1.758,1.824c0.97,0,1.758-0.816,1.758-1.824c0-1.007-0.788-1.823-1.758-1.823C10.527,4.853,9.742,5.669,9.742,6.676z\"/></svg>\n				</li>\n				<li>\n					<svg width=\"100%\" viewBox=\"1.25 -0.741 22.5 23.338\"><path fill=\"#00EB76\" d=\"M14.651,22.147L14.651,22.147c-4.635-0.001-8.782-3.037-10.32-7.555c-2-5.875,0.989-12.344,6.663-14.422c1.13-0.414,2.305-0.632,3.494-0.648c0.378,0,0.716,0.215,0.873,0.549c0.155,0.337,0.111,0.723-0.115,1.01c-0.196,0.252-0.383,0.517-0.557,0.788c-1.798,2.796-2.211,6.215-1.135,9.379c1.075,3.156,3.458,5.542,6.538,6.544c0.298,0.098,0.604,0.182,0.91,0.25c0.356,0.078,0.642,0.363,0.723,0.728c0.082,0.355-0.044,0.725-0.328,0.958c-0.934,0.761-1.979,1.356-3.109,1.771C17.112,21.929,15.888,22.147,14.651,22.147z M13.649,0.949c-0.739,0.081-1.472,0.252-2.183,0.512C6.489,3.284,3.872,8.976,5.633,14.149c1.348,3.961,4.973,6.623,9.018,6.623h0.001c1.075,0,2.14-0.19,3.164-0.565c0.725-0.266,1.41-0.616,2.045-1.047c-0.065-0.02-0.13-0.04-0.193-0.062c-3.495-1.137-6.197-3.837-7.413-7.407c-1.213-3.563-0.746-7.415,1.279-10.566C13.571,1.066,13.609,1.008,13.649,0.949z\"/></svg>\n				</li>\n			</ul>\n			<ul class='right'>\n				<li>\n					<svg width=\"100%\" viewBox=\"1.25 -0.741 22.5 23.338\"><path fill=\"#00EB76\" d=\"M23.242,10.438L13.01-0.176c-0.26-0.269-0.68-0.269-0.939,0L1.839,10.438c-0.259,0.269-0.259,0.705,0,0.974L12.07,22.025c0.26,0.27,0.68,0.27,0.939,0l10.232-10.614C23.502,11.143,23.502,10.707,23.242,10.438L23.242,10.438z M14.299,10.306c-0.061,0.134-0.182,0.214-0.324,0.211c-0.143-0.003-0.26-0.088-0.314-0.224l-0.514-1.292c0,0-0.461,0.227-0.922,0.534c-1.512,0.909-1.42,2.335-1.42,2.335v4.17H8.728V11.75c0,0,0.119-2.458,2.075-3.674c0.572-0.363,0.801-0.521,1.229-0.777l-0.873-1.058c-0.096-0.108-0.119-0.255-0.062-0.391c0.055-0.135,0.176-0.216,0.32-0.216l4.938,0.014L14.299,10.306L14.299,10.306z\"/></svg>\n				</li>\n			</ul>\n		</div>\n		<div class=\"comments-wrapper\">\n";
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

  return "<div>\n	\n	<header id=\"header\">\n			<a href=\"http://www.camper.com/\" target=\"_blank\" class=\"logo\">\n				<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n			</a>\n			<div class=\"map-btn\"><a href=\"#!/landing\" class=\"text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.map_txt : stack1), depth0))
    + "</a></div>\n			<div class=\"camper-lab\"><a target=\"_blank\" href=\""
    + alias2(((helper = (helper = helpers.labUrl || (depth0 != null ? depth0.labUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"labUrl","hash":{},"data":data}) : helper)))
    + "\" class=\"text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.camper_lab : stack1), depth0))
    + "</a></div>\n			<div class=\"shop-wrapper btn\">\n				<div class=\"relative\">\n					<div class=\"shop-title text-btn\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
    + "</div>\n					<ul class=\"submenu-wrapper\">\n						<li class=\"sub-0\"><a target=\"_blank\" href='"
    + alias2(((helper = (helper = helpers.menShopUrl || (depth0 != null ? depth0.menShopUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"menShopUrl","hash":{},"data":data}) : helper)))
    + "'>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_men : stack1), depth0))
    + "</a></li>\n						<li class=\"sub-1\"><a target=\"_blank\" href='"
    + alias2(((helper = (helper = helpers.womenShopUrl || (depth0 != null ? depth0.womenShopUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"womenShopUrl","hash":{},"data":data}) : helper)))
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
    return "<div class=\"titles-wrapper\">\n	<div class=\"deia\">DEIA</div>\n	<div class=\"es-trenc\">ES TRENC</div>\n	<div class=\"arelluf\">ARELLUF</div>\n</div>\n\n<svg width=\"100%\" viewBox=\"-67 0 760 645\">\n	\n	<path id=\"map-bg\" stroke=\"#FFFFFF\" stroke-width=\"2\" fill=\"#ffffff\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n	\n	<text x=\"364\" y=\"242\">A VISION OF</text>\n	<g id='mallorca-logo' transform=\"translate(300, 258)\"><path fill=\"#1eea79\" d=\"M87.884,1.001c-0.798,0.294-17.53,13.617-37.763,40.758c-5.892,8.472-9.319,14.607-6.895,15.53c2.239,0.838,4.49,1.636,6.75,2.396c0.617,0.207,0.942,0.231,1.182-0.186c0.557-1.071,1.02-7.933,4.357-13.306c4.809-7.73,11.214-7.384,14.873-6.612c1.808,0.397,2.969,2.006,1.463,5.342c-3.764,8.489-10.8,14.884-11.856,16.875c-0.537,1.09,0.965,1.269,1.397,1.386c1.794,0.498,3.595,0.973,5.398,1.425c1.439,0.361,2.761,2.927,10.788-17.359C90.83,11.637,88.539,0.857,87.884,1.001z M75.532,29.835c-3.243-0.57-7.874,0.491-8.566,0.324c-0.451-0.1-0.426-0.641,0.066-1.467c3.137-4.913,13.042-15.486,14.604-15.42c1.115,0.073-1.018,9.869-3.069,14.477C77.604,29.807,76.834,30.073,75.532,29.835z M98.739,68.951c-0.312,1.622-1.769,1.056-2.36,0.988c-6.699-0.752-13.365-1.799-19.979-3.149c-2.642-0.382-0.879-2.917,4.602-18.571c3.99-10.203,18.572-45.671,19.141-45.754c1.483,0.044,2.968,0.088,4.451,0.132c0.196,0.005,0.487,0.175,0.101,1.605c-0.287,1.813-8.796,18.592-15.883,40.115c-3.437,10.804-1.474,13.858,1.073,14.221c4.291,0.616,8.361-5.968,9.416-5.864C100.06,52.746,98.76,68.537,98.739,68.951z M125.874,70.104c-0.026,1.637-1.564,1.252-2.161,1.254c-6.75,0.049-13.496-0.194-20.215-0.735c-2.656-0.055-1.371-2.84,1.266-19.352c2.124-10.848,10.242-48.339,10.802-48.355c1.483,0.043,2.967,0.083,4.451,0.125c0.196,0.006,0.517,0.179,0.385,1.653c0.031,1.817-5.439,19.313-8.64,41.844c-1.489,11.277,0.977,14.13,3.55,14.212c4.335,0.133,7.208-6.848,8.27-6.842C124.346,53.915,125.823,69.701,125.874,70.104z M137.079,2.277c-4.592-0.223-8.78,23.183-9.392,44.239c-0.239,14.117,3.586,26.076,13.939,25.24c1.67-0.142,3.339-0.302,5.008-0.479c10.334-1.208,11.75-13.268,8.699-26.573C150.542,24.978,141.677,2.614,137.079,2.277z M142.675,57.229c-4.864,0.391-7.912-3.161-8.294-12.669c-0.618-17.988,2.042-29.276,4.024-29.269c1.981,0.029,6.912,10.986,9.903,28.391C149.837,52.908,147.537,56.824,142.675,57.229z M172.615,33.994c-0.75-2.012,3.379-6.399-2.047-17.234c-2.852-5.767-7.591-12.702-12.671-12.868c-2.469-0.039-4.939-0.082-7.409-0.128c-0.488-0.005-2.159-1.466,6.968,36.481c6.962,28.793,8.14,27.042,9.366,26.806c1.904-0.369,3.806-0.76,5.703-1.174c0.488-0.106,1.836-0.011,1.428-1.271c-0.205-0.496-5.167-10.32-6.865-16.02c-1.248-4.196,0.768-7.719,1.958-7.919c2.188-0.287,11.339,13.509,14.779,21.428c0.463,1.138,1.886,0.513,2.759,0.264c1.828-0.515,3.652-1.054,5.471-1.615c1.014-0.311,1.14-0.511,0.769-1.253C184.54,43.788,173.257,36.133,172.615,33.994z M163.047,32.429c-1.137,0.146-2.083-2.842-2.562-4.411c-3.939-12.948-3.467-15.445-0.68-15.546c1.653-0.06,4.131,1.495,5.981,5.957C168.639,24.872,164.461,32.217,163.047,32.429z M212.462,37.072c7.293,7.791,6.122,14.986-0.657,17.809c-11.172,4.633-23.415-7.799-30.156-21.471c-7.205-14.782-11.936-30.709-5.689-30.193c2.352,0.097,7.79,2.205,13.103,7.905c2.824,3.096,3.107,5.102,1.016,5.459c-1.327,0.189-3.905-5.323-7.809-4.971c-4.348,0.26-0.58,9.946,4.146,18c7.198,12.336,15.941,15.36,19.8,13.89c7.153-2.697,0.669-10.89,1.022-10.97C207.784,32.355,211.974,36.541,212.462,37.072z M239.422,23.489C209.694,9.329,193.988,3.845,193.291,3.493c-0.836-0.53,1.381,9.166,21.855,32.466c6.462,6.777,11.587,11.17,13.958,9.976c2.19-1.09,4.366-2.215,6.528-3.372c0.591-0.317,0.807-0.509,0.479-0.782c-0.855-0.629-8.328-3.118-12.492-6.948c-6-5.509-1.29-8.367,2.162-9.847c1.713-0.721,4.361-0.8,7.072,0.875c6.914,4.179,9.533,9.94,11.117,11.135c0.875,0.604,1.992-0.285,2.39-0.526c1.656-0.997,3.304-2.014,4.942-3.052C252.611,32.604,256.22,32.191,239.422,23.489z M218.204,19.43c-3.098,1.038-5.165,3.33-5.839,3.564c-0.437,0.144-1.069-0.103-1.715-0.666c-3.793-3.602-9.015-11.559-7.475-11.638c1.106-0.069,11.122,4.567,14.875,6.842C219.716,18.608,219.447,19.002,218.204,19.43z M53.062,31.961C35.458,55.825,34.91,53.996,33.756,53.504c-1.975-0.843-3.942-1.719-5.897-2.623c-0.551-0.252-1.807-0.598-0.872-1.647c0.789-0.739,12.531-10.264,25.624-26.005c1.065-1.252,7.374-8.602,6.308-8.791c-0.914-0.141-7.368,5.298-9.016,6.54c-13.956,10.691-17.966,16.11-20.648,14.998c-3.374-1.449,2.999-6.173,11.668-17.603c0.91-1.242,5.738-6.506,4.77-6.691c-1.048-0.222-8.439,5.527-9.704,6.515C20.147,30.25,12.102,40.352,11.343,41.127c-1.062,0.881-1.949,0.118-2.477-0.193c-1.573-0.926-3.137-1.873-4.692-2.84c-1.087-0.67-3.621-0.762,19.961-16.68C55.233,0.499,55.469,1.151,55.952,1.179c0.857,0.021,1.713,0.044,2.57,0.067c1.104,0.05,1.438-0.022-1.017,3.473c-4.623,6.894-8.271,11.144-7.653,11.237C50.293,16,54.759,12.398,64.75,5.362c5.195-3.799,5.493-3.812,6.603-3.758c0.728,0.021,1.454,0.042,2.182,0.062C74.02,1.69,76.217,0.487,53.062,31.961z\"/></g>\n\n	<g id=\"footsteps\">\n		<g id=\"dub-mateo\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n		</g>\n		<g id=\"mateo-beluga\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n		</g>\n		<g id=\"beluga-isamu\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n		</g>\n		<g id=\"isamu-capas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n		</g>\n		<g id=\"capas-pelotas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n		</g>\n		<g id=\"pelotas-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n		</g>\n		<g id=\"marta-kobarah\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n		</g>\n		<g id=\"kobarah-dub\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n		</g>\n		<g id=\"dub-paradise\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n		</g>\n		<g id=\"return-to-begin\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n		</g>\n	</g>\n\n	<g id=\"map-dots\">\n		<g id=\"deia\">\n			<g transform=\"translate(210, 170)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(240, 146)\"><circle id=\"mateo\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(260, 214)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"es-trenc\">\n			<g transform=\"translate(426, 478)\"><circle id=\"isamu\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(400, 446)\"><circle id=\"beluga\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"arelluf\">\n			<g transform=\"translate(121, 364)\"><circle id=\"capas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(126, 340)\"><circle id=\"pelotas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(137, 318)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 326)\"><circle id=\"kobarah\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 300)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(80, 315)\"><circle id=\"paradise\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n	</g>\n\n</svg>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Mobile.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<div>\n	<header>\n		<a href=\"http://www.camper.com/\" target=\"_blank\" class=\"logo\">\n			<svg width=\"100%\" viewBox=\"0 0 136.013 49.375\" enable-background=\"new 0 0 136.013 49.375\" xml:space=\"preserve\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M82.141,8.002h3.354c1.213,0,1.717,0.499,1.717,1.725v7.137c0,1.231-0.501,1.736-1.705,1.736h-3.365V8.002z M82.523,24.617v8.426l-7.087-0.384V1.925H87.39c3.292,0,5.96,2.705,5.96,6.044v10.604c0,3.338-2.668,6.044-5.96,6.044H82.523z M33.491,7.913c-1.132,0-2.048,1.065-2.048,2.379v11.256h4.409V10.292c0-1.314-0.917-2.379-2.047-2.379H33.491z M32.994,0.974h1.308c4.702,0,8.514,3.866,8.514,8.634v25.224l-6.963,1.273v-7.848h-4.409l0.012,8.787l-6.974,2.018V9.608C24.481,4.839,28.292,0.974,32.994,0.974 M121.933,7.921h3.423c1.215,0,1.718,0.497,1.718,1.724v8.194c0,1.232-0.502,1.736-1.705,1.736h-3.436V7.921z M133.718,31.055v17.487l-6.906-3.368V31.591c0-4.92-4.588-5.08-4.588-5.08v16.774l-6.983-2.914V1.925h12.231c3.291,0,5.959,2.705,5.959,6.044v11.077c0,2.207-1.217,4.153-2.991,5.115C131.761,24.894,133.718,27.077,133.718,31.055 M10.809,0.833c-4.703,0-8.514,3.866-8.514,8.634v27.936c0,4.769,4.019,8.634,8.722,8.634l1.306-0.085c5.655-1.063,8.306-4.639,8.306-9.407v-8.94h-6.996v8.736c0,1.409-0.064,2.65-1.994,2.992c-1.231,0.219-2.417-0.816-2.417-2.132V10.151c0-1.314,0.917-2.381,2.047-2.381h0.315c1.13,0,2.048,1.067,2.048,2.381v8.464h6.996V9.467c0-4.768-3.812-8.634-8.514-8.634H10.809 M103.953,23.162h6.977v-6.744h-6.977V8.423l7.676-0.002V1.924H96.72v33.278c0,0,5.225,1.141,7.532,1.666c1.517,0.346,7.752,2.253,7.752,2.253v-7.015l-8.051-1.508V23.162z M46.879,1.927l0.003,32.35l7.123-0.895V18.985l5.126,10.426l5.126-10.484l0.002,13.664l7.022-0.054V1.895h-7.545L59.13,14.6L54.661,1.927H46.879z\"/></svg>\n		</a>\n	</header>\n	\n	<div class=\"main-container\">\n		<div class=\"feed\">\n			<div class=\"logo\">\n				<svg width=\"100%\" viewBox=\"0 0 162 47\"> \n					<text x=\"42\" y=\"-4\">A VISION OF</text>\n					<path fill=\"#000000\" d=\"M42.582,18.239c-0.31,0.52-0.325,0.859-0.042,0.922c0.435,0.105,3.346-0.562,5.384-0.204c0.818,0.149,1.302-0.018,1.907-1.311c1.29-2.894,2.63-9.045,1.929-9.091C50.779,8.514,44.554,15.154,42.582,18.239 M39.036,39.9c-0.271-0.075-1.215-0.187-0.878-0.872c0.665-1.249,5.086-5.266,7.452-10.598c0.947-2.094,0.217-3.104-0.919-3.354c-2.299-0.485-6.324-0.702-9.348,4.153c-2.097,3.374-2.388,7.682-2.738,8.354c-0.15,0.264-0.354,0.247-0.742,0.117c-1.421-0.478-2.836-0.979-4.244-1.504c-1.523-0.58,0.631-4.433,4.334-9.753C44.669,9.401,55.185,1.034,55.687,0.85c0.412-0.091,1.853,6.679-6.478,29.044c-5.044,12.738-5.876,11.127-6.78,10.901C41.295,40.511,40.164,40.213,39.036,39.9 M48.469,42.165c-1.66-0.24-0.552-1.833,2.892-11.664c2.508-6.407,11.673-28.681,12.03-28.733c0.933,0.028,1.865,0.056,2.797,0.083c0.123,0.003,0.307,0.109,0.063,1.008c-0.181,1.139-5.528,11.675-9.983,25.192c-2.16,6.785-0.926,8.703,0.675,8.932c2.696,0.386,5.255-3.748,5.917-3.683c0.478,0.045-0.339,9.961-0.353,10.222c-0.196,1.019-1.112,0.663-1.483,0.619C56.816,43.67,52.625,43.011,48.469,42.165 M65.5,44.571c-1.669-0.035-0.862-1.783,0.796-12.153c1.334-6.812,6.437-30.357,6.789-30.367c0.933,0.027,1.865,0.053,2.798,0.079c0.123,0.003,0.324,0.112,0.241,1.038c0.02,1.141-3.418,12.128-5.43,26.277c-0.936,7.081,0.613,8.874,2.231,8.925c2.725,0.084,4.531-4.301,5.197-4.296c0.481,0.004,1.409,9.918,1.441,10.171c-0.017,1.029-0.983,0.786-1.358,0.788C73.963,45.063,69.724,44.91,65.5,44.571 M93.663,27.652c-1.879-10.93-4.979-17.811-6.225-17.829c-1.245-0.005-2.917,7.083-2.528,18.38c0.24,5.972,2.156,8.202,5.213,7.956C93.179,35.906,94.624,33.446,93.663,27.652 M89.464,45.283c-6.507,0.524-8.912-6.985-8.761-15.852C81.087,16.21,83.72,1.51,86.605,1.65c2.891,0.212,8.462,14.256,11.473,26.645c1.918,8.355,1.028,15.929-5.467,16.688C91.562,45.093,90.514,45.193,89.464,45.283 M104.647,11.794c-1.163-2.803-2.72-3.778-3.759-3.741c-1.75,0.064-2.048,1.631,0.428,9.763c0.302,0.985,0.896,2.861,1.611,2.77C103.815,20.453,106.44,15.84,104.647,11.794 M99.69,2.665c3.191,0.104,6.17,4.459,7.963,8.081c3.41,6.804,0.814,9.56,1.286,10.823c0.404,1.343,7.495,6.15,12.702,16.011c0.233,0.468,0.155,0.593-0.483,0.789c-1.144,0.352-2.289,0.689-3.438,1.013c-0.548,0.155-1.442,0.55-1.733-0.165c-2.163-4.975-7.914-13.638-9.289-13.457c-0.748,0.126-2.015,2.339-1.23,4.973c1.067,3.58,4.185,9.749,4.314,10.061c0.256,0.792-0.591,0.731-0.898,0.797c-1.192,0.261-2.387,0.507-3.583,0.738c-0.771,0.148-1.511,1.248-5.887-16.833c-5.736-23.831-4.686-22.914-4.38-22.911C96.586,2.614,98.138,2.641,99.69,2.665 M114.617,21.202c-4.528-9.283-7.501-19.286-3.575-18.961c1.478,0.061,4.896,1.384,8.235,4.965c1.775,1.944,1.952,3.203,0.64,3.428c-0.835,0.12-2.455-3.343-4.909-3.121c-2.732,0.163-0.364,6.246,2.605,11.304c4.525,7.748,10.02,9.646,12.445,8.723c4.495-1.694,0.421-6.839,0.642-6.889c0.343-0.111,2.977,2.517,3.284,2.852c4.582,4.893,3.848,9.41-0.413,11.184C126.549,37.596,118.854,29.788,114.617,21.202 M132.845,14.243c0.405,0.354,0.803,0.507,1.078,0.418c0.424-0.147,1.722-1.586,3.669-2.238c0.782-0.269,0.95-0.516-0.097-1.192c-2.357-1.429-8.653-4.34-9.349-4.296C127.179,6.984,130.461,11.981,132.845,14.243 M155.288,23.124c-0.25,0.151-0.952,0.71-1.502,0.33c-0.995-0.75-2.642-4.368-6.987-6.993c-1.703-1.052-3.368-1.002-4.444-0.549c-2.169,0.929-5.129,2.725-1.358,6.184c2.616,2.406,7.313,3.969,7.851,4.363c0.206,0.172,0.07,0.293-0.3,0.491c-1.36,0.728-2.729,1.434-4.104,2.118c-1.49,0.75-4.711-2.009-8.771-6.264C122.802,8.17,121.409,2.081,121.935,2.414c0.438,0.221,10.309,3.665,28.992,12.558c10.559,5.465,8.29,5.724,7.467,6.236C157.364,21.859,156.329,22.498,155.288,23.124 M3.076,24.143c-0.683-0.42-2.275-0.478,12.546-10.475C35.166,0.534,35.314,0.943,35.618,0.961c0.538,0.014,1.077,0.028,1.615,0.042c0.694,0.032,0.904-0.014-0.64,2.181c-2.905,4.33-5.198,6.999-4.81,7.057c0.277,0.027,3.084-2.235,9.363-6.654c3.266-2.385,3.454-2.394,4.15-2.36c0.458,0.013,0.914,0.026,1.372,0.04c0.305,0.015,1.686-0.741-12.866,19.025C22.737,35.278,22.393,34.129,21.668,33.821c-1.242-0.531-2.478-1.08-3.708-1.647c-0.345-0.159-1.134-0.376-0.547-1.034c0.496-0.464,7.875-6.446,16.104-16.332c0.67-0.786,4.634-5.402,3.965-5.521c-0.574-0.088-4.63,3.328-5.667,4.107c-8.771,6.714-11.291,10.117-12.977,9.418c-2.121-0.91,1.884-3.877,7.333-11.054c0.571-0.78,3.606-4.086,2.998-4.201c-0.66-0.14-5.305,3.471-6.099,4.091c-9.957,7.569-15.013,13.912-15.49,14.399c-0.667,0.554-1.224,0.074-1.556-0.121C5.036,25.346,4.053,24.751,3.076,24.143\"/>\n				</svg>\n			</div>\n			<div class=\"map\">\n				<img src=\"image/mobile_map.jpg\">\n				<p>"
    + alias1(((helper = (helper = helpers.generic || (depth0 != null ? depth0.generic : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"generic","hash":{},"data":data}) : helper)))
    + "</p>\n			</div>\n		</div>\n		<div class=\"index\">\n		</div>\n		<div class=\"bottom-part\"></div>\n	</div>\n\n	<footer>\n		\n		<ul>\n			<li id='home'>\n				<div class=\"wrapper\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.home : stack1), depth0))
    + "</div>\n			</li>\n			<li id='grid'>\n				<div class=\"wrapper\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.grid : stack1), depth0))
    + "</div>\n			</li>\n			<li id='com' class='com'>\n				<div class=\"wrapper\">\n					<svg width=\"100%\" viewBox=\"0 0 35 17\">\n						<path fill=\"#FFFFFF\" d=\"M17.415,11.203c6.275,0,12.009,2.093,16.394,5.547V0.232H1v16.535C5.387,13.303,11.129,11.203,17.415,11.203\"/>\n					</svg>\n				</div>\n			</li>\n			<li id='lab'>\n				<div class=\"wrapper\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.lab : stack1), depth0))
    + "</div>\n			</li>\n			<li id='shop'>\n				<div class=\"wrapper\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.infos : depth0)) != null ? stack1.shop_title : stack1), depth0))
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

  return "<div class=\"inside-wrapper\">\n	<div class=\"text-title\">"
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</div>\n	<div class=\"rects-container\">\n		<div class=\"bg-line\"></div>\n		<div class=\"bg-box\"></div>\n		<div class=\"bg-line\"></div>\n	</div>\n	<div class=\"rects-container\">\n		<div class=\"bg-line\"></div>\n		<div class=\"bg-box\"></div>\n		<div class=\"bg-line\"></div>\n	</div>\n</div>\n<div class=\"background\"></div>";
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
    // if(retina == true) str = '@2x'
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
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/b741eeb1737a682f5646cba17e040630a1dd018a/deia-dub.mp4",
        	"fact": {
        		"en": "Breaking up on a text message. not very deia thing to do"
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL21vYmlsZS1mb290ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvRGlwdHlxdWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvSG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zZWxmaWUtc3RpY2suanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc29jaWFsLWxpbmtzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3RleHQtYnRuLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3ZpZGVvLWNhbnZhcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29uc3RhbnRzL0FwcENvbnN0YW50cy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvZGlzcGF0Y2hlcnMvQXBwRGlzcGF0Y2hlci5qcyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRGlwdHlxdWUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9GZWVkLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvSW5kZXguaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9NYXAuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Nb2JpbGUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9QYWdlc0NvbnRhaW5lci5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL1RleHRCdG4uaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QyxVQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUE7O0FBRXBDLEtBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDbEMsS0FBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNuQyxLQUFFLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUEsSUFBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQzlELEtBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTs7QUFFeEQsU0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ2hFLFNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUMvRCxTQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDckUsU0FBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FB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RTlDLE9BQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU07O0FBRXpCLFlBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDMUQsWUFBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUM1RCxZQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQzVELFlBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRTFELE1BQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ3pDLE1BQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQzNDLE1BQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ3ZDLE1BQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFBOztBQUVyQyxTQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDL0MsU0FBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2pELFNBQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElB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QUFDL0YsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hILE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFaEcsT0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM1RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN2RixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNwRyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFL0YsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMxRixPQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwQixPQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7R0FDdEU7OztTQUNzQixtQ0FBRztBQUN6QixPQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDN0MsT0FBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0dBQ3hDOzs7U0FDc0IsbUNBQUc7QUFDekIsT0FBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQTtBQUNqQyxPQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQyw4QkE5Rm1CLFFBQVEseURBOEZJO0dBQy9COzs7U0FDVSxxQkFBQyxDQUFDLEVBQUU7QUFDZCxJQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsT0FBSSxPQUFPLEdBQUcsc0JBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUMvQixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE9BQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUE7QUFDeEIsT0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQTtBQUN4QixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFJLENBQUMsQ0FBQTtBQUN6QyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFJLENBQUMsQ0FBQTtHQUN6Qzs7O1NBQ21CLDhCQUFDLENBQUMsRUFBRTtBQUN2QixJQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsT0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtBQUM3QixRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ3hCLE1BQUk7QUFDSixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDeEI7R0FDRDs7O1NBQ2dCLDJCQUFDLENBQUMsRUFBRTtBQUNwQixJQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsT0FBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUE7O0FBRTNCLE9BQUksSUFBSSxDQUFDO0FBQ1QsT0FBSSxPQUFPLEdBQUcsMEJBQWEsa0JBQWtCLENBQUE7QUFDN0MsT0FBRyxFQUFFLElBQUksTUFBTSxFQUFFLElBQUksR0FBRyxPQUFPLENBQUEsS0FDMUIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFBOztBQUVwQixXQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUMvRSxXQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxDQUFDLENBQUE7O0FBRTdGLE9BQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0dBQzNCOzs7U0FDZ0IsMkJBQUMsQ0FBQyxFQUFFO0FBQ3BCLElBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUNsQixPQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQTs7QUFFM0IsT0FBSSxJQUFJLENBQUM7QUFDVCxPQUFJLE9BQU8sR0FBRywwQkFBYSxrQkFBa0IsQ0FBQTtBQUM3QyxPQUFHLEVBQUUsSUFBSSxNQUFNLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFBLEtBQzNCLElBQUksR0FBRyxPQUFPLENBQUE7O0FBRW5CLFdBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUM5RCxXQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBOztBQUVsRixPQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtHQUMxQjs7O1NBQ3FCLGdDQUFDLENBQUMsRUFBRTtBQUN6QixJQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsT0FBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtBQUNqQixPQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFBO0FBQzVCLE9BQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUE7QUFDbEIsT0FBRyxJQUFJLElBQUksT0FBTyxJQUFJLEVBQUUsSUFBSSxjQUFjLEVBQUU7QUFDM0MsUUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUN2Qiw2QkFBVyxZQUFZLEVBQUUsQ0FBQTtLQUN6QixNQUFJO0FBQ0osNkJBQVcsV0FBVyxFQUFFLENBQUE7S0FDeEI7QUFDRCxXQUFNO0lBQ047QUFDRCxPQUFHLElBQUksSUFBSSxZQUFZLEVBQUU7QUFDeEIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdEIsV0FBTTtJQUNOO0FBQ0QsT0FBRyxJQUFJLElBQUksWUFBWSxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3JCLFdBQU07SUFDTjtBQUNELE9BQUcsSUFBSSxJQUFJLE9BQU8sSUFBSSxFQUFFLElBQUksVUFBVSxFQUFFO0FBQ3ZDLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDbEQsV0FBTTtJQUNOO0dBQ0Q7OztTQUNTLHNCQUFFO0FBQ1gsT0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNuQixPQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzNCOzs7U0FDVSx1QkFBRTtBQUNaLE9BQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDcEIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtHQUN4Qjs7O1NBQ0ssa0JBQUc7QUFDUixPQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFNO0FBQzNCLE9BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxPQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEMsT0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2pDLE9BQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDekIsT0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNyQixPQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBOztBQUV0Qiw4QkF6TG1CLFFBQVEsd0NBeUxiO0dBQ2Q7OztTQUNLLGtCQUFHO0FBQ1IsT0FBSSxPQUFPLEdBQUcsc0JBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUMvQixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUUvQixPQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUM5QixRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQzdDLFFBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN0QixRQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuQixRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUE7QUFDMUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFBO0lBQzlDOztBQUVELE9BQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDdEIsT0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN2QixPQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3ZCLE9BQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDckIsT0FBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUMzQixPQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3pCLE9BQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7O0FBRXRCLE9BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBSSxPQUFPLElBQUksQ0FBQyxBQUFDLENBQUE7O0FBRXhDLDhCQW5ObUIsUUFBUSx3Q0FtTmI7R0FDZDs7O1NBQ21CLGdDQUFHO0FBQ3RCLHlCQUFTLEdBQUcsQ0FBQywwQkFBYSxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3pELHlCQUFTLEdBQUcsQ0FBQywwQkFBYSxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzNELHdCQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDcEQsd0JBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDdEUsT0FBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQzdDLE9BQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDbkIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDdEIsT0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNwQixPQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3hCLE9BQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDMUIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNyQixPQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNsQixPQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNqQixPQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQixPQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNyQixPQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNyQixPQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixPQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUNwQiw4QkExT21CLFFBQVEsc0RBME9DO0dBQzVCOzs7UUEzT21CLFFBQVE7OztxQkFBUixRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkNaWixNQUFNOzs7O3dCQUNGLFVBQVU7Ozs7cUJBQ2IsT0FBTzs7OzsrQkFDRCxtQkFBbUI7Ozs7NEJBQ2xCLGNBQWM7Ozs7d0JBQ3RCLFdBQVc7Ozs7bUNBQ0Usd0JBQXdCOzs7O2dDQUM3QixvQkFBb0I7Ozs7dUJBQzdCLFVBQVU7Ozs7dUJBQ1YsVUFBVTs7Ozs2QkFDQSxnQkFBZ0I7Ozs7SUFFckIsSUFBSTtXQUFKLElBQUk7O0FBQ2IsVUFEUyxJQUFJLENBQ1osS0FBSyxFQUFFO3dCQURDLElBQUk7O0FBRXZCLE1BQUksT0FBTyxHQUFHLHNCQUFTLFdBQVcsRUFBRSxDQUFBO0FBQ3BDLE1BQUksV0FBVyxHQUFHLHNCQUFTLFlBQVksRUFBRSxDQUFBO0FBQ3pDLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUMxQyxPQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDcEQsT0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2xELE9BQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0RCxPQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7QUFDcEIsT0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUMzQixPQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUE7QUFDM0QsT0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtBQUM5QyxPQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQzVDLE9BQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUNyQyxPQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN0QyxPQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM1QyxPQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTs7QUFFOUMsNkJBbEJtQixJQUFJLDZDQWtCakIsS0FBSyxFQUFDO0FBQ1osTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUM5QyxNQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBOztBQUU3QixNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3BELE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUMsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUM5Qzs7Y0F6Qm1CLElBQUk7O1NBMEJQLDZCQUFHO0FBQ25CLE9BQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUN2QixPQUFJLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxDQUFBO0FBQzlCLE9BQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUE7O0FBRTVCLE9BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDN0IsT0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUVqQyxPQUFJLENBQUMsS0FBSyxHQUFHLENBQ1osQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQ1IsRUFBRSxFQUFFLEVBQUUsRUFDTixFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FDVixDQUFBOztBQUVELE9BQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBOztBQUVuQixPQUFJLENBQUMsUUFBUSxHQUFHLHNDQUFrQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDL0MsT0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekMsT0FBSSxDQUFDLElBQUksR0FBRywyQkFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzVELE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDaEIsT0FBSSxDQUFDLFdBQVcsR0FBRyxrQ0FBWSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDNUMsT0FBSSxDQUFDLFlBQVksR0FBRyxtQ0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDOUMsT0FBSSxDQUFDLEdBQUcsR0FBRywwQkFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLDBCQUFhLFdBQVcsQ0FBQyxDQUFBOztBQUV0RCx3QkFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBOztBQUVuRCw4QkFyRG1CLElBQUksbURBcURFO0dBQ3pCOzs7U0FDYywyQkFBRztBQUNqQixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUUvQixPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUUsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ25GLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUMxRSxPQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzNGLE9BQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ25HLE9BQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ2pHLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFbkcsOEJBbEVtQixJQUFJLGlEQWtFQTtHQUN2Qjs7O1NBQ3NCLG1DQUFHO0FBQ3pCLE9BQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3ZDLDhCQXRFbUIsSUFBSSx5REFzRVE7R0FDL0I7OztTQUNlLDRCQUFHOzs7QUFDbEIsYUFBVSxDQUFDO1dBQUkscUJBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFLLEdBQUcsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDO0lBQUEsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNoRSw4QkExRW1CLElBQUksa0RBMEVDO0dBQ3hCOzs7U0FDYSx3QkFBQyxJQUFJLEVBQUU7QUFDcEIsT0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9ELFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMvQyxRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVCLFFBQUcsSUFBSSxJQUFJLEtBQUssRUFBRTtBQUNqQixTQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzNFLFlBQU07S0FDTjtJQUNELENBQUM7QUFDRixPQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxQixPQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUN2Qzs7O1NBQ1UscUJBQUMsSUFBSSxFQUFFO0FBQ2pCLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMvQyxRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hDLFFBQUcsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDekIsU0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQzNCO0lBQ0QsQ0FBQztHQUNGOzs7U0FDVSxxQkFBQyxDQUFDLEVBQUU7QUFDZCxJQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsT0FBSSxPQUFPLEdBQUcsc0JBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUMvQixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE9BQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUE7QUFDeEIsT0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQTtBQUN4QixPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFJLENBQUMsQ0FBQTtBQUN6QyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxBQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFJLENBQUMsQ0FBQTtHQUN6Qzs7O1NBQ0ssa0JBQUc7QUFDUixPQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLE9BQU07Ozs7Ozs7Ozs7O0FBV3RDLE9BQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoQyw4QkF0SG1CLElBQUksd0NBc0hUO0dBQ2Q7OztTQUNLLGtCQUFHO0FBQ1IsT0FBSSxPQUFPLEdBQUcsc0JBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUMvQixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUUvQixPQUFJLEtBQUssR0FBRyxnQ0FBYyxPQUFPLEVBQUUsT0FBTyxFQUFFLDBCQUFhLFlBQVksRUFBRSwwQkFBYSxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUE7O0FBRTNHLE9BQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZCLE9BQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzNCLE9BQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDekIsT0FBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUMxQixPQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFBOztBQUVqQixPQUFJLFlBQVksR0FBRyxtQkFBTSw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLDBCQUFhLGNBQWMsRUFBRSwwQkFBYSxjQUFjLENBQUMsQ0FBQTs7QUFFakksOEJBdEltQixJQUFJLHdDQXNJVDtHQUNkOzs7U0FDbUIsZ0NBQUc7QUFDdEIsd0JBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUM3Qyx3QkFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBOztBQUVwRCxPQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3pCLE9BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDakIsT0FBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNoQixPQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFBOztBQUV4QixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUN2QixPQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN4QixPQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQTs7QUFFZiw4QkF0Sm1CLElBQUksc0RBc0pLO0dBQzVCOzs7UUF2Sm1CLElBQUk7OztxQkFBSixJQUFJOzs7Ozs7Ozs7Ozs7dUJDWlQsVUFBVTs7Ozt3QkFDTCxVQUFVOzs7O21CQUNmLEtBQUs7Ozs7NEJBQ0ksY0FBYzs7OztxQkFDckIsT0FBTzs7Ozt5QkFDSCxZQUFZOzs7OzBCQUNYLGFBQWE7Ozs7cUJBRXJCLFVBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUk7O0FBRXRDLEtBQUksS0FBSyxDQUFDO0FBQ1YsS0FBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQ25CLEtBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQUUsZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUFFLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2hHLEtBQUksRUFBRSxHQUFHLHFCQUFJLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNwRCxLQUFJLFVBQVUsR0FBRyxxQkFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzlDLEtBQUksYUFBYSxHQUFHLHFCQUFJLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNyRCxLQUFJLFlBQVksR0FBRyxxQkFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFDOUQsS0FBSSxXQUFXLEdBQUcscUJBQUksTUFBTSxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUM1RCxLQUFJLFVBQVUsR0FBRyxxQkFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFBO0FBQ3pELEtBQUksaUJBQWlCLEdBQUcscUJBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUMxRCxLQUFJLGtCQUFrQixHQUFHLHFCQUFJLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNoRSxLQUFJLFFBQVEsR0FBRyxtQkFBTSxRQUFRLENBQUE7QUFDN0IsS0FBSSxTQUFTLEdBQUcsbUJBQU0sU0FBUyxDQUFBO0FBQy9CLEtBQUksT0FBTyxDQUFDO0FBQ1osS0FBSSxTQUFTLEdBQUc7QUFDZixVQUFRLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdEIsV0FBUyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3ZCLFdBQVMsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQztBQUN2QixVQUFRLEVBQUUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdEIsVUFBUSxFQUFFLENBQUM7QUFDWCxRQUFNLEVBQUU7QUFDUCxTQUFNLEVBQUUsR0FBRztBQUNYLFNBQU0sRUFBRSxHQUFHO0FBQ1gsV0FBUSxFQUFFLEdBQUc7R0FDYjtFQUNELENBQUE7O0FBRUQsU0FBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBOzs7QUFHbkUsS0FBSSxnQkFBZ0IsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFOztBQUV6QyxNQUFHLHNCQUFTLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDOUIsYUFBVSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFVBQVUsQ0FBQTtHQUMvQyxNQUFJO0FBQ0osYUFBVSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtHQUM1QztFQUNELE1BQUk7QUFDSixtQkFBaUIsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFBO0VBQ3hDOztBQUVELEtBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUM3QyxrQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLHdCQUFXLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUUxRSxLQUFJLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUTtBQUN2QixPQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7RUFDYixDQUFBO0FBQ0QsS0FBSSxNQUFNLEdBQUcsNEJBQVU7QUFDdEIsVUFBUSxFQUFFLEtBQUs7RUFDZixDQUFDLENBQUE7QUFDRixPQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3pCLE9BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ2hDLEtBQUksUUFBUSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBOztBQUU3QyxLQUFJLFFBQVEsR0FBRyxzQkFBSSxzQkFBUyxhQUFhLEVBQUUsR0FBRyx1QkFBdUIsRUFBRSxZQUFLO0FBQzNFLHVCQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFBOztBQUVwQyxRQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFLO0FBQzFCLE9BQUcsT0FBTyxJQUFJLFNBQVMsRUFBQztBQUN2QixXQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDZDtBQUNELFVBQU8sR0FBRyxJQUFJLENBQUE7QUFDZCxRQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7R0FDZCxDQUFDLENBQUE7RUFDRixDQUFDLENBQUE7O0FBRUYsTUFBSyxHQUFHO0FBQ1AsSUFBRSxFQUFFLEVBQUU7QUFDTixVQUFRLEVBQUUsS0FBSztBQUNmLE1BQUksRUFBRSxnQkFBSztBQUNWLFlBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFDN0IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUM3QixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7QUFDL0IsU0FBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNkLGFBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQTtBQUN2QyxRQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtHQUNyQjtBQUNELE9BQUssRUFBRSxpQkFBSztBQUNYLFlBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDM0IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUM3QixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7QUFDL0IsU0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNmLGFBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQTtBQUN0QyxRQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtHQUN0QjtBQUNELFFBQU0sRUFBRSxrQkFBSzs7QUFFWixPQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDbEIsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDN0MsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxBQUFDLENBQUE7QUFDM0UsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQSxHQUFJLEVBQUUsQ0FBQTtBQUM5QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFBO0lBQzlDLE1BQUk7QUFDSixhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUM3QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUM3QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFBO0FBQzlDLGFBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUEsR0FBSSxFQUFFLENBQUE7SUFDOUM7O0FBRUQsV0FBUSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUUzQyxZQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEdBQUksR0FBRyxDQUFBOztBQUU1RSxZQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQSxHQUFJLElBQUksQ0FBQTs7QUFFbEUsWUFBUyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtHQUM5RjtBQUNELFFBQU0sRUFBRSxrQkFBSztBQUNaLE9BQUksT0FBTyxHQUFHLHNCQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDL0IsT0FBSSxPQUFPLEdBQUcsc0JBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQTs7O0FBRy9CLE9BQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTTs7QUFFbkIsZ0JBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBOztBQUVoRCxhQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ3ZDLGFBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUE7O0FBRXhDLG1CQUFnQixHQUFHLHFCQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN6QyxrQkFBZSxHQUFHLHFCQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUN2QyxpQkFBYyxHQUFHLHFCQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxZQUFTLEdBQUcsQUFBQyxPQUFPLEdBQUcsMEJBQWEsY0FBYyxHQUFJLEVBQUUsQ0FBQTtBQUN4RCxjQUFXLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxJQUFLLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTtBQUN0RixjQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ3hDLGFBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEdBQUssY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQUFBQyxHQUFHLElBQUksQ0FBQTtBQUN0RixhQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUE7O0FBRWxDLFlBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQSxJQUFLLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxBQUFDLENBQUE7QUFDbkUsWUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEFBQUMsQ0FBQTtBQUM3RCxZQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUM1QyxZQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTs7QUFFNUMsT0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFDekIsY0FBVSxDQUFDLFlBQUs7QUFBRSxPQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUE7S0FBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzlDO0dBQ0Q7QUFDRCx1QkFBcUIsRUFBRSxpQ0FBSztBQUMzQixPQUFHLENBQUMsT0FBTyxFQUFFO0FBQ1osV0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUMxRjtHQUNEO0FBQ0QsT0FBSyxFQUFFLGlCQUFLO0FBQ1gsU0FBTSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2QsU0FBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFlBQVMsR0FBRyxJQUFJLENBQUE7QUFDaEIsVUFBTyxHQUFHLElBQUksQ0FBQTtHQUNkO0VBQ0QsQ0FBQTs7QUFFRCxNQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7O0FBRWIsUUFBTyxLQUFLLENBQUE7Q0FFWjs7Ozs7Ozs7Ozs7Ozt3QkNwS29CLFVBQVU7Ozs7NEJBQ04sY0FBYzs7Ozt1QkFDdkIsVUFBVTs7OztBQUUxQixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxNQUFNLEVBQUk7O0FBRTVCLEtBQUksS0FBSyxDQUFDO0FBQ1YsS0FBSSxPQUFPLEdBQUcscUJBQUksTUFBTSxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUUzRCxNQUFLLEdBQUc7QUFDUCxRQUFNLEVBQUUsa0JBQUs7QUFDWixPQUFJLE9BQU8sR0FBRyxzQkFBUyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE9BQUksT0FBTyxHQUFHLHNCQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDL0IsT0FBSSxPQUFPLEdBQUcsMEJBQWEsY0FBYyxHQUFHLEdBQUcsQ0FBQTs7QUFFL0MsT0FBSSxXQUFXLEdBQUcscUJBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUVuQyxPQUFJLFNBQVMsR0FBRztBQUNmLFFBQUksRUFBRSxPQUFPLEdBQUcsT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDeEMsT0FBRyxFQUFFLE9BQU8sR0FBRyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUN2QyxDQUFBOztBQUVELFVBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQzFDLFVBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFBO0dBQ3hDO0FBQ0QsTUFBSSxFQUFFLGdCQUFLO0FBQ1YsYUFBVSxDQUFDO1dBQUkscUJBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO0lBQUEsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUN6RDtBQUNELE1BQUksRUFBRSxnQkFBSztBQUNWLGFBQVUsQ0FBQztXQUFJLHFCQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztJQUFBLEVBQUUsR0FBRyxDQUFDLENBQUE7R0FDckQ7RUFDRCxDQUFBOztBQUVELFFBQU8sS0FBSyxDQUFBO0NBQ1osQ0FBQTs7cUJBRWMsV0FBVzs7Ozs7Ozs7Ozs7OzJCQ3BDRSxhQUFhOzs7O3VCQUN6QixVQUFVOzs7OzRCQUNELGNBQWM7Ozs7cUJBRXhCLFVBQUMsU0FBUyxFQUFJOztBQUU1QixLQUFJLEtBQUssQ0FBQzs7QUFFVixLQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQzdDLEtBQUksUUFBUSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFBO0FBQy9CLEtBQUksUUFBUSxHQUFHLDhCQUFnQixRQUFRLENBQUMsQ0FBQTtBQUN4QyxVQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQTtBQUM5QixLQUFJLFNBQVMsR0FBRyxxQkFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0FBQ3BELEtBQUksSUFBSSxHQUFHLHFCQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM5QixLQUFJLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO0FBQy9CLEtBQUksY0FBYyxHQUFHLHFCQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDbEUsS0FBSSxXQUFXLEdBQUcscUJBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0QsS0FBSSxTQUFTLEdBQUcscUJBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4RCxLQUFJLFlBQVksR0FBRyxxQkFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRSxLQUFJLFVBQVUsR0FBRyxxQkFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUV6RCxLQUFJLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxTQUFTLEVBQUk7QUFDM0IsTUFBRyxTQUFTLElBQUksMEJBQWEsSUFBSSxFQUFFO0FBQ2xDLFlBQVMsR0FBRyxNQUFNLENBQUE7QUFDbEIsU0FBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQ3hDLE1BQUk7QUFDSixZQUFTLEdBQUcsT0FBTyxDQUFBO0FBQ25CLFVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUN6QztFQUNELENBQUE7QUFDRCxLQUFJLFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUTtBQUNuQixXQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtFQUN2QyxDQUFBOztBQUVELEtBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLENBQUMsRUFBSTtBQUN0QixHQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDbEIsTUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ25ELE1BQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUE7QUFDekIsTUFBSSxJQUFJLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7QUFDaEMsTUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0FBQzlCLE1BQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDaEIsVUFBTyxDQUFDLDBCQUFhLEtBQUssQ0FBQyxDQUFBO0dBQzNCLE1BQUk7QUFDSixVQUFPLENBQUMsMEJBQWEsSUFBSSxDQUFDLENBQUE7R0FDMUI7RUFDRCxDQUFBO0FBQ0QsS0FBSSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksQ0FBQyxFQUFJO0FBQ3RCLEdBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUNsQixVQUFRLEVBQUUsQ0FBQTtFQUNWLENBQUE7O0FBRUQsc0JBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ2pELHNCQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFakQsS0FBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLE9BQU0sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFBO0FBQzFCLE9BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxDQUFDLEVBQUUsZUFBZSxFQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDeEksT0FBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNySSxPQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBQyxDQUFDLEVBQUUsZUFBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzFJLE9BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxNQUFNLEVBQUUsZUFBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzlGLE9BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxNQUFNLEVBQUUsZUFBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3pGLE9BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDckIsT0FBTSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDL0YsT0FBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN0QixPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUVmLFFBQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFBO0FBQzNCLFFBQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxDQUFDLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDOUksUUFBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRSxlQUFlLEVBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMzSSxRQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBQyxDQUFDLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ2hKLFFBQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ25HLFFBQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFF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LE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQTtBQUMzRSxPQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQTtBQUMzRSxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFBO0FBQ25FLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7QUFDbkUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUE7QUFDdkMsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUE7R0FDcEM7OztTQUNtQix1QkFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMxQyxPQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ2pDLE9BQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDcEMsT0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDOUIsT0FBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwiLy8gQXZvaWQgY29uc29sZSBlcnJvcnMgZm9yIHRoZSBJRSBjcmFwcHkgYnJvd3NlcnNcbmlmICggISB3aW5kb3cuY29uc29sZSApIGNvbnNvbGUgPSB7IGxvZzogZnVuY3Rpb24oKXt9IH07XG5cbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHAgZnJvbSAnQXBwJ1xuaW1wb3J0IEFwcE1vYmlsZSBmcm9tICdBcHBNb2JpbGUnXG5pbXBvcnQgVHdlZW5NYXggZnJvbSAnZ3NhcCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IE1vYmlsZURldGVjdCBmcm9tICdtb2JpbGUtZGV0ZWN0J1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIG1kID0gbmV3IE1vYmlsZURldGVjdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcblxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNTYWZhcmkgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdTYWZhcmknKSAhPSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID09IC0xKVxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNGaXJlZm94ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2ZpcmVmb3gnKSAhPSAtMVxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSAobWQubW9iaWxlKCkgfHwgbWQudGFibGV0KCkpID8gdHJ1ZSA6IGZhbHNlXG5BcHBTdG9yZS5QYXJlbnQgPSBkb20uc2VsZWN0KCcjYXBwLWNvbnRhaW5lcicpXG5BcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSA9IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNicpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNycpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llOCcpXG5BcHBTdG9yZS5EZXRlY3Rvci5pc1N1cHBvcnRXZWJHTCA9IFV0aWxzLlN1cHBvcnRXZWJHTCgpXG5pZihBcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSkgQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSB0cnVlXG5cbi8vIERlYnVnXG4vLyBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxudmFyIGFwcDtcbmlmKEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlKSB7XG5cdGRvbS5jbGFzc2VzLmFkZChkb20uc2VsZWN0KCdodG1sJyksICdtb2JpbGUnKVxuXHRhcHAgPSBuZXcgQXBwTW9iaWxlKClcbn1lbHNle1xuXHRhcHAgPSBuZXcgQXBwKClcdFxufSBcblxuYXBwLmluaXQoKVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlIGZyb20gJ0FwcFRlbXBsYXRlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgUHJlbG9hZGVyIGZyb20gJ1ByZWxvYWRlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQXBwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5vbkFwcFJlYWR5ID0gdGhpcy5vbkFwcFJlYWR5LmJpbmQodGhpcylcblx0XHR0aGlzLmxvYWRNYWluQXNzZXRzID0gdGhpcy5sb2FkTWFpbkFzc2V0cy5iaW5kKHRoaXMpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHRoaXMucm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0dGhpcy5yb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IFByZWxvYWRlclxuXHRcdEFwcFN0b3JlLlByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKVxuXG5cdFx0dmFyIHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlbG9hZGVyJylcblx0XHRcblx0XHR2YXIgcGxhbmUgPSBkb20uc2VsZWN0KCcjcGxhbmUnLCBwKVxuXHRcdHZhciBwYXRoID0gTW9ycGhTVkdQbHVnaW4ucGF0aERhdGFUb0JlemllcihcIiNtb3Rpb25QYXRoXCIpXG5cdFx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0bC50byhwbGFuZSwgNSwge2Jlemllcjp7dmFsdWVzOnBhdGgsIHR5cGU6XCJjdWJpY1wiLCBhdXRvUm90YXRlOnRydWV9LCBlYXNlOkxpbmVhci5lYXNlT3V0fSwgMClcblx0XHR0bC5wYXVzZSgpXG5cdFx0dGhpcy5sb2FkZXJBbmltID0ge1xuXHRcdFx0cGF0aDogcGF0aCxcblx0XHRcdGVsOiBwLFxuXHRcdFx0cGxhbmU6IHBsYW5lLFxuXHRcdFx0dGw6IHRsXG5cdFx0fVxuXHRcdHRsLnR3ZWVuVG8oMy41KVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGUgPSBuZXcgQXBwVGVtcGxhdGUoKVxuXHRcdGFwcFRlbXBsYXRlLmlzUmVhZHkgPSB0aGlzLmxvYWRNYWluQXNzZXRzXG5cdFx0YXBwVGVtcGxhdGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0dGhpcy5yb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHR2YXIgc2l6ZSA9IGRvbS5zaXplKHRoaXMubG9hZGVyQW5pbS5lbClcblx0XHRcdHZhciBlbCA9IHRoaXMubG9hZGVyQW5pbS5lbFxuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKHNpemVbMF0pICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgKyAoc2l6ZVsxXSAqIDApICsgJ3B4J1xuXHRcdFx0dGhpcy5sb2FkZXJBbmltLmVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0fSwgMClcblx0fVxuXHRsb2FkTWFpbkFzc2V0cygpIHtcblx0XHR2YXIgaGFzaFVybCA9IGxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDIpXG5cdFx0dmFyIHBhcnRzID0gaGFzaFVybC5zdWJzdHIoMSkuc3BsaXQoJy8nKVxuXHRcdHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuXHRcdGlmKG1hbmlmZXN0Lmxlbmd0aCA8IDEpIHRoaXMub25BcHBSZWFkeSgpXG5cdFx0ZWxzZSBBcHBTdG9yZS5QcmVsb2FkZXIubG9hZChtYW5pZmVzdCwgdGhpcy5vbkFwcFJlYWR5KVxuXHR9XG5cdG9uQXBwUmVhZHkoKSB7XG5cdFx0dGhpcy5sb2FkZXJBbmltLnRsLnRpbWVTY2FsZSgyLjQpLnR3ZWVuVG8odGhpcy5sb2FkZXJBbmltLnRsLnRvdGFsRHVyYXRpb24oKSAtIDAuMSlcblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0VHdlZW5NYXgudG8odGhpcy5sb2FkZXJBbmltLmVsLCAwLjUsIHsgb3BhY2l0eTowLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHRcdFx0XHRkb20udHJlZS5yZW1vdmUodGhpcy5sb2FkZXJBbmltLmVsKVxuXHRcdFx0XHR0aGlzLmxvYWRlckFuaW0udGwuY2xlYXIoKVxuXHRcdFx0XHR0aGlzLmxvYWRlckFuaW0gPSBudWxsXG5cdFx0XHRcdEFwcEFjdGlvbnMucGFnZUhhc2hlckNoYW5nZWQoKVx0XG5cdFx0XHR9LCAyMDApXG5cdFx0fSwgMTUwMClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBcbiAgICBcdFxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBBcHBUZW1wbGF0ZU1vYmlsZSBmcm9tICdBcHBUZW1wbGF0ZU1vYmlsZSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEdFdmVudHMgZnJvbSAnR2xvYmFsRXZlbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQXBwTW9iaWxlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHRyb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZU1vYmlsZSA9IG5ldyBBcHBUZW1wbGF0ZU1vYmlsZSgpXG5cdFx0YXBwVGVtcGxhdGVNb2JpbGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlbG9hZGVyJylcblx0XHRkb20udHJlZS5yZW1vdmUoZWwpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0cm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwTW9iaWxlXG4gICAgXHRcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUFhDb250YWluZXIgZnJvbSAnUFhDb250YWluZXInXG5pbXBvcnQgVHJhbnNpdGlvbk1hcCBmcm9tICdUcmFuc2l0aW9uTWFwJ1xuXG5jbGFzcyBBcHBUZW1wbGF0ZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5hbmltYXRlID0gdGhpcy5hbmltYXRlLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0dGhpcy5mcm9udENvbnRhaW5lciA9IG5ldyBGcm9udENvbnRhaW5lcigpXG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lciA9IG5ldyBQYWdlc0NvbnRhaW5lcigpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQWENvbnRhaW5lcigpXG5cdFx0dGhpcy5weENvbnRhaW5lci5pbml0KCcjcGFnZXMtY29udGFpbmVyJylcblx0XHRBcHBBY3Rpb25zLnB4Q29udGFpbmVySXNSZWFkeSh0aGlzLnB4Q29udGFpbmVyKVxuXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwID0gbmV3IFRyYW5zaXRpb25NYXAoKVxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcC5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5pc1JlYWR5KClcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUuRnJvbnRCbG9jayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcm9udC1ibG9jaycpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdFx0dGhpcy5hbmltYXRlKClcblx0fVxuXHRhbmltYXRlKCkge1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUpXG5cdCAgICB0aGlzLnB4Q29udGFpbmVyLnVwZGF0ZSgpXG5cdCAgICB0aGlzLnBhZ2VzQ29udGFpbmVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuZnJvbnRDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnB4Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcC5yZXNpemUoKVxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVcblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBNb2JpbGVUZW1wbGF0ZSBmcm9tICdNb2JpbGVfaGJzJ1xuaW1wb3J0IEZlZWRUZW1wbGF0ZSBmcm9tICdGZWVkX2hicydcbmltcG9ydCBJbmRleFRlbXBsYXRlIGZyb20gJ0luZGV4X2hicydcbmltcG9ydCBmb290ZXIgZnJvbSAnbW9iaWxlLWZvb3RlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgc2Nyb2xsdG9wIGZyb20gJ3NpbXBsZS1zY3JvbGx0b3AnXG5cbmNsYXNzIEFwcFRlbXBsYXRlTW9iaWxlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMuc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0dGhpcy5zY29wZS5pbmZvcyA9IEFwcFN0b3JlLmdsb2JhbENvbnRlbnQoKVxuXHRcdHRoaXMuc2NvcGUubGFiVXJsID0gZ2VuZXJhSW5mb3NbJ2xhYl91cmwnXVxuXG5cdFx0dGhpcy5zY29wZS5nZW5lcmljID0gQXBwU3RvcmUuZ2V0Um91dGVQYXRoU2NvcGVCeUlkKCcvJykudGV4dHNbQXBwU3RvcmUubGFuZygpXS5nZW5lcmljXG5cblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLm9uT3BlbkZlZWQgPSB0aGlzLm9uT3BlbkZlZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25PcGVuR3JpZCA9IHRoaXMub25PcGVuR3JpZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblNjcm9sbCA9IHRoaXMub25TY3JvbGwuYmluZCh0aGlzKVxuXG5cdFx0Ly8gZmluZCB1cmxzIGZvciBlYWNoIGZlZWRcblx0XHR0aGlzLmluZGV4ID0gW11cblx0XHR0aGlzLmZlZWQgPSBBcHBTdG9yZS5nZXRGZWVkKClcblx0XHR2YXIgYmFzZVVybCA9IEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKVxuXHRcdHZhciBpLCBmZWVkLCBmb2xkZXIsIGljb24sIHBhZ2VJZCwgc2NvcGU7XG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMuZmVlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZmVlZCA9IHRoaXMuZmVlZFtpXVxuXHRcdFx0Zm9sZGVyID0gYmFzZVVybCArICdpbWFnZS9kaXB0eXF1ZS8nICsgZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uICsgJy8nXG5cdFx0XHRpY29uID0gZm9sZGVyICsgJ2ljb24uanBnJ1xuXHRcdFx0cGFnZUlkID0gZmVlZC5pZCArICcvJyArIGZlZWQucGVyc29uIFxuXHRcdFx0c2NvcGUgPSBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQocGFnZUlkKVxuXHRcdFx0ZmVlZC5pY29uID0gaWNvblxuXHRcdFx0aWYoZmVlZC5tZWRpYS50eXBlID09ICdpbWFnZScgJiYgZmVlZC5tZWRpYS5pZCA9PSAnc2hvZScpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBmb2xkZXIgKyAnbW9iaWxlLycgKyAnc2hvZS5qcGcnXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ2ltYWdlJyAmJiBmZWVkLm1lZGlhLmlkID09ICdjaGFyYWN0ZXInKSB7XG5cdFx0XHRcdGZlZWQubWVkaWEudXJsID0gZm9sZGVyICsgJ21vYmlsZS8nICsgJ2NoYXJhY3Rlci5qcGcnXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ3ZpZGVvJyAmJiBmZWVkLm1lZGlhLmlkID09ICdmdW4tZmFjdCcpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYVsnaXMtdmlkZW8nXSA9IHRydWVcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBzY29wZVsnd2lzdGlhLWZ1bi1pZCddXG5cdFx0XHRcdGZlZWQuY29tbWVudHNbMF1bJ3BlcnNvbi10ZXh0J10gPSBzY29wZS5mYWN0LmVuXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ3ZpZGVvJyAmJiBmZWVkLm1lZGlhLmlkID09ICdjaGFyYWN0ZXInKSB7XG5cdFx0XHRcdGZlZWQubWVkaWFbJ2lzLXZpZGVvJ10gPSB0cnVlXG5cdFx0XHRcdGZlZWQubWVkaWEudXJsID0gc2NvcGVbJ3dpc3RpYS1jaGFyYWN0ZXItaWQnXVxuXHRcdFx0fVxuXHRcdFx0aWYoZmVlZC5tZWRpYS50eXBlID09ICdpbWFnZScpIHtcblx0XHRcdFx0dGhpcy5pbmRleC5wdXNoKGZlZWQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLk9QRU5fRkVFRCwgdGhpcy5vbk9wZW5GZWVkKSBcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuT1BFTl9HUklELCB0aGlzLm9uT3BlbkdyaWQpIFxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlTW9iaWxlJywgcGFyZW50LCBNb2JpbGVUZW1wbGF0ZSwgdGhpcy5zY29wZSlcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLnBvc3RzID0gW11cblx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCA9IDBcblx0XHR0aGlzLnBhZ2VFbmRlZCA9IGZhbHNlXG5cdFx0dGhpcy5jdXJyZW50RmVlZEluZGV4ID0gMFxuXHRcdHRoaXMuYWxsRmVlZHMgPSBbXVxuXG5cdFx0dGhpcy5mb290ZXIgPSBmb290ZXIodGhpcy5lbGVtZW50LCB0aGlzLnNjb3BlKVxuXHRcdHRoaXMubWFpbkNvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5tYWluLWNvbnRhaW5lcicsIHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmZlZWRFbCA9IGRvbS5zZWxlY3QoJy5mZWVkJywgdGhpcy5tYWluQ29udGFpbmVyKVxuXHRcdHRoaXMuaW5kZXhFbCA9IGRvbS5zZWxlY3QoJy5pbmRleCcsIHRoaXMubWFpbkNvbnRhaW5lcilcblxuXHRcdEFwcEFjdGlvbnMub3BlbkZlZWQoKVxuXHRcdC8vIEFwcEFjdGlvbnMub3BlbkdyaWQoKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRvblNjcm9sbChlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgY3VycmVudFNjcm9sbCA9IHNjcm9sbHRvcCgpICsgd2luZG93SFxuXHRcdFx0aWYoY3VycmVudFNjcm9sbCA+IHRoaXMudG90YWxQYWdlSGVpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub25QYWdlRW5kKClcblx0XHRcdH1cblx0XHR9KVxuXG5cdH1cblx0dXBkYXRlRmVlZFRvRG9tKGZlZWQpIHtcblx0XHR2YXIgc2NvcGUgPSB7XG5cdFx0XHRmZWVkOiBmZWVkXG5cdFx0fVxuXHRcdHZhciBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHR2YXIgdCA9IEZlZWRUZW1wbGF0ZShzY29wZSlcblx0XHRoLmlubmVySFRNTCA9IHRcblx0XHRkb20udHJlZS5hZGQodGhpcy5mZWVkRWwsIGgpXG5cdH1cblx0Z2V0TGFzdEZlZWRzKCkge1xuXHRcdHZhciBjb3VudGVyID0gMFxuXHRcdHZhciBmZWVkID0gW11cblx0XHRmb3IgKHZhciBpID0gdGhpcy5jdXJyZW50RmVlZEluZGV4OyBpIDwgdGhpcy5jdXJyZW50RmVlZEluZGV4KzQ7IGkrKykge1xuXHRcdFx0dmFyIGYgPSB0aGlzLmZlZWRbaV1cblx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0ZmVlZC5wdXNoKGYpXG5cdFx0fVxuXHRcdHRoaXMuY3VycmVudEZlZWRJbmRleCArPSBjb3VudGVyXG5cdFx0cmV0dXJuIGZlZWRcblx0fVxuXHRwcmVwYXJlUG9zdHMoKSB7XG5cdFx0dGhpcy5wb3N0cyA9IFtdXG5cdFx0dmFyIHBvc3RzID0gZG9tLnNlbGVjdC5hbGwoJy5wb3N0JywgdGhpcy5mZWVkRWwpXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGVsID0gcG9zdHNbaV1cblx0XHRcdHRoaXMucG9zdHNbaV0gPSB7XG5cdFx0XHRcdGVsOiBlbCxcblx0XHRcdFx0bWVkaWFXcmFwcGVyOiBkb20uc2VsZWN0KCcubWVkaWEtd3JhcHBlcicsIGVsKSxcblx0XHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIGVsKSxcblx0XHRcdFx0Y29tbWVudHNXcmFwcGVyOiBkb20uc2VsZWN0KCcuY29tbWVudHMtd3JhcHBlcicsIGVsKSxcblx0XHRcdFx0dG9wV3JhcHBlcjogZG9tLnNlbGVjdCgnLnRvcC13cmFwcGVyJywgZWwpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMucmVzaXplKClcblx0fVxuXHRvbk9wZW5GZWVkKCkge1xuXHRcdHRoaXMucmVtb3ZlR3JpZCgpXG5cdFx0dGhpcy5pc0ZlZWQgPSB0cnVlXG5cdFx0dmFyIGN1cnJlbnRGZWVkID0gdGhpcy5nZXRMYXN0RmVlZHMoKVxuXHRcdHRoaXMudXBkYXRlRmVlZFRvRG9tKGN1cnJlbnRGZWVkKVxuXHRcdHRoaXMucHJlcGFyZVBvc3RzKClcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnc2Nyb2xsJywgdGhpcy5vblNjcm9sbClcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0b25PcGVuR3JpZCgpIHtcblx0XHR0aGlzLnJlbW92ZUZlZWQoKVxuXHRcdHRoaXMuaXNGZWVkID0gZmFsc2Vcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ3Njcm9sbCcsIHRoaXMub25TY3JvbGwpXG5cdFx0dmFyIHNjb3BlID0ge1xuXHRcdFx0aW5kZXg6IHRoaXMuaW5kZXhcblx0XHR9XG5cdFx0dmFyIHQgPSBJbmRleFRlbXBsYXRlKHNjb3BlKVxuXHRcdHRoaXMuaW5kZXhFbC5pbm5lckhUTUwgPSB0XG5cdFx0dGhpcy5pbmRleGVzID0gZG9tLnNlbGVjdC5hbGwoJy5ibG9jaycsIHRoaXMuaW5kZXhFbClcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVtb3ZlRmVlZCgpe1xuXHRcdGlmKHRoaXMucG9zdHMgPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHR0aGlzLmN1cnJlbnRGZWVkSW5kZXggPSAwXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcG9zdCA9IHRoaXMucG9zdHNbaV1cblx0XHRcdGRvbS50cmVlLnJlbW92ZShwb3N0LmVsKVxuXHRcdH1cblx0fVxuXHRyZW1vdmVHcmlkKCl7XG5cdFx0aWYodGhpcy5pbmRleGVzID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluZGV4ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwb3N0ID0gdGhpcy5pbmRleGVzW2ldXG5cdFx0XHRkb20udHJlZS5yZW1vdmUocG9zdClcblx0XHR9XHRcblx0fVxuXHRvblBhZ2VFbmQoKSB7XG5cdFx0aWYodGhpcy5wYWdlRW5kZWQpIHJldHVyblxuXHRcdGlmKHRoaXMuY3VycmVudEZlZWRJbmRleCA+PSB0aGlzLmZlZWQubGVuZ3RoKSByZXR1cm5cblx0XHR2YXIgY3VycmVudEZlZWQgPSB0aGlzLmdldExhc3RGZWVkcygpXG5cdFx0dGhpcy51cGRhdGVGZWVkVG9Eb20oY3VycmVudEZlZWQpXG5cdFx0dGhpcy5wcmVwYXJlUG9zdHMoKVxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMucGFnZUVuZGVkID0gZmFsc2Vcblx0XHR9LCA1MClcblx0XHR0aGlzLnBhZ2VFbmRlZCA9IHRydWVcblx0fVxuXHRyZXNpemUoKSB7XG5cblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0aWYodGhpcy5pc0ZlZWQpIHtcblx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ID0gMFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwb3N0ID0gdGhpcy5wb3N0c1tpXVxuXHRcdFx0XHR2YXIgdG9wU2l6ZSA9IGRvbS5zaXplKHBvc3QudG9wV3JhcHBlcilcblx0XHRcdFx0dmFyIGljb25zU2l6ZSA9IGRvbS5zaXplKHBvc3QuaWNvbnNXcmFwcGVyKVxuXHRcdFx0XHR2YXIgY29tbWVudHNTaXplID0gZG9tLnNpemUocG9zdC5jb21tZW50c1dyYXBwZXIpXG5cdFx0XHRcdHBvc3QubWVkaWFXcmFwcGVyLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdFx0cG9zdC5tZWRpYVdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gd2luZG93VyArICdweCdcblx0XHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gd2luZG93V1xuXHRcdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSBpY29uc1NpemVbMV1cblx0XHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gY29tbWVudHNTaXplWzFdXG5cdFx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ICs9IHRvcFNpemVbMV1cblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHZhciB3ID0gd2luZG93VyAvIDNcblx0XHRcdHZhciBjb3VudGVyID0gMFxuXHRcdFx0dmFyIGggPSAwXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5kZXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgaW5kZXggPSB0aGlzLmluZGV4ZXNbaV1cblx0XHRcdFx0aW5kZXguc3R5bGUud2lkdGggPSB3ICsgJ3B4J1xuXHRcdFx0XHRpbmRleC5zdHlsZS5oZWlnaHQgPSB3ICsgJ3B4J1xuXHRcdFx0XHRpbmRleC5zdHlsZS5sZWZ0ID0gdyAqIGNvdW50ZXIgKyAncHgnXG5cdFx0XHRcdGluZGV4LnN0eWxlLnRvcCA9IGggKyAncHgnXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0XHRpZihjb3VudGVyID49IDMpIHtcblx0XHRcdFx0XHRoICs9IHdcblx0XHRcdFx0XHRjb3VudGVyID0gMFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5mb290ZXIucmVzaXplKClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVNb2JpbGVcblxuIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5mdW5jdGlvbiBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpIHtcbiAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBsb2FkUGFnZUFzc2V0czogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuICAgICAgICBpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93UmVzaXplOiBmdW5jdGlvbih3aW5kb3dXLCB3aW5kb3dIKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSxcbiAgICAgICAgICAgIGl0ZW06IHsgd2luZG93Vzp3aW5kb3dXLCB3aW5kb3dIOndpbmRvd0ggfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcHhDb250YWluZXJJc1JlYWR5OiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfSVNfUkVBRFksXG4gICAgICAgICAgICBpdGVtOiBjb21wb25lbnRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4QWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweFJlbW92ZUNoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgb3BlbkZ1bkZhY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNsb3NlRnVuRmFjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgY2VsbE1vdXNlRW50ZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9FTlRFUixcbiAgICAgICAgICAgIGl0ZW06IGlkXG4gICAgICAgIH0pIFxuICAgIH0sXG4gICAgY2VsbE1vdXNlTGVhdmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9MRUFWRSxcbiAgICAgICAgICAgIGl0ZW06IGlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBvcGVuRmVlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuT1BFTl9GRUVELFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9wZW5HcmlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5PUEVOX0dSSUQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwQWN0aW9uc1xuXG5cbiAgICAgIFxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdGcm9udENvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgaGVhZGVyTGlua3MgZnJvbSAnaGVhZGVyLWxpbmtzJ1xuaW1wb3J0IHNvY2lhbExpbmtzIGZyb20gJ3NvY2lhbC1saW5rcydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuXG5jbGFzcyBGcm9udENvbnRhaW5lciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cblx0XHQvLyB0aGlzLm9uUGFnZUNoYW5nZSA9IHRoaXMub25QYWdlQ2hhbmdlLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0dmFyIHNjb3BlID0ge31cblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXHRcdHNjb3BlLmluZm9zID0gQXBwU3RvcmUuZ2xvYmFsQ29udGVudCgpXG5cdFx0c2NvcGUubGFiVXJsID0gZ2VuZXJhSW5mb3NbJ2xhYl91cmwnXVxuXHRcdHNjb3BlLm1lblNob3BVcmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLycrSlNfbGFuZysnXycrSlNfY291bnRyeSsnL21lbi9zaG9lcy9uZXctY29sbGVjdGlvbidcblx0XHRzY29wZS53b21lblNob3BVcmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLycrSlNfbGFuZysnXycrSlNfY291bnRyeSsnL3dvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXG5cdFx0c3VwZXIucmVuZGVyKCdGcm9udENvbnRhaW5lcicsIHBhcmVudCwgdGVtcGxhdGUsIHNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0Ly8gQXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMub25QYWdlQ2hhbmdlKVxuXG5cdFx0dGhpcy5oZWFkZXJMaW5rcyA9IGhlYWRlckxpbmtzKHRoaXMuZWxlbWVudClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblxuXHR9XG5cdG9uUGFnZUNoYW5nZSgpIHtcblx0fVxuXHRyZXNpemUoKSB7XG5cblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLmhlYWRlckxpbmtzLnJlc2l6ZSgpXG5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGcm9udENvbnRhaW5lclxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQWENvbnRhaW5lciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdGluaXQoZWxlbWVudElkKSB7XG5cdFx0dGhpcy5jbGVhckJhY2sgPSBmYWxzZVxuXG5cdFx0dGhpcy5hZGQgPSB0aGlzLmFkZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5yZW1vdmUgPSB0aGlzLnJlbW92ZS5iaW5kKHRoaXMpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCwgdGhpcy5hZGQpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsIHRoaXMucmVtb3ZlKVxuXG5cdFx0dmFyIHJlbmRlck9wdGlvbnMgPSB7XG5cdFx0ICAgIHJlc29sdXRpb246IDEsXG5cdFx0ICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuXHRcdCAgICBhbnRpYWxpYXM6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHQvLyB0aGlzLnJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHR0aGlzLmN1cnJlbnRDb2xvciA9IDB4ZmZmZmZmXG5cdFx0dmFyIGVsID0gZG9tLnNlbGVjdChlbGVtZW50SWQpXG5cdFx0dGhpcy5yZW5kZXJlci52aWV3LnNldEF0dHJpYnV0ZSgnaWQnLCAncHgtY29udGFpbmVyJylcblx0XHRBcHBTdG9yZS5DYW52YXMgPSB0aGlzLnJlbmRlcmVyLnZpZXdcblx0XHRkb20udHJlZS5hZGQoZWwsIHRoaXMucmVuZGVyZXIudmlldylcblx0XHR0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHQvLyB0aGlzLmJhY2tncm91bmQgPSBuZXcgUElYSS5HcmFwaGljcygpXG5cdFx0Ly8gdGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0XHQvLyB0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMuYmFja2dyb3VuZClcblxuXHRcdC8vIHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHQvLyAvLyB0aGlzLnN0YXRzLnNldE1vZGUoIDEgKTsgLy8gMDogZnBzLCAxOiBtcywgMjogbWJcblxuXHRcdC8vIC8vIGFsaWduIHRvcC1sZWZ0XG5cdFx0Ly8gdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHQvLyB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHQvLyB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDk5OTk5OVxuXG5cdFx0Ly8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cblx0fVxuXHRkcmF3QmFja2dyb3VuZChjb2xvcikge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLmJhY2tncm91bmQuY2xlYXIoKVxuXHRcdHRoaXMuYmFja2dyb3VuZC5saW5lU3R5bGUoMCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmJlZ2luRmlsbChjb2xvciwgMSk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDAsIHdpbmRvd1csIHdpbmRvd0gpO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5lbmRGaWxsKCk7XG5cdH1cblx0YWRkKGNoaWxkKSB7XG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChjaGlsZClcblx0fVxuXHRyZW1vdmUoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKGNoaWxkKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHQvLyB0aGlzLnN0YXRzLnVwZGF0ZSgpXG5cdCAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnN0YWdlKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgc2NhbGUgPSAxXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3dXICogc2NhbGUsIHdpbmRvd0ggKiBzY2FsZSlcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZVBhZ2UgZnJvbSAnQmFzZVBhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUHhIZWxwZXIgZnJvbSAnUHhIZWxwZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWdlIGV4dGVuZHMgQmFzZVBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKVxuXHRcdHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkID0gZmFsc2Vcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzZXRUaW1lb3V0KCgpPT57IEFwcEFjdGlvbnMucHhBZGRDaGlsZCh0aGlzLnB4Q29udGFpbmVyKSB9LCAwKVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gNFxuXHRcdHN1cGVyLndpbGxUcmFuc2l0aW9uSW4oKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uT3V0KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDRcblx0XHR9LCA1MDApXG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdGlmKHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FKSB7XG5cdFx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRydWVcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gMFxuXHRcdH1lbHNle1xuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdFx0fVxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRnZXRJbWFnZVVybEJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTCh1cmwpXG5cdH1cblx0Z2V0SW1hZ2VTaXplQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlU2l6ZSh1cmwpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFB4SGVscGVyLnJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcih0aGlzLnB4Q29udGFpbmVyKVxuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weFJlbW92ZUNoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge1BhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHN9IGZyb20gJ1BhZ2VyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEJhc2VQYWdlciBmcm9tICdCYXNlUGFnZXInXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBIb21lIGZyb20gJ0hvbWUnXG5pbXBvcnQgSG9tZVRlbXBsYXRlIGZyb20gJ0hvbWVfaGJzJ1xuaW1wb3J0IERpcHR5cXVlIGZyb20gJ0RpcHR5cXVlJ1xuaW1wb3J0IERpcHR5cXVlVGVtcGxhdGUgZnJvbSAnRGlwdHlxdWVfaGJzJ1xuXG5jbGFzcyBQYWdlc0NvbnRhaW5lciBleHRlbmRzIEJhc2VQYWdlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLmRpZEhhc2hlckNoYW5nZSA9IHRoaXMuZGlkSGFzaGVyQ2hhbmdlLmJpbmQodGhpcylcblx0XHR0aGlzLnBhZ2VBc3NldHNMb2FkZWQgPSB0aGlzLnBhZ2VBc3NldHNMb2FkZWQuYmluZCh0aGlzKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLmRpZEhhc2hlckNoYW5nZSlcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELCB0aGlzLnBhZ2VBc3NldHNMb2FkZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZSgpIHtcblxuXHRcdEFwcFN0b3JlLlBhcmVudC5zdHlsZS5jdXJzb3IgPSAnd2FpdCdcblx0XHRBcHBTdG9yZS5Gcm9udEJsb2NrLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG5cdFx0XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMudGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaClcblx0XHR9ZWxzZXtcblx0XHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25PdXQoKVxuXHRcdFx0Ly8gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQoKVxuXHRcdH1cblx0fVxuXHR0ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKSB7XG5cdFx0dmFyIHR5cGUgPSB1bmRlZmluZWRcblx0XHR2YXIgdGVtcGxhdGUgPSB1bmRlZmluZWRcblx0XHRzd2l0Y2gobmV3SGFzaC50eXBlKSB7XG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5ESVBUWVFVRTpcblx0XHRcdFx0dHlwZSA9IERpcHR5cXVlXG5cdFx0XHRcdHRlbXBsYXRlID0gRGlwdHlxdWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuSE9NRTpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0fVxuXHRcdHRoaXMuc2V0dXBOZXdDb21wb25lbnQobmV3SGFzaCwgdHlwZSwgdGVtcGxhdGUpXG5cdFx0dGhpcy5jdXJyZW50Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0fVxuXHRwYWdlQXNzZXRzTG9hZGVkKCkge1xuXHRcdHZhciBuZXdIYXNoID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdHRoaXMudGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaClcblx0XHRzdXBlci5wYWdlQXNzZXRzTG9hZGVkKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhZ2VzQ29udGFpbmVyXG5cblxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ1RyYW5zaXRpb25NYXBfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgbWFwIGZyb20gJ21haW4tbWFwJ1xuaW1wb3J0IHtQYWdlclN0b3JlLCBQYWdlckNvbnN0YW50c30gZnJvbSAnUGFnZXInXG5cbmNsYXNzIFRyYW5zaXRpb25NYXAgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMub25QYWdlVHJhbnNpdGlvbk91dCA9IHRoaXMub25QYWdlVHJhbnNpdGlvbk91dC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MgPSB0aGlzLnByZWxvYWRlclByb2dyZXNzLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0dmFyIHNjb3BlID0ge31cblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXG5cdFx0c3VwZXIucmVuZGVyKCdUcmFuc2l0aW9uTWFwJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMub25QYWdlVHJhbnNpdGlvbk91dClcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSlcblx0XHRBcHBTdG9yZS5QcmVsb2FkZXIucXVldWUub24oXCJwcm9ncmVzc1wiLCB0aGlzLnByZWxvYWRlclByb2dyZXNzLCB0aGlzKVxuXG5cdFx0dGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuVFJBTlNJVElPTilcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLmhpZ2hsaWdodChSb3V0ZXIuZ2V0T2xkSGFzaCgpLCBSb3V0ZXIuZ2V0TmV3SGFzaCgpKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHZhciBvbGRIYXNoID0gUm91dGVyLmdldE9sZEhhc2goKVxuXHRcdGlmKG9sZEhhc2ggPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblx0XHR0aGlzLm1hcC5yZXNldEhpZ2hsaWdodCgpXG5cdH1cblx0cHJlbG9hZGVyUHJvZ3Jlc3MoZSkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzICs9IDAuMlxuXHRcdGlmKGUucHJvZ3Jlc3MgPiAwLjk5KSB0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDFcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuY3VycmVudFByb2dyZXNzID4gMSA/IDEgOiB0aGlzLmN1cnJlbnRQcm9ncmVzcyBcblx0XHR0aGlzLm1hcC51cGRhdGVQcm9ncmVzcyhlLnByb2dyZXNzKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLm1hcC5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zaXRpb25NYXBcblxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBhcm91bmRCb3JkZXIgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyICRjb250YWluZXIgPSBkb20uc2VsZWN0KCcuYXJvdW5kLWJvcmRlci1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciB0b3AgPSBkb20uc2VsZWN0KCcudG9wJywgJGNvbnRhaW5lcilcblx0dmFyIGJvdHRvbSA9IGRvbS5zZWxlY3QoJy5ib3R0b20nLCAkY29udGFpbmVyKVxuXHR2YXIgbGVmdCA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGNvbnRhaW5lcilcblx0dmFyIHJpZ2h0ID0gZG9tLnNlbGVjdCgnLnJpZ2h0JywgJGNvbnRhaW5lcilcblxuXHR2YXIgJGxldHRlcnNDb250YWluZXIgPSBkb20uc2VsZWN0KCcuYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcExldHRlcnMgPSBkb20uc2VsZWN0KCcudG9wJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBib3R0b21MZXR0ZXJzID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgbGVmdExldHRlcnMgPSBkb20uc2VsZWN0KCcubGVmdCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgcmlnaHRMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLnJpZ2h0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6ICRjb250YWluZXIsXG5cdFx0bGV0dGVyczogJGxldHRlcnNDb250YWluZXIsXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciBib3JkZXJTaXplID0gMTBcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUyBdXG5cblx0XHRcdHRvcC5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBib3JkZXJTaXplICsgJ3B4J1xuXHRcdFx0bGVmdC5zdHlsZS5oZWlnaHQgPSByaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0cmlnaHQuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBib3JkZXJTaXplICsgJ3B4J1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHRsID0gdG9wTGV0dGVyc1tpXVxuXHRcdFx0XHR0bC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHRsLnN0eWxlLnRvcCA9IC0yICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYm90dG9tTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmwgPSBib3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdGJsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0Ymwuc3R5bGUudG9wID0gd2luZG93SCAtIDEyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVmdExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGxsID0gbGVmdExldHRlcnNbaV1cblx0XHRcdFx0bGwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSArIChibG9ja1NpemVbMV0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGxsLnN0eWxlLmxlZnQgPSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmlnaHRMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBybCA9IHJpZ2h0TGV0dGVyc1tpXVxuXHRcdFx0XHRybC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0cmwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSA4ICsgJ3B4J1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHRvcExldHRlcnMgPSBudWxsXG5cdFx0XHRib3R0b21MZXR0ZXJzID0gbnVsbFxuXHRcdFx0bGVmdExldHRlcnMgPSBudWxsXG5cdFx0XHRyaWdodExldHRlcnMgPSBudWxsXG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBhcm91bmRCb3JkZXIiLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChwYXJlbnQsIG9uTW91c2VFbnRlciwgb25Nb3VzZUxlYXZlKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgYXJyb3dzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5hcnJvd3Mtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGxlZnRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5sZWZ0JywgYXJyb3dzV3JhcHBlcilcblx0dmFyIHJpZ2h0QXJyb3cgPSBkb20uc2VsZWN0KCcuYXJyb3cucmlnaHQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgYXJyb3dzID0ge1xuXHRcdGxlZnQ6IHtcblx0XHRcdGVsOiBsZWZ0QXJyb3csXG5cdFx0XHRpY29uOiBkb20uc2VsZWN0KCdzdmcnLCBsZWZ0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIGxlZnRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGxlZnRBcnJvdylcblx0XHR9LFxuXHRcdHJpZ2h0OiB7XG5cdFx0XHRlbDogcmlnaHRBcnJvdyxcblx0XHRcdGljb246IGRvbS5zZWxlY3QoJ3N2ZycsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCByaWdodEFycm93KVxuXHRcdH1cblx0fVxuXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRsZWZ0OiBhcnJvd3MubGVmdC5lbCxcblx0XHRyaWdodDogYXJyb3dzLnJpZ2h0LmVsLFxuXHRcdGJhY2tncm91bmQ6IChkaXIpPT4ge1xuXHRcdFx0cmV0dXJuIGFycm93c1tkaXJdLmJhY2tncm91bmRcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIGFycm93U2l6ZSA9IGRvbS5zaXplKGFycm93cy5sZWZ0Lmljb24pXG5cdFx0XHR2YXIgb2Zmc2V0WSA9IDIwXG5cdFx0XHR2YXIgYmdXaWR0aCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblxuXHRcdFx0YXJyb3dzLnJpZ2h0LmVsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYmdXaWR0aCArICdweCdcblxuXHRcdFx0YXJyb3dzLmxlZnQuYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9IGJnV2lkdGggKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5pY29uc1dyYXBwZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYXJyb3dTaXplWzBdID4+IDEpIC0gb2Zmc2V0WSArICdweCdcblx0XHRcdGFycm93cy5sZWZ0Lmljb25zV3JhcHBlci5zdHlsZS5sZWZ0ID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICsgJ3B4J1xuXG5cdFx0XHRhcnJvd3MucmlnaHQuYmFja2dyb3VuZC5zdHlsZS53aWR0aCA9IGJnV2lkdGggKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0Lmljb25zV3JhcHBlci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChhcnJvd1NpemVbMF0gPj4gMSkgLSBvZmZzZXRZICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0Lmljb25zV3JhcHBlci5zdHlsZS5sZWZ0ID0gYmdXaWR0aCAtIGFycm93U2l6ZVswXSAtIEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCArICdweCdcblx0XHRcdFx0XG5cdFx0fSxcblx0XHRvdmVyOiAoZGlyKT0+IHtcblx0XHRcdHZhciBhcnJvdyA9IGFycm93c1tkaXJdXG5cdFx0XHRkb20uY2xhc3Nlcy5hZGQoYXJyb3cuZWwsICdob3ZlcmVkJylcblx0XHR9LFxuXHRcdG91dDogKGRpcik9PiB7XG5cdFx0XHR2YXIgYXJyb3cgPSBhcnJvd3NbZGlyXVxuXHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGFycm93LmVsLCAnaG92ZXJlZCcpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5sZWZ0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLmxlZnQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0YXJyb3dzID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBib3R0b21UZXh0cyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmJvdHRvbS10ZXh0cy1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciBzb2NpYWxXcmFwcGVyID0gZG9tLnNlbGVjdCgnI3NvY2lhbC13cmFwcGVyJywgZWwpXG5cdHZhciB0aXRsZXNXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnRpdGxlcy13cmFwcGVyJywgZWwpXG5cdHZhciBhbGxUaXRsZXMgPSBkb20uc2VsZWN0LmFsbCgnbGknLCB0aXRsZXNXcmFwcGVyKVxuXHR2YXIgdGV4dHNFbHMgPSBkb20uc2VsZWN0LmFsbCgnLnRleHRzLXdyYXBwZXIgLnR4dCcsIGVsKVxuXHR2YXIgdGV4dHMgPSBbXVxuXHR2YXIgaWRzID0gWydnZW5lcmljJywgJ2RlaWEnLCAnYXJlbGx1ZicsICdlcy10cmVuYyddXG5cdHZhciBvbGRUbCwgY3VycmVudE9wZW5JZDtcblx0dmFyIGZpcnN0VGltZSA9IHRydWVcblxuXHR2YXIgb25UaXRsZUNsaWNrZWQgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cdFx0c2NvcGUub3BlblR4dEJ5SWQoaWQpXG5cdH1cblxuXHR2YXIgaSwgdDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxUaXRsZXMubGVuZ3RoOyBpKyspIHtcblx0XHR0ID0gYWxsVGl0bGVzW2ldXG5cdFx0ZG9tLmV2ZW50Lm9uKHQsICdjbGljaycsIG9uVGl0bGVDbGlja2VkKVxuXHR9XG5cblx0dmFyIGlkLCBlLCBpLCBzcGxpdDtcblx0Zm9yIChpID0gMDsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuXHRcdGlkID0gaWRzW2ldXG5cdFx0ZSA9IHRleHRzRWxzW2ldXG5cdFx0XG5cdFx0dGV4dHNbaV0gPSB7XG5cdFx0XHRpZDogaWQsXG5cdFx0XHRlbDogZVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTIF1cblxuXHRcdHZhciBwYWRkaW5nID0gNDBcblx0XHR2YXIgYm9yZGVyQXJvdW5kXG5cdFx0YmxvY2tTaXplWzBdICo9IDIgXG5cdFx0YmxvY2tTaXplWzFdICo9IDIgXG5cdFx0YmxvY2tTaXplWzBdIC09IHBhZGRpbmdcblx0XHRibG9ja1NpemVbMV0gLT0gcGFkZGluZ1xuXHRcdHZhciBpbm5lckJsb2NrU2l6ZSA9IFtibG9ja1NpemVbMF0gLSAxMCwgYmxvY2tTaXplWzFdIC0gMTBdXG5cdFx0dmFyIHRleHRXID0gaW5uZXJCbG9ja1NpemVbMF0gKiAwLjhcblxuXHRcdGVsLnN0eWxlLndpZHRoID0gaW5uZXJCbG9ja1NpemVbMF0gKyAncHgnXG5cdFx0ZWwuc3R5bGUuaGVpZ2h0ID0gaW5uZXJCbG9ja1NpemVbMV0gKyAncHgnXG5cdFx0ZWwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBibG9ja1NpemVbMF0gLSAocGFkZGluZyA+PiAxKSArICdweCdcblx0XHRlbC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdIC0gKHBhZGRpbmcgPj4gMSkgKyAncHgnXG5cblx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0dmFyIHNvY2lhbFNpemUgPSBkb20uc2l6ZShzb2NpYWxXcmFwcGVyKVxuXHRcdFx0dmFyIHRpdGxlc1NpemUgPSBkb20uc2l6ZSh0aXRsZXNXcmFwcGVyKVxuXG5cdFx0XHR2YXIgaSwgdGV4dCwgcywgc3BsaXQsIHRsO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0c1tpXVxuXHRcdFx0XHRzID0gZG9tLnNpemUodGV4dC5lbClcblx0XHRcdFx0dGV4dC5lbC5zdHlsZS50b3AgPSAoaW5uZXJCbG9ja1NpemVbMV0gPj4gMSkgLSAoc1sxXSA+PiAxKSArICdweCdcblx0XHRcdFx0c3BsaXQgPSBuZXcgU3BsaXRUZXh0KHRleHQuZWwsIHt0eXBlOlwibGluZXNcIn0pLmxpbmVzXG5cdFx0XHRcdGlmKHRleHQudGwgIT0gdW5kZWZpbmVkKSB0ZXh0LnRsLmNsZWFyKClcblx0XHRcdFx0dGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdFx0XHR0bC5zdGFnZ2VyRnJvbShzcGxpdCwgMSwgeyB5OjUsIHNjYWxlWToyLCBvcGFjaXR5OjAsIGZvcmNlM0Q6dHJ1ZSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnLCBlYXNlOkV4cG8uZWFzZU91dCB9LCAwLjA1LCAwKVxuXHRcdFx0XHR0bC5wYXVzZSgwKVxuXHRcdFx0XHR0ZXh0LnRsID0gdGxcblx0XHRcdH1cblxuXHRcdFx0c29jaWFsV3JhcHBlci5zdHlsZS5sZWZ0ID0gKGlubmVyQmxvY2tTaXplWzBdID4+IDEpIC0gKHNvY2lhbFNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRzb2NpYWxXcmFwcGVyLnN0eWxlLnRvcCA9IGlubmVyQmxvY2tTaXplWzFdIC0gc29jaWFsU2l6ZVsxXSAtIChwYWRkaW5nID4+IDEpICsgJ3B4J1xuXG5cdFx0XHRpZihjdXJyZW50T3BlbklkICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzY29wZS5vcGVuVHh0QnlJZChjdXJyZW50T3BlbklkLCB0cnVlKVxuXHRcdFx0fVxuXG5cdFx0fSwgMClcblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGVsLFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdG9wZW5UeHRCeUlkOiAoaWQsIGZvcmNlKT0+IHtcblx0XHRcdGN1cnJlbnRPcGVuSWQgPSBpZFxuXHRcdFx0dmFyIGYgPSBmb3JjZSB8fCBmYWxzZVxuXHRcdFx0dmFyIGksIHRleHQ7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGV4dCA9IHRleHRzW2ldXG5cdFx0XHRcdGlmKGlkID09IHRleHQuaWQpIHtcblx0XHRcdFx0XHRpZihvbGRUbCAhPSB1bmRlZmluZWQpIG9sZFRsLnRpbWVTY2FsZSgyLjYpLnJldmVyc2UoKVxuXG5cdFx0XHRcdFx0aWYoZikge1xuXHRcdFx0XHRcdFx0dGV4dC50bC5wYXVzZSh0ZXh0LnRsLnRvdGFsRHVyYXRpb24oKSlcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9PnRleHQudGwudGltZVNjYWxlKDEuMikucGxheSgpLCA2MDApXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b2xkVGwgPSB0ZXh0LnRsXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHZhciBpLCB0O1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFRpdGxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0ID0gYWxsVGl0bGVzW2ldXG5cdFx0XHRcdGRvbS5ldmVudC5vZmYodCwgJ2NsaWNrJywgb25UaXRsZUNsaWNrZWQpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dCA9IHRleHRzW2ldXG5cdFx0XHRcdHQudGwuY2xlYXIoKVxuXHRcdFx0fVxuXHRcdFx0aWRzID0gbnVsbFxuXHRcdFx0dGV4dHMgPSBudWxsXG5cdFx0XHRhbGxUaXRsZXMgPSBudWxsXG5cdFx0XHR0ZXh0c0VscyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm90dG9tVGV4dHMiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgY2hhcmFjdGVyVXJsLCB0ZXh0dXJlU2l6ZSk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciB0ZXggPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGNoYXJhY3RlclVybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXgpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIHRhcmdldElkID0gUm91dGVyLmdldE5ld0hhc2goKS50YXJnZXRcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggKyAoMTAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5ICsgKDEwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDNcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wM1xuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHR2YXIgc2NhbGU7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZih0YXJnZXRJZCA9PSAncGFyYWRpc2UnKSBzY2FsZSA9ICgoKHdpbmRvd1cgPj4gMSkrMTAwKSAvIHRleHR1cmVTaXplLndpZHRoKSAqIDFcblx0XHRcdFx0ZWxzZSBzY2FsZSA9ICgod2luZG93SCAtIDEwMCkgLyB0ZXh0dXJlU2l6ZS5oZWlnaHQpICogMVxuXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKHNwcml0ZSlcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRzcHJpdGUgPSBudWxsXG5cdFx0XHR0ZXggPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgY29sb3JzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgYmdDb2xvcnMgPSBbXVxuXHRiZ0NvbG9ycy5sZW5ndGggPSA1XG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBiZ0NvbG9yID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdGJnQ29sb3JzW2ldID0gYmdDb2xvclxuXHRcdGhvbGRlci5hZGRDaGlsZChiZ0NvbG9yKVxuXHR9O1xuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDEuNSlcblx0XHR0bC5wbGF5KDApXG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgyKVxuXHRcdHRsLnJldmVyc2UoKVxuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHR0bDogdGwsXG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICh3aWR0aCwgaGVpZ2h0LCBkaXJlY3Rpb24pPT57XG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGhzID0gY29sb3JzLmZyb20uaCAtIGNvbG9ycy50by5oXG5cdFx0XHR2YXIgc3MgPSBjb2xvcnMuZnJvbS5zIC0gY29sb3JzLnRvLnNcblx0XHRcdHZhciB2cyA9IGNvbG9ycy5mcm9tLnYgLSBjb2xvcnMudG8udlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBIID0gaHMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwUyA9IHNzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFYgPSB2cyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIGhkID0gKGhzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciBzZCA9IChzcyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgdmQgPSAodnMgPCAwKSA/IC0xIDogMVxuXG5cdFx0XHR2YXIgZGVsYXkgPSAwLjEyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0dmFyIGggPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLmggKyAoc3RlcEgqaSpoZCkpXG5cdFx0XHRcdHZhciBzID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5zICsgKHN0ZXBTKmkqc2QpKVxuXHRcdFx0XHR2YXIgdiA9IE1hdGgucm91bmQoY29sb3JzLmZyb20udiArIChzdGVwVippKnZkKSlcblx0XHRcdFx0dmFyIGMgPSAnMHgnICsgY29sb3JVdGlscy5oc3ZUb0hleChoLCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5UT1A6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6aGVpZ2h0IH0sIHsgeTotaGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkJPVFRPTTpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotaGVpZ2h0IH0sIHsgeTpoZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuTEVGVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDp3aWR0aCB9LCB7IHg6LXdpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlJJR0hUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4Oi13aWR0aCB9LCB7IHg6d2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9O1xuXG5cdFx0XHR0bC5wYXVzZSgwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGwuY2xlYXIoKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoYmdDb2xvcilcblx0XHRcdFx0YmdDb2xvciA9IG51bGxcblx0XHRcdH07XG5cdFx0XHRiZ0NvbG9ycyA9IG51bGxcblx0XHRcdHRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBiZ1VybCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHR2YXIgYmdUZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShiZ1VybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZShiZ1RleHR1cmUpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHNwcml0ZS5tYXNrID0gbWFza1xuXG5cdHNjb3BlID0ge1xuXHRcdGhvbGRlcjogaG9sZGVyLFxuXHRcdGJnU3ByaXRlOiBzcHJpdGUsXG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4IC0gKDMwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSAtICgyMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAwOFxuXHRcdFx0c3ByaXRlLnkgKz0gKG5ld3kgLSBzcHJpdGUueSkgKiAwLjAwOFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgc2l6ZSA9IFsod2luZG93VyA+PiAxKSArIDEsIHdpbmRvd0hdXG5cblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0bWFzay5iZWdpbkZpbGwoMHhmZjAwMDAsIDEpO1xuXHRcdFx0bWFzay5kcmF3UmVjdCgwLCAwLCBzaXplWzBdLCBzaXplWzFdKTtcblx0XHRcdG1hc2suZW5kRmlsbCgpO1xuXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoc2l6ZVswXSwgc2l6ZVsxXSwgOTYwLCAxMDI0KVxuXG5cdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdID4+IDFcblx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSByZXNpemVWYXJzLnNjYWxlICsgMC4xXG5cdFx0XHRzcHJpdGUuaXggPSBzcHJpdGUueFxuXHRcdFx0c3ByaXRlLml5ID0gc3ByaXRlLnlcblxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKG1hc2spXG5cdFx0XHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0XHRtYXNrID0gbnVsbFxuXHRcdFx0c3ByaXRlID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBjb2xvcnlSZWN0cyBmcm9tICdjb2xvcnktcmVjdHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAocHhDb250YWluZXIsIHBhcmVudCwgbW91c2UsIGRhdGEsIHByb3BzKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBvbkNsb3NlVGltZW91dDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmZ1bi1mYWN0LXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciB2aWRlb1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudmlkZW8td3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZVdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS13cmFwcGVyJywgZWwpXG5cdHZhciBtZXNzYWdlSW5uZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS1pbm5lcicsIG1lc3NhZ2VXcmFwcGVyKVxuXHR2YXIgcHIgPSBwcm9wcztcblxuXHR2YXIgc3BsaXR0ZXIgPSBuZXcgU3BsaXRUZXh0KG1lc3NhZ2VJbm5lciwge3R5cGU6XCJ3b3Jkc1wifSlcblxuXHR2YXIgYyA9IGRvbS5zZWxlY3QoJy5jdXJzb3ItY3Jvc3MnLCBlbClcblx0dmFyIGNyb3NzID0ge1xuXHRcdHg6IDAsXG5cdFx0eTogMCxcblx0XHRlbDogYyxcblx0XHRzaXplOiBkb20uc2l6ZShjKVxuXHR9XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgbGVmdFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cdHZhciByaWdodFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cblx0dmFyIG1CZ0NvbG9yID0gZGF0YVsnYW1iaWVudC1jb2xvciddLnRvXG5cdG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgobUJnQ29sb3IuaCwgbUJnQ29sb3IucywgbUJnQ29sb3IudilcblxuXHR2YXIgbGVmdFRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0dmFyIHJpZ2h0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZSxcblx0XHRsb29wOiB0cnVlXG5cdH0pXG5cdHZhciB2aWRlb1NyYyA9IGRhdGFbJ2Z1bi1mYWN0LXZpZGVvLXVybCddXG5cdG1WaWRlby5hZGRUbyh2aWRlb1dyYXBwZXIpXG5cdG1WaWRlby5sb2FkKHZpZGVvU3JjLCAoKT0+IHtcblx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0dmFyIG9uQ2xvc2VGdW5GYWN0ID0gKCk9PiB7XG5cdFx0aWYoIXNjb3BlLmlzT3BlbikgcmV0dXJuXG5cdFx0QXBwQWN0aW9ucy5jbG9zZUZ1bkZhY3QoKVxuXHR9XG5cblx0dmFyIG9wZW4gPSAoKT0+IHtcblx0XHRlbC5zdHlsZVsnei1pbmRleCddID0gMjlcblx0XHRzY29wZS5pc09wZW4gPSB0cnVlXG5cdFx0c2NvcGUubGVmdFJlY3RzLm9wZW4oKVxuXHRcdHNjb3BlLnJpZ2h0UmVjdHMub3BlbigpXG5cdFx0dmFyIGRlbGF5ID0gMzUwXG5cdFx0c2V0VGltZW91dCgoKT0+bGVmdFRsLnRpbWVTY2FsZSgxLjUpLnBsYXkoMCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9PnJpZ2h0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+bVZpZGVvLnBsYXkoKSwgZGVsYXkrMjAwKVxuXHRcdGNsZWFyVGltZW91dChvbkNsb3NlVGltZW91dClcblx0XHRvbkNsb3NlVGltZW91dCA9IHNldFRpbWVvdXQoKCk9PmRvbS5ldmVudC5vbihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KSwgZGVsYXkrMjAwKVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnbm9uZSdcblx0XHRkb20uY2xhc3Nlcy5hZGQoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdGVsLnN0eWxlWyd6LWluZGV4J10gPSAyN1xuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdFx0c2NvcGUubGVmdFJlY3RzLmNsb3NlKClcblx0XHRzY29wZS5yaWdodFJlY3RzLmNsb3NlKClcblx0XHR2YXIgZGVsYXkgPSA1MFxuXHRcdHNldFRpbWVvdXQoKCk9PmxlZnRUbC50aW1lU2NhbGUoMikucmV2ZXJzZSgpLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5yaWdodFRsLnRpbWVTY2FsZSgyKS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHBhcmVudC5zdHlsZS5jdXJzb3IgPSAnYXV0bydcblx0XHRkb20uZXZlbnQub2ZmKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpXG5cdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0b3Blbjogb3Blbixcblx0XHRjbG9zZTogY2xvc2UsXG5cdFx0bGVmdFJlY3RzOiBsZWZ0UmVjdHMsXG5cdFx0cmlnaHRSZWN0czogcmlnaHRSZWN0cyxcblx0XHRyZXNpemU6ICgpPT57XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgbWlkV2luZG93VyA9ICh3aW5kb3dXID4+IDEpXG5cblx0XHRcdHZhciBzaXplID0gW21pZFdpbmRvd1cgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRzY29wZS5sZWZ0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5UT1ApXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzLnJlc2l6ZShzaXplWzBdLCBzaXplWzFdLCBBcHBDb25zdGFudHMuQk9UVE9NKVxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cy5ob2xkZXIueCA9IHdpbmRvd1cgLyAyXG5cdFx0XHRcdFxuXHRcdFx0Ly8gaWYgdmlkZW8gaXNuJ3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHZhciB2aWRlb1dyYXBwZXJSZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShtaWRXaW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cgPj4gMSwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUud2lkdGggPSBtZXNzYWdlV3JhcHBlci5zdHlsZS53aWR0aCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5sZWZ0ID0gbWlkV2luZG93VyArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS53aWR0aCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUuaGVpZ2h0ID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUudG9wID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy50b3AgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUubGVmdCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMubGVmdCArICdweCdcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIG1lc3NhZ2VJbm5lclNpemUgPSBkb20uc2l6ZShtZXNzYWdlSW5uZXIpXG5cdFx0XHRcdG1lc3NhZ2VJbm5lci5zdHlsZS5sZWZ0ID0gKG1pZFdpbmRvd1cgPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0bWVzc2FnZUlubmVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHR9LCAwKVxuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0XHRyaWdodFRsLmNsZWFyKClcblxuXHRcdFx0XHRsZWZ0VGwuZnJvbVRvKG1lc3NhZ2VXcmFwcGVyLCAxLjQsIHsgeTp3aW5kb3dILCBzY2FsZVk6MywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnIH0sIHsgeTowLCBzY2FsZVk6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHRcdFx0bGVmdFRsLnN0YWdnZXJGcm9tKHNwbGl0dGVyLndvcmRzLCAxLCB7IHk6MTQwMCwgc2NhbGVZOjYsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC4wNiwgMC4yKVxuXHRcdFx0XHRyaWdodFRsLmZyb21Ubyh2aWRlb1dyYXBwZXIsIDEuNCwgeyB5Oi13aW5kb3dIKjIsIHNjYWxlWTozLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblxuXHRcdFx0XHRsZWZ0VGwucGF1c2UoMClcblx0XHRcdFx0cmlnaHRUbC5wYXVzZSgwKVxuXHRcdFx0XHRtZXNzYWdlV3JhcHBlci5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUub3BhY2l0eSA9IDFcblxuXHRcdFx0XHRpZihzY29wZS5pc09wZW4pIHtcblx0XHRcdFx0XHRsZWZ0VGwucGF1c2UobGVmdFRsLnRvdGFsRHVyYXRpb24oKSlcblx0XHRcdFx0XHRyaWdodFRsLnBhdXNlKHJpZ2h0VGwudG90YWxEdXJhdGlvbigpKVxuXHRcdFx0XHR9XG5cdFx0XHR9LCA1KVxuXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzT3BlbikgcmV0dXJuXG5cdFx0XHR2YXIgbmV3eCA9IG1vdXNlLnggLSAoY3Jvc3Muc2l6ZVswXSA+PiAxKVxuXHRcdFx0dmFyIG5ld3kgPSBtb3VzZS55IC0gKGNyb3NzLnNpemVbMV0gPj4gMSlcblx0XHRcdGNyb3NzLnggKz0gKG5ld3ggLSBjcm9zcy54KSAqIDAuNVxuXHRcdFx0Y3Jvc3MueSArPSAobmV3eSAtIGNyb3NzLnkpICogMC41XG5cblx0XHRcdGlmKG1vdXNlLnkgPiA3MCkge1xuXHRcdFx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ25vbmUnXG5cdFx0XHRcdGNyb3NzLmVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdFx0XHRjcm9zcy5lbC5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fVxuXHRcdFx0VXRpbHMuVHJhbnNsYXRlKGNyb3NzLmVsLCBjcm9zcy54LCBjcm9zcy55LCAxKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGxlZnRUbC5jbGVhcigpXG5cdFx0XHRyaWdodFRsLmNsZWFyKClcblx0XHRcdHNjb3BlLmxlZnRSZWN0cy5jbGVhcigpXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzLmNsZWFyKClcblx0XHRcdHNjb3BlLmxlZnRSZWN0cyA9IG51bGxcblx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMgPSBudWxsXG5cdFx0XHRsZWZ0VGwgPSBudWxsXG5cdFx0XHRyaWdodFRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgdmlkZW9DYW52YXMgZnJvbSAndmlkZW8tY2FudmFzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5pbXBvcnQgbWVkaWFDZWxsIGZyb20gJ21lZGlhLWNlbGwnXG5cbnZhciBncmlkID0gKHByb3BzLCBwYXJlbnQsIG9uSXRlbUVuZGVkKT0+IHtcblxuXHR2YXIgdmlkZW9FbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgaW1hZ2VFbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgZ3JpZENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgZ3JpZEZyb250Q29udGFpbmVyID0gZG9tLnNlbGVjdChcIi5ncmlkLWZyb250LWNvbnRhaW5lclwiLCBwYXJlbnQpXG5cdHZhciBsaW5lc0dyaWRDb250YWluZXIgPSBkb20uc2VsZWN0KCcubGluZXMtZ3JpZC1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciBncmlkQ2hpbGRyZW4gPSBncmlkQ29udGFpbmVyLmNoaWxkcmVuXG5cdHZhciBncmlkRnJvbnRDaGlsZHJlbiA9IGdyaWRGcm9udENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgbGluZXNIb3Jpem9udGFsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAudmVydGljYWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgc2NvcGU7XG5cdHZhciBjdXJyZW50U2VhdDtcblx0dmFyIGNlbGxzID0gW11cblx0dmFyIHRvdGFsTnVtID0gcHJvcHMuZGF0YS5ncmlkLmxlbmd0aFxuXHR2YXIgdmlkZW9zID0gQXBwU3RvcmUuZ2V0SG9tZVZpZGVvcygpXG5cblx0dmFyIHNlYXRzID0gW1xuXHRcdDEsIDMsIDUsXG5cdFx0NywgOSwgMTEsIDEzLFxuXHRcdDE1LCBcblx0XHQyMSwgMjMsIDI1XG5cdF1cblxuXHR2YXIgdkNhbnZhc1Byb3BzID0ge1xuXHRcdGF1dG9wbGF5OiBmYWxzZSxcblx0XHR2b2x1bWU6IDAsXG5cdFx0bG9vcDogZmFsc2UsXG5cdFx0b25FbmRlZDogdmlkZW9FbmRlZFxuXHR9XG5cblx0dmFyIG1DZWxsO1xuXHR2YXIgY291bnRlciA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxOdW07IGkrKykge1xuXHRcdHZhciB2UGFyZW50ID0gZ3JpZENoaWxkcmVuW2ldXG5cdFx0dmFyIGZQYXJlbnQgPSBncmlkRnJvbnRDaGlsZHJlbltpXVxuXHRcdGNlbGxzW2ldID0gdW5kZWZpbmVkXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzZWF0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYoaSA9PSBzZWF0c1tqXSkge1xuXHRcdFx0XHRtQ2VsbCA9IG1lZGlhQ2VsbCh2UGFyZW50LCBmUGFyZW50LCB2aWRlb3NbY291bnRlcl0pXG5cdFx0XHRcdGNlbGxzW2ldID0gbUNlbGxcblx0XHRcdFx0Y291bnRlcisrXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dmFyIHJlc2l6ZSA9IChnR3JpZCk9PiB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHZhciBvcmlnaW5hbFZpZGVvU2l6ZSA9IEFwcENvbnN0YW50cy5IT01FX1ZJREVPX1NJWkVcblx0XHR2YXIgYmxvY2tTaXplID0gZ0dyaWQuYmxvY2tTaXplXG5cblx0XHRsaW5lc0dyaWRDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cblx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0sIG9yaWdpbmFsVmlkZW9TaXplWzBdLCBvcmlnaW5hbFZpZGVvU2l6ZVsxXSlcblxuXHRcdHZhciBnUG9zID0gZ0dyaWQucG9zaXRpb25zXG5cdFx0dmFyIHBhcmVudCwgY2VsbDtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIGhsLCB2bDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciByb3cgPSBnUG9zW2ldXG5cblx0XHRcdC8vIGhvcml6b250YWwgbGluZXNcblx0XHRcdGlmKGkgPiAwKSB7XG5cdFx0XHRcdGhsID0gc2NvcGUubGluZXMuaG9yaXpvbnRhbFtpLTFdXG5cdFx0XHRcdGhsLnN0eWxlLnRvcCA9IE1hdGguZmxvb3IoYmxvY2tTaXplWzFdICogaSkgKyAncHgnXG5cdFx0XHRcdGhsLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIHZlcnRpY2FsIGxpbmVzXG5cdFx0XHRcdGlmKGkgPT0gMCAmJiBqID4gMCkge1xuXHRcdFx0XHRcdHZsID0gc2NvcGUubGluZXMudmVydGljYWxbai0xXVxuXHRcdFx0XHRcdHZsLnN0eWxlLmxlZnQgPSBNYXRoLmZsb29yKGJsb2NrU2l6ZVswXSAqIGopICsgJ3B4J1xuXHRcdFx0XHRcdHZsLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjZWxsID0gc2NvcGUuY2VsbHNbY291bnRdXG5cdFx0XHRcdGlmKGNlbGwgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbC5yZXNpemUoYmxvY2tTaXplLCByb3dbal0sIHJlc2l6ZVZhcnMpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb3VudCsrXG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRlbDogZ3JpZENvbnRhaW5lcixcblx0XHRjaGlsZHJlbjogZ3JpZENoaWxkcmVuLFxuXHRcdGNlbGxzOiBjZWxscyxcblx0XHRudW06IHRvdGFsTnVtLFxuXHRcdHBvc2l0aW9uczogW10sXG5cdFx0bGluZXM6IHtcblx0XHRcdGhvcml6b250YWw6IGxpbmVzSG9yaXpvbnRhbCxcblx0XHRcdHZlcnRpY2FsOiBsaW5lc1ZlcnRpY2FsXG5cdFx0fSxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHRpbml0OiAoKT0+IHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoY2VsbHNbaV0gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbHNbaV0uaW5pdCgpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uSW5JdGVtOiAoaW5kZXgsIHR5cGUpPT4ge1xuXHRcdFx0Ly8gdmFyIGl0ZW0gPSBzY29wZS5jZWxsc1tpbmRleF1cblx0XHRcdC8vIGl0ZW0uc2VhdCA9IGluZGV4XG5cblx0XHRcdC8vIGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZScpXG5cdFx0XHRcblx0XHRcdC8vIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklURU1fVklERU8pIHtcblx0XHRcdC8vIFx0aXRlbS5wbGF5KClcblx0XHRcdC8vIH1lbHNle1xuXHRcdFx0Ly8gXHRpdGVtLnRpbWVvdXQoaW1hZ2VFbmRlZCwgMjAwMClcblx0XHRcdC8vIFx0aXRlbS5zZWVrKFV0aWxzLlJhbmQoMiwgMTAsIDApKVxuXHRcdFx0Ly8gfVxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbk91dEl0ZW06IChpdGVtKT0+IHtcblx0XHRcdC8vIGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZScpXG5cblx0XHRcdC8vIGl0ZW0udmlkZW8uY3VycmVudFRpbWUoMClcblx0XHRcdC8vIGl0ZW0ucGF1c2UoKVxuXHRcdFx0Ly8gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0Ly8gXHRpdGVtLmRyYXdPbmNlKClcblx0XHRcdC8vIH0sIDUwMClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoY2VsbHNbaV0gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbHNbaV0uY2xlYXIoKVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fSBcblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ3JpZCIsIi8qXG5cdHdpZHRoOiBcdFx0d2lkdGggb2YgZ3JpZFxuXHRoZWlnaHQ6IFx0aGVpZ2h0IG9mIGdyaWRcblx0Y29sdW1uczogXHRudW1iZXIgb2YgY29sdW1uc1xuXHRyb3dzOiBcdFx0bnVtYmVyIG9mIHJvd3Ncblx0dHlwZTogXHRcdHR5cGUgb2YgdGhlIGFycmF5XG5cdFx0XHRcdGxpbmVhciAtIHdpbGwgZ2l2ZSBhbGwgdGhlIGNvbHMgYW5kIHJvd3MgcG9zaXRpb24gdG9nZXRoZXIgb25lIGFmdGVyIHRoZSBvdGhlclxuXHRcdFx0XHRjb2xzX3Jvd3MgLSB3aWxsIGdpdmUgc2VwYXJhdGUgcm93cyBhcnJheXMgd2l0aCB0aGUgY29scyBpbnNpZGUgXHRyb3dbIFtjb2xdLCBbY29sXSwgW2NvbF0sIFtjb2xdIF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuKi9cblxuZXhwb3J0IGRlZmF1bHQgKHdpZHRoLCBoZWlnaHQsIGNvbHVtbnMsIHJvd3MsIHR5cGUpPT4ge1xuXG5cdHZhciB0ID0gdHlwZSB8fCAnbGluZWFyJ1xuXHR2YXIgYmxvY2tTaXplID0gWyB3aWR0aCAvIGNvbHVtbnMsIGhlaWdodCAvIHJvd3MgXVxuXHR2YXIgYmxvY2tzTGVuID0gcm93cyAqIGNvbHVtbnNcblx0dmFyIHBvc2l0aW9ucyA9IFtdXG5cdFxuXHR2YXIgcG9zWCA9IDBcblx0dmFyIHBvc1kgPSAwXG5cdHZhciBjb2x1bW5Db3VudGVyID0gMFxuXHR2YXIgcm93c0NvdW50ZXIgPSAwXG5cdHZhciByciA9IFtdXG5cblx0c3dpdGNoKHQpIHtcblx0XHRjYXNlICdsaW5lYXInOiBcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzTGVuOyBpKyspIHtcblx0XHRcdFx0aWYoY29sdW1uQ291bnRlciA+PSBjb2x1bW5zKSB7XG5cdFx0XHRcdFx0cG9zWCA9IDBcblx0XHRcdFx0XHRwb3NZICs9IGJsb2NrU2l6ZVsxXVxuXHRcdFx0XHRcdGNvbHVtbkNvdW50ZXIgPSAwXG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGIgPSBbcG9zWCwgcG9zWV1cblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdHBvc2l0aW9uc1tpXSA9IGJcblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgJ2NvbHNfcm93cyc6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRyci5wdXNoKGIpXG5cdFx0XHRcdHBvc1ggKz0gYmxvY2tTaXplWzBdXG5cdFx0XHRcdGNvbHVtbkNvdW50ZXIgKz0gMVxuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0XHRwb3NpdGlvbnNbcm93c0NvdW50ZXJdID0gcnJcblx0XHRcdFx0XHRyciA9IFtdXG5cdFx0XHRcdFx0cm93c0NvdW50ZXIrK1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0YnJlYWtcblx0fVxuXG5cblx0cmV0dXJuIHtcblx0XHRyb3dzOiByb3dzLFxuXHRcdGNvbHVtbnM6IGNvbHVtbnMsXG5cdFx0YmxvY2tTaXplOiBibG9ja1NpemUsXG5cdFx0cG9zaXRpb25zOiBwb3NpdGlvbnNcblx0fVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZXh0QnRuIGZyb20gJ3RleHQtYnRuJ1xuXG52YXIgaGVhZGVyTGlua3MgPSAocGFyZW50KT0+IHtcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvblN1Yk1lbnVNb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLmFkZChlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgc2ltcGxlVGV4dEJ0bnNFbCA9IGRvbS5zZWxlY3QuYWxsKCcudGV4dC1idG4nLCBwYXJlbnQpXG5cdHZhciBzaW1wbGVCdG5zID0gW11cblx0dmFyIGksIHMsIGVsO1xuXHRmb3IgKGkgPSAwOyBpIDwgc2ltcGxlVGV4dEJ0bnNFbC5sZW5ndGg7IGkrKykge1xuXHRcdGVsID0gc2ltcGxlVGV4dEJ0bnNFbFtpXVxuXHRcdHMgPSB0ZXh0QnRuKGVsKVxuXHRcdHNpbXBsZUJ0bnNbaV0gPSBzXG5cdH1cblxuXHR2YXIgc2hvcFdyYXBwZXIgPSBkb20uc2VsZWN0KCcuc2hvcC13cmFwcGVyJywgcGFyZW50KVxuXHRzaG9wV3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcFdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uU3ViTWVudU1vdXNlTGVhdmUpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBwYWRkaW5nID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EIC8gM1xuXG5cdFx0XHR2YXIgY2FtcGVyTGFiID0gc2ltcGxlQnRuc1sxXVxuXHRcdFx0dmFyIHNob3AgPSBzaW1wbGVCdG5zWzJdXG5cdFx0XHR2YXIgbWFwID0gc2ltcGxlQnRuc1swXVxuXHRcdFx0dmFyIHNob3BTaXplID0gZG9tLnNpemUoc2hvcFdyYXBwZXIpXG5cblx0XHRcdHZhciBjYW1wZXJMYWJDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSAoQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC42KSAtIHBhZGRpbmcgLSBjYW1wZXJMYWIuc2l6ZVswXSxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgc2hvcENzcyA9IHtcblx0XHRcdFx0bGVmdDogY2FtcGVyTGFiQ3NzLmxlZnQgLSBzaG9wU2l6ZVswXSAtIHBhZGRpbmcgLSAyMCxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSBtYXAuc2l6ZVswXSAtIHBhZGRpbmcgLSAzMCxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cblx0XHRcdHNob3AuZWwuc3R5bGUubGVmdCA9IChzaG9wU2l6ZVswXSA+PiAxKSAtIChzaG9wLnNpemVbMF0gPj4gMSkgKyAncHgnXG5cblx0XHRcdGNhbXBlckxhYi5lbC5zdHlsZS5sZWZ0ID0gY2FtcGVyTGFiQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRjYW1wZXJMYWIuZWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BXcmFwcGVyLnN0eWxlLmxlZnQgPSBzaG9wQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRzaG9wV3JhcHBlci5zdHlsZS50b3AgPSBzaG9wQ3NzLnRvcCArICdweCdcblx0XHRcdG1hcC5lbC5zdHlsZS5sZWZ0ID0gbWFwQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRtYXAuZWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lcik9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0Ly8gdmFyIGNhbnZhc2VzID0gZWwuY2hpbGRyZW5cblx0Ly8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHQvLyB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdHZhciBvbkltZ0xvYWRlZENhbGxiYWNrO1xuXHR2YXIgZ3JpZDtcblx0dmFyIGltYWdlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBhbmltID0ge1xuXHRcdHg6MCxcblx0XHR5OjBcblx0fVxuXG5cblx0Ly8gdmFyIGl0ZW1zID0gW11cblx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuXHQvLyBcdHZhciB0bXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBcblx0Ly8gXHRpdGVtc1tpXSA9IHtcblx0Ly8gXHRcdGNhbnZhczogY2FudmFzZXNbaV0sXG5cdC8vIFx0XHRjdHg6IGNhbnZhc2VzW2ldLmdldENvbnRleHQoJzJkJyksXG5cdC8vIFx0XHR0bXBDYW52YXM6IHRtcENhbnZhcyxcblx0Ly8gXHRcdHRtcENvbnRleHQ6IHRtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cdC8vIFx0fVxuXHQvLyB9XG5cblx0dmFyIG9uSW1nUmVhZHkgPSAoZXJyb3IsIGkpPT4ge1xuXHRcdGltYWdlID0gaVxuXHRcdGRvbS50cmVlLmFkZChlbCwgaW1hZ2UpXG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoZ3JpZClcblx0XHRpZihvbkltZ0xvYWRlZENhbGxiYWNrKSBvbkltZ0xvYWRlZENhbGxiYWNrKClcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRyZXNpemU6IChnR3JpZCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdGdyaWQgPSBnR3JpZFxuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHZhciByZXNpemVWYXJzQmcgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1cqMS4xLCB3aW5kb3dIKjEuMSwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cdFx0XHRpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRcdGltYWdlLnN0eWxlLndpZHRoID0gcmVzaXplVmFyc0JnLndpZHRoICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFyc0JnLmhlaWdodCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnNCZy50b3AgLSAxMCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzQmcubGVmdCAtIDIwICsgJ3B4J1xuXG5cdFx0XHQvLyB2YXIgYmxvY2tTaXplID0gZ0dyaWQuYmxvY2tTaXplXG5cdFx0XHQvLyB2YXIgaW1hZ2VCbG9ja1NpemUgPSBbIHJlc2l6ZVZhcnNCZy53aWR0aCAvIGdHcmlkLmNvbHVtbnMsIHJlc2l6ZVZhcnNCZy5oZWlnaHQgLyBnR3JpZC5yb3dzIF1cblx0XHRcdC8vIHZhciBnUG9zID0gZ0dyaWQucG9zaXRpb25zXG5cdFx0XHQvLyB2YXIgY291bnQgPSAwXG5cdFx0XHQvLyB2YXIgY2FudmFzLCBjdHgsIHRtcENvbnRleHQsIHRtcENhbnZhcztcblxuXHRcdFx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBnUG9zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQvLyBcdHZhciByb3cgPSBnUG9zW2ldXG5cblx0XHRcdC8vIFx0Zm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcblx0XHRcdC8vIFx0XHRjYW52YXMgPSBpdGVtc1tjb3VudF0uY2FudmFzXG5cdFx0XHQvLyBcdFx0Y3R4ID0gaXRlbXNbY291bnRdLmN0eFxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQgPSBpdGVtc1tjb3VudF0udG1wQ29udGV4dFxuXHRcdFx0Ly8gXHRcdHRtcENhbnZhcyA9IGl0ZW1zW2NvdW50XS50bXBDYW52YXNcblxuXHRcdFx0Ly8gXHRcdC8vIGJsb2NrIGRpdnNcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUubGVmdCA9IHJvd1tqXVswXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUudG9wID0gcm93W2pdWzFdICsgJ3B4J1xuXG5cdFx0XHQvLyBcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LnNhdmUoKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuZHJhd0ltYWdlKGltYWdlLCBpbWFnZUJsb2NrU2l6ZVswXSpqLCBpbWFnZUJsb2NrU2l6ZVsxXSppLCBpbWFnZUJsb2NrU2l6ZVswXSwgaW1hZ2VCbG9ja1NpemVbMV0sIDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5yZXN0b3JlKClcblx0XHRcdC8vIFx0XHRjdHguZHJhd0ltYWdlKHRtcENhbnZhcywgMCwgMClcblxuXHRcdFx0Ly8gXHRcdGNvdW50Kytcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gfVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXG5cdFx0XHRhbmltLnggKz0gKCgobW91c2UublgtMC41KSo0MCkgLSBhbmltLngpICogMC4wNVxuXHRcdFx0YW5pbS55ICs9ICgoKG1vdXNlLm5ZLTAuNSkqMjApIC0gYW5pbS55KSAqIDAuMDVcblx0XHRcdFV0aWxzLlRyYW5zbGF0ZShpbWFnZSwgYW5pbS54LCBhbmltLnksIDEpXG5cblx0XHR9LFxuXHRcdGxvYWQ6ICh1cmwsIGNiKT0+IHtcblx0XHRcdG9uSW1nTG9hZGVkQ2FsbGJhY2sgPSBjYlxuXHRcdFx0aW1nKHVybCwgb25JbWdSZWFkeSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGVsID0gbnVsbFxuXHRcdFx0aW1hZ2UgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGltZyBmcm9tICdpbWcnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGRhdGEsIG1vdXNlLCBvbk1vdXNlRXZlbnRzSGFuZGxlcik9PiB7XG5cblx0dmFyIGFuaW1QYXJhbXMgPSAocGFyZW50LCBlbCwgaW1nV3JhcHBlcik9PiB7XG5cdFx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0bC5mcm9tVG8oaW1nV3JhcHBlciwgMSwge3NjYWxlWDoxLjcsIHNjYWxlWToxLjMsIHJvdGF0aW9uOicyZGVnJywgeTotMjAsIG9wYWNpdHk6MCwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSB9LCB7IHNjYWxlWDoxLCBzY2FsZVk6MSwgcm90YXRpb246JzBkZWcnLCB5OjAsIG9wYWNpdHk6MSwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpCYWNrLmVhc2VJbk91dH0sIDApXG5cdFx0dGwucGF1c2UoMClcblx0XHRyZXR1cm4ge1xuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHRpbWdXcmFwcGVyOiBpbWdXcmFwcGVyLFxuXHRcdFx0dGw6IHRsLFxuXHRcdFx0ZWw6IGVsLFxuXHRcdFx0dGltZTogMCxcblx0XHRcdHBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdGlwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIGZzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gaXNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gdmVsb2NpdHlTY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0cm90YXRpb246IDAsXG5cdFx0XHRjb25maWc6IHtcblx0XHRcdFx0bGVuZ3RoOiAwLFxuXHRcdFx0XHRzcHJpbmc6IDAuOCxcblx0XHRcdFx0ZnJpY3Rpb246IDAuNFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1haW4tYnRucy13cmFwcGVyJywgY29udGFpbmVyKVxuXHR2YXIgc2hvcEJ0biA9IGRvbS5zZWxlY3QoJyNzaG9wLWJ0bicsIGVsKVxuXHR2YXIgZnVuQnRuID0gZG9tLnNlbGVjdCgnI2Z1bi1mYWN0LWJ0bicsIGVsKVxuXHR2YXIgc2hvcEltZ1dyYXBwZXIgID0gZG9tLnNlbGVjdCgnLmltZy13cmFwcGVyJywgc2hvcEJ0bilcblx0dmFyIGZ1bkltZ1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuaW1nLXdyYXBwZXInLCBmdW5CdG4pXG5cdHZhciBzaG9wU2l6ZSwgZnVuU2l6ZTtcblx0dmFyIGxvYWRDb3VudGVyID0gMFxuXHR2YXIgYnV0dG9uU2l6ZSA9IFswLCAwXVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgdHJhbnNsYXRlID0gVXRpbHMuVHJhbnNsYXRlXG5cdHZhciBzaG9wQW5pbSwgZnVuQW5pbSwgY3VycmVudEFuaW07XG5cdHZhciBidXR0b25zID0ge1xuXHRcdCdzaG9wLWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH0sXG5cdFx0J2Z1bi1mYWN0LWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXG5cdHZhciBzaG9wSW1nID0gaW1nKCdpbWFnZS9zaG9wLycrQXBwU3RvcmUubGFuZygpKycucG5nJywgKCk9PiB7XG5cdFx0c2hvcEFuaW0gPSBhbmltUGFyYW1zKHNob3BCdG4sIHNob3BJbWcsIHNob3BJbWdXcmFwcGVyKVxuXHRcdGJ1dHRvbnNbJ3Nob3AtYnRuJ10uYW5pbSA9IHNob3BBbmltXG5cdFx0c2hvcFNpemUgPSBbc2hvcEltZy53aWR0aCwgc2hvcEltZy5oZWlnaHRdXG5cdFx0ZG9tLnRyZWUuYWRkKHNob3BJbWdXcmFwcGVyLCBzaG9wSW1nKVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cdHZhciBmdW5JbWcgPSBpbWcoJ2ltYWdlL2Z1bi1mYWN0cy5wbmcnLCAoKT0+IHtcblx0XHRmdW5BbmltID0gYW5pbVBhcmFtcyhmdW5CdG4sIGZ1bkltZywgZnVuSW1nV3JhcHBlcilcblx0XHRidXR0b25zWydmdW4tZmFjdC1idG4nXS5hbmltID0gZnVuQW5pbVxuXHRcdGZ1blNpemUgPSBbZnVuSW1nLndpZHRoLCBmdW5JbWcuaGVpZ2h0XVxuXHRcdGRvbS50cmVlLmFkZChmdW5JbWdXcmFwcGVyLCBmdW5JbWcpXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKGZ1bkJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cblx0dmFyIHVwZGF0ZUFuaW0gPSAoYW5pbSk9PiB7XG5cdFx0aWYoYW5pbSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdGFuaW0udGltZSArPSAwLjFcblx0XHRhbmltLmZwb3NpdGlvbi54ID0gYW5pbS5pcG9zaXRpb24ueFxuXHRcdGFuaW0uZnBvc2l0aW9uLnkgPSBhbmltLmlwb3NpdGlvbi55XG5cdFx0YW5pbS5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogODBcblx0XHRhbmltLmZwb3NpdGlvbi55ICs9IChtb3VzZS5uWSAtIDAuNSkgKiAyMDBcblxuXHRcdHNwcmluZ1RvKGFuaW0sIGFuaW0uZnBvc2l0aW9uLCAxKVxuXHRcdGFuaW0uY29uZmlnLmxlbmd0aCArPSAoMC4wMSAtIGFuaW0uY29uZmlnLmxlbmd0aCkgKiAwLjFcblx0XHRcblx0XHR0cmFuc2xhdGUoYW5pbS5lbCwgYW5pbS5wb3NpdGlvbi54ICsgYW5pbS52ZWxvY2l0eS54LCBhbmltLnBvc2l0aW9uLnkgKyBhbmltLnZlbG9jaXR5LnksIDEpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFcgPSB3aW5kb3dXID4+IDFcblx0XHRcdHZhciBzY2FsZSA9IDAuOFxuXHRcdFx0XG5cdFx0XHRidXR0b25TaXplWzBdID0gbWlkVyAqIDAuOVxuXHRcdFx0YnV0dG9uU2l6ZVsxXSA9IHdpbmRvd0hcblxuXHRcdFx0aWYoc2hvcFNpemUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHNob3BCdG4uc3R5bGUud2lkdGggPSBidXR0b25TaXplWzBdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUubGVmdCA9IChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSArICdweCdcblx0XHRcdFx0XG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLndpZHRoID0gc2hvcFNpemVbMF0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHNob3BTaXplWzFdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS5sZWZ0ID0gKGJ1dHRvblNpemVbMF0gPj4gMSkgLSAoc2hvcFNpemVbMF0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLnRvcCA9IChidXR0b25TaXplWzFdID4+IDEpIC0gKHNob3BTaXplWzFdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0fVxuXHRcdFx0aWYoZnVuU2l6ZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS5sZWZ0ID0gbWlkVyArIChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChidXR0b25TaXplWzFdID4+IDEpICsgJ3B4J1xuXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUud2lkdGggPSBmdW5TaXplWzBdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLmhlaWdodCA9IGZ1blNpemVbMV0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUubGVmdCA9IChidXR0b25TaXplWzBdID4+IDEpIC0gKGZ1blNpemVbMF0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUudG9wID0gKGJ1dHRvblNpemVbMV0gPj4gMSkgLSAoZnVuU2l6ZVsxXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdH1cblx0XHR9LFxuXHRcdG92ZXI6IChpZCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNBY3RpdmUpIHJldHVyblxuXHRcdFx0Y3VycmVudEFuaW0gPSBidXR0b25zW2lkXS5hbmltXG5cdFx0XHRjdXJyZW50QW5pbS50bC50aW1lU2NhbGUoMi42KS5wbGF5KDApXG5cdFx0XHRjdXJyZW50QW5pbS5jb25maWcubGVuZ3RoID0gNDAwXG5cdFx0fSxcblx0XHRvdXQ6IChpZCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNBY3RpdmUpIHJldHVyblxuXHRcdFx0Y3VycmVudEFuaW0gPSBidXR0b25zW2lkXS5hbmltXG5cdFx0XHRjdXJyZW50QW5pbS50bC50aW1lU2NhbGUoMykucmV2ZXJzZSgpXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGlmKHNob3BBbmltID09IHVuZGVmaW5lZCkgcmV0dXJuIFxuXHRcdFx0dXBkYXRlQW5pbShzaG9wQW5pbSlcblx0XHRcdHVwZGF0ZUFuaW0oZnVuQW5pbSlcblx0XHR9LFxuXHRcdGFjdGl2YXRlOiAoKT0+IHtcblx0XHRcdHNjb3BlLmlzQWN0aXZlID0gdHJ1ZVxuXHRcdH0sXG5cdFx0ZGlzYWN0aXZhdGU6ICgpPT4ge1xuXHRcdFx0c2NvcGUuaXNBY3RpdmUgPSBmYWxzZVxuXHRcdFx0c2hvcEFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdFx0ZnVuQW5pbS50bC50aW1lU2NhbGUoMykucmV2ZXJzZSgpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRzaG9wQW5pbS50bC5jbGVhcigpXG5cdFx0XHRmdW5BbmltLnRsLmNsZWFyKClcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0c2hvcEFuaW0gPSBudWxsXG5cdFx0XHRmdW5BbmltID0gbnVsbFxuXHRcdFx0YnV0dG9ucyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdNYXBfaGJzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCB0eXBlKSA9PiB7XG5cblx0Ly8gcmVuZGVyIG1hcFxuXHR2YXIgbWFwV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0dmFyIHQgPSB0ZW1wbGF0ZSgpXG5cdGVsLmlubmVySFRNTCA9IHRcblx0ZG9tLnRyZWUuYWRkKG1hcFdyYXBwZXIsIGVsKVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGRpciwgc3RlcEVsO1xuXHR2YXIgc2VsZWN0ZWREb3RzID0gW107XG5cdHZhciBjdXJyZW50UGF0aHMsIGZpbGxMaW5lLCBkYXNoZWRMaW5lLCBzdGVwVG90YWxMZW4gPSAwO1xuXHR2YXIgcHJldmlvdXNIaWdobGlnaHRJbmRleCA9IHVuZGVmaW5lZDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1hcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgbWFwZG90cyA9IGRvbS5zZWxlY3QuYWxsKCcjbWFwLWRvdHMgLmRvdC1wYXRoJywgZWwpXG5cdHZhciBmb290c3RlcHMgPSBkb20uc2VsZWN0LmFsbCgnI2Zvb3RzdGVwcyBnJywgZWwpXG5cdHZhciBtYWxsb3JjYUxvZ28gPSBkb20uc2VsZWN0KCcjbWFsbG9yY2EtbG9nbyBwYXRoJywgZWwpXG5cdHZhciBjdXJyZW50RG90O1xuXG5cdC8vIGZpeCBidWdneSBvcmlnaW4gcG9zaXRpb25cblx0aWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNGaXJlZm94KSB7XG5cdFx0dmFyIGksIGRvdDtcblx0XHRmb3IgKGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGRvdCwgJ2ZpeC1idWdneS1vcmlnaW4tcG9zaXRpb24nKVxuXHRcdH1cblx0fVxuXG5cdHZhciBmaW5kRG90QnlJZCA9IChwYXJlbnQsIGNoaWxkKT0+IHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRpZihwYXJlbnQgPT0gZG90LmlkKSB7XG5cdFx0XHRcdGlmKGNoaWxkID09IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJykpIHtcblx0XHRcdFx0XHRyZXR1cm4gZG90XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgb25DZWxsTW91c2VFbnRlciA9IChpdGVtKT0+IHtcblx0XHRjdXJyZW50RG90ID0gZmluZERvdEJ5SWQoaXRlbVsxXSwgaXRlbVswXSlcblx0XHRkb20uY2xhc3Nlcy5hZGQoY3VycmVudERvdCwgJ2FuaW1hdGUnKVxuXHR9XG5cdHZhciBvbkNlbGxNb3VzZUxlYXZlID0gKGl0ZW0pPT4ge1xuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjdXJyZW50RG90LCAnYW5pbWF0ZScpXG5cdH1cblxuXHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfRU5URVIsIG9uQ2VsbE1vdXNlRW50ZXIpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfTEVBVkUsIG9uQ2VsbE1vdXNlTGVhdmUpXG5cblx0fVxuXG5cdHZhciB0aXRsZXMgPSB7XG5cdFx0J2RlaWEnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmRlaWEnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2VzLXRyZW5jJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5lcy10cmVuYycsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fSxcblx0XHQnYXJlbGx1Zic6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuYXJlbGx1ZicsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdGl0bGVQb3NYKHBhcmVudFcsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50VyAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVykgKiB2YWxcblx0fVxuXHRmdW5jdGlvbiB0aXRsZVBvc1kocGFyZW50SCwgdmFsKSB7XG5cdFx0cmV0dXJuIChwYXJlbnRIIC8gQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKSAqIHZhbFxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IG1hcFdyYXBwZXIsXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIG1hcFcgPSA2OTMsIG1hcEggPSA1MDBcblx0XHRcdHZhciBtYXBTaXplID0gW11cblx0XHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXKjAuMzUsIHdpbmRvd0gqMC4zNSwgbWFwVywgbWFwSClcblx0XHRcdG1hcFNpemVbMF0gPSBtYXBXICogcmVzaXplVmFycy5zY2FsZVxuXHRcdFx0bWFwU2l6ZVsxXSA9IG1hcEggKiByZXNpemVWYXJzLnNjYWxlXG5cblx0XHRcdGVsLnN0eWxlLndpZHRoID0gbWFwU2l6ZVswXSArICdweCdcblx0XHRcdGVsLnN0eWxlLmhlaWdodCA9IG1hcFNpemVbMV0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1cgPj4gMSkgLSAobWFwU2l6ZVswXSA+PiAxKSAtIDQwICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAobWFwU2l6ZVsxXSA+PiAxKSArICdweCdcblxuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCA4MDApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDMzMCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCAxMjUwKSArICdweCdcblx0XHRcdHRpdGxlc1snZXMtdHJlbmMnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgODUwKSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgNDI2KSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCA1MDApICsgJ3B4J1xuXHRcdH0sXG5cdFx0aGlnaGxpZ2h0RG90czogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0c2VsZWN0ZWREb3RzID0gW11cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBkb3QuaWRcblx0XHRcdFx0dmFyIHBhcmVudElkID0gZG90LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQtaWQnKVxuXHRcdFx0XHRpZihpZCA9PSBvbGRIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBvbGRIYXNoLnBhcmVudCkgc2VsZWN0ZWREb3RzLnB1c2goZG90KVxuXHRcdFx0XHRpZihpZCA9PSBuZXdIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBuZXdIYXNoLnBhcmVudCkgIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGRvdCwgJ2FuaW1hdGUnKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGhpZ2hsaWdodDogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0dmFyIG9sZElkID0gb2xkSGFzaC50YXJnZXRcblx0XHRcdHZhciBuZXdJZCA9IG5ld0hhc2gudGFyZ2V0XG5cdFx0XHR2YXIgY3VycmVudCA9IG9sZElkICsgJy0nICsgbmV3SWRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9vdHN0ZXBzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBzdGVwID0gZm9vdHN0ZXBzW2ldXG5cdFx0XHRcdHZhciBpZCA9IHN0ZXAuaWRcblx0XHRcdFx0aWYoaWQuaW5kZXhPZihvbGRJZCkgPiAtMSAmJiBpZC5pbmRleE9mKG5ld0lkKSA+IC0xKSB7XG5cdFx0XHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGxhc3Qgb25lXG5cdFx0XHRcdFx0aWYoaSA9PSBwcmV2aW91c0hpZ2hsaWdodEluZGV4KSBzdGVwRWwgPSBmb290c3RlcHNbZm9vdHN0ZXBzLmxlbmd0aC0xXVxuXHRcdFx0XHRcdGVsc2Ugc3RlcEVsID0gc3RlcFxuXG5cdFx0XHRcdFx0ZGlyID0gaWQuaW5kZXhPZihjdXJyZW50KSA+IC0xID8gQXBwQ29uc3RhbnRzLkZPUldBUkQgOiBBcHBDb25zdGFudHMuQkFDS1dBUkRcblx0XHRcdFx0XHRwcmV2aW91c0hpZ2hsaWdodEluZGV4ID0gaVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRzY29wZS5oaWdobGlnaHREb3RzKG9sZEhhc2gsIG5ld0hhc2gpXG5cblx0XHRcdGN1cnJlbnRQYXRocyA9IGRvbS5zZWxlY3QuYWxsKCdwYXRoJywgc3RlcEVsKVxuXHRcdFx0ZGFzaGVkTGluZSA9IGN1cnJlbnRQYXRoc1swXVxuXG5cdFx0XHQvLyBjaG9vc2UgcGF0aCBkZXBlbmRzIG9mIGZvb3RzdGVwIGRpcmVjdGlvblxuXHRcdFx0aWYoZGlyID09IEFwcENvbnN0YW50cy5GT1JXQVJEKSB7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzFdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1syXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzJdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzdGVwRWwuc3R5bGUub3BhY2l0eSA9IDFcblxuXHRcdFx0Ly8gLy8gZmluZCB0b3RhbCBsZW5ndGggb2Ygc2hhcGVcblx0XHRcdC8vIHN0ZXBUb3RhbExlbiA9IGZpbGxMaW5lLmdldFRvdGFsTGVuZ3RoKClcblx0XHRcdC8vIGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaG9mZnNldCddID0gMFxuXHRcdFx0Ly8gZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNoYXJyYXknXSA9IHN0ZXBUb3RhbExlblxuXHRcdFx0XG5cdFx0XHQvLyAvLyBzdGFydCBhbmltYXRpb24gb2YgZGFzaGVkIGxpbmVcblx0XHRcdC8vIGRvbS5jbGFzc2VzLmFkZChkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHRcdC8vIC8vIHN0YXJ0IGFuaW1hdGlvblxuXHRcdFx0Ly8gZG9tLmNsYXNzZXMuYWRkKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHR9LFxuXHRcdHJlc2V0SGlnaGxpZ2h0OiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0Ly8gc3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIGRvdCA9IHNlbGVjdGVkRG90c1tpXVxuXHRcdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkb3QsICdhbmltYXRlJylcblx0XHRcdFx0fTtcblx0XHRcdH0sIDApXG5cdFx0fSxcblx0XHR1cGRhdGVQcm9ncmVzczogKHByb2dyZXNzKT0+IHtcblx0XHRcdC8vIGlmKGZpbGxMaW5lID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0XHQvLyB2YXIgZGFzaE9mZnNldCA9IChwcm9ncmVzcyAvIDEpICogc3RlcFRvdGFsTGVuXG5cdFx0XHQvLyBmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IGRhc2hPZmZzZXRcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKSB7XG5cdFx0XHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9FTlRFUiwgb25DZWxsTW91c2VFbnRlcilcblx0XHRcdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0xFQVZFLCBvbkNlbGxNb3VzZUxlYXZlKVxuXHRcdFx0fVxuXHRcdFx0dGl0bGVzID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBmcm9udCwgdmlkZW9VcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHNwbGl0dGVyID0gdmlkZW9Vcmwuc3BsaXQoJy8nKVxuXHR2YXIgbmFtZSA9IHNwbGl0dGVyW3NwbGl0dGVyLmxlbmd0aC0xXS5zcGxpdCgnLicpWzBdXG5cdHZhciBuYW1lU3BsaXQgPSBuYW1lLnNwbGl0KCctJylcblx0dmFyIG5hbWVQYXJ0cyA9IG5hbWVTcGxpdC5sZW5ndGggPT0gMyA/IFtuYW1lU3BsaXRbMF0rJy0nK25hbWVTcGxpdFsxXSwgbmFtZVNwbGl0WzJdXSA6IG5hbWVTcGxpdFxuXHR2YXIgaW1nSWQgPSAnaG9tZS12aWRlby1zaG90cy8nICsgbmFtZVxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRsb29wOiB0cnVlLFxuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHR2YXIgc2l6ZSwgcG9zaXRpb24sIHJlc2l6ZVZhcnM7XG5cdHZhciBpbWc7XG5cdHZhciBpc01vdXNlRW50ZXIgPSBmYWxzZTtcblxuXHR2YXIgb25Nb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlzTW91c2VFbnRlciA9IHRydWVcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUVudGVyKG5hbWVQYXJ0cylcblx0XHRpZihtVmlkZW8uaXNMb2FkZWQpIHtcblx0XHRcdGRvbS5jbGFzc2VzLmFkZChjb250YWluZXIsICdvdmVyJylcblx0XHRcdG1WaWRlby5wbGF5KDApXG5cdFx0fWVsc2V7XG5cdFx0XHRtVmlkZW8ubG9hZCh2aWRlb1VybCwgKCk9PiB7XG5cdFx0XHRcdGlmKCFpc01vdXNlRW50ZXIpIHJldHVyblxuXHRcdFx0XHRkb20uY2xhc3Nlcy5hZGQoY29udGFpbmVyLCAnb3ZlcicpXG5cdFx0XHRcdG1WaWRlby5wbGF5KClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uTW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpc01vdXNlRW50ZXIgPSBmYWxzZVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjb250YWluZXIsICdvdmVyJylcblx0XHRBcHBBY3Rpb25zLmNlbGxNb3VzZUxlYXZlKG5hbWVQYXJ0cylcblx0XHRtVmlkZW8ucGF1c2UoMClcblx0fVxuXG5cdHZhciBvbkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFJvdXRlci5zZXRIYXNoKG5hbWVQYXJ0c1swXSArICcvJyArIG5hbWVQYXJ0c1sxXSlcblx0fVxuXG5cdHZhciBpbml0ID0gKCk9PiB7XG5cdFx0dmFyIGltZ1VybCA9IEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTChpbWdJZCkgXG5cdFx0aW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcblx0XHRpbWcuc3JjID0gaW1nVXJsXG5cdFx0ZG9tLnRyZWUuYWRkKGNvbnRhaW5lciwgaW1nKVxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIG1WaWRlby5lbClcblxuXHRcdGRvbS5ldmVudC5vbihmcm9udCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0ZG9tLmV2ZW50Lm9uKGZyb250LCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRkb20uZXZlbnQub24oZnJvbnQsICdjbGljaycsIG9uQ2xpY2spXG5cblx0XHRzY29wZS5pc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNSZWFkeTogZmFsc2UsXG5cdFx0aW5pdDogaW5pdCxcblx0XHRyZXNpemU6IChzLCBwLCBydik9PiB7XG5cblx0XHRcdHNpemUgPSBzID09IHVuZGVmaW5lZCA/IHNpemUgOiBzXG5cdFx0XHRwb3NpdGlvbiA9IHAgPT0gdW5kZWZpbmVkID8gcG9zaXRpb24gOiBwXG5cdFx0XHRyZXNpemVWYXJzID0gcnYgPT0gdW5kZWZpbmVkID8gcmVzaXplVmFycyA6IHJ2XG5cblx0XHRcdGlmKCFzY29wZS5pc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLndpZHRoID0gZnJvbnQuc3R5bGUud2lkdGggPSBzaXplWzBdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGZyb250LnN0eWxlLmhlaWdodCA9IHNpemVbMV0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUubGVmdCA9IGZyb250LnN0eWxlLmxlZnQgPSBwb3NpdGlvblswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS50b3AgPSBmcm9udC5zdHlsZS50b3AgPSBwb3NpdGlvblsxXSArICdweCdcblxuXHRcdFx0aW1nLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdGltZy5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdGltZy5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUud2lkdGggPSByZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUudG9wID0gcmVzaXplVmFycy50b3AgKyAncHgnXG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdG1WaWRlby5jbGVhcigpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZyb250LCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnJvbnQsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmcm9udCwgJ2NsaWNrJywgb25DbGljaylcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IChwcm9wcyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuXHR2aWRlby5wcmVsb2FkID0gXCJcIlxuXHR2YXIgb25SZWFkeUNhbGxiYWNrO1xuXHR2YXIgc2l6ZSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9XG5cdHZhciBlTGlzdGVuZXJzID0gW11cblxuXHR2YXIgb25DYW5QbGF5ID0gKCk9Pntcblx0XHRzY29wZS5pc0xvYWRlZCA9IHRydWVcblx0XHRpZihwcm9wcy5hdXRvcGxheSkgdmlkZW8ucGxheSgpXG5cdFx0aWYocHJvcHMudm9sdW1lICE9IHVuZGVmaW5lZCkgdmlkZW8udm9sdW1lID0gcHJvcHMudm9sdW1lXG5cdFx0c2l6ZS53aWR0aCA9IHZpZGVvLnZpZGVvV2lkdGhcblx0XHRzaXplLmhlaWdodCA9IHZpZGVvLnZpZGVvSGVpZ2h0XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICAgICAgb25SZWFkeUNhbGxiYWNrKHNjb3BlKVxuXHR9XG5cblx0dmFyIHBsYXkgPSAodGltZSk9Pntcblx0XHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IHRydWVcbiAgICBcdHZpZGVvLnBsYXkoKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dHJ5IHtcbiAgICBcdFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG5cdFx0fVxuXHRcdGNhdGNoKGVycikge1xuXHRcdH1cbiAgICB9XG5cbiAgICB2YXIgcGF1c2UgPSAodGltZSk9PntcbiAgICBcdHZpZGVvLnBhdXNlKClcbiAgICBcdGlmKHRpbWUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzY29wZS5zZWVrKHRpbWUpXG5cdFx0fVxuICAgIFx0c2NvcGUuaXNQbGF5aW5nID0gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgdm9sdW1lID0gKHZhbCk9PiB7XG4gICAgXHRpZih2YWwpIHtcbiAgICBcdFx0c2NvcGUuZWwudm9sdW1lID0gdmFsXG4gICAgXHR9ZWxzZXtcbiAgICBcdFx0cmV0dXJuIHNjb3BlLmVsLnZvbHVtZVxuICAgIFx0fVxuICAgIH1cblxuICAgIHZhciBjdXJyZW50VGltZSA9ICh2YWwpPT4ge1xuICAgIFx0aWYodmFsKSB7XG4gICAgXHRcdHNjb3BlLmVsLmN1cnJlbnRUaW1lID0gdmFsXG4gICAgXHR9ZWxzZXtcbiAgICBcdFx0cmV0dXJuIHNjb3BlLmVsLmN1cnJlbnRUaW1lXG4gICAgXHR9XG4gICAgfVxuXG4gICAgdmFyIHdpZHRoID0gKCk9PiB7XG4gICAgXHRyZXR1cm4gc2NvcGUuZWwudmlkZW9XaWR0aFxuICAgIH1cblxuICAgIHZhciBoZWlnaHQgPSAoKT0+IHtcbiAgICBcdHJldHVybiBzY29wZS5lbC52aWRlb0hlaWdodFx0XG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICBcdGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgIH1cblxuXHR2YXIgYWRkVG8gPSAocCk9PiB7XG5cdFx0c2NvcGUucGFyZW50ID0gcFxuXHRcdGRvbS50cmVlLmFkZChzY29wZS5wYXJlbnQsIHZpZGVvKVxuXHR9XG5cblx0dmFyIG9uID0gKGV2ZW50LCBjYik9PiB7XG5cdFx0ZUxpc3RlbmVycy5wdXNoKHtldmVudDpldmVudCwgY2I6Y2J9KVxuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIG9mZiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHRcdFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdFx0XHRpZihlLmV2ZW50ID09IGV2ZW50ICYmIGUuY2IgPT0gY2IpIHtcblx0XHRcdFx0ZUxpc3RlbmVycy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG5cdH1cblxuXHR2YXIgY2xlYXJBbGxFdmVudHMgPSAoKT0+IHtcblx0ICAgIGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHQgICAgXHR2YXIgZSA9IGVMaXN0ZW5lcnNbaV1cblx0ICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLmV2ZW50LCBlLmNiKTtcblx0ICAgIH1cblx0ICAgIGVMaXN0ZW5lcnMubGVuZ3RoID0gMFxuXHQgICAgZUxpc3RlbmVycyA9IG51bGxcblx0fVxuXG5cdHZhciBjbGVhciA9ICgpPT4ge1xuICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblx0ICAgIHNjb3BlLmNsZWFyQWxsRXZlbnRzKClcblx0ICAgIHNpemUgPSBudWxsXG5cdCAgICB2aWRlbyA9IG51bGxcbiAgICB9XG5cbiAgICB2YXIgYWRkU291cmNlVG9WaWRlbyA9IChlbGVtZW50LCBzcmMsIHR5cGUpPT4ge1xuXHQgICAgdmFyIHNvdXJjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuXHQgICAgc291cmNlLnNyYyA9IHNyYztcblx0ICAgIHNvdXJjZS50eXBlID0gdHlwZTtcblx0ICAgIGRvbS50cmVlLmFkZChlbGVtZW50LCBzb3VyY2UpXG5cdH1cblx0XG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblxuXHRzY29wZSA9IHtcblx0XHRwYXJlbnQ6IHVuZGVmaW5lZCxcblx0XHRlbDogdmlkZW8sXG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHNlZWs6IHNlZWssXG5cdFx0cGF1c2U6IHBhdXNlLFxuXHRcdHZvbHVtZTogdm9sdW1lLFxuXHRcdGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZSxcblx0XHR3aWR0aDogd2lkdGgsXG5cdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0YWRkVG86IGFkZFRvLFxuXHRcdG9uOiBvbixcblx0XHRvZmY6IG9mZixcblx0XHRjbGVhcjogY2xlYXIsXG5cdFx0Y2xlYXJBbGxFdmVudHM6IGNsZWFyQWxsRXZlbnRzLFxuXHRcdGlzUGxheWluZzogcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2UsXG5cdFx0aXNMb2FkZWQ6IGZhbHNlLFxuXHRcdGxvYWQ6IChzcmMsIGNhbGxiYWNrKT0+IHtcblx0XHRcdG9uUmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrXG5cdFx0XHRhZGRTb3VyY2VUb1ZpZGVvKHZpZGVvLCBzcmMsICd2aWRlby9tcDQnKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGRhdGEpPT4ge1xuXHRcblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCdmb290ZXInLCBjb250YWluZXIpXG5cdHZhciBidXR0b25zID0gZG9tLnNlbGVjdC5hbGwoJ2xpJywgZWwpXG5cblx0dmFyIG9uQnRuQ2xpY2sgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxuXHRcdHZhciBpZCA9IHRhcmdldC5pZFxuXHRcdHZhciB1cmwgPSB1bmRlZmluZWQ7XG5cdFx0c3dpdGNoKGlkKSB7XG5cdFx0XHRjYXNlICdob21lJzpcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuRmVlZCgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdncmlkJzpcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuR3JpZCgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdjb20nOlxuXHRcdFx0XHR1cmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLydcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgJ2xhYic6XG5cdFx0XHRcdHVybCA9IGRhdGEubGFiVXJsXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdzaG9wJzpcblx0XHRcdFx0dXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdGlmKHVybCAhPSB1bmRlZmluZWQpIHdpbmRvdy5vcGVuKHVybCwnX2JsYW5rJylcblx0fVxuXG5cdHZhciBidG4sIGlcblx0Zm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRidG4gPSBidXR0b25zW2ldXG5cdFx0ZG9tLmV2ZW50Lm9uKGJ0biwgJ2NsaWNrJywgb25CdG5DbGljaylcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBidG5XID0gd2luZG93VyAvIGJ1dHRvbnMubGVuZ3RoXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYnRuID0gYnV0dG9uc1tpXVxuXHRcdFx0XHRidG4uc3R5bGUud2lkdGggPSBidG5XICsgJ3B4J1xuXHRcdFx0XHRidG4uc3R5bGUubGVmdCA9IGJ0blcgKiBpICsgXCJweFwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkaXB0eXF1ZVBhcnQgZnJvbSAnZGlwdHlxdWUtcGFydCdcbmltcG9ydCBjaGFyYWN0ZXIgZnJvbSAnY2hhcmFjdGVyJ1xuaW1wb3J0IGZ1bkZhY3QgZnJvbSAnZnVuLWZhY3QtaG9sZGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBhcnJvd3NXcmFwcGVyIGZyb20gJ2Fycm93cy13cmFwcGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IHNlbGZpZVN0aWNrIGZyb20gJ3NlbGZpZS1zdGljaydcbmltcG9ydCBtYWluQnRucyBmcm9tICdtYWluLWRpcHR5cXVlLWJ0bnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcHR5cXVlIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cblx0XHR2YXIgbmV4dERpcHR5cXVlID0gQXBwU3RvcmUuZ2V0TmV4dERpcHR5cXVlKClcblx0XHR2YXIgcHJldmlvdXNEaXB0eXF1ZSA9IEFwcFN0b3JlLmdldFByZXZpb3VzRGlwdHlxdWUoKVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcGFnZSddID0gbmV4dERpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcGFnZSddID0gcHJldmlvdXNEaXB0eXF1ZVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gobmV4dERpcHR5cXVlKVxuXHRcdHByb3BzLmRhdGFbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gPSBBcHBTdG9yZS5nZXRQcmV2aWV3VXJsQnlIYXNoKHByZXZpb3VzRGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsnZmFjdC10eHQnXSA9IHByb3BzLmRhdGEuZmFjdFsnZW4nXVxuXG5cdFx0c3VwZXIocHJvcHMpXG5cblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkFycm93TW91c2VFbnRlciA9IHRoaXMub25BcnJvd01vdXNlRW50ZXIuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlTGVhdmUgPSB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlLmJpbmQodGhpcylcblx0XHR0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkID0gdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyID0gdGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyLmJpbmQodGhpcylcblx0XHR0aGlzLm9uT3BlbkZhY3QgPSB0aGlzLm9uT3BlbkZhY3QuYmluZCh0aGlzKVxuXHRcdHRoaXMub25DbG9zZUZhY3QgPSB0aGlzLm9uQ2xvc2VGYWN0LmJpbmQodGhpcylcblx0XHR0aGlzLnVpVHJhbnNpdGlvbkluQ29tcGxldGVkID0gdGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZC5iaW5kKHRoaXMpXG5cblx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IGZhbHNlXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuT1BFTl9GVU5fRkFDVCwgdGhpcy5vbk9wZW5GYWN0KVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DTE9TRV9GVU5fRkFDVCwgdGhpcy5vbkNsb3NlRmFjdClcblxuXHRcdHRoaXMudWlJblRsID0gbmV3IFRpbWVsaW5lTWF4KClcblxuXHRcdHRoaXMubW91c2UgPSBuZXcgUElYSS5Qb2ludCgpXG5cdFx0dGhpcy5tb3VzZS5uWCA9IHRoaXMubW91c2UublkgPSAwXG5cblx0XHR0aGlzLmxlZnRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdzaG9lLWJnJylcblx0XHQpXG5cdFx0dGhpcy5yaWdodFBhcnQgPSBkaXB0eXF1ZVBhcnQoXG5cdFx0XHR0aGlzLnB4Q29udGFpbmVyLFxuXHRcdFx0dGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3Rlci1iZycpXG5cdFx0KVxuXG5cdFx0dmFyIGltZ0V4dCA9IEFwcFN0b3JlLmdldEltYWdlRGV2aWNlRXh0ZW5zaW9uKClcblxuXHRcdHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3RlcicraW1nRXh0KSwgdGhpcy5nZXRJbWFnZVNpemVCeUlkKCdjaGFyYWN0ZXInK2ltZ0V4dCkpXG5cdFx0dGhpcy5mdW5GYWN0ID0gZnVuRmFjdCh0aGlzLnB4Q29udGFpbmVyLCB0aGlzLmVsZW1lbnQsIHRoaXMubW91c2UsIHRoaXMucHJvcHMuZGF0YSwgdGhpcy5wcm9wcylcblx0XHR0aGlzLmFycm93c1dyYXBwZXIgPSBhcnJvd3NXcmFwcGVyKHRoaXMuZWxlbWVudCwgdGhpcy5vbkFycm93TW91c2VFbnRlciwgdGhpcy5vbkFycm93TW91c2VMZWF2ZSlcblx0XHR0aGlzLnNlbGZpZVN0aWNrID0gc2VsZmllU3RpY2sodGhpcy5lbGVtZW50LCB0aGlzLm1vdXNlLCB0aGlzLnByb3BzLmRhdGEpXG5cdFx0dGhpcy5tYWluQnRucyA9IG1haW5CdG5zKHRoaXMuZWxlbWVudCwgdGhpcy5wcm9wcy5kYXRhLCB0aGlzLm1vdXNlLCB0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIpXG5cblx0XHRkb20uZXZlbnQub24odGhpcy5zZWxmaWVTdGljay5lbCwgJ2NsaWNrJywgdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZClcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblxuXHRcdFR3ZWVuTWF4LnNldCh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZCgnbGVmdCcpLCB7IHg6LUFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkcgfSlcblx0XHRUd2Vlbk1heC5zZXQodGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoJ3JpZ2h0JyksIHsgeDpBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HIH0pXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHR0aGlzLnVwZGF0ZVRpbWVsaW5lcygpXG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHR1cGRhdGVUaW1lbGluZXMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZS54IC0gMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC40KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZSwgMSwgeyB4OiB0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS54ICsgMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNClcblxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5hcnJvd3NXcmFwcGVyLmxlZnQsIDAuNSwgeyB4OiAtMTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLmFycm93c1dyYXBwZXIucmlnaHQsIDAuNSwgeyB4OiAxMDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMuc2VsZmllU3RpY2suZWwsIDAuNSwgeyB5OiA1MDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0dGhpcy50bE91dC50byh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHRcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuYXJyb3dzV3JhcHBlci5sZWZ0LCAxLCB7IHg6IC0xMDAsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5hcnJvd3NXcmFwcGVyLnJpZ2h0LCAxLCB7IHg6IDEwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLnNlbGZpZVN0aWNrLmVsLCAxLCB7IHk6IDUwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy51aUluVGwucGF1c2UoMClcblx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLnVpVHJhbnNpdGlvbkluQ29tcGxldGVkKTtcblx0fVxuXHR1aVRyYW5zaXRpb25JbkNvbXBsZXRlZCgpIHtcblx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sudHJhbnNpdGlvbkluQ29tcGxldGVkKClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRydWVcblx0XHR0aGlzLnVpSW5UbC50aW1lU2NhbGUoMS42KS5wbGF5KClcdFx0XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdG9uTW91c2VNb3ZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMubW91c2UueCA9IGUuY2xpZW50WFxuXHRcdHRoaXMubW91c2UueSA9IGUuY2xpZW50WVxuXHRcdHRoaXMubW91c2UublggPSAoZS5jbGllbnRYIC8gd2luZG93VykgKiAxXG5cdFx0dGhpcy5tb3VzZS5uWSA9IChlLmNsaWVudFkgLyB3aW5kb3dIKSAqIDFcblx0fVxuXHRvblNlbGZpZVN0aWNrQ2xpY2tlZChlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0aWYodGhpcy5zZWxmaWVTdGljay5pc09wZW5lZCkge1xuXHRcdFx0dGhpcy5zZWxmaWVTdGljay5jbG9zZSgpXG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLnNlbGZpZVN0aWNrLm9wZW4oKVxuXHRcdFx0dGhpcy5tYWluQnRucy5hY3RpdmF0ZSgpXG5cdFx0fVxuXHR9XG5cdG9uQXJyb3dNb3VzZUVudGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblxuXHRcdHZhciBwb3NYO1xuXHRcdHZhciBvZmZzZXRYID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXHRcdGlmKGlkID09ICdsZWZ0JykgcG9zWCA9IG9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSAtb2Zmc2V0WFxuXG5cdFx0VHdlZW5NYXgudG8odGhpcy5weENvbnRhaW5lciwgMC40LCB7IHg6cG9zWCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC40LCB7IHg6MCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm92ZXIoaWQpXG5cdH1cblx0b25BcnJvd01vdXNlTGVhdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gLW9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSBvZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjYsIHsgeDowLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC42LCB7IHg6cG9zWCwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5vdXQoaWQpXG5cdH1cblx0b25NYWluQnRuc0V2ZW50SGFuZGxlcihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHR5cGUgPSBlLnR5cGVcblx0XHR2YXIgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0XG5cdFx0dmFyIGlkID0gdGFyZ2V0LmlkXG5cdFx0aWYodHlwZSA9PSAnY2xpY2snICYmIGlkID09ICdmdW4tZmFjdC1idG4nKSB7XG5cdFx0XHRpZih0aGlzLmZ1bkZhY3QuaXNPcGVuKSB7XG5cdFx0XHRcdEFwcEFjdGlvbnMuY2xvc2VGdW5GYWN0KClcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRBcHBBY3Rpb25zLm9wZW5GdW5GYWN0KClcblx0XHRcdH1cblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdtb3VzZWVudGVyJykge1xuXHRcdFx0dGhpcy5tYWluQnRucy5vdmVyKGlkKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ21vdXNlbGVhdmUnKSB7XG5cdFx0XHR0aGlzLm1haW5CdG5zLm91dChpZClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdjbGljaycgJiYgaWQgPT0gJ3Nob3AtYnRuJykge1xuXHRcdFx0d2luZG93Lm9wZW4odGhpcy5wcm9wcy5kYXRhWydzaG9wLXVybCddLCAnX2JsYW5rJylcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxuXHRvbk9wZW5GYWN0KCl7XG5cdFx0dGhpcy5mdW5GYWN0Lm9wZW4oKVxuXHRcdHRoaXMubWFpbkJ0bnMuZGlzYWN0aXZhdGUoKVxuXHR9XG5cdG9uQ2xvc2VGYWN0KCl7XG5cdFx0dGhpcy5mdW5GYWN0LmNsb3NlKClcblx0XHR0aGlzLm1haW5CdG5zLmFjdGl2YXRlKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5jaGFyYWN0ZXIudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5sZWZ0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnJpZ2h0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnVwZGF0ZSgpXG5cdFx0dGhpcy5mdW5GYWN0LnVwZGF0ZSgpXG5cdFx0dGhpcy5tYWluQnRucy51cGRhdGUoKVxuXG5cdFx0c3VwZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdGlmKHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkKSB7XG5cdFx0XHR0aGlzLnRsSW4uY2xlYXIoKVxuXHRcdFx0dGhpcy50bE91dC5jbGVhcigpXG5cdFx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdFx0dGhpcy51cGRhdGVUaW1lbGluZXMoKVxuXHRcdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHRcdFx0dGhpcy50bEluLnBhdXNlKHRoaXMudGxJbi50b3RhbER1cmF0aW9uKCkpXG5cdFx0XHR0aGlzLnVpSW5UbC5wYXVzZSh0aGlzLnVpSW5UbC50b3RhbER1cmF0aW9uKCkpXG5cdFx0fVxuXG5cdFx0dGhpcy5sZWZ0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5jaGFyYWN0ZXIucmVzaXplKClcblx0XHR0aGlzLmZ1bkZhY3QucmVzaXplKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIucmVzaXplKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYWluQnRucy5yZXNpemUoKVxuXG5cdFx0dGhpcy5yaWdodFBhcnQuaG9sZGVyLnggPSAod2luZG93VyA+PiAxKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLkNMT1NFX0ZVTl9GQUNULCB0aGlzLm9uQ2xvc2VGYWN0KVxuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblx0XHRkb20uZXZlbnQub2ZmKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHR0aGlzLnVpSW5UbC5jbGVhcigpXG5cdFx0dGhpcy5sZWZ0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5yaWdodFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMuY2hhcmFjdGVyLmNsZWFyKClcblx0XHR0aGlzLmZ1bkZhY3QuY2xlYXIoKVxuXHRcdHRoaXMuc2VsZmllU3RpY2suY2xlYXIoKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5jbGVhcigpXG5cdFx0dGhpcy5tYWluQnRucy5jbGVhcigpXG5cdFx0dGhpcy51aUluVGwgPSBudWxsXG5cdFx0dGhpcy5tb3VzZSA9IG51bGxcblx0XHR0aGlzLmxlZnRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gbnVsbFxuXHRcdHRoaXMuY2hhcmFjdGVyID0gbnVsbFxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IG51bGxcblx0XHR0aGlzLm1haW5CdG5zID0gbnVsbFxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGJvdHRvbVRleHRzIGZyb20gJ2JvdHRvbS10ZXh0cy1ob21lJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZ3JpZCBmcm9tICdncmlkLWhvbWUnXG5pbXBvcnQgaW1hZ2VDYW52YXNlc0dyaWQgZnJvbSAnaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZCdcbmltcG9ydCBhcm91bmRCb3JkZXIgZnJvbSAnYXJvdW5kLWJvcmRlci1ob21lJ1xuaW1wb3J0IG1hcCBmcm9tICdtYWluLW1hcCdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgZ3JpZFBvc2l0aW9ucyBmcm9tICdncmlkLXBvc2l0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9tZSBleHRlbmRzIFBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHZhciBjb250ZW50ID0gQXBwU3RvcmUucGFnZUNvbnRlbnQoKVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0dmFyIHRleHRzID0gY29udGVudC50ZXh0c1tBcHBTdG9yZS5sYW5nKCldXG5cdFx0cHJvcHMuZGF0YS5mYWNlYm9va1VybCA9IGdlbmVyYUluZm9zWydmYWNlYm9va191cmwnXVxuXHRcdHByb3BzLmRhdGEudHdpdHRlclVybCA9IGdlbmVyYUluZm9zWyd0d2l0dGVyX3VybCddXG5cdFx0cHJvcHMuZGF0YS5pbnN0YWdyYW1VcmwgPSBnZW5lcmFJbmZvc1snaW5zdGFncmFtX3VybCddXG5cdFx0cHJvcHMuZGF0YS5ncmlkID0gW11cblx0XHRwcm9wcy5kYXRhLmdyaWQubGVuZ3RoID0gMjhcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10gPSB7IGhvcml6b250YWw6IFtdLCB2ZXJ0aWNhbDogW10gfVxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS5ob3Jpem9udGFsLmxlbmd0aCA9IDNcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10udmVydGljYWwubGVuZ3RoID0gNlxuXHRcdHByb3BzLmRhdGFbJ2dlbmVyaWMnXSA9IHRleHRzLmdlbmVyaWNcblx0XHRwcm9wcy5kYXRhWydkZWlhLXR4dCddID0gdGV4dHNbJ2RlaWEnXVxuXHRcdHByb3BzLmRhdGFbJ2FyZWxsdWYtdHh0J10gPSB0ZXh0c1snYXJlbGx1ZiddXG5cdFx0cHJvcHMuZGF0YVsnZXMtdHJlbmMtdHh0J10gPSB0ZXh0c1snZXMtdHJlbmMnXVxuXG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dmFyIGJnVXJsID0gdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2JhY2tncm91bmQnKVxuXHRcdHRoaXMucHJvcHMuZGF0YS5iZ3VybCA9IGJnVXJsXG5cblx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtID0gdGhpcy50cmlnZ2VyTmV3SXRlbS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkl0ZW1FbmRlZCA9IHRoaXMub25JdGVtRW5kZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcylcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxhc3RHcmlkSXRlbUluZGV4O1xuXHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA9IDIwMFxuXHRcdHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA9IDBcblxuXHRcdHRoaXMubW91c2UgPSBuZXcgUElYSS5Qb2ludCgpXG5cdFx0dGhpcy5tb3VzZS5uWCA9IHRoaXMubW91c2UublkgPSAwXG5cblx0XHR0aGlzLnNlYXRzID0gW1xuXHRcdFx0MSwgMywgNSxcblx0XHRcdDcsIDksIDExLFxuXHRcdFx0MTUsIDE3LFxuXHRcdFx0MjEsIDIzLCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdHRoaXMuaW1nQ0dyaWQgPSBpbWFnZUNhbnZhc2VzR3JpZCh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5pbWdDR3JpZC5sb2FkKHRoaXMucHJvcHMuZGF0YS5iZ3VybClcblx0XHR0aGlzLmdyaWQgPSBncmlkKHRoaXMucHJvcHMsIHRoaXMuZWxlbWVudCwgdGhpcy5vbkl0ZW1FbmRlZClcblx0XHR0aGlzLmdyaWQuaW5pdCgpXG5cdFx0dGhpcy5ib3R0b21UZXh0cyA9IGJvdHRvbVRleHRzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IGFyb3VuZEJvcmRlcih0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpXG5cblx0XHRkb20uZXZlbnQub24od2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5hcm91bmRCb3JkZXIuZWwsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5hcm91bmRCb3JkZXIubGV0dGVycywgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmltZ0NHcmlkLmVsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxJbi5zdGFnZ2VyRnJvbSh0aGlzLmdyaWQuY2hpbGRyZW4sIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMDEsIDAuMSlcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmxpbmVzLmhvcml6b250YWwsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMDEsIDAuMilcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmxpbmVzLnZlcnRpY2FsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjIpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5ib3R0b21UZXh0cy5lbCwgMSwgeyB4OndpbmRvd1cgKiAwLjQsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjQpXG5cblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHRoaXMuYm90dG9tVGV4dHMub3BlblR4dEJ5SWQoJ2dlbmVyaWMnKVxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLmFkZCh0aGlzLm1hcC5lbCwgJ2dyZWVuLW1vZGUnKSwgMTAwMClcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbkluKClcblx0fVxuXHR0cmlnZ2VyTmV3SXRlbSh0eXBlKSB7XG5cdFx0dmFyIGluZGV4ID0gdGhpcy5zZWF0c1tVdGlscy5SYW5kKDAsIHRoaXMuc2VhdHMubGVuZ3RoIC0gMSwgMCldXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVzZWRTZWF0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHNlYXQgPSB0aGlzLnVzZWRTZWF0c1tpXVxuXHRcdFx0aWYoc2VhdCA9PSBpbmRleCkge1xuXHRcdFx0XHRpZih0aGlzLnVzZWRTZWF0cy5sZW5ndGggPCB0aGlzLnNlYXRzLmxlbmd0aCAtIDIpIHRoaXMudHJpZ2dlck5ld0l0ZW0odHlwZSlcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLnVzZWRTZWF0cy5wdXNoKGluZGV4KVxuXHRcdHRoaXMuZ3JpZC50cmFuc2l0aW9uSW5JdGVtKGluZGV4LCB0eXBlKVxuXHR9XG5cdG9uSXRlbUVuZGVkKGl0ZW0pIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdXNlZFNlYXQgPSB0aGlzLnVzZWRTZWF0c1tpXVxuXHRcdFx0aWYodXNlZFNlYXQgPT0gaXRlbS5zZWF0KSB7XG5cdFx0XHRcdHRoaXMudXNlZFNlYXRzLnNwbGljZShpLCAxKVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblx0b25Nb3VzZU1vdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5tb3VzZS54ID0gZS5jbGllbnRYXG5cdFx0dGhpcy5tb3VzZS55ID0gZS5jbGllbnRZXG5cdFx0dGhpcy5tb3VzZS5uWCA9IChlLmNsaWVudFggLyB3aW5kb3dXKSAqIDFcblx0XHR0aGlzLm1vdXNlLm5ZID0gKGUuY2xpZW50WSAvIHdpbmRvd0gpICogMVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQpIHJldHVyblxuXHRcdC8vIHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0Ly8gaWYodGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID4gODAwKSB7XG5cdFx0Ly8gXHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0Ly8gXHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX1ZJREVPKVxuXHRcdC8vIH1cblx0XHQvLyB0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdC8vIGlmKHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA+IDMwKSB7XG5cdFx0Ly8gXHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0Ly8gXHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX0lNQUdFKVxuXHRcdC8vIH1cblx0XHR0aGlzLmltZ0NHcmlkLnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHN1cGVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XG5cdFx0dmFyIGdHcmlkID0gZ3JpZFBvc2l0aW9ucyh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TLCBBcHBDb25zdGFudHMuR1JJRF9ST1dTLCAnY29sc19yb3dzJylcblxuXHRcdHRoaXMuZ3JpZC5yZXNpemUoZ0dyaWQpXG5cdFx0dGhpcy5pbWdDR3JpZC5yZXNpemUoZ0dyaWQpXG5cdFx0dGhpcy5ib3R0b21UZXh0cy5yZXNpemUoKVxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYXAucmVzaXplKClcblxuXHRcdHZhciByZXNpemVWYXJzQmcgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVywgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUodGhpcy5tYXAuZWwsICdncmVlbi1tb2RlJylcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHR0aGlzLmFyb3VuZEJvcmRlci5jbGVhcigpXG5cdFx0dGhpcy5ncmlkLmNsZWFyKClcblx0XHR0aGlzLm1hcC5jbGVhcigpXG5cdFx0dGhpcy5ib3R0b21UZXh0cy5jbGVhcigpXG5cblx0XHR0aGlzLmdyaWQgPSBudWxsXG5cdFx0dGhpcy5ib3R0b21UZXh0cyA9IG51bGxcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IG51bGxcblx0XHR0aGlzLm1hcCA9IG51bGxcblxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGltZyBmcm9tICdpbWcnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcbmltcG9ydCBjb2xvclV0aWxzIGZyb20gJ2NvbG9yLXV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBtb3VzZSwgZGF0YSk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBzY3JlZW5Ib2xkZXJTaXplID0gWzAsIDBdLCB2aWRlb0hvbGRlclNpemUgPSBbMCwgMF0sIGNvbG9yaWZpZXJTaXplID0gWzAsIDBdLCB0b3BPZmZzZXQgPSAwO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuc2VsZmllLXN0aWNrLXdyYXBwZXInLCBob2xkZXIpXG5cdHZhciBiYWNrZ3JvdW5kID0gZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCBlbClcblx0dmFyIHNjcmVlbldyYXBwZXIgPSBkb20uc2VsZWN0KCcuc2NyZWVuLXdyYXBwZXInLCBlbClcblx0dmFyIHNjcmVlbkhvbGRlciA9IGRvbS5zZWxlY3QoJy5zY3JlZW4taG9sZGVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIHZpZGVvSG9sZGVyID0gZG9tLnNlbGVjdCgnLnZpZGVvLWhvbGRlcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciBjb2xvcmlmaWVyID0gZG9tLnNlbGVjdCgnLmNvbG9yaWZpZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgY29sb3JpZmllclN2Z1BhdGggPSBkb20uc2VsZWN0KCdzdmcgcGF0aCcsIGNvbG9yaWZpZXIpXG5cdHZhciBzZWxmaWVTdGlja1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuc2VsZmllLXN0aWNrLXdyYXBwZXInLCBlbClcblx0dmFyIHNwcmluZ1RvID0gVXRpbHMuU3ByaW5nVG9cblx0dmFyIHRyYW5zbGF0ZSA9IFV0aWxzLlRyYW5zbGF0ZVxuXHR2YXIgdHdlZW5Jbjtcblx0dmFyIGFuaW1hdGlvbiA9IHtcblx0XHRwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdGZwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdGlwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdHZlbG9jaXR5OiB7eDogMCwgeTogMH0sXG5cdFx0cm90YXRpb246IDAsXG5cdFx0Y29uZmlnOiB7XG5cdFx0XHRsZW5ndGg6IDQwMCxcblx0XHRcdHNwcmluZzogMC40LFxuXHRcdFx0ZnJpY3Rpb246IDAuN1xuXHRcdH1cblx0fVxuXG5cdFR3ZWVuTWF4LnNldChlbCwgeyByb3RhdGlvbjogJy0xZGVnJywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScgfSlcblxuXHQvLyBjaGVjayBpZiBtaXgtYmxlbmQtbW9kZSBpcyBhdmFpbGFibGVcblx0aWYgKCdtaXgtYmxlbmQtbW9kZScgaW4gY29sb3JpZmllci5zdHlsZSkge1xuXHRcdC8vIGNoZWNrIGlmIHNhZmFyaSBiZWNhdXNlIGNvbG9yIGZpbHRlciBpc24ndCB3b3JraW5nIG9uIGl0XG5cdFx0aWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNTYWZhcmkpIHtcblx0XHRcdGNvbG9yaWZpZXIuc3R5bGVbJ21peC1ibGVuZC1tb2RlJ10gPSAnbXVsdGlwbHknXG5cdFx0fWVsc2V7XG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlWydtaXgtYmxlbmQtbW9kZSddID0gJ2NvbG9yJ1xuXHRcdH1cblx0fWVsc2V7XG5cdFx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ29wYWNpdHknXSA9IDAuOFxuXHR9XG5cdFxuXHR2YXIgYyA9IGRhdGFbJ2FtYmllbnQtY29sb3InXVsnc2VsZmllLXN0aWNrJ11cblx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ2ZpbGwnXSA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoYy5oLCBjLnMsIGMudilcblxuXHR2YXIgb25WaWRlb0VuZGVkID0gKCk9PiB7XG5cdFx0c2NvcGUuY2xvc2UoKVxuXHR9XG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHRtVmlkZW8uYWRkVG8odmlkZW9Ib2xkZXIpXG5cdG1WaWRlby5vbignZW5kZWQnLCBvblZpZGVvRW5kZWQpXG5cdHZhciB2aWRlb1NyYyA9IGRhdGFbJ3NlbGZpZS1zdGljay12aWRlby11cmwnXVxuXG5cdHZhciBzdGlja0ltZyA9IGltZyhBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2Uvc2VsZmllc3RpY2sucG5nJywgKCk9PiB7XG5cdFx0ZG9tLnRyZWUuYWRkKHNjcmVlbkhvbGRlciwgc3RpY2tJbWcpXG5cblx0XHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0XHRpZih0d2VlbkluICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRcdHR3ZWVuSW4ucGxheSgpXG5cdFx0XHR9XG5cdFx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdFx0c2NvcGUucmVzaXplKClcblx0XHR9KVxuXHR9KVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRpc09wZW5lZDogZmFsc2UsXG5cdFx0b3BlbjogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDEwMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC45LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuNVxuXHRcdFx0bVZpZGVvLnBsYXkoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSB0cnVlXG5cdFx0fSxcblx0XHRjbG9zZTogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDAsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLnNwcmluZyA9IDAuNixcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuZnJpY3Rpb24gPSAwLjdcblx0XHRcdG1WaWRlby5wYXVzZSgwKVxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbidcblx0XHRcdHNjb3BlLmlzT3BlbmVkID0gZmFsc2Vcblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cblx0XHRcdGlmKHNjb3BlLmlzT3BlbmVkKSB7XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnkgLSAoc2NyZWVuSG9sZGVyU2l6ZVsxXSAqIDAuOClcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiA4MFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDMwXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDIwXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSAtPSAobW91c2UublkgLSAwLjUpICogMjBcblx0XHRcdH1cblxuXHRcdFx0c3ByaW5nVG8oYW5pbWF0aW9uLCBhbmltYXRpb24uZnBvc2l0aW9uLCAxKVxuXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCArPSAoYW5pbWF0aW9uLmZwb3NpdGlvbi54IC0gYW5pbWF0aW9uLnBvc2l0aW9uLngpICogMC4xXG5cblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbWF0aW9uLmNvbmZpZy5sZW5ndGgpICogMC4wNVxuXG5cdFx0XHR0cmFuc2xhdGUoc2NyZWVuV3JhcHBlciwgYW5pbWF0aW9uLnBvc2l0aW9uLngsIGFuaW1hdGlvbi5wb3NpdGlvbi55ICsgYW5pbWF0aW9uLnZlbG9jaXR5LnksIDEpXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0Y29sb3JpZmllclNpemUgPSBkb20uc2l6ZShjb2xvcmlmaWVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtIChjb2xvcmlmaWVyU2l6ZVswXSAqIDAuNTgpICsgJ3B4J1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZS50b3AgPSAtMC43ICsgJ3B4J1xuXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnggPSAod2luZG93VyA+PiAxKSAtIChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnkgPSB3aW5kb3dIIC0gKHZpZGVvSG9sZGVyU2l6ZVsxXSAqIDAuMzUpXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblxuXHRcdFx0aWYoZWwuc3R5bGUub3BhY2l0eSAhPSAxKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCk9PiB7IGVsLnN0eWxlLm9wYWNpdHkgPSAxIH0sIDUwMClcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRyYW5zaXRpb25JbkNvbXBsZXRlZDogKCk9PiB7XG5cdFx0XHRpZighaXNSZWFkeSkge1xuXHRcdFx0XHR0d2VlbkluID0gVHdlZW5NYXguZnJvbShlbCwgMC42LCB7IHk6IDUwMCwgcGF1c2VkOnRydWUsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdG1WaWRlby5jbGVhcigpXG5cdFx0XHRtVmlkZW8gPSBudWxsXG5cdFx0XHRhbmltYXRpb24gPSBudWxsXG5cdFx0XHR0d2VlbkluID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHNjb3BlLmNsb3NlKClcblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIHNvY2lhbExpbmtzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgd3JhcHBlciA9IGRvbS5zZWxlY3QoXCIjZm9vdGVyICNzb2NpYWwtd3JhcHBlclwiLCBwYXJlbnQpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBwYWRkaW5nID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC40XG5cblx0XHRcdHZhciB3cmFwcGVyU2l6ZSA9IGRvbS5zaXplKHdyYXBwZXIpXG5cblx0XHRcdHZhciBzb2NpYWxDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSBwYWRkaW5nIC0gd3JhcHBlclNpemVbMF0sXG5cdFx0XHRcdHRvcDogd2luZG93SCAtIHBhZGRpbmcgLSB3cmFwcGVyU2l6ZVsxXSxcblx0XHRcdH1cblxuXHRcdFx0d3JhcHBlci5zdHlsZS5sZWZ0ID0gc29jaWFsQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHR3cmFwcGVyLnN0eWxlLnRvcCA9IHNvY2lhbENzcy50b3AgKyAncHgnXG5cdFx0fSxcblx0XHRzaG93OiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLnJlbW92ZSh3cmFwcGVyLCAnaGlkZScpLCAxMDAwKVxuXHRcdH0sXG5cdFx0aGlkZTogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5hZGQod3JhcHBlciwgJ2hpZGUnKSwgNTAwKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxMaW5rcyIsImltcG9ydCBUZXh0QnRuVGVtcGxhdGUgZnJvbSAnVGV4dEJ0bl9oYnMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgdGl0bGUgPSBjb250YWluZXIuaW5uZXJIVE1MLnRvVXBwZXJDYXNlKClcblx0dmFyIGJ0blNjb3BlID0geyB0aXRsZTogdGl0bGUgfVxuXHR2YXIgdGVtcGxhdGUgPSBUZXh0QnRuVGVtcGxhdGUoYnRuU2NvcGUpXG5cdGNvbnRhaW5lci5pbm5lckhUTUwgPSB0ZW1wbGF0ZVxuXHR2YXIgdGV4dFRpdGxlID0gZG9tLnNlbGVjdCgnLnRleHQtdGl0bGUnLCBjb250YWluZXIpXG5cdHZhciBzaXplID0gZG9tLnNpemUodGV4dFRpdGxlKVxuXHR2YXIgY3VycmVudFRsLCB0bExlZnQsIHRsUmlnaHQ7XG5cdHZhciByZWN0Q29udGFpbmVycyA9IGRvbS5zZWxlY3QuYWxsKCcucmVjdHMtY29udGFpbmVyJywgY29udGFpbmVyKVxuXHR2YXIgYmdMaW5lc0xlZnQgPSBkb20uc2VsZWN0LmFsbCgnLmJnLWxpbmUnLCByZWN0Q29udGFpbmVyc1swXSlcblx0dmFyIGJnQm94TGVmdCA9IGRvbS5zZWxlY3QoJy5iZy1ib3gnLCByZWN0Q29udGFpbmVyc1swXSlcblx0dmFyIGJnTGluZXNSaWdodCA9IGRvbS5zZWxlY3QuYWxsKCcuYmctbGluZScsIHJlY3RDb250YWluZXJzWzFdKVxuXHR2YXIgYmdCb3hSaWdodCA9IGRvbS5zZWxlY3QoJy5iZy1ib3gnLCByZWN0Q29udGFpbmVyc1sxXSlcblx0XG5cdHZhciB0d2VlbkluID0gKGRpcmVjdGlvbik9PiB7XG5cdFx0aWYoZGlyZWN0aW9uID09IEFwcENvbnN0YW50cy5MRUZUKSB7XG5cdFx0XHRjdXJyZW50VGwgPSB0bExlZnRcblx0XHRcdHRsTGVmdC50aW1lU2NhbGUoMikudHdlZW5Gcm9tVG8oMCwgJ2luJylcblx0XHR9ZWxzZXtcdFxuXHRcdFx0Y3VycmVudFRsID0gdGxSaWdodFxuXHRcdFx0dGxSaWdodC50aW1lU2NhbGUoMikudHdlZW5Gcm9tVG8oMCwgJ2luJylcblx0XHR9XG5cdH1cblx0dmFyIHR3ZWVuT3V0ID0gKCk9PiB7XG5cdFx0Y3VycmVudFRsLnRpbWVTY2FsZSgyLjYpLnR3ZWVuVG8oJ291dCcpXG5cdH1cblxuXHR2YXIgbW91c2VFbnRlciA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgcmVjdCA9IGUuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHR2YXIgeE1vdXNlUG9zID0gZS5jbGllbnRYXG5cdFx0dmFyIHhQb3MgPSB4TW91c2VQb3MgLSByZWN0LmxlZnRcblx0XHR2YXIgdyA9IHJlY3QucmlnaHQgLSByZWN0LmxlZnRcblx0XHRpZih4UG9zID4gdyAvIDIpIHtcblx0XHRcdHR3ZWVuSW4oQXBwQ29uc3RhbnRzLlJJR0hUKVxuXHRcdH1lbHNle1xuXHRcdFx0dHdlZW5JbihBcHBDb25zdGFudHMuTEVGVClcblx0XHR9XG5cdH1cblx0dmFyIG1vdXNlTGVhdmUgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dHdlZW5PdXQoKVxuXHR9XG5cblx0ZG9tLmV2ZW50Lm9uKGNvbnRhaW5lciwgJ21vdXNlZW50ZXInLCBtb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oY29udGFpbmVyLCAnbW91c2VsZWF2ZScsIG1vdXNlTGVhdmUpXG5cblx0dmFyIG9mZnNldFggPSAyNlxuXHR0bExlZnQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR0bExlZnQuZnJvbVRvKGJnTGluZXNMZWZ0WzBdLCAxLCB7IHNjYWxlWDowLCB0cmFuc2Zvcm1PcmlnaW46JzAlIDUwJScgfSwgeyBzY2FsZVg6MSwgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdHRsTGVmdC5mcm9tVG8oYmdCb3hMZWZ0LCAxLCB7IHNjYWxlWDowLCB0cmFuc2Zvcm1PcmlnaW46JzAlIDUwJScgfSwgeyBzY2FsZVg6MSwgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuMilcblx0dGxMZWZ0LmZyb21UbyhiZ0xpbmVzTGVmdFsxXSwgMSwgeyBzY2FsZVg6MCwgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjQpXG5cdHRsTGVmdC50byhiZ0xpbmVzTGVmdFswXSwgMSwgeyB4OicxMDAlJywgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuNSlcblx0dGxMZWZ0LnRvKGJnQm94TGVmdCwgMSwgeyB4OicxMDAlJywgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuNilcblx0dGxMZWZ0LmFkZExhYmVsKCdpbicpXG5cdHRsTGVmdC50byhiZ0xpbmVzTGVmdFsxXSwgMSwgeyB4OicxMDAlJywgdHJhbnNmb3JtT3JpZ2luOicwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sICdpbicpXG5cdHRsTGVmdC5hZGRMYWJlbCgnb3V0Jylcblx0dGxMZWZ0LnBhdXNlKDApXG5cblx0dGxSaWdodCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdHRsUmlnaHQuZnJvbVRvKGJnTGluZXNSaWdodFswXSwgMSwgeyBzY2FsZVg6MCwgdHJhbnNmb3JtT3JpZ2luOicxMDAlIDUwJScgfSwgeyBzY2FsZVg6MSwgdHJhbnNmb3JtT3JpZ2luOicxMDAlIDUwJScsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0dGxSaWdodC5mcm9tVG8oYmdCb3hSaWdodCwgMSwgeyBzY2FsZVg6MCwgdHJhbnNmb3JtT3JpZ2luOicxMDAlIDUwJScgfSwgeyBzY2FsZVg6MSwgdHJhbnNmb3JtT3JpZ2luOicxMDAlIDUwJScsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC4yKVxuXHR0bFJpZ2h0LmZyb21UbyhiZ0xpbmVzUmlnaHRbMV0sIDEsIHsgc2NhbGVYOjAsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnIH0sIHsgc2NhbGVYOjEsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuNClcblx0dGxSaWdodC50byhiZ0xpbmVzUmlnaHRbMF0sIDEsIHsgeDonLTEwMCUnLCB0cmFuc2Zvcm1PcmlnaW46JzEwMCUgNTAlJywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjUpXG5cdHRsUmlnaHQudG8oYmdCb3hSaWdodCwgMSwgeyB4OictMTAwJScsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuNilcblx0dGxSaWdodC5hZGRMYWJlbCgnaW4nKVxuXHR0bFJpZ2h0LnRvKGJnTGluZXNSaWdodFsxXSwgMSwgeyB4OictMTAwJScsIHRyYW5zZm9ybU9yaWdpbjonMTAwJSA1MCUnLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sICdpbicpXG5cdHRsUmlnaHQuYWRkTGFiZWwoJ291dCcpXG5cdHRsUmlnaHQucGF1c2UoMClcblxuXHRzY29wZSA9IHtcblx0XHRzaXplOiBzaXplLFxuXHRcdGVsOiBjb250YWluZXIsXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGxMZWZ0LmNsZWFyKClcblx0XHRcdHRsUmlnaHQuY2xlYXIoKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihjb250YWluZXIsICdtb3VzZWVudGVyJywgbW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoY29udGFpbmVyLCAnbW91c2VsZWF2ZScsIG1vdXNlTGVhdmUpXG5cdFx0XHR0bExlZnQgPSBudWxsXG5cdFx0XHR0bFJpZ2h0ID0gbnVsbFxuXHRcdFx0Y3VycmVudFRsID0gbnVsbFxuXHRcdFx0cmVjdENvbnRhaW5lcnMgPSBudWxsXG5cdFx0XHRiZ0xpbmVzTGVmdCA9IG51bGxcblx0XHRcdGJnTGluZXNSaWdodCA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGU7XG5cbn0iLCJpbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5cbnZhciB2aWRlb0NhbnZhcyA9ICggcHJvcHMgKT0+IHtcblxuICAgIHZhciBzY29wZTtcbiAgICB2YXIgaW50ZXJ2YWxJZDtcbiAgICB2YXIgZHggPSAwLCBkeSA9IDAsIGRXaWR0aCA9IDAsIGRIZWlnaHQgPSAwO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG4gICAgICAgIGF1dG9wbGF5OiBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZSxcbiAgICAgICAgdm9sdW1lOiBwcm9wcy52b2x1bWUsXG4gICAgICAgIGxvb3A6IHByb3BzLmxvb3BcbiAgICB9KVxuXG4gICAgdmFyIG9uQ2FuUGxheSA9ICgpPT57XG4gICAgICAgIHNjb3BlLmlzTG9hZGVkID0gdHJ1ZVxuICAgICAgICBpZihwcm9wcy5hdXRvcGxheSkgbVZpZGVvLnBsYXkoKVxuICAgICAgICBpZihkV2lkdGggPT0gMCkgZFdpZHRoID0gbVZpZGVvLndpZHRoKClcbiAgICAgICAgaWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gbVZpZGVvLmhlaWdodCgpXG4gICAgICAgIGlmKG1WaWRlby5pc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciBkcmF3T25jZSA9ICgpPT4ge1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGxheSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGRyYXcsIDEwMDAgLyAzMClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICAgICAgbVZpZGVvLmN1cnJlbnRUaW1lKHRpbWUpXG4gICAgICAgIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgdGltZW91dCA9IChjYiwgbXMpPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgY2Ioc2NvcGUpXG4gICAgICAgIH0sIG1zKVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICgpPT57XG4gICAgICAgIG1WaWRlby5wYXVzZSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgICAgICBpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICAgICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgcmVzaXplID0gKHgsIHksIHcsIGgpPT57XG4gICAgICAgIGR4ID0geFxuICAgICAgICBkeSA9IHlcbiAgICAgICAgZFdpZHRoID0gd1xuICAgICAgICBkSGVpZ2h0ID0gaFxuICAgIH1cblxuICAgIHZhciBjbGVhciA9ICgpPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIG1WaWRlby5jbGVhckFsbEV2ZW50cygpXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwwLDAsMClcbiAgICB9XG5cbiAgICBpZihwcm9wcy5vbkVuZGVkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtVmlkZW8ub24oJ2VuZGVkJywgZW5kZWQpXG4gICAgfVxuXG4gICAgc2NvcGUgPSB7XG4gICAgICAgIGlzTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICAgIHZpZGVvOiBtVmlkZW8sXG4gICAgICAgIGN0eDogY3R4LFxuICAgICAgICBkcmF3T25jZTogZHJhd09uY2UsXG4gICAgICAgIHBsYXk6IHBsYXksXG4gICAgICAgIHBhdXNlOiBwYXVzZSxcbiAgICAgICAgc2Vlazogc2VlayxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgcmVzaXplOiByZXNpemUsXG4gICAgICAgIGNsZWFyOiBjbGVhcixcbiAgICAgICAgbG9hZDogKHNyYywgY2IpPT4ge1xuICAgICAgICAgICAgbVZpZGVvLmxvYWQoc3JjLCAoKT0+e1xuICAgICAgICAgICAgICAgIG9uQ2FuUGxheSgpXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzY29wZVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHZpZGVvQ2FudmFzIiwiZXhwb3J0IGRlZmF1bHQge1xuXHRXSU5ET1dfUkVTSVpFOiAnV0lORE9XX1JFU0laRScsXG5cdFBBR0VfSEFTSEVSX0NIQU5HRUQ6ICdQQUdFX0hBU0hFUl9DSEFOR0VEJyxcblx0UEFHRV9BU1NFVFNfTE9BREVEOiAnUEFHRV9BU1NFVFNfTE9BREVEJyxcblxuXHRMQU5EU0NBUEU6ICdMQU5EU0NBUEUnLFxuXHRQT1JUUkFJVDogJ1BPUlRSQUlUJyxcblxuXHRGT1JXQVJEOiAnRk9SV0FSRCcsXG5cdEJBQ0tXQVJEOiAnQkFDS1dBUkQnLFxuXG5cdEhPTUU6ICdIT01FJyxcblx0RElQVFlRVUU6ICdESVBUWVFVRScsXG5cblx0TEVGVDogJ0xFRlQnLFxuXHRSSUdIVDogJ1JJR0hUJyxcblx0VE9QOiAnVE9QJyxcblx0Qk9UVE9NOiAnQk9UVE9NJyxcblxuXHRJTlRFUkFDVElWRTogJ0lOVEVSQUNUSVZFJyxcblx0VFJBTlNJVElPTjogJ1RSQU5TSVRJT04nLFxuXG5cdE9QRU5fRkVFRDogJ09QRU5fRkVFRCcsXG5cdE9QRU5fR1JJRDogJ09QRU5fR1JJRCcsXG5cblx0UFhfQ09OVEFJTkVSX0lTX1JFQURZOiAnUFhfQ09OVEFJTkVSX0lTX1JFQURZJyxcblx0UFhfQ09OVEFJTkVSX0FERF9DSElMRDogJ1BYX0NPTlRBSU5FUl9BRERfQ0hJTEQnLFxuXHRQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEOiAnUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCcsXG5cblx0T1BFTl9GVU5fRkFDVDogJ09QRU5fRlVOX0ZBQ1QnLFxuXHRDTE9TRV9GVU5fRkFDVDogJ0NMT1NFX0ZVTl9GQUNUJyxcblxuXHRDRUxMX01PVVNFX0VOVEVSOiAnQ0VMTF9NT1VTRV9FTlRFUicsXG5cdENFTExfTU9VU0VfTEVBVkU6ICdDRUxMX01PVVNFX0xFQVZFJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblx0SE9NRV9JTUFHRV9TSVpFOiBbIDQ4MCwgMjcwIF0sXG5cblx0SVRFTV9JTUFHRTogJ0lURU1fSU1BR0UnLFxuXHRJVEVNX1ZJREVPOiAnSVRFTV9WSURFTycsXG5cblx0R1JJRF9ST1dTOiA0LCBcblx0R1JJRF9DT0xVTU5TOiA3LFxuXG5cdFBBRERJTkdfQVJPVU5EOiA0MCxcblx0U0lERV9FVkVOVF9QQURESU5HOiAxMjAsXG5cblx0RU5WSVJPTk1FTlRTOiB7XG5cdFx0UFJFUFJPRDoge1xuXHRcdFx0c3RhdGljOiAnJ1xuXHRcdH0sXG5cdFx0UFJPRDoge1xuXHRcdFx0XCJzdGF0aWNcIjogSlNfdXJsX3N0YXRpYyArICcvJ1xuXHRcdH1cblx0fSxcblxuXHRNRURJQV9HTE9CQUxfVzogMTkyMCxcblx0TUVESUFfR0xPQkFMX0g6IDEwODAsXG5cblx0TUlOX01JRERMRV9XOiA5NjAsXG5cdE1RX1hTTUFMTDogMzIwLFxuXHRNUV9TTUFMTDogNDgwLFxuXHRNUV9NRURJVU06IDc2OCxcblx0TVFfTEFSR0U6IDEwMjQsXG5cdE1RX1hMQVJHRTogMTI4MCxcblx0TVFfWFhMQVJHRTogMTY4MCxcbn0iLCJpbXBvcnQgRmx1eCBmcm9tICdmbHV4J1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG52YXIgQXBwRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlVmlld0FjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHRzb3VyY2U6ICdWSUVXX0FDVElPTicsXG5cdFx0XHRhY3Rpb246IGFjdGlvblxuXHRcdH0pO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwRGlzcGF0Y2hlciIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGRpcHR5cXVlLXBhZ2UnPlxcblxcblx0PGRpdiBjbGFzcz1cXFwiZnVuLWZhY3Qtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2UtaW5uZXJcXFwiPlxcblx0XHRcdFx0XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snZmFjdC10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2ZhY3QtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZhY3QtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImN1cnNvci1jcm9zc1xcXCI+XFxuXHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE0LjEwNSAxMy44MjhcXFwiPlxcblx0XHRcdFx0PHBvbHlnb24gZmlsbD1cXFwiI2ZmZmZmZlxcXCIgcG9pbnRzPVxcXCIxMy45NDYsMC44MzggMTMuMjgzLDAuMTU2IDcuMDM1LDYuMjUgMC44MzksMC4xNTYgMC4xNzMsMC44MzQgNi4zNyw2LjkzMSAwLjE1OSwxMi45OSAwLjgyMywxMy42NzEgNy4wNyw3LjU3OCAxMy4yNjYsMTMuNjcxIDEzLjkzMiwxMi45OTQgNy43MzYsNi44OTYgXFxcIi8+XFxuXHRcdFx0PC9zdmc+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYWluLWJ0bnMtd3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgaWQ9J3Nob3AtYnRuJyBjbGFzcz0nbWFpbi1idG4nPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImltZy13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgaWQ9J2Z1bi1mYWN0LWJ0bicgY2xhc3M9J21haW4tYnRuJz5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpbWctd3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJzZWxmaWUtc3RpY2std3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2xvcmlmaWVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMDAgMjJcXFwiPlxcblx0XHRcdFx0XHQ8cGF0aCBkPVxcXCJNNC42LDEuMjVjMC4wMDEsMCwwLjA0NS0wLjAwNiwwLjA4LDBoMC4wMzJjMS4yMTIsMC4wMDMsMzYuNzA2LTEsMzYuNzA2LTFsMjUuNDcxLDAuNTQ5YzAuMDg2LDAuMDAyLDAuMTcyLDAuMDA3LDAuMjU4LDAuMDE3bDEuNDg2LDAuMTY2QzY4LjcxMSwwLjk4OSw2OC43NzMsMSw2OC44MzYsMS4wMzZsMC4zMjQsMC4xOTljMC4wNTIsMC4wMzIsMC4xMSwwLjA0OSwwLjE3MSwwLjA1bDI3LjA0MywwLjQ2OWMwLDAsMi42MjQtMC4wNzcsMi42MjQsMi45MzNsLTAuNjkyLDcuOTZjLTAuMDQ1LDAuNTE4LTAuNDc5LDAuOTE2LTAuOTk5LDAuOTE2aC02LjIwM2MtMC4zMjgsMC0wLjY1MywwLjAzNC0wLjk3NSwwLjFjLTAuODUzLDAuMTc1LTIuODMsMC41MjgtNS4yNjMsMC42MThjLTAuMzQyLDAuMDE0LTAuNjYxLDAuMTgxLTAuODcyLDAuNDUxbC0wLjUsMC42NDVsLTAuMjgsMC4zNThjLTAuMzc0LDAuNDgyLTAuNjQ3LDEuMDM0LTAuNzg5LDEuNjI4Yy0wLjMyLDEuMzQ1LTEuMzk4LDMuOTUyLTQuOTI0LDMuOTU4Yy0zLjk3NCwwLjAwNS03LjY4NS0wLjExMy0xMC42MTItMC4yMjVjLTEuMTg5LTAuMDQ0LTIuOTYsMC4yMjktMi44NTUtMS42MjlsMC4zNi01Ljk0YzAuMDE0LTAuMjE5LTAuMTU3LTAuNDA0LTAuMzc2LTAuNDA5TDI5LjYyLDEyLjQ4OGMtMC4yMTQtMC4wMDQtMC40MjgsMC4wMDEtMC42NDEsMC4wMTVsLTEuNzUzLDAuMTEzYy0wLjIwOCwwLjAxMy0wLjQwNywwLjA4NS0wLjU3NCwwLjIxYy0wLjU1NywwLjQxMS0xLjg5NywxLjM5Mi0yLjY2NywxLjg1OWMtMC43MDEsMC40MjYtMS41MzksMS4wNDItMS45NjgsMS4zNjRjLTAuMTgzLDAuMTM3LTAuMzA5LDAuMzM1LTAuMzU4LDAuNTU4bC0wLjMxNywxLjQyNWMtMC4wNDQsMC4yMDItMC4wMDQsMC40MTMsMC4xMTMsMC41ODNsMC42MTMsMC44OTZjMC4yMTIsMC4zMTEsMC4yOTcsMC42OTksMC4xODgsMS4wNTljLTAuMTE1LDAuMzc4LTAuNDQ0LDAuNzU1LTEuMjkyLDAuNzU1aC03Ljk1N2MtMC40MjUsMC0wLjg0OC0wLjA0LTEuMjY2LTAuMTJjLTIuNTQzLTAuNDg2LTEwLjg0Ni0yLjY2MS0xMC44NDYtMTAuMzZDMC44OTYsMy4zNzUsNC40NTksMS4yNSw0LjYsMS4yNVxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwic2NyZWVuLWhvbGRlclxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwidmlkZW8taG9sZGVyXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcnJvd3Mtd3JhcHBlclxcXCI+XFxuXHRcdDxhIGhyZWY9XFxcIiMvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wYWdlJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwcmV2aW91cy1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInByZXZpb3VzLXBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD0nbGVmdCcgY2xhc3M9XFxcImFycm93IGxlZnRcXFwiPlxcblx0XHRcdFxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImljb25zLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCI3LjYyNywwLjgzMSA4LjMwNywxLjUyOSAxLjk1Miw3LjcyNyA4LjI5MywxMy45NjUgNy42MSwxNC42NTggMC41NjEsNy43MjQgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcHJldmlldy11cmwnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInByZXZpb3VzLXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblxcblx0XHQ8L2E+XFxuXHRcdDxhIGhyZWY9XFxcIiMvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ25leHQtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD0ncmlnaHQnIGNsYXNzPVxcXCJhcnJvdyByaWdodFxcXCI+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjEuMjQsMTQuNjU4IDAuNTYxLDEzLjk2IDYuOTE1LDcuNzYyIDAuNTc1LDEuNTI1IDEuMjU3LDAuODMxIDguMzA3LDcuNzY1IFxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCIgc3R5bGU9XFxcImJhY2tncm91bmQtaW1hZ2U6IHVybChcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcHJldmlldy11cmwnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ25leHQtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibmV4dC1wcmV2aWV3LXVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIpXFxcIj48L2Rpdj5cXG5cdFx0PC9hPlxcblx0PC9kaXY+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYnVmZmVyID0gXG4gIFwiXHQ8ZGl2IGRhdGEtaWQ9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImlkXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgZGF0YS1wZXJzb249XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5wZXJzb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnBlcnNvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicGVyc29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInBvc3RcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3Atd3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0XHQ8aW1nIHNyYz1cXFwiXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmljb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmljb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImljb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInRpdGxlXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGVyc29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wZXJzb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjbGVhci1mbG9hdFxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidGltZVxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpbWUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRpbWUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRpbWVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJtZWRpYS13cmFwcGVyXFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMVsnaXMtdmlkZW8nXSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMVsnaXMtdmlkZW8nXSA6IHN0YWNrMSkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5ub29wLFwiaW52ZXJzZVwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImljb25zLXdyYXBwZXJcXFwiPlxcblx0XHRcdDx1bCBjbGFzcz0nbGVmdCc+XFxuXHRcdFx0XHQ8bGk+XFxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAuMDgzIC0wLjAxNiAyMi45NTMgMjMuNzgzXFxcIj48cGF0aCBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTEuNTYsMjMuNTA5Yy02LjE5LDAtMTEuMjI3LTUuMjE5LTExLjIyNy0xMS42MzNTNS4zNywwLjI0MywxMS41NiwwLjI0M2M2LjE5LDAsMTEuMjI2LDUuMjE5LDExLjIyNiwxMS42MzNTMTcuNzUsMjMuNTA5LDExLjU2LDIzLjUwOXogTTExLjU2LDEuNjEzYy01LjQzNiwwLTkuODU3LDQuNjA0LTkuODU3LDEwLjI2M3M0LjQyMSwxMC4yNjMsOS44NTcsMTAuMjYzYzUuNDM1LDAsOS44NTYtNC42MDQsOS44NTYtMTAuMjYzUzE2Ljk5NSwxLjYxMywxMS41NiwxLjYxM3ogTTkuMDc0LDExLjY4N2MtMC45OSwwLTEuNDQxLTEuNzA0LTEuNDQxLTMuMjg3YzAtMS41ODMsMC40NTItMy4yODgsMS40NDEtMy4yODhjMC45OTEsMCwxLjQ0MiwxLjcwNSwxLjQ0MiwzLjI4OEMxMC41MTYsOS45ODMsMTAuMDY0LDExLjY4Nyw5LjA3NCwxMS42ODd6IE0xNC4wOTcsMTEuNjg3Yy0wLjk5LDAtMS40NDEtMS43MDQtMS40NDEtMy4yODdjMC0xLjU4MywwLjQ1MS0zLjI4OCwxLjQ0MS0zLjI4OGMwLjk5MSwwLDEuNDQxLDEuNzA1LDEuNDQxLDMuMjg4QzE1LjUzOCw5Ljk4MywxNS4wODgsMTEuNjg3LDE0LjA5NywxMS42ODd6IE0xNy42MjksMTIuNzQ2Yy0wLjAwNiwwLjE4Ny0wLjUwMyw1Ljc2My02LjIyLDUuNzYzYy01LjcxNiwwLTYuMDctNS42MTktNi4wNzMtNS42OWMwLjA4NSwwLjAwOCwwLjE3LDAuMDIyLDAuMjU0LDAuMDQzYzAuMTMzLDAuMDMyLDAuMjcxLTAuMDQyLDAuMzA4LTAuMTgyYzAuMDM1LTAuMTMzLTAuMDQyLTAuMjg4LTAuMTc1LTAuMzJjLTAuNTA1LTAuMTIxLTEuMTA3LTAuMDg5LTEuNTI2LDAuMjY1QzQuMDkxLDEyLjcxMyw0LjExLDEyLjksNC4xOTksMTIuOTkxYzAuMTA1LDAuMTA3LDAuMjQ4LDAuMDg4LDAuMzU0LTAuMDAyYy0wLjEwMSwwLjA4NSwwLjE5OC0wLjA5OCwwLjIyMi0wLjEwNWMwLjAwMS0wLjAwMSwwLjAwMi0wLjAwMiwwLjAwNC0wLjAwMmMwLjA4MywxLjc4MiwwLjkzMywzLjQ0OCwyLjI2Niw0LjU3NmMxLjQ4LDEuMjUyLDMuNDM5LDEuODA0LDUuMzI5LDEuNTU1YzEuODU4LTAuMjQzLDMuNTcyLTEuMjMzLDQuNjg0LTIuODA5YzAuNjktMC45NzgsMS4wODUtMi4xNjcsMS4xMjktMy4zNzhjMC4wMTIsMC4wMDUsMC40MzksMC4yMDIsMC41NDMsMC4wOTRjMC4wODktMC4wOTQsMC4xMDQtMC4yNzctMC4wMDItMC4zNjdjLTAuNDE3LTAuMzUzLTEuMDIxLTAuMzgzLTEuNTIzLTAuMjYzYy0wLjMxNSwwLjA3Ni0wLjE4NCwwLjU3NywwLjEzLDAuNTAyQzE3LjQzNiwxMi43NjgsMTcuNTMzLDEyLjc1MiwxNy42MjksMTIuNzQ2elxcXCIvPjwvc3ZnPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaT5cXG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwLjMwOSAyMyAyMy44NTdcXFwiPjxwYXRoIGlkPVxcXCJTaGFwZVxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTExLjUsMC41NjhjLTYuMjEzLDAtMTEuMjUsNS4yMjUtMTEuMjUsMTEuNjY5YzAsNi40NDQsNS4wMzcsMTEuNjY5LDExLjI1LDExLjY2OWM2LjIxNCwwLDExLjI1LTUuMjI1LDExLjI1LTExLjY2OUMyMi43NSw1Ljc5MiwxNy43MTQsMC41NjgsMTEuNSwwLjU2OEwxMS41LDAuNTY4eiBNMTEuNSwxOS42MjJjLTAuOTczLDAtMS43NTgtMC44MTYtMS43NTgtMS44MjRjMC0xLjAwNywwLjc4NS0xLjgyMiwxLjc1OC0xLjgyMmMwLjk3LDAsMS43NTgsMC44MTUsMS43NTgsMS44MjJDMTMuMjU4LDE4LjgwNiwxMi40NywxOS42MjIsMTEuNSwxOS42MjJMMTEuNSwxOS42MjJ6IE0xMS44NTIsMTIuMjM3Yy0yLjcxOSwwLTQuOTIyLDIuMjg2LTQuOTIyLDUuMTA1YzAsMi43NzgsMi4xNDMsNS4wMjYsNC44MDQsNS4wOTNjLTAuMDgsMC4wMDItMC4xNTQsMC4wMTMtMC4yMzMsMC4wMTNjLTUuNDMsMC05Ljg0NC00LjU4MS05Ljg0NC0xMC4yMTFTNi4wNywyLjAyNiwxMS41LDIuMDI2YzAuMjM2LDAsMS4zMzgsMC4xMDYsMS4zNiwwLjEwOWMyLjIzMSwwLjQ4NCwzLjkxMywyLjUzNywzLjkxMyw0Ljk5N0MxNi43NzMsOS45NTEsMTQuNTY3LDEyLjIzNywxMS44NTIsMTIuMjM3TDExLjg1MiwxMi4yMzd6IE05Ljc0Miw2LjY3NmMwLDEuMDA3LDAuNzg1LDEuODI0LDEuNzU4LDEuODI0YzAuOTcsMCwxLjc1OC0wLjgxNiwxLjc1OC0xLjgyNGMwLTEuMDA3LTAuNzg4LTEuODIzLTEuNzU4LTEuODIzQzEwLjUyNyw0Ljg1Myw5Ljc0Miw1LjY2OSw5Ljc0Miw2LjY3NnpcXFwiLz48L3N2Zz5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHQ8bGk+XFxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjEuMjUgLTAuNzQxIDIyLjUgMjMuMzM4XFxcIj48cGF0aCBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTQuNjUxLDIyLjE0N0wxNC42NTEsMjIuMTQ3Yy00LjYzNS0wLjAwMS04Ljc4Mi0zLjAzNy0xMC4zMi03LjU1NWMtMi01Ljg3NSwwLjk4OS0xMi4zNDQsNi42NjMtMTQuNDIyYzEuMTMtMC40MTQsMi4zMDUtMC42MzIsMy40OTQtMC42NDhjMC4zNzgsMCwwLjcxNiwwLjIxNSwwLjg3MywwLjU0OWMwLjE1NSwwLjMzNywwLjExMSwwLjcyMy0wLjExNSwxLjAxYy0wLjE5NiwwLjI1Mi0wLjM4MywwLjUxNy0wLjU1NywwLjc4OGMtMS43OTgsMi43OTYtMi4yMTEsNi4yMTUtMS4xMzUsOS4zNzljMS4wNzUsMy4xNTYsMy40NTgsNS41NDIsNi41MzgsNi41NDRjMC4yOTgsMC4wOTgsMC42MDQsMC4xODIsMC45MSwwLjI1YzAuMzU2LDAuMDc4LDAuNjQyLDAuMzYzLDAuNzIzLDAuNzI4YzAuMDgyLDAuMzU1LTAuMDQ0LDAuNzI1LTAuMzI4LDAuOTU4Yy0wLjkzNCwwLjc2MS0xLjk3OSwxLjM1Ni0zLjEwOSwxLjc3MUMxNy4xMTIsMjEuOTI5LDE1Ljg4OCwyMi4xNDcsMTQuNjUxLDIyLjE0N3ogTTEzLjY0OSwwLjk0OWMtMC43MzksMC4wODEtMS40NzIsMC4yNTItMi4xODMsMC41MTJDNi40ODksMy4yODQsMy44NzIsOC45NzYsNS42MzMsMTQuMTQ5YzEuMzQ4LDMuOTYxLDQuOTczLDYuNjIzLDkuMDE4LDYuNjIzaDAuMDAxYzEuMDc1LDAsMi4xNC0wLjE5LDMuMTY0LTAuNTY1YzAuNzI1LTAuMjY2LDEuNDEtMC42MTYsMi4wNDUtMS4wNDdjLTAuMDY1LTAuMDItMC4xMy0wLjA0LTAuMTkzLTAuMDYyYy0zLjQ5NS0xLjEzNy02LjE5Ny0zLjgzNy03LjQxMy03LjQwN2MtMS4yMTMtMy41NjMtMC43NDYtNy40MTUsMS4yNzktMTAuNTY2QzEzLjU3MSwxLjA2NiwxMy42MDksMS4wMDgsMTMuNjQ5LDAuOTQ5elxcXCIvPjwvc3ZnPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHRcdDx1bCBjbGFzcz0ncmlnaHQnPlxcblx0XHRcdFx0PGxpPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIxLjI1IC0wLjc0MSAyMi41IDIzLjMzOFxcXCI+PHBhdGggZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIzLjI0MiwxMC40MzhMMTMuMDEtMC4xNzZjLTAuMjYtMC4yNjktMC42OC0wLjI2OS0wLjkzOSwwTDEuODM5LDEwLjQzOGMtMC4yNTksMC4yNjktMC4yNTksMC43MDUsMCwwLjk3NEwxMi4wNywyMi4wMjVjMC4yNiwwLjI3LDAuNjgsMC4yNywwLjkzOSwwbDEwLjIzMi0xMC42MTRDMjMuNTAyLDExLjE0MywyMy41MDIsMTAuNzA3LDIzLjI0MiwxMC40MzhMMjMuMjQyLDEwLjQzOHogTTE0LjI5OSwxMC4zMDZjLTAuMDYxLDAuMTM0LTAuMTgyLDAuMjE0LTAuMzI0LDAuMjExYy0wLjE0My0wLjAwMy0wLjI2LTAuMDg4LTAuMzE0LTAuMjI0bC0wLjUxNC0xLjI5MmMwLDAtMC40NjEsMC4yMjctMC45MjIsMC41MzRjLTEuNTEyLDAuOTA5LTEuNDIsMi4zMzUtMS40MiwyLjMzNXY0LjE3SDguNzI4VjExLjc1YzAsMCwwLjExOS0yLjQ1OCwyLjA3NS0zLjY3NGMwLjU3Mi0wLjM2MywwLjgwMS0wLjUyMSwxLjIyOS0wLjc3N2wtMC44NzMtMS4wNThjLTAuMDk2LTAuMTA4LTAuMTE5LTAuMjU1LTAuMDYyLTAuMzkxYzAuMDU1LTAuMTM1LDAuMTc2LTAuMjE2LDAuMzItMC4yMTZsNC45MzgsMC4wMTRMMTQuMjk5LDEwLjMwNkwxNC4yOTksMTAuMzA2elxcXCIvPjwvc3ZnPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiY29tbWVudHMtd3JhcHBlclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuY29tbWVudHMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmNvbW1lbnRzIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiY29tbWVudHNcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuY29tbWVudHMpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHQ8ZGl2IGNsYXNzPSd2aWRlby13cmFwcGVyJz5cXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid2lzdGlhX2VtYmVkIHdpc3RpYV9hc3luY19cIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS51cmwgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIgcGxheWVyQ29sb3I9MWVlYTc5IHBsYXliYXI9ZmFsc2Ugc21hbGxQbGF5QnV0dG9uPWZhbHNlIHZvbHVtZUNvbnRyb2w9ZmFsc2UgZnVsbHNjcmVlbkJ1dHRvbj1mYWxzZVxcXCIgc3R5bGU9XFxcIndpZHRoOjEwMCU7IGhlaWdodDoxMDAlO1xcXCI+Jm5ic3A7PC9kaXY+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHQ8ZGl2IGNsYXNzPSdpbWFnZS13cmFwcGVyJz5cXG5cdFx0XHRcdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnVybCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIjtcblxuICByZXR1cm4gXCJcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbW1lbnRcXFwiPlxcbiAgICBcdFx0XHRcdDxkaXYgY2xhc3M9XFxcIm5hbWVcXFwiPlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncGVyc29uLW5hbWUnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3BlcnNvbi1uYW1lJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvbi1uYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2PlxcbiAgICBcdFx0XHRcdDxkaXYgY2xhc3M9XFxcInRleHRcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3BlcnNvbi10ZXh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwZXJzb24tdGV4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwZXJzb24tdGV4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZmVlZCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIGlkPVxcXCJMYXllcl8xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHQ8L2E+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWFwLWJ0blxcXCI+PGEgaHJlZj1cXFwiIyEvbGFuZGluZ1xcXCIgY2xhc3M9XFxcInRleHQtYnRuXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubWFwX3R4dCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjYW1wZXItbGFiXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYlVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsYWJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwidGV4dC1idG5cXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwicmVsYXRpdmVcXFwiPlxcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXRpdGxlIHRleHQtYnRuXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF90aXRsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJtZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMVxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy53b21lblNob3BVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLndvbWVuU2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwid29tZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3Bfd29tZW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2E+PC9saT5cXG5cdFx0XHRcdFx0PC91bD5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2hlYWRlcj5cXG5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0PGRpdj48L2Rpdj5cXG5cIjtcbn0sXCIzXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhvcml6b250YWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhvcml6b250YWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJob3Jpem9udGFsXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmhvcml6b250YWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcIjRcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52ZXJ0aWNhbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmVydGljYWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJ2ZXJ0aWNhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy52ZXJ0aWNhbCkgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9aGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcsIGFsaWFzND10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGJ1ZmZlciA9IFxuICBcIjxkaXYgY2xhc3M9J3BhZ2Utd3JhcHBlciBob21lLXBhZ2UnPlxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lclxcXCI+PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWZyb250LWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYm90dG9tLXRleHRzLWNvbnRhaW5lclxcXCI+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8dWw+XFxuXHRcdFx0XHQ8bGkgaWQ9J2RlaWEnPkRFSUE8L2xpPlxcblx0XHRcdFx0PGxpIGlkPSdhcmVsbHVmJz5BUkVMTFVGPC9saT5cXG5cdFx0XHRcdDxsaSBpZD0nZXMtdHJlbmMnPkVTIFRSRU5DPC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidGV4dHMtd3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZ2VuZXJpY1xcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5nZW5lcmljIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5nZW5lcmljIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJnZW5lcmljXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSd0eHQnIGlkPVxcXCJkZWlhXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydkZWlhLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZGVpYS10eHQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZGVpYS10eHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9J3R4dCcgaWQ9XFxcImFyZWxsdWZcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2FyZWxsdWYtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydhcmVsbHVmLXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJhcmVsbHVmLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZXMtdHJlbmNcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2VzLXRyZW5jLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZXMtdHJlbmMtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImVzLXRyZW5jLXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdDwvZGl2Plxcblxcblx0XHQ8ZGl2IGlkPVxcXCJzb2NpYWwtd3JhcHBlclxcXCI+XFxuXHRcdFx0PHVsPlxcblx0XHRcdFx0PGxpIGNsYXNzPSdpbnN0YWdyYW0nPlxcblx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmluc3RhZ3JhbVVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5zdGFncmFtVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpbnN0YWdyYW1VcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTYuMTA3LDE1LjU2MmMwLDAuMzAyLTAuMjQzLDAuNTQ3LTAuNTQzLDAuNTQ3SDIuNDM4Yy0wLjMwMiwwLTAuNTQ3LTAuMjQ1LTAuNTQ3LTAuNTQ3VjcuMzU5aDIuMTg4Yy0wLjI4NSwwLjQxLTAuMzgxLDEuMTc1LTAuMzgxLDEuNjYxYzAsMi45MjksMi4zODgsNS4zMTIsNS4zMjMsNS4zMTJjMi45MzUsMCw1LjMyMi0yLjM4Myw1LjMyMi01LjMxMmMwLTAuNDg2LTAuMDY2LTEuMjQtMC40Mi0xLjY2MWgyLjE4NlYxNS41NjJMMTYuMTA3LDE1LjU2MnogTTkuMDIsNS42NjNjMS44NTYsMCwzLjM2NSwxLjUwNCwzLjM2NSwzLjM1OGMwLDEuODU0LTEuNTA5LDMuMzU3LTMuMzY1LDMuMzU3Yy0xLjg1NywwLTMuMzY1LTEuNTA0LTMuMzY1LTMuMzU3QzUuNjU1LDcuMTY3LDcuMTYzLDUuNjYzLDkuMDIsNS42NjNMOS4wMiw1LjY2M3ogTTEyLjgyOCwyLjk4NGMwLTAuMzAxLDAuMjQ0LTAuNTQ2LDAuNTQ1LTAuNTQ2aDEuNjQzYzAuMywwLDAuNTQ5LDAuMjQ1LDAuNTQ5LDAuNTQ2djEuNjQxYzAsMC4zMDItMC4yNDksMC41NDctMC41NDksMC41NDdoLTEuNjQzYy0wLjMwMSwwLTAuNTQ1LTAuMjQ1LTAuNTQ1LTAuNTQ3VjIuOTg0TDEyLjgyOCwyLjk4NHogTTE1LjY2OSwwLjI1SDIuMzNjLTEuMTQ4LDAtMi4wOCwwLjkyOS0yLjA4LDIuMDc2djEzLjM0OWMwLDEuMTQ2LDAuOTMyLDIuMDc1LDIuMDgsMi4wNzVoMTMuMzM5YzEuMTUsMCwyLjA4MS0wLjkzLDIuMDgxLTIuMDc1VjIuMzI2QzE3Ljc1LDEuMTc5LDE2LjgxOSwwLjI1LDE1LjY2OSwwLjI1TDE1LjY2OSwwLjI1elxcXCIvPlxcblx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PGxpIGNsYXNzPSd0d2l0dGVyJz5cXG5cdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50d2l0dGVyVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50d2l0dGVyVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ0d2l0dGVyVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAyMiAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIxLjE3NiwwLjUxNGMtMC44NTQsMC41MDktMS43OTksMC44NzktMi44MDgsMS4wNzljLTAuODA1LTAuODY1LTEuOTUzLTEuNDA1LTMuMjI2LTEuNDA1Yy0yLjQzOCwwLTQuNDE3LDEuOTkyLTQuNDE3LDQuNDQ5YzAsMC4zNDksMC4wMzgsMC42ODgsMC4xMTQsMS4wMTNDNy4xNjYsNS40NjQsMy45MSwzLjY5NSwxLjcyOSwxYy0wLjM4LDAuNjYtMC41OTgsMS40MjUtMC41OTgsMi4yNGMwLDEuNTQzLDAuNzgsMi45MDQsMS45NjYsMy43MDRDMi4zNzQsNi45MiwxLjY5MSw2LjcxOCwxLjA5NCw2LjM4OHYwLjA1NGMwLDIuMTU3LDEuNTIzLDMuOTU3LDMuNTQ3LDQuMzYzYy0wLjM3MSwwLjEwNC0wLjc2MiwwLjE1Ny0xLjE2NSwwLjE1N2MtMC4yODUsMC0wLjU2My0wLjAyNy0wLjgzMy0wLjA4YzAuNTYzLDEuNzY3LDIuMTk0LDMuMDU0LDQuMTI4LDMuMDg5Yy0xLjUxMiwxLjE5NC0zLjQxOCwxLjkwNi01LjQ4OSwxLjkwNmMtMC4zNTYsMC0wLjcwOS0wLjAyMS0xLjA1NS0wLjA2MmMxLjk1NiwxLjI2MSw0LjI4LDEuOTk3LDYuNzc1LDEuOTk3YzguMTMxLDAsMTIuNTc0LTYuNzc4LDEyLjU3NC0xMi42NTljMC0wLjE5My0wLjAwNC0wLjM4Ny0wLjAxMi0wLjU3N2MwLjg2NC0wLjYyNywxLjYxMy0xLjQxMSwyLjIwNC0yLjMwM2MtMC43OTEsMC4zNTQtMS42NDQsMC41OTMtMi41MzcsMC43MDFDMjAuMTQ2LDIuNDI0LDIwLjg0NywxLjU1MywyMS4xNzYsMC41MTRcXFwiLz5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaSBjbGFzcz0nZmFjZWJvb2snPlxcblx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzNCgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZhY2Vib29rVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mYWNlYm9va1VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjZWJvb2tVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTcuNzE5LDE2Ljc1NmMwLDAuNTMxLTAuNDMxLDAuOTYzLTAuOTYyLDAuOTYzaC00LjQ0M3YtNi43NTNoMi4yNjdsMC4zMzgtMi42MzFoLTIuNjA0VjYuNjU0YzAtMC43NjIsMC4yMTEtMS4yODEsMS4zMDQtMS4yODFsMS4zOTQsMFYzLjAxOWMtMC4yNDEtMC4wMzItMS4wNjgtMC4xMDQtMi4wMzEtMC4xMDRjLTIuMDA5LDAtMy4zODUsMS4yMjctMy4zODUsMy40Nzl2MS45NDFINy4zMjJ2Mi42MzFoMi4yNzJ2Ni43NTNIMS4yNDNjLTAuNTMxLDAtMC45NjItMC40MzItMC45NjItMC45NjNWMS4yNDNjMC0wLjUzMSwwLjQzMS0wLjk2MiwwLjk2Mi0wLjk2MmgxNS41MTRjMC41MzEsMCwwLjk2MiwwLjQzMSwwLjk2MiwwLjk2MlYxNi43NTZcXFwiLz5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHQ8L3VsPlxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdFx0PGRpdj5jPC9kaXY+XFxuXHRcdFx0PGRpdj5kPC9kaXY+XFxuXHRcdFx0PGRpdj5lPC9kaXY+XFxuXHRcdFx0PGRpdj5mPC9kaXY+XFxuXHRcdFx0PGRpdj5nPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b21cXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+PC9kaXY+XHRcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdDxkaXYgY2xhc3M9XFxcImJsb2NrXFxcIj5cXG5cdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVkaWEgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnVybCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxuXHQ8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kZXggOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImRlaWFcXFwiPkRFSUE8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImVzLXRyZW5jXFxcIj5FUyBUUkVOQzwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJlbGx1ZlxcXCI+QVJFTExVRjwvZGl2PlxcbjwvZGl2Plxcblxcbjxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIi02NyAwIDc2MCA2NDVcXFwiPlxcblx0XFxuXHQ8cGF0aCBpZD1cXFwibWFwLWJnXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgZmlsbD1cXFwiI2ZmZmZmZlxcXCIgZD1cXFwiTTkuMjY4LDI4OS4zOTRsOS43OS03Ljc5OGwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bDAsMGwtMi4zODItMS4xNzdMOS4yNjgsMjg5LjM5NHogTTU3My41OCwxNzQuMjExbDE5Ljg5LTEzLjgybDguOTAxLTIuNDc5bDUuMzU0LTQuODA5bDEuNTYtNS41NTVsLTEtNi45MjJsMS40NDUtMy45NzNsNS4wNTctMi41MjNsNC4yNzEsMi4wMWwxMS45MDYsOS4xNjVsMi42OTMsNC45MTdsMi44OTIsMS41NzVsMTEuNDgyLDEuMzY3bDMuMDU3LDEuOTQ5bDQuNDE4LDUuMjExbDcuNzY4LDIuMjIxbDUuODMyLDQuOTE2bDYuMzA1LDAuMjE1bDYuMzczLTEuMjJsMS45ODksMS44OGwwLjQwOSwxLjk2M2wtNS4zMzYsMTAuNDI4bC0wLjIyOSwzLjg2OWwxLjQ0MSwxLjY0N2wwLjg1NCwwLjk1OGw3LjM5NS0wLjQyN2wyLjM0NywxLjU0bDAuOTAzLDIuNTE5bC0yLjEwMiwzLjA1NGwtOC40MjUsMy4xODNsLTIuMTY5LDcuMTE2bDAuMzQ0LDMuMTgzbDMuMDczLDQuMjMxbDAuMDE1LDIuODQ2bC0yLjAxOSwxLjQ1bC0wLjczOSwzLjg0M2wyLjE2NiwxNi42ODdsLTAuOTgyLDEuODhsLTYuNzg1LTMuNzU3bC0xLjc1OCwwLjI1NGwtMi4wMTksNC40NjhsMS4wMzIsNi4yMzdsLTAuNjA1LDQuODI3bC0wLjM2MywyLjg2OGwtMS40OTUsMS42NjVsLTIuMTAyLTAuMTI5bC04LjM0MS0zLjg0N2wtNC4wMTEtMC40MDVsLTIuNzExLDEuNjA0bC03LjQzOCwxNi40OTdsLTMuMjg0LDExLjU5OWwzLjIyLDEwLjU5N2wxLjY0LDEuODU5bDQuMzg2LTAuMjhsMS40NzgsMS42OWwtMS45MzcsMy4zOTVsLTIuNjkzLDEuMDk1bC03Ljg1MS0wLjEyOWwtMi41NDYsMS42MjJsLTIuNjYxLDMuNzE4bDAuMTI5LDAuODk3bDAuNjA5LDQuNDQ2bC0xLjQ3OCw0LjMxM2wtMy42OCwzLjMxMmwtMy45MDksMS4xNzNsLTExLjk4OSw3Ljc1OGwtNS4zNTQsNy45NjdsLTguOTM4LDYuNTM5bC0zLjM1MSw2LjY2M2wtNS43OCw2LjU0MmwtNC44MjcsOC4xODJsMC4yOTQsMy45MDhsLTQuODk2LDEyLjI4N2wtMi4wMiw1LjEwN2wtMy4yMDIsMjIuMzkzbDAuNzIxLDguODQybC0xLjAzMywyLjk1bC0xLjcyNS0wLjI3NmwtNC4xMjUtNC40NjhsLTEuNjI0LDAuOTYybC0xLjM5NiwzLjI3MmwxLjgyMiw0Ljg0OGwtMS42OTIsNS4wMjFsLTQuNzMxLDYuNjA0bC04LjA2MiwxOS4yOTJsLTIuOTc3LDAuMzQxbC0wLjU0MSwwLjQ0OGwtMS40NzksMS4xOTVsMS4zMTYsNC40ODlsLTIuMjg0LDMuMzk1bC0yLjUxNCwxLjI2NGwtNS40ODQtNC41MzJsLTMuMDg4LTAuODk0bC0wLjgwNywxLjkwMWwyLjIyMSw3LjE3OGwtMy40LDEuMzg5bC04LjM2My0wLjEzbC0xLjUxMSwyLjJsMS4xMDIsNS4zNjVsLTAuNjg4LDIuNzczbC0zLjEzOCwzLjE2NWwtNi42MDMsMi44bC0zLjg5Niw0LjE4OGwtNC42MjktMS4zMjRsLTQuNzMxLDAuNjE3bC01LjA5Mi0yLjU4NGwtMi42MjUsMy41NjdsMC40NzMsMi43MTNsMC4xOCwxLjAyNmwtMS4zMTIsMS42ODdsLTEyLjQ1Miw0Ljc2NmwtNC41OTgsNC40ODVsLTcuMDYyLDExLjA2N2wtMTcuNjIzLDE5LjgwOWwtNC4wOTIsMS43MjdsLTQuNDk4LTAuNjE3bC0zLjY0Ni0zLjE4NGwtMi43OTUtNi41MTdsLTcuMTc2LTguODY3bC0xLjIzMy0wLjU1NmwtMy41MTUtMS42NDRsLTEuOTA0LTMuNjMybDEuMzQ5LTUuMzg3bC0zLjI3MS00LjA1OWwtNy4wMTUtNS41MTJsLTIuODkxLDEuNzk0bC00LjAyMywwLjQ3bC0yLjg3My0xLjcyOWwtMS4yNjctNS41NTVsNC43OTktOC4zNTRsLTAuMDgyLTEuNjAxbC0yLjUyOC00Ljg5NWwtOC4wMi05LjYxNGwtNS4zNTItNC4xNjZsLTQuNjE1LTEuODM3bC00LjIyMSwwLjY0MmwtNi43ODUtMC43NzFsLTQuODEzLTAuNTc0bC02Ljk0NiwyLjYyN2wtMy4wMDYsNC4wNTlsLTEuOTIyLDAuMjU1bC0xNC41NjgtNy44MzdsLTQuODYyLTAuNjIxbC04LjQ2LDEuODM3bC04LjQ4OS0wLjk4M2wtNC4yMDcsMC42NjRsLTcuNzE4LDQuMTY3bC0zLjUxNSwwLjY4MmwtMi45MDgtMS4xOTVsLTQuODEyLTQuNjgzbC00LjE1Ny0wLjU1M2wtNy4yNzMsMS40MzJsLTEuNjQyLTAuNjgybC0xLjM2My00LjEyN2wtNC44OTgtMy4wNzVsLTMuMTk5LTUuMjc5bC0xMS40MDEtOC44ODVsLTUuMjIyLTcuMTU5bC0zLjA4OC03LjU2NWwtMC40MDktNS44MzFsMy42MTEtMTIuNjcxbDAuMTMzLTUuODExbC0xLjE2OS00LjQ2OGwtNS44NDYtOC40MThsLTMuMDM3LTYuNDQ5bC0yLjMxNy00LjkzOGwxLjM2My0yLjc1M2wzLjc3NS0yLjA5NmwyLjk5Mi03LjQxNGw0LjQtMy45OTRsMi4xMDQtMy43NjFsLTQuMDI0LTkuOTE1bC0zLjg0NC02LjcyOWwtOC4zNDYtNy42NDdsLTguNzY5LTIuNTg4bC05LjQyOS0xMC4zNDJsLTQuMjU3LTIuMzI1bC01LjMxOC01LjM4NmwtNy4yNjItMS45NDVsLTAuNjcxLTAuMTY4bC01LjE3NS0xLjM5M2wtMi45NTYsMC41NmwtMi44NTcsMC41NTNsLTIuOTI0LTEuMDQ4bC0zLjk0NCwyLjA5NmwtMi4zLDQuMTIzbDAuMTQ3LDEuNDMybDAuMDg3LDAuNjgybDMuOTM4LDUuMTQ5bC0yLjM5NiwyLjUyM2wtMTAuODg4LTUuNjg1bC00LjIwNywwLjE1MWwtNS45OTMsMTEuNjYzbC00LjA5MiwzLjgyOWwtNi43MTctMC44MzNsLTkuOTIxLDMuMjY2bC03LjY1MiwyLjUyMmwtMi43NzYsMy4wMzNsLTAuMjk3LDIuNDU0bDMuMzAzLDQuMDQxbC0zLjAyMywxLjA5MWwtMC41OTIsMS4zNjd2Ny4wNDhsLTYuODgyLDE1LjcwNGwtMi43NzYsMTAuMjU2bDEuMjAyLDQuMTAybC0wLjgyNSwyLjYwOWwtMTIuMzE1LTUuMTkzbC04Ljc1OC02LjQzMWwtNS4wNDMsMi45MDdsLTAuODg2LDAuNDg4bDEuNDgxLTUuMjExbC0xLjYxLTYuNDA5bDIuMDItNS41NTZsLTAuOTE5LTIuNjdsLTQuNDM2LDEuMzY3bC00LjY4MS0wLjZsLTMuMDczLTQuOTEybC0xLjM0NS00LjYzN2wxLjE4LTIuOTQ5bDIuODk1LTEuOTY3bDcuMDExLTAuNzAzbDEuNjQzLTEuMzI4bC0wLjI2Mi0xLjc3bC03LjM0NS0zLjU0OWwtNi40Ny0xMC4zNjNsLTYuMTI2LDAuMDQzbC00LjU5OCw1LjA2NmwtMy41NjQsMC44NzNsLTQuNzQ4LDEuMTc2bC0wLjU5Mi0yLjEzNWwxLjA1MS0zLjgyNWwtMS4wODMtMi44NjRsLTMuMjg1LTAuNzA2TDY0LjM3NSwzMjhsLTIuNTk3LDYuNzUzbC00LjY5OCwzLjI5MWwtNC44NTktMC41NzdsMC43MDctMy44NDhsLTEuMTAyLTIuMzUxbC0zLjE3LDAuMzg0bC0zLjE3MS0zLjE1OGwtNC4wNDEsNC4zNzlsLTMuMTUyLDAuMjExbC0xLjY0NC0yLjM2OGwyLjYxMS0zLjIyOWw4LjU0My0zLjQ1OWwzLjQ0Ni0yLjgxN2wtMC4xMTUtMS4yNDJsLTEtMC43NWwtMi42OTMsMS4yNjNsLTUuMzg3LTAuNDMxbC0yLjE4NS0yLjIzOWwtMTAuNjQ0LTEwLjg5OGwtMC41OTItMi4xMzVsMS43MDctNi42MDNsLTAuNTc0LTIuNDk4bC0zLjUyOS0yLjk5M2wtMC42MDktMi4xNTdsMy42OTQtNy43MzdsMi4zMDItMC41OTZsMi43MTItNS41MTZsOS4xODEtOS40Mmw4LjU3MSwwLjA2NWwxMS42MjctNS41OTlsNS44MzUtNC45OTlsMS44NTQtMi43NzhsMy4yMzUtNC44OTVsNS44MzEtNC42NTRsMTIuODkzLTYuNDEzbDcuMTMtNi4zNDVsNS4wODktNy4zMDZsNS43MTctMi4zNzJsNS44MzEtOC4zMzNsMy4yODUtMi44NDJsNy40ODgtMi45NzFsNC44NjMtNi4wODZsMy4yMDMtMS4yNjNsMTAuMTY3LDEuMzY3bDYuNjcxLTEuNzUxbDUuMDU3LTMuNDM4bDE0Ljk4LTEyLjI4N2w0LjA4OC04LjI0N2wxNC4wNDQtMTQuNjE2bDYuNjY3LTEwLjc0NGw0LjAxLDMuOTEybDQuNDgzLTEuOTAybDUuMzA4LTQuNDg2bDEuNzktNC4yMTNsNi4xNTctMTQuNDAxbDQuODI3LTEuODU1bDYuNDA4LDQuOTEzbDIuNTk0LTIuODY0bC0wLjczOC01Ljg1M2wwLjY3NC0yLjk2OGwyMS45NjMtMTcuODg1bDUuMDM5LTIuNzM0bDUuNzk5LDMuMzEybDMuMzY3LTAuODc1bDMuNTMzLTMuNjk2bDEuODA4LTUuMjU3bDAuNDU5LTEuMzI0bDMuMjk5LDAuNzA3bDEuNDE0LTEwLjQ5M2wxLjgyMS0xLjMyNGw0LjY2NiwxLjMwM2w0LjQ2NS0xLjM0Nmw2LjU1NiwyLjExM2wtMC4xOTctMi4wNDlsLTAuMTE0LTEuMjM4bC0wLjAzMi0wLjI1OGwxLjcwNy0yLjU0MWwwLjQ0NCwwLjA2NGw5LjgxOSwxLjUxOGgwLjAxOGw2LjgxNy0yLjI5bDUuODYtMS45NjNsNy4wOTgtOC4yNWw4LjM2LTIuMmw0LjUzMi0yLjc1OWw0LjUwMS01Ljc2N2wyLjQ4MS0zLjE4M2w4LjE2My01LjIxbDQuOTkyLDIuMDI3bDQuNDE4LTMuOTcybDQuMDU3LTAuNDk2bDQuOTEzLTIuOTAzbDguNDc1LTEwLjgwOWwyLjc3NSwwLjY4MmwzLjM4MywzLjYxbDEuODksMi4wMzFsMi4zNjMsMi41MTlsOC42NDMtMC43NjhsMTUuNjAyLTEyLjM0OGw0LjgxMi0yLjQ1OGwxMS4wNzEtNS42NjNsMy43MTItMC4xNDdsLTAuNDc4LDUuNDQ3bDEuODkxLDAuNzlsNS43NjctMi42NjlsMy42MTEsMS4yNTlsLTIuNzI2LDQuOTU2bDAuMTQ3LDMuNTI3bDMuNzEyLTAuMzIzbDE3LjY3My0xMS41MTJsMi4zMTctMC41NzhsMi4wMDUsMS42ODdsLTAuOTg2LDIuMDc0bDAuNDA4LDEuOTY2bDExLjM1Mi0xLjg0MWw0LjM1NC0yLjU4NGwxLjcwNy0yLjM3Mmw0LjM4My02LjA4Nmw3LjE0Ny01LjIzNmwxMi40MzQtNS40NzNsNC41NjUtMC4wODZsMC45NjksMS40NTNsLTEuNzA3LDIuMzc2bDAuNzcxLDEuOTg0bDQuMDU2LTAuMjk4bDEzLjg0Ny01LjcyOGwyLjIzNCwxLjAwNWwtNC4wODksMy45OTRsLTIuMzM0LDYuOTAxbC0yLjE4NSwxLjQ3NWwtMy40ODItMC41NTZsLTMuMjIxLDEuMDQ0bC04LjkxNiw2Ljg2MWwtNi42ODQsNS4xMjhsLTMuNzgxLDEuNzNsLTExLjM5Ni0wLjI5OGwtNS45NDYsNS42NjNsLTMuMjUzLDQuNzQ0bC00LjI1NCwxLjAwNWwtMC4xNzksOS4zMTJsLTcuNjIxLTguMTgybC00Ljc0OSwwLjI3NmwtMy43NDMsNC4xOTFsLTEuMjM0LDYuNDQ5bDEuNzQzLDkuNjE3bDIuODA4LDYuNDkybDEuODcyLDQuMzM5bDcuMDQ4LDUuNjgxbDkuMzc4LTEuMjM4bDcuMTEyLTUuMDYzbDIuMjk5LTAuMjMzbDIuODc2LDEuOTJsMi45ODctMC4xNjhsMy44NzctMy4zMDlsOS4yOTYtMi45OTNsNC45MDktMy4yNDhsNS44NS03LjI0MmwzLjEwMy0yLjExN2w0LjA2LTAuMTI5bDMuMzk5LDEuOTY3bC05LjYyNSw4Ljc4MWwtMC4zMTIsMC45ODNsLTEuODI1LDUuNzY3bDAuODg5LDMuMDU4bDIuMzE3LDIuNDExbDMuMDA2LTAuMzYybDAuMzQ0LDMuMjA4bC00LjA1NiwzLjQ1OWwtNi41MDYsOS41MWwtNC4wMDcsMi43NTJsLTcuNzAzLTAuMjU1bC02LjY4NSwzLjUwNmwtMy4zMDQtMC41NmwtMi40NjMtMy4xMThsLTMuMzgzLTIuMTM1bC0xLjkzOSwwLjI1NGwtMi45NTYsMi42NDhsLTIuMjMzLDUuMzQ0bC0xLjk1NSw2LjkyMmwwLjU0NSwyLjY5MWwwLDBsMy44NDIsMTMuMDc3bDguMDQ4LDE1Ljk2Mmw2LjQzOCw3LjIybDEzLjMyMyw5LjQwMmwyMi41NDgsMTAuMjUzbDAuNjI3LDEuMjYzbDExLjU0NSw1LjYybDUuMzQsMi41ODNsNS4xNzUsMS41MzZsMy44NzQtMC40ODhsNS40NTQtMy4zNzZMNTczLjU4LDE3NC4yMTF6IE0zODcuNTE3LDYwMS45NzNsLTIuNzU5LTMuNjk2bDAuNDU5LTEuOTAybDIuMTM4LTEuMTNsMC4zMjctMi45NzVsMi41MTQtMS40NWwzLjgwOSwwLjU1NmwwLjQyNywxLjYyMmwtMi4yOCw3LjA5NWwtMi4wNTYsMi41NDFsMCwwTDM4Ny41MTcsNjAxLjk3M3ogTTM2NS42NTcsNjE0LjM0NmwzLjkwOSwxMS40OTFsMi4yMTcsMC42NjNsMC45ODItMi4wN2wtMC4yNDQtMC43NzFsLTEuMDgzLTMuNTIzbDAuNjM4LTIuNDM4bDIuNTk4LDAuMzAybDIuNzg5LDMuMTU4bDMuMDkzLDAuNzA3bDIuMjQ4LTMuMDU4bC0xLjk5LTUuMjExbDAuNjYtMi40MzdsMi42MjUtMC4zODRsNC43MTYsMi44ODVsNi4wMTEsMS4yMTdsMi4zMzUsMS45MDJsLTQuNjM0LDUuNTU1bC00LjE3MS0wLjIzNmwtMS40NzgsMS44NThsLTAuODQsMi42MDhsMi40NjUsMi42MDVsLTMuMjAzLDQuNzY2bDAuMDgzLDEuNzczbDMuNTI4LDUuNDY5bC0wLjU4OCwxLjIybC0yLjQ0OSwwLjM4NGwtNS45OTMtMS43NTFsLTYuMTkzLDEuOTYzbDAsMGwtMC4yOC00LjQyNWwtOC41MzksMC40MDlsLTAuNDQ0LTEuNDMybDMuMzg2LTQuNzQ0bC0wLjc4OS0xLjYyMmwtNi44NS0xLjc5NGwtMC42MjUtNC42MTVsNC45Ni01LjAyMWwtMi41MTQtMS45MDFsLTAuNDA5LTIuMTM2bDEuNDkyLTIuMDMxTDM2NS42NTcsNjE0LjM0NnpcXFwiLz5cXG5cdFxcblx0PHRleHQgeD1cXFwiMzY0XFxcIiB5PVxcXCIyNDJcXFwiPkEgVklTSU9OIE9GPC90ZXh0Plxcblx0PGcgaWQ9J21hbGxvcmNhLWxvZ28nIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDMwMCwgMjU4KVxcXCI+PHBhdGggZmlsbD1cXFwiIzFlZWE3OVxcXCIgZD1cXFwiTTg3Ljg4NCwxLjAwMWMtMC43OTgsMC4yOTQtMTcuNTMsMTMuNjE3LTM3Ljc2Myw0MC43NThjLTUuODkyLDguNDcyLTkuMzE5LDE0LjYwNy02Ljg5NSwxNS41M2MyLjIzOSwwLjgzOCw0LjQ5LDEuNjM2LDYuNzUsMi4zOTZjMC42MTcsMC4yMDcsMC45NDIsMC4yMzEsMS4xODItMC4xODZjMC41NTctMS4wNzEsMS4wMi03LjkzMyw0LjM1Ny0xMy4zMDZjNC44MDktNy43MywxMS4yMTQtNy4zODQsMTQuODczLTYuNjEyYzEuODA4LDAuMzk3LDIuOTY5LDIuMDA2LDEuNDYzLDUuMzQyYy0zLjc2NCw4LjQ4OS0xMC44LDE0Ljg4NC0xMS44NTYsMTYuODc1Yy0wLjUzNywxLjA5LDAuOTY1LDEuMjY5LDEuMzk3LDEuMzg2YzEuNzk0LDAuNDk4LDMuNTk1LDAuOTczLDUuMzk4LDEuNDI1YzEuNDM5LDAuMzYxLDIuNzYxLDIuOTI3LDEwLjc4OC0xNy4zNTlDOTAuODMsMTEuNjM3LDg4LjUzOSwwLjg1Nyw4Ny44ODQsMS4wMDF6IE03NS41MzIsMjkuODM1Yy0zLjI0My0wLjU3LTcuODc0LDAuNDkxLTguNTY2LDAuMzI0Yy0wLjQ1MS0wLjEtMC40MjYtMC42NDEsMC4wNjYtMS40NjdjMy4xMzctNC45MTMsMTMuMDQyLTE1LjQ4NiwxNC42MDQtMTUuNDJjMS4xMTUsMC4wNzMtMS4wMTgsOS44NjktMy4wNjksMTQuNDc3Qzc3LjYwNCwyOS44MDcsNzYuODM0LDMwLjA3Myw3NS41MzIsMjkuODM1eiBNOTguNzM5LDY4Ljk1MWMtMC4zMTIsMS42MjItMS43NjksMS4wNTYtMi4zNiwwLjk4OGMtNi42OTktMC43NTItMTMuMzY1LTEuNzk5LTE5Ljk3OS0zLjE0OWMtMi42NDItMC4zODItMC44NzktMi45MTcsNC42MDItMTguNTcxYzMuOTktMTAuMjAzLDE4LjU3Mi00NS42NzEsMTkuMTQxLTQ1Ljc1NGMxLjQ4MywwLjA0NCwyLjk2OCwwLjA4OCw0LjQ1MSwwLjEzMmMwLjE5NiwwLjAwNSwwLjQ4NywwLjE3NSwwLjEwMSwxLjYwNWMtMC4yODcsMS44MTMtOC43OTYsMTguNTkyLTE1Ljg4Myw0MC4xMTVjLTMuNDM3LDEwLjgwNC0xLjQ3NCwxMy44NTgsMS4wNzMsMTQuMjIxYzQuMjkxLDAuNjE2LDguMzYxLTUuOTY4LDkuNDE2LTUuODY0QzEwMC4wNiw1Mi43NDYsOTguNzYsNjguNTM3LDk4LjczOSw2OC45NTF6IE0xMjUuODc0LDcwLjEwNGMtMC4wMjYsMS42MzctMS41NjQsMS4yNTItMi4xNjEsMS4yNTRjLTYuNzUsMC4wNDktMTMuNDk2LTAuMTk0LTIwLjIxNS0wLjczNWMtMi42NTYtMC4wNTUtMS4zNzEtMi44NCwxLjI2Ni0xOS4zNTJjMi4xMjQtMTAuODQ4LDEwLjI0Mi00OC4zMzksMTAuODAyLTQ4LjM1NWMxLjQ4MywwLjA0MywyLjk2NywwLjA4Myw0LjQ1MSwwLjEyNWMwLjE5NiwwLjAwNiwwLjUxNywwLjE3OSwwLjM4NSwxLjY1M2MwLjAzMSwxLjgxNy01LjQzOSwxOS4zMTMtOC42NCw0MS44NDRjLTEuNDg5LDExLjI3NywwLjk3NywxNC4xMywzLjU1LDE0LjIxMmM0LjMzNSwwLjEzMyw3LjIwOC02Ljg0OCw4LjI3LTYuODQyQzEyNC4zNDYsNTMuOTE1LDEyNS44MjMsNjkuNzAxLDEyNS44NzQsNzAuMTA0eiBNMTM3LjA3OSwyLjI3N2MtNC41OTItMC4yMjMtOC43OCwyMy4xODMtOS4zOTIsNDQuMjM5Yy0wLjIzOSwxNC4xMTcsMy41ODYsMjYuMDc2LDEzLjkzOSwyNS4yNGMxLjY3LTAuMTQyLDMuMzM5LTAuMzAyLDUuMDA4LTAuNDc5YzEwLjMzNC0xLjIwOCwxMS43NS0xMy4yNjgsOC42OTktMjYuNTczQzE1MC41NDIsMjQuOTc4LDE0MS42NzcsMi42MTQsMTM3LjA3OSwyLjI3N3ogTTE0Mi42NzUsNTcuMjI5Yy00Ljg2NCwwLjM5MS03LjkxMi0zLjE2MS04LjI5NC0xMi42NjljLTAuNjE4LTE3Ljk4OCwyLjA0Mi0yOS4yNzYsNC4wMjQtMjkuMjY5YzEuOTgxLDAuMDI5LDYuOTEyLDEwLjk4Niw5LjkwMywyOC4zOTFDMTQ5LjgzNyw1Mi45MDgsMTQ3LjUzNyw1Ni44MjQsMTQyLjY3NSw1Ny4yMjl6IE0xNzIuNjE1LDMzLjk5NGMtMC43NS0yLjAxMiwzLjM3OS02LjM5OS0yLjA0Ny0xNy4yMzRjLTIuODUyLTUuNzY3LTcuNTkxLTEyLjcwMi0xMi42NzEtMTIuODY4Yy0yLjQ2OS0wLjAzOS00LjkzOS0wLjA4Mi03LjQwOS0wLjEyOGMtMC40ODgtMC4wMDUtMi4xNTktMS40NjYsNi45NjgsMzYuNDgxYzYuOTYyLDI4Ljc5Myw4LjE0LDI3LjA0Miw5LjM2NiwyNi44MDZjMS45MDQtMC4zNjksMy44MDYtMC43Niw1LjcwMy0xLjE3NGMwLjQ4OC0wLjEwNiwxLjgzNi0wLjAxMSwxLjQyOC0xLjI3MWMtMC4yMDUtMC40OTYtNS4xNjctMTAuMzItNi44NjUtMTYuMDJjLTEuMjQ4LTQuMTk2LDAuNzY4LTcuNzE5LDEuOTU4LTcuOTE5YzIuMTg4LTAuMjg3LDExLjMzOSwxMy41MDksMTQuNzc5LDIxLjQyOGMwLjQ2MywxLjEzOCwxLjg4NiwwLjUxMywyLjc1OSwwLjI2NGMxLjgyOC0wLjUxNSwzLjY1Mi0xLjA1NCw1LjQ3MS0xLjYxNWMxLjAxNC0wLjMxMSwxLjE0LTAuNTExLDAuNzY5LTEuMjUzQzE4NC41NCw0My43ODgsMTczLjI1NywzNi4xMzMsMTcyLjYxNSwzMy45OTR6IE0xNjMuMDQ3LDMyLjQyOWMtMS4xMzcsMC4xNDYtMi4wODMtMi44NDItMi41NjItNC40MTFjLTMuOTM5LTEyLjk0OC0zLjQ2Ny0xNS40NDUtMC42OC0xNS41NDZjMS42NTMtMC4wNiw0LjEzMSwxLjQ5NSw1Ljk4MSw1Ljk1N0MxNjguNjM5LDI0Ljg3MiwxNjQuNDYxLDMyLjIxNywxNjMuMDQ3LDMyLjQyOXogTTIxMi40NjIsMzcuMDcyYzcuMjkzLDcuNzkxLDYuMTIyLDE0Ljk4Ni0wLjY1NywxNy44MDljLTExLjE3Miw0LjYzMy0yMy40MTUtNy43OTktMzAuMTU2LTIxLjQ3MWMtNy4yMDUtMTQuNzgyLTExLjkzNi0zMC43MDktNS42ODktMzAuMTkzYzIuMzUyLDAuMDk3LDcuNzksMi4yMDUsMTMuMTAzLDcuOTA1YzIuODI0LDMuMDk2LDMuMTA3LDUuMTAyLDEuMDE2LDUuNDU5Yy0xLjMyNywwLjE4OS0zLjkwNS01LjMyMy03LjgwOS00Ljk3MWMtNC4zNDgsMC4yNi0wLjU4LDkuOTQ2LDQuMTQ2LDE4YzcuMTk4LDEyLjMzNiwxNS45NDEsMTUuMzYsMTkuOCwxMy44OWM3LjE1My0yLjY5NywwLjY2OS0xMC44OSwxLjAyMi0xMC45N0MyMDcuNzg0LDMyLjM1NSwyMTEuOTc0LDM2LjU0MSwyMTIuNDYyLDM3LjA3MnogTTIzOS40MjIsMjMuNDg5QzIwOS42OTQsOS4zMjksMTkzLjk4OCwzLjg0NSwxOTMuMjkxLDMuNDkzYy0wLjgzNi0wLjUzLDEuMzgxLDkuMTY2LDIxLjg1NSwzMi40NjZjNi40NjIsNi43NzcsMTEuNTg3LDExLjE3LDEzLjk1OCw5Ljk3NmMyLjE5LTEuMDksNC4zNjYtMi4yMTUsNi41MjgtMy4zNzJjMC41OTEtMC4zMTcsMC44MDctMC41MDksMC40NzktMC43ODJjLTAuODU1LTAuNjI5LTguMzI4LTMuMTE4LTEyLjQ5Mi02Ljk0OGMtNi01LjUwOS0xLjI5LTguMzY3LDIuMTYyLTkuODQ3YzEuNzEzLTAuNzIxLDQuMzYxLTAuOCw3LjA3MiwwLjg3NWM2LjkxNCw0LjE3OSw5LjUzMyw5Ljk0LDExLjExNywxMS4xMzVjMC44NzUsMC42MDQsMS45OTItMC4yODUsMi4zOS0wLjUyNmMxLjY1Ni0wLjk5NywzLjMwNC0yLjAxNCw0Ljk0Mi0zLjA1MkMyNTIuNjExLDMyLjYwNCwyNTYuMjIsMzIuMTkxLDIzOS40MjIsMjMuNDg5eiBNMjE4LjIwNCwxOS40M2MtMy4wOTgsMS4wMzgtNS4xNjUsMy4zMy01LjgzOSwzLjU2NGMtMC40MzcsMC4xNDQtMS4wNjktMC4xMDMtMS43MTUtMC42NjZjLTMuNzkzLTMuNjAyLTkuMDE1LTExLjU1OS03LjQ3NS0xMS42MzhjMS4xMDYtMC4wNjksMTEuMTIyLDQuNTY3LDE0Ljg3NSw2Ljg0MkMyMTkuNzE2LDE4LjYwOCwyMTkuNDQ3LDE5LjAwMiwyMTguMjA0LDE5LjQzeiBNNTMuMDYyLDMxLjk2MUMzNS40NTgsNTUuODI1LDM0LjkxLDUzLjk5NiwzMy43NTYsNTMuNTA0Yy0xLjk3NS0wLjg0My0zLjk0Mi0xLjcxOS01Ljg5Ny0yLjYyM2MtMC41NTEtMC4yNTItMS44MDctMC41OTgtMC44NzItMS42NDdjMC43ODktMC43MzksMTIuNTMxLTEwLjI2NCwyNS42MjQtMjYuMDA1YzEuMDY1LTEuMjUyLDcuMzc0LTguNjAyLDYuMzA4LTguNzkxYy0wLjkxNC0wLjE0MS03LjM2OCw1LjI5OC05LjAxNiw2LjU0Yy0xMy45NTYsMTAuNjkxLTE3Ljk2NiwxNi4xMS0yMC42NDgsMTQuOTk4Yy0zLjM3NC0xLjQ0OSwyLjk5OS02LjE3MywxMS42NjgtMTcuNjAzYzAuOTEtMS4yNDIsNS43MzgtNi41MDYsNC43Ny02LjY5MWMtMS4wNDgtMC4yMjItOC40MzksNS41MjctOS43MDQsNi41MTVDMjAuMTQ3LDMwLjI1LDEyLjEwMiw0MC4zNTIsMTEuMzQzLDQxLjEyN2MtMS4wNjIsMC44ODEtMS45NDksMC4xMTgtMi40NzctMC4xOTNjLTEuNTczLTAuOTI2LTMuMTM3LTEuODczLTQuNjkyLTIuODRjLTEuMDg3LTAuNjctMy42MjEtMC43NjIsMTkuOTYxLTE2LjY4QzU1LjIzMywwLjQ5OSw1NS40NjksMS4xNTEsNTUuOTUyLDEuMTc5YzAuODU3LDAuMDIxLDEuNzEzLDAuMDQ0LDIuNTcsMC4wNjdjMS4xMDQsMC4wNSwxLjQzOC0wLjAyMi0xLjAxNywzLjQ3M2MtNC42MjMsNi44OTQtOC4yNzEsMTEuMTQ0LTcuNjUzLDExLjIzN0M1MC4yOTMsMTYsNTQuNzU5LDEyLjM5OCw2NC43NSw1LjM2MmM1LjE5NS0zLjc5OSw1LjQ5My0zLjgxMiw2LjYwMy0zLjc1OGMwLjcyOCwwLjAyMSwxLjQ1NCwwLjA0MiwyLjE4MiwwLjA2MkM3NC4wMiwxLjY5LDc2LjIxNywwLjQ4Nyw1My4wNjIsMzEuOTYxelxcXCIvPjwvZz5cXG5cXG5cdDxnIGlkPVxcXCJmb290c3RlcHNcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZHViLW1hdGVvXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwibWF0ZW8tYmVsdWdhXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYmVsdWdhLWlzYW11XFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiaXNhbXUtY2FwYXNcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJjYXBhcy1wZWxvdGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwicGVsb3Rhcy1tYXJ0YVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hcnRhLWtvYmFyYWhcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJrb2JhcmFoLWR1YlxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1wYXJhZGlzZVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInJldHVybi10by1iZWdpblxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG5cdDxnIGlkPVxcXCJtYXAtZG90c1xcXCI+XFxuXHRcdDxnIGlkPVxcXCJkZWlhXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgyMTAsIDE3MClcXFwiPjxjaXJjbGUgaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDI0MCwgMTQ2KVxcXCI+PGNpcmNsZSBpZD1cXFwibWF0ZW9cXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgyNjAsIDIxNClcXFwiPjxjaXJjbGUgaWQ9XFxcIm1hcnRhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImVzLXRyZW5jXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSg0MjYsIDQ3OClcXFwiPjxjaXJjbGUgaWQ9XFxcImlzYW11XFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDQwMCwgNDQ2KVxcXCI+PGNpcmNsZSBpZD1cXFwiYmVsdWdhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJhcmVsbHVmXFxcIj5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMjEsIDM2NClcXFwiPjxjaXJjbGUgaWQ9XFxcImNhcGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTI2LCAzNDApXFxcIj48Y2lyY2xlIGlkPVxcXCJwZWxvdGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTM3LCAzMTgpXFxcIj48Y2lyY2xlIGlkPVxcXCJtYXJ0YVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEwNiwgMzI2KVxcXCI+PGNpcmNsZSBpZD1cXFwia29iYXJhaFxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEwNiwgMzAwKVxcXCI+PGNpcmNsZSBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoODAsIDMxNSlcXFwiPjxjaXJjbGUgaWQ9XFxcInBhcmFkaXNlXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG48L3N2Zz5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXMyPXRoaXMubGFtYmRhO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHQ8aGVhZGVyPlxcblx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdDwvYT5cXG5cdDwvaGVhZGVyPlxcblx0XFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYWluLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImZlZWRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE2MiA0N1xcXCI+IFxcblx0XHRcdFx0XHQ8dGV4dCB4PVxcXCI0MlxcXCIgeT1cXFwiLTRcXFwiPkEgVklTSU9OIE9GPC90ZXh0Plxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNDIuNTgyLDE4LjIzOWMtMC4zMSwwLjUyLTAuMzI1LDAuODU5LTAuMDQyLDAuOTIyYzAuNDM1LDAuMTA1LDMuMzQ2LTAuNTYyLDUuMzg0LTAuMjA0YzAuODE4LDAuMTQ5LDEuMzAyLTAuMDE4LDEuOTA3LTEuMzExYzEuMjktMi44OTQsMi42My05LjA0NSwxLjkyOS05LjA5MUM1MC43NzksOC41MTQsNDQuNTU0LDE1LjE1NCw0Mi41ODIsMTguMjM5IE0zOS4wMzYsMzkuOWMtMC4yNzEtMC4wNzUtMS4yMTUtMC4xODctMC44NzgtMC44NzJjMC42NjUtMS4yNDksNS4wODYtNS4yNjYsNy40NTItMTAuNTk4YzAuOTQ3LTIuMDk0LDAuMjE3LTMuMTA0LTAuOTE5LTMuMzU0Yy0yLjI5OS0wLjQ4NS02LjMyNC0wLjcwMi05LjM0OCw0LjE1M2MtMi4wOTcsMy4zNzQtMi4zODgsNy42ODItMi43MzgsOC4zNTRjLTAuMTUsMC4yNjQtMC4zNTQsMC4yNDctMC43NDIsMC4xMTdjLTEuNDIxLTAuNDc4LTIuODM2LTAuOTc5LTQuMjQ0LTEuNTA0Yy0xLjUyMy0wLjU4LDAuNjMxLTQuNDMzLDQuMzM0LTkuNzUzQzQ0LjY2OSw5LjQwMSw1NS4xODUsMS4wMzQsNTUuNjg3LDAuODVjMC40MTItMC4wOTEsMS44NTMsNi42NzktNi40NzgsMjkuMDQ0Yy01LjA0NCwxMi43MzgtNS44NzYsMTEuMTI3LTYuNzgsMTAuOTAxQzQxLjI5NSw0MC41MTEsNDAuMTY0LDQwLjIxMywzOS4wMzYsMzkuOSBNNDguNDY5LDQyLjE2NWMtMS42Ni0wLjI0LTAuNTUyLTEuODMzLDIuODkyLTExLjY2NGMyLjUwOC02LjQwNywxMS42NzMtMjguNjgxLDEyLjAzLTI4LjczM2MwLjkzMywwLjAyOCwxLjg2NSwwLjA1NiwyLjc5NywwLjA4M2MwLjEyMywwLjAwMywwLjMwNywwLjEwOSwwLjA2MywxLjAwOGMtMC4xODEsMS4xMzktNS41MjgsMTEuNjc1LTkuOTgzLDI1LjE5MmMtMi4xNiw2Ljc4NS0wLjkyNiw4LjcwMywwLjY3NSw4LjkzMmMyLjY5NiwwLjM4Niw1LjI1NS0zLjc0OCw1LjkxNy0zLjY4M2MwLjQ3OCwwLjA0NS0wLjMzOSw5Ljk2MS0wLjM1MywxMC4yMjJjLTAuMTk2LDEuMDE5LTEuMTEyLDAuNjYzLTEuNDgzLDAuNjE5QzU2LjgxNiw0My42Nyw1Mi42MjUsNDMuMDExLDQ4LjQ2OSw0Mi4xNjUgTTY1LjUsNDQuNTcxYy0xLjY2OS0wLjAzNS0wLjg2Mi0xLjc4MywwLjc5Ni0xMi4xNTNjMS4zMzQtNi44MTIsNi40MzctMzAuMzU3LDYuNzg5LTMwLjM2N2MwLjkzMywwLjAyNywxLjg2NSwwLjA1MywyLjc5OCwwLjA3OWMwLjEyMywwLjAwMywwLjMyNCwwLjExMiwwLjI0MSwxLjAzOGMwLjAyLDEuMTQxLTMuNDE4LDEyLjEyOC01LjQzLDI2LjI3N2MtMC45MzYsNy4wODEsMC42MTMsOC44NzQsMi4yMzEsOC45MjVjMi43MjUsMC4wODQsNC41MzEtNC4zMDEsNS4xOTctNC4yOTZjMC40ODEsMC4wMDQsMS40MDksOS45MTgsMS40NDEsMTAuMTcxYy0wLjAxNywxLjAyOS0wLjk4MywwLjc4Ni0xLjM1OCwwLjc4OEM3My45NjMsNDUuMDYzLDY5LjcyNCw0NC45MSw2NS41LDQ0LjU3MSBNOTMuNjYzLDI3LjY1MmMtMS44NzktMTAuOTMtNC45NzktMTcuODExLTYuMjI1LTE3LjgyOWMtMS4yNDUtMC4wMDUtMi45MTcsNy4wODMtMi41MjgsMTguMzhjMC4yNCw1Ljk3MiwyLjE1Niw4LjIwMiw1LjIxMyw3Ljk1NkM5My4xNzksMzUuOTA2LDk0LjYyNCwzMy40NDYsOTMuNjYzLDI3LjY1MiBNODkuNDY0LDQ1LjI4M2MtNi41MDcsMC41MjQtOC45MTItNi45ODUtOC43NjEtMTUuODUyQzgxLjA4NywxNi4yMSw4My43MiwxLjUxLDg2LjYwNSwxLjY1YzIuODkxLDAuMjEyLDguNDYyLDE0LjI1NiwxMS40NzMsMjYuNjQ1YzEuOTE4LDguMzU1LDEuMDI4LDE1LjkyOS01LjQ2NywxNi42ODhDOTEuNTYyLDQ1LjA5Myw5MC41MTQsNDUuMTkzLDg5LjQ2NCw0NS4yODMgTTEwNC42NDcsMTEuNzk0Yy0xLjE2My0yLjgwMy0yLjcyLTMuNzc4LTMuNzU5LTMuNzQxYy0xLjc1LDAuMDY0LTIuMDQ4LDEuNjMxLDAuNDI4LDkuNzYzYzAuMzAyLDAuOTg1LDAuODk2LDIuODYxLDEuNjExLDIuNzdDMTAzLjgxNSwyMC40NTMsMTA2LjQ0LDE1Ljg0LDEwNC42NDcsMTEuNzk0IE05OS42OSwyLjY2NWMzLjE5MSwwLjEwNCw2LjE3LDQuNDU5LDcuOTYzLDguMDgxYzMuNDEsNi44MDQsMC44MTQsOS41NiwxLjI4NiwxMC44MjNjMC40MDQsMS4zNDMsNy40OTUsNi4xNSwxMi43MDIsMTYuMDExYzAuMjMzLDAuNDY4LDAuMTU1LDAuNTkzLTAuNDgzLDAuNzg5Yy0xLjE0NCwwLjM1Mi0yLjI4OSwwLjY4OS0zLjQzOCwxLjAxM2MtMC41NDgsMC4xNTUtMS40NDIsMC41NS0xLjczMy0wLjE2NWMtMi4xNjMtNC45NzUtNy45MTQtMTMuNjM4LTkuMjg5LTEzLjQ1N2MtMC43NDgsMC4xMjYtMi4wMTUsMi4zMzktMS4yMyw0Ljk3M2MxLjA2NywzLjU4LDQuMTg1LDkuNzQ5LDQuMzE0LDEwLjA2MWMwLjI1NiwwLjc5Mi0wLjU5MSwwLjczMS0wLjg5OCwwLjc5N2MtMS4xOTIsMC4yNjEtMi4zODcsMC41MDctMy41ODMsMC43MzhjLTAuNzcxLDAuMTQ4LTEuNTExLDEuMjQ4LTUuODg3LTE2LjgzM2MtNS43MzYtMjMuODMxLTQuNjg2LTIyLjkxNC00LjM4LTIyLjkxMUM5Ni41ODYsMi42MTQsOTguMTM4LDIuNjQxLDk5LjY5LDIuNjY1IE0xMTQuNjE3LDIxLjIwMmMtNC41MjgtOS4yODMtNy41MDEtMTkuMjg2LTMuNTc1LTE4Ljk2MWMxLjQ3OCwwLjA2MSw0Ljg5NiwxLjM4NCw4LjIzNSw0Ljk2NWMxLjc3NSwxLjk0NCwxLjk1MiwzLjIwMywwLjY0LDMuNDI4Yy0wLjgzNSwwLjEyLTIuNDU1LTMuMzQzLTQuOTA5LTMuMTIxYy0yLjczMiwwLjE2My0wLjM2NCw2LjI0NiwyLjYwNSwxMS4zMDRjNC41MjUsNy43NDgsMTAuMDIsOS42NDYsMTIuNDQ1LDguNzIzYzQuNDk1LTEuNjk0LDAuNDIxLTYuODM5LDAuNjQyLTYuODg5YzAuMzQzLTAuMTExLDIuOTc3LDIuNTE3LDMuMjg0LDIuODUyYzQuNTgyLDQuODkzLDMuODQ4LDkuNDEtMC40MTMsMTEuMTg0QzEyNi41NDksMzcuNTk2LDExOC44NTQsMjkuNzg4LDExNC42MTcsMjEuMjAyIE0xMzIuODQ1LDE0LjI0M2MwLjQwNSwwLjM1NCwwLjgwMywwLjUwNywxLjA3OCwwLjQxOGMwLjQyNC0wLjE0NywxLjcyMi0xLjU4NiwzLjY2OS0yLjIzOGMwLjc4Mi0wLjI2OSwwLjk1LTAuNTE2LTAuMDk3LTEuMTkyYy0yLjM1Ny0xLjQyOS04LjY1My00LjM0LTkuMzQ5LTQuMjk2QzEyNy4xNzksNi45ODQsMTMwLjQ2MSwxMS45ODEsMTMyLjg0NSwxNC4yNDMgTTE1NS4yODgsMjMuMTI0Yy0wLjI1LDAuMTUxLTAuOTUyLDAuNzEtMS41MDIsMC4zM2MtMC45OTUtMC43NS0yLjY0Mi00LjM2OC02Ljk4Ny02Ljk5M2MtMS43MDMtMS4wNTItMy4zNjgtMS4wMDItNC40NDQtMC41NDljLTIuMTY5LDAuOTI5LTUuMTI5LDIuNzI1LTEuMzU4LDYuMTg0YzIuNjE2LDIuNDA2LDcuMzEzLDMuOTY5LDcuODUxLDQuMzYzYzAuMjA2LDAuMTcyLDAuMDcsMC4yOTMtMC4zLDAuNDkxYy0xLjM2LDAuNzI4LTIuNzI5LDEuNDM0LTQuMTA0LDIuMTE4Yy0xLjQ5LDAuNzUtNC43MTEtMi4wMDktOC43NzEtNi4yNjRDMTIyLjgwMiw4LjE3LDEyMS40MDksMi4wODEsMTIxLjkzNSwyLjQxNGMwLjQzOCwwLjIyMSwxMC4zMDksMy42NjUsMjguOTkyLDEyLjU1OGMxMC41NTksNS40NjUsOC4yOSw1LjcyNCw3LjQ2Nyw2LjIzNkMxNTcuMzY0LDIxLjg1OSwxNTYuMzI5LDIyLjQ5OCwxNTUuMjg4LDIzLjEyNCBNMy4wNzYsMjQuMTQzYy0wLjY4My0wLjQyLTIuMjc1LTAuNDc4LDEyLjU0Ni0xMC40NzVDMzUuMTY2LDAuNTM0LDM1LjMxNCwwLjk0MywzNS42MTgsMC45NjFjMC41MzgsMC4wMTQsMS4wNzcsMC4wMjgsMS42MTUsMC4wNDJjMC42OTQsMC4wMzIsMC45MDQtMC4wMTQtMC42NCwyLjE4MWMtMi45MDUsNC4zMy01LjE5OCw2Ljk5OS00LjgxLDcuMDU3YzAuMjc3LDAuMDI3LDMuMDg0LTIuMjM1LDkuMzYzLTYuNjU0YzMuMjY2LTIuMzg1LDMuNDU0LTIuMzk0LDQuMTUtMi4zNmMwLjQ1OCwwLjAxMywwLjkxNCwwLjAyNiwxLjM3MiwwLjA0YzAuMzA1LDAuMDE1LDEuNjg2LTAuNzQxLTEyLjg2NiwxOS4wMjVDMjIuNzM3LDM1LjI3OCwyMi4zOTMsMzQuMTI5LDIxLjY2OCwzMy44MjFjLTEuMjQyLTAuNTMxLTIuNDc4LTEuMDgtMy43MDgtMS42NDdjLTAuMzQ1LTAuMTU5LTEuMTM0LTAuMzc2LTAuNTQ3LTEuMDM0YzAuNDk2LTAuNDY0LDcuODc1LTYuNDQ2LDE2LjEwNC0xNi4zMzJjMC42Ny0wLjc4Niw0LjYzNC01LjQwMiwzLjk2NS01LjUyMWMtMC41NzQtMC4wODgtNC42MywzLjMyOC01LjY2Nyw0LjEwN2MtOC43NzEsNi43MTQtMTEuMjkxLDEwLjExNy0xMi45NzcsOS40MThjLTIuMTIxLTAuOTEsMS44ODQtMy44NzcsNy4zMzMtMTEuMDU0YzAuNTcxLTAuNzgsMy42MDYtNC4wODYsMi45OTgtNC4yMDFjLTAuNjYtMC4xNC01LjMwNSwzLjQ3MS02LjA5OSw0LjA5MWMtOS45NTcsNy41NjktMTUuMDEzLDEzLjkxMi0xNS40OSwxNC4zOTljLTAuNjY3LDAuNTU0LTEuMjI0LDAuMDc0LTEuNTU2LTAuMTIxQzUuMDM2LDI1LjM0Niw0LjA1MywyNC43NTEsMy4wNzYsMjQuMTQzXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtYXBcXFwiPlxcblx0XHRcdFx0PGltZyBzcmM9XFxcImltYWdlL21vYmlsZV9tYXAuanBnXFxcIj5cXG5cdFx0XHRcdDxwPlwiXG4gICAgKyBhbGlhczEoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5nZW5lcmljIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5nZW5lcmljIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJnZW5lcmljXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvcD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImluZGV4XFxcIj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbS1wYXJ0XFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGZvb3Rlcj5cXG5cdFx0XFxuXHRcdDx1bD5cXG5cdFx0XHQ8bGkgaWQ9J2hvbWUnPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMShhbGlhczIoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmhvbWUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHRcdDxsaSBpZD0nZ3JpZCc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cIlxuICAgICsgYWxpYXMxKGFsaWFzMigoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuZ3JpZCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvbGk+XFxuXHRcdFx0PGxpIGlkPSdjb20nIGNsYXNzPSdjb20nPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzNSAxN1xcXCI+XFxuXHRcdFx0XHRcdFx0PHBhdGggZmlsbD1cXFwiI0ZGRkZGRlxcXCIgZD1cXFwiTTE3LjQxNSwxMS4yMDNjNi4yNzUsMCwxMi4wMDksMi4wOTMsMTYuMzk0LDUuNTQ3VjAuMjMySDF2MTYuNTM1QzUuMzg3LDEzLjMwMywxMS4xMjksMTEuMjAzLDE3LjQxNSwxMS4yMDNcXFwiLz5cXG5cdFx0XHRcdFx0PC9zdmc+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHRcdDxsaSBpZD0nbGFiJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlwiXG4gICAgKyBhbGlhczEoYWxpYXMyKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5sYWIgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8L2xpPlxcblx0XHRcdDxsaSBpZD0nc2hvcCc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cIlxuICAgICsgYWxpYXMxKGFsaWFzMigoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF90aXRsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvbGk+XFxuXHRcdDwvdWw+XFxuXFxuXHQ8L2Zvb3Rlcj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgaWQ9XFxcImZyb250LWJsb2NrXFxcIj48L2Rpdj5cXG48ZGl2IGlkPSdwYWdlcy1jb250YWluZXInPlxcblx0PGRpdiBpZD0ncGFnZS1hJz48L2Rpdj5cXG5cdDxkaXYgaWQ9J3BhZ2UtYic+PC9kaXY+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImluc2lkZS13cmFwcGVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcInRleHQtdGl0bGVcXFwiPlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50aXRsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGl0bGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRpdGxlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwicmVjdHMtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmctbGluZVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJnLWJveFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJnLWxpbmVcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJyZWN0cy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJiZy1saW5lXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmctYm94XFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmctbGluZVxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj5cXG5cdFxcbjwvZGl2Plx0XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsImltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuICAgIFx0XG5jbGFzcyBHbG9iYWxFdmVudHMge1xuXHRpbml0KCkge1xuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdyZXNpemUnLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0QXBwQWN0aW9ucy53aW5kb3dSZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHbG9iYWxFdmVudHNcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuY2xhc3MgUHJlbG9hZGVyICB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKVxuXHRcdHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCB0aGlzLm9uTWFuaWZlc3RMb2FkQ29tcGxldGVkLCB0aGlzKVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gdW5kZWZpbmVkXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMgPSBbXVxuXHR9XG5cdGxvYWQobWFuaWZlc3QsIG9uTG9hZGVkKSB7XG5cblx0XHRpZih0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBtID0gdGhpcy5hbGxNYW5pZmVzdHNbaV1cblx0XHRcdFx0aWYobS5sZW5ndGggPT0gbWFuaWZlc3QubGVuZ3RoICYmIG1bMF0uaWQgPT0gbWFuaWZlc3RbMF0uaWQgJiYgbVttLmxlbmd0aC0xXS5pZCA9PSBtYW5pZmVzdFttYW5pZmVzdC5sZW5ndGgtMV0uaWQpIHtcblx0XHRcdFx0XHRvbkxvYWRlZCgpXHRcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzLmFsbE1hbmlmZXN0cy5wdXNoKG1hbmlmZXN0KVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gb25Mb2FkZWRcbiAgICAgICAgdGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobWFuaWZlc3QpXG5cdH1cblx0b25NYW5pZmVzdExvYWRDb21wbGV0ZWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cdGdldENvbnRlbnRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMucXVldWUuZ2V0UmVzdWx0KGlkKVxuXHR9XG5cdGdldEltYWdlVVJMKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpLmdldEF0dHJpYnV0ZShcInNyY1wiKVxuXHR9XG5cdGdldEltYWdlU2l6ZShpZCkge1xuXHRcdHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50QnlJZChpZClcblx0XHRyZXR1cm4geyB3aWR0aDogY29udGVudC5uYXR1cmFsV2lkdGgsIGhlaWdodDogY29udGVudC5uYXR1cmFsSGVpZ2h0IH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkZXJcbiIsImltcG9ydCBoYXNoZXIgZnJvbSAnaGFzaGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBjcm9zc3JvYWRzIGZyb20gJ2Nyb3Nzcm9hZHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmNsYXNzIFJvdXRlciB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5yb3V0aW5nID0gZGF0YS5yb3V0aW5nXG5cdFx0dGhpcy5zZXR1cFJvdXRlcygpXG5cdFx0dGhpcy5maXJzdFBhc3MgPSB0cnVlXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIub2xkSGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5pbml0aWFsaXplZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHRoYXNoZXIuY2hhbmdlZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLnNldHVwQ3Jvc3Nyb2FkcygpXG5cdH1cblx0YmVnaW5Sb3V0aW5nKCkge1xuXHRcdGhhc2hlci5pbml0KClcblx0fVxuXHRzZXR1cENyb3Nzcm9hZHMoKSB7XG5cdCBcdHZhciByb3V0ZXMgPSBoYXNoZXIucm91dGVzXG5cdCBcdGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdCBcdFx0dmFyIHJvdXRlID0gcm91dGVzW2ldXG5cdCBcdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZShyb3V0ZSwgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdCBcdH07XG5cdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZSgnJywgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0b25QYXJzZVVybCgpIHtcblx0XHR0aGlzLmFzc2lnblJvdXRlKClcblx0fVxuXHRvbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuc2VuZFRvRGVmYXVsdCgpXG5cdH1cblx0YXNzaWduUm91dGUoaWQpIHtcblx0XHR2YXIgaGFzaCA9IGhhc2hlci5nZXRIYXNoKClcblx0XHR2YXIgcGFydHMgPSB0aGlzLmdldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy51cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcnRzWzBdLCAocGFydHNbMV0gPT0gdW5kZWZpbmVkKSA/ICcnIDogcGFydHNbMV0pXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IHRydWVcblx0fVxuXHRnZXRVUkxQYXJ0cyh1cmwpIHtcblx0XHR2YXIgaGFzaCA9IHVybFxuXHRcdHJldHVybiBoYXNoLnNwbGl0KCcvJylcblx0fVxuXHR1cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdC8vIElmIGZpcnN0IHBhc3Mgc2VuZCB0aGUgYWN0aW9uIGZyb20gQXBwLmpzIHdoZW4gYWxsIGFzc2V0cyBhcmUgcmVhZHlcblx0XHRpZih0aGlzLmZpcnN0UGFzcykge1xuXHRcdFx0dGhpcy5maXJzdFBhc3MgPSBmYWxzZVxuXHRcdH1lbHNle1xuXHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdFx0fVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZShuZXdIYXNoLCBvbGRIYXNoKSB7XG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0Y3Jvc3Nyb2Fkcy5wYXJzZShuZXdIYXNoKVxuXHRcdGlmKHRoaXMubmV3SGFzaEZvdW5kZWQpIHJldHVyblxuXHRcdC8vIElmIFVSTCBkb24ndCBtYXRjaCBhIHBhdHRlcm4sIHNlbmQgdG8gZGVmYXVsdFxuXHRcdHRoaXMub25EZWZhdWx0VVJMSGFuZGxlcigpXG5cdH1cblx0c2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzZXR1cFJvdXRlcygpIHtcblx0XHRoYXNoZXIucm91dGVzID0gW11cblx0XHRoYXNoZXIuZGlwdHlxdWVSb3V0ZXMgPSBbXVxuXHRcdHZhciBpID0gMCwgaztcblx0XHRmb3IoayBpbiB0aGlzLnJvdXRpbmcpIHtcblx0XHRcdGhhc2hlci5yb3V0ZXNbaV0gPSBrXG5cdFx0XHRpZihrLmxlbmd0aCA+IDIpIGhhc2hlci5kaXB0eXF1ZVJvdXRlcy5wdXNoKGspXG5cdFx0XHRpKytcblx0XHR9XG5cdH1cblx0c3RhdGljIGdldEJhc2VVUkwoKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LlVSTC5zcGxpdChcIiNcIilbMF1cblx0fVxuXHRzdGF0aWMgZ2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmdldEhhc2goKVxuXHR9XG5cdHN0YXRpYyBnZXRSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5yb3V0ZXNcblx0fVxuXHRzdGF0aWMgZ2V0RGlwdHlxdWVSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5kaXB0eXF1ZVJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXROZXdIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIubmV3SGFzaFxuXHR9XG5cdHN0YXRpYyBnZXRPbGRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIub2xkSGFzaFxuXHR9XG5cdHN0YXRpYyBzZXRIYXNoKGhhc2gpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChoYXNoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlclxuIiwiaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIyfSBmcm9tICdldmVudGVtaXR0ZXIyJ1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IGlzUmV0aW5hIGZyb20gJ2lzLXJldGluYSdcblxuZnVuY3Rpb24gX2dldENvbnRlbnRTY29wZSgpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICByZXR1cm4gQXBwU3RvcmUuZ2V0Um91dGVQYXRoU2NvcGVCeUlkKGhhc2hPYmouaGFzaClcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzVG9Mb2FkKCkge1xuICAgIHZhciBzY29wZSA9IF9nZXRDb250ZW50U2NvcGUoKVxuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciB0eXBlID0gX2dldFR5cGVPZlBhZ2UoKVxuICAgIHZhciBtYW5pZmVzdDtcblxuICAgIGlmKHR5cGUgIT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgdmFyIGZpbGVuYW1lcyA9IFtcbiAgICAgICAgICAgICdjaGFyYWN0ZXInICsgX2dldEltYWdlRGV2aWNlRXh0ZW5zaW9uKCkgKycucG5nJyxcbiAgICAgICAgICAgICdjaGFyYWN0ZXItYmcuanBnJyxcbiAgICAgICAgICAgICdzaG9lLWJnLmpwZydcbiAgICAgICAgXVxuICAgICAgICBtYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoZmlsZW5hbWVzLCBoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZSBvZiBleHRyYSBhc3NldHNcbiAgICBpZihzY29wZS5hc3NldHMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBhc3NldHMgPSBzY29wZS5hc3NldHNcbiAgICAgICAgdmFyIGFzc2V0c01hbmlmZXN0O1xuICAgICAgICBpZih0eXBlID09IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgICAgICBhc3NldHNNYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoYXNzZXRzLCAnaG9tZScsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSkgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgbWFuaWZlc3QgPSAobWFuaWZlc3QgPT0gdW5kZWZpbmVkKSA/IGFzc2V0c01hbmlmZXN0IDogbWFuaWZlc3QuY29uY2F0KGFzc2V0c01hbmlmZXN0KVxuICAgIH1cblxuICAgIHJldHVybiBtYW5pZmVzdFxufVxuZnVuY3Rpb24gX2FkZEJhc2VQYXRoc1RvVXJscyh1cmxzLCBwYWdlSWQsIHRhcmdldElkLCB0eXBlKSB7XG4gICAgdmFyIGJhc2VQYXRoID0gKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpID8gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSA6IF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhZ2VJZCwgdGFyZ2V0SWQpXG4gICAgdmFyIG1hbmlmZXN0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNwbGl0dGVyID0gdXJsc1tpXS5zcGxpdCgnLicpXG4gICAgICAgIHZhciBmaWxlTmFtZSA9IHNwbGl0dGVyWzBdXG4gICAgICAgIHZhciBleHRlbnNpb24gPSBzcGxpdHRlclsxXVxuICAgICAgICB2YXIgaWQgPSBwYWdlSWQgKyAnLSdcbiAgICAgICAgaWYodGFyZ2V0SWQpIGlkICs9IHRhcmdldElkICsgJy0nXG4gICAgICAgIGlkICs9IGZpbGVOYW1lXG4gICAgICAgIG1hbmlmZXN0W2ldID0ge1xuICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgc3JjOiBiYXNlUGF0aCArIGZpbGVOYW1lICsgJy4nICsgZXh0ZW5zaW9uXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChpZCwgYXNzZXRHcm91cElkKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9kaXB0eXF1ZS8nICsgaWQgKyAnLycgKyBhc3NldEdyb3VwSWQgKyAnLydcbn1cbmZ1bmN0aW9uIF9nZXRIb21lUGFnZUFzc2V0c0Jhc2VQYXRoKCkge1xuICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvaG9tZS8nXG59XG5mdW5jdGlvbiBfZ2V0SW1hZ2VEZXZpY2VFeHRlbnNpb24oKSB7XG4gICAgdmFyIHJldGluYSA9IF9pc1JldGluYSgpXG4gICAgdmFyIHN0ciA9ICdAMXgnXG4gICAgLy8gaWYocmV0aW5hID09IHRydWUpIHN0ciA9ICdAMngnXG4gICAgcmV0dXJuIHN0clxufVxuZnVuY3Rpb24gX2lzUmV0aW5hKCkge1xuICAgIHJldHVybiBpc1JldGluYSgpXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXREaXB0eXF1ZVNob2VzKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBiYXNldXJsID0gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0KVxuICAgIHJldHVybiBfZ2V0Q29udGVudFNjb3BlKCkuc2hvZXNcbn1cblxudmFyIEFwcFN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIGl0ZW0pIHtcbiAgICAgICAgdGhpcy5lbWl0KHR5cGUsIGl0ZW0pXG4gICAgfSxcbiAgICBwYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUNvbnRlbnQoKVxuICAgIH0sXG4gICAgYXBwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0QXBwRGF0YSgpXG4gICAgfSxcbiAgICBkZWZhdWx0Um91dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERlZmF1bHRSb3V0ZSgpXG4gICAgfSxcbiAgICBnbG9iYWxDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRHbG9iYWxDb250ZW50KClcbiAgICB9LFxuICAgIHBhZ2VBc3NldHNUb0xvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNUb0xvYWQoKVxuICAgIH0sXG4gICAgZ2V0Um91dGVQYXRoU2NvcGVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZCA9IGlkLmxlbmd0aCA8IDEgPyAnLycgOiBpZFxuICAgICAgICByZXR1cm4gZGF0YS5yb3V0aW5nW2lkXVxuICAgIH0sXG4gICAgYmFzZU1lZGlhUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5nZXRFbnZpcm9ubWVudCgpLnN0YXRpY1xuICAgIH0sXG4gICAgZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZDogZnVuY3Rpb24ocGFyZW50LCB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhcmVudCwgdGFyZ2V0KVxuICAgIH0sXG4gICAgZ2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwQ29uc3RhbnRzLkVOVklST05NRU5UU1tFTlZdXG4gICAgfSxcbiAgICBnZXRUeXBlT2ZQYWdlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0VHlwZU9mUGFnZShoYXNoKVxuICAgIH0sXG4gICAgZ2V0SG9tZVZpZGVvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydob21lLXZpZGVvcyddXG4gICAgfSxcbiAgICBnZW5lcmFsSW5mb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5jb250ZW50XG4gICAgfSxcbiAgICBkaXB0eXF1ZVNob2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREaXB0eXF1ZVNob2VzKClcbiAgICB9LFxuICAgIGdldE5leHREaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpKzEpID4gcm91dGVzLmxlbmd0aC0xID8gMCA6IChpKzEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpb3VzRGlwdHlxdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAoaS0xKSA8IDAgPyByb3V0ZXMubGVuZ3RoLTEgOiAoaS0xKVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaW5kZXhdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXREaXB0eXF1ZVBhZ2VJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRJbWFnZURldmljZUV4dGVuc2lvbjogX2dldEltYWdlRGV2aWNlRXh0ZW5zaW9uLFxuICAgIGdldFByZXZpZXdVcmxCeUhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9kaXB0eXF1ZS8nICsgaGFzaCArICcvcHJldmlldy5naWYnXG4gICAgfSxcbiAgICBnZXRGZWVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZmVlZFxuICAgIH0sXG4gICAgbGFuZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWZhdWx0TGFuZyA9IHRydWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxhbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGFuZyA9IGRhdGEubGFuZ3NbaV1cbiAgICAgICAgICAgIGlmKGxhbmcgPT0gSlNfbGFuZykge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRMYW5nID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIChkZWZhdWx0TGFuZyA9PSB0cnVlKSA/ICdlbicgOiBKU19sYW5nXG4gICAgfSxcbiAgICBXaW5kb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3dpbmRvd1dpZHRoSGVpZ2h0KClcbiAgICB9LFxuICAgIGFkZFBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIuYWRkKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICByZW1vdmVQWENoaWxkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIEFwcFN0b3JlLlBYQ29udGFpbmVyLnJlbW92ZShpdGVtLmNoaWxkKVxuICAgIH0sXG4gICAgUGFyZW50OiB1bmRlZmluZWQsXG4gICAgQ2FudmFzOiB1bmRlZmluZWQsXG4gICAgRnJvbnRCbG9jazogdW5kZWZpbmVkLFxuICAgIE9yaWVudGF0aW9uOiBBcHBDb25zdGFudHMuTEFORFNDQVBFLFxuICAgIERldGVjdG9yOiB7XG4gICAgICAgIGlzTW9iaWxlOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGRpc3BhdGNoZXJJbmRleDogQXBwRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHBheWxvYWQuYWN0aW9uXG4gICAgICAgIHN3aXRjaChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRTpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5XaW5kb3cudyA9IGFjdGlvbi5pdGVtLndpbmRvd1dcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5XaW5kb3cuaCA9IGFjdGlvbi5pdGVtLndpbmRvd0hcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5PcmllbnRhdGlvbiA9IChBcHBTdG9yZS5XaW5kb3cudyA+IEFwcFN0b3JlLldpbmRvdy5oKSA/IEFwcENvbnN0YW50cy5MQU5EU0NBUEUgOiBBcHBDb25zdGFudHMuUE9SVFJBSVRcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoYWN0aW9uLmFjdGlvblR5cGUsIGFjdGlvbi5pdGVtKSBcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQgQXBwU3RvcmVcblxuIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbnZhciBQeEhlbHBlciA9IHtcblxuICAgIGdldFBYVmlkZW86IGZ1bmN0aW9uKHVybCwgd2lkdGgsIGhlaWdodCwgdmFycykge1xuICAgICAgICB2YXIgdGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tVmlkZW8odXJsKVxuICAgICAgICB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZS5zZXRBdHRyaWJ1dGUoXCJsb29wXCIsIHRydWUpXG4gICAgICAgIHZhciB2aWRlb1Nwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXh0dXJlKVxuICAgICAgICB2aWRlb1Nwcml0ZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHZpZGVvU3ByaXRlLmhlaWdodCA9IGhlaWdodFxuICAgICAgICByZXR1cm4gdmlkZW9TcHJpdGVcbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2hpbGRyZW5Gcm9tQ29udGFpbmVyOiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkcmVuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY2hpbGQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEZyYW1lSW1hZ2VzQXJyYXk6IGZ1bmN0aW9uKGZyYW1lcywgYmFzZXVybCwgZXh0KSB7XG4gICAgICAgIHZhciBhcnJheSA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGZyYW1lczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gYmFzZXVybCArIGkgKyAnLicgKyBleHRcbiAgICAgICAgICAgIGFycmF5W2ldID0gdXJsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhcnJheVxuICAgIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQeEhlbHBlciIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgVXRpbHMge1xuXHRzdGF0aWMgTm9ybWFsaXplTW91c2VDb29yZHMoZSwgb2JqV3JhcHBlcikge1xuXHRcdHZhciBwb3N4ID0gMDtcblx0XHR2YXIgcG9zeSA9IDA7XG5cdFx0aWYgKCFlKSB2YXIgZSA9IHdpbmRvdy5ldmVudDtcblx0XHRpZiAoZS5wYWdlWCB8fCBlLnBhZ2VZKSBcdHtcblx0XHRcdHBvc3ggPSBlLnBhZ2VYO1xuXHRcdFx0cG9zeSA9IGUucGFnZVk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIFx0e1xuXHRcdFx0cG9zeCA9IGUuY2xpZW50WCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdFxuXHRcdFx0XHQrIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuXHRcdFx0cG9zeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblx0XHR9XG5cdFx0b2JqV3JhcHBlci54ID0gcG9zeFxuXHRcdG9ialdyYXBwZXIueSA9IHBvc3lcblx0XHRyZXR1cm4gb2JqV3JhcHBlclxuXHR9XG5cdHN0YXRpYyBSZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1csIHdpbmRvd0gsIGNvbnRlbnRXLCBjb250ZW50SCwgb3JpZW50YXRpb24pIHtcblx0XHR2YXIgYXNwZWN0UmF0aW8gPSBjb250ZW50VyAvIGNvbnRlbnRIXG5cdFx0aWYob3JpZW50YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYob3JpZW50YXRpb24gPT0gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSkge1xuXHRcdFx0XHR2YXIgc2NhbGUgPSAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgc2NhbGUgPSAod2luZG93SCAvIGNvbnRlbnRIKSAqIDFcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHZhciBzY2FsZSA9ICgod2luZG93VyAvIHdpbmRvd0gpIDwgYXNwZWN0UmF0aW8pID8gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxIDogKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0fVxuXHRcdHZhciBuZXdXID0gY29udGVudFcgKiBzY2FsZVxuXHRcdHZhciBuZXdIID0gY29udGVudEggKiBzY2FsZVxuXHRcdHZhciBjc3MgPSB7XG5cdFx0XHR3aWR0aDogbmV3Vyxcblx0XHRcdGhlaWdodDogbmV3SCxcblx0XHRcdGxlZnQ6ICh3aW5kb3dXID4+IDEpIC0gKG5ld1cgPj4gMSksXG5cdFx0XHR0b3A6ICh3aW5kb3dIID4+IDEpIC0gKG5ld0ggPj4gMSksXG5cdFx0XHRzY2FsZTogc2NhbGVcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGNzc1xuXHR9XG5cdHN0YXRpYyBDYXBpdGFsaXplRmlyc3RMZXR0ZXIoc3RyaW5nKSB7XG5cdCAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuXHR9XG5cdHN0YXRpYyBTdXBwb3J0V2ViR0woKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXHRcdFx0cmV0dXJuICEhICggd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCAmJiAoIGNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnICkgfHwgY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICkgKSApO1xuXHRcdH0gY2F0Y2ggKCBlICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgRGVzdHJveVZpZGVvKHZpZGVvKSB7XG4gICAgICAgIHZpZGVvLnBhdXNlKCk7XG4gICAgICAgIHZpZGVvLnNyYyA9ICcnO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2aWRlby5jaGlsZE5vZGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgXHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICBcdGNoaWxkLnNldEF0dHJpYnV0ZSgnc3JjJywgJycpO1xuICAgICAgICBcdC8vIFdvcmtpbmcgd2l0aCBhIHBvbHlmaWxsIG9yIHVzZSBqcXVlcnlcbiAgICAgICAgXHRkb20udHJlZS5yZW1vdmUoY2hpbGQpXG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIERlc3Ryb3lWaWRlb1RleHR1cmUodGV4dHVyZSkge1xuICAgIFx0dmFyIHZpZGVvID0gdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2VcbiAgICAgICAgVXRpbHMuRGVzdHJveVZpZGVvKHZpZGVvKVxuICAgIH1cbiAgICBzdGF0aWMgUmFuZChtaW4sIG1heCwgZGVjaW1hbHMpIHtcbiAgICAgICAgdmFyIHJhbmRvbU51bSA9IE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pblxuICAgICAgICBpZihkZWNpbWFscyA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgXHRyZXR1cm4gcmFuZG9tTnVtXG4gICAgICAgIH1lbHNle1xuXHQgICAgICAgIHZhciBkID0gTWF0aC5wb3coMTAsIGRlY2ltYWxzKVxuXHQgICAgICAgIHJldHVybiB+figoZCAqIHJhbmRvbU51bSkgKyAwLjUpIC8gZFxuICAgICAgICB9XG5cdH1cblx0c3RhdGljIEdldEltZ1VybElkKHVybCkge1xuXHRcdHZhciBzcGxpdCA9IHVybC5zcGxpdCgnLycpXG5cdFx0cmV0dXJuIHNwbGl0W3NwbGl0Lmxlbmd0aC0xXS5zcGxpdCgnLicpWzBdXG5cdH1cblx0c3RhdGljIFN0eWxlKGRpdiwgc3R5bGUpIHtcbiAgICBcdGRpdi5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBzdHlsZVxuXHRcdGRpdi5zdHlsZS5tb3pUcmFuc2Zvcm0gICAgPSBzdHlsZVxuXHRcdGRpdi5zdHlsZS5tc1RyYW5zZm9ybSAgICAgPSBzdHlsZVxuXHRcdGRpdi5zdHlsZS5vVHJhbnNmb3JtICAgICAgPSBzdHlsZVxuXHRcdGRpdi5zdHlsZS50cmFuc2Zvcm0gICAgICAgPSBzdHlsZVxuICAgIH1cbiAgICBzdGF0aWMgVHJhbnNsYXRlKGRpdiwgeCwgeSwgeikge1xuICAgIFx0aWYgKCd3ZWJraXRUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ21velRyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAnb1RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAndHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlKSB7XG4gICAgXHRcdFV0aWxzLlN0eWxlKGRpdiwgJ3RyYW5zbGF0ZTNkKCcreCsncHgsJyt5KydweCwnK3orJ3B4KScpXG5cdFx0fWVsc2V7XG5cdFx0XHRkaXYuc3R5bGUudG9wID0geSArICdweCdcblx0XHRcdGRpdi5zdHlsZS5sZWZ0ID0geCArICdweCdcblx0XHR9XG4gICAgfVxuICAgIHN0YXRpYyBTcHJpbmdUbyhpdGVtLCB0b1Bvc2l0aW9uLCBpbmRleCkge1xuICAgIFx0dmFyIGR4ID0gdG9Qb3NpdGlvbi54IC0gaXRlbS5wb3NpdGlvbi54XG4gICAgXHR2YXIgZHkgPSB0b1Bvc2l0aW9uLnkgLSBpdGVtLnBvc2l0aW9uLnlcblx0XHR2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeClcblx0XHR2YXIgdGFyZ2V0WCA9IHRvUG9zaXRpb24ueCAtIE1hdGguY29zKGFuZ2xlKSAqIChpdGVtLmNvbmZpZy5sZW5ndGggKiBpbmRleClcblx0XHR2YXIgdGFyZ2V0WSA9IHRvUG9zaXRpb24ueSAtIE1hdGguc2luKGFuZ2xlKSAqIChpdGVtLmNvbmZpZy5sZW5ndGggKiBpbmRleClcblx0XHRpdGVtLnZlbG9jaXR5LnggKz0gKHRhcmdldFggLSBpdGVtLnBvc2l0aW9uLngpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eS55ICs9ICh0YXJnZXRZIC0gaXRlbS5wb3NpdGlvbi55KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHkueCAqPSBpdGVtLmNvbmZpZy5mcmljdGlvblxuXHRcdGl0ZW0udmVsb2NpdHkueSAqPSBpdGVtLmNvbmZpZy5mcmljdGlvblxuICAgIH1cbiAgICBzdGF0aWMgU3ByaW5nVG9TY2FsZShpdGVtLCB0b1NjYWxlLCBpbmRleCkge1xuICAgIFx0dmFyIGR4ID0gdG9TY2FsZS54IC0gaXRlbS5zY2FsZS54XG4gICAgXHR2YXIgZHkgPSB0b1NjYWxlLnkgLSBpdGVtLnNjYWxlLnlcblx0XHR2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeClcblx0XHR2YXIgdGFyZ2V0WCA9IHRvU2NhbGUueCAtIE1hdGguY29zKGFuZ2xlKSAqIChpdGVtLmNvbmZpZy5sZW5ndGggKiBpbmRleClcblx0XHR2YXIgdGFyZ2V0WSA9IHRvU2NhbGUueSAtIE1hdGguc2luKGFuZ2xlKSAqIChpdGVtLmNvbmZpZy5sZW5ndGggKiBpbmRleClcblx0XHRpdGVtLnZlbG9jaXR5U2NhbGUueCArPSAodGFyZ2V0WCAtIGl0ZW0uc2NhbGUueCkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5U2NhbGUueSArPSAodGFyZ2V0WSAtIGl0ZW0uc2NhbGUueSkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5U2NhbGUueCAqPSBpdGVtLmNvbmZpZy5mcmljdGlvblxuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS55ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVdGlsc1xuIiwiLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbi8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcbiBcbi8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbCBieSBFcmlrIE3DtmxsZXIuIGZpeGVzIGZyb20gUGF1bCBJcmlzaCBhbmQgVGlubyBaaWpkZWxcbiBcbi8vIE1JVCBsaWNlbnNlXG4gXG4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG4gXG4gICAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XG4gICAgICAgICAgICB2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTsgfSwgXG4gICAgICAgICAgICAgIHRpbWVUb0NhbGwpO1xuICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH07XG4gXG4gICAgaWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICB9O1xufSgpKTsiLCJpbXBvcnQgRmx1eCBmcm9tICdmbHV4J1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIyfSBmcm9tICdldmVudGVtaXR0ZXIyJ1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG4vLyBBY3Rpb25zXG52YXIgUGFnZXJBY3Rpb25zID0ge1xuICAgIG9uUGFnZVJlYWR5OiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWSxcbiAgICAgICAgXHRpdGVtOiBoYXNoXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9uVHJhbnNpdGlvbk91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgICAgICB0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9uVHJhbnNpdGlvbk91dENvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICBcdFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURSxcbiAgICAgICAgXHRpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uSW5Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgICAgICB0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fQ09NUExFVEUsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgcGFnZVRyYW5zaXRpb25EaWRGaW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNILFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfVxufVxuXG4vLyBDb25zdGFudHNcbnZhciBQYWdlckNvbnN0YW50cyA9IHtcblx0UEFHRV9JU19SRUFEWTogJ1BBR0VfSVNfUkVBRFknLFxuXHRQQUdFX1RSQU5TSVRJT05fSU46ICdQQUdFX1RSQU5TSVRJT05fSU4nLFxuXHRQQUdFX1RSQU5TSVRJT05fT1VUOiAnUEFHRV9UUkFOU0lUSU9OX09VVCcsXG4gICAgUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEUnLFxuXHRQQUdFX1RSQU5TSVRJT05fSU5fQ09NUExFVEU6ICdQQUdFX1RSQU5TSVRJT05fSU5fQ09NUExFVEUnLFxuXHRQQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1M6ICdQQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1MnLFxuXHRQQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDogJ1BBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIJ1xufVxuXG4vLyBEaXNwYXRjaGVyXG52YXIgUGFnZXJEaXNwYXRjaGVyID0gYXNzaWduKG5ldyBGbHV4LkRpc3BhdGNoZXIoKSwge1xuXHRoYW5kbGVQYWdlckFjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaChhY3Rpb24pXG5cdH1cbn0pXG5cbi8vIFN0b3JlXG52YXIgUGFnZXJTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyMi5wcm90b3R5cGUsIHtcbiAgICBmaXJzdFBhZ2VUcmFuc2l0aW9uOiB0cnVlLFxuICAgIHBhZ2VUcmFuc2l0aW9uU3RhdGU6IHVuZGVmaW5lZCwgXG4gICAgZGlzcGF0Y2hlckluZGV4OiBQYWdlckRpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb25UeXBlID0gcGF5bG9hZC50eXBlXG4gICAgICAgIHZhciBpdGVtID0gcGF5bG9hZC5pdGVtXG4gICAgICAgIHN3aXRjaChhY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFk6XG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTU1xuICAgICAgICAgICAgXHR2YXIgdHlwZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTlxuICAgICAgICAgICAgXHRQYWdlclN0b3JlLmVtaXQodHlwZSlcbiAgICAgICAgICAgIFx0YnJlYWtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURTpcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLmVtaXQodHlwZSlcbiAgICAgICAgICAgIFx0YnJlYWtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0g6XG4gICAgICAgICAgICBcdGlmIChQYWdlclN0b3JlLmZpcnN0UGFnZVRyYW5zaXRpb24pIFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbiA9IGZhbHNlXG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0hcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLmVtaXQoYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLmVtaXQoYWN0aW9uVHlwZSwgaXRlbSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0UGFnZXJTdG9yZTogUGFnZXJTdG9yZSxcblx0UGFnZXJBY3Rpb25zOiBQYWdlckFjdGlvbnMsXG5cdFBhZ2VyQ29uc3RhbnRzOiBQYWdlckNvbnN0YW50cyxcblx0UGFnZXJEaXNwYXRjaGVyOiBQYWdlckRpc3BhdGNoZXJcbn1cbiIsImltcG9ydCBzbHVnIGZyb20gJ3RvLXNsdWctY2FzZSdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSBmYWxzZVxuXHRcdHRoaXMuY29tcG9uZW50RGlkTW91bnQgPSB0aGlzLmNvbXBvbmVudERpZE1vdW50LmJpbmQodGhpcylcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gdHJ1ZVxuXHRcdHRoaXMucmVzaXplKClcblx0fVxuXHRyZW5kZXIoY2hpbGRJZCwgcGFyZW50SWQsIHRlbXBsYXRlLCBvYmplY3QpIHtcblx0XHR0aGlzLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdFx0dGhpcy5jaGlsZElkID0gY2hpbGRJZFxuXHRcdHRoaXMucGFyZW50SWQgPSBwYXJlbnRJZFxuXHRcdFxuXHRcdGlmKGRvbS5pc0RvbShwYXJlbnRJZCkpIHtcblx0XHRcdHRoaXMucGFyZW50ID0gcGFyZW50SWRcblx0XHR9ZWxzZXtcblx0XHRcdHZhciBpZCA9IHRoaXMucGFyZW50SWQuaW5kZXhPZignIycpID4gLTEgPyB0aGlzLnBhcmVudElkLnNwbGl0KCcjJylbMV0gOiB0aGlzLnBhcmVudElkXG5cdFx0XHR0aGlzLnBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxuXHRcdH1cblxuXHRcdGlmKHRlbXBsYXRlID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHR9ZWxzZSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdFx0dmFyIHQgPSB0ZW1wbGF0ZShvYmplY3QpXG5cdFx0XHR0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gdFxuXHRcdH1cblx0XHRpZih0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpZCcpID09IHVuZGVmaW5lZCkgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCBzbHVnKGNoaWxkSWQpKVxuXHRcdGRvbS50cmVlLmFkZCh0aGlzLnBhcmVudCwgdGhpcy5lbGVtZW50KVxuXG5cdFx0c2V0VGltZW91dCh0aGlzLmNvbXBvbmVudERpZE1vdW50LCAwKVxuXHR9XG5cdHJlbW92ZSgpIHtcblx0XHR0aGlzLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNvbXBvbmVudFxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlUGFnZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnByb3BzID0gcHJvcHNcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy50bEluID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0aGlzLnRsT3V0ID0gbmV3IFRpbWVsaW5lTWF4KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdFx0dGhpcy5zZXR1cEFuaW1hdGlvbnMoKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5pc1JlYWR5KHRoaXMucHJvcHMuaGFzaCksIDApXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdC8vIHJlc2V0XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0dGhpcy50bEluLnRpbWVTY2FsZSgxLjYpXG5cdFx0c2V0VGltZW91dCgoKT0+dGhpcy50bEluLnBsYXkoMCksIDgwMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLnRsT3V0LmdldENoaWxkcmVuKCkubGVuZ3RoIDwgMSkge1xuXHRcdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSlcblx0XHRcdHRoaXMudGxPdXQudGltZVNjYWxlKDEuOClcblx0XHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxPdXQucGxheSgwKSwgNTAwKVxuXHRcdH1cblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRsSW4uZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSwgMClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSwgMClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Zm9yY2VVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHR0aGlzLnRsT3V0LmNsZWFyKClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50cywgUGFnZXJEaXNwYXRjaGVyfSBmcm9tICdQYWdlcidcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdQYWdlc0NvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEJhc2VQYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICdwYWdlLWInXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25JbiA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4uYmluZCh0aGlzKVxuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCA9IHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2guYmluZCh0aGlzKVxuXHRcdHRoaXMuY29tcG9uZW50cyA9IHtcblx0XHRcdCduZXctY29tcG9uZW50JzogdW5kZWZpbmVkLFxuXHRcdFx0J29sZC1jb21wb25lbnQnOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQmFzZVBhZ2VyJywgcGFyZW50LCB0ZW1wbGF0ZSwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsIHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2gpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnN3aXRjaFBhZ2VzRGl2SW5kZXgoKVxuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0QXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdEFwcFN0b3JlLkZyb250QmxvY2suc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0XHRQYWdlckFjdGlvbnMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0QXBwQWN0aW9ucy5sb2FkUGFnZUFzc2V0cygpXG5cdH1cblx0cGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKSB7XG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCdvbGQtY29tcG9uZW50Jylcblx0fVxuXHRzd2l0Y2hQYWdlc0RpdkluZGV4KCkge1xuXHRcdHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHZhciBvbGRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXVxuXHRcdGlmKG5ld0NvbXBvbmVudCAhPSB1bmRlZmluZWQpIG5ld0NvbXBvbmVudC5wYXJlbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDJcblx0XHRpZihvbGRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBvbGRDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdH1cblx0c2V0dXBOZXdDb21wb25lbnQoaGFzaCwgVHlwZSwgdGVtcGxhdGUpIHtcblx0XHR2YXIgaWQgPSBVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoaGFzaC5wYXJlbnQucmVwbGFjZShcIi9cIiwgXCJcIikpXG5cdFx0dGhpcy5vbGRQYWdlRGl2UmVmID0gdGhpcy5jdXJyZW50UGFnZURpdlJlZlxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAodGhpcy5jdXJyZW50UGFnZURpdlJlZiA9PT0gJ3BhZ2UtYScpID8gJ3BhZ2UtYicgOiAncGFnZS1hJ1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYpXG5cblx0XHR2YXIgcHJvcHMgPSB7XG5cdFx0XHRpZDogdGhpcy5jdXJyZW50UGFnZURpdlJlZixcblx0XHRcdGlzUmVhZHk6IHRoaXMub25QYWdlUmVhZHksXG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUsXG5cdFx0XHRkYXRhOiBBcHBTdG9yZS5wYWdlQ29udGVudCgpXG5cdFx0fVxuXHRcdHZhciBwYWdlID0gbmV3IFR5cGUocHJvcHMpXG5cdFx0cGFnZS5yZW5kZXIoaWQsIGVsLCB0ZW1wbGF0ZSwgcHJvcHMuZGF0YSlcblx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXSA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdFx0dGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gPSBwYWdlXG5cblx0XHRpZihQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPT09IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUykge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10uZm9yY2VVbm1vdW50KClcblx0XHR9XG5cdH1cblx0b25QYWdlUmVhZHkoaGFzaCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblBhZ2VSZWFkeShoYXNoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR1bm1vdW50Q29tcG9uZW50KHJlZikge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1tyZWZdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1tyZWZdLnJlbW92ZSgpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQYWdlclxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiY29udGVudFwiOiB7XG5cdFx0XCJ0d2l0dGVyX3VybFwiOiBcImh0dHBzOi8vdHdpdHRlci5jb20vY2FtcGVyXCIsXG5cdFx0XCJmYWNlYm9va191cmxcIjogXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vQ2FtcGVyXCIsXG5cdFx0XCJpbnN0YWdyYW1fdXJsXCI6IFwiaHR0cHM6Ly9pbnN0YWdyYW0uY29tL2NhbXBlci9cIixcblx0XHRcImxhYl91cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vbGFiXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJNQVBcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiSU5ERVhcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJNZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiV29tZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImZyXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQWNoZXRlclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tbWVcIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiZmVtbWVcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImVzXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJhclwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiaG9tYnJlXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIm11amVyXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJJTkRFWFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkFjcXVpc2l0aVwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwidW9tb1wiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJkb25uYVwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIlxuXHRcdFx0fSxcblx0XHRcdFwiZGVcIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJNQVBcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiSU5ERVhcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIZXJyZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiRGFtZW5cIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcInB0XCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiQ29tcHJlXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJIb21lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJNdWxoZXJcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0XCJsYW5nc1wiOiBbXCJlblwiLCBcImZyXCIsIFwiZXNcIiwgXCJpdFwiLCBcImRlXCIsIFwicHRcIl0sXG5cblx0XCJob21lLXZpZGVvc1wiOiBbXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzgwY2RjNGM1MDM2NDk1ZTQyODAzYjBmZmFiMzAwNDM0MzE1ZWUzODMvZGVpYS1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzdhMTVmN2MwNGViNTRkYWJiODUxMzg2MGNlMmQxYjM0NmQ1ODc5MTAvZGVpYS1tYXRlby5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODM1MDNhZjVmMDE3ZGMzNjYwMWFiMTQyNzc3ZmRlNDFjMmZkOTlhMi9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hNDFhNTlkMGFhMzEzOTcwMzA0N2ZkMWQ3M2U3MTA1ZmI0Nzc2NDQzL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9kMzE2YTEzYTc4M2RmZDk5ZWFlZjlmZWUxMjFmNWE1NzlmYzYyYWI0L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNTFmZDlmZDIwY2U3YmNlMDMzNjA0NWVkM2Y3OWQ2OGNjNDU4ZDU1NS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9jNmJlNjljNjQ2YzEzMWYwYmU2NzA2MmNkNjAwY2IxOWFhNWQyYWIxL2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMzg2ZjViMTA5OTJlNzgwNWUxYmNmN2JkMzg5YTdlZjU1ZWFkYjkwNC9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zOGUzMjY2MTA4OTVjNTExMzYzMDExMDU4ZGMzMDgwNTk0YTgxNDNiL2FyZWxsdWYta29iYXJhaC5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDA5Y2FmNjkzY2U4ZDAyZjZiNjdiN2UwM2I4ZmE3YTUzMjdmNmYzNC9hcmVsbHVmLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTViMzc0ZmEyNzY0NGQ5YzFjZGMwYWVkMjQ1ZDRhYzllMDQ4MGQ4MC9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiXG5cdF0sXG5cblx0XCJmZWVkXCI6IFtcblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXRlb1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkVzdHJlbm8gQ2FtcGVycyBwYXJhIG51ZXN0cm8gd2Vla2VuZCBlbiBEZWlhIEBNYXJ0YVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQcm9maWxlIHBpYz8gbWF5YmU/IG1heWJlIGJhYnk/XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWF0ZW9cIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQb3JxdWUgZXNhIGNhcmEgZGUgZW1vPz8gQE1hdGVvIGxvbGxsXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlRoaXMgc2hvZXMgYXJlIHRoZSBzaG9lcyBNaXJvIHdvdWxkIHdlYXIgaWYgaGUgd2FzIHN0aWxsIGFsaXZlIGFuZCBraWNraW7CtFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiUG9ycXVlIG5vIHZpZW5lcyBhIERlaWEgY29uIEBNYXJ0YSB5IGNvbm1pZ28gZWwgcHJveGltbyB3ZWVrZW5kPz9cIlxuXHRcdFx0XHR9LHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk5vIHB1ZWRvb29vb+KApiB0ZW5nbyBjbGFzZXMgZGUgcGludHVyYSB5IG1pIG1hZHJlIHZpZW5lIGEgdmlzaXRhciAjaGVhdnltZXRhbFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiI2FydHNlbGZpZVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRGVlcCBibHVlICNjYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiVGhhbmtzIGZvciB0aGUgZmxvd2VycyBATWF0ZW8gc29vbyBjdXV1dGUuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJMYXMgZmxvcmVzIHF1ZSBAbWF0ZW8gbWUgcmVnYWxvLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJFcyBUcmVuYyBpcyB0aGUgcGxhY2UgdG8gYmUuIFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJiZWx1Z2FcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQWxsIHRoaXMgc21va2UgaXMgbm90IHdoYXQgeW91IHRoaW5rIGl0IGlzLiBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJpc2FtdVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJFeHRyYW9yZGluYXJ5IGJlYXV0eS4gSSBsb3ZlIHRoZSBuZXcgI2NhbXBlciBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNvIGNhbG0gYXQgRXMgVHJlbmMuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImlzYW11XCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiaXNhbXVcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImlzYW11XCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkhpaWlpaSEhISA6KVwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJOZXcgY2FtcGVyLiBOZXcgY29sb3JzLiBTYW1lIGVuZXJneS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTGFzdCBuaWdodCB3YXMgaW4tc2FuZS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJjYXBhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImNhcGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlNvIG11Y2ggZnVuLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBlbG90YXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiT25jZSB5b3UgZ28gYmxhY2suLi5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlJpZGVycyBvZiBNYWxsb3JjYSAjY2FtcGVyLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBlbG90YXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJObyBzZWxmaWUgbm8gbm90aGluZy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiVGhlc2UgbmV3IENhbXBlcidzIGFyZSB0aGUgYm9tYi4gXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkknbSBub3QgZ29pbmcgaW4gdGhlIHBvb2wgbGlrZSB0aGlzLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQWZ0ZXIgcGFydHkuIEFmdGVyIGxpZmUuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJJIGRhcmUgeW91LlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiV2lzaCB5b3Ugd2hlcmUgaGVyZSAjYXJlbGx1Zi5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImtvYmFyYWhcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQ2FsbCBtZSBQYW5kZW1vbmlhLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk15IG5ldyBDYW1wZXIncyBhcmUgdGhlIFNVViBvZiBzaG9lcy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJGcmVlIGRpdmluZyBleGN1cnRpb25zIHRoaXMgYWZ0ZXJub29uIGF0ICNhcmVsbHVmLiBQTSBtZSBpZiBpbnRlcmVzdGVkLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlBlYWNlIHknYWxsLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJCb2xkIGFuZCBiZWF1dGlmdWwuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkRldG94IGJ5IHRoZSBwb29sLiBNdWNoIG5lZWRlZC5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkkgYW0gbm90IGEgYmltYm8uXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH1cblx0XSxcblxuXHRcImRlZmF1bHQtcm91dGVcIjogXCJcIixcblxuXHRcInJvdXRpbmdcIjoge1xuXHRcdFwiL1wiOiB7XG5cdFx0XHRcInRleHRzXCI6IHtcblx0XHRcdFx0XCJlblwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiVGhlIFNwcmluZy9TdW1tZXIgMjAxNiBjb2xsZWN0aW9uIGlzIGluc3BpcmVkIGJ5IE1hbGxvcmNhLCB0aGUgTWVkaXRlcnJhbmVhbiBpc2xhbmQgdGhhdCBDYW1wZXIgY2FsbHMgaG9tZS4gT3VyIHZpc2lvbiBvZiB0aGlzIHN1bm55IHBhcmFkaXNlIGhpZ2hsaWdodHMgdGhyZWUgaG90IHNwb3RzOiBEZWlhLCBFcyBUcmVuYywgYW5kIEFyZWxsdWYuIEZvciB1cywgTWFsbG9yY2EgaXNu4oCZdCBqdXN0IGEgZGVzdGluYXRpb24sIGl04oCZcyBhIHN0YXRlIG9mIG1pbmQuICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiVGhlIHZpbGxhZ2Ugb2YgRGVpYSBoYXMgbG9uZyBhdHRyYWN0ZWQgYm90aCByZXRpcmVlcyBhbmQgcm9jayBzdGFycyB3aXRoIGl0cyBwaWN0dXJlc3F1ZSBzY2VuZXJ5IGFuZCBjaGlsbCB2aWJlLiBUaGUgc2VlbWluZ2x5IHNsZWVweSBjb3VudHJ5c2lkZSBoYXMgYSBib2hlbWlhbiBzcGlyaXQgdW5pcXVlIHRvIHRoaXMgbW91bnRhaW4gZW5jbGF2ZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIlRoZSBmaXN0LXB1bXBpbmcgcmFnZXJzIG9mIEFyZW5hbCBhbmQgdW5icmlkbGVkIGRlYmF1Y2hlcnkgb2YgTWFnYWx1ZiBtZWV0IGluIEFyZWxsdWYsIGFuIGltYWdpbmVkIGJ1dCBlcGljIHBhcnQgb2Ygb3VyIHZpc2lvbiBvZiB0aGlzIGJlbG92ZWQgaXNsYW5kLiBJdOKAmXMgYWxsIG5lb24gYW5kIG5vbi1zdG9wIHBhcnR5aW5nIGluIHRoZSBzdW1tZXIgc3VuIOKAkyBxdWl0ZSBsaXRlcmFsbHkgYSBob3QgbWVzcy4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJUaGlzIGNvYXN0YWwgd2lsZGVybmVzcyBib2FzdHMgYnJlYXRodGFraW5nIGJlYWNoZXMgYW5kIGEgc2VyZW5lIGF0bW9zcGhlcmUuIFRoZSBzZWFzaWRlIGhhcyBhbiB1bnRhbWVkIHlldCBwZWFjZWZ1bCBmZWVsaW5nIHRoYXQgaXMgYm90aCBpbnNwaXJpbmcgYW5kIHNvb3RoaW5nLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJmclwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGVjdGlvbiBQcmludGVtcHMvw4l0w6kgMjAxNiBz4oCZaW5zcGlyZSBkZSBNYWpvcnF1ZSwgbOKAmcOubGUgbcOpZGl0ZXJyYW7DqWVubmUgZCdvw7kgQ2FtcGVyIGVzdCBvcmlnaW5haXJlLiBOb3RyZSB2aXNpb24gZGUgY2UgcGFyYWRpcyBlbnNvbGVpbGzDqSBzZSByZWZsw6h0ZSBkYW5zIHRyb2lzIGxpZXV4IGluY29udG91cm5hYmxlcyA6IERlaWEsIEVzIFRyZW5jIGV0IEFyZWxsdWYuIFBvdXIgbm91cywgTWFqb3JxdWUgZXN0IHBsdXMgcXXigJl1bmUgc2ltcGxlIGRlc3RpbmF0aW9uIDogY+KAmWVzdCB1biDDqXRhdCBk4oCZZXNwcml0LiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkxlIHZpbGxhZ2UgZGUgRGVpYSBhdHRpcmUgZGVwdWlzIGxvbmd0ZW1wcyBsZXMgcmV0cmFpdMOpcyBjb21tZSBsZXMgcm9jayBzdGFycyBncsOiY2Ugw6Agc2VzIHBheXNhZ2VzIHBpdHRvcmVzcXVlcyBldCBzb24gYW1iaWFuY2UgZMOpY29udHJhY3TDqWUuIFNhIGNhbXBhZ25lIGTigJlhcHBhcmVuY2UgdHJhbnF1aWxsZSBhZmZpY2hlIHVuIGVzcHJpdCBib2jDqG1lIGNhcmFjdMOpcmlzdGlxdWUgZGUgY2V0dGUgZW5jbGF2ZSBtb250YWduZXVzZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkzigJlleGFsdGF0aW9uIGTigJlBcmVuYWwgZXQgbGVzIHNvaXLDqWVzIGTDqWJyaWTDqWVzIGRlIE1hZ2FsdWYgc2UgcmVqb2lnbmVudCDDoCBBcmVsbHVmLCB1biBsaWV1IGltYWdpbmFpcmUgbWFpcyBjZW50cmFsIGRhbnMgbm90cmUgdmlzaW9uIGRlIGNldHRlIMOubGUgYWRvcsOpZS4gVG91dCB5IGVzdCBxdWVzdGlvbiBkZSBmbHVvIGV0IGRlIGbDqnRlcyBzYW5zIGZpbiBhdSBzb2xlaWwgZGUgbOKAmcOpdMOpIDogdW4gam95ZXV4IGJhemFyLCBlbiBzb21tZS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJDZXR0ZSBuYXR1cmUgc2F1dmFnZSBjw7R0acOocmUgam91aXQgZOKAmXVuZSBzdXBlcmJlIHBsYWdlIGV0IGTigJl1bmUgYXRtb3NwaMOocmUgY2FsbWUuIExlIGJvcmQgZGUgbWVyIGEgdW4gY8O0dMOpIMOgIGxhIGZvaXMgdHJhbnF1aWxsZSBldCBpbmRvbXB0w6kgcXVpIGluc3BpcmUgYXV0YW50IHF14oCZaWwgYXBhaXNlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJlc1wiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sZWNjacOzbiBwcmltYXZlcmEvdmVyYW5vIDIwMTYgZXN0w6EgaW5zcGlyYWRhIGVuIE1hbGxvcmNhLCBsYSBpc2xhIG1lZGl0ZXJyw6FuZWEgcXVlIENhbXBlciBjb25zaWRlcmEgc3UgaG9nYXIuIE51ZXN0cmEgdmlzacOzbiBkZSBlc3RlIHBhcmHDrXNvIHNvbGVhZG8gZGVzdGFjYSB0cmVzIGx1Z2FyZXMgaW1wb3J0YW50ZXM6IERlaWEsIEVzIFRyZW5jIHkgQXJlbGx1Zi4gUGFyYSBub3NvdHJvcywgTWFsbG9yY2Egbm8gZXMgdGFuIHNvbG8gdW4gZGVzdGlubywgZXMgdW4gZXN0YWRvIGRlIMOhbmltby4gI01hbGxvcmNhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImRlaWFcIjogXCJMb3MgaG9yaXpvbnRlcyBwaW50b3Jlc2NvcyB5IGxhIHRyYW5xdWlsaWRhZCBkZWwgcHVlYmxvIGRlIERlaWEgbGxldmFuIG11Y2hvIHRpZW1wbyBjYXV0aXZhbmRvIHRhbnRvIGEgYXJ0aXN0YXMgcmV0aXJhZG9zIGNvbW8gYSBlc3RyZWxsYXMgZGVsIHJvY2suIEVsIHBhaXNhamUgcnVyYWwgZGUgYXBhcmVudGUgY2FsbWEgcG9zZWUgdW4gZXNww61yaXR1IGJvaGVtaW8gcHJvcGlvIGRlIGVzdGUgZW5jbGF2ZSBtb250YcOxb3NvLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiTGEgbG9jdXJhIGZpZXN0ZXJhIGRlIFPigJlBcmVuYWwgeSBlbCBkZXNlbmZyZW5vIGRlIE1hZ2FsdWYgc2UgcmXDum5lbiBlbiBBcmVsbHVmLCB1bmEgY3JlYWNpw7NuIGRlbnRybyBkZSBudWVzdHJhIHZpc2nDs24gZGUgZXN0YSBxdWVyaWRhIGlzbGEuIFRvZG8gZ2lyYSBlbiB0b3JubyBhbCBuZcOzbiB5IGxhIGZpZXN0YSBzaW4gZmluIGJham8gZWwgc29sLiBFbiBkZWZpbml0aXZhLCB1bmEgY29tYmluYWNpw7NuIGV4cGxvc2l2YS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJFc3RlIGVzcGFjaW8gbmF0dXJhbCB2aXJnZW4gY3VlbnRhIGNvbiB1bmEgcGxheWEgaW1wcmVzaW9uYW50ZSB5IHVuIGFtYmllbnRlIHNlcmVuby4gTGEgY29zdGEsIHNhbHZhamUgeSBwYWPDrWZpY2EgYWwgbWlzbW8gdGllbXBvLCB0cmFuc21pdGUgdW5hIHNlbnNhY2nDs24gZXZvY2Fkb3JhIHkgcmVsYWphbnRlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJpdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiTGEgY29sbGV6aW9uZSBQcmltYXZlcmEvRXN0YXRlIDIwMTYgw6ggaXNwaXJhdGEgYSBNYWlvcmNhLCBs4oCZaXNvbGEgZGVsIE1lZGl0ZXJyYW5lbyBjaGUgaGEgZGF0byBpIG5hdGFsaSBhIENhbXBlci4gTGEgbm9zdHJhIHZpc2lvbmUgZGkgcXVlc3RvIHBhcmFkaXNvIGFzc29sYXRvIHNpIHNvZmZlcm1hIHN1IHRyZSBsdW9naGkgc2ltYm9sbzogRGVpYSwgRXMgVHJlbmMgZSBBcmVsbHVmLiBQZXIgbm9pLCBNYWlvcmNhIG5vbiDDqCB1bmEgc2VtcGxpY2UgbWV0YSwgw6ggdW5vIHN0YXRvIGQnYW5pbW8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiRGEgdGVtcG8sIGlsIHZpbGxhZ2dpbyBkaSBEZWlhIGF0dGlyYSBwZW5zaW9uYXRpIGUgcm9jayBzdGFyIGNvbiBpbCBzdW8gcGFlc2FnZ2lvIHBpdHRvcmVzY28gZSBsJ2F0bW9zZmVyYSByaWxhc3NhdGEuIExhIGNhbXBhZ25hIGFwcGFyZW50ZW1lbnRlIHNvbm5vbGVudGEgaGEgdW5vIHNwaXJpdG8gYm9ow6ltaWVuIHRpcGljbyBkaSBxdWVzdG8gcGFlc2lubyBkaSBtb250YWduYS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkdsaSBzY2F0ZW5hdGkgZmVzdGFpb2xpIGRpIEFyZW5hbCBlIGxhIHNmcmVuYXRhIGRpc3NvbHV0ZXp6YSBkaSBNYWdhbHVmIHNpIGZvbmRvbm8gaW4gQXJlbGx1ZiwgdW5hIHBhcnRlIGltbWFnaW5hcmlhIG1hIGVwaWNhIGRlbGxhIG5vc3RyYSB2aXNpb25lIGRpIHF1ZXN0YSBhZG9yYXRhIGlzb2xhLiDDiCB1biB0dXJiaW5pbyBkaSBsdWNpIGFsIG5lb24gZSBmZXN0ZSBpbmludGVycm90dGUgc290dG8gaWwgc29sZSBlc3Rpdm8sIHVuIGNhb3MgcGF6emVzY28uICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiUXVlc3QnYXJlYSBwcm90ZXR0YSB2YW50YSB1bmEgc3BpYWdnaWEgbW96emFmaWF0byBlIHVuJ2F0bW9zZmVyYSBzZXJlbmEuIElsIGxpdG9yYWxlIGhhIHVuIGNoZSBkaSBzZWx2YWdnaW8sIG1hIHBhY2lmaWNvLCBjaGUgw6ggc3VnZ2VzdGl2byBlIHJpbGFzc2FudGUgYWwgdGVtcG8gc3Rlc3NvLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJkZVwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiRGllIEtvbGxla3Rpb24gRnLDvGhqYWhyL1NvbW1lciAyMDE2IGhhdCBzaWNoIHZvbiBNYWxsb3JjYSBpbnNwaXJpZXJlbiBsYXNzZW4sIGRlciBNaXR0ZWxtZWVyaW5zZWwsIGF1ZiBkZXIgQ2FtcGVyIHp1IEhhdXNlIGlzdC4gVW5zZXJlIFZpc2lvbiBkZXMgU29ubmVucGFyYWRpZXNlcyBiZWZhc3N0IHNpY2ggbWl0IGRyZWkgSG90c3BvdHM6IERlaWEsIEVzIFRyZW5jIHVuZCBBcmVsbHVmLiBGw7xyIHVucyBpc3QgTWFsbG9yY2EgbWVociBhbHMgbnVyIGVpbiBSZWlzZXppZWwsIGVzIGlzdCBlaW5lIExlYmVuc2VpbnN0ZWxsdW5nLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkRlciBPcnQgRGVpYSBtaXQgc2VpbmVyIG1hbGVyaXNjaGVuIExhbmRzY2hhZnQgdW5kIEzDpHNzaWdrZWl0IHppZWh0IHNlaXQgdmllbGVuIEphaHJlbiBuaWNodCBudXIgUGVuc2lvbsOkcmUsIHNvbmRlcm4gYXVjaCBSb2Nrc3RhcnMgYW4uIERpZSB2ZXJzY2hsYWZlbiBhbm11dGVuZGUgR2VnZW5kIHZlcnNwcsO8aHQgZWluZW4gZ2FueiBiZXNvbmRlcmVuIEJvaGVtaWFuLUNoYXJtZSwgZGVyIGVpbnppZ2FydGlnIGlzdCBmw7xyIGRpZXNlIEdlYmlyZ3NlbmtsYXZlLiAjRGVpYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJhcmVsbHVmXCI6IFwiRGllIGdlc3TDpGhsdGVuIEvDtnJwZXIgdm9uIEFyZW5hbCB1bmQgZGllIHVuZ2V6w7xnZWx0ZSBPZmZlbmhlaXQgdm9uIE1hZ2FsdWYgdHJlZmZlbiBpbiBBcmVsbHVmIGF1ZmVpbmFuZGVyIOKAkyBlaW4gZmFudGFzaWV2b2xsZXMgdW5kIGRvY2ggdW1mYXNzZW5kZXMgRWxlbWVudCB1bnNlcmVyIFZpc2lvbiBkZXIgYmVsaWVidGVuIEluc2VsLiBFaW4gU29tbWVyIGF1cyBlbmRsb3NlbiBQYXJ0eXMgaW4gTmVvbmZhcmJlbiDigJMgZWluIGVjaHQgaGVpw59lciBPcnQuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiRGllc2VyIHVuYmVyw7xocnRlIEvDvHN0ZW5zdHJlaWZlbiB2ZXJmw7xndCDDvGJlciBlaW5lbiBhdGVtYmVyYXViZW5kZW4gU3RyYW5kIHVuZCBlaW5lIGJlcnVoaWdlbmRlIEF0bW9zcGjDpHJlLiBEYXMgTWVlciBpc3QgdW5nZXrDpGhtdCB1bmQgZnJpZWR2b2xsIHp1Z2xlaWNoIHVuZCBkaWVudCBhbHMgUXVlbGxlIGRlciBJbnNwaXJhdGlvbiBlYmVuc28gd2llIGFscyBSdWhlcG9sLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJwdFwiOiB7XG5cdFx0XHRcdFx0XCJnZW5lcmljXCI6IFwiQSBjb2xlw6fDo28gcHJpbWF2ZXJhL3ZlcsOjbyAyMDE2IHRlbSBNYWlvcmNhIGNvbW8gaW5zcGlyYcOnw6NvLCBhIGlsaGEgbWVkaXRlcnLDom5lYSBxdWUgYSBDYW1wZXIgY2hhbWEgZGUgY2FzYS4gQSBub3NzYSB2aXPDo28gZGVzdGUgcGFyYcOtc28gc29sYXJlbmdvIHJlYWzDp2EgdHLDqnMgbG9jYWlzIGltcG9ydGFudGVzOiBEZWlhLCBFcyBUcmVuYyBlIEFyZWxsdWYuIFBhcmEgbsOzcywgTWFpb3JjYSBuw6NvIMOpIHPDsyB1bSBkZXN0aW5vIGRlIGbDqXJpYXMsIG1hcyB0YW1iw6ltIHVtIGVzdGFkbyBkZSBlc3DDrXJpdG8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiQSBhbGRlaWEgZGUgRGVpYSBzZW1wcmUgYXRyYWl1IHJlZm9ybWFkb3MgZSBlc3RyZWxhcyBkZSByb2NrIGRldmlkbyDDoCBzdWEgcGFpc2FnZW0gcGl0b3Jlc2NhIGUgYW1iaWVudGUgZGVzY29udHJhw61kby4gRXN0YSBhbGRlaWEgY2FtcGVzdHJlIGFwYXJlbnRlbWVudGUgcGFjYXRhIHRlbSB1bSBlc3DDrXJpdG8gYm/DqW1pbywgZXhjbHVzaXZvIGRlc3RlIGVuY2xhdmUgbW9udGFuaG9zby4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkFzIGdyYW5kZXMgZmVzdGFzIGRlIEFyZW5hbCBlIGEgZGl2ZXJzw6NvIHNlbSBsaW1pdGVzIGRlIE1hZ2FsdWYgcmXDum5lbS1zZSBlbSBBcmVsbHVmLCB1bWEgcGFydGUgaW1hZ2luYWRhIG1hcyDDqXBpY2EgZGEgbm9zc2Egdmlzw6NvIGRlc3RhIGlsaGEgdMOjbyBhbWFkYSBwb3IgbsOzcy4gQSBjb21iaW5hw6fDo28gcGVyZmVpdGEgZW50cmUgdG9ucyBuw6lvbiBlIGZlc3RhcyBpbXBhcsOhdmVpcyBzb2IgbyBzb2wgZGUgdmVyw6NvICh1bWEgbWlzdHVyYSBiZW0gcXVlbnRlLCBuYSByZWFsaWRhZGUpLiAjQXJlbGx1ZkJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJlcy10cmVuY1wiOiBcIkVzdGEgdmFzdGEgcmVnacOjbyBjb3N0ZWlyYSBwb3NzdWkgcHJhaWFzIGltcHJlc3Npb25hbnRlcyBlIHVtIGFtYmllbnRlIHNlcmVuby4gTyBsaXRvcmFsIHRlbSB1bWEgYXRtb3NmZXJhIHNlbHZhZ2VtIGUgdHJhbnF1aWxhIGFvIG1lc21vIHRlbXBvLCBxdWUgw6kgdGFudG8gaW5zcGlyYWRvcmEgY29tbyByZWxheGFudGUuICNFc1RyZW5jQnlDYW1wZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0XCJhc3NldHNcIjogW1xuXHRcdFx0XHRcImJhY2tncm91bmQuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1jYXBhcy5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWtvYmFyYWguanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wYXJhZGlzZS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLXBlbG90YXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1tYXJ0YS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hcnRhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtbWF0ZW8uanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtYmVsdWdhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWlzYW11LmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxODgsIFwic1wiOiA4NSwgXCJ2XCI6IDYxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM1NywgXCJzXCI6IDk3LCBcInZcIjogMjYgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM1OSwgXCJzXCI6IDkzLCBcInZcIjogNTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2I3NDFlZWIxNzM3YTY4MmY1NjQ2Y2JhMTdlMDQwNjMwYTFkZDAxOGEvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJCcmVha2luZyB1cCBvbiBhIHRleHQgbWVzc2FnZS4gbm90IHZlcnkgZGVpYSB0aGluZyB0byBkb1wiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvZHViX2RlaWFfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiYXpqYzJqaDYyalwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcIjZwMzJseXZkcW9cIlxuICAgICAgICB9LFxuICAgICAgICBcImRlaWEvbWF0ZW9cIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZTQyNDg4OWFjMDI2ZjcwZTU0NGFmMDMwMzVlNzE4N2YzNDk0MTcwNS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzcsIFwic1wiOiA4OSwgXCJ2XCI6IDgzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA4NiwgXCJ2XCI6IDU3IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMzQ0YzcxMTIzODk3NzQ5MGMwNzMwNTA5ZTczYmExMTdmOTQ2NDMzOC9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiYnV5cyBhbiBhdGVsaWVyIGF0IGRlaWEuIHN0YXJ0cyBjYXJlZXIgYXMgYW4gYXJ0aXN0XCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9tYXRlb19kZWlhX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjZoZXQxa25pazNcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCI2cDMybHl2ZHFvXCJcbiAgICAgICAgfSxcblxuICAgICAgICBcImRlaWEvbWFydGFcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzQ2LCBcInNcIjogNzAsIFwidlwiOiA1NSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyNDQsIFwic1wiOiAyOSwgXCJ2XCI6IDczIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyNDQsIFwic1wiOiAyOSwgXCJ2XCI6IDczIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9kMTU5YjU1ZmY4Y2VjYzljYmQ4YzBjMTJlZTI3ODFlMmVkYTIzZTkzL2RlaWEtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJGT01PIG9mIG5vdCBiZWluZyBhdCBkZWlhXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL21hcnRhX2RlaWFfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwidG9ybzJwZTQ2OVwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcImJna3g3Z21rMTNcIlxuICAgICAgICB9LFxuXG4gICAgICAgIFwiZXMtdHJlbmMvYmVsdWdhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEyLCBcInNcIjogMTAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAxMiwgXCJ2XCI6IDQ1IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAwLCBcInZcIjogNDUgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzcwNDU1YWQ3M2FmN2I3ZTM1ZTllNjc0MTA5OTI5YzNiNzAyOTQwNjQvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiRXMgVHJlbmMgbnVkaXN0IFBBUlRZIEJPWVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvYmVsdWdhX2VzX3RyZW5jX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImZvMTEyemg3cHZcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCI5N2J2cHpodG5iXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJlcy10cmVuYy9pc2FtdVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEwLCBcInNcIjogMSwgXCJ2XCI6IDc0IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIxLCBcInNcIjogMzUsIFwidlwiOiA3MiB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAsIFwic1wiOiA0NSwgXCJ2XCI6IDMwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8wNjY3OWYzZWJkNjk2ZTljNDJmZDEzY2Y5ZGJkYWVmZmU5YjFmODczL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiVUZPIHNpZ2h0aW5nIGF0IGVzIHRyZW5jXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL2lzYW11X2VzX3RyZW5jX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjF4c2FicTd5ZXlcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJ4bmxueWVlODNvXCJcbiAgICAgICAgfSxcblxuXHRcdFwiYXJlbGx1Zi9jYXBhc1wiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDAsIFwic1wiOiAwLCBcInZcIjogMCB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiA4LCBcInNcIjogNzYsIFwidlwiOiA5MSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzQ4ZmYxYzU4Yjg2YjA4OTEyNjgxYjRmZGYzYjc1NDdjNzU3NzY2ZDcvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIk1FQU5XSElMRSBJTiBBUkVMTFVGXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9jYXBhc19hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIno3b3I2OGRhMXZcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJrZmMwdTF2dmhwXCJcblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMSwgXCJzXCI6IDk1LCBcInZcIjogMjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjIsIFwic1wiOiAzNSwgXCJ2XCI6IDc5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMzMsIFwic1wiOiAzNSwgXCJ2XCI6IDEwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hYzE2ZDUzYzRmOWU4ZmQ2OTMwNzc5ZTIzNzg1NDY4N2RjZjI0MWU4L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIQVQgSEFQUEVOUyBJTiBBUkVMTFVGIFNUQVlTIElOIEFSRUxMVUZcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL3BlbG90YXNfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJmOWRvMnFsd25qXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwia3lqa2J3Y242dlwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9tYXJ0YVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2FyZWxsdWYtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMDAsIFwic1wiOiA1NywgXCJ2XCI6IDgxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwMSwgXCJzXCI6IDEwMCwgXCJ2XCI6IDY5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNWI5ZDI3MDYxMDBlNWVhMGQzMTcxNDNlMjM3NGQ2YmQ2Yzk2MDdiMS9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiQkFEIFRSSVAgQVQgVEhFIEhPVEVMIFBPT0xcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMvbWFydGFfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJwcGttZmRsNWpxXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwicjY0aWoyb2poM1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9rb2JhcmFoXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzI5ODBmMTRjYzhiZDk5MTJiMTRkY2E0NmE0Y2Q0YTg1ZmEwNDc3NGMvYXJlbGx1Zi1rb2JhcmFoLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjY0LCBcInNcIjogNjksIFwidlwiOiA0MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNDQsIFwic1wiOiA1NiwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMzQ0LCBcInNcIjogNDEsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvYXJlbGx1Zi1rb2JhcmFoLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiSGF0ZXJzIHdpbGwgc2F5IGl0cyBwaG90b3Nob3BcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMva29iYXJhaF9hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjl4ZTV2anp5Ym9cIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJvNzlkcXBocHNsXCJcbiAgICAgICAgfSxcblx0XHRcImFyZWxsdWYvZHViXCI6IHtcblx0XHRcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjJiMzYwYzhjYTM5OTY5Njk4NTMxM2RkZTk5YmE4M2Q0ZWM5NzJiNy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDE5NiwgXCJzXCI6IDUyLCBcInZcIjogMzMgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTg3YmRhYjAxMjk3OTgyMmI4MTg2Mzc4MzdjYzI4ODQxNGNlZjhmMy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIRU4gWU9VIENBTidUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvZHViX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiZGxnNWF6eTVhclwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcInFwaGo5cDN0NWhcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvcGFyYWRpc2VcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogNTksIFwic1wiOiAxOSwgXCJ2XCI6IDk5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwNywgXCJzXCI6IDMxLCBcInZcIjogMTAwIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxODMsIFwic1wiOiA3MSwgXCJ2XCI6IDY0IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy81ZGMxOTcyNmVmYTdiMmU3NTZjODA1MzRkNDNmYTYwMGNjNjFmMTc4L2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJTRUxGSUUgT04gV0FURVJTTElERSBMSUtFIEEgQk9TU1wiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9wYXJhZGlzZV9hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImg4OXkwa3V3eTJcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCIzNDN0MXNuMm5wXCJcbiAgICAgICAgfVxuXG5cdH1cbn0iXX0=
