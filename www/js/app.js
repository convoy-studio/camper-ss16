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
		scope.close();
	};

	var open = function open() {
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

	var shopImg = (0, _img2['default'])('image/shop.png', function () {
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
			this.uiInTl.from(this.arrowsWrapper.left, 1, { x: -100, ease: Back.easeOut, force3D: true }, 0.1);
			this.uiInTl.from(this.arrowsWrapper.right, 1, { x: 100, ease: Back.easeOut, force3D: true }, 0.1);
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

	PX_CONTAINER_IS_READY: 'PX_CONTAINER_IS_READY',
	PX_CONTAINER_ADD_CHILD: 'PX_CONTAINER_ADD_CHILD',
	PX_CONTAINER_REMOVE_CHILD: 'PX_CONTAINER_REMOVE_CHILD',

	OPEN_FUN_FACT: 'OPEN_FUN_FACT',
	CLOSE_FUN_FACT: 'CLOSE_FUN_FACT',

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
			console.log(this.props);
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
        		"en": "Breaking up on a text message is not very deia"
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
        		"en": "buys an atelier at deia.<br>starts career as an artist"
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
        		"en": "ES TRENC PARTY BOY"
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
        		"en": "UFO sighting at es trenc"
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
        		"en": "MEANWHILE IN ARELLUF"
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
        		"en": "WHAT HAPPENS IN ARELLUF STAYS IN ARELLUF"
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
        		"en": "BAD TRIP AT THE HOTEL POOL"
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
        		"en": "Haters will say its photoshop"
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
        		"en": "WHEN YOU CAN'T KEEP THE ARROW ON THE CENTER LINE"
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
        		"en": "SELFIE ON WATERSLIDE LIKE A BOSS"
        	}
        }

	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0RpcHR5cXVlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0hvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc2VsZmllLXN0aWNrLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3NvY2lhbC1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy92aWRlby1jYW52YXMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbnN0YW50cy9BcHBDb25zdGFudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2Rpc3BhdGNoZXJzL0FwcERpc3BhdGNoZXIuanMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0RpcHR5cXVlLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvTWFwLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvUGFnZXNDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDaEQsWUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFN0MsV0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDbkQsWUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDcEQsWUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxHQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUMsR0FBRyxJQUFJLENBQUE7O0FBRTNELFlBQVUsQ0FBQyxZQUFJO0FBQ2QsWUFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLElBQUssU0FBUyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTtBQUNoRixhQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxVQUFVLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ2xGLGFBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsQ0FBQSxJQUFLLFVBQVUsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUE7R0FDekYsQ0FBQyxDQUFBO0VBRUYsQ0FBQTs7QUFFRCxNQUFLLEdBQUc7QUFDUCxRQUFNLEVBQUUsTUFBTTtFQUNkLENBQUE7O0FB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QUFDaEMsT0FBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7QUFDaEMsT0FBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7QUFDaEMsT0FBSSxFQUFFLEdBQUcsQUFBQyxFQUFFLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMxQixPQUFJLEVBQUUsR0FBRyxBQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzFCLE9BQUksRUFBRSxHQUFHLEFBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRTFCLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdCLFFBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsd0JBQVcsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDM0MsV0FBTyxDQUFDLEtBQUss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RSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUM5RixPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDeEgsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUVoRyxPQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzVGLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzVGLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZGLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ3BHLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUUvRixPQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUE7QUFDL0IsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUks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O0FDNUZ4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwiLy8gQXZvaWQgY29uc29sZSBlcnJvcnMgZm9yIHRoZSBJRSBjcmFwcHkgYnJvd3NlcnNcbmlmICggISB3aW5kb3cuY29uc29sZSApIGNvbnNvbGUgPSB7IGxvZzogZnVuY3Rpb24oKXt9IH07XG5cbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHAgZnJvbSAnQXBwJ1xuaW1wb3J0IEFwcE1vYmlsZSBmcm9tICdBcHBNb2JpbGUnXG5pbXBvcnQgVHdlZW5NYXggZnJvbSAnZ3NhcCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IE1vYmlsZURldGVjdCBmcm9tICdtb2JpbGUtZGV0ZWN0J1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIG1kID0gbmV3IE1vYmlsZURldGVjdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcblxuQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSAobWQubW9iaWxlKCkgfHwgbWQudGFibGV0KCkpID8gdHJ1ZSA6IGZhbHNlXG5BcHBTdG9yZS5QYXJlbnQgPSBkb20uc2VsZWN0KCcjYXBwLWNvbnRhaW5lcicpXG5BcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSA9IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNicpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llNycpIHx8IGRvbS5jbGFzc2VzLmNvbnRhaW5zKEFwcFN0b3JlLlBhcmVudCwgJ2llOCcpXG5BcHBTdG9yZS5EZXRlY3Rvci5pc1N1cHBvcnRXZWJHTCA9IFV0aWxzLlN1cHBvcnRXZWJHTCgpXG5pZihBcHBTdG9yZS5EZXRlY3Rvci5vbGRJRSkgQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUgPSB0cnVlXG5cbi8vIERlYnVnXG4vLyBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxudmFyIGFwcDtcbmlmKEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlKSB7XG5cdGRvbS5jbGFzc2VzLmFkZChkb20uc2VsZWN0KCdodG1sJyksICdtb2JpbGUnKVxuXHRhcHAgPSBuZXcgQXBwTW9iaWxlKClcbn1lbHNle1xuXHRhcHAgPSBuZXcgQXBwKClcdFxufSBcblxuYXBwLmluaXQoKVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlIGZyb20gJ0FwcFRlbXBsYXRlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgUHJlbG9hZGVyIGZyb20gJ1ByZWxvYWRlcidcblxuY2xhc3MgQXBwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5vbkFwcFJlYWR5ID0gdGhpcy5vbkFwcFJlYWR5LmJpbmQodGhpcylcblx0XHR0aGlzLmxvYWRNYWluQXNzZXRzID0gdGhpcy5sb2FkTWFpbkFzc2V0cy5iaW5kKHRoaXMpXG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHRoaXMucm91dGVyID0gbmV3IFJvdXRlcigpXG5cdFx0dGhpcy5yb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IFByZWxvYWRlclxuXHRcdEFwcFN0b3JlLlByZWxvYWRlciA9IG5ldyBQcmVsb2FkZXIoKVxuXG5cdFx0Ly8gSW5pdCBnbG9iYWwgZXZlbnRzXG5cdFx0d2luZG93Lkdsb2JhbEV2ZW50cyA9IG5ldyBHRXZlbnRzKClcblx0XHRHbG9iYWxFdmVudHMuaW5pdCgpXG5cblx0XHR2YXIgYXBwVGVtcGxhdGUgPSBuZXcgQXBwVGVtcGxhdGUoKVxuXHRcdGFwcFRlbXBsYXRlLmlzUmVhZHkgPSB0aGlzLmxvYWRNYWluQXNzZXRzXG5cdFx0YXBwVGVtcGxhdGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0dGhpcy5yb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxuXHRsb2FkTWFpbkFzc2V0cygpIHtcblx0XHR2YXIgaGFzaFVybCA9IGxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDIpXG5cdFx0dmFyIHBhcnRzID0gaGFzaFVybC5zdWJzdHIoMSkuc3BsaXQoJy8nKVxuXHRcdHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuXHRcdGlmKG1hbmlmZXN0Lmxlbmd0aCA8IDEpIHRoaXMub25BcHBSZWFkeSgpXG5cdFx0ZWxzZSBBcHBTdG9yZS5QcmVsb2FkZXIubG9hZChtYW5pZmVzdCwgdGhpcy5vbkFwcFJlYWR5KVxuXHR9XG5cdG9uQXBwUmVhZHkoKSB7XG5cdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4gICAgXHRcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGVNb2JpbGUgZnJvbSAnQXBwVGVtcGxhdGVNb2JpbGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcblxuY2xhc3MgQXBwTW9iaWxlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHRyb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZU1vYmlsZSA9IG5ldyBBcHBUZW1wbGF0ZU1vYmlsZSgpXG5cdFx0YXBwVGVtcGxhdGVNb2JpbGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0cm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwTW9iaWxlXG4gICAgXHRcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUFhDb250YWluZXIgZnJvbSAnUFhDb250YWluZXInXG5pbXBvcnQgVHJhbnNpdGlvbk1hcCBmcm9tICdUcmFuc2l0aW9uTWFwJ1xuXG5jbGFzcyBBcHBUZW1wbGF0ZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5hbmltYXRlID0gdGhpcy5hbmltYXRlLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdFxuXHRcdFxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHRoaXMucHhDb250YWluZXIgPSBuZXcgUFhDb250YWluZXIoKVxuXHRcdHRoaXMucHhDb250YWluZXIuaW5pdCgnI3BhZ2VzLWNvbnRhaW5lcicpXG5cdFx0QXBwQWN0aW9ucy5weENvbnRhaW5lcklzUmVhZHkodGhpcy5weENvbnRhaW5lcilcblxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcCA9IG5ldyBUcmFuc2l0aW9uTWFwKClcblx0XHR0aGlzLnRyYW5zaXRpb25NYXAucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMuaXNSZWFkeSgpXG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cblx0XHRHbG9iYWxFdmVudHMucmVzaXplKClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblJlYWR5KCkge1xuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHR0aGlzLmFuaW1hdGUoKVxuXHR9XG5cdGFuaW1hdGUoKSB7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZSlcblx0ICAgIHRoaXMucHhDb250YWluZXIudXBkYXRlKClcblx0ICAgIHRoaXMucGFnZXNDb250YWluZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucHhDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZVxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEZyb250Q29udGFpbmVyIGZyb20gJ0Zyb250Q29udGFpbmVyJ1xuaW1wb3J0IFBhZ2VzQ29udGFpbmVyIGZyb20gJ1BhZ2VzQ29udGFpbmVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5jbGFzcyBBcHBUZW1wbGF0ZU1vYmlsZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5yZXNpemUgPSB0aGlzLnJlc2l6ZS5iaW5kKHRoaXMpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGVNb2JpbGUnLCBwYXJlbnQsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyID0gbmV3IEZyb250Q29udGFpbmVyKClcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyID0gbmV3IFBhZ2VzQ29udGFpbmVyKClcblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHRjb25zb2xlLmxvZygnbW9iaWxlIHlvJylcblxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHQvLyB0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0Ly8gdGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwVGVtcGxhdGVNb2JpbGVcblxuIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5mdW5jdGlvbiBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpIHtcbiAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICAgICAgaXRlbTogcGFnZUlkXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBsb2FkUGFnZUFzc2V0czogZnVuY3Rpb24ocGFnZUlkKSB7XG4gICAgICAgIHZhciBtYW5pZmVzdCA9IEFwcFN0b3JlLnBhZ2VBc3NldHNUb0xvYWQoKVxuICAgICAgICBpZihtYW5pZmVzdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgX3Byb2NlZWRUcmFuc2l0aW9uSW5BY3Rpb24ocGFnZUlkKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93UmVzaXplOiBmdW5jdGlvbih3aW5kb3dXLCB3aW5kb3dIKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSxcbiAgICAgICAgICAgIGl0ZW06IHsgd2luZG93Vzp3aW5kb3dXLCB3aW5kb3dIOndpbmRvd0ggfVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgcHhDb250YWluZXJJc1JlYWR5OiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfSVNfUkVBRFksXG4gICAgICAgICAgICBpdGVtOiBjb21wb25lbnRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4QWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweFJlbW92ZUNoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgb3BlbkZ1bkZhY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGNsb3NlRnVuRmFjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwQWN0aW9uc1xuXG5cbiAgICAgIFxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdGcm9udENvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgaGVhZGVyTGlua3MgZnJvbSAnaGVhZGVyLWxpbmtzJ1xuaW1wb3J0IHNvY2lhbExpbmtzIGZyb20gJ3NvY2lhbC1saW5rcydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuXG5jbGFzcyBGcm9udENvbnRhaW5lciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cblx0XHR0aGlzLm9uUGFnZUNoYW5nZSA9IHRoaXMub25QYWdlQ2hhbmdlLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0dmFyIHNjb3BlID0ge31cblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXHRcdHNjb3BlLmluZm9zID0gQXBwU3RvcmUuZ2xvYmFsQ29udGVudCgpXG5cdFx0c2NvcGUuZmFjZWJvb2tVcmwgPSBnZW5lcmFJbmZvc1snZmFjZWJvb2tfdXJsJ11cblx0XHRzY29wZS50d2l0dGVyVXJsID0gZ2VuZXJhSW5mb3NbJ3R3aXR0ZXJfdXJsJ11cblx0XHRzY29wZS5pbnN0YWdyYW1VcmwgPSBnZW5lcmFJbmZvc1snaW5zdGFncmFtX3VybCddXG5cdFx0c2NvcGUubGFiVXJsID0gZ2VuZXJhSW5mb3NbJ2xhYl91cmwnXVxuXHRcdHNjb3BlLm1lblNob3BVcmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLycrSlNfbGFuZysnXycrSlNfY291bnRyeSsnL21lbi9zaG9lcy9uZXctY29sbGVjdGlvbidcblx0XHRzY29wZS53b21lblNob3BVcmwgPSAnaHR0cDovL3d3dy5jYW1wZXIuY29tLycrSlNfbGFuZysnXycrSlNfY291bnRyeSsnL3dvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXG5cdFx0c3VwZXIucmVuZGVyKCdGcm9udENvbnRhaW5lcicsIHBhcmVudCwgdGVtcGxhdGUsIHNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMub25QYWdlQ2hhbmdlKVxuXG5cdFx0dGhpcy5oZWFkZXJMaW5rcyA9IGhlYWRlckxpbmtzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLnNvY2lhbExpbmtzID0gc29jaWFsTGlua3ModGhpcy5lbGVtZW50KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXG5cdH1cblx0b25QYWdlQ2hhbmdlKCkge1xuXHRcdHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdGlmKGhhc2hPYmoudHlwZSA9PSBBcHBDb25zdGFudHMuRElQVFlRVUUpIHtcblx0XHRcdHRoaXMuc29jaWFsTGlua3MuaGlkZSgpXHRcdFx0XG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLnNvY2lhbExpbmtzLnNob3coKVxuXHRcdH1cblx0fVxuXHRyZXNpemUoKSB7XG5cblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLmhlYWRlckxpbmtzLnJlc2l6ZSgpXG5cdFx0dGhpcy5zb2NpYWxMaW5rcy5yZXNpemUoKVxuXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRnJvbnRDb250YWluZXJcblxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUFhDb250YWluZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRpbml0KGVsZW1lbnRJZCkge1xuXHRcdHRoaXMuY2xlYXJCYWNrID0gZmFsc2VcblxuXHRcdHRoaXMuYWRkID0gdGhpcy5hZGQuYmluZCh0aGlzKVxuXHRcdHRoaXMucmVtb3ZlID0gdGhpcy5yZW1vdmUuYmluZCh0aGlzKVxuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsIHRoaXMuYWRkKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELCB0aGlzLnJlbW92ZSlcblxuXHRcdHZhciByZW5kZXJPcHRpb25zID0ge1xuXHRcdCAgICByZXNvbHV0aW9uOiAxLFxuXHRcdCAgICB0cmFuc3BhcmVudDogdHJ1ZSxcblx0XHQgICAgYW50aWFsaWFzOiB0cnVlXG5cdFx0fTtcblx0XHR0aGlzLnJlbmRlcmVyID0gbmV3IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKDEsIDEsIHJlbmRlck9wdGlvbnMpXG5cdFx0Ly8gdGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLkNhbnZhc1JlbmRlcmVyKDEsIDEsIHJlbmRlck9wdGlvbnMpXG5cdFx0dGhpcy5jdXJyZW50Q29sb3IgPSAweGZmZmZmZlxuXHRcdHZhciBlbCA9IGRvbS5zZWxlY3QoZWxlbWVudElkKVxuXHRcdHRoaXMucmVuZGVyZXIudmlldy5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3B4LWNvbnRhaW5lcicpXG5cdFx0QXBwU3RvcmUuQ2FudmFzID0gdGhpcy5yZW5kZXJlci52aWV3XG5cdFx0ZG9tLnRyZWUuYWRkKGVsLCB0aGlzLnJlbmRlcmVyLnZpZXcpXG5cdFx0dGhpcy5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdFx0Ly8gdGhpcy5iYWNrZ3JvdW5kID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdFx0Ly8gdGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLmJhY2tncm91bmQpXG5cblx0XHR0aGlzLnN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0Ly8gdGhpcy5zdGF0cy5zZXRNb2RlKCAxICk7IC8vIDA6IGZwcywgMTogbXMsIDI6IG1iXG5cblx0XHQvLyBhbGlnbiB0b3AtbGVmdFxuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlWyd6LWluZGV4J10gPSA5OTk5OTlcblxuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuc3RhdHMuZG9tRWxlbWVudCApO1xuXG5cdH1cblx0ZHJhd0JhY2tncm91bmQoY29sb3IpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmNsZWFyKClcblx0XHR0aGlzLmJhY2tncm91bmQubGluZVN0eWxlKDApO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5iZWdpbkZpbGwoY29sb3IsIDEpO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5kcmF3UmVjdCgwLCAwLCB3aW5kb3dXLCB3aW5kb3dIKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZW5kRmlsbCgpO1xuXHR9XG5cdGFkZChjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2hpbGQpXG5cdH1cblx0cmVtb3ZlKGNoaWxkKSB7XG5cdFx0dGhpcy5zdGFnZS5yZW1vdmVDaGlsZChjaGlsZClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0dGhpcy5zdGF0cy51cGRhdGUoKVxuXHQgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHNjYWxlID0gMVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5yZW5kZXJlci5yZXNpemUod2luZG93VyAqIHNjYWxlLCB3aW5kb3dIICogc2NhbGUpXG5cdFx0Ly8gdGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VQYWdlIGZyb20gJ0Jhc2VQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFB4SGVscGVyIGZyb20gJ1B4SGVscGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWdlIGV4dGVuZHMgQmFzZVBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKVxuXHRcdHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkID0gZmFsc2Vcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzZXRUaW1lb3V0KCgpPT57IEFwcEFjdGlvbnMucHhBZGRDaGlsZCh0aGlzLnB4Q29udGFpbmVyKSB9LCAwKVxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gNFxuXHRcdHN1cGVyLndpbGxUcmFuc2l0aW9uSW4oKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uT3V0KCkge1xuXHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gNFxuXHRcdHN1cGVyLndpbGxUcmFuc2l0aW9uT3V0KClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRpZih0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkge1xuXHRcdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSB0cnVlXG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDBcblx0XHR9ZWxzZXtcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gMVxuXHRcdH1cblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0Z2V0SW1hZ2VVcmxCeUlkKGlkKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FID8gJ2hvbWUtJyArIGlkIDogdGhpcy5wcm9wcy5oYXNoLnBhcmVudCArICctJyArIHRoaXMucHJvcHMuaGFzaC50YXJnZXQgKyAnLScgKyBpZFxuXHRcdHJldHVybiBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VVUkwodXJsKVxuXHR9XG5cdGdldEltYWdlU2l6ZUJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVNpemUodXJsKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRQeEhlbHBlci5yZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXIodGhpcy5weENvbnRhaW5lcilcblx0XHRzZXRUaW1lb3V0KCgpPT57IEFwcEFjdGlvbnMucHhSZW1vdmVDaGlsZCh0aGlzLnB4Q29udGFpbmVyKSB9LCAwKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtQYWdlckFjdGlvbnMsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBCYXNlUGFnZXIgZnJvbSAnQmFzZVBhZ2VyJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgSG9tZSBmcm9tICdIb21lJ1xuaW1wb3J0IEhvbWVUZW1wbGF0ZSBmcm9tICdIb21lX2hicydcbmltcG9ydCBEaXB0eXF1ZSBmcm9tICdEaXB0eXF1ZSdcbmltcG9ydCBEaXB0eXF1ZVRlbXBsYXRlIGZyb20gJ0RpcHR5cXVlX2hicydcblxuY2xhc3MgUGFnZXNDb250YWluZXIgZXh0ZW5kcyBCYXNlUGFnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5kaWRIYXNoZXJDaGFuZ2UgPSB0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlQXNzZXRzTG9hZGVkID0gdGhpcy5wYWdlQXNzZXRzTG9hZGVkLmJpbmQodGhpcylcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5kaWRIYXNoZXJDaGFuZ2UpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfQVNTRVRTX0xPQURFRCwgdGhpcy5wYWdlQXNzZXRzTG9hZGVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRkaWRIYXNoZXJDaGFuZ2UoKSB7XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMudGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaClcblx0XHR9ZWxzZXtcblx0XHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25PdXQoKVxuXHRcdFx0Ly8gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQoKVxuXHRcdH1cblx0fVxuXHR0ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKSB7XG5cdFx0dmFyIHR5cGUgPSB1bmRlZmluZWRcblx0XHR2YXIgdGVtcGxhdGUgPSB1bmRlZmluZWRcblx0XHRzd2l0Y2gobmV3SGFzaC50eXBlKSB7XG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5ESVBUWVFVRTpcblx0XHRcdFx0dHlwZSA9IERpcHR5cXVlXG5cdFx0XHRcdHRlbXBsYXRlID0gRGlwdHlxdWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuSE9NRTpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0fVxuXHRcdHRoaXMuc2V0dXBOZXdDb21wb25lbnQobmV3SGFzaCwgdHlwZSwgdGVtcGxhdGUpXG5cdFx0dGhpcy5jdXJyZW50Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0fVxuXHRwYWdlQXNzZXRzTG9hZGVkKCkge1xuXHRcdHZhciBuZXdIYXNoID0gUm91dGVyLmdldE5ld0hhc2goKVxuXHRcdHRoaXMudGVtcGxhdGVTZWxlY3Rpb24obmV3SGFzaClcblx0XHRzdXBlci5wYWdlQXNzZXRzTG9hZGVkKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhZ2VzQ29udGFpbmVyXG5cblxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ1RyYW5zaXRpb25NYXBfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgbWFwIGZyb20gJ21haW4tbWFwJ1xuaW1wb3J0IHtQYWdlclN0b3JlLCBQYWdlckNvbnN0YW50c30gZnJvbSAnUGFnZXInXG5cbmNsYXNzIFRyYW5zaXRpb25NYXAgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMub25QYWdlVHJhbnNpdGlvbk91dCA9IHRoaXMub25QYWdlVHJhbnNpdGlvbk91dC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMub25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MgPSB0aGlzLnByZWxvYWRlclByb2dyZXNzLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0dmFyIHNjb3BlID0ge31cblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXG5cdFx0c3VwZXIucmVuZGVyKCdUcmFuc2l0aW9uTWFwJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMub25QYWdlVHJhbnNpdGlvbk91dClcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSlcblx0XHRBcHBTdG9yZS5QcmVsb2FkZXIucXVldWUub24oXCJwcm9ncmVzc1wiLCB0aGlzLnByZWxvYWRlclByb2dyZXNzLCB0aGlzKVxuXG5cdFx0dGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuVFJBTlNJVElPTilcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRvblBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLmhpZ2hsaWdodChSb3V0ZXIuZ2V0T2xkSGFzaCgpLCBSb3V0ZXIuZ2V0TmV3SGFzaCgpKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHZhciBvbGRIYXNoID0gUm91dGVyLmdldE9sZEhhc2goKVxuXHRcdGlmKG9sZEhhc2ggPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblx0XHR0aGlzLm1hcC5yZXNldEhpZ2hsaWdodCgpXG5cdH1cblx0cHJlbG9hZGVyUHJvZ3Jlc3MoZSkge1xuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzICs9IDAuMlxuXHRcdGlmKGUucHJvZ3Jlc3MgPiAwLjk5KSB0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDFcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuY3VycmVudFByb2dyZXNzID4gMSA/IDEgOiB0aGlzLmN1cnJlbnRQcm9ncmVzcyBcblx0XHR0aGlzLm1hcC51cGRhdGVQcm9ncmVzcyhlLnByb2dyZXNzKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLm1hcC5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zaXRpb25NYXBcblxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBhcm91bmRCb3JkZXIgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyICRjb250YWluZXIgPSBkb20uc2VsZWN0KCcuYXJvdW5kLWJvcmRlci1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciB0b3AgPSBkb20uc2VsZWN0KCcudG9wJywgJGNvbnRhaW5lcilcblx0dmFyIGJvdHRvbSA9IGRvbS5zZWxlY3QoJy5ib3R0b20nLCAkY29udGFpbmVyKVxuXHR2YXIgbGVmdCA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGNvbnRhaW5lcilcblx0dmFyIHJpZ2h0ID0gZG9tLnNlbGVjdCgnLnJpZ2h0JywgJGNvbnRhaW5lcilcblxuXHR2YXIgJGxldHRlcnNDb250YWluZXIgPSBkb20uc2VsZWN0KCcuYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcExldHRlcnMgPSBkb20uc2VsZWN0KCcudG9wJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBib3R0b21MZXR0ZXJzID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgbGVmdExldHRlcnMgPSBkb20uc2VsZWN0KCcubGVmdCcsICRsZXR0ZXJzQ29udGFpbmVyKS5jaGlsZHJlblxuXHR2YXIgcmlnaHRMZXR0ZXJzID0gZG9tLnNlbGVjdCgnLnJpZ2h0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciBib3JkZXJTaXplID0gMTBcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUyBdXG5cblx0XHRcdHRvcC5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0Ym90dG9tLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBib3JkZXJTaXplICsgJ3B4J1xuXHRcdFx0bGVmdC5zdHlsZS5oZWlnaHQgPSByaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0cmlnaHQuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBib3JkZXJTaXplICsgJ3B4J1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHRsID0gdG9wTGV0dGVyc1tpXVxuXHRcdFx0XHR0bC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdHRsLnN0eWxlLnRvcCA9IC0yICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYm90dG9tTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmwgPSBib3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdGJsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0Ymwuc3R5bGUudG9wID0gd2luZG93SCAtIDEyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVmdExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGxsID0gbGVmdExldHRlcnNbaV1cblx0XHRcdFx0bGwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSArIChibG9ja1NpemVbMV0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGxsLnN0eWxlLmxlZnQgPSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmlnaHRMZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBybCA9IHJpZ2h0TGV0dGVyc1tpXVxuXHRcdFx0XHRybC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0cmwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSA4ICsgJ3B4J1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHRvcExldHRlcnMgPSBudWxsXG5cdFx0XHRib3R0b21MZXR0ZXJzID0gbnVsbFxuXHRcdFx0bGVmdExldHRlcnMgPSBudWxsXG5cdFx0XHRyaWdodExldHRlcnMgPSBudWxsXG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBhcm91bmRCb3JkZXIiLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChwYXJlbnQsIG9uTW91c2VFbnRlciwgb25Nb3VzZUxlYXZlKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgYXJyb3dzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5hcnJvd3Mtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGxlZnRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5sZWZ0JywgYXJyb3dzV3JhcHBlcilcblx0dmFyIHJpZ2h0QXJyb3cgPSBkb20uc2VsZWN0KCcuYXJyb3cucmlnaHQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgYXJyb3dzID0ge1xuXHRcdGxlZnQ6IHtcblx0XHRcdGVsOiBsZWZ0QXJyb3csXG5cdFx0XHRpY29uczogZG9tLnNlbGVjdC5hbGwoJ3N2ZycsIGxlZnRBcnJvdyksXG5cdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgbGVmdEFycm93KSxcblx0XHRcdGJhY2tncm91bmQ6IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgbGVmdEFycm93KVxuXHRcdH0sXG5cdFx0cmlnaHQ6IHtcblx0XHRcdGVsOiByaWdodEFycm93LFxuXHRcdFx0aWNvbnM6IGRvbS5zZWxlY3QuYWxsKCdzdmcnLCByaWdodEFycm93KSxcblx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCByaWdodEFycm93KSxcblx0XHRcdGJhY2tncm91bmQ6IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgcmlnaHRBcnJvdylcblx0XHR9XG5cdH1cblxuXHRkb20uZXZlbnQub24oYXJyb3dzLmxlZnQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLmxlZnQuZWwsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0ZG9tLmV2ZW50Lm9uKGFycm93cy5yaWdodC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cblx0c2NvcGUgPSB7XG5cdFx0bGVmdDogYXJyb3dzLmxlZnQuZWwsXG5cdFx0cmlnaHQ6IGFycm93cy5yaWdodC5lbCxcblx0XHRiYWNrZ3JvdW5kOiAoZGlyKT0+IHtcblx0XHRcdHJldHVybiBhcnJvd3NbZGlyXS5iYWNrZ3JvdW5kXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBhcnJvd1NpemUgPSBkb20uc2l6ZShhcnJvd3MubGVmdC5pY29uc1sxXSlcblx0XHRcdHZhciBvZmZzZXRZID0gMjBcblx0XHRcdHZhciBiZ1dpZHRoID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXG5cdFx0XHRhcnJvd3MucmlnaHQuZWwuc3R5bGUubGVmdCA9IHdpbmRvd1cgLSBiZ1dpZHRoICsgJ3B4J1xuXG5cdFx0XHRhcnJvd3MubGVmdC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5sZWZ0Lmljb25zV3JhcHBlci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChhcnJvd1NpemVbMF0gPj4gMSkgLSBvZmZzZXRZICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gYmdXaWR0aCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5iYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MucmlnaHQuaWNvbnNXcmFwcGVyLnN0eWxlLmxlZnQgPSBiZ1dpZHRoIC0gYXJyb3dTaXplWzBdIC0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICsgJ3B4J1xuXHRcdFx0XHRcblx0XHR9LFxuXHRcdG92ZXI6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0b3V0OiAoZGlyKT0+IHtcblx0XHRcdHZhciBhcnJvdyA9IGFycm93c1tkaXJdXG5cdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoYXJyb3cuZWwsICdob3ZlcmVkJylcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLmxlZnQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5yaWdodC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0XHRhcnJvd3MgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGJvdHRvbVRleHRzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgYm90dG9tVGV4dHNDb250YWluZXIgPSBkb20uc2VsZWN0KCcuYm90dG9tLXRleHRzLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIGxlZnRCbG9jayA9IGRvbS5zZWxlY3QoJy5sZWZ0LXRleHQnLCBib3R0b21UZXh0c0NvbnRhaW5lcilcblx0dmFyIHJpZ2h0QmxvY2sgPSBkb20uc2VsZWN0KCcucmlnaHQtdGV4dCcsIGJvdHRvbVRleHRzQ29udGFpbmVyKVxuXHR2YXIgbGVmdEZyb250ID0gZG9tLnNlbGVjdCgnLmZyb250LXdyYXBwZXInLCBsZWZ0QmxvY2spXG5cdHZhciByaWdodEZyb250ID0gZG9tLnNlbGVjdCgnLmZyb250LXdyYXBwZXInLCByaWdodEJsb2NrKVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TIF1cblxuXHRcdGxlZnRCbG9jay5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSAqIDIgKyAncHgnXG5cdFx0bGVmdEJsb2NrLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLmhlaWdodCA9IGJsb2NrU2l6ZVsxXSArICdweCdcblxuXHRcdGxlZnRCbG9jay5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRyaWdodEJsb2NrLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gKGJsb2NrU2l6ZVswXSAqIDIpICsgJ3B4J1xuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0bGVmdEZyb250LnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgLSAobGVmdEZyb250LmNsaWVudEhlaWdodCA+PiAxKSArICdweCdcblx0XHRcdHJpZ2h0RnJvbnQuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIChyaWdodEZyb250LmNsaWVudEhlaWdodCA+PiAxKSArICdweCdcblx0XHRcdHJpZ2h0RnJvbnQuc3R5bGUubGVmdCA9ICgoYmxvY2tTaXplWzBdIDw8IDEpID4+IDEpIC0gKHJpZ2h0RnJvbnQuY2xpZW50V2lkdGggPj4gMSkgKyAncHgnXG5cdFx0fSlcblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiByZXNpemVcblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBib3R0b21UZXh0cyIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgY2hhcmFjdGVyVXJsLCB0ZXh0dXJlU2l6ZSk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciB0ZXggPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGNoYXJhY3RlclVybClcblx0dmFyIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXgpXG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNVxuXHRob2xkZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0c3ByaXRlLm1hc2sgPSBtYXNrXG5cblx0c2NvcGUgPSB7XG5cdFx0dXBkYXRlOiAobW91c2UpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIG5YID0gKCggKCBtb3VzZS54IC0gKCB3aW5kb3dXID4+IDEpICkgLyAoIHdpbmRvd1cgPj4gMSApICkgKiAxKSAtIDAuNVxuXHRcdFx0dmFyIG5ZID0gbW91c2UublkgLSAwLjVcblx0XHRcdHZhciBuZXd4ID0gc3ByaXRlLml4ICsgKDEwICogblgpXG5cdFx0XHR2YXIgbmV3eSA9IHNwcml0ZS5peSArICgxMCAqIG5ZKVxuXHRcdFx0c3ByaXRlLnggKz0gKG5ld3ggLSBzcHJpdGUueCkgKiAwLjAzXG5cdFx0XHRzcHJpdGUueSArPSAobmV3eSAtIHNwcml0ZS55KSAqIDAuMDNcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBzaXplID0gWyh3aW5kb3dXID4+IDEpICsgMSwgd2luZG93SF1cblxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRtYXNrLmJlZ2luRmlsbCgweGZmMDAwMCwgMSk7XG5cdFx0XHRtYXNrLmRyYXdSZWN0KDAsIDAsIHNpemVbMF0sIHNpemVbMV0pO1xuXHRcdFx0bWFzay5lbmRGaWxsKCk7XG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICgod2luZG93SCAtIDEwMCkgLyB0ZXh0dXJlU2l6ZS5oZWlnaHQpICogMVxuXHRcdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gc2NhbGVcblx0XHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdFx0c3ByaXRlLnkgPSBzaXplWzFdIC0gKCh0ZXh0dXJlU2l6ZS5oZWlnaHQgKiBzY2FsZSkgPj4gMSkgKyAxMFxuXHRcdFx0XHRzcHJpdGUuaXggPSBzcHJpdGUueFxuXHRcdFx0XHRzcHJpdGUuaXkgPSBzcHJpdGUueVxuXHRcdFx0fSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChzcHJpdGUpXG5cdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQobWFzaylcblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0c3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0c3ByaXRlID0gbnVsbFxuXHRcdFx0dGV4ID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBjb2xvclV0aWxzIGZyb20gJ2NvbG9yLXV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAocHhDb250YWluZXIsIGNvbG9ycyk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIGJnQ29sb3JzID0gW11cblx0YmdDb2xvcnMubGVuZ3RoID0gNVxuXG5cdHZhciB0bCA9IG5ldyBUaW1lbGluZUxpdGUoKVxuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYmdDb2xvcnMubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgYmdDb2xvciA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHRiZ0NvbG9yc1tpXSA9IGJnQ29sb3Jcblx0XHRob2xkZXIuYWRkQ2hpbGQoYmdDb2xvcilcblx0fTtcblxuXHR2YXIgb3BlbiA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgxLjUpXG5cdFx0dGwucGxheSgwKVxuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0fVxuXHR2YXIgY2xvc2UgPSAoKT0+IHtcblx0XHR0bC50aW1lU2NhbGUoMilcblx0XHR0bC5yZXZlcnNlKClcblx0XHRzY29wZS5pc09wZW4gPSBmYWxzZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0dGw6IHRsLFxuXHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0aG9sZGVyOiBob2xkZXIsXG5cdFx0b3Blbjogb3Blbixcblx0XHRjbG9zZTogY2xvc2UsXG5cdFx0cmVzaXplOiAod2lkdGgsIGhlaWdodCwgZGlyZWN0aW9uKT0+e1xuXG5cdFx0XHR0bC5jbGVhcigpXG5cblx0XHRcdHZhciBocyA9IGNvbG9ycy5mcm9tLmggLSBjb2xvcnMudG8uaFxuXHRcdFx0dmFyIHNzID0gY29sb3JzLmZyb20ucyAtIGNvbG9ycy50by5zXG5cdFx0XHR2YXIgdnMgPSBjb2xvcnMuZnJvbS52IC0gY29sb3JzLnRvLnZcblx0XHRcdHZhciBsZW4gPSBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwSCA9IGhzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFMgPSBzcyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBWID0gdnMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBoZCA9IChocyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgc2QgPSAoc3MgPCAwKSA/IC0xIDogMVxuXHRcdFx0dmFyIHZkID0gKHZzIDwgMCkgPyAtMSA6IDFcblxuXHRcdFx0dmFyIGRlbGF5ID0gMC4xMlxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdHZhciBoID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5oICsgKHN0ZXBIKmkqaGQpKVxuXHRcdFx0XHR2YXIgcyA9IE1hdGgucm91bmQoY29sb3JzLmZyb20ucyArIChzdGVwUyppKnNkKSlcblx0XHRcdFx0dmFyIHYgPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLnYgKyAoc3RlcFYqaSp2ZCkpXG5cdFx0XHRcdHZhciBjID0gJzB4JyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoaCwgcywgdilcblx0XHRcdFx0YmdDb2xvci5jbGVhcigpXG5cdFx0XHRcdGJnQ29sb3IuYmVnaW5GaWxsKGMsIDEpO1xuXHRcdFx0XHRiZ0NvbG9yLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0XHRiZ0NvbG9yLmVuZEZpbGwoKTtcblxuXHRcdFx0XHRzd2l0Y2goZGlyZWN0aW9uKSB7XG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuVE9QOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB5OmhlaWdodCB9LCB7IHk6LWhlaWdodCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5CT1RUT006XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6LWhlaWdodCB9LCB7IHk6aGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkxFRlQ6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHg6d2lkdGggfSwgeyB4Oi13aWR0aCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCBkZWxheSppKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5SSUdIVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDotd2lkdGggfSwgeyB4OndpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fTtcblxuXHRcdFx0dGwucGF1c2UoMClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHRsLmNsZWFyKClcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmdDb2xvcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJnQ29sb3IgPSBiZ0NvbG9yc1tpXVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKGJnQ29sb3IpXG5cdFx0XHRcdGJnQ29sb3IgPSBudWxsXG5cdFx0XHR9O1xuXHRcdFx0YmdDb2xvcnMgPSBudWxsXG5cdFx0XHR0bCA9IG51bGxcblx0XHRcdGhvbGRlciA9IG51bGxcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5leHBvcnQgZGVmYXVsdCAocHhDb250YWluZXIsIGJnVXJsKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgbWFzayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cdGhvbGRlci5hZGRDaGlsZChtYXNrKVxuXG5cdHZhciBiZ1RleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGJnVXJsKVxuXHR2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKGJnVGV4dHVyZSlcblx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdGhvbGRlci5hZGRDaGlsZChzcHJpdGUpXG5cblx0c3ByaXRlLm1hc2sgPSBtYXNrXG5cblx0c2NvcGUgPSB7XG5cdFx0aG9sZGVyOiBob2xkZXIsXG5cdFx0YmdTcHJpdGU6IHNwcml0ZSxcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggLSAoMzAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5IC0gKDIwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDA4XG5cdFx0XHRzcHJpdGUueSArPSAobmV3eSAtIHNwcml0ZS55KSAqIDAuMDA4XG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBzaXplID0gWyh3aW5kb3dXID4+IDEpICsgMSwgd2luZG93SF1cblxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRtYXNrLmJlZ2luRmlsbCgweGZmMDAwMCwgMSk7XG5cdFx0XHRtYXNrLmRyYXdSZWN0KDAsIDAsIHNpemVbMF0sIHNpemVbMV0pO1xuXHRcdFx0bWFzay5lbmRGaWxsKCk7XG5cblx0XHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShzaXplWzBdLCBzaXplWzFdLCA5NjAsIDEwMjQpXG5cblx0XHRcdHNwcml0ZS54ID0gc2l6ZVswXSA+PiAxXG5cdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gPj4gMVxuXHRcdFx0c3ByaXRlLnNjYWxlLnggPSBzcHJpdGUuc2NhbGUueSA9IHJlc2l6ZVZhcnMuc2NhbGUgKyAwLjFcblx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRzcHJpdGUuaXkgPSBzcHJpdGUueVxuXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRweENvbnRhaW5lci5yZW1vdmVDaGlsZChob2xkZXIpXG5cdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQobWFzaylcblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0c3ByaXRlLmRlc3Ryb3koKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBjb2xvcnlSZWN0cyBmcm9tICdjb2xvcnktcmVjdHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgcGFyZW50LCBtb3VzZSwgZGF0YSwgcHJvcHMpPT4ge1xuXHR2YXIgc2NvcGU7XG5cdHZhciBpc1JlYWR5ID0gZmFsc2Vcblx0dmFyIG9uQ2xvc2VUaW1lb3V0O1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuZnVuLWZhY3Qtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIHZpZGVvV3JhcHBlciA9IGRvbS5zZWxlY3QoJy52aWRlby13cmFwcGVyJywgZWwpXG5cdHZhciBtZXNzYWdlV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5tZXNzYWdlLXdyYXBwZXInLCBlbClcblx0dmFyIG1lc3NhZ2VJbm5lciA9IGRvbS5zZWxlY3QoJy5tZXNzYWdlLWlubmVyJywgbWVzc2FnZVdyYXBwZXIpXG5cdHZhciBwciA9IHByb3BzO1xuXG5cdHZhciBzcGxpdHRlciA9IG5ldyBTcGxpdFRleHQobWVzc2FnZUlubmVyLCB7dHlwZTpcIndvcmRzXCJ9KVxuXG5cdHZhciBjID0gZG9tLnNlbGVjdCgnLmN1cnNvci1jcm9zcycsIGVsKVxuXHR2YXIgY3Jvc3MgPSB7XG5cdFx0eDogMCxcblx0XHR5OiAwLFxuXHRcdGVsOiBjLFxuXHRcdHNpemU6IGRvbS5zaXplKGMpXG5cdH1cblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBsZWZ0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblx0dmFyIHJpZ2h0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblxuXHR2YXIgbUJnQ29sb3IgPSBkYXRhWydhbWJpZW50LWNvbG9yJ10udG9cblx0bWVzc2FnZVdyYXBwZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMnICsgY29sb3JVdGlscy5oc3ZUb0hleChtQmdDb2xvci5oLCBtQmdDb2xvci5zLCBtQmdDb2xvci52KVxuXG5cdHZhciBsZWZ0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR2YXIgcmlnaHRUbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdGxvb3A6IHRydWVcblx0fSlcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnZnVuLWZhY3QtdmlkZW8tdXJsJ11cblx0bVZpZGVvLmFkZFRvKHZpZGVvV3JhcHBlcilcblx0bVZpZGVvLmxvYWQodmlkZW9TcmMsICgpPT4ge1xuXHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblxuXHR2YXIgb25DbG9zZUZ1bkZhY3QgPSAoKT0+IHtcblx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRzY29wZS5jbG9zZSgpXG5cdH1cblxuXHR2YXIgb3BlbiA9ICgpPT4ge1xuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0XHRzY29wZS5sZWZ0UmVjdHMub3BlbigpXG5cdFx0c2NvcGUucmlnaHRSZWN0cy5vcGVuKClcblx0XHR2YXIgZGVsYXkgPSAzNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5tVmlkZW8ucGxheSgpLCBkZWxheSsyMDApXG5cdFx0Y2xlYXJUaW1lb3V0KG9uQ2xvc2VUaW1lb3V0KVxuXHRcdG9uQ2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKT0+ZG9tLmV2ZW50Lm9uKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpLCBkZWxheSsyMDApXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdub25lJ1xuXHRcdGRvbS5jbGFzc2VzLmFkZChjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdH1cblx0dmFyIGNsb3NlID0gKCk9PiB7XG5cdFx0c2NvcGUuaXNPcGVuID0gZmFsc2Vcblx0XHRzY29wZS5sZWZ0UmVjdHMuY2xvc2UoKVxuXHRcdHNjb3BlLnJpZ2h0UmVjdHMuY2xvc2UoKVxuXHRcdHZhciBkZWxheSA9IDUwXG5cdFx0c2V0VGltZW91dCgoKT0+bGVmdFRsLnRpbWVTY2FsZSgyKS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9PnJpZ2h0VGwudGltZVNjYWxlKDIpLnJldmVyc2UoKSwgZGVsYXkpXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdGRvbS5ldmVudC5vZmYocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRsZWZ0UmVjdHM6IGxlZnRSZWN0cyxcblx0XHRyaWdodFJlY3RzOiByaWdodFJlY3RzLFxuXHRcdHJlc2l6ZTogKCk9Pntcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBtaWRXaW5kb3dXID0gKHdpbmRvd1cgPj4gMSlcblxuXHRcdFx0dmFyIHNpemUgPSBbbWlkV2luZG93VyArIDEsIHdpbmRvd0hdXG5cblx0XHRcdHNjb3BlLmxlZnRSZWN0cy5yZXNpemUoc2l6ZVswXSwgc2l6ZVsxXSwgQXBwQ29uc3RhbnRzLlRPUClcblx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5CT1RUT00pXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzLmhvbGRlci54ID0gd2luZG93VyAvIDJcblx0XHRcdFx0XG5cdFx0XHQvLyBpZiB2aWRlbyBpc24ndCByZWFkeSByZXR1cm5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0dmFyIHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KG1pZFdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfVyA+PiAxLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS53aWR0aCA9IG1lc3NhZ2VXcmFwcGVyLnN0eWxlLndpZHRoID0gbWlkV2luZG93VyArICdweCdcblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBtZXNzYWdlV3JhcHBlci5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLmxlZnQgPSBtaWRXaW5kb3dXICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLndpZHRoID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5oZWlnaHQgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS50b3AgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLnRvcCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5sZWZ0ID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHR2YXIgbWVzc2FnZUlubmVyU2l6ZSA9IGRvbS5zaXplKG1lc3NhZ2VJbm5lcilcblx0XHRcdFx0bWVzc2FnZUlubmVyLnN0eWxlLmxlZnQgPSAobWlkV2luZG93VyA+PiAxKSAtIChtZXNzYWdlSW5uZXJTaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRtZXNzYWdlSW5uZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVsxXSA+PiAxKSArICdweCdcblx0XHRcdH0sIDApXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdGxlZnRUbC5jbGVhcigpXG5cdFx0XHRcdHJpZ2h0VGwuY2xlYXIoKVxuXG5cdFx0XHRcdGxlZnRUbC5mcm9tVG8obWVzc2FnZVdyYXBwZXIsIDEuNCwgeyB5OndpbmRvd0gsIHNjYWxlWTozLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAwJScgfSwgeyB5OjAsIHNjYWxlWToxLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdFx0XHRsZWZ0VGwuc3RhZ2dlckZyb20oc3BsaXR0ZXIud29yZHMsIDEsIHsgeToxNDAwLCBzY2FsZVk6NiwgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZU91dCB9LCAwLjA2LCAwLjIpXG5cdFx0XHRcdHJpZ2h0VGwuZnJvbVRvKHZpZGVvV3JhcHBlciwgMS40LCB7IHk6LXdpbmRvd0gqMiwgc2NhbGVZOjMsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnIH0sIHsgeTowLCBzY2FsZVk6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXG5cdFx0XHRcdGxlZnRUbC5wYXVzZSgwKVxuXHRcdFx0XHRyaWdodFRsLnBhdXNlKDApXG5cdFx0XHRcdG1lc3NhZ2VXcmFwcGVyLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0fSwgNSlcblxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc09wZW4pIHJldHVyblxuXHRcdFx0dmFyIG5ld3ggPSBtb3VzZS54IC0gKGNyb3NzLnNpemVbMF0gPj4gMSlcblx0XHRcdHZhciBuZXd5ID0gbW91c2UueSAtIChjcm9zcy5zaXplWzFdID4+IDEpXG5cdFx0XHRjcm9zcy54ICs9IChuZXd4IC0gY3Jvc3MueCkgKiAwLjVcblx0XHRcdGNyb3NzLnkgKz0gKG5ld3kgLSBjcm9zcy55KSAqIDAuNVxuXHRcdFx0VXRpbHMuVHJhbnNsYXRlKGNyb3NzLmVsLCBjcm9zcy54LCBjcm9zcy55LCAxKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGxlZnRUbC5jbGVhcigpXG5cdFx0XHRyaWdodFRsLmNsZWFyKClcblx0XHRcdHNjb3BlLmxlZnRSZWN0cy5jbGVhcigpXG5cdFx0XHRzY29wZS5yaWdodFJlY3RzLmNsZWFyKClcblx0XHRcdHNjb3BlLmxlZnRSZWN0cyA9IG51bGxcblx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMgPSBudWxsXG5cdFx0XHRsZWZ0VGwgPSBudWxsXG5cdFx0XHRyaWdodFRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgdmlkZW9DYW52YXMgZnJvbSAndmlkZW8tY2FudmFzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5pbXBvcnQgbWVkaWFDZWxsIGZyb20gJ21lZGlhLWNlbGwnXG5cbnZhciBncmlkID0gKHByb3BzLCBwYXJlbnQsIG9uSXRlbUVuZGVkKT0+IHtcblxuXHR2YXIgdmlkZW9FbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgaW1hZ2VFbmRlZCA9IChpdGVtKT0+IHtcblx0XHRvbkl0ZW1FbmRlZChpdGVtKVxuXHRcdHNjb3BlLnRyYW5zaXRpb25PdXRJdGVtKGl0ZW0pXG5cdH1cblxuXHR2YXIgZ3JpZENvbnRhaW5lciA9IGRvbS5zZWxlY3QoXCIuZ3JpZC1jb250YWluZXJcIiwgcGFyZW50KVxuXHR2YXIgbGluZXNHcmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLmxpbmVzLWdyaWQtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgZ3JpZENoaWxkcmVuID0gZ3JpZENvbnRhaW5lci5jaGlsZHJlblxuXHR2YXIgbGluZXNIb3Jpem9udGFsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gZG9tLnNlbGVjdChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAudmVydGljYWwtbGluZXNcIiwgcGFyZW50KS5jaGlsZHJlblxuXHR2YXIgc2NvcGU7XG5cdHZhciBjdXJyZW50U2VhdDtcblx0dmFyIGNlbGxzID0gW11cblx0dmFyIHRvdGFsTnVtID0gcHJvcHMuZGF0YS5ncmlkLmxlbmd0aFxuXHR2YXIgdmlkZW9zID0gQXBwU3RvcmUuZ2V0SG9tZVZpZGVvcygpXG5cblx0dmFyIHNlYXRzID0gW1xuXHRcdDEsIDMsIDUsXG5cdFx0NywgOSwgMTEsXG5cdFx0MTUsIDE3LFxuXHRcdDIxLCAyMywgMjVcblx0XVxuXG5cdHZhciB2Q2FudmFzUHJvcHMgPSB7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdHZvbHVtZTogMCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRvbkVuZGVkOiB2aWRlb0VuZGVkXG5cdH1cblxuXHR2YXIgbUNlbGw7XG5cdHZhciBjb3VudGVyID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbE51bTsgaSsrKSB7XG5cdFx0dmFyIHZQYXJlbnQgPSBncmlkQ2hpbGRyZW5baV1cblx0XHRjZWxsc1tpXSA9IHVuZGVmaW5lZFxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2VhdHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmKGkgPT0gc2VhdHNbal0pIHtcblx0XHRcdFx0bUNlbGwgPSBtZWRpYUNlbGwodlBhcmVudCwgdmlkZW9zW2NvdW50ZXJdKVxuXHRcdFx0XHRjZWxsc1tpXSA9IG1DZWxsXG5cdFx0XHRcdGNvdW50ZXIrK1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciByZXNpemUgPSAoZ0dyaWQpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgb3JpZ2luYWxWaWRlb1NpemUgPSBBcHBDb25zdGFudHMuSE9NRV9WSURFT19TSVpFXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IGdHcmlkLmJsb2NrU2l6ZVxuXG5cdFx0bGluZXNHcmlkQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXG5cdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdLCBvcmlnaW5hbFZpZGVvU2l6ZVswXSwgb3JpZ2luYWxWaWRlb1NpemVbMV0pXG5cdFx0XG5cdFx0dmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHR2YXIgcGFyZW50LCBjZWxsO1xuXHRcdHZhciBjb3VudCA9IDBcblx0XHR2YXIgaGwsIHZsO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZ1Bvcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gaG9yaXpvbnRhbCBsaW5lc1xuXHRcdFx0aWYoaSA+IDApIHtcblx0XHRcdFx0aGwgPSBzY29wZS5saW5lcy5ob3Jpem9udGFsW2ktMV1cblx0XHRcdFx0aGwuc3R5bGUudG9wID0gYmxvY2tTaXplWzFdICogaSArICdweCdcblx0XHRcdFx0aGwuc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gdmVydGljYWwgbGluZXNcblx0XHRcdFx0aWYoaSA9PSAwICYmIGogPiAwKSB7XG5cdFx0XHRcdFx0dmwgPSBzY29wZS5saW5lcy52ZXJ0aWNhbFtqLTFdXG5cdFx0XHRcdFx0dmwuc3R5bGUubGVmdCA9IGJsb2NrU2l6ZVswXSAqIGogKyAncHgnXG5cdFx0XHRcdFx0dmwuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNlbGwgPSBzY29wZS5jZWxsc1tjb3VudF1cblx0XHRcdFx0aWYoY2VsbCAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsLnJlc2l6ZShibG9ja1NpemUsIHJvd1tqXSwgcmVzaXplVmFycylcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvdW50Kytcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBncmlkQ29udGFpbmVyLFxuXHRcdGNoaWxkcmVuOiBncmlkQ2hpbGRyZW4sXG5cdFx0Y2VsbHM6IGNlbGxzLFxuXHRcdG51bTogdG90YWxOdW0sXG5cdFx0cG9zaXRpb25zOiBbXSxcblx0XHRsaW5lczoge1xuXHRcdFx0aG9yaXpvbnRhbDogbGluZXNIb3Jpem9udGFsLFxuXHRcdFx0dmVydGljYWw6IGxpbmVzVmVydGljYWxcblx0XHR9LFxuXHRcdHJlc2l6ZTogcmVzaXplLFxuXHRcdGluaXQ6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5pbml0KClcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRyYW5zaXRpb25Jbkl0ZW06IChpbmRleCwgdHlwZSk9PiB7XG5cdFx0XHQvLyB2YXIgaXRlbSA9IHNjb3BlLmNlbGxzW2luZGV4XVxuXHRcdFx0Ly8gaXRlbS5zZWF0ID0gaW5kZXhcblxuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LmFkZCgnZW5hYmxlJylcblx0XHRcdFxuXHRcdFx0Ly8gaWYodHlwZSA9PSBBcHBDb25zdGFudHMuSVRFTV9WSURFTykge1xuXHRcdFx0Ly8gXHRpdGVtLnBsYXkoKVxuXHRcdFx0Ly8gfWVsc2V7XG5cdFx0XHQvLyBcdGl0ZW0udGltZW91dChpbWFnZUVuZGVkLCAyMDAwKVxuXHRcdFx0Ly8gXHRpdGVtLnNlZWsoVXRpbHMuUmFuZCgyLCAxMCwgMCkpXG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uT3V0SXRlbTogKGl0ZW0pPT4ge1xuXHRcdFx0Ly8gaXRlbS5jYW52YXMuY2xhc3NMaXN0LnJlbW92ZSgnZW5hYmxlJylcblxuXHRcdFx0Ly8gaXRlbS52aWRlby5jdXJyZW50VGltZSgwKVxuXHRcdFx0Ly8gaXRlbS5wYXVzZSgpXG5cdFx0XHQvLyBzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHQvLyBcdGl0ZW0uZHJhd09uY2UoKVxuXHRcdFx0Ly8gfSwgNTAwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihjZWxsc1tpXSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjZWxsc1tpXS5jbGVhcigpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiLypcblx0d2lkdGg6IFx0XHR3aWR0aCBvZiBncmlkXG5cdGhlaWdodDogXHRoZWlnaHQgb2YgZ3JpZFxuXHRjb2x1bW5zOiBcdG51bWJlciBvZiBjb2x1bW5zXG5cdHJvd3M6IFx0XHRudW1iZXIgb2Ygcm93c1xuXHR0eXBlOiBcdFx0dHlwZSBvZiB0aGUgYXJyYXlcblx0XHRcdFx0bGluZWFyIC0gd2lsbCBnaXZlIGFsbCB0aGUgY29scyBhbmQgcm93cyBwb3NpdGlvbiB0b2dldGhlciBvbmUgYWZ0ZXIgdGhlIG90aGVyXG5cdFx0XHRcdGNvbHNfcm93cyAtIHdpbGwgZ2l2ZSBzZXBhcmF0ZSByb3dzIGFycmF5cyB3aXRoIHRoZSBjb2xzIGluc2lkZSBcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm93WyBbY29sXSwgW2NvbF0sIFtjb2xdLCBbY29sXSBdXG4qL1xuXG5leHBvcnQgZGVmYXVsdCAod2lkdGgsIGhlaWdodCwgY29sdW1ucywgcm93cywgdHlwZSk9PiB7XG5cblx0dmFyIHQgPSB0eXBlIHx8ICdsaW5lYXInXG5cdHZhciBibG9ja1NpemUgPSBbIHdpZHRoIC8gY29sdW1ucywgaGVpZ2h0IC8gcm93cyBdXG5cdHZhciBibG9ja3NMZW4gPSByb3dzICogY29sdW1uc1xuXHR2YXIgcG9zaXRpb25zID0gW11cblx0XG5cdHZhciBwb3NYID0gMFxuXHR2YXIgcG9zWSA9IDBcblx0dmFyIGNvbHVtbkNvdW50ZXIgPSAwXG5cdHZhciByb3dzQ291bnRlciA9IDBcblx0dmFyIHJyID0gW11cblxuXHRzd2l0Y2godCkge1xuXHRcdGNhc2UgJ2xpbmVhcic6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdFx0XHRjb2x1bW5Db3VudGVyICs9IDFcblx0XHRcdFx0cG9zaXRpb25zW2ldID0gYlxuXHRcdFx0fTtcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnY29sc19yb3dzJzogXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrc0xlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cdFx0XHRcdHJyLnB1c2goYilcblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdGlmKGNvbHVtbkNvdW50ZXIgPj0gY29sdW1ucykge1xuXHRcdFx0XHRcdHBvc1ggPSAwXG5cdFx0XHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdFx0XHRjb2x1bW5Db3VudGVyID0gMFxuXHRcdFx0XHRcdHBvc2l0aW9uc1tyb3dzQ291bnRlcl0gPSByclxuXHRcdFx0XHRcdHJyID0gW11cblx0XHRcdFx0XHRyb3dzQ291bnRlcisrXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHR9XG5cblxuXHRyZXR1cm4ge1xuXHRcdHJvd3M6IHJvd3MsXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRibG9ja1NpemU6IGJsb2NrU2l6ZSxcblx0XHRwb3NpdGlvbnM6IHBvc2l0aW9uc1xuXHR9XG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgaGVhZGVyTGlua3MgPSAocGFyZW50KT0+IHtcblx0dmFyIHNjb3BlO1xuXG5cdHZhciBvblN1Yk1lbnVNb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLmFkZChlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblxuXHR2YXIgY2FtcGVyTGFiRWwgPSBkb20uc2VsZWN0KCcuY2FtcGVyLWxhYicsIHBhcmVudClcblx0dmFyIHNob3BFbCA9IGRvbS5zZWxlY3QoJy5zaG9wLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBtYXBFbCA9IGRvbS5zZWxlY3QoJy5tYXAtYnRuJywgcGFyZW50KVxuXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25TdWJNZW51TW91c2VFbnRlcilcblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblN1Yk1lbnVNb3VzZUxlYXZlKVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgcGFkZGluZyA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAvIDNcblxuXHRcdFx0dmFyIGNhbXBlckxhYkNzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIChBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjYpIC0gcGFkZGluZyAtIGRvbS5zaXplKGNhbXBlckxhYkVsKVswXSxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgc2hvcENzcyA9IHtcblx0XHRcdFx0bGVmdDogY2FtcGVyTGFiQ3NzLmxlZnQgLSBkb20uc2l6ZShzaG9wRWwpWzBdIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSBkb20uc2l6ZShtYXBFbClbMF0gLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblxuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUubGVmdCA9IGNhbXBlckxhYkNzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0Y2FtcGVyTGFiRWwuc3R5bGUudG9wID0gY2FtcGVyTGFiQ3NzLnRvcCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS5sZWZ0ID0gc2hvcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLnRvcCA9IHNob3BDc3MudG9wICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUubGVmdCA9IG1hcENzcy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bWFwRWwuc3R5bGUudG9wID0gbWFwQ3NzLnRvcCArICdweCdcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGVhZGVyTGlua3MiLCJpbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lcik9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgZWwgPSBkb20uc2VsZWN0KCcuZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lcicsIGNvbnRhaW5lcilcblx0Ly8gdmFyIGNhbnZhc2VzID0gZWwuY2hpbGRyZW5cblx0Ly8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHQvLyB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdHZhciBvbkltZ0xvYWRlZENhbGxiYWNrO1xuXHR2YXIgZ3JpZDtcblx0dmFyIGltYWdlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cblx0Ly8gdmFyIGl0ZW1zID0gW11cblx0Ly8gZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuXHQvLyBcdHZhciB0bXBDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBcblx0Ly8gXHRpdGVtc1tpXSA9IHtcblx0Ly8gXHRcdGNhbnZhczogY2FudmFzZXNbaV0sXG5cdC8vIFx0XHRjdHg6IGNhbnZhc2VzW2ldLmdldENvbnRleHQoJzJkJyksXG5cdC8vIFx0XHR0bXBDYW52YXM6IHRtcENhbnZhcyxcblx0Ly8gXHRcdHRtcENvbnRleHQ6IHRtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cdC8vIFx0fVxuXHQvLyB9XG5cblx0dmFyIG9uSW1nUmVhZHkgPSAoZXJyb3IsIGkpPT4ge1xuXHRcdGltYWdlID0gaVxuXHRcdGRvbS50cmVlLmFkZChlbCwgaW1hZ2UpXG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoZ3JpZClcblx0XHRpZihvbkltZ0xvYWRlZENhbGxiYWNrKSBvbkltZ0xvYWRlZENhbGxiYWNrKClcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKGdHcmlkKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0Z3JpZCA9IGdHcmlkXG5cblx0XHRcdGlmKCFpc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cdFx0XHRpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRcdGltYWdlLnN0eWxlLndpZHRoID0gcmVzaXplVmFyc0JnLndpZHRoICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFyc0JnLmhlaWdodCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnNCZy50b3AgKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS5sZWZ0ID0gcmVzaXplVmFyc0JnLmxlZnQgKyAncHgnXG5cblx0XHRcdC8vIHZhciBibG9ja1NpemUgPSBnR3JpZC5ibG9ja1NpemVcblx0XHRcdC8vIHZhciBpbWFnZUJsb2NrU2l6ZSA9IFsgcmVzaXplVmFyc0JnLndpZHRoIC8gZ0dyaWQuY29sdW1ucywgcmVzaXplVmFyc0JnLmhlaWdodCAvIGdHcmlkLnJvd3MgXVxuXHRcdFx0Ly8gdmFyIGdQb3MgPSBnR3JpZC5wb3NpdGlvbnNcblx0XHRcdC8vIHZhciBjb3VudCA9IDBcblx0XHRcdC8vIHZhciBjYW52YXMsIGN0eCwgdG1wQ29udGV4dCwgdG1wQ2FudmFzO1xuXG5cdFx0XHQvLyBmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdC8vIFx0dmFyIHJvdyA9IGdQb3NbaV1cblxuXHRcdFx0Ly8gXHRmb3IgKHZhciBqID0gMDsgaiA8IHJvdy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0Ly8gXHRcdGNhbnZhcyA9IGl0ZW1zW2NvdW50XS5jYW52YXNcblx0XHRcdC8vIFx0XHRjdHggPSBpdGVtc1tjb3VudF0uY3R4XG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dCA9IGl0ZW1zW2NvdW50XS50bXBDb250ZXh0XG5cdFx0XHQvLyBcdFx0dG1wQ2FudmFzID0gaXRlbXNbY291bnRdLnRtcENhbnZhc1xuXG5cdFx0XHQvLyBcdFx0Ly8gYmxvY2sgZGl2c1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSArICdweCdcblx0XHRcdC8vIFx0XHRjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS5sZWZ0ID0gcm93W2pdWzBdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS50b3AgPSByb3dbal1bMV0gKyAncHgnXG5cblx0XHRcdC8vIFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIGJsb2NrU2l6ZVswXSwgYmxvY2tTaXplWzFdKVxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQuc2F2ZSgpXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5jbGVhclJlY3QoMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIGltYWdlQmxvY2tTaXplWzBdKmosIGltYWdlQmxvY2tTaXplWzFdKmksIGltYWdlQmxvY2tTaXplWzBdLCBpbWFnZUJsb2NrU2l6ZVsxXSwgMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LnJlc3RvcmUoKVxuXHRcdFx0Ly8gXHRcdGN0eC5kcmF3SW1hZ2UodG1wQ2FudmFzLCAwLCAwKVxuXG5cdFx0XHQvLyBcdFx0Y291bnQrK1xuXHRcdFx0Ly8gXHR9XG5cdFx0XHQvLyB9XG5cdFx0fSxcblx0XHRsb2FkOiAodXJsLCBjYik9PiB7XG5cdFx0XHRvbkltZ0xvYWRlZENhbGxiYWNrID0gY2Jcblx0XHRcdGltZyh1cmwsIG9uSW1nUmVhZHkpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRlbCA9IG51bGxcblx0XHRcdGltYWdlID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhLCBtb3VzZSwgb25Nb3VzZUV2ZW50c0hhbmRsZXIpPT4ge1xuXG5cdHZhciBhbmltUGFyYW1zID0gKHBhcmVudCwgZWwsIGltZ1dyYXBwZXIpPT4ge1xuXHRcdHZhciB0bCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGwuZnJvbVRvKGltZ1dyYXBwZXIsIDEsIHtzY2FsZVg6MS43LCBzY2FsZVk6MS4zLCByb3RhdGlvbjonMmRlZycsIHk6LTIwLCBvcGFjaXR5OjAsIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnLCBmb3JjZTNEOnRydWUgfSwgeyBzY2FsZVg6MSwgc2NhbGVZOjEsIHJvdGF0aW9uOicwZGVnJywgeTowLCBvcGFjaXR5OjEsIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6QmFjay5lYXNlSW5PdXR9LCAwKVxuXHRcdHRsLnBhdXNlKDApXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0aW1nV3JhcHBlcjogaW1nV3JhcHBlcixcblx0XHRcdHRsOiB0bCxcblx0XHRcdGVsOiBlbCxcblx0XHRcdHRpbWU6IDAsXG5cdFx0XHRwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0ZnBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIHNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHQvLyBmc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIGlzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0dmVsb2NpdHk6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIHZlbG9jaXR5U2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdHJvdGF0aW9uOiAwLFxuXHRcdFx0Y29uZmlnOiB7XG5cdFx0XHRcdGxlbmd0aDogMCxcblx0XHRcdFx0c3ByaW5nOiAwLjgsXG5cdFx0XHRcdGZyaWN0aW9uOiAwLjRcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYWluLWJ0bnMtd3JhcHBlcicsIGNvbnRhaW5lcilcblx0dmFyIHNob3BCdG4gPSBkb20uc2VsZWN0KCcjc2hvcC1idG4nLCBlbClcblx0dmFyIGZ1bkJ0biA9IGRvbS5zZWxlY3QoJyNmdW4tZmFjdC1idG4nLCBlbClcblx0dmFyIHNob3BJbWdXcmFwcGVyICA9IGRvbS5zZWxlY3QoJy5pbWctd3JhcHBlcicsIHNob3BCdG4pXG5cdHZhciBmdW5JbWdXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmltZy13cmFwcGVyJywgZnVuQnRuKVxuXHR2YXIgc2hvcFNpemUsIGZ1blNpemU7XG5cdHZhciBsb2FkQ291bnRlciA9IDBcblx0dmFyIGJ1dHRvblNpemUgPSBbMCwgMF1cblx0dmFyIHNwcmluZ1RvID0gVXRpbHMuU3ByaW5nVG9cblx0dmFyIHRyYW5zbGF0ZSA9IFV0aWxzLlRyYW5zbGF0ZVxuXHR2YXIgc2hvcEFuaW0sIGZ1bkFuaW0sIGN1cnJlbnRBbmltO1xuXHR2YXIgYnV0dG9ucyA9IHtcblx0XHQnc2hvcC1idG4nOiB7XG5cdFx0XHRhbmltOiB1bmRlZmluZWRcblx0XHR9LFxuXHRcdCdmdW4tZmFjdC1idG4nOiB7XG5cdFx0XHRhbmltOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblxuXHR2YXIgc2hvcEltZyA9IGltZygnaW1hZ2Uvc2hvcC5wbmcnLCAoKT0+IHtcblx0XHRzaG9wQW5pbSA9IGFuaW1QYXJhbXMoc2hvcEJ0biwgc2hvcEltZywgc2hvcEltZ1dyYXBwZXIpXG5cdFx0YnV0dG9uc1snc2hvcC1idG4nXS5hbmltID0gc2hvcEFuaW1cblx0XHRzaG9wU2l6ZSA9IFtzaG9wSW1nLndpZHRoLCBzaG9wSW1nLmhlaWdodF1cblx0XHRkb20udHJlZS5hZGQoc2hvcEltZ1dyYXBwZXIsIHNob3BJbWcpXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblx0dmFyIGZ1bkltZyA9IGltZygnaW1hZ2UvZnVuLWZhY3RzLnBuZycsICgpPT4ge1xuXHRcdGZ1bkFuaW0gPSBhbmltUGFyYW1zKGZ1bkJ0biwgZnVuSW1nLCBmdW5JbWdXcmFwcGVyKVxuXHRcdGJ1dHRvbnNbJ2Z1bi1mYWN0LWJ0biddLmFuaW0gPSBmdW5BbmltXG5cdFx0ZnVuU2l6ZSA9IFtmdW5JbWcud2lkdGgsIGZ1bkltZy5oZWlnaHRdXG5cdFx0ZG9tLnRyZWUuYWRkKGZ1bkltZ1dyYXBwZXIsIGZ1bkltZylcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oZnVuQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oZnVuQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oZnVuQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblxuXHR2YXIgdXBkYXRlQW5pbSA9IChhbmltKT0+IHtcblx0XHRpZihhbmltID09IHVuZGVmaW5lZCkgcmV0dXJuXG5cdFx0YW5pbS50aW1lICs9IDAuMVxuXHRcdGFuaW0uZnBvc2l0aW9uLnggPSBhbmltLmlwb3NpdGlvbi54XG5cdFx0YW5pbS5mcG9zaXRpb24ueSA9IGFuaW0uaXBvc2l0aW9uLnlcblx0XHRhbmltLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiA4MFxuXHRcdGFuaW0uZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDIwMFxuXG5cdFx0c3ByaW5nVG8oYW5pbSwgYW5pbS5mcG9zaXRpb24sIDEpXG5cdFx0YW5pbS5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbS5jb25maWcubGVuZ3RoKSAqIDAuMVxuXHRcdFxuXHRcdHRyYW5zbGF0ZShhbmltLmVsLCBhbmltLnBvc2l0aW9uLnggKyBhbmltLnZlbG9jaXR5LngsIGFuaW0ucG9zaXRpb24ueSArIGFuaW0udmVsb2NpdHkueSwgMSlcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgbWlkVyA9IHdpbmRvd1cgPj4gMVxuXHRcdFx0dmFyIHNjYWxlID0gMC44XG5cdFx0XHRcblx0XHRcdGJ1dHRvblNpemVbMF0gPSBtaWRXICogMC45XG5cdFx0XHRidXR0b25TaXplWzFdID0gd2luZG93SFxuXG5cdFx0XHRpZihzaG9wU2l6ZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS53aWR0aCA9IGJ1dHRvblNpemVbMF0gKyAncHgnXG5cdFx0XHRcdHNob3BCdG4uc3R5bGUuaGVpZ2h0ID0gYnV0dG9uU2l6ZVsxXSArICdweCdcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS5sZWZ0ID0gKG1pZFcgPj4gMSkgLSAoYnV0dG9uU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChidXR0b25TaXplWzFdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRcblx0XHRcdFx0c2hvcEltZ1dyYXBwZXIuc3R5bGUud2lkdGggPSBzaG9wU2l6ZVswXSpzY2FsZSArICdweCdcblx0XHRcdFx0c2hvcEltZ1dyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gc2hvcFNpemVbMV0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdHNob3BJbWdXcmFwcGVyLnN0eWxlLmxlZnQgPSAoYnV0dG9uU2l6ZVswXSA+PiAxKSAtIChzaG9wU2l6ZVswXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdFx0c2hvcEltZ1dyYXBwZXIuc3R5bGUudG9wID0gKGJ1dHRvblNpemVbMV0gPj4gMSkgLSAoc2hvcFNpemVbMV0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHR9XG5cdFx0XHRpZihmdW5TaXplICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUud2lkdGggPSBidXR0b25TaXplWzBdICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUuaGVpZ2h0ID0gYnV0dG9uU2l6ZVsxXSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLmxlZnQgPSBtaWRXICsgKG1pZFcgPj4gMSkgLSAoYnV0dG9uU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0ZnVuQnRuLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGJ1dHRvblNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdFx0ZnVuSW1nV3JhcHBlci5zdHlsZS53aWR0aCA9IGZ1blNpemVbMF0qc2NhbGUgKyAncHgnXG5cdFx0XHRcdGZ1bkltZ1dyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gZnVuU2l6ZVsxXSpzY2FsZSArICdweCdcblx0XHRcdFx0ZnVuSW1nV3JhcHBlci5zdHlsZS5sZWZ0ID0gKGJ1dHRvblNpemVbMF0gPj4gMSkgLSAoZnVuU2l6ZVswXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdFx0ZnVuSW1nV3JhcHBlci5zdHlsZS50b3AgPSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSAtIChmdW5TaXplWzFdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b3ZlcjogKGlkKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRjdXJyZW50QW5pbSA9IGJ1dHRvbnNbaWRdLmFuaW1cblx0XHRcdGN1cnJlbnRBbmltLnRsLnRpbWVTY2FsZSgyLjYpLnBsYXkoMClcblx0XHRcdGN1cnJlbnRBbmltLmNvbmZpZy5sZW5ndGggPSA0MDBcblx0XHR9LFxuXHRcdG91dDogKGlkKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRjdXJyZW50QW5pbSA9IGJ1dHRvbnNbaWRdLmFuaW1cblx0XHRcdGN1cnJlbnRBbmltLnRsLnRpbWVTY2FsZSgzKS5yZXZlcnNlKClcblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNBY3RpdmUpIHJldHVyblxuXHRcdFx0aWYoc2hvcEFuaW0gPT0gdW5kZWZpbmVkKSByZXR1cm4gXG5cdFx0XHR1cGRhdGVBbmltKHNob3BBbmltKVxuXHRcdFx0dXBkYXRlQW5pbShmdW5BbmltKVxuXHRcdH0sXG5cdFx0YWN0aXZhdGU6ICgpPT4ge1xuXHRcdFx0c2NvcGUuaXNBY3RpdmUgPSB0cnVlXG5cdFx0fSxcblx0XHRkaXNhY3RpdmF0ZTogKCk9PiB7XG5cdFx0XHRzY29wZS5pc0FjdGl2ZSA9IGZhbHNlXG5cdFx0XHRzaG9wQW5pbS50bC50aW1lU2NhbGUoMykucmV2ZXJzZSgpXG5cdFx0XHRmdW5BbmltLnRsLnRpbWVTY2FsZSgzKS5yZXZlcnNlKClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHNob3BBbmltLnRsLmNsZWFyKClcblx0XHRcdGZ1bkFuaW0udGwuY2xlYXIoKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihzaG9wQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnbW91c2VlbnRlcicsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRzaG9wQW5pbSA9IG51bGxcblx0XHRcdGZ1bkFuaW0gPSBudWxsXG5cdFx0XHRidXR0b25zID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnTWFwX2hicydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgdHlwZSkgPT4ge1xuXG5cdHZhciBvbkRvdENsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUudGFyZ2V0LmlkXG5cdFx0dmFyIHBhcmVudElkID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudC1pZCcpXG5cdFx0Um91dGVyLnNldEhhc2gocGFyZW50SWQgKyAnLycgKyBpZClcblx0fVxuXG5cdC8vIHJlbmRlciBtYXBcblx0dmFyIG1hcFdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWFwLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdHZhciB0ID0gdGVtcGxhdGUoKVxuXHRlbC5pbm5lckhUTUwgPSB0XG5cdGRvbS50cmVlLmFkZChtYXBXcmFwcGVyLCBlbClcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBkaXIsIHN0ZXBFbDtcblx0dmFyIHNlbGVjdGVkRG90cyA9IFtdO1xuXHR2YXIgY3VycmVudFBhdGhzLCBmaWxsTGluZSwgZGFzaGVkTGluZSwgc3RlcFRvdGFsTGVuID0gMDtcblx0dmFyIHByZXZpb3VzSGlnaGxpZ2h0SW5kZXggPSB1bmRlZmluZWQ7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIHRpdGxlc1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudGl0bGVzLXdyYXBwZXInLCBlbClcblx0dmFyIG1hcGRvdHMgPSBkb20uc2VsZWN0LmFsbCgnI21hcC1kb3RzIC5kb3QtcGF0aCcsIGVsKVxuXHR2YXIgZm9vdHN0ZXBzID0gZG9tLnNlbGVjdC5hbGwoJyNmb290c3RlcHMgZycsIGVsKVxuXG5cdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXBkb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0ZG9tLmV2ZW50Lm9uKGRvdCwgJ2NsaWNrJywgb25Eb3RDbGljaylcblx0XHR9O1xuXHR9XG5cblx0dmFyIHRpdGxlcyA9IHtcblx0XHQnZGVpYSc6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuZGVpYScsIHRpdGxlc1dyYXBwZXIpXG5cdFx0fSxcblx0XHQnZXMtdHJlbmMnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmVzLXRyZW5jJywgdGl0bGVzV3JhcHBlcilcblx0XHR9LFxuXHRcdCdhcmVsbHVmJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5hcmVsbHVmJywgdGl0bGVzV3JhcHBlcilcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiB0aXRsZVBvc1gocGFyZW50VywgdmFsKSB7XG5cdFx0cmV0dXJuIChwYXJlbnRXIC8gQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XKSAqIHZhbFxuXHR9XG5cdGZ1bmN0aW9uIHRpdGxlUG9zWShwYXJlbnRILCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudEggLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpICogdmFsXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgbWFwVyA9IDY5MywgbWFwSCA9IDY0NVxuXHRcdFx0dmFyIG1hcFNpemUgPSBbXVxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHdpbmRvd1cqMC40Nywgd2luZG93SCowLjQ3LCBtYXBXLCBtYXBIKVxuXHRcdFx0bWFwU2l6ZVswXSA9IG1hcFcgKiByZXNpemVWYXJzLnNjYWxlXG5cdFx0XHRtYXBTaXplWzFdID0gbWFwSCAqIHJlc2l6ZVZhcnMuc2NhbGVcblxuXHRcdFx0ZWwuc3R5bGUud2lkdGggPSBtYXBTaXplWzBdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUuaGVpZ2h0ID0gbWFwU2l6ZVsxXSArICdweCdcblx0XHRcdGVsLnN0eWxlLmxlZnQgPSAod2luZG93VyA+PiAxKSAtIChtYXBTaXplWzBdID4+IDEpIC0gNDAgKyAncHgnXG5cdFx0XHRlbC5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChtYXBTaXplWzFdID4+IDEpICsgJ3B4J1xuXG5cdFx0XHR0aXRsZXNbJ2RlaWEnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDc0MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2RlaWEnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgMjUwKSArICdweCdcblx0XHRcdHRpdGxlc1snZXMtdHJlbmMnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDEyODApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCA2OTApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydhcmVsbHVmJ10uZWwuc3R5bGUubGVmdCA9IHRpdGxlUG9zWChtYXBTaXplWzBdLCAzNjApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydhcmVsbHVmJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDQwMCkgKyAncHgnXG5cdFx0fSxcblx0XHRoaWdobGlnaHREb3RzOiAob2xkSGFzaCwgbmV3SGFzaCk9PiB7XG5cdFx0XHRzZWxlY3RlZERvdHMgPSBbXVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXBkb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRcdHZhciBpZCA9IGRvdC5pZFxuXHRcdFx0XHR2YXIgcGFyZW50SWQgPSBkb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudC1pZCcpXG5cdFx0XHRcdGlmKGlkID09IG9sZEhhc2gudGFyZ2V0ICYmIHBhcmVudElkID09IG9sZEhhc2gucGFyZW50KSBzZWxlY3RlZERvdHMucHVzaChkb3QpXG5cdFx0XHRcdGlmKGlkID09IG5ld0hhc2gudGFyZ2V0ICYmIHBhcmVudElkID09IG5ld0hhc2gucGFyZW50KSAgc2VsZWN0ZWREb3RzLnB1c2goZG90KVxuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZERvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IHNlbGVjdGVkRG90c1tpXVxuXHRcdFx0XHRkb20uY2xhc3Nlcy5hZGQoZG90LCAnYW5pbWF0ZScpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0aGlnaGxpZ2h0OiAob2xkSGFzaCwgbmV3SGFzaCk9PiB7XG5cdFx0XHR2YXIgb2xkSWQgPSBvbGRIYXNoLnRhcmdldFxuXHRcdFx0dmFyIG5ld0lkID0gbmV3SGFzaC50YXJnZXRcblx0XHRcdHZhciBjdXJyZW50ID0gb2xkSWQgKyAnLScgKyBuZXdJZFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmb290c3RlcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHN0ZXAgPSBmb290c3RlcHNbaV1cblx0XHRcdFx0dmFyIGlkID0gc3RlcC5pZFxuXHRcdFx0XHRpZihpZC5pbmRleE9mKG9sZElkKSA+IC0xICYmIGlkLmluZGV4T2YobmV3SWQpID4gLTEpIHtcblx0XHRcdFx0XHQvLyBjaGVjayBpZiB0aGUgbGFzdCBvbmVcblx0XHRcdFx0XHRpZihpID09IHByZXZpb3VzSGlnaGxpZ2h0SW5kZXgpIHN0ZXBFbCA9IGZvb3RzdGVwc1tmb290c3RlcHMubGVuZ3RoLTFdXG5cdFx0XHRcdFx0ZWxzZSBzdGVwRWwgPSBzdGVwXG5cblx0XHRcdFx0XHRkaXIgPSBpZC5pbmRleE9mKGN1cnJlbnQpID4gLTEgPyBBcHBDb25zdGFudHMuRk9SV0FSRCA6IEFwcENvbnN0YW50cy5CQUNLV0FSRFxuXHRcdFx0XHRcdHByZXZpb3VzSGlnaGxpZ2h0SW5kZXggPSBpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHNjb3BlLmhpZ2hsaWdodERvdHMob2xkSGFzaCwgbmV3SGFzaClcblxuXHRcdFx0Y3VycmVudFBhdGhzID0gZG9tLnNlbGVjdC5hbGwoJ3BhdGgnLCBzdGVwRWwpXG5cdFx0XHRkYXNoZWRMaW5lID0gY3VycmVudFBhdGhzWzBdXG5cblx0XHRcdC8vIGNob29zZSBwYXRoIGRlcGVuZHMgb2YgZm9vdHN0ZXAgZGlyZWN0aW9uXG5cdFx0XHRpZihkaXIgPT0gQXBwQ29uc3RhbnRzLkZPUldBUkQpIHtcblx0XHRcdFx0ZmlsbExpbmUgPSBjdXJyZW50UGF0aHNbMV1cblx0XHRcdFx0Y3VycmVudFBhdGhzWzJdLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0ZmlsbExpbmUgPSBjdXJyZW50UGF0aHNbMl1cblx0XHRcdFx0Y3VycmVudFBhdGhzWzFdLnN0eWxlLm9wYWNpdHkgPSAwXG5cdFx0XHR9XG5cblx0XHRcdHN0ZXBFbC5zdHlsZS5vcGFjaXR5ID0gMVxuXG5cdFx0XHQvLyBmaW5kIHRvdGFsIGxlbmd0aCBvZiBzaGFwZVxuXHRcdFx0c3RlcFRvdGFsTGVuID0gZmlsbExpbmUuZ2V0VG90YWxMZW5ndGgoKVxuXHRcdFx0ZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNob2Zmc2V0J10gPSAwXG5cdFx0XHRmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hhcnJheSddID0gc3RlcFRvdGFsTGVuXG5cdFx0XHRcblx0XHRcdC8vIHN0YXJ0IGFuaW1hdGlvbiBvZiBkYXNoZWQgbGluZVxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGRhc2hlZExpbmUsICdhbmltYXRlJylcblxuXHRcdFx0Ly8gc3RhcnQgYW5pbWF0aW9uXG5cdFx0XHRkb20uY2xhc3Nlcy5hZGQoZmlsbExpbmUsICdhbmltYXRlJylcblxuXHRcdH0sXG5cdFx0cmVzZXRIaWdobGlnaHQ6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0XHRzdGVwRWwuc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdFx0Y3VycmVudFBhdGhzWzFdLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdGN1cnJlbnRQYXRoc1syXS5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZmlsbExpbmUsICdhbmltYXRlJylcblx0XHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGRhc2hlZExpbmUsICdhbmltYXRlJylcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZERvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgZG90ID0gc2VsZWN0ZWREb3RzW2ldXG5cdFx0XHRcdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGRvdCwgJ2FuaW1hdGUnKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSwgMClcblx0XHR9LFxuXHRcdHVwZGF0ZVByb2dyZXNzOiAocHJvZ3Jlc3MpPT4ge1xuXHRcdFx0aWYoZmlsbExpbmUgPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHRcdHZhciBkYXNoT2Zmc2V0ID0gKHByb2dyZXNzIC8gMSkgKiBzdGVwVG90YWxMZW5cblx0XHRcdGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaG9mZnNldCddID0gZGFzaE9mZnNldFxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXBkb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0XHRkb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkRvdENsaWNrKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0dGl0bGVzID0gbnVsbFxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2NvcGVcbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCB2aWRlb1VybCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgc3BsaXR0ZXIgPSB2aWRlb1VybC5zcGxpdCgnLycpXG5cdHZhciBuYW1lID0gc3BsaXR0ZXJbc3BsaXR0ZXIubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0dmFyIGltZ0lkID0gJ2hvbWUtdmlkZW8tc2hvdHMvJyArIG5hbWVcblx0dmFyIG1DYW52YXMgPSBtaW5pVmlkZW8oe1xuXHRcdGxvb3A6IHRydWUsXG5cdFx0YXV0b3BsYXk6IGZhbHNlXG5cdH0pXG5cdHZhciBzaXplLCBwb3NpdGlvbiwgcmVzaXplVmFycztcblx0dmFyIGltZztcblxuXHR2YXIgb25Nb3VzZUVudGVyID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlmKG1DYW52YXMuaXNMb2FkZWQpIHtcblx0XHRcdG1DYW52YXMucGxheSgwKVxuXHRcdH1lbHNle1xuXHRcdFx0bUNhbnZhcy5sb2FkKHZpZGVvVXJsLCAoKT0+IHtcblx0XHRcdFx0bUNhbnZhcy5wbGF5KClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uTW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRtQ2FudmFzLnBhdXNlKClcblx0fVxuXG5cdHZhciBvbkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHR9XG5cblx0dmFyIGluaXQgPSAoKT0+IHtcblx0XHR2YXIgaW1nVXJsID0gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlVVJMKGltZ0lkKSBcblx0XHRpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuXHRcdGltZy5zcmMgPSBpbWdVcmxcblx0XHRkb20udHJlZS5hZGQoY29udGFpbmVyLCBpbWcpXG5cdFx0ZG9tLnRyZWUuYWRkKGNvbnRhaW5lciwgbUNhbnZhcy5lbClcblxuXHRcdGRvbS5ldmVudC5vbihjb250YWluZXIsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdGRvbS5ldmVudC5vbihjb250YWluZXIsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdGRvbS5ldmVudC5vbihjb250YWluZXIsICdjbGljaycsIG9uQ2xpY2spXG5cblx0XHRzY29wZS5pc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNSZWFkeTogZmFsc2UsXG5cdFx0aW5pdDogaW5pdCxcblx0XHRyZXNpemU6IChzLCBwLCBydik9PiB7XG5cblx0XHRcdHNpemUgPSBzID09IHVuZGVmaW5lZCA/IHNpemUgOiBzXG5cdFx0XHRwb3NpdGlvbiA9IHAgPT0gdW5kZWZpbmVkID8gcG9zaXRpb24gOiBwXG5cdFx0XHRyZXNpemVWYXJzID0gcnYgPT0gdW5kZWZpbmVkID8gcmVzaXplVmFycyA6IHJ2XG5cblx0XHRcdGlmKCFzY29wZS5pc1JlYWR5KSByZXR1cm5cblxuXHRcdFx0Y29udGFpbmVyLnN0eWxlLndpZHRoID0gc2l6ZVswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBzaXplWzFdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmxlZnQgPSBwb3NpdGlvblswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS50b3AgPSBwb3NpdGlvblsxXSArICdweCdcblxuXHRcdFx0aW1nLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdGltZy5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdGltZy5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0XHQvLyBpbWcuc3R5bGUud2lkdGggPSByZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0Ly8gaW1nLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0Ly8gaW1nLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cdFx0XHQvLyBpbWcuc3R5bGUudG9wID0gcmVzaXplVmFycy50b3AgKyAncHgnXG5cblx0XHRcdG1DYW52YXMuZWwuc3R5bGUud2lkdGggPSByZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bUNhbnZhcy5lbC5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdG1DYW52YXMuZWwuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnMubGVmdCArICdweCdcblx0XHRcdG1DYW52YXMuZWwuc3R5bGUudG9wID0gcmVzaXplVmFycy50b3AgKyAncHgnXG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGRvbS5ldmVudC5vZmYoY29udGFpbmVyLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoY29udGFpbmVyLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoY29udGFpbmVyLCAnY2xpY2snLCBvbkNsaWNrKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuZXhwb3J0IGRlZmF1bHQgKHByb3BzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciB2aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG5cdHZhciBvblJlYWR5Q2FsbGJhY2s7XG5cdHZhciBzaXplID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH1cblx0dmFyIGVMaXN0ZW5lcnMgPSBbXVxuXG5cdHZhciBvbkNhblBsYXkgPSAoKT0+e1xuXHRcdHNjb3BlLmlzTG9hZGVkID0gdHJ1ZVxuXHRcdGlmKHByb3BzLmF1dG9wbGF5KSB2aWRlby5wbGF5KClcblx0XHRpZihwcm9wcy52b2x1bWUgIT0gdW5kZWZpbmVkKSB2aWRlby52b2x1bWUgPSBwcm9wcy52b2x1bWVcblx0XHRzaXplLndpZHRoID0gdmlkZW8udmlkZW9XaWR0aFxuXHRcdHNpemUuaGVpZ2h0ID0gdmlkZW8udmlkZW9IZWlnaHRcblx0XHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuICAgICAgICBvblJlYWR5Q2FsbGJhY2soc2NvcGUpXG5cdH1cblxuXHR2YXIgcGxheSA9ICh0aW1lKT0+e1xuXHRcdGlmKHRpbWUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzY29wZS5zZWVrKHRpbWUpXG5cdFx0fVxuICAgIFx0c2NvcGUuaXNQbGF5aW5nID0gdHJ1ZVxuICAgIFx0dmlkZW8ucGxheSgpXG4gICAgfVxuXG4gICAgdmFyIHNlZWsgPSAodGltZSk9PiB7XG4gICAgXHR0cnkge1xuICAgIFx0XHR2aWRlby5jdXJyZW50VGltZSA9IHRpbWVcblx0XHR9XG5cdFx0Y2F0Y2goZXJyKSB7XG5cdFx0fVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICh0aW1lKT0+e1xuICAgIFx0dmlkZW8ucGF1c2UoKVxuICAgIFx0aWYodGltZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHNjb3BlLnNlZWsodGltZSlcblx0XHR9XG4gICAgXHRzY29wZS5pc1BsYXlpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIHZhciB2b2x1bWUgPSAodmFsKT0+IHtcbiAgICBcdGlmKHZhbCkge1xuICAgIFx0XHRzY29wZS5lbC52b2x1bWUgPSB2YWxcbiAgICBcdH1lbHNle1xuICAgIFx0XHRyZXR1cm4gc2NvcGUuZWwudm9sdW1lXG4gICAgXHR9XG4gICAgfVxuXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gKHZhbCk9PiB7XG4gICAgXHRpZih2YWwpIHtcbiAgICBcdFx0c2NvcGUuZWwuY3VycmVudFRpbWUgPSB2YWxcbiAgICBcdH1lbHNle1xuICAgIFx0XHRyZXR1cm4gc2NvcGUuZWwuY3VycmVudFRpbWVcbiAgICBcdH1cbiAgICB9XG5cbiAgICB2YXIgd2lkdGggPSAoKT0+IHtcbiAgICBcdHJldHVybiBzY29wZS5lbC52aWRlb1dpZHRoXG4gICAgfVxuXG4gICAgdmFyIGhlaWdodCA9ICgpPT4ge1xuICAgIFx0cmV0dXJuIHNjb3BlLmVsLnZpZGVvSGVpZ2h0XHRcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgIFx0aWYocHJvcHMubG9vcCkgcGxheSgpXG4gICAgfVxuXG5cdHZhciBhZGRUbyA9IChwKT0+IHtcblx0XHRzY29wZS5wYXJlbnQgPSBwXG5cdFx0ZG9tLnRyZWUuYWRkKHNjb3BlLnBhcmVudCwgdmlkZW8pXG5cdH1cblxuXHR2YXIgb24gPSAoZXZlbnQsIGNiKT0+IHtcblx0XHRlTGlzdGVuZXJzLnB1c2goe2V2ZW50OmV2ZW50LCBjYjpjYn0pXG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG5cdH1cblxuXHR2YXIgb2ZmID0gKGV2ZW50LCBjYik9PiB7XG5cdFx0Zm9yICh2YXIgaSBpbiBlTGlzdGVuZXJzKSB7XG5cdFx0XHR2YXIgZSA9IGVMaXN0ZW5lcnNbaV1cblx0XHRcdGlmKGUuZXZlbnQgPT0gZXZlbnQgJiYgZS5jYiA9PSBjYikge1xuXHRcdFx0XHRlTGlzdGVuZXJzLnNwbGljZShpLCAxKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdHZhciBjbGVhckFsbEV2ZW50cyA9ICgpPT4ge1xuXHQgICAgZm9yICh2YXIgaSBpbiBlTGlzdGVuZXJzKSB7XG5cdCAgICBcdHZhciBlID0gZUxpc3RlbmVyc1tpXVxuXHQgICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKGUuZXZlbnQsIGUuY2IpO1xuXHQgICAgfVxuXHQgICAgZUxpc3RlbmVycy5sZW5ndGggPSAwXG5cdCAgICBlTGlzdGVuZXJzID0gbnVsbFxuXHR9XG5cblx0dmFyIGNsZWFyID0gKCk9PiB7XG4gICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpO1xuXHQgICAgc2NvcGUuY2xlYXJBbGxFdmVudHMoKVxuXHQgICAgc2l6ZSA9IG51bGxcblx0ICAgIHZpZGVvID0gbnVsbFxuICAgIH1cblxuXHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cblx0c2NvcGUgPSB7XG5cdFx0cGFyZW50OiB1bmRlZmluZWQsXG5cdFx0ZWw6IHZpZGVvLFxuXHRcdHNpemU6IHNpemUsXG5cdFx0cGxheTogcGxheSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHR2b2x1bWU6IHZvbHVtZSxcblx0XHRjdXJyZW50VGltZTogY3VycmVudFRpbWUsXG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdGFkZFRvOiBhZGRUbyxcblx0XHRvbjogb24sXG5cdFx0b2ZmOiBvZmYsXG5cdFx0Y2xlYXI6IGNsZWFyLFxuXHRcdGNsZWFyQWxsRXZlbnRzOiBjbGVhckFsbEV2ZW50cyxcblx0XHRpc1BsYXlpbmc6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuXHRcdGlzTG9hZGVkOiBmYWxzZSxcblx0XHRsb2FkOiAoc3JjLCBjYWxsYmFjayk9PiB7XG5cdFx0XHRvblJlYWR5Q2FsbGJhY2sgPSBjYWxsYmFja1xuXHRcdFx0dmlkZW8uc3JjID0gc3JjXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRpcHR5cXVlUGFydCBmcm9tICdkaXB0eXF1ZS1wYXJ0J1xuaW1wb3J0IGNoYXJhY3RlciBmcm9tICdjaGFyYWN0ZXInXG5pbXBvcnQgZnVuRmFjdCBmcm9tICdmdW4tZmFjdC1ob2xkZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGFycm93c1dyYXBwZXIgZnJvbSAnYXJyb3dzLXdyYXBwZXInXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgc2VsZmllU3RpY2sgZnJvbSAnc2VsZmllLXN0aWNrJ1xuaW1wb3J0IG1haW5CdG5zIGZyb20gJ21haW4tZGlwdHlxdWUtYnRucydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlwdHlxdWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblxuXHRcdHZhciBuZXh0RGlwdHlxdWUgPSBBcHBTdG9yZS5nZXROZXh0RGlwdHlxdWUoKVxuXHRcdHZhciBwcmV2aW91c0RpcHR5cXVlID0gQXBwU3RvcmUuZ2V0UHJldmlvdXNEaXB0eXF1ZSgpXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wYWdlJ10gPSBuZXh0RGlwdHlxdWVcblx0XHRwcm9wcy5kYXRhWydwcmV2aW91cy1wYWdlJ10gPSBwcmV2aW91c0RpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wcmV2aWV3LXVybCddID0gQXBwU3RvcmUuZ2V0UHJldmlld1VybEJ5SGFzaChuZXh0RGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gocHJldmlvdXNEaXB0eXF1ZSlcblx0XHRwcm9wcy5kYXRhWydmYWN0LXR4dCddID0gcHJvcHMuZGF0YS5mYWN0W0FwcFN0b3JlLmxhbmcoKV1cblxuXHRcdHN1cGVyKHByb3BzKVxuXG5cdFx0dGhpcy5vbk1vdXNlTW92ZSA9IHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlRW50ZXIgPSB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQXJyb3dNb3VzZUxlYXZlID0gdGhpcy5vbkFycm93TW91c2VMZWF2ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZCA9IHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlciA9IHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk9wZW5GYWN0ID0gdGhpcy5vbk9wZW5GYWN0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uQ2xvc2VGYWN0ID0gdGhpcy5vbkNsb3NlRmFjdC5iaW5kKHRoaXMpXG5cdFx0dGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRoaXMudWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsIHRoaXMub25DbG9zZUZhY3QpXG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5sZWZ0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnc2hvZS1iZycpLFxuXHRcdFx0XG5cdFx0KVxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXItYmcnKVxuXHRcdClcblxuXHRcdHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3RlcicpLCB0aGlzLmdldEltYWdlU2l6ZUJ5SWQoJ2NoYXJhY3RlcicpKVxuXHRcdHRoaXMuZnVuRmFjdCA9IGZ1bkZhY3QodGhpcy5weENvbnRhaW5lciwgdGhpcy5lbGVtZW50LCB0aGlzLm1vdXNlLCB0aGlzLnByb3BzLmRhdGEsIHRoaXMucHJvcHMpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyID0gYXJyb3dzV3JhcHBlcih0aGlzLmVsZW1lbnQsIHRoaXMub25BcnJvd01vdXNlRW50ZXIsIHRoaXMub25BcnJvd01vdXNlTGVhdmUpXG5cdFx0dGhpcy5zZWxmaWVTdGljayA9IHNlbGZpZVN0aWNrKHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhKVxuXHRcdHRoaXMubWFpbkJ0bnMgPSBtYWluQnRucyh0aGlzLmVsZW1lbnQsIHRoaXMucHJvcHMuZGF0YSwgdGhpcy5tb3VzZSwgdGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHRUd2Vlbk1heC5zZXQodGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoJ2xlZnQnKSwgeyB4Oi1BcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HIH0pXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdyaWdodCcpLCB7IHg6QXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZS54IC0gMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC40KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZSwgMSwgeyB4OiB0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS54ICsgMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNClcblxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5hcnJvd3NXcmFwcGVyLmxlZnQsIDAuNSwgeyB4OiAtMTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLmFycm93c1dyYXBwZXIucmlnaHQsIDAuNSwgeyB4OiAxMDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMuc2VsZmllU3RpY2suZWwsIDAuNSwgeyB5OiA1MDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0dGhpcy50bE91dC50byh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblxuXHRcdHRoaXMudWlJblRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuYXJyb3dzV3JhcHBlci5sZWZ0LCAxLCB7IHg6IC0xMDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5hcnJvd3NXcmFwcGVyLnJpZ2h0LCAxLCB7IHg6IDEwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLnNlbGZpZVN0aWNrLmVsLCAxLCB7IHk6IDUwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjUpXG5cdFx0dGhpcy51aUluVGwucGF1c2UoMClcblx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLnVpVHJhbnNpdGlvbkluQ29tcGxldGVkKTtcblxuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0dWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQoKSB7XG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnRyYW5zaXRpb25JbkNvbXBsZXRlZCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy51aUluVGwudGltZVNjYWxlKDEuNikucGxheSgpXHRcdFxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHRvbk1vdXNlTW92ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLm1vdXNlLnggPSBlLmNsaWVudFhcblx0XHR0aGlzLm1vdXNlLnkgPSBlLmNsaWVudFlcblx0XHR0aGlzLm1vdXNlLm5YID0gKGUuY2xpZW50WCAvIHdpbmRvd1cpICogMVxuXHRcdHRoaXMubW91c2UublkgPSAoZS5jbGllbnRZIC8gd2luZG93SCkgKiAxXG5cdH1cblx0b25TZWxmaWVTdGlja0NsaWNrZWQoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGlmKHRoaXMuc2VsZmllU3RpY2suaXNPcGVuZWQpIHtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2suY2xvc2UoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5zZWxmaWVTdGljay5vcGVuKClcblx0XHRcdHRoaXMubWFpbkJ0bnMuYWN0aXZhdGUoKVxuXHRcdH1cblx0fVxuXHRvbkFycm93TW91c2VFbnRlcihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cblx0XHR2YXIgcG9zWDtcblx0XHR2YXIgb2Zmc2V0WCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblx0XHRpZihpZCA9PSAnbGVmdCcpIHBvc1ggPSBvZmZzZXRYXG5cdFx0ZWxzZSBwb3NYID0gLW9mZnNldFhcblxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMucHhDb250YWluZXIsIDAuNCwgeyB4OnBvc1gsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblx0XHRUd2Vlbk1heC50byh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZChpZCksIDAuNCwgeyB4OjAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5vdmVyKGlkKVxuXHR9XG5cdG9uQXJyb3dNb3VzZUxlYXZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblxuXHRcdHZhciBwb3NYO1xuXHRcdHZhciBvZmZzZXRYID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXHRcdGlmKGlkID09ICdsZWZ0JykgcG9zWCA9IC1vZmZzZXRYXG5cdFx0ZWxzZSBwb3NYID0gb2Zmc2V0WFxuXG5cdFx0VHdlZW5NYXgudG8odGhpcy5weENvbnRhaW5lciwgMC42LCB7IHg6MCwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblx0XHRUd2Vlbk1heC50byh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZChpZCksIDAuNiwgeyB4OnBvc1gsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cblx0XHR0aGlzLmFycm93c1dyYXBwZXIub3V0KGlkKVxuXHR9XG5cdG9uTWFpbkJ0bnNFdmVudEhhbmRsZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB0eXBlID0gZS50eXBlXG5cdFx0dmFyIHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxuXHRcdHZhciBpZCA9IHRhcmdldC5pZFxuXHRcdGlmKHR5cGUgPT0gJ2NsaWNrJyAmJiBpZCA9PSAnZnVuLWZhY3QtYnRuJykge1xuXHRcdFx0aWYodGhpcy5mdW5GYWN0LmlzT3Blbikge1xuXHRcdFx0XHRBcHBBY3Rpb25zLmNsb3NlRnVuRmFjdCgpXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0QXBwQWN0aW9ucy5vcGVuRnVuRmFjdCgpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnbW91c2VlbnRlcicpIHtcblx0XHRcdHRoaXMubWFpbkJ0bnMub3ZlcihpZClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdtb3VzZWxlYXZlJykge1xuXHRcdFx0dGhpcy5tYWluQnRucy5vdXQoaWQpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdH1cblx0b25PcGVuRmFjdCgpe1xuXHRcdHRoaXMuZnVuRmFjdC5vcGVuKClcblx0XHR0aGlzLm1haW5CdG5zLmRpc2FjdGl2YXRlKClcblx0fVxuXHRvbkNsb3NlRmFjdCgpe1xuXHRcdHRoaXMuZnVuRmFjdC5jbG9zZSgpXG5cdFx0dGhpcy5tYWluQnRucy5hY3RpdmF0ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuY2hhcmFjdGVyLnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMubGVmdFBhcnQudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5yaWdodFBhcnQudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5zZWxmaWVTdGljay51cGRhdGUoKVxuXHRcdHRoaXMuZnVuRmFjdC51cGRhdGUoKVxuXHRcdHRoaXMubWFpbkJ0bnMudXBkYXRlKClcblxuXHRcdHN1cGVyLnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLmxlZnRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5yaWdodFBhcnQucmVzaXplKClcblx0XHR0aGlzLmNoYXJhY3Rlci5yZXNpemUoKVxuXHRcdHRoaXMuZnVuRmFjdC5yZXNpemUoKVxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5yZXNpemUoKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sucmVzaXplKClcblx0XHR0aGlzLm1haW5CdG5zLnJlc2l6ZSgpXG5cblx0XHR0aGlzLnJpZ2h0UGFydC5ob2xkZXIueCA9ICh3aW5kb3dXID4+IDEpXG5cblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuT1BFTl9GVU5fRkFDVCwgdGhpcy5vbk9wZW5GYWN0KVxuXHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsIHRoaXMub25DbG9zZUZhY3QpXG5cdFx0ZG9tLmV2ZW50Lm9mZih3aW5kb3csICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKVxuXHRcdGRvbS5ldmVudC5vZmYodGhpcy5zZWxmaWVTdGljay5lbCwgJ2NsaWNrJywgdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZClcblx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHRoaXMudWlJblRsLmNsZWFyKClcblx0XHR0aGlzLmxlZnRQYXJ0LmNsZWFyKClcblx0XHR0aGlzLnJpZ2h0UGFydC5jbGVhcigpXG5cdFx0dGhpcy5jaGFyYWN0ZXIuY2xlYXIoKVxuXHRcdHRoaXMuZnVuRmFjdC5jbGVhcigpXG5cdFx0dGhpcy5zZWxmaWVTdGljay5jbGVhcigpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLmNsZWFyKClcblx0XHR0aGlzLm1haW5CdG5zLmNsZWFyKClcblx0XHR0aGlzLnVpSW5UbCA9IG51bGxcblx0XHR0aGlzLm1vdXNlID0gbnVsbFxuXHRcdHRoaXMubGVmdFBhcnQgPSBudWxsXG5cdFx0dGhpcy5yaWdodFBhcnQgPSBudWxsXG5cdFx0dGhpcy5jaGFyYWN0ZXIgPSBudWxsXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyID0gbnVsbFxuXHRcdHRoaXMubWFpbkJ0bnMgPSBudWxsXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbiIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgYm90dG9tVGV4dHMgZnJvbSAnYm90dG9tLXRleHRzLWhvbWUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBncmlkIGZyb20gJ2dyaWQtaG9tZSdcbmltcG9ydCBpbWFnZUNhbnZhc2VzR3JpZCBmcm9tICdpbWFnZS10by1jYW52YXNlcy1ncmlkJ1xuaW1wb3J0IGFyb3VuZEJvcmRlciBmcm9tICdhcm91bmQtYm9yZGVyLWhvbWUnXG5pbXBvcnQgbWFwIGZyb20gJ21haW4tbWFwJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBncmlkUG9zaXRpb25zIGZyb20gJ2dyaWQtcG9zaXRpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb21lIGV4dGVuZHMgUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSBBcHBTdG9yZS5wYWdlQ29udGVudCgpXG5cdFx0cHJvcHMuZGF0YS5ncmlkID0gW11cblx0XHRwcm9wcy5kYXRhLmdyaWQubGVuZ3RoID0gMjhcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10gPSB7IGhvcml6b250YWw6IFtdLCB2ZXJ0aWNhbDogW10gfVxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS5ob3Jpem9udGFsLmxlbmd0aCA9IDNcblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10udmVydGljYWwubGVuZ3RoID0gNlxuXHRcdHByb3BzLmRhdGFbJ3RleHRfYSddID0gY29udGVudC50ZXh0c1sndHh0X2EnXVxuXHRcdHByb3BzLmRhdGFbJ2FfdmlzaW9uJ10gPSBjb250ZW50LnRleHRzWydhX3Zpc2lvbiddXG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dmFyIGJnVXJsID0gdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2JhY2tncm91bmQnKVxuXHRcdHRoaXMucHJvcHMuZGF0YS5iZ3VybCA9IGJnVXJsXG5cblx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtID0gdGhpcy50cmlnZ2VyTmV3SXRlbS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkl0ZW1FbmRlZCA9IHRoaXMub25JdGVtRW5kZWQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubGFzdEdyaWRJdGVtSW5kZXg7XG5cdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMjAwXG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDEsIDMsIDUsXG5cdFx0XHQ3LCA5LCAxMSxcblx0XHRcdDE1LCAxNyxcblx0XHRcdDIxLCAyMywgMjVcblx0XHRdXG5cblx0XHR0aGlzLnVzZWRTZWF0cyA9IFtdXG5cblx0XHQvLyB0aGlzLmJnID0gZG9tLnNlbGVjdCgnLmJnLXdyYXBwZXInLCB0aGlzLmVsZW1lbnQpXG5cblx0XHR0aGlzLmltZ0NHcmlkID0gaW1hZ2VDYW52YXNlc0dyaWQodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuaW1nQ0dyaWQubG9hZCh0aGlzLnByb3BzLmRhdGEuYmd1cmwpXG5cdFx0dGhpcy5ncmlkID0gZ3JpZCh0aGlzLnByb3BzLCB0aGlzLmVsZW1lbnQsIHRoaXMub25JdGVtRW5kZWQpXG5cdFx0dGhpcy5ncmlkLmluaXQoKVxuXHRcdC8vIHRoaXMuYm90dG9tVGV4dHMgPSBib3R0b21UZXh0cyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBhcm91bmRCb3JkZXIodGhpcy5lbGVtZW50KVxuXHRcdC8vIHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHRyaWdnZXJOZXdJdGVtKHR5cGUpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLnNlYXRzW1V0aWxzLlJhbmQoMCwgdGhpcy5zZWF0cy5sZW5ndGggLSAxLCAwKV1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZihzZWF0ID09IGluZGV4KSB7XG5cdFx0XHRcdGlmKHRoaXMudXNlZFNlYXRzLmxlbmd0aCA8IHRoaXMuc2VhdHMubGVuZ3RoIC0gMikgdGhpcy50cmlnZ2VyTmV3SXRlbSh0eXBlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMudXNlZFNlYXRzLnB1c2goaW5kZXgpXG5cdFx0dGhpcy5ncmlkLnRyYW5zaXRpb25Jbkl0ZW0oaW5kZXgsIHR5cGUpXG5cdH1cblx0b25JdGVtRW5kZWQoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB1c2VkU2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZih1c2VkU2VhdCA9PSBpdGVtLnNlYXQpIHtcblx0XHRcdFx0dGhpcy51c2VkU2VhdHMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkKSByZXR1cm5cblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdGlmKHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA+IDgwMCkge1xuXHRcdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMFxuXHRcdFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9WSURFTylcblx0XHR9XG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyICs9IDFcblx0XHRpZih0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPiAzMCkge1xuXHRcdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXHRcdFx0dGhpcy50cmlnZ2VyTmV3SXRlbShBcHBDb25zdGFudHMuSVRFTV9JTUFHRSlcblx0XHR9XG5cdFx0c3VwZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcblx0XHR2YXIgZ0dyaWQgPSBncmlkUG9zaXRpb25zKHdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIEFwcENvbnN0YW50cy5HUklEX1JPV1MsICdjb2xzX3Jvd3MnKVxuXG5cdFx0dGhpcy5ncmlkLnJlc2l6ZShnR3JpZClcblx0XHR0aGlzLmltZ0NHcmlkLnJlc2l6ZShnR3JpZClcblx0XHQvLyB0aGlzLmJvdHRvbVRleHRzLnJlc2l6ZSgpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIucmVzaXplKClcblx0XHQvLyB0aGlzLm1hcC5yZXNpemUoKVxuXG5cdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMuYXJvdW5kQm9yZGVyLmNsZWFyKClcblx0XHR0aGlzLmdyaWQuY2xlYXIoKVxuXHRcdC8vIHRoaXMubWFwLmNsZWFyKClcblxuXHRcdHRoaXMuZ3JpZCA9IG51bGxcblx0XHR0aGlzLmJvdHRvbVRleHRzID0gbnVsbFxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyID0gbnVsbFxuXHRcdHRoaXMubWFwID0gbnVsbFxuXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbiIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChob2xkZXIsIG1vdXNlLCBkYXRhKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBpc1JlYWR5ID0gZmFsc2Vcblx0dmFyIHNjcmVlbkhvbGRlclNpemUgPSBbMCwgMF0sIHZpZGVvSG9sZGVyU2l6ZSA9IFswLCAwXSwgY29sb3JpZmllclNpemUgPSBbMCwgMF0sIHRvcE9mZnNldCA9IDA7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5zZWxmaWUtc3RpY2std3JhcHBlcicsIGhvbGRlcilcblx0dmFyIGJhY2tncm91bmQgPSBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGVsKVxuXHR2YXIgc2NyZWVuV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zY3JlZW4td3JhcHBlcicsIGVsKVxuXHR2YXIgc2NyZWVuSG9sZGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgdmlkZW9Ib2xkZXIgPSBkb20uc2VsZWN0KCcudmlkZW8taG9sZGVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXIgPSBkb20uc2VsZWN0KCcuY29sb3JpZmllcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciBjb2xvcmlmaWVyU3ZnUGF0aCA9IGRvbS5zZWxlY3QoJ3N2ZyBwYXRoJywgY29sb3JpZmllcilcblx0dmFyIHNlbGZpZVN0aWNrV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zZWxmaWUtc3RpY2std3JhcHBlcicsIGVsKVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgdHJhbnNsYXRlID0gVXRpbHMuVHJhbnNsYXRlXG5cdHZhciB0d2VlbkluO1xuXHR2YXIgYW5pbWF0aW9uID0ge1xuXHRcdHBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0ZnBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0aXBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0dmVsb2NpdHk6IHt4OiAwLCB5OiAwfSxcblx0XHRyb3RhdGlvbjogMCxcblx0XHRjb25maWc6IHtcblx0XHRcdGxlbmd0aDogNDAwLFxuXHRcdFx0c3ByaW5nOiAwLjQsXG5cdFx0XHRmcmljdGlvbjogMC43XG5cdFx0fVxuXHR9XG5cblx0VHdlZW5NYXguc2V0KGVsLCB7IHJvdGF0aW9uOiAnLTFkZWcnLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJyB9KVxuXG5cdC8vIGNoZWNrIGlmIG1peC1ibGVuZC1tb2RlIGlzIGF2YWlsYWJsZVxuXHRpZiAoJ21peC1ibGVuZC1tb2RlJyBpbiBjb2xvcmlmaWVyLnN0eWxlKSB7XG5cdFx0Y29sb3JpZmllci5zdHlsZVsnbWl4LWJsZW5kLW1vZGUnXSA9ICdjb2xvcidcblx0fWVsc2V7XG5cdFx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ29wYWNpdHknXSA9IDAuOFxuXHR9XG5cdFxuXHR2YXIgYyA9IGRhdGFbJ2FtYmllbnQtY29sb3InXVsnc2VsZmllLXN0aWNrJ11cblx0Y29sb3JpZmllclN2Z1BhdGguc3R5bGVbJ2ZpbGwnXSA9ICcjJyArIGNvbG9yVXRpbHMuaHN2VG9IZXgoYy5oLCBjLnMsIGMudilcblxuXHR2YXIgb25WaWRlb0VuZGVkID0gKCk9PiB7XG5cdFx0c2NvcGUuY2xvc2UoKVxuXHR9XG5cdHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuXHRcdGF1dG9wbGF5OiBmYWxzZVxuXHR9KVxuXHRtVmlkZW8uYWRkVG8odmlkZW9Ib2xkZXIpXG5cdG1WaWRlby5vbignZW5kZWQnLCBvblZpZGVvRW5kZWQpXG5cdHZhciB2aWRlb1NyYyA9IGRhdGFbJ3NlbGZpZS1zdGljay12aWRlby11cmwnXVxuXG5cdHZhciBzdGlja0ltZyA9IGltZyhBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2Uvc2VsZmllc3RpY2sucG5nJywgKCk9PiB7XG5cdFx0ZG9tLnRyZWUuYWRkKHNjcmVlbkhvbGRlciwgc3RpY2tJbWcpXG5cdFx0bVZpZGVvLmxvYWQodmlkZW9TcmMsICgpPT4ge1xuXHRcdFx0aWYodHdlZW5JbiAhPSB1bmRlZmluZWQpe1xuXHRcdFx0XHR0d2VlbkluLnBsYXkoKVxuXHRcdFx0fVxuXHRcdFx0aXNSZWFkeSA9IHRydWVcblx0XHRcdHNjb3BlLnJlc2l6ZSgpXG5cdFx0fSlcblx0fSlcblxuXHRzY29wZSA9IHtcblx0XHRlbDogZWwsXG5cdFx0aXNPcGVuZWQ6IGZhbHNlLFxuXHRcdG9wZW46ICgpPT4ge1xuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggPSAxMDAsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLnNwcmluZyA9IDAuOSxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuZnJpY3Rpb24gPSAwLjVcblx0XHRcdG1WaWRlby5wbGF5KDApXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSdcblx0XHRcdHNjb3BlLmlzT3BlbmVkID0gdHJ1ZVxuXHRcdH0sXG5cdFx0Y2xvc2U6ICgpPT4ge1xuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5sZW5ndGggPSAwLFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5zcHJpbmcgPSAwLjYsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmZyaWN0aW9uID0gMC43XG5cdFx0XHRtVmlkZW8ucGF1c2UoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nXG5cdFx0XHRzY29wZS5pc09wZW5lZCA9IGZhbHNlXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXG5cdFx0XHRpZihzY29wZS5pc09wZW5lZCkge1xuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55IC0gKHNjcmVlbkhvbGRlclNpemVbMV0gKiAwLjgpXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCArPSAobW91c2UublggLSAwLjUpICogODBcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi55ICs9IChtb3VzZS5uWSAtIDAuNSkgKiAzMFxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiAyMFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgLT0gKG1vdXNlLm5ZIC0gMC41KSAqIDIwXG5cdFx0XHR9XG5cblx0XHRcdHNwcmluZ1RvKGFuaW1hdGlvbiwgYW5pbWF0aW9uLmZwb3NpdGlvbiwgMSlcblxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnggKz0gKGFuaW1hdGlvbi5mcG9zaXRpb24ueCAtIGFuaW1hdGlvbi5wb3NpdGlvbi54KSAqIDAuMVxuXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCArPSAoMC4wMSAtIGFuaW1hdGlvbi5jb25maWcubGVuZ3RoKSAqIDAuMDVcblxuXHRcdFx0dHJhbnNsYXRlKHNjcmVlbldyYXBwZXIsIGFuaW1hdGlvbi5wb3NpdGlvbi54LCBhbmltYXRpb24ucG9zaXRpb24ueSArIGFuaW1hdGlvbi52ZWxvY2l0eS55LCAxKVxuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdFx0XG5cdFx0XHQvLyBpZiBpbWFnZXMgbm90IHJlYWR5IHJldHVyblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHRzY3JlZW5XcmFwcGVyLnN0eWxlLndpZHRoID0gd2luZG93VyAqIDAuMyArICdweCdcblxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cblx0XHRcdHNjcmVlbkhvbGRlclNpemUgPSBkb20uc2l6ZShzY3JlZW5Ib2xkZXIpXG5cdFx0XHR2aWRlb0hvbGRlclNpemUgPSBkb20uc2l6ZSh2aWRlb0hvbGRlcilcblx0XHRcdGNvbG9yaWZpZXJTaXplID0gZG9tLnNpemUoY29sb3JpZmllcilcblx0XHRcdHRvcE9mZnNldCA9ICh3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XKSAqIDI2XG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS5sZWZ0ID0gKHNjcmVlbkhvbGRlclNpemVbMF0gPj4gMSkgLSAodmlkZW9Ib2xkZXJTaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0dmlkZW9Ib2xkZXIuc3R5bGUudG9wID0gdG9wT2Zmc2V0ICsgJ3B4J1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZS5sZWZ0ID0gKHNjcmVlbkhvbGRlclNpemVbMF0gPj4gMSkgLSAoY29sb3JpZmllclNpemVbMF0gKiAwLjU4KSArICdweCdcblx0XHRcdGNvbG9yaWZpZXIuc3R5bGUudG9wID0gLTAuNyArICdweCdcblxuXHRcdFx0YW5pbWF0aW9uLmlwb3NpdGlvbi54ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKVxuXHRcdFx0YW5pbWF0aW9uLmlwb3NpdGlvbi55ID0gd2luZG93SCAtICh2aWRlb0hvbGRlclNpemVbMV0gKiAwLjM1KVxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnggPSBhbmltYXRpb24uaXBvc2l0aW9uLnhcblx0XHRcdGFuaW1hdGlvbi5wb3NpdGlvbi55ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi55XG5cblx0XHR9LFxuXHRcdHRyYW5zaXRpb25JbkNvbXBsZXRlZDogKCk9PiB7XG5cdFx0XHRpZighaXNSZWFkeSkge1xuXHRcdFx0XHR0d2VlbkluID0gVHdlZW5NYXguZnJvbShlbCwgMC42LCB7IHk6IDUwMCwgcGF1c2VkOnRydWUsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSlcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdG1WaWRlby5jbGVhcigpXG5cdFx0XHRtVmlkZW8gPSBudWxsXG5cdFx0XHRhbmltYXRpb24gPSBudWxsXG5cdFx0XHR0d2VlbkluID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHNjb3BlLmNsb3NlKClcblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIHNvY2lhbExpbmtzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgd3JhcHBlciA9IGRvbS5zZWxlY3QoXCIjZm9vdGVyICNzb2NpYWwtd3JhcHBlclwiLCBwYXJlbnQpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBwYWRkaW5nID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC40XG5cblx0XHRcdHZhciB3cmFwcGVyU2l6ZSA9IGRvbS5zaXplKHdyYXBwZXIpXG5cblx0XHRcdHZhciBzb2NpYWxDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSBwYWRkaW5nIC0gd3JhcHBlclNpemVbMF0sXG5cdFx0XHRcdHRvcDogd2luZG93SCAtIHBhZGRpbmcgLSB3cmFwcGVyU2l6ZVsxXSxcblx0XHRcdH1cblxuXHRcdFx0d3JhcHBlci5zdHlsZS5sZWZ0ID0gc29jaWFsQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHR3cmFwcGVyLnN0eWxlLnRvcCA9IHNvY2lhbENzcy50b3AgKyAncHgnXG5cdFx0fSxcblx0XHRzaG93OiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLnJlbW92ZSh3cmFwcGVyLCAnaGlkZScpLCAxMDAwKVxuXHRcdH0sXG5cdFx0aGlkZTogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT5kb20uY2xhc3Nlcy5hZGQod3JhcHBlciwgJ2hpZGUnKSwgNTAwKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxMaW5rcyIsImltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcblxudmFyIHZpZGVvQ2FudmFzID0gKCBwcm9wcyApPT4ge1xuXG4gICAgdmFyIHNjb3BlO1xuICAgIHZhciBpbnRlcnZhbElkO1xuICAgIHZhciBkeCA9IDAsIGR5ID0gMCwgZFdpZHRoID0gMCwgZEhlaWdodCA9IDA7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcbiAgICAgICAgYXV0b3BsYXk6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuICAgICAgICB2b2x1bWU6IHByb3BzLnZvbHVtZSxcbiAgICAgICAgbG9vcDogcHJvcHMubG9vcFxuICAgIH0pXG5cbiAgICB2YXIgb25DYW5QbGF5ID0gKCk9PntcbiAgICAgICAgc2NvcGUuaXNMb2FkZWQgPSB0cnVlXG4gICAgICAgIGlmKHByb3BzLmF1dG9wbGF5KSBtVmlkZW8ucGxheSgpXG4gICAgICAgIGlmKGRXaWR0aCA9PSAwKSBkV2lkdGggPSBtVmlkZW8ud2lkdGgoKVxuICAgICAgICBpZihkSGVpZ2h0ID09IDApIGRIZWlnaHQgPSBtVmlkZW8uaGVpZ2h0KClcbiAgICAgICAgaWYobVZpZGVvLmlzUGxheWluZyAhPSB0cnVlKSBkcmF3T25jZSgpXG4gICAgfVxuXG4gICAgdmFyIGRyYXdPbmNlID0gKCk9PiB7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobVZpZGVvLmVsLCBkeCwgZHksIGRXaWR0aCwgZEhlaWdodClcbiAgICB9XG5cbiAgICB2YXIgZHJhdyA9ICgpPT57XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobVZpZGVvLmVsLCBkeCwgZHksIGRXaWR0aCwgZEhlaWdodClcbiAgICB9XG5cbiAgICB2YXIgcGxheSA9ICgpPT57XG4gICAgICAgIG1WaWRlby5wbGF5KClcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgICAgICBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZHJhdywgMTAwMCAvIDMwKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgICAgICBtVmlkZW8uY3VycmVudFRpbWUodGltZSlcbiAgICAgICAgZHJhd09uY2UoKVxuICAgIH1cblxuICAgIHZhciB0aW1lb3V0ID0gKGNiLCBtcyk9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICAgICBjYihzY29wZSlcbiAgICAgICAgfSwgbXMpXG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKCk9PntcbiAgICAgICAgbVZpZGVvLnBhdXNlKClcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH1cblxuICAgIHZhciBlbmRlZCA9ICgpPT57XG4gICAgICAgIGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgICAgICBpZihwcm9wcy5vbkVuZGVkICE9IHVuZGVmaW5lZCkgcHJvcHMub25FbmRlZChzY29wZSlcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgIH1cblxuICAgIHZhciByZXNpemUgPSAoeCwgeSwgdywgaCk9PntcbiAgICAgICAgZHggPSB4XG4gICAgICAgIGR5ID0geVxuICAgICAgICBkV2lkdGggPSB3XG4gICAgICAgIGRIZWlnaHQgPSBoXG4gICAgfVxuXG4gICAgdmFyIGNsZWFyID0gKCk9PiB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZClcbiAgICAgICAgbVZpZGVvLmNsZWFyQWxsRXZlbnRzKClcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLDAsMCwwKVxuICAgIH1cblxuICAgIGlmKHByb3BzLm9uRW5kZWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1WaWRlby5vbignZW5kZWQnLCBlbmRlZClcbiAgICB9XG5cbiAgICBzY29wZSA9IHtcbiAgICAgICAgaXNMb2FkZWQ6IGZhbHNlLFxuICAgICAgICBjYW52YXM6IGNhbnZhcyxcbiAgICAgICAgdmlkZW86IG1WaWRlbyxcbiAgICAgICAgY3R4OiBjdHgsXG4gICAgICAgIGRyYXdPbmNlOiBkcmF3T25jZSxcbiAgICAgICAgcGxheTogcGxheSxcbiAgICAgICAgcGF1c2U6IHBhdXNlLFxuICAgICAgICBzZWVrOiBzZWVrLFxuICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICByZXNpemU6IHJlc2l6ZSxcbiAgICAgICAgY2xlYXI6IGNsZWFyLFxuICAgICAgICBsb2FkOiAoc3JjLCBjYik9PiB7XG4gICAgICAgICAgICBtVmlkZW8ubG9hZChzcmMsICgpPT57XG4gICAgICAgICAgICAgICAgb25DYW5QbGF5KClcbiAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjb3BlXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgdmlkZW9DYW52YXMiLCJleHBvcnQgZGVmYXVsdCB7XG5cdFdJTkRPV19SRVNJWkU6ICdXSU5ET1dfUkVTSVpFJyxcblx0UEFHRV9IQVNIRVJfQ0hBTkdFRDogJ1BBR0VfSEFTSEVSX0NIQU5HRUQnLFxuXHRQQUdFX0FTU0VUU19MT0FERUQ6ICdQQUdFX0FTU0VUU19MT0FERUQnLFxuXG5cdExBTkRTQ0FQRTogJ0xBTkRTQ0FQRScsXG5cdFBPUlRSQUlUOiAnUE9SVFJBSVQnLFxuXG5cdEZPUldBUkQ6ICdGT1JXQVJEJyxcblx0QkFDS1dBUkQ6ICdCQUNLV0FSRCcsXG5cblx0SE9NRTogJ0hPTUUnLFxuXHRESVBUWVFVRTogJ0RJUFRZUVVFJyxcblxuXHRMRUZUOiAnTEVGVCcsXG5cdFJJR0hUOiAnUklHSFQnLFxuXHRUT1A6ICdUT1AnLFxuXHRCT1RUT006ICdCT1RUT00nLFxuXG5cdElOVEVSQUNUSVZFOiAnSU5URVJBQ1RJVkUnLFxuXHRUUkFOU0lUSU9OOiAnVFJBTlNJVElPTicsXG5cblx0UFhfQ09OVEFJTkVSX0lTX1JFQURZOiAnUFhfQ09OVEFJTkVSX0lTX1JFQURZJyxcblx0UFhfQ09OVEFJTkVSX0FERF9DSElMRDogJ1BYX0NPTlRBSU5FUl9BRERfQ0hJTEQnLFxuXHRQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEOiAnUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCcsXG5cblx0T1BFTl9GVU5fRkFDVDogJ09QRU5fRlVOX0ZBQ1QnLFxuXHRDTE9TRV9GVU5fRkFDVDogJ0NMT1NFX0ZVTl9GQUNUJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblx0SE9NRV9JTUFHRV9TSVpFOiBbIDQ4MCwgMjcwIF0sXG5cblx0SVRFTV9JTUFHRTogJ0lURU1fSU1BR0UnLFxuXHRJVEVNX1ZJREVPOiAnSVRFTV9WSURFTycsXG5cblx0R1JJRF9ST1dTOiA0LCBcblx0R1JJRF9DT0xVTU5TOiA3LFxuXG5cdFBBRERJTkdfQVJPVU5EOiA0MCxcblx0U0lERV9FVkVOVF9QQURESU5HOiAxMjAsXG5cblx0RU5WSVJPTk1FTlRTOiB7XG5cdFx0UFJFUFJPRDoge1xuXHRcdFx0c3RhdGljOiAnJ1xuXHRcdH0sXG5cdFx0UFJPRDoge1xuXHRcdFx0XCJzdGF0aWNcIjogSlNfdXJsX3N0YXRpYyArICcvJ1xuXHRcdH1cblx0fSxcblxuXHRNRURJQV9HTE9CQUxfVzogMTkyMCxcblx0TUVESUFfR0xPQkFMX0g6IDEwODAsXG5cblx0TUlOX01JRERMRV9XOiA5NjAsXG5cdE1RX1hTTUFMTDogMzIwLFxuXHRNUV9TTUFMTDogNDgwLFxuXHRNUV9NRURJVU06IDc2OCxcblx0TVFfTEFSR0U6IDEwMjQsXG5cdE1RX1hMQVJHRTogMTI4MCxcblx0TVFfWFhMQVJHRTogMTY4MCxcbn0iLCJpbXBvcnQgRmx1eCBmcm9tICdmbHV4J1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuXG52YXIgQXBwRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlVmlld0FjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHRzb3VyY2U6ICdWSUVXX0FDVElPTicsXG5cdFx0XHRhY3Rpb246IGFjdGlvblxuXHRcdH0pO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwRGlzcGF0Y2hlciIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGRpcHR5cXVlLXBhZ2UnPlxcblx0XFxuXHQ8ZGl2IGNsYXNzPVxcXCJmdW4tZmFjdC13cmFwcGVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidmlkZW8td3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcIm1lc3NhZ2Utd3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWVzc2FnZS1pbm5lclxcXCI+XFxuXHRcdFx0XHRcIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydmYWN0LXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnZmFjdC10eHQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjdC10eHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiY3Vyc29yLWNyb3NzXFxcIj5cXG5cdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTQuMTA1IDEzLjgyOFxcXCI+XFxuXHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjZmZmZmZmXFxcIiBwb2ludHM9XFxcIjEzLjk0NiwwLjgzOCAxMy4yODMsMC4xNTYgNy4wMzUsNi4yNSAwLjgzOSwwLjE1NiAwLjE3MywwLjgzNCA2LjM3LDYuOTMxIDAuMTU5LDEyLjk5IDAuODIzLDEzLjY3MSA3LjA3LDcuNTc4IDEzLjI2NiwxMy42NzEgMTMuOTMyLDEyLjk5NCA3LjczNiw2Ljg5NiBcXFwiLz5cXG5cdFx0XHQ8L3N2Zz5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcIm1haW4tYnRucy13cmFwcGVyXFxcIj5cXG5cdFx0PGRpdiBpZD0nc2hvcC1idG4nIGNsYXNzPSdtYWluLWJ0bic+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaW1nLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBpZD0nZnVuLWZhY3QtYnRuJyBjbGFzcz0nbWFpbi1idG4nPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImltZy13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcInNlbGZpZS1zdGljay13cmFwcGVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwic2NyZWVuLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbG9yaWZpZXJcXFwiPlxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEwMCAyMlxcXCI+XFxuXHRcdFx0XHRcdDxwYXRoIGQ9XFxcIk00LjYsMS4yNWMwLjAwMSwwLDAuMDQ1LTAuMDA2LDAuMDgsMGgwLjAzMmMxLjIxMiwwLjAwMywzNi43MDYtMSwzNi43MDYtMWwyNS40NzEsMC41NDljMC4wODYsMC4wMDIsMC4xNzIsMC4wMDcsMC4yNTgsMC4wMTdsMS40ODYsMC4xNjZDNjguNzExLDAuOTg5LDY4Ljc3MywxLDY4LjgzNiwxLjAzNmwwLjMyNCwwLjE5OWMwLjA1MiwwLjAzMiwwLjExLDAuMDQ5LDAuMTcxLDAuMDVsMjcuMDQzLDAuNDY5YzAsMCwyLjYyNC0wLjA3NywyLjYyNCwyLjkzM2wtMC42OTIsNy45NmMtMC4wNDUsMC41MTgtMC40NzksMC45MTYtMC45OTksMC45MTZoLTYuMjAzYy0wLjMyOCwwLTAuNjUzLDAuMDM0LTAuOTc1LDAuMWMtMC44NTMsMC4xNzUtMi44MywwLjUyOC01LjI2MywwLjYxOGMtMC4zNDIsMC4wMTQtMC42NjEsMC4xODEtMC44NzIsMC40NTFsLTAuNSwwLjY0NWwtMC4yOCwwLjM1OGMtMC4zNzQsMC40ODItMC42NDcsMS4wMzQtMC43ODksMS42MjhjLTAuMzIsMS4zNDUtMS4zOTgsMy45NTItNC45MjQsMy45NThjLTMuOTc0LDAuMDA1LTcuNjg1LTAuMTEzLTEwLjYxMi0wLjIyNWMtMS4xODktMC4wNDQtMi45NiwwLjIyOS0yLjg1NS0xLjYyOWwwLjM2LTUuOTRjMC4wMTQtMC4yMTktMC4xNTctMC40MDQtMC4zNzYtMC40MDlMMjkuNjIsMTIuNDg4Yy0wLjIxNC0wLjAwNC0wLjQyOCwwLjAwMS0wLjY0MSwwLjAxNWwtMS43NTMsMC4xMTNjLTAuMjA4LDAuMDEzLTAuNDA3LDAuMDg1LTAuNTc0LDAuMjFjLTAuNTU3LDAuNDExLTEuODk3LDEuMzkyLTIuNjY3LDEuODU5Yy0wLjcwMSwwLjQyNi0xLjUzOSwxLjA0Mi0xLjk2OCwxLjM2NGMtMC4xODMsMC4xMzctMC4zMDksMC4zMzUtMC4zNTgsMC41NThsLTAuMzE3LDEuNDI1Yy0wLjA0NCwwLjIwMi0wLjAwNCwwLjQxMywwLjExMywwLjU4M2wwLjYxMywwLjg5NmMwLjIxMiwwLjMxMSwwLjI5NywwLjY5OSwwLjE4OCwxLjA1OWMtMC4xMTUsMC4zNzgtMC40NDQsMC43NTUtMS4yOTIsMC43NTVoLTcuOTU3Yy0wLjQyNSwwLTAuODQ4LTAuMDQtMS4yNjYtMC4xMmMtMi41NDMtMC40ODYtMTAuODQ2LTIuNjYxLTEwLjg0Ni0xMC4zNkMwLjg5NiwzLjM3NSw0LjQ1OSwxLjI1LDQuNiwxLjI1XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzY3JlZW4taG9sZGVyXFxcIj48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImFycm93cy13cmFwcGVyXFxcIj5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3ByZXZpb3VzLXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXBhZ2UnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdsZWZ0JyBjbGFzcz1cXFwiYXJyb3cgbGVmdFxcXCI+XFxuXHRcdFx0XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzIgMjZcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBwb2ludHM9XFxcIjIxLjg0LDI1LjE4NCAxMy41OSwyNS4xODQgMS4wNDgsMTIuOTM0IDEzLjc5OCwwLjc2OCAyMi4wMDYsMC43MjYgMTIuNTA3LDEwLjE0MyAzMS40MjMsMTAuMDYgMzEuNTQ4LDE1Ljg1MSAxMS44ODIsMTUuODUxIFxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDEwMTAxXFxcIiBkPVxcXCJNMTMuMzQsMC4yNjVoOS43OTRsLTkuNjQ4LDkuMzA1aDE4LjIzNnY2LjkxSDEzLjU1M2w5LjYwMSw5LjI1OWwtOS44MTMtMC4wMkwwLjE1OSwxMi45OTFMMTMuMzQsMC4yNjV6TTIwLjcwNywxLjI0NWgtNi45NzFMMS41NjksMTIuOTkxTDEzLjczNiwyNC43NGw2Ljk4NCwwLjAxNEwxMS4xMjUsMTUuNWgxOS42MTd2LTQuOTVIMTEuMDU4TDIwLjcwNywxLjI0NXpcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCI3LjYyNywwLjgzMSA4LjMwNywxLjUyOSAxLjk1Miw3LjcyNyA4LjI5MywxMy45NjUgNy42MSwxNC42NTggMC41NjEsNy43MjQgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcHJldmlldy11cmwnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ3ByZXZpb3VzLXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInByZXZpb3VzLXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblxcblx0XHQ8L2E+XFxuXHRcdDxhIGhyZWY9XFxcIiMvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXBhZ2UnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ25leHQtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXBhZ2VcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBpZD0ncmlnaHQnIGNsYXNzPVxcXCJhcnJvdyByaWdodFxcXCI+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaWNvbnMtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMzIgMjZcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBmaWxsPVxcXCIjRkZGRkZGXFxcIiBwb2ludHM9XFxcIjEwLjM3NSwwLjgxOCAxOC42MjUsMC44MTggMzEuMTY3LDEzLjA2OCAxOC40MTcsMjUuMjM1IDEwLjIwOCwyNS4yNzcgMTkuNzA4LDE1Ljg2IDAuNzkyLDE1Ljk0MyAwLjY2NywxMC4xNTEgMjAuMzMzLDEwLjE1MSBcXFwiLz5cXG5cdFx0XHRcdFx0PHBhdGggZmlsbD1cXFwiIzAxMDEwMVxcXCIgZD1cXFwiTTE4LjcwOCwyNS43MzhIOC45MTRsOS42NDgtOS4zMDVIMC4zMjZ2LTYuOTFoMTguMTY5TDguODk0LDAuMjY1bDkuODE0LDAuMDJsMTMuMTgxLDEyLjcyN0wxOC43MDgsMjUuNzM4ek0xMS4zNDEsMjQuNzU3aDYuOTcxbDEyLjE2Ny0xMS43NDZMMTguMzEyLDEuMjYzbC02Ljk4NS0wLjAxNGw5LjU5Niw5LjI1NEgxLjMwNnY0Ljk1SDIwLjk5TDExLjM0MSwyNC43NTd6XFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAuNDU2IDAuNjQ0IDcuOTU3IDE0LjIwMlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIHBvaW50cz1cXFwiMS4yNCwxNC42NTggMC41NjEsMTMuOTYgNi45MTUsNy43NjIgMC41NzUsMS41MjUgMS4yNTcsMC44MzEgOC4zMDcsNy43NjUgXFxcIi8+XFxuXHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIiBzdHlsZT1cXFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbmV4dC1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wcmV2aWV3LXVybCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJuZXh0LXByZXZpZXctdXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIilcXFwiPjwvZGl2Plxcblx0XHQ8L2E+XFxuXHQ8L2Rpdj5cXG5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczQ9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHRcXG5cdDxoZWFkZXIgaWQ9XFxcImhlYWRlclxcXCI+XFxuXHRcdFx0PGEgaHJlZj1cXFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGNsYXNzPVxcXCJsb2dvXFxcIj5cXG5cdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiBpZD1cXFwiTGF5ZXJfMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdFx0PC9hPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1hcC1idG5cXFwiPjxhIGhyZWY9XFxcIiMhL2xhbmRpbmdcXFwiIGNsYXNzPVxcXCJzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm1hcF90eHQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2E+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY2FtcGVyLWxhYlxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYlVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGFiVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY2FtcGVyX2xhYiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXdyYXBwZXIgYnRuXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3AtdGl0bGUgc2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3RpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9kaXY+XFxuXHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTBcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVuU2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcInN1Yi0xXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj0nXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLndvbWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud29tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ3b21lblNob3BVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF93b21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9oZWFkZXI+XFxuXHRcdDxmb290ZXIgaWQ9XFxcImZvb3RlclxcXCIgY2xhc3M9XFxcImJ0blxcXCI+XFxuXHRcdFx0PGRpdiBpZD1cXFwic29jaWFsLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHVsPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2luc3RhZ3JhbSc+XFxuXHRcdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnN0YWdyYW1VcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluc3RhZ3JhbVVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaW5zdGFncmFtVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTYuMTA3LDE1LjU2MmMwLDAuMzAyLTAuMjQzLDAuNTQ3LTAuNTQzLDAuNTQ3SDIuNDM4Yy0wLjMwMiwwLTAuNTQ3LTAuMjQ1LTAuNTQ3LTAuNTQ3VjcuMzU5aDIuMTg4Yy0wLjI4NSwwLjQxLTAuMzgxLDEuMTc1LTAuMzgxLDEuNjYxYzAsMi45MjksMi4zODgsNS4zMTIsNS4zMjMsNS4zMTJjMi45MzUsMCw1LjMyMi0yLjM4Myw1LjMyMi01LjMxMmMwLTAuNDg2LTAuMDY2LTEuMjQtMC40Mi0xLjY2MWgyLjE4NlYxNS41NjJMMTYuMTA3LDE1LjU2MnogTTkuMDIsNS42NjNjMS44NTYsMCwzLjM2NSwxLjUwNCwzLjM2NSwzLjM1OGMwLDEuODU0LTEuNTA5LDMuMzU3LTMuMzY1LDMuMzU3Yy0xLjg1NywwLTMuMzY1LTEuNTA0LTMuMzY1LTMuMzU3QzUuNjU1LDcuMTY3LDcuMTYzLDUuNjYzLDkuMDIsNS42NjNMOS4wMiw1LjY2M3ogTTEyLjgyOCwyLjk4NGMwLTAuMzAxLDAuMjQ0LTAuNTQ2LDAuNTQ1LTAuNTQ2aDEuNjQzYzAuMywwLDAuNTQ5LDAuMjQ1LDAuNTQ5LDAuNTQ2djEuNjQxYzAsMC4zMDItMC4yNDksMC41NDctMC41NDksMC41NDdoLTEuNjQzYy0wLjMwMSwwLTAuNTQ1LTAuMjQ1LTAuNTQ1LTAuNTQ3VjIuOTg0TDEyLjgyOCwyLjk4NHogTTE1LjY2OSwwLjI1SDIuMzNjLTEuMTQ4LDAtMi4wOCwwLjkyOS0yLjA4LDIuMDc2djEzLjM0OWMwLDEuMTQ2LDAuOTMyLDIuMDc1LDIuMDgsMi4wNzVoMTMuMzM5YzEuMTUsMCwyLjA4MS0wLjkzLDIuMDgxLTIuMDc1VjIuMzI2QzE3Ljc1LDEuMTc5LDE2LjgxOSwwLjI1LDE1LjY2OSwwLjI1TDE1LjY2OSwwLjI1elxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPSd0d2l0dGVyJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnR3aXR0ZXJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnR3aXR0ZXJVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInR3aXR0ZXJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAyMiAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMjIgMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0yMS4xNzYsMC41MTRjLTAuODU0LDAuNTA5LTEuNzk5LDAuODc5LTIuODA4LDEuMDc5Yy0wLjgwNS0wLjg2NS0xLjk1My0xLjQwNS0zLjIyNi0xLjQwNWMtMi40MzgsMC00LjQxNywxLjk5Mi00LjQxNyw0LjQ0OWMwLDAuMzQ5LDAuMDM4LDAuNjg4LDAuMTE0LDEuMDEzQzcuMTY2LDUuNDY0LDMuOTEsMy42OTUsMS43MjksMWMtMC4zOCwwLjY2LTAuNTk4LDEuNDI1LTAuNTk4LDIuMjRjMCwxLjU0MywwLjc4LDIuOTA0LDEuOTY2LDMuNzA0QzIuMzc0LDYuOTIsMS42OTEsNi43MTgsMS4wOTQsNi4zODh2MC4wNTRjMCwyLjE1NywxLjUyMywzLjk1NywzLjU0Nyw0LjM2M2MtMC4zNzEsMC4xMDQtMC43NjIsMC4xNTctMS4xNjUsMC4xNTdjLTAuMjg1LDAtMC41NjMtMC4wMjctMC44MzMtMC4wOGMwLjU2MywxLjc2NywyLjE5NCwzLjA1NCw0LjEyOCwzLjA4OWMtMS41MTIsMS4xOTQtMy40MTgsMS45MDYtNS40ODksMS45MDZjLTAuMzU2LDAtMC43MDktMC4wMjEtMS4wNTUtMC4wNjJjMS45NTYsMS4yNjEsNC4yOCwxLjk5Nyw2Ljc3NSwxLjk5N2M4LjEzMSwwLDEyLjU3NC02Ljc3OCwxMi41NzQtMTIuNjU5YzAtMC4xOTMtMC4wMDQtMC4zODctMC4wMTItMC41NzdjMC44NjQtMC42MjcsMS42MTMtMS40MTEsMi4yMDQtMi4zMDNjLTAuNzkxLDAuMzU0LTEuNjQ0LDAuNTkzLTIuNTM3LDAuNzAxQzIwLjE0NiwyLjQyNCwyMC44NDcsMS41NTMsMjEuMTc2LDAuNTE0XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2ZhY2Vib29rJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZhY2Vib29rVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mYWNlYm9va1VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjZWJvb2tVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNy43MTksMTYuNzU2YzAsMC41MzEtMC40MzEsMC45NjMtMC45NjIsMC45NjNoLTQuNDQzdi02Ljc1M2gyLjI2N2wwLjMzOC0yLjYzMWgtMi42MDRWNi42NTRjMC0wLjc2MiwwLjIxMS0xLjI4MSwxLjMwNC0xLjI4MWwxLjM5NCwwVjMuMDE5Yy0wLjI0MS0wLjAzMi0xLjA2OC0wLjEwNC0yLjAzMS0wLjEwNGMtMi4wMDksMC0zLjM4NSwxLjIyNy0zLjM4NSwzLjQ3OXYxLjk0MUg3LjMyMnYyLjYzMWgyLjI3MnY2Ljc1M0gxLjI0M2MtMC41MzEsMC0wLjk2Mi0wLjQzMi0wLjk2Mi0wLjk2M1YxLjI0M2MwLTAuNTMxLDAuNDMxLTAuOTYyLDAuOTYyLTAuOTYyaDE1LjUxNGMwLjUzMSwwLDAuOTYyLDAuNDMxLDAuOTYyLDAuOTYyVjE2Ljc1NlxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDwvdWw+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZm9vdGVyPlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbn0sXCIzXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiNVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ob3Jpem9udGFsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ob3Jpem9udGFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiaG9yaXpvbnRhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ob3Jpem9udGFsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjhcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmVydGljYWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZlcnRpY2FsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwidmVydGljYWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMudmVydGljYWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgYWxpYXM0PWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgaG9tZS1wYWdlJz5cXG5cdDxkaXYgY2xhc3M9XFxcImJnLXdyYXBwZXJcXFwiPlxcblx0XHQ8aW1nIHNyYz0nXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmJndXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5iZ3VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYmd1cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1iYWNrZ3JvdW5kLWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImxpbmVzLWdyaWQtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaG9yaXpvbnRhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDUsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInZlcnRpY2FsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oOCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXIgKyBcIlx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBzdHlsZT0nZGlzcGxheTogbm9uZTsnIGNsYXNzPVxcXCJib3R0b20tdGV4dHMtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdC10ZXh0XFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJmcm9udC13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50ZXh0X2EgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnRleHRfYSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGV4dF9hXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtdGV4dFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZnJvbnQtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aXNpb25cXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5hX3Zpc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYV92aXNpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImFfdmlzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0XHRcdDxpbWcgc3JjPVxcXCJpbWFnZS9sb2dvLW1hbGxvcmNhLnBuZ1xcXCI+XFxuXHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdFx0PGRpdj5jPC9kaXY+XFxuXHRcdFx0PGRpdj5kPC9kaXY+XFxuXHRcdFx0PGRpdj5lPC9kaXY+XFxuXHRcdFx0PGRpdj5mPC9kaXY+XFxuXHRcdFx0PGRpdj5nPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b21cXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuXHRcdFx0PGRpdj4xPC9kaXY+XFxuXHRcdFx0PGRpdj4yPC9kaXY+XFxuXHRcdFx0PGRpdj4zPC9kaXY+XFxuXHRcdFx0PGRpdj40PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+PC9kaXY+XHRcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRpdGxlcy13cmFwcGVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImRlaWFcXFwiPkRFSUE8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImVzLXRyZW5jXFxcIj5FUyBUUkVOQzwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJlbGx1ZlxcXCI+QVJFTExVRjwvZGl2PlxcbjwvZGl2Plxcblxcbjxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIi02NyAwIDc2MCA2NDVcXFwiPlxcblx0PHBhdGggaWQ9XFxcIm1hcC1iZ1xcXCIgZmlsbD1cXFwiIzFFRUE3OVxcXCIgZD1cXFwiTTkuMjY4LDI4OS4zOTRsOS43OS03Ljc5OGwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bDAsMGwtMi4zODItMS4xNzdMOS4yNjgsMjg5LjM5NHogTTU3My41OCwxNzQuMjExbDE5Ljg5LTEzLjgybDguOTAxLTIuNDc5bDUuMzU0LTQuODA5bDEuNTYtNS41NTVsLTEtNi45MjJsMS40NDUtMy45NzNsNS4wNTctMi41MjNsNC4yNzEsMi4wMWwxMS45MDYsOS4xNjVsMi42OTMsNC45MTdsMi44OTIsMS41NzVsMTEuNDgyLDEuMzY3bDMuMDU3LDEuOTQ5bDQuNDE4LDUuMjExbDcuNzY4LDIuMjIxbDUuODMyLDQuOTE2bDYuMzA1LDAuMjE1bDYuMzczLTEuMjJsMS45ODksMS44OGwwLjQwOSwxLjk2M2wtNS4zMzYsMTAuNDI4bC0wLjIyOSwzLjg2OWwxLjQ0MSwxLjY0N2wwLjg1NCwwLjk1OGw3LjM5NS0wLjQyN2wyLjM0NywxLjU0bDAuOTAzLDIuNTE5bC0yLjEwMiwzLjA1NGwtOC40MjUsMy4xODNsLTIuMTY5LDcuMTE2bDAuMzQ0LDMuMTgzbDMuMDczLDQuMjMxbDAuMDE1LDIuODQ2bC0yLjAxOSwxLjQ1bC0wLjczOSwzLjg0M2wyLjE2NiwxNi42ODdsLTAuOTgyLDEuODhsLTYuNzg1LTMuNzU3bC0xLjc1OCwwLjI1NGwtMi4wMTksNC40NjhsMS4wMzIsNi4yMzdsLTAuNjA1LDQuODI3bC0wLjM2MywyLjg2OGwtMS40OTUsMS42NjVsLTIuMTAyLTAuMTI5bC04LjM0MS0zLjg0N2wtNC4wMTEtMC40MDVsLTIuNzExLDEuNjA0bC03LjQzOCwxNi40OTdsLTMuMjg0LDExLjU5OWwzLjIyLDEwLjU5N2wxLjY0LDEuODU5bDQuMzg2LTAuMjhsMS40NzgsMS42OWwtMS45MzcsMy4zOTVsLTIuNjkzLDEuMDk1bC03Ljg1MS0wLjEyOWwtMi41NDYsMS42MjJsLTIuNjYxLDMuNzE4bDAuMTI5LDAuODk3bDAuNjA5LDQuNDQ2bC0xLjQ3OCw0LjMxM2wtMy42OCwzLjMxMmwtMy45MDksMS4xNzNsLTExLjk4OSw3Ljc1OGwtNS4zNTQsNy45NjdsLTguOTM4LDYuNTM5bC0zLjM1MSw2LjY2M2wtNS43OCw2LjU0MmwtNC44MjcsOC4xODJsMC4yOTQsMy45MDhsLTQuODk2LDEyLjI4N2wtMi4wMiw1LjEwN2wtMy4yMDIsMjIuMzkzbDAuNzIxLDguODQybC0xLjAzMywyLjk1bC0xLjcyNS0wLjI3NmwtNC4xMjUtNC40NjhsLTEuNjI0LDAuOTYybC0xLjM5NiwzLjI3MmwxLjgyMiw0Ljg0OGwtMS42OTIsNS4wMjFsLTQuNzMxLDYuNjA0bC04LjA2MiwxOS4yOTJsLTIuOTc3LDAuMzQxbC0wLjU0MSwwLjQ0OGwtMS40NzksMS4xOTVsMS4zMTYsNC40ODlsLTIuMjg0LDMuMzk1bC0yLjUxNCwxLjI2NGwtNS40ODQtNC41MzJsLTMuMDg4LTAuODk0bC0wLjgwNywxLjkwMWwyLjIyMSw3LjE3OGwtMy40LDEuMzg5bC04LjM2My0wLjEzbC0xLjUxMSwyLjJsMS4xMDIsNS4zNjVsLTAuNjg4LDIuNzczbC0zLjEzOCwzLjE2NWwtNi42MDMsMi44bC0zLjg5Niw0LjE4OGwtNC42MjktMS4zMjRsLTQuNzMxLDAuNjE3bC01LjA5Mi0yLjU4NGwtMi42MjUsMy41NjdsMC40NzMsMi43MTNsMC4xOCwxLjAyNmwtMS4zMTIsMS42ODdsLTEyLjQ1Miw0Ljc2NmwtNC41OTgsNC40ODVsLTcuMDYyLDExLjA2N2wtMTcuNjIzLDE5LjgwOWwtNC4wOTIsMS43MjdsLTQuNDk4LTAuNjE3bC0zLjY0Ni0zLjE4NGwtMi43OTUtNi41MTdsLTcuMTc2LTguODY3bC0xLjIzMy0wLjU1NmwtMy41MTUtMS42NDRsLTEuOTA0LTMuNjMybDEuMzQ5LTUuMzg3bC0zLjI3MS00LjA1OWwtNy4wMTUtNS41MTJsLTIuODkxLDEuNzk0bC00LjAyMywwLjQ3bC0yLjg3My0xLjcyOWwtMS4yNjctNS41NTVsNC43OTktOC4zNTRsLTAuMDgyLTEuNjAxbC0yLjUyOC00Ljg5NWwtOC4wMi05LjYxNGwtNS4zNTItNC4xNjZsLTQuNjE1LTEuODM3bC00LjIyMSwwLjY0MmwtNi43ODUtMC43NzFsLTQuODEzLTAuNTc0bC02Ljk0NiwyLjYyN2wtMy4wMDYsNC4wNTlsLTEuOTIyLDAuMjU1bC0xNC41NjgtNy44MzdsLTQuODYyLTAuNjIxbC04LjQ2LDEuODM3bC04LjQ4OS0wLjk4M2wtNC4yMDcsMC42NjRsLTcuNzE4LDQuMTY3bC0zLjUxNSwwLjY4MmwtMi45MDgtMS4xOTVsLTQuODEyLTQuNjgzbC00LjE1Ny0wLjU1M2wtNy4yNzMsMS40MzJsLTEuNjQyLTAuNjgybC0xLjM2My00LjEyN2wtNC44OTgtMy4wNzVsLTMuMTk5LTUuMjc5bC0xMS40MDEtOC44ODVsLTUuMjIyLTcuMTU5bC0zLjA4OC03LjU2NWwtMC40MDktNS44MzFsMy42MTEtMTIuNjcxbDAuMTMzLTUuODExbC0xLjE2OS00LjQ2OGwtNS44NDYtOC40MThsLTMuMDM3LTYuNDQ5bC0yLjMxNy00LjkzOGwxLjM2My0yLjc1M2wzLjc3NS0yLjA5NmwyLjk5Mi03LjQxNGw0LjQtMy45OTRsMi4xMDQtMy43NjFsLTQuMDI0LTkuOTE1bC0zLjg0NC02LjcyOWwtOC4zNDYtNy42NDdsLTguNzY5LTIuNTg4bC05LjQyOS0xMC4zNDJsLTQuMjU3LTIuMzI1bC01LjMxOC01LjM4NmwtNy4yNjItMS45NDVsLTAuNjcxLTAuMTY4bC01LjE3NS0xLjM5M2wtMi45NTYsMC41NmwtMi44NTcsMC41NTNsLTIuOTI0LTEuMDQ4bC0zLjk0NCwyLjA5NmwtMi4zLDQuMTIzbDAuMTQ3LDEuNDMybDAuMDg3LDAuNjgybDMuOTM4LDUuMTQ5bC0yLjM5NiwyLjUyM2wtMTAuODg4LTUuNjg1bC00LjIwNywwLjE1MWwtNS45OTMsMTEuNjYzbC00LjA5MiwzLjgyOWwtNi43MTctMC44MzNsLTkuOTIxLDMuMjY2bC03LjY1MiwyLjUyMmwtMi43NzYsMy4wMzNsLTAuMjk3LDIuNDU0bDMuMzAzLDQuMDQxbC0zLjAyMywxLjA5MWwtMC41OTIsMS4zNjd2Ny4wNDhsLTYuODgyLDE1LjcwNGwtMi43NzYsMTAuMjU2bDEuMjAyLDQuMTAybC0wLjgyNSwyLjYwOWwtMTIuMzE1LTUuMTkzbC04Ljc1OC02LjQzMWwtNS4wNDMsMi45MDdsLTAuODg2LDAuNDg4bDEuNDgxLTUuMjExbC0xLjYxLTYuNDA5bDIuMDItNS41NTZsLTAuOTE5LTIuNjdsLTQuNDM2LDEuMzY3bC00LjY4MS0wLjZsLTMuMDczLTQuOTEybC0xLjM0NS00LjYzN2wxLjE4LTIuOTQ5bDIuODk1LTEuOTY3bDcuMDExLTAuNzAzbDEuNjQzLTEuMzI4bC0wLjI2Mi0xLjc3bC03LjM0NS0zLjU0OWwtNi40Ny0xMC4zNjNsLTYuMTI2LDAuMDQzbC00LjU5OCw1LjA2NmwtMy41NjQsMC44NzNsLTQuNzQ4LDEuMTc2bC0wLjU5Mi0yLjEzNWwxLjA1MS0zLjgyNWwtMS4wODMtMi44NjRsLTMuMjg1LTAuNzA2TDY0LjM3NSwzMjhsLTIuNTk3LDYuNzUzbC00LjY5OCwzLjI5MWwtNC44NTktMC41NzdsMC43MDctMy44NDhsLTEuMTAyLTIuMzUxbC0zLjE3LDAuMzg0bC0zLjE3MS0zLjE1OGwtNC4wNDEsNC4zNzlsLTMuMTUyLDAuMjExbC0xLjY0NC0yLjM2OGwyLjYxMS0zLjIyOWw4LjU0My0zLjQ1OWwzLjQ0Ni0yLjgxN2wtMC4xMTUtMS4yNDJsLTEtMC43NWwtMi42OTMsMS4yNjNsLTUuMzg3LTAuNDMxbC0yLjE4NS0yLjIzOWwtMTAuNjQ0LTEwLjg5OGwtMC41OTItMi4xMzVsMS43MDctNi42MDNsLTAuNTc0LTIuNDk4bC0zLjUyOS0yLjk5M2wtMC42MDktMi4xNTdsMy42OTQtNy43MzdsMi4zMDItMC41OTZsMi43MTItNS41MTZsOS4xODEtOS40Mmw4LjU3MSwwLjA2NWwxMS42MjctNS41OTlsNS44MzUtNC45OTlsMS44NTQtMi43NzhsMy4yMzUtNC44OTVsNS44MzEtNC42NTRsMTIuODkzLTYuNDEzbDcuMTMtNi4zNDVsNS4wODktNy4zMDZsNS43MTctMi4zNzJsNS44MzEtOC4zMzNsMy4yODUtMi44NDJsNy40ODgtMi45NzFsNC44NjMtNi4wODZsMy4yMDMtMS4yNjNsMTAuMTY3LDEuMzY3bDYuNjcxLTEuNzUxbDUuMDU3LTMuNDM4bDE0Ljk4LTEyLjI4N2w0LjA4OC04LjI0N2wxNC4wNDQtMTQuNjE2bDYuNjY3LTEwLjc0NGw0LjAxLDMuOTEybDQuNDgzLTEuOTAybDUuMzA4LTQuNDg2bDEuNzktNC4yMTNsNi4xNTctMTQuNDAxbDQuODI3LTEuODU1bDYuNDA4LDQuOTEzbDIuNTk0LTIuODY0bC0wLjczOC01Ljg1M2wwLjY3NC0yLjk2OGwyMS45NjMtMTcuODg1bDUuMDM5LTIuNzM0bDUuNzk5LDMuMzEybDMuMzY3LTAuODc1bDMuNTMzLTMuNjk2bDEuODA4LTUuMjU3bDAuNDU5LTEuMzI0bDMuMjk5LDAuNzA3bDEuNDE0LTEwLjQ5M2wxLjgyMS0xLjMyNGw0LjY2NiwxLjMwM2w0LjQ2NS0xLjM0Nmw2LjU1NiwyLjExM2wtMC4xOTctMi4wNDlsLTAuMTE0LTEuMjM4bC0wLjAzMi0wLjI1OGwxLjcwNy0yLjU0MWwwLjQ0NCwwLjA2NGw5LjgxOSwxLjUxOGgwLjAxOGw2LjgxNy0yLjI5bDUuODYtMS45NjNsNy4wOTgtOC4yNWw4LjM2LTIuMmw0LjUzMi0yLjc1OWw0LjUwMS01Ljc2N2wyLjQ4MS0zLjE4M2w4LjE2My01LjIxbDQuOTkyLDIuMDI3bDQuNDE4LTMuOTcybDQuMDU3LTAuNDk2bDQuOTEzLTIuOTAzbDguNDc1LTEwLjgwOWwyLjc3NSwwLjY4MmwzLjM4MywzLjYxbDEuODksMi4wMzFsMi4zNjMsMi41MTlsOC42NDMtMC43NjhsMTUuNjAyLTEyLjM0OGw0LjgxMi0yLjQ1OGwxMS4wNzEtNS42NjNsMy43MTItMC4xNDdsLTAuNDc4LDUuNDQ3bDEuODkxLDAuNzlsNS43NjctMi42NjlsMy42MTEsMS4yNTlsLTIuNzI2LDQuOTU2bDAuMTQ3LDMuNTI3bDMuNzEyLTAuMzIzbDE3LjY3My0xMS41MTJsMi4zMTctMC41NzhsMi4wMDUsMS42ODdsLTAuOTg2LDIuMDc0bDAuNDA4LDEuOTY2bDExLjM1Mi0xLjg0MWw0LjM1NC0yLjU4NGwxLjcwNy0yLjM3Mmw0LjM4My02LjA4Nmw3LjE0Ny01LjIzNmwxMi40MzQtNS40NzNsNC41NjUtMC4wODZsMC45NjksMS40NTNsLTEuNzA3LDIuMzc2bDAuNzcxLDEuOTg0bDQuMDU2LTAuMjk4bDEzLjg0Ny01LjcyOGwyLjIzNCwxLjAwNWwtNC4wODksMy45OTRsLTIuMzM0LDYuOTAxbC0yLjE4NSwxLjQ3NWwtMy40ODItMC41NTZsLTMuMjIxLDEuMDQ0bC04LjkxNiw2Ljg2MWwtNi42ODQsNS4xMjhsLTMuNzgxLDEuNzNsLTExLjM5Ni0wLjI5OGwtNS45NDYsNS42NjNsLTMuMjUzLDQuNzQ0bC00LjI1NCwxLjAwNWwtMC4xNzksOS4zMTJsLTcuNjIxLTguMTgybC00Ljc0OSwwLjI3NmwtMy43NDMsNC4xOTFsLTEuMjM0LDYuNDQ5bDEuNzQzLDkuNjE3bDIuODA4LDYuNDkybDEuODcyLDQuMzM5bDcuMDQ4LDUuNjgxbDkuMzc4LTEuMjM4bDcuMTEyLTUuMDYzbDIuMjk5LTAuMjMzbDIuODc2LDEuOTJsMi45ODctMC4xNjhsMy44NzctMy4zMDlsOS4yOTYtMi45OTNsNC45MDktMy4yNDhsNS44NS03LjI0MmwzLjEwMy0yLjExN2w0LjA2LTAuMTI5bDMuMzk5LDEuOTY3bC05LjYyNSw4Ljc4MWwtMC4zMTIsMC45ODNsLTEuODI1LDUuNzY3bDAuODg5LDMuMDU4bDIuMzE3LDIuNDExbDMuMDA2LTAuMzYybDAuMzQ0LDMuMjA4bC00LjA1NiwzLjQ1OWwtNi41MDYsOS41MWwtNC4wMDcsMi43NTJsLTcuNzAzLTAuMjU1bC02LjY4NSwzLjUwNmwtMy4zMDQtMC41NmwtMi40NjMtMy4xMThsLTMuMzgzLTIuMTM1bC0xLjkzOSwwLjI1NGwtMi45NTYsMi42NDhsLTIuMjMzLDUuMzQ0bC0xLjk1NSw2LjkyMmwwLjU0NSwyLjY5MWwwLDBsMy44NDIsMTMuMDc3bDguMDQ4LDE1Ljk2Mmw2LjQzOCw3LjIybDEzLjMyMyw5LjQwMmwyMi41NDgsMTAuMjUzbDAuNjI3LDEuMjYzbDExLjU0NSw1LjYybDUuMzQsMi41ODNsNS4xNzUsMS41MzZsMy44NzQtMC40ODhsNS40NTQtMy4zNzZMNTczLjU4LDE3NC4yMTF6IE0zODcuNTE3LDYwMS45NzNsLTIuNzU5LTMuNjk2bDAuNDU5LTEuOTAybDIuMTM4LTEuMTNsMC4zMjctMi45NzVsMi41MTQtMS40NWwzLjgwOSwwLjU1NmwwLjQyNywxLjYyMmwtMi4yOCw3LjA5NWwtMi4wNTYsMi41NDFsMCwwTDM4Ny41MTcsNjAxLjk3M3ogTTM2NS42NTcsNjE0LjM0NmwzLjkwOSwxMS40OTFsMi4yMTcsMC42NjNsMC45ODItMi4wN2wtMC4yNDQtMC43NzFsLTEuMDgzLTMuNTIzbDAuNjM4LTIuNDM4bDIuNTk4LDAuMzAybDIuNzg5LDMuMTU4bDMuMDkzLDAuNzA3bDIuMjQ4LTMuMDU4bC0xLjk5LTUuMjExbDAuNjYtMi40MzdsMi42MjUtMC4zODRsNC43MTYsMi44ODVsNi4wMTEsMS4yMTdsMi4zMzUsMS45MDJsLTQuNjM0LDUuNTU1bC00LjE3MS0wLjIzNmwtMS40NzgsMS44NThsLTAuODQsMi42MDhsMi40NjUsMi42MDVsLTMuMjAzLDQuNzY2bDAuMDgzLDEuNzczbDMuNTI4LDUuNDY5bC0wLjU4OCwxLjIybC0yLjQ0OSwwLjM4NGwtNS45OTMtMS43NTFsLTYuMTkzLDEuOTYzbDAsMGwtMC4yOC00LjQyNWwtOC41MzksMC40MDlsLTAuNDQ0LTEuNDMybDMuMzg2LTQuNzQ0bC0wLjc4OS0xLjYyMmwtNi44NS0xLjc5NGwtMC42MjUtNC42MTVsNC45Ni01LjAyMWwtMi41MTQtMS45MDFsLTAuNDA5LTIuMTM2bDEuNDkyLTIuMDMxTDM2NS42NTcsNjE0LjM0NnpcXFwiLz5cXG5cdFxcblx0PHBhdGggaWQ9XFxcIm91dGVyLWJvcmRlclxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjRkZGRkZGXFxcIiBzdHJva2Utd2lkdGg9XFxcIjJcXFwiIGQ9XFxcIk0xOS4wNTgsMjgxLjU5NmwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bC0yLjM4Mi0xLjE3N2w3LjI5Mi0xMC4wNDFMMTkuMDU4LDI4MS41OTZ6IE02ODkuNDU1LDE5My44ODhsMi4xMDItMy4wNTRsLTAuOTAzLTIuNTE5bC0yLjM0Ny0xLjU0bC03LjM5NSwwLjQyN2wtMC44NTQtMC45NThsLTEuNDQxLTEuNjQ3bDAuMjI5LTMuODY5bDUuMzM2LTEwLjQyOGwtMC40MDktMS45NjNsLTEuOTg5LTEuODhsLTYuMzczLDEuMjJsLTYuMzA1LTAuMjE1bC01LjgzMi00LjkxNmwtNy43NjgtMi4yMjFsLTQuNDE4LTUuMjExbC0zLjA1Ny0xLjk0OWwtMTEuNDgyLTEuMzY3bC0yLjg5Mi0xLjU3NWwtMi42OTMtNC45MTdsLTExLjkwNi05LjE2NWwtNC4yNzEtMi4wMWwtNS4wNTcsMi41MjNsLTEuNDQ1LDMuOTczbDEsNi45MjJsLTEuNTYsNS41NTVsLTUuMzU0LDQuODA5bC04LjkwMSwyLjQ3OWwtMTkuODksMTMuODJsLTYuMzA5LDAuMTcybC01LjQ1NCwzLjM3NmwtMy44NzQsMC40ODhsLTUuMTc1LTEuNTM2bC01LjM0LTIuNTgzbC0xMS41NDUtNS42MmwtMC42MjctMS4yNjNsLTIyLjU0OC0xMC4yNTNsLTEzLjMyMy05LjQwMmwtNi40MzgtNy4yMmwtOC4wNDgtMTUuOTYybC0zLjg0Mi0xMy4wNzdsLTAuNTQ1LTIuNjkxbDEuOTU1LTYuOTIybDIuMjMzLTUuMzQ0bDIuOTU2LTIuNjQ4bDEuOTM5LTAuMjU0bDMuMzgzLDIuMTM1bDIuNDYzLDMuMTE4bDMuMzA0LDAuNTZsNi42ODUtMy41MDZsNy43MDMsMC4yNTVsNC4wMDctMi43NTJsNi41MDYtOS41MWw0LjA1Ni0zLjQ1OWwtMC4zNDQtMy4yMDhsLTMuMDA2LDAuMzYybC0yLjMxNy0yLjQxMWwtMC44ODktMy4wNThsMS44MjUtNS43NjdsMC4zMTItMC45ODNsOS42MjUtOC43ODFsLTMuMzk5LTEuOTY3bC00LjA2LDAuMTI5bC0zLjEwMywyLjExN2wtNS44NSw3LjI0MmwtNC45MDksMy4yNDhsLTkuMjk2LDIuOTkzbC0zLjg3NywzLjMwOWwtMi45ODcsMC4xNjhsLTIuODc2LTEuOTJsLTIuMjk5LDAuMjMzbC03LjExMiw1LjA2M2wtOS4zNzgsMS4yMzhsLTcuMDQ4LTUuNjgxbC0xLjg3Mi00LjMzOWwtMi44MDgtNi40OTJsLTEuNzQzLTkuNjE3bDEuMjM0LTYuNDQ5bDMuNzQzLTQuMTkxbDQuNzQ5LTAuMjc2bDcuNjIxLDguMTgybDAuMTc5LTkuMzEybDQuMjU0LTEuMDA1bDMuMjUzLTQuNzQ0bDUuOTQ2LTUuNjYzbDExLjM5NiwwLjI5OGwzLjc4MS0xLjczbDYuNjg0LTUuMTI4bDguOTE2LTYuODYxbDMuMjIxLTEuMDQ0bDMuNDgyLDAuNTU2bDIuMTg1LTEuNDc1bDIuMzM0LTYuOTAxbDQuMDg5LTMuOTk0bC0yLjIzNC0xLjAwNWwtMTMuODQ3LDUuNzI4bC00LjA1NiwwLjI5OGwtMC43NzEtMS45ODRsMS43MDctMi4zNzZsLTAuOTY5LTEuNDUzbC00LjU2NSwwLjA4NmwtMTIuNDM0LDUuNDczbC03LjE0Nyw1LjIzNmwtNC4zODMsNi4wODZsLTEuNzA3LDIuMzcybC00LjM1NCwyLjU4NGwtMTEuMzUyLDEuODQxbC0wLjQwOC0xLjk2NmwwLjk4Ni0yLjA3NGwtMi4wMDUtMS42ODdsLTIuMzE3LDAuNTc4bC0xNy42NzMsMTEuNTEybC0zLjcxMiwwLjMyM2wtMC4xNDctMy41MjdsMi43MjYtNC45NTZsLTMuNjExLTEuMjU5bC01Ljc2NywyLjY2OWwtMS44OTEtMC43OWwwLjQ3OC01LjQ0N2wtMy43MTIsMC4xNDdsLTExLjA3MSw1LjY2M2wtNC44MTIsMi40NThsLTE1LjYwMiwxMi4zNDhsLTguNjQzLDAuNzY4bC0yLjM2My0yLjUxOWwtMS44OS0yLjAzMWwtMy4zODMtMy42MWwtMi43NzUtMC42ODJsLTguNDc1LDEwLjgwOWwtNC45MTMsMi45MDNsLTQuMDU3LDAuNDk2bC00LjQxOCwzLjk3MmwtNC45OTItMi4wMjdsLTguMTYzLDUuMjFsLTIuNDgxLDMuMTgzbC00LjUwMSw1Ljc2N2wtNC41MzIsMi43NTlsLTguMzYsMi4ybC03LjA5OCw4LjI1bC01Ljg2LDEuOTYzbC02LjgxNywyLjI5aC0wLjAxOGwtOS44MTktMS41MThsLTAuNDQ0LTAuMDY0bC0xLjcwNywyLjU0MWwwLjAzMiwwLjI1OGwwLjExNCwxLjIzOGwwLjE5NywyLjA0OWwtNi41NTYtMi4xMTNsLTQuNDY1LDEuMzQ2bC00LjY2Ni0xLjMwM2wtMS44MjEsMS4zMjRsLTEuNDE0LDEwLjQ5M2wtMy4yOTktMC43MDdsLTAuNDU5LDEuMzI0bC0xLjgwOCw1LjI1N2wtMy41MzMsMy42OTZsLTMuMzY3LDAuODc1bC01Ljc5OS0zLjMxMmwtNS4wMzksMi43MzRsLTIxLjk2MywxNy44ODVsLTAuNjc0LDIuOTY4bDAuNzM4LDUuODUzbC0yLjU5NCwyLjg2NGwtNi40MDgtNC45MTNsLTQuODI3LDEuODU1bC02LjE1NywxNC40MDFsLTEuNzksNC4yMTNsLTUuMzA4LDQuNDg2bC00LjQ4MywxLjkwMmwtNC4wMS0zLjkxMmwtNi42NjcsMTAuNzQ0bC0xNC4wNDQsMTQuNjE2bC00LjA4OCw4LjI0N2wtMTQuOTgsMTIuMjg3bC01LjA1NywzLjQzOGwtNi42NzEsMS43NTFsLTEwLjE2Ny0xLjM2N2wtMy4yMDMsMS4yNjNsLTQuODYzLDYuMDg2bC03LjQ4OCwyLjk3MWwtMy4yODUsMi44NDJsLTUuODMxLDguMzMzbC01LjcxNywyLjM3MmwtNS4wODksNy4zMDZsLTcuMTMsNi4zNDVMODAuNDcxLDI0NC40bC01LjgzMSw0LjY1NGwtMy4yMzUsNC44OTVsLTEuODU0LDIuNzc4bC01LjgzNSw0Ljk5OWwtMTEuNjI3LDUuNTk5bC04LjU3MS0wLjA2NWwtOS4xODEsOS40MmwtMi43MTIsNS41MTZsLTIuMzAyLDAuNTk2bC0zLjY5NCw3LjczN2wwLjYwOSwyLjE1N2wzLjUyOSwyLjk5M2wwLjU3NCwyLjQ5OGwtMS43MDcsNi42MDNsMC41OTIsMi4xMzVsMTAuNjQ0LDEwLjg5OGwyLjE4NSwyLjIzOWw1LjM4NywwLjQzMWwyLjY5My0xLjI2M2wxLDAuNzVsMC4xMTUsMS4yNDJsLTMuNDQ2LDIuODE3bC04LjU0MywzLjQ1OWwtMi42MTEsMy4yMjlsMS42NDQsMi4zNjhsMy4xNTItMC4yMTFsNC4wNDEtNC4zNzlsMy4xNzEsMy4xNThsMy4xNy0wLjM4NGwxLjEwMiwyLjM1MWwtMC43MDcsMy44NDhsNC44NTksMC41NzdsNC42OTgtMy4yOTFMNjQuMzc1LDMyOGwyLjg0MS0wLjkxOWwzLjI4NSwwLjcwNmwxLjA4MywyLjg2NGwtMS4wNTEsMy44MjVsMC41OTIsMi4xMzVsNC43NDgtMS4xNzZsMy41NjQtMC44NzNsNC41OTgtNS4wNjZsNi4xMjYtMC4wNDNsNi40NywxMC4zNjNsNy4zNDUsMy41NDlsMC4yNjIsMS43N2wtMS42NDMsMS4zMjhsLTcuMDExLDAuNzAzbC0yLjg5NSwxLjk2N2wtMS4xOCwyLjk0OWwxLjM0NSw0LjYzN2wzLjA3Myw0LjkxMmw0LjY4MSwwLjZsNC40MzYtMS4zNjdsMC45MTksMi42N2wtMi4wMiw1LjU1NmwxLjYxLDYuNDA5bC0xLjQ4MSw1LjIxMWwwLjg4Ni0wLjQ4OGw1LjA0My0yLjkwN2w4Ljc1OCw2LjQzMWwxMi4zMTUsNS4xOTNsMC44MjUtMi42MDlsLTEuMjAyLTQuMTAybDIuNzc2LTEwLjI1Nmw2Ljg4Mi0xNS43MDR2LTcuMDQ4bDAuNTkyLTEuMzY3bDMuMDIzLTEuMDkxbC0zLjMwMy00LjA0MWwwLjI5Ny0yLjQ1NGwyLjc3Ni0zLjAzM2w3LjY1Mi0yLjUyMmw5LjkyMS0zLjI2Nmw2LjcxNywwLjgzM2w0LjA5Mi0zLjgyOWw1Ljk5My0xMS42NjNsNC4yMDctMC4xNTFsMTAuODg4LDUuNjg1bDIuMzk2LTIuNTIzbC0zLjkzOC01LjE0OWwtMC4wODctMC42ODJsLTAuMTQ3LTEuNDMybDIuMy00LjEyM2wzLjk0NC0yLjA5NmwyLjkyNCwxLjA0OGwyLjg1Ny0wLjU1M2wyLjk1Ni0wLjU2bDUuMTc1LDEuMzkzbDAuNjcxLDAuMTY4bDcuMjYyLDEuOTQ1bDUuMzE4LDUuMzg2bDQuMjU3LDIuMzI1bDkuNDI5LDEwLjM0Mmw4Ljc2OSwyLjU4OGw4LjM0Niw3LjY0N2wzLjg0NCw2LjcyOWw0LjAyNCw5LjkxNWwtMi4xMDQsMy43NjFsLTQuNCwzLjk5NGwtMi45OTIsNy40MTRsLTMuNzc1LDIuMDk2bC0xLjM2MywyLjc1M2wyLjMxNyw0LjkzOGwzLjAzNyw2LjQ0OWw1Ljg0Niw4LjQxOGwxLjE2OSw0LjQ2OGwtMC4xMzMsNS44MTFsLTMuNjExLDEyLjY3MWwwLjQwOSw1LjgzMWwzLjA4OCw3LjU2NWw1LjIyMiw3LjE1OWwxMS40MDEsOC44ODVsMy4xOTksNS4yNzlsNC44OTgsMy4wNzVsMS4zNjMsNC4xMjdsMS42NDIsMC42ODJsNy4yNzMtMS40MzJsNC4xNTcsMC41NTNsNC44MTIsNC42ODNsMi45MDgsMS4xOTVsMy41MTUtMC42ODJsNy43MTgtNC4xNjdsNC4yMDctMC42NjRsOC40ODksMC45ODNsOC40Ni0xLjgzN2w0Ljg2MiwwLjYyMWwxNC41NjgsNy44MzdsMS45MjItMC4yNTVsMy4wMDYtNC4wNTlsNi45NDYtMi42MjdsNC44MTMsMC41NzRsNi43ODUsMC43NzFsNC4yMjEtMC42NDJsNC42MTUsMS44MzdsNS4zNTIsNC4xNjZsOC4wMiw5LjYxNGwyLjUyOCw0Ljg5NWwwLjA4MiwxLjYwMWwtNC43OTksOC4zNTRsMS4yNjcsNS41NTVsMi44NzMsMS43MjlsNC4wMjMtMC40N2wyLjg5MS0xLjc5NGw3LjAxNSw1LjUxMmwzLjI3MSw0LjA1OWwtMS4zNDksNS4zODdsMS45MDQsMy42MzJsMy41MTUsMS42NDRsMS4yMzMsMC41NTZsNy4xNzYsOC44NjdsMi43OTUsNi41MTdsMy42NDYsMy4xODRsNC40OTgsMC42MTdsNC4wOTItMS43MjdsMTcuNjIzLTE5LjgwOWw3LjA2Mi0xMS4wNjdsNC41OTgtNC40ODVsMTIuNDUyLTQuNzY2bDEuMzEyLTEuNjg3bC0wLjE4LTEuMDI2bC0wLjQ3My0yLjcxM2wyLjYyNS0zLjU2N2w1LjA5MiwyLjU4NGw0LjczMS0wLjYxN2w0LjYyOSwxLjMyNGwzLjg5Ni00LjE4OGw2LjYwMy0yLjhsMy4xMzgtMy4xNjVsMC42ODgtMi43NzNsLTEuMTAyLTUuMzY1bDEuNTExLTIuMmw4LjM2MywwLjEzbDMuNC0xLjM4OWwtMi4yMjEtNy4xNzhsMC44MDctMS45MDFsMy4wODgsMC44OTRsNS40ODQsNC41MzJsMi41MTQtMS4yNjRsMi4yODQtMy4zOTVsLTEuMzE2LTQuNDg5bDEuNDc5LTEuMTk1bDAuNTQxLTAuNDQ4bDIuOTc3LTAuMzQxbDguMDYyLTE5LjI5Mmw0LjczMS02LjYwNGwxLjY5Mi01LjAyMWwtMS44MjItNC44NDhsMS4zOTYtMy4yNzJsMS42MjQtMC45NjJsNC4xMjUsNC40NjhsMS43MjUsMC4yNzZsMS4wMzMtMi45NWwtMC43MjEtOC44NDJsMy4yMDItMjIuMzkzbDIuMDItNS4xMDdsNC44OTYtMTIuMjg3bC0wLjI5NC0zLjkwOGw0LjgyNy04LjE4Mmw1Ljc4LTYuNTQybDMuMzUxLTYuNjYzbDguOTM4LTYuNTM5bDUuMzU0LTcuOTY3bDExLjk4OS03Ljc1OGwzLjkwOS0xLjE3M2wzLjY4LTMuMzEybDEuNDc4LTQuMzEzbC0wLjYwOS00LjQ0NmwtMC4xMjktMC44OTdsMi42NjEtMy43MThsMi41NDYtMS42MjJsNy44NTEsMC4xMjlsMi42OTMtMS4wOTVsMS45MzctMy4zOTVsLTEuNDc4LTEuNjlsLTQuMzg2LDAuMjhsLTEuNjQtMS44NTlsLTMuMjItMTAuNTk3bDMuMjg0LTExLjU5OWw3LjQzOC0xNi40OTdsMi43MTEtMS42MDRsNC4wMTEsMC40MDVsOC4zNDEsMy44NDdsMi4xMDIsMC4xMjlsMS40OTUtMS42NjVsMC4zNjMtMi44NjhsMC42MDUtNC44MjdsLTEuMDMyLTYuMjM3bDIuMDE5LTQuNDY4bDEuNzU4LTAuMjU0bDYuNzg1LDMuNzU3bDAuOTgyLTEuODhsLTIuMTY2LTE2LjY4N2wwLjczOS0zLjg0M2wyLjAxOS0xLjQ1bC0wLjAxNS0yLjg0NmwtMy4wNzMtNC4yMzFsLTAuMzQ0LTMuMTgzbDIuMTY5LTcuMTE2TDY4OS40NTUsMTkzLjg4OHogTTM5Mi4xNTEsNjAxLjA5MmwyLjI4LTcuMDk1bC0wLjQyNy0xLjYyMmwtMy44MDktMC41NTZsLTIuNTE0LDEuNDVsLTAuMzI3LDIuOTc1bC0yLjEzOCwxLjEzbC0wLjQ1OSwxLjkwMmwyLjc1OSwzLjY5NmwyLjU3OCwwLjY2TDM5Mi4xNTEsNjAxLjA5MnogTTM4OC44MTUsNjEzLjY2bC00LjcxNi0yLjg4NWwtMi42MjUsMC4zODRsLTAuNjYsMi40MzdsMS45OSw1LjIxMWwtMi4yNDgsMy4wNThsLTMuMDkzLTAuNzA3bC0yLjc4OS0zLjE1OGwtMi41OTgtMC4zMDJsLTAuNjM4LDIuNDM4bDEuMDgzLDMuNTIzbDAuMjQ0LDAuNzcxbC0wLjk4MiwyLjA3bC0yLjIxNy0wLjY2M2wtMy45MDktMTEuNDkxbC0yLjU4Mi0wLjY2NGwtMS40OTIsMi4wMzFsMC40MDksMi4xMzZsMi41MTQsMS45MDFsLTQuOTYsNS4wMjFsMC42MjUsNC42MTVsNi44NSwxLjc5NGwwLjc4OSwxLjYyMmwtMy4zODYsNC43NDRsMC40NDQsMS40MzJsOC41MzktMC40MDlsMC4yOCw0LjQyNWw2LjE5My0xLjk2M2w1Ljk5MywxLjc1MWwyLjQ0OS0wLjM4NGwwLjU4OC0xLjIybC0zLjUyOC01LjQ2OWwtMC4wODMtMS43NzNsMy4yMDMtNC43NjZsLTIuNDY1LTIuNjA1bDAuODQtMi42MDhsMS40NzgtMS44NThsNC4xNzEsMC4yMzZsNC42MzQtNS41NTVsLTIuMzM1LTEuOTAyTDM4OC44MTUsNjEzLjY2elxcXCIvPlxcblx0XFxuXHQ8cGF0aCBpZD1cXFwiZmxldmVzXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIGQ9XFxcIk0zMDQuNTM0LDEyMi4yODFjMC4zMzQtMC40NCwwLjU2NC0wLjk3OSwxLjAzMy0xLjNjMC44NTEtMS4wOTYsMS42MzEtMi4yNDcsMi41MjgtMy4zMDVjMC4zNDMtMC4zOTcsMC45ODMtMC43MjUsMS40NDgtMC4zMzZjMC4wOTQsMC4zNC0wLjYyOSwwLjYzOC0wLjE2MywwLjk4YzAuMTMyLDAuMjMzLDAuODQ1LDAuMTY3LDAuMzQ0LDAuMzIxYy0wLjQ2MiwwLjE4OS0wLjkzMywwLjQwNy0xLjI0MSwwLjgxNWMtMC45MzIsMC45NTUtMS40MTksMi4yMzItMS44MDEsMy40ODdjLTAuNTEsMC40MzEsMC41MTUsMS4xODQsMC42NzUsMC40NjJjMC4xNTEtMC4zMTgsMC43ODItMC4wODUsMC4zODksMC4yMDNjLTAuMzgsMC40NTgtMC4zNTgsMS4xMTYsMC4xMTYsMS40NzJjMC4yMDgsMC40OTgtMC4zNzIsMC43NzEtMC43NTksMC41MzRjLTAuNjU0LTAuMDgxLTAuOTg2LDAuNTU3LTEuNDg3LDAuODE4Yy0wLjU5NiwwLjM1NC0xLjA1Ni0wLjI1OC0xLjU2My0wLjQ2NmMtMC40MDMtMC4xNTItMC42OTEtMC42ODctMC4xMjgtMC44MzVjMC4zNjgtMC4xMDYsMC4yMzQtMC42MzQtMC4xNDYtMC4zODZjLTAuNTI2LDAuMjQ1LTEuMjE1LDAuMTUyLTEuNTQzLDAuNjYyYy0wLjU0MywwLjM3OC0wLjU2My0wLjM5NC0wLjMyNi0wLjcwMWMwLjM2Mi0wLjY0NiwxLjA2Mi0wLjk3OSwxLjU2Ny0xLjQ5NUMzMDMuODI3LDEyMi44OTcsMzA0LjE3MywxMjIuNTc5LDMwNC41MzQsMTIyLjI4MUwzMDQuNTM0LDEyMi4yODF6IE0yODMuNzAxLDEzOC45MDZjMS4wNDQtMC43OTIsMi4wODctMS41ODMsMy4xMzEtMi4zNzVjMC4xOTItMC4yODIsMC44NzUtMC41NzYsMC45NTItMC4wOGMwLjA3OSwwLjI5LDAuMzI1LDAuNjg0LDAuNjc3LDAuNTM3YzAuMTIzLTAuMjIsMC42NjcsMC4wMzgsMC4yODYsMC4xMjVjLTAuMzMzLDAuMTc3LTAuODcsMC4zNDItMC44NCwwLjgwOGMwLjAzMSwwLjQwNiwwLjIyOSwwLjc3LDAuMzcxLDEuMTQ0Yy0wLjI5OCwwLjUxMSwwLjEyNCwxLjEyMS0wLjE1LDEuNjM4Yy0wLjE0MiwwLjM4NS0wLjE0MiwwLjg2NC0wLjQ4OCwxLjE0Yy0wLjQyMywwLjEzLTAuOTM4LTAuMTctMS4yOTcsMC4xNzZjLTAuMzk4LDAuMjU5LTAuNzk4LTAuMTI4LTEuMTg0LTAuMjE0Yy0wLjUyMi0wLjEzNy0xLjA3LTAuMTEyLTEuNTk5LTAuMDMxYy0wLjM1Ni0wLjIzNC0wLjgzMS0wLjEzNS0xLjEyOSwwLjA1Yy0wLjQ3Ny0wLjExMy0wLjUzMywwLjQ4MS0wLjc4MiwwLjcxMmMtMC4wOTMtMC4xNTgsMC4xMzEtMC41MDMsMC4yMzgtMC42OTdjMC4xNDQtMC4yNDMsMC4zNjktMC40MjMsMC41MzYtMC42NDRjMC4xNjUtMC4zODIsMC4zNjItMC44MjUsMC44Mi0wLjljMC40MDMtMC4yMTIsMC4yMjUtMC43MzUsMC4xLTAuOTk1QzI4My40MzYsMTM5LjE0NCwyODMuNjI5LDEzOS4wNzYsMjgzLjcwMSwxMzguOTA2TDI4My43MDEsMTM4LjkwNnogTTI5Ny41NSw4My44OTZjMC43NDYsMC4yNzcsMS40OTIsMC41NTUsMi4yMzcsMC44MzJjMC4xNTksMS4yNzksMS45MzIsMC40NDUsMi4xNjIsMS43MjRjMC42MTIsMC44NjcsMS45MTksMC4wNzEsMi44MDEsMC40OThjMS4wNjEsMC4xMzYsMS40NzgsMS4xNTgsMi4wODMsMS44OTJjMC42NzksMC44OTQsMS4zNjIsMS43ODYsMS45NjksMi43MzFjMS4yMzctMC43MDMsMS41NDIsMC41NjgsMi4wOTQsMS40MjVjMS4yMjksMC45MTYsMi40ODIsMS44MDIsMy43ODgsMi42MDVjMC42ODUsMC44NjUsMS4wNywxLjc4LDIuMzU0LDEuNTA5YzAuOTEzLTAuMTg5LDEuNzEtMC42NjgsMi42ODEtMC4xOThjMS4wMDYtMC4xMzYsMi4wNzItMC4zOTQsMi4xMzItMS41MzdjMS4xOCwwLjI3OCwyLjE1OC0wLjA2OCwyLjk2NC0wLjk1N2MxLjE5Ni0wLjIzNiwxLjMyNi0xLjM0OSwxLjk0Ny0yLjE1YzAuNDM0LTAuMiwwLjkwNy0wLjMxNSwxLjM0OS0wLjUwNSBNMzE1LjY0Myw5Ni45NDdjLTAuMzYzLDAuOTc3LTAuODA2LDEuOTYyLTEuNTY0LDIuNjk5Yy0wLjQzMywwLjgxMSwwLjMyLDIuMjAzLTAuOTA4LDIuNTI0Yy0wLjc5MiwwLjIxLTEuMTc2LDAuODU3LTEuMzMzLDEuNjE5Yy0wLjA3NCwwLjkwMi0xLjI1OSwwLjc3OS0xLjU0MiwxLjQ5NWMtMC4yNDIsMC42MzMtMC40ODQsMS4yNjYtMC43MjYsMS44OThjMC4zODksMC44NDUsMC40NDksMS45NjItMC41NjYsMi4zNTRjLTAuNTM5LDAuODYxLTAuMTQ4LDEuOTM3LTAuMTMyLDIuODdjMC4yNzksMC43OTIsMS4yNTEsMS4xNCwxLjQyMSwxLjk3N2MtMC4xNDQsMC45ODYtMS4zOTMsMS4yNDUtMS44LDIuMDkxYy0wLjEwNCwwLjIxMy0wLjE0MywwLjQ1NC0wLjEzNywwLjY4OSBNMzAxLjQ1LDEyNS4yODhjLTEuNjcsMS43NDktMy4xOTcsMy42MjUtNC43OTYsNS40MzhjLTAuNzQ4LDAuMjE0LTEuNzA4LDAuMDU5LTIuMjMsMC43NjFjLTAuNDA5LDAuMzQtMC43MDcsMC44NTMtMS4xOTQsMS4wNzNjLTAuNzU1LDAuMTk5LTEuNTEsMC4zOTgtMi4yNjUsMC41OTdjLTAuNjIzLDEuMjM3LTEuMjY3LDIuNDcyLTIuMDgyLDMuNTk2Yy0wLjE1OCwwLjA2LTAuMzE3LDAuMTE5LTAuNDc2LDAuMTc5IE0yODEuMzExLDE0My4wNzJjLTAuNzE3LDAuODg0LTEuNzg0LDEuNDA1LTIuODc1LDEuNjZjLTAuNTMyLDAuNDAxLDAuMTU4LDEuMjUtMC40NjMsMS42NTVjLTAuNjQyLDAuODcyLTEuNDY1LDEuNjI1LTIuNDUxLDIuMDgxYy0xLjEzMywwLjgxLTIuMjA2LDEuNzkxLTIuNzksMy4wOGMtMC4yMjksMC4zOTUtMC40NTgsMC43OTEtMC42OTEsMS4xODQgTTE3OC4wODgsMzE2LjY5NGwtMC44NjEsMC43NjFsLTAuMzMxLTAuNDJsLTAuNDAxLTAuMDJsLTAuNzMzLTAuNDQxbC0xLjExNC0wLjgyOGwtMC40MDItMC4wMjFsLTEuMTU0LTAuMDZsLTAuNzUzLTAuMDU3bC0wLjM4Mi0wLjQybC0xLjExNS0wLjgxMmwtMS4wOTctMC44NzhsLTEuMTE1LTAuODExbC0yLjIwOS0yLjA0bDAuODUtMS41MTJsMC43OTQtMC43MTFsMC45LTEuNTEybDMuMjIxLTIuNTI3bDEuNjE2LTEuMDcxbDEuOTg1LTEuMDM1bC0wLjMxMi0wLjc3MWwtMS4wOTUtMS4yMjlsLTAuNzY3LTAuNDQxbC0xLjEzNC0wLjQ3OGwtMC4zODItMC4zNzFsLTEuMTcyLTAuMDYxbC0xLjQ0OS0wLjg5N2wtMC40MDEtMC4wMjFsLTAuNzEzLTAuNzkxbC0xLjExNC0wLjg3OGwtMS4xMzYtMC40MTFsLTEuMTM1LTAuNDYxbC0wLjc4Mi0wLjQ1OGwtMS41NTctMC4wODFsLTAuNzE0LTAuODA4bDAuODMtMS4wOTVsMC4wMjEtMC40MTdsMC4wNC0wLjc1MWwwLjQyMi0wLjM2NGwwLjQyMi0wLjMzbDAuNDIyLTAuMzhsLTAuMzQ1LTAuNzcxbC0wLjM4Mi0wLjQzOGwtMC40MDEtMC4wMmwtMC43MzMtMC40NGwtMC40MDEtMC4wMmwtMS4xNTQtMC4wNzdsLTAuMzMyLTAuMzdsLTAuNDAxLTAuMDIxbC0wLjc3MywwLjMxMWwtMC40MTgtMC4wMjFsLTAuMzgyLTAuMzcxbC0wLjcxNy0wLjQ1N2wwLjAyMS0wLjRsLTAuMzQyLTEuMTcybC0wLjI5MS0xLjE3MWwwLjAzNy0wLjRsMC4wMi0wLjM1MWwwLjM3MS0wLjM4MWwwLjQyMi0wLjM4bDIuMDA1LTEuNDAybDAuODQ0LTAuNzQ0bDEuNjQ1LTIuMjIzbDAuNDAxLDAuMDJsMS4xNTUsMC4wNmwxLjE1NCwwLjA3N2wwLjAyLTAuNDAxbDAuMDIxLTAuMzVsMS4yMzEtMS4wOTFsMC40MDIsMC4wMmwwLjQ0MS0wLjc4MWwwLjgxMS0wLjcxMWwwLjQyMi0wLjM2M2wwLjM5Mi0wLjczMWwwLjQyMi0wLjM4bDAuNzcyLTAuMzExbDAuNDAyLDAuMDJsMC40MDEsMC4wMmwwLjM4OS0wLjM4bDAuMDM5LTAuNzUxbDAuNDQyLTAuNzgxbDAuNDU5LTAuNzNsMC4zMzgtMC4zNDhsMC4wNjctMC4wMTZsMC44NS0xLjQ5NmwtMC4zMDgtMS4xNzFsLTAuMzQ1LTAuODA1bDAuMDItMC4zODRsMC4wNjEtMS4xNTJsMC4wNTgtMC43NjhsMC4wNC0wLjc2OGwtMC4zNjUtMC40MmwtMC4zODUtMC4wMmwtMC40MDUsMC4zNjRsLTAuMzg1LTAuMDJsLTAuMzQ1LTAuNzg4bC0wLjM4NS0wLjAybDAuMDItMC4zODRsLTAuNzQ5LTAuNDRsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAybC0wLjgwNywwLjM0NGwtMC4zNDktMC40MDRsLTAuNDAxLTAuMDM3bC0wLjc3LTAuMDRsLTAuMzg2LTAuMDIxbC0wLjQwNCwwLjM2NGwtMC4zODYtMC4wMjFsLTAuNDA0LDAuMzY0bC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMzdsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwwLjAyLTAuMzg0bC0wLjM4NS0wLjAyMWwwLjAyLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM2NC0wLjQybDAuMzg1LDAuMDM3bC0wLjM2NS0wLjQybC0wLjM0NS0wLjc4OGwtMC43NDktMC40MjRsLTAuMzg2LTAuMDJsLTAuMzY0LTAuNDIxbC0wLjM0NS0wLjc4OGwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDAuMDM2LTAuMzg0bC0wLjM2NC0wLjQwNGwwLjAyLTAuMzg0bC0wLjM2NC0wLjQyMWwwLjQyNS0wLjc0OGwtMC4zNjUtMC40MDRsMS4xMzUsMC40NmwxLjE5MS0wLjMyM2wwLjAyMS0wLjM4NGwwLjgzLTEuMTExbC0xLjQ5OS0wLjg2NWwwLjA0LTAuNzY4bDAuMDM2LTAuMzg0bDMuMjE3LTIuMTQzbDIuNDI3LTEuNzgybDAuMDQtMC43NjhsMC40MjItMC4zNjRsMC40ODUtMS45MTZsMC4wMjEtMC4zODRsMC40NDEtMC43NDhsMC4xNTctMi42ODdsMi44MzItMi4xNjNsMC4zODYsMC4wMmwxLjE1NCwwLjA3N2wwLjM4NSwwLjAybDAuNzUsMC40MjRsMC4zODUsMC4wMmwxLjE3MiwwLjA3N2wwLjc1LDAuNDI0bDAuMzg1LDAuMDIxbDEuNTQsMC4wOTdsMC4zODUsMC4wMmwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDAuMTM3LTIuMzJsLTAuMzQ1LTAuNzg4bDEuNTc3LTAuMzAzbDAuMzg1LDAuMDJsMC43NywwLjA1N2wwLjM2NSwwLjQwNGwwLjM2NSwwLjQwNGwxLjkwNCwwLjUwMWwxLjU1NywwLjA4MWwwLjM2NCwwLjQybDAuNzUsMC40MjRsMC4zODUsMC4wMmwxLjU2MS0wLjMwNGwwLjc0OSwwLjQ0bDAuMzQ2LDAuNzg4bDIuOTc5LDIuMDk3bDAuNzUsMC40NGwwLjc1LDAuNDI0bDEuNTIsMC40OGwxLjUyLDAuNDY0bDEuMTcyLDAuMDc3bDEuMTk0LTAuNzA4bDEuMTM1LDAuNDQ0bDAuNzcxLDAuMDU3bDAuODQ3LTEuMTExbDAuNzktMC4zNDRsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4zODYsMC4wMmwwLjc0OSwwLjQ0MWwtMS4wMzctMS45OTdsLTAuNzEtMS4yMDhsLTAuMzQ1LTAuNzg4bDAuODA3LTAuMzQ0bDEuNTgtMC42NzFsMC40MDUtMC4zNjRsMS4xOTEtMC4zMjN2LTAuMDE3bDEuOTg1LTEuMDM0bDIuMDAyLTEuMDM1bDEuNTk3LTAuNjg4bDAuNzI5LDAuODI1bDAuNzcsMC4wNGwyLjMxLDAuMTM3bDEuMTcyLDAuMDYxbDAuMzY1LDAuNDA0bDAuNzEzLDAuODI1bDMuMDU2LDAuOTQ1bDEuMTM1LDAuNDQ0bDMuODEsMS4wMDFsMi4zMjYsMC4xMzdsMS4xNTUsMC4wNmwwLjc3LDAuMDQxbDEuOTIyLDAuNTAxbDAuNzcsMC4wNGwyLjI4OSwwLjUyMWwxLjE1NSwwLjA2bC0wLjAyLDAuMzg0bDIuMzA2LDAuNTIxbDEuNTQsMC4wOTdsMC43OS0wLjM0NGwwLjQwNS0wLjM2NGwxLjIzMS0xLjA5MWwxLjYxNy0xLjA3MWwwLjgxLTAuNzExbDAuODExLTAuNzI4bDAuNDIyLTAuMzYzbDAuNDA0LTAuMzY0bDIuMDIyLTEuNDM1bDAuMzg1LDAuMDJsMC44MTEtMC43MjhsMC44MjYtMC43MjhsMi4zNTEtMC42M2wxLjU3Ni0wLjMwNGwxLjExNCwwLjg0NWwwLjc3MSwwLjA0bDEuNTM5LDAuMDk3bDAuMzg2LDAuMDJsMC4wMzYtMC4zODRsLTAuNjg5LTEuNTkybC0wLjE0Ni00LjI2bDAuMDItMC4zODRsLTAuNTcyLTMuNTEybC0wLjU1Mi0zLjg5NmwtMC41OTItMy4xMjhsMC4wMi0wLjM4NGwwLjAzNy0wLjM4NGwtMC44NzctNS4wNjdsMC4zODUsMC4wMjFsMS42NTctMS44MzlsLTAuMjg4LTEuNTcybC0xLjQzOS0ybC0xLjA3NC0xLjYxMmwwLjk2OC0zLjQzMmwwLjkwNy0yLjI2M2wxLjE5MS0wLjMyM2wwLjg4OC0xLjg3OWwwLjg1MS0xLjQ5NWwwLjg0Ny0xLjExMmwxLjU2LTAuMjg3bDAuODY3LTEuNDk2bDIuMzEsMC4xMjFsMC44MjctMC43MTFsMC40NDUtMS4xNDhsMC40NjItMS4xMzFsMC40MDUtMC4zNjRsMC4wMi0wLjM4NGwwLjQyNi0wLjc0OGwwLjQyMS0wLjM2NGwwLjAyMS0wLjM4NGwwLjc5LTAuMzQ0bDAuNDA1LTAuMzY0bDAuMDItMC4zODRsMC40MjItMC4zNjRsMC4zODUsMC4wMzdsMC4zODUsMC4wMjFsMC44MzEtMS4xMTJsMC44MjYtMC43MjhsMC40MDUtMC4zNjRsMC40MDUtMC4zNjRsMC40MDUtMC4zNjRsMC44MDctMC4zNDRsMC43OS0wLjM0NGwwLjc3LDAuMDU3bDAuNzktMC4zNDRsMC43NSwwLjQyNGwwLjM4NSwwLjAybDAuNzg3LDAuMDRsMC4zODUsMC4wMzdsMC40NDUtMS4xNDhsMi43NzEtMC45OTVsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuMDIxLTAuMzg0bDEzLjI0Ni03Ljc0OWwwLjQwNC0wLjM2NGwwLjAyMS0wLjM4NGwtMC4zODUtMC4wMmwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDJsLTAuMzY1LTAuNDIxbC0wLjM0NS0wLjc4OGwtMC4zNjQtMC40MDRsLTAuNzUtMC40MjRsMC4wMi0wLjM4NGwtMC4zMjctMC44MDRsLTAuMzY1LTAuNDA0bDAuMDItMC4zODRsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDJsLTAuMzg1LTAuMDM3bDAuMDItMC4zODRsLTAuMzg1LTAuMDIxbC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMmwtMC4zNjQtMC40MDRsLTAuMzg2LTAuMDJsLTAuNDAxLTAuMDM3bC0wLjM0OC0wLjQwNGwtMC40MDItMC4wMmwtMC4zODUtMC4wMmwwLjAyMS0wLjM4NGwwLjAzNi0wLjM4NGwwLjc5LTAuMzQ0bDAuMDIxLTAuMzg0bDAuNDI1LTAuNzQ4bDAuODA3LTAuMzQzbDAuNDI2LTAuNzQ4bDAuMDItMC4zODRsMC44NDgtMS4xMTFsMC4wNC0wLjc2OGwwLjQwNC0wLjM2NGwwLjAyMS0wLjM4NGwwLjAyMS0wLjM4NGwwLjQ4MS0xLjUzMmwwLjQwNS0wLjM0N2wwLjQwNS0wLjM2NGwwLjQyMi0wLjM2M2wwLjAyLTAuMzg0bDAuMDIxLTAuNGwwLjQwNC0wLjM0N2wwLjQwNS0wLjM2NGwwLjAyMS0wLjQwMWwwLjQ0MS0wLjc0OGwwLjgxMS0wLjcxMWwwLjc5LTAuMzQ0bC0wLjY1Mi0xLjk3NmwtMC43MS0xLjE5MmwyLjA0Mi0xLjgxOWwwLjM2NCwwLjQwNGwwLjczLDAuODA4bDAuNzQ5LDAuNDRsMC4zNjUsMC40MDRsLTAuMDIsMC4zODRsMC4zODUsMC4wMmwtMC4wMjEsMC4zODRsLTAuMDIsMC4zODRsMC4zODUsMC4wMmwwLjM2NCwwLjQyMWwtMC4wMiwwLjM4NGwtMC4wMzcsMC4zODRsMC40MDIsMC4wMjFsMC4zODUsMC4wMmwwLjc1LDAuNDI0bC0wLjAyMSwwLjRsMC42OTIsMS4xOTJsLTAuMDIsMC4zODRsLTAuMDIxLDAuMzg0bC0wLjAyLDAuMzg0bDAuMzg1LDAuMDIxbC0wLjAyLDAuMzg0bDAuMzg1LDAuMDM3bDAuMzY0LDAuNDA0bDAuNzcxLDAuMDRsMC4zODUsMC4wMmwxLjE3NS0wLjMwN2wyLjM0Ny0wLjI2M2wwLjQ4MS0xLjUxNWwwLjM4NSwwLjAybDEuNTgtMC42NzFsMC4zODUsMC4wMmwwLjgwOC0wLjM0NGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC44My0xLjExMWwwLjQyMi0wLjM2NGwwLjQyNS0wLjc0OGwwLjQwNS0wLjM2NGwwLjc5LTAuMzQ0bDAuNDIyLTAuMzYzbDAuNzktMC4zMjdsMi4wMDItMS4wNTFsMS42OTctMi42MDdsMC40NDUtMS4xMzFsMC40NDEtMC43NDhsMS4xOTUtMC43MDhsMC43NSwwLjQyNGwxLjE5MS0wLjMwN2wxLjU4LTAuNjg4bDAuNDYyLTEuMTMxbDEuNjAxLTEuMDcxbDAuNDIxLTAuMzY0bDEuMjM1LTEuNDc2bDAuMzg2LDAuMDIxbDAuNDQxLTAuNzQ4bDEuNi0xLjA1NWwyLjA0My0xLjgxOWwwLjgwNy0wLjM0NGwwLjQyNS0wLjc0OGwwLjA2MS0xLjE1MmwwLjQ2Mi0xLjEzMWwwLjc5LTAuMzQ0bDAuODI3LTAuNzI4bDEuNTYtMC4zMDRsMi4xMDMtMi45NzFsMS41NTcsMC4wOTdsMS4yMTUtMS4wOTFsMC44NDctMS4xMTFsMC43NzEsMC4wNGwxLjU5Ni0wLjY3MWwwLjQyNi0wLjc0OGwyLjgxMi0xLjc3OWwwLjg0OC0xLjExMWwwLjgxLTAuNzI4bDAuMDIxLTAuMzg0bDIuNDI3LTEuNzgybDEuMTkxLTAuMzI0bDAuNDI1LTAuNzQ4bDUuMDk5LTAuODc0bDEuOTI1LDAuMTE3bDEuOTQ0LTAuMjg0bDIuNjkxLDAuNTQybDAuNzcsMC4wNTdsMS4wNzksMS41OTZsMS4xOTQtMC42OTFsMS4yMTItMC43MDhsMS4xOTUtMC43MDhsMC40NjItMS4xMzFsMi4zMy0wLjI0N2wzLjE3Ny0xLjM3NWwyLjI4NiwwLjkwNWwxLjk4NC0xLjAzNWwxLjI3Mi0xLjg1OWwwLjc3LDAuMDRsMS41OTgtMC42ODdsMS4xNzUtMC4zMDdsNC4zODgtMi4wNjZsMi4zODctMS4wMzFsMy4xNTctMC45NzVsMC43NywwLjA0bDEuMjMyLTEuMDkxbDAuNzktMC4zMjdsMS41NzktMC42ODhsMC40MjItMC4zNjRsMS4yMTYtMS4wOTFsMi4zNDctMC4yNDdsMi4xNTEsMi44MjRsNC4wMzQsNC4wOTNsMC43MjksMC44MjVsMS40NTksMS42MzJsMi44ODIsMy42MzJsMS4yMTItMC42OWwwLjQyNS0wLjc0OGwyLjAyMi0xLjQzNWwyLjM4Ny0xLjAzMWwyLjQyNy0xLjc4MmwyLjAyMS0xLjQzNmwwLjM2NSwwLjQwNGwwLjcyOSwwLjgyNGwxLjEzNSwwLjQ0NGwxLjA5NSwxLjIyOWwxLjExNCwwLjgyOGwwLjc5LTAuMzI3bDAuMzg1LDAuMDJsMS4xNTUsMC4wNmwxLjg0NSwxLjY1MmwxLjExNCwwLjg0NWwxLjY1Ny0xLjgzOWwwLjg4Ny0xLjg3OWwwLjA2MS0xLjE2OGwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bC0wLjM2NS0wLjQwNGwwLjAzNy0wLjM4NGwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjQ0Mi0wLjc0OGwwLjAyLTAuMzg0bDAuMDQxLTAuNzg1bDAuMDYxLTEuMTUxbDAuMzg1LDAuMDJsMC4wMzYtMC4zODRsMC4wNDEtMC43NjhsLTAuMzY1LTAuNDA0bC0wLjM0NS0wLjc4OGwtMC4yNDgtMi4zNGwwLjQ4Ni0xLjg5OWwtMC42MTMtMi43NDRsLTAuMjY4LTEuOTU2bDAuNDA1LTAuMzY0bDAuMzg1LDAuMDM3bDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC4zODUsMC4wMmwwLjQyMi0wLjM2NGwwLjM4NSwwLjAybDAuMDQtMC43NjhsMC40MDUtMC4zNjRsMi42MzUsMS4zMDlsMC40MDUtMC4zNjRsMC44NjYtMS40OTVsMC4wMjEtMC4zODRsMC4wMi0wLjM4NGwwLjQ2Mi0xLjEzMWwwLjAyMS0wLjM4NGwwLjM4NSwwLjAybDAuNzcxLDAuMDRsMC4zODUsMC4wMmwwLjM4NSwwLjAybDAuMDIxLTAuMzg0bDAuNDAxLDAuMDJsMC40MDUtMC4zNjRsMC40MjUtMC43NDhsMC40MjUtMC43NDhsMC40MjItMC4zNjNsMC44My0xLjExMmwxLjIxMi0wLjY5bDAuODMtMS4xMTJsMC4wMjEtMC40bDEuMjUyLTEuNDU4bDAuNDA1LTAuMzY0bDAuMDItMC40bDAuODI3LTAuNzExbDAuNzktMC4zNDRsMS4yNzEtMS44NTlsMC44NDgtMS4xMTFsMC43OS0wLjM0NGwxLjU4LTAuNjg4bDAuODA3LTAuMzQzIE00ODAuODg4LDExNS44MjRsLTIuMTM5LDAuNTU5bC0yLjc2MiwwLjU2MmwtMC43Ny0wLjA1M2wtMC4zODQtMC4wMjdsLTAuNDI4LDAuMzU2bC0wLjAyNywwLjM4NGwtMC40MTEsMC4zNTZsLTAuNDExLDAuMzU3bC0wLjc5NiwwLjMzbC0wLjc4NS0wLjA3bC0wLjAyNywwLjM4M2wtMC43OTYsMC4zM2wtMi44MTUsMS4zNDZsLTEuMTgsMC4yODZsLTEuNjA5LDAuNjU5bC0wLjQxMSwwLjM1N2wtMi40ODQsMi4xNGwtMC44NCwwLjcxM2wtMC4wMjYsMC4zODRsMS4wNzMsMS4yM2wwLjM1NywwLjQxMWwyLjEwMywyLjg3OGwxLjQ1NywxLjI3NGwtMC40MzgsMC43NGwtMC43NjktMC4wN2wtMS42MDksMC42NTlsLTEuNjE4LDEuMDQzbC0wLjgxMiwwLjMyOWwtMS4yMDcsMC42N2wtMC44MzksMC43MTNsLTAuODIzLDAuNzEzbC0xLjI1MSwxLjA2OWwtMC44MjIsMC43MTNsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMS4yNTEsMS4wN2wtMS4yNTEsMS4wNTNsLTAuODQ5LDEuMDk3bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4M2wtMC40MTIsMC4zNTdsLTAuMDU0LDAuNzg0bC0wLjg2NiwxLjA5NmwtMC4wMjYsMC4zODRsLTAuNDM4LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjA0NCwwLjM4M2wtMC41MTksMS44OTFsLTAuMDI2LDAuMzg0bDAuMjg3LDEuMTkzbC0wLjA1NCwwLjc2N2wtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bC0wLjQ1NSwwLjczOWwtMC44MjIsMC43MTRsLTAuNDM4LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjQyOSwwLjM1NmwtMC4wMjYsMC4zODRsLTAuMDI2LDAuMzgzbC0wLjg1LDEuMDk3bC0wLjQyOSwwLjM1NmwtMC4wNTMsMC43NjdsLTAuNDY1LDEuMTI0bC0wLjM4NS0wLjAyN2wtMC40MjksMC4zNTZsLTEuMTgsMC4zMDNsLTAuNDEyLDAuMzU2bC0wLjM4NC0wLjAyNmwtMC44MzksMC42OTZsLTAuODIzLDAuNzE0bC0wLjQzOCwwLjc0bC0wLjQyOCwwLjM1NmwtMC4wNTQsMC43NjdsLTAuMDU0LDAuNzg0bC0wLjA5NywxLjE1bC0wLjAyNywwLjM4M2wtMC40OTEsMS41MDdsLTAuNDI5LDAuMzU2bC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuODIyLDAuNzEzbC0wLjgxMiwwLjMzbC0wLjQxMSwwLjM1N2wtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC40MTEsMC4zNTdsLTAuODk0LDEuNDc5bC0xLjUxMS0wLjUwN2wtMi42NTQtMC45NzJsLTEuODk2LTAuNTE4bC0wLjc2OS0wLjA3bDAuMDI3LTAuMzgzbC0xLjIzNCwxLjA3bC0zLjI3MSwyLjA4NWwtMi40MzEsMS4zNTZsLTMuMjgxLDIuNDdsLTIuNDc0LDEuNzM5bC0xLjk3NywwLjYzM2wtMS4yNTEsMS4wNjlsLTEuNTY0LDAuMjZsLTAuNDExLDAuMzU3bC0wLjgxMiwwLjMzbC0wLjg1LDEuMDk3bC0xLjM1OCwyLjYwNGwtMC4wNDMsMC4zODNsMC4zNTcsMC40MTFsLTAuMDI2LDAuMzgzbC0wLjAyNywwLjRsMC43NDIsMC40MzdsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC40ODEsMS4xMjNsLTAuMDU0LDAuNzY3bC0wLjQ2NiwxLjE0bC0wLjA0MywwLjM4M2wxLjc2MiwyLjQ1MWwtMC4wMjcsMC4zODRsMS4zNzcsMi40MjVsMC42OTksMC44MmwtMC44MjMsMC43MTNsLTEuMjA3LDAuNjg3bC0xLjIyNCwwLjY4N2wtMS4yMDcsMC42N2wtMC44MTIsMC4zMjlsLTAuMDI2LDAuMzg0bDAuNjg4LDEuMjIxbDAuMzU4LDAuNDFsLTAuMDk4LDEuMTVsLTAuNDM4LDAuNzRsLTEuMjUxLDEuMDdsLTAuNDM4LDAuNzRsLTAuNDkxLDEuNTA3bC0wLjA0NCwwLjM4M2wtMC4wMjcsMC40bC0wLjAyNiwwLjM4NGwtMC43OTYsMC4zMTNsMC4zNTcsMC40MjdsLTAuMzg0LTAuMDI3bC0xLjY2MiwxLjQxbC0wLjUwOSwxLjUyM2wtMC40MTEsMC4zNGwtMC45MiwxLjg4bC0wLjg1LDEuMDk3bC0xLjcxNiwyLjE5M2wtMC44MzksMC42OTZsLTAuNzk2LDAuMzNsLTAuMzg1LTAuMDI2bC0wLjc5NiwwLjMzbC0wLjMzMS0wLjc5M2wtMC4wOTgsMS4xNWwtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzg0bC0wLjQ2NSwxLjEyNGwtMC40NTUsMC43NGwtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0wLjg0LDAuNzEzbC0wLjc5NiwwLjMzbC0wLjgyMiwwLjcxM2wtMC42ODgtMS4yMjFsMC43OTYtMC4zMTNsLTAuMzU3LTAuNDI3bDEuNjA3LTAuNjQzbC0wLjI3Ni0xLjU3OGwtMC43Ny0wLjA1M2wtMS41OTIsMC42NmwwLjM0MSwwLjQxbC0xLjYxOCwxLjA0M2wtMC43OTUsMC4zMTNsLTQuMDg2LTIuNjI5bC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuMzU3LTAuNDFsLTAuMDI3LDAuMzg0bC0wLjc5NiwwLjMzbC0wLjAyNiwwLjM4NGwtMC4zODUtMC4wMjdsLTAuODEyLDAuMzNsMC4wMjctMC4zODRsMC4zODQsMC4wMjdsLTAuNzQxLTAuNDU0bC0wLjY5OS0wLjgybC0xLjEtMC44NjRsLTAuNzE2LTAuODIxbC0xLjQ1Ny0xLjI3NGwtMC43MTYtMC44MjFsLTEuMS0wLjg2NGwtMC43MTYtMC44MmwtMC42NjEtMS42MDRsLTAuMjg3LTEuMTc3bC0wLjY2Mi0xLjYwNGwtMC43MTUtMC44MjFsLTEuNjM2LDEuMDQzbC0xLjk0OSwwLjIzM2wtMS4yMjQsMC42ODZsLTAuODUsMS4wOTdsLTEuMTk3LDAuMzAzbC0wLjQxMSwwLjM1NmwtMS4yMDcsMC42N2wtMC44NCwwLjcxM2wtMC4zODQtMC4wMjdsLTAuNDEyLDAuMzU3bC0wLjM4NC0wLjAyN2wtMC40MzgsMC43NGwtMC43NDItMC40MzdsLTAuMzU3LTAuNDI3bC0wLjM4NS0wLjAyN2wtMC4zNTctMC40MWwtMC4zNTgtMC40MWwtMC4zODQtMC4wMjdsLTAuMDI3LDAuMzgzbC0wLjA3LDAuNzY3bC0wLjQxMSwwLjM1NmwtMC44MjIsMC43MTNsLTAuNDU1LDAuNzRsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC43OTYsMC4zM2wtMC40MjgsMC4zNTZsLTAuMzg1LTAuMDI3bDAuNzE2LDAuODJsLTAuODc2LDEuNDhsMC42NDUsMS42MDRsLTAuMDI2LDAuMzg0bC0wLjc0Mi0wLjQ1NGwtMC44MjMsMC43MTNsMC43MTYsMC44MzdsMC4zNTcsMC40MWwtMS4xOTcsMC4zMDNsLTEuNTY0LDAuMjZsLTAuNzctMC4wNTNsLTAuNzg1LTAuMDU0bDEuMDQ2LDEuNjE0bC0wLjgyMiwwLjcxM2wtMS43NDIsMi41NzdsLTAuNDgyLDEuMTI0bDAuMzU3LDAuNDI3bC0wLjM4NC0wLjA0M2wwLjM1NywwLjQyN2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzgzbC0wLjA0MywwLjM4M2wtMC44MjMsMC43MTNsMC43MTYsMC44MmwtMC44NjYsMS4wOTdsLTAuODUsMS4wOTdsLTAuNzQyLTAuNDM3bC0wLjQ1NSwwLjc0bC0xLjg2OC0wLjkxN2wtMC4zNTgtMC40MWwtMC40MTEsMC4zNTZsLTAuMzMtMC44MWwtMC43OTYsMC4zM2wtMC43OTYsMC4zM2wtMC4zODUtMC4wMjdsLTAuODEyLDAuMzNsLTAuNzE2LTAuODM3bC0yLjg0MiwxLjcyOWwtMC4zNTgtMC40MWwtMC4zNTctMC40MjdsLTAuNzE1LTAuODIxbC0wLjM0Mi0wLjQxbC0xLjA3Mi0xLjI0OGwtMC43MTYtMC44MmwtMC43MTUtMC44MzdsLTAuNzctMC4wNTNsLTEuMTUzLTAuMDgxbC0xLjE5NywwLjI4NmwtMC4zODQtMC4wMjdsLTAuMzg1LTAuMDI3bC0xLjUzOC0wLjEwN2wtMS4xOTcsMC4yODZsLTAuNzk2LDAuMzNsLTEuMjA3LDAuNjg3bDAuMzE0LDAuNzkzbC0xLjIwNywwLjY4N2wtMC44NCwwLjcxM2wtMC4wMjYsMC4zODRsLTAuMDU0LDAuNzY3bC0wLjM4NS0wLjAyNmwtMC4wMjYsMC4zODNsLTEuMjI1LDAuNjg2bC0wLjQzOCwwLjc0bC0wLjgyMywwLjcxM2wtMi4xMTYsMi4xNjdsLTAuMzg1LTAuMDQ0bC0yLjA3MywxLjc4M2wtMC44MjIsMC43MTNsLTAuNzk2LDAuMzNsLTAuNDI5LDAuMzU2bC0wLjM4NS0wLjAyNmwtMi40MDMsMC45NzNsMS40MDMsMi4wNDFsMC4zNTgsMC40MWwwLjI3NiwxLjU3OGwtMC4wMjYsMC4zODNsLTEuNTU1LTAuMTI0bC0wLjc2OS0wLjA1NGwtMC43Ny0wLjA1NGwtMS45MjItMC4xNWwtMC40MDEtMC4wMjdsLTEuMTU0LTAuMDhsLTEuNTM3LTAuMTI0bC0wLjA1NCwwLjc2N2wtMC4xMjQsMS41NWwwLjE1MywzLjA5NGwtMC4wMjUsNS40MjhsLTAuMTA2LDEuNTM0bDAuMzA0LDEuMTc3bDEuMTUzLDAuMDk3bC0wLjA1NCwwLjc2N2wtMS4yNSwxLjA3bDAuNzE1LDAuODJsMC43NDIsMC40NTRsMS40ODQsMC44NzRsLTEuNjA4LDAuNjZsLTQuNDA3LDEuOTg5bDEuNTQsNS4xNTFsMi44MDksNC4wNjZsMC4zODQsMC4wNDNsMS42OTEsMy4yMThsMC40MTEtMC4zNTZsMC4wNDQtMC4zODNsMC4wNTQtMC43NjdsMC4wNTQtMC43ODNsMC4wMjctMC4zODRsMC4zODQsMC4wNDNsMC4zODUsMC4wMjdsMC4zODQsMC4wMjdsMC4zNTgsMC40MWwtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bDAuMzg1LDAuMDI2bDAuNDU1LTAuNzM5bDAuNDExLTAuMzU3bDAuNDM4LTAuNzRsMC40MTEtMC4zNTZsMC4wMjctMC4zODRsMC40MDEsMC4wMjdsMC4wMjYtMC4zODNsMC4zNTcsMC40MWwtMC4wNDQsMC4zOTlsLTAuMDI2LDAuMzg0bDAuNzg2LDAuMDU0bDAuMzg1LDAuMDI3bC0wLjA0NCwwLjM4M2wwLjQwMSwwLjAyN2wtMC4wNDQsMC4zODNsLTAuMDU0LDAuNzY3bDAuMzg1LDAuMDQzbDAuNzQyLDAuNDM3bDAuMzg1LDAuMDI3bDEuMTcsMC4wODFsMC4zODUsMC4wNDRsMC4wNTQtMC43ODRsMC43OTUtMC4zMTNsMC4wMjctMC4zODNsMC4zODUsMC4wMjdsMC4zNTcsMC40MWwtMC40MTEsMC4zNTZsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4NGwtMC4wMjcsMC4zODNsLTAuMDI2LDAuMzg0bDAuMzg1LDAuMDI3bDAuNDExLTAuMzU3bDAuMzg1LDAuMDI3bDAuMzA0LDEuMTk0bDAuMzg0LDAuMDI3bDAuMzg1LDAuMDI2bDAuMzg1LDAuMDI3bDAuMzg1LDAuMDI3bC0wLjU5LDIuNjc0bC0wLjkxOSwxLjg2M2wwLjgxMi0wLjMyOWwwLjM0MSwwLjQxbDAuMzU3LDAuNDFsMC43MTYsMC44MzdsMS4wMiwxLjk5OGwwLjcxNSwwLjgzN2wwLjY0NiwxLjU4N2wwLjI3NiwxLjU3N2wxLjE1NCwwLjA4MWwtMC4wMjcsMC4zODNsLTAuMjA0LDIuNzAxbC0wLjc3LTAuMDUzbDAuNTExLDMuNTIxbC0zLjA5My0wLjIzMWwtMS4xOCwwLjI4N2wtMS45NDksMC4yNWwtMC4zODUtMC4wMjdsMC4yODcsMS4xNzdsLTAuMDI2LDAuMzgzbC0wLjAyNywwLjM4NGwwLjMzMSwwLjc5M2wwLjMyNiw2LjYzOWwtNC43MDksNS44NCBNNTc1LjMsNDAxLjAyNGwtMC4zODYtMC4wMjFsLTEuMTU0LTAuMDYzbC00LjkzNS0xLjg0OGwtOC4zMTYtMy4yMDdsLTAuMzYzLTAuNDIybC0zLjgwMi0xLjM4M2wtMS41MTgtMC40ODZsLTIuMjY2LTAuOTEybC04LjY5Ny0zLjYxM2wtNi4wMDgtMy4wOGwtMy43NDEtMi4xNjZsLTEuNDk3LTAuODU0bDEuMjQtMS40NzFsNS4xMzYtNy44MDNsLTcuNzgxLTUuODlsLTAuNzI4LTAuODI3bC0wLjM0Mi0wLjc4OWwtMC42ODgtMS4xOTNsLTAuNzA1LTEuMjExbC0xLjA0OC0ybC0xLjAwOS0yLjM4NWwwLjA0My0wLjc2OGwtMC4zNDItMC43ODlsMC4yMS0zLjQ3MWwtMC43OTIsMC4zNDJsLTAuNzQ4LTAuNDI4bC0wLjcyNy0wLjgyNmwtMC4zODUtMC4wMjFsLTEuNTQtMC4wODZsLTEuOTgzLDAuNjQ0bC0wLjc5MSwwLjM0MWwtMC43OTIsMC4zNDJsLTQuMjUtMC4yN2wtMy4zMzUtMi41MTJsMC4wMjEtMC4zODVsMC4wNDMtMC43NjhsLTAuMzg1LTAuMDM3bDAuMDIxLTAuMzg1bDAuNDY2LTEuMTI5bDAuMDQzLTAuNzY4bDAuMDQzLTAuNzY4bC0wLjM0My0wLjc4OWwtMC43NDgtMC40NDNsLTAuODM0LDEuMTA3bC0xLjQ3NS0xLjIzNmwtMS4xMzQtMC40NjVsLTAuMzQyLTAuNzg5bDEuMjM1LTEuMDg3bC0yLjkyOS0yLjg5MmwtMS42MiwxLjA2NmwtMC43Ny0wLjA0M2wtMC4zNjMtMC40MDZsLTAuMzQzLTAuODA1bC0xLjExMS0wLjgzMmwtMi44NCwyLjEzNmwxLjQzMywyLjAyMWwtMC45MTUsMi4yNmwtMC4zNjMtMC40MDVsLTAuMzYzLTAuNDA0bC0wLjM2NC0wLjQwNmwtMS43OTUtMi40MjZsLTAuMzg1LTAuMDIxbC0wLjM2My0wLjQyMmwtMC4zNjQtMC40MDZsLTEuNDc1LTEuMjUzbDAuNDIzLTAuMzYybDAuODEyLTAuNzA4bC0wLjM2My0wLjQyMmwtMC4zNjMtMC40MDVsLTAuMzYzLTAuNDA1bC0wLjM4NS0wLjAyMWwtMC44MTMsMC43MjVsLTEuMTcxLTAuMDgxbC0xLjU2MSwwLjI5OWwwLjA2NC0xLjE1MmwwLjAyMS0wLjM4M2wtMC4yNjEtMS45NTdsLTAuNzctMC4wNDNsLTEuNTM5LTAuMTAzbC0wLjQwMS0wLjAyMWwtMi44OTEtMy4yNzRsLTIuNjUxLTAuOTM2bC00LjE0NC0yLjE3MWwtMC4zODUtMC4wMzhsLTEuOTAyLTAuNDlsLTAuNzctMC4wNjFsLTAuMzg2LTAuMDIxbC0wLjM2My0wLjQwNWwtMC43OTEsMC4zNDFsLTAuNDIzLDAuMzYybC0wLjM4NS0wLjAyMWwtMC44MTIsMC43MjVsLTEuMTkzLDAuMzAzbC0wLjM4NS0wLjAyMWwwLjc0OCwwLjQ0M2wtMC4wMjEsMC4zODVsLTAuODU1LDEuNDkybC0wLjQ0NCwwLjc0NmwtMS4zNDMsMy4wMDZsLTAuNDQ5LDEuMTNsLTAuNDQ0LDAuNzQ2bC0wLjgzNCwxLjEwOGwtMC4wMjEsMC4zODRsLTAuNDIzLDAuMzYybC0wLjQwNiwwLjM2MmwtMC4wMjEsMC4zODRsLTAuNDg3LDEuNTE0bC0wLjQyOCwwLjc0NmwtMC4wMjEsMC4zODVsLTAuMDIxLDAuNGw2LjE4Myw2LjU1NWwwLjM2MywwLjQwNGwxLjQ3NiwxLjI1NGwxLjQ1MywxLjYzOWwxLjA5MSwxLjIxNWwxLjA3MywxLjIzMmwyLjIyNCwxLjY4bC0wLjQ3MSwxLjUxNWwtMC40NDQsMC43NDVsLTAuODM1LDEuMTA5bC0xLjExMS0wLjgzMmwtMC43OTEsMC4zNDJsLTEuMjM2LDEuMDg2bC0xLjUxOC0wLjQ4NmwtMi42My0xLjMxN2wtMS41MTgtMC40ODZsLTIuMjYyLTEuMjk2bC0zLjQ0Mi0wLjU5NGwtMC43Ny0wLjA0M2wtMC4zNjMtMC40MjJsLTEuOTItMC40OTFsLTIuOTg1LDQuNDU2bC0wLjgxMiwwLjcyNWwtMC40MjgsMC43NDZsLTEuNzQ0LDIuOTg0bC0wLjAyMSwwLjM4NWwtMC4wMjEsMC4zODNsLTEuMjc4LDEuODU1bC0xLjI3OCwxLjg1NGwtMS43MDcsMi42MDJsLTAuNDQ5LDEuMTNsLTAuNDIzLDAuMzYybC0wLjAyMSwwLjM4NGwtMC44MTIsMC43MjZsLTAuNDA2LDAuMzYxbC0wLjQ2NiwxLjEzMWwtMS40NzYtMS4yNTRsLTIuMjIzLTEuNjgxbC0xLjY0MywxLjQ0OWwtMS42MjUsMS40NWwtMi40MTIsMS40MDZsLTMuMjIsMS43M2wtMy4xNTksMC45NjNsLTAuMzg2LTAuMDIxbC0xLjExMS0wLjg0OGwtMy4xNiwwLjk4bC0xLjQ3NS0xLjI1NGwtMS44MzktMS42NmwtMi45MDQsMy4zMDVsLTIuMDQ4LDEuODEybC0yLjA2OSwyLjE3OWwtMC4zNjMtMC40MDVsLTEuNTM1LTAuNDdsLTAuMzYzLTAuNDIybC0wLjM4NS0wLjAyMWwtMS4xMzQtMC40NDhsLTAuNjg4LTEuMjExbC0yLjQxMiwxLjQwNmwtMC44MjksMC43MjVsLTIuNDMzLDEuNzc0bC0zLjQ1OS0wLjU5NGwtMC43NDktMC40MjdsLTEuNTE4LTAuNDg2bC0xLjEzNC0wLjQ0N2wtMy44NjUtMC4yNDhsLTMuNDQyLTAuNTkzbC0xLjk4MywwLjY2bC0xLjg5LTcuMDg3bC0wLjE1My0zLjg3NmwwLjAyMS0wLjM4NGwwLjUwOS0xLjg5N2wyLjM0OC0wLjIzOGwwLjc3LDAuMDQybDAuNzcxLDAuMDQzbDAuNDA2LTAuMzYxbDIuNDMzLTEuNzc0bDAuNDQ0LTAuNzQ2bDEuNzUtMy4zODZsMS43ODctMy43NTJsLTAuNzctMC4wNDNsLTEuNDk3LTAuODY5bC0xLjkxOS0wLjUwOGwtMy4wMzYtMC45NTVsMi4xMTItMi45NjRsLTAuNzQ4LTAuNDI3bC0wLjM2My0wLjQwNWwtMS43NzktMi40MjdsMC44MzQtMS4xMDhsMC40ODctMS41M2wwLjgzNC0xLjEwOGwwLjg5NS0xLjg3NmwxLjMtMi4yMzhsMS4zMjEtMi42MjNsLTEuMTExLTAuODMybC00LjA4NC0yLjk1NWwtMC43MS0wLjgyNmwtMS4xNDktMC40NDlsLTEuMTM0LTAuNDY1bC0wLjc0OC0wLjQyNmwtMy4wNTgtMC41NzJsLTEuMTMzLTAuNDY1bC0wLjc3LTAuMDQzbC0wLjc0OS0wLjQyNmwtMS4xNDktMC40NjVsLTEuNTE5LTAuNDdsLTEuMjE5LDEuMDdsLTEuMjM1LDEuMDg3bC0xLjY2MywxLjgzNGwtMi4yODgtMC41MjlsMC4zMDQsMS4xODlsLTAuNDcxLDEuNTE0bC0wLjQwNiwwLjM2MmwtMS4yNzgsMS44NTRsLTAuNzcxLTAuMDQzbC0xLjE5MiwwLjMwM2wtMC4zODUtMC4wMjFsLTEuMjM1LDEuMDg4bC0xLjU4MywwLjY4MmwtMi4yODctMC41MjlsLTEuNDc2LTEuMjU0bC0xLjE5MiwwLjMybC0wLjMwNC0xLjE4OWwtMC4zNjMtMC40MDZsLTAuMzg2LTAuMDIxbC0wLjc4Ni0wLjA0M2wtMC43Ny0wLjA0MmwtMC40MDYsMC4zNDZsLTAuNDQ5LDEuMTQ2bC0wLjQwMS0wLjAzOGwtMS4xNzcsMC4zMTlsLTAuMzg1LTAuMDIxbC0wLjM2My0wLjQwNmwtMC4zNjMtMC40MDRsLTAuNzI3LTAuODI4bC0wLjcyOC0wLjgxMWwtMS41MzktMC4xMDJsLTAuNDA2LDAuMzYybC0wLjM2My0wLjQwNWwtMi4yODgtMC41MjlsLTAuNzg2LTAuMDQzbC0xLjE3NywwLjMybC0xLjg1OS0xLjI3NWwtMC4zODUtMC4wMjFsLTEuODE3LTIuMDQzbC0xLjkwMi0wLjUwOGwtMS44ODItMC44OTFsLTAuMzg1LTAuMDIxbC0xLjg4Mi0wLjg5MmwtMS41MzQtMC40ODZsLTIuMjQ1LTEuMjk3bDAuNDQ0LTAuNzQ1bC0wLjM2My0wLjQwNmwtMi45NzItMi4xMDZsLTEuODYtMS4yNzVsLTUuMTk0LTMuODA0bC0yLjI0NS0xLjI5N2wtMC43MjctMC44MTFsLTIuMjI0LTEuNjhsLTYuMDQ2LTIuNjk2bC0wLjgxMiwwLjcyNWwtMS4xNzYsMC4zMmwtMS4yMzYsMS4wODdsLTMuMjYyLDIuNDk5bC0xLjYyNiwxLjQ0OWwtMC44MDgsMC4zNDFsLTEuMjE5LDEuMDg3bC0xLjEzMy0wLjQ2NWwtMi45MjEsMy4zMDVsMC4zNjMsMC40MDVsLTMuMjAzLDEuNzQ3bDEuMTEyLDAuODMybC0xLjI3OSwxLjg1NWwtMC40MjMsMC4zNjFsLTEuNjA0LDEuMDY2bC0wLjc0OC0wLjQyN2wtNC45NjksNS4wOTlsLTEuMzIyLDIuNjIzbC0wLjg1MSwxLjEwOGwtMC40NDksMS4xM2wtMC40NDQsMC43NDZsLTAuODM0LDEuMTA5bC0wLjg1MSwxLjEwN2wtMC40MjgsMC43NDZsLTAuODczLDEuNTFsLTYuNDA1LDMuNDYxbC0xLjE5MywwLjMybC0xLjk2NywwLjY2bC0wLjQwNiwwLjM0NmwtMS45NjMsMC4yNzdsLTIuMzMsMC4yMzhsLTAuNDAyLTAuMDIxIE01NTIuNTk1LDE3OC4yNTVsLTAuMTI5LTEuNTYybDAuMDQ4LDIuNzEybC0wLjQ1NCwwLjc0bC0wLjQzOCwwLjc0bC0wLjQxMSwwLjM1NmwtMC40ODEsMS4xMjRsLTAuMTA3LDEuNTM0bC0wLjA3MSwwLjc4M2wtMC4xMzQsMS45MTdsLTAuMDcsMC43NjdsLTAuMDUzLDAuNzY3bC0wLjAyNywwLjM4M2wtMC40MzgsMC43NGwtMS43NDMsMi41NzdsLTAuMDcsMC43ODNsLTAuNDM4LDAuNzRsLTAuNTA4LDEuNTA3bC0wLjA1NCwwLjc2N2wtMC44NSwxLjA5N2wtMC4wNDQsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjQ2NSwxLjEyNGwtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzgzbDAuMzg1LDAuMDI3bDAuNjcyLDEuMjJsLTAuNDM4LDAuNzRsLTAuMDgsMS4xNWwwLjM4NSwwLjAyN2wtMC44NCwwLjcxM2w0LjU1LDEuNTA1bC0wLjAyNiwwLjM4NGwwLjY3MiwxLjIybDEuMDIsMS45OThsMS4yNzctMS40NTNsMC44NS0xLjA5N2wyLjgzNSwzLjY5OWwxLjA3MiwxLjI0OGwzLjIwMiwzLjcyNmwtMi45MjIsMi44NjNsLTIuNTI4LDIuNTIzbC0yLjkyMywyLjg4bC0wLjAyNywwLjM4NGwtMS42MzUsMS4wNDJsLTAuNDEyLDAuMzU3bC0zLjI3LDIuMDY5bC0xLjQ1OC0xLjI3NGwtMC43NDItMC40MzdsLTEuODE0LTEuNjg1bC00LjA2OS0yLjYyOWwtMi44OTgtMi41MzJsLTAuMDcsMC43NjdsLTAuOTIsMS44NjNsLTAuNDM4LDAuNzRsLTAuNDY1LDEuMTI0bC0wLjAyNiwwLjM4NGwtMC4wNDQsMC4zODNsLTAuMTM0LDEuOTM0bC0wLjQxMSwwLjM1N2wtMC4wNDQsMC4zODNsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC4zODQtMC4wMjZsLTMuMTc0LDAuOTE5bC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4NGwtMC4wNDQsMC4zODNsMC4zMzEsMC43OTRsLTAuMDI2LDAuMzgzbC0wLjA1NCwwLjc2N2wtMC4wMjYsMC4zODNsLTAuMDcxLDAuNzgzbC0wLjQxMSwwLjM1N2wtMC4wMjYsMC4zODNsLTAuNDExLDAuMzU3bC0wLjQxMiwwLjM1NmwtMi4wNzIsMS43NjdsLTAuNDI5LDAuMzU2bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0wLjQ4MiwxLjEyM2wtMC4wMjYsMC4zODRsLTAuNDY1LDEuMTI0bC0wLjc0Mi0wLjQzN2wtMy43ODItMS40MzZsLTIuNTkyLDMuNjc0bC0zLjA5LDQuNzk2bC0yLjUzOCwyLjkwN2wtMC45NzQsMi42M2wtMS43MTYsMi4xOTNsLTAuNTA5LDEuNTA3bC0wLjQxMSwwLjM1NmwtMS4zMzEsMi4yMmwxLjQ1OCwxLjI3NGwtMC40MzgsMC43NGwwLjY3MiwxLjIwM2wtMC4wMjYsMC4zODRsLTAuNDM4LDAuNzU3bC0wLjAyNywwLjM4M2wtMC40MTEsMC4zNTdsLTAuNDgxLDEuMTIzbDAuNzY5LDAuMDU0bDEuMTAxLDAuODQ3bDEuNTExLDAuNTA3bC0xLjkwMSw5LjkyMmwtMC4wOTcsMS4xNWwtMC4wNTQsMC43NjdsMC4zMzEsMC43OTNsLTEuMzMxLDIuMjM3bC0xLjU2NSwwLjI2bC0xLjE5NywwLjMwM2wtMi44MTQsMS4zMjlsLTAuMTA4LDEuNTUxbC0wLjA3LDAuNzY3bC0wLjAyNiwwLjM4M2wwLjM1NywwLjQxbDAuMzU4LDAuNDExbDEuMTI2LDAuNDhsMC4zODUsMC4wMjdsMC43NywwLjA1M2wwLjM1NywwLjQxbDAuNzQyLDAuNDU0bDAuNzE1LDAuODJsLTAuMDI2LDAuMzgzbDAuNzE2LDAuODIxbDAuMzU3LDAuNDI3bC0wLjAyNywwLjM4NGwtMC4wMjYsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjAyNiwwLjM4M2wtMC44MTMsMC4zM2wtMC4zODQtMC4wMjdsLTAuMDI3LDAuMzg0bC0wLjM4NC0wLjA0M2wtMC40MTEsMC4zNTZsLTAuNDExLDAuMzU3bC0wLjA0NCwwLjM4M2wtMC4zODUtMC4wMjZsLTAuMDI2LDAuMzgzbC0wLjM4NS0wLjAyN2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjAyNiwwLjM4M2wwLjM4NSwwLjAyN2wtMC4wMjcsMC40bDAuMzU3LDAuNDFsMC4yODgsMS4xNzdsLTAuMDI3LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjQwMS0wLjAyN2wtMC40MzgsMC43NGwtMC43OTYsMC4zM2wtMC40MTEsMC4zNTdsLTAuNDU1LDAuNzRsLTAuMDI2LDAuMzgzbC0wLjQzOCwwLjc0bC0wLjQxMSwwLjM1N2wtMC44MTIsMC4zM2wtMC40MTEsMC4zNTZsMC42ODgsMS4yMDRsMC43NDIsMC40NTRsLTAuMDI3LDAuMzgzbDEuNDMyLDEuNjQxbDEuNjEsNC4zODVsMC4zMTQsMC43OTNsMS45NDEsNS4xNzlsLTAuODUsMS4wOTdsMi4xMjksMi40NzhsLTAuNDExLDAuMzU2bC00LjYzMS0wLjMzOGwtMS42MzUsMS4wMjZsLTAuNDExLDAuMzU2bC0xLjIzNCwxLjA3bC0wLjgzOSwwLjcxM2wtMS4yMzQsMS4wN2wtMC40MjgsMC4zNTZsLTAuNDM4LDAuNzRsLTAuNzk2LDAuMzNsLTEuNDg0LTAuODkxbC0wLjc0Mi0wLjQzOGwtMS40ODQtMC44OTFsLTAuNzE2LTAuODJsLTAuNzY5LTAuMDdsLTAuNTA5LDEuNTIzbC0yLjgxMiw2LjM1NmwtMS4xMzEsMi43ODcgTTIzNC41OTIsMjM5LjU0bC0wLjA1OCwwLjc3bC0wLjExNiwxLjUzOWwtMS4yMTYsMC42ODNsLTEuMjE1LDAuNjgzbC0xLjYwMiwwLjY1M2wtMS4yMTUsMC42ODNsLTEuNjMxLDEuMDM5bC0yLjAxNiwxLjAwOWwtMC44MywwLjcxMmwtMi4wMTYsMS4wMDlsLTAuNDE1LDAuMzU2bC0xLjIxNSwwLjY4M2wtMC40MTUsMC4zNTVsLTAuNDE1LDAuMzU2bC0wLjQxNSwwLjM1NmwtMS4xODYsMC4yOThsLTEuMjE2LDAuNjgzbC0wLjgwMSwwLjMyN2wtMC40MTQsMC4zNTZsMC4zMjcsMC43OThsMC4zNTcsMC40MTRsMC4yOTksMS4xODRsMC4zNTYsMC40MTRsMC4zNTYsMC40MTRsMC43NDMsMC40NDNsMC4zNTYsMC40MTRsLTAuMDI4LDAuMzg1bC0wLjA4NywxLjE1NGwwLjMyNywwLjc5OGwtMC4wMjgsMC4zODVsMS4wNywxLjI0MWwwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsLTAuMDI5LDAuMzg1bDAuMjk5LDEuMTg0bDAuMzg2LDAuMDI5bDAuMzU3LDAuNDE0bDAuMzU2LDAuNDE0bDAuMzg2LDAuMDI5bC0wLjA1OCwwLjc3bC0wLjA1OCwwLjc3bDAuMzg2LDAuMDI5bC0wLjAyOSwwLjM4NWwwLjM1NywwLjQxNGwwLjMyNywwLjc5OGwwLjMyOCwwLjc5OWwwLjM1NiwwLjQxNGwwLjM1NywwLjQxNGwwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsMC4zMjcsMC43OThsLTAuNDczLDEuMTI1bDAuMjcxLDEuNTY4bC0wLjAyOSwwLjM4NWwwLjM1NiwwLjQxNGwwLjM1NywwLjQxNGwwLjM4NiwwLjAyOWwwLjcxNCwwLjgyN2wwLjM1NiwwLjQxNGwtMC4wNTksMC43N2wwLjM4NywwLjAyOWwwLjI5OSwxLjE4M2wtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bDAuNzEzLDAuODI4bDAuMzU3LDAuNDE0bC0wLjAyOSwwLjM4NWwwLjMyOCwwLjc5OGwtMC4wMjksMC4zODVsLTAuMDg3LDEuMTU0bC0wLjAyOCwwLjM4NWwtMC4wNTgsMC43N2wtMC4wNTksMC43N2wtMC40NDMsMC43NDFsLTAuNDE1LDAuMzU1bC0wLjA1OSwwLjc3bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI5LDAuMzg1bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bC0wLjQxNSwwLjM1NmwtMC4wMjksMC4zODVsMC4yOTksMS4xODNsLTAuMDU4LDAuNzdsMC44MjktMC43MTFsMS4xODctMC4yOThsMC44MDEtMC4zMjdsMC44MDEtMC4zMjdsMC40MTUtMC4zNTZsMC44LTAuMzI3bDAuMzg2LDAuMDI5bDAuNzQzLDAuNDQzbDEuNDU2LDEuMjdsMC4zODYsMC4wMjlsMS4xLDAuODU2bDAuNzQzLDAuNDQzbDAuNDczLTEuMTI1bDIuMzA2LTQuODU3bC0wLjMyOC0wLjc5OGwwLjc3MSwwLjA1OGwxLjIxNi0wLjY4M2wxLjU3Mi0wLjI2OWw4LjQyMS0zLjYyNGwxLjU3MS0wLjI2OWwwLjgwMS0wLjMyN2w0LjQxOC0xLjk5bDEuMTU3LDAuMDg3bDEuNTQ0LDAuMTE2bDMuNTAxLTAuMTI0bDMuMTE1LTAuMTUzbDMuODg3LTAuMDk1bDMuODg4LTAuMDk1bDIuNzI5LTAuMTgybDEuNTQzLDAuMTE2bDAuNzA1LTQuMjAzbDAuNDQzLTAuNzQxbDAuMDI5LTAuMzg1bDAuODAxLTAuMzI3bDEuMTg3LTAuMjk4bDEuMTg2LTAuMjk4bDEuOTg3LTAuNjI1bDIuMzczLTAuNTk2bDAuMzg2LDAuMDI5bDAuNDE1LTAuMzU1bDEuNTcyLTAuMjY5bDIuMDE2LTEuMDA5bDEuNjA0LTAuNzUzbDIuOTEyLDIuNTQxXFxcIi8+XFxuXFxuXHQ8ZyBpZD1cXFwiZm9vdHN0ZXBzXFxcIj5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1tYXRlb1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hdGVvLWJlbHVnYVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIyOS41LDE0MS45NDFjMjQuMTk1LTQ4LjMzNiw0MS4yODYtMjIuMjEyLDQ0LjIyNC0yMi4yMTJjOC4xNTUsMCwxNC41NjUtMTAuMjczLDM0Ljk0LTkuMjY0YzIwLjg0NiwxLjAzNCw0NS40NzcsNS41LDUxLjg1MSwyOC44NjljNy4yMDYsMjYuNDIyLTMyLjQ2OCwzOC4wMTItMzcuNzExLDIwLjAzN2MtMi4zNDEtOC4wMjUsOC4yMDMtMTMuNzI5LDE0LjczMy0xNC4xNDNjMjkuNzg4LTEuODg3LDUzLjU4MS0zLjQ1OCw3OC4zNjUsMTMuNTUyYzQxLjMwNCwyOC4zNDgsMzQuMjA4LDc5LjIwNCw0Ny43MjgsMTIyLjU1OWMxLjc2OCw1LjY2OCw1LjcxLDEwLjY0MywxMC4wMTgsMTQuNzI5YzIwLjM2MSwxOS4zMTgsOTEuMjYyLDE1LjY4MiwxMDIuNTI0LTE2LjQ5OGMxMi43Mi0zNi4zNDMtNTEuNDI4LTUwLjA5Ny03MC43MDctMjIuMzg4Yy0xLjMxMywxLjg4Ny0yLjAzNCw0LjIwNS0yLjM1OCw2LjQ4Yy0yLjA0MSwxNC4zNDgtNC4xMywyOC43NC00LjcxMyw0My4yMjFjLTEuMzgzLDM0LjM0NCwwLjEwMiw2OC43NjItMS4xNzgsMTAzLjExMmMtMC40NTcsMTIuMjc5LTIwLjIxNSwxNy45MzItMjguODcyLDExLjE5N2MtNy42MzgtNS45NDMsMS42MTUtMTMuOTA0LDYuNDgxLTE2LjExNWMxMC45NzYtNC45OTIsMjYuMDM1LTAuOTA2LDMyLjk5OCw4LjgzOGM3Ljg2MSwxMS4wMDQtMC44NzEsMjIuMzQyLTUuODk1LDMxLjIyOWMtMTkuMjEsMzMuOTgtMzUuNzA1LDM4Ljg4OS03NC4wNjQsMzguODg5XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImJlbHVnYS1pc2FtdVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImlzYW11LWNhcGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTE4LjQ2OCwzNzIuNDAxYzAsMy42My0yMC41MzgsMTkuNzA3LTIyLjQ3MSwyMi42MjRjLTEwLjU5OSwxNS45OS0yMS40ODcsMzkuMDY2LTguNzM0LDU3LjIxNGMxNy41NjYsMjQuOTk5LDY2LjUyMSwyMS4zODQsOTAuNDA0LDE5LjY1M2MxMy4yMS0wLjk1NywyOC41NTEtMTEuOTMzLDMwLjU3Mi0yNS43NjljNy45MjMtNTQuMjM0LTQyLjY3Mi02NC41ODMtNzkuMDQ5LTM0LjkzOGMtMTUuNzkxLDEyLjg2Ni0xNS43ODUsMzUuODg3LTEyLjY2Niw1NC4xNTRjMS4xMDksNi40OTksNi4yNDYsMTEuNjQ4LDEwLjA0NSwxNy4wMzVjMzAuMjc1LDQyLjkyNyw1MS45NjQsMzkuNzY1LDEwNS43MDksMzYuOTkxYzguNjg3LTAuNDQ5LDIzLjEzNi02Ljk0OSwyNS4zMjctMTcuMDMxYzQuNTM5LTIwLjg3Ny0xMy4yMDMtMjMuNzkzLTI5LjQzMi0yMC45NjZjLTIwLjE4OCwzLjUxNi0xOS4xOTEsMzkuMDM4LTEzLjEwMSw1MS41NzljNy4yMTgsMTQuODYxLDI5LjczNSwxNi4zMzIsNDIuNzk2LDE3LjQ2OWMyNy4zNjQsMi4zNzksNjEuNTQ1LDYuNzE5LDc2LjkyNi0yMS4xMTdjMTUuMzY4LTI3LjgxNC0zNC41NTgtNDAuNDMxLTI1Ljc2NS00LjM2NWM1LjQxLDIyLjE4OSw2My45MiwxNi43MTksNzEuNjE5LTMuNDk0YzEuNTEtMy45NjEsMy4wMi04LjAxNiwzLjQ5NC0xMi4yMjljMC43LTYuMjIxLDAuODUxLTEyLjU3NiwwLTE4Ljc3OWMtMC43NTMtNS40ODMtMTMuMDgzLTcuNDE5LTE1LjE1Mi0yLjAzMWMtNy41ODgsMTkuNzUyLDIwLjAzNSwxMy41MzcsMzAuMjg2LTIuNzc0YzIuNjE4LTQuMTY2LDUuNjE0LTI2LjIwOSw1LjYxNC0yNi4yMDlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiY2FwYXMtcGVsb3Rhc1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzMy4xMTQsMzUwLjI1N2M3Ny43MjIsMzYuODA5LDQ1LjE2OS05Ljg2Myw3OS4wMTIsMGM3Ljc5OCwyLjI3MiwzLjkzNywxNi4zNDktOC45MjUsMjcuNjU1Yy0xMi44NjQsMTEuMzA2LTAuNzc2LDE5LjE2Myw2LjM1NiwxOS43MjFjOC40ODUsMC42NjMsMC42NzcsMjEuNDc5LDkuNDI0LDIxLjczNXMxNi4wNjUtMy43MjUsMjIuNTAxLTEzLjY3MWM2LjQzNS05Ljk0Niw4LjY3Ny0xMi43ODksMy44NzQtMTcuNzI2Yy0xMC42NzItMTAuOTY5LTAuMjA2LTIxLjMxNywwLTIxLjM2NmMxMi4yOTEtMi45MTYtMTMuMTg0LTIwLjY0LTE5LjM5OC0yOC40MDhjLTEwLjcxNi0xMy4zOTgtNDAuNzA3LTQuNTE4LTUwLjc1OSw1LjUzNmMtMTkuMzksMTkuMzkyLDEzLjcyMyw1My44OTktMTcuNDQzLDczLjQ1M2MtMzEuMTY2LDE5LjU1Myw0LjI0LDMzLjU1My00NC41MzMsMzMuNTUzYy0xOS45OTksMC0zOS43MjYtMjcuNDY1LTI2LjM1MS00Ni4yODdjMy41NzUtNS4wMzEsMTIuODI1LTE2LjM3NCwxNi41MjYtMjEuMzEyYzcuMjUtOS42NzYsMi4xMDUtOS42MDYsMTUuMTAyLTExLjA3XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInBlbG90YXMtbWFydGFcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzcuNDQ1LDMyNS4wNmM1LjQwNywxLjAwMiwxMC41LDIuNTAzLDE2LjA1NywxLjY0NWM5LjE5Ny0xLjQyMSwxMC4xMjMtMTQuNTYyLDguNjE1LTIwLjkyYy0yLjk0OC0xMi40MjMtMTkuMzMzLTE4LjM4Ni0zMC41NjMtMTMuODQ0Yy00Ljk5OCwyLjAyMS05LjIwNyw2LjU1Ny0xMS4zODIsMTEuNDljLTIuMjExLDUuMDE0LDAuMjY4LDExLjA2NC0wLjkyMywxNi40MTNjLTAuOTk4LDQuNDgyLTQuMTc5LDguMjI4LTUuNTM4LDEyLjYxNWMtMC43OTMsMi41NiwzLjg5LDguMjAxLDEuMTI1LDEyLjI5N2MtMi42ODksMy45ODQtMTIuODEzLDYuNDMxLTE0LjUzMiw4LjM5MmMtMy4yNDIsMy42OTcsNC4yNyw1LjA4Miw0LjI3LDUuMDgyYzAuNTE4LDEuMDgsMTkuNjgxLTAuMTE1LDIyLjI1OS01LjA4MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXJ0YS1rb2JhcmFoXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwia29iYXJhaC1kdWJcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDIuNzEsMzA3LjcyMWMtMTAuNjE2LTAuNTQtMzYuNDc5LTE0LjE4OC00Mi4yMDUtMjMuNzNjLTYuMjcyLTEwLjQ1MywxMi43NzYtMjkuMzkzLDIyLjY3Ni0zMS41NWM0Ljk5NS0xLjA4OCwxMC4wNzMtMi4wMjEsMTUuMTgyLTIuMTY5YzIwLjMxMy0wLjU5Miw2Mi4xMDEtNy4wMTIsNjAuOTI3LDI2LjIyNmMtMC4wNjUsMS44NTEtMS4yNDYsMy42MjctMi41NjQsNC45MjljLTkuNTk5LDkuNDgzLTE5LjI5MSwxOC45NjMtMjkuOTY5LDI3LjIxMmMtMjguMDY3LDIxLjY3OS0xMy4zMTUsOS41NjgtMzQuOTAxLDE1LjM4Yy05Ljc5MywyLjYzOC0xOC45OTgsNy40ODQtMjguOTgzLDkuMjY4Yy04LjcxNiwxLjU1Ni0zOS4zMTYtMC41MjMtNTIuMDU3LDcuMDk5Yy0zLjU1NSwyLjEyNy02LjU0LDUuNTA4LTguMjgxLDkuMjY4Yy0xLjMyNywyLjg2NS0xLjI3OSw2LjQzNC0wLjM5NSw5LjQ2NWMyLjk2LDEwLjE1LDExLjk2MywxNC4xOTcsMjEuMDk5LDE3Ljc0NmM0NS42OTIsMTcuNzU0LDUyLjQxOS0xMS42NjYsODAuNzg1LTQwLjM2MlxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJkdWItcGFyYWRpc2VcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJyZXR1cm4tdG8tYmVnaW5cXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuXHQ8ZyBpZD1cXFwibWFwLWRvdHNcXFwiIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDc4LjAwMDAwMCwgMTQwLjAwMDAwMClcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZGVpYVxcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMTMyLjUsMjZjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMTMwLjU2NywyNiwxMzIuNSwyNnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwibWF0ZW9cXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTE0OS41LDhjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVMxNTEuNDMzLDEsMTQ5LjUsMWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMxNDcuNTY3LDgsMTQ5LjUsOHpcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiZXMtdHJlbmNcXFwiPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJpc2FtdVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTMyOC41LDMyMGMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMzMjYuNTY3LDMyMCwzMjguNSwzMjB6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImJlbHVnYVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZXMtdHJlbmNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTM0Ni41LDM0N2MxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMzNDQuNTY3LDM0NywzNDYuNSwzNDd6XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImFyZWxsdWZcXFwiPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJjYXBhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNDMuNSwyMzNjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTNDEuNTY3LDIzMyw0My41LDIzM3pcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwicGVsb3Rhc1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNTAuNSwyMTJjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTNDguNTY3LDIxMiw1MC41LDIxMnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwibWFydGFcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTU3LjUsMTg2YzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVjMC0xLjkzMy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNUM1NCwxODQuNDM0LDU1LjU2NywxODYsNTcuNSwxODZ6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImtvYmFyYWhcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTI5LjUsMTk1YzEuOTMzLDAsMy41LTEuNTY2LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ni0zLjUsMy41UzI3LjU2NywxOTUsMjkuNSwxOTV6XFxcIi8+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImR1YlxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMjkuNSwxNzJjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY3LTMuNSwzLjVTMjcuNTY3LDE3MiwyOS41LDE3MnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwicGFyYWRpc2VcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgZD1cXFwiTTQuNSwxODNjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVM2LjQzMywxNzYsNC41LDE3NmMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMyLjU2NywxODMsNC41LDE4M3pcXFwiLz5cXG5cdFx0PC9nPlxcblx0PC9nPlxcblxcbjwvc3ZnPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBpZD0ncGFnZXMtY29udGFpbmVyJz5cXG5cdDxkaXYgaWQ9J3BhZ2UtYSc+PC9kaXY+XFxuXHQ8ZGl2IGlkPSdwYWdlLWInPjwvZGl2PlxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwibWFwLXdyYXBwZXJcXFwiPlxcblx0XFxuPC9kaXY+XHRcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG4gICAgXHRcbmNsYXNzIEdsb2JhbEV2ZW50cyB7XG5cdGluaXQoKSB7XG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRBcHBBY3Rpb25zLndpbmRvd1Jlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdsb2JhbEV2ZW50c1xuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5jbGFzcyBQcmVsb2FkZXIgIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpXG5cdFx0dGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIHRoaXMub25NYW5pZmVzdExvYWRDb21wbGV0ZWQsIHRoaXMpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSB1bmRlZmluZWRcblx0XHR0aGlzLmFsbE1hbmlmZXN0cyA9IFtdXG5cdH1cblx0bG9hZChtYW5pZmVzdCwgb25Mb2FkZWQpIHtcblxuXHRcdGlmKHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG0gPSB0aGlzLmFsbE1hbmlmZXN0c1tpXVxuXHRcdFx0XHRpZihtLmxlbmd0aCA9PSBtYW5pZmVzdC5sZW5ndGggJiYgbVswXS5pZCA9PSBtYW5pZmVzdFswXS5pZCAmJiBtW20ubGVuZ3RoLTFdLmlkID09IG1hbmlmZXN0W21hbmlmZXN0Lmxlbmd0aC0xXS5pZCkge1xuXHRcdFx0XHRcdG9uTG9hZGVkKClcdFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzLnB1c2gobWFuaWZlc3QpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSBvbkxvYWRlZFxuICAgICAgICB0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChtYW5pZmVzdClcblx0fVxuXHRvbk1hbmlmZXN0TG9hZENvbXBsZXRlZCgpIHtcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjaygpXG5cdH1cblx0Z2V0Q29udGVudEJ5SWQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZS5nZXRSZXN1bHQoaWQpXG5cdH1cblx0Z2V0SW1hZ2VVUkwoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDb250ZW50QnlJZChpZCkuZ2V0QXR0cmlidXRlKFwic3JjXCIpXG5cdH1cblx0Z2V0SW1hZ2VTaXplKGlkKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnRCeUlkKGlkKVxuXHRcdHJldHVybiB7IHdpZHRoOiBjb250ZW50LndpZHRoLCBoZWlnaHQ6IGNvbnRlbnQuaGVpZ2h0IH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkZXJcbiIsImltcG9ydCBoYXNoZXIgZnJvbSAnaGFzaGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBjcm9zc3JvYWRzIGZyb20gJ2Nyb3Nzcm9hZHMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmNsYXNzIFJvdXRlciB7XG5cdGluaXQoKSB7XG5cdFx0dGhpcy5yb3V0aW5nID0gZGF0YS5yb3V0aW5nXG5cdFx0dGhpcy5zZXR1cFJvdXRlcygpXG5cdFx0dGhpcy5maXJzdFBhc3MgPSB0cnVlXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIub2xkSGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5pbml0aWFsaXplZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHRoYXNoZXIuY2hhbmdlZC5hZGQodGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLnNldHVwQ3Jvc3Nyb2FkcygpXG5cdH1cblx0YmVnaW5Sb3V0aW5nKCkge1xuXHRcdGhhc2hlci5pbml0KClcblx0fVxuXHRzZXR1cENyb3Nzcm9hZHMoKSB7XG5cdCBcdHZhciByb3V0ZXMgPSBoYXNoZXIucm91dGVzXG5cdCBcdGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdCBcdFx0dmFyIHJvdXRlID0gcm91dGVzW2ldXG5cdCBcdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZShyb3V0ZSwgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdCBcdH07XG5cdFx0Y3Jvc3Nyb2Fkcy5hZGRSb3V0ZSgnJywgdGhpcy5vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0b25QYXJzZVVybCgpIHtcblx0XHR0aGlzLmFzc2lnblJvdXRlKClcblx0fVxuXHRvbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuc2VuZFRvRGVmYXVsdCgpXG5cdH1cblx0YXNzaWduUm91dGUoaWQpIHtcblx0XHR2YXIgaGFzaCA9IGhhc2hlci5nZXRIYXNoKClcblx0XHR2YXIgcGFydHMgPSB0aGlzLmdldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy51cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcnRzWzBdLCAocGFydHNbMV0gPT0gdW5kZWZpbmVkKSA/ICcnIDogcGFydHNbMV0pXG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IHRydWVcblx0fVxuXHRnZXRVUkxQYXJ0cyh1cmwpIHtcblx0XHR2YXIgaGFzaCA9IHVybFxuXHRcdHJldHVybiBoYXNoLnNwbGl0KCcvJylcblx0fVxuXHR1cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdC8vIElmIGZpcnN0IHBhc3Mgc2VuZCB0aGUgYWN0aW9uIGZyb20gQXBwLmpzIHdoZW4gYWxsIGFzc2V0cyBhcmUgcmVhZHlcblx0XHRpZih0aGlzLmZpcnN0UGFzcykge1xuXHRcdFx0dGhpcy5maXJzdFBhc3MgPSBmYWxzZVxuXHRcdH1lbHNle1xuXHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXG5cdFx0fVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZShuZXdIYXNoLCBvbGRIYXNoKSB7XG5cdFx0dGhpcy5uZXdIYXNoRm91bmRlZCA9IGZhbHNlXG5cdFx0Y3Jvc3Nyb2Fkcy5wYXJzZShuZXdIYXNoKVxuXHRcdGlmKHRoaXMubmV3SGFzaEZvdW5kZWQpIHJldHVyblxuXHRcdC8vIElmIFVSTCBkb24ndCBtYXRjaCBhIHBhdHRlcm4sIHNlbmQgdG8gZGVmYXVsdFxuXHRcdHRoaXMub25EZWZhdWx0VVJMSGFuZGxlcigpXG5cdH1cblx0c2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzZXR1cFJvdXRlcygpIHtcblx0XHRoYXNoZXIucm91dGVzID0gW11cblx0XHRoYXNoZXIuZGlwdHlxdWVSb3V0ZXMgPSBbXVxuXHRcdHZhciBpID0gMCwgaztcblx0XHRmb3IoayBpbiB0aGlzLnJvdXRpbmcpIHtcblx0XHRcdGhhc2hlci5yb3V0ZXNbaV0gPSBrXG5cdFx0XHRpZihrLmxlbmd0aCA+IDIpIGhhc2hlci5kaXB0eXF1ZVJvdXRlcy5wdXNoKGspXG5cdFx0XHRpKytcblx0XHR9XG5cdH1cblx0c3RhdGljIGdldEJhc2VVUkwoKSB7XG5cdFx0cmV0dXJuIGRvY3VtZW50LlVSTC5zcGxpdChcIiNcIilbMF1cblx0fVxuXHRzdGF0aWMgZ2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmdldEhhc2goKVxuXHR9XG5cdHN0YXRpYyBnZXRSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5yb3V0ZXNcblx0fVxuXHRzdGF0aWMgZ2V0RGlwdHlxdWVSb3V0ZXMoKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5kaXB0eXF1ZVJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXROZXdIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIubmV3SGFzaFxuXHR9XG5cdHN0YXRpYyBnZXRPbGRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIub2xkSGFzaFxuXHR9XG5cdHN0YXRpYyBzZXRIYXNoKGhhc2gpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChoYXNoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRlclxuIiwiaW1wb3J0IEFwcERpc3BhdGNoZXIgZnJvbSAnQXBwRGlzcGF0Y2hlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIyfSBmcm9tICdldmVudGVtaXR0ZXIyJ1xuaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuXG5mdW5jdGlvbiBfZ2V0Q29udGVudFNjb3BlKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHJldHVybiBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQoaGFzaE9iai5oYXNoKVxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNUb0xvYWQoKSB7XG4gICAgdmFyIHNjb3BlID0gX2dldENvbnRlbnRTY29wZSgpXG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIHR5cGUgPSBfZ2V0VHlwZU9mUGFnZSgpXG4gICAgdmFyIG1hbmlmZXN0O1xuXG4gICAgaWYodHlwZSAhPSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICB2YXIgZmlsZW5hbWVzID0gW1xuICAgICAgICAgICAgJ2NoYXJhY3Rlci5wbmcnLFxuICAgICAgICAgICAgJ2NoYXJhY3Rlci1iZy5qcGcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSB7XG4gICAgLy8gcmV0dXJuICdAJyArIF9nZXREZXZpY2VSYXRpbygpICsgJ3gnXG4gICAgcmV0dXJuICcnXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXREaXB0eXF1ZVNob2VzKCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBiYXNldXJsID0gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0KVxuICAgIHJldHVybiBfZ2V0Q29udGVudFNjb3BlKCkuc2hvZXNcbn1cblxudmFyIEFwcFN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIGl0ZW0pIHtcbiAgICAgICAgdGhpcy5lbWl0KHR5cGUsIGl0ZW0pXG4gICAgfSxcbiAgICBwYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUNvbnRlbnQoKVxuICAgIH0sXG4gICAgYXBwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0QXBwRGF0YSgpXG4gICAgfSxcbiAgICBkZWZhdWx0Um91dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERlZmF1bHRSb3V0ZSgpXG4gICAgfSxcbiAgICBnbG9iYWxDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRHbG9iYWxDb250ZW50KClcbiAgICB9LFxuICAgIHBhZ2VBc3NldHNUb0xvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNUb0xvYWQoKVxuICAgIH0sXG4gICAgZ2V0Um91dGVQYXRoU2NvcGVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZCA9IGlkLmxlbmd0aCA8IDEgPyAnLycgOiBpZFxuICAgICAgICByZXR1cm4gZGF0YS5yb3V0aW5nW2lkXVxuICAgIH0sXG4gICAgYmFzZU1lZGlhUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5nZXRFbnZpcm9ubWVudCgpLnN0YXRpY1xuICAgIH0sXG4gICAgZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZDogZnVuY3Rpb24ocGFyZW50LCB0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhcmVudCwgdGFyZ2V0KVxuICAgIH0sXG4gICAgZ2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwQ29uc3RhbnRzLkVOVklST05NRU5UU1tFTlZdXG4gICAgfSxcbiAgICBnZXRUeXBlT2ZQYWdlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0VHlwZU9mUGFnZShoYXNoKVxuICAgIH0sXG4gICAgZ2V0SG9tZVZpZGVvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydob21lLXZpZGVvcyddXG4gICAgfSxcbiAgICBnZW5lcmFsSW5mb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5jb250ZW50XG4gICAgfSxcbiAgICBkaXB0eXF1ZVNob2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREaXB0eXF1ZVNob2VzKClcbiAgICB9LFxuICAgIGdldE5leHREaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpKzEpID4gcm91dGVzLmxlbmd0aC0xID8gMCA6IChpKzEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpb3VzRGlwdHlxdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAoaS0xKSA8IDAgPyByb3V0ZXMubGVuZ3RoLTEgOiAoaS0xKVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaW5kZXhdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXREaXB0eXF1ZVBhZ2VJbmRleDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQcmV2aWV3VXJsQnlIYXNoOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZGlwdHlxdWUvJyArIGhhc2ggKyAnL3ByZXZpZXcuZ2lmJ1xuICAgIH0sXG4gICAgbGFuZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkZWZhdWx0TGFuZyA9IHRydWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxhbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGFuZyA9IGRhdGEubGFuZ3NbaV1cbiAgICAgICAgICAgIGlmKGxhbmcgPT0gSlNfbGFuZykge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRMYW5nID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIChkZWZhdWx0TGFuZyA9PSB0cnVlKSA/ICdlbicgOiBKU19sYW5nXG4gICAgfSxcbiAgICBXaW5kb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3dpbmRvd1dpZHRoSGVpZ2h0KClcbiAgICB9LFxuICAgIGFkZFBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIuYWRkKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICByZW1vdmVQWENoaWxkOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIEFwcFN0b3JlLlBYQ29udGFpbmVyLnJlbW92ZShpdGVtLmNoaWxkKVxuICAgIH0sXG4gICAgUGFyZW50OiB1bmRlZmluZWQsXG4gICAgQ2FudmFzOiB1bmRlZmluZWQsXG4gICAgT3JpZW50YXRpb246IEFwcENvbnN0YW50cy5MQU5EU0NBUEUsXG4gICAgRGV0ZWN0b3I6IHtcbiAgICAgICAgaXNNb2JpbGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb25cbiAgICAgICAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFOlxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy53ID0gYWN0aW9uLml0ZW0ud2luZG93V1xuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy5oID0gYWN0aW9uLml0ZW0ud2luZG93SFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLk9yaWVudGF0aW9uID0gKEFwcFN0b3JlLldpbmRvdy53ID4gQXBwU3RvcmUuV2luZG93LmgpID8gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSA6IEFwcENvbnN0YW50cy5QT1JUUkFJVFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoYWN0aW9uLmFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSwgYWN0aW9uLml0ZW0pIFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBBcHBTdG9yZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIFB4SGVscGVyID0ge1xuXG4gICAgZ2V0UFhWaWRlbzogZnVuY3Rpb24odXJsLCB3aWR0aCwgaGVpZ2h0LCB2YXJzKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21WaWRlbyh1cmwpXG4gICAgICAgIHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlLnNldEF0dHJpYnV0ZShcImxvb3BcIiwgdHJ1ZSlcbiAgICAgICAgdmFyIHZpZGVvU3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpXG4gICAgICAgIHZpZGVvU3ByaXRlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdmlkZW9TcHJpdGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHJldHVybiB2aWRlb1Nwcml0ZVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXI6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjaGlsZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0RnJhbWVJbWFnZXNBcnJheTogZnVuY3Rpb24oZnJhbWVzLCBiYXNldXJsLCBleHQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBiYXNldXJsICsgaSArICcuJyArIGV4dFxuICAgICAgICAgICAgYXJyYXlbaV0gPSB1cmxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFB4SGVscGVyIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBVdGlscyB7XG5cdHN0YXRpYyBOb3JtYWxpemVNb3VzZUNvb3JkcyhlLCBvYmpXcmFwcGVyKSB7XG5cdFx0dmFyIHBvc3ggPSAwO1xuXHRcdHZhciBwb3N5ID0gMDtcblx0XHRpZiAoIWUpIHZhciBlID0gd2luZG93LmV2ZW50O1xuXHRcdGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIFx0e1xuXHRcdFx0cG9zeCA9IGUucGFnZVg7XG5cdFx0XHRwb3N5ID0gZS5wYWdlWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG5cdFx0XHRwb3N5ID0gZS5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0XHRvYmpXcmFwcGVyLnggPSBwb3N4XG5cdFx0b2JqV3JhcHBlci55ID0gcG9zeVxuXHRcdHJldHVybiBvYmpXcmFwcGVyXG5cdH1cblx0c3RhdGljIFJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgY29udGVudFcsIGNvbnRlbnRILCBvcmllbnRhdGlvbikge1xuXHRcdHZhciBhc3BlY3RSYXRpbyA9IGNvbnRlbnRXIC8gY29udGVudEhcblx0XHRpZihvcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZihvcmllbnRhdGlvbiA9PSBBcHBDb25zdGFudHMuTEFORFNDQVBFKSB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dIIC8gY29udGVudEgpICogMVxuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dXIC8gd2luZG93SCkgPCBhc3BlY3RSYXRpbykgPyAod2luZG93SCAvIGNvbnRlbnRIKSAqIDEgOiAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHR9XG5cdFx0dmFyIG5ld1cgPSBjb250ZW50VyAqIHNjYWxlXG5cdFx0dmFyIG5ld0ggPSBjb250ZW50SCAqIHNjYWxlXG5cdFx0dmFyIGNzcyA9IHtcblx0XHRcdHdpZHRoOiBuZXdXLFxuXHRcdFx0aGVpZ2h0OiBuZXdILFxuXHRcdFx0bGVmdDogKHdpbmRvd1cgPj4gMSkgLSAobmV3VyA+PiAxKSxcblx0XHRcdHRvcDogKHdpbmRvd0ggPj4gMSkgLSAobmV3SCA+PiAxKSxcblx0XHRcdHNjYWxlOiBzY2FsZVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gY3NzXG5cdH1cblx0c3RhdGljIENhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcblx0ICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG5cdH1cblx0c3RhdGljIFN1cHBvcnRXZWJHTCgpIHtcblx0XHR0cnkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0XHRyZXR1cm4gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApICk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBEZXN0cm95VmlkZW8odmlkZW8pIHtcbiAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgdmlkZW8uc3JjID0gJyc7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZpZGVvLmNoaWxkTm9kZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIFx0Y2hpbGQuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIFx0Ly8gV29ya2luZyB3aXRoIGEgcG9seWZpbGwgb3IgdXNlIGpxdWVyeVxuICAgICAgICBcdGRvbS50cmVlLnJlbW92ZShjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgRGVzdHJveVZpZGVvVGV4dHVyZSh0ZXh0dXJlKSB7XG4gICAgXHR2YXIgdmlkZW8gPSB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZVxuICAgICAgICBVdGlscy5EZXN0cm95VmlkZW8odmlkZW8pXG4gICAgfVxuICAgIHN0YXRpYyBSYW5kKG1pbiwgbWF4LCBkZWNpbWFscykge1xuICAgICAgICB2YXIgcmFuZG9tTnVtID0gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluXG4gICAgICAgIGlmKGRlY2ltYWxzID09IHVuZGVmaW5lZCkge1xuICAgICAgICBcdHJldHVybiByYW5kb21OdW1cbiAgICAgICAgfWVsc2V7XG5cdCAgICAgICAgdmFyIGQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbHMpXG5cdCAgICAgICAgcmV0dXJuIH5+KChkICogcmFuZG9tTnVtKSArIDAuNSkgLyBkXG4gICAgICAgIH1cblx0fVxuXHRzdGF0aWMgR2V0SW1nVXJsSWQodXJsKSB7XG5cdFx0dmFyIHNwbGl0ID0gdXJsLnNwbGl0KCcvJylcblx0XHRyZXR1cm4gc3BsaXRbc3BsaXQubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0fVxuXHRzdGF0aWMgU3R5bGUoZGl2LCBzdHlsZSkge1xuICAgIFx0ZGl2LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1velRyYW5zZm9ybSAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1zVHJhbnNmb3JtICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm9UcmFuc2Zvcm0gICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLnRyYW5zZm9ybSAgICAgICA9IHN0eWxlXG4gICAgfVxuICAgIHN0YXRpYyBUcmFuc2xhdGUoZGl2LCB4LCB5LCB6KSB7XG4gICAgXHRpZiAoJ3dlYmtpdFRyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAnbW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdvVHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICd0cmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUpIHtcbiAgICBcdFx0VXRpbHMuU3R5bGUoZGl2LCAndHJhbnNsYXRlM2QoJyt4KydweCwnK3krJ3B4LCcreisncHgpJylcblx0XHR9ZWxzZXtcblx0XHRcdGRpdi5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuXHRcdFx0ZGl2LnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuXHRcdH1cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvKGl0ZW0sIHRvUG9zaXRpb24sIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1Bvc2l0aW9uLnggLSBpdGVtLnBvc2l0aW9uLnhcbiAgICBcdHZhciBkeSA9IHRvUG9zaXRpb24ueSAtIGl0ZW0ucG9zaXRpb24ueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9Qb3NpdGlvbi54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9Qb3NpdGlvbi55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHkueCArPSAodGFyZ2V0WCAtIGl0ZW0ucG9zaXRpb24ueCkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnkgKz0gKHRhcmdldFkgLSBpdGVtLnBvc2l0aW9uLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eS55ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG4gICAgfVxuICAgIHN0YXRpYyBTcHJpbmdUb1NjYWxlKGl0ZW0sIHRvU2NhbGUsIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1NjYWxlLnggLSBpdGVtLnNjYWxlLnhcbiAgICBcdHZhciBkeSA9IHRvU2NhbGUueSAtIGl0ZW0uc2NhbGUueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9TY2FsZS54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9TY2FsZS55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICs9ICh0YXJnZXRYIC0gaXRlbS5zY2FsZS54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS55ICs9ICh0YXJnZXRZIC0gaXRlbS5zY2FsZS55KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25JbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnXG59XG5cbi8vIERpc3BhdGNoZXJcbnZhciBQYWdlckRpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVBhZ2VyQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKGFjdGlvbilcblx0fVxufSlcblxuLy8gU3RvcmVcbnZhciBQYWdlclN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGZpcnN0UGFnZVRyYW5zaXRpb246IHRydWUsXG4gICAgcGFnZVRyYW5zaXRpb25TdGF0ZTogdW5kZWZpbmVkLCBcbiAgICBkaXNwYXRjaGVySW5kZXg6IFBhZ2VyRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBwYXlsb2FkLnR5cGVcbiAgICAgICAgdmFyIGl0ZW0gPSBwYXlsb2FkLml0ZW1cbiAgICAgICAgc3dpdGNoKGFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWTpcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTXG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlLCBpdGVtKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IGZhbHNlXG5cdFx0dGhpcy5jb21wb25lbnREaWRNb3VudCA9IHRoaXMuY29tcG9uZW50RGlkTW91bnQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdHJlbmRlcihjaGlsZElkLCBwYXJlbnRJZCwgdGVtcGxhdGUsIG9iamVjdCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbE1vdW50KClcblx0XHR0aGlzLmNoaWxkSWQgPSBjaGlsZElkXG5cdFx0dGhpcy5wYXJlbnRJZCA9IHBhcmVudElkXG5cdFx0XG5cdFx0aWYoZG9tLmlzRG9tKHBhcmVudElkKSkge1xuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnRJZFxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGlkID0gdGhpcy5wYXJlbnRJZC5pbmRleE9mKCcjJykgPiAtMSA/IHRoaXMucGFyZW50SWQuc3BsaXQoJyMnKVsxXSA6IHRoaXMucGFyZW50SWRcblx0XHRcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0fVxuXG5cdFx0aWYodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH1lbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHR2YXIgdCA9IHRlbXBsYXRlKG9iamVjdClcblx0XHRcdHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0XG5cdFx0fVxuXHRcdGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHNsdWcoY2hpbGRJZCkpXG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMucGFyZW50LCB0aGlzLmVsZW1lbnQpXG5cblx0XHRzZXRUaW1lb3V0KHRoaXMuY29tcG9uZW50RGlkTW91bnQsIDApXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMpXG5cdFx0dGhpcy5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdFx0dGhpcy5lbGVtZW50LnJlbW92ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDb21wb25lbnRcblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZVBhZ2UgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5wcm9wcyA9IHByb3BzXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlID0gdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMudGxJbiA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGhpcy50bE91dCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5yZXNpemUoKVxuXHRcdHRoaXMuc2V0dXBBbmltYXRpb25zKClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuaXNSZWFkeSh0aGlzLnByb3BzLmhhc2gpLCAwKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblxuXHRcdC8vIHJlc2V0XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0dGhpcy50bEluLnRpbWVTY2FsZSgxLjQpXG5cdFx0c2V0VGltZW91dCgoKT0+dGhpcy50bEluLnBsYXkoMCksIDgwMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLnRsT3V0LmdldENoaWxkcmVuKCkubGVuZ3RoIDwgMSkge1xuXHRcdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSlcblx0XHRcdHRoaXMudGxPdXQudGltZVNjYWxlKDEuMilcblx0XHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxPdXQucGxheSgwKSwgNTAwKVxuXHRcdH1cblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRsSW4uZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSwgMClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSwgMClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Zm9yY2VVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHR0aGlzLnRsT3V0LmNsZWFyKClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50cywgUGFnZXJEaXNwYXRjaGVyfSBmcm9tICdQYWdlcidcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdQYWdlc0NvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEJhc2VQYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICdwYWdlLWInXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25JbiA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4uYmluZCh0aGlzKVxuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCA9IHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2guYmluZCh0aGlzKVxuXHRcdHRoaXMuY29tcG9uZW50cyA9IHtcblx0XHRcdCduZXctY29tcG9uZW50JzogdW5kZWZpbmVkLFxuXHRcdFx0J29sZC1jb21wb25lbnQnOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQmFzZVBhZ2VyJywgcGFyZW50LCB0ZW1wbGF0ZSwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsIHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2gpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnN3aXRjaFBhZ2VzRGl2SW5kZXgoKVxuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uT3V0KCkge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHRcdFBhZ2VyQWN0aW9ucy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCgpXG5cdH1cblx0ZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSgpIHtcblx0XHRBcHBBY3Rpb25zLmxvYWRQYWdlQXNzZXRzKClcblx0fVxuXHRwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCgpIHtcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ29sZC1jb21wb25lbnQnKVxuXHR9XG5cdHN3aXRjaFBhZ2VzRGl2SW5kZXgoKSB7XG5cdFx0dmFyIG5ld0NvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdFx0dmFyIG9sZENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddXG5cdFx0aWYobmV3Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgbmV3Q29tcG9uZW50LnBhcmVudC5zdHlsZVsnei1pbmRleCddID0gMlxuXHRcdGlmKG9sZENvbXBvbmVudCAhPSB1bmRlZmluZWQpIG9sZENvbXBvbmVudC5wYXJlbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDFcblx0fVxuXHRzZXR1cE5ld0NvbXBvbmVudChoYXNoLCBUeXBlLCB0ZW1wbGF0ZSkge1xuXHRcdHZhciBpZCA9IFV0aWxzLkNhcGl0YWxpemVGaXJzdExldHRlcihoYXNoLnBhcmVudC5yZXBsYWNlKFwiL1wiLCBcIlwiKSlcblx0XHR0aGlzLm9sZFBhZ2VEaXZSZWYgPSB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICh0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID09PSAncGFnZS1hJykgPyAncGFnZS1iJyA6ICdwYWdlLWEnXG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jdXJyZW50UGFnZURpdlJlZilcblxuXHRcdHZhciBwcm9wcyA9IHtcblx0XHRcdGlkOiB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmLFxuXHRcdFx0aXNSZWFkeTogdGhpcy5vblBhZ2VSZWFkeSxcblx0XHRcdGhhc2g6IGhhc2gsXG5cdFx0XHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUsXG5cdFx0XHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSxcblx0XHRcdGRhdGE6IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR9XG5cdFx0dmFyIHBhZ2UgPSBuZXcgVHlwZShwcm9wcylcblx0XHRwYWdlLnJlbmRlcihpZCwgZWwsIHRlbXBsYXRlLCBwcm9wcy5kYXRhKVxuXHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSA9IHBhZ2Vcblx0XHRpZihQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPT09IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUykge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10uZm9yY2VVbm1vdW50KClcblx0XHR9XG5cdH1cblx0b25QYWdlUmVhZHkoaGFzaCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblBhZ2VSZWFkeShoYXNoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR1bm1vdW50Q29tcG9uZW50KHJlZikge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1tyZWZdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1tyZWZdLnJlbW92ZSgpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQYWdlclxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiY29udGVudFwiOiB7XG5cdFx0XCJ0d2l0dGVyX3VybFwiOiBcImh0dHBzOi8vdHdpdHRlci5jb20vY2FtcGVyXCIsXG5cdFx0XCJmYWNlYm9va191cmxcIjogXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vQ2FtcGVyXCIsXG5cdFx0XCJpbnN0YWdyYW1fdXJsXCI6IFwiaHR0cHM6Ly9pbnN0YWdyYW0uY29tL2NhbXBlci9cIixcblx0XHRcImxhYl91cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vbGFiXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIlNob3BcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcIk1lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJXb21lblwiLFxuXHRcdFx0XHRcInBsYW5ldFwiOiBcIlBsYW5ldFwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIixcblx0XHRcdFx0XCJidXlfYnRuX3R4dFwiOiBcIkJVWSBUSElTIE1PREVMXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0XCJsYW5nc1wiOiBbXCJlblwiLCBcImZyXCIsIFwiZXNcIiwgXCJpdFwiLCBcImRlXCIsIFwicHRcIl0sXG5cblx0XCJob21lLXZpZGVvc1wiOiBbXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjJiMzYwYzhjYTM5OTY5Njk4NTMxM2RkZTk5YmE4M2Q0ZWM5NzJiNy9hcmVsbHVmLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjk4MGYxNGNjOGJkOTkxMmIxNGRjYTQ2YTRjZDRhODVmYTA0Nzc0Yy9hcmVsbHVmLWtvYmFyYWYubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2E4MTljMzczZjk3Nzc4NTJmMzk2N2NlMDIzYmNmYjBkOTExNTM4NmYvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvM2RjZmQ3MGM3MDcyNjkyZWEzYTczOWFlZjUzNzZiMDI2YjA0YjY3NS9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzRiYjZlNDg1YjcxN2JmN2RiZGQ1Yzk0MWZhZmEyYjE4ODRlOTA4MzgvZGVpYS1tYXJ0YS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZTQyNDg4OWFjMDI2ZjcwZTU0NGFmMDMwMzVlNzE4N2YzNDk0MTcwNS9kZWlhLW1hdGVvLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMzQ0NGQzYzg2OTNlNTlmODA3OWY4MjdkZDE4MmM1ZTMzNDEzODc3L2VzLXRyZW5jLWJlbHVnYS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNmVhZmFlN2YxYjNiYzQxZDg1Njk3MzU1N2EyZjUxNTk4YzgyNDFhNi9lcy10cmVuYy1pc2FtdS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOWI5NDcxZGNiZTFmOTRmZjdiMzUwODg0MWY2OGZmMTViZTE5MmVlNC9lcy10cmVuYy1tYXJ0YS5tcDRcIlxuXHRdLFxuXG5cdFwiZGVmYXVsdC1yb3V0ZVwiOiBcIlwiLFxuXG5cdFwicm91dGluZ1wiOiB7XG5cdFx0XCIvXCI6IHtcblx0XHRcdFwidGV4dHNcIjoge1xuXHRcdFx0XHRcInR4dF9hXCI6IFwiQmFjayB0byB0aGUgcm9vdHMuIEluc3BpcmF0aW9ucyBmb3Igb3VyIG5ldyBjb2xsZWN0aW9uIGNvbWVzIGZyb20gdGhlIGJhbGVhcmljIGlzbGFuZCBvZiBNYWxsb3JjYSwgdGhlIGZvdW5kaW5nIGdyb3VuZCBvZiBDYW1wZXIuIFZpc2l0IHRocmVlIGRpZmZlcmVudCBzcG90cyBvZiB0aGUgaXNsYW5kIC0gRGVpYSwgRXMgVHJlbmMgYW5kIEFyZWxsdWYgLSBhcyBpbnRlcnByZXRlZCBieSBjcmVhdGl2ZSBkaXJlY3RvciwgUm9tYWluIEtyZW1lci5cIixcblx0XHRcdFx0XCJhX3Zpc2lvblwiOiBcIkEgVklTSU9OIE9GXCJcblx0XHRcdH0sXG5cdFx0XHRcImFzc2V0c1wiOiBbXG5cdFx0XHRcdFwiYmFja2dyb3VuZC5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWNhcGFzLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtZHViLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYta29iYXJhZi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLXBhcmFkaXNlLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtcGVsb3Rhcy5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hcnRhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2RlaWEtbWF0ZW8uanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZXMtdHJlbmMtYmVsdWdhLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWlzYW11LmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLW1hcnRhLmpwZ1wiXG5cdFx0XHRdXG5cdFx0fSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzEzYmJiNjExOTUxNjQ4NzNkODIzYTNiOTFhMmM4MmFjY2VmYjNlZGQvZGVpYS1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxODgsIFwic1wiOiA4NSwgXCJ2XCI6IDYxIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDM1NywgXCJzXCI6IDk3LCBcInZcIjogMjYgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM1OSwgXCJzXCI6IDkzLCBcInZcIjogNTEgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiQnJlYWtpbmcgdXAgb24gYSB0ZXh0IG1lc3NhZ2UgaXMgbm90IHZlcnkgZGVpYVwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImRlaWEvbWF0ZW9cIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZTQyNDg4OWFjMDI2ZjcwZTU0NGFmMDMwMzVlNzE4N2YzNDk0MTcwNS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzcsIFwic1wiOiA4OSwgXCJ2XCI6IDgzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA4NiwgXCJ2XCI6IDU3IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTUwYjY5MjVmYTRmODVjZmE4ZDQ2NmQ4NDM2MTY3MTc5N2MyMGMxYS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiYnV5cyBhbiBhdGVsaWVyIGF0IGRlaWEuPGJyPnN0YXJ0cyBjYXJlZXIgYXMgYW4gYXJ0aXN0XCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJlcy10cmVuYy9iZWx1Z2FcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjM0NDRkM2M4NjkzZTU5ZjgwNzlmODI3ZGQxODJjNWUzMzQxMzg3Ny9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMTIsIFwic1wiOiAxMCwgXCJ2XCI6IDY5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE5MywgXCJzXCI6IDEyLCBcInZcIjogNDUgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE5MywgXCJzXCI6IDAsIFwidlwiOiA0NSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNzA0NTVhZDczYWY3YjdlMzVlOWU2NzQxMDk5MjljM2I3MDI5NDA2NC9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJFUyBUUkVOQyBQQVJUWSBCT1lcIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJlcy10cmVuYy9pc2FtdVwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEwLCBcInNcIjogMSwgXCJ2XCI6IDc0IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIxLCBcInNcIjogMzUsIFwidlwiOiA3MiB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAsIFwic1wiOiA0NSwgXCJ2XCI6IDMwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8wNjY3OWYzZWJkNjk2ZTljNDJmZDEzY2Y5ZGJkYWVmZmU5YjFmODczL2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiVUZPIHNpZ2h0aW5nIGF0IGVzIHRyZW5jXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cblx0XHRcImFyZWxsdWYvY2FwYXNcIjoge1xuXHRcdFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAwLCBcInNcIjogMCwgXCJ2XCI6IDAgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA3NiwgXCJ2XCI6IDkxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80OGZmMWM1OGI4NmIwODkxMjY4MWI0ZmRmM2I3NTQ3Yzc1Nzc2NmQ3L2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJNRUFOV0hJTEUgSU4gQVJFTExVRlwiXG4gICAgICAgIFx0fVxuXHRcdH0sXG4gICAgICAgIFwiYXJlbGx1Zi9wZWxvdGFzXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzNkY2ZkNzBjNzA3MjY5MmVhM2E3MzlhZWY1Mzc2YjAyNmIwNGI2NzUvYXJlbGx1Zi1wZWxvdGFzLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjExLCBcInNcIjogOTUsIFwidlwiOiAyOSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMiwgXCJzXCI6IDM1LCBcInZcIjogNzkgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDIzMywgXCJzXCI6IDM1LCBcInZcIjogMTAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2FjMTZkNTNjNGY5ZThmZDY5MzA3NzllMjM3ODU0Njg3ZGNmMjQxZTgvYXJlbGx1Zi1wZWxvdGFzLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiV0hBVCBIQVBQRU5TIElOIEFSRUxMVUYgU1RBWVMgSU4gQVJFTExVRlwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvbWFydGFcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjAwLCBcInNcIjogNTcsIFwidlwiOiA4MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAxLCBcInNcIjogMTAwLCBcInZcIjogNjkgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzViOWQyNzA2MTAwZTVlYTBkMzE3MTQzZTIzNzRkNmJkNmM5NjA3YjEvYXJlbGx1Zi1tYXJ0YS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkJBRCBUUklQIEFUIFRIRSBIT1RFTCBQT09MXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9rb2JhcmFoXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzI5ODBmMTRjYzhiZDk5MTJiMTRkY2E0NmE0Y2Q0YTg1ZmEwNDc3NGMvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjY0LCBcInNcIjogNjksIFwidlwiOiA0MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNDQsIFwic1wiOiA1NiwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMzQ0LCBcInNcIjogNDEsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzYyZTU0ZWFjMWQ4OTg5YWI5ZGUyMzhmYTNmN2M2ZDhkYjRkOWRlOGQvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiSGF0ZXJzIHdpbGwgc2F5IGl0cyBwaG90b3Nob3BcIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcblx0XHRcImFyZWxsdWYvZHViXCI6IHtcblx0XHRcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjJiMzYwYzhjYTM5OTY5Njk4NTMxM2RkZTk5YmE4M2Q0ZWM5NzJiNy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDE5NiwgXCJzXCI6IDUyLCBcInZcIjogMzMgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTUsIFwic1wiOiA4NCwgXCJ2XCI6IDEwMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTg3YmRhYjAxMjk3OTgyMmI4MTg2Mzc4MzdjYzI4ODQxNGNlZjhmMy9hcmVsbHVmLWR1Yi5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIRU4gWU9VIENBTidUIEtFRVAgVEhFIEFSUk9XIE9OIFRIRSBDRU5URVIgTElORVwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvcGFyYWRpc2VcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogNTksIFwic1wiOiAxOSwgXCJ2XCI6IDk5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIwNywgXCJzXCI6IDMxLCBcInZcIjogMTAwIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxODMsIFwic1wiOiA3MSwgXCJ2XCI6IDY0IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy81ZGMxOTcyNmVmYTdiMmU3NTZjODA1MzRkNDNmYTYwMGNjNjFmMTc4L2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJTRUxGSUUgT04gV0FURVJTTElERSBMSUtFIEEgQk9TU1wiXG4gICAgICAgIFx0fVxuICAgICAgICB9XG5cblx0fVxufSJdfQ==
