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

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _gsap = require('gsap');

var _gsap2 = _interopRequireDefault(_gsap);

var _raf = require('./app/utils/raf');

var _raf2 = _interopRequireDefault(_raf);

var _mobileDetect = require('mobile-detect');

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

if (!window.console) console = { log: function log() {} };

window.jQuery = window.$ = _jquery2['default'];

var md = new _mobileDetect2['default'](window.navigator.userAgent);

_AppStore2['default'].Detector.isMobile = md.mobile() || md.tablet() ? true : false;
_AppStore2['default'].Parent = (0, _jquery2['default'])('#app-container');
_AppStore2['default'].Detector.oldIE = _AppStore2['default'].Parent.is('.ie6, .ie7, .ie8');
_AppStore2['default'].Detector.isSupportWebGL = _Utils2['default'].SupportWebGL();
if (_AppStore2['default'].Detector.oldIE) _AppStore2['default'].Detector.isMobile = true;

// Debug
// AppStore.Detector.isMobile = true

var app;
if (_AppStore2['default'].Detector.isMobile) {
	(0, _jquery2['default'])('html').addClass('mobile');
	app = new _AppMobile2['default']();
} else {
	app = new _App2['default']();
}

app.init();

},{"./app/App":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/App.js","./app/AppMobile":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppMobile.js","./app/stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./app/utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./app/utils/raf":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/raf.js","gsap":"gsap","jquery":"jquery","mobile-detect":"mobile-detect"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/App.js":[function(require,module,exports){
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
			appTemplate.isReady = this.onAppReady;
			appTemplate.render('#app-container');
		}
	}, {
		key: 'onAppReady',
		value: function onAppReady() {
			// Start routing
			this.router.beginRouting();
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
			this.pxContainer.init('#app-template');
			_AppActions2['default'].pxContainerIsReady(this.pxContainer);

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
			_get(Object.getPrototypeOf(AppTemplate.prototype), 'resize', this).call(this);
		}
	}]);

	return AppTemplate;
})(_BaseComponent3['default']);

