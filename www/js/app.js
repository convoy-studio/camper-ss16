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

var App = (function () {
	function App() {
		_classCallCheck(this, App);

		this.onAppReady = this.onAppReady.bind(this);
		this.loadMainAssets = this.loadMainAssets.bind(this);
	}

	_createClass(App, [{
		key: 'init',
		value: function init() {
			// Init router
			this.router = new _Router2['default']();
			this.router.init();

			// Init Preloader
			_AppStore2['default'].Preloader = new _Preloader2['default']();

			// Init global events
			window.GlobalEvents = new _GlobalEvents2['default']();
			GlobalEvents.init();

			var appTemplate = new _AppTemplate2['default']();
			appTemplate.isReady = this.loadMainAssets;
			appTemplate.render('#app-container');

			// Start routing
			this.router.beginRouting();
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
			_AppActions2['default'].pageHasherChanged();
		}
	}]);

	return App;
})();

exports['default'] = App;
module.exports = exports['default'];

},{"./AppTemplate":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplate.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./services/GlobalEvents":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/GlobalEvents.js","./services/Preloader":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Preloader.js","./services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppMobile.js":[function(require,module,exports){
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

			// Start routing
			router.beginRouting();
		}
	}]);

	return AppMobile;
})();

exports['default'] = AppMobile;
module.exports = exports['default'];

},{"./AppTemplateMobile":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplateMobile.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./services/GlobalEvents":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/GlobalEvents.js","./services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplate.js":[function(require,module,exports){
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

var AppTemplateMobile = (function (_BaseComponent) {
	_inherits(AppTemplateMobile, _BaseComponent);

	function AppTemplateMobile() {
		_classCallCheck(this, AppTemplateMobile);

		_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'constructor', this).call(this);
		this.resize = this.resize.bind(this);
	}

	_createClass(AppTemplateMobile, [{
		key: 'render',
		value: function render(parent) {
			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'render', this).call(this, 'AppTemplateMobile', parent, undefined);
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

			// this.frontContainer = new FrontContainer()
			// this.frontContainer.render('#app-template')

			// this.pagesContainer = new PagesContainer()
			// this.pagesContainer.render('#app-template')

			console.log('mobile yo');

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
		key: 'resize',
		value: function resize() {
			// this.pagesContainer.resize()
			// this.frontContainer.resize()
			_get(Object.getPrototypeOf(AppTemplateMobile.prototype), 'resize', this).call(this);
		}
	}]);

	return AppTemplateMobile;
})(_BaseComponent3['default']);

exports['default'] = AppTemplateMobile;
module.exports = exports['default'];

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/FrontContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/FrontContainer.js","./components/PagesContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PagesContainer.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js":[function(require,module,exports){
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

		this.onPageChange = this.onPageChange.bind(this);
	}

	_createClass(FrontContainer, [{
		key: 'render',
		value: function render(parent) {
			var scope = {};
			var generaInfos = _AppStore2['default'].generalInfos();
			scope.infos = _AppStore2['default'].globalContent();
			scope.facebookUrl = generaInfos['facebook_url'];
			scope.twitterUrl = generaInfos['twitter_url'];
			scope.instagramUrl = generaInfos['instagram_url'];
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

			_AppStore2['default'].on(_AppConstants2['default'].PAGE_HASHER_CHANGED, this.onPageChange);

			this.headerLinks = (0, _headerLinks2['default'])(this.element);
			this.socialLinks = (0, _socialLinks2['default'])(this.element);

			_get(Object.getPrototypeOf(FrontContainer.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'onPageChange',
		value: function onPageChange() {
			var hashObj = _Router2['default'].getNewHash();
			if (hashObj.type == _AppConstants2['default'].DIPTYQUE) {
				this.socialLinks.hide();
			} else {
				this.socialLinks.show();
			}
		}
	}, {
		key: 'resize',
		value: function resize() {

			if (!this.domIsReady) return;
			this.headerLinks.resize();
			this.socialLinks.resize();
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

			this.stats = new Stats();
			// this.stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

			// align top-left
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '0px';
			this.stats.domElement.style.top = '0px';
			this.stats.domElement.style['z-index'] = 999999;

			document.body.appendChild(this.stats.domElement);
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
			this.stats.update();
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
			_AppStore2['default'].Canvas.style['z-index'] = 4;
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

},{"./../../pager/components/BasePage":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePage.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/PxHelper":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/PxHelper.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PagesContainer.js":[function(require,module,exports){
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
	var bottomTextsContainer = _domHand2['default'].select('.bottom-texts-container', parent);
	var leftBlock = _domHand2['default'].select('.left-text', bottomTextsContainer);
	var rightBlock = _domHand2['default'].select('.right-text', bottomTextsContainer);
	var leftFront = _domHand2['default'].select('.front-wrapper', leftBlock);
	var rightFront = _domHand2['default'].select('.front-wrapper', rightBlock);

	var resize = function resize() {
		var windowW = _AppStore2['default'].Window.w;
		var windowH = _AppStore2['default'].Window.h;

		var blockSize = [windowW / _AppConstants2['default'].GRID_ROWS, windowH / _AppConstants2['default'].GRID_COLUMNS];

		leftBlock.style.width = blockSize[0] * 2 + 'px';
		leftBlock.style.height = blockSize[1] + 'px';
		rightBlock.style.width = blockSize[0] * 2 + 'px';
		rightBlock.style.height = blockSize[1] + 'px';

		leftBlock.style.top = windowH - blockSize[1] + 'px';
		rightBlock.style.top = windowH - blockSize[1] + 'px';
		rightBlock.style.left = windowW - blockSize[0] * 2 + 'px';

		setTimeout(function () {
			leftFront.style.top = (blockSize[1] >> 1) - (leftFront.clientHeight >> 1) + 'px';
			rightFront.style.top = (blockSize[1] >> 1) - (rightFront.clientHeight >> 1) + 'px';
			rightFront.style.left = (blockSize[0] << 1 >> 1) - (rightFront.clientWidth >> 1) + 'px';
		});
	};

	scope = {
		resize: resize
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
			mask.clear();
			sprite.destroy();
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

exports['default'] = function (pxContainer, parent, mouse, data) {
	var scope;
	var isReady = false;
	var onCloseTimeout;
	var el = _domHand2['default'].select('.fun-fact-wrapper', parent);
	var videoWrapper = _domHand2['default'].select('.video-wrapper', el);
	var messageWrapper = _domHand2['default'].select('.message-wrapper', el);
	var messageInner = _domHand2['default'].select('.message-inner', messageWrapper);

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
		scope.close();
	};

	var open = function open() {
		scope.isOpen = true;
		leftRects.open();
		rightRects.open();
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
		scope.isOpen = false;
		leftRects.close();
		rightRects.close();
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
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var midWindowW = windowW >> 1;

			var size = [midWindowW + 1, windowH];

			leftRects.resize(size[0], size[1], _AppConstants2['default'].TOP);
			rightRects.resize(size[0], size[1], _AppConstants2['default'].BOTTOM);
			rightRects.holder.x = windowW / 2;

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
			pxContainer.removeChild(holder);
			leftRects.clear();
			leftRects = null;
			rightRects.clear();
			rightRects = null;
			holder = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./colory-rects":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/colory-rects.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","color-utils":"color-utils","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js":[function(require,module,exports){
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
	var linesGridContainer = _domHand2['default'].select('.lines-grid-container', parent);
	var gridChildren = gridContainer.children;
	var linesHorizontal = _domHand2['default'].select(".lines-grid-container .horizontal-lines", parent).children;
	var linesVertical = _domHand2['default'].select(".lines-grid-container .vertical-lines", parent).children;
	var scope;
	var currentSeat;
	var cells = [];
	var totalNum = props.data.grid.length;
	var videos = _AppStore2['default'].getHomeVideos();

	var seats = [1, 3, 5, 7, 9, 11, 15, 17, 21, 23, 25];

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
		cells[i] = undefined;
		for (var j = 0; j < seats.length; j++) {
			if (i == seats[j]) {
				mCell = (0, _mediaCell2['default'])(vParent, videos[counter]);
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

	var animParams = function animParams(parent, el, dir) {
		// state
		// over, out
		return {
			state: 'out',
			parent: parent,
			el: el,
			dir: dir,
			time: 0,
			position: { x: 0, y: 0 },
			fposition: { x: 0, y: 0 },
			iposition: { x: 0, y: 0 },
			scale: { x: 0, y: 0 },
			fscale: { x: 0, y: 0 },
			iscale: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
			velocityScale: { x: 0, y: 0 },
			rotation: 0,
			config: {
				length: 0,
				spring: 0.4,
				friction: 0.7
			}
		};
	};

	var scope;
	var el = _domHand2['default'].select('.main-btns-wrapper', container);
	var shopBtn = _domHand2['default'].select('#shop-btn', el);
	var funBtn = _domHand2['default'].select('#fun-fact-btn', el);
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

	var shopImg = (0, _img2['default'])('image/shop.png', function () {
		shopAnim = animParams(shopBtn, shopImg, 1);
		buttons['shop-btn'].anim = shopAnim;
		shopSize = [shopImg.width, shopImg.height];
		_domHand2['default'].tree.add(shopBtn, shopImg);
		scope.resize();
	});
	var funImg = (0, _img2['default'])('image/fun-facts.png', function () {
		funAnim = animParams(funBtn, funImg, -1);
		buttons['fun-fact-btn'].anim = funAnim;
		funSize = [funImg.width, funImg.height];
		_domHand2['default'].tree.add(funBtn, funImg);
		scope.resize();
	});

	_domHand2['default'].event.on(shopBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(shopBtn, 'click', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseenter', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'mouseleave', onMouseEventsHandler);
	_domHand2['default'].event.on(funBtn, 'click', onMouseEventsHandler);

	var updateAnim = function updateAnim(anim) {
		anim.time += 0.1;
		anim.fposition.x = anim.iposition.x;
		anim.fposition.y = anim.iposition.y;
		anim.fposition.x += (mouse.nX - 0.5) * 6 * anim.dir;
		anim.fposition.y += (mouse.nY - 0.5) * 12 * anim.dir;

		springTo(anim, anim.fposition, 1);
		anim.config.length += (0.01 - anim.config.length) * 0.05;

		translate(anim.el, anim.position.x + anim.velocity.x, anim.position.y + anim.velocity.y, 1);
	};

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var midW = windowW >> 1;
			var scale = 0.8;

			buttonSize[0] = midW * 0.6;
			buttonSize[1] = windowH * 0.8;

			if (shopSize != undefined) {
				shopBtn.style.width = buttonSize[0] + 'px';
				shopBtn.style.height = buttonSize[1] + 'px';
				shopBtn.style.left = (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				shopBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				shopImg.style.width = shopSize[0] * scale + 'px';
				shopImg.style.height = shopSize[1] * scale + 'px';
				shopImg.style.left = (buttonSize[0] >> 1) - (shopSize[0] * scale >> 1) + 'px';
				shopImg.style.top = (buttonSize[1] >> 1) - (shopSize[1] * scale >> 1) + 'px';
			}
			if (funSize != undefined) {
				funBtn.style.width = buttonSize[0] + 'px';
				funBtn.style.height = buttonSize[1] + 'px';
				funBtn.style.left = midW + (midW >> 1) - (buttonSize[0] >> 1) + 'px';
				funBtn.style.top = (windowH >> 1) - (buttonSize[1] >> 1) + 'px';

				funImg.style.width = funSize[0] * scale + 'px';
				funImg.style.height = funSize[1] * scale + 'px';
				funImg.style.left = (buttonSize[0] >> 1) - (funSize[0] * scale >> 1) + 'px';
				funImg.style.top = (buttonSize[1] >> 1) - (funSize[1] * scale >> 1) + 'px';
			}
		},
		over: function over(id) {
			currentAnim = buttons[id].anim;
		},
		out: function out(id) {
			currentAnim = buttons[id].anim;
		},
		update: function update() {
			if (shopAnim == undefined) return;
			updateAnim(shopAnim);
			updateAnim(funAnim);
		},
		clear: function clear() {
			_domHand2['default'].event.off(shopBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(shopBtn, 'click', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseenter', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'mouseleave', onMouseEventsHandler);
			_domHand2['default'].event.off(funBtn, 'click', onMouseEventsHandler);
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

var _Router = require('./../services/Router');

var _Router2 = _interopRequireDefault(_Router);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

var _Map_hbs = require('./../partials/Map.hbs');

var _Map_hbs2 = _interopRequireDefault(_Map_hbs);

exports['default'] = function (parent, type) {

	var onDotClick = function onDotClick(e) {
		e.preventDefault();
		var id = e.target.id;
		var parentId = e.target.getAttribute('data-parent-id');
		_Router2['default'].setHash(parentId + '/' + id);
	};

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

	if (type == _AppConstants2['default'].INTERACTIVE) {
		for (var i = 0; i < mapdots.length; i++) {
			var dot = mapdots[i];
			_domHand2['default'].event.on(dot, 'click', onDotClick);
		};
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
			    mapH = 645;
			var mapSize = [];
			var resizeVars = _Utils2['default'].ResizePositionProportionally(windowW * 0.47, windowH * 0.47, mapW, mapH);
			mapSize[0] = mapW * resizeVars.scale;
			mapSize[1] = mapH * resizeVars.scale;

			el.style.width = mapSize[0] + 'px';
			el.style.height = mapSize[1] + 'px';
			el.style.left = (windowW >> 1) - (mapSize[0] >> 1) - 40 + 'px';
			el.style.top = (windowH >> 1) - (mapSize[1] >> 1) + 'px';

			titles['deia'].el.style.left = titlePosX(mapSize[0], 740) + 'px';
			titles['deia'].el.style.top = titlePosY(mapSize[1], 250) + 'px';
			titles['es-trenc'].el.style.left = titlePosX(mapSize[0], 1280) + 'px';
			titles['es-trenc'].el.style.top = titlePosY(mapSize[1], 690) + 'px';
			titles['arelluf'].el.style.left = titlePosX(mapSize[0], 360) + 'px';
			titles['arelluf'].el.style.top = titlePosY(mapSize[1], 400) + 'px';
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

			stepEl.style.opacity = 1;

			// find total length of shape
			stepTotalLen = fillLine.getTotalLength();
			fillLine.style['stroke-dashoffset'] = 0;
			fillLine.style['stroke-dasharray'] = stepTotalLen;

			// start animation of dashed line
			_domHand2['default'].classes.add(dashedLine, 'animate');

			// start animation
			_domHand2['default'].classes.add(fillLine, 'animate');
		},
		resetHighlight: function resetHighlight() {
			setTimeout(function () {
				stepEl.style.opacity = 0;
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
			if (fillLine == undefined) return;
			var dashOffset = progress / 1 * stepTotalLen;
			fillLine.style['stroke-dashoffset'] = dashOffset;
		},
		clear: function clear() {
			if (type == _AppConstants2['default'].INTERACTIVE) {
				for (var i = 0; i < mapdots.length; i++) {
					var dot = mapdots[i];
					dot.removeEventListener('click', onDotClick);
				};
			}
			titles = null;
		}
	};
	return scope;
};

module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/Map.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/media-cell.js":[function(require,module,exports){
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

exports['default'] = function (container, videoUrl) {

	var scope;
	var splitter = videoUrl.split('/');
	var name = splitter[splitter.length - 1].split('.')[0];
	var imgId = 'home-video-shots/' + name;
	var mCanvas = (0, _miniVideo2['default'])({
		loop: true,
		autoplay: false
	});
	var size, position, resizeVars;
	var img;

	var onMouseEnter = function onMouseEnter(e) {
		e.preventDefault();
		if (mCanvas.isLoaded) {
			mCanvas.play(0);
		} else {
			mCanvas.load(videoUrl, function () {
				mCanvas.play();
			});
		}
	};

	var onMouseLeave = function onMouseLeave(e) {
		e.preventDefault();
		mCanvas.pause();
	};

	var onClick = function onClick(e) {
		e.preventDefault();
	};

	var init = function init() {
		var imgUrl = _AppStore2['default'].Preloader.getImageURL(imgId);
		img = document.createElement('img');
		img.src = imgUrl;
		_domHand2['default'].tree.add(container, img);
		_domHand2['default'].tree.add(container, mCanvas.el);

		_domHand2['default'].event.on(container, 'mouseenter', onMouseEnter);
		_domHand2['default'].event.on(container, 'mouseleave', onMouseLeave);
		_domHand2['default'].event.on(container, 'click', onClick);

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

			container.style.width = size[0] + 'px';
			container.style.height = size[1] + 'px';
			container.style.left = position[0] + 'px';
			container.style.top = position[1] + 'px';

			img.style.width = resizeVars.width + 'px';
			img.style.height = resizeVars.height + 'px';
			img.style.left = resizeVars.left + 'px';
			img.style.top = resizeVars.top + 'px';

			// img.style.width = resizeVars.width + 'px'
			// img.style.height = resizeVars.height + 'px'
			// img.style.left = resizeVars.left + 'px'
			// img.style.top = resizeVars.top + 'px'

			mCanvas.el.style.width = resizeVars.width + 'px';
			mCanvas.el.style.height = resizeVars.height + 'px';
			mCanvas.el.style.left = resizeVars.left + 'px';
			mCanvas.el.style.top = resizeVars.top + 'px';
		},
		clear: function clear() {
			_domHand2['default'].event.off(container, 'mouseenter', onMouseEnter);
			_domHand2['default'].event.off(container, 'mouseleave', onMouseLeave);
			_domHand2['default'].event.off(container, 'click', onClick);
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js":[function(require,module,exports){
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
		video.currentTime = time;
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
			video.src = src;
		}
	};

	return scope;
};

module.exports = exports['default'];

},{"dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js":[function(require,module,exports){
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
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.leftPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('shoe-bg'));
			this.rightPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('character-bg'));

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'));
			this.funFact = (0, _funFactHolder2['default'])(this.pxContainer, this.element, this.mouse, this.props.data);
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

			this.tlIn.from(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut }, 0);
			this.tlIn.from(this.leftPart.bgSprite, 1, { x: this.leftPart.bgSprite.x - 200, ease: Expo.easeOut }, 0.5);
			this.tlIn.from(this.leftPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut }, 0.4);
			this.tlIn.from(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut }, 0);
			this.tlIn.from(this.rightPart.bgSprite, 1, { x: this.rightPart.bgSprite.x + 200, ease: Expo.easeOut }, 0.5);
			this.tlIn.from(this.rightPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut }, 0.4);

			this.tlOut.to(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut }, 0);
			this.tlOut.to(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut }, 0);

			_get(Object.getPrototypeOf(Diptyque.prototype), 'setupAnimations', this).call(this);
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

			// if(this.mouse.nX > 0.5) AppStore.Parent.style.cursor = 'pointer'
			// else AppStore.Parent.style.cursor = 'auto'
		}
	}, {
		key: 'onSelfieStickClicked',
		value: function onSelfieStickClicked(e) {
			e.preventDefault();
			if (this.selfieStick.isOpened) {
				this.selfieStick.close();
			} else {
				this.selfieStick.open();
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
					this.funFact.close();
				} else {
					this.funFact.open();
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
			_domHand2['default'].event.off(window, 'mousemove', this.onMouseMove);
			_domHand2['default'].event.off(this.selfieStick.el, 'click', this.onSelfieStickClicked);
			this.leftPart.clear();
			this.rightPart.clear();
			this.character.clear();
			this.funFact.clear();
			this.selfieStick.clear();
			this.arrowsWrapper.clear();
			this.mainBtns.clear();
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

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../arrows-wrapper":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/arrows-wrapper.js","./../character":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js","./../diptyque-part":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js","./../fun-fact-holder":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/fun-fact-holder.js","./../main-diptyque-btns":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-diptyque-btns.js","./../selfie-stick":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/selfie-stick.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js":[function(require,module,exports){
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
		props.data.grid = [];
		props.data.grid.length = 28;
		props.data['lines-grid'] = { horizontal: [], vertical: [] };
		props.data['lines-grid'].horizontal.length = 3;
		props.data['lines-grid'].vertical.length = 6;
		props.data['text_a'] = content.texts['txt_a'];
		props.data['a_vision'] = content.texts['a_vision'];
		_get(Object.getPrototypeOf(Home.prototype), 'constructor', this).call(this, props);
		var bgUrl = this.getImageUrlById('background');
		this.props.data.bgurl = bgUrl;

		this.triggerNewItem = this.triggerNewItem.bind(this);
		this.onItemEnded = this.onItemEnded.bind(this);
	}

	_createClass(Home, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.lastGridItemIndex;
			this.videoTriggerCounter = 200;
			this.imageTriggerCounter = 0;

			this.seats = [1, 3, 5, 7, 9, 11, 15, 17, 21, 23, 25];

			this.usedSeats = [];

			// this.bg = dom.select('.bg-wrapper', this.element)

			this.imgCGrid = (0, _imageToCanvasesGrid2['default'])(this.element);
			this.imgCGrid.load(this.props.data.bgurl);
			this.grid = (0, _gridHome2['default'])(this.props, this.element, this.onItemEnded);
			this.grid.init();
			// this.bottomTexts = bottomTexts(this.element)
			this.aroundBorder = (0, _aroundBorderHome2['default'])(this.element);
			// this.map = map(this.element, AppConstants.INTERACTIVE)

			_get(Object.getPrototypeOf(Home.prototype), 'componentDidMount', this).call(this);
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
		key: 'update',
		value: function update() {
			if (!this.transitionInCompleted) return;
			this.videoTriggerCounter += 1;
			if (this.videoTriggerCounter > 800) {
				this.videoTriggerCounter = 0;
				this.triggerNewItem(_AppConstants2['default'].ITEM_VIDEO);
			}
			this.imageTriggerCounter += 1;
			if (this.imageTriggerCounter > 30) {
				this.imageTriggerCounter = 0;
				this.triggerNewItem(_AppConstants2['default'].ITEM_IMAGE);
			}
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
			// this.bottomTexts.resize()
			this.aroundBorder.resize();
			// this.map.resize()

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);

			_get(Object.getPrototypeOf(Home.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.aroundBorder.clear();
			this.grid.clear();
			// this.map.clear()

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

	// check if mix-blend-mode is available
	if ('mix-blend-mode' in colorifier.style) {
		colorifier.style['mix-blend-mode'] = 'color';
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
			colorifier.style.left = (screenHolderSize[0] >> 1) - colorifierSize[0] * 0.52 + 'px';
			colorifier.style.top = -0.5 + 'px';

			animation.iposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1);
			animation.iposition.y = windowH - videoHolderSize[1] * 0.35;
			animation.position.x = animation.iposition.x;
			animation.position.y = animation.iposition.y;
		},
		clear: function clear() {
			mVideo.clear();
			mVideo = null;
			animation = null;
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

	PX_CONTAINER_IS_READY: 'PX_CONTAINER_IS_READY',
	PX_CONTAINER_ADD_CHILD: 'PX_CONTAINER_ADD_CHILD',
	PX_CONTAINER_REMOVE_CHILD: 'PX_CONTAINER_REMOVE_CHILD',

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

  return "<div class='page-wrapper diptyque-page'>\n	\n	<div class=\"fun-fact-wrapper\">\n		<div class=\"video-wrapper\"></div>\n		<div class=\"message-wrapper\">\n			<div class=\"message-inner\">\n				"
    + ((stack1 = ((helper = (helper = helpers['fact-txt'] || (depth0 != null ? depth0['fact-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fact-txt","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n			</div>\n		</div>\n		<div class=\"cursor-cross\">\n			<svg width=\"100%\" viewBox=\"0 0 14.105 13.828\">\n				<polygon fill=\"#ffffff\" points=\"13.946,0.838 13.283,0.156 7.035,6.25 0.839,0.156 0.173,0.834 6.37,6.931 0.159,12.99 0.823,13.671 7.07,7.578 13.266,13.671 13.932,12.994 7.736,6.896 \"/>\n			</svg>\n		</div>\n	</div>\n\n	<div class=\"main-btns-wrapper\">\n		<div id='shop-btn' class='main-btn'></div>\n		<div id='fun-fact-btn' class='main-btn'></div>\n	</div>\n\n	<div class=\"selfie-stick-wrapper\">\n		<div class=\"screen-wrapper\">\n			<div class=\"colorifier\">\n				<svg width=\"100%\" viewBox=\"0 0 100 22\">\n					<path fill=\"#FF0000\" d=\"M4.6,1.25c0.001,0,0.045-0.006,0.08,0h0.032\n	c1.212,0.003,36.706-1,36.706-1l25.471,0.549c0.086,0.002,0.172,0.007,0.258,0.017l1.486,0.166C68.711,0.989,68.773,1,68.836,1.036\n	l0.324,0.199c0.052,0.032,0.11,0.049,0.171,0.05l27.043,0.469c0,0,2.624-0.077,2.624,2.933l-0.692,7.96\n	c-0.045,0.518-0.479,0.916-0.999,0.916h-6.203c-0.328,0-0.653,0.034-0.975,0.1c-0.853,0.175-2.83,0.528-5.263,0.618\n	c-0.342,0.014-0.661,0.181-0.872,0.451l-0.5,0.645l-0.28,0.358c-0.374,0.482-0.647,1.034-0.789,1.628\n	c-0.32,1.345-1.398,3.952-4.924,3.958c-3.974,0.005-7.685-0.113-10.612-0.225c-1.189-0.044-2.96,0.229-2.855-1.629l0.36-5.94\n	c0.014-0.219-0.157-0.404-0.376-0.409L29.62,12.488c-0.214-0.004-0.428,0.001-0.641,0.015l-1.753,0.113\n	c-0.208,0.013-0.407,0.085-0.574,0.21c-0.557,0.411-1.897,1.392-2.667,1.859c-0.701,0.426-1.539,1.042-1.968,1.364\n	c-0.183,0.137-0.309,0.335-0.358,0.558l-0.317,1.425c-0.044,0.202-0.004,0.413,0.113,0.583l0.613,0.896\n	c0.212,0.311,0.297,0.699,0.188,1.059c-0.115,0.378-0.444,0.755-1.292,0.755h-7.957c-0.425,0-0.848-0.04-1.266-0.12\n	c-2.543-0.486-10.846-2.661-10.846-10.36C0.896,3.375,4.459,1.25,4.6,1.25\"/>\n				</svg>\n			</div>\n			<div class=\"screen-holder\"></div>\n			<div class=\"video-holder\"></div>\n		</div>\n		<div class=\"background\"></div>\n	</div>\n\n	<div class=\"arrows-wrapper\">\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['previous-page'] || (depth0 != null ? depth0['previous-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-page","hash":{},"data":data}) : helper)))
    + "\" id='left' class=\"arrow left\">\n			\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0 0 32 26\">\n					<polygon fill=\"#FFFFFF\" points=\"21.84,25.184 13.59,25.184 1.048,12.934 13.798,0.768 22.006,0.726 12.507,10.143 31.423,10.06 31.548,15.851 11.882,15.851 \"/>\n					<path fill=\"#010101\" d=\"M13.34,0.265h9.794l-9.648,9.305h18.236v6.91H13.553l9.601,9.259l-9.813-0.02L0.159,12.991L13.34,0.265zM20.707,1.245h-6.971L1.569,12.991L13.736,24.74l6.984,0.014L11.125,15.5h19.617v-4.95H11.058L20.707,1.245z\"/>\n				</svg>\n\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"7.627,0.831 8.307,1.529 1.952,7.727 8.293,13.965 7.61,14.658 0.561,7.724 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
    + alias3(((helper = (helper = helpers['previous-preview-url'] || (depth0 != null ? depth0['previous-preview-url'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"previous-preview-url","hash":{},"data":data}) : helper)))
    + ")\"></div>\n\n		</a>\n		<a href=\"#/"
    + alias3(((helper = (helper = helpers['next-page'] || (depth0 != null ? depth0['next-page'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"next-page","hash":{},"data":data}) : helper)))
    + "\" id='right' class=\"arrow right\">\n\n			<div class=\"icons-wrapper\">\n				<svg width=\"100%\" viewBox=\"0 0 32 26\">\n					<polygon fill=\"#FFFFFF\" points=\"10.375,0.818 18.625,0.818 31.167,13.068 18.417,25.235 10.208,25.277 19.708,15.86 0.792,15.943 0.667,10.151 20.333,10.151 \"/>\n					<path fill=\"#010101\" d=\"M18.708,25.738H8.914l9.648-9.305H0.326v-6.91h18.169L8.894,0.265l9.814,0.02l13.181,12.727L18.708,25.738zM11.341,24.757h6.971l12.167-11.746L18.312,1.263l-6.985-0.014l9.596,9.254H1.306v4.95H20.99L11.341,24.757z\"/>\n				</svg>\n\n				<svg width=\"100%\" viewBox=\"0.456 0.644 7.957 14.202\">\n					<polygon points=\"1.24,14.658 0.561,13.96 6.915,7.762 0.575,1.525 1.257,0.831 8.307,7.765 \"/>\n				</svg>\n			</div>\n\n			<div class=\"background\" style=\"background-image: url("
    + alias3(((helper = (helper = helpers['next-preview-url'] || (depth0 != null ? depth0['next-preview-url'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"next-preview-url","hash":{},"data":data}) : helper)))
    + ")\"></div>\n		</a>\n	</div>\n\n</div>";
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
    + "</a></li>\n				</ul>\n			</div>\n		</header>\n		<footer id=\"footer\" class=\"btn\">\n			<div id=\"social-wrapper\">\n				<ul>\n					<li class='instagram'>\n						<a target=\"_blank\" href=\""
    + alias2(((helper = (helper = helpers.instagramUrl || (depth0 != null ? depth0.instagramUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"instagramUrl","hash":{},"data":data}) : helper)))
    + "\">\n							<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M16.107,15.562c0,0.302-0.243,0.547-0.543,0.547H2.438c-0.302,0-0.547-0.245-0.547-0.547V7.359h2.188c-0.285,0.41-0.381,1.175-0.381,1.661c0,2.929,2.388,5.312,5.323,5.312c2.935,0,5.322-2.383,5.322-5.312c0-0.486-0.066-1.24-0.42-1.661h2.186V15.562L16.107,15.562z M9.02,5.663c1.856,0,3.365,1.504,3.365,3.358c0,1.854-1.509,3.357-3.365,3.357c-1.857,0-3.365-1.504-3.365-3.357C5.655,7.167,7.163,5.663,9.02,5.663L9.02,5.663z M12.828,2.984c0-0.301,0.244-0.546,0.545-0.546h1.643c0.3,0,0.549,0.245,0.549,0.546v1.641c0,0.302-0.249,0.547-0.549,0.547h-1.643c-0.301,0-0.545-0.245-0.545-0.547V2.984L12.828,2.984z M15.669,0.25H2.33c-1.148,0-2.08,0.929-2.08,2.076v13.349c0,1.146,0.932,2.075,2.08,2.075h13.339c1.15,0,2.081-0.93,2.081-2.075V2.326C17.75,1.179,16.819,0.25,15.669,0.25L15.669,0.25z\"/>\n						</a>\n					</li>\n					<li class='twitter'>\n						<a target=\"_blank\" href=\""
    + alias2(((helper = (helper = helpers.twitterUrl || (depth0 != null ? depth0.twitterUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"twitterUrl","hash":{},"data":data}) : helper)))
    + "\">\n							<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 22 18\" enable-background=\"new 0 0 22 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M21.176,0.514c-0.854,0.509-1.799,0.879-2.808,1.079c-0.805-0.865-1.953-1.405-3.226-1.405c-2.438,0-4.417,1.992-4.417,4.449c0,0.349,0.038,0.688,0.114,1.013C7.166,5.464,3.91,3.695,1.729,1c-0.38,0.66-0.598,1.425-0.598,2.24c0,1.543,0.78,2.904,1.966,3.704C2.374,6.92,1.691,6.718,1.094,6.388v0.054c0,2.157,1.523,3.957,3.547,4.363c-0.371,0.104-0.762,0.157-1.165,0.157c-0.285,0-0.563-0.027-0.833-0.08c0.563,1.767,2.194,3.054,4.128,3.089c-1.512,1.194-3.418,1.906-5.489,1.906c-0.356,0-0.709-0.021-1.055-0.062c1.956,1.261,4.28,1.997,6.775,1.997c8.131,0,12.574-6.778,12.574-12.659c0-0.193-0.004-0.387-0.012-0.577c0.864-0.627,1.613-1.411,2.204-2.303c-0.791,0.354-1.644,0.593-2.537,0.701C20.146,2.424,20.847,1.553,21.176,0.514\"/>\n						</a>\n					</li>\n					<li class='facebook'>\n						<a target=\"_blank\" href=\""
    + alias2(((helper = (helper = helpers.facebookUrl || (depth0 != null ? depth0.facebookUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"facebookUrl","hash":{},"data":data}) : helper)))
    + "\">\n							<svg version=\"1.1\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100%\" viewBox=\"0 0 18 18\" enable-background=\"new 0 0 18 18\" xml:space=\"preserve\"><path sketch:type=\"MSShapeGroup\" fill=\"#00EB76\" d=\"M17.719,16.756c0,0.531-0.431,0.963-0.962,0.963h-4.443v-6.753h2.267l0.338-2.631h-2.604V6.654c0-0.762,0.211-1.281,1.304-1.281l1.394,0V3.019c-0.241-0.032-1.068-0.104-2.031-0.104c-2.009,0-3.385,1.227-3.385,3.479v1.941H7.322v2.631h2.272v6.753H1.243c-0.531,0-0.962-0.432-0.962-0.963V1.243c0-0.531,0.431-0.962,0.962-0.962h15.514c0.531,0,0.962,0.431,0.962,0.962V16.756\"/>\n						</a>\n					</li>\n				</ul>\n			</div>\n		</footer>\n\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Home.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    return "";
},"3":function(depth0,helpers,partials,data) {
    return "			<div></div>\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.horizontal || (depth0 != null ? depth0.horizontal : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"horizontal","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.horizontal) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"6":function(depth0,helpers,partials,data) {
    return "					<div></div>\n";
},"8":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.vertical || (depth0 != null ? depth0.vertical : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"vertical","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.vertical) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<div class='page-wrapper home-page'>\n	<div class=\"bg-wrapper\">\n		<img src='"
    + alias3(((helper = (helper = helpers.bgurl || (depth0 != null ? depth0.bgurl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"bgurl","hash":{},"data":data}) : helper)))
    + "'>\n	</div>\n	<div class=\"grid-background-container\">\n";
  stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(options={"name":"grid","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.grid) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "	</div>\n	<div class=\"grid-container\">\n";
  stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(options={"name":"grid","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.grid) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "	</div>\n	<div class=\"lines-grid-container\">\n		<div class=\"horizontal-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "		</div>\n		<div class=\"vertical-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n	</div>\n	<div style='display: none;' class=\"bottom-texts-container\">\n		<div class=\"left-text\">\n			<div class=\"front-wrapper\">\n				"
    + alias3(((helper = (helper = helpers.text_a || (depth0 != null ? depth0.text_a : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text_a","hash":{},"data":data}) : helper)))
    + "\n			</div>\n			<div class=\"background\"></div>\n		</div>\n		<div class=\"right-text\">\n			<div class=\"front-wrapper\">\n				<div class=\"vision\">"
    + alias3(((helper = (helper = helpers.a_vision || (depth0 != null ? depth0.a_vision : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"a_vision","hash":{},"data":data}) : helper)))
    + "</div>\n				<div class=\"logo\">\n					<img src=\"image/logo-mallorca.png\">\n				</div>\n			</div>\n			<div class=\"background\"></div>\n		</div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n			<div>4</div>\n		</div>\n	</div>\n\n	<div class=\"map-wrapper\"></div>	\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"titles-wrapper\">\n	<div class=\"deia\">DEIA</div>\n	<div class=\"es-trenc\">ES TRENC</div>\n	<div class=\"arelluf\">ARELLUF</div>\n</div>\n\n<svg width=\"100%\" viewBox=\"-67 0 760 645\">\n	<path id=\"map-bg\" fill=\"#1EEA79\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n	\n	<path id=\"outer-border\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" d=\"M19.058,281.596l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l-2.382-1.177l7.292-10.041L19.058,281.596z M689.455,193.888l2.102-3.054l-0.903-2.519l-2.347-1.54l-7.395,0.427l-0.854-0.958l-1.441-1.647l0.229-3.869l5.336-10.428l-0.409-1.963l-1.989-1.88l-6.373,1.22l-6.305-0.215l-5.832-4.916l-7.768-2.221l-4.418-5.211l-3.057-1.949l-11.482-1.367l-2.892-1.575l-2.693-4.917l-11.906-9.165l-4.271-2.01l-5.057,2.523l-1.445,3.973l1,6.922l-1.56,5.555l-5.354,4.809l-8.901,2.479l-19.89,13.82l-6.309,0.172l-5.454,3.376l-3.874,0.488l-5.175-1.536l-5.34-2.583l-11.545-5.62l-0.627-1.263l-22.548-10.253l-13.323-9.402l-6.438-7.22l-8.048-15.962l-3.842-13.077l-0.545-2.691l1.955-6.922l2.233-5.344l2.956-2.648l1.939-0.254l3.383,2.135l2.463,3.118l3.304,0.56l6.685-3.506l7.703,0.255l4.007-2.752l6.506-9.51l4.056-3.459l-0.344-3.208l-3.006,0.362l-2.317-2.411l-0.889-3.058l1.825-5.767l0.312-0.983l9.625-8.781l-3.399-1.967l-4.06,0.129l-3.103,2.117l-5.85,7.242l-4.909,3.248l-9.296,2.993l-3.877,3.309l-2.987,0.168l-2.876-1.92l-2.299,0.233l-7.112,5.063l-9.378,1.238l-7.048-5.681l-1.872-4.339l-2.808-6.492l-1.743-9.617l1.234-6.449l3.743-4.191l4.749-0.276l7.621,8.182l0.179-9.312l4.254-1.005l3.253-4.744l5.946-5.663l11.396,0.298l3.781-1.73l6.684-5.128l8.916-6.861l3.221-1.044l3.482,0.556l2.185-1.475l2.334-6.901l4.089-3.994l-2.234-1.005l-13.847,5.728l-4.056,0.298l-0.771-1.984l1.707-2.376l-0.969-1.453l-4.565,0.086l-12.434,5.473l-7.147,5.236l-4.383,6.086l-1.707,2.372l-4.354,2.584l-11.352,1.841l-0.408-1.966l0.986-2.074l-2.005-1.687l-2.317,0.578l-17.673,11.512l-3.712,0.323l-0.147-3.527l2.726-4.956l-3.611-1.259l-5.767,2.669l-1.891-0.79l0.478-5.447l-3.712,0.147l-11.071,5.663l-4.812,2.458l-15.602,12.348l-8.643,0.768l-2.363-2.519l-1.89-2.031l-3.383-3.61l-2.775-0.682l-8.475,10.809l-4.913,2.903l-4.057,0.496l-4.418,3.972l-4.992-2.027l-8.163,5.21l-2.481,3.183l-4.501,5.767l-4.532,2.759l-8.36,2.2l-7.098,8.25l-5.86,1.963l-6.817,2.29h-0.018l-9.819-1.518l-0.444-0.064l-1.707,2.541l0.032,0.258l0.114,1.238l0.197,2.049l-6.556-2.113l-4.465,1.346l-4.666-1.303l-1.821,1.324l-1.414,10.493l-3.299-0.707l-0.459,1.324l-1.808,5.257l-3.533,3.696l-3.367,0.875l-5.799-3.312l-5.039,2.734l-21.963,17.885l-0.674,2.968l0.738,5.853l-2.594,2.864l-6.408-4.913l-4.827,1.855l-6.157,14.401l-1.79,4.213l-5.308,4.486l-4.483,1.902l-4.01-3.912l-6.667,10.744l-14.044,14.616l-4.088,8.247l-14.98,12.287l-5.057,3.438l-6.671,1.751l-10.167-1.367l-3.203,1.263l-4.863,6.086l-7.488,2.971l-3.285,2.842l-5.831,8.333l-5.717,2.372l-5.089,7.306l-7.13,6.345L80.471,244.4l-5.831,4.654l-3.235,4.895l-1.854,2.778l-5.835,4.999l-11.627,5.599l-8.571-0.065l-9.181,9.42l-2.712,5.516l-2.302,0.596l-3.694,7.737l0.609,2.157l3.529,2.993l0.574,2.498l-1.707,6.603l0.592,2.135l10.644,10.898l2.185,2.239l5.387,0.431l2.693-1.263l1,0.75l0.115,1.242l-3.446,2.817l-8.543,3.459l-2.611,3.229l1.644,2.368l3.152-0.211l4.041-4.379l3.171,3.158l3.17-0.384l1.102,2.351l-0.707,3.848l4.859,0.577l4.698-3.291L64.375,328l2.841-0.919l3.285,0.706l1.083,2.864l-1.051,3.825l0.592,2.135l4.748-1.176l3.564-0.873l4.598-5.066l6.126-0.043l6.47,10.363l7.345,3.549l0.262,1.77l-1.643,1.328l-7.011,0.703l-2.895,1.967l-1.18,2.949l1.345,4.637l3.073,4.912l4.681,0.6l4.436-1.367l0.919,2.67l-2.02,5.556l1.61,6.409l-1.481,5.211l0.886-0.488l5.043-2.907l8.758,6.431l12.315,5.193l0.825-2.609l-1.202-4.102l2.776-10.256l6.882-15.704v-7.048l0.592-1.367l3.023-1.091l-3.303-4.041l0.297-2.454l2.776-3.033l7.652-2.522l9.921-3.266l6.717,0.833l4.092-3.829l5.993-11.663l4.207-0.151l10.888,5.685l2.396-2.523l-3.938-5.149l-0.087-0.682l-0.147-1.432l2.3-4.123l3.944-2.096l2.924,1.048l2.857-0.553l2.956-0.56l5.175,1.393l0.671,0.168l7.262,1.945l5.318,5.386l4.257,2.325l9.429,10.342l8.769,2.588l8.346,7.647l3.844,6.729l4.024,9.915l-2.104,3.761l-4.4,3.994l-2.992,7.414l-3.775,2.096l-1.363,2.753l2.317,4.938l3.037,6.449l5.846,8.418l1.169,4.468l-0.133,5.811l-3.611,12.671l0.409,5.831l3.088,7.565l5.222,7.159l11.401,8.885l3.199,5.279l4.898,3.075l1.363,4.127l1.642,0.682l7.273-1.432l4.157,0.553l4.812,4.683l2.908,1.195l3.515-0.682l7.718-4.167l4.207-0.664l8.489,0.983l8.46-1.837l4.862,0.621l14.568,7.837l1.922-0.255l3.006-4.059l6.946-2.627l4.813,0.574l6.785,0.771l4.221-0.642l4.615,1.837l5.352,4.166l8.02,9.614l2.528,4.895l0.082,1.601l-4.799,8.354l1.267,5.555l2.873,1.729l4.023-0.47l2.891-1.794l7.015,5.512l3.271,4.059l-1.349,5.387l1.904,3.632l3.515,1.644l1.233,0.556l7.176,8.867l2.795,6.517l3.646,3.184l4.498,0.617l4.092-1.727l17.623-19.809l7.062-11.067l4.598-4.485l12.452-4.766l1.312-1.687l-0.18-1.026l-0.473-2.713l2.625-3.567l5.092,2.584l4.731-0.617l4.629,1.324l3.896-4.188l6.603-2.8l3.138-3.165l0.688-2.773l-1.102-5.365l1.511-2.2l8.363,0.13l3.4-1.389l-2.221-7.178l0.807-1.901l3.088,0.894l5.484,4.532l2.514-1.264l2.284-3.395l-1.316-4.489l1.479-1.195l0.541-0.448l2.977-0.341l8.062-19.292l4.731-6.604l1.692-5.021l-1.822-4.848l1.396-3.272l1.624-0.962l4.125,4.468l1.725,0.276l1.033-2.95l-0.721-8.842l3.202-22.393l2.02-5.107l4.896-12.287l-0.294-3.908l4.827-8.182l5.78-6.542l3.351-6.663l8.938-6.539l5.354-7.967l11.989-7.758l3.909-1.173l3.68-3.312l1.478-4.313l-0.609-4.446l-0.129-0.897l2.661-3.718l2.546-1.622l7.851,0.129l2.693-1.095l1.937-3.395l-1.478-1.69l-4.386,0.28l-1.64-1.859l-3.22-10.597l3.284-11.599l7.438-16.497l2.711-1.604l4.011,0.405l8.341,3.847l2.102,0.129l1.495-1.665l0.363-2.868l0.605-4.827l-1.032-6.237l2.019-4.468l1.758-0.254l6.785,3.757l0.982-1.88l-2.166-16.687l0.739-3.843l2.019-1.45l-0.015-2.846l-3.073-4.231l-0.344-3.183l2.169-7.116L689.455,193.888z M392.151,601.092l2.28-7.095l-0.427-1.622l-3.809-0.556l-2.514,1.45l-0.327,2.975l-2.138,1.13l-0.459,1.902l2.759,3.696l2.578,0.66L392.151,601.092z M388.815,613.66l-4.716-2.885l-2.625,0.384l-0.66,2.437l1.99,5.211l-2.248,3.058l-3.093-0.707l-2.789-3.158l-2.598-0.302l-0.638,2.438l1.083,3.523l0.244,0.771l-0.982,2.07l-2.217-0.663l-3.909-11.491l-2.582-0.664l-1.492,2.031l0.409,2.136l2.514,1.901l-4.96,5.021l0.625,4.615l6.85,1.794l0.789,1.622l-3.386,4.744l0.444,1.432l8.539-0.409l0.28,4.425l6.193-1.963l5.993,1.751l2.449-0.384l0.588-1.22l-3.528-5.469l-0.083-1.773l3.203-4.766l-2.465-2.605l0.84-2.608l1.478-1.858l4.171,0.236l4.634-5.555l-2.335-1.902L388.815,613.66z\"/>\n	\n	<path id=\"fleves\" fill=\"none\" stroke=\"#FFFFFF\" d=\"M304.534,122.281c0.334-0.44,0.564-0.979,1.033-1.3c0.851-1.096,1.631-2.247,2.528-3.305c0.343-0.397,0.983-0.725,1.448-0.336c0.094,0.34-0.629,0.638-0.163,0.98c0.132,0.233,0.845,0.167,0.344,0.321c-0.462,0.189-0.933,0.407-1.241,0.815c-0.932,0.955-1.419,2.232-1.801,3.487c-0.51,0.431,0.515,1.184,0.675,0.462c0.151-0.318,0.782-0.085,0.389,0.203c-0.38,0.458-0.358,1.116,0.116,1.472c0.208,0.498-0.372,0.771-0.759,0.534c-0.654-0.081-0.986,0.557-1.487,0.818c-0.596,0.354-1.056-0.258-1.563-0.466c-0.403-0.152-0.691-0.687-0.128-0.835c0.368-0.106,0.234-0.634-0.146-0.386c-0.526,0.245-1.215,0.152-1.543,0.662c-0.543,0.378-0.563-0.394-0.326-0.701c0.362-0.646,1.062-0.979,1.567-1.495C303.827,122.897,304.173,122.579,304.534,122.281L304.534,122.281z M283.701,138.906c1.044-0.792,2.087-1.583,3.131-2.375c0.192-0.282,0.875-0.576,0.952-0.08c0.079,0.29,0.325,0.684,0.677,0.537c0.123-0.22,0.667,0.038,0.286,0.125c-0.333,0.177-0.87,0.342-0.84,0.808c0.031,0.406,0.229,0.77,0.371,1.144c-0.298,0.511,0.124,1.121-0.15,1.638c-0.142,0.385-0.142,0.864-0.488,1.14c-0.423,0.13-0.938-0.17-1.297,0.176c-0.398,0.259-0.798-0.128-1.184-0.214c-0.522-0.137-1.07-0.112-1.599-0.031c-0.356-0.234-0.831-0.135-1.129,0.05c-0.477-0.113-0.533,0.481-0.782,0.712c-0.093-0.158,0.131-0.503,0.238-0.697c0.144-0.243,0.369-0.423,0.536-0.644c0.165-0.382,0.362-0.825,0.82-0.9c0.403-0.212,0.225-0.735,0.1-0.995C283.436,139.144,283.629,139.076,283.701,138.906L283.701,138.906z M297.55,83.896c0.746,0.277,1.492,0.555,2.237,0.832c0.159,1.279,1.932,0.445,2.162,1.724c0.612,0.867,1.919,0.071,2.801,0.498c1.061,0.136,1.478,1.158,2.083,1.892c0.679,0.894,1.362,1.786,1.969,2.731c1.237-0.703,1.542,0.568,2.094,1.425c1.229,0.916,2.482,1.802,3.788,2.605c0.685,0.865,1.07,1.78,2.354,1.509c0.913-0.189,1.71-0.668,2.681-0.198c1.006-0.136,2.072-0.394,2.132-1.537c1.18,0.278,2.158-0.068,2.964-0.957c1.196-0.236,1.326-1.349,1.947-2.15c0.434-0.2,0.907-0.315,1.349-0.505 M315.643,96.947c-0.363,0.977-0.806,1.962-1.564,2.699c-0.433,0.811,0.32,2.203-0.908,2.524c-0.792,0.21-1.176,0.857-1.333,1.619c-0.074,0.902-1.259,0.779-1.542,1.495c-0.242,0.633-0.484,1.266-0.726,1.898c0.389,0.845,0.449,1.962-0.566,2.354c-0.539,0.861-0.148,1.937-0.132,2.87c0.279,0.792,1.251,1.14,1.421,1.977c-0.144,0.986-1.393,1.245-1.8,2.091c-0.104,0.213-0.143,0.454-0.137,0.689 M301.45,125.288c-1.67,1.749-3.197,3.625-4.796,5.438c-0.748,0.214-1.708,0.059-2.23,0.761c-0.409,0.34-0.707,0.853-1.194,1.073c-0.755,0.199-1.51,0.398-2.265,0.597c-0.623,1.237-1.267,2.472-2.082,3.596c-0.158,0.06-0.317,0.119-0.476,0.179 M281.311,143.072c-0.717,0.884-1.784,1.405-2.875,1.66c-0.532,0.401,0.158,1.25-0.463,1.655c-0.642,0.872-1.465,1.625-2.451,2.081c-1.133,0.81-2.206,1.791-2.79,3.08c-0.229,0.395-0.458,0.791-0.691,1.184 M178.088,316.694l-0.861,0.761l-0.331-0.42l-0.401-0.02l-0.733-0.441l-1.114-0.828l-0.402-0.021l-1.154-0.06l-0.753-0.057l-0.382-0.42l-1.115-0.812l-1.097-0.878l-1.115-0.811l-2.209-2.04l0.85-1.512l0.794-0.711l0.9-1.512l3.221-2.527l1.616-1.071l1.985-1.035l-0.312-0.771l-1.095-1.229l-0.767-0.441l-1.134-0.478l-0.382-0.371l-1.172-0.061l-1.449-0.897l-0.401-0.021l-0.713-0.791l-1.114-0.878l-1.136-0.411l-1.135-0.461l-0.782-0.458l-1.557-0.081l-0.714-0.808l0.83-1.095l0.021-0.417l0.04-0.751l0.422-0.364l0.422-0.33l0.422-0.38l-0.345-0.771l-0.382-0.438l-0.401-0.02l-0.733-0.44l-0.401-0.02l-1.154-0.077l-0.332-0.37l-0.401-0.021l-0.773,0.311l-0.418-0.021l-0.382-0.371l-0.717-0.457l0.021-0.4l-0.342-1.172l-0.291-1.171l0.037-0.4l0.02-0.351l0.371-0.381l0.422-0.38l2.005-1.402l0.844-0.744l1.645-2.223l0.401,0.02l1.155,0.06l1.154,0.077l0.02-0.401l0.021-0.35l1.231-1.091l0.402,0.02l0.441-0.781l0.811-0.711l0.422-0.363l0.392-0.731l0.422-0.38l0.772-0.311l0.402,0.02l0.401,0.02l0.389-0.38l0.039-0.751l0.442-0.781l0.459-0.73l0.338-0.348l0.067-0.016l0.85-1.496l-0.308-1.171l-0.345-0.805l0.02-0.384l0.061-1.152l0.058-0.768l0.04-0.768l-0.365-0.42l-0.385-0.02l-0.405,0.364l-0.385-0.02l-0.345-0.788l-0.385-0.02l0.02-0.384l-0.749-0.44l-0.365-0.404l-0.385-0.02l-0.807,0.344l-0.349-0.404l-0.401-0.037l-0.77-0.04l-0.386-0.021l-0.404,0.364l-0.386-0.021l-0.404,0.364l-0.365-0.404l-0.385-0.037l0.02-0.384l-0.385-0.02l-0.385-0.02l-0.385-0.02l0.02-0.384l-0.385-0.021l0.02-0.384l-0.385-0.02l-0.364-0.42l0.385,0.037l-0.365-0.42l-0.345-0.788l-0.749-0.424l-0.386-0.02l-0.364-0.421l-0.345-0.788l0.02-0.384l0.021-0.384l0.036-0.384l-0.364-0.404l0.02-0.384l-0.364-0.421l0.425-0.748l-0.365-0.404l1.135,0.46l1.191-0.323l0.021-0.384l0.83-1.111l-1.499-0.865l0.04-0.768l0.036-0.384l3.217-2.143l2.427-1.782l0.04-0.768l0.422-0.364l0.485-1.916l0.021-0.384l0.441-0.748l0.157-2.687l2.832-2.163l0.386,0.02l1.154,0.077l0.385,0.02l0.75,0.424l0.385,0.02l1.172,0.077l0.75,0.424l0.385,0.021l1.54,0.097l0.385,0.02l0.02-0.384l0.021-0.384l0.137-2.32l-0.345-0.788l1.577-0.303l0.385,0.02l0.77,0.057l0.365,0.404l0.365,0.404l1.904,0.501l1.557,0.081l0.364,0.42l0.75,0.424l0.385,0.02l1.561-0.304l0.749,0.44l0.346,0.788l2.979,2.097l0.75,0.44l0.75,0.424l1.52,0.48l1.52,0.464l1.172,0.077l1.194-0.708l1.135,0.444l0.771,0.057l0.847-1.111l0.79-0.344l0.385,0.02l0.385,0.02l0.385,0.02l0.386,0.02l0.749,0.441l-1.037-1.997l-0.71-1.208l-0.345-0.788l0.807-0.344l1.58-0.671l0.405-0.364l1.191-0.323v-0.017l1.985-1.034l2.002-1.035l1.597-0.688l0.729,0.825l0.77,0.04l2.31,0.137l1.172,0.061l0.365,0.404l0.713,0.825l3.056,0.945l1.135,0.444l3.81,1.001l2.326,0.137l1.155,0.06l0.77,0.041l1.922,0.501l0.77,0.04l2.289,0.521l1.155,0.06l-0.02,0.384l2.306,0.521l1.54,0.097l0.79-0.344l0.405-0.364l1.231-1.091l1.617-1.071l0.81-0.711l0.811-0.728l0.422-0.363l0.404-0.364l2.022-1.435l0.385,0.02l0.811-0.728l0.826-0.728l2.351-0.63l1.576-0.304l1.114,0.845l0.771,0.04l1.539,0.097l0.386,0.02l0.036-0.384l-0.689-1.592l-0.146-4.26l0.02-0.384l-0.572-3.512l-0.552-3.896l-0.592-3.128l0.02-0.384l0.037-0.384l-0.877-5.067l0.385,0.021l1.657-1.839l-0.288-1.572l-1.439-2l-1.074-1.612l0.968-3.432l0.907-2.263l1.191-0.323l0.888-1.879l0.851-1.495l0.847-1.112l1.56-0.287l0.867-1.496l2.31,0.121l0.827-0.711l0.445-1.148l0.462-1.131l0.405-0.364l0.02-0.384l0.426-0.748l0.421-0.364l0.021-0.384l0.79-0.344l0.405-0.364l0.02-0.384l0.422-0.364l0.385,0.037l0.385,0.021l0.831-1.112l0.826-0.728l0.405-0.364l0.405-0.364l0.405-0.364l0.807-0.344l0.79-0.344l0.77,0.057l0.79-0.344l0.75,0.424l0.385,0.02l0.787,0.04l0.385,0.037l0.445-1.148l2.771-0.995l0.02-0.384l-0.385-0.02l0.021-0.384l0.02-0.384l0.021-0.384l13.246-7.749l0.404-0.364l0.021-0.384l-0.385-0.02l-0.365-0.404l-0.385-0.02l-0.365-0.421l-0.345-0.788l-0.364-0.404l-0.75-0.424l0.02-0.384l-0.327-0.804l-0.365-0.404l0.02-0.384l-0.385-0.02l-0.385-0.02l-0.385-0.02l-0.385-0.037l0.02-0.384l-0.385-0.021l-0.365-0.404l-0.385-0.02l-0.364-0.404l-0.386-0.02l-0.401-0.037l-0.348-0.404l-0.402-0.02l-0.385-0.02l0.021-0.384l0.036-0.384l0.79-0.344l0.021-0.384l0.425-0.748l0.807-0.343l0.426-0.748l0.02-0.384l0.848-1.111l0.04-0.768l0.404-0.364l0.021-0.384l0.021-0.384l0.481-1.532l0.405-0.347l0.405-0.364l0.422-0.363l0.02-0.384l0.021-0.4l0.404-0.347l0.405-0.364l0.021-0.401l0.441-0.748l0.811-0.711l0.79-0.344l-0.652-1.976l-0.71-1.192l2.042-1.819l0.364,0.404l0.73,0.808l0.749,0.44l0.365,0.404l-0.02,0.384l0.385,0.02l-0.021,0.384l-0.02,0.384l0.385,0.02l0.364,0.421l-0.02,0.384l-0.037,0.384l0.402,0.021l0.385,0.02l0.75,0.424l-0.021,0.4l0.692,1.192l-0.02,0.384l-0.021,0.384l-0.02,0.384l0.385,0.021l-0.02,0.384l0.385,0.037l0.364,0.404l0.771,0.04l0.385,0.02l1.175-0.307l2.347-0.263l0.481-1.515l0.385,0.02l1.58-0.671l0.385,0.02l0.808-0.344l0.385,0.02l0.385,0.02l0.83-1.111l0.422-0.364l0.425-0.748l0.405-0.364l0.79-0.344l0.422-0.363l0.79-0.327l2.002-1.051l1.697-2.607l0.445-1.131l0.441-0.748l1.195-0.708l0.75,0.424l1.191-0.307l1.58-0.688l0.462-1.131l1.601-1.071l0.421-0.364l1.235-1.476l0.386,0.021l0.441-0.748l1.6-1.055l2.043-1.819l0.807-0.344l0.425-0.748l0.061-1.152l0.462-1.131l0.79-0.344l0.827-0.728l1.56-0.304l2.103-2.971l1.557,0.097l1.215-1.091l0.847-1.111l0.771,0.04l1.596-0.671l0.426-0.748l2.812-1.779l0.848-1.111l0.81-0.728l0.021-0.384l2.427-1.782l1.191-0.324l0.425-0.748l5.099-0.874l1.925,0.117l1.944-0.284l2.691,0.542l0.77,0.057l1.079,1.596l1.194-0.691l1.212-0.708l1.195-0.708l0.462-1.131l2.33-0.247l3.177-1.375l2.286,0.905l1.984-1.035l1.272-1.859l0.77,0.04l1.598-0.687l1.175-0.307l4.388-2.066l2.387-1.031l3.157-0.975l0.77,0.04l1.232-1.091l0.79-0.327l1.579-0.688l0.422-0.364l1.216-1.091l2.347-0.247l2.151,2.824l4.034,4.093l0.729,0.825l1.459,1.632l2.882,3.632l1.212-0.69l0.425-0.748l2.022-1.435l2.387-1.031l2.427-1.782l2.021-1.436l0.365,0.404l0.729,0.824l1.135,0.444l1.095,1.229l1.114,0.828l0.79-0.327l0.385,0.02l1.155,0.06l1.845,1.652l1.114,0.845l1.657-1.839l0.887-1.879l0.061-1.168l0.021-0.384l0.02-0.384l-0.365-0.404l0.037-0.384l0.021-0.384l0.02-0.384l0.385,0.02l0.021-0.384l0.02-0.384l0.442-0.748l0.02-0.384l0.041-0.785l0.061-1.151l0.385,0.02l0.036-0.384l0.041-0.768l-0.365-0.404l-0.345-0.788l-0.248-2.34l0.486-1.899l-0.613-2.744l-0.268-1.956l0.405-0.364l0.385,0.037l0.385,0.02l0.021-0.384l0.385,0.02l0.422-0.364l0.385,0.02l0.04-0.768l0.405-0.364l2.635,1.309l0.405-0.364l0.866-1.495l0.021-0.384l0.02-0.384l0.462-1.131l0.021-0.384l0.385,0.02l0.771,0.04l0.385,0.02l0.385,0.02l0.021-0.384l0.401,0.02l0.405-0.364l0.425-0.748l0.425-0.748l0.422-0.363l0.83-1.112l1.212-0.69l0.83-1.112l0.021-0.4l1.252-1.458l0.405-0.364l0.02-0.4l0.827-0.711l0.79-0.344l1.271-1.859l0.848-1.111l0.79-0.344l1.58-0.688l0.807-0.343 M480.888,115.824l-2.139,0.559l-2.762,0.562l-0.77-0.053l-0.384-0.027l-0.428,0.356l-0.027,0.384l-0.411,0.356l-0.411,0.357l-0.796,0.33l-0.785-0.07l-0.027,0.383l-0.796,0.33l-2.815,1.346l-1.18,0.286l-1.609,0.659l-0.411,0.357l-2.484,2.14l-0.84,0.713l-0.026,0.384l1.073,1.23l0.357,0.411l2.103,2.878l1.457,1.274l-0.438,0.74l-0.769-0.07l-1.609,0.659l-1.618,1.043l-0.812,0.329l-1.207,0.67l-0.839,0.713l-0.823,0.713l-1.251,1.069l-0.822,0.713l-0.411,0.357l-0.411,0.356l-1.251,1.07l-1.251,1.053l-0.849,1.097l-0.84,0.713l-0.026,0.383l-0.412,0.357l-0.054,0.784l-0.866,1.096l-0.026,0.384l-0.438,0.74l-0.026,0.383l-0.044,0.383l-0.519,1.891l-0.026,0.384l0.287,1.193l-0.054,0.767l-0.027,0.383l-0.026,0.384l-0.455,0.739l-0.822,0.714l-0.438,0.74l-0.026,0.383l-0.429,0.356l-0.026,0.384l-0.026,0.383l-0.85,1.097l-0.429,0.356l-0.053,0.767l-0.465,1.124l-0.385-0.027l-0.429,0.356l-1.18,0.303l-0.412,0.356l-0.384-0.026l-0.839,0.696l-0.823,0.714l-0.438,0.74l-0.428,0.356l-0.054,0.767l-0.054,0.784l-0.097,1.15l-0.027,0.383l-0.491,1.507l-0.429,0.356l-0.411,0.356l-0.385-0.027l-0.822,0.713l-0.812,0.33l-0.411,0.357l-0.027,0.383l-0.026,0.383l-0.054,0.767l-0.411,0.357l-0.894,1.479l-1.511-0.507l-2.654-0.972l-1.896-0.518l-0.769-0.07l0.027-0.383l-1.234,1.07l-3.271,2.085l-2.431,1.356l-3.281,2.47l-2.474,1.739l-1.977,0.633l-1.251,1.069l-1.564,0.26l-0.411,0.357l-0.812,0.33l-0.85,1.097l-1.358,2.604l-0.043,0.383l0.357,0.411l-0.026,0.383l-0.027,0.4l0.742,0.437l-0.026,0.383l-0.054,0.767l-0.481,1.123l-0.054,0.767l-0.466,1.14l-0.043,0.383l1.762,2.451l-0.027,0.384l1.377,2.425l0.699,0.82l-0.823,0.713l-1.207,0.687l-1.224,0.687l-1.207,0.67l-0.812,0.329l-0.026,0.384l0.688,1.221l0.358,0.41l-0.098,1.15l-0.438,0.74l-1.251,1.07l-0.438,0.74l-0.491,1.507l-0.044,0.383l-0.027,0.4l-0.026,0.384l-0.796,0.313l0.357,0.427l-0.384-0.027l-1.662,1.41l-0.509,1.523l-0.411,0.34l-0.92,1.88l-0.85,1.097l-1.716,2.193l-0.839,0.696l-0.796,0.33l-0.385-0.026l-0.796,0.33l-0.331-0.793l-0.098,1.15l-0.053,0.767l-0.027,0.384l-0.465,1.124l-0.455,0.74l-0.411,0.357l-0.411,0.356l-0.84,0.713l-0.796,0.33l-0.822,0.713l-0.688-1.221l0.796-0.313l-0.357-0.427l1.607-0.643l-0.276-1.578l-0.77-0.053l-1.592,0.66l0.341,0.41l-1.618,1.043l-0.795,0.313l-4.086-2.629l-0.411,0.356l-0.385-0.027l-0.357-0.41l-0.027,0.384l-0.796,0.33l-0.026,0.384l-0.385-0.027l-0.812,0.33l0.027-0.384l0.384,0.027l-0.741-0.454l-0.699-0.82l-1.1-0.864l-0.716-0.821l-1.457-1.274l-0.716-0.821l-1.1-0.864l-0.716-0.82l-0.661-1.604l-0.287-1.177l-0.662-1.604l-0.715-0.821l-1.636,1.043l-1.949,0.233l-1.224,0.686l-0.85,1.097l-1.197,0.303l-0.411,0.356l-1.207,0.67l-0.84,0.713l-0.384-0.027l-0.412,0.357l-0.384-0.027l-0.438,0.74l-0.742-0.437l-0.357-0.427l-0.385-0.027l-0.357-0.41l-0.358-0.41l-0.384-0.027l-0.027,0.383l-0.07,0.767l-0.411,0.356l-0.822,0.713l-0.455,0.74l-0.411,0.357l-0.027,0.383l-0.796,0.33l-0.428,0.356l-0.385-0.027l0.716,0.82l-0.876,1.48l0.645,1.604l-0.026,0.384l-0.742-0.454l-0.823,0.713l0.716,0.837l0.357,0.41l-1.197,0.303l-1.564,0.26l-0.77-0.053l-0.785-0.054l1.046,1.614l-0.822,0.713l-1.742,2.577l-0.482,1.124l0.357,0.427l-0.384-0.043l0.357,0.427l-0.411,0.356l-0.027,0.383l-0.043,0.383l-0.823,0.713l0.716,0.82l-0.866,1.097l-0.85,1.097l-0.742-0.437l-0.455,0.74l-1.868-0.917l-0.358-0.41l-0.411,0.356l-0.33-0.81l-0.796,0.33l-0.796,0.33l-0.385-0.027l-0.812,0.33l-0.716-0.837l-2.842,1.729l-0.358-0.41l-0.357-0.427l-0.715-0.821l-0.342-0.41l-1.072-1.248l-0.716-0.82l-0.715-0.837l-0.77-0.053l-1.153-0.081l-1.197,0.286l-0.384-0.027l-0.385-0.027l-1.538-0.107l-1.197,0.286l-0.796,0.33l-1.207,0.687l0.314,0.793l-1.207,0.687l-0.84,0.713l-0.026,0.384l-0.054,0.767l-0.385-0.026l-0.026,0.383l-1.225,0.686l-0.438,0.74l-0.823,0.713l-2.116,2.167l-0.385-0.044l-2.073,1.783l-0.822,0.713l-0.796,0.33l-0.429,0.356l-0.385-0.026l-2.403,0.973l1.403,2.041l0.358,0.41l0.276,1.578l-0.026,0.383l-1.555-0.124l-0.769-0.054l-0.77-0.054l-1.922-0.15l-0.401-0.027l-1.154-0.08l-1.537-0.124l-0.054,0.767l-0.124,1.55l0.153,3.094l-0.025,5.428l-0.106,1.534l0.304,1.177l1.153,0.097l-0.054,0.767l-1.25,1.07l0.715,0.82l0.742,0.454l1.484,0.874l-1.608,0.66l-4.407,1.989l1.54,5.151l2.809,4.066l0.384,0.043l1.691,3.218l0.411-0.356l0.044-0.383l0.054-0.767l0.054-0.783l0.027-0.384l0.384,0.043l0.385,0.027l0.384,0.027l0.358,0.41l-0.027,0.383l-0.026,0.384l0.385,0.026l0.455-0.739l0.411-0.357l0.438-0.74l0.411-0.356l0.027-0.384l0.401,0.027l0.026-0.383l0.357,0.41l-0.044,0.399l-0.026,0.384l0.786,0.054l0.385,0.027l-0.044,0.383l0.401,0.027l-0.044,0.383l-0.054,0.767l0.385,0.043l0.742,0.437l0.385,0.027l1.17,0.081l0.385,0.044l0.054-0.784l0.795-0.313l0.027-0.383l0.385,0.027l0.357,0.41l-0.411,0.356l-0.385-0.027l-0.026,0.384l-0.027,0.383l-0.026,0.384l0.385,0.027l0.411-0.357l0.385,0.027l0.304,1.194l0.384,0.027l0.385,0.026l0.385,0.027l0.385,0.027l-0.59,2.674l-0.919,1.863l0.812-0.329l0.341,0.41l0.357,0.41l0.716,0.837l1.02,1.998l0.715,0.837l0.646,1.587l0.276,1.577l1.154,0.081l-0.027,0.383l-0.204,2.701l-0.77-0.053l0.511,3.521l-3.093-0.231l-1.18,0.287l-1.949,0.25l-0.385-0.027l0.287,1.177l-0.026,0.383l-0.027,0.384l0.331,0.793l0.326,6.639l-4.709,5.84 M575.3,401.024l-0.386-0.021l-1.154-0.063l-4.935-1.848l-8.316-3.207l-0.363-0.422l-3.802-1.383l-1.518-0.486l-2.266-0.912l-8.697-3.613l-6.008-3.08l-3.741-2.166l-1.497-0.854l1.24-1.471l5.136-7.803l-7.781-5.89l-0.728-0.827l-0.342-0.789l-0.688-1.193l-0.705-1.211l-1.048-2l-1.009-2.385l0.043-0.768l-0.342-0.789l0.21-3.471l-0.792,0.342l-0.748-0.428l-0.727-0.826l-0.385-0.021l-1.54-0.086l-1.983,0.644l-0.791,0.341l-0.792,0.342l-4.25-0.27l-3.335-2.512l0.021-0.385l0.043-0.768l-0.385-0.037l0.021-0.385l0.466-1.129l0.043-0.768l0.043-0.768l-0.343-0.789l-0.748-0.443l-0.834,1.107l-1.475-1.236l-1.134-0.465l-0.342-0.789l1.235-1.087l-2.929-2.892l-1.62,1.066l-0.77-0.043l-0.363-0.406l-0.343-0.805l-1.111-0.832l-2.84,2.136l1.433,2.021l-0.915,2.26l-0.363-0.405l-0.363-0.404l-0.364-0.406l-1.795-2.426l-0.385-0.021l-0.363-0.422l-0.364-0.406l-1.475-1.253l0.423-0.362l0.812-0.708l-0.363-0.422l-0.363-0.405l-0.363-0.405l-0.385-0.021l-0.813,0.725l-1.171-0.081l-1.561,0.299l0.064-1.152l0.021-0.383l-0.261-1.957l-0.77-0.043l-1.539-0.103l-0.401-0.021l-2.891-3.274l-2.651-0.936l-4.144-2.171l-0.385-0.038l-1.902-0.49l-0.77-0.061l-0.386-0.021l-0.363-0.405l-0.791,0.341l-0.423,0.362l-0.385-0.021l-0.812,0.725l-1.193,0.303l-0.385-0.021l0.748,0.443l-0.021,0.385l-0.855,1.492l-0.444,0.746l-1.343,3.006l-0.449,1.13l-0.444,0.746l-0.834,1.108l-0.021,0.384l-0.423,0.362l-0.406,0.362l-0.021,0.384l-0.487,1.514l-0.428,0.746l-0.021,0.385l-0.021,0.4l6.183,6.555l0.363,0.404l1.476,1.254l1.453,1.639l1.091,1.215l1.073,1.232l2.224,1.68l-0.471,1.515l-0.444,0.745l-0.835,1.109l-1.111-0.832l-0.791,0.342l-1.236,1.086l-1.518-0.486l-2.63-1.317l-1.518-0.486l-2.262-1.296l-3.442-0.594l-0.77-0.043l-0.363-0.422l-1.92-0.491l-2.985,4.456l-0.812,0.725l-0.428,0.746l-1.744,2.984l-0.021,0.385l-0.021,0.383l-1.278,1.855l-1.278,1.854l-1.707,2.602l-0.449,1.13l-0.423,0.362l-0.021,0.384l-0.812,0.726l-0.406,0.361l-0.466,1.131l-1.476-1.254l-2.223-1.681l-1.643,1.449l-1.625,1.45l-2.412,1.406l-3.22,1.73l-3.159,0.963l-0.386-0.021l-1.111-0.848l-3.16,0.98l-1.475-1.254l-1.839-1.66l-2.904,3.305l-2.048,1.812l-2.069,2.179l-0.363-0.405l-1.535-0.47l-0.363-0.422l-0.385-0.021l-1.134-0.448l-0.688-1.211l-2.412,1.406l-0.829,0.725l-2.433,1.774l-3.459-0.594l-0.749-0.427l-1.518-0.486l-1.134-0.447l-3.865-0.248l-3.442-0.593l-1.983,0.66l-1.89-7.087l-0.153-3.876l0.021-0.384l0.509-1.897l2.348-0.238l0.77,0.042l0.771,0.043l0.406-0.361l2.433-1.774l0.444-0.746l1.75-3.386l1.787-3.752l-0.77-0.043l-1.497-0.869l-1.919-0.508l-3.036-0.955l2.112-2.964l-0.748-0.427l-0.363-0.405l-1.779-2.427l0.834-1.108l0.487-1.53l0.834-1.108l0.895-1.876l1.3-2.238l1.321-2.623l-1.111-0.832l-4.084-2.955l-0.71-0.826l-1.149-0.449l-1.134-0.465l-0.748-0.426l-3.058-0.572l-1.133-0.465l-0.77-0.043l-0.749-0.426l-1.149-0.465l-1.519-0.47l-1.219,1.07l-1.235,1.087l-1.663,1.834l-2.288-0.529l0.304,1.189l-0.471,1.514l-0.406,0.362l-1.278,1.854l-0.771-0.043l-1.192,0.303l-0.385-0.021l-1.235,1.088l-1.583,0.682l-2.287-0.529l-1.476-1.254l-1.192,0.32l-0.304-1.189l-0.363-0.406l-0.386-0.021l-0.786-0.043l-0.77-0.042l-0.406,0.346l-0.449,1.146l-0.401-0.038l-1.177,0.319l-0.385-0.021l-0.363-0.406l-0.363-0.404l-0.727-0.828l-0.728-0.811l-1.539-0.102l-0.406,0.362l-0.363-0.405l-2.288-0.529l-0.786-0.043l-1.177,0.32l-1.859-1.275l-0.385-0.021l-1.817-2.043l-1.902-0.508l-1.882-0.891l-0.385-0.021l-1.882-0.892l-1.534-0.486l-2.245-1.297l0.444-0.745l-0.363-0.406l-2.972-2.106l-1.86-1.275l-5.194-3.804l-2.245-1.297l-0.727-0.811l-2.224-1.68l-6.046-2.696l-0.812,0.725l-1.176,0.32l-1.236,1.087l-3.262,2.499l-1.626,1.449l-0.808,0.341l-1.219,1.087l-1.133-0.465l-2.921,3.305l0.363,0.405l-3.203,1.747l1.112,0.832l-1.279,1.855l-0.423,0.361l-1.604,1.066l-0.748-0.427l-4.969,5.099l-1.322,2.623l-0.851,1.108l-0.449,1.13l-0.444,0.746l-0.834,1.109l-0.851,1.107l-0.428,0.746l-0.873,1.51l-6.405,3.461l-1.193,0.32l-1.967,0.66l-0.406,0.346l-1.963,0.277l-2.33,0.238l-0.402-0.021 M552.595,178.255l-0.129-1.562l0.048,2.712l-0.454,0.74l-0.438,0.74l-0.411,0.356l-0.481,1.124l-0.107,1.534l-0.071,0.783l-0.134,1.917l-0.07,0.767l-0.053,0.767l-0.027,0.383l-0.438,0.74l-1.743,2.577l-0.07,0.783l-0.438,0.74l-0.508,1.507l-0.054,0.767l-0.85,1.097l-0.044,0.383l-0.385-0.027l-0.465,1.124l-0.053,0.767l-0.027,0.383l0.385,0.027l0.672,1.22l-0.438,0.74l-0.08,1.15l0.385,0.027l-0.84,0.713l4.55,1.505l-0.026,0.384l0.672,1.22l1.02,1.998l1.277-1.453l0.85-1.097l2.835,3.699l1.072,1.248l3.202,3.726l-2.922,2.863l-2.528,2.523l-2.923,2.88l-0.027,0.384l-1.635,1.042l-0.412,0.357l-3.27,2.069l-1.458-1.274l-0.742-0.437l-1.814-1.685l-4.069-2.629l-2.898-2.532l-0.07,0.767l-0.92,1.863l-0.438,0.74l-0.465,1.124l-0.026,0.384l-0.044,0.383l-0.134,1.934l-0.411,0.357l-0.044,0.383l-0.411,0.357l-0.027,0.383l-0.384-0.026l-3.174,0.919l-0.384-0.027l-0.027,0.383l-0.385-0.027l-0.026,0.384l-0.044,0.383l0.331,0.794l-0.026,0.383l-0.054,0.767l-0.026,0.383l-0.071,0.783l-0.411,0.357l-0.026,0.383l-0.411,0.357l-0.412,0.356l-2.072,1.767l-0.429,0.356l-0.411,0.357l-0.411,0.357l-0.411,0.356l-0.482,1.123l-0.026,0.384l-0.465,1.124l-0.742-0.437l-3.782-1.436l-2.592,3.674l-3.09,4.796l-2.538,2.907l-0.974,2.63l-1.716,2.193l-0.509,1.507l-0.411,0.356l-1.331,2.22l1.458,1.274l-0.438,0.74l0.672,1.203l-0.026,0.384l-0.438,0.757l-0.027,0.383l-0.411,0.357l-0.481,1.123l0.769,0.054l1.101,0.847l1.511,0.507l-1.901,9.922l-0.097,1.15l-0.054,0.767l0.331,0.793l-1.331,2.237l-1.565,0.26l-1.197,0.303l-2.814,1.329l-0.108,1.551l-0.07,0.767l-0.026,0.383l0.357,0.41l0.358,0.411l1.126,0.48l0.385,0.027l0.77,0.053l0.357,0.41l0.742,0.454l0.715,0.82l-0.026,0.383l0.716,0.821l0.357,0.427l-0.027,0.384l-0.026,0.383l-0.385-0.027l-0.026,0.383l-0.813,0.33l-0.384-0.027l-0.027,0.384l-0.384-0.043l-0.411,0.356l-0.411,0.357l-0.044,0.383l-0.385-0.026l-0.026,0.383l-0.385-0.027l-0.411,0.356l-0.027,0.384l-0.026,0.383l0.385,0.027l-0.027,0.4l0.357,0.41l0.288,1.177l-0.027,0.383l-0.411,0.357l-0.411,0.356l-0.027,0.384l-0.401-0.027l-0.438,0.74l-0.796,0.33l-0.411,0.357l-0.455,0.74l-0.026,0.383l-0.438,0.74l-0.411,0.357l-0.812,0.33l-0.411,0.356l0.688,1.204l0.742,0.454l-0.027,0.383l1.432,1.641l1.61,4.385l0.314,0.793l1.941,5.179l-0.85,1.097l2.129,2.478l-0.411,0.356l-4.631-0.338l-1.635,1.026l-0.411,0.356l-1.234,1.07l-0.839,0.713l-1.234,1.07l-0.428,0.356l-0.438,0.74l-0.796,0.33l-1.484-0.891l-0.742-0.438l-1.484-0.891l-0.716-0.82l-0.769-0.07l-0.509,1.523l-2.812,6.356l-1.131,2.787 M234.592,239.54l-0.058,0.77l-0.116,1.539l-1.216,0.683l-1.215,0.683l-1.602,0.653l-1.215,0.683l-1.631,1.039l-2.016,1.009l-0.83,0.712l-2.016,1.009l-0.415,0.356l-1.215,0.683l-0.415,0.355l-0.415,0.356l-0.415,0.356l-1.186,0.298l-1.216,0.683l-0.801,0.327l-0.414,0.356l0.327,0.798l0.357,0.414l0.299,1.184l0.356,0.414l0.356,0.414l0.743,0.443l0.356,0.414l-0.028,0.385l-0.087,1.154l0.327,0.798l-0.028,0.385l1.07,1.241l0.356,0.414l-0.028,0.385l-0.029,0.385l0.299,1.184l0.386,0.029l0.357,0.414l0.356,0.414l0.386,0.029l-0.058,0.77l-0.058,0.77l0.386,0.029l-0.029,0.385l0.357,0.414l0.327,0.798l0.328,0.799l0.356,0.414l0.357,0.414l0.356,0.414l-0.028,0.385l0.327,0.798l-0.473,1.125l0.271,1.568l-0.029,0.385l0.356,0.414l0.357,0.414l0.386,0.029l0.714,0.827l0.356,0.414l-0.059,0.77l0.387,0.029l0.299,1.183l-0.029,0.385l-0.028,0.385l0.713,0.828l0.357,0.414l-0.029,0.385l0.328,0.798l-0.029,0.385l-0.087,1.154l-0.028,0.385l-0.058,0.77l-0.059,0.77l-0.443,0.741l-0.415,0.355l-0.059,0.77l-0.028,0.385l-0.029,0.385l-0.029,0.385l-0.028,0.385l-0.029,0.385l-0.028,0.385l-0.415,0.356l-0.029,0.385l0.299,1.183l-0.058,0.77l0.829-0.711l1.187-0.298l0.801-0.327l0.801-0.327l0.415-0.356l0.8-0.327l0.386,0.029l0.743,0.443l1.456,1.27l0.386,0.029l1.1,0.856l0.743,0.443l0.473-1.125l2.306-4.857l-0.328-0.798l0.771,0.058l1.216-0.683l1.572-0.269l8.421-3.624l1.571-0.269l0.801-0.327l4.418-1.99l1.157,0.087l1.544,0.116l3.501-0.124l3.115-0.153l3.887-0.095l3.888-0.095l2.729-0.182l1.543,0.116l0.705-4.203l0.443-0.741l0.029-0.385l0.801-0.327l1.187-0.298l1.186-0.298l1.987-0.625l2.373-0.596l0.386,0.029l0.415-0.355l1.572-0.269l2.016-1.009l1.604-0.753l2.912,2.541\"/>\n\n	<g id=\"footsteps\">\n		<g id=\"dub-mateo\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n		</g>\n		<g id=\"mateo-beluga\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n		</g>\n		<g id=\"beluga-isamu\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n		</g>\n		<g id=\"isamu-capas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n		</g>\n		<g id=\"capas-pelotas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n		</g>\n		<g id=\"pelotas-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n		</g>\n		<g id=\"marta-kobarah\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n		</g>\n		<g id=\"kobarah-dub\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n		</g>\n		<g id=\"dub-paradise\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n		</g>\n		<g id=\"return-to-begin\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n		</g>\n	</g>\n\n	<g id=\"map-dots\" transform=\"translate(78.000000, 140.000000)\">\n		<g id=\"deia\">\n			<path id=\"dub\" class='dot-path' data-parent-id=\"deia\" fill=\"none\" stroke=\"#000000\" d=\"M132.5,26c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S130.567,26,132.5,26z\"/>\n			<path id=\"mateo\" class='dot-path' data-parent-id=\"deia\" fill=\"none\" stroke=\"#000000\" d=\"M149.5,8c1.933,0,3.5-1.567,3.5-3.5S151.433,1,149.5,1c-1.934,0-3.5,1.567-3.5,3.5S147.567,8,149.5,8z\"/>\n		</g>\n		<g id=\"es-trenc\">\n			<path id=\"isamu\" class='dot-path' data-parent-id=\"es-trenc\" fill=\"none\" stroke=\"#000000\" d=\"M328.5,320c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S326.567,320,328.5,320z\"/>\n			<path id=\"beluga\" class='dot-path' data-parent-id=\"es-trenc\" fill=\"none\" stroke=\"#000000\" d=\"M346.5,347c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S344.567,347,346.5,347z\"/>\n		</g>\n		<g id=\"arelluf\">\n			<path id=\"capas\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M43.5,233c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S41.567,233,43.5,233z\"/>\n			<path id=\"pelotas\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M50.5,212c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S48.567,212,50.5,212z\"/>\n			<path id=\"marta\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M57.5,186c1.933,0,3.5-1.566,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5C54,184.434,55.567,186,57.5,186z\"/>\n			<path id=\"kobarah\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M29.5,195c1.933,0,3.5-1.566,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.566-3.5,3.5S27.567,195,29.5,195z\"/>\n			<path id=\"dub\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M29.5,172c1.933,0,3.5-1.567,3.5-3.5s-1.567-3.5-3.5-3.5c-1.934,0-3.5,1.567-3.5,3.5S27.567,172,29.5,172z\"/>\n			<path id=\"paradise\" class='dot-path' data-parent-id=\"arelluf\" fill=\"none\" stroke=\"#000000\" d=\"M4.5,183c1.933,0,3.5-1.567,3.5-3.5S6.433,176,4.5,176c-1.934,0-3.5,1.567-3.5,3.5S2.567,183,4.5,183z\"/>\n		</g>\n	</g>\n\n</svg>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id='pages-container'>\n	<div id='page-a'></div>\n	<div id='page-b'></div>\n</div>";
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
			var _this = this;

			this.switchPagesDivIndex();
			setTimeout(function () {
				if (_this.components['new-component'] != undefined) _this.components['new-component'].willTransitionIn();
			}, 600);
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
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_Pager.PagerStore.off(_Pager.PagerConstants.PAGE_TRANSITION_IN, this.willPageTransitionIn);
			_Pager.PagerStore.off(_Pager.PagerConstants.PAGE_TRANSITION_OUT, this.willPageTransitionOut);
			this.unmountComponent('old-component');
			this.unmountComponent('new-component');
			_get(Object.getPrototypeOf(BasePager.prototype), 'componentWillUnmount', this).call(this);
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
				"camper_lab": "Camper Lab",
				"shop_title": "Shop",
				"shop_men": "Men",
				"shop_women": "Women",
				"planet": "Planet",
				"map_txt": "MAP",
				"buy_btn_txt": "BUY THIS MODEL"
			}
		}
	},

	"langs": ["en", "fr", "es", "it", "de", "pt"],

	"home-videos": [
		"http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4",
		"http://embed.wistia.com/deliveries/22b360c8ca399696985313dde99ba83d4ec972b7/arelluf-dub.mp4",
		"http://embed.wistia.com/deliveries/2980f14cc8bd9912b14dca46a4cd4a85fa04774c/arelluf-kobaraf.mp4",
		"http://embed.wistia.com/deliveries/a819c373f9777852f3967ce023bcfb0d9115386f/arelluf-paradise.mp4",
		"http://embed.wistia.com/deliveries/3dcfd70c7072692ea3a739aef5376b026b04b675/arelluf-pelotas.mp4",
		"http://embed.wistia.com/deliveries/13bbb61195164873d823a3b91a2c82accefb3edd/deia-dub.mp4",
		"http://embed.wistia.com/deliveries/4bb6e485b717bf7dbdd5c941fafa2b1884e90838/deia-marta.mp4",
		"http://embed.wistia.com/deliveries/e424889ac026f70e544af03035e7187f34941705/deia-mateo.mp4",
		"http://embed.wistia.com/deliveries/23444d3c8693e59f8079f827dd182c5e33413877/es-trenc-beluga.mp4",
		"http://embed.wistia.com/deliveries/6eafae7f1b3bc41d856973557a2f51598c8241a6/es-trenc-isamu.mp4",
		"http://embed.wistia.com/deliveries/9b9471dcbe1f94ff7b3508841f68ff15be192ee4/es-trenc-marta.mp4"
	],

	"default-route": "",

	"routing": {
		"/": {
			"texts": {
				"txt_a": "Back to the roots. Inspirations for our new collection comes from the balearic island of Mallorca, the founding ground of Camper. Visit three different spots of the island - Deia, Es Trenc and Arelluf - as interpreted by creative director, Romain Kremer.",
				"a_vision": "A VISION OF"
			},
			"assets": [
				"background.jpg",
				"video-shots/arelluf-capas.jpg",
				"video-shots/arelluf-dub.jpg",
				"video-shots/arelluf-kobaraf.jpg",
				"video-shots/arelluf-paradise.jpg",
				"video-shots/arelluf-pelotas.jpg",
				"video-shots/deia-dub.jpg",
				"video-shots/deia-marta.jpg",
				"video-shots/deia-mateo.jpg",
				"video-shots/es-trenc-beluga.jpg",
				"video-shots/es-trenc-isamu.jpg",
				"video-shots/es-trenc-marta.jpg"
			]
		},

        "deia/dub": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/13bbb61195164873d823a3b91a2c82accefb3edd/deia-dub.mp4",
        	"ambient-color": {
        		"from": { "h": 188, "s": 85, "v": 61 },
        		"to": { "h": 357, "s": 97, "v": 26 },
        		"selfie-stick": { "h": 359, "s": 93, "v": 51 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/62e54eac1d8989ab9de238fa3f7c6d8db4d9de8d/arelluf-kobaraf.mp4",
        	"fact": {
        		"en": "Breaking up on a text message is not very deia."
        	}
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
        		"en": "buys an atelier at deia.<br>starts career as an artist."
        	}
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
        		"en": "ES TRENC PARTY BOY."
        	}
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
        		"en": "UFO sighting at es trenc."
        	}
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
        		"en": "MEANWHILE IN ARELLUF."
        	}
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
        		"en": "WHAT HAPPENS IN ARELLUF STAYS IN ARELLUF."
        	}
        },
        "arelluf/marta": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4",
        	"ambient-color": {
        		"from": { "h": 200, "s": 57, "v": 81 },
        		"to": { "h": 201, "s": 100, "v": 69 },
        		"selfie-stick": { "h": 201, "s": 100, "v": 69 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/5b9d2706100e5ea0d317143e2374d6bd6c9607b1/arelluf-marta.mp4",
        	"fact": {
        		"en": "BAD TRIP AT THE HOTEL POOL."
        	}
        },
        "arelluf/kobarah": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/2980f14cc8bd9912b14dca46a4cd4a85fa04774c/arelluf-kobaraf.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 },
        		"selfie-stick": { "h": 344, "s": 41, "v": 100 }
        	},
        	"fun-fact-video-url": "http://embed.wistia.com/deliveries/62e54eac1d8989ab9de238fa3f7c6d8db4d9de8d/arelluf-kobaraf.mp4",
        	"fact": {
        		"en": "Haters will say its photoshop."
        	}
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
        		"en": "WHEN YOU CAN'T KEEP THE ARROW ON THE CENTER LINE."
        	}
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
        		"en": "SELFIE ON WATERSLIDE LIKE A BOSS."
        	}
        }

	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0RpcHR5cXVlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0hvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc2VsZmllLXN0aWNrLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3NvY2lhbC1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy92aWRlby1jYW52YXMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbnN0YW50cy9BcHBDb25zdGFudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2Rpc3BhdGNoZXJzL0FwcERpc3BhdGNoZXIuanMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0RpcHR5cXVlLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvTWFwLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvUGFnZXNDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LENBQUE7QUFDM0UsV0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLElBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTtJQUMxRTtBQUNELE9BQUcsT0FBTyxJQUFJLFNBQVMsRUFBRTtBQUN4QixVQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ3pDLFVBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDMUMsVUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUEsQUFBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTtBQUNwRSxVQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUEsSUFBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUE7O0FBRS9ELFVBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQzVDLFVBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQzdDLFVBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxJQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxLQUFLLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUE7QUFDekUsVUFB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QUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hHLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2hGLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDMUcsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTs7QUFFbEYsT0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3BGLE9BQUks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LEVBQUU7QUFDeEMsT0FBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtBQUN2QyxPQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO0FBQzFDLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzlCLE9BQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFBO0FBQzNFLE9BQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFBO0FBQzNFLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7QUFDbkUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtBQUNuRSxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtBQUN2QyxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtHQUNwQzs7O1NBQ21CLHVCQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQzFDLE9BQUksRUFBRSxHQUFH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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwiLy8gQXZvaWQgY29uc29sZSBlcnJvcnMgZm9yIHRoZSBJRSBjcmFwcHkgYnJvd3NlcnNcbmlmICggISB3aW5kb3cuY29uc29sZSApIGNvbnNvbGUgPSB7IGxvZzogZnVuY3Rpb24oKXt9IH07XG5cbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHAgZnJvbSAnQXBwJ1xuaW1wb3J0IEFwcE1vYmlsZSBmcm9tICdBcHBNb2JpbGUnXG5pbXBvcnQgVHdlZW5NYXggZnJvbSAnZ3NhcCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IE1vYmlsZURldGVjdCBmcm9tICdtb2JpbGUtZGV0ZWN0J1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIG1kID0gbmV3IE1vYmlsZURldGVjdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcblxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSAobWQubW9iaWxlKCkgfHwgbWQudGFibGV0KCkpID8gdHJ1ZSA6IGZhbHNlXG5BcHBTdG9yZS5QYXJlbnQgPSBkb20uc2VsZWN0KCcjYXBwLWNvbnRhaW5lcicpXG5BcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSA9IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNicpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNycpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llOCcpXG5BcHBTdG9yZS5EZXRlY3Rvci5pc1N1cHBvcnRXZWJHTCA9IFV0aWxzLlN1cHBvcnRXZWJHTCgpXG5pZihBcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSkgQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSB0cnVlXG5cbi8vIERlYnVnXG4vLyBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxudmFyIGFwcDtcbmlmKEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlKSB7XG5cdGRvbS5jbGFzc2VzLmFkZChkb20uc2VsZWN0KCdodG1sJyksICdtb2JpbGUnKVxuXHRhcHAgPSBuZXcgQXBwTW9iaWxlKClcbn1lbHNle1xuXHRhcHAgPSBuZXcgQXBwKClcdFxufSBcblxuYXBwLmluaXQoKVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlIGZyb20gJ0FwcFRlbXBsYXRlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgUHJlbG9hZGVyIGZyb20gJ1ByZWxvYWRlcidcblxuY2xhc3MgQXBwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5vbkFwcFJlYWR5ID0gdGhpcy5vbkFwcFJlYWR5LmJpbmQodGhpcylcblx0XHR0aGlzLmxvYWRNYWluQXNzZXRzID0gdGhpcy5sb2FkTWFpbkFzc2V0cy5iaW5kKHRoaXMpXG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHRoaXMucm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0dGhpcy5yb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IFByZWxvYWRlclxuXHRcdEFwcFN0b3JlLlByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGUgPSBuZXcgQXBwVGVtcGxhdGUoKVxuXHRcdGFwcFRlbXBsYXRlLmlzUmVhZHkgPSB0aGlzLmxvYWRNYWluQXNzZXRzXG5cdFx0YXBwVGVtcGxhdGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0dGhpcy5yb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxuXHRsb2FkTWFpbkFzc2V0cygpIHtcblx0XHR2YXIgaGFzaFVybCA9IGxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDIpXG5cdFx0dmFyIHBhcnRzID0gaGFzaFVybC5zdWJzdHIoMSkuc3BsaXQoJy8nKVxuXHRcdHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuXHRcdGlmKG1hbmlmZXN0Lmxlbmd0aCA8IDEpIHRoaXMub25BcHBSZWFkeSgpXG5cdFx0ZWxzZSBBcHBTdG9yZS5QcmVsb2FkZXIubG9hZChtYW5pZmVzdCwgdGhpcy5vbkFwcFJlYWR5KVxuXHR9XG5cdG9uQXBwUmVhZHkoKSB7XG5cdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4gICAgXHRcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGVNb2JpbGUgZnJvbSAnQXBwVGVtcGxhdGVNb2JpbGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcblxuY2xhc3MgQXBwTW9iaWxlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHRyb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZU1vYmlsZSA9IG5ldyBBcHBUZW1wbGF0ZU1vYmlsZSgpXG5cdFx0YXBwVGVtcGxhdGVNb2JpbGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0cm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwTW9iaWxlXG4gICAgXHRcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUFhDb250YWluZXIgZnJvbSAnUFhDb250YWluZXInXG5pbXBvcnQgVHJhbnNpdGlvbk1hcCBmcm9tICdUcmFuc2l0aW9uTWFwJ1xuXG5jbGFzcyBBcHBUZW1wbGF0ZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5hbmltYXRlID0gdGhpcy5hbmltYXRlLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucHhDb250YWluZXIgPSBuZXcgUFhDb250YWluZXIoKVxuXHRcdHRoaXMucHhDb250YWluZXIuaW5pdCgnI3BhZ2VzLWNvbnRhaW5lcicpXG5cdFx0QXBwQWN0aW9ucy5weENvbnRhaW5lcklzUmVhZHkodGhpcy5weENvbnRhaW5lcilcblxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcCA9IG5ldyBUcmFuc2l0aW9uTWFwKClcblx0XHR0aGlzLnRyYW5zaXRpb25NYXAucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMuaXNSZWFkeSgpXG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cblx0XHRHbG9iYWxFdmVudHMucmVzaXplKClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHR0aGlzLmFuaW1hdGUoKVxuXHR9XG5cdGFuaW1hdGUoKSB7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZSlcblx0ICAgIHRoaXMucHhDb250YWluZXIudXBkYXRlKClcblx0ICAgIHRoaXMucGFnZXNDb250YWluZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucHhDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZVxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEZyb250Q29udGFpbmVyIGZyb20gJ0Zyb250Q29udGFpbmVyJ1xuaW1wb3J0IFBhZ2VzQ29udGFpbmVyIGZyb20gJ1BhZ2VzQ29udGFpbmVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5jbGFzcyBBcHBUZW1wbGF0ZU1vYmlsZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGVNb2JpbGUnLCBwYXJlbnQsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyID0gbmV3IEZyb250Q29udGFpbmVyKClcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyID0gbmV3IFBhZ2VzQ29udGFpbmVyKClcblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHRjb25zb2xlLmxvZygnbW9iaWxlIHlvJylcblxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0Ly8gdGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVNb2JpbGVcblxuIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5mdW5jdGlvbiBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpIHtcbiAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBsb2FkUGFnZUFzc2V0czogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuICAgICAgICBpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93UmVzaXplOiBmdW5jdGlvbih3aW5kb3dXLCB3aW5kb3dIKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSxcbiAgICAgICAgICAgIGl0ZW06IHsgd2luZG93Vzp3aW5kb3dXLCB3aW5kb3dIOndpbmRvd0ggfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcHhDb250YWluZXJJc1JlYWR5OiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfSVNfUkVBRFksXG4gICAgICAgICAgICBpdGVtOiBjb21wb25lbnRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4QWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweFJlbW92ZUNoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcEFjdGlvbnNcblxuXG4gICAgICBcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnRnJvbnRDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGhlYWRlckxpbmtzIGZyb20gJ2hlYWRlci1saW5rcydcbmltcG9ydCBzb2NpYWxMaW5rcyBmcm9tICdzb2NpYWwtbGlua3MnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcblxuY2xhc3MgRnJvbnRDb250YWluZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy5vblBhZ2VDaGFuZ2UgPSB0aGlzLm9uUGFnZUNoYW5nZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHZhciBzY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblx0XHRzY29wZS5pbmZvcyA9IEFwcFN0b3JlLmdsb2JhbENvbnRlbnQoKVxuXHRcdHNjb3BlLmZhY2Vib29rVXJsID0gZ2VuZXJhSW5mb3NbJ2ZhY2Vib29rX3VybCddXG5cdFx0c2NvcGUudHdpdHRlclVybCA9IGdlbmVyYUluZm9zWyd0d2l0dGVyX3VybCddXG5cdFx0c2NvcGUuaW5zdGFncmFtVXJsID0gZ2VuZXJhSW5mb3NbJ2luc3RhZ3JhbV91cmwnXVxuXHRcdHNjb3BlLmxhYlVybCA9IGdlbmVyYUluZm9zWydsYWJfdXJsJ11cblx0XHRzY29wZS5tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy9tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cdFx0c2NvcGUud29tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy93b21lbi9zaG9lcy9uZXctY29sbGVjdGlvbidcblxuXHRcdHN1cGVyLnJlbmRlcignRnJvbnRDb250YWluZXInLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLm9uUGFnZUNoYW5nZSlcblxuXHRcdHRoaXMuaGVhZGVyTGlua3MgPSBoZWFkZXJMaW5rcyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5zb2NpYWxMaW5rcyA9IHNvY2lhbExpbmtzKHRoaXMuZWxlbWVudClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblxuXHR9XG5cdG9uUGFnZUNoYW5nZSgpIHtcblx0XHR2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHRpZihoYXNoT2JqLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkRJUFRZUVVFKSB7XG5cdFx0XHR0aGlzLnNvY2lhbExpbmtzLmhpZGUoKVx0XHRcdFxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5zb2NpYWxMaW5rcy5zaG93KClcblx0XHR9XG5cdH1cblx0cmVzaXplKCkge1xuXG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5oZWFkZXJMaW5rcy5yZXNpemUoKVxuXHRcdHRoaXMuc29jaWFsTGlua3MucmVzaXplKClcblxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZyb250Q29udGFpbmVyXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBYQ29udGFpbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdChlbGVtZW50SWQpIHtcblx0XHR0aGlzLmNsZWFyQmFjayA9IGZhbHNlXG5cblx0XHR0aGlzLmFkZCA9IHRoaXMuYWRkLmJpbmQodGhpcylcblx0XHR0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQodGhpcylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELCB0aGlzLmFkZClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCwgdGhpcy5yZW1vdmUpXG5cblx0XHR2YXIgcmVuZGVyT3B0aW9ucyA9IHtcblx0XHQgICAgcmVzb2x1dGlvbjogMSxcblx0XHQgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG5cdFx0ICAgIGFudGlhbGlhczogdHJ1ZVxuXHRcdH07XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdC8vIHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMuY3VycmVudENvbG9yID0gMHhmZmZmZmZcblx0XHR2YXIgZWwgPSBkb20uc2VsZWN0KGVsZW1lbnRJZClcblx0XHR0aGlzLnJlbmRlcmVyLnZpZXcuc2V0QXR0cmlidXRlKCdpZCcsICdweC1jb250YWluZXInKVxuXHRcdEFwcFN0b3JlLkNhbnZhcyA9IHRoaXMucmVuZGVyZXIudmlld1xuXHRcdGRvbS50cmVlLmFkZChlbCwgdGhpcy5yZW5kZXJlci52aWV3KVxuXHRcdHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdC8vIHRoaXMuYmFja2dyb3VuZCA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHRcdC8vIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5iYWNrZ3JvdW5kKVxuXG5cdFx0dGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdC8vIHRoaXMuc3RhdHMuc2V0TW9kZSggMSApOyAvLyAwOiBmcHMsIDE6IG1zLCAyOiBtYlxuXG5cdFx0Ly8gYWxpZ24gdG9wLWxlZnRcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZVsnei1pbmRleCddID0gOTk5OTk5XG5cblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLnN0YXRzLmRvbUVsZW1lbnQgKTtcblxuXHR9XG5cdGRyYXdCYWNrZ3JvdW5kKGNvbG9yKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMuYmFja2dyb3VuZC5jbGVhcigpXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmxpbmVTdHlsZSgwKTtcblx0XHR0aGlzLmJhY2tncm91bmQuYmVnaW5GaWxsKGNvbG9yLCAxKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgd2luZG93Vywgd2luZG93SCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmVuZEZpbGwoKTtcblx0fVxuXHRhZGQoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGNoaWxkKVxuXHR9XG5cdHJlbW92ZShjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQoY2hpbGQpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuc3RhdHMudXBkYXRlKClcblx0ICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciBzY2FsZSA9IDFcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMucmVuZGVyZXIucmVzaXplKHdpbmRvd1cgKiBzY2FsZSwgd2luZG93SCAqIHNjYWxlKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlUGFnZSBmcm9tICdCYXNlUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQeEhlbHBlciBmcm9tICdQeEhlbHBlcidcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnZSBleHRlbmRzIEJhc2VQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcylcblx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IGZhbHNlXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHRoaXMucHhDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4QWRkQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25JbigpIHtcblx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDRcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbkluKClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDRcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0aWYodGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcblx0XHRcdHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkID0gdHJ1ZVxuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAwXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDFcblx0XHR9XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdGdldEltYWdlVXJsQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlVVJMKHVybClcblx0fVxuXHRnZXRJbWFnZVNpemVCeUlkKGlkKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FID8gJ2hvbWUtJyArIGlkIDogdGhpcy5wcm9wcy5oYXNoLnBhcmVudCArICctJyArIHRoaXMucHJvcHMuaGFzaC50YXJnZXQgKyAnLScgKyBpZFxuXHRcdHJldHVybiBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VTaXplKHVybClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UHhIZWxwZXIucmVtb3ZlQ2hpbGRyZW5Gcm9tQ29udGFpbmVyKHRoaXMucHhDb250YWluZXIpXG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4UmVtb3ZlQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCB7UGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50c30gZnJvbSAnUGFnZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQmFzZVBhZ2VyIGZyb20gJ0Jhc2VQYWdlcidcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEhvbWUgZnJvbSAnSG9tZSdcbmltcG9ydCBIb21lVGVtcGxhdGUgZnJvbSAnSG9tZV9oYnMnXG5pbXBvcnQgRGlwdHlxdWUgZnJvbSAnRGlwdHlxdWUnXG5pbXBvcnQgRGlwdHlxdWVUZW1wbGF0ZSBmcm9tICdEaXB0eXF1ZV9oYnMnXG5cbmNsYXNzIFBhZ2VzQ29udGFpbmVyIGV4dGVuZHMgQmFzZVBhZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuZGlkSGFzaGVyQ2hhbmdlID0gdGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZUFzc2V0c0xvYWRlZCA9IHRoaXMucGFnZUFzc2V0c0xvYWRlZC5iaW5kKHRoaXMpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMuZGlkSGFzaGVyQ2hhbmdlKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0FTU0VUU19MT0FERUQsIHRoaXMucGFnZUFzc2V0c0xvYWRlZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKCkge1xuXHRcdHZhciBuZXdIYXNoID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdHZhciBvbGRIYXNoID0gUm91dGVyLmdldE9sZEhhc2goKVxuXHRcdGlmKG9sZEhhc2ggPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpXG5cdFx0fWVsc2V7XG5cdFx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uT3V0KClcblx0XHRcdC8vIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KClcblx0XHR9XG5cdH1cblx0dGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaCkge1xuXHRcdHZhciB0eXBlID0gdW5kZWZpbmVkXG5cdFx0dmFyIHRlbXBsYXRlID0gdW5kZWZpbmVkXG5cdFx0c3dpdGNoKG5ld0hhc2gudHlwZSkge1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuRElQVFlRVUU6XG5cdFx0XHRcdHR5cGUgPSBEaXB0eXF1ZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IERpcHR5cXVlVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkhPTUU6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdH1cblx0XHR0aGlzLnNldHVwTmV3Q29tcG9uZW50KG5ld0hhc2gsIHR5cGUsIHRlbXBsYXRlKVxuXHRcdHRoaXMuY3VycmVudENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdH1cblx0cGFnZUFzc2V0c0xvYWRlZCgpIHtcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR0aGlzLnRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpXG5cdFx0c3VwZXIucGFnZUFzc2V0c0xvYWRlZCgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlc0NvbnRhaW5lclxuXG5cblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdUcmFuc2l0aW9uTWFwX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IG1hcCBmcm9tICdtYWluLW1hcCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJDb25zdGFudHN9IGZyb20gJ1BhZ2VyJ1xuXG5jbGFzcyBUcmFuc2l0aW9uTWFwIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQgPSB0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnByZWxvYWRlclByb2dyZXNzID0gdGhpcy5wcmVsb2FkZXJQcm9ncmVzcy5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHZhciBzY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblxuXHRcdHN1cGVyLnJlbmRlcignVHJhbnNpdGlvbk1hcCcsIHBhcmVudCwgdGVtcGxhdGUsIHNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLm9uUGFnZVRyYW5zaXRpb25PdXQpXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fQ09NUExFVEUsIHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyLnF1ZXVlLm9uKFwicHJvZ3Jlc3NcIiwgdGhpcy5wcmVsb2FkZXJQcm9ncmVzcywgdGhpcylcblxuXHRcdHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLlRSQU5TSVRJT04pXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbk91dCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblx0XHR0aGlzLm1hcC5oaWdobGlnaHQoUm91dGVyLmdldE9sZEhhc2goKSwgUm91dGVyLmdldE5ld0hhc2goKSlcblx0fVxuXHRvblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAucmVzZXRIaWdobGlnaHQoKVxuXHR9XG5cdHByZWxvYWRlclByb2dyZXNzKGUpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyArPSAwLjJcblx0XHRpZihlLnByb2dyZXNzID4gMC45OSkgdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAxXG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSB0aGlzLmN1cnJlbnRQcm9ncmVzcyA+IDEgPyAxIDogdGhpcy5jdXJyZW50UHJvZ3Jlc3MgXG5cdFx0dGhpcy5tYXAudXBkYXRlUHJvZ3Jlc3MoZS5wcm9ncmVzcylcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5tYXAucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2l0aW9uTWFwXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgYXJvdW5kQm9yZGVyID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciAkY29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmFyb3VuZC1ib3JkZXItY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wID0gZG9tLnNlbGVjdCgnLnRvcCcsICRjb250YWluZXIpXG5cdHZhciBib3R0b20gPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGNvbnRhaW5lcilcblx0dmFyIGxlZnQgPSBkb20uc2VsZWN0KCcubGVmdCcsICRjb250YWluZXIpXG5cdHZhciByaWdodCA9IGRvbS5zZWxlY3QoJy5yaWdodCcsICRjb250YWluZXIpXG5cblx0dmFyICRsZXR0ZXJzQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciB0b3BMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLnRvcCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgYm90dG9tTGV0dGVycyA9IGRvbS5zZWxlY3QoJy5ib3R0b20nLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGxlZnRMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIHJpZ2h0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5yaWdodCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgYm9yZGVyU2l6ZSA9IDEwXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MgXVxuXG5cdFx0XHR0b3Auc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYm9yZGVyU2l6ZSArICdweCdcblx0XHRcdGxlZnQuc3R5bGUuaGVpZ2h0ID0gcmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdHJpZ2h0LnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYm9yZGVyU2l6ZSArICdweCdcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3BMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciB0bCA9IHRvcExldHRlcnNbaV1cblx0XHRcdFx0dGwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHR0bC5zdHlsZS50b3AgPSAtMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJvdHRvbUxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJsID0gYm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRibC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGJsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSAxMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlZnRMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsbCA9IGxlZnRMZXR0ZXJzW2ldXG5cdFx0XHRcdGxsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRsbC5zdHlsZS5sZWZ0ID0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpZ2h0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcmwgPSByaWdodExldHRlcnNbaV1cblx0XHRcdFx0cmwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSArIChibG9ja1NpemVbMV0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHJsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gOCArICdweCdcblx0XHRcdH07XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHR0b3BMZXR0ZXJzID0gbnVsbFxuXHRcdFx0Ym90dG9tTGV0dGVycyA9IG51bGxcblx0XHRcdGxlZnRMZXR0ZXJzID0gbnVsbFxuXHRcdFx0cmlnaHRMZXR0ZXJzID0gbnVsbFxuXHRcdH1cblx0fSBcblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJvdW5kQm9yZGVyIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCBvbk1vdXNlRW50ZXIsIG9uTW91c2VMZWF2ZSk9PiB7XG5cdHZhciBzY29wZTtcblx0dmFyIGFycm93c1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuYXJyb3dzLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBsZWZ0QXJyb3cgPSBkb20uc2VsZWN0KCcuYXJyb3cubGVmdCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciByaWdodEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LnJpZ2h0JywgYXJyb3dzV3JhcHBlcilcblx0dmFyIGFycm93cyA9IHtcblx0XHRsZWZ0OiB7XG5cdFx0XHRlbDogbGVmdEFycm93LFxuXHRcdFx0aWNvbnM6IGRvbS5zZWxlY3QuYWxsKCdzdmcnLCBsZWZ0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIGxlZnRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGxlZnRBcnJvdylcblx0XHR9LFxuXHRcdHJpZ2h0OiB7XG5cdFx0XHRlbDogcmlnaHRBcnJvdyxcblx0XHRcdGljb25zOiBkb20uc2VsZWN0LmFsbCgnc3ZnJywgcmlnaHRBcnJvdyksXG5cdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgcmlnaHRBcnJvdyksXG5cdFx0XHRiYWNrZ3JvdW5kOiBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIHJpZ2h0QXJyb3cpXG5cdFx0fVxuXHR9XG5cblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdGJhY2tncm91bmQ6IChkaXIpPT4ge1xuXHRcdFx0cmV0dXJuIGFycm93c1tkaXJdLmJhY2tncm91bmRcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIGFycm93U2l6ZSA9IGRvbS5zaXplKGFycm93cy5sZWZ0Lmljb25zWzFdKVxuXHRcdFx0dmFyIG9mZnNldFkgPSAyMFxuXHRcdFx0dmFyIGJnV2lkdGggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cblx0XHRcdGFycm93cy5yaWdodC5lbC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJnV2lkdGggKyAncHgnXG5cblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCArICdweCdcblxuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYXJyb3dTaXplWzBdID4+IDEpIC0gb2Zmc2V0WSArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IGJnV2lkdGggLSBhcnJvd1NpemVbMF0gLSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cdFx0XHRcdFxuXHRcdH0sXG5cdFx0b3ZlcjogKGRpcik9PiB7XG5cdFx0XHR2YXIgYXJyb3cgPSBhcnJvd3NbZGlyXVxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGFycm93LmVsLCAnaG92ZXJlZCcpXG5cdFx0fSxcblx0XHRvdXQ6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGFycm93cyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgYm90dG9tVGV4dHMgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBib3R0b21UZXh0c0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5ib3R0b20tdGV4dHMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEJsb2NrID0gZG9tLnNlbGVjdCgnLmxlZnQtdGV4dCcsIGJvdHRvbVRleHRzQ29udGFpbmVyKVxuXHR2YXIgcmlnaHRCbG9jayA9IGRvbS5zZWxlY3QoJy5yaWdodC10ZXh0JywgYm90dG9tVGV4dHNDb250YWluZXIpXG5cdHZhciBsZWZ0RnJvbnQgPSBkb20uc2VsZWN0KCcuZnJvbnQtd3JhcHBlcicsIGxlZnRCbG9jaylcblx0dmFyIHJpZ2h0RnJvbnQgPSBkb20uc2VsZWN0KCcuZnJvbnQtd3JhcHBlcicsIHJpZ2h0QmxvY2spXG5cblx0dmFyIHJlc2l6ZSA9ICgpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMgXVxuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRsZWZ0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0cmlnaHRCbG9jay5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdICogMikgKyAncHgnXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRsZWZ0RnJvbnQuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIChsZWZ0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpIC0gKHJpZ2h0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS5sZWZ0ID0gKChibG9ja1NpemVbMF0gPDwgMSkgPj4gMSkgLSAocmlnaHRGcm9udC5jbGllbnRXaWR0aCA+PiAxKSArICdweCdcblx0XHR9KVxuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6IHJlc2l6ZVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJvdHRvbVRleHRzIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBjaGFyYWN0ZXJVcmwsIHRleHR1cmVTaXplKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoY2hhcmFjdGVyVXJsKVxuXHR2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleClcblx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdGhvbGRlci5hZGRDaGlsZChzcHJpdGUpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggKyAoMTAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5ICsgKDEwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDNcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wM1xuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dIIC0gMTAwKSAvIHRleHR1cmVTaXplLmhlaWdodCkgKiAxXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKHNwcml0ZSlcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRzcHJpdGUgPSBudWxsXG5cdFx0XHR0ZXggPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgY29sb3JzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgYmdDb2xvcnMgPSBbXVxuXHRiZ0NvbG9ycy5sZW5ndGggPSA1XG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBiZ0NvbG9yID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdGJnQ29sb3JzW2ldID0gYmdDb2xvclxuXHRcdGhvbGRlci5hZGRDaGlsZChiZ0NvbG9yKVxuXHR9O1xuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDEuNSlcblx0XHR0bC5wbGF5KDApXG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgyKVxuXHRcdHRsLnJldmVyc2UoKVxuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHR0bDogdGwsXG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICh3aWR0aCwgaGVpZ2h0LCBkaXJlY3Rpb24pPT57XG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGhzID0gY29sb3JzLmZyb20uaCAtIGNvbG9ycy50by5oXG5cdFx0XHR2YXIgc3MgPSBjb2xvcnMuZnJvbS5zIC0gY29sb3JzLnRvLnNcblx0XHRcdHZhciB2cyA9IGNvbG9ycy5mcm9tLnYgLSBjb2xvcnMudG8udlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBIID0gaHMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwUyA9IHNzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFYgPSB2cyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIGhkID0gKGhzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciBzZCA9IChzcyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgdmQgPSAodnMgPCAwKSA/IC0xIDogMVxuXG5cdFx0XHR2YXIgZGVsYXkgPSAwLjEyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0dmFyIGggPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLmggKyAoc3RlcEgqaSpoZCkpXG5cdFx0XHRcdHZhciBzID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5zICsgKHN0ZXBTKmkqc2QpKVxuXHRcdFx0XHR2YXIgdiA9IE1hdGgucm91bmQoY29sb3JzLmZyb20udiArIChzdGVwVippKnZkKSlcblx0XHRcdFx0dmFyIGMgPSAnMHgnICsgY29sb3JVdGlscy5oc3ZUb0hleChoLCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5UT1A6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6aGVpZ2h0IH0sIHsgeTotaGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkJPVFRPTTpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotaGVpZ2h0IH0sIHsgeTpoZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuTEVGVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDp3aWR0aCB9LCB7IHg6LXdpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlJJR0hUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4Oi13aWR0aCB9LCB7IHg6d2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9O1xuXG5cdFx0XHR0bC5wYXVzZSgwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGwuY2xlYXIoKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoYmdDb2xvcilcblx0XHRcdFx0YmdDb2xvciA9IG51bGxcblx0XHRcdH07XG5cdFx0XHRiZ0NvbG9ycyA9IG51bGxcblx0XHRcdHRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgYmdVcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIGJnVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoYmdVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoYmdUZXh0dXJlKVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRiZ1Nwcml0ZTogc3ByaXRlLFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCAtICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wMDhcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wMDhcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHNpemVbMF0sIHNpemVbMV0sIDk2MCwgMTAyNClcblxuXHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSA+PiAxXG5cdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gcmVzaXplVmFycy5zY2FsZSArIDAuMVxuXHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yeVJlY3RzIGZyb20gJ2NvbG9yeS1yZWN0cydcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBwYXJlbnQsIG1vdXNlLCBkYXRhKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBvbkNsb3NlVGltZW91dDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmZ1bi1mYWN0LXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciB2aWRlb1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudmlkZW8td3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZVdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS13cmFwcGVyJywgZWwpXG5cdHZhciBtZXNzYWdlSW5uZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS1pbm5lcicsIG1lc3NhZ2VXcmFwcGVyKVxuXG5cdHZhciBzcGxpdHRlciA9IG5ldyBTcGxpdFRleHQobWVzc2FnZUlubmVyLCB7dHlwZTpcIndvcmRzXCJ9KVxuXG5cdHZhciBjID0gZG9tLnNlbGVjdCgnLmN1cnNvci1jcm9zcycsIGVsKVxuXHR2YXIgY3Jvc3MgPSB7XG5cdFx0eDogMCxcblx0XHR5OiAwLFxuXHRcdGVsOiBjLFxuXHRcdHNpemU6IGRvbS5zaXplKGMpXG5cdH1cblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBsZWZ0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblx0dmFyIHJpZ2h0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblxuXHR2YXIgbUJnQ29sb3IgPSBkYXRhWydhbWJpZW50LWNvbG9yJ10udG9cblx0bWVzc2FnZVdyYXBwZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMnICsgY29sb3JVdGlscy5oc3ZUb0hleChtQmdDb2xvci5oLCBtQmdDb2xvci5zLCBtQmdDb2xvci52KVxuXG5cdHZhciBsZWZ0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR2YXIgcmlnaHRUbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdGxvb3A6IHRydWVcblx0fSlcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnZnVuLWZhY3QtdmlkZW8tdXJsJ11cblx0bVZpZGVvLmFkZFRvKHZpZGVvV3JhcHBlcilcblx0bVZpZGVvLmxvYWQodmlkZW9TcmMsICgpPT4ge1xuXHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblxuXHR2YXIgb25DbG9zZUZ1bkZhY3QgPSAoKT0+IHtcblx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRzY29wZS5jbG9zZSgpXG5cdH1cblxuXHR2YXIgb3BlbiA9ICgpPT4ge1xuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0XHRsZWZ0UmVjdHMub3BlbigpXG5cdFx0cmlnaHRSZWN0cy5vcGVuKClcblx0XHR2YXIgZGVsYXkgPSAzNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5tVmlkZW8ucGxheSgpLCBkZWxheSsyMDApXG5cdFx0Y2xlYXJUaW1lb3V0KG9uQ2xvc2VUaW1lb3V0KVxuXHRcdG9uQ2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKT0+ZG9tLmV2ZW50Lm9uKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpLCBkZWxheSsyMDApXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdub25lJ1xuXHRcdGRvbS5jbGFzc2VzLmFkZChjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdFx0XG5cdH1cblx0dmFyIGNsb3NlID0gKCk9PiB7XG5cdFx0c2NvcGUuaXNPcGVuID0gZmFsc2Vcblx0XHRsZWZ0UmVjdHMuY2xvc2UoKVxuXHRcdHJpZ2h0UmVjdHMuY2xvc2UoKVxuXHRcdHZhciBkZWxheSA9IDUwXG5cdFx0c2V0VGltZW91dCgoKT0+bGVmdFRsLnRpbWVTY2FsZSgyKS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9PnJpZ2h0VGwudGltZVNjYWxlKDIpLnJldmVyc2UoKSwgZGVsYXkpXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdGRvbS5ldmVudC5vZmYocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICgpPT57XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgbWlkV2luZG93VyA9ICh3aW5kb3dXID4+IDEpXG5cblxuXHRcdFx0dmFyIHNpemUgPSBbbWlkV2luZG93VyArIDEsIHdpbmRvd0hdXG5cblx0XHRcdGxlZnRSZWN0cy5yZXNpemUoc2l6ZVswXSwgc2l6ZVsxXSwgQXBwQ29uc3RhbnRzLlRPUClcblx0XHRcdHJpZ2h0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5CT1RUT00pXG5cdFx0XHRyaWdodFJlY3RzLmhvbGRlci54ID0gd2luZG93VyAvIDJcblx0XHRcdFx0XG5cdFx0XHQvLyBpZiB2aWRlbyBpc24ndCByZWFkeSByZXR1cm5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0dmFyIHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KG1pZFdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVyA+PiAxLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS53aWR0aCA9IG1lc3NhZ2VXcmFwcGVyLnN0eWxlLndpZHRoID0gbWlkV2luZG93VyArICdweCdcblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBtZXNzYWdlV3JhcHBlci5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLmxlZnQgPSBtaWRXaW5kb3dXICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLndpZHRoID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5oZWlnaHQgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS50b3AgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLnRvcCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5sZWZ0ID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHR2YXIgbWVzc2FnZUlubmVyU2l6ZSA9IGRvbS5zaXplKG1lc3NhZ2VJbm5lcilcblx0XHRcdFx0bWVzc2FnZUlubmVyLnN0eWxlLmxlZnQgPSAobWlkV2luZG93VyA+PiAxKSAtIChtZXNzYWdlSW5uZXJTaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRtZXNzYWdlSW5uZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVsxXSA+PiAxKSArICdweCdcblx0XHRcdH0sIDApXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdGxlZnRUbC5jbGVhcigpXG5cdFx0XHRcdHJpZ2h0VGwuY2xlYXIoKVxuXG5cdFx0XHRcdGxlZnRUbC5mcm9tVG8obWVzc2FnZVdyYXBwZXIsIDEuNCwgeyB5OndpbmRvd0gsIHNjYWxlWTozLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAwJScgfSwgeyB5OjAsIHNjYWxlWToxLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdFx0XHRsZWZ0VGwuc3RhZ2dlckZyb20oc3BsaXR0ZXIud29yZHMsIDEsIHsgeToxNDAwLCBzY2FsZVk6NiwgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZU91dCB9LCAwLjA2LCAwLjIpXG5cdFx0XHRcdHJpZ2h0VGwuZnJvbVRvKHZpZGVvV3JhcHBlciwgMS40LCB7IHk6LXdpbmRvd0gqMiwgc2NhbGVZOjMsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnIH0sIHsgeTowLCBzY2FsZVk6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXG5cdFx0XHRcdGxlZnRUbC5wYXVzZSgwKVxuXHRcdFx0XHRyaWdodFRsLnBhdXNlKDApXG5cdFx0XHR9LCA1KVxuXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzT3BlbikgcmV0dXJuXG5cdFx0XHR2YXIgbmV3eCA9IG1vdXNlLnggLSAoY3Jvc3Muc2l6ZVswXSA+PiAxKVxuXHRcdFx0dmFyIG5ld3kgPSBtb3VzZS55IC0gKGNyb3NzLnNpemVbMV0gPj4gMSlcblx0XHRcdGNyb3NzLnggKz0gKG5ld3ggLSBjcm9zcy54KSAqIDAuNVxuXHRcdFx0Y3Jvc3MueSArPSAobmV3eSAtIGNyb3NzLnkpICogMC41XG5cdFx0XHRVdGlscy5UcmFuc2xhdGUoY3Jvc3MuZWwsIGNyb3NzLngsIGNyb3NzLnksIDEpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChob2xkZXIpXG5cdFx0XHRsZWZ0UmVjdHMuY2xlYXIoKVxuXHRcdFx0bGVmdFJlY3RzID0gbnVsbFxuXHRcdFx0cmlnaHRSZWN0cy5jbGVhcigpXG5cdFx0XHRyaWdodFJlY3RzID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgdmlkZW9DYW52YXMgZnJvbSAndmlkZW8tY2FudmFzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5pbXBvcnQgbWVkaWFDZWxsIGZyb20gJ21lZGlhLWNlbGwnXG5cbnZhciBncmlkID0gKHByb3BzLCBwYXJlbnQsIG9uSXRlbUVuZGVkKT0+IHtcblxuXHR2YXIgdmlkZW9FbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgaW1hZ2VFbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgZ3JpZENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgbGluZXNHcmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmxpbmVzLWdyaWQtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgZ3JpZENoaWxkcmVuID0gZ3JpZENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgbGluZXNIb3Jpem9udGFsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAudmVydGljYWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgc2NvcGU7XG5cdHZhciBjdXJyZW50U2VhdDtcblx0dmFyIGNlbGxzID0gW11cblx0dmFyIHRvdGFsTnVtID0gcHJvcHMuZGF0YS5ncmlkLmxlbmd0aFxuXHR2YXIgdmlkZW9zID0gQXBwU3RvcmUuZ2V0SG9tZVZpZGVvcygpXG5cblx0dmFyIHNlYXRzID0gW1xuXHRcdDEsIDMsIDUsXG5cdFx0NywgOSwgMTEsXG5cdFx0MTUsIDE3LFxuXHRcdDIxLCAyMywgMjVcblx0XVxuXG5cdHZhciB2Q2FudmFzUHJvcHMgPSB7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdHZvbHVtZTogMCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRvbkVuZGVkOiB2aWRlb0VuZGVkXG5cdH1cblxuXHR2YXIgbUNlbGw7XG5cdHZhciBjb3VudGVyID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbE51bTsgaSsrKSB7XG5cdFx0dmFyIHZQYXJlbnQgPSBncmlkQ2hpbGRyZW5baV1cblx0XHRjZWxsc1tpXSA9IHVuZGVmaW5lZFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2VhdHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmKGkgPT0gc2VhdHNbal0pIHtcblx0XHRcdFx0bUNlbGwgPSBtZWRpYUNlbGwodlBhcmVudCwgdmlkZW9zW2NvdW50ZXJdKVxuXHRcdFx0XHRjZWxsc1tpXSA9IG1DZWxsXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoZ0dyaWQpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgb3JpZ2luYWxWaWRlb1NpemUgPSBBcHBDb25zdGFudHMuSE9NRV9WSURFT19TSVpFXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IGdHcmlkLmJsb2NrU2l6ZVxuXG5cdFx0bGluZXNHcmlkQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG5cdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdLCBvcmlnaW5hbFZpZGVvU2l6ZVswXSwgb3JpZ2luYWxWaWRlb1NpemVbMV0pXG5cdFx0XG5cdFx0dmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHR2YXIgcGFyZW50LCBjZWxsO1xuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgaGwsIHZsO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZ1Bvcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gaG9yaXpvbnRhbCBsaW5lc1xuXHRcdFx0aWYoaSA+IDApIHtcblx0XHRcdFx0aGwgPSBzY29wZS5saW5lcy5ob3Jpem9udGFsW2ktMV1cblx0XHRcdFx0aGwuc3R5bGUudG9wID0gYmxvY2tTaXplWzFdICogaSArICdweCdcblx0XHRcdFx0aGwuc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdmVydGljYWwgbGluZXNcblx0XHRcdFx0aWYoaSA9PSAwICYmIGogPiAwKSB7XG5cdFx0XHRcdFx0dmwgPSBzY29wZS5saW5lcy52ZXJ0aWNhbFtqLTFdXG5cdFx0XHRcdFx0dmwuc3R5bGUubGVmdCA9IGJsb2NrU2l6ZVswXSAqIGogKyAncHgnXG5cdFx0XHRcdFx0dmwuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNlbGwgPSBzY29wZS5jZWxsc1tjb3VudF1cblx0XHRcdFx0aWYoY2VsbCAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsLnJlc2l6ZShibG9ja1NpemUsIHJvd1tqXSwgcmVzaXplVmFycylcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBncmlkQ29udGFpbmVyLFxuXHRcdGNoaWxkcmVuOiBncmlkQ2hpbGRyZW4sXG5cdFx0Y2VsbHM6IGNlbGxzLFxuXHRcdG51bTogdG90YWxOdW0sXG5cdFx0cG9zaXRpb25zOiBbXSxcblx0XHRsaW5lczoge1xuXHRcdFx0aG9yaXpvbnRhbDogbGluZXNIb3Jpem9udGFsLFxuXHRcdFx0dmVydGljYWw6IGxpbmVzVmVydGljYWxcblx0XHR9LFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdGluaXQ6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5pbml0KClcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRyYW5zaXRpb25Jbkl0ZW06IChpbmRleCwgdHlwZSk9PiB7XG5cdFx0XHQvLyB2YXIgaXRlbSA9IHNjb3BlLmNlbGxzW2luZGV4XVxuXHRcdFx0Ly8gaXRlbS5zZWF0ID0gaW5kZXhcblxuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LmFkZCgnZW5hYmxlJylcblx0XHRcdFxuXHRcdFx0Ly8gaWYodHlwZSA9PSBBcHBDb25zdGFudHMuSVRFTV9WSURFTykge1xuXHRcdFx0Ly8gXHRpdGVtLnBsYXkoKVxuXHRcdFx0Ly8gfWVsc2V7XG5cdFx0XHQvLyBcdGl0ZW0udGltZW91dChpbWFnZUVuZGVkLCAyMDAwKVxuXHRcdFx0Ly8gXHRpdGVtLnNlZWsoVXRpbHMuUmFuZCgyLCAxMCwgMCkpXG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uT3V0SXRlbTogKGl0ZW0pPT4ge1xuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZW5hYmxlJylcblxuXHRcdFx0Ly8gaXRlbS52aWRlby5jdXJyZW50VGltZSgwKVxuXHRcdFx0Ly8gaXRlbS5wYXVzZSgpXG5cdFx0XHQvLyBzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHQvLyBcdGl0ZW0uZHJhd09uY2UoKVxuXHRcdFx0Ly8gfSwgNTAwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5jbGVhcigpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiLypcblx0d2lkdGg6IFx0XHR3aWR0aCBvZiBncmlkXG5cdGhlaWdodDogXHRoZWlnaHQgb2YgZ3JpZFxuXHRjb2x1bW5zOiBcdG51bWJlciBvZiBjb2x1bW5zXG5cdHJvd3M6IFx0XHRudW1iZXIgb2Ygcm93c1xuXHR0eXBlOiBcdFx0dHlwZSBvZiB0aGUgYXJyYXlcblx0XHRcdFx0bGluZWFyIC0gd2lsbCBnaXZlIGFsbCB0aGUgY29scyBhbmQgcm93cyBwb3NpdGlvbiB0b2dldGhlciBvbmUgYWZ0ZXIgdGhlIG90aGVyXG5cdFx0XHRcdGNvbHNfcm93cyAtIHdpbGwgZ2l2ZSBzZXBhcmF0ZSByb3dzIGFycmF5cyB3aXRoIHRoZSBjb2xzIGluc2lkZSBcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm93WyBbY29sXSwgW2NvbF0sIFtjb2xdLCBbY29sXSBdXG4qL1xuXG5leHBvcnQgZGVmYXVsdCAod2lkdGgsIGhlaWdodCwgY29sdW1ucywgcm93cywgdHlwZSk9PiB7XG5cblx0dmFyIHQgPSB0eXBlIHx8ICdsaW5lYXInXG5cdHZhciBibG9ja1NpemUgPSBbIHdpZHRoIC8gY29sdW1ucywgaGVpZ2h0IC8gcm93cyBdXG5cdHZhciBibG9ja3NMZW4gPSByb3dzICogY29sdW1uc1xuXHR2YXIgcG9zaXRpb25zID0gW11cblx0XG5cdHZhciBwb3NYID0gMFxuXHR2YXIgcG9zWSA9IDBcblx0dmFyIGNvbHVtbkNvdW50ZXIgPSAwXG5cdHZhciByb3dzQ291bnRlciA9IDBcblx0dmFyIHJyID0gW11cblxuXHRzd2l0Y2godCkge1xuXHRcdGNhc2UgJ2xpbmVhcic6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdFx0XHRjb2x1bW5Db3VudGVyICs9IDFcblx0XHRcdFx0cG9zaXRpb25zW2ldID0gYlxuXHRcdFx0fTtcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnY29sc19yb3dzJzogXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrc0xlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cdFx0XHRcdHJyLnB1c2goYilcblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdGlmKGNvbHVtbkNvdW50ZXIgPj0gY29sdW1ucykge1xuXHRcdFx0XHRcdHBvc1ggPSAwXG5cdFx0XHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdFx0XHRjb2x1bW5Db3VudGVyID0gMFxuXHRcdFx0XHRcdHBvc2l0aW9uc1tyb3dzQ291bnRlcl0gPSByclxuXHRcdFx0XHRcdHJyID0gW11cblx0XHRcdFx0XHRyb3dzQ291bnRlcisrXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHR9XG5cblxuXHRyZXR1cm4ge1xuXHRcdHJvd3M6IHJvd3MsXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRibG9ja1NpemU6IGJsb2NrU2l6ZSxcblx0XHRwb3NpdGlvbnM6IHBvc2l0aW9uc1xuXHR9XG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgaGVhZGVyTGlua3MgPSAocGFyZW50KT0+IHtcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvblN1Yk1lbnVNb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLmFkZChlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgY2FtcGVyTGFiRWwgPSBkb20uc2VsZWN0KCcuY2FtcGVyLWxhYicsIHBhcmVudClcblx0dmFyIHNob3BFbCA9IGRvbS5zZWxlY3QoJy5zaG9wLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBtYXBFbCA9IGRvbS5zZWxlY3QoJy5tYXAtYnRuJywgcGFyZW50KVxuXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblN1Yk1lbnVNb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAvIDNcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtIGRvbS5zaXplKGNhbXBlckxhYkVsKVswXSxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgc2hvcENzcyA9IHtcblx0XHRcdFx0bGVmdDogY2FtcGVyTGFiQ3NzLmxlZnQgLSBkb20uc2l6ZShzaG9wRWwpWzBdIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSBkb20uc2l6ZShtYXBFbClbMF0gLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUubGVmdCA9IGNhbXBlckxhYkNzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS5sZWZ0ID0gc2hvcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUubGVmdCA9IG1hcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lcik9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0Ly8gdmFyIGNhbnZhc2VzID0gZWwuY2hpbGRyZW5cblx0Ly8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHQvLyB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdHZhciBvbkltZ0xvYWRlZENhbGxiYWNrO1xuXHR2YXIgZ3JpZDtcblx0dmFyIGltYWdlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cblx0Ly8gdmFyIGl0ZW1zID0gW11cblx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuXHQvLyBcdHZhciB0bXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBcblx0Ly8gXHRpdGVtc1tpXSA9IHtcblx0Ly8gXHRcdGNhbnZhczogY2FudmFzZXNbaV0sXG5cdC8vIFx0XHRjdHg6IGNhbnZhc2VzW2ldLmdldENvbnRleHQoJzJkJyksXG5cdC8vIFx0XHR0bXBDYW52YXM6IHRtcENhbnZhcyxcblx0Ly8gXHRcdHRtcENvbnRleHQ6IHRtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cdC8vIFx0fVxuXHQvLyB9XG5cblx0dmFyIG9uSW1nUmVhZHkgPSAoZXJyb3IsIGkpPT4ge1xuXHRcdGltYWdlID0gaVxuXHRcdGRvbS50cmVlLmFkZChlbCwgaW1hZ2UpXG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoZ3JpZClcblx0XHRpZihvbkltZ0xvYWRlZENhbGxiYWNrKSBvbkltZ0xvYWRlZENhbGxiYWNrKClcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKGdHcmlkKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0Z3JpZCA9IGdHcmlkXG5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cdFx0XHRpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRcdGltYWdlLnN0eWxlLndpZHRoID0gcmVzaXplVmFyc0JnLndpZHRoICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFyc0JnLmhlaWdodCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnNCZy50b3AgKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS5sZWZ0ID0gcmVzaXplVmFyc0JnLmxlZnQgKyAncHgnXG5cblx0XHRcdC8vIHZhciBibG9ja1NpemUgPSBnR3JpZC5ibG9ja1NpemVcblx0XHRcdC8vIHZhciBpbWFnZUJsb2NrU2l6ZSA9IFsgcmVzaXplVmFyc0JnLndpZHRoIC8gZ0dyaWQuY29sdW1ucywgcmVzaXplVmFyc0JnLmhlaWdodCAvIGdHcmlkLnJvd3MgXVxuXHRcdFx0Ly8gdmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHRcdC8vIHZhciBjb3VudCA9IDBcblx0XHRcdC8vIHZhciBjYW52YXMsIGN0eCwgdG1wQ29udGV4dCwgdG1wQ2FudmFzO1xuXG5cdFx0XHQvLyBmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdC8vIFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gXHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0Ly8gXHRcdGNhbnZhcyA9IGl0ZW1zW2NvdW50XS5jYW52YXNcblx0XHRcdC8vIFx0XHRjdHggPSBpdGVtc1tjb3VudF0uY3R4XG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dCA9IGl0ZW1zW2NvdW50XS50bXBDb250ZXh0XG5cdFx0XHQvLyBcdFx0dG1wQ2FudmFzID0gaXRlbXNbY291bnRdLnRtcENhbnZhc1xuXG5cdFx0XHQvLyBcdFx0Ly8gYmxvY2sgZGl2c1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS5sZWZ0ID0gcm93W2pdWzBdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS50b3AgPSByb3dbal1bMV0gKyAncHgnXG5cblx0XHRcdC8vIFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuc2F2ZSgpXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIGltYWdlQmxvY2tTaXplWzBdKmosIGltYWdlQmxvY2tTaXplWzFdKmksIGltYWdlQmxvY2tTaXplWzBdLCBpbWFnZUJsb2NrU2l6ZVsxXSwgMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LnJlc3RvcmUoKVxuXHRcdFx0Ly8gXHRcdGN0eC5kcmF3SW1hZ2UodG1wQ2FudmFzLCAwLCAwKVxuXG5cdFx0XHQvLyBcdFx0Y291bnQrK1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHRsb2FkOiAodXJsLCBjYik9PiB7XG5cdFx0XHRvbkltZ0xvYWRlZENhbGxiYWNrID0gY2Jcblx0XHRcdGltZyh1cmwsIG9uSW1nUmVhZHkpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRlbCA9IG51bGxcblx0XHRcdGltYWdlID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhLCBtb3VzZSwgb25Nb3VzZUV2ZW50c0hhbmRsZXIpPT4ge1xuXG5cdHZhciBhbmltUGFyYW1zID0gKHBhcmVudCwgZWwsIGRpcik9PiB7XG5cdFx0Ly8gc3RhdGVcblx0XHQvLyBvdmVyLCBvdXRcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3RhdGU6ICdvdXQnLFxuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHRlbDogZWwsXG5cdFx0XHRkaXI6IGRpcixcblx0XHRcdHRpbWU6IDAsXG5cdFx0XHRwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0ZnBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdHNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHRmc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdGlzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0dmVsb2NpdHk6IHt4OiAwLCB5OiAwfSxcblx0XHRcdHZlbG9jaXR5U2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdHJvdGF0aW9uOiAwLFxuXHRcdFx0Y29uZmlnOiB7XG5cdFx0XHRcdGxlbmd0aDogMCxcblx0XHRcdFx0c3ByaW5nOiAwLjQsXG5cdFx0XHRcdGZyaWN0aW9uOiAwLjdcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYWluLWJ0bnMtd3JhcHBlcicsIGNvbnRhaW5lcilcblx0dmFyIHNob3BCdG4gPSBkb20uc2VsZWN0KCcjc2hvcC1idG4nLCBlbClcblx0dmFyIGZ1bkJ0biA9IGRvbS5zZWxlY3QoJyNmdW4tZmFjdC1idG4nLCBlbClcblx0dmFyIHNob3BTaXplLCBmdW5TaXplO1xuXHR2YXIgbG9hZENvdW50ZXIgPSAwXG5cdHZhciBidXR0b25TaXplID0gWzAsIDBdXG5cdHZhciBzcHJpbmdUbyA9IFV0aWxzLlNwcmluZ1RvXG5cdHZhciB0cmFuc2xhdGUgPSBVdGlscy5UcmFuc2xhdGVcblx0dmFyIHNob3BBbmltLCBmdW5BbmltLCBjdXJyZW50QW5pbTtcblx0dmFyIGJ1dHRvbnMgPSB7XG5cdFx0J3Nob3AtYnRuJzoge1xuXHRcdFx0YW5pbTogdW5kZWZpbmVkXG5cdFx0fSxcblx0XHQnZnVuLWZhY3QtYnRuJzoge1xuXHRcdFx0YW5pbTogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cblx0dmFyIHNob3BJbWcgPSBpbWcoJ2ltYWdlL3Nob3AucG5nJywgKCk9PiB7XG5cdFx0c2hvcEFuaW0gPSBhbmltUGFyYW1zKHNob3BCdG4sIHNob3BJbWcsIDEpXG5cdFx0YnV0dG9uc1snc2hvcC1idG4nXS5hbmltID0gc2hvcEFuaW1cblx0XHRzaG9wU2l6ZSA9IFtzaG9wSW1nLndpZHRoLCBzaG9wSW1nLmhlaWdodF1cblx0XHRkb20udHJlZS5hZGQoc2hvcEJ0biwgc2hvcEltZylcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXHR2YXIgZnVuSW1nID0gaW1nKCdpbWFnZS9mdW4tZmFjdHMucG5nJywgKCk9PiB7XG5cdFx0ZnVuQW5pbSA9IGFuaW1QYXJhbXMoZnVuQnRuLCBmdW5JbWcsIC0xKVxuXHRcdGJ1dHRvbnNbJ2Z1bi1mYWN0LWJ0biddLmFuaW0gPSBmdW5BbmltXG5cdFx0ZnVuU2l6ZSA9IFtmdW5JbWcud2lkdGgsIGZ1bkltZy5oZWlnaHRdXG5cdFx0ZG9tLnRyZWUuYWRkKGZ1bkJ0biwgZnVuSW1nKVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXG5cdHZhciB1cGRhdGVBbmltID0gKGFuaW0pPT4ge1xuXHRcdGFuaW0udGltZSArPSAwLjFcblx0XHRhbmltLmZwb3NpdGlvbi54ID0gYW5pbS5pcG9zaXRpb24ueFxuXHRcdGFuaW0uZnBvc2l0aW9uLnkgPSBhbmltLmlwb3NpdGlvbi55XG5cdFx0YW5pbS5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogNiAqIGFuaW0uZGlyXG5cdFx0YW5pbS5mcG9zaXRpb24ueSArPSAobW91c2UublkgLSAwLjUpICogMTIgKiBhbmltLmRpclxuXG5cdFx0c3ByaW5nVG8oYW5pbSwgYW5pbS5mcG9zaXRpb24sIDEpXG5cdFx0YW5pbS5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbS5jb25maWcubGVuZ3RoKSAqIDAuMDVcblx0XHRcblx0XHR0cmFuc2xhdGUoYW5pbS5lbCwgYW5pbS5wb3NpdGlvbi54ICsgYW5pbS52ZWxvY2l0eS54LCBhbmltLnBvc2l0aW9uLnkgKyBhbmltLnZlbG9jaXR5LnksIDEpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFcgPSB3aW5kb3dXID4+IDFcblx0XHRcdHZhciBzY2FsZSA9IDAuOFxuXHRcdFx0XG5cdFx0XHRidXR0b25TaXplWzBdID0gbWlkVyAqIDAuNlxuXHRcdFx0YnV0dG9uU2l6ZVsxXSA9IHdpbmRvd0ggKiAwLjhcblxuXHRcdFx0aWYoc2hvcFNpemUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHNob3BCdG4uc3R5bGUud2lkdGggPSBidXR0b25TaXplWzBdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmhlaWdodCA9IGJ1dHRvblNpemVbMV0gKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUubGVmdCA9IChtaWRXID4+IDEpIC0gKGJ1dHRvblNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSArICdweCdcblx0XHRcdFx0XG5cdFx0XHRcdHNob3BJbWcuc3R5bGUud2lkdGggPSBzaG9wU2l6ZVswXSpzY2FsZSArICdweCdcblx0XHRcdFx0c2hvcEltZy5zdHlsZS5oZWlnaHQgPSBzaG9wU2l6ZVsxXSpzY2FsZSArICdweCdcblx0XHRcdFx0c2hvcEltZy5zdHlsZS5sZWZ0ID0gKGJ1dHRvblNpemVbMF0gPj4gMSkgLSAoc2hvcFNpemVbMF0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNob3BJbWcuc3R5bGUudG9wID0gKGJ1dHRvblNpemVbMV0gPj4gMSkgLSAoc2hvcFNpemVbMV0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHR9XG5cdFx0XHRpZihmdW5TaXplICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUud2lkdGggPSBidXR0b25TaXplWzBdICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUuaGVpZ2h0ID0gYnV0dG9uU2l6ZVsxXSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLmxlZnQgPSBtaWRXICsgKG1pZFcgPj4gMSkgLSAoYnV0dG9uU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGJ1dHRvblNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdFx0ZnVuSW1nLnN0eWxlLndpZHRoID0gZnVuU2l6ZVswXSpzY2FsZSArICdweCdcblx0XHRcdFx0ZnVuSW1nLnN0eWxlLmhlaWdodCA9IGZ1blNpemVbMV0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdGZ1bkltZy5zdHlsZS5sZWZ0ID0gKGJ1dHRvblNpemVbMF0gPj4gMSkgLSAoZnVuU2l6ZVswXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdFx0ZnVuSW1nLnN0eWxlLnRvcCA9IChidXR0b25TaXplWzFdID4+IDEpIC0gKGZ1blNpemVbMV0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvdmVyOiAoaWQpPT4ge1xuXHRcdFx0Y3VycmVudEFuaW0gPSBidXR0b25zW2lkXS5hbmltXG5cdFx0fSxcblx0XHRvdXQ6IChpZCk9PiB7XG5cdFx0XHRjdXJyZW50QW5pbSA9IGJ1dHRvbnNbaWRdLmFuaW1cblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZihzaG9wQW5pbSA9PSB1bmRlZmluZWQpIHJldHVybiBcblx0XHRcdHVwZGF0ZUFuaW0oc2hvcEFuaW0pXG5cdFx0XHR1cGRhdGVBbmltKGZ1bkFuaW0pXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ01hcF9oYnMnXG5cbmV4cG9ydCBkZWZhdWx0IChwYXJlbnQsIHR5cGUpID0+IHtcblxuXHR2YXIgb25Eb3RDbGljayA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLnRhcmdldC5pZFxuXHRcdHZhciBwYXJlbnRJZCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQtaWQnKVxuXHRcdFJvdXRlci5zZXRIYXNoKHBhcmVudElkICsgJy8nICsgaWQpXG5cdH1cblxuXHQvLyByZW5kZXIgbWFwXG5cdHZhciBtYXBXcmFwcGVyID0gZG9tLnNlbGVjdCgnLm1hcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHR2YXIgdCA9IHRlbXBsYXRlKClcblx0ZWwuaW5uZXJIVE1MID0gdFxuXHRkb20udHJlZS5hZGQobWFwV3JhcHBlciwgZWwpXG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgZGlyLCBzdGVwRWw7XG5cdHZhciBzZWxlY3RlZERvdHMgPSBbXTtcblx0dmFyIGN1cnJlbnRQYXRocywgZmlsbExpbmUsIGRhc2hlZExpbmUsIHN0ZXBUb3RhbExlbiA9IDA7XG5cdHZhciBwcmV2aW91c0hpZ2hsaWdodEluZGV4ID0gdW5kZWZpbmVkO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcubWFwLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciB0aXRsZXNXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnRpdGxlcy13cmFwcGVyJywgZWwpXG5cdHZhciBtYXBkb3RzID0gZG9tLnNlbGVjdC5hbGwoJyNtYXAtZG90cyAuZG90LXBhdGgnLCBlbClcblx0dmFyIGZvb3RzdGVwcyA9IGRvbS5zZWxlY3QuYWxsKCcjZm9vdHN0ZXBzIGcnLCBlbClcblxuXHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdGRvbS5ldmVudC5vbihkb3QsICdjbGljaycsIG9uRG90Q2xpY2spXG5cdFx0fTtcblx0fVxuXG5cdHZhciB0aXRsZXMgPSB7XG5cdFx0J2RlaWEnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmRlaWEnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2VzLXRyZW5jJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5lcy10cmVuYycsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fSxcblx0XHQnYXJlbGx1Zic6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuYXJlbGx1ZicsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdGl0bGVQb3NYKHBhcmVudFcsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50VyAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVykgKiB2YWxcblx0fVxuXHRmdW5jdGlvbiB0aXRsZVBvc1kocGFyZW50SCwgdmFsKSB7XG5cdFx0cmV0dXJuIChwYXJlbnRIIC8gQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKSAqIHZhbFxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIG1hcFcgPSA2OTMsIG1hcEggPSA2NDVcblx0XHRcdHZhciBtYXBTaXplID0gW11cblx0XHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXKjAuNDcsIHdpbmRvd0gqMC40NywgbWFwVywgbWFwSClcblx0XHRcdG1hcFNpemVbMF0gPSBtYXBXICogcmVzaXplVmFycy5zY2FsZVxuXHRcdFx0bWFwU2l6ZVsxXSA9IG1hcEggKiByZXNpemVWYXJzLnNjYWxlXG5cblx0XHRcdGVsLnN0eWxlLndpZHRoID0gbWFwU2l6ZVswXSArICdweCdcblx0XHRcdGVsLnN0eWxlLmhlaWdodCA9IG1hcFNpemVbMV0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1cgPj4gMSkgLSAobWFwU2l6ZVswXSA+PiAxKSAtIDQwICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAobWFwU2l6ZVsxXSA+PiAxKSArICdweCdcblxuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCA3NDApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydkZWlhJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDI1MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCAxMjgwKSArICdweCdcblx0XHRcdHRpdGxlc1snZXMtdHJlbmMnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgNjkwKSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgMzYwKSArICdweCdcblx0XHRcdHRpdGxlc1snYXJlbGx1ZiddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCA0MDApICsgJ3B4J1xuXHRcdH0sXG5cdFx0aGlnaGxpZ2h0RG90czogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0c2VsZWN0ZWREb3RzID0gW11cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBkb3QuaWRcblx0XHRcdFx0dmFyIHBhcmVudElkID0gZG90LmdldEF0dHJpYnV0ZSgnZGF0YS1wYXJlbnQtaWQnKVxuXHRcdFx0XHRpZihpZCA9PSBvbGRIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBvbGRIYXNoLnBhcmVudCkgc2VsZWN0ZWREb3RzLnB1c2goZG90KVxuXHRcdFx0XHRpZihpZCA9PSBuZXdIYXNoLnRhcmdldCAmJiBwYXJlbnRJZCA9PSBuZXdIYXNoLnBhcmVudCkgIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGRvdCwgJ2FuaW1hdGUnKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGhpZ2hsaWdodDogKG9sZEhhc2gsIG5ld0hhc2gpPT4ge1xuXHRcdFx0dmFyIG9sZElkID0gb2xkSGFzaC50YXJnZXRcblx0XHRcdHZhciBuZXdJZCA9IG5ld0hhc2gudGFyZ2V0XG5cdFx0XHR2YXIgY3VycmVudCA9IG9sZElkICsgJy0nICsgbmV3SWRcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9vdHN0ZXBzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBzdGVwID0gZm9vdHN0ZXBzW2ldXG5cdFx0XHRcdHZhciBpZCA9IHN0ZXAuaWRcblx0XHRcdFx0aWYoaWQuaW5kZXhPZihvbGRJZCkgPiAtMSAmJiBpZC5pbmRleE9mKG5ld0lkKSA+IC0xKSB7XG5cdFx0XHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGxhc3Qgb25lXG5cdFx0XHRcdFx0aWYoaSA9PSBwcmV2aW91c0hpZ2hsaWdodEluZGV4KSBzdGVwRWwgPSBmb290c3RlcHNbZm9vdHN0ZXBzLmxlbmd0aC0xXVxuXHRcdFx0XHRcdGVsc2Ugc3RlcEVsID0gc3RlcFxuXG5cdFx0XHRcdFx0ZGlyID0gaWQuaW5kZXhPZihjdXJyZW50KSA+IC0xID8gQXBwQ29uc3RhbnRzLkZPUldBUkQgOiBBcHBDb25zdGFudHMuQkFDS1dBUkRcblx0XHRcdFx0XHRwcmV2aW91c0hpZ2hsaWdodEluZGV4ID0gaVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRzY29wZS5oaWdobGlnaHREb3RzKG9sZEhhc2gsIG5ld0hhc2gpXG5cblx0XHRcdGN1cnJlbnRQYXRocyA9IGRvbS5zZWxlY3QuYWxsKCdwYXRoJywgc3RlcEVsKVxuXHRcdFx0ZGFzaGVkTGluZSA9IGN1cnJlbnRQYXRoc1swXVxuXG5cdFx0XHQvLyBjaG9vc2UgcGF0aCBkZXBlbmRzIG9mIGZvb3RzdGVwIGRpcmVjdGlvblxuXHRcdFx0aWYoZGlyID09IEFwcENvbnN0YW50cy5GT1JXQVJEKSB7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzFdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1syXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGZpbGxMaW5lID0gY3VycmVudFBhdGhzWzJdXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0fVxuXG5cdFx0XHRzdGVwRWwuc3R5bGUub3BhY2l0eSA9IDFcblxuXHRcdFx0Ly8gZmluZCB0b3RhbCBsZW5ndGggb2Ygc2hhcGVcblx0XHRcdHN0ZXBUb3RhbExlbiA9IGZpbGxMaW5lLmdldFRvdGFsTGVuZ3RoKClcblx0XHRcdGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaG9mZnNldCddID0gMFxuXHRcdFx0ZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNoYXJyYXknXSA9IHN0ZXBUb3RhbExlblxuXHRcdFx0XG5cdFx0XHQvLyBzdGFydCBhbmltYXRpb24gb2YgZGFzaGVkIGxpbmVcblx0XHRcdGRvbS5jbGFzc2VzLmFkZChkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHRcdC8vIHN0YXJ0IGFuaW1hdGlvblxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cblx0XHR9LFxuXHRcdHJlc2V0SGlnaGxpZ2h0OiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0c3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1sxXS5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGZpbGxMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkYXNoZWRMaW5lLCAnYW5pbWF0ZScpXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWREb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIGRvdCA9IHNlbGVjdGVkRG90c1tpXVxuXHRcdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShkb3QsICdhbmltYXRlJylcblx0XHRcdFx0fTtcblx0XHRcdH0sIDApXG5cdFx0fSxcblx0XHR1cGRhdGVQcm9ncmVzczogKHByb2dyZXNzKT0+IHtcblx0XHRcdGlmKGZpbGxMaW5lID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0XHR2YXIgZGFzaE9mZnNldCA9IChwcm9ncmVzcyAvIDEpICogc3RlcFRvdGFsTGVuXG5cdFx0XHRmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IGRhc2hPZmZzZXRcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWFwZG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRcdFx0ZG90LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25Eb3RDbGljaylcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHRpdGxlcyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lciwgdmlkZW9VcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHNwbGl0dGVyID0gdmlkZW9Vcmwuc3BsaXQoJy8nKVxuXHR2YXIgbmFtZSA9IHNwbGl0dGVyW3NwbGl0dGVyLmxlbmd0aC0xXS5zcGxpdCgnLicpWzBdXG5cdHZhciBpbWdJZCA9ICdob21lLXZpZGVvLXNob3RzLycgKyBuYW1lXG5cdHZhciBtQ2FudmFzID0gbWluaVZpZGVvKHtcblx0XHRsb29wOiB0cnVlLFxuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHR2YXIgc2l6ZSwgcG9zaXRpb24sIHJlc2l6ZVZhcnM7XG5cdHZhciBpbWc7XG5cblx0dmFyIG9uTW91c2VFbnRlciA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZihtQ2FudmFzLmlzTG9hZGVkKSB7XG5cdFx0XHRtQ2FudmFzLnBsYXkoMClcblx0XHR9ZWxzZXtcblx0XHRcdG1DYW52YXMubG9hZCh2aWRlb1VybCwgKCk9PiB7XG5cdFx0XHRcdG1DYW52YXMucGxheSgpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHZhciBvbk1vdXNlTGVhdmUgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0bUNhbnZhcy5wYXVzZSgpXG5cdH1cblxuXHR2YXIgb25DbGljayA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0fVxuXG5cdHZhciBpbml0ID0gKCk9PiB7XG5cdFx0dmFyIGltZ1VybCA9IEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTChpbWdJZCkgXG5cdFx0aW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcblx0XHRpbWcuc3JjID0gaW1nVXJsXG5cdFx0ZG9tLnRyZWUuYWRkKGNvbnRhaW5lciwgaW1nKVxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIG1DYW52YXMuZWwpXG5cblx0XHRkb20uZXZlbnQub24oY29udGFpbmVyLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRkb20uZXZlbnQub24oY29udGFpbmVyLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRkb20uZXZlbnQub24oY29udGFpbmVyLCAnY2xpY2snLCBvbkNsaWNrKVxuXG5cdFx0c2NvcGUuaXNSZWFkeSA9IHRydWVcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGlzUmVhZHk6IGZhbHNlLFxuXHRcdGluaXQ6IGluaXQsXG5cdFx0cmVzaXplOiAocywgcCwgcnYpPT4ge1xuXG5cdFx0XHRzaXplID0gcyA9PSB1bmRlZmluZWQgPyBzaXplIDogc1xuXHRcdFx0cG9zaXRpb24gPSBwID09IHVuZGVmaW5lZCA/IHBvc2l0aW9uIDogcFxuXHRcdFx0cmVzaXplVmFycyA9IHJ2ID09IHVuZGVmaW5lZCA/IHJlc2l6ZVZhcnMgOiBydlxuXG5cdFx0XHRpZighc2NvcGUuaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdGNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHNpemVbMF0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gc2l6ZVsxXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gcG9zaXRpb25bMF0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUudG9wID0gcG9zaXRpb25bMV0gKyAncHgnXG5cblx0XHRcdGltZy5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnMubGVmdCArICdweCdcblx0XHRcdGltZy5zdHlsZS50b3AgPSByZXNpemVWYXJzLnRvcCArICdweCdcblxuXHRcdFx0Ly8gaW1nLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdC8vIGltZy5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdC8vIGltZy5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Ly8gaW1nLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0XHRtQ2FudmFzLmVsLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdG1DYW52YXMuZWwuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRtQ2FudmFzLmVsLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cdFx0XHRtQ2FudmFzLmVsLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRkb20uZXZlbnQub2ZmKGNvbnRhaW5lciwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGNvbnRhaW5lciwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGNvbnRhaW5lciwgJ2NsaWNrJywgb25DbGljaylcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IChwcm9wcyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuXHR2YXIgb25SZWFkeUNhbGxiYWNrO1xuXHR2YXIgc2l6ZSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9XG5cdHZhciBlTGlzdGVuZXJzID0gW11cblxuXHR2YXIgb25DYW5QbGF5ID0gKCk9Pntcblx0XHRzY29wZS5pc0xvYWRlZCA9IHRydWVcblx0XHRpZihwcm9wcy5hdXRvcGxheSkgdmlkZW8ucGxheSgpXG5cdFx0aWYocHJvcHMudm9sdW1lICE9IHVuZGVmaW5lZCkgdmlkZW8udm9sdW1lID0gcHJvcHMudm9sdW1lXG5cdFx0c2l6ZS53aWR0aCA9IHZpZGVvLnZpZGVvV2lkdGhcblx0XHRzaXplLmhlaWdodCA9IHZpZGVvLnZpZGVvSGVpZ2h0XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICAgICAgb25SZWFkeUNhbGxiYWNrKHNjb3BlKVxuXHR9XG5cblx0dmFyIHBsYXkgPSAodGltZSk9Pntcblx0XHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IHRydWVcbiAgICBcdHZpZGVvLnBsYXkoKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKHRpbWUpPT57XG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHZvbHVtZSA9ICh2YWwpPT4ge1xuICAgIFx0aWYodmFsKSB7XG4gICAgXHRcdHNjb3BlLmVsLnZvbHVtZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC52b2x1bWVcbiAgICBcdH1cbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFRpbWUgPSAodmFsKT0+IHtcbiAgICBcdGlmKHZhbCkge1xuICAgIFx0XHRzY29wZS5lbC5jdXJyZW50VGltZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC5jdXJyZW50VGltZVxuICAgIFx0fVxuICAgIH1cblxuICAgIHZhciB3aWR0aCA9ICgpPT4ge1xuICAgIFx0cmV0dXJuIHNjb3BlLmVsLnZpZGVvV2lkdGhcbiAgICB9XG5cbiAgICB2YXIgaGVpZ2h0ID0gKCk9PiB7XG4gICAgXHRyZXR1cm4gc2NvcGUuZWwudmlkZW9IZWlnaHRcdFxuICAgIH1cblxuICAgIHZhciBlbmRlZCA9ICgpPT57XG4gICAgXHRpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICB9XG5cblx0dmFyIGFkZFRvID0gKHApPT4ge1xuXHRcdHNjb3BlLnBhcmVudCA9IHBcblx0XHRkb20udHJlZS5hZGQoc2NvcGUucGFyZW50LCB2aWRlbylcblx0fVxuXG5cdHZhciBvbiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGVMaXN0ZW5lcnMucHVzaCh7ZXZlbnQ6ZXZlbnQsIGNiOmNifSlcblx0XHR2aWRlby5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdHZhciBvZmYgPSAoZXZlbnQsIGNiKT0+IHtcblx0XHRmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0XHRcdHZhciBlID0gZUxpc3RlbmVyc1tpXVxuXHRcdFx0aWYoZS5ldmVudCA9PSBldmVudCAmJiBlLmNiID09IGNiKSB7XG5cdFx0XHRcdGVMaXN0ZW5lcnMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIGNsZWFyQWxsRXZlbnRzID0gKCk9PiB7XG5cdCAgICBmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0ICAgIFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdCAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZS5ldmVudCwgZS5jYik7XG5cdCAgICB9XG5cdCAgICBlTGlzdGVuZXJzLmxlbmd0aCA9IDBcblx0ICAgIGVMaXN0ZW5lcnMgPSBudWxsXG5cdH1cblxuXHR2YXIgY2xlYXIgPSAoKT0+IHtcbiAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cdCAgICBzY29wZS5jbGVhckFsbEV2ZW50cygpXG5cdCAgICBzaXplID0gbnVsbFxuXHQgICAgdmlkZW8gPSBudWxsXG4gICAgfVxuXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblxuXHRzY29wZSA9IHtcblx0XHRwYXJlbnQ6IHVuZGVmaW5lZCxcblx0XHRlbDogdmlkZW8sXG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHNlZWs6IHNlZWssXG5cdFx0cGF1c2U6IHBhdXNlLFxuXHRcdHZvbHVtZTogdm9sdW1lLFxuXHRcdGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZSxcblx0XHR3aWR0aDogd2lkdGgsXG5cdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0YWRkVG86IGFkZFRvLFxuXHRcdG9uOiBvbixcblx0XHRvZmY6IG9mZixcblx0XHRjbGVhcjogY2xlYXIsXG5cdFx0Y2xlYXJBbGxFdmVudHM6IGNsZWFyQWxsRXZlbnRzLFxuXHRcdGlzUGxheWluZzogcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2UsXG5cdFx0aXNMb2FkZWQ6IGZhbHNlLFxuXHRcdGxvYWQ6IChzcmMsIGNhbGxiYWNrKT0+IHtcblx0XHRcdG9uUmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrXG5cdFx0XHR2aWRlby5zcmMgPSBzcmNcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGlwdHlxdWVQYXJ0IGZyb20gJ2RpcHR5cXVlLXBhcnQnXG5pbXBvcnQgY2hhcmFjdGVyIGZyb20gJ2NoYXJhY3RlcidcbmltcG9ydCBmdW5GYWN0IGZyb20gJ2Z1bi1mYWN0LWhvbGRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgYXJyb3dzV3JhcHBlciBmcm9tICdhcnJvd3Mtd3JhcHBlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHNlbGZpZVN0aWNrIGZyb20gJ3NlbGZpZS1zdGljaydcbmltcG9ydCBtYWluQnRucyBmcm9tICdtYWluLWRpcHR5cXVlLWJ0bnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcHR5cXVlIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cblx0XHR2YXIgbmV4dERpcHR5cXVlID0gQXBwU3RvcmUuZ2V0TmV4dERpcHR5cXVlKClcblx0XHR2YXIgcHJldmlvdXNEaXB0eXF1ZSA9IEFwcFN0b3JlLmdldFByZXZpb3VzRGlwdHlxdWUoKVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcGFnZSddID0gbmV4dERpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcGFnZSddID0gcHJldmlvdXNEaXB0eXF1ZVxuXHRcdHByb3BzLmRhdGFbJ25leHQtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gobmV4dERpcHR5cXVlKVxuXHRcdHByb3BzLmRhdGFbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gPSBBcHBTdG9yZS5nZXRQcmV2aWV3VXJsQnlIYXNoKHByZXZpb3VzRGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsnZmFjdC10eHQnXSA9IHByb3BzLmRhdGEuZmFjdFtBcHBTdG9yZS5sYW5nKCldXG5cblx0XHRzdXBlcihwcm9wcylcblxuXHRcdHRoaXMub25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQXJyb3dNb3VzZUVudGVyID0gdGhpcy5vbkFycm93TW91c2VFbnRlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkFycm93TW91c2VMZWF2ZSA9IHRoaXMub25BcnJvd01vdXNlTGVhdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQgPSB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIgPSB0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0dGhpcy5tb3VzZSA9IG5ldyBQSVhJLlBvaW50KClcblx0XHR0aGlzLm1vdXNlLm5YID0gdGhpcy5tb3VzZS5uWSA9IDBcblxuXHRcdHRoaXMubGVmdFBhcnQgPSBkaXB0eXF1ZVBhcnQoXG5cdFx0XHR0aGlzLnB4Q29udGFpbmVyLFxuXHRcdFx0dGhpcy5nZXRJbWFnZVVybEJ5SWQoJ3Nob2UtYmcnKSxcblx0XHRcdFxuXHRcdClcblx0XHR0aGlzLnJpZ2h0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnY2hhcmFjdGVyLWJnJylcblx0XHQpXG5cblx0XHR0aGlzLmNoYXJhY3RlciA9IGNoYXJhY3Rlcih0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXInKSwgdGhpcy5nZXRJbWFnZVNpemVCeUlkKCdjaGFyYWN0ZXInKSlcblx0XHR0aGlzLmZ1bkZhY3QgPSBmdW5GYWN0KHRoaXMucHhDb250YWluZXIsIHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlciA9IGFycm93c1dyYXBwZXIodGhpcy5lbGVtZW50LCB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLCB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sgPSBzZWxmaWVTdGljayh0aGlzLmVsZW1lbnQsIHRoaXMubW91c2UsIHRoaXMucHJvcHMuZGF0YSlcblx0XHR0aGlzLm1haW5CdG5zID0gbWFpbkJ0bnModGhpcy5lbGVtZW50LCB0aGlzLnByb3BzLmRhdGEsIHRoaXMubW91c2UsIHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlcilcblxuXHRcdGRvbS5ldmVudC5vbih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdsZWZ0JyksIHsgeDotQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXHRcdFR3ZWVuTWF4LnNldCh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZCgncmlnaHQnKSwgeyB4OkFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkcgfSlcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmhvbGRlciwgMSwgeyB4OiAtd2luZG93VyA+PiAxLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZSwgMSwgeyB4OiB0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnggLSAyMDAsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuNClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLnggKyAyMDAsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCB9LCAwLjQpXG5cblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdG9uTW91c2VNb3ZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMubW91c2UueCA9IGUuY2xpZW50WFxuXHRcdHRoaXMubW91c2UueSA9IGUuY2xpZW50WVxuXHRcdHRoaXMubW91c2UublggPSAoZS5jbGllbnRYIC8gd2luZG93VykgKiAxXG5cdFx0dGhpcy5tb3VzZS5uWSA9IChlLmNsaWVudFkgLyB3aW5kb3dIKSAqIDFcblxuXHRcdC8vIGlmKHRoaXMubW91c2UublggPiAwLjUpIEFwcFN0b3JlLlBhcmVudC5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcidcblx0XHQvLyBlbHNlIEFwcFN0b3JlLlBhcmVudC5zdHlsZS5jdXJzb3IgPSAnYXV0bydcblxuXHR9XG5cdG9uU2VsZmllU3RpY2tDbGlja2VkKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZih0aGlzLnNlbGZpZVN0aWNrLmlzT3BlbmVkKSB7XG5cdFx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsb3NlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2sub3BlbigpXG5cdFx0fVxuXHR9XG5cdG9uQXJyb3dNb3VzZUVudGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblxuXHRcdHZhciBwb3NYO1xuXHRcdHZhciBvZmZzZXRYID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXHRcdGlmKGlkID09ICdsZWZ0JykgcG9zWCA9IG9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSAtb2Zmc2V0WFxuXG5cdFx0VHdlZW5NYXgudG8odGhpcy5weENvbnRhaW5lciwgMC40LCB7IHg6cG9zWCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC40LCB7IHg6MCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm92ZXIoaWQpXG5cdH1cblx0b25BcnJvd01vdXNlTGVhdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gLW9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSBvZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjYsIHsgeDowLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC42LCB7IHg6cG9zWCwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5vdXQoaWQpXG5cdH1cblx0b25NYWluQnRuc0V2ZW50SGFuZGxlcihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHR5cGUgPSBlLnR5cGVcblx0XHR2YXIgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0XG5cdFx0dmFyIGlkID0gdGFyZ2V0LmlkXG5cdFx0aWYodHlwZSA9PSAnY2xpY2snICYmIGlkID09ICdmdW4tZmFjdC1idG4nKSB7XG5cdFx0XHRpZih0aGlzLmZ1bkZhY3QuaXNPcGVuKSB7XG5cdFx0XHRcdHRoaXMuZnVuRmFjdC5jbG9zZSgpXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5mdW5GYWN0Lm9wZW4oKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ21vdXNlZW50ZXInKSB7XG5cdFx0XHR0aGlzLm1haW5CdG5zLm92ZXIoaWQpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnbW91c2VsZWF2ZScpIHtcblx0XHRcdHRoaXMubWFpbkJ0bnMub3V0KGlkKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLmNoYXJhY3Rlci51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLmxlZnRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sudXBkYXRlKClcblx0XHR0aGlzLmZ1bkZhY3QudXBkYXRlKClcblx0XHR0aGlzLm1haW5CdG5zLnVwZGF0ZSgpXG5cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5sZWZ0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5jaGFyYWN0ZXIucmVzaXplKClcblx0XHR0aGlzLmZ1bkZhY3QucmVzaXplKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIucmVzaXplKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYWluQnRucy5yZXNpemUoKVxuXG5cdFx0dGhpcy5yaWdodFBhcnQuaG9sZGVyLnggPSAod2luZG93VyA+PiAxKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cdFx0ZG9tLmV2ZW50Lm9mZih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdHRoaXMubGVmdFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LmNsZWFyKClcblx0XHR0aGlzLmNoYXJhY3Rlci5jbGVhcigpXG5cdFx0dGhpcy5mdW5GYWN0LmNsZWFyKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsZWFyKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIuY2xlYXIoKVxuXHRcdHRoaXMubWFpbkJ0bnMuY2xlYXIoKVxuXHRcdHRoaXMubW91c2UgPSBudWxsXG5cdFx0dGhpcy5sZWZ0UGFydCA9IG51bGxcblx0XHR0aGlzLnJpZ2h0UGFydCA9IG51bGxcblx0XHR0aGlzLmNoYXJhY3RlciA9IG51bGxcblx0XHR0aGlzLmFycm93c1dyYXBwZXIgPSBudWxsXG5cdFx0dGhpcy5tYWluQnRucyA9IG51bGxcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBib3R0b21UZXh0cyBmcm9tICdib3R0b20tdGV4dHMtaG9tZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGdyaWQgZnJvbSAnZ3JpZC1ob21lJ1xuaW1wb3J0IGltYWdlQ2FudmFzZXNHcmlkIGZyb20gJ2ltYWdlLXRvLWNhbnZhc2VzLWdyaWQnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHR2YXIgY29udGVudCA9IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHRwcm9wcy5kYXRhLmdyaWQgPSBbXVxuXHRcdHByb3BzLmRhdGEuZ3JpZC5sZW5ndGggPSAyOFxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXSA9IHsgaG9yaXpvbnRhbDogW10sIHZlcnRpY2FsOiBbXSB9XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLmhvcml6b250YWwubGVuZ3RoID0gM1xuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS52ZXJ0aWNhbC5sZW5ndGggPSA2XG5cdFx0cHJvcHMuZGF0YVsndGV4dF9hJ10gPSBjb250ZW50LnRleHRzWyd0eHRfYSddXG5cdFx0cHJvcHMuZGF0YVsnYV92aXNpb24nXSA9IGNvbnRlbnQudGV4dHNbJ2FfdmlzaW9uJ11cblx0XHRzdXBlcihwcm9wcylcblx0XHR2YXIgYmdVcmwgPSB0aGlzLmdldEltYWdlVXJsQnlJZCgnYmFja2dyb3VuZCcpXG5cdFx0dGhpcy5wcm9wcy5kYXRhLmJndXJsID0gYmdVcmxcblxuXHRcdHRoaXMudHJpZ2dlck5ld0l0ZW0gPSB0aGlzLnRyaWdnZXJOZXdJdGVtLmJpbmQodGhpcylcblx0XHR0aGlzLm9uSXRlbUVuZGVkID0gdGhpcy5vbkl0ZW1FbmRlZC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sYXN0R3JpZEl0ZW1JbmRleDtcblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAyMDBcblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cblx0XHR0aGlzLnNlYXRzID0gW1xuXHRcdFx0MSwgMywgNSxcblx0XHRcdDcsIDksIDExLFxuXHRcdFx0MTUsIDE3LFxuXHRcdFx0MjEsIDIzLCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdC8vIHRoaXMuYmcgPSBkb20uc2VsZWN0KCcuYmctd3JhcHBlcicsIHRoaXMuZWxlbWVudClcblxuXHRcdHRoaXMuaW1nQ0dyaWQgPSBpbWFnZUNhbnZhc2VzR3JpZCh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5pbWdDR3JpZC5sb2FkKHRoaXMucHJvcHMuZGF0YS5iZ3VybClcblx0XHR0aGlzLmdyaWQgPSBncmlkKHRoaXMucHJvcHMsIHRoaXMuZWxlbWVudCwgdGhpcy5vbkl0ZW1FbmRlZClcblx0XHR0aGlzLmdyaWQuaW5pdCgpXG5cdFx0Ly8gdGhpcy5ib3R0b21UZXh0cyA9IGJvdHRvbVRleHRzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IGFyb3VuZEJvcmRlcih0aGlzLmVsZW1lbnQpXG5cdFx0Ly8gdGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0dHJpZ2dlck5ld0l0ZW0odHlwZSkge1xuXHRcdHZhciBpbmRleCA9IHRoaXMuc2VhdHNbVXRpbHMuUmFuZCgwLCB0aGlzLnNlYXRzLmxlbmd0aCAtIDEsIDApXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHNlYXQgPT0gaW5kZXgpIHtcblx0XHRcdFx0aWYodGhpcy51c2VkU2VhdHMubGVuZ3RoIDwgdGhpcy5zZWF0cy5sZW5ndGggLSAyKSB0aGlzLnRyaWdnZXJOZXdJdGVtKHR5cGUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy51c2VkU2VhdHMucHVzaChpbmRleClcblx0XHR0aGlzLmdyaWQudHJhbnNpdGlvbkluSXRlbShpbmRleCwgdHlwZSlcblx0fVxuXHRvbkl0ZW1FbmRlZChpdGVtKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVzZWRTZWF0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHVzZWRTZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHVzZWRTZWF0ID09IGl0ZW0uc2VhdCkge1xuXHRcdFx0XHR0aGlzLnVzZWRTZWF0cy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQpIHJldHVyblxuXHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0aWYodGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID4gODAwKSB7XG5cdFx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX1ZJREVPKVxuXHRcdH1cblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdGlmKHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA+IDMwKSB7XG5cdFx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX0lNQUdFKVxuXHRcdH1cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFxuXHRcdHZhciBnR3JpZCA9IGdyaWRQb3NpdGlvbnMod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgJ2NvbHNfcm93cycpXG5cblx0XHR0aGlzLmdyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuaW1nQ0dyaWQucmVzaXplKGdHcmlkKVxuXHRcdC8vIHRoaXMuYm90dG9tVGV4dHMucmVzaXplKClcblx0XHR0aGlzLmFyb3VuZEJvcmRlci5yZXNpemUoKVxuXHRcdC8vIHRoaXMubWFwLnJlc2l6ZSgpXG5cblx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5hcm91bmRCb3JkZXIuY2xlYXIoKVxuXHRcdHRoaXMuZ3JpZC5jbGVhcigpXG5cdFx0Ly8gdGhpcy5tYXAuY2xlYXIoKVxuXG5cdFx0dGhpcy5ncmlkID0gbnVsbFxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBudWxsXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBudWxsXG5cdFx0dGhpcy5tYXAgPSBudWxsXG5cblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgbW91c2UsIGRhdGEpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgc2NyZWVuSG9sZGVyU2l6ZSA9IFswLCAwXSwgdmlkZW9Ib2xkZXJTaXplID0gWzAsIDBdLCBjb2xvcmlmaWVyU2l6ZSA9IFswLCAwXSwgdG9wT2Zmc2V0ID0gMDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgaG9sZGVyKVxuXHR2YXIgYmFja2dyb3VuZCA9IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgZWwpXG5cdHZhciBzY3JlZW5XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi13cmFwcGVyJywgZWwpXG5cdHZhciBzY3JlZW5Ib2xkZXIgPSBkb20uc2VsZWN0KCcuc2NyZWVuLWhvbGRlcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciB2aWRlb0hvbGRlciA9IGRvbS5zZWxlY3QoJy52aWRlby1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgY29sb3JpZmllciA9IGRvbS5zZWxlY3QoJy5jb2xvcmlmaWVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXJTdmdQYXRoID0gZG9tLnNlbGVjdCgnc3ZnIHBhdGgnLCBjb2xvcmlmaWVyKVxuXHR2YXIgc2VsZmllU3RpY2tXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgZWwpXG5cdHZhciBzcHJpbmdUbyA9IFV0aWxzLlNwcmluZ1RvXG5cdHZhciB0cmFuc2xhdGUgPSBVdGlscy5UcmFuc2xhdGVcblx0dmFyIGFuaW1hdGlvbiA9IHtcblx0XHRwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdGZwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdGlwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdHZlbG9jaXR5OiB7eDogMCwgeTogMH0sXG5cdFx0cm90YXRpb246IDAsXG5cdFx0Y29uZmlnOiB7XG5cdFx0XHRsZW5ndGg6IDQwMCxcblx0XHRcdHNwcmluZzogMC40LFxuXHRcdFx0ZnJpY3Rpb246IDAuN1xuXHRcdH1cblx0fVxuXG5cdC8vIGNoZWNrIGlmIG1peC1ibGVuZC1tb2RlIGlzIGF2YWlsYWJsZVxuXHRpZiAoJ21peC1ibGVuZC1tb2RlJyBpbiBjb2xvcmlmaWVyLnN0eWxlKSB7XG5cdFx0Y29sb3JpZmllci5zdHlsZVsnbWl4LWJsZW5kLW1vZGUnXSA9ICdjb2xvcidcblx0fWVsc2V7XG5cdFx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ29wYWNpdHknXSA9IDAuOFxuXHR9XG5cdFxuXHR2YXIgYyA9IGRhdGFbJ2FtYmllbnQtY29sb3InXVsnc2VsZmllLXN0aWNrJ11cblx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ2ZpbGwnXSA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoYy5oLCBjLnMsIGMudilcblxuXHR2YXIgb25WaWRlb0VuZGVkID0gKCk9PiB7XG5cdFx0c2NvcGUuY2xvc2UoKVxuXHR9XG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHRtVmlkZW8uYWRkVG8odmlkZW9Ib2xkZXIpXG5cdG1WaWRlby5vbignZW5kZWQnLCBvblZpZGVvRW5kZWQpXG5cdHZhciB2aWRlb1NyYyA9IGRhdGFbJ3NlbGZpZS1zdGljay12aWRlby11cmwnXVxuXG5cdHZhciBzdGlja0ltZyA9IGltZyhBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2Uvc2VsZmllc3RpY2sucG5nJywgKCk9PiB7XG5cdFx0ZG9tLnRyZWUuYWRkKHNjcmVlbkhvbGRlciwgc3RpY2tJbWcpXG5cdFx0bVZpZGVvLmxvYWQodmlkZW9TcmMsICgpPT4ge1xuXHRcdFx0aXNSZWFkeSA9IHRydWVcblx0XHRcdHNjb3BlLnJlc2l6ZSgpXG5cdFx0fSlcblx0fSlcblxuXHRzY29wZSA9IHtcblx0XHRlbDogZWwsXG5cdFx0aXNPcGVuZWQ6IGZhbHNlLFxuXHRcdG9wZW46ICgpPT4ge1xuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggPSAxMDAsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLnNwcmluZyA9IDAuOSxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuZnJpY3Rpb24gPSAwLjVcblx0XHRcdG1WaWRlby5wbGF5KDApXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSdcblx0XHRcdHNjb3BlLmlzT3BlbmVkID0gdHJ1ZVxuXHRcdH0sXG5cdFx0Y2xvc2U6ICgpPT4ge1xuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggPSAwLFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5zcHJpbmcgPSAwLjYsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmZyaWN0aW9uID0gMC43XG5cdFx0XHRtVmlkZW8ucGF1c2UoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nXG5cdFx0XHRzY29wZS5pc09wZW5lZCA9IGZhbHNlXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXG5cdFx0XHRpZihzY29wZS5pc09wZW5lZCkge1xuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55IC0gKHNjcmVlbkhvbGRlclNpemVbMV0gKiAwLjgpXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogODBcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ICs9IChtb3VzZS5uWSAtIDAuNSkgKiAzMFxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiAyMFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgLT0gKG1vdXNlLm5ZIC0gMC41KSAqIDIwXG5cdFx0XHR9XG5cblx0XHRcdHNwcmluZ1RvKGFuaW1hdGlvbiwgYW5pbWF0aW9uLmZwb3NpdGlvbiwgMSlcblxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnggKz0gKGFuaW1hdGlvbi5mcG9zaXRpb24ueCAtIGFuaW1hdGlvbi5wb3NpdGlvbi54KSAqIDAuMVxuXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCArPSAoMC4wMSAtIGFuaW1hdGlvbi5jb25maWcubGVuZ3RoKSAqIDAuMDVcblxuXHRcdFx0dHJhbnNsYXRlKHNjcmVlbldyYXBwZXIsIGFuaW1hdGlvbi5wb3NpdGlvbi54LCBhbmltYXRpb24ucG9zaXRpb24ueSArIGFuaW1hdGlvbi52ZWxvY2l0eS55LCAxKVxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0Y29sb3JpZmllclNpemUgPSBkb20uc2l6ZShjb2xvcmlmaWVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtIChjb2xvcmlmaWVyU2l6ZVswXSAqIDAuNTIpICsgJ3B4J1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZS50b3AgPSAtMC41ICsgJ3B4J1xuXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnggPSAod2luZG93VyA+PiAxKSAtIChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnkgPSB3aW5kb3dIIC0gKHZpZGVvSG9sZGVyU2l6ZVsxXSAqIDAuMzUpXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0bVZpZGVvLmNsZWFyKClcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHRcdGFuaW1hdGlvbiA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRzY29wZS5jbG9zZSgpXG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBzb2NpYWxMaW5rcyA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHdyYXBwZXIgPSBkb20uc2VsZWN0KFwiI2Zvb3RlciAjc29jaWFsLXdyYXBwZXJcIiwgcGFyZW50KVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAqIDAuNFxuXG5cdFx0XHR2YXIgd3JhcHBlclNpemUgPSBkb20uc2l6ZSh3cmFwcGVyKVxuXG5cdFx0XHR2YXIgc29jaWFsQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiB3aW5kb3dXIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzBdLFxuXHRcdFx0XHR0b3A6IHdpbmRvd0ggLSBwYWRkaW5nIC0gd3JhcHBlclNpemVbMV0sXG5cdFx0XHR9XG5cblx0XHRcdHdyYXBwZXIuc3R5bGUubGVmdCA9IHNvY2lhbENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0d3JhcHBlci5zdHlsZS50b3AgPSBzb2NpYWxDc3MudG9wICsgJ3B4J1xuXHRcdH0sXG5cdFx0c2hvdzogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5yZW1vdmUod3JhcHBlciwgJ2hpZGUnKSwgMTAwMClcblx0XHR9LFxuXHRcdGhpZGU6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMuYWRkKHdyYXBwZXIsICdoaWRlJyksIDUwMClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgc29jaWFsTGlua3MiLCJpbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5cbnZhciB2aWRlb0NhbnZhcyA9ICggcHJvcHMgKT0+IHtcblxuICAgIHZhciBzY29wZTtcbiAgICB2YXIgaW50ZXJ2YWxJZDtcbiAgICB2YXIgZHggPSAwLCBkeSA9IDAsIGRXaWR0aCA9IDAsIGRIZWlnaHQgPSAwO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG4gICAgICAgIGF1dG9wbGF5OiBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZSxcbiAgICAgICAgdm9sdW1lOiBwcm9wcy52b2x1bWUsXG4gICAgICAgIGxvb3A6IHByb3BzLmxvb3BcbiAgICB9KVxuXG4gICAgdmFyIG9uQ2FuUGxheSA9ICgpPT57XG4gICAgICAgIHNjb3BlLmlzTG9hZGVkID0gdHJ1ZVxuICAgICAgICBpZihwcm9wcy5hdXRvcGxheSkgbVZpZGVvLnBsYXkoKVxuICAgICAgICBpZihkV2lkdGggPT0gMCkgZFdpZHRoID0gbVZpZGVvLndpZHRoKClcbiAgICAgICAgaWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gbVZpZGVvLmhlaWdodCgpXG4gICAgICAgIGlmKG1WaWRlby5pc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciBkcmF3T25jZSA9ICgpPT4ge1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgICAgICBjdHguZHJhd0ltYWdlKG1WaWRlby5lbCwgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGxheSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGRyYXcsIDEwMDAgLyAzMClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICAgICAgbVZpZGVvLmN1cnJlbnRUaW1lKHRpbWUpXG4gICAgICAgIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgdGltZW91dCA9IChjYiwgbXMpPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xuICAgICAgICAgICAgY2Ioc2NvcGUpXG4gICAgICAgIH0sIG1zKVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICgpPT57XG4gICAgICAgIG1WaWRlby5wYXVzZSgpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgICAgICBpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICAgICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICB9XG5cbiAgICB2YXIgcmVzaXplID0gKHgsIHksIHcsIGgpPT57XG4gICAgICAgIGR4ID0geFxuICAgICAgICBkeSA9IHlcbiAgICAgICAgZFdpZHRoID0gd1xuICAgICAgICBkSGVpZ2h0ID0gaFxuICAgIH1cblxuICAgIHZhciBjbGVhciA9ICgpPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIG1WaWRlby5jbGVhckFsbEV2ZW50cygpXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwwLDAsMClcbiAgICB9XG5cbiAgICBpZihwcm9wcy5vbkVuZGVkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICBtVmlkZW8ub24oJ2VuZGVkJywgZW5kZWQpXG4gICAgfVxuXG4gICAgc2NvcGUgPSB7XG4gICAgICAgIGlzTG9hZGVkOiBmYWxzZSxcbiAgICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICAgIHZpZGVvOiBtVmlkZW8sXG4gICAgICAgIGN0eDogY3R4LFxuICAgICAgICBkcmF3T25jZTogZHJhd09uY2UsXG4gICAgICAgIHBsYXk6IHBsYXksXG4gICAgICAgIHBhdXNlOiBwYXVzZSxcbiAgICAgICAgc2Vlazogc2VlayxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgcmVzaXplOiByZXNpemUsXG4gICAgICAgIGNsZWFyOiBjbGVhcixcbiAgICAgICAgbG9hZDogKHNyYywgY2IpPT4ge1xuICAgICAgICAgICAgbVZpZGVvLmxvYWQoc3JjLCAoKT0+e1xuICAgICAgICAgICAgICAgIG9uQ2FuUGxheSgpXG4gICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzY29wZVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHZpZGVvQ2FudmFzIiwiZXhwb3J0IGRlZmF1bHQge1xuXHRXSU5ET1dfUkVTSVpFOiAnV0lORE9XX1JFU0laRScsXG5cdFBBR0VfSEFTSEVSX0NIQU5HRUQ6ICdQQUdFX0hBU0hFUl9DSEFOR0VEJyxcblx0UEFHRV9BU1NFVFNfTE9BREVEOiAnUEFHRV9BU1NFVFNfTE9BREVEJyxcblxuXHRMQU5EU0NBUEU6ICdMQU5EU0NBUEUnLFxuXHRQT1JUUkFJVDogJ1BPUlRSQUlUJyxcblxuXHRGT1JXQVJEOiAnRk9SV0FSRCcsXG5cdEJBQ0tXQVJEOiAnQkFDS1dBUkQnLFxuXG5cdEhPTUU6ICdIT01FJyxcblx0RElQVFlRVUU6ICdESVBUWVFVRScsXG5cblx0TEVGVDogJ0xFRlQnLFxuXHRSSUdIVDogJ1JJR0hUJyxcblx0VE9QOiAnVE9QJyxcblx0Qk9UVE9NOiAnQk9UVE9NJyxcblxuXHRJTlRFUkFDVElWRTogJ0lOVEVSQUNUSVZFJyxcblx0VFJBTlNJVElPTjogJ1RSQU5TSVRJT04nLFxuXG5cdFBYX0NPTlRBSU5FUl9JU19SRUFEWTogJ1BYX0NPTlRBSU5FUl9JU19SRUFEWScsXG5cdFBYX0NPTlRBSU5FUl9BRERfQ0hJTEQ6ICdQWF9DT05UQUlORVJfQUREX0NISUxEJyxcblx0UFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRDogJ1BYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQnLFxuXG5cdEhPTUVfVklERU9fU0laRTogWyA2NDAsIDM2MCBdLFxuXHRIT01FX0lNQUdFX1NJWkU6IFsgNDgwLCAyNzAgXSxcblxuXHRJVEVNX0lNQUdFOiAnSVRFTV9JTUFHRScsXG5cdElURU1fVklERU86ICdJVEVNX1ZJREVPJyxcblxuXHRHUklEX1JPV1M6IDQsIFxuXHRHUklEX0NPTFVNTlM6IDcsXG5cblx0UEFERElOR19BUk9VTkQ6IDQwLFxuXHRTSURFX0VWRU5UX1BBRERJTkc6IDEyMCxcblxuXHRFTlZJUk9OTUVOVFM6IHtcblx0XHRQUkVQUk9EOiB7XG5cdFx0XHRzdGF0aWM6ICcnXG5cdFx0fSxcblx0XHRQUk9EOiB7XG5cdFx0XHRcInN0YXRpY1wiOiBKU191cmxfc3RhdGljICsgJy8nXG5cdFx0fVxuXHR9LFxuXG5cdE1FRElBX0dMT0JBTF9XOiAxOTIwLFxuXHRNRURJQV9HTE9CQUxfSDogMTA4MCxcblxuXHRNSU5fTUlERExFX1c6IDk2MCxcblx0TVFfWFNNQUxMOiAzMjAsXG5cdE1RX1NNQUxMOiA0ODAsXG5cdE1RX01FRElVTTogNzY4LFxuXHRNUV9MQVJHRTogMTAyNCxcblx0TVFfWExBUkdFOiAxMjgwLFxuXHRNUV9YWExBUkdFOiAxNjgwLFxufSIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbnZhciBBcHBEaXNwYXRjaGVyID0gYXNzaWduKG5ldyBGbHV4LkRpc3BhdGNoZXIoKSwge1xuXHRoYW5kbGVWaWV3QWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHNvdXJjZTogJ1ZJRVdfQUNUSU9OJyxcblx0XHRcdGFjdGlvbjogYWN0aW9uXG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBcHBEaXNwYXRjaGVyIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgZGlwdHlxdWUtcGFnZSc+XFxuXHRcXG5cdDxkaXYgY2xhc3M9XFxcImZ1bi1mYWN0LXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibWVzc2FnZS13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLWlubmVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2ZhY3QtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydmYWN0LXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWN0LXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJjdXJzb3ItY3Jvc3NcXFwiPlxcblx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNC4xMDUgMTMuODI4XFxcIj5cXG5cdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNmZmZmZmZcXFwiIHBvaW50cz1cXFwiMTMuOTQ2LDAuODM4IDEzLjI4MywwLjE1NiA3LjAzNSw2LjI1IDAuODM5LDAuMTU2IDAuMTczLDAuODM0IDYuMzcsNi45MzEgMC4xNTksMTIuOTkgMC44MjMsMTMuNjcxIDcuMDcsNy41NzggMTMuMjY2LDEzLjY3MSAxMy45MzIsMTIuOTk0IDcuNzM2LDYuODk2IFxcXCIvPlxcblx0XHRcdDwvc3ZnPlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwibWFpbi1idG5zLXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGlkPSdzaG9wLWJ0bicgY2xhc3M9J21haW4tYnRuJz48L2Rpdj5cXG5cdFx0PGRpdiBpZD0nZnVuLWZhY3QtYnRuJyBjbGFzcz0nbWFpbi1idG4nPjwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJzZWxmaWUtc3RpY2std3JhcHBlclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2xvcmlmaWVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMDAgMjJcXFwiPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjRkYwMDAwXFxcIiBkPVxcXCJNNC42LDEuMjVjMC4wMDEsMCwwLjA0NS0wLjAwNiwwLjA4LDBoMC4wMzJcXG5cdGMxLjIxMiwwLjAwMywzNi43MDYtMSwzNi43MDYtMWwyNS40NzEsMC41NDljMC4wODYsMC4wMDIsMC4xNzIsMC4wMDcsMC4yNTgsMC4wMTdsMS40ODYsMC4xNjZDNjguNzExLDAuOTg5LDY4Ljc3MywxLDY4LjgzNiwxLjAzNlxcblx0bDAuMzI0LDAuMTk5YzAuMDUyLDAuMDMyLDAuMTEsMC4wNDksMC4xNzEsMC4wNWwyNy4wNDMsMC40NjljMCwwLDIuNjI0LTAuMDc3LDIuNjI0LDIuOTMzbC0wLjY5Miw3Ljk2XFxuXHRjLTAuMDQ1LDAuNTE4LTAuNDc5LDAuOTE2LTAuOTk5LDAuOTE2aC02LjIwM2MtMC4zMjgsMC0wLjY1MywwLjAzNC0wLjk3NSwwLjFjLTAuODUzLDAuMTc1LTIuODMsMC41MjgtNS4yNjMsMC42MThcXG5cdGMtMC4zNDIsMC4wMTQtMC42NjEsMC4xODEtMC44NzIsMC40NTFsLTAuNSwwLjY0NWwtMC4yOCwwLjM1OGMtMC4zNzQsMC40ODItMC42NDcsMS4wMzQtMC43ODksMS42MjhcXG5cdGMtMC4zMiwxLjM0NS0xLjM5OCwzLjk1Mi00LjkyNCwzLjk1OGMtMy45NzQsMC4wMDUtNy42ODUtMC4xMTMtMTAuNjEyLTAuMjI1Yy0xLjE4OS0wLjA0NC0yLjk2LDAuMjI5LTIuODU1LTEuNjI5bDAuMzYtNS45NFxcblx0YzAuMDE0LTAuMjE5LTAuMTU3LTAuNDA0LTAuMzc2LTAuNDA5TDI5LjYyLDEyLjQ4OGMtMC4yMTQtMC4wMDQtMC40MjgsMC4wMDEtMC42NDEsMC4wMTVsLTEuNzUzLDAuMTEzXFxuXHRjLTAuMjA4LDAuMDEzLTAuNDA3LDAuMDg1LTAuNTc0LDAuMjFjLTAuNTU3LDAuNDExLTEuODk3LDEuMzkyLTIuNjY3LDEuODU5Yy0wLjcwMSwwLjQyNi0xLjUzOSwxLjA0Mi0xLjk2OCwxLjM2NFxcblx0Yy0wLjE4MywwLjEzNy0wLjMwOSwwLjMzNS0wLjM1OCwwLjU1OGwtMC4zMTcsMS40MjVjLTAuMDQ0LDAuMjAyLTAuMDA0LDAuNDEzLDAuMTEzLDAuNTgzbDAuNjEzLDAuODk2XFxuXHRjMC4yMTIsMC4zMTEsMC4yOTcsMC42OTksMC4xODgsMS4wNTljLTAuMTE1LDAuMzc4LTAuNDQ0LDAuNzU1LTEuMjkyLDAuNzU1aC03Ljk1N2MtMC40MjUsMC0wLjg0OC0wLjA0LTEuMjY2LTAuMTJcXG5cdGMtMi41NDMtMC40ODYtMTAuODQ2LTIuNjYxLTEwLjg0Ni0xMC4zNkMwLjg5NiwzLjM3NSw0LjQ1OSwxLjI1LDQuNiwxLjI1XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzY3JlZW4taG9sZGVyXFxcIj48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImFycm93cy13cmFwcGVyXFxcIj5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3ByZXZpb3VzLXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXBhZ2UnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdsZWZ0JyBjbGFzcz1cXFwiYXJyb3cgbGVmdFxcXCI+XFxuXHRcdFx0XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzIgMjZcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBwb2ludHM9XFxcIjIxLjg0LDI1LjE4NCAxMy41OSwyNS4xODQgMS4wNDgsMTIuOTM0IDEzLjc5OCwwLjc2OCAyMi4wMDYsMC43MjYgMTIuNTA3LDEwLjE0MyAzMS40MjMsMTAuMDYgMzEuNTQ4LDE1Ljg1MSAxMS44ODIsMTUuODUxIFxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDEwMTAxXFxcIiBkPVxcXCJNMTMuMzQsMC4yNjVoOS43OTRsLTkuNjQ4LDkuMzA1aDE4LjIzNnY2LjkxSDEzLjU1M2w5LjYwMSw5LjI1OWwtOS44MTMtMC4wMkwwLjE1OSwxMi45OTFMMTMuMzQsMC4yNjV6TTIwLjcwNywxLjI0NWgtNi45NzFMMS41NjksMTIuOTkxTDEzLjczNiwyNC43NGw2Ljk4NCwwLjAxNEwxMS4xMjUsMTUuNWgxOS42MTd2LTQuOTVIMTEuMDU4TDIwLjcwNywxLjI0NXpcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCI3LjYyNywwLjgzMSA4LjMwNywxLjUyOSAxLjk1Miw3LjcyNyA4LjI5MywxMy45NjUgNy42MSwxNC42NTggMC41NjEsNy43MjQgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcHJldmlldy11cmwnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInByZXZpb3VzLXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblxcblx0XHQ8L2E+XFxuXHRcdDxhIGhyZWY9XFxcIiMvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ25leHQtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD0ncmlnaHQnIGNsYXNzPVxcXCJhcnJvdyByaWdodFxcXCI+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzIgMjZcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBwb2ludHM9XFxcIjEwLjM3NSwwLjgxOCAxOC42MjUsMC44MTggMzEuMTY3LDEzLjA2OCAxOC40MTcsMjUuMjM1IDEwLjIwOCwyNS4yNzcgMTkuNzA4LDE1Ljg2IDAuNzkyLDE1Ljk0MyAwLjY2NywxMC4xNTEgMjAuMzMzLDEwLjE1MSBcXFwiLz5cXG5cdFx0XHRcdFx0PHBhdGggZmlsbD1cXFwiIzAxMDEwMVxcXCIgZD1cXFwiTTE4LjcwOCwyNS43MzhIOC45MTRsOS42NDgtOS4zMDVIMC4zMjZ2LTYuOTFoMTguMTY5TDguODk0LDAuMjY1bDkuODE0LDAuMDJsMTMuMTgxLDEyLjcyN0wxOC43MDgsMjUuNzM4ek0xMS4zNDEsMjQuNzU3aDYuOTcxbDEyLjE2Ny0xMS43NDZMMTguMzEyLDEuMjYzbC02Ljk4NS0wLjAxNGw5LjU5Niw5LjI1NEgxLjMwNnY0Ljk1SDIwLjk5TDExLjM0MSwyNC43NTd6XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAuNDU2IDAuNjQ0IDcuOTU3IDE0LjIwMlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIHBvaW50cz1cXFwiMS4yNCwxNC42NTggMC41NjEsMTMuOTYgNi45MTUsNy43NjIgMC41NzUsMS41MjUgMS4yNTcsMC44MzEgOC4zMDcsNy43NjUgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbmV4dC1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wcmV2aWV3LXVybCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblx0XHQ8L2E+XFxuXHQ8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczQ9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHRcXG5cdDxoZWFkZXIgaWQ9XFxcImhlYWRlclxcXCI+XFxuXHRcdFx0PGEgaHJlZj1cXFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGNsYXNzPVxcXCJsb2dvXFxcIj5cXG5cdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiBpZD1cXFwiTGF5ZXJfMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdFx0PC9hPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1hcC1idG5cXFwiPjxhIGhyZWY9XFxcIiMhL2xhbmRpbmdcXFwiIGNsYXNzPVxcXCJzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm1hcF90eHQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2E+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY2FtcGVyLWxhYlxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYlVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGFiVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY2FtcGVyX2xhYiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXdyYXBwZXIgYnRuXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3AtdGl0bGUgc2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3RpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9kaXY+XFxuXHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTBcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVuU2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcInN1Yi0xXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj0nXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLndvbWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud29tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ3b21lblNob3BVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF93b21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9oZWFkZXI+XFxuXHRcdDxmb290ZXIgaWQ9XFxcImZvb3RlclxcXCIgY2xhc3M9XFxcImJ0blxcXCI+XFxuXHRcdFx0PGRpdiBpZD1cXFwic29jaWFsLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHVsPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2luc3RhZ3JhbSc+XFxuXHRcdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnN0YWdyYW1VcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluc3RhZ3JhbVVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaW5zdGFncmFtVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTYuMTA3LDE1LjU2MmMwLDAuMzAyLTAuMjQzLDAuNTQ3LTAuNTQzLDAuNTQ3SDIuNDM4Yy0wLjMwMiwwLTAuNTQ3LTAuMjQ1LTAuNTQ3LTAuNTQ3VjcuMzU5aDIuMTg4Yy0wLjI4NSwwLjQxLTAuMzgxLDEuMTc1LTAuMzgxLDEuNjYxYzAsMi45MjksMi4zODgsNS4zMTIsNS4zMjMsNS4zMTJjMi45MzUsMCw1LjMyMi0yLjM4Myw1LjMyMi01LjMxMmMwLTAuNDg2LTAuMDY2LTEuMjQtMC40Mi0xLjY2MWgyLjE4NlYxNS41NjJMMTYuMTA3LDE1LjU2MnogTTkuMDIsNS42NjNjMS44NTYsMCwzLjM2NSwxLjUwNCwzLjM2NSwzLjM1OGMwLDEuODU0LTEuNTA5LDMuMzU3LTMuMzY1LDMuMzU3Yy0xLjg1NywwLTMuMzY1LTEuNTA0LTMuMzY1LTMuMzU3QzUuNjU1LDcuMTY3LDcuMTYzLDUuNjYzLDkuMDIsNS42NjNMOS4wMiw1LjY2M3ogTTEyLjgyOCwyLjk4NGMwLTAuMzAxLDAuMjQ0LTAuNTQ2LDAuNTQ1LTAuNTQ2aDEuNjQzYzAuMywwLDAuNTQ5LDAuMjQ1LDAuNTQ5LDAuNTQ2djEuNjQxYzAsMC4zMDItMC4yNDksMC41NDctMC41NDksMC41NDdoLTEuNjQzYy0wLjMwMSwwLTAuNTQ1LTAuMjQ1LTAuNTQ1LTAuNTQ3VjIuOTg0TDEyLjgyOCwyLjk4NHogTTE1LjY2OSwwLjI1SDIuMzNjLTEuMTQ4LDAtMi4wOCwwLjkyOS0yLjA4LDIuMDc2djEzLjM0OWMwLDEuMTQ2LDAuOTMyLDIuMDc1LDIuMDgsMi4wNzVoMTMuMzM5YzEuMTUsMCwyLjA4MS0wLjkzLDIuMDgxLTIuMDc1VjIuMzI2QzE3Ljc1LDEuMTc5LDE2LjgxOSwwLjI1LDE1LjY2OSwwLjI1TDE1LjY2OSwwLjI1elxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPSd0d2l0dGVyJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnR3aXR0ZXJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnR3aXR0ZXJVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInR3aXR0ZXJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAyMiAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMjIgMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0yMS4xNzYsMC41MTRjLTAuODU0LDAuNTA5LTEuNzk5LDAuODc5LTIuODA4LDEuMDc5Yy0wLjgwNS0wLjg2NS0xLjk1My0xLjQwNS0zLjIyNi0xLjQwNWMtMi40MzgsMC00LjQxNywxLjk5Mi00LjQxNyw0LjQ0OWMwLDAuMzQ5LDAuMDM4LDAuNjg4LDAuMTE0LDEuMDEzQzcuMTY2LDUuNDY0LDMuOTEsMy42OTUsMS43MjksMWMtMC4zOCwwLjY2LTAuNTk4LDEuNDI1LTAuNTk4LDIuMjRjMCwxLjU0MywwLjc4LDIuOTA0LDEuOTY2LDMuNzA0QzIuMzc0LDYuOTIsMS42OTEsNi43MTgsMS4wOTQsNi4zODh2MC4wNTRjMCwyLjE1NywxLjUyMywzLjk1NywzLjU0Nyw0LjM2M2MtMC4zNzEsMC4xMDQtMC43NjIsMC4xNTctMS4xNjUsMC4xNTdjLTAuMjg1LDAtMC41NjMtMC4wMjctMC44MzMtMC4wOGMwLjU2MywxLjc2NywyLjE5NCwzLjA1NCw0LjEyOCwzLjA4OWMtMS41MTIsMS4xOTQtMy40MTgsMS45MDYtNS40ODksMS45MDZjLTAuMzU2LDAtMC43MDktMC4wMjEtMS4wNTUtMC4wNjJjMS45NTYsMS4yNjEsNC4yOCwxLjk5Nyw2Ljc3NSwxLjk5N2M4LjEzMSwwLDEyLjU3NC02Ljc3OCwxMi41NzQtMTIuNjU5YzAtMC4xOTMtMC4wMDQtMC4zODctMC4wMTItMC41NzdjMC44NjQtMC42MjcsMS42MTMtMS40MTEsMi4yMDQtMi4zMDNjLTAuNzkxLDAuMzU0LTEuNjQ0LDAuNTkzLTIuNTM3LDAuNzAxQzIwLjE0NiwyLjQyNCwyMC44NDcsMS41NTMsMjEuMTc2LDAuNTE0XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2ZhY2Vib29rJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZhY2Vib29rVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mYWNlYm9va1VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjZWJvb2tVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNy43MTksMTYuNzU2YzAsMC41MzEtMC40MzEsMC45NjMtMC45NjIsMC45NjNoLTQuNDQzdi02Ljc1M2gyLjI2N2wwLjMzOC0yLjYzMWgtMi42MDRWNi42NTRjMC0wLjc2MiwwLjIxMS0xLjI4MSwxLjMwNC0xLjI4MWwxLjM5NCwwVjMuMDE5Yy0wLjI0MS0wLjAzMi0xLjA2OC0wLjEwNC0yLjAzMS0wLjEwNGMtMi4wMDksMC0zLjM4NSwxLjIyNy0zLjM4NSwzLjQ3OXYxLjk0MUg3LjMyMnYyLjYzMWgyLjI3MnY2Ljc1M0gxLjI0M2MtMC41MzEsMC0wLjk2Mi0wLjQzMi0wLjk2Mi0wLjk2M1YxLjI0M2MwLTAuNTMxLDAuNDMxLTAuOTYyLDAuOTYyLTAuOTYyaDE1LjUxNGMwLjUzMSwwLDAuOTYyLDAuNDMxLDAuOTYyLDAuOTYyVjE2Ljc1NlxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDwvdWw+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZm9vdGVyPlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbn0sXCIzXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ob3Jpem9udGFsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ob3Jpem9udGFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiaG9yaXpvbnRhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ob3Jpem9udGFsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjhcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmVydGljYWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZlcnRpY2FsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwidmVydGljYWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMudmVydGljYWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXM0PWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgaG9tZS1wYWdlJz5cXG5cdDxkaXYgY2xhc3M9XFxcImJnLXdyYXBwZXJcXFwiPlxcblx0XHQ8aW1nIHNyYz0nXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJndXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iZ3VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYmd1cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBzdHlsZT0nZGlzcGxheTogbm9uZTsnIGNsYXNzPVxcXCJib3R0b20tdGV4dHMtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdC10ZXh0XFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJmcm9udC13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50ZXh0X2EgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRleHRfYSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGV4dF9hXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtdGV4dFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZnJvbnQtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aXNpb25cXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5hX3Zpc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYV92aXNpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImFfdmlzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0XHRcdDxpbWcgc3JjPVxcXCJpbWFnZS9sb2dvLW1hbGxvcmNhLnBuZ1xcXCI+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdFx0PGRpdj5jPC9kaXY+XFxuXHRcdFx0PGRpdj5kPC9kaXY+XFxuXHRcdFx0PGRpdj5lPC9kaXY+XFxuXHRcdFx0PGRpdj5mPC9kaXY+XFxuXHRcdFx0PGRpdj5nPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b21cXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+PC9kaXY+XHRcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImRlaWFcXFwiPkRFSUE8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImVzLXRyZW5jXFxcIj5FUyBUUkVOQzwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJlbGx1ZlxcXCI+QVJFTExVRjwvZGl2PlxcbjwvZGl2Plxcblxcbjxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIi02NyAwIDc2MCA2NDVcXFwiPlxcblx0PHBhdGggaWQ9XFxcIm1hcC1iZ1xcXCIgZmlsbD1cXFwiIzFFRUE3OVxcXCIgZD1cXFwiTTkuMjY4LDI4OS4zOTRsOS43OS03Ljc5OGwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bDAsMGwtMi4zODItMS4xNzdMOS4yNjgsMjg5LjM5NHogTTU3My41OCwxNzQuMjExbDE5Ljg5LTEzLjgybDguOTAxLTIuNDc5bDUuMzU0LTQuODA5bDEuNTYtNS41NTVsLTEtNi45MjJsMS40NDUtMy45NzNsNS4wNTctMi41MjNsNC4yNzEsMi4wMWwxMS45MDYsOS4xNjVsMi42OTMsNC45MTdsMi44OTIsMS41NzVsMTEuNDgyLDEuMzY3bDMuMDU3LDEuOTQ5bDQuNDE4LDUuMjExbDcuNzY4LDIuMjIxbDUuODMyLDQuOTE2bDYuMzA1LDAuMjE1bDYuMzczLTEuMjJsMS45ODksMS44OGwwLjQwOSwxLjk2M2wtNS4zMzYsMTAuNDI4bC0wLjIyOSwzLjg2OWwxLjQ0MSwxLjY0N2wwLjg1NCwwLjk1OGw3LjM5NS0wLjQyN2wyLjM0NywxLjU0bDAuOTAzLDIuNTE5bC0yLjEwMiwzLjA1NGwtOC40MjUsMy4xODNsLTIuMTY5LDcuMTE2bDAuMzQ0LDMuMTgzbDMuMDczLDQuMjMxbDAuMDE1LDIuODQ2bC0yLjAxOSwxLjQ1bC0wLjczOSwzLjg0M2wyLjE2NiwxNi42ODdsLTAuOTgyLDEuODhsLTYuNzg1LTMuNzU3bC0xLjc1OCwwLjI1NGwtMi4wMTksNC40NjhsMS4wMzIsNi4yMzdsLTAuNjA1LDQuODI3bC0wLjM2MywyLjg2OGwtMS40OTUsMS42NjVsLTIuMTAyLTAuMTI5bC04LjM0MS0zLjg0N2wtNC4wMTEtMC40MDVsLTIuNzExLDEuNjA0bC03LjQzOCwxNi40OTdsLTMuMjg0LDExLjU5OWwzLjIyLDEwLjU5N2wxLjY0LDEuODU5bDQuMzg2LTAuMjhsMS40NzgsMS42OWwtMS45MzcsMy4zOTVsLTIuNjkzLDEuMDk1bC03Ljg1MS0wLjEyOWwtMi41NDYsMS42MjJsLTIuNjYxLDMuNzE4bDAuMTI5LDAuODk3bDAuNjA5LDQuNDQ2bC0xLjQ3OCw0LjMxM2wtMy42OCwzLjMxMmwtMy45MDksMS4xNzNsLTExLjk4OSw3Ljc1OGwtNS4zNTQsNy45NjdsLTguOTM4LDYuNTM5bC0zLjM1MSw2LjY2M2wtNS43OCw2LjU0MmwtNC44MjcsOC4xODJsMC4yOTQsMy45MDhsLTQuODk2LDEyLjI4N2wtMi4wMiw1LjEwN2wtMy4yMDIsMjIuMzkzbDAuNzIxLDguODQybC0xLjAzMywyLjk1bC0xLjcyNS0wLjI3NmwtNC4xMjUtNC40NjhsLTEuNjI0LDAuOTYybC0xLjM5NiwzLjI3MmwxLjgyMiw0Ljg0OGwtMS42OTIsNS4wMjFsLTQuNzMxLDYuNjA0bC04LjA2MiwxOS4yOTJsLTIuOTc3LDAuMzQxbC0wLjU0MSwwLjQ0OGwtMS40NzksMS4xOTVsMS4zMTYsNC40ODlsLTIuMjg0LDMuMzk1bC0yLjUxNCwxLjI2NGwtNS40ODQtNC41MzJsLTMuMDg4LTAuODk0bC0wLjgwNywxLjkwMWwyLjIyMSw3LjE3OGwtMy40LDEuMzg5bC04LjM2My0wLjEzbC0xLjUxMSwyLjJsMS4xMDIsNS4zNjVsLTAuNjg4LDIuNzczbC0zLjEzOCwzLjE2NWwtNi42MDMsMi44bC0zLjg5Niw0LjE4OGwtNC42MjktMS4zMjRsLTQuNzMxLDAuNjE3bC01LjA5Mi0yLjU4NGwtMi42MjUsMy41NjdsMC40NzMsMi43MTNsMC4xOCwxLjAyNmwtMS4zMTIsMS42ODdsLTEyLjQ1Miw0Ljc2NmwtNC41OTgsNC40ODVsLTcuMDYyLDExLjA2N2wtMTcuNjIzLDE5LjgwOWwtNC4wOTIsMS43MjdsLTQuNDk4LTAuNjE3bC0zLjY0Ni0zLjE4NGwtMi43OTUtNi41MTdsLTcuMTc2LTguODY3bC0xLjIzMy0wLjU1NmwtMy41MTUtMS42NDRsLTEuOTA0LTMuNjMybDEuMzQ5LTUuMzg3bC0zLjI3MS00LjA1OWwtNy4wMTUtNS41MTJsLTIuODkxLDEuNzk0bC00LjAyMywwLjQ3bC0yLjg3My0xLjcyOWwtMS4yNjctNS41NTVsNC43OTktOC4zNTRsLTAuMDgyLTEuNjAxbC0yLjUyOC00Ljg5NWwtOC4wMi05LjYxNGwtNS4zNTItNC4xNjZsLTQuNjE1LTEuODM3bC00LjIyMSwwLjY0MmwtNi43ODUtMC43NzFsLTQuODEzLTAuNTc0bC02Ljk0NiwyLjYyN2wtMy4wMDYsNC4wNTlsLTEuOTIyLDAuMjU1bC0xNC41NjgtNy44MzdsLTQuODYyLTAuNjIxbC04LjQ2LDEuODM3bC04LjQ4OS0wLjk4M2wtNC4yMDcsMC42NjRsLTcuNzE4LDQuMTY3bC0zLjUxNSwwLjY4MmwtMi45MDgtMS4xOTVsLTQuODEyLTQuNjgzbC00LjE1Ny0wLjU1M2wtNy4yNzMsMS40MzJsLTEuNjQyLTAuNjgybC0xLjM2My00LjEyN2wtNC44OTgtMy4wNzVsLTMuMTk5LTUuMjc5bC0xMS40MDEtOC44ODVsLTUuMjIyLTcuMTU5bC0zLjA4OC03LjU2NWwtMC40MDktNS44MzFsMy42MTEtMTIuNjcxbDAuMTMzLTUuODExbC0xLjE2OS00LjQ2OGwtNS44NDYtOC40MThsLTMuMDM3LTYuNDQ5bC0yLjMxNy00LjkzOGwxLjM2My0yLjc1M2wzLjc3NS0yLjA5NmwyLjk5Mi03LjQxNGw0LjQtMy45OTRsMi4xMDQtMy43NjFsLTQuMDI0LTkuOTE1bC0zLjg0NC02LjcyOWwtOC4zNDYtNy42NDdsLTguNzY5LTIuNTg4bC05LjQyOS0xMC4zNDJsLTQuMjU3LTIuMzI1bC01LjMxOC01LjM4NmwtNy4yNjItMS45NDVsLTAuNjcxLTAuMTY4bC01LjE3NS0xLjM5M2wtMi45NTYsMC41NmwtMi44NTcsMC41NTNsLTIuOTI0LTEuMDQ4bC0zLjk0NCwyLjA5NmwtMi4zLDQuMTIzbDAuMTQ3LDEuNDMybDAuMDg3LDAuNjgybDMuOTM4LDUuMTQ5bC0yLjM5NiwyLjUyM2wtMTAuODg4LTUuNjg1bC00LjIwNywwLjE1MWwtNS45OTMsMTEuNjYzbC00LjA5MiwzLjgyOWwtNi43MTctMC44MzNsLTkuOTIxLDMuMjY2bC03LjY1MiwyLjUyMmwtMi43NzYsMy4wMzNsLTAuMjk3LDIuNDU0bDMuMzAzLDQuMDQxbC0zLjAyMywxLjA5MWwtMC41OTIsMS4zNjd2Ny4wNDhsLTYuODgyLDE1LjcwNGwtMi43NzYsMTAuMjU2bDEuMjAyLDQuMTAybC0wLjgyNSwyLjYwOWwtMTIuMzE1LTUuMTkzbC04Ljc1OC02LjQzMWwtNS4wNDMsMi45MDdsLTAuODg2LDAuNDg4bDEuNDgxLTUuMjExbC0xLjYxLTYuNDA5bDIuMDItNS41NTZsLTAuOTE5LTIuNjdsLTQuNDM2LDEuMzY3bC00LjY4MS0wLjZsLTMuMDczLTQuOTEybC0xLjM0NS00LjYzN2wxLjE4LTIuOTQ5bDIuODk1LTEuOTY3bDcuMDExLTAuNzAzbDEuNjQzLTEuMzI4bC0wLjI2Mi0xLjc3bC03LjM0NS0zLjU0OWwtNi40Ny0xMC4zNjNsLTYuMTI2LDAuMDQzbC00LjU5OCw1LjA2NmwtMy41NjQsMC44NzNsLTQuNzQ4LDEuMTc2bC0wLjU5Mi0yLjEzNWwxLjA1MS0zLjgyNWwtMS4wODMtMi44NjRsLTMuMjg1LTAuNzA2TDY0LjM3NSwzMjhsLTIuNTk3LDYuNzUzbC00LjY5OCwzLjI5MWwtNC44NTktMC41NzdsMC43MDctMy44NDhsLTEuMTAyLTIuMzUxbC0zLjE3LDAuMzg0bC0zLjE3MS0zLjE1OGwtNC4wNDEsNC4zNzlsLTMuMTUyLDAuMjExbC0xLjY0NC0yLjM2OGwyLjYxMS0zLjIyOWw4LjU0My0zLjQ1OWwzLjQ0Ni0yLjgxN2wtMC4xMTUtMS4yNDJsLTEtMC43NWwtMi42OTMsMS4yNjNsLTUuMzg3LTAuNDMxbC0yLjE4NS0yLjIzOWwtMTAuNjQ0LTEwLjg5OGwtMC41OTItMi4xMzVsMS43MDctNi42MDNsLTAuNTc0LTIuNDk4bC0zLjUyOS0yLjk5M2wtMC42MDktMi4xNTdsMy42OTQtNy43MzdsMi4zMDItMC41OTZsMi43MTItNS41MTZsOS4xODEtOS40Mmw4LjU3MSwwLjA2NWwxMS42MjctNS41OTlsNS44MzUtNC45OTlsMS44NTQtMi43NzhsMy4yMzUtNC44OTVsNS44MzEtNC42NTRsMTIuODkzLTYuNDEzbDcuMTMtNi4zNDVsNS4wODktNy4zMDZsNS43MTctMi4zNzJsNS44MzEtOC4zMzNsMy4yODUtMi44NDJsNy40ODgtMi45NzFsNC44NjMtNi4wODZsMy4yMDMtMS4yNjNsMTAuMTY3LDEuMzY3bDYuNjcxLTEuNzUxbDUuMDU3LTMuNDM4bDE0Ljk4LTEyLjI4N2w0LjA4OC04LjI0N2wxNC4wNDQtMTQuNjE2bDYuNjY3LTEwLjc0NGw0LjAxLDMuOTEybDQuNDgzLTEuOTAybDUuMzA4LTQuNDg2bDEuNzktNC4yMTNsNi4xNTctMTQuNDAxbDQuODI3LTEuODU1bDYuNDA4LDQuOTEzbDIuNTk0LTIuODY0bC0wLjczOC01Ljg1M2wwLjY3NC0yLjk2OGwyMS45NjMtMTcuODg1bDUuMDM5LTIuNzM0bDUuNzk5LDMuMzEybDMuMzY3LTAuODc1bDMuNTMzLTMuNjk2bDEuODA4LTUuMjU3bDAuNDU5LTEuMzI0bDMuMjk5LDAuNzA3bDEuNDE0LTEwLjQ5M2wxLjgyMS0xLjMyNGw0LjY2NiwxLjMwM2w0LjQ2NS0xLjM0Nmw2LjU1NiwyLjExM2wtMC4xOTctMi4wNDlsLTAuMTE0LTEuMjM4bC0wLjAzMi0wLjI1OGwxLjcwNy0yLjU0MWwwLjQ0NCwwLjA2NGw5LjgxOSwxLjUxOGgwLjAxOGw2LjgxNy0yLjI5bDUuODYtMS45NjNsNy4wOTgtOC4yNWw4LjM2LTIuMmw0LjUzMi0yLjc1OWw0LjUwMS01Ljc2N2wyLjQ4MS0zLjE4M2w4LjE2My01LjIxbDQuOTkyLDIuMDI3bDQuNDE4LTMuOTcybDQuMDU3LTAuNDk2bDQuOTEzLTIuOTAzbDguNDc1LTEwLjgwOWwyLjc3NSwwLjY4MmwzLjM4MywzLjYxbDEuODksMi4wMzFsMi4zNjMsMi41MTlsOC42NDMtMC43NjhsMTUuNjAyLTEyLjM0OGw0LjgxMi0yLjQ1OGwxMS4wNzEtNS42NjNsMy43MTItMC4xNDdsLTAuNDc4LDUuNDQ3bDEuODkxLDAuNzlsNS43NjctMi42NjlsMy42MTEsMS4yNTlsLTIuNzI2LDQuOTU2bDAuMTQ3LDMuNTI3bDMuNzEyLTAuMzIzbDE3LjY3My0xMS41MTJsMi4zMTctMC41NzhsMi4wMDUsMS42ODdsLTAuOTg2LDIuMDc0bDAuNDA4LDEuOTY2bDExLjM1Mi0xLjg0MWw0LjM1NC0yLjU4NGwxLjcwNy0yLjM3Mmw0LjM4My02LjA4Nmw3LjE0Ny01LjIzNmwxMi40MzQtNS40NzNsNC41NjUtMC4wODZsMC45NjksMS40NTNsLTEuNzA3LDIuMzc2bDAuNzcxLDEuOTg0bDQuMDU2LTAuMjk4bDEzLjg0Ny01LjcyOGwyLjIzNCwxLjAwNWwtNC4wODksMy45OTRsLTIuMzM0LDYuOTAxbC0yLjE4NSwxLjQ3NWwtMy40ODItMC41NTZsLTMuMjIxLDEuMDQ0bC04LjkxNiw2Ljg2MWwtNi42ODQsNS4xMjhsLTMuNzgxLDEuNzNsLTExLjM5Ni0wLjI5OGwtNS45NDYsNS42NjNsLTMuMjUzLDQuNzQ0bC00LjI1NCwxLjAwNWwtMC4xNzksOS4zMTJsLTcuNjIxLTguMTgybC00Ljc0OSwwLjI3NmwtMy43NDMsNC4xOTFsLTEuMjM0LDYuNDQ5bDEuNzQzLDkuNjE3bDIuODA4LDYuNDkybDEuODcyLDQuMzM5bDcuMDQ4LDUuNjgxbDkuMzc4LTEuMjM4bDcuMTEyLTUuMDYzbDIuMjk5LTAuMjMzbDIuODc2LDEuOTJsMi45ODctMC4xNjhsMy44NzctMy4zMDlsOS4yOTYtMi45OTNsNC45MDktMy4yNDhsNS44NS03LjI0MmwzLjEwMy0yLjExN2w0LjA2LTAuMTI5bDMuMzk5LDEuOTY3bC05LjYyNSw4Ljc4MWwtMC4zMTIsMC45ODNsLTEuODI1LDUuNzY3bDAuODg5LDMuMDU4bDIuMzE3LDIuNDExbDMuMDA2LTAuMzYybDAuMzQ0LDMuMjA4bC00LjA1NiwzLjQ1OWwtNi41MDYsOS41MWwtNC4wMDcsMi43NTJsLTcuNzAzLTAuMjU1bC02LjY4NSwzLjUwNmwtMy4zMDQtMC41NmwtMi40NjMtMy4xMThsLTMuMzgzLTIuMTM1bC0xLjkzOSwwLjI1NGwtMi45NTYsMi42NDhsLTIuMjMzLDUuMzQ0bC0xLjk1NSw2LjkyMmwwLjU0NSwyLjY5MWwwLDBsMy44NDIsMTMuMDc3bDguMDQ4LDE1Ljk2Mmw2LjQzOCw3LjIybDEzLjMyMyw5LjQwMmwyMi41NDgsMTAuMjUzbDAuNjI3LDEuMjYzbDExLjU0NSw1LjYybDUuMzQsMi41ODNsNS4xNzUsMS41MzZsMy44NzQtMC40ODhsNS40NTQtMy4zNzZMNTczLjU4LDE3NC4yMTF6IE0zODcuNTE3LDYwMS45NzNsLTIuNzU5LTMuNjk2bDAuNDU5LTEuOTAybDIuMTM4LTEuMTNsMC4zMjctMi45NzVsMi41MTQtMS40NWwzLjgwOSwwLjU1NmwwLjQyNywxLjYyMmwtMi4yOCw3LjA5NWwtMi4wNTYsMi41NDFsMCwwTDM4Ny41MTcsNjAxLjk3M3ogTTM2NS42NTcsNjE0LjM0NmwzLjkwOSwxMS40OTFsMi4yMTcsMC42NjNsMC45ODItMi4wN2wtMC4yNDQtMC43NzFsLTEuMDgzLTMuNTIzbDAuNjM4LTIuNDM4bDIuNTk4LDAuMzAybDIuNzg5LDMuMTU4bDMuMDkzLDAuNzA3bDIuMjQ4LTMuMDU4bC0xLjk5LTUuMjExbDAuNjYtMi40MzdsMi42MjUtMC4zODRsNC43MTYsMi44ODVsNi4wMTEsMS4yMTdsMi4zMzUsMS45MDJsLTQuNjM0LDUuNTU1bC00LjE3MS0wLjIzNmwtMS40NzgsMS44NThsLTAuODQsMi42MDhsMi40NjUsMi42MDVsLTMuMjAzLDQuNzY2bDAuMDgzLDEuNzczbDMuNTI4LDUuNDY5bC0wLjU4OCwxLjIybC0yLjQ0OSwwLjM4NGwtNS45OTMtMS43NTFsLTYuMTkzLDEuOTYzbDAsMGwtMC4yOC00LjQyNWwtOC41MzksMC40MDlsLTAuNDQ0LTEuNDMybDMuMzg2LTQuNzQ0bC0wLjc4OS0xLjYyMmwtNi44NS0xLjc5NGwtMC42MjUtNC42MTVsNC45Ni01LjAyMWwtMi41MTQtMS45MDFsLTAuNDA5LTIuMTM2bDEuNDkyLTIuMDMxTDM2NS42NTcsNjE0LjM0NnpcXFwiLz5cXG5cdFxcblx0PHBhdGggaWQ9XFxcIm91dGVyLWJvcmRlclxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjRkZGRkZGXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIGQ9XFxcIk0xOS4wNTgsMjgxLjU5NmwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bC0yLjM4Mi0xLjE3N2w3LjI5Mi0xMC4wNDFMMTkuMDU4LDI4MS41OTZ6IE02ODkuNDU1LDE5My44ODhsMi4xMDItMy4wNTRsLTAuOTAzLTIuNTE5bC0yLjM0Ny0xLjU0bC03LjM5NSwwLjQyN2wtMC44NTQtMC45NThsLTEuNDQxLTEuNjQ3bDAuMjI5LTMuODY5bDUuMzM2LTEwLjQyOGwtMC40MDktMS45NjNsLTEuOTg5LTEuODhsLTYuMzczLDEuMjJsLTYuMzA1LTAuMjE1bC01LjgzMi00LjkxNmwtNy43NjgtMi4yMjFsLTQuNDE4LTUuMjExbC0zLjA1Ny0xLjk0OWwtMTEuNDgyLTEuMzY3bC0yLjg5Mi0xLjU3NWwtMi42OTMtNC45MTdsLTExLjkwNi05LjE2NWwtNC4yNzEtMi4wMWwtNS4wNTcsMi41MjNsLTEuNDQ1LDMuOTczbDEsNi45MjJsLTEuNTYsNS41NTVsLTUuMzU0LDQuODA5bC04LjkwMSwyLjQ3OWwtMTkuODksMTMuODJsLTYuMzA5LDAuMTcybC01LjQ1NCwzLjM3NmwtMy44NzQsMC40ODhsLTUuMTc1LTEuNTM2bC01LjM0LTIuNTgzbC0xMS41NDUtNS42MmwtMC42MjctMS4yNjNsLTIyLjU0OC0xMC4yNTNsLTEzLjMyMy05LjQwMmwtNi40MzgtNy4yMmwtOC4wNDgtMTUuOTYybC0zLjg0Mi0xMy4wNzdsLTAuNTQ1LTIuNjkxbDEuOTU1LTYuOTIybDIuMjMzLTUuMzQ0bDIuOTU2LTIuNjQ4bDEuOTM5LTAuMjU0bDMuMzgzLDIuMTM1bDIuNDYzLDMuMTE4bDMuMzA0LDAuNTZsNi42ODUtMy41MDZsNy43MDMsMC4yNTVsNC4wMDctMi43NTJsNi41MDYtOS41MWw0LjA1Ni0zLjQ1OWwtMC4zNDQtMy4yMDhsLTMuMDA2LDAuMzYybC0yLjMxNy0yLjQxMWwtMC44ODktMy4wNThsMS44MjUtNS43NjdsMC4zMTItMC45ODNsOS42MjUtOC43ODFsLTMuMzk5LTEuOTY3bC00LjA2LDAuMTI5bC0zLjEwMywyLjExN2wtNS44NSw3LjI0MmwtNC45MDksMy4yNDhsLTkuMjk2LDIuOTkzbC0zLjg3NywzLjMwOWwtMi45ODcsMC4xNjhsLTIuODc2LTEuOTJsLTIuMjk5LDAuMjMzbC03LjExMiw1LjA2M2wtOS4zNzgsMS4yMzhsLTcuMDQ4LTUuNjgxbC0xLjg3Mi00LjMzOWwtMi44MDgtNi40OTJsLTEuNzQzLTkuNjE3bDEuMjM0LTYuNDQ5bDMuNzQzLTQuMTkxbDQuNzQ5LTAuMjc2bDcuNjIxLDguMTgybDAuMTc5LTkuMzEybDQuMjU0LTEuMDA1bDMuMjUzLTQuNzQ0bDUuOTQ2LTUuNjYzbDExLjM5NiwwLjI5OGwzLjc4MS0xLjczbDYuNjg0LTUuMTI4bDguOTE2LTYuODYxbDMuMjIxLTEuMDQ0bDMuNDgyLDAuNTU2bDIuMTg1LTEuNDc1bDIuMzM0LTYuOTAxbDQuMDg5LTMuOTk0bC0yLjIzNC0xLjAwNWwtMTMuODQ3LDUuNzI4bC00LjA1NiwwLjI5OGwtMC43NzEtMS45ODRsMS43MDctMi4zNzZsLTAuOTY5LTEuNDUzbC00LjU2NSwwLjA4NmwtMTIuNDM0LDUuNDczbC03LjE0Nyw1LjIzNmwtNC4zODMsNi4wODZsLTEuNzA3LDIuMzcybC00LjM1NCwyLjU4NGwtMTEuMzUyLDEuODQxbC0wLjQwOC0xLjk2NmwwLjk4Ni0yLjA3NGwtMi4wMDUtMS42ODdsLTIuMzE3LDAuNTc4bC0xNy42NzMsMTEuNTEybC0zLjcxMiwwLjMyM2wtMC4xNDctMy41MjdsMi43MjYtNC45NTZsLTMuNjExLTEuMjU5bC01Ljc2NywyLjY2OWwtMS44OTEtMC43OWwwLjQ3OC01LjQ0N2wtMy43MTIsMC4xNDdsLTExLjA3MSw1LjY2M2wtNC44MTIsMi40NThsLTE1LjYwMiwxMi4zNDhsLTguNjQzLDAuNzY4bC0yLjM2My0yLjUxOWwtMS44OS0yLjAzMWwtMy4zODMtMy42MWwtMi43NzUtMC42ODJsLTguNDc1LDEwLjgwOWwtNC45MTMsMi45MDNsLTQuMDU3LDAuNDk2bC00LjQxOCwzLjk3MmwtNC45OTItMi4wMjdsLTguMTYzLDUuMjFsLTIuNDgxLDMuMTgzbC00LjUwMSw1Ljc2N2wtNC41MzIsMi43NTlsLTguMzYsMi4ybC03LjA5OCw4LjI1bC01Ljg2LDEuOTYzbC02LjgxNywyLjI5aC0wLjAxOGwtOS44MTktMS41MThsLTAuNDQ0LTAuMDY0bC0xLjcwNywyLjU0MWwwLjAzMiwwLjI1OGwwLjExNCwxLjIzOGwwLjE5NywyLjA0OWwtNi41NTYtMi4xMTNsLTQuNDY1LDEuMzQ2bC00LjY2Ni0xLjMwM2wtMS44MjEsMS4zMjRsLTEuNDE0LDEwLjQ5M2wtMy4yOTktMC43MDdsLTAuNDU5LDEuMzI0bC0xLjgwOCw1LjI1N2wtMy41MzMsMy42OTZsLTMuMzY3LDAuODc1bC01Ljc5OS0zLjMxMmwtNS4wMzksMi43MzRsLTIxLjk2MywxNy44ODVsLTAuNjc0LDIuOTY4bDAuNzM4LDUuODUzbC0yLjU5NCwyLjg2NGwtNi40MDgtNC45MTNsLTQuODI3LDEuODU1bC02LjE1NywxNC40MDFsLTEuNzksNC4yMTNsLTUuMzA4LDQuNDg2bC00LjQ4MywxLjkwMmwtNC4wMS0zLjkxMmwtNi42NjcsMTAuNzQ0bC0xNC4wNDQsMTQuNjE2bC00LjA4OCw4LjI0N2wtMTQuOTgsMTIuMjg3bC01LjA1NywzLjQzOGwtNi42NzEsMS43NTFsLTEwLjE2Ny0xLjM2N2wtMy4yMDMsMS4yNjNsLTQuODYzLDYuMDg2bC03LjQ4OCwyLjk3MWwtMy4yODUsMi44NDJsLTUuODMxLDguMzMzbC01LjcxNywyLjM3MmwtNS4wODksNy4zMDZsLTcuMTMsNi4zNDVMODAuNDcxLDI0NC40bC01LjgzMSw0LjY1NGwtMy4yMzUsNC44OTVsLTEuODU0LDIuNzc4bC01LjgzNSw0Ljk5OWwtMTEuNjI3LDUuNTk5bC04LjU3MS0wLjA2NWwtOS4xODEsOS40MmwtMi43MTIsNS41MTZsLTIuMzAyLDAuNTk2bC0zLjY5NCw3LjczN2wwLjYwOSwyLjE1N2wzLjUyOSwyLjk5M2wwLjU3NCwyLjQ5OGwtMS43MDcsNi42MDNsMC41OTIsMi4xMzVsMTAuNjQ0LDEwLjg5OGwyLjE4NSwyLjIzOWw1LjM4NywwLjQzMWwyLjY5My0xLjI2M2wxLDAuNzVsMC4xMTUsMS4yNDJsLTMuNDQ2LDIuODE3bC04LjU0MywzLjQ1OWwtMi42MTEsMy4yMjlsMS42NDQsMi4zNjhsMy4xNTItMC4yMTFsNC4wNDEtNC4zNzlsMy4xNzEsMy4xNThsMy4xNy0wLjM4NGwxLjEwMiwyLjM1MWwtMC43MDcsMy44NDhsNC44NTksMC41NzdsNC42OTgtMy4yOTFMNjQuMzc1LDMyOGwyLjg0MS0wLjkxOWwzLjI4NSwwLjcwNmwxLjA4MywyLjg2NGwtMS4wNTEsMy44MjVsMC41OTIsMi4xMzVsNC43NDgtMS4xNzZsMy41NjQtMC44NzNsNC41OTgtNS4wNjZsNi4xMjYtMC4wNDNsNi40NywxMC4zNjNsNy4zNDUsMy41NDlsMC4yNjIsMS43N2wtMS42NDMsMS4zMjhsLTcuMDExLDAuNzAzbC0yLjg5NSwxLjk2N2wtMS4xOCwyLjk0OWwxLjM0NSw0LjYzN2wzLjA3Myw0LjkxMmw0LjY4MSwwLjZsNC40MzYtMS4zNjdsMC45MTksMi42N2wtMi4wMiw1LjU1NmwxLjYxLDYuNDA5bC0xLjQ4MSw1LjIxMWwwLjg4Ni0wLjQ4OGw1LjA0My0yLjkwN2w4Ljc1OCw2LjQzMWwxMi4zMTUsNS4xOTNsMC44MjUtMi42MDlsLTEuMjAyLTQuMTAybDIuNzc2LTEwLjI1Nmw2Ljg4Mi0xNS43MDR2LTcuMDQ4bDAuNTkyLTEuMzY3bDMuMDIzLTEuMDkxbC0zLjMwMy00LjA0MWwwLjI5Ny0yLjQ1NGwyLjc3Ni0zLjAzM2w3LjY1Mi0yLjUyMmw5LjkyMS0zLjI2Nmw2LjcxNywwLjgzM2w0LjA5Mi0zLjgyOWw1Ljk5My0xMS42NjNsNC4yMDctMC4xNTFsMTAuODg4LDUuNjg1bDIuMzk2LTIuNTIzbC0zLjkzOC01LjE0OWwtMC4wODctMC42ODJsLTAuMTQ3LTEuNDMybDIuMy00LjEyM2wzLjk0NC0yLjA5NmwyLjkyNCwxLjA0OGwyLjg1Ny0wLjU1M2wyLjk1Ni0wLjU2bDUuMTc1LDEuMzkzbDAuNjcxLDAuMTY4bDcuMjYyLDEuOTQ1bDUuMzE4LDUuMzg2bDQuMjU3LDIuMzI1bDkuNDI5LDEwLjM0Mmw4Ljc2OSwyLjU4OGw4LjM0Niw3LjY0N2wzLjg0NCw2LjcyOWw0LjAyNCw5LjkxNWwtMi4xMDQsMy43NjFsLTQuNCwzLjk5NGwtMi45OTIsNy40MTRsLTMuNzc1LDIuMDk2bC0xLjM2MywyLjc1M2wyLjMxNyw0LjkzOGwzLjAzNyw2LjQ0OWw1Ljg0Niw4LjQxOGwxLjE2OSw0LjQ2OGwtMC4xMzMsNS44MTFsLTMuNjExLDEyLjY3MWwwLjQwOSw1LjgzMWwzLjA4OCw3LjU2NWw1LjIyMiw3LjE1OWwxMS40MDEsOC44ODVsMy4xOTksNS4yNzlsNC44OTgsMy4wNzVsMS4zNjMsNC4xMjdsMS42NDIsMC42ODJsNy4yNzMtMS40MzJsNC4xNTcsMC41NTNsNC44MTIsNC42ODNsMi45MDgsMS4xOTVsMy41MTUtMC42ODJsNy43MTgtNC4xNjdsNC4yMDctMC42NjRsOC40ODksMC45ODNsOC40Ni0xLjgzN2w0Ljg2MiwwLjYyMWwxNC41NjgsNy44MzdsMS45MjItMC4yNTVsMy4wMDYtNC4wNTlsNi45NDYtMi42MjdsNC44MTMsMC41NzRsNi43ODUsMC43NzFsNC4yMjEtMC42NDJsNC42MTUsMS44MzdsNS4zNTIsNC4xNjZsOC4wMiw5LjYxNGwyLjUyOCw0Ljg5NWwwLjA4MiwxLjYwMWwtNC43OTksOC4zNTRsMS4yNjcsNS41NTVsMi44NzMsMS43MjlsNC4wMjMtMC40N2wyLjg5MS0xLjc5NGw3LjAxNSw1LjUxMmwzLjI3MSw0LjA1OWwtMS4zNDksNS4zODdsMS45MDQsMy42MzJsMy41MTUsMS42NDRsMS4yMzMsMC41NTZsNy4xNzYsOC44NjdsMi43OTUsNi41MTdsMy42NDYsMy4xODRsNC40OTgsMC42MTdsNC4wOTItMS43MjdsMTcuNjIzLTE5LjgwOWw3LjA2Mi0xMS4wNjdsNC41OTgtNC40ODVsMTIuNDUyLTQuNzY2bDEuMzEyLTEuNjg3bC0wLjE4LTEuMDI2bC0wLjQ3My0yLjcxM2wyLjYyNS0zLjU2N2w1LjA5MiwyLjU4NGw0LjczMS0wLjYxN2w0LjYyOSwxLjMyNGwzLjg5Ni00LjE4OGw2LjYwMy0yLjhsMy4xMzgtMy4xNjVsMC42ODgtMi43NzNsLTEuMTAyLTUuMzY1bDEuNTExLTIuMmw4LjM2MywwLjEzbDMuNC0xLjM4OWwtMi4yMjEtNy4xNzhsMC44MDctMS45MDFsMy4wODgsMC44OTRsNS40ODQsNC41MzJsMi41MTQtMS4yNjRsMi4yODQtMy4zOTVsLTEuMzE2LTQuNDg5bDEuNDc5LTEuMTk1bDAuNTQxLTAuNDQ4bDIuOTc3LTAuMzQxbDguMDYyLTE5LjI5Mmw0LjczMS02LjYwNGwxLjY5Mi01LjAyMWwtMS44MjItNC44NDhsMS4zOTYtMy4yNzJsMS42MjQtMC45NjJsNC4xMjUsNC40NjhsMS43MjUsMC4yNzZsMS4wMzMtMi45NWwtMC43MjEtOC44NDJsMy4yMDItMjIuMzkzbDIuMDItNS4xMDdsNC44OTYtMTIuMjg3bC0wLjI5NC0zLjkwOGw0LjgyNy04LjE4Mmw1Ljc4LTYuNTQybDMuMzUxLTYuNjYzbDguOTM4LTYuNTM5bDUuMzU0LTcuOTY3bDExLjk4OS03Ljc1OGwzLjkwOS0xLjE3M2wzLjY4LTMuMzEybDEuNDc4LTQuMzEzbC0wLjYwOS00LjQ0NmwtMC4xMjktMC44OTdsMi42NjEtMy43MThsMi41NDYtMS42MjJsNy44NTEsMC4xMjlsMi42OTMtMS4wOTVsMS45MzctMy4zOTVsLTEuNDc4LTEuNjlsLTQuMzg2LDAuMjhsLTEuNjQtMS44NTlsLTMuMjItMTAuNTk3bDMuMjg0LTExLjU5OWw3LjQzOC0xNi40OTdsMi43MTEtMS42MDRsNC4wMTEsMC40MDVsOC4zNDEsMy44NDdsMi4xMDIsMC4xMjlsMS40OTUtMS42NjVsMC4zNjMtMi44NjhsMC42MDUtNC44MjdsLTEuMDMyLTYuMjM3bDIuMDE5LTQuNDY4bDEuNzU4LTAuMjU0bDYuNzg1LDMuNzU3bDAuOTgyLTEuODhsLTIuMTY2LTE2LjY4N2wwLjczOS0zLjg0M2wyLjAxOS0xLjQ1bC0wLjAxNS0yLjg0NmwtMy4wNzMtNC4yMzFsLTAuMzQ0LTMuMTgzbDIuMTY5LTcuMTE2TDY4OS40NTUsMTkzLjg4OHogTTM5Mi4xNTEsNjAxLjA5MmwyLjI4LTcuMDk1bC0wLjQyNy0xLjYyMmwtMy44MDktMC41NTZsLTIuNTE0LDEuNDVsLTAuMzI3LDIuOTc1bC0yLjEzOCwxLjEzbC0wLjQ1OSwxLjkwMmwyLjc1OSwzLjY5NmwyLjU3OCwwLjY2TDM5Mi4xNTEsNjAxLjA5MnogTTM4OC44MTUsNjEzLjY2bC00LjcxNi0yLjg4NWwtMi42MjUsMC4zODRsLTAuNjYsMi40MzdsMS45OSw1LjIxMWwtMi4yNDgsMy4wNThsLTMuMDkzLTAuNzA3bC0yLjc4OS0zLjE1OGwtMi41OTgtMC4zMDJsLTAuNjM4LDIuNDM4bDEuMDgzLDMuNTIzbDAuMjQ0LDAuNzcxbC0wLjk4MiwyLjA3bC0yLjIxNy0wLjY2M2wtMy45MDktMTEuNDkxbC0yLjU4Mi0wLjY2NGwtMS40OTIsMi4wMzFsMC40MDksMi4xMzZsMi41MTQsMS45MDFsLTQuOTYsNS4wMjFsMC42MjUsNC42MTVsNi44NSwxLjc5NGwwLjc4OSwxLjYyMmwtMy4zODYsNC43NDRsMC40NDQsMS40MzJsOC41MzktMC40MDlsMC4yOCw0LjQyNWw2LjE5My0xLjk2M2w1Ljk5MywxLjc1MWwyLjQ0OS0wLjM4NGwwLjU4OC0xLjIybC0zLjUyOC01LjQ2OWwtMC4wODMtMS43NzNsMy4yMDMtNC43NjZsLTIuNDY1LTIuNjA1bDAuODQtMi42MDhsMS40NzgtMS44NThsNC4xNzEsMC4yMzZsNC42MzQtNS41NTVsLTIuMzM1LTEuOTAyTDM4OC44MTUsNjEzLjY2elxcXCIvPlxcblx0XFxuXHQ8cGF0aCBpZD1cXFwiZmxldmVzXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIGQ9XFxcIk0zMDQuNTM0LDEyMi4yODFjMC4zMzQtMC40NCwwLjU2NC0wLjk3OSwxLjAzMy0xLjNjMC44NTEtMS4wOTYsMS42MzEtMi4yNDcsMi41MjgtMy4zMDVjMC4zNDMtMC4zOTcsMC45ODMtMC43MjUsMS40NDgtMC4zMzZjMC4wOTQsMC4zNC0wLjYyOSwwLjYzOC0wLjE2MywwLjk4YzAuMTMyLDAuMjMzLDAuODQ1LDAuMTY3LDAuMzQ0LDAuMzIxYy0wLjQ2MiwwLjE4OS0wLjkzMywwLjQwNy0xLjI0MSwwLjgxNWMtMC45MzIsMC45NTUtMS40MTksMi4yMzItMS44MDEsMy40ODdjLTAuNTEsMC40MzEsMC41MTUsMS4xODQsMC42NzUsMC40NjJjMC4xNTEtMC4zMTgsMC43ODItMC4wODUsMC4zODksMC4yMDNjLTAuMzgsMC40NTgtMC4zNTgsMS4xMTYsMC4xMTYsMS40NzJjMC4yMDgsMC40OTgtMC4zNzIsMC43NzEtMC43NTksMC41MzRjLTAuNjU0LTAuMDgxLTAuOTg2LDAuNTU3LTEuNDg3LDAuODE4Yy0wLjU5NiwwLjM1NC0xLjA1Ni0wLjI1OC0xLjU2My0wLjQ2NmMtMC40MDMtMC4xNTItMC42OTEtMC42ODctMC4xMjgtMC44MzVjMC4zNjgtMC4xMDYsMC4yMzQtMC42MzQtMC4xNDYtMC4zODZjLTAuNTI2LDAuMjQ1LTEuMjE1LDAuMTUyLTEuNTQzLDAuNjYyYy0wLjU0MywwLjM3OC0wLjU2My0wLjM5NC0wLjMyNi0wLjcwMWMwLjM2Mi0wLjY0NiwxLjA2Mi0wLjk3OSwxLjU2Ny0xLjQ5NUMzMDMuODI3LDEyMi44OTcsMzA0LjE3MywxMjIuNTc5LDMwNC41MzQsMTIyLjI4MUwzMDQuNTM0LDEyMi4yODF6IE0yODMuNzAxLDEzOC45MDZjMS4wNDQtMC43OTIsMi4wODctMS41ODMsMy4xMzEtMi4zNzVjMC4xOTItMC4yODIsMC44NzUtMC41NzYsMC45NTItMC4wOGMwLjA3OSwwLjI5LDAuMzI1LDAuNjg0LDAuNjc3LDAuNTM3YzAuMTIzLTAuMjIsMC42NjcsMC4wMzgsMC4yODYsMC4xMjVjLTAuMzMzLDAuMTc3LTAuODcsMC4zNDItMC44NCwwLjgwOGMwLjAzMSwwLjQwNiwwLjIyOSwwLjc3LDAuMzcxLDEuMTQ0Yy0wLjI5OCwwLjUxMSwwLjEyNCwxLjEyMS0wLjE1LDEuNjM4Yy0wLjE0MiwwLjM4NS0wLjE0MiwwLjg2NC0wLjQ4OCwxLjE0Yy0wLjQyMywwLjEzLTAuOTM4LTAuMTctMS4yOTcsMC4xNzZjLTAuMzk4LDAuMjU5LTAuNzk4LTAuMTI4LTEuMTg0LTAuMjE0Yy0wLjUyMi0wLjEzNy0xLjA3LTAuMTEyLTEuNTk5LTAuMDMxYy0wLjM1Ni0wLjIzNC0wLjgzMS0wLjEzNS0xLjEyOSwwLjA1Yy0wLjQ3Ny0wLjExMy0wLjUzMywwLjQ4MS0wLjc4MiwwLjcxMmMtMC4wOTMtMC4xNTgsMC4xMzEtMC41MDMsMC4yMzgtMC42OTdjMC4xNDQtMC4yNDMsMC4zNjktMC40MjMsMC41MzYtMC42NDRjMC4xNjUtMC4zODIsMC4zNjItMC44MjUsMC44Mi0wLjljMC40MDMtMC4yMTIsMC4yMjUtMC43MzUsMC4xLTAuOTk1QzI4My40MzYsMTM5LjE0NCwyODMuNjI5LDEzOS4wNzYsMjgzLjcwMSwxMzguOTA2TDI4My43MDEsMTM4LjkwNnogTTI5Ny41NSw4My44OTZjMC43NDYsMC4yNzcsMS40OTIsMC41NTUsMi4yMzcsMC44MzJjMC4xNTksMS4yNzksMS45MzIsMC40NDUsMi4xNjIsMS43MjRjMC42MTIsMC44NjcsMS45MTksMC4wNzEsMi44MDEsMC40OThjMS4wNjEsMC4xMzYsMS40NzgsMS4xNTgsMi4wODMsMS44OTJjMC42NzksMC44OTQsMS4zNjIsMS43ODYsMS45NjksMi43MzFjMS4yMzctMC43MDMsMS41NDIsMC41NjgsMi4wOTQsMS40MjVjMS4yMjksMC45MTYsMi40ODIsMS44MDIsMy43ODgsMi42MDVjMC42ODUsMC44NjUsMS4wNywxLjc4LDIuMzU0LDEuNTA5YzAuOTEzLTAuMTg5LDEuNzEtMC42NjgsMi42ODEtMC4xOThjMS4wMDYtMC4xMzYsMi4wNzItMC4zOTQsMi4xMzItMS41MzdjMS4xOCwwLjI3OCwyLjE1OC0wLjA2OCwyLjk2NC0wLjk1N2MxLjE5Ni0wLjIzNiwxLjMyNi0xLjM0OSwxLjk0Ny0yLjE1YzAuNDM0LTAuMiwwLjkwNy0wLjMxNSwxLjM0OS0wLjUwNSBNMzE1LjY0Myw5Ni45NDdjLTAuMzYzLDAuOTc3LTAuODA2LDEuOTYyLTEuNTY0LDIuNjk5Yy0wLjQzMywwLjgxMSwwLjMyLDIuMjAzLTAuOTA4LDIuNTI0Yy0wLjc5MiwwLjIxLTEuMTc2LDAuODU3LTEuMzMzLDEuNjE5Yy0wLjA3NCwwLjkwMi0xLjI1OSwwLjc3OS0xLjU0MiwxLjQ5NWMtMC4yNDIsMC42MzMtMC40ODQsMS4yNjYtMC43MjYsMS44OThjMC4zODksMC44NDUsMC40NDksMS45NjItMC41NjYsMi4zNTRjLTAuNTM5LDAuODYxLTAuMTQ4LDEuOTM3LTAuMTMyLDIuODdjMC4yNzksMC43OTIsMS4yNTEsMS4xNCwxLjQyMSwxLjk3N2MtMC4xNDQsMC45ODYtMS4zOTMsMS4yNDUtMS44LDIuMDkxYy0wLjEwNCwwLjIxMy0wLjE0MywwLjQ1NC0wLjEzNywwLjY4OSBNMzAxLjQ1LDEyNS4yODhjLTEuNjcsMS43NDktMy4xOTcsMy42MjUtNC43OTYsNS40MzhjLTAuNzQ4LDAuMjE0LTEuNzA4LDAuMDU5LTIuMjMsMC43NjFjLTAuNDA5LDAuMzQtMC43MDcsMC44NTMtMS4xOTQsMS4wNzNjLTAuNzU1LDAuMTk5LTEuNTEsMC4zOTgtMi4yNjUsMC41OTdjLTAuNjIzLDEuMjM3LTEuMjY3LDIuNDcyLTIuMDgyLDMuNTk2Yy0wLjE1OCwwLjA2LTAuMzE3LDAuMTE5LTAuNDc2LDAuMTc5IE0yODEuMzExLDE0My4wNzJjLTAuNzE3LDAuODg0LTEuNzg0LDEuNDA1LTIuODc1LDEuNjZjLTAuNTMyLDAuNDAxLDAuMTU4LDEuMjUtMC40NjMsMS42NTVjLTAuNjQyLDAuODcyLTEuNDY1LDEuNjI1LTIuNDUxLDIuMDgxYy0xLjEzMywwLjgxLTIuMjA2LDEuNzkxLTIuNzksMy4wOGMtMC4yMjksMC4zOTUtMC40NTgsMC43OTEtMC42OTEsMS4xODQgTTE3OC4wODgsMzE2LjY5NGwtMC44NjEsMC43NjFsLTAuMzMxLTAuNDJsLTAuNDAxLTAuMDJsLTAuNzMzLTAuNDQxbC0xLjExNC0wLjgyOGwtMC40MDItMC4wMjFsLTEuMTU0LTAuMDZsLTAuNzUzLTAuMDU3bC0wLjM4Mi0wLjQybC0xLjExNS0wLjgxMmwtMS4wOTctMC44NzhsLTEuMTE1LTAuODExbC0yLjIwOS0yLjA0bDAuODUtMS41MTJsMC43OTQtMC43MTFsMC45LTEuNTEybDMuMjIxLTIuNTI3bDEuNjE2LTEuMDcxbDEuOTg1LTEuMDM1bC0wLjMxMi0wLjc3MWwtMS4wOTUtMS4yMjlsLTAuNzY3LTAuNDQxbC0xLjEzNC0wLjQ3OGwtMC4zODItMC4zNzFsLTEuMTcyLTAuMDYxbC0xLjQ0OS0wLjg5N2wtMC40MDEtMC4wMjFsLTAuNzEzLTAuNzkxbC0xLjExNC0wLjg3OGwtMS4xMzYtMC40MTFsLTEuMTM1LTAuNDYxbC0wLjc4Mi0wLjQ1OGwtMS41NTctMC4wODFsLTAuNzE0LTAuODA4bDAuODMtMS4wOTVsMC4wMjEtMC40MTdsMC4wNC0wLjc1MWwwLjQyMi0wLjM2NGwwLjQyMi0wLjMzbDAuNDIyLTAuMzhsLTAuMzQ1LTAuNzcxbC0wLjM4Mi0wLjQzOGwtMC40MDEtMC4wMmwtMC43MzMtMC40NGwtMC40MDEtMC4wMmwtMS4xNTQtMC4wNzdsLTAuMzMyLTAuMzdsLTAuNDAxLTAuMDIxbC0wLjc3MywwLjMxMWwtMC40MTgtMC4wMjFsLTAuMzgyLTAuMzcxbC0wLjcxNy0wLjQ1N2wwLjAyMS0wLjRsLTAuMzQyLTEuMTcybC0wLjI5MS0xLjE3MWwwLjAzNy0wLjRsMC4wMi0wLjM1MWwwLjM3MS0wLjM4MWwwLjQyMi0wLjM4bDIuMDA1LTEuNDAybDAuODQ0LTAuNzQ0bDEuNjQ1LTIuMjIzbDAuNDAxLDAuMDJsMS4xNTUsMC4wNmwxLjE1NCwwLjA3N2wwLjAyLTAuNDAxbDAuMDIxLTAuMzVsMS4yMzEtMS4wOTFsMC40MDIsMC4wMmwwLjQ0MS0wLjc4MWwwLjgxMS0wLjcxMWwwLjQyMi0wLjM2M2wwLjM5Mi0wLjczMWwwLjQyMi0wLjM4bDAuNzcyLTAuMzExbDAuNDAyLDAuMDJsMC40MDEsMC4wMmwwLjM4OS0wLjM4bDAuMDM5LTAuNzUxbDAuNDQyLTAuNzgxbDAuNDU5LTAuNzNsMC4zMzgtMC4zNDhsMC4wNjctMC4wMTZsMC44NS0xLjQ5NmwtMC4zMDgtMS4xNzFsLTAuMzQ1LTAuODA1bDAuMDItMC4zODRsMC4wNjEtMS4xNTJsMC4wNTgtMC43NjhsMC4wNC0wLjc2OGwtMC4zNjUtMC40MmwtMC4zODUtMC4wMmwtMC40MDUsMC4zNjRsLTAuMzg1LTAuMDJsLTAuMzQ1LTAuNzg4bC0wLjM4NS0wLjAybDAuMDItMC4zODRsLTAuNzQ5LTAuNDRsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAybC0wLjgwNywwLjM0NGwtMC4zNDktMC40MDRsLTAuNDAxLTAuMDM3bC0wLjc3LTAuMDRsLTAuMzg2LTAuMDIxbC0wLjQwNCwwLjM2NGwtMC4zODYtMC4wMjFsLTAuNDA0LDAuMzY0bC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMzdsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwwLjAyLTAuMzg0bC0wLjM4NS0wLjAyMWwwLjAyLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM2NC0wLjQybDAuMzg1LDAuMDM3bC0wLjM2NS0wLjQybC0wLjM0NS0wLjc4OGwtMC43NDktMC40MjRsLTAuMzg2LTAuMDJsLTAuMzY0LTAuNDIxbC0wLjM0NS0wLjc4OGwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDAuMDM2LTAuMzg0bC0wLjM2NC0wLjQwNGwwLjAyLTAuMzg0bC0wLjM2NC0wLjQyMWwwLjQyNS0wLjc0OGwtMC4zNjUtMC40MDRsMS4xMzUsMC40NmwxLjE5MS0wLjMyM2wwLjAyMS0wLjM4NGwwLjgzLTEuMTExbC0xLjQ5OS0wLjg2NWwwLjA0LTAuNzY4bDAuMDM2LTAuMzg0bDMuMjE3LTIuMTQzbDIuNDI3LTEuNzgybDAuMDQtMC43NjhsMC40MjItMC4zNjRsMC40ODUtMS45MTZsMC4wMjEtMC4zODRsMC40NDEtMC43NDhsMC4xNTctMi42ODdsMi44MzItMi4xNjNsMC4zODYsMC4wMmwxLjE1NCwwLjA3N2wwLjM4NSwwLjAybDAuNzUsMC40MjRsMC4zODUsMC4wMmwxLjE3MiwwLjA3N2wwLjc1LDAuNDI0bDAuMzg1LDAuMDIxbDEuNTQsMC4wOTdsMC4zODUsMC4wMmwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDAuMTM3LTIuMzJsLTAuMzQ1LTAuNzg4bDEuNTc3LTAuMzAzbDAuMzg1LDAuMDJsMC43NywwLjA1N2wwLjM2NSwwLjQwNGwwLjM2NSwwLjQwNGwxLjkwNCwwLjUwMWwxLjU1NywwLjA4MWwwLjM2NCwwLjQybDAuNzUsMC40MjRsMC4zODUsMC4wMmwxLjU2MS0wLjMwNGwwLjc0OSwwLjQ0bDAuMzQ2LDAuNzg4bDIuOTc5LDIuMDk3bDAuNzUsMC40NGwwLjc1LDAuNDI0bDEuNTIsMC40OGwxLjUyLDAuNDY0bDEuMTcyLDAuMDc3bDEuMTk0LTAuNzA4bDEuMTM1LDAuNDQ0bDAuNzcxLDAuMDU3bDAuODQ3LTEuMTExbDAuNzktMC4zNDRsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4zODYsMC4wMmwwLjc0OSwwLjQ0MWwtMS4wMzctMS45OTdsLTAuNzEtMS4yMDhsLTAuMzQ1LTAuNzg4bDAuODA3LTAuMzQ0bDEuNTgtMC42NzFsMC40MDUtMC4zNjRsMS4xOTEtMC4zMjN2LTAuMDE3bDEuOTg1LTEuMDM0bDIuMDAyLTEuMDM1bDEuNTk3LTAuNjg4bDAuNzI5LDAuODI1bDAuNzcsMC4wNGwyLjMxLDAuMTM3bDEuMTcyLDAuMDYxbDAuMzY1LDAuNDA0bDAuNzEzLDAuODI1bDMuMDU2LDAuOTQ1bDEuMTM1LDAuNDQ0bDMuODEsMS4wMDFsMi4zMjYsMC4xMzdsMS4xNTUsMC4wNmwwLjc3LDAuMDQxbDEuOTIyLDAuNTAxbDAuNzcsMC4wNGwyLjI4OSwwLjUyMWwxLjE1NSwwLjA2bC0wLjAyLDAuMzg0bDIuMzA2LDAuNTIxbDEuNTQsMC4wOTdsMC43OS0wLjM0NGwwLjQwNS0wLjM2NGwxLjIzMS0xLjA5MWwxLjYxNy0xLjA3MWwwLjgxLTAuNzExbDAuODExLTAuNzI4bDAuNDIyLTAuMzYzbDAuNDA0LTAuMzY0bDIuMDIyLTEuNDM1bDAuMzg1LDAuMDJsMC44MTEtMC43MjhsMC44MjYtMC43MjhsMi4zNTEtMC42M2wxLjU3Ni0wLjMwNGwxLjExNCwwLjg0NWwwLjc3MSwwLjA0bDEuNTM5LDAuMDk3bDAuMzg2LDAuMDJsMC4wMzYtMC4zODRsLTAuNjg5LTEuNTkybC0wLjE0Ni00LjI2bDAuMDItMC4zODRsLTAuNTcyLTMuNTEybC0wLjU1Mi0zLjg5NmwtMC41OTItMy4xMjhsMC4wMi0wLjM4NGwwLjAzNy0wLjM4NGwtMC44NzctNS4wNjdsMC4zODUsMC4wMjFsMS42NTctMS44MzlsLTAuMjg4LTEuNTcybC0xLjQzOS0ybC0xLjA3NC0xLjYxMmwwLjk2OC0zLjQzMmwwLjkwNy0yLjI2M2wxLjE5MS0wLjMyM2wwLjg4OC0xLjg3OWwwLjg1MS0xLjQ5NWwwLjg0Ny0xLjExMmwxLjU2LTAuMjg3bDAuODY3LTEuNDk2bDIuMzEsMC4xMjFsMC44MjctMC43MTFsMC40NDUtMS4xNDhsMC40NjItMS4xMzFsMC40MDUtMC4zNjRsMC4wMi0wLjM4NGwwLjQyNi0wLjc0OGwwLjQyMS0wLjM2NGwwLjAyMS0wLjM4NGwwLjc5LTAuMzQ0bDAuNDA1LTAuMzY0bDAuMDItMC4zODRsMC40MjItMC4zNjRsMC4zODUsMC4wMzdsMC4zODUsMC4wMjFsMC44MzEtMS4xMTJsMC44MjYtMC43MjhsMC40MDUtMC4zNjRsMC40MDUtMC4zNjRsMC40MDUtMC4zNjRsMC44MDctMC4zNDRsMC43OS0wLjM0NGwwLjc3LDAuMDU3bDAuNzktMC4zNDRsMC43NSwwLjQyNGwwLjM4NSwwLjAybDAuNzg3LDAuMDRsMC4zODUsMC4wMzdsMC40NDUtMS4xNDhsMi43NzEtMC45OTVsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDEzLjI0Ni03Ljc0OWwwLjQwNC0wLjM2NGwwLjAyMS0wLjM4NGwtMC4zODUtMC4wMmwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDJsLTAuMzY1LTAuNDIxbC0wLjM0NS0wLjc4OGwtMC4zNjQtMC40MDRsLTAuNzUtMC40MjRsMC4wMi0wLjM4NGwtMC4zMjctMC44MDRsLTAuMzY1LTAuNDA0bDAuMDItMC4zODRsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDM3bDAuMDItMC4zODRsLTAuMzg1LTAuMDIxbC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMmwtMC4zNjQtMC40MDRsLTAuMzg2LTAuMDJsLTAuNDAxLTAuMDM3bC0wLjM0OC0wLjQwNGwtMC40MDItMC4wMmwtMC4zODUtMC4wMmwwLjAyMS0wLjM4NGwwLjAzNi0wLjM4NGwwLjc5LTAuMzQ0bDAuMDIxLTAuMzg0bDAuNDI1LTAuNzQ4bDAuODA3LTAuMzQzbDAuNDI2LTAuNzQ4bDAuMDItMC4zODRsMC44NDgtMS4xMTFsMC4wNC0wLjc2OGwwLjQwNC0wLjM2NGwwLjAyMS0wLjM4NGwwLjAyMS0wLjM4NGwwLjQ4MS0xLjUzMmwwLjQwNS0wLjM0N2wwLjQwNS0wLjM2NGwwLjQyMi0wLjM2M2wwLjAyLTAuMzg0bDAuMDIxLTAuNGwwLjQwNC0wLjM0N2wwLjQwNS0wLjM2NGwwLjAyMS0wLjQwMWwwLjQ0MS0wLjc0OGwwLjgxMS0wLjcxMWwwLjc5LTAuMzQ0bC0wLjY1Mi0xLjk3NmwtMC43MS0xLjE5MmwyLjA0Mi0xLjgxOWwwLjM2NCwwLjQwNGwwLjczLDAuODA4bDAuNzQ5LDAuNDRsMC4zNjUsMC40MDRsLTAuMDIsMC4zODRsMC4zODUsMC4wMmwtMC4wMjEsMC4zODRsLTAuMDIsMC4zODRsMC4zODUsMC4wMmwwLjM2NCwwLjQyMWwtMC4wMiwwLjM4NGwtMC4wMzcsMC4zODRsMC40MDIsMC4wMjFsMC4zODUsMC4wMmwwLjc1LDAuNDI0bC0wLjAyMSwwLjRsMC42OTIsMS4xOTJsLTAuMDIsMC4zODRsLTAuMDIxLDAuMzg0bC0wLjAyLDAuMzg0bDAuMzg1LDAuMDIxbC0wLjAyLDAuMzg0bDAuMzg1LDAuMDM3bDAuMzY0LDAuNDA0bDAuNzcxLDAuMDRsMC4zODUsMC4wMmwxLjE3NS0wLjMwN2wyLjM0Ny0wLjI2M2wwLjQ4MS0xLjUxNWwwLjM4NSwwLjAybDEuNTgtMC42NzFsMC4zODUsMC4wMmwwLjgwOC0wLjM0NGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC44My0xLjExMWwwLjQyMi0wLjM2NGwwLjQyNS0wLjc0OGwwLjQwNS0wLjM2NGwwLjc5LTAuMzQ0bDAuNDIyLTAuMzYzbDAuNzktMC4zMjdsMi4wMDItMS4wNTFsMS42OTctMi42MDdsMC40NDUtMS4xMzFsMC40NDEtMC43NDhsMS4xOTUtMC43MDhsMC43NSwwLjQyNGwxLjE5MS0wLjMwN2wxLjU4LTAuNjg4bDAuNDYyLTEuMTMxbDEuNjAxLTEuMDcxbDAuNDIxLTAuMzY0bDEuMjM1LTEuNDc2bDAuMzg2LDAuMDIxbDAuNDQxLTAuNzQ4bDEuNi0xLjA1NWwyLjA0My0xLjgxOWwwLjgwNy0wLjM0NGwwLjQyNS0wLjc0OGwwLjA2MS0xLjE1MmwwLjQ2Mi0xLjEzMWwwLjc5LTAuMzQ0bDAuODI3LTAuNzI4bDEuNTYtMC4zMDRsMi4xMDMtMi45NzFsMS41NTcsMC4wOTdsMS4yMTUtMS4wOTFsMC44NDctMS4xMTFsMC43NzEsMC4wNGwxLjU5Ni0wLjY3MWwwLjQyNi0wLjc0OGwyLjgxMi0xLjc3OWwwLjg0OC0xLjExMWwwLjgxLTAuNzI4bDAuMDIxLTAuMzg0bDIuNDI3LTEuNzgybDEuMTkxLTAuMzI0bDAuNDI1LTAuNzQ4bDUuMDk5LTAuODc0bDEuOTI1LDAuMTE3bDEuOTQ0LTAuMjg0bDIuNjkxLDAuNTQybDAuNzcsMC4wNTdsMS4wNzksMS41OTZsMS4xOTQtMC42OTFsMS4yMTItMC43MDhsMS4xOTUtMC43MDhsMC40NjItMS4xMzFsMi4zMy0wLjI0N2wzLjE3Ny0xLjM3NWwyLjI4NiwwLjkwNWwxLjk4NC0xLjAzNWwxLjI3Mi0xLjg1OWwwLjc3LDAuMDRsMS41OTgtMC42ODdsMS4xNzUtMC4zMDdsNC4zODgtMi4wNjZsMi4zODctMS4wMzFsMy4xNTctMC45NzVsMC43NywwLjA0bDEuMjMyLTEuMDkxbDAuNzktMC4zMjdsMS41NzktMC42ODhsMC40MjItMC4zNjRsMS4yMTYtMS4wOTFsMi4zNDctMC4yNDdsMi4xNTEsMi44MjRsNC4wMzQsNC4wOTNsMC43MjksMC44MjVsMS40NTksMS42MzJsMi44ODIsMy42MzJsMS4yMTItMC42OWwwLjQyNS0wLjc0OGwyLjAyMi0xLjQzNWwyLjM4Ny0xLjAzMWwyLjQyNy0xLjc4MmwyLjAyMS0xLjQzNmwwLjM2NSwwLjQwNGwwLjcyOSwwLjgyNGwxLjEzNSwwLjQ0NGwxLjA5NSwxLjIyOWwxLjExNCwwLjgyOGwwLjc5LTAuMzI3bDAuMzg1LDAuMDJsMS4xNTUsMC4wNmwxLjg0NSwxLjY1MmwxLjExNCwwLjg0NWwxLjY1Ny0xLjgzOWwwLjg4Ny0xLjg3OWwwLjA2MS0xLjE2OGwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bC0wLjM2NS0wLjQwNGwwLjAzNy0wLjM4NGwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjQ0Mi0wLjc0OGwwLjAyLTAuMzg0bDAuMDQxLTAuNzg1bDAuMDYxLTEuMTUxbDAuMzg1LDAuMDJsMC4wMzYtMC4zODRsMC4wNDEtMC43NjhsLTAuMzY1LTAuNDA0bC0wLjM0NS0wLjc4OGwtMC4yNDgtMi4zNGwwLjQ4Ni0xLjg5OWwtMC42MTMtMi43NDRsLTAuMjY4LTEuOTU2bDAuNDA1LTAuMzY0bDAuMzg1LDAuMDM3bDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC4zODUsMC4wMmwwLjQyMi0wLjM2NGwwLjM4NSwwLjAybDAuMDQtMC43NjhsMC40MDUtMC4zNjRsMi42MzUsMS4zMDlsMC40MDUtMC4zNjRsMC44NjYtMS40OTVsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjQ2Mi0xLjEzMWwwLjAyMS0wLjM4NGwwLjM4NSwwLjAybDAuNzcxLDAuMDRsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuMDIxLTAuMzg0bDAuNDAxLDAuMDJsMC40MDUtMC4zNjRsMC40MjUtMC43NDhsMC40MjUtMC43NDhsMC40MjItMC4zNjNsMC44My0xLjExMmwxLjIxMi0wLjY5bDAuODMtMS4xMTJsMC4wMjEtMC40bDEuMjUyLTEuNDU4bDAuNDA1LTAuMzY0bDAuMDItMC40bDAuODI3LTAuNzExbDAuNzktMC4zNDRsMS4yNzEtMS44NTlsMC44NDgtMS4xMTFsMC43OS0wLjM0NGwxLjU4LTAuNjg4bDAuODA3LTAuMzQzIE00ODAuODg4LDExNS44MjRsLTIuMTM5LDAuNTU5bC0yLjc2MiwwLjU2MmwtMC43Ny0wLjA1M2wtMC4zODQtMC4wMjdsLTAuNDI4LDAuMzU2bC0wLjAyNywwLjM4NGwtMC40MTEsMC4zNTZsLTAuNDExLDAuMzU3bC0wLjc5NiwwLjMzbC0wLjc4NS0wLjA3bC0wLjAyNywwLjM4M2wtMC43OTYsMC4zM2wtMi44MTUsMS4zNDZsLTEuMTgsMC4yODZsLTEuNjA5LDAuNjU5bC0wLjQxMSwwLjM1N2wtMi40ODQsMi4xNGwtMC44NCwwLjcxM2wtMC4wMjYsMC4zODRsMS4wNzMsMS4yM2wwLjM1NywwLjQxMWwyLjEwMywyLjg3OGwxLjQ1NywxLjI3NGwtMC40MzgsMC43NGwtMC43NjktMC4wN2wtMS42MDksMC42NTlsLTEuNjE4LDEuMDQzbC0wLjgxMiwwLjMyOWwtMS4yMDcsMC42N2wtMC44MzksMC43MTNsLTAuODIzLDAuNzEzbC0xLjI1MSwxLjA2OWwtMC44MjIsMC43MTNsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMS4yNTEsMS4wN2wtMS4yNTEsMS4wNTNsLTAuODQ5LDEuMDk3bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4M2wtMC40MTIsMC4zNTdsLTAuMDU0LDAuNzg0bC0wLjg2NiwxLjA5NmwtMC4wMjYsMC4zODRsLTAuNDM4LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjA0NCwwLjM4M2wtMC41MTksMS44OTFsLTAuMDI2LDAuMzg0bDAuMjg3LDEuMTkzbC0wLjA1NCwwLjc2N2wtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bC0wLjQ1NSwwLjczOWwtMC44MjIsMC43MTRsLTAuNDM4LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjQyOSwwLjM1NmwtMC4wMjYsMC4zODRsLTAuMDI2LDAuMzgzbC0wLjg1LDEuMDk3bC0wLjQyOSwwLjM1NmwtMC4wNTMsMC43NjdsLTAuNDY1LDEuMTI0bC0wLjM4NS0wLjAyN2wtMC40MjksMC4zNTZsLTEuMTgsMC4zMDNsLTAuNDEyLDAuMzU2bC0wLjM4NC0wLjAyNmwtMC44MzksMC42OTZsLTAuODIzLDAuNzE0bC0wLjQzOCwwLjc0bC0wLjQyOCwwLjM1NmwtMC4wNTQsMC43NjdsLTAuMDU0LDAuNzg0bC0wLjA5NywxLjE1bC0wLjAyNywwLjM4M2wtMC40OTEsMS41MDdsLTAuNDI5LDAuMzU2bC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuODIyLDAuNzEzbC0wLjgxMiwwLjMzbC0wLjQxMSwwLjM1N2wtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC40MTEsMC4zNTdsLTAuODk0LDEuNDc5bC0xLjUxMS0wLjUwN2wtMi42NTQtMC45NzJsLTEuODk2LTAuNTE4bC0wLjc2OS0wLjA3bDAuMDI3LTAuMzgzbC0xLjIzNCwxLjA3bC0zLjI3MSwyLjA4NWwtMi40MzEsMS4zNTZsLTMuMjgxLDIuNDdsLTIuNDc0LDEuNzM5bC0xLjk3NywwLjYzM2wtMS4yNTEsMS4wNjlsLTEuNTY0LDAuMjZsLTAuNDExLDAuMzU3bC0wLjgxMiwwLjMzbC0wLjg1LDEuMDk3bC0xLjM1OCwyLjYwNGwtMC4wNDMsMC4zODNsMC4zNTcsMC40MTFsLTAuMDI2LDAuMzgzbC0wLjAyNywwLjRsMC43NDIsMC40MzdsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC40ODEsMS4xMjNsLTAuMDU0LDAuNzY3bC0wLjQ2NiwxLjE0bC0wLjA0MywwLjM4M2wxLjc2MiwyLjQ1MWwtMC4wMjcsMC4zODRsMS4zNzcsMi40MjVsMC42OTksMC44MmwtMC44MjMsMC43MTNsLTEuMjA3LDAuNjg3bC0xLjIyNCwwLjY4N2wtMS4yMDcsMC42N2wtMC44MTIsMC4zMjlsLTAuMDI2LDAuMzg0bDAuNjg4LDEuMjIxbDAuMzU4LDAuNDFsLTAuMDk4LDEuMTVsLTAuNDM4LDAuNzRsLTEuMjUxLDEuMDdsLTAuNDM4LDAuNzRsLTAuNDkxLDEuNTA3bC0wLjA0NCwwLjM4M2wtMC4wMjcsMC40bC0wLjAyNiwwLjM4NGwtMC43OTYsMC4zMTNsMC4zNTcsMC40MjdsLTAuMzg0LTAuMDI3bC0xLjY2MiwxLjQxbC0wLjUwOSwxLjUyM2wtMC40MTEsMC4zNGwtMC45MiwxLjg4bC0wLjg1LDEuMDk3bC0xLjcxNiwyLjE5M2wtMC44MzksMC42OTZsLTAuNzk2LDAuMzNsLTAuMzg1LTAuMDI2bC0wLjc5NiwwLjMzbC0wLjMzMS0wLjc5M2wtMC4wOTgsMS4xNWwtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzg0bC0wLjQ2NSwxLjEyNGwtMC40NTUsMC43NGwtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0wLjg0LDAuNzEzbC0wLjc5NiwwLjMzbC0wLjgyMiwwLjcxM2wtMC42ODgtMS4yMjFsMC43OTYtMC4zMTNsLTAuMzU3LTAuNDI3bDEuNjA3LTAuNjQzbC0wLjI3Ni0xLjU3OGwtMC43Ny0wLjA1M2wtMS41OTIsMC42NmwwLjM0MSwwLjQxbC0xLjYxOCwxLjA0M2wtMC43OTUsMC4zMTNsLTQuMDg2LTIuNjI5bC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuMzU3LTAuNDFsLTAuMDI3LDAuMzg0bC0wLjc5NiwwLjMzbC0wLjAyNiwwLjM4NGwtMC4zODUtMC4wMjdsLTAuODEyLDAuMzNsMC4wMjctMC4zODRsMC4zODQsMC4wMjdsLTAuNzQxLTAuNDU0bC0wLjY5OS0wLjgybC0xLjEtMC44NjRsLTAuNzE2LTAuODIxbC0xLjQ1Ny0xLjI3NGwtMC43MTYtMC44MjFsLTEuMS0wLjg2NGwtMC43MTYtMC44MmwtMC42NjEtMS42MDRsLTAuMjg3LTEuMTc3bC0wLjY2Mi0xLjYwNGwtMC43MTUtMC44MjFsLTEuNjM2LDEuMDQzbC0xLjk0OSwwLjIzM2wtMS4yMjQsMC42ODZsLTAuODUsMS4wOTdsLTEuMTk3LDAuMzAzbC0wLjQxMSwwLjM1NmwtMS4yMDcsMC42N2wtMC44NCwwLjcxM2wtMC4zODQtMC4wMjdsLTAuNDEyLDAuMzU3bC0wLjM4NC0wLjAyN2wtMC40MzgsMC43NGwtMC43NDItMC40MzdsLTAuMzU3LTAuNDI3bC0wLjM4NS0wLjAyN2wtMC4zNTctMC40MWwtMC4zNTgtMC40MWwtMC4zODQtMC4wMjdsLTAuMDI3LDAuMzgzbC0wLjA3LDAuNzY3bC0wLjQxMSwwLjM1NmwtMC44MjIsMC43MTNsLTAuNDU1LDAuNzRsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC43OTYsMC4zM2wtMC40MjgsMC4zNTZsLTAuMzg1LTAuMDI3bDAuNzE2LDAuODJsLTAuODc2LDEuNDhsMC42NDUsMS42MDRsLTAuMDI2LDAuMzg0bC0wLjc0Mi0wLjQ1NGwtMC44MjMsMC43MTNsMC43MTYsMC44MzdsMC4zNTcsMC40MWwtMS4xOTcsMC4zMDNsLTEuNTY0LDAuMjZsLTAuNzctMC4wNTNsLTAuNzg1LTAuMDU0bDEuMDQ2LDEuNjE0bC0wLjgyMiwwLjcxM2wtMS43NDIsMi41NzdsLTAuNDgyLDEuMTI0bDAuMzU3LDAuNDI3bC0wLjM4NC0wLjA0M2wwLjM1NywwLjQyN2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzgzbC0wLjA0MywwLjM4M2wtMC44MjMsMC43MTNsMC43MTYsMC44MmwtMC44NjYsMS4wOTdsLTAuODUsMS4wOTdsLTAuNzQyLTAuNDM3bC0wLjQ1NSwwLjc0bC0xLjg2OC0wLjkxN2wtMC4zNTgtMC40MWwtMC40MTEsMC4zNTZsLTAuMzMtMC44MWwtMC43OTYsMC4zM2wtMC43OTYsMC4zM2wtMC4zODUtMC4wMjdsLTAuODEyLDAuMzNsLTAuNzE2LTAuODM3bC0yLjg0MiwxLjcyOWwtMC4zNTgtMC40MWwtMC4zNTctMC40MjdsLTAuNzE1LTAuODIxbC0wLjM0Mi0wLjQxbC0xLjA3Mi0xLjI0OGwtMC43MTYtMC44MmwtMC43MTUtMC44MzdsLTAuNzctMC4wNTNsLTEuMTUzLTAuMDgxbC0xLjE5NywwLjI4NmwtMC4zODQtMC4wMjdsLTAuMzg1LTAuMDI3bC0xLjUzOC0wLjEwN2wtMS4xOTcsMC4yODZsLTAuNzk2LDAuMzNsLTEuMjA3LDAuNjg3bDAuMzE0LDAuNzkzbC0xLjIwNywwLjY4N2wtMC44NCwwLjcxM2wtMC4wMjYsMC4zODRsLTAuMDU0LDAuNzY3bC0wLjM4NS0wLjAyNmwtMC4wMjYsMC4zODNsLTEuMjI1LDAuNjg2bC0wLjQzOCwwLjc0bC0wLjgyMywwLjcxM2wtMi4xMTYsMi4xNjdsLTAuMzg1LTAuMDQ0bC0yLjA3MywxLjc4M2wtMC44MjIsMC43MTNsLTAuNzk2LDAuMzNsLTAuNDI5LDAuMzU2bC0wLjM4NS0wLjAyNmwtMi40MDMsMC45NzNsMS40MDMsMi4wNDFsMC4zNTgsMC40MWwwLjI3NiwxLjU3OGwtMC4wMjYsMC4zODNsLTEuNTU1LTAuMTI0bC0wLjc2OS0wLjA1NGwtMC43Ny0wLjA1NGwtMS45MjItMC4xNWwtMC40MDEtMC4wMjdsLTEuMTU0LTAuMDhsLTEuNTM3LTAuMTI0bC0wLjA1NCwwLjc2N2wtMC4xMjQsMS41NWwwLjE1MywzLjA5NGwtMC4wMjUsNS40MjhsLTAuMTA2LDEuNTM0bDAuMzA0LDEuMTc3bDEuMTUzLDAuMDk3bC0wLjA1NCwwLjc2N2wtMS4yNSwxLjA3bDAuNzE1LDAuODJsMC43NDIsMC40NTRsMS40ODQsMC44NzRsLTEuNjA4LDAuNjZsLTQuNDA3LDEuOTg5bDEuNTQsNS4xNTFsMi44MDksNC4wNjZsMC4zODQsMC4wNDNsMS42OTEsMy4yMThsMC40MTEtMC4zNTZsMC4wNDQtMC4zODNsMC4wNTQtMC43NjdsMC4wNTQtMC43ODNsMC4wMjctMC4zODRsMC4zODQsMC4wNDNsMC4zODUsMC4wMjdsMC4zODQsMC4wMjdsMC4zNTgsMC40MWwtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bDAuMzg1LDAuMDI2bDAuNDU1LTAuNzM5bDAuNDExLTAuMzU3bDAuNDM4LTAuNzRsMC40MTEtMC4zNTZsMC4wMjctMC4zODRsMC40MDEsMC4wMjdsMC4wMjYtMC4zODNsMC4zNTcsMC40MWwtMC4wNDQsMC4zOTlsLTAuMDI2LDAuMzg0bDAuNzg2LDAuMDU0bDAuMzg1LDAuMDI3bC0wLjA0NCwwLjM4M2wwLjQwMSwwLjAyN2wtMC4wNDQsMC4zODNsLTAuMDU0LDAuNzY3bDAuMzg1LDAuMDQzbDAuNzQyLDAuNDM3bDAuMzg1LDAuMDI3bDEuMTcsMC4wODFsMC4zODUsMC4wNDRsMC4wNTQtMC43ODRsMC43OTUtMC4zMTNsMC4wMjctMC4zODNsMC4zODUsMC4wMjdsMC4zNTcsMC40MWwtMC40MTEsMC4zNTZsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4NGwtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bDAuMzg1LDAuMDI3bDAuNDExLTAuMzU3bDAuMzg1LDAuMDI3bDAuMzA0LDEuMTk0bDAuMzg0LDAuMDI3bDAuMzg1LDAuMDI2bDAuMzg1LDAuMDI3bDAuMzg1LDAuMDI3bC0wLjU5LDIuNjc0bC0wLjkxOSwxLjg2M2wwLjgxMi0wLjMyOWwwLjM0MSwwLjQxbDAuMzU3LDAuNDFsMC43MTYsMC44MzdsMS4wMiwxLjk5OGwwLjcxNSwwLjgzN2wwLjY0NiwxLjU4N2wwLjI3NiwxLjU3N2wxLjE1NCwwLjA4MWwtMC4wMjcsMC4zODNsLTAuMjA0LDIuNzAxbC0wLjc3LTAuMDUzbDAuNTExLDMuNTIxbC0zLjA5My0wLjIzMWwtMS4xOCwwLjI4N2wtMS45NDksMC4yNWwtMC4zODUtMC4wMjdsMC4yODcsMS4xNzdsLTAuMDI2LDAuMzgzbC0wLjAyNywwLjM4NGwwLjMzMSwwLjc5M2wwLjMyNiw2LjYzOWwtNC43MDksNS44NCBNNTc1LjMsNDAxLjAyNGwtMC4zODYtMC4wMjFsLTEuMTU0LTAuMDYzbC00LjkzNS0xLjg0OGwtOC4zMTYtMy4yMDdsLTAuMzYzLTAuNDIybC0zLjgwMi0xLjM4M2wtMS41MTgtMC40ODZsLTIuMjY2LTAuOTEybC04LjY5Ny0zLjYxM2wtNi4wMDgtMy4wOGwtMy43NDEtMi4xNjZsLTEuNDk3LTAuODU0bDEuMjQtMS40NzFsNS4xMzYtNy44MDNsLTcuNzgxLTUuODlsLTAuNzI4LTAuODI3bC0wLjM0Mi0wLjc4OWwtMC42ODgtMS4xOTNsLTAuNzA1LTEuMjExbC0xLjA0OC0ybC0xLjAwOS0yLjM4NWwwLjA0My0wLjc2OGwtMC4zNDItMC43ODlsMC4yMS0zLjQ3MWwtMC43OTIsMC4zNDJsLTAuNzQ4LTAuNDI4bC0wLjcyNy0wLjgyNmwtMC4zODUtMC4wMjFsLTEuNTQtMC4wODZsLTEuOTgzLDAuNjQ0bC0wLjc5MSwwLjM0MWwtMC43OTIsMC4zNDJsLTQuMjUtMC4yN2wtMy4zMzUtMi41MTJsMC4wMjEtMC4zODVsMC4wNDMtMC43NjhsLTAuMzg1LTAuMDM3bDAuMDIxLTAuMzg1bDAuNDY2LTEuMTI5bDAuMDQzLTAuNzY4bDAuMDQzLTAuNzY4bC0wLjM0My0wLjc4OWwtMC43NDgtMC40NDNsLTAuODM0LDEuMTA3bC0xLjQ3NS0xLjIzNmwtMS4xMzQtMC40NjVsLTAuMzQyLTAuNzg5bDEuMjM1LTEuMDg3bC0yLjkyOS0yLjg5MmwtMS42MiwxLjA2NmwtMC43Ny0wLjA0M2wtMC4zNjMtMC40MDZsLTAuMzQzLTAuODA1bC0xLjExMS0wLjgzMmwtMi44NCwyLjEzNmwxLjQzMywyLjAyMWwtMC45MTUsMi4yNmwtMC4zNjMtMC40MDVsLTAuMzYzLTAuNDA0bC0wLjM2NC0wLjQwNmwtMS43OTUtMi40MjZsLTAuMzg1LTAuMDIxbC0wLjM2My0wLjQyMmwtMC4zNjQtMC40MDZsLTEuNDc1LTEuMjUzbDAuNDIzLTAuMzYybDAuODEyLTAuNzA4bC0wLjM2My0wLjQyMmwtMC4zNjMtMC40MDVsLTAuMzYzLTAuNDA1bC0wLjM4NS0wLjAyMWwtMC44MTMsMC43MjVsLTEuMTcxLTAuMDgxbC0xLjU2MSwwLjI5OWwwLjA2NC0xLjE1MmwwLjAyMS0wLjM4M2wtMC4yNjEtMS45NTdsLTAuNzctMC4wNDNsLTEuNTM5LTAuMTAzbC0wLjQwMS0wLjAyMWwtMi44OTEtMy4yNzRsLTIuNjUxLTAuOTM2bC00LjE0NC0yLjE3MWwtMC4zODUtMC4wMzhsLTEuOTAyLTAuNDlsLTAuNzctMC4wNjFsLTAuMzg2LTAuMDIxbC0wLjM2My0wLjQwNWwtMC43OTEsMC4zNDFsLTAuNDIzLDAuMzYybC0wLjM4NS0wLjAyMWwtMC44MTIsMC43MjVsLTEuMTkzLDAuMzAzbC0wLjM4NS0wLjAyMWwwLjc0OCwwLjQ0M2wtMC4wMjEsMC4zODVsLTAuODU1LDEuNDkybC0wLjQ0NCwwLjc0NmwtMS4zNDMsMy4wMDZsLTAuNDQ5LDEuMTNsLTAuNDQ0LDAuNzQ2bC0wLjgzNCwxLjEwOGwtMC4wMjEsMC4zODRsLTAuNDIzLDAuMzYybC0wLjQwNiwwLjM2MmwtMC4wMjEsMC4zODRsLTAuNDg3LDEuNTE0bC0wLjQyOCwwLjc0NmwtMC4wMjEsMC4zODVsLTAuMDIxLDAuNGw2LjE4Myw2LjU1NWwwLjM2MywwLjQwNGwxLjQ3NiwxLjI1NGwxLjQ1MywxLjYzOWwxLjA5MSwxLjIxNWwxLjA3MywxLjIzMmwyLjIyNCwxLjY4bC0wLjQ3MSwxLjUxNWwtMC40NDQsMC43NDVsLTAuODM1LDEuMTA5bC0xLjExMS0wLjgzMmwtMC43OTEsMC4zNDJsLTEuMjM2LDEuMDg2bC0xLjUxOC0wLjQ4NmwtMi42My0xLjMxN2wtMS41MTgtMC40ODZsLTIuMjYyLTEuMjk2bC0zLjQ0Mi0wLjU5NGwtMC43Ny0wLjA0M2wtMC4zNjMtMC40MjJsLTEuOTItMC40OTFsLTIuOTg1LDQuNDU2bC0wLjgxMiwwLjcyNWwtMC40MjgsMC43NDZsLTEuNzQ0LDIuOTg0bC0wLjAyMSwwLjM4NWwtMC4wMjEsMC4zODNsLTEuMjc4LDEuODU1bC0xLjI3OCwxLjg1NGwtMS43MDcsMi42MDJsLTAuNDQ5LDEuMTNsLTAuNDIzLDAuMzYybC0wLjAyMSwwLjM4NGwtMC44MTIsMC43MjZsLTAuNDA2LDAuMzYxbC0wLjQ2NiwxLjEzMWwtMS40NzYtMS4yNTRsLTIuMjIzLTEuNjgxbC0xLjY0MywxLjQ0OWwtMS42MjUsMS40NWwtMi40MTIsMS40MDZsLTMuMjIsMS43M2wtMy4xNTksMC45NjNsLTAuMzg2LTAuMDIxbC0xLjExMS0wLjg0OGwtMy4xNiwwLjk4bC0xLjQ3NS0xLjI1NGwtMS44MzktMS42NmwtMi45MDQsMy4zMDVsLTIuMDQ4LDEuODEybC0yLjA2OSwyLjE3OWwtMC4zNjMtMC40MDVsLTEuNTM1LTAuNDdsLTAuMzYzLTAuNDIybC0wLjM4NS0wLjAyMWwtMS4xMzQtMC40NDhsLTAuNjg4LTEuMjExbC0yLjQxMiwxLjQwNmwtMC44MjksMC43MjVsLTIuNDMzLDEuNzc0bC0zLjQ1OS0wLjU5NGwtMC43NDktMC40MjdsLTEuNTE4LTAuNDg2bC0xLjEzNC0wLjQ0N2wtMy44NjUtMC4yNDhsLTMuNDQyLTAuNTkzbC0xLjk4MywwLjY2bC0xLjg5LTcuMDg3bC0wLjE1My0zLjg3NmwwLjAyMS0wLjM4NGwwLjUwOS0xLjg5N2wyLjM0OC0wLjIzOGwwLjc3LDAuMDQybDAuNzcxLDAuMDQzbDAuNDA2LTAuMzYxbDIuNDMzLTEuNzc0bDAuNDQ0LTAuNzQ2bDEuNzUtMy4zODZsMS43ODctMy43NTJsLTAuNzctMC4wNDNsLTEuNDk3LTAuODY5bC0xLjkxOS0wLjUwOGwtMy4wMzYtMC45NTVsMi4xMTItMi45NjRsLTAuNzQ4LTAuNDI3bC0wLjM2My0wLjQwNWwtMS43NzktMi40MjdsMC44MzQtMS4xMDhsMC40ODctMS41M2wwLjgzNC0xLjEwOGwwLjg5NS0xLjg3NmwxLjMtMi4yMzhsMS4zMjEtMi42MjNsLTEuMTExLTAuODMybC00LjA4NC0yLjk1NWwtMC43MS0wLjgyNmwtMS4xNDktMC40NDlsLTEuMTM0LTAuNDY1bC0wLjc0OC0wLjQyNmwtMy4wNTgtMC41NzJsLTEuMTMzLTAuNDY1bC0wLjc3LTAuMDQzbC0wLjc0OS0wLjQyNmwtMS4xNDktMC40NjVsLTEuNTE5LTAuNDdsLTEuMjE5LDEuMDdsLTEuMjM1LDEuMDg3bC0xLjY2MywxLjgzNGwtMi4yODgtMC41MjlsMC4zMDQsMS4xODlsLTAuNDcxLDEuNTE0bC0wLjQwNiwwLjM2MmwtMS4yNzgsMS44NTRsLTAuNzcxLTAuMDQzbC0xLjE5MiwwLjMwM2wtMC4zODUtMC4wMjFsLTEuMjM1LDEuMDg4bC0xLjU4MywwLjY4MmwtMi4yODctMC41MjlsLTEuNDc2LTEuMjU0bC0xLjE5MiwwLjMybC0wLjMwNC0xLjE4OWwtMC4zNjMtMC40MDZsLTAuMzg2LTAuMDIxbC0wLjc4Ni0wLjA0M2wtMC43Ny0wLjA0MmwtMC40MDYsMC4zNDZsLTAuNDQ5LDEuMTQ2bC0wLjQwMS0wLjAzOGwtMS4xNzcsMC4zMTlsLTAuMzg1LTAuMDIxbC0wLjM2My0wLjQwNmwtMC4zNjMtMC40MDRsLTAuNzI3LTAuODI4bC0wLjcyOC0wLjgxMWwtMS41MzktMC4xMDJsLTAuNDA2LDAuMzYybC0wLjM2My0wLjQwNWwtMi4yODgtMC41MjlsLTAuNzg2LTAuMDQzbC0xLjE3NywwLjMybC0xLjg1OS0xLjI3NWwtMC4zODUtMC4wMjFsLTEuODE3LTIuMDQzbC0xLjkwMi0wLjUwOGwtMS44ODItMC44OTFsLTAuMzg1LTAuMDIxbC0xLjg4Mi0wLjg5MmwtMS41MzQtMC40ODZsLTIuMjQ1LTEuMjk3bDAuNDQ0LTAuNzQ1bC0wLjM2My0wLjQwNmwtMi45NzItMi4xMDZsLTEuODYtMS4yNzVsLTUuMTk0LTMuODA0bC0yLjI0NS0xLjI5N2wtMC43MjctMC44MTFsLTIuMjI0LTEuNjhsLTYuMDQ2LTIuNjk2bC0wLjgxMiwwLjcyNWwtMS4xNzYsMC4zMmwtMS4yMzYsMS4wODdsLTMuMjYyLDIuNDk5bC0xLjYyNiwxLjQ0OWwtMC44MDgsMC4zNDFsLTEuMjE5LDEuMDg3bC0xLjEzMy0wLjQ2NWwtMi45MjEsMy4zMDVsMC4zNjMsMC40MDVsLTMuMjAzLDEuNzQ3bDEuMTEyLDAuODMybC0xLjI3OSwxLjg1NWwtMC40MjMsMC4zNjFsLTEuNjA0LDEuMDY2bC0wLjc0OC0wLjQyN2wtNC45NjksNS4wOTlsLTEuMzIyLDIuNjIzbC0wLjg1MSwxLjEwOGwtMC40NDksMS4xM2wtMC40NDQsMC43NDZsLTAuODM0LDEuMTA5bC0wLjg1MSwxLjEwN2wtMC40MjgsMC43NDZsLTAuODczLDEuNTFsLTYuNDA1LDMuNDYxbC0xLjE5MywwLjMybC0xLjk2NywwLjY2bC0wLjQwNiwwLjM0NmwtMS45NjMsMC4yNzdsLTIuMzMsMC4yMzhsLTAuNDAyLTAuMDIxIE01NTIuNTk1LDE3OC4yNTVsLTAuMTI5LTEuNTYybDAuMDQ4LDIuNzEybC0wLjQ1NCwwLjc0bC0wLjQzOCwwLjc0bC0wLjQxMSwwLjM1NmwtMC40ODEsMS4xMjRsLTAuMTA3LDEuNTM0bC0wLjA3MSwwLjc4M2wtMC4xMzQsMS45MTdsLTAuMDcsMC43NjdsLTAuMDUzLDAuNzY3bC0wLjAyNywwLjM4M2wtMC40MzgsMC43NGwtMS43NDMsMi41NzdsLTAuMDcsMC43ODNsLTAuNDM4LDAuNzRsLTAuNTA4LDEuNTA3bC0wLjA1NCwwLjc2N2wtMC44NSwxLjA5N2wtMC4wNDQsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjQ2NSwxLjEyNGwtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzgzbDAuMzg1LDAuMDI3bDAuNjcyLDEuMjJsLTAuNDM4LDAuNzRsLTAuMDgsMS4xNWwwLjM4NSwwLjAyN2wtMC44NCwwLjcxM2w0LjU1LDEuNTA1bC0wLjAyNiwwLjM4NGwwLjY3MiwxLjIybDEuMDIsMS45OThsMS4yNzctMS40NTNsMC44NS0xLjA5N2wyLjgzNSwzLjY5OWwxLjA3MiwxLjI0OGwzLjIwMiwzLjcyNmwtMi45MjIsMi44NjNsLTIuNTI4LDIuNTIzbC0yLjkyMywyLjg4bC0wLjAyNywwLjM4NGwtMS42MzUsMS4wNDJsLTAuNDEyLDAuMzU3bC0zLjI3LDIuMDY5bC0xLjQ1OC0xLjI3NGwtMC43NDItMC40MzdsLTEuODE0LTEuNjg1bC00LjA2OS0yLjYyOWwtMi44OTgtMi41MzJsLTAuMDcsMC43NjdsLTAuOTIsMS44NjNsLTAuNDM4LDAuNzRsLTAuNDY1LDEuMTI0bC0wLjAyNiwwLjM4NGwtMC4wNDQsMC4zODNsLTAuMTM0LDEuOTM0bC0wLjQxMSwwLjM1N2wtMC4wNDQsMC4zODNsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC4zODQtMC4wMjZsLTMuMTc0LDAuOTE5bC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4NGwtMC4wNDQsMC4zODNsMC4zMzEsMC43OTRsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC4wMjYsMC4zODNsLTAuMDcxLDAuNzgzbC0wLjQxMSwwLjM1N2wtMC4wMjYsMC4zODNsLTAuNDExLDAuMzU3bC0wLjQxMiwwLjM1NmwtMi4wNzIsMS43NjdsLTAuNDI5LDAuMzU2bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0wLjQ4MiwxLjEyM2wtMC4wMjYsMC4zODRsLTAuNDY1LDEuMTI0bC0wLjc0Mi0wLjQzN2wtMy43ODItMS40MzZsLTIuNTkyLDMuNjc0bC0zLjA5LDQuNzk2bC0yLjUzOCwyLjkwN2wtMC45NzQsMi42M2wtMS43MTYsMi4xOTNsLTAuNTA5LDEuNTA3bC0wLjQxMSwwLjM1NmwtMS4zMzEsMi4yMmwxLjQ1OCwxLjI3NGwtMC40MzgsMC43NGwwLjY3MiwxLjIwM2wtMC4wMjYsMC4zODRsLTAuNDM4LDAuNzU3bC0wLjAyNywwLjM4M2wtMC40MTEsMC4zNTdsLTAuNDgxLDEuMTIzbDAuNzY5LDAuMDU0bDEuMTAxLDAuODQ3bDEuNTExLDAuNTA3bC0xLjkwMSw5LjkyMmwtMC4wOTcsMS4xNWwtMC4wNTQsMC43NjdsMC4zMzEsMC43OTNsLTEuMzMxLDIuMjM3bC0xLjU2NSwwLjI2bC0xLjE5NywwLjMwM2wtMi44MTQsMS4zMjlsLTAuMTA4LDEuNTUxbC0wLjA3LDAuNzY3bC0wLjAyNiwwLjM4M2wwLjM1NywwLjQxbDAuMzU4LDAuNDExbDEuMTI2LDAuNDhsMC4zODUsMC4wMjdsMC43NywwLjA1M2wwLjM1NywwLjQxbDAuNzQyLDAuNDU0bDAuNzE1LDAuODJsLTAuMDI2LDAuMzgzbDAuNzE2LDAuODIxbDAuMzU3LDAuNDI3bC0wLjAyNywwLjM4NGwtMC4wMjYsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4M2wtMC44MTMsMC4zM2wtMC4zODQtMC4wMjdsLTAuMDI3LDAuMzg0bC0wLjM4NC0wLjA0M2wtMC40MTEsMC4zNTZsLTAuNDExLDAuMzU3bC0wLjA0NCwwLjM4M2wtMC4zODUtMC4wMjZsLTAuMDI2LDAuMzgzbC0wLjM4NS0wLjAyN2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjAyNiwwLjM4M2wwLjM4NSwwLjAyN2wtMC4wMjcsMC40bDAuMzU3LDAuNDFsMC4yODgsMS4xNzdsLTAuMDI3LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjQwMS0wLjAyN2wtMC40MzgsMC43NGwtMC43OTYsMC4zM2wtMC40MTEsMC4zNTdsLTAuNDU1LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjQzOCwwLjc0bC0wLjQxMSwwLjM1N2wtMC44MTIsMC4zM2wtMC40MTEsMC4zNTZsMC42ODgsMS4yMDRsMC43NDIsMC40NTRsLTAuMDI3LDAuMzgzbDEuNDMyLDEuNjQxbDEuNjEsNC4zODVsMC4zMTQsMC43OTNsMS45NDEsNS4xNzlsLTAuODUsMS4wOTdsMi4xMjksMi40NzhsLTAuNDExLDAuMzU2bC00LjYzMS0wLjMzOGwtMS42MzUsMS4wMjZsLTAuNDExLDAuMzU2bC0xLjIzNCwxLjA3bC0wLjgzOSwwLjcxM2wtMS4yMzQsMS4wN2wtMC40MjgsMC4zNTZsLTAuNDM4LDAuNzRsLTAuNzk2LDAuMzNsLTEuNDg0LTAuODkxbC0wLjc0Mi0wLjQzOGwtMS40ODQtMC44OTFsLTAuNzE2LTAuODJsLTAuNzY5LTAuMDdsLTAuNTA5LDEuNTIzbC0yLjgxMiw2LjM1NmwtMS4xMzEsMi43ODcgTTIzNC41OTIsMjM5LjU0bC0wLjA1OCwwLjc3bC0wLjExNiwxLjUzOWwtMS4yMTYsMC42ODNsLTEuMjE1LDAuNjgzbC0xLjYwMiwwLjY1M2wtMS4yMTUsMC42ODNsLTEuNjMxLDEuMDM5bC0yLjAxNiwxLjAwOWwtMC44MywwLjcxMmwtMi4wMTYsMS4wMDlsLTAuNDE1LDAuMzU2bC0xLjIxNSwwLjY4M2wtMC40MTUsMC4zNTVsLTAuNDE1LDAuMzU2bC0wLjQxNSwwLjM1NmwtMS4xODYsMC4yOThsLTEuMjE2LDAuNjgzbC0wLjgwMSwwLjMyN2wtMC40MTQsMC4zNTZsMC4zMjcsMC43OThsMC4zNTcsMC40MTRsMC4yOTksMS4xODRsMC4zNTYsMC40MTRsMC4zNTYsMC40MTRsMC43NDMsMC40NDNsMC4zNTYsMC40MTRsLTAuMDI4LDAuMzg1bC0wLjA4NywxLjE1NGwwLjMyNywwLjc5OGwtMC4wMjgsMC4zODVsMS4wNywxLjI0MWwwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsLTAuMDI5LDAuMzg1bDAuMjk5LDEuMTg0bDAuMzg2LDAuMDI5bDAuMzU3LDAuNDE0bDAuMzU2LDAuNDE0bDAuMzg2LDAuMDI5bC0wLjA1OCwwLjc3bC0wLjA1OCwwLjc3bDAuMzg2LDAuMDI5bC0wLjAyOSwwLjM4NWwwLjM1NywwLjQxNGwwLjMyNywwLjc5OGwwLjMyOCwwLjc5OWwwLjM1NiwwLjQxNGwwLjM1NywwLjQxNGwwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsMC4zMjcsMC43OThsLTAuNDczLDEuMTI1bDAuMjcxLDEuNTY4bC0wLjAyOSwwLjM4NWwwLjM1NiwwLjQxNGwwLjM1NywwLjQxNGwwLjM4NiwwLjAyOWwwLjcxNCwwLjgyN2wwLjM1NiwwLjQxNGwtMC4wNTksMC43N2wwLjM4NywwLjAyOWwwLjI5OSwxLjE4M2wtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bDAuNzEzLDAuODI4bDAuMzU3LDAuNDE0bC0wLjAyOSwwLjM4NWwwLjMyOCwwLjc5OGwtMC4wMjksMC4zODVsLTAuMDg3LDEuMTU0bC0wLjAyOCwwLjM4NWwtMC4wNTgsMC43N2wtMC4wNTksMC43N2wtMC40NDMsMC43NDFsLTAuNDE1LDAuMzU1bC0wLjA1OSwwLjc3bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI5LDAuMzg1bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bC0wLjQxNSwwLjM1NmwtMC4wMjksMC4zODVsMC4yOTksMS4xODNsLTAuMDU4LDAuNzdsMC44MjktMC43MTFsMS4xODctMC4yOThsMC44MDEtMC4zMjdsMC44MDEtMC4zMjdsMC40MTUtMC4zNTZsMC44LTAuMzI3bDAuMzg2LDAuMDI5bDAuNzQzLDAuNDQzbDEuNDU2LDEuMjdsMC4zODYsMC4wMjlsMS4xLDAuODU2bDAuNzQzLDAuNDQzbDAuNDczLTEuMTI1bDIuMzA2LTQuODU3bC0wLjMyOC0wLjc5OGwwLjc3MSwwLjA1OGwxLjIxNi0wLjY4M2wxLjU3Mi0wLjI2OWw4LjQyMS0zLjYyNGwxLjU3MS0wLjI2OWwwLjgwMS0wLjMyN2w0LjQxOC0xLjk5bDEuMTU3LDAuMDg3bDEuNTQ0LDAuMTE2bDMuNTAxLTAuMTI0bDMuMTE1LTAuMTUzbDMuODg3LTAuMDk1bDMuODg4LTAuMDk1bDIuNzI5LTAuMTgybDEuNTQzLDAuMTE2bDAuNzA1LTQuMjAzbDAuNDQzLTAuNzQxbDAuMDI5LTAuMzg1bDAuODAxLTAuMzI3bDEuMTg3LTAuMjk4bDEuMTg2LTAuMjk4bDEuOTg3LTAuNjI1bDIuMzczLTAuNTk2bDAuMzg2LDAuMDI5bDAuNDE1LTAuMzU1bDEuNTcyLTAuMjY5bDIuMDE2LTEuMDA5bDEuNjA0LTAuNzUzbDIuOTEyLDIuNTQxXFxcIi8+XFxuXFxuXHQ8ZyBpZD1cXFwiZm9vdHN0ZXBzXFxcIj5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1tYXRlb1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hdGVvLWJlbHVnYVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImJlbHVnYS1pc2FtdVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImlzYW11LWNhcGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiY2FwYXMtcGVsb3Rhc1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInBlbG90YXMtbWFydGFcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXJ0YS1rb2JhcmFoXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwia29iYXJhaC1kdWJcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJkdWItcGFyYWRpc2VcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJyZXR1cm4tdG8tYmVnaW5cXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuXHQ8ZyBpZD1cXFwibWFwLWRvdHNcXFwiIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDc4LjAwMDAwMCwgMTQwLjAwMDAwMClcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZGVpYVxcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMTMyLjUsMjZjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMTMwLjU2NywyNiwxMzIuNSwyNnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwibWF0ZW9cXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTE0OS41LDhjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVMxNTEuNDMzLDEsMTQ5LjUsMWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMxNDcuNTY3LDgsMTQ5LjUsOHpcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiZXMtdHJlbmNcXFwiPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJpc2FtdVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTMyOC41LDMyMGMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMzMjYuNTY3LDMyMCwzMjguNSwzMjB6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImJlbHVnYVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTM0Ni41LDM0N2MxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMzNDQuNTY3LDM0NywzNDYuNSwzNDd6XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImFyZWxsdWZcXFwiPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJjYXBhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNDMuNSwyMzNjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTNDEuNTY3LDIzMyw0My41LDIzM3pcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwicGVsb3Rhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNTAuNSwyMTJjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTNDguNTY3LDIxMiw1MC41LDIxMnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwibWFydGFcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTU3LjUsMTg2YzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVjMC0xLjkzMy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNUM1NCwxODQuNDM0LDU1LjU2NywxODYsNTcuNSwxODZ6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImtvYmFyYWhcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTI5LjUsMTk1YzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ni0zLjUsMy41UzI3LjU2NywxOTUsMjkuNSwxOTV6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMjkuNSwxNzJjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMjcuNTY3LDE3MiwyOS41LDE3MnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwicGFyYWRpc2VcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTQuNSwxODNjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVM2LjQzMywxNzYsNC41LDE3NmMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMyLjU2NywxODMsNC41LDE4M3pcXFwiLz5cXG5cdFx0PC9nPlxcblx0PC9nPlxcblxcbjwvc3ZnPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBpZD0ncGFnZXMtY29udGFpbmVyJz5cXG5cdDxkaXYgaWQ9J3BhZ2UtYSc+PC9kaXY+XFxuXHQ8ZGl2IGlkPSdwYWdlLWInPjwvZGl2PlxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwibWFwLXdyYXBwZXJcXFwiPlxcblx0XFxuPC9kaXY+XHRcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG4gICAgXHRcbmNsYXNzIEdsb2JhbEV2ZW50cyB7XG5cdGluaXQoKSB7XG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRBcHBBY3Rpb25zLndpbmRvd1Jlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdsb2JhbEV2ZW50c1xuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5jbGFzcyBQcmVsb2FkZXIgIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpXG5cdFx0dGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIHRoaXMub25NYW5pZmVzdExvYWRDb21wbGV0ZWQsIHRoaXMpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSB1bmRlZmluZWRcblx0XHR0aGlzLmFsbE1hbmlmZXN0cyA9IFtdXG5cdH1cblx0bG9hZChtYW5pZmVzdCwgb25Mb2FkZWQpIHtcblxuXHRcdGlmKHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG0gPSB0aGlzLmFsbE1hbmlmZXN0c1tpXVxuXHRcdFx0XHRpZihtLmxlbmd0aCA9PSBtYW5pZmVzdC5sZW5ndGggJiYgbVswXS5pZCA9PSBtYW5pZmVzdFswXS5pZCAmJiBtW20ubGVuZ3RoLTFdLmlkID09IG1hbmlmZXN0W21hbmlmZXN0Lmxlbmd0aC0xXS5pZCkge1xuXHRcdFx0XHRcdG9uTG9hZGVkKClcdFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzLnB1c2gobWFuaWZlc3QpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSBvbkxvYWRlZFxuICAgICAgICB0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChtYW5pZmVzdClcblx0fVxuXHRvbk1hbmlmZXN0TG9hZENvbXBsZXRlZCgpIHtcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjaygpXG5cdH1cblx0Z2V0Q29udGVudEJ5SWQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZS5nZXRSZXN1bHQoaWQpXG5cdH1cblx0Z2V0SW1hZ2VVUkwoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDb250ZW50QnlJZChpZCkuZ2V0QXR0cmlidXRlKFwic3JjXCIpXG5cdH1cblx0Z2V0SW1hZ2VTaXplKGlkKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnRCeUlkKGlkKVxuXHRcdHJldHVybiB7IHdpZHRoOiBjb250ZW50LndpZHRoLCBoZWlnaHQ6IGNvbnRlbnQuaGVpZ2h0IH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkZXJcbiIsImltcG9ydCBoYXNoZXIgZnJvbSAnaGFzaGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBjcm9zc3JvYWRzIGZyb20gJ2Nyb3Nzcm9hZHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmNsYXNzIFJvdXRlciB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5yb3V0aW5nID0gZGF0YS5yb3V0aW5nXG5cdFx0dGhpcy5zZXR1cFJvdXRlcygpXG5cdFx0dGhpcy5maXJzdFBhc3MgPSB0cnVlXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIub2xkSGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5pbml0aWFsaXplZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHRoYXNoZXIuY2hhbmdlZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLnNldHVwQ3Jvc3Nyb2FkcygpXG5cdH1cblx0YmVnaW5Sb3V0aW5nKCkge1xuXHRcdGhhc2hlci5pbml0KClcblx0fVxuXHRzZXR1cENyb3Nzcm9hZHMoKSB7XG5cdCBcdHZhciByb3V0ZXMgPSBoYXNoZXIucm91dGVzXG5cdCBcdGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdCBcdFx0dmFyIHJvdXRlID0gcm91dGVzW2ldXG5cdCBcdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZShyb3V0ZSwgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdCBcdH07XG5cdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZSgnJywgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0b25QYXJzZVVybCgpIHtcblx0XHR0aGlzLmFzc2lnblJvdXRlKClcblx0fVxuXHRvbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuc2VuZFRvRGVmYXVsdCgpXG5cdH1cblx0YXNzaWduUm91dGUoaWQpIHtcblx0XHR2YXIgaGFzaCA9IGhhc2hlci5nZXRIYXNoKClcblx0XHR2YXIgcGFydHMgPSB0aGlzLmdldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy51cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcnRzWzBdLCAocGFydHNbMV0gPT0gdW5kZWZpbmVkKSA/ICcnIDogcGFydHNbMV0pXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IHRydWVcblx0fVxuXHRnZXRVUkxQYXJ0cyh1cmwpIHtcblx0XHR2YXIgaGFzaCA9IHVybFxuXHRcdHJldHVybiBoYXNoLnNwbGl0KCcvJylcblx0fVxuXHR1cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdC8vIElmIGZpcnN0IHBhc3Mgc2VuZCB0aGUgYWN0aW9uIGZyb20gQXBwLmpzIHdoZW4gYWxsIGFzc2V0cyBhcmUgcmVhZHlcblx0XHRpZih0aGlzLmZpcnN0UGFzcykge1xuXHRcdFx0dGhpcy5maXJzdFBhc3MgPSBmYWxzZVxuXHRcdH1lbHNle1xuXHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdFx0fVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZShuZXdIYXNoLCBvbGRIYXNoKSB7XG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0Y3Jvc3Nyb2Fkcy5wYXJzZShuZXdIYXNoKVxuXHRcdGlmKHRoaXMubmV3SGFzaEZvdW5kZWQpIHJldHVyblxuXHRcdC8vIElmIFVSTCBkb24ndCBtYXRjaCBhIHBhdHRlcm4sIHNlbmQgdG8gZGVmYXVsdFxuXHRcdHRoaXMub25EZWZhdWx0VVJMSGFuZGxlcigpXG5cdH1cblx0c2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzZXR1cFJvdXRlcygpIHtcblx0XHRoYXNoZXIucm91dGVzID0gW11cblx0XHRoYXNoZXIuZGlwdHlxdWVSb3V0ZXMgPSBbXVxuXHRcdHZhciBpID0gMCwgaztcblx0XHRmb3IoayBpbiB0aGlzLnJvdXRpbmcpIHtcblx0XHRcdGhhc2hlci5yb3V0ZXNbaV0gPSBrXG5cdFx0XHRpZihrLmxlbmd0aCA+IDIpIGhhc2hlci5kaXB0eXF1ZVJvdXRlcy5wdXNoKGspXG5cdFx0XHRpKytcblx0XHR9XG5cdH1cblx0c3RhdGljIGdldEJhc2VVUkwoKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LlVSTC5zcGxpdChcIiNcIilbMF1cblx0fVxuXHRzdGF0aWMgZ2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmdldEhhc2goKVxuXHR9XG5cdHN0YXRpYyBnZXRSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5yb3V0ZXNcblx0fVxuXHRzdGF0aWMgZ2V0RGlwdHlxdWVSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5kaXB0eXF1ZVJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXROZXdIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIubmV3SGFzaFxuXHR9XG5cdHN0YXRpYyBnZXRPbGRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIub2xkSGFzaFxuXHR9XG5cdHN0YXRpYyBzZXRIYXNoKGhhc2gpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChoYXNoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlclxuIiwiaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIyfSBmcm9tICdldmVudGVtaXR0ZXIyJ1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuXG5mdW5jdGlvbiBfZ2V0Q29udGVudFNjb3BlKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHJldHVybiBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQoaGFzaE9iai5oYXNoKVxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNUb0xvYWQoKSB7XG4gICAgdmFyIHNjb3BlID0gX2dldENvbnRlbnRTY29wZSgpXG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIHR5cGUgPSBfZ2V0VHlwZU9mUGFnZSgpXG4gICAgdmFyIG1hbmlmZXN0O1xuXG4gICAgaWYodHlwZSAhPSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICB2YXIgZmlsZW5hbWVzID0gW1xuICAgICAgICAgICAgJ2NoYXJhY3Rlci5wbmcnLFxuICAgICAgICAgICAgJ2NoYXJhY3Rlci1iZy5qcGcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSB7XG4gICAgLy8gcmV0dXJuICdAJyArIF9nZXREZXZpY2VSYXRpbygpICsgJ3gnXG4gICAgcmV0dXJuICcnXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXREaXB0eXF1ZVNob2VzKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBiYXNldXJsID0gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0KVxuICAgIHJldHVybiBfZ2V0Q29udGVudFNjb3BlKCkuc2hvZXNcbn1cblxudmFyIEFwcFN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIGl0ZW0pIHtcbiAgICAgICAgdGhpcy5lbWl0KHR5cGUsIGl0ZW0pXG4gICAgfSxcbiAgICBwYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUNvbnRlbnQoKVxuICAgIH0sXG4gICAgYXBwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0QXBwRGF0YSgpXG4gICAgfSxcbiAgICBkZWZhdWx0Um91dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERlZmF1bHRSb3V0ZSgpXG4gICAgfSxcbiAgICBnbG9iYWxDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRHbG9iYWxDb250ZW50KClcbiAgICB9LFxuICAgIHBhZ2VBc3NldHNUb0xvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNUb0xvYWQoKVxuICAgIH0sXG4gICAgZ2V0Um91dGVQYXRoU2NvcGVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZCA9IGlkLmxlbmd0aCA8IDEgPyAnLycgOiBpZFxuICAgICAgICByZXR1cm4gZGF0YS5yb3V0aW5nW2lkXVxuICAgIH0sXG4gICAgYmFzZU1lZGlhUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5nZXRFbnZpcm9ubWVudCgpLnN0YXRpY1xuICAgIH0sXG4gICAgZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZDogZnVuY3Rpb24ocGFyZW50LCB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhcmVudCwgdGFyZ2V0KVxuICAgIH0sXG4gICAgZ2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwQ29uc3RhbnRzLkVOVklST05NRU5UU1tFTlZdXG4gICAgfSxcbiAgICBnZXRUeXBlT2ZQYWdlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0VHlwZU9mUGFnZShoYXNoKVxuICAgIH0sXG4gICAgZ2V0SG9tZVZpZGVvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydob21lLXZpZGVvcyddXG4gICAgfSxcbiAgICBnZW5lcmFsSW5mb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5jb250ZW50XG4gICAgfSxcbiAgICBkaXB0eXF1ZVNob2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREaXB0eXF1ZVNob2VzKClcbiAgICB9LFxuICAgIGdldE5leHREaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpKzEpID4gcm91dGVzLmxlbmd0aC0xID8gMCA6IChpKzEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpb3VzRGlwdHlxdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAoaS0xKSA8IDAgPyByb3V0ZXMubGVuZ3RoLTEgOiAoaS0xKVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaW5kZXhdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXREaXB0eXF1ZVBhZ2VJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQcmV2aWV3VXJsQnlIYXNoOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZGlwdHlxdWUvJyArIGhhc2ggKyAnL3ByZXZpZXcuZ2lmJ1xuICAgIH0sXG4gICAgbGFuZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWZhdWx0TGFuZyA9IHRydWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxhbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGFuZyA9IGRhdGEubGFuZ3NbaV1cbiAgICAgICAgICAgIGlmKGxhbmcgPT0gSlNfbGFuZykge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRMYW5nID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIChkZWZhdWx0TGFuZyA9PSB0cnVlKSA/ICdlbicgOiBKU19sYW5nXG4gICAgfSxcbiAgICBXaW5kb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3dpbmRvd1dpZHRoSGVpZ2h0KClcbiAgICB9LFxuICAgIGFkZFBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIuYWRkKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICByZW1vdmVQWENoaWxkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIEFwcFN0b3JlLlBYQ29udGFpbmVyLnJlbW92ZShpdGVtLmNoaWxkKVxuICAgIH0sXG4gICAgUGFyZW50OiB1bmRlZmluZWQsXG4gICAgQ2FudmFzOiB1bmRlZmluZWQsXG4gICAgT3JpZW50YXRpb246IEFwcENvbnN0YW50cy5MQU5EU0NBUEUsXG4gICAgRGV0ZWN0b3I6IHtcbiAgICAgICAgaXNNb2JpbGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb25cbiAgICAgICAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFOlxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy53ID0gYWN0aW9uLml0ZW0ud2luZG93V1xuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy5oID0gYWN0aW9uLml0ZW0ud2luZG93SFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLk9yaWVudGF0aW9uID0gKEFwcFN0b3JlLldpbmRvdy53ID4gQXBwU3RvcmUuV2luZG93LmgpID8gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSA6IEFwcENvbnN0YW50cy5QT1JUUkFJVFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoYWN0aW9uLmFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSwgYWN0aW9uLml0ZW0pIFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBBcHBTdG9yZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIFB4SGVscGVyID0ge1xuXG4gICAgZ2V0UFhWaWRlbzogZnVuY3Rpb24odXJsLCB3aWR0aCwgaGVpZ2h0LCB2YXJzKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21WaWRlbyh1cmwpXG4gICAgICAgIHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlLnNldEF0dHJpYnV0ZShcImxvb3BcIiwgdHJ1ZSlcbiAgICAgICAgdmFyIHZpZGVvU3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpXG4gICAgICAgIHZpZGVvU3ByaXRlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdmlkZW9TcHJpdGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHJldHVybiB2aWRlb1Nwcml0ZVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXI6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjaGlsZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0RnJhbWVJbWFnZXNBcnJheTogZnVuY3Rpb24oZnJhbWVzLCBiYXNldXJsLCBleHQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBiYXNldXJsICsgaSArICcuJyArIGV4dFxuICAgICAgICAgICAgYXJyYXlbaV0gPSB1cmxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFB4SGVscGVyIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBVdGlscyB7XG5cdHN0YXRpYyBOb3JtYWxpemVNb3VzZUNvb3JkcyhlLCBvYmpXcmFwcGVyKSB7XG5cdFx0dmFyIHBvc3ggPSAwO1xuXHRcdHZhciBwb3N5ID0gMDtcblx0XHRpZiAoIWUpIHZhciBlID0gd2luZG93LmV2ZW50O1xuXHRcdGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIFx0e1xuXHRcdFx0cG9zeCA9IGUucGFnZVg7XG5cdFx0XHRwb3N5ID0gZS5wYWdlWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG5cdFx0XHRwb3N5ID0gZS5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0XHRvYmpXcmFwcGVyLnggPSBwb3N4XG5cdFx0b2JqV3JhcHBlci55ID0gcG9zeVxuXHRcdHJldHVybiBvYmpXcmFwcGVyXG5cdH1cblx0c3RhdGljIFJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgY29udGVudFcsIGNvbnRlbnRILCBvcmllbnRhdGlvbikge1xuXHRcdHZhciBhc3BlY3RSYXRpbyA9IGNvbnRlbnRXIC8gY29udGVudEhcblx0XHRpZihvcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZihvcmllbnRhdGlvbiA9PSBBcHBDb25zdGFudHMuTEFORFNDQVBFKSB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dIIC8gY29udGVudEgpICogMVxuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dXIC8gd2luZG93SCkgPCBhc3BlY3RSYXRpbykgPyAod2luZG93SCAvIGNvbnRlbnRIKSAqIDEgOiAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHR9XG5cdFx0dmFyIG5ld1cgPSBjb250ZW50VyAqIHNjYWxlXG5cdFx0dmFyIG5ld0ggPSBjb250ZW50SCAqIHNjYWxlXG5cdFx0dmFyIGNzcyA9IHtcblx0XHRcdHdpZHRoOiBuZXdXLFxuXHRcdFx0aGVpZ2h0OiBuZXdILFxuXHRcdFx0bGVmdDogKHdpbmRvd1cgPj4gMSkgLSAobmV3VyA+PiAxKSxcblx0XHRcdHRvcDogKHdpbmRvd0ggPj4gMSkgLSAobmV3SCA+PiAxKSxcblx0XHRcdHNjYWxlOiBzY2FsZVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gY3NzXG5cdH1cblx0c3RhdGljIENhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcblx0ICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG5cdH1cblx0c3RhdGljIFN1cHBvcnRXZWJHTCgpIHtcblx0XHR0cnkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0XHRyZXR1cm4gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApICk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBEZXN0cm95VmlkZW8odmlkZW8pIHtcbiAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgdmlkZW8uc3JjID0gJyc7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZpZGVvLmNoaWxkTm9kZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIFx0Y2hpbGQuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIFx0Ly8gV29ya2luZyB3aXRoIGEgcG9seWZpbGwgb3IgdXNlIGpxdWVyeVxuICAgICAgICBcdGRvbS50cmVlLnJlbW92ZShjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgRGVzdHJveVZpZGVvVGV4dHVyZSh0ZXh0dXJlKSB7XG4gICAgXHR2YXIgdmlkZW8gPSB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZVxuICAgICAgICBVdGlscy5EZXN0cm95VmlkZW8odmlkZW8pXG4gICAgfVxuICAgIHN0YXRpYyBSYW5kKG1pbiwgbWF4LCBkZWNpbWFscykge1xuICAgICAgICB2YXIgcmFuZG9tTnVtID0gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluXG4gICAgICAgIGlmKGRlY2ltYWxzID09IHVuZGVmaW5lZCkge1xuICAgICAgICBcdHJldHVybiByYW5kb21OdW1cbiAgICAgICAgfWVsc2V7XG5cdCAgICAgICAgdmFyIGQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbHMpXG5cdCAgICAgICAgcmV0dXJuIH5+KChkICogcmFuZG9tTnVtKSArIDAuNSkgLyBkXG4gICAgICAgIH1cblx0fVxuXHRzdGF0aWMgR2V0SW1nVXJsSWQodXJsKSB7XG5cdFx0dmFyIHNwbGl0ID0gdXJsLnNwbGl0KCcvJylcblx0XHRyZXR1cm4gc3BsaXRbc3BsaXQubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0fVxuXHRzdGF0aWMgU3R5bGUoZGl2LCBzdHlsZSkge1xuICAgIFx0ZGl2LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1velRyYW5zZm9ybSAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1zVHJhbnNmb3JtICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm9UcmFuc2Zvcm0gICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLnRyYW5zZm9ybSAgICAgICA9IHN0eWxlXG4gICAgfVxuICAgIHN0YXRpYyBUcmFuc2xhdGUoZGl2LCB4LCB5LCB6KSB7XG4gICAgXHRpZiAoJ3dlYmtpdFRyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAnbW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdvVHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICd0cmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUpIHtcbiAgICBcdFx0VXRpbHMuU3R5bGUoZGl2LCAndHJhbnNsYXRlM2QoJyt4KydweCwnK3krJ3B4LCcreisncHgpJylcblx0XHR9ZWxzZXtcblx0XHRcdGRpdi5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuXHRcdFx0ZGl2LnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuXHRcdH1cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvKGl0ZW0sIHRvUG9zaXRpb24sIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1Bvc2l0aW9uLnggLSBpdGVtLnBvc2l0aW9uLnhcbiAgICBcdHZhciBkeSA9IHRvUG9zaXRpb24ueSAtIGl0ZW0ucG9zaXRpb24ueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9Qb3NpdGlvbi54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9Qb3NpdGlvbi55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHkueCArPSAodGFyZ2V0WCAtIGl0ZW0ucG9zaXRpb24ueCkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnkgKz0gKHRhcmdldFkgLSBpdGVtLnBvc2l0aW9uLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eS55ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG4gICAgfVxuICAgIHN0YXRpYyBTcHJpbmdUb1NjYWxlKGl0ZW0sIHRvU2NhbGUsIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1NjYWxlLnggLSBpdGVtLnNjYWxlLnhcbiAgICBcdHZhciBkeSA9IHRvU2NhbGUueSAtIGl0ZW0uc2NhbGUueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9TY2FsZS54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9TY2FsZS55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICs9ICh0YXJnZXRYIC0gaXRlbS5zY2FsZS54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS55ICs9ICh0YXJnZXRZIC0gaXRlbS5zY2FsZS55KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25JbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnXG59XG5cbi8vIERpc3BhdGNoZXJcbnZhciBQYWdlckRpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVBhZ2VyQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKGFjdGlvbilcblx0fVxufSlcblxuLy8gU3RvcmVcbnZhciBQYWdlclN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGZpcnN0UGFnZVRyYW5zaXRpb246IHRydWUsXG4gICAgcGFnZVRyYW5zaXRpb25TdGF0ZTogdW5kZWZpbmVkLCBcbiAgICBkaXNwYXRjaGVySW5kZXg6IFBhZ2VyRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBwYXlsb2FkLnR5cGVcbiAgICAgICAgdmFyIGl0ZW0gPSBwYXlsb2FkLml0ZW1cbiAgICAgICAgc3dpdGNoKGFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWTpcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTXG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlLCBpdGVtKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IGZhbHNlXG5cdFx0dGhpcy5jb21wb25lbnREaWRNb3VudCA9IHRoaXMuY29tcG9uZW50RGlkTW91bnQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdHJlbmRlcihjaGlsZElkLCBwYXJlbnRJZCwgdGVtcGxhdGUsIG9iamVjdCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbE1vdW50KClcblx0XHR0aGlzLmNoaWxkSWQgPSBjaGlsZElkXG5cdFx0dGhpcy5wYXJlbnRJZCA9IHBhcmVudElkXG5cdFx0XG5cdFx0aWYoZG9tLmlzRG9tKHBhcmVudElkKSkge1xuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnRJZFxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGlkID0gdGhpcy5wYXJlbnRJZC5pbmRleE9mKCcjJykgPiAtMSA/IHRoaXMucGFyZW50SWQuc3BsaXQoJyMnKVsxXSA6IHRoaXMucGFyZW50SWRcblx0XHRcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0fVxuXG5cdFx0aWYodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH1lbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHR2YXIgdCA9IHRlbXBsYXRlKG9iamVjdClcblx0XHRcdHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0XG5cdFx0fVxuXHRcdGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHNsdWcoY2hpbGRJZCkpXG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMucGFyZW50LCB0aGlzLmVsZW1lbnQpXG5cblx0XHRzZXRUaW1lb3V0KHRoaXMuY29tcG9uZW50RGlkTW91bnQsIDApXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRoaXMudGxPdXQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cblx0XHQvLyByZXNldFxuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMudGxJbi5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdHRoaXMudGxJbi50aW1lU2NhbGUoMS40KVxuXHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxJbi5wbGF5KDApLCA4MDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy50bE91dC5nZXRDaGlsZHJlbigpLmxlbmd0aCA8IDEpIHtcblx0XHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUpXG5cdFx0XHR0aGlzLnRsT3V0LnRpbWVTY2FsZSgxLjIpXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT50aGlzLnRsT3V0LnBsYXkoMCksIDUwMClcblx0XHR9XG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCksIDApXG5cdH1cblx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCksIDApXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGZvcmNlVW5tb3VudCgpIHtcblx0XHR0aGlzLnRsSW4ucGF1c2UoMClcblx0XHR0aGlzLnRsT3V0LnBhdXNlKDApXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5jbGVhcigpXG5cdFx0dGhpcy50bE91dC5jbGVhcigpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHMsIFBhZ2VyRGlzcGF0Y2hlcn0gZnJvbSAnUGFnZXInXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnUGFnZXNDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5jbGFzcyBCYXNlUGFnZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAncGFnZS1iJ1xuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4gPSB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluLmJpbmQodGhpcylcblx0XHR0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUgPSB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2ggPSB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoLmJpbmQodGhpcylcblx0XHR0aGlzLmNvbXBvbmVudHMgPSB7XG5cdFx0XHQnbmV3LWNvbXBvbmVudCc6IHVuZGVmaW5lZCxcblx0XHRcdCdvbGQtY29tcG9uZW50JzogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0Jhc2VQYWdlcicsIHBhcmVudCwgdGVtcGxhdGUsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU4sIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4pXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNILCB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy5zd2l0Y2hQYWdlc0RpdkluZGV4KClcblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRpZih0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSAhPSB1bmRlZmluZWQpIHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uSW4oKVxuXHRcdH0sIDYwMClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gIT0gdW5kZWZpbmVkKSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXS53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0cGFnZUFzc2V0c0xvYWRlZCgpIHtcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdFx0UGFnZXJBY3Rpb25zLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdEFwcEFjdGlvbnMubG9hZFBhZ2VBc3NldHMoKVxuXHR9XG5cdHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKCkge1xuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnb2xkLWNvbXBvbmVudCcpXG5cdH1cblx0c3dpdGNoUGFnZXNEaXZJbmRleCgpIHtcblx0XHR2YXIgbmV3Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR2YXIgb2xkQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J11cblx0XHRpZihuZXdDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBuZXdDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAyXG5cdFx0aWYob2xkQ29tcG9uZW50ICE9IHVuZGVmaW5lZCkgb2xkQ29tcG9uZW50LnBhcmVudC5zdHlsZVsnei1pbmRleCddID0gMVxuXHR9XG5cdHNldHVwTmV3Q29tcG9uZW50KGhhc2gsIFR5cGUsIHRlbXBsYXRlKSB7XG5cdFx0dmFyIGlkID0gVXRpbHMuQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGhhc2gucGFyZW50LnJlcGxhY2UoXCIvXCIsIFwiXCIpKVxuXHRcdHRoaXMub2xkUGFnZURpdlJlZiA9IHRoaXMuY3VycmVudFBhZ2VEaXZSZWZcblx0XHR0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID0gKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPT09ICdwYWdlLWEnKSA/ICdwYWdlLWInIDogJ3BhZ2UtYSdcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmN1cnJlbnRQYWdlRGl2UmVmKVxuXG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0aWQ6IHRoaXMuY3VycmVudFBhZ2VEaXZSZWYsXG5cdFx0XHRpc1JlYWR5OiB0aGlzLm9uUGFnZVJlYWR5LFxuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSxcblx0XHRcdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlLFxuXHRcdFx0ZGF0YTogQXBwU3RvcmUucGFnZUNvbnRlbnQoKVxuXHRcdH1cblx0XHR2YXIgcGFnZSA9IG5ldyBUeXBlKHByb3BzKVxuXHRcdHBhZ2UucmVuZGVyKGlkLCBlbCwgdGVtcGxhdGUsIHByb3BzLmRhdGEpXG5cdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10gPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddID0gcGFnZVxuXHRcdGlmKFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9PT0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTKSB7XG5cdFx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXS5mb3JjZVVubW91bnQoKVxuXHRcdH1cblx0fVxuXHRvblBhZ2VSZWFkeShoYXNoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uUGFnZVJlYWR5KGhhc2gpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHVubW91bnRDb21wb25lbnQocmVmKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzW3JlZl0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzW3JlZl0ucmVtb3ZlKClcblx0XHR9XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vZmYoUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOLCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluKVxuXHRcdFBhZ2VyU3RvcmUub2ZmKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnb2xkLWNvbXBvbmVudCcpXG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCduZXctY29tcG9uZW50Jylcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBhZ2VyXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJjb250ZW50XCI6IHtcblx0XHRcInR3aXR0ZXJfdXJsXCI6IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9jYW1wZXJcIixcblx0XHRcImZhY2Vib29rX3VybFwiOiBcImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9DYW1wZXJcIixcblx0XHRcImluc3RhZ3JhbV91cmxcIjogXCJodHRwczovL2luc3RhZ3JhbS5jb20vY2FtcGVyL1wiLFxuXHRcdFwibGFiX3VybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9sYWJcIixcblx0XHRcImxhbmdcIjoge1xuXHRcdFx0XCJlblwiOiB7XG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiU2hvcFwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiTWVuXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIldvbWVuXCIsXG5cdFx0XHRcdFwicGxhbmV0XCI6IFwiUGxhbmV0XCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImJ1eV9idG5fdHh0XCI6IFwiQlVZIFRISVMgTU9ERUxcIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRcImxhbmdzXCI6IFtcImVuXCIsIFwiZnJcIiwgXCJlc1wiLCBcIml0XCIsIFwiZGVcIiwgXCJwdFwiXSxcblxuXHRcImhvbWUtdmlkZW9zXCI6IFtcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2VzLXRyZW5jLW1hcnRhLm1wNFwiXG5cdF0sXG5cblx0XCJkZWZhdWx0LXJvdXRlXCI6IFwiXCIsXG5cblx0XCJyb3V0aW5nXCI6IHtcblx0XHRcIi9cIjoge1xuXHRcdFx0XCJ0ZXh0c1wiOiB7XG5cdFx0XHRcdFwidHh0X2FcIjogXCJCYWNrIHRvIHRoZSByb290cy4gSW5zcGlyYXRpb25zIGZvciBvdXIgbmV3IGNvbGxlY3Rpb24gY29tZXMgZnJvbSB0aGUgYmFsZWFyaWMgaXNsYW5kIG9mIE1hbGxvcmNhLCB0aGUgZm91bmRpbmcgZ3JvdW5kIG9mIENhbXBlci4gVmlzaXQgdGhyZWUgZGlmZmVyZW50IHNwb3RzIG9mIHRoZSBpc2xhbmQgLSBEZWlhLCBFcyBUcmVuYyBhbmQgQXJlbGx1ZiAtIGFzIGludGVycHJldGVkIGJ5IGNyZWF0aXZlIGRpcmVjdG9yLCBSb21haW4gS3JlbWVyLlwiLFxuXHRcdFx0XHRcImFfdmlzaW9uXCI6IFwiQSBWSVNJT04gT0ZcIlxuXHRcdFx0fSxcblx0XHRcdFwiYXNzZXRzXCI6IFtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtY2FwYXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1kdWIuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1rb2JhcmFmLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtcGFyYWRpc2UuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wZWxvdGFzLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtZHViLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtbWFydGEuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZGVpYS1tYXRlby5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9lcy10cmVuYy1iZWx1Z2EuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtaXNhbXUuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtbWFydGEuanBnXCJcblx0XHRcdF1cblx0XHR9LFxuXG4gICAgICAgIFwiZGVpYS9kdWJcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDE4OCwgXCJzXCI6IDg1LCBcInZcIjogNjEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzU3LCBcInNcIjogOTcsIFwidlwiOiAyNiB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMzU5LCBcInNcIjogOTMsIFwidlwiOiA1MSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNjJlNTRlYWMxZDg5ODlhYjlkZTIzOGZhM2Y3YzZkOGRiNGQ5ZGU4ZC9hcmVsbHVmLWtvYmFyYWYubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJCcmVha2luZyB1cCBvbiBhIHRleHQgbWVzc2FnZSBpcyBub3QgdmVyeSBkZWlhLlwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImRlaWEvbWF0ZW9cIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZTQyNDg4OWFjMDI2ZjcwZTU0NGFmMDMwMzVlNzE4N2YzNDk0MTcwNS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzcsIFwic1wiOiA4OSwgXCJ2XCI6IDgzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA4NiwgXCJ2XCI6IDU3IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTUwYjY5MjVmYTRmODVjZmE4ZDQ2NmQ4NDM2MTY3MTc5N2MyMGMxYS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiYnV5cyBhbiBhdGVsaWVyIGF0IGRlaWEuPGJyPnN0YXJ0cyBjYXJlZXIgYXMgYW4gYXJ0aXN0LlwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuXG4gICAgICAgIFwiZXMtdHJlbmMvYmVsdWdhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEyLCBcInNcIjogMTAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAxMiwgXCJ2XCI6IDQ1IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAwLCBcInZcIjogNDUgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzcwNDU1YWQ3M2FmN2I3ZTM1ZTllNjc0MTA5OTI5YzNiNzAyOTQwNjQvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiRVMgVFJFTkMgUEFSVFkgQk9ZLlwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImVzLXRyZW5jL2lzYW11XCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzZlYWZhZTdmMWIzYmM0MWQ4NTY5NzM1NTdhMmY1MTU5OGM4MjQxYTYvZXMtdHJlbmMtaXNhbXUubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMTAsIFwic1wiOiAxLCBcInZcIjogNzQgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjEsIFwic1wiOiAzNSwgXCJ2XCI6IDcyIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMCwgXCJzXCI6IDQ1LCBcInZcIjogMzAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzA2Njc5ZjNlYmQ2OTZlOWM0MmZkMTNjZjlkYmRhZWZmZTliMWY4NzMvZXMtdHJlbmMtaXNhbXUubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJVRk8gc2lnaHRpbmcgYXQgZXMgdHJlbmMuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cblx0XHRcImFyZWxsdWYvY2FwYXNcIjoge1xuXHRcdFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAwLCBcInNcIjogMCwgXCJ2XCI6IDAgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA3NiwgXCJ2XCI6IDkxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80OGZmMWM1OGI4NmIwODkxMjY4MWI0ZmRmM2I3NTQ3Yzc1Nzc2NmQ3L2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJNRUFOV0hJTEUgSU4gQVJFTExVRi5cIlxuICAgICAgICBcdH1cblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMSwgXCJzXCI6IDk1LCBcInZcIjogMjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjIsIFwic1wiOiAzNSwgXCJ2XCI6IDc5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMzMsIFwic1wiOiAzNSwgXCJ2XCI6IDEwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hYzE2ZDUzYzRmOWU4ZmQ2OTMwNzc5ZTIzNzg1NDY4N2RjZjI0MWU4L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIQVQgSEFQUEVOUyBJTiBBUkVMTFVGIFNUQVlTIElOIEFSRUxMVUYuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9tYXJ0YVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMDAsIFwic1wiOiA1NywgXCJ2XCI6IDgxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwMSwgXCJzXCI6IDEwMCwgXCJ2XCI6IDY5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNWI5ZDI3MDYxMDBlNWVhMGQzMTcxNDNlMjM3NGQ2YmQ2Yzk2MDdiMS9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiQkFEIFRSSVAgQVQgVEhFIEhPVEVMIFBPT0wuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9rb2JhcmFoXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzI5ODBmMTRjYzhiZDk5MTJiMTRkY2E0NmE0Y2Q0YTg1ZmEwNDc3NGMvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjY0LCBcInNcIjogNjksIFwidlwiOiA0MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNDQsIFwic1wiOiA1NiwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMzQ0LCBcInNcIjogNDEsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiSGF0ZXJzIHdpbGwgc2F5IGl0cyBwaG90b3Nob3AuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cdFx0XCJhcmVsbHVmL2R1YlwiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIyYjM2MGM4Y2EzOTk2OTY5ODUzMTNkZGU5OWJhODNkNGVjOTcyYjcvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxOTYsIFwic1wiOiA1MiwgXCJ2XCI6IDMzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzk4N2JkYWIwMTI5Nzk4MjJiODE4NjM3ODM3Y2MyODg0MTRjZWY4ZjMvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4nVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkUuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9wYXJhZGlzZVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hODE5YzM3M2Y5Nzc3ODUyZjM5NjdjZTAyM2JjZmIwZDkxMTUzODZmL2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiA1OSwgXCJzXCI6IDE5LCBcInZcIjogOTkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjA3LCBcInNcIjogMzEsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE4MywgXCJzXCI6IDcxLCBcInZcIjogNjQgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzVkYzE5NzI2ZWZhN2IyZTc1NmM4MDUzNGQ0M2ZhNjAwY2M2MWYxNzgvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIlNFTEZJRSBPTiBXQVRFUlNMSURFIExJS0UgQSBCT1NTLlwiXG4gICAgICAgIFx0fVxuICAgICAgICB9XG5cblx0fVxufSJdfQ==
