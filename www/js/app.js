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
	var leftStepTop = _domHand2['default'].select('.left-step-top', $container);
	var leftStepBottom = _domHand2['default'].select('.left-step-bottom', $container);
	var rightStepTop = _domHand2['default'].select('.right-step-top', $container);
	var rightStepBottom = _domHand2['default'].select('.right-step-bottom', $container);

	var $lettersContainer = _domHand2['default'].select('.around-border-letters-container', parent);
	var topLetters = _domHand2['default'].select('.top', $lettersContainer).children;
	var bottomLetters = _domHand2['default'].select('.bottom', $lettersContainer).children;
	var leftLetters = _domHand2['default'].select('.left', $lettersContainer).children;
	var rightLetters = _domHand2['default'].select('.right', $lettersContainer).children;
	var leftStepTopLetters = _domHand2['default'].select('.left-step-top', $lettersContainer).children;
	var leftStepBottomLetters = _domHand2['default'].select('.left-step-bottom', $lettersContainer).children;
	var rightStepTopLetters = _domHand2['default'].select('.right-step-top', $lettersContainer).children;
	var rightStepBottomLetters = _domHand2['default'].select('.right-step-bottom', $lettersContainer).children;

	scope = {
		resize: function resize() {
			var borderSize = 10;
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var blockSize = [windowW / _AppConstants2['default'].GRID_ROWS, windowH / _AppConstants2['default'].GRID_COLUMNS];

			top.style.width = windowW + 'px';
			bottom.style.width = blockSize[0] * 3 + 'px';
			bottom.style.top = windowH - borderSize + 'px';
			bottom.style.left = blockSize[0] * 2 + 'px';
			left.style.height = right.style.height = windowH - blockSize[1] + 'px';
			right.style.left = windowW - borderSize + 'px';

			leftStepTop.style.width = blockSize[0] * 2 + 'px';
			leftStepTop.style.top = windowH - blockSize[1] + 'px';
			leftStepBottom.style.height = blockSize[1] + 'px';
			leftStepBottom.style.left = blockSize[0] * 2 - borderSize + 1 + 'px';
			leftStepBottom.style.top = windowH - blockSize[1] + 'px';

			rightStepTop.style.width = blockSize[0] * 2 + 'px';
			rightStepTop.style.top = windowH - blockSize[1] + 'px';
			rightStepTop.style.left = windowW - blockSize[0] * 2 + 'px';
			rightStepBottom.style.height = blockSize[1] + 'px';
			rightStepBottom.style.left = windowW - blockSize[0] * 2 + 'px';
			rightStepBottom.style.top = windowH - blockSize[1] + 'px';

			for (var i = 0; i < topLetters.length; i++) {
				var tl = topLetters[i];
				tl.style.left = (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				tl.style.top = -2 + 'px';
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i];
				bl.style.left = (blockSize[0] << 1) + (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
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
			for (var i = 0; i < leftStepTopLetters.length; i++) {
				var lstl = leftStepTopLetters[i];
				lstl.style.left = (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				lstl.style.top = blockSize[1] * 3 - 2 + 'px';
			};
			for (var i = 0; i < leftStepBottomLetters.length; i++) {
				var lsbl = leftStepBottomLetters[i];
				lsbl.style.left = blockSize[0] * 2 - 8 + 'px';
				lsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px';
			};
			for (var i = 0; i < rightStepTopLetters.length; i++) {
				var rstl = rightStepTopLetters[i];
				rstl.style.left = windowW - (blockSize[0] << 1) + (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				rstl.style.top = blockSize[1] * 3 - 2 + 'px';
			};
			for (var i = 0; i < rightStepBottomLetters.length; i++) {
				var rsbl = rightStepBottomLetters[i];
				rsbl.style.left = blockSize[0] * 5 + 2 + 'px';
				rsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px';
			};
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

exports['default'] = function (holder, characterUrl, textureSize, onMouseOver, onMouseOut, onClick) {

	var scope;

	var tex = PIXI.Texture.fromImage(characterUrl);
	var sprite = new PIXI.Sprite(tex);
	sprite.anchor.x = sprite.anchor.y = 0.5;
	holder.addChild(sprite);

	sprite.interactive = true;
	sprite.buttonMode = true;
	sprite.on('mouseover', onMouseOver);
	sprite.on('mouseout', onMouseOut);
	sprite.on('click', onClick);

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
			sprite.interactive = false;
			sprite.buttonMode = false;
			sprite.off('mouseover', onMouseOver);
			sprite.off('mouseout', onMouseOut);
			sprite.off('click', onClick);
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
	bgColors.length = 6;

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
	var videoSrc = 'http://embed.wistia.com/deliveries/2a3313ea3ae2862e1156a520a31ca0979f7c2aad/hello.mp4';
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
		parent.style.cursor = 'none';
		_domHand2['default'].event.on(parent, 'click', onCloseFunFact);
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
	var items = [];
	var totalNum = props.data.grid.length;
	var videos = _AppStore2['default'].getHomeVideos();

	var vCanvasProps = {
		autoplay: false,
		volume: 0,
		loop: false,
		onEnded: videoEnded
	};

	for (var i = 0; i < totalNum; i++) {
		var vParent = gridChildren[i];
		var videoIndex = i % videos.length;
		var vCanvas = (0, _videoCanvas2['default'])(videos[videoIndex], vCanvasProps);
		vParent.appendChild(vCanvas.canvas);
		items[i] = vCanvas;
	}

	var resize = function resize() {
		var windowW = _AppStore2['default'].Window.w;
		var windowH = _AppStore2['default'].Window.h;

		var originalVideoSize = _AppConstants2['default'].HOME_VIDEO_SIZE;
		var blockSize = [windowW / _AppConstants2['default'].GRID_ROWS, windowH / _AppConstants2['default'].GRID_COLUMNS];

		linesGridContainer.style.width = windowW + 'px';
		linesGridContainer.style.height = windowH + 'px';
		linesGridContainer.style.position = 'absolute';

		var resizeVars = _Utils2['default'].ResizePositionProportionally(blockSize[0], blockSize[1], originalVideoSize[0], originalVideoSize[1]);

		var pos = [0, 0];
		var horizontalLinesIndex = 0;
		var verticalLinesIndex = 0;
		for (var i = 0; i < scope.num; i++) {
			var item = scope.items[i];
			var parent = scope.children[i];

			parent.style.position = 'absolute';
			parent.style.width = blockSize[0] + 'px';
			parent.style.height = blockSize[1] + 'px';
			parent.style.left = pos[0] + 'px';
			parent.style.top = pos[1] + 'px';

			item.canvas.width = blockSize[0];
			item.canvas.height = blockSize[1];
			item.resize(resizeVars.left, resizeVars.top, resizeVars.width, resizeVars.height);
			item.drawOnce();

			if (i > 0) {
				var vl = scope.lines.vertical[verticalLinesIndex];
				if (vl) vl.style.left = pos[0] + 'px';
				verticalLinesIndex += 1;
			}

			// positions
			scope.positions[i] = [pos[0], pos[1]];
			pos[0] += blockSize[0];
			if (pos[0] > windowW - (blockSize[0] >> 1)) {

				pos[1] += blockSize[1];
				pos[0] = 0;

				var hl = scope.lines.horizontal[horizontalLinesIndex];
				if (hl) hl.style.top = pos[1] + 'px';
				horizontalLinesIndex += 1;
			}
		};
	};

	scope = {
		el: gridContainer,
		children: gridChildren,
		items: items,
		num: totalNum,
		positions: [],
		lines: {
			horizontal: linesHorizontal,
			vertical: linesVertical
		},
		resize: resize,
		transitionInItem: function transitionInItem(index, type) {
			var item = scope.items[index];
			item.seat = index;

			item.canvas.classList.add('enable');

			if (type == _AppConstants2['default'].ITEM_VIDEO) {
				item.play();
			} else {
				item.timeout(imageEnded, 2000);
				item.seek(_Utils2['default'].Rand(2, 10, 0));
			}
		},
		transitionOutItem: function transitionOutItem(item) {
			item.canvas.classList.remove('enable');

			item.video.currentTime = 0;
			item.pause();
			setTimeout(function () {
				item.drawOnce();
			}, 500);
		},
		clear: function clear() {
			for (var i = 0; i < items.length; i++) {
				items[i].clear();
			};
		}
	};

	return scope;
};

exports['default'] = grid;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./video-canvas":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js":[function(require,module,exports){
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js":[function(require,module,exports){
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/Map.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Map.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js":[function(require,module,exports){
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
	};

	var clear = function clear() {
		video.removeEventListener('canplay', onCanPlay);
		video.removeEventListener('canplaythrough', onCanPlay);
		video.removeEventListener('ended', ended);
		scope.clearAllEvents();
		size = null;
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
		addTo: addTo,
		on: on,
		off: off,
		clear: clear,
		clearAllEvents: clearAllEvents,
		isPlaying: props.autoplay || false,
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
		this.onClick = this.onClick.bind(this);
		this.onArrowMouseEnter = this.onArrowMouseEnter.bind(this);
		this.onArrowMouseLeave = this.onArrowMouseLeave.bind(this);
		this.onCharacterMouseOver = this.onCharacterMouseOver.bind(this);
		this.onCharacterMouseOut = this.onCharacterMouseOut.bind(this);
		this.onCharacterClicked = this.onCharacterClicked.bind(this);
		this.onSelfieStickClicked = this.onSelfieStickClicked.bind(this);
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {

			this.mouse = new PIXI.Point();
			this.mouse.nX = this.mouse.nY = 0;

			this.leftPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('shoe-bg'));
			this.rightPart = (0, _diptyquePart2['default'])(this.pxContainer, this.getImageUrlById('character-bg'));

			this.character = (0, _character2['default'])(this.rightPart.holder, this.getImageUrlById('character'), this.getImageSizeById('character'), this.onCharacterMouseOver, this.onCharacterMouseOut, this.onCharacterClicked);
			this.funFact = (0, _funFactHolder2['default'])(this.pxContainer, this.element, this.mouse, this.props.data);
			this.arrowsWrapper = (0, _arrowsWrapper2['default'])(this.element, this.onArrowMouseEnter, this.onArrowMouseLeave);
			this.selfieStick = (0, _selfieStick2['default'])(this.element, this.mouse, this.props.data);

			_domHand2['default'].event.on(this.selfieStick.el, 'click', this.onSelfieStickClicked);

			_domHand2['default'].event.on(window, 'mousemove', this.onMouseMove);
			_domHand2['default'].event.on(window, 'click', this.onClick);

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
		key: 'onClick',
		value: function onClick(e) {}
	}, {
		key: 'onCharacterMouseOver',
		value: function onCharacterMouseOver() {
			// console.log('over')
		}
	}, {
		key: 'onCharacterMouseOut',
		value: function onCharacterMouseOut() {
			// console.log('out')
		}
	}, {
		key: 'onCharacterClicked',
		value: function onCharacterClicked() {
			if (this.funFact.isOpen) {
				this.funFact.close();
			} else {
				this.funFact.open();
			}
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
		key: 'update',
		value: function update() {
			if (!this.domIsReady) return;
			this.character.update(this.mouse);
			this.leftPart.update(this.mouse);
			this.rightPart.update(this.mouse);
			this.selfieStick.update();
			this.funFact.update();

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

			this.rightPart.holder.x = windowW >> 1;

			_get(Object.getPrototypeOf(Diptyque.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			_domHand2['default'].event.off(window, 'mousemove', this.onMouseMove);
			_domHand2['default'].event.off(window, 'click', this.onClick);
			_domHand2['default'].event.off(this.selfieStick.el, 'click', this.onSelfieStickClicked);
			this.leftPart.clear();
			this.rightPart.clear();
			this.character.clear();
			this.funFact.clear();
			this.selfieStick.clear();
			this.arrowsWrapper.clear();
			this.mouse = null;
			this.leftPart = null;
			this.rightPart = null;
			this.character = null;
			this.arrowsWrapper = null;
			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentWillUnmount', this).call(this);
		}
	}]);

	return Diptyque;
})(_Page3['default']);

exports['default'] = Diptyque;
module.exports = exports['default'];

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../arrows-wrapper":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/arrows-wrapper.js","./../character":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/character.js","./../diptyque-part":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/diptyque-part.js","./../fun-fact-holder":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/fun-fact-holder.js","./../selfie-stick":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/selfie-stick.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js":[function(require,module,exports){
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

var _aroundBorderHome = require('./../around-border-home');

var _aroundBorderHome2 = _interopRequireDefault(_aroundBorderHome);

var _mainMap = require('./../main-map');

var _mainMap2 = _interopRequireDefault(_mainMap);

var _domHand = require('dom-hand');

var _domHand2 = _interopRequireDefault(_domHand);

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

			this.seats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 25];

			this.usedSeats = [];

			this.bg = _domHand2['default'].select('.bg-wrapper', this.element);

			this.grid = (0, _gridHome2['default'])(this.props, this.element, this.onItemEnded);
			this.bottomTexts = (0, _bottomTextsHome2['default'])(this.element);
			this.aroundBorder = (0, _aroundBorderHome2['default'])(this.element);
			this.map = (0, _mainMap2['default'])(this.element, _AppConstants2['default'].INTERACTIVE);

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

			this.grid.resize();
			this.bottomTexts.resize();
			this.aroundBorder.resize();
			this.map.resize();

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);

			// bg
			this.bg.style.position = 'absolute';
			this.bg.style.width = resizeVarsBg.width + 'px';
			this.bg.style.height = resizeVarsBg.height + 'px';
			this.bg.style.top = resizeVarsBg.top + 'px';
			this.bg.style.left = resizeVarsBg.left + 'px';

			_get(Object.getPrototypeOf(Home.prototype), 'resize', this).call(this);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.grid.clear();
			this.map.clear();

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

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../around-border-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js","./../bottom-texts-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js","./../grid-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js","./../main-map":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/main-map.js","dom-hand":"dom-hand"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/selfie-stick.js":[function(require,module,exports){
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

exports['default'] = function (holder, mouse, data) {

	var scope;
	var isReady = false;
	var screenHolderSize = [0, 0],
	    videoHolderSize = [0, 0],
	    topOffset = 0;
	var el = _domHand2['default'].select('.selfie-stick-wrapper', holder);
	var background = _domHand2['default'].select('.background', el);
	var screenWrapper = _domHand2['default'].select('.screen-wrapper', el);
	var screenHolder = _domHand2['default'].select('.screen-holder', el);
	var videoHolder = _domHand2['default'].select('.video-holder', el);
	var selfieStickWrapper = _domHand2['default'].select('.selfie-stick-wrapper', el);
	var animation = {
		position: { x: 0, y: 0 },
		fposition: { x: 0, y: 0 },
		velocity: { x: 0, y: 0 },
		rotation: 0,
		config: {
			length: 400,
			spring: 0.4,
			friction: 0.7
		}
	};

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
			animation.config.length = 200, animation.config.spring = 0.6, animation.config.friction = 0.7;
			mVideo.play(0);
			background.style.visibility = 'visible';
			scope.isOpened = true;
		},
		close: function close() {
			animation.config.length = 200, animation.config.spring = 0.6, animation.config.friction = 0.7;
			mVideo.pause(0);
			background.style.visibility = 'hidden';
			scope.isOpened = false;
		},
		update: function update() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;

			if (scope.isOpened) {
				animation.fposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1);
				animation.fposition.y = (windowH >> 1) - screenHolderSize[1] * 0.3;
				animation.fposition.x += (mouse.nX - 0.5) * 200;
				animation.fposition.y += (mouse.nY - 0.5) * 50;
			} else {
				animation.fposition.x = (windowW >> 1) - (screenHolderSize[0] >> 1);
				animation.fposition.y = windowH - screenHolderSize[1] * 0.4;
				animation.fposition.x += (mouse.nX - 0.5) * 20;
				animation.fposition.y -= (mouse.nY - 0.5) * 20;
			}

			_Utils2['default'].SpringTo(animation, animation.fposition, 1);

			animation.position.x += (animation.fposition.x - animation.position.x) * 0.1;

			animation.config.length += (0.01 - animation.config.length) * 0.1;

			_Utils2['default'].Translate(screenWrapper, animation.position.x, animation.position.y + animation.velocity.y, 1);
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
			topOffset = windowW / _AppConstants2['default'].MEDIA_GLOBAL_W * 26;
			videoHolder.style.left = (screenHolderSize[0] >> 1) - (videoHolderSize[0] >> 1) + 'px';
			videoHolder.style.top = topOffset + 'px';
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./mini-video":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/mini-video.js","dom-hand":"dom-hand","img":"img"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js":[function(require,module,exports){
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

var videoCanvas = function videoCanvas(src, props) {

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var video = document.createElement('video');
  var intervalId;
  var dx = 0,
      dy = 0,
      dWidth = 0,
      dHeight = 0;
  var isPlaying = props.autoplay || false;
  var scope;

  var onCanPlay = function onCanPlay() {
    if (props.autoplay) video.play();
    if (props.volume != undefined) video.volume = props.volume;
    if (dWidth == 0) dWidth = video.videoWidth;
    if (dHeight == 0) dHeight = video.videoHeight;
    if (isPlaying != true) drawOnce();
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('canplaythrough', onCanPlay);
  };

  var drawOnce = function drawOnce() {
    ctx.drawImage(video, dx, dy, dWidth, dHeight);
  };

  var draw = function draw() {
    ctx.drawImage(video, dx, dy, dWidth, dHeight);
  };

  var play = function play() {
    isPlaying = true;
    video.play();
    clearInterval(intervalId);
    intervalId = setInterval(draw, 1000 / 30);
  };

  var seek = function seek(time) {
    video.currentTime = time;
    drawOnce();
  };

  var timeout = function timeout(cb, ms) {
    setTimeout(function () {
      cb(scope);
    }, ms);
  };

  var pause = function pause() {
    isPlaying = false;
    video.pause();
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
    video.removeEventListener('canplay', onCanPlay);
    video.removeEventListener('canplaythrough', onCanPlay);
    video.removeEventListener('play', play);
    video.removeEventListener('pause', pause);
    video.removeEventListener('ended', ended);
    ctx.clearRect(0, 0, 0, 0);
  };

  video.addEventListener('canplay', onCanPlay);
  video.addEventListener('canplaythrough', onCanPlay);
  video.addEventListener('play', play);
  video.addEventListener('pause', pause);
  video.addEventListener('ended', ended);

  video.src = src;

  scope = {
    canvas: canvas,
    video: video,
    ctx: ctx,
    drawOnce: drawOnce,
    play: play,
    pause: pause,
    seek: seek,
    timeout: timeout,
    resize: resize,
    clear: clear
  };

  return scope;
};

exports['default'] = videoCanvas;
module.exports = exports['default'];

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js":[function(require,module,exports){
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

	ITEM_IMAGE: 'ITEM_IMAGE',
	ITEM_VIDEO: 'ITEM_VIDEO',

	GRID_ROWS: 7,
	GRID_COLUMNS: 4,

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
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class='page-wrapper diptyque-page'>\n	\n	<div class=\"fun-fact-wrapper\">\n		<div class=\"video-wrapper\"></div>\n		<div class=\"message-wrapper\">\n			<div class=\"message-inner\">\n				"
    + alias3(((helper = (helper = helpers['fact-txt'] || (depth0 != null ? depth0['fact-txt'] : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"fact-txt","hash":{},"data":data}) : helper)))
    + "\n			</div>\n		</div>\n		<div class=\"cursor-cross\">\n			<svg width=\"100%\" viewBox=\"0 0 14.105 13.828\">\n				<polygon fill=\"#ffffff\" points=\"13.946,0.838 13.283,0.156 7.035,6.25 0.839,0.156 0.173,0.834 6.37,6.931 0.159,12.99 0.823,13.671 7.07,7.578 13.266,13.671 13.932,12.994 7.736,6.896 \"/>\n			</svg>\n		</div>\n	</div>\n\n	<div class=\"selfie-stick-wrapper\">\n		<div class=\"screen-wrapper\">\n			<div class=\"screen-holder\"></div>\n			<div class=\"video-holder\"></div>\n		</div>\n		<div class=\"background\"></div>\n	</div>\n\n	<div class=\"arrows-wrapper\">\n		<a href=\"#/"
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
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=helpers.blockHelperMissing, buffer = 
  "<div class='page-wrapper home-page'>\n	<div class=\"bg-wrapper\">\n		<img src='"
    + alias3(((helper = (helper = helpers.bgurl || (depth0 != null ? depth0.bgurl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"bgurl","hash":{},"data":data}) : helper)))
    + "'>\n	</div>\n	<div class=\"grid-container\">\n";
  stack1 = ((helper = (helper = helpers.grid || (depth0 != null ? depth0.grid : depth0)) != null ? helper : alias1),(options={"name":"grid","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers.grid) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "	</div>\n	<div class=\"lines-grid-container\">\n		<div class=\"horizontal-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "		</div>\n		<div class=\"vertical-lines\">\n";
  stack1 = ((helper = (helper = helpers['lines-grid'] || (depth0 != null ? depth0['lines-grid'] : depth0)) != null ? helper : alias1),(options={"name":"lines-grid","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));
  if (!helpers['lines-grid']) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "		</div>\n	</div>\n	<div class=\"bottom-texts-container\">\n		<div class=\"left-text\">\n			<div class=\"front-wrapper\">\n				"
    + alias3(((helper = (helper = helpers.text_a || (depth0 != null ? depth0.text_a : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"text_a","hash":{},"data":data}) : helper)))
    + "\n			</div>\n			<div class=\"background\"></div>\n		</div>\n		<div class=\"right-text\">\n			<div class=\"front-wrapper\">\n				<div class=\"vision\">"
    + alias3(((helper = (helper = helpers.a_vision || (depth0 != null ? depth0.a_vision : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"a_vision","hash":{},"data":data}) : helper)))
    + "</div>\n				<div class=\"logo\">\n					<img src=\"image/logo-mallorca.png\">\n				</div>\n			</div>\n			<div class=\"background\"></div>\n		</div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n\n		<div class=\"left-step-top\"></div>\n		<div class=\"left-step-bottom\"></div>\n		<div class=\"right-step-top\"></div>\n		<div class=\"right-step-bottom\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n\n		<div class=\"left-step-top\">\n			<div>a</div>\n			<div>b</div>\n		</div>\n		<div class=\"left-step-bottom\">\n			<div>4</div>\n		</div>\n		<div class=\"right-step-top\">\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"right-step-bottom\">\n			<div>4</div>\n		</div>\n	</div>\n\n	<div class=\"map-wrapper\"></div>	\n</div>";
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
	"videos": [
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
				"background.jpg"
			]
		},

        "deia/dub": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/13bbb61195164873d823a3b91a2c82accefb3edd/deia-dub.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
        "deia/mateo": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/e424889ac026f70e544af03035e7187f34941705/deia-mateo.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },

        "es-trenc/beluga": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/23444d3c8693e59f8079f827dd182c5e33413877/es-trenc-beluga.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
        "es-trenc/isamu": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/6eafae7f1b3bc41d856973557a2f51598c8241a6/es-trenc-isamu.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },

		"arelluf/capas": {
			"selfie-stick-video-url": "http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
		},
        "arelluf/pelotas": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/3dcfd70c7072692ea3a739aef5376b026b04b675/arelluf-pelotas.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
        "arelluf/marta": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/840a3f6729b1f52f446aae6daec939a3eca4c0c1/arelluf-capas.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
        "arelluf/kobarah": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/2980f14cc8bd9912b14dca46a4cd4a85fa04774c/arelluf-kobaraf.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
		"arelluf/dub": {
			"selfie-stick-video-url": "http://embed.wistia.com/deliveries/22b360c8ca399696985313dde99ba83d4ec972b7/arelluf-dub.mp4",
        	"ambient-color": {
        		"from": { "h": 196, "s": 52, "v": 33 },
        		"to": { "h": 15, "s": 84, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        },
        "arelluf/paradise": {
        	"selfie-stick-video-url": "http://embed.wistia.com/deliveries/a819c373f9777852f3967ce023bcfb0d9115386f/arelluf-paradise.mp4",
        	"ambient-color": {
        		"from": { "h": 264, "s": 69, "v": 41 },
        		"to": { "h": 344, "s": 56, "v": 100 }
        	},
        	"fact": {
        		"en": "WHEN YOU CAN ́T KEEP THE ARROW ON THE CENTER LINE."
        	}
        }

	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWluaS12aWRlby5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9wYWdlcy9EaXB0eXF1ZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9wYWdlcy9Ib21lLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3NlbGZpZS1zdGljay5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zb2NpYWwtbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvdmlkZW8tY2FudmFzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb25zdGFudHMvQXBwQ29uc3RhbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9kaXNwYXRjaGVycy9BcHBEaXNwYXRjaGVyLmpzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9EaXB0eXF1ZS5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0Zyb250Q29udGFpbmVyLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvSG9tZS5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL01hcC5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL1BhZ2VzQ29udGFpbmVyLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvVHJhbnNpdGlvbk1hcC5oYnMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL0dsb2JhbEV2ZW50cy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvUHJlbG9hZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9Sb3V0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3N0b3Jlcy9BcHBTdG9yZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvUHhIZWxwZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL1V0aWxzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9yYWYuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvUGFnZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlQ29tcG9uZW50LmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL2NvbXBvbmVudHMvQmFzZVBhZ2UuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZXIuanMiLCJ3d3cvZGF0YS9kYXRhLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7Ozs7Ozs7d0JDRXFCLFVBQVU7Ozs7cUJBQ2IsT0FBTzs7OzttQkFDVCxLQUFLOzs7O3lCQUNDLFdBQVc7Ozs7b0JBQ1osTUFBTTs7OzttQkFDWCxLQUFLOzs7OzRCQUNJLGVBQWU7Ozs7dUJBQ3hCLFVBQVU7Ozs7QUFUMUIsSUFBSyxDQUFF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TUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDcEMsT0FBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQTtBQUN6QixPQUFJLEtBQUssR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQTtBQUNoQyxPQUFJLEtBQUssR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQTtBQUNoQyxPQUFJLEtBQUssR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQTtBQUNoQyxPQUFJLEVBQUUsR0FBRyxBQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzFCLE9BQUksRUFBRSxHQUFHLEFBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUIsT0FBSSxFQUFFLEdBQUcsQUFBQyxFQUFFLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFMUIsT0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0IsUUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUksS0FBSyxHQUFDLENBQUMsR0FBQyxFQUFFLEFBQUMsQ0FBQyxDQUFBO0FBQ2hELFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUksS0FBSyxHQUFDLENBQUMsR0FBQyxFQUFFLEFBQUMsQ0FBQyxDQUFBO0FBQ2hELFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxD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QUFHLHNCQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRS9CLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNyRixPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3hHLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2hGLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDMUcsT0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL2Jhc2UnKTtcblxudmFyIGJhc2UgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcblxudmFyIF9TYWZlU3RyaW5nID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nJyk7XG5cbnZhciBfU2FmZVN0cmluZzIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfU2FmZVN0cmluZyk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9pbXBvcnQyID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQyKTtcblxudmFyIF9pbXBvcnQzID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL3J1bnRpbWUnKTtcblxudmFyIHJ1bnRpbWUgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Myk7XG5cbnZhciBfbm9Db25mbGljdCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9uby1jb25mbGljdCcpO1xuXG52YXIgX25vQ29uZmxpY3QyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX25vQ29uZmxpY3QpO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgdmFyIGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IF9TYWZlU3RyaW5nMlsnZGVmYXVsdCddO1xuICBoYi5FeGNlcHRpb24gPSBfRXhjZXB0aW9uMlsnZGVmYXVsdCddO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuICBoYi5lc2NhcGVFeHByZXNzaW9uID0gVXRpbHMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG52YXIgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbl9ub0NvbmZsaWN0MlsnZGVmYXVsdCddKGluc3QpO1xuXG5pbnN0WydkZWZhdWx0J10gPSBpbnN0O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBpbnN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkhhbmRsZWJhcnNFbnZpcm9ubWVudCA9IEhhbmRsZWJhcnNFbnZpcm9ubWVudDtcbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBjcmVhdGVGcmFtZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgVkVSU0lPTiA9ICczLjAuMSc7XG5leHBvcnRzLlZFUlNJT04gPSBWRVJTSU9OO1xudmFyIENPTVBJTEVSX1JFVklTSU9OID0gNjtcblxuZXhwb3J0cy5DT01QSUxFUl9SRVZJU0lPTiA9IENPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPT0gMS54LngnLFxuICA1OiAnPT0gMi4wLjAtYWxwaGEueCcsXG4gIDY6ICc+PSAyLjAuMC1iZXRhLjEnXG59O1xuXG5leHBvcnRzLlJFVklTSU9OX0NIQU5HRVMgPSBSRVZJU0lPTl9DSEFOR0VTO1xudmFyIGlzQXJyYXkgPSBVdGlscy5pc0FycmF5LFxuICAgIGlzRnVuY3Rpb24gPSBVdGlscy5pc0Z1bmN0aW9uLFxuICAgIHRvU3RyaW5nID0gVXRpbHMudG9TdHJpbmcsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG59XG5cbkhhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiByZWdpc3RlckhlbHBlcihuYW1lLCBmbikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpO1xuICAgICAgfVxuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gdW5yZWdpc3RlckhlbHBlcihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuaGVscGVyc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHJlZ2lzdGVyUGFydGlhbChuYW1lLCBwYXJ0aWFsKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXR0ZW1wdGluZyB0byByZWdpc3RlciBhIHBhcnRpYWwgYXMgdW5kZWZpbmVkJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gcGFydGlhbDtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiB1bnJlZ2lzdGVyUGFydGlhbChuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFydGlhbHNbbmFtZV07XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIEEgbWlzc2luZyBmaWVsZCBpbiBhIHt7Zm9vfX0gY29uc3R1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdNaXNzaW5nIGhlbHBlcjogXCInICsgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXS5uYW1lICsgJ1wiJyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmbih0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZiAoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmlkcykge1xuICAgICAgICAgIG9wdGlvbnMuaWRzID0gW29wdGlvbnMubmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLm5hbWUpO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdNdXN0IHBhc3MgaXRlcmF0b3IgdG8gI2VhY2gnKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuLFxuICAgICAgICBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgcmV0ID0gJycsXG4gICAgICAgIGRhdGEgPSB1bmRlZmluZWQsXG4gICAgICAgIGNvbnRleHRQYXRoID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKSArICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjSXRlcmF0aW9uKGZpZWxkLCBpbmRleCwgbGFzdCkge1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5rZXkgPSBmaWVsZDtcbiAgICAgICAgZGF0YS5pbmRleCA9IGluZGV4O1xuICAgICAgICBkYXRhLmZpcnN0ID0gaW5kZXggPT09IDA7XG4gICAgICAgIGRhdGEubGFzdCA9ICEhbGFzdDtcblxuICAgICAgICBpZiAoY29udGV4dFBhdGgpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gY29udGV4dFBhdGggKyBmaWVsZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ZpZWxkXSwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogVXRpbHMuYmxvY2tQYXJhbXMoW2NvbnRleHRbZmllbGRdLCBmaWVsZF0sIFtjb250ZXh0UGF0aCArIGZpZWxkLCBudWxsXSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihpLCBpLCBpID09PSBjb250ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJpb3JLZXkgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBydW5uaW5nIHRoZSBpdGVyYXRpb25zIG9uZSBzdGVwIG91dCBvZiBzeW5jIHNvIHdlIGNhbiBkZXRlY3RcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAgIC8vIGFuIGl0ZXJtZWRpYXRlIGtleXMgYXJyYXkuXG4gICAgICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJpb3JLZXkgPSBrZXk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkge1xuICAgICAgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsIHx8IFV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7IGZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaCB9KTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoIVV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uIChtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICAgIGluc3RhbmNlLmxvZyhsZXZlbCwgbWVzc2FnZSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb29rdXAnLCBmdW5jdGlvbiAob2JqLCBmaWVsZCkge1xuICAgIHJldHVybiBvYmogJiYgb2JqW2ZpZWxkXTtcbiAgfSk7XG59XG5cbnZhciBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogeyAwOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJyB9LFxuXG4gIC8vIFN0YXRlIGVudW1cbiAgREVCVUc6IDAsXG4gIElORk86IDEsXG4gIFdBUk46IDIsXG4gIEVSUk9SOiAzLFxuICBsZXZlbDogMSxcblxuICAvLyBDYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uIGxvZyhsZXZlbCwgbWVzc2FnZSkge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gbG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICAoY29uc29sZVttZXRob2RdIHx8IGNvbnNvbGUubG9nKS5jYWxsKGNvbnNvbGUsIG1lc3NhZ2UpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHMubG9nZ2VyID0gbG9nZ2VyO1xudmFyIGxvZyA9IGxvZ2dlci5sb2c7XG5cbmV4cG9ydHMubG9nID0gbG9nO1xuXG5mdW5jdGlvbiBjcmVhdGVGcmFtZShvYmplY3QpIHtcbiAgdmFyIGZyYW1lID0gVXRpbHMuZXh0ZW5kKHt9LCBvYmplY3QpO1xuICBmcmFtZS5fcGFyZW50ID0gb2JqZWN0O1xuICByZXR1cm4gZnJhbWU7XG59XG5cbi8qIFthcmdzLCBdb3B0aW9ucyAqLyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5mdW5jdGlvbiBFeGNlcHRpb24obWVzc2FnZSwgbm9kZSkge1xuICB2YXIgbG9jID0gbm9kZSAmJiBub2RlLmxvYyxcbiAgICAgIGxpbmUgPSB1bmRlZmluZWQsXG4gICAgICBjb2x1bW4gPSB1bmRlZmluZWQ7XG4gIGlmIChsb2MpIHtcbiAgICBsaW5lID0gbG9jLnN0YXJ0LmxpbmU7XG4gICAgY29sdW1uID0gbG9jLnN0YXJ0LmNvbHVtbjtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgY29sdW1uO1xuICB9XG5cbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEV4Y2VwdGlvbik7XG4gIH1cblxuICBpZiAobG9jKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgfVxufVxuXG5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEV4Y2VwdGlvbjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbi8qZ2xvYmFsIHdpbmRvdyAqL1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB2YXIgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocm9vdC5IYW5kbGViYXJzID09PSBIYW5kbGViYXJzKSB7XG4gICAgICByb290LkhhbmRsZWJhcnMgPSAkSGFuZGxlYmFycztcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY2hlY2tSZXZpc2lvbiA9IGNoZWNrUmV2aXNpb247XG5cbi8vIFRPRE86IFJlbW92ZSB0aGlzIGxpbmUgYW5kIGJyZWFrIHVwIGNvbXBpbGVQYXJ0aWFsXG5cbmV4cG9ydHMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbmV4cG9ydHMud3JhcFByb2dyYW0gPSB3cmFwUHJvZ3JhbTtcbmV4cG9ydHMucmVzb2x2ZVBhcnRpYWwgPSByZXNvbHZlUGFydGlhbDtcbmV4cG9ydHMuaW52b2tlUGFydGlhbCA9IGludm9rZVBhcnRpYWw7XG5leHBvcnRzLm5vb3AgPSBub29wO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG5mdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICB2YXIgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLkNPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBydW50aW1lVmVyc2lvbnMgKyAnKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKCcgKyBjb21waWxlclZlcnNpb25zICsgJykuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBjb21waWxlckluZm9bMV0gKyAnKS4nKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGVtcGxhdGUodGVtcGxhdGVTcGVjLCBlbnYpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKCFlbnYpIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTm8gZW52aXJvbm1lbnQgcGFzc2VkIHRvIHRlbXBsYXRlJyk7XG4gIH1cbiAgaWYgKCF0ZW1wbGF0ZVNwZWMgfHwgIXRlbXBsYXRlU3BlYy5tYWluKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1Vua25vd24gdGVtcGxhdGUgb2JqZWN0OiAnICsgdHlwZW9mIHRlbXBsYXRlU3BlYyk7XG4gIH1cblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICBlbnYuVk0uY2hlY2tSZXZpc2lvbih0ZW1wbGF0ZVNwZWMuY29tcGlsZXIpO1xuXG4gIGZ1bmN0aW9uIGludm9rZVBhcnRpYWxXcmFwcGVyKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgICBjb250ZXh0ID0gVXRpbHMuZXh0ZW5kKHt9LCBjb250ZXh0LCBvcHRpb25zLmhhc2gpO1xuICAgIH1cblxuICAgIHBhcnRpYWwgPSBlbnYuVk0ucmVzb2x2ZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcbiAgICB2YXIgcmVzdWx0ID0gZW52LlZNLmludm9rZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcblxuICAgIGlmIChyZXN1bHQgPT0gbnVsbCAmJiBlbnYuY29tcGlsZSkge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgdGVtcGxhdGVTcGVjLmNvbXBpbGVyT3B0aW9ucywgZW52KTtcbiAgICAgIHJlc3VsdCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRlbnQpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gcmVzdWx0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpbmVzW2ldICYmIGkgKyAxID09PSBsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lc1tpXSA9IG9wdGlvbnMuaW5kZW50ICsgbGluZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbGluZXMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIHZhciBjb250YWluZXIgPSB7XG4gICAgc3RyaWN0OiBmdW5jdGlvbiBzdHJpY3Qob2JqLCBuYW1lKSB7XG4gICAgICBpZiAoIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1wiJyArIG5hbWUgKyAnXCIgbm90IGRlZmluZWQgaW4gJyArIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW25hbWVdO1xuICAgIH0sXG4gICAgbG9va3VwOiBmdW5jdGlvbiBsb29rdXAoZGVwdGhzLCBuYW1lKSB7XG4gICAgICB2YXIgbGVuID0gZGVwdGhzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGRlcHRoc1tpXSAmJiBkZXB0aHNbaV1bbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBkZXB0aHNbaV1bbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGxhbWJkYTogZnVuY3Rpb24gbGFtYmRhKGN1cnJlbnQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgY3VycmVudCA9PT0gJ2Z1bmN0aW9uJyA/IGN1cnJlbnQuY2FsbChjb250ZXh0KSA6IGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIGVzY2FwZUV4cHJlc3Npb246IFV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgaW52b2tlUGFydGlhbDogaW52b2tlUGFydGlhbFdyYXBwZXIsXG5cbiAgICBmbjogZnVuY3Rpb24gZm4oaSkge1xuICAgICAgcmV0dXJuIHRlbXBsYXRlU3BlY1tpXTtcbiAgICB9LFxuXG4gICAgcHJvZ3JhbXM6IFtdLFxuICAgIHByb2dyYW06IGZ1bmN0aW9uIHByb2dyYW0oaSwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSxcbiAgICAgICAgICBmbiA9IHRoaXMuZm4oaSk7XG4gICAgICBpZiAoZGF0YSB8fCBkZXB0aHMgfHwgYmxvY2tQYXJhbXMgfHwgZGVjbGFyZWRCbG9ja1BhcmFtcykge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuXG4gICAgZGF0YTogZnVuY3Rpb24gZGF0YSh2YWx1ZSwgZGVwdGgpIHtcbiAgICAgIHdoaWxlICh2YWx1ZSAmJiBkZXB0aC0tKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbiBtZXJnZShwYXJhbSwgY29tbW9uKSB7XG4gICAgICB2YXIgb2JqID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIHBhcmFtICE9PSBjb21tb24pIHtcbiAgICAgICAgb2JqID0gVXRpbHMuZXh0ZW5kKHt9LCBjb21tb24sIHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJcbiAgfTtcblxuICBmdW5jdGlvbiByZXQoY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciBkYXRhID0gb3B0aW9ucy5kYXRhO1xuXG4gICAgcmV0Ll9zZXR1cChvcHRpb25zKTtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCAmJiB0ZW1wbGF0ZVNwZWMudXNlRGF0YSkge1xuICAgICAgZGF0YSA9IGluaXREYXRhKGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICB2YXIgZGVwdGhzID0gdW5kZWZpbmVkLFxuICAgICAgICBibG9ja1BhcmFtcyA9IHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyA/IFtdIDogdW5kZWZpbmVkO1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzKSB7XG4gICAgICBkZXB0aHMgPSBvcHRpb25zLmRlcHRocyA/IFtjb250ZXh0XS5jb25jYXQob3B0aW9ucy5kZXB0aHMpIDogW2NvbnRleHRdO1xuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZVNwZWMubWFpbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH1cbiAgcmV0LmlzVG9wID0gdHJ1ZTtcblxuICByZXQuX3NldHVwID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5oZWxwZXJzLCBlbnYuaGVscGVycyk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCkge1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5wYXJ0aWFscywgZW52LnBhcnRpYWxzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcHRpb25zLnBhcnRpYWxzO1xuICAgIH1cbiAgfTtcblxuICByZXQuX2NoaWxkID0gZnVuY3Rpb24gKGksIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zICYmICFibG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ211c3QgcGFzcyBibG9jayBwYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMgJiYgIWRlcHRocykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ211c3QgcGFzcyBwYXJlbnQgZGVwdGhzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgdGVtcGxhdGVTcGVjW2ldLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICBmdW5jdGlvbiBwcm9nKGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICByZXR1cm4gZm4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIG9wdGlvbnMuZGF0YSB8fCBkYXRhLCBibG9ja1BhcmFtcyAmJiBbb3B0aW9ucy5ibG9ja1BhcmFtc10uY29uY2F0KGJsb2NrUGFyYW1zKSwgZGVwdGhzICYmIFtjb250ZXh0XS5jb25jYXQoZGVwdGhzKSk7XG4gIH1cbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGRlcHRocyA/IGRlcHRocy5sZW5ndGggOiAwO1xuICBwcm9nLmJsb2NrUGFyYW1zID0gZGVjbGFyZWRCbG9ja1BhcmFtcyB8fCAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBpZiAoIXBhcnRpYWwpIHtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICB9IGVsc2UgaWYgKCFwYXJ0aWFsLmNhbGwgJiYgIW9wdGlvbnMubmFtZSkge1xuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljIHBhcnRpYWwgdGhhdCByZXR1cm5lZCBhIHN0cmluZ1xuICAgIG9wdGlvbnMubmFtZSA9IHBhcnRpYWw7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbcGFydGlhbF07XG4gIH1cbiAgcmV0dXJuIHBhcnRpYWw7XG59XG5cbmZ1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBvcHRpb25zLnBhcnRpYWwgPSB0cnVlO1xuXG4gIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH0gZWxzZSBpZiAocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCgpIHtcbiAgcmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiBpbml0RGF0YShjb250ZXh0LCBkYXRhKSB7XG4gIGlmICghZGF0YSB8fCAhKCdyb290JyBpbiBkYXRhKSkge1xuICAgIGRhdGEgPSBkYXRhID8gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuY3JlYXRlRnJhbWUoZGF0YSkgOiB7fTtcbiAgICBkYXRhLnJvb3QgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiBkYXRhO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5mdW5jdGlvbiBTYWZlU3RyaW5nKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn1cblxuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBTYWZlU3RyaW5nLnByb3RvdHlwZS50b0hUTUwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU2FmZVN0cmluZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuZXh0ZW5kID0gZXh0ZW5kO1xuXG4vLyBPbGRlciBJRSB2ZXJzaW9ucyBkbyBub3QgZGlyZWN0bHkgc3VwcG9ydCBpbmRleE9mIHNvIHdlIG11c3QgaW1wbGVtZW50IG91ciBvd24sIHNhZGx5LlxuZXhwb3J0cy5pbmRleE9mID0gaW5kZXhPZjtcbmV4cG9ydHMuZXNjYXBlRXhwcmVzc2lvbiA9IGVzY2FwZUV4cHJlc3Npb247XG5leHBvcnRzLmlzRW1wdHkgPSBpc0VtcHR5O1xuZXhwb3J0cy5ibG9ja1BhcmFtcyA9IGJsb2NrUGFyYW1zO1xuZXhwb3J0cy5hcHBlbmRDb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoO1xudmFyIGVzY2FwZSA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICAnXFwnJzogJyYjeDI3OycsXG4gICdgJzogJyYjeDYwOydcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZyxcbiAgICBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl07XG59XG5cbmZ1bmN0aW9uIGV4dGVuZChvYmogLyogLCAuLi5zb3VyY2UgKi8pIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3VtZW50c1tpXSwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbi8qZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG52YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoaXNGdW5jdGlvbigveC8pKSB7XG4gIGV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxudmFyIGlzRnVuY3Rpb247XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuLyplc2xpbnQtZW5hYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/IHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nIDogZmFsc2U7XG59O2V4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHZhbHVlKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhcnJheVtpXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nICYmIHN0cmluZy50b0hUTUwpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9IVE1MKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZyArICcnO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nO1xuICB9XG5cbiAgaWYgKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBibG9ja1BhcmFtcyhwYXJhbXMsIGlkcykge1xuICBwYXJhbXMucGF0aCA9IGlkcztcbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufSIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKVsnZGVmYXVsdCddO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGFuZGxlYmFycy9ydW50aW1lXCIpW1wiZGVmYXVsdFwiXTtcbiIsIi8vIEF2b2lkIGNvbnNvbGUgZXJyb3JzIGZvciB0aGUgSUUgY3JhcHB5IGJyb3dzZXJzXG5pZiAoICEgd2luZG93LmNvbnNvbGUgKSBjb25zb2xlID0geyBsb2c6IGZ1bmN0aW9uKCl7fSB9O1xuXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwIGZyb20gJ0FwcCdcbmltcG9ydCBBcHBNb2JpbGUgZnJvbSAnQXBwTW9iaWxlJ1xuaW1wb3J0IFR3ZWVuTWF4IGZyb20gJ2dzYXAnXG5pbXBvcnQgcmFmIGZyb20gJ3JhZidcbmltcG9ydCBNb2JpbGVEZXRlY3QgZnJvbSAnbW9iaWxlLWRldGVjdCdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBtZCA9IG5ldyBNb2JpbGVEZXRlY3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG5cbkFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gKG1kLm1vYmlsZSgpIHx8IG1kLnRhYmxldCgpKSA/IHRydWUgOiBmYWxzZVxuQXBwU3RvcmUuUGFyZW50ID0gZG9tLnNlbGVjdCgnI2FwcC1jb250YWluZXInKVxuQXBwU3RvcmUuRGV0ZWN0b3Iub2xkSUUgPSBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTYnKSB8fCBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTcnKSB8fCBkb20uY2xhc3Nlcy5jb250YWlucyhBcHBTdG9yZS5QYXJlbnQsICdpZTgnKVxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNTdXBwb3J0V2ViR0wgPSBVdGlscy5TdXBwb3J0V2ViR0woKVxuaWYoQXBwU3RvcmUuRGV0ZWN0b3Iub2xkSUUpIEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG4vLyBEZWJ1Z1xuLy8gQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSB0cnVlXG5cbnZhciBhcHA7XG5pZihBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSkge1xuXHRkb20uY2xhc3Nlcy5hZGQoZG9tLnNlbGVjdCgnaHRtbCcpLCAnbW9iaWxlJylcblx0YXBwID0gbmV3IEFwcE1vYmlsZSgpXG59ZWxzZXtcblx0YXBwID0gbmV3IEFwcCgpXHRcbn0gXG5cbmFwcC5pbml0KClcblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBBcHBUZW1wbGF0ZSBmcm9tICdBcHBUZW1wbGF0ZSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEdFdmVudHMgZnJvbSAnR2xvYmFsRXZlbnRzJ1xuaW1wb3J0IFByZWxvYWRlciBmcm9tICdQcmVsb2FkZXInXG5cbmNsYXNzIEFwcCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMub25BcHBSZWFkeSA9IHRoaXMub25BcHBSZWFkeS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5sb2FkTWFpbkFzc2V0cyA9IHRoaXMubG9hZE1haW5Bc3NldHMuYmluZCh0aGlzKVxuXHR9XG5cdGluaXQoKSB7XG5cdFx0Ly8gSW5pdCByb3V0ZXJcblx0XHR0aGlzLnJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuXHRcdHRoaXMucm91dGVyLmluaXQoKVxuXG5cdFx0Ly8gSW5pdCBQcmVsb2FkZXJcblx0XHRBcHBTdG9yZS5QcmVsb2FkZXIgPSBuZXcgUHJlbG9hZGVyKClcblxuXHRcdC8vIEluaXQgZ2xvYmFsIGV2ZW50c1xuXHRcdHdpbmRvdy5HbG9iYWxFdmVudHMgPSBuZXcgR0V2ZW50cygpXG5cdFx0R2xvYmFsRXZlbnRzLmluaXQoKVxuXG5cdFx0dmFyIGFwcFRlbXBsYXRlID0gbmV3IEFwcFRlbXBsYXRlKClcblx0XHRhcHBUZW1wbGF0ZS5pc1JlYWR5ID0gdGhpcy5sb2FkTWFpbkFzc2V0c1xuXHRcdGFwcFRlbXBsYXRlLnJlbmRlcignI2FwcC1jb250YWluZXInKVxuXG5cdFx0Ly8gU3RhcnQgcm91dGluZ1xuXHRcdHRoaXMucm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cblx0bG9hZE1haW5Bc3NldHMoKSB7XG5cdFx0dmFyIGhhc2hVcmwgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cmluZygyKVxuXHRcdHZhciBwYXJ0cyA9IGhhc2hVcmwuc3Vic3RyKDEpLnNwbGl0KCcvJylcblx0XHR2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcblx0XHRpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB0aGlzLm9uQXBwUmVhZHkoKVxuXHRcdGVsc2UgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsIHRoaXMub25BcHBSZWFkeSlcblx0fVxuXHRvbkFwcFJlYWR5KCkge1xuXHRcdEFwcEFjdGlvbnMucGFnZUhhc2hlckNoYW5nZWQoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFxuICAgIFx0XG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlTW9iaWxlIGZyb20gJ0FwcFRlbXBsYXRlTW9iaWxlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5cbmNsYXNzIEFwcE1vYmlsZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdGluaXQoKSB7XG5cdFx0Ly8gSW5pdCByb3V0ZXJcblx0XHR2YXIgcm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0cm91dGVyLmluaXQoKVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGVNb2JpbGUgPSBuZXcgQXBwVGVtcGxhdGVNb2JpbGUoKVxuXHRcdGFwcFRlbXBsYXRlTW9iaWxlLnJlbmRlcignI2FwcC1jb250YWluZXInKVxuXG5cdFx0Ly8gU3RhcnQgcm91dGluZ1xuXHRcdHJvdXRlci5iZWdpblJvdXRpbmcoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcE1vYmlsZVxuICAgIFx0XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEZyb250Q29udGFpbmVyIGZyb20gJ0Zyb250Q29udGFpbmVyJ1xuaW1wb3J0IFBhZ2VzQ29udGFpbmVyIGZyb20gJ1BhZ2VzQ29udGFpbmVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFBYQ29udGFpbmVyIGZyb20gJ1BYQ29udGFpbmVyJ1xuaW1wb3J0IFRyYW5zaXRpb25NYXAgZnJvbSAnVHJhbnNpdGlvbk1hcCdcblxuY2xhc3MgQXBwVGVtcGxhdGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucmVzaXplID0gdGhpcy5yZXNpemUuYmluZCh0aGlzKVxuXHRcdHRoaXMuYW5pbWF0ZSA9IHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGUnLCBwYXJlbnQsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRcblx0XHRcblx0XHR0aGlzLmZyb250Q29udGFpbmVyID0gbmV3IEZyb250Q29udGFpbmVyKClcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyID0gbmV3IFBhZ2VzQ29udGFpbmVyKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBYQ29udGFpbmVyKClcblx0XHR0aGlzLnB4Q29udGFpbmVyLmluaXQoJyNwYWdlcy1jb250YWluZXInKVxuXHRcdEFwcEFjdGlvbnMucHhDb250YWluZXJJc1JlYWR5KHRoaXMucHhDb250YWluZXIpXG5cblx0XHR0aGlzLnRyYW5zaXRpb25NYXAgPSBuZXcgVHJhbnNpdGlvbk1hcCgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLmlzUmVhZHkoKVxuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdFx0dGhpcy5hbmltYXRlKClcblx0fVxuXHRhbmltYXRlKCkge1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUpXG5cdCAgICB0aGlzLnB4Q29udGFpbmVyLnVwZGF0ZSgpXG5cdCAgICB0aGlzLnBhZ2VzQ29udGFpbmVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHRoaXMuZnJvbnRDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnB4Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcC5yZXNpemUoKVxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVcblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBGcm9udENvbnRhaW5lciBmcm9tICdGcm9udENvbnRhaW5lcidcbmltcG9ydCBQYWdlc0NvbnRhaW5lciBmcm9tICdQYWdlc0NvbnRhaW5lcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcblxuY2xhc3MgQXBwVGVtcGxhdGVNb2JpbGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucmVzaXplID0gdGhpcy5yZXNpemUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlTW9iaWxlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0Ly8gdGhpcy5mcm9udENvbnRhaW5lciA9IG5ldyBGcm9udENvbnRhaW5lcigpXG5cdFx0Ly8gdGhpcy5mcm9udENvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0Ly8gdGhpcy5wYWdlc0NvbnRhaW5lciA9IG5ldyBQYWdlc0NvbnRhaW5lcigpXG5cdFx0Ly8gdGhpcy5wYWdlc0NvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0Y29uc29sZS5sb2coJ21vYmlsZSB5bycpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cblx0XHRHbG9iYWxFdmVudHMucmVzaXplKClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0Ly8gdGhpcy5wYWdlc0NvbnRhaW5lci5yZXNpemUoKVxuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIucmVzaXplKClcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlTW9iaWxlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuZnVuY3Rpb24gX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKSB7XG4gICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBBR0VfQVNTRVRTX0xPQURFRCxcbiAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgfSkgIFxufVxuXG52YXIgQXBwQWN0aW9ucyA9IHtcbiAgICBwYWdlSGFzaGVyQ2hhbmdlZDogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCxcbiAgICAgICAgICAgIGl0ZW06IHBhZ2VJZFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgbG9hZFBhZ2VBc3NldHM6IGZ1bmN0aW9uKHBhZ2VJZCkge1xuICAgICAgICB2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcbiAgICAgICAgaWYobWFuaWZlc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIEFwcFN0b3JlLlByZWxvYWRlci5sb2FkKG1hbmlmZXN0LCAoKT0+e1xuICAgICAgICAgICAgICAgIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd1Jlc2l6ZTogZnVuY3Rpb24od2luZG93Vywgd2luZG93SCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsXG4gICAgICAgICAgICBpdGVtOiB7IHdpbmRvd1c6d2luZG93Vywgd2luZG93SDp3aW5kb3dIIH1cbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHB4Q29udGFpbmVySXNSZWFkeTogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0lTX1JFQURZLFxuICAgICAgICAgICAgaXRlbTogY29tcG9uZW50XG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweEFkZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhSZW1vdmVDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBBY3Rpb25zXG5cblxuICAgICAgXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ0Zyb250Q29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBoZWFkZXJMaW5rcyBmcm9tICdoZWFkZXItbGlua3MnXG5pbXBvcnQgc29jaWFsTGlua3MgZnJvbSAnc29jaWFsLWxpbmtzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmNsYXNzIEZyb250Q29udGFpbmVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMub25QYWdlQ2hhbmdlID0gdGhpcy5vblBhZ2VDaGFuZ2UuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0c2NvcGUuaW5mb3MgPSBBcHBTdG9yZS5nbG9iYWxDb250ZW50KClcblx0XHRzY29wZS5mYWNlYm9va1VybCA9IGdlbmVyYUluZm9zWydmYWNlYm9va191cmwnXVxuXHRcdHNjb3BlLnR3aXR0ZXJVcmwgPSBnZW5lcmFJbmZvc1sndHdpdHRlcl91cmwnXVxuXHRcdHNjb3BlLmluc3RhZ3JhbVVybCA9IGdlbmVyYUluZm9zWydpbnN0YWdyYW1fdXJsJ11cblx0XHRzY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cdFx0c2NvcGUubWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5KycvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXHRcdHNjb3BlLndvbWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5Kycvd29tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cblx0XHRzdXBlci5yZW5kZXIoJ0Zyb250Q29udGFpbmVyJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5vblBhZ2VDaGFuZ2UpXG5cblx0XHR0aGlzLmhlYWRlckxpbmtzID0gaGVhZGVyTGlua3ModGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuc29jaWFsTGlua3MgPSBzb2NpYWxMaW5rcyh0aGlzLmVsZW1lbnQpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cblx0fVxuXHRvblBhZ2VDaGFuZ2UoKSB7XG5cdFx0dmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0aWYoaGFzaE9iai50eXBlID09IEFwcENvbnN0YW50cy5ESVBUWVFVRSkge1xuXHRcdFx0dGhpcy5zb2NpYWxMaW5rcy5oaWRlKClcdFx0XHRcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc29jaWFsTGlua3Muc2hvdygpXG5cdFx0fVxuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblx0XHR0aGlzLnNvY2lhbExpbmtzLnJlc2l6ZSgpXG5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGcm9udENvbnRhaW5lclxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQWENvbnRhaW5lciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdGluaXQoZWxlbWVudElkKSB7XG5cdFx0dGhpcy5jbGVhckJhY2sgPSBmYWxzZVxuXG5cdFx0dGhpcy5hZGQgPSB0aGlzLmFkZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5yZW1vdmUgPSB0aGlzLnJlbW92ZS5iaW5kKHRoaXMpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCwgdGhpcy5hZGQpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsIHRoaXMucmVtb3ZlKVxuXG5cdFx0dmFyIHJlbmRlck9wdGlvbnMgPSB7XG5cdFx0ICAgIHJlc29sdXRpb246IDEsXG5cdFx0ICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuXHRcdCAgICBhbnRpYWxpYXM6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHQvLyB0aGlzLnJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHR0aGlzLmN1cnJlbnRDb2xvciA9IDB4ZmZmZmZmXG5cdFx0dmFyIGVsID0gZG9tLnNlbGVjdChlbGVtZW50SWQpXG5cdFx0dGhpcy5yZW5kZXJlci52aWV3LnNldEF0dHJpYnV0ZSgnaWQnLCAncHgtY29udGFpbmVyJylcblx0XHRBcHBTdG9yZS5DYW52YXMgPSB0aGlzLnJlbmRlcmVyLnZpZXdcblx0XHRkb20udHJlZS5hZGQoZWwsIHRoaXMucmVuZGVyZXIudmlldylcblx0XHR0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHQvLyB0aGlzLmJhY2tncm91bmQgPSBuZXcgUElYSS5HcmFwaGljcygpXG5cdFx0Ly8gdGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0XHQvLyB0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMuYmFja2dyb3VuZClcblxuXHRcdHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHQvLyB0aGlzLnN0YXRzLnNldE1vZGUoIDEgKTsgLy8gMDogZnBzLCAxOiBtcywgMjogbWJcblxuXHRcdC8vIGFsaWduIHRvcC1sZWZ0XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDk5OTk5OVxuXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cblx0fVxuXHRkcmF3QmFja2dyb3VuZChjb2xvcikge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLmJhY2tncm91bmQuY2xlYXIoKVxuXHRcdHRoaXMuYmFja2dyb3VuZC5saW5lU3R5bGUoMCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmJlZ2luRmlsbChjb2xvciwgMSk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDAsIHdpbmRvd1csIHdpbmRvd0gpO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5lbmRGaWxsKCk7XG5cdH1cblx0YWRkKGNoaWxkKSB7XG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChjaGlsZClcblx0fVxuXHRyZW1vdmUoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKGNoaWxkKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHR0aGlzLnN0YXRzLnVwZGF0ZSgpXG5cdCAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnN0YWdlKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgc2NhbGUgPSAxXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3dXICogc2NhbGUsIHdpbmRvd0ggKiBzY2FsZSlcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZVBhZ2UgZnJvbSAnQmFzZVBhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUHhIZWxwZXIgZnJvbSAnUHhIZWxwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2UgZXh0ZW5kcyBCYXNlUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weEFkZENoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdGlmKHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FKSB7XG5cdFx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRydWVcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gMFxuXHRcdH1lbHNle1xuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdFx0fVxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRnZXRJbWFnZVVybEJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTCh1cmwpXG5cdH1cblx0Z2V0SW1hZ2VTaXplQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlU2l6ZSh1cmwpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFB4SGVscGVyLnJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcih0aGlzLnB4Q29udGFpbmVyKVxuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weFJlbW92ZUNoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge1BhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHN9IGZyb20gJ1BhZ2VyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEJhc2VQYWdlciBmcm9tICdCYXNlUGFnZXInXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBIb21lIGZyb20gJ0hvbWUnXG5pbXBvcnQgSG9tZVRlbXBsYXRlIGZyb20gJ0hvbWVfaGJzJ1xuaW1wb3J0IERpcHR5cXVlIGZyb20gJ0RpcHR5cXVlJ1xuaW1wb3J0IERpcHR5cXVlVGVtcGxhdGUgZnJvbSAnRGlwdHlxdWVfaGJzJ1xuXG5jbGFzcyBQYWdlc0NvbnRhaW5lciBleHRlbmRzIEJhc2VQYWdlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLmRpZEhhc2hlckNoYW5nZSA9IHRoaXMuZGlkSGFzaGVyQ2hhbmdlLmJpbmQodGhpcylcblx0XHR0aGlzLnBhZ2VBc3NldHNMb2FkZWQgPSB0aGlzLnBhZ2VBc3NldHNMb2FkZWQuYmluZCh0aGlzKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLmRpZEhhc2hlckNoYW5nZSlcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELCB0aGlzLnBhZ2VBc3NldHNMb2FkZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZSgpIHtcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdH1lbHNle1xuXHRcdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dCgpXG5cdFx0XHQvLyB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCgpXG5cdFx0fVxuXHR9XG5cdHRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpIHtcblx0XHR2YXIgdHlwZSA9IHVuZGVmaW5lZFxuXHRcdHZhciB0ZW1wbGF0ZSA9IHVuZGVmaW5lZFxuXHRcdHN3aXRjaChuZXdIYXNoLnR5cGUpIHtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkRJUFRZUVVFOlxuXHRcdFx0XHR0eXBlID0gRGlwdHlxdWVcblx0XHRcdFx0dGVtcGxhdGUgPSBEaXB0eXF1ZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5IT01FOlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHR9XG5cdFx0dGhpcy5zZXR1cE5ld0NvbXBvbmVudChuZXdIYXNoLCB0eXBlLCB0ZW1wbGF0ZSlcblx0XHR0aGlzLmN1cnJlbnRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdHN1cGVyLnBhZ2VBc3NldHNMb2FkZWQoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFnZXNDb250YWluZXJcblxuXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnVHJhbnNpdGlvbk1hcF9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcblxuY2xhc3MgVHJhbnNpdGlvbk1hcCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wcmVsb2FkZXJQcm9ncmVzcyA9IHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cblx0XHRzdXBlci5yZW5kZXIoJ1RyYW5zaXRpb25NYXAnLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLCB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdEFwcFN0b3JlLlByZWxvYWRlci5xdWV1ZS5vbihcInByb2dyZXNzXCIsIHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MsIHRoaXMpXG5cblx0XHR0aGlzLm1hcCA9IG1hcCh0aGlzLmVsZW1lbnQsIEFwcENvbnN0YW50cy5UUkFOU0lUSU9OKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAuaGlnaGxpZ2h0KFJvdXRlci5nZXRPbGRIYXNoKCksIFJvdXRlci5nZXROZXdIYXNoKCkpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLnJlc2V0SGlnaGxpZ2h0KClcblx0fVxuXHRwcmVsb2FkZXJQcm9ncmVzcyhlKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgKz0gMC4yXG5cdFx0aWYoZS5wcm9ncmVzcyA+IDAuOTkpIHRoaXMuY3VycmVudFByb2dyZXNzID0gMVxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPiAxID8gMSA6IHRoaXMuY3VycmVudFByb2dyZXNzIFxuXHRcdHRoaXMubWFwLnVwZGF0ZVByb2dyZXNzKGUucHJvZ3Jlc3MpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNpdGlvbk1hcFxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGFyb3VuZEJvcmRlciA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgJGNvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcCA9IGRvbS5zZWxlY3QoJy50b3AnLCAkY29udGFpbmVyKVxuXHR2YXIgYm90dG9tID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRjb250YWluZXIpXG5cdHZhciBsZWZ0ID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkY29udGFpbmVyKVxuXHR2YXIgcmlnaHQgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkY29udGFpbmVyKVxuXHR2YXIgbGVmdFN0ZXBUb3AgPSBkb20uc2VsZWN0KCcubGVmdC1zdGVwLXRvcCcsICRjb250YWluZXIpXG5cdHZhciBsZWZ0U3RlcEJvdHRvbSA9IGRvbS5zZWxlY3QoJy5sZWZ0LXN0ZXAtYm90dG9tJywgJGNvbnRhaW5lcilcblx0dmFyIHJpZ2h0U3RlcFRvcCA9IGRvbS5zZWxlY3QoJy5yaWdodC1zdGVwLXRvcCcsICRjb250YWluZXIpXG5cdHZhciByaWdodFN0ZXBCb3R0b20gPSBkb20uc2VsZWN0KCcucmlnaHQtc3RlcC1ib3R0b20nLCAkY29udGFpbmVyKVxuXG5cdHZhciAkbGV0dGVyc0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWxldHRlcnMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy50b3AnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGJvdHRvbUxldHRlcnMgPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBsZWZ0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciByaWdodExldHRlcnMgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGxlZnRTdGVwVG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy5sZWZ0LXN0ZXAtdG9wJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBsZWZ0U3RlcEJvdHRvbUxldHRlcnMgPSBkb20uc2VsZWN0KCcubGVmdC1zdGVwLWJvdHRvbScsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgcmlnaHRTdGVwVG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy5yaWdodC1zdGVwLXRvcCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgcmlnaHRTdGVwQm90dG9tTGV0dGVycyA9IGRvbS5zZWxlY3QoJy5yaWdodC1zdGVwLWJvdHRvbScsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgYm9yZGVyU2l6ZSA9IDEwXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMgXVxuXG5cdFx0XHR0b3Auc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYm9yZGVyU2l6ZSArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS5sZWZ0ID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRcdGxlZnQuc3R5bGUuaGVpZ2h0ID0gcmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdHJpZ2h0LnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYm9yZGVyU2l6ZSArICdweCdcblxuXHRcdFx0bGVmdFN0ZXBUb3Auc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdFx0bGVmdFN0ZXBUb3Auc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdGxlZnRTdGVwQm90dG9tLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdGxlZnRTdGVwQm90dG9tLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdICogMikgLSBib3JkZXJTaXplICsgMSArICdweCdcblx0XHRcdGxlZnRTdGVwQm90dG9tLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cblx0XHRcdHJpZ2h0U3RlcFRvcC5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSAqIDIgKyAncHgnXG5cdFx0XHRyaWdodFN0ZXBUb3Auc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRcdHJpZ2h0U3RlcFRvcC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIChibG9ja1NpemVbMF0gKiAyKSArICdweCdcblx0XHRcdHJpZ2h0U3RlcEJvdHRvbS5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHRyaWdodFN0ZXBCb3R0b20uc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdICogMikgKyAncHgnXG5cdFx0XHRyaWdodFN0ZXBCb3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3BMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciB0bCA9IHRvcExldHRlcnNbaV1cblx0XHRcdFx0dGwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHR0bC5zdHlsZS50b3AgPSAtMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJvdHRvbUxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJsID0gYm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRibC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA8PCAxKSArIChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gMTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGwgPSBsZWZ0TGV0dGVyc1tpXVxuXHRcdFx0XHRsbC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bGwuc3R5bGUubGVmdCA9IDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJsID0gcmlnaHRMZXR0ZXJzW2ldXG5cdFx0XHRcdHJsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRybC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIDggKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0U3RlcFRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGxzdGwgPSBsZWZ0U3RlcFRvcExldHRlcnNbaV1cblx0XHRcdFx0bHN0bC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGxzdGwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSAqIDMpIC0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlZnRTdGVwQm90dG9tTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbHNibCA9IGxlZnRTdGVwQm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRsc2JsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdICogMikgLSA4ICsgJ3B4J1xuXHRcdFx0XHRsc2JsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSAoYmxvY2tTaXplWzFdID4+IDEpIC0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpZ2h0U3RlcFRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJzdGwgPSByaWdodFN0ZXBUb3BMZXR0ZXJzW2ldXG5cdFx0XHRcdHJzdGwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdIDw8IDEpICsgKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHJzdGwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSAqIDMpIC0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJpZ2h0U3RlcEJvdHRvbUxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJzYmwgPSByaWdodFN0ZXBCb3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdHJzYmwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gKiA1KSArIDIgKyAncHgnXG5cdFx0XHRcdHJzYmwuc3R5bGUudG9wID0gd2luZG93SCAtIChibG9ja1NpemVbMV0gPj4gMSkgLSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gXG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyb3VuZEJvcmRlciIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgb25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmUpPT4ge1xuXHR2YXIgc2NvcGU7XG5cdHZhciBhcnJvd3NXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmFycm93cy13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LmxlZnQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgcmlnaHRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5yaWdodCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciBhcnJvd3MgPSB7XG5cdFx0bGVmdDoge1xuXHRcdFx0ZWw6IGxlZnRBcnJvdyxcblx0XHRcdGljb25zOiBkb20uc2VsZWN0LmFsbCgnc3ZnJywgbGVmdEFycm93KSxcblx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCBsZWZ0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCBsZWZ0QXJyb3cpXG5cdFx0fSxcblx0XHRyaWdodDoge1xuXHRcdFx0ZWw6IHJpZ2h0QXJyb3csXG5cdFx0XHRpY29uczogZG9tLnNlbGVjdC5hbGwoJ3N2ZycsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCByaWdodEFycm93KVxuXHRcdH1cblx0fVxuXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRiYWNrZ3JvdW5kOiAoZGlyKT0+IHtcblx0XHRcdHJldHVybiBhcnJvd3NbZGlyXS5iYWNrZ3JvdW5kXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBhcnJvd1NpemUgPSBkb20uc2l6ZShhcnJvd3MubGVmdC5pY29uc1sxXSlcblx0XHRcdHZhciBvZmZzZXRZID0gMjBcblx0XHRcdHZhciBiZ1dpZHRoID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXG5cdFx0XHRhcnJvd3MucmlnaHQuZWwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBiZ1dpZHRoICsgJ3B4J1xuXG5cdFx0XHRhcnJvd3MubGVmdC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0Lmljb25zV3JhcHBlci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChhcnJvd1NpemVbMF0gPj4gMSkgLSBvZmZzZXRZICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBiZ1dpZHRoIC0gYXJyb3dTaXplWzBdIC0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICsgJ3B4J1xuXHRcdFx0XHRcblx0XHR9LFxuXHRcdG92ZXI6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0b3V0OiAoZGlyKT0+IHtcblx0XHRcdHZhciBhcnJvdyA9IGFycm93c1tkaXJdXG5cdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoYXJyb3cuZWwsICdob3ZlcmVkJylcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLmxlZnQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRhcnJvd3MgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGJvdHRvbVRleHRzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgYm90dG9tVGV4dHNDb250YWluZXIgPSBkb20uc2VsZWN0KCcuYm90dG9tLXRleHRzLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIGxlZnRCbG9jayA9IGRvbS5zZWxlY3QoJy5sZWZ0LXRleHQnLCBib3R0b21UZXh0c0NvbnRhaW5lcilcblx0dmFyIHJpZ2h0QmxvY2sgPSBkb20uc2VsZWN0KCcucmlnaHQtdGV4dCcsIGJvdHRvbVRleHRzQ29udGFpbmVyKVxuXHR2YXIgbGVmdEZyb250ID0gZG9tLnNlbGVjdCgnLmZyb250LXdyYXBwZXInLCBsZWZ0QmxvY2spXG5cdHZhciByaWdodEZyb250ID0gZG9tLnNlbGVjdCgnLmZyb250LXdyYXBwZXInLCByaWdodEJsb2NrKVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TIF1cblxuXHRcdGxlZnRCbG9jay5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSAqIDIgKyAncHgnXG5cdFx0bGVmdEJsb2NrLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblxuXHRcdGxlZnRCbG9jay5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gKGJsb2NrU2l6ZVswXSAqIDIpICsgJ3B4J1xuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0bGVmdEZyb250LnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgLSAobGVmdEZyb250LmNsaWVudEhlaWdodCA+PiAxKSArICdweCdcblx0XHRcdHJpZ2h0RnJvbnQuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIChyaWdodEZyb250LmNsaWVudEhlaWdodCA+PiAxKSArICdweCdcblx0XHRcdHJpZ2h0RnJvbnQuc3R5bGUubGVmdCA9ICgoYmxvY2tTaXplWzBdIDw8IDEpID4+IDEpIC0gKHJpZ2h0RnJvbnQuY2xpZW50V2lkdGggPj4gMSkgKyAncHgnXG5cdFx0fSlcblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiByZXNpemVcblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBib3R0b21UZXh0cyIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgY2hhcmFjdGVyVXJsLCB0ZXh0dXJlU2l6ZSwgb25Nb3VzZU92ZXIsIG9uTW91c2VPdXQsIG9uQ2xpY2spPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgdGV4ID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShjaGFyYWN0ZXJVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4KVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlXG5cdHNwcml0ZS5idXR0b25Nb2RlID0gdHJ1ZVxuXHRzcHJpdGUub24oJ21vdXNlb3ZlcicsIG9uTW91c2VPdmVyKVxuXHRzcHJpdGUub24oJ21vdXNlb3V0Jywgb25Nb3VzZU91dClcblx0c3ByaXRlLm9uKCdjbGljaycsIG9uQ2xpY2spXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggKyAoMTAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5ICsgKDEwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDNcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wM1xuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dIIC0gMTAwKSAvIHRleHR1cmVTaXplLmhlaWdodCkgKiAxXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0c3ByaXRlLmludGVyYWN0aXZlID0gZmFsc2Vcblx0XHRcdHNwcml0ZS5idXR0b25Nb2RlID0gZmFsc2Vcblx0XHRcdHNwcml0ZS5vZmYoJ21vdXNlb3ZlcicsIG9uTW91c2VPdmVyKVxuXHRcdFx0c3ByaXRlLm9mZignbW91c2VvdXQnLCBvbk1vdXNlT3V0KVxuXHRcdFx0c3ByaXRlLm9mZignY2xpY2snLCBvbkNsaWNrKVxuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKHNwcml0ZSlcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRzcHJpdGUgPSBudWxsXG5cdFx0XHR0ZXggPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgY29sb3JzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgYmdDb2xvcnMgPSBbXVxuXHRiZ0NvbG9ycy5sZW5ndGggPSA2XG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBiZ0NvbG9yID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdGJnQ29sb3JzW2ldID0gYmdDb2xvclxuXHRcdGhvbGRlci5hZGRDaGlsZChiZ0NvbG9yKVxuXHR9O1xuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDEuNSlcblx0XHR0bC5wbGF5KDApXG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgyKVxuXHRcdHRsLnJldmVyc2UoKVxuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHR0bDogdGwsXG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICh3aWR0aCwgaGVpZ2h0LCBkaXJlY3Rpb24pPT57XG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGhzID0gY29sb3JzLmZyb20uaCAtIGNvbG9ycy50by5oXG5cdFx0XHR2YXIgc3MgPSBjb2xvcnMuZnJvbS5zIC0gY29sb3JzLnRvLnNcblx0XHRcdHZhciB2cyA9IGNvbG9ycy5mcm9tLnYgLSBjb2xvcnMudG8udlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBIID0gaHMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwUyA9IHNzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFYgPSB2cyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIGhkID0gKGhzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciBzZCA9IChzcyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgdmQgPSAodnMgPCAwKSA/IC0xIDogMVxuXG5cdFx0XHR2YXIgZGVsYXkgPSAwLjEyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0dmFyIGggPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLmggKyAoc3RlcEgqaSpoZCkpXG5cdFx0XHRcdHZhciBzID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5zICsgKHN0ZXBTKmkqc2QpKVxuXHRcdFx0XHR2YXIgdiA9IE1hdGgucm91bmQoY29sb3JzLmZyb20udiArIChzdGVwVippKnZkKSlcblx0XHRcdFx0dmFyIGMgPSAnMHgnICsgY29sb3JVdGlscy5oc3ZUb0hleChoLCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5UT1A6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6aGVpZ2h0IH0sIHsgeTotaGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkJPVFRPTTpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotaGVpZ2h0IH0sIHsgeTpoZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuTEVGVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDp3aWR0aCB9LCB7IHg6LXdpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlJJR0hUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4Oi13aWR0aCB9LCB7IHg6d2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9O1xuXG5cdFx0XHR0bC5wYXVzZSgwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGwuY2xlYXIoKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoYmdDb2xvcilcblx0XHRcdFx0YmdDb2xvciA9IG51bGxcblx0XHRcdH07XG5cdFx0XHRiZ0NvbG9ycyA9IG51bGxcblx0XHRcdHRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgYmdVcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIGJnVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoYmdVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoYmdUZXh0dXJlKVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRiZ1Nwcml0ZTogc3ByaXRlLFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCAtICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wMDhcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wMDhcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHNpemVbMF0sIHNpemVbMV0sIDk2MCwgMTAyNClcblxuXHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSA+PiAxXG5cdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gcmVzaXplVmFycy5zY2FsZSArIDAuMVxuXHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yeVJlY3RzIGZyb20gJ2NvbG9yeS1yZWN0cydcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBwYXJlbnQsIG1vdXNlLCBkYXRhKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5mdW4tZmFjdC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdmlkZW9XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnZpZGVvLXdyYXBwZXInLCBlbClcblx0dmFyIG1lc3NhZ2VXcmFwcGVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2Utd3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZUlubmVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2UtaW5uZXInLCBtZXNzYWdlV3JhcHBlcilcblxuXHR2YXIgc3BsaXR0ZXIgPSBuZXcgU3BsaXRUZXh0KG1lc3NhZ2VJbm5lciwge3R5cGU6XCJ3b3Jkc1wifSlcblxuXHR2YXIgYyA9IGRvbS5zZWxlY3QoJy5jdXJzb3ItY3Jvc3MnLCBlbClcblx0dmFyIGNyb3NzID0ge1xuXHRcdHg6IDAsXG5cdFx0eTogMCxcblx0XHRlbDogYyxcblx0XHRzaXplOiBkb20uc2l6ZShjKVxuXHR9XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgbGVmdFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cdHZhciByaWdodFJlY3RzID0gY29sb3J5UmVjdHMoaG9sZGVyLCBkYXRhWydhbWJpZW50LWNvbG9yJ10pXG5cblx0dmFyIG1CZ0NvbG9yID0gZGF0YVsnYW1iaWVudC1jb2xvciddLnRvXG5cdG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgobUJnQ29sb3IuaCwgbUJnQ29sb3IucywgbUJnQ29sb3IudilcblxuXHR2YXIgbGVmdFRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0dmFyIHJpZ2h0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZSxcblx0XHRsb29wOiB0cnVlXG5cdH0pXG5cdHZhciB2aWRlb1NyYyA9ICdodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzJhMzMxM2VhM2FlMjg2MmUxMTU2YTUyMGEzMWNhMDk3OWY3YzJhYWQvaGVsbG8ubXA0J1xuXHRtVmlkZW8uYWRkVG8odmlkZW9XcmFwcGVyKVxuXHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXG5cdHZhciBvbkNsb3NlRnVuRmFjdCA9ICgpPT4ge1xuXHRcdGlmKCFzY29wZS5pc09wZW4pIHJldHVyblxuXHRcdHNjb3BlLmNsb3NlKClcblx0fVxuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHRcdGxlZnRSZWN0cy5vcGVuKClcblx0XHRyaWdodFJlY3RzLm9wZW4oKVxuXHRcdHZhciBkZWxheSA9IDM1MFxuXHRcdHNldFRpbWVvdXQoKCk9PmxlZnRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5yaWdodFRsLnRpbWVTY2FsZSgxLjUpLnBsYXkoMCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9Pm1WaWRlby5wbGF5KCksIGRlbGF5KzIwMClcblx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ25vbmUnXG5cdFx0ZG9tLmV2ZW50Lm9uKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0fVxuXHR2YXIgY2xvc2UgPSAoKT0+IHtcblx0XHRzY29wZS5pc09wZW4gPSBmYWxzZVxuXHRcdGxlZnRSZWN0cy5jbG9zZSgpXG5cdFx0cmlnaHRSZWN0cy5jbG9zZSgpXG5cdFx0dmFyIGRlbGF5ID0gNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDIpLnJldmVyc2UoKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMikucmV2ZXJzZSgpLCBkZWxheSlcblx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nXG5cdFx0ZG9tLmV2ZW50Lm9mZihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc09wZW46IGZhbHNlLFxuXHRcdG9wZW46IG9wZW4sXG5cdFx0Y2xvc2U6IGNsb3NlLFxuXHRcdHJlc2l6ZTogKCk9Pntcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBtaWRXaW5kb3dXID0gKHdpbmRvd1cgPj4gMSlcblxuXG5cdFx0XHR2YXIgc2l6ZSA9IFttaWRXaW5kb3dXICsgMSwgd2luZG93SF1cblxuXHRcdFx0bGVmdFJlY3RzLnJlc2l6ZShzaXplWzBdLCBzaXplWzFdLCBBcHBDb25zdGFudHMuVE9QKVxuXHRcdFx0cmlnaHRSZWN0cy5yZXNpemUoc2l6ZVswXSwgc2l6ZVsxXSwgQXBwQ29uc3RhbnRzLkJPVFRPTSlcblx0XHRcdHJpZ2h0UmVjdHMuaG9sZGVyLnggPSB3aW5kb3dXIC8gMlxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIHZpZGVvIGlzbid0IHJlYWR5IHJldHVyblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHR2YXIgdmlkZW9XcmFwcGVyUmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkobWlkV2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XID4+IDEsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLndpZHRoID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUud2lkdGggPSBtaWRXaW5kb3dXICsgJ3B4J1xuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLmhlaWdodCA9IG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUubGVmdCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUud2lkdGggPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmhlaWdodCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLnRvcCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdHZhciBtZXNzYWdlSW5uZXJTaXplID0gZG9tLnNpemUobWVzc2FnZUlubmVyKVxuXHRcdFx0XHRtZXNzYWdlSW5uZXIuc3R5bGUubGVmdCA9IChtaWRXaW5kb3dXID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdG1lc3NhZ2VJbm5lci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChtZXNzYWdlSW5uZXJTaXplWzFdID4+IDEpICsgJ3B4J1xuXHRcdFx0fSwgMClcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0bGVmdFRsLmNsZWFyKClcblx0XHRcdFx0cmlnaHRUbC5jbGVhcigpXG5cblx0XHRcdFx0bGVmdFRsLmZyb21UbyhtZXNzYWdlV3JhcHBlciwgMS40LCB7IHk6d2luZG93SCwgc2NhbGVZOjMsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0XHRcdGxlZnRUbC5zdGFnZ2VyRnJvbShzcGxpdHRlci53b3JkcywgMSwgeyB5OjE0MDAsIHNjYWxlWTo2LCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuMDYsIDAuMilcblx0XHRcdFx0cmlnaHRUbC5mcm9tVG8odmlkZW9XcmFwcGVyLCAxLjQsIHsgeTotd2luZG93SCoyLCBzY2FsZVk6MywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScgfSwgeyB5OjAsIHNjYWxlWToxLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cblx0XHRcdFx0bGVmdFRsLnBhdXNlKDApXG5cdFx0XHRcdHJpZ2h0VGwucGF1c2UoMClcblx0XHRcdH0sIDUpXG5cblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRcdHZhciBuZXd4ID0gbW91c2UueCAtIChjcm9zcy5zaXplWzBdID4+IDEpXG5cdFx0XHR2YXIgbmV3eSA9IG1vdXNlLnkgLSAoY3Jvc3Muc2l6ZVsxXSA+PiAxKVxuXHRcdFx0Y3Jvc3MueCArPSAobmV3eCAtIGNyb3NzLngpICogMC41XG5cdFx0XHRjcm9zcy55ICs9IChuZXd5IC0gY3Jvc3MueSkgKiAwLjVcblx0XHRcdFV0aWxzLlRyYW5zbGF0ZShjcm9zcy5lbCwgY3Jvc3MueCwgY3Jvc3MueSwgMSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGxlZnRSZWN0cy5jbGVhcigpXG5cdFx0XHRsZWZ0UmVjdHMgPSBudWxsXG5cdFx0XHRyaWdodFJlY3RzLmNsZWFyKClcblx0XHRcdHJpZ2h0UmVjdHMgPSBudWxsXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCB2aWRlb0NhbnZhcyBmcm9tICd2aWRlby1jYW52YXMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBncmlkID0gKHByb3BzLCBwYXJlbnQsIG9uSXRlbUVuZGVkKT0+IHtcblxuXHR2YXIgdmlkZW9FbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgaW1hZ2VFbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgZ3JpZENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgbGluZXNHcmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmxpbmVzLWdyaWQtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgZ3JpZENoaWxkcmVuID0gZ3JpZENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgbGluZXNIb3Jpem9udGFsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAudmVydGljYWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgc2NvcGU7XG5cdHZhciBjdXJyZW50U2VhdDtcblx0dmFyIGl0ZW1zID0gW11cblx0dmFyIHRvdGFsTnVtID0gcHJvcHMuZGF0YS5ncmlkLmxlbmd0aFxuXHR2YXIgdmlkZW9zID0gQXBwU3RvcmUuZ2V0SG9tZVZpZGVvcygpXG5cblx0dmFyIHZDYW52YXNQcm9wcyA9IHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0dm9sdW1lOiAwLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdG9uRW5kZWQ6IHZpZGVvRW5kZWRcblx0fVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxOdW07IGkrKykge1xuXHRcdHZhciB2UGFyZW50ID0gZ3JpZENoaWxkcmVuW2ldXG5cdFx0dmFyIHZpZGVvSW5kZXggPSBpICUgdmlkZW9zLmxlbmd0aFxuXHRcdHZhciB2Q2FudmFzID0gdmlkZW9DYW52YXMoIHZpZGVvc1t2aWRlb0luZGV4XSwgdkNhbnZhc1Byb3BzIClcblx0XHR2UGFyZW50LmFwcGVuZENoaWxkKHZDYW52YXMuY2FudmFzKVxuXHRcdGl0ZW1zW2ldID0gdkNhbnZhc1xuXHR9XG5cblx0dmFyIHJlc2l6ZSA9ICgpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgb3JpZ2luYWxWaWRlb1NpemUgPSBBcHBDb25zdGFudHMuSE9NRV9WSURFT19TSVpFXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TIF1cblxuXHRcdGxpbmVzR3JpZENvbnRhaW5lci5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0bGluZXNHcmlkQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0bGluZXNHcmlkQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG5cdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdLCBvcmlnaW5hbFZpZGVvU2l6ZVswXSwgb3JpZ2luYWxWaWRlb1NpemVbMV0pXG5cblx0XHR2YXIgcG9zID0gWyAwLCAwIF1cblx0XHR2YXIgaG9yaXpvbnRhbExpbmVzSW5kZXggPSAwXG5cdFx0dmFyIHZlcnRpY2FsTGluZXNJbmRleCA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjb3BlLm51bTsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHNjb3BlLml0ZW1zW2ldXG5cdFx0XHR2YXIgcGFyZW50ID0gc2NvcGUuY2hpbGRyZW5baV1cblxuXHRcdFx0cGFyZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdFx0cGFyZW50LnN0eWxlLndpZHRoID0gYmxvY2tTaXplWyAwIF0gKyAncHgnXG5cdFx0XHRwYXJlbnQuc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWyAxIF0gKyAncHgnXG5cdFx0XHRwYXJlbnQuc3R5bGUubGVmdCA9IHBvc1sgMCBdICsgJ3B4J1xuXHRcdFx0cGFyZW50LnN0eWxlLnRvcCA9IHBvc1sgMSBdICsgJ3B4J1xuXHRcdFx0XG5cdFx0XHRpdGVtLmNhbnZhcy53aWR0aCA9IGJsb2NrU2l6ZVsgMCBdXG5cdFx0XHRpdGVtLmNhbnZhcy5oZWlnaHQgPSBibG9ja1NpemVbIDEgXVxuXHRcdFx0aXRlbS5yZXNpemUocmVzaXplVmFycy5sZWZ0LCByZXNpemVWYXJzLnRvcCwgcmVzaXplVmFycy53aWR0aCwgcmVzaXplVmFycy5oZWlnaHQpXG5cdFx0XHRpdGVtLmRyYXdPbmNlKClcblx0XHRcdFxuXHRcdFx0aWYoaSA+IDApIHtcblx0XHRcdFx0dmFyIHZsID0gc2NvcGUubGluZXMudmVydGljYWxbdmVydGljYWxMaW5lc0luZGV4XVxuXHRcdFx0XHRpZih2bCkgdmwuc3R5bGUubGVmdCA9IHBvc1sgMCBdICsgJ3B4J1xuXHRcdFx0XHR2ZXJ0aWNhbExpbmVzSW5kZXggKz0gMVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBwb3NpdGlvbnNcblx0XHRcdHNjb3BlLnBvc2l0aW9uc1sgaSBdID0gWyBwb3NbIDAgXSwgcG9zWyAxIF0gXVxuXHRcdFx0cG9zWyAwIF0gKz0gYmxvY2tTaXplWyAwIF1cblx0XHRcdGlmKCBwb3NbIDAgXSA+IHdpbmRvd1cgLSAoYmxvY2tTaXplWyAwIF0gPj4gMSkgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRwb3NbIDEgXSArPSBibG9ja1NpemVbIDEgXVxuXHRcdFx0XHRwb3NbIDAgXSA9IDBcblxuXHRcdFx0XHR2YXIgaGwgPSBzY29wZS5saW5lcy5ob3Jpem9udGFsW2hvcml6b250YWxMaW5lc0luZGV4XVxuXHRcdFx0XHRpZihobCkgaGwuc3R5bGUudG9wID0gcG9zWyAxIF0gKyAncHgnXG5cdFx0XHRcdGhvcml6b250YWxMaW5lc0luZGV4ICs9IDFcblx0XHRcdH1cblx0XHR9O1xuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRlbDogZ3JpZENvbnRhaW5lcixcblx0XHRjaGlsZHJlbjogZ3JpZENoaWxkcmVuLFxuXHRcdGl0ZW1zOiBpdGVtcyxcblx0XHRudW06IHRvdGFsTnVtLFxuXHRcdHBvc2l0aW9uczogW10sXG5cdFx0bGluZXM6IHtcblx0XHRcdGhvcml6b250YWw6IGxpbmVzSG9yaXpvbnRhbCxcblx0XHRcdHZlcnRpY2FsOiBsaW5lc1ZlcnRpY2FsXG5cdFx0fSxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHR0cmFuc2l0aW9uSW5JdGVtOiAoaW5kZXgsIHR5cGUpPT4ge1xuXHRcdFx0dmFyIGl0ZW0gPSBzY29wZS5pdGVtc1tpbmRleF1cblx0XHRcdGl0ZW0uc2VhdCA9IGluZGV4XG5cblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZScpXG5cdFx0XHRcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklURU1fVklERU8pIHtcblx0XHRcdFx0aXRlbS5wbGF5KClcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRpdGVtLnRpbWVvdXQoaW1hZ2VFbmRlZCwgMjAwMClcblx0XHRcdFx0aXRlbS5zZWVrKFV0aWxzLlJhbmQoMiwgMTAsIDApKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbk91dEl0ZW06IChpdGVtKT0+IHtcblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZScpXG5cblx0XHRcdGl0ZW0udmlkZW8uY3VycmVudFRpbWUgPSAwXG5cdFx0XHRpdGVtLnBhdXNlKClcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0aXRlbS5kcmF3T25jZSgpXG5cdFx0XHR9LCA1MDApXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGl0ZW1zW2ldLmNsZWFyKClcblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgaGVhZGVyTGlua3MgPSAocGFyZW50KT0+IHtcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvblN1Yk1lbnVNb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLmFkZChlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgY2FtcGVyTGFiRWwgPSBkb20uc2VsZWN0KCcuY2FtcGVyLWxhYicsIHBhcmVudClcblx0dmFyIHNob3BFbCA9IGRvbS5zZWxlY3QoJy5zaG9wLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBtYXBFbCA9IGRvbS5zZWxlY3QoJy5tYXAtYnRuJywgcGFyZW50KVxuXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblN1Yk1lbnVNb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAvIDNcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtIGRvbS5zaXplKGNhbXBlckxhYkVsKVswXSxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgc2hvcENzcyA9IHtcblx0XHRcdFx0bGVmdDogY2FtcGVyTGFiQ3NzLmxlZnQgLSBkb20uc2l6ZShzaG9wRWwpWzBdIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSBkb20uc2l6ZShtYXBFbClbMF0gLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUubGVmdCA9IGNhbXBlckxhYkNzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS5sZWZ0ID0gc2hvcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUubGVmdCA9IG1hcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdNYXBfaGJzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCB0eXBlKSA9PiB7XG5cblx0dmFyIG9uRG90Q2xpY2sgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS50YXJnZXQuaWRcblx0XHR2YXIgcGFyZW50SWQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRSb3V0ZXIuc2V0SGFzaChwYXJlbnRJZCArICcvJyArIGlkKVxuXHR9XG5cblx0Ly8gcmVuZGVyIG1hcFxuXHR2YXIgbWFwV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0dmFyIHQgPSB0ZW1wbGF0ZSgpXG5cdGVsLmlubmVySFRNTCA9IHRcblx0ZG9tLnRyZWUuYWRkKG1hcFdyYXBwZXIsIGVsKVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGRpciwgc3RlcEVsO1xuXHR2YXIgc2VsZWN0ZWREb3RzID0gW107XG5cdHZhciBjdXJyZW50UGF0aHMsIGZpbGxMaW5lLCBkYXNoZWRMaW5lLCBzdGVwVG90YWxMZW4gPSAwO1xuXHR2YXIgcHJldmlvdXNIaWdobGlnaHRJbmRleCA9IHVuZGVmaW5lZDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1hcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgbWFwZG90cyA9IGRvbS5zZWxlY3QuYWxsKCcjbWFwLWRvdHMgLmRvdC1wYXRoJywgZWwpXG5cdHZhciBmb290c3RlcHMgPSBkb20uc2VsZWN0LmFsbCgnI2Zvb3RzdGVwcyBnJywgZWwpXG5cblx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRkb20uZXZlbnQub24oZG90LCAnY2xpY2snLCBvbkRvdENsaWNrKVxuXHRcdH07XG5cdH1cblxuXHR2YXIgdGl0bGVzID0ge1xuXHRcdCdkZWlhJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5kZWlhJywgdGl0bGVzV3JhcHBlcilcblx0XHR9LFxuXHRcdCdlcy10cmVuYyc6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuZXMtdHJlbmMnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2FyZWxsdWYnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmFyZWxsdWYnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRpdGxlUG9zWChwYXJlbnRXLCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudFcgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogdmFsXG5cdH1cblx0ZnVuY3Rpb24gdGl0bGVQb3NZKHBhcmVudEgsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50SCAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSCkgKiB2YWxcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBtYXBXID0gNjkzLCBtYXBIID0gNjQ1XG5cdFx0XHR2YXIgbWFwU2l6ZSA9IFtdXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyowLjQ3LCB3aW5kb3dIKjAuNDcsIG1hcFcsIG1hcEgpXG5cdFx0XHRtYXBTaXplWzBdID0gbWFwVyAqIHJlc2l6ZVZhcnMuc2NhbGVcblx0XHRcdG1hcFNpemVbMV0gPSBtYXBIICogcmVzaXplVmFycy5zY2FsZVxuXG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IG1hcFNpemVbMF0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPSBtYXBTaXplWzFdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKG1hcFNpemVbMF0gPj4gMSkgLSA0MCArICdweCdcblx0XHRcdGVsLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1hcFNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgNzQwKSArICdweCdcblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCAyNTApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgMTI4MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDY5MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDM2MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgNDAwKSArICdweCdcblx0XHR9LFxuXHRcdGhpZ2hsaWdodERvdHM6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHNlbGVjdGVkRG90cyA9IFtdXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0dmFyIGlkID0gZG90LmlkXG5cdFx0XHRcdHZhciBwYXJlbnRJZCA9IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRcdFx0aWYoaWQgPT0gb2xkSGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gb2xkSGFzaC5wYXJlbnQpIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdFx0aWYoaWQgPT0gbmV3SGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gbmV3SGFzaC5wYXJlbnQpICBzZWxlY3RlZERvdHMucHVzaChkb3QpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gc2VsZWN0ZWREb3RzW2ldXG5cdFx0XHRcdGRvbS5jbGFzc2VzLmFkZChkb3QsICdhbmltYXRlJylcblx0XHRcdH07XG5cdFx0fSxcblx0XHRoaWdobGlnaHQ6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHZhciBvbGRJZCA9IG9sZEhhc2gudGFyZ2V0XG5cdFx0XHR2YXIgbmV3SWQgPSBuZXdIYXNoLnRhcmdldFxuXHRcdFx0dmFyIGN1cnJlbnQgPSBvbGRJZCArICctJyArIG5ld0lkXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvb3RzdGVwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgc3RlcCA9IGZvb3RzdGVwc1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBzdGVwLmlkXG5cdFx0XHRcdGlmKGlkLmluZGV4T2Yob2xkSWQpID4gLTEgJiYgaWQuaW5kZXhPZihuZXdJZCkgPiAtMSkge1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBsYXN0IG9uZVxuXHRcdFx0XHRcdGlmKGkgPT0gcHJldmlvdXNIaWdobGlnaHRJbmRleCkgc3RlcEVsID0gZm9vdHN0ZXBzW2Zvb3RzdGVwcy5sZW5ndGgtMV1cblx0XHRcdFx0XHRlbHNlIHN0ZXBFbCA9IHN0ZXBcblxuXHRcdFx0XHRcdGRpciA9IGlkLmluZGV4T2YoY3VycmVudCkgPiAtMSA/IEFwcENvbnN0YW50cy5GT1JXQVJEIDogQXBwQ29uc3RhbnRzLkJBQ0tXQVJEXG5cdFx0XHRcdFx0cHJldmlvdXNIaWdobGlnaHRJbmRleCA9IGlcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0c2NvcGUuaGlnaGxpZ2h0RG90cyhvbGRIYXNoLCBuZXdIYXNoKVxuXG5cdFx0XHRjdXJyZW50UGF0aHMgPSBkb20uc2VsZWN0LmFsbCgncGF0aCcsIHN0ZXBFbClcblx0XHRcdGRhc2hlZExpbmUgPSBjdXJyZW50UGF0aHNbMF1cblxuXHRcdFx0Ly8gY2hvb3NlIHBhdGggZGVwZW5kcyBvZiBmb290c3RlcCBkaXJlY3Rpb25cblx0XHRcdGlmKGRpciA9PSBBcHBDb25zdGFudHMuRk9SV0FSRCkge1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1sxXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1syXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1cblxuXHRcdFx0c3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cblx0XHRcdC8vIGZpbmQgdG90YWwgbGVuZ3RoIG9mIHNoYXBlXG5cdFx0XHRzdGVwVG90YWxMZW4gPSBmaWxsTGluZS5nZXRUb3RhbExlbmd0aCgpXG5cdFx0XHRmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IDBcblx0XHRcdGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaGFycmF5J10gPSBzdGVwVG90YWxMZW5cblx0XHRcdFxuXHRcdFx0Ly8gc3RhcnQgYW5pbWF0aW9uIG9mIGRhc2hlZCBsaW5lXG5cdFx0XHRkb20uY2xhc3Nlcy5hZGQoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0XHQvLyBzdGFydCBhbmltYXRpb25cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0fSxcblx0XHRyZXNldEhpZ2hsaWdodDogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdHN0ZXBFbC5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0Y3VycmVudFBhdGhzWzJdLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZG90LCAnYW5pbWF0ZScpXG5cdFx0XHRcdH07XG5cdFx0XHR9LCAwKVxuXHRcdH0sXG5cdFx0dXBkYXRlUHJvZ3Jlc3M6IChwcm9ncmVzcyk9PiB7XG5cdFx0XHRpZihmaWxsTGluZSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdFx0dmFyIGRhc2hPZmZzZXQgPSAocHJvZ3Jlc3MgLyAxKSAqIHN0ZXBUb3RhbExlblxuXHRcdFx0ZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNob2Zmc2V0J10gPSBkYXNoT2Zmc2V0XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0XHRcdGRvdC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uRG90Q2xpY2spXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR0aXRsZXMgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IChwcm9wcyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuXHR2YXIgb25SZWFkeUNhbGxiYWNrO1xuXHR2YXIgc2l6ZSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9XG5cdHZhciBlTGlzdGVuZXJzID0gW11cblxuXHR2YXIgb25DYW5QbGF5ID0gKCk9Pntcblx0XHRpZihwcm9wcy5hdXRvcGxheSkgdmlkZW8ucGxheSgpXG5cdFx0aWYocHJvcHMudm9sdW1lICE9IHVuZGVmaW5lZCkgdmlkZW8udm9sdW1lID0gcHJvcHMudm9sdW1lXG5cdFx0c2l6ZS53aWR0aCA9IHZpZGVvLnZpZGVvV2lkdGhcblx0XHRzaXplLmhlaWdodCA9IHZpZGVvLnZpZGVvSGVpZ2h0XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICAgICAgb25SZWFkeUNhbGxiYWNrKHNjb3BlKVxuXHR9XG5cblx0dmFyIHBsYXkgPSAodGltZSk9Pntcblx0XHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IHRydWVcbiAgICBcdHZpZGVvLnBsYXkoKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKHRpbWUpPT57XG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICBcdGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgIH1cblxuXHR2YXIgYWRkVG8gPSAocCk9PiB7XG5cdFx0c2NvcGUucGFyZW50ID0gcFxuXHRcdGRvbS50cmVlLmFkZChzY29wZS5wYXJlbnQsIHZpZGVvKVxuXHR9XG5cblx0dmFyIG9uID0gKGV2ZW50LCBjYik9PiB7XG5cdFx0ZUxpc3RlbmVycy5wdXNoKHtldmVudDpldmVudCwgY2I6Y2J9KVxuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIG9mZiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHRcdFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdFx0XHRpZihlLmV2ZW50ID09IGV2ZW50ICYmIGUuY2IgPT0gY2IpIHtcblx0XHRcdFx0ZUxpc3RlbmVycy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG5cdH1cblxuXHR2YXIgY2xlYXJBbGxFdmVudHMgPSAoKT0+IHtcblx0ICAgIGZvciAodmFyIGkgaW4gZUxpc3RlbmVycykge1xuXHQgICAgXHR2YXIgZSA9IGVMaXN0ZW5lcnNbaV1cblx0ICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLmV2ZW50LCBlLmNiKTtcblx0ICAgIH1cblx0fVxuXG5cdHZhciBjbGVhciA9ICgpPT4ge1xuICAgIFx0dmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdCAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblx0ICAgIHNjb3BlLmNsZWFyQWxsRXZlbnRzKClcblx0ICAgIHNpemUgPSBudWxsXG4gICAgfVxuXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcblxuXHRzY29wZSA9IHtcblx0XHRwYXJlbnQ6IHVuZGVmaW5lZCxcblx0XHRlbDogdmlkZW8sXG5cdFx0c2l6ZTogc2l6ZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHNlZWs6IHNlZWssXG5cdFx0cGF1c2U6IHBhdXNlLFxuXHRcdGFkZFRvOiBhZGRUbyxcblx0XHRvbjogb24sXG5cdFx0b2ZmOiBvZmYsXG5cdFx0Y2xlYXI6IGNsZWFyLFxuXHRcdGNsZWFyQWxsRXZlbnRzOiBjbGVhckFsbEV2ZW50cyxcblx0XHRpc1BsYXlpbmc6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuXHRcdGxvYWQ6IChzcmMsIGNhbGxiYWNrKT0+IHtcblx0XHRcdG9uUmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrXG5cdFx0XHR2aWRlby5zcmMgPSBzcmNcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGlwdHlxdWVQYXJ0IGZyb20gJ2RpcHR5cXVlLXBhcnQnXG5pbXBvcnQgY2hhcmFjdGVyIGZyb20gJ2NoYXJhY3RlcidcbmltcG9ydCBmdW5GYWN0IGZyb20gJ2Z1bi1mYWN0LWhvbGRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgYXJyb3dzV3JhcHBlciBmcm9tICdhcnJvd3Mtd3JhcHBlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHNlbGZpZVN0aWNrIGZyb20gJ3NlbGZpZS1zdGljaydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlwdHlxdWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblxuXHRcdHZhciBuZXh0RGlwdHlxdWUgPSBBcHBTdG9yZS5nZXROZXh0RGlwdHlxdWUoKVxuXHRcdHZhciBwcmV2aW91c0RpcHR5cXVlID0gQXBwU3RvcmUuZ2V0UHJldmlvdXNEaXB0eXF1ZSgpXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wYWdlJ10gPSBuZXh0RGlwdHlxdWVcblx0XHRwcm9wcy5kYXRhWydwcmV2aW91cy1wYWdlJ10gPSBwcmV2aW91c0RpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wcmV2aWV3LXVybCddID0gQXBwU3RvcmUuZ2V0UHJldmlld1VybEJ5SGFzaChuZXh0RGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gocHJldmlvdXNEaXB0eXF1ZSlcblx0XHRwcm9wcy5kYXRhWydmYWN0LXR4dCddID0gcHJvcHMuZGF0YS5mYWN0W0FwcFN0b3JlLmxhbmcoKV1cblxuXHRcdHN1cGVyKHByb3BzKVxuXG5cdFx0dGhpcy5vbk1vdXNlTW92ZSA9IHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkFycm93TW91c2VFbnRlciA9IHRoaXMub25BcnJvd01vdXNlRW50ZXIuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlTGVhdmUgPSB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQ2hhcmFjdGVyTW91c2VPdmVyID0gdGhpcy5vbkNoYXJhY3Rlck1vdXNlT3Zlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkNoYXJhY3Rlck1vdXNlT3V0ID0gdGhpcy5vbkNoYXJhY3Rlck1vdXNlT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uQ2hhcmFjdGVyQ2xpY2tlZCA9IHRoaXMub25DaGFyYWN0ZXJDbGlja2VkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkID0gdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5sZWZ0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnc2hvZS1iZycpLFxuXHRcdFx0XG5cdFx0KVxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXItYmcnKVxuXHRcdClcblxuXHRcdHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3RlcicpLCB0aGlzLmdldEltYWdlU2l6ZUJ5SWQoJ2NoYXJhY3RlcicpLCB0aGlzLm9uQ2hhcmFjdGVyTW91c2VPdmVyLCB0aGlzLm9uQ2hhcmFjdGVyTW91c2VPdXQsIHRoaXMub25DaGFyYWN0ZXJDbGlja2VkKVxuXHRcdHRoaXMuZnVuRmFjdCA9IGZ1bkZhY3QodGhpcy5weENvbnRhaW5lciwgdGhpcy5lbGVtZW50LCB0aGlzLm1vdXNlLCB0aGlzLnByb3BzLmRhdGEpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyID0gYXJyb3dzV3JhcHBlcih0aGlzLmVsZW1lbnQsIHRoaXMub25BcnJvd01vdXNlRW50ZXIsIHRoaXMub25BcnJvd01vdXNlTGVhdmUpXG5cdFx0dGhpcy5zZWxmaWVTdGljayA9IHNlbGZpZVN0aWNrKHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cblx0XHRkb20uZXZlbnQub24od2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnY2xpY2snLCB0aGlzLm9uQ2xpY2spXG5cblx0XHRUd2Vlbk1heC5zZXQodGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoJ2xlZnQnKSwgeyB4Oi1BcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HIH0pXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdyaWdodCcpLCB7IHg6QXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMubGVmdFBhcnQuYmdTcHJpdGUueCAtIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUuc2NhbGUsIDEsIHsgeDogMywgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC40KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5yaWdodFBhcnQuYmdTcHJpdGUueCArIDIwMCwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuNClcblxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5sZWZ0UGFydC5ob2xkZXIsIDEsIHsgeDogLXdpbmRvd1cgPj4gMSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5yaWdodFBhcnQuaG9sZGVyLCAxLCB7IHg6IHdpbmRvd1csIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblxuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0b25Nb3VzZU1vdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5tb3VzZS54ID0gZS5jbGllbnRYXG5cdFx0dGhpcy5tb3VzZS55ID0gZS5jbGllbnRZXG5cdFx0dGhpcy5tb3VzZS5uWCA9IChlLmNsaWVudFggLyB3aW5kb3dXKSAqIDFcblx0XHR0aGlzLm1vdXNlLm5ZID0gKGUuY2xpZW50WSAvIHdpbmRvd0gpICogMVxuXG5cdFx0Ly8gaWYodGhpcy5tb3VzZS5uWCA+IDAuNSkgQXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJ1xuXHRcdC8vIGVsc2UgQXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXG5cdH1cblx0b25DbGljayhlKSB7XG5cblx0fVxuXHRvbkNoYXJhY3Rlck1vdXNlT3ZlcigpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnb3ZlcicpXG5cdH1cblx0b25DaGFyYWN0ZXJNb3VzZU91dCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnb3V0Jylcblx0fVxuXHRvbkNoYXJhY3RlckNsaWNrZWQoKSB7XG5cdFx0aWYodGhpcy5mdW5GYWN0LmlzT3Blbikge1xuXHRcdFx0dGhpcy5mdW5GYWN0LmNsb3NlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuZnVuRmFjdC5vcGVuKClcblx0XHR9XG5cdH1cblx0b25TZWxmaWVTdGlja0NsaWNrZWQoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlmKHRoaXMuc2VsZmllU3RpY2suaXNPcGVuZWQpIHtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2suY2xvc2UoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5zZWxmaWVTdGljay5vcGVuKClcblx0XHR9XG5cdH1cblx0b25BcnJvd01vdXNlRW50ZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IC1vZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjQsIHsgeDpwb3NYLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjQsIHsgeDowLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cblx0XHR0aGlzLmFycm93c1dyYXBwZXIub3ZlcihpZClcblx0fVxuXHRvbkFycm93TW91c2VMZWF2ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cblx0XHR2YXIgcG9zWDtcblx0XHR2YXIgb2Zmc2V0WCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblx0XHRpZihpZCA9PSAnbGVmdCcpIHBvc1ggPSAtb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IG9mZnNldFhcblxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMucHhDb250YWluZXIsIDAuNiwgeyB4OjAsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjYsIHsgeDpwb3NYLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm91dChpZClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5jaGFyYWN0ZXIudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5sZWZ0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnJpZ2h0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnVwZGF0ZSgpXG5cdFx0dGhpcy5mdW5GYWN0LnVwZGF0ZSgpXG5cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5sZWZ0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5jaGFyYWN0ZXIucmVzaXplKClcblx0XHR0aGlzLmZ1bkZhY3QucmVzaXplKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIucmVzaXplKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnJlc2l6ZSgpXG5cblx0XHR0aGlzLnJpZ2h0UGFydC5ob2xkZXIueCA9ICh3aW5kb3dXID4+IDEpXG5cblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ2NsaWNrJywgdGhpcy5vbkNsaWNrKVxuXHRcdGRvbS5ldmVudC5vZmYodGhpcy5zZWxmaWVTdGljay5lbCwgJ2NsaWNrJywgdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZClcblx0XHR0aGlzLmxlZnRQYXJ0LmNsZWFyKClcblx0XHR0aGlzLnJpZ2h0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5jaGFyYWN0ZXIuY2xlYXIoKVxuXHRcdHRoaXMuZnVuRmFjdC5jbGVhcigpXG5cdFx0dGhpcy5zZWxmaWVTdGljay5jbGVhcigpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLmNsZWFyKClcblx0XHR0aGlzLm1vdXNlID0gbnVsbFxuXHRcdHRoaXMubGVmdFBhcnQgPSBudWxsXG5cdFx0dGhpcy5yaWdodFBhcnQgPSBudWxsXG5cdFx0dGhpcy5jaGFyYWN0ZXIgPSBudWxsXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyID0gbnVsbFxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG4iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGJvdHRvbVRleHRzIGZyb20gJ2JvdHRvbS10ZXh0cy1ob21lJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZ3JpZCBmcm9tICdncmlkLWhvbWUnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb21lIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSBBcHBTdG9yZS5wYWdlQ29udGVudCgpXG5cdFx0cHJvcHMuZGF0YS5ncmlkID0gW11cblx0XHRwcm9wcy5kYXRhLmdyaWQubGVuZ3RoID0gMjhcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10gPSB7IGhvcml6b250YWw6IFtdLCB2ZXJ0aWNhbDogW10gfVxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS5ob3Jpem9udGFsLmxlbmd0aCA9IDNcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10udmVydGljYWwubGVuZ3RoID0gNlxuXHRcdHByb3BzLmRhdGFbJ3RleHRfYSddID0gY29udGVudC50ZXh0c1sndHh0X2EnXVxuXHRcdHByb3BzLmRhdGFbJ2FfdmlzaW9uJ10gPSBjb250ZW50LnRleHRzWydhX3Zpc2lvbiddXG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dmFyIGJnVXJsID0gdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2JhY2tncm91bmQnKVxuXHRcdHRoaXMucHJvcHMuZGF0YS5iZ3VybCA9IGJnVXJsXG5cblx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtID0gdGhpcy50cmlnZ2VyTmV3SXRlbS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkl0ZW1FbmRlZCA9IHRoaXMub25JdGVtRW5kZWQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubGFzdEdyaWRJdGVtSW5kZXg7XG5cdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMjAwXG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDAsIDEsIDIsIDMsIDQsIDUsIDYsXG5cdFx0XHQ3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMyxcblx0XHRcdDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLFxuXHRcdFx0MjMsIDI0LCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdHRoaXMuYmcgPSBkb20uc2VsZWN0KCcuYmctd3JhcHBlcicsIHRoaXMuZWxlbWVudClcblxuXHRcdHRoaXMuZ3JpZCA9IGdyaWQodGhpcy5wcm9wcywgdGhpcy5lbGVtZW50LCB0aGlzLm9uSXRlbUVuZGVkKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBib3R0b21UZXh0cyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBhcm91bmRCb3JkZXIodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHRyaWdnZXJOZXdJdGVtKHR5cGUpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLnNlYXRzW1V0aWxzLlJhbmQoMCwgdGhpcy5zZWF0cy5sZW5ndGggLSAxLCAwKV1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZihzZWF0ID09IGluZGV4KSB7XG5cdFx0XHRcdGlmKHRoaXMudXNlZFNlYXRzLmxlbmd0aCA8IHRoaXMuc2VhdHMubGVuZ3RoIC0gMikgdGhpcy50cmlnZ2VyTmV3SXRlbSh0eXBlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMudXNlZFNlYXRzLnB1c2goaW5kZXgpXG5cdFx0dGhpcy5ncmlkLnRyYW5zaXRpb25Jbkl0ZW0oaW5kZXgsIHR5cGUpXG5cdH1cblx0b25JdGVtRW5kZWQoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB1c2VkU2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZih1c2VkU2VhdCA9PSBpdGVtLnNlYXQpIHtcblx0XHRcdFx0dGhpcy51c2VkU2VhdHMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkKSByZXR1cm5cblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdGlmKHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA+IDgwMCkge1xuXHRcdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMFxuXHRcdFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9WSURFTylcblx0XHR9XG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyICs9IDFcblx0XHRpZih0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPiAzMCkge1xuXHRcdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXHRcdFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9JTUFHRSlcblx0XHR9XG5cdFx0c3VwZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcblx0XHR0aGlzLmdyaWQucmVzaXplKClcblx0XHR0aGlzLmJvdHRvbVRleHRzLnJlc2l6ZSgpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIucmVzaXplKClcblx0XHR0aGlzLm1hcC5yZXNpemUoKVxuXG5cdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHQvLyBiZ1xuXHRcdHRoaXMuYmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0dGhpcy5iZy5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnNCZy53aWR0aCArICdweCdcblx0XHR0aGlzLmJnLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnNCZy5oZWlnaHQgKyAncHgnXG5cdFx0dGhpcy5iZy5zdHlsZS50b3AgPSByZXNpemVWYXJzQmcudG9wICsgJ3B4J1xuXHRcdHRoaXMuYmcuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnNCZy5sZWZ0ICsgJ3B4J1xuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHR0aGlzLmdyaWQuY2xlYXIoKVxuXHRcdHRoaXMubWFwLmNsZWFyKClcblxuXHRcdHRoaXMuZ3JpZCA9IG51bGxcblx0XHR0aGlzLmJvdHRvbVRleHRzID0gbnVsbFxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyID0gbnVsbFxuXHRcdHRoaXMubWFwID0gbnVsbFxuXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbiIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBtb3VzZSwgZGF0YSk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBzY3JlZW5Ib2xkZXJTaXplID0gWzAsIDBdLCB2aWRlb0hvbGRlclNpemUgPSBbMCwgMF0sIHRvcE9mZnNldCA9IDA7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5zZWxmaWUtc3RpY2std3JhcHBlcicsIGhvbGRlcilcblx0dmFyIGJhY2tncm91bmQgPSBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGVsKVxuXHR2YXIgc2NyZWVuV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zY3JlZW4td3JhcHBlcicsIGVsKVxuXHR2YXIgc2NyZWVuSG9sZGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi1ob2xkZXInLCBlbClcblx0dmFyIHZpZGVvSG9sZGVyID0gZG9tLnNlbGVjdCgnLnZpZGVvLWhvbGRlcicsIGVsKVxuXHR2YXIgc2VsZmllU3RpY2tXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgZWwpXG5cdHZhciBhbmltYXRpb24gPSB7XG5cdFx0cG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdHJvdGF0aW9uOiAwLFxuXHRcdGNvbmZpZzoge1xuXHRcdFx0bGVuZ3RoOiA0MDAsXG5cdFx0XHRzcHJpbmc6IDAuNCxcblx0XHRcdGZyaWN0aW9uOiAwLjdcblx0XHR9XG5cdH1cblxuXHR2YXIgb25WaWRlb0VuZGVkID0gKCk9PiB7XG5cdFx0c2NvcGUuY2xvc2UoKVxuXHR9XG5cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlXG5cdH0pXG5cdG1WaWRlby5hZGRUbyh2aWRlb0hvbGRlcilcblx0bVZpZGVvLm9uKCdlbmRlZCcsIG9uVmlkZW9FbmRlZClcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnc2VsZmllLXN0aWNrLXZpZGVvLXVybCddXG5cblx0dmFyIHN0aWNrSW1nID0gaW1nKEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9zZWxmaWVzdGljay5wbmcnLCAoKT0+IHtcblx0XHRkb20udHJlZS5hZGQoc2NyZWVuSG9sZGVyLCBzdGlja0ltZylcblx0XHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdFx0c2NvcGUucmVzaXplKClcblx0XHR9KVxuXHR9KVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRpc09wZW5lZDogZmFsc2UsXG5cdFx0b3BlbjogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDIwMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC42LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuN1xuXHRcdFx0bVZpZGVvLnBsYXkoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSB0cnVlXG5cdFx0fSxcblx0XHRjbG9zZTogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDIwMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC42LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuN1xuXHRcdFx0bVZpZGVvLnBhdXNlKDApXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSBmYWxzZVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0aWYoc2NvcGUuaXNPcGVuZWQpIHtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSAod2luZG93SCA+PiAxKSAtIChzY3JlZW5Ib2xkZXJTaXplWzFdICogMC4zKVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDIwMFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDUwXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSB3aW5kb3dIIC0gKHNjcmVlbkhvbGRlclNpemVbMV0gKiAwLjQpXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogMjBcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55IC09IChtb3VzZS5uWSAtIDAuNSkgKiAyMFxuXHRcdFx0fVxuXG5cdFx0XHRVdGlscy5TcHJpbmdUbyhhbmltYXRpb24sIGFuaW1hdGlvbi5mcG9zaXRpb24sIDEpXG5cblx0XHRcdGFuaW1hdGlvbi5wb3NpdGlvbi54ICs9IChhbmltYXRpb24uZnBvc2l0aW9uLnggLSBhbmltYXRpb24ucG9zaXRpb24ueCkgKiAwLjFcblxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggKz0gKDAuMDEgLSBhbmltYXRpb24uY29uZmlnLmxlbmd0aCkgKiAwLjFcblxuXHRcdFx0VXRpbHMuVHJhbnNsYXRlKHNjcmVlbldyYXBwZXIsIGFuaW1hdGlvbi5wb3NpdGlvbi54LCBhbmltYXRpb24ucG9zaXRpb24ueSArIGFuaW1hdGlvbi52ZWxvY2l0eS55LCAxKVx0XHRcdFxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdG1WaWRlby5jbGVhcigpXG5cdFx0XHRtVmlkZW8gPSBudWxsXG5cdFx0XHRhbmltYXRpb24gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0c2NvcGUuY2xvc2UoKVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgc29jaWFsTGlua3MgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciB3cmFwcGVyID0gZG9tLnNlbGVjdChcIiNmb290ZXIgI3NvY2lhbC13cmFwcGVyXCIsIHBhcmVudClcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjRcblxuXHRcdFx0dmFyIHdyYXBwZXJTaXplID0gZG9tLnNpemUod3JhcHBlcilcblxuXHRcdFx0dmFyIHNvY2lhbENzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIHBhZGRpbmcgLSB3cmFwcGVyU2l6ZVswXSxcblx0XHRcdFx0dG9wOiB3aW5kb3dIIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzFdLFxuXHRcdFx0fVxuXG5cdFx0XHR3cmFwcGVyLnN0eWxlLmxlZnQgPSBzb2NpYWxDc3MubGVmdCArICdweCdcblx0XHRcdHdyYXBwZXIuc3R5bGUudG9wID0gc29jaWFsQ3NzLnRvcCArICdweCdcblx0XHR9LFxuXHRcdHNob3c6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMucmVtb3ZlKHdyYXBwZXIsICdoaWRlJyksIDEwMDApXG5cdFx0fSxcblx0XHRoaWRlOiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLmFkZCh3cmFwcGVyLCAnaGlkZScpLCA1MDApXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvY2lhbExpbmtzIiwiXG52YXIgdmlkZW9DYW52YXMgPSAoIHNyYywgcHJvcHMgKT0+IHtcblxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0dmFyIHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0dmFyIGludGVydmFsSWQ7XG5cdHZhciBkeCA9IDAsIGR5ID0gMCwgZFdpZHRoID0gMCwgZEhlaWdodCA9IDA7XG5cdHZhciBpc1BsYXlpbmcgPSBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZVxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIG9uQ2FuUGxheSA9ICgpPT57XG5cdFx0aWYocHJvcHMuYXV0b3BsYXkpIHZpZGVvLnBsYXkoKVxuXHRcdGlmKHByb3BzLnZvbHVtZSAhPSB1bmRlZmluZWQpIHZpZGVvLnZvbHVtZSA9IHByb3BzLnZvbHVtZVxuXHRcdGlmKGRXaWR0aCA9PSAwKSBkV2lkdGggPSB2aWRlby52aWRlb1dpZHRoXG5cdFx0aWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gdmlkZW8udmlkZW9IZWlnaHRcblx0XHRpZihpc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdH1cblxuXHR2YXIgZHJhd09uY2UgPSAoKT0+IHtcblx0XHRjdHguZHJhd0ltYWdlKHZpZGVvLCBkeCwgZHksIGRXaWR0aCwgZEhlaWdodClcblx0fVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgIFx0Y3R4LmRyYXdJbWFnZSh2aWRlbywgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgIFx0aXNQbGF5aW5nID0gdHJ1ZVxuICAgIFx0dmlkZW8ucGxheSgpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgXHRpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZHJhdywgMTAwMCAvIDMwKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG4gICAgXHRkcmF3T25jZSgpXG4gICAgfVxuXG4gICAgdmFyIHRpbWVvdXQgPSAoY2IsIG1zKT0+IHtcbiAgICBcdHNldFRpbWVvdXQoKCk9PiB7XG4gICAgXHRcdGNiKHNjb3BlKVxuICAgIFx0fSwgbXMpXG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKCk9PntcbiAgICBcdGlzUGxheWluZyA9IGZhbHNlXG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICBcdGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgIFx0aWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZSA9ICh4LCB5LCB3LCBoKT0+e1xuICAgIFx0ZHggPSB4XG4gICAgXHRkeSA9IHlcbiAgICBcdGRXaWR0aCA9IHdcbiAgICBcdGRIZWlnaHQgPSBoXG4gICAgfVxuXG4gICAgdmFyIGNsZWFyID0gKCk9PiB7XG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BsYXknLCBwbGF5KVxuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGF1c2UnLCBwYXVzZSlcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwwLDAsMClcbiAgICB9XG5cblx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheSk7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBwbGF5KVxuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgcGF1c2UpXG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZClcblxuXHR2aWRlby5zcmMgPSBzcmNcblxuXHRzY29wZSA9IHtcblx0XHRjYW52YXM6IGNhbnZhcyxcblx0XHR2aWRlbzogdmlkZW8sXG5cdFx0Y3R4OiBjdHgsXG5cdFx0ZHJhd09uY2U6IGRyYXdPbmNlLFxuXHRcdHBsYXk6IHBsYXksXG5cdFx0cGF1c2U6IHBhdXNlLFxuXHRcdHNlZWs6IHNlZWssXG5cdFx0dGltZW91dDogdGltZW91dCxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHRjbGVhcjogY2xlYXJcblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHZpZGVvQ2FudmFzIiwiZXhwb3J0IGRlZmF1bHQge1xuXHRXSU5ET1dfUkVTSVpFOiAnV0lORE9XX1JFU0laRScsXG5cdFBBR0VfSEFTSEVSX0NIQU5HRUQ6ICdQQUdFX0hBU0hFUl9DSEFOR0VEJyxcblx0UEFHRV9BU1NFVFNfTE9BREVEOiAnUEFHRV9BU1NFVFNfTE9BREVEJyxcblxuXHRMQU5EU0NBUEU6ICdMQU5EU0NBUEUnLFxuXHRQT1JUUkFJVDogJ1BPUlRSQUlUJyxcblxuXHRGT1JXQVJEOiAnRk9SV0FSRCcsXG5cdEJBQ0tXQVJEOiAnQkFDS1dBUkQnLFxuXG5cdEhPTUU6ICdIT01FJyxcblx0RElQVFlRVUU6ICdESVBUWVFVRScsXG5cblx0TEVGVDogJ0xFRlQnLFxuXHRSSUdIVDogJ1JJR0hUJyxcblx0VE9QOiAnVE9QJyxcblx0Qk9UVE9NOiAnQk9UVE9NJyxcblxuXHRJTlRFUkFDVElWRTogJ0lOVEVSQUNUSVZFJyxcblx0VFJBTlNJVElPTjogJ1RSQU5TSVRJT04nLFxuXG5cdFBYX0NPTlRBSU5FUl9JU19SRUFEWTogJ1BYX0NPTlRBSU5FUl9JU19SRUFEWScsXG5cdFBYX0NPTlRBSU5FUl9BRERfQ0hJTEQ6ICdQWF9DT05UQUlORVJfQUREX0NISUxEJyxcblx0UFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRDogJ1BYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQnLFxuXG5cdEhPTUVfVklERU9fU0laRTogWyA2NDAsIDM2MCBdLFxuXG5cdElURU1fSU1BR0U6ICdJVEVNX0lNQUdFJyxcblx0SVRFTV9WSURFTzogJ0lURU1fVklERU8nLFxuXG5cdEdSSURfUk9XUzogNywgXG5cdEdSSURfQ09MVU1OUzogNCxcblxuXHRQQURESU5HX0FST1VORDogNDAsXG5cdFNJREVfRVZFTlRfUEFERElORzogMTIwLFxuXG5cdEVOVklST05NRU5UUzoge1xuXHRcdFBSRVBST0Q6IHtcblx0XHRcdHN0YXRpYzogJydcblx0XHR9LFxuXHRcdFBST0Q6IHtcblx0XHRcdFwic3RhdGljXCI6IEpTX3VybF9zdGF0aWMgKyAnLydcblx0XHR9XG5cdH0sXG5cblx0TUVESUFfR0xPQkFMX1c6IDE5MjAsXG5cdE1FRElBX0dMT0JBTF9IOiAxMDgwLFxuXG5cdE1JTl9NSURETEVfVzogOTYwLFxuXHRNUV9YU01BTEw6IDMyMCxcblx0TVFfU01BTEw6IDQ4MCxcblx0TVFfTUVESVVNOiA3NjgsXG5cdE1RX0xBUkdFOiAxMDI0LFxuXHRNUV9YTEFSR0U6IDEyODAsXG5cdE1RX1hYTEFSR0U6IDE2ODAsXG59IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxudmFyIEFwcERpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVZpZXdBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0c291cmNlOiAnVklFV19BQ1RJT04nLFxuXHRcdFx0YWN0aW9uOiBhY3Rpb25cblx0XHR9KTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcERpc3BhdGNoZXIiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgZGlwdHlxdWUtcGFnZSc+XFxuXHRcXG5cdDxkaXYgY2xhc3M9XFxcImZ1bi1mYWN0LXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibWVzc2FnZS13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLWlubmVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snZmFjdC10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2ZhY3QtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZhY3QtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiY3Vyc29yLWNyb3NzXFxcIj5cXG5cdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTQuMTA1IDEzLjgyOFxcXCI+XFxuXHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjZmZmZmZmXFxcIiBwb2ludHM9XFxcIjEzLjk0NiwwLjgzOCAxMy4yODMsMC4xNTYgNy4wMzUsNi4yNSAwLjgzOSwwLjE1NiAwLjE3MywwLjgzNCA2LjM3LDYuOTMxIDAuMTU5LDEyLjk5IDAuODIzLDEzLjY3MSA3LjA3LDcuNTc4IDEzLjI2NiwxMy42NzEgMTMuOTMyLDEyLjk5NCA3LjczNiw2Ljg5NiBcXFwiLz5cXG5cdFx0XHQ8L3N2Zz5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcInNlbGZpZS1zdGljay13cmFwcGVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwic2NyZWVuLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLWhvbGRlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwiYXJyb3dzLXdyYXBwZXJcXFwiPlxcblx0XHQ8YSBocmVmPVxcXCIjL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwcmV2aW91cy1wYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9J2xlZnQnIGNsYXNzPVxcXCJhcnJvdyBsZWZ0XFxcIj5cXG5cdFx0XHRcXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMjEuODQsMjUuMTg0IDEzLjU5LDI1LjE4NCAxLjA0OCwxMi45MzQgMTMuNzk4LDAuNzY4IDIyLjAwNiwwLjcyNiAxMi41MDcsMTAuMTQzIDMxLjQyMywxMC4wNiAzMS41NDgsMTUuODUxIDExLjg4MiwxNS44NTEgXFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiMwMTAxMDFcXFwiIGQ9XFxcIk0xMy4zNCwwLjI2NWg5Ljc5NGwtOS42NDgsOS4zMDVoMTguMjM2djYuOTFIMTMuNTUzbDkuNjAxLDkuMjU5bC05LjgxMy0wLjAyTDAuMTU5LDEyLjk5MUwxMy4zNCwwLjI2NXpNMjAuNzA3LDEuMjQ1aC02Ljk3MUwxLjU2OSwxMi45OTFMMTMuNzM2LDI0Ljc0bDYuOTg0LDAuMDE0TDExLjEyNSwxNS41aDE5LjYxN3YtNC45NUgxMS4wNThMMjAuNzA3LDEuMjQ1elxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjcuNjI3LDAuODMxIDguMzA3LDEuNTI5IDEuOTUyLDcuNzI3IDguMjkzLDEzLjk2NSA3LjYxLDE0LjY1OCAwLjU2MSw3LjcyNCBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXFxuXHRcdDwvYT5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdyaWdodCcgY2xhc3M9XFxcImFycm93IHJpZ2h0XFxcIj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMTAuMzc1LDAuODE4IDE4LjYyNSwwLjgxOCAzMS4xNjcsMTMuMDY4IDE4LjQxNywyNS4yMzUgMTAuMjA4LDI1LjI3NyAxOS43MDgsMTUuODYgMC43OTIsMTUuOTQzIDAuNjY3LDEwLjE1MSAyMC4zMzMsMTAuMTUxIFxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDEwMTAxXFxcIiBkPVxcXCJNMTguNzA4LDI1LjczOEg4LjkxNGw5LjY0OC05LjMwNUgwLjMyNnYtNi45MWgxOC4xNjlMOC44OTQsMC4yNjVsOS44MTQsMC4wMmwxMy4xODEsMTIuNzI3TDE4LjcwOCwyNS43Mzh6TTExLjM0MSwyNC43NTdoNi45NzFsMTIuMTY3LTExLjc0NkwxOC4zMTIsMS4yNjNsLTYuOTg1LTAuMDE0bDkuNTk2LDkuMjU0SDEuMzA2djQuOTVIMjAuOTlMMTEuMzQxLDI0Ljc1N3pcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCIxLjI0LDE0LjY1OCAwLjU2MSwxMy45NiA2LjkxNSw3Ljc2MiAwLjU3NSwxLjUyNSAxLjI1NywwLjgzMSA4LjMwNyw3Ljc2NSBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXByZXZpZXctdXJsJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWyduZXh0LXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXHRcdDwvYT5cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIGlkPVxcXCJMYXllcl8xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHQ8L2E+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWFwLWJ0blxcXCI+PGEgaHJlZj1cXFwiIyEvbGFuZGluZ1xcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubWFwX3R4dCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjYW1wZXItbGFiXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYlVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsYWJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwic2hvcC10aXRsZSBzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2Rpdj5cXG5cdFx0XHRcdDx1bCBjbGFzcz1cXFwic3VibWVudS13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJtZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTFcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMud29tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53b21lblNob3BVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIndvbWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3dvbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHQ8L3VsPlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2hlYWRlcj5cXG5cdFx0PGZvb3RlciBpZD1cXFwiZm9vdGVyXFxcIiBjbGFzcz1cXFwiYnRuXFxcIj5cXG5cdFx0XHQ8ZGl2IGlkPVxcXCJzb2NpYWwtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8dWw+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0naW5zdGFncmFtJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmluc3RhZ3JhbVVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5zdGFncmFtVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpbnN0YWdyYW1VcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNi4xMDcsMTUuNTYyYzAsMC4zMDItMC4yNDMsMC41NDctMC41NDMsMC41NDdIMi40MzhjLTAuMzAyLDAtMC41NDctMC4yNDUtMC41NDctMC41NDdWNy4zNTloMi4xODhjLTAuMjg1LDAuNDEtMC4zODEsMS4xNzUtMC4zODEsMS42NjFjMCwyLjkyOSwyLjM4OCw1LjMxMiw1LjMyMyw1LjMxMmMyLjkzNSwwLDUuMzIyLTIuMzgzLDUuMzIyLTUuMzEyYzAtMC40ODYtMC4wNjYtMS4yNC0wLjQyLTEuNjYxaDIuMTg2VjE1LjU2MkwxNi4xMDcsMTUuNTYyeiBNOS4wMiw1LjY2M2MxLjg1NiwwLDMuMzY1LDEuNTA0LDMuMzY1LDMuMzU4YzAsMS44NTQtMS41MDksMy4zNTctMy4zNjUsMy4zNTdjLTEuODU3LDAtMy4zNjUtMS41MDQtMy4zNjUtMy4zNTdDNS42NTUsNy4xNjcsNy4xNjMsNS42NjMsOS4wMiw1LjY2M0w5LjAyLDUuNjYzeiBNMTIuODI4LDIuOTg0YzAtMC4zMDEsMC4yNDQtMC41NDYsMC41NDUtMC41NDZoMS42NDNjMC4zLDAsMC41NDksMC4yNDUsMC41NDksMC41NDZ2MS42NDFjMCwwLjMwMi0wLjI0OSwwLjU0Ny0wLjU0OSwwLjU0N2gtMS42NDNjLTAuMzAxLDAtMC41NDUtMC4yNDUtMC41NDUtMC41NDdWMi45ODRMMTIuODI4LDIuOTg0eiBNMTUuNjY5LDAuMjVIMi4zM2MtMS4xNDgsMC0yLjA4LDAuOTI5LTIuMDgsMi4wNzZ2MTMuMzQ5YzAsMS4xNDYsMC45MzIsMi4wNzUsMi4wOCwyLjA3NWgxMy4zMzljMS4xNSwwLDIuMDgxLTAuOTMsMi4wODEtMi4wNzVWMi4zMjZDMTcuNzUsMS4xNzksMTYuODE5LDAuMjUsMTUuNjY5LDAuMjVMMTUuNjY5LDAuMjV6XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J3R3aXR0ZXInPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudHdpdHRlclVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudHdpdHRlclVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidHdpdHRlclVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAyMiAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIxLjE3NiwwLjUxNGMtMC44NTQsMC41MDktMS43OTksMC44NzktMi44MDgsMS4wNzljLTAuODA1LTAuODY1LTEuOTUzLTEuNDA1LTMuMjI2LTEuNDA1Yy0yLjQzOCwwLTQuNDE3LDEuOTkyLTQuNDE3LDQuNDQ5YzAsMC4zNDksMC4wMzgsMC42ODgsMC4xMTQsMS4wMTNDNy4xNjYsNS40NjQsMy45MSwzLjY5NSwxLjcyOSwxYy0wLjM4LDAuNjYtMC41OTgsMS40MjUtMC41OTgsMi4yNGMwLDEuNTQzLDAuNzgsMi45MDQsMS45NjYsMy43MDRDMi4zNzQsNi45MiwxLjY5MSw2LjcxOCwxLjA5NCw2LjM4OHYwLjA1NGMwLDIuMTU3LDEuNTIzLDMuOTU3LDMuNTQ3LDQuMzYzYy0wLjM3MSwwLjEwNC0wLjc2MiwwLjE1Ny0xLjE2NSwwLjE1N2MtMC4yODUsMC0wLjU2My0wLjAyNy0wLjgzMy0wLjA4YzAuNTYzLDEuNzY3LDIuMTk0LDMuMDU0LDQuMTI4LDMuMDg5Yy0xLjUxMiwxLjE5NC0zLjQxOCwxLjkwNi01LjQ4OSwxLjkwNmMtMC4zNTYsMC0wLjcwOS0wLjAyMS0xLjA1NS0wLjA2MmMxLjk1NiwxLjI2MSw0LjI4LDEuOTk3LDYuNzc1LDEuOTk3YzguMTMxLDAsMTIuNTc0LTYuNzc4LDEyLjU3NC0xMi42NTljMC0wLjE5My0wLjAwNC0wLjM4Ny0wLjAxMi0wLjU3N2MwLjg2NC0wLjYyNywxLjYxMy0xLjQxMSwyLjIwNC0yLjMwM2MtMC43OTEsMC4zNTQtMS42NDQsMC41OTMtMi41MzcsMC43MDFDMjAuMTQ2LDIuNDI0LDIwLjg0NywxLjU1MywyMS4xNzYsMC41MTRcXFwiLz5cXG5cdFx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0nZmFjZWJvb2snPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZmFjZWJvb2tVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmZhY2Vib29rVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWNlYm9va1VybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE4IDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxOCAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE3LjcxOSwxNi43NTZjMCwwLjUzMS0wLjQzMSwwLjk2My0wLjk2MiwwLjk2M2gtNC40NDN2LTYuNzUzaDIuMjY3bDAuMzM4LTIuNjMxaC0yLjYwNFY2LjY1NGMwLTAuNzYyLDAuMjExLTEuMjgxLDEuMzA0LTEuMjgxbDEuMzk0LDBWMy4wMTljLTAuMjQxLTAuMDMyLTEuMDY4LTAuMTA0LTIuMDMxLTAuMTA0Yy0yLjAwOSwwLTMuMzg1LDEuMjI3LTMuMzg1LDMuNDc5djEuOTQxSDcuMzIydjIuNjMxaDIuMjcydjYuNzUzSDEuMjQzYy0wLjUzMSwwLTAuOTYyLTAuNDMyLTAuOTYyLTAuOTYzVjEuMjQzYzAtMC41MzEsMC40MzEtMC45NjIsMC45NjItMC45NjJoMTUuNTE0YzAuNTMxLDAsMC45NjIsMC40MzEsMC45NjIsMC45NjJWMTYuNzU2XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9mb290ZXI+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ob3Jpem9udGFsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ob3Jpem9udGFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiaG9yaXpvbnRhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ob3Jpem9udGFsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI0XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjZcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmVydGljYWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZlcnRpY2FsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwidmVydGljYWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMudmVydGljYWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXM0PWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgaG9tZS1wYWdlJz5cXG5cdDxkaXYgY2xhc3M9XFxcImJnLXdyYXBwZXJcXFwiPlxcblx0XHQ8aW1nIHNyYz0nXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJndXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iZ3VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYmd1cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYm90dG9tLXRleHRzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnQtdGV4dFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZnJvbnQtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudGV4dF9hIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50ZXh0X2EgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRleHRfYVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXRleHRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImZyb250LXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwidmlzaW9uXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYV92aXNpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFfdmlzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJhX3Zpc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0XHQ8aW1nIHNyYz1cXFwiaW1hZ2UvbG9nby1tYWxsb3JjYS5wbmdcXFwiPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodC1zdGVwLWJvdHRvbVxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdC1zdGVwLXRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtdG9wXFxcIj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj48L2Rpdj5cdFxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwidGl0bGVzLXdyYXBwZXJcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwiZGVpYVxcXCI+REVJQTwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZXMtdHJlbmNcXFwiPkVTIFRSRU5DPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcmVsbHVmXFxcIj5BUkVMTFVGPC9kaXY+XFxuPC9kaXY+XFxuXFxuPHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiLTY3IDAgNzYwIDY0NVxcXCI+XFxuXHQ8cGF0aCBpZD1cXFwibWFwLWJnXFxcIiBmaWxsPVxcXCIjMUVFQTc5XFxcIiBkPVxcXCJNOS4yNjgsMjg5LjM5NGw5Ljc5LTcuNzk4bDEuODkxLDAuNzkzbC0xLjYyOSw1LjAyMWwtNS4yODYsNC41MDRsLTQuMzU0LDcuMDEybC0zLjA4OC0xLjE5OGwtMi4yMzQsMi44ODVsMCwwbC0yLjM4Mi0xLjE3N0w5LjI2OCwyODkuMzk0eiBNNTczLjU4LDE3NC4yMTFsMTkuODktMTMuODJsOC45MDEtMi40NzlsNS4zNTQtNC44MDlsMS41Ni01LjU1NWwtMS02LjkyMmwxLjQ0NS0zLjk3M2w1LjA1Ny0yLjUyM2w0LjI3MSwyLjAxbDExLjkwNiw5LjE2NWwyLjY5Myw0LjkxN2wyLjg5MiwxLjU3NWwxMS40ODIsMS4zNjdsMy4wNTcsMS45NDlsNC40MTgsNS4yMTFsNy43NjgsMi4yMjFsNS44MzIsNC45MTZsNi4zMDUsMC4yMTVsNi4zNzMtMS4yMmwxLjk4OSwxLjg4bDAuNDA5LDEuOTYzbC01LjMzNiwxMC40MjhsLTAuMjI5LDMuODY5bDEuNDQxLDEuNjQ3bDAuODU0LDAuOTU4bDcuMzk1LTAuNDI3bDIuMzQ3LDEuNTRsMC45MDMsMi41MTlsLTIuMTAyLDMuMDU0bC04LjQyNSwzLjE4M2wtMi4xNjksNy4xMTZsMC4zNDQsMy4xODNsMy4wNzMsNC4yMzFsMC4wMTUsMi44NDZsLTIuMDE5LDEuNDVsLTAuNzM5LDMuODQzbDIuMTY2LDE2LjY4N2wtMC45ODIsMS44OGwtNi43ODUtMy43NTdsLTEuNzU4LDAuMjU0bC0yLjAxOSw0LjQ2OGwxLjAzMiw2LjIzN2wtMC42MDUsNC44MjdsLTAuMzYzLDIuODY4bC0xLjQ5NSwxLjY2NWwtMi4xMDItMC4xMjlsLTguMzQxLTMuODQ3bC00LjAxMS0wLjQwNWwtMi43MTEsMS42MDRsLTcuNDM4LDE2LjQ5N2wtMy4yODQsMTEuNTk5bDMuMjIsMTAuNTk3bDEuNjQsMS44NTlsNC4zODYtMC4yOGwxLjQ3OCwxLjY5bC0xLjkzNywzLjM5NWwtMi42OTMsMS4wOTVsLTcuODUxLTAuMTI5bC0yLjU0NiwxLjYyMmwtMi42NjEsMy43MThsMC4xMjksMC44OTdsMC42MDksNC40NDZsLTEuNDc4LDQuMzEzbC0zLjY4LDMuMzEybC0zLjkwOSwxLjE3M2wtMTEuOTg5LDcuNzU4bC01LjM1NCw3Ljk2N2wtOC45MzgsNi41MzlsLTMuMzUxLDYuNjYzbC01Ljc4LDYuNTQybC00LjgyNyw4LjE4MmwwLjI5NCwzLjkwOGwtNC44OTYsMTIuMjg3bC0yLjAyLDUuMTA3bC0zLjIwMiwyMi4zOTNsMC43MjEsOC44NDJsLTEuMDMzLDIuOTVsLTEuNzI1LTAuMjc2bC00LjEyNS00LjQ2OGwtMS42MjQsMC45NjJsLTEuMzk2LDMuMjcybDEuODIyLDQuODQ4bC0xLjY5Miw1LjAyMWwtNC43MzEsNi42MDRsLTguMDYyLDE5LjI5MmwtMi45NzcsMC4zNDFsLTAuNTQxLDAuNDQ4bC0xLjQ3OSwxLjE5NWwxLjMxNiw0LjQ4OWwtMi4yODQsMy4zOTVsLTIuNTE0LDEuMjY0bC01LjQ4NC00LjUzMmwtMy4wODgtMC44OTRsLTAuODA3LDEuOTAxbDIuMjIxLDcuMTc4bC0zLjQsMS4zODlsLTguMzYzLTAuMTNsLTEuNTExLDIuMmwxLjEwMiw1LjM2NWwtMC42ODgsMi43NzNsLTMuMTM4LDMuMTY1bC02LjYwMywyLjhsLTMuODk2LDQuMTg4bC00LjYyOS0xLjMyNGwtNC43MzEsMC42MTdsLTUuMDkyLTIuNTg0bC0yLjYyNSwzLjU2N2wwLjQ3MywyLjcxM2wwLjE4LDEuMDI2bC0xLjMxMiwxLjY4N2wtMTIuNDUyLDQuNzY2bC00LjU5OCw0LjQ4NWwtNy4wNjIsMTEuMDY3bC0xNy42MjMsMTkuODA5bC00LjA5MiwxLjcyN2wtNC40OTgtMC42MTdsLTMuNjQ2LTMuMTg0bC0yLjc5NS02LjUxN2wtNy4xNzYtOC44NjdsLTEuMjMzLTAuNTU2bC0zLjUxNS0xLjY0NGwtMS45MDQtMy42MzJsMS4zNDktNS4zODdsLTMuMjcxLTQuMDU5bC03LjAxNS01LjUxMmwtMi44OTEsMS43OTRsLTQuMDIzLDAuNDdsLTIuODczLTEuNzI5bC0xLjI2Ny01LjU1NWw0Ljc5OS04LjM1NGwtMC4wODItMS42MDFsLTIuNTI4LTQuODk1bC04LjAyLTkuNjE0bC01LjM1Mi00LjE2NmwtNC42MTUtMS44MzdsLTQuMjIxLDAuNjQybC02Ljc4NS0wLjc3MWwtNC44MTMtMC41NzRsLTYuOTQ2LDIuNjI3bC0zLjAwNiw0LjA1OWwtMS45MjIsMC4yNTVsLTE0LjU2OC03LjgzN2wtNC44NjItMC42MjFsLTguNDYsMS44MzdsLTguNDg5LTAuOTgzbC00LjIwNywwLjY2NGwtNy43MTgsNC4xNjdsLTMuNTE1LDAuNjgybC0yLjkwOC0xLjE5NWwtNC44MTItNC42ODNsLTQuMTU3LTAuNTUzbC03LjI3MywxLjQzMmwtMS42NDItMC42ODJsLTEuMzYzLTQuMTI3bC00Ljg5OC0zLjA3NWwtMy4xOTktNS4yNzlsLTExLjQwMS04Ljg4NWwtNS4yMjItNy4xNTlsLTMuMDg4LTcuNTY1bC0wLjQwOS01LjgzMWwzLjYxMS0xMi42NzFsMC4xMzMtNS44MTFsLTEuMTY5LTQuNDY4bC01Ljg0Ni04LjQxOGwtMy4wMzctNi40NDlsLTIuMzE3LTQuOTM4bDEuMzYzLTIuNzUzbDMuNzc1LTIuMDk2bDIuOTkyLTcuNDE0bDQuNC0zLjk5NGwyLjEwNC0zLjc2MWwtNC4wMjQtOS45MTVsLTMuODQ0LTYuNzI5bC04LjM0Ni03LjY0N2wtOC43NjktMi41ODhsLTkuNDI5LTEwLjM0MmwtNC4yNTctMi4zMjVsLTUuMzE4LTUuMzg2bC03LjI2Mi0xLjk0NWwtMC42NzEtMC4xNjhsLTUuMTc1LTEuMzkzbC0yLjk1NiwwLjU2bC0yLjg1NywwLjU1M2wtMi45MjQtMS4wNDhsLTMuOTQ0LDIuMDk2bC0yLjMsNC4xMjNsMC4xNDcsMS40MzJsMC4wODcsMC42ODJsMy45MzgsNS4xNDlsLTIuMzk2LDIuNTIzbC0xMC44ODgtNS42ODVsLTQuMjA3LDAuMTUxbC01Ljk5MywxMS42NjNsLTQuMDkyLDMuODI5bC02LjcxNy0wLjgzM2wtOS45MjEsMy4yNjZsLTcuNjUyLDIuNTIybC0yLjc3NiwzLjAzM2wtMC4yOTcsMi40NTRsMy4zMDMsNC4wNDFsLTMuMDIzLDEuMDkxbC0wLjU5MiwxLjM2N3Y3LjA0OGwtNi44ODIsMTUuNzA0bC0yLjc3NiwxMC4yNTZsMS4yMDIsNC4xMDJsLTAuODI1LDIuNjA5bC0xMi4zMTUtNS4xOTNsLTguNzU4LTYuNDMxbC01LjA0MywyLjkwN2wtMC44ODYsMC40ODhsMS40ODEtNS4yMTFsLTEuNjEtNi40MDlsMi4wMi01LjU1NmwtMC45MTktMi42N2wtNC40MzYsMS4zNjdsLTQuNjgxLTAuNmwtMy4wNzMtNC45MTJsLTEuMzQ1LTQuNjM3bDEuMTgtMi45NDlsMi44OTUtMS45NjdsNy4wMTEtMC43MDNsMS42NDMtMS4zMjhsLTAuMjYyLTEuNzdsLTcuMzQ1LTMuNTQ5bC02LjQ3LTEwLjM2M2wtNi4xMjYsMC4wNDNsLTQuNTk4LDUuMDY2bC0zLjU2NCwwLjg3M2wtNC43NDgsMS4xNzZsLTAuNTkyLTIuMTM1bDEuMDUxLTMuODI1bC0xLjA4My0yLjg2NGwtMy4yODUtMC43MDZMNjQuMzc1LDMyOGwtMi41OTcsNi43NTNsLTQuNjk4LDMuMjkxbC00Ljg1OS0wLjU3N2wwLjcwNy0zLjg0OGwtMS4xMDItMi4zNTFsLTMuMTcsMC4zODRsLTMuMTcxLTMuMTU4bC00LjA0MSw0LjM3OWwtMy4xNTIsMC4yMTFsLTEuNjQ0LTIuMzY4bDIuNjExLTMuMjI5bDguNTQzLTMuNDU5bDMuNDQ2LTIuODE3bC0wLjExNS0xLjI0MmwtMS0wLjc1bC0yLjY5MywxLjI2M2wtNS4zODctMC40MzFsLTIuMTg1LTIuMjM5bC0xMC42NDQtMTAuODk4bC0wLjU5Mi0yLjEzNWwxLjcwNy02LjYwM2wtMC41NzQtMi40OThsLTMuNTI5LTIuOTkzbC0wLjYwOS0yLjE1N2wzLjY5NC03LjczN2wyLjMwMi0wLjU5NmwyLjcxMi01LjUxNmw5LjE4MS05LjQybDguNTcxLDAuMDY1bDExLjYyNy01LjU5OWw1LjgzNS00Ljk5OWwxLjg1NC0yLjc3OGwzLjIzNS00Ljg5NWw1LjgzMS00LjY1NGwxMi44OTMtNi40MTNsNy4xMy02LjM0NWw1LjA4OS03LjMwNmw1LjcxNy0yLjM3Mmw1LjgzMS04LjMzM2wzLjI4NS0yLjg0Mmw3LjQ4OC0yLjk3MWw0Ljg2My02LjA4NmwzLjIwMy0xLjI2M2wxMC4xNjcsMS4zNjdsNi42NzEtMS43NTFsNS4wNTctMy40MzhsMTQuOTgtMTIuMjg3bDQuMDg4LTguMjQ3bDE0LjA0NC0xNC42MTZsNi42NjctMTAuNzQ0bDQuMDEsMy45MTJsNC40ODMtMS45MDJsNS4zMDgtNC40ODZsMS43OS00LjIxM2w2LjE1Ny0xNC40MDFsNC44MjctMS44NTVsNi40MDgsNC45MTNsMi41OTQtMi44NjRsLTAuNzM4LTUuODUzbDAuNjc0LTIuOTY4bDIxLjk2My0xNy44ODVsNS4wMzktMi43MzRsNS43OTksMy4zMTJsMy4zNjctMC44NzVsMy41MzMtMy42OTZsMS44MDgtNS4yNTdsMC40NTktMS4zMjRsMy4yOTksMC43MDdsMS40MTQtMTAuNDkzbDEuODIxLTEuMzI0bDQuNjY2LDEuMzAzbDQuNDY1LTEuMzQ2bDYuNTU2LDIuMTEzbC0wLjE5Ny0yLjA0OWwtMC4xMTQtMS4yMzhsLTAuMDMyLTAuMjU4bDEuNzA3LTIuNTQxbDAuNDQ0LDAuMDY0bDkuODE5LDEuNTE4aDAuMDE4bDYuODE3LTIuMjlsNS44Ni0xLjk2M2w3LjA5OC04LjI1bDguMzYtMi4ybDQuNTMyLTIuNzU5bDQuNTAxLTUuNzY3bDIuNDgxLTMuMTgzbDguMTYzLTUuMjFsNC45OTIsMi4wMjdsNC40MTgtMy45NzJsNC4wNTctMC40OTZsNC45MTMtMi45MDNsOC40NzUtMTAuODA5bDIuNzc1LDAuNjgybDMuMzgzLDMuNjFsMS44OSwyLjAzMWwyLjM2MywyLjUxOWw4LjY0My0wLjc2OGwxNS42MDItMTIuMzQ4bDQuODEyLTIuNDU4bDExLjA3MS01LjY2M2wzLjcxMi0wLjE0N2wtMC40NzgsNS40NDdsMS44OTEsMC43OWw1Ljc2Ny0yLjY2OWwzLjYxMSwxLjI1OWwtMi43MjYsNC45NTZsMC4xNDcsMy41MjdsMy43MTItMC4zMjNsMTcuNjczLTExLjUxMmwyLjMxNy0wLjU3OGwyLjAwNSwxLjY4N2wtMC45ODYsMi4wNzRsMC40MDgsMS45NjZsMTEuMzUyLTEuODQxbDQuMzU0LTIuNTg0bDEuNzA3LTIuMzcybDQuMzgzLTYuMDg2bDcuMTQ3LTUuMjM2bDEyLjQzNC01LjQ3M2w0LjU2NS0wLjA4NmwwLjk2OSwxLjQ1M2wtMS43MDcsMi4zNzZsMC43NzEsMS45ODRsNC4wNTYtMC4yOThsMTMuODQ3LTUuNzI4bDIuMjM0LDEuMDA1bC00LjA4OSwzLjk5NGwtMi4zMzQsNi45MDFsLTIuMTg1LDEuNDc1bC0zLjQ4Mi0wLjU1NmwtMy4yMjEsMS4wNDRsLTguOTE2LDYuODYxbC02LjY4NCw1LjEyOGwtMy43ODEsMS43M2wtMTEuMzk2LTAuMjk4bC01Ljk0Niw1LjY2M2wtMy4yNTMsNC43NDRsLTQuMjU0LDEuMDA1bC0wLjE3OSw5LjMxMmwtNy42MjEtOC4xODJsLTQuNzQ5LDAuMjc2bC0zLjc0Myw0LjE5MWwtMS4yMzQsNi40NDlsMS43NDMsOS42MTdsMi44MDgsNi40OTJsMS44NzIsNC4zMzlsNy4wNDgsNS42ODFsOS4zNzgtMS4yMzhsNy4xMTItNS4wNjNsMi4yOTktMC4yMzNsMi44NzYsMS45MmwyLjk4Ny0wLjE2OGwzLjg3Ny0zLjMwOWw5LjI5Ni0yLjk5M2w0LjkwOS0zLjI0OGw1Ljg1LTcuMjQybDMuMTAzLTIuMTE3bDQuMDYtMC4xMjlsMy4zOTksMS45NjdsLTkuNjI1LDguNzgxbC0wLjMxMiwwLjk4M2wtMS44MjUsNS43NjdsMC44ODksMy4wNThsMi4zMTcsMi40MTFsMy4wMDYtMC4zNjJsMC4zNDQsMy4yMDhsLTQuMDU2LDMuNDU5bC02LjUwNiw5LjUxbC00LjAwNywyLjc1MmwtNy43MDMtMC4yNTVsLTYuNjg1LDMuNTA2bC0zLjMwNC0wLjU2bC0yLjQ2My0zLjExOGwtMy4zODMtMi4xMzVsLTEuOTM5LDAuMjU0bC0yLjk1NiwyLjY0OGwtMi4yMzMsNS4zNDRsLTEuOTU1LDYuOTIybDAuNTQ1LDIuNjkxbDAsMGwzLjg0MiwxMy4wNzdsOC4wNDgsMTUuOTYybDYuNDM4LDcuMjJsMTMuMzIzLDkuNDAybDIyLjU0OCwxMC4yNTNsMC42MjcsMS4yNjNsMTEuNTQ1LDUuNjJsNS4zNCwyLjU4M2w1LjE3NSwxLjUzNmwzLjg3NC0wLjQ4OGw1LjQ1NC0zLjM3Nkw1NzMuNTgsMTc0LjIxMXogTTM4Ny41MTcsNjAxLjk3M2wtMi43NTktMy42OTZsMC40NTktMS45MDJsMi4xMzgtMS4xM2wwLjMyNy0yLjk3NWwyLjUxNC0xLjQ1bDMuODA5LDAuNTU2bDAuNDI3LDEuNjIybC0yLjI4LDcuMDk1bC0yLjA1NiwyLjU0MWwwLDBMMzg3LjUxNyw2MDEuOTczeiBNMzY1LjY1Nyw2MTQuMzQ2bDMuOTA5LDExLjQ5MWwyLjIxNywwLjY2M2wwLjk4Mi0yLjA3bC0wLjI0NC0wLjc3MWwtMS4wODMtMy41MjNsMC42MzgtMi40MzhsMi41OTgsMC4zMDJsMi43ODksMy4xNThsMy4wOTMsMC43MDdsMi4yNDgtMy4wNThsLTEuOTktNS4yMTFsMC42Ni0yLjQzN2wyLjYyNS0wLjM4NGw0LjcxNiwyLjg4NWw2LjAxMSwxLjIxN2wyLjMzNSwxLjkwMmwtNC42MzQsNS41NTVsLTQuMTcxLTAuMjM2bC0xLjQ3OCwxLjg1OGwtMC44NCwyLjYwOGwyLjQ2NSwyLjYwNWwtMy4yMDMsNC43NjZsMC4wODMsMS43NzNsMy41MjgsNS40NjlsLTAuNTg4LDEuMjJsLTIuNDQ5LDAuMzg0bC01Ljk5My0xLjc1MWwtNi4xOTMsMS45NjNsMCwwbC0wLjI4LTQuNDI1bC04LjUzOSwwLjQwOWwtMC40NDQtMS40MzJsMy4zODYtNC43NDRsLTAuNzg5LTEuNjIybC02Ljg1LTEuNzk0bC0wLjYyNS00LjYxNWw0Ljk2LTUuMDIxbC0yLjUxNC0xLjkwMWwtMC40MDktMi4xMzZsMS40OTItMi4wMzFMMzY1LjY1Nyw2MTQuMzQ2elxcXCIvPlxcblx0XFxuXHQ8cGF0aCBpZD1cXFwib3V0ZXItYm9yZGVyXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgZD1cXFwiTTE5LjA1OCwyODEuNTk2bDEuODkxLDAuNzkzbC0xLjYyOSw1LjAyMWwtNS4yODYsNC41MDRsLTQuMzU0LDcuMDEybC0zLjA4OC0xLjE5OGwtMi4yMzQsMi44ODVsLTIuMzgyLTEuMTc3bDcuMjkyLTEwLjA0MUwxOS4wNTgsMjgxLjU5NnogTTY4OS40NTUsMTkzLjg4OGwyLjEwMi0zLjA1NGwtMC45MDMtMi41MTlsLTIuMzQ3LTEuNTRsLTcuMzk1LDAuNDI3bC0wLjg1NC0wLjk1OGwtMS40NDEtMS42NDdsMC4yMjktMy44NjlsNS4zMzYtMTAuNDI4bC0wLjQwOS0xLjk2M2wtMS45ODktMS44OGwtNi4zNzMsMS4yMmwtNi4zMDUtMC4yMTVsLTUuODMyLTQuOTE2bC03Ljc2OC0yLjIyMWwtNC40MTgtNS4yMTFsLTMuMDU3LTEuOTQ5bC0xMS40ODItMS4zNjdsLTIuODkyLTEuNTc1bC0yLjY5My00LjkxN2wtMTEuOTA2LTkuMTY1bC00LjI3MS0yLjAxbC01LjA1NywyLjUyM2wtMS40NDUsMy45NzNsMSw2LjkyMmwtMS41Niw1LjU1NWwtNS4zNTQsNC44MDlsLTguOTAxLDIuNDc5bC0xOS44OSwxMy44MmwtNi4zMDksMC4xNzJsLTUuNDU0LDMuMzc2bC0zLjg3NCwwLjQ4OGwtNS4xNzUtMS41MzZsLTUuMzQtMi41ODNsLTExLjU0NS01LjYybC0wLjYyNy0xLjI2M2wtMjIuNTQ4LTEwLjI1M2wtMTMuMzIzLTkuNDAybC02LjQzOC03LjIybC04LjA0OC0xNS45NjJsLTMuODQyLTEzLjA3N2wtMC41NDUtMi42OTFsMS45NTUtNi45MjJsMi4yMzMtNS4zNDRsMi45NTYtMi42NDhsMS45MzktMC4yNTRsMy4zODMsMi4xMzVsMi40NjMsMy4xMThsMy4zMDQsMC41Nmw2LjY4NS0zLjUwNmw3LjcwMywwLjI1NWw0LjAwNy0yLjc1Mmw2LjUwNi05LjUxbDQuMDU2LTMuNDU5bC0wLjM0NC0zLjIwOGwtMy4wMDYsMC4zNjJsLTIuMzE3LTIuNDExbC0wLjg4OS0zLjA1OGwxLjgyNS01Ljc2N2wwLjMxMi0wLjk4M2w5LjYyNS04Ljc4MWwtMy4zOTktMS45NjdsLTQuMDYsMC4xMjlsLTMuMTAzLDIuMTE3bC01Ljg1LDcuMjQybC00LjkwOSwzLjI0OGwtOS4yOTYsMi45OTNsLTMuODc3LDMuMzA5bC0yLjk4NywwLjE2OGwtMi44NzYtMS45MmwtMi4yOTksMC4yMzNsLTcuMTEyLDUuMDYzbC05LjM3OCwxLjIzOGwtNy4wNDgtNS42ODFsLTEuODcyLTQuMzM5bC0yLjgwOC02LjQ5MmwtMS43NDMtOS42MTdsMS4yMzQtNi40NDlsMy43NDMtNC4xOTFsNC43NDktMC4yNzZsNy42MjEsOC4xODJsMC4xNzktOS4zMTJsNC4yNTQtMS4wMDVsMy4yNTMtNC43NDRsNS45NDYtNS42NjNsMTEuMzk2LDAuMjk4bDMuNzgxLTEuNzNsNi42ODQtNS4xMjhsOC45MTYtNi44NjFsMy4yMjEtMS4wNDRsMy40ODIsMC41NTZsMi4xODUtMS40NzVsMi4zMzQtNi45MDFsNC4wODktMy45OTRsLTIuMjM0LTEuMDA1bC0xMy44NDcsNS43MjhsLTQuMDU2LDAuMjk4bC0wLjc3MS0xLjk4NGwxLjcwNy0yLjM3NmwtMC45NjktMS40NTNsLTQuNTY1LDAuMDg2bC0xMi40MzQsNS40NzNsLTcuMTQ3LDUuMjM2bC00LjM4Myw2LjA4NmwtMS43MDcsMi4zNzJsLTQuMzU0LDIuNTg0bC0xMS4zNTIsMS44NDFsLTAuNDA4LTEuOTY2bDAuOTg2LTIuMDc0bC0yLjAwNS0xLjY4N2wtMi4zMTcsMC41NzhsLTE3LjY3MywxMS41MTJsLTMuNzEyLDAuMzIzbC0wLjE0Ny0zLjUyN2wyLjcyNi00Ljk1NmwtMy42MTEtMS4yNTlsLTUuNzY3LDIuNjY5bC0xLjg5MS0wLjc5bDAuNDc4LTUuNDQ3bC0zLjcxMiwwLjE0N2wtMTEuMDcxLDUuNjYzbC00LjgxMiwyLjQ1OGwtMTUuNjAyLDEyLjM0OGwtOC42NDMsMC43NjhsLTIuMzYzLTIuNTE5bC0xLjg5LTIuMDMxbC0zLjM4My0zLjYxbC0yLjc3NS0wLjY4MmwtOC40NzUsMTAuODA5bC00LjkxMywyLjkwM2wtNC4wNTcsMC40OTZsLTQuNDE4LDMuOTcybC00Ljk5Mi0yLjAyN2wtOC4xNjMsNS4yMWwtMi40ODEsMy4xODNsLTQuNTAxLDUuNzY3bC00LjUzMiwyLjc1OWwtOC4zNiwyLjJsLTcuMDk4LDguMjVsLTUuODYsMS45NjNsLTYuODE3LDIuMjloLTAuMDE4bC05LjgxOS0xLjUxOGwtMC40NDQtMC4wNjRsLTEuNzA3LDIuNTQxbDAuMDMyLDAuMjU4bDAuMTE0LDEuMjM4bDAuMTk3LDIuMDQ5bC02LjU1Ni0yLjExM2wtNC40NjUsMS4zNDZsLTQuNjY2LTEuMzAzbC0xLjgyMSwxLjMyNGwtMS40MTQsMTAuNDkzbC0zLjI5OS0wLjcwN2wtMC40NTksMS4zMjRsLTEuODA4LDUuMjU3bC0zLjUzMywzLjY5NmwtMy4zNjcsMC44NzVsLTUuNzk5LTMuMzEybC01LjAzOSwyLjczNGwtMjEuOTYzLDE3Ljg4NWwtMC42NzQsMi45NjhsMC43MzgsNS44NTNsLTIuNTk0LDIuODY0bC02LjQwOC00LjkxM2wtNC44MjcsMS44NTVsLTYuMTU3LDE0LjQwMWwtMS43OSw0LjIxM2wtNS4zMDgsNC40ODZsLTQuNDgzLDEuOTAybC00LjAxLTMuOTEybC02LjY2NywxMC43NDRsLTE0LjA0NCwxNC42MTZsLTQuMDg4LDguMjQ3bC0xNC45OCwxMi4yODdsLTUuMDU3LDMuNDM4bC02LjY3MSwxLjc1MWwtMTAuMTY3LTEuMzY3bC0zLjIwMywxLjI2M2wtNC44NjMsNi4wODZsLTcuNDg4LDIuOTcxbC0zLjI4NSwyLjg0MmwtNS44MzEsOC4zMzNsLTUuNzE3LDIuMzcybC01LjA4OSw3LjMwNmwtNy4xMyw2LjM0NUw4MC40NzEsMjQ0LjRsLTUuODMxLDQuNjU0bC0zLjIzNSw0Ljg5NWwtMS44NTQsMi43NzhsLTUuODM1LDQuOTk5bC0xMS42MjcsNS41OTlsLTguNTcxLTAuMDY1bC05LjE4MSw5LjQybC0yLjcxMiw1LjUxNmwtMi4zMDIsMC41OTZsLTMuNjk0LDcuNzM3bDAuNjA5LDIuMTU3bDMuNTI5LDIuOTkzbDAuNTc0LDIuNDk4bC0xLjcwNyw2LjYwM2wwLjU5MiwyLjEzNWwxMC42NDQsMTAuODk4bDIuMTg1LDIuMjM5bDUuMzg3LDAuNDMxbDIuNjkzLTEuMjYzbDEsMC43NWwwLjExNSwxLjI0MmwtMy40NDYsMi44MTdsLTguNTQzLDMuNDU5bC0yLjYxMSwzLjIyOWwxLjY0NCwyLjM2OGwzLjE1Mi0wLjIxMWw0LjA0MS00LjM3OWwzLjE3MSwzLjE1OGwzLjE3LTAuMzg0bDEuMTAyLDIuMzUxbC0wLjcwNywzLjg0OGw0Ljg1OSwwLjU3N2w0LjY5OC0zLjI5MUw2NC4zNzUsMzI4bDIuODQxLTAuOTE5bDMuMjg1LDAuNzA2bDEuMDgzLDIuODY0bC0xLjA1MSwzLjgyNWwwLjU5MiwyLjEzNWw0Ljc0OC0xLjE3NmwzLjU2NC0wLjg3M2w0LjU5OC01LjA2Nmw2LjEyNi0wLjA0M2w2LjQ3LDEwLjM2M2w3LjM0NSwzLjU0OWwwLjI2MiwxLjc3bC0xLjY0MywxLjMyOGwtNy4wMTEsMC43MDNsLTIuODk1LDEuOTY3bC0xLjE4LDIuOTQ5bDEuMzQ1LDQuNjM3bDMuMDczLDQuOTEybDQuNjgxLDAuNmw0LjQzNi0xLjM2N2wwLjkxOSwyLjY3bC0yLjAyLDUuNTU2bDEuNjEsNi40MDlsLTEuNDgxLDUuMjExbDAuODg2LTAuNDg4bDUuMDQzLTIuOTA3bDguNzU4LDYuNDMxbDEyLjMxNSw1LjE5M2wwLjgyNS0yLjYwOWwtMS4yMDItNC4xMDJsMi43NzYtMTAuMjU2bDYuODgyLTE1LjcwNHYtNy4wNDhsMC41OTItMS4zNjdsMy4wMjMtMS4wOTFsLTMuMzAzLTQuMDQxbDAuMjk3LTIuNDU0bDIuNzc2LTMuMDMzbDcuNjUyLTIuNTIybDkuOTIxLTMuMjY2bDYuNzE3LDAuODMzbDQuMDkyLTMuODI5bDUuOTkzLTExLjY2M2w0LjIwNy0wLjE1MWwxMC44ODgsNS42ODVsMi4zOTYtMi41MjNsLTMuOTM4LTUuMTQ5bC0wLjA4Ny0wLjY4MmwtMC4xNDctMS40MzJsMi4zLTQuMTIzbDMuOTQ0LTIuMDk2bDIuOTI0LDEuMDQ4bDIuODU3LTAuNTUzbDIuOTU2LTAuNTZsNS4xNzUsMS4zOTNsMC42NzEsMC4xNjhsNy4yNjIsMS45NDVsNS4zMTgsNS4zODZsNC4yNTcsMi4zMjVsOS40MjksMTAuMzQybDguNzY5LDIuNTg4bDguMzQ2LDcuNjQ3bDMuODQ0LDYuNzI5bDQuMDI0LDkuOTE1bC0yLjEwNCwzLjc2MWwtNC40LDMuOTk0bC0yLjk5Miw3LjQxNGwtMy43NzUsMi4wOTZsLTEuMzYzLDIuNzUzbDIuMzE3LDQuOTM4bDMuMDM3LDYuNDQ5bDUuODQ2LDguNDE4bDEuMTY5LDQuNDY4bC0wLjEzMyw1LjgxMWwtMy42MTEsMTIuNjcxbDAuNDA5LDUuODMxbDMuMDg4LDcuNTY1bDUuMjIyLDcuMTU5bDExLjQwMSw4Ljg4NWwzLjE5OSw1LjI3OWw0Ljg5OCwzLjA3NWwxLjM2Myw0LjEyN2wxLjY0MiwwLjY4Mmw3LjI3My0xLjQzMmw0LjE1NywwLjU1M2w0LjgxMiw0LjY4M2wyLjkwOCwxLjE5NWwzLjUxNS0wLjY4Mmw3LjcxOC00LjE2N2w0LjIwNy0wLjY2NGw4LjQ4OSwwLjk4M2w4LjQ2LTEuODM3bDQuODYyLDAuNjIxbDE0LjU2OCw3LjgzN2wxLjkyMi0wLjI1NWwzLjAwNi00LjA1OWw2Ljk0Ni0yLjYyN2w0LjgxMywwLjU3NGw2Ljc4NSwwLjc3MWw0LjIyMS0wLjY0Mmw0LjYxNSwxLjgzN2w1LjM1Miw0LjE2Nmw4LjAyLDkuNjE0bDIuNTI4LDQuODk1bDAuMDgyLDEuNjAxbC00Ljc5OSw4LjM1NGwxLjI2Nyw1LjU1NWwyLjg3MywxLjcyOWw0LjAyMy0wLjQ3bDIuODkxLTEuNzk0bDcuMDE1LDUuNTEybDMuMjcxLDQuMDU5bC0xLjM0OSw1LjM4N2wxLjkwNCwzLjYzMmwzLjUxNSwxLjY0NGwxLjIzMywwLjU1Nmw3LjE3Niw4Ljg2N2wyLjc5NSw2LjUxN2wzLjY0NiwzLjE4NGw0LjQ5OCwwLjYxN2w0LjA5Mi0xLjcyN2wxNy42MjMtMTkuODA5bDcuMDYyLTExLjA2N2w0LjU5OC00LjQ4NWwxMi40NTItNC43NjZsMS4zMTItMS42ODdsLTAuMTgtMS4wMjZsLTAuNDczLTIuNzEzbDIuNjI1LTMuNTY3bDUuMDkyLDIuNTg0bDQuNzMxLTAuNjE3bDQuNjI5LDEuMzI0bDMuODk2LTQuMTg4bDYuNjAzLTIuOGwzLjEzOC0zLjE2NWwwLjY4OC0yLjc3M2wtMS4xMDItNS4zNjVsMS41MTEtMi4ybDguMzYzLDAuMTNsMy40LTEuMzg5bC0yLjIyMS03LjE3OGwwLjgwNy0xLjkwMWwzLjA4OCwwLjg5NGw1LjQ4NCw0LjUzMmwyLjUxNC0xLjI2NGwyLjI4NC0zLjM5NWwtMS4zMTYtNC40ODlsMS40NzktMS4xOTVsMC41NDEtMC40NDhsMi45NzctMC4zNDFsOC4wNjItMTkuMjkybDQuNzMxLTYuNjA0bDEuNjkyLTUuMDIxbC0xLjgyMi00Ljg0OGwxLjM5Ni0zLjI3MmwxLjYyNC0wLjk2Mmw0LjEyNSw0LjQ2OGwxLjcyNSwwLjI3NmwxLjAzMy0yLjk1bC0wLjcyMS04Ljg0MmwzLjIwMi0yMi4zOTNsMi4wMi01LjEwN2w0Ljg5Ni0xMi4yODdsLTAuMjk0LTMuOTA4bDQuODI3LTguMTgybDUuNzgtNi41NDJsMy4zNTEtNi42NjNsOC45MzgtNi41MzlsNS4zNTQtNy45NjdsMTEuOTg5LTcuNzU4bDMuOTA5LTEuMTczbDMuNjgtMy4zMTJsMS40NzgtNC4zMTNsLTAuNjA5LTQuNDQ2bC0wLjEyOS0wLjg5N2wyLjY2MS0zLjcxOGwyLjU0Ni0xLjYyMmw3Ljg1MSwwLjEyOWwyLjY5My0xLjA5NWwxLjkzNy0zLjM5NWwtMS40NzgtMS42OWwtNC4zODYsMC4yOGwtMS42NC0xLjg1OWwtMy4yMi0xMC41OTdsMy4yODQtMTEuNTk5bDcuNDM4LTE2LjQ5N2wyLjcxMS0xLjYwNGw0LjAxMSwwLjQwNWw4LjM0MSwzLjg0N2wyLjEwMiwwLjEyOWwxLjQ5NS0xLjY2NWwwLjM2My0yLjg2OGwwLjYwNS00LjgyN2wtMS4wMzItNi4yMzdsMi4wMTktNC40NjhsMS43NTgtMC4yNTRsNi43ODUsMy43NTdsMC45ODItMS44OGwtMi4xNjYtMTYuNjg3bDAuNzM5LTMuODQzbDIuMDE5LTEuNDVsLTAuMDE1LTIuODQ2bC0zLjA3My00LjIzMWwtMC4zNDQtMy4xODNsMi4xNjktNy4xMTZMNjg5LjQ1NSwxOTMuODg4eiBNMzkyLjE1MSw2MDEuMDkybDIuMjgtNy4wOTVsLTAuNDI3LTEuNjIybC0zLjgwOS0wLjU1NmwtMi41MTQsMS40NWwtMC4zMjcsMi45NzVsLTIuMTM4LDEuMTNsLTAuNDU5LDEuOTAybDIuNzU5LDMuNjk2bDIuNTc4LDAuNjZMMzkyLjE1MSw2MDEuMDkyeiBNMzg4LjgxNSw2MTMuNjZsLTQuNzE2LTIuODg1bC0yLjYyNSwwLjM4NGwtMC42NiwyLjQzN2wxLjk5LDUuMjExbC0yLjI0OCwzLjA1OGwtMy4wOTMtMC43MDdsLTIuNzg5LTMuMTU4bC0yLjU5OC0wLjMwMmwtMC42MzgsMi40MzhsMS4wODMsMy41MjNsMC4yNDQsMC43NzFsLTAuOTgyLDIuMDdsLTIuMjE3LTAuNjYzbC0zLjkwOS0xMS40OTFsLTIuNTgyLTAuNjY0bC0xLjQ5MiwyLjAzMWwwLjQwOSwyLjEzNmwyLjUxNCwxLjkwMWwtNC45Niw1LjAyMWwwLjYyNSw0LjYxNWw2Ljg1LDEuNzk0bDAuNzg5LDEuNjIybC0zLjM4Niw0Ljc0NGwwLjQ0NCwxLjQzMmw4LjUzOS0wLjQwOWwwLjI4LDQuNDI1bDYuMTkzLTEuOTYzbDUuOTkzLDEuNzUxbDIuNDQ5LTAuMzg0bDAuNTg4LTEuMjJsLTMuNTI4LTUuNDY5bC0wLjA4My0xLjc3M2wzLjIwMy00Ljc2NmwtMi40NjUtMi42MDVsMC44NC0yLjYwOGwxLjQ3OC0xLjg1OGw0LjE3MSwwLjIzNmw0LjYzNC01LjU1NWwtMi4zMzUtMS45MDJMMzg4LjgxNSw2MTMuNjZ6XFxcIi8+XFxuXHRcXG5cdDxwYXRoIGlkPVxcXCJmbGV2ZXNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiI0ZGRkZGRlxcXCIgZD1cXFwiTTMwNC41MzQsMTIyLjI4MWMwLjMzNC0wLjQ0LDAuNTY0LTAuOTc5LDEuMDMzLTEuM2MwLjg1MS0xLjA5NiwxLjYzMS0yLjI0NywyLjUyOC0zLjMwNWMwLjM0My0wLjM5NywwLjk4My0wLjcyNSwxLjQ0OC0wLjMzNmMwLjA5NCwwLjM0LTAuNjI5LDAuNjM4LTAuMTYzLDAuOThjMC4xMzIsMC4yMzMsMC44NDUsMC4xNjcsMC4zNDQsMC4zMjFjLTAuNDYyLDAuMTg5LTAuOTMzLDAuNDA3LTEuMjQxLDAuODE1Yy0wLjkzMiwwLjk1NS0xLjQxOSwyLjIzMi0xLjgwMSwzLjQ4N2MtMC41MSwwLjQzMSwwLjUxNSwxLjE4NCwwLjY3NSwwLjQ2MmMwLjE1MS0wLjMxOCwwLjc4Mi0wLjA4NSwwLjM4OSwwLjIwM2MtMC4zOCwwLjQ1OC0wLjM1OCwxLjExNiwwLjExNiwxLjQ3MmMwLjIwOCwwLjQ5OC0wLjM3MiwwLjc3MS0wLjc1OSwwLjUzNGMtMC42NTQtMC4wODEtMC45ODYsMC41NTctMS40ODcsMC44MThjLTAuNTk2LDAuMzU0LTEuMDU2LTAuMjU4LTEuNTYzLTAuNDY2Yy0wLjQwMy0wLjE1Mi0wLjY5MS0wLjY4Ny0wLjEyOC0wLjgzNWMwLjM2OC0wLjEwNiwwLjIzNC0wLjYzNC0wLjE0Ni0wLjM4NmMtMC41MjYsMC4yNDUtMS4yMTUsMC4xNTItMS41NDMsMC42NjJjLTAuNTQzLDAuMzc4LTAuNTYzLTAuMzk0LTAuMzI2LTAuNzAxYzAuMzYyLTAuNjQ2LDEuMDYyLTAuOTc5LDEuNTY3LTEuNDk1QzMwMy44MjcsMTIyLjg5NywzMDQuMTczLDEyMi41NzksMzA0LjUzNCwxMjIuMjgxTDMwNC41MzQsMTIyLjI4MXogTTI4My43MDEsMTM4LjkwNmMxLjA0NC0wLjc5MiwyLjA4Ny0xLjU4MywzLjEzMS0yLjM3NWMwLjE5Mi0wLjI4MiwwLjg3NS0wLjU3NiwwLjk1Mi0wLjA4YzAuMDc5LDAuMjksMC4zMjUsMC42ODQsMC42NzcsMC41MzdjMC4xMjMtMC4yMiwwLjY2NywwLjAzOCwwLjI4NiwwLjEyNWMtMC4zMzMsMC4xNzctMC44NywwLjM0Mi0wLjg0LDAuODA4YzAuMDMxLDAuNDA2LDAuMjI5LDAuNzcsMC4zNzEsMS4xNDRjLTAuMjk4LDAuNTExLDAuMTI0LDEuMTIxLTAuMTUsMS42MzhjLTAuMTQyLDAuMzg1LTAuMTQyLDAuODY0LTAuNDg4LDEuMTRjLTAuNDIzLDAuMTMtMC45MzgtMC4xNy0xLjI5NywwLjE3NmMtMC4zOTgsMC4yNTktMC43OTgtMC4xMjgtMS4xODQtMC4yMTRjLTAuNTIyLTAuMTM3LTEuMDctMC4xMTItMS41OTktMC4wMzFjLTAuMzU2LTAuMjM0LTAuODMxLTAuMTM1LTEuMTI5LDAuMDVjLTAuNDc3LTAuMTEzLTAuNTMzLDAuNDgxLTAuNzgyLDAuNzEyYy0wLjA5My0wLjE1OCwwLjEzMS0wLjUwMywwLjIzOC0wLjY5N2MwLjE0NC0wLjI0MywwLjM2OS0wLjQyMywwLjUzNi0wLjY0NGMwLjE2NS0wLjM4MiwwLjM2Mi0wLjgyNSwwLjgyLTAuOWMwLjQwMy0wLjIxMiwwLjIyNS0wLjczNSwwLjEtMC45OTVDMjgzLjQzNiwxMzkuMTQ0LDI4My42MjksMTM5LjA3NiwyODMuNzAxLDEzOC45MDZMMjgzLjcwMSwxMzguOTA2eiBNMjk3LjU1LDgzLjg5NmMwLjc0NiwwLjI3NywxLjQ5MiwwLjU1NSwyLjIzNywwLjgzMmMwLjE1OSwxLjI3OSwxLjkzMiwwLjQ0NSwyLjE2MiwxLjcyNGMwLjYxMiwwLjg2NywxLjkxOSwwLjA3MSwyLjgwMSwwLjQ5OGMxLjA2MSwwLjEzNiwxLjQ3OCwxLjE1OCwyLjA4MywxLjg5MmMwLjY3OSwwLjg5NCwxLjM2MiwxLjc4NiwxLjk2OSwyLjczMWMxLjIzNy0wLjcwMywxLjU0MiwwLjU2OCwyLjA5NCwxLjQyNWMxLjIyOSwwLjkxNiwyLjQ4MiwxLjgwMiwzLjc4OCwyLjYwNWMwLjY4NSwwLjg2NSwxLjA3LDEuNzgsMi4zNTQsMS41MDljMC45MTMtMC4xODksMS43MS0wLjY2OCwyLjY4MS0wLjE5OGMxLjAwNi0wLjEzNiwyLjA3Mi0wLjM5NCwyLjEzMi0xLjUzN2MxLjE4LDAuMjc4LDIuMTU4LTAuMDY4LDIuOTY0LTAuOTU3YzEuMTk2LTAuMjM2LDEuMzI2LTEuMzQ5LDEuOTQ3LTIuMTVjMC40MzQtMC4yLDAuOTA3LTAuMzE1LDEuMzQ5LTAuNTA1IE0zMTUuNjQzLDk2Ljk0N2MtMC4zNjMsMC45NzctMC44MDYsMS45NjItMS41NjQsMi42OTljLTAuNDMzLDAuODExLDAuMzIsMi4yMDMtMC45MDgsMi41MjRjLTAuNzkyLDAuMjEtMS4xNzYsMC44NTctMS4zMzMsMS42MTljLTAuMDc0LDAuOTAyLTEuMjU5LDAuNzc5LTEuNTQyLDEuNDk1Yy0wLjI0MiwwLjYzMy0wLjQ4NCwxLjI2Ni0wLjcyNiwxLjg5OGMwLjM4OSwwLjg0NSwwLjQ0OSwxLjk2Mi0wLjU2NiwyLjM1NGMtMC41MzksMC44NjEtMC4xNDgsMS45MzctMC4xMzIsMi44N2MwLjI3OSwwLjc5MiwxLjI1MSwxLjE0LDEuNDIxLDEuOTc3Yy0wLjE0NCwwLjk4Ni0xLjM5MywxLjI0NS0xLjgsMi4wOTFjLTAuMTA0LDAuMjEzLTAuMTQzLDAuNDU0LTAuMTM3LDAuNjg5IE0zMDEuNDUsMTI1LjI4OGMtMS42NywxLjc0OS0zLjE5NywzLjYyNS00Ljc5Niw1LjQzOGMtMC43NDgsMC4yMTQtMS43MDgsMC4wNTktMi4yMywwLjc2MWMtMC40MDksMC4zNC0wLjcwNywwLjg1My0xLjE5NCwxLjA3M2MtMC43NTUsMC4xOTktMS41MSwwLjM5OC0yLjI2NSwwLjU5N2MtMC42MjMsMS4yMzctMS4yNjcsMi40NzItMi4wODIsMy41OTZjLTAuMTU4LDAuMDYtMC4zMTcsMC4xMTktMC40NzYsMC4xNzkgTTI4MS4zMTEsMTQzLjA3MmMtMC43MTcsMC44ODQtMS43ODQsMS40MDUtMi44NzUsMS42NmMtMC41MzIsMC40MDEsMC4xNTgsMS4yNS0wLjQ2MywxLjY1NWMtMC42NDIsMC44NzItMS40NjUsMS42MjUtMi40NTEsMi4wODFjLTEuMTMzLDAuODEtMi4yMDYsMS43OTEtMi43OSwzLjA4Yy0wLjIyOSwwLjM5NS0wLjQ1OCwwLjc5MS0wLjY5MSwxLjE4NCBNMTc4LjA4OCwzMTYuNjk0bC0wLjg2MSwwLjc2MWwtMC4zMzEtMC40MmwtMC40MDEtMC4wMmwtMC43MzMtMC40NDFsLTEuMTE0LTAuODI4bC0wLjQwMi0wLjAyMWwtMS4xNTQtMC4wNmwtMC43NTMtMC4wNTdsLTAuMzgyLTAuNDJsLTEuMTE1LTAuODEybC0xLjA5Ny0wLjg3OGwtMS4xMTUtMC44MTFsLTIuMjA5LTIuMDRsMC44NS0xLjUxMmwwLjc5NC0wLjcxMWwwLjktMS41MTJsMy4yMjEtMi41MjdsMS42MTYtMS4wNzFsMS45ODUtMS4wMzVsLTAuMzEyLTAuNzcxbC0xLjA5NS0xLjIyOWwtMC43NjctMC40NDFsLTEuMTM0LTAuNDc4bC0wLjM4Mi0wLjM3MWwtMS4xNzItMC4wNjFsLTEuNDQ5LTAuODk3bC0wLjQwMS0wLjAyMWwtMC43MTMtMC43OTFsLTEuMTE0LTAuODc4bC0xLjEzNi0wLjQxMWwtMS4xMzUtMC40NjFsLTAuNzgyLTAuNDU4bC0xLjU1Ny0wLjA4MWwtMC43MTQtMC44MDhsMC44My0xLjA5NWwwLjAyMS0wLjQxN2wwLjA0LTAuNzUxbDAuNDIyLTAuMzY0bDAuNDIyLTAuMzNsMC40MjItMC4zOGwtMC4zNDUtMC43NzFsLTAuMzgyLTAuNDM4bC0wLjQwMS0wLjAybC0wLjczMy0wLjQ0bC0wLjQwMS0wLjAybC0xLjE1NC0wLjA3N2wtMC4zMzItMC4zN2wtMC40MDEtMC4wMjFsLTAuNzczLDAuMzExbC0wLjQxOC0wLjAyMWwtMC4zODItMC4zNzFsLTAuNzE3LTAuNDU3bDAuMDIxLTAuNGwtMC4zNDItMS4xNzJsLTAuMjkxLTEuMTcxbDAuMDM3LTAuNGwwLjAyLTAuMzUxbDAuMzcxLTAuMzgxbDAuNDIyLTAuMzhsMi4wMDUtMS40MDJsMC44NDQtMC43NDRsMS42NDUtMi4yMjNsMC40MDEsMC4wMmwxLjE1NSwwLjA2bDEuMTU0LDAuMDc3bDAuMDItMC40MDFsMC4wMjEtMC4zNWwxLjIzMS0xLjA5MWwwLjQwMiwwLjAybDAuNDQxLTAuNzgxbDAuODExLTAuNzExbDAuNDIyLTAuMzYzbDAuMzkyLTAuNzMxbDAuNDIyLTAuMzhsMC43NzItMC4zMTFsMC40MDIsMC4wMmwwLjQwMSwwLjAybDAuMzg5LTAuMzhsMC4wMzktMC43NTFsMC40NDItMC43ODFsMC40NTktMC43M2wwLjMzOC0wLjM0OGwwLjA2Ny0wLjAxNmwwLjg1LTEuNDk2bC0wLjMwOC0xLjE3MWwtMC4zNDUtMC44MDVsMC4wMi0wLjM4NGwwLjA2MS0xLjE1MmwwLjA1OC0wLjc2OGwwLjA0LTAuNzY4bC0wLjM2NS0wLjQybC0wLjM4NS0wLjAybC0wLjQwNSwwLjM2NGwtMC4zODUtMC4wMmwtMC4zNDUtMC43ODhsLTAuMzg1LTAuMDJsMC4wMi0wLjM4NGwtMC43NDktMC40NGwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDJsLTAuODA3LDAuMzQ0bC0wLjM0OS0wLjQwNGwtMC40MDEtMC4wMzdsLTAuNzctMC4wNGwtMC4zODYtMC4wMjFsLTAuNDA0LDAuMzY0bC0wLjM4Ni0wLjAyMWwtMC40MDQsMC4zNjRsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAzN2wwLjAyLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybDAuMDItMC4zODRsLTAuMzg1LTAuMDIxbDAuMDItMC4zODRsLTAuMzg1LTAuMDJsLTAuMzY0LTAuNDJsMC4zODUsMC4wMzdsLTAuMzY1LTAuNDJsLTAuMzQ1LTAuNzg4bC0wLjc0OS0wLjQyNGwtMC4zODYtMC4wMmwtMC4zNjQtMC40MjFsLTAuMzQ1LTAuNzg4bDAuMDItMC4zODRsMC4wMjEtMC4zODRsMC4wMzYtMC4zODRsLTAuMzY0LTAuNDA0bDAuMDItMC4zODRsLTAuMzY0LTAuNDIxbDAuNDI1LTAuNzQ4bC0wLjM2NS0wLjQwNGwxLjEzNSwwLjQ2bDEuMTkxLTAuMzIzbDAuMDIxLTAuMzg0bDAuODMtMS4xMTFsLTEuNDk5LTAuODY1bDAuMDQtMC43NjhsMC4wMzYtMC4zODRsMy4yMTctMi4xNDNsMi40MjctMS43ODJsMC4wNC0wLjc2OGwwLjQyMi0wLjM2NGwwLjQ4NS0xLjkxNmwwLjAyMS0wLjM4NGwwLjQ0MS0wLjc0OGwwLjE1Ny0yLjY4N2wyLjgzMi0yLjE2M2wwLjM4NiwwLjAybDEuMTU0LDAuMDc3bDAuMzg1LDAuMDJsMC43NSwwLjQyNGwwLjM4NSwwLjAybDEuMTcyLDAuMDc3bDAuNzUsMC40MjRsMC4zODUsMC4wMjFsMS41NCwwLjA5N2wwLjM4NSwwLjAybDAuMDItMC4zODRsMC4wMjEtMC4zODRsMC4xMzctMi4zMmwtMC4zNDUtMC43ODhsMS41NzctMC4zMDNsMC4zODUsMC4wMmwwLjc3LDAuMDU3bDAuMzY1LDAuNDA0bDAuMzY1LDAuNDA0bDEuOTA0LDAuNTAxbDEuNTU3LDAuMDgxbDAuMzY0LDAuNDJsMC43NSwwLjQyNGwwLjM4NSwwLjAybDEuNTYxLTAuMzA0bDAuNzQ5LDAuNDRsMC4zNDYsMC43ODhsMi45NzksMi4wOTdsMC43NSwwLjQ0bDAuNzUsMC40MjRsMS41MiwwLjQ4bDEuNTIsMC40NjRsMS4xNzIsMC4wNzdsMS4xOTQtMC43MDhsMS4xMzUsMC40NDRsMC43NzEsMC4wNTdsMC44NDctMS4xMTFsMC43OS0wLjM0NGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjM4NiwwLjAybDAuNzQ5LDAuNDQxbC0xLjAzNy0xLjk5N2wtMC43MS0xLjIwOGwtMC4zNDUtMC43ODhsMC44MDctMC4zNDRsMS41OC0wLjY3MWwwLjQwNS0wLjM2NGwxLjE5MS0wLjMyM3YtMC4wMTdsMS45ODUtMS4wMzRsMi4wMDItMS4wMzVsMS41OTctMC42ODhsMC43MjksMC44MjVsMC43NywwLjA0bDIuMzEsMC4xMzdsMS4xNzIsMC4wNjFsMC4zNjUsMC40MDRsMC43MTMsMC44MjVsMy4wNTYsMC45NDVsMS4xMzUsMC40NDRsMy44MSwxLjAwMWwyLjMyNiwwLjEzN2wxLjE1NSwwLjA2bDAuNzcsMC4wNDFsMS45MjIsMC41MDFsMC43NywwLjA0bDIuMjg5LDAuNTIxbDEuMTU1LDAuMDZsLTAuMDIsMC4zODRsMi4zMDYsMC41MjFsMS41NCwwLjA5N2wwLjc5LTAuMzQ0bDAuNDA1LTAuMzY0bDEuMjMxLTEuMDkxbDEuNjE3LTEuMDcxbDAuODEtMC43MTFsMC44MTEtMC43MjhsMC40MjItMC4zNjNsMC40MDQtMC4zNjRsMi4wMjItMS40MzVsMC4zODUsMC4wMmwwLjgxMS0wLjcyOGwwLjgyNi0wLjcyOGwyLjM1MS0wLjYzbDEuNTc2LTAuMzA0bDEuMTE0LDAuODQ1bDAuNzcxLDAuMDRsMS41MzksMC4wOTdsMC4zODYsMC4wMmwwLjAzNi0wLjM4NGwtMC42ODktMS41OTJsLTAuMTQ2LTQuMjZsMC4wMi0wLjM4NGwtMC41NzItMy41MTJsLTAuNTUyLTMuODk2bC0wLjU5Mi0zLjEyOGwwLjAyLTAuMzg0bDAuMDM3LTAuMzg0bC0wLjg3Ny01LjA2N2wwLjM4NSwwLjAyMWwxLjY1Ny0xLjgzOWwtMC4yODgtMS41NzJsLTEuNDM5LTJsLTEuMDc0LTEuNjEybDAuOTY4LTMuNDMybDAuOTA3LTIuMjYzbDEuMTkxLTAuMzIzbDAuODg4LTEuODc5bDAuODUxLTEuNDk1bDAuODQ3LTEuMTEybDEuNTYtMC4yODdsMC44NjctMS40OTZsMi4zMSwwLjEyMWwwLjgyNy0wLjcxMWwwLjQ0NS0xLjE0OGwwLjQ2Mi0xLjEzMWwwLjQwNS0wLjM2NGwwLjAyLTAuMzg0bDAuNDI2LTAuNzQ4bDAuNDIxLTAuMzY0bDAuMDIxLTAuMzg0bDAuNzktMC4zNDRsMC40MDUtMC4zNjRsMC4wMi0wLjM4NGwwLjQyMi0wLjM2NGwwLjM4NSwwLjAzN2wwLjM4NSwwLjAyMWwwLjgzMS0xLjExMmwwLjgyNi0wLjcyOGwwLjQwNS0wLjM2NGwwLjQwNS0wLjM2NGwwLjQwNS0wLjM2NGwwLjgwNy0wLjM0NGwwLjc5LTAuMzQ0bDAuNzcsMC4wNTdsMC43OS0wLjM0NGwwLjc1LDAuNDI0bDAuMzg1LDAuMDJsMC43ODcsMC4wNGwwLjM4NSwwLjAzN2wwLjQ0NS0xLjE0OGwyLjc3MS0wLjk5NWwwLjAyLTAuMzg0bC0wLjM4NS0wLjAybDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC4wMjEtMC4zODRsMTMuMjQ2LTcuNzQ5bDAuNDA0LTAuMzY0bDAuMDIxLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMmwtMC4zNjUtMC40MjFsLTAuMzQ1LTAuNzg4bC0wLjM2NC0wLjQwNGwtMC43NS0wLjQyNGwwLjAyLTAuMzg0bC0wLjMyNy0wLjgwNGwtMC4zNjUtMC40MDRsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMzdsMC4wMi0wLjM4NGwtMC4zODUtMC4wMjFsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAybC0wLjM2NC0wLjQwNGwtMC4zODYtMC4wMmwtMC40MDEtMC4wMzdsLTAuMzQ4LTAuNDA0bC0wLjQwMi0wLjAybC0wLjM4NS0wLjAybDAuMDIxLTAuMzg0bDAuMDM2LTAuMzg0bDAuNzktMC4zNDRsMC4wMjEtMC4zODRsMC40MjUtMC43NDhsMC44MDctMC4zNDNsMC40MjYtMC43NDhsMC4wMi0wLjM4NGwwLjg0OC0xLjExMWwwLjA0LTAuNzY4bDAuNDA0LTAuMzY0bDAuMDIxLTAuMzg0bDAuMDIxLTAuMzg0bDAuNDgxLTEuNTMybDAuNDA1LTAuMzQ3bDAuNDA1LTAuMzY0bDAuNDIyLTAuMzYzbDAuMDItMC4zODRsMC4wMjEtMC40bDAuNDA0LTAuMzQ3bDAuNDA1LTAuMzY0bDAuMDIxLTAuNDAxbDAuNDQxLTAuNzQ4bDAuODExLTAuNzExbDAuNzktMC4zNDRsLTAuNjUyLTEuOTc2bC0wLjcxLTEuMTkybDIuMDQyLTEuODE5bDAuMzY0LDAuNDA0bDAuNzMsMC44MDhsMC43NDksMC40NGwwLjM2NSwwLjQwNGwtMC4wMiwwLjM4NGwwLjM4NSwwLjAybC0wLjAyMSwwLjM4NGwtMC4wMiwwLjM4NGwwLjM4NSwwLjAybDAuMzY0LDAuNDIxbC0wLjAyLDAuMzg0bC0wLjAzNywwLjM4NGwwLjQwMiwwLjAyMWwwLjM4NSwwLjAybDAuNzUsMC40MjRsLTAuMDIxLDAuNGwwLjY5MiwxLjE5MmwtMC4wMiwwLjM4NGwtMC4wMjEsMC4zODRsLTAuMDIsMC4zODRsMC4zODUsMC4wMjFsLTAuMDIsMC4zODRsMC4zODUsMC4wMzdsMC4zNjQsMC40MDRsMC43NzEsMC4wNGwwLjM4NSwwLjAybDEuMTc1LTAuMzA3bDIuMzQ3LTAuMjYzbDAuNDgxLTEuNTE1bDAuMzg1LDAuMDJsMS41OC0wLjY3MWwwLjM4NSwwLjAybDAuODA4LTAuMzQ0bDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjgzLTEuMTExbDAuNDIyLTAuMzY0bDAuNDI1LTAuNzQ4bDAuNDA1LTAuMzY0bDAuNzktMC4zNDRsMC40MjItMC4zNjNsMC43OS0wLjMyN2wyLjAwMi0xLjA1MWwxLjY5Ny0yLjYwN2wwLjQ0NS0xLjEzMWwwLjQ0MS0wLjc0OGwxLjE5NS0wLjcwOGwwLjc1LDAuNDI0bDEuMTkxLTAuMzA3bDEuNTgtMC42ODhsMC40NjItMS4xMzFsMS42MDEtMS4wNzFsMC40MjEtMC4zNjRsMS4yMzUtMS40NzZsMC4zODYsMC4wMjFsMC40NDEtMC43NDhsMS42LTEuMDU1bDIuMDQzLTEuODE5bDAuODA3LTAuMzQ0bDAuNDI1LTAuNzQ4bDAuMDYxLTEuMTUybDAuNDYyLTEuMTMxbDAuNzktMC4zNDRsMC44MjctMC43MjhsMS41Ni0wLjMwNGwyLjEwMy0yLjk3MWwxLjU1NywwLjA5N2wxLjIxNS0xLjA5MWwwLjg0Ny0xLjExMWwwLjc3MSwwLjA0bDEuNTk2LTAuNjcxbDAuNDI2LTAuNzQ4bDIuODEyLTEuNzc5bDAuODQ4LTEuMTExbDAuODEtMC43MjhsMC4wMjEtMC4zODRsMi40MjctMS43ODJsMS4xOTEtMC4zMjRsMC40MjUtMC43NDhsNS4wOTktMC44NzRsMS45MjUsMC4xMTdsMS45NDQtMC4yODRsMi42OTEsMC41NDJsMC43NywwLjA1N2wxLjA3OSwxLjU5NmwxLjE5NC0wLjY5MWwxLjIxMi0wLjcwOGwxLjE5NS0wLjcwOGwwLjQ2Mi0xLjEzMWwyLjMzLTAuMjQ3bDMuMTc3LTEuMzc1bDIuMjg2LDAuOTA1bDEuOTg0LTEuMDM1bDEuMjcyLTEuODU5bDAuNzcsMC4wNGwxLjU5OC0wLjY4N2wxLjE3NS0wLjMwN2w0LjM4OC0yLjA2NmwyLjM4Ny0xLjAzMWwzLjE1Ny0wLjk3NWwwLjc3LDAuMDRsMS4yMzItMS4wOTFsMC43OS0wLjMyN2wxLjU3OS0wLjY4OGwwLjQyMi0wLjM2NGwxLjIxNi0xLjA5MWwyLjM0Ny0wLjI0N2wyLjE1MSwyLjgyNGw0LjAzNCw0LjA5M2wwLjcyOSwwLjgyNWwxLjQ1OSwxLjYzMmwyLjg4MiwzLjYzMmwxLjIxMi0wLjY5bDAuNDI1LTAuNzQ4bDIuMDIyLTEuNDM1bDIuMzg3LTEuMDMxbDIuNDI3LTEuNzgybDIuMDIxLTEuNDM2bDAuMzY1LDAuNDA0bDAuNzI5LDAuODI0bDEuMTM1LDAuNDQ0bDEuMDk1LDEuMjI5bDEuMTE0LDAuODI4bDAuNzktMC4zMjdsMC4zODUsMC4wMmwxLjE1NSwwLjA2bDEuODQ1LDEuNjUybDEuMTE0LDAuODQ1bDEuNjU3LTEuODM5bDAuODg3LTEuODc5bDAuMDYxLTEuMTY4bDAuMDIxLTAuMzg0bDAuMDItMC4zODRsLTAuMzY1LTAuNDA0bDAuMDM3LTAuMzg0bDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC4zODUsMC4wMmwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuNDQyLTAuNzQ4bDAuMDItMC4zODRsMC4wNDEtMC43ODVsMC4wNjEtMS4xNTFsMC4zODUsMC4wMmwwLjAzNi0wLjM4NGwwLjA0MS0wLjc2OGwtMC4zNjUtMC40MDRsLTAuMzQ1LTAuNzg4bC0wLjI0OC0yLjM0bDAuNDg2LTEuODk5bC0wLjYxMy0yLjc0NGwtMC4yNjgtMS45NTZsMC40MDUtMC4zNjRsMC4zODUsMC4wMzdsMC4zODUsMC4wMmwwLjAyMS0wLjM4NGwwLjM4NSwwLjAybDAuNDIyLTAuMzY0bDAuMzg1LDAuMDJsMC4wNC0wLjc2OGwwLjQwNS0wLjM2NGwyLjYzNSwxLjMwOWwwLjQwNS0wLjM2NGwwLjg2Ni0xLjQ5NWwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuNDYyLTEuMTMxbDAuMDIxLTAuMzg0bDAuMzg1LDAuMDJsMC43NzEsMC4wNGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC40MDEsMC4wMmwwLjQwNS0wLjM2NGwwLjQyNS0wLjc0OGwwLjQyNS0wLjc0OGwwLjQyMi0wLjM2M2wwLjgzLTEuMTEybDEuMjEyLTAuNjlsMC44My0xLjExMmwwLjAyMS0wLjRsMS4yNTItMS40NThsMC40MDUtMC4zNjRsMC4wMi0wLjRsMC44MjctMC43MTFsMC43OS0wLjM0NGwxLjI3MS0xLjg1OWwwLjg0OC0xLjExMWwwLjc5LTAuMzQ0bDEuNTgtMC42ODhsMC44MDctMC4zNDMgTTQ4MC44ODgsMTE1LjgyNGwtMi4xMzksMC41NTlsLTIuNzYyLDAuNTYybC0wLjc3LTAuMDUzbC0wLjM4NC0wLjAyN2wtMC40MjgsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjQxMSwwLjM1NmwtMC40MTEsMC4zNTdsLTAuNzk2LDAuMzNsLTAuNzg1LTAuMDdsLTAuMDI3LDAuMzgzbC0wLjc5NiwwLjMzbC0yLjgxNSwxLjM0NmwtMS4xOCwwLjI4NmwtMS42MDksMC42NTlsLTAuNDExLDAuMzU3bC0yLjQ4NCwyLjE0bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4NGwxLjA3MywxLjIzbDAuMzU3LDAuNDExbDIuMTAzLDIuODc4bDEuNDU3LDEuMjc0bC0wLjQzOCwwLjc0bC0wLjc2OS0wLjA3bC0xLjYwOSwwLjY1OWwtMS42MTgsMS4wNDNsLTAuODEyLDAuMzI5bC0xLjIwNywwLjY3bC0wLjgzOSwwLjcxM2wtMC44MjMsMC43MTNsLTEuMjUxLDEuMDY5bC0wLjgyMiwwLjcxM2wtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0xLjI1MSwxLjA3bC0xLjI1MSwxLjA1M2wtMC44NDksMS4wOTdsLTAuODQsMC43MTNsLTAuMDI2LDAuMzgzbC0wLjQxMiwwLjM1N2wtMC4wNTQsMC43ODRsLTAuODY2LDEuMDk2bC0wLjAyNiwwLjM4NGwtMC40MzgsMC43NGwtMC4wMjYsMC4zODNsLTAuMDQ0LDAuMzgzbC0wLjUxOSwxLjg5MWwtMC4wMjYsMC4zODRsMC4yODcsMS4xOTNsLTAuMDU0LDAuNzY3bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsLTAuNDU1LDAuNzM5bC0wLjgyMiwwLjcxNGwtMC40MzgsMC43NGwtMC4wMjYsMC4zODNsLTAuNDI5LDAuMzU2bC0wLjAyNiwwLjM4NGwtMC4wMjYsMC4zODNsLTAuODUsMS4wOTdsLTAuNDI5LDAuMzU2bC0wLjA1MywwLjc2N2wtMC40NjUsMS4xMjRsLTAuMzg1LTAuMDI3bC0wLjQyOSwwLjM1NmwtMS4xOCwwLjMwM2wtMC40MTIsMC4zNTZsLTAuMzg0LTAuMDI2bC0wLjgzOSwwLjY5NmwtMC44MjMsMC43MTRsLTAuNDM4LDAuNzRsLTAuNDI4LDAuMzU2bC0wLjA1NCwwLjc2N2wtMC4wNTQsMC43ODRsLTAuMDk3LDEuMTVsLTAuMDI3LDAuMzgzbC0wLjQ5MSwxLjUwN2wtMC40MjksMC4zNTZsLTAuNDExLDAuMzU2bC0wLjM4NS0wLjAyN2wtMC44MjIsMC43MTNsLTAuODEyLDAuMzNsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjQxMSwwLjM1N2wtMC44OTQsMS40NzlsLTEuNTExLTAuNTA3bC0yLjY1NC0wLjk3MmwtMS44OTYtMC41MThsLTAuNzY5LTAuMDdsMC4wMjctMC4zODNsLTEuMjM0LDEuMDdsLTMuMjcxLDIuMDg1bC0yLjQzMSwxLjM1NmwtMy4yODEsMi40N2wtMi40NzQsMS43MzlsLTEuOTc3LDAuNjMzbC0xLjI1MSwxLjA2OWwtMS41NjQsMC4yNmwtMC40MTEsMC4zNTdsLTAuODEyLDAuMzNsLTAuODUsMS4wOTdsLTEuMzU4LDIuNjA0bC0wLjA0MywwLjM4M2wwLjM1NywwLjQxMWwtMC4wMjYsMC4zODNsLTAuMDI3LDAuNGwwLjc0MiwwLjQzN2wtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjQ4MSwxLjEyM2wtMC4wNTQsMC43NjdsLTAuNDY2LDEuMTRsLTAuMDQzLDAuMzgzbDEuNzYyLDIuNDUxbC0wLjAyNywwLjM4NGwxLjM3NywyLjQyNWwwLjY5OSwwLjgybC0wLjgyMywwLjcxM2wtMS4yMDcsMC42ODdsLTEuMjI0LDAuNjg3bC0xLjIwNywwLjY3bC0wLjgxMiwwLjMyOWwtMC4wMjYsMC4zODRsMC42ODgsMS4yMjFsMC4zNTgsMC40MWwtMC4wOTgsMS4xNWwtMC40MzgsMC43NGwtMS4yNTEsMS4wN2wtMC40MzgsMC43NGwtMC40OTEsMS41MDdsLTAuMDQ0LDAuMzgzbC0wLjAyNywwLjRsLTAuMDI2LDAuMzg0bC0wLjc5NiwwLjMxM2wwLjM1NywwLjQyN2wtMC4zODQtMC4wMjdsLTEuNjYyLDEuNDFsLTAuNTA5LDEuNTIzbC0wLjQxMSwwLjM0bC0wLjkyLDEuODhsLTAuODUsMS4wOTdsLTEuNzE2LDIuMTkzbC0wLjgzOSwwLjY5NmwtMC43OTYsMC4zM2wtMC4zODUtMC4wMjZsLTAuNzk2LDAuMzNsLTAuMzMxLTAuNzkzbC0wLjA5OCwxLjE1bC0wLjA1MywwLjc2N2wtMC4wMjcsMC4zODRsLTAuNDY1LDEuMTI0bC0wLjQ1NSwwLjc0bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuODQsMC43MTNsLTAuNzk2LDAuMzNsLTAuODIyLDAuNzEzbC0wLjY4OC0xLjIyMWwwLjc5Ni0wLjMxM2wtMC4zNTctMC40MjdsMS42MDctMC42NDNsLTAuMjc2LTEuNTc4bC0wLjc3LTAuMDUzbC0xLjU5MiwwLjY2bDAuMzQxLDAuNDFsLTEuNjE4LDEuMDQzbC0wLjc5NSwwLjMxM2wtNC4wODYtMi42MjlsLTAuNDExLDAuMzU2bC0wLjM4NS0wLjAyN2wtMC4zNTctMC40MWwtMC4wMjcsMC4zODRsLTAuNzk2LDAuMzNsLTAuMDI2LDAuMzg0bC0wLjM4NS0wLjAyN2wtMC44MTIsMC4zM2wwLjAyNy0wLjM4NGwwLjM4NCwwLjAyN2wtMC43NDEtMC40NTRsLTAuNjk5LTAuODJsLTEuMS0wLjg2NGwtMC43MTYtMC44MjFsLTEuNDU3LTEuMjc0bC0wLjcxNi0wLjgyMWwtMS4xLTAuODY0bC0wLjcxNi0wLjgybC0wLjY2MS0xLjYwNGwtMC4yODctMS4xNzdsLTAuNjYyLTEuNjA0bC0wLjcxNS0wLjgyMWwtMS42MzYsMS4wNDNsLTEuOTQ5LDAuMjMzbC0xLjIyNCwwLjY4NmwtMC44NSwxLjA5N2wtMS4xOTcsMC4zMDNsLTAuNDExLDAuMzU2bC0xLjIwNywwLjY3bC0wLjg0LDAuNzEzbC0wLjM4NC0wLjAyN2wtMC40MTIsMC4zNTdsLTAuMzg0LTAuMDI3bC0wLjQzOCwwLjc0bC0wLjc0Mi0wLjQzN2wtMC4zNTctMC40MjdsLTAuMzg1LTAuMDI3bC0wLjM1Ny0wLjQxbC0wLjM1OC0wLjQxbC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODNsLTAuMDcsMC43NjdsLTAuNDExLDAuMzU2bC0wLjgyMiwwLjcxM2wtMC40NTUsMC43NGwtMC40MTEsMC4zNTdsLTAuMDI3LDAuMzgzbC0wLjc5NiwwLjMzbC0wLjQyOCwwLjM1NmwtMC4zODUtMC4wMjdsMC43MTYsMC44MmwtMC44NzYsMS40OGwwLjY0NSwxLjYwNGwtMC4wMjYsMC4zODRsLTAuNzQyLTAuNDU0bC0wLjgyMywwLjcxM2wwLjcxNiwwLjgzN2wwLjM1NywwLjQxbC0xLjE5NywwLjMwM2wtMS41NjQsMC4yNmwtMC43Ny0wLjA1M2wtMC43ODUtMC4wNTRsMS4wNDYsMS42MTRsLTAuODIyLDAuNzEzbC0xLjc0MiwyLjU3N2wtMC40ODIsMS4xMjRsMC4zNTcsMC40MjdsLTAuMzg0LTAuMDQzbDAuMzU3LDAuNDI3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODNsLTAuMDQzLDAuMzgzbC0wLjgyMywwLjcxM2wwLjcxNiwwLjgybC0wLjg2NiwxLjA5N2wtMC44NSwxLjA5N2wtMC43NDItMC40MzdsLTAuNDU1LDAuNzRsLTEuODY4LTAuOTE3bC0wLjM1OC0wLjQxbC0wLjQxMSwwLjM1NmwtMC4zMy0wLjgxbC0wLjc5NiwwLjMzbC0wLjc5NiwwLjMzbC0wLjM4NS0wLjAyN2wtMC44MTIsMC4zM2wtMC43MTYtMC44MzdsLTIuODQyLDEuNzI5bC0wLjM1OC0wLjQxbC0wLjM1Ny0wLjQyN2wtMC43MTUtMC44MjFsLTAuMzQyLTAuNDFsLTEuMDcyLTEuMjQ4bC0wLjcxNi0wLjgybC0wLjcxNS0wLjgzN2wtMC43Ny0wLjA1M2wtMS4xNTMtMC4wODFsLTEuMTk3LDAuMjg2bC0wLjM4NC0wLjAyN2wtMC4zODUtMC4wMjdsLTEuNTM4LTAuMTA3bC0xLjE5NywwLjI4NmwtMC43OTYsMC4zM2wtMS4yMDcsMC42ODdsMC4zMTQsMC43OTNsLTEuMjA3LDAuNjg3bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4NGwtMC4wNTQsMC43NjdsLTAuMzg1LTAuMDI2bC0wLjAyNiwwLjM4M2wtMS4yMjUsMC42ODZsLTAuNDM4LDAuNzRsLTAuODIzLDAuNzEzbC0yLjExNiwyLjE2N2wtMC4zODUtMC4wNDRsLTIuMDczLDEuNzgzbC0wLjgyMiwwLjcxM2wtMC43OTYsMC4zM2wtMC40MjksMC4zNTZsLTAuMzg1LTAuMDI2bC0yLjQwMywwLjk3M2wxLjQwMywyLjA0MWwwLjM1OCwwLjQxbDAuMjc2LDEuNTc4bC0wLjAyNiwwLjM4M2wtMS41NTUtMC4xMjRsLTAuNzY5LTAuMDU0bC0wLjc3LTAuMDU0bC0xLjkyMi0wLjE1bC0wLjQwMS0wLjAyN2wtMS4xNTQtMC4wOGwtMS41MzctMC4xMjRsLTAuMDU0LDAuNzY3bC0wLjEyNCwxLjU1bDAuMTUzLDMuMDk0bC0wLjAyNSw1LjQyOGwtMC4xMDYsMS41MzRsMC4zMDQsMS4xNzdsMS4xNTMsMC4wOTdsLTAuMDU0LDAuNzY3bC0xLjI1LDEuMDdsMC43MTUsMC44MmwwLjc0MiwwLjQ1NGwxLjQ4NCwwLjg3NGwtMS42MDgsMC42NmwtNC40MDcsMS45ODlsMS41NCw1LjE1MWwyLjgwOSw0LjA2NmwwLjM4NCwwLjA0M2wxLjY5MSwzLjIxOGwwLjQxMS0wLjM1NmwwLjA0NC0wLjM4M2wwLjA1NC0wLjc2N2wwLjA1NC0wLjc4M2wwLjAyNy0wLjM4NGwwLjM4NCwwLjA0M2wwLjM4NSwwLjAyN2wwLjM4NCwwLjAyN2wwLjM1OCwwLjQxbC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsMC4zODUsMC4wMjZsMC40NTUtMC43MzlsMC40MTEtMC4zNTdsMC40MzgtMC43NGwwLjQxMS0wLjM1NmwwLjAyNy0wLjM4NGwwLjQwMSwwLjAyN2wwLjAyNi0wLjM4M2wwLjM1NywwLjQxbC0wLjA0NCwwLjM5OWwtMC4wMjYsMC4zODRsMC43ODYsMC4wNTRsMC4zODUsMC4wMjdsLTAuMDQ0LDAuMzgzbDAuNDAxLDAuMDI3bC0wLjA0NCwwLjM4M2wtMC4wNTQsMC43NjdsMC4zODUsMC4wNDNsMC43NDIsMC40MzdsMC4zODUsMC4wMjdsMS4xNywwLjA4MWwwLjM4NSwwLjA0NGwwLjA1NC0wLjc4NGwwLjc5NS0wLjMxM2wwLjAyNy0wLjM4M2wwLjM4NSwwLjAyN2wwLjM1NywwLjQxbC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzg0bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsMC4zODUsMC4wMjdsMC40MTEtMC4zNTdsMC4zODUsMC4wMjdsMC4zMDQsMS4xOTRsMC4zODQsMC4wMjdsMC4zODUsMC4wMjZsMC4zODUsMC4wMjdsMC4zODUsMC4wMjdsLTAuNTksMi42NzRsLTAuOTE5LDEuODYzbDAuODEyLTAuMzI5bDAuMzQxLDAuNDFsMC4zNTcsMC40MWwwLjcxNiwwLjgzN2wxLjAyLDEuOTk4bDAuNzE1LDAuODM3bDAuNjQ2LDEuNTg3bDAuMjc2LDEuNTc3bDEuMTU0LDAuMDgxbC0wLjAyNywwLjM4M2wtMC4yMDQsMi43MDFsLTAuNzctMC4wNTNsMC41MTEsMy41MjFsLTMuMDkzLTAuMjMxbC0xLjE4LDAuMjg3bC0xLjk0OSwwLjI1bC0wLjM4NS0wLjAyN2wwLjI4NywxLjE3N2wtMC4wMjYsMC4zODNsLTAuMDI3LDAuMzg0bDAuMzMxLDAuNzkzbDAuMzI2LDYuNjM5bC00LjcwOSw1Ljg0IE01NzUuMyw0MDEuMDI0bC0wLjM4Ni0wLjAyMWwtMS4xNTQtMC4wNjNsLTQuOTM1LTEuODQ4bC04LjMxNi0zLjIwN2wtMC4zNjMtMC40MjJsLTMuODAyLTEuMzgzbC0xLjUxOC0wLjQ4NmwtMi4yNjYtMC45MTJsLTguNjk3LTMuNjEzbC02LjAwOC0zLjA4bC0zLjc0MS0yLjE2NmwtMS40OTctMC44NTRsMS4yNC0xLjQ3MWw1LjEzNi03LjgwM2wtNy43ODEtNS44OWwtMC43MjgtMC44MjdsLTAuMzQyLTAuNzg5bC0wLjY4OC0xLjE5M2wtMC43MDUtMS4yMTFsLTEuMDQ4LTJsLTEuMDA5LTIuMzg1bDAuMDQzLTAuNzY4bC0wLjM0Mi0wLjc4OWwwLjIxLTMuNDcxbC0wLjc5MiwwLjM0MmwtMC43NDgtMC40MjhsLTAuNzI3LTAuODI2bC0wLjM4NS0wLjAyMWwtMS41NC0wLjA4NmwtMS45ODMsMC42NDRsLTAuNzkxLDAuMzQxbC0wLjc5MiwwLjM0MmwtNC4yNS0wLjI3bC0zLjMzNS0yLjUxMmwwLjAyMS0wLjM4NWwwLjA0My0wLjc2OGwtMC4zODUtMC4wMzdsMC4wMjEtMC4zODVsMC40NjYtMS4xMjlsMC4wNDMtMC43NjhsMC4wNDMtMC43NjhsLTAuMzQzLTAuNzg5bC0wLjc0OC0wLjQ0M2wtMC44MzQsMS4xMDdsLTEuNDc1LTEuMjM2bC0xLjEzNC0wLjQ2NWwtMC4zNDItMC43ODlsMS4yMzUtMS4wODdsLTIuOTI5LTIuODkybC0xLjYyLDEuMDY2bC0wLjc3LTAuMDQzbC0wLjM2My0wLjQwNmwtMC4zNDMtMC44MDVsLTEuMTExLTAuODMybC0yLjg0LDIuMTM2bDEuNDMzLDIuMDIxbC0wLjkxNSwyLjI2bC0wLjM2My0wLjQwNWwtMC4zNjMtMC40MDRsLTAuMzY0LTAuNDA2bC0xLjc5NS0yLjQyNmwtMC4zODUtMC4wMjFsLTAuMzYzLTAuNDIybC0wLjM2NC0wLjQwNmwtMS40NzUtMS4yNTNsMC40MjMtMC4zNjJsMC44MTItMC43MDhsLTAuMzYzLTAuNDIybC0wLjM2My0wLjQwNWwtMC4zNjMtMC40MDVsLTAuMzg1LTAuMDIxbC0wLjgxMywwLjcyNWwtMS4xNzEtMC4wODFsLTEuNTYxLDAuMjk5bDAuMDY0LTEuMTUybDAuMDIxLTAuMzgzbC0wLjI2MS0xLjk1N2wtMC43Ny0wLjA0M2wtMS41MzktMC4xMDNsLTAuNDAxLTAuMDIxbC0yLjg5MS0zLjI3NGwtMi42NTEtMC45MzZsLTQuMTQ0LTIuMTcxbC0wLjM4NS0wLjAzOGwtMS45MDItMC40OWwtMC43Ny0wLjA2MWwtMC4zODYtMC4wMjFsLTAuMzYzLTAuNDA1bC0wLjc5MSwwLjM0MWwtMC40MjMsMC4zNjJsLTAuMzg1LTAuMDIxbC0wLjgxMiwwLjcyNWwtMS4xOTMsMC4zMDNsLTAuMzg1LTAuMDIxbDAuNzQ4LDAuNDQzbC0wLjAyMSwwLjM4NWwtMC44NTUsMS40OTJsLTAuNDQ0LDAuNzQ2bC0xLjM0MywzLjAwNmwtMC40NDksMS4xM2wtMC40NDQsMC43NDZsLTAuODM0LDEuMTA4bC0wLjAyMSwwLjM4NGwtMC40MjMsMC4zNjJsLTAuNDA2LDAuMzYybC0wLjAyMSwwLjM4NGwtMC40ODcsMS41MTRsLTAuNDI4LDAuNzQ2bC0wLjAyMSwwLjM4NWwtMC4wMjEsMC40bDYuMTgzLDYuNTU1bDAuMzYzLDAuNDA0bDEuNDc2LDEuMjU0bDEuNDUzLDEuNjM5bDEuMDkxLDEuMjE1bDEuMDczLDEuMjMybDIuMjI0LDEuNjhsLTAuNDcxLDEuNTE1bC0wLjQ0NCwwLjc0NWwtMC44MzUsMS4xMDlsLTEuMTExLTAuODMybC0wLjc5MSwwLjM0MmwtMS4yMzYsMS4wODZsLTEuNTE4LTAuNDg2bC0yLjYzLTEuMzE3bC0xLjUxOC0wLjQ4NmwtMi4yNjItMS4yOTZsLTMuNDQyLTAuNTk0bC0wLjc3LTAuMDQzbC0wLjM2My0wLjQyMmwtMS45Mi0wLjQ5MWwtMi45ODUsNC40NTZsLTAuODEyLDAuNzI1bC0wLjQyOCwwLjc0NmwtMS43NDQsMi45ODRsLTAuMDIxLDAuMzg1bC0wLjAyMSwwLjM4M2wtMS4yNzgsMS44NTVsLTEuMjc4LDEuODU0bC0xLjcwNywyLjYwMmwtMC40NDksMS4xM2wtMC40MjMsMC4zNjJsLTAuMDIxLDAuMzg0bC0wLjgxMiwwLjcyNmwtMC40MDYsMC4zNjFsLTAuNDY2LDEuMTMxbC0xLjQ3Ni0xLjI1NGwtMi4yMjMtMS42ODFsLTEuNjQzLDEuNDQ5bC0xLjYyNSwxLjQ1bC0yLjQxMiwxLjQwNmwtMy4yMiwxLjczbC0zLjE1OSwwLjk2M2wtMC4zODYtMC4wMjFsLTEuMTExLTAuODQ4bC0zLjE2LDAuOThsLTEuNDc1LTEuMjU0bC0xLjgzOS0xLjY2bC0yLjkwNCwzLjMwNWwtMi4wNDgsMS44MTJsLTIuMDY5LDIuMTc5bC0wLjM2My0wLjQwNWwtMS41MzUtMC40N2wtMC4zNjMtMC40MjJsLTAuMzg1LTAuMDIxbC0xLjEzNC0wLjQ0OGwtMC42ODgtMS4yMTFsLTIuNDEyLDEuNDA2bC0wLjgyOSwwLjcyNWwtMi40MzMsMS43NzRsLTMuNDU5LTAuNTk0bC0wLjc0OS0wLjQyN2wtMS41MTgtMC40ODZsLTEuMTM0LTAuNDQ3bC0zLjg2NS0wLjI0OGwtMy40NDItMC41OTNsLTEuOTgzLDAuNjZsLTEuODktNy4wODdsLTAuMTUzLTMuODc2bDAuMDIxLTAuMzg0bDAuNTA5LTEuODk3bDIuMzQ4LTAuMjM4bDAuNzcsMC4wNDJsMC43NzEsMC4wNDNsMC40MDYtMC4zNjFsMi40MzMtMS43NzRsMC40NDQtMC43NDZsMS43NS0zLjM4NmwxLjc4Ny0zLjc1MmwtMC43Ny0wLjA0M2wtMS40OTctMC44NjlsLTEuOTE5LTAuNTA4bC0zLjAzNi0wLjk1NWwyLjExMi0yLjk2NGwtMC43NDgtMC40MjdsLTAuMzYzLTAuNDA1bC0xLjc3OS0yLjQyN2wwLjgzNC0xLjEwOGwwLjQ4Ny0xLjUzbDAuODM0LTEuMTA4bDAuODk1LTEuODc2bDEuMy0yLjIzOGwxLjMyMS0yLjYyM2wtMS4xMTEtMC44MzJsLTQuMDg0LTIuOTU1bC0wLjcxLTAuODI2bC0xLjE0OS0wLjQ0OWwtMS4xMzQtMC40NjVsLTAuNzQ4LTAuNDI2bC0zLjA1OC0wLjU3MmwtMS4xMzMtMC40NjVsLTAuNzctMC4wNDNsLTAuNzQ5LTAuNDI2bC0xLjE0OS0wLjQ2NWwtMS41MTktMC40N2wtMS4yMTksMS4wN2wtMS4yMzUsMS4wODdsLTEuNjYzLDEuODM0bC0yLjI4OC0wLjUyOWwwLjMwNCwxLjE4OWwtMC40NzEsMS41MTRsLTAuNDA2LDAuMzYybC0xLjI3OCwxLjg1NGwtMC43NzEtMC4wNDNsLTEuMTkyLDAuMzAzbC0wLjM4NS0wLjAyMWwtMS4yMzUsMS4wODhsLTEuNTgzLDAuNjgybC0yLjI4Ny0wLjUyOWwtMS40NzYtMS4yNTRsLTEuMTkyLDAuMzJsLTAuMzA0LTEuMTg5bC0wLjM2My0wLjQwNmwtMC4zODYtMC4wMjFsLTAuNzg2LTAuMDQzbC0wLjc3LTAuMDQybC0wLjQwNiwwLjM0NmwtMC40NDksMS4xNDZsLTAuNDAxLTAuMDM4bC0xLjE3NywwLjMxOWwtMC4zODUtMC4wMjFsLTAuMzYzLTAuNDA2bC0wLjM2My0wLjQwNGwtMC43MjctMC44MjhsLTAuNzI4LTAuODExbC0xLjUzOS0wLjEwMmwtMC40MDYsMC4zNjJsLTAuMzYzLTAuNDA1bC0yLjI4OC0wLjUyOWwtMC43ODYtMC4wNDNsLTEuMTc3LDAuMzJsLTEuODU5LTEuMjc1bC0wLjM4NS0wLjAyMWwtMS44MTctMi4wNDNsLTEuOTAyLTAuNTA4bC0xLjg4Mi0wLjg5MWwtMC4zODUtMC4wMjFsLTEuODgyLTAuODkybC0xLjUzNC0wLjQ4NmwtMi4yNDUtMS4yOTdsMC40NDQtMC43NDVsLTAuMzYzLTAuNDA2bC0yLjk3Mi0yLjEwNmwtMS44Ni0xLjI3NWwtNS4xOTQtMy44MDRsLTIuMjQ1LTEuMjk3bC0wLjcyNy0wLjgxMWwtMi4yMjQtMS42OGwtNi4wNDYtMi42OTZsLTAuODEyLDAuNzI1bC0xLjE3NiwwLjMybC0xLjIzNiwxLjA4N2wtMy4yNjIsMi40OTlsLTEuNjI2LDEuNDQ5bC0wLjgwOCwwLjM0MWwtMS4yMTksMS4wODdsLTEuMTMzLTAuNDY1bC0yLjkyMSwzLjMwNWwwLjM2MywwLjQwNWwtMy4yMDMsMS43NDdsMS4xMTIsMC44MzJsLTEuMjc5LDEuODU1bC0wLjQyMywwLjM2MWwtMS42MDQsMS4wNjZsLTAuNzQ4LTAuNDI3bC00Ljk2OSw1LjA5OWwtMS4zMjIsMi42MjNsLTAuODUxLDEuMTA4bC0wLjQ0OSwxLjEzbC0wLjQ0NCwwLjc0NmwtMC44MzQsMS4xMDlsLTAuODUxLDEuMTA3bC0wLjQyOCwwLjc0NmwtMC44NzMsMS41MWwtNi40MDUsMy40NjFsLTEuMTkzLDAuMzJsLTEuOTY3LDAuNjZsLTAuNDA2LDAuMzQ2bC0xLjk2MywwLjI3N2wtMi4zMywwLjIzOGwtMC40MDItMC4wMjEgTTU1Mi41OTUsMTc4LjI1NWwtMC4xMjktMS41NjJsMC4wNDgsMi43MTJsLTAuNDU0LDAuNzRsLTAuNDM4LDAuNzRsLTAuNDExLDAuMzU2bC0wLjQ4MSwxLjEyNGwtMC4xMDcsMS41MzRsLTAuMDcxLDAuNzgzbC0wLjEzNCwxLjkxN2wtMC4wNywwLjc2N2wtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzgzbC0wLjQzOCwwLjc0bC0xLjc0MywyLjU3N2wtMC4wNywwLjc4M2wtMC40MzgsMC43NGwtMC41MDgsMS41MDdsLTAuMDU0LDAuNzY3bC0wLjg1LDEuMDk3bC0wLjA0NCwwLjM4M2wtMC4zODUtMC4wMjdsLTAuNDY1LDEuMTI0bC0wLjA1MywwLjc2N2wtMC4wMjcsMC4zODNsMC4zODUsMC4wMjdsMC42NzIsMS4yMmwtMC40MzgsMC43NGwtMC4wOCwxLjE1bDAuMzg1LDAuMDI3bC0wLjg0LDAuNzEzbDQuNTUsMS41MDVsLTAuMDI2LDAuMzg0bDAuNjcyLDEuMjJsMS4wMiwxLjk5OGwxLjI3Ny0xLjQ1M2wwLjg1LTEuMDk3bDIuODM1LDMuNjk5bDEuMDcyLDEuMjQ4bDMuMjAyLDMuNzI2bC0yLjkyMiwyLjg2M2wtMi41MjgsMi41MjNsLTIuOTIzLDIuODhsLTAuMDI3LDAuMzg0bC0xLjYzNSwxLjA0MmwtMC40MTIsMC4zNTdsLTMuMjcsMi4wNjlsLTEuNDU4LTEuMjc0bC0wLjc0Mi0wLjQzN2wtMS44MTQtMS42ODVsLTQuMDY5LTIuNjI5bC0yLjg5OC0yLjUzMmwtMC4wNywwLjc2N2wtMC45MiwxLjg2M2wtMC40MzgsMC43NGwtMC40NjUsMS4xMjRsLTAuMDI2LDAuMzg0bC0wLjA0NCwwLjM4M2wtMC4xMzQsMS45MzRsLTAuNDExLDAuMzU3bC0wLjA0NCwwLjM4M2wtMC40MTEsMC4zNTdsLTAuMDI3LDAuMzgzbC0wLjM4NC0wLjAyNmwtMy4xNzQsMC45MTlsLTAuMzg0LTAuMDI3bC0wLjAyNywwLjM4M2wtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzg0bC0wLjA0NCwwLjM4M2wwLjMzMSwwLjc5NGwtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjAyNiwwLjM4M2wtMC4wNzEsMC43ODNsLTAuNDExLDAuMzU3bC0wLjAyNiwwLjM4M2wtMC40MTEsMC4zNTdsLTAuNDEyLDAuMzU2bC0yLjA3MiwxLjc2N2wtMC40MjksMC4zNTZsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuNDgyLDEuMTIzbC0wLjAyNiwwLjM4NGwtMC40NjUsMS4xMjRsLTAuNzQyLTAuNDM3bC0zLjc4Mi0xLjQzNmwtMi41OTIsMy42NzRsLTMuMDksNC43OTZsLTIuNTM4LDIuOTA3bC0wLjk3NCwyLjYzbC0xLjcxNiwyLjE5M2wtMC41MDksMS41MDdsLTAuNDExLDAuMzU2bC0xLjMzMSwyLjIybDEuNDU4LDEuMjc0bC0wLjQzOCwwLjc0bDAuNjcyLDEuMjAzbC0wLjAyNiwwLjM4NGwtMC40MzgsMC43NTdsLTAuMDI3LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC40ODEsMS4xMjNsMC43NjksMC4wNTRsMS4xMDEsMC44NDdsMS41MTEsMC41MDdsLTEuOTAxLDkuOTIybC0wLjA5NywxLjE1bC0wLjA1NCwwLjc2N2wwLjMzMSwwLjc5M2wtMS4zMzEsMi4yMzdsLTEuNTY1LDAuMjZsLTEuMTk3LDAuMzAzbC0yLjgxNCwxLjMyOWwtMC4xMDgsMS41NTFsLTAuMDcsMC43NjdsLTAuMDI2LDAuMzgzbDAuMzU3LDAuNDFsMC4zNTgsMC40MTFsMS4xMjYsMC40OGwwLjM4NSwwLjAyN2wwLjc3LDAuMDUzbDAuMzU3LDAuNDFsMC43NDIsMC40NTRsMC43MTUsMC44MmwtMC4wMjYsMC4zODNsMC43MTYsMC44MjFsMC4zNTcsMC40MjdsLTAuMDI3LDAuMzg0bC0wLjAyNiwwLjM4M2wtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzgzbC0wLjgxMywwLjMzbC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODRsLTAuMzg0LTAuMDQzbC0wLjQxMSwwLjM1NmwtMC40MTEsMC4zNTdsLTAuMDQ0LDAuMzgzbC0wLjM4NS0wLjAyNmwtMC4wMjYsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODRsLTAuMDI2LDAuMzgzbDAuMzg1LDAuMDI3bC0wLjAyNywwLjRsMC4zNTcsMC40MWwwLjI4OCwxLjE3N2wtMC4wMjcsMC4zODNsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODRsLTAuNDAxLTAuMDI3bC0wLjQzOCwwLjc0bC0wLjc5NiwwLjMzbC0wLjQxMSwwLjM1N2wtMC40NTUsMC43NGwtMC4wMjYsMC4zODNsLTAuNDM4LDAuNzRsLTAuNDExLDAuMzU3bC0wLjgxMiwwLjMzbC0wLjQxMSwwLjM1NmwwLjY4OCwxLjIwNGwwLjc0MiwwLjQ1NGwtMC4wMjcsMC4zODNsMS40MzIsMS42NDFsMS42MSw0LjM4NWwwLjMxNCwwLjc5M2wxLjk0MSw1LjE3OWwtMC44NSwxLjA5N2wyLjEyOSwyLjQ3OGwtMC40MTEsMC4zNTZsLTQuNjMxLTAuMzM4bC0xLjYzNSwxLjAyNmwtMC40MTEsMC4zNTZsLTEuMjM0LDEuMDdsLTAuODM5LDAuNzEzbC0xLjIzNCwxLjA3bC0wLjQyOCwwLjM1NmwtMC40MzgsMC43NGwtMC43OTYsMC4zM2wtMS40ODQtMC44OTFsLTAuNzQyLTAuNDM4bC0xLjQ4NC0wLjg5MWwtMC43MTYtMC44MmwtMC43NjktMC4wN2wtMC41MDksMS41MjNsLTIuODEyLDYuMzU2bC0xLjEzMSwyLjc4NyBNMjM0LjU5MiwyMzkuNTRsLTAuMDU4LDAuNzdsLTAuMTE2LDEuNTM5bC0xLjIxNiwwLjY4M2wtMS4yMTUsMC42ODNsLTEuNjAyLDAuNjUzbC0xLjIxNSwwLjY4M2wtMS42MzEsMS4wMzlsLTIuMDE2LDEuMDA5bC0wLjgzLDAuNzEybC0yLjAxNiwxLjAwOWwtMC40MTUsMC4zNTZsLTEuMjE1LDAuNjgzbC0wLjQxNSwwLjM1NWwtMC40MTUsMC4zNTZsLTAuNDE1LDAuMzU2bC0xLjE4NiwwLjI5OGwtMS4yMTYsMC42ODNsLTAuODAxLDAuMzI3bC0wLjQxNCwwLjM1NmwwLjMyNywwLjc5OGwwLjM1NywwLjQxNGwwLjI5OSwxLjE4NGwwLjM1NiwwLjQxNGwwLjM1NiwwLjQxNGwwLjc0MywwLjQ0M2wwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsLTAuMDg3LDEuMTU0bDAuMzI3LDAuNzk4bC0wLjAyOCwwLjM4NWwxLjA3LDEuMjQxbDAuMzU2LDAuNDE0bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsMC4yOTksMS4xODRsMC4zODYsMC4wMjlsMC4zNTcsMC40MTRsMC4zNTYsMC40MTRsMC4zODYsMC4wMjlsLTAuMDU4LDAuNzdsLTAuMDU4LDAuNzdsMC4zODYsMC4wMjlsLTAuMDI5LDAuMzg1bDAuMzU3LDAuNDE0bDAuMzI3LDAuNzk4bDAuMzI4LDAuNzk5bDAuMzU2LDAuNDE0bDAuMzU3LDAuNDE0bDAuMzU2LDAuNDE0bC0wLjAyOCwwLjM4NWwwLjMyNywwLjc5OGwtMC40NzMsMS4xMjVsMC4yNzEsMS41NjhsLTAuMDI5LDAuMzg1bDAuMzU2LDAuNDE0bDAuMzU3LDAuNDE0bDAuMzg2LDAuMDI5bDAuNzE0LDAuODI3bDAuMzU2LDAuNDE0bC0wLjA1OSwwLjc3bDAuMzg3LDAuMDI5bDAuMjk5LDEuMTgzbC0wLjAyOSwwLjM4NWwtMC4wMjgsMC4zODVsMC43MTMsMC44MjhsMC4zNTcsMC40MTRsLTAuMDI5LDAuMzg1bDAuMzI4LDAuNzk4bC0wLjAyOSwwLjM4NWwtMC4wODcsMS4xNTRsLTAuMDI4LDAuMzg1bC0wLjA1OCwwLjc3bC0wLjA1OSwwLjc3bC0wLjQ0MywwLjc0MWwtMC40MTUsMC4zNTVsLTAuMDU5LDAuNzdsLTAuMDI4LDAuMzg1bC0wLjAyOSwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bC0wLjAyOSwwLjM4NWwtMC4wMjgsMC4zODVsLTAuNDE1LDAuMzU2bC0wLjAyOSwwLjM4NWwwLjI5OSwxLjE4M2wtMC4wNTgsMC43N2wwLjgyOS0wLjcxMWwxLjE4Ny0wLjI5OGwwLjgwMS0wLjMyN2wwLjgwMS0wLjMyN2wwLjQxNS0wLjM1NmwwLjgtMC4zMjdsMC4zODYsMC4wMjlsMC43NDMsMC40NDNsMS40NTYsMS4yN2wwLjM4NiwwLjAyOWwxLjEsMC44NTZsMC43NDMsMC40NDNsMC40NzMtMS4xMjVsMi4zMDYtNC44NTdsLTAuMzI4LTAuNzk4bDAuNzcxLDAuMDU4bDEuMjE2LTAuNjgzbDEuNTcyLTAuMjY5bDguNDIxLTMuNjI0bDEuNTcxLTAuMjY5bDAuODAxLTAuMzI3bDQuNDE4LTEuOTlsMS4xNTcsMC4wODdsMS41NDQsMC4xMTZsMy41MDEtMC4xMjRsMy4xMTUtMC4xNTNsMy44ODctMC4wOTVsMy44ODgtMC4wOTVsMi43MjktMC4xODJsMS41NDMsMC4xMTZsMC43MDUtNC4yMDNsMC40NDMtMC43NDFsMC4wMjktMC4zODVsMC44MDEtMC4zMjdsMS4xODctMC4yOThsMS4xODYtMC4yOThsMS45ODctMC42MjVsMi4zNzMtMC41OTZsMC4zODYsMC4wMjlsMC40MTUtMC4zNTVsMS41NzItMC4yNjlsMi4wMTYtMS4wMDlsMS42MDQtMC43NTNsMi45MTIsMi41NDFcXFwiLz5cXG5cXG5cdDxnIGlkPVxcXCJmb290c3RlcHNcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZHViLW1hdGVvXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwibWF0ZW8tYmVsdWdhXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYmVsdWdhLWlzYW11XFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiaXNhbXUtY2FwYXNcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJjYXBhcy1wZWxvdGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwicGVsb3Rhcy1tYXJ0YVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hcnRhLWtvYmFyYWhcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJrb2JhcmFoLWR1YlxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1wYXJhZGlzZVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInJldHVybi10by1iZWdpblxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG5cdDxnIGlkPVxcXCJtYXAtZG90c1xcXCIgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoNzguMDAwMDAwLCAxNDAuMDAwMDAwKVxcXCI+XFxuXHRcdDxnIGlkPVxcXCJkZWlhXFxcIj5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0xMzIuNSwyNmMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMxMzAuNTY3LDI2LDEzMi41LDI2elxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJtYXRlb1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMTQ5LjUsOGMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41UzE1MS40MzMsMSwxNDkuNSwxYy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzE0Ny41NjcsOCwxNDkuNSw4elxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJlcy10cmVuY1xcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImlzYW11XFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMzI4LjUsMzIwYzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzMyNi41NjcsMzIwLDMyOC41LDMyMHpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiYmVsdWdhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMzQ2LjUsMzQ3YzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzM0NC41NjcsMzQ3LDM0Ni41LDM0N3pcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYXJlbGx1ZlxcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImNhcGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk00My41LDIzM2MxLjkzMywwLDMuNS0xLjU2NiwzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjYtMy41LDMuNVM0MS41NjcsMjMzLDQzLjUsMjMzelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJwZWxvdGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk01MC41LDIxMmMxLjkzMywwLDMuNS0xLjU2NiwzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjYtMy41LDMuNVM0OC41NjcsMjEyLDUwLjUsMjEyelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJtYXJ0YVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNTcuNSwxODZjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNWMwLTEuOTMzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41QzU0LDE4NC40MzQsNTUuNTY3LDE4Niw1Ny41LDE4NnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwia29iYXJhaFxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMjkuNSwxOTVjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTMjcuNTY3LDE5NSwyOS41LDE5NXpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0yOS41LDE3MmMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMyNy41NjcsMTcyLDI5LjUsMTcyelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJwYXJhZGlzZVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNC41LDE4M2MxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41UzYuNDMzLDE3Niw0LjUsMTc2Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzIuNTY3LDE4Myw0LjUsMTgzelxcXCIvPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuPC9zdmc+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGlkPSdwYWdlcy1jb250YWluZXInPlxcblx0PGRpdiBpZD0ncGFnZS1hJz48L2Rpdj5cXG5cdDxkaXYgaWQ9J3BhZ2UtYic+PC9kaXY+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+XFxuXHRcXG48L2Rpdj5cdFwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJpbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbiAgICBcdFxuY2xhc3MgR2xvYmFsRXZlbnRzIHtcblx0aW5pdCgpIHtcblx0XHRkb20uZXZlbnQub24od2luZG93LCAncmVzaXplJywgdGhpcy5yZXNpemUpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdEFwcEFjdGlvbnMud2luZG93UmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2xvYmFsRXZlbnRzXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmNsYXNzIFByZWxvYWRlciAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSlcblx0XHR0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgdGhpcy5vbk1hbmlmZXN0TG9hZENvbXBsZXRlZCwgdGhpcylcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjayA9IHVuZGVmaW5lZFxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzID0gW11cblx0fVxuXHRsb2FkKG1hbmlmZXN0LCBvbkxvYWRlZCkge1xuXG5cdFx0aWYodGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbSA9IHRoaXMuYWxsTWFuaWZlc3RzW2ldXG5cdFx0XHRcdGlmKG0ubGVuZ3RoID09IG1hbmlmZXN0Lmxlbmd0aCAmJiBtWzBdLmlkID09IG1hbmlmZXN0WzBdLmlkICYmIG1bbS5sZW5ndGgtMV0uaWQgPT0gbWFuaWZlc3RbbWFuaWZlc3QubGVuZ3RoLTFdLmlkKSB7XG5cdFx0XHRcdFx0b25Mb2FkZWQoKVx0XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMucHVzaChtYW5pZmVzdClcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjayA9IG9uTG9hZGVkXG4gICAgICAgIHRoaXMucXVldWUubG9hZE1hbmlmZXN0KG1hbmlmZXN0KVxuXHR9XG5cdG9uTWFuaWZlc3RMb2FkQ29tcGxldGVkKCkge1xuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrKClcblx0fVxuXHRnZXRDb250ZW50QnlJZChpZCkge1xuXHRcdHJldHVybiB0aGlzLnF1ZXVlLmdldFJlc3VsdChpZClcblx0fVxuXHRnZXRJbWFnZVVSTChpZCkge1xuXHRcdHJldHVybiB0aGlzLmdldENvbnRlbnRCeUlkKGlkKS5nZXRBdHRyaWJ1dGUoXCJzcmNcIilcblx0fVxuXHRnZXRJbWFnZVNpemUoaWQpIHtcblx0XHR2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpXG5cdFx0cmV0dXJuIHsgd2lkdGg6IGNvbnRlbnQud2lkdGgsIGhlaWdodDogY29udGVudC5oZWlnaHQgfVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByZWxvYWRlclxuIiwiaW1wb3J0IGhhc2hlciBmcm9tICdoYXNoZXInXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGNyb3Nzcm9hZHMgZnJvbSAnY3Jvc3Nyb2FkcydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkYXRhIGZyb20gJ0dsb2JhbERhdGEnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuY2xhc3MgUm91dGVyIHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLnJvdXRpbmcgPSBkYXRhLnJvdXRpbmdcblx0XHR0aGlzLnNldHVwUm91dGVzKClcblx0XHR0aGlzLmZpcnN0UGFzcyA9IHRydWVcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gZmFsc2Vcblx0XHRoYXNoZXIubmV3SGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5vbGRIYXNoID0gdW5kZWZpbmVkXG5cdFx0aGFzaGVyLmluaXRpYWxpemVkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdGhhc2hlci5jaGFuZ2VkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdHRoaXMuc2V0dXBDcm9zc3JvYWRzKClcblx0fVxuXHRiZWdpblJvdXRpbmcoKSB7XG5cdFx0aGFzaGVyLmluaXQoKVxuXHR9XG5cdHNldHVwQ3Jvc3Nyb2FkcygpIHtcblx0IFx0dmFyIHJvdXRlcyA9IGhhc2hlci5yb3V0ZXNcblx0IFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0IFx0XHR2YXIgcm91dGUgPSByb3V0ZXNbaV1cblx0IFx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKHJvdXRlLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0IFx0fTtcblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCcnLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0fVxuXHRvblBhcnNlVXJsKCkge1xuXHRcdHRoaXMuYXNzaWduUm91dGUoKVxuXHR9XG5cdG9uRGVmYXVsdFVSTEhhbmRsZXIoKSB7XG5cdFx0dGhpcy5zZW5kVG9EZWZhdWx0KClcblx0fVxuXHRhc3NpZ25Sb3V0ZShpZCkge1xuXHRcdHZhciBoYXNoID0gaGFzaGVyLmdldEhhc2goKVxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuZ2V0VVJMUGFydHMoaGFzaClcblx0XHR0aGlzLnVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFydHNbMF0sIChwYXJ0c1sxXSA9PSB1bmRlZmluZWQpID8gJycgOiBwYXJ0c1sxXSlcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gdHJ1ZVxuXHR9XG5cdGdldFVSTFBhcnRzKHVybCkge1xuXHRcdHZhciBoYXNoID0gdXJsXG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJy8nKVxuXHR9XG5cdHVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFyZW50LCB0YXJnZXQpIHtcblx0XHRoYXNoZXIub2xkSGFzaCA9IGhhc2hlci5uZXdIYXNoXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB7XG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0cGFydHM6IHBhcnRzLFxuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHR0YXJnZXQ6IHRhcmdldFxuXHRcdH1cblx0XHRoYXNoZXIubmV3SGFzaC50eXBlID0gaGFzaGVyLm5ld0hhc2guaGFzaCA9PSAnJyA/IEFwcENvbnN0YW50cy5IT01FIDogQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG5cdFx0Ly8gSWYgZmlyc3QgcGFzcyBzZW5kIHRoZSBhY3Rpb24gZnJvbSBBcHAuanMgd2hlbiBhbGwgYXNzZXRzIGFyZSByZWFkeVxuXHRcdGlmKHRoaXMuZmlyc3RQYXNzKSB7XG5cdFx0XHR0aGlzLmZpcnN0UGFzcyA9IGZhbHNlXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBBY3Rpb25zLnBhZ2VIYXNoZXJDaGFuZ2VkKClcblx0XHR9XG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKG5ld0hhc2gsIG9sZEhhc2gpIHtcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gZmFsc2Vcblx0XHRjcm9zc3JvYWRzLnBhcnNlKG5ld0hhc2gpXG5cdFx0aWYodGhpcy5uZXdIYXNoRm91bmRlZCkgcmV0dXJuXG5cdFx0Ly8gSWYgVVJMIGRvbid0IG1hdGNoIGEgcGF0dGVybiwgc2VuZCB0byBkZWZhdWx0XG5cdFx0dGhpcy5vbkRlZmF1bHRVUkxIYW5kbGVyKClcblx0fVxuXHRzZW5kVG9EZWZhdWx0KCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKEFwcFN0b3JlLmRlZmF1bHRSb3V0ZSgpKVxuXHR9XG5cdHNldHVwUm91dGVzKCkge1xuXHRcdGhhc2hlci5yb3V0ZXMgPSBbXVxuXHRcdGhhc2hlci5kaXB0eXF1ZVJvdXRlcyA9IFtdXG5cdFx0dmFyIGkgPSAwLCBrO1xuXHRcdGZvcihrIGluIHRoaXMucm91dGluZykge1xuXHRcdFx0aGFzaGVyLnJvdXRlc1tpXSA9IGtcblx0XHRcdGlmKGsubGVuZ3RoID4gMikgaGFzaGVyLmRpcHR5cXVlUm91dGVzLnB1c2goaylcblx0XHRcdGkrK1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgZ2V0QmFzZVVSTCgpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuVVJMLnNwbGl0KFwiI1wiKVswXVxuXHR9XG5cdHN0YXRpYyBnZXRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpXG5cdH1cblx0c3RhdGljIGdldFJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLnJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXREaXB0eXF1ZVJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmRpcHR5cXVlUm91dGVzXG5cdH1cblx0c3RhdGljIGdldE5ld0hhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5uZXdIYXNoXG5cdH1cblx0c3RhdGljIGdldE9sZEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5vbGRIYXNoXG5cdH1cblx0c3RhdGljIHNldEhhc2goaGFzaCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKGhhc2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyXG4iLCJpbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmZ1bmN0aW9uIF9nZXRDb250ZW50U2NvcGUoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgcmV0dXJuIEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZChoYXNoT2JqLmhhc2gpXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpIHtcbiAgICB2YXIgc2NvcGUgPSBfZ2V0Q29udGVudFNjb3BlKClcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgdHlwZSA9IF9nZXRUeXBlT2ZQYWdlKClcbiAgICB2YXIgbWFuaWZlc3Q7XG5cbiAgICBpZih0eXBlICE9IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgIHZhciBmaWxlbmFtZXMgPSBbXG4gICAgICAgICAgICAnY2hhcmFjdGVyLnBuZycsXG4gICAgICAgICAgICAnY2hhcmFjdGVyLWJnLmpwZycsXG4gICAgICAgICAgICAnc2hvZS1iZy5qcGcnXG4gICAgICAgIF1cbiAgICAgICAgbWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGZpbGVuYW1lcywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKVxuICAgIH1cblxuICAgIC8vIEluIGNhc2Ugb2YgZXh0cmEgYXNzZXRzXG4gICAgaWYoc2NvcGUuYXNzZXRzICE9IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgYXNzZXRzID0gc2NvcGUuYXNzZXRzXG4gICAgICAgIHZhciBhc3NldHNNYW5pZmVzdDtcbiAgICAgICAgaWYodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgJ2hvbWUnLCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBhc3NldHNNYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoYXNzZXRzLCBoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQsIHR5cGUpICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIG1hbmlmZXN0ID0gKG1hbmlmZXN0ID09IHVuZGVmaW5lZCkgPyBhc3NldHNNYW5pZmVzdCA6IG1hbmlmZXN0LmNvbmNhdChhc3NldHNNYW5pZmVzdClcbiAgICB9XG5cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9hZGRCYXNlUGF0aHNUb1VybHModXJscywgcGFnZUlkLCB0YXJnZXRJZCwgdHlwZSkge1xuICAgIHZhciBiYXNlUGF0aCA9ICh0eXBlID09IEFwcENvbnN0YW50cy5IT01FKSA/IF9nZXRIb21lUGFnZUFzc2V0c0Jhc2VQYXRoKCkgOiBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChwYWdlSWQsIHRhcmdldElkKVxuICAgIHZhciBtYW5pZmVzdCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzcGxpdHRlciA9IHVybHNbaV0uc3BsaXQoJy4nKVxuICAgICAgICB2YXIgZmlsZU5hbWUgPSBzcGxpdHRlclswXVxuICAgICAgICB2YXIgZXh0ZW5zaW9uID0gc3BsaXR0ZXJbMV1cbiAgICAgICAgdmFyIGlkID0gcGFnZUlkICsgJy0nXG4gICAgICAgIGlmKHRhcmdldElkKSBpZCArPSB0YXJnZXRJZCArICctJ1xuICAgICAgICBpZCArPSBmaWxlTmFtZVxuICAgICAgICBtYW5pZmVzdFtpXSA9IHtcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgIHNyYzogYmFzZVBhdGggKyBmaWxlTmFtZSArIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSArICcuJyArIGV4dGVuc2lvblxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYW5pZmVzdFxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaWQsIGFzc2V0R3JvdXBJZCkge1xuICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZGlwdHlxdWUvJyArIGlkICsgJy8nICsgYXNzZXRHcm91cElkICsgJy8nXG59XG5mdW5jdGlvbiBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2hvbWUvJ1xufVxuZnVuY3Rpb24gX2dldEltYWdlRXh0ZW5zaW9uQnlEZXZpY2VSYXRpbygpIHtcbiAgICAvLyByZXR1cm4gJ0AnICsgX2dldERldmljZVJhdGlvKCkgKyAneCdcbiAgICByZXR1cm4gJydcbn1cbmZ1bmN0aW9uIF9nZXREZXZpY2VSYXRpbygpIHtcbiAgICB2YXIgc2NhbGUgPSAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPT0gdW5kZWZpbmVkKSA/IDEgOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgIHJldHVybiAoc2NhbGUgPiAxKSA/IDIgOiAxXG59XG5mdW5jdGlvbiBfZ2V0VHlwZU9mUGFnZShoYXNoKSB7XG4gICAgdmFyIGggPSBoYXNoIHx8IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICBpZihoLnBhcnRzLmxlbmd0aCA9PSAyKSByZXR1cm4gQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG4gICAgZWxzZSByZXR1cm4gQXBwQ29uc3RhbnRzLkhPTUVcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQ29udGVudCgpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgaGFzaCA9IGhhc2hPYmouaGFzaC5sZW5ndGggPCAxID8gJy8nIDogaGFzaE9iai5oYXNoXG4gICAgdmFyIGNvbnRlbnQgPSBkYXRhLnJvdXRpbmdbaGFzaF1cbiAgICByZXR1cm4gY29udGVudFxufVxuZnVuY3Rpb24gX2dldENvbnRlbnRCeUxhbmcobGFuZykge1xuICAgIHJldHVybiBkYXRhLmNvbnRlbnQubGFuZ1tsYW5nXVxufVxuZnVuY3Rpb24gX2dldEdsb2JhbENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIF9nZXRDb250ZW50QnlMYW5nKEFwcFN0b3JlLmxhbmcoKSlcbn1cbmZ1bmN0aW9uIF9nZXRBcHBEYXRhKCkge1xuICAgIHJldHVybiBkYXRhXG59XG5mdW5jdGlvbiBfZ2V0RGVmYXVsdFJvdXRlKCkge1xuICAgIHJldHVybiBkYXRhWydkZWZhdWx0LXJvdXRlJ11cbn1cbmZ1bmN0aW9uIF93aW5kb3dXaWR0aEhlaWdodCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB3OiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgaDogd2luZG93LmlubmVySGVpZ2h0XG4gICAgfVxufVxuZnVuY3Rpb24gX2dldERpcHR5cXVlU2hvZXMoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGJhc2V1cmwgPSBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQpXG4gICAgcmV0dXJuIF9nZXRDb250ZW50U2NvcGUoKS5zaG9lc1xufVxuXG52YXIgQXBwU3RvcmUgPSBhc3NpZ24oe30sIEV2ZW50RW1pdHRlcjIucHJvdG90eXBlLCB7XG4gICAgZW1pdENoYW5nZTogZnVuY3Rpb24odHlwZSwgaXRlbSkge1xuICAgICAgICB0aGlzLmVtaXQodHlwZSwgaXRlbSlcbiAgICB9LFxuICAgIHBhZ2VDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQ29udGVudCgpXG4gICAgfSxcbiAgICBhcHBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRBcHBEYXRhKClcbiAgICB9LFxuICAgIGRlZmF1bHRSb3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0RGVmYXVsdFJvdXRlKClcbiAgICB9LFxuICAgIGdsb2JhbENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldEdsb2JhbENvbnRlbnQoKVxuICAgIH0sXG4gICAgcGFnZUFzc2V0c1RvTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpXG4gICAgfSxcbiAgICBnZXRSb3V0ZVBhdGhTY29wZUJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGlkID0gaWQubGVuZ3RoIDwgMSA/ICcvJyA6IGlkXG4gICAgICAgIHJldHVybiBkYXRhLnJvdXRpbmdbaWRdXG4gICAgfSxcbiAgICBiYXNlTWVkaWFQYXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmdldEVudmlyb25tZW50KCkuc3RhdGljXG4gICAgfSxcbiAgICBnZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkOiBmdW5jdGlvbihwYXJlbnQsIHRhcmdldCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFyZW50LCB0YXJnZXQpXG4gICAgfSxcbiAgICBnZXRFbnZpcm9ubWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBDb25zdGFudHMuRU5WSVJPTk1FTlRTW0VOVl1cbiAgICB9LFxuICAgIGdldFR5cGVPZlBhZ2U6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRUeXBlT2ZQYWdlKGhhc2gpXG4gICAgfSxcbiAgICBnZXRIb21lVmlkZW9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbJ2hvbWUtdmlkZW9zJ11cbiAgICB9LFxuICAgIGdlbmVyYWxJbmZvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmNvbnRlbnRcbiAgICB9LFxuICAgIGRpcHR5cXVlU2hvZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERpcHR5cXVlU2hvZXMoKVxuICAgIH0sXG4gICAgZ2V0TmV4dERpcHR5cXVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKGkrMSkgPiByb3V0ZXMubGVuZ3RoLTEgPyAwIDogKGkrMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGVzW2luZGV4XVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UHJldmlvdXNEaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpLTEpIDwgMCA/IHJvdXRlcy5sZW5ndGgtMSA6IChpLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldERpcHR5cXVlUGFnZUluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpZXdVcmxCeUhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9kaXB0eXF1ZS8nICsgaGFzaCArICcvcHJldmlldy5naWYnXG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBDYW52YXM6IHVuZGVmaW5lZCxcbiAgICBPcmllbnRhdGlvbjogQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSxcbiAgICBEZXRlY3Rvcjoge1xuICAgICAgICBpc01vYmlsZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvblxuICAgICAgICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkU6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LncgPSBhY3Rpb24uaXRlbS53aW5kb3dXXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LmggPSBhY3Rpb24uaXRlbS53aW5kb3dIXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuT3JpZW50YXRpb24gPSAoQXBwU3RvcmUuV2luZG93LncgPiBBcHBTdG9yZS5XaW5kb3cuaCkgPyBBcHBDb25zdGFudHMuTEFORFNDQVBFIDogQXBwQ29uc3RhbnRzLlBPUlRSQUlUXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlLCBhY3Rpb24uaXRlbSkgXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5cbmV4cG9ydCBkZWZhdWx0IEFwcFN0b3JlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG52YXIgUHhIZWxwZXIgPSB7XG5cbiAgICBnZXRQWFZpZGVvOiBmdW5jdGlvbih1cmwsIHdpZHRoLCBoZWlnaHQsIHZhcnMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbVZpZGVvKHVybClcbiAgICAgICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2Uuc2V0QXR0cmlidXRlKFwibG9vcFwiLCB0cnVlKVxuICAgICAgICB2YXIgdmlkZW9TcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSlcbiAgICAgICAgdmlkZW9TcHJpdGUud2lkdGggPSB3aWR0aFxuICAgICAgICB2aWRlb1Nwcml0ZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgcmV0dXJuIHZpZGVvU3ByaXRlXG4gICAgfSxcblxuICAgIHJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRGcmFtZUltYWdlc0FycmF5OiBmdW5jdGlvbihmcmFtZXMsIGJhc2V1cmwsIGV4dCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVybCA9IGJhc2V1cmwgKyBpICsgJy4nICsgZXh0XG4gICAgICAgICAgICBhcnJheVtpXSA9IHVybFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHhIZWxwZXIiLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIFV0aWxzIHtcblx0c3RhdGljIE5vcm1hbGl6ZU1vdXNlQ29vcmRzKGUsIG9ialdyYXBwZXIpIHtcblx0XHR2YXIgcG9zeCA9IDA7XG5cdFx0dmFyIHBvc3kgPSAwO1xuXHRcdGlmICghZSkgdmFyIGUgPSB3aW5kb3cuZXZlbnQ7XG5cdFx0aWYgKGUucGFnZVggfHwgZS5wYWdlWSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5wYWdlWDtcblx0XHRcdHBvc3kgPSBlLnBhZ2VZO1xuXHRcdH1cblx0XHRlbHNlIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRZKSBcdHtcblx0XHRcdHBvc3ggPSBlLmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcblx0XHRcdHBvc3kgPSBlLmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuXHRcdFx0XHQrIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cdFx0fVxuXHRcdG9ialdyYXBwZXIueCA9IHBvc3hcblx0XHRvYmpXcmFwcGVyLnkgPSBwb3N5XG5cdFx0cmV0dXJuIG9ialdyYXBwZXJcblx0fVxuXHRzdGF0aWMgUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBjb250ZW50VywgY29udGVudEgsIG9yaWVudGF0aW9uKSB7XG5cdFx0dmFyIGFzcGVjdFJhdGlvID0gY29udGVudFcgLyBjb250ZW50SFxuXHRcdGlmKG9yaWVudGF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmKG9yaWVudGF0aW9uID09IEFwcENvbnN0YW50cy5MQU5EU0NBUEUpIHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxXG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgc2NhbGUgPSAoKHdpbmRvd1cgLyB3aW5kb3dIKSA8IGFzcGVjdFJhdGlvKSA/ICh3aW5kb3dIIC8gY29udGVudEgpICogMSA6ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdH1cblx0XHR2YXIgbmV3VyA9IGNvbnRlbnRXICogc2NhbGVcblx0XHR2YXIgbmV3SCA9IGNvbnRlbnRIICogc2NhbGVcblx0XHR2YXIgY3NzID0ge1xuXHRcdFx0d2lkdGg6IG5ld1csXG5cdFx0XHRoZWlnaHQ6IG5ld0gsXG5cdFx0XHRsZWZ0OiAod2luZG93VyA+PiAxKSAtIChuZXdXID4+IDEpLFxuXHRcdFx0dG9wOiAod2luZG93SCA+PiAxKSAtIChuZXdIID4+IDEpLFxuXHRcdFx0c2NhbGU6IHNjYWxlXG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBjc3Ncblx0fVxuXHRzdGF0aWMgQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cmluZykge1xuXHQgICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcblx0fVxuXHRzdGF0aWMgU3VwcG9ydFdlYkdMKCkge1xuXHRcdHRyeSB7XG5cdFx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0XHRcdHJldHVybiAhISAoIHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKCBjYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJyApICkgKTtcblx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0c3RhdGljIERlc3Ryb3lWaWRlbyh2aWRlbykge1xuICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICB2aWRlby5zcmMgPSAnJztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdmlkZW8uY2hpbGROb2Rlc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIFx0dmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgXHRjaGlsZC5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICAgICAgXHQvLyBXb3JraW5nIHdpdGggYSBwb2x5ZmlsbCBvciB1c2UganF1ZXJ5XG4gICAgICAgIFx0ZG9tLnRyZWUucmVtb3ZlKGNoaWxkKVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBEZXN0cm95VmlkZW9UZXh0dXJlKHRleHR1cmUpIHtcbiAgICBcdHZhciB2aWRlbyA9IHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlXG4gICAgICAgIFV0aWxzLkRlc3Ryb3lWaWRlbyh2aWRlbylcbiAgICB9XG4gICAgc3RhdGljIFJhbmQobWluLCBtYXgsIGRlY2ltYWxzKSB7XG4gICAgICAgIHZhciByYW5kb21OdW0gPSBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW5cbiAgICAgICAgaWYoZGVjaW1hbHMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFx0cmV0dXJuIHJhbmRvbU51bVxuICAgICAgICB9ZWxzZXtcblx0ICAgICAgICB2YXIgZCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcblx0ICAgICAgICByZXR1cm4gfn4oKGQgKiByYW5kb21OdW0pICsgMC41KSAvIGRcbiAgICAgICAgfVxuXHR9XG5cdHN0YXRpYyBHZXRJbWdVcmxJZCh1cmwpIHtcblx0XHR2YXIgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKVxuXHRcdHJldHVybiBzcGxpdFtzcGxpdC5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR9XG5cdHN0YXRpYyBTdHlsZShkaXYsIHN0eWxlKSB7XG4gICAgXHRkaXYuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubW96VHJhbnNmb3JtICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubXNUcmFuc2Zvcm0gICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUub1RyYW5zZm9ybSAgICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUudHJhbnNmb3JtICAgICAgID0gc3R5bGVcbiAgICB9XG4gICAgc3RhdGljIFRyYW5zbGF0ZShkaXYsIHgsIHksIHopIHtcbiAgICBcdGlmICgnd2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdtb3pUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ29UcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSkge1xuICAgIFx0XHRVdGlscy5TdHlsZShkaXYsICd0cmFuc2xhdGUzZCgnK3grJ3B4LCcreSsncHgsJyt6KydweCknKVxuXHRcdH1lbHNle1xuXHRcdFx0ZGl2LnN0eWxlLnRvcCA9IHkgKyAncHgnXG5cdFx0XHRkaXYuc3R5bGUubGVmdCA9IHggKyAncHgnXG5cdFx0fVxuICAgIH1cbiAgICBzdGF0aWMgU3ByaW5nVG8oaXRlbSwgdG9Qb3NpdGlvbiwgaW5kZXgpIHtcbiAgICBcdHZhciBkeCA9IHRvUG9zaXRpb24ueCAtIGl0ZW0ucG9zaXRpb24ueFxuICAgIFx0dmFyIGR5ID0gdG9Qb3NpdGlvbi55IC0gaXRlbS5wb3NpdGlvbi55XG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXG5cdFx0dmFyIHRhcmdldFggPSB0b1Bvc2l0aW9uLnggLSBNYXRoLmNvcyhhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0dmFyIHRhcmdldFkgPSB0b1Bvc2l0aW9uLnkgLSBNYXRoLnNpbihhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0aXRlbS52ZWxvY2l0eS54ICs9ICh0YXJnZXRYIC0gaXRlbS5wb3NpdGlvbi54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHkueSArPSAodGFyZ2V0WSAtIGl0ZW0ucG9zaXRpb24ueSkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnggKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cblx0XHRpdGVtLnZlbG9jaXR5LnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25JbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnXG59XG5cbi8vIERpc3BhdGNoZXJcbnZhciBQYWdlckRpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVBhZ2VyQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKGFjdGlvbilcblx0fVxufSlcblxuLy8gU3RvcmVcbnZhciBQYWdlclN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGZpcnN0UGFnZVRyYW5zaXRpb246IHRydWUsXG4gICAgcGFnZVRyYW5zaXRpb25TdGF0ZTogdW5kZWZpbmVkLCBcbiAgICBkaXNwYXRjaGVySW5kZXg6IFBhZ2VyRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBwYXlsb2FkLnR5cGVcbiAgICAgICAgdmFyIGl0ZW0gPSBwYXlsb2FkLml0ZW1cbiAgICAgICAgc3dpdGNoKGFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWTpcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTXG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlLCBpdGVtKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IGZhbHNlXG5cdFx0dGhpcy5jb21wb25lbnREaWRNb3VudCA9IHRoaXMuY29tcG9uZW50RGlkTW91bnQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdHJlbmRlcihjaGlsZElkLCBwYXJlbnRJZCwgdGVtcGxhdGUsIG9iamVjdCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbE1vdW50KClcblx0XHR0aGlzLmNoaWxkSWQgPSBjaGlsZElkXG5cdFx0dGhpcy5wYXJlbnRJZCA9IHBhcmVudElkXG5cdFx0XG5cdFx0aWYoZG9tLmlzRG9tKHBhcmVudElkKSkge1xuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnRJZFxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGlkID0gdGhpcy5wYXJlbnRJZC5pbmRleE9mKCcjJykgPiAtMSA/IHRoaXMucGFyZW50SWQuc3BsaXQoJyMnKVsxXSA6IHRoaXMucGFyZW50SWRcblx0XHRcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0fVxuXG5cdFx0aWYodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH1lbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHR2YXIgdCA9IHRlbXBsYXRlKG9iamVjdClcblx0XHRcdHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0XG5cdFx0fVxuXHRcdGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHNsdWcoY2hpbGRJZCkpXG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMucGFyZW50LCB0aGlzLmVsZW1lbnQpXG5cblx0XHRzZXRUaW1lb3V0KHRoaXMuY29tcG9uZW50RGlkTW91bnQsIDApXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRoaXMudGxPdXQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cblx0XHQvLyByZXNldFxuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMudGxJbi5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdHRoaXMudGxJbi50aW1lU2NhbGUoMS40KVxuXHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxJbi5wbGF5KDApLCA4MDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy50bE91dC5nZXRDaGlsZHJlbigpLmxlbmd0aCA8IDEpIHtcblx0XHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUpXG5cdFx0XHR0aGlzLnRsT3V0LnRpbWVTY2FsZSgxLjIpXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT50aGlzLnRsT3V0LnBsYXkoMCksIDUwMClcblx0XHR9XG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCksIDApXG5cdH1cblx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCksIDApXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGZvcmNlVW5tb3VudCgpIHtcblx0XHR0aGlzLnRsSW4ucGF1c2UoMClcblx0XHR0aGlzLnRsT3V0LnBhdXNlKDApXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5jbGVhcigpXG5cdFx0dGhpcy50bE91dC5jbGVhcigpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHMsIFBhZ2VyRGlzcGF0Y2hlcn0gZnJvbSAnUGFnZXInXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnUGFnZXNDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5jbGFzcyBCYXNlUGFnZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAncGFnZS1iJ1xuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4gPSB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluLmJpbmQodGhpcylcblx0XHR0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUgPSB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2ggPSB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoLmJpbmQodGhpcylcblx0XHR0aGlzLmNvbXBvbmVudHMgPSB7XG5cdFx0XHQnbmV3LWNvbXBvbmVudCc6IHVuZGVmaW5lZCxcblx0XHRcdCdvbGQtY29tcG9uZW50JzogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0Jhc2VQYWdlcicsIHBhcmVudCwgdGVtcGxhdGUsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU4sIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4pXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNILCB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy5zd2l0Y2hQYWdlc0RpdkluZGV4KClcblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRpZih0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSAhPSB1bmRlZmluZWQpIHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uSW4oKVxuXHRcdH0sIDYwMClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gIT0gdW5kZWZpbmVkKSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXS53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0cGFnZUFzc2V0c0xvYWRlZCgpIHtcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdFx0UGFnZXJBY3Rpb25zLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdEFwcEFjdGlvbnMubG9hZFBhZ2VBc3NldHMoKVxuXHR9XG5cdHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKCkge1xuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnb2xkLWNvbXBvbmVudCcpXG5cdH1cblx0c3dpdGNoUGFnZXNEaXZJbmRleCgpIHtcblx0XHR2YXIgbmV3Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR2YXIgb2xkQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J11cblx0XHRpZihuZXdDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBuZXdDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAyXG5cdFx0aWYob2xkQ29tcG9uZW50ICE9IHVuZGVmaW5lZCkgb2xkQ29tcG9uZW50LnBhcmVudC5zdHlsZVsnei1pbmRleCddID0gMVxuXHR9XG5cdHNldHVwTmV3Q29tcG9uZW50KGhhc2gsIFR5cGUsIHRlbXBsYXRlKSB7XG5cdFx0dmFyIGlkID0gVXRpbHMuQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGhhc2gucGFyZW50LnJlcGxhY2UoXCIvXCIsIFwiXCIpKVxuXHRcdHRoaXMub2xkUGFnZURpdlJlZiA9IHRoaXMuY3VycmVudFBhZ2VEaXZSZWZcblx0XHR0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID0gKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPT09ICdwYWdlLWEnKSA/ICdwYWdlLWInIDogJ3BhZ2UtYSdcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmN1cnJlbnRQYWdlRGl2UmVmKVxuXG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0aWQ6IHRoaXMuY3VycmVudFBhZ2VEaXZSZWYsXG5cdFx0XHRpc1JlYWR5OiB0aGlzLm9uUGFnZVJlYWR5LFxuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSxcblx0XHRcdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlLFxuXHRcdFx0ZGF0YTogQXBwU3RvcmUucGFnZUNvbnRlbnQoKVxuXHRcdH1cblx0XHR2YXIgcGFnZSA9IG5ldyBUeXBlKHByb3BzKVxuXHRcdHBhZ2UucmVuZGVyKGlkLCBlbCwgdGVtcGxhdGUsIHByb3BzLmRhdGEpXG5cdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10gPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddID0gcGFnZVxuXHRcdGlmKFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9PT0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTKSB7XG5cdFx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXS5mb3JjZVVubW91bnQoKVxuXHRcdH1cblx0fVxuXHRvblBhZ2VSZWFkeShoYXNoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uUGFnZVJlYWR5KGhhc2gpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHVubW91bnRDb21wb25lbnQocmVmKSB7XG5cdFx0aWYodGhpcy5jb21wb25lbnRzW3JlZl0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzW3JlZl0ucmVtb3ZlKClcblx0XHR9XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vZmYoUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOLCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluKVxuXHRcdFBhZ2VyU3RvcmUub2ZmKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnb2xkLWNvbXBvbmVudCcpXG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCduZXctY29tcG9uZW50Jylcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBhZ2VyXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcblx0XCJjb250ZW50XCI6IHtcblx0XHRcInR3aXR0ZXJfdXJsXCI6IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9jYW1wZXJcIixcblx0XHRcImZhY2Vib29rX3VybFwiOiBcImh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9DYW1wZXJcIixcblx0XHRcImluc3RhZ3JhbV91cmxcIjogXCJodHRwczovL2luc3RhZ3JhbS5jb20vY2FtcGVyL1wiLFxuXHRcdFwibGFiX3VybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9sYWJcIixcblx0XHRcImxhbmdcIjoge1xuXHRcdFx0XCJlblwiOiB7XG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiU2hvcFwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiTWVuXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIldvbWVuXCIsXG5cdFx0XHRcdFwicGxhbmV0XCI6IFwiUGxhbmV0XCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImJ1eV9idG5fdHh0XCI6IFwiQlVZIFRISVMgTU9ERUxcIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRcImxhbmdzXCI6IFtcImVuXCIsIFwiZnJcIiwgXCJlc1wiLCBcIml0XCIsIFwiZGVcIiwgXCJwdFwiXSxcblxuXHRcImhvbWUtdmlkZW9zXCI6IFtcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2VzLXRyZW5jLW1hcnRhLm1wNFwiXG5cdF0sXG5cdFwidmlkZW9zXCI6IFtcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2VzLXRyZW5jLW1hcnRhLm1wNFwiXG5cdF0sXG5cblx0XCJkZWZhdWx0LXJvdXRlXCI6IFwiXCIsXG5cblx0XCJyb3V0aW5nXCI6IHtcblx0XHRcIi9cIjoge1xuXHRcdFx0XCJ0ZXh0c1wiOiB7XG5cdFx0XHRcdFwidHh0X2FcIjogXCJCYWNrIHRvIHRoZSByb290cy4gSW5zcGlyYXRpb25zIGZvciBvdXIgbmV3IGNvbGxlY3Rpb24gY29tZXMgZnJvbSB0aGUgYmFsZWFyaWMgaXNsYW5kIG9mIE1hbGxvcmNhLCB0aGUgZm91bmRpbmcgZ3JvdW5kIG9mIENhbXBlci4gVmlzaXQgdGhyZWUgZGlmZmVyZW50IHNwb3RzIG9mIHRoZSBpc2xhbmQgLSBEZWlhLCBFcyBUcmVuYyBhbmQgQXJlbGx1ZiAtIGFzIGludGVycHJldGVkIGJ5IGNyZWF0aXZlIGRpcmVjdG9yLCBSb21haW4gS3JlbWVyLlwiLFxuXHRcdFx0XHRcImFfdmlzaW9uXCI6IFwiQSBWSVNJT04gT0ZcIlxuXHRcdFx0fSxcblx0XHRcdFwiYXNzZXRzXCI6IFtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyNjQsIFwic1wiOiA2OSwgXCJ2XCI6IDQxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDU2LCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hFTiBZT1UgQ0FOIMyBVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkUuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVpYS9tYXRlb1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyNjQsIFwic1wiOiA2OSwgXCJ2XCI6IDQxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDU2LCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hFTiBZT1UgQ0FOIMyBVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkUuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJlcy10cmVuYy9iZWx1Z2FcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjM0NDRkM2M4NjkzZTU5ZjgwNzlmODI3ZGQxODJjNWUzMzQxMzg3Ny9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyNjQsIFwic1wiOiA2OSwgXCJ2XCI6IDQxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDU2LCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hFTiBZT1UgQ0FOIMyBVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkUuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNmVhZmFlN2YxYjNiYzQxZDg1Njk3MzU1N2EyZjUxNTk4YzgyNDFhNi9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcblxuXHRcdFwiYXJlbGx1Zi9jYXBhc1wiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL21hcnRhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL2tvYmFyYWhcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjk4MGYxNGNjOGJkOTkxMmIxNGRjYTQ2YTRjZDRhODVmYTA0Nzc0Yy9hcmVsbHVmLWtvYmFyYWYubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyNjQsIFwic1wiOiA2OSwgXCJ2XCI6IDQxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDU2LCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hFTiBZT1UgQ0FOIMyBVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkUuXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cdFx0XCJhcmVsbHVmL2R1YlwiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIyYjM2MGM4Y2EzOTk2OTY5ODUzMTNkZGU5OWJhODNkNGVjOTcyYjcvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxOTYsIFwic1wiOiA1MiwgXCJ2XCI6IDMzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL3BhcmFkaXNlXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2E4MTljMzczZjk3Nzc4NTJmMzk2N2NlMDIzYmNmYjBkOTExNTM4NmYvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4gzIFUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORS5cIlxuICAgICAgICBcdH1cbiAgICAgICAgfVxuXG5cdH1cbn0iXX0=