exports['default'] = AppTemplate;
module.exports = exports['default'];

},{"./../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./components/FrontContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/FrontContainer.js","./components/PXContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PXContainer.js","./components/PagesContainer":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PagesContainer.js","./constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/AppTemplateMobile.js":[function(require,module,exports){
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

function _proceedHasherChangeAction(pageId) {
    _AppDispatcher2['default'].handleViewAction({
        actionType: _AppConstants2['default'].PAGE_HASHER_CHANGED,
        item: pageId
    });
}

var AppActions = {
    pageHasherChanged: function pageHasherChanged(pageId) {

        var manifest = _AppStore2['default'].pageAssetsToLoad();
        if (manifest.length < 1) {
            _proceedHasherChangeAction(pageId);
        } else {
            // AppStore.PagesLoader.open()
            _AppStore2['default'].Preloader.load(manifest, function () {
                // AppStore.PagesLoader.close()
                _proceedHasherChangeAction(pageId);
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

var FrontContainer = (function (_BaseComponent) {
	_inherits(FrontContainer, _BaseComponent);

	function FrontContainer() {
		_classCallCheck(this, FrontContainer);

		_get(Object.getPrototypeOf(FrontContainer.prototype), 'constructor', this).call(this);
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

			this.headerLinks = (0, _headerLinks2['default'])(this.element);
			this.socialLinks = (0, _socialLinks2['default'])(this.element);

			_get(Object.getPrototypeOf(FrontContainer.prototype), 'componentDidMount', this).call(this);
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

},{"./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/FrontContainer.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/FrontContainer.hbs","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./header-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js","./social-links":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/PXContainer.js":[function(require,module,exports){
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
			// this.renderer = new PIXI.autoDetectRenderer(1, 1, renderOptions)
			this.renderer = new PIXI.CanvasRenderer(1, 1, renderOptions);
			this.currentColor = 0xffffff;
			var el = $(elementId);
			$(this.renderer.view).attr('id', 'px-container');
			el.append(this.renderer.view);
			this.stage = new PIXI.Container();
			this.background = new PIXI.Graphics();
			this.drawBackground(this.currentColor);
			this.stage.addChild(this.background);
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
			this.renderer.render(this.stage);
		}
	}, {
		key: 'resize',
		value: function resize() {
			var scale = 1;
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			this.renderer.resize(windowW * scale, windowH * scale);
			this.drawBackground(this.currentColor);
		}
	}]);

	return PXContainer;
})();

exports['default'] = PXContainer;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js":[function(require,module,exports){
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
		key: 'didTransitionOutComplete',
		value: function didTransitionOutComplete() {
			_get(Object.getPrototypeOf(Page.prototype), 'didTransitionOutComplete', this).call(this);
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
		_AppStore2['default'].on(_AppConstants2['default'].PAGE_HASHER_CHANGED, this.didHasherChange);
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
			var hash = _Router2['default'].getNewHash();
			var type = undefined;
			var template = undefined;
			switch (hash.type) {
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
			this.setupNewComponent(hash, type, template);
			this.currentComponent = this.components['new-component'];
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

},{"./../../pager/components/BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js","./../../pager/components/BasePager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePager.js","./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../partials/Diptyque.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Diptyque.hbs","./../partials/Home.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/Home.hbs","./../services/Router":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Router.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./pages/Diptyque":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js","./pages/Home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var aroundBorder = function aroundBorder(parent) {

	var scope;

	var $container = parent.find('.around-border-container');
	var top = $container.find('.top').get(0);
	var bottom = $container.find('.bottom').get(0);
	var left = $container.find('.left').get(0);
	var right = $container.find('.right').get(0);
	var leftStepTop = $container.find('.left-step-top').get(0);
	var leftStepBottom = $container.find('.left-step-bottom').get(0);
	var rightStepTop = $container.find('.right-step-top').get(0);
	var rightStepBottom = $container.find('.right-step-bottom').get(0);

	var $lettersContainer = parent.find(".around-border-letters-container");
	var topLetters = $lettersContainer.find(".top").children().get();
	var bottomLetters = $lettersContainer.find(".bottom").children().get();
	var leftLetters = $lettersContainer.find(".left").children().get();
	var rightLetters = $lettersContainer.find(".right").children().get();
	var leftStepTopLetters = $lettersContainer.find('.left-step-top').children().get();
	var leftStepBottomLetters = $lettersContainer.find('.left-step-bottom').children().get();
	var rightStepTopLetters = $lettersContainer.find('.right-step-top').children().get();
	var rightStepBottomLetters = $lettersContainer.find('.right-step-bottom').children().get();

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
			};
			for (var i = 0; i < bottomLetters.length; i++) {
				var bl = bottomLetters[i];
				bl.style.left = (blockSize[0] << 1) + (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				bl.style.top = windowH - 10 + 'px';
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
				lstl.style.top = blockSize[1] * 3 + 'px';
			};
			for (var i = 0; i < leftStepBottomLetters.length; i++) {
				var lsbl = leftStepBottomLetters[i];
				lsbl.style.left = blockSize[0] * 2 - 8 + 'px';
				lsbl.style.top = windowH - (blockSize[1] >> 1) - 2 + 'px';
			};
			for (var i = 0; i < rightStepTopLetters.length; i++) {
				var rstl = rightStepTopLetters[i];
				rstl.style.left = windowW - (blockSize[0] << 1) + (blockSize[0] >> 1) + blockSize[0] * i - 2 + 'px';
				rstl.style.top = blockSize[1] * 3 + 'px';
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var bottomTexts = function bottomTexts(parent) {

	var scope;
	var bottomTextsContainer = parent.find(".bottom-texts-container");
	var leftBottomText = bottomTextsContainer.find('.left-text');
	var rightBottomText = bottomTextsContainer.find('.right-text');

	var resize = function resize() {
		var windowW = _AppStore2['default'].Window.w;
		var windowH = _AppStore2['default'].Window.h;

		var blockSize = [windowW / _AppConstants2['default'].GRID_ROWS, windowH / _AppConstants2['default'].GRID_COLUMNS];

		scope.left.el.style.width = blockSize[0] * 2 + 'px';
		scope.left.el.style.height = blockSize[1] + 'px';
		scope.right.el.style.width = blockSize[0] * 2 + 'px';
		scope.right.el.style.height = blockSize[1] + 'px';

		scope.left.el.style.top = windowH - blockSize[1] + 'px';
		scope.right.el.style.top = windowH - blockSize[1] + 'px';
		scope.right.el.style.left = windowW - blockSize[0] * 2 + 'px';
	};

	scope = {
		left: {
			el: leftBottomText.get(0),
			front: leftBottomText.find('.front-wrapper').get(0),
			background: leftBottomText.find('.background').get(0)
		},
		right: {
			el: rightBottomText.get(0),
			front: rightBottomText.find('.front-wrapper').get(0),
			background: rightBottomText.find('.background').get(0)
		},
		resize: resize
	};

	return scope;
};

exports['default'] = bottomTexts;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js":[function(require,module,exports){
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

var grid = function grid(props, parent, onItemEnded) {

	var videoEnded = function videoEnded(item) {
		onItemEnded(item);
		scope.transitionOutItem(item);
	};

	var imageEnded = function imageEnded(item) {
		onItemEnded(item);
		scope.transitionOutItem(item);
	};

	var $gridContainer = parent.find(".grid-container");
	var gridChildren = $gridContainer.children().get();
	var linesHorizontal = parent.find(".lines-grid-container .horizontal-lines").children().get();
	var linesVertical = parent.find(".lines-grid-container .vertical-lines").children().get();
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
		el: $gridContainer,
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
				item.timeout(imageEnded, 4000);
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
		}
	};

	return scope;
};

exports['default'] = grid;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./video-canvas":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/header-links.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var headerLinks = function headerLinks(parent) {
	var scope;

	var onSubMenuMouseEnter = function onSubMenuMouseEnter(e) {
		e.preventDefault();
		var $target = $(e.currentTarget);
		$target.addClass('hovered');
	};
	var onSubMenuMouseLeave = function onSubMenuMouseLeave(e) {
		e.preventDefault();
		var $target = $(e.currentTarget);
		$target.removeClass('hovered');
	};

	var camperLabEl = parent.find('.camper-lab').get(0);
	var shopEl = parent.find('.shop-wrapper').get(0);
	var mapEl = parent.find('.map-btn').get(0);

	shopEl.addEventListener('mouseenter', onSubMenuMouseEnter);
	shopEl.addEventListener('mouseleave', onSubMenuMouseLeave);

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var padding = _AppConstants2['default'].PADDING_AROUND / 3;

			var camperLabCss = {
				left: windowW - _AppConstants2['default'].PADDING_AROUND * 0.6 - padding - $(camperLabEl).width(),
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var shopCss = {
				left: camperLabCss.left - $(shopEl).width() - padding,
				top: _AppConstants2['default'].PADDING_AROUND
			};
			var mapCss = {
				left: shopCss.left - $(mapEl).width() - padding,
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

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Diptyque.js":[function(require,module,exports){
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

var Diptyque = (function (_Page) {
	_inherits(Diptyque, _Page);

	function Diptyque(props) {
		_classCallCheck(this, Diptyque);

		_get(Object.getPrototypeOf(Diptyque.prototype), 'constructor', this).call(this, props);
	}

	_createClass(Diptyque, [{
		key: 'componentDidMount',
		value: function componentDidMount() {

			console.log(this.getImageUrlById('shoe'));

			_get(Object.getPrototypeOf(Diptyque.prototype), 'componentDidMount', this).call(this);
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			_get(Object.getPrototypeOf(Diptyque.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'didTransitionOutComplete',
		value: function didTransitionOutComplete() {
			_get(Object.getPrototypeOf(Diptyque.prototype), 'didTransitionOutComplete', this).call(this);
		}
	}, {
		key: 'resize',
		value: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			_get(Object.getPrototypeOf(Diptyque.prototype), 'resize', this).call(this);
		}
	}]);

	return Diptyque;
})(_Page3['default']);

exports['default'] = Diptyque;
module.exports = exports['default'];

},{"./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/pages/Home.js":[function(require,module,exports){
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

var Home = (function (_Page) {
	_inherits(Home, _Page);

	function Home(props) {
		_classCallCheck(this, Home);

		props.data.grid = [];
		props.data.grid.length = 28;
		props.data['lines-grid'] = { horizontal: [], vertical: [] };
		props.data['lines-grid'].horizontal.length = 3;
		props.data['lines-grid'].vertical.length = 6;
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

			this.seats = [1, 2, 3, 4, 5, 7, 8, 12, 13, 15, 16, 19, 20, 23, 24, 25];

			this.usedSeats = [];

			this.bg = this.element.find(".bg-wrapper").get(0);

			this.grid = (0, _gridHome2['default'])(this.props, this.element, this.onItemEnded);
			this.bottomTexts = (0, _bottomTextsHome2['default'])(this.element);
			this.aroundBorder = (0, _aroundBorderHome2['default'])(this.element);

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
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			_get(Object.getPrototypeOf(Home.prototype), 'didTransitionInComplete', this).call(this);
		}
	}, {
		key: 'didTransitionOutComplete',
		value: function didTransitionOutComplete() {
			_get(Object.getPrototypeOf(Home.prototype), 'didTransitionOutComplete', this).call(this);
		}
	}, {
		key: 'update',
		value: function update() {
			this.videoTriggerCounter += 1;
			if (this.videoTriggerCounter > 300) {
				this.videoTriggerCounter = 0;
				this.triggerNewItem(_AppConstants2['default'].ITEM_VIDEO);
			}
			this.imageTriggerCounter += 1;
			if (this.imageTriggerCounter > 40) {
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

			var resizeVarsBg = _Utils2['default'].ResizePositionProportionally(windowW, windowH, _AppConstants2['default'].MEDIA_GLOBAL_W, _AppConstants2['default'].MEDIA_GLOBAL_H);

			// bg
			this.bg.style.position = 'absolute';
			this.bg.style.width = resizeVarsBg.width + 'px';
			this.bg.style.height = resizeVarsBg.height + 'px';
			this.bg.style.top = resizeVarsBg.top + 'px';
			this.bg.style.left = resizeVarsBg.left + 'px';

			_get(Object.getPrototypeOf(Home.prototype), 'resize', this).call(this);
		}
	}]);

	return Home;
})(_Page3['default']);

exports['default'] = Home;
module.exports = exports['default'];

},{"./../../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Page":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/Page.js","./../around-border-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/around-border-home.js","./../bottom-texts-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/bottom-texts-home.js","./../grid-home":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/grid-home.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/social-links.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AppStore = require('./../stores/AppStore');

var _AppStore2 = _interopRequireDefault(_AppStore);

var _AppConstants = require('./../constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

var socialLinks = function socialLinks(parent) {

	var scope;
	var wrapper = parent.find("#footer #social-wrapper").get(0);

	scope = {
		resize: function resize() {
			var windowW = _AppStore2['default'].Window.w;
			var windowH = _AppStore2['default'].Window.h;
			var padding = _AppConstants2['default'].PADDING_AROUND * 0.4;

			var socialCss = {
				left: windowW - padding - $(wrapper).width(),
				top: windowH - padding - $(wrapper).height()
			};

			wrapper.style.left = socialCss.left + 'px';
			wrapper.style.top = socialCss.top + 'px';
		}
	};

	return scope;
};

exports['default'] = socialLinks;
module.exports = exports['default'];

},{"./../constants/AppConstants":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/constants/AppConstants.js","./../stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/components/video-canvas.js":[function(require,module,exports){
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

	LANDSCAPE: 'LANDSCAPE',
	PORTRAIT: 'PORTRAIT',

	HOME: 'HOME',
	DIPTYQUE: 'DIPTYQUE',

	PX_CONTAINER_IS_READY: 'PX_CONTAINER_IS_READY',
	PX_CONTAINER_ADD_CHILD: 'PX_CONTAINER_ADD_CHILD',
	PX_CONTAINER_REMOVE_CHILD: 'PX_CONTAINER_REMOVE_CHILD',

	HOME_VIDEO_SIZE: [640, 360],

	ITEM_IMAGE: 'ITEM_IMAGE',
	ITEM_VIDEO: 'ITEM_VIDEO',

	GRID_ROWS: 7,
	GRID_COLUMNS: 4,

	PADDING_AROUND: 40,

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
    var helper;

  return "<div class='page-wrapper diptyque-page'>\n	<div class=\"vertical-center-parent\">\n		<p class=\"vertical-center-child\">\n			This is a "
    + this.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n		</p>\n	</div>\n</div>";
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
    var stack1, helper, options, alias1=helpers.helperMissing, alias2="function", alias3=helpers.blockHelperMissing, buffer = 
  "<div class='page-wrapper home-page'>\n	<div class=\"bg-wrapper\">\n		<img src='"
    + this.escapeExpression(((helper = (helper = helpers.bgurl || (depth0 != null ? depth0.bgurl : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"bgurl","hash":{},"data":data}) : helper)))
    + "'>\n	</div>\n	<div class=\"grid-container\">\n";
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
  return buffer + "		</div>\n	</div>\n	<div class=\"bottom-texts-container\">\n		<div class=\"left-text\">\n			<div class=\"front-wrapper\"></div>\n			<div class=\"background\"></div>\n		</div>\n		<div class=\"right-text\">\n			<div class=\"front-wrapper\"></div>\n			<div class=\"background\"></div>\n		</div>\n	</div>\n	<div class=\"around-border-container\">\n		<div class=\"top\"></div>\n		<div class=\"bottom\"></div>\n		<div class=\"left\"></div>\n		<div class=\"right\"></div>\n\n		<div class=\"left-step-top\"></div>\n		<div class=\"left-step-bottom\"></div>\n		<div class=\"right-step-top\"></div>\n		<div class=\"right-step-bottom\"></div>\n	</div>\n	<div class=\"around-border-letters-container\">\n		<div class=\"top\">\n			<div>a</div>\n			<div>b</div>\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"bottom\">\n			<div>c</div>\n			<div>d</div>\n			<div>e</div>\n		</div>\n		<div class=\"left\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n		<div class=\"right\">\n			<div>1</div>\n			<div>2</div>\n			<div>3</div>\n		</div>\n\n		<div class=\"left-step-top\">\n			<div>a</div>\n			<div>b</div>\n		</div>\n		<div class=\"left-step-bottom\">\n			<div>4</div>\n		</div>\n		<div class=\"right-step-top\">\n			<div>f</div>\n			<div>g</div>\n		</div>\n		<div class=\"right-step-bottom\">\n			<div>4</div>\n		</div>\n	</div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":"/Users/panagiotisthomoglou/Projects/camper-ss16/node_modules/hbsfy/runtime.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id='pages-container'>\n	<div id='page-a'></div>\n	<div id='page-b'></div>\n</div>";
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

var GlobalEvents = (function () {
	function GlobalEvents() {
		_classCallCheck(this, GlobalEvents);
	}

	_createClass(GlobalEvents, [{
		key: 'init',
		value: function init() {
			$(window).on('resize', this.resize);
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

},{"./../actions/AppActions":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/actions/AppActions.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/services/Preloader.js":[function(require,module,exports){
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
			this.newHashFounded = false;
			_hasher2['default'].newHash = undefined;
			_hasher2['default'].oldHash = undefined;
			_hasher2['default'].initialized.add(this._didHasherChange.bind(this));
			_hasher2['default'].changed.add(this._didHasherChange.bind(this));
			this._setupCrossroads();
		}
	}, {
		key: 'beginRouting',
		value: function beginRouting() {
			_hasher2['default'].init();
		}
	}, {
		key: '_setupCrossroads',
		value: function _setupCrossroads() {
			var routes = this.routing;
			for (var key in routes) {
				if (key.length > 1) {
					_crossroads2['default'].addRoute(key, this._onParseUrl.bind(this));
				}
			}
			_crossroads2['default'].addRoute('', this._onParseUrl.bind(this));
		}
	}, {
		key: '_onParseUrl',
		value: function _onParseUrl() {
			this._assignRoute();
		}
	}, {
		key: '_onDefaultURLHandler',
		value: function _onDefaultURLHandler() {
			this._sendToDefault();
		}
	}, {
		key: '_assignRoute',
		value: function _assignRoute(id) {
			var hash = _hasher2['default'].getHash();
			var parts = this._getURLParts(hash);
			this._updatePageRoute(hash, parts, parts[0], parts[1] == undefined ? '' : parts[1]);
			this.newHashFounded = true;
		}
	}, {
		key: '_getURLParts',
		value: function _getURLParts(url) {
			var hash = url;
			return hash.split('/');
		}
	}, {
		key: '_updatePageRoute',
		value: function _updatePageRoute(hash, parts, parent, target) {
			_hasher2['default'].oldHash = _hasher2['default'].newHash;
			_hasher2['default'].newHash = {
				hash: hash,
				parts: parts,
				parent: parent,
				target: target
			};
			_hasher2['default'].newHash.type = _hasher2['default'].newHash.hash == '' ? _AppConstants2['default'].HOME : _AppConstants2['default'].DIPTYQUE;
			_AppActions2['default'].pageHasherChanged();
		}
	}, {
		key: '_didHasherChange',
		value: function _didHasherChange(newHash, oldHash) {
			this.newHashFounded = false;
			_crossroads2['default'].parse(newHash);
			if (this.newHashFounded) return;
			// If URL don't match a pattern, send to default
			this._onDefaultURLHandler();
		}
	}, {
		key: '_sendToDefault',
		value: function _sendToDefault() {
			_hasher2['default'].setHash(_AppStore2['default'].defaultRoute());
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
			return _AppStore2['default'].Data.routing;
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
        var filenames = ['character.png', 'character-bg.jpg', 'shoe.png', 'shoe-bg.jpg'];
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
		value: function ResizePositionProportionally(windowW, windowH, contentW, contentH) {
			var aspectRatio = contentW / contentH;
			var scale = windowW / windowH < aspectRatio ? windowH / contentH * 1 : windowW / contentW * 1;
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
				$(child).remove();
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
		key: 'RandomColor',
		value: function RandomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}
	}]);

	return Utils;
})();

exports['default'] = Utils;
module.exports = exports['default'];

},{}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/raf.js":[function(require,module,exports){
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
    onTransitionOutComplete: function onTransitionOutComplete() {
        PagerDispatcher.handlePagerAction({
            type: PagerConstants.PAGE_TRANSITION_OUT_COMPLETE,
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
                var type = PagerStore.firstPageTransition ? PagerConstants.PAGE_TRANSITION_IN : PagerConstants.PAGE_TRANSITION_OUT;
                PagerStore.emit(type);
                break;
            case PagerConstants.PAGE_TRANSITION_OUT_COMPLETE:
                var type = PagerConstants.PAGE_TRANSITION_IN;
                PagerStore.emit(type);
                break;
            case PagerConstants.PAGE_TRANSITION_DID_FINISH:
                if (PagerStore.firstPageTransition) PagerStore.firstPageTransition = false;
                PagerStore.pageTransitionState = PagerConstants.PAGE_TRANSITION_DID_FINISH;
                PagerStore.emit(actionType);
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
			this.parent = parentId instanceof jQuery ? parentId : $(this.parentId);
			this.element = template == undefined ? $('<div></div>') : $(template(object));
			if (this.element.attr('id') == undefined) this.element.attr('id', (0, _toSlugCase2['default'])(childId));
			this.element.ready(this.componentDidMount);
			this.parent.append(this.element);
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

},{"to-slug-case":"to-slug-case"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BasePage.js":[function(require,module,exports){
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

var BasePage = (function (_BaseComponent) {
	_inherits(BasePage, _BaseComponent);

	function BasePage(props) {
		_classCallCheck(this, BasePage);

		_get(Object.getPrototypeOf(BasePage.prototype), 'constructor', this).call(this);
		this.props = props;
		this.didTransitionInComplete = this.didTransitionInComplete.bind(this);
		this.didTransitionOutComplete = this.didTransitionOutComplete.bind(this);
		this.tlIn = new TimelineMax({
			onComplete: this.didTransitionInComplete
		});
		this.tlOut = new TimelineMax({
			onComplete: this.didTransitionOutComplete
		});
	}

	_createClass(BasePage, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			this.resize();
			this.setupAnimations();
			setTimeout(function () {
				return _this.props.isReady(_this.props.hash);
			}, 0);
		}
	}, {
		key: 'setupAnimations',
		value: function setupAnimations() {
			var wrapper = this.element;

			// transition In
			this.tlIn.from(wrapper, 1, { opacity: 0, ease: Expo.easeInOut });

			// transition Out
			this.tlOut.to(wrapper, 1, { opacity: 0, ease: Expo.easeInOut });

			// reset
			this.tlIn.pause(0);
			this.tlOut.pause(0);
		}
	}, {
		key: 'willTransitionIn',
		value: function willTransitionIn() {
			this.tlIn.play(0);
		}
	}, {
		key: 'willTransitionOut',
		value: function willTransitionOut() {
			this.tlOut.play(0);
		}
	}, {
		key: 'didTransitionInComplete',
		value: function didTransitionInComplete() {
			var _this2 = this;

			setTimeout(function () {
				return _this2.props.didTransitionInComplete();
			}, 0);
		}
	}, {
		key: 'didTransitionOutComplete',
		value: function didTransitionOutComplete() {
			var _this3 = this;

			setTimeout(function () {
				return _this3.props.didTransitionOutComplete();
			}, 0);
		}
	}, {
		key: 'resize',
		value: function resize() {}
	}, {
		key: 'forceUnmount',
		value: function forceUnmount() {
			this.tlIn.pause(0);
			this.tlOut.pause(0);
			this.didTransitionOutComplete();
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this.tlIn.clear();
			this.tlOut.clear();
		}
	}]);

	return BasePage;
})(_BaseComponent3['default']);

exports['default'] = BasePage;
module.exports = exports['default'];

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
			_get(Object.getPrototypeOf(BasePager.prototype), 'componentWillMount', this).call(this);
		}
	}, {
		key: 'willPageTransitionIn',
		value: function willPageTransitionIn() {
			this.switchPagesDivIndex();
			this.components['new-component'].willTransitionIn();
		}
	}, {
		key: 'willPageTransitionOut',
		value: function willPageTransitionOut() {
			this.components['old-component'].willTransitionOut();
		}
	}, {
		key: 'didPageTransitionInComplete',
		value: function didPageTransitionInComplete() {
			_Pager.PagerActions.pageTransitionDidFinish();
			this.unmountComponent('old-component');
		}
	}, {
		key: 'didPageTransitionOutComplete',
		value: function didPageTransitionOutComplete() {
			_Pager.PagerActions.onTransitionOutComplete();
		}
	}, {
		key: 'switchPagesDivIndex',
		value: function switchPagesDivIndex() {
			var newComponent = this.components['new-component'];
			var oldComponent = this.components['old-component'];
			if (newComponent != undefined) newComponent.element.css('z-index', 2);
			if (oldComponent != undefined) oldComponent.element.css('z-index', 1);
		}
	}, {
		key: 'setupNewComponent',
		value: function setupNewComponent(hash, Type, template) {
			var id = _Utils2['default'].CapitalizeFirstLetter(hash.parent.replace("/", ""));
			this.oldPageDivRef = this.currentPageDivRef;
			this.currentPageDivRef = this.currentPageDivRef === 'page-a' ? 'page-b' : 'page-a';
			var el = this.element.find('#' + this.currentPageDivRef);
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

},{"./../../app/partials/PagesContainer.hbs":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/partials/PagesContainer.hbs","./../../app/stores/AppStore":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/stores/AppStore.js","./../../app/utils/Utils":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/app/utils/Utils.js","./../Pager":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/Pager.js","./BaseComponent":"/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/pager/components/BaseComponent.js"}],"/Users/panagiotisthomoglou/Projects/camper-ss16/www/data/data.json":[function(require,module,exports){
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
				"buy_title": "Buy",
				"campaign_title": "Discover campaign",
				"experience_title": "See experience",
				"legal": "Legal",
				"map_txt": "MAP",
				"mute_txt": "MUTE",
				"play_txt": "PLAY",
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
			"assets": [
				"background.jpg"
			]
		},

		"arelluf/capas": {
		},
		"arelluf/dub": {
        },
        "arelluf/kobarah": {
        },
        "arelluf/marta": {
        },
        "arelluf/paradise": {
        },
        "arelluf/pelotas": {
        },

        "deia/dub": {
        },
        "deia/marta": {
        },
        "deia/mateo": {
        },

        "es-trenc/beluga": {
        },
        "es-trenc/isamu": {
        }
	}
}
},{}]},{},["/Users/panagiotisthomoglou/Projects/camper-ss16/src/js/Main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9NYWluLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9BcHAuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcE1vYmlsZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvQXBwVGVtcGxhdGUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL0FwcFRlbXBsYXRlTW9iaWxlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9hY3Rpb25zL0FwcEFjdGlvbnMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvRnJvbnRDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUFhDb250YWluZXIuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvUGFnZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9QYWdlc0NvbnRhaW5lci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9hcm91bmQtYm9yZGVyLWhvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvYm90dG9tLXRleHRzLWhvbWUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbXBvbmVudHMvZ3JpZC1ob21lLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL2hlYWRlci1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9wYWdlcy9EaXB0eXF1ZS5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy9wYWdlcy9Ib21lLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9jb21wb25lbnRzL3NvY2lhbC1saW5rcy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvY29tcG9uZW50cy92aWRlby1jYW52YXMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2NvbnN0YW50cy9BcHBDb25zdGFudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL2Rpc3BhdGNoZXJzL0FwcERpc3BhdGNoZXIuanMiLCJzcmMvanMvYXBwL3BhcnRpYWxzL0RpcHR5cXVlLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvRnJvbnRDb250YWluZXIuaGJzIiwic3JjL2pzL2FwcC9wYXJ0aWFscy9Ib21lLmhicyIsInNyYy9qcy9hcHAvcGFydGlhbHMvUGFnZXNDb250YWluZXIuaGJzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zZXJ2aWNlcy9HbG9iYWxFdmVudHMuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3NlcnZpY2VzL1ByZWxvYWRlci5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvc2VydmljZXMvUm91dGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC9zdG9yZXMvQXBwU3RvcmUuanMiLCIvVXNlcnMvcGFuYWdpb3Rpc3Rob21vZ2xvdS9Qcm9qZWN0cy9jYW1wZXItc3MxNi9zcmMvanMvYXBwL3V0aWxzL1B4SGVscGVyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL2FwcC91dGlscy9VdGlscy5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9hcHAvdXRpbHMvcmFmLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL1BhZ2VyLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL2NvbXBvbmVudHMvQmFzZUNvbXBvbmVudC5qcyIsIi9Vc2Vycy9wYW5hZ2lvdGlzdGhvbW9nbG91L1Byb2plY3RzL2NhbXBlci1zczE2L3NyYy9qcy9wYWdlci9jb21wb25lbnRzL0Jhc2VQYWdlLmpzIiwiL1VzZXJzL3BhbmFnaW90aXN0aG9tb2dsb3UvUHJvamVjdHMvY2FtcGVyLXNzMTYvc3JjL2pzL3BhZ2VyL2NvbXBvbmVudHMvQmFzZVBhZ2VyLmpzIiwid3d3L2RhdGEvZGF0YS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOzs7Ozs7O3dCQ0VxQixVQUFVOzs7O3FCQUNiLE9BQU87Ozs7bUJBQ1QsS0FBSzs7Ozt5QkFDQyxXQUFXOzs7O3NCQUNuQixRQUFROzs7O29CQUNELE1BQU07Ozs7bUJB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QUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ3JFLFFBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEFBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBSSxJQUFJLENBQUE7SUFDMUMsQ0FBQztBQUNGLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEQsUUFBSSxJQUFJLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkMsUUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDL0MsUUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7SUFDekQsQ0FBQztBQUNGLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEQsUUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakMsUUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxHQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxD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IGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwiLy8gQXZvaWQgY29uc29sZSBlcnJvcnMgZm9yIHRoZSBJRSBjcmFwcHkgYnJvd3NlcnNcbmlmICggISB3aW5kb3cuY29uc29sZSApIGNvbnNvbGUgPSB7IGxvZzogZnVuY3Rpb24oKXt9IH07XG5cbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBBcHAgZnJvbSAnQXBwJ1xuaW1wb3J0IEFwcE1vYmlsZSBmcm9tICdBcHBNb2JpbGUnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgVHdlZW5NYXggZnJvbSAnZ3NhcCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IE1vYmlsZURldGVjdCBmcm9tICdtb2JpbGUtZGV0ZWN0J1xud2luZG93LmpRdWVyeSA9IHdpbmRvdy4kID0gJFxuXG52YXIgbWQgPSBuZXcgTW9iaWxlRGV0ZWN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuXG5BcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IChtZC5tb2JpbGUoKSB8fCBtZC50YWJsZXQoKSkgPyB0cnVlIDogZmFsc2VcbkFwcFN0b3JlLlBhcmVudCA9ICQoJyNhcHAtY29udGFpbmVyJylcbkFwcFN0b3JlLkRldGVjdG9yLm9sZElFID0gQXBwU3RvcmUuUGFyZW50LmlzKCcuaWU2LCAuaWU3LCAuaWU4JylcbkFwcFN0b3JlLkRldGVjdG9yLmlzU3VwcG9ydFdlYkdMID0gVXRpbHMuU3VwcG9ydFdlYkdMKClcbmlmKEFwcFN0b3JlLkRldGVjdG9yLm9sZElFKSBBcHBTdG9yZS5EZXRlY3Rvci5pc01vYmlsZSA9IHRydWVcblxuLy8gRGVidWdcbi8vIEFwcFN0b3JlLkRldGVjdG9yLmlzTW9iaWxlID0gdHJ1ZVxuXG52YXIgYXBwO1xuaWYoQXBwU3RvcmUuRGV0ZWN0b3IuaXNNb2JpbGUpIHtcblx0JCgnaHRtbCcpLmFkZENsYXNzKCdtb2JpbGUnKVxuXHRhcHAgPSBuZXcgQXBwTW9iaWxlKClcbn1lbHNle1xuXHRhcHAgPSBuZXcgQXBwKClcdFxufSBcblxuYXBwLmluaXQoKVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IEFwcFRlbXBsYXRlIGZyb20gJ0FwcFRlbXBsYXRlJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgR0V2ZW50cyBmcm9tICdHbG9iYWxFdmVudHMnXG5pbXBvcnQgUHJlbG9hZGVyIGZyb20gJ1ByZWxvYWRlcidcblxuY2xhc3MgQXBwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5vbkFwcFJlYWR5ID0gdGhpcy5vbkFwcFJlYWR5LmJpbmQodGhpcylcblx0fVxuXHRpbml0KCkge1xuXHRcdC8vIEluaXQgcm91dGVyXG5cdFx0dGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHR0aGlzLnJvdXRlci5pbml0KClcblxuXHRcdC8vIEluaXQgUHJlbG9hZGVyXG5cdFx0QXBwU3RvcmUuUHJlbG9hZGVyID0gbmV3IFByZWxvYWRlcigpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZSA9IG5ldyBBcHBUZW1wbGF0ZSgpXG5cdFx0YXBwVGVtcGxhdGUuaXNSZWFkeSA9IHRoaXMub25BcHBSZWFkeVxuXHRcdGFwcFRlbXBsYXRlLnJlbmRlcignI2FwcC1jb250YWluZXInKVxuXHR9XG5cdG9uQXBwUmVhZHkoKSB7XG5cdFx0Ly8gU3RhcnQgcm91dGluZ1xuXHRcdHRoaXMucm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwXG4gICAgXHRcbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgQXBwVGVtcGxhdGVNb2JpbGUgZnJvbSAnQXBwVGVtcGxhdGVNb2JpbGUnXG5pbXBvcnQgUm91dGVyIGZyb20gJ1JvdXRlcidcbmltcG9ydCBHRXZlbnRzIGZyb20gJ0dsb2JhbEV2ZW50cydcblxuY2xhc3MgQXBwTW9iaWxlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdCgpIHtcblx0XHQvLyBJbml0IHJvdXRlclxuXHRcdHZhciByb3V0ZXIgPSBuZXcgUm91dGVyKClcblx0XHRyb3V0ZXIuaW5pdCgpXG5cblx0XHQvLyBJbml0IGdsb2JhbCBldmVudHNcblx0XHR3aW5kb3cuR2xvYmFsRXZlbnRzID0gbmV3IEdFdmVudHMoKVxuXHRcdEdsb2JhbEV2ZW50cy5pbml0KClcblxuXHRcdHZhciBhcHBUZW1wbGF0ZU1vYmlsZSA9IG5ldyBBcHBUZW1wbGF0ZU1vYmlsZSgpXG5cdFx0YXBwVGVtcGxhdGVNb2JpbGUucmVuZGVyKCcjYXBwLWNvbnRhaW5lcicpXG5cblx0XHQvLyBTdGFydCByb3V0aW5nXG5cdFx0cm91dGVyLmJlZ2luUm91dGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwTW9iaWxlXG4gICAgXHRcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgUFhDb250YWluZXIgZnJvbSAnUFhDb250YWluZXInXG5cbmNsYXNzIEFwcFRlbXBsYXRlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0XHR0aGlzLmFuaW1hdGUgPSB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKVxuXHR9XG5cdHJlbmRlcihwYXJlbnQpIHtcblx0XHRzdXBlci5yZW5kZXIoJ0FwcFRlbXBsYXRlJywgcGFyZW50LCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudFdpbGxNb3VudCgpXG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5mcm9udENvbnRhaW5lciA9IG5ldyBGcm9udENvbnRhaW5lcigpXG5cdFx0dGhpcy5mcm9udENvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lciA9IG5ldyBQYWdlc0NvbnRhaW5lcigpXG5cdFx0dGhpcy5wYWdlc0NvbnRhaW5lci5yZW5kZXIoJyNhcHAtdGVtcGxhdGUnKVxuXG5cdFx0dGhpcy5weENvbnRhaW5lciA9IG5ldyBQWENvbnRhaW5lcigpXG5cdFx0dGhpcy5weENvbnRhaW5lci5pbml0KCcjYXBwLXRlbXBsYXRlJylcblx0XHRBcHBBY3Rpb25zLnB4Q29udGFpbmVySXNSZWFkeSh0aGlzLnB4Q29udGFpbmVyKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5pc1JlYWR5KClcblx0XHRcdHRoaXMub25SZWFkeSgpXG5cdFx0fSwgMClcblxuXHRcdEdsb2JhbEV2ZW50cy5yZXNpemUoKVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdG9uUmVhZHkoKSB7XG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsIHRoaXMucmVzaXplKVxuXHRcdHRoaXMuYW5pbWF0ZSgpXG5cdH1cblx0YW5pbWF0ZSgpIHtcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlKVxuXHQgICAgdGhpcy5weENvbnRhaW5lci51cGRhdGUoKVxuXHQgICAgdGhpcy5wYWdlc0NvbnRhaW5lci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0dGhpcy5weENvbnRhaW5lci5yZXNpemUoKVxuXHRcdHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHRzdXBlci5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcFRlbXBsYXRlXG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgRnJvbnRDb250YWluZXIgZnJvbSAnRnJvbnRDb250YWluZXInXG5pbXBvcnQgUGFnZXNDb250YWluZXIgZnJvbSAnUGFnZXNDb250YWluZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5cbmNsYXNzIEFwcFRlbXBsYXRlTW9iaWxlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKClcblx0XHR0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcylcblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdBcHBUZW1wbGF0ZU1vYmlsZScsIHBhcmVudCwgdW5kZWZpbmVkKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIgPSBuZXcgRnJvbnRDb250YWluZXIoKVxuXHRcdC8vIHRoaXMuZnJvbnRDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIgPSBuZXcgUGFnZXNDb250YWluZXIoKVxuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVuZGVyKCcjYXBwLXRlbXBsYXRlJylcblxuXHRcdGNvbnNvbGUubG9nKCdtb2JpbGUgeW8nKVxuXG5cdFx0c2V0VGltZW91dCgoKT0+e1xuXHRcdFx0dGhpcy5vblJlYWR5KClcblx0XHR9LCAwKVxuXG5cdFx0R2xvYmFsRXZlbnRzLnJlc2l6ZSgpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0b25SZWFkeSgpIHtcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuV0lORE9XX1JFU0laRSwgdGhpcy5yZXNpemUpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdC8vIHRoaXMucGFnZXNDb250YWluZXIucmVzaXplKClcblx0XHQvLyB0aGlzLmZyb250Q29udGFpbmVyLnJlc2l6ZSgpXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBUZW1wbGF0ZU1vYmlsZVxuXG4iLCJpbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBEaXNwYXRjaGVyIGZyb20gJ0FwcERpc3BhdGNoZXInXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmZ1bmN0aW9uIF9wcm9jZWVkSGFzaGVyQ2hhbmdlQWN0aW9uKHBhZ2VJZCkge1xuICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QQUdFX0hBU0hFUl9DSEFOR0VELFxuICAgICAgICBpdGVtOiBwYWdlSWRcbiAgICB9KSAgXG59XG5cbnZhciBBcHBBY3Rpb25zID0ge1xuICAgIHBhZ2VIYXNoZXJDaGFuZ2VkOiBmdW5jdGlvbihwYWdlSWQpIHtcblxuICAgICAgICB2YXIgbWFuaWZlc3QgPSBBcHBTdG9yZS5wYWdlQXNzZXRzVG9Mb2FkKClcbiAgICAgICAgaWYobWFuaWZlc3QubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgX3Byb2NlZWRIYXNoZXJDaGFuZ2VBY3Rpb24ocGFnZUlkKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vIEFwcFN0b3JlLlBhZ2VzTG9hZGVyLm9wZW4oKVxuICAgICAgICAgICAgQXBwU3RvcmUuUHJlbG9hZGVyLmxvYWQobWFuaWZlc3QsICgpPT57XG4gICAgICAgICAgICAgICAgLy8gQXBwU3RvcmUuUGFnZXNMb2FkZXIuY2xvc2UoKVxuICAgICAgICAgICAgICAgIF9wcm9jZWVkSGFzaGVyQ2hhbmdlQWN0aW9uKHBhZ2VJZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd1Jlc2l6ZTogZnVuY3Rpb24od2luZG93Vywgd2luZG93SCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkUsXG4gICAgICAgICAgICBpdGVtOiB7IHdpbmRvd1c6d2luZG93Vywgd2luZG93SDp3aW5kb3dIIH1cbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHB4Q29udGFpbmVySXNSZWFkeTogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgIEFwcERpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbih7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX0lTX1JFQURZLFxuICAgICAgICAgICAgaXRlbTogY29tcG9uZW50XG4gICAgICAgIH0pICAgICAgICAgICAgXG4gICAgfSxcbiAgICBweEFkZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICBBcHBEaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICAgICAgYWN0aW9uVHlwZTogQXBwQ29uc3RhbnRzLlBYX0NPTlRBSU5FUl9BRERfQ0hJTEQsXG4gICAgICAgICAgICBpdGVtOiBjaGlsZFxuICAgICAgICB9KSAgICAgICAgICAgIFxuICAgIH0sXG4gICAgcHhSZW1vdmVDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgQXBwRGlzcGF0Y2hlci5oYW5kbGVWaWV3QWN0aW9uKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfUkVNT1ZFX0NISUxELFxuICAgICAgICAgICAgaXRlbTogY2hpbGRcbiAgICAgICAgfSkgICAgICAgICAgICBcbiAgICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBBY3Rpb25zXG5cblxuICAgICAgXG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICdCYXNlQ29tcG9uZW50J1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ0Zyb250Q29udGFpbmVyX2hicydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbmltcG9ydCBoZWFkZXJMaW5rcyBmcm9tICdoZWFkZXItbGlua3MnXG5pbXBvcnQgc29jaWFsTGlua3MgZnJvbSAnc29jaWFsLWxpbmtzJ1xuXG5jbGFzcyBGcm9udENvbnRhaW5lciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdH1cblx0cmVuZGVyKHBhcmVudCkge1xuXHRcdHZhciBzY29wZSA9IHt9XG5cdFx0dmFyIGdlbmVyYUluZm9zID0gQXBwU3RvcmUuZ2VuZXJhbEluZm9zKClcblx0XHRzY29wZS5pbmZvcyA9IEFwcFN0b3JlLmdsb2JhbENvbnRlbnQoKVxuXHRcdHNjb3BlLmZhY2Vib29rVXJsID0gZ2VuZXJhSW5mb3NbJ2ZhY2Vib29rX3VybCddXG5cdFx0c2NvcGUudHdpdHRlclVybCA9IGdlbmVyYUluZm9zWyd0d2l0dGVyX3VybCddXG5cdFx0c2NvcGUuaW5zdGFncmFtVXJsID0gZ2VuZXJhSW5mb3NbJ2luc3RhZ3JhbV91cmwnXVxuXHRcdHNjb3BlLmxhYlVybCA9IGdlbmVyYUluZm9zWydsYWJfdXJsJ11cblx0XHRzY29wZS5tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy9tZW4vc2hvZXMvbmV3LWNvbGxlY3Rpb24nXG5cdFx0c2NvcGUud29tZW5TaG9wVXJsID0gJ2h0dHA6Ly93d3cuY2FtcGVyLmNvbS8nK0pTX2xhbmcrJ18nK0pTX2NvdW50cnkrJy93b21lbi9zaG9lcy9uZXctY29sbGVjdGlvbidcblxuXHRcdHN1cGVyLnJlbmRlcignRnJvbnRDb250YWluZXInLCBwYXJlbnQsIHRlbXBsYXRlLCBzY29wZSlcblx0fVxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdHRoaXMuaGVhZGVyTGlua3MgPSBoZWFkZXJMaW5rcyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5zb2NpYWxMaW5rcyA9IHNvY2lhbExpbmtzKHRoaXMuZWxlbWVudClcblxuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblxuXHR9XG5cdHJlc2l6ZSgpIHtcblxuXHRcdGlmKCF0aGlzLmRvbUlzUmVhZHkpIHJldHVyblxuXHRcdHRoaXMuaGVhZGVyTGlua3MucmVzaXplKClcblx0XHR0aGlzLnNvY2lhbExpbmtzLnJlc2l6ZSgpXG5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGcm9udENvbnRhaW5lclxuXG5cbiIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBYQ29udGFpbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0aW5pdChlbGVtZW50SWQpIHtcblx0XHR0aGlzLmNsZWFyQmFjayA9IGZhbHNlXG5cblx0XHR0aGlzLmFkZCA9IHRoaXMuYWRkLmJpbmQodGhpcylcblx0XHR0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQodGhpcylcblxuXHRcdEFwcFN0b3JlLm9uKEFwcENvbnN0YW50cy5QWF9DT05UQUlORVJfQUREX0NISUxELCB0aGlzLmFkZClcblx0XHRBcHBTdG9yZS5vbihBcHBDb25zdGFudHMuUFhfQ09OVEFJTkVSX1JFTU9WRV9DSElMRCwgdGhpcy5yZW1vdmUpXG5cblx0XHR2YXIgcmVuZGVyT3B0aW9ucyA9IHtcblx0XHQgICAgcmVzb2x1dGlvbjogMSxcblx0XHQgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG5cdFx0ICAgIGFudGlhbGlhczogdHJ1ZVxuXHRcdH07XG5cdFx0Ly8gdGhpcy5yZW5kZXJlciA9IG5ldyBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMucmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcigxLCAxLCByZW5kZXJPcHRpb25zKVxuXHRcdHRoaXMuY3VycmVudENvbG9yID0gMHhmZmZmZmZcblx0XHR2YXIgZWwgPSAkKGVsZW1lbnRJZClcblx0XHQkKHRoaXMucmVuZGVyZXIudmlldykuYXR0cignaWQnLCAncHgtY29udGFpbmVyJylcblx0XHRlbC5hcHBlbmQodGhpcy5yZW5kZXJlci52aWV3KVxuXHRcdHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKVxuXHRcdHRoaXMuYmFja2dyb3VuZCA9IG5ldyBQSVhJLkdyYXBoaWNzKClcblx0XHR0aGlzLmRyYXdCYWNrZ3JvdW5kKHRoaXMuY3VycmVudENvbG9yKVxuXHRcdHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5iYWNrZ3JvdW5kKVxuXHR9XG5cdGRyYXdCYWNrZ3JvdW5kKGNvbG9yKSB7XG5cdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93LmhcblxuXHRcdHRoaXMuYmFja2dyb3VuZC5jbGVhcigpXG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmxpbmVTdHlsZSgwKTtcblx0XHR0aGlzLmJhY2tncm91bmQuYmVnaW5GaWxsKGNvbG9yLCAxKTtcblx0XHR0aGlzLmJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgd2luZG93Vywgd2luZG93SCk7XG5cdFx0dGhpcy5iYWNrZ3JvdW5kLmVuZEZpbGwoKTtcblx0fVxuXHRhZGQoY2hpbGQpIHtcblx0XHR0aGlzLnN0YWdlLmFkZENoaWxkKGNoaWxkKVxuXHR9XG5cdHJlbW92ZShjaGlsZCkge1xuXHRcdHRoaXMuc3RhZ2UucmVtb3ZlQ2hpbGQoY2hpbGQpXG5cdH1cblx0dXBkYXRlKCkge1xuXHQgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSlcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0dmFyIHNjYWxlID0gMVxuXHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHR2YXIgd2luZG93SCA9IEFwcFN0b3JlLldpbmRvdy5oXG5cdFx0dGhpcy5yZW5kZXJlci5yZXNpemUod2luZG93VyAqIHNjYWxlLCB3aW5kb3dIICogc2NhbGUpXG5cdFx0dGhpcy5kcmF3QmFja2dyb3VuZCh0aGlzLmN1cnJlbnRDb2xvcilcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VQYWdlIGZyb20gJ0Jhc2VQYWdlJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQgQXBwQWN0aW9ucyBmcm9tICdBcHBBY3Rpb25zJ1xuaW1wb3J0IFB4SGVscGVyIGZyb20gJ1B4SGVscGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYWdlIGV4dGVuZHMgQmFzZVBhZ2Uge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHR0aGlzLnB4Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHNldFRpbWVvdXQoKCk9PnsgQXBwQWN0aW9ucy5weEFkZENoaWxkKHRoaXMucHhDb250YWluZXIpIH0sIDApXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpIHtcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdHNldHVwQW5pbWF0aW9ucygpIHtcblx0XHRzdXBlci5zZXR1cEFuaW1hdGlvbnMoKVxuXHR9XG5cdGdldEltYWdlVXJsQnlJZChpZCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLnByb3BzLmhhc2gudHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSA/ICdob21lLScgKyBpZCA6IHRoaXMucHJvcHMuaGFzaC5wYXJlbnQgKyAnLScgKyB0aGlzLnByb3BzLmhhc2gudGFyZ2V0ICsgJy0nICsgaWRcblx0XHRyZXR1cm4gQXBwU3RvcmUuUHJlbG9hZGVyLmdldEltYWdlVVJMKHVybClcblx0fVxuXHRyZXNpemUoKSB7XG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxuXHR1cGRhdGUoKSB7XG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0UHhIZWxwZXIucmVtb3ZlQ2hpbGRyZW5Gcm9tQ29udGFpbmVyKHRoaXMucHhDb250YWluZXIpXG5cdFx0c2V0VGltZW91dCgoKT0+eyBBcHBBY3Rpb25zLnB4UmVtb3ZlQ2hpbGQodGhpcy5weENvbnRhaW5lcikgfSwgMClcblx0XHRzdXBlci5jb21wb25lbnRXaWxsVW5tb3VudCgpXG5cdH1cbn1cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBCYXNlUGFnZXIgZnJvbSAnQmFzZVBhZ2VyJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5pbXBvcnQgSG9tZSBmcm9tICdIb21lJ1xuaW1wb3J0IEhvbWVUZW1wbGF0ZSBmcm9tICdIb21lX2hicydcbmltcG9ydCBEaXB0eXF1ZSBmcm9tICdEaXB0eXF1ZSdcbmltcG9ydCBEaXB0eXF1ZVRlbXBsYXRlIGZyb20gJ0RpcHR5cXVlX2hicydcblxuY2xhc3MgUGFnZXNDb250YWluZXIgZXh0ZW5kcyBCYXNlUGFnZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5kaWRIYXNoZXJDaGFuZ2UgPSB0aGlzLmRpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpXG5cdFx0QXBwU3RvcmUub24oQXBwQ29uc3RhbnRzLlBBR0VfSEFTSEVSX0NIQU5HRUQsIHRoaXMuZGlkSGFzaGVyQ2hhbmdlKVxuXHR9XG5cdGNvbXBvbmVudFdpbGxNb3VudCgpIHtcblx0XHRzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHRkaWRIYXNoZXJDaGFuZ2UoKSB7XG5cdFx0dmFyIGhhc2ggPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG5cdFx0dmFyIHR5cGUgPSB1bmRlZmluZWRcblx0XHR2YXIgdGVtcGxhdGUgPSB1bmRlZmluZWRcblx0XHRzd2l0Y2goaGFzaC50eXBlKSB7XG5cdFx0XHRjYXNlIEFwcENvbnN0YW50cy5ESVBUWVFVRTpcblx0XHRcdFx0dHlwZSA9IERpcHR5cXVlXG5cdFx0XHRcdHRlbXBsYXRlID0gRGlwdHlxdWVUZW1wbGF0ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBBcHBDb25zdGFudHMuSE9NRTpcblx0XHRcdFx0dHlwZSA9IEhvbWVcblx0XHRcdFx0dGVtcGxhdGUgPSBIb21lVGVtcGxhdGVcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHR5cGUgPSBIb21lXG5cdFx0XHRcdHRlbXBsYXRlID0gSG9tZVRlbXBsYXRlXG5cdFx0fVxuXHRcdHRoaXMuc2V0dXBOZXdDb21wb25lbnQoaGFzaCwgdHlwZSwgdGVtcGxhdGUpXG5cdFx0dGhpcy5jdXJyZW50Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0fVxuXHR1cGRhdGUoKSB7XG5cdFx0aWYodGhpcy5jdXJyZW50Q29tcG9uZW50ICE9IHVuZGVmaW5lZCkgdGhpcy5jdXJyZW50Q29tcG9uZW50LnVwZGF0ZSgpXG5cdH1cblx0cmVzaXplKCkge1xuXHRcdGlmKHRoaXMuY3VycmVudENvbXBvbmVudCAhPSB1bmRlZmluZWQpIHRoaXMuY3VycmVudENvbXBvbmVudC5yZXNpemUoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhZ2VzQ29udGFpbmVyXG5cblxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIGFyb3VuZEJvcmRlciA9IChwYXJlbnQpPT4ge1xuXG5cdHZhciBzY29wZTtcblxuXHR2YXIgJGNvbnRhaW5lciA9IHBhcmVudC5maW5kKCcuYXJvdW5kLWJvcmRlci1jb250YWluZXInKVxuXHR2YXIgdG9wID0gJGNvbnRhaW5lci5maW5kKCcudG9wJykuZ2V0KDApXG5cdHZhciBib3R0b20gPSAkY29udGFpbmVyLmZpbmQoJy5ib3R0b20nKS5nZXQoMClcblx0dmFyIGxlZnQgPSAkY29udGFpbmVyLmZpbmQoJy5sZWZ0JykuZ2V0KDApXG5cdHZhciByaWdodCA9ICRjb250YWluZXIuZmluZCgnLnJpZ2h0JykuZ2V0KDApXG5cdHZhciBsZWZ0U3RlcFRvcCA9ICRjb250YWluZXIuZmluZCgnLmxlZnQtc3RlcC10b3AnKS5nZXQoMClcblx0dmFyIGxlZnRTdGVwQm90dG9tID0gJGNvbnRhaW5lci5maW5kKCcubGVmdC1zdGVwLWJvdHRvbScpLmdldCgwKVxuXHR2YXIgcmlnaHRTdGVwVG9wID0gJGNvbnRhaW5lci5maW5kKCcucmlnaHQtc3RlcC10b3AnKS5nZXQoMClcblx0dmFyIHJpZ2h0U3RlcEJvdHRvbSA9ICRjb250YWluZXIuZmluZCgnLnJpZ2h0LXN0ZXAtYm90dG9tJykuZ2V0KDApXG5cblx0dmFyICRsZXR0ZXJzQ29udGFpbmVyID0gcGFyZW50LmZpbmQoXCIuYXJvdW5kLWJvcmRlci1sZXR0ZXJzLWNvbnRhaW5lclwiKVxuXHR2YXIgdG9wTGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoXCIudG9wXCIpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIGJvdHRvbUxldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKFwiLmJvdHRvbVwiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsZWZ0TGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoXCIubGVmdFwiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciByaWdodExldHRlcnMgPSAkbGV0dGVyc0NvbnRhaW5lci5maW5kKFwiLnJpZ2h0XCIpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIGxlZnRTdGVwVG9wTGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoJy5sZWZ0LXN0ZXAtdG9wJykuY2hpbGRyZW4oKS5nZXQoKVxuXHR2YXIgbGVmdFN0ZXBCb3R0b21MZXR0ZXJzID0gJGxldHRlcnNDb250YWluZXIuZmluZCgnLmxlZnQtc3RlcC1ib3R0b20nKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciByaWdodFN0ZXBUb3BMZXR0ZXJzID0gJGxldHRlcnNDb250YWluZXIuZmluZCgnLnJpZ2h0LXN0ZXAtdG9wJykuY2hpbGRyZW4oKS5nZXQoKVxuXHR2YXIgcmlnaHRTdGVwQm90dG9tTGV0dGVycyA9ICRsZXR0ZXJzQ29udGFpbmVyLmZpbmQoJy5yaWdodC1zdGVwLWJvdHRvbScpLmNoaWxkcmVuKCkuZ2V0KClcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIGJvcmRlclNpemUgPSAxMFxuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TIF1cblxuXHRcdFx0dG9wLnN0eWxlLndpZHRoID0gd2luZG93VyArICdweCdcblx0XHRcdGJvdHRvbS5zdHlsZS53aWR0aCA9IGJsb2NrU2l6ZVswXSAqIDMgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUudG9wID0gd2luZG93SCAtIGJvcmRlclNpemUgKyAncHgnXG5cdFx0XHRib3R0b20uc3R5bGUubGVmdCA9IGJsb2NrU2l6ZVswXSAqIDIgKyAncHgnXG5cdFx0XHRsZWZ0LnN0eWxlLmhlaWdodCA9IHJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHRyaWdodC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIGJvcmRlclNpemUgKyAncHgnXG5cblx0XHRcdGxlZnRTdGVwVG9wLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRcdGxlZnRTdGVwVG9wLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHRsZWZ0U3RlcEJvdHRvbS5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHRsZWZ0U3RlcEJvdHRvbS5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSAqIDIpIC0gYm9yZGVyU2l6ZSArIDEgKyAncHgnXG5cdFx0XHRsZWZ0U3RlcEJvdHRvbS5zdHlsZS50b3AgPSB3aW5kb3dIIC0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXG5cdFx0XHRyaWdodFN0ZXBUb3Auc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdFx0cmlnaHRTdGVwVG9wLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0XHRyaWdodFN0ZXBUb3Auc3R5bGUubGVmdCA9IHdpbmRvd1cgLSAoYmxvY2tTaXplWzBdICogMikgKyAncHgnXG5cdFx0XHRyaWdodFN0ZXBCb3R0b20uc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdFx0cmlnaHRTdGVwQm90dG9tLnN0eWxlLmxlZnQgPSB3aW5kb3dXIC0gKGJsb2NrU2l6ZVswXSAqIDIpICsgJ3B4J1xuXHRcdFx0cmlnaHRTdGVwQm90dG9tLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgdGwgPSB0b3BMZXR0ZXJzW2ldXG5cdFx0XHRcdHRsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJvdHRvbUxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGJsID0gYm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRibC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA8PCAxKSArIChibG9ja1NpemVbMF0gPj4gMSkgKyAoYmxvY2tTaXplWzBdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRibC5zdHlsZS50b3AgPSB3aW5kb3dIIC0gMTAgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0TGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgbGwgPSBsZWZ0TGV0dGVyc1tpXVxuXHRcdFx0XHRsbC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdID4+IDEpICsgKGJsb2NrU2l6ZVsxXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0bGwuc3R5bGUubGVmdCA9IDIgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHJsID0gcmlnaHRMZXR0ZXJzW2ldXG5cdFx0XHRcdHJsLnN0eWxlLnRvcCA9IChibG9ja1NpemVbMV0gPj4gMSkgKyAoYmxvY2tTaXplWzFdICogaSkgLSAyICsgJ3B4J1xuXHRcdFx0XHRybC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIDggKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0U3RlcFRvcExldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGxzdGwgPSBsZWZ0U3RlcFRvcExldHRlcnNbaV1cblx0XHRcdFx0bHN0bC5zdHlsZS5sZWZ0ID0gKGJsb2NrU2l6ZVswXSA+PiAxKSArIChibG9ja1NpemVbMF0gKiBpKSAtIDIgKyAncHgnXG5cdFx0XHRcdGxzdGwuc3R5bGUudG9wID0gKGJsb2NrU2l6ZVsxXSAqIDMpICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVmdFN0ZXBCb3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBsc2JsID0gbGVmdFN0ZXBCb3R0b21MZXR0ZXJzW2ldXG5cdFx0XHRcdGxzYmwuc3R5bGUubGVmdCA9IChibG9ja1NpemVbMF0gKiAyKSAtIDggKyAncHgnXG5cdFx0XHRcdGxzYmwuc3R5bGUudG9wID0gd2luZG93SCAtIChibG9ja1NpemVbMV0gPj4gMSkgLSAyICsgJ3B4J1xuXHRcdFx0fTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmlnaHRTdGVwVG9wTGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcnN0bCA9IHJpZ2h0U3RlcFRvcExldHRlcnNbaV1cblx0XHRcdFx0cnN0bC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIChibG9ja1NpemVbMF0gPDwgMSkgKyAoYmxvY2tTaXplWzBdID4+IDEpICsgKGJsb2NrU2l6ZVswXSAqIGkpIC0gMiArICdweCdcblx0XHRcdFx0cnN0bC5zdHlsZS50b3AgPSAoYmxvY2tTaXplWzFdICogMykgKyAncHgnXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByaWdodFN0ZXBCb3R0b21MZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciByc2JsID0gcmlnaHRTdGVwQm90dG9tTGV0dGVyc1tpXVxuXHRcdFx0XHRyc2JsLnN0eWxlLmxlZnQgPSAoYmxvY2tTaXplWzBdICogNSkgKyAyICsgJ3B4J1xuXHRcdFx0XHRyc2JsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSAoYmxvY2tTaXplWzFdID4+IDEpIC0gMiArICdweCdcblx0XHRcdH07XG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBhcm91bmRCb3JkZXIiLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIGJvdHRvbVRleHRzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgYm90dG9tVGV4dHNDb250YWluZXIgPSBwYXJlbnQuZmluZChcIi5ib3R0b20tdGV4dHMtY29udGFpbmVyXCIpXG5cdHZhciBsZWZ0Qm90dG9tVGV4dCA9IGJvdHRvbVRleHRzQ29udGFpbmVyLmZpbmQoJy5sZWZ0LXRleHQnKVxuXHR2YXIgcmlnaHRCb3R0b21UZXh0ID0gYm90dG9tVGV4dHNDb250YWluZXIuZmluZCgnLnJpZ2h0LXRleHQnKVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIGJsb2NrU2l6ZSA9IFsgd2luZG93VyAvIEFwcENvbnN0YW50cy5HUklEX1JPV1MsIHdpbmRvd0ggLyBBcHBDb25zdGFudHMuR1JJRF9DT0xVTU5TIF1cblxuXHRcdHNjb3BlLmxlZnQuZWwuc3R5bGUud2lkdGggPSBibG9ja1NpemVbMF0gKiAyICsgJ3B4J1xuXHRcdHNjb3BlLmxlZnQuZWwuc3R5bGUuaGVpZ2h0ID0gYmxvY2tTaXplWzFdICsgJ3B4J1xuXHRcdHNjb3BlLnJpZ2h0LmVsLnN0eWxlLndpZHRoID0gYmxvY2tTaXplWzBdICogMiArICdweCdcblx0XHRzY29wZS5yaWdodC5lbC5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbMV0gKyAncHgnXG5cblx0XHRzY29wZS5sZWZ0LmVsLnN0eWxlLnRvcCA9IHdpbmRvd0ggLSBibG9ja1NpemVbMV0gKyAncHgnXG5cdFx0c2NvcGUucmlnaHQuZWwuc3R5bGUudG9wID0gd2luZG93SCAtIGJsb2NrU2l6ZVsxXSArICdweCdcblx0XHRzY29wZS5yaWdodC5lbC5zdHlsZS5sZWZ0ID0gd2luZG93VyAtIChibG9ja1NpemVbMF0gKiAyKSArICdweCdcblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGxlZnQ6IHtcblx0XHRcdGVsOiBsZWZ0Qm90dG9tVGV4dC5nZXQoMCksXG5cdFx0XHRmcm9udDogbGVmdEJvdHRvbVRleHQuZmluZCgnLmZyb250LXdyYXBwZXInKS5nZXQoMCksXG5cdFx0XHRiYWNrZ3JvdW5kOiBsZWZ0Qm90dG9tVGV4dC5maW5kKCcuYmFja2dyb3VuZCcpLmdldCgwKVxuXHRcdH0sXG5cdFx0cmlnaHQ6IHtcblx0XHRcdGVsOiByaWdodEJvdHRvbVRleHQuZ2V0KDApLFxuXHRcdFx0ZnJvbnQ6IHJpZ2h0Qm90dG9tVGV4dC5maW5kKCcuZnJvbnQtd3JhcHBlcicpLmdldCgwKSxcblx0XHRcdGJhY2tncm91bmQ6IHJpZ2h0Qm90dG9tVGV4dC5maW5kKCcuYmFja2dyb3VuZCcpLmdldCgwKVxuXHRcdH0sXG5cdFx0cmVzaXplOiByZXNpemVcblx0fVxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBib3R0b21UZXh0cyIsImltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCB2aWRlb0NhbnZhcyBmcm9tICd2aWRlby1jYW52YXMnXG5pbXBvcnQgVXRpbHMgZnJvbSAnVXRpbHMnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIGdyaWQgPSAocHJvcHMsIHBhcmVudCwgb25JdGVtRW5kZWQpPT4ge1xuXG5cdHZhciB2aWRlb0VuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciBpbWFnZUVuZGVkID0gKGl0ZW0pPT4ge1xuXHRcdG9uSXRlbUVuZGVkKGl0ZW0pXG5cdFx0c2NvcGUudHJhbnNpdGlvbk91dEl0ZW0oaXRlbSlcblx0fVxuXG5cdHZhciAkZ3JpZENvbnRhaW5lciA9IHBhcmVudC5maW5kKFwiLmdyaWQtY29udGFpbmVyXCIpXG5cdHZhciBncmlkQ2hpbGRyZW4gPSAkZ3JpZENvbnRhaW5lci5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsaW5lc0hvcml6b250YWwgPSBwYXJlbnQuZmluZChcIi5saW5lcy1ncmlkLWNvbnRhaW5lciAuaG9yaXpvbnRhbC1saW5lc1wiKS5jaGlsZHJlbigpLmdldCgpXG5cdHZhciBsaW5lc1ZlcnRpY2FsID0gcGFyZW50LmZpbmQoXCIubGluZXMtZ3JpZC1jb250YWluZXIgLnZlcnRpY2FsLWxpbmVzXCIpLmNoaWxkcmVuKCkuZ2V0KClcblx0dmFyIHNjb3BlO1xuXHR2YXIgY3VycmVudFNlYXQ7XG5cdHZhciBpdGVtcyA9IFtdXG5cdHZhciB0b3RhbE51bSA9IHByb3BzLmRhdGEuZ3JpZC5sZW5ndGhcblx0dmFyIHZpZGVvcyA9IEFwcFN0b3JlLmdldEhvbWVWaWRlb3MoKVxuXG5cdHZhciB2Q2FudmFzUHJvcHMgPSB7XG5cdFx0YXV0b3BsYXk6IGZhbHNlLFxuXHRcdHZvbHVtZTogMCxcblx0XHRsb29wOiBmYWxzZSxcblx0XHRvbkVuZGVkOiB2aWRlb0VuZGVkXG5cdH1cblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTnVtOyBpKyspIHtcblx0XHR2YXIgdlBhcmVudCA9IGdyaWRDaGlsZHJlbltpXVxuXHRcdHZhciB2aWRlb0luZGV4ID0gaSAlIHZpZGVvcy5sZW5ndGhcblx0XHR2YXIgdkNhbnZhcyA9IHZpZGVvQ2FudmFzKCB2aWRlb3NbdmlkZW9JbmRleF0sIHZDYW52YXNQcm9wcyApXG5cdFx0dlBhcmVudC5hcHBlbmRDaGlsZCh2Q2FudmFzLmNhbnZhcylcblx0XHRpdGVtc1tpXSA9IHZDYW52YXNcblx0fVxuXG5cdHZhciByZXNpemUgPSAoKT0+IHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXG5cdFx0dmFyIG9yaWdpbmFsVmlkZW9TaXplID0gQXBwQ29uc3RhbnRzLkhPTUVfVklERU9fU0laRVxuXHRcdHZhciBibG9ja1NpemUgPSBbIHdpbmRvd1cgLyBBcHBDb25zdGFudHMuR1JJRF9ST1dTLCB3aW5kb3dIIC8gQXBwQ29uc3RhbnRzLkdSSURfQ09MVU1OUyBdXG5cblx0XHR2YXIgcmVzaXplVmFycyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkoYmxvY2tTaXplWzBdLCBibG9ja1NpemVbMV0sIG9yaWdpbmFsVmlkZW9TaXplWzBdLCBvcmlnaW5hbFZpZGVvU2l6ZVsxXSlcblxuXHRcdHZhciBwb3MgPSBbIDAsIDAgXVxuXHRcdHZhciBob3Jpem9udGFsTGluZXNJbmRleCA9IDBcblx0XHR2YXIgdmVydGljYWxMaW5lc0luZGV4ID0gMFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NvcGUubnVtOyBpKyspIHtcblx0XHRcdHZhciBpdGVtID0gc2NvcGUuaXRlbXNbaV1cblx0XHRcdHZhciBwYXJlbnQgPSBzY29wZS5jaGlsZHJlbltpXVxuXG5cdFx0XHRwYXJlbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0XHRwYXJlbnQuc3R5bGUud2lkdGggPSBibG9ja1NpemVbIDAgXSArICdweCdcblx0XHRcdHBhcmVudC5zdHlsZS5oZWlnaHQgPSBibG9ja1NpemVbIDEgXSArICdweCdcblx0XHRcdHBhcmVudC5zdHlsZS5sZWZ0ID0gcG9zWyAwIF0gKyAncHgnXG5cdFx0XHRwYXJlbnQuc3R5bGUudG9wID0gcG9zWyAxIF0gKyAncHgnXG5cdFx0XHRcblx0XHRcdGl0ZW0uY2FudmFzLndpZHRoID0gYmxvY2tTaXplWyAwIF1cblx0XHRcdGl0ZW0uY2FudmFzLmhlaWdodCA9IGJsb2NrU2l6ZVsgMSBdXG5cdFx0XHRpdGVtLnJlc2l6ZShyZXNpemVWYXJzLmxlZnQsIHJlc2l6ZVZhcnMudG9wLCByZXNpemVWYXJzLndpZHRoLCByZXNpemVWYXJzLmhlaWdodClcblx0XHRcdGl0ZW0uZHJhd09uY2UoKVxuXHRcdFx0XG5cdFx0XHRpZihpID4gMCkge1xuXHRcdFx0XHR2YXIgdmwgPSBzY29wZS5saW5lcy52ZXJ0aWNhbFt2ZXJ0aWNhbExpbmVzSW5kZXhdXG5cdFx0XHRcdGlmKHZsKSB2bC5zdHlsZS5sZWZ0ID0gcG9zWyAwIF0gKyAncHgnXG5cdFx0XHRcdHZlcnRpY2FsTGluZXNJbmRleCArPSAxXG5cdFx0XHR9XG5cblx0XHRcdC8vIHBvc2l0aW9uc1xuXHRcdFx0c2NvcGUucG9zaXRpb25zWyBpIF0gPSBbIHBvc1sgMCBdLCBwb3NbIDEgXSBdXG5cdFx0XHRwb3NbIDAgXSArPSBibG9ja1NpemVbIDAgXVxuXHRcdFx0aWYoIHBvc1sgMCBdID4gd2luZG93VyAtIChibG9ja1NpemVbIDAgXSA+PiAxKSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHBvc1sgMSBdICs9IGJsb2NrU2l6ZVsgMSBdXG5cdFx0XHRcdHBvc1sgMCBdID0gMFxuXG5cdFx0XHRcdHZhciBobCA9IHNjb3BlLmxpbmVzLmhvcml6b250YWxbaG9yaXpvbnRhbExpbmVzSW5kZXhdXG5cdFx0XHRcdGlmKGhsKSBobC5zdHlsZS50b3AgPSBwb3NbIDEgXSArICdweCdcblx0XHRcdFx0aG9yaXpvbnRhbExpbmVzSW5kZXggKz0gMVxuXHRcdFx0fVxuXHRcdH07XG5cblx0fVxuXG5cdHNjb3BlID0ge1xuXHRcdGVsOiAkZ3JpZENvbnRhaW5lcixcblx0XHRjaGlsZHJlbjogZ3JpZENoaWxkcmVuLFxuXHRcdGl0ZW1zOiBpdGVtcyxcblx0XHRudW06IHRvdGFsTnVtLFxuXHRcdHBvc2l0aW9uczogW10sXG5cdFx0bGluZXM6IHtcblx0XHRcdGhvcml6b250YWw6IGxpbmVzSG9yaXpvbnRhbCxcblx0XHRcdHZlcnRpY2FsOiBsaW5lc1ZlcnRpY2FsXG5cdFx0fSxcblx0XHRyZXNpemU6IHJlc2l6ZSxcblx0XHR0cmFuc2l0aW9uSW5JdGVtOiAoaW5kZXgsIHR5cGUpPT4ge1xuXHRcdFx0dmFyIGl0ZW0gPSBzY29wZS5pdGVtc1tpbmRleF1cblx0XHRcdGl0ZW0uc2VhdCA9IGluZGV4XG5cblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2VuYWJsZScpXG5cdFx0XHRcblx0XHRcdGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLklURU1fVklERU8pIHtcblx0XHRcdFx0aXRlbS5wbGF5KClcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRpdGVtLnRpbWVvdXQoaW1hZ2VFbmRlZCwgNDAwMClcblx0XHRcdFx0aXRlbS5zZWVrKFV0aWxzLlJhbmQoMiwgMTAsIDApKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJhbnNpdGlvbk91dEl0ZW06IChpdGVtKT0+IHtcblx0XHRcdGl0ZW0uY2FudmFzLmNsYXNzTGlzdC5yZW1vdmUoJ2VuYWJsZScpXG5cblx0XHRcdGl0ZW0udmlkZW8uY3VycmVudFRpbWUgPSAwXG5cdFx0XHRpdGVtLnBhdXNlKClcblx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0aXRlbS5kcmF3T25jZSgpXG5cdFx0XHR9LCA1MDApXG5cdFx0fVxuXHR9IFxuXG5cdHJldHVybiBzY29wZVxufVxuXG5leHBvcnQgZGVmYXVsdCBncmlkIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5cbnZhciBoZWFkZXJMaW5rcyA9IChwYXJlbnQpPT4ge1xuXHR2YXIgc2NvcGU7XG5cblx0dmFyIG9uU3ViTWVudU1vdXNlRW50ZXIgPSAoZSk9PiB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0dmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldClcblx0XHQkdGFyZ2V0LmFkZENsYXNzKCdob3ZlcmVkJylcblx0fVxuXHR2YXIgb25TdWJNZW51TW91c2VMZWF2ZSA9IChlKT0+IHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHR2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXHRcdCR0YXJnZXQucmVtb3ZlQ2xhc3MoJ2hvdmVyZWQnKVxuXHR9XG5cblx0dmFyIGNhbXBlckxhYkVsID0gcGFyZW50LmZpbmQoJy5jYW1wZXItbGFiJykuZ2V0KDApXG5cdHZhciBzaG9wRWwgPSBwYXJlbnQuZmluZCgnLnNob3Atd3JhcHBlcicpLmdldCgwKVxuXHR2YXIgbWFwRWwgPSBwYXJlbnQuZmluZCgnLm1hcC1idG4nKS5nZXQoMClcblxuXHRzaG9wRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uU3ViTWVudU1vdXNlRW50ZXIpXG5cdHNob3BFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25TdWJNZW51TW91c2VMZWF2ZSlcblxuXHRzY29wZSA9IHtcblx0XHRyZXNpemU6ICgpPT4ge1xuXHRcdFx0dmFyIHdpbmRvd1cgPSBBcHBTdG9yZS5XaW5kb3cud1xuXHRcdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFx0dmFyIHBhZGRpbmcgPSBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQgLyAzXG5cblx0XHRcdHZhciBjYW1wZXJMYWJDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSAoQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC42KSAtIHBhZGRpbmcgLSAkKGNhbXBlckxhYkVsKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IEFwcENvbnN0YW50cy5QQURESU5HX0FST1VORCxcblx0XHRcdH1cblx0XHRcdHZhciBzaG9wQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBjYW1wZXJMYWJDc3MubGVmdCAtICQoc2hvcEVsKS53aWR0aCgpIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cdFx0XHR2YXIgbWFwQ3NzID0ge1xuXHRcdFx0XHRsZWZ0OiBzaG9wQ3NzLmxlZnQgLSAkKG1hcEVsKS53aWR0aCgpIC0gcGFkZGluZyxcblx0XHRcdFx0dG9wOiBBcHBDb25zdGFudHMuUEFERElOR19BUk9VTkQsXG5cdFx0XHR9XG5cblx0XHRcdGNhbXBlckxhYkVsLnN0eWxlLmxlZnQgPSBjYW1wZXJMYWJDc3MubGVmdCArICdweCdcblx0XHRcdGNhbXBlckxhYkVsLnN0eWxlLnRvcCA9IGNhbXBlckxhYkNzcy50b3AgKyAncHgnXG5cdFx0XHRzaG9wRWwuc3R5bGUubGVmdCA9IHNob3BDc3MubGVmdCArICdweCdcblx0XHRcdHNob3BFbC5zdHlsZS50b3AgPSBzaG9wQ3NzLnRvcCArICdweCdcblx0XHRcdG1hcEVsLnN0eWxlLmxlZnQgPSBtYXBDc3MubGVmdCArICdweCdcblx0XHRcdG1hcEVsLnN0eWxlLnRvcCA9IG1hcENzcy50b3AgKyAncHgnXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhlYWRlckxpbmtzIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlwdHlxdWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcylcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblxuXHRcdGNvbnNvbGUubG9nKHRoaXMuZ2V0SW1hZ2VVcmxCeUlkKCdzaG9lJykpXG5cblx0XHRzdXBlci5jb21wb25lbnREaWRNb3VudCgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0c3VwZXIuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKVxuXHR9XG5cdGRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpIHtcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdHN1cGVyLnJlc2l6ZSgpXG5cdH1cbn1cblxuIiwiaW1wb3J0IFBhZ2UgZnJvbSAnUGFnZSdcbmltcG9ydCBBcHBTdG9yZSBmcm9tICdBcHBTdG9yZSdcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCBib3R0b21UZXh0cyBmcm9tICdib3R0b20tdGV4dHMtaG9tZSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuaW1wb3J0IGdyaWQgZnJvbSAnZ3JpZC1ob21lJ1xuaW1wb3J0IGFyb3VuZEJvcmRlciBmcm9tICdhcm91bmQtYm9yZGVyLWhvbWUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWUgZXh0ZW5kcyBQYWdlIHtcblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRwcm9wcy5kYXRhLmdyaWQgPSBbXVxuXHRcdHByb3BzLmRhdGEuZ3JpZC5sZW5ndGggPSAyOFxuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXSA9IHsgaG9yaXpvbnRhbDogW10sIHZlcnRpY2FsOiBbXSB9XG5cdFx0cHJvcHMuZGF0YVsnbGluZXMtZ3JpZCddLmhvcml6b250YWwubGVuZ3RoID0gM1xuXHRcdHByb3BzLmRhdGFbJ2xpbmVzLWdyaWQnXS52ZXJ0aWNhbC5sZW5ndGggPSA2XG5cdFx0c3VwZXIocHJvcHMpXG5cdFx0dmFyIGJnVXJsID0gdGhpcy5nZXRJbWFnZVVybEJ5SWQoJ2JhY2tncm91bmQnKVxuXHRcdHRoaXMucHJvcHMuZGF0YS5iZ3VybCA9IGJnVXJsXG5cblx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtID0gdGhpcy50cmlnZ2VyTmV3SXRlbS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5vbkl0ZW1FbmRlZCA9IHRoaXMub25JdGVtRW5kZWQuYmluZCh0aGlzKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubGFzdEdyaWRJdGVtSW5kZXg7XG5cdFx0dGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID0gMjAwXG5cdFx0dGhpcy5pbWFnZVRyaWdnZXJDb3VudGVyID0gMFxuXG5cdFx0dGhpcy5zZWF0cyA9IFtcblx0XHRcdDEsIDIsIDMsIDQsIDUsXG5cdFx0XHQ3LCA4LCAxMiwgMTMsXG5cdFx0XHQxNSwgMTYsIDE5LCAyMCxcblx0XHRcdDIzLCAyNCwgMjVcblx0XHRdXG5cblx0XHR0aGlzLnVzZWRTZWF0cyA9IFtdXG5cblx0XHR0aGlzLmJnID0gdGhpcy5lbGVtZW50LmZpbmQoXCIuYmctd3JhcHBlclwiKS5nZXQoMClcblxuXHRcdHRoaXMuZ3JpZCA9IGdyaWQodGhpcy5wcm9wcywgdGhpcy5lbGVtZW50LCB0aGlzLm9uSXRlbUVuZGVkKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMgPSBib3R0b21UZXh0cyh0aGlzLmVsZW1lbnQpXG5cdFx0dGhpcy5hcm91bmRCb3JkZXIgPSBhcm91bmRCb3JkZXIodGhpcy5lbGVtZW50KVxuXG5cdFx0c3VwZXIuY29tcG9uZW50RGlkTW91bnQoKVxuXHR9XG5cdHRyaWdnZXJOZXdJdGVtKHR5cGUpIHtcblx0XHR2YXIgaW5kZXggPSB0aGlzLnNlYXRzW1V0aWxzLlJhbmQoMCwgdGhpcy5zZWF0cy5sZW5ndGggLSAxLCAwKV1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXNlZFNlYXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZihzZWF0ID09IGluZGV4KSB7XG5cdFx0XHRcdGlmKHRoaXMudXNlZFNlYXRzLmxlbmd0aCA8IHRoaXMuc2VhdHMubGVuZ3RoIC0gMikgdGhpcy50cmlnZ2VyTmV3SXRlbSh0eXBlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMudXNlZFNlYXRzLnB1c2goaW5kZXgpXG5cdFx0dGhpcy5ncmlkLnRyYW5zaXRpb25Jbkl0ZW0oaW5kZXgsIHR5cGUpXG5cdH1cblx0b25JdGVtRW5kZWQoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy51c2VkU2VhdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB1c2VkU2VhdCA9IHRoaXMudXNlZFNlYXRzW2ldXG5cdFx0XHRpZih1c2VkU2VhdCA9PSBpdGVtLnNlYXQpIHtcblx0XHRcdFx0dGhpcy51c2VkU2VhdHMuc3BsaWNlKGksIDEpXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpIHtcblx0XHRzdXBlci5kaWRUcmFuc2l0aW9uSW5Db21wbGV0ZSgpXG5cdH1cblx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdHN1cGVyLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMudmlkZW9UcmlnZ2VyQ291bnRlciArPSAxXG5cdFx0aWYodGhpcy52aWRlb1RyaWdnZXJDb3VudGVyID4gMzAwKSB7XG5cdFx0XHR0aGlzLnZpZGVvVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX1ZJREVPKVxuXHRcdH1cblx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgKz0gMVxuXHRcdGlmKHRoaXMuaW1hZ2VUcmlnZ2VyQ291bnRlciA+IDQwKSB7XG5cdFx0XHR0aGlzLmltYWdlVHJpZ2dlckNvdW50ZXIgPSAwXG5cdFx0XHR0aGlzLnRyaWdnZXJOZXdJdGVtKEFwcENvbnN0YW50cy5JVEVNX0lNQUdFKVxuXHRcdH1cblx0XHRzdXBlci51cGRhdGUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHR2YXIgd2luZG93VyA9IEFwcFN0b3JlLldpbmRvdy53XG5cdFx0dmFyIHdpbmRvd0ggPSBBcHBTdG9yZS5XaW5kb3cuaFxuXHRcdFxuXHRcdHRoaXMuZ3JpZC5yZXNpemUoKVxuXHRcdHRoaXMuYm90dG9tVGV4dHMucmVzaXplKClcblx0XHR0aGlzLmFyb3VuZEJvcmRlci5yZXNpemUoKVxuXG5cdFx0dmFyIHJlc2l6ZVZhcnNCZyA9IFV0aWxzLlJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgQXBwQ29uc3RhbnRzLk1FRElBX0dMT0JBTF9XLCBBcHBDb25zdGFudHMuTUVESUFfR0xPQkFMX0gpXG5cblx0XHQvLyBiZ1xuXHRcdHRoaXMuYmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0dGhpcy5iZy5zdHlsZS53aWR0aCA9IHJlc2l6ZVZhcnNCZy53aWR0aCArICdweCdcblx0XHR0aGlzLmJnLnN0eWxlLmhlaWdodCA9IHJlc2l6ZVZhcnNCZy5oZWlnaHQgKyAncHgnXG5cdFx0dGhpcy5iZy5zdHlsZS50b3AgPSByZXNpemVWYXJzQmcudG9wICsgJ3B4J1xuXHRcdHRoaXMuYmcuc3R5bGUubGVmdCA9IHJlc2l6ZVZhcnNCZy5sZWZ0ICsgJ3B4J1xuXG5cdFx0c3VwZXIucmVzaXplKClcblx0fVxufVxuXG4iLCJpbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJ0FwcENvbnN0YW50cydcblxudmFyIHNvY2lhbExpbmtzID0gKHBhcmVudCk9PiB7XG5cblx0dmFyIHNjb3BlO1xuXHR2YXIgd3JhcHBlciA9IHBhcmVudC5maW5kKFwiI2Zvb3RlciAjc29jaWFsLXdyYXBwZXJcIikuZ2V0KDApXG5cblx0c2NvcGUgPSB7XG5cdFx0cmVzaXplOiAoKT0+IHtcblx0XHRcdHZhciB3aW5kb3dXID0gQXBwU3RvcmUuV2luZG93Lndcblx0XHRcdHZhciB3aW5kb3dIID0gQXBwU3RvcmUuV2luZG93Lmhcblx0XHRcdHZhciBwYWRkaW5nID0gQXBwQ29uc3RhbnRzLlBBRERJTkdfQVJPVU5EICogMC40XG5cblx0XHRcdHZhciBzb2NpYWxDc3MgPSB7XG5cdFx0XHRcdGxlZnQ6IHdpbmRvd1cgLSBwYWRkaW5nIC0gJCh3cmFwcGVyKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IHdpbmRvd0ggLSBwYWRkaW5nIC0gJCh3cmFwcGVyKS5oZWlnaHQoKSxcblx0XHRcdH1cblxuXHRcdFx0d3JhcHBlci5zdHlsZS5sZWZ0ID0gc29jaWFsQ3NzLmxlZnQgKyAncHgnXG5cdFx0XHR3cmFwcGVyLnN0eWxlLnRvcCA9IHNvY2lhbENzcy50b3AgKyAncHgnXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNjb3BlXG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvY2lhbExpbmtzIiwiXG52YXIgdmlkZW9DYW52YXMgPSAoIHNyYywgcHJvcHMgKT0+IHtcblxuXHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0dmFyIHZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0dmFyIGludGVydmFsSWQ7XG5cdHZhciBkeCA9IDAsIGR5ID0gMCwgZFdpZHRoID0gMCwgZEhlaWdodCA9IDA7XG5cdHZhciBpc1BsYXlpbmcgPSBwcm9wcy5hdXRvcGxheSB8fCBmYWxzZVxuXHR2YXIgc2NvcGU7XG5cblx0dmFyIG9uQ2FuUGxheSA9ICgpPT57XG5cdFx0aWYocHJvcHMuYXV0b3BsYXkpIHZpZGVvLnBsYXkoKVxuXHRcdGlmKHByb3BzLnZvbHVtZSAhPSB1bmRlZmluZWQpIHZpZGVvLnZvbHVtZSA9IHByb3BzLnZvbHVtZVxuXHRcdGlmKGRXaWR0aCA9PSAwKSBkV2lkdGggPSB2aWRlby52aWRlb1dpZHRoXG5cdFx0aWYoZEhlaWdodCA9PSAwKSBkSGVpZ2h0ID0gdmlkZW8udmlkZW9IZWlnaHRcblx0XHRpZihpc1BsYXlpbmcgIT0gdHJ1ZSkgZHJhd09uY2UoKVxuXHRcdHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIG9uQ2FuUGxheSk7XG5cdH1cblxuXHR2YXIgZHJhd09uY2UgPSAoKT0+IHtcblx0XHRjdHguZHJhd0ltYWdlKHZpZGVvLCBkeCwgZHksIGRXaWR0aCwgZEhlaWdodClcblx0fVxuXG4gICAgdmFyIGRyYXcgPSAoKT0+e1xuICAgIFx0Y3R4LmRyYXdJbWFnZSh2aWRlbywgZHgsIGR5LCBkV2lkdGgsIGRIZWlnaHQpXG4gICAgfVxuXG4gICAgdmFyIHBsYXkgPSAoKT0+e1xuICAgIFx0aXNQbGF5aW5nID0gdHJ1ZVxuICAgIFx0dmlkZW8ucGxheSgpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgXHRpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoZHJhdywgMTAwMCAvIDMwKVxuICAgIH1cblxuICAgIHZhciBzZWVrID0gKHRpbWUpPT4ge1xuICAgIFx0dmlkZW8uY3VycmVudFRpbWUgPSB0aW1lXG4gICAgXHRkcmF3T25jZSgpXG4gICAgfVxuXG4gICAgdmFyIHRpbWVvdXQgPSAoY2IsIG1zKT0+IHtcbiAgICBcdHNldFRpbWVvdXQoKCk9PiB7XG4gICAgXHRcdGNiKHNjb3BlKVxuICAgIFx0fSwgbXMpXG4gICAgfVxuXG4gICAgdmFyIHBhdXNlID0gKCk9PntcbiAgICBcdGlzUGxheWluZyA9IGZhbHNlXG4gICAgXHR2aWRlby5wYXVzZSgpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIGVuZGVkID0gKCk9PntcbiAgICBcdGlmKHByb3BzLmxvb3ApIHBsYXkoKVxuICAgIFx0aWYocHJvcHMub25FbmRlZCAhPSB1bmRlZmluZWQpIHByb3BzLm9uRW5kZWQoc2NvcGUpXG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZSA9ICh4LCB5LCB3LCBoKT0+e1xuICAgIFx0ZHggPSB4XG4gICAgXHRkeSA9IHlcbiAgICBcdGRXaWR0aCA9IHdcbiAgICBcdGRIZWlnaHQgPSBoXG4gICAgfVxuXG4gICAgdmFyIGNsZWFyID0gKCk9PiB7XG4gICAgXHRjbGVhckludGVydmFsKGludGVydmFsSWQpXG4gICAgXHR2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5Jywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BsYXknLCBwbGF5KVxuXHQgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGF1c2UnLCBwYXVzZSlcblx0ICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpXG4gICAgfVxuXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBvbkNhblBsYXkpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgb25DYW5QbGF5KTtcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgcGxheSlcbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIHBhdXNlKVxuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZW5kZWQpXG5cblx0dmlkZW8uc3JjID0gc3JjXG5cblx0c2NvcGUgPSB7XG5cdFx0Y2FudmFzOiBjYW52YXMsXG5cdFx0dmlkZW86IHZpZGVvLFxuXHRcdGN0eDogY3R4LFxuXHRcdGRyYXdPbmNlOiBkcmF3T25jZSxcblx0XHRwbGF5OiBwbGF5LFxuXHRcdHBhdXNlOiBwYXVzZSxcblx0XHRzZWVrOiBzZWVrLFxuXHRcdHRpbWVvdXQ6IHRpbWVvdXQsXG5cdFx0cmVzaXplOiByZXNpemUsXG5cdFx0Y2xlYXI6IGNsZWFyXG5cdH1cblxuXHRyZXR1cm4gc2NvcGVcbn1cblxuXG5leHBvcnQgZGVmYXVsdCB2aWRlb0NhbnZhcyIsImV4cG9ydCBkZWZhdWx0IHtcblx0V0lORE9XX1JFU0laRTogJ1dJTkRPV19SRVNJWkUnLFxuXHRQQUdFX0hBU0hFUl9DSEFOR0VEOiAnUEFHRV9IQVNIRVJfQ0hBTkdFRCcsXG5cblx0TEFORFNDQVBFOiAnTEFORFNDQVBFJyxcblx0UE9SVFJBSVQ6ICdQT1JUUkFJVCcsXG5cblx0SE9NRTogJ0hPTUUnLFxuXHRESVBUWVFVRTogJ0RJUFRZUVVFJyxcblxuXHRQWF9DT05UQUlORVJfSVNfUkVBRFk6ICdQWF9DT05UQUlORVJfSVNfUkVBRFknLFxuXHRQWF9DT05UQUlORVJfQUREX0NISUxEOiAnUFhfQ09OVEFJTkVSX0FERF9DSElMRCcsXG5cdFBYX0NPTlRBSU5FUl9SRU1PVkVfQ0hJTEQ6ICdQWF9DT05UQUlORVJfUkVNT1ZFX0NISUxEJyxcblxuXHRIT01FX1ZJREVPX1NJWkU6IFsgNjQwLCAzNjAgXSxcblxuXHRJVEVNX0lNQUdFOiAnSVRFTV9JTUFHRScsXG5cdElURU1fVklERU86ICdJVEVNX1ZJREVPJyxcblxuXHRHUklEX1JPV1M6IDcsIFxuXHRHUklEX0NPTFVNTlM6IDQsXG5cblx0UEFERElOR19BUk9VTkQ6IDQwLFxuXG5cdEVOVklST05NRU5UUzoge1xuXHRcdFBSRVBST0Q6IHtcblx0XHRcdHN0YXRpYzogJydcblx0XHR9LFxuXHRcdFBST0Q6IHtcblx0XHRcdFwic3RhdGljXCI6IEpTX3VybF9zdGF0aWMgKyAnLydcblx0XHR9XG5cdH0sXG5cblx0TUVESUFfR0xPQkFMX1c6IDE5MjAsXG5cdE1FRElBX0dMT0JBTF9IOiAxMDgwLFxuXG5cdE1JTl9NSURETEVfVzogOTYwLFxuXHRNUV9YU01BTEw6IDMyMCxcblx0TVFfU01BTEw6IDQ4MCxcblx0TVFfTUVESVVNOiA3NjgsXG5cdE1RX0xBUkdFOiAxMDI0LFxuXHRNUV9YTEFSR0U6IDEyODAsXG5cdE1RX1hYTEFSR0U6IDE2ODAsXG59IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxudmFyIEFwcERpc3BhdGNoZXIgPSBhc3NpZ24obmV3IEZsdXguRGlzcGF0Y2hlcigpLCB7XG5cdGhhbmRsZVZpZXdBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0c291cmNlOiAnVklFV19BQ1RJT04nLFxuXHRcdFx0YWN0aW9uOiBhY3Rpb25cblx0XHR9KTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEFwcERpc3BhdGNoZXIiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlcjtcblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPSdwYWdlLXdyYXBwZXIgZGlwdHlxdWUtcGFnZSc+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJ2ZXJ0aWNhbC1jZW50ZXItcGFyZW50XFxcIj5cXG5cdFx0PHAgY2xhc3M9XFxcInZlcnRpY2FsLWNlbnRlci1jaGlsZFxcXCI+XFxuXHRcdFx0VGhpcyBpcyBhIFwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy50aXRsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAudGl0bGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogaGVscGVycy5oZWxwZXJNaXNzaW5nKSwodHlwZW9mIGhlbHBlciA9PT0gXCJmdW5jdGlvblwiID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInRpdGxlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcblx0XHQ8L3A+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uLCBhbGlhczM9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczQ9XCJmdW5jdGlvblwiO1xuXG4gIHJldHVybiBcIjxkaXY+XFxuXHRcXG5cdDxoZWFkZXIgaWQ9XFxcImhlYWRlclxcXCI+XFxuXHRcdFx0PGEgaHJlZj1cXFwiaHR0cDovL3d3dy5jYW1wZXIuY29tL1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGNsYXNzPVxcXCJsb2dvXFxcIj5cXG5cdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiBpZD1cXFwiTGF5ZXJfMVxcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxMzYuMDEzIDQ5LjM3NVxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTM2LjAxMyA0OS4zNzVcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIGZpbGwtcnVsZT1cXFwiZXZlbm9kZFxcXCIgY2xpcC1ydWxlPVxcXCJldmVub2RkXFxcIiBkPVxcXCJNODIuMTQxLDguMDAyaDMuMzU0YzEuMjEzLDAsMS43MTcsMC40OTksMS43MTcsMS43MjV2Ny4xMzdjMCwxLjIzMS0wLjUwMSwxLjczNi0xLjcwNSwxLjczNmgtMy4zNjVWOC4wMDJ6IE04Mi41MjMsMjQuNjE3djguNDI2bC03LjA4Ny0wLjM4NFYxLjkyNUg4Ny4zOWMzLjI5MiwwLDUuOTYsMi43MDUsNS45Niw2LjA0NHYxMC42MDRjMCwzLjMzOC0yLjY2OCw2LjA0NC01Ljk2LDYuMDQ0SDgyLjUyM3ogTTMzLjQ5MSw3LjkxM2MtMS4xMzIsMC0yLjA0OCwxLjA2NS0yLjA0OCwyLjM3OXYxMS4yNTZoNC40MDlWMTAuMjkyYzAtMS4zMTQtMC45MTctMi4zNzktMi4wNDctMi4zNzlIMzMuNDkxeiBNMzIuOTk0LDAuOTc0aDEuMzA4YzQuNzAyLDAsOC41MTQsMy44NjYsOC41MTQsOC42MzR2MjUuMjI0bC02Ljk2MywxLjI3M3YtNy44NDhoLTQuNDA5bDAuMDEyLDguNzg3bC02Ljk3NCwyLjAxOFY5LjYwOEMyNC40ODEsNC44MzksMjguMjkyLDAuOTc0LDMyLjk5NCwwLjk3NCBNMTIxLjkzMyw3LjkyMWgzLjQyM2MxLjIxNSwwLDEuNzE4LDAuNDk3LDEuNzE4LDEuNzI0djguMTk0YzAsMS4yMzItMC41MDIsMS43MzYtMS43MDUsMS43MzZoLTMuNDM2VjcuOTIxeiBNMTMzLjcxOCwzMS4wNTV2MTcuNDg3bC02LjkwNi0zLjM2OFYzMS41OTFjMC00LjkyLTQuNTg4LTUuMDgtNC41ODgtNS4wOHYxNi43NzRsLTYuOTgzLTIuOTE0VjEuOTI1aDEyLjIzMWMzLjI5MSwwLDUuOTU5LDIuNzA1LDUuOTU5LDYuMDQ0djExLjA3N2MwLDIuMjA3LTEuMjE3LDQuMTUzLTIuOTkxLDUuMTE1QzEzMS43NjEsMjQuODk0LDEzMy43MTgsMjcuMDc3LDEzMy43MTgsMzEuMDU1IE0xMC44MDksMC44MzNjLTQuNzAzLDAtOC41MTQsMy44NjYtOC41MTQsOC42MzR2MjcuOTM2YzAsNC43NjksNC4wMTksOC42MzQsOC43MjIsOC42MzRsMS4zMDYtMC4wODVjNS42NTUtMS4wNjMsOC4zMDYtNC42MzksOC4zMDYtOS40MDd2LTguOTRoLTYuOTk2djguNzM2YzAsMS40MDktMC4wNjQsMi42NS0xLjk5NCwyLjk5MmMtMS4yMzEsMC4yMTktMi40MTctMC44MTYtMi40MTctMi4xMzJWMTAuMTUxYzAtMS4zMTQsMC45MTctMi4zODEsMi4wNDctMi4zODFoMC4zMTVjMS4xMywwLDIuMDQ4LDEuMDY3LDIuMDQ4LDIuMzgxdjguNDY0aDYuOTk2VjkuNDY3YzAtNC43NjgtMy44MTItOC42MzQtOC41MTQtOC42MzRIMTAuODA5IE0xMDMuOTUzLDIzLjE2Mmg2Ljk3N3YtNi43NDRoLTYuOTc3VjguNDIzbDcuNjc2LTAuMDAyVjEuOTI0SDk2LjcydjMzLjI3OGMwLDAsNS4yMjUsMS4xNDEsNy41MzIsMS42NjZjMS41MTcsMC4zNDYsNy43NTIsMi4yNTMsNy43NTIsMi4yNTN2LTcuMDE1bC04LjA1MS0xLjUwOFYyMy4xNjJ6IE00Ni44NzksMS45MjdsMC4wMDMsMzIuMzVsNy4xMjMtMC44OTVWMTguOTg1bDUuMTI2LDEwLjQyNmw1LjEyNi0xMC40ODRsMC4wMDIsMTMuNjY0bDcuMDIyLTAuMDU0VjEuODk1aC03LjU0NUw1OS4xMywxNC42TDU0LjY2MSwxLjkyN0g0Ni44Nzl6XFxcIi8+PC9zdmc+XFxuXHRcdFx0PC9hPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcIm1hcC1idG5cXFwiPjxhIGhyZWY9XFxcIiMhL2xhbmRpbmdcXFwiIGNsYXNzPVxcXCJzaW1wbGUtdGV4dC1idG5cXFwiPjxkaXYgY2xhc3M9XFxcInRleHQtd3JhcFxcXCI+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5mb3MgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm1hcF90eHQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2Rpdj48L2E+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiY2FtcGVyLWxhYlxcXCI+PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5sYWJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxhYlVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGFiVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCIgY2xhc3M9XFxcInNpbXBsZS10ZXh0LWJ0blxcXCI+PGRpdiBjbGFzcz1cXFwidGV4dC13cmFwXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuY2FtcGVyX2xhYiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvZGl2PjwvYT48L2Rpdj5cXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJzaG9wLXdyYXBwZXIgYnRuXFxcIj5cXG5cdFx0XHRcdDxkaXYgY2xhc3M9XFxcInNob3AtdGl0bGUgc2ltcGxlLXRleHQtYnRuXFxcIj48ZGl2IGNsYXNzPVxcXCJ0ZXh0LXdyYXBcXFwiPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX3RpdGxlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9kaXY+PC9kaXY+XFxuXHRcdFx0XHQ8dWwgY2xhc3M9XFxcInN1Ym1lbnUtd3JhcHBlclxcXCI+XFxuXHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwic3ViLTBcXFwiPjxhIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBocmVmPSdcIlxuICAgICsgYWxpYXMyKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWVuU2hvcFVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibWVuU2hvcFVybFwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCInPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZm9zIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zaG9wX21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcInN1Yi0xXFxcIj48YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj0nXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLndvbWVuU2hvcFVybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAud29tZW5TaG9wVXJsIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMyksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzNCA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJ3b21lblNob3BVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJz5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmZvcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2hvcF93b21lbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvYT48L2xpPlxcblx0XHRcdFx0PC91bD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9oZWFkZXI+XFxuXHRcdDxmb290ZXIgaWQ9XFxcImZvb3RlclxcXCIgY2xhc3M9XFxcImJ0blxcXCI+XFxuXHRcdFx0PGRpdiBpZD1cXFwic29jaWFsLXdyYXBwZXJcXFwiPlxcblx0XHRcdFx0PHVsPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2luc3RhZ3JhbSc+XFxuXHRcdFx0XHRcdFx0PGEgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiXG4gICAgKyBhbGlhczIoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5pbnN0YWdyYW1VcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluc3RhZ3JhbVVybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiaW5zdGFncmFtVXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxuXHRcdFx0XHRcdFx0XHQ8c3ZnIHZlcnNpb249XFxcIjEuMVxcXCIgeG1sbnM6c2tldGNoPVxcXCJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnNcXFwiIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTggMThcXFwiIGVuYWJsZS1iYWNrZ3JvdW5kPVxcXCJuZXcgMCAwIDE4IDE4XFxcIiB4bWw6c3BhY2U9XFxcInByZXNlcnZlXFxcIj48cGF0aCBza2V0Y2g6dHlwZT1cXFwiTVNTaGFwZUdyb3VwXFxcIiBmaWxsPVxcXCIjMDBFQjc2XFxcIiBkPVxcXCJNMTYuMTA3LDE1LjU2MmMwLDAuMzAyLTAuMjQzLDAuNTQ3LTAuNTQzLDAuNTQ3SDIuNDM4Yy0wLjMwMiwwLTAuNTQ3LTAuMjQ1LTAuNTQ3LTAuNTQ3VjcuMzU5aDIuMTg4Yy0wLjI4NSwwLjQxLTAuMzgxLDEuMTc1LTAuMzgxLDEuNjYxYzAsMi45MjksMi4zODgsNS4zMTIsNS4zMjMsNS4zMTJjMi45MzUsMCw1LjMyMi0yLjM4Myw1LjMyMi01LjMxMmMwLTAuNDg2LTAuMDY2LTEuMjQtMC40Mi0xLjY2MWgyLjE4NlYxNS41NjJMMTYuMTA3LDE1LjU2MnogTTkuMDIsNS42NjNjMS44NTYsMCwzLjM2NSwxLjUwNCwzLjM2NSwzLjM1OGMwLDEuODU0LTEuNTA5LDMuMzU3LTMuMzY1LDMuMzU3Yy0xLjg1NywwLTMuMzY1LTEuNTA0LTMuMzY1LTMuMzU3QzUuNjU1LDcuMTY3LDcuMTYzLDUuNjYzLDkuMDIsNS42NjNMOS4wMiw1LjY2M3ogTTEyLjgyOCwyLjk4NGMwLTAuMzAxLDAuMjQ0LTAuNTQ2LDAuNTQ1LTAuNTQ2aDEuNjQzYzAuMywwLDAuNTQ5LDAuMjQ1LDAuNTQ5LDAuNTQ2djEuNjQxYzAsMC4zMDItMC4yNDksMC41NDctMC41NDksMC41NDdoLTEuNjQzYy0wLjMwMSwwLTAuNTQ1LTAuMjQ1LTAuNTQ1LTAuNTQ3VjIuOTg0TDEyLjgyOCwyLjk4NHogTTE1LjY2OSwwLjI1SDIuMzNjLTEuMTQ4LDAtMi4wOCwwLjkyOS0yLjA4LDIuMDc2djEzLjM0OWMwLDEuMTQ2LDAuOTMyLDIuMDc1LDIuMDgsMi4wNzVoMTMuMzM5YzEuMTUsMCwyLjA4MS0wLjkzLDIuMDgxLTIuMDc1VjIuMzI2QzE3Ljc1LDEuMTc5LDE2LjgxOSwwLjI1LDE1LjY2OSwwLjI1TDE1LjY2OSwwLjI1elxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdFx0PGxpIGNsYXNzPSd0d2l0dGVyJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnR3aXR0ZXJVcmwgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnR3aXR0ZXJVcmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMzKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXM0ID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcInR3aXR0ZXJVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAyMiAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMjIgMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0yMS4xNzYsMC41MTRjLTAuODU0LDAuNTA5LTEuNzk5LDAuODc5LTIuODA4LDEuMDc5Yy0wLjgwNS0wLjg2NS0xLjk1My0xLjQwNS0zLjIyNi0xLjQwNWMtMi40MzgsMC00LjQxNywxLjk5Mi00LjQxNyw0LjQ0OWMwLDAuMzQ5LDAuMDM4LDAuNjg4LDAuMTE0LDEuMDEzQzcuMTY2LDUuNDY0LDMuOTEsMy42OTUsMS43MjksMWMtMC4zOCwwLjY2LTAuNTk4LDEuNDI1LTAuNTk4LDIuMjRjMCwxLjU0MywwLjc4LDIuOTA0LDEuOTY2LDMuNzA0QzIuMzc0LDYuOTIsMS42OTEsNi43MTgsMS4wOTQsNi4zODh2MC4wNTRjMCwyLjE1NywxLjUyMywzLjk1NywzLjU0Nyw0LjM2M2MtMC4zNzEsMC4xMDQtMC43NjIsMC4xNTctMS4xNjUsMC4xNTdjLTAuMjg1LDAtMC41NjMtMC4wMjctMC44MzMtMC4wOGMwLjU2MywxLjc2NywyLjE5NCwzLjA1NCw0LjEyOCwzLjA4OWMtMS41MTIsMS4xOTQtMy40MTgsMS45MDYtNS40ODksMS45MDZjLTAuMzU2LDAtMC43MDktMC4wMjEtMS4wNTUtMC4wNjJjMS45NTYsMS4yNjEsNC4yOCwxLjk5Nyw2Ljc3NSwxLjk5N2M4LjEzMSwwLDEyLjU3NC02Ljc3OCwxMi41NzQtMTIuNjU5YzAtMC4xOTMtMC4wMDQtMC4zODctMC4wMTItMC41NzdjMC44NjQtMC42MjcsMS42MTMtMS40MTEsMi4yMDQtMi4zMDNjLTAuNzkxLDAuMzU0LTEuNjQ0LDAuNTkzLTIuNTM3LDAuNzAxQzIwLjE0NiwyLjQyNCwyMC44NDcsMS41NTMsMjEuMTc2LDAuNTE0XFxcIi8+XFxuXHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8bGkgY2xhc3M9J2ZhY2Vib29rJz5cXG5cdFx0XHRcdFx0XHQ8YSB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCJcbiAgICArIGFsaWFzMigoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZhY2Vib29rVXJsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mYWNlYm9va1VybCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczMpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczQgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwiZmFjZWJvb2tVcmxcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxzdmcgdmVyc2lvbj1cXFwiMS4xXFxcIiB4bWxuczpza2V0Y2g9XFxcImh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9uc1xcXCIgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIiB4bWxuczp4bGluaz1cXFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1xcXCIgd2lkdGg9XFxcIjEwMCVcXFwiIHZpZXdCb3g9XFxcIjAgMCAxOCAxOFxcXCIgZW5hYmxlLWJhY2tncm91bmQ9XFxcIm5ldyAwIDAgMTggMThcXFwiIHhtbDpzcGFjZT1cXFwicHJlc2VydmVcXFwiPjxwYXRoIHNrZXRjaDp0eXBlPVxcXCJNU1NoYXBlR3JvdXBcXFwiIGZpbGw9XFxcIiMwMEVCNzZcXFwiIGQ9XFxcIk0xNy43MTksMTYuNzU2YzAsMC41MzEtMC40MzEsMC45NjMtMC45NjIsMC45NjNoLTQuNDQzdi02Ljc1M2gyLjI2N2wwLjMzOC0yLjYzMWgtMi42MDRWNi42NTRjMC0wLjc2MiwwLjIxMS0xLjI4MSwxLjMwNC0xLjI4MWwxLjM5NCwwVjMuMDE5Yy0wLjI0MS0wLjAzMi0xLjA2OC0wLjEwNC0yLjAzMS0wLjEwNGMtMi4wMDksMC0zLjM4NSwxLjIyNy0zLjM4NSwzLjQ3OXYxLjk0MUg3LjMyMnYyLjYzMWgyLjI3MnY2Ljc1M0gxLjI0M2MtMC41MzEsMC0wLjk2Mi0wLjQzMi0wLjk2Mi0wLjk2M1YxLjI0M2MwLTAuNTMxLDAuNDMxLTAuOTYyLDAuOTYyLTAuOTYyaDE1LjUxNGMwLjUzMSwwLDAuOTYyLDAuNDMxLDAuOTYyLDAuOTYyVjE2Ljc1NlxcXCIvPlxcblx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDwvdWw+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZm9vdGVyPlxcblxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcdFx0XHQ8ZGl2PjwvZGl2PlxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBvcHRpb25zLCBidWZmZXIgPSBcIlwiO1xuXG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuaG9yaXpvbnRhbCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaG9yaXpvbnRhbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcImhvcml6b250YWxcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnMuaG9yaXpvbnRhbCkgeyBzdGFjazEgPSBoZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIHJldHVybiBidWZmZXI7XG59LFwiNFwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcdFx0XHRcdFx0PGRpdj48L2Rpdj5cXG5cIjtcbn0sXCI2XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGhlbHBlciwgb3B0aW9ucywgYnVmZmVyID0gXCJcIjtcblxuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnZlcnRpY2FsIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC52ZXJ0aWNhbCA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLChvcHRpb25zPXtcIm5hbWVcIjpcInZlcnRpY2FsXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBcImZ1bmN0aW9uXCIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzLnZlcnRpY2FsKSB7IHN0YWNrMSA9IGhlbHBlcnMuYmxvY2tIZWxwZXJNaXNzaW5nLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIG9wdGlvbnMsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz1oZWxwZXJzLmJsb2NrSGVscGVyTWlzc2luZywgYnVmZmVyID0gXG4gIFwiPGRpdiBjbGFzcz0ncGFnZS13cmFwcGVyIGhvbWUtcGFnZSc+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJiZy13cmFwcGVyXFxcIj5cXG5cdFx0PGltZyBzcmM9J1wiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5iZ3VybCB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYmd1cmwgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImJndXJsXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIic+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImdyaWQtY29udGFpbmVyXFxcIj5cXG5cIjtcbiAgc3RhY2sxID0gKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ncmlkIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ncmlkIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKG9wdGlvbnM9e1wibmFtZVwiOlwiZ3JpZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLG9wdGlvbnMpIDogaGVscGVyKSk7XG4gIGlmICghaGVscGVycy5ncmlkKSB7IHN0YWNrMSA9IGFsaWFzMy5jYWxsKGRlcHRoMCxzdGFjazEsb3B0aW9ucyl9XG4gIGlmIChzdGFjazEgIT0gbnVsbCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJsaW5lcy1ncmlkLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImhvcml6b250YWwtbGluZXNcXFwiPlxcblwiO1xuICBzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzWydsaW5lcy1ncmlkJ10gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWydsaW5lcy1ncmlkJ10gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwob3B0aW9ucz17XCJuYW1lXCI6XCJsaW5lcy1ncmlkXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgzLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAsb3B0aW9ucykgOiBoZWxwZXIpKTtcbiAgaWYgKCFoZWxwZXJzWydsaW5lcy1ncmlkJ10pIHsgc3RhY2sxID0gYWxpYXMzLmNhbGwoZGVwdGgwLHN0YWNrMSxvcHRpb25zKX1cbiAgaWYgKHN0YWNrMSAhPSBudWxsKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ2ZXJ0aWNhbC1saW5lc1xcXCI+XFxuXCI7XG4gIHN0YWNrMSA9ICgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnNbJ2xpbmVzLWdyaWQnXSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJ2xpbmVzLWdyaWQnXSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLChvcHRpb25zPXtcIm5hbWVcIjpcImxpbmVzLWdyaWRcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDYsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCxvcHRpb25zKSA6IGhlbHBlcikpO1xuICBpZiAoIWhlbHBlcnNbJ2xpbmVzLWdyaWQnXSkgeyBzdGFjazEgPSBhbGlhczMuY2FsbChkZXB0aDAsc3RhY2sxLG9wdGlvbnMpfVxuICBpZiAoc3RhY2sxICE9IG51bGwpIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICByZXR1cm4gYnVmZmVyICsgXCJcdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImJvdHRvbS10ZXh0cy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXRleHRcXFwiPlxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImZyb250LXdyYXBwZXJcXFwiPjwvZGl2Plxcblx0XHRcdDxkaXYgY2xhc3M9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtdGV4dFxcXCI+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiZnJvbnQtd3JhcHBlclxcXCI+PC9kaXY+XFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuXHQ8ZGl2IGNsYXNzPVxcXCJhcm91bmQtYm9yZGVyLWNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInRvcFxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImJvdHRvbVxcXCI+PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+PC9kaXY+XFxuXFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj48L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHQtc3RlcC10b3BcXFwiPjwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJyaWdodC1zdGVwLWJvdHRvbVxcXCI+PC9kaXY+XFxuXHQ8L2Rpdj5cXG5cdDxkaXYgY2xhc3M9XFxcImFyb3VuZC1ib3JkZXItbGV0dGVycy1jb250YWluZXJcXFwiPlxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJ0b3BcXFwiPlxcblx0XHRcdDxkaXY+YTwvZGl2Plxcblx0XHRcdDxkaXY+YjwvZGl2Plxcblx0XHRcdDxkaXY+YzwvZGl2Plxcblx0XHRcdDxkaXY+ZDwvZGl2Plxcblx0XHRcdDxkaXY+ZTwvZGl2Plxcblx0XHRcdDxkaXY+ZjwvZGl2Plxcblx0XHRcdDxkaXY+ZzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwiYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PmM8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmQ8L2Rpdj5cXG5cdFx0XHQ8ZGl2PmU8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImxlZnRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cdFx0PGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcblx0XHRcdDxkaXY+MTwvZGl2Plxcblx0XHRcdDxkaXY+MjwvZGl2Plxcblx0XHRcdDxkaXY+MzwvZGl2Plxcblx0XHQ8L2Rpdj5cXG5cXG5cdFx0PGRpdiBjbGFzcz1cXFwibGVmdC1zdGVwLXRvcFxcXCI+XFxuXHRcdFx0PGRpdj5hPC9kaXY+XFxuXHRcdFx0PGRpdj5iPC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJsZWZ0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtdG9wXFxcIj5cXG5cdFx0XHQ8ZGl2PmY8L2Rpdj5cXG5cdFx0XHQ8ZGl2Pmc8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XFxcInJpZ2h0LXN0ZXAtYm90dG9tXFxcIj5cXG5cdFx0XHQ8ZGl2PjQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgaWQ9J3BhZ2VzLWNvbnRhaW5lcic+XFxuXHQ8ZGl2IGlkPSdwYWdlLWEnPjwvZGl2Plxcblx0PGRpdiBpZD0ncGFnZS1iJz48L2Rpdj5cXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiaW1wb3J0IEFwcEFjdGlvbnMgZnJvbSAnQXBwQWN0aW9ucydcbiAgICBcdFxuY2xhc3MgR2xvYmFsRXZlbnRzIHtcblx0aW5pdCgpIHtcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0XHRBcHBBY3Rpb25zLndpbmRvd1Jlc2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdsb2JhbEV2ZW50c1xuIiwiaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuXG5jbGFzcyBQcmVsb2FkZXIgIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpXG5cdFx0dGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIHRoaXMub25NYW5pZmVzdExvYWRDb21wbGV0ZWQsIHRoaXMpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSB1bmRlZmluZWRcblx0XHR0aGlzLmFsbE1hbmlmZXN0cyA9IFtdXG5cdH1cblx0bG9hZChtYW5pZmVzdCwgb25Mb2FkZWQpIHtcblxuXHRcdGlmKHRoaXMuYWxsTWFuaWZlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbGxNYW5pZmVzdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG0gPSB0aGlzLmFsbE1hbmlmZXN0c1tpXVxuXHRcdFx0XHRpZihtLmxlbmd0aCA9PSBtYW5pZmVzdC5sZW5ndGggJiYgbVswXS5pZCA9PSBtYW5pZmVzdFswXS5pZCAmJiBtW20ubGVuZ3RoLTFdLmlkID09IG1hbmlmZXN0W21hbmlmZXN0Lmxlbmd0aC0xXS5pZCkge1xuXHRcdFx0XHRcdG9uTG9hZGVkKClcdFxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMuYWxsTWFuaWZlc3RzLnB1c2gobWFuaWZlc3QpXG5cdFx0dGhpcy5jdXJyZW50TG9hZGVkQ2FsbGJhY2sgPSBvbkxvYWRlZFxuICAgICAgICB0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChtYW5pZmVzdClcblx0fVxuXHRvbk1hbmlmZXN0TG9hZENvbXBsZXRlZCgpIHtcblx0XHR0aGlzLmN1cnJlbnRMb2FkZWRDYWxsYmFjaygpXG5cdH1cblx0Z2V0Q29udGVudEJ5SWQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5xdWV1ZS5nZXRSZXN1bHQoaWQpXG5cdH1cblx0Z2V0SW1hZ2VVUkwoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDb250ZW50QnlJZChpZCkuZ2V0QXR0cmlidXRlKFwic3JjXCIpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJlbG9hZGVyXG4iLCJpbXBvcnQgaGFzaGVyIGZyb20gJ2hhc2hlcidcbmltcG9ydCBBcHBBY3Rpb25zIGZyb20gJ0FwcEFjdGlvbnMnXG5pbXBvcnQgY3Jvc3Nyb2FkcyBmcm9tICdjcm9zc3JvYWRzJ1xuaW1wb3J0IEFwcFN0b3JlIGZyb20gJ0FwcFN0b3JlJ1xuaW1wb3J0IGRhdGEgZnJvbSAnR2xvYmFsRGF0YSdcbmltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG5jbGFzcyBSb3V0ZXIge1xuXHRpbml0KCkge1xuXHRcdHRoaXMucm91dGluZyA9IGRhdGEucm91dGluZ1xuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGhhc2hlci5uZXdIYXNoID0gdW5kZWZpbmVkXG5cdFx0aGFzaGVyLm9sZEhhc2ggPSB1bmRlZmluZWRcblx0XHRoYXNoZXIuaW5pdGlhbGl6ZWQuYWRkKHRoaXMuX2RpZEhhc2hlckNoYW5nZS5iaW5kKHRoaXMpKVxuXHRcdGhhc2hlci5jaGFuZ2VkLmFkZCh0aGlzLl9kaWRIYXNoZXJDaGFuZ2UuYmluZCh0aGlzKSlcblx0XHR0aGlzLl9zZXR1cENyb3Nzcm9hZHMoKVxuXHR9XG5cdGJlZ2luUm91dGluZygpIHtcblx0XHRoYXNoZXIuaW5pdCgpXG5cdH1cblx0X3NldHVwQ3Jvc3Nyb2FkcygpIHtcblx0IFx0dmFyIHJvdXRlcyA9IHRoaXMucm91dGluZ1xuXHRcdGZvcih2YXIga2V5IGluIHJvdXRlcykge1xuXHRcdFx0aWYoa2V5Lmxlbmd0aCA+IDEpIHtcblx0ICAgIFx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKGtleSwgdGhpcy5fb25QYXJzZVVybC5iaW5kKHRoaXMpKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjcm9zc3JvYWRzLmFkZFJvdXRlKCcnLCB0aGlzLl9vblBhcnNlVXJsLmJpbmQodGhpcykpXG5cdH1cblx0X29uUGFyc2VVcmwoKSB7XG5cdFx0dGhpcy5fYXNzaWduUm91dGUoKVxuXHR9XG5cdF9vbkRlZmF1bHRVUkxIYW5kbGVyKCkge1xuXHRcdHRoaXMuX3NlbmRUb0RlZmF1bHQoKVxuXHR9XG5cdF9hc3NpZ25Sb3V0ZShpZCkge1xuXHRcdHZhciBoYXNoID0gaGFzaGVyLmdldEhhc2goKVxuXHRcdHZhciBwYXJ0cyA9IHRoaXMuX2dldFVSTFBhcnRzKGhhc2gpXG5cdFx0dGhpcy5fdXBkYXRlUGFnZVJvdXRlKGhhc2gsIHBhcnRzLCBwYXJ0c1swXSwgKHBhcnRzWzFdID09IHVuZGVmaW5lZCkgPyAnJyA6IHBhcnRzWzFdKVxuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSB0cnVlXG5cdH1cblx0X2dldFVSTFBhcnRzKHVybCkge1xuXHRcdHZhciBoYXNoID0gdXJsXG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJy8nKVxuXHR9XG5cdF91cGRhdGVQYWdlUm91dGUoaGFzaCwgcGFydHMsIHBhcmVudCwgdGFyZ2V0KSB7XG5cdFx0aGFzaGVyLm9sZEhhc2ggPSBoYXNoZXIubmV3SGFzaFxuXHRcdGhhc2hlci5uZXdIYXNoID0ge1xuXHRcdFx0aGFzaDogaGFzaCxcblx0XHRcdHBhcnRzOiBwYXJ0cyxcblx0XHRcdHBhcmVudDogcGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXRcblx0XHR9XG5cdFx0aGFzaGVyLm5ld0hhc2gudHlwZSA9IGhhc2hlci5uZXdIYXNoLmhhc2ggPT0gJycgPyBBcHBDb25zdGFudHMuSE9NRSA6IEFwcENvbnN0YW50cy5ESVBUWVFVRVxuXHRcdEFwcEFjdGlvbnMucGFnZUhhc2hlckNoYW5nZWQoKVxuXHR9XG5cdF9kaWRIYXNoZXJDaGFuZ2UobmV3SGFzaCwgb2xkSGFzaCkge1xuXHRcdHRoaXMubmV3SGFzaEZvdW5kZWQgPSBmYWxzZVxuXHRcdGNyb3Nzcm9hZHMucGFyc2UobmV3SGFzaClcblx0XHRpZih0aGlzLm5ld0hhc2hGb3VuZGVkKSByZXR1cm5cblx0XHQvLyBJZiBVUkwgZG9uJ3QgbWF0Y2ggYSBwYXR0ZXJuLCBzZW5kIHRvIGRlZmF1bHRcblx0XHR0aGlzLl9vbkRlZmF1bHRVUkxIYW5kbGVyKClcblx0fVxuXHRfc2VuZFRvRGVmYXVsdCgpIHtcblx0XHRoYXNoZXIuc2V0SGFzaChBcHBTdG9yZS5kZWZhdWx0Um91dGUoKSlcblx0fVxuXHRzdGF0aWMgZ2V0QmFzZVVSTCgpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuVVJMLnNwbGl0KFwiI1wiKVswXVxuXHR9XG5cdHN0YXRpYyBnZXRIYXNoKCkge1xuXHRcdHJldHVybiBoYXNoZXIuZ2V0SGFzaCgpXG5cdH1cblx0c3RhdGljIGdldFJvdXRlcygpIHtcblx0XHRyZXR1cm4gQXBwU3RvcmUuRGF0YS5yb3V0aW5nXG5cdH1cblx0c3RhdGljIGdldE5ld0hhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5uZXdIYXNoXG5cdH1cblx0c3RhdGljIGdldE9sZEhhc2goKSB7XG5cdFx0cmV0dXJuIGhhc2hlci5vbGRIYXNoXG5cdH1cblx0c3RhdGljIHNldEhhc2goaGFzaCkge1xuXHRcdGhhc2hlci5zZXRIYXNoKGhhc2gpXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyXG4iLCJpbXBvcnQgQXBwRGlzcGF0Y2hlciBmcm9tICdBcHBEaXNwYXRjaGVyJ1xuaW1wb3J0IEFwcENvbnN0YW50cyBmcm9tICdBcHBDb25zdGFudHMnXG5pbXBvcnQge0V2ZW50RW1pdHRlcjJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjInXG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nXG5pbXBvcnQgZGF0YSBmcm9tICdHbG9iYWxEYXRhJ1xuaW1wb3J0IFJvdXRlciBmcm9tICdSb3V0ZXInXG5cbmZ1bmN0aW9uIF9nZXRDb250ZW50U2NvcGUoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgcmV0dXJuIEFwcFN0b3JlLmdldFJvdXRlUGF0aFNjb3BlQnlJZChoYXNoT2JqLmhhc2gpXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUFzc2V0c1RvTG9hZCgpIHtcbiAgICB2YXIgc2NvcGUgPSBfZ2V0Q29udGVudFNjb3BlKClcbiAgICB2YXIgaGFzaE9iaiA9IFJvdXRlci5nZXROZXdIYXNoKClcbiAgICB2YXIgdHlwZSA9IF9nZXRUeXBlT2ZQYWdlKClcbiAgICB2YXIgbWFuaWZlc3Q7XG5cbiAgICBpZih0eXBlICE9IEFwcENvbnN0YW50cy5IT01FKSB7XG4gICAgICAgIHZhciBmaWxlbmFtZXMgPSBbXG4gICAgICAgICAgICAnY2hhcmFjdGVyLnBuZycsXG4gICAgICAgICAgICAnY2hhcmFjdGVyLWJnLmpwZycsXG4gICAgICAgICAgICAnc2hvZS5wbmcnLFxuICAgICAgICAgICAgJ3Nob2UtYmcuanBnJ1xuICAgICAgICBdXG4gICAgICAgIG1hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhmaWxlbmFtZXMsIGhhc2hPYmoucGFyZW50LCBoYXNoT2JqLnRhcmdldCwgdHlwZSlcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIG9mIGV4dHJhIGFzc2V0c1xuICAgIGlmKHNjb3BlLmFzc2V0cyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIGFzc2V0cyA9IHNjb3BlLmFzc2V0c1xuICAgICAgICB2YXIgYXNzZXRzTWFuaWZlc3Q7XG4gICAgICAgIGlmKHR5cGUgPT0gQXBwQ29uc3RhbnRzLkhPTUUpIHtcbiAgICAgICAgICAgIGFzc2V0c01hbmlmZXN0ID0gX2FkZEJhc2VQYXRoc1RvVXJscyhhc3NldHMsICdob21lJywgaGFzaE9iai50YXJnZXQsIHR5cGUpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNzZXRzTWFuaWZlc3QgPSBfYWRkQmFzZVBhdGhzVG9VcmxzKGFzc2V0cywgaGFzaE9iai5wYXJlbnQsIGhhc2hPYmoudGFyZ2V0LCB0eXBlKSAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYW5pZmVzdCA9IChtYW5pZmVzdCA9PSB1bmRlZmluZWQpID8gYXNzZXRzTWFuaWZlc3QgOiBtYW5pZmVzdC5jb25jYXQoYXNzZXRzTWFuaWZlc3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hbmlmZXN0XG59XG5mdW5jdGlvbiBfYWRkQmFzZVBhdGhzVG9VcmxzKHVybHMsIHBhZ2VJZCwgdGFyZ2V0SWQsIHR5cGUpIHtcbiAgICB2YXIgYmFzZVBhdGggPSAodHlwZSA9PSBBcHBDb25zdGFudHMuSE9NRSkgPyBfZ2V0SG9tZVBhZ2VBc3NldHNCYXNlUGF0aCgpIDogX2dldFBhZ2VBc3NldHNCYXNlUGF0aEJ5SWQocGFnZUlkLCB0YXJnZXRJZClcbiAgICB2YXIgbWFuaWZlc3QgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaXR0ZXIgPSB1cmxzW2ldLnNwbGl0KCcuJylcbiAgICAgICAgdmFyIGZpbGVOYW1lID0gc3BsaXR0ZXJbMF1cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHNwbGl0dGVyWzFdXG4gICAgICAgIHZhciBpZCA9IHBhZ2VJZCArICctJ1xuICAgICAgICBpZih0YXJnZXRJZCkgaWQgKz0gdGFyZ2V0SWQgKyAnLSdcbiAgICAgICAgaWQgKz0gZmlsZU5hbWVcbiAgICAgICAgbWFuaWZlc3RbaV0gPSB7XG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICBzcmM6IGJhc2VQYXRoICsgZmlsZU5hbWUgKyBfZ2V0SW1hZ2VFeHRlbnNpb25CeURldmljZVJhdGlvKCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFuaWZlc3Rcbn1cbmZ1bmN0aW9uIF9nZXRQYWdlQXNzZXRzQmFzZVBhdGhCeUlkKGlkLCBhc3NldEdyb3VwSWQpIHtcbiAgICByZXR1cm4gQXBwU3RvcmUuYmFzZU1lZGlhUGF0aCgpICsgJ2ltYWdlL2RpcHR5cXVlLycgKyBpZCArICcvJyArIGFzc2V0R3JvdXBJZCArICcvJ1xufVxuZnVuY3Rpb24gX2dldEhvbWVQYWdlQXNzZXRzQmFzZVBhdGgoKSB7XG4gICAgcmV0dXJuIEFwcFN0b3JlLmJhc2VNZWRpYVBhdGgoKSArICdpbWFnZS9ob21lLydcbn1cbmZ1bmN0aW9uIF9nZXRJbWFnZUV4dGVuc2lvbkJ5RGV2aWNlUmF0aW8oKSB7XG4gICAgLy8gcmV0dXJuICdAJyArIF9nZXREZXZpY2VSYXRpbygpICsgJ3gnXG4gICAgcmV0dXJuICcnXG59XG5mdW5jdGlvbiBfZ2V0RGV2aWNlUmF0aW8oKSB7XG4gICAgdmFyIHNjYWxlID0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09IHVuZGVmaW5lZCkgPyAxIDogd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICByZXR1cm4gKHNjYWxlID4gMSkgPyAyIDogMVxufVxuZnVuY3Rpb24gX2dldFR5cGVPZlBhZ2UoaGFzaCkge1xuICAgIHZhciBoID0gaGFzaCB8fCBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgaWYoaC5wYXJ0cy5sZW5ndGggPT0gMikgcmV0dXJuIEFwcENvbnN0YW50cy5ESVBUWVFVRVxuICAgIGVsc2UgcmV0dXJuIEFwcENvbnN0YW50cy5IT01FXG59XG5mdW5jdGlvbiBfZ2V0UGFnZUNvbnRlbnQoKSB7XG4gICAgdmFyIGhhc2hPYmogPSBSb3V0ZXIuZ2V0TmV3SGFzaCgpXG4gICAgdmFyIGhhc2ggPSBoYXNoT2JqLmhhc2gubGVuZ3RoIDwgMSA/ICcvJyA6IGhhc2hPYmouaGFzaFxuICAgIHZhciBjb250ZW50ID0gZGF0YS5yb3V0aW5nW2hhc2hdXG4gICAgcmV0dXJuIGNvbnRlbnRcbn1cbmZ1bmN0aW9uIF9nZXRDb250ZW50QnlMYW5nKGxhbmcpIHtcbiAgICByZXR1cm4gZGF0YS5jb250ZW50LmxhbmdbbGFuZ11cbn1cbmZ1bmN0aW9uIF9nZXRHbG9iYWxDb250ZW50KCkge1xuICAgIHJldHVybiBfZ2V0Q29udGVudEJ5TGFuZyhBcHBTdG9yZS5sYW5nKCkpXG59XG5mdW5jdGlvbiBfZ2V0QXBwRGF0YSgpIHtcbiAgICByZXR1cm4gZGF0YVxufVxuZnVuY3Rpb24gX2dldERlZmF1bHRSb3V0ZSgpIHtcbiAgICByZXR1cm4gZGF0YVsnZGVmYXVsdC1yb3V0ZSddXG59XG5mdW5jdGlvbiBfd2luZG93V2lkdGhIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgIGg6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIH1cbn1cblxudmFyIEFwcFN0b3JlID0gYXNzaWduKHt9LCBFdmVudEVtaXR0ZXIyLnByb3RvdHlwZSwge1xuICAgIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIGl0ZW0pIHtcbiAgICAgICAgdGhpcy5lbWl0KHR5cGUsIGl0ZW0pXG4gICAgfSxcbiAgICBwYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0UGFnZUNvbnRlbnQoKVxuICAgIH0sXG4gICAgYXBwRGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfZ2V0QXBwRGF0YSgpXG4gICAgfSxcbiAgICBkZWZhdWx0Um91dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldERlZmF1bHRSb3V0ZSgpXG4gICAgfSxcbiAgICBnbG9iYWxDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRHbG9iYWxDb250ZW50KClcbiAgICB9LFxuICAgIHBhZ2VBc3NldHNUb0xvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2dldFBhZ2VBc3NldHNUb0xvYWQoKVxuICAgIH0sXG4gICAgZ2V0Um91dGVQYXRoU2NvcGVCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZCA9IGlkLmxlbmd0aCA8IDEgPyAnLycgOiBpZFxuICAgICAgICByZXR1cm4gZGF0YS5yb3V0aW5nW2lkXVxuICAgIH0sXG4gICAgYmFzZU1lZGlhUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBBcHBTdG9yZS5nZXRFbnZpcm9ubWVudCgpLnN0YXRpY1xuICAgIH0sXG4gICAgZ2V0RW52aXJvbm1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQXBwQ29uc3RhbnRzLkVOVklST05NRU5UU1tFTlZdXG4gICAgfSxcbiAgICBnZXRUeXBlT2ZQYWdlOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0VHlwZU9mUGFnZShoYXNoKVxuICAgIH0sXG4gICAgZ2V0SG9tZVZpZGVvczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkYXRhWydob21lLXZpZGVvcyddXG4gICAgfSxcbiAgICBnZW5lcmFsSW5mb3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5jb250ZW50XG4gICAgfSxcbiAgICBsYW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRMYW5nID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGFuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsYW5nID0gZGF0YS5sYW5nc1tpXVxuICAgICAgICAgICAgaWYobGFuZyA9PSBKU19sYW5nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExhbmcgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKGRlZmF1bHRMYW5nID09IHRydWUpID8gJ2VuJyA6IEpTX2xhbmdcbiAgICB9LFxuICAgIFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfd2luZG93V2lkdGhIZWlnaHQoKVxuICAgIH0sXG4gICAgYWRkUFhDaGlsZDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBBcHBTdG9yZS5QWENvbnRhaW5lci5hZGQoaXRlbS5jaGlsZClcbiAgICB9LFxuICAgIHJlbW92ZVBYQ2hpbGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgQXBwU3RvcmUuUFhDb250YWluZXIucmVtb3ZlKGl0ZW0uY2hpbGQpXG4gICAgfSxcbiAgICBQYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICBPcmllbnRhdGlvbjogQXBwQ29uc3RhbnRzLkxBTkRTQ0FQRSxcbiAgICBEZXRlY3Rvcjoge1xuICAgICAgICBpc01vYmlsZTogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBkaXNwYXRjaGVySW5kZXg6IEFwcERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb24gPSBwYXlsb2FkLmFjdGlvblxuICAgICAgICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXBwQ29uc3RhbnRzLldJTkRPV19SRVNJWkU6XG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LncgPSBhY3Rpb24uaXRlbS53aW5kb3dXXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuV2luZG93LmggPSBhY3Rpb24uaXRlbS53aW5kb3dIXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuT3JpZW50YXRpb24gPSAoQXBwU3RvcmUuV2luZG93LncgPiBBcHBTdG9yZS5XaW5kb3cuaCkgPyBBcHBDb25zdGFudHMuTEFORFNDQVBFIDogQXBwQ29uc3RhbnRzLlBPUlRSQUlUXG4gICAgICAgICAgICAgICAgQXBwU3RvcmUuZW1pdENoYW5nZShhY3Rpb24uYWN0aW9uVHlwZSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBBcHBTdG9yZS5lbWl0Q2hhbmdlKGFjdGlvbi5hY3Rpb25UeXBlLCBhY3Rpb24uaXRlbSkgXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG59KVxuXG5cbmV4cG9ydCBkZWZhdWx0IEFwcFN0b3JlXG5cbiIsImltcG9ydCBBcHBDb25zdGFudHMgZnJvbSAnQXBwQ29uc3RhbnRzJ1xuXG52YXIgUHhIZWxwZXIgPSB7XG5cbiAgICBnZXRQWFZpZGVvOiBmdW5jdGlvbih1cmwsIHdpZHRoLCBoZWlnaHQsIHZhcnMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbVZpZGVvKHVybClcbiAgICAgICAgdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2Uuc2V0QXR0cmlidXRlKFwibG9vcFwiLCB0cnVlKVxuICAgICAgICB2YXIgdmlkZW9TcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSlcbiAgICAgICAgdmlkZW9TcHJpdGUud2lkdGggPSB3aWR0aFxuICAgICAgICB2aWRlb1Nwcml0ZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgcmV0dXJuIHZpZGVvU3ByaXRlXG4gICAgfSxcblxuICAgIHJlbW92ZUNoaWxkcmVuRnJvbUNvbnRhaW5lcjogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZHJlblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRGcmFtZUltYWdlc0FycmF5OiBmdW5jdGlvbihmcmFtZXMsIGJhc2V1cmwsIGV4dCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBmcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHVybCA9IGJhc2V1cmwgKyBpICsgJy4nICsgZXh0XG4gICAgICAgICAgICBhcnJheVtpXSA9IHVybFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHhIZWxwZXIiLCJjbGFzcyBVdGlscyB7XG5cdHN0YXRpYyBOb3JtYWxpemVNb3VzZUNvb3JkcyhlLCBvYmpXcmFwcGVyKSB7XG5cdFx0dmFyIHBvc3ggPSAwO1xuXHRcdHZhciBwb3N5ID0gMDtcblx0XHRpZiAoIWUpIHZhciBlID0gd2luZG93LmV2ZW50O1xuXHRcdGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIFx0e1xuXHRcdFx0cG9zeCA9IGUucGFnZVg7XG5cdFx0XHRwb3N5ID0gZS5wYWdlWTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WSkgXHR7XG5cdFx0XHRwb3N4ID0gZS5jbGllbnRYICsgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0XG5cdFx0XHRcdCsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQ7XG5cdFx0XHRwb3N5ID0gZS5jbGllbnRZICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3Bcblx0XHRcdFx0KyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0XHRvYmpXcmFwcGVyLnggPSBwb3N4XG5cdFx0b2JqV3JhcHBlci55ID0gcG9zeVxuXHRcdHJldHVybiBvYmpXcmFwcGVyXG5cdH1cblx0c3RhdGljIFJlc2l6ZVBvc2l0aW9uUHJvcG9ydGlvbmFsbHkod2luZG93Vywgd2luZG93SCwgY29udGVudFcsIGNvbnRlbnRIKSB7XG5cdFx0dmFyIGFzcGVjdFJhdGlvID0gY29udGVudFcgLyBjb250ZW50SFxuXHRcdHZhciBzY2FsZSA9ICgod2luZG93VyAvIHdpbmRvd0gpIDwgYXNwZWN0UmF0aW8pID8gKHdpbmRvd0ggLyBjb250ZW50SCkgKiAxIDogKHdpbmRvd1cgLyBjb250ZW50VykgKiAxXG5cdFx0dmFyIG5ld1cgPSBjb250ZW50VyAqIHNjYWxlXG5cdFx0dmFyIG5ld0ggPSBjb250ZW50SCAqIHNjYWxlXG5cdFx0dmFyIGNzcyA9IHtcblx0XHRcdHdpZHRoOiBuZXdXLFxuXHRcdFx0aGVpZ2h0OiBuZXdILFxuXHRcdFx0bGVmdDogKHdpbmRvd1cgPj4gMSkgLSAobmV3VyA+PiAxKSxcblx0XHRcdHRvcDogKHdpbmRvd0ggPj4gMSkgLSAobmV3SCA+PiAxKSxcblx0XHRcdHNjYWxlOiBzY2FsZVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gY3NzXG5cdH1cblx0c3RhdGljIENhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcblx0ICAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSk7XG5cdH1cblx0c3RhdGljIFN1cHBvcnRXZWJHTCgpIHtcblx0XHR0cnkge1xuXHRcdFx0dmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG5cdFx0XHRyZXR1cm4gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApICk7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHN0YXRpYyBEZXN0cm95VmlkZW8odmlkZW8pIHtcbiAgICAgICAgdmlkZW8ucGF1c2UoKTtcbiAgICAgICAgdmlkZW8uc3JjID0gJyc7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZpZGVvLmNoaWxkTm9kZXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBcdHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIFx0Y2hpbGQuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG4gICAgICAgIFx0Ly8gV29ya2luZyB3aXRoIGEgcG9seWZpbGwgb3IgdXNlIGpxdWVyeVxuICAgICAgICBcdCQoY2hpbGQpLnJlbW92ZSgpXG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIERlc3Ryb3lWaWRlb1RleHR1cmUodGV4dHVyZSkge1xuICAgIFx0dmFyIHZpZGVvID0gdGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2VcbiAgICAgICAgVXRpbHMuRGVzdHJveVZpZGVvKHZpZGVvKVxuICAgIH1cbiAgICBzdGF0aWMgUmFuZChtaW4sIG1heCwgZGVjaW1hbHMpIHtcbiAgICAgICAgdmFyIHJhbmRvbU51bSA9IE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pblxuICAgICAgICBpZihkZWNpbWFscyA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgXHRyZXR1cm4gcmFuZG9tTnVtXG4gICAgICAgIH1lbHNle1xuXHQgICAgICAgIHZhciBkID0gTWF0aC5wb3coMTAsIGRlY2ltYWxzKVxuXHQgICAgICAgIHJldHVybiB+figoZCAqIHJhbmRvbU51bSkgKyAwLjUpIC8gZFxuICAgICAgICB9XG5cdH1cbiAgICBzdGF0aWMgUmFuZG9tQ29sb3IoKSB7XG5cdCAgICB2YXIgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XG5cdCAgICB2YXIgY29sb3IgPSAnIyc7XG5cdCAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKyApIHtcblx0ICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG5cdCAgICB9XG5cdCAgICByZXR1cm4gY29sb3I7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbHNcbiIsIi8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG4gXG4vLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYnkgRXJpayBNw7ZsbGVyLiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG4gXG4vLyBNSVQgbGljZW5zZVxuIFxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgdmFyIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddO1xuICAgIGZvcih2YXIgeCA9IDA7IHggPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuIFxuICAgIGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgICAgICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIFxuICAgICAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuIFxuICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfTtcbn0oKSk7IiwiaW1wb3J0IEZsdXggZnJvbSAnZmx1eCdcbmltcG9ydCB7RXZlbnRFbWl0dGVyMn0gZnJvbSAnZXZlbnRlbWl0dGVyMidcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbidcblxuLy8gQWN0aW9uc1xudmFyIFBhZ2VyQWN0aW9ucyA9IHtcbiAgICBvblBhZ2VSZWFkeTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICBQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFksXG4gICAgICAgIFx0aXRlbTogaGFzaFxuICAgICAgICB9KSAgXG4gICAgfSxcbiAgICBvblRyYW5zaXRpb25PdXRDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgXHRQYWdlckRpc3BhdGNoZXIuaGFuZGxlUGFnZXJBY3Rpb24oe1xuICAgICAgICBcdHR5cGU6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEUsXG4gICAgICAgIFx0aXRlbTogdW5kZWZpbmVkXG4gICAgICAgIH0pICBcbiAgICB9LFxuICAgIHBhZ2VUcmFuc2l0aW9uRGlkRmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUGFnZXJEaXNwYXRjaGVyLmhhbmRsZVBhZ2VyQWN0aW9uKHtcbiAgICAgICAgXHR0eXBlOiBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSCxcbiAgICAgICAgXHRpdGVtOiB1bmRlZmluZWRcbiAgICAgICAgfSkgIFxuICAgIH1cbn1cblxuLy8gQ29uc3RhbnRzXG52YXIgUGFnZXJDb25zdGFudHMgPSB7XG5cdFBBR0VfSVNfUkVBRFk6ICdQQUdFX0lTX1JFQURZJyxcblx0UEFHRV9UUkFOU0lUSU9OX0lOOiAnUEFHRV9UUkFOU0lUSU9OX0lOJyxcblx0UEFHRV9UUkFOU0lUSU9OX09VVDogJ1BBR0VfVFJBTlNJVElPTl9PVVQnLFxuXHRQQUdFX1RSQU5TSVRJT05fT1VUX0NPTVBMRVRFOiAnUEFHRV9UUkFOU0lUSU9OX09VVF9DT01QTEVURScsXG5cdFBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUzogJ1BBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUycsXG5cdFBBR0VfVFJBTlNJVElPTl9ESURfRklOSVNIOiAnUEFHRV9UUkFOU0lUSU9OX0RJRF9GSU5JU0gnLFxufVxuXG4vLyBEaXNwYXRjaGVyXG52YXIgUGFnZXJEaXNwYXRjaGVyID0gYXNzaWduKG5ldyBGbHV4LkRpc3BhdGNoZXIoKSwge1xuXHRoYW5kbGVQYWdlckFjdGlvbjogZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0dGhpcy5kaXNwYXRjaChhY3Rpb24pXG5cdH1cbn0pXG5cbi8vIFN0b3JlXG52YXIgUGFnZXJTdG9yZSA9IGFzc2lnbih7fSwgRXZlbnRFbWl0dGVyMi5wcm90b3R5cGUsIHtcbiAgICBmaXJzdFBhZ2VUcmFuc2l0aW9uOiB0cnVlLFxuICAgIHBhZ2VUcmFuc2l0aW9uU3RhdGU6IHVuZGVmaW5lZCwgXG4gICAgZGlzcGF0Y2hlckluZGV4OiBQYWdlckRpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCl7XG4gICAgICAgIHZhciBhY3Rpb25UeXBlID0gcGF5bG9hZC50eXBlXG4gICAgICAgIHZhciBpdGVtID0gcGF5bG9hZC5pdGVtXG4gICAgICAgIHN3aXRjaChhY3Rpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfSVNfUkVBRFk6XG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUucGFnZVRyYW5zaXRpb25TdGF0ZSA9IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTU1xuICAgICAgICAgICAgXHR2YXIgdHlwZSA9IFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbiA/IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiA6IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRcbiAgICAgICAgICAgIFx0UGFnZXJTdG9yZS5lbWl0KHR5cGUpXG4gICAgICAgICAgICBcdGJyZWFrXG4gICAgICAgICAgICBjYXNlIFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9PVVRfQ09NUExFVEU6XG4gICAgICAgICAgICBcdHZhciB0eXBlID0gUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOXG4gICAgICAgICAgICBcdFBhZ2VyU3RvcmUuZW1pdCh0eXBlKVxuICAgICAgICAgICAgXHRicmVha1xuICAgICAgICAgICAgY2FzZSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSDpcbiAgICAgICAgICAgIFx0aWYgKFBhZ2VyU3RvcmUuZmlyc3RQYWdlVHJhbnNpdGlvbikgUGFnZXJTdG9yZS5maXJzdFBhZ2VUcmFuc2l0aW9uID0gZmFsc2VcbiAgICAgICAgICAgICAgICBQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPSBQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fRElEX0ZJTklTSFxuICAgICAgICAgICAgICAgIFBhZ2VyU3RvcmUuZW1pdChhY3Rpb25UeXBlKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxufSlcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRQYWdlclN0b3JlOiBQYWdlclN0b3JlLFxuXHRQYWdlckFjdGlvbnM6IFBhZ2VyQWN0aW9ucyxcblx0UGFnZXJDb25zdGFudHM6IFBhZ2VyQ29uc3RhbnRzLFxuXHRQYWdlckRpc3BhdGNoZXI6IFBhZ2VyRGlzcGF0Y2hlclxufVxuIiwiaW1wb3J0IHNsdWcgZnJvbSAndG8tc2x1Zy1jYXNlJ1xuXG5jbGFzcyBCYXNlQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5kb21Jc1JlYWR5ID0gZmFsc2Vcblx0XHR0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gdGhpcy5jb21wb25lbnREaWRNb3VudC5iaW5kKHRoaXMpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMuZG9tSXNSZWFkeSA9IHRydWVcblx0XHR0aGlzLnJlc2l6ZSgpXG5cdH1cblx0cmVuZGVyKGNoaWxkSWQsIHBhcmVudElkLCB0ZW1wbGF0ZSwgb2JqZWN0KSB7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsTW91bnQoKVxuXHRcdHRoaXMuY2hpbGRJZCA9IGNoaWxkSWRcblx0XHR0aGlzLnBhcmVudElkID0gcGFyZW50SWRcblx0XHR0aGlzLnBhcmVudCA9IChwYXJlbnRJZCBpbnN0YW5jZW9mIGpRdWVyeSkgPyBwYXJlbnRJZCA6ICQodGhpcy5wYXJlbnRJZClcblx0XHR0aGlzLmVsZW1lbnQgPSAodGVtcGxhdGUgPT0gdW5kZWZpbmVkKSA/ICQoJzxkaXY+PC9kaXY+JykgOiAkKHRlbXBsYXRlKG9iamVjdCkpXG5cdFx0aWYodGhpcy5lbGVtZW50LmF0dHIoJ2lkJykgPT0gdW5kZWZpbmVkKSB0aGlzLmVsZW1lbnQuYXR0cignaWQnLCBzbHVnKGNoaWxkSWQpKVxuXHRcdHRoaXMuZWxlbWVudC5yZWFkeSh0aGlzLmNvbXBvbmVudERpZE1vdW50KVxuXHRcdHRoaXMucGFyZW50LmFwcGVuZCh0aGlzLmVsZW1lbnQpXG5cdH1cblx0cmVtb3ZlKCkge1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuXHR9XG5cdHJlc2l6ZSgpIHtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG5cbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJ0Jhc2VDb21wb25lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VQYWdlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIoKVxuXHRcdHRoaXMucHJvcHMgPSBwcm9wc1xuXHRcdHRoaXMuZGlkVHJhbnNpdGlvbkluQ29tcGxldGUgPSB0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlLmJpbmQodGhpcylcblx0XHR0aGlzLnRsSW4gPSBuZXcgVGltZWxpbmVNYXgoe1xuXHRcdFx0b25Db21wbGV0ZTp0aGlzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlXG5cdFx0fSlcblx0XHR0aGlzLnRsT3V0ID0gbmV3IFRpbWVsaW5lTWF4KHtcblx0XHRcdG9uQ29tcGxldGU6dGhpcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGVcblx0XHR9KVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMucmVzaXplKClcblx0XHR0aGlzLnNldHVwQW5pbWF0aW9ucygpXG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmlzUmVhZHkodGhpcy5wcm9wcy5oYXNoKSwgMClcblx0fVxuXHRzZXR1cEFuaW1hdGlvbnMoKSB7XG5cdFx0dmFyIHdyYXBwZXIgPSB0aGlzLmVsZW1lbnRcblxuXHRcdC8vIHRyYW5zaXRpb24gSW5cblx0XHR0aGlzLnRsSW4uZnJvbSh3cmFwcGVyLCAxLCB7IG9wYWNpdHk6MCwgZWFzZTpFeHBvLmVhc2VJbk91dCB9KVxuXG5cdFx0Ly8gdHJhbnNpdGlvbiBPdXRcblx0XHR0aGlzLnRsT3V0LnRvKHdyYXBwZXIsIDEsIHsgb3BhY2l0eTowLCBlYXNlOkV4cG8uZWFzZUluT3V0IH0pXG5cblx0XHQvLyByZXNldFxuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0fVxuXHR3aWxsVHJhbnNpdGlvbkluKCkge1xuXHRcdHRoaXMudGxJbi5wbGF5KDApXG5cdH1cblx0d2lsbFRyYW5zaXRpb25PdXQoKSB7XG5cdFx0dGhpcy50bE91dC5wbGF5KDApXG5cdH1cblx0ZGlkVHJhbnNpdGlvbkluQ29tcGxldGUoKSB7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLnByb3BzLmRpZFRyYW5zaXRpb25JbkNvbXBsZXRlKCksIDApXG5cdH1cblx0ZGlkVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5wcm9wcy5kaWRUcmFuc2l0aW9uT3V0Q29tcGxldGUoKSwgMClcblx0fVxuXHRyZXNpemUoKSB7XG5cdH1cblx0Zm9yY2VVbm1vdW50KCkge1xuXHRcdHRoaXMudGxJbi5wYXVzZSgwKVxuXHRcdHRoaXMudGxPdXQucGF1c2UoMClcblx0XHR0aGlzLmRpZFRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0dGhpcy50bEluLmNsZWFyKClcblx0XHR0aGlzLnRsT3V0LmNsZWFyKClcblx0fVxufVxuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnQmFzZUNvbXBvbmVudCdcbmltcG9ydCB7UGFnZXJTdG9yZSwgUGFnZXJBY3Rpb25zLCBQYWdlckNvbnN0YW50cywgUGFnZXJEaXNwYXRjaGVyfSBmcm9tICdQYWdlcidcbmltcG9ydCBVdGlscyBmcm9tICdVdGlscydcbmltcG9ydCB0ZW1wbGF0ZSBmcm9tICdQYWdlc0NvbnRhaW5lcl9oYnMnXG5pbXBvcnQgQXBwU3RvcmUgZnJvbSAnQXBwU3RvcmUnXG5cbmNsYXNzIEJhc2VQYWdlciBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5jdXJyZW50UGFnZURpdlJlZiA9ICdwYWdlLWInXG5cdFx0dGhpcy53aWxsUGFnZVRyYW5zaXRpb25JbiA9IHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uSW4uYmluZCh0aGlzKVxuXHRcdHRoaXMud2lsbFBhZ2VUcmFuc2l0aW9uT3V0ID0gdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlID0gdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUuYmluZCh0aGlzKVxuXHRcdHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSA9IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZS5iaW5kKHRoaXMpXG5cdFx0dGhpcy5jb21wb25lbnRzID0ge1xuXHRcdFx0J25ldy1jb21wb25lbnQnOiB1bmRlZmluZWQsXG5cdFx0XHQnb2xkLWNvbXBvbmVudCc6IHVuZGVmaW5lZFxuXHRcdH1cblx0fVxuXHRyZW5kZXIocGFyZW50KSB7XG5cdFx0c3VwZXIucmVuZGVyKCdCYXNlUGFnZXInLCBwYXJlbnQsIHRlbXBsYXRlLCB1bmRlZmluZWQpXG5cdH1cblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX0lOLCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbkluKVxuXHRcdFBhZ2VyU3RvcmUub24oUGFnZXJDb25zdGFudHMuUEFHRV9UUkFOU0lUSU9OX09VVCwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25PdXQpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbE1vdW50KClcblx0fVxuXHR3aWxsUGFnZVRyYW5zaXRpb25JbigpIHtcblx0XHR0aGlzLnN3aXRjaFBhZ2VzRGl2SW5kZXgoKVxuXHRcdHRoaXMuY29tcG9uZW50c1snbmV3LWNvbXBvbmVudCddLndpbGxUcmFuc2l0aW9uSW4oKVxuXHR9XG5cdHdpbGxQYWdlVHJhbnNpdGlvbk91dCgpIHtcblx0XHR0aGlzLmNvbXBvbmVudHNbJ29sZC1jb21wb25lbnQnXS53aWxsVHJhbnNpdGlvbk91dCgpXG5cdH1cblx0ZGlkUGFnZVRyYW5zaXRpb25JbkNvbXBsZXRlKCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5wYWdlVHJhbnNpdGlvbkRpZEZpbmlzaCgpXG5cdFx0dGhpcy51bm1vdW50Q29tcG9uZW50KCdvbGQtY29tcG9uZW50Jylcblx0fVxuXHRkaWRQYWdlVHJhbnNpdGlvbk91dENvbXBsZXRlKCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblRyYW5zaXRpb25PdXRDb21wbGV0ZSgpXG5cdH1cblx0c3dpdGNoUGFnZXNEaXZJbmRleCgpIHtcblx0XHR2YXIgbmV3Q29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR2YXIgb2xkQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J11cblx0XHRpZihuZXdDb21wb25lbnQgIT0gdW5kZWZpbmVkKSBuZXdDb21wb25lbnQuZWxlbWVudC5jc3MoJ3otaW5kZXgnLCAyKVxuXHRcdGlmKG9sZENvbXBvbmVudCAhPSB1bmRlZmluZWQpIG9sZENvbXBvbmVudC5lbGVtZW50LmNzcygnei1pbmRleCcsIDEpXG5cdH1cblx0c2V0dXBOZXdDb21wb25lbnQoaGFzaCwgVHlwZSwgdGVtcGxhdGUpIHtcblx0XHR2YXIgaWQgPSBVdGlscy5DYXBpdGFsaXplRmlyc3RMZXR0ZXIoaGFzaC5wYXJlbnQucmVwbGFjZShcIi9cIiwgXCJcIikpXG5cdFx0dGhpcy5vbGRQYWdlRGl2UmVmID0gdGhpcy5jdXJyZW50UGFnZURpdlJlZlxuXHRcdHRoaXMuY3VycmVudFBhZ2VEaXZSZWYgPSAodGhpcy5jdXJyZW50UGFnZURpdlJlZiA9PT0gJ3BhZ2UtYScpID8gJ3BhZ2UtYicgOiAncGFnZS1hJ1xuXHRcdHZhciBlbCA9IHRoaXMuZWxlbWVudC5maW5kKCcjJyt0aGlzLmN1cnJlbnRQYWdlRGl2UmVmKVxuXHRcdHZhciBwcm9wcyA9IHtcblx0XHRcdGlkOiB0aGlzLmN1cnJlbnRQYWdlRGl2UmVmLFxuXHRcdFx0aXNSZWFkeTogdGhpcy5vblBhZ2VSZWFkeSxcblx0XHRcdGhhc2g6IGhhc2gsXG5cdFx0XHRkaWRUcmFuc2l0aW9uSW5Db21wbGV0ZTogdGhpcy5kaWRQYWdlVHJhbnNpdGlvbkluQ29tcGxldGUsXG5cdFx0XHRkaWRUcmFuc2l0aW9uT3V0Q29tcGxldGU6IHRoaXMuZGlkUGFnZVRyYW5zaXRpb25PdXRDb21wbGV0ZSxcblx0XHRcdGRhdGE6IEFwcFN0b3JlLnBhZ2VDb250ZW50KClcblx0XHR9XG5cdFx0dmFyIHBhZ2UgPSBuZXcgVHlwZShwcm9wcylcblx0XHRwYWdlLnJlbmRlcihpZCwgZWwsIHRlbXBsYXRlLCBwcm9wcy5kYXRhKVxuXHRcdHRoaXMuY29tcG9uZW50c1snb2xkLWNvbXBvbmVudCddID0gdGhpcy5jb21wb25lbnRzWyduZXctY29tcG9uZW50J11cblx0XHR0aGlzLmNvbXBvbmVudHNbJ25ldy1jb21wb25lbnQnXSA9IHBhZ2Vcblx0XHRpZihQYWdlclN0b3JlLnBhZ2VUcmFuc2l0aW9uU3RhdGUgPT09IFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTl9QUk9HUkVTUykge1xuXHRcdFx0dGhpcy5jb21wb25lbnRzWydvbGQtY29tcG9uZW50J10uZm9yY2VVbm1vdW50KClcblx0XHR9XG5cdH1cblx0b25QYWdlUmVhZHkoaGFzaCkge1xuXHRcdFBhZ2VyQWN0aW9ucy5vblBhZ2VSZWFkeShoYXNoKVxuXHR9XG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHN1cGVyLmNvbXBvbmVudERpZE1vdW50KClcblx0fVxuXHR1bm1vdW50Q29tcG9uZW50KHJlZikge1xuXHRcdGlmKHRoaXMuY29tcG9uZW50c1tyZWZdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuY29tcG9uZW50c1tyZWZdLnJlbW92ZSgpXG5cdFx0fVxuXHR9XG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFBhZ2VyU3RvcmUub2ZmKFBhZ2VyQ29uc3RhbnRzLlBBR0VfVFJBTlNJVElPTl9JTiwgdGhpcy53aWxsUGFnZVRyYW5zaXRpb25Jbilcblx0XHRQYWdlclN0b3JlLm9mZihQYWdlckNvbnN0YW50cy5QQUdFX1RSQU5TSVRJT05fT1VULCB0aGlzLndpbGxQYWdlVHJhbnNpdGlvbk91dClcblx0XHR0aGlzLnVubW91bnRDb21wb25lbnQoJ29sZC1jb21wb25lbnQnKVxuXHRcdHRoaXMudW5tb3VudENvbXBvbmVudCgnbmV3LWNvbXBvbmVudCcpXG5cdFx0c3VwZXIuY29tcG9uZW50V2lsbFVubW91bnQoKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQYWdlclxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG5cdFwiY29udGVudFwiOiB7XG5cdFx0XCJ0d2l0dGVyX3VybFwiOiBcImh0dHBzOi8vdHdpdHRlci5jb20vY2FtcGVyXCIsXG5cdFx0XCJmYWNlYm9va191cmxcIjogXCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vQ2FtcGVyXCIsXG5cdFx0XCJpbnN0YWdyYW1fdXJsXCI6IFwiaHR0cHM6Ly9pbnN0YWdyYW0uY29tL2NhbXBlci9cIixcblx0XHRcImxhYl91cmxcIjogXCJodHRwOi8vd3d3LmNhbXBlci5jb20vbGFiXCIsXG5cdFx0XCJsYW5nXCI6IHtcblx0XHRcdFwiZW5cIjoge1xuXHRcdFx0XHRcImNhbXBlcl9sYWJcIjogXCJDYW1wZXIgTGFiXCIsXG5cdFx0XHRcdFwic2hvcF90aXRsZVwiOiBcIlNob3BcIixcblx0XHRcdFx0XCJzaG9wX21lblwiOiBcIk1lblwiLFxuXHRcdFx0XHRcInNob3Bfd29tZW5cIjogXCJXb21lblwiLFxuXHRcdFx0XHRcInBsYW5ldFwiOiBcIlBsYW5ldFwiLFxuXHRcdFx0XHRcImJ1eV90aXRsZVwiOiBcIkJ1eVwiLFxuXHRcdFx0XHRcImNhbXBhaWduX3RpdGxlXCI6IFwiRGlzY292ZXIgY2FtcGFpZ25cIixcblx0XHRcdFx0XCJleHBlcmllbmNlX3RpdGxlXCI6IFwiU2VlIGV4cGVyaWVuY2VcIixcblx0XHRcdFx0XCJsZWdhbFwiOiBcIkxlZ2FsXCIsXG5cdFx0XHRcdFwibWFwX3R4dFwiOiBcIk1BUFwiLFxuXHRcdFx0XHRcIm11dGVfdHh0XCI6IFwiTVVURVwiLFxuXHRcdFx0XHRcInBsYXlfdHh0XCI6IFwiUExBWVwiLFxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRcImxhbmdzXCI6IFtcImVuXCIsIFwiZnJcIiwgXCJlc1wiLCBcIml0XCIsIFwiZGVcIiwgXCJwdFwiXSxcblxuXHRcImhvbWUtdmlkZW9zXCI6IFtcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvODQwYTNmNjcyOWIxZjUyZjQ0NmFhZTZkYWVjOTM5YTNlY2E0YzBjMS9hcmVsbHVmLWNhcGFzLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yMmIzNjBjOGNhMzk5Njk2OTg1MzEzZGRlOTliYTgzZDRlYzk3MmI3L2FyZWxsdWYtZHViLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8yOTgwZjE0Y2M4YmQ5OTEyYjE0ZGNhNDZhNGNkNGE4NWZhMDQ3NzRjL2FyZWxsdWYta29iYXJhZi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvYTgxOWMzNzNmOTc3Nzg1MmYzOTY3Y2UwMjNiY2ZiMGQ5MTE1Mzg2Zi9hcmVsbHVmLXBhcmFkaXNlLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy8zZGNmZDcwYzcwNzI2OTJlYTNhNzM5YWVmNTM3NmIwMjZiMDRiNjc1L2FyZWxsdWYtcGVsb3Rhcy5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvMTNiYmI2MTE5NTE2NDg3M2Q4MjNhM2I5MWEyYzgyYWNjZWZiM2VkZC9kZWlhLWR1Yi5tcDRcIixcblx0XHRcImh0dHA6Ly9lbWJlZC53aXN0aWEuY29tL2RlbGl2ZXJpZXMvNGJiNmU0ODViNzE3YmY3ZGJkZDVjOTQxZmFmYTJiMTg4NGU5MDgzOC9kZWlhLW1hcnRhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy9lNDI0ODg5YWMwMjZmNzBlNTQ0YWYwMzAzNWU3MTg3ZjM0OTQxNzA1L2RlaWEtbWF0ZW8ubXA0XCIsXG5cdFx0XCJodHRwOi8vZW1iZWQud2lzdGlhLmNvbS9kZWxpdmVyaWVzLzIzNDQ0ZDNjODY5M2U1OWY4MDc5ZjgyN2RkMTgyYzVlMzM0MTM4NzcvZXMtdHJlbmMtYmVsdWdhLm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy82ZWFmYWU3ZjFiM2JjNDFkODU2OTczNTU3YTJmNTE1OThjODI0MWE2L2VzLXRyZW5jLWlzYW11Lm1wNFwiLFxuXHRcdFwiaHR0cDovL2VtYmVkLndpc3RpYS5jb20vZGVsaXZlcmllcy85Yjk0NzFkY2JlMWY5NGZmN2IzNTA4ODQxZjY4ZmYxNWJlMTkyZWU0L2VzLXRyZW5jLW1hcnRhLm1wNFwiXG5cdF0sXG5cblx0XCJkZWZhdWx0LXJvdXRlXCI6IFwiXCIsXG5cblx0XCJyb3V0aW5nXCI6IHtcblx0XHRcIi9cIjoge1xuXHRcdFx0XCJhc3NldHNcIjogW1xuXHRcdFx0XHRcImJhY2tncm91bmQuanBnXCJcblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0XCJhcmVsbHVmL2NhcGFzXCI6IHtcblx0XHR9LFxuXHRcdFwiYXJlbGx1Zi9kdWJcIjoge1xuICAgICAgICB9LFxuICAgICAgICBcImFyZWxsdWYva29iYXJhaFwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9tYXJ0YVwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9wYXJhZGlzZVwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXJlbGx1Zi9wZWxvdGFzXCI6IHtcbiAgICAgICAgfSxcblxuICAgICAgICBcImRlaWEvZHViXCI6IHtcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWlhL21hcnRhXCI6IHtcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWlhL21hdGVvXCI6IHtcbiAgICAgICAgfSxcblxuICAgICAgICBcImVzLXRyZW5jL2JlbHVnYVwiOiB7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXMtdHJlbmMvaXNhbXVcIjoge1xuICAgICAgICB9XG5cdH1cbn0iXX0=
