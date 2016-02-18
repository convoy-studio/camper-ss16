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

			this.tlIn.from(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut, force3D: true }, 0);
			this.tlIn.from(this.leftPart.bgSprite, 1, { x: this.leftPart.bgSprite.x - 200, ease: Expo.easeOut, force3D: true }, 0.5);
			this.tlIn.from(this.leftPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut, force3D: true }, 0.4);
			this.tlIn.from(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut, force3D: true }, 0);
			this.tlIn.from(this.rightPart.bgSprite, 1, { x: this.rightPart.bgSprite.x + 200, ease: Expo.easeOut, force3D: true }, 0.5);
			this.tlIn.from(this.rightPart.bgSprite.scale, 1, { x: 3, ease: Expo.easeOut, force3D: true }, 0.4);

			this.tlOut.to(this.leftPart.holder, 1, { x: -windowW >> 1, ease: Expo.easeInOut, force3D: true }, 0);
			this.tlOut.to(this.rightPart.holder, 1, { x: windowW, ease: Expo.easeInOut, force3D: true }, 0);

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0RpcHR5cXVlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3BhZ2VzL0hvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc2VsZmllLXN0aWNrLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3NvY2lhbC1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy92aWRlby1jYW52YXMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbnN0YW50cy9BcHBDb25zdGFudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2Rpc3BhdGNoZXJzL0FwcERpc3BhdGNoZXIuanMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0RpcHR5cXVlLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvTWFwLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvUGFnZXNDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9UcmFuc2l0aW9uTWFwLmhicyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvR2xvYmFsRXZlbnRzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVsb2FkZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1JvdXRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc3RvcmVzL0FwcFN0b3JlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9QeEhlbHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvVXRpbHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL3JhZi5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9QYWdlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VDb21wb25lbnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvcGFnZXIvY29tcG9uZW50cy9CYXNlUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlci5qcyIsInd3dy9kYXRhL2RhdGEuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDaEQsWUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFN0MsV0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDbkQsWUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDcEQsWUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxHQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUMsR0FBRyxJQUFJLENBQUE7O0FBRTNELFlBQVUsQ0FBQyxZQUFJO0FBQ2QsWUFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLElBQUssU0FBUyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLElBQUksQ0FBQTtBQUNoRixhQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsSUFBSyxVQUFVLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ2xGLGFBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFLLENBQUMsQ0FBQSxJQUFLLFVBQVUsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBRyxJQUFJLENBQUE7R0FDekYsQ0FBQyxDQUFBO0VBRUYsQ0FBQTs7QUFFRCxNQUFLLEdBQUc7QUFDUCxRQUFNLEVBQUUsTUFBTTtFQUNkLENBQUE7O0FB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QUFDaEMsT0FBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7QUFDaEMsT0FBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7QUFDaEMsT0FBSSxFQUFFLEdBQUcsQUFBQyxFQUFFLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMxQixPQUFJLEVBQUUsR0FBRyxBQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzFCLE9BQUksRUFBRSxHQUFHLEFBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRTFCLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdCLFFBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLEtBQUssR0FBQyxDQUFDLEdBQUMsRUFBRSxBQUFDLENBQUMsQ0FBQTtBQUNoRCxRQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsd0JBQVcsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDM0MsV0FBTyxDQUFDLEtBQUss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QUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUN0QyxZQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ3ZDLFlBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDekMsWUFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFeEMsTUFBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDekMsTUFBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDM0MsTUFBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDdkMsTUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUE7Ozs7Ozs7QUFPckMsVUFBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2hELFVBQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNsRCxVQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDOUMsVUFBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFBO0dBRTVDO0FBQ0QsT0FBSyxFQUFFLGlCQUFLO0FBQ1gsd0JBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxT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QUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDdEgsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQy9GLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzlGLE9BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUN4SCxPQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7O0FBRWhHLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2xHLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUU3RixPQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUE7QUFDL0IsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvRixPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxJQUFJ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YUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDN0MsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxBQUFDLENBQUE7QUFDM0UsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQSxHQUFJLEVBQUUsQ0FBQTtBQUM5QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFBO0lBQzlDLE1BQUk7QUFDSixhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUM3QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtBQUM3QyxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFBO0FBQzlDLGFBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUEsR0FBSSxFQUFFLENBQUE7SUFDOUM7O0FBRUQsV0FBUSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUUzQyxZQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEdBQUksR0FBRyxDQUFBOztBQUU1RSxZQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMs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NkZBLFNBQVM7Ozs7QUNyR3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9iYXNlJyk7XG5cbnZhciBiYXNlID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbi8vIEVhY2ggb2YgdGhlc2UgYXVnbWVudCB0aGUgSGFuZGxlYmFycyBvYmplY3QuIE5vIG5lZWQgdG8gc2V0dXAgaGVyZS5cbi8vIChUaGlzIGlzIGRvbmUgdG8gZWFzaWx5IHNoYXJlIGNvZGUgYmV0d2VlbiBjb21tb25qcyBhbmQgYnJvd3NlIGVudnMpXG5cbnZhciBfU2FmZVN0cmluZyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZycpO1xuXG52YXIgX1NhZmVTdHJpbmcyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX1NhZmVTdHJpbmcpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfaW1wb3J0MiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Mik7XG5cbnZhciBfaW1wb3J0MyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9ydW50aW1lJyk7XG5cbnZhciBydW50aW1lID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDMpO1xuXG52YXIgX25vQ29uZmxpY3QgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnKTtcblxudmFyIF9ub0NvbmZsaWN0MiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9ub0NvbmZsaWN0KTtcblxuLy8gRm9yIGNvbXBhdGliaWxpdHkgYW5kIHVzYWdlIG91dHNpZGUgb2YgbW9kdWxlIHN5c3RlbXMsIG1ha2UgdGhlIEhhbmRsZWJhcnMgb2JqZWN0IGEgbmFtZXNwYWNlXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBoYiA9IG5ldyBiYXNlLkhhbmRsZWJhcnNFbnZpcm9ubWVudCgpO1xuXG4gIFV0aWxzLmV4dGVuZChoYiwgYmFzZSk7XG4gIGhiLlNhZmVTdHJpbmcgPSBfU2FmZVN0cmluZzJbJ2RlZmF1bHQnXTtcbiAgaGIuRXhjZXB0aW9uID0gX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXTtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn1cblxudmFyIGluc3QgPSBjcmVhdGUoKTtcbmluc3QuY3JlYXRlID0gY3JlYXRlO1xuXG5fbm9Db25mbGljdDJbJ2RlZmF1bHQnXShpbnN0KTtcblxuaW5zdFsnZGVmYXVsdCddID0gaW5zdDtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gaW5zdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5IYW5kbGViYXJzRW52aXJvbm1lbnQgPSBIYW5kbGViYXJzRW52aXJvbm1lbnQ7XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIFZFUlNJT04gPSAnMy4wLjEnO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjtcbnZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDY7XG5cbmV4cG9ydHMuQ09NUElMRVJfUkVWSVNJT04gPSBDT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJ1xufTtcblxuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTtcbiAgICAgIH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHVucmVnaXN0ZXJIZWxwZXIobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiByZWdpc3RlclBhcnRpYWwobmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0F0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGFzIHVuZGVmaW5lZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHBhcnRpYWw7XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gdW5yZWdpc3RlclBhcnRpYWwobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLnBhcnRpYWxzW25hbWVdO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBBIG1pc3NpbmcgZmllbGQgaW4gYSB7e2Zvb319IGNvbnN0dWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTWlzc2luZyBoZWxwZXI6IFwiJyArIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0ubmFtZSArICdcIicpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTXVzdCBwYXNzIGl0ZXJhdG9yIHRvICNlYWNoJyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbixcbiAgICAgICAgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIHJldCA9ICcnLFxuICAgICAgICBkYXRhID0gdW5kZWZpbmVkLFxuICAgICAgICBjb250ZXh0UGF0aCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IFV0aWxzLmJsb2NrUGFyYW1zKFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLCBbY29udGV4dFBhdGggKyBmaWVsZCwgbnVsbF0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByaW9yS2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb25hbCkpIHtcbiAgICAgIGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJlbmRlciB0aGUgcG9zaXRpdmUgcGF0aCBpZiB0aGUgdmFsdWUgaXMgdHJ1dGh5IGFuZCBub3QgZW1wdHkuXG4gICAgLy8gVGhlIGBpbmNsdWRlWmVyb2Agb3B0aW9uIG1heSBiZSBzZXQgdG8gdHJlYXQgdGhlIGNvbmR0aW9uYWwgYXMgcHVyZWx5IG5vdCBlbXB0eSBiYXNlZCBvbiB0aGVcbiAgICAvLyBiZWhhdmlvciBvZiBpc0VtcHR5LiBFZmZlY3RpdmVseSB0aGlzIGRldGVybWluZXMgaWYgMCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3NpdGl2ZSBwYXRoIG9yIG5lZ2F0aXZlLlxuICAgIGlmICghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwgeyBmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZuLCBoYXNoOiBvcHRpb25zLmhhc2ggfSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFVdGlscy5pc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIG1lc3NhZ2UpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24gKG9iaiwgZmllbGQpIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialtmaWVsZF07XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDEsXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbiBsb2cobGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgKGNvbnNvbGVbbWV0aG9kXSB8fCBjb25zb2xlLmxvZykuY2FsbChjb25zb2xlLCBtZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbnZhciBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnRzLmxvZyA9IGxvZztcblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIHZhciBmcmFtZSA9IFV0aWxzLmV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKiBbYXJncywgXW9wdGlvbnMgKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lID0gdW5kZWZpbmVkLFxuICAgICAgY29sdW1uID0gdW5kZWZpbmVkO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgaWYgKGxvYykge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFeGNlcHRpb247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vKmdsb2JhbCB3aW5kb3cgKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdmFyIHJvb3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyxcbiAgICAgICRIYW5kbGViYXJzID0gcm9vdC5IYW5kbGViYXJzO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBIYW5kbGViYXJzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJvb3QuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgcm9vdC5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uO1xuXG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5leHBvcnRzLndyYXBQcm9ncmFtID0gd3JhcFByb2dyYW07XG5leHBvcnRzLnJlc29sdmVQYXJ0aWFsID0gcmVzb2x2ZVBhcnRpYWw7XG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO1xuZXhwb3J0cy5ub29wID0gbm9vcDtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxuZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgdmFyIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICBjdXJyZW50UmV2aXNpb24gPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5DT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIHZhciBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICB2YXIgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24gc3RyaWN0KG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24gbG9va3VwKGRlcHRocywgbmFtZSkge1xuICAgICAgdmFyIGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uIGxhbWJkYShjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uIGZuKGkpIHtcbiAgICAgIHJldHVybiB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbiBwcm9ncmFtKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uIGRhdGEodmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24gbWVyZ2UocGFyYW0sIGNvbW1vbikge1xuICAgICAgdmFyIG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiBwYXJhbSAhPT0gY29tbW9uKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgdmFyIGRlcHRocyA9IHVuZGVmaW5lZCxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgZGVwdGhzID0gb3B0aW9ucy5kZXB0aHMgPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IFtjb250ZXh0XTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcGxhdGVTcGVjLm1haW4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuaGVscGVycywgZW52LmhlbHBlcnMpO1xuXG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwpIHtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMucGFydGlhbHMsIGVudi5wYXJ0aWFscyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gb3B0aW9ucy5oZWxwZXJzO1xuICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uIChpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgYmxvY2sgcGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzICYmICFkZXB0aHMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgZnVuY3Rpb24gcHJvZyhjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgcmV0dXJuIGZuLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEgfHwgZGF0YSwgYmxvY2tQYXJhbXMgJiYgW29wdGlvbnMuYmxvY2tQYXJhbXNdLmNvbmNhdChibG9ja1BhcmFtcyksIGRlcHRocyAmJiBbY29udGV4dF0uY29uY2F0KGRlcHRocykpO1xuICB9XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBkZXB0aHMgPyBkZXB0aHMubGVuZ3RoIDogMDtcbiAgcHJvZy5ibG9ja1BhcmFtcyA9IGRlY2xhcmVkQmxvY2tQYXJhbXMgfHwgMDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXTtcbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5mdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLmNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJycgKyB0aGlzLnN0cmluZztcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNhZmVTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydHMuaW5kZXhPZiA9IGluZGV4T2Y7XG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO1xuZXhwb3J0cy5pc0VtcHR5ID0gaXNFbXB0eTtcbmV4cG9ydHMuYmxvY2tQYXJhbXMgPSBibG9ja1BhcmFtcztcbmV4cG9ydHMuYXBwZW5kQ29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aDtcbnZhciBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgJ1xcJyc6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2csXG4gICAgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqIC8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5leHBvcnRzLnRvU3RyaW5nID0gdG9TdHJpbmc7XG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKmVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBleHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbi8qZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtleHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENvbnRleHRQYXRoKGNvbnRleHRQYXRoLCBpZCkge1xuICByZXR1cm4gKGNvbnRleHRQYXRoID8gY29udGV4dFBhdGggKyAnLicgOiAnJykgKyBpZDtcbn0iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCIvLyBBdm9pZCBjb25zb2xlIGVycm9ycyBmb3IgdGhlIElFIGNyYXBweSBicm93c2Vyc1xuaWYgKCAhIHdpbmRvdy5jb25zb2xlICkgY29uc29sZSA9IHsgbG9nOiBmdW5jdGlvbigpe30gfTtcblxuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcCBmcm9tICdBcHAnXG5pbXBvcnQgQXBwTW9iaWxlIGZyb20gJ0FwcE1vYmlsZSdcbmltcG9ydCBUd2Vlbk1heCBmcm9tICdnc2FwJ1xuaW1wb3J0IHJhZiBmcm9tICdyYWYnXG5pbXBvcnQgTW9iaWxlRGV0ZWN0IGZyb20gJ21vYmlsZS1kZXRlY3QnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgbWQgPSBuZXcgTW9iaWxlRGV0ZWN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuXG5BcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IChtZC5tb2JpbGUoKSB8fCBtZC50YWJsZXQoKSkgPyB0cnVlIDogZmFsc2VcbkFwcFN0b3JlLlBhcmVudCA9IGRvbS5zZWxlY3QoJyNhcHAtY29udGFpbmVyJylcbkFwcFN0b3JlLkRldGVjdG9yLm9sZElFID0gZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU2JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU3JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU4JylcbkFwcFN0b3JlLkRldGVjdG9yLmlzU3VwcG9ydFdlYkdMID0gVXRpbHMuU3VwcG9ydFdlYkdMKClcbmlmKEFwcFN0b3JlLkRldGVjdG9yLm9sZElFKSBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxuLy8gRGVidWdcbi8vIEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG52YXIgYXBwO1xuaWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUpIHtcblx0ZG9tLmNsYXNzZXMuYWRkKGRvbS5zZWxlY3QoJ2h0bWwnKSwgJ21vYmlsZScpXG5cdGFwcCA9IG5ldyBBcHBNb2JpbGUoKVxufWVsc2V7XG5cdGFwcCA9IG5ldyBBcHAoKVx0XG59IFxuXG5hcHAuaW5pdCgpXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGUgZnJvbSAnQXBwVGVtcGxhdGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcbmltcG9ydCBQcmVsb2FkZXIgZnJvbSAnUHJlbG9hZGVyJ1xuXG5jbGFzcyBBcHAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm9uQXBwUmVhZHkgPSB0aGlzLm9uQXBwUmVhZHkuYmluZCh0aGlzKVxuXHRcdHRoaXMubG9hZE1haW5Bc3NldHMgPSB0aGlzLmxvYWRNYWluQXNzZXRzLmJpbmQodGhpcylcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHR0aGlzLnJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgUHJlbG9hZGVyXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZSA9IG5ldyBBcHBUZW1wbGF0ZSgpXG5cdFx0YXBwVGVtcGxhdGUuaXNSZWFkeSA9IHRoaXMubG9hZE1haW5Bc3NldHNcblx0XHRhcHBUZW1wbGF0ZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHR0aGlzLnJvdXRlci5iZWdpblJvdXRpbmcoKVxuXHR9XG5cdGxvYWRNYWluQXNzZXRzKCkge1xuXHRcdHZhciBoYXNoVXJsID0gbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMilcblx0XHR2YXIgcGFydHMgPSBoYXNoVXJsLnN1YnN0cigxKS5zcGxpdCgnLycpXG5cdFx0dmFyIG1hbmlmZXN0ID0gQXBwU3RvcmUucGFnZUFzc2V0c1RvTG9hZCgpXG5cdFx0aWYobWFuaWZlc3QubGVuZ3RoIDwgMSkgdGhpcy5vbkFwcFJlYWR5KClcblx0XHRlbHNlIEFwcFN0b3JlLlByZWxvYWRlci5sb2FkKG1hbmlmZXN0LCB0aGlzLm9uQXBwUmVhZHkpXG5cdH1cblx0b25BcHBSZWFkeSgpIHtcblx0XHRBcHBBY3Rpb25zLnBhZ2VIYXNoZXJDaGFuZ2VkKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBcbiAgICBcdFxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBBcHBUZW1wbGF0ZU1vYmlsZSBmcm9tICdBcHBUZW1wbGF0ZU1vYmlsZSdcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEdFdmVudHMgZnJvbSAnR2xvYmFsRXZlbnRzJ1xuXG5jbGFzcyBBcHBNb2JpbGUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dmFyIHJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuXHRcdHJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgZ2xvYmFsIGV2ZW50c1xuXHRcdHdpbmRvdy5HbG9iYWxFdmVudHMgPSBuZXcgR0V2ZW50cygpXG5cdFx0R2xvYmFsRXZlbnRzLmluaXQoKVxuXG5cdFx0dmFyIGFwcFRlbXBsYXRlTW9iaWxlID0gbmV3IEFwcFRlbXBsYXRlTW9iaWxlKClcblx0XHRhcHBUZW1wbGF0ZU1vYmlsZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHRyb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBNb2JpbGVcbiAgICBcdFxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBGcm9udENvbnRhaW5lciBmcm9tICdGcm9udENvbnRhaW5lcidcbmltcG9ydCBQYWdlc0NvbnRhaW5lciBmcm9tICdQYWdlc0NvbnRhaW5lcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQWENvbnRhaW5lciBmcm9tICdQWENvbnRhaW5lcidcbmltcG9ydCBUcmFuc2l0aW9uTWFwIGZyb20gJ1RyYW5zaXRpb25NYXAnXG5cbmNsYXNzIEFwcFRlbXBsYXRlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLmFuaW1hdGUgPSB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0XG5cdFx0XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lciA9IG5ldyBGcm9udENvbnRhaW5lcigpXG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lciA9IG5ldyBQYWdlc0NvbnRhaW5lcigpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQWENvbnRhaW5lcigpXG5cdFx0dGhpcy5weENvbnRhaW5lci5pbml0KCcjcGFnZXMtY29udGFpbmVyJylcblx0XHRBcHBBY3Rpb25zLnB4Q29udGFpbmVySXNSZWFkeSh0aGlzLnB4Q29udGFpbmVyKVxuXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwID0gbmV3IFRyYW5zaXRpb25NYXAoKVxuXHRcdHRoaXMudHJhbnNpdGlvbk1hcC5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5pc1JlYWR5KClcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHRcdHRoaXMuYW5pbWF0ZSgpXG5cdH1cblx0YW5pbWF0ZSgpIHtcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlKVxuXHQgICAgdGhpcy5weENvbnRhaW5lci51cGRhdGUoKVxuXHQgICAgdGhpcy5wYWdlc0NvbnRhaW5lci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5weENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnRyYW5zaXRpb25NYXAucmVzaXplKClcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEFwcFRlbXBsYXRlTW9iaWxlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZU1vYmlsZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdGNvbnNvbGUubG9nKCdtb2JpbGUgeW8nKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZU1vYmlsZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBEaXNwYXRjaGVyIGZyb20gJ0FwcERpc3BhdGNoZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmZ1bmN0aW9uIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZCkge1xuICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0FTU0VUU19MT0FERUQsXG4gICAgICAgIGl0ZW06IHBhZ2VJZFxuICAgIH0pICBcbn1cblxudmFyIEFwcEFjdGlvbnMgPSB7XG4gICAgcGFnZUhhc2hlckNoYW5nZWQ6IGZ1bmN0aW9uKHBhZ2VJZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsXG4gICAgICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGxvYWRQYWdlQXNzZXRzOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgdmFyIG1hbmlmZXN0ID0gQXBwU3RvcmUucGFnZUFzc2V0c1RvTG9hZCgpXG4gICAgICAgIGlmKG1hbmlmZXN0Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBBcHBTdG9yZS5QcmVsb2FkZXIubG9hZChtYW5pZmVzdCwgKCk9PntcbiAgICAgICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dSZXNpemU6IGZ1bmN0aW9uKHdpbmRvd1csIHdpbmRvd0gpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLFxuICAgICAgICAgICAgaXRlbTogeyB3aW5kb3dXOndpbmRvd1csIHdpbmRvd0g6d2luZG93SCB9XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBweENvbnRhaW5lcklzUmVhZHk6IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9JU19SRUFEWSxcbiAgICAgICAgICAgIGl0ZW06IGNvbXBvbmVudFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhBZGRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4UmVtb3ZlQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBvcGVuRnVuRmFjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuT1BFTl9GVU5fRkFDVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgY2xvc2VGdW5GYWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5DTE9TRV9GVU5fRkFDVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBBY3Rpb25zXG5cblxuICAgICAgXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ0Zyb250Q29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBoZWFkZXJMaW5rcyBmcm9tICdoZWFkZXItbGlua3MnXG5pbXBvcnQgc29jaWFsTGlua3MgZnJvbSAnc29jaWFsLWxpbmtzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmNsYXNzIEZyb250Q29udGFpbmVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdHRoaXMub25QYWdlQ2hhbmdlID0gdGhpcy5vblBhZ2VDaGFuZ2UuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0c2NvcGUuaW5mb3MgPSBBcHBTdG9yZS5nbG9iYWxDb250ZW50KClcblx0XHRzY29wZS5mYWNlYm9va1VybCA9IGdlbmVyYUluZm9zWydmYWNlYm9va191cmwnXVxuXHRcdHNjb3BlLnR3aXR0ZXJVcmwgPSBnZW5lcmFJbmZvc1sndHdpdHRlcl91cmwnXVxuXHRcdHNjb3BlLmluc3RhZ3JhbVVybCA9IGdlbmVyYUluZm9zWydpbnN0YWdyYW1fdXJsJ11cblx0XHRzY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cdFx0c2NvcGUubWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5KycvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXHRcdHNjb3BlLndvbWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5Kycvd29tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cblx0XHRzdXBlci5yZW5kZXIoJ0Zyb250Q29udGFpbmVyJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5vblBhZ2VDaGFuZ2UpXG5cblx0XHR0aGlzLmhlYWRlckxpbmtzID0gaGVhZGVyTGlua3ModGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuc29jaWFsTGlua3MgPSBzb2NpYWxMaW5rcyh0aGlzLmVsZW1lbnQpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cblx0fVxuXHRvblBhZ2VDaGFuZ2UoKSB7XG5cdFx0dmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0aWYoaGFzaE9iai50eXBlID09IEFwcENvbnN0YW50cy5ESVBUWVFVRSkge1xuXHRcdFx0dGhpcy5zb2NpYWxMaW5rcy5oaWRlKClcdFx0XHRcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc29jaWFsTGlua3Muc2hvdygpXG5cdFx0fVxuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblx0XHR0aGlzLnNvY2lhbExpbmtzLnJlc2l6ZSgpXG5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGcm9udENvbnRhaW5lclxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQWENvbnRhaW5lciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cdGluaXQoZWxlbWVudElkKSB7XG5cdFx0dGhpcy5jbGVhckJhY2sgPSBmYWxzZVxuXG5cdFx0dGhpcy5hZGQgPSB0aGlzLmFkZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5yZW1vdmUgPSB0aGlzLnJlbW92ZS5iaW5kKHRoaXMpXG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0FERF9DSElMRCwgdGhpcy5hZGQpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQsIHRoaXMucmVtb3ZlKVxuXG5cdFx0dmFyIHJlbmRlck9wdGlvbnMgPSB7XG5cdFx0ICAgIHJlc29sdXRpb246IDEsXG5cdFx0ICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuXHRcdCAgICBhbnRpYWxpYXM6IHRydWVcblx0XHR9O1xuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHQvLyB0aGlzLnJlbmRlcmVyID0gbmV3IFBJWEkuQ2FudmFzUmVuZGVyZXIoMSwgMSwgcmVuZGVyT3B0aW9ucylcblx0XHR0aGlzLmN1cnJlbnRDb2xvciA9IDB4ZmZmZmZmXG5cdFx0dmFyIGVsID0gZG9tLnNlbGVjdChlbGVtZW50SWQpXG5cdFx0dGhpcy5yZW5kZXJlci52aWV3LnNldEF0dHJpYnV0ZSgnaWQnLCAncHgtY29udGFpbmVyJylcblx0XHRBcHBTdG9yZS5DYW52YXMgPSB0aGlzLnJlbmRlcmVyLnZpZXdcblx0XHRkb20udHJlZS5hZGQoZWwsIHRoaXMucmVuZGVyZXIudmlldylcblx0XHR0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHQvLyB0aGlzLmJhY2tncm91bmQgPSBuZXcgUElYSS5HcmFwaGljcygpXG5cdFx0Ly8gdGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0XHQvLyB0aGlzLnN0YWdlLmFkZENoaWxkKHRoaXMuYmFja2dyb3VuZClcblxuXHRcdHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcblx0XHQvLyB0aGlzLnN0YXRzLnNldE1vZGUoIDEgKTsgLy8gMDogZnBzLCAxOiBtcywgMjogbWJcblxuXHRcdC8vIGFsaWduIHRvcC1sZWZ0XG5cdFx0dGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHR0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDk5OTk5OVxuXG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5zdGF0cy5kb21FbGVtZW50ICk7XG5cblx0fVxuXHRkcmF3QmFja2dyb3VuZChjb2xvcikge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR0aGlzLmJhY2tncm91bmQuY2xlYXIoKVxuXHRcdHRoaXMuYmFja2dyb3VuZC5saW5lU3R5bGUoMCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmJlZ2luRmlsbChjb2xvciwgMSk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDAsIHdpbmRvd1csIHdpbmRvd0gpO1xuXHRcdHRoaXMuYmFja2dyb3VuZC5lbmRGaWxsKCk7XG5cdH1cblx0YWRkKGNoaWxkKSB7XG5cdFx0dGhpcy5zdGFnZS5hZGRDaGlsZChjaGlsZClcblx0fVxuXHRyZW1vdmUoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKGNoaWxkKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHR0aGlzLnN0YXRzLnVwZGF0ZSgpXG5cdCAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnN0YWdlKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgc2NhbGUgPSAxXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLnJlbmRlcmVyLnJlc2l6ZSh3aW5kb3dXICogc2NhbGUsIHdpbmRvd0ggKiBzY2FsZSlcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZVBhZ2UgZnJvbSAnQmFzZVBhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUHhIZWxwZXIgZnJvbSAnUHhIZWxwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2UgZXh0ZW5kcyBCYXNlUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weEFkZENoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25PdXQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdGlmKHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FKSB7XG5cdFx0XHR0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRydWVcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gMFxuXHRcdH1lbHNle1xuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdFx0fVxuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHRnZXRJbWFnZVVybEJ5SWQoaWQpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUgPyAnaG9tZS0nICsgaWQgOiB0aGlzLnByb3BzLmhhc2gucGFyZW50ICsgJy0nICsgdGhpcy5wcm9wcy5oYXNoLnRhcmdldCArICctJyArIGlkXG5cdFx0cmV0dXJuIEFwcFN0b3JlLlByZWxvYWRlci5nZXRJbWFnZVVSTCh1cmwpXG5cdH1cblx0Z2V0SW1hZ2VTaXplQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlU2l6ZSh1cmwpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFB4SGVscGVyLnJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcih0aGlzLnB4Q29udGFpbmVyKVxuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weFJlbW92ZUNoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge1BhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHN9IGZyb20gJ1BhZ2VyJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEJhc2VQYWdlciBmcm9tICdCYXNlUGFnZXInXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBIb21lIGZyb20gJ0hvbWUnXG5pbXBvcnQgSG9tZVRlbXBsYXRlIGZyb20gJ0hvbWVfaGJzJ1xuaW1wb3J0IERpcHR5cXVlIGZyb20gJ0RpcHR5cXVlJ1xuaW1wb3J0IERpcHR5cXVlVGVtcGxhdGUgZnJvbSAnRGlwdHlxdWVfaGJzJ1xuXG5jbGFzcyBQYWdlc0NvbnRhaW5lciBleHRlbmRzIEJhc2VQYWdlciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLmRpZEhhc2hlckNoYW5nZSA9IHRoaXMuZGlkSGFzaGVyQ2hhbmdlLmJpbmQodGhpcylcblx0XHR0aGlzLnBhZ2VBc3NldHNMb2FkZWQgPSB0aGlzLnBhZ2VBc3NldHNMb2FkZWQuYmluZCh0aGlzKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELCB0aGlzLmRpZEhhc2hlckNoYW5nZSlcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9BU1NFVFNfTE9BREVELCB0aGlzLnBhZ2VBc3NldHNMb2FkZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdGRpZEhhc2hlckNoYW5nZSgpIHtcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdH1lbHNle1xuXHRcdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dCgpXG5cdFx0XHQvLyB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCgpXG5cdFx0fVxuXHR9XG5cdHRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpIHtcblx0XHR2YXIgdHlwZSA9IHVuZGVmaW5lZFxuXHRcdHZhciB0ZW1wbGF0ZSA9IHVuZGVmaW5lZFxuXHRcdHN3aXRjaChuZXdIYXNoLnR5cGUpIHtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkRJUFRZUVVFOlxuXHRcdFx0XHR0eXBlID0gRGlwdHlxdWVcblx0XHRcdFx0dGVtcGxhdGUgPSBEaXB0eXF1ZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5IT01FOlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHR9XG5cdFx0dGhpcy5zZXR1cE5ld0NvbXBvbmVudChuZXdIYXNoLCB0eXBlLCB0ZW1wbGF0ZSlcblx0XHR0aGlzLmN1cnJlbnRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdHN1cGVyLnBhZ2VBc3NldHNMb2FkZWQoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFnZXNDb250YWluZXJcblxuXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnVHJhbnNpdGlvbk1hcF9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcblxuY2xhc3MgVHJhbnNpdGlvbk1hcCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wcmVsb2FkZXJQcm9ncmVzcyA9IHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cblx0XHRzdXBlci5yZW5kZXIoJ1RyYW5zaXRpb25NYXAnLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLCB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdEFwcFN0b3JlLlByZWxvYWRlci5xdWV1ZS5vbihcInByb2dyZXNzXCIsIHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MsIHRoaXMpXG5cblx0XHR0aGlzLm1hcCA9IG1hcCh0aGlzLmVsZW1lbnQsIEFwcENvbnN0YW50cy5UUkFOU0lUSU9OKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAuaGlnaGxpZ2h0KFJvdXRlci5nZXRPbGRIYXNoKCksIFJvdXRlci5nZXROZXdIYXNoKCkpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLnJlc2V0SGlnaGxpZ2h0KClcblx0fVxuXHRwcmVsb2FkZXJQcm9ncmVzcyhlKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgKz0gMC4yXG5cdFx0aWYoZS5wcm9ncmVzcyA+IDAuOTkpIHRoaXMuY3VycmVudFByb2dyZXNzID0gMVxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPiAxID8gMSA6IHRoaXMuY3VycmVudFByb2dyZXNzIFxuXHRcdHRoaXMubWFwLnVwZGF0ZVByb2dyZXNzKGUucHJvZ3Jlc3MpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNpdGlvbk1hcFxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGFyb3VuZEJvcmRlciA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgJGNvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcCA9IGRvbS5zZWxlY3QoJy50b3AnLCAkY29udGFpbmVyKVxuXHR2YXIgYm90dG9tID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRjb250YWluZXIpXG5cdHZhciBsZWZ0ID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkY29udGFpbmVyKVxuXHR2YXIgcmlnaHQgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkY29udGFpbmVyKVxuXG5cdHZhciAkbGV0dGVyc0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWxldHRlcnMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy50b3AnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGJvdHRvbUxldHRlcnMgPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBsZWZ0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciByaWdodExldHRlcnMgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIGJvcmRlclNpemUgPSAxMFxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTIF1cblxuXHRcdFx0dG9wLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJvcmRlclNpemUgKyAncHgnXG5cdFx0XHRsZWZ0LnN0eWxlLmhlaWdodCA9IHJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRyaWdodC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJvcmRlclNpemUgKyAncHgnXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgdGwgPSB0b3BMZXR0ZXJzW2ldXG5cdFx0XHRcdHRsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0dGwuc3R5bGUudG9wID0gLTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBib3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBibCA9IGJvdHRvbUxldHRlcnNbaV1cblx0XHRcdFx0Ymwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gMTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGwgPSBsZWZ0TGV0dGVyc1tpXVxuXHRcdFx0XHRsbC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bGwuc3R5bGUubGVmdCA9IDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJsID0gcmlnaHRMZXR0ZXJzW2ldXG5cdFx0XHRcdHJsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRybC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIDggKyAncHgnXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dG9wTGV0dGVycyA9IG51bGxcblx0XHRcdGJvdHRvbUxldHRlcnMgPSBudWxsXG5cdFx0XHRsZWZ0TGV0dGVycyA9IG51bGxcblx0XHRcdHJpZ2h0TGV0dGVycyA9IG51bGxcblx0XHR9XG5cdH0gXG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyb3VuZEJvcmRlciIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgb25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmUpPT4ge1xuXHR2YXIgc2NvcGU7XG5cdHZhciBhcnJvd3NXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmFycm93cy13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LmxlZnQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgcmlnaHRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5yaWdodCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciBhcnJvd3MgPSB7XG5cdFx0bGVmdDoge1xuXHRcdFx0ZWw6IGxlZnRBcnJvdyxcblx0XHRcdGljb25zOiBkb20uc2VsZWN0LmFsbCgnc3ZnJywgbGVmdEFycm93KSxcblx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCBsZWZ0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCBsZWZ0QXJyb3cpXG5cdFx0fSxcblx0XHRyaWdodDoge1xuXHRcdFx0ZWw6IHJpZ2h0QXJyb3csXG5cdFx0XHRpY29uczogZG9tLnNlbGVjdC5hbGwoJ3N2ZycsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCByaWdodEFycm93KVxuXHRcdH1cblx0fVxuXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRsZWZ0OiBhcnJvd3MubGVmdC5lbCxcblx0XHRyaWdodDogYXJyb3dzLnJpZ2h0LmVsLFxuXHRcdGJhY2tncm91bmQ6IChkaXIpPT4ge1xuXHRcdFx0cmV0dXJuIGFycm93c1tkaXJdLmJhY2tncm91bmRcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIGFycm93U2l6ZSA9IGRvbS5zaXplKGFycm93cy5sZWZ0Lmljb25zWzFdKVxuXHRcdFx0dmFyIG9mZnNldFkgPSAyMFxuXHRcdFx0dmFyIGJnV2lkdGggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cblx0XHRcdGFycm93cy5yaWdodC5lbC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJnV2lkdGggKyAncHgnXG5cblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCArICdweCdcblxuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYXJyb3dTaXplWzBdID4+IDEpIC0gb2Zmc2V0WSArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IGJnV2lkdGggLSBhcnJvd1NpemVbMF0gLSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cdFx0XHRcdFxuXHRcdH0sXG5cdFx0b3ZlcjogKGRpcik9PiB7XG5cdFx0XHR2YXIgYXJyb3cgPSBhcnJvd3NbZGlyXVxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGFycm93LmVsLCAnaG92ZXJlZCcpXG5cdFx0fSxcblx0XHRvdXQ6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGFycm93cyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgYm90dG9tVGV4dHMgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBib3R0b21UZXh0c0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5ib3R0b20tdGV4dHMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEJsb2NrID0gZG9tLnNlbGVjdCgnLmxlZnQtdGV4dCcsIGJvdHRvbVRleHRzQ29udGFpbmVyKVxuXHR2YXIgcmlnaHRCbG9jayA9IGRvbS5zZWxlY3QoJy5yaWdodC10ZXh0JywgYm90dG9tVGV4dHNDb250YWluZXIpXG5cdHZhciBsZWZ0RnJvbnQgPSBkb20uc2VsZWN0KCcuZnJvbnQtd3JhcHBlcicsIGxlZnRCbG9jaylcblx0dmFyIHJpZ2h0RnJvbnQgPSBkb20uc2VsZWN0KCcuZnJvbnQtd3JhcHBlcicsIHJpZ2h0QmxvY2spXG5cblx0dmFyIHJlc2l6ZSA9ICgpPT4ge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHR2YXIgYmxvY2tTaXplID0gWyB3aW5kb3dXIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgd2luZG93SCAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMgXVxuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRsZWZ0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXG5cdFx0bGVmdEJsb2NrLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0cmlnaHRCbG9jay5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHJpZ2h0QmxvY2suc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdICogMikgKyAncHgnXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRsZWZ0RnJvbnQuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSA+PiAxKSAtIChsZWZ0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpIC0gKHJpZ2h0RnJvbnQuY2xpZW50SGVpZ2h0ID4+IDEpICsgJ3B4J1xuXHRcdFx0cmlnaHRGcm9udC5zdHlsZS5sZWZ0ID0gKChibG9ja1NpemVbMF0gPDwgMSkgPj4gMSkgLSAocmlnaHRGcm9udC5jbGllbnRXaWR0aCA+PiAxKSArICdweCdcblx0XHR9KVxuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6IHJlc2l6ZVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJvdHRvbVRleHRzIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBjaGFyYWN0ZXJVcmwsIHRleHR1cmVTaXplKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoY2hhcmFjdGVyVXJsKVxuXHR2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleClcblx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdGhvbGRlci5hZGRDaGlsZChzcHJpdGUpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggKyAoMTAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5ICsgKDEwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDNcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wM1xuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dIIC0gMTAwKSAvIHRleHR1cmVTaXplLmhlaWdodCkgKiAxXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKHNwcml0ZSlcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRzcHJpdGUgPSBudWxsXG5cdFx0XHR0ZXggPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgY29sb3JzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgYmdDb2xvcnMgPSBbXVxuXHRiZ0NvbG9ycy5sZW5ndGggPSA1XG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBiZ0NvbG9yID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdGJnQ29sb3JzW2ldID0gYmdDb2xvclxuXHRcdGhvbGRlci5hZGRDaGlsZChiZ0NvbG9yKVxuXHR9O1xuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDEuNSlcblx0XHR0bC5wbGF5KDApXG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgyKVxuXHRcdHRsLnJldmVyc2UoKVxuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHR0bDogdGwsXG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICh3aWR0aCwgaGVpZ2h0LCBkaXJlY3Rpb24pPT57XG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGhzID0gY29sb3JzLmZyb20uaCAtIGNvbG9ycy50by5oXG5cdFx0XHR2YXIgc3MgPSBjb2xvcnMuZnJvbS5zIC0gY29sb3JzLnRvLnNcblx0XHRcdHZhciB2cyA9IGNvbG9ycy5mcm9tLnYgLSBjb2xvcnMudG8udlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBIID0gaHMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwUyA9IHNzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFYgPSB2cyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIGhkID0gKGhzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciBzZCA9IChzcyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgdmQgPSAodnMgPCAwKSA/IC0xIDogMVxuXG5cdFx0XHR2YXIgZGVsYXkgPSAwLjEyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0dmFyIGggPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLmggKyAoc3RlcEgqaSpoZCkpXG5cdFx0XHRcdHZhciBzID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5zICsgKHN0ZXBTKmkqc2QpKVxuXHRcdFx0XHR2YXIgdiA9IE1hdGgucm91bmQoY29sb3JzLmZyb20udiArIChzdGVwVippKnZkKSlcblx0XHRcdFx0dmFyIGMgPSAnMHgnICsgY29sb3JVdGlscy5oc3ZUb0hleChoLCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5UT1A6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6aGVpZ2h0IH0sIHsgeTotaGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkJPVFRPTTpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotaGVpZ2h0IH0sIHsgeTpoZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuTEVGVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDp3aWR0aCB9LCB7IHg6LXdpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlJJR0hUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4Oi13aWR0aCB9LCB7IHg6d2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9O1xuXG5cdFx0XHR0bC5wYXVzZSgwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGwuY2xlYXIoKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoYmdDb2xvcilcblx0XHRcdFx0YmdDb2xvciA9IG51bGxcblx0XHRcdH07XG5cdFx0XHRiZ0NvbG9ycyA9IG51bGxcblx0XHRcdHRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgYmdVcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIGJnVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoYmdVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoYmdUZXh0dXJlKVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRiZ1Nwcml0ZTogc3ByaXRlLFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCAtICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wMDhcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wMDhcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHNpemVbMF0sIHNpemVbMV0sIDk2MCwgMTAyNClcblxuXHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSA+PiAxXG5cdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gcmVzaXplVmFycy5zY2FsZSArIDAuMVxuXHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yeVJlY3RzIGZyb20gJ2NvbG9yeS1yZWN0cydcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBwYXJlbnQsIG1vdXNlLCBkYXRhKT0+IHtcblx0dmFyIHNjb3BlO1xuXHR2YXIgaXNSZWFkeSA9IGZhbHNlXG5cdHZhciBvbkNsb3NlVGltZW91dDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmZ1bi1mYWN0LXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciB2aWRlb1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudmlkZW8td3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZVdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS13cmFwcGVyJywgZWwpXG5cdHZhciBtZXNzYWdlSW5uZXIgPSBkb20uc2VsZWN0KCcubWVzc2FnZS1pbm5lcicsIG1lc3NhZ2VXcmFwcGVyKVxuXG5cdHZhciBzcGxpdHRlciA9IG5ldyBTcGxpdFRleHQobWVzc2FnZUlubmVyLCB7dHlwZTpcIndvcmRzXCJ9KVxuXG5cdHZhciBjID0gZG9tLnNlbGVjdCgnLmN1cnNvci1jcm9zcycsIGVsKVxuXHR2YXIgY3Jvc3MgPSB7XG5cdFx0eDogMCxcblx0XHR5OiAwLFxuXHRcdGVsOiBjLFxuXHRcdHNpemU6IGRvbS5zaXplKGMpXG5cdH1cblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBsZWZ0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblx0dmFyIHJpZ2h0UmVjdHMgPSBjb2xvcnlSZWN0cyhob2xkZXIsIGRhdGFbJ2FtYmllbnQtY29sb3InXSlcblxuXHR2YXIgbUJnQ29sb3IgPSBkYXRhWydhbWJpZW50LWNvbG9yJ10udG9cblx0bWVzc2FnZVdyYXBwZXIuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMnICsgY29sb3JVdGlscy5oc3ZUb0hleChtQmdDb2xvci5oLCBtQmdDb2xvci5zLCBtQmdDb2xvci52KVxuXG5cdHZhciBsZWZ0VGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR2YXIgcmlnaHRUbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdGxvb3A6IHRydWVcblx0fSlcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnZnVuLWZhY3QtdmlkZW8tdXJsJ11cblx0bVZpZGVvLmFkZFRvKHZpZGVvV3JhcHBlcilcblx0bVZpZGVvLmxvYWQodmlkZW9TcmMsICgpPT4ge1xuXHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0c2NvcGUucmVzaXplKClcblx0fSlcblxuXHR2YXIgb25DbG9zZUZ1bkZhY3QgPSAoKT0+IHtcblx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRzY29wZS5jbG9zZSgpXG5cdH1cblxuXHR2YXIgb3BlbiA9ICgpPT4ge1xuXHRcdHNjb3BlLmlzT3BlbiA9IHRydWVcblx0XHRsZWZ0UmVjdHMub3BlbigpXG5cdFx0cmlnaHRSZWN0cy5vcGVuKClcblx0XHR2YXIgZGVsYXkgPSAzNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDEuNSkucGxheSgwKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5tVmlkZW8ucGxheSgpLCBkZWxheSsyMDApXG5cdFx0Y2xlYXJUaW1lb3V0KG9uQ2xvc2VUaW1lb3V0KVxuXHRcdG9uQ2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKT0+ZG9tLmV2ZW50Lm9uKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpLCBkZWxheSsyMDApXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdub25lJ1xuXHRcdGRvbS5jbGFzc2VzLmFkZChjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdH1cblx0dmFyIGNsb3NlID0gKCk9PiB7XG5cdFx0c2NvcGUuaXNPcGVuID0gZmFsc2Vcblx0XHRsZWZ0UmVjdHMuY2xvc2UoKVxuXHRcdHJpZ2h0UmVjdHMuY2xvc2UoKVxuXHRcdHZhciBkZWxheSA9IDUwXG5cdFx0c2V0VGltZW91dCgoKT0+bGVmdFRsLnRpbWVTY2FsZSgyKS5yZXZlcnNlKCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9PnJpZ2h0VGwudGltZVNjYWxlKDIpLnJldmVyc2UoKSwgZGVsYXkpXG5cdFx0cGFyZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuXHRcdGRvbS5ldmVudC5vZmYocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdClcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICgpPT57XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0XHR2YXIgbWlkV2luZG93VyA9ICh3aW5kb3dXID4+IDEpXG5cblx0XHRcdHZhciBzaXplID0gW21pZFdpbmRvd1cgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRsZWZ0UmVjdHMucmVzaXplKHNpemVbMF0sIHNpemVbMV0sIEFwcENvbnN0YW50cy5UT1ApXG5cdFx0XHRyaWdodFJlY3RzLnJlc2l6ZShzaXplWzBdLCBzaXplWzFdLCBBcHBDb25zdGFudHMuQk9UVE9NKVxuXHRcdFx0cmlnaHRSZWN0cy5ob2xkZXIueCA9IHdpbmRvd1cgLyAyXG5cdFx0XHRcdFxuXHRcdFx0Ly8gaWYgdmlkZW8gaXNuJ3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHZhciB2aWRlb1dyYXBwZXJSZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShtaWRXaW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cgPj4gMSwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9IKVxuXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUud2lkdGggPSBtZXNzYWdlV3JhcHBlci5zdHlsZS53aWR0aCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdHZpZGVvV3JhcHBlci5zdHlsZS5sZWZ0ID0gbWlkV2luZG93VyArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS53aWR0aCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUuaGVpZ2h0ID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUudG9wID0gdmlkZW9XcmFwcGVyUmVzaXplVmFycy50b3AgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUubGVmdCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMubGVmdCArICdweCdcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIG1lc3NhZ2VJbm5lclNpemUgPSBkb20uc2l6ZShtZXNzYWdlSW5uZXIpXG5cdFx0XHRcdG1lc3NhZ2VJbm5lci5zdHlsZS5sZWZ0ID0gKG1pZFdpbmRvd1cgPj4gMSkgLSAobWVzc2FnZUlubmVyU2l6ZVswXSA+PiAxKSArICdweCdcblx0XHRcdFx0bWVzc2FnZUlubmVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHR9LCAwKVxuXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT4ge1xuXHRcdFx0XHRsZWZ0VGwuY2xlYXIoKVxuXHRcdFx0XHRyaWdodFRsLmNsZWFyKClcblxuXHRcdFx0XHRsZWZ0VGwuZnJvbVRvKG1lc3NhZ2VXcmFwcGVyLCAxLjQsIHsgeTp3aW5kb3dILCBzY2FsZVk6MywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnIH0sIHsgeTowLCBzY2FsZVk6MSwgdHJhbnNmb3JtT3JpZ2luOic1MCUgMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHRcdFx0bGVmdFRsLnN0YWdnZXJGcm9tKHNwbGl0dGVyLndvcmRzLCAxLCB7IHk6MTQwMCwgc2NhbGVZOjYsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC4wNiwgMC4yKVxuXHRcdFx0XHRyaWdodFRsLmZyb21Ubyh2aWRlb1dyYXBwZXIsIDEuNCwgeyB5Oi13aW5kb3dIKjIsIHNjYWxlWTozLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblxuXHRcdFx0XHRsZWZ0VGwucGF1c2UoMClcblx0XHRcdFx0cmlnaHRUbC5wYXVzZSgwKVxuXHRcdFx0XHRtZXNzYWdlV3JhcHBlci5zdHlsZS5vcGFjaXR5ID0gMVxuXHRcdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdH0sIDUpXG5cblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cdFx0XHRpZighc2NvcGUuaXNPcGVuKSByZXR1cm5cblx0XHRcdHZhciBuZXd4ID0gbW91c2UueCAtIChjcm9zcy5zaXplWzBdID4+IDEpXG5cdFx0XHR2YXIgbmV3eSA9IG1vdXNlLnkgLSAoY3Jvc3Muc2l6ZVsxXSA+PiAxKVxuXHRcdFx0Y3Jvc3MueCArPSAobmV3eCAtIGNyb3NzLngpICogMC41XG5cdFx0XHRjcm9zcy55ICs9IChuZXd5IC0gY3Jvc3MueSkgKiAwLjVcblx0XHRcdFV0aWxzLlRyYW5zbGF0ZShjcm9zcy5lbCwgY3Jvc3MueCwgY3Jvc3MueSwgMSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGxlZnRSZWN0cy5jbGVhcigpXG5cdFx0XHRsZWZ0UmVjdHMgPSBudWxsXG5cdFx0XHRyaWdodFJlY3RzLmNsZWFyKClcblx0XHRcdHJpZ2h0UmVjdHMgPSBudWxsXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCB2aWRlb0NhbnZhcyBmcm9tICd2aWRlby1jYW52YXMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgZ3JpZFBvc2l0aW9ucyBmcm9tICdncmlkLXBvc2l0aW9ucydcbmltcG9ydCBtZWRpYUNlbGwgZnJvbSAnbWVkaWEtY2VsbCdcblxudmFyIGdyaWQgPSAocHJvcHMsIHBhcmVudCwgb25JdGVtRW5kZWQpPT4ge1xuXG5cdHZhciB2aWRlb0VuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBpbWFnZUVuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBncmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdChcIi5ncmlkLWNvbnRhaW5lclwiLCBwYXJlbnQpXG5cdHZhciBsaW5lc0dyaWRDb250YWluZXIgPSBkb20uc2VsZWN0KCcubGluZXMtZ3JpZC1jb250YWluZXInLCBwYXJlbnQpXG5cdHZhciBncmlkQ2hpbGRyZW4gPSBncmlkQ29udGFpbmVyLmNoaWxkcmVuXG5cdHZhciBsaW5lc0hvcml6b250YWwgPSBkb20uc2VsZWN0KFwiLmxpbmVzLWdyaWQtY29udGFpbmVyIC5ob3Jpem9udGFsLWxpbmVzXCIsIHBhcmVudCkuY2hpbGRyZW5cblx0dmFyIGxpbmVzVmVydGljYWwgPSBkb20uc2VsZWN0KFwiLmxpbmVzLWdyaWQtY29udGFpbmVyIC52ZXJ0aWNhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBzY29wZTtcblx0dmFyIGN1cnJlbnRTZWF0O1xuXHR2YXIgY2VsbHMgPSBbXVxuXHR2YXIgdG90YWxOdW0gPSBwcm9wcy5kYXRhLmdyaWQubGVuZ3RoXG5cdHZhciB2aWRlb3MgPSBBcHBTdG9yZS5nZXRIb21lVmlkZW9zKClcblxuXHR2YXIgc2VhdHMgPSBbXG5cdFx0MSwgMywgNSxcblx0XHQ3LCA5LCAxMSxcblx0XHQxNSwgMTcsXG5cdFx0MjEsIDIzLCAyNVxuXHRdXG5cblx0dmFyIHZDYW52YXNQcm9wcyA9IHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0dm9sdW1lOiAwLFxuXHRcdGxvb3A6IGZhbHNlLFxuXHRcdG9uRW5kZWQ6IHZpZGVvRW5kZWRcblx0fVxuXG5cdHZhciBtQ2VsbDtcblx0dmFyIGNvdW50ZXIgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTnVtOyBpKyspIHtcblx0XHR2YXIgdlBhcmVudCA9IGdyaWRDaGlsZHJlbltpXVxuXHRcdGNlbGxzW2ldID0gdW5kZWZpbmVkXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzZWF0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYoaSA9PSBzZWF0c1tqXSkge1xuXHRcdFx0XHRtQ2VsbCA9IG1lZGlhQ2VsbCh2UGFyZW50LCB2aWRlb3NbY291bnRlcl0pXG5cdFx0XHRcdGNlbGxzW2ldID0gbUNlbGxcblx0XHRcdFx0Y291bnRlcisrXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dmFyIHJlc2l6ZSA9IChnR3JpZCk9PiB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHZhciBvcmlnaW5hbFZpZGVvU2l6ZSA9IEFwcENvbnN0YW50cy5IT01FX1ZJREVPX1NJWkVcblx0XHR2YXIgYmxvY2tTaXplID0gZ0dyaWQuYmxvY2tTaXplXG5cblx0XHRsaW5lc0dyaWRDb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cblx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0sIG9yaWdpbmFsVmlkZW9TaXplWzBdLCBvcmlnaW5hbFZpZGVvU2l6ZVsxXSlcblx0XHRcblx0XHR2YXIgZ1BvcyA9IGdHcmlkLnBvc2l0aW9uc1xuXHRcdHZhciBwYXJlbnQsIGNlbGw7XG5cdFx0dmFyIGNvdW50ID0gMFxuXHRcdHZhciBobCwgdmw7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBnUG9zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcm93ID0gZ1Bvc1tpXVxuXG5cdFx0XHQvLyBob3Jpem9udGFsIGxpbmVzXG5cdFx0XHRpZihpID4gMCkge1xuXHRcdFx0XHRobCA9IHNjb3BlLmxpbmVzLmhvcml6b250YWxbaS0xXVxuXHRcdFx0XHRobC5zdHlsZS50b3AgPSBibG9ja1NpemVbMV0gKiBpICsgJ3B4J1xuXHRcdFx0XHRobC5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHR9XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyB2ZXJ0aWNhbCBsaW5lc1xuXHRcdFx0XHRpZihpID09IDAgJiYgaiA+IDApIHtcblx0XHRcdFx0XHR2bCA9IHNjb3BlLmxpbmVzLnZlcnRpY2FsW2otMV1cblx0XHRcdFx0XHR2bC5zdHlsZS5sZWZ0ID0gYmxvY2tTaXplWzBdICogaiArICdweCdcblx0XHRcdFx0XHR2bC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2VsbCA9IHNjb3BlLmNlbGxzW2NvdW50XVxuXHRcdFx0XHRpZihjZWxsICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNlbGwucmVzaXplKGJsb2NrU2l6ZSwgcm93W2pdLCByZXNpemVWYXJzKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y291bnQrK1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0ZWw6IGdyaWRDb250YWluZXIsXG5cdFx0Y2hpbGRyZW46IGdyaWRDaGlsZHJlbixcblx0XHRjZWxsczogY2VsbHMsXG5cdFx0bnVtOiB0b3RhbE51bSxcblx0XHRwb3NpdGlvbnM6IFtdLFxuXHRcdGxpbmVzOiB7XG5cdFx0XHRob3Jpem9udGFsOiBsaW5lc0hvcml6b250YWwsXG5cdFx0XHR2ZXJ0aWNhbDogbGluZXNWZXJ0aWNhbFxuXHRcdH0sXG5cdFx0cmVzaXplOiByZXNpemUsXG5cdFx0aW5pdDogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGNlbGxzW2ldICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNlbGxzW2ldLmluaXQoKVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbkluSXRlbTogKGluZGV4LCB0eXBlKT0+IHtcblx0XHRcdC8vIHZhciBpdGVtID0gc2NvcGUuY2VsbHNbaW5kZXhdXG5cdFx0XHQvLyBpdGVtLnNlYXQgPSBpbmRleFxuXG5cdFx0XHQvLyBpdGVtLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdlbmFibGUnKVxuXHRcdFx0XG5cdFx0XHQvLyBpZih0eXBlID09IEFwcENvbnN0YW50cy5JVEVNX1ZJREVPKSB7XG5cdFx0XHQvLyBcdGl0ZW0ucGxheSgpXG5cdFx0XHQvLyB9ZWxzZXtcblx0XHRcdC8vIFx0aXRlbS50aW1lb3V0KGltYWdlRW5kZWQsIDIwMDApXG5cdFx0XHQvLyBcdGl0ZW0uc2VlayhVdGlscy5SYW5kKDIsIDEwLCAwKSlcblx0XHRcdC8vIH1cblx0XHR9LFxuXHRcdHRyYW5zaXRpb25PdXRJdGVtOiAoaXRlbSk9PiB7XG5cdFx0XHQvLyBpdGVtLmNhbnZhcy5jbGFzc0xpc3QucmVtb3ZlKCdlbmFibGUnKVxuXG5cdFx0XHQvLyBpdGVtLnZpZGVvLmN1cnJlbnRUaW1lKDApXG5cdFx0XHQvLyBpdGVtLnBhdXNlKClcblx0XHRcdC8vIHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdC8vIFx0aXRlbS5kcmF3T25jZSgpXG5cdFx0XHQvLyB9LCA1MDApXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGNlbGxzW2ldICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNlbGxzW2ldLmNsZWFyKClcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gXG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGdyaWQiLCIvKlxuXHR3aWR0aDogXHRcdHdpZHRoIG9mIGdyaWRcblx0aGVpZ2h0OiBcdGhlaWdodCBvZiBncmlkXG5cdGNvbHVtbnM6IFx0bnVtYmVyIG9mIGNvbHVtbnNcblx0cm93czogXHRcdG51bWJlciBvZiByb3dzXG5cdHR5cGU6IFx0XHR0eXBlIG9mIHRoZSBhcnJheVxuXHRcdFx0XHRsaW5lYXIgLSB3aWxsIGdpdmUgYWxsIHRoZSBjb2xzIGFuZCByb3dzIHBvc2l0aW9uIHRvZ2V0aGVyIG9uZSBhZnRlciB0aGUgb3RoZXJcblx0XHRcdFx0Y29sc19yb3dzIC0gd2lsbCBnaXZlIHNlcGFyYXRlIHJvd3MgYXJyYXlzIHdpdGggdGhlIGNvbHMgaW5zaWRlIFx0cm93WyBbY29sXSwgW2NvbF0sIFtjb2xdLCBbY29sXSBdXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyb3dbIFtjb2xdLCBbY29sXSwgW2NvbF0sIFtjb2xdIF1cbiovXG5cbmV4cG9ydCBkZWZhdWx0ICh3aWR0aCwgaGVpZ2h0LCBjb2x1bW5zLCByb3dzLCB0eXBlKT0+IHtcblxuXHR2YXIgdCA9IHR5cGUgfHwgJ2xpbmVhcidcblx0dmFyIGJsb2NrU2l6ZSA9IFsgd2lkdGggLyBjb2x1bW5zLCBoZWlnaHQgLyByb3dzIF1cblx0dmFyIGJsb2Nrc0xlbiA9IHJvd3MgKiBjb2x1bW5zXG5cdHZhciBwb3NpdGlvbnMgPSBbXVxuXHRcblx0dmFyIHBvc1ggPSAwXG5cdHZhciBwb3NZID0gMFxuXHR2YXIgY29sdW1uQ291bnRlciA9IDBcblx0dmFyIHJvd3NDb3VudGVyID0gMFxuXHR2YXIgcnIgPSBbXVxuXG5cdHN3aXRjaCh0KSB7XG5cdFx0Y2FzZSAnbGluZWFyJzogXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrc0xlbjsgaSsrKSB7XG5cdFx0XHRcdGlmKGNvbHVtbkNvdW50ZXIgPj0gY29sdW1ucykge1xuXHRcdFx0XHRcdHBvc1ggPSAwXG5cdFx0XHRcdFx0cG9zWSArPSBibG9ja1NpemVbMV1cblx0XHRcdFx0XHRjb2x1bW5Db3VudGVyID0gMFxuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBiID0gW3Bvc1gsIHBvc1ldXG5cdFx0XHRcdHBvc1ggKz0gYmxvY2tTaXplWzBdXG5cdFx0XHRcdGNvbHVtbkNvdW50ZXIgKz0gMVxuXHRcdFx0XHRwb3NpdGlvbnNbaV0gPSBiXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWtcblx0XHRjYXNlICdjb2xzX3Jvd3MnOiBcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzTGVuOyBpKyspIHtcblx0XHRcdFx0dmFyIGIgPSBbcG9zWCwgcG9zWV1cblx0XHRcdFx0cnIucHVzaChiKVxuXHRcdFx0XHRwb3NYICs9IGJsb2NrU2l6ZVswXVxuXHRcdFx0XHRjb2x1bW5Db3VudGVyICs9IDFcblx0XHRcdFx0aWYoY29sdW1uQ291bnRlciA+PSBjb2x1bW5zKSB7XG5cdFx0XHRcdFx0cG9zWCA9IDBcblx0XHRcdFx0XHRwb3NZICs9IGJsb2NrU2l6ZVsxXVxuXHRcdFx0XHRcdGNvbHVtbkNvdW50ZXIgPSAwXG5cdFx0XHRcdFx0cG9zaXRpb25zW3Jvd3NDb3VudGVyXSA9IHJyXG5cdFx0XHRcdFx0cnIgPSBbXVxuXHRcdFx0XHRcdHJvd3NDb3VudGVyKytcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGJyZWFrXG5cdH1cblxuXG5cdHJldHVybiB7XG5cdFx0cm93czogcm93cyxcblx0XHRjb2x1bW5zOiBjb2x1bW5zLFxuXHRcdGJsb2NrU2l6ZTogYmxvY2tTaXplLFxuXHRcdHBvc2l0aW9uczogcG9zaXRpb25zXG5cdH1cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbnZhciBoZWFkZXJMaW5rcyA9IChwYXJlbnQpPT4ge1xuXHR2YXIgc2NvcGU7XG5cblx0dmFyIG9uU3ViTWVudU1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGUuY3VycmVudFRhcmdldCwgJ2hvdmVyZWQnKVxuXHR9XG5cdHZhciBvblN1Yk1lbnVNb3VzZUxlYXZlID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShlLmN1cnJlbnRUYXJnZXQsICdob3ZlcmVkJylcblx0fVxuXG5cdHZhciBjYW1wZXJMYWJFbCA9IGRvbS5zZWxlY3QoJy5jYW1wZXItbGFiJywgcGFyZW50KVxuXHR2YXIgc2hvcEVsID0gZG9tLnNlbGVjdCgnLnNob3Atd3JhcHBlcicsIHBhcmVudClcblx0dmFyIG1hcEVsID0gZG9tLnNlbGVjdCgnLm1hcC1idG4nLCBwYXJlbnQpXG5cblx0c2hvcEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvblN1Yk1lbnVNb3VzZUVudGVyKVxuXHRzaG9wRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uU3ViTWVudU1vdXNlTGVhdmUpXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBwYWRkaW5nID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EIC8gM1xuXG5cdFx0XHR2YXIgY2FtcGVyTGFiQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiB3aW5kb3dXIC0gKEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCAqIDAuNikgLSBwYWRkaW5nIC0gZG9tLnNpemUoY2FtcGVyTGFiRWwpWzBdLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBzaG9wQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBjYW1wZXJMYWJDc3MubGVmdCAtIGRvbS5zaXplKHNob3BFbClbMF0gLSBwYWRkaW5nLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBtYXBDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHNob3BDc3MubGVmdCAtIGRvbS5zaXplKG1hcEVsKVswXSAtIHBhZGRpbmcsXG5cdFx0XHRcdHRvcDogQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5ELFxuXHRcdFx0fVxuXG5cdFx0XHRjYW1wZXJMYWJFbC5zdHlsZS5sZWZ0ID0gY2FtcGVyTGFiQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRjYW1wZXJMYWJFbC5zdHlsZS50b3AgPSBjYW1wZXJMYWJDc3MudG9wICsgJ3B4J1xuXHRcdFx0c2hvcEVsLnN0eWxlLmxlZnQgPSBzaG9wQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRzaG9wRWwuc3R5bGUudG9wID0gc2hvcENzcy50b3AgKyAncHgnXG5cdFx0XHRtYXBFbC5zdHlsZS5sZWZ0ID0gbWFwQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHRtYXBFbC5zdHlsZS50b3AgPSBtYXBDc3MudG9wICsgJ3B4J1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBoZWFkZXJMaW5rcyIsImltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5ncmlkLWJhY2tncm91bmQtY29udGFpbmVyJywgY29udGFpbmVyKVxuXHQvLyB2YXIgY2FudmFzZXMgPSBlbC5jaGlsZHJlblxuXHQvLyB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdC8vIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0dmFyIG9uSW1nTG9hZGVkQ2FsbGJhY2s7XG5cdHZhciBncmlkO1xuXHR2YXIgaW1hZ2U7XG5cdHZhciBpc1JlYWR5ID0gZmFsc2VcblxuXHQvLyB2YXIgaXRlbXMgPSBbXVxuXHQvLyBmb3IgKHZhciBpID0gMDsgaSA8IGNhbnZhc2VzLmxlbmd0aDsgaSsrKSB7XG5cdC8vIFx0dmFyIHRtcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIFxuXHQvLyBcdGl0ZW1zW2ldID0ge1xuXHQvLyBcdFx0Y2FudmFzOiBjYW52YXNlc1tpXSxcblx0Ly8gXHRcdGN0eDogY2FudmFzZXNbaV0uZ2V0Q29udGV4dCgnMmQnKSxcblx0Ly8gXHRcdHRtcENhbnZhczogdG1wQ2FudmFzLFxuXHQvLyBcdFx0dG1wQ29udGV4dDogdG1wQ2FudmFzLmdldENvbnRleHQoJzJkJylcblx0Ly8gXHR9XG5cdC8vIH1cblxuXHR2YXIgb25JbWdSZWFkeSA9IChlcnJvciwgaSk9PiB7XG5cdFx0aW1hZ2UgPSBpXG5cdFx0ZG9tLnRyZWUuYWRkKGVsLCBpbWFnZSlcblx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdHNjb3BlLnJlc2l6ZShncmlkKVxuXHRcdGlmKG9uSW1nTG9hZGVkQ2FsbGJhY2spIG9uSW1nTG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoZ0dyaWQpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHRncmlkID0gZ0dyaWRcblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblx0XHRcdGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdFx0aW1hZ2Uuc3R5bGUud2lkdGggPSByZXNpemVWYXJzQmcud2lkdGggKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzQmcuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUudG9wID0gcmVzaXplVmFyc0JnLnRvcCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzQmcubGVmdCArICdweCdcblxuXHRcdFx0Ly8gdmFyIGJsb2NrU2l6ZSA9IGdHcmlkLmJsb2NrU2l6ZVxuXHRcdFx0Ly8gdmFyIGltYWdlQmxvY2tTaXplID0gWyByZXNpemVWYXJzQmcud2lkdGggLyBnR3JpZC5jb2x1bW5zLCByZXNpemVWYXJzQmcuaGVpZ2h0IC8gZ0dyaWQucm93cyBdXG5cdFx0XHQvLyB2YXIgZ1BvcyA9IGdHcmlkLnBvc2l0aW9uc1xuXHRcdFx0Ly8gdmFyIGNvdW50ID0gMFxuXHRcdFx0Ly8gdmFyIGNhbnZhcywgY3R4LCB0bXBDb250ZXh0LCB0bXBDYW52YXM7XG5cblx0XHRcdC8vIGZvciAodmFyIGkgPSAwOyBpIDwgZ1Bvcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly8gXHR2YXIgcm93ID0gZ1Bvc1tpXVxuXG5cdFx0XHQvLyBcdGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHQvLyBcdFx0Y2FudmFzID0gaXRlbXNbY291bnRdLmNhbnZhc1xuXHRcdFx0Ly8gXHRcdGN0eCA9IGl0ZW1zW2NvdW50XS5jdHhcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0ID0gaXRlbXNbY291bnRdLnRtcENvbnRleHRcblx0XHRcdC8vIFx0XHR0bXBDYW52YXMgPSBpdGVtc1tjb3VudF0udG1wQ2FudmFzXG5cblx0XHRcdC8vIFx0XHQvLyBibG9jayBkaXZzXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLmxlZnQgPSByb3dbal1bMF0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLnRvcCA9IHJvd1tqXVsxXSArICdweCdcblxuXHRcdFx0Ly8gXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5zYXZlKClcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgaW1hZ2VCbG9ja1NpemVbMF0qaiwgaW1hZ2VCbG9ja1NpemVbMV0qaSwgaW1hZ2VCbG9ja1NpemVbMF0sIGltYWdlQmxvY2tTaXplWzFdLCAwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQucmVzdG9yZSgpXG5cdFx0XHQvLyBcdFx0Y3R4LmRyYXdJbWFnZSh0bXBDYW52YXMsIDAsIDApXG5cblx0XHRcdC8vIFx0XHRjb3VudCsrXG5cdFx0XHQvLyBcdH1cblx0XHRcdC8vIH1cblx0XHR9LFxuXHRcdGxvYWQ6ICh1cmwsIGNiKT0+IHtcblx0XHRcdG9uSW1nTG9hZGVkQ2FsbGJhY2sgPSBjYlxuXHRcdFx0aW1nKHVybCwgb25JbWdSZWFkeSlcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGVsID0gbnVsbFxuXHRcdFx0aW1hZ2UgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGltZyBmcm9tICdpbWcnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIGRhdGEsIG1vdXNlLCBvbk1vdXNlRXZlbnRzSGFuZGxlcik9PiB7XG5cblx0dmFyIGFuaW1QYXJhbXMgPSAocGFyZW50LCBlbCwgaW1nV3JhcHBlcik9PiB7XG5cdFx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHR0bC5mcm9tVG8oaW1nV3JhcHBlciwgMSwge3NjYWxlWDoxLjcsIHNjYWxlWToxLjMsIHJvdGF0aW9uOicyZGVnJywgeTotMjAsIG9wYWNpdHk6MCwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSB9LCB7IHNjYWxlWDoxLCBzY2FsZVk6MSwgcm90YXRpb246JzBkZWcnLCB5OjAsIG9wYWNpdHk6MSwgdHJhbnNmb3JtT3JpZ2luOiAnNTAlIDUwJScsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpCYWNrLmVhc2VJbk91dH0sIDApXG5cdFx0dGwucGF1c2UoMClcblx0XHRyZXR1cm4ge1xuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHRpbWdXcmFwcGVyOiBpbWdXcmFwcGVyLFxuXHRcdFx0dGw6IHRsLFxuXHRcdFx0ZWw6IGVsLFxuXHRcdFx0dGltZTogMCxcblx0XHRcdHBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdGlwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIGZzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gaXNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdFx0Ly8gdmVsb2NpdHlTY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0cm90YXRpb246IDAsXG5cdFx0XHRjb25maWc6IHtcblx0XHRcdFx0bGVuZ3RoOiAwLFxuXHRcdFx0XHRzcHJpbmc6IDAuOCxcblx0XHRcdFx0ZnJpY3Rpb246IDAuNFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1haW4tYnRucy13cmFwcGVyJywgY29udGFpbmVyKVxuXHR2YXIgc2hvcEJ0biA9IGRvbS5zZWxlY3QoJyNzaG9wLWJ0bicsIGVsKVxuXHR2YXIgZnVuQnRuID0gZG9tLnNlbGVjdCgnI2Z1bi1mYWN0LWJ0bicsIGVsKVxuXHR2YXIgc2hvcEltZ1dyYXBwZXIgID0gZG9tLnNlbGVjdCgnLmltZy13cmFwcGVyJywgc2hvcEJ0bilcblx0dmFyIGZ1bkltZ1dyYXBwZXIgPSBkb20uc2VsZWN0KCcuaW1nLXdyYXBwZXInLCBmdW5CdG4pXG5cdHZhciBzaG9wU2l6ZSwgZnVuU2l6ZTtcblx0dmFyIGxvYWRDb3VudGVyID0gMFxuXHR2YXIgYnV0dG9uU2l6ZSA9IFswLCAwXVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgdHJhbnNsYXRlID0gVXRpbHMuVHJhbnNsYXRlXG5cdHZhciBzaG9wQW5pbSwgZnVuQW5pbSwgY3VycmVudEFuaW07XG5cdHZhciBidXR0b25zID0ge1xuXHRcdCdzaG9wLWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH0sXG5cdFx0J2Z1bi1mYWN0LWJ0bic6IHtcblx0XHRcdGFuaW06IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXG5cdHZhciBzaG9wSW1nID0gaW1nKCdpbWFnZS9zaG9wLnBuZycsICgpPT4ge1xuXHRcdHNob3BBbmltID0gYW5pbVBhcmFtcyhzaG9wQnRuLCBzaG9wSW1nLCBzaG9wSW1nV3JhcHBlcilcblx0XHRidXR0b25zWydzaG9wLWJ0biddLmFuaW0gPSBzaG9wQW5pbVxuXHRcdHNob3BTaXplID0gW3Nob3BJbWcud2lkdGgsIHNob3BJbWcuaGVpZ2h0XVxuXHRcdGRvbS50cmVlLmFkZChzaG9wSW1nV3JhcHBlciwgc2hvcEltZylcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXHR2YXIgZnVuSW1nID0gaW1nKCdpbWFnZS9mdW4tZmFjdHMucG5nJywgKCk9PiB7XG5cdFx0ZnVuQW5pbSA9IGFuaW1QYXJhbXMoZnVuQnRuLCBmdW5JbWcsIGZ1bkltZ1dyYXBwZXIpXG5cdFx0YnV0dG9uc1snZnVuLWZhY3QtYnRuJ10uYW5pbSA9IGZ1bkFuaW1cblx0XHRmdW5TaXplID0gW2Z1bkltZy53aWR0aCwgZnVuSW1nLmhlaWdodF1cblx0XHRkb20udHJlZS5hZGQoZnVuSW1nV3JhcHBlciwgZnVuSW1nKVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXG5cdHZhciB1cGRhdGVBbmltID0gKGFuaW0pPT4ge1xuXHRcdGlmKGFuaW0gPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHRhbmltLnRpbWUgKz0gMC4xXG5cdFx0YW5pbS5mcG9zaXRpb24ueCA9IGFuaW0uaXBvc2l0aW9uLnhcblx0XHRhbmltLmZwb3NpdGlvbi55ID0gYW5pbS5pcG9zaXRpb24ueVxuXHRcdGFuaW0uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDgwXG5cdFx0YW5pbS5mcG9zaXRpb24ueSArPSAobW91c2UublkgLSAwLjUpICogMjAwXG5cblx0XHRzcHJpbmdUbyhhbmltLCBhbmltLmZwb3NpdGlvbiwgMSlcblx0XHRhbmltLmNvbmZpZy5sZW5ndGggKz0gKDAuMDEgLSBhbmltLmNvbmZpZy5sZW5ndGgpICogMC4xXG5cdFx0XG5cdFx0dHJhbnNsYXRlKGFuaW0uZWwsIGFuaW0ucG9zaXRpb24ueCArIGFuaW0udmVsb2NpdHkueCwgYW5pbS5wb3NpdGlvbi55ICsgYW5pbS52ZWxvY2l0eS55LCAxKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNBY3RpdmU6IHRydWUsXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBtaWRXID0gd2luZG93VyA+PiAxXG5cdFx0XHR2YXIgc2NhbGUgPSAwLjhcblx0XHRcdFxuXHRcdFx0YnV0dG9uU2l6ZVswXSA9IG1pZFcgKiAwLjlcblx0XHRcdGJ1dHRvblNpemVbMV0gPSB3aW5kb3dIXG5cblx0XHRcdGlmKHNob3BTaXplICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS5oZWlnaHQgPSBidXR0b25TaXplWzFdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmxlZnQgPSAobWlkVyA+PiAxKSAtIChidXR0b25TaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGJ1dHRvblNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdFxuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS53aWR0aCA9IHNob3BTaXplWzBdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBzaG9wU2l6ZVsxXSpzY2FsZSArICdweCdcblx0XHRcdFx0c2hvcEltZ1dyYXBwZXIuc3R5bGUubGVmdCA9IChidXR0b25TaXplWzBdID4+IDEpIC0gKHNob3BTaXplWzBdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS50b3AgPSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSAtIChzaG9wU2l6ZVsxXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdH1cblx0XHRcdGlmKGZ1blNpemUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS53aWR0aCA9IGJ1dHRvblNpemVbMF0gKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS5oZWlnaHQgPSBidXR0b25TaXplWzFdICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUubGVmdCA9IG1pZFcgKyAobWlkVyA+PiAxKSAtIChidXR0b25TaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSArICdweCdcblxuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLndpZHRoID0gZnVuU2l6ZVswXSpzY2FsZSArICdweCdcblx0XHRcdFx0ZnVuSW1nV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBmdW5TaXplWzFdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLmxlZnQgPSAoYnV0dG9uU2l6ZVswXSA+PiAxKSAtIChmdW5TaXplWzBdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLnRvcCA9IChidXR0b25TaXplWzFdID4+IDEpIC0gKGZ1blNpemVbMV0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvdmVyOiAoaWQpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGN1cnJlbnRBbmltID0gYnV0dG9uc1tpZF0uYW5pbVxuXHRcdFx0Y3VycmVudEFuaW0udGwudGltZVNjYWxlKDIuNikucGxheSgwKVxuXHRcdFx0Y3VycmVudEFuaW0uY29uZmlnLmxlbmd0aCA9IDQwMFxuXHRcdH0sXG5cdFx0b3V0OiAoaWQpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGN1cnJlbnRBbmltID0gYnV0dG9uc1tpZF0uYW5pbVxuXHRcdFx0Y3VycmVudEFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRpZihzaG9wQW5pbSA9PSB1bmRlZmluZWQpIHJldHVybiBcblx0XHRcdHVwZGF0ZUFuaW0oc2hvcEFuaW0pXG5cdFx0XHR1cGRhdGVBbmltKGZ1bkFuaW0pXG5cdFx0fSxcblx0XHRhY3RpdmF0ZTogKCk9PiB7XG5cdFx0XHRzY29wZS5pc0FjdGl2ZSA9IHRydWVcblx0XHR9LFxuXHRcdGRpc2FjdGl2YXRlOiAoKT0+IHtcblx0XHRcdHNjb3BlLmlzQWN0aXZlID0gZmFsc2Vcblx0XHRcdHNob3BBbmltLnRsLnRpbWVTY2FsZSgzKS5yZXZlcnNlKClcblx0XHRcdGZ1bkFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0c2hvcEFuaW0udGwuY2xlYXIoKVxuXHRcdFx0ZnVuQW5pbS50bC5jbGVhcigpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdHNob3BBbmltID0gbnVsbFxuXHRcdFx0ZnVuQW5pbSA9IG51bGxcblx0XHRcdGJ1dHRvbnMgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdNYXBfaGJzJ1xuXG5leHBvcnQgZGVmYXVsdCAocGFyZW50LCB0eXBlKSA9PiB7XG5cblx0dmFyIG9uRG90Q2xpY2sgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS50YXJnZXQuaWRcblx0XHR2YXIgcGFyZW50SWQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRSb3V0ZXIuc2V0SGFzaChwYXJlbnRJZCArICcvJyArIGlkKVxuXHR9XG5cblx0Ly8gcmVuZGVyIG1hcFxuXHR2YXIgbWFwV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0dmFyIHQgPSB0ZW1wbGF0ZSgpXG5cdGVsLmlubmVySFRNTCA9IHRcblx0ZG9tLnRyZWUuYWRkKG1hcFdyYXBwZXIsIGVsKVxuXG5cdHZhciBzY29wZTtcblx0dmFyIGRpciwgc3RlcEVsO1xuXHR2YXIgc2VsZWN0ZWREb3RzID0gW107XG5cdHZhciBjdXJyZW50UGF0aHMsIGZpbGxMaW5lLCBkYXNoZWRMaW5lLCBzdGVwVG90YWxMZW4gPSAwO1xuXHR2YXIgcHJldmlvdXNIaWdobGlnaHRJbmRleCA9IHVuZGVmaW5lZDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLm1hcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgbWFwZG90cyA9IGRvbS5zZWxlY3QuYWxsKCcjbWFwLWRvdHMgLmRvdC1wYXRoJywgZWwpXG5cdHZhciBmb290c3RlcHMgPSBkb20uc2VsZWN0LmFsbCgnI2Zvb3RzdGVwcyBnJywgZWwpXG5cblx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb3QgPSBtYXBkb3RzW2ldXG5cdFx0XHRkb20uZXZlbnQub24oZG90LCAnY2xpY2snLCBvbkRvdENsaWNrKVxuXHRcdH07XG5cdH1cblxuXHR2YXIgdGl0bGVzID0ge1xuXHRcdCdkZWlhJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5kZWlhJywgdGl0bGVzV3JhcHBlcilcblx0XHR9LFxuXHRcdCdlcy10cmVuYyc6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuZXMtdHJlbmMnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2FyZWxsdWYnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmFyZWxsdWYnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRpdGxlUG9zWChwYXJlbnRXLCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudFcgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogdmFsXG5cdH1cblx0ZnVuY3Rpb24gdGl0bGVQb3NZKHBhcmVudEgsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50SCAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSCkgKiB2YWxcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBtYXBXID0gNjkzLCBtYXBIID0gNjQ1XG5cdFx0XHR2YXIgbWFwU2l6ZSA9IFtdXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyowLjQ3LCB3aW5kb3dIKjAuNDcsIG1hcFcsIG1hcEgpXG5cdFx0XHRtYXBTaXplWzBdID0gbWFwVyAqIHJlc2l6ZVZhcnMuc2NhbGVcblx0XHRcdG1hcFNpemVbMV0gPSBtYXBIICogcmVzaXplVmFycy5zY2FsZVxuXG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IG1hcFNpemVbMF0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPSBtYXBTaXplWzFdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKG1hcFNpemVbMF0gPj4gMSkgLSA0MCArICdweCdcblx0XHRcdGVsLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1hcFNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgNzQwKSArICdweCdcblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCAyNTApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgMTI4MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDY5MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDM2MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgNDAwKSArICdweCdcblx0XHR9LFxuXHRcdGhpZ2hsaWdodERvdHM6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHNlbGVjdGVkRG90cyA9IFtdXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0dmFyIGlkID0gZG90LmlkXG5cdFx0XHRcdHZhciBwYXJlbnRJZCA9IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRcdFx0aWYoaWQgPT0gb2xkSGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gb2xkSGFzaC5wYXJlbnQpIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdFx0aWYoaWQgPT0gbmV3SGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gbmV3SGFzaC5wYXJlbnQpICBzZWxlY3RlZERvdHMucHVzaChkb3QpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gc2VsZWN0ZWREb3RzW2ldXG5cdFx0XHRcdGRvbS5jbGFzc2VzLmFkZChkb3QsICdhbmltYXRlJylcblx0XHRcdH07XG5cdFx0fSxcblx0XHRoaWdobGlnaHQ6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHZhciBvbGRJZCA9IG9sZEhhc2gudGFyZ2V0XG5cdFx0XHR2YXIgbmV3SWQgPSBuZXdIYXNoLnRhcmdldFxuXHRcdFx0dmFyIGN1cnJlbnQgPSBvbGRJZCArICctJyArIG5ld0lkXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvb3RzdGVwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgc3RlcCA9IGZvb3RzdGVwc1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBzdGVwLmlkXG5cdFx0XHRcdGlmKGlkLmluZGV4T2Yob2xkSWQpID4gLTEgJiYgaWQuaW5kZXhPZihuZXdJZCkgPiAtMSkge1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBsYXN0IG9uZVxuXHRcdFx0XHRcdGlmKGkgPT0gcHJldmlvdXNIaWdobGlnaHRJbmRleCkgc3RlcEVsID0gZm9vdHN0ZXBzW2Zvb3RzdGVwcy5sZW5ndGgtMV1cblx0XHRcdFx0XHRlbHNlIHN0ZXBFbCA9IHN0ZXBcblxuXHRcdFx0XHRcdGRpciA9IGlkLmluZGV4T2YoY3VycmVudCkgPiAtMSA/IEFwcENvbnN0YW50cy5GT1JXQVJEIDogQXBwQ29uc3RhbnRzLkJBQ0tXQVJEXG5cdFx0XHRcdFx0cHJldmlvdXNIaWdobGlnaHRJbmRleCA9IGlcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0c2NvcGUuaGlnaGxpZ2h0RG90cyhvbGRIYXNoLCBuZXdIYXNoKVxuXG5cdFx0XHRjdXJyZW50UGF0aHMgPSBkb20uc2VsZWN0LmFsbCgncGF0aCcsIHN0ZXBFbClcblx0XHRcdGRhc2hlZExpbmUgPSBjdXJyZW50UGF0aHNbMF1cblxuXHRcdFx0Ly8gY2hvb3NlIHBhdGggZGVwZW5kcyBvZiBmb290c3RlcCBkaXJlY3Rpb25cblx0XHRcdGlmKGRpciA9PSBBcHBDb25zdGFudHMuRk9SV0FSRCkge1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1sxXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1syXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1cblxuXHRcdFx0c3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cblx0XHRcdC8vIGZpbmQgdG90YWwgbGVuZ3RoIG9mIHNoYXBlXG5cdFx0XHRzdGVwVG90YWxMZW4gPSBmaWxsTGluZS5nZXRUb3RhbExlbmd0aCgpXG5cdFx0XHRmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IDBcblx0XHRcdGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaGFycmF5J10gPSBzdGVwVG90YWxMZW5cblx0XHRcdFxuXHRcdFx0Ly8gc3RhcnQgYW5pbWF0aW9uIG9mIGRhc2hlZCBsaW5lXG5cdFx0XHRkb20uY2xhc3Nlcy5hZGQoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0XHQvLyBzdGFydCBhbmltYXRpb25cblx0XHRcdGRvbS5jbGFzc2VzLmFkZChmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0fSxcblx0XHRyZXNldEhpZ2hsaWdodDogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdHN0ZXBFbC5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0Y3VycmVudFBhdGhzWzJdLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZG90LCAnYW5pbWF0ZScpXG5cdFx0XHRcdH07XG5cdFx0XHR9LCAwKVxuXHRcdH0sXG5cdFx0dXBkYXRlUHJvZ3Jlc3M6IChwcm9ncmVzcyk9PiB7XG5cdFx0XHRpZihmaWxsTGluZSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdFx0dmFyIGRhc2hPZmZzZXQgPSAocHJvZ3Jlc3MgLyAxKSAqIHN0ZXBUb3RhbExlblxuXHRcdFx0ZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNob2Zmc2V0J10gPSBkYXNoT2Zmc2V0XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0XHRcdGRvdC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uRG90Q2xpY2spXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHR0aXRsZXMgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIsIHZpZGVvVXJsKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBzcGxpdHRlciA9IHZpZGVvVXJsLnNwbGl0KCcvJylcblx0dmFyIG5hbWUgPSBzcGxpdHRlcltzcGxpdHRlci5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR2YXIgaW1nSWQgPSAnaG9tZS12aWRlby1zaG90cy8nICsgbmFtZVxuXHR2YXIgbUNhbnZhcyA9IG1pbmlWaWRlbyh7XG5cdFx0bG9vcDogdHJ1ZSxcblx0XHRhdXRvcGxheTogZmFsc2Vcblx0fSlcblx0dmFyIHNpemUsIHBvc2l0aW9uLCByZXNpemVWYXJzO1xuXHR2YXIgaW1nO1xuXG5cdHZhciBvbk1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0aWYobUNhbnZhcy5pc0xvYWRlZCkge1xuXHRcdFx0bUNhbnZhcy5wbGF5KDApXG5cdFx0fWVsc2V7XG5cdFx0XHRtQ2FudmFzLmxvYWQodmlkZW9VcmwsICgpPT4ge1xuXHRcdFx0XHRtQ2FudmFzLnBsYXkoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHR2YXIgb25Nb3VzZUxlYXZlID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdG1DYW52YXMucGF1c2UoKVxuXHR9XG5cblx0dmFyIG9uQ2xpY2sgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdH1cblxuXHR2YXIgaW5pdCA9ICgpPT4ge1xuXHRcdHZhciBpbWdVcmwgPSBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VVUkwoaW1nSWQpIFxuXHRcdGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG5cdFx0aW1nLnNyYyA9IGltZ1VybFxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIGltZylcblx0XHRkb20udHJlZS5hZGQoY29udGFpbmVyLCBtQ2FudmFzLmVsKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKGNvbnRhaW5lciwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0ZG9tLmV2ZW50Lm9uKGNvbnRhaW5lciwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0ZG9tLmV2ZW50Lm9uKGNvbnRhaW5lciwgJ2NsaWNrJywgb25DbGljaylcblxuXHRcdHNjb3BlLmlzUmVhZHkgPSB0cnVlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc1JlYWR5OiBmYWxzZSxcblx0XHRpbml0OiBpbml0LFxuXHRcdHJlc2l6ZTogKHMsIHAsIHJ2KT0+IHtcblxuXHRcdFx0c2l6ZSA9IHMgPT0gdW5kZWZpbmVkID8gc2l6ZSA6IHNcblx0XHRcdHBvc2l0aW9uID0gcCA9PSB1bmRlZmluZWQgPyBwb3NpdGlvbiA6IHBcblx0XHRcdHJlc2l6ZVZhcnMgPSBydiA9PSB1bmRlZmluZWQgPyByZXNpemVWYXJzIDogcnZcblxuXHRcdFx0aWYoIXNjb3BlLmlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHRjb250YWluZXIuc3R5bGUud2lkdGggPSBzaXplWzBdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHNpemVbMV0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUubGVmdCA9IHBvc2l0aW9uWzBdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLnRvcCA9IHBvc2l0aW9uWzFdICsgJ3B4J1xuXG5cdFx0XHRpbWcuc3R5bGUud2lkdGggPSByZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0aW1nLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUudG9wID0gcmVzaXplVmFycy50b3AgKyAncHgnXG5cblx0XHRcdC8vIGltZy5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHQvLyBpbWcuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHQvLyBpbWcuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnMubGVmdCArICdweCdcblx0XHRcdC8vIGltZy5zdHlsZS50b3AgPSByZXNpemVWYXJzLnRvcCArICdweCdcblxuXHRcdFx0bUNhbnZhcy5lbC5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRtQ2FudmFzLmVsLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bUNhbnZhcy5lbC5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bUNhbnZhcy5lbC5zdHlsZS50b3AgPSByZXNpemVWYXJzLnRvcCArICdweCdcblxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihjb250YWluZXIsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihjb250YWluZXIsICdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihjb250YWluZXIsICdjbGljaycsIG9uQ2xpY2spXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCAocHJvcHMpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0dmFyIG9uUmVhZHlDYWxsYmFjaztcblx0dmFyIHNpemUgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfVxuXHR2YXIgZUxpc3RlbmVycyA9IFtdXG5cblx0dmFyIG9uQ2FuUGxheSA9ICgpPT57XG5cdFx0c2NvcGUuaXNMb2FkZWQgPSB0cnVlXG5cdFx0aWYocHJvcHMuYXV0b3BsYXkpIHZpZGVvLnBsYXkoKVxuXHRcdGlmKHByb3BzLnZvbHVtZSAhPSB1bmRlZmluZWQpIHZpZGVvLnZvbHVtZSA9IHByb3BzLnZvbHVtZVxuXHRcdHNpemUud2lkdGggPSB2aWRlby52aWRlb1dpZHRoXG5cdFx0c2l6ZS5oZWlnaHQgPSB2aWRlby52aWRlb0hlaWdodFxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgICAgIG9uUmVhZHlDYWxsYmFjayhzY29wZSlcblx0fVxuXG5cdHZhciBwbGF5ID0gKHRpbWUpPT57XG5cdFx0aWYodGltZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHNjb3BlLnNlZWsodGltZSlcblx0XHR9XG4gICAgXHRzY29wZS5pc1BsYXlpbmcgPSB0cnVlXG4gICAgXHR2aWRlby5wbGF5KClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICBcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZVxuICAgIH1cblxuICAgIHZhciBwYXVzZSA9ICh0aW1lKT0+e1xuICAgIFx0dmlkZW8ucGF1c2UoKVxuICAgIFx0aWYodGltZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHNjb3BlLnNlZWsodGltZSlcblx0XHR9XG4gICAgXHRzY29wZS5pc1BsYXlpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIHZhciB2b2x1bWUgPSAodmFsKT0+IHtcbiAgICBcdGlmKHZhbCkge1xuICAgIFx0XHRzY29wZS5lbC52b2x1bWUgPSB2YWxcbiAgICBcdH1lbHNle1xuICAgIFx0XHRyZXR1cm4gc2NvcGUuZWwudm9sdW1lXG4gICAgXHR9XG4gICAgfVxuXG4gICAgdmFyIGN1cnJlbnRUaW1lID0gKHZhbCk9PiB7XG4gICAgXHRpZih2YWwpIHtcbiAgICBcdFx0c2NvcGUuZWwuY3VycmVudFRpbWUgPSB2YWxcbiAgICBcdH1lbHNle1xuICAgIFx0XHRyZXR1cm4gc2NvcGUuZWwuY3VycmVudFRpbWVcbiAgICBcdH1cbiAgICB9XG5cbiAgICB2YXIgd2lkdGggPSAoKT0+IHtcbiAgICBcdHJldHVybiBzY29wZS5lbC52aWRlb1dpZHRoXG4gICAgfVxuXG4gICAgdmFyIGhlaWdodCA9ICgpPT4ge1xuICAgIFx0cmV0dXJuIHNjb3BlLmVsLnZpZGVvSGVpZ2h0XHRcbiAgICB9XG5cbiAgICB2YXIgZW5kZWQgPSAoKT0+e1xuICAgIFx0aWYocHJvcHMubG9vcCkgcGxheSgpXG4gICAgfVxuXG5cdHZhciBhZGRUbyA9IChwKT0+IHtcblx0XHRzY29wZS5wYXJlbnQgPSBwXG5cdFx0ZG9tLnRyZWUuYWRkKHNjb3BlLnBhcmVudCwgdmlkZW8pXG5cdH1cblxuXHR2YXIgb24gPSAoZXZlbnQsIGNiKT0+IHtcblx0XHRlTGlzdGVuZXJzLnB1c2goe2V2ZW50OmV2ZW50LCBjYjpjYn0pXG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG5cdH1cblxuXHR2YXIgb2ZmID0gKGV2ZW50LCBjYik9PiB7XG5cdFx0Zm9yICh2YXIgaSBpbiBlTGlzdGVuZXJzKSB7XG5cdFx0XHR2YXIgZSA9IGVMaXN0ZW5lcnNbaV1cblx0XHRcdGlmKGUuZXZlbnQgPT0gZXZlbnQgJiYgZS5jYiA9PSBjYikge1xuXHRcdFx0XHRlTGlzdGVuZXJzLnNwbGljZShpLCAxKVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdHZhciBjbGVhckFsbEV2ZW50cyA9ICgpPT4ge1xuXHQgICAgZm9yICh2YXIgaSBpbiBlTGlzdGVuZXJzKSB7XG5cdCAgICBcdHZhciBlID0gZUxpc3RlbmVyc1tpXVxuXHQgICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKGUuZXZlbnQsIGUuY2IpO1xuXHQgICAgfVxuXHQgICAgZUxpc3RlbmVycy5sZW5ndGggPSAwXG5cdCAgICBlTGlzdGVuZXJzID0gbnVsbFxuXHR9XG5cblx0dmFyIGNsZWFyID0gKCk9PiB7XG4gICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpO1xuXHQgICAgc2NvcGUuY2xlYXJBbGxFdmVudHMoKVxuXHQgICAgc2l6ZSA9IG51bGxcblx0ICAgIHZpZGVvID0gbnVsbFxuICAgIH1cblxuXHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cblx0c2NvcGUgPSB7XG5cdFx0cGFyZW50OiB1bmRlZmluZWQsXG5cdFx0ZWw6IHZpZGVvLFxuXHRcdHNpemU6IHNpemUsXG5cdFx0cGxheTogcGxheSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHR2b2x1bWU6IHZvbHVtZSxcblx0XHRjdXJyZW50VGltZTogY3VycmVudFRpbWUsXG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdGFkZFRvOiBhZGRUbyxcblx0XHRvbjogb24sXG5cdFx0b2ZmOiBvZmYsXG5cdFx0Y2xlYXI6IGNsZWFyLFxuXHRcdGNsZWFyQWxsRXZlbnRzOiBjbGVhckFsbEV2ZW50cyxcblx0XHRpc1BsYXlpbmc6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuXHRcdGlzTG9hZGVkOiBmYWxzZSxcblx0XHRsb2FkOiAoc3JjLCBjYWxsYmFjayk9PiB7XG5cdFx0XHRvblJlYWR5Q2FsbGJhY2sgPSBjYWxsYmFja1xuXHRcdFx0dmlkZW8uc3JjID0gc3JjXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgUGFnZSBmcm9tICdQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRpcHR5cXVlUGFydCBmcm9tICdkaXB0eXF1ZS1wYXJ0J1xuaW1wb3J0IGNoYXJhY3RlciBmcm9tICdjaGFyYWN0ZXInXG5pbXBvcnQgZnVuRmFjdCBmcm9tICdmdW4tZmFjdC1ob2xkZXInXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGFycm93c1dyYXBwZXIgZnJvbSAnYXJyb3dzLXdyYXBwZXInXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgc2VsZmllU3RpY2sgZnJvbSAnc2VsZmllLXN0aWNrJ1xuaW1wb3J0IG1haW5CdG5zIGZyb20gJ21haW4tZGlwdHlxdWUtYnRucydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlwdHlxdWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblxuXHRcdHZhciBuZXh0RGlwdHlxdWUgPSBBcHBTdG9yZS5nZXROZXh0RGlwdHlxdWUoKVxuXHRcdHZhciBwcmV2aW91c0RpcHR5cXVlID0gQXBwU3RvcmUuZ2V0UHJldmlvdXNEaXB0eXF1ZSgpXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wYWdlJ10gPSBuZXh0RGlwdHlxdWVcblx0XHRwcm9wcy5kYXRhWydwcmV2aW91cy1wYWdlJ10gPSBwcmV2aW91c0RpcHR5cXVlXG5cdFx0cHJvcHMuZGF0YVsnbmV4dC1wcmV2aWV3LXVybCddID0gQXBwU3RvcmUuZ2V0UHJldmlld1VybEJ5SGFzaChuZXh0RGlwdHlxdWUpXG5cdFx0cHJvcHMuZGF0YVsncHJldmlvdXMtcHJldmlldy11cmwnXSA9IEFwcFN0b3JlLmdldFByZXZpZXdVcmxCeUhhc2gocHJldmlvdXNEaXB0eXF1ZSlcblx0XHRwcm9wcy5kYXRhWydmYWN0LXR4dCddID0gcHJvcHMuZGF0YS5mYWN0W0FwcFN0b3JlLmxhbmcoKV1cblxuXHRcdHN1cGVyKHByb3BzKVxuXG5cdFx0dGhpcy5vbk1vdXNlTW92ZSA9IHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlRW50ZXIgPSB0aGlzLm9uQXJyb3dNb3VzZUVudGVyLmJpbmQodGhpcylcblx0XHR0aGlzLm9uQXJyb3dNb3VzZUxlYXZlID0gdGhpcy5vbkFycm93TW91c2VMZWF2ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZCA9IHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQuYmluZCh0aGlzKVxuXHRcdHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlciA9IHRoaXMub25NYWluQnRuc0V2ZW50SGFuZGxlci5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk9wZW5GYWN0ID0gdGhpcy5vbk9wZW5GYWN0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uQ2xvc2VGYWN0ID0gdGhpcy5vbkNsb3NlRmFjdC5iaW5kKHRoaXMpXG5cdFx0dGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCA9IHRoaXMudWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLk9QRU5fRlVOX0ZBQ1QsIHRoaXMub25PcGVuRmFjdClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuQ0xPU0VfRlVOX0ZBQ1QsIHRoaXMub25DbG9zZUZhY3QpXG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5sZWZ0UGFydCA9IGRpcHR5cXVlUGFydChcblx0XHRcdHRoaXMucHhDb250YWluZXIsXG5cdFx0XHR0aGlzLmdldEltYWdlVXJsQnlJZCgnc2hvZS1iZycpLFxuXHRcdFx0XG5cdFx0KVxuXHRcdHRoaXMucmlnaHRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdjaGFyYWN0ZXItYmcnKVxuXHRcdClcblxuXHRcdHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3RlcicpLCB0aGlzLmdldEltYWdlU2l6ZUJ5SWQoJ2NoYXJhY3RlcicpKVxuXHRcdHRoaXMuZnVuRmFjdCA9IGZ1bkZhY3QodGhpcy5weENvbnRhaW5lciwgdGhpcy5lbGVtZW50LCB0aGlzLm1vdXNlLCB0aGlzLnByb3BzLmRhdGEpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyID0gYXJyb3dzV3JhcHBlcih0aGlzLmVsZW1lbnQsIHRoaXMub25BcnJvd01vdXNlRW50ZXIsIHRoaXMub25BcnJvd01vdXNlTGVhdmUpXG5cdFx0dGhpcy5zZWxmaWVTdGljayA9IHNlbGZpZVN0aWNrKHRoaXMuZWxlbWVudCwgdGhpcy5tb3VzZSwgdGhpcy5wcm9wcy5kYXRhKVxuXHRcdHRoaXMubWFpbkJ0bnMgPSBtYWluQnRucyh0aGlzLmVsZW1lbnQsIHRoaXMucHJvcHMuZGF0YSwgdGhpcy5tb3VzZSwgdGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKHRoaXMuc2VsZmllU3RpY2suZWwsICdjbGljaycsIHRoaXMub25TZWxmaWVTdGlja0NsaWNrZWQpXG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHRUd2Vlbk1heC5zZXQodGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoJ2xlZnQnKSwgeyB4Oi1BcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HIH0pXG5cdFx0VHdlZW5NYXguc2V0KHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKCdyaWdodCcpLCB7IHg6QXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElORyB9KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuaG9sZGVyLCAxLCB7IHg6IC13aW5kb3dXID4+IDEsIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUsIDEsIHsgeDogdGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZS54IC0gMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC40KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZSwgMSwgeyB4OiB0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS54ICsgMjAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnRsSW4uZnJvbSh0aGlzLnJpZ2h0UGFydC5iZ1Nwcml0ZS5zY2FsZSwgMSwgeyB4OiAzLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNClcblxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5sZWZ0UGFydC5ob2xkZXIsIDEsIHsgeDogLXdpbmRvd1cgPj4gMSwgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bE91dC50byh0aGlzLnJpZ2h0UGFydC5ob2xkZXIsIDEsIHsgeDogd2luZG93VywgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cblx0XHR0aGlzLnVpSW5UbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLmFycm93c1dyYXBwZXIubGVmdCwgMSwgeyB4OiAtMTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuYXJyb3dzV3JhcHBlci5yaWdodCwgMSwgeyB4OiAxMDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5zZWxmaWVTdGljay5lbCwgMSwgeyB5OiA1MDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC41KVxuXHRcdHRoaXMudWlJblRsLnBhdXNlKDApXG5cdFx0dGhpcy51aUluVGwuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZCk7XG5cblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdHVpVHJhbnNpdGlvbkluQ29tcGxldGVkKCkge1xuXHRcdHRoaXMudWlJblRsLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0dGhpcy5zZWxmaWVTdGljay50cmFuc2l0aW9uSW5Db21wbGV0ZWQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdHRoaXMudWlJblRsLnRpbWVTY2FsZSgxLjYpLnBsYXkoKVx0XHRcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0b25Nb3VzZU1vdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5tb3VzZS54ID0gZS5jbGllbnRYXG5cdFx0dGhpcy5tb3VzZS55ID0gZS5jbGllbnRZXG5cdFx0dGhpcy5tb3VzZS5uWCA9IChlLmNsaWVudFggLyB3aW5kb3dXKSAqIDFcblx0XHR0aGlzLm1vdXNlLm5ZID0gKGUuY2xpZW50WSAvIHdpbmRvd0gpICogMVxuXHR9XG5cdG9uU2VsZmllU3RpY2tDbGlja2VkKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRpZih0aGlzLnNlbGZpZVN0aWNrLmlzT3BlbmVkKSB7XG5cdFx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsb3NlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuc2VsZmllU3RpY2sub3BlbigpXG5cdFx0XHR0aGlzLm1haW5CdG5zLmFjdGl2YXRlKClcblx0XHR9XG5cdH1cblx0b25BcnJvd01vdXNlRW50ZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IC1vZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjQsIHsgeDpwb3NYLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjQsIHsgeDowLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0pXG5cblx0XHR0aGlzLmFycm93c1dyYXBwZXIub3ZlcihpZClcblx0fVxuXHRvbkFycm93TW91c2VMZWF2ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG5cblx0XHR2YXIgcG9zWDtcblx0XHR2YXIgb2Zmc2V0WCA9IEFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkdcblx0XHRpZihpZCA9PSAnbGVmdCcpIHBvc1ggPSAtb2Zmc2V0WFxuXHRcdGVsc2UgcG9zWCA9IG9mZnNldFhcblxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMucHhDb250YWluZXIsIDAuNiwgeyB4OjAsIGVhc2U6RXhwby5lYXNlT3V0IH0pXG5cdFx0VHdlZW5NYXgudG8odGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoaWQpLCAwLjYsIHsgeDpwb3NYLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm91dChpZClcblx0fVxuXHRvbk1haW5CdG5zRXZlbnRIYW5kbGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgdHlwZSA9IGUudHlwZVxuXHRcdHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcblx0XHR2YXIgaWQgPSB0YXJnZXQuaWRcblx0XHRpZih0eXBlID09ICdjbGljaycgJiYgaWQgPT0gJ2Z1bi1mYWN0LWJ0bicpIHtcblx0XHRcdGlmKHRoaXMuZnVuRmFjdC5pc09wZW4pIHtcblx0XHRcdFx0QXBwQWN0aW9ucy5jbG9zZUZ1bkZhY3QoKVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkZ1bkZhY3QoKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ21vdXNlZW50ZXInKSB7XG5cdFx0XHR0aGlzLm1haW5CdG5zLm92ZXIoaWQpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYodHlwZSA9PSAnbW91c2VsZWF2ZScpIHtcblx0XHRcdHRoaXMubWFpbkJ0bnMub3V0KGlkKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG5cdG9uT3BlbkZhY3QoKXtcblx0XHR0aGlzLmZ1bkZhY3Qub3BlbigpXG5cdFx0dGhpcy5tYWluQnRucy5kaXNhY3RpdmF0ZSgpXG5cdH1cblx0b25DbG9zZUZhY3QoKXtcblx0XHR0aGlzLmZ1bkZhY3QuY2xvc2UoKVxuXHRcdHRoaXMubWFpbkJ0bnMuYWN0aXZhdGUoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy5kb21Jc1JlYWR5KSByZXR1cm5cblx0XHR0aGlzLmNoYXJhY3Rlci51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLmxlZnRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnVwZGF0ZSh0aGlzLm1vdXNlKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sudXBkYXRlKClcblx0XHR0aGlzLmZ1bkZhY3QudXBkYXRlKClcblx0XHR0aGlzLm1haW5CdG5zLnVwZGF0ZSgpXG5cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy5sZWZ0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LnJlc2l6ZSgpXG5cdFx0dGhpcy5jaGFyYWN0ZXIucmVzaXplKClcblx0XHR0aGlzLmZ1bkZhY3QucmVzaXplKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIucmVzaXplKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnJlc2l6ZSgpXG5cdFx0dGhpcy5tYWluQnRucy5yZXNpemUoKVxuXG5cdFx0dGhpcy5yaWdodFBhcnQuaG9sZGVyLnggPSAod2luZG93VyA+PiAxKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cdFx0ZG9tLmV2ZW50Lm9mZih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdHRoaXMudWlJblRsLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0dGhpcy51aUluVGwuY2xlYXIoKVxuXHRcdHRoaXMubGVmdFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LmNsZWFyKClcblx0XHR0aGlzLmNoYXJhY3Rlci5jbGVhcigpXG5cdFx0dGhpcy5mdW5GYWN0LmNsZWFyKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsZWFyKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIuY2xlYXIoKVxuXHRcdHRoaXMubWFpbkJ0bnMuY2xlYXIoKVxuXHRcdHRoaXMudWlJblRsID0gbnVsbFxuXHRcdHRoaXMubW91c2UgPSBudWxsXG5cdFx0dGhpcy5sZWZ0UGFydCA9IG51bGxcblx0XHR0aGlzLnJpZ2h0UGFydCA9IG51bGxcblx0XHR0aGlzLmNoYXJhY3RlciA9IG51bGxcblx0XHR0aGlzLmFycm93c1dyYXBwZXIgPSBudWxsXG5cdFx0dGhpcy5tYWluQnRucyA9IG51bGxcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBib3R0b21UZXh0cyBmcm9tICdib3R0b20tdGV4dHMtaG9tZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGdyaWQgZnJvbSAnZ3JpZC1ob21lJ1xuaW1wb3J0IGltYWdlQ2FudmFzZXNHcmlkIGZyb20gJ2ltYWdlLXRvLWNhbnZhc2VzLWdyaWQnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHR2YXIgY29udGVudCA9IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHRwcm9wcy5kYXRhLmdyaWQgPSBbXVxuXHRcdHByb3BzLmRhdGEuZ3JpZC5sZW5ndGggPSAyOFxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXSA9IHsgaG9yaXpvbnRhbDogW10sIHZlcnRpY2FsOiBbXSB9XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLmhvcml6b250YWwubGVuZ3RoID0gM1xuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS52ZXJ0aWNhbC5sZW5ndGggPSA2XG5cdFx0cHJvcHMuZGF0YVsndGV4dF9hJ10gPSBjb250ZW50LnRleHRzWyd0eHRfYSddXG5cdFx0cHJvcHMuZGF0YVsnYV92aXNpb24nXSA9IGNvbnRlbnQudGV4dHNbJ2FfdmlzaW9uJ11cblx0XHRzdXBlcihwcm9wcylcblx0XHR2YXIgYmdVcmwgPSB0aGlzLmdldEltYWdlVXJsQnlJZCgnYmFja2dyb3VuZCcpXG5cdFx0dGhpcy5wcm9wcy5kYXRhLmJndXJsID0gYmdVcmxcblxuXHRcdHRoaXMudHJpZ2dlck5ld0l0ZW0gPSB0aGlzLnRyaWdnZXJOZXdJdGVtLmJpbmQodGhpcylcblx0XHR0aGlzLm9uSXRlbUVuZGVkID0gdGhpcy5vbkl0ZW1FbmRlZC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sYXN0R3JpZEl0ZW1JbmRleDtcblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAyMDBcblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cblx0XHR0aGlzLnNlYXRzID0gW1xuXHRcdFx0MSwgMywgNSxcblx0XHRcdDcsIDksIDExLFxuXHRcdFx0MTUsIDE3LFxuXHRcdFx0MjEsIDIzLCAyNVxuXHRcdF1cblxuXHRcdHRoaXMudXNlZFNlYXRzID0gW11cblxuXHRcdC8vIHRoaXMuYmcgPSBkb20uc2VsZWN0KCcuYmctd3JhcHBlcicsIHRoaXMuZWxlbWVudClcblxuXHRcdHRoaXMuaW1nQ0dyaWQgPSBpbWFnZUNhbnZhc2VzR3JpZCh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5pbWdDR3JpZC5sb2FkKHRoaXMucHJvcHMuZGF0YS5iZ3VybClcblx0XHR0aGlzLmdyaWQgPSBncmlkKHRoaXMucHJvcHMsIHRoaXMuZWxlbWVudCwgdGhpcy5vbkl0ZW1FbmRlZClcblx0XHR0aGlzLmdyaWQuaW5pdCgpXG5cdFx0Ly8gdGhpcy5ib3R0b21UZXh0cyA9IGJvdHRvbVRleHRzKHRoaXMuZWxlbWVudClcblx0XHR0aGlzLmFyb3VuZEJvcmRlciA9IGFyb3VuZEJvcmRlcih0aGlzLmVsZW1lbnQpXG5cdFx0Ly8gdGhpcy5tYXAgPSBtYXAodGhpcy5lbGVtZW50LCBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0dHJpZ2dlck5ld0l0ZW0odHlwZSkge1xuXHRcdHZhciBpbmRleCA9IHRoaXMuc2VhdHNbVXRpbHMuUmFuZCgwLCB0aGlzLnNlYXRzLmxlbmd0aCAtIDEsIDApXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHNlYXQgPT0gaW5kZXgpIHtcblx0XHRcdFx0aWYodGhpcy51c2VkU2VhdHMubGVuZ3RoIDwgdGhpcy5zZWF0cy5sZW5ndGggLSAyKSB0aGlzLnRyaWdnZXJOZXdJdGVtKHR5cGUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy51c2VkU2VhdHMucHVzaChpbmRleClcblx0XHR0aGlzLmdyaWQudHJhbnNpdGlvbkluSXRlbShpbmRleCwgdHlwZSlcblx0fVxuXHRvbkl0ZW1FbmRlZChpdGVtKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVzZWRTZWF0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHVzZWRTZWF0ID0gdGhpcy51c2VkU2VhdHNbaV1cblx0XHRcdGlmKHVzZWRTZWF0ID09IGl0ZW0uc2VhdCkge1xuXHRcdFx0XHR0aGlzLnVzZWRTZWF0cy5zcGxpY2UoaSwgMSlcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZighdGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQpIHJldHVyblxuXHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0aWYodGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID4gODAwKSB7XG5cdFx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX1ZJREVPKVxuXHRcdH1cblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdGlmKHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA+IDMwKSB7XG5cdFx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX0lNQUdFKVxuXHRcdH1cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFxuXHRcdHZhciBnR3JpZCA9IGdyaWRQb3NpdGlvbnMod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUywgQXBwQ29uc3RhbnRzLkdSSURfUk9XUywgJ2NvbHNfcm93cycpXG5cblx0XHR0aGlzLmdyaWQucmVzaXplKGdHcmlkKVxuXHRcdHRoaXMuaW1nQ0dyaWQucmVzaXplKGdHcmlkKVxuXHRcdC8vIHRoaXMuYm90dG9tVGV4dHMucmVzaXplKClcblx0XHR0aGlzLmFyb3VuZEJvcmRlci5yZXNpemUoKVxuXHRcdC8vIHRoaXMubWFwLnJlc2l6ZSgpXG5cblx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy5hcm91bmRCb3JkZXIuY2xlYXIoKVxuXHRcdHRoaXMuZ3JpZC5jbGVhcigpXG5cdFx0Ly8gdGhpcy5tYXAuY2xlYXIoKVxuXG5cdFx0dGhpcy5ncmlkID0gbnVsbFxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBudWxsXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBudWxsXG5cdFx0dGhpcy5tYXAgPSBudWxsXG5cblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgbWluaVZpZGVvIGZyb20gJ21pbmktdmlkZW8nXG5pbXBvcnQgY29sb3JVdGlscyBmcm9tICdjb2xvci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgKGhvbGRlciwgbW91c2UsIGRhdGEpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgc2NyZWVuSG9sZGVyU2l6ZSA9IFswLCAwXSwgdmlkZW9Ib2xkZXJTaXplID0gWzAsIDBdLCBjb2xvcmlmaWVyU2l6ZSA9IFswLCAwXSwgdG9wT2Zmc2V0ID0gMDtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgaG9sZGVyKVxuXHR2YXIgYmFja2dyb3VuZCA9IGRvbS5zZWxlY3QoJy5iYWNrZ3JvdW5kJywgZWwpXG5cdHZhciBzY3JlZW5XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi13cmFwcGVyJywgZWwpXG5cdHZhciBzY3JlZW5Ib2xkZXIgPSBkb20uc2VsZWN0KCcuc2NyZWVuLWhvbGRlcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciB2aWRlb0hvbGRlciA9IGRvbS5zZWxlY3QoJy52aWRlby1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgY29sb3JpZmllciA9IGRvbS5zZWxlY3QoJy5jb2xvcmlmaWVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXJTdmdQYXRoID0gZG9tLnNlbGVjdCgnc3ZnIHBhdGgnLCBjb2xvcmlmaWVyKVxuXHR2YXIgc2VsZmllU3RpY2tXcmFwcGVyID0gZG9tLnNlbGVjdCgnLnNlbGZpZS1zdGljay13cmFwcGVyJywgZWwpXG5cdHZhciBzcHJpbmdUbyA9IFV0aWxzLlNwcmluZ1RvXG5cdHZhciB0cmFuc2xhdGUgPSBVdGlscy5UcmFuc2xhdGVcblx0dmFyIHR3ZWVuSW47XG5cdHZhciBhbmltYXRpb24gPSB7XG5cdFx0cG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRmcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHR2ZWxvY2l0eToge3g6IDAsIHk6IDB9LFxuXHRcdHJvdGF0aW9uOiAwLFxuXHRcdGNvbmZpZzoge1xuXHRcdFx0bGVuZ3RoOiA0MDAsXG5cdFx0XHRzcHJpbmc6IDAuNCxcblx0XHRcdGZyaWN0aW9uOiAwLjdcblx0XHR9XG5cdH1cblxuXHRUd2Vlbk1heC5zZXQoZWwsIHsgcm90YXRpb246ICctMWRlZycsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDEwMCUnIH0pXG5cblx0Ly8gY2hlY2sgaWYgbWl4LWJsZW5kLW1vZGUgaXMgYXZhaWxhYmxlXG5cdGlmICgnbWl4LWJsZW5kLW1vZGUnIGluIGNvbG9yaWZpZXIuc3R5bGUpIHtcblx0XHRjb2xvcmlmaWVyLnN0eWxlWydtaXgtYmxlbmQtbW9kZSddID0gJ2NvbG9yJ1xuXHR9ZWxzZXtcblx0XHRjb2xvcmlmaWVyU3ZnUGF0aC5zdHlsZVsnb3BhY2l0eSddID0gMC44XG5cdH1cblx0XG5cdHZhciBjID0gZGF0YVsnYW1iaWVudC1jb2xvciddWydzZWxmaWUtc3RpY2snXVxuXHRjb2xvcmlmaWVyU3ZnUGF0aC5zdHlsZVsnZmlsbCddID0gJyMnICsgY29sb3JVdGlscy5oc3ZUb0hleChjLmgsIGMucywgYy52KVxuXG5cdHZhciBvblZpZGVvRW5kZWQgPSAoKT0+IHtcblx0XHRzY29wZS5jbG9zZSgpXG5cdH1cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlXG5cdH0pXG5cdG1WaWRlby5hZGRUbyh2aWRlb0hvbGRlcilcblx0bVZpZGVvLm9uKCdlbmRlZCcsIG9uVmlkZW9FbmRlZClcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnc2VsZmllLXN0aWNrLXZpZGVvLXVybCddXG5cblx0dmFyIHN0aWNrSW1nID0gaW1nKEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9zZWxmaWVzdGljay5wbmcnLCAoKT0+IHtcblx0XHRkb20udHJlZS5hZGQoc2NyZWVuSG9sZGVyLCBzdGlja0ltZylcblx0XHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0XHRpZih0d2VlbkluICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRcdHR3ZWVuSW4ucGxheSgpXG5cdFx0XHR9XG5cdFx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdFx0c2NvcGUucmVzaXplKClcblx0XHR9KVxuXHR9KVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRpc09wZW5lZDogZmFsc2UsXG5cdFx0b3BlbjogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDEwMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC45LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuNVxuXHRcdFx0bVZpZGVvLnBsYXkoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSB0cnVlXG5cdFx0fSxcblx0XHRjbG9zZTogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDAsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLnNwcmluZyA9IDAuNixcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuZnJpY3Rpb24gPSAwLjdcblx0XHRcdG1WaWRlby5wYXVzZSgwKVxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbidcblx0XHRcdHNjb3BlLmlzT3BlbmVkID0gZmFsc2Vcblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cblx0XHRcdGlmKHNjb3BlLmlzT3BlbmVkKSB7XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnkgLSAoc2NyZWVuSG9sZGVyU2l6ZVsxXSAqIDAuOClcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiA4MFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDMwXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDIwXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSAtPSAobW91c2UublkgLSAwLjUpICogMjBcblx0XHRcdH1cblxuXHRcdFx0c3ByaW5nVG8oYW5pbWF0aW9uLCBhbmltYXRpb24uZnBvc2l0aW9uLCAxKVxuXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCArPSAoYW5pbWF0aW9uLmZwb3NpdGlvbi54IC0gYW5pbWF0aW9uLnBvc2l0aW9uLngpICogMC4xXG5cblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbWF0aW9uLmNvbmZpZy5sZW5ndGgpICogMC4wNVxuXG5cdFx0XHR0cmFuc2xhdGUoc2NyZWVuV3JhcHBlciwgYW5pbWF0aW9uLnBvc2l0aW9uLngsIGFuaW1hdGlvbi5wb3NpdGlvbi55ICsgYW5pbWF0aW9uLnZlbG9jaXR5LnksIDEpXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0Y29sb3JpZmllclNpemUgPSBkb20uc2l6ZShjb2xvcmlmaWVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtIChjb2xvcmlmaWVyU2l6ZVswXSAqIDAuNTgpICsgJ3B4J1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZS50b3AgPSAtMC43ICsgJ3B4J1xuXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnggPSAod2luZG93VyA+PiAxKSAtIChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnkgPSB3aW5kb3dIIC0gKHZpZGVvSG9sZGVyU2l6ZVsxXSAqIDAuMzUpXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbkluQ29tcGxldGVkOiAoKT0+IHtcblx0XHRcdGlmKCFpc1JlYWR5KSB7XG5cdFx0XHRcdHR3ZWVuSW4gPSBUd2Vlbk1heC5mcm9tKGVsLCAwLjYsIHsgeTogNTAwLCBwYXVzZWQ6dHJ1ZSwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0bVZpZGVvLmNsZWFyKClcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHRcdGFuaW1hdGlvbiA9IG51bGxcblx0XHRcdHR3ZWVuSW4gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0c2NvcGUuY2xvc2UoKVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgc29jaWFsTGlua3MgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciB3cmFwcGVyID0gZG9tLnNlbGVjdChcIiNmb290ZXIgI3NvY2lhbC13cmFwcGVyXCIsIHBhcmVudClcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjRcblxuXHRcdFx0dmFyIHdyYXBwZXJTaXplID0gZG9tLnNpemUod3JhcHBlcilcblxuXHRcdFx0dmFyIHNvY2lhbENzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIHBhZGRpbmcgLSB3cmFwcGVyU2l6ZVswXSxcblx0XHRcdFx0dG9wOiB3aW5kb3dIIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzFdLFxuXHRcdFx0fVxuXG5cdFx0XHR3cmFwcGVyLnN0eWxlLmxlZnQgPSBzb2NpYWxDc3MubGVmdCArICdweCdcblx0XHRcdHdyYXBwZXIuc3R5bGUudG9wID0gc29jaWFsQ3NzLnRvcCArICdweCdcblx0XHR9LFxuXHRcdHNob3c6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMucmVtb3ZlKHdyYXBwZXIsICdoaWRlJyksIDEwMDApXG5cdFx0fSxcblx0XHRoaWRlOiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLmFkZCh3cmFwcGVyLCAnaGlkZScpLCA1MDApXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvY2lhbExpbmtzIiwiaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuXG52YXIgdmlkZW9DYW52YXMgPSAoIHByb3BzICk9PiB7XG5cbiAgICB2YXIgc2NvcGU7XG4gICAgdmFyIGludGVydmFsSWQ7XG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwLCBkV2lkdGggPSAwLCBkSGVpZ2h0ID0gMDtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuICAgICAgICBhdXRvcGxheTogcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2UsXG4gICAgICAgIHZvbHVtZTogcHJvcHMudm9sdW1lLFxuICAgICAgICBsb29wOiBwcm9wcy5sb29wXG4gICAgfSlcblxuICAgIHZhciBvbkNhblBsYXkgPSAoKT0+e1xuICAgICAgICBzY29wZS5pc0xvYWRlZCA9IHRydWVcbiAgICAgICAgaWYocHJvcHMuYXV0b3BsYXkpIG1WaWRlby5wbGF5KClcbiAgICAgICAgaWYoZFdpZHRoID09IDApIGRXaWR0aCA9IG1WaWRlby53aWR0aCgpXG4gICAgICAgIGlmKGRIZWlnaHQgPT0gMCkgZEhlaWdodCA9IG1WaWRlby5oZWlnaHQoKVxuICAgICAgICBpZihtVmlkZW8uaXNQbGF5aW5nICE9IHRydWUpIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgZHJhd09uY2UgPSAoKT0+IHtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShtVmlkZW8uZWwsIGR4LCBkeSwgZFdpZHRoLCBkSGVpZ2h0KVxuICAgIH1cblxuICAgIHZhciBkcmF3ID0gKCk9PntcbiAgICAgICAgY3R4LmRyYXdJbWFnZShtVmlkZW8uZWwsIGR4LCBkeSwgZFdpZHRoLCBkSGVpZ2h0KVxuICAgIH1cblxuICAgIHZhciBwbGF5ID0gKCk9PntcbiAgICAgICAgbVZpZGVvLnBsYXkoKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChkcmF3LCAxMDAwIC8gMzApXG4gICAgfVxuXG4gICAgdmFyIHNlZWsgPSAodGltZSk9PiB7XG4gICAgICAgIG1WaWRlby5jdXJyZW50VGltZSh0aW1lKVxuICAgICAgICBkcmF3T25jZSgpXG4gICAgfVxuXG4gICAgdmFyIHRpbWVvdXQgPSAoY2IsIG1zKT0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgICAgIGNiKHNjb3BlKVxuICAgICAgICB9LCBtcylcbiAgICB9XG5cbiAgICB2YXIgcGF1c2UgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGF1c2UoKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICAgICAgaWYocHJvcHMubG9vcCkgcGxheSgpXG4gICAgICAgIGlmKHByb3BzLm9uRW5kZWQgIT0gdW5kZWZpbmVkKSBwcm9wcy5vbkVuZGVkKHNjb3BlKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZSA9ICh4LCB5LCB3LCBoKT0+e1xuICAgICAgICBkeCA9IHhcbiAgICAgICAgZHkgPSB5XG4gICAgICAgIGRXaWR0aCA9IHdcbiAgICAgICAgZEhlaWdodCA9IGhcbiAgICB9XG5cbiAgICB2YXIgY2xlYXIgPSAoKT0+IHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgICAgICBtVmlkZW8uY2xlYXJBbGxFdmVudHMoKVxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCwwLDApXG4gICAgfVxuXG4gICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbVZpZGVvLm9uKCdlbmRlZCcsIGVuZGVkKVxuICAgIH1cblxuICAgIHNjb3BlID0ge1xuICAgICAgICBpc0xvYWRlZDogZmFsc2UsXG4gICAgICAgIGNhbnZhczogY2FudmFzLFxuICAgICAgICB2aWRlbzogbVZpZGVvLFxuICAgICAgICBjdHg6IGN0eCxcbiAgICAgICAgZHJhd09uY2U6IGRyYXdPbmNlLFxuICAgICAgICBwbGF5OiBwbGF5LFxuICAgICAgICBwYXVzZTogcGF1c2UsXG4gICAgICAgIHNlZWs6IHNlZWssXG4gICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICAgIHJlc2l6ZTogcmVzaXplLFxuICAgICAgICBjbGVhcjogY2xlYXIsXG4gICAgICAgIGxvYWQ6IChzcmMsIGNiKT0+IHtcbiAgICAgICAgICAgIG1WaWRlby5sb2FkKHNyYywgKCk9PntcbiAgICAgICAgICAgICAgICBvbkNhblBsYXkoKVxuICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2NvcGVcbn1cblxuXG5leHBvcnQgZGVmYXVsdCB2aWRlb0NhbnZhcyIsImV4cG9ydCBkZWZhdWx0IHtcblx0V0lORE9XX1JFU0laRTogJ1dJTkRPV19SRVNJWkUnLFxuXHRQQUdFX0hBU0hFUl9DSEFOR0VEOiAnUEFHRV9IQVNIRVJfQ0hBTkdFRCcsXG5cdFBBR0VfQVNTRVRTX0xPQURFRDogJ1BBR0VfQVNTRVRTX0xPQURFRCcsXG5cblx0TEFORFNDQVBFOiAnTEFORFNDQVBFJyxcblx0UE9SVFJBSVQ6ICdQT1JUUkFJVCcsXG5cblx0Rk9SV0FSRDogJ0ZPUldBUkQnLFxuXHRCQUNLV0FSRDogJ0JBQ0tXQVJEJyxcblxuXHRIT01FOiAnSE9NRScsXG5cdERJUFRZUVVFOiAnRElQVFlRVUUnLFxuXG5cdExFRlQ6ICdMRUZUJyxcblx0UklHSFQ6ICdSSUdIVCcsXG5cdFRPUDogJ1RPUCcsXG5cdEJPVFRPTTogJ0JPVFRPTScsXG5cblx0SU5URVJBQ1RJVkU6ICdJTlRFUkFDVElWRScsXG5cdFRSQU5TSVRJT046ICdUUkFOU0lUSU9OJyxcblxuXHRQWF9DT05UQUlORVJfSVNfUkVBRFk6ICdQWF9DT05UQUlORVJfSVNfUkVBRFknLFxuXHRQWF9DT05UQUlORVJfQUREX0NISUxEOiAnUFhfQ09OVEFJTkVSX0FERF9DSElMRCcsXG5cdFBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQ6ICdQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEJyxcblxuXHRPUEVOX0ZVTl9GQUNUOiAnT1BFTl9GVU5fRkFDVCcsXG5cdENMT1NFX0ZVTl9GQUNUOiAnQ0xPU0VfRlVOX0ZBQ1QnLFxuXG5cdEhPTUVfVklERU9fU0laRTogWyA2NDAsIDM2MCBdLFxuXHRIT01FX0lNQUdFX1NJWkU6IFsgNDgwLCAyNzAgXSxcblxuXHRJVEVNX0lNQUdFOiAnSVRFTV9JTUFHRScsXG5cdElURU1fVklERU86ICdJVEVNX1ZJREVPJyxcblxuXHRHUklEX1JPV1M6IDQsIFxuXHRHUklEX0NPTFVNTlM6IDcsXG5cblx0UEFERElOR19BUk9VTkQ6IDQwLFxuXHRTSURFX0VWRU5UX1BBRERJTkc6IDEyMCxcblxuXHRFTlZJUk9OTUVOVFM6IHtcblx0XHRQUkVQUk9EOiB7XG5cdFx0XHRzdGF0aWM6ICcnXG5cdFx0fSxcblx0XHRQUk9EOiB7XG5cdFx0XHRcInN0YXRpY1wiOiBKU191cmxfc3RhdGljICsgJy8nXG5cdFx0fVxuXHR9LFxuXG5cdE1FRElBX0dMT0JBTF9XOiAxOTIwLFxuXHRNRURJQV9HTE9CQUxfSDogMTA4MCxcblxuXHRNSU5fTUlERExFX1c6IDk2MCxcblx0TVFfWFNNQUxMOiAzMjAsXG5cdE1RX1NNQUxMOiA0ODAsXG5cdE1RX01FRElVTTogNzY4LFxuXHRNUV9MQVJHRTogMTAyNCxcblx0TVFfWExBUkdFOiAxMjgwLFxuXHRNUV9YWExBUkdFOiAxNjgwLFxufSIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbnZhciBBcHBEaXNwYXRjaGVyID0gYXNzaWduKG5ldyBGbHV4LkRpc3BhdGNoZXIoKSwge1xuXHRoYW5kbGVWaWV3QWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKHtcblx0XHRcdHNvdXJjZTogJ1ZJRVdfQUNUSU9OJyxcblx0XHRcdGFjdGlvbjogYWN0aW9uXG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBcHBEaXNwYXRjaGVyIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgZGlwdHlxdWUtcGFnZSc+XFxuXHRcXG5cdDxkaXYgY2xhc3M9XFxcImZ1bi1mYWN0LXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibWVzc2FnZS13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLWlubmVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2ZhY3QtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydmYWN0LXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWN0LXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJjdXJzb3ItY3Jvc3NcXFwiPlxcblx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNC4xMDUgMTMuODI4XFxcIj5cXG5cdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNmZmZmZmZcXFwiIHBvaW50cz1cXFwiMTMuOTQ2LDAuODM4IDEzLjI4MywwLjE1NiA3LjAzNSw2LjI1IDAuODM5LDAuMTU2IDAuMTczLDAuODM0IDYuMzcsNi45MzEgMC4xNTksMTIuOTkgMC44MjMsMTMuNjcxIDcuMDcsNy41NzggMTMuMjY2LDEzLjY3MSAxMy45MzIsMTIuOTk0IDcuNzM2LDYuODk2IFxcXCIvPlxcblx0XHRcdDwvc3ZnPlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwibWFpbi1idG5zLXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGlkPSdzaG9wLWJ0bicgY2xhc3M9J21haW4tYnRuJz5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpbWctd3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGlkPSdmdW4tZmFjdC1idG4nIGNsYXNzPSdtYWluLWJ0bic+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaW1nLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwic2VsZmllLXN0aWNrLXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJzY3JlZW4td3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY29sb3JpZmllclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTAwIDIyXFxcIj5cXG5cdFx0XHRcdFx0PHBhdGggZD1cXFwiTTQuNiwxLjI1YzAuMDAxLDAsMC4wNDUtMC4wMDYsMC4wOCwwaDAuMDMyYzEuMjEyLDAuMDAzLDM2LjcwNi0xLDM2LjcwNi0xbDI1LjQ3MSwwLjU0OWMwLjA4NiwwLjAwMiwwLjE3MiwwLjAwNywwLjI1OCwwLjAxN2wxLjQ4NiwwLjE2NkM2OC43MTEsMC45ODksNjguNzczLDEsNjguODM2LDEuMDM2bDAuMzI0LDAuMTk5YzAuMDUyLDAuMDMyLDAuMTEsMC4wNDksMC4xNzEsMC4wNWwyNy4wNDMsMC40NjljMCwwLDIuNjI0LTAuMDc3LDIuNjI0LDIuOTMzbC0wLjY5Miw3Ljk2Yy0wLjA0NSwwLjUxOC0wLjQ3OSwwLjkxNi0wLjk5OSwwLjkxNmgtNi4yMDNjLTAuMzI4LDAtMC42NTMsMC4wMzQtMC45NzUsMC4xYy0wLjg1MywwLjE3NS0yLjgzLDAuNTI4LTUuMjYzLDAuNjE4Yy0wLjM0MiwwLjAxNC0wLjY2MSwwLjE4MS0wLjg3MiwwLjQ1MWwtMC41LDAuNjQ1bC0wLjI4LDAuMzU4Yy0wLjM3NCwwLjQ4Mi0wLjY0NywxLjAzNC0wLjc4OSwxLjYyOGMtMC4zMiwxLjM0NS0xLjM5OCwzLjk1Mi00LjkyNCwzLjk1OGMtMy45NzQsMC4wMDUtNy42ODUtMC4xMTMtMTAuNjEyLTAuMjI1Yy0xLjE4OS0wLjA0NC0yLjk2LDAuMjI5LTIuODU1LTEuNjI5bDAuMzYtNS45NGMwLjAxNC0wLjIxOS0wLjE1Ny0wLjQwNC0wLjM3Ni0wLjQwOUwyOS42MiwxMi40ODhjLTAuMjE0LTAuMDA0LTAuNDI4LDAuMDAxLTAuNjQxLDAuMDE1bC0xLjc1MywwLjExM2MtMC4yMDgsMC4wMTMtMC40MDcsMC4wODUtMC41NzQsMC4yMWMtMC41NTcsMC40MTEtMS44OTcsMS4zOTItMi42NjcsMS44NTljLTAuNzAxLDAuNDI2LTEuNTM5LDEuMDQyLTEuOTY4LDEuMzY0Yy0wLjE4MywwLjEzNy0wLjMwOSwwLjMzNS0wLjM1OCwwLjU1OGwtMC4zMTcsMS40MjVjLTAuMDQ0LDAuMjAyLTAuMDA0LDAuNDEzLDAuMTEzLDAuNTgzbDAuNjEzLDAuODk2YzAuMjEyLDAuMzExLDAuMjk3LDAuNjk5LDAuMTg4LDEuMDU5Yy0wLjExNSwwLjM3OC0wLjQ0NCwwLjc1NS0xLjI5MiwwLjc1NWgtNy45NTdjLTAuNDI1LDAtMC44NDgtMC4wNC0xLjI2Ni0wLjEyYy0yLjU0My0wLjQ4Ni0xMC44NDYtMi42NjEtMTAuODQ2LTEwLjM2QzAuODk2LDMuMzc1LDQuNDU5LDEuMjUsNC42LDEuMjVcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLWhvbGRlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwiYXJyb3dzLXdyYXBwZXJcXFwiPlxcblx0XHQ8YSBocmVmPVxcXCIjL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwcmV2aW91cy1wYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9J2xlZnQnIGNsYXNzPVxcXCJhcnJvdyBsZWZ0XFxcIj5cXG5cdFx0XHRcXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMjEuODQsMjUuMTg0IDEzLjU5LDI1LjE4NCAxLjA0OCwxMi45MzQgMTMuNzk4LDAuNzY4IDIyLjAwNiwwLjcyNiAxMi41MDcsMTAuMTQzIDMxLjQyMywxMC4wNiAzMS41NDgsMTUuODUxIDExLjg4MiwxNS44NTEgXFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiMwMTAxMDFcXFwiIGQ9XFxcIk0xMy4zNCwwLjI2NWg5Ljc5NGwtOS42NDgsOS4zMDVoMTguMjM2djYuOTFIMTMuNTUzbDkuNjAxLDkuMjU5bC05LjgxMy0wLjAyTDAuMTU5LDEyLjk5MUwxMy4zNCwwLjI2NXpNMjAuNzA3LDEuMjQ1aC02Ljk3MUwxLjU2OSwxMi45OTFMMTMuNzM2LDI0Ljc0bDYuOTg0LDAuMDE0TDExLjEyNSwxNS41aDE5LjYxN3YtNC45NUgxMS4wNThMMjAuNzA3LDEuMjQ1elxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjcuNjI3LDAuODMxIDguMzA3LDEuNTI5IDEuOTUyLDcuNzI3IDguMjkzLDEzLjk2NSA3LjYxLDE0LjY1OCAwLjU2MSw3LjcyNCBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXFxuXHRcdDwvYT5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdyaWdodCcgY2xhc3M9XFxcImFycm93IHJpZ2h0XFxcIj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMTAuMzc1LDAuODE4IDE4LjYyNSwwLjgxOCAzMS4xNjcsMTMuMDY4IDE4LjQxNywyNS4yMzUgMTAuMjA4LDI1LjI3NyAxOS43MDgsMTUuODYgMC43OTIsMTUuOTQzIDAuNjY3LDEwLjE1MSAyMC4zMzMsMTAuMTUxIFxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDEwMTAxXFxcIiBkPVxcXCJNMTguNzA4LDI1LjczOEg4LjkxNGw5LjY0OC05LjMwNUgwLjMyNnYtNi45MWgxOC4xNjlMOC44OTQsMC4yNjVsOS44MTQsMC4wMmwxMy4xODEsMTIuNzI3TDE4LjcwOCwyNS43Mzh6TTExLjM0MSwyNC43NTdoNi45NzFsMTIuMTY3LTExLjc0NkwxOC4zMTIsMS4yNjNsLTYuOTg1LTAuMDE0bDkuNTk2LDkuMjU0SDEuMzA2djQuOTVIMjAuOTlMMTEuMzQxLDI0Ljc1N3pcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCIxLjI0LDE0LjY1OCAwLjU2MSwxMy45NiA2LjkxNSw3Ljc2MiAwLjU3NSwxLjUyNSAxLjI1NywwLjgzMSA4LjMwNyw3Ljc2NSBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXByZXZpZXctdXJsJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWyduZXh0LXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXHRcdDwvYT5cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGFsaWFzMz1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzND1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdFxcblx0PGhlYWRlciBpZD1cXFwiaGVhZGVyXFxcIj5cXG5cdFx0XHQ8YSBocmVmPVxcXCJodHRwOi8vd3d3LmNhbXBlci5jb20vXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgY2xhc3M9XFxcImxvZ29cXFwiPlxcblx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIGlkPVxcXCJMYXllcl8xXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHQ8L2E+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibWFwLWJ0blxcXCI+PGEgaHJlZj1cXFwiIyEvbGFuZGluZ1xcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubWFwX3R4dCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjYW1wZXItbGFiXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxhYlVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGFiVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsYWJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIiBjbGFzcz1cXFwic2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5jYW1wZXJfbGFiIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9hPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3Atd3JhcHBlciBidG5cXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwic2hvcC10aXRsZSBzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfdGl0bGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2Rpdj5cXG5cdFx0XHRcdDx1bCBjbGFzcz1cXFwic3VibWVudS13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJzdWItMFxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9J1wiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJtZW5TaG9wVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNob3BfbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTFcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMud29tZW5TaG9wVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC53b21lblNob3BVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIndvbWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3dvbWVuIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9hPjwvbGk+XFxuXHRcdFx0XHQ8L3VsPlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2hlYWRlcj5cXG5cdFx0PGZvb3RlciBpZD1cXFwiZm9vdGVyXFxcIiBjbGFzcz1cXFwiYnRuXFxcIj5cXG5cdFx0XHQ8ZGl2IGlkPVxcXCJzb2NpYWwtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHQ8dWw+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0naW5zdGFncmFtJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmluc3RhZ3JhbVVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5zdGFncmFtVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpbnN0YWdyYW1VcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNi4xMDcsMTUuNTYyYzAsMC4zMDItMC4yNDMsMC41NDctMC41NDMsMC41NDdIMi40MzhjLTAuMzAyLDAtMC41NDctMC4yNDUtMC41NDctMC41NDdWNy4zNTloMi4xODhjLTAuMjg1LDAuNDEtMC4zODEsMS4xNzUtMC4zODEsMS42NjFjMCwyLjkyOSwyLjM4OCw1LjMxMiw1LjMyMyw1LjMxMmMyLjkzNSwwLDUuMzIyLTIuMzgzLDUuMzIyLTUuMzEyYzAtMC40ODYtMC4wNjYtMS4yNC0wLjQyLTEuNjYxaDIuMTg2VjE1LjU2MkwxNi4xMDcsMTUuNTYyeiBNOS4wMiw1LjY2M2MxLjg1NiwwLDMuMzY1LDEuNTA0LDMuMzY1LDMuMzU4YzAsMS44NTQtMS41MDksMy4zNTctMy4zNjUsMy4zNTdjLTEuODU3LDAtMy4zNjUtMS41MDQtMy4zNjUtMy4zNTdDNS42NTUsNy4xNjcsNy4xNjMsNS42NjMsOS4wMiw1LjY2M0w5LjAyLDUuNjYzeiBNMTIuODI4LDIuOTg0YzAtMC4zMDEsMC4yNDQtMC41NDYsMC41NDUtMC41NDZoMS42NDNjMC4zLDAsMC41NDksMC4yNDUsMC41NDksMC41NDZ2MS42NDFjMCwwLjMwMi0wLjI0OSwwLjU0Ny0wLjU0OSwwLjU0N2gtMS42NDNjLTAuMzAxLDAtMC41NDUtMC4yNDUtMC41NDUtMC41NDdWMi45ODRMMTIuODI4LDIuOTg0eiBNMTUuNjY5LDAuMjVIMi4zM2MtMS4xNDgsMC0yLjA4LDAuOTI5LTIuMDgsMi4wNzZ2MTMuMzQ5YzAsMS4xNDYsMC45MzIsMi4wNzUsMi4wOCwyLjA3NWgxMy4zMzljMS4xNSwwLDIuMDgxLTAuOTMsMi4wODEtMi4wNzVWMi4zMjZDMTcuNzUsMS4xNzksMTYuODE5LDAuMjUsMTUuNjY5LDAuMjVMMTUuNjY5LDAuMjV6XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J3R3aXR0ZXInPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudHdpdHRlclVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudHdpdHRlclVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidHdpdHRlclVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDIyIDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAyMiAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTIxLjE3NiwwLjUxNGMtMC44NTQsMC41MDktMS43OTksMC44NzktMi44MDgsMS4wNzljLTAuODA1LTAuODY1LTEuOTUzLTEuNDA1LTMuMjI2LTEuNDA1Yy0yLjQzOCwwLTQuNDE3LDEuOTkyLTQuNDE3LDQuNDQ5YzAsMC4zNDksMC4wMzgsMC42ODgsMC4xMTQsMS4wMTNDNy4xNjYsNS40NjQsMy45MSwzLjY5NSwxLjcyOSwxYy0wLjM4LDAuNjYtMC41OTgsMS40MjUtMC41OTgsMi4yNGMwLDEuNTQzLDAuNzgsMi45MDQsMS45NjYsMy43MDRDMi4zNzQsNi45MiwxLjY5MSw2LjcxOCwxLjA5NCw2LjM4OHYwLjA1NGMwLDIuMTU3LDEuNTIzLDMuOTU3LDMuNTQ3LDQuMzYzYy0wLjM3MSwwLjEwNC0wLjc2MiwwLjE1Ny0xLjE2NSwwLjE1N2MtMC4yODUsMC0wLjU2My0wLjAyNy0wLjgzMy0wLjA4YzAuNTYzLDEuNzY3LDIuMTk0LDMuMDU0LDQuMTI4LDMuMDg5Yy0xLjUxMiwxLjE5NC0zLjQxOCwxLjkwNi01LjQ4OSwxLjkwNmMtMC4zNTYsMC0wLjcwOS0wLjAyMS0xLjA1NS0wLjA2MmMxLjk1NiwxLjI2MSw0LjI4LDEuOTk3LDYuNzc1LDEuOTk3YzguMTMxLDAsMTIuNTc0LTYuNzc4LDEyLjU3NC0xMi42NTljMC0wLjE5My0wLjAwNC0wLjM4Ny0wLjAxMi0wLjU3N2MwLjg2NC0wLjYyNywxLjYxMy0xLjQxMSwyLjIwNC0yLjMwM2MtMC43OTEsMC4zNTQtMS42NDQsMC41OTMtMi41MzcsMC43MDFDMjAuMTQ2LDIuNDI0LDIwLjg0NywxLjU1MywyMS4xNzYsMC41MTRcXFwiLz5cXG5cdFx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz0nZmFjZWJvb2snPlxcblx0XHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZmFjZWJvb2tVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmZhY2Vib29rVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWNlYm9va1VybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE4IDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxOCAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE3LjcxOSwxNi43NTZjMCwwLjUzMS0wLjQzMSwwLjk2My0wLjk2MiwwLjk2M2gtNC40NDN2LTYuNzUzaDIuMjY3bDAuMzM4LTIuNjMxaC0yLjYwNFY2LjY1NGMwLTAuNzYyLDAuMjExLTEuMjgxLDEuMzA0LTEuMjgxbDEuMzk0LDBWMy4wMTljLTAuMjQxLTAuMDMyLTEuMDY4LTAuMTA0LTIuMDMxLTAuMTA0Yy0yLjAwOSwwLTMuMzg1LDEuMjI3LTMuMzg1LDMuNDc5djEuOTQxSDcuMzIydjIuNjMxaDIuMjcydjYuNzUzSDEuMjQzYy0wLjUzMSwwLTAuOTYyLTAuNDMyLTAuOTYyLTAuOTYzVjEuMjQzYzAtMC41MzEsMC40MzEtMC45NjIsMC45NjItMC45NjJoMTUuNTE0YzAuNTMxLDAsMC45NjIsMC40MzEsMC45NjIsMC45NjJWMTYuNzU2XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9mb290ZXI+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlwiO1xufSxcIjNcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0PGRpdj48L2Rpdj5cXG5cIjtcbn0sXCI1XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmhvcml6b250YWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmhvcml6b250YWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJob3Jpem9udGFsXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmhvcml6b250YWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcIjZcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiXHRcdFx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiOFwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy52ZXJ0aWNhbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudmVydGljYWwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwob3B0aW9ucz17XCJuYW1lXCI6XCJ2ZXJ0aWNhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy52ZXJ0aWNhbCkgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczQ9aGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcsIGJ1ZmZlciA9IFxuICBcIjxkaXYgY2xhc3M9J3BhZ2Utd3JhcHBlciBob21lLXBhZ2UnPlxcblx0PGRpdiBjbGFzcz1cXFwiYmctd3JhcHBlclxcXCI+XFxuXHRcdDxpbWcgc3JjPSdcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuYmd1cmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmJndXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJiZ3VybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWJhY2tncm91bmQtY29udGFpbmVyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ncmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ncmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ncmlkKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJncmlkLWNvbnRhaW5lclxcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ3JpZCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ3JpZCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuZ3JpZCkgeyBzdGFjazEgPSBhbGlhczQuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwibGluZXMtZ3JpZC1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJob3Jpem9udGFsLWxpbmVzXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snbGluZXMtZ3JpZCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbGluZXMtZ3JpZCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwibGluZXMtZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVyc1snbGluZXMtZ3JpZCddKSB7IHN0YWNrMSA9IGFsaWFzNC5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidmVydGljYWwtbGluZXNcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydsaW5lcy1ncmlkJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydsaW5lcy1ncmlkJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJsaW5lcy1ncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg4LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzWydsaW5lcy1ncmlkJ10pIHsgc3RhY2sxID0gYWxpYXM0LmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IHN0eWxlPSdkaXNwbGF5OiBub25lOycgY2xhc3M9XFxcImJvdHRvbS10ZXh0cy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXRleHRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImZyb250LXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRleHRfYSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGV4dF9hIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ0ZXh0X2FcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodC10ZXh0XFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJmcm9udC13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInZpc2lvblxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmFfdmlzaW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hX3Zpc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYV92aXNpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJsb2dvXFxcIj5cXG5cdFx0XHRcdFx0PGltZyBzcmM9XFxcImltYWdlL2xvZ28tbWFsbG9yY2EucG5nXFxcIj5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiYXJvdW5kLWJvcmRlci1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJib3R0b21cXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0XFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWxldHRlcnMtY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wXFxcIj5cXG5cdFx0XHQ8ZGl2PmE8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmI8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdFx0PGRpdj5jPC9kaXY+XFxuXHRcdFx0PGRpdj5kPC9kaXY+XFxuXHRcdFx0PGRpdj5lPC9kaXY+XFxuXHRcdFx0PGRpdj5mPC9kaXY+XFxuXHRcdFx0PGRpdj5nPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0XFxcIj5cXG5cdFx0XHQ8ZGl2PjE8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjI8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj5cXG5cdFx0XHQ8ZGl2PjE8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjI8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj48L2Rpdj5cdFxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwidGl0bGVzLXdyYXBwZXJcXFwiPlxcblx0PGRpdiBjbGFzcz1cXFwiZGVpYVxcXCI+REVJQTwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZXMtdHJlbmNcXFwiPkVTIFRSRU5DPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcmVsbHVmXFxcIj5BUkVMTFVGPC9kaXY+XFxuPC9kaXY+XFxuXFxuPHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiLTY3IDAgNzYwIDY0NVxcXCI+XFxuXHQ8cGF0aCBpZD1cXFwibWFwLWJnXFxcIiBmaWxsPVxcXCIjMUVFQTc5XFxcIiBkPVxcXCJNOS4yNjgsMjg5LjM5NGw5Ljc5LTcuNzk4bDEuODkxLDAuNzkzbC0xLjYyOSw1LjAyMWwtNS4yODYsNC41MDRsLTQuMzU0LDcuMDEybC0zLjA4OC0xLjE5OGwtMi4yMzQsMi44ODVsMCwwbC0yLjM4Mi0xLjE3N0w5LjI2OCwyODkuMzk0eiBNNTczLjU4LDE3NC4yMTFsMTkuODktMTMuODJsOC45MDEtMi40NzlsNS4zNTQtNC44MDlsMS41Ni01LjU1NWwtMS02LjkyMmwxLjQ0NS0zLjk3M2w1LjA1Ny0yLjUyM2w0LjI3MSwyLjAxbDExLjkwNiw5LjE2NWwyLjY5Myw0LjkxN2wyLjg5MiwxLjU3NWwxMS40ODIsMS4zNjdsMy4wNTcsMS45NDlsNC40MTgsNS4yMTFsNy43NjgsMi4yMjFsNS44MzIsNC45MTZsNi4zMDUsMC4yMTVsNi4zNzMtMS4yMmwxLjk4OSwxLjg4bDAuNDA5LDEuOTYzbC01LjMzNiwxMC40MjhsLTAuMjI5LDMuODY5bDEuNDQxLDEuNjQ3bDAuODU0LDAuOTU4bDcuMzk1LTAuNDI3bDIuMzQ3LDEuNTRsMC45MDMsMi41MTlsLTIuMTAyLDMuMDU0bC04LjQyNSwzLjE4M2wtMi4xNjksNy4xMTZsMC4zNDQsMy4xODNsMy4wNzMsNC4yMzFsMC4wMTUsMi44NDZsLTIuMDE5LDEuNDVsLTAuNzM5LDMuODQzbDIuMTY2LDE2LjY4N2wtMC45ODIsMS44OGwtNi43ODUtMy43NTdsLTEuNzU4LDAuMjU0bC0yLjAxOSw0LjQ2OGwxLjAzMiw2LjIzN2wtMC42MDUsNC44MjdsLTAuMzYzLDIuODY4bC0xLjQ5NSwxLjY2NWwtMi4xMDItMC4xMjlsLTguMzQxLTMuODQ3bC00LjAxMS0wLjQwNWwtMi43MTEsMS42MDRsLTcuNDM4LDE2LjQ5N2wtMy4yODQsMTEuNTk5bDMuMjIsMTAuNTk3bDEuNjQsMS44NTlsNC4zODYtMC4yOGwxLjQ3OCwxLjY5bC0xLjkzNywzLjM5NWwtMi42OTMsMS4wOTVsLTcuODUxLTAuMTI5bC0yLjU0NiwxLjYyMmwtMi42NjEsMy43MThsMC4xMjksMC44OTdsMC42MDksNC40NDZsLTEuNDc4LDQuMzEzbC0zLjY4LDMuMzEybC0zLjkwOSwxLjE3M2wtMTEuOTg5LDcuNzU4bC01LjM1NCw3Ljk2N2wtOC45MzgsNi41MzlsLTMuMzUxLDYuNjYzbC01Ljc4LDYuNTQybC00LjgyNyw4LjE4MmwwLjI5NCwzLjkwOGwtNC44OTYsMTIuMjg3bC0yLjAyLDUuMTA3bC0zLjIwMiwyMi4zOTNsMC43MjEsOC44NDJsLTEuMDMzLDIuOTVsLTEuNzI1LTAuMjc2bC00LjEyNS00LjQ2OGwtMS42MjQsMC45NjJsLTEuMzk2LDMuMjcybDEuODIyLDQuODQ4bC0xLjY5Miw1LjAyMWwtNC43MzEsNi42MDRsLTguMDYyLDE5LjI5MmwtMi45NzcsMC4zNDFsLTAuNTQxLDAuNDQ4bC0xLjQ3OSwxLjE5NWwxLjMxNiw0LjQ4OWwtMi4yODQsMy4zOTVsLTIuNTE0LDEuMjY0bC01LjQ4NC00LjUzMmwtMy4wODgtMC44OTRsLTAuODA3LDEuOTAxbDIuMjIxLDcuMTc4bC0zLjQsMS4zODlsLTguMzYzLTAuMTNsLTEuNTExLDIuMmwxLjEwMiw1LjM2NWwtMC42ODgsMi43NzNsLTMuMTM4LDMuMTY1bC02LjYwMywyLjhsLTMuODk2LDQuMTg4bC00LjYyOS0xLjMyNGwtNC43MzEsMC42MTdsLTUuMDkyLTIuNTg0bC0yLjYyNSwzLjU2N2wwLjQ3MywyLjcxM2wwLjE4LDEuMDI2bC0xLjMxMiwxLjY4N2wtMTIuNDUyLDQuNzY2bC00LjU5OCw0LjQ4NWwtNy4wNjIsMTEuMDY3bC0xNy42MjMsMTkuODA5bC00LjA5MiwxLjcyN2wtNC40OTgtMC42MTdsLTMuNjQ2LTMuMTg0bC0yLjc5NS02LjUxN2wtNy4xNzYtOC44NjdsLTEuMjMzLTAuNTU2bC0zLjUxNS0xLjY0NGwtMS45MDQtMy42MzJsMS4zNDktNS4zODdsLTMuMjcxLTQuMDU5bC03LjAxNS01LjUxMmwtMi44OTEsMS43OTRsLTQuMDIzLDAuNDdsLTIuODczLTEuNzI5bC0xLjI2Ny01LjU1NWw0Ljc5OS04LjM1NGwtMC4wODItMS42MDFsLTIuNTI4LTQuODk1bC04LjAyLTkuNjE0bC01LjM1Mi00LjE2NmwtNC42MTUtMS44MzdsLTQuMjIxLDAuNjQybC02Ljc4NS0wLjc3MWwtNC44MTMtMC41NzRsLTYuOTQ2LDIuNjI3bC0zLjAwNiw0LjA1OWwtMS45MjIsMC4yNTVsLTE0LjU2OC03LjgzN2wtNC44NjItMC42MjFsLTguNDYsMS44MzdsLTguNDg5LTAuOTgzbC00LjIwNywwLjY2NGwtNy43MTgsNC4xNjdsLTMuNTE1LDAuNjgybC0yLjkwOC0xLjE5NWwtNC44MTItNC42ODNsLTQuMTU3LTAuNTUzbC03LjI3MywxLjQzMmwtMS42NDItMC42ODJsLTEuMzYzLTQuMTI3bC00Ljg5OC0zLjA3NWwtMy4xOTktNS4yNzlsLTExLjQwMS04Ljg4NWwtNS4yMjItNy4xNTlsLTMuMDg4LTcuNTY1bC0wLjQwOS01LjgzMWwzLjYxMS0xMi42NzFsMC4xMzMtNS44MTFsLTEuMTY5LTQuNDY4bC01Ljg0Ni04LjQxOGwtMy4wMzctNi40NDlsLTIuMzE3LTQuOTM4bDEuMzYzLTIuNzUzbDMuNzc1LTIuMDk2bDIuOTkyLTcuNDE0bDQuNC0zLjk5NGwyLjEwNC0zLjc2MWwtNC4wMjQtOS45MTVsLTMuODQ0LTYuNzI5bC04LjM0Ni03LjY0N2wtOC43NjktMi41ODhsLTkuNDI5LTEwLjM0MmwtNC4yNTctMi4zMjVsLTUuMzE4LTUuMzg2bC03LjI2Mi0xLjk0NWwtMC42NzEtMC4xNjhsLTUuMTc1LTEuMzkzbC0yLjk1NiwwLjU2bC0yLjg1NywwLjU1M2wtMi45MjQtMS4wNDhsLTMuOTQ0LDIuMDk2bC0yLjMsNC4xMjNsMC4xNDcsMS40MzJsMC4wODcsMC42ODJsMy45MzgsNS4xNDlsLTIuMzk2LDIuNTIzbC0xMC44ODgtNS42ODVsLTQuMjA3LDAuMTUxbC01Ljk5MywxMS42NjNsLTQuMDkyLDMuODI5bC02LjcxNy0wLjgzM2wtOS45MjEsMy4yNjZsLTcuNjUyLDIuNTIybC0yLjc3NiwzLjAzM2wtMC4yOTcsMi40NTRsMy4zMDMsNC4wNDFsLTMuMDIzLDEuMDkxbC0wLjU5MiwxLjM2N3Y3LjA0OGwtNi44ODIsMTUuNzA0bC0yLjc3NiwxMC4yNTZsMS4yMDIsNC4xMDJsLTAuODI1LDIuNjA5bC0xMi4zMTUtNS4xOTNsLTguNzU4LTYuNDMxbC01LjA0MywyLjkwN2wtMC44ODYsMC40ODhsMS40ODEtNS4yMTFsLTEuNjEtNi40MDlsMi4wMi01LjU1NmwtMC45MTktMi42N2wtNC40MzYsMS4zNjdsLTQuNjgxLTAuNmwtMy4wNzMtNC45MTJsLTEuMzQ1LTQuNjM3bDEuMTgtMi45NDlsMi44OTUtMS45NjdsNy4wMTEtMC43MDNsMS42NDMtMS4zMjhsLTAuMjYyLTEuNzdsLTcuMzQ1LTMuNTQ5bC02LjQ3LTEwLjM2M2wtNi4xMjYsMC4wNDNsLTQuNTk4LDUuMDY2bC0zLjU2NCwwLjg3M2wtNC43NDgsMS4xNzZsLTAuNTkyLTIuMTM1bDEuMDUxLTMuODI1bC0xLjA4My0yLjg2NGwtMy4yODUtMC43MDZMNjQuMzc1LDMyOGwtMi41OTcsNi43NTNsLTQuNjk4LDMuMjkxbC00Ljg1OS0wLjU3N2wwLjcwNy0zLjg0OGwtMS4xMDItMi4zNTFsLTMuMTcsMC4zODRsLTMuMTcxLTMuMTU4bC00LjA0MSw0LjM3OWwtMy4xNTIsMC4yMTFsLTEuNjQ0LTIuMzY4bDIuNjExLTMuMjI5bDguNTQzLTMuNDU5bDMuNDQ2LTIuODE3bC0wLjExNS0xLjI0MmwtMS0wLjc1bC0yLjY5MywxLjI2M2wtNS4zODctMC40MzFsLTIuMTg1LTIuMjM5bC0xMC42NDQtMTAuODk4bC0wLjU5Mi0yLjEzNWwxLjcwNy02LjYwM2wtMC41NzQtMi40OThsLTMuNTI5LTIuOTkzbC0wLjYwOS0yLjE1N2wzLjY5NC03LjczN2wyLjMwMi0wLjU5NmwyLjcxMi01LjUxNmw5LjE4MS05LjQybDguNTcxLDAuMDY1bDExLjYyNy01LjU5OWw1LjgzNS00Ljk5OWwxLjg1NC0yLjc3OGwzLjIzNS00Ljg5NWw1LjgzMS00LjY1NGwxMi44OTMtNi40MTNsNy4xMy02LjM0NWw1LjA4OS03LjMwNmw1LjcxNy0yLjM3Mmw1LjgzMS04LjMzM2wzLjI4NS0yLjg0Mmw3LjQ4OC0yLjk3MWw0Ljg2My02LjA4NmwzLjIwMy0xLjI2M2wxMC4xNjcsMS4zNjdsNi42NzEtMS43NTFsNS4wNTctMy40MzhsMTQuOTgtMTIuMjg3bDQuMDg4LTguMjQ3bDE0LjA0NC0xNC42MTZsNi42NjctMTAuNzQ0bDQuMDEsMy45MTJsNC40ODMtMS45MDJsNS4zMDgtNC40ODZsMS43OS00LjIxM2w2LjE1Ny0xNC40MDFsNC44MjctMS44NTVsNi40MDgsNC45MTNsMi41OTQtMi44NjRsLTAuNzM4LTUuODUzbDAuNjc0LTIuOTY4bDIxLjk2My0xNy44ODVsNS4wMzktMi43MzRsNS43OTksMy4zMTJsMy4zNjctMC44NzVsMy41MzMtMy42OTZsMS44MDgtNS4yNTdsMC40NTktMS4zMjRsMy4yOTksMC43MDdsMS40MTQtMTAuNDkzbDEuODIxLTEuMzI0bDQuNjY2LDEuMzAzbDQuNDY1LTEuMzQ2bDYuNTU2LDIuMTEzbC0wLjE5Ny0yLjA0OWwtMC4xMTQtMS4yMzhsLTAuMDMyLTAuMjU4bDEuNzA3LTIuNTQxbDAuNDQ0LDAuMDY0bDkuODE5LDEuNTE4aDAuMDE4bDYuODE3LTIuMjlsNS44Ni0xLjk2M2w3LjA5OC04LjI1bDguMzYtMi4ybDQuNTMyLTIuNzU5bDQuNTAxLTUuNzY3bDIuNDgxLTMuMTgzbDguMTYzLTUuMjFsNC45OTIsMi4wMjdsNC40MTgtMy45NzJsNC4wNTctMC40OTZsNC45MTMtMi45MDNsOC40NzUtMTAuODA5bDIuNzc1LDAuNjgybDMuMzgzLDMuNjFsMS44OSwyLjAzMWwyLjM2MywyLjUxOWw4LjY0My0wLjc2OGwxNS42MDItMTIuMzQ4bDQuODEyLTIuNDU4bDExLjA3MS01LjY2M2wzLjcxMi0wLjE0N2wtMC40NzgsNS40NDdsMS44OTEsMC43OWw1Ljc2Ny0yLjY2OWwzLjYxMSwxLjI1OWwtMi43MjYsNC45NTZsMC4xNDcsMy41MjdsMy43MTItMC4zMjNsMTcuNjczLTExLjUxMmwyLjMxNy0wLjU3OGwyLjAwNSwxLjY4N2wtMC45ODYsMi4wNzRsMC40MDgsMS45NjZsMTEuMzUyLTEuODQxbDQuMzU0LTIuNTg0bDEuNzA3LTIuMzcybDQuMzgzLTYuMDg2bDcuMTQ3LTUuMjM2bDEyLjQzNC01LjQ3M2w0LjU2NS0wLjA4NmwwLjk2OSwxLjQ1M2wtMS43MDcsMi4zNzZsMC43NzEsMS45ODRsNC4wNTYtMC4yOThsMTMuODQ3LTUuNzI4bDIuMjM0LDEuMDA1bC00LjA4OSwzLjk5NGwtMi4zMzQsNi45MDFsLTIuMTg1LDEuNDc1bC0zLjQ4Mi0wLjU1NmwtMy4yMjEsMS4wNDRsLTguOTE2LDYuODYxbC02LjY4NCw1LjEyOGwtMy43ODEsMS43M2wtMTEuMzk2LTAuMjk4bC01Ljk0Niw1LjY2M2wtMy4yNTMsNC43NDRsLTQuMjU0LDEuMDA1bC0wLjE3OSw5LjMxMmwtNy42MjEtOC4xODJsLTQuNzQ5LDAuMjc2bC0zLjc0Myw0LjE5MWwtMS4yMzQsNi40NDlsMS43NDMsOS42MTdsMi44MDgsNi40OTJsMS44NzIsNC4zMzlsNy4wNDgsNS42ODFsOS4zNzgtMS4yMzhsNy4xMTItNS4wNjNsMi4yOTktMC4yMzNsMi44NzYsMS45MmwyLjk4Ny0wLjE2OGwzLjg3Ny0zLjMwOWw5LjI5Ni0yLjk5M2w0LjkwOS0zLjI0OGw1Ljg1LTcuMjQybDMuMTAzLTIuMTE3bDQuMDYtMC4xMjlsMy4zOTksMS45NjdsLTkuNjI1LDguNzgxbC0wLjMxMiwwLjk4M2wtMS44MjUsNS43NjdsMC44ODksMy4wNThsMi4zMTcsMi40MTFsMy4wMDYtMC4zNjJsMC4zNDQsMy4yMDhsLTQuMDU2LDMuNDU5bC02LjUwNiw5LjUxbC00LjAwNywyLjc1MmwtNy43MDMtMC4yNTVsLTYuNjg1LDMuNTA2bC0zLjMwNC0wLjU2bC0yLjQ2My0zLjExOGwtMy4zODMtMi4xMzVsLTEuOTM5LDAuMjU0bC0yLjk1NiwyLjY0OGwtMi4yMzMsNS4zNDRsLTEuOTU1LDYuOTIybDAuNTQ1LDIuNjkxbDAsMGwzLjg0MiwxMy4wNzdsOC4wNDgsMTUuOTYybDYuNDM4LDcuMjJsMTMuMzIzLDkuNDAybDIyLjU0OCwxMC4yNTNsMC42MjcsMS4yNjNsMTEuNTQ1LDUuNjJsNS4zNCwyLjU4M2w1LjE3NSwxLjUzNmwzLjg3NC0wLjQ4OGw1LjQ1NC0zLjM3Nkw1NzMuNTgsMTc0LjIxMXogTTM4Ny41MTcsNjAxLjk3M2wtMi43NTktMy42OTZsMC40NTktMS45MDJsMi4xMzgtMS4xM2wwLjMyNy0yLjk3NWwyLjUxNC0xLjQ1bDMuODA5LDAuNTU2bDAuNDI3LDEuNjIybC0yLjI4LDcuMDk1bC0yLjA1NiwyLjU0MWwwLDBMMzg3LjUxNyw2MDEuOTczeiBNMzY1LjY1Nyw2MTQuMzQ2bDMuOTA5LDExLjQ5MWwyLjIxNywwLjY2M2wwLjk4Mi0yLjA3bC0wLjI0NC0wLjc3MWwtMS4wODMtMy41MjNsMC42MzgtMi40MzhsMi41OTgsMC4zMDJsMi43ODksMy4xNThsMy4wOTMsMC43MDdsMi4yNDgtMy4wNThsLTEuOTktNS4yMTFsMC42Ni0yLjQzN2wyLjYyNS0wLjM4NGw0LjcxNiwyLjg4NWw2LjAxMSwxLjIxN2wyLjMzNSwxLjkwMmwtNC42MzQsNS41NTVsLTQuMTcxLTAuMjM2bC0xLjQ3OCwxLjg1OGwtMC44NCwyLjYwOGwyLjQ2NSwyLjYwNWwtMy4yMDMsNC43NjZsMC4wODMsMS43NzNsMy41MjgsNS40NjlsLTAuNTg4LDEuMjJsLTIuNDQ5LDAuMzg0bC01Ljk5My0xLjc1MWwtNi4xOTMsMS45NjNsMCwwbC0wLjI4LTQuNDI1bC04LjUzOSwwLjQwOWwtMC40NDQtMS40MzJsMy4zODYtNC43NDRsLTAuNzg5LTEuNjIybC02Ljg1LTEuNzk0bC0wLjYyNS00LjYxNWw0Ljk2LTUuMDIxbC0yLjUxNC0xLjkwMWwtMC40MDktMi4xMzZsMS40OTItMi4wMzFMMzY1LjY1Nyw2MTQuMzQ2elxcXCIvPlxcblx0XFxuXHQ8cGF0aCBpZD1cXFwib3V0ZXItYm9yZGVyXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgZD1cXFwiTTE5LjA1OCwyODEuNTk2bDEuODkxLDAuNzkzbC0xLjYyOSw1LjAyMWwtNS4yODYsNC41MDRsLTQuMzU0LDcuMDEybC0zLjA4OC0xLjE5OGwtMi4yMzQsMi44ODVsLTIuMzgyLTEuMTc3bDcuMjkyLTEwLjA0MUwxOS4wNTgsMjgxLjU5NnogTTY4OS40NTUsMTkzLjg4OGwyLjEwMi0zLjA1NGwtMC45MDMtMi41MTlsLTIuMzQ3LTEuNTRsLTcuMzk1LDAuNDI3bC0wLjg1NC0wLjk1OGwtMS40NDEtMS42NDdsMC4yMjktMy44NjlsNS4zMzYtMTAuNDI4bC0wLjQwOS0xLjk2M2wtMS45ODktMS44OGwtNi4zNzMsMS4yMmwtNi4zMDUtMC4yMTVsLTUuODMyLTQuOTE2bC03Ljc2OC0yLjIyMWwtNC40MTgtNS4yMTFsLTMuMDU3LTEuOTQ5bC0xMS40ODItMS4zNjdsLTIuODkyLTEuNTc1bC0yLjY5My00LjkxN2wtMTEuOTA2LTkuMTY1bC00LjI3MS0yLjAxbC01LjA1NywyLjUyM2wtMS40NDUsMy45NzNsMSw2LjkyMmwtMS41Niw1LjU1NWwtNS4zNTQsNC44MDlsLTguOTAxLDIuNDc5bC0xOS44OSwxMy44MmwtNi4zMDksMC4xNzJsLTUuNDU0LDMuMzc2bC0zLjg3NCwwLjQ4OGwtNS4xNzUtMS41MzZsLTUuMzQtMi41ODNsLTExLjU0NS01LjYybC0wLjYyNy0xLjI2M2wtMjIuNTQ4LTEwLjI1M2wtMTMuMzIzLTkuNDAybC02LjQzOC03LjIybC04LjA0OC0xNS45NjJsLTMuODQyLTEzLjA3N2wtMC41NDUtMi42OTFsMS45NTUtNi45MjJsMi4yMzMtNS4zNDRsMi45NTYtMi42NDhsMS45MzktMC4yNTRsMy4zODMsMi4xMzVsMi40NjMsMy4xMThsMy4zMDQsMC41Nmw2LjY4NS0zLjUwNmw3LjcwMywwLjI1NWw0LjAwNy0yLjc1Mmw2LjUwNi05LjUxbDQuMDU2LTMuNDU5bC0wLjM0NC0zLjIwOGwtMy4wMDYsMC4zNjJsLTIuMzE3LTIuNDExbC0wLjg4OS0zLjA1OGwxLjgyNS01Ljc2N2wwLjMxMi0wLjk4M2w5LjYyNS04Ljc4MWwtMy4zOTktMS45NjdsLTQuMDYsMC4xMjlsLTMuMTAzLDIuMTE3bC01Ljg1LDcuMjQybC00LjkwOSwzLjI0OGwtOS4yOTYsMi45OTNsLTMuODc3LDMuMzA5bC0yLjk4NywwLjE2OGwtMi44NzYtMS45MmwtMi4yOTksMC4yMzNsLTcuMTEyLDUuMDYzbC05LjM3OCwxLjIzOGwtNy4wNDgtNS42ODFsLTEuODcyLTQuMzM5bC0yLjgwOC02LjQ5MmwtMS43NDMtOS42MTdsMS4yMzQtNi40NDlsMy43NDMtNC4xOTFsNC43NDktMC4yNzZsNy42MjEsOC4xODJsMC4xNzktOS4zMTJsNC4yNTQtMS4wMDVsMy4yNTMtNC43NDRsNS45NDYtNS42NjNsMTEuMzk2LDAuMjk4bDMuNzgxLTEuNzNsNi42ODQtNS4xMjhsOC45MTYtNi44NjFsMy4yMjEtMS4wNDRsMy40ODIsMC41NTZsMi4xODUtMS40NzVsMi4zMzQtNi45MDFsNC4wODktMy45OTRsLTIuMjM0LTEuMDA1bC0xMy44NDcsNS43MjhsLTQuMDU2LDAuMjk4bC0wLjc3MS0xLjk4NGwxLjcwNy0yLjM3NmwtMC45NjktMS40NTNsLTQuNTY1LDAuMDg2bC0xMi40MzQsNS40NzNsLTcuMTQ3LDUuMjM2bC00LjM4Myw2LjA4NmwtMS43MDcsMi4zNzJsLTQuMzU0LDIuNTg0bC0xMS4zNTIsMS44NDFsLTAuNDA4LTEuOTY2bDAuOTg2LTIuMDc0bC0yLjAwNS0xLjY4N2wtMi4zMTcsMC41NzhsLTE3LjY3MywxMS41MTJsLTMuNzEyLDAuMzIzbC0wLjE0Ny0zLjUyN2wyLjcyNi00Ljk1NmwtMy42MTEtMS4yNTlsLTUuNzY3LDIuNjY5bC0xLjg5MS0wLjc5bDAuNDc4LTUuNDQ3bC0zLjcxMiwwLjE0N2wtMTEuMDcxLDUuNjYzbC00LjgxMiwyLjQ1OGwtMTUuNjAyLDEyLjM0OGwtOC42NDMsMC43NjhsLTIuMzYzLTIuNTE5bC0xLjg5LTIuMDMxbC0zLjM4My0zLjYxbC0yLjc3NS0wLjY4MmwtOC40NzUsMTAuODA5bC00LjkxMywyLjkwM2wtNC4wNTcsMC40OTZsLTQuNDE4LDMuOTcybC00Ljk5Mi0yLjAyN2wtOC4xNjMsNS4yMWwtMi40ODEsMy4xODNsLTQuNTAxLDUuNzY3bC00LjUzMiwyLjc1OWwtOC4zNiwyLjJsLTcuMDk4LDguMjVsLTUuODYsMS45NjNsLTYuODE3LDIuMjloLTAuMDE4bC05LjgxOS0xLjUxOGwtMC40NDQtMC4wNjRsLTEuNzA3LDIuNTQxbDAuMDMyLDAuMjU4bDAuMTE0LDEuMjM4bDAuMTk3LDIuMDQ5bC02LjU1Ni0yLjExM2wtNC40NjUsMS4zNDZsLTQuNjY2LTEuMzAzbC0xLjgyMSwxLjMyNGwtMS40MTQsMTAuNDkzbC0zLjI5OS0wLjcwN2wtMC40NTksMS4zMjRsLTEuODA4LDUuMjU3bC0zLjUzMywzLjY5NmwtMy4zNjcsMC44NzVsLTUuNzk5LTMuMzEybC01LjAzOSwyLjczNGwtMjEuOTYzLDE3Ljg4NWwtMC42NzQsMi45NjhsMC43MzgsNS44NTNsLTIuNTk0LDIuODY0bC02LjQwOC00LjkxM2wtNC44MjcsMS44NTVsLTYuMTU3LDE0LjQwMWwtMS43OSw0LjIxM2wtNS4zMDgsNC40ODZsLTQuNDgzLDEuOTAybC00LjAxLTMuOTEybC02LjY2NywxMC43NDRsLTE0LjA0NCwxNC42MTZsLTQuMDg4LDguMjQ3bC0xNC45OCwxMi4yODdsLTUuMDU3LDMuNDM4bC02LjY3MSwxLjc1MWwtMTAuMTY3LTEuMzY3bC0zLjIwMywxLjI2M2wtNC44NjMsNi4wODZsLTcuNDg4LDIuOTcxbC0zLjI4NSwyLjg0MmwtNS44MzEsOC4zMzNsLTUuNzE3LDIuMzcybC01LjA4OSw3LjMwNmwtNy4xMyw2LjM0NUw4MC40NzEsMjQ0LjRsLTUuODMxLDQuNjU0bC0zLjIzNSw0Ljg5NWwtMS44NTQsMi43NzhsLTUuODM1LDQuOTk5bC0xMS42MjcsNS41OTlsLTguNTcxLTAuMDY1bC05LjE4MSw5LjQybC0yLjcxMiw1LjUxNmwtMi4zMDIsMC41OTZsLTMuNjk0LDcuNzM3bDAuNjA5LDIuMTU3bDMuNTI5LDIuOTkzbDAuNTc0LDIuNDk4bC0xLjcwNyw2LjYwM2wwLjU5MiwyLjEzNWwxMC42NDQsMTAuODk4bDIuMTg1LDIuMjM5bDUuMzg3LDAuNDMxbDIuNjkzLTEuMjYzbDEsMC43NWwwLjExNSwxLjI0MmwtMy40NDYsMi44MTdsLTguNTQzLDMuNDU5bC0yLjYxMSwzLjIyOWwxLjY0NCwyLjM2OGwzLjE1Mi0wLjIxMWw0LjA0MS00LjM3OWwzLjE3MSwzLjE1OGwzLjE3LTAuMzg0bDEuMTAyLDIuMzUxbC0wLjcwNywzLjg0OGw0Ljg1OSwwLjU3N2w0LjY5OC0zLjI5MUw2NC4zNzUsMzI4bDIuODQxLTAuOTE5bDMuMjg1LDAuNzA2bDEuMDgzLDIuODY0bC0xLjA1MSwzLjgyNWwwLjU5MiwyLjEzNWw0Ljc0OC0xLjE3NmwzLjU2NC0wLjg3M2w0LjU5OC01LjA2Nmw2LjEyNi0wLjA0M2w2LjQ3LDEwLjM2M2w3LjM0NSwzLjU0OWwwLjI2MiwxLjc3bC0xLjY0MywxLjMyOGwtNy4wMTEsMC43MDNsLTIuODk1LDEuOTY3bC0xLjE4LDIuOTQ5bDEuMzQ1LDQuNjM3bDMuMDczLDQuOTEybDQuNjgxLDAuNmw0LjQzNi0xLjM2N2wwLjkxOSwyLjY3bC0yLjAyLDUuNTU2bDEuNjEsNi40MDlsLTEuNDgxLDUuMjExbDAuODg2LTAuNDg4bDUuMDQzLTIuOTA3bDguNzU4LDYuNDMxbDEyLjMxNSw1LjE5M2wwLjgyNS0yLjYwOWwtMS4yMDItNC4xMDJsMi43NzYtMTAuMjU2bDYuODgyLTE1LjcwNHYtNy4wNDhsMC41OTItMS4zNjdsMy4wMjMtMS4wOTFsLTMuMzAzLTQuMDQxbDAuMjk3LTIuNDU0bDIuNzc2LTMuMDMzbDcuNjUyLTIuNTIybDkuOTIxLTMuMjY2bDYuNzE3LDAuODMzbDQuMDkyLTMuODI5bDUuOTkzLTExLjY2M2w0LjIwNy0wLjE1MWwxMC44ODgsNS42ODVsMi4zOTYtMi41MjNsLTMuOTM4LTUuMTQ5bC0wLjA4Ny0wLjY4MmwtMC4xNDctMS40MzJsMi4zLTQuMTIzbDMuOTQ0LTIuMDk2bDIuOTI0LDEuMDQ4bDIuODU3LTAuNTUzbDIuOTU2LTAuNTZsNS4xNzUsMS4zOTNsMC42NzEsMC4xNjhsNy4yNjIsMS45NDVsNS4zMTgsNS4zODZsNC4yNTcsMi4zMjVsOS40MjksMTAuMzQybDguNzY5LDIuNTg4bDguMzQ2LDcuNjQ3bDMuODQ0LDYuNzI5bDQuMDI0LDkuOTE1bC0yLjEwNCwzLjc2MWwtNC40LDMuOTk0bC0yLjk5Miw3LjQxNGwtMy43NzUsMi4wOTZsLTEuMzYzLDIuNzUzbDIuMzE3LDQuOTM4bDMuMDM3LDYuNDQ5bDUuODQ2LDguNDE4bDEuMTY5LDQuNDY4bC0wLjEzMyw1LjgxMWwtMy42MTEsMTIuNjcxbDAuNDA5LDUuODMxbDMuMDg4LDcuNTY1bDUuMjIyLDcuMTU5bDExLjQwMSw4Ljg4NWwzLjE5OSw1LjI3OWw0Ljg5OCwzLjA3NWwxLjM2Myw0LjEyN2wxLjY0MiwwLjY4Mmw3LjI3My0xLjQzMmw0LjE1NywwLjU1M2w0LjgxMiw0LjY4M2wyLjkwOCwxLjE5NWwzLjUxNS0wLjY4Mmw3LjcxOC00LjE2N2w0LjIwNy0wLjY2NGw4LjQ4OSwwLjk4M2w4LjQ2LTEuODM3bDQuODYyLDAuNjIxbDE0LjU2OCw3LjgzN2wxLjkyMi0wLjI1NWwzLjAwNi00LjA1OWw2Ljk0Ni0yLjYyN2w0LjgxMywwLjU3NGw2Ljc4NSwwLjc3MWw0LjIyMS0wLjY0Mmw0LjYxNSwxLjgzN2w1LjM1Miw0LjE2Nmw4LjAyLDkuNjE0bDIuNTI4LDQuODk1bDAuMDgyLDEuNjAxbC00Ljc5OSw4LjM1NGwxLjI2Nyw1LjU1NWwyLjg3MywxLjcyOWw0LjAyMy0wLjQ3bDIuODkxLTEuNzk0bDcuMDE1LDUuNTEybDMuMjcxLDQuMDU5bC0xLjM0OSw1LjM4N2wxLjkwNCwzLjYzMmwzLjUxNSwxLjY0NGwxLjIzMywwLjU1Nmw3LjE3Niw4Ljg2N2wyLjc5NSw2LjUxN2wzLjY0NiwzLjE4NGw0LjQ5OCwwLjYxN2w0LjA5Mi0xLjcyN2wxNy42MjMtMTkuODA5bDcuMDYyLTExLjA2N2w0LjU5OC00LjQ4NWwxMi40NTItNC43NjZsMS4zMTItMS42ODdsLTAuMTgtMS4wMjZsLTAuNDczLTIuNzEzbDIuNjI1LTMuNTY3bDUuMDkyLDIuNTg0bDQuNzMxLTAuNjE3bDQuNjI5LDEuMzI0bDMuODk2LTQuMTg4bDYuNjAzLTIuOGwzLjEzOC0zLjE2NWwwLjY4OC0yLjc3M2wtMS4xMDItNS4zNjVsMS41MTEtMi4ybDguMzYzLDAuMTNsMy40LTEuMzg5bC0yLjIyMS03LjE3OGwwLjgwNy0xLjkwMWwzLjA4OCwwLjg5NGw1LjQ4NCw0LjUzMmwyLjUxNC0xLjI2NGwyLjI4NC0zLjM5NWwtMS4zMTYtNC40ODlsMS40NzktMS4xOTVsMC41NDEtMC40NDhsMi45NzctMC4zNDFsOC4wNjItMTkuMjkybDQuNzMxLTYuNjA0bDEuNjkyLTUuMDIxbC0xLjgyMi00Ljg0OGwxLjM5Ni0zLjI3MmwxLjYyNC0wLjk2Mmw0LjEyNSw0LjQ2OGwxLjcyNSwwLjI3NmwxLjAzMy0yLjk1bC0wLjcyMS04Ljg0MmwzLjIwMi0yMi4zOTNsMi4wMi01LjEwN2w0Ljg5Ni0xMi4yODdsLTAuMjk0LTMuOTA4bDQuODI3LTguMTgybDUuNzgtNi41NDJsMy4zNTEtNi42NjNsOC45MzgtNi41MzlsNS4zNTQtNy45NjdsMTEuOTg5LTcuNzU4bDMuOTA5LTEuMTczbDMuNjgtMy4zMTJsMS40NzgtNC4zMTNsLTAuNjA5LTQuNDQ2bC0wLjEyOS0wLjg5N2wyLjY2MS0zLjcxOGwyLjU0Ni0xLjYyMmw3Ljg1MSwwLjEyOWwyLjY5My0xLjA5NWwxLjkzNy0zLjM5NWwtMS40NzgtMS42OWwtNC4zODYsMC4yOGwtMS42NC0xLjg1OWwtMy4yMi0xMC41OTdsMy4yODQtMTEuNTk5bDcuNDM4LTE2LjQ5N2wyLjcxMS0xLjYwNGw0LjAxMSwwLjQwNWw4LjM0MSwzLjg0N2wyLjEwMiwwLjEyOWwxLjQ5NS0xLjY2NWwwLjM2My0yLjg2OGwwLjYwNS00LjgyN2wtMS4wMzItNi4yMzdsMi4wMTktNC40NjhsMS43NTgtMC4yNTRsNi43ODUsMy43NTdsMC45ODItMS44OGwtMi4xNjYtMTYuNjg3bDAuNzM5LTMuODQzbDIuMDE5LTEuNDVsLTAuMDE1LTIuODQ2bC0zLjA3My00LjIzMWwtMC4zNDQtMy4xODNsMi4xNjktNy4xMTZMNjg5LjQ1NSwxOTMuODg4eiBNMzkyLjE1MSw2MDEuMDkybDIuMjgtNy4wOTVsLTAuNDI3LTEuNjIybC0zLjgwOS0wLjU1NmwtMi41MTQsMS40NWwtMC4zMjcsMi45NzVsLTIuMTM4LDEuMTNsLTAuNDU5LDEuOTAybDIuNzU5LDMuNjk2bDIuNTc4LDAuNjZMMzkyLjE1MSw2MDEuMDkyeiBNMzg4LjgxNSw2MTMuNjZsLTQuNzE2LTIuODg1bC0yLjYyNSwwLjM4NGwtMC42NiwyLjQzN2wxLjk5LDUuMjExbC0yLjI0OCwzLjA1OGwtMy4wOTMtMC43MDdsLTIuNzg5LTMuMTU4bC0yLjU5OC0wLjMwMmwtMC42MzgsMi40MzhsMS4wODMsMy41MjNsMC4yNDQsMC43NzFsLTAuOTgyLDIuMDdsLTIuMjE3LTAuNjYzbC0zLjkwOS0xMS40OTFsLTIuNTgyLTAuNjY0bC0xLjQ5MiwyLjAzMWwwLjQwOSwyLjEzNmwyLjUxNCwxLjkwMWwtNC45Niw1LjAyMWwwLjYyNSw0LjYxNWw2Ljg1LDEuNzk0bDAuNzg5LDEuNjIybC0zLjM4Niw0Ljc0NGwwLjQ0NCwxLjQzMmw4LjUzOS0wLjQwOWwwLjI4LDQuNDI1bDYuMTkzLTEuOTYzbDUuOTkzLDEuNzUxbDIuNDQ5LTAuMzg0bDAuNTg4LTEuMjJsLTMuNTI4LTUuNDY5bC0wLjA4My0xLjc3M2wzLjIwMy00Ljc2NmwtMi40NjUtMi42MDVsMC44NC0yLjYwOGwxLjQ3OC0xLjg1OGw0LjE3MSwwLjIzNmw0LjYzNC01LjU1NWwtMi4zMzUtMS45MDJMMzg4LjgxNSw2MTMuNjZ6XFxcIi8+XFxuXHRcXG5cdDxwYXRoIGlkPVxcXCJmbGV2ZXNcXFwiIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiI0ZGRkZGRlxcXCIgZD1cXFwiTTMwNC41MzQsMTIyLjI4MWMwLjMzNC0wLjQ0LDAuNTY0LTAuOTc5LDEuMDMzLTEuM2MwLjg1MS0xLjA5NiwxLjYzMS0yLjI0NywyLjUyOC0zLjMwNWMwLjM0My0wLjM5NywwLjk4My0wLjcyNSwxLjQ0OC0wLjMzNmMwLjA5NCwwLjM0LTAuNjI5LDAuNjM4LTAuMTYzLDAuOThjMC4xMzIsMC4yMzMsMC44NDUsMC4xNjcsMC4zNDQsMC4zMjFjLTAuNDYyLDAuMTg5LTAuOTMzLDAuNDA3LTEuMjQxLDAuODE1Yy0wLjkzMiwwLjk1NS0xLjQxOSwyLjIzMi0xLjgwMSwzLjQ4N2MtMC41MSwwLjQzMSwwLjUxNSwxLjE4NCwwLjY3NSwwLjQ2MmMwLjE1MS0wLjMxOCwwLjc4Mi0wLjA4NSwwLjM4OSwwLjIwM2MtMC4zOCwwLjQ1OC0wLjM1OCwxLjExNiwwLjExNiwxLjQ3MmMwLjIwOCwwLjQ5OC0wLjM3MiwwLjc3MS0wLjc1OSwwLjUzNGMtMC42NTQtMC4wODEtMC45ODYsMC41NTctMS40ODcsMC44MThjLTAuNTk2LDAuMzU0LTEuMDU2LTAuMjU4LTEuNTYzLTAuNDY2Yy0wLjQwMy0wLjE1Mi0wLjY5MS0wLjY4Ny0wLjEyOC0wLjgzNWMwLjM2OC0wLjEwNiwwLjIzNC0wLjYzNC0wLjE0Ni0wLjM4NmMtMC41MjYsMC4yNDUtMS4yMTUsMC4xNTItMS41NDMsMC42NjJjLTAuNTQzLDAuMzc4LTAuNTYzLTAuMzk0LTAuMzI2LTAuNzAxYzAuMzYyLTAuNjQ2LDEuMDYyLTAuOTc5LDEuNTY3LTEuNDk1QzMwMy44MjcsMTIyLjg5NywzMDQuMTczLDEyMi41NzksMzA0LjUzNCwxMjIuMjgxTDMwNC41MzQsMTIyLjI4MXogTTI4My43MDEsMTM4LjkwNmMxLjA0NC0wLjc5MiwyLjA4Ny0xLjU4MywzLjEzMS0yLjM3NWMwLjE5Mi0wLjI4MiwwLjg3NS0wLjU3NiwwLjk1Mi0wLjA4YzAuMDc5LDAuMjksMC4zMjUsMC42ODQsMC42NzcsMC41MzdjMC4xMjMtMC4yMiwwLjY2NywwLjAzOCwwLjI4NiwwLjEyNWMtMC4zMzMsMC4xNzctMC44NywwLjM0Mi0wLjg0LDAuODA4YzAuMDMxLDAuNDA2LDAuMjI5LDAuNzcsMC4zNzEsMS4xNDRjLTAuMjk4LDAuNTExLDAuMTI0LDEuMTIxLTAuMTUsMS42MzhjLTAuMTQyLDAuMzg1LTAuMTQyLDAuODY0LTAuNDg4LDEuMTRjLTAuNDIzLDAuMTMtMC45MzgtMC4xNy0xLjI5NywwLjE3NmMtMC4zOTgsMC4yNTktMC43OTgtMC4xMjgtMS4xODQtMC4yMTRjLTAuNTIyLTAuMTM3LTEuMDctMC4xMTItMS41OTktMC4wMzFjLTAuMzU2LTAuMjM0LTAuODMxLTAuMTM1LTEuMTI5LDAuMDVjLTAuNDc3LTAuMTEzLTAuNTMzLDAuNDgxLTAuNzgyLDAuNzEyYy0wLjA5My0wLjE1OCwwLjEzMS0wLjUwMywwLjIzOC0wLjY5N2MwLjE0NC0wLjI0MywwLjM2OS0wLjQyMywwLjUzNi0wLjY0NGMwLjE2NS0wLjM4MiwwLjM2Mi0wLjgyNSwwLjgyLTAuOWMwLjQwMy0wLjIxMiwwLjIyNS0wLjczNSwwLjEtMC45OTVDMjgzLjQzNiwxMzkuMTQ0LDI4My42MjksMTM5LjA3NiwyODMuNzAxLDEzOC45MDZMMjgzLjcwMSwxMzguOTA2eiBNMjk3LjU1LDgzLjg5NmMwLjc0NiwwLjI3NywxLjQ5MiwwLjU1NSwyLjIzNywwLjgzMmMwLjE1OSwxLjI3OSwxLjkzMiwwLjQ0NSwyLjE2MiwxLjcyNGMwLjYxMiwwLjg2NywxLjkxOSwwLjA3MSwyLjgwMSwwLjQ5OGMxLjA2MSwwLjEzNiwxLjQ3OCwxLjE1OCwyLjA4MywxLjg5MmMwLjY3OSwwLjg5NCwxLjM2MiwxLjc4NiwxLjk2OSwyLjczMWMxLjIzNy0wLjcwMywxLjU0MiwwLjU2OCwyLjA5NCwxLjQyNWMxLjIyOSwwLjkxNiwyLjQ4MiwxLjgwMiwzLjc4OCwyLjYwNWMwLjY4NSwwLjg2NSwxLjA3LDEuNzgsMi4zNTQsMS41MDljMC45MTMtMC4xODksMS43MS0wLjY2OCwyLjY4MS0wLjE5OGMxLjAwNi0wLjEzNiwyLjA3Mi0wLjM5NCwyLjEzMi0xLjUzN2MxLjE4LDAuMjc4LDIuMTU4LTAuMDY4LDIuOTY0LTAuOTU3YzEuMTk2LTAuMjM2LDEuMzI2LTEuMzQ5LDEuOTQ3LTIuMTVjMC40MzQtMC4yLDAuOTA3LTAuMzE1LDEuMzQ5LTAuNTA1IE0zMTUuNjQzLDk2Ljk0N2MtMC4zNjMsMC45NzctMC44MDYsMS45NjItMS41NjQsMi42OTljLTAuNDMzLDAuODExLDAuMzIsMi4yMDMtMC45MDgsMi41MjRjLTAuNzkyLDAuMjEtMS4xNzYsMC44NTctMS4zMzMsMS42MTljLTAuMDc0LDAuOTAyLTEuMjU5LDAuNzc5LTEuNTQyLDEuNDk1Yy0wLjI0MiwwLjYzMy0wLjQ4NCwxLjI2Ni0wLjcyNiwxLjg5OGMwLjM4OSwwLjg0NSwwLjQ0OSwxLjk2Mi0wLjU2NiwyLjM1NGMtMC41MzksMC44NjEtMC4xNDgsMS45MzctMC4xMzIsMi44N2MwLjI3OSwwLjc5MiwxLjI1MSwxLjE0LDEuNDIxLDEuOTc3Yy0wLjE0NCwwLjk4Ni0xLjM5MywxLjI0NS0xLjgsMi4wOTFjLTAuMTA0LDAuMjEzLTAuMTQzLDAuNDU0LTAuMTM3LDAuNjg5IE0zMDEuNDUsMTI1LjI4OGMtMS42NywxLjc0OS0zLjE5NywzLjYyNS00Ljc5Niw1LjQzOGMtMC43NDgsMC4yMTQtMS43MDgsMC4wNTktMi4yMywwLjc2MWMtMC40MDksMC4zNC0wLjcwNywwLjg1My0xLjE5NCwxLjA3M2MtMC43NTUsMC4xOTktMS41MSwwLjM5OC0yLjI2NSwwLjU5N2MtMC42MjMsMS4yMzctMS4yNjcsMi40NzItMi4wODIsMy41OTZjLTAuMTU4LDAuMDYtMC4zMTcsMC4xMTktMC40NzYsMC4xNzkgTTI4MS4zMTEsMTQzLjA3MmMtMC43MTcsMC44ODQtMS43ODQsMS40MDUtMi44NzUsMS42NmMtMC41MzIsMC40MDEsMC4xNTgsMS4yNS0wLjQ2MywxLjY1NWMtMC42NDIsMC44NzItMS40NjUsMS42MjUtMi40NTEsMi4wODFjLTEuMTMzLDAuODEtMi4yMDYsMS43OTEtMi43OSwzLjA4Yy0wLjIyOSwwLjM5NS0wLjQ1OCwwLjc5MS0wLjY5MSwxLjE4NCBNMTc4LjA4OCwzMTYuNjk0bC0wLjg2MSwwLjc2MWwtMC4zMzEtMC40MmwtMC40MDEtMC4wMmwtMC43MzMtMC40NDFsLTEuMTE0LTAuODI4bC0wLjQwMi0wLjAyMWwtMS4xNTQtMC4wNmwtMC43NTMtMC4wNTdsLTAuMzgyLTAuNDJsLTEuMTE1LTAuODEybC0xLjA5Ny0wLjg3OGwtMS4xMTUtMC44MTFsLTIuMjA5LTIuMDRsMC44NS0xLjUxMmwwLjc5NC0wLjcxMWwwLjktMS41MTJsMy4yMjEtMi41MjdsMS42MTYtMS4wNzFsMS45ODUtMS4wMzVsLTAuMzEyLTAuNzcxbC0xLjA5NS0xLjIyOWwtMC43NjctMC40NDFsLTEuMTM0LTAuNDc4bC0wLjM4Mi0wLjM3MWwtMS4xNzItMC4wNjFsLTEuNDQ5LTAuODk3bC0wLjQwMS0wLjAyMWwtMC43MTMtMC43OTFsLTEuMTE0LTAuODc4bC0xLjEzNi0wLjQxMWwtMS4xMzUtMC40NjFsLTAuNzgyLTAuNDU4bC0xLjU1Ny0wLjA4MWwtMC43MTQtMC44MDhsMC44My0xLjA5NWwwLjAyMS0wLjQxN2wwLjA0LTAuNzUxbDAuNDIyLTAuMzY0bDAuNDIyLTAuMzNsMC40MjItMC4zOGwtMC4zNDUtMC43NzFsLTAuMzgyLTAuNDM4bC0wLjQwMS0wLjAybC0wLjczMy0wLjQ0bC0wLjQwMS0wLjAybC0xLjE1NC0wLjA3N2wtMC4zMzItMC4zN2wtMC40MDEtMC4wMjFsLTAuNzczLDAuMzExbC0wLjQxOC0wLjAyMWwtMC4zODItMC4zNzFsLTAuNzE3LTAuNDU3bDAuMDIxLTAuNGwtMC4zNDItMS4xNzJsLTAuMjkxLTEuMTcxbDAuMDM3LTAuNGwwLjAyLTAuMzUxbDAuMzcxLTAuMzgxbDAuNDIyLTAuMzhsMi4wMDUtMS40MDJsMC44NDQtMC43NDRsMS42NDUtMi4yMjNsMC40MDEsMC4wMmwxLjE1NSwwLjA2bDEuMTU0LDAuMDc3bDAuMDItMC40MDFsMC4wMjEtMC4zNWwxLjIzMS0xLjA5MWwwLjQwMiwwLjAybDAuNDQxLTAuNzgxbDAuODExLTAuNzExbDAuNDIyLTAuMzYzbDAuMzkyLTAuNzMxbDAuNDIyLTAuMzhsMC43NzItMC4zMTFsMC40MDIsMC4wMmwwLjQwMSwwLjAybDAuMzg5LTAuMzhsMC4wMzktMC43NTFsMC40NDItMC43ODFsMC40NTktMC43M2wwLjMzOC0wLjM0OGwwLjA2Ny0wLjAxNmwwLjg1LTEuNDk2bC0wLjMwOC0xLjE3MWwtMC4zNDUtMC44MDVsMC4wMi0wLjM4NGwwLjA2MS0xLjE1MmwwLjA1OC0wLjc2OGwwLjA0LTAuNzY4bC0wLjM2NS0wLjQybC0wLjM4NS0wLjAybC0wLjQwNSwwLjM2NGwtMC4zODUtMC4wMmwtMC4zNDUtMC43ODhsLTAuMzg1LTAuMDJsMC4wMi0wLjM4NGwtMC43NDktMC40NGwtMC4zNjUtMC40MDRsLTAuMzg1LTAuMDJsLTAuODA3LDAuMzQ0bC0wLjM0OS0wLjQwNGwtMC40MDEtMC4wMzdsLTAuNzctMC4wNGwtMC4zODYtMC4wMjFsLTAuNDA0LDAuMzY0bC0wLjM4Ni0wLjAyMWwtMC40MDQsMC4zNjRsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAzN2wwLjAyLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybC0wLjM4NS0wLjAybDAuMDItMC4zODRsLTAuMzg1LTAuMDIxbDAuMDItMC4zODRsLTAuMzg1LTAuMDJsLTAuMzY0LTAuNDJsMC4zODUsMC4wMzdsLTAuMzY1LTAuNDJsLTAuMzQ1LTAuNzg4bC0wLjc0OS0wLjQyNGwtMC4zODYtMC4wMmwtMC4zNjQtMC40MjFsLTAuMzQ1LTAuNzg4bDAuMDItMC4zODRsMC4wMjEtMC4zODRsMC4wMzYtMC4zODRsLTAuMzY0LTAuNDA0bDAuMDItMC4zODRsLTAuMzY0LTAuNDIxbDAuNDI1LTAuNzQ4bC0wLjM2NS0wLjQwNGwxLjEzNSwwLjQ2bDEuMTkxLTAuMzIzbDAuMDIxLTAuMzg0bDAuODMtMS4xMTFsLTEuNDk5LTAuODY1bDAuMDQtMC43NjhsMC4wMzYtMC4zODRsMy4yMTctMi4xNDNsMi40MjctMS43ODJsMC4wNC0wLjc2OGwwLjQyMi0wLjM2NGwwLjQ4NS0xLjkxNmwwLjAyMS0wLjM4NGwwLjQ0MS0wLjc0OGwwLjE1Ny0yLjY4N2wyLjgzMi0yLjE2M2wwLjM4NiwwLjAybDEuMTU0LDAuMDc3bDAuMzg1LDAuMDJsMC43NSwwLjQyNGwwLjM4NSwwLjAybDEuMTcyLDAuMDc3bDAuNzUsMC40MjRsMC4zODUsMC4wMjFsMS41NCwwLjA5N2wwLjM4NSwwLjAybDAuMDItMC4zODRsMC4wMjEtMC4zODRsMC4xMzctMi4zMmwtMC4zNDUtMC43ODhsMS41NzctMC4zMDNsMC4zODUsMC4wMmwwLjc3LDAuMDU3bDAuMzY1LDAuNDA0bDAuMzY1LDAuNDA0bDEuOTA0LDAuNTAxbDEuNTU3LDAuMDgxbDAuMzY0LDAuNDJsMC43NSwwLjQyNGwwLjM4NSwwLjAybDEuNTYxLTAuMzA0bDAuNzQ5LDAuNDRsMC4zNDYsMC43ODhsMi45NzksMi4wOTdsMC43NSwwLjQ0bDAuNzUsMC40MjRsMS41MiwwLjQ4bDEuNTIsMC40NjRsMS4xNzIsMC4wNzdsMS4xOTQtMC43MDhsMS4xMzUsMC40NDRsMC43NzEsMC4wNTdsMC44NDctMS4xMTFsMC43OS0wLjM0NGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjM4NiwwLjAybDAuNzQ5LDAuNDQxbC0xLjAzNy0xLjk5N2wtMC43MS0xLjIwOGwtMC4zNDUtMC43ODhsMC44MDctMC4zNDRsMS41OC0wLjY3MWwwLjQwNS0wLjM2NGwxLjE5MS0wLjMyM3YtMC4wMTdsMS45ODUtMS4wMzRsMi4wMDItMS4wMzVsMS41OTctMC42ODhsMC43MjksMC44MjVsMC43NywwLjA0bDIuMzEsMC4xMzdsMS4xNzIsMC4wNjFsMC4zNjUsMC40MDRsMC43MTMsMC44MjVsMy4wNTYsMC45NDVsMS4xMzUsMC40NDRsMy44MSwxLjAwMWwyLjMyNiwwLjEzN2wxLjE1NSwwLjA2bDAuNzcsMC4wNDFsMS45MjIsMC41MDFsMC43NywwLjA0bDIuMjg5LDAuNTIxbDEuMTU1LDAuMDZsLTAuMDIsMC4zODRsMi4zMDYsMC41MjFsMS41NCwwLjA5N2wwLjc5LTAuMzQ0bDAuNDA1LTAuMzY0bDEuMjMxLTEuMDkxbDEuNjE3LTEuMDcxbDAuODEtMC43MTFsMC44MTEtMC43MjhsMC40MjItMC4zNjNsMC40MDQtMC4zNjRsMi4wMjItMS40MzVsMC4zODUsMC4wMmwwLjgxMS0wLjcyOGwwLjgyNi0wLjcyOGwyLjM1MS0wLjYzbDEuNTc2LTAuMzA0bDEuMTE0LDAuODQ1bDAuNzcxLDAuMDRsMS41MzksMC4wOTdsMC4zODYsMC4wMmwwLjAzNi0wLjM4NGwtMC42ODktMS41OTJsLTAuMTQ2LTQuMjZsMC4wMi0wLjM4NGwtMC41NzItMy41MTJsLTAuNTUyLTMuODk2bC0wLjU5Mi0zLjEyOGwwLjAyLTAuMzg0bDAuMDM3LTAuMzg0bC0wLjg3Ny01LjA2N2wwLjM4NSwwLjAyMWwxLjY1Ny0xLjgzOWwtMC4yODgtMS41NzJsLTEuNDM5LTJsLTEuMDc0LTEuNjEybDAuOTY4LTMuNDMybDAuOTA3LTIuMjYzbDEuMTkxLTAuMzIzbDAuODg4LTEuODc5bDAuODUxLTEuNDk1bDAuODQ3LTEuMTEybDEuNTYtMC4yODdsMC44NjctMS40OTZsMi4zMSwwLjEyMWwwLjgyNy0wLjcxMWwwLjQ0NS0xLjE0OGwwLjQ2Mi0xLjEzMWwwLjQwNS0wLjM2NGwwLjAyLTAuMzg0bDAuNDI2LTAuNzQ4bDAuNDIxLTAuMzY0bDAuMDIxLTAuMzg0bDAuNzktMC4zNDRsMC40MDUtMC4zNjRsMC4wMi0wLjM4NGwwLjQyMi0wLjM2NGwwLjM4NSwwLjAzN2wwLjM4NSwwLjAyMWwwLjgzMS0xLjExMmwwLjgyNi0wLjcyOGwwLjQwNS0wLjM2NGwwLjQwNS0wLjM2NGwwLjQwNS0wLjM2NGwwLjgwNy0wLjM0NGwwLjc5LTAuMzQ0bDAuNzcsMC4wNTdsMC43OS0wLjM0NGwwLjc1LDAuNDI0bDAuMzg1LDAuMDJsMC43ODcsMC4wNGwwLjM4NSwwLjAzN2wwLjQ0NS0xLjE0OGwyLjc3MS0wLjk5NWwwLjAyLTAuMzg0bC0wLjM4NS0wLjAybDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC4wMjEtMC4zODRsMTMuMjQ2LTcuNzQ5bDAuNDA0LTAuMzY0bDAuMDIxLTAuMzg0bC0wLjM4NS0wLjAybC0wLjM2NS0wLjQwNGwtMC4zODUtMC4wMmwtMC4zNjUtMC40MjFsLTAuMzQ1LTAuNzg4bC0wLjM2NC0wLjQwNGwtMC43NS0wLjQyNGwwLjAyLTAuMzg0bC0wLjMyNy0wLjgwNGwtMC4zNjUtMC40MDRsMC4wMi0wLjM4NGwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMmwtMC4zODUtMC4wMzdsMC4wMi0wLjM4NGwtMC4zODUtMC4wMjFsLTAuMzY1LTAuNDA0bC0wLjM4NS0wLjAybC0wLjM2NC0wLjQwNGwtMC4zODYtMC4wMmwtMC40MDEtMC4wMzdsLTAuMzQ4LTAuNDA0bC0wLjQwMi0wLjAybC0wLjM4NS0wLjAybDAuMDIxLTAuMzg0bDAuMDM2LTAuMzg0bDAuNzktMC4zNDRsMC4wMjEtMC4zODRsMC40MjUtMC43NDhsMC44MDctMC4zNDNsMC40MjYtMC43NDhsMC4wMi0wLjM4NGwwLjg0OC0xLjExMWwwLjA0LTAuNzY4bDAuNDA0LTAuMzY0bDAuMDIxLTAuMzg0bDAuMDIxLTAuMzg0bDAuNDgxLTEuNTMybDAuNDA1LTAuMzQ3bDAuNDA1LTAuMzY0bDAuNDIyLTAuMzYzbDAuMDItMC4zODRsMC4wMjEtMC40bDAuNDA0LTAuMzQ3bDAuNDA1LTAuMzY0bDAuMDIxLTAuNDAxbDAuNDQxLTAuNzQ4bDAuODExLTAuNzExbDAuNzktMC4zNDRsLTAuNjUyLTEuOTc2bC0wLjcxLTEuMTkybDIuMDQyLTEuODE5bDAuMzY0LDAuNDA0bDAuNzMsMC44MDhsMC43NDksMC40NGwwLjM2NSwwLjQwNGwtMC4wMiwwLjM4NGwwLjM4NSwwLjAybC0wLjAyMSwwLjM4NGwtMC4wMiwwLjM4NGwwLjM4NSwwLjAybDAuMzY0LDAuNDIxbC0wLjAyLDAuMzg0bC0wLjAzNywwLjM4NGwwLjQwMiwwLjAyMWwwLjM4NSwwLjAybDAuNzUsMC40MjRsLTAuMDIxLDAuNGwwLjY5MiwxLjE5MmwtMC4wMiwwLjM4NGwtMC4wMjEsMC4zODRsLTAuMDIsMC4zODRsMC4zODUsMC4wMjFsLTAuMDIsMC4zODRsMC4zODUsMC4wMzdsMC4zNjQsMC40MDRsMC43NzEsMC4wNGwwLjM4NSwwLjAybDEuMTc1LTAuMzA3bDIuMzQ3LTAuMjYzbDAuNDgxLTEuNTE1bDAuMzg1LDAuMDJsMS41OC0wLjY3MWwwLjM4NSwwLjAybDAuODA4LTAuMzQ0bDAuMzg1LDAuMDJsMC4zODUsMC4wMmwwLjgzLTEuMTExbDAuNDIyLTAuMzY0bDAuNDI1LTAuNzQ4bDAuNDA1LTAuMzY0bDAuNzktMC4zNDRsMC40MjItMC4zNjNsMC43OS0wLjMyN2wyLjAwMi0xLjA1MWwxLjY5Ny0yLjYwN2wwLjQ0NS0xLjEzMWwwLjQ0MS0wLjc0OGwxLjE5NS0wLjcwOGwwLjc1LDAuNDI0bDEuMTkxLTAuMzA3bDEuNTgtMC42ODhsMC40NjItMS4xMzFsMS42MDEtMS4wNzFsMC40MjEtMC4zNjRsMS4yMzUtMS40NzZsMC4zODYsMC4wMjFsMC40NDEtMC43NDhsMS42LTEuMDU1bDIuMDQzLTEuODE5bDAuODA3LTAuMzQ0bDAuNDI1LTAuNzQ4bDAuMDYxLTEuMTUybDAuNDYyLTEuMTMxbDAuNzktMC4zNDRsMC44MjctMC43MjhsMS41Ni0wLjMwNGwyLjEwMy0yLjk3MWwxLjU1NywwLjA5N2wxLjIxNS0xLjA5MWwwLjg0Ny0xLjExMWwwLjc3MSwwLjA0bDEuNTk2LTAuNjcxbDAuNDI2LTAuNzQ4bDIuODEyLTEuNzc5bDAuODQ4LTEuMTExbDAuODEtMC43MjhsMC4wMjEtMC4zODRsMi40MjctMS43ODJsMS4xOTEtMC4zMjRsMC40MjUtMC43NDhsNS4wOTktMC44NzRsMS45MjUsMC4xMTdsMS45NDQtMC4yODRsMi42OTEsMC41NDJsMC43NywwLjA1N2wxLjA3OSwxLjU5NmwxLjE5NC0wLjY5MWwxLjIxMi0wLjcwOGwxLjE5NS0wLjcwOGwwLjQ2Mi0xLjEzMWwyLjMzLTAuMjQ3bDMuMTc3LTEuMzc1bDIuMjg2LDAuOTA1bDEuOTg0LTEuMDM1bDEuMjcyLTEuODU5bDAuNzcsMC4wNGwxLjU5OC0wLjY4N2wxLjE3NS0wLjMwN2w0LjM4OC0yLjA2NmwyLjM4Ny0xLjAzMWwzLjE1Ny0wLjk3NWwwLjc3LDAuMDRsMS4yMzItMS4wOTFsMC43OS0wLjMyN2wxLjU3OS0wLjY4OGwwLjQyMi0wLjM2NGwxLjIxNi0xLjA5MWwyLjM0Ny0wLjI0N2wyLjE1MSwyLjgyNGw0LjAzNCw0LjA5M2wwLjcyOSwwLjgyNWwxLjQ1OSwxLjYzMmwyLjg4MiwzLjYzMmwxLjIxMi0wLjY5bDAuNDI1LTAuNzQ4bDIuMDIyLTEuNDM1bDIuMzg3LTEuMDMxbDIuNDI3LTEuNzgybDIuMDIxLTEuNDM2bDAuMzY1LDAuNDA0bDAuNzI5LDAuODI0bDEuMTM1LDAuNDQ0bDEuMDk1LDEuMjI5bDEuMTE0LDAuODI4bDAuNzktMC4zMjdsMC4zODUsMC4wMmwxLjE1NSwwLjA2bDEuODQ1LDEuNjUybDEuMTE0LDAuODQ1bDEuNjU3LTEuODM5bDAuODg3LTEuODc5bDAuMDYxLTEuMTY4bDAuMDIxLTAuMzg0bDAuMDItMC4zODRsLTAuMzY1LTAuNDA0bDAuMDM3LTAuMzg0bDAuMDIxLTAuMzg0bDAuMDItMC4zODRsMC4zODUsMC4wMmwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuNDQyLTAuNzQ4bDAuMDItMC4zODRsMC4wNDEtMC43ODVsMC4wNjEtMS4xNTFsMC4zODUsMC4wMmwwLjAzNi0wLjM4NGwwLjA0MS0wLjc2OGwtMC4zNjUtMC40MDRsLTAuMzQ1LTAuNzg4bC0wLjI0OC0yLjM0bDAuNDg2LTEuODk5bC0wLjYxMy0yLjc0NGwtMC4yNjgtMS45NTZsMC40MDUtMC4zNjRsMC4zODUsMC4wMzdsMC4zODUsMC4wMmwwLjAyMS0wLjM4NGwwLjM4NSwwLjAybDAuNDIyLTAuMzY0bDAuMzg1LDAuMDJsMC4wNC0wLjc2OGwwLjQwNS0wLjM2NGwyLjYzNSwxLjMwOWwwLjQwNS0wLjM2NGwwLjg2Ni0xLjQ5NWwwLjAyMS0wLjM4NGwwLjAyLTAuMzg0bDAuNDYyLTEuMTMxbDAuMDIxLTAuMzg0bDAuMzg1LDAuMDJsMC43NzEsMC4wNGwwLjM4NSwwLjAybDAuMzg1LDAuMDJsMC4wMjEtMC4zODRsMC40MDEsMC4wMmwwLjQwNS0wLjM2NGwwLjQyNS0wLjc0OGwwLjQyNS0wLjc0OGwwLjQyMi0wLjM2M2wwLjgzLTEuMTEybDEuMjEyLTAuNjlsMC44My0xLjExMmwwLjAyMS0wLjRsMS4yNTItMS40NThsMC40MDUtMC4zNjRsMC4wMi0wLjRsMC44MjctMC43MTFsMC43OS0wLjM0NGwxLjI3MS0xLjg1OWwwLjg0OC0xLjExMWwwLjc5LTAuMzQ0bDEuNTgtMC42ODhsMC44MDctMC4zNDMgTTQ4MC44ODgsMTE1LjgyNGwtMi4xMzksMC41NTlsLTIuNzYyLDAuNTYybC0wLjc3LTAuMDUzbC0wLjM4NC0wLjAyN2wtMC40MjgsMC4zNTZsLTAuMDI3LDAuMzg0bC0wLjQxMSwwLjM1NmwtMC40MTEsMC4zNTdsLTAuNzk2LDAuMzNsLTAuNzg1LTAuMDdsLTAuMDI3LDAuMzgzbC0wLjc5NiwwLjMzbC0yLjgxNSwxLjM0NmwtMS4xOCwwLjI4NmwtMS42MDksMC42NTlsLTAuNDExLDAuMzU3bC0yLjQ4NCwyLjE0bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4NGwxLjA3MywxLjIzbDAuMzU3LDAuNDExbDIuMTAzLDIuODc4bDEuNDU3LDEuMjc0bC0wLjQzOCwwLjc0bC0wLjc2OS0wLjA3bC0xLjYwOSwwLjY1OWwtMS42MTgsMS4wNDNsLTAuODEyLDAuMzI5bC0xLjIwNywwLjY3bC0wLjgzOSwwLjcxM2wtMC44MjMsMC43MTNsLTEuMjUxLDEuMDY5bC0wLjgyMiwwLjcxM2wtMC40MTEsMC4zNTdsLTAuNDExLDAuMzU2bC0xLjI1MSwxLjA3bC0xLjI1MSwxLjA1M2wtMC44NDksMS4wOTdsLTAuODQsMC43MTNsLTAuMDI2LDAuMzgzbC0wLjQxMiwwLjM1N2wtMC4wNTQsMC43ODRsLTAuODY2LDEuMDk2bC0wLjAyNiwwLjM4NGwtMC40MzgsMC43NGwtMC4wMjYsMC4zODNsLTAuMDQ0LDAuMzgzbC0wLjUxOSwxLjg5MWwtMC4wMjYsMC4zODRsMC4yODcsMS4xOTNsLTAuMDU0LDAuNzY3bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsLTAuNDU1LDAuNzM5bC0wLjgyMiwwLjcxNGwtMC40MzgsMC43NGwtMC4wMjYsMC4zODNsLTAuNDI5LDAuMzU2bC0wLjAyNiwwLjM4NGwtMC4wMjYsMC4zODNsLTAuODUsMS4wOTdsLTAuNDI5LDAuMzU2bC0wLjA1MywwLjc2N2wtMC40NjUsMS4xMjRsLTAuMzg1LTAuMDI3bC0wLjQyOSwwLjM1NmwtMS4xOCwwLjMwM2wtMC40MTIsMC4zNTZsLTAuMzg0LTAuMDI2bC0wLjgzOSwwLjY5NmwtMC44MjMsMC43MTRsLTAuNDM4LDAuNzRsLTAuNDI4LDAuMzU2bC0wLjA1NCwwLjc2N2wtMC4wNTQsMC43ODRsLTAuMDk3LDEuMTVsLTAuMDI3LDAuMzgzbC0wLjQ5MSwxLjUwN2wtMC40MjksMC4zNTZsLTAuNDExLDAuMzU2bC0wLjM4NS0wLjAyN2wtMC44MjIsMC43MTNsLTAuODEyLDAuMzNsLTAuNDExLDAuMzU3bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjQxMSwwLjM1N2wtMC44OTQsMS40NzlsLTEuNTExLTAuNTA3bC0yLjY1NC0wLjk3MmwtMS44OTYtMC41MThsLTAuNzY5LTAuMDdsMC4wMjctMC4zODNsLTEuMjM0LDEuMDdsLTMuMjcxLDIuMDg1bC0yLjQzMSwxLjM1NmwtMy4yODEsMi40N2wtMi40NzQsMS43MzlsLTEuOTc3LDAuNjMzbC0xLjI1MSwxLjA2OWwtMS41NjQsMC4yNmwtMC40MTEsMC4zNTdsLTAuODEyLDAuMzNsLTAuODUsMS4wOTdsLTEuMzU4LDIuNjA0bC0wLjA0MywwLjM4M2wwLjM1NywwLjQxMWwtMC4wMjYsMC4zODNsLTAuMDI3LDAuNGwwLjc0MiwwLjQzN2wtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjQ4MSwxLjEyM2wtMC4wNTQsMC43NjdsLTAuNDY2LDEuMTRsLTAuMDQzLDAuMzgzbDEuNzYyLDIuNDUxbC0wLjAyNywwLjM4NGwxLjM3NywyLjQyNWwwLjY5OSwwLjgybC0wLjgyMywwLjcxM2wtMS4yMDcsMC42ODdsLTEuMjI0LDAuNjg3bC0xLjIwNywwLjY3bC0wLjgxMiwwLjMyOWwtMC4wMjYsMC4zODRsMC42ODgsMS4yMjFsMC4zNTgsMC40MWwtMC4wOTgsMS4xNWwtMC40MzgsMC43NGwtMS4yNTEsMS4wN2wtMC40MzgsMC43NGwtMC40OTEsMS41MDdsLTAuMDQ0LDAuMzgzbC0wLjAyNywwLjRsLTAuMDI2LDAuMzg0bC0wLjc5NiwwLjMxM2wwLjM1NywwLjQyN2wtMC4zODQtMC4wMjdsLTEuNjYyLDEuNDFsLTAuNTA5LDEuNTIzbC0wLjQxMSwwLjM0bC0wLjkyLDEuODhsLTAuODUsMS4wOTdsLTEuNzE2LDIuMTkzbC0wLjgzOSwwLjY5NmwtMC43OTYsMC4zM2wtMC4zODUtMC4wMjZsLTAuNzk2LDAuMzNsLTAuMzMxLTAuNzkzbC0wLjA5OCwxLjE1bC0wLjA1MywwLjc2N2wtMC4wMjcsMC4zODRsLTAuNDY1LDEuMTI0bC0wLjQ1NSwwLjc0bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuODQsMC43MTNsLTAuNzk2LDAuMzNsLTAuODIyLDAuNzEzbC0wLjY4OC0xLjIyMWwwLjc5Ni0wLjMxM2wtMC4zNTctMC40MjdsMS42MDctMC42NDNsLTAuMjc2LTEuNTc4bC0wLjc3LTAuMDUzbC0xLjU5MiwwLjY2bDAuMzQxLDAuNDFsLTEuNjE4LDEuMDQzbC0wLjc5NSwwLjMxM2wtNC4wODYtMi42MjlsLTAuNDExLDAuMzU2bC0wLjM4NS0wLjAyN2wtMC4zNTctMC40MWwtMC4wMjcsMC4zODRsLTAuNzk2LDAuMzNsLTAuMDI2LDAuMzg0bC0wLjM4NS0wLjAyN2wtMC44MTIsMC4zM2wwLjAyNy0wLjM4NGwwLjM4NCwwLjAyN2wtMC43NDEtMC40NTRsLTAuNjk5LTAuODJsLTEuMS0wLjg2NGwtMC43MTYtMC44MjFsLTEuNDU3LTEuMjc0bC0wLjcxNi0wLjgyMWwtMS4xLTAuODY0bC0wLjcxNi0wLjgybC0wLjY2MS0xLjYwNGwtMC4yODctMS4xNzdsLTAuNjYyLTEuNjA0bC0wLjcxNS0wLjgyMWwtMS42MzYsMS4wNDNsLTEuOTQ5LDAuMjMzbC0xLjIyNCwwLjY4NmwtMC44NSwxLjA5N2wtMS4xOTcsMC4zMDNsLTAuNDExLDAuMzU2bC0xLjIwNywwLjY3bC0wLjg0LDAuNzEzbC0wLjM4NC0wLjAyN2wtMC40MTIsMC4zNTdsLTAuMzg0LTAuMDI3bC0wLjQzOCwwLjc0bC0wLjc0Mi0wLjQzN2wtMC4zNTctMC40MjdsLTAuMzg1LTAuMDI3bC0wLjM1Ny0wLjQxbC0wLjM1OC0wLjQxbC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODNsLTAuMDcsMC43NjdsLTAuNDExLDAuMzU2bC0wLjgyMiwwLjcxM2wtMC40NTUsMC43NGwtMC40MTEsMC4zNTdsLTAuMDI3LDAuMzgzbC0wLjc5NiwwLjMzbC0wLjQyOCwwLjM1NmwtMC4zODUtMC4wMjdsMC43MTYsMC44MmwtMC44NzYsMS40OGwwLjY0NSwxLjYwNGwtMC4wMjYsMC4zODRsLTAuNzQyLTAuNDU0bC0wLjgyMywwLjcxM2wwLjcxNiwwLjgzN2wwLjM1NywwLjQxbC0xLjE5NywwLjMwM2wtMS41NjQsMC4yNmwtMC43Ny0wLjA1M2wtMC43ODUtMC4wNTRsMS4wNDYsMS42MTRsLTAuODIyLDAuNzEzbC0xLjc0MiwyLjU3N2wtMC40ODIsMS4xMjRsMC4zNTcsMC40MjdsLTAuMzg0LTAuMDQzbDAuMzU3LDAuNDI3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODNsLTAuMDQzLDAuMzgzbC0wLjgyMywwLjcxM2wwLjcxNiwwLjgybC0wLjg2NiwxLjA5N2wtMC44NSwxLjA5N2wtMC43NDItMC40MzdsLTAuNDU1LDAuNzRsLTEuODY4LTAuOTE3bC0wLjM1OC0wLjQxbC0wLjQxMSwwLjM1NmwtMC4zMy0wLjgxbC0wLjc5NiwwLjMzbC0wLjc5NiwwLjMzbC0wLjM4NS0wLjAyN2wtMC44MTIsMC4zM2wtMC43MTYtMC44MzdsLTIuODQyLDEuNzI5bC0wLjM1OC0wLjQxbC0wLjM1Ny0wLjQyN2wtMC43MTUtMC44MjFsLTAuMzQyLTAuNDFsLTEuMDcyLTEuMjQ4bC0wLjcxNi0wLjgybC0wLjcxNS0wLjgzN2wtMC43Ny0wLjA1M2wtMS4xNTMtMC4wODFsLTEuMTk3LDAuMjg2bC0wLjM4NC0wLjAyN2wtMC4zODUtMC4wMjdsLTEuNTM4LTAuMTA3bC0xLjE5NywwLjI4NmwtMC43OTYsMC4zM2wtMS4yMDcsMC42ODdsMC4zMTQsMC43OTNsLTEuMjA3LDAuNjg3bC0wLjg0LDAuNzEzbC0wLjAyNiwwLjM4NGwtMC4wNTQsMC43NjdsLTAuMzg1LTAuMDI2bC0wLjAyNiwwLjM4M2wtMS4yMjUsMC42ODZsLTAuNDM4LDAuNzRsLTAuODIzLDAuNzEzbC0yLjExNiwyLjE2N2wtMC4zODUtMC4wNDRsLTIuMDczLDEuNzgzbC0wLjgyMiwwLjcxM2wtMC43OTYsMC4zM2wtMC40MjksMC4zNTZsLTAuMzg1LTAuMDI2bC0yLjQwMywwLjk3M2wxLjQwMywyLjA0MWwwLjM1OCwwLjQxbDAuMjc2LDEuNTc4bC0wLjAyNiwwLjM4M2wtMS41NTUtMC4xMjRsLTAuNzY5LTAuMDU0bC0wLjc3LTAuMDU0bC0xLjkyMi0wLjE1bC0wLjQwMS0wLjAyN2wtMS4xNTQtMC4wOGwtMS41MzctMC4xMjRsLTAuMDU0LDAuNzY3bC0wLjEyNCwxLjU1bDAuMTUzLDMuMDk0bC0wLjAyNSw1LjQyOGwtMC4xMDYsMS41MzRsMC4zMDQsMS4xNzdsMS4xNTMsMC4wOTdsLTAuMDU0LDAuNzY3bC0xLjI1LDEuMDdsMC43MTUsMC44MmwwLjc0MiwwLjQ1NGwxLjQ4NCwwLjg3NGwtMS42MDgsMC42NmwtNC40MDcsMS45ODlsMS41NCw1LjE1MWwyLjgwOSw0LjA2NmwwLjM4NCwwLjA0M2wxLjY5MSwzLjIxOGwwLjQxMS0wLjM1NmwwLjA0NC0wLjM4M2wwLjA1NC0wLjc2N2wwLjA1NC0wLjc4M2wwLjAyNy0wLjM4NGwwLjM4NCwwLjA0M2wwLjM4NSwwLjAyN2wwLjM4NCwwLjAyN2wwLjM1OCwwLjQxbC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsMC4zODUsMC4wMjZsMC40NTUtMC43MzlsMC40MTEtMC4zNTdsMC40MzgtMC43NGwwLjQxMS0wLjM1NmwwLjAyNy0wLjM4NGwwLjQwMSwwLjAyN2wwLjAyNi0wLjM4M2wwLjM1NywwLjQxbC0wLjA0NCwwLjM5OWwtMC4wMjYsMC4zODRsMC43ODYsMC4wNTRsMC4zODUsMC4wMjdsLTAuMDQ0LDAuMzgzbDAuNDAxLDAuMDI3bC0wLjA0NCwwLjM4M2wtMC4wNTQsMC43NjdsMC4zODUsMC4wNDNsMC43NDIsMC40MzdsMC4zODUsMC4wMjdsMS4xNywwLjA4MWwwLjM4NSwwLjA0NGwwLjA1NC0wLjc4NGwwLjc5NS0wLjMxM2wwLjAyNy0wLjM4M2wwLjM4NSwwLjAyN2wwLjM1NywwLjQxbC0wLjQxMSwwLjM1NmwtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzg0bC0wLjAyNywwLjM4M2wtMC4wMjYsMC4zODRsMC4zODUsMC4wMjdsMC40MTEtMC4zNTdsMC4zODUsMC4wMjdsMC4zMDQsMS4xOTRsMC4zODQsMC4wMjdsMC4zODUsMC4wMjZsMC4zODUsMC4wMjdsMC4zODUsMC4wMjdsLTAuNTksMi42NzRsLTAuOTE5LDEuODYzbDAuODEyLTAuMzI5bDAuMzQxLDAuNDFsMC4zNTcsMC40MWwwLjcxNiwwLjgzN2wxLjAyLDEuOTk4bDAuNzE1LDAuODM3bDAuNjQ2LDEuNTg3bDAuMjc2LDEuNTc3bDEuMTU0LDAuMDgxbC0wLjAyNywwLjM4M2wtMC4yMDQsMi43MDFsLTAuNzctMC4wNTNsMC41MTEsMy41MjFsLTMuMDkzLTAuMjMxbC0xLjE4LDAuMjg3bC0xLjk0OSwwLjI1bC0wLjM4NS0wLjAyN2wwLjI4NywxLjE3N2wtMC4wMjYsMC4zODNsLTAuMDI3LDAuMzg0bDAuMzMxLDAuNzkzbDAuMzI2LDYuNjM5bC00LjcwOSw1Ljg0IE01NzUuMyw0MDEuMDI0bC0wLjM4Ni0wLjAyMWwtMS4xNTQtMC4wNjNsLTQuOTM1LTEuODQ4bC04LjMxNi0zLjIwN2wtMC4zNjMtMC40MjJsLTMuODAyLTEuMzgzbC0xLjUxOC0wLjQ4NmwtMi4yNjYtMC45MTJsLTguNjk3LTMuNjEzbC02LjAwOC0zLjA4bC0zLjc0MS0yLjE2NmwtMS40OTctMC44NTRsMS4yNC0xLjQ3MWw1LjEzNi03LjgwM2wtNy43ODEtNS44OWwtMC43MjgtMC44MjdsLTAuMzQyLTAuNzg5bC0wLjY4OC0xLjE5M2wtMC43MDUtMS4yMTFsLTEuMDQ4LTJsLTEuMDA5LTIuMzg1bDAuMDQzLTAuNzY4bC0wLjM0Mi0wLjc4OWwwLjIxLTMuNDcxbC0wLjc5MiwwLjM0MmwtMC43NDgtMC40MjhsLTAuNzI3LTAuODI2bC0wLjM4NS0wLjAyMWwtMS41NC0wLjA4NmwtMS45ODMsMC42NDRsLTAuNzkxLDAuMzQxbC0wLjc5MiwwLjM0MmwtNC4yNS0wLjI3bC0zLjMzNS0yLjUxMmwwLjAyMS0wLjM4NWwwLjA0My0wLjc2OGwtMC4zODUtMC4wMzdsMC4wMjEtMC4zODVsMC40NjYtMS4xMjlsMC4wNDMtMC43NjhsMC4wNDMtMC43NjhsLTAuMzQzLTAuNzg5bC0wLjc0OC0wLjQ0M2wtMC44MzQsMS4xMDdsLTEuNDc1LTEuMjM2bC0xLjEzNC0wLjQ2NWwtMC4zNDItMC43ODlsMS4yMzUtMS4wODdsLTIuOTI5LTIuODkybC0xLjYyLDEuMDY2bC0wLjc3LTAuMDQzbC0wLjM2My0wLjQwNmwtMC4zNDMtMC44MDVsLTEuMTExLTAuODMybC0yLjg0LDIuMTM2bDEuNDMzLDIuMDIxbC0wLjkxNSwyLjI2bC0wLjM2My0wLjQwNWwtMC4zNjMtMC40MDRsLTAuMzY0LTAuNDA2bC0xLjc5NS0yLjQyNmwtMC4zODUtMC4wMjFsLTAuMzYzLTAuNDIybC0wLjM2NC0wLjQwNmwtMS40NzUtMS4yNTNsMC40MjMtMC4zNjJsMC44MTItMC43MDhsLTAuMzYzLTAuNDIybC0wLjM2My0wLjQwNWwtMC4zNjMtMC40MDVsLTAuMzg1LTAuMDIxbC0wLjgxMywwLjcyNWwtMS4xNzEtMC4wODFsLTEuNTYxLDAuMjk5bDAuMDY0LTEuMTUybDAuMDIxLTAuMzgzbC0wLjI2MS0xLjk1N2wtMC43Ny0wLjA0M2wtMS41MzktMC4xMDNsLTAuNDAxLTAuMDIxbC0yLjg5MS0zLjI3NGwtMi42NTEtMC45MzZsLTQuMTQ0LTIuMTcxbC0wLjM4NS0wLjAzOGwtMS45MDItMC40OWwtMC43Ny0wLjA2MWwtMC4zODYtMC4wMjFsLTAuMzYzLTAuNDA1bC0wLjc5MSwwLjM0MWwtMC40MjMsMC4zNjJsLTAuMzg1LTAuMDIxbC0wLjgxMiwwLjcyNWwtMS4xOTMsMC4zMDNsLTAuMzg1LTAuMDIxbDAuNzQ4LDAuNDQzbC0wLjAyMSwwLjM4NWwtMC44NTUsMS40OTJsLTAuNDQ0LDAuNzQ2bC0xLjM0MywzLjAwNmwtMC40NDksMS4xM2wtMC40NDQsMC43NDZsLTAuODM0LDEuMTA4bC0wLjAyMSwwLjM4NGwtMC40MjMsMC4zNjJsLTAuNDA2LDAuMzYybC0wLjAyMSwwLjM4NGwtMC40ODcsMS41MTRsLTAuNDI4LDAuNzQ2bC0wLjAyMSwwLjM4NWwtMC4wMjEsMC40bDYuMTgzLDYuNTU1bDAuMzYzLDAuNDA0bDEuNDc2LDEuMjU0bDEuNDUzLDEuNjM5bDEuMDkxLDEuMjE1bDEuMDczLDEuMjMybDIuMjI0LDEuNjhsLTAuNDcxLDEuNTE1bC0wLjQ0NCwwLjc0NWwtMC44MzUsMS4xMDlsLTEuMTExLTAuODMybC0wLjc5MSwwLjM0MmwtMS4yMzYsMS4wODZsLTEuNTE4LTAuNDg2bC0yLjYzLTEuMzE3bC0xLjUxOC0wLjQ4NmwtMi4yNjItMS4yOTZsLTMuNDQyLTAuNTk0bC0wLjc3LTAuMDQzbC0wLjM2My0wLjQyMmwtMS45Mi0wLjQ5MWwtMi45ODUsNC40NTZsLTAuODEyLDAuNzI1bC0wLjQyOCwwLjc0NmwtMS43NDQsMi45ODRsLTAuMDIxLDAuMzg1bC0wLjAyMSwwLjM4M2wtMS4yNzgsMS44NTVsLTEuMjc4LDEuODU0bC0xLjcwNywyLjYwMmwtMC40NDksMS4xM2wtMC40MjMsMC4zNjJsLTAuMDIxLDAuMzg0bC0wLjgxMiwwLjcyNmwtMC40MDYsMC4zNjFsLTAuNDY2LDEuMTMxbC0xLjQ3Ni0xLjI1NGwtMi4yMjMtMS42ODFsLTEuNjQzLDEuNDQ5bC0xLjYyNSwxLjQ1bC0yLjQxMiwxLjQwNmwtMy4yMiwxLjczbC0zLjE1OSwwLjk2M2wtMC4zODYtMC4wMjFsLTEuMTExLTAuODQ4bC0zLjE2LDAuOThsLTEuNDc1LTEuMjU0bC0xLjgzOS0xLjY2bC0yLjkwNCwzLjMwNWwtMi4wNDgsMS44MTJsLTIuMDY5LDIuMTc5bC0wLjM2My0wLjQwNWwtMS41MzUtMC40N2wtMC4zNjMtMC40MjJsLTAuMzg1LTAuMDIxbC0xLjEzNC0wLjQ0OGwtMC42ODgtMS4yMTFsLTIuNDEyLDEuNDA2bC0wLjgyOSwwLjcyNWwtMi40MzMsMS43NzRsLTMuNDU5LTAuNTk0bC0wLjc0OS0wLjQyN2wtMS41MTgtMC40ODZsLTEuMTM0LTAuNDQ3bC0zLjg2NS0wLjI0OGwtMy40NDItMC41OTNsLTEuOTgzLDAuNjZsLTEuODktNy4wODdsLTAuMTUzLTMuODc2bDAuMDIxLTAuMzg0bDAuNTA5LTEuODk3bDIuMzQ4LTAuMjM4bDAuNzcsMC4wNDJsMC43NzEsMC4wNDNsMC40MDYtMC4zNjFsMi40MzMtMS43NzRsMC40NDQtMC43NDZsMS43NS0zLjM4NmwxLjc4Ny0zLjc1MmwtMC43Ny0wLjA0M2wtMS40OTctMC44NjlsLTEuOTE5LTAuNTA4bC0zLjAzNi0wLjk1NWwyLjExMi0yLjk2NGwtMC43NDgtMC40MjdsLTAuMzYzLTAuNDA1bC0xLjc3OS0yLjQyN2wwLjgzNC0xLjEwOGwwLjQ4Ny0xLjUzbDAuODM0LTEuMTA4bDAuODk1LTEuODc2bDEuMy0yLjIzOGwxLjMyMS0yLjYyM2wtMS4xMTEtMC44MzJsLTQuMDg0LTIuOTU1bC0wLjcxLTAuODI2bC0xLjE0OS0wLjQ0OWwtMS4xMzQtMC40NjVsLTAuNzQ4LTAuNDI2bC0zLjA1OC0wLjU3MmwtMS4xMzMtMC40NjVsLTAuNzctMC4wNDNsLTAuNzQ5LTAuNDI2bC0xLjE0OS0wLjQ2NWwtMS41MTktMC40N2wtMS4yMTksMS4wN2wtMS4yMzUsMS4wODdsLTEuNjYzLDEuODM0bC0yLjI4OC0wLjUyOWwwLjMwNCwxLjE4OWwtMC40NzEsMS41MTRsLTAuNDA2LDAuMzYybC0xLjI3OCwxLjg1NGwtMC43NzEtMC4wNDNsLTEuMTkyLDAuMzAzbC0wLjM4NS0wLjAyMWwtMS4yMzUsMS4wODhsLTEuNTgzLDAuNjgybC0yLjI4Ny0wLjUyOWwtMS40NzYtMS4yNTRsLTEuMTkyLDAuMzJsLTAuMzA0LTEuMTg5bC0wLjM2My0wLjQwNmwtMC4zODYtMC4wMjFsLTAuNzg2LTAuMDQzbC0wLjc3LTAuMDQybC0wLjQwNiwwLjM0NmwtMC40NDksMS4xNDZsLTAuNDAxLTAuMDM4bC0xLjE3NywwLjMxOWwtMC4zODUtMC4wMjFsLTAuMzYzLTAuNDA2bC0wLjM2My0wLjQwNGwtMC43MjctMC44MjhsLTAuNzI4LTAuODExbC0xLjUzOS0wLjEwMmwtMC40MDYsMC4zNjJsLTAuMzYzLTAuNDA1bC0yLjI4OC0wLjUyOWwtMC43ODYtMC4wNDNsLTEuMTc3LDAuMzJsLTEuODU5LTEuMjc1bC0wLjM4NS0wLjAyMWwtMS44MTctMi4wNDNsLTEuOTAyLTAuNTA4bC0xLjg4Mi0wLjg5MWwtMC4zODUtMC4wMjFsLTEuODgyLTAuODkybC0xLjUzNC0wLjQ4NmwtMi4yNDUtMS4yOTdsMC40NDQtMC43NDVsLTAuMzYzLTAuNDA2bC0yLjk3Mi0yLjEwNmwtMS44Ni0xLjI3NWwtNS4xOTQtMy44MDRsLTIuMjQ1LTEuMjk3bC0wLjcyNy0wLjgxMWwtMi4yMjQtMS42OGwtNi4wNDYtMi42OTZsLTAuODEyLDAuNzI1bC0xLjE3NiwwLjMybC0xLjIzNiwxLjA4N2wtMy4yNjIsMi40OTlsLTEuNjI2LDEuNDQ5bC0wLjgwOCwwLjM0MWwtMS4yMTksMS4wODdsLTEuMTMzLTAuNDY1bC0yLjkyMSwzLjMwNWwwLjM2MywwLjQwNWwtMy4yMDMsMS43NDdsMS4xMTIsMC44MzJsLTEuMjc5LDEuODU1bC0wLjQyMywwLjM2MWwtMS42MDQsMS4wNjZsLTAuNzQ4LTAuNDI3bC00Ljk2OSw1LjA5OWwtMS4zMjIsMi42MjNsLTAuODUxLDEuMTA4bC0wLjQ0OSwxLjEzbC0wLjQ0NCwwLjc0NmwtMC44MzQsMS4xMDlsLTAuODUxLDEuMTA3bC0wLjQyOCwwLjc0NmwtMC44NzMsMS41MWwtNi40MDUsMy40NjFsLTEuMTkzLDAuMzJsLTEuOTY3LDAuNjZsLTAuNDA2LDAuMzQ2bC0xLjk2MywwLjI3N2wtMi4zMywwLjIzOGwtMC40MDItMC4wMjEgTTU1Mi41OTUsMTc4LjI1NWwtMC4xMjktMS41NjJsMC4wNDgsMi43MTJsLTAuNDU0LDAuNzRsLTAuNDM4LDAuNzRsLTAuNDExLDAuMzU2bC0wLjQ4MSwxLjEyNGwtMC4xMDcsMS41MzRsLTAuMDcxLDAuNzgzbC0wLjEzNCwxLjkxN2wtMC4wNywwLjc2N2wtMC4wNTMsMC43NjdsLTAuMDI3LDAuMzgzbC0wLjQzOCwwLjc0bC0xLjc0MywyLjU3N2wtMC4wNywwLjc4M2wtMC40MzgsMC43NGwtMC41MDgsMS41MDdsLTAuMDU0LDAuNzY3bC0wLjg1LDEuMDk3bC0wLjA0NCwwLjM4M2wtMC4zODUtMC4wMjdsLTAuNDY1LDEuMTI0bC0wLjA1MywwLjc2N2wtMC4wMjcsMC4zODNsMC4zODUsMC4wMjdsMC42NzIsMS4yMmwtMC40MzgsMC43NGwtMC4wOCwxLjE1bDAuMzg1LDAuMDI3bC0wLjg0LDAuNzEzbDQuNTUsMS41MDVsLTAuMDI2LDAuMzg0bDAuNjcyLDEuMjJsMS4wMiwxLjk5OGwxLjI3Ny0xLjQ1M2wwLjg1LTEuMDk3bDIuODM1LDMuNjk5bDEuMDcyLDEuMjQ4bDMuMjAyLDMuNzI2bC0yLjkyMiwyLjg2M2wtMi41MjgsMi41MjNsLTIuOTIzLDIuODhsLTAuMDI3LDAuMzg0bC0xLjYzNSwxLjA0MmwtMC40MTIsMC4zNTdsLTMuMjcsMi4wNjlsLTEuNDU4LTEuMjc0bC0wLjc0Mi0wLjQzN2wtMS44MTQtMS42ODVsLTQuMDY5LTIuNjI5bC0yLjg5OC0yLjUzMmwtMC4wNywwLjc2N2wtMC45MiwxLjg2M2wtMC40MzgsMC43NGwtMC40NjUsMS4xMjRsLTAuMDI2LDAuMzg0bC0wLjA0NCwwLjM4M2wtMC4xMzQsMS45MzRsLTAuNDExLDAuMzU3bC0wLjA0NCwwLjM4M2wtMC40MTEsMC4zNTdsLTAuMDI3LDAuMzgzbC0wLjM4NC0wLjAyNmwtMy4xNzQsMC45MTlsLTAuMzg0LTAuMDI3bC0wLjAyNywwLjM4M2wtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzg0bC0wLjA0NCwwLjM4M2wwLjMzMSwwLjc5NGwtMC4wMjYsMC4zODNsLTAuMDU0LDAuNzY3bC0wLjAyNiwwLjM4M2wtMC4wNzEsMC43ODNsLTAuNDExLDAuMzU3bC0wLjAyNiwwLjM4M2wtMC40MTEsMC4zNTdsLTAuNDEyLDAuMzU2bC0yLjA3MiwxLjc2N2wtMC40MjksMC4zNTZsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1N2wtMC40MTEsMC4zNTZsLTAuNDgyLDEuMTIzbC0wLjAyNiwwLjM4NGwtMC40NjUsMS4xMjRsLTAuNzQyLTAuNDM3bC0zLjc4Mi0xLjQzNmwtMi41OTIsMy42NzRsLTMuMDksNC43OTZsLTIuNTM4LDIuOTA3bC0wLjk3NCwyLjYzbC0xLjcxNiwyLjE5M2wtMC41MDksMS41MDdsLTAuNDExLDAuMzU2bC0xLjMzMSwyLjIybDEuNDU4LDEuMjc0bC0wLjQzOCwwLjc0bDAuNjcyLDEuMjAzbC0wLjAyNiwwLjM4NGwtMC40MzgsMC43NTdsLTAuMDI3LDAuMzgzbC0wLjQxMSwwLjM1N2wtMC40ODEsMS4xMjNsMC43NjksMC4wNTRsMS4xMDEsMC44NDdsMS41MTEsMC41MDdsLTEuOTAxLDkuOTIybC0wLjA5NywxLjE1bC0wLjA1NCwwLjc2N2wwLjMzMSwwLjc5M2wtMS4zMzEsMi4yMzdsLTEuNTY1LDAuMjZsLTEuMTk3LDAuMzAzbC0yLjgxNCwxLjMyOWwtMC4xMDgsMS41NTFsLTAuMDcsMC43NjdsLTAuMDI2LDAuMzgzbDAuMzU3LDAuNDFsMC4zNTgsMC40MTFsMS4xMjYsMC40OGwwLjM4NSwwLjAyN2wwLjc3LDAuMDUzbDAuMzU3LDAuNDFsMC43NDIsMC40NTRsMC43MTUsMC44MmwtMC4wMjYsMC4zODNsMC43MTYsMC44MjFsMC4zNTcsMC40MjdsLTAuMDI3LDAuMzg0bC0wLjAyNiwwLjM4M2wtMC4zODUtMC4wMjdsLTAuMDI2LDAuMzgzbC0wLjgxMywwLjMzbC0wLjM4NC0wLjAyN2wtMC4wMjcsMC4zODRsLTAuMzg0LTAuMDQzbC0wLjQxMSwwLjM1NmwtMC40MTEsMC4zNTdsLTAuMDQ0LDAuMzgzbC0wLjM4NS0wLjAyNmwtMC4wMjYsMC4zODNsLTAuMzg1LTAuMDI3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODRsLTAuMDI2LDAuMzgzbDAuMzg1LDAuMDI3bC0wLjAyNywwLjRsMC4zNTcsMC40MWwwLjI4OCwxLjE3N2wtMC4wMjcsMC4zODNsLTAuNDExLDAuMzU3bC0wLjQxMSwwLjM1NmwtMC4wMjcsMC4zODRsLTAuNDAxLTAuMDI3bC0wLjQzOCwwLjc0bC0wLjc5NiwwLjMzbC0wLjQxMSwwLjM1N2wtMC40NTUsMC43NGwtMC4wMjYsMC4zODNsLTAuNDM4LDAuNzRsLTAuNDExLDAuMzU3bC0wLjgxMiwwLjMzbC0wLjQxMSwwLjM1NmwwLjY4OCwxLjIwNGwwLjc0MiwwLjQ1NGwtMC4wMjcsMC4zODNsMS40MzIsMS42NDFsMS42MSw0LjM4NWwwLjMxNCwwLjc5M2wxLjk0MSw1LjE3OWwtMC44NSwxLjA5N2wyLjEyOSwyLjQ3OGwtMC40MTEsMC4zNTZsLTQuNjMxLTAuMzM4bC0xLjYzNSwxLjAyNmwtMC40MTEsMC4zNTZsLTEuMjM0LDEuMDdsLTAuODM5LDAuNzEzbC0xLjIzNCwxLjA3bC0wLjQyOCwwLjM1NmwtMC40MzgsMC43NGwtMC43OTYsMC4zM2wtMS40ODQtMC44OTFsLTAuNzQyLTAuNDM4bC0xLjQ4NC0wLjg5MWwtMC43MTYtMC44MmwtMC43NjktMC4wN2wtMC41MDksMS41MjNsLTIuODEyLDYuMzU2bC0xLjEzMSwyLjc4NyBNMjM0LjU5MiwyMzkuNTRsLTAuMDU4LDAuNzdsLTAuMTE2LDEuNTM5bC0xLjIxNiwwLjY4M2wtMS4yMTUsMC42ODNsLTEuNjAyLDAuNjUzbC0xLjIxNSwwLjY4M2wtMS42MzEsMS4wMzlsLTIuMDE2LDEuMDA5bC0wLjgzLDAuNzEybC0yLjAxNiwxLjAwOWwtMC40MTUsMC4zNTZsLTEuMjE1LDAuNjgzbC0wLjQxNSwwLjM1NWwtMC40MTUsMC4zNTZsLTAuNDE1LDAuMzU2bC0xLjE4NiwwLjI5OGwtMS4yMTYsMC42ODNsLTAuODAxLDAuMzI3bC0wLjQxNCwwLjM1NmwwLjMyNywwLjc5OGwwLjM1NywwLjQxNGwwLjI5OSwxLjE4NGwwLjM1NiwwLjQxNGwwLjM1NiwwLjQxNGwwLjc0MywwLjQ0M2wwLjM1NiwwLjQxNGwtMC4wMjgsMC4zODVsLTAuMDg3LDEuMTU0bDAuMzI3LDAuNzk4bC0wLjAyOCwwLjM4NWwxLjA3LDEuMjQxbDAuMzU2LDAuNDE0bC0wLjAyOCwwLjM4NWwtMC4wMjksMC4zODVsMC4yOTksMS4xODRsMC4zODYsMC4wMjlsMC4zNTcsMC40MTRsMC4zNTYsMC40MTRsMC4zODYsMC4wMjlsLTAuMDU4LDAuNzdsLTAuMDU4LDAuNzdsMC4zODYsMC4wMjlsLTAuMDI5LDAuMzg1bDAuMzU3LDAuNDE0bDAuMzI3LDAuNzk4bDAuMzI4LDAuNzk5bDAuMzU2LDAuNDE0bDAuMzU3LDAuNDE0bDAuMzU2LDAuNDE0bC0wLjAyOCwwLjM4NWwwLjMyNywwLjc5OGwtMC40NzMsMS4xMjVsMC4yNzEsMS41NjhsLTAuMDI5LDAuMzg1bDAuMzU2LDAuNDE0bDAuMzU3LDAuNDE0bDAuMzg2LDAuMDI5bDAuNzE0LDAuODI3bDAuMzU2LDAuNDE0bC0wLjA1OSwwLjc3bDAuMzg3LDAuMDI5bDAuMjk5LDEuMTgzbC0wLjAyOSwwLjM4NWwtMC4wMjgsMC4zODVsMC43MTMsMC44MjhsMC4zNTcsMC40MTRsLTAuMDI5LDAuMzg1bDAuMzI4LDAuNzk4bC0wLjAyOSwwLjM4NWwtMC4wODcsMS4xNTRsLTAuMDI4LDAuMzg1bC0wLjA1OCwwLjc3bC0wLjA1OSwwLjc3bC0wLjQ0MywwLjc0MWwtMC40MTUsMC4zNTVsLTAuMDU5LDAuNzdsLTAuMDI4LDAuMzg1bC0wLjAyOSwwLjM4NWwtMC4wMjksMC4zODVsLTAuMDI4LDAuMzg1bC0wLjAyOSwwLjM4NWwtMC4wMjgsMC4zODVsLTAuNDE1LDAuMzU2bC0wLjAyOSwwLjM4NWwwLjI5OSwxLjE4M2wtMC4wNTgsMC43N2wwLjgyOS0wLjcxMWwxLjE4Ny0wLjI5OGwwLjgwMS0wLjMyN2wwLjgwMS0wLjMyN2wwLjQxNS0wLjM1NmwwLjgtMC4zMjdsMC4zODYsMC4wMjlsMC43NDMsMC40NDNsMS40NTYsMS4yN2wwLjM4NiwwLjAyOWwxLjEsMC44NTZsMC43NDMsMC40NDNsMC40NzMtMS4xMjVsMi4zMDYtNC44NTdsLTAuMzI4LTAuNzk4bDAuNzcxLDAuMDU4bDEuMjE2LTAuNjgzbDEuNTcyLTAuMjY5bDguNDIxLTMuNjI0bDEuNTcxLTAuMjY5bDAuODAxLTAuMzI3bDQuNDE4LTEuOTlsMS4xNTcsMC4wODdsMS41NDQsMC4xMTZsMy41MDEtMC4xMjRsMy4xMTUtMC4xNTNsMy44ODctMC4wOTVsMy44ODgtMC4wOTVsMi43MjktMC4xODJsMS41NDMsMC4xMTZsMC43MDUtNC4yMDNsMC40NDMtMC43NDFsMC4wMjktMC4zODVsMC44MDEtMC4zMjdsMS4xODctMC4yOThsMS4xODYtMC4yOThsMS45ODctMC42MjVsMi4zNzMtMC41OTZsMC4zODYsMC4wMjlsMC40MTUtMC4zNTVsMS41NzItMC4yNjlsMi4wMTYtMS4wMDlsMS42MDQtMC43NTNsMi45MTIsMi41NDFcXFwiLz5cXG5cXG5cdDxnIGlkPVxcXCJmb290c3RlcHNcXFwiPlxcblx0XHQ8ZyBpZD1cXFwiZHViLW1hdGVvXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwibWF0ZW8tYmVsdWdhXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjI5LjUsMTQxLjk0MWMyNC4xOTUtNDguMzM2LDQxLjI4Ni0yMi4yMTIsNDQuMjI0LTIyLjIxMmM4LjE1NSwwLDE0LjU2NS0xMC4yNzMsMzQuOTQtOS4yNjRjMjAuODQ2LDEuMDM0LDQ1LjQ3Nyw1LjUsNTEuODUxLDI4Ljg2OWM3LjIwNiwyNi40MjItMzIuNDY4LDM4LjAxMi0zNy43MTEsMjAuMDM3Yy0yLjM0MS04LjAyNSw4LjIwMy0xMy43MjksMTQuNzMzLTE0LjE0M2MyOS43ODgtMS44ODcsNTMuNTgxLTMuNDU4LDc4LjM2NSwxMy41NTJjNDEuMzA0LDI4LjM0OCwzNC4yMDgsNzkuMjA0LDQ3LjcyOCwxMjIuNTU5YzEuNzY4LDUuNjY4LDUuNzEsMTAuNjQzLDEwLjAxOCwxNC43MjljMjAuMzYxLDE5LjMxOCw5MS4yNjIsMTUuNjgyLDEwMi41MjQtMTYuNDk4YzEyLjcyLTM2LjM0My01MS40MjgtNTAuMDk3LTcwLjcwNy0yMi4zODhjLTEuMzEzLDEuODg3LTIuMDM0LDQuMjA1LTIuMzU4LDYuNDhjLTIuMDQxLDE0LjM0OC00LjEzLDI4Ljc0LTQuNzEzLDQzLjIyMWMtMS4zODMsMzQuMzQ0LDAuMTAyLDY4Ljc2Mi0xLjE3OCwxMDMuMTEyYy0wLjQ1NywxMi4yNzktMjAuMjE1LDE3LjkzMi0yOC44NzIsMTEuMTk3Yy03LjYzOC01Ljk0MywxLjYxNS0xMy45MDQsNi40ODEtMTYuMTE1YzEwLjk3Ni00Ljk5MiwyNi4wMzUtMC45MDYsMzIuOTk4LDguODM4YzcuODYxLDExLjAwNC0wLjg3MSwyMi4zNDItNS44OTUsMzEuMjI5Yy0xOS4yMSwzMy45OC0zNS43MDUsMzguODg5LTc0LjA2NCwzOC44ODlcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYmVsdWdhLWlzYW11XFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiaXNhbXUtY2FwYXNcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMTguNDY4LDM3Mi40MDFjMCwzLjYzLTIwLjUzOCwxOS43MDctMjIuNDcxLDIyLjYyNGMtMTAuNTk5LDE1Ljk5LTIxLjQ4NywzOS4wNjYtOC43MzQsNTcuMjE0YzE3LjU2NiwyNC45OTksNjYuNTIxLDIxLjM4NCw5MC40MDQsMTkuNjUzYzEzLjIxLTAuOTU3LDI4LjU1MS0xMS45MzMsMzAuNTcyLTI1Ljc2OWM3LjkyMy01NC4yMzQtNDIuNjcyLTY0LjU4My03OS4wNDktMzQuOTM4Yy0xNS43OTEsMTIuODY2LTE1Ljc4NSwzNS44ODctMTIuNjY2LDU0LjE1NGMxLjEwOSw2LjQ5OSw2LjI0NiwxMS42NDgsMTAuMDQ1LDE3LjAzNWMzMC4yNzUsNDIuOTI3LDUxLjk2NCwzOS43NjUsMTA1LjcwOSwzNi45OTFjOC42ODctMC40NDksMjMuMTM2LTYuOTQ5LDI1LjMyNy0xNy4wMzFjNC41MzktMjAuODc3LTEzLjIwMy0yMy43OTMtMjkuNDMyLTIwLjk2NmMtMjAuMTg4LDMuNTE2LTE5LjE5MSwzOS4wMzgtMTMuMTAxLDUxLjU3OWM3LjIxOCwxNC44NjEsMjkuNzM1LDE2LjMzMiw0Mi43OTYsMTcuNDY5YzI3LjM2NCwyLjM3OSw2MS41NDUsNi43MTksNzYuOTI2LTIxLjExN2MxNS4zNjgtMjcuODE0LTM0LjU1OC00MC40MzEtMjUuNzY1LTQuMzY1YzUuNDEsMjIuMTg5LDYzLjkyLDE2LjcxOSw3MS42MTktMy40OTRjMS41MS0zLjk2MSwzLjAyLTguMDE2LDMuNDk0LTEyLjIyOWMwLjctNi4yMjEsMC44NTEtMTIuNTc2LDAtMTguNzc5Yy0wLjc1My01LjQ4My0xMy4wODMtNy40MTktMTUuMTUyLTIuMDMxYy03LjU4OCwxOS43NTIsMjAuMDM1LDEzLjUzNywzMC4yODYtMi43NzRjMi42MTgtNC4xNjYsNS42MTQtMjYuMjA5LDUuNjE0LTI2LjIwOVxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJjYXBhcy1wZWxvdGFzXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTMzLjExNCwzNTAuMjU3Yzc3LjcyMiwzNi44MDksNDUuMTY5LTkuODYzLDc5LjAxMiwwYzcuNzk4LDIuMjcyLDMuOTM3LDE2LjM0OS04LjkyNSwyNy42NTVjLTEyLjg2NCwxMS4zMDYtMC43NzYsMTkuMTYzLDYuMzU2LDE5LjcyMWM4LjQ4NSwwLjY2MywwLjY3NywyMS40NzksOS40MjQsMjEuNzM1czE2LjA2NS0zLjcyNSwyMi41MDEtMTMuNjcxYzYuNDM1LTkuOTQ2LDguNjc3LTEyLjc4OSwzLjg3NC0xNy43MjZjLTEwLjY3Mi0xMC45NjktMC4yMDYtMjEuMzE3LDAtMjEuMzY2YzEyLjI5MS0yLjkxNi0xMy4xODQtMjAuNjQtMTkuMzk4LTI4LjQwOGMtMTAuNzE2LTEzLjM5OC00MC43MDctNC41MTgtNTAuNzU5LDUuNTM2Yy0xOS4zOSwxOS4zOTIsMTMuNzIzLDUzLjg5OS0xNy40NDMsNzMuNDUzYy0zMS4xNjYsMTkuNTUzLDQuMjQsMzMuNTUzLTQ0LjUzMywzMy41NTNjLTE5Ljk5OSwwLTM5LjcyNi0yNy40NjUtMjYuMzUxLTQ2LjI4N2MzLjU3NS01LjAzMSwxMi44MjUtMTYuMzc0LDE2LjUyNi0yMS4zMTJjNy4yNS05LjY3NiwyLjEwNS05LjYwNiwxNS4xMDItMTEuMDdcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwicGVsb3Rhcy1tYXJ0YVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEzNy40NDUsMzI1LjA2YzUuNDA3LDEuMDAyLDEwLjUsMi41MDMsMTYuMDU3LDEuNjQ1YzkuMTk3LTEuNDIxLDEwLjEyMy0xNC41NjIsOC42MTUtMjAuOTJjLTIuOTQ4LTEyLjQyMy0xOS4zMzMtMTguMzg2LTMwLjU2My0xMy44NDRjLTQuOTk4LDIuMDIxLTkuMjA3LDYuNTU3LTExLjM4MiwxMS40OWMtMi4yMTEsNS4wMTQsMC4yNjgsMTEuMDY0LTAuOTIzLDE2LjQxM2MtMC45OTgsNC40ODItNC4xNzksOC4yMjgtNS41MzgsMTIuNjE1Yy0wLjc5MywyLjU2LDMuODksOC4yMDEsMS4xMjUsMTIuMjk3Yy0yLjY4OSwzLjk4NC0xMi44MTMsNi40MzEtMTQuNTMyLDguMzkyYy0zLjI0MiwzLjY5Nyw0LjI3LDUuMDgyLDQuMjcsNS4wODJjMC41MTgsMS4wOCwxOS42ODEtMC4xMTUsMjIuMjU5LTUuMDgyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcIm1hcnRhLWtvYmFyYWhcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJrb2JhcmFoLWR1YlxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwMi43MSwzMDcuNzIxYy0xMC42MTYtMC41NC0zNi40NzktMTQuMTg4LTQyLjIwNS0yMy43M2MtNi4yNzItMTAuNDUzLDEyLjc3Ni0yOS4zOTMsMjIuNjc2LTMxLjU1YzQuOTk1LTEuMDg4LDEwLjA3My0yLjAyMSwxNS4xODItMi4xNjljMjAuMzEzLTAuNTkyLDYyLjEwMS03LjAxMiw2MC45MjcsMjYuMjI2Yy0wLjA2NSwxLjg1MS0xLjI0NiwzLjYyNy0yLjU2NCw0LjkyOWMtOS41OTksOS40ODMtMTkuMjkxLDE4Ljk2My0yOS45NjksMjcuMjEyYy0yOC4wNjcsMjEuNjc5LTEzLjMxNSw5LjU2OC0zNC45MDEsMTUuMzhjLTkuNzkzLDIuNjM4LTE4Ljk5OCw3LjQ4NC0yOC45ODMsOS4yNjhjLTguNzE2LDEuNTU2LTM5LjMxNi0wLjUyMy01Mi4wNTcsNy4wOTljLTMuNTU1LDIuMTI3LTYuNTQsNS41MDgtOC4yODEsOS4yNjhjLTEuMzI3LDIuODY1LTEuMjc5LDYuNDM0LTAuMzk1LDkuNDY1YzIuOTYsMTAuMTUsMTEuOTYzLDE0LjE5NywyMS4wOTksMTcuNzQ2YzQ1LjY5MiwxNy43NTQsNTIuNDE5LTExLjY2Niw4MC43ODUtNDAuMzYyXFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImR1Yi1wYXJhZGlzZVxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcInJldHVybi10by1iZWdpblxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdDwvZz5cXG5cdDwvZz5cXG5cXG5cdDxnIGlkPVxcXCJtYXAtZG90c1xcXCIgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoNzguMDAwMDAwLCAxNDAuMDAwMDAwKVxcXCI+XFxuXHRcdDxnIGlkPVxcXCJkZWlhXFxcIj5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0xMzIuNSwyNmMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMxMzAuNTY3LDI2LDEzMi41LDI2elxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJtYXRlb1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMTQ5LjUsOGMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41UzE1MS40MzMsMSwxNDkuNSwxYy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzE0Ny41NjcsOCwxNDkuNSw4elxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJlcy10cmVuY1xcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImlzYW11XFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMzI4LjUsMzIwYzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzMyNi41NjcsMzIwLDMyOC41LDMyMHpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiYmVsdWdhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJlcy10cmVuY1xcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMzQ2LjUsMzQ3YzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzM0NC41NjcsMzQ3LDM0Ni41LDM0N3pcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiYXJlbGx1ZlxcXCI+XFxuXHRcdFx0PHBhdGggaWQ9XFxcImNhcGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk00My41LDIzM2MxLjkzMywwLDMuNS0xLjU2NiwzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjYtMy41LDMuNVM0MS41NjcsMjMzLDQzLjUsMjMzelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJwZWxvdGFzXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk01MC41LDIxMmMxLjkzMywwLDMuNS0xLjU2NiwzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjYtMy41LDMuNVM0OC41NjcsMjEyLDUwLjUsMjEyelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJtYXJ0YVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNTcuNSwxODZjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNWMwLTEuOTMzLTEuNTY3LTMuNS0zLjUtMy41Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41QzU0LDE4NC40MzQsNTUuNTY3LDE4Niw1Ny41LDE4NnpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwia29iYXJhaFxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNMjkuNSwxOTVjMS45MzMsMCwzLjUtMS41NjYsMy41LTMuNXMtMS41NjctMy41LTMuNS0zLjVjLTEuOTM0LDAtMy41LDEuNTY2LTMuNSwzLjVTMjcuNTY3LDE5NSwyOS41LDE5NXpcXFwiLz5cXG5cdFx0XHQ8cGF0aCBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk0yOS41LDE3MmMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41cy0xLjU2Ny0zLjUtMy41LTMuNWMtMS45MzQsMC0zLjUsMS41NjctMy41LDMuNVMyNy41NjcsMTcyLDI5LjUsMTcyelxcXCIvPlxcblx0XHRcdDxwYXRoIGlkPVxcXCJwYXJhZGlzZVxcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiYXJlbGx1ZlxcXCIgZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBkPVxcXCJNNC41LDE4M2MxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41UzYuNDMzLDE3Niw0LjUsMTc2Yy0xLjkzNCwwLTMuNSwxLjU2Ny0zLjUsMy41UzIuNTY3LDE4Myw0LjUsMTgzelxcXCIvPlxcblx0XHQ8L2c+XFxuXHQ8L2c+XFxuXFxuPC9zdmc+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGlkPSdwYWdlcy1jb250YWluZXInPlxcblx0PGRpdiBpZD0ncGFnZS1hJz48L2Rpdj5cXG5cdDxkaXYgaWQ9J3BhZ2UtYic+PC9kaXY+XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtYXAtd3JhcHBlclxcXCI+XFxuXHRcXG48L2Rpdj5cdFwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJpbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbiAgICBcdFxuY2xhc3MgR2xvYmFsRXZlbnRzIHtcblx0aW5pdCgpIHtcblx0XHRkb20uZXZlbnQub24od2luZG93LCAncmVzaXplJywgdGhpcy5yZXNpemUpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdEFwcEFjdGlvbnMud2luZG93UmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2xvYmFsRXZlbnRzXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmNsYXNzIFByZWxvYWRlciAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSlcblx0XHR0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgdGhpcy5vbk1hbmlmZXN0TG9hZENvbXBsZXRlZCwgdGhpcylcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjayA9IHVuZGVmaW5lZFxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzID0gW11cblx0fVxuXHRsb2FkKG1hbmlmZXN0LCBvbkxvYWRlZCkge1xuXG5cdFx0aWYodGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbSA9IHRoaXMuYWxsTWFuaWZlc3RzW2ldXG5cdFx0XHRcdGlmKG0ubGVuZ3RoID09IG1hbmlmZXN0Lmxlbmd0aCAmJiBtWzBdLmlkID09IG1hbmlmZXN0WzBdLmlkICYmIG1bbS5sZW5ndGgtMV0uaWQgPT0gbWFuaWZlc3RbbWFuaWZlc3QubGVuZ3RoLTFdLmlkKSB7XG5cdFx0XHRcdFx0b25Mb2FkZWQoKVx0XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMucHVzaChtYW5pZmVzdClcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjayA9IG9uTG9hZGVkXG4gICAgICAgIHRoaXMucXVldWUubG9hZE1hbmlmZXN0KG1hbmlmZXN0KVxuXHR9XG5cdG9uTWFuaWZlc3RMb2FkQ29tcGxldGVkKCkge1xuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrKClcblx0fVxuXHRnZXRDb250ZW50QnlJZChpZCkge1xuXHRcdHJldHVybiB0aGlzLnF1ZXVlLmdldFJlc3VsdChpZClcblx0fVxuXHRnZXRJbWFnZVVSTChpZCkge1xuXHRcdHJldHVybiB0aGlzLmdldENvbnRlbnRCeUlkKGlkKS5nZXRBdHRyaWJ1dGUoXCJzcmNcIilcblx0fVxuXHRnZXRJbWFnZVNpemUoaWQpIHtcblx0XHR2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpXG5cdFx0cmV0dXJuIHsgd2lkdGg6IGNvbnRlbnQud2lkdGgsIGhlaWdodDogY29udGVudC5oZWlnaHQgfVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByZWxvYWRlclxuIiwiaW1wb3J0IGhhc2hlciBmcm9tICdoYXNoZXInXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IGNyb3Nzcm9hZHMgZnJvbSAnY3Jvc3Nyb2FkcydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBkYXRhIGZyb20gJ0dsb2JhbERhdGEnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuY2xhc3MgUm91dGVyIHtcblx0aW5pdCgpIHtcblx0XHR0aGlzLnJvdXRpbmcgPSBkYXRhLnJvdXRpbmdcblx0XHR0aGlzLnNldHVwUm91dGVzKClcblx0XHR0aGlzLmZpcnN0UGFzcyA9IHRydWVcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gZmFsc2Vcblx0XHRoYXNoZXIubmV3SGFzaCA9IHVuZGVmaW5lZFxuXHRcdGhhc2hlci5vbGRIYXNoID0gdW5kZWZpbmVkXG5cdFx0aGFzaGVyLmluaXRpYWxpemVkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdGhhc2hlci5jaGFuZ2VkLmFkZCh0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdHRoaXMuc2V0dXBDcm9zc3JvYWRzKClcblx0fVxuXHRiZWdpblJvdXRpbmcoKSB7XG5cdFx0aGFzaGVyLmluaXQoKVxuXHR9XG5cdHNldHVwQ3Jvc3Nyb2FkcygpIHtcblx0IFx0dmFyIHJvdXRlcyA9IGhhc2hlci5yb3V0ZXNcblx0IFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0IFx0XHR2YXIgcm91dGUgPSByb3V0ZXNbaV1cblx0IFx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKHJvdXRlLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0IFx0fTtcblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCcnLCB0aGlzLm9uUGFyc2VVcmwuYmluZCh0aGlzKSlcblx0fVxuXHRvblBhcnNlVXJsKCkge1xuXHRcdHRoaXMuYXNzaWduUm91dGUoKVxuXHR9XG5cdG9uRGVmYXVsdFVSTEhhbmRsZXIoKSB7XG5cdFx0dGhpcy5zZW5kVG9EZWZhdWx0KClcblx0fVxuXHRhc3NpZ25Sb3V0ZShpZCkge1xuXHRcdHZhciBoYXNoID0gaGFzaGVyLmdldEhhc2goKVxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuZ2V0VVJMUGFydHMoaGFzaClcblx0XHR0aGlzLnVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFydHNbMF0sIChwYXJ0c1sxXSA9PSB1bmRlZmluZWQpID8gJycgOiBwYXJ0c1sxXSlcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gdHJ1ZVxuXHR9XG5cdGdldFVSTFBhcnRzKHVybCkge1xuXHRcdHZhciBoYXNoID0gdXJsXG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJy8nKVxuXHR9XG5cdHVwZGF0ZVBhZ2VSb3V0ZShoYXNoLCBwYXJ0cywgcGFyZW50LCB0YXJnZXQpIHtcblx0XHRoYXNoZXIub2xkSGFzaCA9IGhhc2hlci5uZXdIYXNoXG5cdFx0aGFzaGVyLm5ld0hhc2ggPSB7XG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0cGFydHM6IHBhcnRzLFxuXHRcdFx0cGFyZW50OiBwYXJlbnQsXG5cdFx0XHR0YXJnZXQ6IHRhcmdldFxuXHRcdH1cblx0XHRoYXNoZXIubmV3SGFzaC50eXBlID0gaGFzaGVyLm5ld0hhc2guaGFzaCA9PSAnJyA/IEFwcENvbnN0YW50cy5IT01FIDogQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG5cdFx0Ly8gSWYgZmlyc3QgcGFzcyBzZW5kIHRoZSBhY3Rpb24gZnJvbSBBcHAuanMgd2hlbiBhbGwgYXNzZXRzIGFyZSByZWFkeVxuXHRcdGlmKHRoaXMuZmlyc3RQYXNzKSB7XG5cdFx0XHR0aGlzLmZpcnN0UGFzcyA9IGZhbHNlXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBBY3Rpb25zLnBhZ2VIYXNoZXJDaGFuZ2VkKClcblx0XHR9XG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKG5ld0hhc2gsIG9sZEhhc2gpIHtcblx0XHR0aGlzLm5ld0hhc2hGb3VuZGVkID0gZmFsc2Vcblx0XHRjcm9zc3JvYWRzLnBhcnNlKG5ld0hhc2gpXG5cdFx0aWYodGhpcy5uZXdIYXNoRm91bmRlZCkgcmV0dXJuXG5cdFx0Ly8gSWYgVVJMIGRvbid0IG1hdGNoIGEgcGF0dGVybiwgc2VuZCB0byBkZWZhdWx0XG5cdFx0dGhpcy5vbkRlZmF1bHRVUkxIYW5kbGVyKClcblx0fVxuXHRzZW5kVG9EZWZhdWx0KCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKEFwcFN0b3JlLmRlZmF1bHRSb3V0ZSgpKVxuXHR9XG5cdHNldHVwUm91dGVzKCkge1xuXHRcdGhhc2hlci5yb3V0ZXMgPSBbXVxuXHRcdGhhc2hlci5kaXB0eXF1ZVJvdXRlcyA9IFtdXG5cdFx0dmFyIGkgPSAwLCBrO1xuXHRcdGZvcihrIGluIHRoaXMucm91dGluZykge1xuXHRcdFx0aGFzaGVyLnJvdXRlc1tpXSA9IGtcblx0XHRcdGlmKGsubGVuZ3RoID4gMikgaGFzaGVyLmRpcHR5cXVlUm91dGVzLnB1c2goaylcblx0XHRcdGkrK1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgZ2V0QmFzZVVSTCgpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuVVJMLnNwbGl0KFwiI1wiKVswXVxuXHR9XG5cdHN0YXRpYyBnZXRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpXG5cdH1cblx0c3RhdGljIGdldFJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLnJvdXRlc1xuXHR9XG5cdHN0YXRpYyBnZXREaXB0eXF1ZVJvdXRlcygpIHtcblx0XHRyZXR1cm4gaGFzaGVyLmRpcHR5cXVlUm91dGVzXG5cdH1cblx0c3RhdGljIGdldE5ld0hhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5uZXdIYXNoXG5cdH1cblx0c3RhdGljIGdldE9sZEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5vbGRIYXNoXG5cdH1cblx0c3RhdGljIHNldEhhc2goaGFzaCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKGhhc2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyXG4iLCJpbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmZ1bmN0aW9uIF9nZXRDb250ZW50U2NvcGUoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgcmV0dXJuIEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZChoYXNoT2JqLmhhc2gpXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpIHtcbiAgICB2YXIgc2NvcGUgPSBfZ2V0Q29udGVudFNjb3BlKClcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgdHlwZSA9IF9nZXRUeXBlT2ZQYWdlKClcbiAgICB2YXIgbWFuaWZlc3Q7XG5cbiAgICBpZih0eXBlICE9IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgIHZhciBmaWxlbmFtZXMgPSBbXG4gICAgICAgICAgICAnY2hhcmFjdGVyLnBuZycsXG4gICAgICAgICAgICAnY2hhcmFjdGVyLWJnLmpwZycsXG4gICAgICAgICAgICAnc2hvZS1iZy5qcGcnXG4gICAgICAgIF1cbiAgICAgICAgbWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGZpbGVuYW1lcywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKVxuICAgIH1cblxuICAgIC8vIEluIGNhc2Ugb2YgZXh0cmEgYXNzZXRzXG4gICAgaWYoc2NvcGUuYXNzZXRzICE9IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgYXNzZXRzID0gc2NvcGUuYXNzZXRzXG4gICAgICAgIHZhciBhc3NldHNNYW5pZmVzdDtcbiAgICAgICAgaWYodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkge1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgJ2hvbWUnLCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBhc3NldHNNYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoYXNzZXRzLCBoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQsIHR5cGUpICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIG1hbmlmZXN0ID0gKG1hbmlmZXN0ID09IHVuZGVmaW5lZCkgPyBhc3NldHNNYW5pZmVzdCA6IG1hbmlmZXN0LmNvbmNhdChhc3NldHNNYW5pZmVzdClcbiAgICB9XG5cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9hZGRCYXNlUGF0aHNUb1VybHModXJscywgcGFnZUlkLCB0YXJnZXRJZCwgdHlwZSkge1xuICAgIHZhciBiYXNlUGF0aCA9ICh0eXBlID09IEFwcENvbnN0YW50cy5IT01FKSA/IF9nZXRIb21lUGFnZUFzc2V0c0Jhc2VQYXRoKCkgOiBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChwYWdlSWQsIHRhcmdldElkKVxuICAgIHZhciBtYW5pZmVzdCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzcGxpdHRlciA9IHVybHNbaV0uc3BsaXQoJy4nKVxuICAgICAgICB2YXIgZmlsZU5hbWUgPSBzcGxpdHRlclswXVxuICAgICAgICB2YXIgZXh0ZW5zaW9uID0gc3BsaXR0ZXJbMV1cbiAgICAgICAgdmFyIGlkID0gcGFnZUlkICsgJy0nXG4gICAgICAgIGlmKHRhcmdldElkKSBpZCArPSB0YXJnZXRJZCArICctJ1xuICAgICAgICBpZCArPSBmaWxlTmFtZVxuICAgICAgICBtYW5pZmVzdFtpXSA9IHtcbiAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgIHNyYzogYmFzZVBhdGggKyBmaWxlTmFtZSArIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSArICcuJyArIGV4dGVuc2lvblxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYW5pZmVzdFxufVxuZnVuY3Rpb24gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQoaWQsIGFzc2V0R3JvdXBJZCkge1xuICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvZGlwdHlxdWUvJyArIGlkICsgJy8nICsgYXNzZXRHcm91cElkICsgJy8nXG59XG5mdW5jdGlvbiBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2hvbWUvJ1xufVxuZnVuY3Rpb24gX2dldEltYWdlRXh0ZW5zaW9uQnlEZXZpY2VSYXRpbygpIHtcbiAgICAvLyByZXR1cm4gJ0AnICsgX2dldERldmljZVJhdGlvKCkgKyAneCdcbiAgICByZXR1cm4gJydcbn1cbmZ1bmN0aW9uIF9nZXREZXZpY2VSYXRpbygpIHtcbiAgICB2YXIgc2NhbGUgPSAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPT0gdW5kZWZpbmVkKSA/IDEgOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgIHJldHVybiAoc2NhbGUgPiAxKSA/IDIgOiAxXG59XG5mdW5jdGlvbiBfZ2V0VHlwZU9mUGFnZShoYXNoKSB7XG4gICAgdmFyIGggPSBoYXNoIHx8IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICBpZihoLnBhcnRzLmxlbmd0aCA9PSAyKSByZXR1cm4gQXBwQ29uc3RhbnRzLkRJUFRZUVVFXG4gICAgZWxzZSByZXR1cm4gQXBwQ29uc3RhbnRzLkhPTUVcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQ29udGVudCgpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgaGFzaCA9IGhhc2hPYmouaGFzaC5sZW5ndGggPCAxID8gJy8nIDogaGFzaE9iai5oYXNoXG4gICAgdmFyIGNvbnRlbnQgPSBkYXRhLnJvdXRpbmdbaGFzaF1cbiAgICByZXR1cm4gY29udGVudFxufVxuZnVuY3Rpb24gX2dldENvbnRlbnRCeUxhbmcobGFuZykge1xuICAgIHJldHVybiBkYXRhLmNvbnRlbnQubGFuZ1tsYW5nXVxufVxuZnVuY3Rpb24gX2dldEdsb2JhbENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIF9nZXRDb250ZW50QnlMYW5nKEFwcFN0b3JlLmxhbmcoKSlcbn1cbmZ1bmN0aW9uIF9nZXRBcHBEYXRhKCkge1xuICAgIHJldHVybiBkYXRhXG59XG5mdW5jdGlvbiBfZ2V0RGVmYXVsdFJvdXRlKCkge1xuICAgIHJldHVybiBkYXRhWydkZWZhdWx0LXJvdXRlJ11cbn1cbmZ1bmN0aW9uIF93aW5kb3dXaWR0aEhlaWdodCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB3OiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgaDogd2luZG93LmlubmVySGVpZ2h0XG4gICAgfVxufVxuZnVuY3Rpb24gX2dldERpcHR5cXVlU2hvZXMoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGJhc2V1cmwgPSBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQpXG4gICAgcmV0dXJuIF9nZXRDb250ZW50U2NvcGUoKS5zaG9lc1xufVxuXG52YXIgQXBwU3RvcmUgPSBhc3NpZ24oe30sIEV2ZW50RW1pdHRlcjIucHJvdG90eXBlLCB7XG4gICAgZW1pdENoYW5nZTogZnVuY3Rpb24odHlwZSwgaXRlbSkge1xuICAgICAgICB0aGlzLmVtaXQodHlwZSwgaXRlbSlcbiAgICB9LFxuICAgIHBhZ2VDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQ29udGVudCgpXG4gICAgfSxcbiAgICBhcHBEYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRBcHBEYXRhKClcbiAgICB9LFxuICAgIGRlZmF1bHRSb3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0RGVmYXVsdFJvdXRlKClcbiAgICB9LFxuICAgIGdsb2JhbENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldEdsb2JhbENvbnRlbnQoKVxuICAgIH0sXG4gICAgcGFnZUFzc2V0c1RvTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpXG4gICAgfSxcbiAgICBnZXRSb3V0ZVBhdGhTY29wZUJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGlkID0gaWQubGVuZ3RoIDwgMSA/ICcvJyA6IGlkXG4gICAgICAgIHJldHVybiBkYXRhLnJvdXRpbmdbaWRdXG4gICAgfSxcbiAgICBiYXNlTWVkaWFQYXRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmdldEVudmlyb25tZW50KCkuc3RhdGljXG4gICAgfSxcbiAgICBnZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkOiBmdW5jdGlvbihwYXJlbnQsIHRhcmdldCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFyZW50LCB0YXJnZXQpXG4gICAgfSxcbiAgICBnZXRFbnZpcm9ubWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBDb25zdGFudHMuRU5WSVJPTk1FTlRTW0VOVl1cbiAgICB9LFxuICAgIGdldFR5cGVPZlBhZ2U6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRUeXBlT2ZQYWdlKGhhc2gpXG4gICAgfSxcbiAgICBnZXRIb21lVmlkZW9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbJ2hvbWUtdmlkZW9zJ11cbiAgICB9LFxuICAgIGdlbmVyYWxJbmZvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmNvbnRlbnRcbiAgICB9LFxuICAgIGRpcHR5cXVlU2hvZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERpcHR5cXVlU2hvZXMoKVxuICAgIH0sXG4gICAgZ2V0TmV4dERpcHR5cXVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKGkrMSkgPiByb3V0ZXMubGVuZ3RoLTEgPyAwIDogKGkrMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGVzW2luZGV4XVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UHJldmlvdXNEaXB0eXF1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgICAgICB2YXIgcm91dGVzID0gUm91dGVyLmdldERpcHR5cXVlUm91dGVzKClcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBoYXNoT2JqLmhhc2hcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuICAgICAgICAgICAgaWYocm91dGUgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChpLTEpIDwgMCA/IHJvdXRlcy5sZW5ndGgtMSA6IChpLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1tpbmRleF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldERpcHR5cXVlUGFnZUluZGV4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFByZXZpZXdVcmxCeUhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9kaXB0eXF1ZS8nICsgaGFzaCArICcvcHJldmlldy5naWYnXG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBDYW52YXM6IHVuZGVmaW5lZCxcbiAgICBPcmllbnRhdGlvbjogQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSxcbiAgICBEZXRlY3Rvcjoge1xuICAgICAgICBpc01vYmlsZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvblxuICAgICAgICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkU6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LncgPSBhY3Rpb24uaXRlbS53aW5kb3dXXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LmggPSBhY3Rpb24uaXRlbS53aW5kb3dIXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuT3JpZW50YXRpb24gPSAoQXBwU3RvcmUuV2luZG93LncgPiBBcHBTdG9yZS5XaW5kb3cuaCkgPyBBcHBDb25zdGFudHMuTEFORFNDQVBFIDogQXBwQ29uc3RhbnRzLlBPUlRSQUlUXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlLCBhY3Rpb24uaXRlbSkgXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5cbmV4cG9ydCBkZWZhdWx0IEFwcFN0b3JlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG52YXIgUHhIZWxwZXIgPSB7XG5cbiAgICBnZXRQWFZpZGVvOiBmdW5jdGlvbih1cmwsIHdpZHRoLCBoZWlnaHQsIHZhcnMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbVZpZGVvKHVybClcbiAgICAgICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2Uuc2V0QXR0cmlidXRlKFwibG9vcFwiLCB0cnVlKVxuICAgICAgICB2YXIgdmlkZW9TcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSlcbiAgICAgICAgdmlkZW9TcHJpdGUud2lkdGggPSB3aWR0aFxuICAgICAgICB2aWRlb1Nwcml0ZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgcmV0dXJuIHZpZGVvU3ByaXRlXG4gICAgfSxcblxuICAgIHJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRGcmFtZUltYWdlc0FycmF5OiBmdW5jdGlvbihmcmFtZXMsIGJhc2V1cmwsIGV4dCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVybCA9IGJhc2V1cmwgKyBpICsgJy4nICsgZXh0XG4gICAgICAgICAgICBhcnJheVtpXSA9IHVybFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHhIZWxwZXIiLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmNsYXNzIFV0aWxzIHtcblx0c3RhdGljIE5vcm1hbGl6ZU1vdXNlQ29vcmRzKGUsIG9ialdyYXBwZXIpIHtcblx0XHR2YXIgcG9zeCA9IDA7XG5cdFx0dmFyIHBvc3kgPSAwO1xuXHRcdGlmICghZSkgdmFyIGUgPSB3aW5kb3cuZXZlbnQ7XG5cdFx0aWYgKGUucGFnZVggfHwgZS5wYWdlWSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5wYWdlWDtcblx0XHRcdHBvc3kgPSBlLnBhZ2VZO1xuXHRcdH1cblx0XHRlbHNlIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRZKSBcdHtcblx0XHRcdHBvc3ggPSBlLmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnRcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcblx0XHRcdHBvc3kgPSBlLmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuXHRcdFx0XHQrIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG5cdFx0fVxuXHRcdG9ialdyYXBwZXIueCA9IHBvc3hcblx0XHRvYmpXcmFwcGVyLnkgPSBwb3N5XG5cdFx0cmV0dXJuIG9ialdyYXBwZXJcblx0fVxuXHRzdGF0aWMgUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBjb250ZW50VywgY29udGVudEgsIG9yaWVudGF0aW9uKSB7XG5cdFx0dmFyIGFzcGVjdFJhdGlvID0gY29udGVudFcgLyBjb250ZW50SFxuXHRcdGlmKG9yaWVudGF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmKG9yaWVudGF0aW9uID09IEFwcENvbnN0YW50cy5MQU5EU0NBUEUpIHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHNjYWxlID0gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxXG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgc2NhbGUgPSAoKHdpbmRvd1cgLyB3aW5kb3dIKSA8IGFzcGVjdFJhdGlvKSA/ICh3aW5kb3dIIC8gY29udGVudEgpICogMSA6ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdH1cblx0XHR2YXIgbmV3VyA9IGNvbnRlbnRXICogc2NhbGVcblx0XHR2YXIgbmV3SCA9IGNvbnRlbnRIICogc2NhbGVcblx0XHR2YXIgY3NzID0ge1xuXHRcdFx0d2lkdGg6IG5ld1csXG5cdFx0XHRoZWlnaHQ6IG5ld0gsXG5cdFx0XHRsZWZ0OiAod2luZG93VyA+PiAxKSAtIChuZXdXID4+IDEpLFxuXHRcdFx0dG9wOiAod2luZG93SCA+PiAxKSAtIChuZXdIID4+IDEpLFxuXHRcdFx0c2NhbGU6IHNjYWxlXG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBjc3Ncblx0fVxuXHRzdGF0aWMgQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cmluZykge1xuXHQgICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcblx0fVxuXHRzdGF0aWMgU3VwcG9ydFdlYkdMKCkge1xuXHRcdHRyeSB7XG5cdFx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblx0XHRcdHJldHVybiAhISAoIHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKCBjYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJyApICkgKTtcblx0XHR9IGNhdGNoICggZSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0c3RhdGljIERlc3Ryb3lWaWRlbyh2aWRlbykge1xuICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICB2aWRlby5zcmMgPSAnJztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdmlkZW8uY2hpbGROb2Rlc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIFx0dmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgXHRjaGlsZC5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcbiAgICAgICAgXHQvLyBXb3JraW5nIHdpdGggYSBwb2x5ZmlsbCBvciB1c2UganF1ZXJ5XG4gICAgICAgIFx0ZG9tLnRyZWUucmVtb3ZlKGNoaWxkKVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBEZXN0cm95VmlkZW9UZXh0dXJlKHRleHR1cmUpIHtcbiAgICBcdHZhciB2aWRlbyA9IHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlXG4gICAgICAgIFV0aWxzLkRlc3Ryb3lWaWRlbyh2aWRlbylcbiAgICB9XG4gICAgc3RhdGljIFJhbmQobWluLCBtYXgsIGRlY2ltYWxzKSB7XG4gICAgICAgIHZhciByYW5kb21OdW0gPSBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW5cbiAgICAgICAgaWYoZGVjaW1hbHMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFx0cmV0dXJuIHJhbmRvbU51bVxuICAgICAgICB9ZWxzZXtcblx0ICAgICAgICB2YXIgZCA9IE1hdGgucG93KDEwLCBkZWNpbWFscylcblx0ICAgICAgICByZXR1cm4gfn4oKGQgKiByYW5kb21OdW0pICsgMC41KSAvIGRcbiAgICAgICAgfVxuXHR9XG5cdHN0YXRpYyBHZXRJbWdVcmxJZCh1cmwpIHtcblx0XHR2YXIgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKVxuXHRcdHJldHVybiBzcGxpdFtzcGxpdC5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR9XG5cdHN0YXRpYyBTdHlsZShkaXYsIHN0eWxlKSB7XG4gICAgXHRkaXYuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubW96VHJhbnNmb3JtICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUubXNUcmFuc2Zvcm0gICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUub1RyYW5zZm9ybSAgICAgID0gc3R5bGVcblx0XHRkaXYuc3R5bGUudHJhbnNmb3JtICAgICAgID0gc3R5bGVcbiAgICB9XG4gICAgc3RhdGljIFRyYW5zbGF0ZShkaXYsIHgsIHksIHopIHtcbiAgICBcdGlmICgnd2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdtb3pUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ29UcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgfHwgJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSkge1xuICAgIFx0XHRVdGlscy5TdHlsZShkaXYsICd0cmFuc2xhdGUzZCgnK3grJ3B4LCcreSsncHgsJyt6KydweCknKVxuXHRcdH1lbHNle1xuXHRcdFx0ZGl2LnN0eWxlLnRvcCA9IHkgKyAncHgnXG5cdFx0XHRkaXYuc3R5bGUubGVmdCA9IHggKyAncHgnXG5cdFx0fVxuICAgIH1cbiAgICBzdGF0aWMgU3ByaW5nVG8oaXRlbSwgdG9Qb3NpdGlvbiwgaW5kZXgpIHtcbiAgICBcdHZhciBkeCA9IHRvUG9zaXRpb24ueCAtIGl0ZW0ucG9zaXRpb24ueFxuICAgIFx0dmFyIGR5ID0gdG9Qb3NpdGlvbi55IC0gaXRlbS5wb3NpdGlvbi55XG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXG5cdFx0dmFyIHRhcmdldFggPSB0b1Bvc2l0aW9uLnggLSBNYXRoLmNvcyhhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0dmFyIHRhcmdldFkgPSB0b1Bvc2l0aW9uLnkgLSBNYXRoLnNpbihhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0aXRlbS52ZWxvY2l0eS54ICs9ICh0YXJnZXRYIC0gaXRlbS5wb3NpdGlvbi54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHkueSArPSAodGFyZ2V0WSAtIGl0ZW0ucG9zaXRpb24ueSkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnggKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cblx0XHRpdGVtLnZlbG9jaXR5LnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvU2NhbGUoaXRlbSwgdG9TY2FsZSwgaW5kZXgpIHtcbiAgICBcdHZhciBkeCA9IHRvU2NhbGUueCAtIGl0ZW0uc2NhbGUueFxuICAgIFx0dmFyIGR5ID0gdG9TY2FsZS55IC0gaXRlbS5zY2FsZS55XG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpXG5cdFx0dmFyIHRhcmdldFggPSB0b1NjYWxlLnggLSBNYXRoLmNvcyhhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0dmFyIHRhcmdldFkgPSB0b1NjYWxlLnkgLSBNYXRoLnNpbihhbmdsZSkgKiAoaXRlbS5jb25maWcubGVuZ3RoICogaW5kZXgpXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnggKz0gKHRhcmdldFggLSBpdGVtLnNjYWxlLngpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKz0gKHRhcmdldFkgLSBpdGVtLnNjYWxlLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnggKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cblx0XHRpdGVtLnZlbG9jaXR5U2NhbGUueSAqPSBpdGVtLmNvbmZpZy5mcmljdGlvblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbHNcbiIsIi8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG4gXG4vLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYnkgRXJpayBNw7ZsbGVyLiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG4gXG4vLyBNSVQgbGljZW5zZVxuIFxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgdmFyIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddO1xuICAgIGZvcih2YXIgeCA9IDA7IHggPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuIFxuICAgIGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgICAgICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIFxuICAgICAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuIFxuICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfTtcbn0oKSk7IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCB7RXZlbnRFbWl0dGVyMn0gZnJvbSAnZXZlbnRlbWl0dGVyMidcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxuLy8gQWN0aW9uc1xudmFyIFBhZ2VyQWN0aW9ucyA9IHtcbiAgICBvblBhZ2VSZWFkeTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFksXG4gICAgICAgIFx0aXRlbTogaGFzaFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25PdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICAgICAgdHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25PdXRDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgXHRQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEUsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIG9uVHJhbnNpdGlvbkluQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICAgICAgdHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLFxuICAgICAgICAgICAgaXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCxcbiAgICAgICAgXHRpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH1cbn1cblxuLy8gQ29uc3RhbnRzXG52YXIgUGFnZXJDb25zdGFudHMgPSB7XG5cdFBBR0VfSVNfUkVBRFk6ICdQQUdFX0lTX1JFQURZJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOOiAnUEFHRV9UUkFOU0lUSU9OX0lOJyxcblx0UEFHRV9UUkFOU0lUSU9OX09VVDogJ1BBR0VfVFJBTlNJVElPTl9PVVQnLFxuICAgIFBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6ICdQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTOiAnUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTJyxcblx0UEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0g6ICdQQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCdcbn1cblxuLy8gRGlzcGF0Y2hlclxudmFyIFBhZ2VyRGlzcGF0Y2hlciA9IGFzc2lnbihuZXcgRmx1eC5EaXNwYXRjaGVyKCksIHtcblx0aGFuZGxlUGFnZXJBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goYWN0aW9uKVxuXHR9XG59KVxuXG4vLyBTdG9yZVxudmFyIFBhZ2VyU3RvcmUgPSBhc3NpZ24oe30sIEV2ZW50RW1pdHRlcjIucHJvdG90eXBlLCB7XG4gICAgZmlyc3RQYWdlVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBwYWdlVHJhbnNpdGlvblN0YXRlOiB1bmRlZmluZWQsIFxuICAgIGRpc3BhdGNoZXJJbmRleDogUGFnZXJEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uVHlwZSA9IHBheWxvYWQudHlwZVxuICAgICAgICB2YXIgaXRlbSA9IHBheWxvYWQuaXRlbVxuICAgICAgICBzd2l0Y2goYWN0aW9uVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZOlxuICAgICAgICAgICAgXHRQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1NcbiAgICAgICAgICAgIFx0dmFyIHR5cGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5cbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6XG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOlxuICAgICAgICAgICAgXHRpZiAoUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uKSBQYWdlclN0b3JlLmZpcnN0UGFnZVRyYW5zaXRpb24gPSBmYWxzZVxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIXG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KGFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgUGFnZXJTdG9yZS5lbWl0KGFjdGlvblR5cGUsIGl0ZW0pXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5leHBvcnQgZGVmYXVsdCB7XG5cdFBhZ2VyU3RvcmU6IFBhZ2VyU3RvcmUsXG5cdFBhZ2VyQWN0aW9uczogUGFnZXJBY3Rpb25zLFxuXHRQYWdlckNvbnN0YW50czogUGFnZXJDb25zdGFudHMsXG5cdFBhZ2VyRGlzcGF0Y2hlcjogUGFnZXJEaXNwYXRjaGVyXG59XG4iLCJpbXBvcnQgc2x1ZyBmcm9tICd0by1zbHVnLWNhc2UnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gZmFsc2Vcblx0XHR0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gdGhpcy5jb21wb25lbnREaWRNb3VudC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVuZGVyKGNoaWxkSWQsIHBhcmVudElkLCB0ZW1wbGF0ZSwgb2JqZWN0KSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsTW91bnQoKVxuXHRcdHRoaXMuY2hpbGRJZCA9IGNoaWxkSWRcblx0XHR0aGlzLnBhcmVudElkID0gcGFyZW50SWRcblx0XHRcblx0XHRpZihkb20uaXNEb20ocGFyZW50SWQpKSB7XG5cdFx0XHR0aGlzLnBhcmVudCA9IHBhcmVudElkXG5cdFx0fWVsc2V7XG5cdFx0XHR2YXIgaWQgPSB0aGlzLnBhcmVudElkLmluZGV4T2YoJyMnKSA+IC0xID8gdGhpcy5wYXJlbnRJZC5zcGxpdCgnIycpWzFdIDogdGhpcy5wYXJlbnRJZFxuXHRcdFx0dGhpcy5wYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblx0XHR9XG5cblx0XHRpZih0ZW1wbGF0ZSA9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0fWVsc2Uge1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHRcdHZhciB0ID0gdGVtcGxhdGUob2JqZWN0KVxuXHRcdFx0dGhpcy5lbGVtZW50LmlubmVySFRNTCA9IHRcblx0XHR9XG5cdFx0aWYodGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKSA9PSB1bmRlZmluZWQpIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgc2x1ZyhjaGlsZElkKSlcblx0XHRkb20udHJlZS5hZGQodGhpcy5wYXJlbnQsIHRoaXMuZWxlbWVudClcblxuXHRcdHNldFRpbWVvdXQodGhpcy5jb21wb25lbnREaWRNb3VudCwgMClcblx0fVxuXHRyZW1vdmUoKSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdFx0dGhpcy5lbGVtZW50LnJlbW92ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDb21wb25lbnRcblxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZVBhZ2UgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5wcm9wcyA9IHByb3BzXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlID0gdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMudGxJbiA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGhpcy50bE91dCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5yZXNpemUoKVxuXHRcdHRoaXMuc2V0dXBBbmltYXRpb25zKClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuaXNSZWFkeSh0aGlzLnByb3BzLmhhc2gpLCAwKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblxuXHRcdC8vIHJlc2V0XG5cdFx0dGhpcy50bEluLnBhdXNlKDApXG5cdFx0dGhpcy50bE91dC5wYXVzZSgwKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUpXG5cdFx0dGhpcy50bEluLnRpbWVTY2FsZSgxLjQpXG5cdFx0c2V0VGltZW91dCgoKT0+dGhpcy50bEluLnBsYXkoMCksIDgwMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLnRsT3V0LmdldENoaWxkcmVuKCkubGVuZ3RoIDwgMSkge1xuXHRcdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSlcblx0XHRcdHRoaXMudGxPdXQudGltZVNjYWxlKDEuMilcblx0XHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxPdXQucGxheSgwKSwgNTAwKVxuXHRcdH1cblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnRsSW4uZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSwgMClcblx0fVxuXHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0dGhpcy50bE91dC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSwgMClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Zm9yY2VVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHR0aGlzLnRsT3V0LmNsZWFyKClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50cywgUGFnZXJEaXNwYXRjaGVyfSBmcm9tICdQYWdlcidcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdQYWdlc0NvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEJhc2VQYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICdwYWdlLWInXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25JbiA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4uYmluZCh0aGlzKVxuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCA9IHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2guYmluZCh0aGlzKVxuXHRcdHRoaXMuY29tcG9uZW50cyA9IHtcblx0XHRcdCduZXctY29tcG9uZW50JzogdW5kZWZpbmVkLFxuXHRcdFx0J29sZC1jb21wb25lbnQnOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQmFzZVBhZ2VyJywgcGFyZW50LCB0ZW1wbGF0ZSwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsIHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2gpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnN3aXRjaFBhZ2VzRGl2SW5kZXgoKVxuXHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdGlmKHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddICE9IHVuZGVmaW5lZCkgdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10ud2lsbFRyYW5zaXRpb25JbigpXG5cdFx0fSwgNjAwKVxuXHR9XG5cdHdpbGxQYWdlVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSAhPSB1bmRlZmluZWQpIHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uT3V0KClcblx0fVxuXHRwYWdlQXNzZXRzTG9hZGVkKCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0ZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25JbkNvbXBsZXRlKClcblx0XHRQYWdlckFjdGlvbnMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKVxuXHR9XG5cdGRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSB7XG5cdFx0QXBwQWN0aW9ucy5sb2FkUGFnZUFzc2V0cygpXG5cdH1cblx0cGFnZVRyYW5zaXRpb25EaWRGaW5pc2goKSB7XG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCdvbGQtY29tcG9uZW50Jylcblx0fVxuXHRzd2l0Y2hQYWdlc0RpdkluZGV4KCkge1xuXHRcdHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHZhciBvbGRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXVxuXHRcdGlmKG5ld0NvbXBvbmVudCAhPSB1bmRlZmluZWQpIG5ld0NvbXBvbmVudC5wYXJlbnQuc3R5bGVbJ3otaW5kZXgnXSA9IDJcblx0XHRpZihvbGRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBvbGRDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAxXG5cdH1cblx0c2V0dXBOZXdDb21wb25lbnQoaGFzaCwgVHlwZSwgdGVtcGxhdGUpIHtcblx0XHR2YXIgaWQgPSBVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoaGFzaC5wYXJlbnQucmVwbGFjZShcIi9cIiwgXCJcIikpXG5cdFx0dGhpcy5vbGRQYWdlRGl2UmVmID0gdGhpcy5jdXJyZW50UGFnZURpdlJlZlxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAodGhpcy5jdXJyZW50UGFnZURpdlJlZiA9PT0gJ3BhZ2UtYScpID8gJ3BhZ2UtYicgOiAncGFnZS1hJ1xuXHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYpXG5cblx0XHR2YXIgcHJvcHMgPSB7XG5cdFx0XHRpZDogdGhpcy5jdXJyZW50UGFnZURpdlJlZixcblx0XHRcdGlzUmVhZHk6IHRoaXMub25QYWdlUmVhZHksXG5cdFx0XHRoYXNoOiBoYXNoLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLFxuXHRcdFx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUsXG5cdFx0XHRkYXRhOiBBcHBTdG9yZS5wYWdlQ29udGVudCgpXG5cdFx0fVxuXHRcdHZhciBwYWdlID0gbmV3IFR5cGUocHJvcHMpXG5cdFx0cGFnZS5yZW5kZXIoaWQsIGVsLCB0ZW1wbGF0ZSwgcHJvcHMuZGF0YSlcblx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXSA9IHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddXG5cdFx0dGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J10gPSBwYWdlXG5cdFx0aWYoUGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID09PSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1MpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddLmZvcmNlVW5tb3VudCgpXG5cdFx0fVxuXHR9XG5cdG9uUGFnZVJlYWR5KGhhc2gpIHtcblx0XHRQYWdlckFjdGlvbnMub25QYWdlUmVhZHkoaGFzaClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0dW5tb3VudENvbXBvbmVudChyZWYpIHtcblx0XHRpZih0aGlzLmNvbXBvbmVudHNbcmVmXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmNvbXBvbmVudHNbcmVmXS5yZW1vdmUoKVxuXHRcdH1cblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRQYWdlclN0b3JlLm9mZihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU4sIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4pXG5cdFx0UGFnZXJTdG9yZS5vZmYoUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQpXG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCdvbGQtY29tcG9uZW50Jylcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ25ldy1jb21wb25lbnQnKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlUGFnZXJcblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcImNvbnRlbnRcIjoge1xuXHRcdFwidHdpdHRlcl91cmxcIjogXCJodHRwczovL3R3aXR0ZXIuY29tL2NhbXBlclwiLFxuXHRcdFwiZmFjZWJvb2tfdXJsXCI6IFwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL0NhbXBlclwiLFxuXHRcdFwiaW5zdGFncmFtX3VybFwiOiBcImh0dHBzOi8vaW5zdGFncmFtLmNvbS9jYW1wZXIvXCIsXG5cdFx0XCJsYWJfdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2xhYlwiLFxuXHRcdFwibGFuZ1wiOiB7XG5cdFx0XHRcImVuXCI6IHtcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJTaG9wXCIsXG5cdFx0XHRcdFwic2hvcF9tZW5cIjogXCJNZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiV29tZW5cIixcblx0XHRcdFx0XCJwbGFuZXRcIjogXCJQbGFuZXRcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiYnV5X2J0bl90eHRcIjogXCJCVVkgVEhJUyBNT0RFTFwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdFwibGFuZ3NcIjogW1wiZW5cIiwgXCJmclwiLCBcImVzXCIsIFwiaXRcIiwgXCJkZVwiLCBcInB0XCJdLFxuXG5cdFwiaG9tZS12aWRlb3NcIjogW1xuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIyYjM2MGM4Y2EzOTk2OTY5ODUzMTNkZGU5OWJhODNkNGVjOTcyYjcvYXJlbGx1Zi1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzI5ODBmMTRjYzhiZDk5MTJiMTRkY2E0NmE0Y2Q0YTg1ZmEwNDc3NGMvYXJlbGx1Zi1rb2JhcmFmLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hODE5YzM3M2Y5Nzc3ODUyZjM5NjdjZTAyM2JjZmIwZDkxMTUzODZmL2FyZWxsdWYtcGFyYWRpc2UubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzNkY2ZkNzBjNzA3MjY5MmVhM2E3MzlhZWY1Mzc2YjAyNmIwNGI2NzUvYXJlbGx1Zi1wZWxvdGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8xM2JiYjYxMTk1MTY0ODczZDgyM2EzYjkxYTJjODJhY2NlZmIzZWRkL2RlaWEtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80YmI2ZTQ4NWI3MTdiZjdkYmRkNWM5NDFmYWZhMmIxODg0ZTkwODM4L2RlaWEtbWFydGEubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2U0MjQ4ODlhYzAyNmY3MGU1NDRhZjAzMDM1ZTcxODdmMzQ5NDE3MDUvZGVpYS1tYXRlby5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjM0NDRkM2M4NjkzZTU5ZjgwNzlmODI3ZGQxODJjNWUzMzQxMzg3Ny9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzZlYWZhZTdmMWIzYmM0MWQ4NTY5NzM1NTdhMmY1MTU5OGM4MjQxYTYvZXMtdHJlbmMtaXNhbXUubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzliOTQ3MWRjYmUxZjk0ZmY3YjM1MDg4NDFmNjhmZjE1YmUxOTJlZTQvZXMtdHJlbmMtbWFydGEubXA0XCJcblx0XSxcblxuXHRcImRlZmF1bHQtcm91dGVcIjogXCJcIixcblxuXHRcInJvdXRpbmdcIjoge1xuXHRcdFwiL1wiOiB7XG5cdFx0XHRcInRleHRzXCI6IHtcblx0XHRcdFx0XCJ0eHRfYVwiOiBcIkJhY2sgdG8gdGhlIHJvb3RzLiBJbnNwaXJhdGlvbnMgZm9yIG91ciBuZXcgY29sbGVjdGlvbiBjb21lcyBmcm9tIHRoZSBiYWxlYXJpYyBpc2xhbmQgb2YgTWFsbG9yY2EsIHRoZSBmb3VuZGluZyBncm91bmQgb2YgQ2FtcGVyLiBWaXNpdCB0aHJlZSBkaWZmZXJlbnQgc3BvdHMgb2YgdGhlIGlzbGFuZCAtIERlaWEsIEVzIFRyZW5jIGFuZCBBcmVsbHVmIC0gYXMgaW50ZXJwcmV0ZWQgYnkgY3JlYXRpdmUgZGlyZWN0b3IsIFJvbWFpbiBLcmVtZXIuXCIsXG5cdFx0XHRcdFwiYV92aXNpb25cIjogXCJBIFZJU0lPTiBPRlwiXG5cdFx0XHR9LFxuXHRcdFx0XCJhc3NldHNcIjogW1xuXHRcdFx0XHRcImJhY2tncm91bmQuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1jYXBhcy5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWR1Yi5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLWtvYmFyYWYuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wYXJhZGlzZS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9hcmVsbHVmLXBlbG90YXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZGVpYS1kdWIuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZGVpYS1tYXJ0YS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hdGVvLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWJlbHVnYS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9lcy10cmVuYy1pc2FtdS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9lcy10cmVuYy1tYXJ0YS5qcGdcIlxuXHRcdFx0XVxuXHRcdH0sXG5cbiAgICAgICAgXCJkZWlhL2R1YlwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8xM2JiYjYxMTk1MTY0ODczZDgyM2EzYjkxYTJjODJhY2NlZmIzZWRkL2RlaWEtZHViLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMTg4LCBcInNcIjogODUsIFwidlwiOiA2MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNTcsIFwic1wiOiA5NywgXCJ2XCI6IDI2IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAzNTksIFwic1wiOiA5MywgXCJ2XCI6IDUxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82MmU1NGVhYzFkODk4OWFiOWRlMjM4ZmEzZjdjNmQ4ZGI0ZDlkZThkL2FyZWxsdWYta29iYXJhZi5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkJyZWFraW5nIHVwIG9uIGEgdGV4dCBtZXNzYWdlIGlzIG5vdCB2ZXJ5IGRlaWFcIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWlhL21hdGVvXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2U0MjQ4ODlhYzAyNmY3MGU1NDRhZjAzMDM1ZTcxODdmMzQ5NDE3MDUvZGVpYS1tYXRlby5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDM3LCBcInNcIjogODksIFwidlwiOiA4MyB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogOCwgXCJzXCI6IDg2LCBcInZcIjogNTcgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzk1MGI2OTI1ZmE0Zjg1Y2ZhOGQ0NjZkODQzNjE2NzE3OTdjMjBjMWEvZGVpYS1tYXRlby5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcImJ1eXMgYW4gYXRlbGllciBhdCBkZWlhLjxicj5zdGFydHMgY2FyZWVyIGFzIGFuIGFydGlzdFwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuXG4gICAgICAgIFwiZXMtdHJlbmMvYmVsdWdhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjEyLCBcInNcIjogMTAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAxMiwgXCJ2XCI6IDQ1IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAxOTMsIFwic1wiOiAwLCBcInZcIjogNDUgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzcwNDU1YWQ3M2FmN2I3ZTM1ZTllNjc0MTA5OTI5YzNiNzAyOTQwNjQvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiRVMgVFJFTkMgUEFSVFkgQk9ZXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNmVhZmFlN2YxYjNiYzQxZDg1Njk3MzU1N2EyZjUxNTk4YzgyNDFhNi9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMCwgXCJzXCI6IDEsIFwidlwiOiA3NCB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMSwgXCJzXCI6IDM1LCBcInZcIjogNzIgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDIwLCBcInNcIjogNDUsIFwidlwiOiAzMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDY2NzlmM2ViZDY5NmU5YzQyZmQxM2NmOWRiZGFlZmZlOWIxZjg3My9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIlVGTyBzaWdodGluZyBhdCBlcyB0cmVuY1wiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuXG5cdFx0XCJhcmVsbHVmL2NhcGFzXCI6IHtcblx0XHRcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMCwgXCJzXCI6IDAsIFwidlwiOiAwIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA3NiwgXCJ2XCI6IDkxIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiA4LCBcInNcIjogNzYsIFwidlwiOiA5MSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNDhmZjFjNThiODZiMDg5MTI2ODFiNGZkZjNiNzU0N2M3NTc3NjZkNy9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiTUVBTldISUxFIElOIEFSRUxMVUZcIlxuICAgICAgICBcdH1cblx0XHR9LFxuICAgICAgICBcImFyZWxsdWYvcGVsb3Rhc1wiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMSwgXCJzXCI6IDk1LCBcInZcIjogMjkgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjIsIFwic1wiOiAzNSwgXCJ2XCI6IDc5IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyMzMsIFwic1wiOiAzNSwgXCJ2XCI6IDEwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9hYzE2ZDUzYzRmOWU4ZmQ2OTMwNzc5ZTIzNzg1NDY4N2RjZjI0MWU4L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIldIQVQgSEFQUEVOUyBJTiBBUkVMTFVGIFNUQVlTIElOIEFSRUxMVUZcIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL21hcnRhXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzg0MGEzZjY3MjliMWY1MmY0NDZhYWU2ZGFlYzkzOWEzZWNhNGMwYzEvYXJlbGx1Zi1jYXBhcy5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIwMCwgXCJzXCI6IDU3LCBcInZcIjogODEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMjAxLCBcInNcIjogMTAwLCBcInZcIjogNjkgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDIwMSwgXCJzXCI6IDEwMCwgXCJ2XCI6IDY5IH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy81YjlkMjcwNjEwMGU1ZWEwZDMxNzE0M2UyMzc0ZDZiZDZjOTYwN2IxL2FyZWxsdWYtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJCQUQgVFJJUCBBVCBUSEUgSE9URUwgUE9PTFwiXG4gICAgICAgIFx0fVxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYva29iYXJhaFwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDQxLCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82MmU1NGVhYzFkODk4OWFiOWRlMjM4ZmEzZjdjNmQ4ZGI0ZDlkZThkL2FyZWxsdWYta29iYXJhZi5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkhhdGVycyB3aWxsIHNheSBpdHMgcGhvdG9zaG9wXCJcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cdFx0XCJhcmVsbHVmL2R1YlwiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIyYjM2MGM4Y2EzOTk2OTY5ODUzMTNkZGU5OWJhODNkNGVjOTcyYjcvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxOTYsIFwic1wiOiA1MiwgXCJ2XCI6IDMzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzk4N2JkYWIwMTI5Nzk4MjJiODE4NjM3ODM3Y2MyODg0MTRjZWY4ZjMvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4nVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkVcIlxuICAgICAgICBcdH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL3BhcmFkaXNlXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2E4MTljMzczZjk3Nzc4NTJmMzk2N2NlMDIzYmNmYjBkOTExNTM4NmYvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDU5LCBcInNcIjogMTksIFwidlwiOiA5OSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMDcsIFwic1wiOiAzMSwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTgzLCBcInNcIjogNzEsIFwidlwiOiA2NCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNWRjMTk3MjZlZmE3YjJlNzU2YzgwNTM0ZDQzZmE2MDBjYzYxZjE3OC9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiU0VMRklFIE9OIFdBVEVSU0xJREUgTElLRSBBIEJPU1NcIlxuICAgICAgICBcdH1cbiAgICAgICAgfVxuXG5cdH1cbn0iXX0=
