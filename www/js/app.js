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
    return "<div class=\"titles-wrapper\">\n	<div class=\"deia\">DEIA</div>\n	<div class=\"es-trenc\">ES TRENC</div>\n	<div class=\"arelluf\">ARELLUF</div>\n</div>\n\n<svg width=\"100%\" viewBox=\"-67 0 760 645\">\n	\n	\n	<path id=\"map-bg\" stroke=\"#FFFFFF\" stroke-width=\"2\" fill=\"#ffffff\" d=\"M9.268,289.394l9.79-7.798l1.891,0.793l-1.629,5.021l-5.286,4.504l-4.354,7.012l-3.088-1.198l-2.234,2.885l0,0l-2.382-1.177L9.268,289.394z M573.58,174.211l19.89-13.82l8.901-2.479l5.354-4.809l1.56-5.555l-1-6.922l1.445-3.973l5.057-2.523l4.271,2.01l11.906,9.165l2.693,4.917l2.892,1.575l11.482,1.367l3.057,1.949l4.418,5.211l7.768,2.221l5.832,4.916l6.305,0.215l6.373-1.22l1.989,1.88l0.409,1.963l-5.336,10.428l-0.229,3.869l1.441,1.647l0.854,0.958l7.395-0.427l2.347,1.54l0.903,2.519l-2.102,3.054l-8.425,3.183l-2.169,7.116l0.344,3.183l3.073,4.231l0.015,2.846l-2.019,1.45l-0.739,3.843l2.166,16.687l-0.982,1.88l-6.785-3.757l-1.758,0.254l-2.019,4.468l1.032,6.237l-0.605,4.827l-0.363,2.868l-1.495,1.665l-2.102-0.129l-8.341-3.847l-4.011-0.405l-2.711,1.604l-7.438,16.497l-3.284,11.599l3.22,10.597l1.64,1.859l4.386-0.28l1.478,1.69l-1.937,3.395l-2.693,1.095l-7.851-0.129l-2.546,1.622l-2.661,3.718l0.129,0.897l0.609,4.446l-1.478,4.313l-3.68,3.312l-3.909,1.173l-11.989,7.758l-5.354,7.967l-8.938,6.539l-3.351,6.663l-5.78,6.542l-4.827,8.182l0.294,3.908l-4.896,12.287l-2.02,5.107l-3.202,22.393l0.721,8.842l-1.033,2.95l-1.725-0.276l-4.125-4.468l-1.624,0.962l-1.396,3.272l1.822,4.848l-1.692,5.021l-4.731,6.604l-8.062,19.292l-2.977,0.341l-0.541,0.448l-1.479,1.195l1.316,4.489l-2.284,3.395l-2.514,1.264l-5.484-4.532l-3.088-0.894l-0.807,1.901l2.221,7.178l-3.4,1.389l-8.363-0.13l-1.511,2.2l1.102,5.365l-0.688,2.773l-3.138,3.165l-6.603,2.8l-3.896,4.188l-4.629-1.324l-4.731,0.617l-5.092-2.584l-2.625,3.567l0.473,2.713l0.18,1.026l-1.312,1.687l-12.452,4.766l-4.598,4.485l-7.062,11.067l-17.623,19.809l-4.092,1.727l-4.498-0.617l-3.646-3.184l-2.795-6.517l-7.176-8.867l-1.233-0.556l-3.515-1.644l-1.904-3.632l1.349-5.387l-3.271-4.059l-7.015-5.512l-2.891,1.794l-4.023,0.47l-2.873-1.729l-1.267-5.555l4.799-8.354l-0.082-1.601l-2.528-4.895l-8.02-9.614l-5.352-4.166l-4.615-1.837l-4.221,0.642l-6.785-0.771l-4.813-0.574l-6.946,2.627l-3.006,4.059l-1.922,0.255l-14.568-7.837l-4.862-0.621l-8.46,1.837l-8.489-0.983l-4.207,0.664l-7.718,4.167l-3.515,0.682l-2.908-1.195l-4.812-4.683l-4.157-0.553l-7.273,1.432l-1.642-0.682l-1.363-4.127l-4.898-3.075l-3.199-5.279l-11.401-8.885l-5.222-7.159l-3.088-7.565l-0.409-5.831l3.611-12.671l0.133-5.811l-1.169-4.468l-5.846-8.418l-3.037-6.449l-2.317-4.938l1.363-2.753l3.775-2.096l2.992-7.414l4.4-3.994l2.104-3.761l-4.024-9.915l-3.844-6.729l-8.346-7.647l-8.769-2.588l-9.429-10.342l-4.257-2.325l-5.318-5.386l-7.262-1.945l-0.671-0.168l-5.175-1.393l-2.956,0.56l-2.857,0.553l-2.924-1.048l-3.944,2.096l-2.3,4.123l0.147,1.432l0.087,0.682l3.938,5.149l-2.396,2.523l-10.888-5.685l-4.207,0.151l-5.993,11.663l-4.092,3.829l-6.717-0.833l-9.921,3.266l-7.652,2.522l-2.776,3.033l-0.297,2.454l3.303,4.041l-3.023,1.091l-0.592,1.367v7.048l-6.882,15.704l-2.776,10.256l1.202,4.102l-0.825,2.609l-12.315-5.193l-8.758-6.431l-5.043,2.907l-0.886,0.488l1.481-5.211l-1.61-6.409l2.02-5.556l-0.919-2.67l-4.436,1.367l-4.681-0.6l-3.073-4.912l-1.345-4.637l1.18-2.949l2.895-1.967l7.011-0.703l1.643-1.328l-0.262-1.77l-7.345-3.549l-6.47-10.363l-6.126,0.043l-4.598,5.066l-3.564,0.873l-4.748,1.176l-0.592-2.135l1.051-3.825l-1.083-2.864l-3.285-0.706L64.375,328l-2.597,6.753l-4.698,3.291l-4.859-0.577l0.707-3.848l-1.102-2.351l-3.17,0.384l-3.171-3.158l-4.041,4.379l-3.152,0.211l-1.644-2.368l2.611-3.229l8.543-3.459l3.446-2.817l-0.115-1.242l-1-0.75l-2.693,1.263l-5.387-0.431l-2.185-2.239l-10.644-10.898l-0.592-2.135l1.707-6.603l-0.574-2.498l-3.529-2.993l-0.609-2.157l3.694-7.737l2.302-0.596l2.712-5.516l9.181-9.42l8.571,0.065l11.627-5.599l5.835-4.999l1.854-2.778l3.235-4.895l5.831-4.654l12.893-6.413l7.13-6.345l5.089-7.306l5.717-2.372l5.831-8.333l3.285-2.842l7.488-2.971l4.863-6.086l3.203-1.263l10.167,1.367l6.671-1.751l5.057-3.438l14.98-12.287l4.088-8.247l14.044-14.616l6.667-10.744l4.01,3.912l4.483-1.902l5.308-4.486l1.79-4.213l6.157-14.401l4.827-1.855l6.408,4.913l2.594-2.864l-0.738-5.853l0.674-2.968l21.963-17.885l5.039-2.734l5.799,3.312l3.367-0.875l3.533-3.696l1.808-5.257l0.459-1.324l3.299,0.707l1.414-10.493l1.821-1.324l4.666,1.303l4.465-1.346l6.556,2.113l-0.197-2.049l-0.114-1.238l-0.032-0.258l1.707-2.541l0.444,0.064l9.819,1.518h0.018l6.817-2.29l5.86-1.963l7.098-8.25l8.36-2.2l4.532-2.759l4.501-5.767l2.481-3.183l8.163-5.21l4.992,2.027l4.418-3.972l4.057-0.496l4.913-2.903l8.475-10.809l2.775,0.682l3.383,3.61l1.89,2.031l2.363,2.519l8.643-0.768l15.602-12.348l4.812-2.458l11.071-5.663l3.712-0.147l-0.478,5.447l1.891,0.79l5.767-2.669l3.611,1.259l-2.726,4.956l0.147,3.527l3.712-0.323l17.673-11.512l2.317-0.578l2.005,1.687l-0.986,2.074l0.408,1.966l11.352-1.841l4.354-2.584l1.707-2.372l4.383-6.086l7.147-5.236l12.434-5.473l4.565-0.086l0.969,1.453l-1.707,2.376l0.771,1.984l4.056-0.298l13.847-5.728l2.234,1.005l-4.089,3.994l-2.334,6.901l-2.185,1.475l-3.482-0.556l-3.221,1.044l-8.916,6.861l-6.684,5.128l-3.781,1.73l-11.396-0.298l-5.946,5.663l-3.253,4.744l-4.254,1.005l-0.179,9.312l-7.621-8.182l-4.749,0.276l-3.743,4.191l-1.234,6.449l1.743,9.617l2.808,6.492l1.872,4.339l7.048,5.681l9.378-1.238l7.112-5.063l2.299-0.233l2.876,1.92l2.987-0.168l3.877-3.309l9.296-2.993l4.909-3.248l5.85-7.242l3.103-2.117l4.06-0.129l3.399,1.967l-9.625,8.781l-0.312,0.983l-1.825,5.767l0.889,3.058l2.317,2.411l3.006-0.362l0.344,3.208l-4.056,3.459l-6.506,9.51l-4.007,2.752l-7.703-0.255l-6.685,3.506l-3.304-0.56l-2.463-3.118l-3.383-2.135l-1.939,0.254l-2.956,2.648l-2.233,5.344l-1.955,6.922l0.545,2.691l0,0l3.842,13.077l8.048,15.962l6.438,7.22l13.323,9.402l22.548,10.253l0.627,1.263l11.545,5.62l5.34,2.583l5.175,1.536l3.874-0.488l5.454-3.376L573.58,174.211z M387.517,601.973l-2.759-3.696l0.459-1.902l2.138-1.13l0.327-2.975l2.514-1.45l3.809,0.556l0.427,1.622l-2.28,7.095l-2.056,2.541l0,0L387.517,601.973z M365.657,614.346l3.909,11.491l2.217,0.663l0.982-2.07l-0.244-0.771l-1.083-3.523l0.638-2.438l2.598,0.302l2.789,3.158l3.093,0.707l2.248-3.058l-1.99-5.211l0.66-2.437l2.625-0.384l4.716,2.885l6.011,1.217l2.335,1.902l-4.634,5.555l-4.171-0.236l-1.478,1.858l-0.84,2.608l2.465,2.605l-3.203,4.766l0.083,1.773l3.528,5.469l-0.588,1.22l-2.449,0.384l-5.993-1.751l-6.193,1.963l0,0l-0.28-4.425l-8.539,0.409l-0.444-1.432l3.386-4.744l-0.789-1.622l-6.85-1.794l-0.625-4.615l4.96-5.021l-2.514-1.901l-0.409-2.136l1.492-2.031L365.657,614.346z\"/>\n	\n	<text x=\"364\" y=\"242\">A VISION OF</text>\n	<g transform=\"translate(300, 258)\"><path fill=\"#1eea79\" d=\"M87.884,1.001c-0.798,0.294-17.53,13.617-37.763,40.758c-5.892,8.472-9.319,14.607-6.895,15.53c2.239,0.838,4.49,1.636,6.75,2.396c0.617,0.207,0.942,0.231,1.182-0.186c0.557-1.071,1.02-7.933,4.357-13.306c4.809-7.73,11.214-7.384,14.873-6.612c1.808,0.397,2.969,2.006,1.463,5.342c-3.764,8.489-10.8,14.884-11.856,16.875c-0.537,1.09,0.965,1.269,1.397,1.386c1.794,0.498,3.595,0.973,5.398,1.425c1.439,0.361,2.761,2.927,10.788-17.359C90.83,11.637,88.539,0.857,87.884,1.001z M75.532,29.835c-3.243-0.57-7.874,0.491-8.566,0.324c-0.451-0.1-0.426-0.641,0.066-1.467c3.137-4.913,13.042-15.486,14.604-15.42c1.115,0.073-1.018,9.869-3.069,14.477C77.604,29.807,76.834,30.073,75.532,29.835z M98.739,68.951c-0.312,1.622-1.769,1.056-2.36,0.988c-6.699-0.752-13.365-1.799-19.979-3.149c-2.642-0.382-0.879-2.917,4.602-18.571c3.99-10.203,18.572-45.671,19.141-45.754c1.483,0.044,2.968,0.088,4.451,0.132c0.196,0.005,0.487,0.175,0.101,1.605c-0.287,1.813-8.796,18.592-15.883,40.115c-3.437,10.804-1.474,13.858,1.073,14.221c4.291,0.616,8.361-5.968,9.416-5.864C100.06,52.746,98.76,68.537,98.739,68.951z M125.874,70.104c-0.026,1.637-1.564,1.252-2.161,1.254c-6.75,0.049-13.496-0.194-20.215-0.735c-2.656-0.055-1.371-2.84,1.266-19.352c2.124-10.848,10.242-48.339,10.802-48.355c1.483,0.043,2.967,0.083,4.451,0.125c0.196,0.006,0.517,0.179,0.385,1.653c0.031,1.817-5.439,19.313-8.64,41.844c-1.489,11.277,0.977,14.13,3.55,14.212c4.335,0.133,7.208-6.848,8.27-6.842C124.346,53.915,125.823,69.701,125.874,70.104z M137.079,2.277c-4.592-0.223-8.78,23.183-9.392,44.239c-0.239,14.117,3.586,26.076,13.939,25.24c1.67-0.142,3.339-0.302,5.008-0.479c10.334-1.208,11.75-13.268,8.699-26.573C150.542,24.978,141.677,2.614,137.079,2.277z M142.675,57.229c-4.864,0.391-7.912-3.161-8.294-12.669c-0.618-17.988,2.042-29.276,4.024-29.269c1.981,0.029,6.912,10.986,9.903,28.391C149.837,52.908,147.537,56.824,142.675,57.229z M172.615,33.994c-0.75-2.012,3.379-6.399-2.047-17.234c-2.852-5.767-7.591-12.702-12.671-12.868c-2.469-0.039-4.939-0.082-7.409-0.128c-0.488-0.005-2.159-1.466,6.968,36.481c6.962,28.793,8.14,27.042,9.366,26.806c1.904-0.369,3.806-0.76,5.703-1.174c0.488-0.106,1.836-0.011,1.428-1.271c-0.205-0.496-5.167-10.32-6.865-16.02c-1.248-4.196,0.768-7.719,1.958-7.919c2.188-0.287,11.339,13.509,14.779,21.428c0.463,1.138,1.886,0.513,2.759,0.264c1.828-0.515,3.652-1.054,5.471-1.615c1.014-0.311,1.14-0.511,0.769-1.253C184.54,43.788,173.257,36.133,172.615,33.994z M163.047,32.429c-1.137,0.146-2.083-2.842-2.562-4.411c-3.939-12.948-3.467-15.445-0.68-15.546c1.653-0.06,4.131,1.495,5.981,5.957C168.639,24.872,164.461,32.217,163.047,32.429z M212.462,37.072c7.293,7.791,6.122,14.986-0.657,17.809c-11.172,4.633-23.415-7.799-30.156-21.471c-7.205-14.782-11.936-30.709-5.689-30.193c2.352,0.097,7.79,2.205,13.103,7.905c2.824,3.096,3.107,5.102,1.016,5.459c-1.327,0.189-3.905-5.323-7.809-4.971c-4.348,0.26-0.58,9.946,4.146,18c7.198,12.336,15.941,15.36,19.8,13.89c7.153-2.697,0.669-10.89,1.022-10.97C207.784,32.355,211.974,36.541,212.462,37.072z M239.422,23.489C209.694,9.329,193.988,3.845,193.291,3.493c-0.836-0.53,1.381,9.166,21.855,32.466c6.462,6.777,11.587,11.17,13.958,9.976c2.19-1.09,4.366-2.215,6.528-3.372c0.591-0.317,0.807-0.509,0.479-0.782c-0.855-0.629-8.328-3.118-12.492-6.948c-6-5.509-1.29-8.367,2.162-9.847c1.713-0.721,4.361-0.8,7.072,0.875c6.914,4.179,9.533,9.94,11.117,11.135c0.875,0.604,1.992-0.285,2.39-0.526c1.656-0.997,3.304-2.014,4.942-3.052C252.611,32.604,256.22,32.191,239.422,23.489z M218.204,19.43c-3.098,1.038-5.165,3.33-5.839,3.564c-0.437,0.144-1.069-0.103-1.715-0.666c-3.793-3.602-9.015-11.559-7.475-11.638c1.106-0.069,11.122,4.567,14.875,6.842C219.716,18.608,219.447,19.002,218.204,19.43z M53.062,31.961C35.458,55.825,34.91,53.996,33.756,53.504c-1.975-0.843-3.942-1.719-5.897-2.623c-0.551-0.252-1.807-0.598-0.872-1.647c0.789-0.739,12.531-10.264,25.624-26.005c1.065-1.252,7.374-8.602,6.308-8.791c-0.914-0.141-7.368,5.298-9.016,6.54c-13.956,10.691-17.966,16.11-20.648,14.998c-3.374-1.449,2.999-6.173,11.668-17.603c0.91-1.242,5.738-6.506,4.77-6.691c-1.048-0.222-8.439,5.527-9.704,6.515C20.147,30.25,12.102,40.352,11.343,41.127c-1.062,0.881-1.949,0.118-2.477-0.193c-1.573-0.926-3.137-1.873-4.692-2.84c-1.087-0.67-3.621-0.762,19.961-16.68C55.233,0.499,55.469,1.151,55.952,1.179c0.857,0.021,1.713,0.044,2.57,0.067c1.104,0.05,1.438-0.022-1.017,3.473c-4.623,6.894-8.271,11.144-7.653,11.237C50.293,16,54.759,12.398,64.75,5.362c5.195-3.799,5.493-3.812,6.603-3.758c0.728,0.021,1.454,0.042,2.182,0.062C74.02,1.69,76.217,0.487,53.062,31.961z\"/></g>\n\n	<g id=\"footsteps\">\n		<g id=\"dub-mateo\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M231.683,142.987c6.688-0.854,8.321-3.153,15.039-3.153c1.82,0,11.271-1.006,13.61,0c23.327,10.029-7.123,13.888,12.656,26.546c2.176,1.392,5.244,0.261,7.658,1.177c17.321,6.571,32.983,10.468,37.12,30.641c1.408,6.866-1.617,19.582-5.303,24.156c-2.756,3.419-13.768,9.224-20.514,10.134c-6.745,0.908-17.723-5.029-24.946-10.134c-2.741-1.938-5.884-7.72-3.408-16.67c1.028-3.72,8.524-8.075,12.508-8.647c6.998-1.005,37.082,10.119,31.663,31.801c-0.404,1.617-2.078,7.824-3.441,8.783c-3.968,2.791-41.061,8.429-45.611,10.111c-20.805,7.689-19.171,0.838-38.166-11.826c-21.637-14.425,0.224-29.354-1.358-39.74c-0.79-5.185-14.669-10.63-14.935-11.02c-5.515-8.09,3.981-11.847,5.008-18.766\"/>	\n		</g>\n		<g id=\"mateo-beluga\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M229.5,141.941c24.195-48.336,41.286-22.212,44.224-22.212c8.155,0,14.565-10.273,34.94-9.264c20.846,1.034,45.477,5.5,51.851,28.869c7.206,26.422-32.468,38.012-37.711,20.037c-2.341-8.025,8.203-13.729,14.733-14.143c29.788-1.887,53.581-3.458,78.365,13.552c41.304,28.348,34.208,79.204,47.728,122.559c1.768,5.668,5.71,10.643,10.018,14.729c20.361,19.318,91.262,15.682,102.524-16.498c12.72-36.343-51.428-50.097-70.707-22.388c-1.313,1.887-2.034,4.205-2.358,6.48c-2.041,14.348-4.13,28.74-4.713,43.221c-1.383,34.344,0.102,68.762-1.178,103.112c-0.457,12.279-20.215,17.932-28.872,11.197c-7.638-5.943,1.615-13.904,6.481-16.115c10.976-4.992,26.035-0.906,32.998,8.838c7.861,11.004-0.871,22.342-5.895,31.229c-19.21,33.98-35.705,38.889-74.064,38.889\"/>\n		</g>\n		<g id=\"beluga-isamu\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M402.854,452.462c-5.106-5.868-3.308-12.253-10.884-18.371c-19.256-15.556-73.641,16.346-95.927-8.557c-8.315-9.292-7.642-21.072-3.742-32.282c1.934-5.561,17.318-15.599,18.156-16.395c1.829-1.737,3.946-3.005,6.231-3.878c5.658-2.162,12.341-1.909,18.212-0.4c8.961,2.304,17.068,7.244,25.139,11.769c3.765,2.111,6.497,5.744,10.162,8.021c2.983,1.854,6.296,3.171,9.628,4.281c3.119,1.04,6.348,1.935,9.629,2.138c14.061,0.869,28.167,1.404,42.252,1.069c30.402-0.724,42.963-38.465,84.879-11.419c12.241,7.897,35.706,31.331,13.77,42.786c-2.805,1.464-18.031,2.763-18.98,9.284c-1.438,9.871,10.525,22.706,2.512,31.425c-1.514,1.646-3.844,2.658-6.071,2.859c-9.243,0.83-21.085-3.562-27.839,0.189c-15.924,8.848-15.064,41.787-33.821,42.631c-19.958,0.898-1.597-37.287-19.868-37.287\"/>\n		</g>\n		<g id=\"isamu-capas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M118.468,372.401c0,3.63-20.538,19.707-22.471,22.624c-10.599,15.99-21.487,39.066-8.734,57.214c17.566,24.999,66.521,21.384,90.404,19.653c13.21-0.957,28.551-11.933,30.572-25.769c7.923-54.234-42.672-64.583-79.049-34.938c-15.791,12.866-15.785,35.887-12.666,54.154c1.109,6.499,6.246,11.648,10.045,17.035c30.275,42.927,51.964,39.765,105.709,36.991c8.687-0.449,23.136-6.949,25.327-17.031c4.539-20.877-13.203-23.793-29.432-20.966c-20.188,3.516-19.191,39.038-13.101,51.579c7.218,14.861,29.735,16.332,42.796,17.469c27.364,2.379,61.545,6.719,76.926-21.117c15.368-27.814-34.558-40.431-25.765-4.365c5.41,22.189,63.92,16.719,71.619-3.494c1.51-3.961,3.02-8.016,3.494-12.229c0.7-6.221,0.851-12.576,0-18.779c-0.753-5.483-13.083-7.419-15.152-2.031c-7.588,19.752,20.035,13.537,30.286-2.774c2.618-4.166,5.614-26.209,5.614-26.209\"/>\n		</g>\n		<g id=\"capas-pelotas\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M133.114,350.257c77.722,36.809,45.169-9.863,79.012,0c7.798,2.272,3.937,16.349-8.925,27.655c-12.864,11.306-0.776,19.163,6.356,19.721c8.485,0.663,0.677,21.479,9.424,21.735s16.065-3.725,22.501-13.671c6.435-9.946,8.677-12.789,3.874-17.726c-10.672-10.969-0.206-21.317,0-21.366c12.291-2.916-13.184-20.64-19.398-28.408c-10.716-13.398-40.707-4.518-50.759,5.536c-19.39,19.392,13.723,53.899-17.443,73.453c-31.166,19.553,4.24,33.553-44.533,33.553c-19.999,0-39.726-27.465-26.351-46.287c3.575-5.031,12.825-16.374,16.526-21.312c7.25-9.676,2.105-9.606,15.102-11.07\"/>\n		</g>\n		<g id=\"pelotas-marta\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M137.445,325.06c5.407,1.002,10.5,2.503,16.057,1.645c9.197-1.421,10.123-14.562,8.615-20.92c-2.948-12.423-19.333-18.386-30.563-13.844c-4.998,2.021-9.207,6.557-11.382,11.49c-2.211,5.014,0.268,11.064-0.923,16.413c-0.998,4.482-4.179,8.228-5.538,12.615c-0.793,2.56,3.89,8.201,1.125,12.297c-2.689,3.984-12.813,6.431-14.532,8.392c-3.242,3.697,4.27,5.082,4.27,5.082c0.518,1.08,19.681-0.115,22.259-5.082\"/>\n		</g>\n		<g id=\"marta-kobarah\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M109.492,326.748c14.561-18.179,41.348-61.317,67.765-66.86c20.24-4.247,39.737,19.845,25.578,30.185c-16.634,12.146-32.954,5.334-19.587-15.898c7.318-11.622,33.118-9.095,40.553-7.144c28.38,7.448,49.54,36.725,30.875,62.445c-4.486,6.182-17.446,15.504-24.883,17.051c-47.334,9.85-50.638-24.046-90.336-25.808\"/>\n		</g>\n		<g id=\"kobarah-dub\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M102.71,307.721c-10.616-0.54-36.479-14.188-42.205-23.73c-6.272-10.453,12.776-29.393,22.676-31.55c4.995-1.088,10.073-2.021,15.182-2.169c20.313-0.592,62.101-7.012,60.927,26.226c-0.065,1.851-1.246,3.627-2.564,4.929c-9.599,9.483-19.291,18.963-29.969,27.212c-28.067,21.679-13.315,9.568-34.901,15.38c-9.793,2.638-18.998,7.484-28.983,9.268c-8.716,1.556-39.316-0.523-52.057,7.099c-3.555,2.127-6.54,5.508-8.281,9.268c-1.327,2.865-1.279,6.434-0.395,9.465c2.96,10.15,11.963,14.197,21.099,17.746c45.692,17.754,52.419-11.666,80.785-40.362\"/>\n		</g>\n		<g id=\"dub-paradise\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M77.634,314.211c-17.208-26.297-37.087-16.55-27.613-57.289c6.98-30.013,91.013-30.848,101.975-20.67c2.945,2.734,6.234,5.489,7.809,9.187c22.149,52.015-44.16,40.397-69.819,42.719c-6.438,0.582-7.155,12.634-1.516,14.652c3.745,1.338,12.061,3.855,16.011,4.314\"/>\n		</g>\n		<g id=\"return-to-begin\">\n			<path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n			<path fill=\"none\" stroke=\"#1eea79\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" stroke-dasharray=\"6\" d=\"M206.268,160.743c-15.267-1.514-10.214-22.142-12.499-32.591c-3.532-16.165-28.325-18.944-40.155-17.379c-20.433,2.703,2.995,50.213-9.218,64.532c-13.363,15.67-28.658-11.66-42.51,0.896c-8.573,7.77-10.678,20.556-16.81,30.366c-1.847,2.955-8.044,6.679-11.388,7.048c-30.889,3.404-34.94-9.852-41.357-10.512c-5.933-0.611-12.288-9.756-30.909,5.424c-18.621,15.179,9.62,35.727,20.587,34.774c22.711-1.977,25.028-33.067,17.868-50.834c-2.25-5.583-8.08-9.431-13.556-11.929c-5.314-2.425-28.438-2.595-34.162-2.171c-14.015,1.039-23.904,5.879-36.329,14.1c-4.478,2.962-8.126,7.124-11.388,11.389c-1.529,2-2.465,4.544-2.711,7.048c-0.85,8.636-2.03,17.478-0.543,26.028c2.383,13.706,6.245,28.063,21.146,28.741c9.933,0.451,19.972-0.795,29.825,0.543c2.128,0.289,9.088,7.636,9.788,9.667c5.014,14.569-40.285,18.409-11.386,34.17c3.625,1.977,7.4,3.801,11.386,4.881c14.564,3.951,52.502-11.621,52.502-11.621c20.286-1.086,19.42,5.761,24.767,13.085\"/>\n		</g>\n	</g>\n\n	<g id=\"map-dots\">\n		<g id=\"deia\">\n			<g transform=\"translate(210, 170)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(240, 146)\"><circle id=\"mateo\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(260, 214)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"deia\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"es-trenc\">\n			<g transform=\"translate(426, 478)\"><circle id=\"isamu\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(400, 446)\"><circle id=\"beluga\" class='dot-path' data-parent-id=\"es-trenc\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n		<g id=\"arelluf\">\n			<g transform=\"translate(121, 364)\"><circle id=\"capas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(126, 340)\"><circle id=\"pelotas\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(137, 318)\"><circle id=\"marta\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 326)\"><circle id=\"kobarah\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(106, 300)\"><circle id=\"dub\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n			<g transform=\"translate(80, 315)\"><circle id=\"paradise\" class='dot-path' data-parent-id=\"arelluf\" cx=\"0\" cy=\"0\" r=\"4\"/></g>\n		</g>\n	</g>\n\n</svg>";
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9UcmFuc2l0aW9uTWFwLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2Fyb3VuZC1ib3JkZXItaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcnJvd3Mtd3JhcHBlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ib3R0b20tdGV4dHMtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9jaGFyYWN0ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvY29sb3J5LXJlY3RzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2RpcHR5cXVlLXBhcnQuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZnVuLWZhY3QtaG9sZGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2dyaWQtaG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9ncmlkLXBvc2l0aW9ucy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9oZWFkZXItbGlua3MuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvaW1hZ2UtdG8tY2FudmFzZXMtZ3JpZC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9tYWluLWRpcHR5cXVlLWJ0bnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWFpbi1tYXAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvbWVkaWEtY2VsbC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9taW5pLXZpZGVvLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL21vYmlsZS1mb290ZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvRGlwdHlxdWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvcGFnZXMvSG9tZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9zZWxmaWUtc3RpY2suanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvc29jaWFsLWxpbmtzLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3ZpZGVvLWNhbnZhcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29uc3RhbnRzL0FwcENvbnN0YW50cy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvZGlzcGF0Y2hlcnMvQXBwRGlzcGF0Y2hlci5qcyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRGlwdHlxdWUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9GZWVkLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvSW5kZXguaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9NYXAuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Nb2JpbGUuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9QYWdlc0NvbnRhaW5lci5oYnMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL1RyYW5zaXRpb25NYXAuaGJzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9HbG9iYWxFdmVudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1ByZWxvYWRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvUm91dGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zdG9yZXMvQXBwU3RvcmUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL1B4SGVscGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9VdGlscy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvcmFmLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL1BhZ2VyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL2NvbXBvbmVudHMvQmFzZUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL2NvbXBvbmVudHMvQmFzZVBhZ2VyLmpzIiwid3d3L2RhdGEvZGF0YS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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WSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDbkYsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzFFLE9BQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDM0YsT0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDbkcsT0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakcsT0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFB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Q0FBQztFQUNIO0NBQ0QsQ0FBQyxDQUFDOztxQkFFWSxhQUFhOzs7O0FDWjVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9iYXNlJyk7XG5cbnZhciBiYXNlID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbi8vIEVhY2ggb2YgdGhlc2UgYXVnbWVudCB0aGUgSGFuZGxlYmFycyBvYmplY3QuIE5vIG5lZWQgdG8gc2V0dXAgaGVyZS5cbi8vIChUaGlzIGlzIGRvbmUgdG8gZWFzaWx5IHNoYXJlIGNvZGUgYmV0d2VlbiBjb21tb25qcyBhbmQgYnJvd3NlIGVudnMpXG5cbnZhciBfU2FmZVN0cmluZyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZycpO1xuXG52YXIgX1NhZmVTdHJpbmcyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX1NhZmVTdHJpbmcpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfaW1wb3J0MiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Mik7XG5cbnZhciBfaW1wb3J0MyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9ydW50aW1lJyk7XG5cbnZhciBydW50aW1lID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDMpO1xuXG52YXIgX25vQ29uZmxpY3QgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnKTtcblxudmFyIF9ub0NvbmZsaWN0MiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9ub0NvbmZsaWN0KTtcblxuLy8gRm9yIGNvbXBhdGliaWxpdHkgYW5kIHVzYWdlIG91dHNpZGUgb2YgbW9kdWxlIHN5c3RlbXMsIG1ha2UgdGhlIEhhbmRsZWJhcnMgb2JqZWN0IGEgbmFtZXNwYWNlXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBoYiA9IG5ldyBiYXNlLkhhbmRsZWJhcnNFbnZpcm9ubWVudCgpO1xuXG4gIFV0aWxzLmV4dGVuZChoYiwgYmFzZSk7XG4gIGhiLlNhZmVTdHJpbmcgPSBfU2FmZVN0cmluZzJbJ2RlZmF1bHQnXTtcbiAgaGIuRXhjZXB0aW9uID0gX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXTtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn1cblxudmFyIGluc3QgPSBjcmVhdGUoKTtcbmluc3QuY3JlYXRlID0gY3JlYXRlO1xuXG5fbm9Db25mbGljdDJbJ2RlZmF1bHQnXShpbnN0KTtcblxuaW5zdFsnZGVmYXVsdCddID0gaW5zdDtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gaW5zdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5IYW5kbGViYXJzRW52aXJvbm1lbnQgPSBIYW5kbGViYXJzRW52aXJvbm1lbnQ7XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIFZFUlNJT04gPSAnMy4wLjEnO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjtcbnZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDY7XG5cbmV4cG9ydHMuQ09NUElMRVJfUkVWSVNJT04gPSBDT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJ1xufTtcblxuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTtcbiAgICAgIH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHVucmVnaXN0ZXJIZWxwZXIobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiByZWdpc3RlclBhcnRpYWwobmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0F0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGFzIHVuZGVmaW5lZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHBhcnRpYWw7XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gdW5yZWdpc3RlclBhcnRpYWwobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLnBhcnRpYWxzW25hbWVdO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBBIG1pc3NpbmcgZmllbGQgaW4gYSB7e2Zvb319IGNvbnN0dWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTWlzc2luZyBoZWxwZXI6IFwiJyArIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0ubmFtZSArICdcIicpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTXVzdCBwYXNzIGl0ZXJhdG9yIHRvICNlYWNoJyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbixcbiAgICAgICAgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIHJldCA9ICcnLFxuICAgICAgICBkYXRhID0gdW5kZWZpbmVkLFxuICAgICAgICBjb250ZXh0UGF0aCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IFV0aWxzLmJsb2NrUGFyYW1zKFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLCBbY29udGV4dFBhdGggKyBmaWVsZCwgbnVsbF0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByaW9yS2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb25hbCkpIHtcbiAgICAgIGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJlbmRlciB0aGUgcG9zaXRpdmUgcGF0aCBpZiB0aGUgdmFsdWUgaXMgdHJ1dGh5IGFuZCBub3QgZW1wdHkuXG4gICAgLy8gVGhlIGBpbmNsdWRlWmVyb2Agb3B0aW9uIG1heSBiZSBzZXQgdG8gdHJlYXQgdGhlIGNvbmR0aW9uYWwgYXMgcHVyZWx5IG5vdCBlbXB0eSBiYXNlZCBvbiB0aGVcbiAgICAvLyBiZWhhdmlvciBvZiBpc0VtcHR5LiBFZmZlY3RpdmVseSB0aGlzIGRldGVybWluZXMgaWYgMCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3NpdGl2ZSBwYXRoIG9yIG5lZ2F0aXZlLlxuICAgIGlmICghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwgeyBmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZuLCBoYXNoOiBvcHRpb25zLmhhc2ggfSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFVdGlscy5pc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIG1lc3NhZ2UpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24gKG9iaiwgZmllbGQpIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialtmaWVsZF07XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDEsXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbiBsb2cobGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgKGNvbnNvbGVbbWV0aG9kXSB8fCBjb25zb2xlLmxvZykuY2FsbChjb25zb2xlLCBtZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbnZhciBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnRzLmxvZyA9IGxvZztcblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIHZhciBmcmFtZSA9IFV0aWxzLmV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKiBbYXJncywgXW9wdGlvbnMgKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lID0gdW5kZWZpbmVkLFxuICAgICAgY29sdW1uID0gdW5kZWZpbmVkO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgaWYgKGxvYykge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFeGNlcHRpb247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vKmdsb2JhbCB3aW5kb3cgKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdmFyIHJvb3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyxcbiAgICAgICRIYW5kbGViYXJzID0gcm9vdC5IYW5kbGViYXJzO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBIYW5kbGViYXJzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJvb3QuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgcm9vdC5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uO1xuXG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5leHBvcnRzLndyYXBQcm9ncmFtID0gd3JhcFByb2dyYW07XG5leHBvcnRzLnJlc29sdmVQYXJ0aWFsID0gcmVzb2x2ZVBhcnRpYWw7XG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO1xuZXhwb3J0cy5ub29wID0gbm9vcDtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxuZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgdmFyIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICBjdXJyZW50UmV2aXNpb24gPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5DT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIHZhciBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICB2YXIgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24gc3RyaWN0KG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24gbG9va3VwKGRlcHRocywgbmFtZSkge1xuICAgICAgdmFyIGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uIGxhbWJkYShjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uIGZuKGkpIHtcbiAgICAgIHJldHVybiB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbiBwcm9ncmFtKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uIGRhdGEodmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24gbWVyZ2UocGFyYW0sIGNvbW1vbikge1xuICAgICAgdmFyIG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiBwYXJhbSAhPT0gY29tbW9uKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgdmFyIGRlcHRocyA9IHVuZGVmaW5lZCxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgZGVwdGhzID0gb3B0aW9ucy5kZXB0aHMgPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IFtjb250ZXh0XTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcGxhdGVTcGVjLm1haW4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuaGVscGVycywgZW52LmhlbHBlcnMpO1xuXG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwpIHtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMucGFydGlhbHMsIGVudi5wYXJ0aWFscyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gb3B0aW9ucy5oZWxwZXJzO1xuICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uIChpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgYmxvY2sgcGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzICYmICFkZXB0aHMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgZnVuY3Rpb24gcHJvZyhjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgcmV0dXJuIGZuLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEgfHwgZGF0YSwgYmxvY2tQYXJhbXMgJiYgW29wdGlvbnMuYmxvY2tQYXJhbXNdLmNvbmNhdChibG9ja1BhcmFtcyksIGRlcHRocyAmJiBbY29udGV4dF0uY29uY2F0KGRlcHRocykpO1xuICB9XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBkZXB0aHMgPyBkZXB0aHMubGVuZ3RoIDogMDtcbiAgcHJvZy5ibG9ja1BhcmFtcyA9IGRlY2xhcmVkQmxvY2tQYXJhbXMgfHwgMDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXTtcbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5mdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLmNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJycgKyB0aGlzLnN0cmluZztcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNhZmVTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydHMuaW5kZXhPZiA9IGluZGV4T2Y7XG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO1xuZXhwb3J0cy5pc0VtcHR5ID0gaXNFbXB0eTtcbmV4cG9ydHMuYmxvY2tQYXJhbXMgPSBibG9ja1BhcmFtcztcbmV4cG9ydHMuYXBwZW5kQ29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aDtcbnZhciBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgJ1xcJyc6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2csXG4gICAgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqIC8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5leHBvcnRzLnRvU3RyaW5nID0gdG9TdHJpbmc7XG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKmVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBleHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbi8qZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtleHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENvbnRleHRQYXRoKGNvbnRleHRQYXRoLCBpZCkge1xuICByZXR1cm4gKGNvbnRleHRQYXRoID8gY29udGV4dFBhdGggKyAnLicgOiAnJykgKyBpZDtcbn0iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCIvLyBBdm9pZCBjb25zb2xlIGVycm9ycyBmb3IgdGhlIElFIGNyYXBweSBicm93c2Vyc1xuaWYgKCAhIHdpbmRvdy5jb25zb2xlICkgY29uc29sZSA9IHsgbG9nOiBmdW5jdGlvbigpe30gfTtcblxuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcCBmcm9tICdBcHAnXG5pbXBvcnQgQXBwTW9iaWxlIGZyb20gJ0FwcE1vYmlsZSdcbmltcG9ydCBUd2Vlbk1heCBmcm9tICdnc2FwJ1xuaW1wb3J0IHJhZiBmcm9tICdyYWYnXG5pbXBvcnQgTW9iaWxlRGV0ZWN0IGZyb20gJ21vYmlsZS1kZXRlY3QnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgbWQgPSBuZXcgTW9iaWxlRGV0ZWN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuXG5BcHBTdG9yZS5EZXRlY3Rvci5pc1NhZmFyaSA9IChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1NhZmFyaScpICE9IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPT0gLTEpXG5BcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IChtZC5tb2JpbGUoKSB8fCBtZC50YWJsZXQoKSkgPyB0cnVlIDogZmFsc2VcbkFwcFN0b3JlLlBhcmVudCA9IGRvbS5zZWxlY3QoJyNhcHAtY29udGFpbmVyJylcbkFwcFN0b3JlLkRldGVjdG9yLm9sZElFID0gZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU2JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU3JykgfHwgZG9tLmNsYXNzZXMuY29udGFpbnMoQXBwU3RvcmUuUGFyZW50LCAnaWU4JylcbkFwcFN0b3JlLkRldGVjdG9yLmlzU3VwcG9ydFdlYkdMID0gVXRpbHMuU3VwcG9ydFdlYkdMKClcbmlmKEFwcFN0b3JlLkRldGVjdG9yLm9sZElFKSBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxuLy8gRGVidWdcbkFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG52YXIgYXBwO1xuaWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUpIHtcblx0ZG9tLmNsYXNzZXMuYWRkKGRvbS5zZWxlY3QoJ2h0bWwnKSwgJ21vYmlsZScpXG5cdGFwcCA9IG5ldyBBcHBNb2JpbGUoKVxufWVsc2V7XG5cdGFwcCA9IG5ldyBBcHAoKVx0XG59IFxuXG5hcHAuaW5pdCgpXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGUgZnJvbSAnQXBwVGVtcGxhdGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcbmltcG9ydCBQcmVsb2FkZXIgZnJvbSAnUHJlbG9hZGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBBcHAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm9uQXBwUmVhZHkgPSB0aGlzLm9uQXBwUmVhZHkuYmluZCh0aGlzKVxuXHRcdHRoaXMubG9hZE1haW5Bc3NldHMgPSB0aGlzLmxvYWRNYWluQXNzZXRzLmJpbmQodGhpcylcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHR0aGlzLnJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgUHJlbG9hZGVyXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpXG5cblx0XHR2YXIgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVsb2FkZXInKVxuXHRcdFxuXHRcdHZhciBwbGFuZSA9IGRvbS5zZWxlY3QoJyNwbGFuZScsIHApXG5cdFx0dmFyIHBhdGggPSBNb3JwaFNWR1BsdWdpbi5wYXRoRGF0YVRvQmV6aWVyKFwiI21vdGlvblBhdGhcIilcblx0XHR2YXIgdGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRsLnRvKHBsYW5lLCA1LCB7YmV6aWVyOnt2YWx1ZXM6cGF0aCwgdHlwZTpcImN1YmljXCIsIGF1dG9Sb3RhdGU6dHJ1ZX0sIGVhc2U6TGluZWFyLmVhc2VPdXR9LCAwKVxuXHRcdHRsLnBhdXNlKClcblx0XHR0aGlzLmxvYWRlckFuaW0gPSB7XG5cdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0ZWw6IHAsXG5cdFx0XHRwbGFuZTogcGxhbmUsXG5cdFx0XHR0bDogdGxcblx0XHR9XG5cdFx0dGwudHdlZW5UbygzLjUpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblxuXHRcdHZhciBhcHBUZW1wbGF0ZSA9IG5ldyBBcHBUZW1wbGF0ZSgpXG5cdFx0YXBwVGVtcGxhdGUuaXNSZWFkeSA9IHRoaXMubG9hZE1haW5Bc3NldHNcblx0XHRhcHBUZW1wbGF0ZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHR0aGlzLnJvdXRlci5iZWdpblJvdXRpbmcoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdHZhciBzaXplID0gZG9tLnNpemUodGhpcy5sb2FkZXJBbmltLmVsKVxuXHRcdFx0dmFyIGVsID0gdGhpcy5sb2FkZXJBbmltLmVsXG5cdFx0XHRlbC5zdHlsZS5sZWZ0ID0gKHdpbmRvd1cgPj4gMSkgLSAoc2l6ZVswXSkgKyAncHgnXG5cdFx0XHRlbC5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSArIChzaXplWzFdICogMCkgKyAncHgnXG5cdFx0XHR0aGlzLmxvYWRlckFuaW0uZWwuc3R5bGUub3BhY2l0eSA9IDFcblx0XHR9LCAwKVxuXHR9XG5cdGxvYWRNYWluQXNzZXRzKCkge1xuXHRcdHZhciBoYXNoVXJsID0gbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMilcblx0XHR2YXIgcGFydHMgPSBoYXNoVXJsLnN1YnN0cigxKS5zcGxpdCgnLycpXG5cdFx0dmFyIG1hbmlmZXN0ID0gQXBwU3RvcmUucGFnZUFzc2V0c1RvTG9hZCgpXG5cdFx0aWYobWFuaWZlc3QubGVuZ3RoIDwgMSkgdGhpcy5vbkFwcFJlYWR5KClcblx0XHRlbHNlIEFwcFN0b3JlLlByZWxvYWRlci5sb2FkKG1hbmlmZXN0LCB0aGlzLm9uQXBwUmVhZHkpXG5cdH1cblx0b25BcHBSZWFkeSgpIHtcblx0XHR0aGlzLmxvYWRlckFuaW0udGwudGltZVNjYWxlKDIuNCkudHdlZW5Ubyh0aGlzLmxvYWRlckFuaW0udGwudG90YWxEdXJhdGlvbigpIC0gMC4xKVxuXHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRUd2Vlbk1heC50byh0aGlzLmxvYWRlckFuaW0uZWwsIDAuNSwgeyBvcGFjaXR5OjAsIGZvcmNlM0Q6dHJ1ZSwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdFx0XHRcdGRvbS50cmVlLnJlbW92ZSh0aGlzLmxvYWRlckFuaW0uZWwpXG5cdFx0XHRcdHRoaXMubG9hZGVyQW5pbS50bC5jbGVhcigpXG5cdFx0XHRcdHRoaXMubG9hZGVyQW5pbSA9IG51bGxcblx0XHRcdFx0QXBwQWN0aW9ucy5wYWdlSGFzaGVyQ2hhbmdlZCgpXHRcblx0XHRcdH0sIDIwMClcblx0XHR9LCAxNTAwKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFxuICAgIFx0XG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlTW9iaWxlIGZyb20gJ0FwcFRlbXBsYXRlTW9iaWxlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBBcHBNb2JpbGUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dmFyIHJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuXHRcdHJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgZ2xvYmFsIGV2ZW50c1xuXHRcdHdpbmRvdy5HbG9iYWxFdmVudHMgPSBuZXcgR0V2ZW50cygpXG5cdFx0R2xvYmFsRXZlbnRzLmluaXQoKVxuXG5cdFx0dmFyIGFwcFRlbXBsYXRlTW9iaWxlID0gbmV3IEFwcFRlbXBsYXRlTW9iaWxlKClcblx0XHRhcHBUZW1wbGF0ZU1vYmlsZS5yZW5kZXIoJyNhcHAtY29udGFpbmVyJylcblxuXHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVsb2FkZXInKVxuXHRcdGRvbS50cmVlLnJlbW92ZShlbClcblxuXHRcdC8vIFN0YXJ0IHJvdXRpbmdcblx0XHRyb3V0ZXIuYmVnaW5Sb3V0aW5nKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBNb2JpbGVcbiAgICBcdFxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCBGcm9udENvbnRhaW5lciBmcm9tICdGcm9udENvbnRhaW5lcidcbmltcG9ydCBQYWdlc0NvbnRhaW5lciBmcm9tICdQYWdlc0NvbnRhaW5lcidcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQWENvbnRhaW5lciBmcm9tICdQWENvbnRhaW5lcidcbmltcG9ydCBUcmFuc2l0aW9uTWFwIGZyb20gJ1RyYW5zaXRpb25NYXAnXG5cbmNsYXNzIEFwcFRlbXBsYXRlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLmFuaW1hdGUgPSB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHR0aGlzLmZyb250Q29udGFpbmVyID0gbmV3IEZyb250Q29udGFpbmVyKClcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyID0gbmV3IFBhZ2VzQ29udGFpbmVyKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBYQ29udGFpbmVyKClcblx0XHR0aGlzLnB4Q29udGFpbmVyLmluaXQoJyNwYWdlcy1jb250YWluZXInKVxuXHRcdEFwcEFjdGlvbnMucHhDb250YWluZXJJc1JlYWR5KHRoaXMucHhDb250YWluZXIpXG5cblx0XHR0aGlzLnRyYW5zaXRpb25NYXAgPSBuZXcgVHJhbnNpdGlvbk1hcCgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlbmRlcignI2FwcC10ZW1wbGF0ZScpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLmlzUmVhZHkoKVxuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5Gcm9udEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zyb250LWJsb2NrJylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLCB0aGlzLnJlc2l6ZSlcblx0XHR0aGlzLmFuaW1hdGUoKVxuXHR9XG5cdGFuaW1hdGUoKSB7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZSlcblx0ICAgIHRoaXMucHhDb250YWluZXIudXBkYXRlKClcblx0ICAgIHRoaXMucGFnZXNDb250YWluZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucHhDb250YWluZXIucmVzaXplKClcblx0XHR0aGlzLnBhZ2VzQ29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy50cmFuc2l0aW9uTWFwLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZVxuXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IE1vYmlsZVRlbXBsYXRlIGZyb20gJ01vYmlsZV9oYnMnXG5pbXBvcnQgRmVlZFRlbXBsYXRlIGZyb20gJ0ZlZWRfaGJzJ1xuaW1wb3J0IEluZGV4VGVtcGxhdGUgZnJvbSAnSW5kZXhfaGJzJ1xuaW1wb3J0IGZvb3RlciBmcm9tICdtb2JpbGUtZm9vdGVyJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBzY3JvbGx0b3AgZnJvbSAnc2ltcGxlLXNjcm9sbHRvcCdcblxuY2xhc3MgQXBwVGVtcGxhdGVNb2JpbGUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy5zY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblx0XHR0aGlzLnNjb3BlLmluZm9zID0gQXBwU3RvcmUuZ2xvYmFsQ29udGVudCgpXG5cdFx0dGhpcy5zY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cblx0XHR0aGlzLnNjb3BlLmdlbmVyaWMgPSBBcHBTdG9yZS5nZXRSb3V0ZVBhdGhTY29wZUJ5SWQoJy8nKS50ZXh0c1tBcHBTdG9yZS5sYW5nKCldLmdlbmVyaWNcblxuXHRcdHRoaXMucmVzaXplID0gdGhpcy5yZXNpemUuYmluZCh0aGlzKVxuXHRcdHRoaXMub25PcGVuRmVlZCA9IHRoaXMub25PcGVuRmVlZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk9wZW5HcmlkID0gdGhpcy5vbk9wZW5HcmlkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uU2Nyb2xsID0gdGhpcy5vblNjcm9sbC5iaW5kKHRoaXMpXG5cblx0XHQvLyBmaW5kIHVybHMgZm9yIGVhY2ggZmVlZFxuXHRcdHRoaXMuaW5kZXggPSBbXVxuXHRcdHRoaXMuZmVlZCA9IEFwcFN0b3JlLmdldEZlZWQoKVxuXHRcdHZhciBiYXNlVXJsID0gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpXG5cdFx0dmFyIGksIGZlZWQsIGZvbGRlciwgaWNvbiwgcGFnZUlkLCBzY29wZTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgdGhpcy5mZWVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRmZWVkID0gdGhpcy5mZWVkW2ldXG5cdFx0XHRmb2xkZXIgPSBiYXNlVXJsICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBmZWVkLmlkICsgJy8nICsgZmVlZC5wZXJzb24gKyAnLydcblx0XHRcdGljb24gPSBmb2xkZXIgKyAnaWNvbi5qcGcnXG5cdFx0XHRwYWdlSWQgPSBmZWVkLmlkICsgJy8nICsgZmVlZC5wZXJzb24gXG5cdFx0XHRzY29wZSA9IEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZChwYWdlSWQpXG5cdFx0XHRmZWVkLmljb24gPSBpY29uXG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ2ltYWdlJyAmJiBmZWVkLm1lZGlhLmlkID09ICdzaG9lJykge1xuXHRcdFx0XHRmZWVkLm1lZGlhLnVybCA9IGZvbGRlciArICdtb2JpbGUvJyArICdzaG9lLmpwZydcblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAnaW1hZ2UnICYmIGZlZWQubWVkaWEuaWQgPT0gJ2NoYXJhY3RlcicpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBmb2xkZXIgKyAnbW9iaWxlLycgKyAnY2hhcmFjdGVyLmpwZydcblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAndmlkZW8nICYmIGZlZWQubWVkaWEuaWQgPT0gJ2Z1bi1mYWN0Jykge1xuXHRcdFx0XHRmZWVkLm1lZGlhWydpcy12aWRlbyddID0gdHJ1ZVxuXHRcdFx0XHRmZWVkLm1lZGlhLnVybCA9IHNjb3BlWyd3aXN0aWEtZnVuLWlkJ11cblx0XHRcdH1cblx0XHRcdGlmKGZlZWQubWVkaWEudHlwZSA9PSAndmlkZW8nICYmIGZlZWQubWVkaWEuaWQgPT0gJ2NoYXJhY3RlcicpIHtcblx0XHRcdFx0ZmVlZC5tZWRpYVsnaXMtdmlkZW8nXSA9IHRydWVcblx0XHRcdFx0ZmVlZC5tZWRpYS51cmwgPSBzY29wZVsnd2lzdGlhLWNoYXJhY3Rlci1pZCddXG5cdFx0XHR9XG5cdFx0XHRpZihmZWVkLm1lZGlhLnR5cGUgPT0gJ2ltYWdlJykge1xuXHRcdFx0XHR0aGlzLmluZGV4LnB1c2goZmVlZClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuT1BFTl9GRUVELCB0aGlzLm9uT3BlbkZlZWQpIFxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5PUEVOX0dSSUQsIHRoaXMub25PcGVuR3JpZCkgXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHN1cGVyLnJlbmRlcignQXBwVGVtcGxhdGVNb2JpbGUnLCBwYXJlbnQsIE1vYmlsZVRlbXBsYXRlLCB0aGlzLnNjb3BlKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucG9zdHMgPSBbXVxuXHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ID0gMFxuXHRcdHRoaXMucGFnZUVuZGVkID0gZmFsc2Vcblx0XHR0aGlzLmN1cnJlbnRGZWVkSW5kZXggPSAwXG5cdFx0dGhpcy5hbGxGZWVkcyA9IFtdXG5cblx0XHR0aGlzLmZvb3RlciA9IGZvb3Rlcih0aGlzLmVsZW1lbnQsIHRoaXMuc2NvcGUpXG5cdFx0dGhpcy5tYWluQ29udGFpbmVyID0gZG9tLnNlbGVjdCgnLm1haW4tY29udGFpbmVyJywgdGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuZmVlZEVsID0gZG9tLnNlbGVjdCgnLmZlZWQnLCB0aGlzLm1haW5Db250YWluZXIpXG5cdFx0dGhpcy5pbmRleEVsID0gZG9tLnNlbGVjdCgnLmluZGV4JywgdGhpcy5tYWluQ29udGFpbmVyKVxuXG5cdFx0QXBwQWN0aW9ucy5vcGVuRmVlZCgpXG5cdFx0Ly8gQXBwQWN0aW9ucy5vcGVuR3JpZCgpXG5cblx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHR0aGlzLm9uUmVhZHkoKVxuXHRcdH0sIDApXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHR9XG5cdG9uU2Nyb2xsKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBjdXJyZW50U2Nyb2xsID0gc2Nyb2xsdG9wKCkgKyB3aW5kb3dIXG5cdFx0XHRpZihjdXJyZW50U2Nyb2xsID4gdGhpcy50b3RhbFBhZ2VIZWlnaHQpIHtcblx0XHRcdFx0dGhpcy5vblBhZ2VFbmQoKVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0fVxuXHR1cGRhdGVGZWVkVG9Eb20oZmVlZCkge1xuXHRcdHZhciBzY29wZSA9IHtcblx0XHRcdGZlZWQ6IGZlZWRcblx0XHR9XG5cdFx0dmFyIGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdHZhciB0ID0gRmVlZFRlbXBsYXRlKHNjb3BlKVxuXHRcdGguaW5uZXJIVE1MID0gdFxuXHRcdGRvbS50cmVlLmFkZCh0aGlzLmZlZWRFbCwgaClcblx0fVxuXHRnZXRMYXN0RmVlZHMoKSB7XG5cdFx0dmFyIGNvdW50ZXIgPSAwXG5cdFx0dmFyIGZlZWQgPSBbXVxuXHRcdGZvciAodmFyIGkgPSB0aGlzLmN1cnJlbnRGZWVkSW5kZXg7IGkgPCB0aGlzLmN1cnJlbnRGZWVkSW5kZXgrNDsgaSsrKSB7XG5cdFx0XHR2YXIgZiA9IHRoaXMuZmVlZFtpXVxuXHRcdFx0Y291bnRlcisrXG5cdFx0XHRmZWVkLnB1c2goZilcblx0XHR9XG5cdFx0dGhpcy5jdXJyZW50RmVlZEluZGV4ICs9IGNvdW50ZXJcblx0XHRyZXR1cm4gZmVlZFxuXHR9XG5cdHByZXBhcmVQb3N0cygpIHtcblx0XHR0aGlzLnBvc3RzID0gW11cblx0XHR2YXIgcG9zdHMgPSBkb20uc2VsZWN0LmFsbCgnLnBvc3QnLCB0aGlzLmZlZWRFbClcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZWwgPSBwb3N0c1tpXVxuXHRcdFx0dGhpcy5wb3N0c1tpXSA9IHtcblx0XHRcdFx0ZWw6IGVsLFxuXHRcdFx0XHRtZWRpYVdyYXBwZXI6IGRvbS5zZWxlY3QoJy5tZWRpYS13cmFwcGVyJywgZWwpLFxuXHRcdFx0XHRpY29uc1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5pY29ucy13cmFwcGVyJywgZWwpLFxuXHRcdFx0XHRjb21tZW50c1dyYXBwZXI6IGRvbS5zZWxlY3QoJy5jb21tZW50cy13cmFwcGVyJywgZWwpLFxuXHRcdFx0XHR0b3BXcmFwcGVyOiBkb20uc2VsZWN0KCcudG9wLXdyYXBwZXInLCBlbClcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdG9uT3BlbkZlZWQoKSB7XG5cdFx0dGhpcy5yZW1vdmVHcmlkKClcblx0XHR0aGlzLmlzRmVlZCA9IHRydWVcblx0XHR2YXIgY3VycmVudEZlZWQgPSB0aGlzLmdldExhc3RGZWVkcygpXG5cdFx0dGhpcy51cGRhdGVGZWVkVG9Eb20oY3VycmVudEZlZWQpXG5cdFx0dGhpcy5wcmVwYXJlUG9zdHMoKVxuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsKVxuXHRcdHRoaXMucmVzaXplKClcblx0fVxuXHRvbk9wZW5HcmlkKCkge1xuXHRcdHRoaXMucmVtb3ZlRmVlZCgpXG5cdFx0dGhpcy5pc0ZlZWQgPSBmYWxzZVxuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnc2Nyb2xsJywgdGhpcy5vblNjcm9sbClcblx0XHR2YXIgc2NvcGUgPSB7XG5cdFx0XHRpbmRleDogdGhpcy5pbmRleFxuXHRcdH1cblx0XHR2YXIgdCA9IEluZGV4VGVtcGxhdGUoc2NvcGUpXG5cdFx0dGhpcy5pbmRleEVsLmlubmVySFRNTCA9IHRcblx0XHR0aGlzLmluZGV4ZXMgPSBkb20uc2VsZWN0LmFsbCgnLmJsb2NrJywgdGhpcy5pbmRleEVsKVxuXHRcdHRoaXMucmVzaXplKClcblx0fVxuXHRyZW1vdmVGZWVkKCl7XG5cdFx0aWYodGhpcy5wb3N0cyA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdHRoaXMuY3VycmVudEZlZWRJbmRleCA9IDBcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9zdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwb3N0ID0gdGhpcy5wb3N0c1tpXVxuXHRcdFx0ZG9tLnRyZWUucmVtb3ZlKHBvc3QuZWwpXG5cdFx0fVxuXHR9XG5cdHJlbW92ZUdyaWQoKXtcblx0XHRpZih0aGlzLmluZGV4ZXMgPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5kZXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHBvc3QgPSB0aGlzLmluZGV4ZXNbaV1cblx0XHRcdGRvbS50cmVlLnJlbW92ZShwb3N0KVxuXHRcdH1cdFxuXHR9XG5cdG9uUGFnZUVuZCgpIHtcblx0XHRpZih0aGlzLnBhZ2VFbmRlZCkgcmV0dXJuXG5cdFx0aWYodGhpcy5jdXJyZW50RmVlZEluZGV4ID49IHRoaXMuZmVlZC5sZW5ndGgpIHJldHVyblxuXHRcdHZhciBjdXJyZW50RmVlZCA9IHRoaXMuZ2V0TGFzdEZlZWRzKClcblx0XHR0aGlzLnVwZGF0ZUZlZWRUb0RvbShjdXJyZW50RmVlZClcblx0XHR0aGlzLnByZXBhcmVQb3N0cygpXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5wYWdlRW5kZWQgPSBmYWxzZVxuXHRcdH0sIDUwKVxuXHRcdHRoaXMucGFnZUVuZGVkID0gdHJ1ZVxuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRpZih0aGlzLmlzRmVlZCkge1xuXHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgPSAwXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9zdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBvc3QgPSB0aGlzLnBvc3RzW2ldXG5cdFx0XHRcdHZhciB0b3BTaXplID0gZG9tLnNpemUocG9zdC50b3BXcmFwcGVyKVxuXHRcdFx0XHR2YXIgaWNvbnNTaXplID0gZG9tLnNpemUocG9zdC5pY29uc1dyYXBwZXIpXG5cdFx0XHRcdHZhciBjb21tZW50c1NpemUgPSBkb20uc2l6ZShwb3N0LmNvbW1lbnRzV3JhcHBlcilcblx0XHRcdFx0cG9zdC5tZWRpYVdyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0XHRwb3N0Lm1lZGlhV3JhcHBlci5zdHlsZS5oZWlnaHQgPSB3aW5kb3dXICsgJ3B4J1xuXHRcdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSB3aW5kb3dXXG5cdFx0XHRcdHRoaXMudG90YWxQYWdlSGVpZ2h0ICs9IGljb25zU2l6ZVsxXVxuXHRcdFx0XHR0aGlzLnRvdGFsUGFnZUhlaWdodCArPSBjb21tZW50c1NpemVbMV1cblx0XHRcdFx0dGhpcy50b3RhbFBhZ2VIZWlnaHQgKz0gdG9wU2l6ZVsxXVxuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIHcgPSB3aW5kb3dXIC8gM1xuXHRcdFx0dmFyIGNvdW50ZXIgPSAwXG5cdFx0XHR2YXIgaCA9IDBcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbmRleGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBpbmRleCA9IHRoaXMuaW5kZXhlc1tpXVxuXHRcdFx0XHRpbmRleC5zdHlsZS53aWR0aCA9IHcgKyAncHgnXG5cdFx0XHRcdGluZGV4LnN0eWxlLmhlaWdodCA9IHcgKyAncHgnXG5cdFx0XHRcdGluZGV4LnN0eWxlLmxlZnQgPSB3ICogY291bnRlciArICdweCdcblx0XHRcdFx0aW5kZXguc3R5bGUudG9wID0gaCArICdweCdcblx0XHRcdFx0Y291bnRlcisrXG5cdFx0XHRcdGlmKGNvdW50ZXIgPj0gMykge1xuXHRcdFx0XHRcdGggKz0gd1xuXHRcdFx0XHRcdGNvdW50ZXIgPSAwXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmZvb3Rlci5yZXNpemUoKVxuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZU1vYmlsZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBEaXNwYXRjaGVyIGZyb20gJ0FwcERpc3BhdGNoZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmZ1bmN0aW9uIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZCkge1xuICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0FTU0VUU19MT0FERUQsXG4gICAgICAgIGl0ZW06IHBhZ2VJZFxuICAgIH0pICBcbn1cblxudmFyIEFwcEFjdGlvbnMgPSB7XG4gICAgcGFnZUhhc2hlckNoYW5nZWQ6IGZ1bmN0aW9uKHBhZ2VJZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsXG4gICAgICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGxvYWRQYWdlQXNzZXRzOiBmdW5jdGlvbihwYWdlSWQpIHtcbiAgICAgICAgdmFyIG1hbmlmZXN0ID0gQXBwU3RvcmUucGFnZUFzc2V0c1RvTG9hZCgpXG4gICAgICAgIGlmKG1hbmlmZXN0Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIF9wcm9jZWVkVHJhbnNpdGlvbkluQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBBcHBTdG9yZS5QcmVsb2FkZXIubG9hZChtYW5pZmVzdCwgKCk9PntcbiAgICAgICAgICAgICAgICBfcHJvY2VlZFRyYW5zaXRpb25JbkFjdGlvbihwYWdlSWQpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dSZXNpemU6IGZ1bmN0aW9uKHdpbmRvd1csIHdpbmRvd0gpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFLFxuICAgICAgICAgICAgaXRlbTogeyB3aW5kb3dXOndpbmRvd1csIHdpbmRvd0g6d2luZG93SCB9XG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBweENvbnRhaW5lcklzUmVhZHk6IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9JU19SRUFEWSxcbiAgICAgICAgICAgIGl0ZW06IGNvbXBvbmVudFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhBZGRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxuICAgIHB4UmVtb3ZlQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCxcbiAgICAgICAgICAgIGl0ZW06IGNoaWxkXG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBvcGVuRnVuRmFjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuT1BFTl9GVU5fRkFDVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KVxuICAgIH0sXG4gICAgY2xvc2VGdW5GYWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5DTE9TRV9GVU5fRkFDVCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBjZWxsTW91c2VFbnRlcjogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0VOVEVSLFxuICAgICAgICAgICAgaXRlbTogaWRcbiAgICAgICAgfSkgXG4gICAgfSxcbiAgICBjZWxsTW91c2VMZWF2ZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0xFQVZFLFxuICAgICAgICAgICAgaXRlbTogaWRcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIG9wZW5GZWVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5PUEVOX0ZFRUQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb3BlbkdyaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLk9QRU5fR1JJRCxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBBY3Rpb25zXG5cblxuICAgICAgXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ0Zyb250Q29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBoZWFkZXJMaW5rcyBmcm9tICdoZWFkZXItbGlua3MnXG5pbXBvcnQgc29jaWFsTGlua3MgZnJvbSAnc29jaWFsLWxpbmtzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmNsYXNzIEZyb250Q29udGFpbmVyIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblxuXHRcdC8vIHRoaXMub25QYWdlQ2hhbmdlID0gdGhpcy5vblBhZ2VDaGFuZ2UuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cdFx0c2NvcGUuaW5mb3MgPSBBcHBTdG9yZS5nbG9iYWxDb250ZW50KClcblx0XHRzY29wZS5sYWJVcmwgPSBnZW5lcmFJbmZvc1snbGFiX3VybCddXG5cdFx0c2NvcGUubWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5KycvbWVuL3Nob2VzL25ldy1jb2xsZWN0aW9uJ1xuXHRcdHNjb3BlLndvbWVuU2hvcFVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJytKU19sYW5nKydfJytKU19jb3VudHJ5Kycvd29tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cblx0XHRzdXBlci5yZW5kZXIoJ0Zyb250Q29udGFpbmVyJywgcGFyZW50LCB0ZW1wbGF0ZSwgc2NvcGUpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHQvLyBBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUEFHRV9IQVNIRVJfQ0hBTkdFRCwgdGhpcy5vblBhZ2VDaGFuZ2UpXG5cblx0XHR0aGlzLmhlYWRlckxpbmtzID0gaGVhZGVyTGlua3ModGhpcy5lbGVtZW50KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXG5cdH1cblx0b25QYWdlQ2hhbmdlKCkge1xuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZyb250Q29udGFpbmVyXG5cblxuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBYQ29udGFpbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdChlbGVtZW50SWQpIHtcblx0XHR0aGlzLmNsZWFyQmFjayA9IGZhbHNlXG5cblx0XHR0aGlzLmFkZCA9IHRoaXMuYWRkLmJpbmQodGhpcylcblx0XHR0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQodGhpcylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELCB0aGlzLmFkZClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCwgdGhpcy5yZW1vdmUpXG5cblx0XHR2YXIgcmVuZGVyT3B0aW9ucyA9IHtcblx0XHQgICAgcmVzb2x1dGlvbjogMSxcblx0XHQgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG5cdFx0ICAgIGFudGlhbGlhczogdHJ1ZVxuXHRcdH07XG5cdFx0dGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdC8vIHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMuY3VycmVudENvbG9yID0gMHhmZmZmZmZcblx0XHR2YXIgZWwgPSBkb20uc2VsZWN0KGVsZW1lbnRJZClcblx0XHR0aGlzLnJlbmRlcmVyLnZpZXcuc2V0QXR0cmlidXRlKCdpZCcsICdweC1jb250YWluZXInKVxuXHRcdEFwcFN0b3JlLkNhbnZhcyA9IHRoaXMucmVuZGVyZXIudmlld1xuXHRcdGRvbS50cmVlLmFkZChlbCwgdGhpcy5yZW5kZXJlci52aWV3KVxuXHRcdHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdC8vIHRoaXMuYmFja2dyb3VuZCA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHQvLyB0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHRcdC8vIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5iYWNrZ3JvdW5kKVxuXG5cdFx0Ly8gdGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuXHRcdC8vIC8vIHRoaXMuc3RhdHMuc2V0TW9kZSggMSApOyAvLyAwOiBmcHMsIDE6IG1zLCAyOiBtYlxuXG5cdFx0Ly8gLy8gYWxpZ24gdG9wLWxlZnRcblx0XHQvLyB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0Ly8gdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdC8vIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZVsnei1pbmRleCddID0gOTk5OTk5XG5cblx0XHQvLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLnN0YXRzLmRvbUVsZW1lbnQgKTtcblxuXHR9XG5cdGRyYXdCYWNrZ3JvdW5kKGNvbG9yKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMuYmFja2dyb3VuZC5jbGVhcigpXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmxpbmVTdHlsZSgwKTtcblx0XHR0aGlzLmJhY2tncm91bmQuYmVnaW5GaWxsKGNvbG9yLCAxKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgd2luZG93Vywgd2luZG93SCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmVuZEZpbGwoKTtcblx0fVxuXHRhZGQoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGNoaWxkKVxuXHR9XG5cdHJlbW92ZShjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQoY2hpbGQpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdC8vIHRoaXMuc3RhdHMudXBkYXRlKClcblx0ICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdHZhciBzY2FsZSA9IDFcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMucmVuZGVyZXIucmVzaXplKHdpbmRvd1cgKiBzY2FsZSwgd2luZG93SCAqIHNjYWxlKVxuXHRcdC8vIHRoaXMuZHJhd0JhY2tncm91bmQodGhpcy5jdXJyZW50Q29sb3IpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlUGFnZSBmcm9tICdCYXNlUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBQeEhlbHBlciBmcm9tICdQeEhlbHBlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2UgZXh0ZW5kcyBCYXNlUGFnZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dGhpcy50cmFuc2l0aW9uSW5Db21wbGV0ZWQgPSBmYWxzZVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weEFkZENoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHdpbGxUcmFuc2l0aW9uSW4oKSB7XG5cdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSA0XG5cdFx0c3VwZXIud2lsbFRyYW5zaXRpb25JbigpXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdEFwcFN0b3JlLkNhbnZhcy5zdHlsZVsnei1pbmRleCddID0gNFxuXHRcdH0sIDUwMClcblx0XHRzdXBlci53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0aWYodGhpcy5wcm9wcy5oYXNoLnR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcblx0XHRcdHRoaXMudHJhbnNpdGlvbkluQ29tcGxldGVkID0gdHJ1ZVxuXHRcdFx0QXBwU3RvcmUuQ2FudmFzLnN0eWxlWyd6LWluZGV4J10gPSAwXG5cdFx0fWVsc2V7XG5cdFx0XHRBcHBTdG9yZS5DYW52YXMuc3R5bGVbJ3otaW5kZXgnXSA9IDFcblx0XHR9XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdGdldEltYWdlVXJsQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlVVJMKHVybClcblx0fVxuXHRnZXRJbWFnZVNpemVCeUlkKGlkKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMucHJvcHMuaGFzaC50eXBlID09IEFwcENvbnN0YW50cy5IT01FID8gJ2hvbWUtJyArIGlkIDogdGhpcy5wcm9wcy5oYXNoLnBhcmVudCArICctJyArIHRoaXMucHJvcHMuaGFzaC50YXJnZXQgKyAnLScgKyBpZFxuXHRcdHJldHVybiBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VTaXplKHVybClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UHhIZWxwZXIucmVtb3ZlQ2hpbGRyZW5Gcm9tQ29udGFpbmVyKHRoaXMucHhDb250YWluZXIpXG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4UmVtb3ZlQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCB7UGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50c30gZnJvbSAnUGFnZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQmFzZVBhZ2VyIGZyb20gJ0Jhc2VQYWdlcidcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEhvbWUgZnJvbSAnSG9tZSdcbmltcG9ydCBIb21lVGVtcGxhdGUgZnJvbSAnSG9tZV9oYnMnXG5pbXBvcnQgRGlwdHlxdWUgZnJvbSAnRGlwdHlxdWUnXG5pbXBvcnQgRGlwdHlxdWVUZW1wbGF0ZSBmcm9tICdEaXB0eXF1ZV9oYnMnXG5cbmNsYXNzIFBhZ2VzQ29udGFpbmVyIGV4dGVuZHMgQmFzZVBhZ2VyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuZGlkSGFzaGVyQ2hhbmdlID0gdGhpcy5kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZUFzc2V0c0xvYWRlZCA9IHRoaXMucGFnZUFzc2V0c0xvYWRlZC5iaW5kKHRoaXMpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMuZGlkSGFzaGVyQ2hhbmdlKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QQUdFX0FTU0VUU19MT0FERUQsIHRoaXMucGFnZUFzc2V0c0xvYWRlZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0ZGlkSGFzaGVyQ2hhbmdlKCkge1xuXG5cdFx0QXBwU3RvcmUuUGFyZW50LnN0eWxlLmN1cnNvciA9ICd3YWl0J1xuXHRcdEFwcFN0b3JlLkZyb250QmxvY2suc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblx0XHRcblx0XHR2YXIgbmV3SGFzaCA9IFJvdXRlci5nZXROZXdIYXNoKClcblx0XHR2YXIgb2xkSGFzaCA9IFJvdXRlci5nZXRPbGRIYXNoKClcblx0XHRpZihvbGRIYXNoID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdH1lbHNle1xuXHRcdFx0UGFnZXJBY3Rpb25zLm9uVHJhbnNpdGlvbk91dCgpXG5cdFx0XHQvLyB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCgpXG5cdFx0fVxuXHR9XG5cdHRlbXBsYXRlU2VsZWN0aW9uKG5ld0hhc2gpIHtcblx0XHR2YXIgdHlwZSA9IHVuZGVmaW5lZFxuXHRcdHZhciB0ZW1wbGF0ZSA9IHVuZGVmaW5lZFxuXHRcdHN3aXRjaChuZXdIYXNoLnR5cGUpIHtcblx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkRJUFRZUVVFOlxuXHRcdFx0XHR0eXBlID0gRGlwdHlxdWVcblx0XHRcdFx0dGVtcGxhdGUgPSBEaXB0eXF1ZVRlbXBsYXRlXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5IT01FOlxuXHRcdFx0XHR0eXBlID0gSG9tZVxuXHRcdFx0XHR0ZW1wbGF0ZSA9IEhvbWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHR9XG5cdFx0dGhpcy5zZXR1cE5ld0NvbXBvbmVudChuZXdIYXNoLCB0eXBlLCB0ZW1wbGF0ZSlcblx0XHR0aGlzLmN1cnJlbnRDb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHR9XG5cdHBhZ2VBc3NldHNMb2FkZWQoKSB7XG5cdFx0dmFyIG5ld0hhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dGhpcy50ZW1wbGF0ZVNlbGVjdGlvbihuZXdIYXNoKVxuXHRcdHN1cGVyLnBhZ2VBc3NldHNMb2FkZWQoKVxuXHR9XG5cdHVwZGF0ZSgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRDb21wb25lbnQgIT0gdW5kZWZpbmVkKSB0aGlzLmN1cnJlbnRDb21wb25lbnQudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFnZXNDb250YWluZXJcblxuXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnVHJhbnNpdGlvbk1hcF9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQ29uc3RhbnRzfSBmcm9tICdQYWdlcidcblxuY2xhc3MgVHJhbnNpdGlvbk1hcCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5vblBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5wcmVsb2FkZXJQcm9ncmVzcyA9IHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHR2YXIgc2NvcGUgPSB7fVxuXHRcdHZhciBnZW5lcmFJbmZvcyA9IEFwcFN0b3JlLmdlbmVyYWxJbmZvcygpXG5cblx0XHRzdXBlci5yZW5kZXIoJ1RyYW5zaXRpb25NYXAnLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmN1cnJlbnRQcm9ncmVzcyA9IDBcblxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy5vblBhZ2VUcmFuc2l0aW9uT3V0KVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX0NPTVBMRVRFLCB0aGlzLm9uUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdEFwcFN0b3JlLlByZWxvYWRlci5xdWV1ZS5vbihcInByb2dyZXNzXCIsIHRoaXMucHJlbG9hZGVyUHJvZ3Jlc3MsIHRoaXMpXG5cblx0XHR0aGlzLm1hcCA9IG1hcCh0aGlzLmVsZW1lbnQsIEFwcENvbnN0YW50cy5UUkFOU0lUSU9OKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUGFnZVRyYW5zaXRpb25PdXQoKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgPSAwXG5cdFx0dGhpcy5tYXAuaGlnaGxpZ2h0KFJvdXRlci5nZXRPbGRIYXNoKCksIFJvdXRlci5nZXROZXdIYXNoKCkpXG5cdH1cblx0b25QYWdlVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dmFyIG9sZEhhc2ggPSBSb3V0ZXIuZ2V0T2xkSGFzaCgpXG5cdFx0aWYob2xkSGFzaCA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gMFxuXHRcdHRoaXMubWFwLnJlc2V0SGlnaGxpZ2h0KClcblx0fVxuXHRwcmVsb2FkZXJQcm9ncmVzcyhlKSB7XG5cdFx0dGhpcy5jdXJyZW50UHJvZ3Jlc3MgKz0gMC4yXG5cdFx0aWYoZS5wcm9ncmVzcyA+IDAuOTkpIHRoaXMuY3VycmVudFByb2dyZXNzID0gMVxuXHRcdHRoaXMuY3VycmVudFByb2dyZXNzID0gdGhpcy5jdXJyZW50UHJvZ3Jlc3MgPiAxID8gMSA6IHRoaXMuY3VycmVudFByb2dyZXNzIFxuXHRcdHRoaXMubWFwLnVwZGF0ZVByb2dyZXNzKGUucHJvZ3Jlc3MpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMubWFwLnJlc2l6ZSgpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNpdGlvbk1hcFxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGFyb3VuZEJvcmRlciA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgJGNvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIHRvcCA9IGRvbS5zZWxlY3QoJy50b3AnLCAkY29udGFpbmVyKVxuXHR2YXIgYm90dG9tID0gZG9tLnNlbGVjdCgnLmJvdHRvbScsICRjb250YWluZXIpXG5cdHZhciBsZWZ0ID0gZG9tLnNlbGVjdCgnLmxlZnQnLCAkY29udGFpbmVyKVxuXHR2YXIgcmlnaHQgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkY29udGFpbmVyKVxuXG5cdHZhciAkbGV0dGVyc0NvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5hcm91bmQtYm9yZGVyLWxldHRlcnMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgdG9wTGV0dGVycyA9IGRvbS5zZWxlY3QoJy50b3AnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblx0dmFyIGJvdHRvbUxldHRlcnMgPSBkb20uc2VsZWN0KCcuYm90dG9tJywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciBsZWZ0TGV0dGVycyA9IGRvbS5zZWxlY3QoJy5sZWZ0JywgJGxldHRlcnNDb250YWluZXIpLmNoaWxkcmVuXG5cdHZhciByaWdodExldHRlcnMgPSBkb20uc2VsZWN0KCcucmlnaHQnLCAkbGV0dGVyc0NvbnRhaW5lcikuY2hpbGRyZW5cblxuXHRzY29wZSA9IHtcblx0XHRlbDogJGNvbnRhaW5lcixcblx0XHRsZXR0ZXJzOiAkbGV0dGVyc0NvbnRhaW5lcixcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIGJvcmRlclNpemUgPSAxMFxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTIF1cblxuXHRcdFx0dG9wLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvd1cgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJvcmRlclNpemUgKyAncHgnXG5cdFx0XHRsZWZ0LnN0eWxlLmhlaWdodCA9IHJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRyaWdodC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJvcmRlclNpemUgKyAncHgnXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgdGwgPSB0b3BMZXR0ZXJzW2ldXG5cdFx0XHRcdHRsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0dGwuc3R5bGUudG9wID0gLTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBib3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBibCA9IGJvdHRvbUxldHRlcnNbaV1cblx0XHRcdFx0Ymwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gMTIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGwgPSBsZWZ0TGV0dGVyc1tpXVxuXHRcdFx0XHRsbC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bGwuc3R5bGUubGVmdCA9IDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJsID0gcmlnaHRMZXR0ZXJzW2ldXG5cdFx0XHRcdHJsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRybC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIDggKyAncHgnXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dG9wTGV0dGVycyA9IG51bGxcblx0XHRcdGJvdHRvbUxldHRlcnMgPSBudWxsXG5cdFx0XHRsZWZ0TGV0dGVycyA9IG51bGxcblx0XHRcdHJpZ2h0TGV0dGVycyA9IG51bGxcblx0XHR9XG5cdH0gXG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyb3VuZEJvcmRlciIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgb25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmUpPT4ge1xuXHR2YXIgc2NvcGU7XG5cdHZhciBhcnJvd3NXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmFycm93cy13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgbGVmdEFycm93ID0gZG9tLnNlbGVjdCgnLmFycm93LmxlZnQnLCBhcnJvd3NXcmFwcGVyKVxuXHR2YXIgcmlnaHRBcnJvdyA9IGRvbS5zZWxlY3QoJy5hcnJvdy5yaWdodCcsIGFycm93c1dyYXBwZXIpXG5cdHZhciBhcnJvd3MgPSB7XG5cdFx0bGVmdDoge1xuXHRcdFx0ZWw6IGxlZnRBcnJvdyxcblx0XHRcdGljb25zOiBkb20uc2VsZWN0LmFsbCgnc3ZnJywgbGVmdEFycm93KSxcblx0XHRcdGljb25zV3JhcHBlcjogZG9tLnNlbGVjdCgnLmljb25zLXdyYXBwZXInLCBsZWZ0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCBsZWZ0QXJyb3cpXG5cdFx0fSxcblx0XHRyaWdodDoge1xuXHRcdFx0ZWw6IHJpZ2h0QXJyb3csXG5cdFx0XHRpY29uczogZG9tLnNlbGVjdC5hbGwoJ3N2ZycsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0aWNvbnNXcmFwcGVyOiBkb20uc2VsZWN0KCcuaWNvbnMtd3JhcHBlcicsIHJpZ2h0QXJyb3cpLFxuXHRcdFx0YmFja2dyb3VuZDogZG9tLnNlbGVjdCgnLmJhY2tncm91bmQnLCByaWdodEFycm93KVxuXHRcdH1cblx0fVxuXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MubGVmdC5lbCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdGRvbS5ldmVudC5vbihhcnJvd3MucmlnaHQuZWwsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRkb20uZXZlbnQub24oYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRsZWZ0OiBhcnJvd3MubGVmdC5lbCxcblx0XHRyaWdodDogYXJyb3dzLnJpZ2h0LmVsLFxuXHRcdGJhY2tncm91bmQ6IChkaXIpPT4ge1xuXHRcdFx0cmV0dXJuIGFycm93c1tkaXJdLmJhY2tncm91bmRcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIGFycm93U2l6ZSA9IGRvbS5zaXplKGFycm93cy5sZWZ0Lmljb25zWzFdKVxuXHRcdFx0dmFyIG9mZnNldFkgPSAyMFxuXHRcdFx0dmFyIGJnV2lkdGggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cblx0XHRcdGFycm93cy5yaWdodC5lbC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJnV2lkdGggKyAncHgnXG5cblx0XHRcdGFycm93cy5sZWZ0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuYmFja2dyb3VuZC5zdHlsZS5oZWlnaHQgPSB3aW5kb3dIICsgJ3B4J1xuXHRcdFx0YXJyb3dzLmxlZnQuaWNvbnNXcmFwcGVyLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGFycm93U2l6ZVswXSA+PiAxKSAtIG9mZnNldFkgKyAncHgnXG5cdFx0XHRhcnJvd3MubGVmdC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCArICdweCdcblxuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUud2lkdGggPSBiZ1dpZHRoICsgJ3B4J1xuXHRcdFx0YXJyb3dzLnJpZ2h0LmJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYXJyb3dTaXplWzBdID4+IDEpIC0gb2Zmc2V0WSArICdweCdcblx0XHRcdGFycm93cy5yaWdodC5pY29uc1dyYXBwZXIuc3R5bGUubGVmdCA9IGJnV2lkdGggLSBhcnJvd1NpemVbMF0gLSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKyAncHgnXG5cdFx0XHRcdFxuXHRcdH0sXG5cdFx0b3ZlcjogKGRpcik9PiB7XG5cdFx0XHR2YXIgYXJyb3cgPSBhcnJvd3NbZGlyXVxuXHRcdFx0ZG9tLmNsYXNzZXMuYWRkKGFycm93LmVsLCAnaG92ZXJlZCcpXG5cdFx0fSxcblx0XHRvdXQ6IChkaXIpPT4ge1xuXHRcdFx0dmFyIGFycm93ID0gYXJyb3dzW2Rpcl1cblx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShhcnJvdy5lbCwgJ2hvdmVyZWQnKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0ZG9tLmV2ZW50Lm9mZihhcnJvd3MubGVmdC5lbCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGFycm93cy5sZWZ0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoYXJyb3dzLnJpZ2h0LmVsLCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGFycm93cyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgYm90dG9tVGV4dHMgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5ib3R0b20tdGV4dHMtY29udGFpbmVyJywgcGFyZW50KVxuXHR2YXIgc29jaWFsV3JhcHBlciA9IGRvbS5zZWxlY3QoJyNzb2NpYWwtd3JhcHBlcicsIGVsKVxuXHR2YXIgdGl0bGVzV3JhcHBlciA9IGRvbS5zZWxlY3QoJy50aXRsZXMtd3JhcHBlcicsIGVsKVxuXHR2YXIgYWxsVGl0bGVzID0gZG9tLnNlbGVjdC5hbGwoJ2xpJywgdGl0bGVzV3JhcHBlcilcblx0dmFyIHRleHRzRWxzID0gZG9tLnNlbGVjdC5hbGwoJy50ZXh0cy13cmFwcGVyIC50eHQnLCBlbClcblx0dmFyIHRleHRzID0gW11cblx0dmFyIGlkcyA9IFsnZ2VuZXJpYycsICdkZWlhJywgJ2FyZWxsdWYnLCAnZXMtdHJlbmMnXVxuXHR2YXIgb2xkVGw7XG5cdHZhciBmaXJzdFRpbWUgPSB0cnVlXG5cblx0dmFyIG9uVGl0bGVDbGlja2VkID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXHRcdHNjb3BlLm9wZW5UeHRCeUlkKGlkKVxuXHR9XG5cblx0dmFyIGksIHQ7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYWxsVGl0bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dCA9IGFsbFRpdGxlc1tpXVxuXHRcdGRvbS5ldmVudC5vbih0LCAnY2xpY2snLCBvblRpdGxlQ2xpY2tlZClcblx0fVxuXG5cdHZhciBpZCwgZSwgaSwgc3BsaXQ7XG5cdGZvciAoaSA9IDA7IGkgPCBpZHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZCA9IGlkc1tpXVxuXHRcdGUgPSB0ZXh0c0Vsc1tpXVxuXHRcdFxuXHRcdHRleHRzW2ldID0ge1xuXHRcdFx0aWQ6IGlkLFxuXHRcdFx0ZWw6IGVcblx0XHR9XG5cdH1cblxuXHR2YXIgcmVzaXplID0gKCk9PiB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfUk9XUyBdXG5cblx0XHR2YXIgcGFkZGluZyA9IDQwXG5cdFx0dmFyIGJvcmRlckFyb3VuZFxuXHRcdGJsb2NrU2l6ZVswXSAqPSAyIFxuXHRcdGJsb2NrU2l6ZVsxXSAqPSAyIFxuXHRcdGJsb2NrU2l6ZVswXSAtPSBwYWRkaW5nXG5cdFx0YmxvY2tTaXplWzFdIC09IHBhZGRpbmdcblx0XHR2YXIgaW5uZXJCbG9ja1NpemUgPSBbYmxvY2tTaXplWzBdIC0gMTAsIGJsb2NrU2l6ZVsxXSAtIDEwXVxuXHRcdHZhciB0ZXh0VyA9IGlubmVyQmxvY2tTaXplWzBdICogMC44XG5cblx0XHRlbC5zdHlsZS53aWR0aCA9IGlubmVyQmxvY2tTaXplWzBdICsgJ3B4J1xuXHRcdGVsLnN0eWxlLmhlaWdodCA9IGlubmVyQmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdGVsLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gYmxvY2tTaXplWzBdIC0gKHBhZGRpbmcgPj4gMSkgKyAncHgnXG5cdFx0ZWwuc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSAtIChwYWRkaW5nID4+IDEpICsgJ3B4J1xuXG5cdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdHZhciBzb2NpYWxTaXplID0gZG9tLnNpemUoc29jaWFsV3JhcHBlcilcblx0XHRcdHZhciB0aXRsZXNTaXplID0gZG9tLnNpemUodGl0bGVzV3JhcHBlcilcblxuXHRcdFx0dmFyIGksIHRleHQsIHMsIHNwbGl0LCB0bDtcblx0XHRcdGZvciAoaSA9IDA7IGkgPCB0ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0ZXh0ID0gdGV4dHNbaV1cblx0XHRcdFx0cyA9IGRvbS5zaXplKHRleHQuZWwpXG5cdFx0XHRcdHRleHQuZWwuc3R5bGUudG9wID0gKGlubmVyQmxvY2tTaXplWzFdID4+IDEpIC0gKHNbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdHNwbGl0ID0gbmV3IFNwbGl0VGV4dCh0ZXh0LmVsLCB7dHlwZTpcImxpbmVzXCJ9KS5saW5lc1xuXHRcdFx0XHRpZih0ZXh0LnRsICE9IHVuZGVmaW5lZCkgdGV4dC50bC5jbGVhcigpXG5cdFx0XHRcdHRsID0gbmV3IFRpbWVsaW5lTWF4KClcblx0XHRcdFx0dGwuc3RhZ2dlckZyb20oc3BsaXQsIDEsIHsgeTo1LCBzY2FsZVk6Miwgb3BhY2l0eTowLCBmb3JjZTNEOnRydWUsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJywgZWFzZTpFeHBvLmVhc2VPdXQgfSwgMC4wNSwgMClcblx0XHRcdFx0dGwucGF1c2UoMClcblx0XHRcdFx0dGV4dC50bCA9IHRsXG5cdFx0XHR9XG5cblx0XHRcdHNvY2lhbFdyYXBwZXIuc3R5bGUubGVmdCA9IChpbm5lckJsb2NrU2l6ZVswXSA+PiAxKSAtIChzb2NpYWxTaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0c29jaWFsV3JhcHBlci5zdHlsZS50b3AgPSBpbm5lckJsb2NrU2l6ZVsxXSAtIHNvY2lhbFNpemVbMV0gLSAocGFkZGluZyA+PiAxKSArICdweCdcblxuXHRcdH0sIDApXG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHRvcGVuVHh0QnlJZDogKGlkKT0+IHtcblx0XHRcdHZhciBpLCB0ZXh0O1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0c1tpXVxuXHRcdFx0XHRpZihpZCA9PSB0ZXh0LmlkKSB7XG5cdFx0XHRcdFx0aWYob2xkVGwgIT0gdW5kZWZpbmVkKSBvbGRUbC50aW1lU2NhbGUoMi42KS5yZXZlcnNlKClcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpPT50ZXh0LnRsLnRpbWVTY2FsZSgxLjIpLnBsYXkoKSwgNjAwKVxuXHRcdFx0XHRcdG9sZFRsID0gdGV4dC50bFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHR2YXIgaSwgdDtcblx0XHRcdGZvciAoaSA9IDA7IGkgPCBhbGxUaXRsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dCA9IGFsbFRpdGxlc1tpXVxuXHRcdFx0XHRkb20uZXZlbnQub2ZmKHQsICdjbGljaycsIG9uVGl0bGVDbGlja2VkKVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHQgPSB0ZXh0c1tpXVxuXHRcdFx0XHR0LnRsLmNsZWFyKClcblx0XHRcdH1cblx0XHRcdGlkcyA9IG51bGxcblx0XHRcdHRleHRzID0gbnVsbFxuXHRcdFx0YWxsVGl0bGVzID0gbnVsbFxuXHRcdFx0dGV4dHNFbHMgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJvdHRvbVRleHRzIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5leHBvcnQgZGVmYXVsdCAoaG9sZGVyLCBjaGFyYWN0ZXJVcmwsIHRleHR1cmVTaXplKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIHRleCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoY2hhcmFjdGVyVXJsKVxuXHR2YXIgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleClcblx0c3ByaXRlLmFuY2hvci54ID0gc3ByaXRlLmFuY2hvci55ID0gMC41XG5cdGhvbGRlci5hZGRDaGlsZChzcHJpdGUpXG5cblx0dmFyIG1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHRob2xkZXIuYWRkQ2hpbGQobWFzaylcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHR1cGRhdGU6IChtb3VzZSk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgblggPSAoKCAoIG1vdXNlLnggLSAoIHdpbmRvd1cgPj4gMSkgKSAvICggd2luZG93VyA+PiAxICkgKSAqIDEpIC0gMC41XG5cdFx0XHR2YXIgblkgPSBtb3VzZS5uWSAtIDAuNVxuXHRcdFx0dmFyIG5ld3ggPSBzcHJpdGUuaXggKyAoMTAgKiBuWClcblx0XHRcdHZhciBuZXd5ID0gc3ByaXRlLml5ICsgKDEwICogblkpXG5cdFx0XHRzcHJpdGUueCArPSAobmV3eCAtIHNwcml0ZS54KSAqIDAuMDNcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wM1xuXHRcdH0sXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dIIC0gMTAwKSAvIHRleHR1cmVTaXplLmhlaWdodCkgKiAxXG5cdFx0XHRcdHNwcml0ZS5zY2FsZS54ID0gc3ByaXRlLnNjYWxlLnkgPSBzY2FsZVxuXHRcdFx0XHRzcHJpdGUueCA9IHNpemVbMF0gPj4gMVxuXHRcdFx0XHRzcHJpdGUueSA9IHNpemVbMV0gLSAoKHRleHR1cmVTaXplLmhlaWdodCAqIHNjYWxlKSA+PiAxKSArIDEwXG5cdFx0XHRcdHNwcml0ZS5peCA9IHNwcml0ZS54XG5cdFx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0aG9sZGVyLnJlbW92ZUNoaWxkKHNwcml0ZSlcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0bWFzay5jbGVhcigpXG5cdFx0XHRzcHJpdGUuZGVzdHJveSgpXG5cdFx0XHRzcHJpdGUgPSBudWxsXG5cdFx0XHR0ZXggPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgY29sb3JzKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIGhvbGRlciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpXG5cdHB4Q29udGFpbmVyLmFkZENoaWxkKGhvbGRlcilcblxuXHR2YXIgYmdDb2xvcnMgPSBbXVxuXHRiZ0NvbG9ycy5sZW5ndGggPSA1XG5cblx0dmFyIHRsID0gbmV3IFRpbWVsaW5lTGl0ZSgpXG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBiZ0NvbG9yID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuXHRcdGJnQ29sb3JzW2ldID0gYmdDb2xvclxuXHRcdGhvbGRlci5hZGRDaGlsZChiZ0NvbG9yKVxuXHR9O1xuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0dGwudGltZVNjYWxlKDEuNSlcblx0XHR0bC5wbGF5KDApXG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHR9XG5cdHZhciBjbG9zZSA9ICgpPT4ge1xuXHRcdHRsLnRpbWVTY2FsZSgyKVxuXHRcdHRsLnJldmVyc2UoKVxuXHRcdHNjb3BlLmlzT3BlbiA9IGZhbHNlXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHR0bDogdGwsXG5cdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRvcGVuOiBvcGVuLFxuXHRcdGNsb3NlOiBjbG9zZSxcblx0XHRyZXNpemU6ICh3aWR0aCwgaGVpZ2h0LCBkaXJlY3Rpb24pPT57XG5cblx0XHRcdHRsLmNsZWFyKClcblxuXHRcdFx0dmFyIGhzID0gY29sb3JzLmZyb20uaCAtIGNvbG9ycy50by5oXG5cdFx0XHR2YXIgc3MgPSBjb2xvcnMuZnJvbS5zIC0gY29sb3JzLnRvLnNcblx0XHRcdHZhciB2cyA9IGNvbG9ycy5mcm9tLnYgLSBjb2xvcnMudG8udlxuXHRcdFx0dmFyIGxlbiA9IGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIHN0ZXBIID0gaHMgLyBiZ0NvbG9ycy5sZW5ndGhcblx0XHRcdHZhciBzdGVwUyA9IHNzIC8gYmdDb2xvcnMubGVuZ3RoXG5cdFx0XHR2YXIgc3RlcFYgPSB2cyAvIGJnQ29sb3JzLmxlbmd0aFxuXHRcdFx0dmFyIGhkID0gKGhzIDwgMCkgPyAtMSA6IDFcblx0XHRcdHZhciBzZCA9IChzcyA8IDApID8gLTEgOiAxXG5cdFx0XHR2YXIgdmQgPSAodnMgPCAwKSA/IC0xIDogMVxuXG5cdFx0XHR2YXIgZGVsYXkgPSAwLjEyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdHZhciBiZ0NvbG9yID0gYmdDb2xvcnNbaV1cblx0XHRcdFx0dmFyIGggPSBNYXRoLnJvdW5kKGNvbG9ycy5mcm9tLmggKyAoc3RlcEgqaSpoZCkpXG5cdFx0XHRcdHZhciBzID0gTWF0aC5yb3VuZChjb2xvcnMuZnJvbS5zICsgKHN0ZXBTKmkqc2QpKVxuXHRcdFx0XHR2YXIgdiA9IE1hdGgucm91bmQoY29sb3JzLmZyb20udiArIChzdGVwVippKnZkKSlcblx0XHRcdFx0dmFyIGMgPSAnMHgnICsgY29sb3JVdGlscy5oc3ZUb0hleChoLCBzLCB2KVxuXHRcdFx0XHRiZ0NvbG9yLmNsZWFyKClcblx0XHRcdFx0YmdDb2xvci5iZWdpbkZpbGwoYywgMSk7XG5cdFx0XHRcdGJnQ29sb3IuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cdFx0XHRcdGJnQ29sb3IuZW5kRmlsbCgpO1xuXG5cdFx0XHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdFx0XHRjYXNlIEFwcENvbnN0YW50cy5UT1A6XG5cdFx0XHRcdFx0XHR0bC5mcm9tVG8oYmdDb2xvciwgMS40LCB7IHk6aGVpZ2h0IH0sIHsgeTotaGVpZ2h0LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLkJPVFRPTTpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeTotaGVpZ2h0IH0sIHsgeTpoZWlnaHQsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuTEVGVDpcblx0XHRcdFx0XHRcdHRsLmZyb21UbyhiZ0NvbG9yLCAxLjQsIHsgeDp3aWR0aCB9LCB7IHg6LXdpZHRoLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIGRlbGF5KmkpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgQXBwQ29uc3RhbnRzLlJJR0hUOlxuXHRcdFx0XHRcdFx0dGwuZnJvbVRvKGJnQ29sb3IsIDEuNCwgeyB4Oi13aWR0aCB9LCB7IHg6d2lkdGgsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgZGVsYXkqaSlcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9O1xuXG5cdFx0XHR0bC5wYXVzZSgwKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0dGwuY2xlYXIoKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBiZ0NvbG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYmdDb2xvciA9IGJnQ29sb3JzW2ldXG5cdFx0XHRcdGJnQ29sb3IuY2xlYXIoKVxuXHRcdFx0XHRob2xkZXIucmVtb3ZlQ2hpbGQoYmdDb2xvcilcblx0XHRcdFx0YmdDb2xvciA9IG51bGxcblx0XHRcdH07XG5cdFx0XHRiZ0NvbG9ycyA9IG51bGxcblx0XHRcdHRsID0gbnVsbFxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IChweENvbnRhaW5lciwgYmdVcmwpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgaG9sZGVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0cHhDb250YWluZXIuYWRkQ2hpbGQoaG9sZGVyKVxuXG5cdHZhciBtYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0aG9sZGVyLmFkZENoaWxkKG1hc2spXG5cblx0dmFyIGJnVGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoYmdVcmwpXG5cdHZhciBzcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUoYmdUZXh0dXJlKVxuXHRzcHJpdGUuYW5jaG9yLnggPSBzcHJpdGUuYW5jaG9yLnkgPSAwLjVcblx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblxuXHRzcHJpdGUubWFzayA9IG1hc2tcblxuXHRzY29wZSA9IHtcblx0XHRob2xkZXI6IGhvbGRlcixcblx0XHRiZ1Nwcml0ZTogc3ByaXRlLFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciBuWCA9ICgoICggbW91c2UueCAtICggd2luZG93VyA+PiAxKSApIC8gKCB3aW5kb3dXID4+IDEgKSApICogMSkgLSAwLjVcblx0XHRcdHZhciBuWSA9IG1vdXNlLm5ZIC0gMC41XG5cdFx0XHR2YXIgbmV3eCA9IHNwcml0ZS5peCAtICgzMCAqIG5YKVxuXHRcdFx0dmFyIG5ld3kgPSBzcHJpdGUuaXkgLSAoMjAgKiBuWSlcblx0XHRcdHNwcml0ZS54ICs9IChuZXd4IC0gc3ByaXRlLngpICogMC4wMDhcblx0XHRcdHNwcml0ZS55ICs9IChuZXd5IC0gc3ByaXRlLnkpICogMC4wMDhcblx0XHR9LFxuXHRcdHJlc2l6ZTogKCk9PiB7XG5cblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdFx0dmFyIHNpemUgPSBbKHdpbmRvd1cgPj4gMSkgKyAxLCB3aW5kb3dIXVxuXG5cdFx0XHRtYXNrLmNsZWFyKClcblx0XHRcdG1hc2suYmVnaW5GaWxsKDB4ZmYwMDAwLCAxKTtcblx0XHRcdG1hc2suZHJhd1JlY3QoMCwgMCwgc2l6ZVswXSwgc2l6ZVsxXSk7XG5cdFx0XHRtYXNrLmVuZEZpbGwoKTtcblxuXHRcdFx0dmFyIHJlc2l6ZVZhcnMgPSBVdGlscy5SZXNpemVQb3NpdGlvblByb3BvcnRpb25hbGx5KHNpemVbMF0sIHNpemVbMV0sIDk2MCwgMTAyNClcblxuXHRcdFx0c3ByaXRlLnggPSBzaXplWzBdID4+IDFcblx0XHRcdHNwcml0ZS55ID0gc2l6ZVsxXSA+PiAxXG5cdFx0XHRzcHJpdGUuc2NhbGUueCA9IHNwcml0ZS5zY2FsZS55ID0gcmVzaXplVmFycy5zY2FsZSArIDAuMVxuXHRcdFx0c3ByaXRlLml4ID0gc3ByaXRlLnhcblx0XHRcdHNwcml0ZS5peSA9IHNwcml0ZS55XG5cblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdHB4Q29udGFpbmVyLnJlbW92ZUNoaWxkKGhvbGRlcilcblx0XHRcdGhvbGRlci5yZW1vdmVDaGlsZChtYXNrKVxuXHRcdFx0aG9sZGVyLmFkZENoaWxkKHNwcml0ZSlcblx0XHRcdG1hc2suY2xlYXIoKVxuXHRcdFx0c3ByaXRlLmRlc3Ryb3koKVxuXHRcdFx0aG9sZGVyID0gbnVsbFxuXHRcdFx0bWFzayA9IG51bGxcblx0XHRcdHNwcml0ZSA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgY29sb3J5UmVjdHMgZnJvbSAnY29sb3J5LXJlY3RzJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBjb2xvclV0aWxzIGZyb20gJ2NvbG9yLXV0aWxzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgKHB4Q29udGFpbmVyLCBwYXJlbnQsIG1vdXNlLCBkYXRhLCBwcm9wcyk9PiB7XG5cdHZhciBzY29wZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgb25DbG9zZVRpbWVvdXQ7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5mdW4tZmFjdC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgdmlkZW9XcmFwcGVyID0gZG9tLnNlbGVjdCgnLnZpZGVvLXdyYXBwZXInLCBlbClcblx0dmFyIG1lc3NhZ2VXcmFwcGVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2Utd3JhcHBlcicsIGVsKVxuXHR2YXIgbWVzc2FnZUlubmVyID0gZG9tLnNlbGVjdCgnLm1lc3NhZ2UtaW5uZXInLCBtZXNzYWdlV3JhcHBlcilcblx0dmFyIHByID0gcHJvcHM7XG5cblx0dmFyIHNwbGl0dGVyID0gbmV3IFNwbGl0VGV4dChtZXNzYWdlSW5uZXIsIHt0eXBlOlwid29yZHNcIn0pXG5cblx0dmFyIGMgPSBkb20uc2VsZWN0KCcuY3Vyc29yLWNyb3NzJywgZWwpXG5cdHZhciBjcm9zcyA9IHtcblx0XHR4OiAwLFxuXHRcdHk6IDAsXG5cdFx0ZWw6IGMsXG5cdFx0c2l6ZTogZG9tLnNpemUoYylcblx0fVxuXG5cdHZhciBob2xkZXIgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRweENvbnRhaW5lci5hZGRDaGlsZChob2xkZXIpXG5cblx0dmFyIGxlZnRSZWN0cyA9IGNvbG9yeVJlY3RzKGhvbGRlciwgZGF0YVsnYW1iaWVudC1jb2xvciddKVxuXHR2YXIgcmlnaHRSZWN0cyA9IGNvbG9yeVJlY3RzKGhvbGRlciwgZGF0YVsnYW1iaWVudC1jb2xvciddKVxuXG5cdHZhciBtQmdDb2xvciA9IGRhdGFbJ2FtYmllbnQtY29sb3InXS50b1xuXHRtZXNzYWdlV3JhcHBlci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIycgKyBjb2xvclV0aWxzLmhzdlRvSGV4KG1CZ0NvbG9yLmgsIG1CZ0NvbG9yLnMsIG1CZ0NvbG9yLnYpXG5cblx0dmFyIGxlZnRUbCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdHZhciByaWdodFRsID0gbmV3IFRpbWVsaW5lTWF4KClcblxuXHR2YXIgbVZpZGVvID0gbWluaVZpZGVvKHtcblx0XHRhdXRvcGxheTogZmFsc2UsXG5cdFx0bG9vcDogdHJ1ZVxuXHR9KVxuXHR2YXIgdmlkZW9TcmMgPSBkYXRhWydmdW4tZmFjdC12aWRlby11cmwnXVxuXHRtVmlkZW8uYWRkVG8odmlkZW9XcmFwcGVyKVxuXHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0aXNSZWFkeSA9IHRydWVcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXG5cdHZhciBvbkNsb3NlRnVuRmFjdCA9ICgpPT4ge1xuXHRcdGlmKCFzY29wZS5pc09wZW4pIHJldHVyblxuXHRcdEFwcEFjdGlvbnMuY2xvc2VGdW5GYWN0KClcblx0fVxuXG5cdHZhciBvcGVuID0gKCk9PiB7XG5cdFx0ZWwuc3R5bGVbJ3otaW5kZXgnXSA9IDI5XG5cdFx0c2NvcGUuaXNPcGVuID0gdHJ1ZVxuXHRcdHNjb3BlLmxlZnRSZWN0cy5vcGVuKClcblx0XHRzY29wZS5yaWdodFJlY3RzLm9wZW4oKVxuXHRcdHZhciBkZWxheSA9IDM1MFxuXHRcdHNldFRpbWVvdXQoKCk9PmxlZnRUbC50aW1lU2NhbGUoMS41KS5wbGF5KDApLCBkZWxheSlcblx0XHRzZXRUaW1lb3V0KCgpPT5yaWdodFRsLnRpbWVTY2FsZSgxLjUpLnBsYXkoMCksIGRlbGF5KVxuXHRcdHNldFRpbWVvdXQoKCk9Pm1WaWRlby5wbGF5KCksIGRlbGF5KzIwMClcblx0XHRjbGVhclRpbWVvdXQob25DbG9zZVRpbWVvdXQpXG5cdFx0b25DbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT5kb20uZXZlbnQub24ocGFyZW50LCAnY2xpY2snLCBvbkNsb3NlRnVuRmFjdCksIGRlbGF5KzIwMClcblx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ25vbmUnXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGNyb3NzLmVsLCAnYWN0aXZlJylcblx0fVxuXHR2YXIgY2xvc2UgPSAoKT0+IHtcblx0XHRlbC5zdHlsZVsnei1pbmRleCddID0gMjdcblx0XHRzY29wZS5pc09wZW4gPSBmYWxzZVxuXHRcdHNjb3BlLmxlZnRSZWN0cy5jbG9zZSgpXG5cdFx0c2NvcGUucmlnaHRSZWN0cy5jbG9zZSgpXG5cdFx0dmFyIGRlbGF5ID0gNTBcblx0XHRzZXRUaW1lb3V0KCgpPT5sZWZ0VGwudGltZVNjYWxlKDIpLnJldmVyc2UoKSwgZGVsYXkpXG5cdFx0c2V0VGltZW91dCgoKT0+cmlnaHRUbC50aW1lU2NhbGUoMikucmV2ZXJzZSgpLCBkZWxheSlcblx0XHRwYXJlbnQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nXG5cdFx0ZG9tLmV2ZW50Lm9mZihwYXJlbnQsICdjbGljaycsIG9uQ2xvc2VGdW5GYWN0KVxuXHRcdGRvbS5jbGFzc2VzLnJlbW92ZShjcm9zcy5lbCwgJ2FjdGl2ZScpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRpc09wZW46IGZhbHNlLFxuXHRcdG9wZW46IG9wZW4sXG5cdFx0Y2xvc2U6IGNsb3NlLFxuXHRcdGxlZnRSZWN0czogbGVmdFJlY3RzLFxuXHRcdHJpZ2h0UmVjdHM6IHJpZ2h0UmVjdHMsXG5cdFx0cmVzaXplOiAoKT0+e1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIG1pZFdpbmRvd1cgPSAod2luZG93VyA+PiAxKVxuXG5cdFx0XHR2YXIgc2l6ZSA9IFttaWRXaW5kb3dXICsgMSwgd2luZG93SF1cblxuXHRcdFx0c2NvcGUubGVmdFJlY3RzLnJlc2l6ZShzaXplWzBdLCBzaXplWzFdLCBBcHBDb25zdGFudHMuVE9QKVxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cy5yZXNpemUoc2l6ZVswXSwgc2l6ZVsxXSwgQXBwQ29uc3RhbnRzLkJPVFRPTSlcblx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMuaG9sZGVyLnggPSB3aW5kb3dXIC8gMlxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIHZpZGVvIGlzbid0IHJlYWR5IHJldHVyblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHR2YXIgdmlkZW9XcmFwcGVyUmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkobWlkV2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XID4+IDEsIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblxuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLndpZHRoID0gbWVzc2FnZVdyYXBwZXIuc3R5bGUud2lkdGggPSBtaWRXaW5kb3dXICsgJ3B4J1xuXHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLmhlaWdodCA9IG1lc3NhZ2VXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHR2aWRlb1dyYXBwZXIuc3R5bGUubGVmdCA9IG1pZFdpbmRvd1cgKyAncHgnXG5cdFx0XHRtVmlkZW8uZWwuc3R5bGUud2lkdGggPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLndpZHRoICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmhlaWdodCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLnRvcCA9IHZpZGVvV3JhcHBlclJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLmxlZnQgPSB2aWRlb1dyYXBwZXJSZXNpemVWYXJzLmxlZnQgKyAncHgnXG5cblx0XHRcdHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRcdHZhciBtZXNzYWdlSW5uZXJTaXplID0gZG9tLnNpemUobWVzc2FnZUlubmVyKVxuXHRcdFx0XHRtZXNzYWdlSW5uZXIuc3R5bGUubGVmdCA9IChtaWRXaW5kb3dXID4+IDEpIC0gKG1lc3NhZ2VJbm5lclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdG1lc3NhZ2VJbm5lci5zdHlsZS50b3AgPSAod2luZG93SCA+PiAxKSAtIChtZXNzYWdlSW5uZXJTaXplWzFdID4+IDEpICsgJ3B4J1xuXHRcdFx0fSwgMClcblxuXHRcdFx0c2V0VGltZW91dCgoKT0+IHtcblx0XHRcdFx0bGVmdFRsLmNsZWFyKClcblx0XHRcdFx0cmlnaHRUbC5jbGVhcigpXG5cblx0XHRcdFx0bGVmdFRsLmZyb21UbyhtZXNzYWdlV3JhcHBlciwgMS40LCB7IHk6d2luZG93SCwgc2NhbGVZOjMsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJyB9LCB7IHk6MCwgc2NhbGVZOjEsIHRyYW5zZm9ybU9yaWdpbjonNTAlIDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0XHRcdGxlZnRUbC5zdGFnZ2VyRnJvbShzcGxpdHRlci53b3JkcywgMSwgeyB5OjE0MDAsIHNjYWxlWTo2LCBmb3JjZTNEOnRydWUsIGVhc2U6RXhwby5lYXNlT3V0IH0sIDAuMDYsIDAuMilcblx0XHRcdFx0cmlnaHRUbC5mcm9tVG8odmlkZW9XcmFwcGVyLCAxLjQsIHsgeTotd2luZG93SCoyLCBzY2FsZVk6MywgdHJhbnNmb3JtT3JpZ2luOic1MCUgMTAwJScgfSwgeyB5OjAsIHNjYWxlWToxLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJywgZm9yY2UzRDp0cnVlLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cblx0XHRcdFx0bGVmdFRsLnBhdXNlKDApXG5cdFx0XHRcdHJpZ2h0VGwucGF1c2UoMClcblx0XHRcdFx0bWVzc2FnZVdyYXBwZXIuc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0dmlkZW9XcmFwcGVyLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHR9LCA1KVxuXG5cdFx0fSxcblx0XHR1cGRhdGU6ICgpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzT3BlbikgcmV0dXJuXG5cdFx0XHR2YXIgbmV3eCA9IG1vdXNlLnggLSAoY3Jvc3Muc2l6ZVswXSA+PiAxKVxuXHRcdFx0dmFyIG5ld3kgPSBtb3VzZS55IC0gKGNyb3NzLnNpemVbMV0gPj4gMSlcblx0XHRcdGNyb3NzLnggKz0gKG5ld3ggLSBjcm9zcy54KSAqIDAuNVxuXHRcdFx0Y3Jvc3MueSArPSAobmV3eSAtIGNyb3NzLnkpICogMC41XG5cdFx0XHRVdGlscy5UcmFuc2xhdGUoY3Jvc3MuZWwsIGNyb3NzLngsIGNyb3NzLnksIDEpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRkb20uZXZlbnQub2ZmKHBhcmVudCwgJ2NsaWNrJywgb25DbG9zZUZ1bkZhY3QpXG5cdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3Jvc3MuZWwsICdhY3RpdmUnKVxuXHRcdFx0cHhDb250YWluZXIucmVtb3ZlQ2hpbGQoaG9sZGVyKVxuXHRcdFx0bGVmdFRsLmNsZWFyKClcblx0XHRcdHJpZ2h0VGwuY2xlYXIoKVxuXHRcdFx0c2NvcGUubGVmdFJlY3RzLmNsZWFyKClcblx0XHRcdHNjb3BlLnJpZ2h0UmVjdHMuY2xlYXIoKVxuXHRcdFx0c2NvcGUubGVmdFJlY3RzID0gbnVsbFxuXHRcdFx0c2NvcGUucmlnaHRSZWN0cyA9IG51bGxcblx0XHRcdGxlZnRUbCA9IG51bGxcblx0XHRcdHJpZ2h0VGwgPSBudWxsXG5cdFx0XHRob2xkZXIgPSBudWxsXG5cdFx0fVxuXHR9XG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCB2aWRlb0NhbnZhcyBmcm9tICd2aWRlby1jYW52YXMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgZ3JpZFBvc2l0aW9ucyBmcm9tICdncmlkLXBvc2l0aW9ucydcbmltcG9ydCBtZWRpYUNlbGwgZnJvbSAnbWVkaWEtY2VsbCdcblxudmFyIGdyaWQgPSAocHJvcHMsIHBhcmVudCwgb25JdGVtRW5kZWQpPT4ge1xuXG5cdHZhciB2aWRlb0VuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBpbWFnZUVuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBncmlkQ29udGFpbmVyID0gZG9tLnNlbGVjdChcIi5ncmlkLWNvbnRhaW5lclwiLCBwYXJlbnQpXG5cdHZhciBncmlkRnJvbnRDb250YWluZXIgPSBkb20uc2VsZWN0KFwiLmdyaWQtZnJvbnQtY29udGFpbmVyXCIsIHBhcmVudClcblx0dmFyIGxpbmVzR3JpZENvbnRhaW5lciA9IGRvbS5zZWxlY3QoJy5saW5lcy1ncmlkLWNvbnRhaW5lcicsIHBhcmVudClcblx0dmFyIGdyaWRDaGlsZHJlbiA9IGdyaWRDb250YWluZXIuY2hpbGRyZW5cblx0dmFyIGdyaWRGcm9udENoaWxkcmVuID0gZ3JpZEZyb250Q29udGFpbmVyLmNoaWxkcmVuXG5cdHZhciBsaW5lc0hvcml6b250YWwgPSBkb20uc2VsZWN0KFwiLmxpbmVzLWdyaWQtY29udGFpbmVyIC5ob3Jpem9udGFsLWxpbmVzXCIsIHBhcmVudCkuY2hpbGRyZW5cblx0dmFyIGxpbmVzVmVydGljYWwgPSBkb20uc2VsZWN0KFwiLmxpbmVzLWdyaWQtY29udGFpbmVyIC52ZXJ0aWNhbC1saW5lc1wiLCBwYXJlbnQpLmNoaWxkcmVuXG5cdHZhciBzY29wZTtcblx0dmFyIGN1cnJlbnRTZWF0O1xuXHR2YXIgY2VsbHMgPSBbXVxuXHR2YXIgdG90YWxOdW0gPSBwcm9wcy5kYXRhLmdyaWQubGVuZ3RoXG5cdHZhciB2aWRlb3MgPSBBcHBTdG9yZS5nZXRIb21lVmlkZW9zKClcblxuXHR2YXIgc2VhdHMgPSBbXG5cdFx0MSwgMywgNSxcblx0XHQ3LCA5LCAxMSwgMTMsXG5cdFx0MTUsIFxuXHRcdDIxLCAyMywgMjVcblx0XVxuXG5cdHZhciB2Q2FudmFzUHJvcHMgPSB7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdHZvbHVtZTogMCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRvbkVuZGVkOiB2aWRlb0VuZGVkXG5cdH1cblxuXHR2YXIgbUNlbGw7XG5cdHZhciBjb3VudGVyID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbE51bTsgaSsrKSB7XG5cdFx0dmFyIHZQYXJlbnQgPSBncmlkQ2hpbGRyZW5baV1cblx0XHR2YXIgZlBhcmVudCA9IGdyaWRGcm9udENoaWxkcmVuW2ldXG5cdFx0Y2VsbHNbaV0gPSB1bmRlZmluZWRcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHNlYXRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZihpID09IHNlYXRzW2pdKSB7XG5cdFx0XHRcdG1DZWxsID0gbWVkaWFDZWxsKHZQYXJlbnQsIGZQYXJlbnQsIHZpZGVvc1tjb3VudGVyXSlcblx0XHRcdFx0Y2VsbHNbaV0gPSBtQ2VsbFxuXHRcdFx0XHRjb3VudGVyKytcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgcmVzaXplID0gKGdHcmlkKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIG9yaWdpbmFsVmlkZW9TaXplID0gQXBwQ29uc3RhbnRzLkhPTUVfVklERU9fU0laRVxuXHRcdHZhciBibG9ja1NpemUgPSBnR3JpZC5ibG9ja1NpemVcblxuXHRcdGxpbmVzR3JpZENvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblxuXHRcdHZhciByZXNpemVWYXJzID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseShibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSwgb3JpZ2luYWxWaWRlb1NpemVbMF0sIG9yaWdpbmFsVmlkZW9TaXplWzFdKVxuXHRcdFxuXHRcdHZhciBnUG9zID0gZ0dyaWQucG9zaXRpb25zXG5cdFx0dmFyIHBhcmVudCwgY2VsbDtcblx0XHR2YXIgY291bnQgPSAwXG5cdFx0dmFyIGhsLCB2bDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGdQb3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciByb3cgPSBnUG9zW2ldXG5cblx0XHRcdC8vIGhvcml6b250YWwgbGluZXNcblx0XHRcdGlmKGkgPiAwKSB7XG5cdFx0XHRcdGhsID0gc2NvcGUubGluZXMuaG9yaXpvbnRhbFtpLTFdXG5cdFx0XHRcdGhsLnN0eWxlLnRvcCA9IGJsb2NrU2l6ZVsxXSAqIGkgKyAncHgnXG5cdFx0XHRcdGhsLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIHZlcnRpY2FsIGxpbmVzXG5cdFx0XHRcdGlmKGkgPT0gMCAmJiBqID4gMCkge1xuXHRcdFx0XHRcdHZsID0gc2NvcGUubGluZXMudmVydGljYWxbai0xXVxuXHRcdFx0XHRcdHZsLnN0eWxlLmxlZnQgPSBibG9ja1NpemVbMF0gKiBqICsgJ3B4J1xuXHRcdFx0XHRcdHZsLnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggKyAncHgnXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjZWxsID0gc2NvcGUuY2VsbHNbY291bnRdXG5cdFx0XHRcdGlmKGNlbGwgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbC5yZXNpemUoYmxvY2tTaXplLCByb3dbal0sIHJlc2l6ZVZhcnMpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb3VudCsrXG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRlbDogZ3JpZENvbnRhaW5lcixcblx0XHRjaGlsZHJlbjogZ3JpZENoaWxkcmVuLFxuXHRcdGNlbGxzOiBjZWxscyxcblx0XHRudW06IHRvdGFsTnVtLFxuXHRcdHBvc2l0aW9uczogW10sXG5cdFx0bGluZXM6IHtcblx0XHRcdGhvcml6b250YWw6IGxpbmVzSG9yaXpvbnRhbCxcblx0XHRcdHZlcnRpY2FsOiBsaW5lc1ZlcnRpY2FsXG5cdFx0fSxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHRpbml0OiAoKT0+IHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoY2VsbHNbaV0gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbHNbaV0uaW5pdCgpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSxcblx0XHR0cmFuc2l0aW9uSW5JdGVtOiAoaW5kZXgsIHR5cGUpPT4ge1xuXHRcdFx0Ly8gdmFyIGl0ZW0gPSBzY29wZS5jZWxsc1tpbmRleF1cblx0XHRcdC8vIGl0ZW0uc2VhdCA9IGluZGV4XG5cblx0XHRcdC8vIGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZScpXG5cdFx0XHRcblx0XHRcdC8vIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklURU1fVklERU8pIHtcblx0XHRcdC8vIFx0aXRlbS5wbGF5KClcblx0XHRcdC8vIH1lbHNle1xuXHRcdFx0Ly8gXHRpdGVtLnRpbWVvdXQoaW1hZ2VFbmRlZCwgMjAwMClcblx0XHRcdC8vIFx0aXRlbS5zZWVrKFV0aWxzLlJhbmQoMiwgMTAsIDApKVxuXHRcdFx0Ly8gfVxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbk91dEl0ZW06IChpdGVtKT0+IHtcblx0XHRcdC8vIGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZScpXG5cblx0XHRcdC8vIGl0ZW0udmlkZW8uY3VycmVudFRpbWUoMClcblx0XHRcdC8vIGl0ZW0ucGF1c2UoKVxuXHRcdFx0Ly8gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0Ly8gXHRpdGVtLmRyYXdPbmNlKClcblx0XHRcdC8vIH0sIDUwMClcblx0XHR9LFxuXHRcdGNsZWFyOiAoKT0+IHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoY2VsbHNbaV0gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y2VsbHNbaV0uY2xlYXIoKVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fSBcblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ3JpZCIsIi8qXG5cdHdpZHRoOiBcdFx0d2lkdGggb2YgZ3JpZFxuXHRoZWlnaHQ6IFx0aGVpZ2h0IG9mIGdyaWRcblx0Y29sdW1uczogXHRudW1iZXIgb2YgY29sdW1uc1xuXHRyb3dzOiBcdFx0bnVtYmVyIG9mIHJvd3Ncblx0dHlwZTogXHRcdHR5cGUgb2YgdGhlIGFycmF5XG5cdFx0XHRcdGxpbmVhciAtIHdpbGwgZ2l2ZSBhbGwgdGhlIGNvbHMgYW5kIHJvd3MgcG9zaXRpb24gdG9nZXRoZXIgb25lIGFmdGVyIHRoZSBvdGhlclxuXHRcdFx0XHRjb2xzX3Jvd3MgLSB3aWxsIGdpdmUgc2VwYXJhdGUgcm93cyBhcnJheXMgd2l0aCB0aGUgY29scyBpbnNpZGUgXHRyb3dbIFtjb2xdLCBbY29sXSwgW2NvbF0sIFtjb2xdIF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJvd1sgW2NvbF0sIFtjb2xdLCBbY29sXSwgW2NvbF0gXVxuKi9cblxuZXhwb3J0IGRlZmF1bHQgKHdpZHRoLCBoZWlnaHQsIGNvbHVtbnMsIHJvd3MsIHR5cGUpPT4ge1xuXG5cdHZhciB0ID0gdHlwZSB8fCAnbGluZWFyJ1xuXHR2YXIgYmxvY2tTaXplID0gWyB3aWR0aCAvIGNvbHVtbnMsIGhlaWdodCAvIHJvd3MgXVxuXHR2YXIgYmxvY2tzTGVuID0gcm93cyAqIGNvbHVtbnNcblx0dmFyIHBvc2l0aW9ucyA9IFtdXG5cdFxuXHR2YXIgcG9zWCA9IDBcblx0dmFyIHBvc1kgPSAwXG5cdHZhciBjb2x1bW5Db3VudGVyID0gMFxuXHR2YXIgcm93c0NvdW50ZXIgPSAwXG5cdHZhciByciA9IFtdXG5cblx0c3dpdGNoKHQpIHtcblx0XHRjYXNlICdsaW5lYXInOiBcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzTGVuOyBpKyspIHtcblx0XHRcdFx0aWYoY29sdW1uQ291bnRlciA+PSBjb2x1bW5zKSB7XG5cdFx0XHRcdFx0cG9zWCA9IDBcblx0XHRcdFx0XHRwb3NZICs9IGJsb2NrU2l6ZVsxXVxuXHRcdFx0XHRcdGNvbHVtbkNvdW50ZXIgPSAwXG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGIgPSBbcG9zWCwgcG9zWV1cblx0XHRcdFx0cG9zWCArPSBibG9ja1NpemVbMF1cblx0XHRcdFx0Y29sdW1uQ291bnRlciArPSAxXG5cdFx0XHRcdHBvc2l0aW9uc1tpXSA9IGJcblx0XHRcdH07XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgJ2NvbHNfcm93cyc6IFxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3NMZW47IGkrKykge1xuXHRcdFx0XHR2YXIgYiA9IFtwb3NYLCBwb3NZXVxuXHRcdFx0XHRyci5wdXNoKGIpXG5cdFx0XHRcdHBvc1ggKz0gYmxvY2tTaXplWzBdXG5cdFx0XHRcdGNvbHVtbkNvdW50ZXIgKz0gMVxuXHRcdFx0XHRpZihjb2x1bW5Db3VudGVyID49IGNvbHVtbnMpIHtcblx0XHRcdFx0XHRwb3NYID0gMFxuXHRcdFx0XHRcdHBvc1kgKz0gYmxvY2tTaXplWzFdXG5cdFx0XHRcdFx0Y29sdW1uQ291bnRlciA9IDBcblx0XHRcdFx0XHRwb3NpdGlvbnNbcm93c0NvdW50ZXJdID0gcnJcblx0XHRcdFx0XHRyciA9IFtdXG5cdFx0XHRcdFx0cm93c0NvdW50ZXIrK1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0YnJlYWtcblx0fVxuXG5cblx0cmV0dXJuIHtcblx0XHRyb3dzOiByb3dzLFxuXHRcdGNvbHVtbnM6IGNvbHVtbnMsXG5cdFx0YmxvY2tTaXplOiBibG9ja1NpemUsXG5cdFx0cG9zaXRpb25zOiBwb3NpdGlvbnNcblx0fVxufSIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxudmFyIGhlYWRlckxpbmtzID0gKHBhcmVudCk9PiB7XG5cdHZhciBzY29wZTtcblxuXHR2YXIgb25TdWJNZW51TW91c2VFbnRlciA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRkb20uY2xhc3Nlcy5hZGQoZS5jdXJyZW50VGFyZ2V0LCAnaG92ZXJlZCcpXG5cdH1cblx0dmFyIG9uU3ViTWVudU1vdXNlTGVhdmUgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0ZG9tLmNsYXNzZXMucmVtb3ZlKGUuY3VycmVudFRhcmdldCwgJ2hvdmVyZWQnKVxuXHR9XG5cblx0dmFyIGNhbXBlckxhYkVsID0gZG9tLnNlbGVjdCgnLmNhbXBlci1sYWInLCBwYXJlbnQpXG5cdHZhciBzaG9wRWwgPSBkb20uc2VsZWN0KCcuc2hvcC13cmFwcGVyJywgcGFyZW50KVxuXHR2YXIgbWFwRWwgPSBkb20uc2VsZWN0KCcubWFwLWJ0bicsIHBhcmVudClcblxuXHRzaG9wRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uU3ViTWVudU1vdXNlRW50ZXIpXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25TdWJNZW51TW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgLyAzXG5cblx0XHRcdHZhciBjYW1wZXJMYWJDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSAoQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC42KSAtIHBhZGRpbmcgLSBkb20uc2l6ZShjYW1wZXJMYWJFbClbMF0sXG5cdFx0XHRcdHRvcDogQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5ELFxuXHRcdFx0fVxuXHRcdFx0dmFyIHNob3BDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IGNhbXBlckxhYkNzcy5sZWZ0IC0gZG9tLnNpemUoc2hvcEVsKVswXSAtIHBhZGRpbmcsXG5cdFx0XHRcdHRvcDogQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5ELFxuXHRcdFx0fVxuXHRcdFx0dmFyIG1hcENzcyA9IHtcblx0XHRcdFx0bGVmdDogc2hvcENzcy5sZWZ0IC0gZG9tLnNpemUobWFwRWwpWzBdIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cblx0XHRcdGNhbXBlckxhYkVsLnN0eWxlLmxlZnQgPSBjYW1wZXJMYWJDc3MubGVmdCArICdweCdcblx0XHRcdGNhbXBlckxhYkVsLnN0eWxlLnRvcCA9IGNhbXBlckxhYkNzcy50b3AgKyAncHgnXG5cdFx0XHRzaG9wRWwuc3R5bGUubGVmdCA9IHNob3BDc3MubGVmdCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS50b3AgPSBzaG9wQ3NzLnRvcCArICdweCdcblx0XHRcdG1hcEVsLnN0eWxlLmxlZnQgPSBtYXBDc3MubGVmdCArICdweCdcblx0XHRcdG1hcEVsLnN0eWxlLnRvcCA9IG1hcENzcy50b3AgKyAncHgnXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhlYWRlckxpbmtzIiwiaW1wb3J0IGltZyBmcm9tICdpbWcnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXIpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnLmdyaWQtYmFja2dyb3VuZC1jb250YWluZXInLCBjb250YWluZXIpXG5cdC8vIHZhciBjYW52YXNlcyA9IGVsLmNoaWxkcmVuXG5cdC8vIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0Ly8gdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHR2YXIgb25JbWdMb2FkZWRDYWxsYmFjaztcblx0dmFyIGdyaWQ7XG5cdHZhciBpbWFnZTtcblx0dmFyIGlzUmVhZHkgPSBmYWxzZVxuXHR2YXIgYW5pbSA9IHtcblx0XHR4OjAsXG5cdFx0eTowXG5cdH1cblxuXG5cdC8vIHZhciBpdGVtcyA9IFtdXG5cdC8vIGZvciAodmFyIGkgPSAwOyBpIDwgY2FudmFzZXMubGVuZ3RoOyBpKyspIHtcblx0Ly8gXHR2YXIgdG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgXG5cdC8vIFx0aXRlbXNbaV0gPSB7XG5cdC8vIFx0XHRjYW52YXM6IGNhbnZhc2VzW2ldLFxuXHQvLyBcdFx0Y3R4OiBjYW52YXNlc1tpXS5nZXRDb250ZXh0KCcyZCcpLFxuXHQvLyBcdFx0dG1wQ2FudmFzOiB0bXBDYW52YXMsXG5cdC8vIFx0XHR0bXBDb250ZXh0OiB0bXBDYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXHQvLyBcdH1cblx0Ly8gfVxuXG5cdHZhciBvbkltZ1JlYWR5ID0gKGVycm9yLCBpKT0+IHtcblx0XHRpbWFnZSA9IGlcblx0XHRkb20udHJlZS5hZGQoZWwsIGltYWdlKVxuXHRcdGlzUmVhZHkgPSB0cnVlXG5cdFx0c2NvcGUucmVzaXplKGdyaWQpXG5cdFx0aWYob25JbWdMb2FkZWRDYWxsYmFjaykgb25JbWdMb2FkZWRDYWxsYmFjaygpXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRlbDogZWwsXG5cdFx0cmVzaXplOiAoZ0dyaWQpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHRncmlkID0gZ0dyaWRcblxuXHRcdFx0aWYoIWlzUmVhZHkpIHJldHVyblxuXG5cdFx0XHR2YXIgcmVzaXplVmFyc0JnID0gVXRpbHMuUmVzaXplUG9zaXRpb25Qcm9wb3J0aW9uYWxseSh3aW5kb3dXLCB3aW5kb3dILCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1csIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSClcblx0XHRcdGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuXHRcdFx0aW1hZ2Uuc3R5bGUud2lkdGggPSByZXNpemVWYXJzQmcud2lkdGggKyAncHgnXG5cdFx0XHRpbWFnZS5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzQmcuaGVpZ2h0ICsgJ3B4J1xuXHRcdFx0aW1hZ2Uuc3R5bGUudG9wID0gcmVzaXplVmFyc0JnLnRvcCArICdweCdcblx0XHRcdGltYWdlLnN0eWxlLmxlZnQgPSByZXNpemVWYXJzQmcubGVmdCArICdweCdcblxuXHRcdFx0Ly8gdmFyIGJsb2NrU2l6ZSA9IGdHcmlkLmJsb2NrU2l6ZVxuXHRcdFx0Ly8gdmFyIGltYWdlQmxvY2tTaXplID0gWyByZXNpemVWYXJzQmcud2lkdGggLyBnR3JpZC5jb2x1bW5zLCByZXNpemVWYXJzQmcuaGVpZ2h0IC8gZ0dyaWQucm93cyBdXG5cdFx0XHQvLyB2YXIgZ1BvcyA9IGdHcmlkLnBvc2l0aW9uc1xuXHRcdFx0Ly8gdmFyIGNvdW50ID0gMFxuXHRcdFx0Ly8gdmFyIGNhbnZhcywgY3R4LCB0bXBDb250ZXh0LCB0bXBDYW52YXM7XG5cblx0XHRcdC8vIGZvciAodmFyIGkgPSAwOyBpIDwgZ1Bvcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly8gXHR2YXIgcm93ID0gZ1Bvc1tpXVxuXG5cdFx0XHQvLyBcdGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHQvLyBcdFx0Y2FudmFzID0gaXRlbXNbY291bnRdLmNhbnZhc1xuXHRcdFx0Ly8gXHRcdGN0eCA9IGl0ZW1zW2NvdW50XS5jdHhcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0ID0gaXRlbXNbY291bnRdLnRtcENvbnRleHRcblx0XHRcdC8vIFx0XHR0bXBDYW52YXMgPSBpdGVtc1tjb3VudF0udG1wQ2FudmFzXG5cblx0XHRcdC8vIFx0XHQvLyBibG9jayBkaXZzXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICsgJ3B4J1xuXHRcdFx0Ly8gXHRcdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLmxlZnQgPSByb3dbal1bMF0gKyAncHgnXG5cdFx0XHQvLyBcdFx0Y2FudmFzLnN0eWxlLnRvcCA9IHJvd1tqXVsxXSArICdweCdcblxuXHRcdFx0Ly8gXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0pXG5cdFx0XHQvLyBcdFx0dG1wQ29udGV4dC5zYXZlKClcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblx0XHRcdC8vIFx0XHR0bXBDb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgaW1hZ2VCbG9ja1NpemVbMF0qaiwgaW1hZ2VCbG9ja1NpemVbMV0qaSwgaW1hZ2VCbG9ja1NpemVbMF0sIGltYWdlQmxvY2tTaXplWzFdLCAwLCAwLCBibG9ja1NpemVbMF0sIGJsb2NrU2l6ZVsxXSlcblxuXHRcdFx0Ly8gXHRcdHRtcENvbnRleHQucmVzdG9yZSgpXG5cdFx0XHQvLyBcdFx0Y3R4LmRyYXdJbWFnZSh0bXBDYW52YXMsIDAsIDApXG5cblx0XHRcdC8vIFx0XHRjb3VudCsrXG5cdFx0XHQvLyBcdH1cblx0XHRcdC8vIH1cblx0XHR9LFxuXHRcdHVwZGF0ZTogKG1vdXNlKT0+IHtcblxuXHRcdFx0YW5pbS54ICs9ICgoKG1vdXNlLm5YLTAuNSkqNDApIC0gYW5pbS54KSAqIDAuMDVcblx0XHRcdGFuaW0ueSArPSAoKChtb3VzZS5uWS0wLjUpKjIwKSAtIGFuaW0ueSkgKiAwLjA1XG5cdFx0XHRVdGlscy5UcmFuc2xhdGUoaW1hZ2UsIGFuaW0ueCwgYW5pbS55LCAxKVxuXG5cdFx0fSxcblx0XHRsb2FkOiAodXJsLCBjYik9PiB7XG5cdFx0XHRvbkltZ0xvYWRlZENhbGxiYWNrID0gY2Jcblx0XHRcdGltZyh1cmwsIG9uSW1nUmVhZHkpXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRlbCA9IG51bGxcblx0XHRcdGltYWdlID0gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBpbWcgZnJvbSAnaW1nJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhLCBtb3VzZSwgb25Nb3VzZUV2ZW50c0hhbmRsZXIpPT4ge1xuXG5cdHZhciBhbmltUGFyYW1zID0gKHBhcmVudCwgZWwsIGltZ1dyYXBwZXIpPT4ge1xuXHRcdHZhciB0bCA9IG5ldyBUaW1lbGluZU1heCgpXG5cdFx0dGwuZnJvbVRvKGltZ1dyYXBwZXIsIDEsIHtzY2FsZVg6MS43LCBzY2FsZVk6MS4zLCByb3RhdGlvbjonMmRlZycsIHk6LTIwLCBvcGFjaXR5OjAsIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnLCBmb3JjZTNEOnRydWUgfSwgeyBzY2FsZVg6MSwgc2NhbGVZOjEsIHJvdGF0aW9uOicwZGVnJywgeTowLCBvcGFjaXR5OjEsIHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnLCBmb3JjZTNEOnRydWUsIGVhc2U6QmFjay5lYXNlSW5PdXR9LCAwKVxuXHRcdHRsLnBhdXNlKDApXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0aW1nV3JhcHBlcjogaW1nV3JhcHBlcixcblx0XHRcdHRsOiB0bCxcblx0XHRcdGVsOiBlbCxcblx0XHRcdHRpbWU6IDAsXG5cdFx0XHRwb3NpdGlvbjoge3g6IDAsIHk6IDB9LFxuXHRcdFx0ZnBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0XHRpcG9zaXRpb246IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIHNjYWxlOiB7eDogMCwgeTogMH0sXG5cdFx0XHQvLyBmc2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIGlzY2FsZToge3g6IDAsIHk6IDB9LFxuXHRcdFx0dmVsb2NpdHk6IHt4OiAwLCB5OiAwfSxcblx0XHRcdC8vIHZlbG9jaXR5U2NhbGU6IHt4OiAwLCB5OiAwfSxcblx0XHRcdHJvdGF0aW9uOiAwLFxuXHRcdFx0Y29uZmlnOiB7XG5cdFx0XHRcdGxlbmd0aDogMCxcblx0XHRcdFx0c3ByaW5nOiAwLjgsXG5cdFx0XHRcdGZyaWN0aW9uOiAwLjRcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR2YXIgc2NvcGU7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYWluLWJ0bnMtd3JhcHBlcicsIGNvbnRhaW5lcilcblx0dmFyIHNob3BCdG4gPSBkb20uc2VsZWN0KCcjc2hvcC1idG4nLCBlbClcblx0dmFyIGZ1bkJ0biA9IGRvbS5zZWxlY3QoJyNmdW4tZmFjdC1idG4nLCBlbClcblx0dmFyIHNob3BJbWdXcmFwcGVyICA9IGRvbS5zZWxlY3QoJy5pbWctd3JhcHBlcicsIHNob3BCdG4pXG5cdHZhciBmdW5JbWdXcmFwcGVyID0gZG9tLnNlbGVjdCgnLmltZy13cmFwcGVyJywgZnVuQnRuKVxuXHR2YXIgc2hvcFNpemUsIGZ1blNpemU7XG5cdHZhciBsb2FkQ291bnRlciA9IDBcblx0dmFyIGJ1dHRvblNpemUgPSBbMCwgMF1cblx0dmFyIHNwcmluZ1RvID0gVXRpbHMuU3ByaW5nVG9cblx0dmFyIHRyYW5zbGF0ZSA9IFV0aWxzLlRyYW5zbGF0ZVxuXHR2YXIgc2hvcEFuaW0sIGZ1bkFuaW0sIGN1cnJlbnRBbmltO1xuXHR2YXIgYnV0dG9ucyA9IHtcblx0XHQnc2hvcC1idG4nOiB7XG5cdFx0XHRhbmltOiB1bmRlZmluZWRcblx0XHR9LFxuXHRcdCdmdW4tZmFjdC1idG4nOiB7XG5cdFx0XHRhbmltOiB1bmRlZmluZWRcblx0XHR9XG5cdH1cblxuXHR2YXIgc2hvcEltZyA9IGltZygnaW1hZ2Uvc2hvcC8nK0FwcFN0b3JlLmxhbmcoKSsnLnBuZycsICgpPT4ge1xuXHRcdHNob3BBbmltID0gYW5pbVBhcmFtcyhzaG9wQnRuLCBzaG9wSW1nLCBzaG9wSW1nV3JhcHBlcilcblx0XHRidXR0b25zWydzaG9wLWJ0biddLmFuaW0gPSBzaG9wQW5pbVxuXHRcdHNob3BTaXplID0gW3Nob3BJbWcud2lkdGgsIHNob3BJbWcuaGVpZ2h0XVxuXHRcdGRvbS50cmVlLmFkZChzaG9wSW1nV3JhcHBlciwgc2hvcEltZylcblx0XHRzY29wZS5yZXNpemUoKVxuXHR9KVxuXHR2YXIgZnVuSW1nID0gaW1nKCdpbWFnZS9mdW4tZmFjdHMucG5nJywgKCk9PiB7XG5cdFx0ZnVuQW5pbSA9IGFuaW1QYXJhbXMoZnVuQnRuLCBmdW5JbWcsIGZ1bkltZ1dyYXBwZXIpXG5cdFx0YnV0dG9uc1snZnVuLWZhY3QtYnRuJ10uYW5pbSA9IGZ1bkFuaW1cblx0XHRmdW5TaXplID0gW2Z1bkltZy53aWR0aCwgZnVuSW1nLmhlaWdodF1cblx0XHRkb20udHJlZS5hZGQoZnVuSW1nV3JhcHBlciwgZnVuSW1nKVxuXHRcdHNjb3BlLnJlc2l6ZSgpXG5cdH0pXG5cblx0ZG9tLmV2ZW50Lm9uKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihzaG9wQnRuLCAnbW91c2VsZWF2ZScsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRkb20uZXZlbnQub24oc2hvcEJ0biwgJ2NsaWNrJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdGRvbS5ldmVudC5vbihmdW5CdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXG5cdHZhciB1cGRhdGVBbmltID0gKGFuaW0pPT4ge1xuXHRcdGlmKGFuaW0gPT0gdW5kZWZpbmVkKSByZXR1cm5cblx0XHRhbmltLnRpbWUgKz0gMC4xXG5cdFx0YW5pbS5mcG9zaXRpb24ueCA9IGFuaW0uaXBvc2l0aW9uLnhcblx0XHRhbmltLmZwb3NpdGlvbi55ID0gYW5pbS5pcG9zaXRpb24ueVxuXHRcdGFuaW0uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDgwXG5cdFx0YW5pbS5mcG9zaXRpb24ueSArPSAobW91c2UublkgLSAwLjUpICogMjAwXG5cblx0XHRzcHJpbmdUbyhhbmltLCBhbmltLmZwb3NpdGlvbiwgMSlcblx0XHRhbmltLmNvbmZpZy5sZW5ndGggKz0gKDAuMDEgLSBhbmltLmNvbmZpZy5sZW5ndGgpICogMC4xXG5cdFx0XG5cdFx0dHJhbnNsYXRlKGFuaW0uZWwsIGFuaW0ucG9zaXRpb24ueCArIGFuaW0udmVsb2NpdHkueCwgYW5pbS5wb3NpdGlvbi55ICsgYW5pbS52ZWxvY2l0eS55LCAxKVxuXHR9XG5cblx0c2NvcGUgPSB7XG5cdFx0aXNBY3RpdmU6IHRydWUsXG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBtaWRXID0gd2luZG93VyA+PiAxXG5cdFx0XHR2YXIgc2NhbGUgPSAwLjhcblx0XHRcdFxuXHRcdFx0YnV0dG9uU2l6ZVswXSA9IG1pZFcgKiAwLjlcblx0XHRcdGJ1dHRvblNpemVbMV0gPSB3aW5kb3dIXG5cblx0XHRcdGlmKHNob3BTaXplICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLndpZHRoID0gYnV0dG9uU2l6ZVswXSArICdweCdcblx0XHRcdFx0c2hvcEJ0bi5zdHlsZS5oZWlnaHQgPSBidXR0b25TaXplWzFdICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLmxlZnQgPSAobWlkVyA+PiAxKSAtIChidXR0b25TaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzaG9wQnRuLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKGJ1dHRvblNpemVbMV0gPj4gMSkgKyAncHgnXG5cdFx0XHRcdFxuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS53aWR0aCA9IHNob3BTaXplWzBdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBzaG9wU2l6ZVsxXSpzY2FsZSArICdweCdcblx0XHRcdFx0c2hvcEltZ1dyYXBwZXIuc3R5bGUubGVmdCA9IChidXR0b25TaXplWzBdID4+IDEpIC0gKHNob3BTaXplWzBdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRzaG9wSW1nV3JhcHBlci5zdHlsZS50b3AgPSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSAtIChzaG9wU2l6ZVsxXSpzY2FsZSA+PiAxKSArICdweCdcblx0XHRcdH1cblx0XHRcdGlmKGZ1blNpemUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS53aWR0aCA9IGJ1dHRvblNpemVbMF0gKyAncHgnXG5cdFx0XHRcdGZ1bkJ0bi5zdHlsZS5oZWlnaHQgPSBidXR0b25TaXplWzFdICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUubGVmdCA9IG1pZFcgKyAobWlkVyA+PiAxKSAtIChidXR0b25TaXplWzBdID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRmdW5CdG4uc3R5bGUudG9wID0gKHdpbmRvd0ggPj4gMSkgLSAoYnV0dG9uU2l6ZVsxXSA+PiAxKSArICdweCdcblxuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLndpZHRoID0gZnVuU2l6ZVswXSpzY2FsZSArICdweCdcblx0XHRcdFx0ZnVuSW1nV3JhcHBlci5zdHlsZS5oZWlnaHQgPSBmdW5TaXplWzFdKnNjYWxlICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLmxlZnQgPSAoYnV0dG9uU2l6ZVswXSA+PiAxKSAtIChmdW5TaXplWzBdKnNjYWxlID4+IDEpICsgJ3B4J1xuXHRcdFx0XHRmdW5JbWdXcmFwcGVyLnN0eWxlLnRvcCA9IChidXR0b25TaXplWzFdID4+IDEpIC0gKGZ1blNpemVbMV0qc2NhbGUgPj4gMSkgKyAncHgnXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvdmVyOiAoaWQpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGN1cnJlbnRBbmltID0gYnV0dG9uc1tpZF0uYW5pbVxuXHRcdFx0Y3VycmVudEFuaW0udGwudGltZVNjYWxlKDIuNikucGxheSgwKVxuXHRcdFx0Y3VycmVudEFuaW0uY29uZmlnLmxlbmd0aCA9IDQwMFxuXHRcdH0sXG5cdFx0b3V0OiAoaWQpPT4ge1xuXHRcdFx0aWYoIXNjb3BlLmlzQWN0aXZlKSByZXR1cm5cblx0XHRcdGN1cnJlbnRBbmltID0gYnV0dG9uc1tpZF0uYW5pbVxuXHRcdFx0Y3VycmVudEFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdH0sXG5cdFx0dXBkYXRlOiAoKT0+IHtcblx0XHRcdGlmKCFzY29wZS5pc0FjdGl2ZSkgcmV0dXJuXG5cdFx0XHRpZihzaG9wQW5pbSA9PSB1bmRlZmluZWQpIHJldHVybiBcblx0XHRcdHVwZGF0ZUFuaW0oc2hvcEFuaW0pXG5cdFx0XHR1cGRhdGVBbmltKGZ1bkFuaW0pXG5cdFx0fSxcblx0XHRhY3RpdmF0ZTogKCk9PiB7XG5cdFx0XHRzY29wZS5pc0FjdGl2ZSA9IHRydWVcblx0XHR9LFxuXHRcdGRpc2FjdGl2YXRlOiAoKT0+IHtcblx0XHRcdHNjb3BlLmlzQWN0aXZlID0gZmFsc2Vcblx0XHRcdHNob3BBbmltLnRsLnRpbWVTY2FsZSgzKS5yZXZlcnNlKClcblx0XHRcdGZ1bkFuaW0udGwudGltZVNjYWxlKDMpLnJldmVyc2UoKVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0c2hvcEFuaW0udGwuY2xlYXIoKVxuXHRcdFx0ZnVuQW5pbS50bC5jbGVhcigpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdtb3VzZWxlYXZlJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKHNob3BCdG4sICdjbGljaycsIG9uTW91c2VFdmVudHNIYW5kbGVyKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmdW5CdG4sICdtb3VzZWVudGVyJywgb25Nb3VzZUV2ZW50c0hhbmRsZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZ1bkJ0biwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdGRvbS5ldmVudC5vZmYoZnVuQnRuLCAnY2xpY2snLCBvbk1vdXNlRXZlbnRzSGFuZGxlcilcblx0XHRcdHNob3BBbmltID0gbnVsbFxuXHRcdFx0ZnVuQW5pbSA9IG51bGxcblx0XHRcdGJ1dHRvbnMgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnTWFwX2hicydcblxuZXhwb3J0IGRlZmF1bHQgKHBhcmVudCwgdHlwZSkgPT4ge1xuXG5cdC8vIHJlbmRlciBtYXBcblx0dmFyIG1hcFdyYXBwZXIgPSBkb20uc2VsZWN0KCcubWFwLXdyYXBwZXInLCBwYXJlbnQpXG5cdHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdHZhciB0ID0gdGVtcGxhdGUoKVxuXHRlbC5pbm5lckhUTUwgPSB0XG5cdGRvbS50cmVlLmFkZChtYXBXcmFwcGVyLCBlbClcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBkaXIsIHN0ZXBFbDtcblx0dmFyIHNlbGVjdGVkRG90cyA9IFtdO1xuXHR2YXIgY3VycmVudFBhdGhzLCBmaWxsTGluZSwgZGFzaGVkTGluZSwgc3RlcFRvdGFsTGVuID0gMDtcblx0dmFyIHByZXZpb3VzSGlnaGxpZ2h0SW5kZXggPSB1bmRlZmluZWQ7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5tYXAtd3JhcHBlcicsIHBhcmVudClcblx0dmFyIHRpdGxlc1dyYXBwZXIgPSBkb20uc2VsZWN0KCcudGl0bGVzLXdyYXBwZXInLCBlbClcblx0dmFyIG1hcGRvdHMgPSBkb20uc2VsZWN0LmFsbCgnI21hcC1kb3RzIC5kb3QtcGF0aCcsIGVsKVxuXHR2YXIgZm9vdHN0ZXBzID0gZG9tLnNlbGVjdC5hbGwoJyNmb290c3RlcHMgZycsIGVsKVxuXHR2YXIgY3VycmVudERvdDtcblxuXHR2YXIgZmluZERvdEJ5SWQgPSAocGFyZW50LCBjaGlsZCk9PiB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXBkb3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZG90ID0gbWFwZG90c1tpXVxuXHRcdFx0aWYocGFyZW50ID09IGRvdC5pZCkge1xuXHRcdFx0XHRpZihjaGlsZCA9PSBkb3QuZ2V0QXR0cmlidXRlKCdkYXRhLXBhcmVudC1pZCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGRvdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dmFyIG9uQ2VsbE1vdXNlRW50ZXIgPSAoaXRlbSk9PiB7XG5cdFx0Y3VycmVudERvdCA9IGZpbmREb3RCeUlkKGl0ZW1bMV0sIGl0ZW1bMF0pXG5cdFx0ZG9tLmNsYXNzZXMuYWRkKGN1cnJlbnREb3QsICdhbmltYXRlJylcblx0fVxuXHR2YXIgb25DZWxsTW91c2VMZWF2ZSA9IChpdGVtKT0+IHtcblx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoY3VycmVudERvdCwgJ2FuaW1hdGUnKVxuXHR9XG5cblx0aWYodHlwZSA9PSBBcHBDb25zdGFudHMuSU5URVJBQ1RJVkUpIHtcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0VOVEVSLCBvbkNlbGxNb3VzZUVudGVyKVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DRUxMX01PVVNFX0xFQVZFLCBvbkNlbGxNb3VzZUxlYXZlKVxuXG5cdH1cblxuXHR2YXIgdGl0bGVzID0ge1xuXHRcdCdkZWlhJzoge1xuXHRcdFx0ZWw6IGRvbS5zZWxlY3QoJy5kZWlhJywgdGl0bGVzV3JhcHBlcilcblx0XHR9LFxuXHRcdCdlcy10cmVuYyc6IHtcblx0XHRcdGVsOiBkb20uc2VsZWN0KCcuZXMtdHJlbmMnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH0sXG5cdFx0J2FyZWxsdWYnOiB7XG5cdFx0XHRlbDogZG9tLnNlbGVjdCgnLmFyZWxsdWYnLCB0aXRsZXNXcmFwcGVyKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHRpdGxlUG9zWChwYXJlbnRXLCB2YWwpIHtcblx0XHRyZXR1cm4gKHBhcmVudFcgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogdmFsXG5cdH1cblx0ZnVuY3Rpb24gdGl0bGVQb3NZKHBhcmVudEgsIHZhbCkge1xuXHRcdHJldHVybiAocGFyZW50SCAvIEFwcENvbnN0YW50cy5NRURJQV9HTE9CQUxfSCkgKiB2YWxcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdHJlc2l6ZTogKCk9PiB7XG5cdFx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cblx0XHRcdHZhciBtYXBXID0gNjkzLCBtYXBIID0gNTAwXG5cdFx0XHR2YXIgbWFwU2l6ZSA9IFtdXG5cdFx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93VyowLjM1LCB3aW5kb3dIKjAuMzUsIG1hcFcsIG1hcEgpXG5cdFx0XHRtYXBTaXplWzBdID0gbWFwVyAqIHJlc2l6ZVZhcnMuc2NhbGVcblx0XHRcdG1hcFNpemVbMV0gPSBtYXBIICogcmVzaXplVmFycy5zY2FsZVxuXG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IG1hcFNpemVbMF0gKyAncHgnXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPSBtYXBTaXplWzFdICsgJ3B4J1xuXHRcdFx0ZWwuc3R5bGUubGVmdCA9ICh3aW5kb3dXID4+IDEpIC0gKG1hcFNpemVbMF0gPj4gMSkgLSA0MCArICdweCdcblx0XHRcdGVsLnN0eWxlLnRvcCA9ICh3aW5kb3dIID4+IDEpIC0gKG1hcFNpemVbMV0gPj4gMSkgKyAncHgnXG5cblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgODAwKSArICdweCdcblx0XHRcdHRpdGxlc1snZGVpYSddLmVsLnN0eWxlLnRvcCA9IHRpdGxlUG9zWShtYXBTaXplWzFdLCAzMzApICsgJ3B4J1xuXHRcdFx0dGl0bGVzWydlcy10cmVuYyddLmVsLnN0eWxlLmxlZnQgPSB0aXRsZVBvc1gobWFwU2l6ZVswXSwgMTI1MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2VzLXRyZW5jJ10uZWwuc3R5bGUudG9wID0gdGl0bGVQb3NZKG1hcFNpemVbMV0sIDg1MCkgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS5sZWZ0ID0gdGl0bGVQb3NYKG1hcFNpemVbMF0sIDQyNikgKyAncHgnXG5cdFx0XHR0aXRsZXNbJ2FyZWxsdWYnXS5lbC5zdHlsZS50b3AgPSB0aXRsZVBvc1kobWFwU2l6ZVsxXSwgNTAwKSArICdweCdcblx0XHR9LFxuXHRcdGhpZ2hsaWdodERvdHM6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHNlbGVjdGVkRG90cyA9IFtdXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcGRvdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGRvdCA9IG1hcGRvdHNbaV1cblx0XHRcdFx0dmFyIGlkID0gZG90LmlkXG5cdFx0XHRcdHZhciBwYXJlbnRJZCA9IGRvdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFyZW50LWlkJylcblx0XHRcdFx0aWYoaWQgPT0gb2xkSGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gb2xkSGFzaC5wYXJlbnQpIHNlbGVjdGVkRG90cy5wdXNoKGRvdClcblx0XHRcdFx0aWYoaWQgPT0gbmV3SGFzaC50YXJnZXQgJiYgcGFyZW50SWQgPT0gbmV3SGFzaC5wYXJlbnQpICBzZWxlY3RlZERvdHMucHVzaChkb3QpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgZG90ID0gc2VsZWN0ZWREb3RzW2ldXG5cdFx0XHRcdGRvbS5jbGFzc2VzLmFkZChkb3QsICdhbmltYXRlJylcblx0XHRcdH07XG5cdFx0fSxcblx0XHRoaWdobGlnaHQ6IChvbGRIYXNoLCBuZXdIYXNoKT0+IHtcblx0XHRcdHZhciBvbGRJZCA9IG9sZEhhc2gudGFyZ2V0XG5cdFx0XHR2YXIgbmV3SWQgPSBuZXdIYXNoLnRhcmdldFxuXHRcdFx0dmFyIGN1cnJlbnQgPSBvbGRJZCArICctJyArIG5ld0lkXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvb3RzdGVwcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgc3RlcCA9IGZvb3RzdGVwc1tpXVxuXHRcdFx0XHR2YXIgaWQgPSBzdGVwLmlkXG5cdFx0XHRcdGlmKGlkLmluZGV4T2Yob2xkSWQpID4gLTEgJiYgaWQuaW5kZXhPZihuZXdJZCkgPiAtMSkge1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBsYXN0IG9uZVxuXHRcdFx0XHRcdGlmKGkgPT0gcHJldmlvdXNIaWdobGlnaHRJbmRleCkgc3RlcEVsID0gZm9vdHN0ZXBzW2Zvb3RzdGVwcy5sZW5ndGgtMV1cblx0XHRcdFx0XHRlbHNlIHN0ZXBFbCA9IHN0ZXBcblxuXHRcdFx0XHRcdGRpciA9IGlkLmluZGV4T2YoY3VycmVudCkgPiAtMSA/IEFwcENvbnN0YW50cy5GT1JXQVJEIDogQXBwQ29uc3RhbnRzLkJBQ0tXQVJEXG5cdFx0XHRcdFx0cHJldmlvdXNIaWdobGlnaHRJbmRleCA9IGlcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0c2NvcGUuaGlnaGxpZ2h0RG90cyhvbGRIYXNoLCBuZXdIYXNoKVxuXG5cdFx0XHRjdXJyZW50UGF0aHMgPSBkb20uc2VsZWN0LmFsbCgncGF0aCcsIHN0ZXBFbClcblx0XHRcdGRhc2hlZExpbmUgPSBjdXJyZW50UGF0aHNbMF1cblxuXHRcdFx0Ly8gY2hvb3NlIHBhdGggZGVwZW5kcyBvZiBmb290c3RlcCBkaXJlY3Rpb25cblx0XHRcdGlmKGRpciA9PSBBcHBDb25zdGFudHMuRk9SV0FSRCkge1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1sxXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMl0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRmaWxsTGluZSA9IGN1cnJlbnRQYXRoc1syXVxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDBcblx0XHRcdH1cblxuXHRcdFx0Ly8gc3RlcEVsLnN0eWxlLm9wYWNpdHkgPSAxXG5cblx0XHRcdC8vIC8vIGZpbmQgdG90YWwgbGVuZ3RoIG9mIHNoYXBlXG5cdFx0XHQvLyBzdGVwVG90YWxMZW4gPSBmaWxsTGluZS5nZXRUb3RhbExlbmd0aCgpXG5cdFx0XHQvLyBmaWxsTGluZS5zdHlsZVsnc3Ryb2tlLWRhc2hvZmZzZXQnXSA9IDBcblx0XHRcdC8vIGZpbGxMaW5lLnN0eWxlWydzdHJva2UtZGFzaGFycmF5J10gPSBzdGVwVG90YWxMZW5cblx0XHRcdFxuXHRcdFx0Ly8gLy8gc3RhcnQgYW5pbWF0aW9uIG9mIGRhc2hlZCBsaW5lXG5cdFx0XHQvLyBkb20uY2xhc3Nlcy5hZGQoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0XHQvLyAvLyBzdGFydCBhbmltYXRpb25cblx0XHRcdC8vIGRvbS5jbGFzc2VzLmFkZChmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXG5cdFx0fSxcblx0XHRyZXNldEhpZ2hsaWdodDogKCk9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdC8vIHN0ZXBFbC5zdHlsZS5vcGFjaXR5ID0gMFxuXHRcdFx0XHRjdXJyZW50UGF0aHNbMV0uc3R5bGUub3BhY2l0eSA9IDFcblx0XHRcdFx0Y3VycmVudFBhdGhzWzJdLnN0eWxlLm9wYWNpdHkgPSAxXG5cdFx0XHRcdGRvbS5jbGFzc2VzLnJlbW92ZShmaWxsTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZGFzaGVkTGluZSwgJ2FuaW1hdGUnKVxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdGVkRG90cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBkb3QgPSBzZWxlY3RlZERvdHNbaV1cblx0XHRcdFx0XHRkb20uY2xhc3Nlcy5yZW1vdmUoZG90LCAnYW5pbWF0ZScpXG5cdFx0XHRcdH07XG5cdFx0XHR9LCAwKVxuXHRcdH0sXG5cdFx0dXBkYXRlUHJvZ3Jlc3M6IChwcm9ncmVzcyk9PiB7XG5cdFx0XHQvLyBpZihmaWxsTGluZSA9PSB1bmRlZmluZWQpIHJldHVyblxuXHRcdFx0Ly8gdmFyIGRhc2hPZmZzZXQgPSAocHJvZ3Jlc3MgLyAxKSAqIHN0ZXBUb3RhbExlblxuXHRcdFx0Ly8gZmlsbExpbmUuc3R5bGVbJ3N0cm9rZS1kYXNob2Zmc2V0J10gPSBkYXNoT2Zmc2V0XG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRpZih0eXBlID09IEFwcENvbnN0YW50cy5JTlRFUkFDVElWRSkge1xuXHRcdFx0XHRBcHBTdG9yZS5vZmYoQXBwQ29uc3RhbnRzLkNFTExfTU9VU0VfRU5URVIsIG9uQ2VsbE1vdXNlRW50ZXIpXG5cdFx0XHRcdEFwcFN0b3JlLm9mZihBcHBDb25zdGFudHMuQ0VMTF9NT1VTRV9MRUFWRSwgb25DZWxsTW91c2VMZWF2ZSlcblx0XHRcdH1cblx0XHRcdHRpdGxlcyA9IG51bGxcblx0XHR9XG5cdH1cblx0cmV0dXJuIHNjb3BlXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcbmltcG9ydCBtaW5pVmlkZW8gZnJvbSAnbWluaS12aWRlbydcbmltcG9ydCBSb3V0ZXIgZnJvbSAnUm91dGVyJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRhaW5lciwgZnJvbnQsIHZpZGVvVXJsKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBzcGxpdHRlciA9IHZpZGVvVXJsLnNwbGl0KCcvJylcblx0dmFyIG5hbWUgPSBzcGxpdHRlcltzcGxpdHRlci5sZW5ndGgtMV0uc3BsaXQoJy4nKVswXVxuXHR2YXIgbmFtZVNwbGl0ID0gbmFtZS5zcGxpdCgnLScpXG5cdHZhciBuYW1lUGFydHMgPSBuYW1lU3BsaXQubGVuZ3RoID09IDMgPyBbbmFtZVNwbGl0WzBdKyctJytuYW1lU3BsaXRbMV0sIG5hbWVTcGxpdFsyXV0gOiBuYW1lU3BsaXRcblx0dmFyIGltZ0lkID0gJ2hvbWUtdmlkZW8tc2hvdHMvJyArIG5hbWVcblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0bG9vcDogdHJ1ZSxcblx0XHRhdXRvcGxheTogZmFsc2Vcblx0fSlcblx0dmFyIHNpemUsIHBvc2l0aW9uLCByZXNpemVWYXJzO1xuXHR2YXIgaW1nO1xuXG5cdHZhciBvbk1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QXBwQWN0aW9ucy5jZWxsTW91c2VFbnRlcihuYW1lUGFydHMpXG5cdFx0aWYobVZpZGVvLmlzTG9hZGVkKSB7XG5cdFx0XHRtVmlkZW8ucGxheSgwKVxuXHRcdH1lbHNle1xuXHRcdFx0bVZpZGVvLmxvYWQodmlkZW9VcmwsICgpPT4ge1xuXHRcdFx0XHRtVmlkZW8ucGxheSgpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHZhciBvbk1vdXNlTGVhdmUgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QXBwQWN0aW9ucy5jZWxsTW91c2VMZWF2ZShuYW1lUGFydHMpXG5cdFx0bVZpZGVvLnBhdXNlKDApXG5cdH1cblxuXHR2YXIgb25DbGljayA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRSb3V0ZXIuc2V0SGFzaChuYW1lUGFydHNbMF0gKyAnLycgKyBuYW1lUGFydHNbMV0pXG5cdH1cblxuXHR2YXIgaW5pdCA9ICgpPT4ge1xuXHRcdHZhciBpbWdVcmwgPSBBcHBTdG9yZS5QcmVsb2FkZXIuZ2V0SW1hZ2VVUkwoaW1nSWQpIFxuXHRcdGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG5cdFx0aW1nLnNyYyA9IGltZ1VybFxuXHRcdGRvbS50cmVlLmFkZChjb250YWluZXIsIGltZylcblx0XHRkb20udHJlZS5hZGQoY29udGFpbmVyLCBtVmlkZW8uZWwpXG5cblx0XHRkb20uZXZlbnQub24oZnJvbnQsICdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuXHRcdGRvbS5ldmVudC5vbihmcm9udCwgJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpXG5cdFx0ZG9tLmV2ZW50Lm9uKGZyb250LCAnY2xpY2snLCBvbkNsaWNrKVxuXG5cdFx0c2NvcGUuaXNSZWFkeSA9IHRydWVcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGlzUmVhZHk6IGZhbHNlLFxuXHRcdGluaXQ6IGluaXQsXG5cdFx0cmVzaXplOiAocywgcCwgcnYpPT4ge1xuXG5cdFx0XHRzaXplID0gcyA9PSB1bmRlZmluZWQgPyBzaXplIDogc1xuXHRcdFx0cG9zaXRpb24gPSBwID09IHVuZGVmaW5lZCA/IHBvc2l0aW9uIDogcFxuXHRcdFx0cmVzaXplVmFycyA9IHJ2ID09IHVuZGVmaW5lZCA/IHJlc2l6ZVZhcnMgOiBydlxuXG5cdFx0XHRpZighc2NvcGUuaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdGNvbnRhaW5lci5zdHlsZS53aWR0aCA9IGZyb250LnN0eWxlLndpZHRoID0gc2l6ZVswXSArICdweCdcblx0XHRcdGNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBmcm9udC5zdHlsZS5oZWlnaHQgPSBzaXplWzFdICsgJ3B4J1xuXHRcdFx0Y29udGFpbmVyLnN0eWxlLmxlZnQgPSBmcm9udC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25bMF0gKyAncHgnXG5cdFx0XHRjb250YWluZXIuc3R5bGUudG9wID0gZnJvbnQuc3R5bGUudG9wID0gcG9zaXRpb25bMV0gKyAncHgnXG5cblx0XHRcdGltZy5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnMud2lkdGggKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUuaGVpZ2h0ID0gcmVzaXplVmFycy5oZWlnaHQgKyAncHgnXG5cdFx0XHRpbWcuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnMubGVmdCArICdweCdcblx0XHRcdGltZy5zdHlsZS50b3AgPSByZXNpemVWYXJzLnRvcCArICdweCdcblxuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLndpZHRoID0gcmVzaXplVmFycy53aWR0aCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5oZWlnaHQgPSByZXNpemVWYXJzLmhlaWdodCArICdweCdcblx0XHRcdG1WaWRlby5lbC5zdHlsZS5sZWZ0ID0gcmVzaXplVmFycy5sZWZ0ICsgJ3B4J1xuXHRcdFx0bVZpZGVvLmVsLnN0eWxlLnRvcCA9IHJlc2l6ZVZhcnMudG9wICsgJ3B4J1xuXG5cdFx0fSxcblx0XHRjbGVhcjogKCk9PiB7XG5cdFx0XHRtVmlkZW8uY2xlYXIoKVxuXHRcdFx0ZG9tLmV2ZW50Lm9mZihmcm9udCwgJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpXG5cdFx0XHRkb20uZXZlbnQub2ZmKGZyb250LCAnbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSlcblx0XHRcdGRvbS5ldmVudC5vZmYoZnJvbnQsICdjbGljaycsIG9uQ2xpY2spXG5cdFx0XHRtVmlkZW8gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG5cbn0iLCJpbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5leHBvcnQgZGVmYXVsdCAocHJvcHMpPT4ge1xuXG5cdHZhciBzY29wZTtcblx0dmFyIHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0dmlkZW8ucHJlbG9hZCA9IFwiXCJcblx0dmFyIG9uUmVhZHlDYWxsYmFjaztcblx0dmFyIHNpemUgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfVxuXHR2YXIgZUxpc3RlbmVycyA9IFtdXG5cblx0dmFyIG9uQ2FuUGxheSA9ICgpPT57XG5cdFx0c2NvcGUuaXNMb2FkZWQgPSB0cnVlXG5cdFx0aWYocHJvcHMuYXV0b3BsYXkpIHZpZGVvLnBsYXkoKVxuXHRcdGlmKHByb3BzLnZvbHVtZSAhPSB1bmRlZmluZWQpIHZpZGVvLnZvbHVtZSA9IHByb3BzLnZvbHVtZVxuXHRcdHNpemUud2lkdGggPSB2aWRlby52aWRlb1dpZHRoXG5cdFx0c2l6ZS5oZWlnaHQgPSB2aWRlby52aWRlb0hlaWdodFxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgICAgIG9uUmVhZHlDYWxsYmFjayhzY29wZSlcblx0fVxuXG5cdHZhciBwbGF5ID0gKHRpbWUpPT57XG5cdFx0aWYodGltZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHNjb3BlLnNlZWsodGltZSlcblx0XHR9XG4gICAgXHRzY29wZS5pc1BsYXlpbmcgPSB0cnVlXG4gICAgXHR2aWRlby5wbGF5KClcbiAgICB9XG5cbiAgICB2YXIgc2VlayA9ICh0aW1lKT0+IHtcbiAgICBcdHRyeSB7XG4gICAgXHRcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZVxuXHRcdH1cblx0XHRjYXRjaChlcnIpIHtcblx0XHR9XG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKHRpbWUpPT57XG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRpZih0aW1lICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0c2NvcGUuc2Vlayh0aW1lKVxuXHRcdH1cbiAgICBcdHNjb3BlLmlzUGxheWluZyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHZvbHVtZSA9ICh2YWwpPT4ge1xuICAgIFx0aWYodmFsKSB7XG4gICAgXHRcdHNjb3BlLmVsLnZvbHVtZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC52b2x1bWVcbiAgICBcdH1cbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFRpbWUgPSAodmFsKT0+IHtcbiAgICBcdGlmKHZhbCkge1xuICAgIFx0XHRzY29wZS5lbC5jdXJyZW50VGltZSA9IHZhbFxuICAgIFx0fWVsc2V7XG4gICAgXHRcdHJldHVybiBzY29wZS5lbC5jdXJyZW50VGltZVxuICAgIFx0fVxuICAgIH1cblxuICAgIHZhciB3aWR0aCA9ICgpPT4ge1xuICAgIFx0cmV0dXJuIHNjb3BlLmVsLnZpZGVvV2lkdGhcbiAgICB9XG5cbiAgICB2YXIgaGVpZ2h0ID0gKCk9PiB7XG4gICAgXHRyZXR1cm4gc2NvcGUuZWwudmlkZW9IZWlnaHRcdFxuICAgIH1cblxuICAgIHZhciBlbmRlZCA9ICgpPT57XG4gICAgXHRpZihwcm9wcy5sb29wKSBwbGF5KClcbiAgICB9XG5cblx0dmFyIGFkZFRvID0gKHApPT4ge1xuXHRcdHNjb3BlLnBhcmVudCA9IHBcblx0XHRkb20udHJlZS5hZGQoc2NvcGUucGFyZW50LCB2aWRlbylcblx0fVxuXG5cdHZhciBvbiA9IChldmVudCwgY2IpPT4ge1xuXHRcdGVMaXN0ZW5lcnMucHVzaCh7ZXZlbnQ6ZXZlbnQsIGNiOmNifSlcblx0XHR2aWRlby5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdHZhciBvZmYgPSAoZXZlbnQsIGNiKT0+IHtcblx0XHRmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0XHRcdHZhciBlID0gZUxpc3RlbmVyc1tpXVxuXHRcdFx0aWYoZS5ldmVudCA9PSBldmVudCAmJiBlLmNiID09IGNiKSB7XG5cdFx0XHRcdGVMaXN0ZW5lcnMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0dmFyIGNsZWFyQWxsRXZlbnRzID0gKCk9PiB7XG5cdCAgICBmb3IgKHZhciBpIGluIGVMaXN0ZW5lcnMpIHtcblx0ICAgIFx0dmFyIGUgPSBlTGlzdGVuZXJzW2ldXG5cdCAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZS5ldmVudCwgZS5jYik7XG5cdCAgICB9XG5cdCAgICBlTGlzdGVuZXJzLmxlbmd0aCA9IDBcblx0ICAgIGVMaXN0ZW5lcnMgPSBudWxsXG5cdH1cblxuXHR2YXIgY2xlYXIgPSAoKT0+IHtcbiAgICBcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBvbkNhblBsYXkpO1xuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cdCAgICBzY29wZS5jbGVhckFsbEV2ZW50cygpXG5cdCAgICBzaXplID0gbnVsbFxuXHQgICAgdmlkZW8gPSBudWxsXG4gICAgfVxuXG4gICAgdmFyIGFkZFNvdXJjZVRvVmlkZW8gPSAoZWxlbWVudCwgc3JjLCB0eXBlKT0+IHtcblx0ICAgIHZhciBzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcblx0ICAgIHNvdXJjZS5zcmMgPSBzcmM7XG5cdCAgICBzb3VyY2UudHlwZSA9IHR5cGU7XG5cdCAgICBkb20udHJlZS5hZGQoZWxlbWVudCwgc291cmNlKVxuXHR9XG5cdFxuXHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBlbmRlZCk7XG5cblx0c2NvcGUgPSB7XG5cdFx0cGFyZW50OiB1bmRlZmluZWQsXG5cdFx0ZWw6IHZpZGVvLFxuXHRcdHNpemU6IHNpemUsXG5cdFx0cGxheTogcGxheSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHR2b2x1bWU6IHZvbHVtZSxcblx0XHRjdXJyZW50VGltZTogY3VycmVudFRpbWUsXG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdGFkZFRvOiBhZGRUbyxcblx0XHRvbjogb24sXG5cdFx0b2ZmOiBvZmYsXG5cdFx0Y2xlYXI6IGNsZWFyLFxuXHRcdGNsZWFyQWxsRXZlbnRzOiBjbGVhckFsbEV2ZW50cyxcblx0XHRpc1BsYXlpbmc6IHByb3BzLmF1dG9wbGF5IHx8IGZhbHNlLFxuXHRcdGlzTG9hZGVkOiBmYWxzZSxcblx0XHRsb2FkOiAoc3JjLCBjYWxsYmFjayk9PiB7XG5cdFx0XHRvblJlYWR5Q2FsbGJhY2sgPSBjYWxsYmFja1xuXHRcdFx0YWRkU291cmNlVG9WaWRlbyh2aWRlbywgc3JjLCAndmlkZW8vbXA0Jylcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcblxufSIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGFpbmVyLCBkYXRhKT0+IHtcblx0XG5cdHZhciBzY29wZTtcblx0dmFyIGVsID0gZG9tLnNlbGVjdCgnZm9vdGVyJywgY29udGFpbmVyKVxuXHR2YXIgYnV0dG9ucyA9IGRvbS5zZWxlY3QuYWxsKCdsaScsIGVsKVxuXG5cdHZhciBvbkJ0bkNsaWNrID0gKGUpPT4ge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcblx0XHR2YXIgaWQgPSB0YXJnZXQuaWRcblx0XHR2YXIgdXJsID0gdW5kZWZpbmVkO1xuXHRcdHN3aXRjaChpZCkge1xuXHRcdFx0Y2FzZSAnaG9tZSc6XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkZlZWQoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnZ3JpZCc6XG5cdFx0XHRcdEFwcEFjdGlvbnMub3BlbkdyaWQoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnY29tJzpcblx0XHRcdFx0dXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlICdsYWInOlxuXHRcdFx0XHR1cmwgPSBkYXRhLmxhYlVybFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAnc2hvcCc6XG5cdFx0XHRcdHVybCA9ICdodHRwOi8vd3d3LmNhbXBlci5jb20vJ1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblx0XHRpZih1cmwgIT0gdW5kZWZpbmVkKSB3aW5kb3cub3Blbih1cmwsJ19ibGFuaycpXG5cdH1cblxuXHR2YXIgYnRuLCBpXG5cdGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0YnRuID0gYnV0dG9uc1tpXVxuXHRcdGRvbS5ldmVudC5vbihidG4sICdjbGljaycsIG9uQnRuQ2xpY2spXG5cdH1cblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0XHR2YXIgYnRuVyA9IHdpbmRvd1cgLyBidXR0b25zLmxlbmd0aFxuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJ0biA9IGJ1dHRvbnNbaV1cblx0XHRcdFx0YnRuLnN0eWxlLndpZHRoID0gYnRuVyArICdweCdcblx0XHRcdFx0YnRuLnN0eWxlLmxlZnQgPSBidG5XICogaSArIFwicHhcIlxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzY29wZVxufSIsImltcG9ydCBQYWdlIGZyb20gJ1BhZ2UnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgZGlwdHlxdWVQYXJ0IGZyb20gJ2RpcHR5cXVlLXBhcnQnXG5pbXBvcnQgY2hhcmFjdGVyIGZyb20gJ2NoYXJhY3RlcidcbmltcG9ydCBmdW5GYWN0IGZyb20gJ2Z1bi1mYWN0LWhvbGRlcidcbmltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgYXJyb3dzV3JhcHBlciBmcm9tICdhcnJvd3Mtd3JhcHBlcidcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBzZWxmaWVTdGljayBmcm9tICdzZWxmaWUtc3RpY2snXG5pbXBvcnQgbWFpbkJ0bnMgZnJvbSAnbWFpbi1kaXB0eXF1ZS1idG5zJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXB0eXF1ZSBleHRlbmRzIFBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG5cdFx0dmFyIG5leHREaXB0eXF1ZSA9IEFwcFN0b3JlLmdldE5leHREaXB0eXF1ZSgpXG5cdFx0dmFyIHByZXZpb3VzRGlwdHlxdWUgPSBBcHBTdG9yZS5nZXRQcmV2aW91c0RpcHR5cXVlKClcblx0XHRwcm9wcy5kYXRhWyduZXh0LXBhZ2UnXSA9IG5leHREaXB0eXF1ZVxuXHRcdHByb3BzLmRhdGFbJ3ByZXZpb3VzLXBhZ2UnXSA9IHByZXZpb3VzRGlwdHlxdWVcblx0XHRwcm9wcy5kYXRhWyduZXh0LXByZXZpZXctdXJsJ10gPSBBcHBTdG9yZS5nZXRQcmV2aWV3VXJsQnlIYXNoKG5leHREaXB0eXF1ZSlcblx0XHRwcm9wcy5kYXRhWydwcmV2aW91cy1wcmV2aWV3LXVybCddID0gQXBwU3RvcmUuZ2V0UHJldmlld1VybEJ5SGFzaChwcmV2aW91c0RpcHR5cXVlKVxuXHRcdHByb3BzLmRhdGFbJ2ZhY3QtdHh0J10gPSBwcm9wcy5kYXRhLmZhY3RbQXBwU3RvcmUubGFuZygpXVxuXG5cdFx0c3VwZXIocHJvcHMpXG5cblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkFycm93TW91c2VFbnRlciA9IHRoaXMub25BcnJvd01vdXNlRW50ZXIuYmluZCh0aGlzKVxuXHRcdHRoaXMub25BcnJvd01vdXNlTGVhdmUgPSB0aGlzLm9uQXJyb3dNb3VzZUxlYXZlLmJpbmQodGhpcylcblx0XHR0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkID0gdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZC5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyID0gdGhpcy5vbk1haW5CdG5zRXZlbnRIYW5kbGVyLmJpbmQodGhpcylcblx0XHR0aGlzLm9uT3BlbkZhY3QgPSB0aGlzLm9uT3BlbkZhY3QuYmluZCh0aGlzKVxuXHRcdHRoaXMub25DbG9zZUZhY3QgPSB0aGlzLm9uQ2xvc2VGYWN0LmJpbmQodGhpcylcblx0XHR0aGlzLnVpVHJhbnNpdGlvbkluQ29tcGxldGVkID0gdGhpcy51aVRyYW5zaXRpb25JbkNvbXBsZXRlZC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuT1BFTl9GVU5fRkFDVCwgdGhpcy5vbk9wZW5GYWN0KVxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5DTE9TRV9GVU5fRkFDVCwgdGhpcy5vbkNsb3NlRmFjdClcblxuXHRcdHRoaXMubW91c2UgPSBuZXcgUElYSS5Qb2ludCgpXG5cdFx0dGhpcy5tb3VzZS5uWCA9IHRoaXMubW91c2UublkgPSAwXG5cblx0XHR0aGlzLmxlZnRQYXJ0ID0gZGlwdHlxdWVQYXJ0KFxuXHRcdFx0dGhpcy5weENvbnRhaW5lcixcblx0XHRcdHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdzaG9lLWJnJyksXG5cdFx0XHRcblx0XHQpXG5cdFx0dGhpcy5yaWdodFBhcnQgPSBkaXB0eXF1ZVBhcnQoXG5cdFx0XHR0aGlzLnB4Q29udGFpbmVyLFxuXHRcdFx0dGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2NoYXJhY3Rlci1iZycpXG5cdFx0KVxuXG5cdFx0dGhpcy5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXIodGhpcy5yaWdodFBhcnQuaG9sZGVyLCB0aGlzLmdldEltYWdlVXJsQnlJZCgnY2hhcmFjdGVyJyksIHRoaXMuZ2V0SW1hZ2VTaXplQnlJZCgnY2hhcmFjdGVyJykpXG5cdFx0dGhpcy5mdW5GYWN0ID0gZnVuRmFjdCh0aGlzLnB4Q29udGFpbmVyLCB0aGlzLmVsZW1lbnQsIHRoaXMubW91c2UsIHRoaXMucHJvcHMuZGF0YSwgdGhpcy5wcm9wcylcblx0XHR0aGlzLmFycm93c1dyYXBwZXIgPSBhcnJvd3NXcmFwcGVyKHRoaXMuZWxlbWVudCwgdGhpcy5vbkFycm93TW91c2VFbnRlciwgdGhpcy5vbkFycm93TW91c2VMZWF2ZSlcblx0XHR0aGlzLnNlbGZpZVN0aWNrID0gc2VsZmllU3RpY2sodGhpcy5lbGVtZW50LCB0aGlzLm1vdXNlLCB0aGlzLnByb3BzLmRhdGEpXG5cdFx0dGhpcy5tYWluQnRucyA9IG1haW5CdG5zKHRoaXMuZWxlbWVudCwgdGhpcy5wcm9wcy5kYXRhLCB0aGlzLm1vdXNlLCB0aGlzLm9uTWFpbkJ0bnNFdmVudEhhbmRsZXIpXG5cblx0XHRkb20uZXZlbnQub24odGhpcy5zZWxmaWVTdGljay5lbCwgJ2NsaWNrJywgdGhpcy5vblNlbGZpZVN0aWNrQ2xpY2tlZClcblx0XHRkb20uZXZlbnQub24od2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblxuXHRcdFR3ZWVuTWF4LnNldCh0aGlzLmFycm93c1dyYXBwZXIuYmFja2dyb3VuZCgnbGVmdCcpLCB7IHg6LUFwcENvbnN0YW50cy5TSURFX0VWRU5UX1BBRERJTkcgfSlcblx0XHRUd2Vlbk1heC5zZXQodGhpcy5hcnJvd3NXcmFwcGVyLmJhY2tncm91bmQoJ3JpZ2h0JyksIHsgeDpBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HIH0pXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gdHJ1ZVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5sZWZ0UGFydC5ob2xkZXIsIDEsIHsgeDogLXdpbmRvd1cgPj4gMSwgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5sZWZ0UGFydC5iZ1Nwcml0ZSwgMSwgeyB4OiB0aGlzLmxlZnRQYXJ0LmJnU3ByaXRlLnggLSAyMDAsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMubGVmdFBhcnQuYmdTcHJpdGUuc2NhbGUsIDEsIHsgeDogMywgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjQpXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5yaWdodFBhcnQuaG9sZGVyLCAxLCB7IHg6IHdpbmRvd1csIGVhc2U6RXhwby5lYXNlSW5PdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLCAxLCB7IHg6IHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLnggKyAyMDAsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC41KVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMucmlnaHRQYXJ0LmJnU3ByaXRlLnNjYWxlLCAxLCB7IHg6IDMsIGVhc2U6RXhwby5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMC40KVxuXG5cdFx0dGhpcy50bE91dC50byh0aGlzLmFycm93c1dyYXBwZXIubGVmdCwgMC41LCB7IHg6IC0xMDAsIGVhc2U6QmFjay5lYXNlT3V0LCBmb3JjZTNEOnRydWUgfSwgMClcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5yaWdodCwgMC41LCB7IHg6IDEwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5zZWxmaWVTdGljay5lbCwgMC41LCB7IHk6IDUwMCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwKVxuXHRcdHRoaXMudGxPdXQudG8odGhpcy5sZWZ0UGFydC5ob2xkZXIsIDEsIHsgeDogLXdpbmRvd1cgPj4gMSwgZWFzZTpFeHBvLmVhc2VJbk91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHR0aGlzLnRsT3V0LnRvKHRoaXMucmlnaHRQYXJ0LmhvbGRlciwgMSwgeyB4OiB3aW5kb3dXLCBlYXNlOkV4cG8uZWFzZUluT3V0LCBmb3JjZTNEOnRydWUgfSwgMC4xKVxuXG5cdFx0dGhpcy51aUluVGwgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRoaXMudWlJblRsLmZyb20odGhpcy5hcnJvd3NXcmFwcGVyLmxlZnQsIDEsIHsgeDogLTEwMCwgZWFzZTpFeHBvLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9LCAwLjEpXG5cdFx0dGhpcy51aUluVGwuZnJvbSh0aGlzLmFycm93c1dyYXBwZXIucmlnaHQsIDEsIHsgeDogMTAwLCBlYXNlOkV4cG8uZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuMSlcblx0XHR0aGlzLnVpSW5UbC5mcm9tKHRoaXMuc2VsZmllU3RpY2suZWwsIDEsIHsgeTogNTAwLCBlYXNlOkJhY2suZWFzZU91dCwgZm9yY2UzRDp0cnVlIH0sIDAuNSlcblx0XHR0aGlzLnVpSW5UbC5wYXVzZSgwKVxuXHRcdHRoaXMudWlJblRsLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIHRoaXMudWlUcmFuc2l0aW9uSW5Db21wbGV0ZWQpO1xuXG5cdFx0c3VwZXIuc2V0dXBBbmltYXRpb25zKClcblx0fVxuXHR1aVRyYW5zaXRpb25JbkNvbXBsZXRlZCgpIHtcblx0XHR0aGlzLnVpSW5UbC5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCBudWxsKVxuXHRcdHRoaXMuc2VsZmllU3RpY2sudHJhbnNpdGlvbkluQ29tcGxldGVkKClcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHR0aGlzLnVpSW5UbC50aW1lU2NhbGUoMS42KS5wbGF5KClcdFx0XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdG9uTW91c2VNb3ZlKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHRoaXMubW91c2UueCA9IGUuY2xpZW50WFxuXHRcdHRoaXMubW91c2UueSA9IGUuY2xpZW50WVxuXHRcdHRoaXMubW91c2UublggPSAoZS5jbGllbnRYIC8gd2luZG93VykgKiAxXG5cdFx0dGhpcy5tb3VzZS5uWSA9IChlLmNsaWVudFkgLyB3aW5kb3dIKSAqIDFcblx0fVxuXHRvblNlbGZpZVN0aWNrQ2xpY2tlZChlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0aWYodGhpcy5zZWxmaWVTdGljay5pc09wZW5lZCkge1xuXHRcdFx0dGhpcy5zZWxmaWVTdGljay5jbG9zZSgpXG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLnNlbGZpZVN0aWNrLm9wZW4oKVxuXHRcdFx0dGhpcy5tYWluQnRucy5hY3RpdmF0ZSgpXG5cdFx0fVxuXHR9XG5cdG9uQXJyb3dNb3VzZUVudGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcblxuXHRcdHZhciBwb3NYO1xuXHRcdHZhciBvZmZzZXRYID0gQXBwQ29uc3RhbnRzLlNJREVfRVZFTlRfUEFERElOR1xuXHRcdGlmKGlkID09ICdsZWZ0JykgcG9zWCA9IG9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSAtb2Zmc2V0WFxuXG5cdFx0VHdlZW5NYXgudG8odGhpcy5weENvbnRhaW5lciwgMC40LCB7IHg6cG9zWCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC40LCB7IHg6MCwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLm92ZXIoaWQpXG5cdH1cblx0b25BcnJvd01vdXNlTGVhdmUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdHZhciBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuXG5cdFx0dmFyIHBvc1g7XG5cdFx0dmFyIG9mZnNldFggPSBBcHBDb25zdGFudHMuU0lERV9FVkVOVF9QQURESU5HXG5cdFx0aWYoaWQgPT0gJ2xlZnQnKSBwb3NYID0gLW9mZnNldFhcblx0XHRlbHNlIHBvc1ggPSBvZmZzZXRYXG5cblx0XHRUd2Vlbk1heC50byh0aGlzLnB4Q29udGFpbmVyLCAwLjYsIHsgeDowLCBlYXNlOkV4cG8uZWFzZU91dCB9KVxuXHRcdFR3ZWVuTWF4LnRvKHRoaXMuYXJyb3dzV3JhcHBlci5iYWNrZ3JvdW5kKGlkKSwgMC42LCB7IHg6cG9zWCwgZWFzZTpFeHBvLmVhc2VPdXQgfSlcblxuXHRcdHRoaXMuYXJyb3dzV3JhcHBlci5vdXQoaWQpXG5cdH1cblx0b25NYWluQnRuc0V2ZW50SGFuZGxlcihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHR5cGUgPSBlLnR5cGVcblx0XHR2YXIgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0XG5cdFx0dmFyIGlkID0gdGFyZ2V0LmlkXG5cdFx0aWYodHlwZSA9PSAnY2xpY2snICYmIGlkID09ICdmdW4tZmFjdC1idG4nKSB7XG5cdFx0XHRpZih0aGlzLmZ1bkZhY3QuaXNPcGVuKSB7XG5cdFx0XHRcdEFwcEFjdGlvbnMuY2xvc2VGdW5GYWN0KClcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRBcHBBY3Rpb25zLm9wZW5GdW5GYWN0KClcblx0XHRcdH1cblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdtb3VzZWVudGVyJykge1xuXHRcdFx0dGhpcy5tYWluQnRucy5vdmVyKGlkKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGlmKHR5cGUgPT0gJ21vdXNlbGVhdmUnKSB7XG5cdFx0XHR0aGlzLm1haW5CdG5zLm91dChpZClcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZih0eXBlID09ICdjbGljaycgJiYgaWQgPT0gJ3Nob3AtYnRuJykge1xuXHRcdFx0d2luZG93Lm9wZW4odGhpcy5wcm9wcy5kYXRhWydzaG9wLXVybCddLCAnX2JsYW5rJylcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxuXHRvbk9wZW5GYWN0KCl7XG5cdFx0dGhpcy5mdW5GYWN0Lm9wZW4oKVxuXHRcdHRoaXMubWFpbkJ0bnMuZGlzYWN0aXZhdGUoKVxuXHR9XG5cdG9uQ2xvc2VGYWN0KCl7XG5cdFx0dGhpcy5mdW5GYWN0LmNsb3NlKClcblx0XHR0aGlzLm1haW5CdG5zLmFjdGl2YXRlKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYoIXRoaXMuZG9tSXNSZWFkeSkgcmV0dXJuXG5cdFx0dGhpcy5jaGFyYWN0ZXIudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0dGhpcy5sZWZ0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnJpZ2h0UGFydC51cGRhdGUodGhpcy5tb3VzZSlcblx0XHR0aGlzLnNlbGZpZVN0aWNrLnVwZGF0ZSgpXG5cdFx0dGhpcy5mdW5GYWN0LnVwZGF0ZSgpXG5cdFx0dGhpcy5tYWluQnRucy51cGRhdGUoKVxuXG5cdFx0c3VwZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMubGVmdFBhcnQucmVzaXplKClcblx0XHR0aGlzLnJpZ2h0UGFydC5yZXNpemUoKVxuXHRcdHRoaXMuY2hhcmFjdGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5mdW5GYWN0LnJlc2l6ZSgpXG5cdFx0dGhpcy5hcnJvd3NXcmFwcGVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5zZWxmaWVTdGljay5yZXNpemUoKVxuXHRcdHRoaXMubWFpbkJ0bnMucmVzaXplKClcblxuXHRcdHRoaXMucmlnaHRQYXJ0LmhvbGRlci54ID0gKHdpbmRvd1cgPj4gMSlcblxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5PUEVOX0ZVTl9GQUNULCB0aGlzLm9uT3BlbkZhY3QpXG5cdFx0QXBwU3RvcmUub2ZmKEFwcENvbnN0YW50cy5DTE9TRV9GVU5fRkFDVCwgdGhpcy5vbkNsb3NlRmFjdClcblx0XHRkb20uZXZlbnQub2ZmKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cdFx0ZG9tLmV2ZW50Lm9mZih0aGlzLnNlbGZpZVN0aWNrLmVsLCAnY2xpY2snLCB0aGlzLm9uU2VsZmllU3RpY2tDbGlja2VkKVxuXHRcdHRoaXMudWlJblRsLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0dGhpcy51aUluVGwuY2xlYXIoKVxuXHRcdHRoaXMubGVmdFBhcnQuY2xlYXIoKVxuXHRcdHRoaXMucmlnaHRQYXJ0LmNsZWFyKClcblx0XHR0aGlzLmNoYXJhY3Rlci5jbGVhcigpXG5cdFx0dGhpcy5mdW5GYWN0LmNsZWFyKClcblx0XHR0aGlzLnNlbGZpZVN0aWNrLmNsZWFyKClcblx0XHR0aGlzLmFycm93c1dyYXBwZXIuY2xlYXIoKVxuXHRcdHRoaXMubWFpbkJ0bnMuY2xlYXIoKVxuXHRcdHRoaXMudWlJblRsID0gbnVsbFxuXHRcdHRoaXMubW91c2UgPSBudWxsXG5cdFx0dGhpcy5sZWZ0UGFydCA9IG51bGxcblx0XHR0aGlzLnJpZ2h0UGFydCA9IG51bGxcblx0XHR0aGlzLmNoYXJhY3RlciA9IG51bGxcblx0XHR0aGlzLmFycm93c1dyYXBwZXIgPSBudWxsXG5cdFx0dGhpcy5tYWluQnRucyA9IG51bGxcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBib3R0b21UZXh0cyBmcm9tICdib3R0b20tdGV4dHMtaG9tZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGdyaWQgZnJvbSAnZ3JpZC1ob21lJ1xuaW1wb3J0IGltYWdlQ2FudmFzZXNHcmlkIGZyb20gJ2ltYWdlLXRvLWNhbnZhc2VzLWdyaWQnXG5pbXBvcnQgYXJvdW5kQm9yZGVyIGZyb20gJ2Fyb3VuZC1ib3JkZXItaG9tZSdcbmltcG9ydCBtYXAgZnJvbSAnbWFpbi1tYXAnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuaW1wb3J0IGdyaWRQb3NpdGlvbnMgZnJvbSAnZ3JpZC1wb3NpdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHR2YXIgY29udGVudCA9IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR2YXIgZ2VuZXJhSW5mb3MgPSBBcHBTdG9yZS5nZW5lcmFsSW5mb3MoKVxuXHRcdHZhciB0ZXh0cyA9IGNvbnRlbnQudGV4dHNbQXBwU3RvcmUubGFuZygpXVxuXHRcdHByb3BzLmRhdGEuZmFjZWJvb2tVcmwgPSBnZW5lcmFJbmZvc1snZmFjZWJvb2tfdXJsJ11cblx0XHRwcm9wcy5kYXRhLnR3aXR0ZXJVcmwgPSBnZW5lcmFJbmZvc1sndHdpdHRlcl91cmwnXVxuXHRcdHByb3BzLmRhdGEuaW5zdGFncmFtVXJsID0gZ2VuZXJhSW5mb3NbJ2luc3RhZ3JhbV91cmwnXVxuXHRcdHByb3BzLmRhdGEuZ3JpZCA9IFtdXG5cdFx0cHJvcHMuZGF0YS5ncmlkLmxlbmd0aCA9IDI4XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddID0geyBob3Jpem9udGFsOiBbXSwgdmVydGljYWw6IFtdIH1cblx0XHRwcm9wcy5kYXRhWydsaW5lcy1ncmlkJ10uaG9yaXpvbnRhbC5sZW5ndGggPSAzXG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLnZlcnRpY2FsLmxlbmd0aCA9IDZcblx0XHRwcm9wcy5kYXRhWydnZW5lcmljJ10gPSB0ZXh0cy5nZW5lcmljXG5cdFx0cHJvcHMuZGF0YVsnZGVpYS10eHQnXSA9IHRleHRzWydkZWlhJ11cblx0XHRwcm9wcy5kYXRhWydhcmVsbHVmLXR4dCddID0gdGV4dHNbJ2FyZWxsdWYnXVxuXHRcdHByb3BzLmRhdGFbJ2VzLXRyZW5jLXR4dCddID0gdGV4dHNbJ2VzLXRyZW5jJ11cblxuXHRcdHN1cGVyKHByb3BzKVxuXHRcdHZhciBiZ1VybCA9IHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdiYWNrZ3JvdW5kJylcblx0XHR0aGlzLnByb3BzLmRhdGEuYmd1cmwgPSBiZ1VybFxuXG5cdFx0dGhpcy50cmlnZ2VyTmV3SXRlbSA9IHRoaXMudHJpZ2dlck5ld0l0ZW0uYmluZCh0aGlzKVxuXHRcdHRoaXMub25JdGVtRW5kZWQgPSB0aGlzLm9uSXRlbUVuZGVkLmJpbmQodGhpcylcblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sYXN0R3JpZEl0ZW1JbmRleDtcblx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAyMDBcblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cblx0XHR0aGlzLm1vdXNlID0gbmV3IFBJWEkuUG9pbnQoKVxuXHRcdHRoaXMubW91c2UublggPSB0aGlzLm1vdXNlLm5ZID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDEsIDMsIDUsXG5cdFx0XHQ3LCA5LCAxMSxcblx0XHRcdDE1LCAxNyxcblx0XHRcdDIxLCAyMywgMjVcblx0XHRdXG5cblx0XHR0aGlzLnVzZWRTZWF0cyA9IFtdXG5cblx0XHR0aGlzLmltZ0NHcmlkID0gaW1hZ2VDYW52YXNlc0dyaWQodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMuaW1nQ0dyaWQubG9hZCh0aGlzLnByb3BzLmRhdGEuYmd1cmwpXG5cdFx0dGhpcy5ncmlkID0gZ3JpZCh0aGlzLnByb3BzLCB0aGlzLmVsZW1lbnQsIHRoaXMub25JdGVtRW5kZWQpXG5cdFx0dGhpcy5ncmlkLmluaXQoKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBib3R0b21UZXh0cyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBhcm91bmRCb3JkZXIodGhpcy5lbGVtZW50KVxuXHRcdHRoaXMubWFwID0gbWFwKHRoaXMuZWxlbWVudCwgQXBwQ29uc3RhbnRzLklOVEVSQUNUSVZFKVxuXG5cdFx0ZG9tLmV2ZW50Lm9uKHdpbmRvdywgJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0c2V0dXBBbmltYXRpb25zKCkge1xuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93LndcblxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYXJvdW5kQm9yZGVyLmVsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYXJvdW5kQm9yZGVyLmxldHRlcnMsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDApXG5cdFx0dGhpcy50bEluLmZyb20odGhpcy5pbWdDR3JpZC5lbCwgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMClcblx0XHR0aGlzLnRsSW4uc3RhZ2dlckZyb20odGhpcy5ncmlkLmNoaWxkcmVuLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjEpXG5cdFx0dGhpcy50bEluLnN0YWdnZXJGcm9tKHRoaXMuZ3JpZC5saW5lcy5ob3Jpem9udGFsLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9LCAwLjAxLCAwLjIpXG5cdFx0dGhpcy50bEluLnN0YWdnZXJGcm9tKHRoaXMuZ3JpZC5saW5lcy52ZXJ0aWNhbCwgMSwgeyBvcGFjaXR5OjAsIGVhc2U6RXhwby5lYXNlSW5PdXQgfSwgMC4wMSwgMC4yKVxuXHRcdHRoaXMudGxJbi5mcm9tKHRoaXMuYm90dG9tVGV4dHMuZWwsIDEsIHsgeDp3aW5kb3dXICogMC40LCBlYXNlOkV4cG8uZWFzZUluT3V0IH0sIDAuNSlcblxuXHRcdHN1cGVyLnNldHVwQW5pbWF0aW9ucygpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy5ib3R0b21UZXh0cy5vcGVuVHh0QnlJZCgnZ2VuZXJpYycpXG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdHRyaWdnZXJOZXdJdGVtKHR5cGUpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLnNlYXRzW1V0aWxzLlJhbmQoMCwgdGhpcy5zZWF0cy5sZW5ndGggLSAxLCAwKV1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZihzZWF0ID09IGluZGV4KSB7XG5cdFx0XHRcdGlmKHRoaXMudXNlZFNlYXRzLmxlbmd0aCA8IHRoaXMuc2VhdHMubGVuZ3RoIC0gMikgdGhpcy50cmlnZ2VyTmV3SXRlbSh0eXBlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMudXNlZFNlYXRzLnB1c2goaW5kZXgpXG5cdFx0dGhpcy5ncmlkLnRyYW5zaXRpb25Jbkl0ZW0oaW5kZXgsIHR5cGUpXG5cdH1cblx0b25JdGVtRW5kZWQoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB1c2VkU2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZih1c2VkU2VhdCA9PSBpdGVtLnNlYXQpIHtcblx0XHRcdFx0dGhpcy51c2VkU2VhdHMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHRvbk1vdXNlTW92ZShlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHR0aGlzLm1vdXNlLnggPSBlLmNsaWVudFhcblx0XHR0aGlzLm1vdXNlLnkgPSBlLmNsaWVudFlcblx0XHR0aGlzLm1vdXNlLm5YID0gKGUuY2xpZW50WCAvIHdpbmRvd1cpICogMVxuXHRcdHRoaXMubW91c2UublkgPSAoZS5jbGllbnRZIC8gd2luZG93SCkgKiAxXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdGlmKCF0aGlzLnRyYW5zaXRpb25JbkNvbXBsZXRlZCkgcmV0dXJuXG5cdFx0Ly8gdGhpcy52aWRlb1RyaWdnZXJDb3VudGVyICs9IDFcblx0XHQvLyBpZih0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPiA4MDApIHtcblx0XHQvLyBcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciA9IDBcblx0XHQvLyBcdHRoaXMudHJpZ2dlck5ld0l0ZW0oQXBwQ29uc3RhbnRzLklURU1fVklERU8pXG5cdFx0Ly8gfVxuXHRcdC8vIHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0Ly8gaWYodGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID4gMzApIHtcblx0XHQvLyBcdHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA9IDBcblx0XHQvLyBcdHRoaXMudHJpZ2dlck5ld0l0ZW0oQXBwQ29uc3RhbnRzLklURU1fSU1BR0UpXG5cdFx0Ly8gfVxuXHRcdHRoaXMuaW1nQ0dyaWQudXBkYXRlKHRoaXMubW91c2UpXG5cdFx0c3VwZXIudXBkYXRlKClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcblx0XHR2YXIgZ0dyaWQgPSBncmlkUG9zaXRpb25zKHdpbmRvd1csIHdpbmRvd0gsIEFwcENvbnN0YW50cy5HUklEX0NPTFVNTlMsIEFwcENvbnN0YW50cy5HUklEX1JPV1MsICdjb2xzX3Jvd3MnKVxuXG5cdFx0dGhpcy5ncmlkLnJlc2l6ZShnR3JpZClcblx0XHR0aGlzLmltZ0NHcmlkLnJlc2l6ZShnR3JpZClcblx0XHR0aGlzLmJvdHRvbVRleHRzLnJlc2l6ZSgpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIucmVzaXplKClcblx0XHR0aGlzLm1hcC5yZXNpemUoKVxuXG5cdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGRvbS5ldmVudC5vZmYod2luZG93LCAnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSlcblxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyLmNsZWFyKClcblx0XHR0aGlzLmdyaWQuY2xlYXIoKVxuXHRcdHRoaXMubWFwLmNsZWFyKClcblx0XHR0aGlzLmJvdHRvbVRleHRzLmNsZWFyKClcblxuXHRcdHRoaXMuZ3JpZCA9IG51bGxcblx0XHR0aGlzLmJvdHRvbVRleHRzID0gbnVsbFxuXHRcdHRoaXMuYXJvdW5kQm9yZGVyID0gbnVsbFxuXHRcdHRoaXMubWFwID0gbnVsbFxuXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbiIsImltcG9ydCBkb20gZnJvbSAnZG9tLWhhbmQnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgaW1nIGZyb20gJ2ltZydcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFV0aWxzIGZyb20gJ1V0aWxzJ1xuaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuaW1wb3J0IGNvbG9yVXRpbHMgZnJvbSAnY29sb3ItdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IChob2xkZXIsIG1vdXNlLCBkYXRhKT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciBpc1JlYWR5ID0gZmFsc2Vcblx0dmFyIHNjcmVlbkhvbGRlclNpemUgPSBbMCwgMF0sIHZpZGVvSG9sZGVyU2l6ZSA9IFswLCAwXSwgY29sb3JpZmllclNpemUgPSBbMCwgMF0sIHRvcE9mZnNldCA9IDA7XG5cdHZhciBlbCA9IGRvbS5zZWxlY3QoJy5zZWxmaWUtc3RpY2std3JhcHBlcicsIGhvbGRlcilcblx0dmFyIGJhY2tncm91bmQgPSBkb20uc2VsZWN0KCcuYmFja2dyb3VuZCcsIGVsKVxuXHR2YXIgc2NyZWVuV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zY3JlZW4td3JhcHBlcicsIGVsKVxuXHR2YXIgc2NyZWVuSG9sZGVyID0gZG9tLnNlbGVjdCgnLnNjcmVlbi1ob2xkZXInLCBzY3JlZW5XcmFwcGVyKVxuXHR2YXIgdmlkZW9Ib2xkZXIgPSBkb20uc2VsZWN0KCcudmlkZW8taG9sZGVyJywgc2NyZWVuV3JhcHBlcilcblx0dmFyIGNvbG9yaWZpZXIgPSBkb20uc2VsZWN0KCcuY29sb3JpZmllcicsIHNjcmVlbldyYXBwZXIpXG5cdHZhciBjb2xvcmlmaWVyU3ZnUGF0aCA9IGRvbS5zZWxlY3QoJ3N2ZyBwYXRoJywgY29sb3JpZmllcilcblx0dmFyIHNlbGZpZVN0aWNrV3JhcHBlciA9IGRvbS5zZWxlY3QoJy5zZWxmaWUtc3RpY2std3JhcHBlcicsIGVsKVxuXHR2YXIgc3ByaW5nVG8gPSBVdGlscy5TcHJpbmdUb1xuXHR2YXIgdHJhbnNsYXRlID0gVXRpbHMuVHJhbnNsYXRlXG5cdHZhciB0d2VlbkluO1xuXHR2YXIgYW5pbWF0aW9uID0ge1xuXHRcdHBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0ZnBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0aXBvc2l0aW9uOiB7eDogMCwgeTogMH0sXG5cdFx0dmVsb2NpdHk6IHt4OiAwLCB5OiAwfSxcblx0XHRyb3RhdGlvbjogMCxcblx0XHRjb25maWc6IHtcblx0XHRcdGxlbmd0aDogNDAwLFxuXHRcdFx0c3ByaW5nOiAwLjQsXG5cdFx0XHRmcmljdGlvbjogMC43XG5cdFx0fVxuXHR9XG5cblx0VHdlZW5NYXguc2V0KGVsLCB7IHJvdGF0aW9uOiAnLTFkZWcnLCB0cmFuc2Zvcm1PcmlnaW46JzUwJSAxMDAlJyB9KVxuXG5cdC8vIGNoZWNrIGlmIG1peC1ibGVuZC1tb2RlIGlzIGF2YWlsYWJsZVxuXHRpZiAoJ21peC1ibGVuZC1tb2RlJyBpbiBjb2xvcmlmaWVyLnN0eWxlKSB7XG5cdFx0Ly8gY2hlY2sgaWYgc2FmYXJpIGJlY2F1c2UgY29sb3IgZmlsdGVyIGlzbid0IHdvcmtpbmcgb24gaXRcblx0XHRpZihBcHBTdG9yZS5EZXRlY3Rvci5pc1NhZmFyaSkge1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZVsnbWl4LWJsZW5kLW1vZGUnXSA9ICdtdWx0aXBseSdcblx0XHR9ZWxzZXtcblx0XHRcdGNvbG9yaWZpZXIuc3R5bGVbJ21peC1ibGVuZC1tb2RlJ10gPSAnY29sb3InXG5cdFx0fVxuXHR9ZWxzZXtcblx0XHRjb2xvcmlmaWVyU3ZnUGF0aC5zdHlsZVsnb3BhY2l0eSddID0gMC44XG5cdH1cblx0XG5cdHZhciBjID0gZGF0YVsnYW1iaWVudC1jb2xvciddWydzZWxmaWUtc3RpY2snXVxuXHRjb2xvcmlmaWVyU3ZnUGF0aC5zdHlsZVsnZmlsbCddID0gJyMnICsgY29sb3JVdGlscy5oc3ZUb0hleChjLmgsIGMucywgYy52KVxuXG5cdHZhciBvblZpZGVvRW5kZWQgPSAoKT0+IHtcblx0XHRzY29wZS5jbG9zZSgpXG5cdH1cblx0dmFyIG1WaWRlbyA9IG1pbmlWaWRlbyh7XG5cdFx0YXV0b3BsYXk6IGZhbHNlXG5cdH0pXG5cdG1WaWRlby5hZGRUbyh2aWRlb0hvbGRlcilcblx0bVZpZGVvLm9uKCdlbmRlZCcsIG9uVmlkZW9FbmRlZClcblx0dmFyIHZpZGVvU3JjID0gZGF0YVsnc2VsZmllLXN0aWNrLXZpZGVvLXVybCddXG5cblx0dmFyIHN0aWNrSW1nID0gaW1nKEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9zZWxmaWVzdGljay5wbmcnLCAoKT0+IHtcblx0XHRkb20udHJlZS5hZGQoc2NyZWVuSG9sZGVyLCBzdGlja0ltZylcblx0XHRtVmlkZW8ubG9hZCh2aWRlb1NyYywgKCk9PiB7XG5cdFx0XHRpZih0d2VlbkluICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRcdHR3ZWVuSW4ucGxheSgpXG5cdFx0XHR9XG5cdFx0XHRpc1JlYWR5ID0gdHJ1ZVxuXHRcdFx0c2NvcGUucmVzaXplKClcblx0XHR9KVxuXHR9KVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiBlbCxcblx0XHRpc09wZW5lZDogZmFsc2UsXG5cdFx0b3BlbjogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDEwMCxcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuc3ByaW5nID0gMC45LFxuXHRcdFx0YW5pbWF0aW9uLmNvbmZpZy5mcmljdGlvbiA9IDAuNVxuXHRcdFx0bVZpZGVvLnBsYXkoMClcblx0XHRcdGJhY2tncm91bmQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJ1xuXHRcdFx0c2NvcGUuaXNPcGVuZWQgPSB0cnVlXG5cdFx0fSxcblx0XHRjbG9zZTogKCk9PiB7XG5cdFx0XHRhbmltYXRpb24uY29uZmlnLmxlbmd0aCA9IDAsXG5cdFx0XHRhbmltYXRpb24uY29uZmlnLnNwcmluZyA9IDAuNixcblx0XHRcdGFuaW1hdGlvbi5jb25maWcuZnJpY3Rpb24gPSAwLjdcblx0XHRcdG1WaWRlby5wYXVzZSgwKVxuXHRcdFx0YmFja2dyb3VuZC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbidcblx0XHRcdHNjb3BlLmlzT3BlbmVkID0gZmFsc2Vcblx0XHR9LFxuXHRcdHVwZGF0ZTogKCk9PiB7XG5cblx0XHRcdGlmKHNjb3BlLmlzT3BlbmVkKSB7XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnkgLSAoc2NyZWVuSG9sZGVyU2l6ZVsxXSAqIDAuOClcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ICs9IChtb3VzZS5uWCAtIDAuNSkgKiA4MFxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnkgKz0gKG1vdXNlLm5ZIC0gMC41KSAqIDMwXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0YW5pbWF0aW9uLmZwb3NpdGlvbi54ID0gYW5pbWF0aW9uLmlwb3NpdGlvbi54XG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueVxuXHRcdFx0XHRhbmltYXRpb24uZnBvc2l0aW9uLnggKz0gKG1vdXNlLm5YIC0gMC41KSAqIDIwXG5cdFx0XHRcdGFuaW1hdGlvbi5mcG9zaXRpb24ueSAtPSAobW91c2UublkgLSAwLjUpICogMjBcblx0XHRcdH1cblxuXHRcdFx0c3ByaW5nVG8oYW5pbWF0aW9uLCBhbmltYXRpb24uZnBvc2l0aW9uLCAxKVxuXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCArPSAoYW5pbWF0aW9uLmZwb3NpdGlvbi54IC0gYW5pbWF0aW9uLnBvc2l0aW9uLngpICogMC4xXG5cblx0XHRcdGFuaW1hdGlvbi5jb25maWcubGVuZ3RoICs9ICgwLjAxIC0gYW5pbWF0aW9uLmNvbmZpZy5sZW5ndGgpICogMC4wNVxuXG5cdFx0XHR0cmFuc2xhdGUoc2NyZWVuV3JhcHBlciwgYW5pbWF0aW9uLnBvc2l0aW9uLngsIGFuaW1hdGlvbi5wb3NpdGlvbi55ICsgYW5pbWF0aW9uLnZlbG9jaXR5LnksIDEpXG5cdFx0fSxcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0XHRcblx0XHRcdC8vIGlmIGltYWdlcyBub3QgcmVhZHkgcmV0dXJuXG5cdFx0XHRpZighaXNSZWFkeSkgcmV0dXJuXG5cblx0XHRcdHNjcmVlbldyYXBwZXIuc3R5bGUud2lkdGggPSB3aW5kb3dXICogMC4zICsgJ3B4J1xuXG5cdFx0XHRiYWNrZ3JvdW5kLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJhY2tncm91bmQuc3R5bGUuaGVpZ2h0ID0gd2luZG93SCArICdweCdcblxuXHRcdFx0c2NyZWVuSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHNjcmVlbkhvbGRlcilcblx0XHRcdHZpZGVvSG9sZGVyU2l6ZSA9IGRvbS5zaXplKHZpZGVvSG9sZGVyKVxuXHRcdFx0Y29sb3JpZmllclNpemUgPSBkb20uc2l6ZShjb2xvcmlmaWVyKVxuXHRcdFx0dG9wT2Zmc2V0ID0gKHdpbmRvd1cgLyBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX1cpICogMjZcblx0XHRcdHZpZGVvSG9sZGVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtICh2aWRlb0hvbGRlclNpemVbMF0gPj4gMSkgKyAncHgnXG5cdFx0XHR2aWRlb0hvbGRlci5zdHlsZS50b3AgPSB0b3BPZmZzZXQgKyAncHgnXG5cdFx0XHRjb2xvcmlmaWVyLnN0eWxlLmxlZnQgPSAoc2NyZWVuSG9sZGVyU2l6ZVswXSA+PiAxKSAtIChjb2xvcmlmaWVyU2l6ZVswXSAqIDAuNTgpICsgJ3B4J1xuXHRcdFx0Y29sb3JpZmllci5zdHlsZS50b3AgPSAtMC43ICsgJ3B4J1xuXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnggPSAod2luZG93VyA+PiAxKSAtIChzY3JlZW5Ib2xkZXJTaXplWzBdID4+IDEpXG5cdFx0XHRhbmltYXRpb24uaXBvc2l0aW9uLnkgPSB3aW5kb3dIIC0gKHZpZGVvSG9sZGVyU2l6ZVsxXSAqIDAuMzUpXG5cdFx0XHRhbmltYXRpb24ucG9zaXRpb24ueCA9IGFuaW1hdGlvbi5pcG9zaXRpb24ueFxuXHRcdFx0YW5pbWF0aW9uLnBvc2l0aW9uLnkgPSBhbmltYXRpb24uaXBvc2l0aW9uLnlcblxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbkluQ29tcGxldGVkOiAoKT0+IHtcblx0XHRcdGlmKCFpc1JlYWR5KSB7XG5cdFx0XHRcdHR3ZWVuSW4gPSBUd2Vlbk1heC5mcm9tKGVsLCAwLjYsIHsgeTogNTAwLCBwYXVzZWQ6dHJ1ZSwgZWFzZTpCYWNrLmVhc2VPdXQsIGZvcmNlM0Q6dHJ1ZSB9KVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y2xlYXI6ICgpPT4ge1xuXHRcdFx0bVZpZGVvLmNsZWFyKClcblx0XHRcdG1WaWRlbyA9IG51bGxcblx0XHRcdGFuaW1hdGlvbiA9IG51bGxcblx0XHRcdHR3ZWVuSW4gPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0c2NvcGUuY2xvc2UoKVxuXG5cdHJldHVybiBzY29wZVxuXG59IiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG52YXIgc29jaWFsTGlua3MgPSAocGFyZW50KT0+IHtcblxuXHR2YXIgc2NvcGU7XG5cdHZhciB3cmFwcGVyID0gZG9tLnNlbGVjdChcIiNmb290ZXIgI3NvY2lhbC13cmFwcGVyXCIsIHBhcmVudClcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgKiAwLjRcblxuXHRcdFx0dmFyIHdyYXBwZXJTaXplID0gZG9tLnNpemUod3JhcHBlcilcblxuXHRcdFx0dmFyIHNvY2lhbENzcyA9IHtcblx0XHRcdFx0bGVmdDogd2luZG93VyAtIHBhZGRpbmcgLSB3cmFwcGVyU2l6ZVswXSxcblx0XHRcdFx0dG9wOiB3aW5kb3dIIC0gcGFkZGluZyAtIHdyYXBwZXJTaXplWzFdLFxuXHRcdFx0fVxuXG5cdFx0XHR3cmFwcGVyLnN0eWxlLmxlZnQgPSBzb2NpYWxDc3MubGVmdCArICdweCdcblx0XHRcdHdyYXBwZXIuc3R5bGUudG9wID0gc29jaWFsQ3NzLnRvcCArICdweCdcblx0XHR9LFxuXHRcdHNob3c6ICgpPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKT0+ZG9tLmNsYXNzZXMucmVtb3ZlKHdyYXBwZXIsICdoaWRlJyksIDEwMDApXG5cdFx0fSxcblx0XHRoaWRlOiAoKT0+IHtcblx0XHRcdHNldFRpbWVvdXQoKCk9PmRvbS5jbGFzc2VzLmFkZCh3cmFwcGVyLCAnaGlkZScpLCA1MDApXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvY2lhbExpbmtzIiwiaW1wb3J0IG1pbmlWaWRlbyBmcm9tICdtaW5pLXZpZGVvJ1xuXG52YXIgdmlkZW9DYW52YXMgPSAoIHByb3BzICk9PiB7XG5cbiAgICB2YXIgc2NvcGU7XG4gICAgdmFyIGludGVydmFsSWQ7XG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwLCBkV2lkdGggPSAwLCBkSGVpZ2h0ID0gMDtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBtVmlkZW8gPSBtaW5pVmlkZW8oe1xuICAgICAgICBhdXRvcGxheTogcHJvcHMuYXV0b3BsYXkgfHwgZmFsc2UsXG4gICAgICAgIHZvbHVtZTogcHJvcHMudm9sdW1lLFxuICAgICAgICBsb29wOiBwcm9wcy5sb29wXG4gICAgfSlcblxuICAgIHZhciBvbkNhblBsYXkgPSAoKT0+e1xuICAgICAgICBzY29wZS5pc0xvYWRlZCA9IHRydWVcbiAgICAgICAgaWYocHJvcHMuYXV0b3BsYXkpIG1WaWRlby5wbGF5KClcbiAgICAgICAgaWYoZFdpZHRoID09IDApIGRXaWR0aCA9IG1WaWRlby53aWR0aCgpXG4gICAgICAgIGlmKGRIZWlnaHQgPT0gMCkgZEhlaWdodCA9IG1WaWRlby5oZWlnaHQoKVxuICAgICAgICBpZihtVmlkZW8uaXNQbGF5aW5nICE9IHRydWUpIGRyYXdPbmNlKClcbiAgICB9XG5cbiAgICB2YXIgZHJhd09uY2UgPSAoKT0+IHtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShtVmlkZW8uZWwsIGR4LCBkeSwgZFdpZHRoLCBkSGVpZ2h0KVxuICAgIH1cblxuICAgIHZhciBkcmF3ID0gKCk9PntcbiAgICAgICAgY3R4LmRyYXdJbWFnZShtVmlkZW8uZWwsIGR4LCBkeSwgZFdpZHRoLCBkSGVpZ2h0KVxuICAgIH1cblxuICAgIHZhciBwbGF5ID0gKCk9PntcbiAgICAgICAgbVZpZGVvLnBsYXkoKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgICAgIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChkcmF3LCAxMDAwIC8gMzApXG4gICAgfVxuXG4gICAgdmFyIHNlZWsgPSAodGltZSk9PiB7XG4gICAgICAgIG1WaWRlby5jdXJyZW50VGltZSh0aW1lKVxuICAgICAgICBkcmF3T25jZSgpXG4gICAgfVxuXG4gICAgdmFyIHRpbWVvdXQgPSAoY2IsIG1zKT0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcbiAgICAgICAgICAgIGNiKHNjb3BlKVxuICAgICAgICB9LCBtcylcbiAgICB9XG5cbiAgICB2YXIgcGF1c2UgPSAoKT0+e1xuICAgICAgICBtVmlkZW8ucGF1c2UoKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICAgICAgaWYocHJvcHMubG9vcCkgcGxheSgpXG4gICAgICAgIGlmKHByb3BzLm9uRW5kZWQgIT0gdW5kZWZpbmVkKSBwcm9wcy5vbkVuZGVkKHNjb3BlKVxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZSA9ICh4LCB5LCB3LCBoKT0+e1xuICAgICAgICBkeCA9IHhcbiAgICAgICAgZHkgPSB5XG4gICAgICAgIGRXaWR0aCA9IHdcbiAgICAgICAgZEhlaWdodCA9IGhcbiAgICB9XG5cbiAgICB2YXIgY2xlYXIgPSAoKT0+IHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKVxuICAgICAgICBtVmlkZW8uY2xlYXJBbGxFdmVudHMoKVxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCwwLDApXG4gICAgfVxuXG4gICAgaWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbVZpZGVvLm9uKCdlbmRlZCcsIGVuZGVkKVxuICAgIH1cblxuICAgIHNjb3BlID0ge1xuICAgICAgICBpc0xvYWRlZDogZmFsc2UsXG4gICAgICAgIGNhbnZhczogY2FudmFzLFxuICAgICAgICB2aWRlbzogbVZpZGVvLFxuICAgICAgICBjdHg6IGN0eCxcbiAgICAgICAgZHJhd09uY2U6IGRyYXdPbmNlLFxuICAgICAgICBwbGF5OiBwbGF5LFxuICAgICAgICBwYXVzZTogcGF1c2UsXG4gICAgICAgIHNlZWs6IHNlZWssXG4gICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICAgIHJlc2l6ZTogcmVzaXplLFxuICAgICAgICBjbGVhcjogY2xlYXIsXG4gICAgICAgIGxvYWQ6IChzcmMsIGNiKT0+IHtcbiAgICAgICAgICAgIG1WaWRlby5sb2FkKHNyYywgKCk9PntcbiAgICAgICAgICAgICAgICBvbkNhblBsYXkoKVxuICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2NvcGVcbn1cblxuXG5leHBvcnQgZGVmYXVsdCB2aWRlb0NhbnZhcyIsImV4cG9ydCBkZWZhdWx0IHtcblx0V0lORE9XX1JFU0laRTogJ1dJTkRPV19SRVNJWkUnLFxuXHRQQUdFX0hBU0hFUl9DSEFOR0VEOiAnUEFHRV9IQVNIRVJfQ0hBTkdFRCcsXG5cdFBBR0VfQVNTRVRTX0xPQURFRDogJ1BBR0VfQVNTRVRTX0xPQURFRCcsXG5cblx0TEFORFNDQVBFOiAnTEFORFNDQVBFJyxcblx0UE9SVFJBSVQ6ICdQT1JUUkFJVCcsXG5cblx0Rk9SV0FSRDogJ0ZPUldBUkQnLFxuXHRCQUNLV0FSRDogJ0JBQ0tXQVJEJyxcblxuXHRIT01FOiAnSE9NRScsXG5cdERJUFRZUVVFOiAnRElQVFlRVUUnLFxuXG5cdExFRlQ6ICdMRUZUJyxcblx0UklHSFQ6ICdSSUdIVCcsXG5cdFRPUDogJ1RPUCcsXG5cdEJPVFRPTTogJ0JPVFRPTScsXG5cblx0SU5URVJBQ1RJVkU6ICdJTlRFUkFDVElWRScsXG5cdFRSQU5TSVRJT046ICdUUkFOU0lUSU9OJyxcblxuXHRPUEVOX0ZFRUQ6ICdPUEVOX0ZFRUQnLFxuXHRPUEVOX0dSSUQ6ICdPUEVOX0dSSUQnLFxuXG5cdFBYX0NPTlRBSU5FUl9JU19SRUFEWTogJ1BYX0NPTlRBSU5FUl9JU19SRUFEWScsXG5cdFBYX0NPTlRBSU5FUl9BRERfQ0hJTEQ6ICdQWF9DT05UQUlORVJfQUREX0NISUxEJyxcblx0UFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRDogJ1BYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQnLFxuXG5cdE9QRU5fRlVOX0ZBQ1Q6ICdPUEVOX0ZVTl9GQUNUJyxcblx0Q0xPU0VfRlVOX0ZBQ1Q6ICdDTE9TRV9GVU5fRkFDVCcsXG5cblx0Q0VMTF9NT1VTRV9FTlRFUjogJ0NFTExfTU9VU0VfRU5URVInLFxuXHRDRUxMX01PVVNFX0xFQVZFOiAnQ0VMTF9NT1VTRV9MRUFWRScsXG5cblx0SE9NRV9WSURFT19TSVpFOiBbIDY0MCwgMzYwIF0sXG5cdEhPTUVfSU1BR0VfU0laRTogWyA0ODAsIDI3MCBdLFxuXG5cdElURU1fSU1BR0U6ICdJVEVNX0lNQUdFJyxcblx0SVRFTV9WSURFTzogJ0lURU1fVklERU8nLFxuXG5cdEdSSURfUk9XUzogNCwgXG5cdEdSSURfQ09MVU1OUzogNyxcblxuXHRQQURESU5HX0FST1VORDogNDAsXG5cdFNJREVfRVZFTlRfUEFERElORzogMTIwLFxuXG5cdEVOVklST05NRU5UUzoge1xuXHRcdFBSRVBST0Q6IHtcblx0XHRcdHN0YXRpYzogJydcblx0XHR9LFxuXHRcdFBST0Q6IHtcblx0XHRcdFwic3RhdGljXCI6IEpTX3VybF9zdGF0aWMgKyAnLydcblx0XHR9XG5cdH0sXG5cblx0TUVESUFfR0xPQkFMX1c6IDE5MjAsXG5cdE1FRElBX0dMT0JBTF9IOiAxMDgwLFxuXG5cdE1JTl9NSURETEVfVzogOTYwLFxuXHRNUV9YU01BTEw6IDMyMCxcblx0TVFfU01BTEw6IDQ4MCxcblx0TVFfTUVESVVNOiA3NjgsXG5cdE1RX0xBUkdFOiAxMDI0LFxuXHRNUV9YTEFSR0U6IDEyODAsXG5cdE1RX1hYTEFSR0U6IDE2ODAsXG59IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxudmFyIEFwcERpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVZpZXdBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0c291cmNlOiAnVklFV19BQ1RJT04nLFxuXHRcdFx0YWN0aW9uOiBhY3Rpb25cblx0XHR9KTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcERpc3BhdGNoZXIiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9J3BhZ2Utd3JhcHBlciBkaXB0eXF1ZS1wYWdlJz5cXG5cXG5cdDxkaXYgY2xhc3M9XFxcImZ1bi1mYWN0LXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2aWRlby13cmFwcGVyXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibWVzc2FnZS13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtZXNzYWdlLWlubmVyXFxcIj5cXG5cdFx0XHRcdFwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2ZhY3QtdHh0J10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydmYWN0LXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmYWN0LXR4dFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJjdXJzb3ItY3Jvc3NcXFwiPlxcblx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxNC4xMDUgMTMuODI4XFxcIj5cXG5cdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNmZmZmZmZcXFwiIHBvaW50cz1cXFwiMTMuOTQ2LDAuODM4IDEzLjI4MywwLjE1NiA3LjAzNSw2LjI1IDAuODM5LDAuMTU2IDAuMTczLDAuODM0IDYuMzcsNi45MzEgMC4xNTksMTIuOTkgMC44MjMsMTMuNjcxIDcuMDcsNy41NzggMTMuMjY2LDEzLjY3MSAxMy45MzIsMTIuOTk0IDcuNzM2LDYuODk2IFxcXCIvPlxcblx0XHRcdDwvc3ZnPlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwibWFpbi1idG5zLXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGlkPSdzaG9wLWJ0bicgY2xhc3M9J21haW4tYnRuJz5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpbWctd3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGlkPSdmdW4tZmFjdC1idG4nIGNsYXNzPSdtYWluLWJ0bic+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiaW1nLXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwic2VsZmllLXN0aWNrLXdyYXBwZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJzY3JlZW4td3JhcHBlclxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY29sb3JpZmllclxcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTAwIDIyXFxcIj5cXG5cdFx0XHRcdFx0PHBhdGggZD1cXFwiTTQuNiwxLjI1YzAuMDAxLDAsMC4wNDUtMC4wMDYsMC4wOCwwaDAuMDMyYzEuMjEyLDAuMDAzLDM2LjcwNi0xLDM2LjcwNi0xbDI1LjQ3MSwwLjU0OWMwLjA4NiwwLjAwMiwwLjE3MiwwLjAwNywwLjI1OCwwLjAxN2wxLjQ4NiwwLjE2NkM2OC43MTEsMC45ODksNjguNzczLDEsNjguODM2LDEuMDM2bDAuMzI0LDAuMTk5YzAuMDUyLDAuMDMyLDAuMTEsMC4wNDksMC4xNzEsMC4wNWwyNy4wNDMsMC40NjljMCwwLDIuNjI0LTAuMDc3LDIuNjI0LDIuOTMzbC0wLjY5Miw3Ljk2Yy0wLjA0NSwwLjUxOC0wLjQ3OSwwLjkxNi0wLjk5OSwwLjkxNmgtNi4yMDNjLTAuMzI4LDAtMC42NTMsMC4wMzQtMC45NzUsMC4xYy0wLjg1MywwLjE3NS0yLjgzLDAuNTI4LTUuMjYzLDAuNjE4Yy0wLjM0MiwwLjAxNC0wLjY2MSwwLjE4MS0wLjg3MiwwLjQ1MWwtMC41LDAuNjQ1bC0wLjI4LDAuMzU4Yy0wLjM3NCwwLjQ4Mi0wLjY0NywxLjAzNC0wLjc4OSwxLjYyOGMtMC4zMiwxLjM0NS0xLjM5OCwzLjk1Mi00LjkyNCwzLjk1OGMtMy45NzQsMC4wMDUtNy42ODUtMC4xMTMtMTAuNjEyLTAuMjI1Yy0xLjE4OS0wLjA0NC0yLjk2LDAuMjI5LTIuODU1LTEuNjI5bDAuMzYtNS45NGMwLjAxNC0wLjIxOS0wLjE1Ny0wLjQwNC0wLjM3Ni0wLjQwOUwyOS42MiwxMi40ODhjLTAuMjE0LTAuMDA0LTAuNDI4LDAuMDAxLTAuNjQxLDAuMDE1bC0xLjc1MywwLjExM2MtMC4yMDgsMC4wMTMtMC40MDcsMC4wODUtMC41NzQsMC4yMWMtMC41NTcsMC40MTEtMS44OTcsMS4zOTItMi42NjcsMS44NTljLTAuNzAxLDAuNDI2LTEuNTM5LDEuMDQyLTEuOTY4LDEuMzY0Yy0wLjE4MywwLjEzNy0wLjMwOSwwLjMzNS0wLjM1OCwwLjU1OGwtMC4zMTcsMS40MjVjLTAuMDQ0LDAuMjAyLTAuMDA0LDAuNDEzLDAuMTEzLDAuNTgzbDAuNjEzLDAuODk2YzAuMjEyLDAuMzExLDAuMjk3LDAuNjk5LDAuMTg4LDEuMDU5Yy0wLjExNSwwLjM3OC0wLjQ0NCwwLjc1NS0xLjI5MiwwLjc1NWgtNy45NTdjLTAuNDI1LDAtMC44NDgtMC4wNC0xLjI2Ni0wLjEyYy0yLjU0My0wLjQ4Ni0xMC44NDYtMi42NjEtMTAuODQ2LTEwLjM2QzAuODk2LDMuMzc1LDQuNDU5LDEuMjUsNC42LDEuMjVcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInNjcmVlbi1ob2xkZXJcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInZpZGVvLWhvbGRlclxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwiYXJyb3dzLXdyYXBwZXJcXFwiPlxcblx0XHQ8YSBocmVmPVxcXCIjL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1sncHJldmlvdXMtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcGFnZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwcmV2aW91cy1wYWdlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgaWQ9J2xlZnQnIGNsYXNzPVxcXCJhcnJvdyBsZWZ0XFxcIj5cXG5cdFx0XHRcXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMjEuODQsMjUuMTg0IDEzLjU5LDI1LjE4NCAxLjA0OCwxMi45MzQgMTMuNzk4LDAuNzY4IDIyLjAwNiwwLjcyNiAxMi41MDcsMTAuMTQzIDMxLjQyMywxMC4wNiAzMS41NDgsMTUuODUxIDExLjg4MiwxNS44NTEgXFxcIi8+XFxuXHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiMwMTAxMDFcXFwiIGQ9XFxcIk0xMy4zNCwwLjI2NWg5Ljc5NGwtOS42NDgsOS4zMDVoMTguMjM2djYuOTFIMTMuNTUzbDkuNjAxLDkuMjU5bC05LjgxMy0wLjAyTDAuMTU5LDEyLjk5MUwxMy4zNCwwLjI2NXpNMjAuNzA3LDEuMjQ1aC02Ljk3MUwxLjU2OSwxMi45OTFMMTMuNzM2LDI0Ljc0bDYuOTg0LDAuMDE0TDExLjEyNSwxNS41aDE5LjYxN3YtNC45NUgxMS4wNThMMjAuNzA3LDEuMjQ1elxcXCIvPlxcblx0XHRcdFx0PC9zdmc+XFxuXFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjQ1NiAwLjY0NCA3Ljk1NyAxNC4yMDJcXFwiPlxcblx0XHRcdFx0XHQ8cG9seWdvbiBwb2ludHM9XFxcIjcuNjI3LDAuODMxIDguMzA3LDEuNTI5IDEuOTUyLDcuNzI3IDguMjkzLDEzLjk2NSA3LjYxLDE0LjY1OCAwLjU2MSw3LjcyNCBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwcmV2aW91cy1wcmV2aWV3LXVybCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncHJldmlvdXMtcHJldmlldy11cmwnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicHJldmlvdXMtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXFxuXHRcdDwvYT5cXG5cdFx0PGEgaHJlZj1cXFwiIy9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ25leHQtcGFnZSddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnbmV4dC1wYWdlJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcGFnZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGlkPSdyaWdodCcgY2xhc3M9XFxcImFycm93IHJpZ2h0XFxcIj5cXG5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAzMiAyNlxcXCI+XFxuXHRcdFx0XHRcdDxwb2x5Z29uIGZpbGw9XFxcIiNGRkZGRkZcXFwiIHBvaW50cz1cXFwiMTAuMzc1LDAuODE4IDE4LjYyNSwwLjgxOCAzMS4xNjcsMTMuMDY4IDE4LjQxNywyNS4yMzUgMTAuMjA4LDI1LjI3NyAxOS43MDgsMTUuODYgMC43OTIsMTUuOTQzIDAuNjY3LDEwLjE1MSAyMC4zMzMsMTAuMTUxIFxcXCIvPlxcblx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjMDEwMTAxXFxcIiBkPVxcXCJNMTguNzA4LDI1LjczOEg4LjkxNGw5LjY0OC05LjMwNUgwLjMyNnYtNi45MWgxOC4xNjlMOC44OTQsMC4yNjVsOS44MTQsMC4wMmwxMy4xODEsMTIuNzI3TDE4LjcwOCwyNS43Mzh6TTExLjM0MSwyNC43NTdoNi45NzFsMTIuMTY3LTExLjc0NkwxOC4zMTIsMS4yNjNsLTYuOTg1LTAuMDE0bDkuNTk2LDkuMjU0SDEuMzA2djQuOTVIMjAuOTlMMTEuMzQxLDI0Ljc1N3pcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblxcblx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMC40NTYgMC42NDQgNy45NTcgMTQuMjAyXFxcIj5cXG5cdFx0XHRcdFx0PHBvbHlnb24gcG9pbnRzPVxcXCIxLjI0LDE0LjY1OCAwLjU2MSwxMy45NiA2LjkxNSw3Ljc2MiAwLjU3NSwxLjUyNSAxLjI1NywwLjgzMSA4LjMwNyw3Ljc2NSBcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWyduZXh0LXByZXZpZXctdXJsJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWyduZXh0LXByZXZpZXctdXJsJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm5leHQtcHJldmlldy11cmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiKVxcXCI+PC9kaXY+XFxuXHRcdDwvYT5cXG5cdDwvZGl2PlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb24sIGJ1ZmZlciA9IFxuICBcIlx0PGRpdiBkYXRhLWlkPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpZFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGRhdGEtcGVyc29uPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMucGVyc29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5wZXJzb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInBlcnNvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiIGNsYXNzPVxcXCJwb3N0XFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwidG9wLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdFx0PGltZyBzcmM9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pY29uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pY29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJpY29uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ0aXRsZVxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnBlcnNvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucGVyc29uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwZXJzb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY2xlYXItZmxvYXRcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInRpbWVcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50aW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ0aW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibWVkaWEtd3JhcHBlclxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazFbJ2lzLXZpZGVvJ10gOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazFbJ2lzLXZpZGVvJ10gOiBzdGFjazEpLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMubm9vcCxcImludmVyc2VcIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJpY29ucy13cmFwcGVyXFxcIj5cXG5cdFx0XHQ8dWwgY2xhc3M9J2xlZnQnPlxcblx0XHRcdFx0PGxpPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwLjA4MyAtMC4wMTYgMjIuOTUzIDIzLjc4M1xcXCI+PHBhdGggZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTExLjU2LDIzLjUwOWMtNi4xOSwwLTExLjIyNy01LjIxOS0xMS4yMjctMTEuNjMzUzUuMzcsMC4yNDMsMTEuNTYsMC4yNDNjNi4xOSwwLDExLjIyNiw1LjIxOSwxMS4yMjYsMTEuNjMzUzE3Ljc1LDIzLjUwOSwxMS41NiwyMy41MDl6IE0xMS41NiwxLjYxM2MtNS40MzYsMC05Ljg1Nyw0LjYwNC05Ljg1NywxMC4yNjNzNC40MjEsMTAuMjYzLDkuODU3LDEwLjI2M2M1LjQzNSwwLDkuODU2LTQuNjA0LDkuODU2LTEwLjI2M1MxNi45OTUsMS42MTMsMTEuNTYsMS42MTN6IE05LjA3NCwxMS42ODdjLTAuOTksMC0xLjQ0MS0xLjcwNC0xLjQ0MS0zLjI4N2MwLTEuNTgzLDAuNDUyLTMuMjg4LDEuNDQxLTMuMjg4YzAuOTkxLDAsMS40NDIsMS43MDUsMS40NDIsMy4yODhDMTAuNTE2LDkuOTgzLDEwLjA2NCwxMS42ODcsOS4wNzQsMTEuNjg3eiBNMTQuMDk3LDExLjY4N2MtMC45OSwwLTEuNDQxLTEuNzA0LTEuNDQxLTMuMjg3YzAtMS41ODMsMC40NTEtMy4yODgsMS40NDEtMy4yODhjMC45OTEsMCwxLjQ0MSwxLjcwNSwxLjQ0MSwzLjI4OEMxNS41MzgsOS45ODMsMTUuMDg4LDExLjY4NywxNC4wOTcsMTEuNjg3eiBNMTcuNjI5LDEyLjc0NmMtMC4wMDYsMC4xODctMC41MDMsNS43NjMtNi4yMiw1Ljc2M2MtNS43MTYsMC02LjA3LTUuNjE5LTYuMDczLTUuNjljMC4wODUsMC4wMDgsMC4xNywwLjAyMiwwLjI1NCwwLjA0M2MwLjEzMywwLjAzMiwwLjI3MS0wLjA0MiwwLjMwOC0wLjE4MmMwLjAzNS0wLjEzMy0wLjA0Mi0wLjI4OC0wLjE3NS0wLjMyYy0wLjUwNS0wLjEyMS0xLjEwNy0wLjA4OS0xLjUyNiwwLjI2NUM0LjA5MSwxMi43MTMsNC4xMSwxMi45LDQuMTk5LDEyLjk5MWMwLjEwNSwwLjEwNywwLjI0OCwwLjA4OCwwLjM1NC0wLjAwMmMtMC4xMDEsMC4wODUsMC4xOTgtMC4wOTgsMC4yMjItMC4xMDVjMC4wMDEtMC4wMDEsMC4wMDItMC4wMDIsMC4wMDQtMC4wMDJjMC4wODMsMS43ODIsMC45MzMsMy40NDgsMi4yNjYsNC41NzZjMS40OCwxLjI1MiwzLjQzOSwxLjgwNCw1LjMyOSwxLjU1NWMxLjg1OC0wLjI0MywzLjU3Mi0xLjIzMyw0LjY4NC0yLjgwOWMwLjY5LTAuOTc4LDEuMDg1LTIuMTY3LDEuMTI5LTMuMzc4YzAuMDEyLDAuMDA1LDAuNDM5LDAuMjAyLDAuNTQzLDAuMDk0YzAuMDg5LTAuMDk0LDAuMTA0LTAuMjc3LTAuMDAyLTAuMzY3Yy0wLjQxNy0wLjM1My0xLjAyMS0wLjM4My0xLjUyMy0wLjI2M2MtMC4zMTUsMC4wNzYtMC4xODQsMC41NzcsMC4xMywwLjUwMkMxNy40MzYsMTIuNzY4LDE3LjUzMywxMi43NTIsMTcuNjI5LDEyLjc0NnpcXFwiLz48L3N2Zz5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHQ8bGk+XFxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMC4zMDkgMjMgMjMuODU3XFxcIj48cGF0aCBpZD1cXFwiU2hhcGVcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xMS41LDAuNTY4Yy02LjIxMywwLTExLjI1LDUuMjI1LTExLjI1LDExLjY2OWMwLDYuNDQ0LDUuMDM3LDExLjY2OSwxMS4yNSwxMS42NjljNi4yMTQsMCwxMS4yNS01LjIyNSwxMS4yNS0xMS42NjlDMjIuNzUsNS43OTIsMTcuNzE0LDAuNTY4LDExLjUsMC41NjhMMTEuNSwwLjU2OHogTTExLjUsMTkuNjIyYy0wLjk3MywwLTEuNzU4LTAuODE2LTEuNzU4LTEuODI0YzAtMS4wMDcsMC43ODUtMS44MjIsMS43NTgtMS44MjJjMC45NywwLDEuNzU4LDAuODE1LDEuNzU4LDEuODIyQzEzLjI1OCwxOC44MDYsMTIuNDcsMTkuNjIyLDExLjUsMTkuNjIyTDExLjUsMTkuNjIyeiBNMTEuODUyLDEyLjIzN2MtMi43MTksMC00LjkyMiwyLjI4Ni00LjkyMiw1LjEwNWMwLDIuNzc4LDIuMTQzLDUuMDI2LDQuODA0LDUuMDkzYy0wLjA4LDAuMDAyLTAuMTU0LDAuMDEzLTAuMjMzLDAuMDEzYy01LjQzLDAtOS44NDQtNC41ODEtOS44NDQtMTAuMjExUzYuMDcsMi4wMjYsMTEuNSwyLjAyNmMwLjIzNiwwLDEuMzM4LDAuMTA2LDEuMzYsMC4xMDljMi4yMzEsMC40ODQsMy45MTMsMi41MzcsMy45MTMsNC45OTdDMTYuNzczLDkuOTUxLDE0LjU2NywxMi4yMzcsMTEuODUyLDEyLjIzN0wxMS44NTIsMTIuMjM3eiBNOS43NDIsNi42NzZjMCwxLjAwNywwLjc4NSwxLjgyNCwxLjc1OCwxLjgyNGMwLjk3LDAsMS43NTgtMC44MTYsMS43NTgtMS44MjRjMC0xLjAwNy0wLjc4OC0xLjgyMy0xLjc1OC0xLjgyM0MxMC41MjcsNC44NTMsOS43NDIsNS42NjksOS43NDIsNi42NzZ6XFxcIi8+PC9zdmc+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0PGxpPlxcblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIxLjI1IC0wLjc0MSAyMi41IDIzLjMzOFxcXCI+PHBhdGggZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE0LjY1MSwyMi4xNDdMMTQuNjUxLDIyLjE0N2MtNC42MzUtMC4wMDEtOC43ODItMy4wMzctMTAuMzItNy41NTVjLTItNS44NzUsMC45ODktMTIuMzQ0LDYuNjYzLTE0LjQyMmMxLjEzLTAuNDE0LDIuMzA1LTAuNjMyLDMuNDk0LTAuNjQ4YzAuMzc4LDAsMC43MTYsMC4yMTUsMC44NzMsMC41NDljMC4xNTUsMC4zMzcsMC4xMTEsMC43MjMtMC4xMTUsMS4wMWMtMC4xOTYsMC4yNTItMC4zODMsMC41MTctMC41NTcsMC43ODhjLTEuNzk4LDIuNzk2LTIuMjExLDYuMjE1LTEuMTM1LDkuMzc5YzEuMDc1LDMuMTU2LDMuNDU4LDUuNTQyLDYuNTM4LDYuNTQ0YzAuMjk4LDAuMDk4LDAuNjA0LDAuMTgyLDAuOTEsMC4yNWMwLjM1NiwwLjA3OCwwLjY0MiwwLjM2MywwLjcyMywwLjcyOGMwLjA4MiwwLjM1NS0wLjA0NCwwLjcyNS0wLjMyOCwwLjk1OGMtMC45MzQsMC43NjEtMS45NzksMS4zNTYtMy4xMDksMS43NzFDMTcuMTEyLDIxLjkyOSwxNS44ODgsMjIuMTQ3LDE0LjY1MSwyMi4xNDd6IE0xMy42NDksMC45NDljLTAuNzM5LDAuMDgxLTEuNDcyLDAuMjUyLTIuMTgzLDAuNTEyQzYuNDg5LDMuMjg0LDMuODcyLDguOTc2LDUuNjMzLDE0LjE0OWMxLjM0OCwzLjk2MSw0Ljk3Myw2LjYyMyw5LjAxOCw2LjYyM2gwLjAwMWMxLjA3NSwwLDIuMTQtMC4xOSwzLjE2NC0wLjU2NWMwLjcyNS0wLjI2NiwxLjQxLTAuNjE2LDIuMDQ1LTEuMDQ3Yy0wLjA2NS0wLjAyLTAuMTMtMC4wNC0wLjE5My0wLjA2MmMtMy40OTUtMS4xMzctNi4xOTctMy44MzctNy40MTMtNy40MDdjLTEuMjEzLTMuNTYzLTAuNzQ2LTcuNDE1LDEuMjc5LTEwLjU2NkMxMy41NzEsMS4wNjYsMTMuNjA5LDEuMDA4LDEzLjY0OSwwLjk0OXpcXFwiLz48L3N2Zz5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0XHQ8dWwgY2xhc3M9J3JpZ2h0Jz5cXG5cdFx0XHRcdDxsaT5cXG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMS4yNSAtMC43NDEgMjIuNSAyMy4zMzhcXFwiPjxwYXRoIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0yMy4yNDIsMTAuNDM4TDEzLjAxLTAuMTc2Yy0wLjI2LTAuMjY5LTAuNjgtMC4yNjktMC45MzksMEwxLjgzOSwxMC40MzhjLTAuMjU5LDAuMjY5LTAuMjU5LDAuNzA1LDAsMC45NzRMMTIuMDcsMjIuMDI1YzAuMjYsMC4yNywwLjY4LDAuMjcsMC45MzksMGwxMC4yMzItMTAuNjE0QzIzLjUwMiwxMS4xNDMsMjMuNTAyLDEwLjcwNywyMy4yNDIsMTAuNDM4TDIzLjI0MiwxMC40Mzh6IE0xNC4yOTksMTAuMzA2Yy0wLjA2MSwwLjEzNC0wLjE4MiwwLjIxNC0wLjMyNCwwLjIxMWMtMC4xNDMtMC4wMDMtMC4yNi0wLjA4OC0wLjMxNC0wLjIyNGwtMC41MTQtMS4yOTJjMCwwLTAuNDYxLDAuMjI3LTAuOTIyLDAuNTM0Yy0xLjUxMiwwLjkwOS0xLjQyLDIuMzM1LTEuNDIsMi4zMzV2NC4xN0g4LjcyOFYxMS43NWMwLDAsMC4xMTktMi40NTgsMi4wNzUtMy42NzRjMC41NzItMC4zNjMsMC44MDEtMC41MjEsMS4yMjktMC43NzdsLTAuODczLTEuMDU4Yy0wLjA5Ni0wLjEwOC0wLjExOS0wLjI1NS0wLjA2Mi0wLjM5MWMwLjA1NS0wLjEzNSwwLjE3Ni0wLjIxNiwwLjMyLTAuMjE2bDQuOTM4LDAuMDE0TDE0LjI5OSwxMC4zMDZMMTQuMjk5LDEwLjMwNnpcXFwiLz48L3N2Zz5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImNvbW1lbnRzLXdyYXBwZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmNvbW1lbnRzIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5jb21tZW50cyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImNvbW1lbnRzXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg2LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmNvbW1lbnRzKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlciArIFwiXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0PGRpdiBjbGFzcz0ndmlkZW8td3JhcHBlcic+XFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndpc3RpYV9lbWJlZCB3aXN0aWFfYXN5bmNfXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5tZWRpYSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEudXJsIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiIHBsYXllckNvbG9yPTFlZWE3OSBwbGF5YmFyPWZhbHNlIHNtYWxsUGxheUJ1dHRvbj1mYWxzZSB2b2x1bWVDb250cm9sPWZhbHNlIGZ1bGxzY3JlZW5CdXR0b249ZmFsc2VcXFwiIHN0eWxlPVxcXCJ3aWR0aDoxMDAlOyBoZWlnaHQ6MTAwJTtcXFwiPiZuYnNwOzwvZGl2Plxcblx0XHRcdFx0PC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0PGRpdiBjbGFzcz0naW1hZ2Utd3JhcHBlcic+XFxuXHRcdFx0XHRcdDxpbWcgc3JjPVxcXCJcIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS51cmwgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0PC9kaXY+XFxuXCI7XG59LFwiNlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCI7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjb21tZW50XFxcIj5cXG4gICAgXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJuYW1lXFxcIj5cIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ3BlcnNvbi1uYW1lJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydwZXJzb24tbmFtZSddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJwZXJzb24tbmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2Rpdj5cXG4gICAgXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ0ZXh0XFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydwZXJzb24tdGV4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsncGVyc29uLXRleHQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwicGVyc29uLXRleHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdFx0PC9kaXY+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmZlZWQgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczQ9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHRcXG5cdDxoZWFkZXIgaWQ9XFxcImhlYWRlclxcXCI+XFxuXHRcdFx0PGEgaHJlZj1cXFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGNsYXNzPVxcXCJsb2dvXFxcIj5cXG5cdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiBpZD1cXFwiTGF5ZXJfMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdFx0PC9hPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1hcC1idG5cXFwiPjxhIGhyZWY9XFxcIiMhL2xhbmRpbmdcXFwiIGNsYXNzPVxcXCJzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm1hcF90eHQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2E+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY2FtcGVyLWxhYlxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYlVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGFiVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY2FtcGVyX2xhYiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXdyYXBwZXIgYnRuXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3AtdGl0bGUgc2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3RpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9kaXY+XFxuXHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTBcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVuU2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcInN1Yi0xXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj0nXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLndvbWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud29tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ3b21lblNob3BVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF93b21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9oZWFkZXI+XFxuXFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdDxkaXY+PC9kaXY+XFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGJ1ZmZlciA9IFwiXCI7XG5cbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ob3Jpem9udGFsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ob3Jpem9udGFsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwiaG9yaXpvbnRhbFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ob3Jpem9udGFsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCI0XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlx0XHRcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjZcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudmVydGljYWwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnZlcnRpY2FsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKG9wdGlvbnM9e1wibmFtZVwiOlwidmVydGljYWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMudmVydGljYWwpIHsgc3RhY2sxID0gaGVscGVycy5ibG9ja0hlbHBlck1pc3NpbmcuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPWhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLCBhbGlhczQ9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBidWZmZXIgPSBcbiAgXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgaG9tZS1wYWdlJz5cXG5cdDxkaXYgY2xhc3M9XFxcImdyaWQtYmFja2dyb3VuZC1jb250YWluZXJcXFwiPjwvZGl2Plxcblx0PGRpdiBjbGFzcz1cXFwiZ3JpZC1mcm9udC1jb250YWluZXJcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdyaWQgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdyaWQgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLmdyaWQpIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImdyaWQtY29udGFpbmVyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ncmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ncmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ncmlkKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJsaW5lcy1ncmlkLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImhvcml6b250YWwtbGluZXNcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydsaW5lcy1ncmlkJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydsaW5lcy1ncmlkJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJsaW5lcy1ncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzWydsaW5lcy1ncmlkJ10pIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2ZXJ0aWNhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImJvdHRvbS10ZXh0cy1jb250YWluZXJcXFwiPlxcblxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0aXRsZXMtd3JhcHBlclxcXCI+XFxuXHRcdFx0PHVsPlxcblx0XHRcdFx0PGxpIGlkPSdkZWlhJz5ERUlBPC9saT5cXG5cdFx0XHRcdDxsaSBpZD0nYXJlbGx1Zic+QVJFTExVRjwvbGk+XFxuXHRcdFx0XHQ8bGkgaWQ9J2VzLXRyZW5jJz5FUyBUUkVOQzwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcInRleHRzLXdyYXBwZXJcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9J3R4dCcgaWQ9XFxcImdlbmVyaWNcXFwiPlwiXG4gICAgKyAoKHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZ2VuZXJpYyB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZ2VuZXJpYyA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZ2VuZXJpY1wiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz0ndHh0JyBpZD1cXFwiZGVpYVxcXCI+XCJcbiAgICArICgoc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVyc1snZGVpYS10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2RlaWEtdHh0J10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImRlaWEtdHh0XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCI8L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPSd0eHQnIGlkPVxcXCJhcmVsbHVmXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydhcmVsbHVmLXR4dCddIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnYXJlbGx1Zi10eHQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiYXJlbGx1Zi10eHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9J3R4dCcgaWQ9XFxcImVzLXRyZW5jXFxcIj5cIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydlcy10cmVuYy10eHQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2VzLXRyZW5jLXR4dCddIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJlcy10cmVuYy10eHRcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBpZD1cXFwic29jaWFsLXdyYXBwZXJcXFwiPlxcblx0XHRcdDx1bD5cXG5cdFx0XHRcdDxsaSBjbGFzcz0naW5zdGFncmFtJz5cXG5cdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnN0YWdyYW1VcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluc3RhZ3JhbVVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaW5zdGFncmFtVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE4IDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxOCAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE2LjEwNywxNS41NjJjMCwwLjMwMi0wLjI0MywwLjU0Ny0wLjU0MywwLjU0N0gyLjQzOGMtMC4zMDIsMC0wLjU0Ny0wLjI0NS0wLjU0Ny0wLjU0N1Y3LjM1OWgyLjE4OGMtMC4yODUsMC40MS0wLjM4MSwxLjE3NS0wLjM4MSwxLjY2MWMwLDIuOTI5LDIuMzg4LDUuMzEyLDUuMzIzLDUuMzEyYzIuOTM1LDAsNS4zMjItMi4zODMsNS4zMjItNS4zMTJjMC0wLjQ4Ni0wLjA2Ni0xLjI0LTAuNDItMS42NjFoMi4xODZWMTUuNTYyTDE2LjEwNywxNS41NjJ6IE05LjAyLDUuNjYzYzEuODU2LDAsMy4zNjUsMS41MDQsMy4zNjUsMy4zNThjMCwxLjg1NC0xLjUwOSwzLjM1Ny0zLjM2NSwzLjM1N2MtMS44NTcsMC0zLjM2NS0xLjUwNC0zLjM2NS0zLjM1N0M1LjY1NSw3LjE2Nyw3LjE2Myw1LjY2Myw5LjAyLDUuNjYzTDkuMDIsNS42NjN6IE0xMi44MjgsMi45ODRjMC0wLjMwMSwwLjI0NC0wLjU0NiwwLjU0NS0wLjU0NmgxLjY0M2MwLjMsMCwwLjU0OSwwLjI0NSwwLjU0OSwwLjU0NnYxLjY0MWMwLDAuMzAyLTAuMjQ5LDAuNTQ3LTAuNTQ5LDAuNTQ3aC0xLjY0M2MtMC4zMDEsMC0wLjU0NS0wLjI0NS0wLjU0NS0wLjU0N1YyLjk4NEwxMi44MjgsMi45ODR6IE0xNS42NjksMC4yNUgyLjMzYy0xLjE0OCwwLTIuMDgsMC45MjktMi4wOCwyLjA3NnYxMy4zNDljMCwxLjE0NiwwLjkzMiwyLjA3NSwyLjA4LDIuMDc1aDEzLjMzOWMxLjE1LDAsMi4wODEtMC45MywyLjA4MS0yLjA3NVYyLjMyNkMxNy43NSwxLjE3OSwxNi44MTksMC4yNSwxNS42NjksMC4yNUwxNS42NjksMC4yNXpcXFwiLz5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaSBjbGFzcz0ndHdpdHRlcic+XFxuXHRcdFx0XHRcdDxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIlxuICAgICsgYWxpYXM0KCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMudHdpdHRlclVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudHdpdHRlclVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidHdpdHRlclVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcblx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAyMiAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMjIgMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0yMS4xNzYsMC41MTRjLTAuODU0LDAuNTA5LTEuNzk5LDAuODc5LTIuODA4LDEuMDc5Yy0wLjgwNS0wLjg2NS0xLjk1My0xLjQwNS0zLjIyNi0xLjQwNWMtMi40MzgsMC00LjQxNywxLjk5Mi00LjQxNyw0LjQ0OWMwLDAuMzQ5LDAuMDM4LDAuNjg4LDAuMTE0LDEuMDEzQzcuMTY2LDUuNDY0LDMuOTEsMy42OTUsMS43MjksMWMtMC4zOCwwLjY2LTAuNTk4LDEuNDI1LTAuNTk4LDIuMjRjMCwxLjU0MywwLjc4LDIuOTA0LDEuOTY2LDMuNzA0QzIuMzc0LDYuOTIsMS42OTEsNi43MTgsMS4wOTQsNi4zODh2MC4wNTRjMCwyLjE1NywxLjUyMywzLjk1NywzLjU0Nyw0LjM2M2MtMC4zNzEsMC4xMDQtMC43NjIsMC4xNTctMS4xNjUsMC4xNTdjLTAuMjg1LDAtMC41NjMtMC4wMjctMC44MzMtMC4wOGMwLjU2MywxLjc2NywyLjE5NCwzLjA1NCw0LjEyOCwzLjA4OWMtMS41MTIsMS4xOTQtMy40MTgsMS45MDYtNS40ODksMS45MDZjLTAuMzU2LDAtMC43MDktMC4wMjEtMS4wNTUtMC4wNjJjMS45NTYsMS4yNjEsNC4yOCwxLjk5Nyw2Ljc3NSwxLjk5N2M4LjEzMSwwLDEyLjU3NC02Ljc3OCwxMi41NzQtMTIuNjU5YzAtMC4xOTMtMC4wMDQtMC4zODctMC4wMTItMC41NzdjMC44NjQtMC42MjcsMS42MTMtMS40MTEsMi4yMDQtMi4zMDNjLTAuNzkxLDAuMzU0LTEuNjQ0LDAuNTkzLTIuNTM3LDAuNzAxQzIwLjE0NiwyLjQyNCwyMC44NDcsMS41NTMsMjEuMTc2LDAuNTE0XFxcIi8+XFxuXHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0XHQ8bGkgY2xhc3M9J2ZhY2Vib29rJz5cXG5cdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczQoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5mYWNlYm9va1VybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZmFjZWJvb2tVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZhY2Vib29rVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0PHN2ZyB2ZXJzaW9uPVxcXCIxLjFcXFwiIHhtbG5zOnNrZXRjaD1cXFwiaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zXFxcIiB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDE4IDE4XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxOCAxOFxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggc2tldGNoOnR5cGU9XFxcIk1TU2hhcGVHcm91cFxcXCIgZmlsbD1cXFwiIzAwRUI3NlxcXCIgZD1cXFwiTTE3LjcxOSwxNi43NTZjMCwwLjUzMS0wLjQzMSwwLjk2My0wLjk2MiwwLjk2M2gtNC40NDN2LTYuNzUzaDIuMjY3bDAuMzM4LTIuNjMxaC0yLjYwNFY2LjY1NGMwLTAuNzYyLDAuMjExLTEuMjgxLDEuMzA0LTEuMjgxbDEuMzk0LDBWMy4wMTljLTAuMjQxLTAuMDMyLTEuMDY4LTAuMTA0LTIuMDMxLTAuMTA0Yy0yLjAwOSwwLTMuMzg1LDEuMjI3LTMuMzg1LDMuNDc5djEuOTQxSDcuMzIydjIuNjMxaDIuMjcydjYuNzUzSDEuMjQzYy0wLjUzMSwwLTAuOTYyLTAuNDMyLTAuOTYyLTAuOTYzVjEuMjQzYzAtMC41MzEsMC40MzEtMC45NjIsMC45NjItMC45NjJoMTUuNTE0YzAuNTMxLDAsMC45NjIsMC40MzEsMC45NjIsMC45NjJWMTYuNzU2XFxcIi8+XFxuXHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdDwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PmE8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmI8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHRcdDxkaXY+NDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHRcdDxkaXY+NDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiBjbGFzcz1cXFwibWFwLXdyYXBwZXJcXFwiPjwvZGl2Plx0XFxuPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHQ8ZGl2IGNsYXNzPVxcXCJibG9ja1xcXCI+XFxuXHRcdDxpbWcgc3JjPVxcXCJcIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1lZGlhIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS51cmwgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcblx0PC9kaXY+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGV4IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ0aXRsZXMtd3JhcHBlclxcXCI+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJkZWlhXFxcIj5ERUlBPC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJlcy10cmVuY1xcXCI+RVMgVFJFTkM8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyZWxsdWZcXFwiPkFSRUxMVUY8L2Rpdj5cXG48L2Rpdj5cXG5cXG48c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCItNjcgMCA3NjAgNjQ1XFxcIj5cXG5cdFxcblx0XFxuXHQ8cGF0aCBpZD1cXFwibWFwLWJnXFxcIiBzdHJva2U9XFxcIiNGRkZGRkZcXFwiIHN0cm9rZS13aWR0aD1cXFwiMlxcXCIgZmlsbD1cXFwiI2ZmZmZmZlxcXCIgZD1cXFwiTTkuMjY4LDI4OS4zOTRsOS43OS03Ljc5OGwxLjg5MSwwLjc5M2wtMS42MjksNS4wMjFsLTUuMjg2LDQuNTA0bC00LjM1NCw3LjAxMmwtMy4wODgtMS4xOThsLTIuMjM0LDIuODg1bDAsMGwtMi4zODItMS4xNzdMOS4yNjgsMjg5LjM5NHogTTU3My41OCwxNzQuMjExbDE5Ljg5LTEzLjgybDguOTAxLTIuNDc5bDUuMzU0LTQuODA5bDEuNTYtNS41NTVsLTEtNi45MjJsMS40NDUtMy45NzNsNS4wNTctMi41MjNsNC4yNzEsMi4wMWwxMS45MDYsOS4xNjVsMi42OTMsNC45MTdsMi44OTIsMS41NzVsMTEuNDgyLDEuMzY3bDMuMDU3LDEuOTQ5bDQuNDE4LDUuMjExbDcuNzY4LDIuMjIxbDUuODMyLDQuOTE2bDYuMzA1LDAuMjE1bDYuMzczLTEuMjJsMS45ODksMS44OGwwLjQwOSwxLjk2M2wtNS4zMzYsMTAuNDI4bC0wLjIyOSwzLjg2OWwxLjQ0MSwxLjY0N2wwLjg1NCwwLjk1OGw3LjM5NS0wLjQyN2wyLjM0NywxLjU0bDAuOTAzLDIuNTE5bC0yLjEwMiwzLjA1NGwtOC40MjUsMy4xODNsLTIuMTY5LDcuMTE2bDAuMzQ0LDMuMTgzbDMuMDczLDQuMjMxbDAuMDE1LDIuODQ2bC0yLjAxOSwxLjQ1bC0wLjczOSwzLjg0M2wyLjE2NiwxNi42ODdsLTAuOTgyLDEuODhsLTYuNzg1LTMuNzU3bC0xLjc1OCwwLjI1NGwtMi4wMTksNC40NjhsMS4wMzIsNi4yMzdsLTAuNjA1LDQuODI3bC0wLjM2MywyLjg2OGwtMS40OTUsMS42NjVsLTIuMTAyLTAuMTI5bC04LjM0MS0zLjg0N2wtNC4wMTEtMC40MDVsLTIuNzExLDEuNjA0bC03LjQzOCwxNi40OTdsLTMuMjg0LDExLjU5OWwzLjIyLDEwLjU5N2wxLjY0LDEuODU5bDQuMzg2LTAuMjhsMS40NzgsMS42OWwtMS45MzcsMy4zOTVsLTIuNjkzLDEuMDk1bC03Ljg1MS0wLjEyOWwtMi41NDYsMS42MjJsLTIuNjYxLDMuNzE4bDAuMTI5LDAuODk3bDAuNjA5LDQuNDQ2bC0xLjQ3OCw0LjMxM2wtMy42OCwzLjMxMmwtMy45MDksMS4xNzNsLTExLjk4OSw3Ljc1OGwtNS4zNTQsNy45NjdsLTguOTM4LDYuNTM5bC0zLjM1MSw2LjY2M2wtNS43OCw2LjU0MmwtNC44MjcsOC4xODJsMC4yOTQsMy45MDhsLTQuODk2LDEyLjI4N2wtMi4wMiw1LjEwN2wtMy4yMDIsMjIuMzkzbDAuNzIxLDguODQybC0xLjAzMywyLjk1bC0xLjcyNS0wLjI3NmwtNC4xMjUtNC40NjhsLTEuNjI0LDAuOTYybC0xLjM5NiwzLjI3MmwxLjgyMiw0Ljg0OGwtMS42OTIsNS4wMjFsLTQuNzMxLDYuNjA0bC04LjA2MiwxOS4yOTJsLTIuOTc3LDAuMzQxbC0wLjU0MSwwLjQ0OGwtMS40NzksMS4xOTVsMS4zMTYsNC40ODlsLTIuMjg0LDMuMzk1bC0yLjUxNCwxLjI2NGwtNS40ODQtNC41MzJsLTMuMDg4LTAuODk0bC0wLjgwNywxLjkwMWwyLjIyMSw3LjE3OGwtMy40LDEuMzg5bC04LjM2My0wLjEzbC0xLjUxMSwyLjJsMS4xMDIsNS4zNjVsLTAuNjg4LDIuNzczbC0zLjEzOCwzLjE2NWwtNi42MDMsMi44bC0zLjg5Niw0LjE4OGwtNC42MjktMS4zMjRsLTQuNzMxLDAuNjE3bC01LjA5Mi0yLjU4NGwtMi42MjUsMy41NjdsMC40NzMsMi43MTNsMC4xOCwxLjAyNmwtMS4zMTIsMS42ODdsLTEyLjQ1Miw0Ljc2NmwtNC41OTgsNC40ODVsLTcuMDYyLDExLjA2N2wtMTcuNjIzLDE5LjgwOWwtNC4wOTIsMS43MjdsLTQuNDk4LTAuNjE3bC0zLjY0Ni0zLjE4NGwtMi43OTUtNi41MTdsLTcuMTc2LTguODY3bC0xLjIzMy0wLjU1NmwtMy41MTUtMS42NDRsLTEuOTA0LTMuNjMybDEuMzQ5LTUuMzg3bC0zLjI3MS00LjA1OWwtNy4wMTUtNS41MTJsLTIuODkxLDEuNzk0bC00LjAyMywwLjQ3bC0yLjg3My0xLjcyOWwtMS4yNjctNS41NTVsNC43OTktOC4zNTRsLTAuMDgyLTEuNjAxbC0yLjUyOC00Ljg5NWwtOC4wMi05LjYxNGwtNS4zNTItNC4xNjZsLTQuNjE1LTEuODM3bC00LjIyMSwwLjY0MmwtNi43ODUtMC43NzFsLTQuODEzLTAuNTc0bC02Ljk0NiwyLjYyN2wtMy4wMDYsNC4wNTlsLTEuOTIyLDAuMjU1bC0xNC41NjgtNy44MzdsLTQuODYyLTAuNjIxbC04LjQ2LDEuODM3bC04LjQ4OS0wLjk4M2wtNC4yMDcsMC42NjRsLTcuNzE4LDQuMTY3bC0zLjUxNSwwLjY4MmwtMi45MDgtMS4xOTVsLTQuODEyLTQuNjgzbC00LjE1Ny0wLjU1M2wtNy4yNzMsMS40MzJsLTEuNjQyLTAuNjgybC0xLjM2My00LjEyN2wtNC44OTgtMy4wNzVsLTMuMTk5LTUuMjc5bC0xMS40MDEtOC44ODVsLTUuMjIyLTcuMTU5bC0zLjA4OC03LjU2NWwtMC40MDktNS44MzFsMy42MTEtMTIuNjcxbDAuMTMzLTUuODExbC0xLjE2OS00LjQ2OGwtNS44NDYtOC40MThsLTMuMDM3LTYuNDQ5bC0yLjMxNy00LjkzOGwxLjM2My0yLjc1M2wzLjc3NS0yLjA5NmwyLjk5Mi03LjQxNGw0LjQtMy45OTRsMi4xMDQtMy43NjFsLTQuMDI0LTkuOTE1bC0zLjg0NC02LjcyOWwtOC4zNDYtNy42NDdsLTguNzY5LTIuNTg4bC05LjQyOS0xMC4zNDJsLTQuMjU3LTIuMzI1bC01LjMxOC01LjM4NmwtNy4yNjItMS45NDVsLTAuNjcxLTAuMTY4bC01LjE3NS0xLjM5M2wtMi45NTYsMC41NmwtMi44NTcsMC41NTNsLTIuOTI0LTEuMDQ4bC0zLjk0NCwyLjA5NmwtMi4zLDQuMTIzbDAuMTQ3LDEuNDMybDAuMDg3LDAuNjgybDMuOTM4LDUuMTQ5bC0yLjM5NiwyLjUyM2wtMTAuODg4LTUuNjg1bC00LjIwNywwLjE1MWwtNS45OTMsMTEuNjYzbC00LjA5MiwzLjgyOWwtNi43MTctMC44MzNsLTkuOTIxLDMuMjY2bC03LjY1MiwyLjUyMmwtMi43NzYsMy4wMzNsLTAuMjk3LDIuNDU0bDMuMzAzLDQuMDQxbC0zLjAyMywxLjA5MWwtMC41OTIsMS4zNjd2Ny4wNDhsLTYuODgyLDE1LjcwNGwtMi43NzYsMTAuMjU2bDEuMjAyLDQuMTAybC0wLjgyNSwyLjYwOWwtMTIuMzE1LTUuMTkzbC04Ljc1OC02LjQzMWwtNS4wNDMsMi45MDdsLTAuODg2LDAuNDg4bDEuNDgxLTUuMjExbC0xLjYxLTYuNDA5bDIuMDItNS41NTZsLTAuOTE5LTIuNjdsLTQuNDM2LDEuMzY3bC00LjY4MS0wLjZsLTMuMDczLTQuOTEybC0xLjM0NS00LjYzN2wxLjE4LTIuOTQ5bDIuODk1LTEuOTY3bDcuMDExLTAuNzAzbDEuNjQzLTEuMzI4bC0wLjI2Mi0xLjc3bC03LjM0NS0zLjU0OWwtNi40Ny0xMC4zNjNsLTYuMTI2LDAuMDQzbC00LjU5OCw1LjA2NmwtMy41NjQsMC44NzNsLTQuNzQ4LDEuMTc2bC0wLjU5Mi0yLjEzNWwxLjA1MS0zLjgyNWwtMS4wODMtMi44NjRsLTMuMjg1LTAuNzA2TDY0LjM3NSwzMjhsLTIuNTk3LDYuNzUzbC00LjY5OCwzLjI5MWwtNC44NTktMC41NzdsMC43MDctMy44NDhsLTEuMTAyLTIuMzUxbC0zLjE3LDAuMzg0bC0zLjE3MS0zLjE1OGwtNC4wNDEsNC4zNzlsLTMuMTUyLDAuMjExbC0xLjY0NC0yLjM2OGwyLjYxMS0zLjIyOWw4LjU0My0zLjQ1OWwzLjQ0Ni0yLjgxN2wtMC4xMTUtMS4yNDJsLTEtMC43NWwtMi42OTMsMS4yNjNsLTUuMzg3LTAuNDMxbC0yLjE4NS0yLjIzOWwtMTAuNjQ0LTEwLjg5OGwtMC41OTItMi4xMzVsMS43MDctNi42MDNsLTAuNTc0LTIuNDk4bC0zLjUyOS0yLjk5M2wtMC42MDktMi4xNTdsMy42OTQtNy43MzdsMi4zMDItMC41OTZsMi43MTItNS41MTZsOS4xODEtOS40Mmw4LjU3MSwwLjA2NWwxMS42MjctNS41OTlsNS44MzUtNC45OTlsMS44NTQtMi43NzhsMy4yMzUtNC44OTVsNS44MzEtNC42NTRsMTIuODkzLTYuNDEzbDcuMTMtNi4zNDVsNS4wODktNy4zMDZsNS43MTctMi4zNzJsNS44MzEtOC4zMzNsMy4yODUtMi44NDJsNy40ODgtMi45NzFsNC44NjMtNi4wODZsMy4yMDMtMS4yNjNsMTAuMTY3LDEuMzY3bDYuNjcxLTEuNzUxbDUuMDU3LTMuNDM4bDE0Ljk4LTEyLjI4N2w0LjA4OC04LjI0N2wxNC4wNDQtMTQuNjE2bDYuNjY3LTEwLjc0NGw0LjAxLDMuOTEybDQuNDgzLTEuOTAybDUuMzA4LTQuNDg2bDEuNzktNC4yMTNsNi4xNTctMTQuNDAxbDQuODI3LTEuODU1bDYuNDA4LDQuOTEzbDIuNTk0LTIuODY0bC0wLjczOC01Ljg1M2wwLjY3NC0yLjk2OGwyMS45NjMtMTcuODg1bDUuMDM5LTIuNzM0bDUuNzk5LDMuMzEybDMuMzY3LTAuODc1bDMuNTMzLTMuNjk2bDEuODA4LTUuMjU3bDAuNDU5LTEuMzI0bDMuMjk5LDAuNzA3bDEuNDE0LTEwLjQ5M2wxLjgyMS0xLjMyNGw0LjY2NiwxLjMwM2w0LjQ2NS0xLjM0Nmw2LjU1NiwyLjExM2wtMC4xOTctMi4wNDlsLTAuMTE0LTEuMjM4bC0wLjAzMi0wLjI1OGwxLjcwNy0yLjU0MWwwLjQ0NCwwLjA2NGw5LjgxOSwxLjUxOGgwLjAxOGw2LjgxNy0yLjI5bDUuODYtMS45NjNsNy4wOTgtOC4yNWw4LjM2LTIuMmw0LjUzMi0yLjc1OWw0LjUwMS01Ljc2N2wyLjQ4MS0zLjE4M2w4LjE2My01LjIxbDQuOTkyLDIuMDI3bDQuNDE4LTMuOTcybDQuMDU3LTAuNDk2bDQuOTEzLTIuOTAzbDguNDc1LTEwLjgwOWwyLjc3NSwwLjY4MmwzLjM4MywzLjYxbDEuODksMi4wMzFsMi4zNjMsMi41MTlsOC42NDMtMC43NjhsMTUuNjAyLTEyLjM0OGw0LjgxMi0yLjQ1OGwxMS4wNzEtNS42NjNsMy43MTItMC4xNDdsLTAuNDc4LDUuNDQ3bDEuODkxLDAuNzlsNS43NjctMi42NjlsMy42MTEsMS4yNTlsLTIuNzI2LDQuOTU2bDAuMTQ3LDMuNTI3bDMuNzEyLTAuMzIzbDE3LjY3My0xMS41MTJsMi4zMTctMC41NzhsMi4wMDUsMS42ODdsLTAuOTg2LDIuMDc0bDAuNDA4LDEuOTY2bDExLjM1Mi0xLjg0MWw0LjM1NC0yLjU4NGwxLjcwNy0yLjM3Mmw0LjM4My02LjA4Nmw3LjE0Ny01LjIzNmwxMi40MzQtNS40NzNsNC41NjUtMC4wODZsMC45NjksMS40NTNsLTEuNzA3LDIuMzc2bDAuNzcxLDEuOTg0bDQuMDU2LTAuMjk4bDEzLjg0Ny01LjcyOGwyLjIzNCwxLjAwNWwtNC4wODksMy45OTRsLTIuMzM0LDYuOTAxbC0yLjE4NSwxLjQ3NWwtMy40ODItMC41NTZsLTMuMjIxLDEuMDQ0bC04LjkxNiw2Ljg2MWwtNi42ODQsNS4xMjhsLTMuNzgxLDEuNzNsLTExLjM5Ni0wLjI5OGwtNS45NDYsNS42NjNsLTMuMjUzLDQuNzQ0bC00LjI1NCwxLjAwNWwtMC4xNzksOS4zMTJsLTcuNjIxLTguMTgybC00Ljc0OSwwLjI3NmwtMy43NDMsNC4xOTFsLTEuMjM0LDYuNDQ5bDEuNzQzLDkuNjE3bDIuODA4LDYuNDkybDEuODcyLDQuMzM5bDcuMDQ4LDUuNjgxbDkuMzc4LTEuMjM4bDcuMTEyLTUuMDYzbDIuMjk5LTAuMjMzbDIuODc2LDEuOTJsMi45ODctMC4xNjhsMy44NzctMy4zMDlsOS4yOTYtMi45OTNsNC45MDktMy4yNDhsNS44NS03LjI0MmwzLjEwMy0yLjExN2w0LjA2LTAuMTI5bDMuMzk5LDEuOTY3bC05LjYyNSw4Ljc4MWwtMC4zMTIsMC45ODNsLTEuODI1LDUuNzY3bDAuODg5LDMuMDU4bDIuMzE3LDIuNDExbDMuMDA2LTAuMzYybDAuMzQ0LDMuMjA4bC00LjA1NiwzLjQ1OWwtNi41MDYsOS41MWwtNC4wMDcsMi43NTJsLTcuNzAzLTAuMjU1bC02LjY4NSwzLjUwNmwtMy4zMDQtMC41NmwtMi40NjMtMy4xMThsLTMuMzgzLTIuMTM1bC0xLjkzOSwwLjI1NGwtMi45NTYsMi42NDhsLTIuMjMzLDUuMzQ0bC0xLjk1NSw2LjkyMmwwLjU0NSwyLjY5MWwwLDBsMy44NDIsMTMuMDc3bDguMDQ4LDE1Ljk2Mmw2LjQzOCw3LjIybDEzLjMyMyw5LjQwMmwyMi41NDgsMTAuMjUzbDAuNjI3LDEuMjYzbDExLjU0NSw1LjYybDUuMzQsMi41ODNsNS4xNzUsMS41MzZsMy44NzQtMC40ODhsNS40NTQtMy4zNzZMNTczLjU4LDE3NC4yMTF6IE0zODcuNTE3LDYwMS45NzNsLTIuNzU5LTMuNjk2bDAuNDU5LTEuOTAybDIuMTM4LTEuMTNsMC4zMjctMi45NzVsMi41MTQtMS40NWwzLjgwOSwwLjU1NmwwLjQyNywxLjYyMmwtMi4yOCw3LjA5NWwtMi4wNTYsMi41NDFsMCwwTDM4Ny41MTcsNjAxLjk3M3ogTTM2NS42NTcsNjE0LjM0NmwzLjkwOSwxMS40OTFsMi4yMTcsMC42NjNsMC45ODItMi4wN2wtMC4yNDQtMC43NzFsLTEuMDgzLTMuNTIzbDAuNjM4LTIuNDM4bDIuNTk4LDAuMzAybDIuNzg5LDMuMTU4bDMuMDkzLDAuNzA3bDIuMjQ4LTMuMDU4bC0xLjk5LTUuMjExbDAuNjYtMi40MzdsMi42MjUtMC4zODRsNC43MTYsMi44ODVsNi4wMTEsMS4yMTdsMi4zMzUsMS45MDJsLTQuNjM0LDUuNTU1bC00LjE3MS0wLjIzNmwtMS40NzgsMS44NThsLTAuODQsMi42MDhsMi40NjUsMi42MDVsLTMuMjAzLDQuNzY2bDAuMDgzLDEuNzczbDMuNTI4LDUuNDY5bC0wLjU4OCwxLjIybC0yLjQ0OSwwLjM4NGwtNS45OTMtMS43NTFsLTYuMTkzLDEuOTYzbDAsMGwtMC4yOC00LjQyNWwtOC41MzksMC40MDlsLTAuNDQ0LTEuNDMybDMuMzg2LTQuNzQ0bC0wLjc4OS0xLjYyMmwtNi44NS0xLjc5NGwtMC42MjUtNC42MTVsNC45Ni01LjAyMWwtMi41MTQtMS45MDFsLTAuNDA5LTIuMTM2bDEuNDkyLTIuMDMxTDM2NS42NTcsNjE0LjM0NnpcXFwiLz5cXG5cdFxcblx0PHRleHQgeD1cXFwiMzY0XFxcIiB5PVxcXCIyNDJcXFwiPkEgVklTSU9OIE9GPC90ZXh0Plxcblx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMzAwLCAyNTgpXFxcIj48cGF0aCBmaWxsPVxcXCIjMWVlYTc5XFxcIiBkPVxcXCJNODcuODg0LDEuMDAxYy0wLjc5OCwwLjI5NC0xNy41MywxMy42MTctMzcuNzYzLDQwLjc1OGMtNS44OTIsOC40NzItOS4zMTksMTQuNjA3LTYuODk1LDE1LjUzYzIuMjM5LDAuODM4LDQuNDksMS42MzYsNi43NSwyLjM5NmMwLjYxNywwLjIwNywwLjk0MiwwLjIzMSwxLjE4Mi0wLjE4NmMwLjU1Ny0xLjA3MSwxLjAyLTcuOTMzLDQuMzU3LTEzLjMwNmM0LjgwOS03LjczLDExLjIxNC03LjM4NCwxNC44NzMtNi42MTJjMS44MDgsMC4zOTcsMi45NjksMi4wMDYsMS40NjMsNS4zNDJjLTMuNzY0LDguNDg5LTEwLjgsMTQuODg0LTExLjg1NiwxNi44NzVjLTAuNTM3LDEuMDksMC45NjUsMS4yNjksMS4zOTcsMS4zODZjMS43OTQsMC40OTgsMy41OTUsMC45NzMsNS4zOTgsMS40MjVjMS40MzksMC4zNjEsMi43NjEsMi45MjcsMTAuNzg4LTE3LjM1OUM5MC44MywxMS42MzcsODguNTM5LDAuODU3LDg3Ljg4NCwxLjAwMXogTTc1LjUzMiwyOS44MzVjLTMuMjQzLTAuNTctNy44NzQsMC40OTEtOC41NjYsMC4zMjRjLTAuNDUxLTAuMS0wLjQyNi0wLjY0MSwwLjA2Ni0xLjQ2N2MzLjEzNy00LjkxMywxMy4wNDItMTUuNDg2LDE0LjYwNC0xNS40MmMxLjExNSwwLjA3My0xLjAxOCw5Ljg2OS0zLjA2OSwxNC40NzdDNzcuNjA0LDI5LjgwNyw3Ni44MzQsMzAuMDczLDc1LjUzMiwyOS44MzV6IE05OC43MzksNjguOTUxYy0wLjMxMiwxLjYyMi0xLjc2OSwxLjA1Ni0yLjM2LDAuOTg4Yy02LjY5OS0wLjc1Mi0xMy4zNjUtMS43OTktMTkuOTc5LTMuMTQ5Yy0yLjY0Mi0wLjM4Mi0wLjg3OS0yLjkxNyw0LjYwMi0xOC41NzFjMy45OS0xMC4yMDMsMTguNTcyLTQ1LjY3MSwxOS4xNDEtNDUuNzU0YzEuNDgzLDAuMDQ0LDIuOTY4LDAuMDg4LDQuNDUxLDAuMTMyYzAuMTk2LDAuMDA1LDAuNDg3LDAuMTc1LDAuMTAxLDEuNjA1Yy0wLjI4NywxLjgxMy04Ljc5NiwxOC41OTItMTUuODgzLDQwLjExNWMtMy40MzcsMTAuODA0LTEuNDc0LDEzLjg1OCwxLjA3MywxNC4yMjFjNC4yOTEsMC42MTYsOC4zNjEtNS45NjgsOS40MTYtNS44NjRDMTAwLjA2LDUyLjc0Niw5OC43Niw2OC41MzcsOTguNzM5LDY4Ljk1MXogTTEyNS44NzQsNzAuMTA0Yy0wLjAyNiwxLjYzNy0xLjU2NCwxLjI1Mi0yLjE2MSwxLjI1NGMtNi43NSwwLjA0OS0xMy40OTYtMC4xOTQtMjAuMjE1LTAuNzM1Yy0yLjY1Ni0wLjA1NS0xLjM3MS0yLjg0LDEuMjY2LTE5LjM1MmMyLjEyNC0xMC44NDgsMTAuMjQyLTQ4LjMzOSwxMC44MDItNDguMzU1YzEuNDgzLDAuMDQzLDIuOTY3LDAuMDgzLDQuNDUxLDAuMTI1YzAuMTk2LDAuMDA2LDAuNTE3LDAuMTc5LDAuMzg1LDEuNjUzYzAuMDMxLDEuODE3LTUuNDM5LDE5LjMxMy04LjY0LDQxLjg0NGMtMS40ODksMTEuMjc3LDAuOTc3LDE0LjEzLDMuNTUsMTQuMjEyYzQuMzM1LDAuMTMzLDcuMjA4LTYuODQ4LDguMjctNi44NDJDMTI0LjM0Niw1My45MTUsMTI1LjgyMyw2OS43MDEsMTI1Ljg3NCw3MC4xMDR6IE0xMzcuMDc5LDIuMjc3Yy00LjU5Mi0wLjIyMy04Ljc4LDIzLjE4My05LjM5Miw0NC4yMzljLTAuMjM5LDE0LjExNywzLjU4NiwyNi4wNzYsMTMuOTM5LDI1LjI0YzEuNjctMC4xNDIsMy4zMzktMC4zMDIsNS4wMDgtMC40NzljMTAuMzM0LTEuMjA4LDExLjc1LTEzLjI2OCw4LjY5OS0yNi41NzNDMTUwLjU0MiwyNC45NzgsMTQxLjY3NywyLjYxNCwxMzcuMDc5LDIuMjc3eiBNMTQyLjY3NSw1Ny4yMjljLTQuODY0LDAuMzkxLTcuOTEyLTMuMTYxLTguMjk0LTEyLjY2OWMtMC42MTgtMTcuOTg4LDIuMDQyLTI5LjI3Niw0LjAyNC0yOS4yNjljMS45ODEsMC4wMjksNi45MTIsMTAuOTg2LDkuOTAzLDI4LjM5MUMxNDkuODM3LDUyLjkwOCwxNDcuNTM3LDU2LjgyNCwxNDIuNjc1LDU3LjIyOXogTTE3Mi42MTUsMzMuOTk0Yy0wLjc1LTIuMDEyLDMuMzc5LTYuMzk5LTIuMDQ3LTE3LjIzNGMtMi44NTItNS43NjctNy41OTEtMTIuNzAyLTEyLjY3MS0xMi44NjhjLTIuNDY5LTAuMDM5LTQuOTM5LTAuMDgyLTcuNDA5LTAuMTI4Yy0wLjQ4OC0wLjAwNS0yLjE1OS0xLjQ2Niw2Ljk2OCwzNi40ODFjNi45NjIsMjguNzkzLDguMTQsMjcuMDQyLDkuMzY2LDI2LjgwNmMxLjkwNC0wLjM2OSwzLjgwNi0wLjc2LDUuNzAzLTEuMTc0YzAuNDg4LTAuMTA2LDEuODM2LTAuMDExLDEuNDI4LTEuMjcxYy0wLjIwNS0wLjQ5Ni01LjE2Ny0xMC4zMi02Ljg2NS0xNi4wMmMtMS4yNDgtNC4xOTYsMC43NjgtNy43MTksMS45NTgtNy45MTljMi4xODgtMC4yODcsMTEuMzM5LDEzLjUwOSwxNC43NzksMjEuNDI4YzAuNDYzLDEuMTM4LDEuODg2LDAuNTEzLDIuNzU5LDAuMjY0YzEuODI4LTAuNTE1LDMuNjUyLTEuMDU0LDUuNDcxLTEuNjE1YzEuMDE0LTAuMzExLDEuMTQtMC41MTEsMC43NjktMS4yNTNDMTg0LjU0LDQzLjc4OCwxNzMuMjU3LDM2LjEzMywxNzIuNjE1LDMzLjk5NHogTTE2My4wNDcsMzIuNDI5Yy0xLjEzNywwLjE0Ni0yLjA4My0yLjg0Mi0yLjU2Mi00LjQxMWMtMy45MzktMTIuOTQ4LTMuNDY3LTE1LjQ0NS0wLjY4LTE1LjU0NmMxLjY1My0wLjA2LDQuMTMxLDEuNDk1LDUuOTgxLDUuOTU3QzE2OC42MzksMjQuODcyLDE2NC40NjEsMzIuMjE3LDE2My4wNDcsMzIuNDI5eiBNMjEyLjQ2MiwzNy4wNzJjNy4yOTMsNy43OTEsNi4xMjIsMTQuOTg2LTAuNjU3LDE3LjgwOWMtMTEuMTcyLDQuNjMzLTIzLjQxNS03Ljc5OS0zMC4xNTYtMjEuNDcxYy03LjIwNS0xNC43ODItMTEuOTM2LTMwLjcwOS01LjY4OS0zMC4xOTNjMi4zNTIsMC4wOTcsNy43OSwyLjIwNSwxMy4xMDMsNy45MDVjMi44MjQsMy4wOTYsMy4xMDcsNS4xMDIsMS4wMTYsNS40NTljLTEuMzI3LDAuMTg5LTMuOTA1LTUuMzIzLTcuODA5LTQuOTcxYy00LjM0OCwwLjI2LTAuNTgsOS45NDYsNC4xNDYsMThjNy4xOTgsMTIuMzM2LDE1Ljk0MSwxNS4zNiwxOS44LDEzLjg5YzcuMTUzLTIuNjk3LDAuNjY5LTEwLjg5LDEuMDIyLTEwLjk3QzIwNy43ODQsMzIuMzU1LDIxMS45NzQsMzYuNTQxLDIxMi40NjIsMzcuMDcyeiBNMjM5LjQyMiwyMy40ODlDMjA5LjY5NCw5LjMyOSwxOTMuOTg4LDMuODQ1LDE5My4yOTEsMy40OTNjLTAuODM2LTAuNTMsMS4zODEsOS4xNjYsMjEuODU1LDMyLjQ2NmM2LjQ2Miw2Ljc3NywxMS41ODcsMTEuMTcsMTMuOTU4LDkuOTc2YzIuMTktMS4wOSw0LjM2Ni0yLjIxNSw2LjUyOC0zLjM3MmMwLjU5MS0wLjMxNywwLjgwNy0wLjUwOSwwLjQ3OS0wLjc4MmMtMC44NTUtMC42MjktOC4zMjgtMy4xMTgtMTIuNDkyLTYuOTQ4Yy02LTUuNTA5LTEuMjktOC4zNjcsMi4xNjItOS44NDdjMS43MTMtMC43MjEsNC4zNjEtMC44LDcuMDcyLDAuODc1YzYuOTE0LDQuMTc5LDkuNTMzLDkuOTQsMTEuMTE3LDExLjEzNWMwLjg3NSwwLjYwNCwxLjk5Mi0wLjI4NSwyLjM5LTAuNTI2YzEuNjU2LTAuOTk3LDMuMzA0LTIuMDE0LDQuOTQyLTMuMDUyQzI1Mi42MTEsMzIuNjA0LDI1Ni4yMiwzMi4xOTEsMjM5LjQyMiwyMy40ODl6IE0yMTguMjA0LDE5LjQzYy0zLjA5OCwxLjAzOC01LjE2NSwzLjMzLTUuODM5LDMuNTY0Yy0wLjQzNywwLjE0NC0xLjA2OS0wLjEwMy0xLjcxNS0wLjY2NmMtMy43OTMtMy42MDItOS4wMTUtMTEuNTU5LTcuNDc1LTExLjYzOGMxLjEwNi0wLjA2OSwxMS4xMjIsNC41NjcsMTQuODc1LDYuODQyQzIxOS43MTYsMTguNjA4LDIxOS40NDcsMTkuMDAyLDIxOC4yMDQsMTkuNDN6IE01My4wNjIsMzEuOTYxQzM1LjQ1OCw1NS44MjUsMzQuOTEsNTMuOTk2LDMzLjc1Niw1My41MDRjLTEuOTc1LTAuODQzLTMuOTQyLTEuNzE5LTUuODk3LTIuNjIzYy0wLjU1MS0wLjI1Mi0xLjgwNy0wLjU5OC0wLjg3Mi0xLjY0N2MwLjc4OS0wLjczOSwxMi41MzEtMTAuMjY0LDI1LjYyNC0yNi4wMDVjMS4wNjUtMS4yNTIsNy4zNzQtOC42MDIsNi4zMDgtOC43OTFjLTAuOTE0LTAuMTQxLTcuMzY4LDUuMjk4LTkuMDE2LDYuNTRjLTEzLjk1NiwxMC42OTEtMTcuOTY2LDE2LjExLTIwLjY0OCwxNC45OThjLTMuMzc0LTEuNDQ5LDIuOTk5LTYuMTczLDExLjY2OC0xNy42MDNjMC45MS0xLjI0Miw1LjczOC02LjUwNiw0Ljc3LTYuNjkxYy0xLjA0OC0wLjIyMi04LjQzOSw1LjUyNy05LjcwNCw2LjUxNUMyMC4xNDcsMzAuMjUsMTIuMTAyLDQwLjM1MiwxMS4zNDMsNDEuMTI3Yy0xLjA2MiwwLjg4MS0xLjk0OSwwLjExOC0yLjQ3Ny0wLjE5M2MtMS41NzMtMC45MjYtMy4xMzctMS44NzMtNC42OTItMi44NGMtMS4wODctMC42Ny0zLjYyMS0wLjc2MiwxOS45NjEtMTYuNjhDNTUuMjMzLDAuNDk5LDU1LjQ2OSwxLjE1MSw1NS45NTIsMS4xNzljMC44NTcsMC4wMjEsMS43MTMsMC4wNDQsMi41NywwLjA2N2MxLjEwNCwwLjA1LDEuNDM4LTAuMDIyLTEuMDE3LDMuNDczYy00LjYyMyw2Ljg5NC04LjI3MSwxMS4xNDQtNy42NTMsMTEuMjM3QzUwLjI5MywxNiw1NC43NTksMTIuMzk4LDY0Ljc1LDUuMzYyYzUuMTk1LTMuNzk5LDUuNDkzLTMuODEyLDYuNjAzLTMuNzU4YzAuNzI4LDAuMDIxLDEuNDU0LDAuMDQyLDIuMTgyLDAuMDYyQzc0LjAyLDEuNjksNzYuMjE3LDAuNDg3LDUzLjA2MiwzMS45NjF6XFxcIi8+PC9nPlxcblxcblx0PGcgaWQ9XFxcImZvb3RzdGVwc1xcXCI+XFxuXHRcdDxnIGlkPVxcXCJkdWItbWF0ZW9cXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMzEuNjgzLDE0Mi45ODdjNi42ODgtMC44NTQsOC4zMjEtMy4xNTMsMTUuMDM5LTMuMTUzYzEuODIsMCwxMS4yNzEtMS4wMDYsMTMuNjEsMGMyMy4zMjcsMTAuMDI5LTcuMTIzLDEzLjg4OCwxMi42NTYsMjYuNTQ2YzIuMTc2LDEuMzkyLDUuMjQ0LDAuMjYxLDcuNjU4LDEuMTc3YzE3LjMyMSw2LjU3MSwzMi45ODMsMTAuNDY4LDM3LjEyLDMwLjY0MWMxLjQwOCw2Ljg2Ni0xLjYxNywxOS41ODItNS4zMDMsMjQuMTU2Yy0yLjc1NiwzLjQxOS0xMy43NjgsOS4yMjQtMjAuNTE0LDEwLjEzNGMtNi43NDUsMC45MDgtMTcuNzIzLTUuMDI5LTI0Ljk0Ni0xMC4xMzRjLTIuNzQxLTEuOTM4LTUuODg0LTcuNzItMy40MDgtMTYuNjdjMS4wMjgtMy43Miw4LjUyNC04LjA3NSwxMi41MDgtOC42NDdjNi45OTgtMS4wMDUsMzcuMDgyLDEwLjExOSwzMS42NjMsMzEuODAxYy0wLjQwNCwxLjYxNy0yLjA3OCw3LjgyNC0zLjQ0MSw4Ljc4M2MtMy45NjgsMi43OTEtNDEuMDYxLDguNDI5LTQ1LjYxMSwxMC4xMTFjLTIwLjgwNSw3LjY4OS0xOS4xNzEsMC44MzgtMzguMTY2LTExLjgyNmMtMjEuNjM3LTE0LjQyNSwwLjIyNC0yOS4zNTQtMS4zNTgtMzkuNzRjLTAuNzktNS4xODUtMTQuNjY5LTEwLjYzLTE0LjkzNS0xMS4wMmMtNS41MTUtOC4wOSwzLjk4MS0xMS44NDcsNS4wMDgtMTguNzY2XFxcIi8+XHRcXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjMxLjY4MywxNDIuOTg3YzYuNjg4LTAuODU0LDguMzIxLTMuMTUzLDE1LjAzOS0zLjE1M2MxLjgyLDAsMTEuMjcxLTEuMDA2LDEzLjYxLDBjMjMuMzI3LDEwLjAyOS03LjEyMywxMy44ODgsMTIuNjU2LDI2LjU0NmMyLjE3NiwxLjM5Miw1LjI0NCwwLjI2MSw3LjY1OCwxLjE3N2MxNy4zMjEsNi41NzEsMzIuOTgzLDEwLjQ2OCwzNy4xMiwzMC42NDFjMS40MDgsNi44NjYtMS42MTcsMTkuNTgyLTUuMzAzLDI0LjE1NmMtMi43NTYsMy40MTktMTMuNzY4LDkuMjI0LTIwLjUxNCwxMC4xMzRjLTYuNzQ1LDAuOTA4LTE3LjcyMy01LjAyOS0yNC45NDYtMTAuMTM0Yy0yLjc0MS0xLjkzOC01Ljg4NC03LjcyLTMuNDA4LTE2LjY3YzEuMDI4LTMuNzIsOC41MjQtOC4wNzUsMTIuNTA4LTguNjQ3YzYuOTk4LTEuMDA1LDM3LjA4MiwxMC4xMTksMzEuNjYzLDMxLjgwMWMtMC40MDQsMS42MTctMi4wNzgsNy44MjQtMy40NDEsOC43ODNjLTMuOTY4LDIuNzkxLTQxLjA2MSw4LjQyOS00NS42MTEsMTAuMTExYy0yMC44MDUsNy42ODktMTkuMTcxLDAuODM4LTM4LjE2Ni0xMS44MjZjLTIxLjYzNy0xNC40MjUsMC4yMjQtMjkuMzU0LTEuMzU4LTM5Ljc0Yy0wLjc5LTUuMTg1LTE0LjY2OS0xMC42My0xNC45MzUtMTEuMDJjLTUuNTE1LTguMDksMy45ODEtMTEuODQ3LDUuMDA4LTE4Ljc2NlxcXCIvPlx0XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIzMS42ODMsMTQyLjk4N2M2LjY4OC0wLjg1NCw4LjMyMS0zLjE1MywxNS4wMzktMy4xNTNjMS44MiwwLDExLjI3MS0xLjAwNiwxMy42MSwwYzIzLjMyNywxMC4wMjktNy4xMjMsMTMuODg4LDEyLjY1NiwyNi41NDZjMi4xNzYsMS4zOTIsNS4yNDQsMC4yNjEsNy42NTgsMS4xNzdjMTcuMzIxLDYuNTcxLDMyLjk4MywxMC40NjgsMzcuMTIsMzAuNjQxYzEuNDA4LDYuODY2LTEuNjE3LDE5LjU4Mi01LjMwMywyNC4xNTZjLTIuNzU2LDMuNDE5LTEzLjc2OCw5LjIyNC0yMC41MTQsMTAuMTM0Yy02Ljc0NSwwLjkwOC0xNy43MjMtNS4wMjktMjQuOTQ2LTEwLjEzNGMtMi43NDEtMS45MzgtNS44ODQtNy43Mi0zLjQwOC0xNi42N2MxLjAyOC0zLjcyLDguNTI0LTguMDc1LDEyLjUwOC04LjY0N2M2Ljk5OC0xLjAwNSwzNy4wODIsMTAuMTE5LDMxLjY2MywzMS44MDFjLTAuNDA0LDEuNjE3LTIuMDc4LDcuODI0LTMuNDQxLDguNzgzYy0zLjk2OCwyLjc5MS00MS4wNjEsOC40MjktNDUuNjExLDEwLjExMWMtMjAuODA1LDcuNjg5LTE5LjE3MSwwLjgzOC0zOC4xNjYtMTEuODI2Yy0yMS42MzctMTQuNDI1LDAuMjI0LTI5LjM1NC0xLjM1OC0zOS43NGMtMC43OS01LjE4NS0xNC42NjktMTAuNjMtMTQuOTM1LTExLjAyYy01LjUxNS04LjA5LDMuOTgxLTExLjg0Nyw1LjAwOC0xOC43NjZcXFwiLz5cdFxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJtYXRlby1iZWx1Z2FcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMjkuNSwxNDEuOTQxYzI0LjE5NS00OC4zMzYsNDEuMjg2LTIyLjIxMiw0NC4yMjQtMjIuMjEyYzguMTU1LDAsMTQuNTY1LTEwLjI3MywzNC45NC05LjI2NGMyMC44NDYsMS4wMzQsNDUuNDc3LDUuNSw1MS44NTEsMjguODY5YzcuMjA2LDI2LjQyMi0zMi40NjgsMzguMDEyLTM3LjcxMSwyMC4wMzdjLTIuMzQxLTguMDI1LDguMjAzLTEzLjcyOSwxNC43MzMtMTQuMTQzYzI5Ljc4OC0xLjg4Nyw1My41ODEtMy40NTgsNzguMzY1LDEzLjU1MmM0MS4zMDQsMjguMzQ4LDM0LjIwOCw3OS4yMDQsNDcuNzI4LDEyMi41NTljMS43NjgsNS42NjgsNS43MSwxMC42NDMsMTAuMDE4LDE0LjcyOWMyMC4zNjEsMTkuMzE4LDkxLjI2MiwxNS42ODIsMTAyLjUyNC0xNi40OThjMTIuNzItMzYuMzQzLTUxLjQyOC01MC4wOTctNzAuNzA3LTIyLjM4OGMtMS4zMTMsMS44ODctMi4wMzQsNC4yMDUtMi4zNTgsNi40OGMtMi4wNDEsMTQuMzQ4LTQuMTMsMjguNzQtNC43MTMsNDMuMjIxYy0xLjM4MywzNC4zNDQsMC4xMDIsNjguNzYyLTEuMTc4LDEwMy4xMTJjLTAuNDU3LDEyLjI3OS0yMC4yMTUsMTcuOTMyLTI4Ljg3MiwxMS4xOTdjLTcuNjM4LTUuOTQzLDEuNjE1LTEzLjkwNCw2LjQ4MS0xNi4xMTVjMTAuOTc2LTQuOTkyLDI2LjAzNS0wLjkwNiwzMi45OTgsOC44MzhjNy44NjEsMTEuMDA0LTAuODcxLDIyLjM0Mi01Ljg5NSwzMS4yMjljLTE5LjIxLDMzLjk4LTM1LjcwNSwzOC44ODktNzQuMDY0LDM4Ljg4OVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMjkuNSwxNDEuOTQxYzI0LjE5NS00OC4zMzYsNDEuMjg2LTIyLjIxMiw0NC4yMjQtMjIuMjEyYzguMTU1LDAsMTQuNTY1LTEwLjI3MywzNC45NC05LjI2NGMyMC44NDYsMS4wMzQsNDUuNDc3LDUuNSw1MS44NTEsMjguODY5YzcuMjA2LDI2LjQyMi0zMi40NjgsMzguMDEyLTM3LjcxMSwyMC4wMzdjLTIuMzQxLTguMDI1LDguMjAzLTEzLjcyOSwxNC43MzMtMTQuMTQzYzI5Ljc4OC0xLjg4Nyw1My41ODEtMy40NTgsNzguMzY1LDEzLjU1MmM0MS4zMDQsMjguMzQ4LDM0LjIwOCw3OS4yMDQsNDcuNzI4LDEyMi41NTljMS43NjgsNS42NjgsNS43MSwxMC42NDMsMTAuMDE4LDE0LjcyOWMyMC4zNjEsMTkuMzE4LDkxLjI2MiwxNS42ODIsMTAyLjUyNC0xNi40OThjMTIuNzItMzYuMzQzLTUxLjQyOC01MC4wOTctNzAuNzA3LTIyLjM4OGMtMS4zMTMsMS44ODctMi4wMzQsNC4yMDUtMi4zNTgsNi40OGMtMi4wNDEsMTQuMzQ4LTQuMTMsMjguNzQtNC43MTMsNDMuMjIxYy0xLjM4MywzNC4zNDQsMC4xMDIsNjguNzYyLTEuMTc4LDEwMy4xMTJjLTAuNDU3LDEyLjI3OS0yMC4yMTUsMTcuOTMyLTI4Ljg3MiwxMS4xOTdjLTcuNjM4LTUuOTQzLDEuNjE1LTEzLjkwNCw2LjQ4MS0xNi4xMTVjMTAuOTc2LTQuOTkyLDI2LjAzNS0wLjkwNiwzMi45OTgsOC44MzhjNy44NjEsMTEuMDA0LTAuODcxLDIyLjM0Mi01Ljg5NSwzMS4yMjljLTE5LjIxLDMzLjk4LTM1LjcwNSwzOC44ODktNzQuMDY0LDM4Ljg4OVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMjkuNSwxNDEuOTQxYzI0LjE5NS00OC4zMzYsNDEuMjg2LTIyLjIxMiw0NC4yMjQtMjIuMjEyYzguMTU1LDAsMTQuNTY1LTEwLjI3MywzNC45NC05LjI2NGMyMC44NDYsMS4wMzQsNDUuNDc3LDUuNSw1MS44NTEsMjguODY5YzcuMjA2LDI2LjQyMi0zMi40NjgsMzguMDEyLTM3LjcxMSwyMC4wMzdjLTIuMzQxLTguMDI1LDguMjAzLTEzLjcyOSwxNC43MzMtMTQuMTQzYzI5Ljc4OC0xLjg4Nyw1My41ODEtMy40NTgsNzguMzY1LDEzLjU1MmM0MS4zMDQsMjguMzQ4LDM0LjIwOCw3OS4yMDQsNDcuNzI4LDEyMi41NTljMS43NjgsNS42NjgsNS43MSwxMC42NDMsMTAuMDE4LDE0LjcyOWMyMC4zNjEsMTkuMzE4LDkxLjI2MiwxNS42ODIsMTAyLjUyNC0xNi40OThjMTIuNzItMzYuMzQzLTUxLjQyOC01MC4wOTctNzAuNzA3LTIyLjM4OGMtMS4zMTMsMS44ODctMi4wMzQsNC4yMDUtMi4zNTgsNi40OGMtMi4wNDEsMTQuMzQ4LTQuMTMsMjguNzQtNC43MTMsNDMuMjIxYy0xLjM4MywzNC4zNDQsMC4xMDIsNjguNzYyLTEuMTc4LDEwMy4xMTJjLTAuNDU3LDEyLjI3OS0yMC4yMTUsMTcuOTMyLTI4Ljg3MiwxMS4xOTdjLTcuNjM4LTUuOTQzLDEuNjE1LTEzLjkwNCw2LjQ4MS0xNi4xMTVjMTAuOTc2LTQuOTkyLDI2LjAzNS0wLjkwNiwzMi45OTgsOC44MzhjNy44NjEsMTEuMDA0LTAuODcxLDIyLjM0Mi01Ljg5NSwzMS4yMjljLTE5LjIxLDMzLjk4LTM1LjcwNSwzOC44ODktNzQuMDY0LDM4Ljg4OVxcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJiZWx1Z2EtaXNhbXVcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk00MDIuODU0LDQ1Mi40NjJjLTUuMTA2LTUuODY4LTMuMzA4LTEyLjI1My0xMC44ODQtMTguMzcxYy0xOS4yNTYtMTUuNTU2LTczLjY0MSwxNi4zNDYtOTUuOTI3LTguNTU3Yy04LjMxNS05LjI5Mi03LjY0Mi0yMS4wNzItMy43NDItMzIuMjgyYzEuOTM0LTUuNTYxLDE3LjMxOC0xNS41OTksMTguMTU2LTE2LjM5NWMxLjgyOS0xLjczNywzLjk0Ni0zLjAwNSw2LjIzMS0zLjg3OGM1LjY1OC0yLjE2MiwxMi4zNDEtMS45MDksMTguMjEyLTAuNGM4Ljk2MSwyLjMwNCwxNy4wNjgsNy4yNDQsMjUuMTM5LDExLjc2OWMzLjc2NSwyLjExMSw2LjQ5Nyw1Ljc0NCwxMC4xNjIsOC4wMjFjMi45ODMsMS44NTQsNi4yOTYsMy4xNzEsOS42MjgsNC4yODFjMy4xMTksMS4wNCw2LjM0OCwxLjkzNSw5LjYyOSwyLjEzOGMxNC4wNjEsMC44NjksMjguMTY3LDEuNDA0LDQyLjI1MiwxLjA2OWMzMC40MDItMC43MjQsNDIuOTYzLTM4LjQ2NSw4NC44NzktMTEuNDE5YzEyLjI0MSw3Ljg5NywzNS43MDYsMzEuMzMxLDEzLjc3LDQyLjc4NmMtMi44MDUsMS40NjQtMTguMDMxLDIuNzYzLTE4Ljk4LDkuMjg0Yy0xLjQzOCw5Ljg3MSwxMC41MjUsMjIuNzA2LDIuNTEyLDMxLjQyNWMtMS41MTQsMS42NDYtMy44NDQsMi42NTgtNi4wNzEsMi44NTljLTkuMjQzLDAuODMtMjEuMDg1LTMuNTYyLTI3LjgzOSwwLjE4OWMtMTUuOTI0LDguODQ4LTE1LjA2NCw0MS43ODctMzMuODIxLDQyLjYzMWMtMTkuOTU4LDAuODk4LTEuNTk3LTM3LjI4Ny0xOS44NjgtMzcuMjg3XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTQwMi44NTQsNDUyLjQ2MmMtNS4xMDYtNS44NjgtMy4zMDgtMTIuMjUzLTEwLjg4NC0xOC4zNzFjLTE5LjI1Ni0xNS41NTYtNzMuNjQxLDE2LjM0Ni05NS45MjctOC41NTdjLTguMzE1LTkuMjkyLTcuNjQyLTIxLjA3Mi0zLjc0Mi0zMi4yODJjMS45MzQtNS41NjEsMTcuMzE4LTE1LjU5OSwxOC4xNTYtMTYuMzk1YzEuODI5LTEuNzM3LDMuOTQ2LTMuMDA1LDYuMjMxLTMuODc4YzUuNjU4LTIuMTYyLDEyLjM0MS0xLjkwOSwxOC4yMTItMC40YzguOTYxLDIuMzA0LDE3LjA2OCw3LjI0NCwyNS4xMzksMTEuNzY5YzMuNzY1LDIuMTExLDYuNDk3LDUuNzQ0LDEwLjE2Miw4LjAyMWMyLjk4MywxLjg1NCw2LjI5NiwzLjE3MSw5LjYyOCw0LjI4MWMzLjExOSwxLjA0LDYuMzQ4LDEuOTM1LDkuNjI5LDIuMTM4YzE0LjA2MSwwLjg2OSwyOC4xNjcsMS40MDQsNDIuMjUyLDEuMDY5YzMwLjQwMi0wLjcyNCw0Mi45NjMtMzguNDY1LDg0Ljg3OS0xMS40MTljMTIuMjQxLDcuODk3LDM1LjcwNiwzMS4zMzEsMTMuNzcsNDIuNzg2Yy0yLjgwNSwxLjQ2NC0xOC4wMzEsMi43NjMtMTguOTgsOS4yODRjLTEuNDM4LDkuODcxLDEwLjUyNSwyMi43MDYsMi41MTIsMzEuNDI1Yy0xLjUxNCwxLjY0Ni0zLjg0NCwyLjY1OC02LjA3MSwyLjg1OWMtOS4yNDMsMC44My0yMS4wODUtMy41NjItMjcuODM5LDAuMTg5Yy0xNS45MjQsOC44NDgtMTUuMDY0LDQxLjc4Ny0zMy44MjEsNDIuNjMxYy0xOS45NTgsMC44OTgtMS41OTctMzcuMjg3LTE5Ljg2OC0zNy4yODdcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNDAyLjg1NCw0NTIuNDYyYy01LjEwNi01Ljg2OC0zLjMwOC0xMi4yNTMtMTAuODg0LTE4LjM3MWMtMTkuMjU2LTE1LjU1Ni03My42NDEsMTYuMzQ2LTk1LjkyNy04LjU1N2MtOC4zMTUtOS4yOTItNy42NDItMjEuMDcyLTMuNzQyLTMyLjI4MmMxLjkzNC01LjU2MSwxNy4zMTgtMTUuNTk5LDE4LjE1Ni0xNi4zOTVjMS44MjktMS43MzcsMy45NDYtMy4wMDUsNi4yMzEtMy44NzhjNS42NTgtMi4xNjIsMTIuMzQxLTEuOTA5LDE4LjIxMi0wLjRjOC45NjEsMi4zMDQsMTcuMDY4LDcuMjQ0LDI1LjEzOSwxMS43NjljMy43NjUsMi4xMTEsNi40OTcsNS43NDQsMTAuMTYyLDguMDIxYzIuOTgzLDEuODU0LDYuMjk2LDMuMTcxLDkuNjI4LDQuMjgxYzMuMTE5LDEuMDQsNi4zNDgsMS45MzUsOS42MjksMi4xMzhjMTQuMDYxLDAuODY5LDI4LjE2NywxLjQwNCw0Mi4yNTIsMS4wNjljMzAuNDAyLTAuNzI0LDQyLjk2My0zOC40NjUsODQuODc5LTExLjQxOWMxMi4yNDEsNy44OTcsMzUuNzA2LDMxLjMzMSwxMy43Nyw0Mi43ODZjLTIuODA1LDEuNDY0LTE4LjAzMSwyLjc2My0xOC45OCw5LjI4NGMtMS40MzgsOS44NzEsMTAuNTI1LDIyLjcwNiwyLjUxMiwzMS40MjVjLTEuNTE0LDEuNjQ2LTMuODQ0LDIuNjU4LTYuMDcxLDIuODU5Yy05LjI0MywwLjgzLTIxLjA4NS0zLjU2Mi0yNy44MzksMC4xODljLTE1LjkyNCw4Ljg0OC0xNS4wNjQsNDEuNzg3LTMzLjgyMSw0Mi42MzFjLTE5Ljk1OCwwLjg5OC0xLjU5Ny0zNy4yODctMTkuODY4LTM3LjI4N1xcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJpc2FtdS1jYXBhc1xcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTExOC40NjgsMzcyLjQwMWMwLDMuNjMtMjAuNTM4LDE5LjcwNy0yMi40NzEsMjIuNjI0Yy0xMC41OTksMTUuOTktMjEuNDg3LDM5LjA2Ni04LjczNCw1Ny4yMTRjMTcuNTY2LDI0Ljk5OSw2Ni41MjEsMjEuMzg0LDkwLjQwNCwxOS42NTNjMTMuMjEtMC45NTcsMjguNTUxLTExLjkzMywzMC41NzItMjUuNzY5YzcuOTIzLTU0LjIzNC00Mi42NzItNjQuNTgzLTc5LjA0OS0zNC45MzhjLTE1Ljc5MSwxMi44NjYtMTUuNzg1LDM1Ljg4Ny0xMi42NjYsNTQuMTU0YzEuMTA5LDYuNDk5LDYuMjQ2LDExLjY0OCwxMC4wNDUsMTcuMDM1YzMwLjI3NSw0Mi45MjcsNTEuOTY0LDM5Ljc2NSwxMDUuNzA5LDM2Ljk5MWM4LjY4Ny0wLjQ0OSwyMy4xMzYtNi45NDksMjUuMzI3LTE3LjAzMWM0LjUzOS0yMC44NzctMTMuMjAzLTIzLjc5My0yOS40MzItMjAuOTY2Yy0yMC4xODgsMy41MTYtMTkuMTkxLDM5LjAzOC0xMy4xMDEsNTEuNTc5YzcuMjE4LDE0Ljg2MSwyOS43MzUsMTYuMzMyLDQyLjc5NiwxNy40NjljMjcuMzY0LDIuMzc5LDYxLjU0NSw2LjcxOSw3Ni45MjYtMjEuMTE3YzE1LjM2OC0yNy44MTQtMzQuNTU4LTQwLjQzMS0yNS43NjUtNC4zNjVjNS40MSwyMi4xODksNjMuOTIsMTYuNzE5LDcxLjYxOS0zLjQ5NGMxLjUxLTMuOTYxLDMuMDItOC4wMTYsMy40OTQtMTIuMjI5YzAuNy02LjIyMSwwLjg1MS0xMi41NzYsMC0xOC43NzljLTAuNzUzLTUuNDgzLTEzLjA4My03LjQxOS0xNS4xNTItMi4wMzFjLTcuNTg4LDE5Ljc1MiwyMC4wMzUsMTMuNTM3LDMwLjI4Ni0yLjc3NGMyLjYxOC00LjE2Niw1LjYxNC0yNi4yMDksNS42MTQtMjYuMjA5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTExOC40NjgsMzcyLjQwMWMwLDMuNjMtMjAuNTM4LDE5LjcwNy0yMi40NzEsMjIuNjI0Yy0xMC41OTksMTUuOTktMjEuNDg3LDM5LjA2Ni04LjczNCw1Ny4yMTRjMTcuNTY2LDI0Ljk5OSw2Ni41MjEsMjEuMzg0LDkwLjQwNCwxOS42NTNjMTMuMjEtMC45NTcsMjguNTUxLTExLjkzMywzMC41NzItMjUuNzY5YzcuOTIzLTU0LjIzNC00Mi42NzItNjQuNTgzLTc5LjA0OS0zNC45MzhjLTE1Ljc5MSwxMi44NjYtMTUuNzg1LDM1Ljg4Ny0xMi42NjYsNTQuMTU0YzEuMTA5LDYuNDk5LDYuMjQ2LDExLjY0OCwxMC4wNDUsMTcuMDM1YzMwLjI3NSw0Mi45MjcsNTEuOTY0LDM5Ljc2NSwxMDUuNzA5LDM2Ljk5MWM4LjY4Ny0wLjQ0OSwyMy4xMzYtNi45NDksMjUuMzI3LTE3LjAzMWM0LjUzOS0yMC44NzctMTMuMjAzLTIzLjc5My0yOS40MzItMjAuOTY2Yy0yMC4xODgsMy41MTYtMTkuMTkxLDM5LjAzOC0xMy4xMDEsNTEuNTc5YzcuMjE4LDE0Ljg2MSwyOS43MzUsMTYuMzMyLDQyLjc5NiwxNy40NjljMjcuMzY0LDIuMzc5LDYxLjU0NSw2LjcxOSw3Ni45MjYtMjEuMTE3YzE1LjM2OC0yNy44MTQtMzQuNTU4LTQwLjQzMS0yNS43NjUtNC4zNjVjNS40MSwyMi4xODksNjMuOTIsMTYuNzE5LDcxLjYxOS0zLjQ5NGMxLjUxLTMuOTYxLDMuMDItOC4wMTYsMy40OTQtMTIuMjI5YzAuNy02LjIyMSwwLjg1MS0xMi41NzYsMC0xOC43NzljLTAuNzUzLTUuNDgzLTEzLjA4My03LjQxOS0xNS4xNTItMi4wMzFjLTcuNTg4LDE5Ljc1MiwyMC4wMzUsMTMuNTM3LDMwLjI4Ni0yLjc3NGMyLjYxOC00LjE2Niw1LjYxNC0yNi4yMDksNS42MTQtMjYuMjA5XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTExOC40NjgsMzcyLjQwMWMwLDMuNjMtMjAuNTM4LDE5LjcwNy0yMi40NzEsMjIuNjI0Yy0xMC41OTksMTUuOTktMjEuNDg3LDM5LjA2Ni04LjczNCw1Ny4yMTRjMTcuNTY2LDI0Ljk5OSw2Ni41MjEsMjEuMzg0LDkwLjQwNCwxOS42NTNjMTMuMjEtMC45NTcsMjguNTUxLTExLjkzMywzMC41NzItMjUuNzY5YzcuOTIzLTU0LjIzNC00Mi42NzItNjQuNTgzLTc5LjA0OS0zNC45MzhjLTE1Ljc5MSwxMi44NjYtMTUuNzg1LDM1Ljg4Ny0xMi42NjYsNTQuMTU0YzEuMTA5LDYuNDk5LDYuMjQ2LDExLjY0OCwxMC4wNDUsMTcuMDM1YzMwLjI3NSw0Mi45MjcsNTEuOTY0LDM5Ljc2NSwxMDUuNzA5LDM2Ljk5MWM4LjY4Ny0wLjQ0OSwyMy4xMzYtNi45NDksMjUuMzI3LTE3LjAzMWM0LjUzOS0yMC44NzctMTMuMjAzLTIzLjc5My0yOS40MzItMjAuOTY2Yy0yMC4xODgsMy41MTYtMTkuMTkxLDM5LjAzOC0xMy4xMDEsNTEuNTc5YzcuMjE4LDE0Ljg2MSwyOS43MzUsMTYuMzMyLDQyLjc5NiwxNy40NjljMjcuMzY0LDIuMzc5LDYxLjU0NSw2LjcxOSw3Ni45MjYtMjEuMTE3YzE1LjM2OC0yNy44MTQtMzQuNTU4LTQwLjQzMS0yNS43NjUtNC4zNjVjNS40MSwyMi4xODksNjMuOTIsMTYuNzE5LDcxLjYxOS0zLjQ5NGMxLjUxLTMuOTYxLDMuMDItOC4wMTYsMy40OTQtMTIuMjI5YzAuNy02LjIyMSwwLjg1MS0xMi41NzYsMC0xOC43NzljLTAuNzUzLTUuNDgzLTEzLjA4My03LjQxOS0xNS4xNTItMi4wMzFjLTcuNTg4LDE5Ljc1MiwyMC4wMzUsMTMuNTM3LDMwLjI4Ni0yLjc3NGMyLjYxOC00LjE2Niw1LjYxNC0yNi4yMDksNS42MTQtMjYuMjA5XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImNhcGFzLXBlbG90YXNcXFwiPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzAwMDAwMFxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzMuMTE0LDM1MC4yNTdjNzcuNzIyLDM2LjgwOSw0NS4xNjktOS44NjMsNzkuMDEyLDBjNy43OTgsMi4yNzIsMy45MzcsMTYuMzQ5LTguOTI1LDI3LjY1NWMtMTIuODY0LDExLjMwNi0wLjc3NiwxOS4xNjMsNi4zNTYsMTkuNzIxYzguNDg1LDAuNjYzLDAuNjc3LDIxLjQ3OSw5LjQyNCwyMS43MzVzMTYuMDY1LTMuNzI1LDIyLjUwMS0xMy42NzFjNi40MzUtOS45NDYsOC42NzctMTIuNzg5LDMuODc0LTE3LjcyNmMtMTAuNjcyLTEwLjk2OS0wLjIwNi0yMS4zMTcsMC0yMS4zNjZjMTIuMjkxLTIuOTE2LTEzLjE4NC0yMC42NC0xOS4zOTgtMjguNDA4Yy0xMC43MTYtMTMuMzk4LTQwLjcwNy00LjUxOC01MC43NTksNS41MzZjLTE5LjM5LDE5LjM5MiwxMy43MjMsNTMuODk5LTE3LjQ0Myw3My40NTNjLTMxLjE2NiwxOS41NTMsNC4yNCwzMy41NTMtNDQuNTMzLDMzLjU1M2MtMTkuOTk5LDAtMzkuNzI2LTI3LjQ2NS0yNi4zNTEtNDYuMjg3YzMuNTc1LTUuMDMxLDEyLjgyNS0xNi4zNzQsMTYuNTI2LTIxLjMxMmM3LjI1LTkuNjc2LDIuMTA1LTkuNjA2LDE1LjEwMi0xMS4wN1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzMuMTE0LDM1MC4yNTdjNzcuNzIyLDM2LjgwOSw0NS4xNjktOS44NjMsNzkuMDEyLDBjNy43OTgsMi4yNzIsMy45MzcsMTYuMzQ5LTguOTI1LDI3LjY1NWMtMTIuODY0LDExLjMwNi0wLjc3NiwxOS4xNjMsNi4zNTYsMTkuNzIxYzguNDg1LDAuNjYzLDAuNjc3LDIxLjQ3OSw5LjQyNCwyMS43MzVzMTYuMDY1LTMuNzI1LDIyLjUwMS0xMy42NzFjNi40MzUtOS45NDYsOC42NzctMTIuNzg5LDMuODc0LTE3LjcyNmMtMTAuNjcyLTEwLjk2OS0wLjIwNi0yMS4zMTcsMC0yMS4zNjZjMTIuMjkxLTIuOTE2LTEzLjE4NC0yMC42NC0xOS4zOTgtMjguNDA4Yy0xMC43MTYtMTMuMzk4LTQwLjcwNy00LjUxOC01MC43NTksNS41MzZjLTE5LjM5LDE5LjM5MiwxMy43MjMsNTMuODk5LTE3LjQ0Myw3My40NTNjLTMxLjE2NiwxOS41NTMsNC4yNCwzMy41NTMtNDQuNTMzLDMzLjU1M2MtMTkuOTk5LDAtMzkuNzI2LTI3LjQ2NS0yNi4zNTEtNDYuMjg3YzMuNTc1LTUuMDMxLDEyLjgyNS0xNi4zNzQsMTYuNTI2LTIxLjMxMmM3LjI1LTkuNjc2LDIuMTA1LTkuNjA2LDE1LjEwMi0xMS4wN1xcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMzMuMTE0LDM1MC4yNTdjNzcuNzIyLDM2LjgwOSw0NS4xNjktOS44NjMsNzkuMDEyLDBjNy43OTgsMi4yNzIsMy45MzcsMTYuMzQ5LTguOTI1LDI3LjY1NWMtMTIuODY0LDExLjMwNi0wLjc3NiwxOS4xNjMsNi4zNTYsMTkuNzIxYzguNDg1LDAuNjYzLDAuNjc3LDIxLjQ3OSw5LjQyNCwyMS43MzVzMTYuMDY1LTMuNzI1LDIyLjUwMS0xMy42NzFjNi40MzUtOS45NDYsOC42NzctMTIuNzg5LDMuODc0LTE3LjcyNmMtMTAuNjcyLTEwLjk2OS0wLjIwNi0yMS4zMTcsMC0yMS4zNjZjMTIuMjkxLTIuOTE2LTEzLjE4NC0yMC42NC0xOS4zOTgtMjguNDA4Yy0xMC43MTYtMTMuMzk4LTQwLjcwNy00LjUxOC01MC43NTksNS41MzZjLTE5LjM5LDE5LjM5MiwxMy43MjMsNTMuODk5LTE3LjQ0Myw3My40NTNjLTMxLjE2NiwxOS41NTMsNC4yNCwzMy41NTMtNDQuNTMzLDMzLjU1M2MtMTkuOTk5LDAtMzkuNzI2LTI3LjQ2NS0yNi4zNTEtNDYuMjg3YzMuNTc1LTUuMDMxLDEyLjgyNS0xNi4zNzQsMTYuNTI2LTIxLjMxMmM3LjI1LTkuNjc2LDIuMTA1LTkuNjA2LDE1LjEwMi0xMS4wN1xcXCIvPlxcblx0XHQ8L2c+XFxuXHRcdDxnIGlkPVxcXCJwZWxvdGFzLW1hcnRhXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTM3LjQ0NSwzMjUuMDZjNS40MDcsMS4wMDIsMTAuNSwyLjUwMywxNi4wNTcsMS42NDVjOS4xOTctMS40MjEsMTAuMTIzLTE0LjU2Miw4LjYxNS0yMC45MmMtMi45NDgtMTIuNDIzLTE5LjMzMy0xOC4zODYtMzAuNTYzLTEzLjg0NGMtNC45OTgsMi4wMjEtOS4yMDcsNi41NTctMTEuMzgyLDExLjQ5Yy0yLjIxMSw1LjAxNCwwLjI2OCwxMS4wNjQtMC45MjMsMTYuNDEzYy0wLjk5OCw0LjQ4Mi00LjE3OSw4LjIyOC01LjUzOCwxMi42MTVjLTAuNzkzLDIuNTYsMy44OSw4LjIwMSwxLjEyNSwxMi4yOTdjLTIuNjg5LDMuOTg0LTEyLjgxMyw2LjQzMS0xNC41MzIsOC4zOTJjLTMuMjQyLDMuNjk3LDQuMjcsNS4wODIsNC4yNyw1LjA4MmMwLjUxOCwxLjA4LDE5LjY4MS0wLjExNSwyMi4yNTktNS4wODJcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTM3LjQ0NSwzMjUuMDZjNS40MDcsMS4wMDIsMTAuNSwyLjUwMywxNi4wNTcsMS42NDVjOS4xOTctMS40MjEsMTAuMTIzLTE0LjU2Miw4LjYxNS0yMC45MmMtMi45NDgtMTIuNDIzLTE5LjMzMy0xOC4zODYtMzAuNTYzLTEzLjg0NGMtNC45OTgsMi4wMjEtOS4yMDcsNi41NTctMTEuMzgyLDExLjQ5Yy0yLjIxMSw1LjAxNCwwLjI2OCwxMS4wNjQtMC45MjMsMTYuNDEzYy0wLjk5OCw0LjQ4Mi00LjE3OSw4LjIyOC01LjUzOCwxMi42MTVjLTAuNzkzLDIuNTYsMy44OSw4LjIwMSwxLjEyNSwxMi4yOTdjLTIuNjg5LDMuOTg0LTEyLjgxMyw2LjQzMS0xNC41MzIsOC4zOTJjLTMuMjQyLDMuNjk3LDQuMjcsNS4wODIsNC4yNyw1LjA4MmMwLjUxOCwxLjA4LDE5LjY4MS0wLjExNSwyMi4yNTktNS4wODJcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTM3LjQ0NSwzMjUuMDZjNS40MDcsMS4wMDIsMTAuNSwyLjUwMywxNi4wNTcsMS42NDVjOS4xOTctMS40MjEsMTAuMTIzLTE0LjU2Miw4LjYxNS0yMC45MmMtMi45NDgtMTIuNDIzLTE5LjMzMy0xOC4zODYtMzAuNTYzLTEzLjg0NGMtNC45OTgsMi4wMjEtOS4yMDcsNi41NTctMTEuMzgyLDExLjQ5Yy0yLjIxMSw1LjAxNCwwLjI2OCwxMS4wNjQtMC45MjMsMTYuNDEzYy0wLjk5OCw0LjQ4Mi00LjE3OSw4LjIyOC01LjUzOCwxMi42MTVjLTAuNzkzLDIuNTYsMy44OSw4LjIwMSwxLjEyNSwxMi4yOTdjLTIuNjg5LDMuOTg0LTEyLjgxMyw2LjQzMS0xNC41MzIsOC4zOTJjLTMuMjQyLDMuNjk3LDQuMjcsNS4wODIsNC4yNyw1LjA4MmMwLjUxOCwxLjA4LDE5LjY4MS0wLjExNSwyMi4yNTktNS4wODJcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwibWFydGEta29iYXJhaFxcXCI+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMDAwMDAwXFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTEwOS40OTIsMzI2Ljc0OGMxNC41NjEtMTguMTc5LDQxLjM0OC02MS4zMTcsNjcuNzY1LTY2Ljg2YzIwLjI0LTQuMjQ3LDM5LjczNywxOS44NDUsMjUuNTc4LDMwLjE4NWMtMTYuNjM0LDEyLjE0Ni0zMi45NTQsNS4zMzQtMTkuNTg3LTE1Ljg5OGM3LjMxOC0xMS42MjIsMzMuMTE4LTkuMDk1LDQwLjU1My03LjE0NGMyOC4zOCw3LjQ0OCw0OS41NCwzNi43MjUsMzAuODc1LDYyLjQ0NWMtNC40ODYsNi4xODItMTcuNDQ2LDE1LjUwNC0yNC44ODMsMTcuMDUxYy00Ny4zMzQsOS44NS01MC42MzgtMjQuMDQ2LTkwLjMzNi0yNS44MDhcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTA5LjQ5MiwzMjYuNzQ4YzE0LjU2MS0xOC4xNzksNDEuMzQ4LTYxLjMxNyw2Ny43NjUtNjYuODZjMjAuMjQtNC4yNDcsMzkuNzM3LDE5Ljg0NSwyNS41NzgsMzAuMTg1Yy0xNi42MzQsMTIuMTQ2LTMyLjk1NCw1LjMzNC0xOS41ODctMTUuODk4YzcuMzE4LTExLjYyMiwzMy4xMTgtOS4wOTUsNDAuNTUzLTcuMTQ0YzI4LjM4LDcuNDQ4LDQ5LjU0LDM2LjcyNSwzMC44NzUsNjIuNDQ1Yy00LjQ4Niw2LjE4Mi0xNy40NDYsMTUuNTA0LTI0Ljg4MywxNy4wNTFjLTQ3LjMzNCw5Ljg1LTUwLjYzOC0yNC4wNDYtOTAuMzM2LTI1LjgwOFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0xMDkuNDkyLDMyNi43NDhjMTQuNTYxLTE4LjE3OSw0MS4zNDgtNjEuMzE3LDY3Ljc2NS02Ni44NmMyMC4yNC00LjI0NywzOS43MzcsMTkuODQ1LDI1LjU3OCwzMC4xODVjLTE2LjYzNCwxMi4xNDYtMzIuOTU0LDUuMzM0LTE5LjU4Ny0xNS44OThjNy4zMTgtMTEuNjIyLDMzLjExOC05LjA5NSw0MC41NTMtNy4xNDRjMjguMzgsNy40NDgsNDkuNTQsMzYuNzI1LDMwLjg3NSw2Mi40NDVjLTQuNDg2LDYuMTgyLTE3LjQ0NiwxNS41MDQtMjQuODgzLDE3LjA1MWMtNDcuMzM0LDkuODUtNTAuNjM4LTI0LjA0Ni05MC4zMzYtMjUuODA4XFxcIi8+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImtvYmFyYWgtZHViXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTAyLjcxLDMwNy43MjFjLTEwLjYxNi0wLjU0LTM2LjQ3OS0xNC4xODgtNDIuMjA1LTIzLjczYy02LjI3Mi0xMC40NTMsMTIuNzc2LTI5LjM5MywyMi42NzYtMzEuNTVjNC45OTUtMS4wODgsMTAuMDczLTIuMDIxLDE1LjE4Mi0yLjE2OWMyMC4zMTMtMC41OTIsNjIuMTAxLTcuMDEyLDYwLjkyNywyNi4yMjZjLTAuMDY1LDEuODUxLTEuMjQ2LDMuNjI3LTIuNTY0LDQuOTI5Yy05LjU5OSw5LjQ4My0xOS4yOTEsMTguOTYzLTI5Ljk2OSwyNy4yMTJjLTI4LjA2NywyMS42NzktMTMuMzE1LDkuNTY4LTM0LjkwMSwxNS4zOGMtOS43OTMsMi42MzgtMTguOTk4LDcuNDg0LTI4Ljk4Myw5LjI2OGMtOC43MTYsMS41NTYtMzkuMzE2LTAuNTIzLTUyLjA1Nyw3LjA5OWMtMy41NTUsMi4xMjctNi41NCw1LjUwOC04LjI4MSw5LjI2OGMtMS4zMjcsMi44NjUtMS4yNzksNi40MzQtMC4zOTUsOS40NjVjMi45NiwxMC4xNSwxMS45NjMsMTQuMTk3LDIxLjA5OSwxNy43NDZjNDUuNjkyLDE3Ljc1NCw1Mi40MTktMTEuNjY2LDgwLjc4NS00MC4zNjJcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTAyLjcxLDMwNy43MjFjLTEwLjYxNi0wLjU0LTM2LjQ3OS0xNC4xODgtNDIuMjA1LTIzLjczYy02LjI3Mi0xMC40NTMsMTIuNzc2LTI5LjM5MywyMi42NzYtMzEuNTVjNC45OTUtMS4wODgsMTAuMDczLTIuMDIxLDE1LjE4Mi0yLjE2OWMyMC4zMTMtMC41OTIsNjIuMTAxLTcuMDEyLDYwLjkyNywyNi4yMjZjLTAuMDY1LDEuODUxLTEuMjQ2LDMuNjI3LTIuNTY0LDQuOTI5Yy05LjU5OSw5LjQ4My0xOS4yOTEsMTguOTYzLTI5Ljk2OSwyNy4yMTJjLTI4LjA2NywyMS42NzktMTMuMzE1LDkuNTY4LTM0LjkwMSwxNS4zOGMtOS43OTMsMi42MzgtMTguOTk4LDcuNDg0LTI4Ljk4Myw5LjI2OGMtOC43MTYsMS41NTYtMzkuMzE2LTAuNTIzLTUyLjA1Nyw3LjA5OWMtMy41NTUsMi4xMjctNi41NCw1LjUwOC04LjI4MSw5LjI2OGMtMS4zMjcsMi44NjUtMS4yNzksNi40MzQtMC4zOTUsOS40NjVjMi45NiwxMC4xNSwxMS45NjMsMTQuMTk3LDIxLjA5OSwxNy43NDZjNDUuNjkyLDE3Ljc1NCw1Mi40MTktMTEuNjY2LDgwLjc4NS00MC4zNjJcXFwiLz5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMxZWVhNzlcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMTAyLjcxLDMwNy43MjFjLTEwLjYxNi0wLjU0LTM2LjQ3OS0xNC4xODgtNDIuMjA1LTIzLjczYy02LjI3Mi0xMC40NTMsMTIuNzc2LTI5LjM5MywyMi42NzYtMzEuNTVjNC45OTUtMS4wODgsMTAuMDczLTIuMDIxLDE1LjE4Mi0yLjE2OWMyMC4zMTMtMC41OTIsNjIuMTAxLTcuMDEyLDYwLjkyNywyNi4yMjZjLTAuMDY1LDEuODUxLTEuMjQ2LDMuNjI3LTIuNTY0LDQuOTI5Yy05LjU5OSw5LjQ4My0xOS4yOTEsMTguOTYzLTI5Ljk2OSwyNy4yMTJjLTI4LjA2NywyMS42NzktMTMuMzE1LDkuNTY4LTM0LjkwMSwxNS4zOGMtOS43OTMsMi42MzgtMTguOTk4LDcuNDg0LTI4Ljk4Myw5LjI2OGMtOC43MTYsMS41NTYtMzkuMzE2LTAuNTIzLTUyLjA1Nyw3LjA5OWMtMy41NTUsMi4xMjctNi41NCw1LjUwOC04LjI4MSw5LjI2OGMtMS4zMjcsMi44NjUtMS4yNzksNi40MzQtMC4zOTUsOS40NjVjMi45NiwxMC4xNSwxMS45NjMsMTQuMTk3LDIxLjA5OSwxNy43NDZjNDUuNjkyLDE3Ljc1NCw1Mi40MTktMTEuNjY2LDgwLjc4NS00MC4zNjJcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiZHViLXBhcmFkaXNlXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNNzcuNjM0LDMxNC4yMTFjLTE3LjIwOC0yNi4yOTctMzcuMDg3LTE2LjU1LTI3LjYxMy01Ny4yODljNi45OC0zMC4wMTMsOTEuMDEzLTMwLjg0OCwxMDEuOTc1LTIwLjY3YzIuOTQ1LDIuNzM0LDYuMjM0LDUuNDg5LDcuODA5LDkuMTg3YzIyLjE0OSw1Mi4wMTUtNDQuMTYsNDAuMzk3LTY5LjgxOSw0Mi43MTljLTYuNDM4LDAuNTgyLTcuMTU1LDEyLjYzNC0xLjUxNiwxNC42NTJjMy43NDUsMS4zMzgsMTIuMDYxLDMuODU1LDE2LjAxMSw0LjMxNFxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk03Ny42MzQsMzE0LjIxMWMtMTcuMjA4LTI2LjI5Ny0zNy4wODctMTYuNTUtMjcuNjEzLTU3LjI4OWM2Ljk4LTMwLjAxMyw5MS4wMTMtMzAuODQ4LDEwMS45NzUtMjAuNjdjMi45NDUsMi43MzQsNi4yMzQsNS40ODksNy44MDksOS4xODdjMjIuMTQ5LDUyLjAxNS00NC4xNiw0MC4zOTctNjkuODE5LDQyLjcxOWMtNi40MzgsMC41ODItNy4xNTUsMTIuNjM0LTEuNTE2LDE0LjY1MmMzLjc0NSwxLjMzOCwxMi4wNjEsMy44NTUsMTYuMDExLDQuMzE0XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTc3LjYzNCwzMTQuMjExYy0xNy4yMDgtMjYuMjk3LTM3LjA4Ny0xNi41NS0yNy42MTMtNTcuMjg5YzYuOTgtMzAuMDEzLDkxLjAxMy0zMC44NDgsMTAxLjk3NS0yMC42N2MyLjk0NSwyLjczNCw2LjIzNCw1LjQ4OSw3LjgwOSw5LjE4N2MyMi4xNDksNTIuMDE1LTQ0LjE2LDQwLjM5Ny02OS44MTksNDIuNzE5Yy02LjQzOCwwLjU4Mi03LjE1NSwxMi42MzQtMS41MTYsMTQuNjUyYzMuNzQ1LDEuMzM4LDEyLjA2MSwzLjg1NSwxNi4wMTEsNC4zMTRcXFwiLz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwicmV0dXJuLXRvLWJlZ2luXFxcIj5cXG5cdFx0XHQ8cGF0aCBmaWxsPVxcXCJub25lXFxcIiBzdHJva2U9XFxcIiMwMDAwMDBcXFwiIHN0cm9rZS1saW5lY2FwPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLWxpbmVqb2luPVxcXCJyb3VuZFxcXCIgc3Ryb2tlLW1pdGVybGltaXQ9XFxcIjEwXFxcIiBzdHJva2UtZGFzaGFycmF5PVxcXCI2XFxcIiBkPVxcXCJNMjA2LjI2OCwxNjAuNzQzYy0xNS4yNjctMS41MTQtMTAuMjE0LTIyLjE0Mi0xMi40OTktMzIuNTkxYy0zLjUzMi0xNi4xNjUtMjguMzI1LTE4Ljk0NC00MC4xNTUtMTcuMzc5Yy0yMC40MzMsMi43MDMsMi45OTUsNTAuMjEzLTkuMjE4LDY0LjUzMmMtMTMuMzYzLDE1LjY3LTI4LjY1OC0xMS42Ni00Mi41MSwwLjg5NmMtOC41NzMsNy43Ny0xMC42NzgsMjAuNTU2LTE2LjgxLDMwLjM2NmMtMS44NDcsMi45NTUtOC4wNDQsNi42NzktMTEuMzg4LDcuMDQ4Yy0zMC44ODksMy40MDQtMzQuOTQtOS44NTItNDEuMzU3LTEwLjUxMmMtNS45MzMtMC42MTEtMTIuMjg4LTkuNzU2LTMwLjkwOSw1LjQyNGMtMTguNjIxLDE1LjE3OSw5LjYyLDM1LjcyNywyMC41ODcsMzQuNzc0YzIyLjcxMS0xLjk3NywyNS4wMjgtMzMuMDY3LDE3Ljg2OC01MC44MzRjLTIuMjUtNS41ODMtOC4wOC05LjQzMS0xMy41NTYtMTEuOTI5Yy01LjMxNC0yLjQyNS0yOC40MzgtMi41OTUtMzQuMTYyLTIuMTcxYy0xNC4wMTUsMS4wMzktMjMuOTA0LDUuODc5LTM2LjMyOSwxNC4xYy00LjQ3OCwyLjk2Mi04LjEyNiw3LjEyNC0xMS4zODgsMTEuMzg5Yy0xLjUyOSwyLTIuNDY1LDQuNTQ0LTIuNzExLDcuMDQ4Yy0wLjg1LDguNjM2LTIuMDMsMTcuNDc4LTAuNTQzLDI2LjAyOGMyLjM4MywxMy43MDYsNi4yNDUsMjguMDYzLDIxLjE0NiwyOC43NDFjOS45MzMsMC40NTEsMTkuOTcyLTAuNzk1LDI5LjgyNSwwLjU0M2MyLjEyOCwwLjI4OSw5LjA4OCw3LjYzNiw5Ljc4OCw5LjY2N2M1LjAxNCwxNC41NjktNDAuMjg1LDE4LjQwOS0xMS4zODYsMzQuMTdjMy42MjUsMS45NzcsNy40LDMuODAxLDExLjM4Niw0Ljg4MWMxNC41NjQsMy45NTEsNTIuNTAyLTExLjYyMSw1Mi41MDItMTEuNjIxYzIwLjI4Ni0xLjA4NiwxOS40Miw1Ljc2MSwyNC43NjcsMTMuMDg1XFxcIi8+XFxuXHRcdFx0PHBhdGggZmlsbD1cXFwibm9uZVxcXCIgc3Ryb2tlPVxcXCIjMWVlYTc5XFxcIiBzdHJva2UtbGluZWNhcD1cXFwicm91bmRcXFwiIHN0cm9rZS1saW5lam9pbj1cXFwicm91bmRcXFwiIHN0cm9rZS1taXRlcmxpbWl0PVxcXCIxMFxcXCIgc3Ryb2tlLWRhc2hhcnJheT1cXFwiNlxcXCIgZD1cXFwiTTIwNi4yNjgsMTYwLjc0M2MtMTUuMjY3LTEuNTE0LTEwLjIxNC0yMi4xNDItMTIuNDk5LTMyLjU5MWMtMy41MzItMTYuMTY1LTI4LjMyNS0xOC45NDQtNDAuMTU1LTE3LjM3OWMtMjAuNDMzLDIuNzAzLDIuOTk1LDUwLjIxMy05LjIxOCw2NC41MzJjLTEzLjM2MywxNS42Ny0yOC42NTgtMTEuNjYtNDIuNTEsMC44OTZjLTguNTczLDcuNzctMTAuNjc4LDIwLjU1Ni0xNi44MSwzMC4zNjZjLTEuODQ3LDIuOTU1LTguMDQ0LDYuNjc5LTExLjM4OCw3LjA0OGMtMzAuODg5LDMuNDA0LTM0Ljk0LTkuODUyLTQxLjM1Ny0xMC41MTJjLTUuOTMzLTAuNjExLTEyLjI4OC05Ljc1Ni0zMC45MDksNS40MjRjLTE4LjYyMSwxNS4xNzksOS42MiwzNS43MjcsMjAuNTg3LDM0Ljc3NGMyMi43MTEtMS45NzcsMjUuMDI4LTMzLjA2NywxNy44NjgtNTAuODM0Yy0yLjI1LTUuNTgzLTguMDgtOS40MzEtMTMuNTU2LTExLjkyOWMtNS4zMTQtMi40MjUtMjguNDM4LTIuNTk1LTM0LjE2Mi0yLjE3MWMtMTQuMDE1LDEuMDM5LTIzLjkwNCw1Ljg3OS0zNi4zMjksMTQuMWMtNC40NzgsMi45NjItOC4xMjYsNy4xMjQtMTEuMzg4LDExLjM4OWMtMS41MjksMi0yLjQ2NSw0LjU0NC0yLjcxMSw3LjA0OGMtMC44NSw4LjYzNi0yLjAzLDE3LjQ3OC0wLjU0MywyNi4wMjhjMi4zODMsMTMuNzA2LDYuMjQ1LDI4LjA2MywyMS4xNDYsMjguNzQxYzkuOTMzLDAuNDUxLDE5Ljk3Mi0wLjc5NSwyOS44MjUsMC41NDNjMi4xMjgsMC4yODksOS4wODgsNy42MzYsOS43ODgsOS42NjdjNS4wMTQsMTQuNTY5LTQwLjI4NSwxOC40MDktMTEuMzg2LDM0LjE3YzMuNjI1LDEuOTc3LDcuNCwzLjgwMSwxMS4zODYsNC44ODFjMTQuNTY0LDMuOTUxLDUyLjUwMi0xMS42MjEsNTIuNTAyLTExLjYyMWMyMC4yODYtMS4wODYsMTkuNDIsNS43NjEsMjQuNzY3LDEzLjA4NVxcXCIvPlxcblx0XHRcdDxwYXRoIGZpbGw9XFxcIm5vbmVcXFwiIHN0cm9rZT1cXFwiIzFlZWE3OVxcXCIgc3Ryb2tlLWxpbmVjYXA9XFxcInJvdW5kXFxcIiBzdHJva2UtbGluZWpvaW49XFxcInJvdW5kXFxcIiBzdHJva2UtbWl0ZXJsaW1pdD1cXFwiMTBcXFwiIHN0cm9rZS1kYXNoYXJyYXk9XFxcIjZcXFwiIGQ9XFxcIk0yMDYuMjY4LDE2MC43NDNjLTE1LjI2Ny0xLjUxNC0xMC4yMTQtMjIuMTQyLTEyLjQ5OS0zMi41OTFjLTMuNTMyLTE2LjE2NS0yOC4zMjUtMTguOTQ0LTQwLjE1NS0xNy4zNzljLTIwLjQzMywyLjcwMywyLjk5NSw1MC4yMTMtOS4yMTgsNjQuNTMyYy0xMy4zNjMsMTUuNjctMjguNjU4LTExLjY2LTQyLjUxLDAuODk2Yy04LjU3Myw3Ljc3LTEwLjY3OCwyMC41NTYtMTYuODEsMzAuMzY2Yy0xLjg0NywyLjk1NS04LjA0NCw2LjY3OS0xMS4zODgsNy4wNDhjLTMwLjg4OSwzLjQwNC0zNC45NC05Ljg1Mi00MS4zNTctMTAuNTEyYy01LjkzMy0wLjYxMS0xMi4yODgtOS43NTYtMzAuOTA5LDUuNDI0Yy0xOC42MjEsMTUuMTc5LDkuNjIsMzUuNzI3LDIwLjU4NywzNC43NzRjMjIuNzExLTEuOTc3LDI1LjAyOC0zMy4wNjcsMTcuODY4LTUwLjgzNGMtMi4yNS01LjU4My04LjA4LTkuNDMxLTEzLjU1Ni0xMS45MjljLTUuMzE0LTIuNDI1LTI4LjQzOC0yLjU5NS0zNC4xNjItMi4xNzFjLTE0LjAxNSwxLjAzOS0yMy45MDQsNS44NzktMzYuMzI5LDE0LjFjLTQuNDc4LDIuOTYyLTguMTI2LDcuMTI0LTExLjM4OCwxMS4zODljLTEuNTI5LDItMi40NjUsNC41NDQtMi43MTEsNy4wNDhjLTAuODUsOC42MzYtMi4wMywxNy40NzgtMC41NDMsMjYuMDI4YzIuMzgzLDEzLjcwNiw2LjI0NSwyOC4wNjMsMjEuMTQ2LDI4Ljc0MWM5LjkzMywwLjQ1MSwxOS45NzItMC43OTUsMjkuODI1LDAuNTQzYzIuMTI4LDAuMjg5LDkuMDg4LDcuNjM2LDkuNzg4LDkuNjY3YzUuMDE0LDE0LjU2OS00MC4yODUsMTguNDA5LTExLjM4NiwzNC4xN2MzLjYyNSwxLjk3Nyw3LjQsMy44MDEsMTEuMzg2LDQuODgxYzE0LjU2NCwzLjk1MSw1Mi41MDItMTEuNjIxLDUyLjUwMi0xMS42MjFjMjAuMjg2LTEuMDg2LDE5LjQyLDUuNzYxLDI0Ljc2NywxMy4wODVcXFwiLz5cXG5cdFx0PC9nPlxcblx0PC9nPlxcblxcblx0PGcgaWQ9XFxcIm1hcC1kb3RzXFxcIj5cXG5cdFx0PGcgaWQ9XFxcImRlaWFcXFwiPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDIxMCwgMTcwKVxcXCI+PGNpcmNsZSBpZD1cXFwiZHViXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJkZWlhXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMjQwLCAxNDYpXFxcIj48Y2lyY2xlIGlkPVxcXCJtYXRlb1xcXCIgY2xhc3M9J2RvdC1wYXRoJyBkYXRhLXBhcmVudC1pZD1cXFwiZGVpYVxcXCIgY3g9XFxcIjBcXFwiIGN5PVxcXCIwXFxcIiByPVxcXCI0XFxcIi8+PC9nPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDI2MCwgMjE0KVxcXCI+PGNpcmNsZSBpZD1cXFwibWFydGFcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImRlaWFcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0PC9nPlxcblx0XHQ8ZyBpZD1cXFwiZXMtdHJlbmNcXFwiPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDQyNiwgNDc4KVxcXCI+PGNpcmNsZSBpZD1cXFwiaXNhbXVcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImVzLXRyZW5jXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoNDAwLCA0NDYpXFxcIj48Y2lyY2xlIGlkPVxcXCJiZWx1Z2FcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImVzLXRyZW5jXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdDwvZz5cXG5cdFx0PGcgaWQ9XFxcImFyZWxsdWZcXFwiPlxcblx0XHRcdDxnIHRyYW5zZm9ybT1cXFwidHJhbnNsYXRlKDEyMSwgMzY0KVxcXCI+PGNpcmNsZSBpZD1cXFwiY2FwYXNcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMjYsIDM0MClcXFwiPjxjaXJjbGUgaWQ9XFxcInBlbG90YXNcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSgxMzcsIDMxOClcXFwiPjxjaXJjbGUgaWQ9XFxcIm1hcnRhXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTA2LCAzMjYpXFxcIj48Y2lyY2xlIGlkPVxcXCJrb2JhcmFoXFxcIiBjbGFzcz0nZG90LXBhdGgnIGRhdGEtcGFyZW50LWlkPVxcXCJhcmVsbHVmXFxcIiBjeD1cXFwiMFxcXCIgY3k9XFxcIjBcXFwiIHI9XFxcIjRcXFwiLz48L2c+XFxuXHRcdFx0PGcgdHJhbnNmb3JtPVxcXCJ0cmFuc2xhdGUoMTA2LCAzMDApXFxcIj48Y2lyY2xlIGlkPVxcXCJkdWJcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0XHQ8ZyB0cmFuc2Zvcm09XFxcInRyYW5zbGF0ZSg4MCwgMzE1KVxcXCI+PGNpcmNsZSBpZD1cXFwicGFyYWRpc2VcXFwiIGNsYXNzPSdkb3QtcGF0aCcgZGF0YS1wYXJlbnQtaWQ9XFxcImFyZWxsdWZcXFwiIGN4PVxcXCIwXFxcIiBjeT1cXFwiMFxcXCIgcj1cXFwiNFxcXCIvPjwvZz5cXG5cdFx0PC9nPlxcblx0PC9nPlxcblxcbjwvc3ZnPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczI9dGhpcy5sYW1iZGE7XG5cbiAgcmV0dXJuIFwiPGRpdj5cXG5cdDxoZWFkZXI+XFxuXHRcdDxhIGhyZWY9XFxcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDEzNi4wMTMgNDkuMzc1XFxcIiBlbmFibGUtYmFja2dyb3VuZD1cXFwibmV3IDAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgeG1sOnNwYWNlPVxcXCJwcmVzZXJ2ZVxcXCI+PHBhdGggZmlsbC1ydWxlPVxcXCJldmVub2RkXFxcIiBjbGlwLXJ1bGU9XFxcImV2ZW5vZGRcXFwiIGQ9XFxcIk04Mi4xNDEsOC4wMDJoMy4zNTRjMS4yMTMsMCwxLjcxNywwLjQ5OSwxLjcxNywxLjcyNXY3LjEzN2MwLDEuMjMxLTAuNTAxLDEuNzM2LTEuNzA1LDEuNzM2aC0zLjM2NVY4LjAwMnogTTgyLjUyMywyNC42MTd2OC40MjZsLTcuMDg3LTAuMzg0VjEuOTI1SDg3LjM5YzMuMjkyLDAsNS45NiwyLjcwNSw1Ljk2LDYuMDQ0djEwLjYwNGMwLDMuMzM4LTIuNjY4LDYuMDQ0LTUuOTYsNi4wNDRIODIuNTIzeiBNMzMuNDkxLDcuOTEzYy0xLjEzMiwwLTIuMDQ4LDEuMDY1LTIuMDQ4LDIuMzc5djExLjI1Nmg0LjQwOVYxMC4yOTJjMC0xLjMxNC0wLjkxNy0yLjM3OS0yLjA0Ny0yLjM3OUgzMy40OTF6IE0zMi45OTQsMC45NzRoMS4zMDhjNC43MDIsMCw4LjUxNCwzLjg2Niw4LjUxNCw4LjYzNHYyNS4yMjRsLTYuOTYzLDEuMjczdi03Ljg0OGgtNC40MDlsMC4wMTIsOC43ODdsLTYuOTc0LDIuMDE4VjkuNjA4QzI0LjQ4MSw0LjgzOSwyOC4yOTIsMC45NzQsMzIuOTk0LDAuOTc0IE0xMjEuOTMzLDcuOTIxaDMuNDIzYzEuMjE1LDAsMS43MTgsMC40OTcsMS43MTgsMS43MjR2OC4xOTRjMCwxLjIzMi0wLjUwMiwxLjczNi0xLjcwNSwxLjczNmgtMy40MzZWNy45MjF6IE0xMzMuNzE4LDMxLjA1NXYxNy40ODdsLTYuOTA2LTMuMzY4VjMxLjU5MWMwLTQuOTItNC41ODgtNS4wOC00LjU4OC01LjA4djE2Ljc3NGwtNi45ODMtMi45MTRWMS45MjVoMTIuMjMxYzMuMjkxLDAsNS45NTksMi43MDUsNS45NTksNi4wNDR2MTEuMDc3YzAsMi4yMDctMS4yMTcsNC4xNTMtMi45OTEsNS4xMTVDMTMxLjc2MSwyNC44OTQsMTMzLjcxOCwyNy4wNzcsMTMzLjcxOCwzMS4wNTUgTTEwLjgwOSwwLjgzM2MtNC43MDMsMC04LjUxNCwzLjg2Ni04LjUxNCw4LjYzNHYyNy45MzZjMCw0Ljc2OSw0LjAxOSw4LjYzNCw4LjcyMiw4LjYzNGwxLjMwNi0wLjA4NWM1LjY1NS0xLjA2Myw4LjMwNi00LjYzOSw4LjMwNi05LjQwN3YtOC45NGgtNi45OTZ2OC43MzZjMCwxLjQwOS0wLjA2NCwyLjY1LTEuOTk0LDIuOTkyYy0xLjIzMSwwLjIxOS0yLjQxNy0wLjgxNi0yLjQxNy0yLjEzMlYxMC4xNTFjMC0xLjMxNCwwLjkxNy0yLjM4MSwyLjA0Ny0yLjM4MWgwLjMxNWMxLjEzLDAsMi4wNDgsMS4wNjcsMi4wNDgsMi4zODF2OC40NjRoNi45OTZWOS40NjdjMC00Ljc2OC0zLjgxMi04LjYzNC04LjUxNC04LjYzNEgxMC44MDkgTTEwMy45NTMsMjMuMTYyaDYuOTc3di02Ljc0NGgtNi45NzdWOC40MjNsNy42NzYtMC4wMDJWMS45MjRIOTYuNzJ2MzMuMjc4YzAsMCw1LjIyNSwxLjE0MSw3LjUzMiwxLjY2NmMxLjUxNywwLjM0Niw3Ljc1MiwyLjI1Myw3Ljc1MiwyLjI1M3YtNy4wMTVsLTguMDUxLTEuNTA4VjIzLjE2MnogTTQ2Ljg3OSwxLjkyN2wwLjAwMywzMi4zNWw3LjEyMy0wLjg5NVYxOC45ODVsNS4xMjYsMTAuNDI2bDUuMTI2LTEwLjQ4NGwwLjAwMiwxMy42NjRsNy4wMjItMC4wNTRWMS44OTVoLTcuNTQ1TDU5LjEzLDE0LjZMNTQuNjYxLDEuOTI3SDQ2Ljg3OXpcXFwiLz48L3N2Zz5cXG5cdFx0PC9hPlxcblx0PC9oZWFkZXI+XFxuXHRcXG5cdDxkaXYgY2xhc3M9XFxcIm1haW4tY29udGFpbmVyXFxcIj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiZmVlZFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwibG9nb1xcXCI+XFxuXHRcdFx0XHQ8c3ZnIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTYyIDQ3XFxcIj4gXFxuXHRcdFx0XHRcdDx0ZXh0IHg9XFxcIjQyXFxcIiB5PVxcXCItNFxcXCI+QSBWSVNJT04gT0Y8L3RleHQ+XFxuXHRcdFx0XHRcdDxwYXRoIGZpbGw9XFxcIiMwMDAwMDBcXFwiIGQ9XFxcIk00Mi41ODIsMTguMjM5Yy0wLjMxLDAuNTItMC4zMjUsMC44NTktMC4wNDIsMC45MjJjMC40MzUsMC4xMDUsMy4zNDYtMC41NjIsNS4zODQtMC4yMDRjMC44MTgsMC4xNDksMS4zMDItMC4wMTgsMS45MDctMS4zMTFjMS4yOS0yLjg5NCwyLjYzLTkuMDQ1LDEuOTI5LTkuMDkxQzUwLjc3OSw4LjUxNCw0NC41NTQsMTUuMTU0LDQyLjU4MiwxOC4yMzkgTTM5LjAzNiwzOS45Yy0wLjI3MS0wLjA3NS0xLjIxNS0wLjE4Ny0wLjg3OC0wLjg3MmMwLjY2NS0xLjI0OSw1LjA4Ni01LjI2Niw3LjQ1Mi0xMC41OThjMC45NDctMi4wOTQsMC4yMTctMy4xMDQtMC45MTktMy4zNTRjLTIuMjk5LTAuNDg1LTYuMzI0LTAuNzAyLTkuMzQ4LDQuMTUzYy0yLjA5NywzLjM3NC0yLjM4OCw3LjY4Mi0yLjczOCw4LjM1NGMtMC4xNSwwLjI2NC0wLjM1NCwwLjI0Ny0wLjc0MiwwLjExN2MtMS40MjEtMC40NzgtMi44MzYtMC45NzktNC4yNDQtMS41MDRjLTEuNTIzLTAuNTgsMC42MzEtNC40MzMsNC4zMzQtOS43NTNDNDQuNjY5LDkuNDAxLDU1LjE4NSwxLjAzNCw1NS42ODcsMC44NWMwLjQxMi0wLjA5MSwxLjg1Myw2LjY3OS02LjQ3OCwyOS4wNDRjLTUuMDQ0LDEyLjczOC01Ljg3NiwxMS4xMjctNi43OCwxMC45MDFDNDEuMjk1LDQwLjUxMSw0MC4xNjQsNDAuMjEzLDM5LjAzNiwzOS45IE00OC40NjksNDIuMTY1Yy0xLjY2LTAuMjQtMC41NTItMS44MzMsMi44OTItMTEuNjY0YzIuNTA4LTYuNDA3LDExLjY3My0yOC42ODEsMTIuMDMtMjguNzMzYzAuOTMzLDAuMDI4LDEuODY1LDAuMDU2LDIuNzk3LDAuMDgzYzAuMTIzLDAuMDAzLDAuMzA3LDAuMTA5LDAuMDYzLDEuMDA4Yy0wLjE4MSwxLjEzOS01LjUyOCwxMS42NzUtOS45ODMsMjUuMTkyYy0yLjE2LDYuNzg1LTAuOTI2LDguNzAzLDAuNjc1LDguOTMyYzIuNjk2LDAuMzg2LDUuMjU1LTMuNzQ4LDUuOTE3LTMuNjgzYzAuNDc4LDAuMDQ1LTAuMzM5LDkuOTYxLTAuMzUzLDEwLjIyMmMtMC4xOTYsMS4wMTktMS4xMTIsMC42NjMtMS40ODMsMC42MTlDNTYuODE2LDQzLjY3LDUyLjYyNSw0My4wMTEsNDguNDY5LDQyLjE2NSBNNjUuNSw0NC41NzFjLTEuNjY5LTAuMDM1LTAuODYyLTEuNzgzLDAuNzk2LTEyLjE1M2MxLjMzNC02LjgxMiw2LjQzNy0zMC4zNTcsNi43ODktMzAuMzY3YzAuOTMzLDAuMDI3LDEuODY1LDAuMDUzLDIuNzk4LDAuMDc5YzAuMTIzLDAuMDAzLDAuMzI0LDAuMTEyLDAuMjQxLDEuMDM4YzAuMDIsMS4xNDEtMy40MTgsMTIuMTI4LTUuNDMsMjYuMjc3Yy0wLjkzNiw3LjA4MSwwLjYxMyw4Ljg3NCwyLjIzMSw4LjkyNWMyLjcyNSwwLjA4NCw0LjUzMS00LjMwMSw1LjE5Ny00LjI5NmMwLjQ4MSwwLjAwNCwxLjQwOSw5LjkxOCwxLjQ0MSwxMC4xNzFjLTAuMDE3LDEuMDI5LTAuOTgzLDAuNzg2LTEuMzU4LDAuNzg4QzczLjk2Myw0NS4wNjMsNjkuNzI0LDQ0LjkxLDY1LjUsNDQuNTcxIE05My42NjMsMjcuNjUyYy0xLjg3OS0xMC45My00Ljk3OS0xNy44MTEtNi4yMjUtMTcuODI5Yy0xLjI0NS0wLjAwNS0yLjkxNyw3LjA4My0yLjUyOCwxOC4zOGMwLjI0LDUuOTcyLDIuMTU2LDguMjAyLDUuMjEzLDcuOTU2QzkzLjE3OSwzNS45MDYsOTQuNjI0LDMzLjQ0Niw5My42NjMsMjcuNjUyIE04OS40NjQsNDUuMjgzYy02LjUwNywwLjUyNC04LjkxMi02Ljk4NS04Ljc2MS0xNS44NTJDODEuMDg3LDE2LjIxLDgzLjcyLDEuNTEsODYuNjA1LDEuNjVjMi44OTEsMC4yMTIsOC40NjIsMTQuMjU2LDExLjQ3MywyNi42NDVjMS45MTgsOC4zNTUsMS4wMjgsMTUuOTI5LTUuNDY3LDE2LjY4OEM5MS41NjIsNDUuMDkzLDkwLjUxNCw0NS4xOTMsODkuNDY0LDQ1LjI4MyBNMTA0LjY0NywxMS43OTRjLTEuMTYzLTIuODAzLTIuNzItMy43NzgtMy43NTktMy43NDFjLTEuNzUsMC4wNjQtMi4wNDgsMS42MzEsMC40MjgsOS43NjNjMC4zMDIsMC45ODUsMC44OTYsMi44NjEsMS42MTEsMi43N0MxMDMuODE1LDIwLjQ1MywxMDYuNDQsMTUuODQsMTA0LjY0NywxMS43OTQgTTk5LjY5LDIuNjY1YzMuMTkxLDAuMTA0LDYuMTcsNC40NTksNy45NjMsOC4wODFjMy40MSw2LjgwNCwwLjgxNCw5LjU2LDEuMjg2LDEwLjgyM2MwLjQwNCwxLjM0Myw3LjQ5NSw2LjE1LDEyLjcwMiwxNi4wMTFjMC4yMzMsMC40NjgsMC4xNTUsMC41OTMtMC40ODMsMC43ODljLTEuMTQ0LDAuMzUyLTIuMjg5LDAuNjg5LTMuNDM4LDEuMDEzYy0wLjU0OCwwLjE1NS0xLjQ0MiwwLjU1LTEuNzMzLTAuMTY1Yy0yLjE2My00Ljk3NS03LjkxNC0xMy42MzgtOS4yODktMTMuNDU3Yy0wLjc0OCwwLjEyNi0yLjAxNSwyLjMzOS0xLjIzLDQuOTczYzEuMDY3LDMuNTgsNC4xODUsOS43NDksNC4zMTQsMTAuMDYxYzAuMjU2LDAuNzkyLTAuNTkxLDAuNzMxLTAuODk4LDAuNzk3Yy0xLjE5MiwwLjI2MS0yLjM4NywwLjUwNy0zLjU4MywwLjczOGMtMC43NzEsMC4xNDgtMS41MTEsMS4yNDgtNS44ODctMTYuODMzYy01LjczNi0yMy44MzEtNC42ODYtMjIuOTE0LTQuMzgtMjIuOTExQzk2LjU4NiwyLjYxNCw5OC4xMzgsMi42NDEsOTkuNjksMi42NjUgTTExNC42MTcsMjEuMjAyYy00LjUyOC05LjI4My03LjUwMS0xOS4yODYtMy41NzUtMTguOTYxYzEuNDc4LDAuMDYxLDQuODk2LDEuMzg0LDguMjM1LDQuOTY1YzEuNzc1LDEuOTQ0LDEuOTUyLDMuMjAzLDAuNjQsMy40MjhjLTAuODM1LDAuMTItMi40NTUtMy4zNDMtNC45MDktMy4xMjFjLTIuNzMyLDAuMTYzLTAuMzY0LDYuMjQ2LDIuNjA1LDExLjMwNGM0LjUyNSw3Ljc0OCwxMC4wMiw5LjY0NiwxMi40NDUsOC43MjNjNC40OTUtMS42OTQsMC40MjEtNi44MzksMC42NDItNi44ODljMC4zNDMtMC4xMTEsMi45NzcsMi41MTcsMy4yODQsMi44NTJjNC41ODIsNC44OTMsMy44NDgsOS40MS0wLjQxMywxMS4xODRDMTI2LjU0OSwzNy41OTYsMTE4Ljg1NCwyOS43ODgsMTE0LjYxNywyMS4yMDIgTTEzMi44NDUsMTQuMjQzYzAuNDA1LDAuMzU0LDAuODAzLDAuNTA3LDEuMDc4LDAuNDE4YzAuNDI0LTAuMTQ3LDEuNzIyLTEuNTg2LDMuNjY5LTIuMjM4YzAuNzgyLTAuMjY5LDAuOTUtMC41MTYtMC4wOTctMS4xOTJjLTIuMzU3LTEuNDI5LTguNjUzLTQuMzQtOS4zNDktNC4yOTZDMTI3LjE3OSw2Ljk4NCwxMzAuNDYxLDExLjk4MSwxMzIuODQ1LDE0LjI0MyBNMTU1LjI4OCwyMy4xMjRjLTAuMjUsMC4xNTEtMC45NTIsMC43MS0xLjUwMiwwLjMzYy0wLjk5NS0wLjc1LTIuNjQyLTQuMzY4LTYuOTg3LTYuOTkzYy0xLjcwMy0xLjA1Mi0zLjM2OC0xLjAwMi00LjQ0NC0wLjU0OWMtMi4xNjksMC45MjktNS4xMjksMi43MjUtMS4zNTgsNi4xODRjMi42MTYsMi40MDYsNy4zMTMsMy45NjksNy44NTEsNC4zNjNjMC4yMDYsMC4xNzIsMC4wNywwLjI5My0wLjMsMC40OTFjLTEuMzYsMC43MjgtMi43MjksMS40MzQtNC4xMDQsMi4xMThjLTEuNDksMC43NS00LjcxMS0yLjAwOS04Ljc3MS02LjI2NEMxMjIuODAyLDguMTcsMTIxLjQwOSwyLjA4MSwxMjEuOTM1LDIuNDE0YzAuNDM4LDAuMjIxLDEwLjMwOSwzLjY2NSwyOC45OTIsMTIuNTU4YzEwLjU1OSw1LjQ2NSw4LjI5LDUuNzI0LDcuNDY3LDYuMjM2QzE1Ny4zNjQsMjEuODU5LDE1Ni4zMjksMjIuNDk4LDE1NS4yODgsMjMuMTI0IE0zLjA3NiwyNC4xNDNjLTAuNjgzLTAuNDItMi4yNzUtMC40NzgsMTIuNTQ2LTEwLjQ3NUMzNS4xNjYsMC41MzQsMzUuMzE0LDAuOTQzLDM1LjYxOCwwLjk2MWMwLjUzOCwwLjAxNCwxLjA3NywwLjAyOCwxLjYxNSwwLjA0MmMwLjY5NCwwLjAzMiwwLjkwNC0wLjAxNC0wLjY0LDIuMTgxYy0yLjkwNSw0LjMzLTUuMTk4LDYuOTk5LTQuODEsNy4wNTdjMC4yNzcsMC4wMjcsMy4wODQtMi4yMzUsOS4zNjMtNi42NTRjMy4yNjYtMi4zODUsMy40NTQtMi4zOTQsNC4xNS0yLjM2YzAuNDU4LDAuMDEzLDAuOTE0LDAuMDI2LDEuMzcyLDAuMDRjMC4zMDUsMC4wMTUsMS42ODYtMC43NDEtMTIuODY2LDE5LjAyNUMyMi43MzcsMzUuMjc4LDIyLjM5MywzNC4xMjksMjEuNjY4LDMzLjgyMWMtMS4yNDItMC41MzEtMi40NzgtMS4wOC0zLjcwOC0xLjY0N2MtMC4zNDUtMC4xNTktMS4xMzQtMC4zNzYtMC41NDctMS4wMzRjMC40OTYtMC40NjQsNy44NzUtNi40NDYsMTYuMTA0LTE2LjMzMmMwLjY3LTAuNzg2LDQuNjM0LTUuNDAyLDMuOTY1LTUuNTIxYy0wLjU3NC0wLjA4OC00LjYzLDMuMzI4LTUuNjY3LDQuMTA3Yy04Ljc3MSw2LjcxNC0xMS4yOTEsMTAuMTE3LTEyLjk3Nyw5LjQxOGMtMi4xMjEtMC45MSwxLjg4NC0zLjg3Nyw3LjMzMy0xMS4wNTRjMC41NzEtMC43OCwzLjYwNi00LjA4NiwyLjk5OC00LjIwMWMtMC42Ni0wLjE0LTUuMzA1LDMuNDcxLTYuMDk5LDQuMDkxYy05Ljk1Nyw3LjU2OS0xNS4wMTMsMTMuOTEyLTE1LjQ5LDE0LjM5OWMtMC42NjcsMC41NTQtMS4yMjQsMC4wNzQtMS41NTYtMC4xMjFDNS4wMzYsMjUuMzQ2LDQuMDUzLDI0Ljc1MSwzLjA3NiwyNC4xNDNcXFwiLz5cXG5cdFx0XHRcdDwvc3ZnPlxcblx0XHRcdDwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1hcFxcXCI+XFxuXHRcdFx0XHQ8aW1nIHNyYz1cXFwiaW1hZ2UvbW9iaWxlX21hcC5qcGdcXFwiPlxcblx0XHRcdFx0PHA+XCJcbiAgICArIGFsaWFzMSgoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmdlbmVyaWMgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmdlbmVyaWMgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImdlbmVyaWNcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9wPlxcblx0XHRcdDwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiaW5kZXhcXFwiPlxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tLXBhcnRcXFwiPjwvZGl2Plxcblx0PC9kaXY+XFxuXFxuXHQ8Zm9vdGVyPlxcblx0XHRcXG5cdFx0PHVsPlxcblx0XHRcdDxsaSBpZD0naG9tZSc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cIlxuICAgICsgYWxpYXMxKGFsaWFzMigoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuaG9tZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvbGk+XFxuXHRcdFx0PGxpIGlkPSdncmlkJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlwiXG4gICAgKyBhbGlhczEoYWxpYXMyKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5ncmlkIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0XHQ8bGkgaWQ9J2NvbScgY2xhc3M9J2NvbSc+XFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJ3cmFwcGVyXFxcIj5cXG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cXFwiMTAwJVxcXCIgdmlld0JveD1cXFwiMCAwIDM1IDE3XFxcIj5cXG5cdFx0XHRcdFx0XHQ8cGF0aCBmaWxsPVxcXCIjRkZGRkZGXFxcIiBkPVxcXCJNMTcuNDE1LDExLjIwM2M2LjI3NSwwLDEyLjAwOSwyLjA5MywxNi4zOTQsNS41NDdWMC4yMzJIMXYxNi41MzVDNS4zODcsMTMuMzAzLDExLjEyOSwxMS4yMDMsMTcuNDE1LDExLjIwM1xcXCIvPlxcblx0XHRcdFx0XHQ8L3N2Zz5cXG5cdFx0XHRcdDwvZGl2Plxcblx0XHRcdDwvbGk+XFxuXHRcdFx0PGxpIGlkPSdsYWInPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwid3JhcHBlclxcXCI+XCJcbiAgICArIGFsaWFzMShhbGlhczIoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxhYiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2Plxcblx0XHRcdDwvbGk+XFxuXHRcdFx0PGxpIGlkPSdzaG9wJz5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcIndyYXBwZXJcXFwiPlwiXG4gICAgKyBhbGlhczEoYWxpYXMyKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3RpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+XFxuXHRcdFx0PC9saT5cXG5cdFx0PC91bD5cXG5cXG5cdDwvZm9vdGVyPlxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBpZD1cXFwiZnJvbnQtYmxvY2tcXFwiPjwvZGl2PlxcbjxkaXYgaWQ9J3BhZ2VzLWNvbnRhaW5lcic+XFxuXHQ8ZGl2IGlkPSdwYWdlLWEnPjwvZGl2Plxcblx0PGRpdiBpZD0ncGFnZS1iJz48L2Rpdj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIm1hcC13cmFwcGVyXFxcIj5cXG5cdFxcbjwvZGl2Plx0XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsImltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuICAgIFx0XG5jbGFzcyBHbG9iYWxFdmVudHMge1xuXHRpbml0KCkge1xuXHRcdGRvbS5ldmVudC5vbih3aW5kb3csICdyZXNpemUnLCB0aGlzLnJlc2l6ZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0QXBwQWN0aW9ucy53aW5kb3dSZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBHbG9iYWxFdmVudHNcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuY2xhc3MgUHJlbG9hZGVyICB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKVxuXHRcdHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCB0aGlzLm9uTWFuaWZlc3RMb2FkQ29tcGxldGVkLCB0aGlzKVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gdW5kZWZpbmVkXG5cdFx0dGhpcy5hbGxNYW5pZmVzdHMgPSBbXVxuXHR9XG5cdGxvYWQobWFuaWZlc3QsIG9uTG9hZGVkKSB7XG5cblx0XHRpZih0aGlzLmFsbE1hbmlmZXN0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBtID0gdGhpcy5hbGxNYW5pZmVzdHNbaV1cblx0XHRcdFx0aWYobS5sZW5ndGggPT0gbWFuaWZlc3QubGVuZ3RoICYmIG1bMF0uaWQgPT0gbWFuaWZlc3RbMF0uaWQgJiYgbVttLmxlbmd0aC0xXS5pZCA9PSBtYW5pZmVzdFttYW5pZmVzdC5sZW5ndGgtMV0uaWQpIHtcblx0XHRcdFx0XHRvbkxvYWRlZCgpXHRcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzLmFsbE1hbmlmZXN0cy5wdXNoKG1hbmlmZXN0KVxuXHRcdHRoaXMuY3VycmVudExvYWRlZENhbGxiYWNrID0gb25Mb2FkZWRcbiAgICAgICAgdGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobWFuaWZlc3QpXG5cdH1cblx0b25NYW5pZmVzdExvYWRDb21wbGV0ZWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2soKVxuXHR9XG5cdGdldENvbnRlbnRCeUlkKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMucXVldWUuZ2V0UmVzdWx0KGlkKVxuXHR9XG5cdGdldEltYWdlVVJMKGlkKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q29udGVudEJ5SWQoaWQpLmdldEF0dHJpYnV0ZShcInNyY1wiKVxuXHR9XG5cdGdldEltYWdlU2l6ZShpZCkge1xuXHRcdHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50QnlJZChpZClcblx0XHRyZXR1cm4geyB3aWR0aDogY29udGVudC53aWR0aCwgaGVpZ2h0OiBjb250ZW50LmhlaWdodCB9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJlbG9hZGVyXG4iLCJpbXBvcnQgaGFzaGVyIGZyb20gJ2hhc2hlcidcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgY3Jvc3Nyb2FkcyBmcm9tICdjcm9zc3JvYWRzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5jbGFzcyBSb3V0ZXIge1xuXHRpbml0KCkge1xuXHRcdHRoaXMucm91dGluZyA9IGRhdGEucm91dGluZ1xuXHRcdHRoaXMuc2V0dXBSb3V0ZXMoKVxuXHRcdHRoaXMuZmlyc3RQYXNzID0gdHJ1ZVxuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGhhc2hlci5uZXdIYXNoID0gdW5kZWZpbmVkXG5cdFx0aGFzaGVyLm9sZEhhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIuaW5pdGlhbGl6ZWQuYWRkKHRoaXMuZGlkSGFzaGVyQ2hhbmdlLmJpbmQodGhpcykpXG5cdFx0aGFzaGVyLmNoYW5nZWQuYWRkKHRoaXMuZGlkSGFzaGVyQ2hhbmdlLmJpbmQodGhpcykpXG5cdFx0dGhpcy5zZXR1cENyb3Nzcm9hZHMoKVxuXHR9XG5cdGJlZ2luUm91dGluZygpIHtcblx0XHRoYXNoZXIuaW5pdCgpXG5cdH1cblx0c2V0dXBDcm9zc3JvYWRzKCkge1xuXHQgXHR2YXIgcm91dGVzID0gaGFzaGVyLnJvdXRlc1xuXHQgXHRmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuXHQgXHRcdHZhciByb3V0ZSA9IHJvdXRlc1tpXVxuXHQgXHRcdGNyb3Nzcm9hZHMuYWRkUm91dGUocm91dGUsIHRoaXMub25QYXJzZVVybC5iaW5kKHRoaXMpKVxuXHQgXHR9O1xuXHRcdGNyb3Nzcm9hZHMuYWRkUm91dGUoJycsIHRoaXMub25QYXJzZVVybC5iaW5kKHRoaXMpKVxuXHR9XG5cdG9uUGFyc2VVcmwoKSB7XG5cdFx0dGhpcy5hc3NpZ25Sb3V0ZSgpXG5cdH1cblx0b25EZWZhdWx0VVJMSGFuZGxlcigpIHtcblx0XHR0aGlzLnNlbmRUb0RlZmF1bHQoKVxuXHR9XG5cdGFzc2lnblJvdXRlKGlkKSB7XG5cdFx0dmFyIGhhc2ggPSBoYXNoZXIuZ2V0SGFzaCgpXG5cdFx0dmFyIHBhcnRzID0gdGhpcy5nZXRVUkxQYXJ0cyhoYXNoKVxuXHRcdHRoaXMudXBkYXRlUGFnZVJvdXRlKGhhc2gsIHBhcnRzLCBwYXJ0c1swXSwgKHBhcnRzWzFdID09IHVuZGVmaW5lZCkgPyAnJyA6IHBhcnRzWzFdKVxuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSB0cnVlXG5cdH1cblx0Z2V0VVJMUGFydHModXJsKSB7XG5cdFx0dmFyIGhhc2ggPSB1cmxcblx0XHRyZXR1cm4gaGFzaC5zcGxpdCgnLycpXG5cdH1cblx0dXBkYXRlUGFnZVJvdXRlKGhhc2gsIHBhcnRzLCBwYXJlbnQsIHRhcmdldCkge1xuXHRcdGhhc2hlci5vbGRIYXNoID0gaGFzaGVyLm5ld0hhc2hcblx0XHRoYXNoZXIubmV3SGFzaCA9IHtcblx0XHRcdGhhc2g6IGhhc2gsXG5cdFx0XHRwYXJ0czogcGFydHMsXG5cdFx0XHRwYXJlbnQ6IHBhcmVudCxcblx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0fVxuXHRcdGhhc2hlci5uZXdIYXNoLnR5cGUgPSBoYXNoZXIubmV3SGFzaC5oYXNoID09ICcnID8gQXBwQ29uc3RhbnRzLkhPTUUgOiBBcHBDb25zdGFudHMuRElQVFlRVUVcblx0XHQvLyBJZiBmaXJzdCBwYXNzIHNlbmQgdGhlIGFjdGlvbiBmcm9tIEFwcC5qcyB3aGVuIGFsbCBhc3NldHMgYXJlIHJlYWR5XG5cdFx0aWYodGhpcy5maXJzdFBhc3MpIHtcblx0XHRcdHRoaXMuZmlyc3RQYXNzID0gZmFsc2Vcblx0XHR9ZWxzZXtcblx0XHRcdEFwcEFjdGlvbnMucGFnZUhhc2hlckNoYW5nZWQoKVxuXHRcdH1cblx0fVxuXHRkaWRIYXNoZXJDaGFuZ2UobmV3SGFzaCwgb2xkSGFzaCkge1xuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGNyb3Nzcm9hZHMucGFyc2UobmV3SGFzaClcblx0XHRpZih0aGlzLm5ld0hhc2hGb3VuZGVkKSByZXR1cm5cblx0XHQvLyBJZiBVUkwgZG9uJ3QgbWF0Y2ggYSBwYXR0ZXJuLCBzZW5kIHRvIGRlZmF1bHRcblx0XHR0aGlzLm9uRGVmYXVsdFVSTEhhbmRsZXIoKVxuXHR9XG5cdHNlbmRUb0RlZmF1bHQoKSB7XG5cdFx0aGFzaGVyLnNldEhhc2goQXBwU3RvcmUuZGVmYXVsdFJvdXRlKCkpXG5cdH1cblx0c2V0dXBSb3V0ZXMoKSB7XG5cdFx0aGFzaGVyLnJvdXRlcyA9IFtdXG5cdFx0aGFzaGVyLmRpcHR5cXVlUm91dGVzID0gW11cblx0XHR2YXIgaSA9IDAsIGs7XG5cdFx0Zm9yKGsgaW4gdGhpcy5yb3V0aW5nKSB7XG5cdFx0XHRoYXNoZXIucm91dGVzW2ldID0ga1xuXHRcdFx0aWYoay5sZW5ndGggPiAyKSBoYXNoZXIuZGlwdHlxdWVSb3V0ZXMucHVzaChrKVxuXHRcdFx0aSsrXG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBnZXRCYXNlVVJMKCkge1xuXHRcdHJldHVybiBkb2N1bWVudC5VUkwuc3BsaXQoXCIjXCIpWzBdXG5cdH1cblx0c3RhdGljIGdldEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5nZXRIYXNoKClcblx0fVxuXHRzdGF0aWMgZ2V0Um91dGVzKCkge1xuXHRcdHJldHVybiBoYXNoZXIucm91dGVzXG5cdH1cblx0c3RhdGljIGdldERpcHR5cXVlUm91dGVzKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZGlwdHlxdWVSb3V0ZXNcblx0fVxuXHRzdGF0aWMgZ2V0TmV3SGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLm5ld0hhc2hcblx0fVxuXHRzdGF0aWMgZ2V0T2xkSGFzaCgpIHtcblx0XHRyZXR1cm4gaGFzaGVyLm9sZEhhc2hcblx0fVxuXHRzdGF0aWMgc2V0SGFzaChoYXNoKSB7XG5cdFx0aGFzaGVyLnNldEhhc2goaGFzaClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBSb3V0ZXJcbiIsImltcG9ydCBBcHBEaXNwYXRjaGVyIGZyb20gJ0FwcERpc3BhdGNoZXInXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCB7RXZlbnRFbWl0dGVyMn0gZnJvbSAnZXZlbnRlbWl0dGVyMidcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcbmltcG9ydCBkYXRhIGZyb20gJ0dsb2JhbERhdGEnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcblxuZnVuY3Rpb24gX2dldENvbnRlbnRTY29wZSgpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICByZXR1cm4gQXBwU3RvcmUuZ2V0Um91dGVQYXRoU2NvcGVCeUlkKGhhc2hPYmouaGFzaClcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzVG9Mb2FkKCkge1xuICAgIHZhciBzY29wZSA9IF9nZXRDb250ZW50U2NvcGUoKVxuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciB0eXBlID0gX2dldFR5cGVPZlBhZ2UoKVxuICAgIHZhciBtYW5pZmVzdDtcblxuICAgIGlmKHR5cGUgIT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgdmFyIGZpbGVuYW1lcyA9IFtcbiAgICAgICAgICAgICdjaGFyYWN0ZXIucG5nJyxcbiAgICAgICAgICAgICdjaGFyYWN0ZXItYmcuanBnJyxcbiAgICAgICAgICAgICdzaG9lLWJnLmpwZydcbiAgICAgICAgXVxuICAgICAgICBtYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoZmlsZW5hbWVzLCBoYXNoT2JqLnBhcmVudCwgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZSBvZiBleHRyYSBhc3NldHNcbiAgICBpZihzY29wZS5hc3NldHMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBhc3NldHMgPSBzY29wZS5hc3NldHNcbiAgICAgICAgdmFyIGFzc2V0c01hbmlmZXN0O1xuICAgICAgICBpZih0eXBlID09IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgICAgICBhc3NldHNNYW5pZmVzdCA9IF9hZGRCYXNlUGF0aHNUb1VybHMoYXNzZXRzLCAnaG9tZScsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSkgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgbWFuaWZlc3QgPSAobWFuaWZlc3QgPT0gdW5kZWZpbmVkKSA/IGFzc2V0c01hbmlmZXN0IDogbWFuaWZlc3QuY29uY2F0KGFzc2V0c01hbmlmZXN0KVxuICAgIH1cblxuICAgIHJldHVybiBtYW5pZmVzdFxufVxuZnVuY3Rpb24gX2FkZEJhc2VQYXRoc1RvVXJscyh1cmxzLCBwYWdlSWQsIHRhcmdldElkLCB0eXBlKSB7XG4gICAgdmFyIGJhc2VQYXRoID0gKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpID8gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSA6IF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKHBhZ2VJZCwgdGFyZ2V0SWQpXG4gICAgdmFyIG1hbmlmZXN0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNwbGl0dGVyID0gdXJsc1tpXS5zcGxpdCgnLicpXG4gICAgICAgIHZhciBmaWxlTmFtZSA9IHNwbGl0dGVyWzBdXG4gICAgICAgIHZhciBleHRlbnNpb24gPSBzcGxpdHRlclsxXVxuICAgICAgICB2YXIgaWQgPSBwYWdlSWQgKyAnLSdcbiAgICAgICAgaWYodGFyZ2V0SWQpIGlkICs9IHRhcmdldElkICsgJy0nXG4gICAgICAgIGlkICs9IGZpbGVOYW1lXG4gICAgICAgIG1hbmlmZXN0W2ldID0ge1xuICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgc3JjOiBiYXNlUGF0aCArIGZpbGVOYW1lICsgX2dldEltYWdlRXh0ZW5zaW9uQnlEZXZpY2VSYXRpbygpICsgJy4nICsgZXh0ZW5zaW9uXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChpZCwgYXNzZXRHcm91cElkKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9kaXB0eXF1ZS8nICsgaWQgKyAnLycgKyBhc3NldEdyb3VwSWQgKyAnLydcbn1cbmZ1bmN0aW9uIF9nZXRIb21lUGFnZUFzc2V0c0Jhc2VQYXRoKCkge1xuICAgIHJldHVybiBBcHBTdG9yZS5iYXNlTWVkaWFQYXRoKCkgKyAnaW1hZ2UvaG9tZS8nXG59XG5mdW5jdGlvbiBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkge1xuICAgIC8vIHJldHVybiAnQCcgKyBfZ2V0RGV2aWNlUmF0aW8oKSArICd4J1xuICAgIHJldHVybiAnJ1xufVxuZnVuY3Rpb24gX2dldERldmljZVJhdGlvKCkge1xuICAgIHZhciBzY2FsZSA9ICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA9PSB1bmRlZmluZWQpID8gMSA6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG4gICAgcmV0dXJuIChzY2FsZSA+IDEpID8gMiA6IDFcbn1cbmZ1bmN0aW9uIF9nZXRUeXBlT2ZQYWdlKGhhc2gpIHtcbiAgICB2YXIgaCA9IGhhc2ggfHwgUm91dGVyLmdldE5ld0hhc2goKVxuICAgIGlmKGgucGFydHMubGVuZ3RoID09IDIpIHJldHVybiBBcHBDb25zdGFudHMuRElQVFlRVUVcbiAgICBlbHNlIHJldHVybiBBcHBDb25zdGFudHMuSE9NRVxufVxuZnVuY3Rpb24gX2dldFBhZ2VDb250ZW50KCkge1xuICAgIHZhciBoYXNoT2JqID0gUm91dGVyLmdldE5ld0hhc2goKVxuICAgIHZhciBoYXNoID0gaGFzaE9iai5oYXNoLmxlbmd0aCA8IDEgPyAnLycgOiBoYXNoT2JqLmhhc2hcbiAgICB2YXIgY29udGVudCA9IGRhdGEucm91dGluZ1toYXNoXVxuICAgIHJldHVybiBjb250ZW50XG59XG5mdW5jdGlvbiBfZ2V0Q29udGVudEJ5TGFuZyhsYW5nKSB7XG4gICAgcmV0dXJuIGRhdGEuY29udGVudC5sYW5nW2xhbmddXG59XG5mdW5jdGlvbiBfZ2V0R2xvYmFsQ29udGVudCgpIHtcbiAgICByZXR1cm4gX2dldENvbnRlbnRCeUxhbmcoQXBwU3RvcmUubGFuZygpKVxufVxuZnVuY3Rpb24gX2dldEFwcERhdGEoKSB7XG4gICAgcmV0dXJuIGRhdGFcbn1cbmZ1bmN0aW9uIF9nZXREZWZhdWx0Um91dGUoKSB7XG4gICAgcmV0dXJuIGRhdGFbJ2RlZmF1bHQtcm91dGUnXVxufVxuZnVuY3Rpb24gX3dpbmRvd1dpZHRoSGVpZ2h0KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHc6IHdpbmRvdy5pbm5lcldpZHRoLFxuICAgICAgICBoOiB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0RGlwdHlxdWVTaG9lcygpIHtcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgYmFzZXVybCA9IF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldClcbiAgICByZXR1cm4gX2dldENvbnRlbnRTY29wZSgpLnNob2VzXG59XG5cbnZhciBBcHBTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyMi5wcm90b3R5cGUsIHtcbiAgICBlbWl0Q2hhbmdlOiBmdW5jdGlvbih0eXBlLCBpdGVtKSB7XG4gICAgICAgIHRoaXMuZW1pdCh0eXBlLCBpdGVtKVxuICAgIH0sXG4gICAgcGFnZUNvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VDb250ZW50KClcbiAgICB9LFxuICAgIGFwcERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldEFwcERhdGEoKVxuICAgIH0sXG4gICAgZGVmYXVsdFJvdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXREZWZhdWx0Um91dGUoKVxuICAgIH0sXG4gICAgZ2xvYmFsQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0R2xvYmFsQ29udGVudCgpXG4gICAgfSxcbiAgICBwYWdlQXNzZXRzVG9Mb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRQYWdlQXNzZXRzVG9Mb2FkKClcbiAgICB9LFxuICAgIGdldFJvdXRlUGF0aFNjb3BlQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgaWQgPSBpZC5sZW5ndGggPCAxID8gJy8nIDogaWRcbiAgICAgICAgcmV0dXJuIGRhdGEucm91dGluZ1tpZF1cbiAgICB9LFxuICAgIGJhc2VNZWRpYVBhdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwU3RvcmUuZ2V0RW52aXJvbm1lbnQoKS5zdGF0aWNcbiAgICB9LFxuICAgIGdldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQ6IGZ1bmN0aW9uKHBhcmVudCwgdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUFzc2V0c0Jhc2VQYXRoQnlJZChwYXJlbnQsIHRhcmdldClcbiAgICB9LFxuICAgIGdldEVudmlyb25tZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEFwcENvbnN0YW50cy5FTlZJUk9OTUVOVFNbRU5WXVxuICAgIH0sXG4gICAgZ2V0VHlwZU9mUGFnZTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICByZXR1cm4gX2dldFR5cGVPZlBhZ2UoaGFzaClcbiAgICB9LFxuICAgIGdldEhvbWVWaWRlb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YVsnaG9tZS12aWRlb3MnXVxuICAgIH0sXG4gICAgZ2VuZXJhbEluZm9zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuY29udGVudFxuICAgIH0sXG4gICAgZGlwdHlxdWVTaG9lczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0RGlwdHlxdWVTaG9lcygpXG4gICAgfSxcbiAgICBnZXROZXh0RGlwdHlxdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAoaSsxKSA+IHJvdXRlcy5sZW5ndGgtMSA/IDAgOiAoaSsxKVxuICAgICAgICAgICAgICAgIHJldHVybiByb3V0ZXNbaW5kZXhdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQcmV2aW91c0RpcHR5cXVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgICAgIHZhciByb3V0ZXMgPSBSb3V0ZXIuZ2V0RGlwdHlxdWVSb3V0ZXMoKVxuICAgICAgICB2YXIgY3VycmVudCA9IGhhc2hPYmouaGFzaFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldXG4gICAgICAgICAgICBpZihyb3V0ZSA9PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKGktMSkgPCAwID8gcm91dGVzLmxlbmd0aC0xIDogKGktMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGVzW2luZGV4XVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0RGlwdHlxdWVQYWdlSW5kZXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICAgICAgdmFyIHJvdXRlcyA9IFJvdXRlci5nZXREaXB0eXF1ZVJvdXRlcygpXG4gICAgICAgIHZhciBjdXJyZW50ID0gaGFzaE9iai5oYXNoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV1cbiAgICAgICAgICAgIGlmKHJvdXRlID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UHJldmlld1VybEJ5SGFzaDogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBoYXNoICsgJy9wcmV2aWV3LmdpZidcbiAgICB9LFxuICAgIGdldEZlZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5mZWVkXG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBDYW52YXM6IHVuZGVmaW5lZCxcbiAgICBGcm9udEJsb2NrOiB1bmRlZmluZWQsXG4gICAgT3JpZW50YXRpb246IEFwcENvbnN0YW50cy5MQU5EU0NBUEUsXG4gICAgRGV0ZWN0b3I6IHtcbiAgICAgICAgaXNNb2JpbGU6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgZGlzcGF0Y2hlckluZGV4OiBBcHBEaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpe1xuICAgICAgICB2YXIgYWN0aW9uID0gcGF5bG9hZC5hY3Rpb25cbiAgICAgICAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIEFwcENvbnN0YW50cy5XSU5ET1dfUkVTSVpFOlxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy53ID0gYWN0aW9uLml0ZW0ud2luZG93V1xuICAgICAgICAgICAgICAgIEFwcFN0b3JlLldpbmRvdy5oID0gYWN0aW9uLml0ZW0ud2luZG93SFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLk9yaWVudGF0aW9uID0gKEFwcFN0b3JlLldpbmRvdy53ID4gQXBwU3RvcmUuV2luZG93LmgpID8gQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSA6IEFwcENvbnN0YW50cy5QT1JUUkFJVFxuICAgICAgICAgICAgICAgIEFwcFN0b3JlLmVtaXRDaGFuZ2UoYWN0aW9uLmFjdGlvblR5cGUpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSwgYWN0aW9uLml0ZW0pIFxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBBcHBTdG9yZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIFB4SGVscGVyID0ge1xuXG4gICAgZ2V0UFhWaWRlbzogZnVuY3Rpb24odXJsLCB3aWR0aCwgaGVpZ2h0LCB2YXJzKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21WaWRlbyh1cmwpXG4gICAgICAgIHRleHR1cmUuYmFzZVRleHR1cmUuc291cmNlLnNldEF0dHJpYnV0ZShcImxvb3BcIiwgdHJ1ZSlcbiAgICAgICAgdmFyIHZpZGVvU3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRleHR1cmUpXG4gICAgICAgIHZpZGVvU3ByaXRlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdmlkZW9TcHJpdGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHJldHVybiB2aWRlb1Nwcml0ZVxuICAgIH0sXG5cbiAgICByZW1vdmVDaGlsZHJlbkZyb21Db250YWluZXI6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGRyZW5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjaGlsZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0RnJhbWVJbWFnZXNBcnJheTogZnVuY3Rpb24oZnJhbWVzLCBiYXNldXJsLCBleHQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBiYXNldXJsICsgaSArICcuJyArIGV4dFxuICAgICAgICAgICAgYXJyYXlbaV0gPSB1cmxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFB4SGVscGVyIiwiaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgZG9tIGZyb20gJ2RvbS1oYW5kJ1xuXG5jbGFzcyBVdGlscyB7XG5cdHN0YXRpYyBOb3JtYWxpemVNb3VzZUNvb3JkcyhlLCBvYmpXcmFwcGVyKSB7XG5cdFx0dmFyIHBvc3ggPSAwO1xuXHRcdHZhciBwb3N5ID0gMDtcblx0XHRpZiAoIWUpIHZhciBlID0gd2luZG93LmV2ZW50O1xuXHRcdGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIFx0e1xuXHRcdFx0cG9zeCA9IGUucGFnZVg7XG5cdFx0XHRwb3N5ID0gZS5wYWdlWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG5cdFx0XHRwb3N5ID0gZS5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0XHRvYmpXcmFwcGVyLnggPSBwb3N4XG5cdFx0b2JqV3JhcHBlci55ID0gcG9zeVxuXHRcdHJldHVybiBvYmpXcmFwcGVyXG5cdH1cblx0c3RhdGljIFJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgY29udGVudFcsIGNvbnRlbnRILCBvcmllbnRhdGlvbikge1xuXHRcdHZhciBhc3BlY3RSYXRpbyA9IGNvbnRlbnRXIC8gY29udGVudEhcblx0XHRpZihvcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZihvcmllbnRhdGlvbiA9PSBBcHBDb25zdGFudHMuTEFORFNDQVBFKSB7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dXIC8gY29udGVudFcpICogMVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHZhciBzY2FsZSA9ICh3aW5kb3dIIC8gY29udGVudEgpICogMVxuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIHNjYWxlID0gKCh3aW5kb3dXIC8gd2luZG93SCkgPCBhc3BlY3RSYXRpbykgPyAod2luZG93SCAvIGNvbnRlbnRIKSAqIDEgOiAod2luZG93VyAvIGNvbnRlbnRXKSAqIDFcblx0XHR9XG5cdFx0dmFyIG5ld1cgPSBjb250ZW50VyAqIHNjYWxlXG5cdFx0dmFyIG5ld0ggPSBjb250ZW50SCAqIHNjYWxlXG5cdFx0dmFyIGNzcyA9IHtcblx0XHRcdHdpZHRoOiBuZXdXLFxuXHRcdFx0aGVpZ2h0OiBuZXdILFxuXHRcdFx0bGVmdDogKHdpbmRvd1cgPj4gMSkgLSAobmV3VyA+PiAxKSxcblx0XHRcdHRvcDogKHdpbmRvd0ggPj4gMSkgLSAobmV3SCA+PiAxKSxcblx0XHRcdHNjYWxlOiBzY2FsZVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gY3NzXG5cdH1cblx0c3RhdGljIENhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcblx0ICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG5cdH1cblx0c3RhdGljIFN1cHBvcnRXZWJHTCgpIHtcblx0XHR0cnkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0XHRyZXR1cm4gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApICk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBEZXN0cm95VmlkZW8odmlkZW8pIHtcbiAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgdmlkZW8uc3JjID0gJyc7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZpZGVvLmNoaWxkTm9kZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIFx0Y2hpbGQuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIFx0Ly8gV29ya2luZyB3aXRoIGEgcG9seWZpbGwgb3IgdXNlIGpxdWVyeVxuICAgICAgICBcdGRvbS50cmVlLnJlbW92ZShjaGlsZClcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgRGVzdHJveVZpZGVvVGV4dHVyZSh0ZXh0dXJlKSB7XG4gICAgXHR2YXIgdmlkZW8gPSB0ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZVxuICAgICAgICBVdGlscy5EZXN0cm95VmlkZW8odmlkZW8pXG4gICAgfVxuICAgIHN0YXRpYyBSYW5kKG1pbiwgbWF4LCBkZWNpbWFscykge1xuICAgICAgICB2YXIgcmFuZG9tTnVtID0gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluXG4gICAgICAgIGlmKGRlY2ltYWxzID09IHVuZGVmaW5lZCkge1xuICAgICAgICBcdHJldHVybiByYW5kb21OdW1cbiAgICAgICAgfWVsc2V7XG5cdCAgICAgICAgdmFyIGQgPSBNYXRoLnBvdygxMCwgZGVjaW1hbHMpXG5cdCAgICAgICAgcmV0dXJuIH5+KChkICogcmFuZG9tTnVtKSArIDAuNSkgLyBkXG4gICAgICAgIH1cblx0fVxuXHRzdGF0aWMgR2V0SW1nVXJsSWQodXJsKSB7XG5cdFx0dmFyIHNwbGl0ID0gdXJsLnNwbGl0KCcvJylcblx0XHRyZXR1cm4gc3BsaXRbc3BsaXQubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF1cblx0fVxuXHRzdGF0aWMgU3R5bGUoZGl2LCBzdHlsZSkge1xuICAgIFx0ZGl2LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1velRyYW5zZm9ybSAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm1zVHJhbnNmb3JtICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLm9UcmFuc2Zvcm0gICAgICA9IHN0eWxlXG5cdFx0ZGl2LnN0eWxlLnRyYW5zZm9ybSAgICAgICA9IHN0eWxlXG4gICAgfVxuICAgIHN0YXRpYyBUcmFuc2xhdGUoZGl2LCB4LCB5LCB6KSB7XG4gICAgXHRpZiAoJ3dlYmtpdFRyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSB8fCAnbW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICdvVHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlIHx8ICd0cmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUpIHtcbiAgICBcdFx0VXRpbHMuU3R5bGUoZGl2LCAndHJhbnNsYXRlM2QoJyt4KydweCwnK3krJ3B4LCcreisncHgpJylcblx0XHR9ZWxzZXtcblx0XHRcdGRpdi5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuXHRcdFx0ZGl2LnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuXHRcdH1cbiAgICB9XG4gICAgc3RhdGljIFNwcmluZ1RvKGl0ZW0sIHRvUG9zaXRpb24sIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1Bvc2l0aW9uLnggLSBpdGVtLnBvc2l0aW9uLnhcbiAgICBcdHZhciBkeSA9IHRvUG9zaXRpb24ueSAtIGl0ZW0ucG9zaXRpb24ueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9Qb3NpdGlvbi54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9Qb3NpdGlvbi55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHkueCArPSAodGFyZ2V0WCAtIGl0ZW0ucG9zaXRpb24ueCkgKiBpdGVtLmNvbmZpZy5zcHJpbmdcblx0XHRpdGVtLnZlbG9jaXR5LnkgKz0gKHRhcmdldFkgLSBpdGVtLnBvc2l0aW9uLnkpICogaXRlbS5jb25maWcuc3ByaW5nXG5cdFx0aXRlbS52ZWxvY2l0eS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eS55ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG4gICAgfVxuICAgIHN0YXRpYyBTcHJpbmdUb1NjYWxlKGl0ZW0sIHRvU2NhbGUsIGluZGV4KSB7XG4gICAgXHR2YXIgZHggPSB0b1NjYWxlLnggLSBpdGVtLnNjYWxlLnhcbiAgICBcdHZhciBkeSA9IHRvU2NhbGUueSAtIGl0ZW0uc2NhbGUueVxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KVxuXHRcdHZhciB0YXJnZXRYID0gdG9TY2FsZS54IC0gTWF0aC5jb3MoYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdHZhciB0YXJnZXRZID0gdG9TY2FsZS55IC0gTWF0aC5zaW4oYW5nbGUpICogKGl0ZW0uY29uZmlnLmxlbmd0aCAqIGluZGV4KVxuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICs9ICh0YXJnZXRYIC0gaXRlbS5zY2FsZS54KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS55ICs9ICh0YXJnZXRZIC0gaXRlbS5zY2FsZS55KSAqIGl0ZW0uY29uZmlnLnNwcmluZ1xuXHRcdGl0ZW0udmVsb2NpdHlTY2FsZS54ICo9IGl0ZW0uY29uZmlnLmZyaWN0aW9uXG5cdFx0aXRlbS52ZWxvY2l0eVNjYWxlLnkgKj0gaXRlbS5jb25maWcuZnJpY3Rpb25cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzXG4iLCIvLyBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuLy8gaHR0cDovL215Lm9wZXJhLmNvbS9lbW9sbGVyL2Jsb2cvMjAxMS8xMi8yMC9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWVyLWFuaW1hdGluZ1xuIFxuLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHBvbHlmaWxsIGJ5IEVyaWsgTcO2bGxlci4gZml4ZXMgZnJvbSBQYXVsIElyaXNoIGFuZCBUaW5vIFppamRlbFxuIFxuLy8gTUlUIGxpY2Vuc2VcbiBcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIH1cbiBcbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcbiBcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpOyIsImltcG9ydCBGbHV4IGZyb20gJ2ZsdXgnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5cbi8vIEFjdGlvbnNcbnZhciBQYWdlckFjdGlvbnMgPSB7XG4gICAgb25QYWdlUmVhZHk6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX0lTX1JFQURZLFxuICAgICAgICBcdGl0ZW06IGhhc2hcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVQsXG4gICAgICAgICAgICBpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH0sXG4gICAgb25UcmFuc2l0aW9uT3V0Q29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgIFx0UGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFLFxuICAgICAgICBcdGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25JbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgICAgIHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURSxcbiAgICAgICAgICAgIGl0ZW06IHVuZGVmaW5lZFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBwYWdlVHJhbnNpdGlvbkRpZEZpbmlzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBhZ2VyRGlzcGF0Y2hlci5oYW5kbGVQYWdlckFjdGlvbih7XG4gICAgICAgIFx0dHlwZTogUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9XG59XG5cbi8vIENvbnN0YW50c1xudmFyIFBhZ2VyQ29uc3RhbnRzID0ge1xuXHRQQUdFX0lTX1JFQURZOiAnUEFHRV9JU19SRUFEWScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTjogJ1BBR0VfVFJBTlNJVElPTl9JTicsXG5cdFBBR0VfVFJBTlNJVElPTl9PVVQ6ICdQQUdFX1RSQU5TSVRJT05fT1VUJyxcbiAgICBQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURTogJ1BBR0VfVFJBTlNJVElPTl9JTl9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnXG59XG5cbi8vIERpc3BhdGNoZXJcbnZhciBQYWdlckRpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVBhZ2VyQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24pIHtcblx0XHR0aGlzLmRpc3BhdGNoKGFjdGlvbilcblx0fVxufSlcblxuLy8gU3RvcmVcbnZhciBQYWdlclN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGZpcnN0UGFnZVRyYW5zaXRpb246IHRydWUsXG4gICAgcGFnZVRyYW5zaXRpb25TdGF0ZTogdW5kZWZpbmVkLCBcbiAgICBkaXNwYXRjaGVySW5kZXg6IFBhZ2VyRGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKXtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBwYXlsb2FkLnR5cGVcbiAgICAgICAgdmFyIGl0ZW0gPSBwYXlsb2FkLml0ZW1cbiAgICAgICAgc3dpdGNoKGFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZXJDb25zdGFudHMuUEFHRV9JU19SRUFEWTpcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOX1BST0dSRVNTXG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlLCBpdGVtKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuaW1wb3J0IGRvbSBmcm9tICdkb20taGFuZCdcblxuY2xhc3MgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IGZhbHNlXG5cdFx0dGhpcy5jb21wb25lbnREaWRNb3VudCA9IHRoaXMuY29tcG9uZW50RGlkTW91bnQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmRvbUlzUmVhZHkgPSB0cnVlXG5cdFx0dGhpcy5yZXNpemUoKVxuXHR9XG5cdHJlbmRlcihjaGlsZElkLCBwYXJlbnRJZCwgdGVtcGxhdGUsIG9iamVjdCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbE1vdW50KClcblx0XHR0aGlzLmNoaWxkSWQgPSBjaGlsZElkXG5cdFx0dGhpcy5wYXJlbnRJZCA9IHBhcmVudElkXG5cdFx0XG5cdFx0aWYoZG9tLmlzRG9tKHBhcmVudElkKSkge1xuXHRcdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnRJZFxuXHRcdH1lbHNle1xuXHRcdFx0dmFyIGlkID0gdGhpcy5wYXJlbnRJZC5pbmRleE9mKCcjJykgPiAtMSA/IHRoaXMucGFyZW50SWQuc3BsaXQoJyMnKVsxXSA6IHRoaXMucGFyZW50SWRcblx0XHRcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXG5cdFx0fVxuXG5cdFx0aWYodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH1lbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHR2YXIgdCA9IHRlbXBsYXRlKG9iamVjdClcblx0XHRcdHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0XG5cdFx0fVxuXHRcdGlmKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHNsdWcoY2hpbGRJZCkpXG5cdFx0ZG9tLnRyZWUuYWRkKHRoaXMucGFyZW50LCB0aGlzLmVsZW1lbnQpXG5cblx0XHRzZXRUaW1lb3V0KHRoaXMuY29tcG9uZW50RGlkTW91bnQsIDApXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoKVxuXHRcdHRoaXMudGxPdXQgPSBuZXcgVGltZWxpbmVNYXgoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cblx0XHQvLyByZXNldFxuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMudGxJbi5ldmVudENhbGxiYWNrKFwib25Db21wbGV0ZVwiLCB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKVxuXHRcdHRoaXMudGxJbi50aW1lU2NhbGUoMS40KVxuXHRcdHNldFRpbWVvdXQoKCk9PnRoaXMudGxJbi5wbGF5KDApLCA4MDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0aWYodGhpcy50bE91dC5nZXRDaGlsZHJlbigpLmxlbmd0aCA8IDEpIHtcblx0XHRcdHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKClcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgdGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUpXG5cdFx0XHR0aGlzLnRsT3V0LnRpbWVTY2FsZSgxLjIpXG5cdFx0XHRzZXRUaW1lb3V0KCgpPT50aGlzLnRsT3V0LnBsYXkoMCksIDUwMClcblx0XHR9XG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0dGhpcy50bEluLmV2ZW50Q2FsbGJhY2soXCJvbkNvbXBsZXRlXCIsIG51bGwpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCksIDApXG5cdH1cblx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdHRoaXMudGxPdXQuZXZlbnRDYWxsYmFjayhcIm9uQ29tcGxldGVcIiwgbnVsbClcblx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvcHMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCksIDApXG5cdH1cblx0cmVzaXplKCkge1xuXHR9XG5cdGZvcmNlVW5tb3VudCgpIHtcblx0XHR0aGlzLnRsSW4ucGF1c2UoMClcblx0XHR0aGlzLnRsT3V0LnBhdXNlKDApXG5cdFx0dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5jbGVhcigpXG5cdFx0dGhpcy50bE91dC5jbGVhcigpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQge1BhZ2VyU3RvcmUsIFBhZ2VyQWN0aW9ucywgUGFnZXJDb25zdGFudHMsIFBhZ2VyRGlzcGF0Y2hlcn0gZnJvbSAnUGFnZXInXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnUGFnZXNDb250YWluZXJfaGJzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuXG5jbGFzcyBCYXNlUGFnZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAncGFnZS1iJ1xuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4gPSB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluLmJpbmQodGhpcylcblx0XHR0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dCA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0LmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUgPSB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uT3V0Q29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMucGFnZVRyYW5zaXRpb25EaWRGaW5pc2ggPSB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoLmJpbmQodGhpcylcblx0XHR0aGlzLmNvbXBvbmVudHMgPSB7XG5cdFx0XHQnbmV3LWNvbXBvbmVudCc6IHVuZGVmaW5lZCxcblx0XHRcdCdvbGQtY29tcG9uZW50JzogdW5kZWZpbmVkXG5cdFx0fVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0Jhc2VQYWdlcicsIHBhcmVudCwgdGVtcGxhdGUsIHVuZGVmaW5lZClcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU4sIHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4pXG5cdFx0UGFnZXJTdG9yZS5vbihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHRQYWdlclN0b3JlLm9uKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNILCB0aGlzLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKVxuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0d2lsbFBhZ2VUcmFuc2l0aW9uSW4oKSB7XG5cdFx0dGhpcy5zd2l0Y2hQYWdlc0RpdkluZGV4KClcblx0XHRpZih0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSAhPSB1bmRlZmluZWQpIHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uSW4oKVxuXHR9XG5cdHdpbGxQYWdlVHJhbnNpdGlvbk91dCgpIHtcblx0XHRpZih0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSAhPSB1bmRlZmluZWQpIHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uT3V0KClcblx0fVxuXHRwYWdlQXNzZXRzTG9hZGVkKCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0ZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdEFwcFN0b3JlLlBhcmVudC5zdHlsZS5jdXJzb3IgPSAnYXV0bydcblx0XHRBcHBTdG9yZS5Gcm9udEJsb2NrLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRQYWdlckFjdGlvbnMub25UcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdFx0UGFnZXJBY3Rpb25zLnBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKClcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdEFwcEFjdGlvbnMubG9hZFBhZ2VBc3NldHMoKVxuXHR9XG5cdHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoKCkge1xuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnb2xkLWNvbXBvbmVudCcpXG5cdH1cblx0c3dpdGNoUGFnZXNEaXZJbmRleCgpIHtcblx0XHR2YXIgbmV3Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR2YXIgb2xkQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J11cblx0XHRpZihuZXdDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBuZXdDb21wb25lbnQucGFyZW50LnN0eWxlWyd6LWluZGV4J10gPSAyXG5cdFx0aWYob2xkQ29tcG9uZW50ICE9IHVuZGVmaW5lZCkgb2xkQ29tcG9uZW50LnBhcmVudC5zdHlsZVsnei1pbmRleCddID0gMVxuXHR9XG5cdHNldHVwTmV3Q29tcG9uZW50KGhhc2gsIFR5cGUsIHRlbXBsYXRlKSB7XG5cdFx0dmFyIGlkID0gVXRpbHMuQ2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGhhc2gucGFyZW50LnJlcGxhY2UoXCIvXCIsIFwiXCIpKVxuXHRcdHRoaXMub2xkUGFnZURpdlJlZiA9IHRoaXMuY3VycmVudFBhZ2VEaXZSZWZcblx0XHR0aGlzLmN1cnJlbnRQYWdlRGl2UmVmID0gKHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPT09ICdwYWdlLWEnKSA/ICdwYWdlLWInIDogJ3BhZ2UtYSdcblx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmN1cnJlbnRQYWdlRGl2UmVmKVxuXG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0aWQ6IHRoaXMuY3VycmVudFBhZ2VEaXZSZWYsXG5cdFx0XHRpc1JlYWR5OiB0aGlzLm9uUGFnZVJlYWR5LFxuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdGRpZFRyYW5zaXRpb25JbkNvbXBsZXRlOiB0aGlzLmRpZFBhZ2VUcmFuc2l0aW9uSW5Db21wbGV0ZSxcblx0XHRcdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlLFxuXHRcdFx0ZGF0YTogQXBwU3RvcmUucGFnZUNvbnRlbnQoKVxuXHRcdH1cblx0XHR2YXIgcGFnZSA9IG5ldyBUeXBlKHByb3BzKVxuXHRcdHBhZ2UucmVuZGVyKGlkLCBlbCwgdGVtcGxhdGUsIHByb3BzLmRhdGEpXG5cdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10gPSB0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXVxuXHRcdHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddID0gcGFnZVxuXG5cdFx0aWYoUGFnZXJTdG9yZS5wYWdlVHJhbnNpdGlvblN0YXRlID09PSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fSU5fUFJPR1JFU1MpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddLmZvcmNlVW5tb3VudCgpXG5cdFx0fVxuXHR9XG5cdG9uUGFnZVJlYWR5KGhhc2gpIHtcblx0XHRQYWdlckFjdGlvbnMub25QYWdlUmVhZHkoaGFzaClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0dW5tb3VudENvbXBvbmVudChyZWYpIHtcblx0XHRpZih0aGlzLmNvbXBvbmVudHNbcmVmXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmNvbXBvbmVudHNbcmVmXS5yZW1vdmUoKVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlUGFnZXJcblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRcImNvbnRlbnRcIjoge1xuXHRcdFwidHdpdHRlcl91cmxcIjogXCJodHRwczovL3R3aXR0ZXIuY29tL2NhbXBlclwiLFxuXHRcdFwiZmFjZWJvb2tfdXJsXCI6IFwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL0NhbXBlclwiLFxuXHRcdFwiaW5zdGFncmFtX3VybFwiOiBcImh0dHBzOi8vaW5zdGFncmFtLmNvbS9jYW1wZXIvXCIsXG5cdFx0XCJsYWJfdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2xhYlwiLFxuXHRcdFwibGFuZ1wiOiB7XG5cdFx0XHRcImVuXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiU2hvcFwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiTWVuXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIldvbWVuXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJmclwiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJJTkRFWFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkFjaGV0ZXJcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcImhvbW1lXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcImZlbW1lXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJlc1wiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJJTkRFWFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkNvbXByYXJcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcImhvbWJyZVwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJtdWplclwiLFxuXHRcdFx0XHRcIm1hcF90eHRcIjogXCJNQVBcIlxuXHRcdFx0fSxcblx0XHRcdFwiaXRcIjoge1xuXHRcdFx0XHRcImhvbWVcIjogXCJNQVBcIixcblx0XHRcdFx0XCJncmlkXCI6IFwiSU5ERVhcIixcblx0XHRcdFx0XCJsYWJcIjogXCJMQUJcIixcblx0XHRcdFx0XCJjYW1wZXJfbGFiXCI6IFwiQ2FtcGVyIExhYlwiLFxuXHRcdFx0XHRcInNob3BfdGl0bGVcIjogXCJBY3F1aXNpdGlcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcInVvbW9cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiZG9ubmFcIixcblx0XHRcdFx0XCJtYXBfdHh0XCI6IFwiTUFQXCJcblx0XHRcdH0sXG5cdFx0XHRcImRlXCI6IHtcblx0XHRcdFx0XCJob21lXCI6IFwiTUFQXCIsXG5cdFx0XHRcdFwiZ3JpZFwiOiBcIklOREVYXCIsXG5cdFx0XHRcdFwibGFiXCI6IFwiTEFCXCIsXG5cdFx0XHRcdFwiY2FtcGVyX2xhYlwiOiBcIkNhbXBlciBMYWJcIixcblx0XHRcdFx0XCJzaG9wX3RpdGxlXCI6IFwiU2hvcFwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiSGVycmVuXCIsXG5cdFx0XHRcdFwic2hvcF93b21lblwiOiBcIkRhbWVuXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJwdFwiOiB7XG5cdFx0XHRcdFwiaG9tZVwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcImdyaWRcIjogXCJJTkRFWFwiLFxuXHRcdFx0XHRcImxhYlwiOiBcIkxBQlwiLFxuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIkNvbXByZVwiLFxuXHRcdFx0XHRcInNob3BfbWVuXCI6IFwiSG9tZW5cIixcblx0XHRcdFx0XCJzaG9wX3dvbWVuXCI6IFwiTXVsaGVyXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdFwibGFuZ3NcIjogW1wiZW5cIiwgXCJmclwiLCBcImVzXCIsIFwiaXRcIiwgXCJkZVwiLCBcInB0XCJdLFxuXG5cdFwiaG9tZS12aWRlb3NcIjogW1xuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84MGNkYzRjNTAzNjQ5NWU0MjgwM2IwZmZhYjMwMDQzNDMxNWVlMzgzL2RlaWEtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy83YTE1ZjdjMDRlYjU0ZGFiYjg1MTM4NjBjZTJkMWIzNDZkNTg3OTEwL2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzgzNTAzYWY1ZjAxN2RjMzY2MDFhYjE0Mjc3N2ZkZTQxYzJmZDk5YTIvZGVpYS1tYXJ0YS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTQxYTU5ZDBhYTMxMzk3MDMwNDdmZDFkNzNlNzEwNWZiNDc3NjQ0My9lcy10cmVuYy1pc2FtdS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZDMxNmExM2E3ODNkZmQ5OWVhZWY5ZmVlMTIxZjVhNTc5ZmM2MmFiNC9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzUxZmQ5ZmQyMGNlN2JjZTAzMzYwNDVlZDNmNzlkNjhjYzQ1OGQ1NTUvYXJlbGx1Zi1jYXBhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYzZiZTY5YzY0NmMxMzFmMGJlNjcwNjJjZDYwMGNiMTlhYTVkMmFiMS9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzM4NmY1YjEwOTkyZTc4MDVlMWJjZjdiZDM4OWE3ZWY1NWVhZGI5MDQvYXJlbGx1Zi1tYXJ0YS5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMzhlMzI2NjEwODk1YzUxMTM2MzAxMTA1OGRjMzA4MDU5NGE4MTQzYi9hcmVsbHVmLWtvYmFyYWgubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzAwOWNhZjY5M2NlOGQwMmY2YjY3YjdlMDNiOGZhN2E1MzI3ZjZmMzQvYXJlbGx1Zi1kdWIubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2E1YjM3NGZhMjc2NDRkOWMxY2RjMGFlZDI0NWQ0YWM5ZTA0ODBkODAvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIlxuXHRdLFxuXG5cdFwiZmVlZFwiOiBbXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWF0ZW9cIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXRlb1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJFc3RyZW5vIENhbXBlcnMgcGFyYSBudWVzdHJvIHdlZWtlbmQgZW4gRGVpYSBATWFydGFcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXRlb1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiUHJvZmlsZSBwaWM/IG1heWJlPyBtYXliZSBiYWJ5P1wiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXRlb1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiUG9ycXVlIGVzYSBjYXJhIGRlIGVtbz8/IEBNYXRlbyBsb2xsbFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJUaGlzIHNob2VzIGFyZSB0aGUgc2hvZXMgTWlybyB3b3VsZCB3ZWFyIGlmIGhlIHdhcyBzdGlsbCBhbGl2ZSBhbmQga2lja2luwrRcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hdGVvXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlBvcnF1ZSBubyB2aWVuZXMgYSBEZWlhIGNvbiBATWFydGEgeSBjb25taWdvIGVsIHByb3hpbW8gd2Vla2VuZD8/XCJcblx0XHRcdFx0fSx7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJObyBwdWVkb29vb2/igKYgdGVuZ28gY2xhc2VzIGRlIHBpbnR1cmEgeSBtaSBtYWRyZSB2aWVuZSBhIHZpc2l0YXIgI2hlYXZ5bWV0YWxcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWF0ZW9cIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIiNhcnRzZWxmaWVcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkRlZXAgYmx1ZSAjY2FtcGVyXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImRlaWFcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlRoYW5rcyBmb3IgdGhlIGZsb3dlcnMgQE1hdGVvIHNvb28gY3V1dXRlLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJkZWlhXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZGVpYVwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwibWFydGFcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTGFzIGZsb3JlcyBxdWUgQG1hdGVvIG1lIHJlZ2Fsby5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJiZWx1Z2FcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRXMgVHJlbmMgaXMgdGhlIHBsYWNlIHRvIGJlLiBcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiZXMtdHJlbmNcIixcblx0XHRcdFwicGVyc29uXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImJlbHVnYVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiYmVsdWdhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkFsbCB0aGlzIHNtb2tlIGlzIG5vdCB3aGF0IHlvdSB0aGluayBpdCBpcy4gXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImlzYW11XCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiaXNhbXVcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRXh0cmFvcmRpbmFyeSBiZWF1dHkuIEkgbG92ZSB0aGUgbmV3ICNjYW1wZXIgXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImlzYW11XCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJpc2FtdVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJTbyBjYWxtIGF0IEVzIFRyZW5jLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJlcy10cmVuY1wiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJpc2FtdVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJpc2FtdVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImVzLXRyZW5jXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImlzYW11XCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJpc2FtdVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJIaWlpaWkhISEgOilcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImNhcGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTmV3IGNhbXBlci4gTmV3IGNvbG9ycy4gU2FtZSBlbmVyZ3kuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImNhcGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkxhc3QgbmlnaHQgd2FzIGluLXNhbmUuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiY2FwYXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiY2FwYXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImNhcGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJjYXBhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJTbyBtdWNoIGZ1bi5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBlbG90YXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcImltYWdlXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJzaG9lXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk9uY2UgeW91IGdvIGJsYWNrLi4uXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcImNoYXJhY3RlclwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGVsb3Rhc1wiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJSaWRlcnMgb2YgTWFsbG9yY2EgI2NhbXBlci5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJwZWxvdGFzXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiZnVuLWZhY3RcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBlbG90YXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBlbG90YXNcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcInBlbG90YXNcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTm8gc2VsZmllIG5vIG5vdGhpbmcuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0sXG5cblx0XHR7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIlRoZXNlIG5ldyBDYW1wZXIncyBhcmUgdGhlIGJvbWIuIFwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJJJ20gbm90IGdvaW5nIGluIHRoZSBwb29sIGxpa2UgdGhpcy5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJtYXJ0YVwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJtYXJ0YVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNZSBiZWluZyBtZeKApiBIZWhlIDopIDxzcGFuPiNjYW1wZXI8L3NwYW4+XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwibWFydGFcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcIm1hcnRhXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkFmdGVyIHBhcnR5LiBBZnRlciBsaWZlLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0e1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImtvYmFyYWhcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiSSBkYXJlIHlvdS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIldpc2ggeW91IHdoZXJlIGhlcmUgI2FyZWxsdWYuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwia29iYXJhaFwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwidmlkZW9cIixcblx0XHRcdFx0XCJpZFwiOiBcImZ1bi1mYWN0XCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJrb2JhcmFoXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIkNhbGwgbWUgUGFuZGVtb25pYS5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcImR1YlwiLFxuXHRcdFx0XCJ0aW1lXCI6IFwiMiBtaW4gYWdvXCIsXG5cdFx0XHRcIm1lZGlhXCI6IHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiaW1hZ2VcIixcblx0XHRcdFx0XCJpZFwiOiBcInNob2VcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJNeSBuZXcgQ2FtcGVyJ3MgYXJlIHRoZSBTVVYgb2Ygc2hvZXMuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwiZHViXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJkdWJcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiRnJlZSBkaXZpbmcgZXhjdXJ0aW9ucyB0aGlzIGFmdGVybm9vbiBhdCAjYXJlbGx1Zi4gUE0gbWUgaWYgaW50ZXJlc3RlZC5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwiZHViXCIsXG5cdFx0XHRcdFx0XCJwZXJzb24tdGV4dFwiOiBcIk1lIGJlaW5nIG1l4oCmIEhlaGUgOikgPHNwYW4+I2NhbXBlcjwvc3Bhbj5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSx7XG5cdFx0XHRcImlkXCI6IFwiYXJlbGx1ZlwiLFxuXHRcdFx0XCJwZXJzb25cIjogXCJkdWJcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJjaGFyYWN0ZXJcIlxuXHRcdFx0fSxcblx0XHRcdFwiY29tbWVudHNcIjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJwZXJzb24tbmFtZVwiOiBcImR1YlwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJQZWFjZSB5J2FsbC5cIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwic2hvZVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiQm9sZCBhbmQgYmVhdXRpZnVsLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJpbWFnZVwiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJEZXRveCBieSB0aGUgcG9vbC4gTXVjaCBuZWVkZWQuXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0XCJpZFwiOiBcImFyZWxsdWZcIixcblx0XHRcdFwicGVyc29uXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFwidGltZVwiOiBcIjIgbWluIGFnb1wiLFxuXHRcdFx0XCJtZWRpYVwiOiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcInZpZGVvXCIsXG5cdFx0XHRcdFwiaWRcIjogXCJmdW4tZmFjdFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJjb21tZW50c1wiOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInBlcnNvbi1uYW1lXCI6IFwicGFyYWRpc2VcIixcblx0XHRcdFx0XHRcInBlcnNvbi10ZXh0XCI6IFwiTWUgYmVpbmcgbWXigKYgSGVoZSA6KSA8c3Bhbj4jY2FtcGVyPC9zcGFuPlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LHtcblx0XHRcdFwiaWRcIjogXCJhcmVsbHVmXCIsXG5cdFx0XHRcInBlcnNvblwiOiBcInBhcmFkaXNlXCIsXG5cdFx0XHRcInRpbWVcIjogXCIyIG1pbiBhZ29cIixcblx0XHRcdFwibWVkaWFcIjoge1xuXHRcdFx0XHRcInR5cGVcIjogXCJ2aWRlb1wiLFxuXHRcdFx0XHRcImlkXCI6IFwiY2hhcmFjdGVyXCJcblx0XHRcdH0sXG5cdFx0XHRcImNvbW1lbnRzXCI6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwicGVyc29uLW5hbWVcIjogXCJwYXJhZGlzZVwiLFxuXHRcdFx0XHRcdFwicGVyc29uLXRleHRcIjogXCJJIGFtIG5vdCBhIGJpbWJvLlwiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9XG5cdF0sXG5cblx0XCJkZWZhdWx0LXJvdXRlXCI6IFwiXCIsXG5cblx0XCJyb3V0aW5nXCI6IHtcblx0XHRcIi9cIjoge1xuXHRcdFx0XCJ0ZXh0c1wiOiB7XG5cdFx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIlRoZSBTcHJpbmcvU3VtbWVyIDIwMTYgY29sbGVjdGlvbiBpcyBpbnNwaXJlZCBieSBNYWxsb3JjYSwgdGhlIE1lZGl0ZXJyYW5lYW4gaXNsYW5kIHRoYXQgQ2FtcGVyIGNhbGxzIGhvbWUuIE91ciB2aXNpb24gb2YgdGhpcyBzdW5ueSBwYXJhZGlzZSBoaWdobGlnaHRzIHRocmVlIGhvdCBzcG90czogRGVpYSwgRXMgVHJlbmMsIGFuZCBBcmVsbHVmLiBGb3IgdXMsIE1hbGxvcmNhIGlzbuKAmXQganVzdCBhIGRlc3RpbmF0aW9uLCBpdOKAmXMgYSBzdGF0ZSBvZiBtaW5kLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIlRoZSB2aWxsYWdlIG9mIERlaWEgaGFzIGxvbmcgYXR0cmFjdGVkIGJvdGggcmV0aXJlZXMgYW5kIHJvY2sgc3RhcnMgd2l0aCBpdHMgcGljdHVyZXNxdWUgc2NlbmVyeSBhbmQgY2hpbGwgdmliZS4gVGhlIHNlZW1pbmdseSBzbGVlcHkgY291bnRyeXNpZGUgaGFzIGEgYm9oZW1pYW4gc3Bpcml0IHVuaXF1ZSB0byB0aGlzIG1vdW50YWluIGVuY2xhdmUuICNEZWlhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImFyZWxsdWZcIjogXCJUaGUgZmlzdC1wdW1waW5nIHJhZ2VycyBvZiBBcmVuYWwgYW5kIHVuYnJpZGxlZCBkZWJhdWNoZXJ5IG9mIE1hZ2FsdWYgbWVldCBpbiBBcmVsbHVmLCBhbiBpbWFnaW5lZCBidXQgZXBpYyBwYXJ0IG9mIG91ciB2aXNpb24gb2YgdGhpcyBiZWxvdmVkIGlzbGFuZC4gSXTigJlzIGFsbCBuZW9uIGFuZCBub24tc3RvcCBwYXJ0eWluZyBpbiB0aGUgc3VtbWVyIHN1biDigJMgcXVpdGUgbGl0ZXJhbGx5IGEgaG90IG1lc3MuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiVGhpcyBjb2FzdGFsIHdpbGRlcm5lc3MgYm9hc3RzIGJyZWF0aHRha2luZyBiZWFjaGVzIGFuZCBhIHNlcmVuZSBhdG1vc3BoZXJlLiBUaGUgc2Vhc2lkZSBoYXMgYW4gdW50YW1lZCB5ZXQgcGVhY2VmdWwgZmVlbGluZyB0aGF0IGlzIGJvdGggaW5zcGlyaW5nIGFuZCBzb290aGluZy4gI0VzVHJlbmNCeUNhbXBlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwiZnJcIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIkxhIGNvbGxlY3Rpb24gUHJpbnRlbXBzL8OJdMOpIDIwMTYgc+KAmWluc3BpcmUgZGUgTWFqb3JxdWUsIGzigJnDrmxlIG3DqWRpdGVycmFuw6llbm5lIGQnb8O5IENhbXBlciBlc3Qgb3JpZ2luYWlyZS4gTm90cmUgdmlzaW9uIGRlIGNlIHBhcmFkaXMgZW5zb2xlaWxsw6kgc2UgcmVmbMOodGUgZGFucyB0cm9pcyBsaWV1eCBpbmNvbnRvdXJuYWJsZXMgOiBEZWlhLCBFcyBUcmVuYyBldCBBcmVsbHVmLiBQb3VyIG5vdXMsIE1ham9ycXVlIGVzdCBwbHVzIHF14oCZdW5lIHNpbXBsZSBkZXN0aW5hdGlvbiA6IGPigJllc3QgdW4gw6l0YXQgZOKAmWVzcHJpdC4gI01hbGxvcmNhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImRlaWFcIjogXCJMZSB2aWxsYWdlIGRlIERlaWEgYXR0aXJlIGRlcHVpcyBsb25ndGVtcHMgbGVzIHJldHJhaXTDqXMgY29tbWUgbGVzIHJvY2sgc3RhcnMgZ3LDomNlIMOgIHNlcyBwYXlzYWdlcyBwaXR0b3Jlc3F1ZXMgZXQgc29uIGFtYmlhbmNlIGTDqWNvbnRyYWN0w6llLiBTYSBjYW1wYWduZSBk4oCZYXBwYXJlbmNlIHRyYW5xdWlsbGUgYWZmaWNoZSB1biBlc3ByaXQgYm9ow6htZSBjYXJhY3TDqXJpc3RpcXVlIGRlIGNldHRlIGVuY2xhdmUgbW9udGFnbmV1c2UuICNEZWlhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImFyZWxsdWZcIjogXCJM4oCZZXhhbHRhdGlvbiBk4oCZQXJlbmFsIGV0IGxlcyBzb2lyw6llcyBkw6licmlkw6llcyBkZSBNYWdhbHVmIHNlIHJlam9pZ25lbnQgw6AgQXJlbGx1ZiwgdW4gbGlldSBpbWFnaW5haXJlIG1haXMgY2VudHJhbCBkYW5zIG5vdHJlIHZpc2lvbiBkZSBjZXR0ZSDDrmxlIGFkb3LDqWUuIFRvdXQgeSBlc3QgcXVlc3Rpb24gZGUgZmx1byBldCBkZSBmw6p0ZXMgc2FucyBmaW4gYXUgc29sZWlsIGRlIGzigJnDqXTDqSA6IHVuIGpveWV1eCBiYXphciwgZW4gc29tbWUuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiQ2V0dGUgbmF0dXJlIHNhdXZhZ2UgY8O0dGnDqHJlIGpvdWl0IGTigJl1bmUgc3VwZXJiZSBwbGFnZSBldCBk4oCZdW5lIGF0bW9zcGjDqHJlIGNhbG1lLiBMZSBib3JkIGRlIG1lciBhIHVuIGPDtHTDqSDDoCBsYSBmb2lzIHRyYW5xdWlsbGUgZXQgaW5kb21wdMOpIHF1aSBpbnNwaXJlIGF1dGFudCBxdeKAmWlsIGFwYWlzZS4gI0VzVHJlbmNCeUNhbXBlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwiZXNcIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIkxhIGNvbGVjY2nDs24gcHJpbWF2ZXJhL3ZlcmFubyAyMDE2IGVzdMOhIGluc3BpcmFkYSBlbiBNYWxsb3JjYSwgbGEgaXNsYSBtZWRpdGVycsOhbmVhIHF1ZSBDYW1wZXIgY29uc2lkZXJhIHN1IGhvZ2FyLiBOdWVzdHJhIHZpc2nDs24gZGUgZXN0ZSBwYXJhw61zbyBzb2xlYWRvIGRlc3RhY2EgdHJlcyBsdWdhcmVzIGltcG9ydGFudGVzOiBEZWlhLCBFcyBUcmVuYyB5IEFyZWxsdWYuIFBhcmEgbm9zb3Ryb3MsIE1hbGxvcmNhIG5vIGVzIHRhbiBzb2xvIHVuIGRlc3Rpbm8sIGVzIHVuIGVzdGFkbyBkZSDDoW5pbW8uICNNYWxsb3JjYUJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJkZWlhXCI6IFwiTG9zIGhvcml6b250ZXMgcGludG9yZXNjb3MgeSBsYSB0cmFucXVpbGlkYWQgZGVsIHB1ZWJsbyBkZSBEZWlhIGxsZXZhbiBtdWNobyB0aWVtcG8gY2F1dGl2YW5kbyB0YW50byBhIGFydGlzdGFzIHJldGlyYWRvcyBjb21vIGEgZXN0cmVsbGFzIGRlbCByb2NrLiBFbCBwYWlzYWplIHJ1cmFsIGRlIGFwYXJlbnRlIGNhbG1hIHBvc2VlIHVuIGVzcMOtcml0dSBib2hlbWlvIHByb3BpbyBkZSBlc3RlIGVuY2xhdmUgbW9udGHDsW9zby4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkxhIGxvY3VyYSBmaWVzdGVyYSBkZSBT4oCZQXJlbmFsIHkgZWwgZGVzZW5mcmVubyBkZSBNYWdhbHVmIHNlIHJlw7puZW4gZW4gQXJlbGx1ZiwgdW5hIGNyZWFjacOzbiBkZW50cm8gZGUgbnVlc3RyYSB2aXNpw7NuIGRlIGVzdGEgcXVlcmlkYSBpc2xhLiBUb2RvIGdpcmEgZW4gdG9ybm8gYWwgbmXDs24geSBsYSBmaWVzdGEgc2luIGZpbiBiYWpvIGVsIHNvbC4gRW4gZGVmaW5pdGl2YSwgdW5hIGNvbWJpbmFjacOzbiBleHBsb3NpdmEuICNBcmVsbHVmQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImVzLXRyZW5jXCI6IFwiRXN0ZSBlc3BhY2lvIG5hdHVyYWwgdmlyZ2VuIGN1ZW50YSBjb24gdW5hIHBsYXlhIGltcHJlc2lvbmFudGUgeSB1biBhbWJpZW50ZSBzZXJlbm8uIExhIGNvc3RhLCBzYWx2YWplIHkgcGFjw61maWNhIGFsIG1pc21vIHRpZW1wbywgdHJhbnNtaXRlIHVuYSBzZW5zYWNpw7NuIGV2b2NhZG9yYSB5IHJlbGFqYW50ZS4gI0VzVHJlbmNCeUNhbXBlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwiaXRcIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIkxhIGNvbGxlemlvbmUgUHJpbWF2ZXJhL0VzdGF0ZSAyMDE2IMOoIGlzcGlyYXRhIGEgTWFpb3JjYSwgbOKAmWlzb2xhIGRlbCBNZWRpdGVycmFuZW8gY2hlIGhhIGRhdG8gaSBuYXRhbGkgYSBDYW1wZXIuIExhIG5vc3RyYSB2aXNpb25lIGRpIHF1ZXN0byBwYXJhZGlzbyBhc3NvbGF0byBzaSBzb2ZmZXJtYSBzdSB0cmUgbHVvZ2hpIHNpbWJvbG86IERlaWEsIEVzIFRyZW5jIGUgQXJlbGx1Zi4gUGVyIG5vaSwgTWFpb3JjYSBub24gw6ggdW5hIHNlbXBsaWNlIG1ldGEsIMOoIHVubyBzdGF0byBkJ2FuaW1vLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkRhIHRlbXBvLCBpbCB2aWxsYWdnaW8gZGkgRGVpYSBhdHRpcmEgcGVuc2lvbmF0aSBlIHJvY2sgc3RhciBjb24gaWwgc3VvIHBhZXNhZ2dpbyBwaXR0b3Jlc2NvIGUgbCdhdG1vc2ZlcmEgcmlsYXNzYXRhLiBMYSBjYW1wYWduYSBhcHBhcmVudGVtZW50ZSBzb25ub2xlbnRhIGhhIHVubyBzcGlyaXRvIGJvaMOpbWllbiB0aXBpY28gZGkgcXVlc3RvIHBhZXNpbm8gZGkgbW9udGFnbmEuICNEZWlhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImFyZWxsdWZcIjogXCJHbGkgc2NhdGVuYXRpIGZlc3RhaW9saSBkaSBBcmVuYWwgZSBsYSBzZnJlbmF0YSBkaXNzb2x1dGV6emEgZGkgTWFnYWx1ZiBzaSBmb25kb25vIGluIEFyZWxsdWYsIHVuYSBwYXJ0ZSBpbW1hZ2luYXJpYSBtYSBlcGljYSBkZWxsYSBub3N0cmEgdmlzaW9uZSBkaSBxdWVzdGEgYWRvcmF0YSBpc29sYS4gw4ggdW4gdHVyYmluaW8gZGkgbHVjaSBhbCBuZW9uIGUgZmVzdGUgaW5pbnRlcnJvdHRlIHNvdHRvIGlsIHNvbGUgZXN0aXZvLCB1biBjYW9zIHBhenplc2NvLiAjQXJlbGx1ZkJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJlcy10cmVuY1wiOiBcIlF1ZXN0J2FyZWEgcHJvdGV0dGEgdmFudGEgdW5hIHNwaWFnZ2lhIG1venphZmlhdG8gZSB1bidhdG1vc2ZlcmEgc2VyZW5hLiBJbCBsaXRvcmFsZSBoYSB1biBjaGUgZGkgc2VsdmFnZ2lvLCBtYSBwYWNpZmljbywgY2hlIMOoIHN1Z2dlc3Rpdm8gZSByaWxhc3NhbnRlIGFsIHRlbXBvIHN0ZXNzby4gI0VzVHJlbmNCeUNhbXBlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwiZGVcIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIkRpZSBLb2xsZWt0aW9uIEZyw7xoamFoci9Tb21tZXIgMjAxNiBoYXQgc2ljaCB2b24gTWFsbG9yY2EgaW5zcGlyaWVyZW4gbGFzc2VuLCBkZXIgTWl0dGVsbWVlcmluc2VsLCBhdWYgZGVyIENhbXBlciB6dSBIYXVzZSBpc3QuIFVuc2VyZSBWaXNpb24gZGVzIFNvbm5lbnBhcmFkaWVzZXMgYmVmYXNzdCBzaWNoIG1pdCBkcmVpIEhvdHNwb3RzOiBEZWlhLCBFcyBUcmVuYyB1bmQgQXJlbGx1Zi4gRsO8ciB1bnMgaXN0IE1hbGxvcmNhIG1laHIgYWxzIG51ciBlaW4gUmVpc2V6aWVsLCBlcyBpc3QgZWluZSBMZWJlbnNlaW5zdGVsbHVuZy4gI01hbGxvcmNhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImRlaWFcIjogXCJEZXIgT3J0IERlaWEgbWl0IHNlaW5lciBtYWxlcmlzY2hlbiBMYW5kc2NoYWZ0IHVuZCBMw6Rzc2lna2VpdCB6aWVodCBzZWl0IHZpZWxlbiBKYWhyZW4gbmljaHQgbnVyIFBlbnNpb27DpHJlLCBzb25kZXJuIGF1Y2ggUm9ja3N0YXJzIGFuLiBEaWUgdmVyc2NobGFmZW4gYW5tdXRlbmRlIEdlZ2VuZCB2ZXJzcHLDvGh0IGVpbmVuIGdhbnogYmVzb25kZXJlbiBCb2hlbWlhbi1DaGFybWUsIGRlciBlaW56aWdhcnRpZyBpc3QgZsO8ciBkaWVzZSBHZWJpcmdzZW5rbGF2ZS4gI0RlaWFCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiYXJlbGx1ZlwiOiBcIkRpZSBnZXN0w6RobHRlbiBLw7ZycGVyIHZvbiBBcmVuYWwgdW5kIGRpZSB1bmdlesO8Z2VsdGUgT2ZmZW5oZWl0IHZvbiBNYWdhbHVmIHRyZWZmZW4gaW4gQXJlbGx1ZiBhdWZlaW5hbmRlciDigJMgZWluIGZhbnRhc2lldm9sbGVzIHVuZCBkb2NoIHVtZmFzc2VuZGVzIEVsZW1lbnQgdW5zZXJlciBWaXNpb24gZGVyIGJlbGllYnRlbiBJbnNlbC4gRWluIFNvbW1lciBhdXMgZW5kbG9zZW4gUGFydHlzIGluIE5lb25mYXJiZW4g4oCTIGVpbiBlY2h0IGhlacOfZXIgT3J0LiAjQXJlbGx1ZkJ5Q2FtcGVyXCIsXG5cdFx0XHRcdFx0XCJlcy10cmVuY1wiOiBcIkRpZXNlciB1bmJlcsO8aHJ0ZSBLw7xzdGVuc3RyZWlmZW4gdmVyZsO8Z3Qgw7xiZXIgZWluZW4gYXRlbWJlcmF1YmVuZGVuIFN0cmFuZCB1bmQgZWluZSBiZXJ1aGlnZW5kZSBBdG1vc3Bow6RyZS4gRGFzIE1lZXIgaXN0IHVuZ2V6w6RobXQgdW5kIGZyaWVkdm9sbCB6dWdsZWljaCB1bmQgZGllbnQgYWxzIFF1ZWxsZSBkZXIgSW5zcGlyYXRpb24gZWJlbnNvIHdpZSBhbHMgUnVoZXBvbC4gI0VzVHJlbmNCeUNhbXBlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwicHRcIjoge1xuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiOiBcIkEgY29sZcOnw6NvIHByaW1hdmVyYS92ZXLDo28gMjAxNiB0ZW0gTWFpb3JjYSBjb21vIGluc3BpcmHDp8OjbywgYSBpbGhhIG1lZGl0ZXJyw6JuZWEgcXVlIGEgQ2FtcGVyIGNoYW1hIGRlIGNhc2EuIEEgbm9zc2Egdmlzw6NvIGRlc3RlIHBhcmHDrXNvIHNvbGFyZW5nbyByZWFsw6dhIHRyw6pzIGxvY2FpcyBpbXBvcnRhbnRlczogRGVpYSwgRXMgVHJlbmMgZSBBcmVsbHVmLiBQYXJhIG7Ds3MsIE1haW9yY2EgbsOjbyDDqSBzw7MgdW0gZGVzdGlubyBkZSBmw6lyaWFzLCBtYXMgdGFtYsOpbSB1bSBlc3RhZG8gZGUgZXNww61yaXRvLiAjTWFsbG9yY2FCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZGVpYVwiOiBcIkEgYWxkZWlhIGRlIERlaWEgc2VtcHJlIGF0cmFpdSByZWZvcm1hZG9zIGUgZXN0cmVsYXMgZGUgcm9jayBkZXZpZG8gw6Agc3VhIHBhaXNhZ2VtIHBpdG9yZXNjYSBlIGFtYmllbnRlIGRlc2NvbnRyYcOtZG8uIEVzdGEgYWxkZWlhIGNhbXBlc3RyZSBhcGFyZW50ZW1lbnRlIHBhY2F0YSB0ZW0gdW0gZXNww61yaXRvIGJvw6ltaW8sIGV4Y2x1c2l2byBkZXN0ZSBlbmNsYXZlIG1vbnRhbmhvc28uICNEZWlhQnlDYW1wZXJcIixcblx0XHRcdFx0XHRcImFyZWxsdWZcIjogXCJBcyBncmFuZGVzIGZlc3RhcyBkZSBBcmVuYWwgZSBhIGRpdmVyc8OjbyBzZW0gbGltaXRlcyBkZSBNYWdhbHVmIHJlw7puZW0tc2UgZW0gQXJlbGx1ZiwgdW1hIHBhcnRlIGltYWdpbmFkYSBtYXMgw6lwaWNhIGRhIG5vc3NhIHZpc8OjbyBkZXN0YSBpbGhhIHTDo28gYW1hZGEgcG9yIG7Ds3MuIEEgY29tYmluYcOnw6NvIHBlcmZlaXRhIGVudHJlIHRvbnMgbsOpb24gZSBmZXN0YXMgaW1wYXLDoXZlaXMgc29iIG8gc29sIGRlIHZlcsOjbyAodW1hIG1pc3R1cmEgYmVtIHF1ZW50ZSwgbmEgcmVhbGlkYWRlKS4gI0FyZWxsdWZCeUNhbXBlclwiLFxuXHRcdFx0XHRcdFwiZXMtdHJlbmNcIjogXCJFc3RhIHZhc3RhIHJlZ2nDo28gY29zdGVpcmEgcG9zc3VpIHByYWlhcyBpbXByZXNzaW9uYW50ZXMgZSB1bSBhbWJpZW50ZSBzZXJlbm8uIE8gbGl0b3JhbCB0ZW0gdW1hIGF0bW9zZmVyYSBzZWx2YWdlbSBlIHRyYW5xdWlsYSBhbyBtZXNtbyB0ZW1wbywgcXVlIMOpIHRhbnRvIGluc3BpcmFkb3JhIGNvbW8gcmVsYXhhbnRlLiAjRXNUcmVuY0J5Q2FtcGVyXCJcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdFwiYXNzZXRzXCI6IFtcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtY2FwYXMuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1kdWIuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1rb2JhcmFoLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtcGFyYWRpc2UuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvYXJlbGx1Zi1wZWxvdGFzLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2FyZWxsdWYtbWFydGEuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZGVpYS1kdWIuanBnXCIsXG5cdFx0XHRcdFwidmlkZW8tc2hvdHMvZGVpYS1tYXJ0YS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9kZWlhLW1hdGVvLmpwZ1wiLFxuXHRcdFx0XHRcInZpZGVvLXNob3RzL2VzLXRyZW5jLWJlbHVnYS5qcGdcIixcblx0XHRcdFx0XCJ2aWRlby1zaG90cy9lcy10cmVuYy1pc2FtdS5qcGdcIlxuXHRcdFx0XVxuXHRcdH0sXG5cbiAgICAgICAgXCJkZWlhL2R1YlwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8xM2JiYjYxMTk1MTY0ODczZDgyM2EzYjkxYTJjODJhY2NlZmIzZWRkL2RlaWEtZHViLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMTg4LCBcInNcIjogODUsIFwidlwiOiA2MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAzNTcsIFwic1wiOiA5NywgXCJ2XCI6IDI2IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAzNTksIFwic1wiOiA5MywgXCJ2XCI6IDUxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82MmU1NGVhYzFkODk4OWFiOWRlMjM4ZmEzZjdjNmQ4ZGI0ZDlkZThkL2RlaWEtZHViLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiQnJlYWtpbmcgdXAgb24gYSB0ZXh0IG1lc3NhZ2UgaXMgbm90IHZlcnkgZGVpYVwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvZHViX2RlaWFfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiYXpqYzJqaDYyalwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcIjZwMzJseXZkcW9cIlxuICAgICAgICB9LFxuICAgICAgICBcImRlaWEvbWF0ZW9cIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvZTQyNDg4OWFjMDI2ZjcwZTU0NGFmMDMwMzVlNzE4N2YzNDk0MTcwNS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzcsIFwic1wiOiA4OSwgXCJ2XCI6IDgzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA4NiwgXCJ2XCI6IDU3IH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiA4LCBcInNcIjogODYsIFwidlwiOiA1NyB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOTUwYjY5MjVmYTRmODVjZmE4ZDQ2NmQ4NDM2MTY3MTc5N2MyMGMxYS9kZWlhLW1hdGVvLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiYnV5cyBhbiBhdGVsaWVyIGF0IGRlaWEuPGJyPnN0YXJ0cyBjYXJlZXIgYXMgYW4gYXJ0aXN0XCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9tYXRlb19kZWlhX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcIjZoZXQxa25pazNcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCI2cDMybHl2ZHFvXCJcbiAgICAgICAgfSxcblxuICAgICAgICBcImRlaWEvbWFydGFcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMzQ2LCBcInNcIjogNzAsIFwidlwiOiA1NSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyNDQsIFwic1wiOiAyOSwgXCJ2XCI6IDczIH0sXG4gICAgICAgIFx0XHRcInNlbGZpZS1zdGlja1wiOiB7IFwiaFwiOiAyNDQsIFwic1wiOiAyOSwgXCJ2XCI6IDczIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9kMTU5YjU1ZmY4Y2VjYzljYmQ4YzBjMTJlZTI3ODFlMmVkYTIzZTkzL2RlaWEtbWFydGEubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJidXlzIGFuIGF0ZWxpZXIgYXQgZGVpYS48YnI+c3RhcnRzIGNhcmVlciBhcyBhbiBhcnRpc3RcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMvbWFydGFfZGVpYV9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJ0b3JvMnBlNDY5XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiYmdreDdnbWsxM1wiXG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJlcy10cmVuYy9iZWx1Z2FcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMjM0NDRkM2M4NjkzZTU5ZjgwNzlmODI3ZGQxODJjNWUzMzQxMzg3Ny9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMTIsIFwic1wiOiAxMCwgXCJ2XCI6IDY5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE5MywgXCJzXCI6IDEyLCBcInZcIjogNDUgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE5MywgXCJzXCI6IDAsIFwidlwiOiA0NSB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNzA0NTVhZDczYWY3YjdlMzVlOWU2NzQxMDk5MjljM2I3MDI5NDA2NC9lcy10cmVuYy1iZWx1Z2EubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJFUyBUUkVOQyBQQVJUWSBCT1lcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL2JlbHVnYV9lc190cmVuY19zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJmbzExMnpoN3B2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiOTdidnB6aHRuYlwiXG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNmVhZmFlN2YxYjNiYzQxZDg1Njk3MzU1N2EyZjUxNTk4YzgyNDFhNi9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDIxMCwgXCJzXCI6IDEsIFwidlwiOiA3NCB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMSwgXCJzXCI6IDM1LCBcInZcIjogNzIgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDIwLCBcInNcIjogNDUsIFwidlwiOiAzMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMDY2NzlmM2ViZDY5NmU5YzQyZmQxM2NmOWRiZGFlZmZlOWIxZjg3My9lcy10cmVuYy1pc2FtdS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIlVGTyBzaWdodGluZyBhdCBlcyB0cmVuY1wiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC93b21lbi9zaG9lcy9pc2FtdV9lc190cmVuY19zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCIxeHNhYnE3eWV5XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwieG5sbnllZTgzb1wiXG4gICAgICAgIH0sXG5cblx0XHRcImFyZWxsdWYvY2FwYXNcIjoge1xuXHRcdFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy84NDBhM2Y2NzI5YjFmNTJmNDQ2YWFlNmRhZWM5MzlhM2VjYTRjMGMxL2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAwLCBcInNcIjogMCwgXCJ2XCI6IDAgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogOCwgXCJzXCI6IDc2LCBcInZcIjogOTEgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDgsIFwic1wiOiA3NiwgXCJ2XCI6IDkxIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy80OGZmMWM1OGI4NmIwODkxMjY4MWI0ZmRmM2I3NTQ3Yzc1Nzc2NmQ3L2FyZWxsdWYtY2FwYXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJNRUFOV0hJTEUgSU4gQVJFTExVRlwiXG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcInNob3AtdXJsXCI6IFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL2ludC9tZW4vc2hvZXMvY2FwYXNfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJ6N29yNjhkYTF2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwia2ZjMHUxdnZocFwiXG5cdFx0fSxcbiAgICAgICAgXCJhcmVsbHVmL3BlbG90YXNcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvM2RjZmQ3MGM3MDcyNjkyZWEzYTczOWFlZjUzNzZiMDI2YjA0YjY3NS9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAyMTEsIFwic1wiOiA5NSwgXCJ2XCI6IDI5IH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDIyLCBcInNcIjogMzUsIFwidlwiOiA3OSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjMzLCBcInNcIjogMzUsIFwidlwiOiAxMCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYWMxNmQ1M2M0ZjllOGZkNjkzMDc3OWUyMzc4NTQ2ODdkY2YyNDFlOC9hcmVsbHVmLXBlbG90YXMubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEFUIEhBUFBFTlMgSU4gQVJFTExVRiBTVEFZUyBJTiBBUkVMTFVGXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L21lbi9zaG9lcy9wZWxvdGFzX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwiZjlkbzJxbHdualwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcImt5amtid2NuNnZcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYvbWFydGFcIjoge1xuICAgICAgICBcdFwic2VsZmllLXN0aWNrLXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvOWI5NDcxZGNiZTFmOTRmZjdiMzUwODg0MWY2OGZmMTViZTE5MmVlNC9hcmVsbHVmLW1hcnRhLm1wNFwiLFxuICAgICAgICBcdFwiYW1iaWVudC1jb2xvclwiOiB7XG4gICAgICAgIFx0XHRcImZyb21cIjogeyBcImhcIjogMjAwLCBcInNcIjogNTcsIFwidlwiOiA4MSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMDEsIFwic1wiOiAxMDAsIFwidlwiOiA2OSB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMjAxLCBcInNcIjogMTAwLCBcInZcIjogNjkgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzViOWQyNzA2MTAwZTVlYTBkMzE3MTQzZTIzNzRkNmJkNmM5NjA3YjEvYXJlbGx1Zi1tYXJ0YS5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkJBRCBUUklQIEFUIFRIRSBIT1RFTCBQT09MXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL21hcnRhX2FyZWxsdWZfc3MyMDE2XCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtY2hhcmFjdGVyLWlkXCI6IFwicHBrbWZkbDVqcVwiLFxuICAgICAgICBcdFwid2lzdGlhLWZ1bi1pZFwiOiBcInI2NGlqMm9qaDNcIlxuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYva29iYXJhaFwiOiB7XG4gICAgICAgIFx0XCJzZWxmaWUtc3RpY2stdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhaC5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDI2NCwgXCJzXCI6IDY5LCBcInZcIjogNDEgfSxcbiAgICAgICAgXHRcdFwidG9cIjogeyBcImhcIjogMzQ0LCBcInNcIjogNTYsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDM0NCwgXCJzXCI6IDQxLCBcInZcIjogMTAwIH1cbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwiZnVuLWZhY3QtdmlkZW8tdXJsXCI6IFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82MmU1NGVhYzFkODk4OWFiOWRlMjM4ZmEzZjdjNmQ4ZGI0ZDlkZThkL2FyZWxsdWYta29iYXJhaC5tcDRcIixcbiAgICAgICAgXHRcImZhY3RcIjoge1xuICAgICAgICBcdFx0XCJlblwiOiBcIkhhdGVycyB3aWxsIHNheSBpdHMgcGhvdG9zaG9wXCJcbiAgICAgICAgXHR9LFxuICAgICAgICBcdFwic2hvcC11cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vaW50L3dvbWVuL3Nob2VzL2tvYmFyYWhfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCI5eGU1dmp6eWJvXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwibzc5ZHFwaHBzbFwiXG4gICAgICAgIH0sXG5cdFx0XCJhcmVsbHVmL2R1YlwiOiB7XG5cdFx0XHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIyYjM2MGM4Y2EzOTk2OTY5ODUzMTNkZGU5OWJhODNkNGVjOTcyYjcvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJhbWJpZW50LWNvbG9yXCI6IHtcbiAgICAgICAgXHRcdFwiZnJvbVwiOiB7IFwiaFwiOiAxOTYsIFwic1wiOiA1MiwgXCJ2XCI6IDMzIH0sXG4gICAgICAgIFx0XHRcInRvXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfSxcbiAgICAgICAgXHRcdFwic2VsZmllLXN0aWNrXCI6IHsgXCJoXCI6IDE1LCBcInNcIjogODQsIFwidlwiOiAxMDAgfVxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJmdW4tZmFjdC12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzk4N2JkYWIwMTI5Nzk4MjJiODE4NjM3ODM3Y2MyODg0MTRjZWY4ZjMvYXJlbGx1Zi1kdWIubXA0XCIsXG4gICAgICAgIFx0XCJmYWN0XCI6IHtcbiAgICAgICAgXHRcdFwiZW5cIjogXCJXSEVOIFlPVSBDQU4nVCBLRUVQIFRIRSBBUlJPVyBPTiBUSEUgQ0VOVEVSIExJTkVcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvbWVuL3Nob2VzL2R1Yl9hcmVsbHVmX3NzMjAxNlwiLFxuICAgICAgICBcdFwid2lzdGlhLWNoYXJhY3Rlci1pZFwiOiBcImRsZzVhenk1YXJcIixcbiAgICAgICAgXHRcIndpc3RpYS1mdW4taWRcIjogXCJxcGhqOXAzdDVoXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJhcmVsbHVmL3BhcmFkaXNlXCI6IHtcbiAgICAgICAgXHRcInNlbGZpZS1zdGljay12aWRlby11cmxcIjogXCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzL2E4MTljMzczZjk3Nzc4NTJmMzk2N2NlMDIzYmNmYjBkOTExNTM4NmYvYXJlbGx1Zi1wYXJhZGlzZS5tcDRcIixcbiAgICAgICAgXHRcImFtYmllbnQtY29sb3JcIjoge1xuICAgICAgICBcdFx0XCJmcm9tXCI6IHsgXCJoXCI6IDU5LCBcInNcIjogMTksIFwidlwiOiA5OSB9LFxuICAgICAgICBcdFx0XCJ0b1wiOiB7IFwiaFwiOiAyMDcsIFwic1wiOiAzMSwgXCJ2XCI6IDEwMCB9LFxuICAgICAgICBcdFx0XCJzZWxmaWUtc3RpY2tcIjogeyBcImhcIjogMTgzLCBcInNcIjogNzEsIFwidlwiOiA2NCB9XG4gICAgICAgIFx0fSxcbiAgICAgICAgXHRcImZ1bi1mYWN0LXZpZGVvLXVybFwiOiBcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNWRjMTk3MjZlZmE3YjJlNzU2YzgwNTM0ZDQzZmE2MDBjYzYxZjE3OC9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuICAgICAgICBcdFwiZmFjdFwiOiB7XG4gICAgICAgIFx0XHRcImVuXCI6IFwiU0VMRklFIE9OIFdBVEVSU0xJREUgTElLRSBBIEJPU1NcIlxuICAgICAgICBcdH0sXG4gICAgICAgIFx0XCJzaG9wLXVybFwiOiBcImh0dHA6Ly93d3cuY2FtcGVyLmNvbS9pbnQvd29tZW4vc2hvZXMvcGFyYWRpc2VfYXJlbGx1Zl9zczIwMTZcIixcbiAgICAgICAgXHRcIndpc3RpYS1jaGFyYWN0ZXItaWRcIjogXCJoODl5MGt1d3kyXCIsXG4gICAgICAgIFx0XCJ3aXN0aWEtZnVuLWlkXCI6IFwiMzQzdDFzbjJucFwiXG4gICAgICAgIH1cblxuXHR9XG59Il19
